import { describe, expect, it } from 'vitest'
import { emptyPlan, type TransitionRecord } from '@/data/types'
import { buildDemoPlan } from '@/data/demo'
import { EXAMPLE_STAMP } from './build'
import { FOUNDATION_QUESTIONS, NOT_WRITTEN, buildFoundationDoc, foundationToMarkdown, remainingTimeLine, sourceLine } from './foundation'

const transition = (patch: Partial<TransitionRecord> = {}): TransitionRecord => ({
  id: 'gecis-1',
  outcome: 'hazir',
  suggested: 'hazir',
  reason: 'Dokuz zorunlu ölçüt tamam.',
  decidedBy: 'Ayşe',
  decidedAt: '2026-11-02T10:00:00.000Z',
  reviewed: true,
  mandatoryMet: 9,
  mandatoryTotal: 9,
  supportingMet: 4,
  supportingTotal: 6,
  level: 5,
  revision: 6,
  ...patch,
})

describe('buildFoundationDoc', () => {
  it('boş planda altı soruyu sırayla yazar ve her cevap "Henüz yazılmadı." olur', () => {
    const doc = buildFoundationDoc(emptyPlan('p1', 'Boş plan'))
    expect(doc.answers.map((a) => a.question)).toEqual([...FOUNDATION_QUESTIONS])
    expect(doc.answers).toHaveLength(6)
    for (const a of doc.answers) {
      expect(a.lines, a.question).toEqual([NOT_WRITTEN])
      expect(a.sources, a.question).toEqual([])
      expect(a.empty).toBe(true)
    }
    expect(doc.transition).toBeUndefined()
    expect(doc.stamp).toBeUndefined()
    expect(doc.openItems).toContain('Geçiş kararı henüz kaydedilmedi.')
    expect(doc.openItems.length).toBeGreaterThanOrEqual(6)
  })

  it('örnek planda en az üç soruya gerçek içerik ve en az bir kaynak yazar', () => {
    const plan = buildDemoPlan()
    const doc = buildFoundationDoc(plan)
    const real = doc.answers.filter((a) => !a.empty && !a.lines.includes(NOT_WRITTEN))
    expect(real.length).toBeGreaterThanOrEqual(3)
    expect(doc.answers.flatMap((a) => a.sources).length).toBeGreaterThanOrEqual(1)
    expect(doc.stamp).toBe(EXAMPLE_STAMP)
    // Cevaplar plan verisinden gelir. Uydurma yoktur.
    expect(doc.answers[0].lines.join(' ')).toContain('Mahallede oturan çalışan ve öğrenci')
    expect(doc.answers[1].lines.join(' ')).toContain('Teklifi gören: 14 kişi. Kabul eden: 11 kişi.')
    expect(doc.answers[1].lines.join(' ')).toContain('Eşik: 10 taahhüt.')
    expect(doc.answers[2].lines.join(' ')).toContain('Küçük kafe')
    // Kaynak satırı kanıt defterinden gelir: başlık, tarih ve basamak.
    const source = doc.answers[1].sources[0]
    expect(source.text).toBe('7 kişi aylık kahve kartına ödeme yaptı')
    expect(source.ladder).toBe(1)
    expect(source.date).toMatch(/ günü$/)
    expect(sourceLine(source)).toMatch(/^Kaynak: 7 kişi aylık kahve kartına ödeme yaptı, .+ günü\. Kanıt basamağı 1\.$/)
  })

  it('kaynak yalnız adımı eşleşen kanıttan gelir', () => {
    const plan = emptyPlan('p2', 'Kaynak denemesi')
    plan.steps['05'] = { values: { problemWho: 'Bakkal', problemJob: 'Günlük satışı görmek' }, status: 'taslak', updatedAt: '2026-10-01T10:00:00.000Z' }
    plan.evidence.push({ id: 'k1', title: 'Kasa defteri fotoğrafı', kind: 'gozlem', ladder: 3, date: '2026-09-12', linkedSteps: ['05'], createdAt: '2026-09-12T10:00:00.000Z', updatedAt: '2026-09-12T10:00:00.000Z' })
    plan.evidence.push({ id: 'k2', title: 'Banka dekontu', kind: 'gozlem', ladder: 1, date: '2026-10-03', linkedSteps: ['15'], createdAt: '2026-10-03T10:00:00.000Z', updatedAt: '2026-10-03T10:00:00.000Z' })
    const doc = buildFoundationDoc(plan)
    expect(doc.answers[0].lines[0]).toBe('Kim: Bakkal. İş: Günlük satışı görmek.')
    expect(doc.answers[0].sources).toEqual([{ text: 'Kasa defteri fotoğrafı', date: '12 Eylül 2026 Cumartesi günü', ladder: 3 }])
    expect(doc.answers[1].sources.map((s) => s.text)).toEqual(['Banka dekontu'])
    // Teklif defteri boş. Kanıt olsa da cevap uydurulmaz.
    expect(doc.answers[1].lines).toEqual([NOT_WRITTEN])
  })

  it('"Neyi hâlâ bilmiyoruz?" en etkili üç açık varsayımı yazar, doğrulananı yazmaz, kalanın sayısını söyler', () => {
    const plan = emptyPlan('p6', 'Varsayım denemesi')
    const row = (n: number, impact: number, status?: string) => ({ _id: `v${n}`, assumption: `Varsayım ${n}`, impact, status })
    plan.steps['10'] = { values: { assumptions: [row(1, 2), row(2, 5), row(3, 4, 'curudu'), row(4, 5, 'dogrulandi'), row(5, 3), row(6, 1)] }, status: 'tamam', updatedAt: '2026-10-01T10:00:00.000Z' }
    plan.steps['17'] = { values: { risks: [{ _id: 'r1', risk: 'Kira artar.', likelihood: 3, impact: 3, response: 'Sözleşmeyi 2 yıl yaparım.' }, { _id: 'r2', risk: 'Küçük risk', likelihood: 1, impact: 2 }] }, status: 'tamam', updatedAt: '2026-10-01T10:00:00.000Z' }
    const lines = buildFoundationDoc(plan).answers[4].lines
    expect(lines.slice(0, 4)).toEqual(['Denenmeyen varsayım: Varsayım 2.', 'Çürüyen varsayım: Varsayım 3.', 'Denenmeyen varsayım: Varsayım 5.', "2 açık varsayım daha var. Tamamı Adım 10'da yazar."])
    expect(lines.join(' ')).not.toContain('Varsayım 4')
    // Yalnız kritik risk yazılır. Cümle sonunda çift nokta olmaz.
    expect(lines).toContain('Risk: Kira artar. Yanıt: Sözleşmeyi 2 yıl yaparım.')
    expect(lines.join(' ')).not.toContain('Küçük risk')
  })

  it('"Kararı kim verecek?" karar sahibini, kalan bütçeyi, kalan süreyi ve geçiş kararını yazar', () => {
    const plan = emptyPlan('p3', 'Karar denemesi')
    plan.limits = { budgetKurus: 15_000_000, deadline: '2026-12-31' }
    plan.steps['03'] = { values: { rights: [{ _id: 'h1', gate: '5', owner: 'Ayşe' }] }, status: 'tamam', updatedAt: '2026-10-01T10:00:00.000Z' }
    plan.transitions = [transition()]
    const doc = buildFoundationDoc(plan, new Date('2026-11-14T10:00:00'))
    const lines = doc.answers[5].lines
    expect(lines).toContain('Karar sahibi: Ayşe.')
    expect(lines).toContain('Kalan bütçe: 150.000,00 TL.')
    expect(lines).toContain('Kalan süre: 47 gün, yaklaşık 6 hafta. Bitiş tarihi 31 Aralık 2026 Perşembe günü.')
    expect(lines.some((l) => l.startsWith('Son geçiş kararı: Planlamaya hazır. Gerekçe: Dokuz zorunlu ölçüt tamam.'))).toBe(true)
    expect(doc.transition?.label).toBe('Planlamaya hazır')
    expect(doc.transition?.decidedBy).toBe('Ayşe')
    expect(doc.openItems).not.toContain('Geçiş kararı henüz kaydedilmedi.')
  })

  it('koşullu ve eskimiş geçiş kararında konu, açık soru ve uyarı yazar', () => {
    const plan = emptyPlan('p4', 'Koşullu deneme')
    plan.transitions = [transition({ outcome: 'kosullu', stale: true, conditional: { topic: 'Yalnız sabah satışı', openQuestion: 'Öğlen müşteri gelir mi?', owner: 'Ayşe', deadline: '2026-12-01' } })]
    const doc = buildFoundationDoc(plan, new Date('2026-11-14T10:00:00'))
    expect(doc.transition?.conditional?.deadline).toBe('1 Aralık 2026 Salı günü')
    expect(doc.transition?.lines).toContain('Planlanacak konu: Yalnız sabah satışı.')
    expect(doc.transition?.lines.some((l) => l.startsWith('Bu karar eskidi.'))).toBe(true)
    expect(doc.openItems.some((l) => l.startsWith('Açık soru: Öğlen müşteri gelir mi?'))).toBe(true)
  })
})

