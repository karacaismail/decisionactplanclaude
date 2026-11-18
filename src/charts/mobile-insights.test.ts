import { createElement, type ComponentProps } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { emptyPlan } from '@/data/types'
import { InsightsScreen } from '@/screens/InsightsScreen'
import { useCurrentPlan } from '@/store/planStore'
import { ChartFrame } from './ChartFrame'
import { buildInsights, statCards, type InsightChart, type InsightEmpty } from './insights'

vi.mock('@/store/planStore', () => ({
  useCurrentPlan: vi.fn(),
  usePlanStore: vi.fn(() => 'light'),
}))

vi.mock('./insights', () => ({
  buildInsights: vi.fn(),
  statCards: vi.fn(),
}))

// ChartFrame owns loading and table interactions. This test checks the screen boundary.
vi.mock('./ChartFrame', () => ({
  ChartFrame: vi.fn(({ title, summary }: ComponentProps<typeof ChartFrame>) =>
    createElement('figure', null,
      createElement('figcaption', null, createElement('h3', null, title)),
      createElement('p', { className: 'chart-summary' }, summary),
    ),
  ),
}))

const filled: InsightChart = {
  id: 'olcu',
  title: 'Uzun vadeli müşteri kazanımı ve teslim sonuçları',
  empty: false,
  summary: 'İki ölçüm için hedef ve sonuç karşılaştırılır.',
  source: 'Bu ölçümler deneme adımındaki kayıtlardan gelir.',
  option: { series: [{ type: 'bar', data: [150, 110] }] },
  table: {
    head: ['Ölçüm', 'Hedef', 'Sonuç'],
    rows: [
      ['Uzun vadeli müşteri kazanımı', 150, 110],
      ['Zamanında tamamlanan teslimler', 80, 72],
    ],
  },
}

const missing: InsightEmpty = {
  id: 'nakit',
  title: 'Nakit akışı',
  empty: true,
  source: 'Bu sayılar kaynak adımındaki kayıtlardan gelir.',
  hint: 'Gelir ve gider tutarlarını kaynak adımına yazın.',
  link: { label: 'Kaynak adımını doldurun', to: '/karar/5/adim/15' },
}

function renderScreen() {
  const container = document.createElement('div')
  container.innerHTML = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(InsightsScreen)))
  return container
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useCurrentPlan).mockReturnValue(emptyPlan('insights-test', 'Ölçüm planı'))
  vi.mocked(buildInsights).mockReturnValue([filled, missing])
  vi.mocked(statCards).mockReturnValue([])
})

describe('Göstergeler ekranının mobil içerik düzeni', () => {
  it('grafikleri adlandırılmış bölümlerde sunar ve kaynak metnini özetten ayırır', () => {
    const screen = renderScreen()
    const charts = screen.querySelector('section[aria-labelledby="insight-charts-heading"]')
    expect(charts?.querySelector('h2')?.textContent).toBe('Grafikler ve tablolar')
    const section = screen.querySelector(`section[aria-label="${filled.title}"]`)
    expect(section?.querySelector('h3')?.textContent).toBe(filled.title)
    expect(section?.querySelector('.chart-summary')?.textContent).toBe(filled.summary)
    expect(section?.querySelector('.insight-source')?.textContent).toBe(filled.source)
  })

  it('tam tablo değerlerini ve özeti ChartFrame bileşenine değiştirmeden aktarır', () => {
    renderScreen()
    expect(ChartFrame).toHaveBeenCalledTimes(1)
    const props = vi.mocked(ChartFrame).mock.calls[0][0]
    expect(props.summary).toBe(filled.summary)
    expect(props.table).toBe(filled.table)
    expect(props.option).toBe(filled.option)
    expect(props.frame).toBe('plain')
  })

  it('ölçüm yokken başlığı, kaynağı ve ilgili adım bağlantısını korur', () => {
    const screen = renderScreen()
    const section = screen.querySelector(`section[aria-label="${missing.title}"]`)
    expect(section?.querySelector('h3')?.textContent).toBe(missing.title)
    expect(section?.textContent).toContain(missing.hint)
    expect(section?.querySelector('.insight-source')?.textContent).toBe(missing.source)
    const link = section?.querySelector('a')
    expect(link?.getAttribute('href')).toBe(missing.link.to)
    expect(link?.textContent).toBe(missing.link.label)
  })

  it('seçili plan yokken eski göstergeleri göstermez', () => {
    vi.mocked(useCurrentPlan).mockReturnValue(undefined)
    expect(renderScreen().textContent).toBe('')
    expect(ChartFrame).not.toHaveBeenCalled()
    expect(buildInsights).not.toHaveBeenCalled()
  })
})
