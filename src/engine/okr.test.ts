/**
 * Hedef takibi. İsteğe bağlı katmandır. İngilizce adı OKR'dir.
 * Kurallar docs/okr-arastirma-raporu.md dosyasının 6. ve 9. bölümlerindedir.
 * Yazılım karar vermez. Puan yalnız "Seçim hâlâ doğru mu?" sorusunu sordurur.
 */
import { describe, expect, it } from 'vitest'
import { emptyPlan, type OkrIndicator, type OkrObjective, type OkrPeriod, type OkrState } from '@/data/types'
import {
  addIndicator,
  addObjective,
  canAddIndicator,
  canAddObjective,
  closePeriod,
  CONFIDENCE_LABEL,
  createPeriod,
  indicatorOverdue,
  indicatorScore,
  objectiveScore,
  OKR_MAX_INDICATORS,
  OKR_MAX_OBJECTIVES,
  OKR_OVERDUE,
  OKR_TOO_MANY,
  okrEnabled,
  okrOf,
  openPeriod,
  parseNumber,
  periodSummary,
  recordCheckIn,
  sanitizeOkr,
  scoreText,
  setOkrEnabled,
  taskLike,
  tooManyIndicators,
} from './okr'

const NOW = new Date('2026-11-19T10:00:00.000Z')

function indicator(patch: Partial<OkrIndicator> = {}): OkrIndicator {
  return { id: 'g1', name: 'Ödeyen müşteri sayısı', baseline: 7, target: 30, checkIns: [], ...patch }
}
function objective(patch: Partial<OkrObjective> = {}): OkrObjective {
  return { id: 'h1', title: 'Aylık kartla düzenli müşteri kazanmak', indicators: [indicator()], ...patch }
}
function state(patch: Partial<OkrState> = {}): OkrState {
  return { enabled: true, changedAt: NOW.toISOString(), periods: [{ id: 'd1', startsAt: '2026-11-01', endsAt: '2027-02-01', objectives: [objective()] }], ...patch }
}

describe('açma anahtarı', () => {
  it('eski planda hedef takibi kapalıdır', () => {
    const p = emptyPlan('p', 'Plan')
    expect(p.okr).toBeUndefined()
    expect(okrEnabled(p)).toBe(false)
    expect(okrOf(p)).toBeUndefined()
  })
  it('anahtar açılınca 3 aylık ilk dönem başlar', () => {
    const p = emptyPlan('p', 'Plan')
    setOkrEnabled(p, true, NOW)
    expect(okrEnabled(p)).toBe(true)
    expect(p.okr?.changedAt).toBe(NOW.toISOString())
    expect(p.okr?.periods).toHaveLength(1)
    expect(p.okr?.periods[0]).toMatchObject({ startsAt: '2026-11-19', endsAt: '2027-02-19', objectives: [] })
  })
  it('anahtar kapanınca kayıtlar silinmez, açılınca geri gelir', () => {
    const p = emptyPlan('p', 'Plan')
    p.okr = state()
    setOkrEnabled(p, false, NOW)
    expect(okrEnabled(p)).toBe(false)
    expect(p.okr.periods[0].objectives[0].title).toBe('Aylık kartla düzenli müşteri kazanmak')
    setOkrEnabled(p, true, NOW)
    expect(p.okr.periods).toHaveLength(1)
    expect(p.okr.periods[0].objectives[0].indicators[0].name).toBe('Ödeyen müşteri sayısı')
  })
  it('anahtar karar sürümünü ve eskime bayrağını değiştirmez', () => {
    const p = emptyPlan('p', 'Plan')
    p.revision = 4
    p.decisions = [{ id: 'k', gate: 6, scope: 'Deneme', criteria: [], suggested: 'ilerle', chosen: 'ilerle', reason: 'Gerekçe', retriesLeft: 1, decidedBy: 'Kurucu', decidedAt: '2026-11-01T00:00:00.000Z', revision: 4, stale: false }]
    setOkrEnabled(p, true, NOW)
    setOkrEnabled(p, false, NOW)
    expect(p.revision).toBe(4)
    expect(p.decisions[0].stale).toBe(false)
    expect(p.changes).toEqual([])
    expect(p.revisions).toEqual([])
  })
})

