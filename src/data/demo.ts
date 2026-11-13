import { emptyPlan, type Decision, type Evidence, type Measure, type PlanDoc, type Task } from './types'
import { DECISIONS } from './decisions'
import { evaluateGate } from '@/engine/gate'
import { formatDate } from '@/engine/format'

/** Bugünden n gün sonrası. Eksi sayı geçmişi verir. */
function daysFromNow(n: number): Date {
  const d = new Date()
  d.setHours(10, 0, 0, 0)
  d.setDate(d.getDate() + n)
  return d
}
const iso = (n: number): string => daysFromNow(n).toISOString()
const day = (n: number): string => daysFromNow(n).toISOString().slice(0, 10)
/** Lira tutarını kuruşa çevirir. */
const tl = (lira: number): number => Math.round(lira * 100)

type Row = Record<string, unknown> & { _id: string }
const row = (id: string, data: Record<string, unknown>): Row => ({ _id: id, ...data })

const measure = (name: string, unit: string, period: string, value: number, threshold: number, basis: string): Measure => ({
  name,
  unit,
  period,
  status: 'olculdu',
  value,
  threshold,
  basis,
  isGuess: false,
  baseline: null,
})

/** 15 görüşme. Tüketici için Kapı 2 en az 15 görüşme ve 9 tanıma ister. */
function interviews(): Row[] {
  const people: [string, string, boolean, boolean, number, string][] = [
    ['Ayşe, öğretmen', 'Her sabah', true, true, 1, 'Okula giderken kahve alırım. Yakın yer yok.'],
    ['Murat, muhasebeci', 'Hafta içi her gün', true, true, 1, 'Zincir kafeye 20 dakika yürüyorum.'],
    ['Zeynep, öğrenci', 'Haftada 4 gün', true, true, 3, 'Ders çalışacak sessiz yer arıyorum.'],
    ['Hasan, emekli', 'Her gün', true, false, 5, 'Evde içiyorum. Dışarıda pahalı.'],
    ['Elif, ev ofisi', 'Hafta içi her gün', true, true, 2, 'Toplantı için sakin yer lazım.'],
    ['Kerem, kurye', 'Günde iki kez', true, true, 1, 'Hızlı kahve isterim. Sıra beklemem.'],
    ['Selin, hemşire', 'Vardiya çıkışı', true, true, 3, 'Sabah 7’de açık yer yok.'],
    ['Ali, berber', 'Haftada 3 gün', true, false, 5, 'Dükkânda kendim yapıyorum.'],
    ['Fatma, anne', 'Okul çıkışı', true, true, 3, 'Çocukla oturacak yer arıyorum.'],
    ['Deniz, yazılımcı', 'Hafta içi her gün', true, true, 2, 'Sabit masa ve priz isterim.'],
    ['Mehmet, esnaf', 'Haftada 2 gün', false, false, 6, 'Çayı tercih ederim.'],
    ['Gül, avukat', 'Haftada 3 gün', true, true, 3, 'Müvekkille görüşecek yer yok.'],
    ['Can, lise öğrencisi', 'Haftada 2 gün', false, false, 7, 'Harçlığım yetmez.'],
    ['Nur, eczacı', 'Her gün', true, true, 1, 'Eczaneye yakın kahve yok.'],
    ['Burak, taksici', 'Günde bir kez', true, false, 5, 'Arabada termos taşıyorum.'],
  ]
  return people.map(([person, frequency, recognizes, spendsToday, ladder, quote], i) =>
    row(`gorusme-${i + 1}`, {
      person,
      role: 'kullanan',
      lastEvent: formatRelativeEvent(i),
      frequency,
      loss: spendsToday ? 'Günde 20 dakika yürüyüş' : 'Kahvesiz kalıyor',
      currentSolution: spendsToday ? 'Uzaktaki zincir kafeye gidiyor' : 'Evde hazırlıyor',
      recognizes,
      spendsToday,
      ladder,
      quote,
    }),
  )
}

function formatRelativeEvent(i: number): string {
  return formatDate(iso(-(3 + (i % 9))))
}

