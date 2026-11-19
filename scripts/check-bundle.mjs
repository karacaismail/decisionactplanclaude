#!/usr/bin/env node
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { EventEmitter } from 'node:events'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

// Bayt sınırlarıdır. Gzip, her dosyaya ayrı uygulanan varsayılan sıkıştırmadır.
// İlk açılış ölçümü giriş ve Planlar ekranının tüm statik bağımlılıklarını kapsar.
// Bölme öncesi başlangıç JS: 2.348.296 ham, 716.809 gzip bayt.
// Bölünmüş ilk açılış: 1.979.633 ham, 623.553 gzip bayt. Sınır yaklaşık %6 pay bırakır.
// Ant Design tek başına 1.337.749 ham, 420.404 gzip bayttır.
// Bölünmüş toplam JS: 3.137.949 ham, 1.015.130 gzip bayt. Pay yaklaşık %8 ile %12 arasındadır.
// 18 Kasım 2026: CSS yedi katmana bölündü. Ayrıntı: docs/css-mimarisi.md
// Bütün CSS dosyaları 250.485 ham, 58.735 gzip bayttır. Pay yaklaşık %10'dur. Kullanıcı bu toplamı hiçbir zaman birlikte indirmez.
// Bölünmüş dosyalar ayrı sıkıştırılır. Bu yüzden toplam gzip boyutu tek dosyadan büyüktür.
// İlk açılış CSS'i 55.165 ham, 11.725 gzip bayttır. Asıl koruma ilk açılış sınırıdır. Bu sınır değişmedi.
// 19 Kasım 2026, UX turu 3: Gövdeye Outfit yazı ailesi ve yazı ölçeği tokenları eklendi.
// İlk açılış CSS'i 11.985 bayttan 12.057 bayta çıktı. Sahip CSS sınırını yükseltmeye önceden izin verdi.
// Sınır 12.100 bayt oldu. Üst sınır 13.000 bayttır.
// UX turu 10: Her ekran için yazdırma koruyucusu temel.css içine eklendi. İlk açılış CSS'i 12.194 bayt oldu.
// Koruyucu ayrı dosyaya bölünmedi. media="print" bağlantısı da dosyayı indirir. Yazdırma anında geç yükleme ise güvenilir değildir.
// Sınır 12.300 bayt oldu.
// Bunlar ağ aktarımı veya genel web standardı değildir. Yeni bağımlılık gerekçelendirilmelidir.
// 19 Kasım 2026: Proje ve destek modülleri kendi ekran CSS'lerini getirdi. Bu CSS yalnız o ekran açılınca iner.
// Bütün CSS dosyaları 278.998 ham, 66.886 gzip bayt oldu. Toplam sınır yaklaşık %11 payla yükseldi.
// Modül CSS'i ilk açılış CSS sınırını değiştirmedi. O sınırı yukarıdaki UX turları 12.300 bayta çıkardı.
export const BUDGETS = {
  initialJs: { raw: 2_100_000, gzip: 660_000 },
  fileJs: { raw: 1_500_000, gzip: 450_000 },
  totalJs: { raw: 3_500_000, gzip: 1_100_000 },
  initialCss: { raw: 65_000, gzip: 12_300 },
  css: { raw: 310_000, gzip: 74_000 },
}

// routes.tsx içindeki her ekran ayrı dinamik giriş olarak korunur.
const SCREEN_NAMES = [
  'Assumptions', 'Decision', 'Evidence', 'Execution', 'Foundation', 'Handoff',
  'History', 'Insights', 'Methods', 'Outputs', 'Overview', 'Plans', 'Review',
  'Start', 'Strategy', 'Takeover', 'Tasks', 'Transition', 'Work',
]
const CORE_SCREENS = SCREEN_NAMES.map((name) => `src/screens/${name}Screen.tsx`)

/**
 * Modül ekranları bildirimden bulunur. Yeni modül için bu dosya değişmez.
 * manifests: [bildirim yolu, içerik] çiftleri. exists: dosya var mı?
 */
export function discoverModuleScreens(manifests, exists) {
  const screens = []
  for (const [path, source] of manifests) {
    const dir = path.replace(/\/manifest\.ts$/, '')
    for (const match of source.matchAll(/import\(\s*['"](\.\/screens\/[^'"]+)['"]\s*\)/g)) {
      const base = `${dir}/${match[1].slice(2)}`
      const file = ['.tsx', '.ts'].map((ext) => base + ext).find(exists)
      screens.push(file ?? `${base}.tsx`)
    }
  }
  return screens.sort()
}

