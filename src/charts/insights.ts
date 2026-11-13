/**
 * Göstergeler ekranının veri katmanı. Plan belgesinden grafik seçeneği ve tablo üretir.
 * Renkler ekrandan gelir. Alan adları docs/alan-sozlesmesi.md ile aynıdır.
 *
 * Grafik kuralları docs/tasarim-sistemi.md "Grafik" bölümündedir:
 * çubuk 32 px, kategori aralığı 24 px, desen yok, tamamlanan koyu mürekkep,
 * kalan ikincil yazı rengi (zeminden en az 3:1 ayrışır), eksen yazısı 14 px,
 * kategori adı metin, en çok 4 ızgara çizgisi, çubuk üstünde 14 px değer.
 * Telefonda kaydırıcı yoktur. Sekiz çubuk 320 px'e sığar, kategori adı kısalır.
 */
import { DECISIONS } from '@/data/decisions'
import { STEPS, stepsOf } from '@/data/registry'
import { OUTCOME_LABEL, type Measure, type Outcome, type PlanDoc } from '@/data/types'
import { stepApplies } from '@/engine/conditions'
import { effectiveOutcome } from '@/engine/gate'
import { formatDate, formatMoney, formatNumber } from '@/engine/format'
import { LADDER } from '@/components/EvidenceLadderPicker'
import { font } from '@/theme/tokens'

export interface InsightPalette {
  /** Ana seri: tamamlanan, ölçülen. Koyu mürekkep. */
  primary: string
  info: string
  success: string
  warning: string
  error: string
  /** "Kalan" ve hedef çubukları. İkincil yazı rengi. Açık temada bej zeminden en az 3:1 ayrışır. */
  muted: string
  outcome: (o: Outcome) => string
  /** Eksen ve açıklama yazısı. Verilmezse primary kullanılır. */
  axis?: string
  /** Izgara ve eksen çizgisi. Verilmezse muted kullanılır. */
  grid?: string
  /** Koyu dolgu üstündeki yazı. Verilmezse beyaz yerine muted kullanılır. */
  onInk?: string
  /** Çok serili grafiklerde gri basamaklar. Koyu mürekkepten açık griye. */
  ramp?: string[]
  /** Kategori renkleri: donut ve huni dilimleri. Her iki temada zeminden ayrışan ton renkleri. */
  series?: string[]
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
  /** Grafik yüksekliği (px). Verilmezse ChartFrame varsayılanı kullanılır. */
  height?: number
}

/** Boş göstergeden doldurulacak ekrana bağlantı. */
export interface InsightLink {
  label: string
  to: string
}

export interface InsightEmpty extends InsightBase {
  empty: true
  /** Ölçüm için hangi adım doldurulur? */
  hint: string
  /** Doldurulacak adımın ya da ekranın bağlantısı. */
  link: InsightLink
}

export type Insight = InsightChart | InsightEmpty

export interface SummaryTile {
  key: string
  title: string
  value: string
  note: string
  /** Değer bir sayı ya da kısa ölçüdür. Cümle ise false olur ve sayı gibi yazılmaz. */
  numeric?: boolean
}

/** Üst şeritteki dört istatistik kartı. Yüzde çizgisi için `percent` 0 ile 100 arasıdır; hesaplanamazsa null. */
export interface StatCard {
  key: string
  title: string
  value: string
  /** Değerin yanına yazılan birim ya da kısa ek. */
  suffix?: string
  /** İlerleme çizgisi yüzdesi. null ise çizgi çizilmez. */
  percent: number | null
  note: string
  /** Sayı değilse değer cümle gibi yazılır. */
  numeric: boolean
}

type Row = Record<string, unknown>

/** Adım kimliğinden adım ekranına bağlantı. */
function stepLink(id: string, label?: string): InsightLink {
  const step = STEPS[id]
  return { label: label ?? `Adım ${id}’yi doldurun`, to: step ? `/karar/${step.decision}/adim/${id}` : '/ozet' }
}

const v = (p: PlanDoc, step: string, key: string): unknown => p.steps[step]?.values?.[key]
const rows = (p: PlanDoc, step: string, key: string): Row[] => {
  const x = v(p, step, key)
  return Array.isArray(x) ? (x as Row[]) : []
}
const num = (x: unknown): number | null => (typeof x === 'number' && !Number.isNaN(x) ? x : null)
const lira = (kurus: number): number => Math.round(kurus) / 100

