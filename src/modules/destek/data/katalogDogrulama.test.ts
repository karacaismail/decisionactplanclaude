/**
 * Doğrulama sonuçları katalogda durur. Kontrol 20 Kasım 2026 Cuma günü yapıldı.
 * Kaynak dosyalar: docs/moduller/dogrulama/grup-a.json, grup-b.json ve grup-c.json.
 * Test JSON kataloğunu okur. Bu katalog uygulamada ayrı bir dosya olarak iner.
 */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { katalogHatalari } from './denetim'
import { programEtiketleri } from './etiketler'
import { PROGRAMLAR } from './programlar'
import type { Fact, FaydaTuru } from './tipler'
import { iliskiBul } from '../motor/kombinasyon'
import { gecerliDurum } from '../motor/tazelik'

const KONTROL = '2026-11-20'
const p = (id: string) => {
  const bulunan = PROGRAMLAR.find((x) => x.id === id)
  if (!bulunan) throw new Error(`${id} katalogda yok`)
  return bulunan
}

interface DogrulamaKaydi {
  id: string
  durum: 'dogrulandi' | 'degisti' | 'kaldirildi' | 'bulunamadi'
  faydalar: string[]
}
const DOGRULAMA: DogrulamaKaydi[] = ['a', 'b', 'c'].flatMap((g) => JSON.parse(readFileSync(`docs/moduller/dogrulama/grup-${g}.json`, 'utf8')) as DogrulamaKaydi[])
const FAYDA_ESI: Record<string, FaydaTuru> = {
  hibe: 'hibe', vergi_prim: 'vergi_sgk', faiz_destegi: 'faiz', geri_odemeli_kredi: 'kredi', ortaklik_yatirimi: 'ortaklik', kefalet: 'kefalet', hizmet_ayni: 'hizmet', destek_degil: 'destek_degil',
}

const kaynakli = <T,>(f: Fact<T> | undefined) => {
  expect(f?.state).toBe('kaynakli')
  return f as Extract<Fact<T>, { state: 'kaynakli' }>
}

