// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { buildDemoPlan } from './demo'
import { SHOE_DEMO_ID, SHOE_DEMO_NAME, SUGGESTED_ROLE, buildShoeDemoPlan } from './demoAyakkabi'
import { DECISIONS } from './decisions'
import { evaluateStones } from './foundation'
import { validatePlanDoc } from './validate'
import { STEPS } from './registry'
import { evaluateGate } from '@/engine/gate'
import { planPosition } from '@/engine/position'
import { evaluateReadiness } from '@/engine/readiness'
import { blindSpots } from '@/engine/blindspots'
import { buildSituation } from '@/engine/situation'
import { buildHandoffReport } from '@/reports/handoff'
import { buildFoundationDoc } from '@/reports/foundation'
import { buildActionPlan, buildExecutiveReport } from '@/reports/build'
import { buildInsights, summaryTiles, type InsightPalette } from '@/charts/insights'

const palette: InsightPalette = { primary: '#111', info: '#222', success: '#333', warning: '#444', error: '#555', muted: '#666', outcome: () => '#777' }
const skills = (p = buildShoeDemoPlan()) => (p.steps['12'].values.skills as { skill: string; plan?: string }[])

describe('ayakkabı örneği', () => {
  it('kafe örneğinden ayrı bir örnek plandır', () => {
    const p = buildShoeDemoPlan()
    expect(p.id).toBe(SHOE_DEMO_ID)
    expect(p.name).toBe(SHOE_DEMO_NAME)
    expect(p.id).not.toBe(buildDemoPlan().id)
    expect(p.example).toBe(true)
    expect(validatePlanDoc(JSON.parse(JSON.stringify(p)))).toBe(true)
  })

  it('çalışan bir işletme olarak girer', () => {
    const p = buildShoeDemoPlan()
    expect(p.entry).toBe('devralma')
    expect(p.profile.start).toBe('devralma')
    expect(p.profile.teamSize).toBe(200)
    expect(p.profile.description).toContain('İş zaten çalışıyor.')
  })

  it('yalnız tanımlı adımları ve alanları kullanır', () => {
    const p = buildShoeDemoPlan()
    for (const [id, rec] of Object.entries(p.steps)) {
      const def = STEPS[id]
      expect(def, `Adım ${id} tanımlı olmalı.`).toBeDefined()
      const keys = new Set(def.sections.flatMap((s) => s.fields.map((f) => f.key)))
      for (const key of Object.keys(rec.values)) expect(keys.has(key), `Adım ${id} alanı: ${key}`).toBe(true)
    }
  })

  it('verilen ekip yapısını taşır', () => {
    const text = skills().map((s) => s.skill).join('\n')
    for (const part of ['Yaklaşık 30 kişi', 'Yaklaşık 70 kişi', 'Yaklaşık 90 kişi', 'Fason takip ekibi', 'Grafik tasarım', 'Muhasebe uzmanı', 'Finans uzmanı', '1 lider ve 6 kişi', 'Amazon ABD', 'Sentetik deri', 'Kalıp, ökçe, taban ve dış yüzey', 'Mutfak sorumlusu', 'Patron']) {
      expect(text).toContain(part)
    }
  })

  it('araç tarafından eklenen rolleri açıkça işaretler', () => {
    const suggested = skills().filter((s) => s.skill.includes(SUGGESTED_ROLE))
    expect(suggested.map((s) => s.skill.replace(` ${SUGGESTED_ROLE}`, ''))).toEqual([
      'İş güvenliği uzmanı.',
      'İşyeri hekimi.',
      'İnsan kaynakları.',
      'Kalite kontrol.',
      'Satın alma ve tedarik.',
      'Üretim planlama.',
      'Depo ve sevkiyat.',
      'Müşteri hizmetleri. İade ve değişim.',
    ])
    // Önerilen rol için karar verilmedi. "Nasıl edinilecek?" boş kalır.
    expect(suggested.every((s) => s.plan === undefined)).toBe(true)
  })

  it('verilmeyen para bilgisini uydurmaz', () => {
    const p = buildShoeDemoPlan()
    expect(p.limits).toEqual({})
    expect(p.profile.funding).toBeUndefined()
    expect(p.steps['02']).toBeUndefined()
    expect(p.steps['16']).toBeUndefined()
    expect(p.evidence).toEqual([])
    expect(p.decisions).toEqual([])
    const json = JSON.stringify(p)
    expect(json).not.toMatch(/Kurus"\s*:\s*\d/)
  })

  it('kontrol 1 eksikleri gösterir', () => {
    const p = buildShoeDemoPlan()
    const ev = evaluateGate(DECISIONS[0].gate, p)
    expect(ev.criteria.profil).toBe(false)
    expect(ev.criteria.niyet).toBe(false)
    expect(ev.criteria.sinir).toBe(false)
    expect(ev.criteria.hak).toBe(true)
    expect(ev.suggested).not.toBe('ilerle')
  })

  it('motorlar ve raporlar hata vermeden çalışır', () => {
    const p = buildShoeDemoPlan()
    expect(planPosition(p)).toMatchObject({ stage: 'temel', decision: 1, level: 0 })
    for (const d of DECISIONS) expect(() => evaluateGate(d.gate, p)).not.toThrow()
    expect(() => evaluateReadiness(p)).not.toThrow()
    expect(() => blindSpots(p)).not.toThrow()
    expect(() => buildSituation(p)).not.toThrow()
    expect(() => evaluateStones(p)).not.toThrow()
    expect(() => buildHandoffReport(p)).not.toThrow()
    expect(() => buildFoundationDoc(p)).not.toThrow()
    expect(() => buildExecutiveReport(p)).not.toThrow()
    expect(() => buildActionPlan(p)).not.toThrow()
    expect(() => summaryTiles(p)).not.toThrow()
    expect(() => buildInsights(p, palette)).not.toThrow()
  })
})
