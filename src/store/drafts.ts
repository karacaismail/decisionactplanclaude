/**
 * Modüllerden gelen taslaklar. Taslak plana yazılmaz. Bir kişi taslağı inceleyip kaydeder.
 * Taslaklar plandan ayrı bir anahtarda durur: decisionactplan-drafts-v1.
 * Bu yüzden taslak varken hiçbir kontrol, kilit ya da eskime işareti değişmez.
 */
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { STRATEGY_N } from '@/data/decisions'
import { STEPS } from '@/data/registry'
import { EXECUTION_DECISIONS } from '@/data/stages'
import { LIMITS_STEP } from '@/engine/changes'
import { ROW_ID_FIELDS } from '@/engine/rowIds'
import { uid } from '@/engine/format'
import { decisionLocked } from '@/engine/gate'
import type { CommandResult, PlanCommands } from '@/platform/planCommands'
import { usePlanStore } from './planStore'

export const DRAFTS_KEY = 'decisionactplan-drafts-v1'
/** Profil adımı. Profil değişirse bütün kararlar eskir. */
const PROFILE_STEP = '00'
/** Modül bu adımlara taslak öneremez. */
export const PROTECTED_STEPS: readonly string[] = [PROFILE_STEP, LIMITS_STEP]
export const MAX_DRAFTS_PER_PLAN = 100
export const MAX_DRAFT_BYTES = 256 * 1024
export const MAX_EVIDENCE_TEXT = 2000

export interface StepDraft {
  id: string
  kind: 'adim'
  planId: string
  step: string
  patch: Record<string, unknown>
  createdAt: string
}

export interface EvidenceDraft {
  id: string
  kind: 'kanit'
  planId: string
  text: string
  createdAt: string
}

export type Draft = StepDraft | EvidenceDraft

interface DraftState {
  drafts: Draft[]
}

export const useDraftStore = create<DraftState>()(
  persist(() => ({ drafts: [] as Draft[] }), {
    name: DRAFTS_KEY,
    version: 1,
    storage: createJSONStorage(() => window.localStorage),
  }),
)

/* Öteki sekme taslak eklerse bu sekme listeyi yeniden okur. Böylece iki sekme birbirinin taslağını silmez. */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === DRAFTS_KEY) void useDraftStore.persist.rehydrate()
  })
}

const fail = (error: string): CommandResult => ({ ok: false, error })
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

function add(draft: Draft): CommandResult {
  if (draftsOf(draft.planId).length >= MAX_DRAFTS_PER_PLAN) return fail(`Bu planda ${MAX_DRAFTS_PER_PLAN} taslak bekliyor. Önce bekleyen taslakları inceleyin.`)
  useDraftStore.setState((s) => ({ drafts: [...s.drafts, draft] }))
  return { ok: true, draftId: draft.id }
}

