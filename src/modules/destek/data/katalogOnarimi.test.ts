import { expect, it } from 'vitest'
import { katalogHatalari, kurumSorusuHatalari } from './denetim'
import { KURUM_SORULARI } from './kurumSorulari'
import { PROGRAMLAR } from './programlar'
import { SOZLUK } from './sozluk'
import { sozlukAra } from '../metinler'

it('her program en az bir fayda taşır, süre yalnız resmî kaynakla bilinir', () => {
  expect(PROGRAMLAR).toHaveLength(46)
  for (const p of PROGRAMLAR) {
    expect(p.faydalar.length, p.id).toBeGreaterThan(0)
    for (const fact of [p.sure.degerlendirme, p.sure.ilkOdeme, p.odemeBicimi]) {
      if (fact.state !== 'kaynakli') continue
      // 20 Kasım 2026 doğrulamasından gelir. Kaynak adresi ve alıntı taşır.
      expect(fact.sourceUrl, p.id).toMatch(/^https:\/\//)
      expect(fact.asOf, p.id).toBe('2026-11-20')
    }
    // Resmî metinlerin hiçbiri ilk ödeme süresini yazmıyor.
    expect(p.sure.ilkOdeme.state, p.id).toBe('bilinmiyor')
  }
  expect(PROGRAMLAR.filter((p) => p.sure.degerlendirme.state === 'kaynakli').map((p) => p.id).sort()).toEqual(['bigg1812', 'eic', 'eureka1709', 'hit30', 'istka', 'kosgebGirisimciA', 'turcorn'])
  // Kaynağı bulunamayan programın süresi ve ödeme biçimi bilinmiyor kalır.
  for (const id of ['eximbank', 'meslekOrgutleri']) expect(PROGRAMLAR.find((p) => p.id === id)!.odemeBicimi.state).toBe('bilinmiyor')
})

it('katalog kaynaksız süreyi reddeder', () => {
  const [p] = PROGRAMLAR
  const sure = { ...p.sure, ilkOdeme: { state: 'kaynakli' as const, value: 'Başvurudan sonra bir ay', sourceUrl: '', asOf: p.kaynak.asOf } }
  expect(katalogHatalari([{ ...p, sure }])).toContainEqual(expect.stringMatching(/sure\.ilkOdeme.*kaynak/))
})

it('sözlük kısa ve sayısızdır, İngilizce karşılıklar aramada çalışır', () => {
  for (const t of SOZLUK) {
    expect(t.anlam.split(/\s+/).length, t.ad).toBeLessThanOrEqual(15)
    expect(t.anlam, t.ad).not.toMatch(/\p{N}/u)
  }
  expect(sozlukAra(SOZLUK, 'CaPeX').map((t) => t.ad)).toEqual(['Sabit yatırım'])
  expect(sozlukAra(SOZLUK, 'OPEX').map((t) => t.ad)).toEqual(['İşletme gideri'])
})

it('altı kurum sorusu grubu genel ve yalın Türkçe kullanır', () => {
  expect(new Set(KURUM_SORULARI.map((s) => s.grup)).size).toBe(6)
  expect(KURUM_SORULARI).toHaveLength(19)
  expect(kurumSorusuHatalari(KURUM_SORULARI)).toEqual([])
  expect(kurumSorusuHatalari([{ id: 'ornek', grup: 'Giderler', soru: 'Şirketimiz gideri öder mi; bugün mü?' }])).toHaveLength(2)
})

it('bir programın iki tarihi aynı adı taşıyamaz', () => {
  const p = PROGRAMLAR.find((x) => x.tarihler.length > 0)!
  const tarihler = [p.tarihler[0], { ...p.tarihler[0] }]
  expect(katalogHatalari([{ ...p, tarihler }])).toContainEqual(expect.stringMatching(/tarihler\[1\]\.ad.*aynı/))
  expect(katalogHatalari(PROGRAMLAR)).toEqual([])
})
