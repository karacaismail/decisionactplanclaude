/**
 * Çekirdek ile modüller arasındaki okuma sözleşmesi. Saf TypeScript kodudur.
 * Modüller planı yalnız bu dosyadaki tipler ve seçicilerle okur.
 * Seçiciler yeni nesne döndürür. Dönen nesneyi değiştirmek planı değiştirmez.
 * Bu dosya yalnız @/data/types ve saf seçicileri içe aktarabilir. Sınır kapısı bunu denetler.
 */
import type { PlanDoc } from '@/data/types'
import { goalOf, movesOf, resourcesOf, tasksOf, type CapabilityState } from '@/engine/strategy'
import { planPosition } from '@/engine/position'

/** İç içe her alanı salt okunur yapan tip. */
export type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer U)[]
    ? readonly DeepReadonly<U>[]
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T

/** Modüllerin gördüğü plan. Salt okunurdur. */
export type ReadonlyPlan = DeepReadonly<PlanDoc>

/* Seçiciler salt okunur planı değiştirmez. Çekirdek okuyucuları yazılabilir tip ister. */
const asPlan = (plan: ReadonlyPlan) => plan as PlanDoc

export type PlanStage = 'temel' | 'gecis' | 'strateji' | 'uygulama' | 'bitti'

export interface PlanSummaryDto {
  id: string
  name: string
  example: boolean
  updatedAt: string
  /** Sıradaki işin bölümü. */
  stage: PlanStage
  /** Strateji belgesi onaylandı ve yeniden açılmadı mı? */
  strategyApproved: boolean
}

export interface MoveDto {
  /** Kalıcı satır kimliği. Proje bu kimlikle hamleye bağlanır. */
  rowId: string
  move: string
  serves: string | null
  capability: string | null
  have: CapabilityState | null
}

export interface KeyResultDto {
  rowId: string
  name: string
  baseline: string | null
  target: string | null
}

export interface GoalDto {
  objective: string | null
  keyResults: KeyResultDto[]
}

export type TaskHorizon = 'now' | 'next' | 'later'

export interface ExecutionTaskDto {
  rowId: string
  horizon: TaskHorizon
  action: string
  owner: string | null
  dueDate: string | null
}

export interface ResourceDto {
  rowId: string
  item: string
  budgetKurus: number | null
  people: string | null
}

export function isStrategyApproved(plan: ReadonlyPlan): boolean {
  return planPosition(asPlan(plan)).strategyComplete
}

export function selectPlanSummary(plan: ReadonlyPlan): PlanSummaryDto {
  const position = planPosition(asPlan(plan))
  return { id: plan.id, name: plan.name, example: Boolean(plan.example), updatedAt: plan.updatedAt, stage: position.stage, strategyApproved: position.strategyComplete }
}

export function selectStrategyMoves(plan: ReadonlyPlan): MoveDto[] {
  return movesOf(asPlan(plan)).map((m) => ({ rowId: m.id, move: m.move, serves: m.serves, capability: m.capability, have: m.have }))
}

export function selectGoal(plan: ReadonlyPlan): GoalDto {
  const goal = goalOf(asPlan(plan))
  return { objective: goal.objective, keyResults: goal.indicators.map((k) => ({ rowId: k.id, name: k.name, baseline: k.baseline, target: k.target })) }
}

export function selectExecutionTasks(plan: ReadonlyPlan): ExecutionTaskDto[] {
  const horizons: TaskHorizon[] = ['now', 'next', 'later']
  return horizons.flatMap((horizon) => tasksOf(asPlan(plan), horizon).map((t) => ({ rowId: t.id, horizon, action: t.action, owner: t.owner, dueDate: t.dueDate })))
}

export function selectResources(plan: ReadonlyPlan): ResourceDto[] {
  return resourcesOf(asPlan(plan)).map((r) => ({ rowId: r.id, item: r.item, budgetKurus: r.budgetKurus, people: r.people }))
}
