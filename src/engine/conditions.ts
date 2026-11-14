import type { Condition } from '@/data/schema'
import type { PlanDoc } from '@/data/types'

export function stepValue(plan: PlanDoc, step: string, key: string): unknown {
  return plan.steps[step]?.values?.[key]
}

export function evalCondition(c: Condition | undefined, plan: PlanDoc, currentStep?: string, currentValues?: Record<string, unknown>): boolean {
  if (!c) return true
  if ('not' in c) return !evalCondition(c.not, plan, currentStep, currentValues)
  if ('all' in c) return c.all.every((x) => evalCondition(x, plan, currentStep, currentValues))
  if ('any' in c) return c.any.some((x) => evalCondition(x, plan, currentStep, currentValues))
  if ('profile' in c) {
    return Object.entries(c.profile).every(([k, allowed]) => {
      const v = plan.profile[k as keyof typeof plan.profile]
      return allowed !== undefined && (allowed as (string | boolean)[]).includes(v as string | boolean)
    })
  }
  if ('field' in c) {
    const f = c.field
    const v = f.step || !currentValues ? stepValue(plan, f.step ?? currentStep ?? '', f.key) : currentValues[f.key]
    if (f.truthy !== undefined) {
      /* Boş liste dolu sayılmaz. Örneğin hiçbir kutu işaretlenmemiş bir seçim listesi. */
      const filled = Array.isArray(v) ? v.length > 0 : Boolean(v)
      return f.truthy ? filled : !filled
    }
    if (f.in) return f.in.includes(v)
    if ('equals' in f) return v === f.equals
    return Boolean(v)
  }
  return true
}

/** Adım profile göre zorunlu mu, koşullu mu, gizli mi? */
export function stepApplies(mandatory: boolean | Condition, plan: PlanDoc): 'zorunlu' | 'kosullu' | 'gizli' {
  if (mandatory === true) return 'zorunlu'
  if (mandatory === false) return 'kosullu'
  return evalCondition(mandatory, plan) ? 'zorunlu' : 'gizli'
}
