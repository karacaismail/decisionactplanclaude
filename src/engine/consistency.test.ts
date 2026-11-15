/**
 * Süreç tutarlılığı. Tek bir sıra vardır:
 * Karar 1-5 (temel), geçiş kapısı, strateji oluşturma, Karar 6-8 (uygulama).
 * Bu dosya, tanımların, kilitlerin, eskime kuralının ve raporların aynı sırayı kullandığını sınar.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { DECISIONS, STRATEGY, STRATEGY_N } from '@/data/decisions'
import { buildDemoPlan } from '@/data/demo'
import { STEPS, STEP_IDS, stepHeading } from '@/data/registry'
import { subStageOfStep } from '@/data/clusters'
import { EXECUTION_DECISIONS, FOUNDATION_DECISIONS, STAGES } from '@/data/stages'
import { emptyPlan, type Decision, type PlanDoc, type TransitionRecord } from '@/data/types'
import { buildHandoffReport } from '@/reports/handoff'
import { buildActionPlan, buildExecutiveReport } from '@/reports/build'
import { applyStepValues, markStaleAfterGate } from './changes'
import { decisionLocked, evaluateGate, gatePassed, lockReason, lockTarget, strategyDone } from './gate'
import { requiredKeys, sectionStats } from '@/components/FormRenderer'
import decisionsSrc from '@/data/decisions.ts?raw'
import transitionSrc from './transition.ts?raw'
import readinessSrc from './readiness.ts?raw'
import strengthsSrc from './strengths.ts?raw'
import integritySrc from './integrity.ts?raw'
import { planPosition } from './position'
import { evaluateReadiness, transitionPassed } from './readiness'

/** Süreç sırası. Strateji oluşturma (9) Karar 5 ile Karar 6 arasındadır. */
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
  const done = (values: Record<string, unknown>) => ({ values, status: 'tamam' as const, updatedAt: '' })
  p.steps['S21'] = done({ diagnosis: 'Öğleden sonra dükkân boş kalıyor.', diagnosisWhy: 'Satışın yüzde 80\'i sabah geliyor.' })
  p.steps['S22'] = done({ options: [{ name: 'Durakta satış' }, { name: 'Öğle menüsü' }] })
  p.steps['S23'] = done({ tests: [{ option: 'Durakta satış', mustBeTrue: 'Sabah yolcusu durur.', weakest: 'Yolcu beklemez.' }, { option: 'Öğle menüsü', mustBeTrue: 'Çalışan öğlen çıkar.', weakest: 'Fiyat yüksek kalır.' }] })
  p.steps['19'] = done({ chosenPath: 'Durakta satış', choiceReason: 'En güçlü kanıt burada.', givenUp: 'Öğle satışı' })
  p.steps['S25'] = done({ moves: [{ move: 'Durağa tezgâh kur', capability: 'Hızlı servis' }] })
  p.steps['20'] = done({ dossier1: 'Profil', dossier2: 'Problem', dossier3: 'Talep', dossier4: 'Yol', dossier5: 'Para', dossier6: 'Varsayım', dossier7: 'Risk', dossier8: 'Durdurma', dossier9: 'Teşhis', dossier11: 'İlk teslim', counterView: 'Yolcu durmayabilir.', qualityCheck: ['a', 'b', 'c', 'd', 'e'], approvedBy: 'Kurucu' })
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
  it('42 adım vardır ve her adım tek bir gruba bağlıdır', () => {
    expect(STEP_IDS).toHaveLength(42)
    for (const id of STEP_IDS) {
      const owners = GROUPS.filter((g) => g.steps.includes(id))
      expect(owners.map((g) => g.n), `Adım ${id}`).toEqual([STEPS[id].decision])
    }
  })
  it('grupların listelediği her adım tanımlıdır', () => {
    for (const g of GROUPS) for (const id of g.steps) expect(STEPS[id], `Grup ${g.n}, Adım ${id}`).toBeDefined()
  })
  it('adım listesi süreç sırasıyla dizilir', () => {
    const flat = ORDER.flatMap((n) => GROUPS.find((g) => g.n === n)!.steps)
    expect(flat).toEqual(STEP_IDS)
    /* Numaralı adımlar kendi içinde artan sıradadır. */
    const numbered = STEP_IDS.filter((id) => /^\d+$/.test(id))
    expect(numbered).toEqual([...numbered].sort())
    expect(numbered).toHaveLength(35)
  })
  it('strateji öncesi 00-18, strateji oluşturma altı adım, strateji uygulama 3.1 ile başlar', () => {
    const ids = (ns: number[]) => ns.flatMap((n) => GROUPS.find((g) => g.n === n)!.steps)
    expect(ids(FOUNDATION_DECISIONS).at(0)).toBe('00')
    expect(ids(FOUNDATION_DECISIONS).at(-1)).toBe('18')
    expect(ids([STRATEGY_N])).toEqual(['S21', 'S22', 'S23', '19', 'S25', '20'])
    expect(ids(EXECUTION_DECISIONS).slice(0, 4)).toEqual(['U31', 'U32', 'U33', '21'])
    expect(ids(EXECUTION_DECISIONS).at(-1)).toBe('34')
  })
  it('kodu olan her adım bir alt aşamaya ya da çıkış kapısına bağlıdır', () => {
    const coded = STEP_IDS.filter((id) => STEPS[id].code)
    expect(coded).toEqual(['S21', 'S22', 'S23', '19', 'S25', '20', 'U31', 'U32', 'U33'])
    expect(coded.map((id) => STEPS[id].code)).toEqual(['2.1', '2.2', '2.3', '2.4', '2.5', 'Çıkış kapısı', '3.1', '3.2', '3.3'])
    for (const id of coded) if (STEPS[id].code !== 'Çıkış kapısı') expect([id, subStageOfStep(id)?.code]).toEqual([id, STEPS[id].code])
    expect(stepHeading('S21')).toBe('2.1. Teşhis')
    expect(stepHeading('12')).toBe('Adım 12. Yapabilirlik ve kaynak')
  })
  it('aşamalar süreç sırasını ve bütün kararları taşır', () => {
    expect(STAGES.map((s) => s.key)).toEqual(['temel', 'gecis', 'strateji', 'uygulama'])
    expect(STAGES.flatMap((s) => s.decisions)).toEqual(ORDER)
  })
})

