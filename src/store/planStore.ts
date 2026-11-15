import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { emptyPlan, TRANSITION_LABEL, type Decision, type Evidence, type PlanDoc, type Profile, type StepValues, type Task, type Limits, type TransitionRecord } from '@/data/types'
import { parsePlanImport, prepareImportedPlan, validatePlanDoc } from '@/data/validate'
import { uid } from '@/engine/format'
import { applyLimits, applyProfile, applySkip, applyStepValues, gateOfStep, markStale, markStaleAfterGate, reviewChange as reviewChangeIn } from '@/engine/changes'
import { createGuardedStorage, STORAGE_KEY, type SaveResult } from '@/engine/sync'
import { applyStrategyReview, reviewBlocked, validateReview, type ReviewDraft } from '@/engine/renewal'
import { CHOICE_STEP, DIAGNOSIS_STEP, DOSSIER_STEP, GOALS_STEP, goalIssues, TASKS_STEP, taskIssues } from '@/engine/strategy'
import { RENEWAL_LABEL } from '@/data/types'

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
  /** Kayıt okunamadı. Bu sırada yeni plan açılmaz ve depoya yazılmaz. */
  loadFailed: boolean
  /** Her planın son yedek tarihi. Yedek, JSON dosyasını indirmektir. */
  backups: Record<string, string>
  /** Planın şimdi yedeklendiğini kaydeder. */
  markBackup: (id: string) => void
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
  /** Strateji gözden geçirme kararını kaydeder. Geçersiz taslakta Türkçe hata listesi döndürür. */
  recordStrategyReview: (draft: ReviewDraft) => string[]
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

const baseStorage = createJSONStorage<PlanState>(() => createGuardedStorage(typeof window !== 'undefined' ? window.localStorage : undefined, onSaveResult))

/**
 * Kayıt okunamadıysa bu bayrak açılır. Bayrak açıkken depoya hiçbir şey yazılmaz.
 * Böylece okunamayan kayıt, boş durumla ezilmez. Kullanıcının verisi tarayıcıda olduğu gibi durur.
 */
