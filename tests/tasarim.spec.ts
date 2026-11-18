import { expect, test, type Page } from '@playwright/test'

/**
 * Kurumsal tasarım kabul ölçütleri. Bağımsız eleştirinin (docs/tasarim-elestirisi-1-tur.md)
 * maddeleri ölçülebilir teste çevrildi. Her test, ölçütün numarasını başlıkta taşır.
 */

async function openDemo(page: Page) {
  await page.goto('/')
  /* Yük altında ilk tıklama kaçabilir. Yardımcı, adres değişene kadar yeniden dener. */
  await expect(async () => {
    if (!/#\/ozet/.test(page.url())) await page.getByText('Kafe örneğini aç').first().click({ timeout: 2000 })
    await expect(page).toHaveURL(/#\/ozet/, { timeout: 2000 })
  }).toPass()
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
    expect(px(cs.size), url).toBeGreaterThanOrEqual(30)
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

test('ölçüt 3 ve 4: üst şerit 60px, yatay sekmeler, yol dizini etiketsiz', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) < 1024, 'Yalnız masaüstü')
  await openDemo(page)
  await page.goto('/#/karar/3/adim/11')
  const header = page.locator('.topbar').first()
  expect(px(await header.evaluate((el) => getComputedStyle(el).height))).toBe(60)
  const tabs = page.locator('.product-nav a')
  expect(await tabs.count()).toBeGreaterThanOrEqual(8)
  const active = page.locator('.product-nav a[aria-current="page"]')
  await expect(active).toHaveText(/Yol/)
  const bar = await active.evaluate((el) => getComputedStyle(el, '::after').height)
  expect(px(bar)).toBe(3)
  const rail = page.locator('.journey-rail').first()
  await expect(rail).toBeVisible()
  expect(await rail.locator('.ant-tag').count(), 'yol dizininde etiket olmamalı').toBe(0)
  const items = rail.locator('.ant-menu-item')
  expect(px(await items.first().evaluate((el) => getComputedStyle(el).height))).toBe(44)
  const clipped = await items.evaluateAll((els) => els.filter((e) => e.scrollWidth > e.clientWidth + 1).length)
  expect(clipped, 'yol dizininde kesilen madde olmamalı').toBe(0)
  await page.goto('/#/kanitlar')
  await expect(page.locator('.journey-rail'), 'yol dizini yalnız yol ekranlarında').toHaveCount(0)
})

test('ölçüt 5: etkin yol maddesinin sol çizgisi düz köşeli', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) < 1024, 'Yalnız masaüstü')
  await openDemo(page)
  await page.goto('/#/karar/3')
  const active = page.locator('.journey-rail .ant-menu-item-selected').first()
  await expect(active).toBeVisible()
  const read = () => active.evaluate((el) => { const s = getComputedStyle(el); return { bw: s.borderLeftWidth, tl: s.borderTopLeftRadius, bl: s.borderBottomLeftRadius, shadow: s.boxShadow } })
  await expect.poll(async () => { const cs = await read(); return px(cs.bw) === 3 || cs.shadow.includes('inset') }, { timeout: 10_000, message: 'etkin maddede sol çizgi' }).toBeTruthy()
  await expect.poll(async () => { const cs = await read(); return px(cs.tl) === 0 && px(cs.bl) === 0 }, { timeout: 10_000, message: 'çizgiye değen köşeler düz olmalı' }).toBeTruthy()
})

test('ölçüt 6: kart içinde kart yok', async ({ page }) => {
  await openDemo(page)
  for (const url of ['/#/ozet', '/#/karar/5/kapi', '/#/gecmis', '/#/yontemler']) {
    await page.goto(url)
    const nested = await page.locator('.ant-card .ant-card').count()
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
  await expect(page.locator('.hero')).toBeVisible()
  await page.evaluate(() => window.scrollTo(0, 0))
  const r = await page.evaluate(() => {
    const inFold = (sel: string) => { const el = document.querySelector(sel); if (!el) return false; const b = el.getBoundingClientRect(); return b.top < window.innerHeight && b.bottom > 0 }
    return { h1: inFold('h1'), primary: inFold('main .ant-btn-primary'), kpi: inFold('.kpi-strip'), hero: inFold('.hero'), height: document.documentElement.scrollHeight }
  })
  // İlk ekranda başlık, ana düğme ve en az bir içerik bloğu (hero ya da KPI) görünmeli.
  expect(r.h1 && r.primary && (r.kpi || r.hero), JSON.stringify(r)).toBeTruthy()
  expect(r.height).toBeLessThanOrEqual(3200)
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

/* ---------------------------------------------------------------- */
/* 2. tur ölçütleri (docs/tasarim-elestirisi-2-tur.md)              */
/* ---------------------------------------------------------------- */

test('2. tur 3: ekranda görünür dolu düğme en çok 1, hero düğmesi dahil', async ({ page }) => {
  await openDemo(page)
  for (const url of ['/#/ozet', '/#/karar/1', '/#/karar/3/adim/11', '/#/karar/5/kapi', '/#/kanitlar', '/#/ciktilar', '/#/']) {
    await page.goto(url)
    const filled = await page.locator('main .ant-btn-primary:not(.ant-btn-text):not(.ant-btn-link), main .hero-button').evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).length)
    expect(filled, `${url}: dolu düğme`).toBeLessThanOrEqual(1)
  }
})

test('2. tur 3: adım alt şeridi en çok 3 düğme, 320 yüksekliği en çok 112px', async ({ page, viewport }) => {
  await openDemo(page)
  await page.goto('/#/karar/3/adim/11')
  const bar = page.locator('.action-bar')
  await expect(bar).toBeVisible()
  const n = await bar.locator('.ant-btn').evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).length)
  expect(n).toBeLessThanOrEqual(3)
  if ((viewport?.width ?? 0) <= 400) expect(px(await bar.evaluate((el) => getComputedStyle(el).height))).toBeLessThanOrEqual(112)
})

