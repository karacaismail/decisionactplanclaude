/**
 * Gider eşleşmesi. Saf TypeScript kodudur.
 * Bir gideri ödeyebilecek programlar yalnız katalog metnine dayanan bağlardan gelir.
 * Hariç tutan program aday listesine girmez. Aynı program için uygun bağ olsa da girmez.
 */
import type { GiderEslesme, GiderKalemi, Program } from '../data/tipler'

export interface GiderAdayi {
  program: Program
  /** Katalogdaki birebir gider metinleri. */
  kanitlar: string[]
}

/** Bir giderin adayları ve bu gideri hariç tutan programlar. İki liste de katalog sırasıyla gelir. */
export function giderAdaylari(giderId: string, eslesmeler: readonly GiderEslesme[], programlar: readonly Program[]): { adaylar: GiderAdayi[]; haric: GiderAdayi[] } {
  const bu = eslesmeler.filter((e) => e.giderId === giderId)
  const kanitlar = (programId: string, tur: GiderEslesme['tur']) => bu.filter((e) => e.programId === programId && e.tur === tur).map((e) => e.kanitMetni)
  const adaylar: GiderAdayi[] = []
  const haric: GiderAdayi[] = []
  for (const program of programlar) {
    const disarida = kanitlar(program.id, 'haric')
    if (disarida.length) haric.push({ program, kanitlar: disarida })
    else {
      const icinde = kanitlar(program.id, 'uygun')
      if (icinde.length) adaylar.push({ program, kanitlar: icinde })
    }
  }
  return { adaylar, haric }
}

/** Bağların denetimi. Boş liste temiz veri demektir. */
export function giderEslesmeHatalari(eslesmeler: readonly GiderEslesme[], giderler: readonly GiderKalemi[], programlar: readonly Program[]): string[] {
  const hatalar: string[] = []
  const giderIdleri = new Set(giderler.map((g) => g.id))
  const harita = new Map(programlar.map((p) => [p.id, p]))
  const gorulen = new Set<string>()
  const turler = new Map<string, Set<string>>()
  for (const e of eslesmeler) {
    const yer = `gider eşleşmesi ${e.giderId} ${e.programId}`
    if (!giderIdleri.has(e.giderId)) hatalar.push(`${yer}: "${e.giderId}" gideri gider listesinde yok.`)
    const p = harita.get(e.programId)
    if (!p) {
      hatalar.push(`${yer}: "${e.programId}" programı katalogda yok.`)
      continue
    }
    if (e.tur !== 'uygun' && e.tur !== 'haric') {
      hatalar.push(`${yer}: tür "uygun" ya da "haric" olmalı.`)
      continue
    }
    const liste = e.tur === 'uygun' ? p.uygunGider : p.haricGider
    if (!liste.includes(e.kanitMetni)) hatalar.push(`${yer}: "${e.kanitMetni}" metni katalogda birebir yok.`)
    const anahtar = `${e.giderId}|${e.programId}|${e.tur}|${e.kanitMetni}`
    if (gorulen.has(anahtar)) hatalar.push(`${yer}: aynı eşleşme iki kez var.`)
    gorulen.add(anahtar)
    const cift = `${e.giderId}|${e.programId}`
    const t = turler.get(cift) ?? new Set<string>()
    t.add(e.tur)
    turler.set(cift, t)
  }
  for (const [cift, t] of turler) if (t.size > 1) hatalar.push(`${cift}: program bu gider için hem uygun hem hariç olamaz.`)
  return hatalar
}
