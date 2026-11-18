import { test, expect, type Page, type Locator, type TestInfo } from '@playwright/test'
import { writeFile } from 'node:fs/promises'

// Projeler, sunucu ve baseURL playwright.config.ts dosyasından gelir.
// Bu dosya geçici kanıt klasörünü veya başka çalışma kopyasını okumaz.
// M09 giriş kapsayıcısını, M10 odaklanan kontrolü gerçek piksellerle ölçer.
test.use({ colorScheme: 'light' })

interface Finding {
  rule: string
  selector: string
  measured: string
  expected: string
  text?: string
  owner?: string
  screenshot?: string
}

async function settle(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all(document.getAnimations().filter(a => a.effect?.getComputedTiming().iterations !== Infinity).map(a => a.finished.catch(() => {})))
    await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())))
  })
}
async function tabTo(page: Page, target: Locator, browserName: string) {
  for (let i = 0; i < 45; i++) {
    if (await target.evaluate(e => e === document.activeElement)) return
    await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab')
  }
  await expect(target).toBeFocused()
}
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Planlar', exact: true })).toBeVisible()
  await settle(page)
})

test('Ana yol: plan, gezinme, menü ve arama birlikte çalışır', async ({ page, browserName, hasTouch }, info) => {
  const activate = (target: Locator) => hasTouch ? target.tap() : target.click()
  const planName = 'Mobil kabuk denemesi'
  await activate(page.getByRole('button', { name: 'Yeni plan', exact: true }))
  await page.getByPlaceholder('Örneğin Mahalle kafesi').fill(planName)
  await activate(page.getByRole('button', { name: 'Oluştur', exact: true }))
  await expect(page).toHaveURL(/#\/baslangic$/)

  const navigation = page.locator('.bottom-nav:visible, .product-nav:visible')
  await expect(navigation).toHaveCount(1)
  await activate(navigation.getByRole('link', { name: 'Pano', exact: true }))
  await expect(page).toHaveURL(/#\/ozet$/)
  await activate(navigation.getByRole('link', { name: 'Yol', exact: true }))
  await expect(page).toHaveURL(/#\/karar\/1$/)
  await expect(navigation.getByRole('link', { name: 'Yol', exact: true })).toHaveAttribute('aria-current', 'page')

  if (await page.locator('.bottom-nav').isVisible()) {
    const menuButton = navigation.getByRole('button', { name: 'Menü', exact: true })
    await activate(menuButton)
    const drawer = page.locator('.shell-drawer .ant-drawer-body')
    await expect(drawer).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(drawer).toBeHidden()
    await expect(menuButton).toBeFocused()
    await activate(menuButton)
    await activate(drawer.getByRole('link', { name: 'Kanıtlar', exact: true }))
    await expect(drawer).toBeHidden()
  } else {
    await activate(navigation.getByRole('link', { name: 'Kanıtlar', exact: true }))
  }
  await expect(page).toHaveURL(/#\/kanitlar$/)

  const trigger = page.getByRole('button', { name: /^Ara\. Kısayol / })
  await tabTo(page, trigger, browserName)
  await page.keyboard.press('Space')
  const dialog = page.getByRole('dialog', { name: 'Komut paleti', exact: true })
  await expect(dialog).toBeVisible()
  const input = dialog.getByRole('combobox', { name: 'Ara', exact: true })
  await input.fill('Karar Kitabı')
  await expect(dialog.getByRole('option')).toHaveCount(1)
  const active = await input.getAttribute('aria-activedescendant')
  expect(active).toBeTruthy()
  const viewport = page.viewportSize()!
  await page.setViewportSize(viewport.width < 992 ? { width: 844, height: 390 } : { width: 320, height: 720 })
  await expect(input).toBeFocused()
  await expect(input).toHaveValue('Karar Kitabı')
  await expect(input).toHaveAttribute('aria-activedescendant', active!)
  await page.setViewportSize(viewport)
  await expect(input).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(dialog).toBeHidden()
  await expect(page).toHaveURL(/#\/yontemler$/)

  await activate(page.locator('.topbar-context').getByRole('link', { name: `${planName}. Planlara git`, exact: true }))
  await expect(page).toHaveURL(/#\/$/)
  await expect(page.getByRole('heading', { name: 'Planlar', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: planName, exact: true })).toBeVisible()
  const bounds = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }))
  expect(bounds.scroll).toBeLessThanOrEqual(bounds.width)
  await page.screenshot({ path: info.outputPath('ana-yol.png'), scale: 'css' })
})

test('Seçili gezinme yüzeyi iki yönde ortak hareketi kullanır', async ({ page }) => {
  const navigation = page.locator('.bottom-nav:visible, .product-nav:visible')
  const link = navigation.getByRole('link', { name: 'Karar Kitabı', exact: true })
  const expectMotion = async () => {
    const styles = await link.evaluate(e => {
      const s = getComputedStyle(e)
      return { properties: s.transitionProperty.split(',').map(p => p.trim()), duration: s.transitionDuration, easing: s.transitionTimingFunction }
    })
    expect(styles.properties).toEqual(expect.arrayContaining(['color', 'background-color']))
    expect(styles.duration.split(',').every(d => parseFloat(d) > 0)).toBe(true)
    expect(styles.easing).toContain('cubic-bezier(0.65, 0, 0.35, 1)')
  }
  await expectMotion()
  await link.click()
  await expect(link).toHaveAttribute('aria-current', 'page')
  await expectMotion()
  await navigation.getByRole('link', { name: 'Planlar', exact: true }).click()
  await expect(link).not.toHaveAttribute('aria-current', 'page')
  await expectMotion()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  expect(await link.evaluate(e => getComputedStyle(e).transitionDuration.split(',').every(d => parseFloat(d) <= 0.00001))).toBe(true)
})

test('M01 marka bağlantısı en az 44 piksel', async ({ page }, info) => {
  const brand = page.locator('.topbar .brand')
  const box = await brand.boundingBox()
  expect(box!.width).toBeGreaterThanOrEqual(44)
  expect(box!.height).toBeGreaterThanOrEqual(44)
  const reachable = await brand.evaluate(el => {
    const r = el.getBoundingClientRect()
    return [[r.left + 1, r.top + 1], [r.right - 1, r.top + 1], [r.left + 1, r.bottom - 1], [r.right - 1, r.bottom - 1]]
      .every(([x,y]) => el.contains(document.elementFromPoint(x,y)))
  })
  expect(reachable).toBe(true)
  await writeFile(info.outputPath('brand.json'), JSON.stringify(box))
  await page.screenshot({ path: info.outputPath('brand.png') })
})
test('M08 pencerenin erişilebilir adı', async ({ page }) => {
  await page.getByRole('button', { name: /^Ara\. Kısayol / }).click()
  await expect(page.getByRole('dialog')).toHaveAccessibleName('Komut paleti')
})
for (const theme of ['light','dark']) test(`M09 arama alanının gerçek piksel odağı ${theme}`, async ({ page, browserName }, info) => {
  if (theme === 'dark') await page.getByRole('button', { name: 'Koyu temaya geç' }).click()
  const trigger = page.getByRole('button', { name: /^Ara\. Kısayol / })
  await tabTo(page, trigger, browserName)
  await page.keyboard.press('Space')
  const input = page.getByRole('combobox', { name: 'Ara', exact: true })
  await expect(input).toBeFocused()
  await expect(page.getByRole('dialog')).toHaveCSS('transform', 'none')
  await expect(page.getByRole('dialog')).toHaveCSS('opacity', '1')
  await settle(page)
  const screenshot = await page.screenshot({ path: info.outputPath('search-focus.png'), scale: 'css' })
  const result = await page.evaluate(async base64 => {
    const input = document.activeElement as HTMLElement
    const wrapper = input.closest('.cmdk-input') as HTMLElement
    const s = getComputedStyle(wrapper, '::before'), host = getComputedStyle(wrapper), r = wrapper.getBoundingClientRect()
    const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d')!
    const image = new Image(); image.src = `data:image/png;base64,${base64}`; await image.decode()
    canvas.width = image.width; canvas.height = image.height; ctx.drawImage(image, 0, 0)
    const color = s.backgroundColor.match(/[\d.]+/g)!.slice(0,3).map(Number)
    const pixel = (x: number, y: number) => Array.from(ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data).slice(0,3)
    const lum = (c: number[]) => c.map(v => { const n = v / 255; return n <= .04045 ? n / 12.92 : ((n+.055)/1.055)**2.4 }).reduce((v,n,i) => v+n*[.2126,.7152,.0722][i],0)
    const contrast = (a: number[], b: number[]) => (Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05)
    const left = r.left + parseFloat(host.borderLeftWidth) + parseFloat(s.left)
    const top = r.top + parseFloat(host.borderTopWidth) + parseFloat(s.top)
    const width = parseFloat(s.width), height = parseFloat(s.height)
    let run = 0, longest = 0, minContrast = Infinity
    for (let y = Math.ceil(top)+1; y < Math.floor(top+height)-1; y++) {
      const a = pixel(Math.ceil(left),y), b = pixel(Math.ceil(left)+1,y)
      const matches = [a,b].every(p => p.every((v,i) => Math.abs(v-color[i]) <= 8))
      const ratio = Math.min(contrast(a,pixel(left-2,y)),contrast(b,pixel(left+width+2,y)))
      if (matches && ratio >= 3) { run++; minContrast = Math.min(minContrast,ratio) } else run=0
      longest = Math.max(longest,run)
    }
    const ring = (e: Element) => { const c=getComputedStyle(e); return c.outlineStyle !== 'none' || c.boxShadow !== 'none' }
    return { mode: document.documentElement.dataset.focusMode, focusVisible: input.matches(':focus-visible'),
      width, height, longest, minContrast, ring: ring(input) || ring(wrapper),
      inViewport: left >= 0 && top >= 0 && left+width <= innerWidth && top+height <= innerHeight,
      wrapperBefore: s.content, wrapperAfter: getComputedStyle(wrapper,'::after').content,
      inputTag: input.tagName, inputDecoration: getComputedStyle(input).textDecorationLine }
  }, screenshot.toString('base64'))
  await writeFile(info.outputPath('search-focus.json'), JSON.stringify(result,null,2))
  expect(result.mode).toBe('keyboard'); expect(result.focusVisible).toBe(true)
  expect(result.width).toBe(3); expect(result.longest).toBeGreaterThanOrEqual(8)
  expect(result.minContrast).toBeGreaterThanOrEqual(3); expect(result.inViewport).toBe(true)
  expect(result.ring).toBe(false); expect(result.wrapperAfter).toMatch(/none|normal/)
  expect(result.inputTag).toBe('INPUT'); expect(result.inputDecoration).toBe('none')
  await page.keyboard.press('ArrowDown'); await expect(input).toBeFocused()
  await page.keyboard.press('Escape'); await expect(trigger).toBeFocused()
})
for (const theme of ['light','dark']) test(`M10 tek ve belirgin odak ${theme}`, async ({ page, browserName }, info) => {
  if (theme === 'dark') await page.getByRole('button', { name: 'Koyu temaya geç' }).click()
  const audit: Audit = { findings: [], samples: [], dialogName: 'not_run' }
  const targets = [
    page.getByRole('button', { name: theme === 'light' ? 'Koyu temaya geç' : 'Açık temaya geç' }),
    page.getByRole('button', { name: 'Daha fazla', exact: true }),
    page.getByRole('button', { name: 'Yeni plan', exact: true }),
    page.locator('.bottom-nav:visible, .product-nav:visible').getByRole('link', { name: 'Planlar', exact: true }),
    page.locator('.bottom-nav:visible, .product-nav:visible').getByRole('link', { name: 'Karar Kitabı', exact: true }),
    page.locator('.topbar .brand'),
  ]
  for (const target of targets) {
    // Tema tıklaması odağı zaten düğmede bırakır. Tab modu ayrıca açılmalıdır.
    if (await page.evaluate(() => document.documentElement.dataset.focusMode !== 'keyboard')) await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab')
    await tabTo(page,target,browserName); await settle(page)
    await auditFocus(page,info,audit,await target.innerText() || await target.getAttribute('aria-label') || '')
  }
  await writeFile(info.outputPath('focus.json'),JSON.stringify(audit,null,2))
})
test('Odak modu ve yüksek karşıtlık istisnası', async ({ page, browserName }) => {
  const trigger = page.getByRole('button', { name: /^Ara\. Kısayol / })
  await tabTo(page,trigger,browserName); await page.keyboard.press('Space')
  const input = page.getByRole('combobox', { name: 'Ara', exact: true })
  await expect(input).toBeFocused()
  await expect(page.getByRole('dialog')).toHaveCSS('transform','none')
  await expect(page.getByRole('dialog')).toHaveCSS('opacity','1')
  await page.emulateMedia({ forcedColors: 'active' })
  await expect(input).toHaveCSS('outline-style','solid'); await expect(input).toHaveCSS('outline-width','2px')
  expect(await page.locator('.cmdk-input').evaluate(e => getComputedStyle(e,'::before').display)).toBe('none')
  await page.emulateMedia({ forcedColors: 'none' })
  await input.click()
  expect(await page.evaluate(() => document.documentElement.dataset.focusMode)).toBeUndefined()
  expect(await page.locator('.cmdk-input').evaluate(e => getComputedStyle(e,'::before').visibility)).toBe('hidden')
  await page.keyboard.press('ArrowDown')
  expect(await page.evaluate(() => document.documentElement.dataset.focusMode)).toBeUndefined()
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab')
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Shift+Tab' : 'Shift+Tab')
  await expect(input).toBeFocused()
  expect(await page.locator('.cmdk-input').evaluate(e => getComputedStyle(e,'::before').visibility)).toBe('visible')
})

async function readFocus(page: Page, screenshot?: Buffer) {
  return page.evaluate(async (base64) => {
    // Piksel kanıtı yalnız bellekte okunur. Uygulamanın DOM ağacı değişmez.
    const selector = (element: Element) => {
      const parts: string[] = []
      for (let node: Element | null = element; node && node !== document.body; node = node.parentElement) {
        if (node.id) { parts.unshift(`#${CSS.escape(node.id)}`); break }
        const peers = node.parentElement ? [...node.parentElement.children].filter(peer => peer.tagName === node!.tagName) : []
        parts.unshift(`${node.localName}${peers.length > 1 ? `:nth-of-type(${peers.indexOf(node) + 1})` : ''}`)
      }
      return parts.join(' > ') || 'body'
    }
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    if (base64 !== null) {
      const image = new Image()
      image.src = `data:image/png;base64,${base64}`
      await image.decode()
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      context.drawImage(image, 0, 0)
    }
    const pixel = (x: number, y: number) => {
      if (base64 === null || ![x, y].every(Number.isFinite) || x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return null
      return Array.from(context.getImageData(Math.floor(x), Math.floor(y), 1, 1).data).slice(0, 3)
    }
    const el = document.activeElement
    const issues: string[] = []
    const measurementIssues: string[] = []
    const mode = document.documentElement.getAttribute('data-focus-mode')
    if (!(el instanceof HTMLElement) || el === document.body) {
      return { selector: 'body', text: '', mode, issues: ['Odak bir kontrole ulaşmadı.'], measurementIssues, captureKey: 'body' }
    }
    const style = getComputedStyle(el)
    const box = el.getBoundingClientRect()
    const opaque = (color: string) => color !== 'transparent' && !/rgba\([^)]*,\s*0\s*\)$/.test(color)
    const ring = (s: CSSStyleDeclaration) => {
      const outline = !['none', 'hidden'].includes(s.outlineStyle) && parseFloat(s.outlineWidth) > 0 && opaque(s.outlineColor)
      const shadow = s.boxShadow.split(/,(?![^()]*\))/).some((part) => {
        if (part === 'none' || /rgba\([^)]*,\s*0\s*\)/.test(part)) return false
        const [x = 0, y = 0, blur = 0, spread = 0] = (part.match(/-?[\d.]+px/g) ?? []).map(parseFloat)
        return blur + spread > Math.max(Math.abs(x), Math.abs(y))
      })
      return outline || shadow
    }
    const chain: HTMLElement[] = []
    for (let node: HTMLElement | null = el; node; node = node.parentElement) chain.push(node)
    const styleKey = (s: CSSStyleDeclaration) => Array.from(s).map((name) => [name, s.getPropertyValue(name)])
    // Görüntünün iki yanındaki aynı kayıt, font ve konum değişimini yakalar.
    const captureKey = JSON.stringify({
      active: selector(el), mode, focusVisible: el.matches(':focus-visible'),
      viewport: [innerWidth, innerHeight, scrollX, scrollY], fonts: document.fonts.status,
      ancestors: chain.map((node) => ({
        rect: node.getBoundingClientRect().toJSON(), scroll: [node.scrollLeft, node.scrollTop],
        style: styleKey(getComputedStyle(node)),
      })),
      pseudos: ['::before', '::after'].map((pseudo) => styleKey(getComputedStyle(el, pseudo))),
    })
    const painted = chain.every((node) => {
      const s = getComputedStyle(node)
      return s.display !== 'none' && s.visibility === 'visible' && Number(s.opacity) > 0
    })
    const opacity = chain.reduce((value, node) => value * Number(getComputedStyle(node).opacity), 1)
    const rgb = (color: string) => {
      const parts = color.match(/^rgba?\(([^)]+)\)$/)?.[1].split(/[,\s/]+/).map(Number)
      return parts && parts.length >= 3 ? parts : null
    }
    const luminance = (values: number[]) => values.map((value) => {
      const channel = value / 255
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    }).reduce((sum, channel, i) => sum + channel * [0.2126, 0.7152, 0.0722][i], 0)
    const ratio = (a: number[], b: number[]) => {
      const first = luminance(a)
      const second = luminance(b)
      return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
    }
    const contrast = (color: string, surface: Element, alpha = 1) => {
      const foreground = rgb(color)
      if (!foreground) return 0
      foreground[3] = (foreground[3] ?? 1) * alpha
      const layers: number[][] = []
      for (let node: Element | null = surface; node; node = node.parentElement) {
        const layer = rgb(getComputedStyle(node).backgroundColor)
        if (layer) layers.unshift(layer)
      }
      const blend = (front: number[], back: number[]) => back.map((value, i) => (front[i] * (front[3] ?? 1)) + (value * (1 - (front[3] ?? 1))))
      const background = layers.reduce((back, layer) => blend(layer, back), [255, 255, 255])
      return ratio(blend(foreground, background), background)
    }
    const inView = (rect: { left: number; top: number; right: number; bottom: number }) => {
      if (rect.left < 0 || rect.top < 0 || rect.right > innerWidth || rect.bottom > innerHeight) return false
      return chain.every((node) => {
        const s = getComputedStyle(node)
        const bounds = node.getBoundingClientRect()
        const clipsX = /(hidden|clip|auto|scroll)/.test(s.overflowX)
        const clipsY = /(hidden|clip|auto|scroll)/.test(s.overflowY)
        return (!clipsX || (rect.left >= bounds.left && rect.right <= bounds.right))
          && (!clipsY || (rect.top >= bounds.top && rect.bottom <= bounds.bottom))
          && s.clipPath === 'none' && s.clip === 'auto'
      })
    }
    const length = (value: string, reference = 0) => {
      if (!/^-?(?:\d+\.?\d*|\.\d+)(?:px|%)?$/.test(value)) return NaN
      return parseFloat(value) * (value.endsWith('%') ? reference / 100 : 1)
    }
    // Eksenleri koruyan dönüşümleri ölçeriz. Diğerlerini geçerli saymayız.
    const axes = (s: CSSStyleDeclaration) => {
      try {
        const matrix = new DOMMatrixReadOnly(s.transform === 'none' ? undefined : s.transform)
        const scale = s.scale === 'none' ? [1, 1] : s.scale.split(/\s+/).map((value) => length(value, 1))
        const translate = s.translate === 'none' ? ['0px', '0px'] : s.translate.split(/\s+/)
        const x = matrix.a * scale[0]
        const y = matrix.d * (scale[1] ?? scale[0])
        if (!matrix.is2D || matrix.b !== 0 || matrix.c !== 0
          || ![x, y].every((value) => Number.isFinite(value) && value > 0)
          || !['none', '0deg', '0rad', '0turn', '0grad'].includes(s.rotate)
          || (scale[2] ?? 1) !== 1 || length(translate[2] ?? '0px') !== 0
          || s.perspective !== 'none' || s.offsetPath !== 'none') return null
        return { x, y, offsetX: matrix.e * scale[0], offsetY: matrix.f * (scale[1] ?? scale[0]) }
      } catch {
        return null
      }
    }
    // Üst öğelerin kayması box içinde vardır. Ölçekleri yerel uzaklıklara uygulanır.
    const ancestorAxes = chain.map((node) => axes(getComputedStyle(node)))
    const hostScaleX = ancestorAxes.reduce((value, axis) => value * (axis?.x ?? NaN), 1)
    const hostScaleY = ancestorAxes.reduce((value, axis) => value * (axis?.y ?? NaN), 1)
    const pseudos = ['::before', '::after'].map((pseudo) => {
      const s = getComputedStyle(el, pseudo)
      const borderWidth = parseFloat(s.width) + (s.boxSizing === 'border-box' ? 0
        : parseFloat(s.paddingLeft) + parseFloat(s.paddingRight) + parseFloat(s.borderLeftWidth) + parseFloat(s.borderRightWidth))
      const borderHeight = parseFloat(s.height) + (s.boxSizing === 'border-box' ? 0
        : parseFloat(s.paddingTop) + parseFloat(s.paddingBottom) + parseFloat(s.borderTopWidth) + parseFloat(s.borderBottomWidth))
      const localLeft = parseFloat(style.borderLeftWidth) + parseFloat(s.left) + parseFloat(s.marginLeft) - el.scrollLeft
      const localTop = parseFloat(style.borderTopWidth) + parseFloat(s.top) + parseFloat(s.marginTop) - el.scrollTop
      const transform = axes(s)
      const origin = s.transformOrigin.split(/\s+/)
      const originX = length(origin[0], borderWidth)
      const originY = length(origin[1], borderHeight)
      const translate = s.translate === 'none' ? ['0px', '0px'] : s.translate.split(/\s+/)
      const translateX = length(translate[0], borderWidth)
      const translateY = length(translate[1] ?? '0px', borderHeight)
      const scaleX = transform?.x ?? NaN
      const scaleY = transform?.y ?? NaN
      const left = box.left + hostScaleX * (localLeft + translateX + originX * (1 - scaleX) + (transform?.offsetX ?? NaN))
      const top = box.top + hostScaleY * (localTop + translateY + originY * (1 - scaleY) + (transform?.offsetY ?? NaN))
      const width = borderWidth * scaleX * hostScaleX
      const height = borderHeight * scaleY * hostScaleY
      const rect = { left, top, right: left + width, bottom: top + height }
      const finite = [left, top, width, height].every(Number.isFinite)
      const geometrySupported = finite && ['border-box', 'view-box'].includes(s.transformBox)
        && style.display !== 'inline' && style.position !== 'static'
      const color = rgb(s.backgroundColor)
      const alpha = (color?.[3] ?? 1) * opacity * Number(s.opacity)
      // global.css işareti pointer-events:none ile çizer. Tıklama hedefi kanıt değildir.
      // Stil, konum ve kırpılma koşullarını çizilmiş piksellerle birlikte denetleriz.
      const singleEdge = width <= 4 || height <= 4
      const segments: { rect: typeof rect; thickness: number; length: number; contrastRatio: number }[] = []
      let longestPaintedRun = 0
      if (base64 !== null && geometrySupported && singleEdge) {
        const vertical = width <= height
        const minorStart = Math.ceil(Math.max(0, vertical ? left : top))
        const minorEnd = Math.floor(Math.min(vertical ? innerWidth : innerHeight, vertical ? rect.right : rect.bottom))
        const majorStart = Math.ceil(Math.max(0, vertical ? top : left))
        const majorEnd = Math.floor(Math.min(vertical ? innerHeight : innerWidth, vertical ? rect.bottom : rect.right))
        // Her aday şerit iki tam CSS pikselidir. Bir boşluk kesintisiz bölümü bitirir.
        for (let minor = minorStart; minor + 2 <= minorEnd; minor++) {
          let runStart = majorStart
          let runLength = 0
          let runContrast = Infinity
          for (let major = majorStart; major <= majorEnd; major++) {
            const row = vertical
              ? { left: minor, top: major, right: minor + 2, bottom: major + 1 }
              : { left: major, top: minor, right: major + 1, bottom: minor + 2 }
            const foregrounds = [0, 1].map((offset) => vertical ? pixel(minor + offset, major) : pixel(major, minor + offset))
            const backgrounds = (vertical
              ? [pixel(Math.floor(left) - 1, major), pixel(Math.ceil(rect.right), major)]
              : [pixel(major, Math.floor(top) - 1), pixel(major, Math.ceil(rect.bottom))])
              .filter((value): value is number[] => value !== null)
            // Yalnız renk birleştirmesindeki bir basamaklık yuvarlama farkı kabul edilir.
            const matches = major < majorEnd && inView(row) && backgrounds.length === 2 && color !== null
              && foregrounds.every((foreground) => foreground !== null && backgrounds.some((background) =>
                foreground.every((value, i) => Math.abs(value - (color[i] * alpha + background[i] * (1 - alpha))) <= 1)))
            if (matches) {
              if (runLength === 0) runStart = major
              runLength++
              runContrast = Math.min(runContrast, ...foregrounds.flatMap((foreground) =>
                foreground ? backgrounds.map((background) => ratio(foreground, background)) : []))
              longestPaintedRun = Math.max(longestPaintedRun, runLength)
            } else {
              if (runLength >= 8) segments.push({
                rect: vertical
                  ? { left: minor, top: runStart, right: minor + 2, bottom: runStart + runLength }
                  : { left: runStart, top: minor, right: runStart + runLength, bottom: minor + 2 },
                thickness: 2, length: runLength, contrastRatio: runContrast,
              })
              runLength = 0
              runContrast = Infinity
            }
          }
        }
      }
      const pixelMatch = segments.length > 0
      const contrastRatio = pixelMatch ? Math.min(...segments.map((segment) => segment.contrastRatio)) : 0
      // Metin alanında hesaplanan ::before değeri, çizilen bir kutuyu kanıtlamaz.
      const supportsContent = !el.matches('input, textarea, select, img, iframe, video, canvas')
      const generated = supportsContent && !['none', 'normal', ''].includes(s.content)
      const candidate = generated && s.display !== 'none' && s.visibility === 'visible'
        && Number(s.opacity) > 0 && opaque(s.backgroundColor) && painted
      const geometryError = candidate && (!geometrySupported || s.position !== 'absolute')
      const checks = {
        style: candidate,
        geometry: geometrySupported && s.position === 'absolute'
          && Math.min(width, height) >= 2 && Math.max(width, height) >= 8,
        clipping: finite && s.clipPath === 'none' && s.clip === 'auto'
          && segments.some((segment) => inView(segment.rect)),
        pixels: pixelMatch,
        contrast: contrastRatio >= 3,
      }
      // Kontrast ayrı hata üretir. Görünür ama soluk işareti gizli diye raporlamayız.
      const visible = checks.style && checks.geometry && checks.clipping && checks.pixels
      return {
        pseudo, visible, singleEdge, ring: generated && ring(s), rect, width, height, checks,
        pointerEvents: s.pointerEvents,
        geometryError, layout: { localLeft, localTop, borderWidth, borderHeight },
        transform: s.transform, translate: s.translate, scale: s.scale, rotate: s.rotate, transformOrigin: s.transformOrigin,
        transformBox: s.transformBox, hostScaleX, hostScaleY,
        color: s.backgroundColor, contrastRatio, pixelMatch, longestPaintedRun, segments,
      }
    })
    const wrapper = el.closest('.ant-input-affix-wrapper, .ant-select, .ant-input-number, .ant-picker')
    const outlineOrShadow = ring(style) || pseudos.some((p) => p.ring)
      || (wrapper !== null && wrapper !== el && ring(getComputedStyle(wrapper)))
    // Bu hedef yalnız bağlantının alt çizgisine aittir. Pseudo kararına katılmaz.
    const center = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)
    const underline = el.matches('a') && style.textDecorationLine.includes('underline')
      && parseFloat(style.textDecorationThickness) >= 2 && opaque(style.textDecorationColor)
      && Boolean(el.textContent?.trim()) && painted && inView(box) && center !== null && el.contains(center)
      && contrast(style.textDecorationColor, el, opacity) >= 3
    const indicatorCount = Number(underline) + pseudos.filter((p) => p.visible && p.singleEdge).length
    const geometryUncertain = pseudos.some((p) => p.geometryError)
    if (mode !== 'keyboard') issues.push('Klavye odak modu açık değil.')
    if (!el.matches(':focus-visible')) issues.push('Kontrol görünür klavye odağı taşımıyor.')
    if (outlineOrShadow) issues.push('Odak çevresinde outline veya gölge halkası var.')
    if (geometryUncertain) measurementIssues.push('Odak işaretinin konumu bu ölçümle doğrulanamadı.')
    if (base64 !== null && (canvas.width !== innerWidth || canvas.height !== innerHeight)) {
      measurementIssues.push('Görüntü boyutu CSS görünüm alanıyla eşleşmiyor.')
    }
    if (indicatorCount === 0 && !geometryUncertain) issues.push('Görünür, çevrelemeyen odak işareti yok.')
    if (pseudos.some((p) => p.visible && p.singleEdge && p.contrastRatio < 3)) issues.push('Odak işaretinin komşu renkle farkı 3:1 altında.')
    if (indicatorCount > 1) issues.push('Kontrol birden fazla odak işareti gösteriyor.')
    return {
      selector: selector(el), text: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 100),
      mode, issues, measurementIssues, captureKey, outline: style.outline, shadow: style.boxShadow, underline, pseudos,
      hostRect: { left: box.left, top: box.top, right: box.right, bottom: box.bottom },
    }
  }, screenshot?.toString('base64') ?? null)
}

