import { describe, expect, it } from 'vitest'
import { emptyPlan, type PlanDoc } from './types'
import { CLUSTERS, clusterOf, clusterOfStage, clusterState, subStageOfStep } from './clusters'
import { STAGES } from './stages'
import { STEPS, STEP_IDS } from './registry'
import { DECISIONS, STRATEGY, STRATEGY_N } from './decisions'
import { buildDemoPlan } from './demo'
import { applyStrategyReview } from '@/engine/renewal'

/** Ana kümeler ve zorunlu alt aşamalar. Kural docs/sonraki-ana-asamalar-plani.md dosyasındadır. */

const done = (values: Record<string, unknown>) => ({ values, status: 'tamam' as const, updatedAt: '2026-11-15T00:00:00.000Z' })
function withTransition(p: PlanDoc): PlanDoc {
  p.decisions = [1, 2, 3, 4, 5].map((gate) => ({ id: `d${gate}`, gate, scope: '', criteria: [], suggested: 'ilerle', chosen: 'ilerle', reason: 'Gerekçe', retriesLeft: 1, decidedBy: 'Kurucu', decidedAt: '2026-11-01T00:00:00.000Z', revision: gate }))
  p.transitions = [{ id: 't1', outcome: 'hazir', suggested: 'hazir', reason: 'Dayanak yeterli.', decidedBy: 'Kurucu', decidedAt: '2026-11-10T00:00:00.000Z', reviewed: true, mandatoryMet: 9, mandatoryTotal: 9, supportingMet: 4, supportingTotal: 7, level: 3, revision: 6 }]
  return p
}
function withStrategy(p: PlanDoc): PlanDoc {
  p.steps['S21'] = done({ diagnosis: 'Öğleden sonra dükkân boş kalıyor.', diagnosisWhy: 'Satışın çoğu sabah geliyor.' })
  p.steps['S22'] = done({ options: [{ name: 'Durakta satış' }, { name: 'Öğle menüsü' }] })
  p.steps['S23'] = done({ tests: [{ option: 'Durakta satış', mustBeTrue: 'Yolcu durur.', weakest: 'Yolcu beklemez.' }, { option: 'Öğle menüsü', mustBeTrue: 'Çalışan öğlen çıkar.', weakest: 'Fiyat yüksek kalır.' }] })
  p.steps['19'] = done({ chosenPath: 'Durakta satış', choiceReason: 'En güçlü kanıt burada.', givenUp: 'Öğle satışı' })
  p.steps['S25'] = done({ moves: [{ move: 'Durağa tezgâh kur', capability: 'Hızlı servis' }] })
  p.steps['20'] = done({ dossier1: 'Profil', dossier2: 'Problem', dossier3: 'Talep', dossier4: 'Yol', dossier5: 'Para', dossier6: 'Varsayım', dossier7: 'Risk', dossier8: 'Durdurma', dossier9: 'Teşhis', dossier11: 'İlk teslim', counterView: 'Yolcu durmayabilir.', qualityCheck: ['a', 'b', 'c', 'd', 'e'], approvedBy: 'Kurucu' })
  return p
}

describe('ana kümeler', () => {
  it('üç ana küme vardır: strateji öncesi hazırlık, strateji oluşturma, strateji uygulama', () => {
    expect(CLUSTERS.map((c) => [c.n, c.key, c.title])).toEqual([
      [1, 'hazirlik', 'Strateji öncesi hazırlık'],
      [2, 'olusturma', 'Strateji oluşturma'],
      [3, 'uygulama', 'Strateji uygulama'],
    ])
  })
  it('her süreç bölümü tek bir kümeye bağlıdır ve sıra korunur', () => {
    expect(CLUSTERS.flatMap((c) => c.stages)).toEqual(STAGES.map((s) => s.key))
    for (const s of STAGES) expect(CLUSTERS.filter((c) => c.stages.includes(s.key))).toHaveLength(1)
    expect(clusterOfStage('gecis').key).toBe('hazirlik')
  })
  it('küme adı süreç bölümünün adıyla aynıdır', () => {
    expect(clusterOf('olusturma').title).toBe(STAGES.find((s) => s.key === 'strateji')!.title)
    expect(clusterOf('uygulama').title).toBe(STAGES.find((s) => s.key === 'uygulama')!.title)
    expect(clusterOf('olusturma').title).toBe(STRATEGY.title)
  })
  it('strateji oluşturma ve strateji uygulama beşer zorunlu alt aşama taşır', () => {
    expect(clusterOf('olusturma').subStages.map((s) => s.code)).toEqual(['2.1', '2.2', '2.3', '2.4', '2.5'])
    expect(clusterOf('uygulama').subStages.map((s) => s.code)).toEqual(['3.1', '3.2', '3.3', '3.4', '3.5'])
    expect(clusterOf('hazirlik').subStages).toEqual([])
  })
  it('her alt aşama en az üç bağımsız çerçeveye ve bir zorunluluk nedenine dayanır', () => {
    for (const s of CLUSTERS.flatMap((c) => c.subStages)) {
      expect([s.code, new Set(s.frameworks).size >= 3]).toEqual([s.code, true])
      expect([s.code, s.why.length > 10 && s.does.length > 10]).toEqual([s.code, true])
    }
  })
  it('alt aşamanın adımı tanımlıdır ve kendi kümesinin grubundadır', () => {
    for (const s of clusterOf('olusturma').subStages) for (const id of s.steps) expect([id, STEPS[id]?.decision]).toEqual([id, STRATEGY_N])
    for (const s of clusterOf('uygulama').subStages) for (const id of s.steps) expect([id, STEPS[id]?.decision]).toEqual([id, 6])
    /* Bir adım en çok bir alt aşamaya bağlıdır. */
    const all = CLUSTERS.flatMap((c) => c.subStages).flatMap((s) => s.steps)
    expect(new Set(all).size).toBe(all.length)
    expect(subStageOfStep('12')).toBeUndefined()
  })
  it('alt aşamanın adresi ve adı kendi adımıyla aynıdır', () => {
    for (const s of CLUSTERS.flatMap((c) => c.subStages)) {
      if (!s.steps.length) continue
      expect([s.code, s.path]).toEqual([s.code, `/karar/${STEPS[s.steps[0]].decision}/adim/${s.steps[0]}`])
      expect([s.code, s.title]).toEqual([s.code, STEPS[s.steps[0]].title])
      expect([s.code, STEPS[s.steps[0]].code]).toEqual([s.code, s.code])
    }
  })
  it('dayanak adlarında virgül yoktur, liste karışmaz', () => {
    for (const s of CLUSTERS.flatMap((c) => c.subStages)) for (const f of s.frameworks) expect([s.code, f.includes(',')]).toEqual([s.code, false])
  })
  it('strateji oluşturmanın her adımı ya bir alt aşamadır ya da çıkış kapısıdır', () => {
    const staged = clusterOf('olusturma').subStages.flatMap((s) => s.steps)
    expect(STRATEGY.steps.filter((id) => !staged.includes(id))).toEqual(['20'])
  })
  it('strateji uygulamanın plan adımları Karar 6\'nın başındadır ve Kapı 6 onları okumaz', () => {
    const k6 = DECISIONS.find((d) => d.n === 6)!
    expect(k6.steps.slice(0, 3)).toEqual(['U31', 'U32', 'U33'])
    const p = withStrategy(withTransition(emptyPlan('p', 'Plan')))
    const read = new Set<string>()
    const steps = new Proxy(p.steps, { get: (t, k, r) => (typeof k === 'string' && read.add(k), Reflect.get(t, k, r)) })
    k6.gate.criteria.forEach((c) => c.check({ ...p, steps }))
    expect([...read].filter((id) => id.startsWith('U'))).toEqual([])
  })
  it('yeni adımlar kısa yolda da görünür, çünkü hepsi zorunludur', () => {
    for (const id of STEP_IDS.filter((x) => STEPS[x].code)) expect([id, STEPS[id].shortPath, STEPS[id].mandatory]).toEqual([id, true, true])
  })
})

