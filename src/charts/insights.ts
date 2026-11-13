/**
 * Göstergeler ekranının veri katmanı. Plan belgesinden grafik seçeneği ve tablo üretir.
 * Renkler ekrandan gelir. Alan adları docs/alan-sozlesmesi.md ile aynıdır.
 */
import { DECISIONS } from '@/data/decisions'
import { stepsOf } from '@/data/registry'
import { OUTCOME_LABEL, type Measure, type Outcome, type PlanDoc } from '@/data/types'
import { stepApplies } from '@/engine/conditions'
import { effectiveOutcome } from '@/engine/gate'
import { formatDate, formatMoney, formatNumber } from '@/engine/format'
import { LADDER } from '@/components/EvidenceLadderPicker'

export interface InsightPalette {
  primary: string
  info: string
  success: string
  warning: string
  error: string
  /** Soluk yardımcı renk. "Kalan" gibi ikincil seriler için. */
  muted: string
  outcome: (o: Outcome) => string
}

export interface ChartTable {
  head: string[]
  rows: (string | number)[][]
}

interface InsightBase {
  id: string
  title: string
  /** Sayıların hangi adımdan geldiğini söyler. */
  source: string
}

export interface InsightChart extends InsightBase {
  empty: false
  summary?: string
  option: unknown
  table: ChartTable
}

export interface InsightEmpty extends InsightBase {
  empty: true
  /** Ölçüm için hangi adım doldurulur? */
  hint: string
}

export type Insight = InsightChart | InsightEmpty

export interface SummaryTile {
  key: string
  title: string
  value: string
  note: string
}

type Row = Record<string, unknown>

const v = (p: PlanDoc, step: string, key: string): unknown => p.steps[step]?.values?.[key]
const rows = (p: PlanDoc, step: string, key: string): Row[] => {
  const x = v(p, step, key)
  return Array.isArray(x) ? (x as Row[]) : []
}
const num = (x: unknown): number | null => (typeof x === 'number' && !Number.isNaN(x) ? x : null)
const lira = (kurus: number): number => Math.round(kurus) / 100

const GRID = { left: 12, right: 16, top: 36, bottom: 8, containLabel: true }

/** Dört özet kutusu. Pist, ödeme günü açığı, bütçe kullanımı ve deneme hakkı. */
export function summaryTiles(plan: PlanDoc): SummaryTile[] {
  const { cashKurus, monthlyBurnKurus, budgetKurus, retriesPerDecision } = plan.limits

  const runway: SummaryTile = cashKurus && monthlyBurnKurus
    ? { key: 'pist', title: 'Pist', value: `${Math.floor(cashKurus / monthlyBurnKurus)} ay`, note: `Elinizde ${formatMoney(cashKurus)} var. Aylık gider ${formatMoney(monthlyBurnKurus)}.` }
    : { key: 'pist', title: 'Pist', value: 'Hesaplanmadı', note: 'Adım 02’de elinizdeki parayı ve aylık gideri yazın.' }

  const days = rows(plan, '16', 'paymentDays').filter((r) => num(r.balanceAfterKurus) !== null)
  let gap: SummaryTile
  if (days.length === 0) {
    gap = { key: 'acik', title: 'Ödeme günü açığı', value: 'Ölçüm bekleniyor', note: 'Adım 16’da ödeme günlerini yazın.' }
  } else {
    const minRow = days.reduce((a, b) => (Number(a.balanceAfterKurus) <= Number(b.balanceAfterKurus) ? a : b))
    const minBal = Number(minRow.balanceAfterKurus)
    gap = minBal < 0
      ? { key: 'acik', title: 'Ödeme günü açığı', value: formatMoney(-minBal), note: `Kasa ${formatDate(String(minRow.date), false)} günü eksiye düşüyor.` }
      : { key: 'acik', title: 'Ödeme günü açığı', value: 'Açık yok', note: `En düşük kasa ${formatMoney(minBal)}.` }
  }

  const spent = rows(plan, '24', 'results').reduce((s, r) => s + (num(r.costKurus) ?? 0), 0)
  let budget: SummaryTile
  if (!budgetKurus) budget = { key: 'butce', title: 'Bütçe kullanımı', value: 'Yazılmadı', note: 'Adım 02’de plana ayrılan en çok parayı yazın.' }
  else if (spent === 0) budget = { key: 'butce', title: 'Bütçe kullanımı', value: 'Harcama yazılmadı', note: `Sınır ${formatMoney(budgetKurus)}. Harcamalar Adım 24’te kayda geçer.` }
  else budget = { key: 'butce', title: 'Bütçe kullanımı', value: `%${Math.round((spent / budgetKurus) * 100)}`, note: `Sınır ${formatMoney(budgetKurus)}. Kanal testlerine ${formatMoney(spent)} harcandı.` }

  const used = plan.decisions.filter((d) => d.chosen === 'yenidenDene').length
  const retries: SummaryTile = retriesPerDecision
    ? { key: 'deneme', title: 'Deneme hakkı', value: `${retriesPerDecision} / karar`, note: used === 0 ? 'Henüz deneme hakkı kullanılmadı.' : `${used} deneme kullanıldı.` }
    : { key: 'deneme', title: 'Deneme hakkı', value: 'Yazılmadı', note: 'Adım 02’de karar başına deneme sayısını yazın.' }

  return [runway, gap, budget, retries]
}

