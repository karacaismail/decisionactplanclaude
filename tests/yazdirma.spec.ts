import { expect, test, type Page } from '@playwright/test'

/**
 * Yazdırma kabulü (UX turu 10). Ölçüm page.emulateMedia({ media: 'print' }) ile yapılır.
 * Her ekran yazdırılırken üst şerit, alt menü, çekmece ve sabit eylem şeridi gizlenir.
 * Koyu tema seçili olsa da kâğıda açık tema basılır.
 */
const SCREENS = ['/#/ozet', '/#/karar/5', '/#/karar/1/adim/00', '/#/gostergeler', '/#/ciktilar', '/#/projeler', '/#/destek']

async function openDemo(page: Page) {
  await page.goto('/')
  await expect(async () => {
    if (!/#\/ozet/.test(page.url())) await page.getByText('Kafe örneğini aç').first().click({ timeout: 2000 })
    await expect(page).toHaveURL(/#\/ozet/, { timeout: 2000 })
  }).toPass()
}

type PrintState = {
  hiddenChrome: string[]; shownChrome: string[]; fixed: string[]; body: string; small: string[]; lowContrast: string[]
}

function readPrintState(page: Page): Promise<PrintState> {
  return page.evaluate(() => {
    const rgb = (v: string) => (v.match(/[\d.]+/g) ?? ['0', '0', '0', '0']).map(Number)
    const lum = ([r, g, b]: number[]) => [r, g, b].map((c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }).reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0)
    const ratio = (a: number[], b: number[]) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05) }
    const backdrop = (el: Element) => { for (let n: Element | null = el; n; n = n.parentElement) { const c = rgb(getComputedStyle(n).backgroundColor); if ((c[3] ?? 1) >= 0.99) return c } return [255, 255, 255, 1] }
    const shown = (el: Element) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' }
    const chrome = ['.topbar', '.bottom-nav', '.product-nav', '.journey-rail', '.action-bar', '.shell-drawer']
    const present = chrome.filter((sel) => document.querySelector(sel))
    const fixed: string[] = []
    const small: string[] = []
    const lowContrast: string[] = []
    for (const el of document.querySelectorAll('body *')) {
      if (!shown(el)) continue
      const s = getComputedStyle(el)
      if (s.position === 'fixed') fixed.push(el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0])
      const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent!.trim()).join('').trim()
      if (!own || el.closest('svg, [aria-hidden="true"]')) continue
      const label = `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} "${own.slice(0, 30)}"`
      if (parseFloat(s.fontSize) < 14) small.push(`${label} ${s.fontSize}`)
      const r = ratio(rgb(s.color), backdrop(el))
      if (r < 4.5) lowContrast.push(`${label} ${r.toFixed(2)}`)
    }
    return {
      hiddenChrome: present.filter((sel) => !shown(document.querySelector(sel)!)),
      shownChrome: present.filter((sel) => shown(document.querySelector(sel)!)),
      fixed, body: getComputedStyle(document.body).backgroundColor, small, lowContrast,
    }
  })
}

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} tema yazdırma`, () => {
    test.use({ colorScheme: scheme })

    test('kâğıtta gezinme ve sabit şerit görünmez, metin okunur kalır', async ({ page }) => {
      await openDemo(page)
      for (const url of SCREENS) {
        await page.goto(url)
        await expect(page.locator('main').first()).toBeVisible()
        await expect(page.locator('.loading-state')).toHaveCount(0)
        await page.emulateMedia({ media: 'print' })
        // Tarayıcı yazdırma sorgusunun değiştiğini bir sonraki çizimde bildirir.
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
        const state = await readPrintState(page)
        expect(state.shownChrome, url).toEqual([])
        expect(state.fixed, url).toEqual([])
        expect(state.body, url).toBe('rgb(255, 255, 255)')
        expect(state.small, url).toEqual([])
        expect(state.lowContrast, url).toEqual([])
        await page.emulateMedia({ media: 'screen' })
        // Ekrana dönünce seçili tema geri gelir.
        await expect(page.locator('html'), url).toHaveAttribute('data-theme', scheme)
      }
    })
  })
}

test('ana metin kâğıt zemininde en az 7:1 karşıtlık taşır', async ({ page }) => {
  await openDemo(page)
  await expect(page.locator('main h1').first()).toBeVisible()
  await expect(page.locator('.loading-state')).toHaveCount(0)
  await page.emulateMedia({ media: 'print', colorScheme: 'dark' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  const ratios = await page.evaluate(() => {
    const rgb = (v: string) => (v.match(/[\d.]+/g) ?? []).map(Number)
    const lum = ([r, g, b]: number[]) => [r, g, b].map((c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }).reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0)
    return [...document.querySelectorAll('main h1, main h2, main p')].filter((el) => el.getBoundingClientRect().height > 0)
      .map((el) => (lum([255, 255, 255]) + 0.05) / (lum(rgb(getComputedStyle(el).color)) + 0.05))
  })
  expect(ratios.length).toBeGreaterThan(0)
  for (const r of ratios) expect(r).toBeGreaterThanOrEqual(7)
})

test.describe('gerçek yazdırma yolu', () => {
  test.use({ colorScheme: 'dark' })

  test('beforeprint olayı temayı aynı görevde açar, afterprint geri getirir', async ({ page }) => {
    await openDemo(page)
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    // Yazdır düğmesi ve Ctrl+P bu olayı gönderir. Tarayıcı düzeni olaydan hemen sonra kurar.
    const during = await page.evaluate(() => {
      window.dispatchEvent(new Event('beforeprint'))
      const root = document.documentElement
      return { theme: root.getAttribute('data-theme'), text: getComputedStyle(root).getPropertyValue('--color-text-primary').trim(), antd: getComputedStyle(document.querySelector('main')!).color }
    })
    expect(during.theme).toBe('light')
    expect(during.text.toUpperCase()).toBe('#0F1729')
    expect(during.antd).toBe('rgb(15, 23, 41)')
    const after = await page.evaluate(() => {
      window.dispatchEvent(new Event('afterprint'))
      return document.documentElement.getAttribute('data-theme')
    })
    expect(after).toBe('dark')
  })

  test('grafik eksen yazısı kâğıtta koyu tema rengiyle basılmaz', async ({ page }) => {
    await openDemo(page)
    await page.goto('/#/gostergeler')
    await expect(page.locator('main h1').first()).toBeVisible()
    await expect(page.locator('.loading-state')).toHaveCount(0)
    const canvas = page.locator('main canvas').first()
    await canvas.waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined)
    test.skip(!(await canvas.isVisible()), 'Bu genişlikte ilk ekranda grafik çizilmiyor')
    /** Koyu temanın ikincil yazı rengine (#AEB7CC) yakın piksel sayısı. Eksen ve açıklama yazısı bu rengi kullanır. */
    const darkAxisPixels = () => page.evaluate(async () => {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      let count = 0
      for (const canvas of document.querySelectorAll<HTMLCanvasElement>('main canvas')) {
        const ctx = canvas.getContext('2d')
        if (!ctx || !canvas.width || !canvas.height) continue
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 200 && Math.abs(data[i] - 0xAE) < 6 && Math.abs(data[i + 1] - 0xB7) < 6 && Math.abs(data[i + 2] - 0xCC) < 6) count += 1
        }
      }
      return count
    })
    // Ölçüm doğru rengi arıyor mu? Ekranda koyu tema eksen yazısı görünür.
    const onScreen = await darkAxisPixels()
    expect(onScreen).toBeGreaterThan(0)
    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')))
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
    // Açık temada halka dilimleri arasında 2 piksellik beyaz boşluk vardır (UX turu 6).
    // Lacivert dilimin beyaza yumuşak geçişi bu renge yakın birkaç piksel üretir. Eksen yazısı yüzlerce pikseldir.
    expect(await darkAxisPixels()).toBeLessThan(Math.max(1, onScreen / 20))
    await page.evaluate(() => window.dispatchEvent(new Event('afterprint')))
  })
})
