import { useMemo, useState } from 'react'
import { Button, Checkbox, Grid, Input, Table, App as AntApp } from 'antd'
import { useNavigate, useParams } from 'react-router'
import { CheckCircle, XCircle, Question, CaretDown } from '@phosphor-icons/react'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { decisionOf } from '@/data/registry'
import { evaluateGate, lastDecision, effectiveOutcome } from '@/engine/gate'
import { OutcomePanel, type OutcomeDraft } from '@/components/OutcomePanel'
import { LimitsBar } from '@/components/LimitsBar'
import { DecisionBadge } from '@/components/DecisionBadge'
import { Callout } from '@/components/Callout'
import { PageHeader, SectionHead } from '@/components/PageHeader'
import { OUTCOME_LABEL, type Outcome } from '@/data/types'
import { formatDate, formatMoney } from '@/engine/format'
import { openReviews } from '@/engine/changes'
import '@/styles/screens-kapi.css'

interface RuleRow { condition: string; outcome: Outcome; note?: string }

export function ReviewScreen() {
  const { n } = useParams()
  const nav = useNavigate()
  const { message } = AntApp.useApp()
  const bp = Grid.useBreakpoint()
  const narrow = bp.md === false
  const plan = useCurrentPlan()
  const recordDecision = usePlanStore((s) => s.recordDecision)
  const addTask = usePlanStore((s) => s.addTask)
  const setLocation = usePlanStore((s) => s.setLocation)
  const reviewChange = usePlanStore((s) => s.reviewChange)
  const [harm, setHarm] = useState(false)
  const [reviewer, setReviewer] = useState('')
  const [permitMissing, setPermitMissing] = useState(false)
  const d = decisionOf(Number(n))
  const evaluation = useMemo(() => (plan && d ? evaluateGate(d.gate, plan, { harm, permitMissing }) : null), [plan, d, harm, permitMissing])
  if (!plan || !d || !evaluation) return null
  const last = lastDecision(plan, d.n)
  const single = plan.profile.team !== 'ekip'
  const pending = openReviews(plan)

  const saveReview = (id: string) => {
    const error = reviewChange(id, reviewer)
    if (error) message.error(error)
    else message.success('Görüş kaydedildi.')
  }
  const changeValue = (key: string, v: unknown): string => {
    if (v === null || v === undefined || v === '') return 'Boş'
    if (key.endsWith('Kurus')) return formatMoney(Number(v))
    if (key === 'deadline') return formatDate(String(v), false)
    if (Array.isArray(v)) return `${v.length} kural`
    return String(v)
  }

  const save = (draft: OutcomeDraft) => {
    const id = recordDecision(
      {
        gate: d.n,
        scope: d.question,
        criteria: d.gate.criteria.map((c) => ({ id: c.id, label: c.label, met: evaluation.criteria[c.id] })),
        suggested: evaluation.suggested,
        chosen: draft.chosen,
        reason: draft.reason,
        counterView: draft.counterView || undefined,
        secondOpinion: draft.secondOpinion || undefined,
        conditional: draft.chosen === 'kosulluIlerle' && draft.conditional ? { ...draft.conditional, issuedAt: new Date().toISOString() } : undefined,
        retriesLeft: evaluation.retriesLeft - (draft.chosen === 'yenidenDene' ? 1 : 0),
        decidedBy: draft.decidedBy,
        reopenWhen: draft.reopenWhen || undefined,
      },
      `Kapı ${d.n}: ${OUTCOME_LABEL[draft.chosen]}`,
    )
    if (draft.chosen === 'kosulluIlerle' && draft.conditional) {
      addTask({ action: `Koşullu iş: ${draft.conditional.scope}. Kapanış kanıtı: ${draft.conditional.closingEvidence}`, sourceDecisionId: id, owner: draft.conditional.owner, dueDate: draft.conditional.deadline, status: 'acik' })
    }
    if (draft.chosen === 'beklet') addTask({ action: `Kapı ${d.n} bekliyor. İzlenecek olay: ${draft.reopenWhen || 'yazılmadı'}`, sourceDecisionId: id, owner: draft.decidedBy, status: 'acik' })
    if (draft.chosen === 'yenidenDene') addTask({ action: `Kapı ${d.n} için küçük deneme. Eksik ölçütü ölçün.`, sourceDecisionId: id, owner: draft.decidedBy, status: 'acik' })
    if (draft.chosen === 'yonDegistir') addTask({ action: `Yön değişikliği. Etkilenen ilk adıma dönün. Gerekçe: ${draft.reason}`, sourceDecisionId: id, owner: draft.decidedBy, status: 'acik' })
    message.success('Karar günlüğüne yazıldı. Yeni sürüm alındı.')
    const to = draft.chosen === 'ilerle' || draft.chosen === 'kosulluIlerle' ? (d.n < 8 ? `/karar/${d.n + 1}` : '/ciktilar') : '/ozet'
    setLocation(to)
    nav(to)
  }

  const icon = (v: boolean | null) =>
    v === true ? (
      <span className="criterion-icon is-ok"><CheckCircle size={16} weight="fill" aria-label="Karşılandı" /></span>
    ) : v === false ? (
      <span className="criterion-icon is-harm"><XCircle size={16} weight="fill" aria-label="Karşılanmadı" /></span>
    ) : (
      <span className="criterion-icon is-muted"><Question size={16} aria-label="Ölçülmedi" /></span>
    )

  const rows: RuleRow[] = [
    { condition: 'Ciddi zarar tehlikesi var', outcome: 'durdur', note: 'Etkilenen işi güvenli biçimde kapatın.' },
    { condition: 'Gerekli izin veya yetki eksik', outcome: 'beklet', note: 'İzne bağlı işi açmayın. Yüksek satış beklentisi bu engeli kaldırmaz.' },
    ...d.gate.rows,
  ]
  const matched = (r: RuleRow) => evaluation.matchedRow?.condition === r.condition

  return (
    <div className="page">
      <PageHeader
        kicker={`Karar ${d.n}. ${d.title}`}
        title={`Kapı ${d.n}. ${d.gate.title}`}
        documentTitle={`Kapı ${d.n}`}
        description={<>Hangi işe karar veriyoruz? {d.question}</>}
      />

      {last ? (
        <Callout tone={last.stale ? 'uyari' : 'bilgi'} title={`Son kayıt: ${formatDate(last.decidedAt)}`}>
          <div className="history-notes">
            <span className="history-meta">
              <DecisionBadge outcome={effectiveOutcome(last)} />
              {last.stale ? <span className="tag is-hold">İnceleme bekliyor</span> : null}
            </span>
            <span>{last.reason}</span>
            {last.stale ? <span>Bu kararın dayandığı veri sonradan değişti. Kapı geçilmiş sayılmaz. Kararı yeniden kaydedin.</span> : null}
          </div>
        </Callout>
      ) : null}

      <LimitsBar plan={plan} retriesLeft={evaluation.retriesLeft} compact />

      {pending.length > 0 ? (
        <section className="section" aria-labelledby="ikinci-gorus-title">
          <div className="section-head">
            <h2 id="ikinci-gorus-title">İkinci görüş bekleyen değişiklikler</h2>
            <p>Tek kurucu sınırı artırdı. Konuyu bilen başka bir kişi görüş yazmadan "İlerle" ve "Koşullu ilerle" kaydedilmez.</p>
          </div>
          <ul className="row-list">
            {pending.map((c) => (
              <li key={c.id}>
                <div className="row">
                  <span className="grow"><strong>{c.label}</strong>: {changeValue(c.key, c.before)} yerine {changeValue(c.key, c.after)}.</span>
                  <span className="helper">{formatDate(c.at)}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="field" style={{ maxWidth: 360 }}>
            <label className="field-label" htmlFor="inceleyen">İnceleyen kişi</label>
            <Input id="inceleyen" value={reviewer} onChange={(e) => setReviewer(e.target.value)} placeholder="Ad Soyad" />
            <span className="field-help">Kararı veren kurucu olamaz.</span>
          </div>
          <div className="toolbar-group">
            {pending.map((c) => (
              <Button key={c.id} disabled={!reviewer.trim()} onClick={() => saveReview(c.id)}>
                Görüşü kaydet: {c.label}
              </Button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="kapi-grid">
        <div className="kapi-main">
          <section className="section" aria-label="Önce zarar ve izin">
            <SectionHead title="Önce zarar ve izin" description="Bu iki soru ölçütlerden önce gelir." />
            <div className="check-list">
              <Checkbox checked={harm} onChange={(e) => setHarm(e.target.checked)}>Ciddi zarar tehlikesi var. Etkilenen iş durdurulmalı.</Checkbox>
              <Checkbox checked={permitMissing} onChange={(e) => setPermitMissing(e.target.checked)}>Gerekli izin veya yetki eksik. İzne bağlı iş açılmamalı.</Checkbox>
            </div>
          </section>

          <section className="section" aria-label="Ölçütler">
            <SectionHead title="Ölçütler" />
            <ul className="criteria-list">
              {d.gate.criteria.map((c) => {
                const v = evaluation.criteria[c.id]
                return (
                  <li key={c.id}>
                    <div className="criterion">
                      {icon(v)}
                      <div className="criterion-text">
                        <span>{c.label}</span>
                        {c.hint ? <span className="helper">{c.hint}</span> : null}
                      </div>
                      {v === null ? <span className="tag">Ölçülmedi</span> : <span />}
                    </div>
                  </li>
                )
              })}
            </ul>
            <span className="helper tabular">{evaluation.metCount} / {evaluation.total} ölçüt karşılandı. {evaluation.unknownCount} ölçüt ölçülmedi.</span>
          </section>

          <section className="section" aria-label="Koşula göre sonuç">
            <SectionHead title="Koşula göre sonuç" />
            {narrow ? (
              <div className="outcome-table">
                <ul className="outcome-list">
                  {rows.map((r) => (
                    <li key={r.condition}>
                      <details className={`outcome-row${matched(r) ? ' is-matched' : ''}`}>
                        <summary>
                          <span className="outcome-condition">{r.condition}</span>
                          <DecisionBadge outcome={r.outcome} />
                          <span className="outcome-caret" aria-hidden><CaretDown size={16} /></span>
                        </summary>
                        <p className="outcome-note">{r.note ?? 'Bu satır için ek not yok.'}</p>
                      </details>
                    </li>
                  ))}
                </ul>
                <span className="helper">Satıra dokununca not açılır. Üstteki satır önce gelir.</span>
              </div>
            ) : (
              <div className="outcome-table">
                <div className="table-scroll">
                  <Table<RuleRow>
                    size="small"
                    pagination={false}
                    rowKey={(r) => r.condition}
                    dataSource={rows}
                    rowClassName={(r) => (matched(r) ? 'is-matched' : '')}
                    columns={[
                      { title: 'Durum', dataIndex: 'condition', width: '40%', render: (t: string, r) => <span className="history-meta" style={{ fontWeight: matched(r) ? 600 : 400 }}>{t}{matched(r) ? <span className="tag">Uyuyor</span> : null}</span> },
                      { title: 'Sonuç', dataIndex: 'outcome', width: 160, render: (o: Outcome) => <DecisionBadge outcome={o} /> },
                      { title: 'Not', dataIndex: 'note', render: (t?: string) => t ?? <span className="helper">Ek not yok.</span> },
                    ]}
                  />
                </div>
                <span className="helper">Üstteki satır önce gelir.</span>
              </div>
            )}
          </section>
        </div>

        <div className="kapi-aside">
          <section className="section" aria-label="Kararı kaydedin">
            <SectionHead title="Kararı kaydedin" description="Öneriyi seçin ya da gerekçeyle değiştirin." />
            <OutcomePanel evaluation={evaluation} onSave={save} singleFounder={single} plan={plan} def={d.gate} harm={harm} />
          </section>
        </div>
      </div>
    </div>
  )
}
