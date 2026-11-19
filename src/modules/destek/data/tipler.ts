/**
 * Destek kataloğunun tipleri. Saf TypeScript kodudur. React içe aktarmaz.
 * Her sayı bir Fact içinde durur. Fact, değeri kaynağı ve tarihiyle birlikte taşır.
 */

/** "2026-08-12" biçimindeki gün. */
export type IsoTarih = string

/**
 * Kaynaklı bilgi. Kaynağı olan değer "kaynakli" olur.
 * Kaynağı ya da değeri olmayan bilgi "bilinmiyor" olur. Bu durumda sourceUrl bakılacak resmî sayfadır.
 */
export type Fact<T> =
  | { state: 'kaynakli'; value: T; sourceUrl: string; asOf: IsoTarih }
  | { state: 'bilinmiyor'; value?: undefined; sourceUrl: string; asOf: IsoTarih }

export const KATEGORILER = ['hibe', 'ozsermaye', 'geri_odemeli', 'kredi', 'vergi_sgk', 'ag', 'katilimciya_odeme', 'kefalet', 'ayni'] as const
export type Kategori = (typeof KATEGORILER)[number]

/** Kaynaktaki durum. Ekran bunu bugünün tarihiyle yeniden yorumlar. Örneğin son günü geçen çağrı "Kapandı" olur. */
export const DURUMLAR = ['acik', 'cagri_bekleniyor', 'surekli', 'kapali', 'yururlukte'] as const
export type Durum = (typeof DURUMLAR)[number]

export const TAVAN_TURLERI = ['hibe_tavani', 'oransal', 'yok', 'kredi_anaparasi', 'program_butcesi'] as const
export type TavanTuru = (typeof TAVAN_TURLERI)[number]

/** İki programın birlikte kullanımı. Bu sürümde yalnız veri olarak saklanır. */
export const KOMBINASYONLAR = ['ayri_gider', 'uyumlu', 'onkosul', 'red_alternatifi', 'dislayici'] as const
export type Kombinasyon = (typeof KOMBINASYONLAR)[number]

export interface ProgramTarihi {
  ad: string
  tarih: Fact<IsoTarih>
  /** Kritik tarih başvurunun son günüdür. Bütün kritik tarihler geçince program "Kapandı" olur. */
  kritik: boolean
}

export interface Program {
  id: string
  ad: string
  kurum: string
  kategori: Kategori
  destekTuru: string
  /** Bir cümlelik yalın ve tarafsız özet. */
  ozet: string
  durum: Durum
  tutar: {
    /** Tutarı anlatan metin. Metindeki tutarlar eski bilgide gizlenir. */
    metin: Fact<string>
    /** Türk lirası olarak üst sınır. */
    tavanTL: Fact<number>
    tavanTuru: TavanTuru
  }
  tarihler: readonly ProgramTarihi[]
  /** Kim alabilir? */
  kosullar: readonly string[]
  /** Neyi öder? */
  uygunGider: readonly string[]
  /** Kapsamın dışında kalanlar. */
  haricGider: readonly string[]
  belgeler: readonly string[]
  kanal: string
  kaynak: { url: string; ad: string; asOf: IsoTarih }
  kombinasyon: Readonly<Partial<Record<string, Kombinasyon>>>
}
