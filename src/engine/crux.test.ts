import { describe, expect, it } from 'vitest'
import { emptyPlan, type Evidence, type PlanDoc } from '@/data/types'
import { CONDITION_LABEL, conditionsCalc, cruxOf, freeBudget, matchRate, pathLinksOf, successConditionsOf } from './crux'

const ev = (id: string, title: string, counterFinding?: string): Evidence => ({ id, title, kind: 'gozlem', ladder: 3, linkedSteps: [], createdAt: '', updatedAt: '', counterFinding })

function plan(values: Record<string, unknown>, evidence: Evidence[] = []): PlanDoc {
  const p = emptyPlan('p', 'Plan')
  p.steps['18'] = { values, status: 'taslak', updatedAt: '' }
  p.evidence = evidence
  return p
}

describe('asıl engel', () => {
  it('engel yazılmadıysa kayıt yoktur', () => {
    expect(cruxOf(plan({ cruxWhy: 'Önemli' }))).toBeNull()
    expect(cruxOf(emptyPlan('p', 'Plan'))).toBeNull()
  })
  it('engeli, başka açıklamayı ve bağlı kanıtları döndürür', () => {
    const c = cruxOf(plan({ crux: 'İlgi satışa dönüşecek mi?', cruxWhy: 'Gider buna bağlı.', cruxPaths: 'Durakta kahve arabası', cruxAlt: 'Fiyat yüksek olabilir.', cruxSplit: 'İki fiyatla bir sabah satışı', cruxEvidence: ['k1'], cruxCounter: ['k2'] }, [ev('k1', '7 kişi ödedi'), ev('k2', '3 kişi pahalı buldu')]))
    expect(c).toEqual({ text: 'İlgi satışa dönüşecek mi?', why: 'Gider buna bağlı.', paths: 'Durakta kahve arabası', alternative: 'Fiyat yüksek olabilir.', split: 'İki fiyatla bir sabah satışı', support: ['7 kişi ödedi'], counter: ['3 kişi pahalı buldu'], missing: 0 })
  })
  it('silinen kanıtı sayar, uydurmaz', () => {
    const c = cruxOf(plan({ crux: 'Engel', cruxEvidence: ['k1', 'yok'] }, [ev('k1', 'Kanıt')]))
    expect(c?.support).toEqual(['Kanıt'])
    expect(c?.missing).toBe(1)
  })
})

describe('başarı koşulları', () => {
  const row = (patch: Record<string, unknown>) => ({ _id: 'a', condition: 'Sabah talebi gideri karşılar.', ...patch })
  it('koşulu olmayan satır sayılmaz', () => {
    expect(successConditionsOf(plan({ successConditions: [{ _id: 'x', measure: 'Günlük satış' }] }))).toEqual([])
  })
  it('bağlı kanıt yoksa koşul sınanmamıştır', () => {
    expect(successConditionsOf(plan({ successConditions: [row({})] }))[0].status).toBe('sinanmadi')
  })
  it('yalnız destek varsa "Destek var" olur', () => {
    expect(successConditionsOf(plan({ successConditions: [row({ support: ['k1'] })] }, [ev('k1', 'A')]))[0].status).toBe('destek')
  })
  it('yalnız karşı bulgu varsa "Karşı bulgu var" olur', () => {
    expect(successConditionsOf(plan({ successConditions: [row({ counter: ['k1'] })] }, [ev('k1', 'A')]))[0].status).toBe('karsi')
  })
  it('iki yönde de bulgu varsa "Bulgular çelişiyor" olur ve ikisi de görünür', () => {
    const c = successConditionsOf(plan({ successConditions: [row({ support: ['k1'], counter: ['k2'] })] }, [ev('k1', 'A'), ev('k2', 'B')]))[0]
    expect(c.status).toBe('celiski')
    expect(c.support).toEqual(['A'])
    expect(c.counter).toEqual(['B'])
  })
  it('destekleyen kanıtın kendi karşı bulgusu da çelişki sayılır', () => {
    const c = successConditionsOf(plan({ successConditions: [row({ support: ['k1'] })] }, [ev('k1', 'A', 'Üç kişi fiyatı yüksek buldu.')]))[0]
    expect(c.status).toBe('celiski')
    expect(c.counter).toEqual(['Üç kişi fiyatı yüksek buldu.'])
  })
  it('silinen kanıt destek sayılmaz ve eksik bağlantı olarak bildirilir', () => {
    const c = successConditionsOf(plan({ successConditions: [row({ support: ['yok'] })] }))[0]
    expect(c.status).toBe('sinanmadi')
    expect(c.missing).toBe(1)
  })
  it('ölçülmemiş başlangıç "Bilinmiyor" olur, ölçülen sıfır "0" kalır', () => {
    const [a, b] = successConditionsOf(plan({ successConditions: [row({ baseline: '' }), row({ _id: 'b', baseline: '0' })] }))
    expect(a.baseline).toBe('Bilinmiyor')
    expect(b.baseline).toBe('0')
  })
  it('denemeden sonra seçilen sınır işaretlenir', () => {
    const [a, b] = successConditionsOf(plan({ successConditions: [row({ threshold: '40', thresholdWhen: 'sonra' }), row({ _id: 'b', threshold: '40', thresholdWhen: 'once' })] }))
    expect(a.thresholdLate).toBe(true)
    expect(b.thresholdLate).toBe(false)
  })
  it('aynı kanıt iki koşula bağlanabilir', () => {
    const list = successConditionsOf(plan({ successConditions: [row({ support: ['k1'] }), row({ _id: 'b', condition: 'İkinci koşul', support: ['k1'] })] }, [ev('k1', 'A')]))
    expect(list.map((c) => c.support)).toEqual([['A'], ['A']])
  })
  it('sonuç kutusu her koşulu durumuyla yazar', () => {
    const r = conditionsCalc({ successConditions: [row({ support: ['k1'] }), row({ _id: 'b', condition: 'İkinci koşul' })] }, plan({}, [ev('k1', 'A')]))
    expect(r?.value).toBe('2 koşuldan 1 tanesi sınandı')
    expect(r?.lines).toEqual([`Sabah talebi gideri karşılar. ${CONDITION_LABEL.destek}.`, `İkinci koşul. ${CONDITION_LABEL.sinanmadi}.`])
    expect(conditionsCalc({ successConditions: [] }, plan({}))).toBeNull()
  })
})

