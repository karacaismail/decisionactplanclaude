import '@/styles/desen/pano.css'
import '@/styles/desen/pano-ortak.css'
import '@/styles/desen/k-card.css'
import '@/styles/desen/kapi-ortak.css'
import '@/styles/desen/kapi.css'
import '@/styles/ekran/HistoryScreen.css'
import { useId, useState } from 'react'
import { Avatar, Card, Empty, Radio, Statistic, Tag, Timeline } from 'antd'
import { DoorOpen, Flag, PencilSimpleLine } from '@phosphor-icons/react'
import { useCurrentPlan } from '@/store/planStore'
import { DecisionBadge } from '@/components/DecisionBadge'
import { PageHeader } from '@/components/PageHeader'
import { formatDate, formatMoney } from '@/engine/format'
import { OUTCOME_LABEL, TRANSITION_LABEL, type ChangeRecord, type Decision, type TransitionOutcome, type TransitionRecord } from '@/data/types'
import { DECISIONS } from '@/data/decisions'
type Filter = 'hepsi' | 'kararlar' | 'gecis' | 'degisiklikler'
type Entry = { kind: 'karar'; at: string; d: Decision } | { kind: 'gecis'; at: string; t: TransitionRecord } | { kind: 'degisiklik'; at: string; c: ChangeRecord }

const FILTER_KIND: Record<Exclude<Filter, 'hepsi'>, Entry['kind']> = { kararlar: 'karar', gecis: 'gecis', degisiklikler: 'degisiklik' }
const EMPTY_TEXT: Record<Filter, string> = {
  hepsi: 'Henüz kayıt yok. İlk kontrolde kararı kaydedince burada görünür.',
  kararlar: 'Henüz kayıt yok. İlk kontrolde kararı kaydedince burada görünür.',
  gecis: 'Hazırlık kararı yok. Hazırlık kontrolünde kararı kaydedince burada görünür.',
  degisiklikler: 'Sınır değişikliği yok. Harcama sınırı, bitiş tarihi veya deneme hakkı değişince kayıt buraya düşer.',
}
const TRANSITION_TAG: Record<TransitionOutcome, string | undefined> = { hazir: 'success', kosullu: 'warning', degil: undefined }

function changeValue(key: string, v: unknown): string {
  if (v === null || v === undefined || v === '') return 'Boş'
  if (key.endsWith('Kurus')) return formatMoney(Number(v))
  if (key === 'deadline') return formatDate(String(v), false)
  if (Array.isArray(v)) return `${v.length} kural`
  if (typeof v === 'boolean') return v ? 'Evet' : 'Hayır'
  return String(v)
}

const initial = (name?: string) => (name?.trim() ? name.trim().charAt(0).toLocaleUpperCase('tr-TR') : '?')
const transitionDot = (t: TransitionRecord) => (t.stale ? 'is-hold' : t.outcome === 'degil' ? '' : 'is-ok')
const dotClass = (d: Decision) => (d.chosen === 'ilerle' || d.chosen === 'kosulluIlerle' ? 'is-ok' : d.chosen === 'durdur' ? 'is-harm' : d.chosen === 'beklet' || d.stale ? 'is-hold' : '')

