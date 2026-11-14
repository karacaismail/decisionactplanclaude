/**
 * İki belge aynı veriden üretilir. Yönetici raporu ve girişimci aksiyon planı.
 * Eksik bilgi uydurulmaz. Yazılmamış alan listelenmez: "Problem henüz yazılmadı." gibi tek cümle yazılır.
 * Boş değerler virgülle dizilmez. Tablolarda boş satır atlanır. Boş tablo çizilmez.
 */
import type { Measure, PlanDoc } from '@/data/types'
import { OUTCOME_LABEL } from '@/data/types'
import { DECISIONS } from '@/data/decisions'
import { STEPS, stepsOf } from '@/data/registry'
import { stepApplies } from '@/engine/conditions'
import { effectiveOutcome, lastDecision } from '@/engine/gate'
import { formatDate, formatMoney, formatNumber } from '@/engine/format'

/** Başlık ve değer çifti. Ekranda `Descriptions` ile, Markdown'da madde olarak yazılır. */
export interface Fact {
  title: string
  value: string
}
export interface ReportSection {
  title: string
  lines: string[]
  table?: { head: string[]; rows: string[][] }
  /** Bölümün başlık ve değer çiftleri. Varsa ekranda `lines` yerine bu çiftler `Descriptions` ile çizilir. */
  facts?: Fact[]
}
export interface Report {
  title: string
  /** Örnek planda rapor başına basılan uyarı. Gerçek planda yoktur. */
  stamp?: string
  meta: string[]
  /** Üst bilgi çiftleri: Plan, Profil, Sürüm, Oluşturma. `meta` ile aynı bilgidir; ekran `Descriptions` için kullanır. */
  facts: Fact[]
  sections: ReportSection[]
}

export const EXAMPLE_STAMP = 'Örnek plan. Gerçek veri değildir.'
const stampOf = (p: PlanDoc): string | undefined => (p.example ? EXAMPLE_STAMP : undefined)

const v = (p: PlanDoc, s: string, k: string): unknown => p.steps[s]?.values?.[k]
const str = (x: unknown, fallback = 'Bilinmiyor'): string => (typeof x === 'string' && x.trim() ? x : typeof x === 'number' ? String(x) : fallback)
/** Dolu metin ya da sayı. Boşsa null döner; cümleye girmez. */
export const text = (x: unknown): string | null => (typeof x === 'string' && x.trim() ? x.trim() : typeof x === 'number' ? String(x) : null)
/** Dolu parçaları virgülle birleştirir. Boş parça dizilmez. Hepsi boşsa null döner. */
export const joinFilled = (parts: unknown[], sep = ', '): string | null => {
  const filled = parts.map(text).filter((x): x is string => x !== null)
  return filled.length ? filled.join(sep) : null
}
/**
 * "Etiket: değer." cümlesi. Değer boşsa "Etiket henüz yazılmadı." tek cümle döner.
 * Örnek: labelled('Problem', null) → "Problem henüz yazılmadı."
 */
export const labelled = (label: string, value: unknown, missing = 'yazılmadı'): string => {
  const t = text(value)
  return t ? `${label}: ${t.replace(/\.$/, '')}.` : `${label} henüz ${missing}.`
}
/**
 * "Etiket: değer." biçimindeki cümleyi başlık ve değer çiftine çevirir.
 * "Etiket henüz yazılmadı." gibi cümlelerde değer cümlenin kendisi olur, başlık ilk kelimelerden alınır.
 * Örnek: factOf('Pist: 8 ay.') → { title: 'Pist', value: '8 ay' }
 */
export function factOf(line: string): Fact {
  const m = /^([^:]{1,48}):\s+(.+)$/.exec(line.trim())
  if (m) return { title: m[1].trim(), value: m[2].trim().replace(/\.$/, '') }
  const missing = /^(.+?) henüz (.+)\.$/.exec(line.trim())
  if (missing) return { title: missing[1].trim(), value: `Henüz ${missing[2]}` }
  return { title: line.replace(/\.$/, ''), value: '' }
}
const rows = (p: PlanDoc, s: string, k: string): Record<string, unknown>[] => (v(p, s, k) as Record<string, unknown>[]) ?? []
/** Para cümlesi. Değer yoksa "Etiket henüz yazılmadı." döner. */
const money = (label: string, kurus: unknown): string => (typeof kurus === 'number' && !Number.isNaN(kurus) ? `${label}: ${formatMoney(kurus)}.` : `${label} henüz yazılmadı.`)
/** Tablo satırlarını süzer: her hücresi boş olan satır atlanır. */
export const compactRows = (rows: string[][]): string[][] => rows.filter((r) => r.some((c) => c.trim() && c !== 'Bilinmiyor'))
const measureText = (m: Measure, label?: string): string => {
  const name = label ?? (m.name || 'Ölçü')
  if (m.status === 'bilinmiyor') return `${name}: bilinmiyor.`
  if (m.status === 'uygulanmiyor') return `${name}: uygulanmıyor. ${m.naReason ?? ''}`.trim()
  return `${name}: ${formatNumber(m.value, m.unit)}. Eşik ${formatNumber(m.threshold, m.unit)}${m.isGuess ? ' (ilk tahmin)' : ''}.`
}
/**
 * Birden çok ölçüyü satırlara çevirir. Tanımlanmamış ölçüler tek satırda toplanır:
 * "3 ölçü tanımlanmadı." Aynı cümle üç kez alt alta yazılmaz.
 * İsteğe bağlı etiketler ölçü adının önüne geçer. Örneğin "Fayda".
 */
