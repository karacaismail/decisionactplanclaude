import { describe, expect, it } from 'vitest'
import { emptyPlan } from '@/data/types'
import { breakEvenCalc, marketCalc } from './calc'

describe('marketCalc', () => {
  it('sayılar eksikse hesap yapmaz', () => {
    expect(marketCalc({ reachableCustomers: 100 })).toBeNull()
  })
  it('ulaşılan ile kapasiteden küçük olanı verir ve alana yazmayı önerir', () => {
    const r = marketCalc({ reachableCustomers: 2400, salesCapacity: 350, targetCustomers: 300 })
    expect(r?.value).toBe('350 müşteri')
    expect(r?.apply).toEqual({ key: 'somCustomers', value: 350, label: 'Sonucu "Gerçekçi pazar" alanına yaz' })
    expect(r?.warn).toBeUndefined()
  })
  it('gerçekçi pazar hedefin altındaysa uyarır', () => {
    const r = marketCalc({ reachableCustomers: 200, salesCapacity: 500, targetCustomers: 300 })
    expect(r?.value).toBe('200 müşteri')
    expect(r?.warn).toContain('hedefin altında')
  })
  it('yukarıdan hesabı karşılaştırma satırı olarak ekler', () => {
    const r = marketCalc({ reachableCustomers: 500, salesCapacity: 400, totalMarket: 10000, sharePercent: 5 })
    expect(r?.lines.join(' ')).toContain('500 müşteri eder')
  })
})

describe('breakEvenCalc', () => {
  const plan = emptyPlan('p', 'Plan')
  plan.limits.monthlyBurnKurus = 3_000_000

  it('aylık gideri sipariş katkısına böler ve üst tam sayıya yuvarlar', () => {
    const r = breakEvenCalc({ contributionMid: 7_000 }, plan)
    expect(r?.value).toBe('429 sipariş')
    expect(r?.apply?.key).toBe('breakEvenCount')
    expect(r?.apply?.value).toBe(429)
  })
  it('katkı artı değilse hesaplamaz ve uyarır', () => {
    const r = breakEvenCalc({ contributionMid: 0 }, plan)
    expect(r?.value).toBe('Hesaplanamaz')
    expect(r?.apply).toBeUndefined()
    expect(r?.warn).toContain('artı değil')
  })
  it('aylık gider yazılmadıysa hesap yapmaz', () => {
    expect(breakEvenCalc({ contributionMid: 5000 }, emptyPlan('q', 'Plan'))).toBeNull()
  })
})
