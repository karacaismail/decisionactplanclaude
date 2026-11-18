import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'
import type { PlanDoc } from '../src/data/types'

/** İş 4 regresyonları. Scratch dosyalarına veya sabit sunucu adresine bağımlı değildir. */

export interface Finding {
  rule: string
  selector: string
  measured: string
  expected: string
  text?: string
  owner?: string
  screenshot?: string
}

export async function ready(page: Page) {
  await expect(page.locator('main h1').first()).toBeVisible()
  await page.evaluate(async () => {
    await document.fonts.ready
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  })
}

export async function activate(_page: Page, target: Locator, touch: boolean) {
  if (touch) await target.tap()
  else await target.click()
}

export async function openDemo(page: Page, touch: boolean) {
  await page.goto('/')
  await ready(page)
  await activate(page, page.getByRole('button', { name: 'Kafe örneğini aç', exact: true }).first(), touch)
  await page.waitForURL(/#\/ozet$/)
  await ready(page)
}

/** Tarayıcıya bir kez yüklenen, uygulamayı değiştirmeyen ölçüm araçları. */
export async function installProbe(page: Page) {
  await page.evaluate(() => {
    function selector(el: Element): string {
      if (el.id) return `#${CSS.escape(el.id)}`
      const parts: string[] = []
      for (let node: Element | null = el; node && node !== document.body; node = node.parentElement) {
        const parent: Element | null = node.parentElement
        const peers = parent ? [...parent.children].filter((peer) => peer.tagName === node!.tagName) : []
        parts.unshift(`${node.localName}${peers.length > 1 ? `:nth-of-type(${peers.indexOf(node) + 1})` : ''}`)
        if (node.id) { parts[0] = `#${CSS.escape(node.id)}`; break }
      }
      return parts.join(' > ') || 'body'
    }
    function visible(el: Element): boolean {
      if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false
      const box = el.getBoundingClientRect()
      if (box.width <= 0 || box.height <= 0) return false
      // Ekran okuyucuya ayrılmış, boyanmayan metin görünür yazı değildir.
      for (let parent: Element | null = el; parent; parent = parent.parentElement) {
        const s = getComputedStyle(parent)
        if (s.clip === 'rect(0px, 0px, 0px, 0px)' || s.clipPath === 'inset(50%)') return false
        if (s.overflowY === 'hidden' || s.overflowY === 'clip') {
          const p = parent.getBoundingClientRect()
          if (p.bottom <= box.top || p.top >= box.bottom) return false
        }
        if (s.overflowX === 'hidden' || s.overflowX === 'clip') {
          const p = parent.getBoundingClientRect()
          if (p.right <= box.left || p.left >= box.right) return false
        }
      }
      return true
    }
    Object.assign(window, { __mobileQA: { selector, visible } })
  })
}

declare global {
  interface Window {
    __mobileQA: { selector: (el: Element) => string; visible: (el: Element) => boolean }
  }
}

export async function measurePage(page: Page) {
  await installProbe(page)
  return page.evaluate(() => {
    const { selector, visible } = window.__mobileQA
    const findings: Finding[] = []
    const elements = [...document.querySelectorAll('body *')]
    const scrollWidth = document.scrollingElement!.scrollWidth
    const viewportWidth = document.documentElement.clientWidth
    if (scrollWidth > viewportWidth) {
      findings.push({ rule: 'tas-ma', selector: 'document.scrollingElement', measured: `scrollWidth=${scrollWidth}, viewportWidth=${viewportWidth}`, expected: 'scrollWidth <= viewportWidth' })
    }
    let textCount = 0
    for (const el of elements) {
      if (!visible(el) || el.closest('script, style, noscript')) continue
      const box = el.getBoundingClientRect()
      if (box.left < 0 && box.right > 0) {
        let localClip = false
        for (let parent = el.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
          const style = getComputedStyle(parent)
          const bounds = parent.getBoundingClientRect()
          if (['auto', 'scroll', 'hidden', 'clip'].includes(style.overflowX) && bounds.left >= 0 && bounds.right <= viewportWidth) {
            localClip = true
            break
          }
        }
        if (!localClip) findings.push({ rule: 'tas-ma', selector: selector(el), measured: `left=${box.left.toFixed(2)} CSS px`, expected: 'Görünen içerik sayfanın solundan taşmamalı.' })
      }
      const text = [...el.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE).map((node) => node.textContent).join('').trim()
      const field = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement ? el : null
      const placeholder = field && !field.value && field.placeholder ? getComputedStyle(el, '::placeholder') : null
      const placeholderVisible = placeholder && Number(placeholder.opacity) > 0
        && placeholder.visibility === 'visible' && placeholder.display !== 'none'
        && placeholder.color !== 'transparent' && !/rgba\([^)]*,\s*0\s*\)$/.test(placeholder.color)
      const formText = field ? field.value || (placeholderVisible ? field.placeholder : '') : ''
      if (text || formText) {
        textCount++
        const elementSize = parseFloat(getComputedStyle(el).fontSize)
        const size = placeholder ? parseFloat(placeholder.fontSize) : elementSize
        const suffix = placeholder && size !== elementSize ? '::placeholder' : ''
        if (size < 14) findings.push({ rule: 'yazi', selector: selector(el) + suffix, measured: `${size} CSS px`, expected: '>= 14 CSS px', text: (text || formText).slice(0, 100) })
      }
      for (const pseudo of ['::before', '::after']) {
        const style = getComputedStyle(el, pseudo)
        if (!style.content || ['none', 'normal', '""', "''"].includes(style.content) || style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue
        const size = parseFloat(style.fontSize)
        if (size < 14) findings.push({ rule: 'yazi', selector: selector(el) + pseudo, measured: `${size} CSS px`, expected: '>= 14 CSS px', text: style.content })
      }
    }
    const coarse = matchMedia('(any-pointer: coarse)').matches
    const interactive = 'button, a[href], input:not([type="hidden"]), textarea, select, [role="button"], [role="radio"], [role="checkbox"], [role="switch"], [role="tab"], [role="menuitem"], [role="option"], [role="combobox"], [role="slider"], [tabindex="0"]'
    const targets = elements.filter((el) => (el.matches(interactive) || (el instanceof HTMLLabelElement && el.control !== null)) && visible(el))
    const smallTargets = coarse ? targets.filter((el) => {
      const box = el.getBoundingClientRect()
      return box.width < 44 || box.height < 44
    }).map((el) => ({ selector: selector(el), text: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 100) })) : []
    return { findings, smallTargets, textCount, targetCount: targets.length, coarse, viewport: { width: viewportWidth, height: innerHeight }, documentWidth: scrollWidth, canvasCount: elements.filter((el) => el instanceof HTMLCanvasElement && visible(el)).length }
  })
}