function readManifests(root) {
  const modules = join(root, 'src/modules')
  if (!existsSync(modules)) return []
  return readdirSync(modules)
    .filter((id) => existsSync(join(modules, id, 'manifest.ts')))
    .map((id) => [`src/modules/${id}/manifest.ts`, readFileSync(join(modules, id, 'manifest.ts'), 'utf8')])
}

const ROOT = fileURLToPath(new URL('../', import.meta.url))
export const MODULE_SCREENS = discoverModuleScreens(readManifests(ROOT), (file) => existsSync(join(ROOT, file)))
const SCREENS = [...CORE_SCREENS, ...MODULE_SCREENS]

/** Yalnız modülde geçen dosya adları. Vite ortak modül parçasına bu adı verir. Örneğin "PjBosEkran". */
function moduleOnlyNames(root) {
  const names = { module: new Set(), core: new Set() }
  const walk = (dir, inModule) => {
    if (!existsSync(dir)) return
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) walk(full, inModule || entry.name === 'modules')
      else if (/\.(tsx?|jsx?)$/.test(entry.name) && !/\.(test|spec)\./.test(entry.name)) {
        const base = entry.name.replace(/\.[^.]+$/, '')
        ;(inModule ? names.module : names.core).add(base)
      }
    }
  }
  walk(join(root, 'src'), false)
  return new Set([...names.module].filter((name) => name !== 'manifest' && !names.core.has(name)))
}
export const MODULE_CHUNK_NAMES = moduleOnlyNames(ROOT)

/** Modül kaynağı mı? Bildirim dosyası ilk açılışta inebilir. Öteki modül kodu inemez. */
const isModuleSource = (path) => typeof path === 'string' && path.startsWith('src/modules/') && !/\/manifest\.ts$/.test(path)

