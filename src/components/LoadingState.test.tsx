import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { LoadingState, SLOW_LOADING_MS } from './LoadingState'

/* React act ortamı. Testte zamanlanan güncellemeler act içinde biter. */
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

describe('yükleme durumu', () => {
  let root: Root | null = null
  let host: HTMLElement
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    act(() => root?.unmount())
    root = null
    host?.remove()
    vi.useRealTimers()
  })
  function mount(node: React.ReactNode) {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    act(() => root!.render(node))
  }

  it('yükleme metni görünür ve durum bölgesinde okunur', () => {
    mount(<LoadingState />)
    const status = host.querySelector('[role="status"]')!
    const text = status.querySelector('.loading-text')
    expect(text?.textContent).toBe('Sayfa yükleniyor.')
    expect(text?.className).not.toContain('visually-hidden')
  })

  it('panel kendi adıyla yüklenir', () => {
    mount(<LoadingState cards={1} label="Yol adayları yükleniyor" />)
    expect(host.querySelector('.loading-text')?.textContent).toBe('Yol adayları yükleniyor.')
  })

  it('uzun süren yükleme yeniden deneme yolu verir', () => {
    const retry = vi.fn()
    mount(<LoadingState onRetry={retry} />)
    expect(host.querySelector('button')).toBeNull()
    act(() => { vi.advanceTimersByTime(SLOW_LOADING_MS) })
    expect(SLOW_LOADING_MS).toBe(10_000)
    expect(host.querySelector('[role="status"]')?.textContent).toContain('Yükleme uzun sürdü.')
    const button = host.querySelector('button')!
    expect(button.textContent).toBe('Yeniden dene')
    act(() => { button.click() })
    expect(retry).toHaveBeenCalledTimes(1)
  })

  it('hareket azaltılınca iskelet parıltısı durur', () => {
    const css = readFileSync(join(__dirname, '..', 'styles', 'temel', 'temel.css'), 'utf8')
    const block = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'))
    expect(block).toMatch(/animation-iteration-count:\s*1\s*!important/)
  })
})
