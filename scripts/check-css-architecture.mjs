#!/usr/bin/env node
/*
 * CSS mimari kapısı. Kurallar docs/css-mimarisi.md belgesindedir.
 * Altı katman vardır: temel, kabuk, bilesen, ekran, giris ve yazdirma.
 * Kapı her CSS dosyasının doğru klasörde durduğunu ve doğru yerden yüklendiğini denetler.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, join, posix, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const LAYERS = ['temel', 'kabuk', 'bilesen', 'ekran', 'giris', 'yazdirma']

/* Giriş dosyasının bütün kuralları bu sorgunun içinde durmalıdır. */
export const INPUT_GUARDS = {
  'src/styles/giris/dokunma.css': /^\(\s*any-pointer\s*:\s*coarse\s*\)$/,
  'src/styles/giris/fare.css': /^\(\s*any-pointer\s*:\s*fine\s*\)\s+and\s+\(\s*any-hover\s*:\s*hover\s*\)$/,
}

const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, '')
const nameOf = (path) => basename(path).replace(/\.[^.]+$/, '')

/* Kaynak dosyadaki CSS içe aktarmalarını bulur. "@/" kısaltması src klasörüdür. */
function cssImports(source, file) {
  const found = []
  const pattern = /(?:import\s*\(?\s*|from\s+)['"]([^'"]+\.css)['"]/g
  for (const match of source.matchAll(pattern)) {
    const spec = match[1]
    let target
    if (spec.startsWith('@/')) target = posix.join('src', spec.slice(2))
    else if (spec.startsWith('.')) target = posix.normalize(posix.join(posix.dirname(file), spec))
    else continue
    found.push(target)
  }
  return found
}

/* Üst düzey blokları sırayla döndürür. Her blok başlığı ve içeriğiyle gelir. */
function topLevelBlocks(css) {
  const blocks = []
  let depth = 0
  let start = 0
  for (let i = 0; i < css.length; i += 1) {
    const c = css[i]
    if (c === '{') {
      if (depth === 0) blocks.push({ head: css.slice(start, i).trim(), bodyStart: i + 1 })
      depth += 1
    } else if (c === '}') {
      depth -= 1
      if (depth === 0) start = i + 1
    } else if (c === ';' && depth === 0) {
      const statement = css.slice(start, i).trim()
      if (statement) blocks.push({ head: statement, bodyStart: -1 })
      start = i + 1
    }
  }
  const tail = css.slice(start).trim()
  if (tail) blocks.push({ head: tail, bodyStart: -1 })
  return blocks
}

function allowedImporter(target, importer) {
  const layer = target.split('/')[2]
  const name = nameOf(target)
  switch (layer) {
    case 'temel':
      return importer === 'src/main.tsx'
    case 'kabuk':
      return importer === 'src/app/AppShell.tsx'
    case 'giris':
      return importer === 'src/app/girisStilleri.ts'
    case 'bilesen':
    case 'ekran':
      return nameOf(importer) === name
    case 'yazdirma':
      return importer.startsWith('src/screens/')
    default:
      return false
  }
}

/** files: dosya yolu → içerik. Yollar proje köküne göre ve "/" ayraçlıdır. */
export function checkCssArchitecture(files) {
  const errors = []
  const cssFiles = [...files.keys()].filter((path) => path.startsWith('src/') && path.endsWith('.css'))
  const sources = [...files.keys()].filter((path) => /^src\/.*\.(tsx?|jsx?)$/.test(path) && !/\.test\.|\.spec\./.test(path))
  const used = new Set()

  for (const css of cssFiles) {
    const parts = css.split('/')
    if (parts[1] !== 'styles' || !LAYERS.includes(parts[2]) || parts.length !== 4) {
      errors.push(`${css}: CSS dosyası izinli klasörde değil. İzinli klasörler: ${LAYERS.map((l) => `src/styles/${l}/`).join(', ')}`)
    }
  }

  for (const file of sources) {
    for (const target of cssImports(files.get(file), file)) {
      used.add(target)
      if (!files.has(target)) {
        errors.push(`${file}: ${target} dosyası bulunamadı.`)
        continue
      }
      const layer = target.split('/')[2]
      if (LAYERS.includes(layer) && !allowedImporter(target, file)) {
        errors.push(`${file}: ${target.replace('src/styles/', '')} dosyasını bu dosya içe aktaramaz. Kural: ${layer} katmanı.`)
      }
    }
  }

  for (const css of cssFiles) {
    if (!used.has(css)) errors.push(`${css}: Dosya hiçbir yerden içe aktarılmıyor. Dosya kullanılmıyor.`)
  }

  for (const [path, guard] of Object.entries(INPUT_GUARDS)) {
    if (!files.has(path)) continue
    for (const block of topLevelBlocks(stripComments(files.get(path)))) {
      const media = /^@media\s+(.+)$/s.exec(block.head)
      if (!media || !guard.test(media[1].trim())) {
        errors.push(`${path}: "${block.head.slice(0, 60)}" kuralı katmanın kendi sorgusunun dışında. Her kural sorgu içinde durmalı.`)
      }
    }
  }
  return errors
}

function walk(directory, root, out) {
  for (const entry of readdirSync(directory)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue
    const full = join(directory, entry)
    if (statSync(full).isDirectory()) walk(full, root, out)
    else if (/\.(css|tsx?|jsx?)$/.test(entry)) out.set(relative(root, full).split('\\').join('/'), readFileSync(full, 'utf8'))
  }
  return out
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(fileURLToPath(new URL('../', import.meta.url)))
  const errors = checkCssArchitecture(walk(join(root, 'src'), root, new Map()))
  if (errors.length) {
    console.error(`CSS mimari kapısı ${errors.length} ihlal buldu:`)
    for (const error of errors) console.error(`  ${error}`)
    process.exit(1)
  }
  console.log('CSS mimari kapısı temiz. Altı katman kuralı geçti.')
}
