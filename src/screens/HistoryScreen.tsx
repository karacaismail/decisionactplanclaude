import { Card, Tag, Timeline, Typography, theme } from 'antd'
import { useCurrentPlan } from '@/store/planStore'
import { DecisionBadge } from '@/components/DecisionBadge'
import { formatDate, formatMoney } from '@/engine/format'
import { OUTCOME_LABEL } from '@/data/types'

function changeValue(key: string, v: unknown): string {
  if (v === null || v === undefined || v === '') return 'Boş'
  if (key.endsWith('Kurus')) return formatMoney(Number(v))
  if (key === 'deadline') return formatDate(String(v), false)
  if (Array.isArray(v)) return `${v.length} kural`
  if (typeof v === 'boolean') return v ? 'Evet' : 'Hayır'
  return String(v)
}

export function HistoryScreen() {
  const { token } = theme.useToken()
  const plan = useCurrentPlan()
  if (!plan) return null
  const changes = [...(plan.changes ?? [])].reverse()
  const items = [...plan.decisions].reverse().map((d) => ({
    color: d.stale ? 'orange' : undefined,
    children: (
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
        <span style={{ fontSize: 14, color: token.colorTextSecondary }}>{formatDate(d.decidedAt)} · Sürüm {d.revision} · {d.decidedBy}</span>
        <span style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}><strong>Kapı {d.gate}</strong> <DecisionBadge outcome={d.chosen} size="sm" /> {d.stale ? <Tag color="warning" style={{ fontSize: 14, margin: 0 }}>İnceleme bekliyor</Tag> : null} {d.chosen !== d.suggested ? <span style={{ fontSize: 14 }}>Öneri: {OUTCOME_LABEL[d.suggested]}</span> : null}</span>
        {d.stale ? <span style={{ fontSize: 14, color: token.colorTextSecondary }}>Dayandığı veri sonradan değişti. Kapıyı yeniden inceleyin.</span> : null}
        <span>{d.reason}</span>
        {d.counterView ? <span style={{ fontSize: 14, color: token.colorTextSecondary }}>Karşı görüş: {d.counterView}</span> : null}
        {d.secondOpinion ? <span style={{ fontSize: 14, color: token.colorTextSecondary }}>İkinci görüş: {d.secondOpinion}</span> : null}
        {d.conditional ? <span style={{ fontSize: 14 }}>Koşullu iş: {d.conditional.scope}. Bitiş {formatDate(d.conditional.deadline, false)}.</span> : null}
        {d.reopenWhen ? <span style={{ fontSize: 14 }}>Yeniden açılır: {d.reopenWhen}</span> : null}
      </div>
    ),
  }))
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 24 }}>
      <div>
        <Typography.Title level={1} style={{ fontSize: 32, marginBottom: 8 }}>Geçmiş</Typography.Title>
        <Typography.Text style={{ color: token.colorTextSecondary }}>Her kapı kararı bir sürüm noktasıdır. Karar, kanıt ve karşı görüş birlikte durur. Silinmez.</Typography.Text>
      </div>
      <Card>
        {items.length === 0 ? <Typography.Text style={{ color: token.colorTextSecondary }}>Henüz karar kaydı yok.</Typography.Text> : <Timeline items={items} />}
      </Card>
      <Card title="Değişiklik kaydı" size="small">
        {changes.length === 0 ? (
          <Typography.Text style={{ color: token.colorTextSecondary }}>Sınır değişikliği yok.</Typography.Text>
        ) : (
          <ul role="list" style={{ margin: 0, paddingLeft: 20, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
            {changes.map((c) => (
              <li key={c.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 2 }}>
                <span style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <strong>{c.label}</strong>
                  {c.needsReview ? (c.reviewer ? <Tag color="success" style={{ fontSize: 14, margin: 0 }}>Görüş alındı</Tag> : <Tag color="warning" style={{ fontSize: 14, margin: 0 }}>İkinci görüş bekliyor</Tag>) : null}
                </span>
                <span>{changeValue(c.key, c.before)} yerine {changeValue(c.key, c.after)}.</span>
                <span style={{ fontSize: 14, color: token.colorTextSecondary }}>{formatDate(c.at)}{c.reviewer ? `. İnceleyen: ${c.reviewer}` : ''}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card title="Sürümler" size="small">
        <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 6 }}>
          {plan.revisions.length === 0 ? <li>Sürüm yok.</li> : [...plan.revisions].reverse().map((r) => <li key={r.id}>{formatDate(r.createdAt)}: {r.label}</li>)}
        </ul>
      </Card>
    </div>
  )
}
