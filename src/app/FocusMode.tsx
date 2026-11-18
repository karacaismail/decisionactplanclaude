import { useEffect } from 'react'

const RADIO_STEP: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }

/**
 * Yerel radyo grubunda ok tuşu sonraki seçeneği seçer.
 * WebKit bu geçişte :focus-visible durumunu düşürür. Bu yüzden odağı betik taşır.
 * Betik odağı klavye olayının içinde taşır. Böylece görünür odak bütün tarayıcılarda korunur.
 */
function moveRadio(e: KeyboardEvent) {
  const step = RADIO_STEP[e.key]
  const radio = e.target
  if (!step || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
  if (!(radio instanceof HTMLInputElement) || radio.type !== 'radio') return
  // Segmented kendi ok tuşu davranışını yönetir. Bu bileşene karışılmaz.
  if (radio.closest('.ant-segmented')) return
  const group = radio.name
    ? [...document.querySelectorAll<HTMLInputElement>('input[type="radio"]')].filter((r) => r.name === radio.name && r.form === radio.form)
    : [...(radio.closest('[role="radiogroup"]')?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? [])]
  const enabled = group.filter((r) => !r.disabled)
  const index = enabled.indexOf(radio)
  if (index < 0 || enabled.length < 2) return
  e.preventDefault()
  const next = enabled[(index + step + enabled.length) % enabled.length]
  next.focus()
  if (!next.checked) next.click()
}

/**
 * Görünür odak modu kapalı başlar. Yalnız Tab ve Shift+Tab açar.
 * Fare ve dokunma kapatır. Ok tuşları, Escape ve yazma açmaz.
 */
export function FocusMode() {
  useEffect(() => {
    const root = document.documentElement
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') root.setAttribute('data-focus-mode', 'keyboard')
      else moveRadio(e)
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
