import { expect, test, type Page } from '@playwright/test'

async function noHorizontalOverflow(page: Page) {
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))
  expect(r.sw, 'Sayfa yatay taşmamalı').toBeLessThanOrEqual(r.iw + 1)
}

async function createPlan(page: Page, name = 'Deneme planı') {
  await page.goto('/')
  await page.getByRole('button', { name: 'Yeni plan' }).click()
  await page.getByPlaceholder('Örneğin Mahalle kafesi').fill(name)
  await page.getByRole('button', { name: 'Oluştur' }).click()
  await expect(page).toHaveURL(/#\/baslangic/)
}

test('plan oluşturulur ve giriş ekranı taşmaz', async ({ page }) => {
  await createPlan(page)
  await expect(page.getByRole('heading', { name: 'Bugün nereden başlayacaksınız?' })).toBeVisible()
  await noHorizontalOverflow(page)
})

test('Adım 00 doldurulur, tamamlanır ve Adım 01 açılır', async ({ page }) => {
  await createPlan(page)
  await page.goto('/#/karar/1/adim/00')
  for (const v of ['tuketici', 'hizmet', 'dusuk', 'tekKurucu', 'kendi', 'varOlan', 'sifirdan']) {
    await page.getByRole('radio', { name: v }).check({ force: true })
  }
  await noHorizontalOverflow(page)
  await page.getByRole('button', { name: 'Adımı tamamla' }).click()
  await expect(page).toHaveURL(/#\/karar\/1\/adim\/01/)
  await expect(page.getByRole('heading', { name: /Adım 01/ })).toBeVisible()
  await noHorizontalOverflow(page)
})

test('kapı ekranı öneri gösterir ve karar kaydeder', async ({ page }) => {
  await createPlan(page)
  await page.goto('/#/karar/1/kapi')
  await expect(page.getByText('Sistemin önerisi')).toBeVisible()
  const save = page.getByRole('button', { name: 'Kararı kaydet' })
  await expect(save).toBeDisabled()
  await page.getByLabel('Gerekçe', { exact: false }).fill('Deneme gerekçesi.')
  await page.getByLabel('Karar sahibi').fill('Kurucu')
  await expect(save).toBeEnabled()
  await save.click()
  await page.goto('/#/gecmis')
  await expect(page.getByText('Kapı 1')).toBeVisible()
  await noHorizontalOverflow(page)
})

test('çevreleyen odak halkası yok, klavye odağı görünür', async ({ page }) => {
  await createPlan(page)
  await page.goto('/#/ozet')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  const result = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    if (!el || el === document.body) return { mode: document.documentElement.getAttribute('data-focus-mode'), outline: 'yok', hasMarker: false }
    const cs = getComputedStyle(el)
    const before = getComputedStyle(el, '::before')
    return { mode: document.documentElement.getAttribute('data-focus-mode'), outline: cs.outlineStyle, shadow: cs.boxShadow, hasMarker: before.width === '3px' }
  })
  expect(result.mode).toBe('keyboard')
  expect(result.outline === 'none' || result.outline === 'yok').toBeTruthy()
  expect(result.hasMarker).toBeTruthy()
})

test('çıktılar ekranı iki belgeyi üretir', async ({ page }) => {
  await createPlan(page)
  await page.goto('/#/ciktilar')
  await expect(page.getByRole('heading', { name: 'Yönetici raporu' })).toBeVisible()
  await page.getByText('Girişimci aksiyon planı', { exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Girişimci aksiyon planı' })).toBeVisible()
  await noHorizontalOverflow(page)
})
