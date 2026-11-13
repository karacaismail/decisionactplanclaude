const DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

/** "13 Kasım 2026 Cuma günü" biçimi. Yalnız sayıyla tarih yazılmaz. */
export function formatDate(iso?: string, withDay = true): string {
  if (!iso) return 'Tarih belirlenmedi'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'Tarih belirlenmedi'
  const base = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
  return withDay ? `${base} ${DAYS[d.getDay()]} günü` : base
}

/** Kuruş cinsinden tam sayıyı "1.250,50 TL" olarak gösterir. */
export function formatMoney(kurus?: number | null): string {
  if (kurus === null || kurus === undefined || Number.isNaN(kurus)) return 'Bilinmiyor'
  const sign = kurus < 0 ? '-' : ''
  const abs = Math.abs(kurus)
  const lira = Math.floor(abs / 100)
  const k = abs % 100
  return `${sign}${lira.toLocaleString('tr-TR')},${k.toString().padStart(2, '0')} TL`
}

export function parseMoneyToKurus(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined || input === '') return null
  if (typeof input === 'number') return Math.round(input * 100)
  const cleaned = input.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
  const n = Number(cleaned)
  return Number.isNaN(n) ? null : Math.round(n * 100)
}

export function formatNumber(n?: number | null, unit?: string): string {
  if (n === null || n === undefined || Number.isNaN(n)) return 'Bilinmiyor'
  return `${n.toLocaleString('tr-TR')}${unit ? ' ' + unit : ''}`
}

export function uid(prefix = 'k'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
