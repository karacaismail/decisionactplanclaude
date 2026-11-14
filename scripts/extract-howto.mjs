#!/usr/bin/env node
/**
 * Karar Kitabı kaynağından yöntem yardımını çıkarır.
 * Kullanım: node scripts/extract-howto.mjs <kitap klasörü> <çıktı dosyası> [yöntem numaraları]
 * Çıktı ham metindir. Ham metin uygulamaya doğrudan girmez. Önce yalın dille yeniden yazılır.
 * Yeniden yazılmış metin src/data/models-howto.json dosyasında durur.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const [bookDir, outFile, only] = process.argv.slice(2)
if (!bookDir || !outFile) {
  console.error('Kullanım: node scripts/extract-howto.mjs <kitap klasörü> <çıktı dosyası> [1,2,3]')
  process.exit(1)
}
const dataDir = join(resolve(bookDir), 'src', 'data')
const catalog = JSON.parse(readFileSync(new URL('../src/data/models.json', import.meta.url), 'utf8'))
const wanted = only ? new Set(only.split(',').map(Number)) : null

const bySlug = new Map()
for (const file of readdirSync(dataDir).filter((f) => /^section.*\.ts$/.test(f)).sort()) {
  const mod = await import(pathToFileURL(join(dataDir, file)).href)
  for (const list of Object.values(mod)) if (Array.isArray(list)) for (const m of list) bySlug.set(m.slug, m)
}

const out = []
for (const entry of catalog) {
  if (wanted && !wanted.has(entry.g)) continue
  const model = bySlug.get(entry.slug)
  if (!model) throw new Error(`Kitapta bulunamadı: ${entry.g} ${entry.slug}`)
  const page = model.pages.find((p) => p.slug === 'uygulama')
  const blocks = page?.blocks ?? []
  out.push({
    g: entry.g,
    title: entry.title,
    question: entry.question,
    simple: entry.simple ?? null,
    example: entry.example?.text ?? null,
    steps: blocks.filter((b) => b.t === 'steps').flatMap((b) => b.items.map((i) => ({ title: i.title, text: i.text }))),
    warn: blocks.filter((b) => b.t === 'callout' && b.kind === 'warn').map((b) => b.text),
    tip: blocks.filter((b) => b.t === 'callout' && b.kind === 'tip').map((b) => b.text),
  })
}
writeFileSync(resolve(outFile), JSON.stringify(out, null, 2))
const sum = (f) => out.reduce((n, m) => n + f(m), 0)
console.log(`${out.length} yöntem, ${sum((m) => m.steps.length)} adım, ${sum((m) => m.warn.length)} uyarı, ${sum((m) => m.tip.length)} ipucu`)
