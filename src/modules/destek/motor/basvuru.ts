/**
 * Başvuru kaydı. Saf TypeScript kodudur.
 * Başvuru plana bağlıdır ama plan dosyasına yazılmaz. Kayıt modül deposunda durur.
 */
import type { IsoTarih } from '../data/tipler'
import { gecerliIsoTarih } from './tazelik'

export const BASVURU_DURUMLARI = ['hazirlaniyor', 'basvuruldu', 'sonuc_bekleniyor', 'kabul', 'ret', 'vazgecildi'] as const
export type BasvuruDurumu = (typeof BASVURU_DURUMLARI)[number]

export const DESTEKSIZ_CEVAPLARI = ['evet', 'hayir', 'bilmiyorum'] as const
export type DesteksizCevap = (typeof DESTEKSIZ_CEVAPLARI)[number]

export interface BelgeMaddesi {
  ad: string
  hazir: boolean
  /** Belge ve kanıt listesinden eklenen maddenin kimliği. Programın kendi belgesinde bu alan yoktur. */
  kanit?: string
}

/** Belge ve kanıt listesindeki maddenin kimliği. */
export const KANIT_KIMLIGI = /^[A-Za-z][A-Za-z0-9]{0,40}$/

/** Aynı belgeyi bulmak için adı sadeleştirir. Türkçe büyük ve küçük harf, boşluk ve noktalama farkı sayılmaz. */
export function belgeAnahtari(ad: string): string {
  return ad.toLocaleLowerCase('tr-TR').normalize('NFC').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

export interface Basvuru {
  id: string
  programId: string
  /** Program adı eklenme anındaki haliyle saklanır. Katalog değişse de liste okunur kalır. */
  programAdi: string
  durum: BasvuruDurumu
  /** "Bu işi destek olmadan da yapar mıydık?" sorusunun cevabı. */
  desteksizYapar: DesteksizCevap
  belgeler: BelgeMaddesi[]
  /** Kişinin kendi yazdığı son gün. */
  sonTarih?: IsoTarih
  olusturma: string
  guncelleme: string
}

/**
 * Başvuru değişikliği. Belge işareti tek madde olarak gelir.
 * Böylece arka arkaya iki işaret birbirini silmez. Değişiklik her zaman son okunan kayda uygulanır.
 * İşaret belgenin adını da taşıyabilir. Sıra kaymışsa belge adıyla bulunur. Örneğin araya bir çıkarma girmiş olabilir.
 * Belge ve kanıt listesinden belge eklenebilir. Yalnız böyle eklenen belge çıkarılabilir.
 */
export type BasvuruDegisikligi = Partial<Pick<Basvuru, 'durum' | 'sonTarih'>> & {
  belge?: { sira: number; hazir: boolean; ad?: string }
  belgeEkle?: { ad: string; kanit: string }
  belgeCikar?: { kanit: string }
}

const metin = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0

function belgelerOku(v: unknown): BelgeMaddesi[] | undefined {
  if (!Array.isArray(v)) return undefined
  const out: BelgeMaddesi[] = []
  for (const b of v) {
    if (!b || typeof b !== 'object') return undefined
    const x = b as Record<string, unknown>
    if (!metin(x.ad) || typeof x.hazir !== 'boolean') return undefined
    /* Bozuk belge kimliği kaydı gizlemez. Belge yine okunur, yalnız kimliği atılır. */
    const kanit = typeof x.kanit === 'string' && KANIT_KIMLIGI.test(x.kanit) ? x.kanit : undefined
    out.push(kanit === undefined ? { ad: x.ad, hazir: x.hazir } : { ad: x.ad, hazir: x.hazir, kanit })
  }
  return out
}

/** Başvuru kimliği. Kimlik anahtarda ve ekrandaki bağlantılarda kullanılır. */
export const BASVURU_KIMLIGI = /^[A-Za-z0-9][A-Za-z0-9_-]{0,80}$/

/** Depodan ya da dosyadan gelen değeri okur. Bozuk kayıt için undefined döner. */
export function basvuruOku(value: unknown): Basvuru | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  const v = value as Record<string, unknown>
  const belgeler = belgelerOku(v.belgeler)
  if (typeof v.id !== 'string' || !BASVURU_KIMLIGI.test(v.id) || !metin(v.programId) || !metin(v.programAdi) || !metin(v.olusturma) || !metin(v.guncelleme)) return undefined
  if (!BASVURU_DURUMLARI.includes(v.durum as BasvuruDurumu) || !DESTEKSIZ_CEVAPLARI.includes(v.desteksizYapar as DesteksizCevap) || !belgeler) return undefined
  if (v.sonTarih !== undefined && !gecerliIsoTarih(v.sonTarih)) return undefined
  const b: Basvuru = {
    id: v.id,
    programId: v.programId,
    programAdi: v.programAdi,
    durum: v.durum as BasvuruDurumu,
    desteksizYapar: v.desteksizYapar as DesteksizCevap,
    belgeler,
    olusturma: v.olusturma,
    guncelleme: v.guncelleme,
  }
  if (v.sonTarih !== undefined) b.sonTarih = v.sonTarih as IsoTarih
  return b
}

