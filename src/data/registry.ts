import type { DecisionDef, StepDef } from './schema'
import { DECISIONS, STRATEGY, STRATEGY_N } from './decisions'
import { STEP_LIST } from './steps'

export const STEPS: Record<string, StepDef> = Object.fromEntries(STEP_LIST.map((s) => [s.id, s]))
export const STEP_IDS: string[] = STEP_LIST.map((s) => s.id)

/** Sekiz karar ya da strateji çalışması (9). */
export function decisionOf(n: number): DecisionDef | undefined {
  if (n === STRATEGY_N) return STRATEGY
  return DECISIONS.find((d) => d.n === n)
}
/** Adımın ekranda görünen grup adı: "Karar 3. Erişim ve seçenek" ya da "Strateji çalışması". */
export function groupLabel(n: number): string {
  const d = decisionOf(n)
  if (n === STRATEGY_N) return STRATEGY.title
  return d ? `Karar ${n}. ${d.title}` : `Karar ${n}`
}
/** Adımın adresi. */
export function stepPath(id: string): string {
  const s = STEPS[id]
  return `/karar/${s?.decision ?? 1}/adim/${id}`
}
export function stepsOf(n: number): StepDef[] {
  return (decisionOf(n)?.steps ?? []).map((id) => STEPS[id]).filter(Boolean)
}
export function nextStepId(id: string): string | undefined {
  const i = STEP_IDS.indexOf(id)
  return i >= 0 ? STEP_IDS[i + 1] : undefined
}
export function prevStepId(id: string): string | undefined {
  const i = STEP_IDS.indexOf(id)
  return i > 0 ? STEP_IDS[i - 1] : undefined
}
