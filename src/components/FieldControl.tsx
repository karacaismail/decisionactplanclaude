import { Checkbox, DatePicker, Input, InputNumber, Radio, Rate, Select, Switch } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/tr'
import type { Field } from '@/data/schema'
import type { PlanDoc, Measure } from '@/data/types'
import { evalCondition } from '@/engine/conditions'
import { formatDate, formatMoney } from '@/engine/format'
import { Callout } from './Callout'
import { EvidenceLadderPicker, LADDER } from './EvidenceLadderPicker'
import { MeasureInput } from './MeasureInput'
import { ThresholdInput, type ThresholdValue } from './ThresholdInput'
import { RepeaterTable, type Row } from './RepeaterTable'
import { ScoreMatrix, type ScoreMatrixValue } from './ScoreMatrix'
import { EvidenceLink } from './EvidenceLink'

dayjs.locale('tr')

const RATE_DEFAULT = ['1', '2', '3', '4', '5']

/**
 * Tek form alanı. Etiket `.field-label`, yardım `.field-help`.
 * `compact` tablo hücresi içindir: etiket çizilmez, girişe aria-label verilir, giriş kenarlıksızdır.
 * Hücre girişi `.cell-input` sınıfı alır: alt çizgi düzenlenebilir olduğunu gösterir. Boş hücrede etiket yer tutucu olur.
 */
