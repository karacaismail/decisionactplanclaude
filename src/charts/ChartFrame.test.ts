import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import * as react from 'react'
import { createRoot, type Root, type RootOptions } from 'react-dom/client'
import type { ComponentProps } from 'react'
import * as buttonModule from 'antd/es/button'
import * as cardModule from 'antd/es/card'
import * as segmentedModule from 'antd/es/segmented'
import * as tableIconModule from '@phosphor-icons/react/dist/csr/Table'
import * as chartIconModule from '@phosphor-icons/react/dist/csr/ChartBar'

// Keep real dependencies stable while each test receives a fresh lazy import.
vi.doMock('react', () => react)
vi.doMock('antd/es/button', () => buttonModule)
vi.doMock('antd/es/card', () => cardModule)
vi.doMock('antd/es/segmented', () => segmentedModule)
vi.doMock('@phosphor-icons/react/dist/csr/Table', () => tableIconModule)
vi.doMock('@phosphor-icons/react/dist/csr/ChartBar', () => chartIconModule)

type Frame = typeof import('./ChartFrame').ChartFrame
type ChartProps = ComponentProps<typeof import('./EChart').default>
type CaughtErrorHandler = NonNullable<RootOptions['onCaughtError']>
type ObserverRecord = {
  callback: IntersectionObserverCallback
  options?: IntersectionObserverInit
  target?: Element
  observer: IntersectionObserver
  disconnect: Mock<() => void>
}
type LayoutObserverRecord = {
  callback: ResizeObserverCallback
  observer: ResizeObserver
  targets: Set<Element>
  disconnect: Mock<() => void>
}

let ChartFrame: Frame
let root: Root | undefined
let container: HTMLDivElement
let setupAttempt: { cancelled: boolean }
let observers: ObserverRecord[]
let failure: 'chunk' | 'render' | 'effect' | undefined
let releaseChunk: (() => void) | undefined
let chunkGate: Promise<void> | undefined
let loadChart: Mock<() => void>
let renderChart: Mock<(props: ChartProps) => void>
let caughtError: Mock<CaughtErrorHandler>

const props: ComponentProps<Frame> = {
  title: 'Aylık ölçümler',
  summary: 'Tablo iki ayın sonucunu gösterir.',
  option: { series: [{ data: [12, 18] }] },
  table: { head: ['Ay', 'Sonuç'], rows: [['Ocak', 12], ['Şubat', 18]] },
}

beforeEach(async () => {
  const attempt = { cancelled: false }
  setupAttempt = attempt
  root = undefined
  container = document.createElement('div')
  vi.resetModules()
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  })
  vi.stubGlobal('matchMedia', vi.fn((media: string) => ({
    matches: false, media, onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(),
    addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
  })))
  observers = []
  vi.stubGlobal('IntersectionObserver', class {
    record: ObserverRecord
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      this.record = {
        callback, options, observer: this as unknown as IntersectionObserver,
        disconnect: vi.fn<() => void>(),
      }
      observers.push(this.record)
    }
    observe(target: Element) { this.record.target = target }
    disconnect() { this.record.disconnect() }
  })
  failure = undefined
  releaseChunk = undefined
  chunkGate = undefined
  loadChart = vi.fn<() => void>()
  renderChart = vi.fn<(props: ChartProps) => void>()
  caughtError = vi.fn<CaughtErrorHandler>()
  vi.doMock('./EChart', async () => {
    loadChart()
    await chunkGate
    if (failure === 'chunk') throw new Error('Grafik dosyası yüklenemedi.')
    return {
      default: function Chart(chartProps: ChartProps) {
        renderChart(chartProps)
        react.useEffect(() => {
          if (failure === 'effect') throw new Error('Grafik başlatılamadı.')
        }, [])
        if (failure === 'render') throw new Error('Grafik çizilemedi.')
        return react.createElement('div', { role: 'img', 'aria-label': chartProps.ariaLabel })
      },
    }
  })
  const frameModule = await import('./ChartFrame')
  if (attempt.cancelled) return
  ChartFrame = frameModule.ChartFrame
  document.body.append(container)
  root = createRoot(container, { onCaughtError: caughtError })
})

async function cleanupFixture() {
  setupAttempt.cancelled = true
  const mountedRoot = root
  root = undefined
  try {
    if (mountedRoot) await react.act(async () => { mountedRoot.unmount() })
  } finally {
    container?.remove()
    vi.doUnmock('./EChart')
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  }
}

afterEach(cleanupFixture)

function getRoot() {
  if (!root) throw new Error('Test kökü oluşturulmadı.')
  return root
}

