import { readFileSync, writeFileSync } from 'node:fs'
import { release } from 'node:os'
import { expect, test as base, type Locator, type Page, type TestInfo } from '@playwright/test'

/** Üretim sunucusunu lider başlatır. Bu dosya derleme veya sunucu başlatmaz. */
const productionURL = process.env.TESLIM_BASE_URL
const manifestPath = process.env.TESLIM_MANIFEST
if (Boolean(productionURL) !== Boolean(manifestPath)) {
  throw new Error('Üretim testi için TESLIM_BASE_URL ve TESLIM_MANIFEST birlikte verilmelidir.')
}
const productionBase = productionURL ? `${productionURL.replace(/\/$/, '')}/` : undefined

interface Chunk {
  file: string
  name?: string
  src?: string
  isEntry?: boolean
}

function readManifest(): Record<string, Chunk> | undefined {
  if (!manifestPath) return undefined
  const value: unknown = JSON.parse(readFileSync(manifestPath, 'utf8'))
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Derleme dosya listesi geçersiz.')
  const result: Record<string, Chunk> = {}
  for (const [key, entry] of Object.entries(value)) {
    if (!entry || typeof entry !== 'object' || !('file' in entry) || typeof entry.file !== 'string') {
      throw new Error(`Derleme dosya kaydı geçersiz: ${key}`)
    }
    result[key] = {
      file: entry.file,
      name: 'name' in entry && typeof entry.name === 'string' ? entry.name : undefined,
      src: 'src' in entry && typeof entry.src === 'string' ? entry.src : undefined,
      isEntry: 'isEntry' in entry && entry.isEntry === true,
    }
  }
  return result
}

const manifest = readManifest()
const screenNames = [
  'PlansScreen', 'StartScreen', 'OverviewScreen', 'DecisionScreen', 'WorkScreen',
  'ReviewScreen', 'EvidenceScreen', 'TasksScreen', 'OutputsScreen', 'HistoryScreen',
  'TakeoverScreen', 'InsightsScreen', 'MethodsScreen', 'TransitionScreen', 'HandoffScreen',
  'StrategyScreen', 'ExecutionScreen', 'FoundationScreen', 'AssumptionsScreen',
] as const
type Screen = typeof screenNames[number]
type Resource = Screen | 'charts' | 'reports'

function productionFiles(resource: Resource): string[] {
  if (!manifest) return []
  const files = Object.entries(manifest).filter(([key, chunk]) => {
    if (resource === 'charts') return chunk.name === 'echarts'
    if (resource === 'reports') {
      return chunk.name === 'report-build' || key.startsWith('src/reports/') || chunk.src?.startsWith('src/reports/')
    }
    return key === `src/screens/${resource}.tsx` || chunk.src === `src/screens/${resource}.tsx`
  }).map(([, chunk]) => new URL(chunk.file, productionBase).pathname)
  if (files.length === 0) throw new Error(`Derleme dosya listesinde parça bulunamadı: ${resource}`)
  return files
}

// Eksik veya eskimiş dosya listesi, boş eşleşmeyle yanlış başarı üretmemeli.
const productionResources = new Map<Resource, string[]>(
  [...screenNames, 'charts' as const, 'reports' as const].map((resource) => [resource, productionFiles(resource)]),
)

function matches(resource: Resource, url: string): boolean {
  const parsed = new URL(url)
  const path = parsed.pathname
  if (manifest) return parsed.origin === new URL(productionBase!).origin && productionResources.get(resource)!.includes(path)
  if (resource === 'charts') return /echarts|zrender/i.test(path)
  if (resource === 'reports') return path.startsWith('/src/reports/')
  return path === `/src/screens/${resource}.tsx`
}

interface Network {
  requests: { url: string; type: string }[]
  responses: { url: string; status: number; contentType: string }[]
  failed: { url: string; error?: string }[]
  errors: string[]
  checks: { resource: Resource; assertion: 'absent' | 'loaded'; requestCount: number; matchingRequests: string[] }[]
}

