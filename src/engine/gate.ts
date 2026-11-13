import type { GateDef } from '@/data/schema'
import type { Decision, Outcome, PlanDoc } from '@/data/types'

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
  if (!d) return false
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
