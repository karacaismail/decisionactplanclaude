/**
 * Modül deposu. Modüller veriyi PlanDoc içine yazmaz. Veri bu anahtar ve değer deposunda durur.
 * Tarayıcıda IndexedDB kullanılır. Yeni bağımlılık yoktur. Testte bellek deposu kullanılır.
 * Anahtar biçimi: "<modül>/<plan>/<kayıt>". Böylece bir planın bütün verisi tek önekle silinir.
 */
import { publishModuleChange } from './broadcast'

export interface KvStore {
  get<T = unknown>(key: string): Promise<T | undefined>
  set(key: string, value: unknown): Promise<void>
  delete(key: string): Promise<void>
  /** Anahtarları sıralı verir. Önek verilirse yalnız o önekle başlayanlar gelir. */
  keys(prefix?: string): Promise<string[]>
  /** Önekle başlayan kayıtları siler. Silinen kayıt sayısını döndürür. */
  deletePrefix(prefix: string): Promise<number>
  /** Veri tarayıcı kapanınca da kalıyor mu? Bellek deposunda false olur. */
  readonly persistent: boolean
}

export const DB_NAME = 'decisionactplan-modules'
const DB_VERSION = 1
const STORE = 'kv'
/** Önek aralığının üst sınırı için en büyük karakter. */
const HIGH = '￿'

function assertKey(key: string) {
  if (typeof key !== 'string' || !key) throw new Error('Kayıt anahtarı boş olamaz.')
}

const READ_FAILED = 'Kayıtlı bilgiler okunamadı. Kayıt silinmedi. Sayfayı yeniden yükleyin.'
const WRITE_FAILED = 'Değişiklik kaydedilemedi. Önceki kayıt duruyor. Yeniden deneyin.'

const byCodeUnit = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)

/** Bellek deposu. Değerleri kopya olarak saklar. Sayfa kapanınca veri kaybolur. */
export function createMemoryKvStore(): KvStore {
  const map = new Map<string, unknown>()
  return {
    persistent: false,
    async get<T>(key: string) {
      return map.has(key) ? (structuredClone(map.get(key)) as T) : undefined
    },
    async set(key, value) {
      assertKey(key)
      map.set(key, structuredClone(value))
    },
    async delete(key) {
      map.delete(key)
    },
    async keys(prefix = '') {
      return [...map.keys()].filter((k) => k.startsWith(prefix)).sort(byCodeUnit)
    },
    async deletePrefix(prefix) {
      let n = 0
      for (const k of [...map.keys()]) if (k.startsWith(prefix) && map.delete(k)) n++
      return n
    },
  }
}

function request<T>(req: IDBRequest<T>, failure: string): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error(failure))
  })
}

