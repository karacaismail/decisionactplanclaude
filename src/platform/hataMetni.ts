/**
 * Kullanıcıya gösterilecek hata metnini seçer.
 * Uygulamanın kendi hatası Türkçe ve yalındır. Bu metin olduğu gibi gösterilir.
 * Tarayıcının depo hatası (DOMException) ve programlama hatası İngilizce olabilir. Bu durumda Türkçe yedek metin gösterilir.
 * Örnek: hataMetni(error, 'Görev kaydedilemedi. Önceki kayıt duruyor. Yeniden deneyin.')
 */
export function hataMetni(error: unknown, yedek: string): string {
  /* Yalnız uygulamanın kendi düz Error metni gösterilir. TypeError gibi programlama hataları İngilizcedir. */
  if (typeof DOMException !== 'undefined' && error instanceof DOMException) return yedek
  if (error instanceof Error && error.constructor === Error && error.message.trim()) return error.message
  return yedek
}
