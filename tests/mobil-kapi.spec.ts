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
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
}

for (const { route, heading, destinations } of [
  { route: '/karar/1', heading: 'Bu işi araştırmaya değer mi?', destinations: ['/karar/1/adim/00', '/karar/1/kapi', '/yontemler'] },
  { route: '/karar/6', heading: 'İlk teslim gerçekten işe yarıyor mu?', destinations: ['/gecis', '/karar/6/kapi', '/yontemler'] },
  { route: '/karar/5/kapi', heading: 'Kapı 5. Para, risk ve yol adayları hazır mı?', destinations: ['/karar/5/adim/16', '/karar/5/adim/17', '/karar/5/adim/18'] },
  { route: '/gecis', heading: 'Stratejik planlamaya hazır mısınız?', destinations: ['/devir', '/karar/2/adim/07', '/karar/5/adim/17', '/karar/1/adim/04'] },
  { route: '/strateji', heading: 'Hangi yolu, hangi gerekçeyle seçiyorsunuz? Neyden vazgeçiyorsunuz?', destinations: ['/gecis', '/devir'] },
]) {
  test(`M03 ${route} bağlantıları 44 piksel alan sunar`, async ({ page }, testInfo) => {
    await openDemo(page)
    await page.goto(`/#${route}`)
    const screen = page.locator('.mobil-kapi-page')
    await expect(screen).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`#${route}$`))
    await expect(screen.getByRole('heading', { level: 1, name: heading, exact: true })).toBeVisible()
    // Kapalı dayanakların bağlantıları da açıldıktan sonra denetlenir.
    for (const summary of await screen.locator('.gecis-criterion-more > summary').all()) {
      await summary.click()
      await expect(summary.locator('..')).toHaveAttribute('open', '')
      await expect(summary.locator('..').getByRole('link')).toBeVisible()
    }
    for (const destination of destinations) await expect(screen.locator(`a[href="#${destination}"]`).first()).toBeVisible()
    const links = screen.locator('a[href]:visible')
    expect(await links.count()).toBeGreaterThan(0)
    const measurements = []
    for (const link of await links.all()) {
      await link.scrollIntoViewIfNeeded()
      const measured = await link.evaluate((el) => {
        const box = el.getBoundingClientRect()
        return { text: el.textContent, href: el.getAttribute('href'), width: box.width, height: box.height }
      })
      measurements.push(measured)
      expect.soft(measured.width, `${measured.text}: genişlik`).toBeGreaterThanOrEqual(44)
      expect.soft(measured.height, `${measured.text}: yükseklik`).toBeGreaterThanOrEqual(44)
      // Kutu büyüse bile komşu kontrolün altında kalan alan kabul edilmez.
      const reachable = await link.evaluate((el) => {
        const box = el.getBoundingClientRect()
        const points = [[box.left + 2, box.top + box.height / 2], [box.right - 2, box.top + box.height / 2], [box.left + box.width / 2, box.top + 2], [box.left + box.width / 2, box.bottom - 2]]
        return points.every(([x, y]) => el.contains(document.elementFromPoint(x, y)))
      })
      expect.soft(reachable, `${measured.text}: dört kenardan erişim`).toBe(true)
    }
    await testInfo.attach('M03-baglanti-olculeri', { body: JSON.stringify(measurements, null, 2), contentType: 'application/json' })
    await testInfo.attach('M03-ekran', { body: await screen.screenshot({ path: testInfo.outputPath('M03-ekran.png') }), contentType: 'image/png' })
    await noPageOverflow(page)
  })
}

async function marker(locator: Locator) {
  return locator.evaluate((el) => {
    const style = getComputedStyle(el, '::before')
    return { display: style.display, content: style.content, width: parseFloat(style.width), height: parseFloat(style.height), color: style.backgroundColor }
  })
}

test('M03 geniş ekranda sabit panel bağlantısı üst menünün altında kalmaz', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1920, height: 1080 })
  await openDemo(page)
  await page.goto('/#/strateji')
  const link = page.getByRole('link', { name: 'Geçiş kapısını aç', exact: true })
  await expect(link).toBeVisible()
  await page.evaluate(() => window.scrollTo(0, 600))
  const scrolledBounds = await link.evaluate((el) => ({ top: el.getBoundingClientRect().top, menuBottom: document.querySelector('.product-nav')!.getBoundingClientRect().bottom }))
  expect(scrolledBounds.top).toBeGreaterThanOrEqual(scrolledBounds.menuBottom)
  await link.focus()
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Tab')
  await expect(link).toBeFocused()
  const bounds = await link.evaluate((el) => ({ top: el.getBoundingClientRect().top, menuBottom: document.querySelector('.product-nav')!.getBoundingClientRect().bottom }))
  expect(bounds.top).toBeGreaterThanOrEqual(bounds.menuBottom)
  expect(await link.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return [[r.left + 2, r.top + r.height / 2], [r.right - 2, r.top + r.height / 2], [r.left + r.width / 2, r.top + 2], [r.left + r.width / 2, r.bottom - 2]].every(([x, y]) => el.contains(document.elementFromPoint(x, y)))
  })).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('M03-sabit-panel.png') })
  await noPageOverflow(page)
})

