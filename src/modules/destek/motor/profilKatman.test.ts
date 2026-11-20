/**
 * Konsey planı B.5: ölçekli profil ve katmanlı sorular.
 * Kurallar yalnız katalogdaki açık koşullardan türetilir. Her testteki program koşulu katalogda yazar.
 */
import { describe, expect, it } from 'vitest'
import { PROGRAMLAR } from '../data/programlar'
import type { Program } from '../data/tipler'
import { SORULAR } from '../metinler'
import { eslestir, eslestirHepsi, netlestirmeSorulari, sonucNotu, tercihSirala, tercihUymuyor, type EslesmeGruplari } from './eslestir'
import { KURALLAR } from './kurallar'
import {
  akisiGuncelle, BILMIYORUM, ISLETME_TURLERI, KURULUS_DURUMLARI, OLCEKLER, profilOku, SIHIRBAZ_EN_COK_SORU, SORU_SIRASI, sorulacaklar, TEMEL_SORULAR,
  type Alan, type DestekProfili,
} from './profil'

const BUGUN = '2026-11-20'
const program = (id: string): Program => {
  const p = PROGRAMLAR.find((x) => x.id === id)
  if (!p) throw new Error(id)
  return p
}
const sonuc = (id: string, profil: DestekProfili) => eslestir(program(id), profil, BUGUN).sonuc
const listede = (g: EslesmeGruplari) => [...g.uygun, ...g.belki]

/** Kural setinde bu alana bağlı bir kural var mı? */
const alanaBagli = (programId: string, alan: Alan) => (KURALLAR[programId]?.kurallar ?? []).some((k) => k.alanlar.includes(alan))

describe('profilin yeni alanları', () => {
  it('seçenekler plandaki gibidir', () => {
    expect(KURULUS_DURUMLARI).toEqual(['kuruldu', 'kurulmadi'])
    expect(OLCEKLER).toEqual(['mikro', 'kucuk', 'orta', 'buyuk'])
    expect(ISLETME_TURLERI).toEqual(['sahis', 'limited', 'anonim', 'kooperatif', 'diger', 'secilmedi'])
  })

  it('geçerli değerler okunur, geçersiz değerler atılır', () => {
    expect(profilOku({ kurulusDurumu: 'kurulmadi', olcek: 'orta', isletmeTuru: 'kooperatif' }, BUGUN)).toEqual({ kurulusDurumu: 'kurulmadi', olcek: 'orta', isletmeTuru: 'kooperatif' })
    expect(profilOku({ kurulusDurumu: BILMIYORUM, olcek: BILMIYORUM, isletmeTuru: BILMIYORUM }, BUGUN)).toEqual({ kurulusDurumu: BILMIYORUM, olcek: BILMIYORUM, isletmeTuru: BILMIYORUM })
    expect(profilOku({ kurulusDurumu: 'evet', olcek: 'dev', isletmeTuru: 'vakif' }, BUGUN)).toEqual({})
  })

  it('tercih süzgeci profilde saklanır, bozuk tercih atılır', () => {
    expect(profilOku({ tercih: { krediIstemiyorum: true, hisseIstemiyorum: false } }, BUGUN)).toEqual({ tercih: { krediIstemiyorum: true, hisseIstemiyorum: false } })
    expect(profilOku({ tercih: { krediIstemiyorum: 'evet' } }, BUGUN)).toEqual({})
  })

  it('eski profil açılır ve yeni alanlar boş kalır', () => {
    const eski = profilOku({ kurulus: { yil: 2025, ay: 11 }, calisan: 3, faaliyet: ['I'], ihracat: 'yok', arge: 'hayir' }, BUGUN)
    expect(eski).toEqual({ kurulus: { yil: 2025, ay: 11 }, calisan: 3, faaliyet: ['I'], ihracat: 'yok', arge: 'hayir' })
    const g = eslestirHepsi(PROGRAMLAR, eski, BUGUN)
    expect(g.uygun).toEqual([])
    // Boş alan "Bilmiyorum" sayılır. Tür koşulu olan program "Belki" olur ve tür sorusunu ister.
    const e = eslestir(program('tubitak1501'), eski, BUGUN)
    expect(e.sonuc).toBe('belki')
    // 1501 doğrulamadan sonra KOBİ ölçeği de ister. Bu yüzden ölçek sorusu da gelir.
    expect(e.sonrakiSorular).toEqual(['olcek', 'isletmeTuru'])
    // Kuruluş tarihi olan eski profil kurulmuş sayılır. Yaş kuralı eskisi gibi çalışır.
    expect(sonuc('tb10962Marka', eski)).toBe('uygun_degil')
  })
})

