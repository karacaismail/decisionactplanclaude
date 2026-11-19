/**
 * Destek özetinin çekirdek okuyucusu. Saf işlevlerdir.
 * Özeti destek modülü yazar. Çekirdek modülü içe aktarmaz. Özeti yalnız altyapının özet deposundan okur.
 * Destek parası beklenen paradır. Kesin değildir. Bu yüzden hiçbir bütçe toplamına girmez.
 */

/** Özeti yazan modülün kimliği. */
export const SUPPORT_MODULE_ID = 'destek'

export interface SupportRollup {
  total: number
  /** Duruma göre başvuru sayısı. Anahtar modülün durum adıdır. */
  statuses: Record<string, number>
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isCount = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0

export function parseSupportRollup(value: unknown): SupportRollup | undefined {
  if (!isRecord(value) || value.v !== 1 || !isCount(value.toplam) || !isRecord(value.durumlar)) return undefined
  const statuses: Record<string, number> = {}
  for (const [key, n] of Object.entries(value.durumlar)) if (isCount(n)) statuses[key] = n
  return { total: value.toplam, statuses }
}

/** Bilinen durumlar ekrandaki sırayla. Her durum tek bir cümle olur. */
const STATUS_TEXT: readonly [string, (n: number) => string][] = [
  ['hazirlaniyor', (n) => `${n} başvuru hazırlanıyor.`],
  ['basvuruldu', (n) => `${n} başvuru gönderildi.`],
  ['sonuc_bekleniyor', (n) => `${n} başvuru sonuç bekliyor.`],
  ['kabul', (n) => `${n} başvuru kabul edildi.`],
  ['ret', (n) => `${n} başvuru reddedildi.`],
  ['vazgecildi', (n) => `${n} başvurudan vazgeçildi.`],
]

export interface SupportLines {
  total: string
  statuses: string[]
}

/** 3.3 adımındaki satırın metinleri. Sıfır olan durum yazılmaz. */
export function supportLines(r: SupportRollup): SupportLines {
  const known = new Set(STATUS_TEXT.map(([key]) => key))
  const statuses = STATUS_TEXT.filter(([key]) => (r.statuses[key] ?? 0) > 0).map(([key, text]) => text(r.statuses[key]))
  const other = Object.entries(r.statuses).filter(([key]) => !known.has(key)).reduce((sum, [, n]) => sum + n, 0)
  if (other > 0) statuses.push(`${other} başvuru başka bir durumda.`)
  return { total: `Destek başvuruları: ${r.total}`, statuses }
}
