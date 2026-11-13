import { Tag } from 'antd'
import { usePlanStore } from '@/store/planStore'

const LABEL = { kaydedildi: 'Kaydedildi', kaydediliyor: 'Kaydediliyor', kaydedilemedi: 'Kaydedilemedi', cakisma: 'Başka sekme değiştirdi' } as const
const COLOR = { kaydedildi: 'success', kaydediliyor: 'processing', kaydedilemedi: 'error', cakisma: 'warning' } as const

/** Başlıkta kayıt durumu. Mantığı planStore yönetir. */
export function SaveStatus() {
  const state = usePlanStore((s) => s.saveState)
  return <Tag color={COLOR[state]} role="status" aria-live="polite" style={{ fontSize: 14, margin: 0 }}>{LABEL[state]}</Tag>
}