describe('kümenin durumu', () => {
  it('boş planda hazırlık başlamamıştır, öteki iki küme kilitlidir', () => {
    const p = emptyPlan('p', 'Plan')
    expect([clusterState(p, 'hazirlik'), clusterState(p, 'olusturma'), clusterState(p, 'uygulama')]).toEqual(['bos', 'kilitli', 'kilitli'])
  })
  it('örnek planda hazırlık sürer, geçiş kararı yoktur', () => {
    const p = buildDemoPlan()
    expect(clusterState(p, 'hazirlik')).toBe('suruyor')
    expect(clusterState(p, 'olusturma')).toBe('kilitli')
  })
  it('geçiş kararından sonra strateji oluşturma açılır, strateji uygulama kilitli kalır', () => {
    const p = withTransition(emptyPlan('p', 'Plan'))
    expect([clusterState(p, 'hazirlik'), clusterState(p, 'olusturma'), clusterState(p, 'uygulama')]).toEqual(['tamam', 'bos', 'kilitli'])
    p.steps['S21'] = { values: { diagnosis: 'Güçlük' }, status: 'taslak', updatedAt: '' }
    expect(clusterState(p, 'olusturma')).toBe('suruyor')
  })
  it('strateji belgesi onaylanınca strateji uygulama açılır ve hiç "tamam" olmaz', () => {
    const p = withStrategy(withTransition(emptyPlan('p', 'Plan')))
    expect([clusterState(p, 'olusturma'), clusterState(p, 'uygulama')]).toEqual(['tamam', 'bos'])
    p.steps['U31'] = done({ objective: 'İlk 10 müşteri', keyResults: [{ kr: 'Müşteri', target: '10' }] })
    expect(clusterState(p, 'uygulama')).toBe('suruyor')
    for (const gate of [6, 7, 8]) p.decisions.push({ ...p.decisions[0], id: `d${gate}`, gate })
    expect(clusterState(p, 'uygulama')).toBe('suruyor')
  })
  it('"yeniden aç" kararı strateji oluşturmayı sürüyor durumuna döndürür, strateji uygulamayı kilitlemez', () => {
    const p = withStrategy(withTransition(emptyPlan('p', 'Plan')))
    applyStrategyReview(p, { decidedBy: 'Kurucu', holds: 'hayir', decision: 'yenidenAc', reason: 'Müşteri üç aydır gelmiyor. Seçim tutmadı.' })
    expect(clusterState(p, 'olusturma')).toBe('suruyor')
    expect(clusterState(p, 'uygulama')).not.toBe('kilitli')
  })
  it('alt aşamanın durumu adımın kaydından okunur', () => {
    const p = withTransition(emptyPlan('p', 'Plan'))
    const s21 = clusterOf('olusturma').subStages[0]
    expect(s21.state(p)).toBe('bos')
    p.steps['S21'] = { values: { diagnosis: 'Güçlük' }, status: 'taslak', updatedAt: '' }
    expect(s21.state(p)).toBe('suruyor')
    p.steps['S21'].status = 'tamam'
    expect(s21.state(p)).toBe('tamam')
    const s35 = clusterOf('uygulama').subStages[4]
    expect(s35.state(p)).toBe('bos')
  })
})