describe('hedef ve gösterge sınırları', () => {
  it('bir dönemde en çok 3 hedef yazılır', () => {
    const period = createPeriod(NOW)
    expect(OKR_MAX_OBJECTIVES).toBe(3)
    for (let i = 0; i < 3; i++) expect(addObjective(period, `Hedef ${i + 1}`)).not.toBeNull()
    expect(canAddObjective(period)).toBe(false)
    expect(addObjective(period, 'Dördüncü hedef')).toBeNull()
    expect(period.objectives).toHaveLength(3)
  })
  it('hamleden yazılan hedef hamlenin adını kaynak olarak taşır', () => {
    const period = createPeriod(NOW)
    const o = addObjective(period, 'Durağa tezgâh kur', 'Durağa tezgâh kur')
    expect(o).toMatchObject({ title: 'Durağa tezgâh kur', sourceMove: 'Durağa tezgâh kur', indicators: [] })
  })
  it('bir hedefe en çok 5 gösterge yazılır, 4. göstergede uyarı çıkar', () => {
    const o = objective({ indicators: [] })
    expect(OKR_MAX_INDICATORS).toBe(5)
    for (let i = 0; i < 3; i++) addIndicator(o)
    expect(tooManyIndicators(o)).toBe(false)
    addIndicator(o)
    expect(tooManyIndicators(o)).toBe(true)
    expect(OKR_TOO_MANY).toBe('Üçten çok gösterge takibi zorlaştırır.')
    addIndicator(o)
    expect(canAddIndicator(o)).toBe(false)
    expect(addIndicator(o)).toBeNull()
    expect(o.indicators).toHaveLength(5)
  })
  it('yeni göstergenin başlangıç değeri ve varılacak sayısı boştur, sayı uydurulmaz', () => {
    const o = objective({ indicators: [] })
    expect(addIndicator(o)).toMatchObject({ name: '', baseline: null, target: null, checkIns: [] })
  })
})

describe('sayı okuma', () => {
  it('virgüllü ve noktalı sayıyı okur, sayı olmayanı boş sayar', () => {
    expect(parseNumber('14')).toBe(14)
    expect(parseNumber('2,5')).toBe(2.5)
    expect(parseNumber(' 95 ')).toBe(95)
    expect(parseNumber('')).toBeNull()
    expect(parseNumber('Bilinmiyor')).toBeNull()
    expect(parseNumber('Ekip belirler')).toBeNull()
    expect(parseNumber('1e999')).toBeNull()
  })
  it('noktayı binlik ayırıcı sayar: "1.500" bin beş yüzdür', () => {
    expect(parseNumber('1.500')).toBe(1500)
    expect(parseNumber('1.500,5')).toBe(1500.5)
    expect(parseNumber('12.345.678')).toBe(12345678)
    expect(parseNumber('2.5')).toBe(2.5)
    expect(parseNumber('1.50.0')).toBeNull()
  })
})

describe('puan', () => {
  it('(bugünkü − başlangıç) ÷ (varılacak − başlangıç) hesabıyla bulunur', () => {
    const g = indicator({ checkIns: [{ at: '2026-11-10T00:00:00.000Z', value: 14, confidence: 'belki' }] })
    expect(indicatorScore(g)).toBeCloseTo(7 / 23)
    expect(scoreText(indicatorScore(g))).toBe('Yüzde 30 ilerledi.')
  })
  it('son yazılan sayı geçerlidir', () => {
    const g = indicator({ checkIns: [{ at: '2026-11-03T00:00:00.000Z', value: 10, confidence: 'evet' }, { at: '2026-11-10T00:00:00.000Z', value: 30, confidence: 'evet' }] })
    expect(indicatorScore(g)).toBe(1)
  })
  it('puan 0 ile 1 arasında kalır', () => {
    expect(indicatorScore(indicator({ checkIns: [{ at: 'x', value: 50, confidence: 'evet' }] }))).toBe(1)
    expect(indicatorScore(indicator({ checkIns: [{ at: 'x', value: 2, confidence: 'hayir' }] }))).toBe(0)
  })
  it('düşmesi istenen göstergede de çalışır', () => {
    const g = indicator({ name: 'İade oranı', baseline: 10, target: 5, checkIns: [{ at: 'x', value: 8, confidence: 'belki' }] })
    expect(indicatorScore(g)).toBeCloseTo(0.4)
  })
  it('başlangıç ya da varılacak sayı yoksa puan hesaplanmaz, dolu sayılmaz', () => {
    expect(indicatorScore(indicator({ baseline: null, checkIns: [{ at: 'x', value: 14, confidence: 'evet' }] }))).toBeNull()
    expect(indicatorScore(indicator({ target: null, checkIns: [{ at: 'x', value: 14, confidence: 'evet' }] }))).toBeNull()
    expect(indicatorScore(indicator({ target: 7, checkIns: [{ at: 'x', value: 14, confidence: 'evet' }] }))).toBeNull()
    expect(indicatorScore(indicator())).toBeNull()
  })
  it('puan yoksa nedeni yazıyla söylenir', () => {
    expect(scoreText(null)).toBe('Puan henüz hesaplanmadı.')
  })
  it('hedefin puanı göstergelerin ortalamasıdır, hesaplanamayan gösterge sayılmaz', () => {
    const o = objective({
      indicators: [
        indicator({ id: 'a', checkIns: [{ at: 'x', value: 30, confidence: 'evet' }] }),
        indicator({ id: 'b', baseline: 0, target: 10, checkIns: [{ at: 'x', value: 5, confidence: 'belki' }] }),
        indicator({ id: 'c', baseline: null }),
      ],
    })
    expect(objectiveScore(o)).toBeCloseTo(0.75)
    expect(objectiveScore(objective({ indicators: [indicator({ baseline: null })] }))).toBeNull()
  })
  it('zorlu hedefte yüzde 70 iyi sonuç olarak anlatılır', () => {
    expect(scoreText(0.7, 'zorlu')).toBe('Yüzde 70 ilerledi. Zorlu hedefte yüzde 70 iyi bir sonuçtur.')
    expect(scoreText(0.7, 'kesin')).toBe('Yüzde 70 ilerledi. Kesin hedefte tam ulaşmak beklenir.')
  })
})

