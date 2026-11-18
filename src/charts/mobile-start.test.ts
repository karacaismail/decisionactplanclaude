import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { emptyPlan, type Entry, type PlanDoc } from '@/data/types'
import { StartScreen } from '@/screens/StartScreen'

const state = vi.hoisted(() => ({
  plan: undefined as PlanDoc | undefined,
  navigate: vi.fn(),
  update: vi.fn<(change: (plan: PlanDoc) => unknown) => void>(),
  setLocation: vi.fn(),
}))

vi.mock('react-router', () => ({ useNavigate: () => state.navigate }))
vi.mock('@/store/planStore', () => ({
  useCurrentPlan: () => state.plan,
  usePlanStore: (select: (store: typeof state) => unknown) => select(state),
}))

const routes: { entry: Entry; title: string; path: string; description: string }[] = [
  { entry: 'yeni', title: 'Yeni bir fikrim var', path: '/karar/1/adim/00', description: "Karar 1'den başlayın. Önce işinizi yedi soruyla anlatın." },
  { entry: 'devralma', title: 'Çalışan bir işi devralıyorum', path: '/devralma', description: 'Vaatleri sonuçlarla karşılaştırın. Kanıtı eksik olan ilk karara dönün.' },
  { entry: 'acil', title: 'Acil zarar tehlikesi var', path: '/karar/1/adim/02', description: 'Etkilenen işi hemen durdurun. Sorumlu kişi güvenli koşulları doğrulayınca kararı yeniden açın.' },
]

let container: HTMLDivElement
let root: Root

function renderStart() {
  act(() => root.render(createElement(StartScreen)))
}

function choices() {
  return Array.from(container.querySelectorAll<HTMLElement>('[role="radio"]'))
}

function continueButton() {
  const button = Array.from(container.querySelectorAll('button')).find((item) => item.textContent?.includes('Devam et'))
  expect(button).toBeDefined()
  return button!
}

function referencedText(element: Element, attribute: string) {
  const ids = element.getAttribute(attribute)
  return ids?.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? '').join(' ')
}

function press(element: HTMLElement, key: string) {
  act(() => element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })))
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('matchMedia', (media: string) => ({
    media,
    matches: media.includes('max-width: 575px'),
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
  state.plan = emptyPlan('start-test', 'Başlangıç denemesi')
  state.plan.entry = undefined
  state.update.mockImplementation((change) => {
    if (state.plan) change(state.plan)
  })
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.unstubAllGlobals()
})

describe('Başlangıç kartları', () => {
  it('her kartı kısa adı ve ayrı açıklamasıyla tanıtır', () => {
    renderStart()
    expect(choices()).toHaveLength(routes.length)
    for (const [index, route] of routes.entries()) {
      const choice = choices()[index]
      const name = referencedText(choice, 'aria-labelledby') ?? choice.getAttribute('aria-label') ?? choice.textContent
      expect(name).toBe(route.title)
      expect(referencedText(choice, 'aria-describedby')).toBe(route.description)
    }
  })

  it('seçim yapılmadan devamı kapatır ve kullanıcıya sonraki işi anlatır', () => {
    renderStart()
    const group = container.querySelector('[role="radiogroup"]')!
    expect(referencedText(group, 'aria-describedby')).toBe('Bir yol seçin. Ardından “Devam et” düğmesine basın.')
    expect(continueButton().disabled).toBe(true)
    expect(choices().map((choice) => choice.tabIndex)).toEqual([0, -1, -1])
    act(() => continueButton().click())
    expect(state.update).not.toHaveBeenCalled()
    expect(state.setLocation).not.toHaveBeenCalled()
    expect(state.navigate).not.toHaveBeenCalled()
  })

  it.each(routes)('$title seçimini yalnız devam edilince kaydeder', ({ entry, path }) => {
    renderStart()
    const choice = choices().find((item) => item.dataset.value === entry)!
    act(() => choice.click())
    expect(choice.getAttribute('aria-checked')).toBe('true')
    expect(continueButton().disabled).toBe(false)
    expect(state.update).not.toHaveBeenCalled()
    expect(state.navigate).not.toHaveBeenCalled()
    act(() => continueButton().click())
    expect(state.plan?.entry).toBe(entry)
    expect(state.update).toHaveBeenCalledTimes(1)
    expect(state.setLocation).toHaveBeenCalledExactlyOnceWith(path)
    expect(state.navigate).toHaveBeenCalledExactlyOnceWith(path)
  })

  it('ok tuşlarıyla seçimi ve odağı birlikte taşır', () => {
    renderStart()
    const items = choices()
    act(() => items[0].focus())
    for (const [key, index] of [['ArrowUp', 2], ['ArrowDown', 0], ['ArrowRight', 1], ['ArrowLeft', 0]] as const) {
      press(document.activeElement as HTMLElement, key)
      expect(document.activeElement).toBe(items[index])
      expect(items[index].getAttribute('aria-checked')).toBe('true')
      expect(items.filter((item) => item.tabIndex === 0)).toEqual([items[index]])
    }
    expect(state.update).not.toHaveBeenCalled()
    expect(state.navigate).not.toHaveBeenCalled()
  })

  it.each(['Enter', ' '])('%s tuşuyla seçer ve kendiliğinden sayfa değiştirmez', (key) => {
    renderStart()
    const choice = choices()[0]
    act(() => choice.focus())
    press(choice, key)
    expect(choice.getAttribute('aria-checked')).toBe('true')
    expect(continueButton().disabled).toBe(false)
    expect(state.update).not.toHaveBeenCalled()
    expect(state.navigate).not.toHaveBeenCalled()
  })

  it('kayıtlı başlangıç yolunu seçili gösterir', () => {
    state.plan!.entry = 'devralma'
    renderStart()
    expect(choices().map((choice) => choice.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false'])
    expect(choices().map((choice) => choice.tabIndex)).toEqual([-1, 0, -1])
    expect(continueButton().disabled).toBe(false)
    expect(state.update).not.toHaveBeenCalled()
  })
})
