import { describe, expect, it } from 'vitest'
import { buildDemoPlan } from '@/data/demo'
import { emptyPlan } from '@/data/types'
import { NO_PATHS, buildHandoffReport, confidenceOf, handoffToMarkdown } from './handoff'

describe('buildHandoffReport', () => {
  it('boş planda uydurma yapmaz', () => {
    const r = buildHandoffReport(emptyPlan('p', 'Plan'))
    expect(r.question).toBe(NO_PATHS)
    expect(r.paths).toEqual([])
    expect(r.coverageFilled).toBe(0)
    expect(r.coverage).toHaveLength(14)
    expect(r.groups).toHaveLength(7)
    expect(r.crux).toBeNull()
    expect(r.conditions).toEqual([])
    expect(r.links).toEqual([])
    expect(r.groups.every((g) => g.claims.length === 0)).toBe(true)
    expect(handoffToMarkdown(r)).toContain('Henüz yazılmadı.')
  })

  it('örnek planda karar sorusu açık karar defterinden gelir', () => {
    const r = buildHandoffReport(buildDemoPlan())
    expect(r.question).toBe('Durakta mı satalım, ön siparişle mi teslim edelim?')
    expect(r.openDecisions.length).toBeGreaterThanOrEqual(2)
    expect(r.openDecisions[0].door).toBe('tekYonlu')
  })

  it('yolları yan yana verir; ilk yol bugünkü durumdur', () => {
    const r = buildHandoffReport(buildDemoPlan())
    expect(r.paths).toHaveLength(4)
    expect(r.paths[0].baseline).toBe(true)
    expect(r.paths.slice(1).every((p) => p.where && p.how && p.giveUp && p.cost && p.reversible)).toBe(true)
    expect(r.paths.every((p) => p.score !== null)).toBe(true)
  })

  it('her cümleye tür ve güven verir; kaynaklı cümlenin kaynağı vardır', () => {
    const r = buildHandoffReport(buildDemoPlan())
    const all = r.groups.flatMap((g) => g.claims)
    expect(all.length).toBeGreaterThan(8)
    for (const c of all.filter((x) => x.status === 'kaynakli')) expect(c.source).toBeTruthy()
    expect(all.some((c) => c.status === 'hesap')).toBe(true)
    expect(all.some((c) => c.status === 'karar')).toBe(true)
    expect(all.some((c) => c.status === 'varsayim')).toBe(true)
    expect(all.some((c) => c.counter)).toBe(true)
  })

  it('para hesabını kötü, orta ve iyi durumda verir', () => {
    const r = buildHandoffReport(buildDemoPlan())
    expect(r.sensitivity.map((s) => s.label)).toEqual(['Kötü durum', 'Orta durum', 'İyi durum'])
    expect(r.sensitivity.every((s) => s.breakEven.includes('sipariş'))).toBe(true)
  })

  it('verilmiş kararları ve sınırları ayırır', () => {
    const r = buildHandoffReport(buildDemoPlan())
    expect(r.locked).toHaveLength(5)
    expect(r.limits.some((l) => l.label === 'Pist')).toBe(true)
    expect(r.stopRules.length).toBeGreaterThanOrEqual(3)
    expect(r.redLines).toBeTruthy()
  })

  it('örnek planda 14 başlığın en az 12 tanesi doludur', () => {
    const r = buildHandoffReport(buildDemoPlan())
    expect(r.coverageFilled, r.coverage.filter((c) => c.status !== 'dolu').map((c) => `${c.no}:${c.status}`).join(' ')).toBeGreaterThanOrEqual(12)
  })

  it('kanıt silinince cümle varsayıma düşer', () => {
    const p = buildDemoPlan()
    p.evidence = []
    const r = buildHandoffReport(p)
    const first = r.groups[0].claims
    expect(first.every((c) => c.status === 'varsayim' && c.confidence === 'kanitsiz')).toBe(true)
  })

  it('Markdown beş bölümü ve iki eki içerir', () => {
    const md = handoffToMarkdown(buildHandoffReport(buildDemoPlan()))
    for (const h of ['## 1. Stratej bugün hangi kararı verecek?', '## 2. Dayanaklar', '## 3. Bağlayıcı sınırlar', '## 4. Karşılaştırılacak yollar', '## 5. Seçimi değiştirebilecek eksik bilgi', '## Ek 1. Kapsam', "## Ek 2. Stratej'in ilk günü"]) expect(md).toContain(h)
  })
})

