import { useId, useState } from 'react'
import { Button, Drawer, Grid, Input, Select, Table } from 'antd'
import { Plus } from '@phosphor-icons/react'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import type { Evidence, EvidenceKind } from '@/data/types'
import { EvidenceLadderPicker, LADDER } from '@/components/EvidenceLadderPicker'
import { formatDate } from '@/engine/format'
import { Callout } from '@/components/Callout'
import { PageHeader } from '@/components/PageHeader'
import '@/styles/screens-kapi.css'

const KIND_LABEL: Record<EvidenceKind, string> = { gozlem: 'Gözlem', tahmin: 'Tahmin', varsayim: 'Varsayım' }
const KIND_OPTIONS = [{ value: 'gozlem', label: 'Gözlem' }, { value: 'tahmin', label: 'Tahmin' }, { value: 'varsayim', label: 'Varsayım' }]

export function EvidenceScreen() {
  const uid = useId()
  const id = (k: string) => `${uid}-${k}`
  const bp = Grid.useBreakpoint()
  const narrow = bp.md === false
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
  const ladderLabel = (l: number) => `${l}. ${LADDER[l - 1]?.label ?? ''}`.trim()

  const wideColumns = [
    { title: 'Kanıt', dataIndex: 'title', width: 280, render: (t: string) => <span>{t}</span> },
    { title: 'Tür', dataIndex: 'kind', width: 110, render: (k: EvidenceKind) => <span className="tag">{KIND_LABEL[k]}</span> },
    { title: 'Basamak', dataIndex: 'ladder', width: 200, render: (l: number) => <span className="tabular">{ladderLabel(l)}</span> },
    { title: 'Tarih', dataIndex: 'date', width: 130, render: (d?: string) => <span className="tabular">{formatDate(d, false)}</span> },
    { title: 'Kaynak', dataIndex: 'source', width: 200 },
    { title: 'Karşı bulgu', dataIndex: 'counterFinding', width: 240 },
  ]
  const narrowColumns = [
    {
      title: 'Kanıt',
      dataIndex: 'title',
      render: (_: string, e: Evidence) => (
        <div className="cell-stack">
          <span className="cell-title">{e.title}</span>
          <span className="cell-meta">
            <span className="tag">{KIND_LABEL[e.kind]}</span>
            <span className="helper tabular">{ladderLabel(e.ladder)}</span>
          </span>
          <span className="helper tabular">{formatDate(e.date, false)}{e.source ? `. ${e.source}` : ''}</span>
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <PageHeader
        kicker="Kanıt defteri"
        title="Kanıtlar"
        description="Tek kanıt defteri. Aynı kanıt birden çok adımda kullanılır. Aynı haberin iki kopyası tek kaynaktır."
        actions={<Button type="primary" icon={<Plus size={16} />} onClick={() => setOpen({ kind: 'gozlem', ladder: 5 })}>Kanıt ekle</Button>}
      />

      <section className="section" aria-label="Kanıt listesi">
        <div className="toolbar">
          <div className="toolbar-group">
            <label className="field-label" htmlFor={id('suz')} style={{ marginBottom: 0 }}>Tür</label>
            <Select id={id('suz')} value={kindFilter} onChange={setKindFilter} style={{ width: 180 }} options={[{ value: 'hepsi', label: 'Hepsi' }, ...KIND_OPTIONS]} />
          </div>
          <span className="helper tabular">{list.length} kanıt</span>
        </div>
        <div className="table-scroll">
          <Table<Evidence>
            rowKey="id"
            size="middle"
            dataSource={list}
            pagination={{ pageSize: 20, hideOnSinglePage: true }}
            style={narrow ? undefined : { minWidth: 1160 }}
            locale={{ emptyText: 'Kanıt yok. İlk görüşme notunu ekleyin.' }}
            rowClassName={() => 'is-link'}
            onRow={(e) => ({ onClick: () => setOpen(e) })}
            columns={narrow ? narrowColumns : wideColumns}
          />
        </div>
      </section>

      <Callout tone="ipucu" title="Bir bulgu neyi kanıtlar?">Gözlem kayda geçmiş olaydır. Tahmin gelecekte beklediğiniz sonuçtur. Varsayım doğru kabul ettiğiniz sözdür. Eksik ölçümü "bilinmiyor" diye kaydedin. Sıfır yazmayın.</Callout>

      <Drawer
        open={Boolean(open)}
        onClose={() => setOpen(null)}
        title={open?.id ? 'Kanıtı düzenle' : 'Yeni kanıt'}
        size={Math.min(520, typeof window !== 'undefined' ? window.innerWidth : 520)}
        footer={
          <div className="toolbar" style={{ justifyContent: 'flex-end' }}>
            <div className="toolbar-group">
              <Button onClick={() => setOpen(null)}>Vazgeç</Button>
              <Button type="primary" onClick={save} disabled={!open?.title?.trim()}>Kaydet</Button>
            </div>
          </div>
        }
      >
        {open ? (
          <div className="form-section">
            <div className="field">
              <label className="field-label" htmlFor={id('ad')}>Kanıtın adı</label>
              <Input id={id('ad')} value={open.title ?? ''} onChange={(e) => setOpen({ ...open, title: e.target.value })} />
            </div>
            <div className="field">
              <label className="field-label" htmlFor={id('tur')}>Türü</label>
              <Select id={id('tur')} value={open.kind} onChange={(v) => setOpen({ ...open, kind: v })} options={KIND_OPTIONS} />
            </div>
            <div className="field">
              <label className="field-label" htmlFor={id('tarih')}>Olay tarihi</label>
              <Input id={id('tarih')} type="date" value={open.date ?? ''} onChange={(e) => setOpen({ ...open, date: e.target.value })} />
            </div>
            <div className="field">
              <label className="field-label" htmlFor={id('kaynak')}>Kaynak</label>
              <Input id={id('kaynak')} value={open.source ?? ''} onChange={(e) => setOpen({ ...open, source: e.target.value })} placeholder="Kim, nerede?" />
            </div>
            <div className="field">
              <label className="field-label" htmlFor={id('grup')}>İlgili grup</label>
              <Input id={id('grup')} value={open.group ?? ''} onChange={(e) => setOpen({ ...open, group: e.target.value })} placeholder="Hangi müşteri grubu?" />
            </div>
            <div className="field">
              <label className="field-label" htmlFor={id('karsi')}>Karşı bulgu</label>
              <Input.TextArea id={id('karsi')} rows={2} value={open.counterFinding ?? ''} onChange={(e) => setOpen({ ...open, counterFinding: e.target.value })} placeholder="Bu iddiayla çelişen ne var?" />
            </div>
            <div className="field">
              <span className="field-label">Kanıt basamağı</span>
              <EvidenceLadderPicker value={open.ladder} onChange={(l) => setOpen({ ...open, ladder: l })} />
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}
