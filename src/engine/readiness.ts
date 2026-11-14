import { DECISIONS } from '@/data/decisions'
import type { PlanDoc, TransitionOutcome } from '@/data/types'
import { gatePassed } from './gate'
import { effectiveTransition, lastTransition, transitionPassed } from './transition'

/* Geçiş kuralının tek kaynağı transition.ts dosyasıdır. Eski içe aktarmalar çalışsın diye buradan da verilir. */
export { effectiveTransition, lastTransition, transitionPassed }

/**
 * Stratejik planlamaya geçiş motoru.
 * Yazılım öneri üretir. Kararı karar sahibi kaydeder.
 * Kural docs/stratejik-planlama-oncesi-bosluk-ve-eylem-plani.md dosyasındadır.
 */
export interface ReadinessCriterion {
  id: string
  label: string
  /** true: karşılandı, false: karşılanmadı, null: ölçülmedi. */
  met: boolean | null
  /** Dayanak adım. Eksikse kullanıcı buraya gider. */
  step: string
  hint: string
}

export interface ReadinessEvaluation {
  mandatory: ReadinessCriterion[]
  supporting: ReadinessCriterion[]
  mandatoryMet: number
  supportingMet: number
  suggested: TransitionOutcome
  reasons: string[]
  /** Kararı etkileyen uyarılar. Örneğin çürüyen varsayım. */
  warnings: string[]
  level: number
}

export const SUPPORTING_MIN = 4

const v = (p: PlanDoc, step: string, key: string): unknown => p.steps[step]?.values?.[key]
const rows = (p: PlanDoc, step: string, key: string): Record<string, unknown>[] => (v(p, step, key) as Record<string, unknown>[]) ?? []
const filled = (x: unknown): boolean => (typeof x === 'string' ? x.trim().length > 0 : Array.isArray(x) ? x.length > 0 : x !== null && x !== undefined && x !== false)

/** Bir kapı ölçütünün sonucu. Ölçüt yoksa null. */
function crit(plan: PlanDoc, gate: number, id: string): boolean | null {
  const def = DECISIONS.find((d) => d.n === gate)?.gate.criteria.find((c) => c.id === id)
  return def ? def.check(plan) : null
}
const both = (...xs: (boolean | null)[]): boolean | null => (xs.some((x) => x === false) ? false : xs.every((x) => x === true) ? true : null)

