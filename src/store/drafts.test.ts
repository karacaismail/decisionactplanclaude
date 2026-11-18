import { beforeEach, describe, expect, it } from 'vitest'
import { buildShoeDemoPlan } from '@/data/demoAyakkabi'
import { DECISIONS } from '@/data/decisions'
import type { PlanDoc } from '@/data/types'
import { decisionLocked, gatePassed } from '@/engine/gate'
import { planPosition } from '@/engine/position'
import { transitionPassed, validationLevel } from '@/engine/readiness'
import { usePlanStore } from './planStore'
import { acceptDraft, discardDraft, draftsOf, useDraftStore } from './drafts'
import './platformBridge'
import { planCommands } from '@/platform/planCommands'
import { createMemoryKvStore, moduleStore, setDefaultKvStore } from '@/platform/kv'
import { readRollup, writeRollup } from '@/platform/rollups'
import { lifecycleSettled } from '@/platform/lifecycle'
import { selectExecutionTasks, selectPlanSummary } from '@/contracts'

function open(plan: PlanDoc): string {
  return usePlanStore.getState().importPlan(plan)
}
const current = () => usePlanStore.getState().plans[usePlanStore.getState().currentId!]

/** Kapıların, hazırlığın ve kilitlerin tam fotoğrafı. */
function gateSnapshot(p: PlanDoc) {
  const ns = [...DECISIONS.map((d) => d.n)]
  return JSON.stringify({
    passed: ns.map((n) => gatePassed(p, n)),
    locked: ns.map((n) => decisionLocked(p, n)),
    transition: transitionPassed(p),
    level: validationLevel(p),
    position: planPosition(p),
    stale: p.decisions.map((d) => d.stale ?? false),
    transitionStale: (p.transitions ?? []).map((t) => t.stale ?? false),
    revision: p.revision,
  })
}

beforeEach(() => {
  usePlanStore.setState({ plans: {}, currentId: undefined, loadFailed: false })
  useDraftStore.setState({ drafts: [] })
  setDefaultKvStore(createMemoryKvStore())
  window.localStorage.clear()
})

describe('plan komutları', () => {
  it('adım taslağı önerir ama planı değiştirmez', () => {
    const id = open(buildShoeDemoPlan())
    const before = JSON.stringify(current())
    const result = planCommands.proposeStepDraft(id, 'U32', { now: [{ action: 'Tezgâh kur', owner: 'Ali', dueDate: '2026-12-01' }] })
    expect(result.ok).toBe(true)
    expect(JSON.stringify(current())).toBe(before)
    expect(draftsOf(id)).toHaveLength(1)
  })

  it('profil ve sınır adımına taslak önermez', () => {
    const id = open(buildShoeDemoPlan())
    for (const step of ['00', '02']) {
      const r = planCommands.proposeStepDraft(id, step, { budgetKurus: 1 })
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.error).toMatch(/değiştirilemez/)
    }
    expect(draftsOf(id)).toHaveLength(0)
  })

  it('bilinmeyen planı, adımı ve alanı reddeder', () => {
    const id = open(buildShoeDemoPlan())
    expect(planCommands.proposeStepDraft('yok', 'U32', { now: [] }).ok).toBe(false)
    expect(planCommands.proposeStepDraft(id, 'X99', { now: [] }).ok).toBe(false)
    const r = planCommands.proposeStepDraft(id, 'U32', { hackedField: 1 })
    expect(r.ok).toBe(false)
    expect(planCommands.proposeStepDraft(id, 'U32', {}).ok).toBe(false)
  })

  it('kanıt taslağı ekler, boş metni reddeder', () => {
    const id = open(buildShoeDemoPlan())
    expect(planCommands.appendEvidenceDraft(id, '   ').ok).toBe(false)
    const r = planCommands.appendEvidenceDraft(id, 'Müşteri görüşmesinde fiyat soruldu.')
    expect(r.ok).toBe(true)
    expect(draftsOf(id)[0]).toMatchObject({ kind: 'kanit', text: 'Müşteri görüşmesinde fiyat soruldu.' })
  })

  it('kişi taslağı kaydedince adım değişir ve taslak kalkar', () => {
    const id = open(buildShoeDemoPlan())
    const evidenceBefore = current().evidence.length
    const step = planCommands.proposeStepDraft(id, 'U32', { later: [{ action: 'İkinci şube' }] })
    const ev = planCommands.appendEvidenceDraft(id, 'Satış kaydı')
    if (!step.ok || !ev.ok) throw new Error('taslak açılmadı')
    const locked = decisionLocked(current(), 6)
    const stepError = acceptDraft(step.draftId)
    if (locked) expect(stepError).toMatch(/kilitli/)
    else {
      expect(stepError).toBeNull()
      expect((current().steps['U32'].values.later as { action: string }[])[0].action).toBe('İkinci şube')
    }
    expect(acceptDraft(ev.draftId)).toBeNull()
    expect(current().evidence.length).toBe(evidenceBefore + 1)
    expect(draftsOf(id).map((d) => d.id)).toEqual(locked ? [step.draftId] : [])
  })

  it('başka plan açıkken taslak kaydedilmez, silinebilir', () => {
    const id = open(buildShoeDemoPlan())
    const r = planCommands.appendEvidenceDraft(id, 'Not')
    if (!r.ok) throw new Error('taslak açılmadı')
    usePlanStore.getState().createPlan('Başka plan')
    expect(acceptDraft(r.draftId)).toMatch(/planı açın/)
    discardDraft(r.draftId)
    expect(draftsOf(id)).toHaveLength(0)
  })
})

describe('modül verisi kapıları değiştirmez', () => {
  it('modül verisi, özet ve taslak varken kapılar ve hazırlık aynı kalır', async () => {
    const id = open(buildShoeDemoPlan())
    const before = gateSnapshot(current())
    const planJson = JSON.stringify(current())

    await moduleStore('proje').set(`${id}/proje-1`, { ad: 'Tezgâh', durum: 'acik' })
    await moduleStore('destek').set(`${id}/basvuru-1`, { program: 'KOSGEB' })
    writeRollup('proje', id, { acik: 1 })
    planCommands.proposeStepDraft(id, 'U32', { now: [{ action: 'X', owner: 'Ali', dueDate: '2026-12-01' }] })
    planCommands.appendEvidenceDraft(id, 'Not')
    selectPlanSummary(current())
    selectExecutionTasks(current())

    expect(gateSnapshot(current())).toBe(before)
    expect(JSON.stringify(current())).toBe(planJson)
  })

  it('plan silinince modül verisi, özet ve taslaklar silinir', async () => {
    const id = open(buildShoeDemoPlan())
    await moduleStore('proje').set(`${id}/proje-1`, { ad: 'Tezgâh' })
    writeRollup('proje', id, { acik: 1 })
    planCommands.appendEvidenceDraft(id, 'Not')
    usePlanStore.getState().deletePlan(id)
    await lifecycleSettled()
    expect(await moduleStore('proje').keys(`${id}/`)).toEqual([])
    expect(readRollup('proje', id)).toBeUndefined()
    expect(draftsOf(id)).toHaveLength(0)
  })
})
