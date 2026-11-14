/**
 * Veri bütünlüğü. Bir adımın verisi değişince ona dayanan kararlar eskir.
 * Sınır değişiklikleri kayda geçer. Tek kurucuda artış ikinci görüş ister.
 * Bu dosyadaki işlevler planı yerinde değiştirir ve "değişti mi?" döndürür.
 */
import { STRATEGY_N } from '@/data/decisions'
import { STEPS } from '@/data/registry'
import { EXECUTION_DECISIONS, FOUNDATION_DECISIONS } from '@/data/stages'
import type { ChangeRecord, Limits, PlanDoc, Profile, StepRecord, StepValues } from '@/data/types'
import { uid } from './format'

export const LIMITS_STEP = '02'

/** Değişiklik kaydında görünen Türkçe alan adları. */
export const CHANGE_LABELS: Record<string, string> = {
  budgetKurus: 'Toplam harcama sınırı',
  deadline: 'Bitiş tarihi',
  retriesPerDecision: 'Karar başına deneme hakkı',
  cashKurus: 'Elinizdeki para',
  monthlyBurnKurus: 'Aylık zorunlu gider',
  stopRules: 'Durdurma kuralları',
  successSentence: 'Başarı cümlesi',
  hoursPerWeek: 'Haftalık çalışma saati',
  extraIncome: 'Başka gelir',
  horizon: 'Üç yıllık beklenti',
}

/** Kayda geçen sınır alanları. */
export const LIMIT_CHANGE_KEYS: (keyof Limits)[] = ['budgetKurus', 'deadline', 'retriesPerDecision', 'cashKurus', 'monthlyBurnKurus', 'stopRules', 'successSentence']

export function jsonEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null)
}

function filled(v: unknown): boolean {
  return v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)
}

/**
 * Adım değişince eskiyen ilk kapı. Profil ve sınırlar 1. karara bağlıdır.
 * Strateji çalışmasının adımları (19 ve 20) süreçte Karar 6'dan önce gelir.
 * Bu adımlar değişince Kapı 6, 7 ve 8'in kararları eskir. Geçiş kararı eskimez.
 */
export function gateOfStep(step: string): number {
  const n = STEPS[step]?.decision ?? 1
  return n === STRATEGY_N ? EXECUTION_DECISIONS[0] : n
}

export function isSingleFounder(plan: PlanDoc): boolean {
  return plan.profile.team !== 'ekip'
}

/** Bütçe ve deneme artışı ile tarih ertelemesi "artış" sayılır. */
export function isIncrease(key: string, before: unknown, after: unknown): boolean {
  if (key === 'budgetKurus' || key === 'retriesPerDecision') return Number(after) > Number(before)
  if (key === 'deadline') return typeof after === 'string' && typeof before === 'string' && after > before
  return false
}

const LAST_FOUNDATION = FOUNDATION_DECISIONS[FOUNDATION_DECISIONS.length - 1]

/** Geçiş kapısının son kararını eskitir. Eskittiyse 1 döndürür. */
function staleTransition(plan: PlanDoc): number {
  const t = plan.transitions?.[plan.transitions.length - 1]
  if (!t || t.stale) return 0
  t.stale = true
  return 1
}

/**
 * Bir temel kapısı yeniden karara bağlandı. Ondan sonraki her şey eskir.
 * Sonraki kapıların kararları eskir. Kapı temel aşamasındaysa geçiş kararı da eskir.
 */
export function markStaleAfterGate(plan: PlanDoc, gate: number): number {
  const transition = gate <= LAST_FOUNDATION ? staleTransition(plan) : 0
  return transition + markStale(plan, gate + 1)
}

/** Verilen kapıya eşit ya da sonraki kapıların son kararları eskir. Eskiyen karar sayısını döndürür. */
export function markStale(plan: PlanDoc, fromGate: number): number {
  // Temel aşaması (Karar 1-5) değişince geçiş kapısının son kararı da eskir.
  let count = fromGate <= LAST_FOUNDATION ? staleTransition(plan) : 0
  const seen = new Set<number>()
  for (let i = plan.decisions.length - 1; i >= 0; i--) {
    const d = plan.decisions[i]
    if (d.gate < fromGate || seen.has(d.gate)) continue
    seen.add(d.gate)
    if (!d.stale) {
      d.stale = true
      count++
    }
  }
  return count
}

/**
 * Önceki ve sonraki değerleri karşılaştırır. Değişen alan için kayıt yazar.
 * İlk doldurma kayıt değildir. Aynı geçiş iki kez yazılmaz.
 */