type FocusRecord = Omit<Awaited<ReturnType<typeof readFocus>>, 'captureKey'> & {
  step: string; screenshot: string; stableCapture: boolean; captureAttempts: number
}
interface Audit { findings: Finding[]; samples: FocusRecord[]; dialogName: 'pass' | 'fail' | 'not_run' }

async function auditFocus(page: Page, info: TestInfo, audit: Audit, step: string, owner = 'İş 2') {
  await page.evaluate(async () => { await document.fonts.ready })
  let capture: { screenshotBytes: Buffer; reading: Awaited<ReturnType<typeof readFocus>> } | undefined
  let stableCapture = false
  let captureAttempts = 0
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
    const before = await readFocus(page)
    const screenshotBytes = await page.screenshot({ scale: 'css' })
    const reading = await readFocus(page, screenshotBytes)
    capture = { screenshotBytes, reading }
    captureAttempts++
    stableCapture = before.captureKey === reading.captureKey
    if (stableCapture) break
  }
  if (!capture) throw new Error('Odak görüntüsü alınamadı.')
  const { captureKey: _captureKey, ...reading } = capture.reading
  const screenshot = info.outputPath(`odak-${audit.samples.length + 1}.png`)
  const sample: FocusRecord = {
    ...reading, step, screenshot, stableCapture, captureAttempts,
    // Kararsız görüntü uygulamada gizli odak bulunduğu anlamına gelmez.
    issues: stableCapture ? reading.issues : [],
    measurementIssues: stableCapture ? reading.measurementIssues : ['DOM ve görüntü aynı kararlı durumda alınamadı.'],
  }
  await writeFile(screenshot, capture.screenshotBytes)
  await info.attach(`odak-${audit.samples.length + 1}`, { path: screenshot, contentType: 'image/png' })
  audit.samples.push(sample)
  if (sample.issues.length > 0) {
    audit.findings.push({
      rule: 'klavye-odak', selector: sample.selector, text: sample.text,
      measured: `${step}: ${sample.issues.join(' ')}`, expected: 'Halka yok. Klavye odağında görünür işaret var.',
      owner, screenshot,
    })
  }
  if (sample.measurementIssues.length > 0) {
    audit.findings.push({
      rule: 'klavye-olcum', selector: sample.selector, text: sample.text,
      measured: `${step}: ${sample.measurementIssues.join(' ')}`,
      expected: 'Odak kararlı görüntüyle ölçülebilmeli.', owner: 'İş 8', screenshot,
    })
  }
  // Görsel hata, aynı testte sonraki tuşların denenmesini engellemez.
  expect.soft(sample.issues, `${step}: ${sample.selector}`).toEqual([])
  expect.soft(sample.measurementIssues, `${step}: ölçüm durumu`).toEqual([])
  return sample
}
