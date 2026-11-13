import { useState } from 'react'
import { Button, Card, Empty, Input, Modal, Popconfirm, Space, Typography, Upload, theme } from 'antd'
import { Plus, UploadSimple, Trash, ArrowRight } from '@phosphor-icons/react'
import { useNavigate } from 'react-router'
import { usePlanStore } from '@/store/planStore'
import { formatDate } from '@/engine/format'
import type { PlanDoc } from '@/data/types'
import { Callout } from '@/components/Callout'

export function PlansScreen() {
  const { token } = theme.useToken()
  const nav = useNavigate()
  const plans = usePlanStore((s) => s.plans)
  const createPlan = usePlanStore((s) => s.createPlan)
  const selectPlan = usePlanStore((s) => s.selectPlan)
  const deletePlan = usePlanStore((s) => s.deletePlan)
  const importPlan = usePlanStore((s) => s.importPlan)
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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 24 }}>
      <div>
        <Typography.Title level={1} style={{ fontSize: 32, marginBottom: 8 }}>Planlar</Typography.Title>
        <Typography.Paragraph style={{ fontSize: 16, color: token.colorTextSecondary, marginBottom: 0 }}>
          Her iş fikri ayrı bir plandır. Plan tarayıcınızda saklanır. İstediğinizde dosya olarak dışa aktarırsınız.
        </Typography.Paragraph>
      </div>
      <Space wrap>
        <Button type="primary" size="large" icon={<Plus size={20} />} onClick={() => setOpen(true)}>Yeni plan</Button>
        <Upload
          accept="application/json"
          showUploadList={false}
          beforeUpload={(file) => {
            file.text().then((t) => {
              try {
                const doc = JSON.parse(t) as PlanDoc
                if (doc.schemaVersion && doc.id) importPlan(doc)
              } catch {
                /* geçersiz dosya sessizce yok sayılır */
              }
            })
            return false
          }}
        >
          <Button size="large" icon={<UploadSimple size={20} />}>JSON içe al</Button>
        </Upload>
      </Space>
      {list.length === 0 ? (
        <Empty description="Henüz plan yok. Yeni plan açın." />
      ) : (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {list.map((p) => (
            <Card key={p.id} title={p.name} extra={<Popconfirm title="Plan silinsin mi?" description="Bu işlem geri alınamaz." okText="Sil" cancelText="Vazgeç" onConfirm={() => deletePlan(p.id)}><Button type="text" danger aria-label="Planı sil" icon={<Trash size={18} />} /></Popconfirm>}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
                <span style={{ color: token.colorTextSecondary, fontSize: 14 }}>Son değişiklik {formatDate(p.updatedAt)}</span>
                <span className="tabular" style={{ fontSize: 14 }}>Sürüm {p.revision}. {p.decisions.length} karar kaydı.</span>
                <Button type="primary" icon={<ArrowRight size={18} />} iconPosition="end" onClick={() => { selectPlan(p.id); nav(p.lastLocation ?? '/ozet') }}>
                  Planı aç
                </Button>
              </div>
            </Card>
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
