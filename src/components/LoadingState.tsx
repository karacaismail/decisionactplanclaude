import '@/styles/bilesen/LoadingState.css'
import { useEffect, useState } from 'react'
import { Button, Card, Skeleton } from 'antd'

/** Bu süreden sonra iskelet yerine açıklama ve yeniden deneme düğmesi görünür. */
export const SLOW_LOADING_MS = 10_000

/**
 * Sayfa iskeleti: görünür yükleme metni, başlık satırı ve kartlar. Veri gelene kadar gösterilir.
 * Metin hem görünür hem ekran okuyucuda okunur. Örneğin "Sayfa yükleniyor." yazar.
 * Yükleme 10 saniyeyi geçerse sahte ilerleme gösterilmez. Açıklama ve yeniden deneme düğmesi çıkar.
 * Kart sayısı 1 ile 6 arasında seçilebilir. Hareket azaltılınca iskeletin parıltısı durur.
 */
export function LoadingState({ cards = 3, label = 'Sayfa yükleniyor', onRetry }: { cards?: number; label?: string; onRetry?: () => void }) {
  const count = Math.min(6, Math.max(1, cards))
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), SLOW_LOADING_MS)
    return () => window.clearTimeout(timer)
  }, [])
  /* React.lazy başarısız ya da takılı isteği saklar. Tam yenileme bu kaydı da temizler. */
  const retry = onRetry ?? (() => window.location.reload())
  return (
    <div className="loading-state" role="status" aria-live="polite" aria-busy={!slow}>
      {slow ? (
        <div className="loading-slow">
          <p className="loading-text">Yükleme uzun sürdü. Bağlantınızı kontrol edin. Sonra yeniden deneyin.</p>
          <Button onClick={retry}>Yeniden dene</Button>
        </div>
      ) : (
        <p className="loading-text">{label}.</p>
      )}
      {slow ? null : (
        <>
          <div className="loading-head" aria-hidden>
            <Skeleton.Input active size="small" style={{ width: 'var(--size-loading-label)' }} />
            <Skeleton.Input active size="large" style={{ width: '100%' }} />
          </div>
          <div className="loading-grid" aria-hidden>
            {Array.from({ length: count }, (_, i) => (
              <Card key={i}>
                <Skeleton active title={{ width: 'var(--size-loading-title)' }} paragraph={{ rows: 3 }} />
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
