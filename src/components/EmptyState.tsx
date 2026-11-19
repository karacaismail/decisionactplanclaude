import '@/styles/bilesen/EmptyState.css'
import { createElement, type ReactNode } from 'react'

type EmptyStateBase = {
  /** En çok 6 kelime. Örneğin "Henüz kanıt yok". */
  title: string
  /** Neden boş olduğunu söyleyen kısa açıklama. En çok üç kısa cümle. */
  text: ReactNode
  /** Ürünün çizgi ikonu. 16 ile 20 piksel arasında çizilir. */
  icon?: ReactNode
  /** Başlık düzeyi. Boş durumun bulunduğu bölüme göre seçilir. */
  level?: 2 | 3 | 4
}

/**
 * Boş durum her zaman bir sonraki adımı söyler.
 * Eylem varsa `action` tek düğme ya da bağlantı verir.
 * Eylem yoksa `actionless` nedenini yazar. Bu neden ekranda görünmez, kod incelemesi içindir.
 */
export type EmptyStateProps = EmptyStateBase & ({ action: ReactNode; actionless?: never } | { action?: never; actionless: string })

/**
 * Ortak boş durum: başlık, kısa açıklama ve tek eylem.
 * Ant Design boş görünümü kullanılmaz. Metin ve eylem ölçüleri ortak tasarım değişkenlerinden gelir.
 */
export function EmptyState({ icon, title, text, action, level = 2 }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-head">
        {icon ? <span className="empty-icon" aria-hidden>{icon}</span> : null}
        {createElement(`h${level}`, { className: 'empty-title' }, title)}
      </div>
      <p>{text}</p>
      {action ? <div className="empty-actions">{action}</div> : null}
    </div>
  )
}