/** Çubuk 32 px. Kategori bandının yüzde 40'ı boşluk kalır: 32 px çubuk için 24 px aralık. */
const BAR = 32
const CATEGORY_GAP = '40%'
const GRID = { left: 8, right: 8, top: 40, bottom: 8, containLabel: true }

/** Ortak eksen, açıklama ve etiket biçimi. Yazı 14 px, ızgara 1 px. */
function styles(c: InsightPalette) {
  const axis = c.axis ?? c.primary
  const grid = c.grid ?? c.muted
  const line = { lineStyle: { color: grid, width: 1 } }
  return {
    axis,
    grid,
    axisText: { color: axis, fontSize: font.helper, fontFamily: font.family },
    categoryAxis: { axisLine: line, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { color: axis, fontSize: font.helper, interval: 0 } },
    /* En çok 4 ızgara çizgisi. Sekiz çizgili eksen okunmaz. */
    valueAxis: { axisLine: { show: false }, axisTick: { show: false }, splitNumber: 4, splitLine: { show: true, ...line }, axisLabel: { color: axis, fontSize: font.helper } },
    legend: { top: 0, left: 0, icon: 'rect', itemWidth: 12, itemHeight: 12, itemGap: 16, textStyle: { color: axis, fontSize: font.helper } },
    valueLabel: { show: true, position: 'top', color: c.primary, fontSize: font.helper },
    tooltip: { trigger: 'axis', textStyle: { fontSize: font.helper } },
  }
}

/** Dar kapsayıcı sınırı. Bunun altında kategori adları kısalır ve 45 derece döner. */
const NARROW = 520

/** Telefonda kategori adı tek kelime. Tablo tam adı verir. */
const SHORT_TITLE: Record<number, string> = { 1: 'Yetki', 2: 'Sorun', 3: 'Erişim', 4: 'Taahhüt', 5: 'Kaynak', 6: 'Teslim', 7: 'Tekrar', 8: 'Gelecek' }

/** Dar ve geniş kapsayıcı için ayrı ayarlar. Örneğin dar ekranda açıklama iki satıra sarınca ızgara aşağı iner. */
function whenNarrow(option: Record<string, unknown>, narrow: Record<string, unknown>, wide: Record<string, unknown>) {
  return { baseOption: option, media: [{ query: { maxWidth: NARROW }, option: narrow }, { option: wide }] }
}

function seriesColors(c: InsightPalette, n: number): string[] {
  const base = c.series && c.series.length ? c.series : ramp(c, 4)
  return Array.from({ length: n }, (_x, i) => base[i % base.length])
}

function ramp(c: InsightPalette, n: number): string[] {
  const base = c.ramp && c.ramp.length ? c.ramp : [c.primary, c.muted]
  return Array.from({ length: n }, (_x, i) => base[Math.min(i, base.length - 1)])
}

