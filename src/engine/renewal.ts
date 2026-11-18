/**
 * Stratejiyi sınama ve yenileme (alt aşama 3.5).
 * Soru şudur: "Seçim hâlâ doğru mu?" Karar sahibi üç karardan birini verir: sürdür, düzelt ya da yeniden aç.
 * "Yeniden aç" kararı işi strateji oluşturmaya geri götürür. Uygulama durmaz, eski seçimle sürer.
 * Yazılım bu kararı vermez ve önermez.
 */
import type { ChoiceHolds, PlanDoc, RenewalDecision, StrategyReview } from '@/data/types'
import { EXECUTION_DECISIONS } from '@/data/stages'
import { markStale } from './changes'
import { decisionLocked } from './gate'
import { uid } from './format'
import { DOSSIER_STEP } from './strategy'

export const REVIEW_REASON_MIN = 20

export interface ReviewDraft {
  decidedBy: string
  holds?: ChoiceHolds
  decision?: RenewalDecision
  reason: string
  evidence?: string
}

export function lastStrategyReview(plan: PlanDoc): StrategyReview | undefined {
  const list = plan.strategyReviews ?? []
  return list[list.length - 1]
}

export { strategyReopened } from './gate'

/** Gözden geçirme kaydı kapalı mı? Strateji uygulama kilitliyken kayıt yapılmaz. */
export function reviewBlocked(plan: PlanDoc | undefined): string | null {
  if (!plan) return 'Önce bir plan açın.'
  return decisionLocked(plan, EXECUTION_DECISIONS[0]) ? 'Gözden geçirme kaydı, strateji belgesi onaylanınca açılır.' : null
}

/** Kayıttan önce aranan koşullar. Her satır kullanıcıya gösterilen tam cümledir. */
export function validateReview(draft: ReviewDraft): string[] {
  const errors: string[] = []
  if (!draft.holds) errors.push('"Seçim hâlâ doğru mu?" sorusunu cevaplayın.')
  if (!draft.decision) errors.push('Bir karar seçin: sürdür, düzelt ya da yeniden aç.')
  if (draft.holds === 'hayir' && draft.decision === 'surdur') errors.push('Seçim artık doğru değilse "Sürdür" kararı verilemez. "Düzelt" ya da "Yeniden aç" seçin.')
  if (draft.holds === 'evet' && draft.decision === 'yenidenAc') errors.push('Seçim hâlâ doğruysa "Yeniden aç" kararı verilemez. "Sürdür" ya da "Düzelt" seçin.')
  if (draft.reason.trim().length < REVIEW_REASON_MIN) errors.push(`Gerekçeyi en az ${REVIEW_REASON_MIN} harfle yazın.`)
  if (!draft.decidedBy.trim()) errors.push('Karar sahibinin adını yazın.')
  return errors
}

/**
 * Kaydı plana yazar. "Yeniden aç" kararında strateji belgesi taslağa döner ve uygulama kontrollerinin kararları eskir.
 * Geçersiz taslak yazılmaz. O durumda null döner.
 */
export function applyStrategyReview(plan: PlanDoc, draft: ReviewDraft, now = new Date()): StrategyReview | null {
  if (validateReview(draft).length || reviewBlocked(plan)) return null
  plan.revision += 1
  const record: StrategyReview = {
    id: uid('gozden'),
    decidedAt: now.toISOString(),
    decidedBy: draft.decidedBy.trim(),
    holds: draft.holds!,
    decision: draft.decision!,
    reason: draft.reason.trim(),
    evidence: draft.evidence?.trim() || undefined,
    revision: plan.revision,
  }
  plan.strategyReviews = [...(plan.strategyReviews ?? []), record]
  if (record.decision === 'yenidenAc') {
    /* Strateji belgesi taslağa döner ve yeni onay ister. Eski onay kayıtta saklanır. */
    const dossier = plan.steps[DOSSIER_STEP]
    if (dossier) {
      const by = typeof dossier.values.approvedBy === 'string' ? dossier.values.approvedBy.trim() : ''
      const at = typeof dossier.values.approvedAt === 'string' ? dossier.values.approvedAt : ''
      if (by) record.clearedApproval = at ? `${by}, ${at.slice(0, 10)}` : by
      dossier.values = { ...dossier.values, approvedBy: '', approvedAt: undefined }
      dossier.status = 'taslak'
    }
    delete plan.legacyStrategy
    markStale(plan, EXECUTION_DECISIONS[0])
  }
  return record
}
