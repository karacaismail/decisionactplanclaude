import { Button, Card, Steps, Tag, Typography, theme } from 'antd'
import { Link, useNavigate, useParams } from 'react-router'
import { DoorOpen } from '@phosphor-icons/react'
import { useCurrentPlan } from '@/store/planStore'
import { decisionOf, stepsOf } from '@/data/registry'
import { stepApplies } from '@/engine/conditions'
import { gatePassed, lastDecision, effectiveOutcome } from '@/engine/gate'
import { Callout } from '@/components/Callout'
import { DecisionBadge } from '@/components/DecisionBadge'
import { LimitsBar } from '@/components/LimitsBar'
import { decisionIcon } from '@/app/AppShell'

export function DecisionScreen() {
  const { token } = theme.useToken()
  const { n } = useParams()
  const nav = useNavigate()
  const plan = useCurrentPlan()
  const d = decisionOf(Number(n))
  if (!plan || !d) return null
  const Icon = decisionIcon(d.icon)
  const steps = stepsOf(d.n).filter((s) => !plan.shortPath || s.shortPath)
  const locked = d.n > 1 && !gatePassed(plan, d.n - 1)
  const last = lastDecision(plan, d.n)
  const firstOpen = steps.find((s) => stepApplies(s.mandatory, plan) !== 'gizli' && plan.steps[s.id]?.status !== 'tamam' && plan.steps[s.id]?.status !== 'atlandi') ?? steps[0]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 24 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Icon size={36} color={token.colorPrimary} aria-hidden />
        <div>
          <Typography.Text style={{ color: token.colorTextSecondary, fontSize: 14 }}>Karar {d.n}</Typography.Text>
          <Typography.Title level={1} style={{ fontSize: 28, margin: 0 }}>{d.question}</Typography.Title>
        </div>
      </div>
      {locked ? <Callout tone="uyari" title="Önceki kapı geçilmedi">Bu kararı inceleyebilirsiniz. Ama adımları doldurmak için önce Karar {d.n - 1} kapısından "İlerle" veya "Koşullu ilerle" sonucu gerekir.</Callout> : null}
      <LimitsBar plan={plan} />
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        <Callout tone="sonuc" title="Kısaca">{d.intro}</Callout>
        <Callout tone="ornek" title="Günlük Hayattan">{d.example}</Callout>
      </div>
      <Card title="Bu kararda ne var?" extra={<span style={{ fontSize: 14, color: token.colorTextSecondary }}>{d.time}</span>}>
        <Typography.Paragraph><strong>Kim yapar?</strong> {d.who}</Typography.Paragraph>
        <Steps
          direction="vertical"
          size="small"
          current={-1}
          items={steps.map((s) => {
            const a = stepApplies(s.mandatory, plan)
            const rec = plan.steps[s.id]
            const status = rec?.status === 'tamam' ? 'finish' : rec?.status === 'atlandi' ? 'finish' : a === 'gizli' ? 'wait' : 'process'
            return {
              status,
              title: (
                <Link to={`/karar/${d.n}/adim/${s.id}`} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span>Adım {s.id}. {s.title}</span>
                  {a === 'zorunlu' ? <Tag color="processing" style={{ fontSize: 14, margin: 0 }}>Zorunlu</Tag> : a === 'kosullu' ? <Tag style={{ fontSize: 14, margin: 0 }}>Koşullu</Tag> : <Tag style={{ fontSize: 14, margin: 0 }}>Bu profilde gerekmez</Tag>}
                  {rec?.status === 'tamam' ? <Tag color="success" style={{ fontSize: 14, margin: 0 }}>Tamam</Tag> : rec?.status === 'atlandi' ? <Tag style={{ fontSize: 14, margin: 0 }}>Atlandı</Tag> : null}
                </Link>
              ),
              description: s.question,
            }
          })}
        />
      </Card>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button type="primary" size="large" onClick={() => nav(`/karar/${d.n}/adim/${firstOpen.id}`)}>Adımlara başla</Button>
        <Button size="large" icon={<DoorOpen size={20} />} onClick={() => nav(`/karar/${d.n}/kapi`)}>Kapı {d.n}: {d.gate.title}</Button>
        {last ? <DecisionBadge outcome={effectiveOutcome(last)} /> : null}
      </div>
    </div>
  )
}
