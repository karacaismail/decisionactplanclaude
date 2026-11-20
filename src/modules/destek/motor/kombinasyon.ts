/**
 * İki programın birlikte kullanımı. Saf TypeScript kodudur.
 * Bilgi yalnız katalogdaki "kombinasyon" verisinden gelir. Uygulama ilişki tahmin etmez.
 * Kayıt iki yönden okunur. Bir programın kaydı öteki programı anabilir. Öteki programın kaydı da ilkini anabilir.
 * İki kayıt farklıysa daha sıkı olan önce gelir. Ekran öteki kaydı da söyler.
 */
import type { Kombinasyon, Program } from '../data/tipler'

/** En sıkı ilişkiden en gevşeğe. */
export const KOMBINASYON_SIRASI: readonly Kombinasyon[] = ['dislayici', 'ayri_gider', 'onkosul', 'red_alternatifi', 'uyumlu']

export interface Iliski {
  tur: Kombinasyon
  /** Öteki programın kaydı farklıysa o kayıt. */
  farkli?: Kombinasyon
}

const sira = (t: Kombinasyon) => KOMBINASYON_SIRASI.indexOf(t)

/** İki programın ilişkisi. Kaynakta kayıt yoksa undefined döner. Ekran bunu "Bilgi yok" diye yazar. */
export function iliskiBul(a: Program | undefined, b: Program | undefined): Iliski | undefined {
  if (!a || !b) return undefined
  const turler = [...new Set([a.kombinasyon[b.id], b.kombinasyon[a.id]].filter((t): t is Kombinasyon => t !== undefined))].sort((x, y) => sira(x) - sira(y))
  if (!turler.length) return undefined
  return turler.length === 1 ? { tur: turler[0] } : { tur: turler[0], farkli: turler[1] }
}

/** Uyarı gereken ilişki. Biri birlikte kullanmayı yasaklar. Öteki ayrı gider ister. */
export function uyariMi(iliski: Iliski | undefined): boolean {
  if (!iliski) return false
  return [iliski.tur, iliski.farkli].some((t) => t === 'dislayici' || t === 'ayri_gider')
}

export interface IliskiGrubu {
  tur: Kombinasyon
  programlar: { program: Program; farkli?: Kombinasyon }[]
}

/** Program ekranı için ilişkiler. Gruplar sıkıdan gevşeğe, programlar ada göre dizilir. */
export function programIliskileri(program: Program, katalog: readonly Program[]): IliskiGrubu[] {
  const gruplar = new Map<Kombinasyon, IliskiGrubu['programlar']>()
  for (const diger of katalog) {
    if (diger.id === program.id) continue
    const iliski = iliskiBul(program, diger)
    if (!iliski) continue
    const liste = gruplar.get(iliski.tur) ?? []
    liste.push(iliski.farkli ? { program: diger, farkli: iliski.farkli } : { program: diger })
    gruplar.set(iliski.tur, liste)
  }
  return KOMBINASYON_SIRASI.filter((t) => gruplar.has(t)).map((tur) => ({
    tur,
    programlar: gruplar.get(tur)!.sort((x, y) => x.program.ad.localeCompare(y.program.ad, 'tr')),
  }))
}

interface BasvuruOzeti {
  id: string
  programId: string
  programAdi: string
}

export interface BasvuruCifti<B extends BasvuruOzeti = BasvuruOzeti> {
  a: B
  b: B
  iliski?: Iliski
}

/**
 * Başvuru listesindeki her program çifti. Uyarı gereken çiftler önce gelir. Bilgisi olmayan çiftler en sonda durur.
 * Katalogdan çıkmış programın çifti bilinmez sayılır.
 */
export function basvuruCiftleri<B extends BasvuruOzeti>(basvurular: readonly B[], katalog: readonly Program[]): BasvuruCifti<B>[] {
  const bul = (id: string) => katalog.find((p) => p.id === id)
  const ciftler: BasvuruCifti<B>[] = []
  for (let i = 0; i < basvurular.length; i++) {
    for (let j = i + 1; j < basvurular.length; j++) {
      const iliski = iliskiBul(bul(basvurular[i].programId), bul(basvurular[j].programId))
      ciftler.push(iliski ? { a: basvurular[i], b: basvurular[j], iliski } : { a: basvurular[i], b: basvurular[j] })
    }
  }
  const agirlik = (c: BasvuruCifti<B>) => (c.iliski ? sira(c.iliski.tur) : KOMBINASYON_SIRASI.length)
  return ciftler.map((c, i) => ({ c, i })).sort((x, y) => agirlik(x.c) - agirlik(y.c) || x.i - y.i).map((x) => x.c)
}
