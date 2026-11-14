import { describe, expect, it } from 'vitest'
import { buildDemoPlan } from '@/data/demo'
import { emptyPlan, type Decision, type PlanDoc, type TransitionRecord } from '@/data/types'
import { evaluateReadiness, effectiveTransition, transitionPassed, validateTransition, validationLevel, type TransitionDraft } from './readiness'
import { decisionLocked } from './gate'
import { markStale } from './changes'

function decision(gate: number, patch: Partial<Decision> = {}): Decision {
  return { id: `d${gate}`, gate, scope: 'Deneme', criteria: [], suggested: 'ilerle', chosen: 'ilerle', reason: 'Gerekçe', retriesLeft: 1, decidedBy: 'Kurucu', decidedAt: '2026-11-01T00:00:00.000Z', revision: gate, ...patch }
}
function transition(patch: Partial<TransitionRecord> = {}): TransitionRecord {
  return { id: 't1', outcome: 'hazir', suggested: 'hazir', reason: 'Dayanak yeterli.', decidedBy: 'Kurucu', decidedAt: '2026-11-10T00:00:00.000Z', reviewed: true, mandatoryMet: 9, mandatoryTotal: 9, supportingMet: 4, supportingTotal: 6, level: 5, revision: 6, ...patch }
}
const draft = (patch: Partial<TransitionDraft> = {}): TransitionDraft => ({ outcome: 'degil', reason: 'Eksik kanıt var.', decidedBy: 'Kurucu', reviewed: true, ...patch })

describe('doğrulama seviyesi', () => {
  it('boş planda sıfırdır', () => {
    expect(validationLevel(emptyPlan('p', 'Plan'))).toBe(0)
  })
  it('kapılar sırayla sayılır, atlanan kapı seviyeyi durdurur', () => {
    const p = emptyPlan('p', 'Plan')
    p.decisions = [decision(1), decision(2), decision(4)]
    expect(validationLevel(p)).toBe(2)
  })
  it('eskiyen karar seviyeyi düşürür', () => {
    const p = emptyPlan('p', 'Plan')
    p.decisions = [decision(1), decision(2, { stale: true })]
    expect(validationLevel(p)).toBe(1)
  })
})

describe('evaluateReadiness', () => {
  it('boş planda öneri "Henüz hazır değil" olur', () => {
    const r = evaluateReadiness(emptyPlan('p', 'Plan'))
    expect(r.suggested).toBe('degil')
    expect(r.mandatory).toHaveLength(9)
    expect(r.supporting).toHaveLength(6)
    expect(r.mandatoryMet).toBe(0)
  })
  it('ikinci okur yazılınca destekleyici ölçüt karşılanır', () => {
    const p = emptyPlan('p', 'Plan')
    expect(evaluateReadiness(p).supporting.find((c) => c.id === 'D6')?.met).toBe(false)
    expect(evaluateReadiness(p, { secondReader: 'Mehmet' }).supporting.find((c) => c.id === 'D6')?.met).toBe(true)
  })
  it('örnek plan öneri üretir ve her ölçüt bir adıma bağlıdır', () => {
    const r = evaluateReadiness(buildDemoPlan())
    expect(['hazir', 'kosullu', 'degil']).toContain(r.suggested)
    for (const c of [...r.mandatory, ...r.supporting]) expect(c.step).toMatch(/^\d\d$/)
  })
  it('güçlü kanıt silinince bağlılık ölçütü düşer', () => {
    const p: PlanDoc = buildDemoPlan()
    const before = evaluateReadiness(p).mandatory.find((c) => c.id === 'Z6')?.met
    p.evidence = []
    const after = evaluateReadiness(p).mandatory.find((c) => c.id === 'Z6')?.met
    if (before === true) expect(after).toBe(false)
    else expect(after).not.toBe(true)
  })
})

