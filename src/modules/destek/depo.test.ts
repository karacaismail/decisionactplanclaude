import { beforeEach, describe, expect, it } from 'vitest'
import { createMemoryKvStore, getDefaultKvStore, setDefaultKvStore } from '@/platform/kv'
import { readRollup, ROLLUP_KEY } from '@/platform/rollups'
import { PROGRAMLAR } from './data/programlar'
import { basvuruEkle, basvuruGuncelle, basvuruSil, basvurulariYukle, ozetHesapla, PLANSIZ, profilAlanKaydet, profilKaydet, profilYukle } from './depo'
import lifecycle from './lifecycle'
import { BASVURU_DURUMLARI, DESTEKSIZ_CEVAPLARI, basvuruOku, belgeAnahtari } from './motor/basvuru'

const PLAN_KEY = 'decisionactplan-v1'
const SIMDI = '2026-11-19T10:00:00.000Z'
const BUGUN = '2026-11-19'
const program = (id: string) => PROGRAMLAR.find((p) => p.id === id)!

beforeEach(() => {
  setDefaultKvStore(createMemoryKvStore())
  localStorage.clear()
  localStorage.setItem(PLAN_KEY, JSON.stringify({ state: { plans: { 'plan-1': { id: 'plan-1', revision: 4, steps: { '00': { stale: false } } } } } }))
})

describe('destek profili', () => {
  it('profil plana göre ayrı saklanır ve plan dosyasına dokunmaz', async () => {
    const plan = localStorage.getItem(PLAN_KEY)
    await profilKaydet('plan-1', { calisan: 3, ihracat: 'yok' })
    await profilKaydet(PLANSIZ, { calisan: 12 })
    expect(await profilYukle('plan-1', BUGUN)).toEqual({ calisan: 3, ihracat: 'yok' })
    expect(await profilYukle(PLANSIZ, BUGUN)).toEqual({ calisan: 12 })
    expect(await profilYukle('plan-2', BUGUN)).toEqual({})
    expect(localStorage.getItem(PLAN_KEY)).toBe(plan)
    expect(await getDefaultKvStore().keys()).toEqual(['destek/_plansiz/profil', 'destek/plan-1/profil'])
  })

  it('tek cevap yazılırken öteki sekmenin yazdığı cevap korunur', async () => {
    await profilKaydet('plan-1', { calisan: 3 })
    await getDefaultKvStore().set('destek/plan-1/profil', { calisan: 3, il: 'İzmir' })
    expect(await profilAlanKaydet('plan-1', 'ihracat', 'yok', BUGUN)).toEqual({ calisan: 3, il: 'İzmir', ihracat: 'yok' })
  })

  it('gelecekteki kuruluş tarihi atılır', async () => {
    await profilKaydet('plan-1', { kurulus: { yil: 2026, ay: 12 } })
    expect(await profilYukle('plan-1', BUGUN)).toEqual({})
    await profilKaydet('plan-1', { kurulus: { yil: 2026, ay: 11 } })
    expect(await profilYukle('plan-1', BUGUN)).toEqual({ kurulus: { yil: 2026, ay: 11 } })
  })

  it('bozuk profil alanları atılır', async () => {
    await getDefaultKvStore().set('destek/plan-1/profil', { calisan: -4, il: 'Atlantis', kurulus: { yil: 2099 }, faaliyet: ['Z'], arge: 'evet', kurucu: ['kadin', 'kadin'] })
    expect(await profilYukle('plan-1', BUGUN)).toEqual({ arge: 'evet', kurucu: ['kadin'] })
  })
})

