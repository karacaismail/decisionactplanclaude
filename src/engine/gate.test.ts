import { describe, expect, it } from 'vitest'
import type { GateDef } from '@/data/schema'
import { emptyPlan, type Decision, type PlanDoc } from '@/data/types'
import { effectiveOutcome, evaluateGate, gatePassed, retriesLeft } from './gate'

function gate(checks: (boolean | null)[], rows: GateDef['rows'] = []): GateDef {
  return { n: 1, title: 'Deneme kapısı', maxRetries: 2, rows, criteria: checks.map((v, i) => ({ id: `c${i}`, label: `Ölçüt ${i}`, check: () => v })) }
}

function decision(patch: Partial<Decision>): Decision {
  return { id: 'd1', gate: 1, scope: 'Deneme', criteria: [], suggested: 'ilerle', chosen: 'ilerle', reason: 'Gerekçe', retriesLeft: 2, decidedBy: 'Kurucu', decidedAt: new Date().toISOString(), revision: 1, ...patch }
}

describe('evaluateGate', () => {
  it('bütün ölçütler karşılanınca "ilerle" önerir', () => {
    const r = evaluateGate(gate([true, true, true]), emptyPlan('p', 'Plan'))
    expect(r.suggested).toBe('ilerle')
    expect(r.metCount).toBe(3)
  })

  it('zarar işareti her şeyin önüne geçer', () => {
    const r = evaluateGate(gate([true, true]), emptyPlan('p', 'Plan'), { harm: true })
    expect(r.suggested).toBe('durdur')
  })

  it('izin eksikse "beklet" önerir', () => {
    const r = evaluateGate(gate([true, true]), emptyPlan('p', 'Plan'), { permitMissing: true })
    expect(r.suggested).toBe('beklet')
  })

  it('ölçülmemiş ölçüt varsa küçük deneme önerir', () => {
    const r = evaluateGate(gate([true, null]), emptyPlan('p', 'Plan'))
    expect(r.suggested).toBe('yenidenDene')
    expect(r.unknownCount).toBe(1)
  })

  it('hiçbir ölçüt karşılanmazsa "durdur" önerir', () => {
    const r = evaluateGate(gate([false, false]), emptyPlan('p', 'Plan'))
    expect(r.suggested).toBe('durdur')
  })

  it('deneme hakkı bitince yeniden deneme kapanır ve öneri "beklet" olur', () => {
    const plan: PlanDoc = emptyPlan('p', 'Plan')
    plan.decisions = [decision({ id: 'a', chosen: 'yenidenDene' }), decision({ id: 'b', chosen: 'yenidenDene' })]
    const r = evaluateGate(gate([true, null]), plan)
    expect(retriesLeft(plan, 1, 2)).toBe(0)
    expect(r.blockedOutcomes).toContain('yenidenDene')
    expect(r.suggested).toBe('beklet')
  })

  it('koşullu izin ikinci kez verilmez', () => {
    const plan = emptyPlan('p', 'Plan')
    plan.decisions = [decision({ chosen: 'kosulluIlerle' })]
    const r = evaluateGate(gate([true]), plan)
    expect(r.blockedOutcomes).toContain('kosulluIlerle')
  })

  it('uyan tablo satırı genel kuraldan önce gelir', () => {
    const r = evaluateGate(gate([true, true], [{ condition: 'Özel durum', outcome: 'yonDegistir', applies: () => true }]), emptyPlan('p', 'Plan'))
    expect(r.suggested).toBe('yonDegistir')
    expect(r.matchedRow?.condition).toBe('Özel durum')
  })
})

describe('koşullu izin süresi', () => {
  const permit = { scope: 'Deneme', amountKurus: 100000, owner: 'Kurucu', closingEvidence: 'Fatura', issuedAt: '2026-11-01T00:00:00.000Z' }

  it('süresi dolan koşullu izin kendiliğinden "beklet" olur', () => {
    const d = decision({ chosen: 'kosulluIlerle', conditional: { ...permit, deadline: '2026-11-10T00:00:00.000Z' } })
    expect(effectiveOutcome(d, new Date('2026-11-13T00:00:00.000Z'))).toBe('beklet')
  })

  it('kapatılan koşullu izin geçerli kalır', () => {
    const d = decision({ chosen: 'kosulluIlerle', conditional: { ...permit, deadline: '2026-11-10T00:00:00.000Z', closedAt: '2026-11-09T00:00:00.000Z' } })
    expect(effectiveOutcome(d, new Date('2026-11-13T00:00:00.000Z'))).toBe('kosulluIlerle')
  })

  it('karar yoksa kapı geçilmemiştir', () => {
    expect(gatePassed(emptyPlan('p', 'Plan'), 1)).toBe(false)
  })
})
