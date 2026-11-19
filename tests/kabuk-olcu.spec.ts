import { test, expect, type Page } from '@playwright/test'
import { openDemo, ready } from './uyarlanir/audit'

/*
 * UX turu 4: telefonda gezinme şeritleri ekranın en çok yüzde 15'ini kaplar.
 * Üst şerit tek satırdır. Alt menü hedefleri 44 pikselden küçük değildir.
 * Ölçümler her temada dikey telefon, yatay telefon ve masaüstü genişliğinde yapılır.
 */

const PORTRAIT = [
  { width: 320, height: 720 },
  { width: 360, height: 780 },
  { width: 390, height: 844 },
]

/** Görünen öğenin kutusu. Gizli öğe için null döner. */
async function chrome(page: Page) {
  return page.evaluate(() => {
    const box = (selector: string) => {
      const el = [...document.querySelectorAll<HTMLElement>(selector)].find((e) => e.getClientRects().length > 0)
      return el ? el.getBoundingClientRect() : null
    }
    const topbar = box('.topbar')
    const productNav = box('.product-nav')
    const bottomNav = box('.bottom-nav')
    const height = (topbar?.height ?? 0) + (productNav?.height ?? 0) + (bottomNav?.height ?? 0)
    /* Tek satır: üst şeritteki görünen her öğe aynı satırda durur. */
    const rows = new Set(
      [...document.querySelectorAll<HTMLElement>('.topbar > *')]
        .filter((e) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden')
        .map((e) => { const r = e.getBoundingClientRect(); return Math.round((r.top + r.bottom) / 16) }),
    )
    return {
      topbar: topbar?.height ?? 0,
      bottomNav: bottomNav?.height ?? 0,
      productNav: productNav?.height ?? 0,
      height,
      share: height / innerHeight,
      rows: rows.size,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }
  })
}

/** WCAG göreli parlaklık oranı. Renkler rgb() biçiminde gelir. */
async function contrast(page: Page, selector: string) {
  return page.locator(selector).first().evaluate((el) => {
    const rgb = (value: string) => (value.match(/[\d.]+/g) ?? []).slice(0, 4).map(Number)
    const lum = (c: number[]) => c.slice(0, 3).map((v) => { const n = v / 255; return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4 })
      .reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0)
    let bg: number[] = [255, 255, 255]
    for (let node: Element | null = el; node; node = node.parentElement) {
      const c = rgb(getComputedStyle(node).backgroundColor)
      if (c.length >= 3 && (c[3] ?? 1) > 0.99) { bg = c; break }
    }
    const fg = rgb(getComputedStyle(el).color)
    const [a, b] = [lum(fg), lum(bg)]
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
  })
}

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} tema`, () => {
    test.use({ colorScheme: scheme })

    test('dikey telefonda üst şerit tek satır, gezinme şeritleri en çok yüzde 15', async ({ page, hasTouch }) => {
      test.skip(!hasTouch, 'Telefon ölçüsü dokunmatik projelerde alınır.')
      await page.setViewportSize(PORTRAIT[0])
      await openDemo(page, hasTouch)
      for (const size of PORTRAIT) {
        await page.setViewportSize(size)
        await page.goto('/#/karar/3/adim/11')
        await ready(page)
        const m = await chrome(page)
        const at = `${size.width}x${size.height}`
        expect(m.rows, `${at}: üst şerit satır sayısı`).toBe(1)
        expect(m.topbar, `${at}: üst şerit yüksekliği`).toBeLessThanOrEqual(48)
        expect(m.bottomNav, `${at}: alt menü yüksekliği`).toBeLessThanOrEqual(56)
        expect(m.share, `${at}: şeritlerin ekran payı`).toBeLessThanOrEqual(0.15)
        expect(m.overflow, `${at}: yatay taşma`).toBeLessThanOrEqual(0)

        /* Ürün işareti telefonda da görünür ve 24 pikseldir. */
        const mark = await page.locator('.topbar .brand-mark').boundingBox()
        expect(mark, `${at}: ürün işareti`).not.toBeNull()
        expect(Math.round(mark!.width)).toBe(24)
        expect(Math.round(mark!.height)).toBe(24)

        /* Plan adı tek satırdaki dar bağlantıdadır. Tam ad erişilebilir addadır. */
        const planLink = page.getByRole('navigation', { name: 'Konum' }).getByRole('link', { name: 'Örnek: Mahalle kafesi. Planlara git', exact: true })
        await expect(planLink).toBeVisible()
        const planBox = await planLink.boundingBox()
        expect(planBox!.height, `${at}: plan bağlantısı yüksekliği`).toBeGreaterThanOrEqual(44)

        /* Kayıt durumu ekran okuyucuya tam metinle duyurulur. */
        await expect(page.locator('.topbar').getByRole('status')).toHaveText(/Kaydedildi|Kaydediliyor/)

        /* Alt menü: her hedef en az 44 piksel, etiket en az 14 piksel. */
        const items = await page.locator('.bottom-nav > a, .bottom-nav > button').evaluateAll((els) => els.map((e) => {
          const r = e.getBoundingClientRect()
          const label = e.querySelector('span')!
          return { w: r.width, h: r.height, font: parseFloat(getComputedStyle(label).fontSize), bottom: r.bottom }
        }))
        expect(items.length).toBe(5)
        for (const item of items) {
          expect(item.w).toBeGreaterThanOrEqual(44)
          expect(item.h).toBeGreaterThanOrEqual(44)
          expect(item.font).toBeGreaterThanOrEqual(14)
          expect(item.bottom).toBeLessThanOrEqual(size.height + 0.5)
        }
      }
    })

    test('alt menüde seçili öğe kenarsız bir hap ve okunur bir etiket kullanır', async ({ page, hasTouch }) => {
      test.skip(!hasTouch, 'Alt menü dokunmatik projelerde ölçülür.')
      await page.setViewportSize(PORTRAIT[0])
      await openDemo(page, hasTouch)
      const active = page.locator('.bottom-nav [aria-current="page"]')
      await expect(active).toHaveText('Pano')
      const pill = await active.locator('svg').evaluate((el) => {
        const s = getComputedStyle(el)
        const r = el.getBoundingClientRect()
        return { bg: s.backgroundColor, border: s.borderTopWidth, w: r.width, h: r.height }
      })
      const cell = await active.evaluate((el) => getComputedStyle(el).backgroundColor)
      expect(pill.bg).not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/)
      expect(pill.border).toBe('0px')
      expect(pill.w).toBeGreaterThan(pill.h)
      /* Hücrenin tamamı boyanmaz. Hap yalnız ikonun arkasındadır. */
      expect(cell).toMatch(/rgba\(0, 0, 0, 0\)|transparent/)
      expect(await contrast(page, '.bottom-nav [aria-current="page"] span')).toBeGreaterThanOrEqual(4.5)
    })

    test('yatay telefonda üst şerit tek satır ve kayınca yalnız alt menü kalır', async ({ page, hasTouch }) => {
      test.skip(!hasTouch, 'Telefon ölçüsü dokunmatik projelerde alınır.')
      await page.setViewportSize({ width: 844, height: 390 })
      await openDemo(page, hasTouch)
      await page.goto('/#/karar/3/adim/11')
      await ready(page)
      const m = await chrome(page)
      expect(m.rows).toBe(1)
      expect(m.topbar).toBeLessThanOrEqual(44)
      expect(m.bottomNav).toBeLessThanOrEqual(44)
      expect(m.overflow).toBeLessThanOrEqual(0)
      await page.evaluate(() => scrollTo(0, 400))
      const topbarBottom = await page.locator('.topbar').evaluate((el) => el.getBoundingClientRect().bottom)
      expect(topbarBottom, 'üst şerit kayınca ekrandan çıkar').toBeLessThanOrEqual(0)
      /* Menü düğmesi yatayda da üst şeritte görünür. */
      await expect(page.getByRole('button', { name: 'Menüyü aç', exact: true })).toBeVisible()
    })

    test('320 pikselde çekmece açıkken sağda dokunulabilir perde kalır', async ({ page, hasTouch }) => {
      test.skip(!hasTouch, 'Çekmece telefonda alt menüden açılır.')
      await page.setViewportSize(PORTRAIT[0])
      await openDemo(page, hasTouch)
      const trigger = page.locator('.bottom-nav').getByRole('button', { name: 'Menü', exact: true })
      await trigger.tap()
      const panel = page.locator('.shell-drawer .ant-drawer-content-wrapper')
      await expect(panel).toBeVisible()
      await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'))
      const right = await panel.evaluate((el) => el.getBoundingClientRect().right)
      expect(320 - right, 'perdenin görünen genişliği').toBeGreaterThanOrEqual(56)
      await page.touchscreen.tap(Math.round((right + 320) / 2), 360)
      await expect(panel).toBeHidden()
      await expect(trigger).toBeFocused()
    })

    test('üst şerit öğelerine klavyeyle sırayla ulaşılır ve odak işareti çevrelemez', async ({ page, browserName, hasTouch }) => {
      test.skip(!hasTouch, 'Telefon ölçüsü dokunmatik projelerde alınır.')
      await page.setViewportSize(PORTRAIT[0])
      await openDemo(page, hasTouch)
      const key = browserName === 'webkit' ? 'Alt+Tab' : 'Tab'
      const names: string[] = []
      /* Yeniden yükleme odağı belgenin başına alır. İlk Tab üst şeritten başlar. */
      await page.reload()
      await ready(page)
      for (let i = 0; i < 4; i += 1) {
        await page.keyboard.press(key)
        const focus = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement
          const s = getComputedStyle(el)
          const marker = getComputedStyle(el, '::before')
          return {
            name: el.getAttribute('aria-label') ?? el.textContent?.trim() ?? '',
            outline: s.outlineStyle,
            shadow: s.boxShadow,
            markerWidth: marker.width,
            markerContent: marker.content,
            inTopbar: Boolean(el.closest('.topbar')),
          }
        })
        expect(focus.inTopbar, `${i + 1}. sekme durağı üst şeritte`).toBe(true)
        expect(focus.outline).toBe('none')
        expect(focus.shadow).toBe('none')
        expect(focus.markerContent).not.toBe('none')
        expect(focus.markerWidth).toBe('3px')
        names.push(focus.name)
      }
      expect(names[0]).toBe('Girişimci Aksiyon Planı, panoya git')
      expect(names[1]).toBe('Örnek: Mahalle kafesi. Planlara git')
      expect(names[2]).toMatch(/^Ara\. Kısayol/)
      expect(names[3]).toMatch(/temaya geç$/)
    })
  })
}
