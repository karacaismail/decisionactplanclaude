import { describe, expect, it } from 'vitest'
import { MAX_ROLLUP_BYTES } from '@/platform/rollups'
import { SINIR, type Is, type Proje } from './model'
import {
  acikMi,
  durumDegistir,
  gecikmisMi,
  isiGuncelle,
  isleriSirala,
  isOzeti,
  planOzeti,
  projeyiGuncelle,
  sonrakiSira,
  yeniIs,
  yeniProje,
} from './islemler'

const SIMDI = new Date(2026, 10, 19, 10, 0)
const BUGUN = '2026-11-19'

const proje = (over: Partial<Proje> = {}): Proje => ({
  ...yeniProje({ ad: 'Amazon satışını büyüt', moveRowId: 'satir-1' }, { id: 'p1', planId: 'plan-1', simdi: SIMDI }),
  ...over,
})
const is = (over: Partial<Is> = {}): Is => ({ ...yeniIs({ baslik: 'Fotoğrafları yenile' }, { id: 'i1', projeId: 'p1', sira: 1 }), ...over })

describe('proje kaydı', () => {
  it('yeni projeyi bugünün tarihiyle açar', () => {
    const p = yeniProje({ ad: '  Amazon satışını büyüt  ', moveRowId: 'satir-1', aciklama: 'ABD mağazası' }, { id: 'p1', planId: 'plan-1', simdi: SIMDI })
    expect(p).toEqual({
      id: 'p1',
      planId: 'plan-1',
      ad: 'Amazon satışını büyüt',
      moveRowId: 'satir-1',
      baslangic: BUGUN,
      bitis: '',
      sorumlu: '',
      aciklama: 'ABD mağazası',
      olusturma: SIMDI.toISOString(),
    })
  })

  it('bağsız proje moveRowId taşımaz', () => {
    expect('moveRowId' in yeniProje({ ad: 'Depo düzeni' }, { id: 'p2', planId: 'plan-1', simdi: SIMDI })).toBe(false)
  })

  it('boş adı reddeder', () => {
    expect(() => yeniProje({ ad: '   ' }, { id: 'p1', planId: 'plan-1', simdi: SIMDI })).toThrow(/Proje adını yazın/)
  })

  it('uzun hamle adını sınıra kısaltır', () => {
    const p = yeniProje({ ad: 'a'.repeat(SINIR.ad + 50) }, { id: 'p1', planId: 'plan-1', simdi: SIMDI })
    expect(p.ad.length).toBe(SINIR.ad)
  })

  it('güncellemede kimliği ve planı korur', () => {
    const p = projeyiGuncelle(proje(), { ad: 'Yeni ad', sorumlu: 'Dijital ekip', bitis: '2026-12-18', id: 'baska', planId: 'baska' } as Partial<Proje>)
    expect(p.id).toBe('p1')
    expect(p.planId).toBe('plan-1')
    expect(p.ad).toBe('Yeni ad')
    expect(p.sorumlu).toBe('Dijital ekip')
    expect(p.bitis).toBe('2026-12-18')
  })

  it('bitişi başlangıçtan önce olan projeyi reddeder', () => {
    expect(() => projeyiGuncelle(proje(), { bitis: '2026-11-01' })).toThrow(/Bitiş tarihi başlangıç tarihinden önce olamaz/)
  })

  it('bozuk tarihi reddeder', () => {
    expect(() => projeyiGuncelle(proje(), { bitis: '18.12.2026' })).toThrow(/tarih/)
  })
})

