/**
 * Dosyaya aktarma ve dosyadan alma. İki biçim vardır:
 * 1. Eski düz plan dosyası. Modül verisi yoksa yazılım hâlâ bu biçimi yazar.
 * 2. Paket dosyası: { kind, bundleVersion, plan, modules }. Modül verisi varsa bu biçim yazılır.
 * İçe alma iki biçimi de kabul eder. Plan için 8 MB, paket için 32 MB sınırı vardır.
 */
import type { PlanDoc } from '@/data/types'
import { MAX_IMPORT_BYTES, validatePlanDoc } from '@/data/validate'
import { collectModuleSlices, lifecycleSettled, restoreModuleSlices } from '@/platform/lifecycle'
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

/**
 * Paket içe alma sınırına sığıyor mu? Sığmayan paket geri yüklenemez. Bu yüzden yazılmaz.
 * Düz plan dosyası eskisi gibi denetimsiz iner. Bu davranış çekirdeğindir ve değişmedi.
 */
export function assertImportable(file: PlanDoc | PlanBundle): void {
  if (!('kind' in file) || file.kind !== BUNDLE_KIND) return
  if (bytes(JSON.stringify(file.plan)) > MAX_IMPORT_BYTES) throw new Error('Plan 8 MB sınırını aşıyor. Bu paket geri yüklenemez.')
  if (bytes(JSON.stringify(file)) > MAX_BUNDLE_BYTES) throw new Error('Plan ve modül verisi 32 MB sınırını aşıyor. Bu paket geri yüklenemez.')
}

/** Planı ve modül verisini dışa aktarılacak biçimde toplar. Sınırı aşan dosyada Türkçe hata fırlatır. */
export async function exportPlanFile(plan: PlanDoc): Promise<PlanDoc | PlanBundle> {
  const file = buildExportFile(plan, await collectModuleSlices(plan.id))
  assertImportable(file)
  return file
}

/**
 * Dosyadaki örnek plan var olan örneğin yerine geçer mi?
 * Geçecekse ekran önce kişiye sorar. Örnek plan kimliğini korur ve eskisinin yerine yazılır.
 */
export function replacesExistingExample(plan: PlanDoc): boolean {
  return Boolean(plan.example) && Boolean(usePlanStore.getState().plans[plan.id])
}

/** Var olan örnek yeniden alınınca dosyadaki modül verisi alınmaz. Kişi bu uyarıyı görür. */
export const EXAMPLE_MODULES_KEPT = 'Dosyadaki proje ve destek verisi alınmadı. Örneğin şimdiki verisi korundu. Dosyadaki veriyi almak için önce örnek planı silin. Sonra dosyayı yeniden içe alın.'

/**
 * Çözülmüş dosyayı içe alır. Plan kopya olarak eklenir ve yeni kimlik alır.
 * Örnek plan kimliğini korur ve eskisinin yerine geçer. Bu durumda modül verisine dokunulmaz.
 * Örneğin şimdiki projeleri ve destek başvuruları olduğu gibi kalır. Dosyadaki modül verisi alınmaz.
 * Böylece eski dosya yeni kayıtların üzerine yazılmaz. Silinmiş kayıtlar da geri gelmez.
 * Önce bekleyen silme işleri biter. Böylece silinen planın temizliği yeni veriyi silmez.
 * Modül hatası planı geri almaz. Hata uyarı listesinde döner.
 */
export async function importParsedFile({ plan, modules }: { plan: PlanDoc; modules: Record<string, unknown> }): Promise<{ planId: string; warnings: string[] }> {
  await lifecycleSettled()
  const keepModules = replacesExistingExample(plan)
  const planId = usePlanStore.getState().importPlan(plan)
  const warnings = await restoreModuleSlices(keepModules ? {} : modules, { [plan.id]: planId })
  if (keepModules && Object.keys(modules).length) warnings.unshift(EXAMPLE_MODULES_KEPT)
  return { planId, warnings }
}

/** Dosya metnini çözer ve içe alır. Sorun varsa Türkçe hata fırlatır. */
export async function importPlanFile(text: string, byteLength?: number): Promise<{ planId: string; warnings: string[] }> {
  return importParsedFile(parseImportFile(text, byteLength))
}
