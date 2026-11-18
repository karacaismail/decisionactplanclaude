import { expect, test, type Locator, type Page } from '@playwright/test'

async function openDemo(page: Page) {
  await page.goto('/')
  await expect(async () => {
    if (!/#\/ozet/.test(page.url())) await page.getByText('Örnek planı aç').first().click({ timeout: 2000 })
    await expect(page).toHaveURL(/#\/ozet/, { timeout: 2000 })
  }).toPass()
}

async function openScore(page: Page) {
  await page.goto('/#/karar/5/adim/18')
  await page.locator('.form-tabs .ant-segmented-item', { hasText: 'İsteğe bağlı bölümler' }).click()
  await expect(page.getByRole('region', { name: 'Ağırlık ve puan tablosu' })).toBeVisible()
}

async function noPageOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
}

async function marker(locator: Locator) {
  return locator.evaluate((el) => {
    const style = getComputedStyle(el, '::before')
    return { display: style.display, content: style.content, width: parseFloat(style.width), height: parseFloat(style.height), color: style.backgroundColor }
  })
}

test('puan tablosu kendi içinde kayar ve yıldızlar 44 piksel dokunma alanı sunar', async ({ page }) => {
  await openDemo(page)
  await openScore(page)
  const region = page.getByRole('region', { name: 'Ağırlık ve puan tablosu' })
  const sizes = await region.getByRole('radio').evaluateAll((els) => els.map((el) => {
    const box = el.getBoundingClientRect()
    return { width: box.width, height: box.height }
  }))
  expect(sizes.length).toBeGreaterThan(0)
  expect(sizes.every((size) => size.width >= 44 && size.height >= 44)).toBe(true)
  await expect(region.getByRole('rowheader', { name: 'Bugünkü durumu sürdürmek' })).toBeAttached()
  const dimensions = await region.evaluate((el) => ({ width: el.clientWidth, content: el.scrollWidth }))
  expect(dimensions.content).toBeGreaterThan(dimensions.width)
  await region.focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(region).toBeFocused()
  await page.keyboard.press('ArrowRight')
  await expect.poll(() => region.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0)
  await noPageOverflow(page)
})

test('etkin puanın değeri ve odağı yön değişiminde korunur', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await openDemo(page)
  await openScore(page)
  const rate = page.getByLabel('Bugünkü durumu sürdürmek, Müşteri kanıtı puanı', { exact: true })
  const stars = rate.getByRole('radio')
  await stars.nth(1).click()
  await expect(stars.nth(1)).toBeChecked()
  await rate.focus()
  await page.keyboard.press('ArrowRight')
  await expect(stars.nth(2)).toBeChecked()
  await page.setViewportSize({ width: 844, height: 390 })
  await expect(rate).toBeFocused()
  await expect(stars.nth(2)).toBeChecked()
  await page.setViewportSize({ width: 320, height: 720 })
  await expect(rate).toBeFocused()
  await expect(stars.nth(2)).toBeChecked()
  await expect.poll(() => page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem('decisionactplan-v1') ?? '{}')
    const values = saved.state.plans[saved.state.currentId].steps['18'].values
    return values.pathScores.scores[values.paths[0]._id]?.customerEvidence
  })).toBe(3)
  await page.reload()
  await page.locator('.form-tabs .ant-segmented-item', { hasText: 'İsteğe bağlı bölümler' }).click()
  await expect(stars.nth(2)).toBeChecked()
})

test('yıldızın üzerine gelince komşu dokunma alanları çakışmaz', async ({ page }) => {
  await openDemo(page)
  await openScore(page)
  const rate = page.getByLabel('Bugünkü durumu sürdürmek, Müşteri kanıtı puanı', { exact: true })
  const stars = rate.getByRole('radio')
  await stars.nth(1).hover()
  await rate.evaluate(async (el) => {
    await Promise.all(el.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => undefined)))
  })
  const boxes = await stars.evaluateAll((els) => els.map((el) => {
    const box = el.getBoundingClientRect()
    return { left: box.left, right: box.right, width: box.width, height: box.height }
  }))
  for (let index = 0; index < boxes.length; index++) {
    expect(boxes[index].width).toBeGreaterThanOrEqual(44)
    expect(boxes[index].height).toBeGreaterThanOrEqual(44)
    if (index > 0) expect(boxes[index].left).toBeGreaterThanOrEqual(boxes[index - 1].right)
  }
})

test('Tab tuşu puan tablosunun ve yıldızların odağını görünür yapar', async ({ page }, testInfo) => {
  await openDemo(page)
  await openScore(page)
  const region = page.getByRole('region', { name: 'Ağırlık ve puan tablosu' })
  await region.focus()
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Tab')
  await expect(region).toBeFocused()
  await expect(page.locator('html')).toHaveAttribute('data-focus-mode', 'keyboard')
  const frameMarker = await marker(page.locator('.score-table-frame'))
  expect(frameMarker.display).toBe('block')
  expect(frameMarker.content).toBe('""')
  expect(frameMarker.width).toBeGreaterThan(0)
  expect(frameMarker.height).toBeGreaterThan(0)
  expect(frameMarker.color).not.toBe('rgba(0, 0, 0, 0)')
  await expect(region).toHaveCSS('outline-style', 'none')
  await expect(region).toHaveCSS('box-shadow', 'none')
  await region.scrollIntoViewIfNeeded()
  await page.evaluate(() => window.scrollBy(0, -100))
  await testInfo.attach('tablo-odagi', { body: await page.screenshot(), contentType: 'image/png' })
  await page.keyboard.press('Tab')
  const rate = page.locator('.score-matrix .ant-rate:focus-visible')
  await expect(rate).toHaveCount(1)
  const rateMarker = await marker(rate)
  expect(rateMarker.display).toBe('block')
  expect(rateMarker.width).toBeGreaterThan(0)
  expect(rateMarker.height).toBeGreaterThan(0)
  expect(rateMarker.color).not.toBe('rgba(0, 0, 0, 0)')
  await expect(rate).toHaveCSS('outline-style', 'none')
  await expect(rate).toHaveCSS('box-shadow', 'none')
  await rate.scrollIntoViewIfNeeded()
  await page.evaluate(() => window.scrollBy(0, -100))
  await testInfo.attach('puan-odagi', { body: await page.screenshot(), contentType: 'image/png' })
})

