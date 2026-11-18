import { expect, test, type Page } from '@playwright/test'

async function openDemo(page: Page) {
  await page.goto('/')
  await page.getByText('Örnek planı aç', { exact: true }).first().click()
  await expect(page).toHaveURL(/#\/ozet/)
  await expect(page.locator('.mobil-overview')).toBeVisible()
}

const routes = ['ozet', 'planlar', 'baslangic', 'kanitlar', 'isler', 'gecmis', 'gostergeler']
const routeRoots: Record<string, string> = { ozet: 'overview', planlar: 'plans', baslangic: 'start', kanitlar: 'evidence', isler: 'tasks', gecmis: 'history', gostergeler: 'insights' }

test('320 pikselde plan adı ve grafik görünümü dokunmaya uygundur', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await openDemo(page)
  await page.goto('/#/planlar')
  const name = page.getByRole('button', { name: /^(?:Aç: )?Örnek: Mahalle kafesi$/ })
  await expect(name).toBeVisible()
  const box = await name.boundingBox()
  expect(box!.height).toBeGreaterThanOrEqual(44)
  await page.goto('/#/gostergeler')
  const choices = page.locator('.chart-view .ant-segmented-item-label')
  await expect(choices.first()).toBeVisible()
  for (const choice of await choices.all()) {
    const rect = await choice.boundingBox()
    if (rect) expect(rect.height).toBeGreaterThanOrEqual(44)
  }
})

test('liste ekranları her kabul genişliğinde taşmadan okunur', async ({ page }, testInfo) => {
  await openDemo(page)
  for (const [width, height] of [[320, 720], [360, 740], [375, 812], [390, 844], [844, 390], [768, 1024], [1280, 800], [1920, 1080]]) {
    await page.setViewportSize({ width, height })
    for (const route of routes) {
      await page.goto(`/#/${route}`)
      await expect(page.locator(`.mobil-${routeRoots[route]} h1`)).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      const result = await page.evaluate(() => ({
        viewport: innerWidth,
        width: document.documentElement.scrollWidth,
        small: [...document.querySelectorAll('main *')].filter((element) => {
          const node = element as HTMLElement
          return node.offsetParent !== null && getComputedStyle(node).visibility !== 'hidden'
            && [...node.childNodes].some((child) => child.nodeType === 3 && child.textContent?.trim())
            && Number.parseFloat(getComputedStyle(node).fontSize) < 14
        }).map((node) => node.className),
      }))
      expect(result.width, `${route}, ${width}`).toBeLessThanOrEqual(width)
      expect(result.small, `${route}, ${width}`).toEqual([])
      if ([320, 1280].includes(width)) await page.screenshot({ path: testInfo.outputPath(`${route}-${width}.png`), fullPage: true })
    }
  }
})

