/**
 * Strateji oluşturma ve strateji uygulama adımlarının okuyucuları ve denetimleri.
 * Yazılım yol seçmez ve teşhis koymaz. Yalnız yazılanı okur, sayar ve eksik olanı söyler.
 * Aşama haritası docs/sonraki-ana-asamalar-plani.md dosyasındadır.
 */
import type { CalcResult } from '@/data/schema'
import type { PlanDoc } from '@/data/types'
import { formatMoney } from './format'
import { freeBudget } from './crux'
import { norm } from './integrity'

type Row = Record<string, unknown>

export const DIAGNOSIS_STEP = 'S21'
export const OPTIONS_STEP = 'S22'
export const TESTS_STEP = 'S23'
export const CHOICE_STEP = '19'
export const MOVES_STEP = 'S25'
export const DOSSIER_STEP = '20'
export const GOALS_STEP = 'U31'
export const TASKS_STEP = 'U32'
export const RESOURCES_STEP = 'U33'
/**
 * Uygulama planı adımları: 3.1, 3.2 ve 3.3. Hiçbir kapı bu adımları okumaz.
 * Bu yüzden bu adımlar değişince hiçbir kapı kararı eskimez. Kullanıcı kararı, 15 Kasım 2026.
 */
export const PLAN_STEPS = [GOALS_STEP, TASKS_STEP, RESOURCES_STEP]
/** Strateji belgesinde dolu olması gereken alanlar. Adımın tamamlanması ve çıkış kapısı aynı listeyi okur. */
export const DOSSIER_KEYS = ['dossier1', 'dossier2', 'dossier3', 'dossier4', 'dossier5', 'dossier6', 'dossier7', 'dossier8', 'dossier9', 'dossier11', 'counterView']
export const QUALITY_MIN = 5

const text = (x: unknown): string | null => (typeof x === 'string' && x.trim() ? x.trim() : null)
const list = (x: unknown): Row[] => (Array.isArray(x) ? (x as Row[]) : [])
const values = (plan: PlanDoc, step: string): Row => plan.steps[step]?.values ?? {}
const amount = (x: unknown): number => (typeof x === 'number' && Number.isFinite(x) ? x : 0)

/* ---- 2.1 Teşhis ---- */

export interface Diagnosis {
  text: string
  why: string | null
  setAside: string | null
}

export function diagnosisOf(plan: PlanDoc): Diagnosis | null {
  const v = values(plan, DIAGNOSIS_STEP)
  const t = text(v.diagnosis)
  return t ? { text: t, why: text(v.diagnosisWhy), setAside: text(v.setAside) } : null
}

/* ---- 2.2 Seçenekler ---- */

export type OptionSource = 'hazirlik' | 'yeni'
export const OPTION_SOURCE_LABEL: Record<OptionSource, string> = { hazirlik: 'Hazırlıktaki yol adayı', yeni: 'Strateji oluştururken eklendi' }
export const OPTION_SOURCE_OPTIONS = (Object.keys(OPTION_SOURCE_LABEL) as OptionSource[]).map((value) => ({ value, label: OPTION_SOURCE_LABEL[value] }))

export interface StrategyOption {
  name: string
  what: string | null
  source: OptionSource | null
  difference: string | null
}

/** Adı yazılmış seçenekler. Aynı ad bir kez sayılır. */
export function optionsOf(plan: PlanDoc, v: Row = values(plan, OPTIONS_STEP)): StrategyOption[] {
  const seen = new Set<string>()
  const out: StrategyOption[] = []
  for (const r of list(v.options)) {
    const name = text(r.name)
    if (!name || seen.has(norm(name))) continue
    seen.add(norm(name))
    out.push({ name, what: text(r.what), source: r.source === 'hazirlik' || r.source === 'yeni' ? r.source : null, difference: text(r.difference) })
  }
  return out
}

/** Seçenek adımı tamamlanırken aranan koşullar. Tek seçenek seçim değildir. */
export function optionIssues(v: Row): string[] {
  const named = list(v.options).map((r) => text(r.name)).filter((x): x is string => x !== null)
  const distinct = new Set(named.map(norm))
  const issues: string[] = []
  if (distinct.size < 2) issues.push('En az iki farklı yol yazın. Tek seçenek bir seçim değildir.')
  if (distinct.size < named.length) issues.push('Aynı adı taşıyan iki yol var. Yollara ayrı ad verin.')
  return issues
}

/* ---- 2.3 Sınama ---- */

export type TestResult = 'destek' | 'karsi' | 'sinanmadi'
export const TEST_RESULT_LABEL: Record<TestResult, string> = { destek: 'Koşul tuttu', karsi: 'Koşul tutmadı', sinanmadi: 'Henüz sınanmadı' }
export const TEST_RESULT_OPTIONS = (Object.keys(TEST_RESULT_LABEL) as TestResult[]).map((value) => ({ value, label: TEST_RESULT_LABEL[value] }))

