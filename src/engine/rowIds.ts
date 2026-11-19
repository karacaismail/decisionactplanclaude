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
 *
 * Hedef takibi 3.2 adımının "Şimdi" işlerine bağlanır. Bağın anahtarı işin kimliğidir.
 * Kimliksiz işin anahtarı "satir-<sıra>" idi. Bu yüzden:
 * 1. "Şimdi" listesi önce işlenir. Kimliği olan iş kimliğini hep korur.
 * 2. Kimliksiz iş kimlik alınca bağın anahtarı da yeni kimliğe taşınır.
 */
export function stampRowIds(plan: PlanDoc): PlanDoc {
  const lists: { step: string; key: string; rows: unknown[] }[] = []
  for (const [step, keys] of Object.entries(ROW_ID_FIELDS)) {
    const values = plan.steps?.[step]?.values
    if (!values) continue
    for (const key of keys) if (Array.isArray(values[key])) lists.push({ step, key, rows: values[key] as unknown[] })
  }
  lists.sort((a, b) => Number(isOkrList(b)) - Number(isOkrList(a)))
  const renamed = new Map<string, string>()
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
      /* Aynı anahtarı gerçek kimlik olarak taşıyan iş varsa bağ o işindir. Bağ taşınmaz. */
      if (isOkrList({ step, key }) && !hasId(row) && !existing.has(`satir-${index}`)) renamed.set(`satir-${index}`, id)
      row._id = id
    })
  }
  if (renamed.size) moveOkrLinks(plan, renamed)
  return plan
}

/** Hedef takibinin bağladığı liste: 3.2 adımının "Şimdi" işleri. */
function isOkrList(l: { step: string; key: string }): boolean {
  return l.step === 'U32' && l.key === 'now'
}

/** Hedef takibi bağlarının anahtarını yeni kimliğe taşır. Var olan bağın üstüne yazmaz. */
function moveOkrLinks(plan: PlanDoc, renamed: Map<string, string>) {
  for (const period of plan.okr?.periods ?? []) {
    const links = period.taskLinks
    if (!links) continue
    for (const [from, to] of renamed) {
      if (!(from in links) || to in links) continue
      links[to] = links[from]
      delete links[from]
    }
  }
}
