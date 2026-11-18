import { describe, expect, it } from 'vitest'
import { emptyPlan, type PlanDoc } from '@/data/types'
import { buildShoeDemoPlan } from '@/data/demoAyakkabi'
import { applyStepValues } from './changes'
import { ROW_ID_FIELDS, stampRowIds } from './rowIds'
import { goalOf, movesOf, resourcesOf, tasksOf } from './strategy'

/** Satır kimliği olmayan eski biçimde bir plan. */
function legacyPlan(): PlanDoc {
  const p = emptyPlan('p', 'Plan')
  p.revision = 7
  p.steps['S25'] = { values: { moves: [{ move: 'Tezgâh kur', capability: 'Satış' }, { _id: 'satir-x', move: 'Ortak bul', capability: 'Ağ' }] }, status: 'tamam', updatedAt: '2026-11-01T00:00:00.000Z' }
  p.steps['U31'] = { values: { objective: 'İlk 10 müşteri', keyResults: [{ kr: 'Müşteri', target: '10' }] }, status: 'tamam', updatedAt: '2026-11-02T00:00:00.000Z' }
  p.steps['U32'] = { values: { now: [{ action: 'A' }, { action: 'B' }], next: [{ action: 'C' }], later: [] }, status: 'taslak', updatedAt: '2026-11-03T00:00:00.000Z' }
  p.steps['U33'] = { values: { resources: [{ item: 'Tezgâh', budgetKurus: 100 }] }, status: 'taslak', updatedAt: '2026-11-04T00:00:00.000Z' }
  p.decisions.push({ id: 'k', gate: 6, scope: '', criteria: [], suggested: 'ilerle', chosen: 'ilerle', reason: '', retriesLeft: 1, decidedBy: 'Ali', decidedAt: '', revision: 7, stale: false })
  p.transitions = [{ id: 't', outcome: 'hazir', suggested: 'hazir', reason: '', decidedBy: 'Ali', decidedAt: '', reviewed: true, mandatoryMet: 1, mandatoryTotal: 1, supportingMet: 0, supportingTotal: 0, level: 3, revision: 5, stale: false }]
  return p
}

const allRows = (p: PlanDoc) =>
  Object.entries(ROW_ID_FIELDS).flatMap(([step, keys]) => keys.flatMap((key) => (p.steps[step]?.values[key] as Record<string, unknown>[] | undefined) ?? []))

describe('satır kimliği taşıması', () => {
  it('kimliği olmayan her satıra kimlik verir, var olan kimliği korur', () => {
    const p = stampRowIds(legacyPlan())
    const rows = allRows(p)
    expect(rows.length).toBe(7)
    expect(rows.every((r) => typeof r._id === 'string' && (r._id as string).length > 0)).toBe(true)
    expect((p.steps['S25'].values.moves as { _id: string }[])[1]._id).toBe('satir-x')
    expect(new Set(rows.map((r) => r._id)).size).toBe(rows.length)
  })

  it('aynı planda iki kez çalışınca sonuç değişmez', () => {
    const p = stampRowIds(legacyPlan())
    const once = JSON.stringify(p)
    expect(JSON.stringify(stampRowIds(p))).toBe(once)
  })

  it('aynı girdiye her seferinde aynı kimliği verir', () => {
    expect(JSON.stringify(stampRowIds(legacyPlan()).steps)).toBe(JSON.stringify(stampRowIds(legacyPlan()).steps))
  })

  it('adım durumunu, sürümü, tarihi ve eskime işaretini değiştirmez', () => {
    const before = legacyPlan()
    const after = stampRowIds(legacyPlan())
    expect(after.revision).toBe(before.revision)
    expect(after.updatedAt).toBe(before.updatedAt)
    for (const step of Object.keys(ROW_ID_FIELDS)) {
      expect(after.steps[step].status).toBe(before.steps[step].status)
      expect(after.steps[step].updatedAt).toBe(before.steps[step].updatedAt)
    }
    expect(after.decisions.map((d) => d.stale)).toEqual([false])
    expect(after.transitions?.map((t) => t.stale)).toEqual([false])
  })

  it('başka bir satırın kullandığı kimliği yeniden vermez', () => {
    const p = emptyPlan('p', 'Plan')
    p.steps['U32'] = { values: { now: [{ action: 'A' }, { _id: 'r-u32-now-0', action: 'B' }] }, status: 'taslak', updatedAt: '' }
    stampRowIds(p)
    const ids = (p.steps['U32'].values.now as { _id: string }[]).map((r) => r._id)
    expect(new Set(ids).size).toBe(2)
  })

  it('kimlikli satırı kaydetmek kararları eskitmez', () => {
    const p = stampRowIds(legacyPlan())
    applyStepValues(p, 'U32', p.steps['U32'].values)
    expect(p.decisions[0].stale).toBe(false)
  })

  it('satır olmayan değerlere ve eksik adımlara dokunmaz', () => {
    const p = emptyPlan('p', 'Plan')
    p.steps['U31'] = { values: { keyResults: 'bozuk', objective: 'Hedef' }, status: 'taslak', updatedAt: '' }
    expect(stampRowIds(p).steps['U31'].values).toEqual({ keyResults: 'bozuk', objective: 'Hedef' })
    expect(stampRowIds(emptyPlan('q', 'Boş')).steps).toEqual({})
  })

  it('örnek planda da kararları değiştirmez', () => {
    const demo = buildShoeDemoPlan()
    const stamped = stampRowIds(structuredClone(demo))
    expect(stamped.decisions).toEqual(demo.decisions)
    expect(stamped.transitions).toEqual(demo.transitions)
  })
})

