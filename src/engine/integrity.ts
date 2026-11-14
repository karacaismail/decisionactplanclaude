/**
 * Veri bütünlüğü denetimleri. Yazılım yorum yapmaz, yalnız birbirini tutmayan kayıtları gösterir.
 * Üç kural vardır. Aynı kişi iki kez sayılmaz. Aynı görünen iki yol iki yol sayılmaz.
 * Birbirini tutmayan sayılarla adım tamamlanmaz.
 */
import type { CalcResult } from '@/data/schema'

type Row = Record<string, unknown>

/** Adları karşılaştırmak için sadeleştirir. Türkçe harfler doğru küçültülür, fazla boşluk atılır. */
export function norm(v: unknown): string {
  return typeof v === 'string' ? v.trim().normalize('NFC').toLocaleLowerCase('tr').replace(/\s+/g, ' ') : ''
}

const list = (x: unknown): Row[] => (Array.isArray(x) ? (x as Row[]) : [])
const text = (x: unknown): string | null => (typeof x === 'string' && x.trim() ? x.trim() : null)
const count = (x: unknown): number | null => (typeof x === 'number' && Number.isFinite(x) ? x : null)

/** Birden çok satırda yazılmış kişiler. Ad ilk yazıldığı biçimde döner. */
export function duplicatePeople(rows: unknown, key: string): string[] {
  const seen = new Map<string, { first: string; n: number }>()
  for (const r of list(rows)) {
    const id = norm(r[key])
    if (!id) continue
    const hit = seen.get(id)
    if (hit) hit.n += 1
    else seen.set(id, { first: text(r[key])!, n: 1 })
  }
  return [...seen.values()].filter((x) => x.n > 1).map((x) => x.first)
}

/** "Kişi denetimi" kutusu. Farklı kişi sayısını ve tekrar eden adları yazar. */
export function peopleCalc(rows: unknown, key: string): CalcResult | null {
  const named = list(rows).filter((r) => norm(r[key]))
  if (named.length === 0) return null
  const distinct = new Set(named.map((r) => norm(r[key]))).size
  const dup = duplicatePeople(rows, key)
  return dup.length
    ? { value: `${distinct} farklı kişi`, lines: [`${named.length} satır yazıldı.`], warn: `${dup.length} kişi birden çok kez yazılmış: ${dup.join(', ')}. Aynı kişiyse bir satırı silin.` }
    : { value: `${distinct} farklı kişi`, lines: ['Tekrar eden kişi yok.'] }
}

/** Adı olan ve adı başka bir yolla aynı olmayan yollar. Aynı ad bir kez sayılır. */
export function distinctPaths(rows: unknown): Row[] {
  const seen = new Set<string>()
  return list(rows).filter((r) => {
    const id = norm(r.name)
    if (!id || seen.has(id)) return false
    seen.add(id)
    return true
  })
}

const SAME_KEYS = ['where', 'how', 'revenue'] as const

/** Yol adayları arasındaki sorunlar. Her satır kullanıcıya gösterilen tam cümledir. */
export function pathIssues(rows: unknown): string[] {
  const named = list(rows).filter((r) => norm(r.name))
  const issues: string[] = []
  const names = new Map<string, string>()
  const reported = new Set<string>()
  for (const r of named) {
    const id = norm(r.name)
    if (names.has(id) && !reported.has(id)) {
      issues.push(`"${names.get(id)}" adı iki yolda yazılmış. Her yola ayrı ad verin.`)
      reported.add(id)
    } else if (!names.has(id)) names.set(id, text(r.name)!)
  }
  const unique = distinctPaths(rows)
  const full = unique.filter((r) => SAME_KEYS.every((k) => norm(r[k])))
  for (let i = 0; i < full.length; i++) {
    for (let j = i + 1; j < full.length; j++) {
      if (SAME_KEYS.every((k) => norm(full[i][k]) === norm(full[j][k]))) issues.push(`"${text(full[i].name)}" ve "${text(full[j].name)}" aynı görünüyor. Müşteri, kazanma yolu ve para mantığı aynı. Farkı yazın ya da yolları birleştirin.`)
    }
  }
  return issues
}

/** "Yollar ne kadar farklı?" kutusu. */
export function pathsCalc(rows: unknown): CalcResult | null {
  const unique = distinctPaths(rows)
  if (unique.length === 0) return null
  const issues = pathIssues(rows)
  return issues.length ? { value: `${unique.length} farklı yol`, lines: issues, warn: 'Aynı görünen yollar stratej için tek yoldur.' } : { value: `${unique.length} farklı yol`, lines: ['Yolların adı, müşterisi, kazanma yolu ya da para mantığı farklı.'] }
}

const CHECK = 'Sayıları inceleyin.'

/** Adım 15'teki sayılar birbirini tutuyor mu? Boş liste engel yok demektir. */
export function demandNumberIssues(values: Row): string[] {
  const issues: string[] = []
  const over = (part: number | null, whole: number | null, a: string, b: string) => {
    if (part !== null && whole !== null && part > whole) issues.push(`${a} ${b} geçemez. ${CHECK}`)
  }
  const reached = count(values.reached)
  over(count(values.tried), reached, 'Deneyen kişi sayısı', 'ulaşılan kişi sayısını')
  const accepted = list(values.offers).filter((r) => r.result === 'kabul').length
  over(accepted > 0 ? accepted : null, reached, 'Kabul eden kişi sayısı', 'ulaşılan kişi sayısını')
  over(count(values.priceAcceptedCount), reached, 'Fiyatı kabul eden kişi sayısı', 'ulaşılan kişi sayısını')
  over(count(values.matchedRequests), count(values.validRequests), 'Uygun teklif alan talep sayısı', 'geçerli talep sayısını')
  over(count(values.activeSellers), count(values.registeredSellers), 'Cevap veren satıcı sayısı', 'kayıtlı satıcı sayısını')
  over(count(values.beneficiaries), count(values.participants), 'Yararlanan kişi sayısı', 'katılan kişi sayısını')
  return issues
}

/** Tarih bugünden sonra mı? Boş tarih gelecek sayılmaz. */
export function isFuture(date: string | undefined, now = new Date()): boolean {
  if (!date) return false
  const pad = (n: number) => String(n).padStart(2, '0')
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  return date.slice(0, 10) > today
}
