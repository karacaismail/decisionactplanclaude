import { describe, expect, it } from 'vitest'
import { demandNumberIssues, distinctPaths, duplicatePeople, isFuture, norm, pathIssues, peopleCalc } from './integrity'

describe('ad karşılaştırma', () => {
  it('büyük küçük harfi, boşluğu ve Türkçe harfleri aynı sayar', () => {
    expect(norm('  AYŞE   Yılmaz ')).toBe(norm('ayşe yılmaz'))
    expect(norm('IŞIK')).toBe(norm('ışık'))
    expect(norm('İnci')).toBe(norm('inci'))
    expect(norm(undefined)).toBe('')
  })
})

describe('aynı kişi iki kez sayılmaz', () => {
  const rows = [{ person: 'Ayşe Yılmaz' }, { person: 'Mehmet' }, { person: 'ayşe  yılmaz' }, { person: '' }, { person: 'MEHMET' }, { person: 'Deniz' }]
  it('tekrar eden kişileri ilk yazıldıkları biçimde verir', () => {
    expect(duplicatePeople(rows, 'person')).toEqual(['Ayşe Yılmaz', 'Mehmet'])
  })
  it('tekrar yoksa liste boştur', () => {
    expect(duplicatePeople([{ person: 'Ayşe' }, { person: 'Mehmet' }], 'person')).toEqual([])
  })
  it('denetim kutusu farklı kişi sayısını ve tekrarı yazar', () => {
    const r = peopleCalc(rows, 'person')
    expect(r?.value).toBe('3 farklı kişi')
    expect(r?.warn).toBe('2 kişi birden çok kez yazılmış: Ayşe Yılmaz, Mehmet. Aynı kişiyse bir satırı silin.')
    expect(peopleCalc([{ person: 'Ayşe' }], 'person')).toEqual({ value: '1 farklı kişi', lines: ['Tekrar eden kişi yok.'] })
    expect(peopleCalc([], 'person')).toBeNull()
  })
})

describe('yol farkı denetimi', () => {
  const base = { name: 'Bugünkü durumu sürdürmek', where: 'Müşteri evde kahve yapar.', how: 'Hiçbir şey yapmayız.' }
  it('aynı adı taşıyan yol bir kez sayılır', () => {
    const rows = [base, { name: 'Kahve arabası', where: 'Durak' }, { name: 'kahve  ARABASI', where: 'Meydan' }, { name: '', where: 'x' }]
    expect(distinctPaths(rows).map((r) => r.name)).toEqual(['Bugünkü durumu sürdürmek', 'Kahve arabası'])
    expect(pathIssues(rows)).toEqual(['"Kahve arabası" adı iki yolda yazılmış. Her yola ayrı ad verin.'])
  })
  it('müşterisi, kazanma yolu ve para mantığı aynı olan iki yol uyarı verir', () => {
    const rows = [base, { name: 'A', where: 'Evden çalışanlar', how: 'Hız', revenue: 'Aylık kart' }, { name: 'B', where: 'evden çalışanlar ', how: 'HIZ', revenue: 'aylık kart' }]
    expect(pathIssues(rows)).toEqual(['"A" ve "B" aynı görünüyor. Müşteri, kazanma yolu ve para mantığı aynı. Farkı yazın ya da yolları birleştirin.'])
  })
  it('bir alanı farklı olan yollar uyarı vermez', () => {
    const rows = [base, { name: 'A', where: 'Evden çalışanlar', how: 'Hız', revenue: 'Tek satış' }, { name: 'B', where: 'Evden çalışanlar', how: 'Hız', revenue: 'Aylık kart' }]
    expect(pathIssues(rows)).toEqual([])
  })
  it('boş alanlar "aynı" sayılmaz', () => {
    expect(pathIssues([base, { name: 'A' }, { name: 'B' }])).toEqual([])
  })
})

describe('talep sayıları birbirini tutar', () => {
  it('tutarlı sayılarda engel yoktur', () => {
    expect(demandNumberIssues({ reached: 48, tried: 22, priceAcceptedCount: 7, offers: [{ person: 'A', result: 'kabul' }, { person: 'B', result: 'ret' }] })).toEqual([])
    expect(demandNumberIssues({})).toEqual([])
  })
  it('deneyen kişi ulaşılan kişiyi geçemez', () => {
    expect(demandNumberIssues({ reached: 10, tried: 12 })).toEqual(['Deneyen kişi sayısı ulaşılan kişi sayısını geçemez. Sayıları inceleyin.'])
  })
  it('kabul eden kişi ulaşılan kişiyi geçemez', () => {
    expect(demandNumberIssues({ reached: 1, offers: [{ result: 'kabul' }, { result: 'kabul' }] })).toEqual(['Kabul eden kişi sayısı ulaşılan kişi sayısını geçemez. Sayıları inceleyin.'])
    expect(demandNumberIssues({ reached: 5, priceAcceptedCount: 6 })).toEqual(['Fiyatı kabul eden kişi sayısı ulaşılan kişi sayısını geçemez. Sayıları inceleyin.'])
  })
  it('pazar yeri ve fayda sayıları da denetlenir', () => {
    expect(demandNumberIssues({ validRequests: 5, matchedRequests: 8, registeredSellers: 10, activeSellers: 12, participants: 4, beneficiaries: 9 })).toEqual([
      'Uygun teklif alan talep sayısı geçerli talep sayısını geçemez. Sayıları inceleyin.',
      'Cevap veren satıcı sayısı kayıtlı satıcı sayısını geçemez. Sayıları inceleyin.',
      'Yararlanan kişi sayısı katılan kişi sayısını geçemez. Sayıları inceleyin.',
    ])
  })
})

describe('gelecek tarihli kanıt', () => {
  const now = new Date('2026-11-15T10:00:00')
  it('yarının tarihi gelecektir, bugünün ve boş tarihin değildir', () => {
    expect(isFuture('2026-11-16', now)).toBe(true)
    expect(isFuture('2026-11-15', now)).toBe(false)
    expect(isFuture(undefined, now)).toBe(false)
  })
})