/** Küçük görünen kontrolün genişletilmiş gerçek tıklama alanı da ölçülür. */
export async function measureTarget(page: Page, selector: string): Promise<Finding | null> {
  const target = page.locator(selector)
  // Kaydırma yalnız ek basma alanının nokta denetiminde gerekir.
  const scrollTarget = await target.evaluate((el) => {
    const needsHitTest = ['::before', '::after'].some((pseudo) => {
      const style = getComputedStyle(el, pseudo)
      return style.position === 'absolute' && Boolean(style.content)
        && style.content !== 'none' && style.pointerEvents !== 'none'
        && [style.left, style.top, style.width, style.height].every((value) => Number.isFinite(parseFloat(value)))
    })
    if (!needsHitTest) return null
    let containingBlock = el
    while (getComputedStyle(containingBlock).position === 'static' && containingBlock.parentElement) {
      containingBlock = containingBlock.parentElement
    }
    return window.__mobileQA.selector(containingBlock)
  })
  if (scrollTarget) await page.locator(scrollTarget).scrollIntoViewIfNeeded()
  return target.evaluate((el) => {
    const box = el.getBoundingClientRect()
    let containingBlock = el
    while (getComputedStyle(containingBlock).position === 'static' && containingBlock.parentElement) {
      containingBlock = containingBlock.parentElement
    }
    const origin = containingBlock.getBoundingClientRect()
    const originStyle = getComputedStyle(containingBlock)
    let left = box.left, top = box.top, right = box.right, bottom = box.bottom
    // İşlevsiz/kapalı kontrolün kutusu yine ölçülür. Tıklama zorlanmaz.
    for (const pseudo of ['::before', '::after']) {
      const p = getComputedStyle(el, pseudo)
      if (p.position !== 'absolute' || !p.content || p.content === 'none' || p.pointerEvents === 'none') continue
      const x = parseFloat(p.left), y = parseFloat(p.top), w = parseFloat(p.width), h = parseFloat(p.height)
      if (![x, y, w, h].every(Number.isFinite)) continue
      const originX = origin.left + parseFloat(originStyle.borderLeftWidth)
      const originY = origin.top + parseFloat(originStyle.borderTopWidth)
      const candidate = { left: originX + x, top: originY + y, right: originX + x + w, bottom: originY + y + h }
      const points = [[candidate.left + 1, (candidate.top + candidate.bottom) / 2], [candidate.right - 1, (candidate.top + candidate.bottom) / 2], [(candidate.left + candidate.right) / 2, candidate.top + 1], [(candidate.left + candidate.right) / 2, candidate.bottom - 1]]
      if (points.every(([px, py]) => { const hit = document.elementFromPoint(px, py); return hit === el || (hit && el.contains(hit)) })) {
        left = Math.min(left, candidate.left); top = Math.min(top, candidate.top)
        right = Math.max(right, candidate.right); bottom = Math.max(bottom, candidate.bottom)
      }
    }
    const width = right - left, height = bottom - top
    if (width >= 44 && height >= 44) return null
    return { rule: 'dokunma', selector: window.__mobileQA.selector(el), measured: `${width.toFixed(2)} × ${height.toFixed(2)} CSS px`, expected: '>= 44 × 44 CSS px', text: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 100) }
  })
}

