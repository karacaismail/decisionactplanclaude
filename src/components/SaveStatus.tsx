import { Tag } from 'antd'
import { usePlanStore } from '@/store/planStore'

const LABEL = { kaydedildi: 'Kaydedildi', kaydediliyor: 'Kaydediliyor', kaydedilemedi: 'Kaydedilemedi', cakisma: 'Çakışma var' } as const
const COLOR = { kaydedildi: 'success', kaydediliyor: 'processing', kaydedilemedi: 'error', cakisma: 'warning' } as const

/** Kayıt durumunu her genişlikte tam metinle gösterir. Durumu planStore yönetir. */
export function SaveStatus() {
  const state = usePlanStore((s) => s.saveState)
  return <Tag className="save-status" color={COLOR[state]} role="status" aria-live="polite">{LABEL[state]}</Tag>
}
