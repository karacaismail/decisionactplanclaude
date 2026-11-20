import { describe, expect, it } from 'vitest'
import { PROGRAMLAR } from '../data/programlar'
import { eslestir, eslestirHepsi, sonrakiSorular } from './eslestir'
import { KURALLAR } from './kurallar'
import { BILMIYORUM, SORU_SIRASI, type DestekProfili } from './profil'

const BUGUN = '2026-11-19'
const program = (id: string) => {
  const p = PROGRAMLAR.find((x) => x.id === id)
  if (!p) throw new Error(id)
  return p
}

/** Kabul ölçütündeki örnek: 1 yaşında, 3 kişilik bir kafe. */
const KAFE: DestekProfili = { kurulus: { yil: 2025, ay: 11 }, calisan: 3, faaliyet: ['I'], ihracat: 'yok', arge: 'hayir' }

const HEPSI_BILMIYORUM: DestekProfili = Object.fromEntries(SORU_SIRASI.map((a) => [a, BILMIYORUM]))

describe('ön eşleşme', () => {
  it('kafe profilinde KOSGEB Küresel Rekabetçilik belki olur ve tutmayan koşulu söyler', () => {
    // Kurumun sayfasına göre dört yoldan biri yeterlidir. İki yol ihracat ya da Ar-Ge istemez. Bu yüzden ret kesin değildir.
    const sonuc = eslestir(program('kosgebKuresel'), KAFE, BUGUN)
    expect(sonuc.sonuc).toBe('belki')
    expect(sonuc.sorulanlarTuttu).toBe(false)
    expect(sonuc.nedenler.join(' ')).toMatch(/Sizin ihracatınız ve Ar-Ge çalışmanız yok\./)
    expect(sonuc.nedenler.join(' ')).toMatch(/ihracat/i)
    expect(sonuc.nedenler.join(' ')).toMatch(/Ar-Ge/)
  })

  it('kafe profilinde iş kolu tutmayan programlar uygun değildir', () => {
    expect(eslestir(program('kosgebGirisimciA'), KAFE, BUGUN).sonuc).toBe('uygun_degil')
    expect(eslestir(program('kosgebDijitalDonusum'), KAFE, BUGUN).sonuc).toBe('uygun_degil')
    expect(eslestir(program('tb10962Marka'), KAFE, BUGUN).sonuc).toBe('uygun_degil')
    expect(eslestir(program('argeMerkezi'), KAFE, BUGUN).sonuc).toBe('uygun_degil')
  })

  it('bilinmeyen bilgi hiçbir programda uygun sonucu vermez', () => {
    for (const profil of [{}, HEPSI_BILMIYORUM]) {
      const gruplar = eslestirHepsi(PROGRAMLAR, profil, BUGUN)
      expect(gruplar.uygun).toEqual([])
      expect(gruplar.uygunDegil).toEqual([])
      expect(gruplar.belki).toHaveLength(PROGRAMLAR.length)
    }
  })

  it('kuralı olmayan program belki olur ve koşulları okumayı ister', () => {
    // 1501 artık şirket türü kuralı taşır. Kefalet programının katalogda denetlenebilen koşulu yoktur.
    const sonuc = eslestir(program('kgf'), KAFE, BUGUN)
    expect(KURALLAR.kgf).toBeUndefined()
    expect(sonuc.sonuc).toBe('belki')
    expect(sonuc.kuralVar).toBe(false)
    expect(sonuc.nedenler).toEqual(['Koşulları kendiniz okuyun.'])
  })

  it('sorulan kurallar tutsa da denetlenmeyen koşul varsa sonuç belki olur', () => {
    const sonuc = eslestir(program('kosgebGirisimciA'), { kurulus: { yil: 2025, ay: 1 }, faaliyet: ['C'] }, BUGUN)
    expect(sonuc.sonuc).toBe('belki')
    expect(sonuc.sorulanlarTuttu).toBe(true)
    expect(sonuc.nedenler.join(' ')).toMatch(/Öteki koşulları/)
    expect(sonuc.denetlenenKosullar.length).toBe(2)
  })

  it('kafe profilinde yaş ya da çalışan kuralı tutan program uygun sayılmaz', () => {
    // BKS yalnız anonim şirkete açıktır. Bu yüzden tür anonim seçilir.
    const gruplar = eslestirHepsi(PROGRAMLAR, { ...KAFE, isletmeTuru: 'anonim' }, BUGUN)
    expect(gruplar.uygun).toEqual([])
    expect(gruplar.belki.find((e) => e.programId === 'bks')?.sorulanlarTuttu).toBe(true)
  })

  it('bu sürümde hiçbir kural seti eksiksiz değildir', () => {
    for (const [id, set] of Object.entries(KURALLAR)) expect(set.eksiksiz, id).toBeFalsy()
  })

  it('eksiksiz kural setinde bütün kurallar tutarsa sonuç uygundur', () => {
    const harita = { kosgebGirisimciA: { ...KURALLAR.kosgebGirisimciA, eksiksiz: true } }
    const profil: DestekProfili = { kurulus: { yil: 2025, ay: 1 }, faaliyet: ['C'] }
    expect(eslestir(program('kosgebGirisimciA'), profil, BUGUN, harita).sonuc).toBe('uygun')
    expect(eslestir(program('kosgebGirisimciA'), { faaliyet: ['C'] }, BUGUN, harita).sonuc).toBe('belki')
    expect(eslestir(program('kosgebGirisimciA'), { ...profil, kurulus: BILMIYORUM }, BUGUN, harita).sonuc).toBe('belki')
  })

  it('eksik bilgi belki sonucunu ve sonraki soruyu verir', () => {
    const sonuc = eslestir(program('kosgebGirisimciA'), { faaliyet: ['C'] }, BUGUN)
    expect(sonuc.sonuc).toBe('belki')
    // Kuruluş durumu bilinmiyor. Önce bu soru gelir. "Kuruldu" cevabından sonra tarih sorulur.
    expect(sonuc.sonrakiSorular).toEqual(['kurulusDurumu'])
    expect(eslestir(program('kosgebGirisimciA'), { faaliyet: ['C'], kurulusDurumu: 'kuruldu' }, BUGUN).sonrakiSorular).toEqual(['kurulus'])
  })

  it('bir kesin kural tutmazsa öteki bilgiler eksik olsa da sonuç uygun değildir', () => {
    const sonuc = eslestir(program('bks'), { calisan: 80 }, BUGUN)
    expect(sonuc.sonuc).toBe('uygun_degil')
    expect(sonuc.sonrakiSorular).toEqual([])
  })

  it('kesin olmayan kural tutmazsa sonuç belki olur', () => {
    const iskur = eslestir(program('iskurIep'), { calisan: 3 }, BUGUN)
    expect(iskur.sonuc).toBe('belki')
    expect(iskur.nedenler.join(' ')).toMatch(/5/)
    expect(iskur.sorulanlarTuttu).toBe(false)
    expect(eslestir(program('iskurIep'), { calisan: 5 }, BUGUN).sorulanlarTuttu).toBe(true)
    expect(eslestir(program('istka'), { il: 'Ankara' }, BUGUN).sorulanlarTuttu).toBe(false)
    expect(eslestir(program('istka'), { il: 'İstanbul' }, BUGUN).sorulanlarTuttu).toBe(true)
  })

  it('yaş sınırına yakın işletme kesin sonuç almaz', () => {
    // 3 yıl 5 ay: "en çok 3 yaşında" kuralı iki türlü okunabilir.
    expect(eslestir(program('kosgebGirisimciA'), { kurulus: { yil: 2023, ay: 6 }, faaliyet: ['C'] }, BUGUN).sonuc).toBe('belki')
    expect(eslestir(program('kosgebGirisimciA'), { kurulus: { yil: 2021, ay: 6 }, faaliyet: ['C'] }, BUGUN).sonuc).toBe('uygun_degil')
    // Ay bilinmezse aralık genişler.
    expect(eslestir(program('kosgebGirisimciA'), { kurulus: { yil: 2023 }, faaliyet: ['C'] }, BUGUN).sonuc).toBe('belki')
  })

  it('bilişim iş kolu kesin NACE kodu bilinmeden uygun olmaz', () => {
    expect(eslestir(program('kosgebGirisimciA'), { kurulus: { yil: 2025, ay: 1 }, faaliyet: ['J'] }, BUGUN).sonuc).toBe('belki')
  })

  it('KOSGEB kaydı olmayan işletme kayıt isteyen programda uygun değildir', () => {
    const sonuc = eslestir(program('kosgebIsletmeGelistirme'), { kosgeb: 'hayir' }, BUGUN)
    expect(sonuc.sonuc).toBe('uygun_degil')
    expect(sonuc.nedenler.join(' ')).toMatch(/KOSGEB kaydı/)
  })

  it('kurucu durumu kadın ya da genç değilse faiz desteği uygun değildir', () => {
    expect(eslestir(program('kosgebGirisimciB'), { kurucu: [] }, BUGUN).sonuc).toBe('uygun_degil')
    expect(eslestir(program('kosgebGirisimciB'), { kurucu: ['kadin'] }, BUGUN).sorulanlarTuttu).toBe(true)
  })

  it('sonuçlar katalog sırasını korur ve puanlanmaz', () => {
    const gruplar = eslestirHepsi(PROGRAMLAR, KAFE, BUGUN)
    const sira = [...gruplar.uygun, ...gruplar.belki, ...gruplar.uygunDegil]
    expect(sira).toHaveLength(PROGRAMLAR.length)
    const index = (id: string) => PROGRAMLAR.findIndex((p) => p.id === id)
    for (const grup of [gruplar.uygun, gruplar.belki, gruplar.uygunDegil]) {
      const ids = grup.map((e) => index(e.programId))
      expect(ids).toEqual([...ids].sort((a, b) => a - b))
    }
    expect(Object.keys(sira[0]).sort()).toEqual(['denetlenenKosullar', 'kuralVar', 'nedenler', 'programId', 'sonrakiSorular', 'sonuc', 'sorulanlarTuttu', 'tutanAlanlar'])
  })

  it('sonraki sorular soru sırasıyla ve tekrarsız gelir', () => {
    const gruplar = eslestirHepsi(PROGRAMLAR, { faaliyet: ['C'] }, BUGUN)
    const sorular = sonrakiSorular([...gruplar.belki, ...gruplar.uygun, ...gruplar.uygunDegil])
    expect(sorular).toEqual(SORU_SIRASI.filter((a) => sorular.includes(a)))
    expect(new Set(sorular).size).toBe(sorular.length)
    expect(sorular).not.toContain('faaliyet')
    expect(sorular).toContain('kurulusDurumu')
  })

  it('her kural katalogdaki bir programa bağlıdır', () => {
    const ids = new Set(PROGRAMLAR.map((p) => p.id))
    for (const id of Object.keys(KURALLAR)) expect(ids.has(id), id).toBe(true)
  })
})
