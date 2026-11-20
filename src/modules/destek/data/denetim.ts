/**
 * Katalog denetimi. Saf işlevdir. Hata listesi Türkçe döner.
 * Kaynağı ve tarihi olmayan sayı katalogda duramaz. Bilinmeyen sabit değer, tekrar eden kimlik,
 * https olmayan adres ve ISO biçiminde olmayan tarih de reddedilir.
 */
import { KANIT_KIMLIGI } from '../motor/basvuru'
import { gecerliIsoTarih, httpsAdresMi, tutarVarMi } from '../motor/tazelik'
import { DURUMLAR, KATEGORILER, KOMBINASYONLAR, TAVAN_TURLERI, type GiderKalemi, type KurumSorusu, type KanitGrubu, type Program, type Terim } from './tipler'

const KIMLIK = /^[a-zA-Z][a-zA-Z0-9]*$/
/** Fikirleri birleştiren işaretler. Yalın yazım kuralı bunları yasaklar. */
const YASAK_ISARET = /[;—–→×]|\s\+\s|[\p{L}]\s?\/\s?[\p{L}]/u
/** Tek bir işletmenin bakışıyla yazılmış sözler. */
const TEK_ISLETME_SOZU = /bugün sağlanmıyor|kapsam dışıdır|\bbizim\b|şirketimiz|firmamız|\bbizde\b|bugünden|\bbiz\b|\bbize\b|\bbizi\b|elimizde|bildiğimiz|sormadığımız|yapılacaktır|yapılmayacaktır|ilk 24 ay/iu
/** Kaynağın yazıldığı işletmenin sektörüne özel sözler. Ek veri bu sözleri taşımaz. */
const SEKTOR_SOZU = /taşınmaz|gayrimenkul|emlak|parsel|kadastro|arazi|\bTTBS\b|EİDS|aracılık kodu/iu
/** Ek verideki bir cümlenin en çok kelime sayısı. */
export const CUMLE_EN_COK_KELIME = 16
export const OZET_EN_COK_KELIME = 16

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
    if (!p.faydalar?.length) hatalar.push(`${yer('faydalar')}: en az bir fayda gerekir.`)
    for (const [fayda, tavan] of Object.entries(p.faydaTavanlari ?? {})) {
      const yol = yer(`faydaTavanlari.${fayda}`)
      if (!p.faydalar?.some((f) => f === fayda)) hatalar.push(`${yol}: fayda programda yok.`)
      hatalar.push(...factHatalari(tavan, 'number', yol))
    }
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
    /* Bu alanlar her ekranda görünür. Tutar bu alanlarda durmaz. Tutar kendi alanında veya kaynak tarihiyle denetlenen metinde durur. */
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
    for (const alan of ['degerlendirme', 'ilkOdeme'] as const) {
      hatalar.push(...factHatalari(p.sure?.[alan], 'string', yer(`sure.${alan}`)))
    }
    hatalar.push(...factHatalari(p.odemeBicimi, 'string', yer('odemeBicimi')))
    if (!Array.isArray(p.kombinasyon)) {
      hatalar.push(`${yer('kombinasyon')}: kaynaklı kural listesi gerekir.`)
    } else {
      for (const kural of p.kombinasyon) {
        const k = kural.digerProgramId
        const yol = yer(`kombinasyon.${k}`)
        if (!kimlikler.has(k)) hatalar.push(`${yol}: program katalogda yok.`)
        if (k === p.id) hatalar.push(`${yol}: program kendini anamaz.`)
        hatalar.push(...factHatalari(kural.iliski, 'string', yol))
        if (kural.iliski?.state !== 'kaynakli' || !KOMBINASYONLAR.includes(kural.iliski.value)) {
          hatalar.push(`${yol}: kaynaklı ilişki türü gerekir.`)
        }
        if (typeof kural.yonlu !== 'boolean') hatalar.push(`${yol}: yön bilgisi gerekir.`)
      }
    }
    sayiHatalari(p, p.id, undefined, '', hatalar)
  }
  return hatalar
}

/** Ek verideki metni denetler: boş metin, yasak işaret, tek işletme bakışı, sektör sözü ve uzun cümle. */
function ekMetinHatalari(metin: unknown, yer: string): string[] {
  const e = metinHatalari(metin, yer)
  if (typeof metin !== 'string' || !metin.trim()) return e
  if (SEKTOR_SOZU.test(metin)) e.push(`${yer}: tek bir sektöre özel söz var.`)
  for (const cumle of metin.trim().split(/(?<=[.!?])\s+/)) {
    if (cumle.split(/\s+/).length > CUMLE_EN_COK_KELIME) e.push(`${yer}: bir cümle en çok ${CUMLE_EN_COK_KELIME} kelime olmalı.`)
  }
  return e
}

