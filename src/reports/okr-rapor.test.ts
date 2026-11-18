/**
 * Aksiyon planındaki hedef takibi bölümü.
 * Bölüm yalnız hedef takibi açıkken ve en az bir hedef yazılmışken görünür.
 */
import { describe, expect, it } from 'vitest'
import { emptyPlan, type OkrState } from '@/data/types'
import { buildActionPlan, buildExecutiveReport, reportToMarkdown } from './build'

const TITLE = 'Hedef takibi'

function okr(patch: Partial<OkrState> = {}): OkrState {
  return {
    enabled: true,
    changedAt: '2026-11-19T10:00:00.000Z',
    periods: [
      {
        id: 'd1',
        startsAt: '2026-11-01',
        endsAt: '2027-02-01',
        objectives: [
          {
            id: 'h1',
            title: 'Aylık kartla düzenli müşteri kazanmak',
            kind: 'zorlu',
            owner: 'Kurucu',
            indicators: [
              { id: 'g1', name: 'Ödenen aylık kart sayısı', baseline: 7, target: 30, checkIns: [{ at: '2026-11-10T00:00:00.000Z', value: 14, confidence: 'belki' }] },
              { id: 'g2', name: 'Günlük ücretli sipariş sayısı', baseline: null, target: 40, checkIns: [] },
            ],
          },
        ],
      },
    ],
    ...patch,
  }
}

describe('aksiyon planı hedef takibi bölümü', () => {
  it('hedef takibi yoksa ya da kapalıysa bölüm yoktur', () => {
    const p = emptyPlan('p', 'Plan')
    expect(buildActionPlan(p).sections.map((s) => s.title)).not.toContain(TITLE)
    p.okr = okr({ enabled: false })
    expect(buildActionPlan(p).sections.map((s) => s.title)).not.toContain(TITLE)
  })
  it('açık ama hedefsiz kayıtta bölüm yoktur', () => {
    const p = emptyPlan('p', 'Plan')
    p.okr = okr({ periods: [{ id: 'd1', startsAt: '2026-11-01', endsAt: '2027-02-01', objectives: [] }] })
    expect(buildActionPlan(p).sections.map((s) => s.title)).not.toContain(TITLE)
  })
  it('açık ve dolu kayıtta hedefleri, puanı ve bilinmeyen değeri yazar', () => {
    const p = emptyPlan('p', 'Plan')
    p.okr = okr()
    const section = buildActionPlan(p).sections.find((s) => s.title === TITLE)!
    expect(section).toBeDefined()
    expect(section.lines).toContain('Hedef 1: Aylık kartla düzenli müşteri kazanmak. Zorlu hedef. Sorumlu: Kurucu. Yüzde 30 ilerledi. Zorlu hedefte yüzde 70 iyi bir sonuçtur.')
    expect(section.table?.head).toEqual(['Hedef', 'Gösterge', 'Başlangıç değeri', 'Varılacak sayı', 'Bugünkü sayı', 'İlerleme'])
    expect(section.table?.rows).toEqual([
      ['1', 'Ödenen aylık kart sayısı', '7', '30', '14', 'Yüzde 30'],
      ['1', 'Günlük ücretli sipariş sayısı', 'Bilinmiyor', '40', 'Yazılmadı', 'Hesaplanmadı'],
    ])
    expect(reportToMarkdown(buildActionPlan(p))).toContain('## Hedef takibi')
  })
  it('bozuk kayıt raporu bozmaz', () => {
    const p = emptyPlan('p', 'Plan')
    p.okr = { enabled: true, periods: 'bozuk' } as unknown as OkrState
    expect(() => buildActionPlan(p)).not.toThrow()
    expect(buildActionPlan(p).sections.map((s) => s.title)).not.toContain(TITLE)
  })
  it('yönetici raporu hedef takibini yazmaz', () => {
    const p = emptyPlan('p', 'Plan')
    p.okr = okr()
    expect(JSON.stringify(buildExecutiveReport(p))).not.toContain('Aylık kartla düzenli müşteri kazanmak')
  })
})
