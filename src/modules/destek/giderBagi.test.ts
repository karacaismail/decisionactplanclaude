import { beforeEach, describe, expect, it } from 'vitest'
import { createMemoryKvStore, getDefaultKvStore, setDefaultKvStore } from '@/platform/kv'
import { readRollup } from '@/platform/rollups'
import { PROGRAMLAR } from './data/programlar'
import { basvuruEkle, basvuruSil, giderBagiDegistir, giderBaglariYukle, PLANSIZ } from './depo'
import lifecycle from './lifecycle'

const PLAN_KEY = 'decisionactplan-v1'
const SIMDI = '2026-11-19T10:00:00.000Z'

beforeEach(() => {
  setDefaultKvStore(createMemoryKvStore())
  localStorage.clear()
  localStorage.setItem(PLAN_KEY, JSON.stringify({ state: { plans: { 'plan-1': { id: 'plan-1', revision: 4, steps: { U33: { stale: false } } } } } }))
})

/** Plana gerçek başvurular ekler ve kimliklerini döndürür. */
async function basvurular(planId: string, sayi: number): Promise<string[]> {
  const idler: string[] = []
  for (const program of PROGRAMLAR.slice(0, sayi)) idler.push((await basvuruEkle(planId, program, 'evet', SIMDI)).id)
  return idler
}

describe('gider bağı', () => {
  it('bağ destek deposunda durur, plan dosyasına ve özete dokunmaz', async () => {
    const plan = localStorage.getItem(PLAN_KEY)
    const [b1] = await basvurular('plan-1', 1)
    const ozet = readRollup('destek', 'plan-1')
    await giderBagiDegistir('plan-1', 'r-u33-resources-0', b1, true)
    expect(await giderBaglariYukle('plan-1')).toEqual([{ satirId: 'r-u33-resources-0', basvuruIdleri: [b1] }])
    expect(await getDefaultKvStore().get('destek/plan-1/gider-bag/r-u33-resources-0')).toEqual({ satirId: 'r-u33-resources-0', basvuruIdleri: [b1] })
    expect(localStorage.getItem(PLAN_KEY)).toBe(plan)
    expect(readRollup('destek', 'plan-1')).toEqual(ozet)
  })

  it('son bağ kalkınca kayıt silinir, bozuk kimlik ve plansız yer reddedilir', async () => {
    const [b1] = await basvurular('plan-1', 1)
    await giderBagiDegistir('plan-1', 'r-1', b1, true)
    await giderBagiDegistir('plan-1', 'r-1', b1, false)
    expect(await giderBaglariYukle('plan-1')).toEqual([])
    expect(await getDefaultKvStore().keys('destek/plan-1/gider-bag/')).toEqual([])
    await expect(giderBagiDegistir('plan-1', '../kotu', b1, true)).rejects.toThrow()
    await expect(giderBagiDegistir('plan-1', 'r-1', '../x', true)).rejects.toThrow()
    await expect(giderBagiDegistir(PLANSIZ, 'r-1', b1, true)).rejects.toThrow()
  })

  it('planda olmayan başvuruya bağ kurulmaz', async () => {
    await expect(giderBagiDegistir('plan-1', 'r-1', 'b-yok', true)).rejects.toThrow('Başvuru bulunamadı.')
    expect(await giderBaglariYukle('plan-1')).toEqual([])
  })

  it('anahtarıyla uyuşmayan kayıt okunmaz', async () => {
    await getDefaultKvStore().set('destek/plan-1/gider-bag/r-1', { satirId: 'r-2', basvuruIdleri: ['b-1'] })
    expect(await giderBaglariYukle('plan-1')).toEqual([])
  })

  it('arka arkaya iki işaret birbirini silmez', async () => {
    const [b1, b2, b3] = await basvurular('plan-1', 3)
    await Promise.all([giderBagiDegistir('plan-1', 'r-1', b1, true), giderBagiDegistir('plan-1', 'r-1', b2, true)])
    expect(await giderBaglariYukle('plan-1')).toEqual([{ satirId: 'r-1', basvuruIdleri: [b1, b2] }])
    await Promise.all([giderBagiDegistir('plan-1', 'r-1', b1, false), giderBagiDegistir('plan-1', 'r-1', b3, true)])
    expect(await giderBaglariYukle('plan-1')).toEqual([{ satirId: 'r-1', basvuruIdleri: [b2, b3] }])
  })

  it('silinen başvurunun bağı sonraki yazmada atılır', async () => {
    const [b1, b2] = await basvurular('plan-1', 2)
    await giderBagiDegistir('plan-1', 'r-1', b1, true)
    await basvuruSil('plan-1', b1)
    await giderBagiDegistir('plan-1', 'r-1', b2, true)
    expect(await giderBaglariYukle('plan-1')).toEqual([{ satirId: 'r-1', basvuruIdleri: [b2] }])
  })

  it('bağ dışa aktarılır, içe alınır ve plan silinince silinir', async () => {
    const [b1, b2] = await basvurular('plan-1', 2)
    await giderBagiDegistir('plan-1', 'r-1', b1, true)
    await giderBagiDegistir('plan-1', 'r-1', b2, true)
    const slice = await lifecycle.exportSlice!('plan-1')
    await lifecycle.importSlice!(slice, { 'plan-1': 'plan-3' })
    expect(await giderBaglariYukle('plan-3')).toEqual([{ satirId: 'r-1', basvuruIdleri: [b1, b2] }])
    await lifecycle.onPlanDeleted!('plan-1')
    expect(await giderBaglariYukle('plan-1')).toEqual([])
  })
})
