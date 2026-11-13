import { Button, Card, Grid, Space, Table, theme } from 'antd'
import { Plus, Trash, ArrowUp, ArrowDown } from '@phosphor-icons/react'
import type { Field } from '@/data/schema'
import type { PlanDoc } from '@/data/types'
import { FieldControl } from './FieldControl'
import { uid } from '@/engine/format'

export type Row = Record<string, unknown> & { _id: string }

/** Satır ekleyip silinen tablo. Telefonda satırlar kart olur. Satır kimliği korunur. */
export function RepeaterTable({ columns, value, onChange, addLabel = 'Satır ekle', minRows = 0, maxRows, fixedFirstRow, plan, idPrefix }: {
  columns: Field[]
  value?: Row[]
  onChange: (rows: Row[]) => void
  addLabel?: string
  minRows?: number
  maxRows?: number
  fixedFirstRow?: Record<string, unknown>
  plan: PlanDoc
  idPrefix: string
}) {
  const { token } = theme.useToken()
  const bp = Grid.useBreakpoint()
  const wide = bp.md
  let rows: Row[] = value ?? []
  if (fixedFirstRow && rows.length === 0) rows = [{ _id: 'sabit', ...fixedFirstRow, _fixed: true }]
  const setRow = (i: number, patch: Record<string, unknown>) => {
    const next = rows.map((r, j) => (j === i ? { ...r, ...patch } : r))
    onChange(next)
  }
  const add = () => onChange([...rows, { _id: uid('satir') }])
  const remove = (i: number) => onChange(rows.filter((_, j) => j !== i))
  const move = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= rows.length) return
    const next = [...rows]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  const canAdd = !maxRows || rows.length < maxRows
  const actions = (i: number, r: Row) => (
    <Space size={4} wrap>
      <Button type="text" size="small" aria-label="Yukarı taşı" icon={<ArrowUp size={18} />} onClick={() => move(i, -1)} disabled={i === 0} />
      <Button type="text" size="small" aria-label="Aşağı taşı" icon={<ArrowDown size={18} />} onClick={() => move(i, 1)} disabled={i === rows.length - 1} />
      <Button type="text" size="small" danger aria-label="Satırı sil" icon={<Trash size={18} />} onClick={() => remove(i)} disabled={Boolean(r._fixed) || rows.length <= minRows} />
    </Space>
  )

  if (wide) {
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        <Table<Row>
          size="middle"
          pagination={false}
          rowKey="_id"
          dataSource={rows}
          scroll={{ x: 'max-content' }}
          columns={[
            ...columns.map((c) => ({
              title: c.label,
              dataIndex: c.key,
              render: (_: unknown, r: Row, i: number) => (
                <FieldControl field={{ ...c, label: '' }} value={r[c.key]} onChange={(v) => setRow(i, { [c.key]: v })} plan={plan} values={r} compact idPrefix={`${idPrefix}-${r._id}`} />
              ),
            })),
            { title: '', key: '_a', width: 140, render: (_: unknown, r: Row, i: number) => actions(i, r) },
          ]}
        />
        {canAdd ? <Button icon={<Plus size={18} />} onClick={add}>{addLabel}</Button> : null}
      </div>
    )
  }
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {rows.map((r, i) => (
        <Card key={r._id} size="small" style={{ background: token.colorFillAlter }} styles={{ body: { display: 'grid', gap: 12 } }} title={`${i + 1}. kayıt`} extra={actions(i, r)}>
          {columns.map((c) => (
            <FieldControl key={c.key} field={c} value={r[c.key]} onChange={(v) => setRow(i, { [c.key]: v })} plan={plan} values={r} idPrefix={`${idPrefix}-${r._id}`} />
          ))}
        </Card>
      ))}
      {canAdd ? <Button icon={<Plus size={18} />} onClick={add} block>{addLabel}</Button> : null}
    </div>
  )
}