for (const withoutObserver of [false, true]) {
test(`grafik ekrana girene kadar kod indirmez ve tablo erişilebilir kalır${withoutObserver ? ' (görünürlük API desteği olmadan)' : ''}`, async ({ page, browser }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await openDemo(page)
  const context = await browser.newContext({ storageState: await page.context().storageState(), viewport: { width: 320, height: 720 }, hasTouch: true })
  if (withoutObserver) await context.addInitScript(() => { Object.defineProperty(window, 'IntersectionObserver', { value: undefined }) })
  const coldPage = await context.newPage()
  const requests: string[] = []
  coldPage.on('request', (request) => requests.push(request.url()))
  try {
    await coldPage.goto(`${testInfo.project.use.baseURL}/#/gostergeler`)
    await expect(coldPage.locator('.chart-frame').first()).toBeAttached()
    await coldPage.evaluate(async () => {
      await document.fonts.ready
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    })
    const firstChart = coldPage.locator('.chart-canvas').first()
    expect((await firstChart.boundingBox())!.y).toBeGreaterThanOrEqual(720)
    await expect(coldPage.locator('canvas')).toHaveCount(0)
    const chartRequests = () => requests.filter((url) => /\/EChart[.-]|\/echarts[.-]/.test(url))
    expect(chartRequests()).toEqual([])
    expect(await coldPage.getByRole('table').count()).toBeGreaterThan(0)
    await firstChart.scrollIntoViewIfNeeded()
    await expect(firstChart.locator('canvas')).toBeVisible()
    expect(chartRequests().length).toBeGreaterThan(0)
    const frame = coldPage.locator('.chart-frame').first()
    await frame.getByText('Tablo', { exact: true }).click()
    await expect(frame.getByRole('radio', { name: 'Tablo', exact: true })).toBeChecked()
    const region = frame.getByRole('region')
    await expect(region).not.toHaveClass(/sr-only/)
    await expect(region.getByRole('table')).toBeVisible()
    await coldPage.keyboard.press('Tab')
    await region.focus()
    await expect(region).toBeFocused()
    const focus = await region.evaluate((element) => ({
      mode: document.documentElement.getAttribute('data-focus-mode'),
      outline: getComputedStyle(element).outlineStyle,
      marker: getComputedStyle(element, '::before').width,
      overflow: getComputedStyle(element).overflowX,
    }))
    expect(focus).toMatchObject({ mode: 'keyboard', outline: 'none', marker: '3px', overflow: 'auto' })
    const before = await region.evaluate((element) => element.scrollLeft)
    await coldPage.keyboard.press('ArrowRight')
    await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(before)
    const visibleMarker = await region.evaluate((element) => {
      const style = getComputedStyle(element)
      const marker = getComputedStyle(element, '::before')
      return style.backgroundImage !== 'none' || (marker.display !== 'none' && Number.parseFloat(marker.left) >= element.scrollLeft)
    })
    expect(visibleMarker, 'Tablo kayınca klavye odağı görünür kalmalı').toBe(true)
    const afterRight = await region.evaluate((element) => element.scrollLeft)
    await coldPage.keyboard.press('ArrowLeft')
    await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBeLessThan(afterRight)
    await expect(region).toBeFocused()
    await coldPage.screenshot({ path: testInfo.outputPath('chart-table-320.png'), fullPage: true })
    await testInfo.attach('chart-requests.json', { body: JSON.stringify(requests, null, 2), contentType: 'application/json' })
  } finally {
    await context.close()
  }
})
}

test('kanıt taslağı ve odak yatay görünümde korunur', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await openDemo(page)
  await page.goto('/#/kanitlar')
  await page.getByRole('button', { name: 'Kanıt ekle', exact: true }).click()
  const title = page.getByRole('textbox', { name: 'Kanıtın adı', exact: true })
  await title.fill('Yatay görünümde korunacak görüşme notu')
  await title.focus()
  await page.setViewportSize({ width: 844, height: 390 })
  await expect(title).toHaveValue('Yatay görünümde korunacak görüşme notu')
  await expect(title).toBeFocused()
  await expect(page.getByRole('button', { name: 'Kaydet', exact: true })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('evidence-landscape-draft.png') })
  await page.setViewportSize({ width: 320, height: 720 })
  await expect(title).toBeFocused()
  await expect(title).toHaveValue('Yatay görünümde korunacak görüşme notu')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
})