describe('başvurular', () => {
  it('başvuru, programın belge listesiyle ve cevapla oluşur', async () => {
    const b = await basvuruEkle('plan-1', program('tubitak1507'), 'hayir', SIMDI)
    expect(b.durum).toBe('hazirlaniyor')
    expect(b.desteksizYapar).toBe('hayir')
    expect(b.belgeler.map((x) => x.ad)).toEqual(program('tubitak1507').belgeler)
    expect(b.belgeler.every((x) => !x.hazir)).toBe(true)
    expect(await basvurulariYukle('plan-1')).toEqual([b])
  })

  it('kaldırılan programa başvuru eklenmez', async () => {
    await expect(basvuruEkle('plan-1', program('kosgebIsletmeGelistirme'), 'hayir', SIMDI)).rejects.toThrow(/kaldırıldı/)
    expect(await basvurulariYukle('plan-1')).toEqual([])
  })

  it('plan olmadan başvuru eklenmez', async () => {
    await expect(basvuruEkle(PLANSIZ, program('kgf'), 'evet', SIMDI)).rejects.toThrow(/plan/i)
  })

  it('aynı program iki kez eklenmez', async () => {
    await basvuruEkle('plan-1', program('kgf'), 'evet', SIMDI)
    await expect(basvuruEkle('plan-1', program('kgf'), 'evet', SIMDI)).rejects.toThrow(/zaten/)
  })

  it('durum, belge ve son tarih güncellenir', async () => {
    const b = await basvuruEkle('plan-1', program('kgf'), 'bilmiyorum', SIMDI)
    await basvuruGuncelle('plan-1', b.id, { durum: 'basvuruldu', belge: { sira: 0, hazir: true }, sonTarih: '2026-12-04' }, SIMDI)
    const [g] = await basvurulariYukle('plan-1')
    expect(g.durum).toBe('basvuruldu')
    expect(g.belgeler[0].hazir).toBe(true)
    expect(g.sonTarih).toBe('2026-12-04')
  })

  it('aynı anda gelen iki değişiklik birbirini silmez', async () => {
    const b = await basvuruEkle('plan-1', program('tubitak1507'), 'evet', SIMDI)
    await Promise.all([
      basvuruGuncelle('plan-1', b.id, { belge: { sira: 0, hazir: true } }, SIMDI),
      basvuruGuncelle('plan-1', b.id, { belge: { sira: 1, hazir: true } }, SIMDI),
      basvuruGuncelle('plan-1', b.id, { durum: 'basvuruldu' }, SIMDI),
    ])
    const [g] = await basvurulariYukle('plan-1')
    expect(g.belgeler.map((x) => x.hazir)).toEqual([true, true, false, false])
    expect(g.durum).toBe('basvuruldu')
    expect(readRollup<{ durumlar: Record<string, number> }>('destek', 'plan-1')?.durumlar.basvuruldu).toBe(1)
  })

  it('kimliği anahtarıyla uyuşmayan kayıt okunmaz', async () => {
    const b = await basvuruEkle('plan-1', program('kgf'), 'evet', SIMDI)
    await getDefaultKvStore().set('destek/plan-1/basvuru/baska', { ...b })
    await getDefaultKvStore().set('destek/plan-1/basvuru/bosluklu', { ...b, id: 'boşluk var' })
    expect((await basvurulariYukle('plan-1')).map((x) => x.id)).toEqual([b.id])
  })

  it('geçersiz güncelleme reddedilir', async () => {
    const b = await basvuruEkle('plan-1', program('kgf'), 'evet', SIMDI)
    await expect(basvuruGuncelle('plan-1', b.id, { durum: 'kazandik' as never }, SIMDI)).rejects.toThrow()
    await expect(basvuruGuncelle('plan-1', b.id, { sonTarih: '2026-02-30' }, SIMDI)).rejects.toThrow()
    await expect(basvuruGuncelle('plan-1', b.id, { belge: { sira: 99, hazir: true } }, SIMDI)).rejects.toThrow()
  })

  it('özet durumlara göre sayar ve her yazmada yenilenir', async () => {
    const a = await basvuruEkle('plan-1', program('kgf'), 'evet', SIMDI)
    await basvuruEkle('plan-1', program('bks'), 'evet', SIMDI)
    await basvuruGuncelle('plan-1', a.id, { durum: 'kabul' }, SIMDI)
    const ozet = readRollup<{ toplam: number; durumlar: Record<string, number> }>('destek', 'plan-1')
    expect(ozet?.toplam).toBe(2)
    expect(ozet?.durumlar.kabul).toBe(1)
    expect(ozet?.durumlar.hazirlaniyor).toBe(1)
    expect(Object.keys(ozet?.durumlar ?? {})).toEqual([...BASVURU_DURUMLARI])
    await basvuruSil('plan-1', a.id)
    expect(readRollup<{ toplam: number }>('destek', 'plan-1')?.toplam).toBe(1)
    expect(localStorage.getItem(ROLLUP_KEY)).not.toBeNull()
  })

  it('özet hesabı saftır', () => {
    expect(ozetHesapla([])).toEqual({ v: 1, toplam: 0, durumlar: Object.fromEntries(BASVURU_DURUMLARI.map((d) => [d, 0])) })
  })

  it('bozuk başvuru kaydı okunmaz', () => {
    expect(basvuruOku({ id: 'x' })).toBeUndefined()
    expect(basvuruOku(null)).toBeUndefined()
  })
})

