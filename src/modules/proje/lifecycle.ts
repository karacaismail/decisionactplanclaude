/**
 * Proje verisi plan kapsamlıdır. Plan silinince silinir. Dosyayla taşınır.
 * İçe alınan dilim önce denetlenir. Sonra yeni planın özeti yenilenir.
 */
import { createPlanScopedLifecycle } from '@/platform/planScoped'
import { VERI_SURUMU } from './domain/model'
import { createProjeLifecycle } from './lifecycleCore'
import { MODUL_KIMLIGI, projeDepo } from './projeDepo'

export default createProjeLifecycle(createPlanScopedLifecycle(MODUL_KIMLIGI, VERI_SURUMU), {
  ozetiYenile: async (planId) => {
    /* Projesi olmayan plana boş özet yazılmaz. */
    if ((await projeDepo.projeler(planId)).length) await projeDepo.ozetiYenile(planId)
  },
})
