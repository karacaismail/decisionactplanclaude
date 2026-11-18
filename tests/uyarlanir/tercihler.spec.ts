import { expect, test as baseTest, type Locator, type Page } from '@playwright/test'
import { activate, measurePage, openDemo, ready, saveEvidence, type Finding } from './audit'

interface PreferenceEvidence {
  data: Record<string, unknown>
  findings: Finding[]
}

const test = baseTest.extend<{ evidence: PreferenceEvidence }>({
  evidence: async ({}, use) => {
    await use({ data: {}, findings: [] })
  },
})

test.use({ forcedColors: 'none' })

// Assertion başarısız olsa da son durum kaydedilir. Hata sonucu korunur.
test.afterEach(async ({ page, evidence }, info) => {
  const finalPage = await measurePage(page)
  const toggle = page.locator('#kisa-yol')
  const finalSwitch = await toggle.evaluateAll((elements) => elements.map((el) => ({
    checked: el.getAttribute('aria-checked'),
    focused: el === document.activeElement,
  })))
  const finalFocus = finalSwitch.length ? await readFocus(toggle) : null
  const focusScreenshot = info.outputPath('odak.png')
  await page.screenshot({ path: focusScreenshot })
  await info.attach('odak', { path: focusScreenshot, contentType: 'image/png' })
  await saveEvidence(page, info, {
    ...evidence.data, finalPage, finalSwitch, finalFocus, focusScreenshot,
    status: info.status, errors: info.errors.map((error) => error.message ?? error.value ?? 'Bilinmeyen test hatası'),
  }, evidence.findings)
})

async function tabTo(page: Page, target: Locator, key: string) {
  // Gerçek Tab sırası kullanılır. Programatik odak, erişim kusurunu gizlememeli.
  for (let step = 0; step < 120; step++) {
    await page.keyboard.press(key)
    if (await target.evaluate((el) => el === document.activeElement)) return
  }
  await expect(target, 'Kullanıcı Tab ile kısa yol seçeneğine ulaşabilmeli.').toBeFocused()
}

async function readFocus(target: Locator) {
  return target.evaluate((el) => {
    const style = getComputedStyle(el)
    const marker = getComputedStyle(el, '::before')
    const box = el.getBoundingClientRect()
    const left = box.left + parseFloat(style.borderLeftWidth) + parseFloat(marker.left)
    const top = box.top + parseFloat(style.borderTopWidth) + parseFloat(marker.top)
    const right = left + parseFloat(marker.width)
    const bottom = top + parseFloat(marker.height)
    let unclipped = left >= 0 && top >= 0 && right <= innerWidth && bottom <= innerHeight
    for (let parent: Element | null = el; parent; parent = parent.parentElement) {
      const ancestor = getComputedStyle(parent)
      const bounds = parent.getBoundingClientRect()
      if (['hidden', 'clip', 'auto', 'scroll'].includes(ancestor.overflowX)) {
        unclipped &&= left >= bounds.left && right <= bounds.right
      }
      if (['hidden', 'clip', 'auto', 'scroll'].includes(ancestor.overflowY)) {
        unclipped &&= top >= bounds.top && bottom <= bounds.bottom
      }
    }
    return {
      focused: document.activeElement === el,
      focusVisible: el.matches(':focus-visible'),
      keyboardMode: document.documentElement.dataset.focusMode === 'keyboard',
      outline: style.outlineStyle,
      shadow: style.boxShadow,
      marker: {
        content: marker.content, display: marker.display, visibility: marker.visibility,
        opacity: marker.opacity, color: marker.backgroundColor,
        width: parseFloat(marker.width), height: parseFloat(marker.height),
        left: parseFloat(marker.left), unclipped,
      },
    }
  })
}

