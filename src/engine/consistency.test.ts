/**
 * Süreç tutarlılığı. Tek bir sıra vardır:
 * Karar 1-5 (temel), geçiş kapısı, strateji çalışması, Karar 6-8 (uygulama).
 * Bu dosya, tanımların, kilitlerin, eskime kuralının ve raporların aynı sırayı kullandığını sınar.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { DECISIONS, STRATEGY, STRATEGY_N } from '@/data/decisions'
import { buildDemoPlan } from '@/data/demo'
import { STEPS, STEP_IDS } from '@/data/registry'
import { EXECUTION_DECISIONS, FOUNDATION_DECISIONS, STAGES } from '@/data/stages'
import { emptyPlan, type Decision, type PlanDoc, type TransitionRecord } from '@/data/types'
import { buildHandoffReport } from '@/reports/handoff'
import { buildActionPlan, buildExecutiveReport } from '@/reports/build'
import { applyStepValues, markStaleAfterGate } from './changes'
import { decisionLocked, gatePassed, lockReason, lockTarget, strategyDone } from './gate'
import { planPosition } from './position'
import { evaluateReadiness, transitionPassed } from './readiness'

/** Süreç sırası. Strateji çalışması (9) Karar 5 ile Karar 6 arasındadır. */
const ORDER = [...FOUNDATION_DECISIONS, STRATEGY_N, ...EXECUTION_DECISIONS]
const GROUPS = [...DECISIONS, STRATEGY]
const orderOf = (n: number) => ORDER.indexOf(n)

function decision(gate: number, patch: Partial<Decision> = {}): Decision {
  return { id: `d${gate}`, gate, scope: 'Deneme', criteria: [], suggested: 'ilerle', chosen: 'ilerle', reason: 'Gerekçe', retriesLeft: 1, decidedBy: 'Kurucu', decidedAt: '2026-11-01T00:00:00.000Z', revision: gate, ...patch }
}
function transition(patch: Partial<TransitionRecord> = {}): TransitionRecord {
  return { id: 't1', outcome: 'hazir', suggested: 'hazir', reason: 'Dayanak yeterli.', decidedBy: 'Kurucu', decidedAt: '2026-11-10T00:00:00.000Z', reviewed: true, mandatoryMet: 9, mandatoryTotal: 9, supportingMet: 4, supportingTotal: 7, level: 5, revision: 6, ...patch }
}
function finishStrategy(p: PlanDoc) {
  p.steps['19'] = { values: { chosenPath: 'Durakta satış', choiceReason: 'En güçlü kanıt burada.', givenUp: 'Öğle satışı' }, status: 'tamam', updatedAt: '' }
  p.steps['20'] = { values: { qualityCheck: ['a', 'b', 'c', 'd', 'e'] }, status: 'tamam', updatedAt: '' }
}

/** Bir işlevin okuduğu adımları kaydeder. Plan değişmez. */
function stepsRead(plan: PlanDoc, run: (p: PlanDoc) => unknown): Set<string> {
  const seen = new Set<string>()
  const steps = new Proxy(plan.steps, {
    get(target, key, receiver) {
      if (typeof key === 'string' && key in STEPS) seen.add(key)
      return Reflect.get(target, key, receiver)
    },
  })
  run({ ...plan, steps })
  return seen
}

describe('adımlar ve gruplar', () => {
  it('35 adım vardır ve her adım tek bir gruba bağlıdır', () => {
    expect(STEP_IDS).toHaveLength(35)
    for (const id of STEP_IDS) {
      const owners = GROUPS.filter((g) => g.steps.includes(id))
      expect(owners.map((g) => g.n), `Adım ${id}`).toEqual([STEPS[id].decision])
    }
  })
  it('grupların listelediği her adım tanımlıdır', () => {
    for (const g of GROUPS) for (const id of g.steps) expect(STEPS[id], `Grup ${g.n}, Adım ${id}`).toBeDefined()
  })
  it('adım numaraları süreç sırasıyla artar', () => {
    const flat = ORDER.flatMap((n) => GROUPS.find((g) => g.n === n)!.steps)
    expect(flat).toEqual([...flat].sort())
    expect(flat).toEqual([...STEP_IDS].sort())
  })
  it('temel 00-18, strateji çalışması 19-20, uygulama 21-34 adımlarını taşır', () => {
    const ids = (ns: number[]) => ns.flatMap((n) => GROUPS.find((g) => g.n === n)!.steps)
    expect(ids(FOUNDATION_DECISIONS).at(0)).toBe('00')
    expect(ids(FOUNDATION_DECISIONS).at(-1)).toBe('18')
    expect(ids([STRATEGY_N])).toEqual(['19', '20'])
    expect(ids(EXECUTION_DECISIONS).at(0)).toBe('21')
    expect(ids(EXECUTION_DECISIONS).at(-1)).toBe('34')
  })
  it('aşamalar süreç sırasını ve bütün kararları taşır', () => {
    expect(STAGES.map((s) => s.key)).toEqual(['temel', 'gecis', 'strateji', 'uygulama'])
    expect(STAGES.flatMap((s) => s.decisions)).toEqual(ORDER)
  })
})

