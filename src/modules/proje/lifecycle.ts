/** Proje verisi plan kapsamlıdır. Plan silinince silinir, dosyayla taşınır. */
import { createPlanScopedLifecycle } from '@/platform/planScoped'

export default createPlanScopedLifecycle('proje', 1)
