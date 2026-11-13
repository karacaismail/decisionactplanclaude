import { useRef } from 'react'
import { Check } from '@phosphor-icons/react'

export const LADDER: { level: number; label: string; hint: string }[] = [
  { level: 1, label: 'Müşteri ödeme yaptı', hint: 'En güçlü kanıt.' },
  { level: 2, label: 'Depozito verdi veya sözleşme imzaladı', hint: '' },
  { level: 3, label: 'Zaman ayırdı veya veri paylaştı', hint: '' },
  { level: 4, label: 'Sonraki görüşmeyi kendisi istedi', hint: 'Buradan aşağısı yalnız ipucudur.' },
  { level: 5, label: '"İsterim" dedi', hint: '' },
  { level: 6, label: 'Bir uzman "olur" dedi', hint: '' },
  { level: 7, label: 'Kurucu "olur" dedi', hint: 'En zayıf kanıt.' },
]

/**
 * Yedi basamaklı kanıt merdiveni. Tek seçimli satır listesi (`.choice-list`).
 * Klavyede yukarı ve aşağı oklar seçimi taşır. Tab tuşu yalnız seçili satıra uğrar.
 */
export function EvidenceLadderPicker({ value, onChange, id }: { value?: number; onChange: (v: number) => void; id?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const select = (level: number) => {
    onChange(level)
    const btn = ref.current?.querySelector<HTMLButtonElement>(`[data-level="${level}"]`)
    btn?.focus()
  }
  return (
    <div ref={ref} role="radiogroup" aria-label="Kanıt basamağı" id={id} className="choice-list">
      {LADDER.map((l) => {
        const selected = value === l.level
        const tabIndex = value === undefined ? (l.level === 1 ? 0 : -1) : selected ? 0 : -1
        return (
          <button
            type="button"
            key={l.level}
            role="radio"
            aria-checked={selected}
            data-level={l.level}
            tabIndex={tabIndex}
            className={`choice${selected ? ' is-selected' : ''}`}
            onClick={() => onChange(l.level)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); select(Math.min(7, l.level + 1)) }
              if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); select(Math.max(1, l.level - 1)) }
              if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange(l.level) }
            }}
          >
            <span className="choice-num" aria-hidden>{l.level}</span>
            <span className="choice-text">
              <span className="choice-title">
                {l.label}
                {selected ? <span className="choice-check"><Check size={16} weight="bold" aria-hidden /></span> : null}
              </span>
              {l.hint ? <span className="choice-desc">{l.hint}</span> : null}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/** Salt okunur merdiven. Seçili basamak kalın yazılır. */
export function EvidenceLadder({ value }: { value?: number }) {
  return (
    <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
      {LADDER.map((l) => (
        <li key={l.level} className="helper" style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: value === l.level ? 600 : 400 }}>
          <span className="tabular" style={{ width: 20 }}>{l.level}.</span>
          {l.label}
        </li>
      ))}
    </ol>
  )
}
