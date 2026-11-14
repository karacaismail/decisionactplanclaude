/**
 * Devir raporunun iç kaynağı. Ekranda ayrı bir belge olarak gösterilmez.
 * Eski adı: stratejik planlama temel belgesi. Tek sayfadır ve altı soruya cevap verir.
 * Her cevap plan verisinden üretilir. Kaynak satırları kanıt defterinden gelir.
 * Eksik bilgi uydurulmaz. Cevabı olmayan soruda "Henüz yazılmadı." yazar.
 * Kural docs/stratejik-planlama-oncesi-bosluk-ve-eylem-plani.md dosyasının 8. bölümündedir.
 */
import type { Measure, PlanDoc, TransitionOutcome } from '@/data/types'
import { TRANSITION_LABEL } from '@/data/types'
import { remainingBudgetKurus } from '@/engine/gate'
import { LEVELS, effectiveTransition, lastTransition, validationLevel } from '@/engine/readiness'
import { formatDate, formatMoney, formatNumber } from '@/engine/format'
import { EXAMPLE_STAMP, joinFilled, measureLines, profileSentence, riskLine, text } from './build'

export interface FoundationSource {
  /** Kanıtın başlığı. */
  text: string
  /** Kanıtın tarihi. "12 Eylül 2026 Cumartesi günü" biçimindedir. */
  date?: string
  /** Kanıt merdiveni basamağı. 1 en güçlü, 7 en zayıf. */
  ladder?: number
}
export interface FoundationAnswer {
  question: string
  lines: string[]
  sources: FoundationSource[]
  /** Cevabın dayandığı adımlar. */
  steps: string[]
  /** Cevapta gerçek veri yoksa true. O zaman tek satır "Henüz yazılmadı." olur. */
  empty: boolean
}
export interface FoundationTransition {
  outcome: TransitionOutcome
  /** Bugün geçerli sonuç. Koşullu kararın son tarihi geçtiyse "degil" olur. */
  effective: TransitionOutcome
  label: string
  reason: string
  decidedBy: string
  date: string
  stale: boolean
  conditional?: { topic: string; openQuestion: string; owner: string; deadline: string }
  /** Markdown ve yazdırma için hazır cümleler. */
  lines: string[]
}
export interface FoundationDoc {
  title: string
  /** Örnek planda belge başına basılan uyarı. */
  stamp?: string
  /** "Etiket: değer" biçiminde üst bilgi satırları. */
  meta: string[]
  answers: FoundationAnswer[]
  transition?: FoundationTransition
  /** Belgede eksik kalan yerler. Her biri tam cümledir. */
  openItems: string[]
}

export const FOUNDATION_TITLE = 'Stratejik planlama temel belgesi'
export const NOT_WRITTEN = 'Henüz yazılmadı.'
export const FOUNDATION_QUESTIONS = [
  'Kim, hangi sorunu yaşıyor?',
  'Müşteri hangi somut adımı attı?',
  'Hangi yollar açık?',
  'Hesap hangi koşulda tutuyor?',
  'Neyi hâlâ bilmiyoruz?',
  'Kararı kim verecek?',
] as const

type Row = Record<string, unknown>
const v = (p: PlanDoc, s: string, k: string): unknown => p.steps[s]?.values?.[k]
const rows = (p: PlanDoc, s: string, k: string): Row[] => {
  const x = v(p, s, k)
  return Array.isArray(x) ? (x as Row[]) : []
}
const num = (x: unknown): number | null => (typeof x === 'number' && !Number.isNaN(x) ? x : null)
/** Sondaki noktayı atar. Cümle sonuna tek nokta konur. */
const bare = (x: unknown): string | null => text(x)?.replace(/\.+$/, '') ?? null
/** "Etiket: değer." cümlesi. Değer boşsa null döner ve satır yazılmaz. */
const line = (label: string, value: unknown): string | null => {
  const t = bare(value)
  return t ? `${label}: ${t}.` : null
}
const push = (out: string[], ...xs: (string | null | undefined)[]) => {
  for (const x of xs) if (x) out.push(x)
}

const DAY_MS = 86_400_000
/** Belge tek sayfaya yakın kalır. Uzun listelerden en önemli üç madde yazılır, kalanın sayısı söylenir. */
const TOP = 3

