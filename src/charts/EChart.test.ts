import { act, Component, createElement, StrictMode, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ECBasicOption } from 'echarts/types/dist/shared'
import { font, motion } from '@/theme/tokens'
import EChart from './EChart'

const mocks = vi.hoisted(() => ({
  init: vi.fn(),
  token: {
    colorText: '#111111',
    colorTextSecondary: '#444444',
    colorBorder: '#cccccc',
    colorSuccess: '#006600',
    colorWarning: '#886600',
    colorError: '#990000',
  },
}))

vi.mock('antd', () => ({ theme: { useToken: () => ({ token: mocks.token }) } }))
vi.mock('echarts/core', () => ({ init: mocks.init, use: vi.fn() }))

function makeChart() {
  let disposed = false
  return {
    setOption: vi.fn<(option: ECBasicOption, notMerge?: boolean) => void>(),
    resize: vi.fn(),
    dispose: vi.fn(() => { disposed = true }),
    isDisposed: () => disposed,
  }
}

type Chart = ReturnType<typeof makeChart>
type MotionListener = (event: MediaQueryListEvent) => void

let container: HTMLDivElement
let root: Root | undefined
let reducedMotion: boolean
let charts: Chart[]
let observers: TestResizeObserver[]
let motionListeners: Set<MotionListener>
let addedListeners: MotionListener[]
let removeListener: ReturnType<typeof vi.fn>

class TestResizeObserver implements ResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()

  constructor(private callback: ResizeObserverCallback) {
    observers.push(this)
  }

  notify() {
    this.callback([], this)
  }
}

class TestChartBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    return this.state.error ? createElement('p', { role: 'status' }, 'Tabloyu göster') : this.props.children
  }
}

function changeMotion(matches: boolean) {
  reducedMotion = matches
  const event = { matches, media: '(prefers-reduced-motion: reduce)' } as MediaQueryListEvent
  for (const listener of motionListeners) listener(event)
}

async function renderChart(option: unknown, height = 240, ariaLabel = 'Karar grafiği') {
  await act(async () => {
    root?.render(createElement(EChart, { option, height, ariaLabel }))
  })
}

function lastOption(chart = charts.at(-1)!) {
  return chart.setOption.mock.calls.at(-1)?.[0]
}

beforeEach(() => {
  charts = []
  observers = []
  motionListeners = new Set()
  addedListeners = []
  reducedMotion = false
  removeListener = vi.fn((_type: string, listener: MotionListener) => motionListeners.delete(listener))
  mocks.init.mockReset()
  mocks.init.mockImplementation(() => {
    const chart = makeChart()
    charts.push(chart)
    return chart
  })
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('ResizeObserver', TestResizeObserver)
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    get matches() { return reducedMotion },
    media: query,
    addEventListener: vi.fn((_type: string, listener: MotionListener) => {
      addedListeners.push(listener)
      motionListeners.add(listener)
    }),
    removeEventListener: removeListener,
  })))
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => { root?.unmount() })
  root = undefined
  container.remove()
  vi.unstubAllGlobals()
})