test('M03 karar tablosunda yalnız iç kutu kayar ve bağlantı kenarları açık kalır', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await openDemo(page)
  await page.goto('/#/karar/1')
  const wrapper = page.locator('.karar-table')
  await expect(wrapper).toHaveCSS('overflow-x', 'visible')
  await expect(wrapper).toHaveCSS('overflow-y', 'visible')
  const content = wrapper.locator('.ant-table-content')
  expect(await content.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true)
  for (const link of await wrapper.locator('a[href]').all()) {
    await link.evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' }))
    expect(await link.evaluate((el) => {
      const r = el.getBoundingClientRect()
      return [[r.left + 2, r.top + r.height / 2], [r.right - 2, r.top + r.height / 2], [r.left + r.width / 2, r.top + 2], [r.left + r.width / 2, r.bottom - 2]].every(([x, y]) => el.contains(document.elementFromPoint(x, y)))
    })).toBe(true)
  }
  expect(await content.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0)
  await noPageOverflow(page)
})

test('M03 uzun karar panelinin bağlantısı Tab sonrasında üst şeridin altında kalmaz', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 })
  await openDemo(page)
  await page.goto('/#/karar/1')
  await page.evaluate(() => document.fonts.ready)
  const target = page.getByRole('link', { name: 'Kapıyı aç', exact: true })
  for (const link of await page.locator('.karar-table a[href]').all()) {
    await link.scrollIntoViewIfNeeded()
    await link.evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' }))
  }
  await target.scrollIntoViewIfNeeded()
  await page.locator('.karar-table').getByRole('link', { name: 'Aç', exact: true }).last().focus()
  for (let index = 0; index < 8; index++) {
    await page.keyboard.press('Tab')
    if (await target.evaluate((el) => el === document.activeElement)) break
  }
  await expect(target).toBeFocused()
  expect(await target.evaluate((el) => {
    const r = el.getBoundingClientRect()
    const menuBottom = document.querySelector('.product-nav')!.getBoundingClientRect().bottom
    return r.top >= menuBottom && [[r.left + 2, r.top + r.height / 2], [r.right - 2, r.top + r.height / 2], [r.left + r.width / 2, r.top + 2], [r.left + r.width / 2, r.bottom - 2]].every(([x, y]) => el.contains(document.elementFromPoint(x, y)))
  })).toBe(true)
  await noPageOverflow(page)
})

test('M03 dayanak tablosu ikinci kaydırma çubuğuyla bağlantıları örtmez', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openDemo(page)
  await page.goto('/#/gecis')
  await page.evaluate(() => document.fonts.ready)
  for (const summary of await page.locator('.gecis-criterion-more > summary').all()) {
    await summary.click()
    await expect(summary.locator('..')).toHaveAttribute('open', '')
  }
  for (const wrapper of await page.locator('.mobil-kapi-page .table-scroll').all()) {
    await expect(wrapper).toHaveCSS('overflow-x', 'visible')
    await expect(wrapper).toHaveCSS('overflow-y', 'visible')
  }
  for (const link of await page.locator('.mobil-kapi-page .table-scroll a[href]:visible').all()) {
    await link.evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' }))
    expect(await link.evaluate((el) => {
      const r = el.getBoundingClientRect()
      return r.width >= 44 && r.height >= 44 && [[r.left + 2, r.top + r.height / 2], [r.right - 2, r.top + r.height / 2], [r.left + r.width / 2, r.top + 2], [r.left + r.width / 2, r.bottom - 2]].every(([x, y]) => el.contains(document.elementFromPoint(x, y)))
    })).toBe(true)
  }
  await noPageOverflow(page)
})

test('M03 kapı bağlantısı tek odak işareti taşır ve kenarından açılır', async ({ page }, testInfo) => {
  await openDemo(page)
  await page.goto('/#/karar/1')
  const link = page.getByRole('link', { name: 'Kapıyı aç', exact: true })
  await link.focus()
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Tab')
  await expect(link).toBeFocused()
  await expect(link).toHaveCSS('text-decoration-line', 'underline')
  await expect(link).toHaveCSS('text-decoration-thickness', '2px')
  expect((await marker(link)).display).toBe('none')
  await expect(link).toHaveCSS('outline-style', 'none')
  await expect(link).toHaveCSS('box-shadow', 'none')
  await link.scrollIntoViewIfNeeded()
  await testInfo.attach('M03-baglanti-odagi', { body: await page.screenshot({ path: testInfo.outputPath('M03-baglanti-odagi.png') }), contentType: 'image/png' })
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#\/karar\/1\/kapi$/)
  await page.goBack()
  await expect(link).toBeVisible()
  await link.scrollIntoViewIfNeeded()
  const box = (await link.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height - 2
  if (testInfo.project.use.hasTouch) await page.touchscreen.tap(x, y)
  else await page.mouse.click(x, y)
  await expect(page).toHaveURL(/#\/karar\/1\/kapi$/)
  await page.goBack()
  await page.emulateMedia({ forcedColors: 'active' })
  if (await page.evaluate(() => matchMedia('(forced-colors: active)').matches)) {
    await link.focus()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    await expect(link).toBeFocused()
    await expect(link).toHaveCSS('outline-style', 'solid')
    await expect(link).toHaveCSS('outline-width', '2px')
    await expect(link).toHaveCSS('text-decoration-line', 'none')
    expect((await marker(link)).display).toBe('none')
    await link.scrollIntoViewIfNeeded()
    await page.screenshot({ path: testInfo.outputPath('M03-zorunlu-renk-odagi.png') })
  }
})

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
