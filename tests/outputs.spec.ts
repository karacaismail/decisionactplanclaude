import { expect, test, type Page } from '@playwright/test'

async function noHorizontalOverflow(page: Page, label = '') {
  const r = await page.evaluate(() => {
    const wide = [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1).slice(0, 5).map((e) => e.tagName + '.' + (e as HTMLElement).className.toString().slice(0, 60))
    return { sw: document.documentElement.scrollWidth, iw: window.innerWidth, wide }
  })
  expect(r.sw, `Sayfa yatay taşmamalı ${label} ${r.wide.join(' | ')}`).toBeLessThanOrEqual(r.iw + 1)
}

async function createPlan(page: Page, name = 'Deneme planı') {
  await page.goto('/')
  await page.getByRole('button', { name: 'Yeni plan' }).first().click()
  await page.getByPlaceholder('Örneğin Mahalle kafesi').fill(name)
  await page.getByRole('button', { name: 'Oluştur' }).click()
  await expect(page).toHaveURL(/#\/baslangic/)
}

test('çıktılar ekranında sürüm seçici görünür ve belgeler arasında geçiş yapılır', async ({ page }) => {
  await createPlan(page)
  await page.goto('/#/ciktilar')
  const picker = page.getByLabel('Sürüm', { exact: true })
  await expect(picker).toBeVisible()
  await expect(page.getByText('Güncel taslak', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Yönetici raporu' })).toBeVisible()
  await noHorizontalOverflow(page, 'yönetici raporu')

  await page.getByText('Girişimci aksiyon planı', { exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Girişimci aksiyon planı' })).toBeVisible()
  await noHorizontalOverflow(page, 'aksiyon planı')
})

test('"Bu sürümü sabitle" yeni sürüm kaydeder ve seçer', async ({ page }) => {
  await createPlan(page)
  await page.goto('/#/ciktilar')
  await page.getByLabel('Sürüm adı').fill('Deneme sürümü')
  await page.getByRole('button', { name: 'Bu sürümü sabitle' }).click()
  // Yeni sürüm seçicide seçili görünür. Sürüm görüntülenirken sabitleme kapanır.
  await expect(page.getByText(/^Sürüm 1: Deneme sürümü/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Bu sürümü sabitle' })).toBeDisabled()
  await expect(page.getByText(/Sürüm kaydı:/)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Yönetici raporu' })).toBeVisible()
  await noHorizontalOverflow(page, 'sabitlenen sürüm')

  // Güncel taslağa dönüş sabitlemeyi yeniden açar. Seçim klavyeyle yapılır: liste açılır, bir üst seçenek, Enter.
  const picker = page.getByLabel('Sürüm', { exact: true })
  await picker.click()
  // antd'nin role="option" düğümleri gizli erişilebilirlik listesidir; görünen satır .ant-select-item-option sınıfındadır.
  await expect(page.locator('.ant-select-item-option', { hasText: 'Güncel taslak' })).toBeVisible()
  await picker.press('ArrowUp')
  await picker.press('Enter')
  await expect(page.locator('.ant-select-content', { hasText: 'Güncel taslak' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Bu sürümü sabitle' })).toBeEnabled()
})

test('yazdırma görünümünde menü ve düğmeler gizlenir, rapor kalır', async ({ page }) => {
  await createPlan(page)
  await page.goto('/#/ciktilar')
  await expect(page.getByRole('heading', { name: 'Çıktılar' })).toBeVisible()
  await page.emulateMedia({ media: 'print' })
  await expect(page.getByRole('heading', { name: 'Çıktılar' })).toBeHidden()
  await expect(page.getByRole('button', { name: 'Markdown indir' })).toBeHidden()
  await expect(page.getByRole('heading', { name: 'Yönetici raporu' })).toBeVisible()
  const font = await page.evaluate(() => getComputedStyle(document.body).fontFamily)
  expect(font).toContain('Outfit')
  await page.emulateMedia({ media: 'screen' })
})
