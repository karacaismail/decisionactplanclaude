/**
 * Sekiz karar ve kapıları. Ölçütler adım alanlarını okur.
 * Alan adları docs/alan-sozlesmesi.md dosyasında yazılıdır.
 */
import type { DecisionDef, GateCriterion } from './schema'
import type { Measure, PlanDoc } from './types'

const v = (p: PlanDoc, step: string, key: string): unknown => p.steps[step]?.values?.[key]
const rows = (p: PlanDoc, step: string, key: string): Record<string, unknown>[] => (v(p, step, key) as Record<string, unknown>[]) ?? []
const filled = (x: unknown): boolean => (typeof x === 'string' ? x.trim().length > 0 : Array.isArray(x) ? x.length > 0 : x !== null && x !== undefined && x !== false)
const measure = (p: PlanDoc, step: string, key: string): Measure | undefined => v(p, step, key) as Measure | undefined
/** Ölçü eşiği geçti mi? Ölçülmediyse null. */
const measureMet = (m?: Measure): boolean | null => {
  if (!m || m.status !== 'olculdu' || m.value === null || m.value === undefined) return null
  if (m.threshold === null || m.threshold === undefined) return null
  return m.value >= m.threshold
}
const c = (id: string, label: string, check: GateCriterion['check'], hint?: string): GateCriterion => ({ id, label, check, hint })

