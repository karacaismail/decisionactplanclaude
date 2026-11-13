import type { StepDef } from '@/data/schema'
import type { PlanDoc } from '@/data/types'
import { evalCondition } from '@/engine/conditions'
import { FieldControl } from './FieldControl'

/**
 * Adım tanımını form bölümlerine çevirir. Koşullu bölüm ve alanları gizler.
 * Her bölüm `.form-section` olur. İkinci bölümden sonra 1 px üst çizgi gelir.
 */
export function FormRenderer({ step, plan, values, onChange }: { step: StepDef; plan: PlanDoc; values: Record<string, unknown>; onChange: (key: string, v: unknown) => void }) {
  return (
    <div className="work-main">
      {step.sections.map((sec, i) => {
        if (!evalCondition(sec.when, plan, step.id, values)) return null
        const headId = `${step.id}-b${i}`
        return (
          <section key={i} className="form-section" aria-labelledby={sec.title ? headId : undefined}>
            {sec.title ? (
              <div className="section-head">
                <h3 id={headId}>{sec.title}</h3>
                {sec.description ? <p>{sec.description}</p> : null}
              </div>
            ) : null}
            <div className="field-grid">
              {sec.fields.map((f) => (
                <div key={f.key} className={`field-cell${f.span && f.span < 24 ? ` span-${f.span}` : ''}`}>
                  <FieldControl field={f} value={values[f.key]} onChange={(v) => onChange(f.key, v)} plan={plan} values={values} idPrefix={`a${step.id}`} />
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
