/**
 * Strateje devir raporu.
 * Stratej, stratejiyi geliştiren kişinin unvanıdır. Bu rapor onun önüne konur.
 * Rapor seçim yapmaz. Stratej yolu önerir, karar sahibi seçer. Rapor soruyu, dayanağı, sınırı, yolları ve eksik bilgiyi gösterir.
 * Eksik bilgi uydurulmaz. Kural docs/strateje-devir-uygulama-plani.md dosyasındadır.
 */
import { DECISIONS } from '@/data/decisions'
import { pathIssues } from '@/engine/integrity'
import { CONDITION_LABEL, cruxOf, dependenciesOf, DISSENT_LABEL, dissentsOf, type Dissent, failedAttemptsOf, freeBudget, linkedEvidence, matchRate, pathLinksOf, RELATION_LABEL, successConditionsOf, VEHICLE_LABEL, type Crux, type PathLink, type SuccessCondition, type Vehicle } from '@/engine/crux'
import { crossAnswers, ORIGIN_LABEL, type CrossAnswer, type Origin } from '@/engine/situation'
import { STRENGTHS_STEP, STRENGTH_LABEL, STRENGTH_NOTE, strengthsOf } from '@/engine/strengths'
import { TRANSITION_LABEL, type Evidence, type PlanDoc, type TransitionOutcome } from '@/data/types'
import { effectiveOutcome, gatePassed, lastDecision } from '@/engine/gate'
import { effectiveTransition, lastTransition, validationLevel, LEVELS } from '@/engine/readiness'
import { formatDate, formatMoney } from '@/engine/format'
import { OUTCOME_LABEL } from '@/data/types'
import { buildFoundationDoc, type FoundationAnswer } from './foundation'

/** Her cümlenin ne olduğu: kaynağı olan gözlem, hesap, verilmiş karar ya da varsayım. */
export type ClaimStatus = 'kaynakli' | 'hesap' | 'karar' | 'varsayim'
export const STATUS_LABEL: Record<ClaimStatus, string> = { kaynakli: 'Kaynaklı', hesap: 'Hesap', karar: 'Karar', varsayim: 'Varsayım' }
export type Confidence = 'yuksek' | 'orta' | 'dusuk' | 'kanitsiz'
export const CONFIDENCE_LABEL: Record<Confidence, string> = { yuksek: 'Güven yüksek', orta: 'Güven orta', dusuk: 'Güven düşük', kanitsiz: 'Kanıtsız' }

export interface Claim {
  text: string
  status: ClaimStatus
  confidence: Confidence
  source?: string
  date?: string
  /** Aynı konuda ters yöndeki bulgu. */
  counter?: string
  step: string
}
export interface ClaimGroup {
  title: string
  /** Bu bilgiyle hangi karar verilir? */
  decision: string
  claims: Claim[]
}
export type Door = 'ciftYonlu' | 'tekYonlu'
export const DOOR_LABEL: Record<Door, string> = { ciftYonlu: 'Geri alınır', tekYonlu: 'Geri alınmaz' }
export interface PathColumn {
  id: string
  name: string
  baseline: boolean
  where: string | null
  how: string | null
  /** Para nasıl kazanılır? */
  revenue: string | null
  /** Kendimiz mi kurarız, satın mı alırız, ortakla mı kurarız? */
  vehicle: string | null
  giveUp: string | null
  evidence: string | null
  /** Kanıt defterinden bağlanan kanıtların başlıkları. Boşsa yol "Varsayım" sayılır. */
  sources: string[]
  sourced: boolean
  /** Bağlıyken silinmiş kanıt sayısı. */
  missingEvidence: number
  /** Yol hangi çapraz sorudan çıktı? Kullanıcı seçer. */
  origin: string | null
  cost: string | null
  reversible: Door | null
  score: number | null
}
export interface SensitivityRow {
  label: string
  contribution: string
  breakEven: string
  note: string
}
export interface OpenDecision {
  question: string
  alternatives: string | null
  basis: string | null
  owner: string | null
  dueDate: string | null
  reversalCost: string | null
  door: Door | null
}
export interface OpenAssumption {
  text: string
  impact: number
  state: 'denenmedi' | 'curudu'
  test: string | null
  /** Varsayım yanlış çıkarsa hangi yol değişir? */
  affects: string | null
}
export type CoverageStatus = 'dolu' | 'kismen' | 'bos'
export interface CoverageItem {
  no: number
  title: string
  status: CoverageStatus
  step: string
}
export interface HandoffTransition {
  label: string
  effective: TransitionOutcome
  reason: string
  decidedBy: string
  date: string
  stale: boolean
}
export interface HandoffReport {
  title: string
  stamp?: string
  meta: string[]
  /** 1. Bugün hangi karar verilecek? */
  question: string
  /** Asıl engel: önce çözülmesi gereken güçlük. Kullanıcı yazmadıysa yoktur. */
  crux: Crux | null
  /** Başarının bağlı olduğu koşullar ve durumları. */
  conditions: SuccessCondition[]
  /** Koşullu geçişte planlanacak konu. */
  scope?: string
  transition?: HandoffTransition
  /** Verilmiş ve yeniden açılmayacak kararlar. */
  locked: { text: string; source: string }[]
  /** 2. Dayanaklar */
  groups: ClaimGroup[]
  /** 3. Bağlayıcı sınırlar */
  limits: { label: string; value: string }[]
  stopRules: string[]
  redLines: string | null
  /** 4. Karşılaştırılacak yollar */
  paths: PathColumn[]
  /** Kullanıcının cevapladığı çapraz sorular. Yolların nereden çıktığını gösterir. */
  crosses: CrossAnswer[]
  /** Bir yolun iki işi arasındaki bağlar. Çelişkiler burada görünür. */
  links: PathLink[]
  /** Aynı adı taşıyan ya da aynı görünen yollar. */
  pathIssues: string[]
  /** Ayrı görüşler. Stratej bunları da okur. */
  dissents: Dissent[]
  counterMove: string | null
  sensitivity: SensitivityRow[]
  /** 5. Seçimi değiştirebilecek eksik bilgi */
  assumptions: OpenAssumption[]
  fragile: string | null
  uncertainties: string[]
  scenarios: { name: string; signal: string | null; winCondition: string | null }[]
  openDecisions: OpenDecision[]
  /** Ek 1: 14 başlık kapsamı */
  coverage: CoverageItem[]
  coverageFilled: number
  /** Ek 2: stratej'in ilk günü */
  firstDay: string[]
  /** Ek 3: altı soru. Cevap plandan bulunur. Yoksa null kalır. */
  sixQuestions: SixQuestion[]
}

