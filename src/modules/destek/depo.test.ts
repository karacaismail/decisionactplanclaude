import { beforeEach, describe, expect, it } from 'vitest'
import { createMemoryKvStore, getDefaultKvStore, setDefaultKvStore } from '@/platform/kv'
import { readRollup, ROLLUP_KEY } from '@/platform/rollups'
import { PROGRAMLAR } from './data/programlar'
import { basvuruEkle, basvuruGuncelle, basvuruSil, basvurulariYukle, ozetHesapla, PLANSIZ, profilKaydet, profilYukle } from './depo'
import lifecycle from './lifecycle'
import { BASVURU_DURUMLARI, basvuruOku } from './motor/basvuru'

const PLAN_KEY = 'decisionactplan-v1'
const SIMDI = '2026-11-19T10:00:00.000Z'
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
    expect(await profilYukle('plan-1', 2026)).toEqual({ calisan: 3, ihracat: 'yok' })
    expect(await profilYukle(PLANSIZ, 2026)).toEqual({ calisan: 12 })
    expect(await profilYukle('plan-2', 2026)).toEqual({})
    expect(localStorage.getItem(PLAN_KEY)).toBe(plan)
    expect(await getDefaultKvStore().keys()).toEqual(['destek/_plansiz/profil', 'destek/plan-1/profil'])
  })

  it('bozuk profil alanları atılır', async () => {
    await getDefaultKvStore().set('destek/plan-1/profil', { calisan: -4, il: 'Atlantis', kurulus: { yil: 2099 }, faaliyet: ['Z'], arge: 'evet', kurucu: ['kadin', 'kadin'] })
    expect(await profilYukle('plan-1', 2026)).toEqual({ arge: 'evet', kurucu: ['kadin'] })
  })
})

describe('başvurular', () => {
  it('başvuru, programın belge listesiyle ve cevapla oluşur', async () => {
    const b = await basvuruEkle('plan-1', program('kosgebIsletmeGelistirme'), 'hayir', SIMDI)
    expect(b.durum).toBe('hazirlaniyor')
    expect(b.desteksizYapar).toBe('hayir')
    expect(b.belgeler.map((x) => x.ad)).toEqual(program('kosgebIsletmeGelistirme').belgeler)
    expect(b.belgeler.every((x) => !x.hazir)).toBe(true)
    expect(await basvurulariYukle('plan-1')).toEqual([b])
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
    await basvuruGuncelle('plan-1', b.id, { durum: 'basvuruldu', belgeler: b.belgeler.map((x, i) => ({ ...x, hazir: i === 0 })), sonTarih: '2026-12-04' }, SIMDI)
    const [g] = await basvurulariYukle('plan-1')
    expect(g.durum).toBe('basvuruldu')
    expect(g.belgeler[0].hazir).toBe(true)
    expect(g.sonTarih).toBe('2026-12-04')
  })

  it('geçersiz güncelleme reddedilir', async () => {
    const b = await basvuruEkle('plan-1', program('kgf'), 'evet', SIMDI)
    await expect(basvuruGuncelle('plan-1', b.id, { durum: 'kazandik' as never }, SIMDI)).rejects.toThrow()
    await expect(basvuruGuncelle('plan-1', b.id, { sonTarih: '2026-02-30' }, SIMDI)).rejects.toThrow()
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

describe('yaşam döngüsü', () => {
  it('dışa aktarma, içe alma ve silme plan kapsamlıdır ve özeti yeniden kurar', async () => {
    await profilKaydet('plan-1', { calisan: 3 })
    await profilKaydet(PLANSIZ, { calisan: 9 })
    await basvuruEkle('plan-1', program('kgf'), 'evet', SIMDI)
    const slice = await lifecycle.exportSlice!('plan-1')
    expect(slice).toMatchObject({ schemaVersion: 1 })
    await lifecycle.importSlice!(slice, { 'plan-1': 'plan-9' })
    await lifecycle.onPlanImported!({ 'plan-1': 'plan-9' })
    expect(await profilYukle('plan-9', 2026)).toEqual({ calisan: 3 })
    expect(await basvurulariYukle('plan-9')).toHaveLength(1)
    expect(readRollup<{ toplam: number }>('destek', 'plan-9')?.toplam).toBe(1)
    await lifecycle.onPlanDeleted!('plan-1')
    expect(await basvurulariYukle('plan-1')).toEqual([])
    expect(await profilYukle(PLANSIZ, 2026)).toEqual({ calisan: 9 })
  })
})
