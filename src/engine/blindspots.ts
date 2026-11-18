/**
 * Bakılmayan alanlar ve varsayımın bilgiye oranı.
 * Öngörülemeyen sorunlar en çok kimsenin bakmadığı yerde saklanır.
 * Yazılım bu yerleri tahmin etmez. Yalnız hangi adıma bakılmadığını gösterir.
 */
import { STEP_LIST } from '@/data/steps'
import { FOUNDATION_DECISIONS } from '@/data/stages'
import type { PlanDoc } from '@/data/types'
import { stepApplies } from './conditions'

export type BlindSpotKind = 'atlandi' | 'bos' | 'kisaYol'

export interface BlindSpot {
  step: string
  title: string
  kind: BlindSpotKind
  reason: string
}

export const BLIND_SPOT_LABEL: Record<BlindSpotKind, string> = { atlandi: 'Atlandı', bos: 'Doldurulmadı', kisaYol: 'Kısa yolda gizli' }

const hasValue = (x: unknown): boolean => x !== undefined && x !== null && x !== '' && !(Array.isArray(x) && x.length === 0)

/** Temel adımlarından hangisine bakılmadı? Profile göre gizlenen adım sayılmaz. */
export function blindSpots(plan: PlanDoc): BlindSpot[] {
  const out: BlindSpot[] = []
  for (const s of STEP_LIST) {
    if (!FOUNDATION_DECISIONS.includes(s.decision)) continue
    if (stepApplies(s.mandatory, plan) === 'gizli') continue
    const rec = plan.steps[s.id]
    /* Kısa yol adımı gizler. Adım daha önce doldurulduysa bakılmış sayılır. */
    if (plan.shortPath && !s.shortPath) {
      if (!Object.values(rec?.values ?? {}).some(hasValue)) out.push({ step: s.id, title: s.title, kind: 'kisaYol', reason: 'Kısa yol bu adımı gizledi.' })
      continue
    }
    if (rec?.status === 'atlandi') {
      out.push({ step: s.id, title: s.title, kind: 'atlandi', reason: rec.skipReason?.trim() || 'Neden yazılmadı.' })
      continue
    }
    /* Adım 00 profili yazar. Profil doluysa adım dolu sayılır. */
    const filled = s.id === '00' ? Boolean(plan.profile.customer) : Object.values(rec?.values ?? {}).some(hasValue)
    if (!filled) out.push({ step: s.id, title: s.title, kind: 'bos', reason: 'Bu adım hiç doldurulmadı.' })
  }
  return out
}

export interface KnowledgeRatio {
  total: number
  kaynakli: number
  hesap: number
  karar: number
  varsayim: number
  /** Rapora yazılan tam cümle. */
  sentence: string
}

type Status = 'kaynakli' | 'hesap' | 'karar' | 'varsayim'

/** Teslim raporundaki cümlelerin kaçı varsayım, kaçı kaynaklı? Cümle yoksa null döner. */
export function knowledgeRatio(groups: { claims: { status: Status }[] }[]): KnowledgeRatio | null {
  const all = groups.flatMap((g) => g.claims)
  if (all.length === 0) return null
  const count = (s: Status) => all.filter((c) => c.status === s).length
  const kaynakli = count('kaynakli')
  const varsayim = count('varsayim')
  return { total: all.length, kaynakli, hesap: count('hesap'), karar: count('karar'), varsayim, sentence: `${all.length} cümlenin ${varsayim} tanesi varsayım. ${kaynakli} tanesi kaynaklı.` }
}
