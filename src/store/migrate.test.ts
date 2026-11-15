import { describe, expect, it } from 'vitest'
import { emptyPlan } from '@/data/types'
import { migrateChoiceFields } from './planStore'

describe('sürüm 2 taşıması', () => {
  it('"Seçilen yol" ve "Vazgeçilenler" Adım 18\'den Adım 19\'a geçer', () => {
    const p = emptyPlan('p', 'Plan')
    p.steps['18'] = { values: { paths: [{ _id: 'a', name: 'Yol A' }], chosenPath: 'Yol A', givenUp: 'Öğle satışı' }, status: 'tamam', updatedAt: '' }
    migrateChoiceFields(p)
    expect(p.steps['18'].values.chosenPath).toBeUndefined()
    expect(p.steps['18'].values.givenUp).toBeUndefined()
    expect(p.steps['18'].values.paths).toHaveLength(1)
    expect(p.steps['19'].values.chosenPath).toBe('Yol A')
    expect(p.steps['19'].values.givenUp).toBe('Öğle satışı')
  })
  it('Adım 19\'da değer varsa üstüne yazmaz', () => {
    const p = emptyPlan('p', 'Plan')
    p.steps['18'] = { values: { chosenPath: 'Eski' }, status: 'tamam', updatedAt: '' }
    p.steps['19'] = { values: { chosenPath: 'Yeni', objective: 'Hedef' }, status: 'taslak', updatedAt: '' }
    migrateChoiceFields(p)
    expect(p.steps['19'].values.chosenPath).toBe('Yeni')
    expect(p.steps['19'].values.objective).toBe('Hedef')
  })
  it('Adım 18 yoksa plana dokunmaz', () => {
    const p = emptyPlan('p', 'Plan')
    expect(migrateChoiceFields(p).steps['19']).toBeUndefined()
  })
})

