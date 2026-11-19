/**
 * Proje modülünün kayıtları. Kayıtlar plana yazılmaz. Modül deposunda durur.
 * Anahtar biçimi: "<plan>/proje/<proje>" ve "<plan>/is/<iş>".
 */

/** İşin beş durumu. Sıra pano sütunlarının sırasıdır. */
export const IS_DURUMLARI = ['yapilacak', 'yapiliyor', 'takildi', 'bitti', 'iptal'] as const
export type IsDurumu = (typeof IS_DURUMLARI)[number]

/** Ekranda görünen durum adları. */
export const DURUM_ADI: Readonly<Record<IsDurumu, string>> = {
  yapilacak: 'Yapılacak',
  yapiliyor: 'Yapılıyor',
  takildi: 'Takıldı',
  bitti: 'Bitti',
  iptal: 'İptal',
}

export interface Proje {
  id: string
  planId: string
  ad: string
  /** Bağlı ana hamlenin ya da "Şimdi" işinin kalıcı satır kimliği. İsteğe bağlıdır. */
  moveRowId?: string
  /** "YYYY-AA-GG". Boş olabilir. */
  baslangic: string
  bitis: string
  sorumlu: string
  aciklama: string
  /** Açılış anı. ISO metni. */
  olusturma: string
}

export interface Is {
  id: string
  projeId: string
  baslik: string
  durum: IsDurumu
  sorumlu: string
  /** "YYYY-AA-GG". Boş olabilir. */
  sonTarih: string
  not: string
  /** Listedeki sıra. Küçük sayı önce gelir. */
  sira: number
}

/** Uzunluk ve sayı sınırları. İçe almada bu sınırları aşan dosya reddedilir. */
export const SINIR = {
  ad: 120,
  baslik: 200,
  sorumlu: 80,
  aciklama: 2000,
  not: 4000,
  kimlik: 100,
  projePerPlan: 200,
  isPerProje: 500,
} as const

/** Modül verisinin biçim sürümü. Bildirimdeki sürümle aynıdır. */
export const VERI_SURUMU = 1
