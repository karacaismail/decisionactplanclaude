/**
 * Küçük modül özetleri. Pano ve plan kartı özeti hemen okur. IndexedDB beklenmez.
 * Özetler tek bir localStorage anahtarında durur. Her özet en çok 4 KB olur.
 * Özet asıl veri değildir. Modül özeti asıl veriden yeniden hesaplayabilmelidir.
 */
export const ROLLUP_KEY = 'decisionactplan-rollups-v1'
export const MAX_ROLLUP_BYTES = 4096

interface RollupFile {
  v: 1
  data: Record<string, Record<string, unknown>>
}

const browserStorage = (): Storage | undefined => {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

function read(storage: Storage | undefined): RollupFile {
  try {
    const raw = storage?.getItem(ROLLUP_KEY)
    const parsed = raw ? (JSON.parse(raw) as RollupFile) : null
    if (parsed && parsed.v === 1 && parsed.data && typeof parsed.data === 'object') return parsed
  } catch {
    /* Bozuk özet atılır. Modül özeti yeniden hesaplar. */
  }
  return { v: 1, data: {} }
}

function write(file: RollupFile, storage: Storage | undefined) {
  storage?.setItem(ROLLUP_KEY, JSON.stringify(file))
}

export function readRollup<T = unknown>(moduleId: string, planId: string, storage = browserStorage()): T | undefined {
  return read(storage).data[moduleId]?.[planId] as T | undefined
}

/** Özeti yazar. 4 KB sınırını aşan özet reddedilir. */
export function writeRollup(moduleId: string, planId: string, value: unknown, storage = browserStorage()): void {
  const size = new TextEncoder().encode(JSON.stringify(value) ?? '').length
  if (size > MAX_ROLLUP_BYTES) throw new Error(`Özet çok büyük: ${size} bayt. Sınır ${MAX_ROLLUP_BYTES} bayttır.`)
  const file = read(storage)
  file.data[moduleId] = { ...(file.data[moduleId] ?? {}), [planId]: value }
  write(file, storage)
}

/** Planın bütün modül özetlerini siler. */
export function removePlanRollups(planId: string, storage = browserStorage()): void {
  const file = read(storage)
  let changed = false
  for (const byPlan of Object.values(file.data)) {
    if (planId in byPlan) {
      delete byPlan[planId]
      changed = true
    }
  }
  if (changed) write(file, storage)
}
