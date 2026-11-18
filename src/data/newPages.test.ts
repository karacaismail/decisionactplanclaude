import { describe, expect, it } from 'vitest'
import { NEW_PAGE_PATHS, isNewPage } from './newPages'

describe('Yeni sayfa etiketi', () => {
  it('altı sayfayı yeni sayar', () => {
    expect([...NEW_PAGE_PATHS].sort()).toEqual(['/devir', '/gecis', '/strateji', '/temel', '/uygulama', '/varsayimlar'])
  })

  it('18 Aralık 2026 günü bitene kadar yeni sayar', () => {
    expect(isNewPage('/gecis', new Date(2026, 10, 18, 9, 0))).toBe(true)
    expect(isNewPage('/gecis', new Date(2026, 11, 18, 23, 59))).toBe(true)
    expect(isNewPage('/gecis', new Date(2026, 11, 19, 0, 0))).toBe(false)
  })

  it('başka sayfaları yeni saymaz', () => {
    const now = new Date(2026, 10, 18, 9, 0)
    expect(isNewPage('/', now)).toBe(false)
    expect(isNewPage('/kanitlar', now)).toBe(false)
    expect(isNewPage('/ozet', now)).toBe(false)
  })
})
