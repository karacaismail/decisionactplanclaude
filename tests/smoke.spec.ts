import { expect, test, type Page } from '@playwright/test'

async function noHorizontalOverflow(page: Page, label = '') {
  const r = await page.evaluate(() => {
    const wide = [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > window.innerWidth + 1).slice(0, 5).map((e) => e.tagName + '.' + (e as HTMLElement).className.toString().slice(0, 60))
    return { sw: document.documentElement.scrollWidth, iw: window.innerWidth, wide }
  })
  expect(r.sw, `Sayfa yatay taşmamalı ${label} ${r.wide.join(' | ')}`).toBeLessThanOrEqual(r.iw + 1)
}

async function createPlan(page: Page, name = 'Deneme planı') {
  await page.goto('/')
  await page.getByRole('button', { name: 'Yeni plan' }).click()
  await page.getByPlaceholder('Örneğin Mahalle kafesi').fill(name)
  await page.getByRole('button', { name: 'Oluştur' }).click()
  await expect(page).toHaveURL(/#\/baslangic/)
}

test('plan oluşturulur ve giriş ekranı taşmaz', async ({ page }) => {
  await createPlan(page)
  await expect(page.getByRole('heading', { name: 'Bugün nereden başlayacaksınız?' })).toBeVisible()
  await noHorizontalOverflow(page)
})

test('Adım 00 doldurulur, tamamlanır ve Adım 01 açılır', async ({ page }) => {
  await createPlan(page)
  await page.goto('/#/karar/1/adim/00')
  for (const v of ['Tüketici', 'Hizmet', 'Düşük', 'Tek kurucu', 'Kendi param', 'Var olan pazar', 'Sıfırdan']) {
    await page.getByText(v, { exact: true }).first().click()
  }
  await noHorizontalOverflow(page)
  await page.getByRole('button', { name: 'Adımı tamamla' }).click()
  await expect(page).toHaveURL(/#\/karar\/1\/adim\/01/)
  await expect(page.getByRole('heading', { name: /Adım 01/ })).toBeVisible()
  await noHorizontalOverflow(page)
})

test('kontrol ekranı öneri gösterir ve karar kaydeder', async ({ page }) => {
  await createPlan(page)
  await page.goto('/#/karar/1/kapi')
  await expect(page.getByText('Sistemin önerisi')).toBeVisible()
  const save = page.getByRole('button', { name: 'Kararı kaydet' })
  await expect(save).toBeDisabled()
  await page.getByLabel('Gerekçe', { exact: false }).fill('Deneme gerekçesi.')
  await page.getByLabel('Karar sahibi').fill('Kurucu')
  await expect(save).toBeEnabled()
  await save.click()
  await page.goto('/#/gecmis')
  await expect(page.getByText('Kontrol 1', { exact: true })).toBeVisible()
  await noHorizontalOverflow(page)
})

test('çevreleyen odak halkası yok, klavye odağı görünür', async ({ page, browserName }) => {
  await createPlan(page)
  await page.goto('/#/ozet')
  // Safari ailesi düğme ve bağlantılara yalnız Option+Tab ile gider.
  const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab'
  await page.keyboard.press(tab)
  await page.keyboard.press(tab)
  const result = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    if (!el || el === document.body) return { mode: document.documentElement.getAttribute('data-focus-mode'), outline: 'yok', hasMarker: false }
    const cs = getComputedStyle(el)
    const before = getComputedStyle(el, '::before')
    return { mode: document.documentElement.getAttribute('data-focus-mode'), outline: cs.outlineStyle, outlineWidth: cs.outlineWidth, shadow: cs.boxShadow, hasMarker: before.width === '3px', tag: el.tagName + '.' + el.className }
  })
  expect(result.mode).toBe('keyboard')
  expect(result.outline === 'none' || result.outline === 'yok' || result.outlineWidth === '0px', JSON.stringify(result)).toBeTruthy()
  expect(result.hasMarker, JSON.stringify(result)).toBeTruthy()
})

test('çıktılar ekranı iki belgeyi üretir', async ({ page }) => {
  await createPlan(page)
  await page.goto('/#/ciktilar')
  await expect(page.getByRole('heading', { name: 'Yönetici raporu' })).toBeVisible()
  await page.getByText('Girişimci aksiyon planı', { exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Girişimci aksiyon planı' })).toBeVisible()
  await noHorizontalOverflow(page)
})

test('42 adımın hepsi hatasız açılır', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('antd')) errors.push(m.text()) })
  await createPlan(page)
  /* Kodu olan adımlar alt aşama koduyla, öteki adımlar "Adım NN" diye görünür. */
  const coded: Record<string, [number, string]> = { S21: [9, '2.1'], S22: [9, '2.2'], S23: [9, '2.3'], '19': [9, '2.4'], S25: [9, '2.5'], '20': [9, 'Çıkış kontrolü'], U31: [6, '3.1'], U32: [6, '3.2'], U33: [6, '3.3'] }
  const numbered = Array.from({ length: 35 }, (_, i) => String(i).padStart(2, '0')).filter((id) => !(id in coded))
  for (const id of numbered) {
    const k = Number(id)
    const n = k <= 4 ? 1 : k <= 8 ? 2 : k <= 12 ? 3 : k <= 15 ? 4 : k <= 18 ? 5 : k <= 25 ? 6 : k <= 32 ? 7 : 8
    await page.goto(`/#/karar/${n}/adim/${id}`)
    await expect(page.getByRole('heading', { name: new RegExp(`Adım ${id}\\.`) })).toBeVisible()
    await noHorizontalOverflow(page, `adım ${id}`)
  }
  for (const [id, [n, code]] of Object.entries(coded)) {
    await page.goto(`/#/karar/${n}/adim/${id}`)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(`${code}. `)
    await noHorizontalOverflow(page, `adım ${id}`)
  }
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) {
    await page.goto(`/#/karar/${n}/kapi`)
    await expect(page.getByText('Sistemin önerisi')).toBeVisible()
  }
  expect(errors, errors.join('\n')).toEqual([])
})
