import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App as AntApp, ConfigProvider, Grid } from 'antd'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PlansScreen } from '@/screens/PlansScreen'
import { emptyPlan, type PlanDoc } from '@/data/types'
import { usePlanStore } from '@/store/planStore'
import { downloadJson } from '@/engine/sync'

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }))

vi.mock('react-router', () => ({ useNavigate: () => navigate }))
vi.mock('@/engine/sync', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/engine/sync')>(),
  downloadJson: vi.fn(),
}))

let root: Root
let host: HTMLDivElement
let plan: PlanDoc
let wide = false

function button(scope: ParentNode, text: string) {
  const result = [...scope.querySelectorAll('button')].find((el) => el.textContent?.trim() === text)
  if (!result) throw new Error(`Düğme bulunamadı: ${text}`)
  return result
}

async function click(el: HTMLElement) {
  await act(async () => el.click())
}

async function renderScreen() {
  await act(async () => root.render(createElement(ConfigProvider, { virtual: false, theme: { token: { motion: false } } },
    createElement(AntApp, null, createElement(PlansScreen)),
  )))
}

async function resizeScreen(width: number, height: number) {
  wide = width >= 768
  vi.stubGlobal('innerWidth', width)
  vi.stubGlobal('innerHeight', height)
  await act(async () => {
    window.dispatchEvent(new Event('resize'))
  })
  await renderScreen()
}

const names = () => [...host.querySelectorAll('article h3')].map((el) => el.textContent)

function numberedPlans(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const number = String(index + 1).padStart(2, '0')
    return { ...emptyPlan(`plan-${number}`, `Plan ${number}`), updatedAt: `2026-11-${number}T12:00:00.000Z` }
  })
}

function setPlans(plans: PlanDoc[]) {
  usePlanStore.setState({ plans: Object.fromEntries(plans.map((item) => [item.id, item])) })
}

async function searchFor(value: string) {
  const input = host.querySelector<HTMLInputElement>('input[aria-label="Plan adı ara"]')!
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

async function chooseSort(label: string) {
  const input = host.querySelector<HTMLInputElement>('input[aria-label="Planları sırala"]')
  expect(input, 'Sıralama kontrolü bulunmalı.').not.toBeNull()
  await act(async () => {
    input!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
  })
  const option = [...document.querySelectorAll<HTMLElement>('.ant-select-item-option')]
    .find((el) => el.textContent?.trim() === label && !el.closest('.ant-select-dropdown-hidden'))
  expect(option, 'Sıralama seçeneği bulunmalı.').toBeDefined()
  await click(option!)
  await act(async () => {
    input!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }))
  })
}

async function nextPage() {
  const next = host.querySelector<HTMLButtonElement>('.ant-pagination-next button')
  expect(next, 'Sonraki sayfa düğmesi bulunmalı.').not.toBeNull()
  await click(next!)
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  })
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })))
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  vi.spyOn(Grid, 'useBreakpoint').mockImplementation(() => ({ md: wide }))
  wide = false
  plan = {
    ...emptyPlan('plan-phone', 'İş geliştirme ve mahalle kafesi'),
    updatedAt: '2026-11-18T12:00:00.000Z',
    revision: 7,
    example: true,
    lastLocation: '/adim/01.01',
    revisions: [{ id: 'r1', label: 'İlk kayıt', createdAt: '2026-11-17T12:00:00.000Z', snapshot: '{}' }],
    outputs: [{ id: 'o1', kind: 'aksiyon', revision: 6, createdAt: '2026-11-17T12:00:00.000Z' }],
  }
  usePlanStore.setState({ plans: { [plan.id]: plan }, currentId: undefined, backups: {}, loadFailed: false })
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
})

