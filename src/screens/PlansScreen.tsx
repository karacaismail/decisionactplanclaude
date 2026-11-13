import { useState } from 'react'
import { App as AntApp, Button, Input, Modal, Popconfirm, Tag, Upload } from 'antd'
import { Plus, UploadSimple, Trash, ArrowRight, Folders, Sparkle } from '@phosphor-icons/react'
import { useNavigate } from 'react-router'
import { usePlanStore } from '@/store/planStore'
import { formatDate } from '@/engine/format'
import { buildDemoPlan } from '@/data/demo'
import { Callout } from '@/components/Callout'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'

export function PlansScreen() {
  const nav = useNavigate()
  const plans = usePlanStore((s) => s.plans)
  const createPlan = usePlanStore((s) => s.createPlan)
  const selectPlan = usePlanStore((s) => s.selectPlan)
  const deletePlan = usePlanStore((s) => s.deletePlan)
  const importPlan = usePlanStore((s) => s.importPlan)
  const importPlanText = usePlanStore((s) => s.importPlanText)
  const { message } = AntApp.useApp()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const list = Object.values(plans).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  const create = () => {
    if (!name.trim()) return
    createPlan(name.trim())
    setOpen(false)
    setName('')
    nav('/baslangic')
  }

  const openDemo = () => {
    importPlan(buildDemoPlan())
    nav('/ozet')
  }

  const newPlanButton = (
    <Button type="primary" size="large" icon={<Plus size={20} />} onClick={() => setOpen(true)}>
      Yeni plan
    </Button>
  )
  const demoButton = (
    <Button size="large" icon={<Sparkle size={20} />} onClick={openDemo}>
      Örnek planı aç
    </Button>
  )
  const importButton = (
    <Upload
      accept="application/json"
      showUploadList={false}
      beforeUpload={(file) => {
        file.text().then((t) => {
          try {
            importPlanText(t, file.size)
            message.success('Plan içe alındı.')
          } catch (e) {
            message.error(e instanceof Error ? e.message : 'Dosya okunamadı.')
          }
        })
        return false
      }}
    >
      <Button size="large" icon={<UploadSimple size={20} />}>JSON içe al</Button>
    </Upload>
  )

  return (
    <div className="page">
      <PageHeader
        title="Planlar"
        kicker="Çalışma alanı"
        icon={<span className="icon-tile deep" aria-hidden><Folders size={20} weight="fill" /></span>}
        description="Her iş fikri ayrı bir plandır. Plan bu tarayıcıda saklanır. İstediğinizde dosya olarak dışa aktarırsınız."
        actions={
          list.length > 0 ? (
            <>
              {newPlanButton}
              {demoButton}
              {importButton}
            </>
          ) : null
        }
      />

      {list.length === 0 ? (
        <EmptyState
          icon={<Folders size={28} weight="fill" />}
          title="Henüz plan yok"
          text="Yeni bir plan açın. Ya da örnek planla ekranları tanıyın."
          actions={
            <>
              {newPlanButton}
              {demoButton}
              {importButton}
            </>
          }
        />
      ) : (
        <div className="card-grid">
          {list.map((p) => (
            <article key={p.id} className={`surface-card${p.example ? ' is-example' : ''}`} aria-label={p.name}>
              <div className="surface-card-head">
                <h3>{p.name}</h3>
                <Popconfirm title="Plan silinsin mi?" description="Bu işlem geri alınamaz." okText="Sil" cancelText="Vazgeç" onConfirm={() => deletePlan(p.id)}>
                  <Button type="text" danger aria-label={`${p.name} planını sil`} icon={<Trash size={18} />} />
                </Popconfirm>
              </div>
              {p.example ? <Tag color="processing" style={{ fontSize: 14, margin: 0, width: 'fit-content' }}>Örnek</Tag> : null}
              <div className="meta">
                <span>Son değişiklik {formatDate(p.updatedAt)}</span>
                <span className="tabular">Sürüm {p.revision}. {p.decisions.length} karar kaydı.</span>
              </div>
              <div className="card-actions">
                <Button type="primary" icon={<ArrowRight size={18} />} iconPlacement="end" onClick={() => { selectPlan(p.id); nav(p.lastLocation ?? '/ozet') }}>
                  Planı aç
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Callout tone="bilgi" title="Veri nerede durur?">Plan yalnız bu tarayıcıda durur. Tarayıcı verisi silinirse plan kaybolur. Her hafta "Çıktılar" ekranından JSON dışa aktarın.</Callout>

      <Modal open={open} title="Yeni plan" onCancel={() => setOpen(false)} onOk={create} okText="Oluştur" cancelText="Vazgeç" okButtonProps={{ disabled: !name.trim() }}>
        <label style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
          <span>Planın adı</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Örneğin Mahalle kafesi" onPressEnter={create} autoFocus />
        </label>
      </Modal>
    </div>
  )
}
