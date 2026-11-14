/**
 * Durum özeti. Karar Kitabı'ndaki "SWOT Analizi" ve "TOWS Matrisi" yöntemlerinin kuralıdır.
 * Dört liste var olan temel adımlarından toplanır. Kullanıcı aynı bilgiyi ikinci kez yazmaz.
 * Yazılım yol önermez ve yol seçmez. Yalnız listeyi toplar ve dört çapraz soruyu sorar.
 * Bu dosya yalnız Adım 00 ile Adım 18 arasını okur.
 */
import type { PlanDoc } from '@/data/types'
import { STRENGTH_LABEL, strengthsOf, ADVANTAGE_LEVELS } from './strengths'

export type SituationKind = 'guclu' | 'zayif' | 'firsat' | 'tehdit'

export interface SituationItem {
  text: string
  /** Maddenin türü ya da geldiği yer. Kısa bir etikettir. */
  note: string
  /** Kaynak adım. Kullanıcı maddeyi orada düzeltir. */
  step: string
}

export interface Situation {
  guclu: SituationItem[]
  zayif: SituationItem[]
  firsat: SituationItem[]
  tehdit: SituationItem[]
  /** Adım 04'te fırsat ya da tehdit diye işaretlenmemiş etken sayısı. */
  unclassified: number
}

export const SITUATION_TITLE: Record<SituationKind, string> = { guclu: 'Güçlü yönler', zayif: 'Zayıf yönler', firsat: 'Fırsatlar', tehdit: 'Tehditler' }
/** Liste boşken kullanıcının gideceği adım ve yapacağı iş. */
export const SITUATION_EMPTY: Record<SituationKind, { step: string; text: string }> = {
  guclu: { step: '12', text: 'Adım 12\'de güçlerinizi yazın ve dört soruyla sınayın.' },
  zayif: { step: '12', text: 'Adım 12\'de gereken becerileri yazın.' },
  firsat: { step: '09', text: 'Adım 09\'da pazar boşluklarını yazın.' },
  tehdit: { step: '17', text: 'Adım 17\'de riskleri yazın.' },
}

export type Origin = 'so' | 'wo' | 'st' | 'wt' | 'baska'
export const ORIGIN_LABEL: Record<Origin, string> = {
  so: 'Güçlü yön ve fırsat',
  wo: 'Zayıf yön ve fırsat',
  st: 'Güçlü yön ve tehdit',
  wt: 'Zayıf yön ve tehdit',
  baska: 'Başka bir düşünce',
}
export const ORIGIN_OPTIONS = (Object.keys(ORIGIN_LABEL) as Origin[]).map((value) => ({ value, label: ORIGIN_LABEL[value] }))

export const CROSS_QUESTIONS: { key: string; origin: Origin; label: string; placeholder: string }[] = [
  { key: 'crossSO', origin: 'so', label: 'Hangi güçlü yönle hangi fırsatı yakalarsınız?', placeholder: 'Örneğin: Barista deneyimiyle sabah 7 boşluğunu doldururuz.' },
  { key: 'crossWO', origin: 'wo', label: 'Hangi zayıf yön bir fırsatı kaçırtıyor? Bu zayıf yönü nasıl kapatırsınız?', placeholder: 'Örneğin: Muhasebeyi dışarıdan alırız. Aylık kart satışı böyle kayda girer.' },
  { key: 'crossST', origin: 'st', label: 'Hangi güçlü yön bir tehdidi önler?', placeholder: 'Örneğin: Durağa yakınlık, zincir kafenin indirimine karşı korur.' },
  { key: 'crossWT', origin: 'wt', label: 'Zayıf yön ile tehdit nerede üst üste biniyor? Oradan nasıl kaçınırsınız?', placeholder: 'Örneğin: Kira artarsa ve bilgi tek kişide kalırsa salon açmayız.' },
]

type Row = Record<string, unknown>
const v = (p: PlanDoc, s: string, k: string): unknown => p.steps[s]?.values?.[k]
const rows = (p: PlanDoc, s: string, k: string): Row[] => (Array.isArray(v(p, s, k)) ? (v(p, s, k) as Row[]) : [])
const text = (x: unknown): string | null => (typeof x === 'string' && x.trim() ? x.trim() : null)