export function evaluateReadiness(plan: PlanDoc, opts: { secondReader?: string } = {}): ReadinessEvaluation {
  const strongEvidence = plan.evidence.filter((e) => e.ladder >= 1 && e.ladder <= 3).length
  const assumptions = rows(plan, '10', 'assumptions').filter((a) => filled(a.assumption))
  const refuted = assumptions.filter((a) => a.status === 'curudu')
  /** Etkisi yüksek (4 ya da 5) ve çürümüş, karşılığında ne değiştiği yazılmamış varsayım. */
  const refutedOpen = refuted.filter((a) => Number(a.impact ?? 0) >= 4 && !filled(a.resultNote))
  const problemEvidence = plan.evidence.filter((e) => e.linkedSteps.some((st) => st === '05' || st === '06' || st === '07')).length
  const gatesOk = [1, 2, 3, 4, 5].every((n) => gatePassed(plan, n))
  const limitsOk = (plan.limits.stopRules?.length ?? 0) >= 3 && Boolean(plan.limits.budgetKurus && plan.limits.deadline && plan.limits.retriesPerDecision)

  const mandatory: ReadinessCriterion[] = [
    { id: 'Z1', label: 'Kaynak sınırı ve durdurma kuralları yazılı.', met: plan.steps['02'] || limitsOk ? limitsOk : null, step: '02', hint: 'Bütçe, bitiş tarihi, deneme hakkı ve en az üç durdurma kuralı gerekir.' },
    {
      id: 'Z2',
      label: 'Sorun en az bir ölçüyle doğrulandı. Kanıt defterinde kaydı var.',
      met: (() => {
        const measured = both(crit(plan, 2, 'tanima'), crit(plan, 2, 'kanit'))
        if (measured !== true) return measured
        return problemEvidence > 0
      })(),
      step: '07',
      hint: 'Görüşmelerde sorunun tanınması ve tekrar, çaba, kayıp ölçülerinden biri gerekir. Adım 05, 06 ya da 07\'ye bağlı en az bir kanıt kaydı da gerekir.',
    },
    { id: 'Z3', label: 'İlk müşteri grubu ve ulaşma yolu yazılı.', met: crit(plan, 2, 'segment'), step: '08', hint: 'Kime, hangi yoldan ulaşacağınızı yazın.' },
    { id: 'Z4', label: 'Ulaşılabilir pazar başarı hedefini karşılıyor.', met: crit(plan, 3, 'pazar'), step: '09', hint: 'Bir yılda kazanabileceğiniz müşteri sayısı hedefe yetmeli.' },
    { id: 'Z5', label: 'Yol adayları yan yana yazıldı. Bugünkü durum ve en az iki yol var.', met: crit(plan, 5, 'yol'), step: '18', hint: 'Stratej bu adaylar arasından seçer. Ağır yatırımda en az üç yol gerekir.' },
    {
      id: 'Z6',
      label: 'En az bir bağlılık işareti var. Kanıt 1, 2 ya da 3. basamakta.',
      met: (() => {
        const esik = crit(plan, 4, 'esik')
        if (esik !== true) return esik
        return strongEvidence > 0 ? true : false
      })(),
      step: '15',
      hint: 'Ödeme, ön sipariş, kapora, imzalı niyet yazısı ya da imzalı deneme sayılır. Kanıt defterinde güçlü bir kayıt da gerekir.',
    },
    { id: 'Z7', label: 'İlk para hesabı yapıldı. Hesabın hangi koşulda tuttuğu yazılı.', met: both(crit(plan, 5, 'plan'), crit(plan, 5, 'kasa'), plan.steps['16'] ? filled(v(plan, '16', 'fragileNumber')) : null), step: '16', hint: 'Katkı payı artı olmalı. Kasa eksiye düşmemeli. İşi batıran sayıyı yazın.' },
    {
      id: 'Z8',
      label: 'Kritik riskler için kural var. Varsayımlar listelendi. Çürüyen kritik varsayım karşılıksız değil.',
      met: both(crit(plan, 5, 'risk'), plan.steps['10'] ? assumptions.length >= 3 : null, plan.steps['10'] ? refutedOpen.length === 0 : null),
      step: refutedOpen.length > 0 ? '10' : '17',
      hint: 'Her kritik risk için "şu olursa şunu yaparım" cümlesi ve en az üç varsayım gerekir. Etkisi yüksek bir varsayım çürüdüyse ne değiştirdiğinizi sonuç notuna yazın.',
    },
    { id: 'Z9', label: 'İlk beş kapının kararı geçerli. Zarar ya da izin engeli yok.', met: plan.decisions.length === 0 ? null : gatesOk, step: '17', hint: 'Her kapının son kararı "İlerle" ya da süresi dolmamış "Koşullu ilerle" olmalı.' },
  ]

  const price = Number(v(plan, '15', 'priceOfferedKurus') ?? 0)
  const accepted = Number(v(plan, '15', 'priceAcceptedCount') ?? 0)
  const supporting: ReadinessCriterion[] = [
    { id: 'D1', label: 'Fiyat ayrı bir denemeyle sınandı.', met: plan.steps['15'] ? price > 0 && accepted >= 1 : null, step: '15', hint: 'Teklif ettiğiniz fiyatı ve bu fiyatı kabul eden kişi sayısını yazın.' },
    { id: 'D2', label: 'Rakip ve bugünkü çözüm tablosu dolu.', met: plan.steps['09'] ? rows(plan, '09', 'competitors').length >= 2 : null, step: '09', hint: 'En az iki rakip ya da ikame yazın.' },
    { id: 'D3', label: 'İlk kanal bir kez denendi.', met: plan.steps['15'] ? Number(v(plan, '15', 'reached') ?? 0) >= 1 : null, step: '15', hint: 'Kaç kişiye hangi yoldan ulaştığınızı yazın.' },
    { id: 'D4', label: 'Eksik beceriler için plan var.', met: crit(plan, 3, 'beceri'), step: '12', hint: 'Her kritik beceri için "kim yapacak" cevabı gerekir.' },
    { id: 'D5', label: 'Dış çevre taraması yapıldı.', met: plan.steps['04'] ? plan.steps['04'].status === 'tamam' : null, step: '04', hint: 'İzinler ve dışarıdaki değişimler Adım 04\'te yazılır.' },
    { id: 'D6', label: 'İkinci bir kişi dayanakları okudu.', met: opts.secondReader?.trim() ? true : false, step: '17', hint: 'Okuyan kişinin adını karar panelinde yazın.' },
    { id: 'D7', label: 'Kritik belirsizlikler ve senaryolar yazıldı.', met: plan.steps['04'] ? filled(v(plan, '04', 'uncertainty1')) && rows(plan, '04', 'scenarios').length >= 2 : null, step: '04', hint: 'İki belirsizlik ve en az iki senaryo yazın. Ağır yatırımda dört senaryo beklenir.' },
  ]

  const mandatoryMet = mandatory.filter((c) => c.met === true).length
  const supportingMet = supporting.filter((c) => c.met === true).length
  const reasons: string[] = []
  const warnings: string[] = []
  if (refutedOpen.length > 0) warnings.push(`${refutedOpen.length} kritik varsayım çürüdü ve karşılığı yazılmadı. Varsayımlar ekranında sonuç notunu yazın.`)
  else if (refuted.length > 0) warnings.push(`${refuted.length} varsayım çürüdü. Strateji çalışmasında bu varsayıma dayanmayın.`)
  let suggested: TransitionOutcome
  if (mandatoryMet < mandatory.length) {
    suggested = 'degil'
    const missing = mandatory.filter((c) => c.met !== true)
    reasons.push(`${missing.length} zorunlu ölçüt eksik: ${missing.map((c) => c.id).join(', ')}.`)
  } else if (supportingMet >= SUPPORTING_MIN) {
    suggested = 'hazir'
    reasons.push('Zorunlu ölçütlerin hepsi tamam. Destekleyici ölçütler yeterli.')
  } else {
    suggested = 'kosullu'
    reasons.push(`Zorunlu ölçütler tamam. Destekleyici ölçütlerin ${supportingMet} tanesi karşılandı, en az ${SUPPORTING_MIN} gerekir.`)
  }
  return { mandatory, supporting, mandatoryMet, supportingMet, suggested, reasons, warnings, level: validationLevel(plan) }
}

