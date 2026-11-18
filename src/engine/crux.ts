/**
 * Asıl engel, başarı koşulları, yol bağları, serbest bütçe ve eşleşme oranı.
 * Bu kayıtlar strateje teslim raporunu güçlendirir. Hiçbiri hazırlık kontrolünün ölçütü değildir.
 * Yazılım yorum yapmaz. Koşulun durumunu yalnız bağlı kanıtların yönünden çıkarır.
 * Bu dosya yalnız Adım 00 ile Adım 18 arasını okur.
 */
import type { CalcResult } from '@/data/schema'
import type { PlanDoc } from '@/data/types'
import { committedKurus } from './gate'

type Row = Record<string, unknown>
const v = (p: PlanDoc, s: string, k: string): unknown => p.steps[s]?.values?.[k]
const text = (x: unknown): string | null => (typeof x === 'string' && x.trim() ? x.trim() : null)
const list = (x: unknown): Row[] => (Array.isArray(x) ? (x as Row[]) : [])
const ids = (x: unknown): string[] => (Array.isArray(x) ? x.filter((i): i is string => typeof i === 'string') : [])
const amount = (x: unknown): number => (typeof x === 'number' && Number.isFinite(x) ? x : 0)

/** Kanıt kimliklerini başlığa çevirir. Silinmiş kanıt sayılır, uydurulmaz. */
function linked(plan: PlanDoc, value: unknown): { titles: string[]; counters: string[]; missing: number } {
  const found = ids(value).map((id) => plan.evidence.find((e) => e.id === id))
  const present = found.filter((e): e is NonNullable<typeof e> => Boolean(e))
  return { titles: present.map((e) => e.title), counters: present.map((e) => text(e.counterFinding)).filter((c): c is string => c !== null), missing: found.length - present.length }
}

/* ---- Asıl engel ---- */

export interface Crux {
  text: string
  why: string | null
  paths: string | null
  alternative: string | null
  /** İki açıklamayı ayıran bulgu. */
  split: string | null
  support: string[]
  counter: string[]
  /** Bağlıyken silinmiş kanıt sayısı. */
  missing: number
}

export const CRUX_STEP = '18'

export function cruxOf(plan: PlanDoc): Crux | null {
  const crux = text(v(plan, CRUX_STEP, 'crux'))
  if (!crux) return null
  const support = linked(plan, v(plan, CRUX_STEP, 'cruxEvidence'))
  const counter = linked(plan, v(plan, CRUX_STEP, 'cruxCounter'))
  return {
    text: crux,
    why: text(v(plan, CRUX_STEP, 'cruxWhy')),
    paths: text(v(plan, CRUX_STEP, 'cruxPaths')),
    alternative: text(v(plan, CRUX_STEP, 'cruxAlt')),
    split: text(v(plan, CRUX_STEP, 'cruxSplit')),
    support: support.titles,
    counter: [...counter.titles, ...support.counters],
    missing: support.missing + counter.missing,
  }
}

/* ---- Başarı koşulları ---- */

export type ConditionStatus = 'sinanmadi' | 'destek' | 'karsi' | 'celiski'
export const CONDITION_LABEL: Record<ConditionStatus, string> = { sinanmadi: 'Sınanmadı', destek: 'Destek var', karsi: 'Karşı bulgu var', celiski: 'Bulgular çelişiyor' }
export const UNKNOWN = 'Bilinmiyor'

export interface SuccessCondition {
  id: string
  condition: string
  paths: string | null
  measure: string | null
  /** Ölçülmediyse "Bilinmiyor". Ölçülen sıfır "0" olarak kalır. */
  baseline: string
  threshold: string | null
  /** Sınır denemeden sonra seçildiyse rapor bunu söyler. */
  thresholdLate: boolean
  owner: string | null
  comment: string | null
  support: string[]
  counter: string[]
  missing: number
  status: ConditionStatus
}

