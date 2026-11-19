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
    let sayac = 0
    const yukle = async () => {
      const bu = ++sayac
      try {
        const [projeler, isler] = await Promise.all([projeDepo.projeler(planId), projeDepo.isler(planId)])
        /* Eski okuma yeni okumanın üzerine yazmaz. */
        if (!kapandi && bu === sayac) setVeri({ planId, yukleniyor: false, projeler, isler })
      } catch (error) {
        console.error(error)
        if (!kapandi && bu === sayac) setVeri({ planId, yukleniyor: false, hata: 'Projeler okunamadı. Sayfayı yeniden yükleyin.', projeler: [], isler: [] })
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
