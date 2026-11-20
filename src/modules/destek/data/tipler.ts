/**
 * Destek kataloğunun tipleri. Saf TypeScript kodudur. React içe aktarmaz.
 * Her sayı bir Fact içinde durur. Fact, değeri kaynağı ve tarihiyle birlikte taşır.
 */

/** "2026-08-12" biçimindeki gün. */
export type IsoTarih = string

/**
 * Kaynaklı bilgi. Kaynağı olan değer "kaynakli" olur.
 * Kaynağı ya da değeri olmayan bilgi "bilinmiyor" olur. Bu durumda sourceUrl bakılacak resmî sayfadır.
 * alinti, kaynaktaki sözün kendisidir. Bazı değerler yalnız tablo hücresinde yazar. Bu değerlerde alıntı yoktur.
 * ikincil, değerin resmî olmayan bir kaynaktan geldiğini gösterir. Ekran bu değeri işaretler.
 */
export type Fact<T> =
  | { state: 'kaynakli'; value: T; sourceUrl: string; asOf: IsoTarih; alinti?: string; ikincil?: true }
  | { state: 'bilinmiyor'; value?: undefined; sourceUrl: string; asOf: IsoTarih; alinti?: undefined; ikincil?: undefined }

export const KATEGORILER = ['hibe', 'ozsermaye', 'geri_odemeli', 'kredi', 'vergi_sgk', 'ag', 'katilimciya_odeme', 'kefalet', 'ayni'] as const
export type Kategori = (typeof KATEGORILER)[number]

/**
 * Kaynaktaki durum. Ekran bunu bugünün tarihiyle yeniden yorumlar. Örneğin son günü geçen çağrı "Kapandı" olur.
 * Kurum programı yürürlükten kaldırdıysa durum "kaldirildi" olur.
 */
export const DURUMLAR = ['acik', 'cagri_bekleniyor', 'surekli', 'kapali', 'yururlukte', 'kaldirildi'] as const
export type Durum = (typeof DURUMLAR)[number]

export const TAVAN_TURLERI = ['hibe_tavani', 'oransal', 'yok', 'kredi_anaparasi', 'program_butcesi'] as const
export type TavanTuru = (typeof TAVAN_TURLERI)[number]

/** İki programın birlikte kullanımı. Ekrandaki yalın açıklamalar metinler.ts dosyasındadır. */
export const KOMBINASYONLAR = ['ayri_gider', 'uyumlu', 'onkosul', 'red_alternatifi', 'dislayici'] as const
export type Kombinasyon = (typeof KOMBINASYONLAR)[number]

export interface KombinasyonKurali {
  digerProgramId: string
  iliski: Fact<Kombinasyon>
  yonlu: boolean
}

export type FaydaTuru = 'hibe' | 'vergi_sgk' | 'faiz' | 'kredi' | 'ortaklik' | 'kefalet' | 'hizmet' | 'destek_degil'

export interface KurumSorusu {
  id: string
  grup: string
  soru: string
  faydalar?: readonly FaydaTuru[]
}

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
    /** Tutarı ve oranı anlatan kaynaklı metin. */
    metin: Fact<string>
    /** Türk lirası olarak üst sınır. */
    tavanTL: Fact<number>
    tavanTuru: TavanTuru
    /** Destek oranını anlatan kaynaklı metin. Kaynakta oran yoksa alan yoktur. */
    oran?: Fact<string>
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
  /** asOf, kartın son kontrol günüdür. Doğrulanan alanlar bu günü taşır. */
  kaynak: { url: string; ad: string; asOf: IsoTarih }
  /**
   * Serbest metinlerin son kontrol günü. Koşullar, giderler, belgeler ve başvuru yolu bu metinlerdir.
   * Bu metinler alan alan doğrulanmadı. İçlerindeki sayı bu güne göre eskir.
   */
  metinKontrol: IsoTarih
  kombinasyon: readonly KombinasyonKurali[]
  faydalar: readonly FaydaTuru[]
  faydaTavanlari?: Readonly<Partial<Record<FaydaTuru, Fact<number>>>>
  sure: { degerlendirme: Fact<string>; ilkOdeme: Fact<string> }
  odemeBicimi: Fact<string>
}

/** JSON katalog dosyasındaki kayıt. Fayda türleri faydalar.ts dosyasından eklenir. */
export type KatalogKaydi = Omit<Program, 'faydalar'>

export const BELGE_ASAMALARI = ['basvuru', 'odeme', 'izleme'] as const
export type BelgeAsamasi = (typeof BELGE_ASAMALARI)[number]

/**
 * Konsey planı B.1: birçok başvuruda istenen ortak belge.
 * kurulusSonrasi, belgenin ancak işletme kurulduktan sonra alınabildiğini gösterir.
 * sureli, belgenin bir geçerlilik tarihi olduğunu gösterir. Tarihi kişi kendisi yazar. Uygulama gün sınırı koymaz.
 */
export interface OrtakBelge {
  id: string
  ad: string
  aciklama: string
  asama: BelgeAsamasi
  kurulusSonrasi: boolean
  sureli: boolean
}

/** Belge ve kanıt listesindeki tek madde. */
export interface KanitMaddesi {
  id: string
  ad: string
  /** Belgenin neden gerektiğini anlatan tek cümle. */
  neden: string
  /** Sözlükteki terimin kimliği. Ekran terimin anlamına bağlantı verir. */
  terim?: string
}

export interface KanitGrubu {
  id: string
  ad: string
  maddeler: readonly KanitMaddesi[]
}

/** Genel gider türü. Bu gideri ödeyen programlar GiderEslesme kayıtlarından gelir. Liste ilk rehberdir, söz değildir. */
export interface GiderKalemi {
  id: string
  ad: string
  not?: string
  terim?: string
}

/**
 * Bir gider ile bir program arasındaki bağ. kanitMetni katalogdaki metinle birebir aynıdır.
 * tur "uygun" ise metin programın uygunGider listesindedir. tur "haric" ise metin haricGider listesindedir.
 * Dizi sırası kullanılmaz. Katalog metni değişirse test bağın koptuğunu yakalar.
 */
export interface GiderEslesme {
  giderId: string
  programId: string
  tur: 'uygun' | 'haric'
  kanitMetni: string
}

export interface Terim {
  id: string
  ad: string
  anlam: string
  esAnlamlilar?: readonly string[]
  /** Program ekranlarındaki kısa terim listesinde de görünür. */
  temel?: boolean
}
