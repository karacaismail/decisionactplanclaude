/**
 * Modül bildirimlerinin denetimi. Saf işlevdir. Hata listesi Türkçe döner.
 * Bozuk bildirim uygulamayı sessizce bozmasın diye modules.ts bu denetimi açılışta çalıştırır.
 */
import type { ModuleManifest } from './types'

/** Çekirdeğin kullandığı ilk yol parçaları. Modül bu yolları alamaz. Liste src/app/routes.tsx ile aynı tutulur. */
export const CORE_ROUTE_ROOTS: readonly string[] = [
  'baslangic', 'ozet', 'devralma', 'devir', 'gecis', 'strateji', 'uygulama', 'temel', 'varsayimlar',
  'karar', 'kanitlar', 'isler', 'ciktilar', 'gecmis', 'gostergeler', 'yontemler',
]

const PREFIX = /^[a-z]{2,4}-$/
const MANIFEST_PATH = /\/modules\/([^/]+)\/manifest\.ts$/

export function checkManifests(entries: readonly (readonly [string, ModuleManifest])[]): string[] {
  const errors: string[] = []
  const ids = new Set<string>()
  const prefixes = new Set<string>()
  const paths = new Set<string>()
  for (const [file, m] of entries) {
    const folder = MANIFEST_PATH.exec(file)?.[1]
    if (!m || typeof m !== 'object') {
      errors.push(`${file}: Bildirim varsayılan dışa aktarma olarak verilmeli.`)
      continue
    }
    if (folder !== m.id) errors.push(`${file}: Modül kimliği "${m.id}" klasör adıyla aynı olmalı.`)
    if (ids.has(m.id)) errors.push(`${file}: Aynı kimlik iki modülde var: "${m.id}".`)
    ids.add(m.id)
    if (!PREFIX.test(m.cssPrefix)) errors.push(`${file}: CSS öneki "${m.cssPrefix}" geçersiz. Örnek: "pj-".`)
    if (prefixes.has(m.cssPrefix)) errors.push(`${file}: "${m.cssPrefix}" öneki iki modülde var.`)
    prefixes.add(m.cssPrefix)
    if (!Number.isInteger(m.schemaVersion) || m.schemaVersion < 1) errors.push(`${file}: Veri sürümü 1 ya da daha büyük bir tam sayı olmalı.`)
    for (const route of m.routes ?? []) {
      if (!route.path.startsWith('/') || route.path === '/') errors.push(`${file}: "${route.path}" yolu "/" ile başlayan bir alt yol olmalı.`)
      const root = route.path.split('/')[1]
      if (CORE_ROUTE_ROOTS.includes(root)) errors.push(`${file}: "${route.path}" yolu çekirdek ekranın yoluyla çakışıyor.`)
      if (paths.has(route.path)) errors.push(`${file}: "${route.path}" yolu iki kez tanımlı.`)
      paths.add(route.path)
      if (route.path.includes(':') && (!route.example || route.example.includes(':'))) errors.push(`${file}: "${route.path}" yolu için örnek yol yazılmalı.`)
      if (typeof route.load !== 'function') errors.push(`${file}: "${route.path}" yolunun yükleyicisi yok.`)
      if (!route.title?.trim()) errors.push(`${file}: "${route.path}" yolunun başlığı yok.`)
    }
  }
  return errors
}
