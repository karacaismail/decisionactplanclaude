import { useMemo, useState } from 'react'
import { Button, Card, Checkbox, Input, Space, Table, Tag, Typography, theme, App as AntApp } from 'antd'
import { useNavigate, useParams } from 'react-router'
import { CheckCircle, XCircle, Question } from '@phosphor-icons/react'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { decisionOf } from '@/data/registry'
import { evaluateGate, lastDecision, effectiveOutcome } from '@/engine/gate'
import { OutcomePanel, type OutcomeDraft } from '@/components/OutcomePanel'
import { LimitsBar } from '@/components/LimitsBar'
import { DecisionBadge } from '@/components/DecisionBadge'
import { Callout } from '@/components/Callout'
import { OUTCOME_LABEL } from '@/data/types'
import { formatDate, formatMoney } from '@/engine/format'
import { openReviews } from '@/engine/changes'

export function ReviewScreen() {
  const { token } = theme.useToken()
  const { n } = useParams()
  const nav = useNavigate()
  const { message } = AntApp.useApp()
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

  const icon = (v: boolean | null) => (v === true ? <CheckCircle size={22} weight="fill" color={token.colorSuccess} aria-label="Karşılandı" /> : v === false ? <XCircle size={22} weight="fill" color={token.colorError} aria-label="Karşılanmadı" /> : <Question size={22} color={token.colorTextSecondary} aria-label="Ölçülmedi" />)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 24 }}>
      <div>
        <Typography.Text style={{ color: token.colorTextSecondary, fontSize: 14 }}>Karar {d.n}. {d.title}</Typography.Text>
        <Typography.Title level={1} style={{ fontSize: 28, margin: '4px 0' }}>Kapı {d.n}. {d.gate.title}</Typography.Title>
        <Typography.Text>Hangi işe karar veriyoruz? {d.question}</Typography.Text>
      </div>
      {last ? (
        <Callout tone={last.stale ? 'uyari' : 'bilgi'} title={`Son kayıt: ${formatDate(last.decidedAt)}`}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
            <Space wrap><DecisionBadge outcome={effectiveOutcome(last)} />{last.stale ? <Tag color="warning" style={{ fontSize: 14, margin: 0 }}>İnceleme bekliyor</Tag> : null}<span>{last.reason}</span></Space>
            {last.stale ? <span>Bu kararın dayandığı veri sonradan değişti. Kapı geçilmiş sayılmaz. Kararı yeniden kaydedin.</span> : null}
          </div>
        </Callout>
      ) : null}
      {pending.length > 0 ? (
        <Card title="İkinci görüş bekleyen değişiklikler">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
            <Typography.Text>Tek kurucu sınırı artırdı. Konuyu bilen başka bir kişi görüş yazmadan "İlerle" ve "Koşullu ilerle" kaydedilmez.</Typography.Text>
            <ul role="list" style={{ margin: 0, paddingLeft: 20, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 6 }}>
              {pending.map((c) => (
                <li key={c.id}>
                  <strong>{c.label}</strong>: {changeValue(c.key, c.before)} yerine {changeValue(c.key, c.after)}. <span style={{ color: token.colorTextSecondary, fontSize: 14 }}>{formatDate(c.at)}</span>
                </li>
              ))}
            </ul>
            <label style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
              <span style={{ fontWeight: 500 }}>İnceleyen kişi. Kararı veren kurucu olamaz.</span>
              <Input value={reviewer} onChange={(e) => setReviewer(e.target.value)} placeholder="Ad Soyad" style={{ maxWidth: 320 }} />
            </label>
            <Space wrap>
              {pending.map((c) => (
                <Button key={c.id} disabled={!reviewer.trim()} onClick={() => saveReview(c.id)}>
                  Görüşü kaydet: {c.label}
                </Button>
              ))}
            </Space>
          </div>
        </Card>
      ) : null}
      <LimitsBar plan={plan} retriesLeft={evaluation.retriesLeft} />
      <Card title="Önce zarar ve izin">
        <Space orientation="vertical">
          <Checkbox checked={harm} onChange={(e) => setHarm(e.target.checked)}>Ciddi zarar tehlikesi var. Etkilenen iş durdurulmalı.</Checkbox>
          <Checkbox checked={permitMissing} onChange={(e) => setPermitMissing(e.target.checked)}>Gerekli izin veya yetki eksik. İzne bağlı iş açılmamalı.</Checkbox>
        </Space>
      </Card>
      <Card title="Ölçütler">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 }}>
          {d.gate.criteria.map((c) => (
            <div key={c.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 10, borderRadius: token.borderRadius, background: token.colorFillAlter }}>
              {icon(evaluation.criteria[c.id])}
              <div>
                <div>{c.label}</div>
                {c.hint ? <div style={{ fontSize: 14, color: token.colorTextSecondary }}>{c.hint}</div> : null}
              </div>
            </div>
          ))}
          <Typography.Text style={{ color: token.colorTextSecondary }} className="tabular">{evaluation.metCount} / {evaluation.total} ölçüt karşılandı. {evaluation.unknownCount} ölçüt ölçülmedi.</Typography.Text>
        </div>
      </Card>
      <Card title="Koşula göre sonuç" size="small" extra={<span style={{ fontSize: 14, color: token.colorTextSecondary }}>Üstteki satır önce gelir.</span>}>
        <Table
          size="small"
          pagination={false}
          rowKey={(r) => r.condition}
          dataSource={[
            { condition: 'Ciddi zarar tehlikesi var', outcome: 'durdur' as const, note: 'Etkilenen işi güvenli biçimde kapatın.' },
            { condition: 'Gerekli izin veya yetki eksik', outcome: 'beklet' as const, note: 'İzne bağlı işi açmayın. Yüksek satış beklentisi bu engeli kaldırmaz.' },
            ...d.gate.rows,
          ]}
          rowClassName={(r) => (evaluation.matchedRow?.condition === r.condition ? 'eslesen-satir' : '')}
          columns={[
            { title: 'Durum', dataIndex: 'condition', render: (t: string, r) => <span style={{ fontWeight: evaluation.matchedRow?.condition === r.condition ? 600 : 400 }}>{t}{evaluation.matchedRow?.condition === r.condition ? <Tag color="processing" style={{ marginLeft: 8, fontSize: 14 }}>Uyuyor</Tag> : null}</span> },
            { title: 'Sonuç', dataIndex: 'outcome', render: (o) => <DecisionBadge outcome={o} size="sm" /> },
            { title: 'Not', dataIndex: 'note' },
          ]}
          scroll={{ x: 'max-content' }}
        />
      </Card>
      <Card title="Kararı kaydedin">
        <OutcomePanel evaluation={evaluation} onSave={save} singleFounder={single} plan={plan} def={d.gate} harm={harm} />
      </Card>
    </div>
  )
}
