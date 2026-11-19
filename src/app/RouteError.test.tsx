import { afterEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router'
import { RouteErrorBoundary } from './RouteError'

/* React act ortamı. Testte zamanlanan güncellemeler act içinde biter. */
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

function Broken(): never {
  throw new Error('Ekran çizilemedi.')
}

describe('ekran hatası', () => {
  let root: Root | null = null
  let host: HTMLElement
  afterEach(() => {
    act(() => root?.unmount())
    root = null
    host?.remove()
    vi.restoreAllMocks()
  })
  function mount(hasPlan: boolean) {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host, { onCaughtError: () => undefined })
    act(() => root!.render(
      <MemoryRouter>
        <RouteErrorBoundary routeKey="a" hasPlan={hasPlan}><Broken /></RouteErrorBoundary>
      </MemoryRouter>,
    ))
  }

  it('ne olduğunu, verinin durumunu ve sonraki adımı yalın yazar', () => {
    mount(true)
    const text = host.textContent ?? ''
    expect(text).toContain('Ekran açılamadı')
    expect(text).toContain('Planlarınız güvende.')
    expect(host.querySelector('button')?.textContent).toBe('Sayfayı yeniden yükle')
  })

  it('plan açıkken panoya dönüş bağlantısı verir', () => {
    mount(true)
    const link = host.querySelector('a')!
    expect(link.textContent).toBe('Panoya dön')
    expect(link.getAttribute('href')).toBe('/ozet')
  })

  it('plan yokken planlar ekranına dönüş bağlantısı verir', () => {
    mount(false)
    const link = host.querySelector('a')!
    expect(link.textContent).toBe('Planlara dön')
    expect(link.getAttribute('href')).toBe('/')
  })
})
