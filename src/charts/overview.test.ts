// @vitest-environment node
import { describe, expect, it } from 'vitest'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, MarkLineComponent, TimelineComponent, TooltipComponent } from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import type { ECBasicOption } from 'echarts/types/dist/shared'
import { font } from '@/theme/tokens'
import { cashFlowOption, cashFlowTable, type CashDay } from './overview'

echarts.use([LineChart, GridComponent, MarkLineComponent, TimelineComponent, TooltipComponent, SVGRenderer])

const colors = { line: '#111', area: '#222', axis: '#333', text: '#444', zero: '#555' }
const days: CashDay[] = Array.from({ length: 24 }, (_, i) => ({
  date: `2026-11-${String(i + 1).padStart(2, '0')}`,
  label: `Ödeme ${i + 1}`,
  balanceKurus: (i - 12) * 100_000,
}))

interface CashOption {
  xAxis: { data: string[]; axisLabel: { interval: number | 'auto'; fontSize: number } }[]
  yAxis: { splitNumber: number; axisLabel: { fontSize: number } }[]
  series: { data: number[] }[]
}

describe('nakit grafiğinin kapsayıcıya uyumu', () => {
  it('dar alanda tarihleri azaltır ve geniş alana dönünce ayarları geri getirir', () => {
    const chart = echarts.init(null, undefined, { renderer: 'svg', ssr: true, width: 800, height: 300 })
    const table = cashFlowTable(days)
    try {
      chart.setOption(cashFlowOption(days, colors) as ECBasicOption)
      const wide = chart.getOption() as unknown as CashOption
      for (const width of [320, 360, 375, 390, 519, 520]) {
        chart.resize({ width })
        const narrow = chart.getOption() as unknown as CashOption
        expect(narrow.xAxis[0].axisLabel.interval).toBeGreaterThan(0)
        expect(narrow.yAxis[0].splitNumber).toBeLessThan(wide.yAxis[0].splitNumber)
        expect(narrow.series[0].data).toEqual(days.map((day) => day.balanceKurus / 100))
        expect(narrow.xAxis[0].data).toEqual(wide.xAxis[0].data)
        expect(narrow.xAxis[0].axisLabel.fontSize).toBe(font.helper)
        expect(narrow.yAxis[0].axisLabel.fontSize).toBe(font.helper)
      }
      chart.resize({ width: 521 })
      const restored = chart.getOption() as unknown as CashOption
      expect(restored.xAxis).toEqual(wide.xAxis)
      expect(restored.yAxis).toEqual(wide.yAxis)
      expect(restored.series).toEqual(wide.series)
      expect(cashFlowTable(days)).toEqual(table)
      expect(table.rows).toHaveLength(days.length)
      expect(table.rows[0]).toEqual(['1 Kasım 2026', 'Ödeme 1', '-12.000,00 TL'])
    } finally {
      chart.dispose()
    }
  })

  it.each([0, 1, 2])('%i ödeme gününde geçersiz etiket aralığı üretmez', (count) => {
    const chart = echarts.init(null, undefined, { renderer: 'svg', ssr: true, width: 320, height: 300 })
    try {
      chart.setOption(cashFlowOption(days.slice(0, count), colors) as ECBasicOption)
      const option = chart.getOption() as unknown as CashOption
      expect(option.xAxis[0].axisLabel.interval).toBe(0)
      expect(option.series[0].data).toHaveLength(count)
    } finally {
      chart.dispose()
    }
  })
})
