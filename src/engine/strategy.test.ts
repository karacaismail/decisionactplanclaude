import { describe, expect, it } from 'vitest'
import { emptyPlan, type PlanDoc } from '@/data/types'
import { STRATEGY } from '@/data/decisions'
import { STEPS } from '@/data/registry'
import { requiredKeys } from '@/components/FormRenderer'
import { evaluateGate, strategyApproved, strategyDone, validateDecision } from './gate'
import { DECISIONS } from '@/data/decisions'
import { applyStrategyReview, lastStrategyReview, reviewBlocked, strategyReopened, validateReview } from './renewal'
import { choiceOf, diagnosisOf, goalIssues, moveIssues, movesOf, optionIssues, optionsOf, resourceCalc, resourceIssues, taskIssues, testIssues, testsCalc, untestedOptions } from './strategy'

/** Strateji oluşturma ve strateji uygulama adımlarının kuralları. */

const done = (values: Record<string, unknown>) => ({ values, status: 'tamam' as const, updatedAt: '2026-11-15T00:00:00.000Z' })
function full(): PlanDoc {
  const p = emptyPlan('p', 'Plan')
  p.transitions = [{ id: 't1', outcome: 'hazir', suggested: 'hazir', reason: 'Dayanak yeterli.', decidedBy: 'Kurucu', decidedAt: '2026-11-10T00:00:00.000Z', reviewed: true, mandatoryMet: 9, mandatoryTotal: 9, supportingMet: 4, supportingTotal: 7, level: 3, revision: 1 }]
  p.steps['S21'] = done({ diagnosis: 'Öğleden sonra dükkân boş kalıyor.', diagnosisWhy: 'Satışın çoğu sabah geliyor.' })
  p.steps['S22'] = done({ options: [{ name: 'Durakta satış', source: 'hazirlik' }, { name: 'Öğle menüsü', source: 'yeni' }] })
  p.steps['S23'] = done({ tests: [{ option: 'Durakta satış', mustBeTrue: 'Yolcu durur.', weakest: 'Yolcu beklemez.', result: 'destek' }, { option: 'Öğle menüsü', mustBeTrue: 'Çalışan öğlen çıkar.', weakest: 'Fiyat yüksek kalır.', result: 'karsi' }] })
  p.steps['19'] = done({ chosenPath: 'Durakta satış', choiceReason: 'En güçlü kanıt burada.', winningAim: 'Sabah kahvesinde ilk tercih olmak.', playField: 'Durak çevresi.', givenUp: 'Öğle satışı' })
  p.steps['S25'] = done({ moves: [{ move: 'Durağa tezgâh kur', serves: 'Yolcuya ulaşır.', capability: 'Hızlı servis', have: 'kurulacak' }] })
  p.steps['20'] = done({ dossier1: 'Profil', dossier2: 'Problem', dossier3: 'Talep', dossier4: 'Yol', dossier5: 'Para', dossier6: 'Varsayım', dossier7: 'Risk', dossier8: 'Durdurma', dossier9: 'Teşhis', dossier11: 'İlk teslim', counterView: 'Yolcu durmayabilir.', qualityCheck: ['a', 'b', 'c', 'd', 'e'], approvedBy: 'Kurucu' })
  return p
}

describe('strateji oluşturmanın çıkış kapısı', () => {
  it('altı koşulun hepsi dolunca strateji oluşturma biter', () => {
    expect(STRATEGY.gate.criteria.map((c) => c.id)).toEqual(['teshis', 'secenek', 'sinama', 'yol', 'hamle', 'dosya'])
    expect(strategyDone(full())).toBe(true)
  })
  const cases: [string, (p: PlanDoc) => void][] = [
    ['teşhis yoksa', (p) => delete p.steps['S21']],
    ['teşhisin dayanağı yoksa', (p) => (p.steps['S21'].values.diagnosisWhy = '')],
    ['tek seçenek varsa', (p) => (p.steps['S22'].values.options = [{ name: 'Durakta satış' }])],
    ['iki seçenek aynı adı taşıyorsa', (p) => (p.steps['S22'].values.options = [{ name: 'Durakta satış' }, { name: ' durakta satış ' }])],
    ['tek yol sınandıysa', (p) => (p.steps['S23'].values.tests = [{ option: 'Durakta satış', mustBeTrue: 'Yolcu durur.', weakest: 'Yolcu beklemez.' }])],
    ['en zayıf koşul yazılmadıysa', (p) => (p.steps['S23'].values.tests = [{ option: 'A', mustBeTrue: 'x' }, { option: 'B', mustBeTrue: 'y' }])],
    ['vazgeçilenler yazılmadıysa', (p) => (p.steps['19'].values.givenUp = '')],
    ['ana hamle yoksa', (p) => (p.steps['S25'].values.moves = [])],
    ['hamlenin yetkinliği yazılmadıysa', (p) => (p.steps['S25'].values.moves = [{ move: 'Tezgâh kur' }])],
    ['karar sahibi onaylamadıysa', (p) => (p.steps['20'].values.approvedBy = '')],
    ['strateji belgesinin bir başlığı boşsa', (p) => (p.steps['20'].values.dossier9 = '')],
    ['bir seçenek sınanmadıysa', (p) => (p.steps['S22'].values.options = [{ name: 'Durakta satış' }, { name: 'Öğle menüsü' }, { name: 'Gece satışı' }])],
    ['bir hamlenin yetkinliği eksikse', (p) => (p.steps['S25'].values.moves = [{ move: 'Tezgâh kur', capability: 'Servis' }, { move: 'Tabela as' }])],
  ]
  for (const [name, change] of cases) {
    it(`${name} strateji oluşturma bitmez`, () => {
      const p = full()
      change(p)
      expect(strategyDone(p)).toBe(false)
    })
  }
})

