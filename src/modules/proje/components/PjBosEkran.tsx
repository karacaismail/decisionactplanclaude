import '@/styles/bilesen/PjBosEkran.css'
import type { ReactNode } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'

/**
 * Modülün ilk sürüm ekranı. Başlık, kısa açıklama ve boş durum gösterir.
 * Sonraki sürüm bu ekranın içini doldurur.
 */
export function PjBosEkran({ title, kicker, description, emptyTitle, text, actions }: {
  title: string
  kicker: string
  description: ReactNode
  emptyTitle: string
  text: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="page pj-bos-ekran">
      <PageHeader title={title} kicker={kicker} description={description} />
      <section className="pj-bos-ekran-govde" aria-label={emptyTitle}>
        <EmptyState title={emptyTitle} text={text} actions={actions} />
      </section>
    </div>
  )
}
