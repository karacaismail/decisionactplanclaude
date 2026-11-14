import { describe, expect, it } from 'vitest'
import { buildDemoPlan } from '@/data/demo'
import { emptyPlan } from '@/data/types'
import { backupState } from './backup'
import { blindSpots, knowledgeRatio } from './blindspots'

describe('bakılmayan alanlar', () => {
  it('örnek planda bakılmayan alan yoktur', () => {
    expect(blindSpots(buildDemoPlan())).toEqual([])
  })
  it('atlanan adımı nedeniyle birlikte verir', () => {
    const p = buildDemoPlan()
    p.steps['04'] = { values: {}, status: 'atlandi', skipReason: 'Sektörü iyi tanıyorum.', updatedAt: '' }
    expect(blindSpots(p)).toEqual([{ step: '04', title: 'Dış çevre taraması', kind: 'atlandi', reason: 'Sektörü iyi tanıyorum.' }])
  })
  it('hiç doldurulmayan adımı verir', () => {
    const p = buildDemoPlan()
    delete p.steps['09']
    expect(blindSpots(p)).toEqual([{ step: '09', title: 'Pazar ve rakip taraması', kind: 'bos', reason: 'Bu adım hiç doldurulmadı.' }])
  })
  it('kısa yolun gizlediği boş adımı verir', () => {
    const p = buildDemoPlan()
    p.shortPath = true
    delete p.steps['04']
    expect(blindSpots(p).map((b) => [b.step, b.kind])).toEqual([['04', 'kisaYol']])
  })
  it('kısa yolun gizlediği dolu adım bakılmış sayılır', () => {
    const p = buildDemoPlan()
    p.shortPath = true
    expect(blindSpots(p)).toEqual([])
  })
  it('profile göre gizlenen adım bakılmayan alan sayılmaz', () => {
    const p = buildDemoPlan()
    delete p.steps['03']
    p.profile.team = 'tekKurucu'
    expect(blindSpots(p).some((b) => b.step === '03')).toBe(false)
  })
  it('boş planda Adım 00 ile Adım 18 arasındaki görünen her adım listelenir', () => {
    const spots = blindSpots(emptyPlan('p', 'Plan'))
    expect(spots.every((b) => b.kind === 'bos')).toBe(true)
    expect(spots.map((b) => b.step)).toContain('17')
    expect(spots.every((b) => Number(b.step) <= 18)).toBe(true)
  })
})

describe('varsayımın bilgiye oranı', () => {
  const claim = (status: 'kaynakli' | 'hesap' | 'karar' | 'varsayim') => ({ status })
  it('cümleleri türüne göre sayar', () => {
    const r = knowledgeRatio([{ claims: [claim('kaynakli'), claim('kaynakli'), claim('varsayim')] }, { claims: [claim('hesap'), claim('karar'), claim('varsayim')] }])
    expect(r).toEqual({ total: 6, kaynakli: 2, hesap: 1, karar: 1, varsayim: 2, sentence: '6 cümlenin 2 tanesi varsayım. 2 tanesi kaynaklı.' })
  })
  it('cümle yokken oran yoktur', () => {
    expect(knowledgeRatio([{ claims: [] }])).toBeNull()
  })
})

describe('yedek durumu', () => {
  const now = new Date('2026-11-15T12:00:00')
  it('örnek plan ve boş plan yedek istemez', () => {
    expect(backupState(buildDemoPlan(), undefined, now)).toBe('gerekmez')
    expect(backupState(emptyPlan('p', 'Plan'), undefined, now)).toBe('gerekmez')
  })
  it('verisi olan plan hiç yedeklenmediyse uyarır', () => {
    const p = buildDemoPlan()
    p.example = false
    expect(backupState(p, undefined, now)).toBe('hic')
  })
  it('yedek 7 günden eskiyse uyarır, yeniyse uyarmaz', () => {
    const p = buildDemoPlan()
    p.example = false
    expect(backupState(p, '2026-11-01T10:00:00.000Z', now)).toBe('eski')
    expect(backupState(p, '2026-11-12T10:00:00.000Z', now)).toBe('guncel')
  })
})
