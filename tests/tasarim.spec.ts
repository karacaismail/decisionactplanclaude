import { expect, test, type Page } from '@playwright/test'

/**
 * Kurumsal tasarım kabul ölçütleri. Bağımsız eleştirinin (docs/tasarim-elestirisi-1-tur.md)
 * maddeleri ölçülebilir teste çevrildi. Her test, ölçütün numarasını başlıkta taşır.
 */

async function openDemo(page: Page) {
  await page.goto('/')
  await page.getByText('Örnek planı aç').first().click()
  await expect(page).toHaveURL(/#\/ozet/)
}

const px = (v: string) => Number.parseFloat(v)

async function docWidthOk(page: Page, label: string) {
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))
  expect(r.sw, `${label}: belge genişliği görünüm alanını aşmamalı`).toBeLessThanOrEqual(r.iw)
}

test('ölçüt 1: h1 28px ve 600, kicker 14px büyük harf', async ({ page }) => {
  await openDemo(page)
  for (const url of ['/#/ozet', '/#/kanitlar', '/#/karar/5/kapi']) {
    await page.goto(url)
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
    const cs = await h1.evaluate((el) => { const s = getComputedStyle(el); return { size: s.fontSize, weight: s.fontWeight } })
    expect(px(cs.size), url).toBe(28)
    expect(Number(cs.weight), url).toBe(600)
  }
  const kicker = page.locator('.page-kicker').first()
  await expect(kicker).toBeVisible()
  const k = await kicker.evaluate((el) => { const s = getComputedStyle(el); return { size: s.fontSize, tt: s.textTransform } })
  expect(px(k.size)).toBe(14)
  expect(k.tt).toBe('uppercase')
})

test('ölçüt 2: 14px altı okunabilir metin yok', async ({ page }) => {
  await openDemo(page)
  for (const url of ['/#/ozet', '/#/karar/3/adim/11', '/#/karar/5/kapi', '/#/gostergeler']) {
    await page.goto(url)
    const small = await page.evaluate(() =>
      [...document.querySelectorAll('body *')]
        .filter((e) => e.childNodes.length && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim()))
        .filter((e) => getComputedStyle(e).visibility !== 'hidden' && (e as HTMLElement).offsetParent !== null)
        .filter((e) => Number.parseFloat(getComputedStyle(e).fontSize) < 14)
        .map((e) => e.tagName + '.' + (e as HTMLElement).className + ' ' + getComputedStyle(e).fontSize)
        .slice(0, 5),
    )
    expect(small, url).toEqual([])
  }
})

test('ölçüt 3 ve 4: üst şerit 56px ekmek kırıntılı, yan menü 240px ve etiketsiz', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) < 1024, 'Yalnız masaüstü')
  await openDemo(page)
  await page.goto('/#/karar/3/adim/11')
  const header = page.locator('header').first()
  expect(px(await header.evaluate((el) => getComputedStyle(el).height))).toBe(56)
  await expect(page.locator('nav[aria-label="Konum"]')).toContainText('Karar 3')
  const sider = page.locator('.ant-layout-sider').first()
  expect(px(await sider.evaluate((el) => getComputedStyle(el).width))).toBe(240)
  expect(await sider.locator('.ant-tag').count(), 'menüde etiket olmamalı').toBe(0)
  const items = sider.locator('.ant-menu-item')
  const h = await items.first().evaluate((el) => getComputedStyle(el).height)
  expect(px(h)).toBe(36)
  const clipped = await items.evaluateAll((els) => els.filter((e) => e.scrollWidth > e.clientWidth + 1).length)
  expect(clipped, 'menüde kesilen madde olmamalı').toBe(0)
})

test('ölçüt 5: etkin menü maddesinin sol çizgisi düz köşeli', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) < 1024, 'Yalnız masaüstü')
  await openDemo(page)
  const active = page.locator('.ant-menu-item-selected').first()
  const cs = await active.evaluate((el) => { const s = getComputedStyle(el); return { bw: s.borderLeftWidth, tl: s.borderTopLeftRadius, bl: s.borderBottomLeftRadius, shadow: s.boxShadow } })
  expect(px(cs.bw) === 3 || cs.shadow.includes('inset')).toBeTruthy()
  expect(px(cs.tl)).toBe(0)
  expect(px(cs.bl)).toBe(0)
})

test('ölçüt 6: kart içinde kart yok', async ({ page }) => {
  await openDemo(page)
  for (const url of ['/#/ozet', '/#/karar/5/kapi', '/#/gecmis', '/#/yontemler']) {
    await page.goto(url)
    const nested = await page.locator('.ant-card .ant-card, .surface-card .surface-card, .ant-card .surface-card, .surface-card .ant-card').count()
    expect(nested, url).toBe(0)
  }
})