async function assertPaintedFocus(page: Page, control: Locator, info: TestInfo, name: string) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const image = await page.screenshot({ path: info.outputPath(`${name}.png`), scale: 'css' })
  const marker = await control.evaluate(async (el, base64) => {
    const label = el.closest('label')!
    const style = getComputedStyle(label, '::before'), box = label.getBoundingClientRect()
    const w = parseFloat(style.width), h = parseFloat(style.height)
    const x = box.left + parseFloat(getComputedStyle(label).borderLeftWidth) + parseFloat(style.left)
    const y = box.top + parseFloat(getComputedStyle(label).borderTopWidth) + parseFloat(style.top)
    const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d')!
    const img = new Image(); img.src = `data:image/png;base64,${base64}`; await img.decode()
    canvas.width = img.width; canvas.height = img.height; ctx.drawImage(img, 0, 0)
    const color = style.backgroundColor.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? []
    let painted = 0
    if ([x, y, w, h].every(Number.isFinite)) for (let row = Math.ceil(y); row < y + h; row++) {
      const pixel = [...ctx.getImageData(Math.floor(x + w / 2), row, 1, 1).data].slice(0, 3)
      if (color.length === 3 && pixel.every((c, i) => Math.abs(c - color[i]) <= 1)) painted++
    }
    const indicators = []
    const rings = []
    for (let node: Element | null = label; node && node !== document.body; node = node.parentElement) {
      const s = getComputedStyle(node)
      if (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) rings.push(node.className)
      for (const pseudo of ['::before', '::after']) {
        const p = getComputedStyle(node, pseudo)
        if (!['none', 'normal', ''].includes(p.content) && p.display !== 'none' && p.visibility === 'visible'
          && Number(p.opacity) > 0 && parseFloat(p.width) >= 2 && parseFloat(p.width) <= 4 && parseFloat(p.height) >= 8)
          indicators.push(node.className + pseudo)
      }
    }
    return { mode: document.documentElement.dataset.focusMode, focusVisible: el.matches(':focus-visible'),
      display: style.display, width: w, height: h, x, y, painted, color,
      indicators, rings, outline: getComputedStyle(el).outlineStyle,
      controlShadow: getComputedStyle(el).boxShadow, shadow: getComputedStyle(label).boxShadow }
  }, image.toString('base64'))
  await info.attach(name, { body: JSON.stringify(marker), contentType: 'application/json' })
  expect.soft(marker.mode).toBe('keyboard')
  expect.soft(marker.focusVisible).toBe(true)
  expect.soft(marker.painted, name).toBeGreaterThanOrEqual(8)
  expect.soft(marker.width).toBeLessThanOrEqual(4)
  expect.soft(marker.outline).toBe('none')
  expect.soft(marker.indicators).toHaveLength(1)
  expect.soft(marker.rings).toEqual([])
  expect.soft(marker.controlShadow).toBe('none')
  expect.soft(marker.shadow).toBe('none')
}

test.use({ hasTouch: true })

test.beforeEach(async ({ page }) => { await openDemo(page, true) })

for (const route of ['1/adim/00', '1/adim/01', '1/adim/02', '1/adim/03']) {
  test(`M02 form touch targets ${route}`, async ({ page }, info) => {
    await page.setViewportSize({ width: 320, height: 720 })
    await page.goto('/#/karar/' + route)
    await ready(page)
    const scan = await measurePage(page)
    const selectors = await page.evaluate(candidates => candidates.filter(selector =>
      document.querySelector(selector)?.closest('.work-main')), scan.smallTargets.map(t => t.selector))
    const findings = []
    for (const selector of selectors) {
      // Nokta ölçümü, sabit alt şeridin arkasında kalan hedefte yapılmaz.
      // Ölçüm yardımcısı ve 44 piksel eşiği İş 8 kaynağıyla aynıdır.
      await page.locator(selector).evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
      const finding = await measureTarget(page, selector)
      if (finding) findings.push(finding)
    }
    await info.attach('touch', { body: JSON.stringify({ route, scan, findings }), contentType: 'application/json' })
    await page.screenshot({ path: info.outputPath('targets.png'), fullPage: true })
    expect(findings).toEqual([])
  })
}