async function mount(overrides: Partial<ComponentProps<Frame>> = {}) {
  await react.act(async () => { getRoot().render(react.createElement(ChartFrame, { ...props, ...overrides })) })
}

async function intersect(isIntersecting: boolean, record = observers[0]) {
  expect(record?.target).toBeDefined()
  await react.act(async () => {
    const entry = { target: record.target, isIntersecting } as IntersectionObserverEntry
    record.callback([entry], record.observer)
  })
}

function toggle(label: 'Grafik' | 'Tablo') {
  const control = Array.from(container.querySelectorAll('label'))
    .find((node) => node.textContent === label)?.querySelector('input')
  expect(control).toBeInstanceOf(HTMLInputElement)
  return control as HTMLInputElement
}

function semanticTable() {
  const table = container.querySelector('table')
  expect(table).not.toBeNull()
  expect(table?.closest('[hidden], [aria-hidden="true"], [inert]')).toBeNull()
  expect(table?.querySelector('caption')?.textContent).toBe(`${props.title} verileri`)
  expect(Array.from(table!.querySelectorAll('thead th[scope="col"]'), (cell) => cell.textContent))
    .toEqual(props.table.head)
  expect(Array.from(table!.querySelectorAll('tbody tr'), (row) =>
    Array.from(row.children, (cell) => cell.textContent))).toEqual([['Ocak', '12'], ['Şubat', '18']])
  return table!
}

function resizeEntry(target: Element): ResizeObserverEntry {
  return {
    target, contentRect: new DOMRect(),
    borderBoxSize: [], contentBoxSize: [], devicePixelContentBoxSize: [],
  }
}

function fallbackViewport(initial = new DOMRect(0, 900, 300, 240)) {
  vi.stubGlobal('IntersectionObserver', undefined)
  vi.stubGlobal('innerWidth', 320)
  vi.stubGlobal('innerHeight', 568)
  vi.stubGlobal('visualViewport', undefined)
  const layoutObservers: LayoutObserverRecord[] = []
  vi.stubGlobal('ResizeObserver', class {
    record: LayoutObserverRecord
    constructor(callback: ResizeObserverCallback) {
      const targets = new Set<Element>()
      this.record = {
        callback, targets, observer: this as unknown as ResizeObserver,
        disconnect: vi.fn<() => void>(() => { targets.clear() }),
      }
      layoutObservers.push(this.record)
    }
    observe(target: Element) { this.record.targets.add(target) }
    unobserve(target: Element) { this.record.targets.delete(target) }
    disconnect() { this.record.disconnect() }
  })
  let rect = initial
  const measure = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    return this.tagName === 'FIGURE' ? rect : new DOMRect(0, 0, 320, 568)
  })
  const pending = new Map<number, FrameRequestCallback>()
  let nextId = 0
  const request = vi.fn((callback: FrameRequestCallback) => {
    pending.set(++nextId, callback)
    return nextId
  })
  const cancel = vi.fn((id: number) => { pending.delete(id) })
  vi.stubGlobal('requestAnimationFrame', request)
  vi.stubGlobal('cancelAnimationFrame', cancel)
  return {
    measure, request, cancel, pending, layoutObservers,
    move(next: DOMRect) { rect = next },
    async resize(target: Element) {
      await react.act(async () => {
        for (const record of layoutObservers) {
          if (record.targets.has(target)) {
            record.callback([resizeEntry(target)], record.observer)
          }
        }
      })
    },
    async flush() {
      const callbacks = [...pending.values()]
      pending.clear()
      await react.act(async () => { callbacks.forEach((callback) => callback(0)) })
    },
  }
}

