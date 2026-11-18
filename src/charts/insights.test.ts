// @vitest-environment node
import { describe, expect, it } from 'vitest'
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart, FunnelChart, ScatterChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, MarkLineComponent, TimelineComponent } from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import type { ECBasicOption } from 'echarts/types/dist/shared'
import { buildDemoPlan } from '@/data/demo'
import { DECISIONS } from '@/data/decisions'
import { emptyPlan } from '@/data/types'
import { evaluateGate } from '@/engine/gate'
import { evaluateReadiness } from '@/engine/readiness'
import { font } from '@/theme/tokens'
import { buildInsights, summaryTiles, type InsightChart, type InsightPalette } from './insights'

echarts.use([BarChart, LineChart, PieChart, FunnelChart, ScatterChart, GridComponent, TooltipComponent, LegendComponent, MarkLineComponent, TimelineComponent, SVGRenderer])

const palette: InsightPalette = { primary: '#111', info: '#222', success: '#333', warning: '#444', error: '#555', muted: '#666', outcome: () => '#777' }

describe('örnek plan', () => {
  const plan = buildDemoPlan()

  it('örnek damgası, sürüm 5 ve beş ilerle kararı taşır', () => {
    expect(plan.example).toBe(true)
    expect(plan.revision).toBe(5)
    expect(plan.decisions.map((d) => d.gate)).toEqual([1, 2, 3, 4, 5])
    expect(plan.decisions.every((d) => d.chosen === 'ilerle')).toBe(true)
    expect(plan.limits.budgetKurus).toBe(15_000_000)
    expect(plan.evidence).toHaveLength(4)
    expect(plan.tasks).toHaveLength(3)
    expect(plan.transitions).toEqual([])
  })

  it('Karar 1-5 kontrolleri motorun ölçütleriyle de "ilerle" önerir', () => {
    for (const n of [1, 2, 3, 4, 5]) {
      const ev = evaluateGate(DECISIONS[n - 1].gate, plan)
      expect(ev.suggested, `Kontrol ${n}: ${ev.reasons.join(' ')}`).toBe('ilerle')
    }
  })

  it('Adım 00-18 tamam, strateji oluşturma adımları boş', () => {
    for (let i = 0; i <= 18; i++) expect(plan.steps[String(i).padStart(2, '0')]?.status).toBe('tamam')
    for (const id of ['19', '20']) expect(plan.steps[id]).toBeUndefined()
  })

  it('hazırlık kontrolü dokuz zorunlu ölçütü karşılar ve "hazır" ya da "koşullu" önerir', () => {
    const r = evaluateReadiness(plan)
    expect(r.mandatory.filter((c) => c.met !== true).map((c) => c.id)).toEqual([])
    expect(['hazir', 'kosullu']).toContain(r.suggested)
    expect(r.level).toBe(5)
    const strong = plan.evidence.filter((e) => e.ladder >= 1 && e.ladder <= 3)
    expect(strong.some((e) => e.linkedSteps.includes('15'))).toBe(true)
  })
})

describe('göstergeler', () => {
  it('örnek planda özet kutuları hesaplanır', () => {
    const tiles = summaryTiles(buildDemoPlan())
    expect(tiles.map((t) => t.key)).toEqual(['pist', 'acik', 'butce', 'deneme'])
    expect(tiles[0].value).toBe('8 ay')
    expect(tiles[1].value).toBe('Açık yok')
    expect(tiles[3].value).toBe('2 / karar')
  })

  it('örnek planda en az altı gösterge üretir ve veri olanlar dolu gelir', () => {
    const all = buildInsights(buildDemoPlan(), palette)
    expect(all.length).toBeGreaterThanOrEqual(6)
    const byId = Object.fromEntries(all.map((i) => [i.id, i]))
    const huni = byId.huni
    expect(huni.empty).toBe(false)
    if (!huni.empty) expect(huni.table.rows).toContainEqual(['Taahhüt veren', 11])
    const kapilar = byId.kapilar
    if (!kapilar.empty) expect(kapilar.table.rows).toHaveLength(5)
    const olcu = byId.olcu
    expect(olcu.empty).toBe(false)
    if (!olcu.empty) expect(olcu.table.rows).toHaveLength(3)
    expect(byId.nakit.empty).toBe(false)
  })

  it('boş planda yalnız adım sayacı dolu, diğerleri ölçüm bekler', () => {
    const all = buildInsights(emptyPlan('p', 'Boş'), palette)
    expect(all.find((i) => i.id === 'adimlar')?.empty).toBe(false)
    expect(all.filter((i) => i.id !== 'adimlar').every((i) => i.empty)).toBe(true)
    const tiles = summaryTiles(emptyPlan('p', 'Boş'))
    expect(tiles[0].value).toBe('Hesaplanmadı')
  })
})