function assertProductionDelivery(chunks: Record<string, Chunk>, network: Network, entries: string[]) {
  const origin = new URL(productionBase!).origin
  const sameOrigin = (url: string) => new URL(url).origin === origin
  const entry = chunks['index.html']
  expect(entry?.isEntry, 'Manifest entry must identify index.html.').toBe(true)
  const expectedEntry = new URL(entry.file, productionBase).href
  // Dosya adındaki hash, sunulan HTML ile aynı derlemeye ait olmalı.
  expect(entries.filter(sameOrigin), 'Served entry hash must match the manifest entry.').toEqual([expectedEntry])
  const known = new Set(Object.values(chunks)
    .filter(({ file }) => /\.(?:m?js)$/.test(file))
    .map(({ file }) => new URL(file, productionBase).href))
  const scripts = new Set([
    ...network.requests.filter(({ url, type }) => type === 'script' || /\.(?:m?js)$/.test(new URL(url).pathname)).map(({ url }) => url),
    ...network.responses.filter(({ contentType }) => /(?:java|ecma)script/i.test(contentType)).map(({ url }) => url),
  ].filter(sameOrigin))
  expect([...scripts].filter((url) => !known.has(url)), 'Unknown same-origin script requests must fail.').toEqual([])
  expect(network.responses.some(({ url, status, contentType }) =>
    url === expectedEntry && status === 200 && /(?:java|ecma)script/i.test(contentType)),
  'Manifest entry must actually be served as JavaScript.').toBe(true)
}

async function servedEntries(page: Page) {
  return page.locator('script[type="module"][src]').evaluateAll((scripts) =>
    scripts.map((script) => (script as HTMLScriptElement).src))
}

const test = base.extend<{ network: Network }>({
  network: [async ({ page, browser }, use, testInfo) => {
    const network: Network = { requests: [], responses: [], failed: [], errors: [], checks: [] }
    page.on('request', (request) => network.requests.push({ url: request.url(), type: request.resourceType() }))
    page.on('response', (response) => network.responses.push({
      url: response.url(), status: response.status(), contentType: response.headers()['content-type'] ?? '',
    }))
    page.on('requestfailed', (request) => network.failed.push({ url: request.url(), error: request.failure()?.errorText }))
    page.on('pageerror', (error) => network.errors.push(error.message))
    await use(network)
    const entries = manifest && !page.isClosed() ? await servedEntries(page) : []
    const observed = page.isClosed() ? null : await page.evaluate(() => ({
      viewport: { width: innerWidth, height: innerHeight },
      maxTouchPoints: navigator.maxTouchPoints,
      coarsePointer: matchMedia('(pointer: coarse)').matches,
      hover: matchMedia('(hover: hover)').matches,
      timings: performance.getEntriesByType('resource').map((entry) => {
        const resource = entry as PerformanceResourceTiming
        return { url: resource.name, transferSize: resource.transferSize, encodedBodySize: resource.encodedBodySize, decodedBodySize: resource.decodedBodySize }
      }),
    })).catch(() => null)
    const evidencePath = testInfo.outputPath('delivery-network.json')
    writeFileSync(evidencePath, JSON.stringify({
        mode: manifest ? 'production' : 'development', manifestPath,
        environment: { browser: browser.browserType().name(), version: browser.version(), os: process.platform, osRelease: release(), configuredViewport: testInfo.project.use.viewport },
        isolation: 'Fresh Playwright context. Service workers blocked. No reused storage state.',
        observation: 'Navigation through the final explicit UI or resource assertion.',
        productionResources: Object.fromEntries(productionResources), servedEntries: entries, ...network, observed,
      }, null, 2))
    await testInfo.attach('delivery-network', { path: evidencePath, contentType: 'application/json' })
    if (manifest) assertProductionDelivery(manifest, network, entries)
  }, { auto: true }],
})

test.use({ serviceWorkers: 'block', ...(productionBase ? { baseURL: productionBase } : {}) })

function requested(network: Network, resource: Resource): string[] {
  return network.requests.filter(({ url }) => matches(resource, url)).map(({ url }) => url)
}

function expectNoRequest(network: Network, resource: Resource) {
  network.checks.push({ resource, assertion: 'absent', requestCount: network.requests.length, matchingRequests: requested(network, resource) })
  expect(requested(network, resource), `${resource} henüz istenmemeli.`).toEqual([])
}

function expectOnlyScreens(network: Network, visited: Screen[]) {
  for (const screen of screenNames) {
    if (!visited.includes(screen)) expectNoRequest(network, screen)
  }
}