export function measureLines(measures: (Measure | undefined)[], labels: (string | undefined)[] = []): string[] {
  const defined = measures.map((m, i) => (m ? measureText(m, labels[i]) : null)).filter((x): x is string => x !== null)
  const missing = measures.length - defined.length
  const lines = [...defined]
  if (missing === 1) lines.push(measures.length === 1 ? 'Ölçü tanımlanmadı.' : '1 ölçü tanımlanmadı.')
  else if (missing > 1) lines.push(missing === measures.length ? `${missing} ölçü de tanımlanmadı.` : `${missing} ölçü tanımlanmadı.`)
  return lines
}
/** Problem cümlesi: kim, hangi durumda, hangi iş. Boş parça dizilmez. Hepsi boşsa tek cümle. */
export function problemLines(p: PlanDoc, label = 'Problem'): string[] {
  /* Adım 05 alan adları: problemWho, problemWhen, problemJob, problemBlocker. Eski kayıtlar kısa adları taşıyabilir. */
  const f = (key: string, old: string): unknown => v(p, '05', key) ?? v(p, '05', old)
  const core = joinFilled([f('problemWho', 'who'), f('problemWhen', 'context'), f('problemJob', 'job')].map((x) => text(x)?.replace(/\.$/, '')))
  const obstacle = text(f('problemBlocker', 'obstacle'))?.replace(/\.$/, '') ?? null
  if (!core && !obstacle) return [`${label} henüz yazılmadı.`]
  const lines: string[] = []
  if (core) lines.push(`${label}: ${core}.`)
  if (obstacle) lines.push(`Engel: ${obstacle}.`)
  return lines
}
/** Risk satırı: yalnız dolu parçalar yazılır. */
export const riskLine = (r: Record<string, unknown>): string =>
  [['Risk', r.risk], ['Tetikleyici', r.trigger], ['Yanıt', r.response], ['Sahip', r.owner]]
    .filter(([, val]) => text(val) !== null)
    .map(([label, val]) => `${label}: ${text(val)?.replace(/\.+$/, '')}.`)
    .join(' ')

const PROFILE_LABEL: Record<string, Record<string, string>> = {
  customer: { tuketici: 'tüketici işi', isletme: 'işletme işi', kamu: 'kamu işi', pazarYeri: 'pazar yeri' },
  offering: { dijital: 'dijital ürün', fiziksel: 'fiziksel ürün', hizmet: 'hizmet', donanim: 'donanım' },
  regulation: { dusuk: 'düşük düzenleme', yuksek: 'yüksek düzenleme' },
  team: { tekKurucu: 'tek kurucu', ekip: 'ekip' },
  funding: { kendi: 'kendi parası', dis: 'dış para' },
  market: { varOlan: 'var olan pazar', yeni: 'yeni pazar' },
  start: { sifirdan: 'sıfırdan', devralma: 'devralma' },
}
export function profileSentence(p: PlanDoc): string {
  const parts = (['customer', 'offering', 'regulation', 'team', 'funding', 'market', 'start'] as const).map((k) => PROFILE_LABEL[k][String(p.profile[k] ?? '')] ?? 'seçilmedi')
  return parts.join(', ')
}

function runwayMonths(p: PlanDoc): number | null {
  const b = p.limits.monthlyBurnKurus, c = p.limits.cashKurus
  return b && c ? Math.floor(c / b) : null
}

const metaLines = (p: PlanDoc): string[] => [`Plan: ${p.name}`, `Profil: ${profileSentence(p)}`, `Sürüm ${p.revision}`, `Oluşturma: ${formatDate(new Date().toISOString())}`]
const metaFacts = (p: PlanDoc): Fact[] => [
  { title: 'Plan', value: p.name },
  { title: 'Profil', value: profileSentence(p) },
  { title: 'Sürüm', value: String(p.revision) },
  { title: 'Oluşturma', value: formatDate(new Date().toISOString()) },
]

