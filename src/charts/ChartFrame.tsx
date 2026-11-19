import '@/styles/desen/section-head.css'
import '@/styles/desen/pano.css'
import '@/styles/desen/pano-ortak.css'
import '@/styles/desen/step-card.css'
import '@/styles/bilesen/ChartFrame.css'
import { Component, lazy, Suspense, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import Button from 'antd/es/button'
import Card from 'antd/es/card'
import Segmented from 'antd/es/segmented'
import { TableIcon } from '@phosphor-icons/react/dist/csr/Table'
import { ChartBar } from '@phosphor-icons/react/dist/csr/ChartBar'
import { scrollRegionWithKeyboard } from '@/components/keyboardScroll'
const LazyChart = lazy(() => import('./EChart'))

type View = 'grafik' | 'tablo'

function intersectsVisibleArea(element: HTMLElement) {
  if (!element.isConnected) return false
  const rect = element.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return false
  const viewport = window.visualViewport
  const viewportLeft = viewport?.offsetLeft ?? 0
  const viewportTop = viewport?.offsetTop ?? 0
  const viewportWidth = viewport?.width ?? (document.documentElement.clientWidth || window.innerWidth)
  const viewportHeight = viewport?.height ?? (document.documentElement.clientHeight || window.innerHeight)
  let left = Math.max(rect.left, viewportLeft)
  let top = Math.max(rect.top, viewportTop)
  let right = Math.min(rect.right, viewportLeft + viewportWidth)
  let bottom = Math.min(rect.bottom, viewportTop + viewportHeight)
  if (right <= left || bottom <= top) return false

  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    const style = window.getComputedStyle(parent)
    const clipsX = /^(auto|scroll|hidden|clip)$/.test(style.overflowX || style.overflow)
    const clipsY = /^(auto|scroll|hidden|clip)$/.test(style.overflowY || style.overflow)
    if (!clipsX && !clipsY) continue
    const bounds = parent.getBoundingClientRect()
    if (clipsX) {
      const edge = bounds.left + parent.clientLeft
      left = Math.max(left, edge)
      right = Math.min(right, edge + parent.clientWidth)
    }
    if (clipsY) {
      const edge = bounds.top + parent.clientTop
      top = Math.max(top, edge)
      bottom = Math.min(bottom, edge + parent.clientHeight)
    }
    if (right <= left || bottom <= top) return false
  }
  return true
}

function watchViewportFallback(element: HTMLElement, onVisible: () => void) {
  let active = true
  let pendingFrame: number | null = null
  let layoutObserver: ResizeObserver | undefined
  const viewport = window.visualViewport

  function stop() {
    if (!active) return
    active = false
    layoutObserver?.disconnect()
    if (pendingFrame !== null) {
      window.cancelAnimationFrame(pendingFrame)
      pendingFrame = null
    }
    window.removeEventListener('scroll', scheduleCheck, true)
    window.removeEventListener('resize', scheduleCheck)
    viewport?.removeEventListener('scroll', scheduleCheck)
    viewport?.removeEventListener('resize', scheduleCheck)
  }

  function check() {
    pendingFrame = null
    if (!active || !intersectsVisibleArea(element)) return
    stop()
    onVisible()
  }

  function scheduleCheck() {
    if (!active || pendingFrame !== null) return
    if (typeof window.requestAnimationFrame === 'function') {
      pendingFrame = window.requestAnimationFrame(check)
    } else {
      check()
    }
  }

  check()
  if (!active) return stop

  // Capture also receives non-bubbling scroll events from nested scroll areas.
  window.addEventListener('scroll', scheduleCheck, { capture: true, passive: true })
  window.addEventListener('resize', scheduleCheck, { passive: true })
  viewport?.addEventListener('scroll', scheduleCheck, { passive: true })
  viewport?.addEventListener('resize', scheduleCheck, { passive: true })
  if (typeof ResizeObserver === 'function') {
    layoutObserver = new ResizeObserver(scheduleCheck)
    for (let target: Element | null = element; target; target = target.parentElement) {
      layoutObserver.observe(target, { box: 'border-box' })
      // Earlier flow siblings can move a chart even inside a fixed-height parent.
      if (target === document.body) continue
      for (let sibling = target.previousElementSibling; sibling; sibling = sibling.previousElementSibling) {
        layoutObserver.observe(sibling, { box: 'border-box' })
      }
    }
  }
  return stop
}

class ChartErrorBoundary extends Component<{ children: ReactNode; onShowTable: () => void }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="chart-load-error">
          <p role="status">Grafik yüklenemedi. Verileri tabloda görebilirsiniz.</p>
          <Button onClick={this.props.onShowTable}>Tabloyu göster</Button>
        </div>
      )
    }
    return this.props.children
  }
}

