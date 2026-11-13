import { Input, InputNumber } from 'antd'

export interface ThresholdValue {
  value: number | null
  basis: string
  isGuess: boolean
}

/** Eşik, birim ve dayanak birlikte. Dayanak boşsa "ilk tahmin" işareti kendiliğinden gelir. */
export function ThresholdInput({ value, onChange, unit, idPrefix }: { value?: ThresholdValue; onChange: (v: ThresholdValue) => void; unit?: string; idPrefix: string }) {
  const v: ThresholdValue = value ?? { value: null, basis: '', isGuess: true }
  const set = (patch: Partial<ThresholdValue>) => {
    const next = { ...v, ...patch }
    next.isGuess = !next.basis?.trim()
    onChange(next)
  }
  return (
    <div className="field-stack">
      <div className="field">
        <label htmlFor={`${idPrefix}-deger`} className="field-label">Eşik değeri</label>
        <div className="threshold-row">
          <InputNumber id={`${idPrefix}-deger`} value={v.value ?? undefined} onChange={(n) => set({ value: n ?? null })} addonAfter={unit || undefined} />
          {v.isGuess ? <span className="tag is-hold">İlk tahmin</span> : <span className="tag is-ok">Dayanağı var</span>}
        </div>
      </div>
      <div className="field">
        <label htmlFor={`${idPrefix}-dayanak`} className="field-label">Eşiğin dayanağı</label>
        <Input id={`${idPrefix}-dayanak`} value={v.basis} onChange={(e) => set({ basis: e.target.value })} placeholder="Bu sayı nereden geliyor? Örneğin makine gideri bölü sipariş katkısı." />
        <div className="field-help">Dayanak yazılmazsa eşik "ilk tahmin" sayılır. İlk tahmin ağır harcamaya tek başına yetki vermez.</div>
      </div>
    </div>
  )
}
