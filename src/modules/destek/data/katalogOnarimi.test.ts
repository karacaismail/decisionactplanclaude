import { expect, it } from 'vitest'
import { katalogHatalari, kurumSorusuHatalari } from './denetim'
import { KURUM_SORULARI } from './kurumSorulari'
import { PROGRAMLAR } from './programlar'
import { SOZLUK } from './sozluk'
import { sozlukAra } from '../metinler'

it('her program en az bir fayda taşır ve süreler bilinmiyor olarak başlar', () => {
  expect(PROGRAMLAR).toHaveLength(46)
  for (const p of PROGRAMLAR) {
    expect(p.faydalar.length, p.id).toBeGreaterThan(0)
    expect(p.sure.degerlendirme.state).toBe('bilinmiyor')
    expect(p.sure.ilkOdeme.state).toBe('bilinmiyor')
    expect(p.odemeBicimi.state).toBe('bilinmiyor')
  }
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