async function expectLoaded(network: Network, resource: Resource) {
  await expect.poll(() => network.responses.some(({ url, status }) => matches(resource, url) && status === 200), {
    message: `${resource} başarıyla yüklenmeli.`,
  }).toBe(true)
  network.checks.push({ resource, assertion: 'loaded', requestCount: network.requests.length, matchingRequests: requested(network, resource) })
  if (manifest) {
    for (const response of network.responses.filter(({ url }) => matches(resource, url))) {
      expect(response.contentType).toMatch(/(?:application|text)\/javascript/)
    }
  }
}

async function openPlans(page: Page) {
  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'Planlar', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Yeni plan', exact: true })).toBeEnabled()
}

async function createPlan(page: Page) {
  await openPlans(page)
  await page.getByRole('button', { name: 'Yeni plan', exact: true }).click()
  await page.getByPlaceholder('Örneğin Mahalle kafesi').fill('Ağ denetimi planı')
  await page.getByRole('button', { name: 'Oluştur', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Bugün nereden başlayacaksınız?' })).toBeVisible()
}

async function menuLink(page: Page, name: string) {
  const menuButton = page.getByRole('button', { name: 'Menüyü aç', exact: true })
  if (await menuButton.isVisible() && !await page.getByRole('dialog').isVisible()) await menuButton.click()
  const link = page.getByRole('navigation', { name: 'Ana bölümler' }).getByRole('link', { name, exact: true })
  await expect(link).toBeVisible()
  return link
}

/** Sentetik pointerdown, tıklamadan önceki indirmeyi ayrı ölçer. Gerçek tap ayrıca sınanır. */
async function touchIntent(link: Locator) {
  await link.dispatchEvent('pointerdown', { pointerType: 'touch', pointerId: 1, isPrimary: true, button: 0, buttons: 1 })
}

async function captureState(page: Page, testInfo: TestInfo, name: string) {
  const path = testInfo.outputPath(`${name}.png`)
  await page.screenshot({ path, animations: 'disabled' })
  await testInfo.attach(name, { path, contentType: 'image/png' })
}

// Safari ailesinin bağlantı ve düğme gezinmesi Option+Tab kullanır.
function tabKey(browserName: string, reverse = false) {
  return `${browserName === 'webkit' ? 'Alt+' : ''}${reverse ? 'Shift+' : ''}Tab`
}

async function tabTo(page: Page, target: Locator, browserName: string) {
  await expect(target).toBeVisible()
  if (await target.evaluate((element) => element === document.activeElement)) return
  for (let step = 0; step < 40; step += 1) {
    await page.keyboard.press(tabKey(browserName))
    if (await target.evaluate((element) => element === document.activeElement)) return
  }
  await expect(target, 'Kontrole gerçek Tab gezinmesiyle ulaşılmalı.').toBeFocused()
}

async function captureFocus(page: Page, target: Locator, testInfo: TestInfo, name: string) {
  // Açılan menünün hareketi bitmeden ekran dışı geçici konumu ölçmeyin.
  await target.evaluate(async (element) => {
    const animations = new Set<Animation>()
    for (let node: Element | null = element; node; node = node.parentElement) {
      for (const animation of node.getAnimations()) animations.add(animation)
    }
    await Promise.allSettled([...animations].map((animation) => animation.finished))
  })
  await expect(target).toBeInViewport({ ratio: 1 })
  const focus = await target.evaluate((element) => {
    const style = getComputedStyle(element)
    const marker = getComputedStyle(element, '::before')
    const rect = element.getBoundingClientRect()
    const width = parseFloat(marker.width)
    const height = parseFloat(marker.height)
    const x = rect.x + parseFloat(style.borderLeftWidth) + parseFloat(marker.left)
    const y = rect.y + parseFloat(style.borderTopWidth) + parseFloat(marker.top)
    let unclipped = x >= 0 && y >= 0 && x + width <= innerWidth && y + height <= innerHeight
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
      const parentStyle = getComputedStyle(parent)
      const bounds = parent.getBoundingClientRect()
      if (/(hidden|clip|auto|scroll)/.test(parentStyle.overflowX)) unclipped &&= x >= bounds.left && x + width <= bounds.right
      if (/(hidden|clip|auto|scroll)/.test(parentStyle.overflowY)) unclipped &&= y >= bounds.top && y + height <= bounds.bottom
    }
    return {
      focused: element === document.activeElement, focusVisible: element.matches(':focus-visible'),
      mode: document.documentElement.getAttribute('data-focus-mode'),
      outline: style.outlineStyle, outlineWidth: style.outlineWidth, shadow: style.boxShadow,
      marker: { content: marker.content, display: marker.display, visibility: marker.visibility, opacity: marker.opacity, color: marker.backgroundColor, width, height, x, y, unclipped },
    }
  })
  const path = testInfo.outputPath(`${name}.json`)
  writeFileSync(path, JSON.stringify(focus, null, 2))
  await testInfo.attach(`${name}-metrics`, { path, contentType: 'application/json' })
  await captureState(page, testInfo, name)
  // Soft kontroller diğer durumların kanıtını da toplar. Her ihlal testi başarısız kılar.
  expect.soft(focus.focused, name).toBe(true)
  expect.soft(focus.focusVisible, name).toBe(true)
  expect.soft(focus.mode, name).toBe('keyboard')
  expect.soft(focus.outline === 'none' || focus.outlineWidth === '0px', name).toBe(true)
  expect.soft(focus.shadow, name).toBe('none')
  expect.soft(focus.marker.content, name).not.toBe('none')
  expect.soft(focus.marker.display, name).not.toBe('none')
  expect.soft(focus.marker.visibility, name).toBe('visible')
  expect.soft(Number(focus.marker.opacity), name).toBeGreaterThan(0)
  expect.soft(focus.marker.color, name).not.toMatch(/^(transparent|rgba\([^)]*, 0\))$/)
  expect.soft(focus.marker.width, name).toBeGreaterThan(0)
  expect.soft(focus.marker.width, name).toBeLessThanOrEqual(4)
  expect.soft(focus.marker.height, name).toBeGreaterThan(4)
  expect.soft(focus.marker.unclipped, name).toBe(true)
}

