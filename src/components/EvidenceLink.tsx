import { useState } from 'react'
import { Button, Drawer, Form, Input, Select, Tag } from 'antd'
import { Paperclip, Plus } from '@phosphor-icons/react'
import type { EvidenceKind, PlanDoc } from '@/data/types'
import { usePlanStore } from '@/store/planStore'
import { EvidenceLadderPicker } from './EvidenceLadderPicker'
import '@/styles/mobil-token.css'

const KIND_LABEL: Record<EvidenceKind, string> = { gozlem: 'Gözlem', tahmin: 'Tahmin', varsayim: 'Varsayım' }

/**
 * Kanıt defterinden kayıt bağlar. Arama yapan çoklu `Select` ile seçilir.
 * "Yeni kanıt" yandan açılan `Drawer` formuyla eklenir. Aynı kanıt birden çok adımda kullanılır.
 */
export function EvidenceLink({ id, plan, value, onChange }: { id: string; plan: PlanDoc; value: string[]; onChange: (ids: string[]) => void }) {
  const addEvidence = usePlanStore((s) => s.addEvidence)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<EvidenceKind>('gozlem')
  const [ladder, setLadder] = useState<number>(5)
  const [source, setSource] = useState('')
  const options = plan.evidence.map((e) => ({ value: e.id, label: `${e.title} (${KIND_LABEL[e.kind]}, ${e.ladder}. basamak)` }))
  const save = () => {
    if (!title.trim()) return
    const eid = addEvidence({ title: title.trim(), kind, ladder, source, linkedSteps: [] })
    onChange([...value, eid])
    setTitle('')
    setSource('')
    setOpen(false)
  }
  return (
    <div className="evidence-link mt-evidence-link">
      <Select
        id={id}
        className="mt-evidence-link-control"
        classNames={{
          item: 'mt-evidence-link-selection',
          itemRemove: 'mt-evidence-link-remove',
          popup: { root: 'mt-evidence-link-popup', listItem: 'mt-evidence-link-option' },
        }}
        mode="multiple"
        showSearch
        optionFilterProp="label"
        value={value}
        options={options}
        onChange={onChange}
        placeholder="Kanıt seçin"
        suffixIcon={<Paperclip className="mt-icon-inline" aria-hidden />}
        notFoundContent="Kanıt yok. Yeni kanıt ekleyin."
        maxTagCount="responsive"
      />
      <div className="evidence-link-foot mt-evidence-link-foot">
        <Tag className="fill-tag">Seçili kanıt: {value.length}</Tag>
        <Button className="mt-evidence-link-action" icon={<Plus className="mt-icon-inline" />} onClick={() => setOpen(true)}>Yeni kanıt</Button>
      </div>
      <Drawer
        rootClassName="mt-evidence-link-drawer"
        open={open}
        onClose={() => setOpen(false)}
        title="Yeni kanıt"
        size="default"
        destroyOnHidden
        styles={{ wrapper: { maxWidth: '100vw' } }}
        footer={
          <div className="drawer-foot mt-evidence-link-actions">
            <Button className="mt-evidence-link-action" onClick={() => setOpen(false)}>Vazgeç</Button>
            <Button className="mt-evidence-link-action" type="primary" onClick={save} disabled={!title.trim()}>Kaydet</Button>
          </div>
        }
      >
        <Form layout="vertical" component={false} requiredMark={false}>
          <div className="drawer-body mt-evidence-link-fields">
            <Form.Item layout="vertical" label="Kanıtın adı" htmlFor={`${id}-yeni-ad`} extra="Örneğin 3 Kasım görüşme notu.">
              <Input className="mt-evidence-link-control" id={`${id}-yeni-ad`} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Kanıtın adı" />
            </Form.Item>
            <Form.Item layout="vertical" label="Türü" htmlFor={`${id}-yeni-tur`}>
              <Select className="mt-evidence-link-control" classNames={{ popup: { root: 'mt-evidence-link-popup', listItem: 'mt-evidence-link-option' } }} id={`${id}-yeni-tur`} value={kind} onChange={setKind} options={[{ value: 'gozlem', label: 'Gözlem. Kayda geçmiş olay.' }, { value: 'tahmin', label: 'Tahmin. Beklenen sonuç.' }, { value: 'varsayim', label: 'Varsayım. Doğru kabul edilen söz.' }]} />
            </Form.Item>
            <Form.Item layout="vertical" label="Kaynak ve tarih" htmlFor={`${id}-yeni-kaynak`} extra="Kim, ne zaman, nerede söyledi veya yaptı?">
              <Input className="mt-evidence-link-control" id={`${id}-yeni-kaynak`} value={source} onChange={(e) => setSource(e.target.value)} placeholder="Kaynak" />
            </Form.Item>
            <Form.Item layout="vertical" label="Kanıt basamağı" extra="Aynı haberin iki kopyası tek kaynaktır.">
              <EvidenceLadderPicker value={ladder} onChange={setLadder} />
            </Form.Item>
          </div>
        </Form>
      </Drawer>
    </div>
  )
}