describe('yol bağları', () => {
  it('ilişkisi seçilmemiş bağ "Bilinmiyor" sayılır', () => {
    const links = pathLinksOf(plan({ pathLinks: [{ path: 'Kafe salonu', a: 'Hızlı servis', b: 'Tek çalışan', relation: 'celisiyor', reason: 'Tek kişi yetişmez.' }, { path: 'Araba', a: 'Durak', b: 'Sabah saati' }, { path: '', a: '', b: '' }] }))
    expect(links.map((l) => l.relation)).toEqual(['celisiyor', 'bilinmiyor'])
    expect(links[0].reason).toBe('Tek kişi yetişmez.')
  })
})

describe('serbest bütçe', () => {
  const tl = (n: number) => n * 100
  function money(values: Record<string, unknown>, budget: number | null = tl(100_000)): PlanDoc {
    const p = emptyPlan('p', 'Plan')
    p.limits.budgetKurus = budget ?? undefined
    p.steps['16'] = { values, status: 'taslak', updatedAt: '' }
    return p
  }
  it('bütçeden harcananı ve ödenmemiş taahhüdü düşer', () => {
    const p = money({ commitmentsKnown: 'var', spentKurus: tl(30_000), commitments: [{ what: 'Kira', amountKurus: tl(50_000) }] })
    expect(freeBudget(p)).toEqual({ state: 'hesap', budgetKurus: tl(100_000), spentKurus: tl(30_000), permitsKurus: 0, unpaidKurus: tl(50_000), freeKurus: tl(20_000) })
  })
  it('taahhüt yoksa yalnız harcananı düşer', () => {
    expect(freeBudget(money({ commitmentsKnown: 'yok', spentKurus: tl(30_000) }))).toMatchObject({ state: 'hesap', unpaidKurus: 0, freeKurus: tl(70_000) })
  })
  it('taahhüt bilinmiyorsa kesin bakiye yazmaz', () => {
    expect(freeBudget(money({ commitmentsKnown: 'bilinmiyor', spentKurus: tl(30_000) }))).toEqual({ state: 'bilinmiyor' })
  })
  it('soru cevaplanmadıysa ya da bütçe yoksa hesap yoktur', () => {
    expect(freeBudget(money({ spentKurus: tl(30_000) }))).toEqual({ state: 'yok' })
    expect(freeBudget(money({ commitmentsKnown: 'yok' }, null))).toEqual({ state: 'yok' })
  })
  it('koşullu izne bağlı tutarı bir kez düşer', () => {
    const p = money({ commitmentsKnown: 'yok', spentKurus: tl(10_000) })
    p.decisions = [{ id: 'd', gate: 1, scope: '', criteria: [], suggested: 'kosulluIlerle', chosen: 'kosulluIlerle', reason: '', retriesLeft: 1, decidedBy: 'K', decidedAt: '', revision: 1, conditional: { scope: 'Deneme', amountKurus: tl(5_000), deadline: '2027-01-01', owner: 'K', closingEvidence: 'Fiş', issuedAt: '2026-11-01' } }]
    expect(freeBudget(p)).toMatchObject({ permitsKurus: tl(5_000), freeKurus: tl(85_000) })
  })
})

describe('eşleşme oranı', () => {
  it('pay ve paydadan yüzdeyi hesaplar', () => {
    expect(matchRate(20, 8)).toEqual({ state: 'hesap', percent: 40 })
  })
  it('geçerli talep sıfırsa oran hesaplanmaz', () => {
    expect(matchRate(0, 0)).toEqual({ state: 'sifir' })
  })
  it('ölçüm yoksa oran bilinmez', () => {
    expect(matchRate(undefined, 3)).toEqual({ state: 'yok' })
    expect(matchRate(20, undefined)).toEqual({ state: 'yok' })
  })
  it('uygun teklif geçerli talebi geçerse oran yazılmaz', () => {
    expect(matchRate(5, 8)).toEqual({ state: 'hata' })
  })
  it('ölçülen sıfır eşleşme yüzde sıfırdır', () => {
    expect(matchRate(20, 0)).toEqual({ state: 'hesap', percent: 0 })
  })
})
