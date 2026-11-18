import '@/styles/desen/step-field.css'
import '@/styles/bilesen/ThresholdInput.css'
import { Form, Input, InputNumber, Tag } from 'antd'
import { Info } from '@phosphor-icons/react'

export interface ThresholdValue {
  value: number | null
  basis: string
  isGuess: boolean
}

/**
 * Eşik, birim ve dayanak birlikte. Dayanak boşsa "İlk tahmin" etiketi kendiliğinden gelir.
 * İki `Form.Item` yan yana durur; dar ekranda alt alta iner.
 */
export function ThresholdInput({ value, onChange, unit, idPrefix }: { value?: ThresholdValue; onChange: (v: ThresholdValue) => void; unit?: string; idPrefix: string }) {
  const v: ThresholdValue = value ?? { value: null, basis: '', isGuess: true }
  const set = (patch: Partial<ThresholdValue>) => {
    const next = { ...v, ...patch }
    next.isGuess = !next.basis?.trim()
    onChange(next)
  }
  return (
    <div className="threshold-grid">
      <Form.Item
        layout="vertical"
        className="step-field threshold-value"
        label="Eşik değeri"
        htmlFor={`${idPrefix}-deger`}
        tooltip={{ title: 'Eşik, "bu sayının altı yetmez" dediğiniz sınırdır.', icon: <Info size={16} aria-label="Yardım" /> }}
      >
        <div className="threshold-row">
          <InputNumber id={`${idPrefix}-deger`} inputMode="decimal" enterKeyHint="next" autoComplete="off" decimalSeparator="," value={v.value ?? undefined} onChange={(n) => set({ value: n ?? null })} suffix={unit ? <span className="unit-suffix">{unit}</span> : undefined} placeholder="Sayı" />
          <Tag className="threshold-tag" color={v.isGuess ? 'warning' : 'success'}>{v.isGuess ? 'İlk tahmin' : 'Dayanağı var'}</Tag>
        </div>
      </Form.Item>
      <Form.Item
        layout="vertical"
        className="step-field threshold-basis"
        label="Eşiğin dayanağı"
        htmlFor={`${idPrefix}-dayanak`}
        extra='Dayanak yazılmazsa eşik "ilk tahmin" sayılır. İlk tahmin ağır harcamaya tek başına yetki vermez.'
      >
        <Input id={`${idPrefix}-dayanak`} inputMode="text" enterKeyHint="next" autoComplete="off" value={v.basis} onChange={(e) => set({ basis: e.target.value })} placeholder="Bu sayı nereden geliyor? Örneğin makine gideri bölü sipariş katkısı." />
      </Form.Item>
    </div>
  )
}