export interface OptionTest {
  option: string
  mustBeTrue: string | null
  weakest: string | null
  how: string | null
  result: TestResult
}

export function testsOf(plan: PlanDoc, v: Row = values(plan, TESTS_STEP)): OptionTest[] {
  return list(v.tests)
    .filter((r) => text(r.option))
    .map((r) => ({
      option: text(r.option)!,
      mustBeTrue: text(r.mustBeTrue),
      weakest: text(r.weakest),
      how: text(r.how),
      result: r.result === 'destek' || r.result === 'karsi' ? r.result : 'sinanmadi',
    }))
}

/** Sınaması eksik seçenekler. Her seçenek için koşul ve en zayıf koşul yazılmalıdır. */
export function untestedOptions(plan: PlanDoc, v: Row = values(plan, TESTS_STEP)): string[] {
  const done = new Set(testsOf(plan, v).filter((t) => t.mustBeTrue && t.weakest).map((t) => norm(t.option)))
  return optionsOf(plan).map((o) => o.name).filter((name) => !done.has(norm(name)))
}

export function testIssues(v: Row, plan: PlanDoc): string[] {
  const issues: string[] = []
  const full = testsOf(plan, v).filter((t) => t.mustBeTrue && t.weakest)
  if (full.length < 2) issues.push('En az iki yolu sınayın. Her yol için koşulu ve en zayıf koşulu yazın.')
  const missing = untestedOptions(plan, v)
  if (missing.length) issues.push(`Şu yolun sınaması eksik: ${missing[0]}.`)
  return issues
}

/** Sınama özeti. Kaç yol sınandı, kaçının koşulu tutmadı? */
export function testsCalc(v: Row, plan: PlanDoc): CalcResult | null {
  const tests = testsOf(plan, v)
  if (!tests.length) return null
  const failed = tests.filter((t) => t.result === 'karsi')
  const open = tests.filter((t) => t.result === 'sinanmadi')
  const missing = untestedOptions(plan, v)
  const lines = [`${tests.length} yol için sınama yazıldı.`]
  if (failed.length) lines.push(`Koşulu tutmayan yol: ${failed.map((t) => t.option).join(', ')}.`)
  if (open.length) lines.push(`Henüz sınanmayan yol: ${open.map((t) => t.option).join(', ')}.`)
  if (missing.length) lines.push(`Sınaması hiç yazılmayan yol: ${missing.join(', ')}.`)
  return {
    value: `${tests.length - open.length} / ${tests.length} yol sınandı`,
    lines,
    warn: failed.length ? 'Koşulu tutmayan yolu seçmeden önce gerekçenizi yazın. Yazılım yol elemez.' : undefined,
  }
}

/* ---- 2.4 Seçim ---- */

export interface Choice {
  path: string
  reason: string | null
  givenUp: string | null
  aim: string | null
  field: string | null
}

export function choiceOf(plan: PlanDoc): Choice | null {
  const v = values(plan, CHOICE_STEP)
  const path = text(v.chosenPath)
  return path ? { path, reason: text(v.choiceReason), givenUp: text(v.givenUp), aim: text(v.winningAim), field: text(v.playField) } : null
}

/* ---- 2.5 Ana hamleler ve gerekli yetkinlikler ---- */

export type CapabilityState = 'var' | 'kurulacak' | 'disaridan'
export const CAPABILITY_LABEL: Record<CapabilityState, string> = { var: 'Bugün var', kurulacak: 'Kurulacak', disaridan: 'Dışarıdan alınacak' }
export const CAPABILITY_OPTIONS = (Object.keys(CAPABILITY_LABEL) as CapabilityState[]).map((value) => ({ value, label: CAPABILITY_LABEL[value] }))

export interface Move {
  move: string
  serves: string | null
  capability: string | null
  have: CapabilityState | null
}

export function movesOf(plan: PlanDoc, v: Row = values(plan, MOVES_STEP)): Move[] {
  return list(v.moves)
    .filter((r) => text(r.move))
    .map((r) => ({ move: text(r.move)!, serves: text(r.serves), capability: text(r.capability), have: r.have === 'var' || r.have === 'kurulacak' || r.have === 'disaridan' ? r.have : null }))
}

export function moveIssues(v: Row): string[] {
  const moves = list(v.moves).filter((r) => text(r.move))
  if (!moves.length) return ['En az bir ana hamle yazın.']
  const bare = moves.find((r) => !text(r.capability))
  return bare ? [`"${text(bare.move)}" hamlesi için gereken yetkinliği yazın.`] : []
}

