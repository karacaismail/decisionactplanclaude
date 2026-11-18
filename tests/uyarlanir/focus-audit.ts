import { expect, type Page, type TestInfo } from '@playwright/test'
import { writeFile } from 'node:fs/promises'
import { type Finding } from './audit'

/** Native girişin odak işaretini çizebilen alan kapları. Liste uygulamanın CSS kurallarıyla aynıdır. */
export const FOCUS_FIELD_HOSTS = [
  'label', '.ant-select', '.ant-input-affix-wrapper', '.ant-input-number', '.ant-picker',
  '.ant-radio-wrapper', '.ant-radio-button-wrapper', '.ant-checkbox-wrapper', '.cmdk-input',
  '.field', '.ant-form-item-control-input-content', '.assumption-field', '.ant-pagination-simple-pager',
].join(', ')

async function readFocus(page: Page, screenshot?: Buffer) {
  return page.evaluate(async ({ base64, FIELD_HOSTS }) => {
    // Piksel kanıtı yalnız bellekte okunur. Uygulamanın DOM ağacı değişmez.
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
    // Native giriş ::before çizemez. İşaret en yakın alan kabında aranır.
    // Kap başka bir kontrol taşıyorsa işaret bu kontrole ait sayılmaz.
    const nativeField = el.matches('input, textarea, select')
    const supportsContent = !el.matches('input, textarea, select, img, iframe, video, canvas')
    const tabbable = (node: Element) => node instanceof HTMLElement && node.tabIndex >= 0
      && !(node as HTMLInputElement).disabled && (node as HTMLInputElement).type !== 'hidden'
      && node.getClientRects().length > 0
      && node.matches('a[href], button, input, select, textarea, summary, [tabindex], [contenteditable]:not([contenteditable="false"])')
    const fieldHosts: HTMLElement[] = []
    let sharedHost: HTMLElement | null = null
    if (nativeField) {
      for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
        if (!node.matches(FIELD_HOSTS)) continue
        if (Array.from(node.querySelectorAll('*')).some((other) => other !== el && tabbable(other))) {
          sharedHost = node
          break
        }
        fieldHosts.push(node)
      }
    }
    const hosts = [...(supportsContent ? [el] : []), ...fieldHosts]
    const chainOf = (start: HTMLElement) => {
      const nodes: HTMLElement[] = []
      for (let node: HTMLElement | null = start; node; node = node.parentElement) nodes.push(node)
      return nodes
    }
    const chain = chainOf(el)
    const styleKey = (s: CSSStyleDeclaration) => Array.from(s).map((name) => [name, s.getPropertyValue(name)])
    // Görüntünün iki yanındaki aynı kayıt, font ve konum değişimini yakalar.
    const captureKey = JSON.stringify({
      active: window.__mobileQA.selector(el), mode, focusVisible: el.matches(':focus-visible'),
      viewport: [innerWidth, innerHeight, scrollX, scrollY], fonts: document.fonts.status,
      ancestors: chain.map((node) => ({
        rect: node.getBoundingClientRect().toJSON(), scroll: [node.scrollLeft, node.scrollTop],
        style: styleKey(getComputedStyle(node)),
      })),
      pseudos: [el, ...fieldHosts, ...(sharedHost ? [sharedHost] : [])]
        .flatMap((node) => ['::before', '::after'].map((pseudo) => styleKey(getComputedStyle(node, pseudo)))),
    })
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
    const inViewOf = (nodes: HTMLElement[]) => (rect: { left: number; top: number; right: number; bottom: number }) => {
      if (rect.left < 0 || rect.top < 0 || rect.right > innerWidth || rect.bottom > innerHeight) return false
      return nodes.every((node) => {
        const s = getComputedStyle(node)
        const bounds = node.getBoundingClientRect()
        const clipsX = /(hidden|clip|auto|scroll)/.test(s.overflowX)
        const clipsY = /(hidden|clip|auto|scroll)/.test(s.overflowY)
        return (!clipsX || (rect.left >= bounds.left && rect.right <= bounds.right))
          && (!clipsY || (rect.top >= bounds.top && rect.bottom <= bounds.bottom))
          && s.clipPath === 'none' && s.clip === 'auto'
      })
    }
    const inView = inViewOf(chain)
    const paintedChain = (nodes: HTMLElement[]) => nodes.every((node) => {
      const s = getComputedStyle(node)
      return s.display !== 'none' && s.visibility === 'visible' && Number(s.opacity) > 0
    })
    const painted = paintedChain(chain)
    const opacity = chain.reduce((value, node) => value * Number(getComputedStyle(node).opacity), 1)
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
    const measureHost = (host: HTMLElement) => {
    const hostStyle = getComputedStyle(host)
    const hostBox = host.getBoundingClientRect()
    const hostChain = chainOf(host)
    const hostInView = inViewOf(hostChain)
    const hostPainted = paintedChain(hostChain)
    const hostOpacity = hostChain.reduce((value, node) => value * Number(getComputedStyle(node).opacity), 1)
    const ancestorAxes = hostChain.map((node) => axes(getComputedStyle(node)))
    const hostScaleX = ancestorAxes.reduce((value, axis) => value * (axis?.x ?? NaN), 1)
    const hostScaleY = ancestorAxes.reduce((value, axis) => value * (axis?.y ?? NaN), 1)
    const hostCanPaint = !host.matches('input, textarea, select, img, iframe, video, canvas')
    return ['::before', '::after'].map((pseudo) => {
      const s = getComputedStyle(host, pseudo)
      const borderWidth = parseFloat(s.width) + (s.boxSizing === 'border-box' ? 0
        : parseFloat(s.paddingLeft) + parseFloat(s.paddingRight) + parseFloat(s.borderLeftWidth) + parseFloat(s.borderRightWidth))
      const borderHeight = parseFloat(s.height) + (s.boxSizing === 'border-box' ? 0
        : parseFloat(s.paddingTop) + parseFloat(s.paddingBottom) + parseFloat(s.borderTopWidth) + parseFloat(s.borderBottomWidth))
      const localLeft = parseFloat(hostStyle.borderLeftWidth) + parseFloat(s.left) + parseFloat(s.marginLeft) - host.scrollLeft
      const localTop = parseFloat(hostStyle.borderTopWidth) + parseFloat(s.top) + parseFloat(s.marginTop) - host.scrollTop
      const transform = axes(s)
      const origin = s.transformOrigin.split(/\s+/)
      const originX = length(origin[0], borderWidth)
      const originY = length(origin[1], borderHeight)
      const translate = s.translate === 'none' ? ['0px', '0px'] : s.translate.split(/\s+/)
      const translateX = length(translate[0], borderWidth)
      const translateY = length(translate[1] ?? '0px', borderHeight)
      const scaleX = transform?.x ?? NaN
      const scaleY = transform?.y ?? NaN
      const left = hostBox.left + hostScaleX * (localLeft + translateX + originX * (1 - scaleX) + (transform?.offsetX ?? NaN))
      const top = hostBox.top + hostScaleY * (localTop + translateY + originY * (1 - scaleY) + (transform?.offsetY ?? NaN))
      const width = borderWidth * scaleX * hostScaleX
      const height = borderHeight * scaleY * hostScaleY
      const rect = { left, top, right: left + width, bottom: top + height }
      const finite = [left, top, width, height].every(Number.isFinite)
      const geometrySupported = finite && ['border-box', 'view-box'].includes(s.transformBox)
        && hostStyle.display !== 'inline' && hostStyle.position !== 'static'
      const color = rgb(s.backgroundColor)
      const alpha = (color?.[3] ?? 1) * hostOpacity * Number(s.opacity)
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
            const matches = major < majorEnd && hostInView(row) && backgrounds.length === 2 && color !== null
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
      const generated = hostCanPaint && !['none', 'normal', ''].includes(s.content)
      const candidate = generated && s.display !== 'none' && s.visibility === 'visible'
        && Number(s.opacity) > 0 && opaque(s.backgroundColor) && hostPainted
      const geometryError = candidate && (!geometrySupported || s.position !== 'absolute')
      const checks = {
        style: candidate,
        geometry: geometrySupported && s.position === 'absolute'
          && Math.min(width, height) >= 2 && Math.max(width, height) >= 8,
        clipping: finite && s.clipPath === 'none' && s.clip === 'auto'
          && segments.some((segment) => hostInView(segment.rect)),
        pixels: pixelMatch,
        contrast: contrastRatio >= 3,
      }
      // Kontrast ayrı hata üretir. Görünür ama soluk işareti gizli diye raporlamayız.
      const visible = checks.style && checks.geometry && checks.clipping && checks.pixels
      return {
        host: window.__mobileQA.selector(host), pseudo, visible, singleEdge, ring: generated && ring(s), rect, width, height, checks,
        pointerEvents: s.pointerEvents,
        geometryError, layout: { localLeft, localTop, borderWidth, borderHeight },
        transform: s.transform, translate: s.translate, scale: s.scale, rotate: s.rotate, transformOrigin: s.transformOrigin,
        transformBox: s.transformBox, hostScaleX, hostScaleY,
        color: s.backgroundColor, contrastRatio, pixelMatch, longestPaintedRun, segments,
      }
    })
    }
    const pseudos = hosts.flatMap(measureHost)
    const sharedPseudos = sharedHost ? measureHost(sharedHost) : []
    const wrapper = el.closest('.ant-input-affix-wrapper, .ant-select, .ant-input-number, .ant-picker')
    const outlineOrShadow = ring(style) || pseudos.some((p) => p.ring) || sharedPseudos.some((p) => p.ring)
      || [wrapper, ...fieldHosts].some((node) => node !== null && node !== el && ring(getComputedStyle(node)))
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
    if (sharedPseudos.some((p) => p.visible && p.singleEdge)) issues.push('Odak işareti birden fazla kontrol taşıyan kapta çiziliyor.')
    return {
      selector: window.__mobileQA.selector(el), text: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 100),
      mode, issues, measurementIssues, captureKey, outline: style.outline, shadow: style.boxShadow, underline, pseudos,
      hosts: hosts.map((node) => window.__mobileQA.selector(node)), sharedHost: sharedHost && window.__mobileQA.selector(sharedHost),
      hostRect: { left: box.left, top: box.top, right: box.right, bottom: box.bottom },
    }
  }, { base64: screenshot?.toString('base64') ?? null, FIELD_HOSTS: FOCUS_FIELD_HOSTS })
}

