// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { control, density, gutter } from '../src/theme/tokens'
// @ts-expect-error .mjs dosyasının tür bildirimi yok; çalışma zamanında ESM olarak yüklenir.
import { checkCss, checkCustomProperties, checkProject, checkTsx, parseCss } from './check-ui.mjs'

const css = (s: string) => checkCss(s, 'a.css') as string[]
const tsx = (s: string) => checkTsx(s, 'a.tsx') as string[]

describe('CSS ve JavaScript yoğunluk sözleşmesi', () => {
  const tokenCss = readFileSync(new URL('../src/styles/temel/temel.css', import.meta.url), 'utf8')
  const densityFields = {
    '--padding-control-block': 'paddingBlock',
    '--padding-control-inline': 'paddingInline',
    '--padding-panel': 'paddingPanel',
    '--gap-control': 'gapControl',
    '--gap-content': 'gapContent',
    '--gap-section': 'gapSection',
  } as const

  function assertContract(source: string) {
    const rules = parseCss(source) as {
      selector: string
      atrules: string[]
      decls: { prop: string; value: string }[]
    }[]
    const declarations = (selector: string, media?: string) => Object.fromEntries(
      rules.filter((rule) => rule.selector.replace(/"/g, "'").split(',').map((part) => part.trim()).includes(selector)
        && (media ? rule.atrules.length === 1 && rule.atrules[0] === media : rule.atrules.length === 0))
        .flatMap((rule) => rule.decls.map(({ prop, value }) => [prop, value])),
    )
    const root = declarations(':root')
    expect(root['--hit-area-min']).toBe(`${control.hitArea}px`)
    expect(root['--gutter-page']).toBe(`${gutter.page}px`)
    expect(Object.keys(control.visual).sort()).toEqual(Object.keys(density).sort())

    for (const name of Object.keys(density) as (keyof typeof density)[]) {
      const values = declarations(`[data-density='${name}']`)
      expect(values['--control-visual-size']).toBe(`${control.visual[name]}px`)
      expect(values['--hit-area-min'] ?? root['--hit-area-min']).toBe(`${control.hitArea}px`)
      for (const [property, field] of Object.entries(densityFields)) {
        expect(values[property], `${name}: ${property}`).toBe(`${density[name][field]}px`)
        if (name === 'comfortable') expect(root[property], `:root: ${property}`).toBe(values[property])
      }
    }
    expect(root['--control-visual-size']).toBe(`${control.visual.comfortable}px`)
    const precision = declarations(':root', '@media (pointer: fine) and (hover: hover)')
    expect(precision['--gutter-page']).toBe(`${gutter.precision}px`)
    const touch = declarations('[data-density]', '@media (pointer: coarse), (any-pointer: coarse), (hover: none)')
    expect(touch['--gap-control']).toBe(`${density.comfortable.gapControl}px`)
  }

  it('gerçek CSS dosyasıyla dışa açılan alan ve yoğunluk sayılarını eşleştirir', () => {
    assertContract(tokenCss)
  })

  it.each(['--hit-area-min', '--control-visual-size', ...Object.keys(densityFields), '--gutter-page'])(
    '%s değeri tek kaynakta değişirse eşitlik denetimi başarısız olur', (property) => {
      const changed = tokenCss.replace(new RegExp(`(${property}:\\s*)\\d+px`), (_, prefix: string) => `${prefix}999px`)
      expect(changed).not.toBe(tokenCss)
      expect(() => assertContract(changed)).toThrow()
    },
  )

  it('kaldırılan yoğunluk alanını ve değişen hassas işaretçi boşluğunu reddeder', () => {
    expect(() => assertContract(tokenCss.replace(/--padding-panel:\s*\d+px;/g, ''))).toThrow()
    expect(() => assertContract(tokenCss.replace(
      /(@media \(pointer: fine\) and \(hover: hover\)\s*\{\s*:root\s*\{\s*--gutter-page:\s*)\d+px/,
      (_, prefix: string) => `${prefix}999px`,
    ))).toThrow()
  })
})

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

describe('(f) yalnız hover ile açılan eylem', () => {
  const hidden = '.row .actions { opacity: 0; }'
  const hover = '.row:hover .actions { opacity: 1; }'
  const focus = '.row:focus-within .actions { opacity: 1; }'
  const touch = '@media (hover: none), (any-pointer: coarse) { .row .actions { opacity: 1; } }'

  it('gizlenen eylem için klavye ve dokunma yollarını birlikte arar', () => {
    expect(css(hidden + hover).join('\n')).toContain('Hover')
    expect(css(hidden + hover + focus).join('\n')).toContain('dokunma')
    expect(css(hidden + hover + touch).join('\n')).toContain('klavye')
    expect(css(hidden + hover + focus + touch)).toEqual([])
  })

  it('virgüllü hover ve focus seçicilerini ayırır', () => {
    const both = '.row:hover .actions, .row:focus-within .actions { opacity: 1; }'
    expect(css(hidden + both).join('\n')).toContain('dokunma')
    expect(css(hidden + both + touch)).toEqual([])
    expect(css(hidden + '.row:is(:hover, :focus-within) .actions { opacity: 1; }' + touch)).toEqual([])
  })

  it('display ve visibility ile gizlenen eylemleri yakalar', () => {
    expect(css('.row button { display: none } .row:hover button { display: flex }').join('\n')).toContain('Hover')
    expect(css('.row a { visibility: hidden } .row:hover a { visibility: visible }').join('\n')).toContain('Hover')
  })

  it.each(['display: none', 'visibility: hidden'])(
    'inceleme MAJOR 3: %s durumunda gizli düğmenin kendi odağı erişim yolu değildir', (conceal) => {
      const reveal = conceal.startsWith('display') ? 'display: block' : 'visibility: visible'
      const source = `.row button { ${conceal} } .row:hover button { ${reveal} } .row button:focus-visible { ${reveal} } @media (hover: none) { .row button { ${reveal} } }`
      expect(css(source).join('\n')).toContain('klavye')
    },
  )

  it('inceleme MAJOR 3: görünür odaklanabilir üst tetikleyiciyi kabul eder', () => {
    const source = '[tabindex="0"].row button { display: none } [tabindex="0"].row:hover button { display: block } [tabindex="0"].row:focus-within button { display: block } @media (hover: none) { [tabindex="0"].row button { display: block } }'
    expect(css(source)).toEqual([])
  })

  it.each(['button[disabled]', 'button[tabindex="-1"]', 'input[type="hidden"]', '[tabindex="0"][inert]'])(
    'inceleme MAJOR 3: %s Tab tetikleyicisi değildir', (trigger) => {
      const source = `${trigger} .action { display: none } ${trigger}:hover .action { display: block } ${trigger}:focus-within .action { display: block } @media (hover: none) { ${trigger} .action { display: block } }`
      expect(css(source).join('\n')).toContain('klavye')
    },
  )

  it('inceleme MAJOR 3: görünmez üst tetikleyiciyi erişim güvencesi saymaz', () => {
    const source = '[tabindex="0"].row { opacity: 0 } [tabindex="0"].row .action { display: none } [tabindex="0"].row:hover .action { display: block } [tabindex="0"].row:focus-within .action { display: block } @media (hover: none) { [tabindex="0"].row .action { display: block } }'
    expect(css(source).join('\n')).toContain('klavye')
  })

  it('saydam alt eylemin üst öğesi klavye odağında da görünür olmalıdır', () => {
    const source = '.row { opacity: 0 } .row .actions { opacity: 0 } .row:hover { opacity: 1 } .row:hover .actions { opacity: 1 } .row:focus-within .actions { opacity: 1 } @media (hover: none) { .row, .row .actions { opacity: 1 } }'
    expect(css(source).join('\n')).toContain('klavye')
    expect(css(source + '.row:focus-within { opacity: 1 }')).toEqual([])
  })

  it('başka eylemin veya koşullu dokunma kuralının varlığını yeterli saymaz', () => {
    expect(css(hidden + hover + focus + '@media (hover: none) and (min-width: 900px) { .row .actions { opacity: 1 } }').join('\n')).toContain('dokunma')
    expect(css(hidden + hover + '.other:focus-within .actions { opacity: 1 }' + touch).join('\n')).toContain('klavye')
  })

  it('renk değişimini, saydam süsü ve hareket karelerini eylem saymaz', () => {
    expect(css('.row:hover button { color: red }')).toEqual([])
    expect(css('.row button { opacity: .5 } .row:hover button { opacity: 1 }')).toEqual([])
    expect(css('.row svg { opacity: 0 } .row:hover svg { opacity: 1 }')).toEqual([])
    expect(css('@keyframes reveal { from { opacity: 0 } to { opacity: 1 } }')).toEqual([])
    expect(css(hidden + hover + '.row .actions { opacity: 1 }')).toEqual([])
  })

  it('yalnız hover destekleyen girişte gizlemeyi ve görünür dokunma temelini gözetir', () => {
    const source = '.row .actions { opacity: 1 } @media (hover: hover) and (pointer: fine) {' + hidden + hover + focus + '}'
    expect(css(source)).toEqual([])
  })

  it('antd Popover hover ve focus tetiklerini dokunma yolu saymaz', () => {
    expect(tsx('<Popover trigger="hover" content={<button>Sil</button>} />').join('\n')).toContain('Hover')
    expect(tsx("<Popover trigger={['hover', 'focus']} />").join('\n')).toContain('Hover')
    expect(tsx('<Popover content="Bilgi" />').join('\n')).toContain('Hover')
    expect(tsx("<Popover trigger={['hover', 'click']} />")).toEqual([])
    expect(tsx('<Popover trigger="click" />')).toEqual([])
    expect(tsx('<Tooltip title="Açıklama" />')).toEqual([])
    expect(tsx('import { Popover as Help } from "antd"; const x = <Help trigger="hover" />').join('\n')).toContain('Hover')
  })
})

describe('(g) dokunma alanı', () => {
  it('inceleme MAJOR 1: düğmenin yerel ölçüsü kök değerini geçersiz kılar', () => {
    expect(css(':root { --hit-area-min: 44px } button { --hit-area-min: 24px; width: var(--hit-area-min); height: var(--hit-area-min) }').join('\n')).toContain('Dokunma alanı')
    expect(css(':root { --hit-area-min: 44px } button { --hit-area-min: calc(100% - 1px); min-width: var(--hit-area-min); width: 24px }').join('\n')).toContain('Dokunma alanı')
  })

  it('inceleme MAJOR 1: yoğunluk üst öğesinden gelen ölçüyü denetler', () => {
    const source = ':root { --hit-area-min: 44px } [data-density="dense"] { --hit-area-min: 24px } button { width: var(--hit-area-min); height: var(--hit-area-min) }'
    expect(css(source).join('\n')).toContain('Dokunma alanı')
    expect(css(source + 'button { min-width: 44px; min-height: 44px }')).toEqual([])
  })

  it('inceleme MAJOR 1: media içinde yalnız değişken değişse de alanı yeniden denetler', () => {
    const source = ':root { --hit-area-min: 44px } button { width: var(--hit-area-min); height: var(--hit-area-min) }'
    expect(css(source + '@media (max-width: 600px) { :root { --hit-area-min: 24px } }').join('\n')).toContain('Dokunma alanı')
    expect(css(source + '@media (pointer: coarse) { button { --hit-area-min: 24px } }').join('\n')).toContain('Dokunma alanı')
  })

  it('inceleme MAJOR 1: birlikte etkin media koşullarındaki değişkenleri birleştirir', () => {
    const source = ':root { --first: 44px; --second: 44px } button { width: max(var(--first), var(--second)) } @media (max-width: 600px) { button { --first: 24px } } @media (pointer: coarse) { button { --second: 24px } }'
    expect(css(source).join('\n')).toContain('Dokunma alanı')
  })

  it('inceleme MAJOR 1: sözde öğe yerel değişkeni düğmeden miras alır', () => {
    const base = ':root { --reach: -6px } .button { --reach: 0px; position: relative; border: 0; min-height: 32px; min-width: 44px } .button::after { content: ""; position: absolute; inset: var(--reach) 0 }'
    expect(css(base).join('\n')).toContain('Dokunma alanı')
    expect(css(base + '.button::after { --reach: -6px }')).toEqual([])
    expect(css(base + '@media (pointer: coarse) { .button::after { --reach: -6px } }').join('\n')).toContain('Dokunma alanı')
  })

  it('inceleme MAJOR 1: sözde öğenin koşullu daralması alan güvencesini kaldırır', () => {
    const base = ':root { --reach: -6px } .button { position: relative; border: 0; min-height: 32px; min-width: 44px } .button::after { content: ""; position: absolute; inset: var(--reach) 0 }'
    expect(css(base)).toEqual([])
    expect(css(base + '@media (pointer: coarse) { .button::after { --reach: 0px } }').join('\n')).toContain('Dokunma alanı')
  })

  it('inceleme MAJOR 1: bilinmeyen yerel değişken alan güvencesi değildir', () => {
    expect(css(':root { --hit-area-min: 44px } button { --hit-area-min: var(--missing); width: var(--hit-area-min); height: var(--hit-area-min) }').join('\n')).toContain('Dokunma alanı')
    expect(tsx('<button style={{ "--hit-area-min": "24px", width: "var(--hit-area-min)", height: "var(--hit-area-min)" }} />').join('\n')).toContain('Dokunma alanı')
    expect(tsx('<button style={{ "--hit-area-min": customSize, width: "var(--hit-area-min)" }} />').join('\n')).toContain('Dokunma alanı')
  })

  it('inceleme MAJOR 1: bilinmeyen azami alan sabit genişliği daraltabilir', () => {
    const source = 'button { --limit: calc(20px + 4px); width: 44px; max-width: var(--limit) }'
    expect(css(source).join('\n')).toContain('Dokunma alanı')
    expect(css(source + 'button { min-width: 44px }')).toEqual([])
  })

  it('doğrudan çözülemeyen üst sınırı güvenli alan saymaz', () => {
    const source = 'button { width: 44px; max-width: calc(20px + 4px) }'
    expect(css(source).join('\n')).toContain('Dokunma alanı')
    expect(css(source + 'button { min-width: 44px }')).toEqual([])
    expect(css('button { width: 44px; max-width: none }')).toEqual([])
  })

  it('inceleme MAJOR 2: where sıfır ağırlık taşır', () => {
    expect(css('button { width: 24px; min-width: 24px } :where(button) { min-width: 44px }').join('\n')).toContain('Dokunma alanı')
    expect(css(':where(button) { min-width: 24px } button { width: 24px; min-width: 44px }')).toEqual([])
    expect(css('button { width: 24px; min-width: 24px } :where(button) { min-width: 44px !important }')).toEqual([])
  })

  it('inceleme MAJOR 2: is en güçlü dalın ağırlığını korur', () => {
    expect(css(':is(button, #special) { min-width: 24px; width: 24px } button { min-width: 44px }').join('\n')).toContain('Dokunma alanı')
    expect(css('button { width: 24px; min-width: 24px } :is(:where(button), .safe) { min-width: 44px }')).toEqual([])
  })

  it.each(['width', 'height', 'min-width', 'min-height', 'inline-size', 'block-size', 'min-inline-size', 'min-block-size'])(
    'CSS %s için 44px altını bulur', (prop) => {
      expect(css(`button { ${prop}: 32px }`).join('\n')).toContain('Dokunma alanı')
      expect(css(`button { ${prop}: 44px }`)).toEqual([])
    },
  )

  it('aynı kuraldaki yeterli en küçük alanı ve mantıksal boyutları gözetir', () => {
    expect(css('button { width: 24px; height: 24px; min-width: 44px; min-height: 44px }')).toEqual([])
    expect(css('button { inline-size: 24px; block-size: 24px; min-inline-size: var(--hit-area-min); min-block-size: var(--hit-area-min) }')).toEqual([])
    expect(css('button { min-width: 0; height: 44px }')).toEqual([])
    expect(css('button { min-height: 32px; height: 48px }')).toEqual([])
    expect(css('button { min-width: 44px; min-height: 44px; max-width: 20px; max-height: 20px }')).toEqual([])
    expect(css('button { max-width: 20px }').join('\n')).toContain('Dokunma alanı')
    expect(css('button { min-height: 44px !important; min-height: 32px; height: 32px }')).toEqual([])
  })

  it('konumlanmış sözde öğenin açıkça genişlettiği dokunma alanını hesaba katar', () => {
    const base = '.button { position: relative; border: 0; min-height: 32px; min-width: 44px }'
    expect(css(base + '.button::after { content: ""; position: absolute; inset: -6px 0 }')).toEqual([])
    expect(css(base + '.button::after { content: ""; position: absolute; inset: -4px 0 }').join('\n')).toContain('Dokunma alanı')
    expect(css(base + '.button::after { content: ""; position: absolute; inset: -6px 0; pointer-events: none }').join('\n')).toContain('Dokunma alanı')
    expect(css(base + '.button { overflow: hidden } .button::after { content: ""; position: absolute; inset: -6px 0 }').join('\n')).toContain('Dokunma alanı')
    expect(css(base + '.button::after { content: ""; position: absolute; inset: -6px 0; display: none }').join('\n')).toContain('Dokunma alanı')
    expect(css(base + '.button { border: 2px solid red } .button::after { content: ""; position: absolute; inset: -6px 0 }').join('\n')).toContain('Dokunma alanı')
  })

  it('min alanını farklı kuraldan alır ve sonraki küçük geçersiz kılmayı yakalar', () => {
    expect(css('.ant-btn { min-height: 44px; min-width: 44px } .ant-btn.small { height: 24px; width: 24px }')).toEqual([])
    expect(css('.ant-btn { min-height: 44px } .ant-btn.small { min-height: 24px; height: 24px }').join('\n')).toContain('Dokunma alanı')
    expect(css('@media (min-width: 900px) { button { min-height: 44px } } button { height: 24px }').join('\n')).toContain('Dokunma alanı')
    expect(css('#a { min-height: 44px } button#a2 { height: 20px }').join('\n')).toContain('Dokunma alanı')
    expect(css('.row button { min-height: 44px } .row:hover button { height: 20px }')).toEqual([])
  })

  it('ikon, rozet ve dekoratif svg boyutlarını kontrol alanı saymaz', () => {
    expect(css('button svg { width: 16px; height: 16px } .ant-btn-icon { width: 16px } .badge { height: 24px }')).toEqual([])
    expect(css('.button-icon { width: 16px } .ant-badge-count { min-width: 20px }')).toEqual([])
    expect(tsx('<Icon size={12} /><svg width={16} height={16} /><Tag style={{ height: 24 }} />')).toEqual([])
    expect(tsx('<Button icon={<Icon style={{ width: 16, height: 16 }} />} />')).toEqual([])
    expect(tsx('<input type="hidden" style={{ height: 16 }} />')).toEqual([])
  })

  it('native kontrol, role ve satır içi boyutları okur', () => {
    expect(tsx('<button style={{ width: 24, height: 32 }} />').join('\n')).toContain('Dokunma alanı')
    expect(tsx('<span role="button" style={{ blockSize: "32px" }} />').join('\n')).toContain('Dokunma alanı')
    expect(tsx('<div onClick={() => save()} style={{ height: 32 }} />').join('\n')).toContain('Dokunma alanı')
    expect(tsx('<button style={{ width: 24, height: 24, minWidth: 44, minHeight: 44 }} />')).toEqual([])
    expect(tsx('<button style={{ inlineSize: 24, minInlineSize: "var(--hit-area-min)" }} />')).toEqual([])
  })

  it('Button small boyutu için alan güvencesi arar', () => {
    expect(tsx('<Button size="small" />').join('\n')).toContain('Dokunma alanı')
    expect(tsx('<Button size={"small"} />').join('\n')).toContain('Dokunma alanı')
    expect(tsx('<Button size="small" style={{ minHeight: 44, minWidth: 44 }} />')).toEqual([])
    expect(tsx('<Button size="small" style={{ minHeight: 44 }} />').join('\n')).toContain('Dokunma alanı')
    expect(tsx('import { Button as Action } from "antd"; const x = <Action size="small" />').join('\n')).toContain('Dokunma alanı')
    expect(tsx('const text = \'<Button size="small" />\'; // <button style={{height: 20}} />')).toEqual([])
    expect(tsx('import Button from "./Badge"; const x = <Button size="small" />')).toEqual([])
  })
})

describe('proje çapında dokunma alanı', () => {
  const scratch = join(process.cwd(), '.pane/scratch')
  const roots: string[] = []
  afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }) })

  function project(styles: string, component = '<Button size="small" style={{ height: 24, width: 24 }} />') {
    mkdirSync(scratch, { recursive: true })
    const root = mkdtempSync(join(scratch, 'ui-gate-test-'))
    roots.push(root)
    mkdirSync(join(root, 'src'))
    writeFileSync(join(root, 'src/main.tsx'), 'import "./base.css"; const view = ' + component)
    writeFileSync(join(root, 'src/base.css'), styles)
    return root
  }

  it('yüklenen ortak CSS min alanıyla Button small kullanımını değerlendirir', () => {
    const root = project(':root { --hit-area-min: 44px } .ant-btn { min-height: var(--hit-area-min); min-width: var(--hit-area-min) }')
    expect(checkProject(root)).toEqual([])
  })

  it('yüklenmeyen CSS ve dar koşullu düzeltme ihlali saklamaz', () => {
    const root = project('@media (pointer: coarse) { .ant-btn { min-height: 44px; min-width: 44px } }')
    writeFileSync(join(root, 'src/unused.css'), '.ant-btn { min-height: 44px; min-width: 44px }')
    expect(checkProject(root).join('\n')).toContain('Dokunma alanı')
  })

  it('CSS import zincirini ve tokenın küçültülmesini gözetir', () => {
    const root = project('@import "./tokens.css"; .ant-btn { min-height: var(--hit-area-min); min-width: var(--hit-area-min) }')
    writeFileSync(join(root, 'src/tokens.css'), ':root { --hit-area-min: 32px }')
    expect(checkProject(root).join('\n')).toContain('Dokunma alanı')
    writeFileSync(join(root, 'src/tokens.css'), ':root { --hit-area-min: 44px }')
    expect(checkProject(root)).toEqual([])
  })

  it('inline küçük min alanı ortak kuralı geçersiz kılar', () => {
    const root = project('.ant-btn { min-height: 44px; min-width: 44px }', '<Button size="small" style={{ minHeight: 24, height: 24 }} />')
    expect(checkProject(root).join('\n')).toContain('Dokunma alanı')
  })

  it('aynı sınıfın sözde öğeyle büyüyen gerçek alanını Button üzerinde de gözetir', () => {
    const root = project('.ant-btn { min-width: 44px; min-height: 44px } .toggle.ant-btn { position: relative; border: 0; min-height: 32px } .toggle.ant-btn::after { content: ""; position: absolute; inset: -6px 0 }', '<Button className="toggle" size="small" />')
    expect(checkProject(root)).toEqual([])
  })

  it('JSX bulgusunun satırını CSS dosyasından almaz', () => {
    const root = project('.ant-btn {\n min-height: 32px;\n min-width: 44px;\n}', '<Button size="small" />')
    expect(checkProject(root).filter((p: string) => p.startsWith('src/main.tsx:'))).toEqual([
      expect.stringMatching(/^src\/main\.tsx:1 Dokunma alanı/),
    ])
  })

  it('type-only import CSS kuralını yüklenmiş saymaz', () => {
    const root = project('')
    writeFileSync(join(root, 'src/main.tsx'), 'import type { Settings } from "./types"; const view = <Button size="small" />')
    writeFileSync(join(root, 'src/types.ts'), 'import "./base.css"; export type Settings = string')
    writeFileSync(join(root, 'src/base.css'), '.ant-btn { min-height: 44px; min-width: 44px }')
    expect(checkProject(root).join('\n')).toContain('Dokunma alanı')
  })
})

