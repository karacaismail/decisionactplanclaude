/**
 * Konsey planı B.1: ortak belge havuzu.
 * Havuz destek deposunda durur. Plan varsa plan anahtarıyla, plan yoksa plansız anahtarla saklanır.
 * Havuzdaki "Hazır" işareti başvurulara kendiliğinden geçmez.
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { createMemoryKvStore, getDefaultKvStore, setDefaultKvStore } from '@/platform/kv'
import { ORTAK_BELGELER } from '../data/ortakBelgeler'
import { KANIT_GRUPLARI } from '../data/kanitlar'
import { PROGRAMLAR } from '../data/programlar'
import { basvuruEkle, basvuruGuncelle, basvurulariYukle, havuzBelgeKaydet, havuzYukle, PLANSIZ } from '../depo'
import lifecycle from '../lifecycle'
import { basvuruBelgeOnerisi, BOS_HAVUZ, havuzDegistir, havuzDurumu, havuzOku } from './belgeHavuzu'

const BUGUN = '2026-11-20'
const SIMDI = '2026-11-20T10:00:00.000Z'
const belge = (id: string) => ORTAK_BELGELER.find((b) => b.id === id)!
const SURELI = belge('k6')
const SURESIZ = belge('k1')

beforeEach(() => {
  setDefaultKvStore(createMemoryKvStore())
})

describe('ortak belgeler', () => {
  it('her belge ve kanıt maddesi bir ortak belgedir ve alanları tamdır', () => {
    expect(ORTAK_BELGELER.map((b) => b.id)).toEqual(KANIT_GRUPLARI.flatMap((g) => g.maddeler.map((m) => m.id)))
    for (const b of ORTAK_BELGELER) {
      expect(['basvuru', 'odeme', 'izleme'], b.id).toContain(b.asama)
      expect(typeof b.kurulusSonrasi, b.id).toBe('boolean')
      expect(typeof b.sureli, b.id).toBe('boolean')
      expect(b.aciklama.trim(), b.id).not.toBe('')
    }
    expect(SURELI.sureli).toBe(true)
    expect(SURESIZ.sureli).toBe(false)
  })

  it('belge metinlerinde sektör ve ülke adı yoktur', () => {
    for (const b of ORTAK_BELGELER) expect(`${b.ad} ${b.aciklama}`, b.id).not.toMatch(/emlak|gayrimenkul|kaynak kodu|Almanya|Amerika|ABD|İngiltere|Çin/iu)
  })
})

describe('havuz kaydı', () => {
  it('bozuk havuz boş okunur, bozuk kayıt atılır', () => {
    expect(havuzOku(undefined)).toEqual(BOS_HAVUZ)
    expect(havuzOku({ v: 1, belgeler: { k1: { hazir: 'evet' }, k6: { hazir: true, gecerlilik: '2026-02-30' }, 'kötü kimlik': { hazir: true } } })).toEqual({ v: 1, belgeler: { k6: { hazir: true } } })
    expect(havuzOku({ v: 1, belgeler: { k6: { hazir: true, gecerlilik: '2027-01-15' } } })).toEqual({ v: 1, belgeler: { k6: { hazir: true, gecerlilik: '2027-01-15' } } })
  })

  it('süreli olmayan belge geçerlilik tarihi taşımaz', () => {
    const h = havuzDegistir(BOS_HAVUZ, SURESIZ, { hazir: true, gecerlilik: '2027-01-15' })
    expect(h.belgeler.k1).toEqual({ hazir: true })
    expect(() => havuzDegistir(BOS_HAVUZ, SURELI, { gecerlilik: '2027-02-30' })).toThrow()
  })

  it('süreli belgede tarih yoksa ya da geçtiyse uyarı çıkar', () => {
    expect(havuzDurumu(SURELI, undefined, BUGUN)).toBe('yok')
    expect(havuzDurumu(SURELI, { hazir: true }, BUGUN)).toBe('tarihGerekli')
    expect(havuzDurumu(SURELI, { hazir: true, gecerlilik: '2026-11-20' }, BUGUN)).toBe('hazir')
    expect(havuzDurumu(SURELI, { hazir: true, gecerlilik: '2026-11-19' }, BUGUN)).toBe('suresiGecti')
    expect(havuzDurumu(SURESIZ, { hazir: true }, BUGUN)).toBe('hazir')
    expect(havuzDurumu(SURESIZ, { hazir: false }, BUGUN)).toBe('yok')
  })

  it('havuzdaki hazır belge başvuruya yalnız öneri olarak gelir', () => {
    const h = havuzDegistir(havuzDegistir(BOS_HAVUZ, SURESIZ, { hazir: true }), SURELI, { hazir: true, gecerlilik: '2026-11-01' })
    expect(basvuruBelgeOnerisi({ ad: SURESIZ.ad, hazir: false, kanit: 'k1' }, h, BUGUN)).toBe('kullan')
    expect(basvuruBelgeOnerisi({ ad: SURESIZ.ad, hazir: true, kanit: 'k1' }, h, BUGUN)).toBeUndefined()
    expect(basvuruBelgeOnerisi({ ad: SURELI.ad, hazir: false, kanit: 'k6' }, h, BUGUN)).toBe('suresiGecti')
    expect(basvuruBelgeOnerisi({ ad: SURELI.ad, hazir: true, kanit: 'k6' }, h, BUGUN)).toBe('suresiGecti')
    expect(basvuruBelgeOnerisi({ ad: 'Programın kendi belgesi', hazir: false }, h, BUGUN)).toBeUndefined()
  })
})

describe('havuz deposu', () => {
  it('havuz plan anahtarıyla, plan yoksa plansız anahtarla saklanır', async () => {
    await havuzBelgeKaydet('plan-1', SURESIZ, { hazir: true })
    await havuzBelgeKaydet(PLANSIZ, SURELI, { hazir: true, gecerlilik: '2027-01-15' })
    expect(await havuzYukle('plan-1')).toEqual({ v: 1, belgeler: { k1: { hazir: true } } })
    expect(await havuzYukle(PLANSIZ)).toEqual({ v: 1, belgeler: { k6: { hazir: true, gecerlilik: '2027-01-15' } } })
    expect(await getDefaultKvStore().keys()).toEqual(['destek/_plansiz/belgeHavuzu', 'destek/plan-1/belgeHavuzu'])
  })

  it('aynı anda gelen iki havuz işareti birbirini silmez', async () => {
    await Promise.all([havuzBelgeKaydet('plan-1', SURESIZ, { hazir: true }), havuzBelgeKaydet('plan-1', SURELI, { hazir: true, gecerlilik: '2027-01-15' })])
    expect(Object.keys((await havuzYukle('plan-1')).belgeler).sort()).toEqual(['k1', 'k6'])
  })

  it('havuzdaki işaret başvurudaki işareti değiştirmez', async () => {
    const program = PROGRAMLAR.find((p) => p.id === 'tubitak1501')!
    const a = await basvuruEkle('plan-1', program, 'hayir', SIMDI)
    await basvuruGuncelle('plan-1', a.id, { belgeEkle: { ad: SURESIZ.ad, kanit: 'k1' } }, SIMDI)
    await havuzBelgeKaydet('plan-1', SURESIZ, { hazir: true })
    const [kayitli] = await basvurulariYukle('plan-1')
    expect(kayitli.belgeler.find((b) => b.kanit === 'k1')?.hazir).toBe(false)
  })

  it('dışa aktarma ve içe alma havuzu korur', async () => {
    await havuzBelgeKaydet('plan-1', SURELI, { hazir: true, gecerlilik: '2027-01-15' })
    const slice = await lifecycle.exportSlice!('plan-1')
    await lifecycle.importSlice!(slice, { 'plan-1': 'plan-7' })
    expect(await havuzYukle('plan-7')).toEqual({ v: 1, belgeler: { k6: { hazir: true, gecerlilik: '2027-01-15' } } })
  })
})
