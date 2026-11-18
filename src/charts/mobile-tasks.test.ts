import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App, ConfigProvider } from 'antd'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TasksScreen } from '@/screens/TasksScreen'
import { emptyPlan, type Task } from '@/data/types'
import { usePlanStore } from '@/store/planStore'

const makeTask = (id: string, patch: Partial<Task> = {}): Task => ({
  id, action: `İş ${id}`, owner: 'Ayşe Yılmaz', dueDate: '2026-11-13',
  status: 'acik', acceptance: 'Müşteri yazılı onay verir.',
  createdAt: '2026-11-10T12:00:00Z', updatedAt: '2026-11-11T12:00:00Z',
  ...patch,
})

let root: Root
let container: HTMLDivElement

async function click(element: HTMLElement) {
  await act(async () => { element.click() })
}

async function mount(tasks: Task[]) {
  const plan = { ...emptyPlan('tasks-test', 'İş denemesi'), tasks }
  plan.decisions = [{
    id: 'karar-2', gate: 2, scope: 'İş denemesi', criteria: [], suggested: 'beklet',
    chosen: 'beklet', reason: 'Kanıt bekleniyor.', retriesLeft: 1,
    decidedBy: 'Ayşe', decidedAt: '2026-11-10T12:00:00Z', revision: 1,
  }]
  usePlanStore.setState({ plans: { [plan.id]: plan }, currentId: plan.id })
  await act(async () => {
    root.render(createElement(ConfigProvider, { virtual: false, theme: { token: { motion: false } } },
      createElement(App, null, createElement(TasksScreen))))
  })
}

async function openTab(name: string) {
  const tab = Array.from(container.querySelectorAll<HTMLElement>('[role="tab"]'))
    .find((node) => node.textContent === name)!
  await click(tab)
}

const openList = () => openTab('Liste')

function records() {
  const list = container.querySelector('ul[aria-label="İş kayıtları"]')
  expect(list, 'Telefon görünümünde görev kartları bulunmalı.').not.toBeNull()
  return Array.from(list!.children) as HTMLElement[]
}

async function choose(label: string, optionText: string, scope: ParentNode = container) {
  const input = scope.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)
  expect(input, `${label} kontrolü bulunmalı.`).not.toBeNull()
  await act(async () => {
    input!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
  })
  const option = Array.from(document.querySelectorAll<HTMLElement>('.ant-select-item-option'))
    .find((node) => node.textContent?.trim() === optionText && !node.closest('.ant-select-dropdown-hidden'))
  expect(option, `${optionText} seçeneği bulunmalı.`).toBeDefined()
  await click(option!)
  await act(async () => {
    input!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }))
  })
}