export function inspectBundle(manifest, readAsset, budgets = BUDGETS) {
  const errors = []
  const measurements = []
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return { errors: ['MANIFEST: Geçerli bir dosya listesi bulunamadı.'], measurements }
  }
  const chunks = new Map()
  const sizes = new Map()
  function asset(file) {
    if (typeof file !== 'string' || !file || /^(\/|[A-Za-z]:)|\\/.test(file) || file.split('/').includes('..')) {
      errors.push(`ASSET: Geçersiz dosya yolu: ${String(file)}`)
      return
    }
    if (sizes.has(file)) return
    try {
      const bytes = readAsset(file)
      sizes.set(file, { raw: bytes.length, gzip: gzipSync(bytes).length })
    } catch (error) {
      errors.push(`ASSET: ${file} okunamadı. ${error.message}`)
    }
  }
  for (const [key, chunk] of Object.entries(manifest)) {
    if (!chunk || typeof chunk !== 'object' || Array.isArray(chunk)) {
      errors.push(`MANIFEST: ${key} geçersiz.`)
      continue
    }
    const lists = {}
    for (const field of ['imports', 'dynamicImports', 'css', 'assets']) {
      const value = chunk[field] ?? []
      if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
        errors.push(`MANIFEST: ${key}.${field} bir metin listesi olmalı.`)
        lists[field] = []
      } else lists[field] = value
    }
    chunks.set(key, { ...chunk, ...lists })
    for (const file of [chunk.file, ...lists.css, ...lists.assets]) asset(file)
  }
  for (const [key, chunk] of chunks) {
    for (const dependency of [...chunk.imports, ...chunk.dynamicImports]) {
      if (!chunks.has(dependency)) errors.push(`IMPORT: ${key} için ${dependency} bulunamadı.`)
    }
  }
  function closure(roots, includeDynamic = false) {
    const seen = new Set()
    const pending = [...roots]
    while (pending.length) {
      const key = pending.pop()
      if (seen.has(key) || !chunks.has(key)) continue
      seen.add(key)
      const chunk = chunks.get(key)
      pending.push(...chunk.imports)
      if (includeDynamic) pending.push(...chunk.dynamicImports)
    }
    return seen
  }
  function files(keys) {
    return new Set([...keys].map((key) => chunks.get(key).file))
  }
  const entries = [...chunks.keys()].filter((key) => chunks.get(key).isEntry === true && /\.[cm]?js$/.test(chunks.get(key).file))
  if (!entries.length) errors.push('ENTRY: JavaScript başlangıç parçası bulunamadı.')
  const entryFiles = files(closure(entries))
  const initialKeys = closure([...entries, 'src/screens/PlansScreen.tsx'])
  const initialFiles = files(initialKeys)
  const reachable = closure(entries, true)
  const chartFiles = new Set()
  const reportFiles = new Set()
  for (const [key, chunk] of chunks) {
    const identity = [key, chunk.name, chunk.src, chunk.file].filter(Boolean).join(' ')
    if (/echarts|zrender/i.test(identity)) chartFiles.add(chunk.file)
    if (/report-build|src\/reports\//i.test(identity)) reportFiles.add(chunk.file)
  }
  for (const [name, group] of [['echarts', chartFiles], ['report-build', reportFiles]]) {
    if (!group.size) errors.push(`CHUNK: ${name} için ayrı parça bulunamadı.`)
    for (const file of group) {
      if (initialFiles.has(file)) errors.push(`EAGER: İlk açılış ${name} parçasını yüklüyor: ${file}`)
    }
  }
  for (const key of initialKeys) {
    const chunk = chunks.get(key)
    if (isModuleSource(key) || isModuleSource(chunk.src) || MODULE_CHUNK_NAMES.has(chunk.name)) errors.push(`MODULE_EAGER: İlk açılış modül kodunu yüklüyor: ${chunk.src ?? key}`)
  }
  const screenFiles = new Map()
  for (const key of SCREENS) {
    const chunk = chunks.get(key)
    if (!chunk || chunk.isDynamicEntry !== true || !reachable.has(key)) {
      errors.push(`SCREEN: ${key} erişilebilir bir dinamik giriş olmalı.`)
      continue
    }
    if (screenFiles.has(chunk.file)) errors.push(`SCREEN: ${key} başka ekranla aynı dosyada: ${chunk.file}`)
    screenFiles.set(chunk.file, key)
    if (entryFiles.has(chunk.file)) errors.push(`SCREEN: Başlangıç ${key} ekranını hemen yüklüyor.`)
  }
  for (const key of SCREENS) {
    if (!chunks.has(key)) continue
    for (const file of files(closure([key]))) {
      const other = screenFiles.get(file)
      if (other && other !== key) errors.push(`SCREEN: ${key} başka ekranı hemen yüklüyor: ${other}`)
    }
  }
  function measure(label, group, selected) {
    const totals = { label, group, raw: 0, gzip: 0 }
    for (const file of new Set(selected)) {
      const size = sizes.get(file)
      if (size) { totals.raw += size.raw; totals.gzip += size.gzip }
    }
    measurements.push(totals)
    for (const unit of ['raw', 'gzip']) {
      if (totals[unit] > budgets[group][unit]) {
        errors.push(`BUDGET ${group} ${unit}: ${label} ${totals[unit]} bayt. Sınır ${budgets[group][unit]} bayt.`)
      }
    }
  }
  // Ekran koduna yönelik kullanıcı niyeti, rapor üretme isteği değildir.
  for (const key of SCREENS) {
    for (const file of files(closure([key]))) {
      if (reportFiles.has(file)) errors.push(`REPORT_PREFETCH: ${key} raporu erken yüklüyor: ${file}`)
    }
  }

  const jsFiles = [...sizes.keys()].filter((file) => /\.[cm]?js$/.test(file))
  for (const file of jsFiles) measure(file, 'fileJs', [file])
  measure('initialJs', 'initialJs', jsFiles.filter((file) => initialFiles.has(file)))
  measure('totalJs', 'totalJs', jsFiles)
  const initialCss = [...initialKeys].flatMap((key) => chunks.get(key).css)
  measure('initialCss', 'initialCss', [...initialCss, ...[...initialFiles].filter((file) => typeof file === 'string' && file.endsWith('.css'))])
  measure('css', 'css', [...sizes.keys()].filter((file) => file.endsWith('.css')))
  return { errors, measurements }
}

