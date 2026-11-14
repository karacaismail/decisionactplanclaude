import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { emptyPlan, TRANSITION_LABEL, type Decision, type Evidence, type PlanDoc, type Profile, type StepValues, type Task, type Limits, type TransitionRecord } from '@/data/types'
import { parsePlanImport, prepareImportedPlan, validatePlanDoc } from '@/data/validate'
import { uid } from '@/engine/format'
import { applyLimits, applyProfile, applySkip, applyStepValues, gateOfStep, markStale, reviewChange as reviewChangeIn } from '@/engine/changes'
import { createGuardedStorage, STORAGE_KEY, type SaveResult } from '@/engine/sync'

export type SaveState = 'kaydedildi' | 'kaydediliyor' | 'kaydedilemedi' | 'cakisma'

interface PlanState {
  plans: Record<string, PlanDoc>
  currentId?: string
  theme: 'light' | 'dark' | 'system'
  /** Kayıt durumu. Başlıkta gösterilir. */
  saveState: SaveState
  /** Son kayıt hatası. Kullanıcıya açık yazılır. */
  saveError?: string
  setSaveState: (s: SaveState, error?: string) => void
  createPlan: (name: string) => string
  deletePlan: (id: string) => void
  selectPlan: (id: string) => void
  /** Dışarıdan gelen belgeyi denetler, kopya olarak ekler. Örnek plan olduğu gibi girer. Geçersizde Türkçe hata fırlatır. */
  importPlan: (doc: unknown) => string
  /** Dosya metnini denetleyip içe alır. 8 MB sınırı vardır. */
  importPlanText: (text: string, byteLength?: number) => string
  setTheme: (t: PlanState['theme']) => void
  /** Planı değiştirir. İşlev tam olarak false döndürürse hiçbir şey yazılmaz. */
  update: (fn: (p: PlanDoc) => unknown) => void
  setProfile: (patch: Partial<Profile>) => void
  setLimits: (patch: Partial<Limits>) => void
  setStepValues: (step: string, values: StepValues, status?: PlanDoc['steps'][string]['status']) => void
  skipStep: (step: string, reason: string) => void
  setLocation: (loc: string) => void
  addEvidence: (e: Omit<Evidence, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateEvidence: (id: string, patch: Partial<Evidence>) => void
  /** Kanıtı siler. Bağlı adımların kararları ve geçiş kararı eskir. */
  removeEvidence: (ids: string[]) => void
  /** Geçiş kapısı kararını kaydeder. Yeni sürüm alınır. */
  recordTransition: (t: Omit<TransitionRecord, 'id' | 'decidedAt' | 'revision' | 'stale'>) => string
  recordDecision: (d: Omit<Decision, 'id' | 'decidedAt' | 'revision'>, label: string) => string
  /** Sınır değişikliğine ikinci görüş yazar. Sorun varsa Türkçe hata metni döndürür. */
  reviewChange: (id: string, reviewer: string) => string | null
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateTask: (id: string, patch: Partial<Task>) => void
  snapshot: (label: string) => void
}

function touch(p: PlanDoc) {
  p.updatedAt = new Date().toISOString()
}

/** Yazma sonucu durumu günceller. Aynı durumu yeniden yazmaz, böylece döngü oluşmaz. */
function onSaveResult(r: SaveResult) {
  setTimeout(() => {
    const s = usePlanStore.getState()
    if (r.ok) {
      if (s.saveState === 'kaydediliyor' || s.saveState === 'kaydedilemedi') usePlanStore.setState({ saveState: 'kaydedildi', saveError: undefined })
      return
    }
    const msg = r.quota ? 'Tarayıcı depolama alanı dolu. Plan kaydedilemedi. Kopyanızı indirin.' : 'Plan tarayıcıya kaydedilemedi. Kopyanızı indirin.'
    if (s.saveState !== 'kaydedilemedi' || s.saveError !== msg) usePlanStore.setState({ saveState: 'kaydedilemedi', saveError: msg })
  }, 0)
}

const storage = createJSONStorage<PlanState>(() => createGuardedStorage(typeof window !== 'undefined' ? window.localStorage : undefined, onSaveResult))

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      plans: {},
      currentId: undefined,
      theme: 'system',
      saveState: 'kaydedildi',
      saveError: undefined,
      setSaveState: (saveState, saveError) => set({ saveState, saveError }),
      createPlan: (name) => {
        const id = uid('plan')
        set((s) => ({ plans: { ...s.plans, [id]: emptyPlan(id, name) }, currentId: id, saveState: 'kaydediliyor' }))
        return id
      },
      deletePlan: (id) =>
        set((s) => {
          const plans = { ...s.plans }
          delete plans[id]
          return { plans, currentId: s.currentId === id ? undefined : s.currentId, saveState: 'kaydediliyor' }
        }),
      selectPlan: (id) => set({ currentId: id }),
      importPlan: (doc) => {
        if (!validatePlanDoc(doc)) throw new Error('Bu dosya bir plan dosyası değil. Plan dosyasını bu uygulamadan dışa aktarın.')
        const copy = doc.example ? doc : prepareImportedPlan(doc)
        set((s) => ({ plans: { ...s.plans, [copy.id]: copy }, currentId: copy.id, saveState: 'kaydediliyor' }))
        return copy.id
      },
      importPlanText: (text, byteLength) => get().importPlan(parsePlanImport(text, byteLength)),
      setTheme: (theme) => set({ theme }),
      update: (fn) =>
        set((s) => {
          const id = s.currentId
          if (!id || !s.plans[id]) return {}
          const copy: PlanDoc = structuredClone(s.plans[id])
          if (fn(copy) === false) return {}
          touch(copy)
          return { plans: { ...s.plans, [id]: copy }, saveState: s.saveState === 'cakisma' ? 'cakisma' : 'kaydediliyor' }
        }),
      setProfile: (patch) => get().update((p) => applyProfile(p, patch)),
      setLimits: (patch) => get().update((p) => applyLimits(p, patch)),
      setStepValues: (step, values, status) => get().update((p) => applyStepValues(p, step, values, status)),
      skipStep: (step, reason) => get().update((p) => applySkip(p, step, reason)),
      setLocation: (loc) => get().update((p) => (p.lastLocation === loc ? false : void (p.lastLocation = loc))),
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
      removeEvidence: (ids) =>
        get().update((p) => {
          const gone = p.evidence.filter((e) => ids.includes(e.id))
          if (gone.length === 0) return
          p.evidence = p.evidence.filter((e) => !ids.includes(e.id))
          const gates = gone.flatMap((e) => e.linkedSteps.map((st) => gateOfStep(st)))
          // Bağlı adım yazılmadıysa kanıt bütün temeli ilgilendirir.
          markStale(p, gates.length > 0 ? Math.min(...gates) : 1)
        }),
      recordTransition: (t) => {
        const id = uid('gecis')
        get().update((p) => {
          p.revision += 1
          p.transitions = [...(p.transitions ?? []), { ...t, id, decidedAt: new Date().toISOString(), revision: p.revision }]
          p.revisions.push({ id: uid('surum'), label: `Geçiş kapısı: ${TRANSITION_LABEL[t.outcome]}`, createdAt: new Date().toISOString(), snapshot: JSON.stringify({ ...p, revisions: [] }) })
        })
        return id
      },
      recordDecision: (d, label) => {
        const id = uid('karar')
        get().update((p) => {
          p.revision += 1
          // Önceki kapı yeniden karara bağlandı. Sonraki kapıların kararları eskir.
          markStale(p, d.gate + 1)
          p.decisions.push({ ...d, id, stale: false, decidedAt: new Date().toISOString(), revision: p.revision })
          p.revisions.push({ id: uid('surum'), label, createdAt: new Date().toISOString(), snapshot: JSON.stringify({ ...p, revisions: [] }) })
        })
        return id
      },
      reviewChange: (id, reviewer) => {
        let error: string | null = null
        get().update((p) => {
          error = reviewChangeIn(p, id, reviewer)
          return error === null
        })
        return error
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
    {
      name: STORAGE_KEY,
      storage,
      partialize: (s) => ({ plans: s.plans, currentId: s.currentId, theme: s.theme }) as unknown as PlanState,
    },
  ),
)

export function useCurrentPlan(): PlanDoc | undefined {
  return usePlanStore((s) => (s.currentId ? s.plans[s.currentId] : undefined))
}
