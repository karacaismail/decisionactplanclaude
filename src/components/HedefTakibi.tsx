import '@/styles/bilesen/HedefTakibi.css'
import { useId, useMemo, useState } from 'react'
import { Button, Card, Input, Radio, Tag, App as AntApp } from 'antd'
import { Warning } from '@phosphor-icons/react'
import type { OkrConfidence, OkrIndicator, OkrObjective, OkrPeriod, PlanDoc } from '@/data/types'
import { usePlanStore } from '@/store/planStore'
import { formatDate } from '@/engine/format'
import { movesOf } from '@/engine/strategy'
import {
  addIndicator,
  addObjective,
  canAddIndicator,
  canAddObjective,
  closePeriod,
  CONFIDENCE_LABEL,
  CONFIDENCES,
  createPeriod,
  indicatorOverdue,
  indicatorScore,
  KIND_HELP,
  KIND_LABEL,
  KINDS,
  latestCheckIn,
  linkableTasks,
  objectiveScore,
  objectiveSummary,
  OKR_MAX_INDICATORS,
  OKR_MAX_OBJECTIVES,
  OKR_OVERDUE,
  OKR_TASK_LIKE,
  OKR_TOO_MANY,
  okrOf,
  openPeriod,
  parseNumber,
  periodSummary,
  recordCheckIn,
  scoreText,
  taskLike,
  tooManyIndicators,
} from '@/engine/okr'
import { Callout } from './Callout'

/**
 * Hedef takibi paneli. Anahtar açıkken ayrı yüklenir. Anahtar kapalıyken kodu ve CSS dosyası inmez.
 * Kurallar docs/okr-arastirma-raporu.md dosyasındadır.
 * Yazılım karar vermez. Puan yalnız "Seçim hâlâ doğru mu?" sorusunu sordurur.
 * Ekranda dolu düğme yoktur. Sayfanın tek dolu düğmesi başlıktadır.
 */

const day = (text: string) => formatDate(`${text}T00:00:00`, false)
const nameOf = (g: OkrIndicator) => g.name.trim() || 'Adsız gösterge'

interface WeekDraft {
  text: string
  confidence?: OkrConfidence
  note: string
}

