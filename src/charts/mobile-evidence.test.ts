import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App, ConfigProvider } from 'antd'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EvidenceScreen } from '@/screens/EvidenceScreen'
import { emptyPlan, type Evidence } from '@/data/types'
import { usePlanStore } from '@/store/planStore'
import { formatDate } from '@/engine/format'

// Grafik yüklemesi başka işin kapsamındadır. Liste gerçek Ant Design kontrollerini kullanır.
vi.mock('@/charts/ChartFrame', () => ({ ChartFrame: () => null }))

const makeEvidence = (id: string, patch: Partial<Evidence> = {}): Evidence => ({
  id,
  title: `Kanıt ${id}`,
  kind: 'gozlem',
  ladder: 3,
  date: '2026-11-13',
  source: 'Müşteri görüşmesi',
  group: 'Küçük işletmeler',
  counterFinding: 'İkinci müşteri aynı sorunu yaşamadı.',
  attachmentName: 'gorusme.txt',
  linkedSteps: ['00'],
  createdAt: '2026-11-13T12:00:00.000Z',
  updatedAt: '2026-11-13T12:00:00.000Z',
  ...patch,
})

let root: Root
let container: HTMLDivElement
const messageSuccess = vi.fn<ReturnType<typeof App.useApp>['message']['success']>()

async function mount(evidence: Evidence[]) {
  const plan = { ...emptyPlan('evidence-test', 'Kanıt denemesi'), evidence }
  usePlanStore.setState({ plans: { [plan.id]: plan }, currentId: plan.id })
  await act(async () => {
    root.render(createElement(ConfigProvider, { virtual: false, theme: { token: { motion: false } } },
      createElement(MemoryRouter, null, createElement(EvidenceScreen))))
  })
}

function records() {
  const tables = container.querySelectorAll('.evidence-table.ant-table-wrapper table')
  expect(tables, 'Kanıtlar tek gerçek Ant Design tablosunda bulunmalı.').toHaveLength(1)
  const rows = Array.from(tables[0].querySelectorAll<HTMLTableRowElement>('tbody.ant-table-tbody > tr[data-row-key]'))
  const cards = rows.map((row) => {
    expect(row.cells, 'Her kanıt satırı tek sütun taşımalı.').toHaveLength(1)
    const card = row.cells[0].querySelector<HTMLElement>('article.evidence-card')
    expect(card, 'Tablo satırı kanıt kartını taşımalı.').not.toBeNull()
    return card!
  })
  expect(container.querySelectorAll('.evidence-card'), 'Her kayıt yalnız bir kez gösterilmeli.').toHaveLength(cards.length)
  return cards
}

function button(name: string, scope: ParentNode = document.body) {
  const result = Array.from(scope.querySelectorAll<HTMLButtonElement>('button'))
    .find((node) => node.getAttribute('aria-label') === name || node.textContent?.trim() === name)
  expect(result, `${name} düğmesi bulunmalı.`).toBeDefined()
  return result!
}

async function click(element: HTMLElement) {
  await act(async () => { element.click() })
}

async function inputValue(input: HTMLInputElement, value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

async function choose(label: string, text: string) {
  const input = container.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)
  expect(input, `${label} filtresi bulunmalı.`).not.toBeNull()
  await act(async () => {
    input!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
  })
  const option = Array.from(document.querySelectorAll<HTMLElement>('.ant-select-item-option'))
    .find((node) => node.textContent?.trim() === text && !node.closest('.ant-select-dropdown-hidden'))
  expect(option, `${text} seçeneği bulunmalı.`).toBeDefined()
  await click(option!)
  await act(async () => {
    input!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }))
  })
}

