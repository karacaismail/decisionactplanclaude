/**
 * Geçiş kapısının kararı. Kuralın tek kaynağı budur.
 * Kilit (gate.ts), hazırlık motoru (readiness.ts) ve ekranlar bu dosyayı kullanır.
 */
import type { PlanDoc, TransitionOutcome, TransitionRecord } from '@/data/types'

/** Geçiş kapısının son kararı. */
export function lastTransition(plan: PlanDoc): TransitionRecord | undefined {
  return plan.transitions?.[plan.transitions.length - 1]
}

/** Koşullu kararın son tarihi geçtiyse sonuç "Henüz hazır değil" sayılır. */
export function effectiveTransition(t: TransitionRecord, now = new Date()): TransitionOutcome {
  if (t.outcome === 'kosullu' && t.conditional && new Date(t.conditional.deadline) < now) return 'degil'
  return t.outcome
}

/** Strateji çalışması açılabilir mi? Karar eskidiyse ya da süresi geçtiyse açılmaz. */
export function transitionPassed(plan: PlanDoc, now = new Date()): boolean {
  const t = lastTransition(plan)
  if (!t || t.stale) return false
  const o = effectiveTransition(t, now)
  return o === 'hazir' || o === 'kosullu'
}
