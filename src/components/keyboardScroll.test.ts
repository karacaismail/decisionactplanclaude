import { describe, expect, it } from 'vitest'
import { scrollRegionWithKeyboard } from './keyboardScroll'

/* Safari odaktaki kutuyu ok tuşuyla her zaman kaydırmaz. Kaydırmayı uygulama yapar. */
function region(scrollWidth = 1000, clientWidth = 300) {
  const el = document.createElement('div')
  Object.defineProperty(el, 'scrollWidth', { value: scrollWidth })
  Object.defineProperty(el, 'clientWidth', { value: clientWidth })
  let left = 0
  Object.defineProperty(el, 'scrollLeft', { get: () => left, set: (v: number) => { left = v } })
  document.body.append(el)
  return el
}

function press(el: HTMLElement, key: string, init: KeyboardEventInit = {}, target: HTMLElement = el) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  el.addEventListener('keydown', (e) => scrollRegionWithKeyboard(e as unknown as Parameters<typeof scrollRegionWithKeyboard>[0]), { once: true })
  target.dispatchEvent(event)
  return event
}

describe('scrollRegionWithKeyboard', () => {
  it('sağ ok kutuyu yarım genişlik kaydırır ve sayfa kaydırmasını durdurur', () => {
    const el = region()
    const event = press(el, 'ArrowRight')
    expect(el.scrollLeft).toBe(150)
    expect(event.defaultPrevented).toBe(true)
  })

  it('sol ok başta durur ve olayı tarayıcıya bırakır', () => {
    const el = region()
    const event = press(el, 'ArrowLeft')
    expect(el.scrollLeft).toBe(0)
    expect(event.defaultPrevented).toBe(false)
  })

  it('sağ ok sonda durur', () => {
    const el = region(400, 300)
    press(el, 'ArrowRight')
    press(el, 'ArrowRight')
    expect(el.scrollLeft).toBe(100)
  })

  it('iç denetimin ve değiştirici tuşun ok tuşuna dokunmaz', () => {
    const el = region()
    const inner = document.createElement('button')
    el.append(inner)
    expect(press(el, 'ArrowRight', {}, inner).defaultPrevented).toBe(false)
    expect(press(el, 'ArrowRight', { shiftKey: true }).defaultPrevented).toBe(false)
    expect(el.scrollLeft).toBe(0)
  })
})
