import { describe, expect, it } from 'vitest'
import { katalogHatalari } from '../data/denetim'
import { PROGRAMLAR } from '../data/programlar'
import { KOMBINASYONLAR, type KombinasyonKurali } from '../data/tipler'
import { KOMBINASYON_METNI } from '../metinler'
import { basvuruCiftleri, iliskiBul } from './kombinasyon'

const bul = (id: string) => PROGRAMLAR.find((p) => p.id === id)!
// Bu iki programın katalogda kaynaklı çifti yoktur.
const a = bul('tubitak1702')
const b = bul('tubitak1509')
const kural: KombinasyonKurali = {
  digerProgramId: b.id,
  iliski: { state: 'kaynakli', value: 'ayri_gider', sourceUrl: 'https://ornek.gov.tr', asOf: '2026-11-20', alinti: 'Aynı harcama için tek destek alınır.' },
  yonlu: false,
}

/** 20 Kasım 2026 doğrulamasında resmî alıntısı olan çiftler. Sıra önemsizdir. */
const KAYNAKLI_CIFTLER = [
  'kanun4691|kanun5746', 'argeMerkezi|kanun4691', 'tubitak1501|tubitak1507', 'kosgebGirisimciA|kosgebIsKurma', 'kosgebGirisimciB|kosgebIsKurma',
  'kosgebGirisimciA|kosgebGirisimciB', 'kgf|kosgebGirisimciA', 'kgf|kosgebKapasite', 'kgf|kosgebKuresel',
  'tb10962Atilim|tb10962Marka', 'tb10962Atilim|tb10962Surdurulebilirlik',
].map((c) => c.split('|').sort().join('|')).sort()

describe('birlikte kullanma', () => {
  it('her ilişki türünün yalın açıklaması vardır', () => {
    for (const t of KOMBINASYONLAR) {
      expect(KOMBINASYON_METNI[t].baslik.length).toBeGreaterThan(0)
      expect(KOMBINASYON_METNI[t].aciklama).toMatch(/\.$/)
    }
  })

  it('katalogda yalnız resmî alıntısı olan çiftler bilinir, öteki çiftler bilinmiyor', () => {
    const bilinen = new Set<string>()
    for (const program of PROGRAMLAR) {
      for (const diger of PROGRAMLAR) {
        const k = iliskiBul(program, diger)
        if (k) bilinen.add([program.id, diger.id].sort().join('|'))
      }
    }
    expect([...bilinen].sort()).toEqual(KAYNAKLI_CIFTLER)
    const basvurular = ['tubitak1702', 'tubitak1509', 'eic', 'bks'].map((id) => ({ id, programId: id, programAdi: bul(id).ad }))
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
