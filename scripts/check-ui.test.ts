// @vitest-environment node
import { describe, expect, it } from 'vitest'
// @ts-expect-error .mjs dosyasının tür bildirimi yok; çalışma zamanında ESM olarak yüklenir.
import { checkCss, checkTsx, parseCss } from './check-ui.mjs'

const css = (s: string) => checkCss(s, 'a.css') as string[]
const tsx = (s: string) => checkTsx(s, 'a.tsx') as string[]

describe('parseCss', () => {
  it('iç içe at-kurallarını ve bildirimleri okur', () => {
    const rules = parseCss('@media print {\n  .x:focus { outline: 2px solid red; }\n}\n.y { color: red }') as { selector: string; atrules: string[]; decls: { prop: string; line: number }[] }[]
    expect(rules).toHaveLength(2)
    expect(rules[0].selector).toBe('.x:focus')
    expect(rules[0].atrules).toEqual(['@media print'])
    expect(rules[0].decls[0]).toMatchObject({ prop: 'outline', line: 2 })
    expect(rules[1].decls[0].prop).toBe('color')
  })
})

describe('(a) yazı boyutu', () => {
  it('CSS içinde 14px altını yakalar', () => {
    expect(css('.a { font-size: 12px; }')).toEqual(['a.css:1 Yazı boyutu 12px. En az 14px olmalı.'])
    expect(css('.a { font-size: 0.75rem; }')).toHaveLength(1)
    expect(css('.a { font-size: clamp(12px, 2vw, 18px); }')).toHaveLength(1)
    expect(css('.a { font-size: 14px; } .b { font-size: 1rem }')).toEqual([])
  })
  it('satır içi fontSize sayısını yakalar', () => {
    expect(tsx("<span style={{ fontSize: 12 }} />")).toHaveLength(1)
    expect(tsx("<span style={{ fontSize: '13px' }} />")).toHaveLength(1)
    expect(tsx("<span style={{ fontSize: 14 }} /><Icon size={12} />")).toEqual([])
  })
})

describe('(b) hareket', () => {
  it('ham süre ve eğriyi yakalar, ortak değişkeni kabul eder', () => {
    expect(css('.a { transition: opacity 200ms ease; }')).toHaveLength(1)
    expect(css('.a { transition: opacity var(--motion-small) var(--motion-ease); }')).toEqual([])
    expect(css('.a { animation-duration: 300ms }')).toHaveLength(1)
  })
  it('transition: all yasak', () => {
    expect(css('.a { transition: all var(--motion-small) var(--motion-ease); }')).toEqual(['a.css:1 transition: all yasak. Değişen özelliği tek tek yazın.'])
  })
  it('prefers-reduced-motion bloğunu muaf tutar', () => {
    expect(css('@media (prefers-reduced-motion: reduce) { * { transition-duration: 0.01ms !important; } }')).toEqual([])
  })
  it('satır içi hareket değerlerini yakalar', () => {
    expect(tsx("style={{ transition: 'opacity 200ms ease' }}")).toHaveLength(1)
    expect(tsx("style={{ transitionDuration: '200ms' }}")).toHaveLength(1)
    expect(tsx('const o = { animationDuration: 320 }')).toHaveLength(1)
    expect(tsx('const o = { animationDuration: motion.page }')).toEqual([])
    expect(tsx("style={{ transition: 'opacity var(--motion-small) var(--motion-ease)' }}")).toEqual([])
  })
})

describe('(c) odak halkası', () => {
  it('odak kuralında outline ve box-shadow yasak', () => {
    expect(css('.a:focus-visible { outline: 2px solid red; }')).toHaveLength(1)
    expect(css('.a:focus { box-shadow: 0 0 0 3px blue; }')).toHaveLength(1)
    expect(css('.a:focus { outline: none; box-shadow: none; }')).toEqual([])
    expect(css('.a:focus { outline: 0 }')).toEqual([])
  })
  it('forced-colors bloğunu muaf tutar', () => {
    expect(css('@media (forced-colors: active) { html[data-focus-mode="keyboard"] :focus-visible { outline: 2px solid CanvasText; } }')).toEqual([])
  })
  it('satır içi outline yasak', () => {
    expect(tsx("style={{ outline: '2px solid red' }}")).toHaveLength(1)
    expect(tsx("style={{ outline: 'none' }}")).toEqual([])
  })
})

describe('(d) kavisli vurgu kenarı', () => {
  it('aynı CSS bloğunda tek kenar ve yuvarlatma yasak', () => {
    expect(css('.a { border-left: 4px solid red; border-radius: 8px; }')).toHaveLength(1)
    expect(css('.a { border-left: 4px solid red; border-radius: 0; }')).toEqual([])
    expect(css('.a { border-left: 4px solid red; } .b { border-radius: 8px }')).toEqual([])
  })
  it('aynı satır içi nesnede borderLeft ve borderRadius yasak', () => {
    expect(tsx("<div style={{ borderLeft: '4px solid red', borderRadius: 8 }} />")).toHaveLength(1)
    expect(tsx("<div style={{ borderLeft: `1px solid ${c}`, borderRadius: token.borderRadiusLG }} />")).toHaveLength(1)
    expect(tsx("<div style={{ borderRight: `1px solid ${c}`, padding: 8 }} />")).toEqual([])
  })
})

describe('(e) cihaz bayrağı', () => {
  it('isMobile ve userAgent kullanımını yakalar', () => {
    expect(tsx('const isMobile = window.innerWidth < 600')).toHaveLength(1)
    expect(tsx('if (/Android/.test(navigator.userAgent)) {}')).toHaveLength(1)
    expect(checkTsx('const mobile = navigator.userAgent', 'a.ts')).toHaveLength(1)
    expect(tsx("const bp = Grid.useBreakpoint()")).toEqual([])
  })
})

describe('çıktı biçimi', () => {
  it('dosya:satır ile başlar', () => {
    const out = css('.a {\n  color: red;\n  font-size: 10px;\n}')
    expect(out[0]).toMatch(/^a\.css:3 /)
  })
})
