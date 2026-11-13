import { useEffect, useRef } from 'react'
import { theme } from 'antd'
import * as echarts from 'echarts/core'
import { BarChart, LineChart, RadarChart, GaugeChart, FunnelChart, ScatterChart, HeatmapChart, SankeyChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, MarkLineComponent, VisualMapComponent, AriaComponent, DatasetComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { font } from '@/theme/tokens'

echarts.use([BarChart, LineChart, RadarChart, GaugeChart, FunnelChart, ScatterChart, HeatmapChart, SankeyChart, GridComponent, TooltipComponent, LegendComponent, MarkLineComponent, VisualMapComponent, AriaComponent, DatasetComponent, CanvasRenderer])

/** ECharts sarmalayıcı. Renk ve yazı tokenlardan gelir. Etiketler 14 pikselin altına inmez. */
export default function EChart({ option, height, ariaLabel }: { option: unknown; height: number; ariaLabel: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { token } = theme.useToken()
  useEffect(() => {
    if (!ref.current) return
    const chart = echarts.init(ref.current, undefined, { renderer: 'canvas' })
    const base = {
      color: [token.colorPrimary, token.colorInfo, token.colorSuccess, token.colorWarning, token.colorError, token.colorTextSecondary],
      textStyle: { fontFamily: font.family, fontSize: 14, color: token.colorText },
      aria: { enabled: true, decal: { show: true } },
      animationDuration: 320,
      animationEasing: 'cubicInOut' as const,
    }
    chart.setOption({ ...base, ...(option as object) }, true)
    const ro = new ResizeObserver(() => chart.resize())
    ro.observe(ref.current)
    return () => {
      ro.disconnect()
      chart.dispose()
    }
  }, [option, token])
  return <div ref={ref} role="img" aria-label={ariaLabel} style={{ width: '100%', height }} />
}
