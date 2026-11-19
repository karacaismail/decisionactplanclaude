/**
 * Başvuru verisi ve destek profili plan kapsamlıdır. Program listesi plana bağlı değildir.
 * Plan silinince, dışa aktarılınca ve içe alınınca ortak plan kapsamlı yaşam döngüsü çalışır.
 * İçe almadan sonra plan özeti asıl veriden yeniden hesaplanır.
 */
import { createPlanScopedLifecycle } from '@/platform/planScoped'
import type { ModuleLifecycle } from '@/platform/types'
import { MODUL_ID, ozetiYenile } from './depo'
import manifest from './manifest'

const ortak = createPlanScopedLifecycle(MODUL_ID, manifest.schemaVersion)

const lifecycle: ModuleLifecycle = {
  ...ortak,
  async onPlanImported(idMap) {
    for (const planId of new Set(Object.values(idMap))) await ozetiYenile(planId)
  },
}

export default lifecycle
