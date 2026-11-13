import { useId, useState } from 'react'
import { Avatar, Badge, Button, Card, DatePicker, Drawer, Empty, Form, Grid, Input, Select, Statistic, Table, Tabs, Tag, App as AntApp } from 'antd'
import type { TableProps } from 'antd'
import dayjs from 'dayjs'
import { Plus, Check, CalendarBlank, User, Kanban, ListBullets } from '@phosphor-icons/react'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import type { Task, TaskStatus } from '@/data/types'
import { formatDate } from '@/engine/format'
import { PageHeader } from '@/components/PageHeader'
import '@/styles/screens-kapi.css'

const STATUS: { value: TaskStatus; label: string; cls: string }[] = [
  { value: 'taslak', label: 'Taslak', cls: '' },
  { value: 'acik', label: 'Açık', cls: 'is-open' },
  { value: 'bitti', label: 'Bitti', cls: 'is-ok' },
  { value: 'iptal', label: 'İptal', cls: 'is-muted' },
]
const STATUS_OPTIONS = STATUS.map((s) => ({ value: s.value, label: s.label }))
const STATUS_FILTERS = STATUS.map((s) => ({ text: s.label, value: s.value }))
const COLUMNS: { key: string; title: string; statuses: TaskStatus[] }[] = [
  { key: 'taslak', title: 'Taslak', statuses: ['taslak'] },
  { key: 'acik', title: 'Açık', statuses: ['acik'] },
  { key: 'bitti', title: 'Bitti', statuses: ['bitti', 'iptal'] },
]

function StatusTag({ status }: { status: TaskStatus }) {
  const s = STATUS.find((x) => x.value === status) ?? STATUS[0]
  return <span className={`tag ${s.cls}`.trim()}>{s.label}</span>
}

const today = () => new Date().toISOString().slice(0, 10)
const isOverdue = (t: Task) => Boolean(t.dueDate) && (t.status === 'acik' || t.status === 'taslak') && (t.dueDate as string) < today()
const initial = (name?: string) => (name?.trim() ? name.trim().charAt(0).toLocaleUpperCase('tr-TR') : '?')

