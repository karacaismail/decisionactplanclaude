import type { ComponentProps, ReactNode } from 'react'
import { Checkbox, DatePicker, Form, Input, InputNumber, Radio, Rate, Select, Switch, Tag } from 'antd'
import { CalendarBlank, ChatCircleText, Check, Hash, Info, LinkSimple, Quotes, Star, TextAa, User } from '@phosphor-icons/react'
import dayjs from 'dayjs'
import 'dayjs/locale/tr'
import type { Field, Option } from '@/data/schema'
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

/** Tarih ve aramalı seçim alanları bu özellikleri iç girişe aktarmıyor. */
function TextEntryInput(props: ComponentProps<'input'>) {
  return <input {...props} inputMode="text" enterKeyHint="done" autoComplete="off" />
}

const TEXT_INPUT_COMPONENTS = { input: TextEntryInput }
const DATE_CLASS_NAMES = { popup: { root: 'form-date-popup' } }
const formPopupContainer = (trigger: HTMLElement) => trigger.closest<HTMLElement>('.work-page') ?? document.body

/** Metin alanının başındaki ikon. Alan adına göre seçilir. */
function prefixFor(key: string): ReactNode {
  const k = key.toLowerCase()
  if (/person|owner|who|name|partner|budgetowner|kisi/.test(k)) return <User size={18} aria-hidden />
  if (/quote|soz/.test(k)) return <Quotes size={18} aria-hidden />
  if (/reason|why|neden|basis|learning|note/.test(k)) return <ChatCircleText size={18} aria-hidden />
  if (/source|link|kaynak|path/.test(k)) return <LinkSimple size={18} aria-hidden />
  return <TextAa size={18} aria-hidden />
}

/** Seçenek açıklamaları balonda liste olur. */
function optionsTooltip(options: Option[]): ReactNode | null {
  const withHelp = options.filter((o) => o.help)
  if (!withHelp.length) return null
  return (
    <ul className="tooltip-list">
      {withHelp.map((o) => (
        <li key={o.value}><strong>{o.label}.</strong> {o.help}</li>
      ))}
    </ul>
  )
}

