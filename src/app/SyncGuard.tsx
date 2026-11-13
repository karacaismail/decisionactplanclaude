import { useEffect, useState } from 'react'
import { Alert, Button, Modal, Space, Typography } from 'antd'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { detectConflict, downloadJson, formatDateTime, safeFileName, STORAGE_KEY } from '@/engine/sync'
import type { PlanDoc } from '@/data/types'

/**
 * Kayıt bekçisi. Başka sekme aynı planı değiştirirse uyarır.
 * Kayıt başarısızsa açık hata gösterir. Kayıt sürerken ayrılmayı sorar.
 */
export function SyncGuard() {
  const plan = useCurrentPlan()
  const saveState = usePlanStore((s) => s.saveState)
  const saveError = usePlanStore((s) => s.saveError)
  const setSaveState = usePlanStore((s) => s.setSaveState)
  const [incoming, setIncoming] = useState<PlanDoc | undefined>(undefined)

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      const current = usePlanStore.getState()
      const mine = current.currentId ? current.plans[current.currentId] : undefined
      const stored = detectConflict(e.newValue, mine)
      if (!stored) return
      setIncoming(stored)
      // Durum zaten "çakışma" ise yeniden yazmak gereksizdir. Her yazma diğer sekmeyi uyarır.
      if (current.saveState !== 'cakisma') setSaveState('cakisma')
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [setSaveState])

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      const s = usePlanStore.getState().saveState
      if (s === 'kaydediliyor' || s === 'kaydedilemedi') {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  const downloadMine = () => {
    if (plan) downloadJson(`${safeFileName(plan.name)}-kopya.json`, plan)
  }
  const loadStored = async () => {
    await usePlanStore.persist.rehydrate()
    setIncoming(undefined)
    setSaveState('kaydedildi')
  }
  const keepMine = () => {
    setIncoming(undefined)
    setSaveState('kaydediliyor')
    // Güncelleme zamanı yenilenir. Böylece içerik değişir ve depoya gerçekten yazılır.
    usePlanStore.getState().update(() => undefined)
  }

  return (
    <>
      {saveState === 'kaydedilemedi' ? (
        <Alert
          type="error"
          showIcon
          role="alert"
          message="Plan kaydedilemedi"
          description={saveError ?? 'Plan tarayıcıya kaydedilemedi. Kopyanızı indirin.'}
          action={<Button size="small" onClick={downloadMine} disabled={!plan}>Kopyamı indir (JSON)</Button>}
          style={{ position: 'fixed', top: 8, left: 8, right: 8, zIndex: 1100, fontSize: 14 }}
        />
      ) : null}
      <Modal
        open={saveState === 'cakisma'}
        title="Başka bir sekme bu planı değiştirdi"
        closable={false}
        mask={{ closable: false }}
        keyboard={false}
        footer={null}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
          <Typography.Text>Bu plan başka bir sekmede kaydedildi. İki sürüm farklı. Önce hangisini saklayacağınızı seçin.</Typography.Text>
          {incoming ? <Typography.Text style={{ fontSize: 14 }}>Kayıtlı sürüm: {formatDateTime(incoming.updatedAt)}.</Typography.Text> : null}
          {plan ? <Typography.Text style={{ fontSize: 14 }}>Bu sekmedeki sürüm: {formatDateTime(plan.updatedAt)}.</Typography.Text> : null}
          <Space wrap>
            <Button type="primary" onClick={loadStored}>Kayıtlı sürümü yükle</Button>
            <Button onClick={downloadMine} disabled={!plan}>Kopyamı indir (JSON)</Button>
            <Button onClick={keepMine}>Bu sekmedeki sürümü kaydet</Button>
          </Space>
        </div>
      </Modal>
    </>
  )
}
