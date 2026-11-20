import { describe, expect, it } from 'vitest'
import { katalogHatalari } from './denetim'
import { PROGRAMLAR } from './programlar'
import type { Program } from './tipler'
import { eskiMetniGoster, tutarVarMi } from '../motor/tazelik'

const temiz = (): Program => structuredClone(PROGRAMLAR.find((p) => p.id === 'tubitak1501')!) as Program

/** Bozuk kopyayı denetler. Hata listesinde beklenen metin aranır. */
function hatalar(bozan: (p: Program) => void, ek: Program[] = []): string {
  const p = temiz()
  bozan(p)
  return katalogHatalari([p, ...ek]).join('\n')
}

describe('katalog denetimi', () => {
  it('katalog temizdir ve 46 program taşır', () => {
    expect(katalogHatalari(PROGRAMLAR)).toEqual([])
    expect(PROGRAMLAR).toHaveLength(46)
  })

  it('kaynaksız sayıyı reddeder', () => {
    expect(hatalar((p) => {
      ;(p.tutar as { tavanTL: unknown }).tavanTL = { state: 'kaynakli', value: 5, sourceUrl: '', asOf: '2026-08-12' }
    })).toMatch(/kaynak/i)
    expect(hatalar((p) => {
      ;(p.tutar as { tavanTL: unknown }).tavanTL = { state: 'kaynakli', value: 5, sourceUrl: 'https://ornek.gov.tr' }
    })).toMatch(/tarih/i)
    expect(hatalar((p) => {
      ;(p as unknown as Record<string, unknown>).puan = 7
    })).toMatch(/Fact/)
  })

  it('kaynaklı sayının değeri gerçek bir sayı olmalı', () => {
    expect(hatalar((p) => {
      ;(p.tutar as { tavanTL: unknown }).tavanTL = { state: 'kaynakli', value: Number.NaN, sourceUrl: 'https://ornek.gov.tr', asOf: '2026-08-12' }
    })).toMatch(/değer/i)
  })

  it('bilinmeyen sabit değeri reddeder', () => {
    expect(hatalar((p) => { (p as { kategori: string }).kategori = 'bagis' })).toMatch(/kategori/)
    expect(hatalar((p) => { (p as { durum: string }).durum = 'belki' })).toMatch(/durum/)
    expect(hatalar((p) => { (p.tutar as { tavanTuru: string }).tavanTuru = 'cok' })).toMatch(/tavanTuru/)
    expect(hatalar((p) => { (p as { kombinasyon: unknown }).kombinasyon = [{ digerProgramId: 'tubitak1507', yonlu: false, iliski: { ...p.tutar.metin, value: 'iyi' } }] })).toMatch(/kombinasyon/)
    expect(hatalar((p) => { (p as { tutar: { tavanTL: { state: string } } }).tutar.tavanTL.state = 'tahmin' })).toMatch(/state/)
  })

  it('aynı kimliği reddeder', () => {
    expect(hatalar(() => undefined, [temiz()])).toMatch(/kimlik/i)
  })

  it('https olmayan ya da bozuk adresi reddeder', () => {
    expect(hatalar((p) => { p.kaynak.url = 'http://tubitak.gov.tr' })).toMatch(/https/)
    expect(hatalar((p) => { p.kaynak.url = 'https://' })).toMatch(/adres/i)
    expect(hatalar((p) => { (p.tarihler[0].tarih as { sourceUrl: string }).sourceUrl = 'javascript:alert(1)' })).toMatch(/https/)
  })

  it('ISO biçiminde olmayan tarihi reddeder', () => {
    expect(hatalar((p) => { p.kaynak.asOf = '12.08.2026' })).toMatch(/tarih/i)
    expect(hatalar((p) => { (p.tarihler[0].tarih as { value: string }).value = '2026-02-30' })).toMatch(/tarih/i)
  })

  it('bilinmeyen kombinasyon kimliğini reddeder', () => {
    expect(hatalar((p) => { p.kombinasyon = [{ digerProgramId: 'yokProgram', yonlu: false, iliski: { ...p.tutar.metin, state: 'kaynakli', value: 'uyumlu' } }] })).toMatch(/kombinasyon/)
    expect(hatalar((p) => { p.kombinasyon = [{ digerProgramId: 'tubitak1501', yonlu: false, iliski: { ...p.tutar.metin, state: 'kaynakli', value: 'uyumlu' } }] })).toMatch(/kendini/)
  })

  it('yasak işaretleri ve tek işletmeye göre yazılmış sözleri reddeder', () => {
    expect(hatalar((p) => { p.kosullar = ['Süre 24 ay; uzatılabilir.'] })).toMatch(/işaret/)
    expect(hatalar((p) => { p.kosullar = ['Bu destek bugün sağlanmıyor.'] })).toMatch(/işletme/)
    expect(hatalar((p) => { p.ozet = 'Kapsam dışıdır.' })).toMatch(/işletme/)
  })

  it('her ekranda görünen alanlarda tutar reddedilir', () => {
    expect(hatalar((p) => { p.ozet = 'TÜBİTAK projelere 20.000.000 TL verir.' })).toMatch(/tutar/)
    expect(hatalar((p) => { p.kanal = 'Başvuru ücreti 500 TL olan sistem' })).toMatch(/tutar/)
  })

  it('özet tek cümledir ve kısadır', () => {
    expect(hatalar((p) => { p.ozet = 'Birinci cümle. İkinci cümle.' })).toMatch(/özet/i)
    expect(hatalar((p) => { p.ozet = 'Bu özet bilerek çok uzun yazıldı ve on altı kelimeden fazla kelime taşıdığı için bu denetimden asla geçmemelidir.' })).toMatch(/özet/i)
  })

  it('eski tutar, oran, süre ve tarih yerine bilgi verir', () => {
    for (const p of PROGRAMLAR) {
      const metinler = [p.ad, p.ozet, p.destekTuru, p.kanal, ...p.kosullar, ...p.uygunGider, ...p.haricGider, ...p.belgeler, p.tutar.metin.value ?? '']
      for (const m of metinler) expect(tutarVarMi(eskiMetniGoster(m, p.kaynak, '2026-11-19')), `${p.id}: ${m}`).toBe(false)
    }
    for (const metin of ["Sınır 100.000.000 TL'dir.", 'Eşik 2 milyar TL dolayındadır.', 'Oran %75 olur.', 'Proje 24 ay sürer.', 'İki tam yıl sürer.', 'İki yılın sonunda biter.', 'Gider 24 ayda ödenir.', 'Başvuru 1 Ocak 2027 günü başlar.']) {
      expect(eskiMetniGoster(metin, temiz().kaynak, '2026-11-19')).toBe('Bilinmiyor. Bilgi eski.')
      expect(eskiMetniGoster(metin, temiz().kaynak, '2026-09-01')).toBe(metin)
    }
    expect(tutarVarMi('1709 EUREKA ve Eurostars-3')).toBe(false)
  })
})
