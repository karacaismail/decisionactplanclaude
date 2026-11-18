import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/*
 * Phosphor ikonları size değerini SVG width ve height özniteliğine yazar.
 * SVG özniteliği CSS değişkeni kabul etmez. Safari bunu konsolda hata sayar.
 * Ikon boyutu bu yüzden CSS sınıfıyla verilir.
 */
function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sources(path)
    return /\.tsx$/.test(name) && !/\.test\.tsx$/.test(name) ? [path] : []
  })
}

describe('ikon boyutu', () => {
  it('SVG ikonuna size özniteliğiyle CSS değişkeni verilmez', () => {
    const root = join(process.cwd(), 'src')
    const found = sources(root).flatMap((file) => readFileSync(file, 'utf8')
      .split('\n')
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => [...line.matchAll(/<((?:[a-z]\w*\.)?[A-Z]\w*)\b[^<>]*?\bsize=(?:"var\(|\{\s*['"`]var\()/g)]
        // Drawer ve Modal boyutu CSS stiline yazar. Bu bileşenler SVG değildir.
        .some((match) => !['Drawer', 'Modal'].includes(match[1])))
      .map(({ index }) => `${file.slice(root.length + 1)}:${index + 1}`))
    expect(found).toEqual([])
  })
})