/** Kanıt defterinden kaynak satırları. Adımı eşleşen kanıtlar alınır. En yeni kanıt üstte durur. */
function sourcesFor(p: PlanDoc, steps: string[], also?: (e: PlanDoc['evidence'][number]) => boolean): FoundationSource[] {
  return p.evidence
    .filter((e) => e.linkedSteps.some((s) => steps.includes(s)) || Boolean(also?.(e)))
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
    .map((e) => ({ text: e.title, date: e.date ? formatDate(e.date) : undefined, ladder: e.ladder }))
}

/** Kaynak satırı: "Kaynak: Yürüyüş sayımı, 12 Eylül 2026 Cumartesi günü. Kanıt basamağı 3." */
export function sourceLine(s: FoundationSource): string {
  const head = `Kaynak: ${s.text.replace(/\.+$/, '')}${s.date ? `, ${s.date}` : ''}.`
  return s.ladder ? `${head} Kanıt basamağı ${s.ladder}.` : head
}

function answer(question: string, steps: string[], lines: string[], gaps: string[], sources: FoundationSource[]): FoundationAnswer {
  const empty = lines.length === 0
  return { question, steps, lines: empty ? [NOT_WRITTEN] : [...lines, ...gaps], sources, empty }
}

/* ------------------------------------------------------------------ */
/* Altı soru                                                            */
/* ------------------------------------------------------------------ */

function whoHasProblem(p: PlanDoc): FoundationAnswer {
  const out: string[] = []
  /* Sorun cümlesi tek satırdır: "Kim: Bakkal. Durum: Akşam kapanışta. İş: Günlük satışı görmek." Boş parça yazılmaz. */
  const core = joinFilled([line('Kim', v(p, '05', 'problemWho')), line('Durum', v(p, '05', 'problemWhen')), line('İş', v(p, '05', 'problemJob'))], ' ')
  push(out, core, line('Engel', v(p, '05', 'problemBlocker')))
  const last = text(v(p, '05', 'lastEvent'))
  if (last) out.push(`Sorun en son ${formatDate(last)} görüldü.`)
  push(out, line('Kayıp', v(p, '05', 'lossNote')))
  const interviews = rows(p, '06', 'interviews')
  if (interviews.length) out.push(`Görüşme sayısı: ${interviews.length}. Sorunu tanıyan: ${interviews.filter((x) => x.recognizes === true).length}.`)
  const measures = ['repeatMeasure', 'effortMeasure', 'lossMeasure'].map((k) => v(p, '07', k) as Measure | undefined).filter((m): m is Measure => Boolean(m))
  if (measures.length) out.push(...measureLines(measures))
  push(out, line('İlk müşteri grubu', v(p, '08', 'segmentName')), line('Ulaşma yolu', v(p, '08', 'accessPath')))
  const gaps: string[] = []
  if (!core) gaps.push('Sorun cümlesi henüz yazılmadı.')
  if (!measures.length) gaps.push('Sorunun ölçüsü henüz yazılmadı.')
  return answer(FOUNDATION_QUESTIONS[0], ['05', '06', '07', '08'], out, gaps, sourcesFor(p, ['05', '06', '07', '08']))
}

function customerStep(p: PlanDoc): FoundationAnswer {
  const out: string[] = []
  const offers = rows(p, '15', 'offers')
  if (offers.length) {
    const accepted = offers.filter((o) => o.result === 'kabul').length
    const strong = offers.filter((o) => o.result === 'kabul' && Number(o.ladder) >= 1 && Number(o.ladder) <= 3).length
    out.push(`Teklifi gören: ${offers.length} kişi. Kabul eden: ${accepted} kişi.`)
    out.push(`Güçlü taahhüt veren: ${strong} kişi. Güçlü taahhüt 1, 2 ya da 3. basamaktır.`)
  }
  const threshold = v(p, '15', 'threshold') as { value?: number | null; basis?: string; isGuess?: boolean } | undefined
  const limit = num(threshold?.value)
  if (limit !== null) {
    out.push(`Eşik: ${formatNumber(limit)} taahhüt.${threshold?.isGuess ? ' Bu eşik ilk tahmindir.' : ''}`)
    push(out, line('Eşiğin dayanağı', threshold?.basis))
  }
  const reached = num(v(p, '15', 'reached'))
  const tried = num(v(p, '15', 'tried'))
  if (reached !== null) out.push(`Ulaşılan: ${formatNumber(reached)} kişi.${tried !== null ? ` Deneyen: ${formatNumber(tried)} kişi.` : ''}`)
  const price = num(v(p, '15', 'priceOfferedKurus'))
  const priceOk = num(v(p, '15', 'priceAcceptedCount'))
  if (price !== null && price > 0) out.push(`Teklif edilen fiyat: ${formatMoney(price)}.${priceOk !== null ? ` Bu fiyatı kabul eden: ${formatNumber(priceOk)} kişi.` : ''}`)
  push(out, line('Sonuç', v(p, '15', 'resultNote')))
  const gaps: string[] = []
  if (!offers.length) gaps.push('Teklif defteri henüz yazılmadı.')
  if (limit === null) gaps.push('Eşik henüz yazılmadı.')
  return answer(FOUNDATION_QUESTIONS[1], ['15'], out, gaps, sourcesFor(p, ['14', '15']))
}

