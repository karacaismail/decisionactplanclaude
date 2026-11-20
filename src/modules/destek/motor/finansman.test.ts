import { describe, expect, it } from 'vitest'
import type { Basvuru, BasvuruDurumu } from './basvuru'
import { beklenenDestekler, cubuklar, giderBagiOku, ikiBasvuruluSatirlar, tlYaz } from './finansman'

const basvuru = (id: string, durum: BasvuruDurumu = 'hazirlaniyor'): Basvuru => ({
  id,
  programId: `p-${id}`,
  programAdi: `Program ${id}`,
  durum,
  desteksizYapar: 'evet',
  belgeler: [],
  olusturma: '2026-11-19T10:00:00.000Z',
  guncelleme: '2026-11-19T10:00:00.000Z',
})

describe('finansman görünümü', () => {
  it('tutarı kişinin yazdığı gibi yazar, bilinmeyen tutar uydurulmaz', () => {
    expect(tlYaz(15000000)).toBe('150.000,00 TL')
    expect(tlYaz(5)).toBe('0,05 TL')
    expect(tlYaz(null)).toBe('Bilinmiyor')
  })

  it('çubuk boyu en büyük kaleme göre ölçeklenir ve toplam hesaplanmaz', () => {
    const kalemler = [
      { rowId: 'a', item: 'Tezgâh', budgetKurus: 100000, people: null },
      { rowId: 'b', item: 'Kahve makinesi', budgetKurus: 400000, people: null },
      { rowId: 'c', item: 'Usta', budgetKurus: null, people: 'Ayşe' },
      { rowId: 'd', item: 'Tabela', budgetKurus: 0, people: null },
    ]
    const sonuc = cubuklar(kalemler)
    expect(sonuc.map((c) => [c.rowId, c.oran, c.tutar])).toEqual([
      ['a', 25, '1.000,00 TL'],
      ['b', 100, '4.000,00 TL'],
      ['c', null, 'Bilinmiyor'],
      ['d', 0, '0,00 TL'],
    ])
    // Sonuçta hiçbir toplam yoktur.
    expect(JSON.stringify(sonuc)).not.toContain('5.000,00')
  })

  it('çubuk boyu 0 ile 100 arasında kalır', () => {
    const sonuc = cubuklar([
      { rowId: 'a', item: 'A', budgetKurus: -500, people: null },
      { rowId: 'b', item: 'B', budgetKurus: 100, people: null },
    ])
    expect(sonuc.map((c) => c.oran)).toEqual([0, 100])
  })

  it('bütün tutarlar sıfır ya da bilinmiyorsa çubuk boyu sıfırdır', () => {
    expect(cubuklar([{ rowId: 'a', item: 'A', budgetKurus: 0, people: null }])[0].oran).toBe(0)
    expect(cubuklar([])).toEqual([])
  })

  it('gider bağı okunurken bozuk ve tekrar eden kimlik atılır', () => {
    expect(giderBagiOku({ satirId: 'r-u33-resources-0', basvuruIdleri: ['b-1', 'b-1', 'b-2'] })).toEqual({ satirId: 'r-u33-resources-0', basvuruIdleri: ['b-1', 'b-2'] })
    expect(giderBagiOku({ satirId: 'r-1', basvuruIdleri: ['b-1', 7, '../x'] })).toEqual({ satirId: 'r-1', basvuruIdleri: ['b-1'] })
    expect(giderBagiOku({ satirId: '../kotu', basvuruIdleri: [] })).toBeUndefined()
    expect(giderBagiOku({ satirId: 'r-1', basvuruIdleri: 'b-1' })).toBeUndefined()
    expect(giderBagiOku(null)).toBeUndefined()
  })

  it('aynı satıra iki başvuru bağlanırsa satır uyarı alır', () => {
    const basvurular = [basvuru('b-1'), basvuru('b-2')]
    const baglar = [
      { satirId: 'a', basvuruIdleri: ['b-1', 'b-2'] },
      { satirId: 'b', basvuruIdleri: ['b-1'] },
      // Silinmiş başvuru sayılmaz.
      { satirId: 'c', basvuruIdleri: ['b-1', 'b-silindi'] },
    ]
    expect([...ikiBasvuruluSatirlar(baglar, basvurular)]).toEqual(['a'])
  })

  it('beklenen destekler ret ve vazgeçilen başvuruyu içermez', () => {
    const liste = beklenenDestekler([basvuru('b-1'), basvuru('b-2', 'ret'), basvuru('b-3', 'vazgecildi'), basvuru('b-4', 'kabul')])
    expect(liste.map((b) => b.id)).toEqual(['b-1', 'b-4'])
  })
})
