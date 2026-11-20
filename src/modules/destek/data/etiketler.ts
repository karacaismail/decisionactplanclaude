/**
 * Program etiketleri. Kaynak: 20 Kasım 2026 Cuma günkü doğrulamanın "bolge" ve "ozelKurum" alanları.
 * Bölgesel program yalnız belli bir il ya da bölgedeki başvuruya açıktır.
 * Tek kuruma bağlı özel program bir kurumun kendi işi için açtığı programdır. Örneğin deneme bir belediye ile yapılır.
 * "Destek değil" bilgisi fayda türünden gelir. Bu yüzden burada durmaz.
 */
const BOLGE: Readonly<Record<string, string>> = {
  istka: 'İstanbul',
  techIstanbul: 'İstanbul',
}

const OZEL_KURUM = new Set(['techIstanbul', 'ekip'])

export const OZEL_KURUM_ETIKETI = 'Tek kuruma bağlı özel program'

export function programEtiketleri(id: string): string[] {
  const etiketler: string[] = []
  if (BOLGE[id]) etiketler.push(`Yalnız belli il veya bölge: ${BOLGE[id]}`)
  if (OZEL_KURUM.has(id)) etiketler.push(OZEL_KURUM_ETIKETI)
  return etiketler
}
