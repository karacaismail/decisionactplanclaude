import { expect, test, type Page } from '@playwright/test'

/**
 * Geçiş kapısı (/gecis) akışı. Yazılım öneri üretir, karar sahibi kaydeder.
 * Kabul ölçütleri docs/uygulama-plani-on-yuz.md Adım 3 ve 6.5'tedir.
 * Rapora bağlanan kısım docs/strateje-devir-uygulama-plani.md Adım 5'tedir.
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
  /* Yük altında ilk tıklama kaçabilir. Yardımcı, adres değişene kadar yeniden dener. */
  await expect(async () => {
    if (!/#\/ozet/.test(page.url())) await page.getByText('Kafe örneğini aç').first().click({ timeout: 2000 })
    await expect(page).toHaveURL(/#\/ozet/, { timeout: 2000 })
  }).toPass()
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

/** Onay kutusunun etiketi. Karar sahibi strateje devir raporunu okuduğunu bildirir. */
const REPORT_READ = 'Strateje devir raporunu okudum.'

const suggestion = async (page: Page) => (await page.locator('.suggestion-line .ant-tag').innerText()).trim()
const saveButton = (page: Page) => page.getByRole('button', { name: 'Geçiş kararını kaydet' })

/** Koşullu hazır için dört alanı doldurur. Tarih, takvimde seçilebilen ilk gündür. */
async function fillConditional(page: Page) {
  await page.getByLabel('Planlanacak konu').fill('Yalnız sabah saatleri ve aylık kart.')
  await page.getByLabel('Açık soru').fill('Günde 40 sipariş tutar mı?')
  await page.getByLabel('Sorumlu', { exact: true }).fill('Kurucu')
  /* Takvim açılırken yapılan tıklama yük altında kaçabilir. Değer yazılana kadar yeniden denenir. */
  await expect(async () => {
    const cell = page.locator('.ant-picker-dropdown:visible .ant-picker-cell-in-view:not(.ant-picker-cell-disabled)').first()
    if (!(await cell.isVisible())) await page.getByLabel('Son tarih').click()
    await cell.click({ timeout: 2000 })
    await expect(page.getByLabel('Son tarih')).not.toHaveValue('', { timeout: 1500 })
  }).toPass({ timeout: 20_000 })
}

async function fillCommon(page: Page) {
  await page.getByLabel('Gerekçe').fill('Dokuz zorunlu ölçüt kanıtla karşılandı. Dayanakları tek tek okudum.')
  await page.getByLabel('Karar sahibi').fill('Kurucu')
  await page.getByLabel(REPORT_READ).check()
}

test('örnek planda öneri görünür, karar kaydedilir ve strateji oluşturma açılır', async ({ page }) => {
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
  await page.getByLabel(REPORT_READ).check()
  await expect(save).toBeEnabled()
  await save.click()

  const open = page.getByRole('button', { name: 'Strateji oluşturmayı aç' })
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
  await expect(page.getByRole('button', { name: 'Strateji oluşturmayı aç' })).toBeVisible()
  await expect(page.getByText('Açık soru: Günde 40 sipariş tutar mı?')).toBeVisible()

  await page.goto('/#/isler')
  await expect(page.getByText('Geçiş kapısı açık sorusu: Günde 40 sipariş tutar mı?').first()).toBeVisible()
})

test('"Henüz hazır değil" kaydı strateji oluşturmayı açmaz ve eksik ölçüte götürür', async ({ page }) => {
  await openDemo(page)
  await openGate(page)
  await page.getByRole('radio', { name: /Henüz hazır değil/ }).check()
  await fillCommon(page)
  await saveButton(page).click()
  await expect(page.getByRole('button', { name: 'Strateji oluşturmayı aç' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Eksik ölçütlere dön' }).click()
  await expect(page).toHaveURL(/#\/karar\/\d\/adim\/\d\d/)
})

test('kapı devir raporuna bağlıdır: doluluk kartı, karar sorusu ve onay kutusu', async ({ page }) => {
  await openDemo(page)
  await openGate(page)

  // Dördüncü kart raporun doluluğunu gösterir. Sayı rapor motorundan gelir.
  const card = page.locator('.gecis-stats .stat-card').filter({ hasText: 'Devir raporu' })
  await expect(card).toBeVisible()
  await expect(card).toContainText(/\d+ \/ 14 başlık dolu\./)
  await expect(card.getByRole('progressbar')).toHaveCount(1)
  await expect(card.getByRole('link', { name: 'Raporu aç' })).toHaveAttribute('href', '#/devir')
  const filled = Number((await card.locator('.ant-statistic-content-value').innerText()).trim())
  await expect(card.locator('.stat-note')).toContainText(`${filled} / 14 başlık dolu.`)

  // Ölçüt sayıları motordan gelir. Destekleyici ölçüt yedi tanedir, zorunlu ölçüt dokuz tanedir.
  await expect(page.locator('.gecis-stats .stat-card').filter({ hasText: 'Destekleyici ölçüt' }).locator('.ant-statistic-content')).toContainText('/ 7')
  await expect(page.locator('.gecis-stats .stat-card').filter({ hasText: 'Zorunlu ölçüt' }).locator('.ant-statistic-content')).toContainText('/ 9')
  await expect(page.getByRole('table', { name: 'Destekleyici ölçütler' }).locator('tbody > tr.ant-table-row')).toHaveCount(7)
  await expect(page.locator('.ant-table-row').filter({ hasText: 'Kritik belirsizlikler ve senaryolar yazıldı.' })).toHaveCount(1)

  // Karar panelinin üstünde stratej'in önündeki karar sorusu yazar.
  const question = page.locator('.gecis-aside .gecis-question')
  await expect(question).toContainText("Masadaki karar:")
  await expect(question.locator('.gecis-question-text')).toHaveText(/\S/)
  await expect(question.locator('.gecis-question-text')).not.toHaveText('Yol adayı henüz yazılmadı.')
  const before = await page.evaluate(() => {
    const q = document.querySelector('.gecis-question')
    const form = document.querySelector('.gecis-form')
    return q && form ? Boolean(q.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING) : null
  })
  expect(before, 'soru karar panelinden önce gelir').toBe(true)

  // Onay kutusu raporu anar. Eski etiket yoktur. Yanındaki bağlantı raporu açar.
  await expect(page.getByLabel(REPORT_READ)).not.toBeChecked()
  await expect(page.getByLabel('Dayanakları inceledim.')).toHaveCount(0)
  const row = page.locator('.gecis-check-row')
  const reportLink = row.getByRole('link', { name: 'Raporu yeni sekmede aç' })
  await expect(reportLink).toHaveAttribute('href', '#/devir')
  // Yeni sekmede açılır. Yarım doldurulan karar formu silinmez.
  await expect(reportLink).toHaveAttribute('target', '_blank')
  // Bağlantı kutunun etiketi içinde değildir. Bağlantıya basmak kutuyu işaretlemez.
  await expect(row.locator('label a')).toHaveCount(0)

  // Kutu işaretlenmeden kayıt olmaz.
  if ((await suggestion(page)) === 'Koşullu hazır') await fillConditional(page)
  await page.getByLabel('Gerekçe').fill('Dokuz zorunlu ölçüt kanıtla karşılandı. Devir raporunu baştan sona okudum.')
  await page.getByLabel('Karar sahibi').fill('Kurucu')
  await expect(saveButton(page)).toBeDisabled()
  await page.getByLabel(REPORT_READ).check()
  await expect(saveButton(page)).toBeEnabled()
  await noHorizontalOverflow(page, 'devir bağlantıları')

  // Bağlantı yeni sekme açar. Bu sekmedeki form yerinde kalır.
  const [popup] = await Promise.all([page.waitForEvent('popup'), reportLink.click()])
  await expect(popup).toHaveURL(/#\/devir/)
  await popup.close()
  await expect(page.getByLabel('Karar sahibi')).toHaveValue('Kurucu')
})

test('kaydedilen kararda ölçüt toplamları motordaki sayılardır', async ({ page }) => {
  await openDemo(page)
  await openGate(page)
  await page.getByRole('radio', { name: /Henüz hazır değil/ }).check()
  await fillCommon(page)
  await saveButton(page).click()
  await expect(page.getByRole('button', { name: 'Eksik ölçütlere dön' })).toBeVisible()
  const last = await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('decisionactplan-v1') ?? '{}')
    const plan = raw.state.plans[raw.state.currentId]
    return plan.transitions[plan.transitions.length - 1]
  })
  expect(last.mandatoryTotal).toBe(9)
  expect(last.supportingTotal).toBe(7)
  await expect(page.locator('.gecis-timeline')).toContainText(`Destekleyici ölçüt ${last.supportingMet} / 7.`)
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