async function keyboardRoute(page: Page, name: string, browserName: string, testInfo: TestInfo) {
  const menu = page.getByRole('button', { name: 'Menüyü aç', exact: true })
  const mobile = await menu.isVisible()
  if (mobile) {
    await tabTo(page, menu, browserName)
    await page.keyboard.press('Enter')
    await captureState(page, testInfo, `route-${name}-menu-opening`)
    await expect(page.getByRole('dialog', { name: 'Menü', exact: true })).toBeVisible()
  }
  const link = !mobile && name === 'Planlar'
    ? page.getByRole('navigation', { name: 'Konum' }).getByRole('link', { name: 'Ağ denetimi planı', exact: true })
    : page.getByRole('navigation', { name: 'Ana bölümler' }).getByRole('link', { name, exact: true })
  await tabTo(page, link, browserName)
  await page.keyboard.press(tabKey(browserName, true))
  await expect(link).not.toBeFocused()
  await page.keyboard.press(tabKey(browserName))
  await captureFocus(page, link, testInfo, `route-${name}-focus`)
  await page.keyboard.press('Enter')
  if (mobile) {
    await expect(page.getByRole('dialog', { name: 'Menü', exact: true })).toBeHidden()
    await captureFocus(page, menu, testInfo, `route-${name}-menu-return`)
  }
}

test('üretim eşleştirmesi eski giriş ve ekran dosyalarını reddeder', async ({ page, network }) => {
  test.skip(!manifest, 'Bu kontrol üretim dosya listesini gerektirir.')
  await openPlans(page)
  await expectLoaded(network, 'PlansScreen')
  const chunks = manifest!
  const entries = await servedEntries(page)
  const entry = chunks['index.html']!
  // Eski giriş bilinen başka bir parça olsa bile açılış hashine uymalıdır.
  const staleEntry = {
    ...chunks,
    'index.html': { ...entry, file: 'assets/index-stale.js' },
    previousEntry: { ...entry, isEntry: false },
  }
  expect.soft(() => assertProductionDelivery(staleEntry, network, entries)).toThrow(/entry/i)
  const screenKey = Object.keys(chunks).find((key) => key === 'src/screens/PlansScreen.tsx' || chunks[key].src === 'src/screens/PlansScreen.tsx')!
  const staleScreen = { ...chunks, [screenKey]: { ...chunks[screenKey], file: 'assets/PlansScreen-stale.js' } }
  expect.soft(() => assertProductionDelivery(staleScreen, network, entries)).toThrow(/unknown.*script/i)
})