let hydrationFailed = false
export const HYDRATION_ERROR = 'Kayıtlı planlar okunamadı. Yazılım kayıtlı veriyi değiştirmedi. Önce ham kaydı indirin. Bu sırada yeni plan açmak ve dosya içe almak kapalıdır.'
export const LOAD_BLOCKED = 'Kayıtlı planlar okunamadı. Önce ham kaydı indirin. Yeni plan bu sırada kaydedilemez.'
const storage = baseStorage
  ? {
      ...baseStorage,
      setItem: (name: string, value: Parameters<typeof baseStorage.setItem>[1]) => {
        if (hydrationFailed) return
        return baseStorage.setItem(name, value)
      },
    }
  : undefined

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      plans: {},
      currentId: undefined,
      theme: 'system',
      backups: {},
      loadFailed: false,
      markBackup: (id) => set((s) => ({ backups: { ...s.backups, [id]: new Date().toISOString() } })),
      saveState: 'kaydedildi',
      saveError: undefined,
      setSaveState: (saveState, saveError) => set({ saveState, saveError }),
      createPlan: (name) => {
        if (get().loadFailed) throw new Error(LOAD_BLOCKED)
        const id = uid('plan')
        set((s) => ({ plans: { ...s.plans, [id]: emptyPlan(id, name) }, currentId: id, saveState: 'kaydediliyor' }))
        return id
      },
      deletePlan: (id) =>
        set((s) => {
          const plans = { ...s.plans }
          delete plans[id]
          const backups = { ...s.backups }
          delete backups[id]
          return { plans, backups, currentId: s.currentId === id ? undefined : s.currentId, saveState: 'kaydediliyor' }
        }),
      selectPlan: (id) => set({ currentId: id }),
      importPlan: (doc) => {
        if (get().loadFailed) throw new Error(LOAD_BLOCKED)
        if (!validatePlanDoc(doc)) throw new Error('Bu dosya bir plan dosyası değil. Plan dosyasını bu uygulamadan dışa aktarın.')
        /* Eski sürümden dışa aktarılan dosya da güncel alan yerleşimine taşınır. */
        const copy = migratePlan(doc.example ? doc : prepareImportedPlan(doc))
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
          const linked = gone.flatMap((e) => e.linkedSteps)
          const gates = linked.map((st) => gateOfStep(st)).filter((g): g is number => g !== null)
          // Bağlı adım yazılmadıysa kanıt bütün temeli ilgilendirir.
          if (linked.length === 0) markStale(p, 1)
          // Kanıt yalnız hiçbir kapının okumadığı adımlara bağlıysa hiçbir karar eskimez.
          else if (gates.length > 0) markStale(p, Math.min(...gates))
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
          // Kapı yeniden karara bağlandı. Sonraki kapıların kararları ve gerekiyorsa geçiş kararı eskir.
          markStaleAfterGate(p, d.gate)
          p.decisions.push({ ...d, id, stale: false, decidedAt: new Date().toISOString(), revision: p.revision })
          p.revisions.push({ id: uid('surum'), label, createdAt: new Date().toISOString(), snapshot: JSON.stringify({ ...p, revisions: [] }) })
        })
        return id
      },
      recordStrategyReview: (draft) => {
        const blocked = reviewBlocked(get().currentId ? get().plans[get().currentId!] : undefined)
        const errors = [...validateReview(draft), ...(blocked ? [blocked] : [])]
        if (errors.length) return errors
        get().update((p) => {
          const record = applyStrategyReview(p, draft)
          if (!record) return false
          p.revisions.push({ id: uid('surum'), label: `Strateji gözden geçirme: ${RENEWAL_LABEL[record.decision]}`, createdAt: record.decidedAt, snapshot: JSON.stringify({ ...p, revisions: [] }) })
        })
        return []
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
      version: 3,
      migrate: (persisted) => {
        const st = persisted as { plans?: Record<string, PlanDoc> }
        for (const plan of Object.values(st?.plans ?? {})) migratePlan(plan)
        return st as unknown as PlanState
      },
      partialize: (s) => ({ plans: s.plans, currentId: s.currentId, theme: s.theme, backups: s.backups }) as unknown as PlanState,
      /* Okuma ya da taşıma hata verirse hata görünür olur ve kayıt korunur. Hata sessizce yutulmaz. */
      onRehydrateStorage: () => (_state, error) => {
        /* Başarılı bir yeniden okuma kilidi kaldırır. Hata kayıt durumunu değiştirmez, ayrı bir bayrak açar. */
        hydrationFailed = Boolean(error)
        setTimeout(() => usePlanStore.setState({ loadFailed: Boolean(error) }), 0)
      },
    },
  ),
)

/**
 * Sürüm 2 taşıması: "Seçilen yol" ve "Vazgeçilenler" Adım 18'den Adım 19'a geçti.
 * Adım 19'da değer varsa üstüne yazılmaz. Veri kaybolmaz.
 */
export function migrateChoiceFields(plan: PlanDoc): PlanDoc {
  const from = plan.steps?.['18']?.values
  if (!from) return plan
  const moved: Record<string, unknown> = {}
  for (const key of ['chosenPath', 'givenUp'] as const) {
    if (from[key] !== undefined && from[key] !== '') moved[key] = from[key]
    delete from[key]
  }
  if (Object.keys(moved).length === 0) return plan
  const to = plan.steps['19'] ?? { values: {}, status: 'taslak' as const, updatedAt: new Date().toISOString() }
  to.values = { ...moved, ...to.values }
  plan.steps['19'] = to
  return plan
}

