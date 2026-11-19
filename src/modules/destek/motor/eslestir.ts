/**
 * Ön eşleşme. Saf işlevdir. Uygulamanın verdiği ilk tahmindir. Kesin kararı kurum verir.
 * Üç sonuç vardır: "uygun", "belki" ve "uygun_degil".
 * Bilinmeyen bilgi hiçbir zaman "uygun" sonucunu vermez. Uygulamanın denetlemediği koşul da bilinmeyen bilgidir.
 * Bu yüzden "uygun" yalnız eksiksiz kural setinde çıkar. Tutar hesaplanmaz. Programlar puanlanmaz.
 */
import type { IsoTarih, Program } from '../data/tipler'
import { KURALLAR, type KuralSeti } from './kurallar'
import { cevaplandi, SORU_SIRASI, type Alan, type DestekProfili } from './profil'

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
}

export const KOSULLARI_OKUYUN = 'Koşulları kendiniz okuyun.'
export const OTEKI_KOSULLAR = 'Sorduğumuz koşulları karşılıyorsunuz. Öteki koşulları kurumun sayfasında okuyun.'

type KuralHaritasi = Readonly<Record<string, KuralSeti>>

export function eslestir(program: Program, profil: DestekProfili, bugun: IsoTarih, kuralHaritasi: KuralHaritasi = KURALLAR): Eslesme {
  const set = kuralHaritasi[program.id]
  const kurallar = set?.kurallar ?? []
  if (!kurallar.length) {
    return { programId: program.id, sonuc: 'belki', nedenler: [KOSULLARI_OKUYUN], sonrakiSorular: [], denetlenenKosullar: [], kuralVar: false, sorulanlarTuttu: false }
  }
  const kesinRet: string[] = []
  const belirsiz: string[] = []
  const sorular = new Set<Alan>()
  for (const kural of kurallar) {
    const r = kural.denetle(profil, bugun)
    if (r.durum === 'kaldi') (kural.kesin ? kesinRet : belirsiz).push(r.neden)
    else if (r.durum === 'bilinmiyor') {
      belirsiz.push(r.neden)
      if (r.alan) sorular.add(r.alan)
    }
  }
  const denetlenenKosullar = kurallar.map((k) => k.kosul)
  const base = { programId: program.id, denetlenenKosullar, kuralVar: true }
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

/** Henüz sorulmamış ve sonucu netleştirecek sorular. "Bilmiyorum" cevabı yeniden sorulmaz. */
export function sorulmamisSorular(eslesmeler: readonly Eslesme[], profil: DestekProfili): Alan[] {
  return sonrakiSorular(eslesmeler).filter((a) => !cevaplandi(profil, a))
}
