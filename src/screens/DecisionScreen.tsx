import { Button, Steps, Tag } from 'antd'
import { Link, useNavigate, useParams } from 'react-router'
import { DoorOpen, ArrowRight } from '@phosphor-icons/react'
import { useCurrentPlan } from '@/store/planStore'
import { decisionOf, stepsOf } from '@/data/registry'
import { stepApplies } from '@/engine/conditions'
import { gatePassed, lastDecision, effectiveOutcome } from '@/engine/gate'
import { Callout } from '@/components/Callout'
import { DecisionBadge } from '@/components/DecisionBadge'
import { LimitsBar } from '@/components/LimitsBar'
import { PageHeader } from '@/components/PageHeader'
import { decisionIcon } from '@/app/AppShell'

export function DecisionScreen() {
  const { n } = useParams()
  const nav = useNavigate()
  const plan = useCurrentPlan()
  const d = decisionOf(Number(n))
  if (!plan || !d) return null
  const Icon = decisionIcon(d.icon)
  const steps = stepsOf(d.n).filter((s) => !plan.shortPath || s.shortPath)
  const locked = d.n > 1 && !gatePassed(plan, d.n - 1)
  const passed = gatePassed(plan, d.n)
  const last = lastDecision(plan, d.n)
  const firstOpen = steps.find((s) => stepApplies(s.mandatory, plan) !== 'gizli' && plan.steps[s.id]?.status !== 'tamam' && plan.steps[s.id]?.status !== 'atlandi') ?? steps[0]
  const visible = steps.filter((s) => stepApplies(s.mandatory, plan) !== 'gizli')
  const done = visible.filter((s) => plan.steps[s.id]?.status === 'tamam' || plan.steps[s.id]?.status === 'atlandi').length

  return (
    <div className="page">
      <PageHeader
        title={d.question}
        documentTitle={`Karar ${d.n}. ${d.title}`}
        kicker={`Karar ${d.n}. ${d.title}`}
        icon={<span className={`icon-tile ${passed ? 'teal' : 'deep'}`} aria-hidden><Icon size={20} weight={passed ? 'fill' : 'regular'} /></span>}
        description={<>{d.who} Süre: {d.time}</>}
        actions={
          <>
            {last ? <DecisionBadge outcome={effectiveOutcome(last)} /> : null}
            <Button type="primary" size="large" icon={<ArrowRight size={20} />} iconPlacement="end" onClick={() => nav(`/karar/${d.n}/adim/${firstOpen.id}`)}>
              Adımlara başla
            </Button>
          </>
        }
      />
      {locked ? <Callout tone="uyari" title="Önceki kapı geçilmedi">Bu kararı inceleyebilirsiniz. Ama adımları doldurmak için önce Karar {d.n - 1} kapısından "İlerle" veya "Koşullu ilerle" sonucu gerekir.</Callout> : null}
      <LimitsBar plan={plan} />
      <div className="two-col">
        <Callout tone="sonuc" title="Kısaca">{d.intro}</Callout>
        <Callout tone="ornek" title="Günlük Hayattan">{d.example}</Callout>
      </div>
      <section className="panel" aria-labelledby="adimlar-title">
        <div className="section-head">
          <div>
            <h2 id="adimlar-title">Bu kararda ne var?</h2>
            <p className="tabular">{done} / {visible.length} adım tamamlandı.</p>
          </div>
          <span className="icon-tile navy" aria-hidden><Icon size={22} /></span>
        </div>
        <Steps
          orientation="vertical"
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
              content: s.question,
            }
          })}
        />
      </section>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button size="large" icon={<DoorOpen size={20} />} onClick={() => nav(`/karar/${d.n}/kapi`)} style={{ maxWidth: '100%', height: 'auto', minHeight: 52, whiteSpace: 'normal', textAlign: 'left' }}>
          Kapı {d.n}: {d.gate.title}
        </Button>
      </div>
    </div>
  )
}
