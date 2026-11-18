import { describe, expect, it } from 'vitest'
import type { GateDef } from '@/data/schema'
import { emptyPlan, type Decision, type PlanDoc } from '@/data/types'
import { evaluateGate, remainingBudgetKurus, validateDecision, type DecisionDraft } from './gate'

function gate(n: number, checks: (boolean | null)[]): GateDef {
  return { n, title: 'Deneme kontrolü', maxRetries: 2, rows: [], criteria: checks.map((v, i) => ({ id: `c${i}`, label: `Ölçüt ${i}`, check: () => v })) }
}

function decision(patch: Partial<Decision>): Decision {
  return { id: 'd1', gate: 1, scope: 'Deneme', criteria: [], suggested: 'ilerle', chosen: 'ilerle', reason: 'Gerekçe', retriesLeft: 2, decidedBy: 'Kurucu', decidedAt: new Date().toISOString(), revision: 1, ...patch }
}

const permit = { scope: 'Küçük deneme', amountKurus: 50000, deadline: '2026-12-01', owner: 'Ayşe', closingEvidence: 'Fatura' }

function draft(patch: Partial<DecisionDraft>): DecisionDraft {
  return { chosen: 'ilerle', reason: 'Gerekçe', secondOpinion: '', decidedBy: 'Kurucu', ...patch }
}

function plan(): PlanDoc {
  const p = emptyPlan('p', 'Plan')
  p.limits = { budgetKurus: 100000, deadline: '2026-12-31' }
  return p
}

describe('validateDecision', () => {
  it('bütün kurallar sağlanınca engel yok', () => {
    const p = plan()
    const def = gate(1, [true, true])
    expect(validateDecision(def, p, evaluateGate(def, p), draft({}))).toEqual([])
  })

  it('ciddi zarar işaretliyse yalnız "durdur" seçilebilir', () => {
    const p = plan()
    const def = gate(1, [true])
    const ev = evaluateGate(def, p, { harm: true })
    expect(validateDecision(def, p, ev, draft({ chosen: 'beklet' }), { harm: true })[0]).toContain('Yalnız "Durdur"')
    expect(validateDecision(def, p, ev, draft({ chosen: 'durdur' }), { harm: true })).toEqual([])
  })

  it('sistem önermiyorsa "ilerle" ikinci görüş ve 20 karakter gerekçe ister', () => {
    const p = plan()
    const def = gate(1, [true, false, false])
    const ev = evaluateGate(def, p)
    expect(ev.suggested).not.toBe('ilerle')
    expect(validateDecision(def, p, ev, draft({ reason: 'Kısa' }))).toHaveLength(1)
    expect(validateDecision(def, p, ev, draft({ reason: 'Bu gerekçe yeterince uzun bir açıklamadır.' }))).toHaveLength(1)
    expect(validateDecision(def, p, ev, draft({ reason: 'Kısa', secondOpinion: 'Danışman onayladı.' }))).toHaveLength(1)
    expect(validateDecision(def, p, ev, draft({ reason: 'Bu gerekçe yeterince uzun bir açıklamadır.', secondOpinion: 'Danışman onayladı.' }))).toEqual([])
  })

  it('deneme hakkı yoksa "yeniden dene" seçilemez', () => {
    const p = plan()
    p.decisions = [decision({ id: 'a', chosen: 'yenidenDene' }), decision({ id: 'b', chosen: 'yenidenDene' })]
    const def = gate(1, [true, null])
    const errors = validateDecision(def, p, evaluateGate(def, p), draft({ chosen: 'yenidenDene' }))
    expect(errors.join(' ')).toContain('deneme hakkı kalmadı')
  })

  it('koşullu ilerle için bütün alanlar zorunludur', () => {
    const p = plan()
    const def = gate(1, [true])
    const ev = evaluateGate(def, p)
    expect(validateDecision(def, p, ev, draft({ chosen: 'kosulluIlerle' }))).toHaveLength(1)
    const errors = validateDecision(def, p, ev, draft({ chosen: 'kosulluIlerle', conditional: { ...permit, scope: ' ', owner: '', closingEvidence: '', deadline: '' } }))
    expect(errors).toHaveLength(4)
    expect(validateDecision(def, p, ev, draft({ chosen: 'kosulluIlerle', conditional: permit }))).toEqual([])
  })

  it('koşullu tutar kalan bütçeyi aşamaz', () => {
    const p = plan()
    p.decisions = [decision({ id: 'a', gate: 1, chosen: 'kosulluIlerle', conditional: { ...permit, amountKurus: 70000, issuedAt: '' } })]
    expect(remainingBudgetKurus(p)).toBe(30000)
    const def = gate(2, [true])
    const errors = validateDecision(def, p, evaluateGate(def, p), draft({ chosen: 'kosulluIlerle', conditional: { ...permit, amountKurus: 40000 } }))
    expect(errors.join(' ')).toContain('kalan bütçeyi aşıyor')
    expect(errors.join(' ')).toContain('300,00 TL')
    const q = emptyPlan('q', 'Plan')
    expect(remainingBudgetKurus(q)).toBeNull()
  })

  it('koşullu bitiş planın bitiş tarihini geçemez', () => {
    const p = plan()
    const def = gate(1, [true])
    const errors = validateDecision(def, p, evaluateGate(def, p), draft({ chosen: 'kosulluIlerle', conditional: { ...permit, deadline: '2027-01-15' } }))
    expect(errors.join(' ')).toContain('planın bitiş tarihini geçemez')
  })

  it('aynı kontrolde ikinci koşullu izin verilmez', () => {
    const p = plan()
    p.decisions = [decision({ id: 'a', gate: 1, chosen: 'kosulluIlerle', conditional: { ...permit, amountKurus: 1000, issuedAt: '' } })]
    const def = gate(1, [true])
    const errors = validateDecision(def, p, evaluateGate(def, p), draft({ chosen: 'kosulluIlerle', conditional: permit }))
    expect(errors.join(' ')).toContain('daha önce kullanıldı')
  })

  it('önceki kontrol geçilmemişse ilerleme yok', () => {
    const p = plan()
    const def = gate(2, [true])
    const ev = evaluateGate(def, p)
    expect(validateDecision(def, p, ev, draft({}))[0]).toBe('Kontrol 1 henüz geçilmedi. Önce önceki kontrolü kapatın.')
    expect(validateDecision(def, p, ev, draft({ chosen: 'beklet' }))).toEqual([])
    p.decisions = [decision({ id: 'a', gate: 1, stale: true })]
    expect(validateDecision(def, p, ev, draft({}))).toHaveLength(1)
    p.decisions = [decision({ id: 'a', gate: 1 })]
    expect(validateDecision(def, p, ev, draft({}))).toEqual([])
  })

  it('ikinci görüş bekleyen değişiklik ilerlemeyi durdurur', () => {
    const p = plan()
    p.changes = [{ id: 'c1', step: '02', key: 'budgetKurus', label: 'Toplam harcama sınırı', before: 1, after: 2, at: '', needsReview: true }]
    const def = gate(1, [true])
    const ev = evaluateGate(def, p)
    expect(validateDecision(def, p, ev, draft({}))[0]).toContain('ikinci görüş bekliyor')
    expect(validateDecision(def, p, ev, draft({ chosen: 'kosulluIlerle', conditional: permit }))).toHaveLength(1)
    expect(validateDecision(def, p, ev, draft({ chosen: 'beklet' }))).toEqual([])
    p.changes[0].reviewer = 'Mehmet'
    expect(validateDecision(def, p, ev, draft({}))).toEqual([])
  })
})