describe('ChartFrame', () => {
  it('React kökü yokken temizleme hata vermez ve test alanını kaldırır', async () => {
    await cleanupFixture()
    expect(container.isConnected).toBe(false)
    await expect(cleanupFixture()).resolves.toBeUndefined()
  })

  it('grafik ekrana girmeden dosyayı yüklemez ve çizmez', async () => {
    await mount()
    expect(loadChart).not.toHaveBeenCalled()
    expect(renderChart).not.toHaveBeenCalled()
    expect(observers).toHaveLength(1)
    const options = observers[0].options
    expect(options?.root ?? null).toBeNull()
    expect((options?.rootMargin ?? '0px').split(/\s+/).every((value) => parseFloat(value) <= 0)).toBe(true)
    await intersect(false)
    expect(loadChart).not.toHaveBeenCalled()
    await intersect(true)
    expect(loadChart).toHaveBeenCalledTimes(1)
    expect(container.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe(props.title)
    expect(renderChart).toHaveBeenLastCalledWith({ option: props.option, height: 240, ariaLabel: props.title })
    expect(observers[0].disconnect).toHaveBeenCalled()
    await intersect(false)
    expect(container.querySelector('[role="img"]')).not.toBeNull()
  })

  it.each(['card', 'plain'] as const)('%s görünümünde ekran okuyucu aynı tabloyu sürekli bulur', async (frame) => {
    await mount({ frame, height: 320 })
    const table = semanticTable()
    expect(table.closest('.sr-only')).not.toBeNull()
    expect(table.querySelectorAll('tbody th[scope="row"]')).toHaveLength(2)
    const control = toggle('Tablo')
    await react.act(async () => { control.focus(); control.click() })
    expect(semanticTable()).toBe(table)
    expect(table.closest('.sr-only')).toBeNull()
    expect(document.activeElement).toBe(control)
    expect(control.checked).toBe(true)
    await intersect(true)
    expect(loadChart).not.toHaveBeenCalled()
    await react.act(async () => { toggle('Grafik').click() })
    expect(semanticTable()).toBe(table)
    expect(table.closest('.sr-only')).not.toBeNull()
    expect(renderChart).toHaveBeenLastCalledWith({ option: props.option, height: 320, ariaLabel: props.title })
  })

  it('görünürlük API desteği yoksa ekrana girene kadar grafiği yüklemez', async () => {
    const viewport = fallbackViewport()
    await mount()
    expect(loadChart).not.toHaveBeenCalled()
    semanticTable()
    viewport.move(new DOMRect(0, 100, 300, 240))
    window.dispatchEvent(new Event('scroll'))
    await viewport.flush()
    expect(loadChart).toHaveBeenCalledTimes(1)
    expect(container.querySelector('[role="img"]')).not.toBeNull()
    viewport.measure.mockClear()
    window.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('resize'))
    await viewport.flush()
    expect(viewport.measure).not.toHaveBeenCalled()
  })

  it('görünürlük API desteği yoksa başlangıçta görünen grafiği yükler', async () => {
    fallbackViewport(new DOMRect(0, 100, 300, 240))
    await mount()
    expect(loadChart).toHaveBeenCalledTimes(1)
    expect(container.querySelector('[role="img"]')).not.toBeNull()
    semanticTable()
  })

  it('yedek denetim boş alanı ve ekranın dört dış kenarını görünür saymaz', async () => {
    const viewport = fallbackViewport()
    await mount()
    const hiddenRects = [
      new DOMRect(-300, 0, 300, 240), new DOMRect(320, 0, 300, 240),
      new DOMRect(0, -240, 300, 240), new DOMRect(0, 568, 300, 240),
      new DOMRect(0, 0, 0, 240), new DOMRect(0, 0, 300, 0),
    ]
    for (const rect of hiddenRects) {
      viewport.move(rect)
      window.dispatchEvent(new Event('resize'))
      await viewport.flush()
      expect(loadChart).not.toHaveBeenCalled()
    }
    viewport.move(new DOMRect(0, 567, 300, 240))
    window.dispatchEvent(new Event('resize'))
    await viewport.flush()
    expect(loadChart).toHaveBeenCalledTimes(1)
  })

  it('yedek denetim iç kaydırma alanının kırptığı grafiği bekletir', async () => {
    const viewport = fallbackViewport(new DOMRect(0, 300, 300, 240))
    container.style.overflowY = 'auto'
    Object.defineProperties(container, {
      clientWidth: { configurable: true, value: 320 },
      clientHeight: { configurable: true, value: 150 },
    })
    await mount()
    expect(loadChart).not.toHaveBeenCalled()
    viewport.move(new DOMRect(0, 149, 300, 240))
    container.dispatchEvent(new Event('scroll', { bubbles: false }))
    await viewport.flush()
    expect(loadChart).toHaveBeenCalledTimes(1)
  })

  it('üst içerik daralınca kaydırma olmadan görünen grafiği yükler ve gözlemi kapatır', async () => {
    const viewport = fallbackViewport()
    container.style.height = '568px'
    await react.act(async () => {
      getRoot().render(react.createElement(react.Fragment, null,
        react.createElement('section', { 'data-above': true }, 'Üst içerik'),
        react.createElement('div', null, react.createElement(ChartFrame, props)),
      ))
    })
    const above = container.querySelector('[data-above]')!
    const record = viewport.layoutObservers.find((item) => item.targets.has(above))!
    await viewport.resize(above)
    await viewport.flush()
    expect(loadChart).not.toHaveBeenCalled()
    expect(viewport.pending.size).toBe(0)
    viewport.move(new DOMRect(0, 100, 300, 240))
    await viewport.resize(above)
    await viewport.flush()
    expect(loadChart).toHaveBeenCalledTimes(1)
    expect(container.querySelector('[role="img"]')).not.toBeNull()
    expect(record).toBeDefined()
    expect(record.disconnect).toHaveBeenCalledTimes(1)
    expect(record.targets.size).toBe(0)
    viewport.measure.mockClear()
    record.callback([resizeEntry(above)], record.observer)
    window.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('resize'))
    await viewport.flush()
    expect(viewport.measure).not.toHaveBeenCalled()
  })

  it('iç kaydırma alanı büyüyünce görünen grafiği pencere olayı olmadan yükler', async () => {
    const viewport = fallbackViewport(new DOMRect(0, 300, 300, 240))
    container.style.overflowY = 'auto'
    let height = 150
    Object.defineProperties(container, {
      clientWidth: { configurable: true, value: 320 },
      clientHeight: { configurable: true, get: () => height },
    })
    await mount()
    await viewport.resize(container)
    await viewport.flush()
    expect(loadChart).not.toHaveBeenCalled()
    height = 350
    await viewport.resize(container)
    await viewport.flush()
    expect(loadChart).toHaveBeenCalledTimes(1)
  })

  it('yedek denetim kaldırılınca bekleyen çizim ve dinleyiciler temizlenir', async () => {
    const viewport = fallbackViewport()
    await mount()
    const record = viewport.layoutObservers.find((item) => item.targets.has(container))!
    viewport.request.mockClear()
    await viewport.resize(container)
    window.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('resize'))
    expect(viewport.request).toHaveBeenCalledTimes(1)
    const queued = [...viewport.pending.values()]
    await react.act(async () => { getRoot().render(null) })
    expect(viewport.cancel).toHaveBeenCalled()
    expect(viewport.pending.size).toBe(0)
    expect(record.disconnect).toHaveBeenCalledTimes(1)
    expect(record.targets.size).toBe(0)
    viewport.measure.mockClear()
    viewport.move(new DOMRect(0, 100, 300, 240))
    window.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('resize'))
    record.callback([resizeEntry(container)], record.observer)
    await react.act(async () => { queued.forEach((callback) => callback(0)) })
    await viewport.flush()
    expect(viewport.measure).not.toHaveBeenCalled()
    expect(loadChart).not.toHaveBeenCalled()
  })

  it('yedek denetim çerçeve değişince eski bekleyen işi iptal eder', async () => {
    const viewport = fallbackViewport()
    await mount()
    const record = viewport.layoutObservers.find((item) => item.targets.has(container))!
    await viewport.resize(container)
    const queued = [...viewport.pending.values()]
    await mount({ frame: 'plain' })
    expect(viewport.cancel).toHaveBeenCalled()
    expect(record.disconnect).toHaveBeenCalledTimes(1)
    expect(record.targets.size).toBe(0)
    viewport.move(new DOMRect(0, 100, 300, 240))
    record.callback([resizeEntry(container)], record.observer)
    await react.act(async () => { queued.forEach((callback) => callback(0)) })
    await viewport.flush()
    expect(loadChart).not.toHaveBeenCalled()
    await viewport.resize(container)
    await viewport.flush()
    expect(loadChart).toHaveBeenCalledTimes(1)
  })

  it('boyut gözlemcisi de yoksa kaydırmayla görünürlüğü denetlemeyi sürdürür', async () => {
    const viewport = fallbackViewport()
    vi.stubGlobal('ResizeObserver', undefined)
    await mount()
    expect(loadChart).not.toHaveBeenCalled()
    viewport.move(new DOMRect(0, 100, 300, 240))
    window.dispatchEvent(new Event('scroll'))
    await viewport.flush()
    expect(loadChart).toHaveBeenCalledTimes(1)
  })

  it('yedek denetim çizim zamanlayıcısı olmadan da ekran dışındaki grafiği bekletir', async () => {
    const viewport = fallbackViewport()
    vi.stubGlobal('requestAnimationFrame', undefined)
    vi.stubGlobal('cancelAnimationFrame', undefined)
    await mount()
    expect(loadChart).not.toHaveBeenCalled()
    viewport.move(new DOMRect(0, 100, 300, 240))
    await react.act(async () => { window.dispatchEvent(new Event('resize')) })
    expect(loadChart).toHaveBeenCalledTimes(1)
  })

  it('yedek denetim büyütülmüş ekranın görünen alanını ve kaymasını izler', async () => {
    const viewport = fallbackViewport(new DOMRect(250, 100, 50, 100))
    const visualViewport = Object.assign(new EventTarget(), {
      offsetLeft: 0, offsetTop: 0, width: 200, height: 300,
    })
    vi.stubGlobal('visualViewport', visualViewport)
    await mount()
    expect(loadChart).not.toHaveBeenCalled()
    visualViewport.offsetLeft = 100
    visualViewport.dispatchEvent(new Event('scroll'))
    await viewport.flush()
    expect(loadChart).toHaveBeenCalledTimes(1)
    viewport.measure.mockClear()
    visualViewport.dispatchEvent(new Event('resize'))
    await viewport.flush()
    expect(viewport.measure).not.toHaveBeenCalled()
  })

  it('yükleme sürerken tabloya geçilince geç gelen grafik tabloyu değiştirmez', async () => {
    chunkGate = new Promise<void>((resolve) => { releaseChunk = resolve })
    await mount()
    await intersect(true)
    expect(loadChart).toHaveBeenCalledTimes(1)
    expect(container.querySelector('[role="status"]')?.textContent).toContain('Grafik yükleniyor.')
    const control = toggle('Tablo')
    await react.act(async () => { control.focus(); control.click() })
    await react.act(async () => { releaseChunk?.() })
    expect(container.querySelector('[role="img"]')).toBeNull()
    expect(semanticTable().closest('.sr-only')).toBeNull()
    expect(document.activeElement).toBe(control)
  })

  it.each(['chunk', 'render', 'effect'] as const)('%s hatasında tablo korunur ve görünür tablo açılır', async (mode) => {
    failure = mode
    await mount()
    const table = semanticTable()
    const control = toggle('Grafik')
    await react.act(async () => { control.focus() })
    await intersect(true)
    expect(caughtError).toHaveBeenCalled()
    expect(semanticTable()).toBe(table)
    expect(document.activeElement).toBe(control)
    expect(container.textContent).toContain('Grafik yüklenemedi.')
    const fallback = Array.from(container.querySelectorAll('button'))
      .find((button) => button.textContent === 'Tabloyu göster')
    expect(fallback).toBeDefined()
    await react.act(async () => { fallback!.focus(); fallback!.click() })
    expect(semanticTable()).toBe(table)
    expect(table.closest('.sr-only')).toBeNull()
    expect(toggle('Tablo').checked).toBe(true)
    expect(document.activeElement?.contains(table)).toBe(true)
  })

  it('bileşen kaldırılınca görünürlük gözlemcisini kapatır', async () => {
    await mount()
    expect(observers).toHaveLength(1)
    await react.act(async () => { getRoot().render(null) })
    expect(observers[0].disconnect).toHaveBeenCalledTimes(1)
    expect(loadChart).not.toHaveBeenCalled()
  })

  it('çerçeve türü değişince yeni grafik alanını gözlemler', async () => {
    await mount()
    const first = observers[0]
    await mount({ frame: 'plain' })
    expect(first.disconnect).toHaveBeenCalled()
    expect(observers).toHaveLength(2)
    expect(observers[1].target?.isConnected).toBe(true)
    await intersect(true, first)
    expect(loadChart).not.toHaveBeenCalled()
    await intersect(true, observers[1])
    expect(loadChart).toHaveBeenCalledTimes(1)
  })

  it('ortak dosya yüklense bile ikinci grafik kendi görünürlüğünü bekler', async () => {
    await react.act(async () => {
      getRoot().render(react.createElement(react.Fragment, null,
        react.createElement(ChartFrame, props),
        react.createElement(ChartFrame, { ...props, title: 'Yıllık ölçümler' }),
      ))
    })
    expect(observers).toHaveLength(2)
    await intersect(true, observers[0])
    expect(container.querySelectorAll('[role="img"]')).toHaveLength(1)
    await intersect(true, observers[1])
    expect(container.querySelectorAll('[role="img"]')).toHaveLength(2)
    expect(loadChart).toHaveBeenCalledTimes(1)
  })

  it('ok tuşuyla görünüm değişirken kontrolün odağı kaybolmaz', async () => {
    await mount()
    const control = toggle('Grafik')
    await react.act(async () => {
      control.focus()
      control.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    })
    expect(toggle('Tablo').checked).toBe(true)
    expect(document.activeElement).toBe(control)
    expect(semanticTable().closest('.sr-only')).toBeNull()
  })
})