function conditionFrom(plan: PlanDoc, r: Row, i: number): SuccessCondition {
  const support = linked(plan, r.support)
  const counter = linked(plan, r.counter)
  const counters = [...counter.titles, ...support.counters]
  const status: ConditionStatus = support.titles.length && counters.length ? 'celiski' : support.titles.length ? 'destek' : counters.length ? 'karsi' : 'sinanmadi'
  return {
    id: String(r._id ?? i),
    condition: text(r.condition)!,
    paths: text(r.paths),
    measure: text(r.measure),
    baseline: text(r.baseline) ?? UNKNOWN,
    threshold: text(r.threshold),
    thresholdLate: r.thresholdWhen === 'sonra',
    owner: text(r.owner),
    comment: text(r.comment),
    support: support.titles,
    counter: counters,
    missing: support.missing + counter.missing,
    status,
  }
}

const conditionRows = (values: Row | undefined): Row[] => list(values?.successConditions).filter((r) => text(r.condition))

export function successConditionsOf(plan: PlanDoc): SuccessCondition[] {
  return conditionRows(plan.steps[CRUX_STEP]?.values).map((r, i) => conditionFrom(plan, r, i))
}

/** "Koşulların durumu" kutusu. Form değerlerini okur, kanıtı plandan bulur. */
export function conditionsCalc(values: Row, plan: PlanDoc): CalcResult | null {
  const rows = conditionRows(values).map((r, i) => conditionFrom(plan, r, i))
  if (rows.length === 0) return null
  const tested = rows.filter((c) => c.status !== 'sinanmadi').length
  const missing = rows.reduce((n, c) => n + c.missing, 0)
  return {
    value: `${rows.length} koşuldan ${tested} tanesi sınandı`,
    lines: rows.map((c) => `${/[.!?]$/.test(c.condition) ? c.condition : `${c.condition}.`} ${CONDITION_LABEL[c.status]}.`),
    warn: missing > 0 ? `${missing} bağlı kanıt silinmiş. Bağlantıyı düzeltin.` : undefined,
  }
}

/* ---- Yol bağları ---- */

export type LinkRelation = 'destekliyor' | 'celisiyor' | 'bilinmiyor'
export const RELATION_LABEL: Record<LinkRelation, string> = { destekliyor: 'Destekliyor', celisiyor: 'Çelişiyor', bilinmiyor: 'Bilinmiyor' }
export const RELATION_OPTIONS = (Object.keys(RELATION_LABEL) as LinkRelation[]).map((value) => ({ value, label: RELATION_LABEL[value] }))

export interface PathLink {
  path: string | null
  a: string
  b: string
  relation: LinkRelation
  reason: string | null
}

export function pathLinksOf(plan: PlanDoc): PathLink[] {
  return list(v(plan, CRUX_STEP, 'pathLinks'))
    .filter((r) => text(r.a) && text(r.b))
    .map((r) => ({ path: text(r.path), a: text(r.a)!, b: text(r.b)!, relation: r.relation === 'destekliyor' || r.relation === 'celisiyor' ? r.relation : 'bilinmiyor', reason: text(r.reason) }))
}

/* ---- Serbest bütçe ---- */

export type FreeBudget =
  | { state: 'yok' }
  | { state: 'bilinmiyor' }
  | { state: 'hesap'; budgetKurus: number; spentKurus: number; permitsKurus: number; unpaidKurus: number; freeKurus: number }

export const BUDGET_STEP = '16'

/**
 * Serbest bütçe: harcama sınırından harcanan, koşullu izne bağlanan ve ödenmemiş taahhüt düşülür.
 * Her tutar bir kez düşülür. Taahhüt bilinmiyorsa kesin bakiye yazılmaz.
 */