/** 14 teklif. Eşik 10 taahhüt. 11 kişi 1, 2 veya 3. basamakta taahhüt verdi. */
function offers(): Row[] {
  const data: [string, 'kabul' | 'ret', number, string][] = [
    ['Ayşe, öğretmen', 'kabul', 1, 'Aylık kahve kartına 600 TL ödedi.'],
    ['Murat, muhasebeci', 'kabul', 1, 'Aylık kahve kartına 600 TL ödedi.'],
    ['Elif, ev ofisi', 'kabul', 2, '300 TL depozito verdi.'],
    ['Kerem, kurye', 'kabul', 1, 'Haftalık kart aldı. 150 TL ödedi.'],
    ['Selin, hemşire', 'kabul', 2, '300 TL depozito verdi.'],
    ['Deniz, yazılımcı', 'kabul', 1, 'Aylık masa ve kahve paketine 1.200 TL ödedi.'],
    ['Gül, avukat', 'kabul', 3, 'Açılış haftası için 2 saat ayırdı.'],
    ['Nur, eczacı', 'kabul', 1, 'Aylık kahve kartına 600 TL ödedi.'],
    ['Fatma, anne', 'kabul', 3, 'Çocuk köşesi için fikir toplantısına geldi.'],
    ['Zeynep, öğrenci', 'kabul', 2, 'Öğrenci kartı için 200 TL depozito verdi.'],
    ['Hakan, mimar', 'kabul', 1, 'Aylık kahve kartına 600 TL ödedi.'],
    ['Hasan, emekli', 'ret', 5, 'Fiyatı yüksek buldu. Evde içmeyi sürdürecek.'],
    ['Burak, taksici', 'ret', 6, 'Durup park edecek yer yok.'],
    ['Mehmet, esnaf', 'ret', 7, 'Kahve içmiyor. Çay istiyor.'],
  ]
  return data.map(([person, result, ladder, reason], i) => row(`teklif-${i + 1}`, { person, result, ladder, reason }))
}

/**
 * Örnek plan: Mahalle kafesi. Ekranları tanıtır. Kullanıcı verisi değildir.
 * Karar 1 ile 4 arası adımlar dolu. Dört kapı "İlerle" ile geçildi. Karar 5 açık.
 */
