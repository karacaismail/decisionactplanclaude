import { describe, expect, it } from 'vitest'
import { katalogHatalari } from './denetim'
import { PROGRAMLAR } from './programlar'
import type { Program } from './tipler'
import { tutarlariGizle, tutarVarMi } from '../motor/tazelik'

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
    expect(hatalar((p) => { (p as { kombinasyon: Record<string, string> }).kombinasyon = { tubitak1507: 'iyi' } })).toMatch(/kombinasyon/)
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
    expect(hatalar((p) => { (p as { kombinasyon: Record<string, string> }).kombinasyon = { yokProgram: 'uyumlu' } })).toMatch(/kombinasyon/)
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

  it('eski bilgide gizleme bütün metinlerdeki tutarları kaldırır', () => {
    for (const p of PROGRAMLAR) {
      const metinler = [p.ad, p.ozet, p.destekTuru, p.kanal, ...p.kosullar, ...p.uygunGider, ...p.haricGider, ...p.belgeler, p.tutar.metin.value ?? '']
      for (const m of metinler) expect(tutarVarMi(tutarlariGizle(m)), `${p.id}: ${m}`).toBe(false)
    }
    expect(tutarlariGizle("Sınır 100.000.000 TL'dir.")).toBe('Sınır (tutar gizlendi).')
    expect(tutarlariGizle('Eşik 2 milyar TL dolayındadır.')).toBe('Eşik (tutar gizlendi) dolayındadır.')
    expect(tutarlariGizle('Oran %75 olur.')).toBe('Oran %75 olur.')
    expect(tutarVarMi('1709 EUREKA ve Eurostars-3')).toBe(false)
  })
})
