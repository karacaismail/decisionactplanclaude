/**
 * Hedef takibi. İsteğe bağlı katmandır. İngilizce adı OKR'dir.
 * Kurallar docs/okr-arastirma-raporu.md dosyasının 6. ve 9. bölümlerindedir.
 *
 * Bu dosya yalnız `plan.okr` alanını ve 3.2 adımının iş listesini okur.
 * Hiçbir kontrol, hazırlık ölçütü, küme ya da teslim raporu bu dosyayı kullanmaz.
 * Yazılım karar vermez. Puan yalnız "Seçim hâlâ doğru mu?" sorusunu sordurur.
 */
import type { OkrCheckIn, OkrConfidence, OkrIndicator, OkrKind, OkrObjective, OkrPeriod, OkrState, PlanDoc } from '@/data/types'
import { uid } from './format'

export const OKR_MAX_OBJECTIVES = 3
export const OKR_MAX_INDICATORS = 5
/** Bu sayıdan çok gösterge yazılınca yumuşak uyarı çıkar. */
export const OKR_SOFT_INDICATORS = 3
export const OKR_PERIOD_MONTHS = 3
export const OKR_OVERDUE_DAYS = 14

export const OKR_TOO_MANY = 'Üçten çok gösterge takibi zorlaştırır.'
export const OKR_OVERDUE = 'Son 2 haftada sayı yazılmadı.'
export const OKR_TASK_LIKE = 'Bu bir iş gibi görünüyor. İşi 3.2 Ana işler adımına yazın. Buraya işin sonucunu ölçen bir sayı yazın.'
export const OKR_NO_SCORE = 'Puan henüz hesaplanmadı.'
export const OKR_LEARNED_MISSING = '"Bu dönemde ne öğrendiniz?" sorusunu cevaplayın.'

export const CONFIDENCE_LABEL: Record<OkrConfidence, string> = { evet: 'Evet, büyük ihtimalle', belki: 'Belki', hayir: 'Hayır, zor görünüyor' }
export const CONFIDENCES: OkrConfidence[] = ['evet', 'belki', 'hayir']
export const KIND_LABEL: Record<OkrKind, string> = { kesin: 'Kesin hedef', zorlu: 'Zorlu hedef' }
export const KIND_HELP: Record<OkrKind, string> = { kesin: 'Hedefe tam ulaşmanız beklenir.', zorlu: 'Hedef bilerek yüksek konur. Yüzde 70 iyi bir sonuçtur.' }
export const KINDS: OkrKind[] = ['kesin', 'zorlu']

type Rec = Record<string, unknown>
const isRecord = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v)
const isText = (v: unknown): v is string => typeof v === 'string'
const isId = (v: unknown): v is string => typeof v === 'string' && v.length > 0
const finite = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)
const isConfidence = (v: unknown): v is OkrConfidence => v === 'evet' || v === 'belki' || v === 'hayir'

/* ---- Bozuk kayıt ---- */

function sanitizeCheckIn(v: unknown): OkrCheckIn | null {
  if (!isRecord(v) || !isText(v.at) || finite(v.value) === null || !isConfidence(v.confidence)) return null
  const out: OkrCheckIn = { at: v.at, value: v.value as number, confidence: v.confidence }
  if (isText(v.note)) out.note = v.note
  return out
}

function sanitizeIndicator(v: unknown): OkrIndicator | null {
  if (!isRecord(v) || !isId(v.id)) return null
  const out: OkrIndicator = { id: v.id, name: isText(v.name) ? v.name : '', baseline: finite(v.baseline), target: finite(v.target), checkIns: [] }
  if (isText(v.unit)) out.unit = v.unit
  if (isText(v.owner)) out.owner = v.owner
  out.checkIns = (Array.isArray(v.checkIns) ? v.checkIns : []).map(sanitizeCheckIn).filter((x): x is OkrCheckIn => x !== null)
  return out
}

function sanitizeObjective(v: unknown): OkrObjective | null {
  if (!isRecord(v) || !isId(v.id)) return null
  const out: OkrObjective = { id: v.id, title: isText(v.title) ? v.title : '', indicators: [] }
  if (v.kind === 'kesin' || v.kind === 'zorlu') out.kind = v.kind
  if (isText(v.owner)) out.owner = v.owner
  if (isText(v.sourceMove)) out.sourceMove = v.sourceMove
  out.indicators = (Array.isArray(v.indicators) ? v.indicators : [])
    .map(sanitizeIndicator)
    .filter((x): x is OkrIndicator => x !== null)
    .slice(0, OKR_MAX_INDICATORS)
  return out
}

function sanitizePeriod(v: unknown): OkrPeriod | null {
  if (!isRecord(v) || !isId(v.id) || !isText(v.startsAt) || !isText(v.endsAt)) return null
  const out: OkrPeriod = {
    id: v.id,
    startsAt: v.startsAt,
    endsAt: v.endsAt,
    objectives: (Array.isArray(v.objectives) ? v.objectives : [])
      .map(sanitizeObjective)
      .filter((x): x is OkrObjective => x !== null)
      .slice(0, OKR_MAX_OBJECTIVES),
  }
  if (isRecord(v.taskLinks)) out.taskLinks = Object.fromEntries(Object.entries(v.taskLinks).filter(([, id]) => isId(id))) as Record<string, string>
  if (isText(v.closedAt)) out.closedAt = v.closedAt
  if (isText(v.learned)) out.learned = v.learned
  return out
}