/** Dört özet değer. Pist, ödeme günü açığı, bütçe kullanımı ve deneme hakkı. */
export function summaryTiles(plan: PlanDoc): SummaryTile[] {
  const { cashKurus, monthlyBurnKurus, budgetKurus, retriesPerDecision } = plan.limits

  const runway: SummaryTile = cashKurus && monthlyBurnKurus
    ? { key: 'pist', title: 'Pist', value: `${Math.floor(cashKurus / monthlyBurnKurus)} ay`, note: `Elinizde ${formatMoney(cashKurus)} var. Aylık gider ${formatMoney(monthlyBurnKurus)}.`, numeric: true }
    : { key: 'pist', title: 'Pist', value: 'Hesaplanmadı', note: 'Adım 02’de elinizdeki parayı ve aylık gideri yazın.', numeric: false }

  const days = rows(plan, '16', 'paymentDays').filter((r) => num(r.balanceAfterKurus) !== null)
  let gap: SummaryTile
  if (days.length === 0) {
    gap = { key: 'acik', title: 'Ödeme günü açığı', value: 'Ölçüm bekleniyor', note: 'Adım 16’da ödeme günlerini yazın.', numeric: false }
  } else {
    const minRow = days.reduce((a, b) => (Number(a.balanceAfterKurus) <= Number(b.balanceAfterKurus) ? a : b))
    const minBal = Number(minRow.balanceAfterKurus)
    gap = minBal < 0
      ? { key: 'acik', title: 'Ödeme günü açığı', value: formatMoney(-minBal), note: `Kasa ${formatDate(String(minRow.date), false)} günü eksiye düşüyor.`, numeric: true }
      : { key: 'acik', title: 'Ödeme günü açığı', value: 'Açık yok', note: `En düşük kasa ${formatMoney(minBal)}.`, numeric: false }
  }

  const spent = rows(plan, '24', 'results').reduce((s, r) => s + (num(r.costKurus) ?? 0), 0)
  let budget: SummaryTile
  if (!budgetKurus) budget = { key: 'butce', title: 'Bütçe kullanımı', value: 'Yazılmadı', note: 'Adım 02’de plana ayrılan en çok parayı yazın.', numeric: false }
  else if (spent === 0) budget = { key: 'butce', title: 'Bütçe kullanımı', value: 'Harcama yazılmadı', note: `Sınır ${formatMoney(budgetKurus)}. Harcamalar Adım 24’te kayda geçer.`, numeric: false }
  else budget = { key: 'butce', title: 'Bütçe kullanımı', value: `%${Math.round((spent / budgetKurus) * 100)}`, note: `Sınır ${formatMoney(budgetKurus)}. Kanal testlerine ${formatMoney(spent)} harcandı.`, numeric: true }

  const used = plan.decisions.filter((d) => d.chosen === 'yenidenDene').length
  const retries: SummaryTile = retriesPerDecision
    ? { key: 'deneme', title: 'Deneme hakkı', value: `${retriesPerDecision} / karar`, note: used === 0 ? 'Henüz deneme hakkı kullanılmadı.' : `${used} deneme kullanıldı.`, numeric: true }
    : { key: 'deneme', title: 'Deneme hakkı', value: 'Yazılmadı', note: 'Adım 02’de karar başına deneme sayısını yazın.', numeric: false }

  return [runway, gap, budget, retries]
}

/** Ölçü alanları: Adım 07 üç ölçü, Adım 22 dört ölçü. */
const MEASURE_KEYS: [string, string][] = [['07', 'repeatMeasure'], ['07', 'effortMeasure'], ['07', 'lossMeasure'], ['22', 'measure1'], ['22', 'measure2'], ['22', 'measure3'], ['22', 'benefitMeasure']]

const clampPct = (x: number): number => Math.max(0, Math.min(100, Math.round(x)))

/**
 * Dört istatistik kartı: pist (12 aya oranı), bütçe kullanımı, ölçülen ölçüt yüzdesi ve deneme hakkı.
 * Her kartın altında yüzde çizgisi vardır. Hesaplanamayan değerde çizgi çizilmez.
 */