describe('iş gibi yazılan gösterge', () => {
  it('fiil ile biten ya da 0\'dan 1\'e giden gösterge iş sayılır', () => {
    expect(taskLike(indicator({ name: 'Amazon için yeni ürün fotoğrafları çekmek' }))).toBe(true)
    expect(taskLike(indicator({ name: 'Yeni site kurmak' }))).toBe(true)
    expect(taskLike(indicator({ name: 'Menüyü hazırlamak' }))).toBe(true)
    expect(taskLike(indicator({ name: 'Katalog yayınlamak' }))).toBe(true)
    expect(taskLike(indicator({ name: 'Şube açılması' }))).toBe(true)
    expect(taskLike(indicator({ name: 'Web sitesi', baseline: 0, target: 1 }))).toBe(true)
  })
  it('sonucu ölçen gösterge iş sayılmaz', () => {
    expect(taskLike(indicator({ name: 'Ödeyen müşteri sayısı' }))).toBe(false)
    expect(taskLike(indicator({ name: "Amazon ABD'de siparişe dönen ziyaret oranı" }))).toBe(false)
    expect(taskLike(indicator({ name: 'Günlük satılan ekmek' }))).toBe(false)
    expect(taskLike(indicator({ name: 'Açık sipariş sayısı' }))).toBe(false)
  })
})

describe('haftalık durum', () => {
  it('bugünkü sayıyı, tahmini ve notu kaydeder', () => {
    const g = indicator()
    expect(recordCheckIn(g, { value: 14, confidence: 'belki', note: 'Yağmur yağdı.' }, NOW)).toEqual([])
    expect(g.checkIns).toEqual([{ at: NOW.toISOString(), value: 14, confidence: 'belki', note: 'Yağmur yağdı.' }])
    expect(CONFIDENCE_LABEL).toEqual({ evet: 'Evet, büyük ihtimalle', belki: 'Belki', hayir: 'Hayır, zor görünüyor' })
  })
  it('sayı ya da tahmin yoksa kaydetmez ve nedenini söyler', () => {
    const g = indicator()
    expect(recordCheckIn(g, { value: null, confidence: 'evet' }, NOW)).toEqual(['"Ödeyen müşteri sayısı" için bugünkü sayıyı yazın.'])
    expect(recordCheckIn(g, { value: 3 }, NOW)).toEqual(['"Ödeyen müşteri sayısı" için tahmininizi seçin.'])
    expect(g.checkIns).toEqual([])
  })
  it('son 2 haftada sayı yazılmayan gösterge gecikmiş sayılır', () => {
    const period: OkrPeriod = { id: 'd', startsAt: '2026-10-01', endsAt: '2027-01-01', objectives: [] }
    expect(OKR_OVERDUE).toBe('Son 2 haftada sayı yazılmadı.')
    expect(indicatorOverdue(indicator(), period, NOW)).toBe(true)
    expect(indicatorOverdue(indicator({ checkIns: [{ at: '2026-11-10T00:00:00.000Z', value: 9, confidence: 'evet' }] }), period, NOW)).toBe(false)
    expect(indicatorOverdue(indicator({ checkIns: [{ at: '2026-11-01T00:00:00.000Z', value: 9, confidence: 'evet' }] }), period, NOW)).toBe(true)
    /* Yeni başlayan dönemde henüz gecikme yoktur. */
    expect(indicatorOverdue(indicator(), { ...period, startsAt: '2026-11-15' }, NOW)).toBe(false)
    /* Kapanan dönemde gecikme gösterilmez. */
    expect(indicatorOverdue(indicator(), { ...period, closedAt: '2026-11-18T00:00:00.000Z' }, NOW)).toBe(false)
  })
})

