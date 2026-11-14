import { expect, test, type Page } from '@playwright/test'

/**
 * Strateji çalışması, adım kilidi, ön doldurma önerileri ve temel belgesi.
 * Kabul ölçütleri docs/uygulama-plani-on-yuz.md dosyasının 5. adımındadır.
 */

const STORAGE_KEY = 'decisionactplan-v1'
const QUESTIONS = ['Kim, hangi sorunu yaşıyor?', 'Müşteri hangi somut adımı attı?', 'Hangi yollar açık?', 'Hesap hangi koşulda tutuyor?', 'Neyi hâlâ bilmiyoruz?', 'Kararı kim verecek?']

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

/** Görünür dolu düğme sayısı. Ekranda en çok bir tane olur. */
async function filledButtons(page: Page): Promise<number> {
  return page.locator('main .ant-btn-primary:not(.ant-btn-text):not(.ant-btn-link), main .hero-button').evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).length)
}

/** 14 pikselin altında yazılmış görünür metinler. Liste boş olmalı. */
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

/** Yazı ağırlığı kümesi. Yalnız 400 ve 600 olur. */
async function fontWeights(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const set = new Set<string>()
    for (const e of document.querySelectorAll('main *')) {
      const el = e as HTMLElement
      if (!el.offsetParent || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim())) continue
      set.add(getComputedStyle(el).fontWeight)
    }
    return [...set].sort()
  })
}

/** Ortak tasarım kuralları: taşma yok, küçük yazı yok, renkli uyarı kutusu yok, kart içinde kart yok, tek dolu düğme. */
async function designRules(page: Page, label: string) {
  await noHorizontalOverflow(page, label)
  expect(await smallText(page), `${label}: 14 piksel altı yazı`).toEqual([])
  for (const w of await fontWeights(page)) expect(['400', '600'], `${label}: ağırlık ${w}`).toContain(w)
  await expect(page.locator('.ant-alert'), `${label}: renkli uyarı kutusu`).toHaveCount(0)
  expect(await page.locator('.ant-card .ant-card').count(), `${label}: kart içinde kart`).toBe(0)
  expect(await filledButtons(page), `${label}: dolu düğme sayısı`).toBeLessThanOrEqual(1)
}

/** Örnek plana "Planlamaya hazır" geçiş kararı yazar. Kayıt tarayıcı deposuna doğrudan eklenir. */
async function recordTransition(page: Page) {
  await page.evaluate((key) => {
    const raw = JSON.parse(localStorage.getItem(key) ?? '{}')
    const plan = raw.state.plans[raw.state.currentId]
    plan.transitions = [
      { id: 'gecis-deneme', outcome: 'hazir', suggested: 'hazir', reason: 'Dayanaklar incelendi. Zorunlu ölçütler tamam.', decidedBy: 'Kurucu', decidedAt: new Date().toISOString(), reviewed: true, mandatoryMet: 9, mandatoryTotal: 9, supportingMet: 4, supportingTotal: 6, level: 5, revision: plan.revision },
    ]
    localStorage.setItem(key, JSON.stringify(raw))
  }, STORAGE_KEY)
  await page.reload()
}

test('geçiş kararı yokken strateji çalışması kilitli görünür', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/strateji')
  await expect(page.getByRole('heading', { level: 1, name: 'Hangi müşteriye, hangi yolla, neyle kazanacaksınız?' })).toBeVisible()
  await expect(page.locator('.page-kicker')).toHaveText('Strateji çalışması')
  const lock = page.getByRole('alert').filter({ hasText: 'Strateji çalışması kilitli' })
  await expect(lock).toBeVisible()
  await expect(lock).toContainText('Geçiş kapısında "Planlamaya hazır" ya da "Koşullu hazır" kararı yok.')
  await expect(page.getByRole('button', { name: 'Geçiş kapısına git' })).toBeVisible()
  // Üç adım listelenir ve her biri kilitli görünür. Kilitliyken dolu düğme yoktur.
  for (const id of ['18', '19', '20']) await expect(page.getByText(`Adım ${id}`, { exact: true }).first()).toBeVisible()
  await expect(page.locator('.karar-table .ant-tag', { hasText: 'Kilitli' })).toHaveCount(3)
  expect(await filledButtons(page)).toBe(0)
  await expect(page.getByRole('heading', { name: QUESTIONS[0] })).toBeVisible()
  await designRules(page, 'strateji kilitli')

  await page.getByRole('button', { name: 'Geçiş kapısına git' }).click()
  await expect(page).toHaveURL(/#\/gecis/)
})

