import { useState } from 'react'
import { Button, Card, Input, Select, Space, Table, Tag, Typography, theme, DatePicker } from 'antd'
import dayjs from 'dayjs'
import { Plus } from '@phosphor-icons/react'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import type { Task, TaskStatus } from '@/data/types'
import { formatDate } from '@/engine/format'

const STATUS: { value: TaskStatus; label: string; color?: string }[] = [
  { value: 'taslak', label: 'Taslak' },
  { value: 'acik', label: 'Açık', color: 'processing' },
  { value: 'bitti', label: 'Bitti', color: 'success' },
  { value: 'iptal', label: 'İptal' },
]

export function TasksScreen() {
  const { token } = theme.useToken()
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
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <Typography.Title level={1} style={{ fontSize: 32, marginBottom: 8 }}>İşler</Typography.Title>
        <Typography.Text style={{ color: token.colorTextSecondary }}>Her iş bir karara bağlanır. Sahibi veya tarihi eksik iş taslak kalır. Boş tarihin yerine keyfî süre yazılmaz.</Typography.Text>
      </div>
      <Card title="Yeni iş">
        <Space wrap style={{ width: '100%' }}>
          <Input value={action} onChange={(e) => setAction(e.target.value)} placeholder="Ne yapılacak?" style={{ width: 320 }} aria-label="İş" />
          <Input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Sorumlu" style={{ width: 180 }} aria-label="Sorumlu" />
          <DatePicker value={due ? dayjs(due) : null} onChange={(d) => setDue(d ? d.format('YYYY-MM-DD') : undefined)} format="DD.MM.YYYY" placeholder="Son tarih" aria-label="Son tarih" />
          <Button type="primary" icon={<Plus size={18} />} onClick={add} disabled={!action.trim()}>Ekle</Button>
        </Space>
      </Card>
      <Select value={filter} onChange={setFilter} style={{ width: 200 }} options={[{ value: 'hepsi', label: 'Hepsi' }, ...STATUS]} aria-label="Duruma göre süz" />
      <Card>
        <Table<Task>
          rowKey="id"
          size="middle"
          dataSource={list}
          pagination={{ pageSize: 20, hideOnSinglePage: true }}
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: 'İş yok. Kapı kararları iş doğurur.' }}
          columns={[
            { title: 'İş', dataIndex: 'action' },
            { title: 'Sorumlu', dataIndex: 'owner', render: (o?: string) => o ?? <Tag style={{ fontSize: 14 }}>Eksik</Tag> },
            { title: 'Son tarih', dataIndex: 'dueDate', render: (d?: string) => (d ? formatDate(d, false) : <Tag style={{ fontSize: 14 }}>Tarih belirlenmedi</Tag>) },
            { title: 'Durum', dataIndex: 'status', render: (s: TaskStatus, t) => <Select size="small" value={s} onChange={(v) => updateTask(t.id, { status: v })} options={STATUS} style={{ width: 120 }} aria-label="Durum" /> },
            { title: 'Kaynak karar', dataIndex: 'sourceDecisionId', render: (id?: string) => (id ? `Kapı ${plan.decisions.find((d) => d.id === id)?.gate ?? ''}` : '') },
          ]}
        />
      </Card>
    </div>
  )
}