export const DECISIONS: DecisionDef[] = [
  {
    n: 1,
    title: 'Yetki',
    question: 'Bu işi araştırmaya değer mi?',
    icon: 'briefcase',
    who: 'Kurucu. Ya da araştırma bütçesini yöneten kişi.',
    time: 'En çok 2 hafta.',
    intro: 'Ben kimim, bu işi neden yapıyorum, ne kadar harcayabilirim, kim karar verir? Bu dört soru burada cevaplanır.',
    example: 'Bir atölye sahibi "İkinci makineyi alalım mı?" diye sorar. İlk iş, siparişlerin hangi işlemde beklediğini ölçmektir. İşler paketlemede bekliyorsa ikinci makine teslim süresini kısaltmaz.',
    steps: ['00', '01', '02', '03', '04'],
    gate: {
      n: 1,
      title: 'Araştırmaya yetki var mı?',
      maxRetries: 1,
      criteria: [
        c('profil', 'Profil seçimleri yazıldı.', (p) => Boolean(p.profile.customer && p.profile.offering && p.profile.team && p.profile.funding && p.profile.market && p.profile.start)),
        c('niyet', 'Niyet, yön ve kurucu uyum kartı var.', (p) => filled(v(p, '01', 'whys')) && filled(v(p, '01', 'exitDirection')) && filled(v(p, '01', 'fitDomain'))),
        c('sinir', 'Durdurma kuralları, pist ve üç sınır yazıldı.', (p) => (p.limits.stopRules?.length ?? 0) >= 3 && Boolean(p.limits.budgetKurus && p.limits.deadline && p.limits.retriesPerDecision && p.limits.monthlyBurnKurus && p.limits.cashKurus)),
        c('hak', 'Ekip varsa karar hakları yazıldı.', (p) => (p.profile.team === 'ekip' ? rows(p, '03', 'rights').length > 0 : true)),
      ],
      rows: [
        { condition: 'Kurucu uyum puanı toplam 12 altında veya bir konuda 2 altında', outcome: 'yonDegistir', note: 'Adım 01\'e dönün. Önce 3 ay deneyim veya güçlü bir ortak.', applies: (p) => {
          const keys = ['fitDomain', 'fitStory', 'fitAccess', 'fitSkill']
          const vals = keys.map((k) => Number(v(p, '01', k) ?? 0))
          return vals.some((x) => x > 0) && (vals.reduce((a, b) => a + b, 0) < 12 || vals.some((x) => x > 0 && x < 2))
        } },
        { condition: 'Pist 3 aydan kısa ve ek gelir yok', outcome: 'beklet', note: 'Önce gelir bulun.', applies: (p) => {
          const burn = p.limits.monthlyBurnKurus, cash = p.limits.cashKurus
          return Boolean(burn && cash) && Math.floor((cash as number) / (burn as number)) < 3 && !v(p, '02', 'extraIncome')
        } },
        { condition: 'Durdurma kuralı veya pist eksik', outcome: 'yenidenDene', note: 'Bu iki şey olmadan Karar 2\'ye geçmeyin.', applies: (_p, cr) => cr.sinir === false },
        { condition: '4 ölçüt tamam', outcome: 'ilerle', note: 'Karar 2\'ye geçin.', applies: (_p, cr) => Object.values(cr).every((x) => x === true) },
      ],
    },
  },
  {
    n: 2,
    title: 'Sorun',
    question: 'Kimin hangi sorunu çözülmeye değer?',
    icon: 'users',
    who: 'Kurucu. Ya da kullanıcıyı gözleyebilen ekip üyesi.',
    time: '3 ile 6 hafta. Yeni pazarda 6 ile 8 hafta.',
    intro: 'Gerçek bir problem var mı? Kimin problemi? Ne kadar acıtıyor? Kullanıcıyı, ödeyeni ve onay vereni ayrı yazın.',
    example: 'Servise gelmeyen müşterinin gerekçesini, gelenlerin yorumundan çıkaramazsınız. Sorunu yaşamayan kişiyle de görüşün.',
    steps: ['05', '06', '07', '08'],
    gate: {
      n: 2,
      title: 'Problem doğrulandı mı?',
      maxRetries: 1,
      criteria: [
        c('tanima', 'Görüşülenlerin çoğu problemi tanıdı.', (p) => {
          const r = rows(p, '06', 'interviews')
          if (r.length === 0) return null
          const target = p.profile.customer === 'tuketici' ? 15 : p.profile.customer === 'kamu' ? 6 : 10
          const recognized = r.filter((x) => x.recognizes === true).length
          const need = p.profile.customer === 'tuketici' ? 9 : p.profile.customer === 'kamu' ? 4 : 6
          return r.length >= target && recognized >= need
        }, 'Tüketici 15 görüşmede 9. İşletme 10 görüşmede 6. Kamu 6 görüşmede 4.'),
        c('caba', 'Yeterli kişi bugün bu problem için para veya zaman harcıyor.', (p) => {
          const r = rows(p, '06', 'interviews')
          if (r.length === 0) return null
          const effort = r.filter((x) => x.spendsToday === true).length
          const need = p.profile.customer === 'kamu' ? 2 : p.profile.customer === 'tuketici' ? 5 : 3
          return effort >= need
        }, 'Tüketici 5 kişi. İşletme 3 işletme. Kamu 2 birim.'),
        c('kanit', 'Tekrar, çaba ve kayıp kanıtı ayrı ayrı ölçüldü.', (p) => {
          const ms = ['repeatMeasure', 'effortMeasure', 'lossMeasure'].map((k) => measure(p, '07', k))
          if (ms.some((m) => !m)) return null
          if (ms.some((m) => m?.status === 'bilinmiyor')) return null
          return ms.every((m) => m?.status === 'uygulanmiyor' || measureMet(m) !== false)
        }),
        c('segment', 'İlk segment kartı ve ulaşma yolu yazıldı.', (p) => filled(v(p, '08', 'behavior')) && filled(v(p, '08', 'accessPath'))),
      ],
      rows: [
        { condition: 'Tanıma var, kimse para veya zaman harcamıyor', outcome: 'beklet', note: 'Problem acil değil. 6 ay sonra yeniden bakın.', applies: (_p, cr) => cr.tanima === true && cr.caba === false },
        { condition: '4 ölçüt tamam', outcome: 'ilerle', applies: (_p, cr) => Object.values(cr).every((x) => x === true) },
        { condition: '2 veya 3 ölçüt tamam', outcome: 'yenidenDene', note: '5 ile 10 ek görüşme. En çok 2 hafta. En çok 1 deneme.', applies: (_p, cr) => Object.values(cr).filter((x) => x === true).length >= 2 && Object.values(cr).some((x) => x !== true) },
        { condition: '1 ölçüt tamam', outcome: 'yonDegistir', note: 'Adım 05\'e dönün. Problemi veya segmenti değiştirin.', applies: (_p, cr) => Object.values(cr).filter((x) => x === true).length === 1 && Object.values(cr).every((x) => x !== null) },
        { condition: 'Hiç ölçüt tamam değil', outcome: 'durdur', applies: (_p, cr) => Object.values(cr).every((x) => x === false) },
      ],
    },
  },
  {
    n: 3,
    title: 'Erişim ve seçenek',
    question: 'Bu kişilere ulaşabilir miyiz? Hangi seçenek daha uygun?',
    icon: 'map',
    who: 'Müşteriye ulaşacak kişi ve teslim sorumlusu.',
    time: '2 ile 3 hafta.',
    intro: 'Müşteriye ulaşma yolumuz var mı? Aynı problemi çözmenin kaç yolu var? Hangisini yapabiliriz?',
    example: 'Bölgede 40 okul bulunabilir. Ekibin ulaşabildiği ve satın alma yetkisi bulunan okullar ayrıca sayılır.',
    steps: ['09', '10', '11', '12'],
    gate: {
      n: 3,
      title: 'Erişim yolu ve uygulanabilir seçenek var mı?',
      maxRetries: 1,
      criteria: [
        c('erisim', 'İlk segmente ulaşma yolu yazıldı.', (p) => filled(v(p, '08', 'accessPath')) && filled(v(p, '09', 'reachNotes'))),
        c('secenek', 'Gerçekten farklı yollar var.', (p) => {
          const o = rows(p, '11', 'options').filter((x) => !x._fixed)
          const need = p.profile.smallReversible ? 1 : 3
          return o.length === 0 ? null : o.length >= need
        }, 'Ağır kararda üç yol. Küçük ve geri alınabilir işte bir alternatif.'),
        c('beceri', 'Kritik beceriler edinilebilir.', (p) => {
          const s = rows(p, '12', 'skills')
          if (s.length === 0) return p.profile.offering === 'dijital' && !p.profile.needsPremises ? true : null
          return s.every((x) => x.plan !== 'yok')
        }),
        c('pazar', 'Gerçekçi pazar başarı hedefini karşılıyor.', (p) => {
          const som = Number(v(p, '09', 'somCustomers') ?? 0)
          const target = Number(v(p, '09', 'targetCustomers') ?? 0)
          if (!som || !target) return null
          return som >= target
        }),
      ],
      rows: [
        { condition: 'Ortak gerekiyor ve ortak henüz yok', outcome: 'kosulluIlerle', note: 'Yalnız bağımsız hazırlık. Ortağın görevini ve taahhüdünü yazılı doğrulayın.', applies: (p) => rows(p, '12', 'skills').some((x) => x.plan === 'ortak' && !x.partnerConfirmed) },
        { condition: 'Mevcut yöntem hâlâ üstün', outcome: 'beklet', note: 'Yatırımı erteleyin. Yeniden bakılacak olayı yazın.', applies: (p) => v(p, '11', 'currentMethodWins') === true },
        { condition: '4 ölçüt tamam', outcome: 'ilerle', applies: (_p, cr) => Object.values(cr).every((x) => x === true) },
        { condition: 'Ulaşma yolu yok', outcome: 'yonDegistir', note: 'Adım 08\'e dönün. Segmenti değiştirin.', applies: (_p, cr) => cr.erisim === false },
        { condition: 'Pazar hedefi karşılamıyor', outcome: 'yonDegistir', note: 'Adım 02\'ye dönün. Başarı tanımını küçültün. Ya da segmenti genişletin.', applies: (_p, cr) => cr.pazar === false },
        { condition: 'Yeterli yol bulunamadı', outcome: 'yenidenDene', note: 'Dış gözle bir toplantı daha. En çok 1 deneme.', applies: (_p, cr) => cr.secenek === false },
      ],
    },
  },
  {
    n: 4,
    title: 'Taahhüt',
    question: 'İnsanlar teklif için neyi üstleniyor?',
    icon: 'handshake',
    who: 'Teklifi sunacak kişi. Bütçe sahibine ulaşabilen kişi.',
    time: '2 ile 3 hafta.',
    intro: 'Müşteri bu teklif için para, zaman veya imza veriyor mu? Karşı tarafın ne dediğini ve ne yaptığını ayrı kaydedin.',
    example: 'Ödeme ticari talebe kanıttır. Kitap teslim almaya gelmek katılıma kanıttır. "Gelirim" diyen kişi yalnız ipucu verir.',
    steps: ['13', '14', '15'],
    gate: {
      n: 4,
      title: 'Çözüme talep var mı?',
      maxRetries: 1,
      criteria: [
        c('esik', 'Talep testi eşiği geçildi. Kanıt 1, 2 veya 3. basamakta.', (p) => {
          const offers = rows(p, '15', 'offers')
          const th = v(p, '15', 'threshold') as { value: number | null } | undefined
          if (offers.length === 0 || !th?.value) return null
          const strong = offers.filter((o) => Number(o.ladder) <= 3).length
          return strong >= th.value
        }),
        c('fatura', 'Para alındıysa fatura kesildi. Alınmadıysa niyet mektubu, ön kayıt veya bütçe kaydı var.', (p) => {
          const paid = v(p, '14', 'mode') === 'ucretli'
          if (paid) return v(p, '14', 'canInvoice') === true
          return filled(v(p, '14', 'budgetOwner')) && v(p, '14', 'deliveryAuthorized') === true
        }),
        c('ret', 'Reddedenlerin gerekçesi yazıldı.', (p) => {
          const offers = rows(p, '15', 'offers')
          if (offers.length === 0) return null
          const rejected = offers.filter((o) => o.result === 'ret')
          return rejected.every((o) => filled(o.reason))
        }),
      ],
      rows: [
        { condition: '3 ölçüt tamam', outcome: 'ilerle', note: 'Karar 5\'e geçin.', applies: (_p, cr) => Object.values(cr).every((x) => x === true) },
        { condition: 'Eşik geçildi ama reddedenlerin gerekçesi yazılmadı', outcome: 'yenidenDene', note: '1 hafta içinde reddedenleri arayın.', applies: (_p, cr) => cr.esik === true && cr.ret === false },
        { condition: 'İlgi var ama istenen taahhüt yok', outcome: 'yenidenDene', note: 'Teklifi yanlış kişiye sunduysanız Adım 08\'e dönün. En çok 1 deneme.', applies: (p, cr) => cr.esik === false && rows(p, '15', 'offers').some((o) => Number(o.ladder) >= 4 && Number(o.ladder) <= 5) },
        { condition: 'Problem güçlü, çözüm zayıf', outcome: 'yonDegistir', note: 'Adım 11\'e dönün. Başka yol test edin.', applies: (_p, cr) => cr.esik === false },
        { condition: 'Pist yetmiyor', outcome: 'beklet', note: 'Para bulun. Yeniden açılma tarihi yazın.', applies: (p) => {
          const burn = p.limits.monthlyBurnKurus, cash = p.limits.cashKurus
          return Boolean(burn && cash) && Math.floor((cash as number) / (burn as number)) < 2
        } },
      ],
    },
  },
  {
    n: 5,
    title: 'Para, risk ve yollar',
    question: 'Para dayanıyor mu? Hangi risk işi bitirir? Masada hangi yollar var?',
    icon: 'wallet',
    who: 'Harcama yetkilisi. Teslim sorumlusu kapasiteyi doğrular.',
    time: '1 ile 2 hafta.',
    intro: 'Bu karar strateji seçmez. Üç soruya bakar. Bir satıştan para kalıyor mu? İşi bitirebilecek tehlikeler için kural var mı? Masada hangi yollar var? Cevaplar stratej\'e devir raporunu besler.',
    example: 'Atölye sahibi sipariş başına kalan parayı hesapladı. Sabit gideri 20 sipariş karşılıyor. Kusur oranı sınırı aşarsa sonraki parti açılmaz.',
    steps: ['16', '17', '18'],
    gate: {
      n: 5,
      title: 'Para, risk ve yol adayları hazır mı?',
      maxRetries: 1,
      criteria: [
        c('plan', 'Tek sayfalık iş planı dolu. Orta durumda katkı payı artı.', (p) => {
          const mid = v(p, '16', 'contributionMid') as number | null | undefined
          if (mid === null || mid === undefined) return null
          return mid > 0
        }),
        c('kasa', 'Kasa hiçbir ödeme gününde eksiye düşmüyor.', (p) => {
          const pays = rows(p, '16', 'paymentDays')
          if (pays.length === 0) return null
          return pays.every((d) => Number(d.balanceAfterKurus ?? 0) >= 0)
        }),
        c('risk', 'Kritik riskler için kural yazıldı.', (p) => {
          const r = rows(p, '17', 'risks')
          if (r.length === 0) return null
          return r.filter((x) => Number(x.likelihood ?? 0) * Number(x.impact ?? 0) >= 6).every((x) => filled(x.trigger) && filled(x.response))
        }),
        c('pist', 'Pist en az 3 ay. Strateji çalışmasını ve ilk denemeyi kapsıyor.', (p) => {
          const burn = p.limits.monthlyBurnKurus, cash = p.limits.cashKurus
          if (!burn || !cash) return null
          return Math.floor(cash / burn) >= 3
        }),
        c('yol', 'Yol adayları karşılaştırıldı. Bugünkü durum ve en az iki yol var. Ağır yatırımda en az üç yol.', (p) => {
          if (!p.steps['18']) return null
          const named = rows(p, '18', 'paths').filter((r) => filled(r.name) && (filled(r.where) || filled(r.how)))
          const need = p.profile.smallReversible ? 3 : 4
          return named.length >= need
        }),
      ],
      rows: [
        { condition: '5 ölçüt tamam', outcome: 'ilerle', note: 'Geçiş kapısına gidin. Devir raporunu okuyun.', applies: (_p, cr) => Object.values(cr).every((x) => x === true) },
        { condition: 'Talep var, para mantığı çalışmıyor', outcome: 'yonDegistir', note: 'Adım 16\'ya dönün. Fiyat ve maliyeti değiştirin.', applies: (_p, cr) => cr.plan === false },
        { condition: 'Kârlı iş ama tahsilat gecikiyor', outcome: 'kosulluIlerle', note: 'Ödeme koşulunu yeniden görüşün. Kasa açığı kapanmadan harcama yapmayın.', applies: (_p, cr) => cr.plan === true && cr.kasa === false },
        { condition: 'Talep var ama kaynak yetmiyor', outcome: 'beklet', note: 'Ortak arayın veya para bulun.', applies: (_p, cr) => cr.pist === false },
        { condition: 'Kritik risk için kural eksik', outcome: 'yenidenDene', note: 'Adım 17\'ye dönün. Tetikleyici olayı ve karşılığı yazın.', applies: (_p, cr) => cr.risk === false },
        { condition: 'Yol adayı yetersiz', outcome: 'yenidenDene', note: 'Adım 18\'e dönün. En az iki farklı yol yazın.', applies: (_p, cr) => cr.yol === false },
      ],
    },
  },
  {
    n: 6,
    title: 'İlk teslim',
    question: 'İlk teslim gerçekten işe yarıyor mu?',
    icon: 'package',
    who: 'Teslim sorumlusu işi yürütür. Sonucu kullanacak kişi kabul ölçüsünü doğrular.',
    time: '4 ile 8 hafta. Donanımda 3 ile 6 ay. Fiziksel üründe tedarik süresi, kamuda alım süresi eklenir.',
    intro: 'Küçük ama baştan sona tamamlanan bir işi gerçek müşteriye verin. Talep, teslim ve faydayı ayrı ölçün.',
    example: 'Sekiz işletmeden dördü ödeme yaptı. Yalnız biri raporu yardımsız hazırladı. Teklif çalıştı. Teslim çalışmadı.',
    steps: ['21', '22', '23', '24', '25'],
    gate: {
      n: 6,
      title: 'Devam, yön değiştir, yeniden dene veya durdur',
      maxRetries: 3,
      criteria: [
        c('olcu1', 'Birinci işletme ölçüsü eşiği geçti.', (p) => measureMet(measure(p, '22', 'measure1'))),
        c('olcu2', 'İkinci işletme ölçüsü eşiği geçti.', (p) => measureMet(measure(p, '22', 'measure2'))),
        c('olcu3', 'Üçüncü işletme ölçüsü eşiği geçti.', (p) => measureMet(measure(p, '22', 'measure3'))),
        c('fayda', 'Fayda ölçüsü geçti. Kullanıcı işi yardımsız bitirdi.', (p) => measureMet(measure(p, '22', 'benefitMeasure'))),
        c('zarar', 'Zarar sınırı aşılmadı.', (p) => {
          const h = v(p, '25', 'harmObserved')
          return h === undefined ? null : h !== true
        }),
      ],
      rows: [
        { condition: 'Ciddi zarar görüldü', outcome: 'durdur', note: 'Denemeyi durdurun. Etkilenen kişilere destek sağlayın.', applies: (_p, cr) => cr.zarar === false },
        { condition: '3 ölçüt ve fayda eşiği geçti', outcome: 'ilerle', note: 'Karar 7\'ye geçin.', applies: (_p, cr) => cr.olcu1 === true && cr.olcu2 === true && cr.olcu3 === true && cr.fayda === true },
        { condition: 'Talep güçlü, teslim aksıyor', outcome: 'yenidenDene', note: 'İşi düzeltin. Aynı koşullarda tekrarlayın. En çok 3 deneme.', applies: (_p, cr) => [cr.olcu1, cr.olcu2, cr.olcu3].filter((x) => x === true).length >= 2 && cr.fayda !== true },
        { condition: 'Teslim düzgün, fayda yok', outcome: 'yonDegistir', note: 'Adım 11\'e dönün. Çözümü yeniden seçin.', applies: (_p, cr) => cr.fayda === false && [cr.olcu1, cr.olcu2, cr.olcu3].every((x) => x === true) },
        { condition: 'Müşteri geliyor ama geri dönmüyor', outcome: 'yonDegistir', note: 'Adım 13 ve 21\'e dönün.', applies: (p) => v(p, '25', 'pivotObserved') === 'geriDonmuyor' },
        { condition: 'Ürün beklenmedik amaçla kullanılıyor', outcome: 'yonDegistir', note: 'Adım 05\'e dönün.', applies: (p) => v(p, '25', 'pivotObserved') === 'beklenmedikAmac' },
        { condition: 'İyi geri dönüş ama ödeme yok', outcome: 'yonDegistir', note: 'Adım 16\'ya dönün.', applies: (p) => v(p, '25', 'pivotObserved') === 'odemeYok' },
        { condition: 'Hiç ölçüt geçmedi ve yeni fikir yok', outcome: 'durdur', applies: (p, cr) => [cr.olcu1, cr.olcu2, cr.olcu3, cr.fayda].every((x) => x === false) && v(p, '25', 'hasIdeas') === false },
      ],
    },
  },
  {
    n: 7,
    title: 'Tekrar',
    question: 'İşi tekrar ettiğimizde sonuç korunuyor mu?',
    icon: 'repeat',
    who: 'Hizmet sorumlusu dönemleri izler. Para sorumlusu giderleri ve tahsilatı doğrular.',
    time: '3 aylık dönemler. En çok 4 dönem. Toplam 12 ay.',
    intro: 'Müşteri tekrar kullanıyor ve ödüyor mu? Para mantığı gerçekle tutuyor mu? Kapasite yetiyor mu?',
    example: 'Kooperatifte saklama dönemi bitmeden sonuç bilinmez. Olgunlaşmamış dönem boş kalır. Yönetim alımı bekletir.',
    steps: ['26', '27', '28', '29', '30', '31', '32'],
    gate: {
      n: 7,
      title: 'Ürün pazar uyumu var mı?',
      maxRetries: 4,
      criteria: [
        c('uyum', 'Uyum işareti var.', (p) => {
          const s = v(p, '28', 'signal')
          return s === undefined || s === 'bilinmiyor' ? null : s === 'var'
        }),
        c('oran', 'Ömür değeri bölü kazanma maliyeti 3 ve üstü. Ya da 1 üstü ve üç dönemdir yükseliyor.', (p) => {
          const ltv = Number(v(p, '29', 'ltvKurus') ?? 0), cac = Number(v(p, '29', 'cacKurus') ?? 0)
          if (!ltv || !cac) return null
          const ratio = ltv / cac
          return ratio >= 3 || (ratio > 1 && v(p, '29', 'trendUp') === true)
        }),
        c('kanal', 'En az bir kanal ödeyen müşteri getiriyor ve maliyeti geri geliyor.', (p) => {
          const r = rows(p, '24', 'results')
          if (r.length === 0) return null
          return r.some((x) => Number(x.paying ?? 0) > 0 && Number(x.costKurus ?? 0) / Math.max(1, Number(x.paying ?? 0)) <= Number(v(p, '29', 'ltvKurus') ?? 0))
        }),
        c('sirket', 'Şirket ve sözleşmeler hazır.', (p) => {
          const q = (v(p, '31', 'done') as string[]) ?? []
          return q.length === 0 ? null : q.length >= 3
        }),
      ],
      rows: [
        { condition: '4 ölçüt tamam', outcome: 'ilerle', note: 'Karar 8\'e geçin. Adım 18\'i gerçek veriyle tekrar yapın.', applies: (_p, cr) => Object.values(cr).every((x) => x === true) },
        { condition: 'Yeni sipariş geldikçe gecikme büyüyor', outcome: 'yenidenDene', note: 'Önce darboğazı giderin. Adım 32.', applies: (p) => v(p, '32', 'delayGrowing') === true },
        { condition: 'Satış yükselirken kasa düşüyor', outcome: 'beklet', note: 'Büyümeyi bekletin. Adım 29\'daki tahsilat gününe bakın.', applies: (p) => v(p, '29', 'cashFalling') === true },
        { condition: 'Uyum var, ekonomi çalışmıyor', outcome: 'yenidenDene', note: 'Adım 29\'a odaklanın. 1 döngü daha.', applies: (_p, cr) => cr.uyum === true && cr.oran === false },
        { condition: 'Uyum var, kanal yok', outcome: 'yenidenDene', note: 'Adım 30\'a odaklanın. 1 döngü daha.', applies: (_p, cr) => cr.uyum === true && cr.kanal === false },
        { condition: 'Uyum yok, 12 ay dolmadı', outcome: 'yonDegistir', note: 'Adım 26\'ya dönün.', applies: (p, cr) => cr.uyum === false && Number(v(p, '26', 'cyclesDone') ?? 0) < 4 },
        { condition: 'Uyum yok, 12 ay doldu', outcome: 'durdur', note: 'Ya da büyük yön değişikliği.', applies: (p, cr) => cr.uyum === false && Number(v(p, '26', 'cyclesDone') ?? 0) >= 4 },
      ],
    },
  },
  {
    n: 8,
    title: 'Gelecek',
    question: 'Büyütmek, sürdürmek, devretmek veya kapatmak mı?',
    icon: 'signpost',
    who: 'İşin devamından sorumlu yetkili. Devir varsa teslim alan kişi kayıtları doğrular.',
    time: 'Karar için 1 ile 2 hafta. Büyüme denemesi 3 ay.',
    intro: 'Mevcut ölçekte sürdürmeyi seçenekler arasına alın. Tek şubede kalmak geçerli bir sonuçtur.',
    example: 'Yeni yerde tek bir sınırlı büyüme denemesi açılır. Kalite, erişim veya kasa kötüleşirse son çalışan düzene dönülür.',
    steps: ['33', '34'],
    gate: {
      n: 8,
      title: 'Hangi yön?',
      maxRetries: 1,
      criteria: [
        c('yon', 'İşin yönü seçildi.', (p) => filled(v(p, '33', 'direction'))),
        c('deneme', 'Büyüme denemesi ilk yerle aynı sonucu verdi.', (p) => {
          if (v(p, '33', 'direction') !== 'buyut') return true
          const r = v(p, '33', 'trialResult')
          return r === undefined || r === 'bilinmiyor' ? null : r === 'ayni'
        }),
        c('kasa', 'Kasa dayanıyor.', (p) => (v(p, '33', 'cashHolds') === undefined ? null : v(p, '33', 'cashHolds') === true)),
        c('devir', 'Devir veya kapanışta yazılı kabul var.', (p) => {
          const dir = v(p, '33', 'direction')
          if (dir !== 'devret' && dir !== 'kapat') return true
          return v(p, '34', 'acceptedInWriting') === true
        }),
      ],
      rows: [
        { condition: 'Büyüme denemesi kaliteyi, erişimi veya kasayı bozdu', outcome: 'beklet', note: 'Son çalışan düzene dönün. 3 ay sonra yeniden bakın.', applies: (p, cr) => v(p, '33', 'direction') === 'buyut' && (cr.deneme === false || cr.kasa === false) },
        { condition: 'İş kârlı ama kurucu sürdürmek istemiyor, yazılı kabul yok', outcome: 'beklet', note: 'Devralan kişi açık işleri kabul edene kadar devir bekler.', applies: (p, cr) => v(p, '33', 'direction') === 'devret' && cr.devir === false },
        { condition: 'Ölçütler tamam', outcome: 'ilerle', note: 'Büyüme ve ölçekleme planına geçin. Ya da mevcut ölçekte sürdürün.', applies: (_p, cr) => Object.values(cr).every((x) => x === true) },
        { condition: 'İş zarar ediyor ve denemeler tükendi', outcome: 'durdur', note: 'Adım 34\'ü yapın.', applies: (p) => v(p, '33', 'direction') === 'kapat' },
      ],
    },
  },
]

