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

/** İşletme kuruldu mu? Kuruluş tarihi yalnız "kuruldu" cevabından sonra sorulur. */
export const KURULUS_DURUMLARI = ['kuruldu', 'kurulmadi'] as const
export type KurulusDurumu = (typeof KURULUS_DURUMLARI)[number]

/** Ölçek kişinin kendi seçimidir. Uygulama ölçeği çalışan sayısından hesaplamaz. Eşiği kurumun resmî tanımı belirler. */
export const OLCEKLER = ['mikro', 'kucuk', 'orta', 'buyuk'] as const
export type Olcek = (typeof OLCEKLER)[number]

/**
 * İşletmenin hukuki türü. Katalogda ayrı koşulu olan her tür ayrı seçenektir.
 * "secilmedi" bilinmeyen sayılır. "diger" yalnız koşul onu kesin dışarıda bırakıyorsa çözülür.
 */
export const ISLETME_TURLERI = ['sahis', 'limited', 'anonim', 'kooperatif', 'diger', 'secilmedi'] as const
export type IsletmeTuru = (typeof ISLETME_TURLERI)[number]

/**
 * Üçüncü katman: tercih süzgeci. Süzgeç yalnız sırayı ve görünümü değiştirir.
 * Hiçbir programı "Uygun değil" yapmaz. Bu yüzden eşleşme kuralları tercihi okumaz.
 */
export interface DestekTercihi {
  krediIstemiyorum?: boolean
  hisseIstemiyorum?: boolean
}

export interface Kurulus {
  yil: number
  /** 1 ile 12 arası. Ay bilinmiyorsa alan yoktur. */
  ay?: number
}

/** Boş alan, sorunun henüz sorulmadığını gösterir. "bilmiyorum" kişinin cevabıdır. */
export interface DestekProfili {
  kurulusDurumu?: KurulusDurumu | Bilmiyorum
  olcek?: Olcek | Bilmiyorum
  isletmeTuru?: IsletmeTuru | Bilmiyorum
  il?: string | Bilmiyorum
  kurulus?: Kurulus | Bilmiyorum
  calisan?: number | Bilmiyorum
  ihracat?: IhracatDurumu | Bilmiyorum
  faaliyet?: readonly NaceHarfi[] | Bilmiyorum
  kosgeb?: EvetHayir | Bilmiyorum
  arge?: EvetHayir | Bilmiyorum
  /** Boş liste "hiçbiri" demektir. */
  kurucu?: readonly KurucuDurumu[] | Bilmiyorum
  tercih?: DestekTercihi
}

/** Soru alanları. Tercih süzgeci soru değildir. */
export type Alan = Exclude<keyof DestekProfili, 'tercih'>

/**
 * Soruların sırası. İlk beş soru temel akıştır. Öteki sorular ikinci katmandır.
 * İkinci katmandaki soru yalnız bir "Belki" sonucunu netleştirecekse sorulur.
 */
export const SORU_SIRASI: readonly Alan[] = ['kurulusDurumu', 'kurulus', 'olcek', 'isletmeTuru', 'faaliyet', 'calisan', 'ihracat', 'arge', 'kosgeb', 'kurucu', 'il']
export const SIHIRBAZ_EN_COK_SORU = 5
/** Temel akış. Kuruluş tarihi yalnız işletme kurulduysa sorulur. */
export const TEMEL_SORULAR: readonly Alan[] = SORU_SIRASI.slice(0, SIHIRBAZ_EN_COK_SORU)

export const EN_ESKI_KURULUS_YILI = 1900

/** Alan cevaplanmadı ya da cevap "Bilmiyorum" mu? İşletme türünde "henüz seçilmedi" de bilinmeyen sayılır. */
export function bilinmiyor(profil: DestekProfili, alan: Alan): boolean {
  const v = profil[alan]
  return v === undefined || v === BILMIYORUM || (alan === 'isletmeTuru' && v === 'secilmedi')
}

/**
 * İşletmenin kuruluş durumu. Eski profillerde bu alan yoktur.
 * Eski profilde kuruluş tarihi varsa işletme kurulmuş sayılır.
 */
export function kurulusDurumuOf(profil: DestekProfili): KurulusDurumu | undefined {
  if (profil.kurulusDurumu === 'kuruldu' || profil.kurulusDurumu === 'kurulmadi') return profil.kurulusDurumu
  if (profil.kurulusDurumu === undefined && profil.kurulus && profil.kurulus !== BILMIYORUM) return 'kuruldu'
  return undefined
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
  const secenek = <T extends string>(deger: unknown, liste: readonly T[]): deger is T | Bilmiyorum => deger === BILMIYORUM || liste.includes(deger as T)
  if (secenek(v.kurulusDurumu, KURULUS_DURUMLARI)) p.kurulusDurumu = v.kurulusDurumu
  if (secenek(v.olcek, OLCEKLER)) p.olcek = v.olcek
  if (secenek(v.isletmeTuru, ISLETME_TURLERI)) p.isletmeTuru = v.isletmeTuru
  if (v.tercih && typeof v.tercih === 'object' && !Array.isArray(v.tercih)) {
    const t = v.tercih as Record<string, unknown>
    const tercih: DestekTercihi = {}
    let gecerli = true
    for (const ad of ['krediIstemiyorum', 'hisseIstemiyorum'] as const) {
      if (t[ad] === undefined) continue
      if (typeof t[ad] === 'boolean') tercih[ad] = t[ad]
      else gecerli = false
    }
    if (gecerli && Object.keys(tercih).length) p.tercih = tercih
  }
  return p
}

/** Kuruluş tarihi yalnız işletme kurulduysa sorulur. */
export const tarihSorulur = (profil: DestekProfili) => profil.kurulusDurumu === undefined || profil.kurulusDurumu === 'kuruldu'

/**
 * Sihirbazın soracağı sorular. İstenen liste yoksa temel akışın cevaplanmamış soruları gelir.
 * Sorular soru sırasıyla gelir. En çok beş soru olur.
 */
export function sorulacaklar(profil: DestekProfili, istenen?: readonly Alan[]): Alan[] {
  const liste = istenen ?? TEMEL_SORULAR.filter((a) => !cevaplandi(profil, a))
  return SORU_SIRASI.filter((a) => liste.includes(a) && (a !== 'kurulus' || tarihSorulur(profil))).slice(0, SIHIRBAZ_EN_COK_SORU)
}

/**
 * Bir cevaptan sonra soru listesini günceller. i, cevaplanan sorunun sırasıdır.
 * İşletme kurulmadıysa ya da kişi bilmiyorsa kuruluş tarihi sorusu çıkar.
 * İşletme kurulduysa ve tarih bilinmiyorsa tarih sorusu hemen arkaya eklenir.
 */
export function akisiGuncelle(sorular: readonly Alan[], i: number, profil: DestekProfili): Alan[] {
  if (sorular[i] !== 'kurulusDurumu') return [...sorular]
  const once = sorular.slice(0, i + 1)
  const sonra = sorular.slice(i + 1).filter((a) => a !== 'kurulus')
  if (profil.kurulusDurumu !== 'kuruldu') return [...once, ...sonra]
  if (sorular.includes('kurulus') || !cevaplandi(profil, 'kurulus')) return [...once, 'kurulus', ...sonra]
  return [...once, ...sonra]
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
