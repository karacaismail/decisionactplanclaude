import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { emptyPlan, type PlanDoc } from '@/data/types'
import { formatDate } from '@/engine/format'
import { HistoryScreen } from '@/screens/HistoryScreen'
import { useCurrentPlan } from '@/store/planStore'

vi.mock('@/store/planStore', () => ({ useCurrentPlan: vi.fn() }))

function historyPlan(): PlanDoc {
  const plan = emptyPlan('history-test', 'Geçmiş denemesi')
  plan.revision = 7
  plan.decisions = [{
    id: 'decision-1', gate: 1, scope: 'Talep', criteria: [], suggested: 'beklet', chosen: 'kosulluIlerle',
    reason: 'Müşteriler denemeyi kabul etti. Ekip ödeme kanıtını ayrıca izleyecek.',
    counterView: 'Ödeme henüz gelmedi.', secondOpinion: 'Ayşe kanıtları inceledi.',
    conditional: {
      scope: 'Yalnız ön sipariş denemesi', amountKurus: 100_000, deadline: '2026-12-03',
      owner: 'Ece', closingEvidence: 'Banka kaydı', issuedAt: '2026-11-15T12:00:00Z',
    },
    retriesLeft: 1, decidedBy: 'Ece Yılmaz', decidedAt: '2026-11-15T12:00:00Z',
    reopenWhen: 'Ödeme gelmezse kapıyı yeniden açın.', revision: 5, stale: true,
  }]
  plan.transitions = [{
    id: 'transition-1', outcome: 'kosullu', suggested: 'degil',
    reason: 'Ekip yalnız dağıtım konusunu planlayacak.', decidedBy: 'Ali Demir',
    decidedAt: '2026-11-17T12:00:00Z', reviewed: true, secondOpinion: 'Deniz koşulu inceledi.',
    conditional: {
      topic: 'Dağıtım denemesi', openQuestion: 'Ürün hangi yoldan ulaşacak?',
      owner: 'Selin', deadline: '2026-12-10',
    },
    mandatoryMet: 7, mandatoryTotal: 9, supportingMet: 2, supportingTotal: 4,
    level: 3, revision: 6, stale: true,
  }]
  plan.changes = [{
    id: 'change-1', step: '00', key: 'budgetKurus', label: 'Harcama sınırı',
    before: 100_000, after: 200_000, at: '2026-11-16T12:00:00Z',
    needsReview: true, reviewer: 'Zeynep', reviewedAt: '2026-11-18T12:00:00Z',
  }]
  return plan
}

describe('Geçmiş kartları', () => {
  let host: HTMLDivElement
  let root: Root
  let plan: PlanDoc

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
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    plan = historyPlan()
    vi.mocked(useCurrentPlan).mockReturnValue(plan)
  })

  afterEach(async () => {
    await act(async () => root.unmount())
    host.remove()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  async function render() {
    await act(async () => root.render(createElement(HistoryScreen)))
  }

  async function selectFilter(label: string) {
    const option = [...host.querySelectorAll('label')].find((item) => item.textContent === label)
    expect(option, `Filtre bulunamadı: ${label}`).toBeDefined()
    await act(async () => option?.querySelector('input')?.click())
  }

  function cards() {
    return [...host.querySelectorAll('article')]
  }

  it('her kaydı tek kartta gösterir ve yeni kayıttan eski kayda doğru sıralar', async () => {
    await render()
    expect(cards()).toHaveLength(3)
    expect(cards().map((card) => card.querySelector('h3')?.textContent)).toEqual([
      'Geçiş kapısı', 'Harcama sınırı', 'Kapı 1',
    ])
    for (const card of cards()) {
      expect(card.getAttribute('aria-labelledby')).toBe(card.querySelector('h3')?.id)
      expect(card.querySelector('h3')?.id).toBeTruthy()
    }
    const decision = cards()[2].textContent
    for (const detail of [
      plan.decisions[0].reason, 'Ece Yılmaz', 'Sürüm 5', 'İnceleme bekliyor',
      'Koşullu ilerle', 'Sistemin önerisi: Beklet', 'Ödeme henüz gelmedi.',
      'Ayşe kanıtları inceledi.', 'Yalnız ön sipariş denemesi',
      formatDate('2026-12-03', false), 'Ödeme gelmezse kapıyı yeniden açın.',
    ]) expect(decision).toContain(detail)
    const transition = cards()[0].textContent
    for (const detail of [
      'Ekip yalnız dağıtım konusunu planlayacak.', 'Ali Demir', 'Sürüm 6',
      '9 zorunlu ölçütün 7 tanesi karşılandı.', '4 destekleyici ölçütün 2 tanesi karşılandı.',
      'Deniz koşulu inceledi.', 'Dağıtım denemesi',
      'Ürün hangi yoldan ulaşacak?', 'Selin', formatDate('2026-12-10', false),
      'Geçiş kapısını yeniden inceleyin.',
    ]) expect(transition).toContain(detail)
    expect(cards()[1].textContent).toContain('Zeynep')
    expect(cards()[1].textContent).toContain(formatDate('2026-11-18T12:00:00Z'))
  })

  it('eski ve yeni değeri ok yönüne gerek kalmadan adlandırır', async () => {
    await render()
    const values = [...host.querySelectorAll('dl > div')].map((pair) => [
      pair.querySelector('dt')?.textContent, pair.querySelector('dd')?.textContent,
    ])
    expect(values).toEqual([['Önce', '1.000,00 TL'], ['Sonra', '2.000,00 TL']])
  })

  it('dört filtreyi korur ve filtreleme sırasında plan özetini değiştirmez', async () => {
    await render()
    const summary = host.querySelector('aside')?.textContent
    for (const [label, title] of [
      ['Kararlar', 'Kapı 1'], ['Geçiş', 'Geçiş kapısı'], ['Değişiklikler', 'Harcama sınırı'],
    ]) {
      await selectFilter(label)
      expect(cards()).toHaveLength(1)
      expect(cards()[0].querySelector('h3')?.textContent).toBe(title)
      expect(host.querySelector('aside')?.textContent).toBe(summary)
    }
    await selectFilter('Hepsi')
    expect(cards()).toHaveLength(3)
  })

  it('filtreleri tek adlı radyo grubunda tutar ve yalnız birini seçer', async () => {
    await render()
    const group = host.querySelector('[role="radiogroup"][aria-label="Kayıt türü"]')
    expect(group).not.toBeNull()
    const radios = [...group!.querySelectorAll<HTMLInputElement>('input[type="radio"]')]
    expect(radios).toHaveLength(4)
    expect(radios[0].name).not.toBe('')
    expect(new Set(radios.map((radio) => radio.name)).size).toBe(1)
    await selectFilter('Geçiş')
    expect(radios.filter((radio) => radio.checked)).toHaveLength(1)
    expect(radios[2].checked).toBe(true)
  })

  it('boş filtrede açıklama verir ve başka türdeki kayda geri döner', async () => {
    plan.transitions = []
    await render()
    await selectFilter('Geçiş')
    expect(cards()).toHaveLength(0)
    expect(host.textContent).toContain('Geçiş kararı yok.')
    await selectFilter('Kararlar')
    expect(cards()).toHaveLength(1)
  })

  it('plan yoksa kayıt göstermez', async () => {
    vi.mocked(useCurrentPlan).mockReturnValue(undefined)
    await render()
    expect(host.textContent).toBe('')
  })
})