/* ---- 3.1 Hedef ve gösterge ---- */

export interface Goal {
  objective: string | null
  indicators: { name: string; baseline: string | null; target: string | null }[]
}

export function goalOf(plan: PlanDoc, v: Row = values(plan, GOALS_STEP)): Goal {
  return {
    objective: text(v.objective),
    indicators: list(v.keyResults)
      .filter((r) => text(r.kr))
      .map((r) => ({ name: text(r.kr)!, baseline: text(r.baseline), target: text(r.target) })),
  }
}

export function goalIssues(v: Row): string[] {
  const rows = list(v.keyResults).filter((r) => text(r.kr))
  const bare = rows.find((r) => !text(r.target))
  return bare ? [`"${text(bare.kr)}" göstergesi için hedef sayıyı yazın.`] : []
}

/** Strateji belgesi tam mı? Başlıklar dolu, kalite kontrolü işaretli ve karar sahibi onaylamış olmalı. */
export function dossierComplete(v: Row): boolean {
  const quality = Array.isArray(v.qualityCheck) ? v.qualityCheck.length : 0
  return DOSSIER_KEYS.every((k) => text(v[k]) !== null) && quality >= QUALITY_MIN && text(v.approvedBy) !== null
}

/* ---- 3.2 Ana işler ve sorumlular ---- */

export interface TaskRow {
  action: string
  owner: string | null
  dueDate: string | null
}

export function tasksOf(plan: PlanDoc, key: 'now' | 'next' | 'later' = 'now', v: Row = values(plan, TASKS_STEP)): TaskRow[] {
  return list(v[key])
    .filter((r) => text(r.action))
    .map((r) => ({ action: text(r.action)!, owner: text(r.owner), dueDate: text(r.dueDate) }))
}

/** İlk 90 günün her işi tek bir sorumlu ve bir tarih ister. */
export function taskIssues(v: Row, plan: PlanDoc): string[] {
  const bare = tasksOf(plan, 'now', v).find((t) => !t.owner || !t.dueDate)
  return bare ? [`"${bare.action}" işi için sorumlu ve bitiş tarihi yazın.`] : []
}

/* ---- 3.3 Kaynak ve bütçe ---- */

export interface Resource {
  item: string
  budgetKurus: number | null
  people: string | null
}

export function resourcesOf(plan: PlanDoc, v: Row = values(plan, RESOURCES_STEP)): Resource[] {
  return list(v.resources)
    .filter((r) => text(r.item))
    .map((r) => ({ item: text(r.item)!, budgetKurus: typeof r.budgetKurus === 'number' ? r.budgetKurus : null, people: text(r.people) }))
}

/** Bağlanan toplam para, harcama sınırı ve serbest bütçeyle karşılaştırılır. Bilinmeyen tutar uydurulmaz. */
export function resourceCalc(v: Row, plan: PlanDoc): CalcResult | null {
  const rows = resourcesOf(plan, v)
  if (!rows.length) return null
  const total = rows.reduce((sum, r) => sum + amount(r.budgetKurus), 0)
  const unknown = rows.filter((r) => r.budgetKurus === null).length
  const lines = [`${rows.length} iş için kaynak yazıldı. Bağlanan toplam para ${formatMoney(total)}.`]
  if (unknown) lines.push(`${unknown} işin bütçesi yazılmadı. Toplam bu işleri saymaz.`)
  const free = freeBudget(plan)
  let warn: string | undefined
  if (free.state === 'hesap') {
    lines.push(`Serbest bütçe ${formatMoney(free.freeKurus)}. Bu sayı Adım 16'dan gelir.`)
    if (total > free.freeKurus) warn = `Bağlanan para serbest bütçeyi ${formatMoney(total - free.freeKurus)} aşıyor.`
  } else if (plan.limits.budgetKurus) {
    lines.push(`Harcama sınırı ${formatMoney(plan.limits.budgetKurus)}. Serbest bütçe hesaplanamadı.`)
    if (total > plan.limits.budgetKurus) warn = `Bağlanan para harcama sınırını ${formatMoney(total - plan.limits.budgetKurus)} aşıyor.`
  } else lines.push('Harcama sınırı yazılmadı. Karşılaştırma yapılamadı.')
  return { value: formatMoney(total), lines, warn }
}

export function resourceIssues(v: Row, plan: PlanDoc): string[] {
  const rows = resourcesOf(plan, v)
  if (!rows.length) return ['En az bir iş için kaynak yazın.']
  const bare = rows.find((r) => r.budgetKurus === null && !r.people)
  return bare ? [`"${bare.item}" için para ya da kişi yazın.`] : []
}
