import { Button, Grid, Table } from 'antd'
import { Plus, Trash, ArrowUp, ArrowDown } from '@phosphor-icons/react'
import type { Field } from '@/data/schema'
import type { PlanDoc } from '@/data/types'
import { FieldControl } from './FieldControl'
import { uid } from '@/engine/format'

export type Row = Record<string, unknown> & { _id: string }

const WIDE_TYPES = new Set(['text', 'textarea', 'select'])

/**
 * Satır ekleyip silinen tablo. Geniş ekranda tablo, hücre girişleri kenarlıksız.
 * Dar ekranda her satır bir `.surface-card` olur. Satır kimliği korunur.
 */
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
    <div className="repeater-actions">
      <Button type="text" size="small" aria-label={`${i + 1}. satırı yukarı taşı`} icon={<ArrowUp size={16} />} onClick={() => move(i, -1)} disabled={i === 0} />
      <Button type="text" size="small" aria-label={`${i + 1}. satırı aşağı taşı`} icon={<ArrowDown size={16} />} onClick={() => move(i, 1)} disabled={i === rows.length - 1} />
      <Button type="text" size="small" aria-label={`${i + 1}. satırı sil`} icon={<Trash size={16} />} onClick={() => remove(i)} disabled={Boolean(r._fixed) || rows.length <= minRows} />
    </div>
  )

  if (wide) {
    return (
      <div className="repeater">
        <Table<Row>
          className="repeater-table"
          size="middle"
          pagination={false}
          rowKey="_id"
          dataSource={rows}
          scroll={{ x: 'max-content' }}
          columns={[
            ...columns.map((c, ci) => ({
              title: c.label,
              dataIndex: c.key,
              width: ci === 0 ? 240 : WIDE_TYPES.has(c.type) ? 220 : c.type === 'toggle' ? 200 : 160,
              render: (_: unknown, r: Row, i: number) => (
                <FieldControl field={c} value={r[c.key]} onChange={(v) => setRow(i, { [c.key]: v })} plan={plan} values={r} compact idPrefix={`${idPrefix}-${r._id}`} />
              ),
            })),
            { title: <span className="sr-only">İşlemler</span>, key: '_a', width: 112, render: (_: unknown, r: Row, i: number) => actions(i, r) },
          ]}
        />
        {canAdd ? <Button icon={<Plus size={16} />} onClick={add}>{addLabel}</Button> : null}
      </div>
    )
  }
  return (
    <div className="repeater">
      <div className="repeater-cards" style={{ width: '100%' }}>
        {rows.map((r, i) => (
          <div key={r._id} className="surface-card">
            <div className="surface-card-head">
              <h3>{i + 1}. kayıt</h3>
              {actions(i, r)}
            </div>
            {columns.map((c) => (
              <FieldControl key={c.key} field={c} value={r[c.key]} onChange={(v) => setRow(i, { [c.key]: v })} plan={plan} values={r} idPrefix={`${idPrefix}-${r._id}`} />
            ))}
          </div>
        ))}
      </div>
      {canAdd ? <Button icon={<Plus size={16} />} onClick={add} block>{addLabel}</Button> : null}
    </div>
  )
}
