import { afterEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import ts from 'typescript'
import { EmptyState } from './EmptyState'

/* React act ortamı. Testte zamanlanan güncellemeler act içinde biter. */
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

describe('ortak boş durum', () => {
  let root: Root | null = null
  let host: HTMLElement
  afterEach(() => {
    act(() => root?.unmount())
    root = null
    host?.remove()
  })
  function mount(node: React.ReactNode) {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    act(() => root!.render(node))
  }

  it('başlık, tek açıklama ve tek eylem gösterir', () => {
    mount(<EmptyState title="Henüz kanıt yok" text="İlk görüşme notunuzu ekleyince kanıt burada görünür." action={<button type="button">Kanıt ekle</button>} />)
    const box = host.querySelector('.empty-state')!
    expect(box.getAttribute('role')).toBe('status')
    expect(box.querySelector('h2')?.textContent).toBe('Henüz kanıt yok')
    expect(box.querySelectorAll('p')).toHaveLength(1)
    expect(box.querySelector('.empty-actions button')?.textContent).toBe('Kanıt ekle')
  })

  it('başlık düzeyi bulunduğu bölüme göre seçilir', () => {
    mount(<EmptyState level={4} title="Ölçüm bekleniyor" text="Adımı doldurunca grafik çizilir." action={<a href="#/">Adımı aç</a>} />)
    expect(host.querySelector('h4')?.textContent).toBe('Ölçüm bekleniyor')
    expect(host.querySelector('h2')).toBeNull()
  })

  it('eylemsiz boş durum düğme alanı çizmez', () => {
    mount(<EmptyState title="Sonuç yok" text="Başka bir kelime deneyin." actionless="Arama kutusu bu panelin üstünde duruyor." />)
    expect(host.querySelector('.empty-actions')).toBeNull()
    expect(host.querySelector('p')?.textContent).toBe('Başka bir kelime deneyin.')
  })
})

/*
 * Kaynak taraması. Her boş durum bir eylem verir ya da eylemsizliğin nedenini yazar.
 * Başlık en çok 6 kelimedir. Açıklama en çok 3 cümledir. Her cümle en çok 15 kelimedir.
 */
const ROOT = join(__dirname, '..', '..')
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) return walk(full)
    return /\.tsx$/.test(name) && !/\.test\.tsx$/.test(name) ? [full] : []
  })
const sources = walk(join(ROOT, 'src'))

type Site = { where: string; props: Map<string, ts.JsxAttribute['initializer']> }
const sites: Site[] = []
for (const file of sources) {
  const text = readFileSync(file, 'utf8')
  if (!text.includes('<EmptyState')) continue
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const visit = (node: ts.Node) => {
    if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && node.tagName.getText() === 'EmptyState') {
      const props = new Map<string, ts.JsxAttribute['initializer']>()
      for (const attr of node.attributes.properties) if (ts.isJsxAttribute(attr)) props.set(attr.name.getText(), attr.initializer)
      sites.push({ where: `${relative(ROOT, file)}:${sf.getLineAndCharacterOfPosition(node.getStart()).line + 1}`, props })
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
}

const literal = (init: ts.JsxAttribute['initializer']): string | null => {
  if (!init) return null
  if (ts.isStringLiteral(init)) return init.text
  if (ts.isJsxExpression(init) && init.expression && (ts.isStringLiteral(init.expression) || ts.isNoSubstitutionTemplateLiteral(init.expression))) return init.expression.text
  return null
}
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

describe('boş durum kullanımları', () => {
  it('ekranlar ortak boş durumu kullanır', () => {
    expect(sites.length).toBeGreaterThanOrEqual(20)
  })

  it('her boş durumun açıklaması ve eylemi ya da eylemsizlik nedeni vardır', () => {
    const missing = sites.filter((s) => !s.props.has('text') || (s.props.has('action') === s.props.has('actionless'))).map((s) => s.where)
    expect(missing).toEqual([])
  })

  it('başlık kısa, açıklama cümleleri yalındır', () => {
    const long: string[] = []
    for (const s of sites) {
      const title = literal(s.props.get('title'))
      if (title && words(title) > 6) long.push(`${s.where} başlık ${words(title)} kelime`)
      const text = literal(s.props.get('text'))
      if (!text) continue
      const sentences = text.split(/(?<=[.?!])\s+/).filter(Boolean)
      if (sentences.length > 3) long.push(`${s.where} açıklama ${sentences.length} cümle`)
      for (const sentence of sentences) if (words(sentence) > 15) long.push(`${s.where} cümle ${words(sentence)} kelime`)
    }
    expect(long).toEqual([])
  })

  it('Ant Design boş görünümü ekranlarda kullanılmaz', () => {
    const raw = sources
      .filter((file) => !file.endsWith('EmptyState.tsx'))
      .filter((file) => /import\s*\{[^}]*\bEmpty\b[^}]*\}\s*from\s*['"]antd['"]|<Empty[\s/>]/.test(readFileSync(file, 'utf8')))
      .map((file) => relative(ROOT, file))
    expect(raw).toEqual([])
  })
})
