import type { StepDef } from '../schema'
import { KARAR1 } from './karar1'
import { KARAR2 } from './karar2'
import { KARAR3 } from './karar3'
import { KARAR4 } from './karar4'
import { KARAR5 } from './karar5'
import { KARAR6 } from './karar6'
import { KARAR7 } from './karar7'
import { KARAR8 } from './karar8'
import { STRATEJI_SECIM_ONCESI, STRATEJI_SECIM_SONRASI, UYGULAMA_PLANI } from './strateji'

/** Seçim adımı (2.4) ve strateji belgesi KARAR5 dosyasındadır. Yeni adımlar süreç sırasına göre araya girer. */
const choiceAt = KARAR5.findIndex((s) => s.id === '19')
const dossierAt = KARAR5.findIndex((s) => s.id === '20')

/**
 * Bütün adımlar süreç sırasıyla.
 * Strateji öncesi (Adım 00-18), strateji oluşturma (2.1-2.5 ve strateji belgesi), strateji uygulama (3.1-3.3, sonra Adım 21-34).
 */
export const STEP_LIST: StepDef[] = [
  ...KARAR1,
  ...KARAR2,
  ...KARAR3,
  ...KARAR4,
  ...KARAR5.slice(0, choiceAt),
  ...STRATEJI_SECIM_ONCESI,
  ...KARAR5.slice(choiceAt, dossierAt),
  ...STRATEJI_SECIM_SONRASI,
  ...KARAR5.slice(dossierAt),
  ...UYGULAMA_PLANI,
  ...KARAR6,
  ...KARAR7,
  ...KARAR8,
]