export interface SixQuestion {
  question: string
  answer: string | null
  /** Cevabın yazıldığı adım. */
  step: string
}

export const HANDOFF_TITLE = 'Strateje devir raporu'
export const NO_PATHS = 'Yol adayı henüz yazılmadı.'
export const FIRST_DAY = [
  'Raporu sorgulayın. Hangi cümle kaynaklı, hangisi hesap, hangisi varsayım?',
  'Yolları yan yana karşılaştırın. Her yol neyle kazanır, neyden vazgeçer?',
  'Bir yol önerin ya da yeni bir yol yazın. Gerekçeyi ve vazgeçilenleri yazın.',
  'Öneriyi karar sahibine sunun. Karar sahibi seçince seçimi 90 günlük yola çevirin.',
]

type Row = Record<string, unknown>
const v = (p: PlanDoc, s: string, k: string): unknown => p.steps[s]?.values?.[k]
const rows = (p: PlanDoc, s: string, k: string): Row[] => (Array.isArray(v(p, s, k)) ? (v(p, s, k) as Row[]) : [])
const str = (x: unknown): string | null => (typeof x === 'string' && x.trim() ? x.trim() : null)
const num = (x: unknown): number | null => (typeof x === 'number' && Number.isFinite(x) ? x : null)
const fmt = (n: number): string => n.toLocaleString('tr-TR')
const door = (x: unknown): Door | null => (x === 'ciftYonlu' || x === 'tekYonlu' ? x : null)
const crit = (p: PlanDoc, gate: number, id: string): boolean | null => DECISIONS.find((d) => d.n === gate)?.gate.criteria.find((c) => c.id === id)?.check(p) ?? null

/** Kanıt basamağından güven seviyesi. 1-3 yüksek, 4-5 orta, 6-7 düşük. */
export function confidenceOf(ladder: number | null): Confidence {
  if (ladder === null) return 'kanitsiz'
  if (ladder <= 3) return 'yuksek'
  if (ladder <= 5) return 'orta'
  return 'dusuk'
}

function evidenceFor(p: PlanDoc, steps: string[]): Evidence[] {
  return p.evidence.filter((e) => e.linkedSteps.some((s) => steps.includes(s))).sort((a, b) => a.ladder - b.ladder)
}

/** Temel belgesindeki bir cevabı cümlelere çevirir. Kanıt bağlıysa "kaynaklı", değilse verilen duruma düşer. */
function claimsFrom(p: PlanDoc, a: FoundationAnswer, fallback: ClaimStatus): Claim[] {
  if (a.empty) return []
  const ev = evidenceFor(p, a.steps)
  const best = ev[0]
  const counter = ev.find((e) => str(e.counterFinding))
  return a.lines.map((text, i) => {
    const linked = fallback !== 'hesap' && fallback !== 'karar' && best
    return {
      text,
      status: linked ? 'kaynakli' : fallback === 'kaynakli' ? 'varsayim' : fallback,
      confidence: fallback === 'karar' ? 'yuksek' : confidenceOf(best ? best.ladder : null),
      source: best ? best.title : undefined,
      date: best?.date ? formatDate(best.date) : undefined,
      counter: i === 0 && counter ? (str(counter.counterFinding) ?? undefined) : undefined,
      step: a.steps[0] ?? '05',
    }
  })
}

