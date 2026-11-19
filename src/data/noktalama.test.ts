import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/**
 * Görünen metinde noktalı virgül ve uzun çizgi kullanılmaz. Her fikir ayrı cümle olur.
 * Test kaynak koddaki metinleri, JSX yazılarını ve JSON değerlerini tarar.
 * Yorumlara, düzenli ifadelere ve içe aktarma yollarına bakmaz.
 * Noktalı virgül yalnız harften ya da tırnaktan sonra boşlukla gelirse cümle işareti sayılır.
 * Örneğin CSS ya da kod metnindeki "a;b" yakalanmaz.
 */
const ROOT = join(__dirname, '..', '..')
const PROSE_SEMICOLON = /[\p{L}\p{N}"'”)]\s*;\s/u
const EM_DASH = /—/

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) return walk(full)
    return /\.(tsx?|json)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [full] : []
  })

type Hit = { where: string; text: string }

function scanSource(file: string, source: string): Hit[] {
  const hits: Hit[] = []
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) return
    let text: string | undefined
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isJsxText(node)) text = node.text
    else if (ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) text = node.text
    if (text && (EM_DASH.test(text) || PROSE_SEMICOLON.test(` ${text} `))) {
      hits.push({ where: `${relative(ROOT, file)}:${sf.getLineAndCharacterOfPosition(node.getStart()).line + 1}`, text: text.trim().slice(0, 100) })
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return hits
}

function scanJson(file: string, source: string): Hit[] {
  const hits: Hit[] = []
  const visit = (value: unknown, path: string) => {
    if (typeof value === 'string') {
      if (EM_DASH.test(value) || PROSE_SEMICOLON.test(` ${value} `)) hits.push({ where: `${relative(ROOT, file)} ${path}`, text: value.slice(0, 100) })
    } else if (Array.isArray(value)) value.forEach((v, i) => visit(v, `${path}[${i}]`))
    else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) visit(v, `${path}.${k}`)
  }
  visit(JSON.parse(source), '$')
  return hits
}

describe('görünen metnin noktalaması', () => {
  it('yakalayıcı cümle işaretini bulur, kod işaretini bulmaz', () => {
    expect(scanSource('a.tsx', 'const a = "Önce yazın; sonra kaydedin."').length).toBe(1)
    expect(scanSource('a.tsx', 'const a = <p>Bu adım bitti — sonrakine geçin.</p>').length).toBe(1)
    expect(scanSource('a.ts', "const css = 'a;b'").length).toBe(0)
    expect(scanSource('a.ts', '// Yorumda; işaret serbesttir — test bakmaz.\nconst a = 1').length).toBe(0)
    expect(scanJson('a.json', '{"t": "Bir; iki"}').length).toBe(1)
  })

  it('src altındaki metinlerde noktalı virgül ve uzun çizgi yok', () => {
    const hits = walk(join(ROOT, 'src')).flatMap((file) => {
      const source = readFileSync(file, 'utf8')
      return file.endsWith('.json') ? scanJson(file, source) : scanSource(file, source)
    })
    expect(hits.map((h) => `${h.where} ${h.text}`)).toEqual([])
  })
})
