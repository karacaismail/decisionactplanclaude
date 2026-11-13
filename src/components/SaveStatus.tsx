import { Grid, Tag, Tooltip } from 'antd'
import { usePlanStore } from '@/store/planStore'

const LABEL = { kaydedildi: 'Kaydedildi', kaydediliyor: 'Kaydediliyor', kaydedilemedi: 'Kaydedilemedi', cakisma: 'Çakışma var' } as const
const COLOR = { kaydedildi: 'success', kaydediliyor: 'processing', kaydedilemedi: 'error', cakisma: 'warning' } as const
const DOT = { kaydedildi: 'is-passed', kaydediliyor: '', kaydedilemedi: 'is-harm', cakisma: 'is-current' } as const

/** Başlıkta kayıt durumu. Telefonda yalnız nokta, masaüstünde etiket. Mantığı planStore yönetir. */
export function SaveStatus() {
  const state = usePlanStore((s) => s.saveState)
  const bp = Grid.useBreakpoint()
  if (!bp.md) {
    return (
      <Tooltip title={LABEL[state]}>
        <span className={`status-dot save-dot ${DOT[state]}`} role="status" aria-live="polite" aria-label={LABEL[state]} />
      </Tooltip>
    )
  }
  return <Tag color={COLOR[state]} role="status" aria-live="polite" style={{ fontSize: 14, margin: 0 }}>{LABEL[state]}</Tag>
}
