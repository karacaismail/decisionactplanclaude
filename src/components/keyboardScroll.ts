/** Ok tuşu olayının kaydırma için gereken kısmı. React ve DOM olayı bu biçime uyar. */
export type ScrollKeyEvent = {
  key: string
  target: EventTarget | null
  currentTarget: EventTarget | null
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
  preventDefault: () => void
}

/**
 * Odaktaki yatay kutuyu sol ve sağ okla yarım genişlik kaydırır.
 * Safari bu kaydırmayı her zaman kendisi yapmaz. Bu yüzden kaydırmayı uygulama yapar.
 * Oklar yalnız kutunun kendisi odaktayken çalışır. İç denetimlerin tuşları korunur.
 */
export function scrollRegionWithKeyboard(event: ScrollKeyEvent) {
  if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
  if (!(event.currentTarget instanceof HTMLElement)) return
  const element = event.currentTarget
  const maximum = element.scrollWidth - element.clientWidth
  if (maximum <= 0) return
  const direction = event.key === 'ArrowRight' ? 1 : -1
  const next = Math.max(0, Math.min(maximum, element.scrollLeft + direction * element.clientWidth / 2))
  if (next === element.scrollLeft) return
  event.preventDefault()
  element.scrollLeft = next
}
