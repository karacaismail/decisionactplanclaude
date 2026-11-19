import { afterEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { usePlanStore } from '@/store/planStore'
import { useResolvedTheme } from './printMode'

/* React act ortamı. Testte zamanlanan güncellemeler act içinde biter. */
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

function Probe() {
  return <span>{useResolvedTheme()}</span>
}

describe('yazdırma teması', () => {
  let root: Root | null = null
  let host: HTMLElement
  afterEach(() => {
    act(() => root?.unmount())
    root = null
    host?.remove()
  })
  function mount() {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    act(() => root!.render(<Probe />))
  }

  it('beforeprint olayında açık temaya aynı görevde geçer, afterprint seçili temayı geri getirir', () => {
    usePlanStore.setState({ theme: 'dark' })
    mount()
    expect(host.textContent).toBe('dark')
    // act kullanılmaz. Tarayıcı yazdırma düzenini olay döner dönmez kurar.
    window.dispatchEvent(new Event('beforeprint'))
    expect(host.textContent).toBe('light')
    window.dispatchEvent(new Event('afterprint'))
    expect(host.textContent).toBe('dark')
  })

  it('bileşen kalkınca olay dinleyicisi de kalkar', () => {
    usePlanStore.setState({ theme: 'dark' })
    mount()
    act(() => root!.unmount())
    root = null
    expect(() => window.dispatchEvent(new Event('beforeprint'))).not.toThrow()
    window.dispatchEvent(new Event('afterprint'))
    mount()
    expect(host.textContent).toBe('dark')
  })
})
