import '@/styles/bilesen/DtEtiket.css'
import type { ReactNode } from 'react'

export type DtEtiketTonu = 'notr' | 'uyari' | 'kapali' | 'olumlu'

/** Küçük durum etiketi. Kenar çizgisi yoktur. Renk ortak tema renklerinden gelir. */
export function DtEtiket({ ton = 'notr', children }: { ton?: DtEtiketTonu; children: ReactNode }) {
  return <span className={`dt-etiket dt-etiket-${ton}`}>{children}</span>
}
