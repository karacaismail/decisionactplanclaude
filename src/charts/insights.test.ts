import { describe, expect, it } from 'vitest'
import { buildDemoPlan } from '@/data/demo'
import { DECISIONS } from '@/data/decisions'
import { emptyPlan } from '@/data/types'
import { evaluateGate } from '@/engine/gate'
import { evaluateReadiness } from '@/engine/readiness'
import { buildInsights, summaryTiles, type InsightPalette } from './insights'

const palette: InsightPalette = { primary: '#111', info: '#222', success: '#333', warning: '#444', error: '#555', muted: '#666', outcome: () => '#777' }

describe('örnek plan', () => {
  const plan = buildDemoPlan()

  it('örnek damgası, sürüm 5 ve beş ilerle kararı taşır', () => {
    expect(plan.example).toBe(true)
    expect(plan.revision).toBe(5)
    expect(plan.decisions.map((d) => d.gate)).toEqual([1, 2, 3, 4, 5])
    expect(plan.decisions.every((d) => d.chosen === 'ilerle')).toBe(true)
    expect(plan.limits.budgetKurus).toBe(15_000_000)
    expect(plan.evidence).toHaveLength(4)
    expect(plan.tasks).toHaveLength(3)
    expect(plan.transitions).toEqual([])
  })

  it('Karar 1-5 kapıları motorun ölçütleriyle de "ilerle" önerir', () => {
    for (const n of [1, 2, 3, 4, 5]) {
      const ev = evaluateGate(DECISIONS[n - 1].gate, plan)
      expect(ev.suggested, `Kapı ${n}: ${ev.reasons.join(' ')}`).toBe('ilerle')
    }
  })

  it('Adım 00-18 tamam, strateji oluşturma adımları boş', () => {
    for (let i = 0; i <= 18; i++) expect(plan.steps[String(i).padStart(2, '0')]?.status).toBe('tamam')
    for (const id of ['19', '20']) expect(plan.steps[id]).toBeUndefined()
  })

  it('geçiş kapısı dokuz zorunlu ölçütü karşılar ve "hazır" ya da "koşullu" önerir', () => {
    const r = evaluateReadiness(plan)
    expect(r.mandatory.filter((c) => c.met !== true).map((c) => c.id)).toEqual([])
    expect(['hazir', 'kosullu']).toContain(r.suggested)
    expect(r.level).toBe(5)
    const strong = plan.evidence.filter((e) => e.ladder >= 1 && e.ladder <= 3)
    expect(strong.some((e) => e.linkedSteps.includes('15'))).toBe(true)
  })
})

describe('göstergeler', () => {
  it('örnek planda özet kutuları hesaplanır', () => {
    const tiles = summaryTiles(buildDemoPlan())
    expect(tiles.map((t) => t.key)).toEqual(['pist', 'acik', 'butce', 'deneme'])
    expect(tiles[0].value).toBe('8 ay')
    expect(tiles[1].value).toBe('Açık yok')
    expect(tiles[3].value).toBe('2 / karar')
  })

  it('örnek planda en az altı gösterge üretir ve veri olanlar dolu gelir', () => {
    const all = buildInsights(buildDemoPlan(), palette)
    expect(all.length).toBeGreaterThanOrEqual(6)
    const byId = Object.fromEntries(all.map((i) => [i.id, i]))
    const huni = byId.huni
    expect(huni.empty).toBe(false)
    if (!huni.empty) expect(huni.table.rows).toContainEqual(['Taahhüt veren', 11])
    const kapilar = byId.kapilar
    if (!kapilar.empty) expect(kapilar.table.rows).toHaveLength(5)
    const olcu = byId.olcu
    expect(olcu.empty).toBe(false)
    if (!olcu.empty) expect(olcu.table.rows).toHaveLength(3)
    expect(byId.nakit.empty).toBe(false)
  })

  it('boş planda yalnız adım sayacı dolu, diğerleri ölçüm bekler', () => {
    const all = buildInsights(emptyPlan('p', 'Boş'), palette)
    expect(all.find((i) => i.id === 'adimlar')?.empty).toBe(false)
    expect(all.filter((i) => i.id !== 'adimlar').every((i) => i.empty)).toBe(true)
    const tiles = summaryTiles(emptyPlan('p', 'Boş'))
    expect(tiles[0].value).toBe('Hesaplanmadı')
  })
})
