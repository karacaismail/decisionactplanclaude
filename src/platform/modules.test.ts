import { describe, expect, it } from 'vitest'
import { checkManifests } from './manifest'
import { MODULES, MODULE_NAV, MODULE_ROUTES } from './modules'
import { createMemoryKvStore } from './kv'
import { createPlanScopedLifecycle } from './planScoped'
import type { ModuleManifest } from './types'

const load = () => Promise.resolve({ default: () => null })
const base = (over: Partial<ModuleManifest> = {}): ModuleManifest => ({
  id: 'ornek',
  title: 'Örnek',
  schemaVersion: 1,
  cssPrefix: 'or-',
  nav: [],
  routes: [{ path: '/ornek', title: 'Örnek', load, requiresPlan: false }],
  ...over,
})

describe('modül bildirimi denetimi', () => {
  it('düzgün bildirimi kabul eder', () => {
    expect(checkManifests([['../modules/ornek/manifest.ts', base()]])).toEqual([])
  })

  it('klasör adıyla uyuşmayan kimliği bulur', () => {
    expect(checkManifests([['../modules/baska/manifest.ts', base()]]).join('\n')).toMatch(/klasör/)
  })

  it('tekrarlanan kimliği, yolu ve öneki bulur', () => {
    const errors = checkManifests([
      ['../modules/ornek/manifest.ts', base()],
      ['../modules/ornek/manifest.ts', base()],
    ]).join('\n')
    expect(errors).toMatch(/kimlik/)
    expect(errors).toMatch(/\/ornek/)
    expect(errors).toMatch(/önek/)
  })

  it('geçersiz öneki ve parametreli yolda örnek eksikliğini bulur', () => {
    const errors = checkManifests([['../modules/ornek/manifest.ts', base({ cssPrefix: 'Ornek', routes: [{ path: '/ornek/:id', title: 'X', load, requiresPlan: true }] })]]).join('\n')
    expect(errors).toMatch(/CSS öneki/)
    expect(errors).toMatch(/örnek yol/)
  })

  it('çekirdek yollarla çakışan yolu bulur', () => {
    expect(checkManifests([['../modules/ornek/manifest.ts', base({ routes: [{ path: '/ozet', title: 'X', load, requiresPlan: true }] })]]).join('\n')).toMatch(/çekirdek/)
  })
})

describe('kayıtlı modüller', () => {
  it('proje ve destek modülleri yüklenir', () => {
    expect(MODULES.map((m) => m.id)).toEqual(['destek', 'proje'])
  })

  it('istenen yollar tanımlıdır', () => {
    const paths = MODULE_ROUTES.map((r) => r.path).sort()
    expect(paths).toEqual(['/destek', '/destek/:programId', '/destek/basvurular', '/destek/belgeler', '/destek/eslesme', '/destek/giderler', '/destek/sozluk', '/projeler', '/projeler/:pid', '/projeler/:pid/is/:iid'].sort())
    expect(MODULE_ROUTES.find((r) => r.path === '/destek')?.requiresPlan).toBe(false)
    for (const path of ['/destek/belgeler', '/destek/giderler', '/destek/sozluk']) expect(MODULE_ROUTES.find((r) => r.path === path)?.requiresPlan).toBe(false)
    expect(MODULE_ROUTES.find((r) => r.path === '/projeler')?.requiresPlan).toBe(true)
  })

  it('Projeler alt menüde, destek numarasız grupta durur', () => {
    const projeler = MODULE_NAV.find((n) => n.to === '/projeler')
    expect(projeler).toMatchObject({ label: 'Projeler', bottom: true, requiresPlan: true })
    const destek = MODULE_NAV.filter((n) => n.group === 'Destek ve teşvik')
    expect(destek.map((n) => n.to)).toEqual(['/destek', '/destek/eslesme', '/destek/basvurular', '/destek/belgeler', '/destek/giderler', '/destek/sozluk'])
    expect(new Set(destek.map((n) => n.icon)).size).toBe(destek.length)
    expect(destek.every((n) => !/^\d/.test(n.group ?? ''))).toBe(true)
  })

  it('modül ekranları yükleyici işlevle gelir', async () => {
    const loaded = await Promise.all(MODULE_ROUTES.map((r) => r.load()))
    expect(loaded.every((m) => typeof m.default === 'function')).toBe(true)
  })

  it('her modülün yaşam döngüsü geç yüklenir', async () => {
    for (const m of MODULES) {
      expect(typeof m.lifecycle).toBe('function')
      const lifecycle = await m.lifecycle!()
      expect(typeof lifecycle.default.onPlanDeleted).toBe('function')
    }
  })
})

describe('plan kapsamlı yaşam döngüsü', () => {
  it('dışa aktarır, yeni kimlikle içe alır ve planı silince temizler', async () => {
    const kv = createMemoryKvStore()
    const life = createPlanScopedLifecycle('proje', 1, () => kv)
    expect(await life.exportSlice!('eski')).toBeUndefined()
    await kv.set('proje/eski/proje-1', { ad: 'Tezgâh' })
    await kv.set('proje/baska/proje-2', { ad: 'Başka' })
    const slice = await life.exportSlice!('eski')
    expect(slice).toEqual({ schemaVersion: 1, entries: [['proje-1', { ad: 'Tezgâh' }]] })
    await life.importSlice!(slice, { eski: 'yeni' })
    expect(await kv.get('proje/yeni/proje-1')).toEqual({ ad: 'Tezgâh' })
    await life.onPlanDeleted!('eski')
    expect(await kv.keys('proje/')).toEqual(['proje/baska/proje-2', 'proje/yeni/proje-1'])
  })

  it('bozuk ya da daha yeni sürümlü dilimi reddeder', async () => {
    const life = createPlanScopedLifecycle('proje', 1, () => createMemoryKvStore())
    await expect(life.importSlice!({ schemaVersion: 2, entries: [] }, { a: 'b' })).rejects.toThrow(/sürüm/)
    await expect(life.importSlice!({ entries: 'x' }, { a: 'b' })).rejects.toThrow()
    await expect(life.importSlice!({ schemaVersion: 1, entries: [['../x', 1]] }, { a: 'b' })).rejects.toThrow()
  })
})
