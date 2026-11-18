import { expect, test, type Page } from '@playwright/test'

/**
 * Asıl engel, başarı koşulları, yol bağları, serbest bütçe ve iş türüne özgü sorular.
 * Kural docs/codex-onerileri-uygulama-notu.md dosyasındadır.
 * Bu kayıtlar isteğe bağlıdır. Hiçbiri hazırlık kontrolünün ölçütü değildir.
 */

const STORAGE_KEY = 'decisionactplan-v1'

async function openDemo(page: Page) {
  await page.goto('/')
  /* Yük altında ilk tıklama kaçabilir. Yardımcı, adres değişene kadar yeniden dener. */
  await expect(async () => {
    if (!/#\/ozet/.test(page.url())) await page.getByText('Kafe örneğini aç').first().click({ timeout: 2000 })
    await expect(page).toHaveURL(/#\/ozet/, { timeout: 2000 })
  }).toPass()
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

const stored = (page: Page, pick: string) =>
  page.evaluate(([key, body]) => new Function('plan', `return ${body}`)(JSON.parse(localStorage.getItem(key) ?? '{}').state.plans[JSON.parse(localStorage.getItem(key) ?? '{}').state.currentId]), [STORAGE_KEY, pick])

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

/** İsteğe bağlı bölümler ayrı sekmededir. Yardımcı işlev, sekme hazır olunca seçer. */
async function optionalTab(page: Page) {
  const tab = page.locator('.form-tabs .ant-segmented-item', { hasText: 'İsteğe bağlı bölümler' })
  await expect(tab).toBeVisible()
  await tab.click()
}

/** Boş isteğe bağlı bölüm kapalı gelir. Kapalıysa açar. */
async function expand(page: Page, title: string) {
  const open = page.getByRole('button', { name: `${title} bölümünü aç` })
  if (await open.count()) await open.click()
}

const section = (page: Page, title: string) => page.locator('.form-section').filter({ has: page.locator('.ant-card-head-title', { hasText: title }) })

test('teslim raporu asıl engeli ve başarı koşullarını karar sorusunun altında gösterir', async ({ page }) => {
  await openDemo(page)
  const before = await stored(page, 'plan.revision')
  await page.goto('/#/devir')
  const lead = page.locator('.devir-lead')
  await expect(lead.locator('.devir-crux-text')).toHaveText('Aylık kart ilgisi, gideri karşılayan günlük satışa dönüşecek mi?')
  await expect(lead.locator('.devir-crux')).toContainText('7 kişi aylık kahve kartına ödeme yaptı')
  await expect(lead.locator('.devir-crux')).toContainText('Üç kişi fiyatı yüksek buldu.')
  const conditions = lead.locator('.devir-condition')
  await expect(conditions).toHaveCount(3)
  await expect(conditions.nth(0)).toContainText('Sınanmadı')
  await expect(conditions.nth(0)).toContainText('Bilinmiyor')
  await expect(conditions.nth(1)).toContainText('Bulgular çelişiyor')
  await expect(conditions.nth(2)).toContainText('Destek var')
  // İlk soru telefonda da okunur: karar sorusu engelden önce gelir.
  const order = await lead.evaluate((el) => {
    const q = el.querySelector('.devir-question')!.getBoundingClientRect().top
    const c = el.querySelector('.devir-crux')!.getBoundingClientRect().top
    return q < c
  })
  expect(order).toBe(true)
  await expect(page.locator('.devir-block').filter({ hasText: 'Bu yollar neden çalışabilir?' })).toContainText('Çelişiyor')
  await expect(page.locator('main')).toContainText('Serbest bütçe')
  await designRules(page, 'main', 'devir asıl engel')
  // Raporu okumak karar kaydını değiştirmez.
  expect(await stored(page, 'plan.revision')).toBe(before)
  expect(await stored(page, 'plan.transitions.length')).toBe(0)
})

test('bağlı kanıt silinince rapor eksik bağlantıyı bildirir', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `plan.evidence = plan.evidence.filter((e) => e.id !== 'kanit-4')`)
  await page.goto('/#/devir')
  await expect(page.locator('.devir-crux')).toContainText('1 bağlı kanıt silinmiş.')
  await expect(page.locator('.devir-condition').nth(1)).toContainText('Sınanmadı')
})

test('Adım 18 asıl engeli ve koşulları isteğe bağlı sorar, kanıtı defterden seçtirir', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/5/adim/18')
  // İsteğe bağlı bölümler ilk sekmede görünmez.
  await expect(section(page, 'Asıl engel')).toHaveCount(0)
  await optionalTab(page)
  for (const title of ['Bu yol neden çalışabilir?', 'Asıl engel', 'Başarı neye bağlı?']) await expect(section(page, title)).toBeVisible()
  await expect(section(page, 'Başarı neye bağlı?').locator('.calc-box')).toContainText('3 koşuldan 2 tanesi sınandı')
  await section(page, 'Asıl engel').scrollIntoViewIfNeeded()
  await designRules(page, '.form-section', 'adım 18 asıl engel')

  // Karşı bulgu klavyeyle defterden seçilir. Kanıt yeniden yazılmaz.
  const counter = section(page, 'Asıl engel').locator('.ant-form-item').filter({ hasText: 'Karşı bulgu' }).locator('.ant-select input').first()
  await counter.focus()
  await page.keyboard.type('Mahalle grubunda')
  await page.keyboard.press('Enter')
  await expect.poll(() => stored(page, `plan.steps['18'].values.cruxCounter`)).toEqual(['kanit-3'])

  // Bu bölümler boşken de adım tamamlanır.
  await patchPlan(page, `for (const k of ['crux','cruxWhy','cruxAlt','cruxSplit','cruxPaths','cruxEvidence','cruxCounter','successConditions','pathLinks']) delete plan.steps['18'].values[k]`)
  await optionalTab(page)
  // Boş kalan isteğe bağlı bölüm kapalı gelir.
  await expect(section(page, 'Başarı neye bağlı?').locator('.calc-box')).toHaveCount(0)
  await expand(page, 'Başarı neye bağlı?')
  await expect(section(page, 'Başarı neye bağlı?').locator('.calc-box')).toContainText('Bir koşul yazınca durumu burada görünür.')
  await page.getByRole('button', { name: 'Adımı tamamla' }).click()
  await expect(page.locator('.ant-message')).toContainText('Adım tamamlandı.')
})

