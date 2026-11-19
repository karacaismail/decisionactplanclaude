import { act, createElement, type ComponentProps } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router'
import { Grid } from 'antd'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { emptyPlan, type PlanDoc } from '@/data/types'
import { formatDate, formatMoney } from '@/engine/format'
import { planPosition, type PlanPosition } from '@/engine/position'
import { OverviewScreen } from '@/screens/OverviewScreen'
import { useCurrentPlan } from '@/store/planStore'
import { ChartFrame } from './ChartFrame'

vi.mock('@/store/planStore', () => ({
  useCurrentPlan: vi.fn(),
  usePlanStore: (selector: (state: unknown) => unknown) => selector({
    theme: 'light', backups: {}, update: vi.fn(), markBackup: vi.fn(),
  }),
}))

// The screen must pass the same source data to the shared chart and its table.
vi.mock('./ChartFrame', () => ({
  ChartFrame: vi.fn(({ title }: ComponentProps<typeof ChartFrame>) =>
    createElement('figure', { 'aria-label': title }),
  ),
}))

function overviewPlan(): PlanDoc {
  const plan = emptyPlan('overview-test', 'Uzun vadeli müşteri doğrulama planı')
  const stamp = '2026-11-18T12:00:00Z'
  plan.tasks = [
    { id: 'late', action: 'Ön sipariş görüşmesinin bütün sonuçlarını kayıt altına alın.', owner: 'Ayşe Yılmaz', dueDate: '2020-01-01', status: 'acik', createdAt: stamp, updatedAt: stamp },
    { id: 'draft', action: 'Deneme takvimini hazırlayın.', status: 'taslak', createdAt: stamp, updatedAt: stamp },
    { id: 'finished', action: 'Bitmiş iş', status: 'bitti', createdAt: stamp, updatedAt: stamp },
  ]
  plan.evidence = Array.from({ length: 6 }, (_, i) => ({
    id: `e-${i}`, title: `Müşteri görüşmesi ${i + 1}: Ayrıntılı teslim ve ödeme koşulları`,
    kind: i === 5 ? 'varsayim' : 'gozlem', ladder: i + 1, linkedSteps: [],
    createdAt: `2026-11-${String(10 + i).padStart(2, '0')}T12:00:00Z`, updatedAt: stamp,
  }))
  plan.decisions = [1, 2, 3].map((gate) => ({
    id: `decision-${gate}`, gate, scope: 'Talep', criteria: [], suggested: 'beklet', chosen: 'beklet',
    reason: `Karar ${gate} için görüşme yapıldı. Ödeme kanıtı ayrıca beklenecek.`,
    retriesLeft: 1, decidedBy: 'Ayşe', decidedAt: stamp, revision: gate,
  }))
  plan.changes = [{
    id: 'change', step: '00', key: 'hoursPerWeek', label: 'Haftalık çalışma',
    before: 10, after: 20, at: stamp, needsReview: true,
  }]
  plan.steps['16'] = { status: 'taslak', updatedAt: stamp, values: { paymentDays: [
    { date: '2026-12-04', labelText: 'Tedarikçi ödemesi', balanceAfterKurus: -20_000 },
    { date: '2026-12-01', labelText: 'Ön ödeme', balanceAfterKurus: 100_000 },
    { date: '', labelText: 'Eksik gün', balanceAfterKurus: 200_000 },
  ] } }
  return plan
}