/**
 * Strateji çalışması. Sekiz karardan biri değildir, kapısı yoktur.
 * Geçiş kapısından sonra açılır. Adım 18, 19 ve 20'yi taşır.
 */
export const STRATEGY_N = 9
export const STRATEGY: DecisionDef = {
  n: STRATEGY_N,
  title: 'Strateji çalışması',
  question: 'Hangi müşteriye, hangi yolla, neyle kazanacaksınız?',
  icon: 'signpost',
  who: 'Karar sahibi ve ekip. Dayanak özeti masada durur.',
  time: '1 ile 2 hafta.',
  intro: 'Bu çalışma geçiş kapısından sonra başlar. Seçimler temel belgesindeki kanıtlara dayanır. Seçim hafif tutulur. Yeni kanıt gelince yeniden açılır.',
  example: 'Atölye sahibi mevcut müşterilere küçük parti sunmayı seçti. Yeni bölgeye satış şimdilik kapsam dışı.',
  steps: ['19', '20'],
  gate: {
    n: STRATEGY_N,
    title: 'Strateji çalışması tamam mı?',
    maxRetries: 0,
    criteria: [
      c('yol', 'Yol seçildi. Gerekçe ve vazgeçilenler yazıldı.', (p) => (p.steps['19'] ? filled(v(p, '19', 'chosenPath')) && filled(v(p, '19', 'choiceReason')) && filled(v(p, '19', 'givenUp')) : null)),
      c('hedef', '90 günlük yol yazıldı.', (p) => (p.steps['19'] ? p.steps['19'].status === 'tamam' : null)),
      c('dosya', 'Strateji karar dosyası tam.', (p) => {
        const q = (v(p, '20', 'qualityCheck') as string[]) ?? []
        return q.length === 0 ? null : q.length >= 5
      }),
    ],
    rows: [],
  },
}