/**
 * Tek form alanı. Geniş görünümde antd `Form.Item` düzenidir: etiket, bilgi balonu, giriş, altta ipucu (`extra`).
 * `compact` tablo hücresi içindir. Girişin adı ve grubun açıklaması korunur. Kart yardımını CSS gösterir.
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
  const cellPlaceholder = (own?: string) => own ?? (compact ? field.label : undefined)

  /** Etiket, balon ve ipucu ile alanı sarar. `labelAs: 'span'` grup kontrolleri içindir (htmlFor verilmez). */
  const wrap = (control: ReactNode, opts: { extra?: ReactNode; tooltip?: ReactNode; labelAs?: 'label' | 'span' } = {}) => {
    const requiredHelp = field.required ? 'Bu alan zorunludur. Boş kalırsa adım tamamlanmaz.' : undefined
    if (compact) {
      const details = [field.help, opts.extra, opts.tooltip, requiredHelp].filter(Boolean)
      const descriptionId = details.length ? `${id}-aciklama` : undefined
      return (
        <div className="field is-compact" role="group" aria-label={field.label || undefined} aria-describedby={descriptionId}>
          {control}
          {descriptionId ? (
            <div id={descriptionId} className="repeater-cell-help field-extra">
              {details.map((detail, index) => <div key={index} className="field-extra-line">{detail}</div>)}
            </div>
          ) : null}
        </div>
      )
    }
    const tip = opts.tooltip ?? requiredHelp
    const extra = [field.help, opts.extra].filter(Boolean)
    const label = field.label ? (
      <>
        {field.label}
        {field.required ? <span className="field-required"> (zorunlu)</span> : null}
      </>
    ) : undefined
    return (
      <Form.Item
        layout="vertical"
        className="step-field"
        label={label}
        htmlFor={opts.labelAs === 'span' ? undefined : id}
        required={false}
        tooltip={tip ? { title: tip, icon: <Info size={16} aria-label="Yardım" /> } : undefined}
        extra={extra.length ? <span className="field-extra">{extra.map((e, i) => <span key={i} className="field-extra-line">{e}</span>)}</span> : undefined}
      >
        {opts.labelAs === 'span' ? <span id={`${id}-etiket`} className="sr-only">{field.label}</span> : null}
        {control}
      </Form.Item>
    )
  }

  switch (field.type) {
    case 'text':
      return wrap(
        <Input id={id} className={cellClass} variant={variant} aria-label={ariaLabel} inputMode="text" enterKeyHint="done" autoComplete="off" prefix={compact ? undefined : prefixFor(field.key)} value={(value as string) ?? ''} maxLength={field.maxLength} onChange={(e) => onChange(e.target.value)} placeholder={cellPlaceholder(field.placeholder)} aria-required={field.required} />,
      )
    case 'textarea':
      return wrap(
        <Input.TextArea id={id} className={cellClass} variant={variant} aria-label={ariaLabel} inputMode="text" enterKeyHint="enter" autoComplete="off" value={(value as string) ?? ''} rows={compact ? 1 : field.rows ?? 3} autoSize={compact ? { minRows: 1, maxRows: 3 } : { minRows: field.rows ?? 3, maxRows: 10 }} maxLength={field.maxLength} showCount={Boolean(field.maxLength) && !compact} onChange={(e) => onChange(e.target.value)} placeholder={cellPlaceholder(field.placeholder)} aria-required={field.required} />,
      )
    case 'number':
      return wrap(
        <InputNumber id={id} className={cellClass} variant={variant} aria-label={ariaLabel} inputMode="decimal" enterKeyHint="done" autoComplete="off" decimalSeparator="," value={(value as number) ?? undefined} min={field.min} max={field.max} step={field.step} suffix={field.unit ? <span className="unit-suffix">{field.unit}</span> : undefined} prefix={compact ? undefined : <Hash size={16} aria-hidden />} placeholder={compact ? 'Sayı' : 'Sayı yazın'} onChange={(v) => onChange(v ?? null)} />,
        { tooltip: field.min !== undefined || field.max !== undefined ? `En az ${field.min ?? 0}${field.max !== undefined ? `, en çok ${field.max}` : ''}${field.unit ? ` ${field.unit}` : ''}.` : undefined },
      )
    case 'money':
      return wrap(
        <InputNumber
          id={id}
          className={cellClass}
          variant={variant}
          aria-label={ariaLabel}
          inputMode="decimal"
          enterKeyHint="done"
          autoComplete="off"
          placeholder={compact ? '0' : '0'}
          value={typeof value === 'number' ? value / 100 : undefined}
          min={0}
          step={100}
          decimalSeparator=","
          formatter={(v) => (v === undefined || v === null || String(v) === '' ? '' : `${Number(v).toLocaleString('tr-TR')}`)}
          parser={(s) => Number(String(s ?? '').replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')) as unknown as number}
          suffix={<span className="unit-suffix">TL</span>}
          onChange={(v) => onChange(v === null || v === undefined ? null : Math.round(Number(v) * 100))}
        />,
        {
          extra: typeof value === 'number' ? <span className="tabular">Yazılan tutar: {formatMoney(value)}</span> : null,
          tooltip: 'Tutarı lira olarak yazın. Kuruş için virgül kullanın. Binlik nokta kendiliğinden gelir.',
        },
      )
    case 'date':
      return wrap(
        <DatePicker id={id} className={cellClass} classNames={DATE_CLASS_NAMES} getPopupContainer={formPopupContainer} variant={variant} aria-label={ariaLabel} components={TEXT_INPUT_COMPONENTS} autoComplete="off" value={value ? dayjs(value as string) : null} format="D MMMM YYYY" onChange={(d) => onChange(d ? d.format('YYYY-MM-DD') : null)} placeholder="Gün seçin" suffix={<CalendarBlank size={18} aria-hidden />} />,
        { extra: value ? formatDate(value as string) : null, tooltip: 'Takvimden gün seçin. Tarih "13 Kasım 2026" biçiminde görünür.' },
      )
    case 'select':
      return wrap(
        <Select id={id} className={cellClass} variant={variant} aria-label={ariaLabel} components={TEXT_INPUT_COMPONENTS} autoComplete="off" value={(value as string) ?? undefined} options={field.options} onChange={onChange} placeholder={field.placeholder ?? 'Seçin'} allowClear showSearch optionFilterProp="label" notFoundContent="Eşleşen seçenek yok." />,
        { tooltip: optionsTooltip(field.options), extra: field.options.find((o) => o.value === value)?.help },
      )
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
        { tooltip: optionsTooltip(field.options), extra: field.options.find((o) => o.value === value)?.help, labelAs: 'span' },
      )
    case 'chips': {
      const sel = (value as string[]) ?? []
      const full = Boolean(field.max) && sel.length >= (field.max ?? 0)
      return wrap(
        <div role="group" aria-labelledby={field.label && !compact ? `${id}-etiket` : undefined} aria-label={ariaLabel} className="chip-row">
          {field.options.map((o) => {
            const on = sel.includes(o.value)
            const disabled = !on && full
            return (
              <button
                type="button"
                key={o.value}
                className={`chip${on ? ' is-selected' : ''}`}
                aria-pressed={on}
                disabled={disabled}
                onClick={() => onChange(on ? sel.filter((x) => x !== o.value) : [...sel, o.value])}
              >
                {on ? <Check size={16} weight="bold" aria-hidden /> : null}
                {o.label}
              </button>
            )
          })}
        </div>,
        { extra: field.max ? `En çok ${field.max} seçim. Seçili: ${sel.length}.` : `Seçili: ${sel.length}.`, tooltip: optionsTooltip(field.options), labelAs: 'span' },
      )
    }
    case 'toggle':
      return wrap(
        <div className="toggle-field">
          <Switch id={id} aria-label={ariaLabel} checked={Boolean(value)} onChange={onChange} />
          <span className="toggle-text">{value ? field.onLabel ?? 'Evet' : field.offLabel ?? 'Hayır'}</span>
        </div>,
      )
    case 'rate': {
      const labels = field.labels ?? RATE_DEFAULT
      const n = (value as number) ?? 0
      return wrap(
        <div className="rate-field">
          <Rate id={id} aria-label={ariaLabel} count={field.max ?? 5} value={n} onChange={onChange} character={<Star size={26} weight="fill" aria-hidden />} />
          <Tag className="rate-tag">{n ? `${n}. ${labels[n - 1]}` : 'Seçilmedi'}</Tag>
        </div>,
        { tooltip: `1 en düşük, ${field.max ?? 5} en yüksek puandır.` },
      )
    }
    case 'evidenceLadder':
      if (compact) {
        return wrap(<Select id={id} className="cell-input" variant="borderless" aria-label={ariaLabel} value={(value as number) ?? undefined} onChange={onChange} placeholder="Basamak seçin" options={LADDER.map((l) => ({ value: l.level, label: `${l.level}. ${l.label}` }))} />, {
          tooltip: <><span>1. basamak en güçlü kanıttır. 7. basamak en zayıf kanıttır.</span><ul className="tooltip-list">{LADDER.filter((level) => level.hint).map((level) => <li key={level.level}><strong>{level.level}. {level.label}.</strong> {level.hint}</li>)}</ul></>,
        })
      }
      return wrap(<EvidenceLadderPicker id={id} value={value as number} onChange={onChange} />, { labelAs: 'span', tooltip: '1. basamak en güçlü kanıttır. 7. basamak en zayıf kanıttır.' })
    case 'threshold':
      return wrap(<ThresholdInput idPrefix={id} unit={field.unit} value={value as ThresholdValue} onChange={onChange} />, { labelAs: 'span' })
    case 'measure':
      return wrap(<MeasureInput idPrefix={id} defaultName={field.defaultName} defaultUnit={field.defaultUnit} value={value as Measure} onChange={onChange} />, { labelAs: 'span' })
    case 'repeater':
      return wrap(<RepeaterTable idPrefix={id} plan={plan} columns={field.columns} value={value as Row[]} onChange={onChange} addLabel={field.addLabel} minRows={field.minRows} maxRows={field.maxRows} fixedFirstRow={field.fixedFirstRow} />, {
        labelAs: 'span',
        tooltip: field.maxRows ? `En çok ${field.maxRows} satır.` : undefined,
      })
    case 'scoreMatrix': {
      const rows = ((values[field.rowsFrom] as Row[]) ?? []).map((r) => ({ id: r._id, label: String(r[field.rowLabelKey] ?? 'Adsız') }))
      return wrap(<ScoreMatrix rows={rows} criteria={field.criteria} value={value as ScoreMatrixValue} onChange={onChange} />, { labelAs: 'span' })
    }
    case 'checklist': {
      const sel = (value as string[]) ?? []
      return wrap(
        <Checkbox.Group className="plain-list" aria-labelledby={field.label && !compact ? `${id}-etiket` : undefined} aria-label={ariaLabel} value={sel} onChange={(v) => onChange(v)} options={field.items} />,
        { labelAs: 'span', extra: `İşaretli: ${sel.length} / ${field.items.length}.` },
      )
    }
    case 'info':
      return <Callout tone={field.tone ?? 'bilgi'} title={field.label || undefined}>{field.text}</Callout>
    case 'evidenceLink':
      return wrap(<EvidenceLink id={id} plan={plan} value={(value as string[]) ?? []} onChange={onChange} />, { tooltip: 'Kanıt defterinden kayıt seçin. Yeni kanıtı yandan açılan formla ekleyin.' })
    default:
      return null
  }
}

/** Alan dolu mu? Boş metin, boş dizi, null ve undefined boştur. `false` bir cevaptır. */
export function isFilled(v: unknown): boolean {
  if (v === undefined || v === null || v === '') return false
  if (Array.isArray(v)) return v.length > 0
  if (typeof v === 'object') return Object.keys(v as object).length > 0
  return true
}
