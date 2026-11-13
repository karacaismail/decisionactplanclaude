import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'

export type StatTone = 'teal' | 'purple' | 'orange' | 'navy'

/**
 * İstatistik kutusu: ikon, etiket, büyük sayı, birim ve kısa not.
 * `to` verilirse tıklanır ve o sayfaya gider.
 */
export function StatTile({
  icon,
  label,
  value,
  unit,
  note,
  tone = 'teal',
  to,
  onClick,
}: {
  icon: ReactNode
  label: string
  value: string | number
  unit?: string
  note?: string
  tone?: StatTone
  to?: string
  onClick?: () => void
}) {
  const nav = useNavigate()
  const clickable = Boolean(to || onClick)
  const body = (
    <>
      <span className={`icon-tile ${tone}`} aria-hidden>
        {icon}
      </span>
      <span className="stat-label">{label}</span>
      <span className="stat-number tabular">
        {value}
        {unit ? <span>{unit}</span> : null}
      </span>
      {note ? <span className="stat-note">{note}</span> : null}
    </>
  )
  if (!clickable) {
    return <div className="stat-tile">{body}</div>
  }
  return (
    <button
      type="button"
      className="stat-tile is-link"
      onClick={() => {
        onClick?.()
        if (to) nav(to)
      }}
    >
      {body}
    </button>
  )
}