const SKILL_PLAN: Record<string, string> = { yap: 'kendimiz yaparız', satinAl: 'satın alırız', ortak: 'ortakla yaparız', yok: 'edinemiyoruz' }

function openPaths(p: PlanDoc): FoundationAnswer {
  const out: string[] = []
  push(out, line('Bugünkü çözüm', v(p, '05', 'currentSolutionNote')))
  const options = rows(p, '11', 'options').filter((o) => bare(o.name))
  options.forEach((o, i) => {
    const cost = bare(o.firstStep)
    out.push(`Seçenek ${i + 1}: ${bare(o.name)}.${cost ? ` İlk adım ve bedeli: ${cost}.` : ''}`)
  })
  push(out, line('Denenecek birinci yol', v(p, '11', 'testOption1')), line('Denenecek ikinci yol', v(p, '11', 'testOption2')))
  const rivals = rows(p, '09', 'competitors').map((r) => bare(r.name)).filter((x): x is string => Boolean(x))
  if (rivals.length) out.push(`Rakip ve ikame: ${rivals.join(', ')}.`)
  const skills = rows(p, '12', 'skills').filter((s) => bare(s.skill))
  if (skills.length) out.push(`Gereken beceri: ${skills.map((s) => `${bare(s.skill)}${SKILL_PLAN[String(s.plan)] ? ` (${SKILL_PLAN[String(s.plan)]})` : ''}`).join(', ')}.`)
  const gaps: string[] = []
  if (options.length < 2) gaps.push('En az iki seçenek henüz yazılmadı.')
  return answer(FOUNDATION_QUESTIONS[2], ['09', '11', '12'], out, gaps, sourcesFor(p, ['09', '11', '12']))
}

function moneyLogic(p: PlanDoc): FoundationAnswer {
  const out: string[] = []
  const price = num(v(p, '15', 'priceOfferedKurus'))
  if (price !== null && price > 0) out.push(`Fiyat: ${formatMoney(price)}.`)
  const mid = num(v(p, '16', 'contributionMid'))
  if (mid !== null) out.push(`Orta durumda bir siparişin katkısı: ${formatMoney(mid)}.`)
  const burn = num(p.limits.monthlyBurnKurus)
  if (burn !== null) out.push(`Aylık gider: ${formatMoney(burn)}.`)
  const breakEven = num(v(p, '16', 'breakEvenCount'))
  if (breakEven !== null) out.push(`Gereken satış: ayda ${formatNumber(breakEven)} sipariş sabit gideri karşılar.`)
  const som = num(v(p, '09', 'somCustomers'))
  const target = num(v(p, '09', 'targetCustomers'))
  if (som !== null) out.push(`Ulaşılabilir müşteri: bir yılda ${formatNumber(som)}.${target !== null ? ` Hedef: ${formatNumber(target)} müşteri.` : ''}`)
  const capacity = num(v(p, '09', 'salesCapacity'))
  if (capacity !== null) out.push(`Kapasite: bir yılda ${formatNumber(capacity)} müşteri.`)
  push(out, line('İşi batıran sayı', v(p, '16', 'fragileNumber')))
  const pays = rows(p, '16', 'paymentDays').filter((d) => num(d.balanceAfterKurus) !== null)
  const gap = pays.find((d) => Number(d.balanceAfterKurus) < 0)
  if (gap) out.push(`İlk kasa açığı: ${formatDate(text(gap.date) ?? undefined)}. Eksik: ${formatMoney(Math.abs(Number(gap.balanceAfterKurus)))}.`)
  else if (pays.length) out.push(`Kayıtlı ${pays.length} ödeme gününde kasa eksiye düşmüyor.`)
  const gaps: string[] = []
  if (mid === null) gaps.push('Bir siparişin katkısı henüz yazılmadı.')
  if (!bare(v(p, '16', 'fragileNumber'))) gaps.push('İşi batıran sayı henüz yazılmadı.')
  return answer(FOUNDATION_QUESTIONS[3], ['16', '09'], out, gaps, sourcesFor(p, ['16']))
}

