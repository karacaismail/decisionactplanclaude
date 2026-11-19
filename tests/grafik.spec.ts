import { test, expect, type Page } from '@playwright/test'
import { openDemo, ready } from './uyarlanir/audit'
import { chartColors } from '../src/theme/tokens'

/*
 * UX turu 6: grafikler 320 ve 1280 pikselde, iki temada çizilir.
 * Her grafiğin Türkçe ekran okuyucu açıklaması, özeti ve veri tablosu vardır.
 * Çizimde grafik bantlarının renkleri görünür. Yazı boyutu birim testinde ölçülür.
 */

/** Grafikler ekrana girince yüklenir. Sayfa sonuna kadar kaydırılır. */
async function loadCharts(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y <= document.documentElement.scrollHeight; y += 240) {
      scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 60))
    }
    scrollTo(0, 0)
  })
}

const hex = (rgb: number[]) => `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`.toUpperCase()

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} tema`, () => {
    test.use({ colorScheme: scheme, reducedMotion: 'reduce' })

    test('göstergeler ekranında her grafik çizilir, okunur açıklama ve tablo taşır', async ({ page, hasTouch }) => {
      await openDemo(page, hasTouch)
      await page.goto('/#/gostergeler')
      await ready(page)
      const frames = page.locator('.insight-chart')
      const count = await frames.count()
      expect(count).toBeGreaterThanOrEqual(6)
      await loadCharts(page)
      await expect(page.locator('.insight-chart .chart-canvas canvas')).toHaveCount(count)

      const width = page.viewportSize()!.width
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0)

      for (let i = 0; i < count; i += 1) {
        const frame = frames.nth(i)
        const title = (await frame.locator('h3').innerText()).trim()
        const summary = (await frame.locator('.chart-summary').innerText()).trim()
        expect(summary, title).not.toBe('')
        /* ECharts kendi İngilizce açıklamasını yazmaz. Başlık ve özet okunur. */
        const label = await frame.locator('.chart-canvas [role="img"]').getAttribute('aria-label')
        expect(label, title).toBe(`${title}. ${summary}`)
        expect(label).not.toMatch(/This is a chart|chart about/i)
        /* Veri tablosu ekran okuyucuya her zaman açıktır. */
        expect(await frame.locator('table.chart-data-table tbody tr').count(), title).toBeGreaterThan(0)
        /* Grafik genişliği kapsayıcıyı aşmaz. */
        const box = await frame.locator('.chart-canvas canvas').first().boundingBox()
        expect(box!.width, title).toBeLessThanOrEqual(width)
      }

      /* Halka grafiğinde iki bandın rengi de çizilir. Komşu dilimler ayrışır. */
      const pie = frames.filter({ hasText: 'Kanıt basamağı dağılımı' }).locator('canvas').first()
      await pie.scrollIntoViewIfNeeded()
      await page.waitForTimeout(100)
      const shot = await pie.screenshot({ scale: 'css' })
      const colors = await page.evaluate(async (base64) => {
        const image = new Image()
        image.src = `data:image/png;base64,${base64}`
        await image.decode()
        const canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(image, 0, 0)
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        const seen = new Map<string, number>()
        for (let p = 0; p < data.length; p += 4) {
          const key = [data[p], data[p + 1], data[p + 2]].join(',')
          seen.set(key, (seen.get(key) ?? 0) + 1)
        }
        return [...seen.entries()].filter(([, n]) => n > 40).map(([k]) => k.split(',').map(Number))
      }, shot.toString('base64'))
      const drawn = new Set(colors.map(hex))
      const bands = chartColors[scheme]
      expect(drawn.has(bands.strong[0].toUpperCase()), `güçlü bant ${bands.strong[0]}`).toBe(true)
      expect(drawn.has(bands.mid[0].toUpperCase()), `orta bant ${bands.mid[0]}`).toBe(true)
    })

    test('kanıt defteri ve pano grafikleri de Türkçe açıklama taşır', async ({ page, hasTouch }) => {
      await openDemo(page, hasTouch)
      for (const url of ['/#/kanitlar', '/#/ozet']) {
        await page.goto(url)
        await ready(page)
        await loadCharts(page)
        const img = page.locator('.chart-canvas [role="img"]').first()
        await expect(img).toBeAttached()
        await expect.poll(() => img.getAttribute('aria-label')).not.toMatch(/This is a chart|chart about/i)
        expect(await img.getAttribute('aria-label')).toMatch(/\S/)
      }
    })
  })
}
