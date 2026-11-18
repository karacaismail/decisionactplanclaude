import { describe, expect, it } from 'vitest'
import { emptyPlan, type Decision, type PlanDoc } from '@/data/types'
import { applyLimits, applyProfile, applySkip, applyStepValues, markStale, openReviews, recordChanges, reviewChange } from './changes'
import { gatePassed } from './gate'

function decision(patch: Partial<Decision>): Decision {
  return { id: 'd', gate: 1, scope: 'Deneme', criteria: [], suggested: 'ilerle', chosen: 'ilerle', reason: 'Gerekçe', retriesLeft: 2, decidedBy: 'Kurucu', decidedAt: new Date().toISOString(), revision: 1, ...patch }
}

function planWithDecisions(): PlanDoc {
  const p = emptyPlan('p', 'Plan')
  p.decisions = [decision({ id: 'a', gate: 1 }), decision({ id: 'b', gate: 2 }), decision({ id: 'c', gate: 2, chosen: 'kosulluIlerle' }), decision({ id: 'd', gate: 3 })]
  return p
}

describe('eskiyen kararlar', () => {
  it('kontrole eşit ve sonraki kontrollerin yalnız son kararı eskir', () => {
    const p = planWithDecisions()
    expect(markStale(p, 2)).toBe(2)
    expect(p.decisions.find((d) => d.id === 'a')?.stale).toBeUndefined()
    expect(p.decisions.find((d) => d.id === 'b')?.stale).toBeUndefined()
    expect(p.decisions.find((d) => d.id === 'c')?.stale).toBe(true)
    expect(p.decisions.find((d) => d.id === 'd')?.stale).toBe(true)
  })

  it('eski karar kontrolü geçmiş saymaz', () => {
    const p = planWithDecisions()
    expect(gatePassed(p, 3)).toBe(true)
    markStale(p, 3)
    expect(gatePassed(p, 3)).toBe(false)
    expect(gatePassed(p, 2)).toBe(true)
  })

  it('adım değeri değişince adımın kararı ve sonrakiler eskir', () => {
    const p = planWithDecisions()
    p.steps['05'] = { values: { a: 1 }, status: 'taslak', updatedAt: '' }
    expect(applyStepValues(p, '05', { a: 2 })).toBe(true)
    expect(gatePassed(p, 1)).toBe(true)
    expect(gatePassed(p, 2)).toBe(false)
    expect(gatePassed(p, 3)).toBe(false)
  })

  it('aynı değer yeniden yazılırsa hiçbir şey değişmez', () => {
    const p = planWithDecisions()
    p.steps['05'] = { values: { a: 1, list: [{ x: 1 }] }, status: 'taslak', updatedAt: '' }
    expect(applyStepValues(p, '05', { a: 1, list: [{ x: 1 }] })).toBe(false)
    expect(p.decisions.every((d) => !d.stale)).toBe(true)
  })

  it('profil ve sınır değişikliği bütün kontrolleri eskitir', () => {
    const p = planWithDecisions()
    p.profile = { team: 'ekip' }
    expect(applyProfile(p, { team: 'ekip' })).toBe(false)
    expect(applyProfile(p, { team: 'tekKurucu' })).toBe(true)
    expect(gatePassed(p, 1)).toBe(false)
    const q = planWithDecisions()
    q.limits = { budgetKurus: 100 }
    expect(applyLimits(q, { budgetKurus: 100 })).toBe(false)
    expect(applyLimits(q, { budgetKurus: 200 })).toBe(true)
    expect(gatePassed(q, 1)).toBe(false)
  })

  it('adım atlanınca o kontrol eskir', () => {
    const p = planWithDecisions()
    expect(applySkip(p, '09', 'Bu profilde gerekmez')).toBe(true)
    expect(gatePassed(p, 2)).toBe(true)
    expect(gatePassed(p, 3)).toBe(false)
    expect(applySkip(p, '09', 'Bu profilde gerekmez')).toBe(false)
  })
})

