import { expect, test, type Page } from '@playwright/test'

/**
 * Strateji oluşturma ekranı (/strateji), Adım 19 kilidi, yol adayları tablosu ve öneriler.
 * Kabul ölçütleri docs/strateje-devir-uygulama-plani.md dosyasının 6. adımındadır.
 * Strateje teslim raporu ekranı (/devir) bu dosyada sınanmaz.
 */

const STORAGE_KEY = 'decisionactplan-v1'
const MEASURES = ['Kime ve nereden?', 'Neyle kazanılır?', 'Para nasıl kazanılır?', 'Nasıl kurulur?', 'Neyden vazgeçilir?', 'Destekleyen kanıt', 'Kanıtın türü', 'Hangi sorudan çıktı?', 'Bedeli ve süresi', 'Geri alınabilir mi?', 'Puan']
const NOTE_18 = 'Bu adımda yol seçmeyin. Stratej bu adaylardan birini önerir. Karar sahibi seçer.'
const HELPER_19 = 'Seçimi karar sahibi yapar. Yazılım bu alanı sizin yerinize doldurmaz.'

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

/** Örnek plana "Planlamaya hazır" hazırlık kararı yazar. Kayıt tarayıcı deposuna doğrudan eklenir. */
async function recordTransition(page: Page) {
  await page.evaluate((key) => {
    const raw = JSON.parse(localStorage.getItem(key) ?? '{}')
    const plan = raw.state.plans[raw.state.currentId]
    plan.transitions = [
      { id: 'gecis-deneme', outcome: 'hazir', suggested: 'hazir', reason: 'Dayanaklar incelendi. Zorunlu ölçütler tamam.', decidedBy: 'Kurucu', decidedAt: new Date().toISOString(), reviewed: true, mandatoryMet: 9, mandatoryTotal: 9, supportingMet: 5, supportingTotal: 7, level: 5, revision: plan.revision },
    ]
    localStorage.setItem(key, JSON.stringify(raw))
  }, STORAGE_KEY)
  await page.reload()
}

/** Kayıtlı plandaki bir adım alanı. Alan yoksa null döner. */
const storedValue = (page: Page, step: string, field: string) =>
  page.evaluate(([key, st, f]) => { const raw = JSON.parse(localStorage.getItem(key) ?? '{}'); return raw.state.plans[raw.state.currentId].steps[st]?.values?.[f] ?? null }, [STORAGE_KEY, step, field])

/** Yol adayları tablosu: kayan kap, yol sütunları, yedi ölçü. Hiçbir yol önerilmez. */
async function expectPathCompare(page: Page, label: string) {
  const region = page.getByRole('region', { name: 'Yol adayları karşılaştırması' })
  await expect(region).toBeVisible()
  const viewport = page.viewportSize()!
  const stacked = viewport.width < 768 || viewport.height < 560
  if (stacked) {
    const paths = region.locator('.path-stack-item')
    await expect(paths).toHaveCount(4)
    for (const name of ['Bugünkü durumu sürdürmek', 'Durakta kahve arabası']) {
      await expect(region.getByRole('heading', { name })).toBeVisible()
    }
    const positions = await paths.evaluateAll((els) => els.map((el) => {
      const box = el.getBoundingClientRect()
      return { x: box.x, y: box.y, bottom: box.bottom }
    }))
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i].x).toBe(positions[0].x)
      expect(positions[i].y).toBeGreaterThanOrEqual(positions[i - 1].bottom)
    }
    for (const path of await paths.all()) {
      await expect(path.locator('dt')).toHaveText(MEASURES)
      await expect(path.locator('dd')).toHaveCount(MEASURES.length)
    }
  } else {
    for (const name of ['Bugünkü durumu sürdürmek', 'Durakta kahve arabası']) {
      await expect(region.getByRole('columnheader', { name })).toHaveCount(1)
    }
    for (const m of MEASURES) await expect(region.getByText(m, { exact: true }).first()).toBeAttached()
    await expect(region.locator('.ant-table-tbody > tr')).toHaveCount(MEASURES.length)
    const box = await region.evaluate((el) => ({ overflowX: getComputedStyle(el).overflowX }))
    expect(box.overflowX, `${label}: kap yatay kayar`).toBe('auto')
    const breaks = await region.locator('.ant-table-cell').evaluateAll((els) => els.filter((e) => ['break-all', 'anywhere'].includes(getComputedStyle(e).wordBreak) || getComputedStyle(e).overflowWrap === 'anywhere').length)
    expect(breaks, `${label}: kelime ortasından bölünen hücre`).toBe(0)
  }
  await expect(page.locator('.path-compare')).not.toContainText(/önerilen/i)
  await expect(region.locator('.ant-tag')).toHaveCount(0)
  await noHorizontalOverflow(page, label)
}