describe('EChart hareket tercihi ve yaşam döngüsü', () => {
  it('ilk seçenek yüklemesi başarısız olursa grafiği kapatır ve aynı hatayı iletir', async () => {
    const failure = new Error('İlk grafik çizimi başarısız oldu.')
    const chart = makeChart()
    chart.setOption.mockImplementation(() => { throw failure })
    mocks.init.mockReturnValueOnce(chart)

    await expect(renderChart({ series: [] })).rejects.toBe(failure)

    expect(chart.dispose).toHaveBeenCalledTimes(1)
    expect(chart.isDisposed()).toBe(true)
    expect(motionListeners.size).toBe(0)
    await act(async () => { root?.unmount() })
    root = undefined
    expect(chart.dispose).toHaveBeenCalledTimes(1)
  })

  it('boyut gözlemcisinin kurulumu başarısız olursa tüm kaynakları temizler', async () => {
    const failure = new Error('Boyut gözlemcisi başlatılamadı.')
    vi.stubGlobal('ResizeObserver', class extends TestResizeObserver {
      observe = vi.fn(() => { throw failure })
    })

    await expect(renderChart({ series: [] })).rejects.toBe(failure)

    expect(charts[0].dispose).toHaveBeenCalledTimes(1)
    expect(observers[0].disconnect).toHaveBeenCalledTimes(1)
    expect(motionListeners.size).toBe(0)
    observers[0].notify()
    addedListeners[0]?.({ matches: true } as MediaQueryListEvent)
    expect(charts[0].resize).not.toHaveBeenCalled()
    expect(charts[0].setOption).toHaveBeenCalledTimes(1)
  })

  it('canlı hareket güncellemesi başarısız olursa temizler ve hatayı üst bileşene iletir', async () => {
    const caught = vi.fn()
    await act(async () => { root?.unmount() })
    root = createRoot(container, { onCaughtError: caught })
    await act(async () => {
      root?.render(createElement(TestChartBoundary, null, createElement(EChart, {
        option: { series: [] }, height: 240, ariaLabel: 'Karar grafiği',
      })))
    })
    const chart = charts[0]
    const failure = new Error('Hareket tercihi uygulanamadı.')
    chart.setOption.mockImplementation(() => { throw failure })

    await act(async () => { changeMotion(true) })

    expect(caught.mock.calls[0]?.[0]).toBe(failure)
    expect(container.querySelector('[role="status"]')?.textContent).toBe('Tabloyu göster')
    expect(chart.dispose).toHaveBeenCalledTimes(1)
    expect(observers[0].disconnect).toHaveBeenCalledTimes(1)
    expect(motionListeners.size).toBe(0)
    observers[0].notify()
    addedListeners[0]?.({ matches: false } as MediaQueryListEvent)
    expect(chart.resize).not.toHaveBeenCalled()
    expect(chart.setOption).toHaveBeenCalledTimes(2)
    await act(async () => { root?.unmount() })
    root = undefined
    expect(chart.dispose).toHaveBeenCalledTimes(1)
  })

  it('canlı boyut güncellemesi hata verirse temizler ve geç bildirimleri yok sayar', async () => {
    const caught = vi.fn()
    await act(async () => { root?.unmount() })
    root = createRoot(container, { onCaughtError: caught })
    await act(async () => {
      root?.render(createElement(TestChartBoundary, null, createElement(EChart, {
        option: { series: [] }, height: 240, ariaLabel: 'Karar grafiği',
      })))
    })
    const chart = charts[0]
    const observer = observers[0]
    const motionListener = addedListeners[0]
    const failure = new Error('Grafik boyutu güncellenemedi.')
    chart.resize.mockImplementation(() => { throw failure })

    await act(async () => {
      expect(() => observer.notify()).not.toThrow()
      expect(chart.dispose).toHaveBeenCalledTimes(1)
      expect(observer.disconnect).toHaveBeenCalledTimes(1)
      expect(removeListener).toHaveBeenCalledWith('change', motionListener)
      expect(motionListeners.size).toBe(0)
    })

    expect(caught.mock.calls[0]?.[0]).toBe(failure)
    expect(container.querySelector('[role="status"]')?.textContent).toBe('Tabloyu göster')
    observer.notify()
    motionListener({ matches: true } as MediaQueryListEvent)
    expect(chart.resize).toHaveBeenCalledTimes(1)
    expect(chart.setOption).toHaveBeenCalledTimes(1)
    await act(async () => { root?.unmount() })
    root = undefined
    expect(chart.dispose).toHaveBeenCalledTimes(1)
    expect(observer.disconnect).toHaveBeenCalledTimes(1)
  })

  it('ilk çizimde hareket azaltma tercihini seri seçeneklerine de uygular', async () => {
    reducedMotion = true
    const series = Object.freeze({ type: 'bar', data: [1, 2], animation: true })
    const option = Object.freeze({ animation: true, series: Object.freeze([series]) })

    await renderChart(option)

    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
    expect(lastOption()).toMatchObject({
      animation: false,
      series: [{ type: 'bar', data: [1, 2], animation: false }],
    })
    expect(option.animation).toBe(true)
    expect(series.animation).toBe(true)
  })

  it('tercih değişince aynı grafiği günceller ve normal hareketi geri getirir', async () => {
    const option = { series: { type: 'line', data: [3, 5], animation: true } }
    await renderChart(option)
    const chart = charts[0]
    expect(lastOption()).toMatchObject({
      animationDuration: motion.page,
      animationDurationUpdate: motion.page,
      animationEasing: 'cubicInOut',
      animationEasingUpdate: 'cubicInOut',
      textStyle: { fontFamily: font.family, fontSize: font.helper },
    })

    await act(async () => { changeMotion(true) })
    expect(lastOption()).toMatchObject({ animation: false, series: { animation: false } })
    await act(async () => { changeMotion(false) })
    expect(lastOption()).toMatchObject({
      animationDuration: motion.page,
      animationDurationUpdate: motion.page,
      series: option.series,
    })
    expect(lastOption()?.animation).not.toBe(false)
    expect(chart.setOption).toHaveBeenCalledTimes(3)
    expect(mocks.init).toHaveBeenCalledTimes(1)
    expect(chart.dispose).not.toHaveBeenCalled()
  })

  it('ekran ve zaman çizgisi seçeneklerini korur ve hareket tercihine uyarlar', async () => {
    reducedMotion = true
    const option = {
      baseOption: { timeline: { data: ['İlk', 'Son'] }, series: [{ type: 'bar', animation: true }] },
      media: [{ query: { maxWidth: 390 }, option: { animation: true, series: [{ label: { show: false }, animation: true }] } }],
      options: [{ series: [{ data: [1], animation: true }] }, { series: [{ data: [2] }] }],
    }
    const original = structuredClone(option)
    await renderChart(option)

    expect(lastOption()).toMatchObject({
      baseOption: { animation: false, timeline: option.baseOption.timeline, series: [{ type: 'bar', animation: false }] },
      media: [{ query: { maxWidth: 390 }, option: { animation: false, series: [{ label: { show: false }, animation: false }] } }],
      options: [{ animation: false, series: [{ data: [1], animation: false }] }, { animation: false, series: [{ data: [2], animation: false }] }],
    })
    await act(async () => { changeMotion(false) })
    expect(lastOption()).toMatchObject(original)
    expect(option).toEqual(original)
  })

  it('boyut ve etiket özelliklerini korur ve boyut bildiriminde grafiği yeniler', async () => {
    const option = { series: [{ type: 'bar', data: [1] }] }
    await renderChart(option, 240, 'İlk grafik')
    const chart = charts[0]
    const element = container.querySelector('[role="img"]') as HTMLDivElement
    expect(element.getAttribute('aria-label')).toBe('İlk grafik')
    expect(element.style.width).toBe('100%')
    expect(element.style.height).toBe('240px')
    expect(observers[0].observe).toHaveBeenCalledWith(element)

    await renderChart(option, 320, 'Son grafik')
    expect(element.style.height).toBe('320px')
    expect(element.getAttribute('aria-label')).toBe('Son grafik')
    observers[0].notify()
    expect(chart.resize).toHaveBeenCalledTimes(1)
    expect(mocks.init).toHaveBeenCalledTimes(1)
  })

  it('kaldırılan grafiği geç gelen boyut ve tercih bildirimleriyle güncellemez', async () => {
    await renderChart({ series: [] })
    const chart = charts[0]
    const listener = addedListeners[0]
    const callCount = chart.setOption.mock.calls.length
    await act(async () => { root?.unmount() })
    root = undefined

    observers[0].notify()
    listener?.({ matches: true } as MediaQueryListEvent)
    expect(chart.resize).not.toHaveBeenCalled()
    expect(chart.setOption).toHaveBeenCalledTimes(callCount)
    expect(chart.dispose).toHaveBeenCalledTimes(1)
    expect(observers[0].disconnect).toHaveBeenCalledTimes(1)
    expect(removeListener).toHaveBeenCalledWith('change', listener)
    expect(motionListeners.size).toBe(0)
  })

  it('yeni seçeneklerde eski gözlemciyi kapatır ve güncel veriyi kullanır', async () => {
    await renderChart({ series: [{ type: 'bar', data: [1] }] })
    const oldChart = charts[0]
    const oldObserver = observers[0]
    await renderChart({ series: [{ type: 'bar', data: [9] }] })
    expect(lastOption()).toMatchObject({ series: [{ data: [9] }] })
    expect(oldChart.dispose).toHaveBeenCalledTimes(1)
    expect(oldObserver.disconnect).toHaveBeenCalledTimes(1)
    oldObserver.notify()
    expect(oldChart.resize).not.toHaveBeenCalled()
    await act(async () => { changeMotion(true) })
    expect(lastOption()).toMatchObject({ animation: false, series: [{ data: [9] }] })
    expect(motionListeners.size).toBe(1)
  })

  it('StrictMode yeniden kurulumunda yalnız etkin grafiği günceller', async () => {
    await act(async () => {
      root?.render(createElement(StrictMode, null, createElement(EChart, {
        option: { series: [] }, height: 240, ariaLabel: 'Karar grafiği',
      })))
    })

    expect(charts).toHaveLength(2)
    expect(charts[0].dispose).toHaveBeenCalledTimes(1)
    observers[0].notify()
    observers[1].notify()
    expect(charts[0].resize).not.toHaveBeenCalled()
    expect(charts[1].resize).toHaveBeenCalledTimes(1)
    await act(async () => { changeMotion(true) })
    expect(lastOption(charts[1])).toMatchObject({ animation: false })
    expect(motionListeners.size).toBe(1)
  })
})
