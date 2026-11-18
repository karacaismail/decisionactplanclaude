import { Card, Skeleton } from 'antd'
import '@/styles/screens-karar.css'
import '@/styles/mobil-token.css'

/**
 * Sayfa iskeleti: başlık satırı ve üç kart. Veri gelene kadar gösterilir.
 * Ekran okuyucu "Sayfa yükleniyor" duyar. Kart sayısı 1 ile 6 arasında seçilebilir.
 */
export function LoadingState({ cards = 3, label = 'Sayfa yükleniyor' }: { cards?: number; label?: string }) {
  const count = Math.min(6, Math.max(1, cards))
  return (
    <div className="loading-state mt-loading-state" role="status" aria-live="polite" aria-busy="true">
      <span className="visually-hidden">{label}</span>
      <div className="loading-head" aria-hidden>
        <Skeleton.Input active size="small" style={{ width: 'var(--size-loading-label)' }} />
        <Skeleton.Input active size="large" style={{ width: '100%' }} />
        <Skeleton active title={false} paragraph={{ rows: 1, width: 'var(--size-loading-copy)' }} />
      </div>
      <div className="loading-grid" aria-hidden>
        {Array.from({ length: count }, (_, i) => (
          <Card key={i}>
            <Skeleton active title={{ width: 'var(--size-loading-title)' }} paragraph={{ rows: 3 }} />
          </Card>
        ))}
      </div>
    </div>
  )
}
