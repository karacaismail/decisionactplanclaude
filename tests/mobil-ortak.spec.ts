import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'

async function openDemo(page: Page) {
  await page.goto('/')
  await expect(async () => {
    if (!/#\/ozet/.test(page.url())) await page.getByText('Örnek planı aç').first().click({ timeout: 2000 })
    await expect(page).toHaveURL(/#\/ozet/, { timeout: 2000 })
  }).toPass()
}

// Basma alanı gerçek isabet testiyle ölçülür. Merkezin 21 piksel üstü, altı, solu ve sağı aynı kontrole düşmelidir.
// Görünmez katmanla büyütülen alan da sayılır. Kutunun kendisinin 44 piksel olması gerekmez.
async function hitArea(locator: Locator) {
  const count = await locator.count()
  expect(count).toBeGreaterThan(0)
  for (let i = 0; i < count; i++) {
    const item = locator.nth(i)
    await item.evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'nearest' }))
    const hits = await item.evaluate((el) => {
      const box = el.getBoundingClientRect()
      const cx = box.left + box.width / 2
      const cy = box.top + box.height / 2
      const at = (x: number, y: number) => {
        const hit = document.elementFromPoint(x, y)
        return Boolean(hit && (el === hit || el.contains(hit) || hit.contains(el)))
      }
      return { width: at(cx - 21, cy) && at(cx + 21, cy), height: at(cx, cy - 21) && at(cx, cy + 21) }
    })
    expect.soft(hits.width, `Kontrol genişliği: ${await item.getAttribute('class')}`).toBe(true)
    expect.soft(hits.height, `Kontrol yüksekliği: ${await item.getAttribute('class')}`).toBe(true)
  }
}

// Aynı kontrolün işaretçi ve klavye görüntülerindeki boyanmış pikselleri karşılaştırır.
// Bir stilin tanımlanması, görünür odak kanıtı sayılmaz.
async function visibleFocus(page: Page, input: Locator, host: Locator, info: TestInfo, name: string) {
  await input.scrollIntoViewIfNeeded()
  await input.focus()
  await page.evaluate(() => document.fonts.ready)
  const before = await host.screenshot()
  await page.keyboard.press('Tab')
  await input.focus()
  await expect(input).toBeFocused()
  await expect(page.locator('html')).toHaveAttribute('data-focus-mode', 'keyboard')
  const after = await host.screenshot()
  await info.attach(`${name}-once`, { body: before, contentType: 'image/png' })
  await info.attach(`${name}-sonra`, { body: after, contentType: 'image/png' })
  const result = await page.evaluate(async ({ before, after }) => {
    async function pixels(data: string) {
      const image = new Image()
      image.src = `data:image/png;base64,${data}`
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const context = canvas.getContext('2d')!
      context.drawImage(image, 0, 0)
      return { data: context.getImageData(0, 0, image.width, image.height).data, width: image.width, height: image.height }
    }
    const a = await pixels(before), b = await pixels(after)
    const canvas = document.createElement('canvas'), context = canvas.getContext('2d')!
    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--focus-marker').trim()
    context.fillRect(0, 0, 1, 1)
    const color = context.getImageData(0, 0, 1, 1).data
    const changed = (x: number, y: number) => {
      const offset = (y * b.width + x) * 4
      return [0, 1, 2].every(i => Math.abs(b.data[offset + i] - color[i]) <= 1)
        && [0, 1, 2].some(i => Math.abs(b.data[offset + i] - a.data[offset + i]) > 8)
    }
    let longest = 0
    for (let x = 0; x < b.width - 1; x++) {
      let run = 0
      for (let y = 0; y < b.height; y++) {
        run = changed(x, y) && changed(x + 1, y) ? run + 1 : 0
        longest = Math.max(longest, run)
      }
    }
    return { sameSize: a.width === b.width && a.height === b.height, longest }
  }, { before: before.toString('base64'), after: after.toString('base64') })
  expect(result.sameSize, 'Odak kontrolün boyutunu değiştirmemeli.').toBe(true)
  expect(result.longest, 'En az 2 × 8 piksel görünür odak işareti çizilmeli.').toBeGreaterThanOrEqual(8)
  await expect(input).toHaveCSS('outline-style', 'none')
  await expect(host).toHaveCSS('outline-style', 'none')
  await page.mouse.click(1, 1)
  await expect(page.locator('html')).not.toHaveAttribute('data-focus-mode', 'keyboard')
}