describe('adım kuralları', () => {
  it('seçim adımı beş alanı ister: yol, gerekçe, kazanma hedefi, saha ve vazgeçilenler', () => {
    const p = full()
    expect(requiredKeys(STEPS['19'], p, p.steps['19'].values)).toEqual(['chosenPath', 'choiceReason', 'winningAim', 'playField', 'givenUp'])
    expect(choiceOf(p)).toMatchObject({ path: 'Durakta satış', aim: 'Sabah kahvesinde ilk tercih olmak.', field: 'Durak çevresi.' })
  })
  it('teşhis yazılmadıysa okuyucu boş döner', () => {
    expect(diagnosisOf(emptyPlan('p', 'Plan'))).toBeNull()
    expect(diagnosisOf(full())?.text).toBe('Öğleden sonra dükkân boş kalıyor.')
  })
  it('tek seçenek seçim sayılmaz', () => {
    expect(optionIssues({ options: [{ name: 'A' }] })).toEqual(['En az iki farklı yol yazın. Tek seçenek bir seçim değildir.'])
    expect(optionIssues({ options: [{ name: 'A' }, { name: 'a' }, { name: 'B' }] })).toEqual(['Aynı adı taşıyan iki yol var. Yollara ayrı ad verin.'])
    expect(optionIssues({ options: [{ name: 'A' }, { name: 'B' }] })).toEqual([])
    expect(optionsOf(full()).map((o) => [o.name, o.source])).toEqual([['Durakta satış', 'hazirlik'], ['Öğle menüsü', 'yeni']])
  })
  it('sınaması eksik seçeneği adıyla söyler', () => {
    const p = full()
    expect(untestedOptions(p)).toEqual([])
    const v = { tests: [{ option: 'Durakta satış', mustBeTrue: 'Yolcu durur.', weakest: 'Yolcu beklemez.' }, { option: 'Başka yol', mustBeTrue: 'x', weakest: 'y' }] }
    expect(testIssues(v, p)).toEqual(['Şu yolun sınaması eksik: Öğle menüsü.'])
    expect(testIssues({ tests: [] }, p)[0]).toBe('En az iki yolu sınayın. Her yol için koşulu ve en zayıf koşulu yazın.')
  })
  it('sınama özeti koşulu tutmayan yolu gösterir ama yol elemez', () => {
    const p = full()
    const r = testsCalc(p.steps['S23'].values, p)!
    expect(r.value).toBe('2 / 2 yol sınandı')
    expect(r.lines).toContain('Koşulu tutmayan yol: Öğle menüsü.')
    expect(r.warn).toContain('Yazılım yol elemez.')
    expect(testsCalc({ tests: [] }, p)).toBeNull()
  })
  it('ana hamle yetkinliksiz kalamaz', () => {
    expect(moveIssues({ moves: [] })).toEqual(['En az bir ana hamle yazın.'])
    expect(moveIssues({ moves: [{ move: 'Tezgâh kur' }] })).toEqual(['"Tezgâh kur" hamlesi için gereken yetkinliği yazın.'])
    expect(movesOf(full())[0]).toMatchObject({ move: 'Durağa tezgâh kur', have: 'kurulacak' })
  })
  it('gösterge hedef sayısız, iş sorumlusuz ve tarihsiz kalamaz', () => {
    const p = full()
    expect(goalIssues({ keyResults: [{ kr: 'Müşteri sayısı' }] })).toEqual(['"Müşteri sayısı" göstergesi için hedef sayıyı yazın.'])
    expect(goalIssues({ keyResults: [{ kr: 'Müşteri sayısı', target: '30' }] })).toEqual([])
    expect(taskIssues({ now: [{ action: 'Tezgâhı kur', owner: 'Ali' }] }, p)).toEqual(['"Tezgâhı kur" işi için sorumlu ve bitiş tarihi yazın.'])
    expect(taskIssues({ now: [{ action: 'Tezgâhı kur', owner: 'Ali', dueDate: '2026-12-01' }] }, p)).toEqual([])
  })
  it('kaynak hesabı bağlanan parayı harcama sınırıyla karşılaştırır ve bilinmeyeni uydurmaz', () => {
    const p = full()
    p.limits.budgetKurus = 100_000_00
    const v = { resources: [{ item: 'Tezgâh', budgetKurus: 80_000_00 }, { item: 'Tabela', budgetKurus: 30_000_00 }, { item: 'Eğitim', people: 'Ali, haftada 4 saat' }] }
    const r = resourceCalc(v, p)!
    expect(r.lines[0]).toContain('3 iş için kaynak yazıldı.')
    expect(r.lines).toContain('1 işin bütçesi yazılmadı. Toplam bu işleri saymaz.')
    expect(r.warn).toContain('harcama sınırını')
    expect(resourceIssues(v, p)).toEqual([])
    expect(resourceIssues({ resources: [{ item: 'Tezgâh' }] }, p)).toEqual(['"Tezgâh" için para ya da kişi yazın.'])
    expect(resourceIssues({ resources: [] }, p)).toEqual(['En az bir iş için kaynak yazın.'])
    const none = emptyPlan('q', 'Plan')
    expect(resourceCalc({ resources: [{ item: 'Tezgâh', budgetKurus: 1 }] }, none)!.lines).toContain('Harcama sınırı yazılmadı. Karşılaştırma yapılamadı.')
  })
})