/**
 * Sürüm 3 taşıması: hedef ve iş alanları Adım 19'dan uygulama planı adımlarına geçti.
 * Adım 19 artık yalnız seçimi ve vazgeçişi taşır.
 * Kurallar:
 * 1. Boş değer taşınmaz. Boş değer dolu bir değerin üstüne de yazılmaz.
 * 2. Yeni adımda dolu değer varsa eski değer atılır. Yeni adım kullanıcının son sözüdür.
 * 3. Yeni adım "tamam" olur, ancak eski adım tamamdıysa ve yeni adımın denetimi geçiyorsa.
 * 4. Eski sürümde strateji tamamdıysa plan `legacyStrategy` izni alır. Strateji uygulama kilitlenmez.
 * 5. Yeni zorunlu alanı boş kalan eski adım "taslak" olur. Ekran yanlış "Tamam" göstermez.
 * İki kez çalışınca sonuç değişmez.
 */
export function migratePlanSteps(plan: PlanDoc): PlanDoc {
  /*
   * Bu sabitler işlevin içindedir. Taşıma, depo kurulurken çalışır.
   * Dosyanın altında tanımlanan bir sabit o anda henüz hazır olmaz ve taşıma sessizce başarısız olur.
   */
  const GOAL_KEYS = ['objective', 'keyResults']
  const TASK_KEYS = ['now', 'next', 'later', 'weeklyBottleneck']
  const filledValue = (x: unknown) => (Array.isArray(x) ? x.length > 0 : typeof x === 'string' ? x.trim() !== '' : x !== undefined && x !== null)
  const from = plan.steps?.[CHOICE_STEP]
  if (!from?.values) return plan
  const dossier = plan.steps[DOSSIER_STEP]
  const oldFormat = GOAL_KEYS.some((k) => k in from.values) || TASK_KEYS.some((k) => k in from.values) || (from.status === 'tamam' && !filledValue(from.values.winningAim))
  const oldChoiceDone = from.status === 'tamam' && ['chosenPath', 'choiceReason', 'givenUp'].every((k) => filledValue(from.values[k]))
  const oldDossierDone = dossier?.status === 'tamam' && Array.isArray(dossier.values.qualityCheck) && dossier.values.qualityCheck.length >= 5
  if (oldFormat && oldChoiceDone && oldDossierDone && !plan.steps[DIAGNOSIS_STEP] && !plan.legacyStrategy) plan.legacyStrategy = { migratedAt: new Date().toISOString() }

  const move = (keys: readonly string[], target: string, required: string[], issues: (v: Record<string, unknown>) => string[]) => {
    const moved: Record<string, unknown> = {}
    for (const key of keys) {
      if (filledValue(from.values[key])) moved[key] = from.values[key]
      delete from.values[key]
    }
    if (Object.keys(moved).length === 0) return
    const existed = Boolean(plan.steps[target])
    const to = plan.steps[target] ?? { values: {}, status: 'taslak' as const, updatedAt: from.updatedAt }
    const kept = Object.fromEntries(Object.entries(to.values).filter(([, x]) => filledValue(x)))
    to.values = { ...to.values, ...moved, ...kept }
    const complete = required.every((k) => filledValue(to.values[k])) && issues(to.values).length === 0
    if (from.status === 'tamam' && complete && !existed) to.status = 'tamam'
    plan.steps[target] = to
  }
  move(GOAL_KEYS, GOALS_STEP, ['objective', 'keyResults'], goalIssues)
  move(TASK_KEYS, TASKS_STEP, ['now'], (v) => taskIssues(v, plan))
  if (oldFormat && from.status === 'tamam' && !['winningAim', 'playField'].every((k) => filledValue(from.values[k]))) from.status = 'taslak'
  if (oldFormat && dossier?.status === 'tamam' && !filledValue(dossier.values.approvedBy)) dossier.status = 'taslak'
  return plan
}

/** Bütün taşımalar. İçe alınan dosya ve depodaki eski kayıt aynı yoldan geçer. İki kez çalışması veriyi bozmaz. */
export function migratePlan(plan: PlanDoc): PlanDoc {
  return migratePlanSteps(migrateChoiceFields(plan))
}

export function useCurrentPlan(): PlanDoc | undefined {
  return usePlanStore((s) => (s.currentId ? s.plans[s.currentId] : undefined))
}
