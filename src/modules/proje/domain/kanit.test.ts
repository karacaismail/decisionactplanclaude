import { describe, expect, it } from 'vitest'
import { KANIT_SINIRI, kanitMetni } from './kanit'
import type { Is, Proje } from './model'

const proje: Proje = { id: 'p1', planId: 'plan-1', ad: 'Amazon satışını büyüt', moveRowId: 'm1', baslangic: '2026-11-19', bitis: '2026-12-18', sorumlu: 'Dijital ekip', aciklama: '', olusturma: '2026-11-19T07:00:00.000Z' }
const is = (id: string, durum: Is['durum'], baslik: string, sonTarih = ''): Is => ({ id, projeId: 'p1', baslik, durum, sorumlu: '', sonTarih, not: '', sira: 1 })

describe('kanıt taslağı metni', () => {
  it('projenin sonucunu sayılarla ve biten işlerle yazar', () => {
    const metin = kanitMetni(proje, [is('a', 'bitti', 'Fotoğrafları yenile'), is('b', 'yapiliyor', 'İlanı yaz', '2026-11-01'), is('c', 'iptal', 'Reklam ver')], '2026-11-19')
    expect(metin).toBe([
      'Proje: Amazon satışını büyüt.',
      'Tarih: 19 Kasım 2026 Perşembe.',
      'Projede 3 iş var. 1 iş bitti. 1 iş açık. 1 iş iptal edildi.',
      '1 işin son tarihi geçti.',
      'Biten işler: Fotoğrafları yenile.',
    ].join('\n'))
  })

  it('iş yoksa bunu açıkça yazar', () => {
    expect(kanitMetni(proje, [], '2026-11-19')).toBe('Proje: Amazon satışını büyüt.\nTarih: 19 Kasım 2026 Perşembe.\nProjede henüz iş yok.')
  })

  it('metni 2000 karakteri aşmaz', () => {
    const cok = Array.from({ length: 500 }, (_, n) => is(`i${n}`, 'bitti', 'x'.repeat(150)))
    expect(kanitMetni(proje, cok, '2026-11-19').length).toBeLessThanOrEqual(KANIT_SINIRI)
  })
})