export function statCards(plan: PlanDoc): StatCard[] {
  const { cashKurus, monthlyBurnKurus, budgetKurus, retriesPerDecision } = plan.limits

  const months = cashKurus && monthlyBurnKurus ? Math.floor(cashKurus / monthlyBurnKurus) : null
  const runway: StatCard = months !== null
    ? { key: 'pist', title: 'Pist', value: String(months), suffix: 'ay', percent: clampPct((months / 12) * 100), note: `12 ayın yüzde ${clampPct((months / 12) * 100)}’i. Elinizde ${formatMoney(cashKurus!)} var.`, numeric: true }
    : { key: 'pist', title: 'Pist', value: 'Hesaplanmadı', percent: null, note: 'Adım 02’de elinizdeki parayı ve aylık gideri yazın.', numeric: false }

  const spent = rows(plan, '24', 'results').reduce((s, r) => s + (num(r.costKurus) ?? 0), 0)
  let budget: StatCard
  if (!budgetKurus) budget = { key: 'butce', title: 'Bütçe kullanımı', value: 'Yazılmadı', percent: null, note: 'Adım 02’de plana ayrılan en çok parayı yazın.', numeric: false }
  else if (spent === 0) budget = { key: 'butce', title: 'Bütçe kullanımı', value: '0', suffix: '%', percent: 0, note: `Sınır ${formatMoney(budgetKurus)}. Harcamalar Adım 24’te kayda geçer.`, numeric: true }
  else {
    const pct = Math.round((spent / budgetKurus) * 100)
    budget = { key: 'butce', title: 'Bütçe kullanımı', value: String(pct), suffix: '%', percent: clampPct(pct), note: `Sınır ${formatMoney(budgetKurus)}. Harcanan ${formatMoney(spent)}.`, numeric: true }
  }

  const measures = MEASURE_KEYS.map(([step, key]) => v(plan, step, key) as Measure | undefined)
  const defined = measures.filter((m): m is Measure => Boolean(m))
  const measured = defined.filter((m) => m.status === 'olculdu' && num(m.value) !== null).length
  const total = MEASURE_KEYS.length
  const measurePct = Math.round((measured / total) * 100)
  const measure: StatCard = { key: 'olcut', title: 'Ölçülen ölçüt', value: String(measurePct), suffix: '%', percent: clampPct(measurePct), note: `${total} ölçütün ${measured} tanesi ölçüldü. Ölçütler Adım 07 ve Adım 22’dedir.`, numeric: true }

  const used = plan.decisions.filter((d) => d.chosen === 'yenidenDene').length
  const retries: StatCard = retriesPerDecision
    ? { key: 'deneme', title: 'Deneme hakkı', value: String(retriesPerDecision), suffix: '/ karar', percent: clampPct((used / (retriesPerDecision * DECISIONS.length)) * 100), note: used === 0 ? 'Henüz deneme hakkı kullanılmadı.' : `${used} deneme kullanıldı.`, numeric: true }
    : { key: 'deneme', title: 'Deneme hakkı', value: 'Yazılmadı', percent: null, note: 'Adım 02’de karar başına deneme sayısını yazın.', numeric: false }

  return [runway, budget, measure, retries]
}

/** Yedi gösterge. Sıra: karar ilerlemesi, kanıt basamağı, nakit, huni, ölçü ve eşik, karar zaman çizgisi, görüşmeler. Veri yoksa gösterge boş durumla döner. */
export function buildInsights(plan: PlanDoc, c: InsightPalette): Insight[] {
  return [stepsPerDecision(plan, c), ladderDistribution(plan, c), cashAndSpend(plan, c), offerFunnel(plan, c), measureVsThreshold(plan, c), gateTimeline(plan, c), interviewSignals(plan, c)]
}

function stepsPerDecision(plan: PlanDoc, c: InsightPalette): Insight {
  const s = styles(c)
  const items = DECISIONS.map((d) => {
    const steps = stepsOf(d.n).filter((x) => stepApplies(x.mandatory, plan) !== 'gizli' && (!plan.shortPath || x.shortPath))
    const done = steps.filter((x) => plan.steps[x.id]?.status === 'tamam' || plan.steps[x.id]?.status === 'atlandi').length
    return { name: d.title, short: SHORT_TITLE[d.n] ?? d.title, label: `${d.n}. ${d.title}`, done, total: steps.length }
  })
  const doneTotal = items.reduce((sum, i) => sum + i.done, 0)
  const total = items.reduce((sum, i) => sum + i.total, 0)
  return {
    id: 'adimlar',
    title: 'Karar ilerlemesi',
    source: 'Sayılar her adımın durumundan gelir. Atlanan adım tamamlanmış sayılır.',
    empty: false,
    summary: `${doneTotal} / ${total} adım tamamlandı.`,
    height: 8 * 48 + 56,
    /*
     * Yatay çubuk: her satır bir karar. Karar adı solda tam yazılır, dar ekranda kısalır.
     * X ekseni yalnız 0, 4 ve 8. Bir kararda en çok 7 adım vardır. Çubuk ucunda "tamamlanan/toplam" yazar.
     */
    option: whenNarrow({
      tooltip: s.tooltip,
      legend: s.legend,
      grid: { ...GRID, right: 48 },
      xAxis: { type: 'value', min: 0, max: 8, interval: 4, ...s.valueAxis },
      yAxis: { type: 'category', inverse: true, data: items.map((i) => i.label), ...s.categoryAxis, axisLabel: { ...s.categoryAxis.axisLabel, width: 150, overflow: 'break', lineHeight: 16 } },
      series: [
        { type: 'bar', name: 'Tamamlanan', stack: 'adim', data: items.map((i) => i.done), itemStyle: { color: c.primary }, barMaxWidth: BAR, barCategoryGap: CATEGORY_GAP },
        {
          type: 'bar',
          name: 'Kalan',
          stack: 'adim',
          data: items.map((i) => i.total - i.done),
          itemStyle: { color: c.muted },
          barMaxWidth: BAR,
          barCategoryGap: CATEGORY_GAP,
          label: { ...s.valueLabel, position: 'right', formatter: (p: { dataIndex: number }) => `${items[p.dataIndex].done}/${items[p.dataIndex].total}` },
        },
      ],
    }, {
      /* Dar kartta karar adı 100 px içinde kelime sınırından sarılır. Satır 48 px: üç satıra kadar sığar. */
      yAxis: { data: items.map((i) => i.label), axisLabel: { width: 100, overflow: 'break' } },
    }, {
      yAxis: { data: items.map((i) => i.label), axisLabel: { width: 150, overflow: 'break' } },
    }),
    table: { head: ['Karar', 'Tamamlanan', 'Toplam'], rows: items.map((i) => [i.label, i.done, i.total]) },
  }
}