export function freeBudget(plan: PlanDoc, values: Row | undefined = plan.steps[BUDGET_STEP]?.values): FreeBudget {
  const budget = plan.limits.budgetKurus
  const known = values?.commitmentsKnown
  if (!budget || (known !== 'var' && known !== 'yok' && known !== 'bilinmiyor')) return { state: 'yok' }
  if (known === 'bilinmiyor') return { state: 'bilinmiyor' }
  const spentKurus = amount(values?.spentKurus)
  const permitsKurus = committedKurus(plan)
  const unpaidKurus = known === 'var' ? list(values?.commitments).reduce((sum, r) => sum + amount(r.amountKurus), 0) : 0
  return { state: 'hesap', budgetKurus: budget, spentKurus, permitsKurus, unpaidKurus, freeKurus: budget - spentKurus - permitsKurus - unpaidKurus }
}

/* ---- Eşleşme oranı ---- */

export type MatchRate = { state: 'yok' } | { state: 'sifir' } | { state: 'hata' } | { state: 'hesap'; percent: number }

/** Oran pay ve paydadan hesaplanır. Payda sıfırsa oran hesaplanmaz. Pay paydayı geçerse oran yazılmaz. Ölçüm yoksa oran bilinmez. */
export function matchRate(valid: unknown, matched: unknown): MatchRate {
  if (typeof valid !== 'number' || typeof matched !== 'number') return { state: 'yok' }
  if (valid === 0) return { state: 'sifir' }
  /* Uygun teklif alan talep, geçerli talebi geçemez. Geçiyorsa oran yazılmaz. */
  if (matched > valid) return { state: 'hata' }
  return { state: 'hesap', percent: Math.round((matched / valid) * 100) }
}

/* ---- Yolun kurma biçimi ve bağımlılıklar ---- */

export type Vehicle = 'kendimiz' | 'satinAl' | 'ortak'
export const VEHICLE_LABEL: Record<Vehicle, string> = { kendimiz: 'Kendimiz kurarız', satinAl: 'Satın alırız', ortak: 'Ortakla kurarız' }
export const VEHICLE_OPTIONS = (Object.keys(VEHICLE_LABEL) as Vehicle[]).map((value) => ({ value, label: VEHICLE_LABEL[value] }))

export const DEPENDENCY_LABEL: Record<string, string> = {
  tekMusteri: 'Tek müşteri',
  tekTedarikci: 'Tek tedarikçi',
  tekKanal: 'Tek kanal',
  tekTeknoloji: 'Tek teknoloji',
  tekPara: 'Tek para kaynağı',
  tekKisi: 'Tek kişi',
}
export const DEPENDENCY_OPTIONS = Object.entries(DEPENDENCY_LABEL).map(([value, label]) => ({ value, label }))

export interface Dependencies {
  labels: string[]
  note: string | null
}

/** Adım 17'de işaretlenen bağımlılıklar. Hiçbiri işaretlenmediyse null döner. */
export function dependenciesOf(plan: PlanDoc): Dependencies | null {
  const labels = ids(v(plan, '17', 'dependencies')).map((d) => DEPENDENCY_LABEL[d]).filter(Boolean)
  return labels.length ? { labels, note: text(v(plan, '17', 'dependencyNote')) } : null
}

export interface FailedAttempt {
  who: string
  what: string | null
  why: string | null
  difference: string | null
}

/** Adım 09'da yazılan başarısız örnekler. Başarı hikâyelerinin yanıltmasına karşı durur. */
export function failedAttemptsOf(plan: PlanDoc): FailedAttempt[] {
  return list(v(plan, '09', 'failedAttempts'))
    .filter((r) => text(r.who))
    .map((r) => ({ who: text(r.who)!, what: text(r.what), why: text(r.why), difference: text(r.difference) }))
}

/** Bir yola bağlı kanıtların başlıkları. Silinmiş kanıt sayılır. */
export function linkedEvidence(plan: PlanDoc, value: unknown): { titles: string[]; missing: number } {
  const r = linked(plan, value)
  return { titles: r.titles, missing: r.missing }
}