test('ölçüt 8: KPI şeridi yalnız özette', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/ozet')
  await expect(page.locator('.kpi-strip')).toHaveCount(1)
  for (const url of ['/#/karar/1', '/#/karar/5/kapi']) {
    await page.goto(url)
    await expect(page.locator('.kpi-strip'), url).toHaveCount(0)
  }
})

test('ölçüt 9 ve 10: belge taşmaz, tablo satırı 44px, hücre kelime ortasından bölünmez', async ({ page }) => {
  await openDemo(page)
  for (const url of ['/#/ozet', '/#/karar/5/kapi', '/#/kanitlar', '/#/ciktilar', '/#/karar/3/adim/11']) {
    await page.goto(url)
    await docWidthOk(page, url)
  }
  await page.goto('/#/kanitlar')
  const row = page.locator('.ant-table-tbody > tr').first()
  await expect(row).toBeVisible()
  expect(px(await row.evaluate((el) => getComputedStyle(el).height))).toBeGreaterThanOrEqual(44)
  const breaks = await page.locator('.ant-table-cell').evaluateAll((els) => els.filter((e) => ['break-all', 'anywhere'].includes(getComputedStyle(e).wordBreak) || getComputedStyle(e).overflowWrap === 'anywhere').length)
  expect(breaks).toBe(0)
})

test('ölçüt 11 ve 12: ekranda en çok bir dolu düğme, turuncu çerçeveli düğme yok', async ({ page }) => {
  await openDemo(page)
  for (const url of ['/#/', '/#/ozet', '/#/karar/3/adim/11', '/#/karar/5/kapi', '/#/kanitlar', '/#/ciktilar']) {
    await page.goto(url)
    const primary = await page.locator('main .ant-btn-primary:not(.ant-btn-link):not(.ant-btn-text)').evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).length)
    expect(primary, `${url}: dolu düğme sayısı`).toBeLessThanOrEqual(1)
    const orangeOutline = await page.locator('main .ant-btn').evaluateAll((els) => {
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-action-primary').trim().toLowerCase()
      return els.filter((e) => { const s = getComputedStyle(e); return s.backgroundColor === 'rgba(0, 0, 0, 0)' && s.borderStyle !== 'none' && toHex(s.borderColor) === accent }).length
      function toHex(rgb: string) { const m = rgb.match(/\d+/g); if (!m) return rgb; return '#' + m.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('') }
    })
    expect(orangeOutline, `${url}: turuncu çerçeveli düğme`).toBe(0)
  }
})

test('ölçüt 14: renkli dolgulu bilgi kutusu yok, not bloğu düz sol çizgili', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/3/adim/11')
  await expect(page.locator('.ant-alert')).toHaveCount(0)
  const note = page.locator('.note').first()
  await expect(note).toBeVisible()
  const cs = await note.evaluate((el) => { const s = getComputedStyle(el); return { bw: s.borderLeftWidth, tl: s.borderTopLeftRadius, bl: s.borderBottomLeftRadius } })
  expect(px(cs.bw)).toBe(3)
  expect(px(cs.tl)).toBe(0)
  expect(px(cs.bl)).toBe(0)
})

test('ölçüt 16 ve 17: 320 özet ilk ekranda içerik, sayfa en çok 2400px', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) > 400, 'Yalnız telefon')
  await openDemo(page)
  const r = await page.evaluate(() => {
    const inFold = (sel: string) => { const el = document.querySelector(sel); if (!el) return false; const b = el.getBoundingClientRect(); return b.top < window.innerHeight && b.bottom > 0 }
    return { h1: inFold('h1'), primary: inFold('main .ant-btn-primary'), kpi: inFold('.kpi-strip'), height: document.documentElement.scrollHeight }
  })
  expect(r.h1 && r.primary && r.kpi, JSON.stringify(r)).toBeTruthy()
  expect(r.height).toBeLessThanOrEqual(2400)
})

test('ölçüt 20: renkli ikon kutusu yok', async ({ page }) => {
  await openDemo(page)
  await expect(page.locator('.icon-tile')).toHaveCount(0)
})

test('ölçüt 23: rapor ekranında belge üstünde en çok 4 kontrol', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/ciktilar')
  const n = await page.locator('.report-toolbar').evaluate((el) => el.querySelectorAll('button, .ant-select, input').length)
  expect(n).toBeLessThanOrEqual(4)
})