describe('geçiş kararı', () => {
  it('karar yokken strateji çalışması ve Karar 6 kilitlidir', () => {
    const p = emptyPlan('p', 'Plan')
    p.decisions = [1, 2, 3, 4, 5].map((n) => decision(n))
    expect(transitionPassed(p)).toBe(false)
    expect(decisionLocked(p, 9)).toBe(true)
    expect(decisionLocked(p, 6)).toBe(true)
  })
  it('"Planlamaya hazır" kararı kilidi açar', () => {
    const p = emptyPlan('p', 'Plan')
    p.transitions = [transition()]
    expect(transitionPassed(p)).toBe(true)
    expect(decisionLocked(p, 9)).toBe(false)
    expect(decisionLocked(p, 6)).toBe(false)
  })
  it('"Henüz hazır değil" kararı kilidi açmaz', () => {
    const p = emptyPlan('p', 'Plan')
    p.transitions = [transition({ outcome: 'degil' })]
    expect(transitionPassed(p)).toBe(false)
  })
  it('koşullu kararın son tarihi geçince sonuç "Henüz hazır değil" olur', () => {
    const t = transition({ outcome: 'kosullu', conditional: { topic: 'Fiyat', openQuestion: 'Fiyat tutar mı?', owner: 'Kurucu', deadline: '2026-11-12T00:00:00.000Z' } })
    expect(effectiveTransition(t, new Date('2026-11-11T00:00:00.000Z'))).toBe('kosullu')
    expect(effectiveTransition(t, new Date('2026-11-14T00:00:00.000Z'))).toBe('degil')
  })
  it('temel adımı değişince geçiş kararı eskir, uygulama adımı değişince eskimez', () => {
    const p = emptyPlan('p', 'Plan')
    p.transitions = [transition()]
    markStale(p, 6)
    expect(p.transitions[0].stale).toBeFalsy()
    markStale(p, 2)
    expect(p.transitions[0].stale).toBe(true)
    expect(transitionPassed(p)).toBe(false)
  })
})

describe('validateTransition', () => {
  const empty = emptyPlan('p', 'Plan')
  const notReady = evaluateReadiness(empty)

  it('gerekçe, karar sahibi ve inceleme kutusu zorunludur', () => {
    const errors = validateTransition(empty, notReady, draft({ reason: '', decidedBy: '', reviewed: false }))
    expect(errors).toHaveLength(3)
  })
  it('zorunlu ölçüt eksikken "hazır" ya da "koşullu" kaydedilmez', () => {
    expect(validateTransition(empty, notReady, draft({ outcome: 'hazir' })).join(' ')).toContain('yalnız "Henüz hazır değil"')
    expect(validateTransition(empty, notReady, draft({ outcome: 'kosullu', conditional: { topic: 'a', openQuestion: 'b', owner: 'c', deadline: '2026-12-01' } })).join(' ')).toContain('yalnız "Henüz hazır değil"')
  })
  it('"Henüz hazır değil" eksiksiz taslakla kaydedilir', () => {
    expect(validateTransition(empty, notReady, draft())).toEqual([])
  })
  it('koşullu karar dört alan ister ve plan bitişini geçemez', () => {
    const p = emptyPlan('p', 'Plan')
    p.limits.deadline = '2026-12-31'
    const ev = { ...notReady, suggested: 'kosullu' as const }
    expect(validateTransition(p, ev, draft({ outcome: 'kosullu' })).length).toBeGreaterThanOrEqual(4)
    const late = validateTransition(p, ev, draft({ outcome: 'kosullu', conditional: { topic: 'Fiyat', openQuestion: 'Tutar mı?', owner: 'Kurucu', deadline: '2027-02-01' } }))
    expect(late.join(' ')).toContain('bitiş tarihini geçemez')
    expect(validateTransition(p, ev, draft({ outcome: 'kosullu', conditional: { topic: 'Fiyat', openQuestion: 'Tutar mı?', owner: 'Kurucu', deadline: '2026-12-01' } }))).toEqual([])
  })
  it('koşullu öneriyi "hazır" diye aşmak ikinci görüş ve uzun gerekçe ister', () => {
    const ev = { ...notReady, suggested: 'kosullu' as const }
    expect(validateTransition(empty, ev, draft({ outcome: 'hazir', reason: 'Kısa' })).length).toBe(2)
    expect(validateTransition(empty, ev, draft({ outcome: 'hazir', reason: 'Dört destekleyici ölçüt bu iş için geçerli değil.', secondOpinion: 'Mehmet Yılmaz' }))).toEqual([])
  })
})
