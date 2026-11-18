import type { PlanDoc } from '@/data/types'
import { formatDate, formatMoney } from '@/engine/format'
import { font } from '@/theme/tokens'

/** Adım 16 "Ödeme günleri" tablosundan okunan tek satır. */
export interface CashDay {
  date: string
  label: string
  balanceKurus: number
}

const num = (x: unknown): number | null => {
  if (typeof x === 'number') return Number.isNaN(x) ? null : x
  if (typeof x === 'string' && x.trim() !== '') {
    const n = Number(x)
    return Number.isNaN(n) ? null : n
  }
  return null
}

/** Plan özeti için kasa çizgisi verisi. Tarihi ve bakiyesi dolu satırlar tarihe göre sıralanır. */
export function cashDays(plan: PlanDoc): CashDay[] {
  const raw = plan.steps['16']?.values?.paymentDays
  if (!Array.isArray(raw)) return []
  const out: CashDay[] = []
  for (const r of raw as Record<string, unknown>[]) {
    const date = typeof r.date === 'string' ? r.date : ''
    const bal = num(r.balanceAfterKurus)
    if (!date || bal === null) continue
    out.push({ date, label: typeof r.labelText === 'string' ? r.labelText : '', balanceKurus: bal })
  }
  return out.sort((a, b) => a.date.localeCompare(b.date))
}

/** ECharts çizgi seçeneği. Renk ekrandan gelir; tuval CSS değişkeni okuyamaz. */
export function cashFlowOption(days: CashDay[], colors: { line: string; area: string; axis: string; text: string; zero: string }) {
  const baseOption = {
    grid: { left: 8, right: 16, top: 16, bottom: 8, containLabel: true },
    tooltip: {
      trigger: 'axis',
      textStyle: { fontFamily: font.family, fontSize: font.helper },
      formatter: (params: { dataIndex: number }[]) => {
        const d = days[params[0]?.dataIndex ?? 0]
        if (!d) return ''
        return `${formatDate(d.date, false)}<br/>${d.label ? d.label + '<br/>' : ''}Kasa: ${formatMoney(d.balanceKurus)}`
      },
    },
    xAxis: {
      type: 'category',
      data: days.map((d) => formatDate(d.date, false).replace(/ \d{4}$/, '')),
      axisLine: { lineStyle: { color: colors.axis } },
      axisTick: { show: false },
      axisLabel: { color: colors.text, fontSize: font.helper, interval: 'auto', hideOverlap: true },
    },
    yAxis: {
      type: 'value',
      splitNumber: 4,
      splitLine: { lineStyle: { color: colors.axis } },
      axisLabel: { color: colors.text, fontSize: font.helper, formatter: (v: number) => `${Math.round(v / 1000).toLocaleString('tr-TR')} bin` },
    },
    series: [
      {
        type: 'line',
        name: 'Kasada kalan',
        data: days.map((d) => Math.round(d.balanceKurus / 100)),
        smooth: false,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 2, color: colors.line },
        itemStyle: { color: colors.line },
        areaStyle: { color: colors.area },
        markLine: { silent: true, symbol: 'none', label: { show: false }, lineStyle: { color: colors.zero, type: 'dashed' }, data: [{ yAxis: 0 }] },
      },
    ],
  }
  return {
    baseOption,
    media: [
      {
        query: { maxWidth: 520 },
        option: {
          // Tarih etiketleri seyrelir. Seri ve tablo bütün ödeme günlerini korur.
          xAxis: { axisLabel: { interval: Math.max(0, Math.ceil(days.length / 2) - 1) } },
          yAxis: { splitNumber: 2 },
        },
      },
      { option: { xAxis: { axisLabel: { interval: 'auto' } }, yAxis: { splitNumber: 4 } } },
    ],
  }
}

/** "Veriyi göster" tablosu. */
export function cashFlowTable(days: CashDay[]): { head: string[]; rows: (string | number)[][] } {
  return {
    head: ['Ödeme günü', 'Ne oluyor?', 'Kasada kalan'],
    rows: days.map((d) => [formatDate(d.date, false), d.label || 'Yazılmadı', formatMoney(d.balanceKurus)]),
  }
}
