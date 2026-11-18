import { expect, test, type Page } from '@playwright/test'

/**
 * İki örnek plan. Ayakkabı örneği birincil, kafe örneği ikincildir.
 * Ayakkabı örneği gerçek bir şirkete dayanır. Verilmeyen para bilgisi boş kalır.
 */

const SHOE = 'Ayakkabı örneğini aç'
const CAFE = 'Kafe örneğini aç'
const SUGGESTED = 'Önerilen rol, henüz yok.'

async function openExample(page: Page, label: string) {
  await page.goto('/')
  /* Yük altında ilk tıklama kaçabilir. Yardımcı, adres değişene kadar yeniden dener. */
  await expect(async () => {
    if (!/#\/ozet/.test(page.url())) await page.getByRole('button', { name: label, exact: true }).click({ timeout: 2000 })
    await expect(page).toHaveURL(/#\/ozet/, { timeout: 2000 })
  }).toPass()
}

/** Sayfadaki bütün yazı alanlarının değerleri. Tablo hücreleri giriş alanıdır. */
async function fieldValues(page: Page): Promise<string[]> {
  return page.locator('input, textarea').evaluateAll((els) => els.map((e) => (e as HTMLInputElement).value))
}

test('boş durum iki örneği sunar, ayakkabı önce gelir', async ({ page }) => {
  await page.goto('/')
  const shoe = page.getByRole('button', { name: SHOE, exact: true })
  const cafe = page.getByRole('button', { name: CAFE, exact: true })
  await expect(shoe).toBeVisible()
  await expect(cafe).toBeVisible()
  const order = await page.locator('main').getByRole('button').evaluateAll((els, names) => names.map((n) => els.findIndex((e) => e.textContent?.trim() === n)), [SHOE, CAFE])
  expect(order[0]).toBeGreaterThanOrEqual(0)
  expect(order[0]).toBeLessThan(order[1])
  for (const button of [shoe, cafe]) {
    const box = await button.boundingBox()
    expect(box?.height ?? 0, 'Dokunma hedefi en az 44 piksel olmalı.').toBeGreaterThanOrEqual(44)
  }
})

test('ayakkabı örneği açılır, adı ve ekip yapısı görünür', async ({ page }) => {
  await openExample(page, SHOE)
  await expect(page.getByRole('heading', { level: 1, name: 'Örnek: Ayakkabı şirketi' })).toBeVisible()
  await page.goto('/#/karar/3/adim/12')
  await expect(page.getByRole('heading', { name: /Adım 12/ })).toBeVisible()
  await expect.poll(async () => (await fieldValues(page)).join('\n')).toContain('İhracat ekibi. 1 lider ve 6 kişi. Yunanistan, ABD ve toptan ihracat.')
  const values = (await fieldValues(page)).join('\n')
  for (const part of ['Üretim atölyesi 1. Yaklaşık 30 kişi.', 'Üretim atölyesi 2. Yaklaşık 70 kişi.', 'Üretim atölyesi 3. Yaklaşık 90 kişi.', 'Fason takip ekibi', 'Dijital baskı ekibi', 'Ayakkabı tasarımcısı', 'Mutfak sorumlusu. 1 kişi.', `İş güvenliği uzmanı. ${SUGGESTED}`, `İşyeri hekimi. ${SUGGESTED}`]) {
    expect(values, part).toContain(part)
  }
})

test('ayakkabı örneğinde bilinmeyen para bilgisi eksik görünür', async ({ page }) => {
  await openExample(page, SHOE)
  await page.goto('/#/karar/1/adim/02')
  await expect(page.getByRole('heading', { name: /Adım 02/ })).toBeVisible()
  for (const label of ['Aylık zorunlu gider', 'Elinizdeki para', 'Bu plana ayrılan en çok para']) {
    await expect(page.getByRole('spinbutton', { name: new RegExp(`^${label} \\(zorunlu\\)`) }), `${label} boş kalmalı.`).toHaveValue('')
  }
  await page.goto('/#/karar/1/kapi')
  const row = page.locator('tr').filter({ hasText: 'Durdurma kuralları, kasa süresi ve üç sınır yazıldı.' })
  await expect(row.getByText('Karşılanmadı').or(row.getByLabel('Karşılanmadı')).first()).toBeVisible()
})

test('kafe örneği ikinci örnek olarak açılmayı sürdürür', async ({ page }) => {
  await openExample(page, CAFE)
  await expect(page.getByRole('heading', { level: 1, name: 'Örnek: Mahalle kafesi' })).toBeVisible()
})

test('iki örnek yan yana durur, menüden ikincisi açılır', async ({ page }) => {
  await openExample(page, SHOE)
  await page.goto('/#/')
  await page.getByRole('button', { name: 'Daha fazla', exact: true }).click()
  await page.getByRole('menuitem', { name: CAFE }).click()
  await expect(page).toHaveURL(/#\/ozet/)
  await page.goto('/#/')
  await expect(page.getByRole('heading', { name: 'Örnek: Ayakkabı şirketi' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Örnek: Mahalle kafesi' })).toBeVisible()
  await expect(page.getByText('2 tanesi örnek plan.')).toBeVisible()
})