describe('(h) tanımsız CSS değişkeni', () => {
  const run = (files: Record<string, string>) => checkCustomProperties(Object.entries(files).map(([file, source]) => ({ file, source }))) as string[]

  it('tanımı olmayan var() kullanımını yakalar', () => {
    const problems = run({ 'src/a.css': '.kart { box-shadow: var(--shadow-card); }' })
    expect(problems).toEqual([expect.stringMatching(/^src\/a\.css:1 .*--shadow-card/)])
  })

  it('tanımsız hareket değişkenini yakalar', () => {
    expect(run({ 'src/a.css': '.x { transition: opacity var(--motion-yavas) var(--motion-ease); }', 'src/t.css': ':root { --motion-ease: ease; }' }).join('\n')).toContain('--motion-yavas')
  })

  it('başka CSS dosyasındaki tanımı ve yedek değeri kabul eder', () => {
    expect(run({
      'src/temel.css': ':root { --space-2: 8px; }',
      'src/a.css': '.x { padding: var(--space-2); color: var(--yok, red); }',
    })).toEqual([])
  })

  it('TypeScript içinde yazılan değişken adını ve palet anahtarını tanım sayar', () => {
    expect(run({
      'src/theme/tokens.ts': "export const light = {\n  surfaceWork: '#FFFFFF',\n} as const\nexport const dark = {\n  surfaceWork: '#000000',\n} as const\nvars['--shadow-card'] = 'none'",
      'src/a.css': '.x { background: var(--color-surface-work); box-shadow: var(--shadow-card); }',
    })).toEqual([])
  })

  it('TSX dizesindeki tanımsız değişkeni de yakalar', () => {
    expect(run({ 'src/a.tsx': 'const v = <Progress strokeColor="var(--color-yok)" />' }).join('\n')).toContain('--color-yok')
  })

  describe('dosyaya göre tanım kümesi', () => {
    const scratch = join(process.cwd(), '.pane/scratch')
    const roots: string[] = []
    afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }) })
    function project(files: Record<string, string>) {
      mkdirSync(scratch, { recursive: true })
      const root = mkdtempSync(join(scratch, 'var-gate-test-'))
      roots.push(root)
      for (const [file, source] of Object.entries(files)) {
        mkdirSync(join(root, file, '..'), { recursive: true })
        writeFileSync(join(root, file), source)
      }
      return (checkProject(root) as string[]).filter((p) => p.includes('tanımsız CSS değişkeni'))
    }

    it('birlikte yüklenmeyen CSS dosyasındaki tanımı kabul etmez', () => {
      const problems = project({
        'src/main.tsx': 'import "./temel.css"\nimport "./Ekran"',
        'src/temel.css': ':root { --space-2: 8px; }',
        'src/Ekran.tsx': 'import "./ekran.css"\nexport const x = 1',
        'src/ekran.css': '.e { padding: var(--space-2); margin: var(--yalniz-oteki); }',
        'src/Oteki.tsx': 'import "./oteki.css"\nexport const y = 1',
        'src/oteki.css': '.o { --yalniz-oteki: 4px; padding: var(--yalniz-oteki); }',
      })
      expect(problems).toEqual([expect.stringMatching(/^src\/ekran\.css:1 --yalniz-oteki/)])
    })

    it('getPropertyValue ile okunan adı tanım saymaz', () => {
      const problems = project({
        'src/main.tsx': 'import "./temel.css"\nconst v = getComputedStyle(document.body).getPropertyValue(\'--okunan\')',
        'src/temel.css': '.x { color: var(--okunan); }',
      })
      expect(problems.join('\n')).toContain('--okunan')
    })

    it('setProperty ve nesne anahtarı tanım sayılır', () => {
      expect(project({
        'src/main.tsx': 'import "./temel.css"\ndocument.body.style.setProperty(\'--yazilan\', \'1px\')\nconst s = { \'--anahtar\': \'2px\' }',
        'src/temel.css': '.x { margin: var(--yazilan); padding: var(--anahtar); }',
      })).toEqual([])
    })

    it('TypeScript yorumundaki adı tanım saymaz', () => {
      const problems = project({
        'src/main.tsx': 'import "./temel.css"\n// eski ad: \'--yorumda\'\n/* \'--blokta\' */\nexport {}',
        'src/temel.css': '.x { margin: var(--yorumda); padding: var(--blokta); }',
      })
      expect(problems.join('\n')).toContain('--yorumda')
      expect(problems.join('\n')).toContain('--blokta')
    })
  })

  it('gerçek projede tanımsız değişken kalmaz', () => {
    const problems = (checkProject(process.cwd()) as string[]).filter((p) => p.includes('tanımsız CSS değişkeni'))
    expect(problems).toEqual([])
  }, 30_000)
})