export type FocusRecord = Omit<Awaited<ReturnType<typeof readFocus>>, 'captureKey'> & {
  step: string; screenshot: string; stableCapture: boolean; captureAttempts: number
}
export interface Audit { findings: Finding[]; samples: FocusRecord[]; dialogName: 'pass' | 'fail' | 'not_run' }

/** Odaklı kontrolü, alan kabını ve açık pencereyi etkileyen sonlu animasyonlar biter.
 *  Süre sınırı aşılırsa ölçüm sessizce devam etmez. Test açık bir hatayla durur. */
export async function settleFocusAnimations(page: Page, timeout = 3000) {
  const pending = await page.evaluate(async (limit) => {
    const deadline = performance.now() + limit
    const describe = (animation: Animation) => {
      const effect = animation.effect instanceof KeyframeEffect ? animation.effect : null
      const target = effect?.target
      const name = animation instanceof CSSTransition ? animation.transitionProperty
        : animation instanceof CSSAnimation ? animation.animationName : animation.id || 'animasyon'
      return `${target ? window.__mobileQA?.selector(target) ?? target.localName : '?'}${effect?.pseudoElement ?? ''} ${name}`
    }
    for (;;) {
      const el = document.activeElement
      const dialog = el?.closest('.ant-modal-root, .ant-modal-wrap, .ant-drawer, [role="dialog"]') ?? null
      const running = document.getAnimations().filter((animation) => {
        // Duraklatılmış animasyon kararlı bir durumdur. Bitmiş animasyon da beklenmez.
        if (animation.playState !== 'running') return false
        const effect = animation.effect
        // Sonsuz animasyon bitmez. Bu animasyonlar ölçümün kararlılık denetimine kalır.
        if (!effect || !Number.isFinite(effect.getComputedTiming().endTime)) return false
        const target = effect instanceof KeyframeEffect ? effect.target : null
        if (!target || !el) return false
        return target === el || target.contains(el) || el.contains(target) || Boolean(dialog?.contains(target))
      })
      if (running.length === 0) return []
      const left = deadline - performance.now()
      if (left <= 0) return running.map(describe)
      let timer = 0
      await Promise.race([
        Promise.allSettled(running.map((animation) => animation.finished)),
        new Promise<void>((resolve) => { timer = window.setTimeout(resolve, left) }),
      ])
      window.clearTimeout(timer)
    }
  }, timeout)
  if (pending.length > 0) {
    throw new Error(`Odak ölçümünden önce animasyonlar ${timeout} ms içinde bitmedi: ${pending.join(', ')}`)
  }
}

/** Odağı kararlı görüntüyle okur. Sonucu kaydetmez ve beklenti kurmaz. */
export async function captureFocus(page: Page) {
  await page.evaluate(async () => { await document.fonts.ready })
  await settleFocusAnimations(page)
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
  return { capture, stableCapture, captureAttempts }
}

export async function auditFocus(page: Page, info: TestInfo, audit: Audit, step: string, owner = 'İş 2') {
  const { capture, stableCapture, captureAttempts } = await captureFocus(page)
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
