/**
 * Bilginin eskimesi, tarih yazımı ve program durumu. Saf işlevlerdir.
 * Bugünün tarihi her işleve dışarıdan verilir. Böylece test bugünü sabitler.
 */
import type { Durum, Fact, IsoTarih, Program } from '../data/tipler'

/** Bu günden eski bilgi "Eski bilgi" sayılır. */
export const ESKI_BILGI_GUN = 90

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/

/** Gerçek bir takvim günü mü? Örneğin "2026-02-30" geçersizdir. */
export function gecerliIsoTarih(value: unknown): value is IsoTarih {
  if (typeof value !== 'string') return false
  const m = ISO.exec(value)
  if (!m) return false
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])))
  return d.getUTCFullYear() === Number(m[1]) && d.getUTCMonth() === Number(m[2]) - 1 && d.getUTCDate() === Number(m[3])
}

function utcGun(iso: IsoTarih): number {
  if (!gecerliIsoTarih(iso)) throw new Error(`Geçersiz tarih: ${String(iso)}`)
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d) / 86_400_000
}

/** İki gün arasındaki fark. Sonraki gün büyükse sonuç artıdır. */
export function gunFarki(once: IsoTarih, sonra: IsoTarih): number {
  return utcGun(sonra) - utcGun(once)
}

/** Yerel saate göre bugünün tarihi. Testler kendi tarihini verir. */
export function bugunIso(now: Date = new Date()): IsoTarih {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`
}

export interface Tazelik {
  /** Son kontrolden bu yana geçen gün. */
  gun: number
  eski: boolean
}

export function tazelik(asOf: IsoTarih, bugun: IsoTarih): Tazelik {
  const gun = gunFarki(asOf, bugun)
  return { gun, eski: gun > ESKI_BILGI_GUN }
}

export function httpsAdresMi(value: unknown): boolean {
  if (typeof value !== 'string') return false
  try {
    const u = new URL(value)
    return u.protocol === 'https:' && u.hostname.includes('.')
  } catch {
    return false
  }
}

export const ESKI_ALAN_METNI = 'Bilinmiyor. Bilgi eski.'

export function alanDurumu(fact: Fact<unknown>, bugun: IsoTarih): 'bilinmiyor' | 'kaynakli' | 'eski' {
  if (fact.state !== 'kaynakli' || !httpsAdresMi(fact.sourceUrl) || !gecerliIsoTarih(fact.asOf)) return 'bilinmiyor'
  return tazelik(fact.asOf, bugun).eski ? 'eski' : 'kaynakli'
}

export function alanMetni<T>(fact: Fact<T>, bugun: IsoTarih, bicim: (value: T) => string, bilinmiyor = 'Bilinmiyor.'): string {
  const durum = alanDurumu(fact, bugun)
  if (durum === 'eski') return ESKI_ALAN_METNI
  return durum === 'kaynakli' && fact.state === 'kaynakli' ? bicim(fact.value) : bilinmiyor
}

const TARIH_BICIMI = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long', timeZone: 'UTC' })

/** "12 Ağustos 2026 Çarşamba" biçiminde yazar. */
export function tarihYaz(iso: IsoTarih): string {
  return TARIH_BICIMI.format(new Date(utcGun(iso) * 86_400_000))
}

/** Ekrandaki durum. "kapandi" bugünün tarihinden çıkar. */
export type GecerliDurum = Durum | 'kapandi'

/**
 * Programın bugünkü durumu. Bütün kritik tarihleri geçen program "kapandi" olur.
 * Tarihi bilinmeyen kritik gün programı kapatmaz. Kaldırılan program her zaman "kaldirildi" olur.
 */
export function gecerliDurum(program: Pick<Program, 'durum' | 'tarihler'>, bugun: IsoTarih): GecerliDurum {
  if (program.durum === 'kapali' || program.durum === 'kaldirildi') return program.durum
  const kritik = program.tarihler.filter((t) => t.kritik && t.tarih.state === 'kaynakli')
  if (kritik.length && kritik.every((t) => gunFarki(t.tarih.value as IsoTarih, bugun) > 0)) return 'kapandi'
  return program.durum
}

/** Tarih geçti mi? Bugün son gün ise tarih geçmemiştir. */
export function tarihGectiMi(iso: IsoTarih, bugun: IsoTarih): boolean {
  return gunFarki(iso, bugun) > 0
}

/**
 * Metindeki para tutarları. Örneğin "20.000.000 TL", "2 milyar TL", "1.500.000 ABD doları".
 * Tutarın ardındaki ek de alınır. Örneğin "100.000.000 TL'dir".
 */
export const PARA_TUTARI = /\d[\d.,]*\s*(?:milyar\s+|milyon\s+|bin\s+)?(?:TL|ABD doları|dolar|avro|euro|EUR|USD)(?!\p{L})(?:'[a-zçğıöşü]+)?/giu

/** Metinde para tutarı var mı? */
export function tutarVarMi(metin: string): boolean {
  PARA_TUTARI.lastIndex = 0
  const found = PARA_TUTARI.test(metin)
  PARA_TUTARI.lastIndex = 0
  return found
}

// Eski katalog metinlerinin kaynak tarihi program kaydında durur.
const SAYISAL_BILGI = /%|yüzde|(?<![\p{L}\p{N}])(?:\d+|bir|iki|üç|dört|beş|altı|yedi|sekiz|dokuz|on)\s+(?:(?:iş|tam)\s+)?(?:gün|hafta|ay|yıl)(?:[’']?(?:da|de|dan|den|ı|i|ın|in|lık|lik))?(?!\p{L})|\b\d{4}-\d{2}-\d{2}\b|\d{1,2}\s+(?:Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık)/iu

/** Serbest metinlerin kaynağı. Adres kartın adresidir. Gün, serbest metinlerin kendi kontrol günüdür. */
export function metinKaynagi(program: Pick<Program, 'kaynak' | 'metinKontrol'>): Pick<Program['kaynak'], 'url' | 'asOf'> {
  return { url: program.kaynak.url, asOf: program.metinKontrol }
}

export function eskiMetniGoster(metin: string, kaynak: Pick<Program['kaynak'], 'url' | 'asOf'>, bugun: IsoTarih): string {
  if (!tutarVarMi(metin) && !SAYISAL_BILGI.test(metin.toLocaleLowerCase('tr-TR'))) return metin
  return alanMetni({ state: 'kaynakli', value: metin, sourceUrl: kaynak.url, asOf: kaynak.asOf }, bugun, (value) => value)
}