/** Değişikliği uygular. Geçersiz değişiklikte hata fırlatır. */
export function basvuruDegistir(b: Basvuru, degisiklik: BasvuruDegisikligi, simdi: string): Basvuru {
  const { belge, belgeEkle, belgeCikar, ...alanlar } = degisiklik
  const sonraki: Basvuru = { ...b, ...alanlar, guncelleme: simdi }
  if ('sonTarih' in degisiklik && degisiklik.sonTarih === undefined) delete sonraki.sonTarih
  let belgeler = b.belgeler
  /* Çıkarma iki kez gelebilir. Örneğin düğmeye iki kez basılır. Belge zaten yoksa kayıt değişmez. */
  if (belgeCikar) belgeler = belgeler.filter((x) => x.kanit !== belgeCikar.kanit)
  if (belgeEkle) {
    const ad = typeof belgeEkle.ad === 'string' ? belgeEkle.ad.trim() : ''
    if (!ad || !KANIT_KIMLIGI.test(belgeEkle.kanit)) throw new Error('Belge geçersiz.')
    const anahtar = belgeAnahtari(ad)
    if (belgeler.some((x) => x.kanit === belgeEkle.kanit || belgeAnahtari(x.ad) === anahtar)) throw new Error('Bu belge listede zaten var.')
    belgeler = [...belgeler, { ad, hazir: false, kanit: belgeEkle.kanit }]
  }
  if (belge) {
    let sira = belge.sira
    if (belge.ad !== undefined && belgeler[sira]?.ad !== belge.ad) sira = belgeler.findIndex((x) => x.ad === belge.ad)
    if (!Number.isInteger(sira) || sira < 0 || sira >= belgeler.length || typeof belge.hazir !== 'boolean') throw new Error('Belge bulunamadı.')
    belgeler = belgeler.map((x, i) => (i === sira ? { ...x, hazir: belge.hazir } : x))
  }
  sonraki.belgeler = belgeler
  const okunan = basvuruOku(sonraki)
  if (!okunan) throw new Error('Başvuru değişikliği geçersiz.')
  return okunan
}

/** Plan özeti. Çekirdek bütçe adımında bir satır gösterebilir. */
export interface DestekOzeti {
  v: 1
  toplam: number
  durumlar: Record<BasvuruDurumu, number>
}

export function ozetHesapla(basvurular: readonly Basvuru[]): DestekOzeti {
  const durumlar = Object.fromEntries(BASVURU_DURUMLARI.map((d) => [d, 0])) as Record<BasvuruDurumu, number>
  for (const b of basvurular) durumlar[b.durum] += 1
  return { v: 1, toplam: basvurular.length, durumlar }
}