type Decided = PlanDoc['decisions'][number] | undefined
function summaryFacts(latest: Decided, runway: number | null, p: PlanDoc, firstGap: Record<string, unknown> | undefined, risks: Record<string, unknown>[], openTasks: PlanDoc['tasks']): Fact[] {
  return [
    { title: 'Son kapı', value: latest ? `Kapı ${latest.gate}: ${OUTCOME_LABEL[effectiveOutcome(latest)]}, ${formatDate(latest.decidedAt)}` : 'Henüz kapı kararı yok' },
    { title: 'Pist', value: runway !== null ? `${runway} ay` : 'Hesaplanmadı' },
    { title: 'Toplam harcama sınırı', value: typeof p.limits.budgetKurus === 'number' ? formatMoney(p.limits.budgetKurus) : 'Henüz yazılmadı' },
    { title: 'İlk kasa açığı', value: firstGap ? `${formatDate(String(firstGap.date), false)}, eksik ${formatMoney(Math.abs(Number(firstGap.balanceAfterKurus)))}` : 'Kayıtlı ödeme gününde açık yok' },
    { title: 'Kritik risk', value: risks.length ? `${risks.length} risk${text(risks[0].risk) ? `. En önemlisi: ${text(risks[0].risk)}` : ''}` : 'Kayıt yok' },
    { title: 'Sıradaki iş', value: openTasks.length ? `${openTasks[0].action}${openTasks[0].owner ? ` (${openTasks[0].owner})` : ''}` : 'Açık iş yok' },
  ]
}