describe('belge ve kanıt listesinden eklenen belgeler', () => {
  it('belge listesine eklenir ve programın belgelerinden ayrı işaretlenir', async () => {
    const b = await basvuruEkle('plan-1', program('tubitak1507'), 'evet', SIMDI)
    const g = await basvuruGuncelle('plan-1', b.id, { belgeEkle: { ad: 'İmza sirküleri', kanit: 'k4' } }, SIMDI)
    expect(g.belgeler).toHaveLength(5)
    expect(g.belgeler.at(-1)).toEqual({ ad: 'İmza sirküleri', hazir: false, kanit: 'k4' })
    expect(g.belgeler.slice(0, 4).every((x) => x.kanit === undefined)).toBe(true)
    expect((await basvurulariYukle('plan-1'))[0].belgeler.at(-1)?.kanit).toBe('k4')
  })

  it('aynı adlı belge ikinci kez eklenmez', async () => {
    const b = await basvuruEkle('plan-1', program('tubitak1507'), 'evet', SIMDI)
    // Programın kendi belgesinde "KOBİ beyannamesi" var. Büyük ve küçük harf ile boşluk farkı sayılmaz.
    await expect(basvuruGuncelle('plan-1', b.id, { belgeEkle: { ad: '  kobi   BEYANNAMESİ ', kanit: 'k10' } }, SIMDI)).rejects.toThrow(/zaten/)
    await basvuruGuncelle('plan-1', b.id, { belgeEkle: { ad: 'İmza sirküleri', kanit: 'k4' } }, SIMDI)
    await expect(basvuruGuncelle('plan-1', b.id, { belgeEkle: { ad: 'İmza sirküleri.', kanit: 'k99' } }, SIMDI)).rejects.toThrow(/zaten/)
    await expect(basvuruGuncelle('plan-1', b.id, { belgeEkle: { ad: 'Başka ad', kanit: 'k4' } }, SIMDI)).rejects.toThrow(/zaten/)
    expect((await basvurulariYukle('plan-1'))[0].belgeler).toHaveLength(5)
  })

  it('yalnız eklenen belge çıkarılır, sonraki işaret doğru belgeye gider', async () => {
    const b = await basvuruEkle('plan-1', program('kgf'), 'evet', SIMDI)
    await basvuruGuncelle('plan-1', b.id, { belgeEkle: { ad: 'İmza sirküleri', kanit: 'k4' } }, SIMDI)
    await basvuruGuncelle('plan-1', b.id, { belgeEkle: { ad: 'Vergi levhası', kanit: 'k5' } }, SIMDI)
    // Olmayan belgeyi çıkarmak kaydı değiştirmez ve hata vermez.
    expect((await basvuruGuncelle('plan-1', b.id, { belgeCikar: { kanit: 'yok' } }, SIMDI)).belgeler).toHaveLength(4)
    // Ekran eski listeyi gösterirken çıkarma ile işaret arka arkaya gelir. İşaret adıyla doğru belgeyi bulur.
    // Çıkarma düğmesine iki kez basılsa da ikinci çıkarma hata vermez.
    await Promise.all([
      basvuruGuncelle('plan-1', b.id, { belgeCikar: { kanit: 'k4' } }, SIMDI),
      basvuruGuncelle('plan-1', b.id, { belgeCikar: { kanit: 'k4' } }, SIMDI),
      basvuruGuncelle('plan-1', b.id, { belge: { sira: 3, hazir: true, ad: 'Vergi levhası' } }, SIMDI),
    ])
    const [g] = await basvurulariYukle('plan-1')
    expect(g.belgeler.map((x) => [x.ad, x.hazir])).toEqual([['Mali tablolar', false], ['Bankanın limit değerlendirmesi', false], ['Vergi levhası', true]])
    await expect(basvuruGuncelle('plan-1', b.id, { belge: { sira: 0, hazir: true, ad: 'İmza sirküleri' } }, SIMDI)).rejects.toThrow(/bulunamadı/)
  })

  it('bozuk belge kimliği başvuruyu gizlemez, eski kayıt kimliksiz okunur', () => {
    const temel = { id: 'b-1', programId: 'kgf', programAdi: 'KGF', durum: 'hazirlaniyor', desteksizYapar: 'evet', olusturma: SIMDI, guncelleme: SIMDI }
    expect(basvuruOku({ ...temel, belgeler: [{ ad: 'Mali tablolar', hazir: false }] })?.belgeler).toEqual([{ ad: 'Mali tablolar', hazir: false }])
    expect(basvuruOku({ ...temel, belgeler: [{ ad: 'X', hazir: true, kanit: 'boşluk var' }] })?.belgeler).toEqual([{ ad: 'X', hazir: true }])
  })

  it('dışa aktarma ve içe alma eklenen belgeyi korur', async () => {
    const b = await basvuruEkle('plan-1', program('kgf'), 'evet', SIMDI)
    await basvuruGuncelle('plan-1', b.id, { belgeEkle: { ad: 'İmza sirküleri', kanit: 'k4' } }, SIMDI)
    const slice = await lifecycle.exportSlice!('plan-1')
    await lifecycle.importSlice!(slice, { 'plan-1': 'plan-7' })
    const [g] = await basvurulariYukle('plan-7')
    expect(g.belgeler.at(-1)).toEqual({ ad: 'İmza sirküleri', hazir: false, kanit: 'k4' })
  })
})

