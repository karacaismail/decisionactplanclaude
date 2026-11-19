/**
 * Destek profili. Plan profilinden ayrıdır ve plana yazılmaz.
 * Her soruda "Bilmiyorum" cevabı vardır. Cevaplanmayan soru alanı boş kalır.
 * Saf TypeScript kodudur.
 */

export const BILMIYORUM = 'bilmiyorum' as const
export type Bilmiyorum = typeof BILMIYORUM

export const NACE_BOLUMLERI = [
  { harf: 'A', ad: 'Tarım, ormancılık ve balıkçılık' },
  { harf: 'B', ad: 'Madencilik ve taş ocakçılığı' },
  { harf: 'C', ad: 'İmalat' },
  { harf: 'D', ad: 'Elektrik, gaz ve buhar üretimi' },
  { harf: 'E', ad: 'Su, atık ve çevre işleri' },
  { harf: 'F', ad: 'İnşaat' },
  { harf: 'G', ad: 'Toptan ve perakende ticaret, taşıt onarımı' },
  { harf: 'H', ad: 'Ulaştırma ve depolama' },
  { harf: 'I', ad: 'Konaklama ve yiyecek hizmeti' },
  { harf: 'J', ad: 'Bilgi ve iletişim' },
  { harf: 'K', ad: 'Finans ve sigorta' },
  { harf: 'L', ad: 'Gayrimenkul' },
  { harf: 'M', ad: 'Mesleki, bilimsel ve teknik işler' },
  { harf: 'N', ad: 'İdari ve destek hizmetleri' },
  { harf: 'O', ad: 'Kamu yönetimi ve savunma' },
  { harf: 'P', ad: 'Eğitim' },
  { harf: 'Q', ad: 'Sağlık ve sosyal hizmetler' },
  { harf: 'R', ad: 'Kültür, sanat, eğlence ve spor' },
  { harf: 'S', ad: 'Diğer hizmetler' },
  { harf: 'T', ad: 'Hane halkının işverenliği' },
  { harf: 'U', ad: 'Uluslararası kuruluşlar' },
] as const
export type NaceHarfi = (typeof NACE_BOLUMLERI)[number]['harf']
const NACE_HARFLERI = new Set<string>(NACE_BOLUMLERI.map((n) => n.harf))

export const ILLER = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya', 'Ardahan', 'Artvin', 'Aydın',
  'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale',
  'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir',
  'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkâri', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul', 'İzmir', 'Kahramanmaraş',
  'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kilis', 'Kırıkkale', 'Kırklareli', 'Kırşehir', 'Kocaeli',
  'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye',
  'Rize', 'Sakarya', 'Samsun', 'Şanlıurfa', 'Siirt', 'Sinop', 'Sivas', 'Şırnak', 'Tekirdağ', 'Tokat', 'Trabzon',
  'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak',
] as const
const IL_KUMESI = new Set<string>(ILLER)

export const IHRACAT_DURUMLARI = ['yok', 'yeni', 'duzenli'] as const
export type IhracatDurumu = (typeof IHRACAT_DURUMLARI)[number]

export const KURUCU_DURUMLARI = ['genc', 'kadin', 'engelli', 'gazi'] as const
export type KurucuDurumu = (typeof KURUCU_DURUMLARI)[number]

export type EvetHayir = 'evet' | 'hayir'

export interface Kurulus {
  yil: number
  /** 1 ile 12 arası. Ay bilinmiyorsa alan yoktur. */
  ay?: number
}

/** Boş alan, sorunun henüz sorulmadığını gösterir. "bilmiyorum" kişinin cevabıdır. */
export interface DestekProfili {
  il?: string | Bilmiyorum
  kurulus?: Kurulus | Bilmiyorum
  calisan?: number | Bilmiyorum
  ihracat?: IhracatDurumu | Bilmiyorum
  faaliyet?: readonly NaceHarfi[] | Bilmiyorum
  kosgeb?: EvetHayir | Bilmiyorum
  arge?: EvetHayir | Bilmiyorum
  /** Boş liste "hiçbiri" demektir. */
  kurucu?: readonly KurucuDurumu[] | Bilmiyorum
}

export type Alan = keyof DestekProfili

/** Soruların sırası. Sihirbaz bu sırayla en çok beş soru sorar. */
export const SORU_SIRASI: readonly Alan[] = ['kurulus', 'calisan', 'faaliyet', 'ihracat', 'arge', 'kosgeb', 'kurucu', 'il']
export const SIHIRBAZ_EN_COK_SORU = 5

export const EN_ESKI_KURULUS_YILI = 1900

