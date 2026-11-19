import { useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'
import { usePlanStore } from '@/store/planStore'
import { resolveMode } from '@/theme/antdTheme'
import type { ThemeMode } from '@/theme/tokens'

/**
 * Yazdırma sırasında uygulama açık temaya geçer. Kâğıda koyu zemin ve açık yazı basılmaz.
 * Tarayıcı yazdırmadan önce beforeprint olayını gönderir. Değişiklik bu olayın içinde eşzamanlı çizilir.
 * Sayfa ekrana dönünce seçili tema geri gelir.
 */
const query = typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia('print') : null
let printing = query?.matches ?? false
const listeners = new Set<() => void>()

function set(next: boolean) {
  if (next === printing) return
  printing = next
  flushSync(() => { for (const listener of listeners) listener() })
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (listeners.size === 1 && typeof window !== 'undefined') {
    window.addEventListener('beforeprint', onBefore)
    window.addEventListener('afterprint', onAfter)
    query?.addEventListener('change', onChange)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && typeof window !== 'undefined') {
      window.removeEventListener('beforeprint', onBefore)
      window.removeEventListener('afterprint', onAfter)
      query?.removeEventListener('change', onChange)
    }
  }
}

function onBefore() { set(true) }
function onAfter() { set(query?.matches ?? false) }
function onChange(event: MediaQueryListEvent) { set(event.matches) }

/** Sayfa yazdırılıyorsa true döner. */
export function usePrintMode(): boolean {
  return useSyncExternalStore(subscribe, () => printing, () => false)
}

/**
 * Ekranda kullanılan tema. Kullanıcı seçimini, sistem temasını ve yazdırmayı birlikte değerlendirir.
 * Yazdırma sırasında her zaman açık tema döner. Tema okuyan her bileşen bu kancayı kullanır.
 */
export function useResolvedTheme(): ThemeMode {
  const pref = usePlanStore((s) => s.theme)
  const printing = usePrintMode()
  return printing ? 'light' : resolveMode(pref)
}
