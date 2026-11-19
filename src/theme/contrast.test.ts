// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { buildTheme } from './antdTheme'
import { chartSeries, cssVariables, dark, elevation, light, type ThemeMode } from './tokens'

/** WCAG 2.x göreli parlaklık ve karşıtlık oranı. */
function luminance(hex: string): number {
  const v = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(v.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}
/** CIE L* açıklık değeri. Yüzey basamaklarını ölçer. */
function lightness(hex: string): number {
  const y = luminance(hex)
  return y > 216 / 24389 ? 116 * Math.cbrt(y) - 16 : (y * 24389) / 27
}

const themes = { light, dark } as Record<ThemeMode, Record<string, string>>
const modes: ThemeMode[] = ['light', 'dark']

/** Metin çiftleri: en az 4,5:1 (WCAG 1.4.3). */
const textPairs: [string, string][] = [
  ...['surfacePage', 'surfaceWork', 'surfaceContext', 'surfaceSunken', 'selectedBg'].flatMap((bg) => [
    ['textPrimary', bg] as [string, string],
    ['textSecondary', bg] as [string, string],
  ]),
  ['actionText', 'surfaceWork'],
  ['actionText', 'surfacePage'],
  ['actionText', 'surfaceContext'],
  ['actionText', 'selectedBg'],
  ['onAction', 'actionPrimary'],
  ['onAction', 'actionHover'],
  ['statusOk', 'statusOkBg'],
  ['statusHold', 'statusHoldBg'],
  ['statusHarm', 'statusHarmBg'],
  ['statusInfo', 'statusInfoBg'],
  ...['surfaceWork', 'surfacePage', 'surfaceContext'].flatMap((bg) => [
    ['statusOk', bg] as [string, string],
    ['statusHold', bg] as [string, string],
    ['statusHarm', bg] as [string, string],
    ['statusInfo', bg] as [string, string],
  ]),
  ['heroText', 'heroSurface'],
  ['heroMuted', 'heroSurface'],
  ['heroText', 'heroSurfaceAlt'],
  ['heroMuted', 'heroSurfaceAlt'],
  ['heroActionText', 'heroAction'],
]

/** Metin dışı çiftler: en az 3:1 (WCAG 1.4.11). */
const uiPairs: [string, string][] = [
  ['actionPrimary', 'surfaceWork'],
  ['actionPrimary', 'surfacePage'],
  ['borderInput', 'surfaceWork'],
  ['borderInput', 'surfacePage'],
  ['borderInput', 'surfaceContext'],
  ['borderInput', 'selectedBg'],
  ['statusHarm', 'surfaceWork'],
  ['heroAction', 'heroSurface'],
]

describe.each(modes)('%s tema karşıtlığı', (mode) => {
  const p = themes[mode]

  it.each(textPairs)('%s metni %s üstünde en az 4,5:1', (fg, bg) => {
    expect(p[fg], fg).toMatch(/^#[0-9A-F]{6}$/i)
    expect(contrast(p[fg], p[bg])).toBeGreaterThanOrEqual(4.5)
  })

  it.each(uiPairs)('%s, %s üstünde en az 3:1', (fg, bg) => {
    expect(p[fg], fg).toMatch(/^#[0-9A-F]{6}$/i)
    expect(contrast(p[fg], p[bg])).toBeGreaterThanOrEqual(3)
  })

  it('odak işareti çalışma, sayfa ve bağlam yüzeyinde en az 3:1', () => {
    const marker = cssVariables(mode)['--focus-marker']
    for (const bg of ['surfaceWork', 'surfacePage', 'surfaceContext', 'selectedBg']) {
      expect(contrast(marker, p[bg]), bg).toBeGreaterThanOrEqual(3)
    }
  })

  it('karar renkleri çalışma yüzeyinde en az 4,5:1', async () => {
    const { decisionColors } = await import('./tokens')
    for (const [name, color] of Object.entries(decisionColors[mode])) {
      expect(contrast(color, p.surfaceWork), name).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('yüzey basamakları gözle ayrılır: sayfa ile çalışma, çalışma ile bağlam arasında en az 5 L*', () => {
    expect(Math.abs(lightness(p.surfaceWork) - lightness(p.surfacePage))).toBeGreaterThanOrEqual(5)
    expect(Math.abs(lightness(p.surfaceWork) - lightness(p.surfaceContext))).toBeGreaterThanOrEqual(5)
  })

  it('bağlam yüzeyi sayfa zemininden en az 2,5 L* ayrılır', () => {
    // Fare üzerine gelme, soluk etiket ve kapalı alan zemini bağlam yüzeyini kullanır.
    // Bu zeminler sayfa üstünde de görünür kalmalı.
    expect(Math.abs(lightness(p.surfacePage) - lightness(p.surfaceContext))).toBeGreaterThanOrEqual(2.5)
    // Açık temada bağlam yüzeyi sayfadan koyudur. Koyu temada yükselen yüzey açılır.
    if (mode === 'light') expect(lightness(p.surfaceContext)).toBeLessThan(lightness(p.surfacePage))
    else expect(lightness(p.surfaceContext)).toBeGreaterThan(lightness(p.surfacePage))
  })

  it('bağlam ile çukur yüzey arasında en az 2,5 L* fark vardır', () => {
    expect(Math.abs(lightness(p.surfaceContext) - lightness(p.surfaceSunken))).toBeGreaterThanOrEqual(2.5)
  })

  it('grafik seri renkleri çalışma yüzeyinde en az 3:1', () => {
    expect(chartSeries.length).toBeGreaterThan(0)
    for (const key of chartSeries) expect(contrast(p[key], p.surfaceWork), key).toBeGreaterThanOrEqual(3)
  })

  it('kart gölgesi koyu temada da ayrım kurar ve renkli vurgu kullanmaz', () => {
    const card = elevation[mode].card
    expect(card).not.toBe('none')
    if (mode === 'dark') {
      // Aynı tondaki iç içe kartı 1 piksellik kenar tokenı ayırır. Halka değil, sabit ayrım çizgisidir.
      expect(card).toContain(p.border)
      expect(card).not.toContain(p.actionPrimary)
    }
  })

  it('gölge tokenları CSS değişkeni olarak her temada tanımlı', () => {
    const vars = cssVariables(mode)
    expect(vars['--shadow-card']).toBeTruthy()
    expect(vars['--shadow-float']).toBeTruthy()
    expect(vars['--shadow-float']).not.toBe('none')
  })

  it('Ant Design birincil zemini seçili durum rengini kullanır, turuncu ton kullanmaz', () => {
    const t = buildTheme(mode).token!
    expect(t.colorPrimaryBg).toBe(p.selectedBg)
    expect(t.colorPrimaryBgHover).toBe(p.selectedBg)
    expect(t.colorPrimaryBorder).toBe(p.selectedBg)
    expect(t.colorLink).toBe(p.actionText)
    const c = buildTheme(mode).components!
    expect(c.Menu?.itemSelectedColor).toBe(p.actionText)
    expect(c.Tabs?.itemSelectedColor).toBe(p.actionText)
  })

  it('Ant Design eylem rengindeki yazıları koyu temada da okunur tutar', () => {
    const t = buildTheme(mode).token!
    const c = buildTheme(mode).components! as Record<string, Record<string, string>>
    expect(t.colorLinkHover).toBe(p.actionText)
    expect(c.Steps?.colorPrimaryHover).toBe(p.actionText)
    expect(c.Pagination?.itemActiveColor).toBe(p.actionText)
    expect(c.Pagination?.itemActiveColorHover).toBe(p.actionText)
    expect(contrast(c.Avatar.colorTextLightSolid, c.Avatar.colorTextPlaceholder)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(c.Badge.colorTextLightSolid, c.Badge.colorError)).toBeGreaterThanOrEqual(4.5)
  })

  it('Ant Design giriş kontrollerinin kenarı borderInput tokenından gelir', () => {
    const c = buildTheme(mode).components! as Record<string, Record<string, unknown>>
    for (const name of ['Input', 'InputNumber', 'Select', 'DatePicker', 'Checkbox', 'Radio']) {
      expect(c[name]?.colorBorder, name).toBe(p.borderInput)
    }
    expect(c.Button?.defaultBorderColor).toBe(p.borderInput)
    expect(c.Input?.hoverBorderColor).toBe(p.textSecondary)
    expect(c.Select?.hoverBorderColor).toBe(p.textSecondary)
  })
})

describe('palet anahtarları', () => {
  it('açık ve koyu temanın anahtarları aynıdır', () => {
    expect(Object.keys(dark).sort()).toEqual(Object.keys(light).sort())
  })
})

describe('eski turuncu palet kalıntısı', () => {
  const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')
  it('token açıklaması ve CSS yedek değeri turuncu rengi anmaz', () => {
    expect(read('./tokens.ts')).not.toMatch(/turuncu/i)
    expect(read('../styles/temel/temel.css')).not.toMatch(/#8f2812/i)
  })
  it('antdTheme birincil zemin için tone*Bg kullanmaz', () => {
    expect(read('./antdTheme.ts')).not.toMatch(/colorPrimary\w*:\s*p\.tone\w*Bg/)
  })
  it('kabuk "güncel" noktası turuncu ton kullanmaz', () => {
    expect(read('../styles/kabuk/kabuk.css')).not.toMatch(/--color-tone-orange/)
  })
})

describe('gölge tokenlarının CSS ve TypeScript eşitliği', () => {
  const css = readFileSync(new URL('../styles/temel/temel.css', import.meta.url), 'utf8')
  const read = (name: string) => new RegExp(`${name}:\\s*([^;]+);`).exec(css)?.[1].trim()
  it.each(['card', 'float', 'bar'] as const)('temel.css içindeki --shadow-%s açık tema değeriyle aynı', (name) => {
    expect(read(`--shadow-${name}`)).toBe(elevation.light[name])
  })
  it.each(['light', 'dark'] as const)('%s tema gölgeleri cssVariables ile satır içine yazılır', (mode) => {
    const vars = cssVariables(mode)
    expect(vars['--shadow-card']).toBe(elevation[mode].card)
    expect(vars['--shadow-float']).toBe(elevation[mode].float)
    expect(vars['--shadow-bar']).toBe(elevation[mode].bar)
  })
})

describe('modül CSS dosyaları', () => {
  /* Modül ekranları (Pj*, Dt*) renkleri yalnız paletten alır. Böylece yukarıdaki karşıtlık testleri onları da kapsar. */
  const dir = new URL('../styles/', import.meta.url)
  const files = ['bilesen', 'ekran'].flatMap((layer) => readdirSync(new URL(`${layer}/`, dir))
    .filter((name) => /^(Pj|Dt)[A-Z].*\.css$/.test(name)).map((name) => [`${layer}/${name}`, readFileSync(new URL(`${layer}/${name}`, dir), 'utf8')] as const))
  const paletteVars = new Set(Object.keys(cssVariables('light')))

  it('eylem dolgusu yazı rengi olarak kullanılmaz', () => {
    // Yazı --color-action-text kullanır. --color-action-primary yalnız dolgudur.
    for (const layer of ['temel', 'kabuk', 'bilesen', 'ekran', 'desen', 'giris', 'yazdirma']) {
      for (const name of readdirSync(new URL(`${layer}/`, dir)).filter((n) => n.endsWith('.css'))) {
        const text = readFileSync(new URL(`${layer}/${name}`, dir), 'utf8')
        expect(text, `${layer}/${name}`).not.toMatch(/(^|[;{\s])color:\s*var\(--color-action-primary\)/)
      }
    }
  })

  it('modül CSS dosyası bulunur', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it.each(files)('%s ham renk yazmaz ve yalnız tanımlı renk tokenı kullanır', (_name, source) => {
    const text = source.replace(/\/\*[\s\S]*?\*\//g, '')
    expect(text).not.toMatch(/#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/i)
    for (const m of text.matchAll(/var\(\s*(--color-[a-z0-9-]+)/g)) expect(paletteVars.has(m[1]), m[1]).toBe(true)
  })
})
