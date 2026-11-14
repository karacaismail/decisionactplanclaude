import type { GateDef } from '@/data/schema'
import { OUTCOME_LABEL, type Decision, type Outcome, type PlanDoc } from '@/data/types'
import { formatMoney } from './format'

export const OUTCOME_PRIORITY: Outcome[] = ['durdur', 'beklet', 'yenidenDene', 'yonDegistir', 'kosulluIlerle', 'ilerle']

export interface GateEvaluation {
  criteria: Record<string, boolean | null>
  metCount: number
  total: number
  unknownCount: number
  suggested: Outcome
  matchedRow?: { condition: string; outcome: Outcome; note?: string }
  retriesLeft: number
  blockedOutcomes: Outcome[]
  reasons: string[]
}

export function retriesLeft(plan: PlanDoc, gate: number, max: number): number {
  const configured = plan.limits.retriesPerDecision ?? max
  const used = plan.decisions.filter((d) => d.gate === gate && d.chosen === 'yenidenDene').length
  return Math.max(0, Math.min(configured, max) - used)
}

export function lastDecision(plan: PlanDoc, gate: number): Decision | undefined {
  return [...plan.decisions].reverse().find((d) => d.gate === gate)
}

export function conditionalUsed(plan: PlanDoc, gate: number): boolean {
  return plan.decisions.some((d) => d.gate === gate && d.chosen === 'kosulluIlerle')
}

/** Koşullu izin süresi dolduysa sonuç kendiliğinden "beklet" olur. */
export function effectiveOutcome(d: Decision, now = new Date()): Outcome {
  if (d.chosen === 'kosulluIlerle' && d.conditional && !d.conditional.closedAt && new Date(d.conditional.deadline) < now) return 'beklet'
  return d.chosen
}

export function gatePassed(plan: PlanDoc, gate: number): boolean {
  const d = lastDecision(plan, gate)
  if (!d || d.stale) return false
  const o = effectiveOutcome(d)
  return o === 'ilerle' || o === 'kosulluIlerle'
}

export function evaluateGate(def: GateDef, plan: PlanDoc, flags: { harm?: boolean; permitMissing?: boolean } = {}): GateEvaluation {
  const criteria: Record<string, boolean | null> = {}
  for (const c of def.criteria) criteria[c.id] = c.check(plan)
  const vals = Object.values(criteria)
  const metCount = vals.filter((v) => v === true).length
  const unknownCount = vals.filter((v) => v === null).length
  const total = vals.length
  const left = retriesLeft(plan, def.n, def.maxRetries)
  const reasons: string[] = []
  const blocked: Outcome[] = []
  if (left <= 0) {
    blocked.push('yenidenDene')
    reasons.push('Bu kapıda deneme hakkı kalmadı.')
  }
  if (conditionalUsed(plan, def.n)) {
    blocked.push('kosulluIlerle')
    reasons.push('Bu kapıda koşullu izin daha önce kullanıldı. Aynı eksik için ikinci izin verilmez.')
  }

  let suggested: Outcome
  let matchedRow: GateEvaluation['matchedRow']
  if (flags.harm) {
    suggested = 'durdur'
    reasons.push('Ciddi zarar tehlikesi işaretlendi. Önce zarar kuralı uygulanır.')
  } else if (flags.permitMissing) {
    suggested = 'beklet'
    reasons.push('Gerekli izin veya yetki eksik. İzne bağlı iş açılmaz.')
  } else {
    const row = def.rows.find((r) => r.applies?.(plan, criteria))
    if (row) {
      suggested = row.outcome
      matchedRow = row
      reasons.push(`Uyan satır: ${row.condition}`)
    } else if (metCount === total && total > 0) {
      suggested = 'ilerle'
      reasons.push('Bütün ölçütler karşılandı.')
    } else if (unknownCount > 0 && left > 0) {
      suggested = 'yenidenDene'
      reasons.push(`${unknownCount} ölçüt henüz ölçülmedi. Küçük bir deneme ile ölçün.`)
    } else if (unknownCount > 0) {
      suggested = 'beklet'
      reasons.push(`${unknownCount} ölçüt ölçülmedi ve deneme hakkı bitti. Yeni bilgi gelene kadar bekletin ya da yön değiştirin.`)
    } else if (metCount >= Math.ceil(total * 0.6) && left > 0) {
      suggested = 'yenidenDene'
      reasons.push('Ölçütlerin çoğu karşılandı. Eksik olanı tamamlayın.')
    } else if (metCount === 0) {
      suggested = 'durdur'
      reasons.push('Hiçbir ölçüt karşılanmadı.')
    } else {
      suggested = 'yonDegistir'
      reasons.push('Ölçütlerin azı karşılandı. Varsayımı değiştirin.')
    }
    if (blocked.includes(suggested)) suggested = 'beklet'
  }
  return { criteria, metCount, total, unknownCount, suggested, matchedRow, retriesLeft: left, blockedOutcomes: blocked, reasons }
}

/** Kayıt öncesi karar taslağı. OutcomePanel aynı biçimi kullanır. */
export interface DecisionDraft {
  chosen: Outcome
  reason: string
  secondOpinion?: string
  decidedBy?: string
  conditional?: { scope: string; amountKurus: number; deadline: string; owner: string; closingEvidence: string }
}

