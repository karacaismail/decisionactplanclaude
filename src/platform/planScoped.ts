/**
 * Plan kapsamlı yaşam döngüsü. Verisini "<modül>/<plan>/<kayıt>" anahtarında tutan modül bunu kullanır.
 * Plan silinince veri silinir. Dışa aktarmada veri dilim olur. İçe almada yeni plan kimliğine yazılır.
 */
import { getDefaultKvStore, scopedKvStore, type KvStore } from './kv'
import { publishModuleChange } from './broadcast'
import type { ModuleLifecycle, PlanIdMap } from './types'

export interface PlanSlice {
  schemaVersion: number
  /** [kayıt anahtarı, değer] çiftleri. Anahtar plan kimliğini taşımaz. */
  entries: [string, unknown][]
}

const SAFE_KEY = /^[\p{L}\p{N}][\p{L}\p{N}._-]*(\/[\p{L}\p{N}][\p{L}\p{N}._-]*)*$/u

function onlyTarget(idMap: PlanIdMap): string {
  const targets = Object.values(idMap)
  if (targets.length !== 1 || !targets[0]) throw new Error('Modül verisi tek bir plana yazılabilir.')
  return targets[0]
}

export function createPlanScopedLifecycle(moduleId: string, schemaVersion: number, getBase: () => KvStore = getDefaultKvStore): ModuleLifecycle {
  const store = () => scopedKvStore(getBase(), moduleId)
  return {
    async onPlanDeleted(planId) {
      if (await store().deletePrefix(`${planId}/`)) publishModuleChange({ moduleId, planId })
    },
    async exportSlice(planId): Promise<PlanSlice | undefined> {
      const s = store()
      const keys = await s.keys(`${planId}/`)
      if (!keys.length) return undefined
      const entries: [string, unknown][] = []
      for (const key of keys) entries.push([key.slice(planId.length + 1), await s.get(key)])
      return { schemaVersion, entries }
    },
    async importSlice(slice, idMap) {
      const data = slice as Partial<PlanSlice> | null
      if (!data || typeof data !== 'object' || !Array.isArray(data.entries)) throw new Error(`"${moduleId}" modülünün verisi okunamadı.`)
      if (data.schemaVersion !== schemaVersion) throw new Error(`"${moduleId}" modülünün veri sürümü desteklenmiyor. Dosyadaki sürüm: ${String(data.schemaVersion)}.`)
      for (const entry of data.entries) {
        if (!Array.isArray(entry) || entry.length !== 2 || typeof entry[0] !== 'string' || !SAFE_KEY.test(entry[0])) throw new Error(`"${moduleId}" modülünün verisinde geçersiz kayıt var.`)
      }
      const planId = onlyTarget(idMap)
      const s = store()
      for (const [key, value] of data.entries as [string, unknown][]) await s.set(`${planId}/${key}`, value)
      publishModuleChange({ moduleId, planId })
    },
  }
}