describe('dönem kapanışı', () => {
  it('öğrenilen yazılmadan dönem kapanmaz', () => {
    const s = state()
    const period = openPeriod(s)!
    expect(closePeriod(period, '  ', NOW)).toEqual(['"Bu dönemde ne öğrendiniz?" sorusunu cevaplayın.'])
    expect(period.closedAt).toBeUndefined()
  })
  it('kapanan dönem öğrenileni taşır, açık dönem kalmaz', () => {
    const s = state()
    const period = openPeriod(s)!
    expect(closePeriod(period, 'Kart satışı yağmurlu günde düşüyor.', NOW)).toEqual([])
    expect(period).toMatchObject({ closedAt: NOW.toISOString(), learned: 'Kart satışı yağmurlu günde düşüyor.' })
    expect(openPeriod(s)).toBeUndefined()
  })
  it('dönem özeti puanı yazıyla anlatır ve karar önermez', () => {
    const s = state()
    s.periods[0].objectives[0].indicators[0].checkIns = [{ at: 'x', value: 14, confidence: 'belki' }]
    const text = periodSummary(s.periods[0])
    expect(text).toBe('Aylık kartla düzenli müşteri kazanmak: yüzde 30 ilerledi.')
    expect(text).not.toMatch(/Sürdür|Düzelt|Yeniden aç/)
  })
})

describe('bozuk kayıt', () => {
  it('bozuk hedef takibi kaydı atılır, plan reddedilmez', () => {
    for (const junk of [null, 'açık', 42, [], { enabled: 'evet' }, { periods: [] }]) expect(sanitizeOkr(junk)).toBeUndefined()
  })
  it('geçerli kayıt aynen kalır', () => {
    const s = state()
    s.periods[0].objectives[0].indicators[0].checkIns = [{ at: '2026-11-10T00:00:00.000Z', value: 14, confidence: 'belki', note: 'Not' }]
    s.periods[0].taskLinks = { 'satir-1': 'g1' }
    expect(sanitizeOkr(structuredClone(s))).toEqual(s)
  })
  it('tarihi okunamayan dönem atılır', () => {
    const s = state()
    s.periods.push({ id: 'd2', startsAt: 'dün', endsAt: '2027-02-01', objectives: [] })
    expect(sanitizeOkr(s)!.periods.map((p) => p.id)).toEqual(['d1'])
  })
  it('bozuk parçalar atılır, sayı olmayan değer boş sayılır', () => {
    const raw = {
      enabled: true,
      changedAt: 5,
      periods: [
        'bozuk',
        {
          id: 'd1',
          startsAt: '2026-11-01',
          endsAt: '2027-02-01',
          objectives: [
            { id: 'h1', title: 'Hedef', kind: 'garip', indicators: [{ id: 'g1', name: 'Gösterge', baseline: 'Bilinmiyor', target: '30', checkIns: [{ at: 'x', value: 'on', confidence: 'evet' }, { at: 'y', value: 3, confidence: 'belki' }] }, 'bozuk'] },
            { id: 'h2', title: 'İki', indicators: [] },
            { id: 'h3', title: 'Üç', indicators: [] },
            { id: 'h4', title: 'Dört', indicators: [] },
          ],
          taskLinks: { a: 'g1', b: 7 },
        },
      ],
    }
    const s = sanitizeOkr(raw)!
    expect(s.changedAt).toBe('')
    expect(s.periods).toHaveLength(1)
    const o = s.periods[0].objectives
    expect(o).toHaveLength(3)
    expect(o[0].kind).toBeUndefined()
    expect(o[0].indicators).toEqual([{ id: 'g1', name: 'Gösterge', baseline: null, target: null, checkIns: [{ at: 'y', value: 3, confidence: 'belki' }] }])
    expect(s.periods[0].taskLinks).toEqual({ a: 'g1' })
  })
})
