/**
 * Proje yaşam döngüsünün çekirdeği. Plan kapsamlı ortak yaşam döngüsünü sarar.
 * İçe almadan önce dilim denetlenir. Bozuk dilim yazılmaz.
 * İçe almadan sonra yeni planın özeti yeniden hesaplanır.
 */
import type { ModuleLifecycle } from '@/platform/types'
import { dilimiDogrula } from './domain/dilim'

export function createProjeLifecycle(base: ModuleLifecycle, ayar: { ozetiYenile: (planId: string) => Promise<unknown> }): ModuleLifecycle {
  return {
    onPlanDeleted: (planId) => base.onPlanDeleted?.(planId),
    exportSlice: (planId) => base.exportSlice?.(planId),
    async importSlice(slice, idMap) {
      const hedefler = Object.values(idMap)
      if (hedefler.length !== 1 || !hedefler[0]) throw new Error('Proje verisi tek bir plana yazılabilir.')
      await base.importSlice?.(dilimiDogrula(slice, hedefler[0]), idMap)
    },
    async onPlanImported(idMap) {
      await base.onPlanImported?.(idMap)
      for (const planId of Object.values(idMap)) await ayar.ozetiYenile(planId)
    },
  }
}
