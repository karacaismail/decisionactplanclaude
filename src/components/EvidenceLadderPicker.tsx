import { theme } from 'antd'
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

/** Yedi basamaklı kanıt merdiveni. Dikey radyo listesi. Oklarla gezilir. */
export function EvidenceLadderPicker({ value, onChange, id }: { value?: number; onChange: (v: number) => void; id?: string }) {
  const { token } = theme.useToken()
  return (
    <div role="radiogroup" aria-label="Kanıt basamağı" id={id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 6 }}>
      {LADDER.map((l) => {
        const selected = value === l.level
        const strong = l.level <= 3
        return (
          <button
            type="button"
            key={l.level}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(l.level)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown' && l.level < 7) onChange(l.level + 1)
              if (e.key === 'ArrowUp' && l.level > 1) onChange(l.level - 1)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minHeight: 44,
              padding: '8px 12px',
              textAlign: 'left',
              border: 0,
              borderRadius: token.borderRadius,
              background: selected ? token.colorPrimaryBg : token.colorFillAlter,
              color: token.colorText,
              cursor: 'pointer',
              fontSize: 16,
              fontFamily: 'inherit',
            }}
          >
            <span
              className="tabular"
              style={{ width: 28, height: 28, borderRadius: 14, display: 'inline-grid', placeItems: 'center', fontWeight: 600, background: strong ? token.colorPrimary : token.colorBorder, color: strong ? '#fff' : token.colorText, flexShrink: 0 }}
            >
              {l.level}
            </span>
            <span style={{ flex: 1 }}>
              {l.label}
              {l.hint ? <span style={{ display: 'block', fontSize: 14, color: token.colorTextSecondary }}>{l.hint}</span> : null}
            </span>
            {selected ? <Check size={20} weight="bold" color={token.colorPrimary} aria-hidden /> : null}
          </button>
        )
      })}
    </div>
  )
}

export function EvidenceLadder({ value }: { value?: number }) {
  const { token } = theme.useToken()
  return (
    <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
      {LADDER.map((l) => (
        <li key={l.level} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14, color: value === l.level ? token.colorPrimary : token.colorTextSecondary, fontWeight: value === l.level ? 600 : 400 }}>
          <span className="tabular" style={{ width: 20 }}>{l.level}.</span>
          {l.label}
        </li>
      ))}
    </ol>
  )
}