export function TasksScreen() {
  const uid = useId()
  const id = (k: string) => `${uid}-${k}`
  const bp = Grid.useBreakpoint()
  const narrow = bp.md === false
  const { message } = AntApp.useApp()
  const plan = useCurrentPlan()
  const addTask = usePlanStore((s) => s.addTask)
  const updateTask = usePlanStore((s) => s.updateTask)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<{ action: string; owner: string; due?: string; acceptance: string }>({ action: '', owner: '', acceptance: '' })
  if (!plan) return null
  const tasks = plan.tasks
  const openTasks = tasks.filter((t) => t.status === 'acik')
  const draftTasks = tasks.filter((t) => t.status === 'taslak')
  const doneTasks = tasks.filter((t) => t.status === 'bitti')
  const overdue = tasks.filter(isOverdue).length

  const add = () => {
    if (!draft.action.trim()) return
    const status: TaskStatus = draft.owner.trim() && draft.due ? 'acik' : 'taslak'
    addTask({ action: draft.action.trim(), owner: draft.owner.trim() || undefined, dueDate: draft.due, acceptance: draft.acceptance.trim() || undefined, status })
    message.success(status === 'acik' ? 'İş "Açık" olarak eklendi.' : 'İş "Taslak" olarak eklendi. Sorumlu ve tarih dolunca açılır.')
    setDraft({ action: '', owner: '', acceptance: '' })
    setOpen(false)
  }
  const sourceLabel = (sid?: string) => {
    if (!sid) return ''
    const g = plan.decisions.find((d) => d.id === sid)?.gate
    return g ? `Kapı ${g}` : ''
  }
  /** Durum hem etiket hem seçim kutusudur. Kapalı kontrol etiketi gösterir; açılan panel durumu değiştirir ve kartı taşır. */
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
  const dueTag = (t: Task) => {
    if (!t.dueDate) return <Tag>Tarih yok</Tag>
    const late = isOverdue(t)
    return (
      <Tag color={late ? 'error' : undefined} icon={<CalendarBlank size={14} aria-hidden />}>
        <span className="tabular">{formatDate(t.dueDate, false)}</span>{late ? ' gecikti' : ''}
      </Tag>
    )
  }

  const wideColumns: TableProps<Task>['columns'] = [
    { title: 'İş', dataIndex: 'action', width: 320, className: 'is-sticky-col' },
    { title: 'Sorumlu', dataIndex: 'owner', width: 180, render: (o?: string) => (o ? <span className="task-owner"><Avatar size={28}>{initial(o)}</Avatar><span>{o}</span></span> : <span className="tag is-muted">Eksik</span>) },
    { title: 'Son tarih', dataIndex: 'dueDate', width: 200, sorter: (a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''), render: (_: string | undefined, t: Task) => dueTag(t) },
    { title: 'Durum', dataIndex: 'status', width: 160, filters: STATUS_FILTERS, onFilter: (v, t) => t.status === v, render: (_: TaskStatus, t: Task) => statusSelect(t) },
    { title: 'Kaynak karar', dataIndex: 'sourceDecisionId', width: 140, render: (sid?: string) => sourceLabel(sid) || <span className="helper">Elle eklendi</span> },
  ]
  const narrowColumns: TableProps<Task>['columns'] = [
    {
      title: 'İş',
      dataIndex: 'action',
      filters: STATUS_FILTERS,
      onFilter: (v, t) => t.status === v,
      render: (_: string, t: Task) => (
        <div className="cell-stack">
          <span className="cell-head">
            <span className="cell-title">{t.action}</span>
            {statusSelect(t)}
          </span>
          <span className="cell-line">{t.owner ?? 'Sorumlu eksik'}</span>
          <span className="cell-line">
            {dueTag(t)}
            {sourceLabel(t.sourceDecisionId) ? <span>{sourceLabel(t.sourceDecisionId)}</span> : null}
          </span>
        </div>
      ),
    },
  ]

  const board = (
    <div className="kanban" role="group" aria-label="İş panosu">
      {COLUMNS.map((col) => {
        const items = tasks.filter((t) => col.statuses.includes(t.status))
        return (
          <section key={col.key} className="kanban-col" aria-labelledby={`pano-${col.key}`}>
            <div className="kanban-head">
              <h3 id={`pano-${col.key}`}>{col.title}</h3>
              <span className="kanban-count">{items.length} iş</span>
            </div>
            {items.length === 0 ? <span className="kanban-empty">Bu sütunda iş yok.</span> : null}
            {items.map((t) => (
              <Card key={t.id} className="task-card" variant="borderless" size="small">
                <p className="task-title">{t.action}</p>
                <div className="task-meta">
                  <span className="task-owner">
                    <Avatar size={28} aria-hidden>{initial(t.owner)}</Avatar>
                    <span>{t.owner ?? 'Sorumlu eksik'}</span>
                  </span>
                  {dueTag(t)}
                </div>
                <div className="task-foot">
                  {statusSelect(t)}
                  <span className="task-source">{sourceLabel(t.sourceDecisionId) || 'Elle eklendi'}</span>
                </div>
              </Card>
            ))}
          </section>
        )
      })}
    </div>
  )

  const table = (
    <div className="table-scroll">
      <Table<Task>
        rowKey="id"
        size="middle"
        dataSource={tasks}
        pagination={{ pageSize: 10, hideOnSinglePage: true, showSizeChanger: false }}
        style={narrow ? undefined : { minWidth: 1000 }}
        locale={{ emptyText: 'Bu durumda iş yok.' }}
        columns={narrow ? narrowColumns : wideColumns}
      />
    </div>
  )

  return (
    <div className="page">
      <PageHeader
        kicker="İş listesi"
        title="İşler"
        description="Her iş bir karara bağlanır. Sahibi veya tarihi eksik iş taslak kalır. Boş tarihin yerine keyfî süre yazılmaz."
        actions={<Button type="primary" icon={<Plus size={16} />} onClick={() => setOpen(true)}>İş ekle</Button>}
      />

      <div className="stat-grid is-three" role="group" aria-label="İş özeti">
        <Card className="k-card stat-card" variant="borderless">
          <Statistic title="Açık iş" value={openTasks.length} />
          <span className="stat-note is-badge">
            <Badge className="k-badge" count={overdue} showZero aria-label={`${overdue} gecikmiş iş`} />
            <span>{overdue > 0 ? 'iş tarihini geçti.' : 'gecikmiş iş yok.'}</span>
          </span>
        </Card>
        <Card className="k-card stat-card" variant="borderless">
          <Statistic title="Taslak iş" value={draftTasks.length} />
          <span className="stat-note">Sorumlu ve tarih dolunca açılır.</span>
        </Card>
        <Card className="k-card stat-card" variant="borderless">
          <Statistic title="Biten iş" value={doneTasks.length} suffix={`/ ${tasks.length}`} />
          <span className="stat-note">İptal edilen işler sayılmaz.</span>
        </Card>
      </div>

      {tasks.length === 0 ? (
        <Card className="k-card" variant="borderless" title="İş listesi">
          <Empty description="Henüz iş yok. Kapı kararları iş doğurur. İlk işi sağ üstteki düğmeyle de ekleyebilirsiniz." />
        </Card>
      ) : (
        <Tabs
          className="k-tabs"
          defaultActiveKey="pano"
          items={[
            { key: 'pano', label: 'Pano', icon: <Kanban size={16} aria-hidden />, children: board },
            { key: 'liste', label: 'Liste', icon: <ListBullets size={16} aria-hidden />, children: table },
          ]}
        />
      )}

      <Drawer
        rootClassName="k-drawer"
        open={open}
        onClose={() => setOpen(false)}
        title="Yeni iş"
        size={Math.min(520, typeof window !== 'undefined' ? window.innerWidth : 520)}
        footer={
          <div className="drawer-footer">
            <Button type="text" onClick={() => setOpen(false)}>Vazgeç</Button>
            <Button icon={<Check size={16} />} onClick={add} disabled={!draft.action.trim()}>İşi kaydet</Button>
          </div>
        }
      >
        <Form className="k-form" layout="vertical" requiredMark={false} onFinish={add}>
          <Form.Item label="Ne yapılacak?" htmlFor={id('is')} extra="Tek iş, tek cümle.">
            <Input.TextArea id={id('is')} rows={2} showCount value={draft.action} onChange={(e) => setDraft({ ...draft, action: e.target.value })} />
          </Form.Item>
          <Form.Item label="Sorumlu" htmlFor={id('sorumlu')}>
            <Input id={id('sorumlu')} prefix={<User size={16} />} value={draft.owner} onChange={(e) => setDraft({ ...draft, owner: e.target.value })} />
          </Form.Item>
          <Form.Item label="Son tarih" htmlFor={id('tarih')} extra="Sorumlu ve tarih dolu ise iş “Açık” olur. Biri eksikse “Taslak” kalır.">
            <DatePicker id={id('tarih')} value={draft.due ? dayjs(draft.due) : null} onChange={(d) => setDraft({ ...draft, due: d ? d.format('YYYY-MM-DD') : undefined })} format="DD.MM.YYYY" />
          </Form.Item>
          <Form.Item label="Kabul ölçütü" htmlFor={id('kabul')} extra="Ne olunca bu iş bitmiş sayılır?">
            <Input id={id('kabul')} value={draft.acceptance} onChange={(e) => setDraft({ ...draft, acceptance: e.target.value })} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}
