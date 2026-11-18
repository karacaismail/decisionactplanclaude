import { expect, test, type Page } from '@playwright/test'

/**
 * Araştırma analizinden gelen yedi ekleme ve rol dili.
 * Kural docs/arastirma-analizi-ve-strateji-oncesi-ekleme-raporu.md dosyasındadır.
 * Bu alanların hepsi isteğe bağlıdır. Hiçbiri hazırlık kontrolünün ölçütü değildir.
 */

const STORAGE_KEY = 'decisionactplan-v1'
const SIX = ['Müşterimiz kim ve neye değer veriyor?', 'Önümüzdeki asıl engel ne?', 'Nerede oynuyoruz, neyi yapmıyoruz?', 'Büyüyünce bizi ne koruyacak?', 'Hangi koşullar şart ve neyle ölçülür?', 'Bu iş nasıl batar?']

async function openDemo(page: Page) {
  await page.goto('/')
  /* Yük altında ilk tıklama kaçabilir. Yardımcı, adres değişene kadar yeniden dener. */
  await expect(async () => {
    if (!/#\/ozet/.test(page.url())) await page.getByText('Örnek planı aç').first().click({ timeout: 2000 })
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

test('teslim raporu her yolun para mantığını, kurma yolunu ve kanıt türünü gösterir', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/devir')
  const paths = page.locator('#devir-yollar')
  for (const label of ['Para nasıl kazanılır?', 'Nasıl kurulur?', 'Kanıtın türü']) await expect(paths.getByText(label).first()).toBeVisible()
  await expect(paths.getByText('Aylık kart. Kart 600 TL, para önden gelir.').first()).toBeVisible()
  await expect(paths.locator('.devir-basis .ant-tag', { hasText: 'Kaynaklı' }).first()).toBeVisible()
  await expect(paths.locator('.devir-basis .ant-tag', { hasText: 'Varsayım' }).first()).toBeVisible()
  await expect(page.locator('main')).toContainText('Bu işi deneyip bırakan: Meydandaki eski kafe.')
  await expect(page.locator('main')).toContainText('Tek kaynağa bağımlılık')
  await expect(page.locator('main')).toContainText('Üç yıllık beklenti')
  await designRules(page, 'main', 'devir yollar')
})

test('teslim raporunun sonunda altı soru ve cevapları durur', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/devir')
  const card = page.locator('#devir-alti-soru')
  await expect(card.getByRole('heading', { name: 'Ek 3. Altı soru' })).toBeVisible()
  await expect(card.locator('.devir-six-q')).toHaveText(SIX.map((q, i) => `${i + 1}. ${q}`))
  await expect(card.locator('.devir-six-a')).toHaveCount(6)
  await expect(card.locator('.devir-six-a').nth(1)).toHaveText('Aylık kart ilgisi, gideri karşılayan günlük satışa dönüşecek mi?')
  await card.scrollIntoViewIfNeeded()
  await designRules(page, '#devir-alti-soru', 'altı soru')
})

test('boş planda altı soru cevap uydurmaz, ilgili adıma götürür', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Yeni plan' }).first().click()
  await page.getByPlaceholder('Örneğin Mahalle kafesi').fill('Boş deneme')
  await page.getByRole('button', { name: 'Oluştur' }).click()
  await expect(page).toHaveURL(/#\/baslangic/)
  await page.goto('/#/devir')
  const card = page.locator('#devir-alti-soru')
  await expect(card.locator('.devir-six-a')).toHaveCount(0)
  await expect(card.locator('.devir-missing')).toHaveCount(6)
  await expect(card.locator('.devir-missing').first()).toContainText('Henüz yazılmadı.')
})

test('rol dili her yerde aynıdır: stratej önerir, karar sahibi seçer', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/5/adim/18')
  await expect(page.getByText('Bu adımda yol seçmeyin. Stratej bu adaylardan birini önerir. Karar sahibi seçer.')).toBeVisible()
  await page.goto('/#/strateji')
  await expect(page.locator('.ant-card').filter({ hasText: 'Masadaki karar' })).toContainText('Stratej yolu önerir. Karar sahibi seçer.')
  await page.goto('/#/devir')
  await expect(page.getByRole('heading', { name: '1. Bugün hangi karar verilecek?' })).toBeVisible()
  await expect(page.locator('#devir-yollar')).toContainText('Rapor yol seçmez. Stratej yolu önerir. Karar sahibi seçer.')
  for (const path of ['/#/devir', '/#/strateji', '/#/karar/5/adim/18', '/#/gecis']) {
    await page.goto(path)
    await expect(page.locator('main')).not.toContainText(/Seçimi stratej yapar|Kararı stratej verir|Stratej'in kararı/)
  }
})

test('Adım 09 başarısız örnekleri, Adım 17 bağımlılığı, Adım 02 üç yıllık beklentiyi sorar', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/3/adim/09')
  await optionalTab(page)
  const failed = section(page, 'Bu işi deneyip bırakanlar')
  await expect(failed).toBeVisible()
  for (const label of ['Kim denedi?', 'Neden bıraktı?', 'Sizin farkınız ne?']) await expect(failed.getByText(label, { exact: true }).first()).toBeVisible()
  await failed.scrollIntoViewIfNeeded()
  await designRules(page, '.form-section', 'adım 09 başarısız örnekler')

  await page.goto('/#/karar/5/adim/17')
  await optionalTab(page)
  const dep = section(page, 'Tek kaynağa bağımlılık')
  for (const label of ['Tek müşteri', 'Tek tedarikçi', 'Tek kanal', 'Tek teknoloji', 'Tek para kaynağı', 'Tek kişi']) await expect(dep.getByText(label, { exact: true })).toBeVisible()
  await expect(dep.locator('textarea')).toHaveCount(1)
  await dep.scrollIntoViewIfNeeded()
  await designRules(page, '.form-section', 'adım 17 bağımlılık')
  // Hiçbir kutu işaretli değilse açıklama alanı görünmez.
  await patchPlan(page, `plan.steps['17'].values.dependencies = []`)
  await optionalTab(page)
  await expand(page, 'Tek kaynağa bağımlılık')
  await expect(section(page, 'Tek kaynağa bağımlılık').locator('textarea')).toHaveCount(0)

  await page.goto('/#/karar/1/adim/02')
  await expect(page.getByLabel('Üç yıl sonra bu iş nerede olsun?')).toHaveValue('Mahallede iki satış noktası. Kurucu maaşını işten alıyor.')
})

test('Adım 18 yol satırı para mantığını ve kurma yolunu sorar, koşul yardımı görünür', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/5/adim/18')
  const paths = section(page, 'Yollar')
  for (const label of ['Para nasıl kazanılır?', 'Nasıl kurulur?', 'Kanıt defterinden seç']) await expect(paths.getByText(label, { exact: true }).first()).toBeVisible()
  await optionalTab(page)
  const help = section(page, 'Başarı neye bağlı?')
  await expect(help.getByText('Koşul, ölçü, sınır ve iş ayrı şeylerdir')).toBeVisible()
  await expect(help.getByText('Koşulu dört yerde arayın')).toBeVisible()
  await expect(help.getByText('Pazar yeri için üç aday koşul')).toHaveCount(0)
  await help.scrollIntoViewIfNeeded()
  await designRules(page, '.form-section', 'adım 18 koşul yardımı')

  await patchPlan(page, `plan.profile.customer = 'pazarYeri'; plan.profile.group = true`)
  await optionalTab(page)
  await expect(section(page, 'Başarı neye bağlı?').getByText('Pazar yeri için üç aday koşul')).toBeVisible()
  await page.goto('/#/karar/3/adim/12')
  await optionalTab(page)
  await expand(page, 'Grup katkısı')
  const group = section(page, 'Grup katkısı')
  await expect(group.getByText('Grup bu işten hangi sonucu bekliyor?', { exact: true })).toBeVisible()
  await expect(group.getByText('Hangi kararı gruba sormadan alabilirsiniz?', { exact: true })).toBeVisible()
})
