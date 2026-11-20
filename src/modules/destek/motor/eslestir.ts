/**
 * Ön eşleşme. Saf işlevdir. Uygulamanın verdiği ilk tahmindir. Kesin kararı kurum verir.
 * Üç sonuç vardır: "uygun", "belki" ve "uygun_degil".
 * Bilinmeyen bilgi hiçbir zaman "uygun" sonucunu vermez. Uygulamanın denetlemediği koşul da bilinmeyen bilgidir.
 * Bu yüzden "uygun" yalnız eksiksiz kural setinde çıkar. Tutar hesaplanmaz. Programlar puanlanmaz.
 */
import type { FaydaTuru, IsoTarih, Program } from '../data/tipler'
import { KURALLAR, type KuralSeti } from './kurallar'
import { cevaplandi, SORU_SIRASI, type Alan, type DestekProfili, type DestekTercihi } from './profil'

export type EslesmeSonucu = 'uygun' | 'belki' | 'uygun_degil'

export interface Eslesme {
  programId: string
  sonuc: EslesmeSonucu
  /** Sonucun nedenleri. Uygun değilse tutmayan koşul yazar. */
  nedenler: string[]
  /** Cevaplanırsa sonucu netleştirecek sorular. */
  sonrakiSorular: Alan[]
  /** Uygulamanın denetlediği koşullar. */
  denetlenenKosullar: string[]
  /** Programın denetlenebilen bir koşulu var mı? */
  kuralVar: boolean
  /** Sorulan bütün koşullar tuttu mu? Kural seti eksiksiz değilse sonuç yine "belki" olur. */
  sorulanlarTuttu: boolean
  /** Tutan kuralların okuduğu alanlar. Örneğin iş kolu kuralı tuttuysa "faaliyet" burada durur. */
  tutanAlanlar: Alan[]
}

export const KOSULLARI_OKUYUN = 'Koşulları kendiniz okuyun.'
export const OTEKI_KOSULLAR = 'Sorduğumuz koşulları karşılıyorsunuz. Öteki koşulları kurumun sayfasında okuyun.'

type KuralHaritasi = Readonly<Record<string, KuralSeti>>

export const KALDIRILDI_NEDENI = 'Bu program kaldırıldı. Yeni başvuru alınmaz.'

export function eslestir(program: Program, profil: DestekProfili, bugun: IsoTarih, kuralHaritasi: KuralHaritasi = KURALLAR): Eslesme {
  /* Kurum programı kaldırdıysa hiçbir profil bu programa başvuramaz. */
  if (program.durum === 'kaldirildi') {
    return { programId: program.id, sonuc: 'uygun_degil', nedenler: [KALDIRILDI_NEDENI], sonrakiSorular: [], denetlenenKosullar: [], kuralVar: false, sorulanlarTuttu: false, tutanAlanlar: [] }
  }
  const set = kuralHaritasi[program.id]
  const kurallar = set?.kurallar ?? []
  if (!kurallar.length) {
    return { programId: program.id, sonuc: 'belki', nedenler: [KOSULLARI_OKUYUN], sonrakiSorular: [], denetlenenKosullar: [], kuralVar: false, sorulanlarTuttu: false, tutanAlanlar: [] }
  }
  const kesinRet: string[] = []
  const belirsiz: string[] = []
  const sorular = new Set<Alan>()
  const tutan = new Set<Alan>()
  for (const kural of kurallar) {
    const r = kural.denetle(profil, bugun)
    if (r.durum === 'gecti') for (const a of kural.alanlar) tutan.add(a)
    else if (r.durum === 'kaldi') (kural.kesin ? kesinRet : belirsiz).push(r.neden)
    else if (r.durum === 'bilinmiyor') {
      belirsiz.push(r.neden)
      if (r.alan) sorular.add(r.alan)
    }
  }
  const denetlenenKosullar = kurallar.map((k) => k.kosul)
  const base = { programId: program.id, denetlenenKosullar, kuralVar: true, tutanAlanlar: SORU_SIRASI.filter((a) => tutan.has(a)) }
  if (kesinRet.length) return { ...base, sonuc: 'uygun_degil', nedenler: kesinRet, sonrakiSorular: [], sorulanlarTuttu: false }
  if (belirsiz.length) return { ...base, sonuc: 'belki', nedenler: belirsiz, sonrakiSorular: SORU_SIRASI.filter((a) => sorular.has(a)), sorulanlarTuttu: false }
  /* Denetlenmeyen koşul bilinmeyen bilgidir. Bu yüzden eksiksiz olmayan sette sonuç "belki" olur. */
  if (!set?.eksiksiz) return { ...base, sonuc: 'belki', nedenler: [OTEKI_KOSULLAR], sonrakiSorular: [], sorulanlarTuttu: true }
  return { ...base, sonuc: 'uygun', nedenler: [], sonrakiSorular: [], sorulanlarTuttu: true }
}