test('M02 ortak anahtar, seçenek ve satır düğmeleri 44 piksel alanı korur', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/1/adim/00')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Adım 00')
  for (const density of ['comfortable', 'compact', 'dense']) {
    await page.locator('html').evaluate((el, density) => el.setAttribute('data-density', density), density)
    await hitArea(page.locator('main .ant-switch, main .ant-radio-button-wrapper'))
  }
  await page.goto('/#/karar/3/adim/09')
  await hitArea(page.locator('.repeater-actions .ant-btn'))
  const clear = page.locator('.ant-select-clear').first()
  await clear.scrollIntoViewIfNeeded()
  await hitArea(clear)
  await expect(clear, 'Temizleme eylemi hover olmadan görünmeli.').toHaveCSS('opacity', '1')
  await clear.click({ position: { x: 3, y: 3 } })
  await expect(page.locator('.ant-select').first()).not.toContainText('Doğrudan rakip')
})

test('M02 metin temizleme düğmesi 44 piksel alanla çalışır', async ({ page }) => {
  await page.goto('/#/yontemler')
  const input = page.locator('#yontem-ara')
  await input.fill('karar')
  const clear = page.locator('.ant-input-clear-icon').first()
  await hitArea(clear)
  await clear.click({ position: { x: 3, y: 3 } })
  await expect(input).toHaveValue('')
})

test('M06 küçük ekran sayfalama yazısı en az 14 pikseldir', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) >= 576, 'Küçük ekran sayfalaması')
  await page.goto('/#/yontemler')
  const input = page.locator('.ant-pagination-simple-pager input')
  await expect(input).toBeVisible()
  expect(await input.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(14)
  await input.fill('2')
  await input.press('Enter')
  await expect(input).toHaveValue('2')
})

test('M09 komut aramasında görünür klavye odağı çizilir', async ({ page }, info) => {
  await page.goto('/')
  await page.getByRole('button', { name: /^Ara\. Kısayol/ }).click()
  const input = page.getByPlaceholder('Adım, karar ya da yöntem ara…')
  await visibleFocus(page, input, input, info, 'arama')
})

test('M12 plan adında görünür klavye odağı çizilir', async ({ page }, info) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Yeni plan', exact: true }).click()
  const input = page.getByRole('textbox', { name: 'Planın adı', exact: true })
  await visibleFocus(page, input, input, info, 'plan-adi')
})

test('M12 Adım 00 seçeneklerinde görünür klavye odağı çizilir', async ({ page }, info) => {
  await openDemo(page)
  await page.goto('/#/karar/1/adim/00')
  const option = page.getByRole('radio', { name: 'Tüketici', exact: true })
  await visibleFocus(page, option, option.locator('xpath=ancestor::label[1]'), info, 'secenek')
  await option.focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('radio', { name: 'İşletme', exact: true })).toBeChecked()
})

test('M12 zorlanmış renklerde seçenek odağı görünür kalır', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/1/adim/00')
  await page.emulateMedia({ forcedColors: 'active' })
  const radio = page.getByRole('radio', { name: 'Tüketici', exact: true })
  await page.keyboard.press('Tab')
  await radio.focus()
  await expect(radio).toHaveCSS('outline-style', 'solid')
  await expect(radio).toHaveCSS('outline-width', '2px')
  await expect(radio).toHaveCSS('opacity', '1')
  const box = await radio.boundingBox()
  expect(box?.width).toBeGreaterThan(0)
  expect(box?.height).toBeGreaterThan(0)
  await page.mouse.click(1, 1)
  await expect(radio).toHaveCSS('outline-style', 'none')
})

