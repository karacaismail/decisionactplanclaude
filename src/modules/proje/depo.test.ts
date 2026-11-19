import { describe, expect, it } from 'vitest'
import { createMemoryKvStore, scopedKvStore } from '@/platform/kv'
import { createPlanScopedLifecycle } from '@/platform/planScoped'
import { createProjeDepo } from './depo'
import { createProjeLifecycle } from './lifecycleCore'

const SIMDI = new Date(2026, 10, 19, 10, 0)

function kur() {
  const base = createMemoryKvStore()
  const kv = scopedKvStore(base, 'proje')
  const ozetler: Record<string, unknown> = {}
  let n = 0
  const depo = createProjeDepo({ store: kv, ozetYaz: (planId, v) => { ozetler[planId] = v }, simdi: () => SIMDI, kimlik: () => `k${++n}` })
  return { base, depo, ozetler }
}

describe('proje deposu', () => {
  it('projeyi ve işleri yazar, okur ve özeti yeniler', async () => {
    const { depo, ozetler } = kur()
    const p = await depo.projeAc('plan-1', { ad: 'Amazon satışını büyüt', moveRowId: 'satir-1' })
    const a = await depo.isEkle('plan-1', p.id, 'Fotoğrafları yenile')
    const b = await depo.isEkle('plan-1', p.id, 'Fiyatı gözden geçir')
    expect(b.sira).toBe(a.sira + 1)
    await depo.durumDegistir('plan-1', b.id, 'bitti')
    expect((await depo.projeler('plan-1')).map((x) => x.ad)).toEqual(['Amazon satışını büyüt'])
    expect((await depo.isler('plan-1', p.id)).map((x) => [x.baslik, x.durum])).toEqual([['Fotoğrafları yenile', 'yapilacak'], ['Fiyatı gözden geçir', 'bitti']])
    expect(ozetler['plan-1']).toMatchObject({ projeSayisi: 1, acik: 1, biten: 1, hamleler: { 'satir-1': { proje: 1, acik: 1, geciken: 0, biten: 1 } } })
  })

  it('başka planın verisini göstermez', async () => {
    const { depo } = kur()
    await depo.projeAc('plan-1', { ad: 'Bir' })
    await depo.projeAc('plan-10', { ad: 'On' })
    expect((await depo.projeler('plan-1')).map((x) => x.ad)).toEqual(['Bir'])
  })

  it('proje silinince işleri de silinir', async () => {
    const { depo, base } = kur()
    const p = await depo.projeAc('plan-1', { ad: 'Bir' })
    const q = await depo.projeAc('plan-1', { ad: 'İki' })
    await depo.isEkle('plan-1', p.id, 'A')
    await depo.isEkle('plan-1', q.id, 'B')
    await depo.projeSil('plan-1', p.id)
    expect((await depo.isler('plan-1')).map((x) => x.baslik)).toEqual(['B'])
    expect(await base.keys('proje/plan-1/')).toHaveLength(2)
  })

  it('olmayan projeye iş eklenmez', async () => {
    const { depo } = kur()
    await expect(depo.isEkle('plan-1', 'yok', 'A')).rejects.toThrow(/Proje bulunamadı/)
  })

  it('iş silinir ve özet yenilenir', async () => {
    const { depo, ozetler } = kur()
    const p = await depo.projeAc('plan-1', { ad: 'Bir' })
    const a = await depo.isEkle('plan-1', p.id, 'A')
    await depo.isSil('plan-1', a.id)
    expect(await depo.isler('plan-1')).toEqual([])
    expect(ozetler['plan-1']).toMatchObject({ acik: 0 })
  })
})

