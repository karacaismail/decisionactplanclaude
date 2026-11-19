/**
 * Uygulamanın proje deposu. Modül deposunu ve özet yazıcısını bağlar.
 * Depo yazınca öteki sekmeler haber alır. Bu işi moduleStore yapar.
 */
import { moduleStore } from '@/platform/kv'
import { writeRollup } from '@/platform/rollups'
import { createProjeDepo } from './depo'

export const MODUL_KIMLIGI = 'proje'

export const projeDepo = createProjeDepo({
  store: moduleStore(MODUL_KIMLIGI),
  ozetYaz: (planId, ozet) => writeRollup(MODUL_KIMLIGI, planId, ozet),
})