export function buildDemoPlan(): PlanDoc {
  const p = emptyPlan('ornek-mahalle-kafesi', 'Örnek: Mahalle kafesi')
  p.example = true
  p.entry = 'yeni'
  p.createdAt = iso(-70)
  p.lastLocation = '/karar/5'

  p.profile = {
    customer: 'tuketici',
    offering: 'hizmet',
    regulation: 'dusuk',
    team: 'tekKurucu',
    funding: 'kendi',
    market: 'varOlan',
    start: 'sifirdan',
    needsPremises: true,
    paid: true,
    smallReversible: false,
    description: 'Mahallede küçük bir kafe açıyorum. Sabah erken açılacak. Çalışan ve öğrenciye sakin bir masa verecek. Tek başıma başlıyorum.',
  }

  const limits = {
    successSentence: '12 ay içinde 300 düzenli müşteri. Ayda en az 30.000 TL katkı.',
    stopRules: [
      { rule: 'Üç ay üst üste kasa 60.000 TL altına düşerse dururum.' },
      { rule: 'Açılıştan 6 ay sonra günde 40 müşteri yoksa dururum.' },
      { rule: 'Kira ve maaş toplamı aylık gelirin yüzde 70’ini aşarsa dururum.' },
    ],
    monthlyBurnKurus: tl(30_000),
    cashKurus: tl(240_000),
    budgetKurus: tl(150_000),
    deadline: day(90),
    retriesPerDecision: 2,
    hoursPerWeek: 50,
  }
  p.limits = limits

  const done = (values: Record<string, unknown>, daysAgo: number) => ({ values, status: 'tamam' as const, updatedAt: iso(-daysAgo) })

  p.steps = {
    '00': done({ ...p.profile }, 68),
    '01': done({
      whys: [row('neden-1', { why: 'Mahallede sabah erken açık kafe yok.' }), row('neden-2', { why: 'İnsanlar 20 dakika yürüyüp zincir kafeye gidiyor.' }), row('neden-3', { why: 'Ben 8 yıl kafede çalıştım. İşi biliyorum.' })],
      coreReason: 'Mahalleye yürüme uzaklığında sakin ve erken açılan bir kafe kazandırmak.',
      exitDirection: 'karli',
      fitDomain: 4,
      fitStory: 4,
      fitAccess: 5,
      fitSkill: 3,
      partners: [],
    }, 67),
    '02': done({ ...limits, extraIncome: true }, 66),
    '03': done({
      rights: [row('hak-1', { gate: '5', owner: 'Kurucu', proposer: 'Kurucu', objector: 'Eşim', informed: 'Muhasebeci' })],
      disputeRule: 'Anlaşamazsak eski patronumu dinlerim. Son kararı ben veririm.',
    }, 65),
    '04': done({
      factors: ['ekonomi', 'toplum', 'hukuk'],
      factorNotes: [
        row('etken-1', { factor: 'Ekonomi', change: 'Kahve çekirdeği fiyatı yılda yüzde 40 arttı.', action: 'İki tedarikçiden fiyat alırım. Fiyatı 3 ayda bir gözden geçiririm.' }),
        row('etken-2', { factor: 'Toplum', change: 'Evden çalışan sayısı artıyor.', action: 'Priz ve sabit masa koyarım.' }),
        row('etken-3', { factor: 'Hukuk', change: 'İşyeri açma ruhsatı belediyeden alınır.', action: 'Ruhsat başvurusunu kira sözleşmesiyle aynı hafta yaparım.' }),
      ],
      forceNew: 3,
      forceSub: 3,
      forceBuyer: 2,
      forceSupplier: 3,
      forceRivalry: 2,
      uncertainty1: 'Kira 12 ay içinde ne kadar artacak?',
      uncertainty2: 'Zincir kafe mahalleye şube açar mı?',
      scenarios: [
        row('senaryo-1', { name: 'Sakin mahalle', signal: 'Kira artışı yüzde 30 altında kalır.', winCondition: 'Düzenli müşteri 300’ü geçer.' }),
        row('senaryo-2', { name: 'Zincir gelir', signal: 'Yakın sokakta zincir kafe tabelası görülür.', winCondition: 'Sabit müşteri kartı ve erken saat üstünlüğü korunur.' }),
      ],
      permits: [row('izin-1', { permit: 'İşyeri açma ve çalışma ruhsatı', months: 1, beforeStep: 'Açılıştan önce' })],
    }, 64),
    '05': done({
      problemWho: 'Mahallede oturan çalışan ve öğrenci.',
      problemWhen: 'Sabah işe veya okula giderken.',
      problemJob: 'Yakında, hızlı ve sakin bir yerde kahve içmek.',
      problemBlocker: 'En yakın kafe 20 dakika yürüme uzaklığında. Sabah 9’dan önce açık yer yok.',
      lastEvent: day(-60),
      currentSolution: 'rakip',
      currentSolutionNote: 'Zincir kafeye yürüyor ya da evde hazırlıyor.',
      lossKind: 'zaman',
      lossUnit: 'saatHafta',
      lossEstimate: 3,
      lossNote: 'Haftada 3 saat yolda geçiyor.',
    }, 58),
    '06': done({
      interviews: interviews(),
      summarySentence: '15 kişiden 13’ü problemi tanıdı. 10’u bugün zaman veya para harcıyor.',
      newProblem: 'Üç kişi sessiz çalışma masası istedi. Bu, kahveden ayrı bir ihtiyaç.',
      subgroup: 'Evden çalışanlar ve sabah erken işe gidenler.',
    }, 52),
    '07': done({
      repeatMeasure: measure('Problemin tekrarı', 'kez', 'hafta', 5, 3, '15 görüşmede ortanca değer.'),
      effortMeasure: measure('Bugün harcanan çaba', 'saat', 'hafta', 3, 2, 'Yürüme süresi görüşme notlarından.'),
      lossMeasure: measure('Çözmemenin kaybı', 'TL', 'ay', 900, 500, 'Zincir kafede aylık kahve harcaması.'),
      sev1: 5,
      sev2: 3,
      sev3: 4,
      sev4: 4,
      sev5: 4,
      segmentScores: [row('segment-1', { segment: 'Evden çalışanlar', score: 21 }), row('segment-2', { segment: 'Sabah erken işe gidenler', score: 19 }), row('segment-3', { segment: 'Öğrenciler', score: 14 })],
    }, 50),
    '08': done({
      segmentName: 'Evden çalışanlar',
      behavior: 'Sabah 8 ile 11 arası çalışacak yer arıyor. Bugün zincir kafeye yürüyor ya da evde kalıyor.',
      context: 'Hafta içi sabah. Toplantı öncesi veya sonrası.',
      budget: 'Ayda 600 ile 1.200 TL kahve harcıyor.',
      userPerson: 'Evden çalışan kişi',
      payerPerson: 'Aynı kişi',
      deciderPerson: 'Aynı kişi',
      accessPath: 'Mahalle sosyal medya grubu, apartman panoları ve bina yöneticileri. Açılış haftasında ücretsiz tadım.',
      accessPlace: 'Mahalle meydanı ve 5 apartman',
      accessChannel: 'Mahalle grubu ve pano',
      accessTrust: 'Mahalleden tanıdık komşular',
      accessCost: tl(15),
    }, 48),
    '09': done({
      reachableCustomers: 600,
      salesCapacity: 350,
      somCustomers: 350,
      targetCustomers: 300,
      reachNotes: 'Mahalle grubunda 2.400 üye var. Yürüme mesafesinde 600 çalışan ve öğrenci sayıyorum. Günde 60 kişiye hizmet verebilirim.',
      totalMarket: 2400,
      totalMarketSource: 'Mahalle grubu üye sayısı ve muhtarlık',
      totalMarketDate: day(-45),
      sharePercent: 15,
      gapReason: 'Grubun üçte biri mahallede oturmuyor. Aşağıdan yukarıya sayı daha güvenilir.',
      competitors: [
        row('rakip-1', { name: 'Zincir kafe (20 dakika)', kind: 'dogrudan', price: '90 TL filtre kahve', audience: 'Herkes', feature: 'Hız ve sadakat uygulaması', channel: 'Cadde', weakness: 'Uzak ve kalabalık', switchCost: 'Düşük' }),
        row('rakip-2', { name: 'Fırın köşesi', kind: 'ikame', price: '40 TL çay ve simit', audience: 'Yaşlılar', feature: 'Ucuz', weakness: 'Oturma yeri yok', switchCost: 'Düşük' }),
        row('rakip-3', { name: 'Evde hazırlamak', kind: 'hicbirSey', price: '10 TL', audience: 'Herkes', feature: 'Bedava sayılır', weakness: 'Çalışma ortamı yok', switchCost: 'Yok' }),
      ],
      gaps: [row('bosluk-1', { gap: 'Sabah 7’de açık kafe', whyEmpty: 'Zincirler 9’da açıyor. Personel maliyeti yüksek.', demandExists: true, recentlyFilled: false })],
    }, 44),
    '10': done({
      assumptions: [
        row('varsayim-1', { assumption: 'Evden çalışanlar aylık kart için önden ödeme yapar.', area: 'istek', impact: 5, evidence: 2, testMethod: 'Açılıştan önce aylık kart satmak.', falsifyThreshold: '30 kişiden 10’u almazsa yanlış.', fallback: 'Tek seferlik fiyatla başlarım.' }),
        row('varsayim-2', { assumption: 'Sabah 7’de açılmak günde 20 ek müşteri getirir.', area: 'para', impact: 4, evidence: 3, testMethod: 'İlk ay sabah sayımı.', falsifyThreshold: 'Günde 10 altıysa yanlış.', fallback: 'Açılışı 8’e alırım.' }),
        row('varsayim-3', { assumption: 'Ruhsat 1 ayda çıkar.', area: 'hukuk', impact: 4, evidence: 3, testMethod: 'Belediyeye sormak.', falsifyThreshold: '2 ayı geçerse yanlış.', fallback: 'Geçici satış noktası planlarım.' }),
      ],
    }, 40),
    '11': done({
      options: [
        row('sabit', { name: 'Bugünkü yöntem', kind: 'bugunku', firstStep: 'Hiçbir şey yapmamak.', learning: 'Müşteri zincir kafeye yürümeyi sürdürür.', _fixed: true }),
        row('yol-1', { name: 'Küçük kafe. 25 kişilik salon.', kind: 'hizmet', firstStep: 'Kira sözleşmesi ve ikinci el makine. 120.000 TL.', learning: 'Sabah akışı ve kart satışı.' }),
        row('yol-2', { name: 'Kahve arabası. Meydanda.', kind: 'hizmet', firstStep: 'Araba ve izin. 60.000 TL.', learning: 'Sabah talebi ucuz ölçülür.' }),
        row('yol-3', { name: 'Ortak çalışma alanı ve kafe birlikte.', kind: 'ikisi', firstStep: 'Daha büyük yer. 250.000 TL.', learning: 'Masa kirası geliri.' }),
      ],
      criteriaPriority: 'Önce müşteri kanıtı. Sonra maliyet ve geri dönülebilirlik.',
      scores: {
        weights: { musteriKaniti: 3, yapilabilirlik: 2, maliyet: 2, hiz: 1, geriDonus: 2 },
        locked: true,
        scores: {
          sabit: { musteriKaniti: 1, yapilabilirlik: 5, maliyet: 5, hiz: 5, geriDonus: 5 },
          'yol-1': { musteriKaniti: 4, yapilabilirlik: 4, maliyet: 3, hiz: 3, geriDonus: 2 },
          'yol-2': { musteriKaniti: 3, yapilabilirlik: 4, maliyet: 4, hiz: 5, geriDonus: 4 },
          'yol-3': { musteriKaniti: 3, yapilabilirlik: 2, maliyet: 1, hiz: 1, geriDonus: 1 },
        },
      },
      currentMethodWins: false,
      testOption1: 'Küçük kafe. 25 kişilik salon.',
      testOption2: 'Kahve arabası. Meydanda.',
      cannotDo: 'Hayır. Küçük kafeyi kendim işletebilirim.',
    }, 36),
    '12': done({
      skills: [
        row('beceri-1', { skill: 'Barista ve servis', plan: 'yap', partnerConfirmed: false, costNote: 'Var. 8 yıl deneyim.' }),
        row('beceri-2', { skill: 'Ön muhasebe ve fatura', plan: 'satinAl', partnerConfirmed: false, costNote: 'Muhasebeci. Ayda 2.500 TL.' }),
        row('beceri-3', { skill: 'Sosyal medya duyurusu', plan: 'yap', partnerConfirmed: false, costNote: 'Haftada 2 saat.' }),
      ],
      location: 'Mahalle meydanına bakan 45 metrekare dükkân',
      rentKurus: tl(18_000),
      leaseMonths: 24,
      tempPointPlan: 'Ruhsat gecikirse meydanda kahve arabasıyla başlarım.',
      neededMoneyKurus: tl(120_000),
      neededMonths: 2,
      fitsRunway: true,
    }, 32),
    '13': done({
      vpCustomer: 'Mahallede evden çalışan kişi',
      vpProblem: 'Yakında sakin ve erken açık kafe yok',
      vpResult: 'Sabah 7’de 5 dakikada masada ve kahvede',
      vpSolution: 'Erken açılan, prizli ve sessiz mahalle kafesi',
      vpAlternative: '20 dakika yürüyerek zincir kafe',
      vpDifference: 'Yürüme süresi 20 dakikadan 5 dakikaya iner',
      customerJobs: 'Sabah 2 saat rahat çalışmak ve iyi kahve içmek.',
      painRelievers: 'Yakınlık, erken saat, sabit masa ve priz.',
      customerPains: 'Uzak yol, kalabalık, priz yok.',
      gainCreators: 'Aylık kart ile sabit masa hakkı.',
      customerGains: 'Zaman kazanmak. Tanıdık ortam.',
      unmatched: 'Öğle yemeği isteyenler. İlk aşamada kapsam dışı.',
    }, 28),
    '14': done({
      mode: 'ucretli',
      canInvoice: true,
      invoiceVia: 'Şahıs işletmesi. Vergi levhası alındı.',
      paymentMethods: ['kart', 'nakit', 'havale'],
      permitChecklist: ['muhasebeci', 'izinSoruldu', 'teslimKosulu'],
      permitMonths: 1,
      costPerServiceKurus: tl(35),
      deliveryTerms: 'Aylık kart 600 TL. Günde bir kahve. Kullanılmayan gün devretmez. İlk 7 gün içinde iade edilir.',
    }, 24),
    '15': done({
      method: 'ucretliHizmet',
      methodNote: 'Mahalle grubunda aylık kahve kartını duyurdum. Ev ofisinde 3 gün tadım yaptım. Fiyat 600 TL.',
      threshold: { value: 10, basis: 'İlk ay kira ve maaş için 10 kart gerekir.', isGuess: false },
      startDate: day(-21),
      endDate: day(-8),
      reached: 48,
      tried: 22,
      offers: offers(),
      resultNote: '14 kişiye teklif sundum. 11 kişi taahhüt verdi. 7 kişi ödeme yaptı. Eşik geçildi.',
      secondTestNeeded: false,
    }, 8),
  }

  p.evidence = [
    evidence('kanit-1', 'Mahallede sabah 9’dan önce açık kafe yok', 'gozlem', 3, -62, 'Sabah 6.30 ile 9 arası yürüyüş sayımı', 'Mahalle', ['04', '05']),
    evidence('kanit-2', '15 görüşmenin 13’ünde problem tanındı', 'gozlem', 3, -52, 'Görüşme defteri', 'Evden çalışanlar', ['06', '07']),
    evidence('kanit-3', 'Mahalle grubunda 2.400 üye var', 'tahmin', 4, -45, 'Grup üye sayısı. Üçte biri mahallede oturmuyor.', 'Mahalle', ['09']),
    evidence('kanit-4', '7 kişi aylık kahve kartına ödeme yaptı', 'gozlem', 1, -8, 'Banka dekontları ve kasa fişleri', 'Evden çalışanlar', ['15'], 'Üç kişi fiyatı yüksek buldu.'),
  ]

  p.decisions = [1, 2, 3, 4].map((n, i) => gateDecision(p, n, -(60 - i * 15) + (i === 3 ? 10 : 0), i + 1))
  p.revision = 4
  p.tasks = [
    task('is-1', 'Ruhsat başvurusunu belediyeye teslim et.', 'Kurucu', 7, 'acik', 'Belediyeden başvuru numarası alındı.', '04', p.decisions[0].id),
    task('is-2', 'Reddeden 3 kişiyi arayıp fiyat önerisini sor.', 'Kurucu', 3, 'acik', 'Üç kişinin cevabı teklif defterine yazıldı.', '15', p.decisions[3].id),
    task('is-3', 'İki tedarikçiden çekirdek fiyatı al.', 'Kurucu', -4, 'bitti', 'İki yazılı teklif alındı.', '04', p.decisions[0].id),
  ]
  p.revisions = p.decisions.map((d) => ({ id: `surum-${d.gate}`, label: `Kapı ${d.gate} kararı: İlerle`, createdAt: d.decidedAt, snapshot: '' }))
  for (const r of p.revisions) r.snapshot = JSON.stringify({ ...p, revisions: [] })
  p.updatedAt = iso(-5)
  return p
}

