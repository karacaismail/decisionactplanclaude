import { DECISIONS } from './decisions'
import type { PlanDoc } from './types'

/**
 * Stratejik planlamadan önce elde olması gereken 20 temel soru.
 * Her taş bir soruya cevap verir ve bir adıma bağlıdır.
 */
export type StoneStatus = 'var' | 'eksik' | 'zayif'

export interface StoneDef {
  no: number
  title: string
  question: string
  example: string
  step: string
  group: 'Kurucu ve sınır' | 'Müşteri ve sorun' | 'Çözüm ve değer' | 'Talep ve para' | 'Risk ve kayıt'
  /** true: var, false: eksik, null: henüz yazılmadı. */
  check: (p: PlanDoc) => boolean | null
}

export interface StoneState extends StoneDef {
  status: StoneStatus
  /** 0 ile 100 arası. Adıma bağlı en güçlü kanıtın basamağından hesaplanır. */
  strength: number
  evidenceCount: number
}

const v = (p: PlanDoc, step: string, key: string): unknown => p.steps[step]?.values?.[key]
const rows = (p: PlanDoc, step: string, key: string): Record<string, unknown>[] => (v(p, step, key) as Record<string, unknown>[]) ?? []
const filled = (x: unknown): boolean => (typeof x === 'string' ? x.trim().length > 0 : Array.isArray(x) ? x.length > 0 : x !== null && x !== undefined && x !== false)
const crit = (p: PlanDoc, gate: number, id: string): boolean | null => DECISIONS.find((d) => d.n === gate)?.gate.criteria.find((c) => c.id === id)?.check(p) ?? null
const has = (p: PlanDoc, step: string, key: string): boolean | null => (p.steps[step] ? filled(v(p, step, key)) : null)
const done = (p: PlanDoc, step: string): boolean | null => (p.steps[step] ? p.steps[step].status === 'tamam' : null)