export interface EslesmeGruplari {
  uygun: Eslesme[]
  belki: Eslesme[]
  uygunDegil: Eslesme[]
}

/** Bütün programları eşleştirir. Her grup katalog sırasını korur. */
export function eslestirHepsi(programlar: readonly Program[], profil: DestekProfili, bugun: IsoTarih, kuralHaritasi: KuralHaritasi = KURALLAR): EslesmeGruplari {
  const gruplar: EslesmeGruplari = { uygun: [], belki: [], uygunDegil: [] }
  for (const program of programlar) {
    const e = eslestir(program, profil, bugun, kuralHaritasi)
    if (e.sonuc === 'uygun') gruplar.uygun.push(e)
    else if (e.sonuc === 'belki') gruplar.belki.push(e)
    else gruplar.uygunDegil.push(e)
  }
  return gruplar
}

/** Sonuçları netleştirecek sorular. Soru sırasıyla ve tekrarsız gelir. */
export function sonrakiSorular(eslesmeler: readonly Eslesme[]): Alan[] {
  const alanlar = new Set(eslesmeler.flatMap((e) => e.sonrakiSorular))
  return SORU_SIRASI.filter((a) => alanlar.has(a))
}


/**
 * İkinci katman: "Sonucu netleştirin" kartının soruları.
 * Yalnız "Belki" sonucunu netleştiren ve henüz cevaplanmamış sorular gelir. "Bilmiyorum" da bir cevaptır.
 */
export function netlestirmeSorulari(gruplar: EslesmeGruplari, profil: DestekProfili): Alan[] {
  return sonrakiSorular(gruplar.belki).filter((a) => !cevaplandi(profil, a))
}

/**
 * Sonuç listesinin altındaki not. Liste "Uygun" ve "Belki" programlarından oluşur.
 * Liste boşsa "bos" döner. Liste boş değilse ve iş koluna özel program yoksa "iseOzelYok" döner.
 * "iseOzelYok" yalnız kişi iş kolunu seçtiyse döner.
 */
export function sonucNotu(gruplar: EslesmeGruplari, profil: DestekProfili): 'bos' | 'iseOzelYok' | undefined {
  const liste = [...gruplar.uygun, ...gruplar.belki]
  if (!liste.length) return 'bos'
  if (!Array.isArray(profil.faaliyet) || !profil.faaliyet.length) return undefined
  return liste.some((e) => e.tutanAlanlar.includes('faaliyet')) ? undefined : 'iseOzelYok'
}

/** Kredi istemeyen kişiye uymayan faydalar. Faiz desteği bir krediye bağlıdır. Kefalet ayrı bir türdür. */
const KREDI_FAYDALARI: readonly FaydaTuru[] = ['kredi', 'faiz']
const HISSE_FAYDALARI: readonly FaydaTuru[] = ['ortaklik']

/**
 * Üçüncü katman: tercih süzgeci. Süzgeç programın fayda türlerine bakar.
 * Programın bütün faydaları istenmeyen türdeyse program tercihe uymaz.
 * Örneğin kredi istemeyen kişi için yalnız kredi veren program uymaz. Hibe de veren program uyar.
 * Süzgeç sonucu değiştirmez. Yalnız sırayı değiştirir.
 */
export function tercihUymuyor(program: Pick<Program, 'faydalar'>, tercih: DestekTercihi | undefined): boolean {
  if (!tercih || !program.faydalar.length) return false
  const istenmeyen = new Set<FaydaTuru>([...(tercih.krediIstemiyorum ? KREDI_FAYDALARI : []), ...(tercih.hisseIstemiyorum ? HISSE_FAYDALARI : [])])
  return program.faydalar.every((f) => istenmeyen.has(f))
}

/** Tercihe uymayan programlar aynı grupta kalır ve sona geçer. İki bölüm de katalog sırasını korur. */
export function tercihSirala(eslesmeler: readonly Eslesme[], programlar: ReadonlyMap<string, Pick<Program, 'faydalar'>>, tercih: DestekTercihi | undefined): Eslesme[] {
  const uymaz = (e: Eslesme) => {
    const p = programlar.get(e.programId)
    return p ? tercihUymuyor(p, tercih) : false
  }
  return [...eslesmeler.filter((e) => !uymaz(e)), ...eslesmeler.filter(uymaz)]
}