function unknowns(p: PlanDoc): FoundationAnswer {
  const out: string[] = []
  const assumptions = rows(p, '10', 'assumptions').filter((a) => bare(a.assumption))
  /* Doğrulanan varsayım açık değildir. Kalanlar etkisi büyük olandan küçüğe dizilir. */
  const open = assumptions.filter((a) => String(a.status ?? '') !== 'dogrulandi').sort((a, b) => Number(b.impact ?? 0) - Number(a.impact ?? 0))
  for (const a of open.slice(0, TOP)) {
    if (String(a.status ?? '') === 'curudu') out.push(`Çürüyen varsayım: ${bare(a.assumption)}.${bare(a.resultNote) ? ` Sonuç: ${bare(a.resultNote)}.` : ''}`)
    else out.push(`Denenmeyen varsayım: ${bare(a.assumption)}.${bare(a.testMethod) ? ` Test yöntemi: ${bare(a.testMethod)}.` : ''}`)
  }
  if (open.length > TOP) out.push(`${open.length - TOP} açık varsayım daha var. Tamamı Adım 10'da yazar.`)
  for (const e of p.evidence) push(out, line('Karşı kanıt', e.counterFinding))
  const score = (r: Row): number => Number(r.likelihood ?? 0) * Number(r.impact ?? 0)
  const critical = rows(p, '17', 'risks').filter((r) => score(r) >= 6).sort((a, b) => score(b) - score(a))
  for (const r of critical.slice(0, TOP)) push(out, riskLine(r) || null)
  if (critical.length > TOP) out.push(`${critical.length - TOP} kritik risk daha var. Tamamı Adım 17'de yazar.`)
  for (const r of p.limits.stopRules ?? []) push(out, line('Durma kuralı', r.rule))
  const gaps: string[] = []
  if (!assumptions.length) gaps.push('Varsayım listesi henüz yazılmadı.')
  if (!rows(p, '17', 'risks').some((r) => bare(r.risk))) gaps.push('Risk listesi henüz yazılmadı.')
  return answer(FOUNDATION_QUESTIONS[4], ['10', '17'], out, gaps, sourcesFor(p, ['10', '17'], (e) => Boolean(bare(e.counterFinding))))
}

/** Karar sahibi: en son kapı kararını kaydeden kişi. Karar yoksa Adım 03 tablosundaki karar sahibi. */
function decisionOwner(p: PlanDoc): string | null {
  const latest = [...p.decisions].sort((a, b) => b.decidedAt.localeCompare(a.decidedAt))[0]
  if (bare(latest?.decidedBy)) return bare(latest?.decidedBy)
  const rights = rows(p, '03', 'rights').filter((r) => bare(r.owner))
  const row = rights.find((r) => String(r.gate) === '5') ?? rights[0]
  return row ? bare(row.owner) : null
}

/** Kalan süre cümlesi. Bitiş tarihi yoksa null döner. */
export function remainingTimeLine(deadline: string | undefined, now: Date): string | null {
  if (!deadline) return null
  const end = new Date(deadline.slice(0, 10) + 'T23:59:59')
  if (Number.isNaN(end.getTime())) return null
  const days = Math.ceil((end.getTime() - now.getTime()) / DAY_MS) - 1
  const date = formatDate(deadline)
  if (days < 0) return `Süre doldu. Bitiş tarihi ${date} idi.`
  if (days === 0) return `Süre bugün doluyor. Bitiş tarihi ${date}.`
  const weeks = Math.floor(days / 7)
  return `Kalan süre: ${days} gün${weeks >= 2 ? `, yaklaşık ${weeks} hafta` : ''}. Bitiş tarihi ${date}.`
}

function whoDecides(p: PlanDoc, now: Date, transition: FoundationTransition | undefined): FoundationAnswer {
  const out: string[] = []
  push(out, line('Karar sahibi', decisionOwner(p)))
  const left = remainingBudgetKurus(p)
  if (left !== null) out.push(`Kalan bütçe: ${formatMoney(left)}.`)
  push(out, remainingTimeLine(p.limits.deadline, now))
  if (transition) out.push(`Son geçiş kararı: ${transition.label}. Gerekçe: ${bare(transition.reason) ?? 'yazılmadı'}. Tarih: ${transition.date}.`)
  const gaps: string[] = transition ? [] : ['Geçiş kararı henüz kaydedilmedi.']
  return answer(FOUNDATION_QUESTIONS[5], ['02', '03'], out, gaps, sourcesFor(p, ['02', '03']))
}

