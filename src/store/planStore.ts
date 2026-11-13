import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { emptyPlan, type Decision, type Evidence, type PlanDoc, type Profile, type StepValues, type Task, type Limits } from '@/data/types'
import { uid } from '@/engine/format'

interface PlanState {
  plans: Record<string, PlanDoc>
  currentId?: string
  theme: 'light' | 'dark' | 'system'
  /** Kayıt durumu. Başlıkta gösterilir. */
  saveState: 'kaydedildi' | 'kaydediliyor' | 'kaydedilemedi' | 'cakisma'
  setSaveState: (s: PlanState['saveState']) => void
  createPlan: (name: string) => string
  deletePlan: (id: string) => void
  selectPlan: (id: string) => void
  importPlan: (doc: PlanDoc) => void
  setTheme: (t: PlanState['theme']) => void
  update: (fn: (p: PlanDoc) => void) => void
  setProfile: (patch: Partial<Profile>) => void
  setLimits: (patch: Partial<Limits>) => void
  setStepValues: (step: string, values: StepValues, status?: PlanDoc['steps'][string]['status']) => void
  skipStep: (step: string, reason: string) => void
  setLocation: (loc: string) => void
  addEvidence: (e: Omit<Evidence, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateEvidence: (id: string, patch: Partial<Evidence>) => void
  recordDecision: (d: Omit<Decision, 'id' | 'decidedAt' | 'revision'>, label: string) => string
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateTask: (id: string, patch: Partial<Task>) => void
  snapshot: (label: string) => void
}

function touch(p: PlanDoc) {
  p.updatedAt = new Date().toISOString()
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      plans: {},
      currentId: undefined,
      theme: 'system',
      saveState: 'kaydedildi',
      setSaveState: (saveState) => set({ saveState }),
      createPlan: (name) => {
        const id = uid('plan')
        set((s) => ({ plans: { ...s.plans, [id]: emptyPlan(id, name) }, currentId: id }))
        return id
      },
      deletePlan: (id) =>
        set((s) => {
          const plans = { ...s.plans }
          delete plans[id]
          return { plans, currentId: s.currentId === id ? undefined : s.currentId }
        }),
      selectPlan: (id) => set({ currentId: id }),
      importPlan: (doc) => set((s) => ({ plans: { ...s.plans, [doc.id]: doc }, currentId: doc.id })),
      setTheme: (theme) => set({ theme }),
      update: (fn) =>
        set((s) => {
          const id = s.currentId
          if (!id || !s.plans[id]) return {}
          const copy: PlanDoc = structuredClone(s.plans[id])
          fn(copy)
          touch(copy)
          return { plans: { ...s.plans, [id]: copy } }
        }),
      setProfile: (patch) => get().update((p) => Object.assign(p.profile, patch)),
      setLimits: (patch) => get().update((p) => Object.assign(p.limits, patch)),
      setStepValues: (step, values, status) =>
        get().update((p) => {
          const prev = p.steps[step]
          p.steps[step] = {
            values: { ...(prev?.values ?? {}), ...values },
            status: status ?? (prev?.status === 'tamam' ? 'tamam' : 'taslak'),
            updatedAt: new Date().toISOString(),
          }
        }),
      skipStep: (step, reason) =>
        get().update((p) => {
          p.steps[step] = { values: p.steps[step]?.values ?? {}, status: 'atlandi', skipReason: reason, updatedAt: new Date().toISOString() }
        }),
      setLocation: (loc) => get().update((p) => (p.lastLocation = loc)),
      addEvidence: (e) => {
        const id = uid('kanit')
        const now = new Date().toISOString()
        get().update((p) => p.evidence.push({ ...e, id, createdAt: now, updatedAt: now }))
        return id
      },
      updateEvidence: (id, patch) =>
        get().update((p) => {
          const e = p.evidence.find((x) => x.id === id)
          if (e) Object.assign(e, patch, { updatedAt: new Date().toISOString() })
        }),
      recordDecision: (d, label) => {
        const id = uid('karar')
        get().update((p) => {
          p.revision += 1
          p.decisions.push({ ...d, id, decidedAt: new Date().toISOString(), revision: p.revision })
          p.revisions.push({ id: uid('surum'), label, createdAt: new Date().toISOString(), snapshot: JSON.stringify({ ...p, revisions: [] }) })
        })
        return id
      },
      addTask: (t) => {
        const id = uid('is')
        const now = new Date().toISOString()
        get().update((p) => p.tasks.push({ ...t, id, createdAt: now, updatedAt: now }))
        return id
      },
      updateTask: (id, patch) =>
        get().update((p) => {
          const t = p.tasks.find((x) => x.id === id)
          if (t) Object.assign(t, patch, { updatedAt: new Date().toISOString() })
        }),
      snapshot: (label) =>
        get().update((p) => {
          p.revisions.push({ id: uid('surum'), label, createdAt: new Date().toISOString(), snapshot: JSON.stringify({ ...p, revisions: [] }) })
        }),
    }),
    { name: 'decisionactplan-v1', partialize: (s) => ({ plans: s.plans, currentId: s.currentId, theme: s.theme }) as unknown as PlanState },
  ),
)

export function useCurrentPlan(): PlanDoc | undefined {
  return usePlanStore((s) => (s.currentId ? s.plans[s.currentId] : undefined))
}
