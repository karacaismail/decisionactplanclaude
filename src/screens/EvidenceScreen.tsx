import { useState } from 'react'
import { Button, Card, Drawer, Input, Select, Space, Table, Tag, Typography, theme } from 'antd'
import { Plus, Paperclip } from '@phosphor-icons/react'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import type { Evidence, EvidenceKind } from '@/data/types'
import { EvidenceLadderPicker, LADDER } from '@/components/EvidenceLadderPicker'
import { formatDate } from '@/engine/format'
import { Callout } from '@/components/Callout'

const KIND_LABEL: Record<EvidenceKind, string> = { gozlem: 'Gözlem', tahmin: 'Tahmin', varsayim: 'Varsayım' }

export function EvidenceScreen() {
  const { token } = theme.useToken()
  const plan = useCurrentPlan()
  const addEvidence = usePlanStore((s) => s.addEvidence)
  const updateEvidence = usePlanStore((s) => s.updateEvidence)
  const [open, setOpen] = useState<Partial<Evidence> | null>(null)
  const [kindFilter, setKindFilter] = useState<EvidenceKind | 'hepsi'>('hepsi')
  if (!plan) return null
  const list = plan.evidence.filter((e) => kindFilter === 'hepsi' || e.kind === kindFilter)
  const save = () => {
    if (!open?.title?.trim()) return
    if (open.id) updateEvidence(open.id, open)
    else addEvidence({ title: open.title, kind: open.kind ?? 'gozlem', ladder: open.ladder ?? 5, date: open.date, source: open.source, group: open.group, counterFinding: open.counterFinding, linkedSteps: [] })
    setOpen(null)
  }
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <Typography.Title level={1} style={{ fontSize: 32, marginBottom: 8 }}>Kanıtlar</Typography.Title>
        <Typography.Text style={{ color: token.colorTextSecondary }}>Tek kanıt defteri. Aynı kanıt birden çok adımda kullanılır. Aynı haberin iki kopyası tek kaynaktır.</Typography.Text>
      </div>
      <Space wrap>
        <Button type="primary" icon={<Plus size={18} />} onClick={() => setOpen({ kind: 'gozlem', ladder: 5 })}>Kanıt ekle</Button>
        <Select value={kindFilter} onChange={setKindFilter} style={{ width: 200 }} options={[{ value: 'hepsi', label: 'Hepsi' }, { value: 'gozlem', label: 'Gözlem' }, { value: 'tahmin', label: 'Tahmin' }, { value: 'varsayim', label: 'Varsayım' }]} aria-label="Türe göre süz" />
      </Space>
      <Card>
        <Table
          rowKey="id"
          size="middle"
          dataSource={list}
          pagination={{ pageSize: 20, hideOnSinglePage: true }}
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: 'Kanıt yok. İlk görüşme notunu ekleyin.' }}
          onRow={(e) => ({ onClick: () => setOpen(e) })}
          columns={[
            { title: 'Kanıt', dataIndex: 'title', render: (t: string) => <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Paperclip size={16} aria-hidden />{t}</span> },
            { title: 'Tür', dataIndex: 'kind', render: (k: EvidenceKind) => <Tag style={{ fontSize: 14 }}>{KIND_LABEL[k]}</Tag> },
            { title: 'Basamak', dataIndex: 'ladder', render: (l: number) => <span className="tabular">{l}. {LADDER[l - 1]?.label}</span> },
            { title: 'Tarih', dataIndex: 'date', render: (d?: string) => formatDate(d, false) },
            { title: 'Kaynak', dataIndex: 'source' },
            { title: 'Karşı bulgu', dataIndex: 'counterFinding' },
          ]}
        />
      </Card>
      <Callout tone="ipucu" title="Bir bulgu neyi kanıtlar?">Gözlem kayda geçmiş olaydır. Tahmin gelecekte beklediğiniz sonuçtur. Varsayım doğru kabul ettiğiniz sözdür. Eksik ölçümü "bilinmiyor" diye kaydedin. Sıfır yazmayın.</Callout>
      <Drawer open={Boolean(open)} onClose={() => setOpen(null)} title={open?.id ? 'Kanıtı düzenle' : 'Yeni kanıt'} width={Math.min(520, typeof window !== 'undefined' ? window.innerWidth : 520)} extra={<Button type="primary" onClick={save} disabled={!open?.title?.trim()}>Kaydet</Button>}>
        {open ? (
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'grid', gap: 4 }}><span>Kanıtın adı</span><Input value={open.title ?? ''} onChange={(e) => setOpen({ ...open, title: e.target.value })} /></label>
            <label style={{ display: 'grid', gap: 4 }}><span>Türü</span><Select value={open.kind} onChange={(v) => setOpen({ ...open, kind: v })} options={[{ value: 'gozlem', label: 'Gözlem' }, { value: 'tahmin', label: 'Tahmin' }, { value: 'varsayim', label: 'Varsayım' }]} /></label>
            <label style={{ display: 'grid', gap: 4 }}><span>Olay tarihi</span><Input type="date" value={open.date ?? ''} onChange={(e) => setOpen({ ...open, date: e.target.value })} /></label>
            <label style={{ display: 'grid', gap: 4 }}><span>Kaynak</span><Input value={open.source ?? ''} onChange={(e) => setOpen({ ...open, source: e.target.value })} placeholder="Kim, nerede?" /></label>
            <label style={{ display: 'grid', gap: 4 }}><span>İlgili grup</span><Input value={open.group ?? ''} onChange={(e) => setOpen({ ...open, group: e.target.value })} placeholder="Hangi müşteri grubu?" /></label>
            <label style={{ display: 'grid', gap: 4 }}><span>Karşı bulgu</span><Input.TextArea rows={2} value={open.counterFinding ?? ''} onChange={(e) => setOpen({ ...open, counterFinding: e.target.value })} placeholder="Bu iddiayla çelişen ne var?" /></label>
            <div style={{ display: 'grid', gap: 4 }}><span>Kanıt basamağı</span><EvidenceLadderPicker value={open.ladder} onChange={(l) => setOpen({ ...open, ladder: l })} /></div>
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}