for (const route of ['8/adim/33', '9/adim/20']) {
  test(`M07 page remains within 320 ${route}`, async ({ page }, info) => {
    await page.setViewportSize({ width: 320, height: 720 })
    await page.goto('/#/karar/' + route)
    await ready(page)
    const scan = await measurePage(page)
    await info.attach('layout', { body: JSON.stringify(scan), contentType: 'application/json' })
    await page.screenshot({ path: info.outputPath('layout.png'), fullPage: true })
    expect(scan.documentWidth).toBeLessThanOrEqual(scan.viewport.width)
    expect(scan.findings.filter(f => f.rule === 'tas-ma')).toEqual([])
  })
}

async function tabTo(page: Page, target: Locator, key: string) {
  for (let count = 0; count < 100; count++) {
    if (await target.evaluate(el => el === document.activeElement)) return
    await page.keyboard.press(key)
  }
  await expect(target).toBeFocused()
}

test('M12 every step 00 radio has one painted keyboard marker', async ({ page, browserName }, info) => {
  await page.goto('/#/karar/1/adim/00')
  await ready(page)
  const key = browserName === 'webkit' ? 'Alt+Tab' : 'Tab'
  for (const answer of ['Tüketici', 'Hizmet', 'Düşük', 'Tek kurucu', 'Kendi param', 'Var olan pazar', 'Sıfırdan']) {
    const option = page.getByRole('main').getByRole('radio', { name: answer, exact: true })
    const group = option.locator('xpath=ancestor::*[@role="radiogroup"][1]')
    const checked = group.getByRole('radio', { checked: true })
    await tabTo(page, await checked.count() ? checked : group.getByRole('radio').first(), key)
    for (let i = 0; i < await group.getByRole('radio').count(); i++) {
      if (await option.evaluate(el => document.activeElement === el)) break
      await page.keyboard.press('ArrowRight')
    }
    await expect(option).toBeFocused()
    await assertPaintedFocus(page, option, info, answer)
    await page.keyboard.press('Space')
    await expect(option).toBeChecked()
  }
})

test('M02 clear target responds at every edge and selection remains usable', async ({ page }) => {
  await page.goto('/#/karar/1/adim/03')
  await ready(page)
  const input = page.locator('#a03-rights-hak-1-gate')
  const select = input.locator('xpath=ancestor::*[contains(@class,"ant-select-single")][1]')
  const clear = select.getByRole('button', { name: 'Clear', exact: true })
  for (const edge of ['left', 'right', 'top', 'bottom']) {
    await clear.scrollIntoViewIfNeeded()
    await clear.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
    const box = await clear.boundingBox()
    expect(box!.width).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeGreaterThanOrEqual(44)
    const x = edge === 'left' ? box!.x + 1 : edge === 'right' ? box!.x + box!.width - 1 : box!.x + box!.width / 2
    const y = edge === 'top' ? box!.y + 1 : edge === 'bottom' ? box!.y + box!.height - 1 : box!.y + box!.height / 2
    await page.touchscreen.tap(x, y)
    await expect(clear).toHaveCount(0)
    await input.tap()
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(clear).toBeVisible()
  }
})

