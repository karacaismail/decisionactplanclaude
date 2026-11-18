import { expect, test, type Page } from '@playwright/test'

/*
 * Son eklenen altı sayfa "Yeni" etiketi taşır.
 * Etiket menüde sayfa adının yanında ve sayfa başlığının yanında görünür.
 * Etiket 18 Aralık 2026 Cuma günü bitince kaybolur.
 */

const NEW_PAGES = [
  { route: '/#/gecis', menu: 'Geçiş kapısı' },
  { route: '/#/devir', menu: 'Devir raporu' },
  { route: '/#/temel', menu: 'Temel taşları' },
  { route: '/#/varsayimlar', menu: 'Varsayımlar' },
  { route: '/#/strateji', menu: 'Strateji oluşturma' },
  { route: '/#/uygulama', menu: 'Uygulama özeti' },
]

async function openDemo(page: Page) {
  await page.goto('/')
  await page.getByText('Kafe örneğini aç', { exact: true }).first().click()
  await expect(page).toHaveURL(/#\/ozet/)
}

test.describe('etiket süresi içinde', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 10, 20, 10, 0))
  })

  for (const { route, menu } of NEW_PAGES) {
    test(`${menu}: sayfa başlığında "Yeni" etiketi görünür`, async ({ page }) => {
      await openDemo(page)
      await page.goto(route)
      const header = page.locator('main .page-header').first()
      await expect(header).toBeVisible()
      const pill = header.locator('.pill-new')
      await expect(pill).toHaveText('Yeni')
      await expect(pill).toBeVisible()
      // Başlığın adı değişmez. Etiket başlığın dışında durur.
      await expect(page.getByRole('heading', { level: 1 })).not.toContainText('Yeni')
      const style = await pill.evaluate((el) => {
        const cs = getComputedStyle(el)
        return { font: parseFloat(cs.fontSize), family: cs.fontFamily, borderLeft: parseFloat(cs.borderLeftWidth), outline: cs.outlineStyle }
      })
      expect(style.font).toBeGreaterThanOrEqual(14)
      expect(style.family).toMatch(/^"?Outfit/)
      expect(style.borderLeft).toBe(0)
      expect(style.outline).toBe('none')
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }

  test('menüde altı sayfanın yanında "Yeni" etiketi görünür, diğerlerinde görünmez', async ({ page }) => {
    await openDemo(page)
    await page.goto('/#/gecis')
    // Menü telefonda çekmecede, geniş ekranda yan panelde ve üst şeritte durur.
    const drawerButton = page.locator('.bottom-nav').getByRole('button', { name: 'Menü' })
    if (await drawerButton.isVisible()) await drawerButton.click()
    const scope = (await drawerButton.isVisible()) ? page.locator('.shell-drawer') : page.locator('body')
    for (const { menu } of NEW_PAGES) {
      const link = scope.getByRole('link', { name: new RegExp(`${menu}.*yeni`, 'i') }).first()
      await expect(link, menu).toBeAttached()
      await expect(link.locator('.pill-new'), menu).toHaveText('Yeni')
    }
    for (const other of ['Kanıtlar', 'İşler', 'Göstergeler', 'Geçmiş']) {
      const link = scope.getByRole('link', { name: other }).first()
      await expect(link.locator('.pill-new'), other).toHaveCount(0)
    }
  })

  test('yeni olmayan sayfanın başlığında etiket yoktur', async ({ page }) => {
    await openDemo(page)
    await page.goto('/#/kanitlar')
    await expect(page.locator('main .page-header').first()).toBeVisible()
    await expect(page.locator('main .page-header .pill-new')).toHaveCount(0)
  })
})

test('18 Aralık 2026 Cuma günü bitince etiket kaybolur', async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 11, 19, 9, 0))
  await openDemo(page)
  await page.goto('/#/gecis')
  await expect(page.locator('main .page-header').first()).toBeVisible()
  await expect(page.locator('.pill-new')).toHaveCount(0)
})
