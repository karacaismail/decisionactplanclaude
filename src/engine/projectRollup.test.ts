import { describe, expect, it } from 'vitest'
import { parseProjectRollup, projectCardLines, rowBadge, rowCounts } from './projectRollup'

const valid = {
  v: 1,
  tarih: '2026-11-19',
  projeSayisi: 2,
  acik: 3,
  geciken: 1,
  biten: 4,
  hamleler: { 'm-amazon': { proje: 1, acik: 2, geciken: 1, biten: 1 }, 'u-foto': { proje: 1, acik: 0, geciken: 0, biten: 3 } },
}

describe('proje özeti okuyucusu', () => {
  it('geçerli özeti okur', () => {
    const r = parseProjectRollup(valid)
    expect(r).toEqual({ date: '2026-11-19', projects: 2, open: 3, overdue: 1, done: 4, truncated: false, rows: { 'm-amazon': { projects: 1, open: 2, overdue: 1, done: 1 }, 'u-foto': { projects: 1, open: 0, overdue: 0, done: 3 } } })
  })

  it('bozuk özeti yok sayar', () => {
    expect(parseProjectRollup(undefined)).toBeUndefined()
    expect(parseProjectRollup(null)).toBeUndefined()
    expect(parseProjectRollup({ ...valid, v: 2 })).toBeUndefined()
    expect(parseProjectRollup({ ...valid, acik: '3' })).toBeUndefined()
    expect(parseProjectRollup({ ...valid, projeSayisi: -1 })).toBeUndefined()
    expect(parseProjectRollup({ ...valid, hamleler: [] })).toBeUndefined()
  })

  it('bozuk satırı atar, öteki satırları korur', () => {
    const r = parseProjectRollup({ ...valid, hamleler: { iyi: { proje: 1, acik: 1, geciken: 0, biten: 0 }, kotu: { proje: 'x' } } })
    expect(Object.keys(r!.rows)).toEqual(['iyi'])
  })

  it('satırın sayısını kimlikle bulur, nesnenin kendi adlarını satır saymaz', () => {
    const r = parseProjectRollup(valid)!
    expect(rowCounts(r, 'm-amazon')?.open).toBe(2)
    expect(rowCounts(r, 'yok')).toBeUndefined()
    expect(rowCounts(r, 'constructor')).toBeUndefined()
    expect(rowCounts(undefined, 'm-amazon')).toBeUndefined()
  })

  it('kesik özeti işaretler', () => {
    expect(parseProjectRollup({ ...valid, kesik: true })?.truncated).toBe(true)
  })
})

describe('satır etiketi', () => {
  it('açık görevi ve gecikmeyi ayrı cümleyle yazar', () => {
    expect(rowBadge({ projects: 1, open: 2, overdue: 1, done: 1 })).toEqual({ summary: 'Projede 2 görev açık.', overdue: '1 görev gecikti.', link: 'Projeyi aç' })
  })

  it('açık görev yoksa biten görevi yazar', () => {
    expect(rowBadge({ projects: 2, open: 0, overdue: 0, done: 3 })).toEqual({ summary: '2 projede 3 görev bitti.', link: 'Projeleri aç' })
  })

  it('görevi olmayan projeyi söyler', () => {
    expect(rowBadge({ projects: 1, open: 0, overdue: 0, done: 0 })).toEqual({ summary: 'Projede henüz görev yok.', link: 'Projeyi aç' })
  })

  it('projesi olmayan satıra yalnız açma bağlantısı verir', () => {
    expect(rowBadge(undefined)).toEqual({ link: 'Proje aç' })
  })

  it('özet kesikse eksik satıra proje açma bağlantısı vermez', () => {
    expect(rowBadge(undefined, { truncated: true })).toEqual({ link: 'Projeleri gör' })
  })
})

describe('Projeler kartı', () => {
  it('sayıları kısa cümlelerle verir', () => {
    expect(projectCardLines(parseProjectRollup(valid)!)).toEqual({ projects: '2 proje var.', open: '3 görev açık.', overdue: '1 görev gecikti.', done: '4 görev bitti.' })
  })

  it('gecikme yoksa gecikme satırı yoktur', () => {
    const lines = projectCardLines(parseProjectRollup({ ...valid, geciken: 0 })!)
    expect(lines.overdue).toBeUndefined()
  })
})
