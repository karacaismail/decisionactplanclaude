import { readFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'

/*
 * CSS teslim testi. Mimari: docs/css-mimarisi.md
 * Test gerçek ağ isteklerine bakar. Dosyanın kodda durması yetmez, tarayıcının onu istemesi gerekir.
 * Geliştirme sunucusunda kaynak yolu eşlenir. Üretimde Vite manifest dosyası kullanılır.
 */

const manifestPath = process.env.TESLIM_MANIFEST
const manifest: Record<string, { file: string; css?: string[] }> | null = manifestPath ? JSON.parse(readFileSync(manifestPath, 'utf8')) : null

/* Kaynak CSS dosyasının tarayıcıdaki adresini döndürür. */
function urlsFor(source: string): string[] {
  if (!manifest) return [`/${source}`]
  const direct = manifest[source]
  if (direct) return [`/${direct.file}`]
  const name = source.split('/').pop()!.replace(/\.css$/, '')
  return Object.values(manifest).flatMap((entry) => entry.css ?? []).filter((file) => file.includes(`/${name}-`)).map((file) => `/${file}`)
}

function track(page: Page) {
  const seen: string[] = []
  page.on('request', (request) => seen.push(new URL(request.url()).pathname))
  return {
    requested: (source: string) => urlsFor(source).some((url) => seen.some((path) => path.endsWith(url) || path === url)),
    seen,
  }
}

const TOUCH = 'src/styles/giris/dokunma.css'
const MOUSE = 'src/styles/giris/fare.css'

test.describe('giriş katmanı', () => {
  test('cihazın giriş türüne uyan katman iner, öteki inmez', async ({ page }, info) => {
    const touch = Boolean(info.project.use.hasTouch)
    const net = track(page)
    await page.goto('/')
    const layer = touch ? 'dokunma' : 'fare'
    await expect(page.locator('html')).toHaveAttribute(`data-giris-${layer}`, 'hazir')
    await page.waitForLoadState('networkidle')
    expect(net.requested(touch ? TOUCH : MOUSE), `${layer} katmanı istenmeli`).toBe(true)
    expect(net.requested(touch ? MOUSE : TOUCH), 'öteki katman istenmemeli').toBe(false)
  })

  test('hibrit cihaz iki katmanı da indirir', async ({ page }) => {
    await page.addInitScript(() => {
      const original = window.matchMedia.bind(window)
      window.matchMedia = (query: string) => {
        if (/any-pointer|any-hover/.test(query)) {
          return { matches: true, media: query, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false } as MediaQueryList
        }
        return original(query)
      }
    })
    const net = track(page)
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-giris-dokunma', 'hazir')
    await expect(page.locator('html')).toHaveAttribute('data-giris-fare', 'hazir')
    expect(net.requested(TOUCH)).toBe(true)
    expect(net.requested(MOUSE)).toBe(true)
  })
})

test.describe('ekran katmanı', () => {
  test('Planlar ekranı form ekranının CSS dosyasını indirmez, form ekranı açılınca indirir', async ({ page }) => {
    const net = track(page)
    await page.goto('/')
    await page.getByText('Örnek planı aç', { exact: true }).first().click()
    await expect(page).toHaveURL(/#\/ozet/)
    await page.goto('/#/')
    await page.waitForLoadState('networkidle')
    expect(net.requested('src/styles/ekran/WorkScreen.css'), 'Planlar ekranında form CSS inmemeli').toBe(false)
    await page.goto('/#/karar/1/adim/01')
    await expect(page.locator('.work-page')).toBeVisible()
    await page.waitForLoadState('networkidle')
    expect(net.requested('src/styles/ekran/WorkScreen.css'), 'Form ekranında form CSS inmeli').toBe(true)
  })

  test('ilk açılışta ekranlara özel CSS inmez', async ({ page }) => {
    const net = track(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const screenCss = net.seen.filter((path) => /\/styles\/ekran\/|\/assets\/[A-Z][A-Za-z]+(Screen|Content)-[^/]+\.css$/.test(path))
    const allowed = ['PlansScreen']
    expect(screenCss.filter((path) => !allowed.some((name) => path.includes(name)))).toEqual([])
  })
})