describe('değişiklik kaydı', () => {
  it('ilk doldurma kayıt değildir, sonraki değişiklik kayıttır', () => {
    const p = emptyPlan('p', 'Plan')
    expect(applyLimits(p, { budgetKurus: 100000 })).toBe(true)
    expect(p.changes).toHaveLength(0)
    applyLimits(p, { budgetKurus: 150000 })
    expect(p.changes).toHaveLength(1)
    expect(p.changes?.[0]).toMatchObject({ step: '02', key: 'budgetKurus', label: 'Toplam harcama sınırı', before: 100000, after: 150000 })
  })

  it('tek kurucuda bütçe artışı, deneme artışı ve tarih ertelemesi ikinci görüş ister', () => {
    const p = emptyPlan('p', 'Plan')
    p.profile = { team: 'tekKurucu' }
    p.limits = { budgetKurus: 100, retriesPerDecision: 1, deadline: '2026-12-01', successSentence: 'Eski' }
    applyLimits(p, { budgetKurus: 200, retriesPerDecision: 2, deadline: '2027-01-01', successSentence: 'Yeni' })
    const byKey = Object.fromEntries((p.changes ?? []).map((c) => [c.key, c.needsReview]))
    expect(byKey).toEqual({ budgetKurus: true, retriesPerDecision: true, deadline: true, successSentence: false })
  })

  it('azalış ve ekip planı ikinci görüş istemez', () => {
    const p = emptyPlan('p', 'Plan')
    p.profile = { team: 'tekKurucu' }
    p.limits = { budgetKurus: 200 }
    applyLimits(p, { budgetKurus: 100 })
    expect(p.changes?.[0].needsReview).toBe(false)
    const q = emptyPlan('q', 'Plan')
    q.profile = { team: 'ekip' }
    q.limits = { budgetKurus: 100 }
    applyLimits(q, { budgetKurus: 200 })
    expect(q.changes?.[0].needsReview).toBe(false)
  })

  it('adım 02 ve sınır aynı geçişi iki kez yazmaz', () => {
    const p = emptyPlan('p', 'Plan')
    p.steps['02'] = { values: { budgetKurus: 100, extraIncome: false }, status: 'taslak', updatedAt: '' }
    p.limits = { budgetKurus: 100 }
    applyStepValues(p, '02', { budgetKurus: 300, extraIncome: true })
    applyLimits(p, { budgetKurus: 300 })
    expect(p.changes?.map((c) => c.key)).toEqual(['budgetKurus', 'extraIncome'])
    expect(p.changes?.[1].label).toBe('Başka gelir')
  })

  it('recordChanges yalnız istenen anahtarlara bakar', () => {
    const p = emptyPlan('p', 'Plan')
    recordChanges(p, '02', { a: 1, b: 1 }, { a: 2, b: 2 }, ['a'])
    expect(p.changes?.map((c) => c.key)).toEqual(['a'])
  })

  it('görüş kaydı açık değişikliği kapatır, kurucu kendi görüşünü yazamaz', () => {
    const p = emptyPlan('p', 'Plan')
    p.profile = { team: 'tekKurucu' }
    p.limits = { budgetKurus: 100 }
    p.decisions = [decision({ decidedBy: 'Ayşe' })]
    applyLimits(p, { budgetKurus: 200 })
    const id = p.changes![0].id
    expect(openReviews(p)).toHaveLength(1)
    expect(reviewChange(p, id, '  ')).toBe('İnceleyen kişinin adını yazın.')
    expect(reviewChange(p, id, 'ayşe ')).toBe('İnceleyen kişi kararı veren kurucu ile aynı olamaz.')
    expect(reviewChange(p, 'yok', 'Mehmet')).toBe('Değişiklik kaydı bulunamadı.')
    expect(reviewChange(p, id, 'Mehmet')).toBeNull()
    expect(openReviews(p)).toHaveLength(0)
    expect(p.changes![0].reviewer).toBe('Mehmet')
    expect(p.changes![0].reviewedAt).toBeTruthy()
  })
})