export const STONES: StoneDef[] = [
  { no: 1, group: 'Kurucu ve sınır', title: 'Kurucu niyeti', question: 'Bu işi neden yapıyorsunuz? Nereye varmak istiyorsunuz?', example: '"Kendi işimi kurmak istiyorum. 5 yıl işleteceğim."', step: '01', check: (p) => crit(p, 1, 'niyet') },
  { no: 2, group: 'Kurucu ve sınır', title: 'Kaynak sınırı', question: 'En çok ne kadar para ve zaman harcayacaksınız?', example: '150.000 TL ve 3 ay.', step: '02', check: (p) => (p.steps['02'] || p.limits.budgetKurus ? Boolean(p.limits.budgetKurus && p.limits.deadline && p.limits.retriesPerDecision) : null) },
  { no: 3, group: 'Kurucu ve sınır', title: 'Durdurma kuralları', question: 'Hangi bulgu sizi durdurur?', example: '"20 görüşmede 3 kişiden azı sorunu yaşıyorsa dururum."', step: '02', check: (p) => (p.steps['02'] || p.limits.stopRules ? (p.limits.stopRules?.length ?? 0) >= 3 : null) },
  { no: 4, group: 'Kurucu ve sınır', title: 'Karar hakkı', question: 'Kararı kim verir? Kim itiraz eder?', example: 'Ayşe karar verir. Eşi kirayı birlikte imzalar.', step: '03', check: (p) => (p.profile.team === 'ekip' ? crit(p, 1, 'hak') : p.profile.team ? true : null) },
  { no: 5, group: 'Kurucu ve sınır', title: 'Dış çevre ve izin', question: 'Hangi izin gerekir? Dışarıda ne değişiyor?', example: 'İşyeri ruhsatı gerekir.', step: '04', check: (p) => done(p, '04') },
  { no: 6, group: 'Müşteri ve sorun', title: 'Sorun tanımı', question: 'Kim, hangi durumda, hangi işi bitiremiyor?', example: 'Sabah işe giden komşular kahve alamıyor.', step: '05', check: (p) => done(p, '05') },
  { no: 7, group: 'Müşteri ve sorun', title: 'Sorun kanıtı', question: 'Sorunu sayıyla gösterebiliyor musunuz?', example: '15 görüşmede 13 kişi sorunu yaşıyor.', step: '07', check: (p) => { const a = crit(p, 2, 'tanima'), b = crit(p, 2, 'kanit'); return a === false || b === false ? false : a === true && b === true ? true : null } },
  { no: 8, group: 'Müşteri ve sorun', title: 'İlk müşteri grubu', question: 'Sorunu en çok yaşayan ve en kolay ulaşılan grup kim?', example: 'Sabah 7 ile 9 arası duraktan geçenler.', step: '08', check: (p) => crit(p, 2, 'segment') },
  { no: 9, group: 'Müşteri ve sorun', title: 'Ulaşılabilir pazar', question: 'Gerçekte kaç müşteriye ulaşabilirsiniz?', example: 'Mahallede 2.400 kişi. Hedef 350 düzenli müşteri.', step: '09', check: (p) => crit(p, 3, 'pazar') },
  { no: 10, group: 'Müşteri ve sorun', title: 'Rakip ve bugünkü çözüm', question: 'Müşteri bugün ne yapıyor? Rakip kim?', example: 'Evde kahve yapıyor. En yakın kafe 1,2 km uzakta.', step: '09', check: (p) => (p.steps['09'] ? rows(p, '09', 'competitors').length >= 2 : null) },
  { no: 11, group: 'Çözüm ve değer', title: 'Seçenekler ve yol adayları', question: 'Sorunu çözmenin ve işi kurmanın kaç yolu var?', example: 'Çözüm: küçük kafe ya da kahve arabası. Yol: durakta satış ya da ön siparişle kart.', step: '18', check: (p) => { const a = crit(p, 3, 'secenek'), b = crit(p, 5, 'yol'); return a === false || b === false ? false : a === true && b === true ? true : null } },
  { no: 12, group: 'Çözüm ve değer', title: 'Yapılabilirlik', question: 'Seçilen yolu gerçekten yapabilir misiniz?', example: 'Barista var. Makine kiralanabilir.', step: '12', check: (p) => crit(p, 3, 'beceri') },
  { no: 13, group: 'Çözüm ve değer', title: 'Değer önerisi', question: 'Müşteriye ne vaat ediyorsunuz? Tek cümle.', example: '"Sabah 6.30\'da, yürüme mesafesinde taze kahve."', step: '13', check: (p) => done(p, '13') },
  { no: 14, group: 'Talep ve para', title: 'Bağlılık işareti', question: 'Bir müşteri sözden öte ne yaptı?', example: '7 kişi aylık kahve kartına ön ödeme yaptı.', step: '15', check: (p) => crit(p, 4, 'esik') },
  { no: 15, group: 'Talep ve para', title: 'Fiyat kanıtı', question: 'Müşteri bu fiyata razı mı?', example: 'Kart 600 TL\'ye satıldı. 14 kişiden 7\'si aldı.', step: '15', check: (p) => (p.steps['15'] ? Number(v(p, '15', 'priceOfferedKurus') ?? 0) > 0 && Number(v(p, '15', 'priceAcceptedCount') ?? 0) >= 1 : null) },
  { no: 16, group: 'Talep ve para', title: 'İlk para hesabı', question: 'Bir satıştan ne kalıyor? Kaç satış gideri karşılar?', example: 'Kahve 80 TL, maliyeti 30 TL. Günde 40 kahve gerekir.', step: '16', check: (p) => crit(p, 5, 'plan') },
  { no: 17, group: 'Talep ve para', title: 'Nakit ve kasa süresi', question: 'Kasadaki para kaç ay yeter?', example: '240.000 TL var. Aylık gider 30.000 TL. Kasa süresi 8 ay.', step: '16', check: (p) => { const a = crit(p, 5, 'kasa'), b = crit(p, 5, 'pist'); return a === false || b === false ? false : a === true && b === true ? true : null } },
  { no: 18, group: 'Risk ve kayıt', title: 'Varsayım haritası', question: 'Hangi varsayım yanlış çıkarsa iş çöker?', example: '"Öğlen de müşteri gelir." Henüz denenmedi.', step: '10', check: (p) => (p.steps['10'] ? rows(p, '10', 'assumptions').filter((a) => filled(a.assumption)).length >= 3 : null) },
  { no: 19, group: 'Risk ve kayıt', title: 'Risk ve kural', question: 'İşi bitirebilecek tehlikeler için kural var mı?', example: '"Ruhsat 30 günde çıkmazsa dururum."', step: '17', check: (p) => crit(p, 5, 'risk') },
  { no: 20, group: 'Risk ve kayıt', title: 'Kanıt ve karar kaydı', question: 'Her bulgunun kaynağı ve her kararın gerekçesi yazılı mı?', example: 'Görüşme defteri, banka dekontu, kontrol kararları.', step: '15', check: (p) => (p.evidence.length === 0 && p.decisions.length === 0 ? null : p.evidence.length >= 3 && p.decisions.length >= 1) },
]

/** Basamak 1 en güçlü (100), basamak 7 en zayıf kanıttır. */
function ladderStrength(ladder: number): number {
  return Math.round(((8 - Math.min(7, Math.max(1, ladder))) / 7) * 100)
}

export function evaluateStones(plan: PlanDoc): StoneState[] {
  return STONES.map((s) => {
    const linked = plan.evidence.filter((e) => e.linkedSteps.includes(s.step))
    const best = linked.length ? Math.min(...linked.map((e) => e.ladder)) : null
    const strength = best === null ? 0 : ladderStrength(best)
    const met = s.check(plan)
    // Var ama dayanağı zayıf: adıma bağlı kanıt yok ya da kanıt 4. basamaktan zayıf.
    const status: StoneStatus = met !== true ? 'eksik' : best !== null && best <= 4 ? 'var' : 'zayif'
    return { ...s, status, strength, evidenceCount: linked.length }
  })
}

export function has_(p: PlanDoc, step: string, key: string): boolean | null {
  return has(p, step, key)
}