/** Sayı alanı. Yazılan metin korunur. Sayı değilse kayıtta boş sayılır. */
function NumberField({ id, label, aria, value, onChange }: { id: string; label: string; aria?: string; value: number | null; onChange: (n: number | null) => void }) {
  const [text, setText] = useState(value === null ? '' : String(value).replace('.', ','))
  const invalid = text.trim() !== '' && parseNumber(text) === null
  return (
    <div className="okr-field">
      <label className="okr-label" htmlFor={id}>{label}</label>
      <Input
        id={id}
        aria-label={aria}
        inputMode="decimal"
        value={text}
        placeholder="Bilinmiyor"
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-hata` : undefined}
        onChange={(e) => {
          setText(e.target.value)
          onChange(parseNumber(e.target.value))
        }}
      />
      {invalid ? <span id={`${id}-hata`} className="okr-help">Bir sayı yazın. Örneğin 30 ya da 2,5.</span> : null}
    </div>
  )
}

export function HedefTakibi({ plan, onUseSummary }: { plan: PlanDoc; onUseSummary: (text: string) => void }) {
  const base = useId()
  const { message } = AntApp.useApp()
  const updateOkr = usePlanStore((s) => s.updateOkr)
  const okr = useMemo(() => okrOf(plan), [plan])
  const period = openPeriod(okr)
  const last = okr?.periods[okr.periods.length - 1]
  const shown = period ?? last
  const past = (okr?.periods ?? []).filter((p) => p !== shown && p.closedAt)
  const [drafts, setDrafts] = useState<Record<string, WeekDraft>>({})
  const [weekErrors, setWeekErrors] = useState<string[]>([])
  const [closing, setClosing] = useState(false)
  const [learned, setLearned] = useState('')
  const [closeErrors, setCloseErrors] = useState<string[]>([])

  const edit = (fn: (p: OkrPeriod) => void) =>
    updateOkr((state) => {
      const p = openPeriod(state)
      if (!p) return false
      fn(p)
    })
  const editObjective = (id: string, fn: (o: OkrObjective) => void) => edit((p) => { const o = p.objectives.find((x) => x.id === id); if (o) fn(o) })
  const editIndicator = (oid: string, gid: string, fn: (g: OkrIndicator) => void) => editObjective(oid, (o) => { const g = o.indicators.find((x) => x.id === gid); if (g) fn(g) })
  const unlink = (p: OkrPeriod, ids: string[]) => {
    if (!p.taskLinks) return
    for (const [k, v] of Object.entries(p.taskLinks)) if (ids.includes(v)) delete p.taskLinks[k]
  }

  const indicators = period?.objectives.flatMap((o) => o.indicators) ?? []
  const used = new Set(period?.objectives.map((o) => o.sourceMove).filter(Boolean))
  const moves = movesOf(plan).map((m) => m.move).filter((m) => !used.has(m))
  const tasks = linkableTasks(plan)

  const saveWeek = () => {
    if (!period) return
    const now = new Date()
    const entries = indicators.filter((g) => { const d = drafts[g.id]; return d && (d.text.trim() || d.confidence || d.note.trim()) })
    const errors = entries.length ? entries.flatMap((g) => recordCheckIn(structuredClone(g), { value: parseNumber(drafts[g.id].text), confidence: drafts[g.id].confidence, note: drafts[g.id].note }, now)) : ['En az bir göstergenin bugünkü sayısını yazın.']
    setWeekErrors(errors)
    if (errors.length) return
    edit((p) => {
      for (const g of p.objectives.flatMap((o) => o.indicators)) {
        const d = drafts[g.id]
        if (entries.some((e) => e.id === g.id)) recordCheckIn(g, { value: parseNumber(d.text), confidence: d.confidence, note: d.note }, now)
      }
    })
    setDrafts({})
    message.success('Haftalık durum kaydedildi.')
  }

  const close = () => {
    if (!period) return
    const errors = closePeriod(structuredClone(period), learned)
    setCloseErrors(errors)
    if (errors.length) return
    edit((p) => void closePeriod(p, learned))
    setClosing(false)
    setLearned('')
    message.success('Dönem kapatıldı.')
  }

  const startNew = () =>
    updateOkr((state) => {
      if (openPeriod(state)) return false
      state.periods.push(createPeriod())
    })

  return (
    <Card className="okr-panel-card" role="region" aria-label="Hedef takibi kayıtları" title={<h2 className="card-heading">Hedefler ve göstergeler</h2>}>
      <div className="okr-panel">
        {shown ? (
          <section className="okr-section" aria-labelledby={`${base}-donem`}>
            <h3 id={`${base}-donem`} className="okr-title">{period ? 'Bu dönem' : 'Son dönem'}</h3>
            <p className="okr-text">{day(shown.startsAt)} ile {day(shown.endsAt)} arası. Dönem 3 aydır.</p>
            <p className="okr-help">Puan karar vermez. Karar sahibi "Seçim hâlâ doğru mu?" sorusunu 3.5 alt aşamasında cevaplar.</p>
          </section>
        ) : null}

        {period && moves.length && canAddObjective(period) ? (
          <section className="okr-section" aria-label="Hamleden hedef önerisi">
            <Callout tone="ipucu" title="Öneri">
              <p className="okr-text">Ana hamleler 2.5 adımından gelir. Düğmeye basarsanız hamlenin adı hedef alanına yazılır. Sonra hedefi kendi sözlerinizle düzeltin.</p>
              <ul className="okr-list">
                {moves.map((m) => (
                  <li key={m} className="okr-suggestion">
                    <span className="okr-text">{m}</span>
                    <Button aria-label={`Bu hamleden hedef yaz: ${m}`} onClick={() => edit((p) => void addObjective(p, m, m))}>Bu hamleden hedef yaz</Button>
                  </li>
                ))}
              </ul>
            </Callout>
          </section>
        ) : null}

        {period ? (
          <section className="okr-section" aria-labelledby={`${base}-hedefler`}>
            <h3 id={`${base}-hedefler`} className="okr-title">Hedefler</h3>
            <p className="okr-help">Bir dönemde en çok {OKR_MAX_OBJECTIVES} hedef yazabilirsiniz. Hedefler maaşa bağlanmaz.</p>
            {period.objectives.length === 0 ? <p className="okr-text">Henüz hedef yazılmadı.</p> : null}
            {period.objectives.map((o, i) => (
              <Objective key={o.id} o={o} n={i + 1} period={period} idBase={`${base}-h${i}`} editObjective={editObjective} editIndicator={editIndicator}
                remove={() => edit((p) => { unlink(p, o.indicators.map((g) => g.id)); p.objectives = p.objectives.filter((x) => x.id !== o.id) })}
                removeIndicator={(gid) => edit((p) => { unlink(p, [gid]); const t = p.objectives.find((x) => x.id === o.id); if (t) t.indicators = t.indicators.filter((g) => g.id !== gid) })}
              />
            ))}
            <div className="okr-actions">
              <Button disabled={!canAddObjective(period)} onClick={() => edit((p) => void addObjective(p))}>Hedef ekle</Button>
            </div>
          </section>
        ) : null}

        {period && indicators.length ? (
          <section className="okr-section" aria-labelledby={`${base}-hafta`}>
            <h3 id={`${base}-hafta`} className="okr-title">Haftalık durum</h3>
            <p className="okr-help">Her hafta her göstergenin bugünkü sayısını yazın. Yazmak istemediğiniz göstergeyi boş bırakın.</p>
            {indicators.map((g, i) => {
              const d = drafts[g.id] ?? { text: '', note: '' }
              const set = (patch: Partial<WeekDraft>) => setDrafts((all) => ({ ...all, [g.id]: { ...d, ...patch } }))
              const id = `${base}-w${i}`
              return (
                <div key={g.id} role="group" aria-label={`Haftalık durum: ${nameOf(g)}`} className="okr-week">
                  <h4 className="okr-subtitle">{nameOf(g)}</h4>
                  <div className="okr-field">
                    <label className="okr-label" htmlFor={`${id}-sayi`}>Bugünkü sayı</label>
                    <Input id={`${id}-sayi`} inputMode="decimal" value={d.text} onChange={(e) => set({ text: e.target.value })} />
                  </div>
                  <div className="okr-field okr-radio">
                    <span id={`${id}-tahmin`} className="okr-label">Dönem sonunda bu sayıya ulaşır mısınız?</span>
                    <Radio.Group aria-labelledby={`${id}-tahmin`} value={d.confidence} onChange={(e) => set({ confidence: e.target.value as OkrConfidence })} options={CONFIDENCES.map((value) => ({ value, label: CONFIDENCE_LABEL[value] }))} />
                  </div>
                  <div className="okr-field">
                    <label className="okr-label" htmlFor={`${id}-not`}>Engel ne? İsteğe bağlı.</label>
                    <Input.TextArea id={`${id}-not`} rows={2} value={d.note} onChange={(e) => set({ note: e.target.value })} />
                  </div>
                </div>
              )
            })}
            {weekErrors.length ? (
              <Callout tone="uyari" title="Durum kaydedilmedi">
                <ul className="okr-errors">{weekErrors.map((e) => <li key={e}>{e}</li>)}</ul>
              </Callout>
            ) : null}
            <div className="okr-actions">
              <Button onClick={saveWeek}>Haftalık durumu kaydet</Button>
            </div>
          </section>
        ) : null}

        {period && indicators.length && tasks.length ? (
          <section className="okr-section" aria-labelledby={`${base}-isler`}>
            <h3 id={`${base}-isler`} className="okr-title">İşler ve göstergeler</h3>
            <p className="okr-help">İşler 3.2 adımının "Şimdi" kutusundan gelir. Her iş için şunu sorun: Hangi göstergeye hizmet ediyor?</p>
            {tasks.map((t, i) => (
              <div key={t.key} role="group" aria-labelledby={`${base}-is${i}`} className="okr-field okr-radio">
                <span id={`${base}-is${i}`} className="okr-label">İş: {t.action}</span>
                <Radio.Group
                  aria-labelledby={`${base}-is${i}`}
                  value={period.taskLinks?.[t.key] ?? ''}
                  onChange={(e) => edit((p) => {
                    const links = { ...(p.taskLinks ?? {}) }
                    if (e.target.value) links[t.key] = String(e.target.value)
                    else delete links[t.key]
                    p.taskLinks = links
                  })}
                  options={[...indicators.map((g) => ({ value: g.id, label: nameOf(g) })), { value: '', label: 'Hiçbir göstergeye' }]}
                />
              </div>
            ))}
          </section>
        ) : null}

        {period ? (
          <section className="okr-section" aria-labelledby={`${base}-son`}>
            <h3 id={`${base}-son`} className="okr-title">Dönem sonu</h3>
            {closing ? (
              <div role="group" aria-label="Dönem sonu" className="okr-close">
                <h4 className="okr-subtitle">Sonuç</h4>
                {period.objectives.length ? (
                  <ul className="okr-list okr-results">{period.objectives.map((o) => <li key={o.id} className="okr-text">{objectiveSummary(o)}</li>)}</ul>
                ) : <p className="okr-text">Bu dönemde hedef yazılmadı.</p>}
                <div className="okr-field">
                  <label className="okr-label" htmlFor={`${base}-ogrenilen`}>Bu dönemde ne öğrendiniz?</label>
                  <Input.TextArea id={`${base}-ogrenilen`} rows={3} value={learned} aria-invalid={closeErrors.length > 0} onChange={(e) => setLearned(e.target.value)} placeholder="Örneğin: Kart satışı yağmurlu günlerde düşüyor." />
                </div>
                {closeErrors.length ? <Callout tone="uyari" title="Dönem kapanmadı"><ul className="okr-errors">{closeErrors.map((e) => <li key={e}>{e}</li>)}</ul></Callout> : null}
                <div className="okr-actions">
                  <Button onClick={close}>Kapat ve kaydet</Button>
                  <Button type="text" onClick={() => { setClosing(false); setCloseErrors([]) }}>Vazgeç</Button>
                </div>
              </div>
            ) : (
              <>
                <p className="okr-text">Dönem bitince sonucu görün ve ne öğrendiğinizi yazın.</p>
                <div className="okr-actions"><Button onClick={() => setClosing(true)}>Dönemi kapat</Button></div>
              </>
            )}
          </section>
        ) : null}

        {!period ? (
          <section className="okr-section" aria-label="Kapanan dönem">
            {last?.closedAt ? (
              <>
                <p className="okr-text okr-strong">Dönem kapandı.</p>
                {last.objectives.length ? <ul className="okr-list okr-results">{last.objectives.map((o) => <li key={o.id} className="okr-text">{objectiveSummary(o)}</li>)}</ul> : null}
                {last.learned ? <p className="okr-text">Öğrenilen: {last.learned}</p> : null}
                <p className="okr-text">Şimdi stratejiyi sınayın. Karar sahibi "Seçim hâlâ doğru mu?" sorusunu cevaplar. Yazılım bu kararı vermez.</p>
              </>
            ) : <p className="okr-text">Açık dönem yok.</p>}
            <div className="okr-actions">
              {last?.closedAt && last.objectives.length ? <Button onClick={() => onUseSummary(periodSummary(last))}>Puan özetini dayanak alanına yaz</Button> : null}
              <Button onClick={startNew}>Yeni dönem başlat</Button>
            </div>
          </section>
        ) : null}

        {past.length ? (
          <section className="okr-section" aria-labelledby={`${base}-gecmis`}>
            <h3 id={`${base}-gecmis`} className="okr-title">Geçmiş dönemler</h3>
            <ul className="okr-list">
              {past.map((p) => (
                <li key={p.id} className="okr-past">
                  <span className="okr-text okr-strong">{day(p.startsAt)} ile {day(p.endsAt)} arası</span>
                  {p.objectives.length ? <span className="okr-text">{periodSummary(p)}</span> : null}
                  {p.learned ? <span className="okr-text">Öğrenilen: {p.learned}</span> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </Card>
  )
}

interface ObjectiveProps {
  o: OkrObjective
  n: number
  period: OkrPeriod
  idBase: string
  editObjective: (id: string, fn: (o: OkrObjective) => void) => void
  editIndicator: (oid: string, gid: string, fn: (g: OkrIndicator) => void) => void
  remove: () => void
  removeIndicator: (gid: string) => void
}

function Objective({ o, n, period, idBase, editObjective, editIndicator, remove, removeIndicator }: ObjectiveProps) {
  return (
    <div className="okr-objective">
      <div className="okr-field">
        <label id={`${idBase}-ad`} className="okr-label okr-label-lg" htmlFor={`${idBase}-baslik`}>Hedef {n}</label>
        <Input id={`${idBase}-baslik`} maxLength={160} value={o.title} placeholder="Örneğin: Aylık kartla düzenli müşteri kazanmak." onChange={(e) => editObjective(o.id, (x) => { x.title = e.target.value })} />
      </div>
      <div className="okr-field okr-radio">
        <span id={`${idBase}-tur`} className="okr-label">Hedef türü</span>
        <Radio.Group aria-labelledby={`${idBase}-tur`} value={o.kind} onChange={(e) => editObjective(o.id, (x) => { x.kind = e.target.value })} options={KINDS.map((value) => ({ value, label: `${KIND_LABEL[value]}. ${KIND_HELP[value]}` }))} />
      </div>
      <div className="okr-field">
        <label className="okr-label" htmlFor={`${idBase}-sorumlu`}>Hedefin sorumlusu</label>
        <Input id={`${idBase}-sorumlu`} maxLength={120} value={o.owner ?? ''} onChange={(e) => editObjective(o.id, (x) => { x.owner = e.target.value })} />
      </div>
      <p className="okr-text okr-strong">Hedefin puanı: {scoreText(objectiveScore(o), o.kind)}</p>

      <h4 className="okr-subtitle">Göstergeler</h4>
      <p className="okr-help">Gösterge bir işi değil, bir sonucu ölçer. Her gösterge bir sayıdır. Bilmediğiniz sayıyı boş bırakın.</p>
      {o.indicators.length === 0 ? <p className="okr-text">Henüz gösterge yazılmadı.</p> : null}
      <ol className="okr-list okr-indicators">
        {o.indicators.map((g, j) => {
          const id = `${idBase}-g${j}`
          const last = latestCheckIn(g)
          const label = `Gösterge ${j + 1}`
          return (
            <li key={g.id} className="okr-indicator">
              <div className="okr-field">
                <label className="okr-label" htmlFor={`${id}-ad`}>{label}</label>
                <Input id={`${id}-ad`} maxLength={160} value={g.name} placeholder="Örneğin: Ödeyen müşteri sayısı" onChange={(e) => editIndicator(o.id, g.id, (x) => { x.name = e.target.value })} />
              </div>
              {taskLike(g) ? <p className="okr-warn"><Warning className="mt-icon-inline" aria-hidden />{OKR_TASK_LIKE}</p> : null}
              <div className="okr-fields">
                <NumberField id={`${id}-baslangic`} label="Başlangıç değeri" aria={`${label} başlangıç değeri`} value={g.baseline} onChange={(v) => editIndicator(o.id, g.id, (x) => { x.baseline = v })} />
                <NumberField id={`${id}-hedef`} label="Varılacak sayı" aria={`${label} varılacak sayı`} value={g.target} onChange={(v) => editIndicator(o.id, g.id, (x) => { x.target = v })} />
                <div className="okr-field">
                  <label className="okr-label" htmlFor={`${id}-birim`}>Birim</label>
                  <Input id={`${id}-birim`} maxLength={40} value={g.unit ?? ''} placeholder="Örneğin: kişi" onChange={(e) => editIndicator(o.id, g.id, (x) => { x.unit = e.target.value })} />
                </div>
                <div className="okr-field">
                  <label className="okr-label" htmlFor={`${id}-sorumlu`}>Sorumlu</label>
                  <Input id={`${id}-sorumlu`} maxLength={120} value={g.owner ?? ''} onChange={(e) => editIndicator(o.id, g.id, (x) => { x.owner = e.target.value })} />
                </div>
              </div>
              <p className="okr-text">{scoreText(indicatorScore(g))}</p>
              {last ? <p className="okr-help">Son yazılan sayı: {String(last.value).replace('.', ',')}{g.unit ? ` ${g.unit}` : ''}. Tahmin: {CONFIDENCE_LABEL[last.confidence]}. {formatDate(last.at, false)}.{last.note ? ` Engel: ${last.note}` : ''}</p> : null}
              {indicatorOverdue(g, period) ? <span><Tag>{OKR_OVERDUE}</Tag></span> : null}
              <div className="okr-actions">
                <Button aria-label={`${label} sil`} onClick={() => removeIndicator(g.id)}>Sil</Button>
              </div>
            </li>
          )
        })}
      </ol>
      {tooManyIndicators(o) ? <p className="okr-warn"><Warning className="mt-icon-inline" aria-hidden />{OKR_TOO_MANY}</p> : null}
      <div className="okr-actions">
        <Button disabled={!canAddIndicator(o)} onClick={() => editObjective(o.id, (x) => void addIndicator(x))}>Gösterge ekle</Button>
        <Button onClick={remove}>Hedefi sil</Button>
      </div>
      {!canAddIndicator(o) ? <p className="okr-help">Bir hedefe en çok {OKR_MAX_INDICATORS} gösterge yazabilirsiniz.</p> : null}
    </div>
  )
}
