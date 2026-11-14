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
