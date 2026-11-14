/**
 * Yöntem yardımı: "Nasıl uygulanır" adımları, "Dikkat" uyarısı ve "İpucu".
 * Metinler Karar Kitabı'ndan alındı ve yalın dille yeniden yazıldı.
 * Veri ayrı bir dosyadadır. Tarayıcı bu dosyayı yalnız yardım paneli açılınca indirir.
 */
export interface HowTo {
  g: number
  steps: { title: string; text: string }[]
  warn: string[]
  tip: string[]
}

let cache: Promise<Map<number, HowTo>> | null = null

export function loadHowTo(): Promise<Map<number, HowTo>> {
  cache ??= import('./models-howto.json').then((m) => new Map((m.default as HowTo[]).map((h) => [h.g, h])))
  /* İndirme başarısız olursa sonraki açılış yeniden dener. */
  cache.catch(() => {
    cache = null
  })
  return cache
}
