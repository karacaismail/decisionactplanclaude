import { expect, test, type Page } from '@playwright/test'

async function openDemo(page: Page) {
  await page.goto('/')
  await page.getByText('Kafe örneğini aç').first().click()
  await expect(page).toHaveURL(/#\/(ozet|gecis)/)
}
async function noOverflow(page: Page, label: string) {
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))
  expect(r.sw, `${label}: belge taşmamalı`).toBeLessThanOrEqual(r.iw)
}

test('Adım 09 gerçekçi pazarı kendisi hesaplar', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/3/adim/09')
  const box = page.locator('.calc-box').first()
  await expect(box).toBeVisible()
  await expect(box.locator('.calc-value')).toContainText('müşteri')
  await expect(box).toContainText('Küçük olan sayı gerçekçi pazarınızdır')
  await noOverflow(page, 'adım 09')
})

test('Adım 16 başabaş sayısını hesaplar ve alana yazar', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/5/adim/16')
  const box = page.locator('.calc-box').filter({ hasText: 'Başabaş hesabı' })
  await expect(box).toBeVisible()
  await expect(box.locator('.calc-value')).toContainText('sipariş')
  const apply = box.getByRole('button', { name: /alanına yaz/ })
  if (await apply.count()) {
    await apply.click()
    await expect(box).toContainText('Bu sonuç alanda yazılı.')
  } else {
    await expect(box).toContainText('Bu sonuç alanda yazılı.')
  }
  await noOverflow(page, 'adım 16')
})

test('çürüyen kritik varsayım geçiş kapısını "Henüz hazır değil" yapar', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/gecis')
  await expect(page.getByText('Yazılımın önerisi')).toBeVisible()
  // Örnek plan verisini doğrudan değiştir: ilk varsayım kritik ve çürümüş olsun.
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('decisionactplan-v1') ?? '{}')
    const st = raw.state
    const plan = st.plans[st.currentId]
    const list = plan.steps['10'].values.assumptions
    list[0] = { ...list[0], impact: 5, status: 'curudu', resultNote: '' }
    localStorage.setItem('decisionactplan-v1', JSON.stringify(raw))
  })
  await page.reload()
  await page.goto('/#/gecis')
  await expect(page.getByText('Varsayım uyarısı')).toBeVisible()
  await expect(page.locator('.suggestion-line')).toContainText('Henüz hazır değil')
})