const tekCumleMi = (m: string) => m.trim().endsWith('.') && !/[.!?]\s/.test(m.trim())
const terimAnahtari = (m: string) => m.toLocaleLowerCase('tr-TR').normalize('NFC').trim()

/**
 * Belge listesi, gider listesi ve sözlük denetimi. Saf işlevdir.
 * Kimlikler tektir. Program ve terim bağlantıları geçerlidir. Metinler yalın yazım kurallarına uyar.
 */
export function ekVeriHatalari(v: { kanitlar: readonly KanitGrubu[]; giderler: readonly GiderKalemi[]; sozluk: readonly Terim[]; programlar: readonly Program[] }): string[] {
  const hatalar: string[] = []
  const programlar = new Set(v.programlar.map((p) => p.id))
  const terimler = new Set(v.sozluk.map((t) => t.id))
  const tek = (kume: Set<string>, id: unknown, yer: string) => {
    if (typeof id !== 'string' || !KIMLIK.test(id)) hatalar.push(`${yer}: kimlik yalnız harf ve rakamdan oluşmalı.`)
    else if (kume.has(id)) hatalar.push(`${yer}: aynı kimlik iki kez var.`)
    kume.add(String(id))
  }
  const terimVar = (terim: string | undefined, yer: string) => {
    if (terim !== undefined && !terimler.has(terim)) hatalar.push(`${yer}: "${terim}" terimi sözlükte yok.`)
  }

  const grupKimlikleri = new Set<string>()
  const maddeKimlikleri = new Set<string>()
  for (const g of v.kanitlar) {
    tek(grupKimlikleri, g.id, `kanit.${g.id}`)
    hatalar.push(...ekMetinHatalari(g.ad, `kanit.${g.id}.ad`))
    if (!g.maddeler.length) hatalar.push(`kanit.${g.id}: grupta madde yok.`)
    for (const m of g.maddeler) {
      const yer = `kanit.${g.id}.${m.id}`
      tek(maddeKimlikleri, m.id, yer)
      if (!KANIT_KIMLIGI.test(m.id)) hatalar.push(`${yer}: kimlik başvuruda saklanamaz. En çok 41 harf ve rakam olmalı.`)
      hatalar.push(...ekMetinHatalari(m.ad, `${yer}.ad`), ...ekMetinHatalari(m.neden, `${yer}.neden`))
      if (typeof m.neden === 'string' && !tekCumleMi(m.neden)) hatalar.push(`${yer}.neden: neden tek cümle olmalı ve noktayla bitmeli.`)
      terimVar(m.terim, yer)
    }
  }

  const giderKimlikleri = new Set<string>()
  for (const g of v.giderler) {
    const yer = `gider.${g.id}`
    tek(giderKimlikleri, g.id, yer)
    hatalar.push(...ekMetinHatalari(g.ad, `${yer}.ad`))
    if (g.not !== undefined) hatalar.push(...ekMetinHatalari(g.not, `${yer}.not`))
    if (!g.programlar.length) hatalar.push(`${yer}: program listesi boş.`)
    if (new Set(g.programlar).size !== g.programlar.length) hatalar.push(`${yer}: aynı program iki kez var.`)
    for (const p of g.programlar) if (!programlar.has(p)) hatalar.push(`${yer}: "${p}" programı katalogda yok.`)
    terimVar(g.terim, yer)
  }

  const sozlukKimlikleri = new Set<string>()
  const adlar = new Set<string>()
  for (const t of v.sozluk) {
    const yer = `sozluk.${t.id}`
    tek(sozlukKimlikleri, t.id, yer)
    hatalar.push(...ekMetinHatalari(t.ad, `${yer}.ad`), ...ekMetinHatalari(t.anlam, `${yer}.anlam`))
    if (typeof t.anlam === 'string' && (/\p{N}/u.test(t.anlam) || t.anlam.trim().split(/\s+/).length > 15)) {
      hatalar.push(`${yer}.anlam: tanım sayı içeremez ve en çok 15 kelime olabilir.`)
    }
    if (typeof t.ad === 'string') {
      if (adlar.has(terimAnahtari(t.ad))) hatalar.push(`${yer}: aynı terim iki kez var.`)
      adlar.add(terimAnahtari(t.ad))
    }
  }
  return hatalar
}

export function kurumSorusuHatalari(sorular: readonly KurumSorusu[]): string[] {
  return sorular.flatMap(({ id, soru }) => ekMetinHatalari(soru, `kurumSorusu.${id}`))
}