describe('proje yaşam döngüsü', () => {
  it('dışa aktarılan dilim içe alınınca yeni plana taşınır', async () => {
    const { base, depo } = kur()
    const p = await depo.projeAc('plan-1', { ad: 'Bir', moveRowId: 'satir-1' })
    await depo.isEkle('plan-1', p.id, 'A')
    const ozetler: Record<string, unknown> = {}
    const life = createProjeLifecycle(createPlanScopedLifecycle('proje', 1, () => base), {
      ozetiYenile: (planId) => depo.ozetiYenile(planId).then((v) => { ozetler[planId] = v }),
    })
    const slice = await life.exportSlice!('plan-1')
    await life.importSlice!(slice, { 'plan-1': 'plan-2' })
    await life.onPlanImported?.({ 'plan-1': 'plan-2' })
    const kopya = await depo.projeler('plan-2')
    expect(kopya.map((x) => [x.ad, x.planId, x.moveRowId])).toEqual([['Bir', 'plan-2', 'satir-1']])
    expect((await depo.isler('plan-2')).map((x) => x.baslik)).toEqual(['A'])
    expect(ozetler['plan-2']).toMatchObject({ projeSayisi: 1, acik: 1 })
  })

  it('projesi silinmiş iş dışa aktarılmaz, içe alma bozulmaz', async () => {
    const { base, depo } = kur()
    const p = await depo.projeAc('plan-1', { ad: 'Bir' })
    await depo.isEkle('plan-1', p.id, 'A')
    /* Başka sekme projeyi silerken bu sekme iş eklemiş olabilir. İş projesiz kalır. */
    await base.set('proje/plan-1/is/yetim', { id: 'yetim', projeId: 'silindi', baslik: 'Yetim', durum: 'yapilacak', sorumlu: '', sonTarih: '', not: '', sira: 1 })
    const life = createProjeLifecycle(createPlanScopedLifecycle('proje', 1, () => base), { ozetiYenile: async () => undefined })
    const slice = (await life.exportSlice!('plan-1')) as { entries: [string, unknown][] }
    expect(slice.entries.map(([k]) => k).some((k) => k.endsWith('yetim'))).toBe(false)
    await life.importSlice!(slice, { 'plan-1': 'plan-2' })
    expect((await depo.isler('plan-2')).map((x) => x.baslik)).toEqual(['A'])
  })

  it('bozuk dilimi yazmadan reddeder', async () => {
    const { base, depo } = kur()
    const life = createProjeLifecycle(createPlanScopedLifecycle('proje', 1, () => base), { ozetiYenile: async () => undefined })
    await expect(life.importSlice!({ schemaVersion: 1, entries: [['is/i1', { id: 'i1' }]] }, { a: 'plan-2' })).rejects.toThrow()
    expect(await depo.projeler('plan-2')).toEqual([])
  })

  it('plan silinince bütün proje verisi silinir', async () => {
    const { base, depo } = kur()
    const p = await depo.projeAc('plan-1', { ad: 'Bir' })
    await depo.isEkle('plan-1', p.id, 'A')
    const life = createProjeLifecycle(createPlanScopedLifecycle('proje', 1, () => base), { ozetiYenile: async () => undefined })
    await life.onPlanDeleted!('plan-1')
    expect(await base.keys('proje/plan-1/')).toEqual([])
  })
})

describe('özet yenileme hatası', () => {
  it('kayıt yazıldıktan sonra özet okunamazsa işlem başarılı sayılır', async () => {
    const base = createMemoryKvStore()
    const kv = scopedKvStore(base, 'proje')
    let bozuk = false
    let bozulsun = false
    /* Kayıt yazıldıktan sonraki okuma hata verir. Görev yine de kaydedilmiştir. */
    const store = {
      ...kv,
      keys: async (prefix?: string) => { if (bozuk) throw new Error('okuma hatası'); return kv.keys(prefix) },
      set: async (key: string, value: unknown) => { await kv.set(key, value); if (bozulsun) bozuk = true },
    }
    let n = 0
    const depo = createProjeDepo({ store, ozetYaz: () => undefined, simdi: () => SIMDI, kimlik: () => `k${++n}` })
    const p = await depo.projeAc('plan-1', { ad: 'Bir' })
    bozulsun = true
    const errors: unknown[] = []
    const asil = console.error
    console.error = (...args: unknown[]) => { errors.push(args) }
    try {
      await expect(depo.isEkle('plan-1', p.id, 'Görev')).resolves.toMatchObject({ baslik: 'Görev' })
    } finally {
      console.error = asil
    }
    bozuk = false
    bozulsun = false
    expect((await depo.isler('plan-1', p.id)).map((x) => x.baslik)).toEqual(['Görev'])
    expect(errors.length).toBeGreaterThan(0)
  })
})
