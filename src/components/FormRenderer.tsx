import { Card, Form, Tag } from 'antd'
import type { Field, Section, StepDef } from '@/data/schema'
import type { PlanDoc } from '@/data/types'
import { evalCondition } from '@/engine/conditions'
import { FieldControl, isFilled } from './FieldControl'
import { CalcField } from './CalcField'

export interface SectionStat {
  /** Kart kimliği. Sağ sütundaki bağlantı listesi (Anchor) buraya atlar. */
  id: string
  title: string
  total: number
  filled: number
}

/** Bölüm başlığı yoksa kartın adı budur. */
const FALLBACK_TITLE = 'Sorular'

function visibleFields(sec: Section, plan: PlanDoc, values: Record<string, unknown>): Field[] {
  return sec.fields.filter((f) => f.type !== 'info' && f.type !== 'calc' && evalCondition(f.when, plan, undefined, values))
}

/** Görünen bölümler ve her birinin doluluk sayısı. Sağ sütun ve kart başlıkları bu sayıları kullanır. */
export function sectionStats(step: StepDef, plan: PlanDoc, values: Record<string, unknown>): SectionStat[] {
  const out: SectionStat[] = []
  step.sections.forEach((sec, i) => {
    if (!evalCondition(sec.when, plan, step.id, values)) return
    const fields = visibleFields(sec, plan, values)
    out.push({ id: `b${step.id}-${i}`, title: sec.title ?? FALLBACK_TITLE, total: fields.length, filled: fields.filter((f) => isFilled(values[f.key])).length })
  })
  return out
}

/**
 * Adım tanımını form kartlarına çevirir. Her bölüm bir `Card` olur: başlık solda, doluluk etiketi sağda.
 * Koşullu bölüm ve alanları gizler. Alanlar 24 sütunlu ızgarada `span` ile yan yana gelir.
 * `Form` yalnız düzen verir (dikey etiket). Değerler ekranın kendi durumunda tutulur.
 */
export function FormRenderer({ step, plan, values, onChange }: { step: StepDef; plan: PlanDoc; values: Record<string, unknown>; onChange: (key: string, v: unknown) => void }) {
  const stats = sectionStats(step, plan, values)
  let k = 0
  return (
    <Form layout="vertical" component={false} requiredMark={false} className="step-form">
      {step.sections.map((sec, i) => {
        if (!evalCondition(sec.when, plan, step.id, values)) return null
        const stat = stats[k++]
        const headId = `${stat.id}-baslik`
        const done = stat.total > 0 && stat.filled === stat.total
        return (
          <Card
            key={i}
            id={stat.id}
            className="step-card form-section"
            variant="borderless"
            title={<span id={headId}>{stat.title}</span>}
            extra={stat.total ? <Tag className="fill-tag" color={done ? 'success' : undefined}>{stat.filled} / {stat.total} alan</Tag> : null}
            aria-labelledby={headId}
          >
            {sec.description ? <p className="card-desc">{sec.description}</p> : null}
            <div className="field-grid">
              {sec.fields.map((f) => {
                if (!evalCondition(f.when, plan, undefined, values)) return null
                if (f.type === 'calc') {
                  const result = f.compute(values, plan)
                  return (
                    <div key={f.key} className="field-cell">
                      <CalcField label={f.label} result={result} current={result?.apply ? values[result.apply.key] : undefined} onApply={(key, v) => onChange(key, v)} />
                    </div>
                  )
                }
                return (
                  <div key={f.key} className={`field-cell${f.span && f.span < 24 ? ` span-${f.span}` : ''}`}>
                    <FieldControl field={f} value={values[f.key]} onChange={(v) => onChange(f.key, v)} plan={plan} values={values} idPrefix={`a${step.id}`} />
                  </div>
                )
              })}
            </div>
          </Card>
        )
      })}
    </Form>
  )
}