test('M12 forced colors keeps the focused radio outline visible', async ({ page, browserName }, info) => {
  test.skip(browserName !== 'chromium', 'Bu ortamda zorlanmış renk benzetimi Chromium ile doğrulanıyor.')
  await page.emulateMedia({ forcedColors: 'active' })
  await page.goto('/#/karar/1/adim/00')
  await ready(page)
  const option = page.getByRole('radio', { name: 'Tüketici', exact: true })
  await tabTo(page, option, 'Tab')
  await option.evaluate(el => el.closest('label')!.scrollIntoView({ block: 'center', behavior: 'instant' }))
  const m = await option.evaluate(el => {
    const s = getComputedStyle(el), r = el.getBoundingClientRect()
    return { width: r.width, height: r.height, opacity: s.opacity, outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth }
  })
  await page.screenshot({ path: info.outputPath('forced-colors.png') })
  expect(m.opacity).toBe('1')
  expect(m.width).toBeGreaterThanOrEqual(44)
  expect(m.height).toBeGreaterThanOrEqual(44)
  expect(m.outlineStyle).toBe('solid')
  expect(m.outlineWidth).toBe('2px')
  await page.keyboard.press('ArrowRight')
  const next = page.getByRole('radio', { name: 'İşletme', exact: true })
  await expect(next).toBeFocused()
  await expect(next).toBeChecked()
  await expect(next).toHaveCSS('opacity', '1')
  await expect(option).toHaveCSS('opacity', '0')
  await page.goto('/#/planlar')
  await page.getByRole('button', { name: 'Yeni plan', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Yeni plan', exact: true })
  await expect(dialog).toHaveCSS('opacity', '1')
  const name = dialog.getByRole('textbox', { name: 'Planın adı', exact: true })
  await page.keyboard.press('Tab')
  await tabTo(page, name, 'Tab')
  await expect(name).toHaveCSS('outline-style', 'solid')
  await expect(name).toHaveCSS('outline-width', '2px')
  expect(await name.evaluate(el => getComputedStyle(el.closest('label')!, '::before').display)).toBe('none')
  await page.screenshot({ path: info.outputPath('forced-plan-name.png') })
})

test('M07 wrapped duration remains inside its own tag', async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto('/#/karar/8/adim/33')
  await ready(page)
  const tag = page.locator('.work-meta .ant-tag').filter({ hasText: 'Süre:' })
  const m = await tag.evaluate(el => {
    const box = el.getBoundingClientRect(), range = document.createRange()
    range.selectNodeContents(el)
    const lines = [...range.getClientRects()]
    return { top: box.top, bottom: box.bottom, textBottom: Math.max(...lines.map(r => r.bottom)), height: box.height }
  })
  await info.attach('duration', { body: JSON.stringify(m), contentType: 'application/json' })
  await page.screenshot({ path: info.outputPath('duration.png') })
  expect(m.textBottom).toBeLessThanOrEqual(m.bottom)
})

test('M12 plan name has one painted keyboard marker and preserves input on rotation', async ({ page, browserName }, info) => {
  await page.goto('/#/planlar')
  await page.getByRole('button', { name: 'Yeni plan', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Yeni plan', exact: true })
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveCSS('opacity', '1')
  const input = dialog.getByRole('textbox', { name: 'Planın adı', exact: true })
  const key = browserName === 'webkit' ? 'Alt+Tab' : 'Tab'
  await page.keyboard.press(key)
  await tabTo(page, input, key)
  await assertPaintedFocus(page, input, info, 'plan-name')
  const box = await input.boundingBox()
  expect(box!.height).toBeGreaterThanOrEqual(44)
  await input.pressSequentially('Kalıcı plan denemesi')
  await input.evaluate((el: HTMLInputElement) => el.setSelectionRange(3, 9))
  for (const viewport of [{ width: 844, height: 390 }, { width: 320, height: 720 }]) {
    await page.setViewportSize(viewport)
    await expect(input).toBeFocused()
    await expect(input).toHaveValue('Kalıcı plan denemesi')
    expect(await input.evaluate((el: HTMLInputElement) => [el.selectionStart, el.selectionEnd])).toEqual([3, 9])
    await assertPaintedFocus(page, input, info, `plan-name-${viewport.width}`)
  }
  await input.click()
  expect(await input.evaluate(el => getComputedStyle(el.closest('label')!, '::before').content)).toBe('none')
  await expect(input).toBeFocused()
})

test('M02 row actions remain 44 pixels and move the actual row', async ({ page }) => {
  await page.goto('/#/karar/1/adim/03')
  const rows = page.locator('.repeater-table').first().locator('tr.repeater-card')
  await page.getByRole('button', { name: 'Kontrol ekle', exact: true }).tap()
  await expect(rows).toHaveCount(2)
  expect(await rows.count()).toBeGreaterThanOrEqual(2)
  const owner = rows.first().locator('input[id$="-owner"]')
  const ownerId = await owner.getAttribute('id')
  await owner.fill('Taşınan satır')
  for (const action of await rows.first().locator('.repeater-row-actions button').all()) {
    const box = await action.boundingBox()
    expect(box!.width).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeGreaterThanOrEqual(44)
  }
  await rows.first().getByRole('button', { name: '1. satırı aşağı taşı', exact: true }).tap()
  await expect(rows.nth(1).locator(`input[id="${ownerId}"]`)).toHaveValue('Taşınan satır')
})

async function savedPlan(page: Page): Promise<PlanDoc> {
  return page.evaluate(() => {
    const { state } = JSON.parse(localStorage.getItem('decisionactplan-v1')!) as {
      state: { currentId: string; plans: Record<string, PlanDoc> }
    }
    return state.plans[state.currentId]
  })
}

test('repeater keeps the same input, name, value and selection through breakpoints', async ({ page }) => {
  await page.goto('/#/karar/1/adim/03')
  const input = page.locator('#a03-rights-hak-1-owner')
  const group = input.locator('xpath=ancestor::div[@role="group"][1]')
  await expect(group).toHaveAccessibleName('Karar sahibi')
  await input.fill('Korunan satır değeri')
  const original = await input.elementHandle()
  await input.evaluate((el: HTMLInputElement) => el.setSelectionRange(3, 10))
  for (const viewport of [
    { width: 320, height: 720 }, { width: 844, height: 390 },
    { width: 767, height: 1024 }, { width: 768, height: 1024 },
    { width: 769, height: 1024 }, { width: 320, height: 720 },
  ]) {
    await page.setViewportSize(viewport)
    await expect(input).toBeFocused()
    await expect(input).toHaveValue('Korunan satır değeri')
    expect(await input.evaluate((el, previous) => el === previous, original)).toBe(true)
    expect(await input.evaluate((el: HTMLInputElement) => [el.selectionStart, el.selectionEnd])).toEqual([3, 10])
    const cell = input.locator('xpath=ancestor::td[1]')
    expect(await cell.locator('.repeater-cell-help').count()).toBeLessThanOrEqual(1)
    // Telefonda ve kısa yatay görünümde satır karttır. Geniş ekranda aynı tablo kalır.
    const cards = viewport.width < 768 || viewport.height <= 480
    const label = cell.locator('.repeater-cell-label')
    const head = page.locator('.repeater-table').first().locator('.ant-table-thead')
    if (cards) {
      await expect(label).toBeVisible()
      await expect(head).toHaveCSS('position', 'absolute')
      await expect(input.locator('xpath=ancestor::tr[1]')).toHaveCSS('display', 'grid')
    } else {
      await expect(label).toBeHidden()
      await expect(head).not.toHaveCSS('position', 'absolute')
      await expect(input.locator('xpath=ancestor::tr[1]')).toHaveCSS('display', 'table-row')
    }
  }
})

test('form fields carry mobile keyboard and autofill hints', async ({ page }) => {
  const fields: [string, string, string, string][] = [
    ['01', '#a01-coreReason', 'text', 'done'],
    ['02', '#a02-hoursPerWeek', 'decimal', 'done'],
    ['02', '#a02-cashKurus', 'decimal', 'done'],
    ['03', '#a03-rights-hak-1-owner', 'text', 'done'],
    ['03', '#a03-disputeRule', 'text', 'enter'],
  ]
  for (const [step, selector, mode, enter] of fields) {
    await page.goto(`/#/karar/1/adim/${step}`)
    const input = page.locator(selector)
    await expect(input).toBeVisible()
    await expect(input).toHaveAttribute('inputmode', mode)
    await expect(input).toHaveAttribute('enterkeyhint', enter)
    await expect(input).toHaveAttribute('autocomplete', 'off')
  }
  await page.goto('/#/karar/1/adim/02')
  await expect(page.locator('#a02-deadline')).toHaveAttribute('autocomplete', 'off')
})

test('draft and focused field survive rotation while step actions stay reachable', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/#/karar/1/adim/01')
  const input = page.locator('#a01-coreReason')
  await input.fill('Ekran dönünce korunacak taslak.')
  await expect(input).toBeFocused()
  for (const viewport of [
    { width: 320, height: 720 }, { width: 360, height: 800 }, { width: 375, height: 812 },
    { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 768, height: 1024 }, { width: 1280, height: 800 },
  ]) {
    await page.setViewportSize(viewport)
    await expect(input).toHaveValue('Ekran dönünce korunacak taslak.')
    await expect(input).toBeFocused()
    // Yeniden boyutlandırmadan sonra yerleşimin oturması beklenir.
    await expect.poll(() => input.evaluate((element) => {
      const field = element.getBoundingClientRect()
      const bar = document.querySelector('.step-actions')!.getBoundingClientRect()
      return {
        fits: document.documentElement.scrollWidth <= innerWidth,
        overlaps: field.top < bar.bottom && field.bottom > bar.top && field.left < bar.right && field.right > bar.left,
      }
    }), { message: JSON.stringify(viewport) }).toEqual({ fits: true, overlaps: false })
    for (const name of ['Taslak bırak, ilerle', 'Adımı tamamla']) {
      const button = page.locator('.step-actions').getByRole('button', { name, exact: true })
      await button.scrollIntoViewIfNeeded()
      await expect(button).toBeInViewport()
      const box = (await button.boundingBox())!
      expect(box.height, name).toBeGreaterThanOrEqual(44)
      expect(await button.evaluate((el) => {
        const r = el.getBoundingClientRect()
        return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2))
      }), name).toBe(true)
    }
    await input.focus()
  }
  await page.setViewportSize({ width: 320, height: 720 })
  await input.fill('Hızlı geçişte korunacak taslak.')
  await page.evaluate(() => { location.hash = '#/karar/1/adim/02' })
  await expect(page).toHaveURL(/adim\/02/)
  expect((await savedPlan(page)).steps['01'].values.coreReason).toBe('Hızlı geçişte korunacak taslak.')
  await page.evaluate(() => { location.hash = '#/karar/1/adim/01' })
  await expect(input).toHaveValue('Hızlı geçişte korunacak taslak.')
  await page.getByRole('button', { name: 'Daha fazla', exact: true }).tap()
  await page.getByRole('menuitem', { name: 'Bu adımı atla' }).tap()
  const reason = page.locator('#atlama-nedeni')
  await expect(reason).toHaveAttribute('inputmode', 'text')
  await expect(reason).toHaveAttribute('enterkeyhint', 'enter')
  await expect(reason).toHaveAttribute('autocomplete', 'off')
  expect(errors).toEqual([])
})