afterEach(async () => {
  await act(async () => root.unmount())
  host.remove()
  localStorage.clear()
  vi.restoreAllMocks()
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

describe('PlansScreen ortak kart listesi', () => {
  it('planı başlığı olan bir liste öğesinde bütün plan bilgileriyle sunar', async () => {
    await renderScreen()
    const article = host.querySelector('ul li article')
    expect(article).not.toBeNull()
    const heading = article!.querySelector('h3')
    expect(heading?.textContent).toBe(plan.name)
    expect(article!.getAttribute('aria-labelledby')).toBe(heading?.id)
    expect([...article!.querySelectorAll('dt')].map((el) => el.textContent)).toEqual([
      'Kanıt düzeyi', 'Durum', 'Son değişiklik', 'Sürüm',
    ])
    expect(article!.textContent).toContain('0 / 5')
    expect(article!.textContent).toContain('Örnek')
    expect(article!.textContent).toContain('Strateji öncesi hazırlık, Karar 1 açık')
    expect(article!.querySelector('time')?.dateTime).toBe(plan.updatedAt)
    expect(article!.querySelector('time')?.textContent).toBe('18 Kasım 2026 Çarşamba günü')
    expect([...article!.querySelectorAll('dd')].at(-1)?.textContent).toBe('7')
    expect([...article!.querySelectorAll('button')].map((el) => el.textContent?.trim())).toEqual(['Aç', 'JSON indir', 'Sil'])
  })

  it('karttan açınca seçili planın son konumuna döner', async () => {
    await renderScreen()
    await click(button(host.querySelector('article')!, 'Aç'))
    expect(usePlanStore.getState().currentId).toBe(plan.id)
    expect(navigate).toHaveBeenCalledWith(plan.lastLocation)
  })

  it('karttan indirince geçmiş kayıtları korur ve yedeği işaretler', async () => {
    await renderScreen()
    await click(button(host.querySelector('article')!, 'JSON indir'))
    expect(downloadJson).toHaveBeenCalledWith(expect.stringMatching(/\.json$/), plan)
    expect(usePlanStore.getState().backups[plan.id]).toBeDefined()
    expect(usePlanStore.getState().plans[plan.id]).toEqual(plan)
  })

  it('silmeden önce onay ister ve vazgeçince planı korur', async () => {
    await renderScreen()
    await click(button(host.querySelector('article')!, 'Sil'))
    expect(document.body.textContent).toContain('Plan silinsin mi?')
    expect(usePlanStore.getState().plans[plan.id]).toBeDefined()
    const popup = document.body.querySelector('.ant-popconfirm')!
    await click(button(popup, 'Vazgeç'))
    expect(usePlanStore.getState().plans[plan.id]).toEqual(plan)
    await click(button(host.querySelector('article')!, 'Sil'))
    await click(button(document.body.querySelector('.ant-popconfirm')!, 'Sil'))
    expect(usePlanStore.getState().plans[plan.id]).toBeUndefined()
    expect(host.textContent).toContain('Henüz plan yok.')
  })

  it.each(['Aç', 'JSON indir', 'Sil'])('%s düğmesini ve odağını ekran boyutu değişirken korur', async (label) => {
    await resizeScreen(320, 568)
    const list = host.querySelector('ul[aria-labelledby="plan-list-heading"]')!
    const control = button(list, label)
    control.focus()
    expect(document.activeElement).toBe(control)

    for (const [width, height] of [[844, 390], [1280, 800], [390, 844]]) {
      await resizeScreen(width, height)
      expect(document.activeElement).toBe(control)
      expect(host.querySelector('ul[aria-labelledby="plan-list-heading"]')).toBe(list)
      expect(button(list, label)).toBe(control)
      expect(host.querySelectorAll('article')).toHaveLength(1)
      expect(host.querySelector('table')).toBeNull()
    }
  })

  it('Türkçe aramayı ve sorguyu ekran boyutu değişirken korur', async () => {
    usePlanStore.setState({ plans: { [plan.id]: plan, other: emptyPlan('other', 'Dokuma atölyesi') } })
    await renderScreen()
    const search = host.querySelector<HTMLInputElement>('input[aria-label="Plan adı ara"]')!
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
    await act(async () => {
      setValue.call(search, 'iş')
      search.dispatchEvent(new Event('input', { bubbles: true }))
    })
    expect(host.querySelectorAll('article')).toHaveLength(1)
    expect(host.querySelector('article')?.textContent).toContain(plan.name)
    await resizeScreen(1280, 800)
    expect(host.querySelectorAll('article')).toHaveLength(1)
    expect(host.querySelector('article')?.textContent).toContain(plan.name)
    expect(host.querySelector('article')?.textContent).not.toContain('Dokuma atölyesi')
    await resizeScreen(320, 568)
    expect(host.querySelectorAll('article')).toHaveLength(1)
    expect(search.value).toBe('iş')
  })

  it('dosyayı geçmiş kayıtlarıyla kopya olarak içe alır', async () => {
    await renderScreen()
    const incoming = { ...plan, example: false }
    const contents = JSON.stringify(incoming)
    const file = new File([contents], 'plan.json', { type: 'application/json' })
    Object.defineProperty(file, 'text', { value: () => Promise.resolve(contents) })
    const input = host.querySelector<HTMLInputElement>('input[type="file"]')!
    Object.defineProperty(input, 'files', { configurable: true, value: [file] })
    await act(async () => {
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })
    const state = usePlanStore.getState()
    const imported = state.plans[state.currentId!]
    expect(Object.keys(state.plans)).toHaveLength(2)
    expect(imported.id).not.toBe(plan.id)
    expect(imported.name).toBe(`${plan.name} (kopya)`)
    expect(imported.revisions).toEqual(plan.revisions)
    expect(imported.outputs).toEqual(plan.outputs)
    expect(state.plans[plan.id]).toEqual(plan)
    expect(host.querySelectorAll('article')).toHaveLength(2)
  })

  it('kayıt okunamazsa yeni plan ve içe alma girişlerini kapalı tutar', async () => {
    usePlanStore.setState({ loadFailed: true })
    await renderScreen()
    expect(button(host, 'Yeni plan').disabled).toBe(true)
    expect(button(host, 'Daha fazla').disabled).toBe(true)
  })

  it.each([
    ['Plan adı', 'A harfinden Z harfine', 'Z harfinden A harfine', ['Ada', 'Çınar', 'Zeytin'], ['Zeytin', 'Çınar', 'Ada']],
    ['Kanıt düzeyi', 'düşükten yükseğe', 'yüksekten düşüğe', ['Çınar', 'Ada', 'Zeytin'], ['Zeytin', 'Ada', 'Çınar']],
    ['Son değişiklik', 'eskiden yeniye', 'yeniden eskiye', ['Çınar', 'Zeytin', 'Ada'], ['Ada', 'Zeytin', 'Çınar']],
    ['Sürüm', 'küçükten büyüğe', 'büyükten küçüğe', ['Zeytin', 'Çınar', 'Ada'], ['Ada', 'Çınar', 'Zeytin']],
  ] as const)('%s alanını iki yönde sıralar', async (field, ascending, descending, ascNames, descNames) => {
    const fixtures = ['Ada', 'Zeytin', 'Çınar'].map((name, index) => ({
      ...emptyPlan(`sort-${index}`, name),
      updatedAt: `2026-11-${18 - index}T12:00:00.000Z`,
      revision: [3, 1, 2][index],
      decisions: Array.from({ length: [1, 2, 0][index] }, (_, gate) => ({
        id: `decision-${gate}`, gate: gate + 1, scope: name, criteria: [], suggested: 'ilerle' as const,
        chosen: 'ilerle' as const, reason: 'Koşullar sağlandı.', retriesLeft: 1,
        decidedBy: 'Ayşe', decidedAt: '2026-11-17T12:00:00.000Z', revision: 1,
      })),
    }))
    setPlans(fixtures)
    await renderScreen()
    await chooseSort(`${field}: ${ascending}`)
    expect(names()).toEqual(ascNames)
    await chooseSort(`${field}: ${descending}`)
    expect(names()).toEqual(descNames)
    expect(usePlanStore.getState().plans['sort-0']).toEqual(fixtures[0])
  })

  it('ilk açılışta en yeni on kaydı gösterir ve kalan sayfalara geçirir', async () => {
    setPlans(numberedPlans(23))
    await renderScreen()
    expect(names()).toEqual(Array.from({ length: 10 }, (_, index) => `Plan ${23 - index}`))
    expect(host.querySelectorAll('article')).toHaveLength(10)
    await nextPage()
    expect(names()).toEqual(Array.from({ length: 10 }, (_, index) => `Plan ${String(13 - index).padStart(2, '0')}`))
    await nextPage()
    expect(names()).toEqual(['Plan 03', 'Plan 02', 'Plan 01'])
    expect(host.querySelector<HTMLButtonElement>('.ant-pagination-next button')?.disabled).toBe(true)
  })

  it('arama ve sıralama birlikte çalışır ve ilk sayfaya döner', async () => {
    setPlans(numberedPlans(23))
    await renderScreen()
    await nextPage()
    await chooseSort('Plan adı: A harfinden Z harfine')
    expect(names()[0]).toBe('Plan 01')
    await nextPage()
    expect(names()[0]).toBe('Plan 11')
    await searchFor('Plan 0')
    expect(names()).toEqual(Array.from({ length: 9 }, (_, index) => `Plan 0${index + 1}`))
    await searchFor('bulunmayan')
    expect(names()).toEqual([])
    await click(button(host, 'Aramayı temizle'))
    expect(names()[0]).toBe('Plan 01')
    expect(names()).toHaveLength(10)
  })

  it('son sayfadaki plan silinince geçerli sayfaya döner ve yeni kayıtta orada kalır', async () => {
    setPlans(numberedPlans(21))
    await renderScreen()
    await nextPage()
    await nextPage()
    expect(names()).toEqual(['Plan 01'])
    await click(button(host.querySelector('article')!, 'Sil'))
    await click(button(document.body.querySelector('.ant-popconfirm')!, 'Sil'))
    expect(names()).toHaveLength(10)
    expect(names()[0]).toBe('Plan 11')
    const added = numberedPlans(22)[21]
    await act(async () => {
      usePlanStore.setState((state) => ({ plans: { ...state.plans, [added.id]: added } }))
    })
    expect(names()).toHaveLength(10)
    expect(names()[0]).toBe('Plan 12')
  })

  it('sıralama ve sayfalama kontrollerini yön değişiminde aynı odakla korur', async () => {
    setPlans(numberedPlans(23))
    await resizeScreen(320, 568)
    const sort = host.querySelector<HTMLInputElement>('input[aria-label="Planları sırala"]')
    expect(sort).not.toBeNull()
    sort!.focus()
    await act(async () => {
      sort!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    })
    await resizeScreen(844, 390)
    expect(document.activeElement === sort).toBe(true)
    expect(sort!.getAttribute('aria-expanded')).toBe('true')
    expect(host.querySelectorAll('input[aria-label="Planları sırala"]')).toHaveLength(1)
    await act(async () => {
      sort!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }))
    })
    const next = host.querySelector<HTMLButtonElement>('.ant-pagination-next button')!
    next.focus()
    await resizeScreen(1280, 800)
    expect(document.activeElement === next).toBe(true)
    expect(host.querySelector('.ant-pagination-next button')).toBe(next)
    await resizeScreen(320, 568)
    expect(document.activeElement === next).toBe(true)
    expect(host.querySelector('table')).toBeNull()
  })
})
