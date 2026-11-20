import { describe, expect, it } from 'vitest'
import { PROGRAMLAR } from '../data/programlar'
import { alanDurumu, bugunIso, ESKI_BILGI_GUN, gecerliDurum, gecerliIsoTarih, gunFarki, tarihGectiMi, tarihYaz, tazelik } from './tazelik'

const program = (id: string) => PROGRAMLAR.find((p) => p.id === id)!

describe('bilginin eskimesi', () => {
  it('90 günden eski bilgi eskidir, 90. gün eski değildir', () => {
    expect(ESKI_BILGI_GUN).toBe(90)
    expect(tazelik('2026-08-12', '2026-11-10')).toEqual({ gun: 90, eski: false })
    expect(tazelik('2026-08-12', '2026-11-11')).toEqual({ gun: 91, eski: true })
  })

  it('20 Kasım 2026 günü doğrulanan kart güncel, doğrulanmayan kart ve serbest metin eskidir', () => {
    for (const p of PROGRAMLAR) {
      const dogrulandi = !['eximbank', 'meslekOrgutleri'].includes(p.id)
      expect(tazelik(p.kaynak.asOf, '2026-11-20').eski, p.id).toBe(!dogrulandi)
      expect(tazelik(p.metinKontrol, '2026-11-20').eski, p.id).toBe(true)
      expect(tazelik(p.metinKontrol, '2026-09-01').eski, p.id).toBe(false)
    }
  })

  it('tarihi gün adıyla yazar', () => {
    expect(tarihYaz('2026-08-12')).toBe('12 Ağustos 2026 Çarşamba')
    expect(tarihYaz('2026-12-04')).toBe('4 Aralık 2026 Cuma')
  })

  it('takvimde olmayan günü reddeder', () => {
    expect(gecerliIsoTarih('2026-02-28')).toBe(true)
    expect(gecerliIsoTarih('2026-02-30')).toBe(false)
    expect(gecerliIsoTarih('2026-8-12')).toBe(false)
    expect(() => gunFarki('2026-02-30', '2026-03-01')).toThrow()
  })

  it('yerel bugünü yazar', () => {
    expect(bugunIso(new Date(2026, 10, 19, 23, 30))).toBe('2026-11-19')
  })
})

describe('program durumu', () => {
  it('bütün kritik tarihleri geçen çağrı kapanır', () => {
    expect(gecerliDurum(program('tubitak1501'), '2026-10-01')).toBe('acik')
    expect(gecerliDurum(program('tubitak1501'), '2026-10-26')).toBe('acik')
    expect(gecerliDurum(program('tubitak1501'), '2026-10-27')).toBe('kapandi')
    // TÜBİTAK 1507 çağrısını uzattı. Çağrı 25 Kasım 2026 Çarşamba günü kapanır.
    expect(gecerliDurum(program('tubitak1507'), '2026-11-25')).toBe('acik')
    expect(gecerliDurum(program('tubitak1507'), '2026-11-26')).toBe('kapandi')
  })

  it('kritik tarihi gelmeyen program açık kalır', () => {
    expect(gecerliDurum(program('kosgebYapayZekaKredisi'), '2026-11-19')).toBe('acik')
  })

  it('tarihi olmayan program kaynaktaki durumu korur', () => {
    expect(gecerliDurum(program('kosgebGirisimciB'), '2026-11-20')).toBe('cagri_bekleniyor')
    expect(gecerliDurum({ durum: 'kapali', tarihler: [] }, '2026-11-20')).toBe('kapali')
  })

  it('kaldırılan program tarihten bağımsız olarak kaldırılmış kalır', () => {
    expect(gecerliDurum(program('kosgebIsletmeGelistirme'), '2024-01-01')).toBe('kaldirildi')
    expect(gecerliDurum(program('kosgebIsletmeGelistirme'), '2026-11-20')).toBe('kaldirildi')
  })

  it('son gün geçmiş sayılmaz', () => {
    expect(tarihGectiMi('2026-12-31', '2026-12-31')).toBe(false)
    expect(tarihGectiMi('2026-12-31', '2027-01-01')).toBe(true)
  })
})

it('her alan kendi kaynağının kontrol gününü kullanır', () => {
  const kaynak = { state: 'kaynakli' as const, value: '%75', sourceUrl: 'https://ornek.gov.tr' }
  expect(alanDurumu({ ...kaynak, asOf: '2026-08-12' }, '2026-11-11')).toBe('eski')
  expect(alanDurumu({ ...kaynak, asOf: '2026-08-13' }, '2026-11-11')).toBe('kaynakli')
  expect(alanDurumu({ ...kaynak, asOf: '2026-08-13', sourceUrl: '' }, '2026-11-11')).toBe('bilinmiyor')
})
