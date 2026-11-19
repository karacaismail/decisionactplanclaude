import { ArrowsClockwise, CheckCircle, Warning, WarningCircle } from '@phosphor-icons/react'
import { usePlanStore } from '@/store/planStore'

const LABEL = { kaydedildi: 'Kaydedildi', kaydediliyor: 'Kaydediliyor', kaydedilemedi: 'Kaydedilemedi', cakisma: 'Çakışma var' } as const
/* Her durumun ikonu ayrıdır. Anlam yalnız renkle verilmez. */
const ICON = { kaydedildi: CheckCircle, kaydediliyor: ArrowsClockwise, kaydedilemedi: WarningCircle, cakisma: Warning } as const

/**
 * Kayıt durumu. Durumu planStore yönetir.
 * Ekran okuyucu her genişlikte tam metni duyar.
 * Dar ekranda yalnız ikon görünür. Plan adı böylece 44 piksellik alanını korur.
 * Kayıt sorunu ve çakışma ayrıca SyncGuard uyarısında tam metinle görünür.
 */
export function SaveStatus() {
  const state = usePlanStore((s) => s.saveState)
  const Icon = ICON[state]
  return (
    <span className="save-status" data-state={state} role="status" aria-live="polite">
      <Icon size={20} aria-hidden />
      <span className="save-status-text">{LABEL[state]}</span>
    </span>
  )
}
