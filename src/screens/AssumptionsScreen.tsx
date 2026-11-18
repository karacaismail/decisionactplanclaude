import '@/styles/desen/k-card.css'
import '@/styles/desen/kapi-ortak.css'
import '@/styles/desen/stat-card.css'
import '@/styles/desen/kapi.css'
import '@/styles/desen/task-card.css'
import '@/styles/desen/temel-stats.css'
import '@/styles/desen/cikti-ortak.css'
import '@/styles/ekran/AssumptionsScreen.css'
import { useId, useState } from 'react'
import { Button, Card, Empty, Grid, Input, Select, Statistic, Segmented, Tag, App as AntApp } from 'antd'
import { Link, useNavigate } from 'react-router'
import { CheckCircle, HourglassMedium, PencilSimple, Star, XCircle } from '@phosphor-icons/react'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { stepPath } from '@/data/registry'
import { Callout } from '@/components/Callout'
import { PageHeader } from '@/components/PageHeader'
/** Adım 10'daki varsayım satırı. Boş durum "Denenmedi" sayılır. */
type Row = Record<string, unknown> & { _id: string }
type Status = 'denenmedi' | 'dogrulandi' | 'curudu'

const STEP = '10'
const COLUMNS: { value: Status; label: string; empty: string; note: string; Icon: typeof CheckCircle; tone: string }[] = [
  { value: 'denenmedi', label: 'Denenmedi', empty: 'Denenmemiş varsayım yok.', note: 'Bu varsayımları henüz denemediniz.', Icon: HourglassMedium, tone: '' },
  { value: 'dogrulandi', label: 'Doğrulandı', empty: 'Doğrulanan varsayım yok.', note: 'Deneme bu varsayımları doğruladı.', Icon: CheckCircle, tone: 'is-ok' },
  { value: 'curudu', label: 'Çürüdü', empty: 'Çürüyen varsayım yok.', note: 'Deneme bu varsayımları yanlış çıkardı.', Icon: XCircle, tone: 'is-harm' },
]
const STATUS_OPTIONS = COLUMNS.map((c) => ({ value: c.value, label: c.label }))
const AREA: Record<string, string> = { istek: 'İstek', yapilabilirlik: 'Yapılabilirlik', para: 'Para', hukuk: 'Hukuk' }

const text = (x: unknown): string => (typeof x === 'string' ? x.trim() : '')
const score = (x: unknown): number => Math.min(5, Math.max(0, Number(x) || 0))
const statusOf = (r: Row): Status => (r.status === 'dogrulandi' || r.status === 'curudu' ? r.status : 'denenmedi')
/** Adım 10 grafiğiyle aynı kural: etki 4 ya da 5, kanıt 1 ya da 2. */
const isRisky = (r: Row): boolean => statusOf(r) === 'denenmedi' && score(r.impact) >= 4 && score(r.evidence) >= 1 && score(r.evidence) <= 2

/** Sonuç notu. Yazarken yerelde durur; alandan çıkınca ya da Enter ile Adım 10'a yazılır. */
function ResultNote({ id, value, onCommit }: { id: string; value: string; onCommit: (v: string) => void }) {
  const [draft, setDraft] = useState(value)
  const commit = () => { if (draft.trim() !== value) onCommit(draft.trim()) }
  return <Input id={id} value={draft} maxLength={200} placeholder="Örneğin 30 kişiden 12'si kartı aldı." onChange={(e) => setDraft(e.target.value)} onBlur={commit} onPressEnter={commit} />
}

