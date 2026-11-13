/**
 * İki belge aynı veriden üretilir. Yönetici raporu ve girişimci aksiyon planı.
 * Eksik bilgi uydurulmaz. "Bilinmiyor" veya "Tarih belirlenmedi" yazılır.
 */
import type { Measure, PlanDoc } from '@/data/types'
import { OUTCOME_LABEL } from '@/data/types'
import { DECISIONS } from '@/data/decisions'
import { STEPS, stepsOf } from '@/data/registry'
import { stepApplies } from '@/engine/conditions'
import { effectiveOutcome, lastDecision } from '@/engine/gate'
import { formatDate, formatMoney, formatNumber } from '@/engine/format'

export interface ReportSection {
  title: string
  lines: string[]
  table?: { head: string[]; rows: string[][] }
}
export interface Report {
  title: string
  /** Örnek planda rapor başına basılan uyarı. Gerçek planda yoktur. */
  stamp?: string
  meta: string[]
  sections: ReportSection[]
}

export const EXAMPLE_STAMP = 'Örnek plan. Gerçek veri değildir.'
const stampOf = (p: PlanDoc): string | undefined => (p.example ? EXAMPLE_STAMP : undefined)

const v = (p: PlanDoc, s: string, k: string): unknown => p.steps[s]?.values?.[k]
const str = (x: unknown, fallback = 'Bilinmiyor'): string => (typeof x === 'string' && x.trim() ? x : typeof x === 'number' ? String(x) : fallback)
const rows = (p: PlanDoc, s: string, k: string): Record<string, unknown>[] => (v(p, s, k) as Record<string, unknown>[]) ?? []
const measureText = (m?: Measure): string => {
  if (!m) return 'Ölçü tanımlanmadı'
  if (m.status === 'bilinmiyor') return `${m.name || 'Ölçü'}: bilinmiyor`
  if (m.status === 'uygulanmiyor') return `${m.name || 'Ölçü'}: uygulanmıyor. ${m.naReason ?? ''}`
  return `${m.name || 'Ölçü'}: ${formatNumber(m.value, m.unit)}. Eşik ${formatNumber(m.threshold, m.unit)}${m.isGuess ? ' (ilk tahmin)' : ''}.`
}

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