describe('doğrulama sonuçları', () => {
  it('JSON katalog temizdir ve 46 programın hepsi doğrulama listesindedir', () => {
    expect(katalogHatalari(PROGRAMLAR)).toEqual([])
    expect(new Set(DOGRULAMA.map((d) => d.id))).toEqual(new Set(PROGRAMLAR.map((x) => x.id)))
  })

  it('doğrulanan programın kontrol günü 20 Kasım 2026, bulunamayan programınki 12 Ağustos 2026 olur', () => {
    for (const d of DOGRULAMA) {
      const beklenen = d.durum === 'bulunamadi' ? '2026-08-12' : KONTROL
      expect(p(d.id).kaynak.asOf, d.id).toBe(beklenen)
    }
    expect(p('eximbank').kaynak.asOf).toBe('2026-08-12')
    expect(p('meslekOrgutleri').kaynak.asOf).toBe('2026-08-12')
  })

  it('serbest metinler eski kontrol gününü korur', () => {
    for (const x of PROGRAMLAR) expect(x.metinKontrol, x.id).toBe('2026-08-12')
  })

  it('kaynaklı alan kaynak adresi, alıntı ve kontrol gününü taşır', () => {
    const tavan = kaynakli(p('tubitak1501').tutar.tavanTL)
    expect(tavan.value).toBe(20_000_000)
    expect(tavan.sourceUrl).toMatch(/^https:\/\/tubitak\.gov\.tr\/sites\/default\/files\/2026-07\/1501_/)
    expect(tavan.alinti).toBe('* Proje başına TÜBİTAK katkısı 20 milyon TL ile sınırlandırılmıştır.')
    expect(tavan.asOf).toBe(KONTROL)
    expect(kaynakli(p('kosgebGirisimciA').tutar.tavanTL).value).toBe(2_250_000)
    expect(kaynakli(p('kosgebKuresel').tutar.tavanTL).value).toBe(75_000_000)
    expect(kaynakli(p('kosgebKuresel').tutar.metin).value).toBe('Kredi üst sınırı 75.000.000 TL. Alt sınır 30.000.000 TL.')
    expect(kaynakli(p('kosgebYapayZekaKredisi').tutar.metin).value).not.toMatch(/500\.000/)
  })

  it('hesapla bulunmuş tutar katalogda durmaz', () => {
    for (const id of ['tubitak1507', 'tubitak1707', 'tubitak1711', 'tubitak1509']) {
      expect(p(id).tutar.tavanTL.state, id).toBe('bilinmiyor')
      expect(p(id).tutar.tavanTuru, id).toBe('oransal')
    }
    expect(JSON.stringify(p('tubitak1507'))).not.toMatch(/2\.625\.000|2625000/)
  })

  it('doğrulanan her değer alıntı taşır, yalnız tablo hücresindeki değerler alıntısızdır', () => {
    // Doğrulama belgesi bu değerleri tablo hücresinde ya da birkaç satıra bölünmüş metinde buldu. Bu yüzden alıntı boş kaldı.
    const ALINTISIZ = ['istka.odemeBicimi', 'istka.tarihler[0].tarih', 'istka.tutar.metin', 'istka.tutar.oran', 'istka.tutar.tavanTL', 'kosgebDijitalDonusum.tutar.oran', 'techIstanbul.odemeBicimi']
    const bulunan: string[] = []
    const gez = (o: unknown, yol: string) => {
      if (Array.isArray(o)) o.forEach((x, i) => gez(x, `${yol}[${i}]`))
      else if (o && typeof o === 'object') {
        const f = o as Record<string, unknown>
        if (f.state === 'kaynakli' && f.asOf === KONTROL && !f.alinti) bulunan.push(yol)
        for (const [k, v] of Object.entries(f)) gez(v, `${yol}.${k}`)
      }
    }
    for (const x of PROGRAMLAR) gez(x, x.id)
    expect(bulunan.sort()).toEqual(ALINTISIZ)
  })

  it('kaynaksız alan bilinmiyor kalır', () => {
    expect(p('tubitak1501').sure.degerlendirme.state).toBe('bilinmiyor')
    expect(p('tubitak1702').odemeBicimi.state).toBe('bilinmiyor')
    expect(p('eic').tutar.tavanTL.state).toBe('bilinmiyor')
    expect(p('eic').tutar.oran).toBeUndefined()
  })

  it('resmî kaynaktaki süre ve ödeme biçimi işlenir', () => {
    const sure = kaynakli(p('kosgebGirisimciA').sure.degerlendirme)
    expect(sure.value).toMatch(/15 gün içinde/)
    expect(sure.value).toMatch(/Süre şu olayla başlar: Kurul Karar Formunun evrak kaydına alınması\.$/)
    expect(kaynakli(p('tubitak1501').odemeBicimi).value).toMatch(/^Harcama sonrası\./)
    expect(kaynakli(p('asgariUcretDestegi').odemeBicimi).value).toMatch(/^Mahsup\./)
  })

  it('kapanan çağrı "Kapandı", kaldırılan program "Kaldırıldı" olur', () => {
    for (const id of ['tubitak1501', 'tubitak1711', 'eureka1709', 'kosgebGirisimciA', 'kosgebKapasite', 'kosgebKuresel']) {
      expect(gecerliDurum(p(id), KONTROL), id).toBe('kapandi')
    }
    for (const id of ['tubitak1507', 'tubitak1707', 'istka', 'ttgv']) expect(gecerliDurum(p(id), KONTROL), id).toBe('acik')
    for (const id of ['tubitak1505', 'tubitak1702', 'tubitak1509', 'kosgebIsKurma']) expect(gecerliDurum(p(id), KONTROL), id).toBe('surekli')
    expect(p('kosgebIsletmeGelistirme').durum).toBe('kaldirildi')
    expect(gecerliDurum(p('kosgebIsletmeGelistirme'), KONTROL)).toBe('kaldirildi')
  })

  it('TEKMER yerine Teknoloji Merkezi Destek Programı gelir', () => {
    const t = p('kosgebTekmer')
    expect(t.ad).toBe('KOSGEB Teknoloji Merkezi Destek Programı')
    expect(t.kaynak.url).toBe('https://www.kosgeb.gov.tr/site/tr/genel/destekdetay/9297/teknoloji-merkezi-destek-programi')
    expect(t.kosullar).toContain('Bu programa işletme doğrudan başvuramaz.')
  })

  it('faydalar doğrulama sonucunu izler', () => {
    for (const d of DOGRULAMA) {
      if (d.durum === 'bulunamadi' || d.id === 'turkpatent') continue
      expect(p(d.id).faydalar, d.id).toEqual(d.faydalar.map((f) => FAYDA_ESI[f]))
    }
    expect(p('turkpatent').faydalar).toEqual(['hizmet'])
    expect(p('teknogirisimRozeti').faydalar).toEqual(['destek_degil'])
    expect(p('hit30').faydalar).toHaveLength(6)
  })

  it('bölge ve tek kuruma bağlı program etiketleri doğrulamadan gelir', () => {
    expect(programEtiketleri('istka')).toEqual(['Yalnız belli il veya bölge: İstanbul'])
    expect(programEtiketleri('techIstanbul')).toEqual(['Yalnız belli il veya bölge: İstanbul', 'Tek kuruma bağlı özel program'])
    expect(programEtiketleri('ekip')).toEqual(['Tek kuruma bağlı özel program'])
    expect(programEtiketleri('turkpatent')).toEqual([])
  })

  it('yalnız resmî alıntısı olan çift kaynaklı kural olur', () => {
    const kural = iliskiBul(p('kanun5746'), p('kanun4691'))
    expect(kural?.iliski.state === 'kaynakli' && kural.iliski.value).toBe('dislayici')
    expect(kural?.iliski.alinti).toMatch(/ayrıca yararlanamazlar/)
    expect(iliskiBul(p('kanun4691'), p('kanun5746'))?.iliski.value).toBe('dislayici')
    expect(iliskiBul(p('tubitak1501'), p('tubitak1507'))?.iliski.value).toBe('uyumlu')
    expect(iliskiBul(p('kosgebGirisimciA'), p('kosgebGirisimciB'))?.iliski.value).toBe('dislayici')
    expect(iliskiBul(p('tubitak1501'), p('kanun5746'))).toBeUndefined()
    for (const x of PROGRAMLAR) for (const k of x.kombinasyon) expect(k.iliski.alinti, `${x.id} ${k.digerProgramId}`).toBeTruthy()
  })

  it('alıntısı ya da kaynağı bozuk Fact denetimden geçmez', () => {
    const bozuk = structuredClone(p('tubitak1501'))
    ;(bozuk.tutar.metin as { alinti: unknown }).alinti = 5
    expect(katalogHatalari([bozuk]).join('\n')).toMatch(/alıntı/)
    const bozukMetin = structuredClone(p('tubitak1501'))
    ;(bozukMetin as { metinKontrol: string }).metinKontrol = '12.08.2026'
    expect(katalogHatalari([bozukMetin]).join('\n')).toMatch(/metinKontrol/)
  })
})
