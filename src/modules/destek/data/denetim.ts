/**
 * Katalog denetimi. Saf işlevdir. Hata listesi Türkçe döner.
 * Kaynağı ve tarihi olmayan sayı katalogda duramaz. Bilinmeyen sabit değer, tekrar eden kimlik,
 * https olmayan adres ve ISO biçiminde olmayan tarih de reddedilir.
 */
import { gecerliIsoTarih, tutarVarMi } from '../motor/tazelik'
import { DURUMLAR, KATEGORILER, KOMBINASYONLAR, TAVAN_TURLERI, type Program } from './tipler'

const KIMLIK = /^[a-zA-Z][a-zA-Z0-9]*$/
/** Fikirleri birleştiren işaretler. Yalın yazım kuralı bunları yasaklar. */
const YASAK_ISARET = /[;—–→×]|\s\+\s|[\p{L}]\s?\/\s?[\p{L}]/u
/** Tek bir işletmenin bakışıyla yazılmış sözler. */
const TEK_ISLETME_SOZU = /bugün sağlanmıyor|kapsam dışıdır|\bbizim\b|şirketimiz|firmamız|\bbizde\b|bugünden/iu
export const OZET_EN_COK_KELIME = 16

export function httpsAdresMi(value: unknown): boolean {
  if (typeof value !== 'string') return false
  try {
    const u = new URL(value)
    return u.protocol === 'https:' && u.hostname.includes('.')
  } catch {
    return false
  }
}

function adresHatasi(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value) return 'kaynak adresi yok'
  if (!value.startsWith('https:')) return 'adres https ile başlamalı'
  return httpsAdresMi(value) ? undefined : 'adres geçersiz'
}

type Tur = 'number' | 'string' | 'tarih'

function factHatalari(fact: unknown, tur: Tur, yer: string): string[] {
  const e: string[] = []
  if (!fact || typeof fact !== 'object') return [`${yer}: Fact nesnesi yok.`]
  const f = fact as Record<string, unknown>
  if (f.state !== 'kaynakli' && f.state !== 'bilinmiyor') e.push(`${yer}: state "${String(f.state)}" tanınmıyor.`)
  const adres = adresHatasi(f.sourceUrl)
  if (adres) e.push(`${yer}: ${adres}. https kaynak gerekir.`)
  if (!gecerliIsoTarih(f.asOf)) e.push(`${yer}: son kontrol tarihi ISO biçiminde değil.`)
  if (f.state === 'kaynakli') {
    const v = f.value
    const ok = tur === 'number' ? typeof v === 'number' && Number.isFinite(v) && v > 0 : tur === 'tarih' ? gecerliIsoTarih(v) : typeof v === 'string' && v.trim().length > 0
    if (!ok) e.push(`${yer}: kaynaklı bilginin değeri geçersiz.${tur === 'tarih' ? ' Tarih ISO biçiminde olmalı.' : ''}`)
  } else if (f.state === 'bilinmiyor' && f.value !== undefined) e.push(`${yer}: bilinmeyen bilginin değeri olmamalı.`)
  return e
}

/** Programdaki her sayının kaynaklı bir Fact içinde durduğunu denetler. */
function sayiHatalari(value: unknown, yol: string, ust: Record<string, unknown> | undefined, anahtar: string, hatalar: string[]) {
  if (typeof value === 'number') {
    const fact = ust && ust.state === 'kaynakli' && anahtar === 'value' && httpsAdresMi(ust.sourceUrl) && gecerliIsoTarih(ust.asOf)
    if (!fact) hatalar.push(`${yol}: sayı kaynaklı bir Fact içinde değil.`)
    return
  }
  if (Array.isArray(value)) value.forEach((v, i) => sayiHatalari(v, `${yol}[${i}]`, undefined, String(i), hatalar))
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) sayiHatalari(v, `${yol}.${k}`, value as Record<string, unknown>, k, hatalar)
  }
}

function metinHatalari(metin: unknown, yer: string): string[] {
  if (typeof metin !== 'string' || !metin.trim()) return [`${yer}: metin boş.`]
  const e: string[] = []
  if (YASAK_ISARET.test(metin)) e.push(`${yer}: yasak işaret var. Noktalı virgül, uzun çizgi, ok ve eğik çizgi kullanılmaz.`)
  if (TEK_ISLETME_SOZU.test(metin)) e.push(`${yer}: tek bir işletmenin bakışıyla yazılmış söz var.`)
  return e
}

