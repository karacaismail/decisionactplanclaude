/**
 * Hedef takibi hiçbir kontrolü, hazırlık ölçütünü ya da teslim raporunu etkilemez.
 * Kural docs/okr-arastirma-raporu.md dosyasının 6.5. bölümündedir.
 * İki tür test vardır:
 * 1. Okuma testi: işlev `plan.okr` alanına hiç dokunmaz.
 * 2. Fark testi: kayıt yokken, doluyken ve bozukken sonuç aynıdır.
 */
import { describe, expect, it } from 'vitest'
import { DECISIONS, STRATEGY } from '@/data/decisions'
import { buildDemoPlan } from '@/data/demo'
import { buildShoeDemoPlan } from '@/data/demoAyakkabi'
import { CLUSTERS, clusterState, type ClusterKey } from '@/data/clusters'
import { EXECUTION_DECISIONS, FOUNDATION_DECISIONS } from '@/data/stages'
import type { Decision, OkrState, PlanDoc, TransitionRecord } from '@/data/types'
import { buildHandoffReport, handoffToMarkdown } from '@/reports/handoff'
import { buildExecutiveReport } from '@/reports/build'
import { blindSpots } from './blindspots'
import { decisionLocked, evaluateGate, gatePassed, lockReason, lockTarget, strategyApproved, strategyDone, strategyReopened } from './gate'
import { planPosition } from './position'
import { evaluateReadiness, transitionPassed } from './readiness'
import { choiceOf, diagnosisOf, movesOf } from './strategy'

const NOW = new Date('2026-11-19T10:00:00.000Z')
const ALL = [...FOUNDATION_DECISIONS, STRATEGY.n, ...EXECUTION_DECISIONS]
const GATES = [...DECISIONS.map((d) => d.gate), STRATEGY.gate]
const CLUSTER_KEYS: ClusterKey[] = ['hazirlik', 'olusturma', 'uygulama']

function decision(gate: number): Decision {
  return { id: `d${gate}`, gate, scope: 'Deneme', criteria: [], suggested: 'ilerle', chosen: 'ilerle', reason: 'Gerekçe', retriesLeft: 1, decidedBy: 'Kurucu', decidedAt: '2026-11-01T00:00:00.000Z', revision: gate }
}
const transition: TransitionRecord = { id: 't1', outcome: 'hazir', suggested: 'hazir', reason: 'Dayanak yeterli.', decidedBy: 'Kurucu', decidedAt: '2026-11-10T00:00:00.000Z', reviewed: true, mandatoryMet: 9, mandatoryTotal: 9, supportingMet: 4, supportingTotal: 7, level: 5, revision: 6 }

/** Örnek plan, strateji oluşturma bitmiş ve uygulama açık. */
function openPlan(base: () => PlanDoc = buildDemoPlan): PlanDoc {
  const p = base()
  const done = (values: Record<string, unknown>) => ({ values, status: 'tamam' as const, updatedAt: '' })
  p.decisions = FOUNDATION_DECISIONS.map(decision)
  p.transitions = [transition]
  p.steps['S21'] = done({ diagnosis: 'Öğleden sonra dükkân boş kalıyor.', diagnosisWhy: 'Satışın çoğu sabah geliyor.' })
  p.steps['S22'] = done({ options: [{ name: 'Durakta satış' }, { name: 'Öğle menüsü' }] })
  p.steps['S23'] = done({ tests: [{ option: 'Durakta satış', mustBeTrue: 'Yolcu durur.', weakest: 'Yolcu beklemez.' }, { option: 'Öğle menüsü', mustBeTrue: 'Çalışan öğlen çıkar.', weakest: 'Fiyat yüksek kalır.' }] })
  p.steps['19'] = done({ chosenPath: 'Durakta satış', choiceReason: 'En güçlü kanıt burada.', winningAim: 'İlk tercih olmak.', playField: 'Durak çevresi.', givenUp: 'Öğle satışı' })
  p.steps['S25'] = done({ moves: [{ move: 'Durağa tezgâh kur', capability: 'Hızlı servis' }] })
  p.steps['20'] = done({ dossier1: 'Profil', dossier2: 'Problem', dossier3: 'Talep', dossier4: 'Yol', dossier5: 'Para', dossier6: 'Varsayım', dossier7: 'Risk', dossier8: 'Durdurma', dossier9: 'Teşhis', dossier11: 'İlk teslim', counterView: 'Yolcu durmayabilir.', qualityCheck: ['a', 'b', 'c', 'd', 'e'], approvedBy: 'Kurucu' })
  return p
}

const FILLED: OkrState = {
  enabled: true,
  changedAt: '2026-11-19T10:00:00.000Z',
  periods: [
    {
      id: 'd1',
      startsAt: '2026-11-01',
      endsAt: '2027-02-01',
      objectives: [{ id: 'h1', title: 'Aylık kartla düzenli müşteri kazanmak', kind: 'zorlu', indicators: [{ id: 'g1', name: 'Ödenen aylık kart sayısı', baseline: 7, target: 30, checkIns: [{ at: '2026-11-10T00:00:00.000Z', value: 14, confidence: 'belki' }] }] }],
      taskLinks: { 'satir-0': 'g1' },
    },
  ],
}
const JUNK = [{ enabled: 'evet', periods: 'bozuk' }, 'açık', 42, [], null] as unknown[]

