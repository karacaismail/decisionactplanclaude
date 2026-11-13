import { Button, InputNumber, Table, Tag, theme } from 'antd'
import { Lock, LockOpen } from '@phosphor-icons/react'

export interface ScoreMatrixValue {
  weights: Record<string, number>
  locked: boolean
  scores: Record<string, Record<string, number>>
}

/** Ağırlıklı puanlama. Ağırlıklar kilitlenmeden puan girilmez. Sonuç görülmeden ağırlık yazılır. */
export function ScoreMatrix({ rows, criteria, value, onChange }: {
  rows: { id: string; label: string }[]
  criteria: { key: string; label: string }[]
  value?: ScoreMatrixValue
  onChange: (v: ScoreMatrixValue) => void
}) {
  const { token } = theme.useToken()
  const v: ScoreMatrixValue = value ?? { weights: Object.fromEntries(criteria.map((c) => [c.key, 1])), locked: false, scores: {} }
  const setWeight = (k: string, n: number | null) => onChange({ ...v, weights: { ...v.weights, [k]: n ?? 1 } })
  const setScore = (r: string, k: string, n: number | null) => onChange({ ...v, scores: { ...v.scores, [r]: { ...(v.scores[r] ?? {}), [k]: n ?? 0 } } })
  const total = (r: string) => criteria.reduce((s, c) => s + (v.scores[r]?.[c.key] ?? 0) * (v.weights[c.key] ?? 1), 0)
  const best = Math.max(0, ...rows.map((r) => total(r.id)))
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button icon={v.locked ? <Lock size={18} /> : <LockOpen size={18} />} onClick={() => onChange({ ...v, locked: !v.locked })}>
          {v.locked ? 'Ağırlıklar kilitli' : 'Ağırlıkları kilitle'}
        </Button>
        <span style={{ fontSize: 14, color: token.colorTextSecondary }}>Önce her ölçüte ağırlık verin. Kilitleyin. Sonra puan girin.</span>
      </div>
      <Table
        size="small"
        pagination={false}
        rowKey="id"
        scroll={{ x: 'max-content' }}
        dataSource={rows}
        columns={[
          { title: 'Seçenek', dataIndex: 'label', fixed: 'left' as const, width: 180 },
          ...criteria.map((c) => ({
            title: (
              <span style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
                {c.label}
                <InputNumber size="small" min={1} max={5} aria-label={`${c.label} ağırlığı`} value={v.weights[c.key] ?? 1} disabled={v.locked} onChange={(n) => setWeight(c.key, n)} />
              </span>
            ),
            key: c.key,
            render: (_: unknown, r: { id: string }) => (
              <InputNumber size="small" min={1} max={5} aria-label={`${r.id} ${c.label} puanı`} value={v.scores[r.id]?.[c.key]} disabled={!v.locked} onChange={(n) => setScore(r.id, c.key, n)} />
            ),
          })),
          {
            title: 'Toplam',
            key: 'toplam',
            render: (_: unknown, r: { id: string }) => {
              const t = total(r.id)
              return <Tag color={t === best && t > 0 ? 'success' : 'default'} className="tabular" style={{ fontSize: 14 }}>{t}</Tag>
            },
          },
        ]}
      />
    </div>
  )
}