describe('okuyucular satır kimliğini verir', () => {
  it('hamle, gösterge, iş ve kaynak satırları kimlik taşır', () => {
    const p = stampRowIds(legacyPlan())
    expect(movesOf(p).map((m) => m.id)).toEqual((p.steps['S25'].values.moves as { _id: string }[]).map((r) => r._id))
    expect(goalOf(p).indicators[0].id).toBe((p.steps['U31'].values.keyResults as { _id: string }[])[0]._id)
    expect(tasksOf(p, 'next')[0].id).toBe((p.steps['U32'].values.next as { _id: string }[])[0]._id)
    expect(resourcesOf(p)[0].id).toBe((p.steps['U33'].values.resources as { _id: string }[])[0]._id)
  })

  it('taşınmamış satırda da aynı kimliği üretir', () => {
    const raw = legacyPlan()
    const stamped = stampRowIds(legacyPlan())
    expect(tasksOf(raw).map((t) => t.id)).toEqual(tasksOf(stamped).map((t) => t.id))
  })
})

describe('eski sürümün tekrarlanan kimlikleri', () => {
  it('aynı kimliği taşıyan satırlar plan içinde tek kimlik alır, ilk satır korunur', () => {
    const p = emptyPlan('p', 'Plan')
    p.steps['U32'] = { values: { now: [{ _id: 'satir-0', action: 'A' }], next: [{ _id: 'satir-0', action: 'B' }], later: [{ _id: 'satir-0', action: 'C' }] }, status: 'tamam', updatedAt: 'x' }
    p.steps['U33'] = { values: { resources: [{ _id: 'satir-0', item: 'D' }] }, status: 'taslak', updatedAt: 'y' }
    stampRowIds(p)
    const ids = [...allRows(p)].map((r) => r._id)
    expect(ids[0]).toBe('satir-0')
    expect(new Set(ids).size).toBe(ids.length)
    const once = JSON.stringify(p)
    expect(JSON.stringify(stampRowIds(p))).toBe(once)
    expect([p.steps['U32'].status, p.steps['U32'].updatedAt]).toEqual(['tamam', 'x'])
  })
})

describe('hedef takibi iş bağları', () => {
  function okrPlan(): PlanDoc {
    const p = emptyPlan('p', 'Plan')
    p.steps['S25'] = { values: { moves: [{ _id: 'satir-0', move: 'Hamle' }] }, status: 'tamam', updatedAt: '' }
    p.steps['U32'] = { values: { now: [{ _id: 'satir-0', action: 'Kimlikli iş' }, { action: 'Kimliksiz iş' }], next: [{ action: 'Sonra' }] }, status: 'tamam', updatedAt: '' }
    p.okr = { enabled: true, changedAt: '', periods: [{ id: 'd1', startsAt: '2026-10-01', endsAt: '2026-12-31', objectives: [], taskLinks: { 'satir-0': 'g1', 'satir-1': 'g2' } }] }
    return p
  }

  it('kimliksiz işin bağı yeni kimliğe taşınır, kimlikli işin bağı aynı kalır', () => {
    const p = stampRowIds(okrPlan())
    const now = p.steps['U32'].values.now as { _id: string }[]
    expect(now[0]._id).toBe('satir-0')
    expect(now[1]._id).toBe('r-u32-now-1')
    expect(p.okr!.periods[0].taskLinks).toEqual({ 'satir-0': 'g1', 'r-u32-now-1': 'g2' })
    /* Aynı kimliği taşıyan hamle yeni kimlik alır. İşin kimliği korunur. */
    expect((p.steps['S25'].values.moves as { _id: string }[])[0]._id).not.toBe('satir-0')
  })

  it('iki kez çalışınca bağlar değişmez', () => {
    const p = stampRowIds(okrPlan())
    const once = JSON.stringify(p)
    expect(JSON.stringify(stampRowIds(p))).toBe(once)
  })

  it('hedef takibi yoksa plana okr alanı eklenmez', () => {
    const p = legacyPlan()
    expect('okr' in stampRowIds(p)).toBe(false)
  })
})
