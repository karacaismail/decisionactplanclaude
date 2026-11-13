import type { ReactNode } from 'react'
import '@/styles/screens-pano.css'

/**
 * Boş durum: başlık, tek cümle açıklama ve en çok iki düğme.
 * Kart değildir. İkon isteğe bağlıdır ve 16 px gri çizilir. Renkli ikon kutusu yoktur.
 */
export function EmptyState({ icon, title, text, actions }: { icon?: ReactNode; title: string; text?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="empty-state" role="status">
      {icon ? (
        <span className="empty-icon" aria-hidden>
          {icon}
        </span>
      ) : null}
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
      {actions ? <div className="empty-actions">{actions}</div> : null}
    </div>
  )
}