describe('iş kaydı', () => {
  it('yeni iş "Yapılacak" durumunda açılır', () => {
    expect(yeniIs({ baslik: ' Fotoğrafları yenile ' }, { id: 'i1', projeId: 'p1', sira: 3 })).toEqual({
      id: 'i1', projeId: 'p1', baslik: 'Fotoğrafları yenile', durum: 'yapilacak', sorumlu: '', sonTarih: '', not: '', sira: 3,
    })
  })

  it('boş başlığı reddeder', () => {
    expect(() => yeniIs({ baslik: '' }, { id: 'i1', projeId: 'p1', sira: 1 })).toThrow(/İş başlığını yazın/)
  })

  it('durumu değiştirir ve bilinmeyen durumu reddeder', () => {
    expect(durumDegistir(is(), 'takildi').durum).toBe('takildi')
    expect(() => durumDegistir(is(), 'sonra' as never)).toThrow(/durum/)
  })

  it('güncellemede kimliği ve projeyi korur', () => {
    const next = isiGuncelle(is(), { baslik: 'Yeni başlık', not: 'Not', sonTarih: '2026-12-01', id: 'x', projeId: 'y' } as Partial<Is>)
    expect(next).toMatchObject({ id: 'i1', projeId: 'p1', baslik: 'Yeni başlık', not: 'Not', sonTarih: '2026-12-01' })
  })

  it('sıradaki sıra numarasını verir', () => {
    expect(sonrakiSira([])).toBe(1)
    expect(sonrakiSira([is({ sira: 4 }), is({ sira: 2 })])).toBe(5)
  })

  it('işleri sıra numarasına göre dizer', () => {
    expect(isleriSirala([is({ id: 'b', sira: 2 }), is({ id: 'a', sira: 1 })]).map((i) => i.id)).toEqual(['a', 'b'])
  })
})

describe('gecikme', () => {
  it('son tarihi geçen açık iş gecikmiştir', () => {
    expect(gecikmisMi(is({ sonTarih: '2026-11-18' }), BUGUN)).toBe(true)
    expect(gecikmisMi(is({ sonTarih: '2026-11-18', durum: 'takildi' }), BUGUN)).toBe(true)
  })

  it('bugün biten, tarihsiz, biten ve iptal edilen iş gecikmez', () => {
    expect(gecikmisMi(is({ sonTarih: BUGUN }), BUGUN)).toBe(false)
    expect(gecikmisMi(is({ sonTarih: '' }), BUGUN)).toBe(false)
    expect(gecikmisMi(is({ sonTarih: '2026-11-01', durum: 'bitti' }), BUGUN)).toBe(false)
    expect(gecikmisMi(is({ sonTarih: '2026-11-01', durum: 'iptal' }), BUGUN)).toBe(false)
  })

  it('açık durumlar yalnız ilk üç durumdur', () => {
    expect(['yapilacak', 'yapiliyor', 'takildi', 'bitti', 'iptal'].map((d) => acikMi(d as never))).toEqual([true, true, true, false, false])
  })
})

describe('özet', () => {
  const isler = [
    is({ id: 'a', durum: 'yapilacak', sonTarih: '2026-11-01' }),
    is({ id: 'b', durum: 'yapiliyor' }),
    is({ id: 'c', durum: 'bitti' }),
    is({ id: 'd', durum: 'iptal' }),
    is({ id: 'e', durum: 'takildi', sonTarih: '2026-12-01' }),
  ]

  it('proje işlerini sayar', () => {
    expect(isOzeti(isler, BUGUN)).toEqual({
      toplam: 5, acik: 3, geciken: 1, biten: 1, iptal: 1,
      durumlar: { yapilacak: 1, yapiliyor: 1, takildi: 1, bitti: 1, iptal: 1 },
    })
  })

  it('plan özeti hamle başına durum verir', () => {
    const projeler = [proje(), proje({ id: 'p2', moveRowId: undefined }), proje({ id: 'p3', moveRowId: 'satir-1' })]
    const tum = [...isler, is({ id: 'f', projeId: 'p2', durum: 'bitti' }), is({ id: 'g', projeId: 'p3', durum: 'yapilacak', sonTarih: '2026-10-01' })]
    expect(planOzeti(projeler, tum, BUGUN)).toEqual({
      v: 1,
      tarih: BUGUN,
      projeSayisi: 3,
      acik: 4,
      geciken: 2,
      biten: 2,
      hamleler: { 'satir-1': { proje: 2, acik: 4, geciken: 2, biten: 1 } },
    })
  })

  it('plan özeti 4 KB sınırını aşmaz', () => {
    const projeler = Array.from({ length: SINIR.projePerPlan }, (_, n) => proje({ id: `p${n}`, moveRowId: `hamle-${'x'.repeat(80)}-${n}` }))
    const ozet = planOzeti(projeler, [], BUGUN)
    expect(new TextEncoder().encode(JSON.stringify(ozet)).length).toBeLessThanOrEqual(MAX_ROLLUP_BYTES)
    expect(ozet.kesik).toBe(true)
    expect(ozet.projeSayisi).toBe(SINIR.projePerPlan)
  })
})
