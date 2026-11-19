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

function parse(raw: string | null | undefined): RollupFile {
  try {
    const parsed = raw ? (JSON.parse(raw) as RollupFile) : null
    if (parsed && parsed.v === 1 && parsed.data && typeof parsed.data === 'object') return parsed
  } catch {
    /* Bozuk özet atılır. Modül özeti yeniden hesaplar. */
  }
  return { v: 1, data: {} }
}

function read(storage: Storage | undefined): RollupFile {
  try {
    return parse(storage?.getItem(ROLLUP_KEY))
  } catch {
    return parse(null)
  }
}

type Listener = () => void
const listeners = new Set<Listener>()
let storageListening = false

function emit() {
  for (const listener of [...listeners]) {
    try {
      listener()
    } catch (error) {
      console.error('Özet bildirimi işlenemedi.', error)
    }
  }
}

function write(file: RollupFile, storage: Storage | undefined) {
  storage?.setItem(ROLLUP_KEY, JSON.stringify(file))
  emit()
}

/**
 * Özet değişince haber verir. Bu sekmedeki yazma ve öteki sekmedeki yazma haber olur.
 * Dönen işlev aboneliği kapatır. Çekirdek ekranı etiketleri bu haberle yeniler.
 */
export function subscribeRollups(listener: Listener): () => void {
  listeners.add(listener)
  if (!storageListening && typeof window !== 'undefined') {
    storageListening = true
    window.addEventListener('storage', (event) => {
      if (event.key === ROLLUP_KEY || event.key === null) emit()
    })
  }
  return () => {
    listeners.delete(listener)
  }
}

/** Özet deposunun ham metni. Metin değişmedikçe aynı değer döner. React aboneliği bunu kullanır. */
export function readRollupRaw(storage = browserStorage()): string | null {
  try {
    return storage?.getItem(ROLLUP_KEY) ?? null
  } catch {
    return null
  }
}

/** Ham metindeki özeti okur. Bozuk metinde undefined döner. */
export function readRollupFrom<T = unknown>(raw: string | null, moduleId: string, planId: string): T | undefined {
  const byPlan = parse(raw).data[moduleId]
  return byPlan && Object.prototype.hasOwnProperty.call(byPlan, planId) ? (byPlan[planId] as T) : undefined
}

export function readRollup<T = unknown>(moduleId: string, planId: string, storage = browserStorage()): T | undefined {
  return readRollupFrom<T>(readRollupRaw(storage), moduleId, planId)
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