test('M02 anahtarın görünen izi küçük kalır, dört kenar gerçek eylemi çalıştırır', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/1/adim/00')
  const toggle = page.locator('#a00-needsPremises')
  await toggle.scrollIntoViewIfNeeded()
  const track = await toggle.evaluate(el => {
    const style = getComputedStyle(el)
    return { visual: el.getBoundingClientRect().height, expected: parseFloat(style.getPropertyValue('--ant-switch-track-height')), border: parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth) }
  })
  // Saydam kenar köşeleri basık oval çizer. İz kenarsız ve kendi yüksekliğinde kalır.
  expect(track.border).toBe(0)
  expect(track.visual).toBe(track.expected)
  const box = (await toggle.boundingBox())!
  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2
  // Görünen izin dışında kalan dört nokta da gerçek eylemi çalıştırır.
  for (const [x, y] of [[cx, cy - 21], [cx, cy + 21], [box.x + 1, cy], [box.x + box.width - 1, cy]]) {
    const checked = await toggle.getAttribute('aria-checked')
    await page.mouse.click(x, y)
    await expect(toggle).toHaveAttribute('aria-checked', checked === 'true' ? 'false' : 'true')
  }
})

test('M09 yazılı arama metni odak işaretinin üstüne gelmez', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /^Ara\. Kısayol/ }).click()
  const input = page.getByPlaceholder('Adım, karar ya da yöntem ara…')
  await input.fill('Karar')
  await page.keyboard.press('Tab')
  await input.focus()
  const spacing = await input.evaluate(el => {
    const style = getComputedStyle(el)
    return { textStart: parseFloat(style.paddingLeft), markerEnd: parseFloat(style.getPropertyValue('--focus-marker-width')) }
  })
  expect(spacing.textStart).toBeGreaterThan(spacing.markerEnd)
})


test('M12 odaklı seçenek sabit başlığın altında kalmaz', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/1/adim/00')
  const option = page.getByRole('radio', {name: 'Tüketici', exact:true})
  const host = option.locator('xpath=ancestor::label[1]')
  await host.evaluate(el => el.scrollIntoView({block:'start'}))
  await page.keyboard.press('Tab')
  await option.focus()
  const topbar = await page.locator('.topbar').boundingBox()
  const box = await host.boundingBox()
  expect(box!.y).toBeGreaterThanOrEqual(topbar!.y + topbar!.height)
  const uncovered = await host.evaluate(el => {
    const box = el.getBoundingClientRect()
    return el.contains(document.elementFromPoint(box.x + box.width / 2, box.y + 2))
  })
  expect(uncovered, 'Odaklı seçeneği ikinci sabit menü de örtmemeli.').toBe(true)
})

test('M12 ok tuşuyla seçilen seçenek görünür klavye odağını korur', async ({ page, browserName }) => {
  const key = browserName === 'webkit' ? 'Alt+Tab' : 'Tab'
  await openDemo(page)
  await page.goto('/#/karar/1/adim/00')
  const first = page.getByRole('radio', { name: 'Tüketici', exact: true })
  const next = page.getByRole('radio', { name: 'İşletme', exact: true })
  await page.keyboard.press(key)
  await first.focus()
  await page.keyboard.press('ArrowRight')
  await expect(next).toBeFocused()
  await expect(next).toBeChecked()
  expect(await next.evaluate((el) => el.matches(':focus-visible')), 'Ok tuşundan sonra odak görünür kalmalı.').toBe(true)
  await page.keyboard.press('ArrowLeft')
  await expect(first).toBeFocused()
  await expect(first).toBeChecked()
  expect(await first.evaluate((el) => el.matches(':focus-visible'))).toBe(true)
})