export async function runProductionTest(extraArgs = [], dependencies = {}) {
  const {
    root = fileURLToPath(new URL('../', import.meta.url)),
    readFile = readFileSync,
    startPreview = async (config) => (await import('vite')).preview(config),
    resolveCli = () => fileURLToPath(import.meta.resolve('@playwright/test/cli')),
    spawnProcess = spawn,
  } = dependencies
  // Ek seçenekler zorunlu testi veya tarayıcı seçimini değiştiremez.
  const forwarded = []
  for (let index = 0; index < extraArgs.length; index += 1) {
    const argument = extraArgs[index]
    const output = argument === '--output' ? extraArgs[++index] : argument.startsWith('--output=') ? argument.slice(9) : undefined
    if (!output || output.startsWith('-') || forwarded.length) {
      throw new Error('Üretim testinde yalnız --output klasörü seçeneği kullanılabilir.')
    }
    forwarded.push('--output', output)
  }
  const projectRoot = resolve(root)
  const directory = resolve(projectRoot, 'dist')
  const manifestPath = resolve(directory, '.vite/manifest.json')
  const manifest = JSON.parse(readFile(manifestPath, 'utf8'))
  const result = inspectBundle(manifest, (file) => readFile(resolve(directory, file)))
  if (result.errors.length) throw new Error(result.errors.join('\n'))
  readFile(resolve(directory, 'index.html'))
  // Dosya denetimi geçmeden Vite yüklenmez ve hiçbir sunucu başlatılmaz.
  const cli = resolveCli()
  const server = await startPreview({
    root: projectRoot,
    mode: 'production',
    build: { outDir: directory },
    preview: { host: 'localhost', port: 0, strictPort: true, open: false },
  })
  try {
    const address = server.httpServer.address()
    if (!address || typeof address === 'string' || !Number.isInteger(address.port) || address.port <= 0) {
      throw new Error('Üretim önizlemesinin portu bulunamadı.')
    }
    const origin = `http://localhost:${address.port}`
    const baseURL = new URL(server.config.base, origin)
    if (baseURL.origin !== origin) throw new Error('Üretim önizlemesi yerel adreste kalmalı.')
    baseURL.pathname = `${baseURL.pathname.replace(/\/$/, '')}/`
    const child = spawnProcess(process.execPath, [
      cli, 'test', 'tests/teslim.spec.ts',
      '--project=chromium-320', '--project=chromium-1280', '--workers=2', ...forwarded,
    ], {
      cwd: projectRoot,
      shell: false,
      stdio: 'inherit',
      env: {
        ...process.env,
        TESLIM_BASE_URL: baseURL.href,
        TESLIM_MANIFEST: manifestPath,
        PW_PORT: String(address.port),
      },
    })
    return await new Promise((accept, reject) => {
      child.once('error', reject)
      child.once('close', (code) => accept(Number.isInteger(code) && code >= 0 ? code : 1))
    })
  } finally {
    // Yalnız bu çağrının açtığı önizleme kapanır. Başka portlara dokunulmaz.
    await server.close()
  }
}

