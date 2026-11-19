import { expect, test, type Page } from '@playwright/test'

/**
 * Kimlik kabulü (UX turu 8). Simge, bildirim dosyası ve tarayıcı çubuğu rengi.
 * Tarayıcı çubuğunun rengi üst şeridin rengiyle aynıdır. Tema elle değişince renk de değişir.
 */
const hex = (rgb: string) => '#' + (rgb.match(/\d+/g) ?? []).slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('').toUpperCase()

async function themeColorMatchesTopbar(page: Page) {
  const state = await page.evaluate(() => {
    const dark = matchMedia('(prefers-color-scheme: dark)').matches
    const active = [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')].find((m) => matchMedia(m.media || 'all').matches)
    return { dark, content: active?.content ?? '', topbar: getComputedStyle(document.querySelector('.topbar')!).backgroundColor }
  })
  expect(state.content.toUpperCase()).toBe(hex(state.topbar))
  return state
}

test('ilk açılışta 4xx yanıt yoktur, simge ve bildirim dosyası yüklenir', async ({ page, request }) => {
  const failures: string[] = []
  page.on('response', (r) => { if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`) })
  await page.goto('/')
  await expect(page.locator('main').first()).toBeVisible()
  await page.evaluate(() => document.fonts.ready)

  const svgIcon = page.locator('link[rel="icon"][type="image/svg+xml"]')
  await expect(svgIcon).toHaveCount(1)
  const iconUrl = await svgIcon.evaluate((l: HTMLLinkElement) => l.href)
  const icon = await request.get(iconUrl)
  expect(icon.status()).toBe(200)
  expect(icon.headers()['content-type']).toContain('image/svg+xml')

  for (const rel of ['icon[sizes="32x32"]', 'apple-touch-icon']) {
    const url = await page.locator(`link[rel=${rel.startsWith('icon') ? 'icon' : rel}]${rel.startsWith('icon') ? '[sizes="32x32"]' : ''}`).evaluate((l: HTMLLinkElement) => l.href)
    expect((await request.get(url)).status(), rel).toBe(200)
  }

  const manifestUrl = await page.locator('link[rel="manifest"]').evaluate((l: HTMLLinkElement) => l.href)
  const manifest = await (await request.get(manifestUrl)).json()
  expect(manifest.short_name).toBeTruthy()
  const sizes = manifest.icons.map((i: { sizes: string; purpose?: string }) => `${i.sizes}:${i.purpose ?? 'any'}`)
  expect(sizes).toEqual(expect.arrayContaining(['192x192:any', '512x512:any', '512x512:maskable']))
  for (const i of manifest.icons) expect((await request.get(new URL(i.src, manifestUrl).href)).status(), i.src).toBe(200)

  expect(failures).toEqual([])
})

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} sistem teması`, () => {
    test.use({ colorScheme: scheme })
    test('tarayıcı çubuğu rengi üst şeritle aynıdır, elle tema seçiminde de değişir', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('.topbar')).toBeVisible()
      const first = await themeColorMatchesTopbar(page)
      expect(first.dark).toBe(scheme === 'dark')

      // Sistem seçiminden sonra ilk basış aynı temayı elle seçebilir. Renk değişene kadar en çok iki kez basılır.
      const topbar = async () => hex(await page.locator('.topbar').evaluate((el) => getComputedStyle(el).backgroundColor))
      for (let i = 0; i < 2 && (await topbar()) === hex(first.topbar); i += 1) {
        await page.getByRole('button', { name: /temaya geç/ }).click()
        await themeColorMatchesTopbar(page)
      }
      expect(await topbar()).not.toBe(hex(first.topbar))
      await themeColorMatchesTopbar(page)
    })
  })
}

test('üst şeritteki işaret ürünün kendi çizimidir', async ({ page }) => {
  await page.goto('/')
  const mark = page.locator('.topbar .brand-mark')
  test.skip(!(await mark.isVisible()), 'Bu genişlikte işaret gizli')
  const d = await mark.locator('path').getAttribute('d')
  expect(d).toBe('M5 17.5h4v-4h4v-4h3.5M19 5.5v13')
})
