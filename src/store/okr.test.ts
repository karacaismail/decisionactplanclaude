/**
 * Hedef takibi kaydı: taşıma, içe alma ve açma anahtarı.
 * Kayıt `plan.okr` alanında durur. Profilde ya da sınırlarda durmaz.
 */
import { beforeEach, describe, expect, it } from 'vitest'
import { buildDemoPlan } from '@/data/demo'
import { buildShoeDemoPlan } from '@/data/demoAyakkabi'
import { emptyPlan, type OkrState, type PlanDoc } from '@/data/types'
import { migratePlan, usePlanStore } from './planStore'

const FILLED: OkrState = {
  enabled: false,
  changedAt: '2026-11-19T10:00:00.000Z',
  periods: [{ id: 'd1', startsAt: '2026-11-01', endsAt: '2027-02-01', objectives: [{ id: 'h1', title: 'Hedef', indicators: [{ id: 'g1', name: 'Gösterge', baseline: 1, target: 2, checkIns: [] }] }] }],
}

describe('taşıma', () => {
  it('hedef takibi kaydı olmayan eski plan bayt bayt aynı kalır', () => {
    for (const plan of [emptyPlan('p', 'Plan'), buildDemoPlan(), buildShoeDemoPlan()]) {
      const before = JSON.stringify(plan)
      migratePlan(plan)
      expect(JSON.stringify(plan)).toBe(before)
      expect('okr' in plan).toBe(false)
    }
  })
  it('örnek planlarda hedef takibi kapalıdır', () => {
    for (const plan of [buildDemoPlan(), buildShoeDemoPlan()]) expect(plan.okr?.enabled ?? false).toBe(false)
  })
  it('geçerli kayıt korunur', () => {
    const p = emptyPlan('p', 'Plan')
    p.okr = structuredClone(FILLED)
    migratePlan(p)
    expect(p.okr).toEqual(FILLED)
  })
  it('bozuk kayıt atılır, plan kalır', () => {
    const p: PlanDoc = emptyPlan('p', 'Plan')
    p.okr = { enabled: 'evet' } as unknown as OkrState
    migratePlan(p)
    expect('okr' in p).toBe(false)
    expect(p.name).toBe('Plan')
  })
})

describe('depo', () => {
  beforeEach(() => usePlanStore.setState({ plans: {}, currentId: undefined, loadFailed: false }))

  it('bozuk hedef takibi kaydı içeren dosya içe alınır, kayıt atılır', () => {
    const doc = { ...emptyPlan('p', 'Dosya'), okr: 'bozuk' }
    const id = usePlanStore.getState().importPlan(doc)
    const plan = usePlanStore.getState().plans[id]
    expect(plan.name).toBe('Dosya (kopya)')
    expect('okr' in plan).toBe(false)
  })

  it('anahtar sürüm almaz, kararları eskitmez ve değişiklik kaydı yazmaz', () => {
    const s = usePlanStore.getState()
    s.createPlan('Plan')
    s.update((p) => {
      p.revision = 3
      p.decisions = [{ id: 'k', gate: 6, scope: 'Deneme', criteria: [], suggested: 'ilerle', chosen: 'ilerle', reason: 'Gerekçe', retriesLeft: 1, decidedBy: 'Kurucu', decidedAt: '2026-11-01T00:00:00.000Z', revision: 3, stale: false }]
    })
    const before = structuredClone(usePlanStore.getState().plans[usePlanStore.getState().currentId!])
    usePlanStore.getState().setOkrEnabled(true)
    const on = usePlanStore.getState().plans[usePlanStore.getState().currentId!]
    expect(on.okr?.enabled).toBe(true)
    expect(on.revision).toBe(before.revision)
    expect(on.decisions).toEqual(before.decisions)
    expect(on.changes).toEqual(before.changes)
    expect(on.revisions).toEqual(before.revisions)
    expect(on.profile).toEqual(before.profile)
    expect(on.limits).toEqual(before.limits)
    usePlanStore.getState().setOkrEnabled(false)
    const off = usePlanStore.getState().plans[usePlanStore.getState().currentId!]
    expect(off.okr?.enabled).toBe(false)
    expect(off.okr?.periods).toHaveLength(1)
    expect(off.revision).toBe(before.revision)
  })

  it('hedef takibi değişikliği yalnız hedef takibi kaydına yazar', () => {
    const s = usePlanStore.getState()
    s.createPlan('Plan')
    s.setOkrEnabled(true)
    const before = structuredClone(usePlanStore.getState().plans[usePlanStore.getState().currentId!])
    usePlanStore.getState().updateOkr((okr) => {
      okr.periods[0].objectives.push({ id: 'h1', title: 'Yeni hedef', indicators: [] })
    })
    const after = usePlanStore.getState().plans[usePlanStore.getState().currentId!]
    expect(after.okr?.periods[0].objectives.map((o) => o.title)).toEqual(['Yeni hedef'])
    const { okr: _a, updatedAt: _u, ...restAfter } = after
    const { okr: _b, updatedAt: _v, ...restBefore } = before
    expect(restAfter).toEqual(restBefore)
  })

  it('hedef takibi kapalıyken değişiklik yazılmaz', () => {
    const s = usePlanStore.getState()
    s.createPlan('Plan')
    const before = usePlanStore.getState().plans[usePlanStore.getState().currentId!]
    usePlanStore.getState().updateOkr((okr) => {
      okr.periods = []
    })
    expect(usePlanStore.getState().plans[usePlanStore.getState().currentId!]).toBe(before)
  })
})
