import { expect, test, type Page } from '@playwright/test'

/**
 * Veri bütünlüğü kuralları. Fikirlerin kaynağı Codex'in paralel uygulamasıdır.
 * Kural docs/codex-uygulamasi-karsilastirma-raporu.md dosyasındadır.
 * Aynı kişi iki kez sayılmaz. Aynı görünen yol iki yol sayılmaz. Birbirini tutmayan sayıyla adım tamamlanmaz.
 */

const STORAGE_KEY = 'decisionactplan-v1'

async function openDemo(page: Page) {
  await page.goto('/')
  await page.getByText('Örnek planı aç').first().click()
  await expect(page).toHaveURL(/#\/ozet/)
}

async function patchPlan(page: Page, patch: string) {
  await page.evaluate(
    ([key, body]) => {
      const raw = JSON.parse(localStorage.getItem(key) ?? '{}')
      new Function('plan', body)(raw.state.plans[raw.state.currentId])
      localStorage.setItem(key, JSON.stringify(raw))
    },
    [STORAGE_KEY, patch],
  )
  await page.reload()
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

const calc = (page: Page, title: string) => page.locator('.calc-box').filter({ hasText: title })

test('birbirini tutmayan sayılarla Adım 15 tamamlanmaz', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `plan.steps['15'].values.reached = 5; plan.steps['15'].values.tried = 9`)
  await page.goto('/#/karar/4/adim/15')
  await page.getByRole('button', { name: 'Adımı tamamla' }).click()
  await expect(page.locator('.ant-message')).toContainText('Deneyen kişi sayısı ulaşılan kişi sayısını geçemez.')
  await expect(page).toHaveURL(/#\/karar\/4\/adim\/15/)
})

test('aynı kişi iki kez yazılınca kişi denetimi uyarır', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/4/adim/15')
  const box = calc(page, 'Kişi denetimi')
  await expect(box).toContainText('Tekrar eden kişi yok.')
  await patchPlan(page, `plan.steps['15'].values.offers[1].person = '  AYŞE, öğretmen '`)
  await expect(calc(page, 'Kişi denetimi')).toContainText('1 kişi birden çok kez yazılmış: Ayşe, öğretmen.')
  await calc(page, 'Kişi denetimi').scrollIntoViewIfNeeded()
  await designRules(page, '.calc-box', 'kişi denetimi')
  await page.goto('/#/karar/2/adim/06')
  await expect(calc(page, 'Kişi denetimi')).toContainText('farklı kişi')
})

test('aynı görünen yollar uyarı verir ve rapora yazılır', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/5/adim/18')
  await expect(calc(page, 'Yollar ne kadar farklı?')).toContainText('4 farklı yol')
  await patchPlan(page, `const p = plan.steps['18'].values.paths; p[2].where = p[1].where; p[2].how = p[1].how; p[2].revenue = p[1].revenue`)
  const box = calc(page, 'Yollar ne kadar farklı?')
  await expect(box).toContainText('"Durakta kahve arabası" ve "Ön siparişle aylık kart" aynı görünüyor.')
  await box.scrollIntoViewIfNeeded()
  await designRules(page, '.calc-box', 'yol denetimi')
  await page.goto('/#/devir')
  await expect(page.locator('#devir-yollar').getByRole('alert').filter({ hasText: 'Yol denetimi' })).toContainText('aynı görünüyor')
})

test('geçiş kapısı talep kanıtındaki karşı bulguyu uyarı olarak gösterir', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/gecis')
  await expect(page.locator('main')).toContainText('Talep kanıtında karşı bulgu var: Üç kişi fiyatı yüksek buldu.')
})

test('ayrı görüş Adım 17\'de yazılır ve devir raporunda görünür', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/5/adim/17')
  const card = page.locator('.form-section').filter({ has: page.locator('.ant-card-head-title', { hasText: 'Ayrı görüş' }) })
  await expect(card.getByText('Karar sahibi ne dedi?', { exact: true }).first()).toBeVisible()
  await page.goto('/#/devir')
  const block = page.locator('.devir-dissents')
  await expect(block).toContainText('Kart alan 7 kişinin 5\'i arkadaşımız.')
  await expect(block.locator('.ant-tag')).toHaveText('Ayrı görüş sürüyor')
  await block.scrollIntoViewIfNeeded()
  await designRules(page, '.devir-dissents', 'ayrı görüşler')
})

test('işletmeye satışta alımı durdurabilen kişi sorulur', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/2/adim/08')
  await expect(page.getByText('Alımı kim durdurabilir?', { exact: true })).toHaveCount(0)
  await patchPlan(page, `plan.profile.customer = 'isletme'`)
  await expect(page.getByText('Alımı kim durdurabilir?', { exact: true })).toBeVisible()
})
