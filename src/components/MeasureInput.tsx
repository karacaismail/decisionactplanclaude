import { Input, InputNumber, Radio } from 'antd'
import type { Measure } from '@/data/types'
import { ThresholdInput } from './ThresholdInput'

const EMPTY: Measure = { name: '', unit: '', status: 'bilinmiyor' }

/** Ölçü adı, birim, dönem, başlangıç, eşik ve dayanak birlikte. "Bilinmiyor" sıfır değildir. Düz alan grubu, kutu yok. */
export function MeasureInput({ value, onChange, defaultName, defaultUnit, idPrefix }: { value?: Measure; onChange: (m: Measure) => void; defaultName?: string; defaultUnit?: string; idPrefix: string }) {
  const m: Measure = { ...EMPTY, name: defaultName ?? '', unit: defaultUnit ?? '', ...(value ?? {}) }
  const set = (patch: Partial<Measure>) => onChange({ ...m, ...patch })
  const field = (key: string, label: string, control: React.ReactNode) => (
    <div className="field">
      <label htmlFor={`${idPrefix}-${key}`} className="field-label">{label}</label>
      {control}
    </div>
  )
  const statusId = `${idPrefix}-durum-etiket`
  return (
    <div className="field-stack">
      <div className="field-group">
        {field('ad', 'Ölçünün adı', <Input id={`${idPrefix}-ad`} value={m.name} onChange={(e) => set({ name: e.target.value })} placeholder="Örneğin haftalık kayıp" />)}
        {field('birim', 'Birim', <Input id={`${idPrefix}-birim`} value={m.unit} onChange={(e) => set({ unit: e.target.value })} placeholder="dakika, TL, adet" />)}
        {field('donem', 'Dönem', <Input id={`${idPrefix}-donem`} value={m.period ?? ''} onChange={(e) => set({ period: e.target.value })} placeholder="hafta, ay" />)}
      </div>
      <div className="field">
        <span id={statusId} className="field-label">Ölçüm durumu</span>
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
      </div>
      {m.status === 'olculdu' ? (
        <div className="field-group">
          {field('baslangic', 'Başlangıç değeri', <InputNumber id={`${idPrefix}-baslangic`} value={m.baseline ?? undefined} onChange={(v) => set({ baseline: v ?? null })} />)}
          {field('deger', 'Ölçülen değer', <InputNumber id={`${idPrefix}-deger`} value={m.value ?? undefined} onChange={(v) => set({ value: v ?? null })} />)}
          {field('pay', 'Pay (oran ise)', <InputNumber id={`${idPrefix}-pay`} value={m.numerator ?? undefined} onChange={(v) => set({ numerator: v ?? null })} />)}
          {field('payda', 'Payda (oran ise)', <InputNumber id={`${idPrefix}-payda`} value={m.denominator ?? undefined} onChange={(v) => set({ denominator: v ?? null })} />)}
        </div>
      ) : null}
      {m.status === 'uygulanmiyor' ? field('neden', 'Neden uygulanmıyor?', <Input id={`${idPrefix}-neden`} value={m.naReason ?? ''} onChange={(e) => set({ naReason: e.target.value })} />) : null}
      <div className="field-stack">
        <h4 className="subhead">Eşik ve dayanağı</h4>
        <ThresholdInput
          idPrefix={`${idPrefix}-esik`}
          unit={m.unit}
          value={{ value: m.threshold ?? null, basis: m.basis ?? '', isGuess: m.isGuess ?? !m.basis }}
          onChange={(t) => set({ threshold: t.value, basis: t.basis, isGuess: t.isGuess })}
        />
      </div>
    </div>
  )
}