test('kapı formu yön değişiminde korunur ve telefon düğmeleri tam genişliktedir', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await openDemo(page)
  await page.goto('/#/karar/1/kapi')
  const reason = page.getByLabel('Gerekçe', { exact: false })
  await reason.fill('Bu kararı verilen kanıtlara göre kaydediyorum.')
  await page.setViewportSize({ width: 844, height: 390 })
  await expect(reason).toBeFocused()
  await expect(reason).toHaveValue('Bu kararı verilen kanıtlara göre kaydediyorum.')
  await page.setViewportSize({ width: 320, height: 720 })
  await expect(reason).toBeFocused()
  const widthGap = (el: Element) => el.clientWidth - el.querySelector('button')!.getBoundingClientRect().width
  expect(Math.abs(await page.locator('.save-row').evaluate(widthGap))).toBeLessThan(2)
  await page.getByLabel('Karar sahibi', { exact: true }).fill('Deneme')
  await page.getByRole('button', { name: 'Kararı kaydet' }).click()
  const result = page.locator('.k-result .ant-result-extra')
  await expect(result).toBeVisible()
  expect(Math.abs(await result.evaluate(widthGap))).toBeLessThan(2)
  await noPageOverflow(page)
})

test('zorunlu renklerde klavye odağı sistem çizgisiyle görünür', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' })
  test.skip(!await page.evaluate(() => matchMedia('(forced-colors: active)').matches), 'Bu tarayıcı zorunlu renk öykünmesini desteklemiyor.')
  await openDemo(page)
  await openScore(page)
  const region = page.getByRole('region', { name: 'Ağırlık ve puan tablosu' })
  await region.focus()
  await page.keyboard.press('Tab')
  const rate = page.locator('.score-matrix .ant-rate:focus-visible')
  await expect(rate).toHaveCount(1)
  await expect(rate).toHaveCSS('outline-style', 'solid')
  await expect(rate).toHaveCSS('outline-width', '2px')
  await page.goto('/#/karar/1/kapi')
  const first = page.getByRole('switch', { name: 'Ciddi zarar tehlikesi var' })
  await first.focus()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(first).toBeFocused()
  await expect(first).toHaveCSS('outline-style', 'solid')
  await expect(first).toHaveCSS('outline-width', '2px')
})

test('alt aşama açıklaması telefonda satır genişliğini kullanır', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await openDemo(page)
  await page.goto('/#/strateji')
  const stages = page.locator('.substage')
  await expect(stages).toHaveCount(5)
  for (const stage of await stages.all()) {
    const size = await stage.evaluate((el) => ({ row: el.clientWidth, body: el.querySelector('.substage-body')!.clientWidth, link: el.querySelector('a')!.getBoundingClientRect().height }))
    expect(size.body).toBe(size.row)
    expect(size.link).toBeGreaterThanOrEqual(44)
  }
  await noPageOverflow(page)
})

for (const profile of [{ width: 320, hasTouch: false }, { width: 1280, hasTouch: true }]) {
  test(`anahtarlar ${profile.width} piksel ve dokunma ${profile.hasTouch} ortamında çalışır`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport: { width: profile.width, height: 800 }, hasTouch: profile.hasTouch })
    try {
      const page = await context.newPage()
      await openDemo(page)
      await page.goto('/#/karar/1/kapi')
      const switches = page.locator('.kapi-switch-target')
      await expect(switches).toHaveCount(2)
      for (const target of await switches.all()) {
        const control = target.getByRole('switch')
        const before = await control.getAttribute('aria-checked')
        await target.scrollIntoViewIfNeeded()
        const box = (await target.boundingBox())!
        expect(box.height).toBeGreaterThanOrEqual(44)
        expect(box.width).toBeGreaterThanOrEqual(44)
        const x = box.x + box.width / 2
        const y = box.y + box.height - 2
        if (profile.hasTouch) await page.touchscreen.tap(x, y)
        else await page.mouse.click(x, y)
        await expect(control).toHaveAttribute('aria-checked', before === 'true' ? 'false' : 'true')
      }
      // Geniş dokunma ortamında klavye de kullanılabilir.
      await switches.first().getByRole('switch').focus()
      await page.keyboard.press('Tab')
      await expect(switches.nth(1).getByRole('switch')).toBeFocused()
      await page.keyboard.press('Shift+Tab')
      await expect(switches.first().getByRole('switch')).toBeFocused()
      await noPageOverflow(page)
    } finally {
      await context.close()
    }
  })
}