export function buildExecutiveReport(p: PlanDoc): Report {
  const latest = [...p.decisions].sort((a, b) => b.decidedAt.localeCompare(a.decidedAt))[0]
  const runway = runwayMonths(p)
  const pays = rows(p, '16', 'paymentDays')
  const firstGap = pays.find((d) => Number(d.balanceAfterKurus ?? 0) < 0)
  const risks = rows(p, '17', 'risks').filter((r) => Number(r.likelihood ?? 0) * Number(r.impact ?? 0) >= 6)
  const openTasks = p.tasks.filter((t) => t.status === 'acik' || t.status === 'taslak')
  const summary: string[] = [
    latest ? `Son kapı: Kapı ${latest.gate}. Sonuç: ${OUTCOME_LABEL[effectiveOutcome(latest)]}. Tarih: ${formatDate(latest.decidedAt)}.` : 'Henüz kapı kararı yok.',
    `Pist: ${runway !== null ? runway + ' ay' : 'hesaplanmadı'}.`,
    money('Toplam harcama sınırı', p.limits.budgetKurus),
    firstGap ? `İlk kasa açığı: ${formatDate(String(firstGap.date), false)}. Eksik: ${formatMoney(Math.abs(Number(firstGap.balanceAfterKurus)))}.` : 'Kayıtlı ödeme gününde kasa açığı yok.',
    risks.length ? `${risks.length} kritik risk var.${text(risks[0].risk) ? ` En önemlisi: ${text(risks[0].risk)}.` : ''}` : 'Kritik risk kaydı yok.',
    openTasks.length ? `Sıradaki iş: ${openTasks[0].action}${openTasks[0].owner ? ' (' + openTasks[0].owner + ')' : ''}.` : 'Açık iş yok.',
  ]
  const journey = DECISIONS.map((d) => {
    const ld = lastDecision(p, d.n)
    return [String(d.n), d.title, ld ? OUTCOME_LABEL[effectiveOutcome(ld)] : 'Karar yok', ld ? formatDate(ld.decidedAt, false) : '']
  })
  return {
    title: 'Yönetici raporu',
    stamp: stampOf(p),
    meta: metaLines(p),
    facts: metaFacts(p),
    sections: [
      /* Özet cümleleri Markdown'a yazılır. Ekran aynı bilgiyi başlık ve değer çifti olarak çizer. */
      { title: 'Yönetici özeti', lines: summary, facts: summaryFacts(latest, runway, p, firstGap, risks, openTasks) },
      { title: 'Karar yolculuğu', lines: [], table: { head: ['Karar', 'Konu', 'Sonuç', 'Tarih'], rows: journey } },
      {
        title: 'Sorun ve talep',
        lines: [
          ...problemLines(p),
          `Görüşme sayısı: ${rows(p, '06', 'interviews').length}. Problemi tanıyan: ${rows(p, '06', 'interviews').filter((x) => x.recognizes === true).length}.`,
          ...measureLines([v(p, '07', 'repeatMeasure') as Measure | undefined, v(p, '07', 'effortMeasure') as Measure | undefined, v(p, '07', 'lossMeasure') as Measure | undefined]),
          `Teklif sayısı: ${rows(p, '15', 'offers').length}. Güçlü taahhüt (1 ile 3. basamak): ${rows(p, '15', 'offers').filter((o) => Number(o.ladder) <= 3).length}.`,
        ],
      },
      {
        title: 'Kaynak ve risk',
        lines: [
          money('Orta durumda katkı payı', v(p, '16', 'contributionMid')),
          money('Aylık gider', p.limits.monthlyBurnKurus),
          money('Nakit', p.limits.cashKurus),
          ...(risks.length ? risks.map(riskLine).filter(Boolean) : ['Kritik risk yok.']),
        ],
      },
      {
        title: 'Teslim ve tekrar',
        lines: [
          /* Üç teslim ölçüsü ve fayda ölçüsü birlikte sayılır: "4 ölçü de tanımlanmadı." tek satırdır. */
          ...measureLines([v(p, '22', 'measure1') as Measure | undefined, v(p, '22', 'measure2') as Measure | undefined, v(p, '22', 'measure3') as Measure | undefined, v(p, '22', 'benefitMeasure') as Measure | undefined], [undefined, undefined, undefined, 'Fayda']),
          labelled('Uyum işareti', v(p, '28', 'signal'), 'ölçülmedi'),
          `Ömür değeri bölü kazanma maliyeti: ${(() => { const l = Number(v(p, '29', 'ltvKurus') ?? 0), c = Number(v(p, '29', 'cacKurus') ?? 0); return l && c ? (l / c).toFixed(2) : 'hesaplanamaz' })()}.`,
        ],
      },
      {
        title: 'Açık karar ve gelecek',
        lines: [
          labelled('Seçilen yol', v(p, '19', 'chosenPath')),
          labelled('Seçimin gerekçesi', v(p, '19', 'choiceReason')),
          labelled('Vazgeçilenler', v(p, '19', 'givenUp')),
          labelled('İşin yönü', v(p, '33', 'direction'), 'seçilmedi'),
          ...(latest?.counterView ? [`Karşı görüş: ${latest.counterView}`] : []),
          ...(latest?.reopenWhen ? [`Yeniden açılma koşulu: ${latest.reopenWhen}`] : []),
        ],
        table: openTasks.length ? { head: ['İş', 'Sorumlu', 'Tarih'], rows: openTasks.map((t) => [t.action, t.owner ?? 'Eksik', t.dueDate ? formatDate(t.dueDate, false) : 'Tarih belirlenmedi']) } : undefined,
      },
      {
        title: 'Kanıt eki',
        lines: [p.evidence.length ? `${p.evidence.length} kanıt kayıtlı.` : 'Henüz kanıt kaydı yok.'],
        table: p.evidence.length ? { head: ['Kanıt', 'Tür', 'Basamak', 'Tarih', 'Kaynak'], rows: compactRows(p.evidence.map((e) => [e.title, e.kind, String(e.ladder), formatDate(e.date, false), e.source ?? ''])) } : undefined,
      },
    ],
  }
}

