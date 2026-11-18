import { act, createElement, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EvidenceLadder, EvidenceLadderPicker, LADDER, ladderLabel } from '@/components/EvidenceLadderPicker'

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  vi.unstubAllGlobals()
})

function radios() {
  return Array.from(container.querySelectorAll<HTMLInputElement>('input[type="radio"]'))
}

describe('Mobil kanıt merdiveni', () => {
  it('Seçim grubu Türkçe ad taşır. Boş değerde hiçbir basamak seçilmez.', async () => {
    const onChange = vi.fn()
    await act(async () => root.render(createElement(EvidenceLadderPicker, { onChange, id: 'kanit-basamagi' })))

    const group = container.querySelector('[role="radiogroup"]')
    expect(group?.getAttribute('aria-label')).toBe('Kanıt basamağı')
    expect(group?.getAttribute('aria-orientation')).toBe('vertical')
    expect(container.querySelector('#kanit-basamagi')?.contains(group)).toBe(true)
    expect(radios()).toHaveLength(7)
    expect(radios().some((radio) => radio.checked)).toBe(false)
    for (const [index, radio] of radios().entries()) {
      expect(radio.labels?.[0]?.textContent).toContain(LADDER[index].label)
    }
    expect(onChange).not.toHaveBeenCalled()
  })

  it('Etikete basınca sayısal değer gönderir. Seçimi üst bileşen belirler.', async () => {
    const onChange = vi.fn()
    await act(async () => root.render(createElement(EvidenceLadderPicker, { value: 5, onChange })))

    const longLabel = radios()[1].labels?.[0]
    expect(longLabel).toBeDefined()
    await act(async () => longLabel!.click())
    expect(onChange).toHaveBeenCalledExactlyOnceWith(2)
    expect(radios()[4].checked).toBe(true)
    expect(radios()[1].checked).toBe(false)

    await act(async () => root.render(createElement(EvidenceLadderPicker, { value: 2, onChange })))
    expect(radios().filter((radio) => radio.checked)).toEqual([radios()[1]])
    expect(container.querySelector('.ladder-tag')?.textContent).toBe(ladderLabel(2))

    await act(async () => root.render(createElement(EvidenceLadderPicker, { onChange })))
    expect(radios().some((radio) => radio.checked)).toBe(false)
    expect(container.querySelector('.ladder-tag')?.textContent).toBe('Basamak seçilmedi')
  })

  it('Ok tuşları basamağı değiştirir. Son basamaktan ilk basamağa geçilir.', async () => {
    function ControlledPicker() {
      const [value, setValue] = useState(7)
      return createElement(EvidenceLadderPicker, { value, onChange: setValue })
    }
    await act(async () => root.render(createElement(ControlledPicker)))

    for (const [key, selectedIndex] of [['ArrowDown', 0], ['ArrowUp', 6], ['ArrowLeft', 5], ['ArrowRight', 6]] as const) {
      const selected = radios().find((radio) => radio.checked)!
      await act(async () => {
        selected.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
      })
      expect(radios().filter((radio) => radio.checked)).toEqual([radios()[selectedIndex]])
      expect(container.querySelector('.ladder-tag')?.textContent).toBe(ladderLabel(selectedIndex + 1))
    }
  })

  it('Salt okunur listede seçili basamak ekran okuyucuya bildirilir.', async () => {
    await act(async () => root.render(createElement(EvidenceLadder, { value: 3 })))

    const rows = container.querySelectorAll('li')
    expect(rows).toHaveLength(7)
    expect(container.querySelectorAll('[aria-current="true"]')).toHaveLength(1)
    expect(rows[2].getAttribute('aria-current')).toBe('true')
    expect(rows[2].textContent).toContain(LADDER[2].label)

    await act(async () => root.render(createElement(EvidenceLadder, { value: 6 })))
    expect(container.querySelectorAll('[aria-current="true"]')).toHaveLength(1)
    expect(container.querySelector('[aria-current="true"]')?.textContent).toContain(LADDER[5].label)

    await act(async () => root.render(createElement(EvidenceLadder)))
    expect(container.querySelector('[aria-current="true"]')).toBeNull()
  })
})
