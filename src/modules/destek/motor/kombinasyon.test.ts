import { describe, expect, it } from 'vitest'
import { katalogHatalari } from '../data/denetim'
import { PROGRAMLAR } from '../data/programlar'
import { KOMBINASYONLAR, type KombinasyonKurali } from '../data/tipler'
import { KOMBINASYON_METNI } from '../metinler'
import { basvuruCiftleri, iliskiBul } from './kombinasyon'

const [a, b] = PROGRAMLAR
const kural: KombinasyonKurali = {
  digerProgramId: b.id,
  iliski: { state: 'kaynakli', value: 'ayri_gider', sourceUrl: 'https://ornek.gov.tr', asOf: '2026-11-20' },
  yonlu: false,
}

describe('birlikte kullanma', () => {
  it('her ilişki türünün yalın açıklaması vardır', () => {
    for (const t of KOMBINASYONLAR) {
      expect(KOMBINASYON_METNI[t].baslik.length).toBeGreaterThan(0)
      expect(KOMBINASYON_METNI[t].aciklama).toMatch(/\.$/)
    }
  })

  it('katalogda her çift bilinmiyor', () => {
    for (const program of PROGRAMLAR) {
      for (const diger of PROGRAMLAR) expect(iliskiBul(program, diger)).toBeUndefined()
    }
    const basvurular = PROGRAMLAR.slice(0, 4).map((p) => ({ id: p.id, programId: p.id, programAdi: p.ad }))
    const ciftler = basvuruCiftleri(basvurular, PROGRAMLAR)
    expect(ciftler).toHaveLength(6)
    expect(ciftler.every((c) => !c.iliski)).toBe(true)
  })

  it('kaynaklı simetrik kural iki yönde aynıdır, yönlü kural kendi yönünde okunur', () => {
    const program = { ...a, kombinasyon: [kural] }
    expect(iliskiBul(program, b)).toEqual(kural)
    expect(iliskiBul(b, program)).toEqual(kural)
    expect(iliskiBul(b, { ...program, kombinasyon: [{ ...kural, yonlu: true }] })).toBeUndefined()
  })

  it('kaynaksız kural denetimden ve eşleşmeden geçmez', () => {
    const program = { ...a, kombinasyon: [{ ...kural, iliski: { ...kural.iliski, sourceUrl: '' } }] }
    expect(katalogHatalari([program, b])).toContainEqual(expect.stringMatching(/kombinasyon.*kaynak/))
    expect(iliskiBul(program, b)).toBeUndefined()
  })

  it('katalogdan çıkmış programın adı korunur', () => {
    const basvurular = [{ id: 'eski', programId: 'silinmis', programAdi: 'Eski program' }, { id: b.id, programId: b.id, programAdi: b.ad }]
    const [cift] = basvuruCiftleri(basvurular, PROGRAMLAR)
    expect(cift.iliski).toBeUndefined()
    expect(cift.a.programAdi).toBe('Eski program')
  })
})

it('aynı gider kodu iki başvuruda varsa ortak gideri bildirir', () => {
  const ilk = { id: a.id, programId: a.id, programAdi: a.ad, giderKodlari: ['fatura23', 'calisan5'] }
  const ikinci = { id: b.id, programId: b.id, programAdi: b.ad, giderKodlari: ['calisan5'] }
  expect(basvuruCiftleri([ilk, ikinci], PROGRAMLAR)[0]).toMatchObject({ ortakGider: true })
  expect(basvuruCiftleri([ilk, { ...ikinci, giderKodlari: ['fatura24'] }], PROGRAMLAR)[0]).toMatchObject({ ortakGider: false })
})