function ladderDistribution(plan: PlanDoc, c: InsightPalette): Insight {
  const count = (levels: number[]) => LADDER.map((l) => levels.filter((x) => x === l.level).length)
  const evidence = count(plan.evidence.map((e) => e.ladder))
  const interviews = count(rows(plan, '06', 'interviews').map((r) => Number(r.ladder)).filter((x) => x >= 1 && x <= 7))
  const offers = count(rows(plan, '15', 'offers').map((r) => Number(r.ladder)).filter((x) => x >= 1 && x <= 7))
  const total = [...evidence, ...interviews, ...offers].reduce((sum, x) => sum + x, 0)
  const base = { id: 'kanit', title: 'Kanıt basamağı dağılımı', source: 'Sayılar kanıt defterinden, Adım 06 görüşmelerinden ve Adım 15 teklif defterinden gelir.' }
  if (total === 0) return { ...base, empty: true, hint: 'Kanıt ekleyin. Ya da Adım 06 ve Adım 15’te basamak seçin.', link: { label: 'Kanıt ekleyin', to: '/kanitlar' } }
  const strong = LADDER.slice(0, 3).reduce((sum, _l, i) => sum + evidence[i] + interviews[i] + offers[i], 0)
  const totals = LADDER.map((_l, i) => evidence[i] + interviews[i] + offers[i])
  const colors = seriesColors(c, LADDER.length)
  const axis = c.axis ?? c.primary
  /* Donut: yalnız dolu basamaklar dilim olur. Açıklama altta, dar ekranda kayar. Dilim içinde sayı yazar. */
  const slices = LADDER.map((l, i) => ({ name: `${l.level}. basamak`, value: totals[i], itemStyle: { color: colors[i] } })).filter((d) => d.value > 0)
  return {
    ...base,
    empty: false,
    summary: `${strong} kanıt 1, 2 veya 3. basamakta. ${total - strong} kanıt yalnız ipucu.`,
    height: 300,
    option: {
      tooltip: { trigger: 'item', textStyle: { fontSize: font.helper }, formatter: (p: { name: string; value: number; percent: number }) => `${p.name}: ${p.value} kanıt (%${Math.round(p.percent)})` },
      /* Açıklama altta ve satırlara sarılır; sayfalama yoktur. Halka üstte durur. */
      legend: { bottom: 0, left: 'center', width: '100%', icon: 'circle', itemWidth: 12, itemHeight: 12, itemGap: 14, textStyle: { color: axis, fontSize: font.helper } },
      series: [{
        type: 'pie',
        radius: ['40%', '62%'],
        center: ['50%', '38%'],
        avoidLabelOverlap: true,
        itemStyle: { borderWidth: 0 },
        label: { show: true, position: 'inside', formatter: '{c}', color: c.onInk ?? c.primary, fontSize: font.helper },
        emphasis: { scale: false, label: { show: true } },
        data: slices,
      }],
    },
    table: { head: ['Basamak', 'Kanıt defteri', 'Görüşmeler', 'Teklifler'], rows: LADDER.map((l, i) => [`${l.level}. ${l.label}`, evidence[i], interviews[i], offers[i]]) },
  }
}

