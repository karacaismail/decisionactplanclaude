import { expect, test, type Page } from '@playwright/test'

/**
 * Yazı ölçeği kabulü (UX turu 3). Ölçüm tarayıcının hesapladığı değerlerle yapılır.
 * Ölçek: 14, 16, 18, 20, 24 ve 36 piksel. Sayfa başlığı 28 ile 36 piksel arasında büyür.
 */
const SCALE = [14, 16, 18, 20, 24, 36]
const SCREENS = ['/#/', '/#/ozet', '/#/karar/1', '/#/karar/1/adim/00', '/#/gostergeler', '/#/ciktilar', '/#/projeler', '/#/destek', '/#/destek/eslesme']

async function openDemo(page: Page) {
  await page.goto('/')
  await expect(async () => {
    if (!/#\/ozet/.test(page.url())) await page.getByText('Kafe örneğini aç').first().click({ timeout: 2000 })
    await expect(page).toHaveURL(/#\/ozet/, { timeout: 2000 })
  }).toPass()
}

async function settled(page: Page) {
  await expect(page.locator('main').first()).toBeVisible()
  await expect(page.locator('.loading-state')).toHaveCount(0)
  await page.evaluate(() => document.fonts.ready)
}

type Text = { sample: string; size: number; tag: string; cls: string; title: boolean }

/** Kendi metni olan görünür öğelerin hesaplanan yazı boyutu. */
function readTexts(page: Page): Promise<Text[]> {
  return page.evaluate(() => {
    const out: { sample: string; size: number; tag: string; cls: string; title: boolean }[] = []
    for (const el of document.querySelectorAll('body *')) {
      if (el.closest('svg, script, style, noscript, [aria-hidden="true"], .sr-only, .visually-hidden, canvas')) continue
      const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent!.trim()).join(' ').trim()
      if (!own) continue
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      if (!r.width || !r.height || s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) === 0) continue
      if (r.width <= 1 && r.height <= 1) continue
      // 28 ile 36 piksel arası yalnız başlık ve özet sayısı içindir.
      const title = !!el.closest('h1, h2, .ant-statistic-content, .calc-value, .kpi-value')
      out.push({ sample: own.slice(0, 40), size: parseFloat(s.fontSize), tag: el.tagName.toLowerCase(), cls: String(el.className).split(' ').slice(0, 2).join('.'), title })
    }
    return out
  })
}

test('görünen her yazı en az 14 piksel ve ölçekte', async ({ page }) => {
  await openDemo(page)
  for (const url of SCREENS) {
    await page.goto(url)
    await settled(page)
    const texts = await readTexts(page)
    expect(texts.length, `${url}: ölçülen yazı`).toBeGreaterThan(5)
    const bad = texts.filter((t) => t.size < 14 || !(SCALE.includes(Math.round(t.size * 100) / 100) || (t.title && t.size >= 28 && t.size <= 36)))
    expect(bad.map((t) => `${url} ${t.tag}.${t.cls} "${t.sample}" ${t.size}px`)).toEqual([])
  }
})

test('gövde Outfit kullanır ve sayfa başlığı rahat satır aralığı taşır', async ({ page }) => {
  await openDemo(page)
  for (const url of ['/#/ozet', '/#/karar/1/adim/00']) {
    await page.goto(url)
    await settled(page)
    const result = await page.evaluate(() => {
      const body = getComputedStyle(document.body)
      const h1 = [...document.querySelectorAll('h1')].filter((el) => el.getBoundingClientRect().height > 0).map((el) => {
        const s = getComputedStyle(el)
        const size = parseFloat(s.fontSize)
        const spacing = s.letterSpacing === 'normal' ? 0 : parseFloat(s.letterSpacing)
        return { cls: el.className, size, ratio: parseFloat(s.lineHeight) / size, spacingEm: spacing / size }
      })
      return { family: body.fontFamily, bodySize: parseFloat(body.fontSize), bodySpacing: body.letterSpacing, h1 }
    })
    expect(result.family).toMatch(/^"?Outfit"?,/)
    expect(result.bodySize).toBe(16)
    expect(['normal', '0px']).toContain(result.bodySpacing)
    expect(result.h1.length, `${url}: h1`).toBeGreaterThan(0)
    for (const h of result.h1) {
      expect(h.size, `${url} h1.${h.cls}`).toBeGreaterThanOrEqual(28)
      expect(h.size, `${url} h1.${h.cls}`).toBeLessThanOrEqual(36)
      expect(h.ratio, `${url} h1.${h.cls}`).toBeGreaterThanOrEqual(1.2)
      expect(h.spacingEm, `${url} h1.${h.cls}`).toBeGreaterThanOrEqual(-0.02)
    }
  }
})

test('sayfa portaldaki açılır pencerede de Outfit kullanır', async ({ page }) => {
  await openDemo(page)
  // Ant Design dışındaki öğe gövdeden yazı tipini miras alır.
  const family = await page.evaluate(() => {
    const el = document.createElement('div')
    el.textContent = 'Portal'
    document.body.append(el)
    return getComputedStyle(el).fontFamily
  })
  expect(family).toMatch(/^"?Outfit"?,/)
})
