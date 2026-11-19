import { beforeEach, describe, expect, it } from 'vitest'
import { buildDemoPlan } from '@/data/demo'
import { emptyPlan } from '@/data/types'
import { usePlanStore } from './planStore'
import { BUNDLE_KIND, buildExportFile, importPlanFile, MAX_BUNDLE_BYTES, parseImportFile } from './bundle'
import { MAX_IMPORT_BYTES } from '@/data/validate'
import { createMemoryKvStore } from '@/platform/kv'
import { setDefaultKvStore } from '@/platform/kv'

const plain = () => emptyPlan('plan-eski', 'Kafe')
/* Proje modülü dilimi içe almadan önce denetler. Bu yüzden örnek kayıt geçerli biçimdedir. */
const projeKaydi = (id: string, planId = 'plan-eski') => ({ id, planId, ad: 'Tezgâh', baslangic: '2026-11-19', bitis: '', sorumlu: '', aciklama: '', olusturma: '2026-11-19T07:00:00.000Z' })

beforeEach(() => {
  usePlanStore.setState({ plans: {}, currentId: undefined, loadFailed: false })
  setDefaultKvStore(createMemoryKvStore())
})

describe('içe alma dosyası', () => {
  it('eski düz plan dosyası içe alınır', () => {
    const { plan, modules } = parseImportFile(JSON.stringify(plain()))
    expect(plan.name).toBe('Kafe')
    expect(modules).toEqual({})
  })

  it('paket dosyası planı ve modül dilimlerini verir', () => {
    const bundle = { kind: BUNDLE_KIND, bundleVersion: 1, plan: plain(), modules: { proje: { schemaVersion: 1, entries: [] } } }
    const { plan, modules } = parseImportFile(JSON.stringify(bundle))
    expect(plan.id).toBe('plan-eski')
    expect(modules).toEqual({ proje: { schemaVersion: 1, entries: [] } })
  })

  it('düz dosyada 8 MB, pakette 32 MB sınırı uygulanır', () => {
    expect(() => parseImportFile(JSON.stringify(plain()), MAX_IMPORT_BYTES + 1)).toThrow(/8 MB/)
    const bundle = JSON.stringify({ kind: BUNDLE_KIND, bundleVersion: 1, plan: plain(), modules: {} })
    expect(parseImportFile(bundle, MAX_IMPORT_BYTES + 1).plan.id).toBe('plan-eski')
    expect(() => parseImportFile(bundle, MAX_BUNDLE_BYTES + 1)).toThrow(/32 MB/)
  })

  it('paketteki plan 8 MB sınırını aşarsa reddedilir', () => {
    const big = plain()
    big.profile.description = 'x'.repeat(MAX_IMPORT_BYTES)
    const bundle = JSON.stringify({ kind: BUNDLE_KIND, bundleVersion: 1, plan: big, modules: {} })
    expect(() => parseImportFile(bundle)).toThrow(/8 MB/)
  })

  it('bilinmeyen paket sürümünü, bozuk planı ve bozuk modül alanını reddeder', () => {
    expect(() => parseImportFile(JSON.stringify({ kind: BUNDLE_KIND, bundleVersion: 2, plan: plain(), modules: {} }))).toThrow(/sürüm/)
    expect(() => parseImportFile(JSON.stringify({ kind: BUNDLE_KIND, bundleVersion: 1, plan: { id: 'x' }, modules: {} }))).toThrow(/plan dosyası değil/)
    expect(() => parseImportFile(JSON.stringify({ kind: BUNDLE_KIND, bundleVersion: 1, plan: plain(), modules: [] }))).toThrow(/modül/)
    expect(() => parseImportFile('{bozuk')).toThrow(/JSON/)
  })
})