describe('confidenceOf', () => {
  it('basamağı güvene çevirir', () => {
    expect(confidenceOf(1)).toBe('yuksek')
    expect(confidenceOf(3)).toBe('yuksek')
    expect(confidenceOf(4)).toBe('orta')
    expect(confidenceOf(6)).toBe('dusuk')
    expect(confidenceOf(null)).toBe('kanitsiz')
  })

  it('asıl engeli, başarı koşullarını ve yol bağlarını raporun başına koyar', () => {
    const r = buildHandoffReport(buildDemoPlan())
    expect(r.crux?.text).toBe('Aylık kart ilgisi, gideri karşılayan günlük satışa dönüşecek mi?')
    expect(r.crux?.support).toEqual(['7 kişi aylık kahve kartına ödeme yaptı'])
    expect(r.crux?.counter).toEqual(['Üç kişi fiyatı yüksek buldu.'])
    expect(r.conditions.map((c) => c.status)).toEqual(['sinanmadi', 'celiski', 'destek'])
    expect(r.conditions.map((c) => c.baseline)).toEqual(['Bilinmiyor', "14 teklifin 7'si", '0'])
    expect(r.links.filter((l) => l.relation === 'celisiyor')).toHaveLength(1)
    const md = handoffToMarkdown(r)
    expect(md.indexOf('### Asıl engel')).toBeGreaterThan(md.indexOf('## 1. Stratej bugün hangi kararı verecek?'))
    expect(md.indexOf('### Başarı neye bağlı?')).toBeLessThan(md.indexOf('## 2. Dayanaklar'))
    expect(md).toContain('Bulgular çelişiyor')
    expect(md).toContain('Yol bağları:')
  })

  it('serbest bütçeyi ve darboğazı sınırlara ekler', () => {
    const r = buildHandoffReport(buildDemoPlan())
    const free = r.limits.find((l) => l.label === 'Serbest bütçe')
    expect(free?.value).toContain('100.000')
    expect(r.limits.find((l) => l.label === 'Darboğaz')?.value).toBe('Tek barista sabah kuyruğuna yetişmez. Bugünkü sınır: Saatte 40 kahve')
  })

  it('kanıt silinince eksik bağlantıyı bildirir, uydurmaz', () => {
    const p = buildDemoPlan()
    p.evidence = p.evidence.filter((e) => e.id !== 'kanit-4')
    const r = buildHandoffReport(p)
    expect(r.crux?.support).toEqual([])
    expect(r.crux?.missing).toBe(1)
    expect(r.conditions[1].status).toBe('sinanmadi')
    expect(handoffToMarkdown(r)).toContain('1 bağlı kanıt silinmiş.')
  })

  it('iş türüne özgü bilgi yalnız ilgili profilde görünür', () => {
    const p = buildDemoPlan()
    expect(buildHandoffReport(p).groups.some((g) => g.title === 'İş türüne özgü bilgi')).toBe(false)
    p.profile.customer = 'pazarYeri'
    p.steps['15'].values = { ...p.steps['15'].values, validRequests: 20, matchedRequests: 8, registeredSellers: 60, activeSellers: 12 }
    const g = buildHandoffReport(p).groups.find((x) => x.title === 'İş türüne özgü bilgi')
    expect(g?.claims.map((c) => c.text)).toEqual(['20 geçerli talebin 8 tanesi uygun teklif aldı. Eşleşme oranı yüzde 40.', '60 kayıtlı satıcının 12 tanesi gerçek talebe cevap verdi.'])
  })
})
