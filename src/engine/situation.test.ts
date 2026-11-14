import { describe, expect, it } from 'vitest'
import { buildDemoPlan } from '@/data/demo'
import { STEPS } from '@/data/registry'
import { FOUNDATION_DECISIONS } from '@/data/stages'
import { emptyPlan, type PlanDoc } from '@/data/types'
import { buildSituation, CROSS_QUESTIONS, crossAnswers, ORIGIN_LABEL, situationCount } from './situation'

function plan(steps: Record<string, Record<string, unknown>>): PlanDoc {
  const p = emptyPlan('p', 'Plan')
  for (const [id, values] of Object.entries(steps)) p.steps[id] = { values, status: 'taslak', updatedAt: '' }
  return p
}

describe('durum özeti', () => {
  it('boş planda dört liste de boştur', () => {
    const s = buildSituation(emptyPlan('p', 'Plan'))
    expect(s).toEqual({ guclu: [], zayif: [], firsat: [], tehdit: [], unclassified: 0 })
    expect(situationCount(s)).toBe(0)
  })

  it('güçlü yönler yalnız avantaj seviyesindeki güçlerdir', () => {
    const s = buildSituation(
      plan({
        '12': {
          strengths: [
            { _id: 'a', name: 'Usta ekip', valuable: 'evet', rare: 'evet', hardToCopy: 'evet', organized: 'evet' },
            { _id: 'b', name: 'Güler yüz', valuable: 'evet', rare: 'hayir' },
            { _id: 'c', name: 'Eski fırın', valuable: 'hayir' },
            { _id: 'd', name: 'Sınanmamış', valuable: 'evet' },
          ],
        },
      }),
    )
    expect(s.guclu).toEqual([{ text: 'Usta ekip', note: 'Kalıcı avantaj', step: '12' }])
    expect(s.zayif).toEqual([{ text: 'Eski fırın', note: 'İşe yaramıyor', step: '12' }])
  })

  it('zayıf yönler eksik becerilerden ve en kırılgan sayıdan gelir', () => {
    const s = buildSituation(
      plan({
        '12': { skills: [{ skill: 'Barista', plan: 'yap' }, { skill: 'Muhasebe', plan: 'satinAl' }, { skill: 'Yazılım', plan: 'ortak' }, { skill: 'Kaynak', plan: 'yok' }] },
        '16': { fragileNumber: 'Aylık kart sayısı' },
      }),
    )
    expect(s.zayif).toEqual([
      { text: 'Muhasebe', note: 'Dışarıdan alınıyor', step: '12' },
      { text: 'Yazılım', note: 'Ortağa bağlı', step: '12' },
      { text: 'Kaynak', note: 'Edinilemiyor', step: '12' },
      { text: 'Aylık kart sayısı', note: 'En kırılgan sayı', step: '16' },
    ])
  })

  it('fırsatlar talebi olan ve rakibin doldurmadığı boşluklardır', () => {
    const s = buildSituation(
      plan({
        '09': {
          gaps: [
            { gap: 'Sabah 7 açık kafe', demandExists: true, recentlyFilled: false },
            { gap: 'Gece kafesi', demandExists: false },
            { gap: 'Paket servis', demandExists: true, recentlyFilled: true },
          ],
        },
      }),
    )
    expect(s.firsat).toEqual([{ text: 'Sabah 7 açık kafe', note: 'Pazar boşluğu', step: '09' }])
  })

  it('dış etken kullanıcının seçimine göre fırsat ya da tehdit olur', () => {
    const s = buildSituation(
      plan({
        '04': {
          factorNotes: [
            { factor: 'Toplum', change: 'Evden çalışan artıyor.', effect: 'firsat' },
            { factor: 'Ekonomi', change: 'Çekirdek fiyatı arttı.', effect: 'tehdit' },
            { factor: 'Hukuk', change: 'Ruhsat gerekiyor.' },
          ],
        },
      }),
    )
    expect(s.firsat).toEqual([{ text: 'Evden çalışan artıyor.', note: 'Toplum', step: '04' }])
    expect(s.tehdit).toEqual([{ text: 'Çekirdek fiyatı arttı.', note: 'Ekonomi', step: '04' }])
    expect(s.unclassified).toBe(1)
  })

  it('tehditler güçlü baskılardan ve kritik risklerden gelir', () => {
    const s = buildSituation(
      plan({
        '04': { forceNew: 3, forceRivalry: 4, forceBuyer: 5 },
        '17': { risks: [{ risk: 'Kira sıçrar', likelihood: 2, impact: 3 }, { risk: 'Makine bozulur', likelihood: 1, impact: 2 }] },
      }),
    )
    expect(s.tehdit).toEqual([
      { text: 'Alıcıların gücü', note: 'Güçlü baskı, 5 / 5', step: '04' },
      { text: 'Rekabetin şiddeti', note: 'Güçlü baskı, 4 / 5', step: '04' },
      { text: 'Kira sıçrar', note: 'Kritik risk', step: '17' },
    ])
  })

  it('yalnız temel adımlarını okur', () => {
    const p = buildDemoPlan()
    const seen = new Set<string>()
    const steps = new Proxy(p.steps, {
      get(target, key, receiver) {
        if (typeof key === 'string' && key in STEPS) seen.add(key)
        return Reflect.get(target, key, receiver)
      },
    })
    buildSituation({ ...p, steps })
    expect([...seen].filter((id) => !FOUNDATION_DECISIONS.includes(STEPS[id].decision))).toEqual([])
  })

  it('örnek planda dört liste de doludur', () => {
    const s = buildSituation(buildDemoPlan())
    expect(s.guclu.length).toBeGreaterThan(0)
    expect(s.zayif.length).toBeGreaterThan(0)
    expect(s.firsat.length).toBeGreaterThan(0)
    expect(s.tehdit.length).toBeGreaterThan(0)
  })
})

describe('çapraz sorular', () => {
  it('dört soru vardır ve her sorunun yol kaynağı etiketi vardır', () => {
    expect(CROSS_QUESTIONS.map((q) => q.key)).toEqual(['crossSO', 'crossWO', 'crossST', 'crossWT'])
    for (const q of CROSS_QUESTIONS) expect(ORIGIN_LABEL[q.origin]).toBeTruthy()
  })
  it('yalnız cevaplanan soruları döndürür', () => {
    const p = plan({ '18': { crossSO: 'Deneyimle sabah boşluğunu yakalarız.', crossWT: '  ' } })
    expect(crossAnswers(p)).toEqual([{ label: ORIGIN_LABEL.so, question: CROSS_QUESTIONS[0].label, text: 'Deneyimle sabah boşluğunu yakalarız.' }])
  })
})
