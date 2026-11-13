import { describe, expect, it } from 'vitest'
import { emptyPlan } from './types'
import { MAX_IMPORT_BYTES, parsePlanImport, prepareImportedPlan, validatePlanDoc } from './validate'

describe('validatePlanDoc', () => {
  it('boş plan geçerlidir', () => {
    expect(validatePlanDoc(emptyPlan('p', 'Plan'))).toBe(true)
  })

  it('dizi, metin ve boş nesne geçersizdir', () => {
    expect(validatePlanDoc([])).toBe(false)
    expect(validatePlanDoc('plan')).toBe(false)
    expect(validatePlanDoc(null)).toBe(false)
    expect(validatePlanDoc({})).toBe(false)
  })

  it('şema sürümü, kimlik ve ad zorunludur', () => {
    const base = emptyPlan('p', 'Plan')
    expect(validatePlanDoc({ ...base, schemaVersion: '2.0' })).toBe(false)
    expect(validatePlanDoc({ ...base, id: '' })).toBe(false)
    expect(validatePlanDoc({ ...base, name: 7 })).toBe(false)
  })

  it('adımlar nesne, kanıt, karar ve işler dizi olmalıdır', () => {
    const base = emptyPlan('p', 'Plan')
    expect(validatePlanDoc({ ...base, steps: [] })).toBe(false)
    expect(validatePlanDoc({ ...base, evidence: {} })).toBe(false)
    expect(validatePlanDoc({ ...base, decisions: 'yok' })).toBe(false)
    expect(validatePlanDoc({ ...base, tasks: undefined })).toBe(false)
    expect(validatePlanDoc({ ...base, changes: 'yok' })).toBe(false)
  })
})

describe('parsePlanImport', () => {
  it('geçerli dosyayı plana çevirir', () => {
    const p = parsePlanImport(JSON.stringify(emptyPlan('p', 'Plan')))
    expect(p.id).toBe('p')
  })

  it('bozuk JSON ve yanlış biçim Türkçe hata verir', () => {
    expect(() => parsePlanImport('{')).toThrow('Dosya okunamadı. Geçerli bir JSON dosyası seçin.')
    expect(() => parsePlanImport('{"a":1}')).toThrow('Bu dosya bir plan dosyası değil.')
  })

  it('8 MB üstü dosya reddedilir', () => {
    expect(() => parsePlanImport('{}', MAX_IMPORT_BYTES + 1)).toThrow('8 MB sınırını aşıyor')
  })
})

describe('prepareImportedPlan', () => {
  it('yeni kimlik verir ve adına "(kopya)" ekler', () => {
    const src = emptyPlan('p', 'Plan')
    const copy = prepareImportedPlan(src)
    expect(copy.id).not.toBe('p')
    expect(copy.name).toBe('Plan (kopya)')
    expect(prepareImportedPlan(copy).name).toBe('Plan (kopya)')
  })
})
