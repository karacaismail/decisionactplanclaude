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
import { stampRowIds } from '@/engine/rowIds'

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

  it('aynı kanıt metni iki kez taslak olmaz, kaydedilen kanıt yeniden önerilmez', () => {
    const id = open(buildShoeDemoPlan())
    const first = planCommands.appendEvidenceDraft(id, 'Projede 2 görev bitti.')
    expect(first.ok).toBe(true)
    const again = planCommands.appendEvidenceDraft(id, '  Projede 2 görev bitti.  ')
    expect(again.ok).toBe(false)
    if (!again.ok) expect(again.error).toMatch(/zaten bekliyor/)
    expect(draftsOf(id)).toHaveLength(1)
    /* Başka plandaki aynı metin engellenmez. */
    const other = open({ ...buildShoeDemoPlan(), id: 'baska-plan', example: false } as PlanDoc)
    expect(planCommands.appendEvidenceDraft(other, 'Projede 2 görev bitti.').ok).toBe(true)
    usePlanStore.getState().selectPlan(id)
    if (!first.ok) throw new Error('taslak açılmadı')
    expect(acceptDraft(first.draftId)).toBeNull()
    const afterAccept = planCommands.appendEvidenceDraft(id, 'Projede 2 görev bitti.')
    expect(afterAccept.ok).toBe(false)
    if (!afterAccept.ok) expect(afterAccept.error).toMatch(/kanıt defterinde/)
    expect(planCommands.appendEvidenceDraft(id, 'Projede 3 görev bitti.').ok).toBe(true)
  })

  it('kanıt taslağı kaydedilince kontroller, hazırlık ve sürüm numarası aynı kalır', () => {
    const id = open(buildShoeDemoPlan())
    const before = gateSnapshot(current())
    const r = planCommands.appendEvidenceDraft(id, 'Projede 1 görev bitti.')
    if (!r.ok) throw new Error(r.error)
    expect(acceptDraft(r.draftId)).toBeNull()
    expect(current().evidence.at(-1)).toMatchObject({ title: 'Projede 1 görev bitti.' })
    expect(gateSnapshot(current())).toBe(before)
  })

  it('kişi taslağı kaydedince adım değişir, eskime kuralı çalışır ve taslak kalkar', () => {
    const id = open(buildShoeDemoPlan())
    const evidenceBefore = current().evidence.length
    const step = planCommands.proposeStepDraft(id, '05', { currentSolutionNote: 'Fişleri elle sayıyor.' })
    const ev = planCommands.appendEvidenceDraft(id, 'Satış kaydı')
    if (!step.ok || !ev.ok) throw new Error('taslak açılmadı')
    const gate2 = () => current().decisions.filter((d) => d.gate >= 2).map((d) => d.stale)
    expect(acceptDraft(step.draftId)).toBeNull()
    expect(current().steps['05'].values.currentSolutionNote).toBe('Fişleri elle sayıyor.')
    /* Kayıt adım ekranıyla aynı yoldan geçer. Sonraki kontrollerin kararları eskir. */
    expect(gate2().every((stale) => stale)).toBe(true)
    expect(acceptDraft(ev.draftId)).toBeNull()
    expect(current().evidence.length).toBe(evidenceBefore + 1)
    expect(draftsOf(id)).toEqual([])
  })

  it('kilitli bölüme taslak kaydedilmez ve taslak bekler', () => {
    const id = open(buildShoeDemoPlan())
    expect(decisionLocked(current(), 6)).toBe(true)
    const r = planCommands.proposeStepDraft(id, 'U32', { later: [{ action: 'İkinci şube' }] })
    if (!r.ok) throw new Error(r.error)
    const before = JSON.stringify(current())
    expect(acceptDraft(r.draftId)).toMatch(/kilitli/)
    expect(JSON.stringify(current())).toBe(before)
    expect(draftsOf(id).map((d) => d.id)).toEqual([r.draftId])
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

describe('modül verisi kontrolleri değiştirmez', () => {
  it('modül verisi, özet ve taslak varken kontroller ve hazırlık aynı kalır', async () => {
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

describe('taslak satır kimliği', () => {
  it('kimliksiz tekrarlı satır taslakta kimlik alır ve kayıttan sonra korunur', () => {
    const id = open(buildShoeDemoPlan())
    const r = planCommands.proposeStepDraft(id, 'U32', { later: [{ action: 'İkinci şube' }] })
    if (!r.ok) throw new Error(r.error)
    const draft = draftsOf(id)[0]
    const rowId = draft.kind === 'adim' ? (draft.patch.later as { _id: string }[])[0]._id : ''
    expect(rowId).toMatch(/^satir-/)
    /* Satır kimliği kayıtta korunur. Kimlik taşıma da var olan kimliği değiştirmez. */
    const p = structuredClone(current())
    p.steps['U32'] = { status: 'taslak', updatedAt: '', values: { ...p.steps['U32']?.values, ...(draft.kind === 'adim' ? draft.patch : {}) } }
    expect(selectExecutionTasks(stampRowIds(p)).find((t) => t.action === 'İkinci şube')?.rowId).toBe(rowId)
  })
})
