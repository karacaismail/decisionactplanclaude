/**
 * Kalıcı satır kimlikleri. Modüller hamle, gösterge, iş ve kaynak satırlarına bu kimlikle bağlanır.
 * Satırın sırası değişse de kimliği değişmez.
 * Taşıma yalnız kimliği eksik satıra kimlik yazar. Adım durumu, sürüm, tarih ve eskime işareti değişmez.
 */
import type { PlanDoc } from '@/data/types'

/** Kimlik alan tekrarlı alanlar. Anahtar adım kimliği, değer o adımın satır listeleridir. */
export const ROW_ID_FIELDS: Readonly<Record<string, readonly string[]>> = {
  S25: ['moves'],
  U31: ['keyResults'],
  U32: ['now', 'next', 'later'],
  U33: ['resources'],
}

type Row = Record<string, unknown>
const isRow = (x: unknown): x is Row => typeof x === 'object' && x !== null && !Array.isArray(x)

/** Kimliği olmayan satırın kimliği. Aynı adım, alan ve sıra hep aynı kimliği verir. */
export function fallbackRowId(step: string, key: string, index: number): string {
  return `r-${step.toLowerCase()}-${key.toLowerCase()}-${index}`
}

/** Satırın kimliği. Kayıtlı kimlik varsa o döner. */
export function rowIdOf(row: unknown, step: string, key: string, index: number): string {
  const id = isRow(row) ? row._id : undefined
  return typeof id === 'string' && id ? id : fallbackRowId(step, key, index)
}

/** Kimliği eksik satırlara kimlik yazar. Planı yerinde değiştirir ve döndürür. İki kez çalışınca sonuç değişmez. */
export function stampRowIds(plan: PlanDoc): PlanDoc {
  for (const [step, keys] of Object.entries(ROW_ID_FIELDS)) {
    const values = plan.steps?.[step]?.values
    if (!values) continue
    for (const key of keys) {
      const rows = values[key]
      if (!Array.isArray(rows)) continue
      const used = new Set(rows.map((r) => (isRow(r) && typeof r._id === 'string' ? r._id : '')).filter(Boolean))
      rows.forEach((row, index) => {
        if (!isRow(row) || (typeof row._id === 'string' && row._id)) return
        let id = fallbackRowId(step, key, index)
        for (let n = 2; used.has(id); n++) id = `${fallbackRowId(step, key, index)}-${n}`
        used.add(id)
        row._id = id
      })
    }
  }
  return plan
}