/** Planın `okr` alanına dokunuldu mu? Plan değişmez. */
function readsOkr(plan: PlanDoc, run: (p: PlanDoc) => unknown): boolean {
  let touched = false
  const proxy = new Proxy(plan, {
    get(target, key, receiver) {
      if (key === 'okr') touched = true
      return Reflect.get(target, key, receiver)
    },
    has(target, key) {
      if (key === 'okr') touched = true
      return Reflect.has(target, key)
    },
    getOwnPropertyDescriptor(target, key) {
      if (key === 'okr') touched = true
      return Reflect.getOwnPropertyDescriptor(target, key)
    },
  })
  run(proxy)
  return touched
}

/** Kontrollerin, kilitlerin, kümelerin ve teslim raporunun bütün sonuçları. */
function everything(p: PlanDoc) {
  return {
    gates: GATES.map((g) => ({ checks: g.criteria.map((c) => c.check(p)), evaluation: evaluateGate(g, p) })),
    passed: ALL.map((n) => gatePassed(p, n)),
    locks: ALL.map((n) => [decisionLocked(p, n), lockTarget(p, n), lockReason(p, n)]),
    readiness: evaluateReadiness(p, { secondReader: 'Ayşe' }),
    transition: transitionPassed(p, NOW),
    strategy: [strategyDone(p), strategyApproved(p), strategyReopened(p), choiceOf(p), diagnosisOf(p), movesOf(p)],
    clusters: CLUSTER_KEYS.map((k) => clusterState(p, k)),
    subStages: CLUSTERS.flatMap((c) => c.subStages.map((s) => s.state(p))),
    blindSpots: blindSpots(p),
    position: planPosition(p),
    handoff: handoffToMarkdown(buildHandoffReport(p, NOW)),
  }
}

describe('hiçbir kural hedef takibi kaydını okumaz', () => {
  const plans: [string, PlanDoc][] = [
    ['kafe örneği', buildDemoPlan()],
    ['ayakkabı örneği', buildShoeDemoPlan()],
    ['uygulaması açık plan', openPlan()],
  ]
  for (const [name, plan] of plans) {
    plan.okr = structuredClone(FILLED)
    it(`${name}: kontroller ve kilitler`, () => {
      for (const g of GATES) expect([g.title, readsOkr(plan, (p) => g.criteria.forEach((c) => c.check(p)))]).toEqual([g.title, false])
      for (const g of GATES) expect([g.title, readsOkr(plan, (p) => evaluateGate(g, p))]).toEqual([g.title, false])
      for (const n of ALL) expect([n, readsOkr(plan, (p) => [gatePassed(p, n), decisionLocked(p, n), lockTarget(p, n), lockReason(p, n)])]).toEqual([n, false])
    })
    it(`${name}: hazırlık ölçütleri ve strateji okuyucuları`, () => {
      expect(readsOkr(plan, (p) => evaluateReadiness(p, { secondReader: 'Ayşe' }))).toBe(false)
      expect(readsOkr(plan, (p) => transitionPassed(p, NOW))).toBe(false)
      expect(readsOkr(plan, (p) => [strategyDone(p), strategyApproved(p), strategyReopened(p), choiceOf(p), diagnosisOf(p), movesOf(p)])).toBe(false)
    })
    it(`${name}: kümeler, bakılmayan alanlar ve plan konumu`, () => {
      expect(readsOkr(plan, (p) => CLUSTER_KEYS.map((k) => clusterState(p, k)))).toBe(false)
      expect(readsOkr(plan, (p) => CLUSTERS.flatMap((c) => c.subStages.map((s) => s.state(p))))).toBe(false)
      expect(readsOkr(plan, (p) => blindSpots(p))).toBe(false)
      expect(readsOkr(plan, (p) => planPosition(p))).toBe(false)
    })
    it(`${name}: teslim raporu ve yönetici raporu`, () => {
      expect(readsOkr(plan, (p) => handoffToMarkdown(buildHandoffReport(p, NOW)))).toBe(false)
      expect(readsOkr(plan, (p) => buildExecutiveReport(p))).toBe(false)
    })
  }
})

describe('hedef takibi kaydı kontrol sonucunu değiştirmez', () => {
  for (const [name, build] of [['kafe örneği', buildDemoPlan], ['ayakkabı örneği', buildShoeDemoPlan], ['uygulaması açık plan', () => openPlan()]] as const) {
    it(`${name}: kayıt yokken, doluyken, kapalıyken ve bozukken sonuç aynıdır`, () => {
      const base = build()
      const expected = JSON.stringify(everything(base))
      const variants: unknown[] = [structuredClone(FILLED), { ...structuredClone(FILLED), enabled: false }, ...JUNK]
      for (const okr of variants) {
        const p = structuredClone(base)
        p.okr = okr as OkrState
        expect([JSON.stringify(okr), JSON.stringify(everything(p))]).toEqual([JSON.stringify(okr), expected])
      }
    })
  }
})
