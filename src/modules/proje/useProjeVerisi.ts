/**
 * Açık planın projelerini ve işlerini okur. Veri değişince ekran yenilenir.
 * Değişiklik bu sekmeden de öteki sekmelerden de gelebilir. Haber altyapının kanalından gelir.
 */
import { useEffect, useState } from 'react'
import { subscribeModuleChanges } from '@/platform/broadcast'
import type { Is, Proje } from './domain/model'
import { MODUL_KIMLIGI, projeDepo } from './projeDepo'

export interface ProjeVerisi {
  yukleniyor: boolean
  hata?: string
  projeler: Proje[]
  isler: Is[]
}

const BOS: ProjeVerisi = { yukleniyor: true, projeler: [], isler: [] }

export function useProjeVerisi(planId: string | undefined): ProjeVerisi {
  const [veri, setVeri] = useState<{ planId?: string } & ProjeVerisi>(BOS)
  useEffect(() => {
    if (!planId) return
    let kapandi = false
    let calisiyor = false
    let kirli = false
    /* Okumalar birleştirilir. Okuma sürerken gelen haberler tek bir yeni okuma başlatır. */
    const yukle = async () => {
      if (calisiyor) {
        kirli = true
        return
      }
      calisiyor = true
      try {
        do {
          kirli = false
          try {
            const [projeler, isler] = await Promise.all([projeDepo.projeler(planId), projeDepo.isler(planId)])
            if (!kapandi) setVeri({ planId, yukleniyor: false, projeler, isler })
          } catch (error) {
            console.error(error)
            /* Okunan son veri korunur. Hata yanında gösterilir. */
            if (!kapandi) setVeri((onceki) => ({ planId, yukleniyor: false, hata: 'Projeler okunamadı. Kayıtlı projeleriniz silinmedi. Sayfayı yeniden yükleyin.', projeler: onceki.planId === planId ? onceki.projeler : [], isler: onceki.planId === planId ? onceki.isler : [] }))
          }
        } while (kirli && !kapandi)
      } finally {
        calisiyor = false
      }
    }
    void yukle()
    const kapat = subscribeModuleChanges((degisiklik) => {
      if (degisiklik.moduleId === MODUL_KIMLIGI && degisiklik.planId === planId) void yukle()
    })
    return () => {
      kapandi = true
      kapat()
    }
  }, [planId])
  /* Plan değişince eski planın verisi gösterilmez. */
  return veri.planId === planId ? veri : BOS
}
