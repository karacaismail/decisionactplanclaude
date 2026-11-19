/**
 * Modül kaydı. `src/modules/<kimlik>/manifest.ts` dosyalarını toplar.
 * Yeni modül eklemek için ortak dosya değişmez. Klasör ve bildirim yeterlidir.
 * Bu dosya modül klasörünü tarayan tek yerdir. Sınır kapısı bunu denetler.
 */
import { checkManifests } from './manifest'
import type { ModuleManifest, ModuleNavEntry, ModuleRoute } from './types'

const found = import.meta.glob<{ default: ModuleManifest }>('../modules/*/manifest.ts', { eager: true })
const entries = Object.entries(found).map(([file, mod]) => [file, mod.default] as const)
const errors = checkManifests(entries)
if (errors.length) throw new Error(`Modül bildirimi hatalı:\n${errors.join('\n')}`)

/** Kayıtlı modüller. Kimliğe göre sıralıdır. */
export const MODULES: readonly ModuleManifest[] = entries.map(([, m]) => m).sort((a, b) => a.id.localeCompare(b.id))

export type RegisteredRoute = ModuleRoute & { moduleId: string }
export type RegisteredNav = ModuleNavEntry & { moduleId: string }

export const MODULE_ROUTES: readonly RegisteredRoute[] = MODULES.flatMap((m) => m.routes.map((r) => ({ ...r, moduleId: m.id })))
export const MODULE_NAV: readonly RegisteredNav[] = MODULES.flatMap((m) => m.nav.map((n) => ({ ...n, moduleId: m.id })))

export function moduleById(id: string): ModuleManifest | undefined {
  return MODULES.find((m) => m.id === id)
}
