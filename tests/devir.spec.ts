import { expect, test, type Page } from '@playwright/test'

/**
 * Strateje devir raporu (/devir). Rapor stratej'in önüne konur ve seçim yapmaz.
 * Ölçütler docs/strateje-devir-uygulama-plani.md dosyasının 4. adımından gelir.
 */

const QUESTION = 'Durakta mı satalım, ön siparişle mi teslim edelim?'
const PATHS = ['Bugünkü durumu sürdürmek', 'Durakta kahve arabası', 'Ön siparişle aylık kart', 'Küçük kafe salonu']

async function noHorizontalOverflow(page: Page, label = '') {
  const r = await page.evaluate(() => {
    const wide = [...document.querySelectorAll('body *')]
      .filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1 && !e.closest('.ant-table-content, .ant-table-container'))
      .slice(0, 5)
      .map((e) => e.tagName + '.' + (e as HTMLElement).className.toString().slice(0, 60))
    return { sw: document.documentElement.scrollWidth, iw: window.innerWidth, wide }
  })
  expect(r.sw, `Sayfa yatay taşmamalı ${label} ${r.wide.join(' | ')}`).toBeLessThanOrEqual(r.iw)
}

async function smallText(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll('body *')]
      .filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim()))
      .filter((e) => getComputedStyle(e).visibility !== 'hidden' && (e as HTMLElement).offsetParent !== null)
      .filter((e) => Number.parseFloat(getComputedStyle(e).fontSize) < 14)
      .map((e) => e.tagName + '.' + (e as HTMLElement).className + ' ' + getComputedStyle(e).fontSize)
      .slice(0, 5),
  )
}

