import { useEffect, useState } from 'react'
import { Alert, Button, Modal, Space, Typography } from 'antd'
import { HYDRATION_ERROR, usePlanStore, useCurrentPlan } from '@/store/planStore'
import { detectConflict, downloadJson, formatDateTime, safeFileName, STORAGE_KEY } from '@/engine/sync'
import type { PlanDoc } from '@/data/types'

/**
 * Kayıt bekçisi. Başka sekme aynı planı değiştirirse uyarır.
 * Kayıt başarısızsa açık hata gösterir. Kayıt sürerken ayrılmayı sorar.
 */
/** Depodaki yedek tarihlerini bellektekiyle birleştirir. Her plan için yeni olan tarih kalır. */
function mergeBackups(raw: string | null) {
  if (!raw) return
  try {
    const stored = (JSON.parse(raw) as { state?: { backups?: Record<string, string> } }).state?.backups
    if (!stored) return
    const mine = usePlanStore.getState().backups
    const next = { ...mine }
    let changed = false
    for (const [id, at] of Object.entries(stored)) {
      if (typeof at === 'string' && (!next[id] || at > next[id])) {
        next[id] = at
        changed = true
      }
    }
    if (changed) usePlanStore.setState({ backups: next })
  } catch {
    /* Bozuk kayıt yedek tarihini değiştirmez. */
  }
}

export function SyncGuard() {
  const plan = useCurrentPlan()
  const saveState = usePlanStore((s) => s.saveState)
  const saveError = usePlanStore((s) => s.saveError)
  const loadFailed = usePlanStore((s) => s.loadFailed)
  const setSaveState = usePlanStore((s) => s.setSaveState)
  const [incoming, setIncoming] = useState<PlanDoc | undefined>(undefined)

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      const current = usePlanStore.getState()
      /* Öteki sekmede alınan yedeğin tarihi bu sekmeye de geçer. Yeni tarih eskisinin üstüne yazılmaz. */
      mergeBackups(e.newValue)
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

  /* Okunamayan kaydı olduğu gibi dosyaya indirir. Kayıt değiştirilmez. */
  const downloadRaw = () => {
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? ''
    const url = URL.createObjectURL(new Blob([raw], { type: 'text/plain' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'okunamayan-kayit.txt'
    a.click()
    URL.revokeObjectURL(url)
  }
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
      {loadFailed ? (
        <Alert
          className="sync-alert"
          type="error"
          showIcon
          role="alert"
          message="Kayıtlı planlar okunamadı"
          description={HYDRATION_ERROR}
          action={<Button size="small" onClick={downloadRaw}>Ham kaydı indir</Button>}
        />
      ) : null}
      {saveState === 'kaydedilemedi' && !loadFailed ? (
        <Alert
          className="sync-alert"
          type="error"
          showIcon
          role="alert"
          message="Plan kaydedilemedi"
          description={saveError ?? 'Plan tarayıcıya kaydedilemedi. Kopyanızı indirin.'}
          action={<Button size="small" onClick={downloadMine} disabled={!plan}>Kopyamı indir (JSON)</Button>}
        />
      ) : null}
      <Modal
        className="sync-modal"
        rootClassName="sync-modal-root"
        open={saveState === 'cakisma'}
        title="Başka bir sekme bu planı değiştirdi"
        closable={false}
        mask={{ closable: false }}
        keyboard={false}
        footer={null}
      >
        <div className="sync-content">
          <Typography.Text>Bu plan başka bir sekmede kaydedildi. İki sürüm farklı. Önce hangisini saklayacağınızı seçin.</Typography.Text>
          {incoming ? <Typography.Text style={{ fontSize: 14 }}>Kayıtlı sürüm: {formatDateTime(incoming.updatedAt)}.</Typography.Text> : null}
          {plan ? <Typography.Text style={{ fontSize: 14 }}>Bu sekmedeki sürüm: {formatDateTime(plan.updatedAt)}.</Typography.Text> : null}
          <Space className="sync-actions" wrap>
            <Button type="primary" onClick={loadStored}>Kayıtlı sürümü yükle</Button>
            <Button onClick={downloadMine} disabled={!plan}>Kopyamı indir (JSON)</Button>
            <Button onClick={keepMine}>Bu sekmedeki sürümü kaydet</Button>
          </Space>
        </div>
      </Modal>
    </>
  )
}
