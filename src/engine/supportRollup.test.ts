import { describe, expect, it } from 'vitest'
import { buildDemoPlan } from '@/data/demo'
import { resourcesOf, RESOURCES_STEP } from './strategy'
import { parseSupportRollup, supportLines } from './supportRollup'

const valid = { v: 1, toplam: 3, durumlar: { hazirlaniyor: 1, basvuruldu: 0, sonuc_bekleniyor: 1, kabul: 1, ret: 0, vazgecildi: 0 } }

describe('destek özeti okuyucusu', () => {
  it('geçerli özeti okur', () => {
    expect(parseSupportRollup(valid)).toEqual({ total: 3, statuses: valid.durumlar })
  })

  it('bozuk özeti yok sayar', () => {
    expect(parseSupportRollup(undefined)).toBeUndefined()
    expect(parseSupportRollup({ ...valid, v: 2 })).toBeUndefined()
    expect(parseSupportRollup({ ...valid, toplam: -1 })).toBeUndefined()
    expect(parseSupportRollup({ ...valid, durumlar: [] })).toBeUndefined()
  })

  it('bozuk durum sayısını atar', () => {
    expect(parseSupportRollup({ ...valid, durumlar: { kabul: 1, ret: 'x' } })?.statuses).toEqual({ kabul: 1 })
  })
})

describe('3.3 satırı', () => {
  it('sayıyı ve durumları kısa cümlelerle yazar, sıfır durumları atlar', () => {
    expect(supportLines(parseSupportRollup(valid)!)).toEqual({
      total: 'Destek başvuruları: 3',
      statuses: ['1 başvuru hazırlanıyor.', '1 başvuru sonuç bekliyor.', '1 başvuru kabul edildi.'],
    })
  })

  it('bilinmeyen durumu sayıyla ayrı yazar', () => {
    expect(supportLines({ total: 2, statuses: { kabul: 1, yeni_durum: 1 } }).statuses).toEqual(['1 başvuru kabul edildi.', '1 başvuru başka bir durumda.'])
  })
})

describe('destek parası bütçeye girmez', () => {
  it('kaynak satırları destek özetinden etkilenmez', () => {
    const plan = buildDemoPlan()
    const before = JSON.stringify(resourcesOf(plan))
    parseSupportRollup(valid)
    expect(JSON.stringify(resourcesOf(plan))).toBe(before)
    expect(RESOURCES_STEP).toBe('U33')
  })
})