test('field input saves before blur and survives immediate navigation and reload', async ({ page }) => {
  await page.goto('/#/karar/1/adim/01')
  const input = page.locator('#a01-coreReason')
  await input.fill('Son harf dahil kaydedildi')
  expect((await savedPlan(page)).steps['01'].values.coreReason).toBe('Son harf dahil kaydedildi')
  await page.goto('/#/karar/1/adim/02')
  await page.reload()
  await page.goto('/#/karar/1/adim/01')
  await expect(input).toHaveValue('Son harf dahil kaydedildi')
})

test('comma decimals, zero and money keep their stored units', async ({ page }) => {
  await page.goto('/#/karar/1/adim/02')
  const hours = page.locator('#a02-hoursPerWeek')
  await expect(hours).toHaveAttribute('inputmode', 'decimal')
  await hours.fill('1,5')
  await hours.press('Tab')
  expect((await savedPlan(page)).steps['02'].values.hoursPerWeek).toBe(1.5)
  const money = page.locator('#a02-cashKurus')
  await money.fill('1.234,56')
  await money.press('Tab')
  expect((await savedPlan(page)).steps['02'].values.cashKurus).toBe(123456)
  await money.fill('0')
  await money.press('Tab')
  expect((await savedPlan(page)).steps['02'].values.cashKurus).toBe(0)
  await money.fill('')
  await money.press('Tab')
  // Mevcut para alanı sözleşmesinde silinen tutar sıfır olarak kaydedilir.
  await expect(money).toHaveValue('0')
  expect((await savedPlan(page)).steps['02'].values.cashKurus).toBe(0)
})