/** IndexedDB deposu. Veritabanı ilk kullanımda açılır. Başka sekme sürüm yükseltirse bağlantı kapanır ve yeniden açılır. */
export function createIndexedDbKvStore(factory: IDBFactory, name = DB_NAME): KvStore {
  let opening: Promise<IDBDatabase> | undefined
  const open = () => {
    opening ??= new Promise<IDBDatabase>((resolve, reject) => {
      const req = factory.open(name, DB_VERSION)
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE)
      }
      req.onsuccess = () => {
        const db = req.result
        db.onversionchange = () => {
          db.close()
          opening = undefined
        }
        resolve(db)
      }
      req.onerror = () => {
        opening = undefined
        reject(req.error ?? new Error('Kayıtlı bilgiler açılamadı. Kayıt silinmedi. Sayfayı yeniden yükleyin.'))
      }
      req.onblocked = () => {
        opening = undefined
        reject(new Error('Kayıtlı bilgiler başka bir sekmede kilitli. Kayıt silinmedi. Öteki sekmeyi kapatıp yeniden deneyin.'))
      }
    })
    return opening
  }
  const tx = async <T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> => {
    const db = await open()
    const t = db.transaction(STORE, mode)
    /* Yazma ancak işlem tamamlanınca kalıcıdır. Dinleyici istekten önce bağlanır. */
    const done = new Promise<void>((resolve, reject) => {
      t.oncomplete = () => resolve()
      t.onerror = () => reject(t.error ?? new Error(WRITE_FAILED))
      t.onabort = () => reject(t.error ?? new Error('Kayıt yarıda kaldı. Önceki kayıt duruyor. Yeniden deneyin.'))
    })
    /* İstek hata verirse işlem de hata verir. Bu ikinci hata yutulur. İlk hata çağırana gider. */
    done.catch(() => undefined)
    const result = await request(run(t.objectStore(STORE)), mode === 'readwrite' ? WRITE_FAILED : READ_FAILED)
    if (mode === 'readwrite') await done
    return result
  }
  const range = (prefix: string) => (prefix ? IDBKeyRange.bound(prefix, prefix + HIGH) : undefined)
  return {
    persistent: true,
    async get<T>(key: string) {
      return (await tx('readonly', (s) => s.get(key))) as T | undefined
    },
    async set(key, value) {
      assertKey(key)
      await tx('readwrite', (s) => s.put(value, key))
    },
    async delete(key) {
      await tx('readwrite', (s) => s.delete(key))
    },
    async keys(prefix = '') {
      const keys = await tx('readonly', (s) => s.getAllKeys(range(prefix)))
      return keys.map(String).filter((k) => k.startsWith(prefix)).sort(byCodeUnit)
    },
    async deletePrefix(prefix) {
      if (!prefix) throw new Error('Toplu silme için önek gerekir.')
      /* Sayma ve silme aynı işlemdedir. Arada yazılan kayıt sayımın dışında kalmaz. */
      let count = 0
      await tx('readwrite', (s) => {
        const counting = s.count(range(prefix))
        counting.onsuccess = () => {
          count = counting.result
        }
        return s.delete(range(prefix)!)
      })
      return count
    },
  }
}

/** Tarayıcıda IndexedDB varsa onu, yoksa bellek deposunu verir. */
export function createDefaultKvStore(factory: IDBFactory | undefined = typeof indexedDB === 'undefined' ? undefined : indexedDB): KvStore {
  return factory ? createIndexedDbKvStore(factory) : createMemoryKvStore()
}

/** Anahtarlara "<kapsam>/" öneki ekler. Kapsam dışındaki kayıtları göstermez. */
export function scopedKvStore(base: KvStore, scope: string): KvStore {
  if (!scope || scope.includes('/')) throw new Error('Kapsam adı boş olamaz ve "/" içeremez.')
  const p = `${scope}/`
  return {
    persistent: base.persistent,
    get: (key) => base.get(p + key),
    set: (key, value) => {
      assertKey(key)
      return base.set(p + key, value)
    },
    delete: (key) => base.delete(p + key),
    keys: async (prefix = '') => (await base.keys(p + prefix)).map((k) => k.slice(p.length)),
    deletePrefix: (prefix) => base.deletePrefix(p + prefix),
  }
}

let defaultStore: KvStore | undefined

/** Uygulamanın ortak deposu. İlk istekte kurulur. */
export function getDefaultKvStore(): KvStore {
  defaultStore ??= createDefaultKvStore()
  return defaultStore
}

/** Testler ortak depoyu bellek deposuyla değiştirir. */
export function setDefaultKvStore(store: KvStore): void {
  defaultStore = store
}

/**
 * Modülün kendi deposu. Yazma ve silme öteki sekmelere bildirilir.
 * Anahtar "<plan>/<kayıt>" biçimindedir. Plan kimliği bildirimde kullanılır.
 */
export function moduleStore(moduleId: string): KvStore {
  const scoped = () => scopedKvStore(getDefaultKvStore(), moduleId)
  const notify = (key: string) => publishModuleChange({ moduleId, planId: key.split('/')[0] })
  return {
    get persistent() {
      return getDefaultKvStore().persistent
    },
    get: (key) => scoped().get(key),
    set: async (key, value) => {
      await scoped().set(key, value)
      notify(key)
    },
    delete: async (key) => {
      await scoped().delete(key)
      notify(key)
    },
    keys: (prefix) => scoped().keys(prefix),
    deletePrefix: async (prefix) => {
      const n = await scoped().deletePrefix(prefix)
      if (n) notify(prefix)
      return n
    },
  }
}
