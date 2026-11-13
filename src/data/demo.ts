import { emptyPlan, type PlanDoc } from './types'

/** Örnek plan. Ekranları tanıtır. Kullanıcı verisi değildir. */
export function buildDemoPlan(): PlanDoc {
  const p = emptyPlan('ornek-mahalle-kafesi', 'Örnek: Mahalle kafesi')
  p.example = true
  return p
}