test('hazırlık kararı yokken strateji oluşturma kilitli görünür', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/strateji')
  await expect(page.getByRole('heading', { level: 1, name: 'Hangi yolu, hangi gerekçeyle seçiyorsunuz? Neyden vazgeçiyorsunuz?' })).toBeVisible()
  await expect(page.locator('.page-kicker')).toHaveText('Strateji oluşturma')
  const lock = page.getByRole('alert').filter({ hasText: 'Strateji oluşturma kilitli' })
  await expect(lock).toBeVisible()
  await expect(lock).toContainText('Hazırlık kontrolünde "Planlamaya hazır" ya da "Koşullu hazır" kararı yok.')
  await expect(page.getByRole('button', { name: 'Hazırlık kontrolüne git' })).toBeVisible()
  // Beş alt aşama listelenir. Adım 18 bu kümede değildir. Kilitliyken dolu düğme yoktur.
  await expect(page.locator('.substage')).toHaveCount(5)
  await expect(page.locator('.substage-code')).toHaveText(['2.1', '2.2', '2.3', '2.4', '2.5'])
  await expect(page.locator('.substage').nth(3).getByRole('link')).toHaveAttribute('href', '#/karar/9/adim/19')
  await expect(page.locator('.substage').nth(3).getByRole('link')).toHaveText('2.4 Seçim ve vazgeçiş adımını incele')
  await expect(page.getByText('Adım 18', { exact: true })).toHaveCount(0)
  await expect(page.locator('.karar-step-count')).toHaveText('0 / 5 tamam')
  expect(await filledButtons(page)).toBe(0)

  // Dayanak özeti yerine stratej'in sorusu, ilk günü ve yol adayları durur.
  await expect(page.getByText('Dayanak özeti', { exact: true })).toHaveCount(0)
  const question = page.locator('.ant-card').filter({ hasText: "Masadaki karar" })
  await expect(question.locator('.strateji-question')).toHaveText(/\S/)
  await expect(question.locator('.strateji-question')).not.toHaveText('Yol adayı henüz yazılmadı.')
  expect(Number.parseFloat(await question.locator('.strateji-question').evaluate((el) => getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(20)
  await expect(question.getByRole('link', { name: 'Teslim raporunu aç' })).toHaveAttribute('href', '#/devir')
  const firstDay = page.locator('.ant-card').filter({ hasText: "Stratej'in ilk günü" })
  await expect(firstDay.locator('ol > li')).toHaveCount(4)
  await expect(firstDay.locator('ol > li').first()).toContainText('Raporu sorgulayın.')
  await expectPathCompare(page, 'strateji kilitli')
  await designRules(page, 'strateji kilitli')

  await page.getByRole('button', { name: 'Hazırlık kontrolüne git' }).click()
  await expect(page).toHaveURL(/#\/gecis/)
})

test('kilitli Adım 19 salt okunur açılır ve kayıt düğmeleri kapalıdır', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/9/adim/19')
  await expect(page.getByRole('heading', { name: /2\.4\. Seçim ve vazgeçiş/ })).toBeVisible()
  await expect(page.locator('.page-kicker')).toHaveText('Strateji oluşturma')
  await expect(page.getByRole('alert').filter({ hasText: 'Bu adım kilitli' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Adımı tamamla' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Taslak bırak, ilerle' })).toBeDisabled()
  for (const key of ['chosenPath', 'choiceReason', 'givenUp']) await expect(page.locator(`#a19-${key}`)).toBeDisabled()
  // Kilitliyken öneri kartı, yol adayları kartı ve dayanak özeti açılmaz. Yazma yolu yoktur.
  await expect(page.getByText('Önceki adımlardan öneriler')).toHaveCount(0)
  await expect(page.locator('.path-compare')).toHaveCount(0)
  const bar = page.locator('.action-bar')
  expect(await bar.locator('.ant-btn').evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).length)).toBeLessThanOrEqual(3)
  await designRules(page, 'adım 19 kilitli')

  await page.getByRole('link', { name: 'Hazırlık kontrolüne git' }).click()
  await expect(page).toHaveURL(/#\/gecis/)

  // Eski adres de çalışır. Adım kendi grubunu bilir.
  await page.goto('/#/karar/5/adim/20')
  await expect(page.getByRole('heading', { name: /Çıkış kontrolü\. Strateji belgesi/ })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Adımı tamamla' })).toBeDisabled()
  await page.getByRole('button', { name: 'Strateji oluşturma özetine git' }).click()
  await expect(page).toHaveURL(/#\/strateji/)
})

test('Adım 18 "Yol adayları" kilitli değildir, Karar 5\'tedir ve Kontrol 5\'e gider', async ({ page }) => {
  await openDemo(page)
  // Hazırlık kararı yok. Adım 18 yine de açıktır.
  await page.goto('/#/karar/5/adim/18')
  await expect(page.getByRole('heading', { name: 'Adım 18. Yol adayları' })).toBeVisible()
  await expect(page.locator('.page-kicker')).toHaveText(/^Karar 5\./)
  await expect(page.getByRole('alert').filter({ hasText: 'Bu adım kilitli' })).toHaveCount(0)
  const note = page.getByRole('note').filter({ hasText: NOTE_18 })
  await expect(note).toBeVisible()
  // Not nötrdür: uyarı ya da bilgi rengi taşımaz.
  await expect(note).not.toHaveClass(/is-warn|is-info|is-danger/)
  // Bu adımda seçim alanı ve öneri kartı yoktur.
  await expect(page.locator('#a18-chosenPath')).toHaveCount(0)
  await expect(page.getByText('Önceki adımlardan öneriler')).toHaveCount(0)
  // Puanlama isteğe bağlı sekmededir. Yol adları orada satır başlığı olarak görünür.
  await page.locator('.form-tabs .ant-segmented-item', { hasText: 'İsteğe bağlı bölümler' }).click()
  await expect(page.getByText('Bugünkü durumu sürdürmek').first()).toBeAttached()
  const bar = page.locator('.action-bar')
  expect(await bar.locator('.ant-btn').evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).length)).toBeLessThanOrEqual(3)
  await expect(page.getByRole('button', { name: 'Kontrole git' })).toBeVisible()
  await designRules(page, 'adım 18')

  // Eski strateji adresi de aynı adımı kilitsiz açar.
  await page.goto('/#/karar/9/adim/18')
  await expect(page.getByRole('heading', { name: 'Adım 18. Yol adayları' })).toBeVisible()
  const complete = page.getByRole('button', { name: 'Adımı tamamla' })
  await expect(complete).toBeEnabled()
  await complete.click()
  await expect(page).toHaveURL(/#\/karar\/5\/kapi/)
})

test('boş planda yol adayları boş durumu Adım 18\'e götürür', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Yeni plan' }).first().click()
  await page.getByPlaceholder('Örneğin Mahalle kafesi').fill('Boş deneme')
  await page.getByRole('button', { name: 'Oluştur' }).click()
  await expect(page).toHaveURL(/#\/baslangic/)
  await page.goto('/#/strateji')
  await expect(page.locator('.strateji-question')).toHaveText('Yol adayı henüz yazılmadı.')
  const empty = page.locator('.path-compare-empty')
  await expect(empty).toContainText('Yol adayı henüz yazılmadı.')
  await expect(page.getByRole('region', { name: 'Yol adayları karşılaştırması' })).toHaveCount(0)
  await designRules(page, 'boş strateji')
  await empty.getByRole('link', { name: /Adım 18/ }).click()
  await expect(page).toHaveURL(/#\/karar\/5\/adim\/18/)
})

test('hazırlık kararından sonra Adım 19 açılır, yazılım yolu seçmez, öneri yalnız onayla yazılır', async ({ page }) => {
  await openDemo(page)
  await recordTransition(page)
  await page.goto('/#/strateji')
  await expect(page.getByRole('alert').filter({ hasText: 'Strateji oluşturma kilitli' })).toHaveCount(0)
  await expect(page.locator('.strateji-outcome .ant-tag')).toHaveText('Planlamaya hazır')
  await expect(page.getByText('Dayanaklar incelendi. Zorunlu ölçütler tamam.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Teslim raporunu aç' })).toBeVisible()
  // Tek dolu düğme sıradaki adımı açar.
  const open = page.getByRole('button', { name: 'Sıradaki adım: 2.1. Teşhis' })
  await expect(open).toBeVisible()
  expect(await filledButtons(page)).toBe(1)
  await designRules(page, 'strateji açık')

  await open.click()
  await expect(page).toHaveURL(/#\/karar\/9\/adim\/S21/)
  await page.goto('/#/karar/9/adim/19')
  await expect(page).toHaveURL(/#\/karar\/9\/adim\/19/)
  await expect(page.getByRole('button', { name: 'Adımı tamamla' })).toBeEnabled()
  // Yol adayları formun üstünde salt okunur durur.
  const card = page.locator('.ant-card').filter({ has: page.locator('.path-compare') })
  await expect(card.locator('.ant-card-head-title')).toHaveText('Yol adayları')
  await expect(card).toContainText(HELPER_19)
  await expect(card.locator('input, textarea, button')).toHaveCount(0)
  await expectPathCompare(page, 'adım 19 açık')
  const order = await page.evaluate(() => {
    const table = document.querySelector('.path-compare')
    const field = document.querySelector('#a19-chosenPath')
    return table && field ? Boolean(table.compareDocumentPosition(field) & Node.DOCUMENT_POSITION_FOLLOWING) : null
  })
  expect(order, 'yol adayları tablosu seçim alanından önce gelir').toBe(true)

  // Yazılım seçimi önceden yapmaz. Üç seçim alanı boş gelir ve bu alanlar için öneri yoktur.
  const chosen = page.locator('#a19-chosenPath')
  for (const key of ['chosenPath', 'choiceReason', 'givenUp']) await expect(page.locator(`#a19-${key}`)).toHaveValue('')
  expect(await storedValue(page, '19', 'chosenPath')).toBeNull()
  // Seçim adımında hiç öneri yoktur. Hedef ve iş alanları strateji uygulamadadır.
  await expect(page.getByText('Önceki adımlardan öneriler')).toHaveCount(0)
  for (const name of ['Seçilen yol', 'Seçimin gerekçesi', 'Vazgeçilenler', 'Kazanma hedefi', 'Saha']) await expect(page.getByRole('button', { name: `Alana yaz: ${name}` })).toHaveCount(0)
  await expect(page.locator('#a19-objective')).toHaveCount(0)
  await designRules(page, 'adım 19 açık')
  await expect(chosen).toHaveValue('')
  await noHorizontalOverflow(page, 'adım 19 öneri sonrası')
})
