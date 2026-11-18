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
    await page.getByText('Kafe örneğini aç', { exact: true }).first().click()
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

test.describe('hedef takibi', () => {
  test('anahtar kapalıyken panelin kodu ve CSS dosyası inmez, açılınca iner', async ({ page }) => {
    const net = track(page)
    await page.goto('/')
    await page.getByText('Kafe örneğini aç', { exact: true }).first().click()
    await expect(page).toHaveURL(/#\/ozet/)
    /* Strateji uygulamayı açmak için hazırlık kararı ve strateji belgesi yazılır. */
    await page.evaluate(() => {
      const key = 'decisionactplan-v1'
      const raw = JSON.parse(localStorage.getItem(key) ?? '{}')
      const plan = raw.state.plans[raw.state.currentId]
      const done = (values: Record<string, unknown>) => ({ values, status: 'tamam', updatedAt: new Date().toISOString() })
      plan.transitions = [{ id: 'g', outcome: 'hazir', suggested: 'hazir', reason: 'Dayanaklar incelendi.', decidedBy: 'Kurucu', decidedAt: new Date().toISOString(), reviewed: true, mandatoryMet: 9, mandatoryTotal: 9, supportingMet: 5, supportingTotal: 7, level: 3, revision: plan.revision }]
      plan.steps['S21'] = done({ diagnosis: 'Öğleden sonra dükkân boş.', diagnosisWhy: 'Satış sabah geliyor.' })
      plan.steps['S22'] = done({ options: [{ name: 'Durakta satış' }, { name: 'Öğle menüsü' }] })
      plan.steps['S23'] = done({ tests: [{ option: 'Durakta satış', mustBeTrue: 'Yolcu durur.', weakest: 'Yolcu beklemez.' }, { option: 'Öğle menüsü', mustBeTrue: 'Çalışan çıkar.', weakest: 'Fiyat yüksek.' }] })
      plan.steps['19'] = done({ chosenPath: 'Durakta satış', choiceReason: 'Kanıt burada.', winningAim: 'İlk tercih olmak.', playField: 'Durak çevresi.', givenUp: 'Öğle satışı' })
      plan.steps['S25'] = done({ moves: [{ move: 'Durağa tezgâh kur', capability: 'Hızlı servis' }] })
      plan.steps['20'] = done({ dossier1: 'a', dossier2: 'a', dossier3: 'a', dossier4: 'a', dossier5: 'a', dossier6: 'a', dossier7: 'a', dossier8: 'a', dossier9: 'a', dossier11: 'a', counterView: 'a', qualityCheck: ['1', '2', '3', '4', '5'], approvedBy: 'Kurucu' })
      localStorage.setItem(key, JSON.stringify(raw))
    })
    /* Yalnız adresin # kısmı değişirse sayfa yeniden yüklenmez. Kayıt ancak yeniden yüklemeyle okunur. */
    await page.goto('/#/uygulama')
    await page.reload()
    const toggle = page.getByRole('switch', { name: 'Hedef takibini aç' })
    await expect(toggle).toBeVisible()
    await page.waitForLoadState('networkidle')
    const panelCode = () => net.seen.some((path) => path.endsWith('/src/components/HedefTakibi.tsx') || /\/assets\/HedefTakibi-[^/]+\.js$/.test(path))
    expect(panelCode(), 'kapalıyken panel kodu inmemeli').toBe(false)
    expect(net.requested('src/styles/bilesen/HedefTakibi.css'), 'kapalıyken panel CSS dosyası inmemeli').toBe(false)
    await toggle.click()
    await expect(page.getByRole('region', { name: 'Hedef takibi kayıtları' })).toBeVisible()
    await page.waitForLoadState('networkidle')
    expect(panelCode(), 'açılınca panel kodu inmeli').toBe(true)
    expect(net.requested('src/styles/bilesen/HedefTakibi.css'), 'açılınca panel CSS dosyası inmeli').toBe(true)
  })
})

test.describe('komut paleti', () => {
  test('palet ilk açılışta inmez, Ara düğmesiyle iner ve açılır', async ({ page }) => {
    const net = track(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const palette = () => net.seen.some((path) => path.endsWith('/src/components/CommandPalette.tsx') || /\/assets\/CommandPalette-[^/]+\.js$/.test(path))
    expect(palette(), 'palet ilk açılışta inmemeli').toBe(false)
    await page.getByRole('button', { name: /^Ara\. Kısayol/ }).click()
    await expect(page.getByRole('dialog', { name: 'Komut paleti' })).toBeVisible()
    await expect(page.getByPlaceholder('Adım, karar ya da yöntem ara…')).toBeFocused()
    expect(palette(), 'palet açılınca inmeli').toBe(true)
  })

  test('kısayol tuşu paleti ilk seferde de açar', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('Control+k')
    await expect(page.getByRole('dialog', { name: 'Komut paleti' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'Komut paleti' })).toBeHidden()
  })
})