describe('belge adının normal biçimi', () => {
  it('Türkçe harfleri, boşlukları ve noktalamayı sadeleştirir', () => {
    expect(belgeAnahtari('  KOBİ   beyannamesi. ')).toBe(belgeAnahtari('kobi beyannamesi'))
    expect(belgeAnahtari('Işık')).not.toBe(belgeAnahtari('isik'))
  })
})

describe('yaşam döngüsü', () => {
  it('dışa aktarma, içe alma ve silme plan kapsamlıdır ve özeti yeniden kurar', async () => {
    await profilKaydet('plan-1', { calisan: 3 })
    await profilKaydet(PLANSIZ, { calisan: 9 })
    await basvuruEkle('plan-1', program('kgf'), 'evet', SIMDI)
    const slice = await lifecycle.exportSlice!('plan-1')
    expect(slice).toMatchObject({ schemaVersion: 1 })
    await lifecycle.importSlice!(slice, { 'plan-1': 'plan-9' })
    await lifecycle.onPlanImported!({ 'plan-1': 'plan-9' })
    expect(await profilYukle('plan-9', BUGUN)).toEqual({ calisan: 3 })
    expect(await basvurulariYukle('plan-9')).toHaveLength(1)
    expect(readRollup<{ toplam: number }>('destek', 'plan-9')?.toplam).toBe(1)
    await lifecycle.onPlanDeleted!('plan-1')
    expect(await basvurulariYukle('plan-1')).toEqual([])
    expect(await profilYukle(PLANSIZ, BUGUN)).toEqual({ calisan: 9 })
  })
})

describe('özet yazma hatası', () => {
  it('başvuru kaydedildikten sonra özet yazılamazsa işlem başarılı sayılır', async () => {
    const asilYaz = Storage.prototype.setItem
    const asilHata = console.error
    console.error = () => undefined
    Storage.prototype.setItem = function () { throw new DOMException('dolu', 'QuotaExceededError') }
    try {
      const b = await basvuruEkle('plan-1', program(PROGRAMLAR[0].id), DESTEKSIZ_CEVAPLARI[0], SIMDI)
      await expect(basvuruGuncelle('plan-1', b.id, { durum: BASVURU_DURUMLARI[1] }, SIMDI)).resolves.toMatchObject({ id: b.id })
      await expect(basvuruSil('plan-1', b.id)).resolves.toBeUndefined()
    } finally {
      Storage.prototype.setItem = asilYaz
      console.error = asilHata
    }
  })
})