/** Alan cevaplanmadı ya da cevap "Bilmiyorum" mu? */
export function bilinmiyor(profil: DestekProfili, alan: Alan): boolean {
  const v = profil[alan]
  return v === undefined || v === BILMIYORUM
}

export function cevaplandi(profil: DestekProfili, alan: Alan): boolean {
  return profil[alan] !== undefined
}

const tamSayi = (v: unknown, min: number, max: number): v is number => typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max

/** Kuruluş tarihi bugünden sonra olamaz. Bugün "2026-11-19" biçiminde verilir. */
export function kurulusGecerli(k: { yil: number; ay?: number }, bugun: string): boolean {
  const [by, bm] = bugun.split('-').map(Number)
  if (!tamSayi(k.yil, EN_ESKI_KURULUS_YILI, by)) return false
  if (k.ay === undefined) return true
  return tamSayi(k.ay, 1, 12) && (k.yil < by || k.ay <= bm)
}

/**
 * Depodan ya da dosyadan gelen değeri profile çevirir. Geçersiz alan atılır.
 * Bugünün tarihi verilir. Gelecekteki bir kuruluş tarihi atılır.
 */
export function profilOku(value: unknown, bugun: string): DestekProfili {
  const p: DestekProfili = {}
  if (!value || typeof value !== 'object' || Array.isArray(value)) return p
  const v = value as Record<string, unknown>
  if (v.il === BILMIYORUM || (typeof v.il === 'string' && IL_KUMESI.has(v.il))) p.il = v.il
  if (v.kurulus === BILMIYORUM) p.kurulus = BILMIYORUM
  else if (v.kurulus && typeof v.kurulus === 'object') {
    const k = v.kurulus as Record<string, unknown>
    const aday = typeof k.yil === 'number' ? (k.ay === undefined ? { yil: k.yil } : { yil: k.yil, ay: k.ay as number }) : undefined
    if (aday && kurulusGecerli(aday, bugun)) p.kurulus = aday
  }
  if (v.calisan === BILMIYORUM || tamSayi(v.calisan, 0, 1_000_000)) p.calisan = v.calisan
  if (v.ihracat === BILMIYORUM || IHRACAT_DURUMLARI.includes(v.ihracat as IhracatDurumu)) p.ihracat = v.ihracat as DestekProfili['ihracat']
  if (v.faaliyet === BILMIYORUM) p.faaliyet = BILMIYORUM
  else if (Array.isArray(v.faaliyet) && v.faaliyet.length && v.faaliyet.every((h) => typeof h === 'string' && NACE_HARFLERI.has(h))) {
    p.faaliyet = [...new Set(v.faaliyet as NaceHarfi[])]
  }
  for (const alan of ['kosgeb', 'arge'] as const) {
    if (v[alan] === BILMIYORUM || v[alan] === 'evet' || v[alan] === 'hayir') p[alan] = v[alan] as EvetHayir | Bilmiyorum
  }
  if (v.kurucu === BILMIYORUM) p.kurucu = BILMIYORUM
  else if (Array.isArray(v.kurucu) && v.kurucu.every((k) => KURUCU_DURUMLARI.includes(k as KurucuDurumu))) {
    p.kurucu = [...new Set(v.kurucu as KurucuDurumu[])]
  }
  return p
}

/** Sihirbazın soracağı sorular. Cevaplanmamış sorular sırayla gelir. En çok beş soru olur. */
export function sorulacaklar(profil: DestekProfili, istenen?: readonly Alan[]): Alan[] {
  const liste = istenen ?? SORU_SIRASI.filter((a) => !cevaplandi(profil, a))
  return SORU_SIRASI.filter((a) => liste.includes(a)).slice(0, SIHIRBAZ_EN_COK_SORU)
}

/** Profilde en az bir cevap var mı? */
export function profilDoluMu(profil: DestekProfili): boolean {
  return SORU_SIRASI.some((a) => cevaplandi(profil, a))
}

/**
 * İşletmenin ay olarak yaşı. Gün bilinmediği için aralık döner.
 * Ay bilinmiyorsa aralık bir yıl genişler.
 */
export function yasAraligiAy(kurulus: Kurulus, bugun: string): { min: number; max: number } {
  const [by, bm] = bugun.split('-').map(Number)
  const tamYil = (by - kurulus.yil) * 12
  if (kurulus.ay) {
    const fark = tamYil + bm - kurulus.ay
    return { min: Math.max(0, fark - 1), max: Math.max(0, fark) }
  }
  return { min: Math.max(0, tamYil + bm - 13), max: Math.max(0, tamYil + bm - 1) }
}