describe('kapılar yalnız kendi adımlarını ve önceki adımları okur', () => {
  const plans = [emptyPlan('p', 'Boş'), buildDemoPlan()]
  for (const g of GROUPS) {
    it(`${g.n === STRATEGY_N ? 'Strateji oluşturma' : `Kapı ${g.n}`}`, () => {
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
    delete bare.steps['09'].values.failedAttempts
    delete bare.steps['17'].values.dependencies
    delete bare.steps['17'].values.dependencyNote
    delete bare.steps['02'].values.horizon
    for (const key of ['worstCase', 'stakeholders']) delete bare.steps['17'].values[key]
    for (const key of ['uncertainty1Level', 'uncertainty2Level']) delete bare.steps['04'].values[key]
    bare.steps['18'].values.paths = (bare.steps['18'].values.paths as Record<string, unknown>[]).map(({ revenue: _r, vehicle: _v, evidenceIds: _e, ...rest }) => rest)
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

describe('kısa yol hiçbir temel kapısını kör bırakmaz', () => {
  const visible = (id: string) => STEPS[id].shortPath
  for (const n of FOUNDATION_DECISIONS) {
    it(`Kapı ${n} kısa yolda gizli bir adımı okumaz`, () => {
      const p = buildDemoPlan()
      p.shortPath = true
      const gate = DECISIONS.find((d) => d.n === n)!.gate
      const read = stepsRead(p, (x) => gate.criteria.forEach((c) => c.check(x)))
      expect([...read].filter((id) => !visible(id))).toEqual([])
    })
  }
  it('strateji oluşturma ve uygulama kapıları da kısa yolda gizli bir adımı okumaz', () => {
    const p = buildDemoPlan()
    p.shortPath = true
    for (const g of [STRATEGY, ...DECISIONS.filter((d) => EXECUTION_DECISIONS.includes(d.n))]) {
      const read = stepsRead(p, (x) => g.gate.criteria.forEach((c) => c.check(x)))
      expect([g.n, [...read].filter((id) => !visible(id))]).toEqual([g.n, []])
    }
  })
  it('ekipte Kapı 1 kısa yolda gizli bir adımı okumaz', () => {
    const p = buildDemoPlan()
    p.shortPath = true
    p.profile.team = 'ekip'
    const gate = DECISIONS.find((d) => d.n === 1)!.gate
    const read = stepsRead(p, (x) => gate.criteria.forEach((c) => c.check(x)))
    expect(read.has('03')).toBe(true)
    expect([...read].filter((id) => !visible(id))).toEqual([])
  })
  it('kısa yolda örnek plan beş temel kapıda "İlerle" önerisi alır', () => {
    const p = buildDemoPlan()
    p.shortPath = true
    for (const n of FOUNDATION_DECISIONS) {
      const gate = DECISIONS.find((d) => d.n === n)!.gate
      expect([n, evaluateGate(gate, p).suggested]).toEqual([n, 'ilerle'])
    }
  })
  it('kısa yolda Adım 17 üç bölüm gösterir ve gizli bölümün alanını istemez', () => {
    const p = buildDemoPlan()
    p.shortPath = true
    const step = STEPS['17']
    const values = p.steps['17'].values
    expect(sectionStats(step, p, values).map((s) => s.title)).toEqual(['Ön ölüm listesi', 'Risk tablosu', 'Tek kaynağa bağımlılık'])
    expect(requiredKeys(step, p, values)).toEqual(['premortem', 'risks'])
    p.shortPath = false
    expect(sectionStats(step, p, values).length).toBeGreaterThan(3)
  })
})

describe('isteğe bağlı bölüm hiçbir kuralın istediği alanı taşımaz', () => {
  /* Kapılar, geçiş kapısı, hazırlık ölçütleri ve adım tamamlama denetimleri. */
  const rules = [decisionsSrc, transitionSrc, readinessSrc, strengthsSrc, integritySrc].join('\n')
  const real = (sec: { fields: { key: string; type: string }[] }) => sec.fields.filter((f) => f.type !== 'info' && f.type !== 'calc')
  const foundation = STEP_IDS.filter((id) => FOUNDATION_DECISIONS.includes(STEPS[id].decision))

  it('adımı tamamlayan alan isteğe bağlı bölümde durmaz', () => {
    const wrong: string[] = []
    for (const id of foundation) {
      const must = new Set(STEPS[id].completeWhen ?? [])
      for (const sec of STEPS[id].sections) if (sec.optional) for (const f of real(sec)) if (must.has(f.key)) wrong.push(`${id}.${f.key}`)
    }
    expect(wrong).toEqual([])
  })

  it('kapının ya da geçiş kapısının okuduğu alan isteğe bağlı bölümde durmaz', () => {
    const wrong: string[] = []
    for (const id of foundation) {
      for (const sec of STEPS[id].sections) {
        if (!sec.optional) continue
        for (const f of real(sec)) if (new RegExp(`['.]${f.key}\\b`).test(rules)) wrong.push(`${id}.${f.key}`)
      }
    }
    expect(wrong).toEqual([])
  })

  it('zorunlu alanı olmayan ve hiçbir kuralın okumadığı bölüm isteğe bağlıdır', () => {
    /* Bu bölümler kurala girmez ama açık durur. Biri yalnız yol gösterir, biri ikinci tarafın görüşmesini, biri hesabın sonucunu taşır. */
    const keepOpen = ['06 Kaç görüşme?', '06 Alan taraf defteri', '16 Başabaş sayısı']
    const wrong: string[] = []
    for (const id of foundation) {
      const must = new Set(STEPS[id].completeWhen ?? [])
      for (const sec of STEPS[id].sections) {
        const fields = real(sec)
        const needed = fields.some((f) => must.has(f.key) || new RegExp(`['.]${f.key}\\b`).test(rules))
        const name = `${id} ${sec.title ?? 'Sorular'}`
        if (!needed && !sec.optional && !keepOpen.includes(name)) wrong.push(name)
      }
    }
    expect(wrong).toEqual([])
  })

  /*
   * Alan bütçesi. Kapsam kaymasına karşı kapıdır.
   * Yeni alan eklemek bu testi kırar. Bütçeyi yükseltme kararını karar sahibi verir.
   * Gerekçe docs/strateji-tanimi-bosluk-ve-bilinmeyen-analizi.md dosyasının 10.3. bölümündedir.
   */
  it('strateji öncesi alan sayısı bütçeyi aşmaz', () => {
    let all = 0
    let open = 0
    for (const id of foundation) {
      for (const sec of STEPS[id].sections) {
        all += real(sec).length
        if (!sec.optional) open += real(sec).length
      }
    }
    expect(all).toBeLessThanOrEqual(240)
    expect(open).toBeLessThanOrEqual(149)
  })

  it('her temel adımında en az bir zorunlu bölüm kalır', () => {
    for (const id of foundation) expect([id, STEPS[id].sections.some((sec) => !sec.optional)]).toEqual([id, true])
  })
})

describe('raporlar seçimi strateji oluşturmadan okur', () => {
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
  it('geçiş kararından sonra strateji oluşturma açılır, uygulama kilitli kalır', () => {
    const p = emptyPlan('p', 'Plan')
    p.decisions = FOUNDATION_DECISIONS.map((n) => decision(n))
    p.transitions = [transition()]
    expect(targets(p)).toEqual([null, null, null, null, null, null, 'strateji', 'strateji', 'strateji'])
    expect(lockReason(p, 6)).toContain('Beş alt aşama')
    expect(planPosition(p).stage).toBe('strateji')
  })
  it('strateji oluşturma bitince Karar 6 açılır, Karar 7 Kapı 6\'yı bekler', () => {
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
  it('geçiş kararı düşünce strateji oluşturma ve bütün uygulama kilitlenir', () => {
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
    [/Adım 18, 19 ve 20/, 'Strateji oluşturma Adım 19 ve 20\'dir. Adım 18 Karar 5\'tedir.'],
    [/Saha ve kazanma yolu/, 'Adım 18\'in adı "Yol adayları"dır.'],
    [/[Tt]emel belgesinde yazar|temel belgesindeki kanıt/, 'Belgenin adı "Strateje devir raporu"dur.'],
    [/stratejist/i, 'Unvan "stratej"dir.'],
    [/Seçimi stratej yapar|Kararı stratej verir|Seçim stratej.{1,2}in işidir|aralarından seçer|adaylar arasından seçer|Yolu stratej seçer/, 'Stratej önerir. Seçimi karar sahibi yapar.'],
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
    expect(map).toContain(`| 2 | ${STRATEGY.title} | 2.1, 2.2, 2.3, 2.4 ve 2.5 |`)
    expect(map).toContain('| 3 | Strateji uygulama | 3.1, 3.2, 3.3, 3.4 ve 3.5 |')
    expect(map).toContain('Stratej yolu önerir ve gerekçesini kurar. Karar sahibi seçer ve kaydeder.')
    expect(map).toContain('Destekleyici ölçüt sayısı 7')
  })
  it('tarihsel plan belgeleri güncellik notu taşır', () => {
    for (const name of ['stratejik-planlama-oncesi-bosluk-ve-eylem-plani.md', 'uygulama-plani-on-yuz.md', 'strateje-devir-uygulama-plani.md']) {
      expect([name, readFileSync(join(root, 'docs', name), 'utf8').includes('Güncellik notu')]).toEqual([name, true])
    }
  })
})