function pathColumns(p: PlanDoc): PathColumn[] {
  const sm = (v(p, '18', 'pathScores') ?? {}) as { weights?: Record<string, number>; scores?: Record<string, Record<string, number>> }
  return rows(p, '18', 'paths')
    .filter((r) => str(r.name))
    .map((r, i) => {
      const s = sm.scores?.[String(r._id)] ?? {}
      const total = Object.entries(s).reduce((acc, [k, n]) => acc + Number(n) * (sm.weights?.[k] ?? 1), 0)
      const ev = linkedEvidence(p, r.evidenceIds)
      return {
        id: String(r._id ?? i),
        name: str(r.name)!,
        baseline: i === 0,
        where: str(r.where),
        how: str(r.how),
        revenue: str(r.revenue),
        vehicle: typeof r.vehicle === 'string' && r.vehicle in VEHICLE_LABEL ? VEHICLE_LABEL[r.vehicle as Vehicle] : null,
        giveUp: str(r.giveUp),
        evidence: str(r.evidence),
        sources: ev.titles,
        sourced: ev.titles.length > 0,
        missingEvidence: ev.missing,
        origin: typeof r.origin === 'string' && r.origin in ORIGIN_LABEL ? ORIGIN_LABEL[r.origin as Origin] : null,
        cost: str(r.cost),
        reversible: door(r.reversible),
        score: total > 0 ? total : null,
      }
    })
}

/** Yolun dayanağı: kanıt bağlıysa "Kaynaklı", bağlı değilse "Varsayım". */
export function pathBasis(p: PathColumn): string {
  const missing = p.missingEvidence > 0 ? ` ${p.missingEvidence} bağlı kanıt silinmiş.` : ''
  return p.sourced ? `Kaynaklı. ${p.sources.join('. ')}.${missing}` : `Varsayım. Kanıt bağlanmadı.${missing}`
}

/** Katkı kötü, orta ve iyi durumdayken aylık gideri kaç sipariş karşılar? */
function sensitivityRows(p: PlanDoc): SensitivityRow[] {
  const fixed = num(p.limits.monthlyBurnKurus)
  const cases: [string, unknown][] = [['Kötü durum', v(p, '16', 'contributionLow')], ['Orta durum', v(p, '16', 'contributionMid')], ['İyi durum', v(p, '16', 'contributionHigh')]]
  return cases
    .filter(([, c]) => num(c) !== null)
    .map(([label, c]) => {
      const contribution = num(c)!
      if (fixed === null) return { label, contribution: formatMoney(contribution), breakEven: 'Hesaplanamaz', note: 'Aylık gider yazılmadı.' }
      if (contribution <= 0) return { label, contribution: formatMoney(contribution), breakEven: 'Hesaplanamaz', note: 'Katkı artı değil. Gider hiç karşılanmaz.' }
      const count = Math.ceil(fixed / contribution)
      return { label, contribution: formatMoney(contribution), breakEven: `${fmt(count)} sipariş`, note: `Günde yaklaşık ${fmt(Math.ceil(count / 30))} sipariş gerekir.` }
    })
}

function decisionQuestion(paths: PathColumn[], open: OpenDecision[]): string {
  if (open[0]?.question) return open[0].question
  const real = paths.filter((x) => !x.baseline).map((x) => x.name)
  if (real.length === 0) return NO_PATHS
  if (real.length === 1) return `"${real[0]}" yolu mu, bugünkü durum mu?`
  if (real.length === 2) return `"${real[0]}" mı, "${real[1]}" mı?`
  return `Şu yollardan hangisi: ${real.map((n) => `"${n}"`).join(', ')}?`
}

/** Küçük ve geri alınabilir işte iki yol, ağır yatırımda üç yol gerekir. Kapı 5 ile aynı kural. */
const plan7Title = (p: PlanDoc): string => (p.profile.smallReversible ? 'Bugünkü durum ve en az iki yol adayı' : 'Bugünkü durum ve en az üç yol adayı')
const grade = (parts: boolean[]): CoverageStatus => (parts.every(Boolean) ? 'dolu' : parts.some(Boolean) ? 'kismen' : 'bos')

function coverageOf(p: PlanDoc, paths: PathColumn[], open: OpenDecision[], sens: SensitivityRow[]): CoverageItem[] {
  const real = paths.filter((x) => !x.baseline)
  const assumptions = rows(p, '10', 'assumptions').filter((a) => str(a.assumption))
  const skills = rows(p, '12', 'skills').filter((s) => str(s.skill))
  const stop = p.limits.stopRules?.length ?? 0
  const item = (no: number, title: string, step: string, parts: boolean[]): CoverageItem => ({ no, title, step, status: grade(parts) })
  return [
    item(1, 'Niyet, kapsam ve kırmızı çizgiler', '01', [rows(p, '01', 'whys').length > 0, Boolean(str(v(p, '01', 'redLines')))]),
    item(2, 'Kanıt özeti ve güven seviyeleri', '15', [p.evidence.length >= 3, p.evidence.some((e) => e.ladder <= 3)]),
    item(3, 'Problem, müşteri grubu ve talep kanıtı', '07', [crit(p, 2, 'tanima') === true, crit(p, 2, 'segment') === true, crit(p, 4, 'esik') === true]),
    item(4, 'Pazar, rakip, kanal ve kâr havuzu', '09', [num(v(p, '09', 'somCustomers')) !== null, rows(p, '09', 'competitors').length >= 2, Boolean(str(v(p, '08', 'accessPath'))), Boolean(str(v(p, '09', 'profitPool')))]),
    item(5, 'Kritik belirsizlikler ve senaryolar', '04', [Boolean(str(v(p, '04', 'uncertainty1'))), Boolean(str(v(p, '04', 'uncertainty2'))), rows(p, '04', 'scenarios').length >= 4]),
    item(6, 'Varsayım haritası ve test sonuçları', '10', [assumptions.length >= 3, assumptions.some((a) => a.status === 'dogrulandi' || a.status === 'curudu')]),
    item(7, plan7Title(p), '18', [real.length >= 1, real.length >= (p.profile.smallReversible ? 2 : 3)]),
    item(8, 'Her yol için: nerede oynanır, neyle kazanılır', '18', [real.length > 0 && real.some((x) => x.where && x.how), real.length > 0 && real.every((x) => x.where && x.how)]),
    item(9, 'Yetenek boşlukları ve edinme yolu', '12', [skills.length > 0, skills.length > 0 && skills.every((s) => str(s.plan))]),
    item(10, 'Para aralıkları ve kaynak sınırı', '16', [sens.length >= 1, sens.length === 3, Boolean(p.limits.budgetKurus && p.limits.deadline)]),
    item(11, 'Risk, ön ölüm analizi, rakip tepkisi ve erken uyarı', '17', [rows(p, '17', 'risks').length > 0, rows(p, '17', 'premortem').length > 0, Boolean(str(v(p, '18', 'counterMove')))]),
    item(12, 'Vazgeçilenler: her yol neyi bırakır', '18', [real.length > 0 && real.some((x) => x.giveUp), real.length > 0 && real.every((x) => x.giveUp)]),
    item(13, 'Durdurma kuralları ve yeniden açma koşulları', '02', [stop >= 1, stop >= 3]),
    item(14, 'Açık karar soruları ve karar tarihi', '18', [open.length > 0, open.length > 0 && open.every((o) => o.dueDate)]),
  ]
}