describe('dışa aktarma', () => {
  it('modül verisi yoksa eski düz biçimi yazar', () => {
    const p = plain()
    expect(buildExportFile(p, {})).toBe(p)
  })

  it('modül verisi varsa paket yazar', () => {
    const p = plain()
    expect(buildExportFile(p, { proje: { schemaVersion: 1, entries: [] } })).toEqual({ kind: BUNDLE_KIND, bundleVersion: 1, plan: p, modules: { proje: { schemaVersion: 1, entries: [] } } })
  })
})

describe('paketi içe alma', () => {
  it('eski düz dosya bugün de içe alınır ve kopya olur', async () => {
    const { planId, warnings } = await importPlanFile(JSON.stringify(plain()))
    expect(warnings).toEqual([])
    expect(planId).not.toBe('plan-eski')
    expect(usePlanStore.getState().plans[planId].name).toBe('Kafe (kopya)')
  })

  it('modül dilimini yeni plan kimliğine taşır', async () => {
    const kv = createMemoryKvStore()
    setDefaultKvStore(kv)
    const bundle = { kind: BUNDLE_KIND, bundleVersion: 1, plan: plain(), modules: { proje: { schemaVersion: 1, entries: [['proje/proje-1', projeKaydi('proje-1')]] } } }
    const { planId, warnings } = await importPlanFile(JSON.stringify(bundle))
    expect(warnings).toEqual([])
    expect(await kv.get(`proje/${planId}/proje/proje-1`)).toEqual(projeKaydi('proje-1', planId))
  })

  it('bilinmeyen modül dilimini atlar ve uyarır, planı yine alır', async () => {
    const bundle = { kind: BUNDLE_KIND, bundleVersion: 1, plan: plain(), modules: { yok: { a: 1 } } }
    const { planId, warnings } = await importPlanFile(JSON.stringify(bundle))
    expect(usePlanStore.getState().plans[planId]).toBeDefined()
    expect(warnings.join(' ')).toMatch(/yok/)
  })

  it('içe alınan plan satır kimliği taşır', async () => {
    const p = buildDemoPlan()
    p.example = false
    p.steps['U32'] = { values: { now: [{ action: 'A' }] }, status: 'taslak', updatedAt: '' }
    const { planId } = await importPlanFile(JSON.stringify(p))
    const rows = usePlanStore.getState().plans[planId].steps['U32'].values.now as { _id?: string }[]
    expect(rows[0]._id).toBeTruthy()
  })
})

describe('dışa aktarma sınırı', () => {
  it('geri yüklenemeyecek büyük paketi yazmaz, düz planı eskisi gibi yazar', async () => {
    const { assertImportable } = await import('./bundle')
    const big = plain()
    big.profile.description = 'x'.repeat(MAX_IMPORT_BYTES)
    expect(() => assertImportable(big)).not.toThrow()
    expect(() => assertImportable({ kind: BUNDLE_KIND, bundleVersion: 1, plan: big, modules: { proje: {} } })).toThrow(/8 MB/)
    expect(() => assertImportable({ kind: BUNDLE_KIND, bundleVersion: 1, plan: plain(), modules: { proje: 'x'.repeat(MAX_BUNDLE_BYTES) } })).toThrow(/32 MB/)
  })
})

describe('örnek planı yeniden içe alma', () => {
  it('eski örneğin modül verisi silinir, yeni dilim yazılır', async () => {
    const kv = createMemoryKvStore()
    setDefaultKvStore(kv)
    const example = buildDemoPlan()
    usePlanStore.getState().importPlan(structuredClone(example))
    await kv.set(`proje/${example.id}/eski`, 1)
    const bundle = { kind: BUNDLE_KIND, bundleVersion: 1, plan: example, modules: { proje: { schemaVersion: 1, entries: [['proje/yeni', projeKaydi('yeni', example.id)]] } } }
    const { planId } = await importPlanFile(JSON.stringify(bundle))
    expect(planId).toBe(example.id)
    expect(await kv.keys(`proje/${planId}/`)).toEqual([`proje/${planId}/proje/yeni`])
  })
})
