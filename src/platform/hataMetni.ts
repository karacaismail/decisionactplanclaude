/**
 * Kullanıcıya gösterilecek hata metnini seçer.
 * Uygulamanın kendi hatası Türkçe ve yalındır. Bu metin olduğu gibi gösterilir.
 * Tarayıcının depo hatası (DOMException) İngilizce olabilir. Bu durumda Türkçe yedek metin gösterilir.
 * Örnek: hataMetni(error, 'Görev kaydedilemedi. Önceki kayıt duruyor. Yeniden deneyin.')
 */
export function hataMetni(error: unknown, yedek: string): string {
  if (typeof DOMException !== 'undefined' && error instanceof DOMException) return yedek
  if (error instanceof Error && error.message.trim()) return error.message
  return yedek
}