describe('stratejiyi sınama ve yenileme', () => {
  const draft = { decidedBy: 'Kurucu', holds: 'kismen' as const, decision: 'duzelt' as const, reason: 'Sabah satışı tuttu, öğle satışı tutmadı.' }
  it('eksik taslak kaydedilmez ve nedenini söyler', () => {
    expect(validateReview({ decidedBy: '', reason: 'kısa' })).toEqual([
      '"Seçim hâlâ doğru mu?" sorusunu cevaplayın.',
      'Bir karar seçin: sürdür, düzelt ya da yeniden aç.',
      'Gerekçeyi en az 20 harfle yazın.',
      'Karar sahibinin adını yazın.',
    ])
    expect(applyStrategyReview(full(), { decidedBy: '', reason: '' })).toBeNull()
  })
  it('cevap ile karar çelişemez', () => {
    expect(validateReview({ ...draft, holds: 'hayir', decision: 'surdur' })).toEqual(['Seçim artık doğru değilse "Sürdür" kararı verilemez. "Düzelt" ya da "Yeniden aç" seçin.'])
    expect(validateReview({ ...draft, holds: 'evet', decision: 'yenidenAc' })).toEqual(['Seçim hâlâ doğruysa "Yeniden aç" kararı verilemez. "Sürdür" ya da "Düzelt" seçin.'])
  })
  it('"sürdür" ve "düzelt" kararı stratejiyi yeniden açmaz', () => {
    const p = full()
    const before = p.revision
    expect(applyStrategyReview(p, draft)?.decision).toBe('duzelt')
    expect(p.revision).toBe(before + 1)
    expect(strategyReopened(p)).toBe(false)
    expect(p.steps['20'].status).toBe('tamam')
    expect(lastStrategyReview(p)?.reason).toBe(draft.reason)
  })
  it('"yeniden aç" kararı strateji belgesini taslağa döndürür, onayı siler ve kapı kararlarını eskitir', () => {
    const p = full()
    p.steps['20'].values.approvedAt = '2026-11-14'
    p.decisions = [{ id: 'd6', gate: 6, scope: '', criteria: [], suggested: 'ilerle', chosen: 'ilerle', reason: 'Gerekçe', retriesLeft: 1, decidedBy: 'Kurucu', decidedAt: '2026-11-01T00:00:00.000Z', revision: 1 }]
    const r = applyStrategyReview(p, { ...draft, holds: 'hayir', decision: 'yenidenAc' })
    expect(r?.clearedApproval).toBe('Kurucu, 2026-11-14')
    expect(strategyReopened(p)).toBe(true)
    expect(p.steps['20'].status).toBe('taslak')
    expect(p.steps['20'].values.approvedBy).toBe('')
    expect(p.decisions[0].stale).toBe(true)
    /* Strateji bitmiş sayılmaz ama strateji uygulama kilitlenmez. Seçimin kaydı durur. */
    expect(strategyDone(p)).toBe(false)
    expect(strategyApproved(p)).toBe(true)
    expect(choiceOf(p)?.path).toBe('Durakta satış')
  })
  it('yeniden açmadan sonraki "düzelt" kaydı açık stratejiyi kapatmaz', () => {
    const p = full()
    applyStrategyReview(p, { ...draft, holds: 'hayir', decision: 'yenidenAc' }, new Date('2026-11-15T10:00:00.000Z'))
    applyStrategyReview(p, draft, new Date('2026-11-15T11:00:00.000Z'))
    expect(lastStrategyReview(p)?.decision).toBe('duzelt')
    expect(strategyReopened(p)).toBe(true)
  })
  it('strateji belgesi yeniden onaylanınca strateji kapanır', () => {
    const p = full()
    applyStrategyReview(p, { ...draft, holds: 'hayir', decision: 'yenidenAc' }, new Date('2026-11-15T10:00:00.000Z'))
    p.steps['20'] = { values: { ...p.steps['20'].values, approvedBy: 'Kurucu' }, status: 'tamam', updatedAt: '2026-11-15T12:00:00.000Z' }
    expect(strategyReopened(p)).toBe(false)
    expect(strategyDone(p)).toBe(true)
  })
  it('strateji uygulama kilitliyken gözden geçirme kaydı yapılmaz', () => {
    const p = emptyPlan('p', 'Plan')
    expect(reviewBlocked(p)).toBe('Gözden geçirme kaydı, strateji belgesi onaylanınca açılır.')
    expect(applyStrategyReview(p, draft)).toBeNull()
  })
})

