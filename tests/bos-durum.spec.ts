import { expect, test, type Locator, type Page } from '@playwright/test'
import { ready } from './uyarlanir/audit'

/*
 * Boş, yükleme ve hata durumları. Kurallar docs/tasarim-sistemi.md belgesindedir.
 * Boş durum başlık, kısa açıklama ve tek eylem verir. Eylemin alanı en az 44 × 44 pikseldir.
 * Ekran hatası ve yükleme durumu yalın Türkçe yazar ve bir sonraki adımı verir.
 */

async function createEmptyPlan(page: Page) {
  await page.goto('/')
  await ready(page)
  await page.getByRole('button', { name: 'Yeni plan', exact: true }).click()
  await page.getByPlaceholder('Örneğin Mahalle kafesi').fill('Boş durum denemesi')
  await page.getByRole('button', { name: 'Oluştur' }).click()
  await expect(page).toHaveURL(/#\/baslangic/)
}

async function expectTarget(control: Locator) {
  await control.scrollIntoViewIfNeeded()
  const box = await control.boundingBox()
  expect(box, 'eylem görünür olmalı').not.toBeNull()
  expect(box!.width, 'eylem genişliği').toBeGreaterThanOrEqual(44)
  expect(box!.height, 'eylem yüksekliği').toBeGreaterThanOrEqual(44)
}

async function noHorizontalOverflow(page: Page) {
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))
  expect(r.sw).toBeLessThanOrEqual(r.iw + 1)
}

test('boş planda Geçmiş, Kanıtlar ve Çıktılar boş durumu nedenini ve eylemi gösterir', async ({ page }) => {
  await createEmptyPlan(page)

  await page.goto('/#/gecmis')
  await ready(page)
  const history = page.getByRole('main').locator('.empty-state')
  await expect(history.getByRole('heading', { name: 'Henüz kayıt yok' })).toBeVisible()
  await expect(history.locator('p')).toHaveText('İlk kontrolde kararı kaydedince burada görünür.')
  await expectTarget(history.getByRole('link', { name: "Kontrol 1'i aç" }))
  await noHorizontalOverflow(page)

  await page.goto('/#/kanitlar')
  await ready(page)
  const evidence = page.getByRole('main').locator('.empty-state')
  await expect(evidence.getByRole('heading', { name: 'Henüz kanıt yok' })).toBeVisible()
  const add = evidence.getByRole('button', { name: 'Kanıt ekle' })
  await expectTarget(add)
  /* Ekranda tek dolu ana düğme olur. Boş durumdaki düğme dolu değildir. */
  await expect(add).not.toHaveClass(/ant-btn-primary/)
  await add.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')

  await page.goto('/#/ciktilar')
  await ready(page)
  await expect(page.getByRole('main').locator('.empty-state').getByRole('heading', { name: 'Henüz yayımlanan belge yok' })).toBeVisible()
  await expectTarget(page.getByRole('button', { name: 'Markdown indir' }))
  await noHorizontalOverflow(page)
})

test('Ant Design boş görünümü ekranda görünmez', async ({ page }) => {
  await createEmptyPlan(page)
  for (const path of ['/#/ozet', '/#/isler', '/#/gecmis', '/#/varsayimlar', '/#/gostergeler', '/#/devir']) {
    await page.goto(path)
    await ready(page)
    await expect(page.locator('.ant-empty'), path).toHaveCount(0)
    await expect(page.locator('.empty-state').first(), path).toBeVisible()
  }
})

test('ekran yüklenemezse yalın açıklama ve dönüş yolu görünür', async ({ page }) => {
  await page.route(/\/src\/screens\/MethodsScreen\.tsx/, (route) => route.abort())
  await page.goto('/#/yontemler')
  const alert = page.getByRole('alert').filter({ hasText: 'Ekran açılamadı' })
  await expect(alert).toBeVisible()
  await expect(alert).toContainText('Planlarınız güvende.')
  await expectTarget(alert.getByRole('button', { name: 'Sayfayı yeniden yükle' }))
  const back = alert.getByRole('link', { name: 'Planlara dön' })
  await expectTarget(back)
  await back.click()
  await expect(page).toHaveURL(/#\/$/)
  await noHorizontalOverflow(page)
})

test('yükleme durumu görünür metinle okunur', async ({ page }) => {
  let release: () => void = () => undefined
  const gate = new Promise<void>((resolve) => { release = resolve })
  await page.route(/\/src\/screens\/MethodsScreen\.tsx/, async (route) => {
    await gate
    await route.continue()
  })
  /* WebKit, bekleyen modül isteği bitmeden "load" olayını vermez. Gezinme bu yüzden ilk yanıtta biter. */
  await page.goto('/#/yontemler', { waitUntil: 'commit' })
  const loading = page.getByRole('status').filter({ hasText: 'Sayfa yükleniyor.' })
  await expect(loading).toBeVisible()
  await expect(loading.locator('.loading-text')).toBeVisible()
  release()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(loading).toHaveCount(0)
})

test('grafik dosyası yüklenemezse veri tablosu açılır', async ({ page }) => {
  await createEmptyPlan(page)
  await page.route(/\/src\/charts\/EChart\.tsx/, (route) => route.abort())
  await page.goto('/#/kanitlar')
  await ready(page)
  const frame = page.locator('.chart-frame').first()
  await frame.scrollIntoViewIfNeeded()
  await expect(frame.getByText('Grafik yüklenemedi. Verileri tabloda görebilirsiniz.')).toBeVisible()
  await frame.getByRole('button', { name: 'Tabloyu göster' }).click()
  await expect(frame.locator('table.chart-data-table')).toBeVisible()
})
