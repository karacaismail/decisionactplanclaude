#!/usr/bin/env node
/*
 * Modül sınır kapısı. Kurallar docs/moduller/mimari.md belgesindedir.
 * Kapı içe aktarmaları okur. Kod çalıştırmaz.
 *
 * Kurallar:
 * 1. Modül yalnız kendini, @/contracts, @/platform, @/components, @/theme ve npm paketlerini içe aktarır.
 *    Modül kendi CSS dosyasını @/styles altından alır. CSS kuralları ayrı kapıdadır.
 *    Grafik paketleri yalnız dinamik içe aktarmayla gelir.
 * 2. Modül bildirimi (manifest.ts) React içe aktarmaz. Durağan değer yalnız @/platform altından gelir.
 *    Ekran ve yaşam döngüsü dinamik içe aktarmayla gelir.
 * 3. Çekirdek modülü içe aktarmaz. Modül klasörünü yalnız src/platform/modules.ts tarar.
 * 4. Sözleşme katmanı yalnız @/data/types ve saf seçicileri içe aktarır. npm paketi kullanmaz.
 * 5. Altyapı çekirdeği ve modülü içe aktarmaz. Sözleşme tiplerini yalnız "import type" ile alır.
 * 6. Modül ortak bileşen üzerinden de plan deposuna, kabuğa ya da çekirdek ekranlara ulaşamaz.
 *    Kapı içe aktarma zincirini izler. Örneğin plan deposuna yazan bir bileşen modülde kullanılamaz.
 * 7. Modül altyapının çekirdeğe ayrılmış parçalarını kullanmaz. Örneğin yaşam döngüsü ve kayıt işlevleri.
 * 8. Modülde dinamik içe aktarmanın yolu sabit metin olur. Böylece kapı yolu okuyabilir.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, posix, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

/** Sözleşme katmanının okuyabildiği saf dosyalar. */
export const CONTRACT_ALLOWED = new Set(['src/data/types', 'src/engine/strategy', 'src/engine/position'])
/** Modülün durağan içe aktaramayacağı grafik paketleri. */
export const CHART_PACKAGES = ['echarts', 'zrender', 'echarts-for-react']
const MODULE_SHARED = ['src/contracts', 'src/platform', 'src/components', 'src/theme', 'src/styles']
const MANIFEST_FORBIDDEN = ['react', 'react-dom', 'antd', '@phosphor-icons/react']
const GLOB_OWNER = 'src/platform/modules.ts'
/** Modülün dolaylı olarak da ulaşamayacağı çekirdek klasörleri. */
export const CORE_WRITERS = ['src/store', 'src/app', 'src/screens']
/** Altyapının yalnız çekirdeğe ayrılmış dosyaları. */
export const CORE_ONLY_PLATFORM = ['src/platform/lifecycle', 'src/platform/modules', 'src/platform/manifest']
/** Altyapının yalnız çekirdeğe ayrılmış işlevleri. */
export const CORE_ONLY_NAMES = ['registerPlanCommands', 'registerPlanSource', 'setDefaultKvStore', 'getDefaultKvStore']

const isTest = (file) => /\.(test|spec)\.[cm]?[jt]sx?$/.test(file)
const stripExt = (path) => path.replace(/\.(d\.ts|tsx?|jsx?|mjs|cjs)$/, '').replace(/\/index$/, '')
const under = (path, dir) => path === dir || path.startsWith(`${dir}/`)
const packageName = (spec) => (spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0])