/**
 * Kaydı denetler ve onarır. Kayıt tanınmıyorsa undefined döner. Plan reddedilmez.
 * Bozuk parça atılır. Sayı olmayan başlangıç değeri ve varılacak sayı boş sayılır.
 */
export function sanitizeOkr(v: unknown): OkrState | undefined {
  if (!isRecord(v) || typeof v.enabled !== 'boolean') return undefined
  return {
    enabled: v.enabled,
    changedAt: isText(v.changedAt) ? v.changedAt : '',
    periods: (Array.isArray(v.periods) ? v.periods : []).map(sanitizePeriod).filter((x): x is OkrPeriod => x !== null),
  }
}

/** Planın hedef takibi kaydı. Bozuk kayıt okunmaz. */
export function okrOf(plan: PlanDoc): OkrState | undefined {
  return sanitizeOkr(plan.okr)
}

export function okrEnabled(plan: PlanDoc): boolean {
  return okrOf(plan)?.enabled === true
}

/* ---- Dönem ---- */

const pad = (n: number) => String(n).padStart(2, '0')
const dayText = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
/** "2026-11-19" metnini yerel güne çevirir. Okunamazsa null döner. */
function dayOf(text: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(text)
  if (!m) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}

/** Bugün başlayan 3 aylık dönem. Ay sonu taşarsa ayın son günü alınır. */
export function createPeriod(now: Date = new Date()): OkrPeriod {
  const y = now.getFullYear()
  const m = now.getMonth() + OKR_PERIOD_MONTHS
  const last = new Date(y, m + 1, 0).getDate()
  const end = new Date(y, m, Math.min(now.getDate(), last))
  return { id: uid('donem'), startsAt: dayText(now), endsAt: dayText(end), objectives: [] }
}

/** Açık dönem. Kapanmamış son dönemdir. */
export function openPeriod(state: OkrState | undefined): OkrPeriod | undefined {
  const list = state?.periods ?? []
  const last = list[list.length - 1]
  return last && !last.closedAt ? last : undefined
}

/** Anahtarı açar ya da kapatır. Kayıtlar silinmez. Karar sürümü ve kontroller değişmez. */
export function setOkrEnabled(plan: PlanDoc, on: boolean, now: Date = new Date()): void {
  const state = okrOf(plan) ?? { enabled: false, changedAt: '', periods: [] }
  state.enabled = on
  state.changedAt = now.toISOString()
  if (on && state.periods.length === 0) state.periods.push(createPeriod(now))
  plan.okr = state
}

/* ---- Hedef ve gösterge ---- */

export const canAddObjective = (period: OkrPeriod): boolean => period.objectives.length < OKR_MAX_OBJECTIVES
export const canAddIndicator = (o: OkrObjective): boolean => o.indicators.length < OKR_MAX_INDICATORS
export const tooManyIndicators = (o: OkrObjective): boolean => o.indicators.length > OKR_SOFT_INDICATORS

export function addObjective(period: OkrPeriod, title = '', sourceMove?: string): OkrObjective | null {
  if (!canAddObjective(period)) return null
  const o: OkrObjective = { id: uid('hedef'), title, indicators: [] }
  if (sourceMove) o.sourceMove = sourceMove
  period.objectives.push(o)
  return o
}

/** Yeni gösterge boş başlar. Başlangıç değeri ve varılacak sayı uydurulmaz. */
export function addIndicator(o: OkrObjective): OkrIndicator | null {
  if (!canAddIndicator(o)) return null
  const g: OkrIndicator = { id: uid('gosterge'), name: '', baseline: null, target: null, checkIns: [] }
  o.indicators.push(g)
  return g
}