const SKILL_NOTE: Record<string, string> = { satinAl: 'Dışarıdan alınıyor', ortak: 'Ortağa bağlı', yok: 'Edinilemiyor' }
const FORCES: [key: string, label: string][] = [
  ['forceNew', 'Yeni girenlerin gücü'],
  ['forceSub', 'İkamelerin gücü'],
  ['forceBuyer', 'Alıcıların gücü'],
  ['forceSupplier', 'Tedarikçilerin gücü'],
  ['forceRivalry', 'Rekabetin şiddeti'],
]
/** Beş üzerinden 4 ve 5 güçlü baskı sayılır. */
const STRONG_FORCE = 4
/** Olasılık çarpı etki 6 ve üstüyse risk kritiktir. Kapı 5 ile aynı kural. */
const CRITICAL_RISK = 6

export function buildSituation(plan: PlanDoc): Situation {
  const strengths = strengthsOf(plan)
  const guclu: SituationItem[] = strengths.filter((s) => ADVANTAGE_LEVELS.includes(s.level)).map((s) => ({ text: s.name, note: STRENGTH_LABEL[s.level], step: '12' }))

  const zayif: SituationItem[] = [
    ...strengths.filter((s) => s.level === 'dezavantaj').map((s) => ({ text: s.name, note: 'İşe yaramıyor', step: '12' })),
    ...rows(plan, '12', 'skills')
      .filter((r) => text(r.skill) && typeof r.plan === 'string' && SKILL_NOTE[r.plan])
      .map((r) => ({ text: text(r.skill)!, note: SKILL_NOTE[r.plan as string], step: '12' })),
  ]
  const fragile = text(v(plan, '16', 'fragileNumber'))
  if (fragile) zayif.push({ text: fragile, note: 'En kırılgan sayı', step: '16' })

  const factors = rows(plan, '04', 'factorNotes').filter((r) => text(r.change))
  const factorItem = (r: Row): SituationItem => ({ text: text(r.change)!, note: text(r.factor) ?? 'Dış etken', step: '04' })

  const firsat: SituationItem[] = [
    ...rows(plan, '09', 'gaps')
      .filter((r) => text(r.gap) && r.demandExists === true && r.recentlyFilled !== true)
      .map((r) => ({ text: text(r.gap)!, note: 'Pazar boşluğu', step: '09' })),
    ...factors.filter((r) => r.effect === 'firsat').map(factorItem),
  ]

  const tehdit: SituationItem[] = [
    ...FORCES.map(([key, label]) => ({ label, rate: Number(v(plan, '04', key) ?? 0) }))
      .filter((f) => f.rate >= STRONG_FORCE)
      .sort((a, b) => b.rate - a.rate)
      .map((f) => ({ text: f.label, note: `Güçlü baskı, ${f.rate} / 5`, step: '04' })),
    ...factors.filter((r) => r.effect === 'tehdit').map(factorItem),
    ...rows(plan, '17', 'risks')
      .filter((r) => text(r.risk) && Number(r.likelihood ?? 0) * Number(r.impact ?? 0) >= CRITICAL_RISK)
      .map((r) => ({ text: text(r.risk)!, note: 'Kritik risk', step: '17' })),
  ]

  return { guclu, zayif, firsat, tehdit, unclassified: factors.filter((r) => r.effect !== 'firsat' && r.effect !== 'tehdit').length }
}

export function situationCount(s: Situation): number {
  return s.guclu.length + s.zayif.length + s.firsat.length + s.tehdit.length
}

export interface CrossAnswer {
  label: string
  question: string
  text: string
}

/** Kullanıcının cevapladığı çapraz sorular. Devir raporu bunları yolların yanında gösterir. */
export function crossAnswers(plan: PlanDoc): CrossAnswer[] {
  return CROSS_QUESTIONS.map((q) => ({ label: ORIGIN_LABEL[q.origin], question: q.label, text: text(v(plan, '18', q.key)) })).filter((a): a is CrossAnswer => a.text !== null)
}