describe('kapılar yalnız kendi adımlarını ve önceki adımları okur', () => {
  const plans = [emptyPlan('p', 'Boş'), buildDemoPlan()]
  for (const g of GROUPS) {
    it(`${g.n === STRATEGY_N ? 'Strateji çalışması' : `Kapı ${g.n}`}`, () => {
      for (const plan of plans) {
        const filledPlan = structuredClone(plan)
        for (const id of STEP_IDS) filledPlan.steps[id] ??= { values: {}, status: 'taslak', updatedAt: '' }
        for (const p of [plan, filledPlan]) {
          const read = stepsRead(p, (x) => g.gate.criteria.forEach((c) => c.check(x)))
          const later = [...read].filter((id) => orderOf(STEPS[id].decision) > orderOf(g.n))
          expect(later).toEqual([])
        }
      }
    })
  }
})

describe('geçiş kapısı ve devir raporu yalnız temel adımlarını okur', () => {
  const demo = buildDemoPlan()
  finishStrategy(demo)
  const isFoundation = (id: string) => FOUNDATION_DECISIONS.includes(STEPS[id].decision)
  it('hazırlık ölçütleri Adım 19 ve sonrasını okumaz', () => {
    const read = stepsRead(demo, (p) => evaluateReadiness(p, { secondReader: 'Ayşe' }))
    expect([...read].filter((id) => !isFoundation(id))).toEqual([])
  })
  it('devir raporu seçimi okumaz, yol seçmez', () => {
    const read = stepsRead(demo, (p) => buildHandoffReport(p))
    expect([...read].filter((id) => !isFoundation(id))).toEqual([])
    expect(JSON.stringify(buildHandoffReport(demo))).not.toContain('En güçlü kanıt burada.')
  })
  it('hazırlık ölçütlerinin gösterdiği adımlar temel adımlarıdır', () => {
    const r = evaluateReadiness(demo, { secondReader: 'Ayşe' })
    for (const c of [...r.mandatory, ...r.supporting]) {
      if (c.step in STEPS) expect([c.id, isFoundation(c.step)]).toEqual([c.id, true])
    }
    expect(r.mandatory).toHaveLength(9)
    expect(r.supporting).toHaveLength(7)
  })
})

describe('isteğe bağlı kayıtlar geçiş kapısını değiştirmez', () => {
  it('asıl engel, başarı koşulu, yol bağı, güç ve taahhüt silinince öneri aynı kalır', () => {
    const full = buildDemoPlan()
    const bare = buildDemoPlan()
    for (const key of ['crux', 'cruxWhy', 'cruxPaths', 'cruxAlt', 'cruxSplit', 'cruxEvidence', 'cruxCounter', 'successConditions', 'pathLinks', 'crossSO', 'crossWO', 'crossST', 'crossWT']) delete bare.steps['18'].values[key]
    for (const key of ['commitmentsKnown', 'spentKurus', 'commitments']) delete bare.steps['16'].values[key]
    for (const key of ['strengths', 'bottleneck', 'bottleneckLimit', 'bottleneckAlt']) delete bare.steps['12'].values[key]
    const a = evaluateReadiness(full, { secondReader: 'Ayşe' })
    const b = evaluateReadiness(bare, { secondReader: 'Ayşe' })
    expect(a.suggested).toBe(b.suggested)
    expect(a.mandatory.map((c) => c.met)).toEqual(b.mandatory.map((c) => c.met))
    expect(a.supporting.map((c) => c.met)).toEqual(b.supporting.map((c) => c.met))
    for (const n of FOUNDATION_DECISIONS) {
      const gate = DECISIONS.find((d) => d.n === n)!.gate
      expect(gate.criteria.map((c) => c.check(full))).toEqual(gate.criteria.map((c) => c.check(bare)))
    }
  })
})

