/**
 * Son eklenen sayfalar "Yeni" etiketi taşır.
 * Etiket NEW_PAGES_UNTIL günü bitene kadar görünür. Tarih yerel saatle okunur.
 * Süreyi değiştirmek için yalnız bu tarihi değiştirin.
 */
export const NEW_PAGES_UNTIL = { year: 2026, month: 12, day: 18 } as const

/** 14 ve 15 Kasım 2026 günlerinde eklenen altı sayfa. */
export const NEW_PAGE_PATHS: readonly string[] = ['/gecis', '/devir', '/temel', '/varsayimlar', '/strateji', '/uygulama']

/** Sayfa yeni mi? Etiketin son günü dahildir. Ertesi gün 00.00'da etiket kalkar. */
export function isNewPage(path: string, now: Date = new Date()): boolean {
  if (!NEW_PAGE_PATHS.includes(path)) return false
  const { year, month, day } = NEW_PAGES_UNTIL
  const end = new Date(year, month - 1, day + 1, 0, 0, 0, 0)
  return now.getTime() < end.getTime()
}