export const LEVELS = [
  { level: 0, title: 'Fikir', description: 'Henüz kanıt yok.' },
  { level: 1, title: 'Sınır konuldu', description: 'Kapı 1 geçildi.' },
  { level: 2, title: 'Sorun doğrulandı', description: 'Kapı 2 geçildi.' },
  { level: 3, title: 'Yol seçildi', description: 'Kapı 3 geçildi.' },
  { level: 4, title: 'Talep doğrulandı', description: 'Kapı 4 geçildi.' },
  { level: 5, title: 'Hesap tutuyor', description: 'Kapı 5 geçildi. Para, risk ve yol adayları tamam.' },
] as const

/** Doğrulama seviyesi 0 ile 5 arasıdır. Kapılar sırayla geçilmelidir. */
export function validationLevel(plan: PlanDoc): number {
  let level = 0
  for (const n of [1, 2, 3, 4, 5]) {
    if (!gatePassed(plan, n)) break
    level = n
  }
  return level
}


export interface TransitionDraft {
  outcome: TransitionOutcome
  reason: string
  decidedBy: string
  reviewed: boolean
  secondOpinion?: string
  conditional?: { topic: string; openQuestion: string; owner: string; deadline: string }
}

export const TRANSITION_OVERRIDE_MIN = 20

/** Kayıt engellerini döndürür. Boş liste kayda izin verir. */
export function validateTransition(plan: PlanDoc, evaluation: ReadinessEvaluation, draft: TransitionDraft): string[] {
  const errors: string[] = []
  if (!draft.reason.trim()) errors.push('Gerekçeyi yazın.')
  if (!draft.decidedBy.trim()) errors.push('Karar sahibini yazın.')
  if (!draft.reviewed) errors.push('"Strateje devir raporunu okudum" kutusunu işaretleyin.')
  if (evaluation.suggested === 'degil' && draft.outcome !== 'degil') errors.push('Zorunlu ölçüt eksikken yalnız "Henüz hazır değil" kaydedilir.')
  if (evaluation.suggested === 'kosullu' && draft.outcome === 'hazir') {
    if (!draft.secondOpinion?.trim()) errors.push('Öneriyi aşmak için ikinci görüş sahibini yazın.')
    if (draft.reason.trim().length < TRANSITION_OVERRIDE_MIN) errors.push(`Öneriyi aşmak için gerekçe en az ${TRANSITION_OVERRIDE_MIN} karakter olmalı.`)
  }
  if (draft.outcome === 'kosullu') {
    const c = draft.conditional
    if (!c?.topic.trim()) errors.push('Planlanacak konuyu yazın.')
    if (!c?.openQuestion.trim()) errors.push('Açık soruyu yazın.')
    if (!c?.owner.trim()) errors.push('Açık sorunun sorumlusunu yazın.')
    if (!c?.deadline) errors.push('Son tarihi seçin.')
    if (c?.deadline && plan.limits.deadline && c.deadline.slice(0, 10) > plan.limits.deadline.slice(0, 10)) errors.push('Son tarih planın bitiş tarihini geçemez.')
  }
  const open = (plan.changes ?? []).filter((c) => c.needsReview && !c.reviewer)
  if (open.length > 0 && draft.outcome !== 'degil') errors.push(`${open.length} sınır değişikliği ikinci görüş bekliyor.`)
  return errors
}