describe('raporlar seçimi strateji çalışmasından okur', () => {
  it('seçilen yol Adım 19\'dan gelir, Adım 18\'deki eski alan kullanılmaz', () => {
    const p = buildDemoPlan()
    finishStrategy(p)
    p.steps['18'].values = { ...p.steps['18'].values, chosenPath: 'ESKI-ALAN' }
    const all = JSON.stringify([buildExecutiveReport(p), buildActionPlan(p)])
    expect(all).toContain('Durakta satış')
    expect(all).not.toContain('ESKI-ALAN')
  })
})

describe('kilit zinciri tek sırayı izler', () => {
  const targets = (p: PlanDoc) => ORDER.map((n) => lockTarget(p, n))
  it('boş planda yalnız Karar 1 açıktır', () => {
    const p = emptyPlan('p', 'Plan')
    expect(ORDER.filter((n) => !decisionLocked(p, n))).toEqual([1])
    expect(planPosition(p)).toMatchObject({ stage: 'temel', decision: 1 })
  })
  it('beş temel kapısından sonra sıradaki iş geçiş kapısıdır', () => {
    const p = emptyPlan('p', 'Plan')
    p.decisions = FOUNDATION_DECISIONS.map((n) => decision(n))
    expect(targets(p)).toEqual([null, null, null, null, null, 'gecis', 'gecis', 'gecis', 'gecis'])
    expect(planPosition(p).stage).toBe('gecis')
  })
  it('geçiş kararından sonra strateji çalışması açılır, uygulama kilitli kalır', () => {
    const p = emptyPlan('p', 'Plan')
    p.decisions = FOUNDATION_DECISIONS.map((n) => decision(n))
    p.transitions = [transition()]
    expect(targets(p)).toEqual([null, null, null, null, null, null, 'strateji', 'strateji', 'strateji'])
    expect(lockReason(p, 6)).toContain('Adım 19')
    expect(planPosition(p).stage).toBe('strateji')
  })
  it('strateji çalışması bitince Karar 6 açılır, Karar 7 Kapı 6\'yı bekler', () => {
    const p = emptyPlan('p', 'Plan')
    p.decisions = FOUNDATION_DECISIONS.map((n) => decision(n))
    p.transitions = [transition()]
    finishStrategy(p)
    expect(strategyDone(p)).toBe(true)
    expect(targets(p)).toEqual([null, null, null, null, null, null, null, 'kapi', 'kapi'])
    expect(planPosition(p)).toMatchObject({ stage: 'uygulama', decision: 6, strategyComplete: true })
    p.decisions.push(decision(6), decision(7), decision(8))
    expect(ORDER.filter((n) => decisionLocked(p, n))).toEqual([])
    expect(planPosition(p).stage).toBe('bitti')
  })
  it('geçiş kararı düşünce strateji çalışması ve bütün uygulama kilitlenir', () => {
    const p = emptyPlan('p', 'Plan')
    p.decisions = [...FOUNDATION_DECISIONS, ...EXECUTION_DECISIONS].map((n) => decision(n))
    p.transitions = [transition({ outcome: 'kosullu', conditional: { topic: 'Kapsam', openQuestion: 'Soru', owner: 'Kurucu', deadline: '2026-01-01' } })]
    finishStrategy(p)
    expect(transitionPassed(p, new Date('2026-11-14'))).toBe(false)
    expect(targets(p).slice(5)).toEqual(['gecis', 'gecis', 'gecis', 'gecis'])
  })
  it('kilit kuralı ile geçiş kuralı aynı sonucu verir', () => {
    const cases: TransitionRecord[][] = [[], [transition()], [transition({ outcome: 'degil' })], [transition({ stale: true })], [transition({ outcome: 'kosullu' })]]
    for (const list of cases) {
      const p = emptyPlan('p', 'Plan')
      p.transitions = list
      expect(decisionLocked(p, STRATEGY_N)).toBe(!transitionPassed(p))
    }
  })
})

