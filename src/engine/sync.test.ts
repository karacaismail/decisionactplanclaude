import { describe, expect, it, vi } from 'vitest'
import { emptyPlan } from '@/data/types'
import { createGuardedStorage, detectConflict, formatDateTime, isQuotaError, readStoredPlan, safeFileName, type SaveResult } from './sync'

function fakeStorage(failWith?: unknown): Storage {
  const m = new Map<string, string>()
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => {
      if (failWith) throw failWith
      m.set(k, v)
    },
    removeItem: (k) => void m.delete(k),
    clear: () => m.clear(),
    key: () => null,
    length: 0,
  }
}

describe('createGuardedStorage', () => {
  it('başarılı yazmayı bildirir', () => {
    const results: SaveResult[] = []
    const s = createGuardedStorage(fakeStorage(), (r) => results.push(r))
    s.setItem('a', '1')
    expect(results).toEqual([{ ok: true }])
    expect(s.getItem('a')).toBe('1')
  })

  it('depo dolu hatasını yutmaz, bellekte tutar ve bildirir', () => {
    const results: SaveResult[] = []
    const err = Object.assign(new Error('dolu'), { name: 'QuotaExceededError' })
    const s = createGuardedStorage(fakeStorage(err), (r) => results.push(r))
    expect(() => s.setItem('a', '1')).not.toThrow()
    expect(results[0]).toMatchObject({ ok: false, quota: true })
    expect(s.getItem('a')).toBe('1')
  })

  it('aynı içeriği iki kez yazmaz, farklı içeriği yazar', () => {
    const base = fakeStorage()
    const spy = vi.spyOn(base, 'setItem')
    const s = createGuardedStorage(base, () => undefined)
    s.setItem('a', '1')
    s.setItem('a', '1')
    expect(spy).toHaveBeenCalledTimes(1)
    s.setItem('a', '2')
    expect(spy).toHaveBeenCalledTimes(2)
    s.removeItem('a')
    s.setItem('a', '2')
    expect(spy).toHaveBeenCalledTimes(3)
  })

  it('açılışta okunan içerik yazılmış sayılır', () => {
    const base = fakeStorage()
    base.setItem('a', 'eski')
    const spy = vi.spyOn(base, 'setItem')
    const s = createGuardedStorage(base, () => undefined)
    expect(s.getItem('a')).toBe('eski')
    s.setItem('a', 'eski')
    expect(spy).not.toHaveBeenCalled()
    s.setItem('a', 'yeni')
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('depo yoksa bellekte çalışır', () => {
    const onResult = vi.fn()
    const s = createGuardedStorage(undefined, onResult)
    s.setItem('a', '1')
    expect(s.getItem('a')).toBe('1')
    s.removeItem('a')
    expect(s.getItem('a')).toBeNull()
  })

  it('kota hatasını ad ve koda göre tanır', () => {
    expect(isQuotaError({ name: 'QuotaExceededError' })).toBe(true)
    expect(isQuotaError({ code: 22 })).toBe(true)
    expect(isQuotaError(new Error('başka'))).toBe(false)
    expect(isQuotaError(null)).toBe(false)
  })
})

describe('sekme çakışması', () => {
  const mine = emptyPlan('p', 'Plan')
  const raw = (updatedAt: string) => JSON.stringify({ state: { plans: { p: { ...mine, updatedAt } } }, version: 0 })

  it('aynı güncelleme zamanı çakışma değildir', () => {
    expect(detectConflict(raw(mine.updatedAt), mine)).toBeUndefined()
  })

  it('farklı güncelleme zamanı depodaki sürümü döndürür', () => {
    const other = detectConflict(raw('2026-11-13T10:00:00.000Z'), mine)
    expect(other?.updatedAt).toBe('2026-11-13T10:00:00.000Z')
  })

  it('bozuk metin, plan yokluğu ve başka plan çakışma değildir', () => {
    expect(detectConflict('{', mine)).toBeUndefined()
    expect(detectConflict(null, mine)).toBeUndefined()
    expect(detectConflict(raw('x'), undefined)).toBeUndefined()
    expect(readStoredPlan(raw('x'), 'baska')).toBeUndefined()
  })

  it('çakışma ekranı saat gösterir', () => {
    expect(formatDateTime('2026-11-13T18:15:04.991Z')).toMatch(/^13 Kasım 2026 Cuma günü, saat \d\d:\d\d$/)
    expect(formatDateTime('bozuk')).toBe('Tarih belirlenmedi')
  })

  it('dosya adı güvenli olur', () => {
    expect(safeFileName('Kahve dükkânı / 2026')).toBe('Kahve-dükkânı-2026')
    expect(safeFileName('///')).toBe('plan')
  })
})
