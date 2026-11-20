import { describe, expect, it } from 'vitest'
import { PROGRAMLAR } from '../data/programlar'
import { KOMBINASYONLAR } from '../data/tipler'
import { KOMBINASYON_METNI } from '../metinler'
import { basvuruCiftleri, iliskiBul, programIliskileri, uyariMi } from './kombinasyon'

const p = (id: string) => PROGRAMLAR.find((x) => x.id === id)!
const b = (id: string, programId: string) => ({ id, programId, programAdi: PROGRAMLAR.find((x) => x.id === programId)?.ad ?? programId })

describe('birlikte kullanma', () => {
  it('katalogdaki her ilişki türünün yalın açıklaması vardır', () => {
    const turler = new Set(PROGRAMLAR.flatMap((x) => Object.values(x.kombinasyon)))
    expect([...turler].sort()).toEqual([...KOMBINASYONLAR].sort())
    for (const t of KOMBINASYONLAR) {
      expect(KOMBINASYON_METNI[t].baslik.length).toBeGreaterThan(0)
      expect(KOMBINASYON_METNI[t].aciklama).toMatch(/\.$/)
    }
    expect(KOMBINASYON_METNI.ayri_gider.kisa).toBe('Aynı faturayı iki programa yazmayın.')
  })

  it('ilişki iki yönden de okunur', () => {
    expect(iliskiBul(p('kosgebIsKurma'), p('kosgebGirisimciA'))).toEqual({ tur: 'onkosul' })
    expect(iliskiBul(p('kosgebGirisimciA'), p('kosgebIsKurma'))).toEqual({ tur: 'onkosul' })
  })

  it('iki kayıt farklıysa sıkı olan önce gelir ve fark söylenir', () => {
    expect(iliskiBul(p('kosgebGirisimciA'), p('bks'))).toEqual({ tur: 'dislayici', farkli: 'ayri_gider' })
    expect(iliskiBul(p('bks'), p('kosgebGirisimciA'))).toEqual({ tur: 'dislayici', farkli: 'ayri_gider' })
    expect(iliskiBul(p('tubitak1711'), p('tubitak1505'))).toEqual({ tur: 'ayri_gider', farkli: 'onkosul' })
  })

  it('kayıt yoksa ilişki bilinmez', () => {
    expect(iliskiBul(p('kgf'), p('turkpatent'))).toBeUndefined()
    expect(iliskiBul(p('kgf'), undefined)).toBeUndefined()
  })

  it('program kartı ilişkileri türlere göre gruplar', () => {
    const gruplar = programIliskileri(p('tubitak1501'), PROGRAMLAR)
    expect(gruplar.map((g) => g.tur)).toEqual(['ayri_gider', 'uyumlu'])
    const ayri = gruplar[0].programlar.map((x) => x.program.id)
    expect(ayri).toContain('tubitak1507')
    // 1702 yalnız kendi kaydında 1501 programını yazar. Ters yön de gruba girer.
    expect(ayri).toContain('tubitak1702')
    expect(gruplar[1].programlar.map((x) => x.program.id)).toEqual(expect.arrayContaining(['bks', 'bigg1812', 'kosgebIsletmeGelistirme']))
    expect(programIliskileri(p('kosgebTekmer'), PROGRAMLAR)).toEqual([])
  })

  it('başvuru çiftlerinde uyarılar önce gelir, bilinmeyen çift "Bilgi yok" olur', () => {
    const ciftler = basvuruCiftleri([b('b1', 'kgf'), b('b2', 'bigg1812'), b('b3', 'kosgebGirisimciA'), b('b4', 'tubitak1501')], PROGRAMLAR)
    expect(ciftler).toHaveLength(6)
    expect(ciftler[0]).toMatchObject({ a: { id: 'b2' }, b: { id: 'b3' }, iliski: { tur: 'dislayici' } })
    expect(uyariMi(ciftler[0].iliski)).toBe(true)
    const ayri = ciftler.find((c) => c.a.id === 'b3' && c.b.id === 'b4')
    expect(ayri?.iliski).toEqual({ tur: 'ayri_gider' })
    expect(uyariMi(ayri?.iliski)).toBe(true)
    const uyumlu = ciftler.find((c) => c.a.id === 'b2' && c.b.id === 'b4')
    expect(uyumlu?.iliski).toEqual({ tur: 'uyumlu' })
    expect(uyariMi(uyumlu?.iliski)).toBe(false)
    expect(ciftler.at(-1)?.iliski).toBeUndefined()
    expect(uyariMi(undefined)).toBe(false)
  })

  it('katalogdan çıkmış programın çifti "Bilgi yok" olur', () => {
    const [cift] = basvuruCiftleri([b('b1', 'silinmisProgram'), b('b2', 'kgf')], PROGRAMLAR)
    expect(cift.iliski).toBeUndefined()
    expect(cift.a.programAdi).toBe('silinmisProgram')
  })

  it('farklı kayıtta öteki kayıt da uyarıysa çift uyarı sayılır', () => {
    expect(uyariMi({ tur: 'onkosul', farkli: 'ayri_gider' })).toBe(true)
  })
})
