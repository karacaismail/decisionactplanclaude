import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readRollup, readRollupFrom, readRollupRaw, removePlanRollups, ROLLUP_KEY, subscribeRollups, writeRollup } from './rollups'

beforeEach(() => window.localStorage.clear())

describe('özet aboneliği', () => {
  it('özet yazılınca ve silinince dinleyici haber alır', () => {
    const listener = vi.fn()
    const stop = subscribeRollups(listener)
    writeRollup('proje', 'plan-1', { a: 1 })
    expect(listener).toHaveBeenCalledTimes(1)
    removePlanRollups('plan-1')
    expect(listener).toHaveBeenCalledTimes(2)
    /* Silinecek özet yoksa haber gitmez. */
    removePlanRollups('plan-1')
    expect(listener).toHaveBeenCalledTimes(2)
    stop()
    writeRollup('proje', 'plan-1', { a: 2 })
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('öteki sekmenin yazdığı özeti haber verir', () => {
    const listener = vi.fn()
    const stop = subscribeRollups(listener)
    window.dispatchEvent(new StorageEvent('storage', { key: 'baska-anahtar' }))
    expect(listener).not.toHaveBeenCalled()
    window.dispatchEvent(new StorageEvent('storage', { key: ROLLUP_KEY }))
    expect(listener).toHaveBeenCalledTimes(1)
    stop()
  })

  it('ham metinden özeti okur', () => {
    writeRollup('proje', 'plan-1', { a: 1 })
    const raw = readRollupRaw()
    expect(typeof raw).toBe('string')
    expect(readRollupFrom(raw, 'proje', 'plan-1')).toEqual({ a: 1 })
    expect(readRollupFrom(raw, 'proje', 'plan-2')).toBeUndefined()
    expect(readRollupFrom('bozuk', 'proje', 'plan-1')).toBeUndefined()
    expect(readRollup('proje', 'plan-1')).toEqual({ a: 1 })
  })
})