/** Kaynak dosyadaki içe aktarmaları bulur. Her kayıt: belirteç, tür ve yalnız tip mi. */
export function importsOf(source, file) {
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
  const found = []
  const visit = (node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause
      const typeOnly = Boolean(clause && (clause.isTypeOnly || (!clause.name && clause.namedBindings && ts.isNamedImports(clause.namedBindings) && clause.namedBindings.elements.length > 0 && clause.namedBindings.elements.every((e) => e.isTypeOnly))))
      const names = clause?.namedBindings && ts.isNamedImports(clause.namedBindings) ? clause.namedBindings.elements.map((e) => (e.propertyName ?? e.name).text) : []
      found.push({ spec: node.moduleSpecifier.text, kind: 'static', typeOnly, names })
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const names = node.exportClause && ts.isNamedExports(node.exportClause) ? node.exportClause.elements.map((e) => (e.propertyName ?? e.name).text) : []
      found.push({ spec: node.moduleSpecifier.text, kind: 'static', typeOnly: node.isTypeOnly, names })
    } else if (ts.isCallExpression(node)) {
      const [arg] = node.arguments
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword && arg && ts.isStringLiteralLike(arg)) {
        found.push({ spec: arg.text, kind: 'dynamic', typeOnly: false })
      } else if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        found.push({ spec: arg ? arg.getText(sf) : '', kind: 'dynamic', typeOnly: false, nonLiteral: true })
      } else if (ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'glob' && node.expression.expression.getText(sf) === 'import.meta') {
        const patterns = arg && ts.isArrayLiteralExpression(arg) ? arg.elements : arg ? [arg] : []
        for (const p of patterns) if (ts.isStringLiteralLike(p)) found.push({ spec: p.text, kind: 'glob', typeOnly: false })
      }
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) {
      found.push({ spec: node.argument.literal.text, kind: 'static', typeOnly: true })
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return found
}

/** Belirteci proje köküne göre yola çevirir. npm paketi için null döner. */
function target(spec, file) {
  if (spec.startsWith('@/')) return stripExt(posix.join('src', spec.slice(2)))
  if (spec.startsWith('.')) return stripExt(posix.normalize(posix.join(posix.dirname(file), spec)))
  return null
}

function layerOf(file) {
  if (under(file, 'src/modules')) return { layer: 'modul', module: file.split('/')[2] }
  if (under(file, 'src/contracts')) return { layer: 'sozlesme' }
  if (under(file, 'src/platform')) return { layer: 'altyapi' }
  return { layer: 'cekirdek' }
}

/** Uzantısız yolu gerçek dosyaya çevirir. Bulamazsa undefined döner. */
function resolveFile(path, files) {
  for (const candidate of [path, `${path}.ts`, `${path}.tsx`, `${path}.js`, `${path}.mjs`, `${path}/index.ts`, `${path}/index.tsx`]) {
    if (files.has(candidate)) return candidate
  }
  return undefined
}

/**
 * Modül dışındaki bir dosyadan başlayıp içe aktarma zincirini izler.
 * Zincir çekirdeğin yazan klasörüne ulaşırsa ulaşılan dosyayı döndürür.
 */
function reachesCoreWriter(start, files, graph, cache) {
  if (cache.has(start)) return cache.get(start)
  cache.set(start, undefined)
  const pending = [start]
  const seen = new Set([start])
  let hit
  while (pending.length && !hit) {
    const file = pending.pop()
    if (CORE_WRITERS.some((dir) => under(stripExt(file), dir))) {
      hit = file
      break
    }
    for (const next of graph(file)) {
      if (!seen.has(next) && !under(next, 'src/modules')) {
        seen.add(next)
        pending.push(next)
      }
    }
  }
  cache.set(start, hit)
  return hit
}