describe('soru katmanları', () => {
  it('temel akış en çok 5 sorudur', () => {
    expect(TEMEL_SORULAR.length).toBeLessThanOrEqual(5)
    expect(SIHIRBAZ_EN_COK_SORU).toBe(5)
    expect(sorulacaklar({})).toEqual([...TEMEL_SORULAR])
    expect(TEMEL_SORULAR).toEqual(['kurulusDurumu', 'kurulus', 'olcek', 'isletmeTuru', 'faaliyet'])
  })

  it('kuruluş tarihi yalnız işletme kurulduysa sorulur', () => {
    const liste = sorulacaklar({})
    expect(akisiGuncelle(liste, 0, { kurulusDurumu: 'kurulmadi' })).toEqual(['kurulusDurumu', 'olcek', 'isletmeTuru', 'faaliyet'])
    expect(akisiGuncelle(liste, 0, { kurulusDurumu: BILMIYORUM })).toEqual(['kurulusDurumu', 'olcek', 'isletmeTuru', 'faaliyet'])
    expect(akisiGuncelle(liste, 0, { kurulusDurumu: 'kuruldu' })).toEqual(liste)
    // İkinci katmanda "kuruldu" cevabı tarih sorusunu hemen arkasına ekler.
    expect(akisiGuncelle(['kurulusDurumu', 'calisan'], 0, { kurulusDurumu: 'kuruldu' })).toEqual(['kurulusDurumu', 'kurulus', 'calisan'])
    expect(akisiGuncelle(['kurulusDurumu', 'calisan'], 0, { kurulusDurumu: 'kuruldu', kurulus: { yil: 2020 } })).toEqual(['kurulusDurumu', 'calisan'])
    expect(sorulacaklar({ kurulusDurumu: 'kurulmadi' }, ['kurulus', 'olcek'])).toEqual(['olcek'])
  })

  it('her soru en az bir kurala bağlıdır', () => {
    for (const alan of SORU_SIRASI) expect(Object.keys(KURALLAR).some((id) => alanaBagli(id, alan)), alan).toBe(true)
  })

  it('e-imza ve kurum sistemi kaydı sorulmaz', () => {
    const metin = JSON.stringify(SORU_SIRASI.map((a) => SORULAR[a]))
    expect(metin).not.toMatch(/imza|EİDS|e-Devlet|sistem kayd/iu)
  })

  it('ikinci katman yalnız "Belki" sonucunu netleştiren cevaplanmamış soruları ister', () => {
    const profil: DestekProfili = { kurulusDurumu: 'kuruldu', kurulus: { yil: 2025, ay: 11 }, olcek: 'mikro', isletmeTuru: 'sahis', faaliyet: ['I'], ihracat: BILMIYORUM }
    const g = eslestirHepsi(PROGRAMLAR, profil, BUGUN)
    const sorular = netlestirmeSorulari(g, profil)
    expect(sorular).toEqual(SORU_SIRASI.filter((a) => sorular.includes(a)))
    expect(sorular).toContain('calisan')
    // Cevaplanmış soru tekrar sorulmaz. "Bilmiyorum" da bir cevaptır.
    for (const a of ['kurulusDurumu', 'kurulus', 'olcek', 'isletmeTuru', 'faaliyet', 'ihracat'] as const) expect(sorular).not.toContain(a)
    // "Uygun değil" programın sorusu ikinci katmana girmez.
    const yalnizRet: EslesmeGruplari = { uygun: [], belki: [], uygunDegil: g.belki.filter((e) => e.sonrakiSorular.length) }
    expect(netlestirmeSorulari(yalnizRet, profil)).toEqual([])
  })
})

