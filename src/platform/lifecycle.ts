/**
 * Plan yaşam döngüsü olaylarını modüllere iletir. Çekirdek bu işlevleri çağırır.
 * Bir modülün hatası öteki modülleri ve planı durdurmaz. Hata konsola ve uyarı listesine yazılır.
 */
import { MODULES } from './modules'
import { removePlanRollups } from './rollups'
import type { ModuleLifecycle, ModuleManifest, PlanIdMap } from './types'

type PlanListener = (planId: string) => void
const deletedListeners = new Set<PlanListener>()
const pending = new Set<Promise<unknown>>()

/** Çekirdeğin kendi temizliği için dinleyici. Örneğin plan taslakları. */
export function addPlanDeletedListener(listener: PlanListener): () => void {
  deletedListeners.add(listener)
  return () => {
    deletedListeners.delete(listener)
  }
}

async function lifecycleOf(m: ModuleManifest): Promise<ModuleLifecycle | undefined> {
  return m.lifecycle ? (await m.lifecycle()).default : undefined
}

function track<T>(work: Promise<T>): Promise<T> {
  pending.add(work)
  void work.finally(() => pending.delete(work)).catch(() => undefined)
  return work
}

/** Bekleyen yaşam döngüsü işleri bitince çözülür. Testler ve dışa aktarma bunu bekler. */
export async function lifecycleSettled(): Promise<void> {
  while (pending.size) await Promise.allSettled([...pending])
}

/** Plan silindi. Modül verisi, özetler ve çekirdek dinleyicileri temizlenir. */
export function notifyPlanDeleted(planId: string): Promise<string[]> {
  return track((async () => {
    const warnings: string[] = []
    for (const listener of deletedListeners) {
      try {
        listener(planId)
      } catch (error) {
        console.error(error)
        warnings.push('Plan taslakları silinemedi.')
      }
    }
    try {
      removePlanRollups(planId)
    } catch (error) {
      console.error(error)
    }
    for (const m of MODULES) {
      try {
        await (await lifecycleOf(m))?.onPlanDeleted?.(planId)
      } catch (error) {
        console.error(error)
        warnings.push(`"${m.title}" verisi silinemedi.`)
      }
    }
    return warnings
  })())
}

/** Planın modül dilimlerini toplar. Verisi olmayan modül listeye girmez. */
export async function collectModuleSlices(planId: string): Promise<Record<string, unknown>> {
  await lifecycleSettled()
  const slices: Record<string, unknown> = {}
  for (const m of MODULES) {
    const slice = await (await lifecycleOf(m))?.exportSlice?.(planId)
    if (slice !== undefined && slice !== null) slices[m.id] = slice
  }
  return slices
}

/** Dosyadaki modül dilimlerini yazar ve içe alma olayını bildirir. Uyarı listesi döndürür. */
export function restoreModuleSlices(slices: Readonly<Record<string, unknown>>, idMap: PlanIdMap): Promise<string[]> {
  return track((async () => {
    const warnings: string[] = []
    for (const id of Object.keys(slices)) {
      if (!MODULES.some((m) => m.id === id)) warnings.push(`Dosyadaki "${id}" verisi bu sürümde tanınmıyor. Bu veri alınmadı.`)
    }
    for (const m of MODULES) {
      try {
        const life = await lifecycleOf(m)
        if (m.id in slices) {
          if (life?.importSlice) await life.importSlice(slices[m.id], idMap)
          else warnings.push(`"${m.title}" verisi içe alınamıyor.`)
        }
        await life?.onPlanImported?.(idMap)
      } catch (error) {
        console.error(error)
        warnings.push(error instanceof Error ? error.message : `"${m.title}" verisi alınamadı.`)
      }
    }
    return warnings
  })())
}