export function HistoryScreen() {
  const plan = useCurrentPlan()
  const [filter, setFilter] = useState<Filter>('hepsi')
  const historyId = useId()
  if (!plan) return null
  const decisions = plan.decisions
  const changes = plan.changes ?? []
  const transitions = plan.transitions ?? []
  const entries: Entry[] = [
    ...decisions.map((d): Entry => ({ kind: 'karar', at: d.decidedAt, d })),
    ...transitions.map((t): Entry => ({ kind: 'gecis', at: t.decidedAt, t })),
    ...changes.map((c): Entry => ({ kind: 'degisiklik', at: c.at, c })),
  ]
    .filter((e) => filter === 'hepsi' || e.kind === FILTER_KIND[filter])
    .sort((a, b) => b.at.localeCompare(a.at))
  const lastAt = [...decisions.map((d) => d.decidedAt), ...transitions.map((t) => t.decidedAt), ...changes.map((c) => c.at)].sort().at(-1)

  const decisionItem = (d: Decision) => {
    const def = DECISIONS[d.gate - 1]
    return (
      <article className="tl-item history-entry" aria-labelledby={`${historyId}-decision-${d.id}`}>
        <div className="tl-head">
          <h3 className="tl-title" id={`${historyId}-decision-${d.id}`}>Kontrol {d.gate}</h3>
          {def ? <span className="helper">{def.title}</span> : null}
          <DecisionBadge outcome={d.chosen} />
          {d.stale ? <Tag color="warning">İnceleme bekliyor</Tag> : null}
        </div>
        <span className="tl-date"><time dateTime={d.decidedAt}>{formatDate(d.decidedAt)}</time>. Sürüm {d.revision}.</span>
        <p className="tl-reason">{d.reason}</p>
        <div className="tl-meta">
          <Avatar size={28} aria-hidden>{initial(d.decidedBy)}</Avatar>
          <span>Karar sahibi: {d.decidedBy || 'Yazılmadı'}</span>
        </div>
        <div className="tl-notes">
          {d.chosen !== d.suggested ? <span>Sistemin önerisi: {OUTCOME_LABEL[d.suggested]}</span> : null}
          {d.stale ? <span>Dayandığı veri sonradan değişti. Kontrolü yeniden inceleyin.</span> : null}
          {d.counterView ? <span>Karşı görüş: {d.counterView}</span> : null}
          {d.secondOpinion ? <span>İkinci görüş: {d.secondOpinion}</span> : null}
          {d.conditional ? <span>Koşullu iş: {d.conditional.scope}. Bitiş {formatDate(d.conditional.deadline, false)}.</span> : null}
          {d.reopenWhen ? <span>Yeniden açılır: {d.reopenWhen}</span> : null}
        </div>
      </article>
    )
  }
  const transitionItem = (t: TransitionRecord) => (
    <article className="tl-item history-entry" aria-labelledby={`${historyId}-transition-${t.id}`}>
      <div className="tl-head">
        <h3 className="tl-title" id={`${historyId}-transition-${t.id}`}>Hazırlık kontrolü</h3>
        <Tag color={TRANSITION_TAG[t.outcome]}>{TRANSITION_LABEL[t.outcome]}</Tag>
        {t.stale ? <Tag color="warning">İnceleme bekliyor</Tag> : null}
      </div>
      <span className="tl-date"><time dateTime={t.decidedAt}>{formatDate(t.decidedAt)}</time>. Sürüm {t.revision}.</span>
      <p className="tl-reason">{t.reason}</p>
      <div className="tl-meta">
        <Avatar size={28} aria-hidden>{initial(t.decidedBy)}</Avatar>
        <span>Karar sahibi: {t.decidedBy || 'Yazılmadı'}</span>
      </div>
      <div className="tl-notes">
        <span className="tabular">{t.mandatoryTotal} zorunlu ölçütün {t.mandatoryMet} tanesi karşılandı.</span>
        <span className="tabular">{t.supportingTotal} destekleyici ölçütün {t.supportingMet} tanesi karşılandı.</span>
        {t.outcome !== t.suggested ? <span>Sistemin önerisi: {TRANSITION_LABEL[t.suggested]}</span> : null}
        {t.secondOpinion ? <span>İkinci görüş: {t.secondOpinion}</span> : null}
        {t.conditional ? <span>Planlanacak konu: {t.conditional.topic}</span> : null}
        {t.conditional ? <span>Açık soru: {t.conditional.openQuestion}</span> : null}
        {t.conditional ? <span>Sorumlu: {t.conditional.owner}. Son tarih {formatDate(t.conditional.deadline, false)}.</span> : null}
        {t.stale ? <span>Temel verisi sonradan değişti. Hazırlık kontrolünü yeniden inceleyin.</span> : null}
      </div>
    </article>
  )
  const changeItem = (c: ChangeRecord) => (
    <article className="tl-item history-entry" aria-labelledby={`${historyId}-change-${c.id}`}>
      <div className="tl-head">
        <h3 className="tl-title" id={`${historyId}-change-${c.id}`}>{c.label}</h3>
        {c.needsReview ? (c.reviewer ? <Tag color="success">İkinci görüş alındı</Tag> : <Tag color="warning">İkinci görüş bekliyor</Tag>) : <Tag>Sınır değişikliği</Tag>}
      </div>
      <time className="tl-date" dateTime={c.at}>{formatDate(c.at)}</time>
      <dl className="tl-change history-change-values">
        <div>
          <dt>Önce</dt>
          <dd><Tag>{changeValue(c.key, c.before)}</Tag></dd>
        </div>
        <div>
          <dt>Sonra</dt>
          <dd><Tag color="processing">{changeValue(c.key, c.after)}</Tag></dd>
        </div>
      </dl>
      {c.reviewer ? <span className="tl-notes">İnceleyen: {c.reviewer}{c.reviewedAt ? `. ${formatDate(c.reviewedAt)}` : ''}</span> : null}
    </article>
  )

  return (
    <div className="page mobil-history">
      <PageHeader
        kicker="Karar günlüğü"
        title="Geçmiş"
        description="Her kontrol kararı bir sürüm noktasıdır. Hazırlık kararları da burada durur. Karar, kanıt ve karşı görüş birlikte durur. Kayıtlar silinmez."
      />

      <div className="history-grid">
        <Card
          className="k-card history-main"
          variant="borderless"
          title={<h2 className="history-heading">Zaman çizgisi</h2>}
        >
          <div className="history-filter">
            <Radio.Group
              name={`${historyId}-filter`}
              optionType="button"
              buttonStyle="solid"
              value={filter}
              onChange={(event) => {
                const value: unknown = event.target.value
                if (value === 'hepsi' || value === 'kararlar' || value === 'gecis' || value === 'degisiklikler') setFilter(value)
              }}
              options={[
                { value: 'hepsi', label: 'Hepsi' },
                { value: 'kararlar', label: 'Kararlar' },
                { value: 'gecis', label: 'Hazırlık' },
                { value: 'degisiklikler', label: 'Değişiklikler' },
              ]}
              aria-label="Kayıt türü"
            />
          </div>
          {entries.length === 0 ? (
            <Empty description={EMPTY_TEXT[filter]} />
          ) : (
            <Timeline
              className="k-timeline history-timeline"
              aria-label="Geçmiş kayıtları"
              items={entries.map((e) =>
                e.kind === 'karar'
                  ? { key: `karar-${e.d.id}`, icon: <span className={`tl-dot ${dotClass(e.d)}`.trim()}><Flag size={16} weight="fill" aria-hidden /></span>, content: decisionItem(e.d) }
                  : e.kind === 'gecis'
                    ? { key: `gecis-${e.t.id}`, icon: <span className={`tl-dot ${transitionDot(e.t)}`.trim()}><DoorOpen size={16} weight="fill" aria-hidden /></span>, content: transitionItem(e.t) }
                    : { key: `degisiklik-${e.c.id}`, icon: <span className={`tl-dot ${e.c.needsReview && !e.c.reviewer ? 'is-hold' : ''}`.trim()}><PencilSimpleLine size={16} aria-hidden /></span>, content: changeItem(e.c) },
              )}
            />
          )}
        </Card>

        <aside className="history-aside" aria-label="Özet">
          <Card className="k-card is-plain" variant="borderless" title={<h2 className="history-heading">Özet</h2>}>
            <div className="stat-list">
              <div><Statistic title="Karar sayısı" value={decisions.length} /></div>
              <div><Statistic title="Hazırlık kararı sayısı" value={transitions.length} /></div>
              <div><Statistic title="Değişiklik sayısı" value={changes.length} /></div>
              <div><Statistic title="Son kayıt" value={lastAt ? formatDate(lastAt) : 'Henüz yok'} className="is-text" /></div>
              <div><Statistic title="Plan sürümü" value={plan.revision} /></div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