test('Hareket azalınca kısa yol seçeneği ve görünür odak çalışır', async ({ page, hasTouch, browserName, evidence }) => {
  const tabKey = browserName === 'webkit' ? 'Alt+Tab' : 'Tab'
  const findings = evidence.findings
  const focusStates: Awaited<ReturnType<typeof readFocus>>[] = []
  evidence.data = { route: '/ozet', preference: 'reduce', focusStates, input: `${tabKey} ve Space` }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openDemo(page, hasTouch)
  const toggle = page.locator('#kisa-yol')
  await expect(toggle).toHaveRole('switch')
  await tabTo(page, toggle, tabKey)
  const initial = await toggle.getAttribute('aria-checked') ?? ''
  evidence.data.initialSwitch = initial
  expect(initial).toMatch(/^(true|false)$/)

  // Tercihin sonradan değişmesi de seçimi ve odağı korumalı.
  for (const preference of ['reduce', 'no-preference', 'reduce'] as const) {
    await page.emulateMedia({ reducedMotion: preference })
    await expect.poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(preference === 'reduce')
    await expect(toggle).toHaveAttribute('aria-checked', initial)
    await expect(toggle).toBeFocused()
    if (preference !== 'reduce') continue

    await page.keyboard.press('Space')
    await expect(toggle).toHaveAttribute('aria-checked', initial === 'true' ? 'false' : 'true')
    await page.keyboard.press('Space')
    await expect(toggle).toHaveAttribute('aria-checked', initial)
    const focus = await readFocus(toggle)
    focusStates.push(focus)
    const marker = focus.marker
    const visible = focus.focused && focus.focusVisible && focus.keyboardMode
      && !['none', 'normal'].includes(marker.content) && marker.display !== 'none'
      && marker.visibility === 'visible' && Number(marker.opacity) > 0
      && !['transparent', 'rgba(0, 0, 0, 0)'].includes(marker.color)
      && marker.width >= 2 && marker.height > marker.width && marker.left < 0 && marker.unclipped
    if (!visible || focus.outline !== 'none' || focus.shadow !== 'none') {
      findings.push({ rule: 'hareket-odak', selector: '#kisa-yol', measured: JSON.stringify(focus), expected: 'Çevrelemeyen odak işareti görünür kalmalı.' })
    }
  }

  const motion = await toggle.evaluate((el) => [el, ...el.querySelectorAll('*')].flatMap((node) =>
    [null, '::before', '::after'].map((pseudo) => {
      const style = getComputedStyle(node, pseudo)
      const durations = [style.transitionDuration, style.animationDuration].flatMap((value) =>
        value.split(',').map((part) => parseFloat(part) * (part.trim().endsWith('ms') ? 1 : 1000)),
      )
      return { element: node.className, pseudo, durations }
    }),
  ))
  evidence.data.motion = motion
  for (const surface of motion) {
    if (surface.durations.some((duration) => !Number.isFinite(duration) || duration > 0.01)) {
      findings.push({ rule: 'hareket-suresi', selector: '#kisa-yol', measured: JSON.stringify(surface), expected: 'Azaltılmış hareket süresi en çok 0.01 ms olmalı.' })
    }
  }
  expect(findings, 'Hareket ve odak bulguları olcum.json dosyasındadır.').toEqual([])
})

test('Kök yazı büyüyünce metin ve kısa yol seçeneği kullanılabilir kalır', async ({ page, hasTouch, evidence }) => {
  const before: { selector: string; size: number }[] = []
  const sizes: { selector: string; size: number; enlargedSize: number }[] = []
  evidence.data = {
    route: '/ozet', before, sizes, input: hasTouch ? 'dokunma' : 'fare', textScaling: 'root-font-only',
    browserZoom: 'not_run', safeArea: 'not_run', virtualKeyboard: 'not_run',
  }
  await openDemo(page, hasTouch)
  const samples = ['main h1', '.page-header-text p', 'label[for="kisa-yol"]']
  for (const selector of samples) {
    const target = page.locator(selector)
    await expect(target).toBeVisible()
    before.push({ selector, size: await target.evaluate((el) => parseFloat(getComputedStyle(el).fontSize)) })
  }
  const rootSize = await page.locator('html').evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
  evidence.data.rootSize = rootSize
  evidence.data.enlargedRootSize = rootSize * 2
  // Yalnız kök yazı boyutu değiştirilir. Bu işlem gerçek tarayıcı zoom'u değildir.
  await page.locator('html').evaluate((el, size) => { el.style.fontSize = `${size * 2}px` }, rootSize)
  await ready(page)
  await expect(page.locator('html')).toHaveCSS('font-size', `${rootSize * 2}px`)

  const result = await measurePage(page)
  evidence.findings = result.findings
  expect(result.textCount, 'Boş ekran yazı denetiminden geçemez.').toBeGreaterThan(0)
  for (const sample of before) {
    const target = page.locator(sample.selector)
    await expect(target).toBeVisible()
    const size = await target.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
    // Önce ve sonra boyutları kanıttır. İki kat büyüme kabul koşulu değildir.
    sizes.push({ ...sample, enlargedSize: size })
  }
  const toggle = page.locator('#kisa-yol')
  const initial = await toggle.getAttribute('aria-checked') ?? ''
  evidence.data.initialSwitch = initial
  expect(initial).toMatch(/^(true|false)$/)
  await activate(page, toggle, hasTouch)
  await expect(toggle).toHaveAttribute('aria-checked', initial === 'true' ? 'false' : 'true')
  await activate(page, toggle, hasTouch)
  await expect(toggle).toHaveAttribute('aria-checked', initial)
  expect(result.findings, 'Büyük yazı bulguları olcum.json dosyasındadır.').toEqual([])
})
