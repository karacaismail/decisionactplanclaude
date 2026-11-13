import { useEffect } from 'react'

/**
 * Görünür odak modu kapalı başlar. Yalnız Tab ve Shift+Tab açar.
 * Fare ve dokunma kapatır. Ok tuşları, Escape ve yazma açmaz.
 */
export function FocusMode() {
  useEffect(() => {
    const root = document.documentElement
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') root.setAttribute('data-focus-mode', 'keyboard')
    }
    const onPointer = () => root.removeAttribute('data-focus-mode')
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('pointerdown', onPointer, true)
    window.addEventListener('touchstart', onPointer, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      window.removeEventListener('pointerdown', onPointer, true)
      window.removeEventListener('touchstart', onPointer, true)
    }
  }, [])
  return null
}
