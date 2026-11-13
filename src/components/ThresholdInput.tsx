import { Input, InputNumber, Tag, theme } from 'antd'

export interface ThresholdValue {
  value: number | null
  basis: string
  isGuess: boolean
}

/** Eşik, birim ve dayanak birlikte. Dayanak boşsa "ilk tahmin" işareti kendiliğinden gelir. */
export function ThresholdInput({ value, onChange, unit, idPrefix }: { value?: ThresholdValue; onChange: (v: ThresholdValue) => void; unit?: string; idPrefix: string }) {
  const { token } = theme.useToken()
  const v: ThresholdValue = value ?? { value: null, basis: '', isGuess: true }
  const set = (patch: Partial<ThresholdValue>) => {
    const next = { ...v, ...patch }
    next.isGuess = !next.basis?.trim()
    onChange(next)
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <InputNumber id={`${idPrefix}-deger`} aria-label="Eşik değeri" style={{ width: 160 }} value={v.value ?? undefined} onChange={(n) => set({ value: n ?? null })} addonAfter={unit || undefined} />
        {v.isGuess ? <Tag color="warning" style={{ fontSize: 14, margin: 0 }}>İlk tahmin</Tag> : <Tag color="success" style={{ fontSize: 14, margin: 0 }}>Dayanağı var</Tag>}
      </div>
      <Input id={`${idPrefix}-dayanak`} aria-label="Eşiğin dayanağı" value={v.basis} onChange={(e) => set({ basis: e.target.value })} placeholder="Bu sayı nereden geliyor? Örneğin makine gideri bölü sipariş katkısı." />
      <span style={{ fontSize: 14, color: token.colorTextSecondary }}>Dayanak yazılmazsa eşik "ilk tahmin" sayılır. İlk tahmin ağır harcamaya tek başına yetki vermez.</span>
    </div>
  )
}