export function recordChanges(plan: PlanDoc, step: string, before: Record<string, unknown>, after: Record<string, unknown>, keys?: readonly string[]): ChangeRecord[] {
  const list = keys ?? Array.from(new Set([...Object.keys(before), ...Object.keys(after)]))
  const written: ChangeRecord[] = []
  plan.changes ??= []
  for (const key of list) {
    const b = before[key]
    const a = after[key]
    if (!filled(b) || jsonEqual(a, b)) continue
    const last = [...plan.changes].reverse().find((c) => c.step === step && c.key === key)
    if (last && jsonEqual(last.before, b) && jsonEqual(last.after, a)) continue
    const rec: ChangeRecord = {
      id: uid('degisiklik'),
      step,
      key,
      label: CHANGE_LABELS[key] ?? key,
      before: b,
      after: a,
      at: new Date().toISOString(),
      needsReview: isSingleFounder(plan) && isIncrease(key, b, a),
    }
    plan.changes.push(rec)
    written.push(rec)
  }
  return written
}

export function applyStepValues(plan: PlanDoc, step: string, values: StepValues, status?: StepRecord['status']): boolean {
  const prev = plan.steps[step]
  const merged = { ...(prev?.values ?? {}), ...values }
  const nextStatus = status ?? (prev?.status === 'tamam' ? 'tamam' : 'taslak')
  const valuesChanged = !jsonEqual(prev?.values ?? {}, merged)
  if (!valuesChanged && prev?.status === nextStatus) return false
  plan.steps[step] = { values: merged, status: nextStatus, updatedAt: new Date().toISOString() }
  if (valuesChanged) {
    if (step === LIMITS_STEP) recordChanges(plan, LIMITS_STEP, prev?.values ?? {}, merged)
    markStale(plan, gateOfStep(step))
  }
  return true
}

export function applyLimits(plan: PlanDoc, patch: Partial<Limits>): boolean {
  const before = { ...plan.limits } as Record<string, unknown>
  const after = { ...plan.limits, ...patch } as Record<string, unknown>
  const keys = Object.keys(patch)
  if (keys.every((k) => jsonEqual(before[k], after[k]))) return false
  Object.assign(plan.limits, patch)
  recordChanges(plan, LIMITS_STEP, before, after, keys.filter((k) => (LIMIT_CHANGE_KEYS as string[]).includes(k)))
  markStale(plan, 1)
  return true
}

export function applyProfile(plan: PlanDoc, patch: Partial<Profile>): boolean {
  const before = plan.profile as Record<string, unknown>
  const keys = Object.keys(patch) as (keyof Profile)[]
  if (keys.every((k) => jsonEqual(before[k], patch[k]))) return false
  Object.assign(plan.profile, patch)
  markStale(plan, 1)
  return true
}

export function applySkip(plan: PlanDoc, step: string, reason: string): boolean {
  const prev = plan.steps[step]
  if (prev?.status === 'atlandi' && prev.skipReason === reason) return false
  plan.steps[step] = { values: prev?.values ?? {}, status: 'atlandi', skipReason: reason, updatedAt: new Date().toISOString() }
  markStale(plan, gateOfStep(step))
  return true
}

/** İkinci görüş bekleyen açık değişiklikler. */
export function openReviews(plan: PlanDoc): ChangeRecord[] {
  return (plan.changes ?? []).filter((c) => c.needsReview && !c.reviewer)
}

/** Planda karar vermiş kişilerin adları. İnceleyen bu kişilerden biri olamaz. */
export function founderNames(plan: PlanDoc): string[] {
  return Array.from(new Set(plan.decisions.map((d) => d.decidedBy.trim().toLocaleLowerCase('tr-TR')).filter(Boolean)))
}

/** Görüşü kaydeder. Sorun varsa Türkçe hata metni döndürür. */
export function reviewChange(plan: PlanDoc, id: string, reviewer: string): string | null {
  const name = reviewer.trim()
  if (!name) return 'İnceleyen kişinin adını yazın.'
  if (founderNames(plan).includes(name.toLocaleLowerCase('tr-TR'))) return 'İnceleyen kişi kararı veren kurucu ile aynı olamaz.'
  const rec = (plan.changes ?? []).find((c) => c.id === id)
  if (!rec) return 'Değişiklik kaydı bulunamadı.'
  rec.reviewer = name
  rec.reviewedAt = new Date().toISOString()
  return null
}