interface ResolvedOption {
  series: { data: unknown[]; label: { show: boolean; fontSize?: number } }[]
  xAxis?: { data?: string[]; axisLabel: { interval?: number | 'auto'; fontSize: number }; splitNumber: number }[]
  yAxis?: { data?: string[]; axisLabel: { fontSize: number }; splitNumber: number }[]
}

function filledInsight(id: string, plan = buildDemoPlan()): InsightChart {
  const insight = buildInsights(plan, palette).find((item) => item.id === id)
  if (!insight || insight.empty) throw new Error(`Gösterge dolu olmalı: ${id}`)
  return insight
}

describe('gösterge seçeneklerinin kapsayıcıya uyumu', () => {
  it.each(['adimlar', 'kanit', 'huni', 'olcu', 'kapilar', 'gorusmeler'])(
    '%s dar alanda değer etiketlerini azaltır ve geniş ayarları geri getirir', (id) => {
      const insight = filledInsight(id)
      const table = structuredClone(insight.table)
      const chart = echarts.init(null, undefined, { renderer: 'svg', ssr: true, width: 800, height: insight.height ?? 300 })
      try {
        chart.setOption(insight.option as ECBasicOption)
        const wide = chart.getOption() as unknown as ResolvedOption
        const visibleWide = wide.series.filter((series) => series.label.show).length
        expect(visibleWide).toBeGreaterThan(0)
        for (const width of [320, 360, 375, 390, 519, 520]) {
          chart.resize({ width })
          const narrow = chart.getOption() as unknown as ResolvedOption
          expect(narrow.series.filter((series) => series.label.show).length).toBeLessThan(visibleWide)
          expect(narrow.series.map((series) => series.data)).toEqual(wide.series.map((series) => series.data))
          for (const axis of [...(narrow.xAxis ?? []), ...(narrow.yAxis ?? [])]) {
            expect(axis.axisLabel.fontSize).toBe(font.helper)
          }
          for (const series of narrow.series) {
            if (series.label.fontSize !== undefined) expect(series.label.fontSize).toBeGreaterThanOrEqual(font.helper)
          }
        }
        chart.resize({ width: 521 })
        const restored = chart.getOption() as unknown as ResolvedOption
        expect(restored.series).toEqual(wide.series)
        expect(restored.xAxis).toEqual(wide.xAxis)
        expect(restored.yAxis).toEqual(wide.yAxis)
        expect(insight.table).toEqual(table)
      } finally {
        chart.dispose()
      }
    },
  )

  it.each(['cash', 'unit', 'both'] as const)('%s nakit görünümünde tüm değerleri korur', (mode) => {
    const plan = buildDemoPlan()
    const paymentDays = Array.from({ length: 24 }, (_, i) => ({
      date: `2026-11-${String(i + 1).padStart(2, '0')}`,
      balanceAfterKurus: (i - 12) * 100_000,
    }))
    plan.steps['16'].values.paymentDays = mode === 'unit' ? [] : paymentDays
    if (mode !== 'cash') {
      plan.steps['29'] = { ...plan.steps['16'], values: { ltvKurus: 123_450, cacKurus: 67_890 } }
    }
    const insight = filledInsight('nakit', plan)
    const expectedRows = [
      ...(mode === 'unit' ? [] : paymentDays.map((day, i) => [`${i + 1} Kasım 2026 kasa`, day.balanceAfterKurus / 100])),
      ...(mode === 'cash' ? [] : [['Müşteri ömür değeri', 1234.5], ['Kazanma maliyeti', 678.9]]),
    ]
    expect(insight.table.rows).toEqual(expectedRows)
    const chart = echarts.init(null, undefined, { renderer: 'svg', ssr: true, width: 800, height: 400 })
    try {
      chart.setOption(insight.option as ECBasicOption)
      const wide = chart.getOption() as unknown as ResolvedOption
      for (const width of [320, 520]) {
        chart.resize({ width })
        const narrow = chart.getOption() as unknown as ResolvedOption
        expect(narrow.yAxis?.every((axis, index) => axis.splitNumber < wide.yAxis![index].splitNumber)).toBe(true)
        if (mode !== 'unit') expect(narrow.xAxis![0].axisLabel.interval).toBeGreaterThan(0)
        if (mode !== 'cash') expect(narrow.series.at(-1)?.label.show).toBe(false)
        expect(narrow.series.map((series) => series.data)).toEqual(wide.series.map((series) => series.data))
        expect(insight.table.rows).toEqual(expectedRows)
      }
      chart.resize({ width: 521 })
      const restored = chart.getOption() as unknown as ResolvedOption
      expect(restored.series).toEqual(wide.series)
      expect(restored.xAxis).toEqual(wide.xAxis)
      expect(restored.yAxis).toEqual(wide.yAxis)
    } finally {
      chart.dispose()
    }
  })
})