async function enter(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const prototype = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  await act(async () => {
    Object.getOwnPropertyDescriptor(prototype, 'value')!.set!.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

function button(text: string) {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
    .find((node) => node.textContent?.trim() === text)!
}

beforeEach(() => {
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
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => { root.unmount() })
  container.remove()
  localStorage.clear()
  vi.unstubAllGlobals()
})

describe('uyarlanan görev kartları', () => {
  it('her görev için tek durum kontrolünü ve yön değişiminde aynı odağı korur', async () => {
    await mount([makeTask('ilk'), makeTask('ikinci')])
    await openList()
    const status = records()[0].querySelector<HTMLInputElement>('input[aria-label="Durum: İş ilk"]')!
    await act(async () => { status.focus() })
    for (const [width, height] of [[320, 568], [844, 390], [1280, 800], [320, 568]]) {
      vi.stubGlobal('innerWidth', width)
      vi.stubGlobal('innerHeight', height)
      await act(async () => {
        window.dispatchEvent(new Event('resize'))
        window.dispatchEvent(new Event('orientationchange'))
      })
      expect(document.activeElement).toBe(status)
      expect(records()[0].querySelector('input[aria-label="Durum: İş ilk"]')).toBe(status)
      for (const name of ['İş ilk', 'İş ikinci']) {
        expect(container.querySelectorAll(`input[aria-label="Durum: ${name}"]`)).toHaveLength(1)
      }
    }
    await openTab('Pano')
    expect(container.querySelectorAll('input[aria-label="Durum: İş ilk"]')).toHaveLength(1)
    await openList()
    expect(container.querySelectorAll('input[aria-label="Durum: İş ilk"]')).toHaveLength(1)
  }, 15_000)

  it('görev bilgilerini, bağlı işleri ve eksik alanları açıkça gösterir', async () => {
    await mount([
      makeTask('ilk', { sourceDecisionId: 'karar-2', sourceStep: '06', dependsOn: ['önceki'],
        reopenEvent: 'Müşteri koşulu değiştirirse işi yeniden açın.' }),
      makeTask('önceki', { action: 'Teklifi hazırlayın.', owner: undefined, dueDate: undefined,
        acceptance: undefined, status: 'taslak' }),
    ])
    await openList()
    const [first, second] = records()
    for (const text of ['İş ilk', 'Ayşe Yılmaz', '13 Kasım 2026 Cuma günü', 'Kontrol 2',
      'Adım 06', 'Teklifi hazırlayın.', 'Müşteri yazılı onay verir.',
      'Müşteri koşulu değiştirirse işi yeniden açın.', '10 Kasım 2026 Salı günü',
      '11 Kasım 2026 Çarşamba günü']) expect(first.textContent).toContain(text)
    for (const text of ['Sorumlu eksik', 'Tarih yok', 'Elle eklendi', 'Kabul ölçütü yazılmadı.']) {
      expect(second.textContent).toContain(text)
    }
  })

  it('karttan durumu değiştirir ve diğer görev bilgilerini korur', async () => {
    const original = makeTask('ilk', { dependsOn: ['ikinci'], reopenEvent: 'Koşul değişirse yeniden açın.' })
    const other = makeTask('ikinci')
    await mount([original, other])
    await openList()
    await choose('Durum: İş ilk', 'Bitti', records()[0])
    const saved = usePlanStore.getState().plans['tasks-test'].tasks
    expect(saved[0]).toMatchObject({ ...original, status: 'bitti', updatedAt: saved[0].updatedAt })
    expect(saved[1]).toEqual(other)
    expect(records()[0].textContent).toContain('Bitti')
  })

  it('filtreyi, tarih sırasını ve sayfayı sekmeler arasında korur', async () => {
    await mount(Array.from({ length: 11 }, (_, i) => makeTask(String(i + 1), {
      action: `Görev ${String(i + 1).padStart(2, '0')}`,
      dueDate: `2026-11-${String(i + 1).padStart(2, '0')}`,
      status: i === 10 ? 'bitti' : 'acik',
    })))
    await openList()
    expect(records()).toHaveLength(10)
    await choose('İşleri sırala', 'Son tarih: yeniden eskiye')
    expect(records()[0].textContent).toContain('Görev 11')
    await click(container.querySelector<HTMLElement>('.ant-pagination-next button')!)
    expect(records()).toHaveLength(1)
    expect(records()[0].textContent).toContain('Görev 01')
    await openTab('Pano')
    await openList()
    expect(records()).toHaveLength(1)
    expect(records()[0].textContent).toContain('Görev 01')
    await choose('İş durumunu filtrele', 'Bitti')
    await openTab('Pano')
    await openList()
    expect(records()).toHaveLength(1)
    expect(records()[0].textContent).toContain('Görev 11')
    await choose('Durum: Görev 11', 'Açık', records()[0])
    expect(records()).toHaveLength(0)
    expect(container.textContent).toContain('Bu durumda iş yok.')
    expect(document.activeElement).toBe(container.querySelector('input[aria-label="İş durumunu filtrele"]'))
  }, 15_000)

  it('yeniden boyutlandırmada form girdisini ve odağı koruyarak taslak ekler', async () => {
    await mount([])
    await click(button('İş ekle'))
    const action = document.querySelector<HTMLTextAreaElement>('[role="dialog"] textarea')!
    await enter(action, 'Müşteriyi arayın.')
    await act(async () => { action.focus() })
    await act(async () => { window.dispatchEvent(new Event('resize')) })
    expect(document.activeElement).toBe(action)
    expect(action.value).toBe('Müşteriyi arayın.')
    await click(button('İşi kaydet'))
    const saved = usePlanStore.getState().plans['tasks-test'].tasks
    expect(saved).toHaveLength(1)
    expect(saved[0]).toMatchObject({ action: 'Müşteriyi arayın.', status: 'taslak' })
    await openList()
    expect(records()[0].textContent).toContain('Müşteriyi arayın.')
    expect(records()[0].textContent).toContain('Sorumlu eksik')
  })
})