/** Çekirdeğin komut uygulaması. Yalnız denetler ve taslak ekler. Planı değiştirmez. */
export const corePlanCommands: PlanCommands = {
  proposeStepDraft(planId, step, patch) {
    if (!usePlanStore.getState().plans[planId]) return fail('Plan bulunamadı.')
    const def = STEPS[step]
    if (!def) return fail('Adım bulunamadı.')
    if (PROTECTED_STEPS.includes(step)) return fail('Bu adım modülden değiştirilemez. Profil ve sınırlar yalnız kendi ekranında değişir.')
    if (!isRecord(patch) || Object.keys(patch).length === 0) return fail('Taslakta en az bir alan olmalı.')
    const keys = new Set(def.sections.flatMap((s) => s.fields.map((f) => f.key)))
    const unknown = Object.keys(patch).find((k) => !keys.has(k))
    if (unknown) return fail(`"${unknown}" alanı bu adımda yok.`)
    let copy: Record<string, unknown>
    try {
      const json = JSON.stringify(patch)
      if (new TextEncoder().encode(json).length > MAX_DRAFT_BYTES) return fail('Taslak çok büyük.')
      copy = JSON.parse(json) as Record<string, unknown>
    } catch {
      return fail('Taslak kaydedilebilir bir değer değil.')
    }
    /* Tekrarlı satır kimliksiz gelirse kimlik alır. Modül bu kimliği taslaktan okur. Kayıttan sonra kimlik değişmez. */
    for (const key of ROW_ID_FIELDS[step] ?? []) {
      const rows = copy[key]
      if (!Array.isArray(rows)) continue
      for (const row of rows) if (isRecord(row) && (typeof row._id !== 'string' || !row._id)) row._id = uid('satir')
    }
    return add({ id: uid('taslak'), kind: 'adim', planId, step, patch: copy, createdAt: new Date().toISOString() })
  },
  appendEvidenceDraft(planId, text) {
    if (!usePlanStore.getState().plans[planId]) return fail('Plan bulunamadı.')
    const clean = typeof text === 'string' ? text.trim() : ''
    if (!clean) return fail('Kanıt metni boş olamaz.')
    if (clean.length > MAX_EVIDENCE_TEXT) return fail(`Kanıt metni en çok ${MAX_EVIDENCE_TEXT} karakter olabilir.`)
    /* Aynı metin iki kez önerilmez. Böylece kanıt defterine aynı kayıt iki kez girmez. */
    if (draftsOf(planId).some((d) => d.kind === 'kanit' && d.text === clean)) return fail('Bu kanıt taslağı zaten bekliyor.')
    if (usePlanStore.getState().plans[planId].evidence.some((e) => e.title === clean)) return fail('Bu kanıt zaten kanıt defterinde. Yeni taslak hazırlanmadı.')
    return add({ id: uid('taslak'), kind: 'kanit', planId, text: clean, createdAt: new Date().toISOString() })
  },
}

export function draftsOf(planId: string): Draft[] {
  return useDraftStore.getState().drafts.filter((d) => d.planId === planId)
}

export function discardDraft(draftId: string): void {
  useDraftStore.setState((s) => ({ drafts: s.drafts.filter((d) => d.id !== draftId) }))
}

export function discardPlanDrafts(planId: string): void {
  if (!draftsOf(planId).length) return
  useDraftStore.setState((s) => ({ drafts: s.drafts.filter((d) => d.planId !== planId) }))
}

/**
 * Kişi taslağı kaydeder. Sorun varsa Türkçe hata metni döndürür.
 * Adım taslağı adım ekranındaki kurala uyar: kilitli bölüme yazılmaz.
 * Kayıt adım ekranıyla aynı yoldan geçer. Bu yüzden eskime kuralları aynen çalışır.
 */
export function acceptDraft(draftId: string): string | null {
  const draft = useDraftStore.getState().drafts.find((d) => d.id === draftId)
  if (!draft) return 'Taslak bulunamadı.'
  const store = usePlanStore.getState()
  const plan = store.plans[draft.planId]
  if (!plan) return 'Plan bulunamadı.'
  if (store.currentId !== draft.planId) return 'Taslağı kaydetmek için önce bu planı açın.'
  if (draft.kind === 'adim') {
    const def = STEPS[draft.step]
    if (!def || PROTECTED_STEPS.includes(draft.step)) return 'Bu adım modülden değiştirilemez.'
    const isStrategy = def.decision === STRATEGY_N
    const guarded = isStrategy || EXECUTION_DECISIONS.includes(def.decision)
    if (guarded && decisionLocked(plan, isStrategy ? STRATEGY_N : def.decision)) return 'Bu bölüm henüz kilitli. Taslak kaydedilmedi.'
    if (plan.steps[draft.step]?.status === 'atlandi') return 'Bu adım atlandı. Taslak kaydedilmedi.'
    store.setStepValues(draft.step, draft.patch)
  } else {
    store.addEvidence({ title: draft.text, kind: 'varsayim', ladder: 7, linkedSteps: [] })
  }
  discardDraft(draftId)
  return null
}
