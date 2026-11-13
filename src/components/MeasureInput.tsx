import { Input, InputNumber, Radio, Space, theme } from 'antd'
import type { Measure } from '@/data/types'
import { ThresholdInput } from './ThresholdInput'

const EMPTY: Measure = { name: '', unit: '', status: 'bilinmiyor' }

/** Ölçü adı, birim, dönem, başlangıç, eşik ve dayanak birlikte. "Bilinmiyor" sıfır değildir. */
export function MeasureInput({ value, onChange, defaultName, defaultUnit, idPrefix }: { value?: Measure; onChange: (m: Measure) => void; defaultName?: string; defaultUnit?: string; idPrefix: string }) {
  const { token } = theme.useToken()
  const m: Measure = { ...EMPTY, name: defaultName ?? '', unit: defaultUnit ?? '', ...(value ?? {}) }
  const set = (patch: Partial<Measure>) => onChange({ ...m, ...patch })
  const label = (t: string) => <span style={{ fontSize: 14, color: token.colorTextSecondary }}>{t}</span>
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12, background: token.colorFillAlter, borderRadius: token.borderRadiusLG, padding: 12 }}>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        <label htmlFor={`${idPrefix}-ad`} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
          {label('Ölçünün adı')}
          <Input id={`${idPrefix}-ad`} value={m.name} onChange={(e) => set({ name: e.target.value })} placeholder="Örneğin haftalık kayıp" />
        </label>
        <label htmlFor={`${idPrefix}-birim`} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
          {label('Birim')}
          <Input id={`${idPrefix}-birim`} value={m.unit} onChange={(e) => set({ unit: e.target.value })} placeholder="dakika, TL, adet" />
        </label>
        <label htmlFor={`${idPrefix}-donem`} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
          {label('Dönem')}
          <Input id={`${idPrefix}-donem`} value={m.period ?? ''} onChange={(e) => set({ period: e.target.value })} placeholder="hafta, ay" />
        </label>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
        {label('Ölçüm durumu')}
        <Radio.Group
          value={m.status}
          onChange={(e) => set({ status: e.target.value })}
          optionType="button"
          buttonStyle="solid"
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
          options={[
            { value: 'olculdu', label: 'Ölçüldü' },
            { value: 'bilinmiyor', label: 'Bilinmiyor' },
            { value: 'uygulanmiyor', label: 'Uygulanmıyor' },
          ]}
        />
      </div>
      {m.status === 'olculdu' ? (
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
          <label htmlFor={`${idPrefix}-baslangic`} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
            {label('Başlangıç değeri')}
            <InputNumber id={`${idPrefix}-baslangic`} style={{ width: '100%' }} value={m.baseline ?? undefined} onChange={(v) => set({ baseline: v ?? null })} />
          </label>
          <label htmlFor={`${idPrefix}-deger`} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
            {label('Ölçülen değer')}
            <InputNumber id={`${idPrefix}-deger`} style={{ width: '100%' }} value={m.value ?? undefined} onChange={(v) => set({ value: v ?? null })} />
          </label>
          <label htmlFor={`${idPrefix}-pay`} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
            {label('Pay (oran ise)')}
            <InputNumber id={`${idPrefix}-pay`} style={{ width: '100%' }} value={m.numerator ?? undefined} onChange={(v) => set({ numerator: v ?? null })} />
          </label>
          <label htmlFor={`${idPrefix}-payda`} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
            {label('Payda (oran ise)')}
            <InputNumber id={`${idPrefix}-payda`} style={{ width: '100%' }} value={m.denominator ?? undefined} onChange={(v) => set({ denominator: v ?? null })} />
          </label>
        </div>
      ) : null}
      {m.status === 'uygulanmiyor' ? (
        <label htmlFor={`${idPrefix}-neden`} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
          {label('Neden uygulanmıyor?')}
          <Input id={`${idPrefix}-neden`} value={m.naReason ?? ''} onChange={(e) => set({ naReason: e.target.value })} />
        </label>
      ) : null}
      <Space orientation="vertical" size={4} style={{ width: '100%' }}>
        {label('Eşik ve dayanağı')}
        <ThresholdInput
          idPrefix={`${idPrefix}-esik`}
          unit={m.unit}
          value={{ value: m.threshold ?? null, basis: m.basis ?? '', isGuess: m.isGuess ?? !m.basis }}
          onChange={(t) => set({ threshold: t.value, basis: t.basis, isGuess: t.isGuess })}
        />
      </Space>
    </div>
  )
}
