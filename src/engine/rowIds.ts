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

/**
 * Kimliği eksik satırlara kimlik yazar. Planı yerinde değiştirir ve döndürür. İki kez çalışınca sonuç değişmez.
 * Kimlik plan içinde tektir. Eski sürüm her listede "satir-0" gibi aynı kimliği yazmış olabilir.
 * Aynı kimlik ikinci kez görülürse sonraki satır yeni kimlik alır. İlk satır kimliğini korur.
 */
export function stampRowIds(plan: PlanDoc): PlanDoc {
  const lists: { step: string; key: string; rows: unknown[] }[] = []
  for (const [step, keys] of Object.entries(ROW_ID_FIELDS)) {
    const values = plan.steps?.[step]?.values
    if (!values) continue
    for (const key of keys) if (Array.isArray(values[key])) lists.push({ step, key, rows: values[key] as unknown[] })
  }
  const hasId = (r: unknown): r is Row & { _id: string } => isRow(r) && typeof r._id === 'string' && r._id !== ''
  const existing = new Set(lists.flatMap((l) => l.rows.filter(hasId).map((r) => r._id)))
  const seen = new Set<string>()
  for (const { step, key, rows } of lists) {
    rows.forEach((row, index) => {
      if (!isRow(row)) return
      if (hasId(row) && !seen.has(row._id)) {
        seen.add(row._id)
        return
      }
      const base = fallbackRowId(step, key, index)
      let id = base
      for (let n = 2; seen.has(id) || existing.has(id); n++) id = `${base}-${n}`
      seen.add(id)
      row._id = id
    })
  }
  return plan
}
