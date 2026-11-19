import { expect, test, type Page } from '@playwright/test'

async function openDemo(page: Page, route: string) {
  await page.goto('/')
  await page.getByText('Kafe örneğini aç').first().click()
  await expect(page).toHaveURL(/#\/ozet/)
  await page.goto(`/#/${route}`)
  await expect(page.locator('main h1')).toBeVisible()
}

async function readable(page: Page) {
  await page.evaluate(() => document.fonts.ready)
  const result = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - innerWidth,
    small: [...document.querySelectorAll('main *')].filter((el) =>
      el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden' &&
      (el.matches('input:not([type=radio]):not([type=checkbox]):not([type=hidden]), textarea, select') || [...el.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())) &&
      parseFloat(getComputedStyle(el).fontSize) < 14,
    ).map((el) => el.textContent?.slice(0, 60)),
  }))
  expect(result.overflow).toBeLessThanOrEqual(1)
  expect(result.small).toEqual([])
}

test('devir bölümü kapanır, içindekiler bölümü yeniden açar', async ({ page }) => {
  await openDemo(page, 'devir')
  const section = page.locator('#devir-yollar')
  const toggle = section.getByRole('button', { name: '4. Karşılaştırılacak yollar', exact: true })
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(section.getByRole('heading', { name: 'Rakip karşı hamlesi' })).toBeHidden()
  const toc = page.getByRole('complementary', { name: 'İçindekiler' })
  const tocToggle = toc.getByRole('button', { name: 'İçindekiler', exact: true })
  if (await tocToggle.getAttribute('aria-expanded') === 'false') await tocToggle.click()
  await toc.getByRole('link', { name: '4. Karşılaştırılacak yollar', exact: true }).click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(toggle).toBeFocused()
  await expect(section).toBeInViewport()
  await expect(page).toHaveURL(/#\/devir$/)
  if ((page.viewportSize()?.width ?? 0) < 1200) {
    expect(await toc.evaluate((el) => Boolean(el.compareDocumentPosition(document.querySelector('.devir-main')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true)
  }
  await readable(page)
})

test('yazdırma kapalı devir bölümlerini gösterir ve ekran durumunu korur', async ({ page }) => {
  await openDemo(page, 'devir')
  const toggle = page.locator('#devir-dayanaklar').getByRole('button', { name: '2. Dayanaklar', exact: true })
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await page.emulateMedia({ media: 'print' })
  await expect(page.getByText('Kafe günde 40 sipariş alır.', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Markdown indir' })).toBeHidden()
  await expect(page.getByRole('complementary', { name: 'İçindekiler' })).toBeHidden()
  await page.emulateMedia({ media: 'screen' })
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByText('Kafe günde 40 sipariş alır.', { exact: true })).toBeHidden()
})

test('varsayım notu ve odak ekran döndüğünde korunur', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await openDemo(page, 'varsayimlar')
  const note = page.getByLabel('Sonuç ne oldu?').first()
  await note.fill('30 kişiden 12 kişi kartı aldı.')
  await page.setViewportSize({ width: 844, height: 390 })
  await expect(note).toHaveValue('30 kişiden 12 kişi kartı aldı.')
  await expect(note).toBeFocused()
  await page.setViewportSize({ width: 320, height: 720 })
  await expect(note).toHaveValue('30 kişiden 12 kişi kartı aldı.')
  await expect(note).toBeFocused()
  await note.press('Tab')
  await page.reload()
  await expect(note).toHaveValue('30 kişiden 12 kişi kartı aldı.')
})

test('temel süzgeci ve devralma kontrolleri dokunmaya uygundur', async ({ page }) => {
  await openDemo(page, 'temel')
  const filters = page.locator('.temel-filter .ant-segmented-item')
  await expect(filters).toHaveCount(4)
  for (const item of await filters.all()) {
    const box = (await item.boundingBox())!
    expect(box.height).toBeGreaterThanOrEqual(44)
    expect(box.width).toBeGreaterThanOrEqual(44)
  }
  await filters.filter({ hasText: 'Eksik' }).click()
  await expect(page.getByRole('radio', { name: 'Eksik', exact: true })).toBeChecked()
  await page.goto('/#/devralma')
  const switches = page.getByRole('switch')
  await expect(switches).toHaveCount(8)
  for (const item of await switches.all()) {
    const box = (await item.boundingBox())!
    expect(box.height).toBeGreaterThanOrEqual(44)
    expect(box.width).toBeGreaterThanOrEqual(44)
  }
  const firstSwitch = switches.first()
  await firstSwitch.click()
  await expect(firstSwitch).toBeChecked()
  await page.reload()
  await expect(firstSwitch).toBeChecked()
  const field = page.getByRole('textbox', { name: 'Gerçekten ödeyen müşteri var mı?' })
  await field.fill('12 müşteri var.')
  await page.setViewportSize({ width: 844, height: 390 })
  await expect(field).toHaveValue('12 müşteri var.')
  await expect(field).toBeFocused()
  await readable(page)
})

test('rapor düğmeleri erişilebilir, kapalı çıktı bölümleri yazdırılır', async ({ page }) => {
  await openDemo(page, 'ciktilar')
  for (const name of ['Yazdır veya PDF', 'Markdown indir', 'JSON indir']) {
    const button = page.getByRole('button', { name, exact: true })
    await expect(button).toBeVisible()
    const box = (await button.boundingBox())!
    expect(box.height).toBeGreaterThanOrEqual(44)
    expect(box.width).toBeGreaterThanOrEqual(44)
  }
  const sections = page.locator('.report-section')
  expect(await sections.count()).toBeGreaterThan(1)
  const headers = page.locator('.report-collapse .ant-collapse-header')
  if ((page.viewportSize()?.width ?? 0) < 768) {
    await expect(headers).toHaveCount(await sections.count())
  }
  for (const header of await headers.all()) {
    if (await header.getAttribute('aria-expanded') === 'true') await header.click()
  }
  for (const header of await headers.all()) await expect(header).toHaveAttribute('aria-expanded', 'false')
  await page.emulateMedia({ media: 'print' })
  for (const body of await sections.all()) {
    await expect(body).toBeVisible()
    await expect(body.locator('p, dt, .ant-typography, .ant-descriptions-item-label, td').first()).toBeVisible()
    expect((await body.innerText()).trim().length).toBeGreaterThan(0)
  }
  await expect(page.getByRole('button', { name: 'JSON indir' })).toBeHidden()
  await page.emulateMedia({ media: 'screen' })
  const downloaded = page.waitForEvent('download')
  await page.getByRole('button', { name: 'JSON indir', exact: true }).click()
  expect((await downloaded).suggestedFilename()).toMatch(/\.json$/)
})

test('altı ekran dar görünümden masaüstüne okunabilir kalır', async ({ page }, testInfo) => {
  await openDemo(page, 'devir')
  const widths = testInfo.project.name === 'chromium-320'
    ? [[320, 720], [360, 800], [375, 812], [390, 844], [844, 390], [768, 1024], [1280, 800], [1920, 1080]]
    : [[page.viewportSize()!.width, page.viewportSize()!.height]]
  for (const [width, height] of widths) {
    await page.setViewportSize({ width, height })
    for (const route of ['devir', 'ciktilar', 'temel', 'varsayimlar', 'devralma', 'yontemler']) {
      await page.goto(`/#/${route}`)
      await expect(page.locator('main h1')).toBeVisible()
      await readable(page)
      await page.evaluate(() => document.fonts.ready)
      await page.screenshot({ path: testInfo.outputPath(`${route}-${width}.png`) })
    }
  }
})


test('devir başlığı klavyeyle açılır ve görünür odak korunur', async ({ page, browserName }) => {
  await openDemo(page, 'devir')
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab')
  const toggle = page.locator('#devir-karar .ant-collapse-header')
  await toggle.focus()
  await expect(toggle).toBeFocused()
  const focus = await toggle.evaluate((el) => {
    const style = getComputedStyle(el)
    const marker = getComputedStyle(el, '::before')
    return { mode: document.documentElement.dataset.focusMode, outline: style.outlineStyle, shadow: style.boxShadow, marker: marker.width, content: marker.content }
  })
  expect(focus).toMatchObject({ mode: 'keyboard', outline: 'none', shadow: 'none', marker: '3px' })
  expect(focus.content).not.toBe('none')
  await toggle.press('Enter')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await toggle.press('Space')
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(toggle).toBeFocused()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('#devir-karar .ant-collapse-panel')).toBeHidden()
  await expect(page.locator('html')).not.toHaveAttribute('data-focus-mode', 'keyboard')
})


test('varsayım süzgeci klavye ve dokunmayla çalışır', async ({ page, browserName }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await openDemo(page, 'varsayimlar')
  const filter = page.getByRole('radiogroup', { name: 'Varsayımları duruma göre göster' })
  await expect(filter.getByRole('radio')).toHaveCount(3)
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab')
  const first = filter.getByRole('radio', { name: 'Denenmedi', exact: true })
  await first.focus()
  await first.press('ArrowRight')
  const next = filter.getByRole('radio', { name: 'Doğrulandı', exact: true })
  await expect(next).toBeChecked()
  await expect(next).toBeFocused()
  await expect.poll(() => next.evaluate((el) => getComputedStyle(el.nextElementSibling!).textDecorationLine)).toContain('underline')
  await expect.poll(() => filter.locator('.ant-segmented-item-label').evaluateAll((labels) => {
    const tops = labels.map((label) => label.getBoundingClientRect().top)
    return Math.max(...tops) - Math.min(...tops)
  })).toBeLessThanOrEqual(1)
  await expect(page.getByRole('heading', { name: 'Doğrulandı', exact: true })).toBeVisible()
  const last = filter.locator('.ant-segmented-item').filter({ hasText: 'Çürüdü' })
  if (testInfo.project.use.hasTouch) await last.tap()
  else await last.click()
  await expect(filter.getByRole('radio', { name: 'Çürüdü', exact: true })).toBeChecked()
  await expect(page.locator('html')).not.toHaveAttribute('data-focus-mode', 'keyboard')
})

test('varsayım süzgeci yedek yazı tipinde de tek satırda kalır', async ({ page }) => {
  // Outfit inmezse yazı biraz genişler. Süzgeç yine de 320 pikselde tek satırda kalmalı.
  await page.route(/\.woff2?$/, (route) => route.abort())
  await page.setViewportSize({ width: 320, height: 720 })
  await openDemo(page, 'varsayimlar')
  await page.evaluate(() => document.fonts.ready)
  const filter = page.getByRole('radiogroup', { name: 'Varsayımları duruma göre göster' })
  const spread = await filter.locator('.ant-segmented-item-label').evaluateAll((labels) => {
    const tops = labels.map((label) => label.getBoundingClientRect().top)
    return Math.max(...tops) - Math.min(...tops)
  })
  expect(spread).toBeLessThanOrEqual(1)
  // Süzgeç içeriği kadar geniştir. Pay, çevresindeki alandan ölçülür.
  const room = await filter.evaluate((el) => el.parentElement!.getBoundingClientRect().width - el.getBoundingClientRect().width)
  // Yazı tipi farkına karşı en az 8 piksel pay kalır.
  expect(room).toBeGreaterThanOrEqual(8)
})

test('çıktı bölümü ve odak ekran döndüğünde korunur', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await openDemo(page, 'ciktilar')
  const toggle = page.getByRole('button', { name: 'Karar yolculuğu', exact: true })
  await toggle.click()
  await toggle.focus()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await page.setViewportSize({ width: 844, height: 390 })
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(toggle).toBeFocused()
  await page.setViewportSize({ width: 320, height: 720 })
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(toggle).toBeFocused()
})

test('devralma cevapları iki temada okunabilir karşıtlık taşır', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openDemo(page, 'devralma')
  const toggle = page.getByRole('switch').first()
  for (const theme of ['light', 'dark']) {
    if (theme === 'dark') await page.getByRole('button', { name: 'Koyu temaya geç' }).click()
    for (const checked of [false, true]) {
      if (checked) await toggle.click()
      // Geçişin ara rengi geçerli bir ölçüm sayılmaz.
      await expect(toggle).toHaveAttribute('aria-checked', String(checked))
      await expect(page.getByRole('button', { name: theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç' })).toBeVisible()
      const contrast = () => toggle.evaluate((el) => {
        const rgb = (value: string) => value.match(/[\d.]+/g)!.map(Number)
        const luminance = (color: number[]) => color.slice(0, 3).reduce((sum, channel, i) => {
          const n = channel / 255
          return sum + (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4) * [0.2126, 0.7152, 0.0722][i]
        }, 0)
        const label = el.querySelector(el.getAttribute('aria-checked') === 'true' ? '.ant-switch-inner-checked' : '.ant-switch-inner-unchecked')!
        const background = rgb(getComputedStyle(el).backgroundColor)
        const surface = rgb(getComputedStyle(el.closest('.ant-card')!).backgroundColor)
        const alpha = background[3] ?? 1
        const blended = background.slice(0, 3).map((channel, i) => channel * alpha + surface[i] * (1 - alpha))
        const fg = luminance(rgb(getComputedStyle(label).color))
        const bg = luminance(blended)
        return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05)
      })
      await expect.poll(contrast).toBeGreaterThanOrEqual(4.5)
    }
    await toggle.click()
  }
})

test('çıktının başlangıçta açık bölümü dar ekranda kapanmaz', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await openDemo(page, 'ciktilar')
  const toggle = page.getByRole('button', { name: 'Karar yolculuğu', exact: true })
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await toggle.focus()
  await page.setViewportSize({ width: 320, height: 720 })
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(toggle).toBeFocused()
  await expect(page.getByRole('columnheader', { name: 'Sonuç', exact: true })).toBeVisible()
})

test('devir ve devralma bağlantılarının dokunma alanı en az 44 pikseldir', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await openDemo(page, 'devir')
  for (const route of ['devir', 'devralma']) {
    await page.goto(`/#/${route}`)
    await expect(page.locator('main h1')).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    const links = page.locator('main a:visible')
    expect(await links.count()).toBeGreaterThan(0)
    for (const link of await links.all()) {
      const box = (await link.boundingBox())!
      expect(box.height, await link.innerText()).toBeGreaterThanOrEqual(44)
      expect(box.width, await link.innerText()).toBeGreaterThanOrEqual(44)
    }
    await readable(page)
  }
  await page.goto('/#/devir')
  const transition = page.getByRole('link', { name: 'Hazırlık kontrolünü aç', exact: true })
  await transition.scrollIntoViewIfNeeded()
  const box = (await transition.boundingBox())!
  const position = { x: box.width / 2, y: box.height - 2 }
  if (testInfo.project.use.hasTouch) await transition.tap({ position })
  else await transition.click({ position })
  await expect(page).toHaveURL(/#\/gecis$/)
})

test('boş teslim raporunda eksik adım bağlantıları dokunmaya uygundur', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Yeni plan', exact: true }).first().click()
  await page.getByPlaceholder('Örneğin Mahalle kafesi').fill('Devir bağlantı denemesi')
  await page.getByRole('button', { name: 'Oluştur', exact: true }).click()
  await expect(page).toHaveURL(/#\/baslangic/)
  await page.goto('/#/devir')
  const missing = page.locator('.devir-missing a')
  await expect(missing.first()).toBeVisible()
  for (const link of await missing.all()) {
    const box = (await link.boundingBox())!
    expect(box.height, await link.innerText()).toBeGreaterThanOrEqual(44)
    expect(box.width, await link.innerText()).toBeGreaterThanOrEqual(44)
  }
  await readable(page)
  const summary = page.getByRole('link', { name: 'Plan özetini aç', exact: true })
  await summary.focus()
  await summary.press('Enter')
  await expect(page).toHaveURL(/#\/ozet$/)
})

test('yöntemlerin sayfa numarası telefonda okunur ve değiştirilebilir', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await openDemo(page, 'yontemler')
  const number = page.locator('.method-pagination input')
  await expect(number).toHaveValue('1')
  expect(await number.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(14)
  const box = (await number.boundingBox())!
  expect(box.height).toBeGreaterThanOrEqual(44)
  expect(box.width).toBeGreaterThanOrEqual(44)
  await number.fill('2')
  await number.press('Enter')
  await expect(number).toHaveValue('2')
  await expect(page.getByText('128 yöntemden 25 ile 48 arası görünüyor.', { exact: true })).toBeVisible()
  await readable(page)
})