export const OVERRIDE_REASON_MIN = 20

/** Koşullu izinlere bağlanmış toplam tutar. Harcanan sayılır. */
export function committedKurus(plan: PlanDoc): number {
  return plan.decisions.reduce((sum, d) => sum + (d.conditional?.amountKurus ?? 0), 0)
}

export function remainingBudgetKurus(plan: PlanDoc): number | null {
  const budget = plan.limits.budgetKurus
  if (budget === null || budget === undefined) return null
  return budget - committedKurus(plan)
}

/**
 * Kararın kaydedilebilir olup olmadığını denetler. Her engel Türkçe bir cümledir.
 * Boş dizi dönerse kayıt serbesttir.
 */
export function validateDecision(def: GateDef, plan: PlanDoc, evaluation: GateEvaluation, draft: DecisionDraft, opts: { harm?: boolean; now?: Date } = {}): string[] {
  const errors: string[] = []
  const chosen = draft.chosen
  const advancing = chosen === 'ilerle' || chosen === 'kosulluIlerle'

  if (opts.harm && chosen !== 'durdur') errors.push('Ciddi zarar tehlikesi işaretli. Yalnız "Durdur" seçilebilir.')

  if (chosen === 'ilerle' && evaluation.suggested !== 'ilerle') {
    const second = (draft.secondOpinion ?? '').trim().length > 0
    const reasonOk = draft.reason.trim().length >= OVERRIDE_REASON_MIN
    if (!second || !reasonOk) {
      errors.push(`Sistem "${OUTCOME_LABEL[evaluation.suggested]}" öneriyor. "İlerle" için ikinci görüş ve en az ${OVERRIDE_REASON_MIN} karakterlik gerekçe gerekir.`)
    }
  }

  if (chosen === 'yenidenDene' && evaluation.retriesLeft <= 0) errors.push('Bu kapıda deneme hakkı kalmadı. "Yeniden dene" seçilemez.')

  if (chosen === 'kosulluIlerle') {
    if (conditionalUsed(plan, def.n)) errors.push('Bu kapıda koşullu izin daha önce kullanıldı. İkinci izin verilmez.')
    const c = draft.conditional
    if (!c) errors.push('Koşullu izin için kapsam, tutar, bitiş, sorumlu ve kapanış kanıtı gerekir.')
    else {
      if (!c.scope.trim()) errors.push('Koşullu iznin kapsamını yazın.')
      if (!c.owner.trim()) errors.push('Koşullu iznin sorumlusunu yazın.')
      if (!c.closingEvidence.trim()) errors.push('Kapanış kanıtını yazın. Ne gelince iş kapanır?')
      if (!c.deadline) errors.push('Koşullu iznin bitiş tarihini seçin.')
      const remaining = remainingBudgetKurus(plan)
      if (remaining !== null && c.amountKurus > remaining) errors.push(`Tutar kalan bütçeyi aşıyor. Kalan bütçe ${formatMoney(remaining)}.`)
      if (c.deadline && plan.limits.deadline && c.deadline.slice(0, 10) > plan.limits.deadline.slice(0, 10)) errors.push('Koşullu iznin bitişi planın bitiş tarihini geçemez.')
    }
  }

  if (advancing && def.n === 6 && !transitionOpen(plan)) errors.push('Geçiş kapısı kararı yok. Önce geçiş kapısında karar kaydedin.')
  else if (advancing && def.n > 1 && def.n !== 6 && !gatePassed(plan, def.n - 1)) errors.push(`Kapı ${def.n - 1} henüz geçilmedi. Önce önceki kapıyı kapatın.`)

  if (advancing) {
    const open = (plan.changes ?? []).filter((c) => c.needsReview && !c.reviewer)
    if (open.length > 0) errors.push(`${open.length} sınır değişikliği ikinci görüş bekliyor. Görüş kaydedilmeden ilerlenmez.`)
  }

  return errors
}

/** Geçiş kapısının son kararı strateji çalışmasını açıyor mu? (readiness.ts ile aynı kural; döngüsel içe aktarma olmasın diye burada.) */
function transitionOpen(plan: PlanDoc, now = new Date()): boolean {
  const t = plan.transitions?.[plan.transitions.length - 1]
  if (!t || t.stale) return false
  if (t.outcome === 'hazir') return true
  return t.outcome === 'kosullu' && Boolean(t.conditional) && new Date(t.conditional!.deadline) >= now
}

/**
 * Bir karar ya da strateji çalışması (9) kilitli mi?
 * Karar 2-5 önceki kapıya, strateji çalışması ve Karar 6 geçiş kapısına, Karar 7-8 önceki kapıya bağlıdır.
 */
export function decisionLocked(plan: PlanDoc, n: number): boolean {
  if (n <= 1) return false
  if (n === 9 || n === 6) return !transitionOpen(plan)
  return !gatePassed(plan, n - 1)
}

/** Kilidin nedeni. Ekranda aynen gösterilir. */
export function lockReason(plan: PlanDoc, n: number): string | null {
  if (!decisionLocked(plan, n)) return null
  if (n === 9 || n === 6) return 'Geçiş kapısında "Planlamaya hazır" ya da "Koşullu hazır" kararı yok.'
  return `Kapı ${n - 1} henüz geçilmedi.`
}