describe('bilinmeyen cevap kuralı', () => {
  const alanlar = ['kurulusDurumu', 'olcek', 'isletmeTuru'] as const
  const ornek: Record<(typeof alanlar)[number], string> = { kurulusDurumu: 'tb10962Marka', olcek: 'tubitak1507', isletmeTuru: 'bks' }

  for (const alan of alanlar) {
    it(`${alan} için "Bilmiyorum" cevabı programı en çok "Belki" yapar`, () => {
      const id = ornek[alan]
      expect(alanaBagli(id, alan)).toBe(true)
      const e = eslestir(program(id), { [alan]: BILMIYORUM }, BUGUN)
      expect(e.sonuc).toBe('belki')
      expect(e.sonrakiSorular).toContain(alan)
    })

    it(`${alan} boş kalırsa program en çok "Belki" olur`, () => {
      const e = eslestir(program(ornek[alan]), {}, BUGUN)
      expect(e.sonuc).toBe('belki')
      expect(e.sonrakiSorular).toContain(alan)
    })
  }

  it('"Henüz seçilmedi" bilinmeyen sayılır', () => {
    for (const id of ['tubitak1501', 'tubitak1507', 'teknogirisimRozeti', 'bks']) {
      const e = eslestir(program(id), { isletmeTuru: 'secilmedi' }, BUGUN)
      expect(e.sonuc, id).toBe('belki')
      expect(e.sonrakiSorular, id).toContain('isletmeTuru')
    }
  })

  it('bütün alanlar bilinmiyorsa hiçbir program "Uygun" ya da "Uygun değil" olmaz', () => {
    const hepsi = Object.fromEntries(SORU_SIRASI.map((a) => [a, BILMIYORUM])) as DestekProfili
    for (const profil of [{}, hepsi, { isletmeTuru: 'secilmedi' } as DestekProfili]) {
      const g = eslestirHepsi(PROGRAMLAR, profil, BUGUN)
      expect(g.uygun).toEqual([])
      // Kaldırılan program bilgiden bağımsız olarak "Uygun değil" olur.
      expect(g.uygunDegil.map((e) => e.programId)).toEqual(['kosgebIsletmeGelistirme'])
    }
  })

  it('"Diğer" türü sermaye şirketi koşulunu çözemez ve program "Belki" olur', () => {
    for (const id of ['tubitak1501', 'tubitak1507', 'teknogirisimRozeti']) {
      const e = eslestir(program(id), { isletmeTuru: 'diger' }, BUGUN)
      expect(e.sonuc, id).toBe('belki')
      // Kişi türünü söyledi. Bu yüzden aynı soru yeniden sorulmaz. Ekran kuruma sormayı söyler.
      expect(e.sonrakiSorular, id).not.toContain('isletmeTuru')
      expect(e.nedenler.join(' '), id).toMatch(/kuruma sorun/i)
    }
  })

  it('"Diğer" türü anonim şirket koşulunu çözer, çünkü anonim şirket listede ayrı seçenektir', () => {
    expect(sonuc('bks', { isletmeTuru: 'diger' })).toBe('uygun_degil')
  })

  it('tür koşulu olmayan program "Diğer" cevabından etkilenmez', () => {
    const temel: DestekProfili = { kurulusDurumu: 'kuruldu', kurulus: { yil: 2022, ay: 3 }, olcek: 'kucuk', faaliyet: ['C'], calisan: 12 }
    let sayi = 0
    for (const p of PROGRAMLAR) {
      if (alanaBagli(p.id, 'isletmeTuru')) continue
      sayi++
      expect(eslestir(p, { ...temel, isletmeTuru: 'diger' }, BUGUN), p.id).toEqual(eslestir(p, { ...temel, isletmeTuru: 'limited' }, BUGUN))
    }
    expect(sayi).toBeGreaterThan(30)
  })

  it('kooperatif sermaye şirketi koşulunda "Belki" olur, çünkü katalog kooperatifi anmaz', () => {
    expect(sonuc('tubitak1501', { isletmeTuru: 'kooperatif' })).toBe('belki')
  })
})

