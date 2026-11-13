import { useState } from 'react'
import { Button, Input, Modal, Select, Space, theme } from 'antd'
import { Paperclip, Plus } from '@phosphor-icons/react'
import type { EvidenceKind, PlanDoc } from '@/data/types'
import { usePlanStore } from '@/store/planStore'
import { EvidenceLadderPicker } from './EvidenceLadderPicker'

/** Kanıt defterinden kayıt bağlar. Hızlı yeni kanıt ekler. Aynı kanıt birden çok adımda kullanılır. */
export function EvidenceLink({ id, plan, value, onChange }: { id: string; plan: PlanDoc; value: string[]; onChange: (ids: string[]) => void }) {
  const { token } = theme.useToken()
  const addEvidence = usePlanStore((s) => s.addEvidence)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<EvidenceKind>('gozlem')
  const [ladder, setLadder] = useState<number>(5)
  const [source, setSource] = useState('')
  const options = plan.evidence.map((e) => ({ value: e.id, label: `${e.title} (${e.kind}, ${e.ladder}. basamak)` }))
  const save = () => {
    if (!title.trim()) return
    const eid = addEvidence({ title: title.trim(), kind, ladder, source, linkedSteps: [] })
    onChange([...value, eid])
    setTitle('')
    setSource('')
    setOpen(false)
  }
  return (
    <Space orientation="vertical" style={{ width: '100%' }} size={8}>
      <Select id={id} mode="multiple" style={{ width: '100%' }} value={value} options={options} onChange={onChange} placeholder="Kanıt seçin" suffixIcon={<Paperclip size={18} />} notFoundContent="Kanıt yok. Yeni kanıt ekleyin." />
      <Button icon={<Plus size={18} />} onClick={() => setOpen(true)}>Yeni kanıt ekle</Button>
      <Modal open={open} title="Yeni kanıt" onCancel={() => setOpen(false)} onOk={save} okText="Kaydet" cancelText="Vazgeç" destroyOnHidden>
        <Space orientation="vertical" style={{ width: '100%' }} size={12}>
          <label style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
            <span>Kanıtın adı</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örneğin 3 Kasım görüşme notu" />
          </label>
          <label style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
            <span>Türü</span>
            <Select value={kind} onChange={setKind} options={[{ value: 'gozlem', label: 'Gözlem. Kayda geçmiş olay.' }, { value: 'tahmin', label: 'Tahmin. Beklenen sonuç.' }, { value: 'varsayim', label: 'Varsayım. Doğru kabul edilen söz.' }]} />
          </label>
          <label style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
            <span>Kaynak ve tarih</span>
            <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Kim, ne zaman, nerede?" />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
            <span>Kanıt basamağı</span>
            <EvidenceLadderPicker value={ladder} onChange={setLadder} />
          </div>
          <span style={{ fontSize: 14, color: token.colorTextSecondary }}>Aynı haberin iki kopyası tek kaynaktır.</span>
        </Space>
      </Modal>
    </Space>
  )
}
