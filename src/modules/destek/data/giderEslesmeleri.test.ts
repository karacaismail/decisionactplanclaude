/**
 * Konsey planı B.2: gider eşleşmesi.
 * Her eşleşme katalogdaki "uygunGider" ya da "haricGider" metnine birebir bağlanır. Dizi sırası kullanılmaz.
 */
import { describe, expect, it } from 'vitest'
import { giderAdaylari, giderEslesmeHatalari } from '../motor/gider'
import { GIDER_ESLESMELERI } from './giderEslesmeleri'
import { GIDER_KALEMLERI } from './giderler'
import { PROGRAMLAR } from './programlar'
import type { GiderEslesme } from './tipler'

const hatalar = (boz: (e: GiderEslesme[]) => void) => {
  const kopya = structuredClone(GIDER_ESLESMELERI) as GiderEslesme[]
  boz(kopya)
  return giderEslesmeHatalari(kopya, GIDER_KALEMLERI, PROGRAMLAR).join('\n')
}

describe('gider eşleşmesi verisi', () => {
  it('veri temizdir', () => {
    expect(giderEslesmeHatalari(GIDER_ESLESMELERI, GIDER_KALEMLERI, PROGRAMLAR)).toEqual([])
  })

  it('her kanıt metni katalogda birebir bulunur', () => {
    for (const e of GIDER_ESLESMELERI) {
      const p = PROGRAMLAR.find((x) => x.id === e.programId)
      expect(p, e.programId).toBeDefined()
      const liste = e.tur === 'uygun' ? p!.uygunGider : p!.haricGider
      expect(liste, `${e.giderId} ${e.programId}`).toContain(e.kanitMetni)
    }
  })

  it('katalogda karşılığı olmayan metni reddeder', () => {
    expect(hatalar((e) => { e[0].kanitMetni = e[0].kanitMetni + ' ' })).toMatch(/katalogda birebir yok/)
    expect(hatalar((e) => { e[0].tur = e[0].tur === 'uygun' ? 'haric' : 'uygun' })).toMatch(/katalogda birebir yok/)
  })

  it('bilinmeyen gideri, programı ve türü reddeder', () => {
    expect(hatalar((e) => { e[0].giderId = 'yokGider' })).toMatch(/yokGider.*gider listesinde yok/)
    expect(hatalar((e) => { e[0].programId = 'yokProgram' })).toMatch(/yokProgram.*katalogda yok/)
    expect(hatalar((e) => { (e[0] as { tur: string }).tur = 'belki' })).toMatch(/tür/)
  })

  it('aynı eşleşmeyi iki kez reddeder', () => {
    expect(hatalar((e) => { e.push({ ...e[0] }) })).toMatch(/iki kez/)
  })

  it('bir program aynı gider için hem uygun hem hariç olamaz', () => {
    const uygun = GIDER_ESLESMELERI.find((e) => e.tur === 'uygun')!
    const p = PROGRAMLAR.find((x) => x.id === uygun.programId)!
    expect(p.haricGider.length).toBeGreaterThan(0)
    expect(hatalar((e) => { e.push({ giderId: uygun.giderId, programId: p.id, tur: 'haric', kanitMetni: p.haricGider[0] }) })).toMatch(/hem uygun hem hariç/)
  })

  it('kira ve hammadde gider listesinde durur ama katalogda geçmez', () => {
    expect(GIDER_KALEMLERI.map((g) => g.id)).toEqual(expect.arrayContaining(['kira', 'hammadde']))
    const katalog = PROGRAMLAR.flatMap((p) => [...p.uygunGider, ...p.haricGider]).join(' ').toLocaleLowerCase('tr-TR')
    expect(katalog).not.toMatch(/kira|hammadde/u)
    expect(GIDER_ESLESMELERI.filter((e) => e.giderId === 'kira' || e.giderId === 'hammadde')).toEqual([])
  })

  it('gider kalemi kendi program listesini taşımaz, programlar yalnız eşleşmeden gelir', () => {
    for (const g of GIDER_KALEMLERI) expect(Object.keys(g)).not.toContain('programlar')
  })
})

describe('gider adayları', () => {
  it('hariç tutulan gider aday listesine girmez', () => {
    const p = PROGRAMLAR.find((x) => x.id === 'tubitak1507')!
    const eslesmeler: GiderEslesme[] = [
      { giderId: 'yazilimLisansi', programId: 'tubitak1507', tur: 'uygun', kanitMetni: 'Proje ekipmanı ve yazılım' },
      { giderId: 'yazilimLisansi', programId: 'tubitak1507', tur: 'haric', kanitMetni: p.haricGider[0] },
    ]
    const r = giderAdaylari('yazilimLisansi', eslesmeler, PROGRAMLAR)
    expect(r.adaylar).toEqual([])
    expect(r.haric.map((x) => x.program.id)).toEqual(['tubitak1507'])
  })

  it('adaylar katalog sırasıyla gelir ve kanıt metnini taşır', () => {
    const r = giderAdaylari('yazilimLisansi', GIDER_ESLESMELERI, PROGRAMLAR)
    const index = (id: string) => PROGRAMLAR.findIndex((p) => p.id === id)
    const ids = r.adaylar.map((a) => index(a.program.id))
    expect(ids).toEqual([...ids].sort((a, b) => a - b))
    expect(r.adaylar.map((a) => a.program.id)).toEqual(['tubitak1501', 'tubitak1507', 'tubitak1707', 'kosgebGirisimciA', 'tb10962Atilim'])
    for (const a of r.adaylar) expect(a.kanitlar.length).toBeGreaterThan(0)
  })

  it('pazarlamayı hariç tutan programlar yurt içi pazarlama adaylarında yoktur', () => {
    const r = giderAdaylari('yurtIciPazarlama', GIDER_ESLESMELERI, PROGRAMLAR)
    const haric = r.haric.map((x) => x.program.id)
    expect(haric).toEqual(expect.arrayContaining(['tb10962Atilim', 'tubitak1507']))
    for (const id of haric) expect(r.adaylar.map((a) => a.program.id)).not.toContain(id)
  })

  it('karşılığı olmayan giderde aday yoktur', () => {
    for (const id of ['kira', 'hammadde']) expect(giderAdaylari(id, GIDER_ESLESMELERI, PROGRAMLAR).adaylar).toEqual([])
  })

  it('kaldırılan program gider adayı olmaz', () => {
    for (const id of ['markaTescilGider', 'belgelendirme', 'testAnaliz', 'danismanlik']) {
      expect(giderAdaylari(id, GIDER_ESLESMELERI, PROGRAMLAR).adaylar.map((a) => a.program.id), id).not.toContain('kosgebIsletmeGelistirme')
    }
  })
})