async function selfTest() {
  function fixture() {
    const manifest = {
      'index.html': { file: 'assets/index.js', isEntry: true, imports: ['_shared.js'], dynamicImports: [...SCREENS], css: ['assets/index.css'], assets: ['assets/font.woff2'] },
      '_shared.js': { file: 'assets/shared.js' },
      '_echarts.js': { file: 'assets/echarts-a.js', name: 'echarts' },
      '_report-build.js': { file: 'assets/report-build-a.js', name: 'report-build' },
    }
    for (const key of SCREENS) manifest[key] = { file: `assets/${key.split('/').at(-1)}.js`, src: key, isDynamicEntry: true, imports: ['_shared.js'] }
    manifest['src/screens/InsightsScreen.tsx'].dynamicImports = ['_echarts.js']
    manifest['src/screens/OutputsScreen.tsx'].dynamicImports = ['_report-build.js']
    const assets = new Map(Object.values(manifest).map((chunk) => [chunk.file, Buffer.from('export default 1')]))
    assets.set('assets/index.css', Buffer.from('body { color: black }'))
    assets.set('assets/font.woff2', Buffer.from('font'))
    return { manifest, assets }
  }
  function inspect(data, budgets) {
    return inspectBundle(data.manifest, (file) => {
      if (!data.assets.has(file)) throw new Error(`Missing asset: ${file}`)
      return data.assets.get(file)
    }, budgets)
  }
  const tests = [
    ['geçerli bölünmüş derleme', () => assert.deepEqual(inspect(fixture()).errors, [])],
    ['geçersiz manifest', () => assert.match(inspect({ ...fixture(), manifest: null }).errors.join('\n'), /manifest/i)],
    ['eksik başlangıç', () => { const f = fixture(); delete f.manifest['index.html']; assert.match(inspect(f).errors.join('\n'), /ENTRY/) }],
    ['eksik ekran', () => { const f = fixture(); delete f.manifest[SCREENS[0]]; assert.match(inspect(f).errors.join('\n'), /SCREEN/) }],
    ['dinamik olmayan ekran', () => { const f = fixture(); f.manifest[SCREENS[0]].isDynamicEntry = false; assert.match(inspect(f).errors.join('\n'), /SCREEN/) }],
    ['başlangıçtan erişilmeyen ekran', () => { const f = fixture(); f.manifest['index.html'].dynamicImports.pop(); assert.match(inspect(f).errors.join('\n'), /SCREEN/) }],
    ['aynı dosyadaki ekranlar', () => { const f = fixture(); f.manifest[SCREENS[1]].file = f.manifest[SCREENS[0]].file; assert.match(inspect(f).errors.join('\n'), /SCREEN/) }],
    ['erken ekran yüklemesi', () => { const f = fixture(); f.manifest['_shared.js'].imports = [SCREENS[0]]; assert.match(inspect(f).errors.join('\n'), /SCREEN/) }],
    ['birbirini yükleyen ekranlar', () => { const f = fixture(); f.manifest[SCREENS[0]].imports.push(SCREENS[1]); assert.match(inspect(f).errors.join('\n'), /SCREEN/) }],
    ['dolaylı grafik yüklemesi', () => { const f = fixture(); f.manifest['_shared.js'].imports = ['_echarts.js']; assert.match(inspect(f).errors.join('\n'), /EAGER/) }],
    ['dolaylı rapor yüklemesi', () => { const f = fixture(); f.manifest['_shared.js'].imports = ['_report-build.js']; assert.match(inspect(f).errors.join('\n'), /EAGER/) }],
    ['Planlar grafik yüklememeli', () => { const f = fixture(); f.manifest['src/screens/PlansScreen.tsx'].imports.push('_echarts.js'); assert.match(inspect(f).errors.join('\n'), /EAGER/) }],
    ['Planlar rapor yüklememeli', () => { const f = fixture(); f.manifest['src/screens/PlansScreen.tsx'].imports.push('_report-build.js'); assert.match(inspect(f).errors.join('\n'), /EAGER/) }],
    ...['Outputs', 'Handoff', 'Transition', 'Strategy', 'Work'].map((screen) => [
      `${screen} ön yüklemesi rapor üretme kodunu indirmemeli`, () => {
        const f = fixture()
        f.manifest[`src/screens/${screen}Screen.tsx`].imports.push('_report-build.js')
        assert.match(inspect(f).errors.join('\n'), /REPORT_PREFETCH/)
      },
    ]),
    ['başlangıç ölçümü Planlar parçasını kapsar', () => {
      const f = fixture()
      const expected = ['assets/index.js', 'assets/shared.js', 'assets/PlansScreen.tsx.js'].reduce((sum, file) => sum + f.assets.get(file).length, 0)
      assert.equal(inspect(f).measurements.find((m) => m.label === 'initialJs').raw, expected)
    }],
    ['ilk CSS ölçümü Planlar ve ortak stilleri tek sayar', () => {
      const f = fixture()
      f.manifest['_shared.js'].css = ['assets/index.css']
      f.manifest['src/screens/PlansScreen.tsx'].css = ['assets/plans.css', 'assets/index.css']
      f.manifest['src/screens/WorkScreen.tsx'].css = ['assets/later.css']
      f.assets.set('assets/plans.css', Buffer.from('main { display: flex }'))
      f.assets.set('assets/later.css', Buffer.from('aside { display: grid }'))
      const result = inspect(f)
      const initialCss = result.measurements.find((m) => m.label === 'initialCss')
      assert.ok(initialCss, 'İlk açılış CSS ölçümü üretilmeli')
      assert.equal(initialCss.raw, f.assets.get('assets/index.css').length + f.assets.get('assets/plans.css').length)
      assert.equal(initialCss.gzip, gzipSync(f.assets.get('assets/index.css')).length + gzipSync(f.assets.get('assets/plans.css')).length)
    }],
    ['geç ekran stillerini başlangıca taşımak reddedilir', () => {
      const f = fixture()
      f.manifest['src/screens/WorkScreen.tsx'].css = ['assets/later.css']
      f.assets.set('assets/later.css', Buffer.alloc(65_001, 'x'))
      assert.deepEqual(inspect(f).errors, [], 'Ayrı yüklenen CSS toplam bütçede kalmalı')
      f.manifest['index.html'].css.push('assets/later.css')
      assert.match(inspect(f).errors.join('\n'), /BUDGET initialCss raw/)
    }],
    ['modül kodu ilk açılışa girerse reddedilir', () => {
      const f = fixture()
      f.manifest['src/modules/proje/model.ts'] = { file: 'assets/model.js', src: 'src/modules/proje/model.ts' }
      f.assets.set('assets/model.js', Buffer.from('export const x = 1'))
      assert.deepEqual(inspect(f).errors, [], 'Ayrı yüklenen modül kodu sorun değildir')
      f.manifest['_shared.js'].imports = ['src/modules/proje/model.ts']
      assert.match(inspect(f).errors.join('\n'), /MODULE_EAGER/)
    }],
    ['ortak modül parçası ilk açılışa girerse reddedilir', () => {
      const f = fixture()
      assert.ok(MODULE_CHUNK_NAMES.has('PjBosEkran'))
      assert.ok(!MODULE_CHUNK_NAMES.has('lifecycle'), 'Çekirdekte de geçen ad modül parçası sayılmaz')
      f.manifest['_PjBosEkran-a.js'] = { file: 'assets/PjBosEkran-a.js', name: 'PjBosEkran' }
      f.assets.set('assets/PjBosEkran-a.js', Buffer.from('export const x = 1'))
      f.manifest['_shared.js'].imports = ['_PjBosEkran-a.js']
      assert.match(inspect(f).errors.join('\n'), /MODULE_EAGER/)
    }],
    ['modül bildirimi ilk açılışta inebilir', () => {
      const f = fixture()
      f.manifest['src/modules/proje/manifest.ts'] = { file: 'assets/manifest.js', src: 'src/modules/proje/manifest.ts' }
      f.assets.set('assets/manifest.js', Buffer.from('export default {}'))
      f.manifest['_shared.js'].imports = ['src/modules/proje/manifest.ts']
      assert.deepEqual(inspect(f).errors, [])
    }],
    ['modül ekranı Planlar ile ilk açılışa girerse reddedilir', () => {
      const f = fixture()
      const screen = MODULE_SCREENS[0]
      assert.ok(screen, 'En az bir modül ekranı bulunmalı')
      f.manifest['src/screens/PlansScreen.tsx'].imports.push(screen)
      assert.match(inspect(f).errors.join('\n'), /MODULE_EAGER|SCREEN/)
    }],
    ['modül ekranları bildirimden bulunur', () => {
      const manifests = [['src/modules/proje/manifest.ts', "routes: [{ load: () => import('./screens/PjA') }, { load: () => import(\"./screens/PjB\") }], lifecycle: () => import('./lifecycle')"]]
      assert.deepEqual(discoverModuleScreens(manifests, (file) => file.endsWith('PjA.tsx')), ['src/modules/proje/screens/PjA.tsx', 'src/modules/proje/screens/PjB.tsx'])
      assert.ok(MODULE_SCREENS.includes('src/modules/proje/screens/PjProjelerScreen.tsx'))
      assert.ok(MODULE_SCREENS.includes('src/modules/destek/screens/DtProgramlarScreen.tsx'))
    }],
    ['eksik modül ekranı reddedilir', () => {
      const f = fixture()
      delete f.manifest[MODULE_SCREENS[0]]
      assert.match(inspect(f).errors.join('\n'), /SCREEN/)
    }],
    ['eksik grafik parçası', () => { const f = fixture(); delete f.manifest['_echarts.js']; assert.match(inspect(f).errors.join('\n'), /CHUNK/) }],
    ['eksik rapor parçası', () => { const f = fixture(); delete f.manifest['_report-build.js']; assert.match(inspect(f).errors.join('\n'), /CHUNK/) }],
    ['eksik statik bağlantı', () => { const f = fixture(); f.manifest['_shared.js'].imports = ['missing']; assert.match(inspect(f).errors.join('\n'), /IMPORT/) }],
    ['eksik dinamik bağlantı', () => { const f = fixture(); f.manifest['_shared.js'].dynamicImports = ['missing']; assert.match(inspect(f).errors.join('\n'), /IMPORT/) }],
    ['geçersiz bağlantı listesi', () => { const f = fixture(); f.manifest['_shared.js'].imports = 'bad'; assert.match(inspect(f).errors.join('\n'), /MANIFEST/) }],
    ['eksik JavaScript dosyası', () => { const f = fixture(); f.assets.delete('assets/shared.js'); assert.match(inspect(f).errors.join('\n'), /ASSET/) }],
    ['eksik CSS dosyası', () => { const f = fixture(); f.assets.delete('assets/index.css'); assert.match(inspect(f).errors.join('\n'), /ASSET/) }],
    ['eksik yazı tipi dosyası', () => { const f = fixture(); f.assets.delete('assets/font.woff2'); assert.match(inspect(f).errors.join('\n'), /ASSET/) }],
    ['klasör dışına çıkan yol', () => { const f = fixture(); f.manifest['_shared.js'].file = '../outside.js'; assert.match(inspect(f).errors.join('\n'), /ASSET/) }],
    ['döngü ve ortak dosya tek sayılır', () => {
      const f = fixture()
      f.manifest['_shared.js'].imports = ['index.html']
      f.manifest['index.html'].imports.push('_shared.js')
      const result = inspect(f)
      assert.deepEqual(result.errors, [])
      assert.equal(result.measurements.find((m) => m.label === 'initialJs').raw, f.assets.get('assets/index.js').length + f.assets.get('assets/shared.js').length + f.assets.get('assets/PlansScreen.tsx.js').length)
    }],
  ]
  for (const group of ['initialJs', 'fileJs', 'totalJs', 'initialCss', 'css']) {
    for (const unit of ['raw', 'gzip']) tests.push([`${group} ${unit} sınırı`, () => {
      const f = fixture()
      const values = inspect(f).measurements.filter((m) => m.group === group).map((m) => m[unit])
      const measured = Math.max(...values)
      assert.ok(Number.isFinite(measured), 'Ölçüm üretilmeli')
      const limits = structuredClone(BUDGETS)
      limits[group][unit] = measured
      assert.deepEqual(inspect(f, limits).errors, [], 'Sınırdaki değer geçmeli')
      limits[group][unit] -= 1
      assert.match(inspect(f, limits).errors.join('\n'), new RegExp(`BUDGET.*${group}.*${unit}`))
    }])
  }
  function productionFixture() {
    const data = fixture()
    data.assets.set('index.html', Buffer.from('<!doctype html><html></html>'))
    const state = { started: [], spawned: [], closed: 0, exitCode: 0 }
    const dependencies = {
      root: '/fixture/app',
      readFile: (file) => {
        if (file.endsWith('/.vite/manifest.json')) return JSON.stringify(data.manifest)
        const bytes = data.assets.get(file.replace('/fixture/app/dist/', ''))
        if (!bytes) throw new Error(`Missing asset: ${file}`)
        return bytes
      },
      resolveCli: () => '/fixture/playwright/cli.js',
      startPreview: async (config) => {
        state.started.push(config)
        return {
          config: { base: '/decisionactplanclaude/' },
          httpServer: { address: () => ({ port: 43210 }) },
          close: async () => { state.closed += 1 },
        }
      },
      spawnProcess: (...args) => {
        state.spawned.push(args)
        const child = new EventEmitter()
        queueMicrotask(() => {
          if (state.spawnError) child.emit('error', new Error('spawn failed'))
          else child.emit('close', state.exitCode)
        })
        return child
      },
    }
    return { data, state, dependencies }
  }
  tests.push(
    ['üretim testi eksik dist ile başlamaz', async () => {
      const { state, dependencies } = productionFixture()
      dependencies.readFile = () => { throw new Error('ENOENT manifest') }
      await assert.rejects(runProductionTest([], dependencies), /ENOENT/)
      assert.equal(state.started.length, 0)
      assert.equal(state.spawned.length, 0)
    }],
    ['üretim testi hatalı çıktıyı reddeder', async () => {
      for (const invalid of ['manifest', 'asset', 'budget']) {
        const { data, state, dependencies } = productionFixture()
        if (invalid === 'manifest') data.manifest = null
        if (invalid === 'asset') data.assets.delete('assets/index.css')
        if (invalid === 'budget') data.assets.set('assets/index.css', Buffer.alloc(BUDGETS.css.raw + 1))
        await assert.rejects(runProductionTest([], dependencies), /MANIFEST|ASSET|BUDGET/)
        assert.equal(state.started.length, 0)
        assert.equal(state.spawned.length, 0)
      }
    }],
    ['eksik başlangıç HTML dosyası sunucudan önce reddedilir', async () => {
      const { data, state, dependencies } = productionFixture()
      data.assets.delete('index.html')
      await assert.rejects(runProductionTest([], dependencies), /Missing asset.*index\.html/)
      assert.equal(state.started.length, 0)
      assert.equal(state.spawned.length, 0)
    }],
    ['üretim testi doğru port ve projeleri kullanır', async () => {
      const { state, dependencies } = productionFixture()
      assert.equal(await runProductionTest(['--output', '/fixture/output with spaces'], dependencies), 0)
      assert.equal(state.closed, 1)
      assert.equal(state.started[0].preview.port, 0)
      assert.equal(state.started[0].preview.host, 'localhost')
      assert.equal(state.started[0].preview.strictPort, true)
      assert.equal(state.started[0].build.outDir, '/fixture/app/dist')
      const [executable, args, options] = state.spawned[0]
      assert.equal(executable, process.execPath)
      assert.deepEqual(args, ['/fixture/playwright/cli.js', 'test', 'tests/teslim.spec.ts', '--project=chromium-320', '--project=chromium-1280', '--workers=2', '--output', '/fixture/output with spaces'])
      assert.equal(options.shell, false)
      assert.equal(options.cwd, '/fixture/app')
      assert.equal(options.env.PW_PORT, '43210')
      assert.equal(options.env.TESLIM_BASE_URL, 'http://localhost:43210/decisionactplanclaude/')
      assert.equal(options.env.TESLIM_MANIFEST, '/fixture/app/dist/.vite/manifest.json')
    }],
    ['başarısız test sonucu korunur ve sunucu kapanır', async () => {
      const { state, dependencies } = productionFixture()
      state.exitCode = 7
      assert.equal(await runProductionTest([], dependencies), 7)
      assert.equal(state.closed, 1)
    }],
    ['sonlandırılan test başarılı sayılmaz', async () => {
      const { state, dependencies } = productionFixture()
      state.exitCode = null
      assert.equal(await runProductionTest([], dependencies), 1)
      assert.equal(state.closed, 1)
    }],
    ['alt süreç başlatma hatasında sunucu kapanır', async () => {
      const { state, dependencies } = productionFixture()
      state.spawnError = true
      await assert.rejects(runProductionTest([], dependencies), /spawn failed/)
      assert.equal(state.closed, 1)
    }],
    ['anlık başlatma hatasında sunucu kapanır', async () => {
      const { state, dependencies } = productionFixture()
      dependencies.spawnProcess = () => { throw new Error('spawn threw') }
      await assert.rejects(runProductionTest([], dependencies), /spawn threw/)
      assert.equal(state.closed, 1)
    }],
    ['üretim testi kapsamı ek seçenekle değiştirilemez', async () => {
      for (const args of [['--project=firefox'], ['--list'], ['--output'], ['--config', 'other.ts']]) {
        const { state, dependencies } = productionFixture()
        await assert.rejects(runProductionTest(args, dependencies), /output/)
        assert.equal(state.started.length, 0)
      }
    }],
  )
  let failures = 0
  for (const [name, run] of tests) {
    try { await run(); console.log(`PASS ${name}`) }
    catch (error) { failures += 1; console.error(`FAIL ${name}: ${error.message}`) }
  }
  console.log(`${tests.length - failures}/${tests.length} test geçti.`)
  return failures === 0 ? 0 : 1
}

async function main(args) {
  if (args.length === 1 && args[0] === '--self-test') return selfTest()
  try {
    if (args[0] === '--production-test') return await runProductionTest(args.slice(1))
    if (args.length > 1 || args.some((arg) => arg.startsWith('-'))) {
      console.error('Kullanım: node scripts/check-bundle.mjs [dist klasörü] | --self-test | --production-test [--output klasörü]')
      return 1
    }
    const directory = resolve(args[0] ?? 'dist')
    const manifest = JSON.parse(readFileSync(resolve(directory, '.vite/manifest.json'), 'utf8'))
    const result = inspectBundle(manifest, (file) => readFileSync(resolve(directory, file)))
    for (const measurement of result.measurements) console.log(`${measurement.label}: ham ${measurement.raw}, gzip ${measurement.gzip} bayt`)
    for (const error of result.errors) console.error(error)
    return result.errors.length ? 1 : 0
  } catch (error) {
    console.error(`Paket denetimi başarısız: ${error.message}`)
    return 1
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2))
}
