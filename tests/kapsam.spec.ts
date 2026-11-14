import { expect, test, type Page } from '@playwright/test'

/**
 * Form yükü, kısa yol, bakılmayan alanlar, belirsizlik seviyesi, en kötü durum, etkileyen kişiler ve yedek uyarısı.
 * Kural docs/strateji-tanimi-bosluk-ve-bilinmeyen-analizi.md dosyasının "Uygulama notu" bölümündedir.
 */

const STORAGE_KEY = 'decisionactplan-v1'

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

const section = (page: Page, title: string) => page.locator('.form-section').filter({ has: page.locator('.ant-card-head-title', { hasText: title }) })
const tab = (page: Page, text: string) => page.locator('.form-tabs .ant-segmented-item', { hasText: text })

test('Adım 18 tek zorunlu bölümle açılır, isteğe bağlı bölümler ayrı sekmededir', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/5/adim/18')
  await expect(tab(page, 'Zorunlu bölümler (1)')).toBeVisible()
  await expect(tab(page, 'İsteğe bağlı bölümler (7)')).toBeVisible()
  await expect(page.locator('.form-section')).toHaveCount(1)
  await expect(section(page, 'Yollar')).toBeVisible()
  await tab(page, 'İsteğe bağlı bölümler').click()
  await expect(page.locator('.form-section')).toHaveCount(7)
  await expect(page.locator('.form-tabs-note')).toContainText('Bu bölümleri doldurmak zorunda değilsiniz.')
  await expect(section(page, 'Asıl engel').locator('.fill-tag').first()).toHaveText('İsteğe bağlı')
  await designRules(page, 'main', 'Adım 18 isteğe bağlı sekme')
})

test('boş isteğe bağlı bölüm kapalı gelir, düğme bölümü açar ve kapatır', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `delete plan.steps['13'].values.customerJobs; for (const k of ['painRelievers','customerPains','gainCreators','customerGains','unmatched']) delete plan.steps['13'].values[k]`)
  await page.goto('/#/karar/4/adim/13')
  const card = section(page, 'Değer önerisi kanvası')
  await expect(card).toHaveClass(/is-closed/)
  const open = page.getByRole('button', { name: 'Değer önerisi kanvası bölümünü aç' })
  await expect(open).toHaveAttribute('aria-expanded', 'false')
  await expect(card.locator('.field-grid')).toHaveCount(0)
  await open.click()
  await expect(card).not.toHaveClass(/is-closed/)
  await expect(card.locator('.field-grid')).toBeVisible()
  const close = page.getByRole('button', { name: 'Değer önerisi kanvası bölümünü kapat' })
  await expect(close).toHaveAttribute('aria-expanded', 'true')
  // Klavye de açıp kapatır.
  await close.focus()
  await page.keyboard.press('Enter')
  await expect(card).toHaveClass(/is-closed/)
  await designRules(page, 'main', 'Adım 13 kapalı bölüm')
})

test('dolu isteğe bağlı bölüm açık gelir', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/5/adim/17')
  await tab(page, 'İsteğe bağlı bölümler').click()
  await expect(section(page, 'İşi etkileyen kişiler')).not.toHaveClass(/is-closed/)
  await expect(section(page, 'İşi etkileyen kişiler').locator('input, textarea').first()).toHaveValue('Dükkânın mal sahibi')
})

test('isteğe bağlı bölümü boş bırakmak adımın tamamlanmasını engellemez', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `for (const k of ['stakeholders','dissents','dependencies','dependencyNote','eca','irreversible','irreversibleNote']) delete plan.steps['17'].values[k]; plan.steps['17'].status = 'taslak'`)
  await page.goto('/#/karar/5/adim/17')
  await page.getByRole('button', { name: 'Adımı tamamla' }).click()
  await expect.poll(() => stored(page, `plan.steps['17'].status`)).toBe('tamam')
})

test('kısa yolda Adım 17 görünür ve üç bölüm taşır', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `plan.shortPath = true`)
  await page.goto('/#/karar/5')
  await expect(page.locator('main')).toContainText('Risk ve ön ölüm analizi')
  await page.goto('/#/karar/5/adim/17')
  await expect(page.locator('.form-section')).toHaveCount(3)
  await expect(section(page, 'Ön ölüm listesi')).toBeVisible()
  await expect(section(page, 'Risk tablosu')).toBeVisible()
  await expect(section(page, 'Tek kaynağa bağımlılık')).toBeVisible()
  await expect(section(page, 'Ayrı görüş')).toHaveCount(0)
  await expect(page.locator('main')).toContainText('Bu iş tutmazsa en çok ne kaybedersiniz?')
  await designRules(page, 'main', 'kısa yol Adım 17')
})

