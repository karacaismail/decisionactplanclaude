import { useEffect, useRef } from 'react'
import { theme } from 'antd'
import * as echarts from 'echarts/core'
import type { ECBasicOption } from 'echarts/types/dist/shared'
import { BarChart, LineChart, PieChart, RadarChart, GaugeChart, FunnelChart, ScatterChart, HeatmapChart, SankeyChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, MarkLineComponent, VisualMapComponent, AriaComponent, DatasetComponent, TimelineComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { font, motion } from '@/theme/tokens'

echarts.use([BarChart, LineChart, PieChart, RadarChart, GaugeChart, FunnelChart, ScatterChart, HeatmapChart, SankeyChart, GridComponent, TooltipComponent, LegendComponent, MarkLineComponent, VisualMapComponent, AriaComponent, DatasetComponent, TimelineComponent, CanvasRenderer])

/** ECharts sarmalayıcı. Çubuk, çizgi, donut (pie), huni, dağılım ve diğer türler kayıtlıdır. Renk ve yazı tokenlardan gelir. Etiketler 14 pikselin altına inmez. Desen ve kaydırıcı yoktur. */
export default function EChart({ option, height, ariaLabel }: { option: unknown; height: number; ariaLabel: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { token } = theme.useToken()
  useEffect(() => {
    if (!ref.current) return
    const chart = echarts.init(ref.current, undefined, { renderer: 'canvas' })
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
    const o = option as { baseOption?: object; media?: object[] }
    const resolved: object = o.baseOption ? { baseOption: { ...base, ...o.baseOption }, media: o.media ?? [] } : { ...base, ...(option as object) }
    chart.setOption(resolved as ECBasicOption, true)
    const ro = new ResizeObserver(() => chart.resize())
    ro.observe(ref.current)
    return () => {
      ro.disconnect()
      chart.dispose()
    }
  }, [option, token])
  return <div ref={ref} role="img" aria-label={ariaLabel} style={{ width: '100%', height }} />
}
