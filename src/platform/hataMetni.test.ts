import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { hataMetni } from './hataMetni'

/**
 * Okuma ve yazma hatası üç şeyi söyler:
 * 1. Ne oldu? Örneğin "Plan kaydedilemedi."
 * 2. Veri güvende mi? Örneğin "Önceki kayıt duruyor."
 * 3. Şimdi ne yapılır? Örneğin "Yeniden deneyin."
 * Test, nokta ile biten hata cümlelerini tarar. Noktasız kısa başlıklar taranmaz.
 * Konsol kayıtları kullanıcıya görünmez. Bu yüzden taranmaz.
 */
const ROOT = join(__dirname, '..', '..')
const FAILURE = /(okunamadı|kaydedilemedi|yazılamadı|açılamadı|eklenemedi|değiştirilemedi|alınamadı|aktarılamadı|yarıda kaldı)/
const SAFE = /(güvende|değişmedi|duruyor|silinmedi|korunuyor)/
const NEXT = /(\p{L}+(?:in|ın|un|ün)\.)/u

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) return walk(full)
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [full] : []
  })

function messages(file: string): { where: string; text: string }[] {
  const found: { where: string; text: string }[] = []
  const sf = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node) && /^console\./.test(node.expression.getText())) return
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && FAILURE.test(node.text) && /\.$/.test(node.text.trim())) {
      found.push({ where: `${relative(ROOT, file)}:${sf.getLineAndCharacterOfPosition(node.getStart()).line + 1}`, text: node.text })
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return found
}

describe('okuma ve yazma hatası metinleri', () => {
  it('her hata cümlesi verinin durumunu ve sonraki adımı söyler', () => {
    const weak = walk(join(ROOT, 'src'))
      .flatMap(messages)
      .filter((m) => !SAFE.test(m.text) || !NEXT.test(m.text))
      .map((m) => `${m.where} ${m.text}`)
    expect(weak).toEqual([])
  })

  it('tarayıcının İngilizce hata metni yerine Türkçe yedek metin gösterilir', () => {
    expect(hataMetni(new DOMException('The quota has been exceeded.', 'QuotaExceededError'), 'Görev kaydedilemedi. Önceki kayıt duruyor. Yeniden deneyin.')).toBe('Görev kaydedilemedi. Önceki kayıt duruyor. Yeniden deneyin.')
    expect(hataMetni(new Error('Proje adını yazın.'), 'Yedek.')).toBe('Proje adını yazın.')
    expect(hataMetni('bilinmeyen', 'Yedek metin.')).toBe('Yedek metin.')
  })
})
