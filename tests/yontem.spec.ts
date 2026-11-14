import { expect, test, type Page } from '@playwright/test'

/**
 * Yöntem yardımı: adımdaki yöntem etiketinden ve "Karar Kitabı" ekranından açılan panel.
 * Kural docs/karar-kitabi-firsatlari-plani.md dosyasının Faz D bölümündedir.
 * Yardım verisi ayrı dosyadadır. Tarayıcı dosyayı yalnız panel açılınca indirir.
 */

async function openDemo(page: Page) {
  await page.goto('/')
  await page.getByText('Örnek planı aç').first().click()
  await expect(page).toHaveURL(/#\/ozet/)
}

async function designRules(page: Page, scope: string, label: string) {
  const r = await page.evaluate((sel) => {
    const small = [...document.querySelectorAll(`${sel} *`)]
      .filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim()))
      .filter((e) => (e as HTMLElement).offsetParent !== null && Number.parseFloat(getComputedStyle(e).fontSize) < 14)
      .map((e) => `${e.tagName}.${(e as HTMLElement).className} ${getComputedStyle(e).fontSize}`)
    return { sw: document.documentElement.scrollWidth, iw: window.innerWidth, small }
  }, scope)
  expect(r.sw, `Sayfa yatay taşmamalı: ${label}`).toBeLessThanOrEqual(r.iw + 1)
  expect(r.small, `Yazı en az 14 piksel olmalı: ${label}`).toEqual([])
}

/** Yöntem etiketini bulur. Telefonda etiketler kapalı bir bölümün içindedir, önce bölüm açılır. */
async function chipOf(page: Page, name: string) {
  const chip = page.locator('.model-chip:visible', { hasText: name }).first()
  if ((await chip.count()) === 0) await page.getByRole('button', { name: /Karar Kitabı yöntemleri/ }).or(page.locator('.ant-collapse-header', { hasText: 'Karar Kitabı yöntemleri' })).first().click()
  await chip.scrollIntoViewIfNeeded()
  return chip
}

test('adımdaki yöntem etiketi yardımı gösterir ve veriyi yalnız panel açılınca indirir', async ({ page }) => {
  const requested: string[] = []
  page.on('request', (r) => requested.push(r.url()))
  const helpRequests = () => requested.filter((u) => u.includes('models-howto'))

  await openDemo(page)
  await page.goto('/#/karar/3/adim/12')
  await expect(page.locator('.form-section').first()).toBeVisible()
  const chip = await chipOf(page, 'VRIO Analizi')
  await expect(chip).toBeVisible()
  expect(helpRequests(), 'panel açılmadan yardım dosyası inmemeli').toEqual([])

  await chip.click()
  const drawer = page.locator('.ant-drawer').filter({ hasText: 'VRIO Analizi' })
  await expect(drawer.getByRole('heading', { name: 'Nasıl uygulanır' })).toBeVisible()
  expect(helpRequests().length, 'panel açılınca yardım dosyası inmeli').toBeGreaterThan(0)
  expect(await drawer.locator('.howto-step').count()).toBeGreaterThanOrEqual(3)
  await expect(drawer.locator('.note').filter({ hasText: 'Dikkat' })).toBeVisible()
  await expect(drawer.getByRole('link', { name: "Karar Kitabı'nda aç" })).toBeVisible()
  // Metin "siz" diye yazılır. Uzun çizgi yoktur.
  const text = await drawer.innerText()
  expect(text).not.toMatch(/—/)
  expect(text).not.toMatch(/\bsenin\b|\bsana\b/)
  await designRules(page, '.ant-drawer', 'yöntem paneli')

  await page.keyboard.press('Escape')
  await expect(drawer).toBeHidden()
})

test('yöntem paneli klavyeyle açılır ve kapanır', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/5/adim/18')
  await expect(page.locator('.form-section').first()).toBeVisible()
  const chip = await chipOf(page, 'SWOT Analizi')
  await chip.focus()
  await page.keyboard.press('Enter')
  const drawer = page.locator('.ant-drawer').filter({ hasText: 'SWOT Analizi' })
  await expect(drawer.getByRole('heading', { name: 'Nasıl uygulanır' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(drawer).toBeHidden()
})

test('"Karar Kitabı" ekranında yardımı olan yöntem aynı paneli açar', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/yontemler')
  await page.locator('#yontem-ara').fill('VRIO')
  const card = page.locator('.method-card').filter({ hasText: 'VRIO Analizi' })
  await expect(card).toHaveCount(1)
  await designRules(page, '.method-card', 'yöntem kartı')
  await card.getByRole('button', { name: 'Nasıl uygulanır' }).click()
  const drawer = page.locator('.ant-drawer').filter({ hasText: 'VRIO Analizi' })
  await expect(drawer.locator('.howto-step').first()).toBeVisible()
  await page.keyboard.press('Escape')

  // Yardımı olmayan yöntem bugünkü gibi görünür.
  await page.locator('#yontem-ara').fill('Eisenhower')
  const plain = page.locator('.method-card').filter({ hasText: 'Eisenhower Matrisi' })
  await expect(plain).toHaveCount(1)
  await expect(plain.getByRole('button', { name: 'Nasıl uygulanır' })).toHaveCount(0)
})