describe('beş örnek profil', () => {
  it('1. kurulmamış girişim', () => {
    const p: DestekProfili = { kurulusDurumu: 'kurulmadi', olcek: BILMIYORUM, isletmeTuru: 'secilmedi', faaliyet: ['J'] }
    // Katalog: "İşletme, başvurudan en az üç yıl önce kurulmuş olmalı."
    expect(sonuc('tb10962Marka', p)).toBe('uygun_degil')
    // Katalog: "İşletme en çok 3 yaşında olmalı." Kurulmamış girişimin başvurusunu kurum söyler.
    const a = eslestir(program('kosgebGirisimciA'), p, BUGUN)
    expect(a.sonuc).toBe('belki')
    expect(a.nedenler.join(' ')).toMatch(/henüz kurulmadı/)
    expect(sonuc('tubitak1501', p)).toBe('belki')
    const g = eslestirHepsi(PROGRAMLAR, p, BUGUN)
    expect(g.uygun).toEqual([])
    expect(listede(g).length).toBeGreaterThan(0)
    expect(netlestirmeSorulari(g, p)).not.toContain('kurulus')
  })

  it('2. 3 kişilik kafe', () => {
    const p: DestekProfili = { kurulusDurumu: 'kuruldu', kurulus: { yil: 2025, ay: 11 }, calisan: 3, olcek: 'mikro', isletmeTuru: 'sahis', faaliyet: ['I'] }
    // Katalog: "Türkiye'de yerleşik bir sermaye şirketi olmalı." Şahıs işletmesi sermaye şirketi değildir.
    expect(sonuc('tubitak1501', p)).toBe('uygun_degil')
    expect(sonuc('tubitak1507', p)).toBe('uygun_degil')
    // Katalog: "Mikro işletmeler başvuramaz."
    expect(eslestir(program('kosgebDijitalDonusum'), p, BUGUN).nedenler.join(' ')).toMatch(/mikro/)
    // Katalog: "Şirket, tam mükellef bir anonim şirket olmalı."
    expect(sonuc('bks', p)).toBe('uygun_degil')
    // Katalog: şahıs işletmesi ya da sermaye şirketi, KOBİ ve son 15 yıl. Sorulan koşullar tutar.
    const rozet = eslestir(program('teknogirisimRozeti'), p, BUGUN)
    expect(rozet.sonuc).toBe('belki')
    expect(rozet.sorulanlarTuttu).toBe(true)
    const g = eslestirHepsi(PROGRAMLAR, p, BUGUN)
    expect(g.uygun).toEqual([])
    expect(sonucNotu(g, p)).toBe('iseOzelYok')
  })

  it('3. 200 kişilik ayakkabı üreticisi', () => {
    const p: DestekProfili = { kurulusDurumu: 'kuruldu', kurulus: { yil: 2010, ay: 4 }, calisan: 200, olcek: 'orta', isletmeTuru: 'anonim', faaliyet: ['C'] }
    const dijital = eslestir(program('kosgebDijitalDonusum'), p, BUGUN)
    expect(dijital.sonuc).toBe('belki')
    expect(dijital.sorulanlarTuttu).toBe(true)
    expect(eslestir(program('tubitak1507'), p, BUGUN).sorulanlarTuttu).toBe(true)
    expect(eslestir(program('kosgebKapasite'), p, BUGUN).sorulanlarTuttu).toBe(true)
    // Katalog: "Ölçüm gününde en çok 50 çalışan olmalı."
    expect(sonuc('bks', p)).toBe('uygun_degil')
    // Katalog: "Son 15 yıl içinde kurulmuş olmalı."
    expect(sonuc('teknogirisimRozeti', p)).toBe('uygun_degil')
    const g = eslestirHepsi(PROGRAMLAR, p, BUGUN)
    expect(g.uygun).toEqual([])
    // İmalata özel program listede var. Bu yüzden not görünmez.
    expect(sonucNotu(g, p)).toBeUndefined()
  })

  it('4. büyük işletme', () => {
    const p: DestekProfili = { kurulusDurumu: 'kuruldu', kurulus: { yil: 1995 }, calisan: 1200, olcek: 'buyuk', isletmeTuru: 'anonim', faaliyet: ['C'] }
    // Katalog: "KOBİ olan bir sermaye şirketi olmalı."
    expect(sonuc('tubitak1507', p)).toBe('uygun_degil')
    // Katalog: "Hızlı büyüyen küçük ya da orta ölçekli işletmeler başvurabilir."
    expect(sonuc('kosgebKapasite', p)).toBe('uygun_degil')
    expect(sonuc('teknogirisimRozeti', p)).toBe('uygun_degil')
    // 20 Kasım 2026 doğrulaması: 1501 çağrısına yalnız KOBİ ölçeğindeki sermaye şirketi başvurabilir.
    expect(sonuc('tubitak1501', p)).toBe('uygun_degil')
    expect(eslestirHepsi(PROGRAMLAR, p, BUGUN).uygun).toEqual([])
  })

  it('5a. tarım işletmesi genel programlarla eşleşir ve bilgi notu görünür', () => {
    const p: DestekProfili = { kurulusDurumu: 'kuruldu', kurulus: { yil: 2020 }, calisan: 4, olcek: 'mikro', isletmeTuru: 'kooperatif', faaliyet: ['A'] }
    const g = eslestirHepsi(PROGRAMLAR, p, BUGUN)
    expect(listede(g).length).toBeGreaterThan(0)
    expect(sonucNotu(g, p)).toBe('iseOzelYok')
    expect(sonuc('kosgebDijitalDonusum', p)).toBe('uygun_degil')
  })

  it('5b. turizm işletmesi hiçbir programla eşleşmezse boş sonuç metni görünür', () => {
    const p: DestekProfili = { kurulusDurumu: 'kuruldu', kurulus: { yil: 2012 }, calisan: 60, olcek: 'mikro', isletmeTuru: 'sahis', faaliyet: ['I'] }
    // Katalogdan bu profile uymayan programlar seçilir. Her ret katalogdaki açık bir koşula dayanır.
    const katalog = ['kosgebGirisimciA', 'kosgebDijitalDonusum', 'bks', 'tubitak1501'].map(program)
    const g = eslestirHepsi(katalog, p, BUGUN)
    expect(listede(g)).toEqual([])
    expect(g.uygunDegil).toHaveLength(4)
    expect(sonucNotu(g, p)).toBe('bos')
  })

  it('faaliyet alanı seçilmezse "işe özel program yok" notu görünmez', () => {
    for (const faaliyet of [undefined, BILMIYORUM] as const) {
      const p: DestekProfili = { olcek: 'mikro', faaliyet }
      expect(sonucNotu(eslestirHepsi(PROGRAMLAR, p, BUGUN), p)).toBeUndefined()
    }
  })

  it('boş liste faaliyet seçilmese de boş sonuç metnini verir', () => {
    const g: EslesmeGruplari = { uygun: [], belki: [], uygunDegil: [] }
    expect(sonucNotu(g, {})).toBe('bos')
  })
})

