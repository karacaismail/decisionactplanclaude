import type { DecisionDef, StepDef } from './schema'
import { DECISIONS } from './decisions'
import { STEP_LIST } from './steps'

export const STEPS: Record<string, StepDef> = Object.fromEntries(STEP_LIST.map((s) => [s.id, s]))
export const STEP_IDS: string[] = STEP_LIST.map((s) => s.id)

export function decisionOf(n: number): DecisionDef | undefined {
  return DECISIONS.find((d) => d.n === n)
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