test('kanıt merdiveninde ok tuşları görünür odağı ve seçimi birlikte taşır', async ({ page }, testInfo) => {
  await openDemo(page)
  await page.goto('/#/kanitlar')
  await page.getByRole('button', { name: 'Kanıt ekle', exact: true }).click()
  const picker = page.locator('.mobil-ladder.ladder-picker')
  const radios = picker.getByRole('radio')
  await picker.locator('.ant-segmented-item').first().click()
  await page.keyboard.press('Tab')
  await radios.first().focus()

  async function expectKeyboardChoice(index: number) {
    const radio = radios.nth(index)
    await expect(radio).toBeChecked()
    await expect(radio).toBeFocused()
    await expect.poll(() => radio.evaluate((element) => {
      const label = element.nextElementSibling!
      return {
        mode: document.documentElement.getAttribute('data-focus-mode'),
        visible: element.matches(':focus-visible'),
        underline: getComputedStyle(label).textDecorationLine,
        outline: getComputedStyle(label).outlineStyle,
        shadow: getComputedStyle(label).boxShadow,
      }
    })).toEqual({ mode: 'keyboard', visible: true, underline: 'underline', outline: 'none', shadow: 'none' })
  }

  await expectKeyboardChoice(0)
  for (const [key, index] of [['ArrowDown', 1], ['ArrowUp', 0], ['ArrowUp', 6], ['ArrowDown', 0], ['ArrowRight', 1], ['ArrowLeft', 0]] as const) {
    await page.keyboard.press(key)
    await expectKeyboardChoice(index)
  }
  for (const [width, height] of [[844, 390], [320, 720]]) {
    await page.setViewportSize({ width, height })
    await expectKeyboardChoice(0)
  }
  await picker.locator('.ant-segmented-item-label').first().scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath('ladder-keyboard-320.png') })
  await picker.locator('.ant-segmented-item').nth(3).tap()
  await expect(radios.nth(3)).toBeChecked()
  await expect(page.locator('html')).not.toHaveAttribute('data-focus-mode', 'keyboard')
})


test('geçmiş filtresinin klavye odağı görünürdür', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await openDemo(page)
  await page.goto('/#/gecmis')
  await page.keyboard.press('Tab')
  const radio = page.getByRole('radio', { name: 'Hepsi', exact: true })
  await radio.focus()
  const style = await radio.evaluate((element) => {
    const label = element.closest('label')!
    return { mode: document.documentElement.getAttribute('data-focus-mode'), underline: getComputedStyle(label.lastElementChild!).textDecorationLine, outline: getComputedStyle(label).outlineStyle }
  })
  expect(style).toEqual({ mode: 'keyboard', underline: 'underline', outline: 'none' })
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('radio', { name: 'Kararlar', exact: true })).toBeChecked()
})

test('geçmiş kartları dar alanda çizgisizdir ve filtre iki sütunda kalır', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await openDemo(page)
  await page.goto('/#/gecmis')
  await page.evaluate(() => document.fonts.ready)
  const timeline = page.locator('.history-timeline')
  const entries = timeline.locator('article.history-entry')
  await expect(entries.first()).toBeVisible()
  const firstEntry = await entries.first().elementHandle()
  const entryCount = await entries.count()
  const choices = page.locator('.history-filter label')
  await expect(choices).toHaveCount(4)
  const radio = page.getByRole('radio', { name: 'Hepsi', exact: true })
  await page.keyboard.press('Tab')
  await radio.focus()
  for (const [width, height] of [[320, 720], [360, 740], [375, 812], [390, 844], [844, 390], [767, 1024], [768, 1024], [769, 1024], [844, 479], [844, 480], [844, 481], [1280, 800]]) {
    await page.setViewportSize({ width, height })
    await expect(radio).toBeFocused()
    expect(await firstEntry!.evaluate((element) => element.isConnected)).toBe(true)
    await expect(entries).toHaveCount(entryCount)
    const boxes = await choices.evaluateAll((elements) => elements.map((element) => {
      const rect = element.getBoundingClientRect()
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    }))
    if ([320, 1280].includes(width)) await page.screenshot({ path: testInfo.outputPath(`history-${width}.png`), fullPage: true })
    expect.soft(boxes[0].y, `${width}: ilk sıra`).toBeCloseTo(boxes[1].y)
    expect.soft(boxes[2].y, `${width}: ikinci sıra`).toBeCloseTo(boxes[3].y)
    expect.soft(boxes[0].x, `${width}: ilk sütun`).toBeCloseTo(boxes[2].x)
    expect.soft(boxes[1].x, `${width}: ikinci sütun`).toBeCloseTo(boxes[3].x)
    expect.soft(boxes[2].y, `${width}: ayrı sıralar`).toBeGreaterThanOrEqual(boxes[0].y + boxes[0].height)
    for (const box of boxes) {
      expect(box.width).toBeGreaterThanOrEqual(44)
      expect(box.height).toBeGreaterThanOrEqual(44)
    }
    const decorations = timeline.locator('.ant-timeline-item-icon:visible, .ant-timeline-item-rail:visible')
    if (width < 768 || height < 481) {
      expect.soft(await decorations.count(), `${width} × ${height}: dekoratif sütun`).toBe(0)
      expect.soft((await entries.first().boundingBox())!.x, 'Kart boş ikon sütunu bırakmamalı').toBeCloseTo((await timeline.boundingBox())!.x)
    } else {
      expect(await decorations.count()).toBeGreaterThan(0)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
  }
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('radio', { name: 'Kararlar', exact: true })).toBeChecked()
})

