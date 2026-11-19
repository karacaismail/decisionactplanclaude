import { describe, expect, it } from 'vitest'
import { SINIR } from './model'
import { dilimiDogrula } from './dilim'

const projeKaydi = (id = 'p1', over: Record<string, unknown> = {}) => ({
  id, planId: 'eski-plan', ad: 'Amazon satışını büyüt', moveRowId: 'satir-1', baslangic: '2026-11-19', bitis: '', sorumlu: '', aciklama: '', olusturma: '2026-11-19T07:00:00.000Z', ...over,
})
const isKaydi = (id = 'i1', over: Record<string, unknown> = {}) => ({
  id, projeId: 'p1', baslik: 'Fotoğrafları yenile', durum: 'yapilacak', sorumlu: '', sonTarih: '', not: '', sira: 1, ...over,
})
const dilim = (entries: [string, unknown][]) => ({ schemaVersion: 1, entries })

describe('dışa ve içe aktarma dilimi', () => {
  it('geçerli dilimi yeni plan kimliğine taşır', () => {
    const sonuc = dilimiDogrula(dilim([['proje/p1', projeKaydi()], ['is/i1', isKaydi()]]), 'yeni-plan')
    expect(sonuc.schemaVersion).toBe(1)
    expect(sonuc.entries).toEqual([['proje/p1', { ...projeKaydi(), planId: 'yeni-plan' }], ['is/i1', isKaydi()]])
  })

  it('bilinmeyen alanları atar', () => {
    const sonuc = dilimiDogrula(dilim([['proje/p1', projeKaydi('p1', { kotu: '<script>' })], ['is/i1', isKaydi('i1', { fazla: 1 })]]), 'yeni-plan')
    expect(sonuc.entries[0][1]).not.toHaveProperty('kotu')
    expect(sonuc.entries[1][1]).not.toHaveProperty('fazla')
  })

  it('bozuk biçimi ve yanlış sürümü reddeder', () => {
    expect(() => dilimiDogrula(null, 'p')).toThrow(/okunamadı/)
    expect(() => dilimiDogrula({ schemaVersion: 1 }, 'p')).toThrow(/okunamadı/)
    expect(() => dilimiDogrula({ schemaVersion: 2, entries: [] }, 'p')).toThrow(/sürüm/)
  })

  it('bilinmeyen anahtarı ve kimlik uyuşmazlığını reddeder', () => {
    expect(() => dilimiDogrula(dilim([['baska/p1', projeKaydi()]]), 'p')).toThrow(/geçersiz kayıt/)
    expect(() => dilimiDogrula(dilim([['proje/../x', projeKaydi()]]), 'p')).toThrow(/geçersiz kayıt/)
    expect(() => dilimiDogrula(dilim([['proje/p2', projeKaydi('p1')]]), 'p')).toThrow(/geçersiz kayıt/)
  })

  it('yanlış türdeki alanları reddeder', () => {
    expect(() => dilimiDogrula(dilim([['proje/p1', projeKaydi('p1', { ad: 5 })]]), 'p')).toThrow(/geçersiz kayıt/)
    expect(() => dilimiDogrula(dilim([['proje/p1', projeKaydi('p1', { ad: '  ' })]]), 'p')).toThrow(/geçersiz kayıt/)
    expect(() => dilimiDogrula(dilim([['proje/p1', projeKaydi('p1', { baslangic: 'dün' })]]), 'p')).toThrow(/geçersiz kayıt/)
    expect(() => dilimiDogrula(dilim([['proje/p1', projeKaydi()], ['is/i1', isKaydi('i1', { durum: 'belki' })]]), 'p')).toThrow(/geçersiz kayıt/)
    expect(() => dilimiDogrula(dilim([['proje/p1', projeKaydi()], ['is/i1', isKaydi('i1', { sira: 'bir' })]]), 'p')).toThrow(/geçersiz kayıt/)
  })

  it('projesi olmayan işi ve tekrarlanan kaydı reddeder', () => {
    expect(() => dilimiDogrula(dilim([['is/i1', isKaydi()]]), 'p')).toThrow(/projesi yok/)
    expect(() => dilimiDogrula(dilim([['proje/p1', projeKaydi()], ['proje/p1', projeKaydi()]]), 'p')).toThrow(/iki kez/)
  })

  it('sınırı aşan uzunluğu ve sayıyı reddeder', () => {
    expect(() => dilimiDogrula(dilim([['proje/p1', projeKaydi('p1', { aciklama: 'a'.repeat(SINIR.aciklama + 1) })]]), 'p')).toThrow(/geçersiz kayıt/)
    const cok = Array.from({ length: SINIR.projePerPlan + 1 }, (_, n): [string, unknown] => [`proje/p${n}`, projeKaydi(`p${n}`)])
    expect(() => dilimiDogrula(dilim(cok), 'p')).toThrow(/en çok/)
    const isler = Array.from({ length: SINIR.isPerProje + 1 }, (_, n): [string, unknown] => [`is/i${n}`, isKaydi(`i${n}`)])
    expect(() => dilimiDogrula(dilim([['proje/p1', projeKaydi()], ...isler]), 'p')).toThrow(/en çok/)
  })
})