/** Yedi gösterge. Veri yoksa gösterge boş durumla döner. */
export function buildInsights(plan: PlanDoc, c: InsightPalette): Insight[] {
  return [stepsPerDecision(plan, c), ladderDistribution(plan, c), offerFunnel(plan, c), measureVsThreshold(plan, c), cashAndSpend(plan, c), gateTimeline(plan, c), interviewSignals(plan, c)]
}

function stepsPerDecision(plan: PlanDoc, c: InsightPalette): Insight {
  const items = DECISIONS.map((d) => {
    const steps = stepsOf(d.n).filter((s) => stepApplies(s.mandatory, plan) !== 'gizli' && (!plan.shortPath || s.shortPath))
    const done = steps.filter((s) => plan.steps[s.id]?.status === 'tamam' || plan.steps[s.id]?.status === 'atlandi').length
    return { label: `${d.n}. ${d.title}`, done, total: steps.length }
  })
  const doneTotal = items.reduce((s, i) => s + i.done, 0)
  const total = items.reduce((s, i) => s + i.total, 0)
  return {
    id: 'adimlar',
    title: 'Karar başına tamamlanan adım',
    source: 'Sayılar her adımın durumundan gelir. Atlanan adım tamamlanmış sayılır.',
    empty: false,
    summary: `${doneTotal} / ${total} adım tamamlandı.`,
    option: {
      tooltip: { trigger: 'axis' },
      legend: { top: 0 },
      grid: GRID,
      xAxis: { type: 'category', data: items.map((i) => String(i.label.split('.')[0])), axisLabel: { interval: 0 } },
      yAxis: { type: 'value', minInterval: 1 },
      series: [
        { type: 'bar', name: 'Tamamlanan', stack: 'adim', data: items.map((i) => i.done), itemStyle: { color: c.primary }, barMaxWidth: 40 },
        { type: 'bar', name: 'Kalan', stack: 'adim', data: items.map((i) => i.total - i.done), itemStyle: { color: c.muted }, barMaxWidth: 40 },
      ],
    },
    table: { head: ['Karar', 'Tamamlanan', 'Toplam'], rows: items.map((i) => [i.label, i.done, i.total]) },
  }
}

function ladderDistribution(plan: PlanDoc, c: InsightPalette): Insight {
  const count = (levels: number[]) => LADDER.map((l) => levels.filter((x) => x === l.level).length)
  const evidence = count(plan.evidence.map((e) => e.ladder))
  const interviews = count(rows(plan, '06', 'interviews').map((r) => Number(r.ladder)).filter((x) => x >= 1 && x <= 7))
  const offers = count(rows(plan, '15', 'offers').map((r) => Number(r.ladder)).filter((x) => x >= 1 && x <= 7))
  const total = [...evidence, ...interviews, ...offers].reduce((s, x) => s + x, 0)
  const base = { id: 'kanit', title: 'Kanıt basamağı dağılımı', source: 'Sayılar kanıt defterinden, Adım 06 görüşmelerinden ve Adım 15 teklif defterinden gelir.' }
  if (total === 0) return { ...base, empty: true, hint: 'Kanıt ekleyin. Ya da Adım 06 ve Adım 15’te basamak seçin.' }
  const strong = LADDER.slice(0, 3).reduce((s, _l, i) => s + evidence[i] + interviews[i] + offers[i], 0)
  return {
    ...base,
    empty: false,
    summary: `${strong} kanıt 1, 2 veya 3. basamakta. ${total - strong} kanıt yalnız ipucu.`,
    option: {
      tooltip: { trigger: 'axis' },
      legend: { top: 0 },
      grid: GRID,
      xAxis: { type: 'value', minInterval: 1 },
      yAxis: { type: 'category', inverse: true, data: LADDER.map((l) => `${l.level}. basamak`) },
      series: [
        { type: 'bar', name: 'Kanıt defteri', stack: 'kanit', data: evidence, itemStyle: { color: c.primary } },
        { type: 'bar', name: 'Görüşmeler', stack: 'kanit', data: interviews, itemStyle: { color: c.info } },
        { type: 'bar', name: 'Teklifler', stack: 'kanit', data: offers, itemStyle: { color: c.success } },
      ],
    },
    table: { head: ['Basamak', 'Kanıt defteri', 'Görüşmeler', 'Teklifler'], rows: LADDER.map((l, i) => [`${l.level}. ${l.label}`, evidence[i], interviews[i], offers[i]]) },
  }
}