describe('tercih süzgeci', () => {
  it('kredi ve hisse tercihi hiçbir programı "Uygun değil" yapmaz', () => {
    const p: DestekProfili = { olcek: 'kucuk', isletmeTuru: 'limited' }
    const tercihli: DestekProfili = { ...p, tercih: { krediIstemiyorum: true, hisseIstemiyorum: true } }
    expect(eslestirHepsi(PROGRAMLAR, tercihli, BUGUN)).toEqual(eslestirHepsi(PROGRAMLAR, p, BUGUN))
  })

  it('tercihe uymayan program aynı grupta kalır ve sona geçer', () => {
    const tercih = { krediIstemiyorum: true }
    expect(tercihUymuyor(program('kgf'), tercih)).toBe(false)
    expect(tercihUymuyor(program('kosgebKapasite'), tercih)).toBe(true)
    expect(tercihUymuyor(program('bks'), { hisseIstemiyorum: true })).toBe(true)
    expect(tercihUymuyor(program('bks'), undefined)).toBe(false)
    const harita = new Map(PROGRAMLAR.map((x) => [x.id, x]))
    const belki = eslestirHepsi(PROGRAMLAR, {}, BUGUN).belki
    const sirali = tercihSirala(belki, harita, tercih)
    expect(sirali.map((e) => e.programId).sort()).toEqual(belki.map((e) => e.programId).sort())
    const ilkUymayan = sirali.findIndex((e) => tercihUymuyor(harita.get(e.programId)!, tercih))
    expect(ilkUymayan).toBeGreaterThan(0)
    expect(sirali.slice(ilkUymayan).every((e) => tercihUymuyor(harita.get(e.programId)!, tercih))).toBe(true)
    // Tercih yoksa katalog sırası korunur.
    expect(tercihSirala(belki, harita, undefined)).toEqual(belki)
  })

  it('süzgeç kategoriye değil fayda türlerine bakar', () => {
    const kredi = { krediIstemiyorum: true }
    const hisse = { hisseIstemiyorum: true }
    const fayda = (...faydalar: Program['faydalar']) => ({ ...program('tubitak1501'), faydalar })
    // Faiz desteği bir krediye bağlıdır. Kredi istemeyen kişiye uymaz.
    expect(tercihUymuyor(fayda('faiz'), kredi)).toBe(true)
    expect(tercihUymuyor(fayda('kredi'), kredi)).toBe(true)
    // Programda başka bir fayda da varsa program sona geçmez.
    expect(tercihUymuyor(fayda('hibe', 'kredi'), kredi)).toBe(false)
    expect(tercihUymuyor(fayda('kefalet'), kredi)).toBe(false)
    expect(tercihUymuyor(fayda('ortaklik'), hisse)).toBe(true)
    expect(tercihUymuyor(fayda('hibe', 'ortaklik'), hisse)).toBe(false)
    expect(tercihUymuyor(fayda('kredi', 'ortaklik'), { ...kredi, ...hisse })).toBe(true)
    // Kategori artık okunmaz.
    const krediKategorili: Program = { ...fayda('hibe'), kategori: 'kredi' }
    expect(tercihUymuyor(krediKategorili, kredi)).toBe(false)
    expect(tercihUymuyor(program('ttgv'), kredi)).toBe(false)
    expect(tercihUymuyor(program('kosgebTekmer'), kredi)).toBe(false)
    expect(tercihUymuyor(program('eic'), hisse)).toBe(false)
  })
})

describe('kaldırılan program', () => {
  it('kaldırılan program hiçbir profilde uygun ya da belki olmaz', () => {
    for (const profil of [{}, { olcek: 'kucuk', isletmeTuru: 'limited' }] as DestekProfili[]) {
      const e = eslestir(program('kosgebIsletmeGelistirme'), profil, BUGUN)
      expect(e.sonuc).toBe('uygun_degil')
      expect(e.nedenler).toEqual(['Bu program kaldırıldı. Yeni başvuru alınmaz.'])
    }
  })

  it('1501 yalnız KOBİ ölçeğindeki şirkete açıktır', () => {
    expect(sonuc('tubitak1501', { olcek: 'buyuk', isletmeTuru: 'anonim' })).toBe('uygun_degil')
  })
})
