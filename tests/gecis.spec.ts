import { expect, test, type Page } from '@playwright/test'

/**
 * Geçiş kapısı (/gecis) akışı. Yazılım öneri üretir, karar sahibi kaydeder.
 * Kabul ölçütleri docs/uygulama-plani-on-yuz.md Adım 3 ve 6.5'tedir.
 */

async function noHorizontalOverflow(page: Page, label = '') {
  const r = await page.evaluate(() => {
    const wide = [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1).slice(0, 5).map((e) => e.tagName + '.' + (e as HTMLElement).className.toString().slice(0, 60))
    return { sw: document.documentElement.scrollWidth, iw: window.innerWidth, wide }
  })
  expect(r.sw, `Sayfa yatay taşmamalı ${label} ${r.wide.join(' | ')}`).toBeLessThanOrEqual(r.iw + 1)
}

async function openDemo(page: Page) {
  await page.goto('/')
  await page.getByText('Örnek planı aç').first().click()
  await expect(page).toHaveURL(/#\/ozet/)
}

async function createPlan(page: Page, name = 'Deneme planı') {
  await page.goto('/')
  await page.getByRole('button', { name: 'Yeni plan' }).first().click()
  await page.getByPlaceholder('Örneğin Mahalle kafesi').fill(name)
  await page.getByRole('button', { name: 'Oluştur' }).click()
  await expect(page).toHaveURL(/#\/baslangic/)
}

async function openGate(page: Page) {
  await page.goto('/#/gecis')
  await expect(page.getByRole('heading', { name: 'Stratejik planlamaya hazır mısınız?' })).toBeVisible()
  await expect(page.getByText('Yazılımın önerisi')).toBeVisible()
}

const suggestion = async (page: Page) => (await page.locator('.suggestion-line .ant-tag').innerText()).trim()
const saveButton = (page: Page) => page.getByRole('button', { name: 'Geçiş kararını kaydet' })

/** Koşullu hazır için dört alanı doldurur. Tarih, takvimde seçilebilen ilk gündür. */
async function fillConditional(page: Page) {
  await page.getByLabel('Planlanacak konu').fill('Yalnız sabah saatleri ve aylık kart.')
  await page.getByLabel('Açık soru').fill('Günde 40 sipariş tutar mı?')
  await page.getByLabel('Sorumlu', { exact: true }).fill('Kurucu')
  await page.getByLabel('Son tarih').click()
  await page.locator('.ant-picker-dropdown .ant-picker-cell-in-view:not(.ant-picker-cell-disabled)').first().click()
  await expect(page.getByLabel('Son tarih')).not.toHaveValue('')
}

async function fillCommon(page: Page) {
  await page.getByLabel('Gerekçe').fill('Dokuz zorunlu ölçüt kanıtla karşılandı. Dayanakları tek tek okudum.')
  await page.getByLabel('Karar sahibi').fill('Kurucu')
  await page.getByLabel('Dayanakları inceledim.').check()
}

test('örnek planda öneri görünür, karar kaydedilir ve strateji çalışması açılır', async ({ page }) => {
  await openDemo(page)
  await openGate(page)
  await noHorizontalOverflow(page, 'geçiş kapısı')

  const save = saveButton(page)
  await expect(save).toBeDisabled()
  await expect(page.getByText('Düğme şu nedenle kapalı')).toBeVisible()

  const suggested = await suggestion(page)
  expect(['Planlamaya hazır', 'Koşullu hazır']).toContain(suggested)
  await expect(page.getByRole('radio', { name: new RegExp(suggested) })).toBeChecked()
  if (suggested === 'Koşullu hazır') await fillConditional(page)

  await page.getByLabel('Gerekçe').fill('Dokuz zorunlu ölçüt kanıtla karşılandı. Dayanakları tek tek okudum.')
  await expect(save).toBeDisabled()
  await page.getByLabel('Karar sahibi').fill('Kurucu')
  await expect(save).toBeDisabled()
  await page.getByLabel('Dayanakları inceledim.').check()
  await expect(save).toBeEnabled()
  await save.click()

  const open = page.getByRole('button', { name: 'Strateji çalışmasını aç' })
  await expect(open).toBeVisible()
  await expect(page.getByText('Önceki geçiş kararları')).toBeVisible()
  await noHorizontalOverflow(page, 'kayıt sonrası')
  await open.click()
  await expect(page).toHaveURL(/#\/strateji/)
})

test('boş planda öneri "Henüz hazır değil" olur ve "Planlamaya hazır" seçimi engellenir', async ({ page }) => {
  await createPlan(page)
  await openGate(page)
  expect(await suggestion(page)).toBe('Henüz hazır değil')
  await expect(page.getByRole('radio', { name: /Henüz hazır değil/ })).toBeChecked()

  await page.getByRole('radio', { name: /Planlamaya hazır/ }).check()
  const blockers = page.getByRole('alert').filter({ hasText: 'Kayıt için engel var' })
  await expect(blockers).toBeVisible()
  await expect(blockers).toContainText('Zorunlu ölçüt eksikken yalnız "Henüz hazır değil" kaydedilir.')

  await fillCommon(page)
  await expect(blockers).toContainText('Zorunlu ölçüt eksikken')
  await expect(saveButton(page)).toBeDisabled()
  await noHorizontalOverflow(page, 'boş plan')
})

test('"Koşullu hazır" dört alan ister ve açık soruyu iş listesine ekler', async ({ page }) => {
  await openDemo(page)
  await openGate(page)
  await page.getByRole('radio', { name: /Koşullu hazır/ }).check()
  await expect(page.getByLabel('Planlanacak konu')).toBeVisible()
  await fillCommon(page)
  await expect(saveButton(page)).toBeDisabled()
  await expect(page.getByRole('alert').filter({ hasText: 'Kayıt için engel var' })).toContainText('Açık soruyu yazın.')
  await noHorizontalOverflow(page, 'koşullu alanlar')

  await fillConditional(page)
  await expect(saveButton(page)).toBeEnabled()
  await saveButton(page).click()
  await expect(page.getByRole('button', { name: 'Strateji çalışmasını aç' })).toBeVisible()
  await expect(page.getByText('Açık soru: Günde 40 sipariş tutar mı?')).toBeVisible()

  await page.goto('/#/isler')
  await expect(page.getByText('Geçiş kapısı açık sorusu: Günde 40 sipariş tutar mı?').first()).toBeVisible()
})

test('"Henüz hazır değil" kaydı strateji çalışmasını açmaz ve eksik ölçüte götürür', async ({ page }) => {
  await openDemo(page)
  await openGate(page)
  await page.getByRole('radio', { name: /Henüz hazır değil/ }).check()
  await fillCommon(page)
  await saveButton(page).click()
  await expect(page.getByRole('button', { name: 'Strateji çalışmasını aç' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Eksik ölçütlere dön' }).click()
  await expect(page).toHaveURL(/#\/karar\/\d\/adim\/\d\d/)
})

test('ikinci okur yazılınca destekleyici ölçüt karşılanır', async ({ page }) => {
  await openDemo(page)
  await openGate(page)
  const row = page.locator('.ant-table-row').filter({ hasText: 'İkinci bir kişi dayanakları okudu.' })
  await expect(row).toContainText('Karşılanmadı')
  await page.getByLabel('İkinci okur ya da ikinci görüş').fill('Mehmet Yılmaz')
  await expect(row).toContainText('Karşılandı')
})

test('tasarım kuralları: taşma, yazı boyutu, ağırlık, tek dolu düğme, kart içinde kart yok', async ({ page }, testInfo) => {
  await openDemo(page)
  await openGate(page)
  // Engel listesi de ölçülsün diye koşullu alanları ve uyarıyı aç.
  await page.getByRole('radio', { name: /Koşullu hazır/ }).check()
  await expect(page.getByRole('alert').filter({ hasText: 'Kayıt için engel var' })).toBeVisible()
  await noHorizontalOverflow(page, 'tasarım')

  const small = await page.evaluate(() =>
    [...document.querySelectorAll('body *')]
      .filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim()))
      .filter((e) => getComputedStyle(e).visibility !== 'hidden' && (e as HTMLElement).offsetParent !== null)
      .filter((e) => Number.parseFloat(getComputedStyle(e).fontSize) < 14)
      .map((e) => e.tagName + '.' + (e as HTMLElement).className + ' ' + getComputedStyle(e).fontSize)
      .slice(0, 5),
  )
  expect(small, '14 px altı metin').toEqual([])

  const weights = await page.evaluate(() => {
    const set = new Set<string>()
    for (const e of document.querySelectorAll('main *')) {
      const el = e as HTMLElement
      if (!el.offsetParent || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim())) continue
      set.add(getComputedStyle(el).fontWeight)
    }
    return [...set].sort()
  })
  for (const w of weights) expect(['400', '600'], `ağırlık ${w}`).toContain(w)

  const primary = await page.locator('main .ant-btn-primary:not(.ant-btn-link):not(.ant-btn-text)').evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).length)
  expect(primary, 'dolu düğme sayısı').toBe(1)
  expect(await page.locator('.ant-card .ant-card').count(), 'kart içinde kart').toBe(0)
  await expect(page.locator('.ant-alert')).toHaveCount(0)
  const breaks = await page.locator('.ant-table-cell').evaluateAll((els) => els.filter((e) => ['break-all', 'anywhere'].includes(getComputedStyle(e).wordBreak) || getComputedStyle(e).overflowWrap === 'anywhere').length)
  expect(breaks, 'kelime ortasından bölünen hücre').toBe(0)

  await page.screenshot({ path: testInfo.outputPath('gecis-form.png'), fullPage: true })
})