function offerFunnel(plan: PlanDoc, c: InsightPalette): Insight {
  const offers = rows(plan, '15', 'offers')
  const reached = num(v(plan, '15', 'reached'))
  const tried = num(v(plan, '15', 'tried'))
  const base = { id: 'huni', title: 'Teklif ve ödeme hunisi', source: 'Sayılar Adım 15’ten gelir. Ulaşılan kişi, deneyen kişi ve teklif defteri okunur.' }
  if (offers.length === 0 && reached === null && tried === null) return { ...base, empty: true, hint: 'Adım 15’te talep testini ve teklif defterini doldurun.', link: stepLink('15') }
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
  const data = stages.filter((st): st is [string, number] => st[1] !== null)
  const th = v(plan, '15', 'threshold') as { value?: number | null } | undefined
  const summary = th?.value ? `Eşik ${th.value} taahhüt. ${strong} güçlü taahhüt geldi. ${strong >= th.value ? 'Eşik geçildi.' : 'Eşik geçilmedi.'}` : `${strong} güçlü taahhüt geldi. Eşik yazılmadı.`
  const colors = seriesColors(c, data.length)
  /* Dilim renkleri zeminin tersi tondadır. Dilim içindeki yazı zemin rengindedir: açık temada beyaz, koyu temada koyu. */
  const labelColor = () => c.onInk ?? c.muted
  return {
    ...base,
    empty: false,
    summary,
    option: {
      tooltip: { trigger: 'item', textStyle: { fontSize: font.helper } },
      series: [{
        type: 'funnel',
        sort: 'none',
        top: 8,
        bottom: 8,
        left: '4%',
        width: '92%',
        gap: 4,
        minSize: '30%',
        label: { show: true, position: 'inside', formatter: '{b}: {c}', fontSize: font.helper },
        itemStyle: { borderWidth: 0 },
        data: data.map(([name, value], i) => ({ name, value, itemStyle: { color: colors[i] }, label: { color: labelColor() } })),
      }],
    },
    table: { head: ['Aşama', 'Kişi'], rows: data.map(([name, value]) => [name, value]) },
  }
}

function measureVsThreshold(plan: PlanDoc, c: InsightPalette): Insight {
  const s = styles(c)
  const items = MEASURE_KEYS
    .map(([step, key]) => ({ step, m: v(plan, step, key) as Measure | undefined }))
    .filter((x): x is { step: string; m: Measure } => Boolean(x.m && x.m.status === 'olculdu' && num(x.m.value) !== null && num(x.m.threshold) !== null && x.m.threshold !== 0))
    .map(({ step, m }) => ({ step, name: m.name || 'Adsız ölçü', unit: m.unit, value: m.value as number, threshold: m.threshold as number, pct: Math.round(((m.value as number) / (m.threshold as number)) * 100) }))
  const base = { id: 'olcu', title: 'Ölçü ve eşik', source: 'Ölçüler Adım 07 ve Adım 22’den gelir. Her çubuk eşiğin yüzdesini gösterir.' }
  if (items.length === 0) return { ...base, empty: true, hint: 'Adım 07 ya da Adım 22’de ölçüyü "Ölçüldü" yapın. Değer ve eşik yazın.', link: stepLink('07') }
  const met = items.filter((i) => i.pct >= 100).length
  return {
    ...base,
    empty: false,
    summary: `${met} ölçü eşiği geçti. ${items.length - met} ölçü eşiğin altında. Çubuk eşiğin yüzdesini gösterir.`,
    option: whenNarrow({
      tooltip: { ...s.tooltip, valueFormatter: (x: number) => `%${x}` },
      grid: { ...GRID, top: 32 },
      xAxis: { type: 'value', ...s.valueAxis, axisLabel: { ...s.valueAxis.axisLabel, formatter: '%{value}', hideOverlap: true } },
      yAxis: { type: 'category', inverse: true, data: items.map((i) => `${i.name} (Adım ${i.step})`), ...s.categoryAxis, axisLabel: { ...s.categoryAxis.axisLabel, width: 140, overflow: 'break' } },
      series: [{
        type: 'bar',
        name: 'Eşiğin yüzdesi',
        data: items.map((i) => ({ value: i.pct, itemStyle: { color: i.pct >= 100 ? c.success : c.warning } })),
        barMaxWidth: BAR,
        label: { ...s.valueLabel, position: 'right', formatter: '%{c}' },
        markLine: { symbol: 'none', lineStyle: { color: c.error, width: 1 }, label: { formatter: 'Eşik %100', position: 'start', distance: 6, color: c.error, fontSize: font.helper }, data: [{ xAxis: 100 }] },
      }],
    }, { yAxis: { axisLabel: { width: 96 } } }, { yAxis: { axisLabel: { width: 140 } } }),
    table: { head: ['Ölçü', 'Adım', 'Birim', 'Ölçülen', 'Eşik', 'Eşiğin yüzdesi'], rows: items.map((i) => [i.name, i.step, i.unit, i.value, i.threshold, `%${i.pct}`]) },
  }
}