export function buildExecutiveReport(p: PlanDoc): Report {
  const latest = [...p.decisions].sort((a, b) => b.decidedAt.localeCompare(a.decidedAt))[0]
  const runway = runwayMonths(p)
  const pays = rows(p, '16', 'paymentDays')
  const firstGap = pays.find((d) => Number(d.balanceAfterKurus ?? 0) < 0)
  const risks = rows(p, '17', 'risks').filter((r) => Number(r.likelihood ?? 0) * Number(r.impact ?? 0) >= 6)
  const openTasks = p.tasks.filter((t) => t.status === 'acik' || t.status === 'taslak')
  const summary: string[] = [
    latest ? `Son kapı: Kapı ${latest.gate}. Sonuç: ${OUTCOME_LABEL[effectiveOutcome(latest)]}. Tarih: ${formatDate(latest.decidedAt)}.` : 'Henüz kapı kararı yok.',
    `Pist: ${runway !== null ? runway + ' ay' : 'hesaplanmadı'}. Toplam harcama sınırı: ${formatMoney(p.limits.budgetKurus)}.`,
    firstGap ? `İlk kasa açığı: ${formatDate(String(firstGap.date), false)}. Eksik: ${formatMoney(Math.abs(Number(firstGap.balanceAfterKurus)))}.` : 'Kayıtlı ödeme gününde kasa açığı yok.',
    risks.length ? `${risks.length} kritik risk var. En önemlisi: ${str(risks[0].risk)}.` : 'Kritik risk kaydı yok.',
    openTasks.length ? `Sıradaki iş: ${openTasks[0].action}${openTasks[0].owner ? ' (' + openTasks[0].owner + ')' : ''}.` : 'Açık iş yok.',
  ]
  const journey = DECISIONS.map((d) => {
    const ld = lastDecision(p, d.n)
    return [String(d.n), d.title, ld ? OUTCOME_LABEL[effectiveOutcome(ld)] : 'Karar yok', ld ? formatDate(ld.decidedAt, false) : '']
  })
  return {
    title: 'Yönetici raporu',
    stamp: stampOf(p),
    meta: [`Plan: ${p.name}`, `Profil: ${profileSentence(p)}`, `Sürüm ${p.revision}`, `Oluşturma: ${formatDate(new Date().toISOString())}`],
    sections: [
      { title: 'Yönetici özeti', lines: summary },
      { title: 'Karar yolculuğu', lines: [], table: { head: ['Karar', 'Konu', 'Sonuç', 'Tarih'], rows: journey } },
      {
        title: 'Sorun ve talep',
        lines: [
          `Problem: ${str(v(p, '05', 'who'))}, ${str(v(p, '05', 'context'))}, ${str(v(p, '05', 'job'))}. Engel: ${str(v(p, '05', 'obstacle'))}.`,
          `Görüşme sayısı: ${rows(p, '06', 'interviews').length}. Problemi tanıyan: ${rows(p, '06', 'interviews').filter((x) => x.recognizes === true).length}.`,
          measureText(v(p, '07', 'repeatMeasure') as Measure), measureText(v(p, '07', 'effortMeasure') as Measure), measureText(v(p, '07', 'lossMeasure') as Measure),
          `Teklif sayısı: ${rows(p, '15', 'offers').length}. Güçlü taahhüt (1 ile 3. basamak): ${rows(p, '15', 'offers').filter((o) => Number(o.ladder) <= 3).length}.`,
        ],
      },
      {
        title: 'Kaynak ve risk',
        lines: [
          `Orta durumda katkı payı: ${formatMoney(v(p, '16', 'contributionMid') as number)}.`,
          `Aylık gider: ${formatMoney(p.limits.monthlyBurnKurus)}. Nakit: ${formatMoney(p.limits.cashKurus)}.`,
          ...(risks.length ? risks.map((r) => `Risk: ${str(r.risk)}. Tetikleyici: ${str(r.trigger)}. Yanıt: ${str(r.response)}. Sahip: ${str(r.owner)}.`) : ['Kritik risk yok.']),
        ],
      },
      {
        title: 'Teslim ve tekrar',
        lines: [
          measureText(v(p, '22', 'measure1') as Measure), measureText(v(p, '22', 'measure2') as Measure), measureText(v(p, '22', 'measure3') as Measure),
          `Fayda: ${measureText(v(p, '22', 'benefitMeasure') as Measure)}`,
          `Uyum işareti: ${str(v(p, '28', 'signal'), 'ölçülmedi')}.`,
          `Ömür değeri bölü kazanma maliyeti: ${(() => { const l = Number(v(p, '29', 'ltvKurus') ?? 0), c = Number(v(p, '29', 'cacKurus') ?? 0); return l && c ? (l / c).toFixed(2) : 'hesaplanamaz' })()}.`,
        ],
      },
      {
        title: 'Açık karar ve gelecek',
        lines: [
          `Seçilen yol: ${str(v(p, '18', 'chosenPath'))}. Vazgeçilenler: ${str(v(p, '18', 'givenUp'))}.`,
          `İşin yönü: ${str(v(p, '33', 'direction'), 'seçilmedi')}.`,
          ...(latest?.counterView ? [`Karşı görüş: ${latest.counterView}`] : []),
          ...(latest?.reopenWhen ? [`Yeniden açılma koşulu: ${latest.reopenWhen}`] : []),
        ],
        table: openTasks.length ? { head: ['İş', 'Sorumlu', 'Tarih'], rows: openTasks.map((t) => [t.action, t.owner ?? 'Eksik', t.dueDate ? formatDate(t.dueDate, false) : 'Tarih belirlenmedi']) } : undefined,
      },
      {
        title: 'Kanıt eki',
        lines: [`${p.evidence.length} kanıt kayıtlı.`],
        table: { head: ['Kanıt', 'Tür', 'Basamak', 'Tarih', 'Kaynak'], rows: p.evidence.map((e) => [e.title, e.kind, String(e.ladder), formatDate(e.date, false), e.source ?? '']) },
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
  const roadmap = (k: string) => rows(p, '19', k).map((r) => [str(r.action), str(r.owner, 'Eksik'), r.dueDate ? formatDate(String(r.dueDate), false) : 'Tarih belirlenmedi'])
  const stop = p.limits.stopRules?.map((r) => r.rule) ?? []
  return {
    title: 'Girişimci aksiyon planı',
    stamp: stampOf(p),
    meta: [`Plan: ${p.name}`, `Profil: ${profileSentence(p)}`, `Sürüm ${p.revision}`, `Oluşturma: ${formatDate(new Date().toISOString())}`],
    sections: [
      {
        title: 'Profil ve sınırlar',
        lines: [
          `Başarı cümlesi: ${str(p.limits.successSentence)}.`,
          `Toplam harcama sınırı ${formatMoney(p.limits.budgetKurus)}. Bitiş ${formatDate(p.limits.deadline, false)}. Karar başına ${p.limits.retriesPerDecision ?? 'yazılmadı'} deneme.`,
          ...(stop.length ? stop.map((r) => `Durdurma kuralı: ${r}`) : ['Durdurma kuralı yazılmadı.']),
        ],
      },
      { title: 'İlk iş ve engel', lines: openTasks.length ? [`${openTasks[0].action}. Sorumlu: ${openTasks[0].owner ?? 'eksik'}. Tarih: ${openTasks[0].dueDate ? formatDate(openTasks[0].dueDate, false) : 'belirlenmedi'}.`] : ['Açık iş yok. Sıradaki adımı doldurun.'] },
      { title: 'Yapılacak adımlar', lines: [], table: { head: ['Adım', 'Ad', 'Tür', 'Durum'], rows: stepRows } },
      { title: '90 günlük çalışma', lines: ['Şimdi kutusu ilk 90 gündür.'], table: { head: ['İş', 'Sorumlu', 'Tarih'], rows: [...roadmap('now'), ...roadmap('next'), ...roadmap('later')] } },
      {
        title: 'Doldurulmuş kayıtlar',
        lines: [
          `Problem cümlesi: ${str(v(p, '05', 'who'))}, ${str(v(p, '05', 'context'))}, ${str(v(p, '05', 'job'))}. Engel: ${str(v(p, '05', 'obstacle'))}.`,
          `Değer önerisi: ${str(v(p, '13', 'sentence'))}.`,
          `Seçilen yol: ${str(v(p, '18', 'chosenPath'))}.`,
          ...DECISIONS.map((d) => { const ld = lastDecision(p, d.n); return `Kapı ${d.n}: ${ld ? OUTCOME_LABEL[effectiveOutcome(ld)] + '. ' + ld.reason : 'karar yok'}` }),
        ],
      },
      {
        title: 'Sonraki karar',
        lines: DECISIONS.filter((d) => !lastDecision(p, d.n)).slice(0, 1).map((d) => `Sıradaki kapı: Kapı ${d.n}. ${d.gate.title}`).concat(p.decisions.filter((d) => d.conditional && !d.conditional.closedAt).map((d) => `Koşullu izin bitişi: ${formatDate(d.conditional!.deadline, false)}. Kapanış kanıtı: ${d.conditional!.closingEvidence}.`)),
      },
      {
        title: 'Kullanılan modeller',
        lines: [],
        table: { head: ['Adım', 'Model sayısı'], rows: Object.values(STEPS).filter((s) => p.steps[s.id]?.status === 'tamam' && s.models.length).map((s) => [s.id + '. ' + s.title, String(s.models.length)]) },
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
    if (s.table) {
      out.push(`| ${s.table.head.join(' | ')} |`, `|${s.table.head.map(() => '---').join('|')}|`)
      for (const row of s.table.rows) out.push(`| ${row.map((c) => String(c).replace(/\|/g, '/')).join(' | ')} |`)
      out.push('')
    }
  }
  return out.join('\n')
}