export function buildHandoffReport(plan: PlanDoc, now: Date = new Date()): HandoffReport {
  const foundation = buildFoundationDoc(plan, now)
  const [who, customer, , money] = foundation.answers
  const paths = pathColumns(plan)
  const openDecisions: OpenDecision[] = rows(plan, '18', 'openDecisions')
    .filter((r) => str(r.question))
    .map((r) => ({ question: str(r.question)!, alternatives: str(r.alternatives), basis: str(r.basis), owner: str(r.owner), dueDate: str(r.dueDate) ? formatDate(String(r.dueDate)) : null, reversalCost: str(r.reversalCost), door: door(r.door) }))
  const sensitivity = sensitivityRows(plan)

  // Rakip ve erişim: kaynaklı ise kanıtla, değilse varsayım olarak.
  const marketEvidence = evidenceFor(plan, ['08', '09', '11'])[0]
  const marketClaims: Claim[] = []
  const pushMarket = (text: string | null, step: string) => {
    if (!text) return
    marketClaims.push({ text, status: marketEvidence ? 'kaynakli' : 'varsayim', confidence: confidenceOf(marketEvidence ? marketEvidence.ladder : null), source: marketEvidence?.title, date: marketEvidence?.date ? formatDate(marketEvidence.date) : undefined, step })
  }
  const rivals = rows(plan, '09', 'competitors').map((r) => str(r.name)).filter(Boolean)
  pushMarket(str(v(plan, '08', 'accessPath')) ? `Ulaşma yolu: ${str(v(plan, '08', 'accessPath'))}` : null, '08')
  pushMarket(str(v(plan, '08', 'blockerPerson')) ? `Alımı durdurabilen kişi: ${str(v(plan, '08', 'blockerPerson'))}` : null, '08')
  pushMarket(rivals.length ? `Rakipler ve ikameler: ${rivals.join(', ')}.` : null, '09')
  pushMarket(str(v(plan, '09', 'profitPool')) ? `Parayı kazanan: ${str(v(plan, '09', 'profitPool'))}` : null, '09')
  for (const f of failedAttemptsOf(plan)) pushMarket(`Bu işi deneyip bırakan: ${f.who}.${f.why ? ` Bırakma nedeni: ${f.why}` : ''}${f.difference ? ` Bizim farkımız: ${f.difference}` : ''}`, '09')
  const som = num(v(plan, '09', 'somCustomers'))
  if (som !== null) marketClaims.push({ text: `Gerçekçi pazar bir yılda ${fmt(som)} müşteridir.`, status: 'hesap', confidence: confidenceOf(marketEvidence ? marketEvidence.ladder : null), source: marketEvidence?.title, step: '09' })

  // Güçler: dört soruluk süzgecin sonucu. Dayanak yazıldıysa "kaynaklı", yazılmadıysa "varsayım".
  const strengthEvidence = evidenceFor(plan, [STRENGTHS_STEP])[0]
  const strengthClaims: Claim[] = strengthsOf(plan)
    .filter((s) => s.level !== 'bos')
    .map((s) => ({
      text: `${s.name}: ${STRENGTH_LABEL[s.level]}. ${STRENGTH_NOTE[s.level]}`,
      status: s.basis || strengthEvidence ? ('kaynakli' as const) : ('varsayim' as const),
      confidence: strengthEvidence ? confidenceOf(strengthEvidence.ladder) : s.basis ? ('dusuk' as const) : ('kanitsiz' as const),
      source: s.basis ?? strengthEvidence?.title,
      step: STRENGTHS_STEP,
    }))

  const limits: { label: string; value: string }[] = []
  const L = plan.limits
  if (L.budgetKurus) limits.push({ label: 'Toplam harcama sınırı', value: formatMoney(L.budgetKurus) })
  if (L.deadline) limits.push({ label: 'Bitiş tarihi', value: formatDate(L.deadline) })
  if (L.retriesPerDecision) limits.push({ label: 'Karar başına deneme hakkı', value: String(L.retriesPerDecision) })
  if (L.cashKurus) limits.push({ label: 'Kasadaki para', value: formatMoney(L.cashKurus) })
  if (L.monthlyBurnKurus) limits.push({ label: 'Aylık gider', value: formatMoney(L.monthlyBurnKurus) })
  if (L.cashKurus && L.monthlyBurnKurus) limits.push({ label: 'Pist', value: `${Math.floor(L.cashKurus / L.monthlyBurnKurus)} ay` })
  const free = freeBudget(plan)
  if (free.state === 'hesap') limits.push({ label: 'Serbest bütçe', value: `${formatMoney(free.freeKurus)}. Harcanan ve ödenmemiş taahhüt düşüldü` })
  if (free.state === 'bilinmiyor') limits.push({ label: 'Serbest bütçe', value: 'Bilinmiyor. Ödenmemiş taahhüt bilinmiyor' })
  const bottleneck = str(v(plan, '12', 'bottleneck'))
  if (bottleneck) limits.push({ label: 'Darboğaz', value: [bottleneck.replace(/\.$/, ''), str(v(plan, '12', 'bottleneckLimit'))].filter(Boolean).join('. Bugünkü sınır: ') })
  const deps = dependenciesOf(plan)
  if (deps) limits.push({ label: 'Tek kaynağa bağımlılık', value: `${deps.labels.join(', ')}${deps.note ? `. ${deps.note.replace(/\.$/, '')}` : ''}` })
  const horizon = str(v(plan, '02', 'horizon'))
  if (horizon) limits.push({ label: 'Üç yıllık beklenti', value: horizon.replace(/\.$/, '') })
  const owner = [...plan.decisions].reverse().find((d) => d.decidedBy)?.decidedBy
  if (owner) limits.push({ label: 'Karar sahibi', value: owner })

  const limitClaims: Claim[] = limits.map((l) => ({ text: `${l.label}: ${l.value}.`, status: 'karar', confidence: 'yuksek', step: '02' }))

  const assumptionRows = rows(plan, '10', 'assumptions').filter((a) => str(a.assumption))
  const assumptions: OpenAssumption[] = assumptionRows
    .filter((a) => a.status !== 'dogrulandi')
    .map((a) => ({ text: str(a.assumption)!, impact: Number(a.impact ?? 0), state: (a.status === 'curudu' ? 'curudu' : 'denenmedi') as OpenAssumption['state'], test: str(a.testMethod), affects: str(a.affectsPath) }))
    .sort((a, b) => b.impact - a.impact)

  // İş türüne özgü bilgi. Yalnız ilgili profilde ve kullanıcı yazdıysa görünür.
  const kindClaims: Claim[] = []
  const kind = (text: string, step: string, status: ClaimStatus = 'varsayim') => kindClaims.push({ text, status, confidence: status === 'hesap' ? 'orta' : 'kanitsiz', step })
  if (plan.profile.group) {
    const resource = str(v(plan, '12', 'groupResource'))
    if (resource) kind(`Grubun verdiği ortak kaynak: ${resource}${str(v(plan, '12', 'groupTerms')) ? `. Kullanım koşulu: ${str(v(plan, '12', 'groupTerms'))}` : ''}`, '12', 'karar')
    const expectation = str(v(plan, '12', 'groupExpectation'))
    if (expectation) kind(`Grubun beklediği sonuç: ${expectation}`, '12', 'karar')
    const autonomy = str(v(plan, '12', 'groupAutonomy'))
    if (autonomy) kind(`Gruba sormadan alınabilen karar: ${autonomy}`, '12', 'karar')
    const demand = v(plan, '12', 'groupDemand')
    if (demand === 'grupIci') kind('Talep grup içinden geliyor. Bu talep bağımsız dış talebin kanıtı değildir.', '12')
    if (demand === 'dis') kind('Talep grubun dışından geliyor.', '12')
    if (demand === 'ikisi') kind('Talep hem grup içinden hem dışarıdan geliyor. İkisini ayrı ölçün.', '12')
  }
  if (plan.profile.customer === 'pazarYeri') {
    const valid = v(plan, '15', 'validRequests')
    const matched = v(plan, '15', 'matchedRequests')
    const rate = matchRate(valid, matched)
    if (rate.state === 'hesap') kind(`${valid} geçerli talebin ${matched} tanesi uygun teklif aldı. Eşleşme oranı yüzde ${rate.percent}.`, '15', 'hesap')
    if (rate.state === 'sifir') kind('Geçerli talep sayısı sıfır. Eşleşme oranı hesaplanmaz.', '15', 'hesap')
    if (rate.state === 'hata') kind('Uygun teklif alan talep, geçerli talebi geçiyor. Eşleşme oranı yazılmadı.', '15', 'hesap')
    const registered = num(v(plan, '15', 'registeredSellers'))
    const active = num(v(plan, '15', 'activeSellers'))
    if (registered !== null && active !== null) kind(`${fmt(registered)} kayıtlı satıcının ${fmt(active)} tanesi gerçek talebe cevap verdi.`, '15', 'hesap')
  }
  if (plan.profile.paid === false) {
    const participants = num(v(plan, '15', 'participants'))
    const beneficiaries = num(v(plan, '15', 'beneficiaries'))
    if (participants !== null && beneficiaries !== null) kind(`${fmt(participants)} kişi katıldı. ${fmt(beneficiaries)} kişi gerçekten yararlandı.`, '15', 'hesap')
    const benefit = str(v(plan, '15', 'benefitNote'))
    if (benefit) kind(`Yararlanan kişide görülen değişim: ${benefit}`, '15')
  }

  const groups: ClaimGroup[] = [
    { title: 'Müşteri ve sorun', decision: 'Önce kimin hangi sorununa odaklanacağız?', claims: claimsFrom(plan, who, 'kaynakli') },
    { title: 'Talep', decision: 'Talep hangi müşteri ve teklif için yeterince güçlü?', claims: claimsFrom(plan, customer, 'kaynakli') },
    { title: 'Rakip ve erişim', decision: 'Müşteri hangi nedenle bize geçer? Ona nerede ulaşırız?', claims: marketClaims },
    { title: 'Güçlü yönler', decision: 'Hangi güce yaslanırız? Hangi güç fark yaratmaz?', claims: strengthClaims },
    { title: 'Para', decision: 'Hangi satış yolu giderleri karşılar? Ekibin gücü hangisine yeter?', claims: claimsFrom(plan, money, 'hesap') },
    { title: 'Sınırlar', decision: 'Hangi seçenekler sınırlarımız içinde? Hangi durumda vazgeçeriz?', claims: limitClaims },
    {
      title: 'Bilinmeyenler',
      decision: 'Hangi bilgi değişirse seçtiğimiz yol da değişir?',
      claims: assumptions.slice(0, 5).map((a) => ({ text: a.state === 'curudu' ? `Çürüdü: ${a.text}` : a.text, status: 'varsayim' as const, confidence: 'kanitsiz' as const, step: '10' })),
    },
    ...(kindClaims.length ? [{ title: 'İş türüne özgü bilgi', decision: 'Bu iş türünde hangi ayrım seçimi değiştirir?', claims: kindClaims }] : []),
  ]

  const locked = DECISIONS.filter((d) => d.n <= 5 && gatePassed(plan, d.n)).map((d) => {
    const last = lastDecision(plan, d.n)!
    return { text: `${d.gate.title} ${OUTCOME_LABEL[effectiveOutcome(last)]}. ${last.reason}`, source: `Kapı ${d.n}, ${formatDate(last.decidedAt)}` }
  })

  const t = lastTransition(plan)
  const transition: HandoffTransition | undefined = t
    ? { label: TRANSITION_LABEL[t.outcome], effective: effectiveTransition(t, now), reason: t.reason, decidedBy: t.decidedBy, date: formatDate(t.decidedAt), stale: Boolean(t.stale) }
    : undefined
  const scope = t && !t.stale && t.outcome === 'kosullu' && t.conditional ? t.conditional.topic : undefined

  const coverage = coverageOf(plan, paths, openDecisions, sensitivity)
  const level = validationLevel(plan)
  const crux = cruxOf(plan)
  const conditions = successConditionsOf(plan)
  const real = paths.filter((x) => !x.baseline)
  const join = (parts: (string | null | undefined)[]): string | null => {
    const filled = parts.map((x) => (x ? x.replace(/\.$/, '') : null)).filter((x): x is string => Boolean(x))
    return filled.length ? `${filled.join('. ')}.` : null
  }
  const advantages = strengthsOf(plan).filter((x) => x.level === 'kalici' || x.level === 'gecici' || x.level === 'kullanilmayan')
  const sixQuestions: SixQuestion[] = [
    { question: 'Müşterimiz kim ve neye değer veriyor?', answer: join([str(v(plan, '08', 'segmentName')), str(v(plan, '13', 'vpResult'))]), step: '08' },
    { question: 'Önümüzdeki asıl engel ne?', answer: crux ? crux.text : null, step: '18' },
    { question: 'Nerede oynuyoruz, neyi yapmıyoruz?', answer: real.length ? join([`Masadaki yollar: ${real.map((x) => x.name).join(', ')}`, real.some((x) => x.giveUp) ? `Vazgeçilenler: ${real.map((x) => x.giveUp).filter(Boolean).join(' ')}` : null]) : null, step: '18' },
    { question: 'Büyüyünce bizi ne koruyacak?', answer: advantages.length ? join([advantages.map((x) => `${x.name} (${STRENGTH_LABEL[x.level]})`).join(', ')]) : null, step: '12' },
    { question: 'Hangi koşullar şart ve neyle ölçülür?', answer: conditions.length ? join(conditions.map((c) => `${c.condition.replace(/\.$/, '')}${c.measure ? `, ölçü: ${c.measure}` : ''}`)) : null, step: '18' },
    { question: 'Bu iş nasıl batar?', answer: join(rows(plan, '17', 'premortem').map((r) => str(r.reason)).slice(0, 3)), step: '17' },
  ]
  return {
    title: HANDOFF_TITLE,
    stamp: foundation.stamp,
    meta: [`Plan: ${plan.name}`, `Sürüm: ${plan.revision}`, `Doğrulama seviyesi: ${level} / 5. ${LEVELS[level].title}.`, `Oluşturma: ${formatDate(now.toISOString())}`],
    question: decisionQuestion(paths, openDecisions),
    crux,
    conditions,
    scope,
    transition,
    locked,
    groups,
    limits,
    stopRules: (plan.limits.stopRules ?? []).map((r) => (typeof r === 'string' ? r : str((r as { rule?: unknown }).rule))).filter((x): x is string => Boolean(x)),
    redLines: str(v(plan, '01', 'redLines')),
    paths,
    crosses: crossAnswers(plan),
    links: pathLinksOf(plan),
    pathIssues: pathIssues(rows(plan, '18', 'paths')),
    dissents: dissentsOf(plan),
    counterMove: str(v(plan, '18', 'counterMove')),
    sensitivity,
    assumptions,
    fragile: str(v(plan, '16', 'fragileNumber')),
    uncertainties: [str(v(plan, '04', 'uncertainty1')), str(v(plan, '04', 'uncertainty2'))].filter((x): x is string => Boolean(x)),
    scenarios: rows(plan, '04', 'scenarios').filter((s) => str(s.name)).map((s) => ({ name: str(s.name)!, signal: str(s.signal), winCondition: str(s.winCondition) })),
    openDecisions,
    coverage,
    coverageFilled: coverage.filter((c) => c.status === 'dolu').length,
    firstDay: FIRST_DAY,
    sixQuestions,
  }
}