function offerFunnel(plan: PlanDoc, c: InsightPalette): Insight {
  const offers = rows(plan, '15', 'offers')
  const reached = num(v(plan, '15', 'reached'))
  const tried = num(v(plan, '15', 'tried'))
  const base = { id: 'huni', title: 'Teklif, taahhüt ve ödeme hunisi', source: 'Sayılar Adım 15’ten gelir. Ulaşılan kişi, deneyen kişi ve teklif defteri okunur.' }
  if (offers.length === 0 && reached === null && tried === null) return { ...base, empty: true, hint: 'Adım 15’te talep testini ve teklif defterini doldurun.' }
  const accepted = offers.filter((o) => o.result === 'kabul')
  const strong = accepted.filter((o) => Number(o.ladder) <= 3).length
  const paid = accepted.filter((o) => Number(o.ladder) === 1).length
  const stages: [string, number | null][] = [
    ['Ulaşılan kişi', reached],
    ['Deneyen kişi', tried],
    ['Teklif alan', offers.length > 0 ? offers.length : null],
    ['Taahhüt veren', offers.length > 0 ? accepted.length : null],
    ['Ödeme yapan', offers.length > 0 ? paid : null],
  ]
  const data = stages.filter((s): s is [string, number] => s[1] !== null)
  const th = v(plan, '15', 'threshold') as { value?: number | null } | undefined
  const summary = th?.value ? `Eşik ${th.value} taahhüt. ${strong} güçlü taahhüt geldi. ${strong >= th.value ? 'Eşik geçildi.' : 'Eşik geçilmedi.'}` : `${strong} güçlü taahhüt geldi. Eşik yazılmadı.`
  return {
    ...base,
    empty: false,
    summary,
    option: {
      tooltip: { trigger: 'item' },
      color: [c.primary, c.info, c.success, c.warning, c.error],
      series: [{ type: 'funnel', sort: 'none', top: 8, bottom: 8, left: '4%', width: '92%', gap: 4, minSize: '12%', label: { show: true, position: 'inside', formatter: '{b}: {c}', fontSize: 14 }, data: data.map(([name, value]) => ({ name, value })) }],
    },
    table: { head: ['Aşama', 'Kişi'], rows: data.map(([name, value]) => [name, value]) },
  }
}

function measureVsThreshold(plan: PlanDoc, c: InsightPalette): Insight {
  const keys: [string, string][] = [['07', 'repeatMeasure'], ['07', 'effortMeasure'], ['07', 'lossMeasure'], ['22', 'measure1'], ['22', 'measure2'], ['22', 'measure3'], ['22', 'benefitMeasure']]
  const items = keys
    .map(([step, key]) => ({ step, m: v(plan, step, key) as Measure | undefined }))
    .filter((x): x is { step: string; m: Measure } => Boolean(x.m && x.m.status === 'olculdu' && num(x.m.value) !== null && num(x.m.threshold) !== null && x.m.threshold !== 0))
    .map(({ step, m }) => ({ step, name: m.name || 'Adsız ölçü', unit: m.unit, value: m.value as number, threshold: m.threshold as number, pct: Math.round(((m.value as number) / (m.threshold as number)) * 100) }))
  const base = { id: 'olcu', title: 'Ölçü ve eşik karşılaştırması', source: 'Ölçüler Adım 07 ve Adım 22’den gelir. Her çubuk eşiğin yüzdesini gösterir.' }
  if (items.length === 0) return { ...base, empty: true, hint: 'Adım 07 ya da Adım 22’de ölçüyü "Ölçüldü" yapın. Değer ve eşik yazın.' }
  const met = items.filter((i) => i.pct >= 100).length
  return {
    ...base,
    empty: false,
    summary: `${met} ölçü eşiği geçti. ${items.length - met} ölçü eşiğin altında. Çubuk eşiğin yüzdesini gösterir.`,
    option: {
      tooltip: { trigger: 'axis', valueFormatter: (x: number) => `%${x}` },
      grid: GRID,
      xAxis: { type: 'value', name: '%', axisLabel: { formatter: '%{value}' } },
      yAxis: { type: 'category', inverse: true, data: items.map((i) => `${i.name} (Adım ${i.step})`) },
      series: [{
        type: 'bar',
        name: 'Eşiğin yüzdesi',
        data: items.map((i) => ({ value: i.pct, itemStyle: { color: i.pct >= 100 ? c.success : c.warning } })),
        barMaxWidth: 28,
        label: { show: true, position: 'right', formatter: '%{c}' },
        markLine: { symbol: 'none', lineStyle: { color: c.error }, label: { formatter: 'Eşik', position: 'insideEndTop' }, data: [{ xAxis: 100 }] },
      }],
    },
    table: { head: ['Ölçü', 'Adım', 'Birim', 'Ölçülen', 'Eşik', 'Eşiğin yüzdesi'], rows: items.map((i) => [i.name, i.step, i.unit, i.value, i.threshold, `%${i.pct}`]) },
  }
}

