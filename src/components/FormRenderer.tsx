import { Grid, Typography, theme } from 'antd'
import type { StepDef } from '@/data/schema'
import type { PlanDoc } from '@/data/types'
import { evalCondition } from '@/engine/conditions'
import { FieldControl } from './FieldControl'

/** Adım tanımını Ant Design alanlarına çevirir. Koşullu bölüm ve alanları gizler. */
export function FormRenderer({ step, plan, values, onChange }: { step: StepDef; plan: PlanDoc; values: Record<string, unknown>; onChange: (key: string, v: unknown) => void }) {
  const { token } = theme.useToken()
  const bp = Grid.useBreakpoint()
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 32 }}>
      {step.sections.map((sec, i) => {
        if (!evalCondition(sec.when, plan, step.id, values)) return null
        return (
          <section key={i} aria-labelledby={sec.title ? `${step.id}-b${i}` : undefined} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16 }}>
            {sec.title ? (
              <div>
                <Typography.Title level={3} id={`${step.id}-b${i}`} style={{ fontSize: 20, margin: 0 }}>{sec.title}</Typography.Title>
                {sec.description ? <div style={{ color: token.colorTextSecondary, marginTop: 4 }}>{sec.description}</div> : null}
              </div>
            ) : null}
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: bp.md ? 'repeat(24, minmax(0, 1fr))' : 'minmax(0, 1fr)' }}>
              {sec.fields.map((f) => (
                <div key={f.key} style={{ gridColumn: bp.md ? `span ${f.span ?? 24}` : 'auto', minWidth: 0 }}>
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
