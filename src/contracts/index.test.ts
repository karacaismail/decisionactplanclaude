import { describe, expect, it } from 'vitest'
import { emptyPlan, type PlanDoc } from '@/data/types'
import { buildShoeDemoPlan } from '@/data/demoAyakkabi'
import { stampRowIds } from '@/engine/rowIds'
import { isStrategyApproved, selectExecutionTasks, selectGoal, selectPlanSummary, selectResources, selectStrategyMoves } from './index'

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
})