const cell = (x: string | null | undefined): string => (x && x.trim() ? x.replace(/\|/g, '/') : 'Yazılmadı')

export function handoffToMarkdown(r: HandoffReport): string {
  const out: string[] = [`# ${r.title}`, '']
  if (r.stamp) out.push(`> ${r.stamp}`, '')
  out.push(...r.meta.map((m) => `- ${m}`), '')
  out.push('## 1. Bugün hangi karar verilecek?', '', r.question, '')
  if (r.crux) {
    out.push('### Asıl engel', '', r.crux.text, '')
    if (r.crux.why) out.push(`Neden önce: ${r.crux.why}`, '')
    if (r.crux.paths) out.push(`Etkilediği yol: ${r.crux.paths}`, '')
    if (r.crux.alternative) out.push(`Başka açıklama: ${r.crux.alternative}`, '')
    if (r.crux.split) out.push(`İki açıklamayı ayıran bulgu: ${r.crux.split}`, '')
    out.push(`Destekleyen kanıt: ${r.crux.support.join(', ') || 'Bağlanmadı.'}`, '', `Karşı bulgu: ${r.crux.counter.join(', ') || 'Bağlanmadı.'}`, '')
    if (r.crux.missing) out.push(`${r.crux.missing} bağlı kanıt silinmiş.`, '')
  }
  if (r.conditions.length) {
    out.push('### Başarı neye bağlı?', '', '| Koşul | Durum | Ölçü | Başlangıç | Sınır | Sorumlu | Destek | Karşı bulgu |', '|---|---|---|---|---|---|---|---|')
    for (const c of r.conditions) out.push(`| ${cell(c.condition)} | ${CONDITION_LABEL[c.status]} | ${cell(c.measure)} | ${cell(c.baseline)} | ${c.threshold ? cell(`${c.threshold}${c.thresholdLate ? '. Sonradan belirlendi' : ''}`) : 'Yazılmadı'} | ${cell(c.owner)} | ${cell(c.support.join(', '))} | ${cell(c.counter.join(', '))} |`)
    out.push('')
  }
  if (r.scope) out.push(`Kapsam sınırı: yalnız şu konu planlanır. ${r.scope}`, '')
  if (r.transition) out.push(`Geçiş kararı: ${r.transition.label}. ${r.transition.reason} Karar sahibi ${r.transition.decidedBy}. ${r.transition.date}.${r.transition.stale ? ' Karar inceleme bekliyor.' : ''}`, '')
  if (r.locked.length) out.push('### Verilmiş kararlar', '', ...r.locked.map((l) => `- ${l.text} (${l.source})`), '')
  out.push('## 2. Dayanaklar', '')
  for (const g of r.groups) {
    out.push(`### ${g.title}`, '', `Bu bilgiyle verilecek karar: ${g.decision}`, '')
    if (!g.claims.length) out.push('Henüz yazılmadı.', '')
    else out.push('| Bilgi | Tür | Güven | Kaynak | Karşı bulgu |', '|---|---|---|---|---|', ...g.claims.map((c) => `| ${cell(c.text)} | ${STATUS_LABEL[c.status]} | ${CONFIDENCE_LABEL[c.confidence]} | ${c.source ? `${cell(c.source)}${c.date ? `, ${c.date}` : ''}` : 'Kaynak yok'} | ${c.counter ? cell(c.counter) : 'Yok'} |`), '')
  }
  out.push('## 3. Bağlayıcı sınırlar', '')
  out.push(...(r.limits.length ? r.limits.map((l) => `- ${l.label}: ${l.value}`) : ['Henüz yazılmadı.']), '')
  if (r.stopRules.length) out.push('Durdurma kuralları:', '', ...r.stopRules.map((s) => `- ${s}`), '')
  out.push(`Kırmızı çizgiler: ${r.redLines ?? 'Henüz yazılmadı.'}`, '')
  out.push('## 4. Karşılaştırılacak yollar', '')
  if (!r.paths.length) out.push(NO_PATHS, '')
  else {
    out.push(`| Ölçü | ${r.paths.map((p) => cell(p.name)).join(' | ')} |`, `|---|${r.paths.map(() => '---').join('|')}|`)
    const line = (label: string, pick: (p: PathColumn) => string | null) => out.push(`| ${label} | ${r.paths.map((p) => cell(pick(p))).join(' | ')} |`)
    line('Kime ve nereden?', (p) => p.where)
    line('Neyle kazanılır?', (p) => p.how)
    line('Para nasıl kazanılır?', (p) => p.revenue)
    line('Nasıl kurulur?', (p) => p.vehicle)
    line('Neyden vazgeçilir?', (p) => p.giveUp)
    line('Destekleyen kanıt', (p) => p.evidence)
    line('Kanıtın türü', (p) => pathBasis(p))
    line('Hangi sorudan çıktı?', (p) => p.origin)
    line('Bedeli ve süresi', (p) => p.cost)
    line('Geri alınabilir mi?', (p) => (p.reversible ? DOOR_LABEL[p.reversible] : null))
    line('Puan', (p) => (p.score !== null ? String(p.score) : null))
    out.push('')
  }
  if (r.crosses.length) out.push('Yollar şu sorulardan çıktı:', '', ...r.crosses.map((c) => `- ${c.question} ${c.text}`), '')
  if (r.pathIssues.length) out.push('Yol denetimi:', '', ...r.pathIssues.map((x) => `- ${x}`), '')
  if (r.links.length) out.push('Yol bağları:', '', ...r.links.map((l) => `- ${l.path ? `${l.path}. ` : ''}${l.a} ile ${l.b}: ${RELATION_LABEL[l.relation]}.${l.reason ? ` ${l.reason}` : ''}`), '')
  if (r.counterMove) out.push(`Rakip karşı hamlesi: ${r.counterMove}`, '')
  if (r.sensitivity.length) out.push('Para hesabı üç durumda:', '', '| Durum | Sipariş katkısı | Başabaş | Not |', '|---|---|---|---|', ...r.sensitivity.map((s) => `| ${s.label} | ${s.contribution} | ${s.breakEven} | ${s.note} |`), '')
  out.push('## 5. Seçimi değiştirebilecek eksik bilgi', '')
  if (r.fragile) out.push(`Kırılgan sayı: ${r.fragile}`, '')
  if (r.assumptions.length) out.push('Açık varsayımlar:', '', ...r.assumptions.map((a) => `- ${a.state === 'curudu' ? 'Çürüdü. ' : ''}${a.text} Etki ${a.impact} / 5.${a.test ? ` Test: ${a.test}` : ''}${a.affects ? ` Yanlış çıkarsa değişen yol: ${a.affects}.` : ''}`), '')
  if (r.dissents.length) out.push('Ayrı görüşler:', '', ...r.dissents.map((d) => `- ${d.who ? `${d.who}: ` : ''}${d.view}${d.about ? ` İtiraz edilen: ${d.about}.` : ''} Durum: ${DISSENT_LABEL[d.response]}.`), '')
  if (r.uncertainties.length) out.push('Kritik belirsizlikler:', '', ...r.uncertainties.map((u) => `- ${u}`), '')
  if (r.scenarios.length) out.push('Senaryolar:', '', ...r.scenarios.map((s) => `- ${s.name}. İşaret: ${s.signal ?? 'yazılmadı'}. Kazanma koşulu: ${s.winCondition ?? 'yazılmadı'}.`), '')
  if (r.openDecisions.length) out.push('Açık karar defteri:', '', '| Karar sorusu | Seçenekler | Dayanak | Karar sahibi | Karar tarihi | Dönüş bedeli | Geri alınır mı? |', '|---|---|---|---|---|---|---|', ...r.openDecisions.map((d) => `| ${cell(d.question)} | ${cell(d.alternatives)} | ${cell(d.basis)} | ${cell(d.owner)} | ${cell(d.dueDate)} | ${cell(d.reversalCost)} | ${d.door ? DOOR_LABEL[d.door] : 'Yazılmadı'} |`), '')
  if (!r.fragile && !r.assumptions.length && !r.uncertainties.length && !r.scenarios.length && !r.openDecisions.length && !r.dissents.length) out.push('Henüz yazılmadı.', '')
  out.push('## Ek 1. Kapsam', '', `${r.coverageFilled} / ${r.coverage.length} başlık dolu.`, '', ...r.coverage.map((c) => `- ${c.no}. ${c.title}: ${c.status === 'dolu' ? 'dolu' : c.status === 'kismen' ? 'kısmen dolu' : 'boş'} (Adım ${c.step})`), '')
  out.push("## Ek 2. Stratej'in ilk günü", '', ...r.firstDay.map((s, i) => `${i + 1}. ${s}`), '')
  out.push('## Ek 3. Altı soru', '', ...r.sixQuestions.map((q, i) => `${i + 1}. ${q.question} ${q.answer ?? 'Henüz yazılmadı.'} (Adım ${q.step})`), '')
  return out.join('\n')
}
