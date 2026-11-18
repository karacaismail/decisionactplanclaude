import { expect, type Locator, type Page, type TestInfo } from '@playwright/test'
import { writeFile } from 'node:fs/promises'
import { arch, platform, release } from 'node:os'

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
  await activate(page, page.getByRole('button', { name: 'Örnek planı aç', exact: true }).first(), touch)
  await expect(page).toHaveURL(/#\/ozet$/)
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

/** Sıradan kutular tek tarayıcı çağrısında ölçülür. Ek alanın nokta denetimi korunur. */
export async function measureTargets(page: Page, selectors: string[]): Promise<Finding[]> {
  const measured = await page.evaluate((candidates) => candidates.map((selector) => {
    const el = document.querySelector(selector)
    if (!el) throw new Error(`Ölçüm hedefi kayboldu: ${selector}`)
    const needsHitTest = ['::before', '::after'].some((pseudo) => {
      const style = getComputedStyle(el, pseudo)
      return style.position === 'absolute' && Boolean(style.content)
        && style.content !== 'none' && style.pointerEvents !== 'none'
        && [style.left, style.top, style.width, style.height].every((value) => Number.isFinite(parseFloat(value)))
    })
    const box = el.getBoundingClientRect()
    const finding: Finding | null = box.width >= 44 && box.height >= 44 ? null : {
      rule: 'dokunma', selector, measured: `${box.width.toFixed(2)} × ${box.height.toFixed(2)} CSS px`,
      expected: '>= 44 × 44 CSS px',
      text: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 100),
    }
    return { selector, needsHitTest, finding }
  }), selectors)
  const findings: Finding[] = []
  for (const result of measured) {
    const finding = result.needsHitTest ? await measureTarget(page, result.selector) : result.finding
    if (finding) findings.push(finding)
  }
  return findings
}

export async function saveEvidence(page: Page, info: TestInfo, data: Record<string, unknown>, findings: Finding[]) {
  const screenshot = info.outputPath('ekran.png')
  await page.screenshot({ path: screenshot, fullPage: true })
  for (const finding of findings) finding.screenshot ??= screenshot
  const environment = await page.evaluate(() => ({
    viewport: { width: document.documentElement.clientWidth, height: innerHeight }, innerWidth,
    visualViewport: { width: visualViewport?.width, height: visualViewport?.height },
    dpr: devicePixelRatio, coarse: matchMedia('(any-pointer: coarse)').matches,
    hover: matchMedia('(hover: hover)').matches, forcedColors: matchMedia('(forced-colors: active)').matches,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    rootFontSize: getComputedStyle(document.documentElement).fontSize,
  }))
  const record = {
    ...data, title: info.title, project: info.project.name,
    browser: page.context().browser()?.version(), browserName: page.context().browser()?.browserType().name(),
    os: { platform: platform(), release: release(), arch: arch() },
    testedAt: new Date().toISOString(), execution: info.project.use.headless === false ? 'isolated-headed-emulation' : 'isolated-headless-emulation',
    environment, findings, screenshot,
  }
  const output = info.outputPath('olcum.json')
  await writeFile(output, JSON.stringify(record, null, 2))
  await info.attach('olcum', { path: output, contentType: 'application/json' })
  await info.attach('ekran', { path: screenshot, contentType: 'image/png' })
}