test('date popup stays inside 320 pixels and Escape preserves input focus', async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto('/#/karar/1/adim/02')
  const input = page.locator('#a02-deadline')
  await input.click()
  const popup = page.locator('.form-date-popup')
  await expect(popup).toBeVisible()
  await expect(popup).toHaveCSS('opacity', '1')
  const box = await popup.boundingBox()
  expect(box!.x).toBeGreaterThanOrEqual(0)
  expect(box!.x + box!.width).toBeLessThanOrEqual(320)
  expect(box!.y).toBeGreaterThanOrEqual(0)
  expect(box!.y + box!.height).toBeLessThanOrEqual(720)
  await page.screenshot({ path: info.outputPath('date-popup.png') })
  await page.keyboard.press('Escape')
  await expect(popup).toBeHidden()
  await expect(input).toBeFocused()
})

test('calculation apply keeps focus and repeated activation does not write again', async ({ page, browserName }) => {
  await page.goto('/#/karar/5/adim/16')
  const value = page.locator('#a16-breakEvenCount')
  await value.fill('0')
  const apply = page.locator('.calc-box').filter({ hasText: 'Başabaş hesabı' }).locator('.calc-apply')
  await expect(apply).toHaveAttribute('aria-disabled', 'false')
  // Hesap düğmesi sonuç alanından hemen önce gelir. Sayfanın tamamını dolaşmak gerekmez.
  await tabTo(page, apply, browserName === 'webkit' ? 'Alt+Shift+Tab' : 'Shift+Tab')
  const original = await apply.elementHandle()
  await page.keyboard.press('Enter')
  await expect(apply).toBeFocused()
  await expect(apply).toHaveAttribute('aria-disabled', 'true')
  expect(await apply.evaluate((el, previous) => el === previous, original)).toBe(true)
  const revision = (await savedPlan(page)).revision
  await page.keyboard.press('Space')
  expect((await savedPlan(page)).revision).toBe(revision)
  for (const viewport of [{ width: 844, height: 390 }, { width: 320, height: 720 }]) {
    await page.setViewportSize(viewport)
    await expect(apply).toBeFocused()
    expect(await apply.evaluate((el, previous) => el === previous, original)).toBe(true)
  }
})