/* ---- Ayrı görüş ---- */

export type DissentResponse = 'kabul' | 'suruyor' | 'bekliyor'
export const DISSENT_LABEL: Record<DissentResponse, string> = { kabul: 'Kabul edildi', suruyor: 'Ayrı görüş sürüyor', bekliyor: 'İnceleme bekliyor' }
export const DISSENT_OPTIONS = (Object.keys(DISSENT_LABEL) as DissentResponse[]).map((value) => ({ value, label: DISSENT_LABEL[value] }))

export interface Dissent {
  who: string | null
  about: string | null
  view: string
  response: DissentResponse
}

/** Adım 17'de kaydedilen ayrı görüşler. Cevabı seçilmemiş görüş "İnceleme bekliyor" sayılır. */
export function dissentsOf(plan: PlanDoc): Dissent[] {
  return list(v(plan, '17', 'dissents'))
    .filter((r) => text(r.view))
    .map((r) => ({ who: text(r.who), about: text(r.about), view: text(r.view)!, response: r.response === 'kabul' || r.response === 'suruyor' ? r.response : 'bekliyor' }))
}

/* ---- Belirsizlik seviyesi ---- */

export type UncertaintyLevel = 'acik' | 'secenek' | 'aralik' | 'belirsiz'
export const UNCERTAINTY_LABEL: Record<UncertaintyLevel, string> = {
  acik: 'Tek bir sonuç bekliyorum',
  secenek: 'İki ya da üç sonuçtan biri olacak',
  aralik: 'Sonuç bir aralıkta kalacak',
  belirsiz: 'Ne olacağını kestiremiyorum',
}
export const UNCERTAINTY_OPTIONS = (Object.keys(UNCERTAINTY_LABEL) as UncertaintyLevel[]).map((value) => ({ value, label: UNCERTAINTY_LABEL[value] }))

export interface Uncertainty {
  text: string
  /** Kullanıcı seçmediyse null kalır. Yazılım seviye uydurmaz. */
  level: string | null
}

export function uncertaintiesOf(plan: PlanDoc): Uncertainty[] {
  return (['uncertainty1', 'uncertainty2'] as const)
    .map((key) => {
      const level = v(plan, '04', `${key}Level`)
      return { text: text(v(plan, '04', key)), level: typeof level === 'string' && level in UNCERTAINTY_LABEL ? UNCERTAINTY_LABEL[level as UncertaintyLevel] : null }
    })
    .filter((u): u is Uncertainty => u.text !== null)
}

/* ---- İşi etkileyen kişiler ---- */

export type StakeholderEffect = 'engel' | 'kolaylik' | 'ikisi'
export const STAKEHOLDER_LABEL: Record<StakeholderEffect, string> = { engel: 'Engelleyebilir', kolaylik: 'Kolaylaştırabilir', ikisi: 'İkisini de yapabilir' }
export const STAKEHOLDER_OPTIONS = (Object.keys(STAKEHOLDER_LABEL) as StakeholderEffect[]).map((value) => ({ value, label: STAKEHOLDER_LABEL[value] }))

export interface Stakeholder {
  who: string
  effect: string | null
  how: string | null
  plan: string | null
}

export function stakeholdersOf(plan: PlanDoc): Stakeholder[] {
  return list(v(plan, '17', 'stakeholders'))
    .filter((r) => text(r.who))
    .map((r) => ({ who: text(r.who)!, effect: typeof r.effect === 'string' && r.effect in STAKEHOLDER_LABEL ? STAKEHOLDER_LABEL[r.effect as StakeholderEffect] : null, how: text(r.how), plan: text(r.plan) }))
}

/** "Bu iş tutmazsa en çok ne kaybedersiniz?" sorusunun cevabı. */
export function worstCaseOf(plan: PlanDoc): string | null {
  return text(v(plan, '17', 'worstCase'))
}