function cashAndSpend(plan: PlanDoc, c: InsightPalette): Insight {
  const days = rows(plan, '16', 'paymentDays')
    .filter((r) => num(r.balanceAfterKurus) !== null)
    .sort((a, b) => String(a.date ?? '').localeCompare(String(b.date ?? '')))
  const ltv = num(v(plan, '29', 'ltvKurus'))
  const cac = num(v(plan, '29', 'cacKurus'))
  const hasCash = days.length > 0
  const hasUnit = ltv !== null || cac !== null
  const base = { id: 'nakit', title: 'Nakit ve harcama', source: 'Kasa çizgisi Adım 16’dan gelir. Müşteri değeri ve kazanma maliyeti Adım 29’dan gelir.' }
  if (!hasCash && !hasUnit) return { ...base, empty: true, hint: 'Adım 16’da ödeme günlerini yazın. Adım 29’da müşteri değerini ve maliyetini yazın.' }
  const cashLabels = days.map((r) => formatDate(String(r.date), false))
  const cashData = days.map((r) => lira(Number(r.balanceAfterKurus)))
  const unitLabels = ['Müşteri ömür değeri', 'Kazanma maliyeti']
  const unitData = [ltv === null ? 0 : lira(ltv), cac === null ? 0 : lira(cac)]
  const parts: string[] = []
  if (hasCash) {
    const min = Math.min(...days.map((r) => Number(r.balanceAfterKurus)))
    parts.push(min < 0 ? `Kasa en düşük ${formatMoney(min)}. Eksiye düşüyor.` : `Kasa en düşük ${formatMoney(min)}. Eksiye düşmüyor.`)
  }
  if (ltv !== null && cac !== null && cac > 0) parts.push(`Müşteri ömür değeri kazanma maliyetinin ${formatNumber(Math.round((ltv / cac) * 10) / 10)} katı.`)
  const table: ChartTable = {
    head: ['Ölçü', 'TL'],
    rows: [...cashLabels.map((l, i) => [`${l} kasa`, cashData[i]] as (string | number)[]), ...(hasUnit ? unitLabels.map((l, i) => [l, unitData[i]] as (string | number)[]) : [])],
  }
  const cashSeries = { type: 'line', name: 'Kasa', data: cashData, itemStyle: { color: c.primary }, lineStyle: { color: c.primary }, markLine: { symbol: 'none', lineStyle: { color: c.error }, data: [{ yAxis: 0, name: 'Sıfır' }] } }
  const unitSeries = { type: 'bar', name: 'TL', data: unitData.map((x, i) => ({ value: x, itemStyle: { color: i === 0 ? c.success : c.warning } })), barMaxWidth: 48, label: { show: true, position: 'top' } }
  let option: unknown
  if (hasCash && hasUnit) {
    option = {
      tooltip: { trigger: 'axis' },
      grid: [{ left: 12, right: 16, top: 32, height: '30%', containLabel: true }, { left: 12, right: 16, top: '60%', height: '28%', containLabel: true }],
      xAxis: [{ type: 'category', data: cashLabels, gridIndex: 0, axisLabel: { hideOverlap: true } }, { type: 'category', data: unitLabels, gridIndex: 1 }],
      yAxis: [{ type: 'value', name: 'TL', gridIndex: 0 }, { type: 'value', name: 'TL', gridIndex: 1 }],
      series: [{ ...cashSeries, xAxisIndex: 0, yAxisIndex: 0 }, { ...unitSeries, xAxisIndex: 1, yAxisIndex: 1 }],
    }
  } else if (hasCash) {
    option = { tooltip: { trigger: 'axis' }, grid: GRID, xAxis: { type: 'category', data: cashLabels, axisLabel: { hideOverlap: true } }, yAxis: { type: 'value', name: 'TL' }, series: [cashSeries] }
  } else {
    option = { tooltip: { trigger: 'axis' }, grid: GRID, xAxis: { type: 'category', data: unitLabels }, yAxis: { type: 'value', name: 'TL' }, series: [unitSeries] }
  }
  return { ...base, empty: false, summary: parts.join(' '), option, table }
}