test('serbest bütçe harcananı ve ödenmemiş taahhüdü düşer, bilinmeyen taahhütte tutar yazmaz', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/5/adim/16')
  const card = section(page, 'Serbest bütçe')
  const box = card.locator('.calc-box')
  await expect(box).toContainText('100.000')
  await expect(box).toContainText('Ödenmemiş taahhüt')
  await card.scrollIntoViewIfNeeded()
  await designRules(page, '.form-section', 'serbest bütçe')
  await card.getByText('Bilmiyorum', { exact: true }).click()
  await expect(box).toContainText('Bilinmiyor')
  await expect(box).toContainText('kesin tutar yazılmaz')
  await expect(card.getByText('Ödenmemiş taahhütler')).toHaveCount(0)
})

test('iş türüne özgü sorular yalnız ilgili profilde açılır', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/4/adim/15')
  await expect(section(page, 'Pazar yeri eşleşmesi')).toHaveCount(0)
  await expect(section(page, 'Fayda')).toHaveCount(0)
  await page.goto('/#/karar/3/adim/12')
  await optionalTab(page)
  await expect(section(page, 'Darboğaz')).toBeVisible()
  await expect(section(page, 'Grup katkısı')).toHaveCount(0)

  await patchPlan(page, `plan.profile.group = true; plan.profile.customer = 'pazarYeri'; plan.steps['15'].values.validRequests = 0; plan.steps['15'].values.matchedRequests = 0`)
  await optionalTab(page)
  await expect(section(page, 'Grup katkısı')).toBeVisible()
  await page.goto('/#/karar/4/adim/15')
  const market = section(page, 'Pazar yeri eşleşmesi')
  await expect(market.locator('.calc-box')).toContainText('Hesaplanamaz')
  await expect(market.locator('.calc-box')).toContainText('Geçerli talep sayısı sıfır.')
  await market.scrollIntoViewIfNeeded()
  await designRules(page, '.form-section', 'pazar yeri eşleşmesi')

  await patchPlan(page, `plan.steps['15'].values.validRequests = 20; plan.steps['15'].values.matchedRequests = 8`)
  await expect(section(page, 'Pazar yeri eşleşmesi').locator('.calc-box')).toContainText('Yüzde 40')
})