function transitionOf(p: PlanDoc, now: Date): FoundationTransition | undefined {
  const t = lastTransition(p)
  if (!t) return undefined
  const effective = effectiveTransition(t, now)
  const date = formatDate(t.decidedAt)
  const conditional = t.conditional ? { ...t.conditional, deadline: formatDate(t.conditional.deadline) } : undefined
  const lines = [`Sonuç: ${TRANSITION_LABEL[t.outcome]}.`, `Gerekçe: ${bare(t.reason) ?? 'yazılmadı'}.`, `Karar sahibi: ${bare(t.decidedBy) ?? 'yazılmadı'}.`, `Tarih: ${date}.`]
  if (conditional) {
    push(lines, line('Planlanacak konu', conditional.topic), line('Açık soru', conditional.openQuestion), line('Açık sorunun sorumlusu', conditional.owner))
    lines.push(`Açık sorunun son tarihi: ${conditional.deadline}.`)
  }
  if (effective !== t.outcome) lines.push('Koşulun son tarihi geçti. Karar bugün "Henüz hazır değil" sayılır.')
  if (t.stale) lines.push('Bu karar eskidi. Karardan sonra dayanak değişti. Geçiş kapısında yeniden karar kaydedin.')
  return { outcome: t.outcome, effective, label: TRANSITION_LABEL[t.outcome], reason: t.reason, decidedBy: t.decidedBy, date, stale: Boolean(t.stale), conditional, lines }
}

/** Temel belgesini plan verisinden üretir. `now` kalan süre hesabı içindir. */
export function buildFoundationDoc(plan: PlanDoc, now: Date = new Date()): FoundationDoc {
  const transition = transitionOf(plan, now)
  const answers = [whoHasProblem(plan), customerStep(plan), openPaths(plan), moneyLogic(plan), unknowns(plan), whoDecides(plan, now, transition)]
  const level = validationLevel(plan)
  const openItems: string[] = []
  for (const a of answers) {
    const stepList = a.steps.map((s) => `Adım ${s}`).join(', ')
    if (a.empty) openItems.push(`"${a.question}" sorusunun cevabı henüz yazılmadı. Dayanak: ${stepList}.`)
    else for (const l of a.lines) if (/ henüz (yazılmadı|kaydedilmedi)\.$/.test(l)) openItems.push(l)
  }
  if (!transition && !openItems.includes('Geçiş kararı henüz kaydedilmedi.')) openItems.push('Geçiş kararı henüz kaydedilmedi.')
  if (transition?.stale) openItems.push('Geçiş kararı eskidi. Geçiş kapısında yeniden karar kaydedin.')
  if (transition?.conditional) openItems.push(`Açık soru: ${bare(transition.conditional.openQuestion) ?? 'yazılmadı'}. Son tarih: ${transition.conditional.deadline}.`)
  return {
    title: FOUNDATION_TITLE,
    stamp: plan.example ? EXAMPLE_STAMP : undefined,
    meta: [
      `Plan: ${plan.name}`,
      `Profil: ${profileSentence(plan)}`,
      `Sürüm: ${plan.revision}`,
      `Doğrulama seviyesi: ${level} / 5, ${LEVELS[level].title}`,
      `Oluşturma: ${formatDate(now.toISOString())}`,
    ],
    answers,
    transition,
    openItems,
  }
}

export function foundationToMarkdown(doc: FoundationDoc): string {
  const out: string[] = [`# ${doc.title}`, '']
  if (doc.stamp) out.push(`**${doc.stamp}**`, '')
  out.push(...doc.meta.map((m) => `- ${m}`), '')
  for (const a of doc.answers) {
    out.push(`## ${a.question}`, '')
    out.push(...a.lines.map((l) => `- ${l}`), ...a.sources.map((s) => `- ${sourceLine(s)}`), '')
  }
  out.push('## Geçiş kararı', '')
  if (doc.transition) out.push(...doc.transition.lines.map((l) => `- ${l}`), '')
  else out.push('Geçiş kararı henüz kaydedilmedi.', '')
  if (doc.openItems.length) out.push('## Açık kalanlar', '', ...doc.openItems.map((l) => `- ${l}`), '')
  return out.join('\n')
}