describe('Genel bakış ekranının dar alandaki içeriği', () => {
  let host: HTMLDivElement
  let root: Root
  let plan: PlanDoc
  let wideLayout: boolean | undefined

  beforeEach(() => {
    wideLayout = false
    vi.spyOn(Grid, 'useBreakpoint').mockImplementation(() => wideLayout === undefined ? {} : ({ xs: !wideLayout, sm: wideLayout, md: wideLayout }))
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
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    plan = overviewPlan()
    vi.mocked(useCurrentPlan).mockReturnValue(plan)
  })

  afterEach(async () => {
    await act(async () => root.unmount())
    host.remove()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  async function render() {
    await act(async () => root.render(createElement(MemoryRouter, null, createElement(OverviewScreen))))
  }

  async function selectTab(prefix: string) {
    const tab = [...host.querySelectorAll<HTMLElement>('[role="tab"]')].find((item) => item.textContent?.startsWith(prefix))
    expect(tab).toBeDefined()
    await act(async () => tab?.click())
  }

  function setStage(stage: PlanPosition['stage']) {
    if (stage === 'temel') return
    const passedGates = stage === 'bitti' ? 8 : 5
    plan.decisions = Array.from({ length: passedGates }, (_, i) => ({
      ...plan.decisions[0], id: `passed-${i + 1}`, gate: i + 1,
      suggested: 'ilerle', chosen: 'ilerle',
    }))
    if (stage !== 'gecis') {
      plan.transitions = [{
        id: 'transition', outcome: 'hazir', suggested: 'hazir', reason: 'Dayanak yeterli.',
        decidedBy: 'Ayşe', decidedAt: '2026-11-18T12:00:00Z', reviewed: true,
        mandatoryMet: 9, mandatoryTotal: 9, supportingMet: 4, supportingTotal: 7,
        level: 3, revision: 6,
      }]
    }
    if (stage === 'uygulama' || stage === 'bitti') plan.legacyStrategy = { migratedAt: '2026-11-18T12:00:00Z' }
    expect(planPosition(plan).stage).toBe(stage)
  }

  function routeHeaders() {
    return [...host.querySelectorAll<HTMLElement>('.route-collapse [role="button"][aria-expanded]')]
  }

  async function pressKey(element: HTMLElement, key: string) {
    element.focus()
    await act(async () => { element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })) })
  }

  it('geçiş aşamasında tamamlanan hazırlığı kapalı başlatır ve klavyeyle tüm rotayı açar', async () => {
    setStage('gecis')
    await render()
    const headers = routeHeaders()
    expect(headers.map((header) => header.getAttribute('aria-expanded'))).toEqual(['false', 'false', 'false'])
    expect(host.querySelector('.hero-button')?.textContent).toContain('Hazırlık kontrolünü aç')
    expect(headers[0].tabIndex).toBe(0)
    await pressKey(headers[0], 'Enter')
    expect(headers[0].getAttribute('aria-expanded')).toBe('true')
    const links = host.querySelectorAll('.route-collapse .overview-route-link')
    expect([...links].map((link) => link.getAttribute('href'))).toEqual([
      '/karar/1', '/karar/2', '/karar/3', '/karar/4', '/karar/5', '/gecis',
    ])
    await pressKey(headers[0], ' ')
    expect(headers[0].getAttribute('aria-expanded')).toBe('false')
  })

  it('kullanıcının açtığı grubu genişlik değişince kapatmaz ve odağı korur', async () => {
    setStage('gecis')
    await render()
    const preparation = routeHeaders()[0]
    expect(preparation.getAttribute('aria-expanded')).toBe('false')
    await pressKey(preparation, 'Enter')
    for (const wide of [true, false]) {
      wideLayout = wide
      await render()
      expect(routeHeaders().map((header) => header.getAttribute('aria-expanded'))).toEqual(['true', 'false', 'false'])
      expect(document.activeElement).toBe(preparation)
    }
  })

  it.each([
    ['temel', ['true', 'false', 'false']],
    ['strateji', ['false', 'true', 'false']],
    ['uygulama', ['false', 'false', 'true']],
    ['bitti', ['false', 'false', 'true']],
  ] as const)('%s aşamasının dar görünümdeki varsayılan grubunu korur', async (stage, expanded) => {
    setStage(stage)
    await render()
    expect(routeHeaders().map((header) => header.getAttribute('aria-expanded'))).toEqual(expanded)
  })

  it('geniş görünümde geçiş aşamasının üç grubunu da açık başlatır', async () => {
    setStage('gecis')
    wideLayout = true
    await render()
    expect(routeHeaders().map((header) => header.getAttribute('aria-expanded'))).toEqual(['true', 'true', 'true'])
  })

  it('masaüstünde varsayılan açık rota daralınca bağlantıyı ve odağı korur', async () => {
    setStage('gecis')
    wideLayout = true
    await render()
    const link = host.querySelector<HTMLAnchorElement>('.route-collapse a[href="/karar/1"]')!
    expect(link).not.toBeNull()
    link.focus()
    wideLayout = false
    await render()
    expect(routeHeaders().map((header) => header.getAttribute('aria-expanded'))).toEqual(['true', 'true', 'true'])
    expect(host.querySelector('.route-collapse a[href="/karar/1"]')).toBe(link)
    expect(document.activeElement).toBe(link)
  })

  it.each([320, 1280])('%i pikselde açılan Yol bağlantılarını bütün genişliklerde aynı DOM içinde tutar', async (initialWidth) => {
    wideLayout = initialWidth >= 768
    await render()
    const road = host.querySelector('.yol-card')
    const links = [...host.querySelectorAll<HTMLAnchorElement>('.yol-card a')]
    expect(road).not.toBeNull()
    expect(links).toHaveLength(4)
    for (const link of links) {
      link.focus()
      for (const width of [320, 844, 1280]) {
        wideLayout = width >= 768
        await render()
        expect(host.querySelector('.yol-card')).toBe(road)
        expect([...host.querySelectorAll('.yol-card a')]).toEqual(links)
        expect(document.activeElement).toBe(link)
      }
    }
  })

  it('yerleşim bilinmezken karar vermez ve ilk bilinen masaüstü gruplarını korur', async () => {
    setStage('gecis')
    wideLayout = undefined
    await render()
    wideLayout = true
    await render()
    expect(routeHeaders().map((header) => header.getAttribute('aria-expanded'))).toEqual(['true', 'true', 'true'])
    wideLayout = false
    await render()
    expect(routeHeaders().map((header) => header.getAttribute('aria-expanded'))).toEqual(['true', 'true', 'true'])
  })

  it('ilk mobil yerleşimde seçilen varsayılan grubu genişleyince değiştirmez', async () => {
    await render()
    expect(routeHeaders().map((header) => header.getAttribute('aria-expanded'))).toEqual(['true', 'false', 'false'])
    wideLayout = true
    await render()
    expect(routeHeaders().map((header) => header.getAttribute('aria-expanded'))).toEqual(['true', 'false', 'false'])
  })

  it('açık işleri tam başlığı ve adlandırılmış alanları olan listede gösterir', async () => {
    await render()
    const list = host.querySelector('ul[aria-label="Açık işler"]')
    expect(list?.children).toHaveLength(2)
    const items = [...list!.children]
    expect(items[0].querySelector('h3')?.textContent).toBe(plan.tasks[0].action)
    expect(items[0].textContent).toContain('Ayşe Yılmaz')
    expect(items[0].textContent).toContain(formatDate('2020-01-01', false))
    expect(items[0].textContent).toContain('Gecikti')
    expect([...items[0].querySelectorAll('dt')].map((item) => item.textContent)).toEqual(['Sorumlu', 'Tarih', 'Durum'])
    expect(items[1].textContent).toContain('Yazılmadı')
    expect(items[1].textContent).toContain('Tarih yok')
    expect(items[1].textContent).toContain('Taslak')
    expect(list?.textContent).not.toContain('Bitmiş iş')
    expect(host.querySelector('a.overview-record-actions')?.getAttribute('href')).toBe('/isler')
  })

  it('son beş kanıtın türünü, basamağını ve tarihini listede korur', async () => {
    await render()
    await selectTab('Son kanıtlar')
    const list = host.querySelector('ul[aria-label="Son kanıtlar"]')
    expect(list?.children).toHaveLength(5)
    const first = list!.children[0]
    expect(first.querySelector('h3')?.textContent).toBe(plan.evidence[5].title)
    expect(first.textContent).toContain('Varsayım')
    expect(first.textContent).toContain('6. basamak')
    expect(first.textContent).toContain(formatDate(plan.evidence[5].createdAt, false))
    expect([...first.querySelectorAll('dt')].map((item) => item.textContent)).toEqual(['Tür', 'Basamak', 'Tarih'])
  })

  it('karar rotasını klavyeyle erişilen gerçek bağlantılarla sunar', async () => {
    await render()
    const route = host.querySelector('.route-collapse ol.overview-route-list')
    expect(route).not.toBeNull()
    const links = [...route!.querySelectorAll<HTMLAnchorElement>('a[href]')]
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/karar/1', '/karar/2', '/karar/3', '/karar/4', '/karar/5', '/gecis',
    ])
    expect(links.every((link) => link.tabIndex === 0)).toBe(true)
    links[0].focus()
    expect(document.activeElement).toBe(links[0])
  })

  function recentHeader() {
    const header = host.querySelector<HTMLElement>('.overview-recent-collapse [role="button"][aria-expanded]')
    expect(header).not.toBeNull()
    return header!
  }

  it('son kararları sayılı ve kapalı başlıkla sunar, klavyeyle bütün içeriği açar', async () => {
    await render()
    const header = recentHeader()
    expect(header.textContent).toBe('Son kararlar (3)')
    expect(header.getAttribute('aria-expanded')).toBe('false')
    expect(header.tabIndex).toBe(0)
    expect(host.querySelector('.pano-timeline')).toBeNull()
    await pressKey(header, 'Enter')
    expect(header.getAttribute('aria-expanded')).toBe('true')
    const records = [...host.querySelectorAll('.tl-body')]
    expect(records).toHaveLength(3)
    const recent = [...plan.decisions].reverse()
    expect(records.map((item) => item.querySelector('.tl-reason')?.textContent)).toEqual(recent.map((decision) => decision.reason))
    expect(records.map((item) => item.querySelector('.helper')?.textContent)).toEqual(recent.map((decision) => formatDate(decision.decidedAt)))
    expect(host.querySelector('.overview-recent-collapse a')?.getAttribute('href')).toBe('/gecmis')
  })

  it('son kararların açık veya kapalı seçimini ve içerik odağını genişlik değişince korur', async () => {
    await render()
    const header = recentHeader()
    await pressKey(header, 'Enter')
    const history = host.querySelector<HTMLAnchorElement>('.overview-recent-collapse a[href="/gecmis"]')!
    expect(history).not.toBeNull()
    history.focus()
    for (const wide of [true, false]) {
      wideLayout = wide
      await render()
      expect(recentHeader().getAttribute('aria-expanded')).toBe('true')
      expect(document.activeElement).toBe(history)
      expect(host.querySelectorAll('.tl-reason')).toHaveLength(3)
    }
    await pressKey(header, ' ')
    expect(header.getAttribute('aria-expanded')).toBe('false')
    for (const wide of [true, false]) {
      wideLayout = wide
      await render()
      expect(recentHeader().getAttribute('aria-expanded')).toBe('false')
      expect(document.activeElement).toBe(header)
    }
  })

  it('karar yokken sıfır sayısını ve açılınca boş durum açıklamasını gösterir', async () => {
    plan.decisions = []
    await render()
    const header = recentHeader()
    expect(header.textContent).toBe('Son kararlar (0)')
    expect(header.getAttribute('aria-expanded')).toBe('false')
    await pressKey(header, 'Enter')
    expect(host.querySelector('.overview-recent-collapse h3')?.textContent).toBe('Henüz karar kaydı yok')
    expect(host.querySelector('.overview-recent-collapse')?.textContent).toContain('İlk kontrolde kararı kaydedince burada görünür.')
    expect(host.querySelector('.pano-timeline')).toBeNull()
  })

  it('değişiklikleri önceki ve sonraki değerleriyle semantik listede gösterir', async () => {
    await render()
    await selectTab('Değişiklik kaydı')
    const list = host.querySelector('ul[aria-label="Değişiklik kaydı"]')
    expect(list?.children).toHaveLength(1)
    expect(list?.querySelector('h3')?.textContent).toBe('Haftalık çalışma')
    expect(list?.textContent).toContain('10 yerine 20.')
    expect(list?.textContent).toContain('İkinci görüş bekliyor')
  })

  it('grafiğe ve tabloya aynı sıralı ödeme günlerini geçirir', async () => {
    await render()
    const props = vi.mocked(ChartFrame).mock.calls.at(-1)![0]
    expect(props.table.rows).toEqual([
      [formatDate('2026-12-01', false), 'Ön ödeme', formatMoney(100_000)],
      [formatDate('2026-12-04', false), 'Tedarikçi ödemesi', formatMoney(-20_000)],
    ])
    expect(props.summary).toBe(`2 ödeme günü. En düşük bakiye ${formatMoney(-20_000)}.`)
    const option = props.option as { baseOption?: { series: { data: number[] }[] }; series?: { data: number[] }[] }
    expect((option.baseOption?.series ?? option.series)?.[0].data).toEqual([1000, -200])
  })

  it('plan yoksa önceki planın kayıtlarını göstermez', async () => {
    vi.mocked(useCurrentPlan).mockReturnValue(undefined)
    await render()
    expect(host.textContent).toBe('')
    expect(ChartFrame).not.toHaveBeenCalled()
  })
})
