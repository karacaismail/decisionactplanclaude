import { useEffect, useRef, useState } from 'react'
import { theme } from 'antd'
import * as echarts from 'echarts/core'
import type { ECBasicOption } from 'echarts/types/dist/shared'
import { BarChart, LineChart, PieChart, RadarChart, GaugeChart, FunnelChart, ScatterChart, HeatmapChart, SankeyChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, MarkLineComponent, VisualMapComponent, AriaComponent, DatasetComponent, TimelineComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { font, motion } from '@/theme/tokens'
import { usePrintMode } from '@/app/printMode'

echarts.use([BarChart, LineChart, PieChart, RadarChart, GaugeChart, FunnelChart, ScatterChart, HeatmapChart, SankeyChart, GridComponent, TooltipComponent, LegendComponent, MarkLineComponent, VisualMapComponent, AriaComponent, DatasetComponent, TimelineComponent, CanvasRenderer])

function reduceSeriesMotion(series: unknown): unknown {
  if (Array.isArray(series)) return series.map(reduceSeriesMotion)
  return series && typeof series === 'object' ? { ...series, animation: false } : series
}

function reduceUnitMotion(option: NonNullable<ECBasicOption['baseOption']>) {
  return {
    ...option,
    animation: false,
    ...(option.series ? { series: reduceSeriesMotion(option.series) } : {}),
  }
}

/** Seri ve ekran seçenekleri hareketi yeniden açmamalı. Kaynak veri değişmez. */
function reduceOptionMotion(option: ECBasicOption): ECBasicOption {
  return {
    ...option,
    animation: false,
    ...(option.series ? { series: reduceSeriesMotion(option.series) } : {}),
    ...(option.baseOption ? { baseOption: reduceUnitMotion(option.baseOption) } : {}),
    ...(option.media ? { media: option.media.map((item) => ({ ...item, option: reduceUnitMotion(item.option) })) } : {}),
    ...(option.options ? { options: option.options.map(reduceUnitMotion) } : {}),
  }
}

/** ECharts sarmalayıcı. Çubuk, çizgi, donut (pie), huni, dağılım ve diğer türler kayıtlıdır. Renk ve yazı tokenlardan gelir. Etiketler 14 pikselin altına inmez. Desen ve kaydırıcı yoktur. */
export default function EChart({ option, height, ariaLabel }: { option: unknown; height: number; ariaLabel: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [failure, setFailure] = useState<{ error: unknown } | null>(null)
  const { token } = theme.useToken()
  /* Yazdırırken grafik ilk karede tam çizilir. Giriş hareketi kâğıda yarım basılmaz. */
  const printing = usePrintMode()
  useEffect(() => {
    if (!ref.current) return
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    /* Desen (decal) yok. Yazı 14 px Outfit. Süre ve eğri hareket tokenından gelir. */
    const base = {
      color: [token.colorText, token.colorTextSecondary, token.colorBorder, token.colorSuccess, token.colorWarning, token.colorError],
      backgroundColor: 'transparent',
      textStyle: { fontFamily: font.family, fontSize: font.helper, color: token.colorText },
      aria: { enabled: true, decal: { show: false } },
      animationDuration: motion.page,
      animationDurationUpdate: motion.page,
      animationEasing: 'cubicInOut' as const,
      animationEasingUpdate: 'cubicInOut' as const,
    }
    /* Seçenek "baseOption" ve "media" taşıyabilir. Ortak biçim o zaman baseOption içine girer. ECharts bu biçimde zaman çizgisi bileşenini arar; bileşen bu yüzden kayıtlıdır. */
    const o = option as ECBasicOption
    const resolved: ECBasicOption = o.baseOption ? { ...o, baseOption: { ...base, ...o.baseOption }, media: o.media ?? [] } : { ...base, ...o }
    const chart = echarts.init(ref.current, undefined, { renderer: 'canvas' })
    let disposed = false
    let ro: ResizeObserver | undefined

    function cleanup() {
      if (disposed) return
      disposed = true
      motionQuery.removeEventListener('change', handleMotionChange)
      ro?.disconnect()
      if (!chart.isDisposed()) chart.dispose()
    }

    const updateMotion = () => {
      if (disposed || chart.isDisposed()) return
      chart.setOption(motionQuery.matches || printing ? reduceOptionMotion(resolved) : resolved, true)
    }

    function handleFailure(error: unknown) {
      cleanup()
      // Olay hatası render sırasında yeniden fırlatılır. Üst bileşen hatayı yakalar.
      setFailure({ error })
    }

    function handleMotionChange() {
      try {
        updateMotion()
      } catch (error) {
        handleFailure(error)
      }
    }

    try {
      updateMotion()
      motionQuery.addEventListener('change', handleMotionChange)
      ro = new ResizeObserver(() => {
        if (disposed || chart.isDisposed()) return
        try {
          chart.resize()
        } catch (error) {
          handleFailure(error)
        }
      })
      ro.observe(ref.current)
      return cleanup
    } catch (error) {
      cleanup()
      throw error
    }
  }, [option, token, printing])
  if (failure) throw failure.error
  return <div ref={ref} role="img" aria-label={ariaLabel} style={{ width: '100%', height }} />
}