test('devir raporu belirsizlik seviyesini, en kötü durumu ve etkileyen kişileri gösterir', async ({ page }) => {
  await openDemo(page)
  const before = await stored(page, 'plan.revision')
  await page.goto('/#/devir')
  const levels = page.locator('.devir-uncertainties li')
  await expect(levels).toHaveCount(2)
  await expect(levels.nth(0)).toContainText('Sonuç bir aralıkta kalacak')
  await expect(levels.nth(1)).toContainText('İki ya da üç sonuçtan biri olacak')
  const people = page.locator('.devir-stakeholders li')
  await expect(people).toHaveCount(2)
  await expect(people.nth(0)).toContainText('Dükkânın mal sahibi')
  await expect(people.nth(0)).toContainText('Engelleyebilir')
  await expect(page.locator('main')).toContainText('En kötü durum')
  await expect(page.locator('main')).toContainText('En çok 120.000 TL ve 6 ay kaybederim')
  await expect(page.locator('.devir-blind')).toContainText('Bakılmayan alan yok.')
  await designRules(page, 'main', 'devir yeni bloklar')
  expect(await stored(page, 'plan.revision')).toBe(before)
})

test('seviyesi seçilmemiş belirsizlik "Seçilmedi" diye görünür', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `delete plan.steps['04'].values.uncertainty1Level`)
  await page.goto('/#/devir')
  await expect(page.locator('.devir-uncertainties li').nth(0)).toContainText('Seçilmedi')
})

test('devir raporu atlanan ve kısa yolda gizlenen adımı bakılmayan alan diye gösterir', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `plan.steps['04'] = { values: {}, status: 'atlandi', skipReason: 'Sektörü iyi tanıyorum.', updatedAt: '' }`)
  await page.goto('/#/devir')
  const blind = page.locator('.devir-blind')
  await expect(blind.locator('li')).toHaveCount(1)
  await expect(blind).toContainText('Adım 04.')
  await expect(blind).toContainText('Atlandı')
  await expect(blind).toContainText('Sektörü iyi tanıyorum.')
  await patchPlan(page, `plan.shortPath = true`)
  await expect(blind).toContainText('Kısa yolda gizli')
  await designRules(page, 'main', 'devir bakılmayan alanlar')
})

test('örnek plan yedek uyarısı vermez', async ({ page }) => {
  await openDemo(page)
  await expect(page.locator('main').getByText('Yedek alın')).toHaveCount(0)
})

test('plan özeti yedek uyarısı verir, yedek inince uyarı kalkar', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `plan.example = false`)
  const callout = page.locator('main').getByText('Bu planın yedeği hiç alınmadı.')
  await expect(callout).toBeVisible()
  await designRules(page, 'main', 'plan özeti yedek uyarısı')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Yedeği indir' }).click()
  expect((await download).suggestedFilename()).toMatch(/\.json$/)
  await expect(callout).toHaveCount(0)
  // Uyarı yeniden yüklemede de kapalı kalır.
  await page.reload()
  await expect(page.locator('main').getByText('Bu planın yedeği hiç alınmadı.')).toHaveCount(0)
})

test('yedek yedi günden eskiyse plan özeti yeniden uyarır', async ({ page }) => {
  await openDemo(page)
  await page.evaluate((key) => {
    const raw = JSON.parse(localStorage.getItem(key) ?? '{}')
    raw.state.plans[raw.state.currentId].example = false
    raw.state.backups = { [raw.state.currentId]: new Date(Date.now() - 9 * 86_400_000).toISOString() }
    localStorage.setItem(key, JSON.stringify(raw))
  }, STORAGE_KEY)
  await page.reload()
  await expect(page.locator('main')).toContainText('Yedek 7 günden eski.')
})

