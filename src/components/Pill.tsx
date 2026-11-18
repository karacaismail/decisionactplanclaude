import '@/styles/bilesen/Pill.css'
import type { ReactNode } from 'react'
import { isNewPage } from '@/data/newPages'
/**
 * Küçük, hap biçimli durum etiketi. Yazı en az 14 piksel olur.
 * Kenar çizgisi kullanılmaz. Renk tonu ortak tema renklerinden gelir.
 */
export function Pill({ tone = 'info', className, children }: { tone?: 'info'; className?: string; children: ReactNode }) {
  return <span className={['pill', `pill-${tone}`, className].filter(Boolean).join(' ')}>{children}</span>
}

/** Sayfa yeniyse "Yeni" etiketini gösterir. Yeni değilse hiçbir şey çizmez. */
export function NewPill({ path }: { path: string }) {
  if (!isNewPage(path)) return null
  return <Pill className="pill-new">Yeni</Pill>
}
