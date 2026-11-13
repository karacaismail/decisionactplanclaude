import { describe, expect, it } from 'vitest'
import { formatDate, formatMoney, parseMoneyToKurus } from './format'

describe('format', () => {
  it('tarihi gün adıyla yazar', () => {
    expect(formatDate('2026-11-13T12:00:00')).toBe('13 Kasım 2026 Cuma günü')
    expect(formatDate(undefined)).toBe('Tarih belirlenmedi')
  })

  it('kuruşu TL olarak gösterir', () => {
    expect(formatMoney(125050)).toBe('1.250,50 TL')
    expect(formatMoney(null)).toBe('Bilinmiyor')
  })

  it('yazılan parayı kuruşa çevirir', () => {
    expect(parseMoneyToKurus('1.250,50')).toBe(125050)
    expect(parseMoneyToKurus(12)).toBe(1200)
    expect(parseMoneyToKurus('')).toBeNull()
  })
})