test('sekme seçimi sonraki adıma taşınmaz', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/5/adim/17')
  await tab(page, 'İsteğe bağlı bölümler').click()
  await expect(section(page, 'Ayrı görüş')).toBeVisible()
  await page.getByRole('button', { name: 'Adımı tamamla' }).click()
  await expect(page).toHaveURL(/#\/karar\/5\/adim\/18/)
  // Adım 18 zorunlu sekmeyle açılır.
  await expect(section(page, 'Yollar')).toBeVisible()
  await expect(section(page, 'Asıl engel')).toHaveCount(0)
})

test('dolu isteğe bağlı bölüm, alanı boşalınca kapanmaz ve odak kaybolmaz', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/5/adim/18')
  await tab(page, 'İsteğe bağlı bölümler').click()
  const card = section(page, 'Rakip tepkisi')
  const field = card.locator('textarea').first()
  await expect(field).not.toHaveValue('')
  await field.fill('')
  await expect(card).not.toHaveClass(/is-closed/)
  await expect(field).toBeFocused()
  await field.fill('Zincir kafe fiyat indirir.')
  await expect(field).toHaveValue('Zincir kafe fiyat indirir.')
})

test('eksik alan uyarısı zorunlu sekmeyi seçer ve eksik bölümü gösterir', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `delete plan.steps['17'].values.premortem; plan.steps['17'].status = 'taslak'`)
  await page.goto('/#/karar/5/adim/17')
  await tab(page, 'İsteğe bağlı bölümler').click()
  await expect(section(page, 'Ön ölüm listesi')).toHaveCount(0)
  await page.getByRole('button', { name: 'Adımı tamamla' }).click()
  await expect(page.locator('.ant-message')).toContainText('Eksik alan var')
  await expect(section(page, 'Ön ölüm listesi')).toBeVisible()
  await expect(page).toHaveURL(/#\/karar\/5\/adim\/17/)
})

test('aç düğmesinin dokunma alanı en az 44 pikseldir ve klavyeyle çalışır', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `for (const k of ['customerJobs','painRelievers','customerPains','gainCreators','customerGains','unmatched']) delete plan.steps['13'].values[k]`)
  await page.goto('/#/karar/4/adim/13')
  const open = page.getByRole('button', { name: 'Değer önerisi kanvası bölümünü aç' })
  const touch = await open.evaluate((el) => {
    const after = getComputedStyle(el, '::after')
    return { h: el.getBoundingClientRect().height - Number.parseFloat(after.top) - Number.parseFloat(after.bottom), font: Number.parseFloat(getComputedStyle(el).fontSize) }
  })
  expect(touch.h).toBeGreaterThanOrEqual(44)
  expect(touch.font).toBeGreaterThanOrEqual(14)
  await open.focus()
  await page.keyboard.press('Space')
  await expect(section(page, 'Değer önerisi kanvası')).not.toHaveClass(/is-closed/)
  // Kapanış hareketi bitince gövde ekrandan kalkar.
  await page.getByRole('button', { name: 'Değer önerisi kanvası bölümünü kapat' }).click()
  await expect(section(page, 'Değer önerisi kanvası')).toHaveClass(/is-closed/)
  await expect(section(page, 'Değer önerisi kanvası').locator('.field-grid')).toHaveCount(0)
})

test('sağ sütundaki bağlantı öteki sekmedeki bölümü açar ve ekrana getirir', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) < 1200, 'Sağ sütun yalnız geniş ekranda görünür.')
  await openDemo(page)
  await page.goto('/#/karar/5/adim/18')
  await expect(section(page, 'Asıl engel')).toHaveCount(0)
  await page.locator('.work-aside .ant-anchor-link-title', { hasText: 'Asıl engel' }).click()
  const card = section(page, 'Asıl engel')
  await expect(card).toBeVisible()
  await expect(card).toBeInViewport()
  // Kart yapışkan üst şeridin altında kalmaz.
  await expect.poll(async () => (await card.boundingBox())?.y ?? 0).toBeGreaterThanOrEqual(56)
  // Doluluk halkası isteğe bağlı alanları ayrı satırda sayar.
  await expect(page.locator('.work-aside .step-progress-text')).toContainText('İsteğe bağlı alan:')
})

test('ekipte kısa yol Adım 03\'ü gizlemez', async ({ page }) => {
  await openDemo(page)
  await patchPlan(page, `plan.shortPath = true; plan.profile.team = 'ekip'`)
  await page.goto('/#/karar/1')
  await expect(page.locator('main')).toContainText('Karar hakları')
})