function cashAndSpend(plan: PlanDoc, c: InsightPalette): Insight {
  const s = styles(c)
  const days = rows(plan, '16', 'paymentDays')
    .filter((r) => num(r.balanceAfterKurus) !== null)
    .sort((a, b) => String(a.date ?? '').localeCompare(String(b.date ?? '')))
  const ltv = num(v(plan, '29', 'ltvKurus'))
  const cac = num(v(plan, '29', 'cacKurus'))
  const hasCash = days.length > 0
  const hasUnit = ltv !== null || cac !== null
  const base = { id: 'nakit', title: 'Nakit akışı', source: 'Kasa çizgisi Adım 16’dan gelir. Müşteri değeri ve kazanma maliyeti Adım 29’dan gelir.' }
  if (!hasCash && !hasUnit) return { ...base, empty: true, hint: 'Adım 16’da ödeme günlerini yazın. Adım 29’da müşteri değerini ve maliyetini yazın.', link: stepLink('16') }
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
  const cashSeries = {
    type: 'line',
    name: 'Kasa',
    data: cashData,
    symbolSize: 8,
    smooth: 0.2,
    itemStyle: { color: c.primary },
    lineStyle: { color: c.primary, width: 2 },
    areaStyle: { color: c.primary, opacity: 0.08 },
    markLine: { symbol: 'none', lineStyle: { color: c.error, width: 1 }, label: { color: c.error, fontSize: font.helper }, data: [{ yAxis: 0, name: 'Sıfır' }] },
  }
  const unitSeries = { type: 'bar', name: 'TL', data: unitData.map((x, i) => ({ value: x, itemStyle: { color: i === 0 ? c.success : c.warning } })), barMaxWidth: BAR, barCategoryGap: CATEGORY_GAP, label: s.valueLabel }
  const cashX = { type: 'category', data: cashLabels, ...s.categoryAxis, axisLabel: { ...s.categoryAxis.axisLabel, interval: 'auto', hideOverlap: true } }
  const unitX = { type: 'category', data: unitLabels, ...s.categoryAxis }
  const tlY = { type: 'value', name: 'TL', nameTextStyle: s.axisText, ...s.valueAxis }
  let option: unknown
  if (hasCash && hasUnit) {
    option = {
      tooltip: s.tooltip,
      grid: [{ left: 8, right: 8, top: 32, height: '30%', containLabel: true }, { left: 8, right: 8, top: '60%', height: '28%', containLabel: true }],
      xAxis: [{ ...cashX, gridIndex: 0 }, { ...unitX, gridIndex: 1 }],
      yAxis: [{ ...tlY, gridIndex: 0 }, { ...tlY, gridIndex: 1 }],
      series: [{ ...cashSeries, xAxisIndex: 0, yAxisIndex: 0 }, { ...unitSeries, xAxisIndex: 1, yAxisIndex: 1 }],
    }
  } else if (hasCash) {
    option = { tooltip: s.tooltip, grid: GRID, xAxis: cashX, yAxis: tlY, series: [cashSeries] }
  } else {
    option = { tooltip: s.tooltip, grid: GRID, xAxis: unitX, yAxis: tlY, series: [unitSeries] }
  }
  return { ...base, empty: false, summary: parts.join(' '), option, table }
}

