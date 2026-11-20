import { describe, expect, it } from 'vitest'
import { ekVeriHatalari } from './denetim'
import { GIDER_KALEMLERI } from './giderler'
import { KANIT_GRUPLARI } from './kanitlar'
import { PROGRAMLAR } from './programlar'
import { SOZLUK } from './sozluk'
import type { GiderKalemi, KanitGrubu, Terim } from './tipler'
import { belgeAnahtari } from '../motor/basvuru'

/** Bozuk kopyayı denetler. Hata listesi tek metin olarak döner. */
function hatalar(boz: (v: { kanitlar: KanitGrubu[]; giderler: GiderKalemi[]; sozluk: Terim[] }) => void): string {
  const v = { kanitlar: structuredClone(KANIT_GRUPLARI) as KanitGrubu[], giderler: structuredClone(GIDER_KALEMLERI) as GiderKalemi[], sozluk: structuredClone(SOZLUK) as Terim[] }
  boz(v)
  return ekVeriHatalari({ ...v, programlar: PROGRAMLAR }).join('\n')
}

describe('ek veri denetimi', () => {
  it('belge, gider ve sözlük verisi temizdir', () => {
    expect(ekVeriHatalari({ kanitlar: KANIT_GRUPLARI, giderler: GIDER_KALEMLERI, sozluk: SOZLUK, programlar: PROGRAMLAR })).toEqual([])
  })

  it('kaynaktan alınan madde sayıları belgedeki sayılarla aynıdır', () => {
    expect(KANIT_GRUPLARI).toHaveLength(9)
    expect(KANIT_GRUPLARI.flatMap((g) => g.maddeler)).toHaveLength(36)
    expect(GIDER_KALEMLERI).toHaveLength(14)
    expect(SOZLUK).toHaveLength(26)
  })

  it('belge adları normal biçimde de tektir', () => {
    const adlar = KANIT_GRUPLARI.flatMap((g) => g.maddeler.map((m) => belgeAnahtari(m.ad)))
    expect(new Set(adlar).size).toBe(adlar.length)
  })

  it('sözlükte eski terimlerin hepsi temel terim olarak durur', () => {
    const temel = SOZLUK.filter((t) => t.temel).map((t) => t.ad)
    expect(temel).toEqual(['Destek', 'Hibe', 'Geri ödemeli destek', 'Kredi', 'Teşvik', 'Ortaklık yatırımı', 'Kefalet', 'Çağrı', 'KOBİ', 'Ar-Ge', 'NACE kodu', 'Ön eşleşme'])
  })

  it('emlak sektörüne özel terimler alınmadı', () => {
    const metin = JSON.stringify({ KANIT_GRUPLARI, GIDER_KALEMLERI, SOZLUK })
    expect(metin).not.toMatch(/TTBS|EİDS|taşınmaz|gayrimenkul|parsel|kadastro|68\.31/iu)
  })

  it('katalogda olmayan program kimliğini reddeder', () => {
    expect(hatalar((v) => { v.giderler[0].programlar = ['yokProgram'] })).toMatch(/yokProgram.*katalogda yok/)
  })

  it('aynı kimliği reddeder', () => {
    expect(hatalar((v) => { v.giderler[1].id = v.giderler[0].id })).toMatch(/aynı kimlik/)
    expect(hatalar((v) => { v.kanitlar[1].maddeler[0].id = v.kanitlar[0].maddeler[0].id })).toMatch(/aynı kimlik/)
    expect(hatalar((v) => { v.sozluk[1].id = v.sozluk[0].id })).toMatch(/aynı kimlik/)
    expect(hatalar((v) => { v.sozluk[1].ad = v.sozluk[0].ad.toLocaleUpperCase('tr-TR') })).toMatch(/aynı terim/)
  })

  it('aynı programı bir giderde iki kez reddeder', () => {
    expect(hatalar((v) => { v.giderler[0].programlar = ['tubitak1501', 'tubitak1501'] })).toMatch(/iki kez/)
  })

  it('sözlükte olmayan terim bağlantısını reddeder', () => {
    expect(hatalar((v) => { v.giderler[0].terim = 'yokTerim' })).toMatch(/yokTerim.*sözlükte yok/)
    expect(hatalar((v) => { v.kanitlar[0].maddeler[0].terim = 'yokTerim' })).toMatch(/sözlükte yok/)
  })

  it('yasak işareti, şirket bakışını ve sektör sözünü reddeder', () => {
    expect(hatalar((v) => { v.kanitlar[0].maddeler[0].neden = 'Kuruluşu gösterir; türü de gösterir.' })).toMatch(/işaret/)
    expect(hatalar((v) => { v.giderler[0].not = 'Ar-Ge / satış ayrımı.' })).toMatch(/işaret/)
    expect(hatalar((v) => { v.sozluk[0].anlam = 'Elimizde olmayan veridir.' })).toMatch(/işletme/)
    expect(hatalar((v) => { v.kanitlar[0].maddeler[0].neden = 'İlk 24 ayda aracılık yapılmayacaktır.' })).toMatch(/işletme/)
    expect(hatalar((v) => { v.kanitlar[0].maddeler[0].ad = 'Parsel ve kadastro veri hakları' })).toMatch(/sektör/)
  })

  it('belgenin nedeni tek cümledir', () => {
    expect(hatalar((v) => { v.kanitlar[0].maddeler[0].neden = 'Birinci cümle. İkinci cümle.' })).toMatch(/tek cümle/)
    expect(hatalar((v) => { v.kanitlar[0].maddeler[0].neden = 'Nokta yok' })).toMatch(/tek cümle/)
  })

  it('uzun cümleyi reddeder', () => {
    expect(hatalar((v) => { v.sozluk[0].anlam = 'Bu cümle bilerek çok uzun yazıldı ve on altı kelimeden fazla kelime taşıdığı için bu denetimden asla geçmemelidir.' })).toMatch(/kelime/)
  })

  it('boş metni reddeder', () => {
    expect(hatalar((v) => { v.kanitlar[0].ad = ' ' })).toMatch(/boş/)
  })
})

describe('yeni ekran adresleri', () => {
  it('hiçbir program kimliği yeni ekranların adresiyle çakışmaz', () => {
    for (const ad of ['belgeler', 'giderler', 'sozluk', 'eslesme', 'basvurular']) expect(PROGRAMLAR.some((p) => p.id === ad)).toBe(false)
  })
})
