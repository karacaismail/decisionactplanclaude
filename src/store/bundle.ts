/**
 * Dosyaya aktarma ve dosyadan alma. İki biçim vardır:
 * 1. Eski düz plan dosyası. Modül verisi yoksa yazılım hâlâ bu biçimi yazar.
 * 2. Paket dosyası: { kind, bundleVersion, plan, modules }. Modül verisi varsa bu biçim yazılır.
 * İçe alma iki biçimi de kabul eder. Plan için 8 MB, paket için 32 MB sınırı vardır.
 */
import type { PlanDoc } from '@/data/types'
import { MAX_IMPORT_BYTES, validatePlanDoc } from '@/data/validate'
import { collectModuleSlices, restoreModuleSlices } from '@/platform/lifecycle'
import { usePlanStore } from './planStore'

export const BUNDLE_KIND = 'decisionactplan-bundle'
export const BUNDLE_VERSION = 1
export const MAX_BUNDLE_BYTES = 32 * 1024 * 1024

export interface PlanBundle {
  kind: typeof BUNDLE_KIND
  bundleVersion: typeof BUNDLE_VERSION
  plan: PlanDoc
  modules: Record<string, unknown>
}

const NOT_A_PLAN = 'Bu dosya bir plan dosyası değil. Plan dosyasını bu uygulamadan dışa aktarın.'
const TOO_BIG_PLAN = 'Dosya 8 MB sınırını aşıyor. Daha küçük bir plan dosyası seçin.'
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const bytes = (text: string) => new TextEncoder().encode(text).length

/** Dosya metnini çözer. Sorun varsa Türkçe hata fırlatır. Planı depoya yazmaz. */
export function parseImportFile(text: string, byteLength = bytes(text)): { plan: PlanDoc; modules: Record<string, unknown> } {
  if (byteLength > MAX_BUNDLE_BYTES) throw new Error('Dosya 32 MB sınırını aşıyor. Daha küçük bir dosya seçin.')
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Dosya okunamadı. Geçerli bir JSON dosyası seçin.')
  }
  if (isRecord(parsed) && parsed.kind === BUNDLE_KIND) {
    if (parsed.bundleVersion !== BUNDLE_VERSION) throw new Error('Bu paket dosyasının sürümü desteklenmiyor. Uygulamanın güncel sürümünü kullanın.')
    if (bytes(JSON.stringify(parsed.plan ?? null)) > MAX_IMPORT_BYTES) throw new Error(TOO_BIG_PLAN)
    if (!validatePlanDoc(parsed.plan)) throw new Error(NOT_A_PLAN)
    const modules = parsed.modules ?? {}
    if (!isRecord(modules)) throw new Error('Paketteki modül verisi okunamadı.')
    return { plan: parsed.plan, modules }
  }
  if (byteLength > MAX_IMPORT_BYTES) throw new Error(TOO_BIG_PLAN)
  if (!validatePlanDoc(parsed)) throw new Error(NOT_A_PLAN)
  return { plan: parsed, modules: {} }
}

/** Modül verisi yoksa düz planı, varsa paketi döndürür. Eski sürüm düz dosyayı okumaya devam eder. */
export function buildExportFile(plan: PlanDoc, modules: Record<string, unknown>): PlanDoc | PlanBundle {
  if (Object.keys(modules).length === 0) return plan
  return { kind: BUNDLE_KIND, bundleVersion: BUNDLE_VERSION, plan, modules }
}

/** Planı ve modül verisini dışa aktarılacak biçimde toplar. */
export async function exportPlanFile(plan: PlanDoc): Promise<PlanDoc | PlanBundle> {
  return buildExportFile(plan, await collectModuleSlices(plan.id))
}

/**
 * Dosyayı içe alır. Plan kopya olarak eklenir ve yeni kimlik alır.
 * Modül verisi yeni kimliğe taşınır. Modül hatası planı geri almaz. Hata uyarı listesinde döner.
 */
export async function importPlanFile(text: string, byteLength?: number): Promise<{ planId: string; warnings: string[] }> {
  const { plan, modules } = parseImportFile(text, byteLength)
  const planId = usePlanStore.getState().importPlan(plan)
  const warnings = await restoreModuleSlices(modules, { [plan.id]: planId })
  return { planId, warnings }
}
