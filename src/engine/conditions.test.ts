import { describe, expect, it } from 'vitest'
import { emptyPlan } from '@/data/types'
import { evalCondition, stepApplies } from './conditions'

describe('evalCondition', () => {
  const plan = emptyPlan('p', 'Plan')
  plan.profile = { customer: 'isletme', regulation: 'yuksek' }
  plan.steps['01'] = { status: 'tamam', values: { exitDirection: 'satis', whys: ['a'] }, updatedAt: '' }

  it('profil koşulu listedeki değere bakar', () => {
    expect(evalCondition({ profile: { customer: ['isletme', 'kamu'] } }, plan)).toBe(true)
    expect(evalCondition({ profile: { customer: ['tuketici'] } }, plan)).toBe(false)
  })

  it('alan koşulu başka adımın değerini okur', () => {
    expect(evalCondition({ field: { step: '01', key: 'exitDirection', equals: 'satis' } }, plan)).toBe(true)
    expect(evalCondition({ field: { step: '01', key: 'exitDirection', in: ['devir'] } }, plan)).toBe(false)
  })

  it('alan koşulu önce ekrandaki taze değere bakar', () => {
    expect(evalCondition({ field: { key: 'mode', equals: 'ucretli' } }, plan, '14', { mode: 'ucretli' })).toBe(true)
  })

  it('boş liste dolu sayılmaz', () => {
    expect(evalCondition({ field: { key: 'dependencies', truthy: true } }, plan, undefined, { dependencies: [] })).toBe(false)
    expect(evalCondition({ field: { key: 'dependencies', truthy: true } }, plan, undefined, { dependencies: ['tekKisi'] })).toBe(true)
    expect(evalCondition({ field: { key: 'dependencies', truthy: false } }, plan, undefined, { dependencies: [] })).toBe(true)
  })

  it('not, all ve any birleşir', () => {
    expect(evalCondition({ not: { profile: { customer: ['isletme'] } } }, plan)).toBe(false)
    expect(evalCondition({ all: [{ profile: { customer: ['isletme'] } }, { profile: { regulation: ['yuksek'] } }] }, plan)).toBe(true)
    expect(evalCondition({ any: [{ profile: { customer: ['kamu'] } }, { profile: { regulation: ['yuksek'] } }] }, plan)).toBe(true)
  })

  it('adım uygunluğu üç durumdan birini verir', () => {
    expect(stepApplies(true, plan)).toBe('zorunlu')
    expect(stepApplies(false, plan)).toBe('kosullu')
    expect(stepApplies({ profile: { customer: ['tuketici'] } }, plan)).toBe('gizli')
  })
})