test('soğuk Planlar açılışı yalnız gereken ekran kodunu yükler', async ({ page, network }) => {
  await openPlans(page)
  await expectLoaded(network, 'PlansScreen')
  // Açılış kontrolü, uygulamanın çalışan ilk formunu da kapsar.
  await page.getByRole('button', { name: 'Yeni plan', exact: true }).click()
  await page.getByPlaceholder('Örneğin Mahalle kafesi').fill('Henüz kaydedilmedi')
  await page.getByRole('button', { name: 'Vazgeç', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
  expectNoRequest(network, 'charts')
  expectNoRequest(network, 'reports')
  expectOnlyScreens(network, ['PlansScreen'])
  expect(network.errors).toEqual([])
})

for (const intent of ['hover', 'touch'] as const) {
  test(`${intent}: bağlantı ekranı açmadan önce kodunu yükler`, async ({ page, network }) => {
    await openPlans(page)
    const link = await menuLink(page, 'Karar Kitabı')
    expectNoRequest(network, 'MethodsScreen')
    if (intent === 'hover') await link.hover()
    else await touchIntent(link)
    await expectLoaded(network, 'MethodsScreen')
    await expect(page.getByRole('heading', { name: 'Planlar', exact: true })).toBeVisible()
    expect(new URL(page.url()).hash).not.toContain('/yontemler')
    expectOnlyScreens(network, ['PlansScreen', 'MethodsScreen'])
    expectNoRequest(network, 'reports')
    expectNoRequest(network, 'charts')

    // Aynı niyetin tekrarı ve ardından gezinme ikinci dosya isteği üretmemeli.
    await touchIntent(link)
    if (intent === 'hover') await link.click()
    else await link.press('Enter')
    await expect(page.getByRole('heading', { name: 'Karar Kitabı', exact: true })).toBeVisible()
    expect(requested(network, 'MethodsScreen')).toHaveLength(1)
    expect(network.errors).toEqual([])
  })

  test(`${intent}: çalışma ekranı rapor kodu olmadan önceden yüklenir`, async ({ page, network }) => {
    await createPlan(page)
    await page.evaluate(() => { window.location.hash = '/temel' })
    await expect(page.getByRole('heading', { name: 'Strateji öncesi 20 temel taşı' })).toBeVisible()
    const link = page.locator('main a[href*="/adim/"]').first()
    expectNoRequest(network, 'WorkScreen')
    if (intent === 'hover') await link.hover()
    else await touchIntent(link)
    await expectLoaded(network, 'WorkScreen')
    expectNoRequest(network, 'reports')
    await link.click()
    await expect(page.locator('h1')).toContainText('Adım')
    expect(requested(network, 'WorkScreen')).toHaveLength(1)
    expectNoRequest(network, 'reports')
    expect(network.errors).toEqual([])
  })

  test(`${intent}: rapor ekranı önceden yüklenir, rapor yalnız açılınca yüklenir`, async ({ page, network }, testInfo) => {
    await createPlan(page)
    const reportLink = await menuLink(page, 'Çıktılar')
    expectNoRequest(network, 'OutputsScreen')
    expectNoRequest(network, 'reports')
    if (intent === 'hover') await reportLink.hover()
    else await touchIntent(reportLink)
    await expectLoaded(network, 'OutputsScreen')
    expectNoRequest(network, 'reports')

    const reportRoutes = [
      { path: '/devir', screen: 'HandoffScreen' },
      { path: '/gecis', screen: 'TransitionScreen' },
      { path: '/strateji', screen: 'StrategyScreen' },
    ] as const
    for (const { path, screen } of reportRoutes) {
      const link = page.locator(`a[href="#${path}"]:visible`)
      await expect(link).toBeVisible()
      expectNoRequest(network, screen)
      if (intent === 'hover') await link.hover()
      else await touchIntent(link)
      await expectLoaded(network, screen)
      expectNoRequest(network, 'reports')
    }

    // İzinli isteğin bitmesi, niyet dinleyicisinin çalıştığı gözlem sınırıdır.
    const methodsLink = await menuLink(page, 'Karar Kitabı')
    if (intent === 'hover') await methodsLink.hover()
    else await touchIntent(methodsLink)
    await expectLoaded(network, 'MethodsScreen')
    expect(requested(network, 'OutputsScreen')).toHaveLength(1)
    for (const { screen } of reportRoutes) expect(requested(network, screen)).toHaveLength(1)
    expectNoRequest(network, 'reports')
    await expect(page.getByRole('heading', { name: 'Bugün nereden başlayacaksınız?' })).toBeVisible()

    await reportLink.click()
    await expect(page.getByRole('heading', { name: 'Yönetici raporu', exact: true })).toBeVisible()
    await expectLoaded(network, 'OutputsScreen')
    await expectLoaded(network, 'reports')
    await captureState(page, testInfo, 'report-opened')
    expectNoRequest(network, 'charts')
    expect(network.errors).toEqual([])
  })
}


test('rapor göstermeyen çalışma adımı rapor kodunu yüklemez', async ({ page, network }) => {
  await createPlan(page)
  await page.evaluate(() => { window.location.hash = '/karar/0/adim/00' })
  await expect(page.locator('h1')).toContainText('Adım 00.')
  await expectLoaded(network, 'WorkScreen')
  expectNoRequest(network, 'reports')
  expectNoRequest(network, 'charts')
  expect(network.errors).toEqual([])
})

/** Geçiş kaydı, mevcut strateji testlerindeki kabul edilmiş plan durumudur. */
async function unlockStrategy(page: Page) {
  await page.evaluate(() => {
    const key = 'decisionactplan-v1'
    const raw = JSON.parse(localStorage.getItem(key) ?? '{}')
    const plan = raw.state.plans[raw.state.currentId]
    plan.transitions = [{
      id: 'teslim-gecis', outcome: 'hazir', suggested: 'hazir', reason: 'Dayanaklar incelendi.',
      decidedBy: 'Kurucu', decidedAt: new Date().toISOString(), reviewed: true,
      mandatoryMet: 9, mandatoryTotal: 9, supportingMet: 5, supportingTotal: 7,
      level: 5, revision: plan.revision,
    }]
    localStorage.setItem(key, JSON.stringify(raw))
  })
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Bugün nereden başlayacaksınız?' })).toBeVisible()
}

test('dayanak özeti kapalıyken rapor indirilmez, açılınca yüklenir', async ({ page, network }, testInfo) => {
  await createPlan(page)
  await unlockStrategy(page)
  await page.evaluate(() => { window.location.hash = '/karar/9/adim/S21' })
  await expect(page.locator('h1')).toContainText('2.1')
  const summary = page.getByRole('button', { name: 'Dayanak özeti' })
  await expect(summary).toHaveAttribute('aria-expanded', 'false')
  expectNoRequest(network, 'reports')
  await summary.click()
  await expect(summary).toHaveAttribute('aria-expanded', 'true')
  await expectLoaded(network, 'reports')
  await expect(page.locator('.foundation-summary')).toBeVisible()
  await captureState(page, testInfo, 'foundation-summary-opened')
  expect(network.errors).toEqual([])
})

test('yol karşılaştırması gereken adım raporu yükler', async ({ page, network }, testInfo) => {
  await createPlan(page)
  await unlockStrategy(page)
  expectNoRequest(network, 'reports')
  await page.evaluate(() => { window.location.hash = '/karar/9/adim/S22' })
  await expect(page.locator('h1')).toContainText('2.2')
  await expectLoaded(network, 'reports')
  await expect(page.locator('.path-compare-empty')).toBeVisible()
  await captureState(page, testInfo, 'work-paths-opened')
  expect(network.errors).toEqual([])
})

test('rapor yükleme hatasından sonra yeniden açma kayıtlı planı korur', async ({ page, network }, testInfo) => {
  await createPlan(page)
  let failureEnabled = true
  let attempts = 0
  let blockedAttempts = 0
  await page.route((url) => matches('reports', url.href), async (route) => {
    attempts += 1
    if (failureEnabled) {
      blockedAttempts += 1
      await route.abort('failed')
    } else await route.continue()
  })
  await page.evaluate(() => { window.location.hash = '/ciktilar' })
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Girişimci Aksiyon Planı, panoya git' })).toBeVisible()
  expect(blockedAttempts).toBeGreaterThan(0)
  await captureState(page, testInfo, 'report-error')
  failureEnabled = false
  await page.getByRole('button', { name: 'Sayfayı yeniden yükle' }).click()
  await expect(page.getByRole('heading', { name: 'Yönetici raporu', exact: true })).toBeVisible()
  await expectLoaded(network, 'reports')
  expect(attempts).toBeGreaterThan(blockedAttempts)
  await page.evaluate(() => { window.location.hash = '/' })
  await expect(page.getByRole('button', { name: 'Ağ denetimi planı', exact: true })).toBeVisible()
})

test('ekran geçişi yalnız ziyaret edilen ekranları yükler', async ({ page, network }) => {
  await createPlan(page)
  expectNoRequest(network, 'HistoryScreen')
  expectNoRequest(network, 'TasksScreen')
  // Hash değişimi, bağlantıya fareyle gelmeden yönlendiriciyi çalıştırır.
  await page.evaluate(() => { window.location.hash = '/gecmis' })
  await expect(page.getByRole('heading', { name: 'Geçmiş', exact: true })).toBeVisible()
  await expectLoaded(network, 'HistoryScreen')
  expectNoRequest(network, 'TasksScreen')
  await page.evaluate(() => { window.location.hash = '/isler' })
  await expect(page.getByRole('heading', { name: 'İşler', exact: true })).toBeVisible()
  await expectLoaded(network, 'TasksScreen')
  expectOnlyScreens(network, ['PlansScreen', 'StartScreen', 'HistoryScreen', 'TasksScreen'])
  expectNoRequest(network, 'reports')
  expectNoRequest(network, 'charts')
  expect(network.errors).toEqual([])
})

test('plan yoksa rapor adresi rapor kodunu indirmeden Planlar ekranına döner', async ({ page, network }) => {
  await page.goto('./#/ciktilar')
  await expect(page.getByRole('heading', { name: 'Planlar', exact: true })).toBeVisible()
  expect(new URL(page.url()).hash).toMatch(/^#\/$/)
  await expectLoaded(network, 'PlansScreen')
  expectOnlyScreens(network, ['PlansScreen'])
  expectNoRequest(network, 'reports')
  expectNoRequest(network, 'charts')
})

test('grafik gösteren ekran ECharts kodunu gerektiğinde yükler', async ({ page, network }) => {
  await createPlan(page)
  expectNoRequest(network, 'charts')
  await page.evaluate(() => { window.location.hash = '/kanitlar' })
  await expect(page.getByRole('heading', { name: 'Kanıtlar', exact: true })).toBeVisible()
  await expect(page.locator('canvas').first()).toBeVisible()
  await expectLoaded(network, 'EvidenceScreen')
  await expectLoaded(network, 'charts')
  expectNoRequest(network, 'reports')
  expect(network.errors).toEqual([])
})

test('ekran kodu beklenirken yükleme durumu ve uygulama başlığı görünür kalır', async ({ page, network, browserName }, testInfo) => {
  let continueDownload = () => {}
  const held = new Promise<void>((resolve) => { continueDownload = resolve })
  await page.route((url) => matches('MethodsScreen', url.href), async (route) => {
    await held
    await route.continue()
  })
  try {
    await page.goto('./#/yontemler', { waitUntil: 'domcontentloaded' })
    const loading = page.getByRole('status').filter({ hasText: 'Sayfa yükleniyor' })
    await expect(loading).toBeVisible()
    await expect(loading).toHaveAttribute('aria-busy', 'true')
    await expect(page.getByRole('link', { name: 'Girişimci Aksiyon Planı, panoya git' })).toBeVisible()
    await captureState(page, testInfo, 'initial-loading')
    const brand = page.getByRole('link', { name: 'Girişimci Aksiyon Planı, panoya git' })
    await tabTo(page, brand, browserName)
    await page.keyboard.press(tabKey(browserName, true))
    await expect(brand).not.toBeFocused()
    await page.keyboard.press(tabKey(browserName))
    await captureFocus(page, brand, testInfo, 'initial-loading-focus')
    continueDownload()
    await expect(page.getByRole('heading', { name: 'Karar Kitabı', exact: true })).toBeVisible()
    await expect(loading).toBeHidden()
    await expectLoaded(network, 'MethodsScreen')
    expect(network.errors).toEqual([])
  } finally {
    continueDownload()
  }
})

test('klavye ile ekran açılırken menü kapanır ve yükleme odağı korunur', async ({ page, network, browserName }, testInfo) => {
  await openPlans(page)
  let continueDownload = () => {}
  const held = new Promise<void>((resolve) => { continueDownload = resolve })
  await page.route((url) => matches('MethodsScreen', url.href), async (route) => {
    await held
    await route.continue()
  })
  try {
    await keyboardRoute(page, 'Karar Kitabı', browserName, testInfo)
    await expect.poll(() => requested(network, 'MethodsScreen').length).toBeGreaterThan(0)
    const loading = page.getByRole('status').filter({ hasText: 'Sayfa yükleniyor' })
    await captureState(page, testInfo, 'keyboard-loading')
    await expect.soft(loading).toBeVisible()
    await expect.soft(loading).toHaveAttribute('aria-busy', 'true')
    const brand = page.getByRole('link', { name: 'Girişimci Aksiyon Planı, panoya git' })
    await tabTo(page, brand, browserName)
    await page.keyboard.press(tabKey(browserName, true))
    await expect(brand).not.toBeFocused()
    await page.keyboard.press(tabKey(browserName))
    await captureFocus(page, brand, testInfo, 'keyboard-loading-focus')
    continueDownload()
    await expect(page.getByRole('heading', { name: 'Karar Kitabı', exact: true })).toBeVisible()
    await expect(loading).toBeHidden()
    await expectLoaded(network, 'MethodsScreen')
    await expect(brand).toBeFocused()
    await captureFocus(page, brand, testInfo, 'keyboard-loaded-focus')
    expect(network.errors).toEqual([])
  } finally {
    continueDownload()
  }
})

for (const navigation of ['direct', 'keyboard'] as const) {
  test(navigation === 'direct'
    ? 'ekran yükleme hatasından sonra yeniden deneme kayıtlı planı korur'
    : 'klavye ile hata ekranına geçiş ve kurtarma odağı korunur', async ({ page, network, browserName }, testInfo) => {
    await createPlan(page)
    let failureEnabled = true
    let attempts = 0
    let blockedAttempts = 0
    await page.route((url) => matches('TasksScreen', url.href), async (route) => {
      attempts += 1
      if (failureEnabled) {
        blockedAttempts += 1
        await route.abort('failed')
      } else await route.continue()
    })
    if (navigation === 'keyboard') await keyboardRoute(page, 'İşler', browserName, testInfo)
    else await page.evaluate(() => { window.location.hash = '/isler' })
    await expect.poll(() => network.failed.some(({ url }) => matches('TasksScreen', url))).toBe(true)
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Girişimci Aksiyon Planı, panoya git' })).toBeVisible()
    await captureState(page, testInfo, 'route-error')
    const retry = page.getByRole('button', { name: /yeniden (dene|yükle)/i })
    await tabTo(page, retry, browserName)
    await page.keyboard.press(tabKey(browserName, true))
    await expect(retry).not.toBeFocused()
    await page.keyboard.press(tabKey(browserName))
    await captureFocus(page, retry, testInfo, 'route-error-retry-focus')
    expect(blockedAttempts).toBeGreaterThan(0)
    failureEnabled = false
    await page.keyboard.press('Enter')
    await expect(page.getByRole('heading', { name: 'İşler', exact: true })).toBeVisible()
    await expectLoaded(network, 'TasksScreen')
    expect(attempts).toBeGreaterThan(blockedAttempts)
    const menu = page.getByRole('button', { name: 'Menüyü aç', exact: true })
    const recoveredControl = await menu.isVisible() ? menu : page.getByRole('link', { name: 'Girişimci Aksiyon Planı, panoya git' })
    await page.keyboard.press(tabKey(browserName))
    await captureFocus(page, recoveredControl, testInfo, 'recovered-focus')
    if (navigation === 'keyboard') await keyboardRoute(page, 'Planlar', browserName, testInfo)
    else await page.evaluate(() => { window.location.hash = '/' })
    await expect(page.getByRole('heading', { name: 'Planlar', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ağ denetimi planı', exact: true })).toBeVisible()
  })
}

test.describe('dokunma ile gezinme', () => {
  test.use({ hasTouch: true })

  test('tap bağlantıyı açar ve ekranı yükler', async ({ page, network }) => {
    await openPlans(page)
    const link = await menuLink(page, 'Karar Kitabı')
    expectNoRequest(network, 'MethodsScreen')
    await link.tap()
    await expect(page.getByRole('heading', { name: 'Karar Kitabı', exact: true })).toBeVisible()
    await expectLoaded(network, 'MethodsScreen')
    expect(requested(network, 'MethodsScreen')).toHaveLength(1)
    expectNoRequest(network, 'reports')
    expectNoRequest(network, 'charts')
    expect(network.errors).toEqual([])
  })
})
