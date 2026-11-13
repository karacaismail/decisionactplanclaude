import type { ReactNode } from 'react'

/** Boş durum: ikon, başlık, tek cümle açıklama ve eylemler. Kenarlıksız yüzey. */
export function EmptyState({
  icon,
  title,
  text,
  actions,
  tone = 'navy',
}: {
  icon?: ReactNode
  title: string
  text?: ReactNode
  actions?: ReactNode
  tone?: 'teal' | 'purple' | 'orange' | 'navy'
}) {
  return (
    <div className="empty-state" role="status">
      {icon ? (
        <span className={`icon-tile ${tone}`} aria-hidden style={{ width: 56, height: 56 }}>
          {icon}
        </span>
      ) : null}
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
      {actions ? <div className="empty-actions">{actions}</div> : null}
    </div>
  )
}
