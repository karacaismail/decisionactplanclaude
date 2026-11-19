/**
 * Destek ekranlarının ortak kancaları.
 * Katalog ayrı bir parça olarak geç yüklenir. İlk açılışta inmez.
 * Profil ve başvurular modül deposundan okunur. Başka sekme veriyi değiştirirse ekran yenilenir.
 */
import { use, useCallback, useEffect, useState } from 'react'
import { subscribeModuleChanges } from '@/platform/broadcast'
import { useCurrentPlanView } from '@/platform/planSource'
import type { Program } from './data/tipler'
import { basvurulariYukle, MODUL_ID, PLANSIZ, profilYukle } from './depo'
import type { Basvuru } from './motor/basvuru'
import type { DestekProfili } from './motor/profil'
import { bugunIso } from './motor/tazelik'

let katalog: Promise<readonly Program[]> | undefined

/** Kataloğu bir kez yükler. Yükleme hata verirse sonraki istek yeniden dener. */
export function katalogYukle(): Promise<readonly Program[]> {
  katalog ??= import('./data/programlar').then(
    (m) => m.PROGRAMLAR,
    (error: unknown) => {
      katalog = undefined
      throw error
    },
  )
  return katalog
}

/** Kataloğu okur. Yüklenirken ekranın bekleme görünümü çizilir. */
export function useKatalog(): readonly Program[] {
  return use(katalogYukle())
}

export function useBugun(): string {
  return bugunIso()
}

/** Açık plan ve profilin durduğu yer. Plan yoksa yer "_plansiz" olur. */
export function usePlanYeri(): { planId: string | undefined; yer: string } {
  const plan = useCurrentPlanView()
  return { planId: plan?.id, yer: plan?.id ?? PLANSIZ }
}

/** Modül verisini okur. Bu sekme ya da başka sekme yazınca yeniden okur. */
function useModulVerisi<T>(yer: string | undefined, oku: (yer: string) => Promise<T>): { veri: T | undefined; yenile: () => void } {
  const [veri, setVeri] = useState<{ yer: string; deger: T }>()
  const [surum, setSurum] = useState(0)
  const yenile = useCallback(() => setSurum((n) => n + 1), [])
  useEffect(() => {
    if (!yer) return
    let canli = true
    oku(yer).then(
      (deger) => {
        if (canli) setVeri({ yer, deger })
      },
      (error: unknown) => console.error('Destek verisi okunamadı.', error),
    )
    return () => {
      canli = false
    }
  }, [yer, oku, surum])
  useEffect(() => subscribeModuleChanges((c) => {
    if (c.moduleId === MODUL_ID && c.planId === yer) yenile()
  }), [yer, yenile])
  return { veri: veri && veri.yer === yer ? veri.deger : undefined, yenile }
}

const buYil = () => Number(bugunIso().slice(0, 4))
const profilOkuyucu = (yer: string) => profilYukle(yer, buYil())

export function useProfil(yer: string) {
  const { veri, yenile } = useModulVerisi<DestekProfili>(yer, profilOkuyucu)
  return { profil: veri, yenile }
}

export function useBasvurular(planId: string | undefined) {
  const { veri, yenile } = useModulVerisi<Basvuru[]>(planId, basvurulariYukle)
  return { basvurular: planId ? veri : [], yenile }
}
