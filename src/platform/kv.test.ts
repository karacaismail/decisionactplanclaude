import { describe, expect, it, vi } from 'vitest'
import { createDefaultKvStore, createMemoryKvStore, scopedKvStore, type KvStore } from './kv'
import { MAX_ROLLUP_BYTES, readRollup, removePlanRollups, ROLLUP_KEY, writeRollup } from './rollups'
import { publishModuleChange, subscribeModuleChanges } from './broadcast'

/** Her depo uygulaması aynı sözleşmeyi geçmelidir. */
function contract(name: string, make: () => KvStore) {
  describe(`${name} sözleşmesi`, () => {
    it('yazılan değeri okur, olmayan anahtarda undefined döner', async () => {
      const kv = make()
      expect(await kv.get('yok')).toBeUndefined()
      await kv.set('a', { n: 1 })
      expect(await kv.get('a')).toEqual({ n: 1 })
    })

    it('değeri kopya olarak saklar', async () => {
      const kv = make()
      const value = { list: [1] }
      await kv.set('a', value)
      value.list.push(2)
      const read = await kv.get<{ list: number[] }>('a')
      expect(read?.list).toEqual([1])
      read!.list.push(3)
      expect((await kv.get<{ list: number[] }>('a'))?.list).toEqual([1])
    })

    it('anahtarları sıralı ve öneke göre listeler', async () => {
      const kv = make()
      await kv.set('p1/b', 1)
      await kv.set('p1/a', 1)
      await kv.set('p2/a', 1)
      await kv.set('p10/a', 1)
      expect(await kv.keys('p1/')).toEqual(['p1/a', 'p1/b'])
      expect(await kv.keys()).toEqual(['p1/a', 'p1/b', 'p10/a', 'p2/a'])
    })

    it('silme ve önekle silme yalnız eşleşen kayıtları siler', async () => {
      const kv = make()
      await kv.set('p1/a', 1)
      await kv.set('p1/b', 1)
      await kv.set('p10/a', 1)
      await kv.delete('p1/a')
      expect(await kv.get('p1/a')).toBeUndefined()
      expect(await kv.deletePrefix('p1/')).toBe(1)
      expect(await kv.keys()).toEqual(['p10/a'])
    })

    it('kapsamlı depo başka kapsamı görmez', async () => {
      const base = make()
      const proje = scopedKvStore(base, 'proje')
      const destek = scopedKvStore(base, 'destek')
      await proje.set('p1/x', 'proje')
      await destek.set('p1/x', 'destek')
      expect(await proje.get('p1/x')).toBe('proje')
      expect(await proje.keys()).toEqual(['p1/x'])
      expect(await destek.deletePrefix('p1/')).toBe(1)
      expect(await proje.get('p1/x')).toBe('proje')
    })

    it('boş anahtarı reddeder', async () => {
      await expect(make().set('', 1)).rejects.toThrow()
    })
  })
}

contract('Bellek deposu', createMemoryKvStore)

describe('varsayılan depo', () => {
  it('IndexedDB yoksa bellek deposuna düşer ve bunu bildirir', () => {
    const store = createDefaultKvStore(undefined)
    expect(store.persistent).toBe(false)
  })
})

describe('özet kayıtları', () => {
  function memoryStorage(): Storage {
    const map = new Map<string, string>()
    return {
      get length() { return map.size },
      clear: () => map.clear(),
      getItem: (k) => map.get(k) ?? null,
      key: (i) => [...map.keys()][i] ?? null,
      removeItem: (k) => void map.delete(k),
      setItem: (k, v) => void map.set(k, String(v)),
    }
  }

  it('modül ve plan başına özet yazar ve okur', () => {
    const storage = memoryStorage()
    writeRollup('proje', 'p1', { acik: 3 }, storage)
    writeRollup('destek', 'p1', { uygun: 2 }, storage)
    expect(readRollup('proje', 'p1', storage)).toEqual({ acik: 3 })
    expect(JSON.parse(storage.getItem(ROLLUP_KEY)!).v).toBe(1)
  })

  it('planın bütün özetlerini siler', () => {
    const storage = memoryStorage()
    writeRollup('proje', 'p1', 1, storage)
    writeRollup('proje', 'p2', 2, storage)
    writeRollup('destek', 'p1', 3, storage)
    removePlanRollups('p1', storage)
    expect(readRollup('proje', 'p1', storage)).toBeUndefined()
    expect(readRollup('destek', 'p1', storage)).toBeUndefined()
    expect(readRollup('proje', 'p2', storage)).toBe(2)
  })

  it('büyük özeti reddeder', () => {
    expect(() => writeRollup('proje', 'p1', 'x'.repeat(MAX_ROLLUP_BYTES), memoryStorage())).toThrow(/büyük/)
  })

  it('bozuk kayıtta boş başlar', () => {
    const storage = memoryStorage()
    storage.setItem(ROLLUP_KEY, '{bozuk')
    expect(readRollup('proje', 'p1', storage)).toBeUndefined()
    writeRollup('proje', 'p1', 1, storage)
    expect(readRollup('proje', 'p1', storage)).toBe(1)
  })
})

describe('sekmeler arası bildirim', () => {
  it('aynı sekmedeki dinleyiciye haber verir ve abonelik kapanır', () => {
    const listener = vi.fn()
    const off = subscribeModuleChanges(listener)
    publishModuleChange({ moduleId: 'proje', planId: 'p1' })
    expect(listener).toHaveBeenCalledWith({ moduleId: 'proje', planId: 'p1' })
    off()
    publishModuleChange({ moduleId: 'proje', planId: 'p1' })
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
