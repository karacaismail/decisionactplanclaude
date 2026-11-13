import { Button, Card, Progress, Switch, Tag, Typography, theme } from 'antd'
import { Link, useNavigate } from 'react-router'
import { ArrowRight } from '@phosphor-icons/react'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { DECISIONS } from '@/data/decisions'
import { stepsOf } from '@/data/registry'
import { gatePassed, lastDecision, effectiveOutcome } from '@/engine/gate'
import { stepApplies } from '@/engine/conditions'
import { LimitsBar } from '@/components/LimitsBar'
import { DecisionBadge } from '@/components/DecisionBadge'
import { decisionIcon } from '@/app/AppShell'
import { formatDate } from '@/engine/format'

export function OverviewScreen() {
  const { token } = theme.useToken()
  const nav = useNavigate()
  const plan = useCurrentPlan()
  const update = usePlanStore((s) => s.update)
  if (!plan) return null
  const openTasks = plan.tasks.filter((t) => t.status === 'acik' || t.status === 'taslak')
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <Typography.Title level={1} style={{ fontSize: 32, marginBottom: 4 }}>{plan.name}</Typography.Title>
          <Typography.Text style={{ color: token.colorTextSecondary }}>Son değişiklik {formatDate(plan.updatedAt)}</Typography.Text>
        </div>
        {plan.lastLocation ? (
          <Button type="primary" size="large" icon={<ArrowRight size={20} />} iconPlacement="end" onClick={() => nav(plan.lastLocation!)}>
            Kaldığım yerden devam et
          </Button>
        ) : null}
      </div>
      <LimitsBar plan={plan} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Switch checked={plan.shortPath} onChange={(v) => update((p) => (p.shortPath = v))} id="kisa-yol" />
        <label htmlFor="kisa-yol">En kısa yol. Yalnız zorunlu adımlar görünür. Kapılar yine uygulanır.</label>
      </div>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {DECISIONS.map((d) => {
          const Icon = decisionIcon(d.icon)
          const steps = stepsOf(d.n).filter((s) => stepApplies(s.mandatory, plan) !== 'gizli' && (!plan.shortPath || s.shortPath))
          const done = steps.filter((s) => plan.steps[s.id]?.status === 'tamam' || plan.steps[s.id]?.status === 'atlandi').length
          const passed = gatePassed(plan, d.n)
          const locked = d.n > 1 && !gatePassed(plan, d.n - 1)
          const last = lastDecision(plan, d.n)
          return (
            <Card key={d.n} style={{ opacity: locked ? 0.7 : 1 }} styles={{ body: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10 } }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Icon size={28} weight={passed ? 'fill' : 'regular'} color={token.colorPrimary} aria-hidden />
                <Typography.Text strong style={{ fontSize: 18 }}>{d.n}. {d.title}</Typography.Text>
              </div>
              <Typography.Text style={{ color: token.colorTextSecondary }}>{d.question}</Typography.Text>
              <Progress percent={steps.length ? Math.round((done / steps.length) * 100) : 0} size="small" format={() => `${done} / ${steps.length} adım`} />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {last ? <DecisionBadge outcome={effectiveOutcome(last)} size="sm" /> : <Tag style={{ fontSize: 14 }}>Kapı kararı yok</Tag>}
                {locked ? <Tag style={{ fontSize: 14 }}>Önceki kapı geçilmedi</Tag> : null}
              </div>
              <Link to={`/karar/${d.n}`}>{locked ? 'İncele' : 'Aç'}</Link>
            </Card>
          )
        })}
      </div>
      <Card title="Açık işler" extra={<Link to="/isler">Hepsini gör</Link>}>
        {openTasks.length === 0 ? <Typography.Text style={{ color: token.colorTextSecondary }}>Açık iş yok.</Typography.Text> : (
          <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 6 }}>
            {openTasks.slice(0, 5).map((t) => <li key={t.id}>{t.action} {t.owner ? `(${t.owner})` : ''} {t.dueDate ? `· ${formatDate(t.dueDate, false)}` : ''}</li>)}
          </ul>
        )}
      </Card>
    </div>
  )
}