beforeEach(() => {
  // Bildirim yüzeyi kapsam dışıdır. Tablo, filtreler ve onay kontrolleri gerçektir.
  // App sağlayıcısı yerine yalnız başarı bildirimini izleyerek gereksiz portalları önleriz.
  const useApp = App.useApp
  messageSuccess.mockClear()
  vi.spyOn(App, 'useApp').mockImplementation(() => {
    const context = useApp()
    return { ...context, message: { ...context.message, success: messageSuccess } }
  })
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('matchMedia', vi.fn((media: string) => ({
    matches: false, media, onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(),
    addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
  })))
  // jsdom yerleşim hesaplamaz. Açılan kontrollerin ölçüm aboneliği burada boş kalır.
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  })
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => { root.unmount() })
  container.remove()
  localStorage.clear()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('mobil kanıt listesi', () => {
  it('bir kaydın bilgilerini kartta gösterir ve ayrıntıyı düğmeyle açar', async () => {
    await mount([makeEvidence('ilk')])
    const [record] = records()
    expect(records()).toHaveLength(1)
    for (const text of ['Kanıt ilk', 'Gözlem', 'Zaman ayırdı veya veri paylaştı',
      '13 Kasım 2026 Cuma günü', 'Müşteri görüşmesi', 'Küçük işletmeler',
      'İkinci müşteri aynı sorunu yaşamadı.']) expect(record.textContent).toContain(text)
    const open = button('Kanıtı aç: Kanıt ilk', record)
    open.focus()
    expect(document.activeElement).toBe(open)
    await click(open)
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain('Kullanıldığı adımlar')
    expect(document.querySelector('[role="dialog"] a')?.getAttribute('href')).toBe('/karar/1/adim/00')
  })

  it('aramayı tür ve basamak filtreleriyle birleştirir, seçimleri korur', async () => {
    await mount([
      makeEvidence('a', { title: 'İşletme gözlemi', ladder: 1 }),
      makeEvidence('b', { title: 'İşletme tahmini', kind: 'tahmin', ladder: 1 }),
      makeEvidence('c', { title: 'İşletme varsayımı', kind: 'varsayim', ladder: 7 }),
      makeEvidence('d', { title: 'Başka görüşme', group: 'Öğrenciler', ladder: 1 }),
    ])
    const checkbox = records()[0].querySelector<HTMLInputElement>('input[type="checkbox"]')!
    await click(checkbox)
    await inputValue(container.querySelector<HTMLInputElement>('input[aria-label="Kanıt ara"]')!, 'İŞLETME')
    await choose('Kanıt türünü filtrele', 'Gözlem')
    await choose('Kanıt türünü filtrele', 'Tahmin')
    await choose('Kanıt basamağını filtrele', '1. Müşteri ödeme yaptı')
    expect(records()).toHaveLength(2)
    expect(records().map((node) => node.textContent).join(' ')).not.toContain('İşletme varsayımı')
    expect(container.textContent).toContain('1 kanıt seçildi.')
    await click(button('Filtreleri temizle'))
    expect(records()).toHaveLength(4)
    expect(records()[0].querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked).toBe(true)
  })

  it('tarihe göre sıralar, sayfalar ve filtre değişince ilk sayfayı gösterir', async () => {
    await mount(Array.from({ length: 11 }, (_, i) => makeEvidence(String(i + 1), {
      title: `Kayıt ${String(i + 1).padStart(2, '0')}`,
      date: `2026-11-${String(i + 1).padStart(2, '0')}`,
    })))
    expect(records()).toHaveLength(10)
    expect(records()[0].textContent).toContain('Kayıt 11')
    await choose('Kanıtları sırala', 'Tarih: eskiden yeniye')
    expect(records()[0].textContent).toContain('Kayıt 01')
    await click(container.querySelector<HTMLElement>('.ant-pagination-next button')!)
    expect(records()).toHaveLength(1)
    expect(records()[0].textContent).toContain('Kayıt 11')
    await inputValue(container.querySelector<HTMLInputElement>('input[aria-label="Kanıt ara"]')!, 'Kayıt 01')
    expect(records()).toHaveLength(1)
    expect(records()[0].textContent).toContain('Kayıt 01')
  })

  it('karttan düzenler, diğer alanları ve güncel kayıt tarihini korur', async () => {
    const original = makeEvidence('ilk')
    await mount([original, makeEvidence('ikinci')])
    await click(button('Kanıtı aç: Kanıt ilk', records()[0]))
    await click(button('Düzenle'))
    const label = Array.from(document.querySelectorAll<HTMLLabelElement>('label'))
      .find((node) => node.textContent === 'Kanıtın adı')!
    await inputValue(document.getElementById(label.htmlFor) as HTMLInputElement, 'Güncel kanıt')
    await click(button('Kaydet'))
    const saved = usePlanStore.getState().plans['evidence-test'].evidence[0]
    expect(saved).toMatchObject({ ...original, title: 'Güncel kanıt', updatedAt: saved.updatedAt })
    expect(messageSuccess).toHaveBeenCalledExactlyOnceWith('Kanıt güncellendi.')
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain(formatDate(saved.updatedAt))
    await click(button('Kapat'))
    expect(records()[0].textContent).toContain('Güncel kanıt')
  })

  it('yalnız seçilen kanıtı kullanıcı onayından sonra siler', async () => {
    await mount([makeEvidence('ilk'), makeEvidence('ikinci')])
    await click(records()[0].querySelector<HTMLInputElement>('input[type="checkbox"]')!)
    await click(button('Toplu işlem'))
    const remove = Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]'))
      .find((node) => node.textContent?.includes('Seçilenleri sil'))!
    await click(remove)
    expect(usePlanStore.getState().plans['evidence-test'].evidence).toHaveLength(2)
    await click(button('Sil'))
    expect(usePlanStore.getState().plans['evidence-test'].evidence.map((item) => item.id)).toEqual(['ikinci'])
    expect(messageSuccess).toHaveBeenCalledExactlyOnceWith('1 kanıt silindi.')
    expect(container.textContent).not.toContain('1 kanıt seçildi.')
  })
})