test('iş listesinde tek durum kontrolü vardır ve yatay görünüm odağı korur', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await openDemo(page)
  await page.goto('/#/isler')
  await page.getByRole('tab', { name: 'Liste', exact: false }).click()
  const list = page.getByRole('list', { name: 'İş kayıtları' })
  await expect(list).toBeVisible()
  const cards = list.locator('.task-list-card')
  const controls = list.getByRole('combobox')
  expect(await controls.count()).toBe(await cards.count())
  await controls.first().focus()
  await page.setViewportSize({ width: 844, height: 390 })
  await expect(controls.first()).toBeFocused()
  await expect(list).toBeVisible()
  expect(await controls.count()).toBe(await cards.count())
  await page.keyboard.press('ArrowDown')
  await expect(controls.first()).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('.ant-select-dropdown:visible')).toBeVisible()
  await expect(page.getByRole('listbox')).toBeAttached()
  await page.keyboard.press('Escape')
  await expect(controls.first()).toBeFocused()
})

test('plan kartındaki işlem odağı iki yönlü dönüşte korunur', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await openDemo(page)
  await page.goto('/#/planlar')
  const action = page.getByRole('button', { name: 'JSON indir: Örnek: Mahalle kafesi', exact: true })
  await action.focus()
  for (const [width, height] of [[844, 390], [1280, 800], [320, 720]]) {
    await page.setViewportSize({ width, height })
    await expect(action).toBeVisible()
    await expect(action).toBeFocused()
    await expect(page.locator('.mobil-plan-card')).toHaveCount(1)
  }
})

test('son kararlar klavyeyle açılır ve yön değişince açık kalır', async ({ page }) => {
  await openDemo(page)
  const section = page.locator('.overview-recent-collapse')
  const toggle = section.getByRole('button', { name: 'Son kararlar (3)', exact: true })
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  expect((await toggle.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  await page.keyboard.press('Tab')
  await toggle.focus()
  await page.keyboard.press('Enter')
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(section.locator('.tl-reason')).toHaveCount(3)
  const history = section.getByRole('link', { name: 'Hepsi', exact: true })
  await history.focus()
  await page.setViewportSize({ width: 844, height: 390 })
  await expect(history).toBeFocused()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await page.setViewportSize({ width: 320, height: 720 })
  await expect(history).toBeFocused()
  await toggle.focus()
  await page.keyboard.press('Space')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(history).not.toBeVisible()
})

test('yol ve varsayılan rota bağlantıları daralmada odağı korur', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await openDemo(page)
  const road = page.getByRole('list', { name: 'Yol', exact: true }).getByRole('link').first()
  const route = page.locator('.route-collapse a[href="#/karar/1"]')
  await expect(road).toBeVisible()
  await expect(route).toBeVisible()
  await road.focus()
  await page.setViewportSize({ width: 320, height: 720 })
  await expect(road).toBeVisible()
  await expect(road).toBeFocused()
  await expect(route).toBeVisible()
  await route.focus()
  for (const [width, height] of [[844, 390], [1280, 800], [320, 720]]) {
    await page.setViewportSize({ width, height })
    await expect(route).toBeVisible()
    await expect(route).toBeFocused()
  }
})