describe('eskime kuralı süreç sırasını izler', () => {
  function fullPlan(): PlanDoc {
    const p = emptyPlan('p', 'Plan')
    p.decisions = [...FOUNDATION_DECISIONS, ...EXECUTION_DECISIONS].map((n) => decision(n))
    p.transitions = [transition()]
    finishStrategy(p)
    return p
  }
  it('seçim (Adım 19) değişince Kapı 6, 7 ve 8 eskir, geçiş kararı ve temel eskimez', () => {
    const p = fullPlan()
    applyStepValues(p, '19', { chosenPath: 'Ön sipariş' })
    expect(EXECUTION_DECISIONS.map((n) => gatePassed(p, n))).toEqual([false, false, false])
    expect(FOUNDATION_DECISIONS.every((n) => gatePassed(p, n))).toBe(true)
    expect(transitionPassed(p)).toBe(true)
  })
  it('yol adayları (Adım 18) değişince Kapı 5, geçiş kararı ve uygulama eskir', () => {
    const p = fullPlan()
    p.steps['18'] = { values: { counterMove: 'a' }, status: 'tamam', updatedAt: '' }
    applyStepValues(p, '18', { counterMove: 'b' })
    expect(gatePassed(p, 4)).toBe(true)
    expect(gatePassed(p, 5)).toBe(false)
    expect(transitionPassed(p)).toBe(false)
    expect(EXECUTION_DECISIONS.some((n) => gatePassed(p, n))).toBe(false)
  })
  it('bir temel kapısı yeniden karara bağlanınca geçiş kararı da eskir', () => {
    const p = fullPlan()
    markStaleAfterGate(p, 5)
    expect(gatePassed(p, 5)).toBe(true)
    expect(transitionPassed(p)).toBe(false)
    expect(gatePassed(p, 6)).toBe(false)
  })
  it('bir uygulama kapısı yeniden karara bağlanınca geçiş kararı eskimez', () => {
    const p = fullPlan()
    markStaleAfterGate(p, 6)
    expect(transitionPassed(p)).toBe(true)
    expect(gatePassed(p, 6)).toBe(true)
    expect(gatePassed(p, 7)).toBe(false)
  })
})

describe('metinler eski süreci anlatmaz', () => {
  const root = join(__dirname, '..', '..')
  function files(dir: string, exts: string[]): string[] {
    return readdirSync(dir).flatMap((name) => {
      const full = join(dir, name)
      if (statSync(full).isDirectory()) return files(full, exts)
      return exts.some((e) => name.endsWith(e)) && !name.endsWith('.test.ts') ? [full] : []
    })
  }
  /* Güncel süreci anlatan dosyalar. Tarihsel plan belgeleri güncellik notu taşır ve taranmaz. */
  const current = [...files(join(root, 'src'), ['.ts', '.tsx']), join(root, 'README.md'), join(root, 'docs', 'surec-haritasi.md'), join(root, 'docs', 'alan-sozlesmesi.md')]
  const stale: [RegExp, string][] = [
    [/6 destekleyici/, 'Destekleyici ölçüt sayısı 7\'dir.'],
    [/Adım 18, 19 ve 20/, 'Strateji çalışması Adım 19 ve 20\'dir. Adım 18 Karar 5\'tedir.'],
    [/Saha ve kazanma yolu/, 'Adım 18\'in adı "Yol adayları"dır.'],
    [/[Tt]emel belgesinde yazar|temel belgesindeki kanıt/, 'Belgenin adı "Strateje devir raporu"dur.'],
    [/stratejist/i, 'Unvan "stratej"dir.'],
    [/dayanakları inceledim/i, 'Kutu metni "Strateje devir raporunu okudum"dur.'],
  ]
  it('güncel dosyalarda eski ifade yoktur', () => {
    const hits: string[] = []
    for (const file of current) {
      /* Süreç haritasının 8. bölümü eski adları bilerek anar. O bölüm taranmaz. */
      const text = readFileSync(file, 'utf8').replace(/## 8\. Kaynak plandan farklar[\s\S]*?(?=\n## )/, '')
      for (const [re, why] of stale) if (re.test(text)) hits.push(`${file.replace(root, '')}: ${why}`)
    }
    expect(hits).toEqual([])
  })
  it('süreç haritasındaki karar tablosu tanımlarla aynıdır', () => {
    const map = readFileSync(join(root, 'docs', 'surec-haritasi.md'), 'utf8')
    for (const n of FOUNDATION_DECISIONS) {
      const d = DECISIONS.find((x) => x.n === n)!
      expect(map).toContain(`| Karar ${n} | ${d.title} | ${d.steps.join(', ')} |`)
    }
    expect(map).toContain(`| 3 | ${STRATEGY.title} | Adım 19 ve Adım 20 |`)
    expect(map).toContain('Destekleyici ölçüt sayısı 7')
  })
  it('tarihsel plan belgeleri güncellik notu taşır', () => {
    for (const name of ['stratejik-planlama-oncesi-bosluk-ve-eylem-plani.md', 'uygulama-plani-on-yuz.md', 'strateje-devir-uygulama-plani.md']) {
      expect([name, readFileSync(join(root, 'docs', name), 'utf8').includes('Güncellik notu')]).toEqual([name, true])
    }
  })
})