describe('remainingTimeLine', () => {
  it('bitiş tarihi yoksa satır yazmaz, geçmişse sürenin dolduğunu yazar', () => {
    expect(remainingTimeLine(undefined, new Date('2026-11-14T10:00:00'))).toBeNull()
    expect(remainingTimeLine('2026-11-01', new Date('2026-11-14T10:00:00'))).toBe('Süre doldu. Bitiş tarihi 1 Kasım 2026 Pazar günü idi.')
    expect(remainingTimeLine('2026-11-14', new Date('2026-11-14T10:00:00'))).toBe('Süre bugün doluyor. Bitiş tarihi 14 Kasım 2026 Cumartesi günü.')
    expect(remainingTimeLine('2026-11-20', new Date('2026-11-14T10:00:00'))).toBe('Kalan süre: 6 gün. Bitiş tarihi 20 Kasım 2026 Cuma günü.')
  })
})

describe('foundationToMarkdown', () => {
  it('altı soruyu, kaynakları, geçiş kararını ve örnek damgasını yazar', () => {
    const md = foundationToMarkdown(buildFoundationDoc(buildDemoPlan()))
    expect(md.startsWith('# Stratejik planlama temel belgesi')).toBe(true)
    expect(md).toContain(`**${EXAMPLE_STAMP}**`)
    for (const q of FOUNDATION_QUESTIONS) expect(md).toContain(`## ${q}`)
    expect(md).toContain('- Kaynak: 7 kişi aylık kahve kartına ödeme yaptı')
    expect(md).toContain('## Geçiş kararı')
  })

  it('boş planda "Henüz yazılmadı." ve açık kalanlar bölümü yazar', () => {
    const md = foundationToMarkdown(buildFoundationDoc(emptyPlan('p5', 'Boş')))
    expect(md.match(/- Henüz yazılmadı\./g)).toHaveLength(6)
    expect(md).toContain('Geçiş kararı henüz kaydedilmedi.')
    expect(md).toContain('## Açık kalanlar')
  })
})
