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
  function mount(hasPlan: boolean, { pathname = '/yontemler', unsaved = false, onDownload = () => undefined }: { pathname?: string; unsaved?: boolean; onDownload?: () => void } = {}) {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host, { onCaughtError: () => undefined })
    act(() => root!.render(
      <MemoryRouter>
        <RouteErrorBoundary routeKey="a" hasPlan={hasPlan} pathname={pathname} unsaved={unsaved} onDownload={onDownload}><Broken /></RouteErrorBoundary>
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

  it('panonun kendisi açılamazsa planlar ekranına döndürür', () => {
    mount(true, { pathname: '/ozet' })
    expect(host.querySelector('a')?.getAttribute('href')).toBe('/')
  })

  it('planlar ekranı açılamazsa aynı ekrana bağlantı vermez', () => {
    mount(false, { pathname: '/' })
    expect(host.querySelector('a')).toBeNull()
    expect(host.querySelector('button')?.textContent).toBe('Sayfayı yeniden yükle')
  })

  it('kaydedilmemiş değişiklik varsa güvende demez, önce kopya indirmeyi önerir', () => {
    const download = vi.fn()
    mount(true, { unsaved: true, onDownload: download })
    const text = host.textContent ?? ''
    expect(text).not.toContain('Planlarınız güvende.')
    expect(text).toContain('Son değişiklikleriniz yalnız bu sekmede duruyor.')
    const buttons = [...host.querySelectorAll('button')]
    expect(buttons.map((b) => b.textContent)).toEqual(['Kopyamı indir (JSON)', 'Sayfayı yeniden yükle'])
    act(() => buttons[0].click())
    expect(download).toHaveBeenCalledTimes(1)
  })
})
