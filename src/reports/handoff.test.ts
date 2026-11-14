import { describe, expect, it } from 'vitest'
import { buildDemoPlan } from '@/data/demo'
import { emptyPlan } from '@/data/types'
import { NO_PATHS, buildHandoffReport, confidenceOf, handoffToMarkdown } from './handoff'

describe('buildHandoffReport', () => {
  it('boş planda uydurma yapmaz', () => {
    const r = buildHandoffReport(emptyPlan('p', 'Plan'))
    expect(r.question).toBe(NO_PATHS)
    expect(r.paths).toEqual([])
    expect(r.coverageFilled).toBe(0)
    expect(r.coverage).toHaveLength(14)
    expect(r.groups).toHaveLength(6)
    expect(r.groups.every((g) => g.claims.length === 0)).toBe(true)
    expect(handoffToMarkdown(r)).toContain('Henüz yazılmadı.')
  })

  it('örnek planda karar sorusu açık karar defterinden gelir', () => {
    const r = buildHandoffReport(buildDemoPlan())
    expect(r.question).toBe('Durakta mı satalım, ön siparişle mi teslim edelim?')
    expect(r.openDecisions.length).toBeGreaterThanOrEqual(2)
    expect(r.openDecisions[0].door).toBe('tekYonlu')
  })

  it('yolları yan yana verir; ilk yol bugünkü durumdur', () => {
    const r = buildHandoffReport(buildDemoPlan())
    expect(r.paths).toHaveLength(4)
    expect(r.paths[0].baseline).toBe(true)
    expect(r.paths.slice(1).every((p) => p.where && p.how && p.giveUp && p.cost && p.reversible)).toBe(true)
    expect(r.paths.every((p) => p.score !== null)).toBe(true)
  })

  it('her cümleye tür ve güven verir; kaynaklı cümlenin kaynağı vardır', () => {
    const r = buildHandoffReport(buildDemoPlan())
    const all = r.groups.flatMap((g) => g.claims)
    expect(all.length).toBeGreaterThan(8)
    for (const c of all.filter((x) => x.status === 'kaynakli')) expect(c.source).toBeTruthy()
    expect(all.some((c) => c.status === 'hesap')).toBe(true)
    expect(all.some((c) => c.status === 'karar')).toBe(true)
    expect(all.some((c) => c.status === 'varsayim')).toBe(true)
    expect(all.some((c) => c.counter)).toBe(true)
  })

  it('para hesabını kötü, orta ve iyi durumda verir', () => {
    const r = buildHandoffReport(buildDemoPlan())
    expect(r.sensitivity.map((s) => s.label)).toEqual(['Kötü durum', 'Orta durum', 'İyi durum'])
    expect(r.sensitivity.every((s) => s.breakEven.includes('sipariş'))).toBe(true)
  })

  it('verilmiş kararları ve sınırları ayırır', () => {
    const r = buildHandoffReport(buildDemoPlan())
    expect(r.locked).toHaveLength(5)
    expect(r.limits.some((l) => l.label === 'Pist')).toBe(true)
    expect(r.stopRules.length).toBeGreaterThanOrEqual(3)
    expect(r.redLines).toBeTruthy()
  })

  it('örnek planda 14 başlığın en az 12 tanesi doludur', () => {
    const r = buildHandoffReport(buildDemoPlan())
    expect(r.coverageFilled, r.coverage.filter((c) => c.status !== 'dolu').map((c) => `${c.no}:${c.status}`).join(' ')).toBeGreaterThanOrEqual(12)
  })

  it('kanıt silinince cümle varsayıma düşer', () => {
    const p = buildDemoPlan()
    p.evidence = []
    const r = buildHandoffReport(p)
    const first = r.groups[0].claims
    expect(first.every((c) => c.status === 'varsayim' && c.confidence === 'kanitsiz')).toBe(true)
  })

  it('Markdown beş bölümü ve iki eki içerir', () => {
    const md = handoffToMarkdown(buildHandoffReport(buildDemoPlan()))
    for (const h of ['## 1. Stratej bugün hangi kararı verecek?', '## 2. Dayanaklar', '## 3. Bağlayıcı sınırlar', '## 4. Karşılaştırılacak yollar', '## 5. Seçimi değiştirebilecek eksik bilgi', '## Ek 1. Kapsam', "## Ek 2. Stratej'in ilk günü"]) expect(md).toContain(h)
  })
})

describe('confidenceOf', () => {
  it('basamağı güvene çevirir', () => {
    expect(confidenceOf(1)).toBe('yuksek')
    expect(confidenceOf(3)).toBe('yuksek')
    expect(confidenceOf(4)).toBe('orta')
    expect(confidenceOf(6)).toBe('dusuk')
    expect(confidenceOf(null)).toBe('kanitsiz')
  })
})
