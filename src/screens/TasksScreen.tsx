import { useId, useState } from 'react'
import { Button, DatePicker, Grid, Input, Select, Table } from 'antd'
import dayjs from 'dayjs'
import { Plus } from '@phosphor-icons/react'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import type { Task, TaskStatus } from '@/data/types'
import { formatDate } from '@/engine/format'
import { PageHeader, SectionHead } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import '@/styles/screens-kapi.css'

const STATUS: { value: TaskStatus; label: string; cls: string }[] = [
  { value: 'taslak', label: 'Taslak', cls: '' },
  { value: 'acik', label: 'Açık', cls: 'is-open' },
  { value: 'bitti', label: 'Bitti', cls: 'is-ok' },
  { value: 'iptal', label: 'İptal', cls: 'is-muted' },
]
const STATUS_OPTIONS = STATUS.map((s) => ({ value: s.value, label: s.label }))

function StatusTag({ status }: { status: TaskStatus }) {
  const s = STATUS.find((x) => x.value === status) ?? STATUS[0]
  return <span className={`tag ${s.cls}`.trim()}>{s.label}</span>
}

export function TasksScreen() {
  const uid = useId()
  const id = (k: string) => `${uid}-${k}`
  const bp = Grid.useBreakpoint()
  const narrow = bp.md === false
  const plan = useCurrentPlan()
  const addTask = usePlanStore((s) => s.addTask)
  const updateTask = usePlanStore((s) => s.updateTask)
  const [action, setAction] = useState('')
  const [owner, setOwner] = useState('')
  const [due, setDue] = useState<string | undefined>()
  const [filter, setFilter] = useState<TaskStatus | 'hepsi'>('hepsi')
  if (!plan) return null
  const list = plan.tasks.filter((t) => filter === 'hepsi' || t.status === filter)
  const add = () => {
    if (!action.trim()) return
    addTask({ action: action.trim(), owner: owner || undefined, dueDate: due, status: owner && due ? 'acik' : 'taslak' })
    setAction(''); setOwner(''); setDue(undefined)
  }
  const sourceLabel = (sid?: string) => {
    if (!sid) return ''
    const g = plan.decisions.find((d) => d.id === sid)?.gate
    return g ? `Kapı ${g}` : ''
  }
  /** Durum hem etiket hem seçim kutusudur. Kapalı kontrol etiketi gösterir; açılan panel durumu değiştirir. */
  const statusSelect = (t: Task) => (
    <Select
      size="small"
      variant="borderless"
      value={t.status}
      onChange={(v) => updateTask(t.id, { status: v })}
      options={STATUS_OPTIONS}
      labelRender={(p) => <StatusTag status={p.value as TaskStatus} />}
      style={{ width: 140 }}
      aria-label={`Durum: ${t.action}`}
    />
  )

  const wideColumns = [
    { title: 'İş', dataIndex: 'action', width: 320 },
    { title: 'Sorumlu', dataIndex: 'owner', width: 160, render: (o?: string) => o ?? <span className="tag is-muted">Eksik</span> },
    { title: 'Son tarih', dataIndex: 'dueDate', width: 160, render: (d?: string) => (d ? <span className="tabular">{formatDate(d, false)}</span> : <span className="tag is-muted">Tarih yok</span>) },
    { title: 'Durum', dataIndex: 'status', width: 160, render: (_: TaskStatus, t: Task) => statusSelect(t) },
    { title: 'Kaynak karar', dataIndex: 'sourceDecisionId', width: 140, render: (sid?: string) => sourceLabel(sid) },
  ]
  const narrowColumns = [
    {
      title: 'İş',
      dataIndex: 'action',
      render: (_: string, t: Task) => (
        <div className="cell-stack">
          <span className="cell-title">{t.action}</span>
          <span className="cell-meta">
            {statusSelect(t)}
            <span className="helper">{t.owner ?? 'Sorumlu eksik'}</span>
            <span className="helper tabular">{t.dueDate ? formatDate(t.dueDate, false) : 'Tarih yok'}</span>
          </span>
          {sourceLabel(t.sourceDecisionId) ? <span className="helper">{sourceLabel(t.sourceDecisionId)}</span> : null}
        </div>
      ),
    },
  ]

  return (
    <div className="page">
      <PageHeader
        kicker="İş listesi"
        title="İşler"
        description="Her iş bir karara bağlanır. Sahibi veya tarihi eksik iş taslak kalır. Boş tarihin yerine keyfî süre yazılmaz."
      />

      <section className="section" aria-label="Yeni iş">
        <SectionHead title="Yeni iş" description="Sorumlu ve tarih dolu ise iş “Açık” olur. Biri eksikse “Taslak” kalır." />
        <div className="form-section">
          <div className="field">
            <label className="field-label" htmlFor={id('is')}>Ne yapılacak?</label>
            <Input id={id('is')} value={action} onChange={(e) => setAction(e.target.value)} onPressEnter={add} />
          </div>
          <div className="two-col">
            <div className="field">
              <label className="field-label" htmlFor={id('sorumlu')}>Sorumlu</label>
              <Input id={id('sorumlu')} value={owner} onChange={(e) => setOwner(e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label" htmlFor={id('tarih')}>Son tarih</label>
              <DatePicker id={id('tarih')} value={due ? dayjs(due) : null} onChange={(d) => setDue(d ? d.format('YYYY-MM-DD') : undefined)} format="DD.MM.YYYY" />
            </div>
          </div>
          <div className="toolbar" style={{ justifyContent: 'flex-end' }}>
            <div className="toolbar-group">
              <Button type="primary" icon={<Plus size={16} />} onClick={add} disabled={!action.trim()}>İş ekle</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-label="İş listesi">
        <SectionHead title="İş listesi" />
        {plan.tasks.length === 0 ? (
          <EmptyState title="Henüz iş yok" text="Kapı kararları iş doğurur. İlk işi yukarıdaki alandan da ekleyebilirsiniz." />
        ) : (
          <>
            <div className="toolbar">
              <div className="toolbar-group">
                <label className="field-label" htmlFor={id('suz')} style={{ marginBottom: 0 }}>Durum</label>
                <Select id={id('suz')} value={filter} onChange={setFilter} style={{ width: 180 }} options={[{ value: 'hepsi', label: 'Hepsi' }, ...STATUS_OPTIONS]} />
              </div>
              <span className="helper tabular">{list.length} iş</span>
            </div>
            <div className="table-scroll">
              <Table<Task>
                rowKey="id"
                size="middle"
                dataSource={list}
                pagination={{ pageSize: 20, hideOnSinglePage: true }}
                style={narrow ? undefined : { minWidth: 940 }}
                locale={{ emptyText: 'Bu durumda iş yok.' }}
                columns={narrow ? narrowColumns : wideColumns}
              />
            </div>
          </>
        )}
      </section>
    </div>
  )
}
