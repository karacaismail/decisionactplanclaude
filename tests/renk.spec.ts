import { expect, test, type Page } from '@playwright/test'

/**
 * Renk, giriş kenarı ve yükselti kabulü (UX turları 1, 5 ve 2).
 * Ölçüm gerçek tarayıcıda hesaplanan renklerle yapılır. Her test iki temada çalışır.
 */

async function openDemo(page: Page) {
  await page.goto('/')
  await expect(async () => {
    if (!/#\/ozet/.test(page.url())) await page.getByText('Kafe örneğini aç').first().click({ timeout: 2000 })
    await expect(page).toHaveURL(/#\/ozet/, { timeout: 2000 })
  }).toPass()
}

/**
 * Ekranın ölçüme hazır olmasını bekler. Sabit süre beklenmez.
 * Yükleme kartı kalkar, yazı tipleri iner ve sonlu animasyonlar biter.
 */
async function settled(page: Page) {
  await expect(page.locator('main').first()).toBeVisible()
  await expect(page.locator('.loading-state')).toHaveCount(0)
  await page.evaluate(async () => {
    await document.fonts.ready
    const finite = document.getAnimations().filter((a) => a.effect?.getComputedTiming().endTime !== Infinity)
    await Promise.all(finite.map((a) => a.finished.catch(() => undefined)))
  })
}

/** Sayfa içinde çalışan ölçüm yardımcıları. Her evaluate çağrısına metin olarak eklenir. */
const helpers = `
  const rgb = (v) => { const m = v.match(/[\\d.]+/g); if (!m) return [0, 0, 0, 0]; return [Number(m[0]), Number(m[1]), Number(m[2]), m[3] === undefined ? 1 : Number(m[3])] };
  const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05) };
  const over = (fg, bg) => fg[3] >= 0.99 ? fg : [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3])).concat(1);
  const backdrop = (el) => { for (let n = el; n; n = n.parentElement) { const c = rgb(getComputedStyle(n).backgroundColor); if (c[3] >= 0.99) return c } return [255, 255, 255, 1] };
  const shown = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' };
`

type Row = { name: string; ratio: number }

async function measure(page: Page, selector: string, mode: 'text' | 'border' | 'surface'): Promise<Row[]> {
  return page.evaluate(({ selector, mode, helpers }) => {
    // eslint-disable-next-line no-new-func
    const fn = new Function('selector', 'mode', `${helpers}
      const enabled = (el) => !el.closest('[class*="-disabled"], [disabled], [aria-disabled="true"]') && !el.querySelector(':disabled') && !el.matches(':disabled');
      return [...document.querySelectorAll(selector)].filter(shown).filter((el) => mode === 'surface' || enabled(el)).map((el) => {
        const s = getComputedStyle(el);
        const name = el.tagName.toLowerCase() + '.' + String(el.className).split(' ').slice(0, 2).join('.');
        if (mode === 'text') { const bg = backdrop(el); return { name, ratio: ratio(over(rgb(s.color), bg), bg) }; }
        if (mode === 'border') { const bg = backdrop(el.parentElement); return { name, ratio: ratio(over(rgb(s.borderTopColor), bg), bg) }; }
        const own = rgb(s.backgroundColor);
        const parent = backdrop(el.parentElement);
        const tone = own[3] >= 0.99 ? ratio(own, parent) : 1;
        return { name, ratio: s.boxShadow !== 'none' ? 99 : tone };
      });`)
    return fn(selector, mode)
  }, { selector, mode, helpers })
}

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} tema`, () => {
    test.use({ colorScheme: scheme })

    test('etkin gezinme metni ve dolu düğme metni en az 4,5:1', async ({ page }) => {
      await openDemo(page)
      for (const url of ['/#/ozet', '/#/karar/1', '/#/']) {
        await page.goto(url)
        await settled(page)
        const rows = [
          ...(await measure(page, '.bottom-nav [aria-current="page"]', 'text')),
          ...(await measure(page, '.product-nav a[aria-current="page"]', 'text')),
          ...(await measure(page, '.shell-menu .ant-menu-item-selected', 'text')),
          ...(await measure(page, 'main .ant-btn-primary', 'text')),
        ]
        expect(rows.length, `${url}: ölçülen öğe`).toBeGreaterThan(0)
        for (const row of rows) expect(row.ratio, `${url} ${row.name}`).toBeGreaterThanOrEqual(4.5)
      }
    })

    test('giriş kontrollerinin kenarı zemine karşı en az 3:1', async ({ page }) => {
      await openDemo(page)
      for (const url of ['/#/karar/1/adim/00', '/#/karar/5/kapi', '/#/']) {
        await page.goto(url)
        await settled(page)
        const rows = await measure(page, 'main :is(.ant-input-affix-wrapper, textarea.ant-input, input.ant-input:not(.ant-input-affix-wrapper input), .ant-select, .ant-input-number, .ant-picker, .ant-checkbox-inner, .ant-radio-inner)', 'border')
        expect(rows.length, `${url}: ölçülen kontrol`).toBeGreaterThan(0)
        for (const row of rows) expect(row.ratio, `${url} ${row.name}`).toBeGreaterThanOrEqual(3)
      }
    })

    test('giriş durumları: dinlenme, hata ve kapalı kenarı tokendan gelir', async ({ page }) => {
      await openDemo(page)
      const result = await page.evaluate(() => {
        const host = document.querySelector('main')!
        const make = (attrs: Record<string, string>) => {
          const el = document.createElement('input')
          el.className = 'ant-input'
          for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
          host.append(el)
          return getComputedStyle(el).borderTopColor
        }
        const token = (name: string) => {
          const probe = document.createElement('i')
          probe.style.color = `var(${name})`
          host.append(probe)
          return getComputedStyle(probe).color
        }
        return {
          rest: make({}), invalid: make({ 'aria-invalid': 'true' }), disabled: make({ disabled: '' }),
          input: token('--color-border-input'), harm: token('--color-status-harm'), border: token('--color-border'),
        }
      })
      expect(result.rest).toBe(result.input)
      expect(result.invalid).toBe(result.harm)
      expect(result.disabled).toBe(result.border)
    })

    test('kartlar gölge ya da yüzey tonuyla zeminden ayrılır', async ({ page }) => {
      await openDemo(page)
      for (const url of ['/#/ozet', '/#/', '/#/gostergeler', '/#/karar/1/adim/00']) {
        await page.goto(url)
        await settled(page)
        const rows = await measure(page, 'main :is(.ant-card, .pano-card, .k-card, .surface-card, .panel)', 'surface')
        expect(rows.length, `${url}: ölçülen kart`).toBeGreaterThan(0)
        for (const row of rows) expect(row.ratio, `${url} ${row.name}`).toBeGreaterThanOrEqual(1.1)
      }
    })

    test('iç içe aynı tondaki kart da ayrılır', async ({ page }) => {
      await openDemo(page)
      await settled(page)
      const result = await page.evaluate(() => {
        const outer = document.createElement('div')
        outer.className = 'surface-card'
        const inner = document.createElement('div')
        inner.className = 'surface-card'
        inner.textContent = 'İç kart'
        outer.append(inner)
        document.querySelector('main')!.append(outer)
        const probe = document.createElement('i')
        probe.style.color = 'var(--color-border)'
        outer.append(probe)
        const a = getComputedStyle(outer), b = getComputedStyle(inner)
        return { sameTone: a.backgroundColor === b.backgroundColor, shadow: b.boxShadow, border: getComputedStyle(probe).color, radius: b.borderTopLeftRadius }
      })
      expect(result.sameTone).toBe(true)
      expect(result.shadow).not.toBe('none')
      if (scheme === 'dark') {
        // Koyu temada ayrımı kenar tokenı rengindeki 1 piksellik yayılma çizer.
        expect(result.shadow).toContain(result.border)
        expect(result.shadow).toMatch(/0px 0px 0px 1px/)
      }
    })

    test('alt menü içerikten gölgeyle ayrılır', async ({ page }) => {
      await openDemo(page)
      const nav = page.locator('.bottom-nav')
      test.skip(!(await nav.isVisible()), 'Alt menü bu genişlikte görünmüyor')
      expect(await nav.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none')
    })
  })
}
