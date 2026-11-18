import { Segmented, Tag } from 'antd'
import '@/styles/mobil-pano.css'

export const LADDER: { level: number; label: string; hint: string }[] = [
  { level: 1, label: 'Müşteri ödeme yaptı', hint: 'En güçlü kanıt.' },
  { level: 2, label: 'Depozito verdi veya sözleşme imzaladı', hint: '' },
  { level: 3, label: 'Zaman ayırdı veya veri paylaştı', hint: '' },
  { level: 4, label: 'Sonraki görüşmeyi kendisi istedi', hint: 'Buradan aşağısı yalnız ipucudur.' },
  { level: 5, label: '"İsterim" dedi', hint: '' },
  { level: 6, label: 'Bir uzman "olur" dedi', hint: '' },
  { level: 7, label: 'Kurucu "olur" dedi', hint: 'En zayıf kanıt.' },
]

/** Basamağın gücü: 1 ile 3 güçlü, 4 orta, 5 ile 7 zayıf. */
export function ladderTone(level?: number): 'success' | 'warning' | 'default' {
  if (!level) return 'default'
  if (level <= 3) return 'success'
  if (level === 4) return 'warning'
  return 'default'
}

export function ladderLabel(level?: number): string {
  const l = LADDER.find((x) => x.level === level)
  return l ? `${l.level}. basamak: ${l.label}` : 'Basamak seçilmedi'
}

/**
 * Yedi basamaklı kanıt merdiveni. Dikey `Segmented` ile tek seçim yapılır.
 * Klavyede oklar seçimi taşır. Seçili basamak altta renkli `Tag` ile yazılır.
 */
export function EvidenceLadderPicker({ value, onChange, id }: { value?: number; onChange: (v: number) => void; id?: string }) {
  return (
    <div className="mobil-ladder ladder-picker" id={id}>
      <Segmented<number>
        orientation="vertical"
        block
        className="ladder-steps"
        aria-label="Kanıt basamağı"
        value={value ?? 0}
        onChange={(v) => onChange(Number(v))}
        options={LADDER.map((l) => ({
          value: l.level,
          label: (
            <span className="ladder-item">
              <span className="ladder-num tabular" aria-hidden>{l.level}</span>
              <span className="ladder-text">
                <span className="ladder-title">{l.label}</span>
                {l.hint ? <span className="ladder-hint">{l.hint}</span> : null}
              </span>
            </span>
          ),
        }))}
      />
      <Tag className="ladder-tag" color={ladderTone(value)}>{ladderLabel(value)}</Tag>
    </div>
  )
}

/** Salt okunur merdiven. Seçili basamak kalın yazılır. */
export function EvidenceLadder({ value }: { value?: number }) {
  return (
    <ol className="mobil-ladder ladder-readonly" aria-label="Kanıt basamakları">
      {LADDER.map((l) => (
        <li key={l.level} className="helper ladder-readonly-item" aria-current={value === l.level ? 'true' : undefined}>
          <span className="tabular ladder-readonly-number">{l.level}.</span>
          <span className="ladder-readonly-label">{l.label}</span>
        </li>
      ))}
    </ol>
  )
}