/**
 * Grafik ekrana girince yüklenir. Ekran okuyucu veri tablosuna her zaman erişir.
 * `frame="plain"` kart çizmez. `height` grafik yüksekliğidir. Varsayılan yükseklik 240 pikseldir.
 */
export function ChartFrame({ title, summary, option, table, height = 240, frame = 'card' }: {
  title: string
  summary?: string
  option: unknown
  table: { head: string[]; rows: (string | number)[][] }
  height?: number
  frame?: 'card' | 'plain'
}) {
  const [view, setView] = useState<View>('grafik')
  const [enteredViewport, setEnteredViewport] = useState(false)
  const figureRef = useRef<HTMLElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const focusTable = useRef(false)
  /* Grafiğin adı kısadır. Özet görünür paragraftadır ve grafiğe bu kimlikle bağlanır. Böylece özet bir kez okunur. */
  const summaryId = useId()

  useEffect(() => {
    if (enteredViewport) return
    const figure = figureRef.current
    if (!figure) return
    if (typeof IntersectionObserver === 'undefined') {
      return watchViewportFallback(figure, () => setEnteredViewport(true))
    }
    let observing = true
    const observer = new IntersectionObserver((entries) => {
      if (observing && entries.some((entry) => entry.target === figure && entry.isIntersecting)) {
        observing = false
        setEnteredViewport(true)
        observer.disconnect()
      }
    }, { root: null, rootMargin: '0px', threshold: 0 })
    observer.observe(figure)
    return () => {
      observing = false
      observer.disconnect()
    }
  }, [enteredViewport, frame])

  useEffect(() => {
    if (view === 'tablo' && focusTable.current) {
      tableRef.current?.focus()
      focusTable.current = false
    }
  }, [view])

  function showTableAfterError() {
    focusTable.current = true
    setView('tablo')
  }

  const toggle = (
    <Segmented<View>
      className="chart-view"
      value={view}
      onChange={setView}
      aria-label="Veriyi göster"
      options={[
        { value: 'grafik', label: 'Grafik', icon: <ChartBar size={16} aria-hidden /> },
        { value: 'tablo', label: 'Tablo', icon: <TableIcon size={16} aria-hidden /> },
      ]}
    />
  )
  const body = (
    <>
      {view === 'grafik' ? (
        <div className="chart-canvas" style={{ minHeight: height }}>
          {enteredViewport ? (
            <ChartErrorBoundary onShowTable={showTableAfterError}>
              <Suspense fallback={<p className="chart-loading" role="status">Grafik yükleniyor.</p>}>
                <LazyChart option={option} height={height} ariaLabel={title} describedBy={summary ? summaryId : undefined} />
              </Suspense>
            </ChartErrorBoundary>
          ) : <div className="chart-placeholder" aria-hidden="true" />}
        </div>
      ) : null}
      <div
        ref={tableRef}
        className={`chart-table-scroll${view === 'tablo' ? '' : ' sr-only'}`}
        role="region"
        aria-label={`${title} verileri`}
        tabIndex={view === 'tablo' ? 0 : undefined}
        onKeyDown={scrollRegionWithKeyboard}
      >
        <table className="chart-data-table">
          <caption className="sr-only">{title} verileri</caption>
          <thead>
            <tr>{table.head.map((heading, index) => <th key={index} scope="col">{heading}</th>)}</tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, columnIndex) => columnIndex === 0
                  ? <th key={columnIndex} scope="row">{cell}</th>
                  : <td key={columnIndex}>{cell}</td>)}
              </tr>
            ))}
            {table.rows.length === 0 ? <tr><td colSpan={table.head.length || 1}>Veri bulunmuyor.</td></tr> : null}
          </tbody>
        </table>
      </div>
      {summary ? <p id={summaryId} className="chart-summary">{summary}</p> : null}
    </>
  )
  if (frame === 'plain') {
    return (
      <figure ref={figureRef} className="chart-frame mobil-chart-frame">
        <figcaption className="section-head">
          <h3>{title}</h3>
          <div className="section-actions">{toggle}</div>
        </figcaption>
        {body}
      </figure>
    )
  }
  return (
    <Card className="step-card chart-card mobil-chart-frame" variant="borderless" title={title} extra={toggle}>
      <figure ref={figureRef} className="chart-frame">
        <figcaption className="sr-only">{title}</figcaption>
        {body}
      </figure>
    </Card>
  )
}
