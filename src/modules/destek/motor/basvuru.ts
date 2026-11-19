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

export type BasvuruDegisikligi = Partial<Pick<Basvuru, 'durum' | 'belgeler' | 'sonTarih'>>

const metin = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0

function belgelerOku(v: unknown): BelgeMaddesi[] | undefined {
  if (!Array.isArray(v)) return undefined
  const out: BelgeMaddesi[] = []
  for (const b of v) {
    if (!b || typeof b !== 'object') return undefined
    const x = b as Record<string, unknown>
    if (!metin(x.ad) || typeof x.hazir !== 'boolean') return undefined
    out.push({ ad: x.ad, hazir: x.hazir })
  }
  return out
}

/** Depodan ya da dosyadan gelen değeri okur. Bozuk kayıt için undefined döner. */
export function basvuruOku(value: unknown): Basvuru | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  const v = value as Record<string, unknown>
  const belgeler = belgelerOku(v.belgeler)
  if (!metin(v.id) || !metin(v.programId) || !metin(v.programAdi) || !metin(v.olusturma) || !metin(v.guncelleme)) return undefined
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
  const sonraki: Basvuru = { ...b, ...degisiklik, guncelleme: simdi }
  if ('sonTarih' in degisiklik && degisiklik.sonTarih === undefined) delete sonraki.sonTarih
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