export function AssumptionsScreen() {
  const uid = useId()
  const nav = useNavigate()
  const bp = Grid.useBreakpoint()
  const narrow = bp.md === false
  const { message } = AntApp.useApp()
  const plan = useCurrentPlan()
  const setStepValues = usePlanStore((s) => s.setStepValues)
  const [tab, setTab] = useState<Status>('denenmedi')
  if (!plan) return null

  const all: Row[] = ((plan.steps[STEP]?.values?.assumptions as Record<string, unknown>[] | undefined) ?? []).map((r, i) => ({ ...r, _id: text(r._id) || `satir-${i}` }))
  const rows = all.filter((r) => text(r.assumption))
  const of = (s: Status) => rows.filter((r) => statusOf(r) === s)
  const refuted = of('curudu').length
  const risky = rows.filter(isRisky).sort((a, b) => score(b.impact) - score(a.impact) || score(a.evidence) - score(b.evidence))

  /** Tek satırı değiştirir ve bütün listeyi Adım 10'a yazar. Diğer satırlar aynen kalır. */
  const patchRow = (rowId: string, patch: Record<string, unknown>) => {
    setStepValues(STEP, { assumptions: all.map((r) => (r._id === rowId ? { ...r, ...patch } : r)) })
  }
  const changeStatus = (r: Row, next: Status) => {
    if (next === statusOf(r)) return
    patchRow(r._id, { status: next })
    setTab(next)
    message.success(`Varsayım “${COLUMNS.find((c) => c.value === next)?.label}” ${narrow ? 'grubuna' : 'sütununa'} taşındı.`)
  }

  const scoreLine = (label: string, value: unknown) => {
    const n = score(value)
    return (
      <>
        <dt>{label}</dt>
        <dd>
          {n > 0 ? (
            <>
              {/* Puan yalnız gösterilir. Seçilebilir yıldız denetimi kullanılmaz. */}
              <span className="assumption-stars" aria-hidden>
                {Array.from({ length: 5 }, (_, i) => <Star key={i} className="mt-icon-inline" weight={i < n ? 'fill' : 'regular'} />)}
              </span>
              <span>{n} / 5</span>
            </>
          ) : 'Puan verilmedi'}
        </dd>
      </>
    )
  }

  const card = (r: Row) => {
    const statusId = `${uid}-durum-${r._id}`
    const noteId = `${uid}-not-${r._id}`
    return (
      <Card key={r._id} className="task-card assumption-card" variant="borderless" size="small">
        <div className="assumption-tags">
          <Tag>{AREA[text(r.area)] ?? 'Başlık yok'}</Tag>
          {isRisky(r) ? <Tag color="warning">Önce bunu deneyin</Tag> : null}
        </div>
        <p className="assumption-text">{text(r.assumption)}</p>
        <dl className="assumption-scores">
          {scoreLine('Etki', r.impact)}
          {scoreLine('Kanıt', r.evidence)}
        </dl>
        <dl className="assumption-facts">
          <div>
            <dt>Test yöntemi</dt>
            <dd>{text(r.testMethod) || 'Yazılmadı.'}</dd>
          </div>
          <div>
            <dt>Şu olursa yanlış sayarım</dt>
            <dd>{text(r.falsifyThreshold) || 'Yazılmadı.'}</dd>
          </div>
        </dl>
        <div className="assumption-form">
          <div className="assumption-field">
            <label htmlFor={statusId}>Durum</label>
            <Select id={statusId} value={statusOf(r)} options={STATUS_OPTIONS} onChange={(v: Status) => changeStatus(r, v)} />
          </div>
          <div className="assumption-field">
            <label htmlFor={noteId}>Sonuç ne oldu?</label>
            <ResultNote id={noteId} value={text(r.resultNote)} onCommit={(v) => patchRow(r._id, { resultNote: v })} />
          </div>
        </div>
      </Card>
    )
  }

  const list = (s: Status) => {
    const items = of(s)
    const col = COLUMNS.find((c) => c.value === s) ?? COLUMNS[0]
    return items.length === 0 ? <span className="kanban-empty">{col.empty}</span> : <div className="assumption-list">{items.map(card)}</div>
  }

  /* Aynı alanlar korunur. Dar ekranda seçilen durum grubu gösterilir. */
  const board = (
    <>
      <Segmented<Status>
        className="assumption-filter"
        aria-label="Varsayımları duruma göre göster"
        tabIndex={-1}
        onKeyDownCapture={(event) => {
          const offset = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 0
          if (!offset) return
          // Seçimi Segmented yapar. Yerel radio hareketi WebKit odağını gizlemesin.
          event.preventDefault()
          const radios = [...event.currentTarget.querySelectorAll<HTMLInputElement>('input[type="radio"]')]
          const index = radios.indexOf(event.target as HTMLInputElement)
          if (index >= 0) radios[(index + offset + radios.length) % radios.length]?.focus()
        }}
        value={tab}
        onChange={setTab}
        options={COLUMNS.map((c) => ({ value: c.value, label: c.label }))}
      />
      <div className="kanban assumption-board" role="group" aria-label="Varsayım panosu">
        {COLUMNS.map((c) => (
          <section key={c.value} className="kanban-col" hidden={narrow && tab !== c.value} onFocusCapture={() => setTab(c.value)} aria-labelledby={`${uid}-sutun-${c.value}`}>
            <div className="kanban-head">
              <h2 id={`${uid}-sutun-${c.value}`} className="kanban-title">
                <c.Icon className={`stat-ico ${c.tone}`.trim()} size={18} weight="fill" aria-hidden />
                {c.label}
              </h2>
              <span className="kanban-count">{of(c.value).length} varsayım</span>
            </div>
            {list(c.value)}
          </section>
        ))}
      </div>
    </>
  )

  return (
    <div className="page page-assumptions">
      <PageHeader
        newPath="/varsayimlar"
        kicker="Varsayım panosu"
        title="Varsayımlar"
        description="Varsayım, doğru kabul ettiğiniz ama henüz denemediğiniz sözdür."
        actions={rows.length > 0 ? <Button icon={<PencilSimple size={16} />} onClick={() => nav(stepPath(STEP))}>Adım 10'u aç</Button> : undefined}
      />

      {rows.length === 0 ? (
        <Card className="k-card assumption-empty" variant="borderless">
          <Empty description="Henüz varsayım yok. Varsayımlarınızı Adım 10'da yazın.">
            <Link to={stepPath(STEP)}>Adım 10'u aç</Link>
          </Empty>
        </Card>
      ) : (
        <>
          {refuted > 0 || risky.length > 0 ? (
            <div className="assumption-alerts">
              {refuted > 0 ? <Callout tone="uyari" danger title="Çürüyen varsayım">Çürüyen varsayım var. Hazırlık kontrolünde bunu not edin.</Callout> : null}
              {risky.length > 0 ? (
                <Callout tone="uyari" title="En riskli varsayım">
                  “{text(risky[0].assumption)}” Bu varsayımın etkisi yüksek, kanıtı düşük. Önce bu varsayımı deneyin.
                  {risky.length > 1 ? ` ${risky.length - 1} varsayım daha aynı durumda.` : ''}
                </Callout>
              ) : null}
            </div>
          ) : null}

          <div className="temel-stats" role="group" aria-label="Varsayım özeti">
            {COLUMNS.map((c) => (
              <Card key={c.value} className="k-card stat-card" variant="borderless">
                <Statistic title={c.label} value={of(c.value).length} prefix={<c.Icon className={`stat-ico ${c.tone}`.trim()} size={22} weight="fill" aria-hidden />} />
                <span className="stat-note">{c.note}</span>
              </Card>
            ))}
          </div>

          {board}

          <p className="helper">Durumu ya da sonucu değiştirince Adım 10 güncellenir. Karar 3 ve sonraki kontrollerin kararı yeniden inceleme ister.</p>
        </>
      )}
    </div>
  )
}
