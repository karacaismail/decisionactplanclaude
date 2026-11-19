/**
 * Ürün işareti: kapıya çıkan karar basamakları.
 * Basamaklar sıralı kararları, sağdaki çubuk kontrol kapısını anlatır.
 * Tek kaynak src/assets/brand/mark.svg dosyasıdır. Çizim birim testiyle eşit tutulur.
 */
export const BRAND_GLYPH = 'M5 17.5h4v-4h4v-4h3.5M19 5.5v13'

/** İşaretin çizgisi. Zemin kutusunu çevreleyen öğe çizer. Renk currentColor ile gelir. */
export function BrandMark() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true" focusable="false">
      <path d={BRAND_GLYPH} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