async function openDemo(page: Page) {
  await page.goto('/')
  /* Yük altında ilk tıklama kaçabilir. Yardımcı, adres değişene kadar yeniden dener. */
  await expect(async () => {
    if (!/#\/ozet/.test(page.url())) await page.getByText('Örnek planı aç').first().click({ timeout: 2000 })
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

async function openReport(page: Page) {
  await openDemo(page)
  await page.goto('/#/devir')
  await expect(page.getByRole('heading', { level: 1, name: 'Strateje devir raporu' })).toBeVisible()
}

test('rapor karar sorusuyla açılır ve seçim önermez', async ({ page }) => {
  await openReport(page)
  const lead = page.locator('#devir-karar')
  await expect(lead.getByRole('heading', { name: '1. Bugün hangi karar verilecek?' })).toBeVisible()
  const question = page.locator('.devir-question')
  await expect(question).toContainText(QUESTION)
  await expect(question).toBeInViewport()
  const size = Number.parseFloat(await question.evaluate((el) => getComputedStyle(el).fontSize))
  expect(size).toBeGreaterThanOrEqual(28)
  expect(size).toBeLessThanOrEqual(32)
  await expect(page.getByText('Örnek plan. Gerçek veri değildir.')).toBeVisible()
  // Rapor seçim yapmaz: hiçbir yol "önerilen" diye işaretlenmez.
  const body = await page.locator('body').innerText()
  expect(body).not.toMatch(/[Öö]nerilen/)
  await noHorizontalOverflow(page, 'devir raporu')
})

test('dayanaklar türüne göre etiketlenir ve süzülür', async ({ page }) => {
  await openReport(page)
  const card = page.locator('#devir-dayanaklar')
  await expect(card.getByRole('heading', { name: '2. Dayanaklar' })).toBeVisible()
  const types = card.locator('.devir-claim-type')
  expect(await types.filter({ hasText: 'Kaynaklı' }).count()).toBeGreaterThanOrEqual(1)
  expect(await types.filter({ hasText: 'Varsayım' }).count()).toBeGreaterThanOrEqual(1)
  await expect(card.getByText(/^\d+ cümle: \d+ kaynaklı, \d+ hesap, \d+ karar, \d+ varsayım\.$/)).toBeVisible()
  await expect(card.getByText("Bu bilgiyle verilecek karar: Önce kimin hangi sorununa odaklanacağız?")).toBeVisible()

  await card.locator('.ant-segmented-item', { hasText: 'Varsayım' }).click()
  await expect(types.filter({ hasNotText: 'Varsayım' })).toHaveCount(0)
  expect(await types.filter({ hasText: 'Varsayım' }).count()).toBeGreaterThanOrEqual(1)
  await expect(card.getByText('Kafe günde 40 sipariş alır.')).toBeVisible()
  await expect(card.getByText('Eşik: 10 taahhüt.')).toHaveCount(0)

  await card.locator('.ant-segmented-item', { hasText: 'Hepsi' }).click()
  expect(await types.filter({ hasText: 'Kaynaklı' }).count()).toBeGreaterThanOrEqual(1)
  await noHorizontalOverflow(page, 'dayanaklar')
})

test('yollar yan yana karşılaştırılır', async ({ page }) => {
  await openReport(page)
  const card = page.locator('#devir-yollar')
  await expect(card.getByRole('heading', { name: '4. Karşılaştırılacak yollar' })).toBeVisible()
  // Geniş ekranda antd tablosu başlığı ölçmek için gizli bir kopya da çizer. İlk eşleşme görünen başlıktır.
  for (const name of PATHS) await expect(card.getByText(name, { exact: true }).first()).toBeVisible()
  await expect(card.getByText('Bugünkü durum', { exact: true }).first()).toBeVisible()
  for (const measure of ['Kime ve nereden?', 'Neyle kazanılır?', 'Neyden vazgeçilir?', 'Destekleyen kanıt', 'Bedeli ve süresi', 'Geri alınabilir mi?', 'Puan']) {
    await expect(card.getByText(measure, { exact: true }).first()).toBeVisible()
  }
  await expect(card.getByText('Geri alınmaz', { exact: true }).first()).toBeVisible()
  await expect(card.getByRole('heading', { name: 'Rakip karşı hamlesi' })).toBeVisible()
  await expect(card.getByRole('heading', { name: 'Para hesabı üç durumda' })).toBeVisible()
  await expect(card.getByText('1.000 sipariş')).toBeVisible()
  await noHorizontalOverflow(page, 'yollar')
})

test('sınırlar, eksik bilgi ve kapsam görünür', async ({ page }) => {
  await openReport(page)
  await expect(page.locator('#devir-sinirlar').getByText('Borçla büyümem. Ruhsatsız satış yapmam.')).toBeVisible()
  const missing = page.locator('#devir-eksik')
  await expect(missing.getByRole('heading', { name: 'Açık karar defteri' })).toBeVisible()
  await expect(missing.getByText('Hangi fiyat modelini deneyeceğiz?')).toBeVisible()
  await expect(missing.getByText('Etki 5 / 5.').first()).toBeVisible()
  const coverage = page.locator('#devir-kapsam')
  await expect(coverage.getByText(/^\d+ \/ 14 başlık dolu$/)).toBeVisible()
  await expect(coverage.locator('.devir-coverage > li')).toHaveCount(14)
  await expect(page.locator('#devir-ilk-gun').getByRole('button', { name: 'Strateji oluşturmaya git' })).toBeVisible()
})

test('tasarım kuralları: tek dolu düğme, iç içe kart yok, küçük yazı yok', async ({ page }) => {
  await openReport(page)
  await expect(page.locator('.devir-page')).toBeVisible()
  expect(await page.locator('.ant-alert').count()).toBe(0)
  expect(await page.locator('.ant-card .ant-card').count()).toBe(0)
  const primary = await page.locator('main .ant-btn-primary:not(.ant-btn-link):not(.ant-btn-text)').evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).length)
  expect(primary).toBe(1)
  await expect(page.getByRole('button', { name: 'Yazdır veya PDF' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Markdown indir' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'JSON indir' })).toBeVisible()
  expect(await smallText(page), '14 piksel altı yazı').toEqual([])
  const weights = await page.evaluate(() => {
    const set = new Set<string>()
    for (const e of document.querySelectorAll('main *')) {
      const el = e as HTMLElement
      if (!el.offsetParent) continue
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim())) continue
      set.add(getComputedStyle(el).fontWeight)
    }
    return [...set].sort()
  })
  for (const w of weights) expect(['400', '600'], `ağırlık ${w}`).toContain(w)
  // Hücreler kelime ortasından bölünmez.
  const breaks = await page.locator('.devir-page .ant-table-cell').evaluateAll((els) => els.filter((e) => ['break-all', 'anywhere'].includes(getComputedStyle(e).wordBreak) || getComputedStyle(e).overflowWrap === 'anywhere').length)
  expect(breaks).toBe(0)
})

test('Markdown indirme devir raporunu verir', async ({ page }) => {
  await openReport(page)
  const [file] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Markdown indir' }).click()])
  expect(file.suggestedFilename()).toMatch(/strateje-devir-raporu.*\.md$/)
})

test('içindekiler bölüme kaydırır ve adresi bozmaz', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) < 1200, 'İçindekiler yalnız geniş ekranda')
  await openReport(page)
  const toc = page.getByRole('complementary', { name: 'İçindekiler' })
  await expect(toc).toBeVisible()
  await toc.getByRole('link', { name: 'Ek 1. Kapsam' }).click()
  await expect(page.locator('#devir-kapsam')).toBeInViewport()
  await expect(page).toHaveURL(/#\/devir$/)
})

test('yazdırmada düğmeler gizlenir, rapor 14 piksel basılır', async ({ page }) => {
  await openReport(page)
  await page.emulateMedia({ media: 'print' })
  await expect(page.getByRole('button', { name: 'Markdown indir' })).toBeHidden()
  await expect(page.locator('.devir-question')).toBeVisible()
  await expect(page.locator('#devir-yollar')).toBeVisible()
  const font = await page.locator('.devir-page').evaluate((el) => ({ size: getComputedStyle(el).fontSize, family: getComputedStyle(el).fontFamily }))
  expect(Number.parseFloat(font.size)).toBe(14)
  expect(font.family).toContain('Outfit')
  expect(await smallText(page), 'yazdırmada 14 piksel altı yazı').toEqual([])
  const border = await page.locator('#devir-yollar').evaluate((el) => getComputedStyle(el).borderTopWidth)
  expect(Number.parseFloat(border)).toBe(0)
  await page.emulateMedia({ media: 'screen' })
})

test('boş planda rapor uydurma yapmaz', async ({ page }) => {
  await createPlan(page)
  await page.goto('/#/devir')
  await expect(page.getByRole('heading', { level: 1, name: 'Strateje devir raporu' })).toBeVisible()
  const paths = page.locator('#devir-yollar')
  await expect(paths.getByText('Yol adayı henüz yazılmadı.')).toBeVisible()
  await expect(paths.getByRole('link', { name: "Adım 18'i aç" })).toBeVisible()
  await expect(page.locator('#devir-karar').getByText('Geçiş kararı henüz kaydedilmedi.')).toBeVisible()
  await expect(page.locator('#devir-dayanaklar').getByText('Henüz yazılmadı.').first()).toBeVisible()
  await expect(page.locator('#devir-kapsam').getByText('0 / 14 başlık dolu')).toBeVisible()
  expect(await page.locator('.ant-card .ant-card').count()).toBe(0)
  expect(await smallText(page), 'boş plan: 14 piksel altı yazı').toEqual([])
  await noHorizontalOverflow(page, 'boş plan')
})

test('çıktılar ekranında "Strateje devir raporu" sekmesi özeti gösterir', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/ciktilar')
  // Varsayılan sekme yönetici raporudur.
  await expect(page.getByRole('heading', { name: 'Yönetici raporu' })).toBeVisible()
  for (const name of ['Strateje devir raporu', 'Yönetici raporu', 'Girişimci aksiyon planı']) await expect(page.getByRole('tab', { name })).toBeInViewport()
  await expect(page.getByRole('tab', { name: 'Temel belgesi' })).toHaveCount(0)

  await page.getByRole('tab', { name: 'Strateje devir raporu' }).click()
  await expect(page.getByRole('heading', { name: 'Strateje devir raporu' })).toBeVisible()
  await expect(page.locator('.devir-question')).toContainText(QUESTION)
  await expect(page.getByText('13 / 14 başlık dolu')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Markdown indir' })).toBeEnabled()
  const [file] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Markdown indir' }).click()])
  expect(file.suggestedFilename()).toMatch(/strateje-devir-raporu.*\.md$/)
  expect(await page.locator('.ant-card .ant-card').count()).toBe(0)
  expect(await smallText(page), 'devir sekmesi: 14 piksel altı yazı').toEqual([])
  await noHorizontalOverflow(page, 'devir sekmesi')

  await page.getByRole('link', { name: 'Raporu aç' }).click()
  await expect(page).toHaveURL(/#\/devir$/)
})

test('eski ve yeni belge adresi devir sekmesini açar', async ({ page }) => {
  await openDemo(page)
  for (const key of ['temel', 'devir']) {
    await page.goto(`/#/ciktilar?belge=${key}`)
    await expect(page.getByRole('tab', { name: 'Strateje devir raporu' })).toHaveAttribute('aria-selected', 'true')
    await expect(page.locator('.devir-question')).toContainText(QUESTION)
    await page.goto('/#/ozet')
  }
})