test('short visual viewport keeps the active field visible and restores the action bar', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.addInitScript(() => {
    const viewport = Object.assign(new EventTarget(), { height: 720, width: 320, offsetTop: 0, offsetLeft: 0, scale: 1 })
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport })
  })
  await page.reload()
  await page.goto('/#/karar/1/adim/03')
  const input = page.locator('#a03-rights-hak-1-owner')
  await input.fill('Kısa ekran')
  await input.evaluate((el: HTMLInputElement) => {
    el.setSelectionRange(2, 7)
    scrollTo({ top: scrollY + el.getBoundingClientRect().top - 90, behavior: 'instant' })
    Object.assign(window.visualViewport!, { height: 130 })
    window.visualViewport!.dispatchEvent(new Event('resize'))
  })
  await expect.poll(() => input.evaluate(el => {
    const rect = el.getBoundingClientRect()
    const header = document.querySelector('.topbar')!.getBoundingClientRect()
    const bar = document.querySelector('.step-actions')!
    return rect.top >= header.bottom - 1 && rect.bottom <= 131
      && document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2) === el
      && getComputedStyle(bar).position === 'static'
  })).toBe(true)
  await expect(input).toBeFocused()
  expect(await input.evaluate((el: HTMLInputElement) => [el.selectionStart, el.selectionEnd])).toEqual([2, 7])
  await page.evaluate(() => {
    Object.assign(window.visualViewport!, { height: 360 })
    window.visualViewport!.dispatchEvent(new Event('resize'))
  })
  await expect.poll(() => page.locator('.step-actions').evaluate(el => getComputedStyle(el).position)).toBe('sticky')
  await expect(input).toBeFocused()
  await expect(input).toHaveValue('Kısa ekran')

  const textarea = page.locator('#a03-disputeRule')
  await textarea.fill(Array.from({ length: 12 }, (_, i) => `Satır ${i + 1}`).join('\n'))
  await textarea.evaluate((el: HTMLTextAreaElement) => {
    el.setSelectionRange(el.value.length, el.value.length)
    Object.assign(window.visualViewport!, { height: 130 })
    window.visualViewport!.dispatchEvent(new Event('resize'))
  })
  await expect.poll(() => textarea.evaluate((el: HTMLTextAreaElement) => {
    const rect = el.getBoundingClientRect(), style = getComputedStyle(el)
    const lineHeight = parseFloat(style.lineHeight)
    const line = el.value.slice(0, el.selectionEnd).split('\n').length - 1
    const caretTop = rect.top + el.clientTop + parseFloat(style.paddingTop) + line * lineHeight - el.scrollTop
    const header = document.querySelector('.topbar')!.getBoundingClientRect()
    return caretTop >= header.bottom - 1 && caretTop + lineHeight <= 131
      && document.elementFromPoint(rect.x + rect.width / 2, caretTop + lineHeight / 2) === el
  })).toBe(true)
  await expect(textarea).toBeFocused()
})

test('compact repeater help appears once and remains an accessible description', async ({ page }) => {
  await page.goto('/#/karar/3/adim/10')
  const input = page.locator('input[id$="-affectsPath"]').first()
  const group = input.locator('xpath=ancestor::div[@role="group"][1]')
  const text = "Yol adını Adım 18'den yazın. Bilmiyorsanız boş bırakın."
  for (const viewport of [{ width: 320, height: 720 }, { width: 844, height: 390 }, { width: 1280, height: 800 }]) {
    await page.setViewportSize(viewport)
    await expect(group).toHaveAccessibleName('Yanlış çıkarsa hangi yol değişir?')
    await expect(group).toHaveAccessibleDescription(text)
    const help = input.locator('xpath=ancestor::td[1]').locator('.repeater-cell-help')
    await expect(help).toHaveCount(1)
    await expect(help).toHaveText(text)
    await expect(help).toBeVisible()
  }
})