describe('eski sürümde tamamlanan strateji', () => {
  it('yeni alt aşamalar boş olsa da strateji bitmiş sayılır', () => {
    const p = emptyPlan('p', 'Plan')
    expect(strategyDone(p)).toBe(false)
    p.legacyStrategy = { migratedAt: '2026-11-15T00:00:00.000Z' }
    expect(strategyDone(p)).toBe(true)
  })
  it('"yeniden aç" kararı eski sürümün iznini kaldırır ama uygulamayı kilitlemez', () => {
    const p = full()
    for (const id of ['S21', 'S22', 'S23', 'S25']) delete p.steps[id]
    p.legacyStrategy = { migratedAt: '2026-11-15T00:00:00.000Z' }
    expect(strategyDone(p)).toBe(true)
    applyStrategyReview(p, { decidedBy: 'Kurucu', holds: 'hayir', decision: 'yenidenAc', reason: 'Müşteri üç aydır gelmiyor, seçim tutmadı.' })
    expect(p.legacyStrategy).toBeUndefined()
    expect(strategyDone(p)).toBe(false)
    expect(strategyApproved(p)).toBe(true)
    /* Belge yeniden onaylansa da alt aşamalar boşsa strateji bitmez. Eski izin geri gelmez. */
    p.steps['20'] = { values: { ...p.steps['20'].values, approvedBy: 'Kurucu' }, status: 'tamam', updatedAt: '2099-01-01T00:00:00.000Z' }
    expect(strategyDone(p)).toBe(false)
  })
})

describe('kapı kaydı kilide bakar', () => {
  it('Karar 6 kilitliyken Kapı 7 "İlerle" kaydedilmez', () => {
    const p = full()
    delete p.transitions
    p.decisions = [6].map((gate) => ({ id: `d${gate}`, gate, scope: '', criteria: [], suggested: 'ilerle' as const, chosen: 'ilerle' as const, reason: 'Gerekçe', retriesLeft: 1, decidedBy: 'Kurucu', decidedAt: '2026-11-01T00:00:00.000Z', revision: 1 }))
    /* Geçiş kararı yok. Karar 6 ve Karar 7 kilitlidir. */
    const def = DECISIONS.find((d) => d.n === 7)!.gate
    const errors = validateDecision(def, p, evaluateGate(def, p), { chosen: 'ilerle', reason: 'Uzun bir gerekçe yazıldı burada.', secondOpinion: 'Ali' })
    expect(errors).toContain('Geçiş kapısında "Planlamaya hazır" ya da "Koşullu hazır" kararı yok.')
  })

})
