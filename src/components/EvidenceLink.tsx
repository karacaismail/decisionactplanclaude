import { useState } from 'react'
import { Button, Input, Modal, Select } from 'antd'
import { Paperclip, Plus } from '@phosphor-icons/react'
import type { EvidenceKind, PlanDoc } from '@/data/types'
import { usePlanStore } from '@/store/planStore'
import { EvidenceLadderPicker } from './EvidenceLadderPicker'

/** Kanıt defterinden kayıt bağlar. Hızlı yeni kanıt ekler. Aynı kanıt birden çok adımda kullanılır. */
export function EvidenceLink({ id, plan, value, onChange }: { id: string; plan: PlanDoc; value: string[]; onChange: (ids: string[]) => void }) {
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
    <div className="evidence-link">
      <Select id={id} mode="multiple" value={value} options={options} onChange={onChange} placeholder="Kanıt seçin" suffixIcon={<Paperclip size={16} />} notFoundContent="Kanıt yok. Yeni kanıt ekleyin." />
      <Button icon={<Plus size={16} />} onClick={() => setOpen(true)}>Yeni kanıt ekle</Button>
      <Modal open={open} title="Yeni kanıt" onCancel={() => setOpen(false)} onOk={save} okText="Kaydet" cancelText="Vazgeç" okButtonProps={{ disabled: !title.trim() }} destroyOnHidden>
        <div className="modal-fields">
          <div className="field">
            <label htmlFor={`${id}-yeni-ad`} className="field-label">Kanıtın adı</label>
            <Input id={`${id}-yeni-ad`} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örneğin 3 Kasım görüşme notu" />
          </div>
          <div className="field">
            <label htmlFor={`${id}-yeni-tur`} className="field-label">Türü</label>
            <Select id={`${id}-yeni-tur`} value={kind} onChange={setKind} options={[{ value: 'gozlem', label: 'Gözlem. Kayda geçmiş olay.' }, { value: 'tahmin', label: 'Tahmin. Beklenen sonuç.' }, { value: 'varsayim', label: 'Varsayım. Doğru kabul edilen söz.' }]} />
          </div>
          <div className="field">
            <label htmlFor={`${id}-yeni-kaynak`} className="field-label">Kaynak ve tarih</label>
            <Input id={`${id}-yeni-kaynak`} value={source} onChange={(e) => setSource(e.target.value)} placeholder="Kim, ne zaman, nerede?" />
          </div>
          <div className="field">
            <span className="field-label">Kanıt basamağı</span>
            <EvidenceLadderPicker value={ladder} onChange={setLadder} />
          </div>
          <div className="field-help">Aynı haberin iki kopyası tek kaynaktır.</div>
        </div>
      </Modal>
    </div>
  )
}
