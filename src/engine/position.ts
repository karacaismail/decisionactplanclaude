import { STRATEGY_N } from '@/data/decisions'
import { stepsOf } from '@/data/registry'
import type { StepDef } from '@/data/schema'
import { EXECUTION_DECISIONS, FOUNDATION_DECISIONS, type StageKey } from '@/data/stages'
import type { PlanDoc } from '@/data/types'
import { stepApplies } from './conditions'
import { gatePassed, strategyDone, strategyReopened } from './gate'
import { transitionPassed, validationLevel } from './readiness'

/**
 * Planın yol üzerindeki yeri. Tek kaynak budur.
 * Sıra: temel kapıları, geçiş kapısı, strateji oluşturma, uygulama kapıları.
 * Pano, planlar ekranı, menü ve kilit kuralı aynı sırayı kullanır.
 */
export interface PlanPosition {
  /** Sıradaki işin bölümü. Bütün kapılar geçildiyse 'bitti'. */
  stage: StageKey | 'bitti'
  /** Sıradaki iş bir kararsa numarası. */
  decision?: number
  /** Doğrulama seviyesi, 0 ile 5 arası. */
  level: number
  /** Tamamlanan strateji adımı sayısı. Yalnız gösterim içindir. */
  strategyDone: number
  strategyTotal: number
  /** Strateji oluşturma kural olarak bitti mi? Kilit bu değere bakar. */
  strategyComplete: boolean
}

function visibleSteps(plan: PlanDoc, n: number): StepDef[] {
  return stepsOf(n).filter((s) => stepApplies(s.mandatory, plan) !== 'gizli' && (!plan.shortPath || s.shortPath))
}

export function planPosition(plan: PlanDoc): PlanPosition {
  const strategy = visibleSteps(plan, STRATEGY_N)
  const done = strategy.filter((s) => {
    const status = plan.steps[s.id]?.status
    return status === 'tamam' || status === 'atlandi'
  }).length
  /* Yeniden açılan strateji bitmiş sayılmaz. Sıradaki iş strateji oluşturmadır. */
  const complete = strategyDone(plan) && !strategyReopened(plan)
  const base = { level: validationLevel(plan), strategyDone: done, strategyTotal: strategy.length, strategyComplete: complete }
  const openFoundation = FOUNDATION_DECISIONS.find((n) => !gatePassed(plan, n))
  if (openFoundation) return { ...base, stage: 'temel', decision: openFoundation }
  if (!transitionPassed(plan)) return { ...base, stage: 'gecis' }
  if (!complete) return { ...base, stage: 'strateji' }
  const openExecution = EXECUTION_DECISIONS.find((n) => !gatePassed(plan, n))
  if (openExecution) return { ...base, stage: 'uygulama', decision: openExecution }
  return { ...base, stage: 'bitti' }
}