/** Ekrana yazılan sayıyı okur. Virgül ondalık ayırıcıdır. Sayı değilse null döner. */
export function parseNumber(text: string): number | null {
  const t = text.trim().replace(/\s/g, '').replace(',', '.')
  if (!/^-?\d+(\.\d+)?$/.test(t)) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

/* ---- Puan ---- */

export function latestCheckIn(g: OkrIndicator): OkrCheckIn | undefined {
  return g.checkIns[g.checkIns.length - 1]
}

/**
 * Puan: (bugünkü sayı − başlangıç) ÷ (varılacak sayı − başlangıç). 0 ile 1 arasında kalır.
 * Başlangıç ya da varılacak sayı yoksa, ikisi aynıysa ya da bugünkü sayı yazılmadıysa null döner.
 */
export function indicatorScore(g: OkrIndicator): number | null {
  const now = latestCheckIn(g)
  if (g.baseline === null || g.target === null || !now || g.target === g.baseline) return null
  const raw = (now.value - g.baseline) / (g.target - g.baseline)
  return Math.min(1, Math.max(0, raw))
}

/** Hedefin puanı, hesaplanabilen göstergelerin ortalamasıdır. */
export function objectiveScore(o: OkrObjective): number | null {
  const scores = o.indicators.map(indicatorScore).filter((x): x is number => x !== null)
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null
}

export const percent = (score: number): number => Math.round(score * 100)

/** Puan her zaman yazıyla anlatılır. Renk tek başına kullanılmaz. */
export function scoreText(score: number | null, kind?: OkrKind): string {
  if (score === null) return OKR_NO_SCORE
  const base = `Yüzde ${percent(score)} ilerledi.`
  if (kind === 'zorlu') return `${base} Zorlu hedefte yüzde 70 iyi bir sonuçtur.`
  if (kind === 'kesin') return `${base} Kesin hedefte tam ulaşmak beklenir.`
  return base
}

/* ---- Uyarılar ---- */

const TASK_WORDS = new Set(['kurmak', 'açmak', 'hazırlamak', 'yayınlamak', 'kurulması', 'açılması', 'hazırlanması', 'yayınlanması', 'kurulumu'])
/* "-mak" ya da "-mek" ile biten ama fiil olmayan sözcükler. */
const NOT_VERBS = new Set(['ekmek', 'yemek', 'kaymak', 'parmak', 'çakmak', 'ırmak', 'kaşmak'])

/** Gösterge bir iş gibi mi yazıldı? Örneğin "Yeni site kurmak" bir iştir. 0'dan 1'e giden sayı da iştir. */
export function taskLike(g: OkrIndicator): boolean {
  const words = g.name.toLocaleLowerCase('tr').split(/[^\p{L}]+/u).filter(Boolean)
  if (words.some((w) => TASK_WORDS.has(w))) return true
  const last = words[words.length - 1]
  if (last && /(mak|mek)$/.test(last) && !NOT_VERBS.has(last)) return true
  return g.baseline === 0 && g.target === 1
}

/** Son 2 haftada sayı yazılmadı mı? Kapanan dönemde ve yeni başlayan dönemde gecikme yoktur. */
export function indicatorOverdue(g: OkrIndicator, period: OkrPeriod, now: Date = new Date()): boolean {
  if (period.closedAt) return false
  const last = latestCheckIn(g)
  const lastAt = last ? new Date(last.at) : null
  const from = lastAt && !Number.isNaN(lastAt.getTime()) ? lastAt : dayOf(period.startsAt)
  if (!from) return false
  return now.getTime() - from.getTime() > OKR_OVERDUE_DAYS * 86_400_000
}

/* ---- Haftalık durum ---- */

export interface CheckInDraft {
  value?: number | null
  confidence?: OkrConfidence
  note?: string
}

/** Haftalık durumu yazar. Eksik varsa yazmaz ve Türkçe nedenleri döndürür. */
export function recordCheckIn(g: OkrIndicator, draft: CheckInDraft, now: Date = new Date()): string[] {
  const name = g.name.trim() || 'Adsız gösterge'
  const errors: string[] = []
  if (typeof draft.value !== 'number' || !Number.isFinite(draft.value)) errors.push(`"${name}" için bugünkü sayıyı yazın.`)
  if (!draft.confidence) errors.push(`"${name}" için tahmininizi seçin.`)
  if (errors.length) return errors
  const entry: OkrCheckIn = { at: now.toISOString(), value: draft.value as number, confidence: draft.confidence! }
  const note = draft.note?.trim()
  if (note) entry.note = note
  g.checkIns.push(entry)
  return []
}

/* ---- Dönem sonu ---- */

/** Dönem sonu özeti. Yalnız sonucu yazar, karar önermez. */
export function periodSummary(period: OkrPeriod): string {
  return period.objectives
    .map((o) => {
      const s = objectiveScore(o)
      return `${o.title.trim() || 'Adsız hedef'}: ${s === null ? 'puan hesaplanmadı' : `yüzde ${percent(s)} ilerledi`}.`
    })
    .join(' ')
}

/** Dönemi kapatır. Öğrenilen yazılmadan dönem kapanmaz. */
export function closePeriod(period: OkrPeriod, learned: string, now: Date = new Date()): string[] {
  const text = learned.trim()
  if (!text) return [OKR_LEARNED_MISSING]
  period.closedAt = now.toISOString()
  period.learned = text
  return []
}

/* ---- 3.2 bağlantısı ---- */

export interface LinkableTask {
  key: string
  action: string
}

/** 3.2 adımının "Şimdi" kutusundaki işler. Anahtar satır kimliğidir. Kimlik yoksa sıra numarası kullanılır. */
export function linkableTasks(plan: PlanDoc): LinkableTask[] {
  const rows = plan.steps['U32']?.values?.now
  if (!Array.isArray(rows)) return []
  return rows.flatMap((r, i) => {
    if (!isRecord(r) || !isText(r.action) || !r.action.trim()) return []
    return [{ key: isId(r._id) ? r._id : `satir-${i}`, action: r.action.trim() }]
  })
}