/** files: dosya yolu → içerik. Yollar proje köküne göre ve "/" ayraçlıdır. */
export function checkModuleBoundaries(files) {
  const errors = []
  const sources = [...files.keys()].filter((p) => /^src\/.*\.(tsx?|jsx?|mjs)$/.test(p) && !isTest(p))
  const parsed = new Map()
  const importsCached = (file) => {
    if (!parsed.has(file)) parsed.set(file, files.has(file) ? importsOf(files.get(file), file) : [])
    return parsed.get(file)
  }
  /* Değer taşıyan içe aktarmaların hedef dosyaları. Tip içe aktarması kod taşımaz. */
  const graph = (file) => importsCached(file)
    .filter((imp) => !imp.typeOnly && imp.kind !== 'glob' && !imp.nonLiteral)
    .map((imp) => target(imp.spec, file))
    .filter(Boolean)
    .map((path) => resolveFile(path, files))
    .filter(Boolean)
  const reachCache = new Map()
  for (const file of sources) {
    const { layer, module } = layerOf(file)
    const isManifest = layer === 'modul' && file === `src/modules/${module}/manifest.ts`
    for (const imp of importsCached(file)) {
      const path = imp.nonLiteral ? null : target(imp.spec, file)
      const say = (rule) => errors.push(`${file}: "${imp.spec}" içe aktarılamaz. ${rule}`)
      if (imp.nonLiteral) {
        if (layer === 'modul') say('Dinamik içe aktarmanın yolu sabit metin olmalı.')
        continue
      }
      if (imp.kind === 'glob') {
        const touchesModules = path ? under(path, 'src/modules') || path.startsWith('src/modules') : false
        if (touchesModules && file !== GLOB_OWNER) say(`Modül klasörünü yalnız ${GLOB_OWNER} glob ile tarar.`)
        continue
      }
      if (layer === 'modul') {
        if (path === null) {
          const pkg = packageName(imp.spec)
          if (CHART_PACKAGES.includes(pkg) && imp.kind !== 'dynamic' && !imp.typeOnly) say('Grafik paketi yalnız dinamik içe aktarmayla gelir.')
          if (isManifest && MANIFEST_FORBIDDEN.includes(pkg) && !imp.typeOnly) say('Modül bildirimi React ve arayüz paketi içe aktarmaz.')
          continue
        }
        const own = under(path, `src/modules/${module}`)
        if (!own && !MODULE_SHARED.some((dir) => under(path, dir))) say('Modül yalnız kendini, @/contracts, @/platform, @/components ve @/theme katmanını kullanır.')
        else if (CORE_ONLY_PLATFORM.includes(path)) say('Bu altyapı dosyası yalnız çekirdeğe ayrılmıştır.')
        else if (under(path, 'src/platform') && (imp.names ?? []).some((n) => CORE_ONLY_NAMES.includes(n))) say(`Şu işlevler yalnız çekirdeğe ayrılmıştır: ${CORE_ONLY_NAMES.join(', ')}.`)
        else if (!own && !imp.typeOnly) {
          const resolved = resolveFile(path, files)
          const reached = resolved && reachesCoreWriter(resolved, files, graph, reachCache)
          if (reached) say(`Bu dosya zincirle ${reached} dosyasına ulaşıyor. Modül plan deposuna dolaylı yoldan da ulaşamaz.`)
        }
        if (isManifest && imp.kind === 'static' && !imp.typeOnly && !under(path, 'src/platform')) say('Modül bildirimi bu dosyayı yalnız dinamik içe aktarmayla ya da "import type" ile alır.')
        continue
      }
      if (path && under(path, 'src/modules')) {
        say('Çekirdek, sözleşme ve altyapı modül dosyası içe aktarmaz.')
        continue
      }
      if (layer === 'sozlesme') {
        if (path === null) say('Sözleşme katmanı npm paketi kullanmaz. Saf TypeScript kalır.')
        else if (!under(path, 'src/contracts') && !CONTRACT_ALLOWED.has(path)) say(`Sözleşme katmanı yalnız şunları kullanır: ${[...CONTRACT_ALLOWED].join(', ')}.`)
        continue
      }
      if (layer === 'altyapi' && path !== null && !under(path, 'src/platform')) {
        if (under(path, 'src/contracts')) {
          if (!imp.typeOnly) say('Altyapı sözleşmeden yalnız tip alır. "import type" kullanın.')
        } else say('Altyapı çekirdek dosyası içe aktarmaz.')
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
    else if (/\.(tsx?|jsx?|mjs)$/.test(entry)) out.set(relative(root, full).split('\\').join('/'), readFileSync(full, 'utf8'))
  }
  return out
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(fileURLToPath(new URL('../', import.meta.url)))
  const errors = checkModuleBoundaries(walk(join(root, 'src'), root, new Map()))
  if (errors.length) {
    console.error(`Modül sınır kapısı ${errors.length} ihlal buldu:`)
    for (const error of errors) console.error(`  ${error}`)
    process.exit(1)
  }
  console.log('Modül sınır kapısı temiz. Modüller yalnız sözleşme ve altyapıyla konuşuyor.')
}
