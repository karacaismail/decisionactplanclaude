import { Checkbox, DatePicker, Input, InputNumber, Radio, Rate, Select, Switch, Tag, theme } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/tr'
import type { Field } from '@/data/schema'
import type { PlanDoc, Measure } from '@/data/types'
import { evalCondition } from '@/engine/conditions'
import { formatDate, formatMoney } from '@/engine/format'
import { Callout } from './Callout'
import { EvidenceLadderPicker } from './EvidenceLadderPicker'
import { MeasureInput } from './MeasureInput'
import { ThresholdInput, type ThresholdValue } from './ThresholdInput'
import { RepeaterTable, type Row } from './RepeaterTable'
import { ScoreMatrix, type ScoreMatrixValue } from './ScoreMatrix'
import { EvidenceLink } from './EvidenceLink'

dayjs.locale('tr')

const RATE_DEFAULT = ['1', '2', '3', '4', '5']

export function FieldControl({ field, value, onChange, plan, values, compact, idPrefix }: {
  field: Field
  value: unknown
  onChange: (v: unknown) => void
  plan: PlanDoc
  values: Record<string, unknown>
  compact?: boolean
  idPrefix: string
}) {
  const { token } = theme.useToken()
  if (!evalCondition(field.when, plan, undefined, values)) return null
  const id = `${idPrefix}-${field.key}`
  const helper = (t?: string) => (t ? <div style={{ fontSize: 14, color: token.colorTextSecondary, marginTop: 4 }}>{t}</div> : null)
  const wrap = (control: React.ReactNode, extra?: React.ReactNode) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 6, minWidth: 0 }}>
      {field.label ? (
        <label htmlFor={id} style={{ fontSize: compact ? 14 : 16, fontWeight: 500 }}>
          {field.label}
          {field.required ? <span aria-hidden style={{ color: token.colorError }}> *</span> : null}
        </label>
      ) : null}
      {control}
      {extra}
      {!compact ? helper(field.help) : null}
    </div>
  )

  switch (field.type) {
    case 'text':
      return wrap(<Input id={id} value={(value as string) ?? ''} maxLength={field.maxLength} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} aria-required={field.required} />)
    case 'textarea':
      return wrap(<Input.TextArea id={id} value={(value as string) ?? ''} rows={field.rows ?? 3} maxLength={field.maxLength} showCount={Boolean(field.maxLength)} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} aria-required={field.required} />)
    case 'number':
      return wrap(<InputNumber id={id} style={{ width: '100%', maxWidth: 260 }} value={(value as number) ?? undefined} min={field.min} max={field.max} step={field.step} addonAfter={field.unit} onChange={(v) => onChange(v ?? null)} />)
    case 'money':
      return wrap(
        <InputNumber
          id={id}
          style={{ width: '100%', maxWidth: 260 }}
          value={typeof value === 'number' ? value / 100 : undefined}
          min={0}
          step={100}
          decimalSeparator=","
          formatter={(v) => (v === undefined || v === null || String(v) === '' ? '' : `${Number(v).toLocaleString('tr-TR')}`)}
          parser={(s) => Number(String(s ?? '').replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')) as unknown as number}
          addonAfter="TL"
          onChange={(v) => onChange(v === null || v === undefined ? null : Math.round(Number(v) * 100))}
        />,
        typeof value === 'number' ? <span className="tabular" style={{ fontSize: 14, color: token.colorTextSecondary }}>{formatMoney(value)}</span> : null,
      )
    case 'date':
      return wrap(
        <DatePicker id={id} style={{ width: '100%', maxWidth: 260 }} value={value ? dayjs(value as string) : null} format="DD.MM.YYYY" onChange={(d) => onChange(d ? d.format('YYYY-MM-DD') : null)} placeholder="Gün.Ay.Yıl" />,
        value ? <span style={{ fontSize: 14, color: token.colorTextSecondary }}>{formatDate(value as string)}</span> : null,
      )
    case 'select':
      return wrap(<Select id={id} style={{ width: '100%', maxWidth: 360 }} value={(value as string) ?? undefined} options={field.options} onChange={onChange} placeholder={field.placeholder ?? 'Seçin'} allowClear showSearch optionFilterProp="label" />)
    case 'segmented':
      return wrap(
        <Radio.Group
          id={id}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          optionType="button"
          buttonStyle="solid"
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
          options={field.options.map((o) => ({ value: o.value, label: o.label }))}
        />,
        field.options.find((o) => o.value === value)?.help ? helper(field.options.find((o) => o.value === value)?.help) : null,
      )
    case 'chips': {
      const sel = (value as string[]) ?? []
      return wrap(
        <div role="group" aria-labelledby={id} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {field.options.map((o) => {
            const on = sel.includes(o.value)
            return (
              <Tag.CheckableTag
                key={o.value}
                checked={on}
                onChange={(c) => {
                  if (c && field.max && sel.length >= field.max) return
                  onChange(c ? [...sel, o.value] : sel.filter((x) => x !== o.value))
                }}
                style={{ fontSize: 16, lineHeight: '36px', padding: '0 14px', borderRadius: token.borderRadius, border: `1px solid ${on ? token.colorPrimary : token.colorBorder}` }}
              >
                {o.label}
              </Tag.CheckableTag>
            )
          })}
        </div>,
      )
    }
    case 'toggle':
      return wrap(
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Switch id={id} checked={Boolean(value)} onChange={onChange} />
          <span>{value ? field.onLabel ?? 'Evet' : field.offLabel ?? 'Hayır'}</span>
        </div>,
      )
    case 'rate': {
      const labels = field.labels ?? RATE_DEFAULT
      const n = (value as number) ?? 0
      return wrap(
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Rate id={id} count={field.max ?? 5} value={n} onChange={onChange} />
          <span style={{ fontSize: 14, color: token.colorTextSecondary }}>{n ? labels[n - 1] : 'Seçilmedi'}</span>
        </div>,
      )
    }
    case 'evidenceLadder':
      return wrap(<EvidenceLadderPicker id={id} value={value as number} onChange={onChange} />)
    case 'threshold':
      return wrap(<ThresholdInput idPrefix={id} unit={field.unit} value={value as ThresholdValue} onChange={onChange} />)
    case 'measure':
      return wrap(<MeasureInput idPrefix={id} defaultName={field.defaultName} defaultUnit={field.defaultUnit} value={value as Measure} onChange={onChange} />)
    case 'repeater':
      return wrap(<RepeaterTable idPrefix={id} plan={plan} columns={field.columns} value={value as Row[]} onChange={onChange} addLabel={field.addLabel} minRows={field.minRows} maxRows={field.maxRows} fixedFirstRow={field.fixedFirstRow} />)
    case 'scoreMatrix': {
      const rows = ((values[field.rowsFrom] as Row[]) ?? []).map((r) => ({ id: r._id, label: String(r[field.rowLabelKey] ?? 'Adsız') }))
      return wrap(<ScoreMatrix rows={rows} criteria={field.criteria} value={value as ScoreMatrixValue} onChange={onChange} />)
    }
    case 'checklist':
      return wrap(<Checkbox.Group value={(value as string[]) ?? []} onChange={(v) => onChange(v)} options={field.items} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 }} />)
    case 'info':
      return <Callout tone={field.tone ?? 'bilgi'} title={field.label || undefined}>{field.text}</Callout>
    case 'evidenceLink':
      return wrap(<EvidenceLink id={id} plan={plan} value={(value as string[]) ?? []} onChange={onChange} />)
    default:
      return null
  }
}