test('kilitli Adım 18 salt okunur açılır ve kayıt düğmeleri kapalıdır', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/9/adim/18')
  await expect(page.getByRole('heading', { name: /Adım 18\./ })).toBeVisible()
  await expect(page.locator('.page-kicker')).toHaveText('Strateji çalışması')
  await expect(page.getByRole('alert').filter({ hasText: 'Bu adım kilitli' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Adımı tamamla' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Taslak bırak, ilerle' })).toBeDisabled()
  await expect(page.locator('#a18-chosenPath')).toBeDisabled()
  // Kilitliyken öneri kartı ve dayanak özeti açılmaz. Yazma yolu yoktur.
  await expect(page.getByText('Temelden gelen öneriler')).toHaveCount(0)
  const bar = page.locator('.action-bar')
  expect(await bar.locator('.ant-btn').evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).length)).toBeLessThanOrEqual(3)
  await designRules(page, 'adım 18 kilitli')

  await page.getByRole('link', { name: 'Geçiş kapısına git' }).click()
  await expect(page).toHaveURL(/#\/gecis/)

  // Eski adres de çalışır. Adım kendi grubunu bilir.
  await page.goto('/#/karar/5/adim/20')
  await expect(page.getByRole('heading', { name: /Adım 20\./ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Adımı tamamla' })).toBeDisabled()
  await page.getByRole('button', { name: 'Strateji özetine git' }).click()
  await expect(page).toHaveURL(/#\/strateji/)
})

test('çıktılar ekranında "Temel belgesi" sekmesi altı soruyu gösterir', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/ciktilar')
  // Varsayılan sekme yönetici raporudur.
  await expect(page.getByRole('heading', { name: 'Yönetici raporu' })).toBeVisible()
  await page.getByText('Temel belgesi', { exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Stratejik planlama temel belgesi' })).toBeVisible()
  for (const q of QUESTIONS) await expect(page.getByRole('heading', { name: q })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Geçiş kararı' })).toBeVisible()
  await expect(page.getByText('Örnek plan. Gerçek veri değildir.')).toBeVisible()
  // Kaynak satırı kanıt defterinden gelir: başlık, tarih ve basamak.
  await expect(page.getByText(/^Kaynak: 7 kişi aylık kahve kartına ödeme yaptı, .+ günü\. Kanıt basamağı 1\.$/).first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Markdown indir' })).toBeEnabled()
  await noHorizontalOverflow(page, 'temel belgesi')
  expect(await smallText(page), 'temel belgesi: 14 piksel altı yazı').toEqual([])
  expect(await page.locator('.ant-card .ant-card').count()).toBe(0)

  // Üç sekme de görünür kalır. Dar ekranda sekmeler alt satıra sarılır.
  for (const name of ['Temel belgesi', 'Yönetici raporu', 'Girişimci aksiyon planı']) await expect(page.getByRole('tab', { name })).toBeInViewport()

  // Yazdırma görünümünde temel belgesi kalır, yazı 14 pikselin altına inmez.
  await page.emulateMedia({ media: 'print' })
  await expect(page.getByRole('heading', { name: QUESTIONS[0] })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Markdown indir' })).toBeHidden()
  const printSize = await page.locator('.report-foundation .foundation-lines').first().evaluate((el) => getComputedStyle(el).fontSize)
  expect(Number.parseFloat(printSize)).toBe(14)
  await page.emulateMedia({ media: 'screen' })
})

test('boş planda temel belgesi "Henüz yazılmadı." yazar', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Yeni plan' }).first().click()
  await page.getByPlaceholder('Örneğin Mahalle kafesi').fill('Boş deneme')
  await page.getByRole('button', { name: 'Oluştur' }).click()
  await expect(page).toHaveURL(/#\/baslangic/)
  await page.goto('/#/ciktilar?belge=temel')
  await expect(page.getByRole('heading', { name: QUESTIONS[0] })).toBeVisible()
  await expect(page.locator('.report-foundation .foundation-lines.is-empty')).toHaveCount(6)
  await expect(page.locator('.report-foundation .foundation-lines.is-empty').first()).toHaveText('Henüz yazılmadı.')
  await expect(page.getByText('Geçiş kararı henüz kaydedilmedi. Karar, geçiş kapısında kaydedilir.')).toBeVisible()
  await noHorizontalOverflow(page, 'boş temel belgesi')
})

test('geçiş kararından sonra adımlar açılır ve öneri yalnız onayla alana yazılır', async ({ page }) => {
  await openDemo(page)
  await recordTransition(page)
  await page.goto('/#/strateji')
  await expect(page.getByRole('alert').filter({ hasText: 'Strateji çalışması kilitli' })).toHaveCount(0)
  await expect(page.locator('.strateji-outcome .ant-tag')).toHaveText('Planlamaya hazır')
  await expect(page.getByText('Dayanaklar incelendi. Zorunlu ölçütler tamam.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Temel belgesini aç' })).toBeVisible()
  const open = page.getByRole('button', { name: "Adım 18'i aç" })
  await expect(open).toBeVisible()
  expect(await filledButtons(page)).toBe(1)
  await designRules(page, 'strateji açık')

  await open.click()
  await expect(page).toHaveURL(/#\/karar\/9\/adim\/18/)
  await expect(page.getByRole('button', { name: 'Adımı tamamla' })).toBeEnabled()
  await expect(page.getByText('Dayanak özeti', { exact: true })).toBeVisible()
  await expect(page.getByText('Temelden gelen öneriler')).toBeVisible()
  // Öneri gösterilir ama kayda yazılmaz. Alan boş kalır.
  const chosen = page.locator('#a18-chosenPath')
  await expect(chosen).toHaveValue('')
  const stored = () => page.evaluate((key) => { const raw = JSON.parse(localStorage.getItem(key) ?? '{}'); return raw.state.plans[raw.state.currentId].steps['18']?.values?.chosenPath ?? null }, STORAGE_KEY)
  expect(await stored()).toBeNull()
  await designRules(page, 'adım 18 açık')

  // "Alana yaz" kullanıcının onayıdır. Öneri alana yazılır ve öneri satırı kalkar.
  await page.getByRole('button', { name: 'Alana yaz: Seçilen yol' }).click()
  await expect(chosen).toHaveValue('Küçük kafe. 25 kişilik salon.')
  await expect(page.getByRole('button', { name: 'Alana yaz: Seçilen yol' })).toHaveCount(0)
  await expect.poll(stored).toBe('Küçük kafe. 25 kişilik salon.')
  await noHorizontalOverflow(page, 'adım 18 öneri sonrası')
})
