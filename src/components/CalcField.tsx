import { Button } from 'antd'
import { Calculator, ArrowBendDownRight } from '@phosphor-icons/react'
import type { CalcResult } from '@/data/schema'

/** Otomatik hesap kutusu. Sonucu gösterir, istenirse ilgili alana yazar. Kendi değeri yoktur. */
export function CalcField({ label, result, current, onApply, emptyText = 'Üstteki sayıları yazınca hesap burada görünür.' }: { label: string; result: CalcResult | null; current: unknown; onApply: (key: string, value: number) => void; emptyText?: string }) {
  if (!result) {
    return (
      <div className="calc-box is-empty" role="note">
        <span className="calc-title"><Calculator size={16} aria-hidden /> {label}</span>
        <span className="helper">{emptyText}</span>
      </div>
    )
  }
  const applied = result.apply ? current === result.apply.value : false
  return (
    <div className="calc-box" role="status" aria-live="polite">
      <span className="calc-title"><Calculator size={16} aria-hidden /> {label}</span>
      <span className="calc-value tabular">{result.value}</span>
      <ul className="calc-lines">
        {result.lines.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      {result.warn ? <span className="calc-warn">{result.warn}</span> : null}
      {result.apply ? (
        applied ? (
          <span className="helper">Bu sonuç alanda yazılı.</span>
        ) : (
          <Button icon={<ArrowBendDownRight size={16} />} onClick={() => onApply(result.apply!.key, result.apply!.value)}>
            {result.apply.label}
          </Button>
        )
      ) : null}
    </div>
  )
}
