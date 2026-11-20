import { describe, expect, it } from 'vitest'
import { emptyPlan, type PlanDoc } from '@/data/types'
import { buildShoeDemoPlan } from '@/data/demoAyakkabi'
import { stampRowIds } from '@/engine/rowIds'
import { isStrategyApproved, selectExecutionTasks, selectGoal, selectLimits, selectPlanSummary, selectResources, selectStrategyMoves } from './index'

function plan(): PlanDoc {
  const p = emptyPlan('p', 'Kafe')
  p.steps['S25'] = { values: { moves: [{ move: 'Tezgâh kur', capability: 'Satış', have: 'kurulacak' }, { move: '' }] }, status: 'tamam', updatedAt: '' }
  p.steps['U31'] = { values: { objective: 'İlk 10 müşteri', keyResults: [{ kr: 'Müşteri', target: '10' }] }, status: 'tamam', updatedAt: '' }
  p.steps['U32'] = { values: { now: [{ action: 'A', owner: 'Ali', dueDate: '2026-12-01' }], next: [{ action: 'B' }], later: [{ action: 'C' }] }, status: 'taslak', updatedAt: '' }
  p.steps['U33'] = { values: { resources: [{ item: 'Tezgâh', budgetKurus: 150000 }] }, status: 'taslak', updatedAt: '' }
  return stampRowIds(p)
}

describe('okuma sözleşmesi', () => {
  it('boş satırı atlar ve her satırın kalıcı kimliğini verir', () => {
    const p = plan()
    expect(selectStrategyMoves(p)).toEqual([{ rowId: 'r-s25-moves-0', move: 'Tezgâh kur', serves: null, capability: 'Satış', have: 'kurulacak' }])
    expect(selectGoal(p).keyResults[0].rowId).toBe('r-u31-keyresults-0')
    expect(selectExecutionTasks(p).map((t) => [t.horizon, t.action, t.rowId])).toEqual([
      ['now', 'A', 'r-u32-now-0'],
      ['next', 'B', 'r-u32-next-0'],
      ['later', 'C', 'r-u32-later-0'],
    ])
    expect(selectResources(p)).toEqual([{ rowId: 'r-u33-resources-0', item: 'Tezgâh', budgetKurus: 150000, people: null }])
  })

  it('satır sırası değişince kimlik satırla birlikte gider', () => {
    const p = plan()
    p.steps['U32'].values.now = [{ action: 'Yeni', _id: 'satir-yeni' }, ...(p.steps['U32'].values.now as object[])]
    expect(selectExecutionTasks(p).filter((t) => t.horizon === 'now').map((t) => t.rowId)).toEqual(['satir-yeni', 'r-u32-now-0'])
  })

  it('dönen nesneyi değiştirmek planı değiştirmez', () => {
    const p = plan()
    const before = JSON.stringify(p)
    selectStrategyMoves(p)[0].move = 'Değişti'
    selectExecutionTasks(p)[0].action = 'Değişti'
    expect(JSON.stringify(p)).toBe(before)
  })

  it('özet planın yerini ve strateji onayını verir', () => {
    const summary = selectPlanSummary(plan())
    expect(summary).toMatchObject({ id: 'p', name: 'Kafe', example: false, stage: 'temel', strategyApproved: false })
    expect(isStrategyApproved(plan())).toBe(false)
    const demo = buildShoeDemoPlan()
    expect(selectPlanSummary(demo).strategyApproved).toBe(isStrategyApproved(demo))
  })

  it('sınırlar kişinin yazdığı tutarları olduğu gibi verir', () => {
    const p = plan()
    p.limits = { budgetKurus: 15000000, cashKurus: 24000000, monthlyBurnKurus: 3000000, deadline: '2027-02-17', successSentence: 'Başarı' }
    expect(selectLimits(p)).toEqual({ budgetKurus: 15000000, cashKurus: 24000000, monthlyBurnKurus: 3000000 })
  })

  it('yazılmayan ya da bozuk sınır bilinmiyor olur', () => {
    const p = plan()
    expect(selectLimits(p)).toEqual({ budgetKurus: null, cashKurus: null, monthlyBurnKurus: null })
    p.limits = { budgetKurus: Number.NaN, cashKurus: -5, monthlyBurnKurus: Number.POSITIVE_INFINITY }
    expect(selectLimits(p)).toEqual({ budgetKurus: null, cashKurus: null, monthlyBurnKurus: null })
    ;(p as { limits: unknown }).limits = { budgetKurus: '1500', cashKurus: 1.5 }
    expect(selectLimits(p)).toEqual({ budgetKurus: null, cashKurus: null, monthlyBurnKurus: null })
    ;(p as { limits: unknown }).limits = undefined
    expect(selectLimits(p)).toEqual({ budgetKurus: null, cashKurus: null, monthlyBurnKurus: null })
  })

  it('sıfır sınır yazılmamış sayılır, çekirdek ekranlar da "Yazılmadı" gösterir', () => {
    const p = plan()
    p.limits = { budgetKurus: 0, cashKurus: 0, monthlyBurnKurus: 0 }
    expect(selectLimits(p)).toEqual({ budgetKurus: null, cashKurus: null, monthlyBurnKurus: null })
  })

  it('kaynak satırındaki bozuk tutar bilinmiyor olur, sıfır tutar kalır', () => {
    const p = plan()
    p.steps['U33'].values.resources = [
      { _id: 'a', item: 'Eksi', budgetKurus: -5 },
      { _id: 'b', item: 'Kesirli', budgetKurus: 1.5 },
      { _id: 'c', item: 'Metin', budgetKurus: '1500' },
      { _id: 'd', item: 'Sıfır', budgetKurus: 0 },
    ]
    expect(selectResources(p).map((r) => [r.rowId, r.budgetKurus])).toEqual([['a', null], ['b', null], ['c', null], ['d', 0]])
  })

  it('sınırları okumak planı değiştirmez', () => {
    const p = plan()
    p.limits = { budgetKurus: 100 }
    const before = JSON.stringify(p)
    const l = selectLimits(p)
    l.budgetKurus = 5
    expect(JSON.stringify(p)).toBe(before)
    expect(p.limits.budgetKurus).toBe(100)
  })
})
