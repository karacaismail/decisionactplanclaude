import '@/styles/desen/pano.css'
import '@/styles/bilesen/EmptyState.css'
import type { ReactNode } from 'react'
/**
 * Boş durum: başlık, tek cümle açıklama ve en çok iki düğme.
 * İkon isteğe bağlıdır. Metin ve eylem ölçüleri ortak tasarım değişkenlerinden gelir.
 */
export function EmptyState({ icon, title, text, actions }: { icon?: ReactNode; title: string; text?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="empty-state mt-empty-state" role="status">
      {icon ? (
        <span className="empty-icon mt-empty-icon" aria-hidden>
          {icon}
        </span>
      ) : null}
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
      {actions ? <div className="empty-actions mt-empty-actions">{actions}</div> : null}
    </div>
  )
}