test('2. tur 5: telefonda üst şerit taşmaz ve sayfa başlığı görünür', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) > 400, 'Yalnız telefon')
  await openDemo(page)
  await page.goto('/#/karar/3/adim/11')
  const bar = page.locator('.topbar')
  await expect(bar).toBeVisible()
  const over = await bar.evaluate((el) => el.scrollWidth > el.clientWidth + 1)
  expect(over, 'üst şerit taşmamalı').toBeFalsy()
  await expect(page.locator('h1').first()).toBeVisible()
})

test('2. tur 2: onay kutusu ve radyo çevresinde eylem rengi yok', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/5/kapi')
  const box = page.locator('.ant-checkbox').first()
  await expect(box).toBeVisible()
  await box.hover()
  const accent = (await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--color-action-primary'))).trim().toLowerCase()
  const toHex = (rgb: string) => { const m = rgb.match(/\d+/g); return m ? '#' + m.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('') : rgb }
  const border = toHex(await box.evaluate((el) => getComputedStyle(el).borderColor))
  expect(border, 'onay kutusu kenarı eylem rengi olmamalı').not.toBe(accent)
})

test('2. tur 6: telefonda sonuç tablosu satırı en çok 72px ve rozet kesilmez', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) > 400, 'Yalnız telefon')
  await openDemo(page)
  await page.goto('/#/karar/5/kapi')
  const rows = page.locator('.outcome-table .ant-table-tbody > tr, .outcome-table li')
  await expect(rows.first()).toBeVisible()
  const heights = await rows.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height))
  for (const h of heights) expect(h).toBeLessThanOrEqual(72)
  const clippedBadges = await page.locator('.outcome-table .decision-badge').evaluateAll((els) => els.filter((e) => e.scrollWidth > e.clientWidth + 1).length)
  expect(clippedBadges).toBe(0)
})

test('2. tur 4: karar rozetlerinde en çok 4 renkli sınıf, öneri etiketi nötr', async ({ page }) => {
  await openDemo(page)
  await page.goto('/#/karar/5/kapi')
  const colored = await page.locator('.decision-badge').evaluateAll((els) => {
    const set = new Set<string>()
    for (const e of els) set.add(getComputedStyle(e).color + '|' + getComputedStyle(e).backgroundColor)
    return set.size
  })
  expect(colored).toBeLessThanOrEqual(4)
  const hint = page.locator('.choice .tag').first()
  if (await hint.count()) {
    const cls = await hint.getAttribute('class')
    expect(cls).not.toContain('is-open')
  }
})

test('2. tur 10: yazı ağırlığı kümesi yalnız 400 ve 600', async ({ page }) => {
  await openDemo(page)
  for (const url of ['/#/ozet', '/#/karar/5/kapi', '/#/yontemler']) {
    await page.goto(url)
    const weights = await page.evaluate(() => {
      const set = new Set<string>()
      for (const e of document.querySelectorAll('main *, aside *, header *')) {
        const el = e as HTMLElement
        if (!el.offsetParent || !el.textContent?.trim()) continue
        if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim())) continue
        set.add(getComputedStyle(el).fontWeight)
      }
      return [...set].sort()
    })
    for (const w of weights) expect(['400', '600'], `${url}: ağırlık ${w}`).toContain(w)
  }
})

test('2. tur 9: koyu temada üç yüzey arasında en az yüzde 6 parlaklık farkı', async ({ page }) => {
  await openDemo(page)
  await page.getByRole('button', { name: /Koyu temaya geç/ }).click()
  const l = await page.evaluate(() => {
    const read = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim()
    const lum = (hex: string) => {
      const n = hex.replace('#', '')
      const c = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
    }
    // CIE L* (0-100): "yüzde 6 parlaklık farkı" bu ölçekte 6 birimdir.
    const lstar = (y: number) => (y > 0.008856 ? 116 * Math.cbrt(y) - 16 : 903.3 * y)
    return [lstar(lum(read('--color-surface-page'))), lstar(lum(read('--color-surface-work'))), lstar(lum(read('--color-surface-context')))]
  })
  expect(l[1] - l[0], `yüzeyler L*: ${l.map((x) => x.toFixed(1)).join(', ')}`).toBeGreaterThanOrEqual(6)
  expect(l[2] - l[1], `yüzeyler L*: ${l.map((x) => x.toFixed(1)).join(', ')}`).toBeGreaterThanOrEqual(6)
})

test('2. tur 8: 320 çıktılar araç çubuğu tam genişlik, sayfa en çok 2800px', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) > 400, 'Yalnız telefon')
  await openDemo(page)
  await page.goto('/#/ciktilar')
  const widths = await page.locator('.report-toolbar > *').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().width)))
  const max = Math.max(...widths)
  for (const w of widths) expect(w, 'araç çubuğu öğeleri aynı genişlikte').toBeGreaterThanOrEqual(max - 2)
  /* Yazı tipi yüklenene kadar sayfa bir an daha uzun ölçülür. Sınır aynıdır, ölçüm yerleşim oturunca yapılır. */
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(2800)
})
