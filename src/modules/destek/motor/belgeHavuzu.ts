/**
 * Konsey planı B.1: ortak belge havuzu. Saf TypeScript kodudur.
 * Havuz, kişinin hazırladığı ortak belgeleri tutar. Havuz plan dosyasına yazılmaz.
 * Havuzdaki "Hazır" işareti başvurulara kendiliğinden geçmez. Kişi her başvuruda "Bu belgeyi kullanacağım" der.
 * Süreli belge yalnız kişinin yazdığı geçerlilik tarihini taşır. Tarih geçince uyarı çıkar.
 */
import { ORTAK_BELGELER } from '../data/ortakBelgeler'
import type { IsoTarih, OrtakBelge } from '../data/tipler'
import { KANIT_KIMLIGI, type BelgeMaddesi } from './basvuru'
import { gecerliIsoTarih, tarihGectiMi } from './tazelik'

export interface HavuzKaydi {
  hazir: boolean
  /** Yalnız süreli belgede durur. Kişinin belgenin üstünde okuduğu son geçerlilik günüdür. */
  gecerlilik?: IsoTarih
}

export interface BelgeHavuzu {
  v: 1
  belgeler: Readonly<Record<string, HavuzKaydi>>
}

export const BOS_HAVUZ: BelgeHavuzu = { v: 1, belgeler: {} }

/** Depodan gelen değeri okur. Bozuk havuz boş okunur. Bozuk kayıt atılır. Bozuk tarih yalnız tarihi siler. */
export function havuzOku(value: unknown): BelgeHavuzu {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return BOS_HAVUZ
  const ham = (value as { belgeler?: unknown }).belgeler
  if (!ham || typeof ham !== 'object' || Array.isArray(ham)) return BOS_HAVUZ
  const belgeler: Record<string, HavuzKaydi> = {}
  for (const [id, kayit] of Object.entries(ham)) {
    if (!KANIT_KIMLIGI.test(id) || !kayit || typeof kayit !== 'object') continue
    const k = kayit as Record<string, unknown>
    if (typeof k.hazir !== 'boolean') continue
    belgeler[id] = gecerliIsoTarih(k.gecerlilik) ? { hazir: k.hazir, gecerlilik: k.gecerlilik } : { hazir: k.hazir }
  }
  return { v: 1, belgeler }
}

/** Havuz değişikliği. gecerlilik null ise tarih silinir. */
export interface HavuzDegisikligi {
  hazir?: boolean
  gecerlilik?: IsoTarih | null
}

/** Değişikliği uygular. Süreli olmayan belge tarih taşımaz. Geçersiz tarihte hata fırlatır. */
export function havuzDegistir(havuz: BelgeHavuzu, belge: OrtakBelge, d: HavuzDegisikligi): BelgeHavuzu {
  if (!KANIT_KIMLIGI.test(belge.id)) throw new Error('Belge geçersiz.')
  if (d.gecerlilik && !gecerliIsoTarih(d.gecerlilik)) throw new Error('Tarih geçersiz.')
  const onceki = havuz.belgeler[belge.id]
  const sonraki: HavuzKaydi = { hazir: d.hazir ?? onceki?.hazir ?? false }
  const gecerlilik = d.gecerlilik === undefined ? onceki?.gecerlilik : d.gecerlilik ?? undefined
  if (belge.sureli && gecerlilik) sonraki.gecerlilik = gecerlilik
  return { v: 1, belgeler: { ...havuz.belgeler, [belge.id]: sonraki } }
}

/** "yok": hazır değil. "tarihGerekli": süreli belgede tarih yok. "suresiGecti": tarih geçti. */
export type HavuzDurumu = 'yok' | 'hazir' | 'tarihGerekli' | 'suresiGecti'

export function havuzDurumu(belge: Pick<OrtakBelge, 'sureli'>, kayit: HavuzKaydi | undefined, bugun: IsoTarih): HavuzDurumu {
  if (!kayit?.hazir) return 'yok'
  if (!belge.sureli) return 'hazir'
  if (!kayit.gecerlilik) return 'tarihGerekli'
  return tarihGectiMi(kayit.gecerlilik, bugun) ? 'suresiGecti' : 'hazir'
}

/**
 * Başvurudaki belge için havuzun önerisi. Öneri başvurunun işaretini değiştirmez.
 * "kullan": havuzda hazır ve başvuruda henüz işaretli değil. Kişi isterse "Bu belgeyi kullanacağım" der.
 * "suresiGecti" ve "tarihGerekli": uyarıdır. Başvuruda işaretli olsa da görünür.
 * Programın kendi belgesi havuza bağlı değildir. Bu belgede öneri yoktur.
 */
export function basvuruBelgeOnerisi(b: BelgeMaddesi, havuz: BelgeHavuzu | undefined, bugun: IsoTarih): 'kullan' | 'suresiGecti' | 'tarihGerekli' | undefined {
  const belge = ORTAK_BELGELER.find((x) => x.id === b.kanit)
  if (!belge || !havuz) return undefined
  const durum = havuzDurumu(belge, havuz.belgeler[belge.id], bugun)
  if (durum === 'suresiGecti' || durum === 'tarihGerekli') return durum
  return durum === 'hazir' && !b.hazir ? 'kullan' : undefined
}
