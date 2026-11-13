import { Grid, Rate, Switch, Table, Tag } from 'antd'
import { LockSimple, LockSimpleOpen, Star } from '@phosphor-icons/react'

export interface ScoreMatrixValue {
  weights: Record<string, number>
  locked: boolean
  scores: Record<string, Record<string, number>>
}

type MatrixRow = { id: string; label: string; isWeight?: boolean }

const WEIGHT_ROW_ID = '__agirlik'

/**
 * Ağırlıklı puanlama. Ağırlıklar ilk satırda 1 ile 5 yıldızla verilir ve `Switch` ile kilitlenir.
 * Kilit kapanmadan puan girilmez. Puanlar da 1 ile 5 yıldızdır. Toplam sütunu `Tag` taşır; en yüksek toplam yeşildir.
 * Tablo kendi kabında yatay kayar. Geniş ekranda ilk sütun sola sabittir.
 */
export function ScoreMatrix({ rows, criteria, value, onChange }: {
  rows: { id: string; label: string }[]
  criteria: { key: string; label: string }[]
  value?: ScoreMatrixValue
  onChange: (v: ScoreMatrixValue) => void
}) {
  const bp = Grid.useBreakpoint()
  const v: ScoreMatrixValue = value ?? { weights: Object.fromEntries(criteria.map((c) => [c.key, 1])), locked: false, scores: {} }
  const setWeight = (k: string, n: number) => onChange({ ...v, weights: { ...v.weights, [k]: n || 1 } })
  const setScore = (r: string, k: string, n: number) => onChange({ ...v, scores: { ...v.scores, [r]: { ...(v.scores[r] ?? {}), [k]: n || 0 } } })
  const total = (r: string) => criteria.reduce((s, c) => s + (v.scores[r]?.[c.key] ?? 0) * (v.weights[c.key] ?? 1), 0)
  const best = Math.max(0, ...rows.map((r) => total(r.id)))
  const data: MatrixRow[] = [{ id: WEIGHT_ROW_ID, label: 'Ağırlık (1 ile 5)', isWeight: true }, ...rows]
  const lockId = 'agirlik-kilidi'
  const star = <Star size={20} weight="fill" aria-hidden />
  const lock = (
    <div className="toggle-row score-lock">
      <Switch id={lockId} checked={v.locked} onChange={(locked) => onChange({ ...v, locked })} checkedChildren={<LockSimple size={14} aria-hidden />} unCheckedChildren={<LockSimpleOpen size={14} aria-hidden />} />
      <label htmlFor={lockId}>{v.locked ? 'Ağırlıklar kilitli. Şimdi puan verin.' : 'Önce ağırlık verin. Sonra bu anahtarla kilitleyin. Kilit kapanınca puan verilir.'}</label>
    </div>
  )
  const empty = rows.length === 0 ? <p className="helper">Önce yukarıda seçenek yazın. Seçenekler burada satır olur.</p> : null
  const totalTag = (rId: string) => {
    const t = total(rId)
    const isBest = t === best && t > 0
    return <Tag className="total-cell tabular" color={isBest ? 'success' : undefined}>{t}{isBest ? ' en yüksek' : ''}</Tag>
  }

  /* Dar ekran: her seçenek bir blok. Ölçüt satırları alt alta. */
  if (!bp.md) {
    return (
      <div className="score-matrix">
        {lock}
        {empty}
        <div className="score-block is-weight">
          <div className="score-block-head"><strong>Ağırlık (1 ile 5)</strong></div>
          {criteria.map((c) => (
            <div key={c.key} className="score-row">
              <span className="score-row-label">{c.label}</span>
              <Rate count={5} character={star} aria-label={`${c.label} ağırlığı`} value={v.weights[c.key] ?? 1} disabled={v.locked} onChange={(n) => setWeight(c.key, n)} />
            </div>
          ))}
        </div>
        {rows.map((r) => (
          <div key={r.id} className="score-block">
            <div className="score-block-head"><strong>{r.label}</strong>{totalTag(r.id)}</div>
            {criteria.map((c) => (
              <div key={c.key} className="score-row">
                <span className="score-row-label">{c.label}</span>
                <Rate count={5} character={star} aria-label={`${r.label}, ${c.label} puanı`} value={v.scores[r.id]?.[c.key] ?? 0} disabled={!v.locked} onChange={(n) => setScore(r.id, c.key, n)} />
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="score-matrix">
      {lock}
      {empty}
      <Table<MatrixRow>
        size="middle"
        pagination={false}
        rowKey="id"
        scroll={{ x: 'max-content' }}
        dataSource={data}
        rowClassName={(r) => (r.isWeight ? 'weight-row' : '')}
        columns={[
          { title: 'Seçenek', dataIndex: 'label', width: 180, fixed: 'left' as const, render: (t: string, r) => (r.isWeight ? t : <span className="option-label">{t}</span>) },
          ...criteria.map((c) => ({
            title: c.label,
            key: c.key,
            width: 150,
            render: (_: unknown, r: MatrixRow) =>
              r.isWeight ? (
                <Rate count={5} character={star} aria-label={`${c.label} ağırlığı`} value={v.weights[c.key] ?? 1} disabled={v.locked} onChange={(n) => setWeight(c.key, n)} />
              ) : (
                <Rate count={5} character={star} aria-label={`${r.label}, ${c.label} puanı`} value={v.scores[r.id]?.[c.key] ?? 0} disabled={!v.locked} onChange={(n) => setScore(r.id, c.key, n)} />
              ),
          })),
          { title: 'Toplam', key: 'toplam', width: 120, render: (_: unknown, r: MatrixRow) => (r.isWeight ? null : totalTag(r.id)) },
        ]}
      />
    </div>
  )
}