function gateTimeline(plan: PlanDoc, c: InsightPalette): Insight {
  const decisions = [...plan.decisions].sort((a, b) => a.decidedAt.localeCompare(b.decidedAt))
  const base = { id: 'kapilar', title: 'Kapı kararlarının zaman çizgisi', source: 'Noktalar kayıtlı kapı kararlarından gelir. Renk karar sonucunu gösterir.' }
  if (decisions.length === 0) return { ...base, empty: true, hint: 'Bir kararın kapı ekranında kararı kaydedin.' }
  const points = decisions.map((d, i) => {
    const o = effectiveOutcome(d)
    return { i, gate: d.gate, outcome: o, label: OUTCOME_LABEL[o], date: formatDate(d.decidedAt, false), by: d.decidedBy, color: c.outcome(o) }
  })
  const last = points[points.length - 1]
  return {
    ...base,
    empty: false,
    summary: `${points.length} kapı kararı var. Son karar Kapı ${last.gate}: ${last.label}, ${last.date}.`,
    option: {
      tooltip: { trigger: 'item', formatter: (p: { dataIndex: number }) => { const x = points[p.dataIndex]; return `Kapı ${x.gate}: ${x.label}<br/>${x.date}<br/>${x.by}` } },
      grid: GRID,
      xAxis: { type: 'category', data: points.map((p) => p.date), axisLabel: { hideOverlap: true } },
      yAxis: { type: 'category', data: DECISIONS.map((d) => `Kapı ${d.n}`), inverse: true },
      series: [{
        type: 'scatter',
        name: 'Karar',
        symbolSize: 22,
        data: points.map((p) => ({ value: [p.i, p.gate - 1], itemStyle: { color: p.color }, name: p.label })),
        label: { show: true, position: 'right', formatter: (p: { name: string }) => p.name, fontSize: 14 },
      }],
    },
    table: { head: ['Kapı', 'Sonuç', 'Tarih', 'Karar veren'], rows: points.map((p) => [`Kapı ${p.gate}`, p.label, p.date, p.by]) },
  }
}

function interviewSignals(plan: PlanDoc, c: InsightPalette): Insight {
  const r = rows(plan, '06', 'interviews')
  const base = { id: 'gorusmeler', title: 'Görüşmelerde tanıma ve çaba', source: 'Sayılar Adım 06 görüşmelerinden gelir. Hedefler Kapı 2 ölçütlerinden gelir.' }
  if (r.length === 0) return { ...base, empty: true, hint: 'Adım 06’da görüşmeleri yazın.' }
  const t = plan.profile.customer
  const target = t === 'tuketici' ? [15, 9, 5] : t === 'kamu' ? [6, 4, 2] : [10, 6, 3]
  const actual = [r.length, r.filter((x) => x.recognizes === true).length, r.filter((x) => x.spendsToday === true).length]
  const labels = ['Görüşülen', 'Problemi tanıdı', 'Bugün harcıyor']
  const ok = actual.every((a, i) => a >= target[i])
  return {
    ...base,
    empty: false,
    summary: ok ? 'Üç sayı da Kapı 2 hedefini karşılıyor.' : `${labels.filter((_l, i) => actual[i] < target[i]).join(' ve ')} hedefin altında.`,
    option: {
      tooltip: { trigger: 'axis' },
      legend: { top: 0 },
      grid: GRID,
      xAxis: { type: 'category', data: labels, axisLabel: { interval: 0 } },
      yAxis: { type: 'value', minInterval: 1 },
      series: [
        { type: 'bar', name: 'Sayı', data: actual, itemStyle: { color: c.primary }, barMaxWidth: 40, label: { show: true, position: 'top' } },
        { type: 'bar', name: 'Hedef', data: target, itemStyle: { color: c.muted }, barMaxWidth: 40 },
      ],
    },
    table: { head: ['Ölçü', 'Sayı', 'Hedef'], rows: labels.map((l, i) => [l, actual[i], target[i]]) },
  }
}
