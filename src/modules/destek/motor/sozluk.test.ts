import { describe, expect, it } from 'vitest'
import { SOZLUK } from '../data/sozluk'
import { harfeGore, terimBul } from '../metinler'

describe('sözlük sırası', () => {
  it('terimler Türkçe abece sırasıyla dizilir', () => {
    const terimler = [
      { id: 'a', ad: 'Ön kayıt', anlam: '.' },
      { id: 'b', ad: 'Çağrı', anlam: '.' },
      { id: 'c', ad: 'İşbirliği kuruluşu', anlam: '.' },
      { id: 'd', ad: 'Ortaklık yatırımı', anlam: '.' },
      { id: 'e', ad: 'Destek', anlam: '.' },
      { id: 'f', ad: 'Hibe', anlam: '.' },
      { id: 'g', ad: 'Cari hesap', anlam: '.' },
    ]
    const gruplar = harfeGore(terimler)
    expect(gruplar.map((g) => g.harf)).toEqual(['C', 'Ç', 'D', 'H', 'İ', 'O', 'Ö'])
    expect(gruplar.flatMap((g) => g.terimler.map((t) => t.ad))).toEqual(['Cari hesap', 'Çağrı', 'Destek', 'Hibe', 'İşbirliği kuruluşu', 'Ortaklık yatırımı', 'Ön kayıt'])
  })

  it('sözlüğün bütün terimleri bir harf grubunda durur', () => {
    expect(harfeGore(SOZLUK).flatMap((g) => g.terimler)).toHaveLength(SOZLUK.length)
  })

  it('terim kimlikle bulunur', () => {
    expect(terimBul(SOZLUK, 'ciftFinansman')?.ad).toBe('Çift finansman')
    expect(terimBul(SOZLUK, 'yok')).toBeUndefined()
  })
})
