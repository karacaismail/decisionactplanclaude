/**
 * Destek ekranlarının ortak kancaları.
 * Katalog JavaScript değildir. Aynı kökenden inen statik bir JSON dosyasıdır.
 * Dosya yalnız bir destek ekranı açılınca bir kez iner. İlk açılışta inmez. Dış ağa istek gitmez.
 * Profil ve başvurular modül deposundan okunur. Başka sekme veriyi değiştirirse ekran yenilenir.
 */
import { use, useCallback, useEffect, useState } from 'react'
import { subscribeModuleChanges } from '@/platform/broadcast'
import { useCurrentPlanView } from '@/platform/planSource'
import katalogAdresi from './data/katalog.json?url'
import { katalogOlustur } from './data/katalog'
import type { KatalogKaydi, Program } from './data/tipler'
import { basvurulariYukle, havuzYukle, MODUL_ID, PLANSIZ, profilYukle } from './depo'
import type { BelgeHavuzu } from './motor/belgeHavuzu'
import type { Basvuru } from './motor/basvuru'
import type { DestekProfili } from './motor/profil'
import { bugunIso } from './motor/tazelik'

let katalog: Promise<readonly Program[]> | undefined

/** Kataloğu bir kez yükler. Yükleme hata verirse sonraki istek yeniden dener. */
export function katalogYukle(): Promise<readonly Program[]> {
  katalog ??= fetch(katalogAdresi).then(async (yanit) => {
    if (!yanit.ok) throw new Error(`Katalog indirilemedi. Durum: ${yanit.status}.`)
    const veri: unknown = await yanit.json()
    if (!Array.isArray(veri)) throw new Error('Katalog dosyası bozuk.')
    return katalogOlustur(veri as KatalogKaydi[])
  }).catch((error: unknown) => {
    katalog = undefined
    throw error
  })
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

/** Modül verisini okur. Bu sekme ya da başka sekme yazınca yeniden okur. Okuma hata verirse hata bayrağı döner. */
function useModulVerisi<T>(yer: string | undefined, oku: (yer: string) => Promise<T>): { veri: T | undefined; hata: boolean; yenile: () => void } {
  const [durum, setDurum] = useState<{ yer: string; deger?: T; hata: boolean }>()
  const [surum, setSurum] = useState(0)
  const yenile = useCallback(() => setSurum((n) => n + 1), [])
  useEffect(() => {
    if (!yer) return
    let canli = true
    oku(yer).then(
      (deger) => {
        if (canli) setDurum({ yer, deger, hata: false })
      },
      (error: unknown) => {
        console.error('Destek verisi okunamadı.', error)
        if (canli) setDurum({ yer, hata: true })
      },
    )
    return () => {
      canli = false
    }
  }, [yer, oku, surum])
  useEffect(() => subscribeModuleChanges((c) => {
    if (c.moduleId === MODUL_ID && c.planId === yer) yenile()
  }), [yer, yenile])
  const guncel = durum && durum.yer === yer ? durum : undefined
  return { veri: guncel?.deger, hata: Boolean(guncel?.hata), yenile }
}

const profilOkuyucu = (yer: string) => profilYukle(yer, bugunIso())

export function useProfil(yer: string) {
  const { veri, hata, yenile } = useModulVerisi<DestekProfili>(yer, profilOkuyucu)
  return { profil: veri, hata, yenile }
}

export function useBasvurular(planId: string | undefined) {
  const { veri, hata, yenile } = useModulVerisi<Basvuru[]>(planId, basvurulariYukle)
  return { basvurular: planId ? veri : [], hata, yenile }
}

/** Ortak belge havuzu. Plan açıksa planın, plan yoksa plansız yerin havuzu okunur. */
export function useHavuz(yer: string) {
  const { veri, hata, yenile } = useModulVerisi<BelgeHavuzu>(yer, havuzYukle)
  return { havuz: veri, hata, yenile }
}

export const OKUMA_HATASI = 'Kayıtlı bilgiler okunamadı. Bilgileriniz silinmedi. Sayfayı yenileyin. Sorun sürerse tarayıcının depolama iznini kontrol edin.'
