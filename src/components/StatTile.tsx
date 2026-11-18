import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import '@/styles/mobil-token.css'

export type StatTone = 'teal' | 'purple' | 'orange' | 'navy'

/**
 * KPI öğesi. Kutu yoktur; şerit içinde 1 px çizgiyle ayrılır.
 * Yalnız `KpiStrip` içinde ve yalnız plan özetinde kullanılır.
 */
export function StatTile({
  icon,
  label,
  value,
  unit,
  note,
  to,
  onClick,
}: {
  icon?: ReactNode
  label: string
  value: string | number
  unit?: string
  note?: string
  /** Eski çağrılar için tutulur, renk üretmez. */
  tone?: StatTone
  to?: string
  onClick?: () => void
}) {
  const nav = useNavigate()
  const clickable = Boolean(to || onClick)
  const body = (
    <>
      <span className="kpi-label">{label}</span>
      {icon ? <span className="kpi-icon" aria-hidden>{icon}</span> : null}
      <span className="kpi-value">
        {value}
        {unit ? <span>{unit}</span> : null}
      </span>
      {note ? <span className="kpi-note">{note}</span> : null}
    </>
  )
  if (!clickable) return <div className="kpi mt-stat-tile">{body}</div>
  return (
    <button
      type="button"
      className="kpi is-link mt-stat-tile"
      onClick={() => {
        onClick?.()
        if (to) nav(to)
      }}
    >
      {body}
    </button>
  )
}

/** Dört KPI'yı tek satırda gösteren şerit. */
export function KpiStrip({ children, label = 'Plan sayıları' }: { children: ReactNode; label?: string }) {
  return (
    <div className="kpi-strip mt-stat-strip" role="group" aria-label={label}>
      {children}
    </div>
  )
}
