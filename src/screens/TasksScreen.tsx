import '@/styles/desen/pano.css'
import '@/styles/desen/pano-ortak.css'
import '@/styles/desen/k-card.css'
import '@/styles/desen/kapi-ortak.css'
import '@/styles/desen/stat-card.css'
import '@/styles/desen/k-drawer.css'
import '@/styles/desen/k-form.css'
import '@/styles/desen/kapi.css'
import '@/styles/desen/task-card.css'
import '@/styles/ekran/TasksScreen.css'
import { useId, useRef, useState } from 'react'
import { Avatar, Badge, Button, Card, DatePicker, Drawer, Empty, Form, Input, Pagination, Select, Statistic, Tabs, Tag, App as AntApp } from 'antd'
import type { RefSelectProps } from 'antd'
import dayjs from 'dayjs'
import { Plus, Check, CalendarBlank, User, Kanban, ListBullets } from '@phosphor-icons/react'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import type { Task, TaskStatus } from '@/data/types'
import { formatDate } from '@/engine/format'
import { PageHeader } from '@/components/PageHeader'
const STATUS: { value: TaskStatus; label: string; cls: string }[] = [
  { value: 'taslak', label: 'Taslak', cls: '' },
  { value: 'acik', label: 'Açık', cls: 'is-open' },
  { value: 'bitti', label: 'Bitti', cls: 'is-ok' },
  { value: 'iptal', label: 'İptal', cls: 'is-muted' },
]
const STATUS_OPTIONS = STATUS.map((s) => ({ value: s.value, label: s.label }))
const PAGE_SIZE = 10
type DateOrder = 'none' | 'asc' | 'desc'
const DATE_ORDER_OPTIONS: { value: DateOrder; label: string }[] = [
  { value: 'none', label: 'Kayıt sırası' },
  { value: 'asc', label: 'Son tarih: eskiden yeniye' },
  { value: 'desc', label: 'Son tarih: yeniden eskiye' },
]
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
  const { message } = AntApp.useApp()
  const plan = useCurrentPlan()
  const addTask = usePlanStore((s) => s.addTask)
  const updateTask = usePlanStore((s) => s.updateTask)
  const [open, setOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([])
  const [dateOrder, setDateOrder] = useState<DateOrder>('none')
  const [page, setPage] = useState(1)
  const statusFilterRef = useRef<RefSelectProps>(null)
  const [draft, setDraft] = useState<{ action: string; owner: string; due?: string; acceptance: string }>({ action: '', owner: '', acceptance: '' })
  if (!plan) return null
  const tasks = plan.tasks
  const openTasks = tasks.filter((t) => t.status === 'acik')
  const draftTasks = tasks.filter((t) => t.status === 'taslak')
  const doneTasks = tasks.filter((t) => t.status === 'bitti')
  const overdue = tasks.filter(isOverdue).length
  const filteredTasks = tasks.filter((task) => statusFilter.length === 0 || statusFilter.includes(task.status))
  if (dateOrder !== 'none') {
    filteredTasks.sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? '') * (dateOrder === 'asc' ? 1 : -1))
  }
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE)))
  const pageTasks = filteredTasks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const add = () => {
    if (!draft.action.trim()) return
    const status: TaskStatus = draft.owner.trim() && draft.due ? 'acik' : 'taslak'
    addTask({ action: draft.action.trim(), owner: draft.owner.trim() || undefined, dueDate: draft.due, acceptance: draft.acceptance.trim() || undefined, status })
    message.success(status === 'acik' ? 'İş "Açık" olarak eklendi.' : 'İş "Taslak" olarak eklendi. Sorumlu ve tarih dolunca açılır.')
    setDraft({ action: '', owner: '', acceptance: '' })
    setOpen(false)
  }
  const sourceLabel = (sid?: string) => {
    if (!sid) return 'Elle eklendi'
    const g = plan.decisions.find((d) => d.id === sid)?.gate
    return g ? `Kapı ${g}` : 'Kaynak karar bulunamadı.'
  }
  /** Pano ve her genişlikte kullanılan liste aynı görev kaydını günceller. */
  const statusSelect = (t: Task, inList = false) => (
    <Select
      className="task-status-select"
      variant="borderless"
      value={t.status}
      onChange={(value: TaskStatus) => {
        updateTask(t.id, { status: value })
        if (inList && statusFilter.length > 0 && !statusFilter.includes(value)) {
          statusFilterRef.current?.focus()
        }
      }}
      options={STATUS_OPTIONS}
      labelRender={(p) => <StatusTag status={p.value as TaskStatus} />}
      aria-label={`Durum: ${t.action}`}
    />
  )
  const dueTag = (t: Task) => {
    if (!t.dueDate) return <Tag>Tarih yok</Tag>
    const late = isOverdue(t)
    return (
      <Tag color={late ? 'error' : undefined} icon={<CalendarBlank size={14} aria-hidden />}>
        <time className="tabular" dateTime={t.dueDate}>{formatDate(t.dueDate)}</time>{late ? ' gecikti' : ''}
      </Tag>
    )
  }

  const board = (
    <div className="kanban" role="group" aria-label="İş panosu">
      {COLUMNS.map((col) => {
        const items = tasks.filter((t) => col.statuses.includes(t.status))
        return (
          <section key={col.key} className="kanban-col" aria-labelledby={id(`pano-${col.key}`)}>
            <div className="kanban-head">
              <h3 id={id(`pano-${col.key}`)}>{col.title}</h3>
              <span className="kanban-count">{items.length} iş</span>
            </div>
            {items.length === 0 ? <span className="kanban-empty">Bu sütunda iş yok.</span> : null}
            {items.map((t) => (
              <Card key={t.id} className="task-card" variant="borderless" size="small">
                <p className="task-title">{t.action}</p>
                <div className="task-meta">
                  <span className="task-owner">
                    <Avatar size="small" aria-hidden>{initial(t.owner)}</Avatar>
                    <span>{t.owner ?? 'Sorumlu eksik'}</span>
                  </span>
                  {dueTag(t)}
                </div>
                <div className="task-foot">
                  {statusSelect(t)}
                  <span className="task-source">{sourceLabel(t.sourceDecisionId)}</span>
                </div>
              </Card>
            ))}
          </section>
        )
      })}
    </div>
  )

  const list = (
    <div className="tasks-list">
      <div className="tasks-list-toolbar">
        <div className="task-list-control">
          <label htmlFor={id('durum-filtre')}>İş durumu</label>
          <Select<TaskStatus[]>
            ref={statusFilterRef}
            id={id('durum-filtre')}
            className="tasks-filter"
            aria-label="İş durumunu filtrele"
            mode="multiple"
            placeholder="Tüm durumlar"
            value={statusFilter}
            options={STATUS_OPTIONS}
            onChange={(value) => { setStatusFilter(value); setPage(1) }}
          />
        </div>
        <div className="task-list-control">
          <label htmlFor={id('sirala')}>Sıralama</label>
          <Select<DateOrder>
            id={id('sirala')}
            className="tasks-sort"
            aria-label="İşleri sırala"
            value={dateOrder}
            options={DATE_ORDER_OPTIONS}
            onChange={(value) => { setDateOrder(value); setPage(1) }}
          />
        </div>
        {statusFilter.length > 0 ? (
          <Button onClick={() => { setStatusFilter([]); setPage(1) }}>Filtreyi temizle</Button>
        ) : null}
      </div>
      <p className="helper" role="status">{filteredTasks.length} iş listeleniyor.</p>
      <ul className="tasks-mobile-list" aria-label="İş kayıtları">
        {pageTasks.map((task) => (
          <li key={task.id} className="task-list-item">
            <article className="task-list-card" aria-labelledby={id(`task-${task.id}`)}>
              <h3 className="task-list-title" id={id(`task-${task.id}`)}>{task.action}</h3>
              <dl className="task-list-metadata">
                <div><dt>Sorumlu</dt><dd>{task.owner || 'Sorumlu eksik'}</dd></div>
                <div><dt>Son tarih</dt><dd>{dueTag(task)}</dd></div>
                <div className="task-list-status"><dt>Durum</dt><dd>{statusSelect(task, true)}</dd></div>
                <div><dt>Kaynak karar</dt><dd>{sourceLabel(task.sourceDecisionId)}</dd></div>
                {task.sourceStep ? <div><dt>Kaynak adım</dt><dd>Adım {task.sourceStep}</dd></div> : null}
                <div><dt>Kabul ölçütü</dt><dd>{task.acceptance || 'Kabul ölçütü yazılmadı.'}</dd></div>
                {task.dependsOn?.length ? (
                  <div><dt>Bağlı işler</dt><dd><ul>
                    {task.dependsOn.map((taskId) => <li key={taskId}>{tasks.find((item) => item.id === taskId)?.action || `İş bulunamadı: ${taskId}`}</li>)}
                  </ul></dd></div>
                ) : null}
                {task.reopenEvent ? <div><dt>Yeniden açma koşulu</dt><dd>{task.reopenEvent}</dd></div> : null}
                <div><dt>Oluşturulma tarihi</dt><dd><time dateTime={task.createdAt}>{formatDate(task.createdAt)}</time></dd></div>
                <div><dt>Son değişiklik</dt><dd><time dateTime={task.updatedAt}>{formatDate(task.updatedAt)}</time></dd></div>
              </dl>
            </article>
          </li>
        ))}
      </ul>
      {filteredTasks.length === 0 ? <p className="tasks-mobile-empty">Bu durumda iş yok.</p> : null}
      <Pagination
        className="tasks-list-pagination"
        current={currentPage}
        total={filteredTasks.length}
        pageSize={PAGE_SIZE}
        hideOnSinglePage
        showSizeChanger={false}
        onChange={setPage}
      />
    </div>
  )

  return (
    <div className="page mobil-tasks">
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
          <Empty description={'Henüz iş yok. Kapı kararları iş doğurur. İlk işi "İş ekle" düğmesiyle de ekleyebilirsiniz.'} />
        </Card>
      ) : (
        <Tabs
          className="k-tabs"
          defaultActiveKey="pano"
          destroyOnHidden
          items={[
            { key: 'pano', label: 'Pano', icon: <Kanban size={16} aria-hidden />, children: board },
            { key: 'liste', label: 'Liste', icon: <ListBullets size={16} aria-hidden />, children: list },
          ]}
        />
      )}

      <Drawer
        rootClassName="k-drawer mobil-tasks-drawer"
        open={open}
        onClose={() => setOpen(false)}
        title="Yeni iş"
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
