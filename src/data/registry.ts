import type { DecisionDef, StepDef } from './schema'
import { DECISIONS, STRATEGY, STRATEGY_N } from './decisions'
import { STEP_LIST } from './steps'

export const STEPS: Record<string, StepDef> = Object.fromEntries(STEP_LIST.map((s) => [s.id, s]))
export const STEP_IDS: string[] = STEP_LIST.map((s) => s.id)

/** Sekiz karar ya da strateji oluşturma (9). */
export function decisionOf(n: number): DecisionDef | undefined {
  if (n === STRATEGY_N) return STRATEGY
  return DECISIONS.find((d) => d.n === n)
}
/** Adımın ekranda görünen grup adı: "Karar 3. Erişim ve seçenek" ya da "Strateji oluşturma". */
export function groupLabel(n: number): string {
  const d = decisionOf(n)
  if (n === STRATEGY_N) return STRATEGY.title
  return d ? `Karar ${n}. ${d.title}` : `Karar ${n}`
}
/**
 * Adımın ekranda görünen kısa adı. Kodu olan adım kodunu taşır: "2.1". Kodu olmayan adım "Adım 19" diye görünür.
 * Ekranlar adım numarasını kendisi yazmaz, buradan okur.
 */
export function stepName(id: string): string {
  const code = STEPS[id]?.code
  return code ?? `Adım ${id}`
}
/** Adımın tam başlığı: "2.1. Teşhis" ya da "Adım 12. Yapabilirlik ve kaynak". */
export function stepHeading(id: string): string {
  const s = STEPS[id]
  return s ? `${stepName(id)}. ${s.title}` : stepName(id)
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