function gateTimeline(plan: PlanDoc, c: InsightPalette): Insight {
  const s = styles(c)
  const decisions = [...plan.decisions].sort((a, b) => a.decidedAt.localeCompare(b.decidedAt))
  const base = { id: 'kapilar', title: 'Karar zaman çizgisi', source: 'Noktalar kayıtlı kapı kararlarından gelir. Renk karar sonucunu gösterir.' }
  if (decisions.length === 0) return { ...base, empty: true, hint: 'Bir kararın kapı ekranında kararı kaydedin.', link: { label: 'Kapı 1’e gidin', to: '/karar/1/kapi' } }
  const points = decisions.map((d, i) => {
    const o = effectiveOutcome(d)
    return { i, gate: d.gate, outcome: o, label: OUTCOME_LABEL[o], date: formatDate(d.decidedAt, false), by: d.decidedBy, color: c.outcome(o) }
  })
  const last = points[points.length - 1]
  return {
    ...base,
    empty: false,
    summary: `${points.length} kapı kararı var. Son karar Kapı ${last.gate}: ${last.label}, ${last.date}.`,
    option: whenNarrow({
      tooltip: { trigger: 'item', textStyle: { fontSize: font.helper }, formatter: (p: { dataIndex: number }) => { const x = points[p.dataIndex]; return `Kapı ${x.gate}: ${x.label}<br/>${x.date}<br/>${x.by}` } },
      grid: { ...GRID, top: 16, right: 64 },
      xAxis: { type: 'category', data: points.map((p) => p.date), ...s.categoryAxis, axisLabel: { ...s.categoryAxis.axisLabel, interval: 'auto', hideOverlap: true } },
      yAxis: { type: 'category', data: DECISIONS.map((d) => d.title), inverse: true, ...s.categoryAxis, splitLine: { show: true, lineStyle: { color: s.grid, width: 1 } }, axisLabel: { ...s.categoryAxis.axisLabel, width: 140, overflow: 'truncate' } },
      series: [{
        type: 'scatter',
        name: 'Karar',
        symbolSize: 16,
        data: points.map((p) => ({ value: [p.i, p.gate - 1], itemStyle: { color: p.color }, name: p.label })),
        label: { show: true, position: 'right', color: s.axis, formatter: (p: { name: string }) => p.name, fontSize: font.helper },
      }],
    }, { yAxis: { axisLabel: { width: 72 } } }, { yAxis: { axisLabel: { width: 140 } } }),
    table: { head: ['Kapı', 'Sonuç', 'Tarih', 'Karar veren'], rows: points.map((p) => [`Kapı ${p.gate}`, p.label, p.date, p.by]) },
  }
}

function interviewSignals(plan: PlanDoc, c: InsightPalette): Insight {
  const s = styles(c)
  const r = rows(plan, '06', 'interviews')
  const base = { id: 'gorusmeler', title: 'Görüşmelerde tanıma ve çaba', source: 'Sayılar Adım 06 görüşmelerinden gelir. Hedefler Kapı 2 ölçütlerinden gelir.' }
  if (r.length === 0) return { ...base, empty: true, hint: 'Adım 06’da görüşmeleri yazın.', link: stepLink('06') }
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
      tooltip: s.tooltip,
      legend: s.legend,
      grid: GRID,
      xAxis: { type: 'category', data: labels, ...s.categoryAxis, axisLabel: { ...s.categoryAxis.axisLabel, width: 104, overflow: 'break', lineHeight: 16 } },
      yAxis: { type: 'value', minInterval: 1, ...s.valueAxis },
      series: [
        /* İki çubuk yan yana. Aralık çubuğun dörtte üçüdür: 32 px çubuk için 24 px. */
        { type: 'bar', name: 'Sayı', data: actual, itemStyle: { color: c.primary }, barMaxWidth: BAR, barGap: '75%', barCategoryGap: CATEGORY_GAP, label: s.valueLabel },
        { type: 'bar', name: 'Hedef', data: target, itemStyle: { color: c.muted }, barMaxWidth: BAR, label: { ...s.valueLabel, color: s.axis } },
      ],
    },
    table: { head: ['Ölçü', 'Sayı', 'Hedef'], rows: labels.map((l, i) => [l, actual[i], target[i]]) },
  }
}