describe('sürüm 3 taşıması', () => {
  it('hedef ve iş alanları Adım 19\'dan uygulama planı adımlarına geçer', async () => {
    const { migratePlan } = await import('./planStore')
    const p = emptyPlan('p', 'Plan')
    p.steps['19'] = {
      values: { chosenPath: 'Yol A', choiceReason: 'Kanıt', givenUp: 'Öğle satışı', objective: 'İlk 10 müşteri', keyResults: [{ kr: 'Müşteri', target: '10' }], now: [{ action: 'Tezgâh kur', owner: 'Ali', dueDate: '2026-12-01' }], next: [], weeklyBottleneck: true },
      status: 'tamam',
      updatedAt: '2026-11-10T00:00:00.000Z',
    }
    migratePlan(p)
    expect(Object.keys(p.steps['19'].values).sort()).toEqual(['choiceReason', 'chosenPath', 'givenUp'])
    expect(p.steps['U31'].values).toEqual({ objective: 'İlk 10 müşteri', keyResults: [{ kr: 'Müşteri', target: '10' }] })
    /* Boş liste taşınmaz. */
    expect(p.steps['U32'].values).toEqual({ now: [{ action: 'Tezgâh kur', owner: 'Ali', dueDate: '2026-12-01' }], weeklyBottleneck: true })
    /* Eski adım tamamdı ve yeni adımların denetimi geçiyor. Yeni adımlar da tamam sayılır. */
    expect([p.steps['U31'].status, p.steps['U32'].status]).toEqual(['tamam', 'tamam'])
    /* Yeni zorunlu alanlar (kazanma hedefi ve saha) boş. Seçim adımı taslağa döner. */
    expect(p.steps['19'].status).toBe('taslak')
  })
  it('eski sürümde tamamlanan strateji izin alır, yarım strateji almaz', async () => {
    const { migratePlan } = await import('./planStore')
    const old = () => {
      const p = emptyPlan('p', 'Plan')
      p.steps['19'] = { values: { chosenPath: 'Yol A', choiceReason: 'Kanıt', givenUp: 'Öğle', objective: 'Hedef' }, status: 'tamam', updatedAt: '' }
      p.steps['20'] = { values: { qualityCheck: ['a', 'b', 'c', 'd', 'e'] }, status: 'tamam', updatedAt: '' }
      return p
    }
    const done = migratePlan(old())
    expect(done.legacyStrategy?.migratedAt).toBeTruthy()
    expect(done.steps['20'].status).toBe('taslak')
    const half = old()
    half.steps['20'].values.qualityCheck = ['a']
    expect(migratePlan(half).legacyStrategy).toBeUndefined()
    /* Yeni biçimdeki plan izin almaz. */
    const fresh = emptyPlan('q', 'Plan')
    fresh.steps['19'] = { values: { chosenPath: 'Yol A', choiceReason: 'Kanıt', givenUp: 'Öğle', winningAim: 'Hedef', playField: 'Saha' }, status: 'tamam', updatedAt: '' }
    fresh.steps['20'] = { values: { qualityCheck: ['a', 'b', 'c', 'd', 'e'], approvedBy: 'Kurucu' }, status: 'tamam', updatedAt: '' }
    expect(migratePlan(fresh).legacyStrategy).toBeUndefined()
    expect(fresh.steps['19'].status).toBe('tamam')
  })
  it('sorumlusu ya da tarihi eksik iş varsa 3.2 adımı taslak kalır', async () => {
    const { migratePlan } = await import('./planStore')
    const p = emptyPlan('p', 'Plan')
    p.steps['19'] = { values: { chosenPath: 'Yol A', now: [{ action: 'Tezgâh kur' }] }, status: 'tamam', updatedAt: '' }
    migratePlan(p)
    expect(p.steps['U32'].status).toBe('taslak')
  })
  it('boş metin taşınmaz ve dolu değerin üstüne yazılmaz', async () => {
    const { migratePlan } = await import('./planStore')
    const p = emptyPlan('p', 'Plan')
    p.steps['19'] = { values: { chosenPath: 'Yol A', objective: '' }, status: 'taslak', updatedAt: '' }
    migratePlan(p)
    expect(p.steps['U31']).toBeUndefined()
    const q = emptyPlan('q', 'Plan')
    q.steps['19'] = { values: { chosenPath: 'Yol A', objective: 'Eski dolu hedef' }, status: 'taslak', updatedAt: '' }
    q.steps['U31'] = { values: { objective: '' }, status: 'taslak', updatedAt: '' }
    migratePlan(q)
    expect(q.steps['U31'].values.objective).toBe('Eski dolu hedef')
  })
  it('taşıma iki kez çalışınca veri değişmez ve dolu alanın üstüne yazılmaz', async () => {
    const { migratePlan } = await import('./planStore')
    const p = emptyPlan('p', 'Plan')
    p.steps['19'] = { values: { chosenPath: 'Yol A', objective: 'Eski hedef' }, status: 'taslak', updatedAt: '' }
    p.steps['U31'] = { values: { objective: 'Yeni hedef' }, status: 'taslak', updatedAt: '' }
    migratePlan(p)
    const once = JSON.stringify(p.steps)
    migratePlan(p)
    expect(JSON.stringify(p.steps)).toBe(once)
    expect(p.steps['U31'].values.objective).toBe('Yeni hedef')
    expect(p.steps['19'].values).toEqual({ chosenPath: 'Yol A' })
  })
  it('eksik hedefle taşınan adım taslak kalır', async () => {
    const { migratePlan } = await import('./planStore')
    const p = emptyPlan('p', 'Plan')
    p.steps['19'] = { values: { chosenPath: 'Yol A', objective: 'Hedef' }, status: 'tamam', updatedAt: '' }
    migratePlan(p)
    expect(p.steps['U31'].status).toBe('taslak')
    expect(p.steps['U32']).toBeUndefined()
  })
  it('Adım 19 yoksa plan değişmez', async () => {
    const { migratePlan } = await import('./planStore')
    const p = emptyPlan('p', 'Plan')
    expect(migratePlan(p).steps).toEqual({})
  })
})
