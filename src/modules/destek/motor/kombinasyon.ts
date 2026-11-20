import { KOMBINASYONLAR, type KombinasyonKurali, type Program } from '../data/tipler'
import { gecerliIsoTarih, httpsAdresMi } from './tazelik'

export const BILINMEYEN_ILISKI = 'Bilinmiyor. Kuruma sorun.'

/** Kaynaklı kural kendi yönünde, simetrik kural iki yönde okunur. */
export function iliskiBul(a: Program | undefined, b: Program | undefined): KombinasyonKurali | undefined {
  if (!a || !b || a.id === b.id) return undefined
  const kurallar = [
    ...a.kombinasyon.filter((k) => k.digerProgramId === b.id),
    ...b.kombinasyon.filter((k) => k.digerProgramId === a.id && !k.yonlu),
  ].filter(({ iliski }) => iliski.state === 'kaynakli' && KOMBINASYONLAR.includes(iliski.value)
    && httpsAdresMi(iliski.sourceUrl) && gecerliIsoTarih(iliski.asOf))
  if (kurallar.some((k) => k.iliski.value !== kurallar[0].iliski.value)) return undefined
  return kurallar[0]
}

interface BasvuruOzeti {
  id: string
  programId: string
  programAdi: string
  giderKodlari?: readonly string[]
}

export function basvuruCiftleri<B extends BasvuruOzeti>(basvurular: readonly B[], katalog: readonly Program[]) {
  const programlar = new Map(katalog.map((p) => [p.id, p]))
  return basvurular.flatMap((a, i) => basvurular.slice(i + 1).map((b) => {
    const ilk = programlar.get(a.programId)
    const ikinci = programlar.get(b.programId)
    const kural = iliskiBul(ilk, ikinci)
    const tersKural = iliskiBul(ikinci, ilk)
    return {
      a,
      b,
      iliski: kural ?? tersKural,
      ortakGider: a.giderKodlari?.some((kod) => b.giderKodlari?.includes(kod)) ?? false,
    }
  }))
}
