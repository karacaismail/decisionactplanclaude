import { Divider, Form, Input, InputNumber, Radio } from 'antd'
import { Info } from '@phosphor-icons/react'
import type { Measure } from '@/data/types'
import { ThresholdInput } from './ThresholdInput'

const EMPTY: Measure = { name: '', unit: '', status: 'bilinmiyor' }

/**
 * Ölçü adı, birim, dönem, durum, değerler, eşik ve dayanak birlikte. "Bilinmiyor" sıfır değildir.
 * Alanlar `Form.Item` düzenindedir ve yan yana ızgarada durur. Kutu yok; ayrımı `Divider` verir.
 */
export function MeasureInput({ value, onChange, defaultName, defaultUnit, idPrefix }: { value?: Measure; onChange: (m: Measure) => void; defaultName?: string; defaultUnit?: string; idPrefix: string }) {
  const m: Measure = { ...EMPTY, name: defaultName ?? '', unit: defaultUnit ?? '', ...(value ?? {}) }
  const set = (patch: Partial<Measure>) => onChange({ ...m, ...patch })
  const item = (key: string, label: string, control: React.ReactNode, extra?: string) => (
    <Form.Item layout="vertical" className="step-field" label={label} htmlFor={`${idPrefix}-${key}`} extra={extra}>
      {control}
    </Form.Item>
  )
  const statusId = `${idPrefix}-durum-etiket`
  return (
    <div className="measure">
      <div className="field-group">
        {item('ad', 'Ölçünün adı', <Input id={`${idPrefix}-ad`} inputMode="text" enterKeyHint="next" autoComplete="off" value={m.name} onChange={(e) => set({ name: e.target.value })} placeholder="Örneğin haftalık kayıp" />)}
        {item('birim', 'Birim', <Input id={`${idPrefix}-birim`} inputMode="text" enterKeyHint="next" autoComplete="off" value={m.unit} onChange={(e) => set({ unit: e.target.value })} placeholder="dakika, TL, adet" />)}
        {item('donem', 'Dönem', <Input id={`${idPrefix}-donem`} inputMode="text" enterKeyHint="next" autoComplete="off" value={m.period ?? ''} onChange={(e) => set({ period: e.target.value })} placeholder="hafta, ay" />)}
      </div>
      <Form.Item
        layout="vertical"
        className="step-field"
        label={<span id={statusId}>Ölçüm durumu</span>}
        tooltip={{ title: '"Bilinmiyor" sıfır değildir. Ölçmediyseniz "Bilinmiyor" seçin.', icon: <Info size={16} aria-label="Yardım" /> }}
      >
        <Radio.Group
          aria-labelledby={statusId}
          className="choice-buttons"
          value={m.status}
          onChange={(e) => set({ status: e.target.value })}
          optionType="button"
          options={[
            { value: 'olculdu', label: 'Ölçüldü' },
            { value: 'bilinmiyor', label: 'Bilinmiyor' },
            { value: 'uygulanmiyor', label: 'Uygulanmıyor' },
          ]}
        />
      </Form.Item>
      {m.status === 'olculdu' ? (
        <div className="field-group">
          {item('baslangic', 'Başlangıç değeri', <InputNumber id={`${idPrefix}-baslangic`} inputMode="decimal" enterKeyHint="next" autoComplete="off" decimalSeparator="," value={m.baseline ?? undefined} onChange={(v) => set({ baseline: v ?? null })} suffix={m.unit ? <span className="unit-suffix">{m.unit}</span> : undefined} placeholder="Sayı" />)}
          {item('deger', 'Ölçülen değer', <InputNumber id={`${idPrefix}-deger`} inputMode="decimal" enterKeyHint="next" autoComplete="off" decimalSeparator="," value={m.value ?? undefined} onChange={(v) => set({ value: v ?? null })} suffix={m.unit ? <span className="unit-suffix">{m.unit}</span> : undefined} placeholder="Sayı" />)}
          {item('pay', 'Pay', <InputNumber id={`${idPrefix}-pay`} inputMode="decimal" enterKeyHint="next" autoComplete="off" decimalSeparator="," value={m.numerator ?? undefined} onChange={(v) => set({ numerator: v ?? null })} placeholder="Sayı" />, 'Oran ölçüyorsanız doldurun.')}
          {item('payda', 'Payda', <InputNumber id={`${idPrefix}-payda`} inputMode="decimal" enterKeyHint="next" autoComplete="off" decimalSeparator="," value={m.denominator ?? undefined} onChange={(v) => set({ denominator: v ?? null })} placeholder="Sayı" />, 'Oran ölçüyorsanız doldurun.')}
        </div>
      ) : null}
      {m.status === 'uygulanmiyor' ? item('neden', 'Neden uygulanmıyor?', <Input id={`${idPrefix}-neden`} inputMode="text" enterKeyHint="next" autoComplete="off" value={m.naReason ?? ''} onChange={(e) => set({ naReason: e.target.value })} placeholder="Kısa neden" />) : null}
      <Divider className="measure-divider" titlePlacement="start" styles={{ content: { margin: 0 } }} plain>Eşik ve dayanağı</Divider>
      <ThresholdInput
        idPrefix={`${idPrefix}-esik`}
        unit={m.unit}
        value={{ value: m.threshold ?? null, basis: m.basis ?? '', isGuess: m.isGuess ?? !m.basis }}
        onChange={(t) => set({ threshold: t.value, basis: t.basis, isGuess: t.isGuess })}
      />
    </div>
  )
}
