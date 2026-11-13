import { Grid, InputNumber, Switch, Table } from 'antd'

export interface ScoreMatrixValue {
  weights: Record<string, number>
  locked: boolean
  scores: Record<string, Record<string, number>>
}

type MatrixRow = { id: string; label: string; isWeight?: boolean }

const WEIGHT_ROW_ID = '__agirlik'

/**
 * Ağırlıklı puanlama. Ağırlıklar ilk satırda yazılır ve kilitlenir. Kilit kapanmadan puan girilmez.
 * Tablo kendi kabında yatay kayar. Geniş ekranda ilk sütun sola sabittir.
 * Hücre girişleri `.cell-input` ile alt çizgilidir. Boş hücrede "1-5" yer tutucusu yazar.
 */
export function ScoreMatrix({ rows, criteria, value, onChange }: {
  rows: { id: string; label: string }[]
  criteria: { key: string; label: string }[]
  value?: ScoreMatrixValue
  onChange: (v: ScoreMatrixValue) => void
}) {
  const bp = Grid.useBreakpoint()
  const v: ScoreMatrixValue = value ?? { weights: Object.fromEntries(criteria.map((c) => [c.key, 1])), locked: false, scores: {} }
  const setWeight = (k: string, n: number | null) => onChange({ ...v, weights: { ...v.weights, [k]: n ?? 1 } })
  const setScore = (r: string, k: string, n: number | null) => onChange({ ...v, scores: { ...v.scores, [r]: { ...(v.scores[r] ?? {}), [k]: n ?? 0 } } })
  const total = (r: string) => criteria.reduce((s, c) => s + (v.scores[r]?.[c.key] ?? 0) * (v.weights[c.key] ?? 1), 0)
  const best = Math.max(0, ...rows.map((r) => total(r.id)))
  const data: MatrixRow[] = [{ id: WEIGHT_ROW_ID, label: 'Ağırlık (1 ile 5)', isWeight: true }, ...rows]
  const lockId = 'agirlik-kilidi'
  return (
    <div className="score-matrix">
      <div className="toggle-row">
        <Switch id={lockId} checked={v.locked} onChange={(locked) => onChange({ ...v, locked })} />
        <label htmlFor={lockId}>{v.locked ? 'Ağırlıklar kilitli. Puan girebilirsiniz.' : 'Önce ağırlık verin. Sonra kilitleyin. Kilit kapanınca puan girilir.'}</label>
      </div>
      <Table<MatrixRow>
        size="middle"
        pagination={false}
        rowKey="id"
        scroll={{ x: 'max-content' }}
        dataSource={data}
        rowClassName={(r) => (r.isWeight ? 'weight-row' : '')}
        columns={[
          { title: 'Seçenek', dataIndex: 'label', width: 220, fixed: bp.md ? ('left' as const) : undefined, render: (t: string, r) => (r.isWeight ? t : <span className="option-label">{t}</span>) },
          ...criteria.map((c) => ({
            title: c.label,
            key: c.key,
            width: 140,
            render: (_: unknown, r: MatrixRow) =>
              r.isWeight ? (
                <InputNumber className="cell-input" variant="borderless" min={1} max={5} aria-label={`${c.label} ağırlığı`} placeholder="1-5" value={v.weights[c.key] ?? 1} disabled={v.locked} onChange={(n) => setWeight(c.key, n)} />
              ) : (
                <InputNumber className="cell-input" variant="borderless" min={1} max={5} aria-label={`${r.label}, ${c.label} puanı`} placeholder="1-5" value={v.scores[r.id]?.[c.key]} disabled={!v.locked} onChange={(n) => setScore(r.id, c.key, n)} />
              ),
          })),
          {
            title: 'Toplam',
            key: 'toplam',
            width: 120,
            render: (_: unknown, r: MatrixRow) => {
              if (r.isWeight) return null
              const t = total(r.id)
              return <span className={`tag tabular total-cell${t === best && t > 0 ? ' is-ok' : ''}`}>{t}</span>
            },
          },
        ]}
      />
    </div>
  )
}