export function katalogHatalari(programlar: readonly Program[]): string[] {
  const hatalar: string[] = []
  const kimlikler = new Set<string>()
  for (const p of programlar) {
    if (!KIMLIK.test(p.id)) hatalar.push(`${String(p.id)}: kimlik yalnız harf ve rakamdan oluşmalı.`)
    if (kimlikler.has(p.id)) hatalar.push(`${p.id}: aynı kimlik iki kez var.`)
    kimlikler.add(p.id)
  }
  for (const p of programlar) {
    const yer = (alan: string) => `${p.id}.${alan}`
    if (!KATEGORILER.includes(p.kategori)) hatalar.push(`${yer('kategori')}: "${p.kategori}" tanınmıyor.`)
    if (!DURUMLAR.includes(p.durum)) hatalar.push(`${yer('durum')}: "${p.durum}" tanınmıyor.`)
    if (!TAVAN_TURLERI.includes(p.tutar?.tavanTuru)) hatalar.push(`${yer('tutar.tavanTuru')}: "${String(p.tutar?.tavanTuru)}" tanınmıyor.`)
    hatalar.push(...factHatalari(p.tutar?.metin, 'string', yer('tutar.metin')))
    hatalar.push(...factHatalari(p.tutar?.tavanTL, 'number', yer('tutar.tavanTL')))
    p.tarihler.forEach((t, i) => {
      hatalar.push(...metinHatalari(t.ad, yer(`tarihler[${i}].ad`)))
      hatalar.push(...factHatalari(t.tarih, 'tarih', yer(`tarihler[${i}].tarih`)))
      if (typeof t.kritik !== 'boolean') hatalar.push(`${yer(`tarihler[${i}].kritik`)}: doğru ya da yanlış olmalı.`)
    })
    const adres = adresHatasi(p.kaynak?.url)
    if (adres) hatalar.push(`${yer('kaynak.url')}: ${adres}. https kaynak gerekir.`)
    if (!gecerliIsoTarih(p.kaynak?.asOf)) hatalar.push(`${yer('kaynak.asOf')}: son kontrol tarihi ISO biçiminde değil.`)
    hatalar.push(...metinHatalari(p.kaynak?.ad, yer('kaynak.ad')))
    for (const alan of ['ad', 'kurum', 'destekTuru', 'ozet', 'kanal'] as const) hatalar.push(...metinHatalari(p[alan], yer(alan)))
    /* Bu alanlar her ekranda görünür. Tutar bu alanlarda durmaz. Tutar yalnız tutar bölümünde ve gizlenebilen metinlerde durur. */
    for (const [alan, m] of [['ad', p.ad], ['ozet', p.ozet], ['kanal', p.kanal], ['kurum', p.kurum], ['kaynak.ad', p.kaynak?.ad], ...p.tarihler.map((t, i) => [`tarihler[${i}].ad`, t.ad])] as [string, string][]) {
      if (typeof m === 'string' && tutarVarMi(m)) hatalar.push(`${yer(alan)}: bu alanda tutar olmamalı.`)
    }
    for (const alan of ['kosullar', 'uygunGider', 'haricGider', 'belgeler'] as const) {
      p[alan].forEach((m, i) => hatalar.push(...metinHatalari(m, yer(`${alan}[${i}]`))))
    }
    if (p.tutar?.metin?.state === 'kaynakli') hatalar.push(...metinHatalari(p.tutar.metin.value, yer('tutar.metin.value')))
    const ozet = typeof p.ozet === 'string' ? p.ozet.trim() : ''
    if (!ozet.endsWith('.') || /[.!?]\s/.test(ozet)) hatalar.push(`${yer('ozet')}: özet tek cümle olmalı ve noktayla bitmeli.`)
    if (ozet.split(/\s+/).length > OZET_EN_COK_KELIME) hatalar.push(`${yer('ozet')}: özet en çok ${OZET_EN_COK_KELIME} kelime olmalı.`)
    for (const [k, v] of Object.entries(p.kombinasyon ?? {})) {
      if (!kimlikler.has(k)) hatalar.push(`${yer('kombinasyon')}: "${k}" programı katalogda yok.`)
      if (!KOMBINASYONLAR.includes(v as (typeof KOMBINASYONLAR)[number])) hatalar.push(`${yer('kombinasyon')}: "${String(v)}" kombinasyon türü tanınmıyor.`)
    }
    sayiHatalari(p, p.id, undefined, '', hatalar)
  }
  return hatalar
}