export function FieldControl({ field, value, onChange, plan, values, compact, idPrefix }: {
  field: Field
  value: unknown
  onChange: (v: unknown) => void
  plan: PlanDoc
  values: Record<string, unknown>
  compact?: boolean
  idPrefix: string
}) {
  if (!evalCondition(field.when, plan, undefined, values)) return null
  const id = `${idPrefix}-${field.key}`
  const variant = compact ? ('borderless' as const) : undefined
  const cellClass = compact ? 'cell-input' : undefined
  const ariaLabel = compact ? field.label : undefined
  /* Boş hücrede yer tutucu: alanın kendi metni, yoksa etiketi. */
  const cellPlaceholder = (own?: string) => own ?? (compact ? field.label : undefined)
  const help = (t?: string) => (t && !compact ? <div className="field-help">{t}</div> : null)
  const wrap = (control: React.ReactNode, extra?: React.ReactNode, labelAs: 'label' | 'span' = 'label') => (
    <div className="field">
      {field.label && !compact ? (
        labelAs === 'label' ? (
          <label htmlFor={id} className="field-label">
            {field.label}
            {field.required ? <span className="field-required"> (zorunlu)</span> : null}
          </label>
        ) : (
          <span id={`${id}-etiket`} className="field-label">
            {field.label}
            {field.required ? <span className="field-required"> (zorunlu)</span> : null}
          </span>
        )
      ) : null}
      {control}
      {extra}
      {help(field.help)}
    </div>
  )

  switch (field.type) {
    case 'text':
      return wrap(<Input id={id} className={cellClass} variant={variant} aria-label={ariaLabel} value={(value as string) ?? ''} maxLength={field.maxLength} onChange={(e) => onChange(e.target.value)} placeholder={cellPlaceholder(field.placeholder)} aria-required={field.required} />)
    case 'textarea':
      return wrap(<Input.TextArea id={id} className={cellClass} variant={variant} aria-label={ariaLabel} value={(value as string) ?? ''} rows={compact ? 1 : field.rows ?? 3} autoSize={compact ? { minRows: 1, maxRows: 3 } : undefined} maxLength={field.maxLength} showCount={Boolean(field.maxLength) && !compact} onChange={(e) => onChange(e.target.value)} placeholder={cellPlaceholder(field.placeholder)} aria-required={field.required} />)
    case 'number':
      return wrap(<InputNumber id={id} className={cellClass} variant={variant} aria-label={ariaLabel} value={(value as number) ?? undefined} min={field.min} max={field.max} step={field.step} addonAfter={field.unit} placeholder={compact ? 'Sayı' : undefined} onChange={(v) => onChange(v ?? null)} />)
    case 'money':
      return wrap(
        <InputNumber
          id={id}
          className={cellClass}
          variant={variant}
          aria-label={ariaLabel}
          placeholder={compact ? '0' : undefined}
          value={typeof value === 'number' ? value / 100 : undefined}
          min={0}
          step={100}
          decimalSeparator=","
          formatter={(v) => (v === undefined || v === null || String(v) === '' ? '' : `${Number(v).toLocaleString('tr-TR')}`)}
          parser={(s) => Number(String(s ?? '').replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')) as unknown as number}
          addonAfter="TL"
          onChange={(v) => onChange(v === null || v === undefined ? null : Math.round(Number(v) * 100))}
        />,
        typeof value === 'number' && !compact ? <span className="field-help tabular">{formatMoney(value)}</span> : null,
      )
    case 'date':
      return wrap(
        <DatePicker id={id} className={cellClass} variant={variant} aria-label={ariaLabel} value={value ? dayjs(value as string) : null} format="DD.MM.YYYY" onChange={(d) => onChange(d ? d.format('YYYY-MM-DD') : null)} placeholder="Gün.Ay.Yıl" />,
        value && !compact ? <span className="field-help">{formatDate(value as string)}</span> : null,
      )
    case 'select':
      return wrap(<Select id={id} className={cellClass} variant={variant} aria-label={ariaLabel} value={(value as string) ?? undefined} options={field.options} onChange={onChange} placeholder={field.placeholder ?? 'Seçin'} allowClear showSearch optionFilterProp="label" />)
    case 'segmented':
      return wrap(
        <Radio.Group
          id={id}
          aria-labelledby={field.label && !compact ? `${id}-etiket` : undefined}
          aria-label={ariaLabel}
          className="choice-buttons"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          optionType="button"
          options={field.options.map((o) => ({ value: o.value, label: o.label }))}
        />,
        !compact ? help(field.options.find((o) => o.value === value)?.help) : null,
        'span',
      )
    case 'chips': {
      const sel = (value as string[]) ?? []
      const full = Boolean(field.max) && sel.length >= (field.max ?? 0)
      return wrap(
        <div role="group" aria-labelledby={field.label && !compact ? `${id}-etiket` : undefined} aria-label={ariaLabel} className="chip-row">
          {field.options.map((o) => {
            const on = sel.includes(o.value)
            return (
              <button
                type="button"
                key={o.value}
                className={`chip${on ? ' is-selected' : ''}`}
                aria-pressed={on}
                disabled={!on && full}
                onClick={() => onChange(on ? sel.filter((x) => x !== o.value) : [...sel, o.value])}
              >
                {o.label}
              </button>
            )
          })}
        </div>,
        field.max && !compact ? <div className="field-help">En çok {field.max} seçim.</div> : null,
        'span',
      )
    }
    case 'toggle':
      return wrap(
        <div className="toggle-field">
          <Switch id={id} aria-label={ariaLabel} checked={Boolean(value)} onChange={onChange} />
          <span>{value ? field.onLabel ?? 'Evet' : field.offLabel ?? 'Hayır'}</span>
        </div>,
      )
    case 'rate': {
      const labels = field.labels ?? RATE_DEFAULT
      const n = (value as number) ?? 0
      return wrap(
        <div className="rate-field">
          <Rate id={id} aria-label={ariaLabel} count={field.max ?? 5} value={n} onChange={onChange} />
          <span className="helper">{n ? labels[n - 1] : 'Seçilmedi'}</span>
        </div>,
      )
    }
    case 'evidenceLadder':
      if (compact) {
        return wrap(<Select id={id} className="cell-input" variant="borderless" aria-label={ariaLabel} value={(value as number) ?? undefined} onChange={onChange} placeholder="Basamak seçin" options={LADDER.map((l) => ({ value: l.level, label: `${l.level}. ${l.label}` }))} />)
      }
      return wrap(<EvidenceLadderPicker id={id} value={value as number} onChange={onChange} />, undefined, 'span')
    case 'threshold':
      return wrap(<ThresholdInput idPrefix={id} unit={field.unit} value={value as ThresholdValue} onChange={onChange} />, undefined, 'span')
    case 'measure':
      return wrap(<MeasureInput idPrefix={id} defaultName={field.defaultName} defaultUnit={field.defaultUnit} value={value as Measure} onChange={onChange} />, undefined, 'span')
    case 'repeater':
      return wrap(<RepeaterTable idPrefix={id} plan={plan} columns={field.columns} value={value as Row[]} onChange={onChange} addLabel={field.addLabel} minRows={field.minRows} maxRows={field.maxRows} fixedFirstRow={field.fixedFirstRow} />, undefined, 'span')
    case 'scoreMatrix': {
      const rows = ((values[field.rowsFrom] as Row[]) ?? []).map((r) => ({ id: r._id, label: String(r[field.rowLabelKey] ?? 'Adsız') }))
      return wrap(<ScoreMatrix rows={rows} criteria={field.criteria} value={value as ScoreMatrixValue} onChange={onChange} />, undefined, 'span')
    }
    case 'checklist':
      return wrap(<Checkbox.Group className="plain-list" aria-labelledby={field.label ? `${id}-etiket` : undefined} value={(value as string[]) ?? []} onChange={(v) => onChange(v)} options={field.items} />, undefined, 'span')
    case 'info':
      return <Callout tone={field.tone ?? 'bilgi'} title={field.label || undefined}>{field.text}</Callout>
    case 'evidenceLink':
      return wrap(<EvidenceLink id={id} plan={plan} value={(value as string[]) ?? []} onChange={onChange} />)
    default:
      return null
  }
}
