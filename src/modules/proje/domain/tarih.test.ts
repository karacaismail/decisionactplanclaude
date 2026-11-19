import { describe, expect, it } from 'vitest'
import { bugunIso, tarihGecerliMi, tarihYaz } from './tarih'

describe('tarih yazımı', () => {
  it('günü, ay adını, yılı ve gün adını yazar', () => {
    expect(tarihYaz('2026-12-18')).toBe('18 Aralık 2026 Cuma')
    expect(tarihYaz('2026-11-19')).toBe('19 Kasım 2026 Perşembe')
    expect(tarihYaz('2027-01-03')).toBe('3 Ocak 2027 Pazar')
  })

  it('boş ya da bozuk tarihte boş metin verir', () => {
    expect(tarihYaz('')).toBe('')
    expect(tarihYaz('2026-13-01')).toBe('')
    expect(tarihYaz('18.12.2026')).toBe('')
  })

  it('geçerli tarihi tanır', () => {
    expect(tarihGecerliMi('2026-02-28')).toBe(true)
    expect(tarihGecerliMi('2026-02-30')).toBe(false)
    expect(tarihGecerliMi('2026-2-3')).toBe(false)
    expect(tarihGecerliMi(42)).toBe(false)
  })

  it('bugünü yerel saate göre yazar', () => {
    expect(bugunIso(new Date(2026, 10, 19, 23, 59))).toBe('2026-11-19')
    expect(bugunIso(new Date(2027, 0, 2, 0, 1))).toBe('2027-01-02')
  })
})