export function buildActionPlan(p: PlanDoc): Report {
  const openTasks = p.tasks.filter((t) => t.status === 'acik' || t.status === 'taslak')
  const stepRows = DECISIONS.flatMap((d) =>
    stepsOf(d.n).map((s) => {
      const a = stepApplies(s.mandatory, p)
      const rec = p.steps[s.id]
      const status = rec?.status === 'tamam' ? 'Bitti' : rec?.status === 'atlandi' ? `Atlandı: ${rec.skipReason}` : a === 'gizli' ? 'Bu profilde gerekmez' : rec?.status === 'taslak' ? 'Taslak' : 'Açık'
      return [s.id, s.title, a === 'zorunlu' ? 'Zorunlu' : 'Koşullu', status]
    }),
  )
  /* İş adı boş olan yol haritası satırı atlanır. */
  const roadmap = (k: string) => rows(p, '19', k).filter((r) => text(r.action) !== null).map((r) => [str(r.action), str(r.owner, 'Eksik'), r.dueDate ? formatDate(String(r.dueDate), false) : 'Tarih belirlenmedi'])
  const roadmapRows = [...roadmap('now'), ...roadmap('next'), ...roadmap('later')]
  const stop = p.limits.stopRules?.map((r) => r.rule).filter((r) => text(r) !== null) ?? []
  const modelRows = Object.values(STEPS).filter((s) => p.steps[s.id]?.status === 'tamam' && s.models.length).map((s) => [s.id + '. ' + s.title, String(s.models.length)])
  const profileLines = [
    labelled('Başarı cümlesi', p.limits.successSentence),
    money('Toplam harcama sınırı', p.limits.budgetKurus),
    p.limits.deadline ? `Bitiş: ${formatDate(p.limits.deadline, false)}.` : 'Bitiş tarihi henüz yazılmadı.',
    p.limits.retriesPerDecision ? `Karar başına ${p.limits.retriesPerDecision} deneme.` : 'Karar başına deneme sayısı henüz yazılmadı.',
    ...(stop.length ? stop.map((r) => `Durdurma kuralı: ${r}`) : ['Durdurma kuralı yazılmadı.']),
  ]
  const profileFacts: Fact[] = [
    factOf(profileLines[0]),
    factOf(profileLines[1]),
    { title: 'Bitiş', value: p.limits.deadline ? formatDate(p.limits.deadline, false) : 'Henüz yazılmadı' },
    { title: 'Deneme hakkı', value: p.limits.retriesPerDecision ? `Karar başına ${p.limits.retriesPerDecision}` : 'Henüz yazılmadı' },
    { title: 'Durdurma kuralı', value: stop.length ? stop.join(' ') : 'Yazılmadı' },
  ]
  return {
    title: 'Girişimci aksiyon planı',
    stamp: stampOf(p),
    meta: metaLines(p),
    facts: metaFacts(p),
    sections: [
      { title: 'Profil ve sınırlar', lines: profileLines, facts: profileFacts },
      { title: 'İlk iş ve engel', lines: openTasks.length ? [`${openTasks[0].action}. Sorumlu: ${openTasks[0].owner ?? 'eksik'}. Tarih: ${openTasks[0].dueDate ? formatDate(openTasks[0].dueDate, false) : 'belirlenmedi'}.`] : ['Açık iş yok. Sıradaki adımı doldurun.'] },
      { title: 'Yapılacak adımlar', lines: [], table: { head: ['Adım', 'Ad', 'Tür', 'Durum'], rows: stepRows } },
      { title: '90 günlük çalışma', lines: roadmapRows.length ? ['Şimdi kutusu ilk 90 gündür.'] : ['Yol haritası henüz yazılmadı. Adım 19’da işleri yazın.'], table: roadmapRows.length ? { head: ['İş', 'Sorumlu', 'Tarih'], rows: roadmapRows } : undefined },
      {
        title: 'Doldurulmuş kayıtlar',
        lines: [
          ...problemLines(p, 'Problem cümlesi'),
          labelled('Değer önerisi', v(p, '13', 'sentence')),
          labelled('Seçilen yol', v(p, '19', 'chosenPath')),
          ...DECISIONS.map((d) => { const ld = lastDecision(p, d.n); return `Kapı ${d.n}: ${ld ? OUTCOME_LABEL[effectiveOutcome(ld)] + '. ' + ld.reason : 'karar yok'}` }),
        ],
      },
      {
        title: 'Sonraki karar',
        lines: DECISIONS.filter((d) => !lastDecision(p, d.n)).slice(0, 1).map((d) => `Sıradaki kapı: Kapı ${d.n}. ${d.gate.title}`).concat(p.decisions.filter((d) => d.conditional && !d.conditional.closedAt).map((d) => `Koşullu izin bitişi: ${formatDate(d.conditional!.deadline, false)}. Kapanış kanıtı: ${d.conditional!.closingEvidence}.`)),
      },
      {
        title: 'Kullanılan modeller',
        lines: modelRows.length ? [] : ['Henüz tamamlanan adım yok. Adımlar bitince kullanılan modeller burada listelenir.'],
        table: modelRows.length ? { head: ['Adım', 'Model sayısı'], rows: modelRows } : undefined,
      },
    ],
  }
}

export function reportToMarkdown(r: Report): string {
  const out: string[] = [`# ${r.title}`, '']
  if (r.stamp) out.push(`**${r.stamp}**`, '')
  out.push(...r.meta.map((m) => `- ${m}`), '')
  for (const s of r.sections) {
    out.push(`## ${s.title}`, '')
    for (const l of s.lines) out.push(l, '')
    if (s.table && s.table.rows.length) {
      out.push(`| ${s.table.head.join(' | ')} |`, `|${s.table.head.map(() => '---').join('|')}|`)
      for (const row of s.table.rows) out.push(`| ${row.map((c) => String(c).replace(/\|/g, '/')).join(' | ')} |`)
      out.push('')
    }
  }
  return out.join('\n')
}