function evidence(id: string, title: string, kind: Evidence['kind'], ladder: number, daysAgo: number, source: string, group: string, linkedSteps: string[], counterFinding?: string): Evidence {
  return { id, title, kind, ladder, date: day(daysAgo), source, group, counterFinding, linkedSteps, createdAt: iso(daysAgo), updatedAt: iso(daysAgo) }
}

function task(id: string, action: string, owner: string, dueInDays: number, status: Task['status'], acceptance: string, sourceStep: string, sourceDecisionId: string): Task {
  return { id, action, owner, dueDate: day(dueInDays), status, acceptance, sourceStep, sourceDecisionId, createdAt: iso(Math.min(-1, dueInDays - 10)), updatedAt: iso(status === 'bitti' ? dueInDays : Math.min(-1, dueInDays - 10)) }
}

const GATE_REASON: Record<number, string> = {
  1: 'Dört ölçüt tamam. Pist 8 ay. Kurucu uyum puanı 16. Araştırmaya başlıyorum.',
  2: '15 görüşmede 13 kişi problemi tanıdı. 10 kişi bugün zaman harcıyor. Üç ölçü eşiği geçti.',
  3: 'Üç farklı yol puanlandı. Küçük kafe öne çıktı. 350 müşteri hedefi 300’ü karşılıyor.',
  4: '14 teklifte 11 taahhüt. 7 ödeme. Eşik 10 idi. Reddedenlerin gerekçesi yazıldı.',
}

/** Kapı kararını motorun ölçütlerinden üretir. Alan adları değişirse test bunu yakalar. */
function gateDecision(p: PlanDoc, gate: number, daysAgo: number, revision: number): Decision {
  const def = DECISIONS.find((d) => d.n === gate)!
  const ev = evaluateGate(def.gate, p)
  return {
    id: `karar-ornek-${gate}`,
    gate,
    scope: `Kapı ${gate}: ${def.gate.title}`,
    criteria: def.gate.criteria.map((c) => ({ id: c.id, label: c.label, met: ev.criteria[c.id] })),
    suggested: ev.suggested,
    chosen: 'ilerle',
    reason: GATE_REASON[gate],
    counterView: gate === 4 ? 'Üç kişi fiyatı yüksek buldu. Öğrenci fiyatı ayrıca denenebilir.' : undefined,
    retriesLeft: ev.retriesLeft,
    decidedBy: 'Kurucu',
    decidedAt: iso(daysAgo),
    revision,
  }
}
