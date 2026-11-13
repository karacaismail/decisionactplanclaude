import { Button } from 'antd'
import { useNavigate, useParams } from 'react-router'
import { ArrowRight } from '@phosphor-icons/react'
import { useCurrentPlan } from '@/store/planStore'
import { decisionOf, stepsOf } from '@/data/registry'
import { stepApplies } from '@/engine/conditions'
import { gatePassed, lastDecision, effectiveOutcome } from '@/engine/gate'
import { Callout } from '@/components/Callout'
import { DecisionBadge } from '@/components/DecisionBadge'
import { LimitsBar } from '@/components/LimitsBar'
import { PageHeader, SectionHead } from '@/components/PageHeader'
import '@/styles/screens-pano.css'

/** "Kapı 1'e git", "Kapı 2'ye git" gibi doğru ek. */
const GATE_SUFFIX: Record<number, string> = { 1: "'e", 2: "'ye", 3: "'e", 4: "'e", 5: "'e", 6: "'ya", 7: "'ye", 8: "'e" }

export function DecisionScreen() {
  const { n } = useParams()
  const nav = useNavigate()
  const plan = useCurrentPlan()
  const d = decisionOf(Number(n))
  if (!plan || !d) return null
  const steps = stepsOf(d.n).filter((s) => !plan.shortPath || s.shortPath)
  const locked = d.n > 1 && !gatePassed(plan, d.n - 1)
  const last = lastDecision(plan, d.n)
  const isOpen = (id: string) => plan.steps[id]?.status !== 'tamam' && plan.steps[id]?.status !== 'atlandi'
  const firstOpen = steps.find((s) => stepApplies(s.mandatory, plan) !== 'gizli' && isOpen(s.id))
  const visible = steps.filter((s) => stepApplies(s.mandatory, plan) !== 'gizli')
  const done = visible.filter((s) => !isOpen(s.id)).length

  return (
    <div className="page">
      <PageHeader
        title={d.question}
        documentTitle={`Karar ${d.n}. ${d.title}`}
        kicker={`Karar ${d.n}`}
        description={
          <>
            {d.title}. {d.who} Süre: {d.time}
          </>
        }
        actions={
          <Button type="primary" icon={<ArrowRight size={16} />} iconPlacement="end" onClick={() => nav(`/karar/${d.n}/kapi`)}>
            Kapı {d.n}
            {GATE_SUFFIX[d.n] ?? "'e"} git
          </Button>
        }
      />
      {locked ? (
        <Callout tone="uyari" title="Önceki kapı geçilmedi">
          Bu kararı inceleyebilirsiniz. Ama adımları doldurmak için önce Karar {d.n - 1} kapısından "İlerle" veya "Koşullu ilerle" sonucu gerekir.
        </Callout>
      ) : null}
      <div className="limits-row">
        <LimitsBar plan={plan} compact />
        {last ? <DecisionBadge outcome={effectiveOutcome(last)} size="sm" /> : null}
      </div>
      <div className="two-col">
        <Callout tone="sonuc" title="Kısaca">
          {d.intro}
        </Callout>
        <Callout tone="ornek" title="Günlük Hayattan">
          {d.example}
        </Callout>
      </div>
      <section className="section" aria-labelledby="adimlar-title">
        <SectionHead title="Bu kararda ne var?" description={`${done} / ${visible.length} adım tamamlandı. Satıra basınca adım açılır.${firstOpen ? ` Sıradaki adım ${firstOpen.id}.` : ''}`} />
        <ol className="step-list">
          {steps.map((s) => {
            const a = stepApplies(s.mandatory, plan)
            const rec = plan.steps[s.id]
            const need = a === 'zorunlu' ? 'Zorunlu' : a === 'kosullu' ? 'Koşullu' : 'Gerekmez'
            const state = rec?.status === 'tamam' ? 'Tamam' : rec?.status === 'atlandi' ? 'Atlandı' : null
            return (
              <li key={s.id}>
                <button
                  type="button"
                  className={`step-row${a === 'gizli' ? ' is-muted' : ''}`}
                  onClick={() => nav(`/karar/${d.n}/adim/${s.id}`)}
                  aria-label={`Adım ${s.id}. ${s.title}. ${need}.${state ? ` ${state}.` : ''}`}
                >
                  <span className="route-dot" aria-hidden>
                    {s.id}
                  </span>
                  <span className="step-body">
                    {/* Satır başına tek etiket: tamamsa durum, değilse gereklilik. */}
                    <span className={state === 'Tamam' ? 'tag is-ok' : state === 'Atlandı' ? 'tag is-muted' : 'tag'} aria-hidden>
                      {state ?? need}
                    </span>
                    <span className="step-title">{s.title}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
