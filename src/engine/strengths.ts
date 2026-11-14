/**
 * Dört soruluk güç süzgeci. Karar Kitabı'ndaki "VRIO Analizi" yönteminin kuralıdır.
 * Sorular sırayla sorulur. Bir soru "hayır" alınca güç o seviyede kalır.
 * Yazılım gücü değerlendirmez. Cevapları kullanıcı verir, yazılım yalnız sonucu hesaplar.
 */
import type { CalcResult } from '@/data/schema'
import type { PlanDoc } from '@/data/types'

export const STRENGTHS_STEP = '12'
export const STRENGTHS_KEY = 'strengths'

export type StrengthLevel = 'bos' | 'dezavantaj' | 'esitlik' | 'gecici' | 'kullanilmayan' | 'kalici'

export const STRENGTH_LABEL: Record<StrengthLevel, string> = {
  bos: 'Henüz sınanmadı',
  dezavantaj: 'Dezavantaj',
  esitlik: 'Eşitlik',
  gecici: 'Geçici avantaj',
  kullanilmayan: 'Kullanılmayan avantaj',
  kalici: 'Kalıcı avantaj',
}

export const STRENGTH_NOTE: Record<StrengthLevel, string> = {
  bos: 'Dört soruyu sırayla cevaplayın.',
  dezavantaj: 'Bu kaynak işe yaramıyor. Güç saymayın.',
  esitlik: 'Rakiplerin çoğunda da var. Fark yaratmaz.',
  gecici: 'Rakip bunu zamanla kopyalar.',
  kullanilmayan: 'Güç var ama onu kullanacak düzen yok.',
  kalici: 'Dört sorudan da geçti.',
}

/** Avantaj sayılan seviyeler. Stratej "neyle kazanırız" sorusunda bunlara bakar. */
export const ADVANTAGE_LEVELS: StrengthLevel[] = ['gecici', 'kullanilmayan', 'kalici']

type Row = Record<string, unknown>
const text = (x: unknown): string | null => (typeof x === 'string' && x.trim() ? x.trim() : null)
const QUESTIONS: [key: string, levelIfNo: StrengthLevel][] = [
  ['valuable', 'dezavantaj'],
  ['rare', 'esitlik'],
  ['hardToCopy', 'gecici'],
  ['organized', 'kullanilmayan'],
]

export function strengthLevel(row: Row): StrengthLevel {
  for (const [key, levelIfNo] of QUESTIONS) {
    if (row[key] === 'hayir') return levelIfNo
    if (row[key] !== 'evet') return 'bos'
  }
  return 'kalici'
}

export interface Strength {
  id: string
  name: string
  level: StrengthLevel
  basis: string | null
}

function named(values: Row | undefined): Row[] {
  const list = values?.[STRENGTHS_KEY]
  return Array.isArray(list) ? (list as Row[]).filter((r) => text(r.name)) : []
}

export function strengthsOf(plan: PlanDoc): Strength[] {
  return named(plan.steps[STRENGTHS_STEP]?.values).map((r, i) => ({ id: String(r._id ?? i), name: text(r.name)!, level: strengthLevel(r), basis: text(r.basis) }))
}

/** Adım 12 tamamlanırken aranan koşullar. Liste boşsa engel yoktur. */
export function strengthIssues(values: Row, plan: PlanDoc): string[] {
  const rows = named(values)
  const issues = rows.filter((r) => r.rare === 'evet' && !text(r.basis)).map((r) => `"${text(r.name)}" için dayanak yazın. Nadir olduğunu nereden biliyorsunuz?`)
  if (rows.length === 0 && !plan.profile.smallReversible) issues.push('Ağır yatırımda en az bir güçlü yön yazın. Her gücü dört soruyla sınayın.')
  return issues
}

/** "Süzgeç sonucu" kutusu. Her gücün yanına ulaştığı seviyeyi yazar. */
export function strengthsCalc(values: Row): CalcResult | null {
  const rows = named(values)
  if (rows.length === 0) return null
  const levels = rows.map((r) => strengthLevel(r))
  const advantages = levels.filter((l) => ADVANTAGE_LEVELS.includes(l)).length
  const tested = levels.some((l) => l !== 'bos')
  return {
    value: `${rows.length} güçten ${advantages} tanesi avantaj`,
    lines: rows.map((r, i) => `${text(r.name)}: ${STRENGTH_LABEL[levels[i]]}. ${STRENGTH_NOTE[levels[i]]}`),
    warn: tested && advantages === 0 ? 'Süzgeçten geçen avantaj yok. Bu bir bulgudur. Stratej bunu bilmelidir.' : undefined,
  }
}
