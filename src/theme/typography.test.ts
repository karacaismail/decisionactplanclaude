// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { buildTheme } from './antdTheme'
import { font, motion } from './tokens'

/**
 * Yazı ölçeği ve hareket tokenları tek kaynaktan gelir.
 * temel.css ilk açılış için değerleri taşır. tokens.ts ile eşitliği burada korunur.
 */
const css = readFileSync(new URL('../styles/temel/temel.css', import.meta.url), 'utf8')
const rootValue = (name: string) => new RegExp(`${name}:\\s*([^;]+);`).exec(css)?.[1].trim()
const ruleBody = (selector: string) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`).exec(css)?.[1] ?? ''
}
const declaration = (body: string, prop: string) => new RegExp(`(?:^|[;{\\s])${prop}:\\s*([^;]+)`).exec(body)?.[1].trim()

describe('yazı ölçeği', () => {
  it('ölçek yalnız izinli basamakları taşır', () => {
    expect([font.helper, font.body, font.subsection, font.section, font.h2, font.h1Min, font.h1Max, font.stat]).toEqual([14, 16, 18, 20, 24, 28, 36, 36])
    expect(font.h1).toBe(`clamp(${font.h1Min}px, 2.4vw + 20px, ${font.h1Max}px)`)
  })

  it.each([
    ['--font-helper', () => `${font.helper}px`],
    ['--font-body', () => `${font.body}px`],
    ['--font-subsection-title', () => `${font.subsection}px`],
    ['--font-section-title', () => `${font.section}px`],
    ['--font-h2', () => `${font.h2}px`],
    ['--font-page-title', () => font.h1],
    ['--font-stat-value', () => `${font.stat}px`],
    ['--font-family', () => font.family],
  ])('temel.css içindeki %s tokens.ts ile aynı', (name, expected) => {
    expect(rootValue(name)).toBe(expected())
  })

  it('ölçek dışı eski basamaklar temel.css içinde kalmaz', () => {
    for (const name of ['--font-page-description', '--font-section-title', '--font-subsection-title']) {
      expect(rootValue(name), name).not.toMatch(/^(15|17|19|22|26|30|34)px$/)
    }
  })

  it('Ant Design başlık boyutları aynı ölçekten gelir', () => {
    const t = buildTheme('light').token!
    expect(t.fontSize).toBe(font.body)
    expect(t.fontSizeSM).toBe(font.helper)
    expect(t.fontSizeLG).toBe(font.body)
    expect(t.fontSizeHeading1).toBe(font.h1Min)
    expect(t.fontSizeHeading2).toBe(font.h2)
    expect(t.fontSizeHeading3).toBe(font.section)
    expect(t.fontSizeHeading4).toBe(font.subsection)
    expect(t.fontSizeHeading5).toBe(font.body)
    expect(t.lineHeightHeading1).toBeGreaterThanOrEqual(1.2)
    expect(t.fontFamily).toBe(font.family)
  })

  it('gövde Outfit ailesini doğrudan alır ve harf aralığını daraltmaz', () => {
    const body = ruleBody('body')
    expect(declaration(body, 'font-family')).toBe('var(--font-family)')
    expect(declaration(body, 'font-size')).toBe('var(--font-body)')
    expect(declaration(body, 'letter-spacing') ?? '0').toMatch(/^(0|normal)$/)
    expect(font.family.startsWith("'Outfit'")).toBe(true)
  })

  it('sayfa başlığında satır yüksekliği en az 1,2 ve harf aralığı en az -0,02em', () => {
    const h1 = ruleBody('h1.page-title')
    expect(declaration(h1, 'font-size')).toBe('var(--font-page-title)')
    expect(Number(declaration(h1, 'line-height'))).toBeGreaterThanOrEqual(1.2)
    expect(parseFloat(declaration(h1, 'letter-spacing') ?? '0')).toBeGreaterThanOrEqual(-0.02)
  })
})

describe('hareket tokenları', () => {
  it('temel.css eğrisi tokens.ts ile aynı', () => {
    expect(rootValue('--motion-ease')).toBe(motion.ease)
  })
  it.each(['micro', 'small', 'panel', 'page'] as const)('temel.css --motion-%s süresi tokens.ts ile aynı', (name) => {
    expect(rootValue(`--motion-${name}`)).toBe(`${motion[name]}ms`)
  })
  it('azaltılmış hareket bloğu yumuşak kaydırmayı da kapatır', () => {
    const block = /@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? ''
    expect(block).toMatch(/transition-duration:\s*0\.01ms/)
    expect(block).toMatch(/scroll-behavior:\s*auto/)
  })
})
