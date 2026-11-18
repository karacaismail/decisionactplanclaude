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

/** 15 görüşme. Tüketici için Kontrol 2 en az 15 görüşme ve 9 tanıma ister. */
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
 * Adım 00 ile 17 arası dolu. Beş kontrol "İlerle" ile geçildi. Hazırlık kontrolü açık.
 * Adım 19 ve 20 boştur. Hazırlık kararını kullanıcı kendisi kaydeder.
 */
export function buildDemoPlan(): PlanDoc {
  const p = emptyPlan('ornek-mahalle-kafesi', 'Örnek: Mahalle kafesi')
  p.example = true
  p.entry = 'yeni'
  p.createdAt = iso(-70)
  p.lastLocation = '/gecis'

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
      redLines: 'Borçla büyümem. Ruhsatsız satış yapmam.',
      whys: [row('neden-1', { why: 'Mahallede sabah erken açık kafe yok.' }), row('neden-2', { why: 'İnsanlar 20 dakika yürüyüp zincir kafeye gidiyor.' }), row('neden-3', { why: 'Ben 8 yıl kafede çalıştım. İşi biliyorum.' })],
      coreReason: 'Mahalleye yürüme uzaklığında sakin ve erken açılan bir kafe kazandırmak.',
      exitDirection: 'karli',
      fitDomain: 4,
      fitStory: 4,
      fitAccess: 5,
      fitSkill: 3,
      partners: [],
    }, 67),
    '02': done({ ...limits, extraIncome: true, horizon: 'Mahallede iki satış noktası. Kurucu maaşını işten alıyor.' }, 66),
    '03': done({
      rights: [row('hak-1', { gate: '5', owner: 'Kurucu', proposer: 'Kurucu', objector: 'Eşim', informed: 'Muhasebeci' })],
      disputeRule: 'Anlaşamazsak eski patronumu dinlerim. Son kararı ben veririm.',
    }, 65),
    '04': done({
      factors: ['ekonomi', 'toplum', 'hukuk'],
      factorNotes: [
        row('etken-1', { factor: 'Ekonomi', change: 'Kahve çekirdeği fiyatı yılda yüzde 40 arttı.', effect: 'tehdit', action: 'İki tedarikçiden fiyat alırım. Fiyatı 3 ayda bir gözden geçiririm.' }),
        row('etken-2', { factor: 'Toplum', change: 'Evden çalışan sayısı artıyor.', effect: 'firsat', action: 'Priz ve sabit masa koyarım.' }),
        row('etken-3', { factor: 'Hukuk', change: 'İşyeri açma ruhsatı belediyeden alınır.', effect: 'tehdit', action: 'Ruhsat başvurusunu kira sözleşmesiyle aynı hafta yaparım.' }),
      ],
      forceNew: 3,
      forceSub: 3,
      forceBuyer: 2,
      forceSupplier: 3,
      forceRivalry: 2,
      uncertainty1: 'Kira 12 ay içinde ne kadar artacak?',
      uncertainty2: 'Zincir kafe mahalleye şube açar mı?',
      uncertainty1Level: 'aralik',
      uncertainty2Level: 'secenek',
      scenarios: [
        row('senaryo-1', { name: 'Sakin mahalle', signal: 'Kira artışı yüzde 30 altında kalır.', winCondition: 'Düzenli müşteri 300’ü geçer.' }),
        row('senaryo-2', { name: 'Zincir gelir', signal: 'Yakın sokakta zincir kafe tabelası görülür.', winCondition: 'Sabit müşteri kartı ve erken saat üstünlüğü korunur.' }),
        row('senaryo-3', { name: 'Kira sıçrar', signal: 'Mal sahibi yüzde 30 üstü artış ister.', winCondition: 'Kahve arabasına dönülür. Kira gideri kalkar.' }),
        row('senaryo-4', { name: 'Kira sıçrar ve zincir gelir', signal: 'İki işaret aynı yıl görülür.', winCondition: 'Aylık kart sayısı 30\'un üstünde kalırsa iş sürer.' }),
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
      profitPool: 'Zincir kafeler sabah satışından kazanıyor. Mahalle kafeleri öğle menüsünden kazanıyor.',
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
      failedAttempts: [row('batan-1', { who: 'Meydandaki eski kafe', what: '2024 yılında açıldı. Öğleden sonra hizmet verdi.', why: 'Kira ikinci yıl iki katına çıktı. Sabah müşterisi yoktu.', difference: 'Sabah 6.30 açılış ve önden ödenen aylık kart.' })],
      gaps: [row('bosluk-1', { gap: 'Sabah 7’de açık kafe', whyEmpty: 'Zincirler 9’da açıyor. Personel maliyeti yüksek.', demandExists: true, recentlyFilled: false })],
    }, 44),
    '10': done({
      assumptions: [
        row('varsayim-1', { affectsPath: 'Ön siparişle aylık kart', assumption: 'Evden çalışanlar aylık kart için önden ödeme yapar.', area: 'istek', impact: 5, evidence: 2, testMethod: 'Açılıştan önce aylık kart satmak.', falsifyThreshold: '30 kişiden 10’u almazsa yanlış.', fallback: 'Tek seferlik fiyatla başlarım.' }),
        row('varsayim-2', { assumption: 'Sabah 7’de açılmak günde 20 ek müşteri getirir.', area: 'para', impact: 4, evidence: 3, testMethod: 'İlk ay sabah sayımı.', falsifyThreshold: 'Günde 10 altıysa yanlış.', fallback: 'Açılışı 8’e alırım.' }),
        row('varsayim-3', { assumption: 'Ruhsat 1 ayda çıkar.', area: 'hukuk', impact: 4, evidence: 3, testMethod: 'Belediyeye sormak.', falsifyThreshold: '2 ayı geçerse yanlış.', fallback: 'Geçici satış noktası planlarım.' }),
        row('varsayim-4', { assumption: 'Kafe günde 40 sipariş alır.', area: 'para', impact: 5, evidence: 2, testMethod: 'İlk ay her gün sipariş saymak.', falsifyThreshold: 'İlk ay günde 25 altıysa yanlış.', fallback: 'Öğle saatine uygun fiyatlı menü eklerim.' }),
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
      strengths: [
        row('guc-1', { name: '8 yıllık barista deneyimi', valuable: 'evet', rare: 'evet', hardToCopy: 'evet', organized: 'hayir', basis: 'Mahalledeki 3 kafede deneyimli barista yok. Bilgi tek kişide.' }),
        row('guc-2', { name: 'Durağa 40 metre uzaklık', valuable: 'evet', rare: 'evet', hardToCopy: 'hayir', basis: 'Sabah sayımı. Durağa bu kadar yakın başka satış noktası yok.' }),
        row('guc-3', { name: 'Güler yüzlü hizmet', valuable: 'evet', rare: 'hayir' }),
      ],
      bottleneck: 'Tek barista sabah kuyruğuna yetişmez.',
      bottleneckLimit: 'Saatte 40 kahve',
      bottleneckAlt: 'Sabah 7 ile 9 arası için yarım gün yardımcı.',
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
      priceOfferedKurus: 60000,
      priceAcceptedCount: 7,
    }, 8),
    '16': done({
      commitmentsKnown: 'var',
      spentKurus: tl(12_000),
      commitments: [row('taahhut-1', { what: 'Kahve makinesi kaporası sonrası kalan borç', amountKurus: tl(38_000), dueDate: '2026-12-15', basis: 'Satıcıyla imzalı sipariş formu' })],
      problem: 'Mahallede sabah erken açık ve sakin bir kafe yok. İnsanlar zincir kafeye 20 dakika yürüyor.',
      segment: 'Evden çalışanlar. Sabah 8 ile 11 arası çalışacak yer arıyorlar.',
      valueProp: 'Yürüme süresi 20 dakikadan 5 dakikaya iner. Sabah 7’de masa ve kahve hazır olur.',
      solution: '25 kişilik, prizli ve sessiz mahalle kafesi. Kafe sabah 7’de açılır.',
      channels: 'Mahalle sosyal medya grubu, apartman panoları ve açılış haftası tadımı.',
      revenue: 'Tek sipariş ortalama 65 TL. Aylık kahve kartı 600 TL. Masa ve kahve paketi 1.200 TL.',
      cost: 'Sabit gider ayda 30.000 TL. Bunun 18.000 TL’si kira. Bir siparişin gideri 35 TL.',
      metrics: 'Günlük sipariş sayısı. Satılan aylık kart sayısı. Ay sonu kasa.',
      unfairAdvantage: '8 yıllık kafe deneyimi ve mahallede tanıdık komşular.',
      contributionLow: tl(20),
      contributionMid: tl(30),
      contributionHigh: tl(40),
      monthlyPerCustomerKurus: tl(600),
      acquisitionKurus: tl(40),
      paybackMonths: 1,
      collectionDays: 0,
      breakEvenCount: 1000,
      paymentDays: [
        row('odeme-1', { date: day(5), labelText: 'Depozito ve ilk kira', balanceAfterKurus: tl(204_000) }),
        row('odeme-2', { date: day(12), labelText: 'İkinci el makine ve tadilat', balanceAfterKurus: tl(132_000) }),
        row('odeme-3', { date: day(30), labelText: 'Açılış stoku ve ruhsat harcı', balanceAfterKurus: tl(120_000) }),
        row('odeme-4', { date: day(36), labelText: 'Kira ve muhasebeci', balanceAfterKurus: tl(99_500) }),
        row('odeme-5', { date: day(60), labelText: 'İlk ayın satış geliri', balanceAfterKurus: tl(104_000) }),
      ],
      cashDaysNote: 'Kasa en düşük değerini açılıştan sonraki ilk kira gününde görür. O gün kasada 99.500 TL kalır.',
      fragileNumber: 'Günlük sipariş sayısı. Sayı 40’tan 32’ye düşerse sabit gider karşılanmaz.',
      fragileTested: false,
    }, 4),
    '17': done({
      worstCase: 'En çok 120.000 TL ve 6 ay kaybederim. Eski işime dönebilirim. Evimi riske atmıyorum.',
      stakeholders: [
        row('kisi-1', { who: 'Dükkânın mal sahibi', effect: 'engel', how: 'Kirayı ikinci yıl iki katına çıkarabilir.', plan: 'Artış oranını sözleşmeye yazdırırım.' }),
        row('kisi-2', { who: 'Mahalle muhtarı', effect: 'kolaylik', how: 'Duyuruyu mahalle grubunda paylaşabilir.', plan: 'Açılıştan önce ziyaret ederim.' }),
      ],
      dependencies: ['tekTedarikci', 'tekKisi'],
      dissents: [row('gorus-1', { who: 'Eşim', about: '7 aylık kart talebi gösterir.', view: 'Kart alan 7 kişinin 5\'i arkadaşımız. Yabancı müşteri henüz ödemedi.', response: 'suruyor' })],
      dependencyNote: 'Çekirdeği tek toptancıdan alıyoruz. İkinci toptancıdan fiyat aldık. Barista bilgisi tek kişide. Tarifleri yazıyoruz.',
      premortem: [
        row('batma-1', { reason: 'Günlük sipariş 40’a çıkmadı.', earlySignal: 'İlk ay günde 25 siparişin altı.', prevention: 'Açılıştan önce 30 aylık kart satarım.', owner: 'Kurucu', stopThreshold: '6. ayda günde 40 sipariş yoksa dururum.' }),
        row('batma-2', { reason: 'Kira beklenenden hızlı arttı.', earlySignal: 'Mal sahibi yüzde 30 üstü artış ister.', prevention: 'Sözleşmeye artış sınırı yazdırırım.', owner: 'Kurucu', stopThreshold: 'Kira ve maaş gelirin yüzde 70’ini aşarsa dururum.' }),
        row('batma-3', { reason: 'Zincir kafe yakına şube açtı.', earlySignal: 'Yakın sokakta zincir kafe tabelası görülür.', prevention: 'Aylık kartı ve erken saati korurum.', owner: 'Kurucu', stopThreshold: 'Kart sayısı 3 ayda yüzde 30 düşerse yön değiştiririm.' }),
        row('batma-4', { reason: 'Ruhsat gecikti.', earlySignal: 'Başvurudan 30 gün sonra cevap yok.', prevention: 'Meydanda kahve arabasıyla başlarım.', owner: 'Kurucu', stopThreshold: 'Ruhsat 2 ayı geçerse açılışı ertelerim.' }),
        row('batma-5', { reason: 'Tek başıma yetişemedim.', earlySignal: 'Haftada 60 saati geçen çalışma.', prevention: 'Sabah saatine yarı zamanlı yardımcı alırım.', owner: 'Kurucu', stopThreshold: '3 hafta üst üste 60 saati geçersem yardımcı alırım.' }),
      ],
      risks: [
        row('risk-1', { risk: 'Sipariş az gelir.', category: 'ticari', likelihood: 2, impact: 3, trigger: 'İlk ay günde 25 siparişin altı.', response: 'Öğle menüsü eklerim. Kart fiyatını yeniden denerim.', owner: 'Kurucu' }),
        row('risk-2', { risk: 'Kahve çekirdeği fiyatı artar.', category: 'tedarik', likelihood: 3, impact: 2, trigger: 'Tedarikçi yüzde 20 üstü zam bildirir.', response: 'İkinci tedarikçiye geçerim. Fiyatı 5 TL artırırım.', owner: 'Kurucu' }),
        row('risk-3', { risk: 'Ruhsat gecikir.', category: 'hukuk', likelihood: 2, impact: 2, trigger: 'Başvurudan 30 gün sonra cevap yok.', response: 'Kahve arabasıyla başlarım.', owner: 'Kurucu' }),
        row('risk-4', { risk: 'Kasa 60.000 TL altına düşer.', category: 'para', likelihood: 1, impact: 3, trigger: 'Ay sonu kasa 60.000 TL altında.', response: 'Yeni harcamayı durdururum. Durdurma kuralını uygularım.', owner: 'Kurucu' }),
        row('risk-5', { risk: 'Kahve makinesi bozulur.', category: 'teknik', likelihood: 2, impact: 2, trigger: 'Makine bir günden uzun çalışmaz.', response: 'Servisi çağırırım. Filtre kahveyle devam ederim.', owner: 'Kurucu' }),
        row('risk-6', { risk: 'Kurucu hastalanır.', category: 'operasyon', likelihood: 1, impact: 3, trigger: 'Kafe iki gün üst üste kapalı kalır.', response: 'Eski iş arkadaşım kafeyi geçici olarak açar.', owner: 'Kurucu' }),
      ],
      eca: [
        row('kural-1', { event: 'İlk ay bitti.', condition: 'Günlük sipariş 25’in altında.', action: 'Öğle menüsü eklerim. Kart fiyatını yeniden denerim.', who: 'Kurucu', when: 'İkinci ayın ilk haftası' }),
        row('kural-2', { event: 'Tedarikçi zam bildirdi.', condition: 'Zam yüzde 20’nin üstünde.', action: 'İkinci tedarikçiye geçerim.', who: 'Kurucu', when: 'Bildirimi izleyen 7 gün içinde' }),
      ],
      irreversible: ['uzunKira', 'buyukAlim'],
      irreversibleNote: 'Kira sözleşmesine 6. ayda çıkış hakkı yazdırırım. Makineyi ikinci el alırım.',
    }, 3),
    '18': done({
      crossSO: 'Barista deneyimi ve durağa yakınlıkla sabah 7 boşluğunu doldururuz.',
      crux: 'Aylık kart ilgisi, gideri karşılayan günlük satışa dönüşecek mi?',
      cruxWhy: 'Sabit gideri günde 40 sipariş karşılar. 7 kart bu sayıyı tek başına göstermez.',
      cruxPaths: 'Bütün yollar',
      cruxAlt: 'Belki talep vardır ama 600 TL fiyat yüksektir.',
      cruxSplit: 'Bir sabah iki fiyatla satış yapmak. Teklifi ve ücretli satışı ayrı saymak.',
      cruxEvidence: ['kanit-4'],
      cruxCounter: [],
      successConditions: [
        row('kosul-1', { condition: 'Sabah talebi günlük sabit gideri karşılar.', paths: 'Bütün yollar', measure: 'Günlük ücretli sipariş', baseline: '', threshold: 'Günde 40 sipariş', thresholdWhen: 'once', owner: 'Kurucu', support: [], counter: [] }),
        row('kosul-2', { condition: 'Müşteri aylık kart için önden öder.', paths: 'Ön siparişle aylık kart', measure: 'Ödenen aylık kart sayısı', baseline: '14 teklifin 7\'si', threshold: '30 kart', thresholdWhen: 'once', owner: 'Kurucu', support: ['kanit-4'], counter: [] }),
        row('kosul-3', { condition: 'Sabah 7 ile 9 arasında durakta yeterli yaya geçer.', paths: 'Durakta kahve arabası', measure: 'Sabah yaya sayısı', baseline: '0', threshold: '', owner: 'Kurucu', support: ['kanit-1'], counter: [] }),
      ],
      pathLinks: [
        row('bag-1', { path: 'Küçük kafe salonu', a: 'Sabah 6.30 açılış sözü', b: 'Tek barista', relation: 'celisiyor', reason: 'Tek kişi her gün 6.30 açılışı sürdüremez.' }),
        row('bag-2', { path: 'Ön siparişle aylık kart', a: 'Önden ödeme', b: 'Çekirdek alımı', relation: 'destekliyor', reason: 'Önden gelen para çekirdek alımını karşılar.' }),
      ],
      crossWO: 'Muhasebeyi dışarıdan alırız. Aylık kart satışı böylece düzenli kayda girer.',
      crossST: 'Durağa yakınlık, zincir kafenin indirimine karşı bizi korur.',
      crossWT: 'Kira sıçrarsa ve bilgi tek kişide kalırsa salon açmayız. Kahve arabasıyla kalırız.',
      paths: [
        row('yol-0', { revenue: 'Para kazanılmaz.', name: 'Bugünkü durumu sürdürmek', where: 'Müşteri evde kahve yapar ya da zincir kafeye yürür.', how: 'Hiçbir şey yapmayız. Para harcanmaz.', giveUp: 'Sabah müşterisinden ve 7 ön ödemeden vazgeçeriz.', evidence: '13 kişi sabah kahve bulamadığını söyledi.', cost: '0 TL', reversible: 'ciftYonlu' }),
        row('yol-1', { revenue: 'Tek kahve satışı. Kahve 80 TL.', vehicle: 'kendimiz', evidenceIds: ['kanit-1'], origin: 'so', name: 'Durakta kahve arabası', where: 'Sabah işe gidenler. Otobüs durağı. Doğrudan satış.', how: 'Hız ve konum. Müşteri yolundan çıkmaz.', giveUp: 'Oturma alanından ve evden çalışanlardan vazgeçeriz.', evidence: 'Sabah 6.30 ile 9 arası yürüyüş sayımı.', cost: '60.000 TL ve 3 hafta', reversible: 'ciftYonlu' }),
        row('yol-2', { revenue: 'Aylık kart. Kart 600 TL, para önden gelir.', vehicle: 'kendimiz', evidenceIds: ['kanit-4'], origin: 'wo', name: 'Ön siparişle aylık kart', where: 'Evden çalışanlar ve öğrenciler. Mahalle grubu. Aylık kart.', how: 'Güven ve düzen. Para önden gelir.', giveUp: 'Gelip geçen müşteriden vazgeçeriz.', evidence: '7 kişi aylık karta ön ödeme yaptı.', cost: '150.000 TL ve 8 hafta', reversible: 'tekYonlu' }),
        row('yol-3', { revenue: 'Tek kahve ve aylık kart birlikte.', vehicle: 'kendimiz', origin: 'baska', name: 'Küçük kafe salonu', where: 'Mahalle sakinleri. 25 kişilik salon. Gelip geçen ve kartlı müşteri.', how: 'Yer ve süreklilik. Sabah 6.30 açılış.', giveUp: 'Düşük giderden ve hızlı çıkıştan vazgeçeriz.', evidence: 'Mahallede sabah 9\'dan önce açık kafe yok.', cost: '150.000 TL ve 10 hafta', reversible: 'tekYonlu' }),
      ],
      pathScores: {
        weights: { customerEvidence: 3, marketAppeal: 2, difference: 2, skillFit: 2, moneyLogic: 3, risk: 2, reversibility: 2 },
        scores: {
          'yol-0': { customerEvidence: 1, marketAppeal: 1, difference: 1, skillFit: 5, moneyLogic: 1, risk: 5, reversibility: 5 },
          'yol-1': { customerEvidence: 3, marketAppeal: 4, difference: 4, skillFit: 4, moneyLogic: 3, risk: 4, reversibility: 5 },
          'yol-2': { customerEvidence: 5, marketAppeal: 3, difference: 3, skillFit: 3, moneyLogic: 4, risk: 2, reversibility: 2 },
          'yol-3': { customerEvidence: 3, marketAppeal: 4, difference: 3, skillFit: 3, moneyLogic: 3, risk: 2, reversibility: 1 },
        },
        locked: true,
      },
      counterMove: 'Zincir kafe sabah indirimi yapabilir. Biz durağa yakınlıkla ve aylık kartla kalırız.',
      openDecisions: [
        row('karar-a', { question: 'Durakta mı satalım, ön siparişle mi teslim edelim?', alternatives: 'Durakta kahve arabası. Ön siparişle aylık kart. İkisi birlikte.', basis: '7 kişi karta ön ödeme yaptı. Durak satışı henüz denenmedi.', owner: 'Kurucu', dueDate: iso(14), reversalCost: 'Kira sözleşmesi imzalanırsa 6 aylık kira.', door: 'tekYonlu' }),
        row('karar-b', { question: 'Hangi fiyat modelini deneyeceğiz?', alternatives: 'Aylık kart 600 TL. Tek kahve 80 TL.', basis: '14 teklifin 7\'si 600 TL\'ye kabul edildi.', owner: 'Kurucu', dueDate: iso(21), reversalCost: 'Bir aylık gelir farkı.', door: 'ciftYonlu' }),
      ],
    }, 2),
  }

  p.evidence = [
    evidence('kanit-1', 'Mahallede sabah 9’dan önce açık kafe yok', 'gozlem', 3, -62, 'Sabah 6.30 ile 9 arası yürüyüş sayımı', 'Mahalle', ['04', '05']),
    evidence('kanit-2', '15 görüşmenin 13’ünde problem tanındı', 'gozlem', 3, -52, 'Görüşme defteri', 'Evden çalışanlar', ['06', '07']),
    evidence('kanit-3', 'Mahalle grubunda 2.400 üye var', 'tahmin', 4, -45, 'Grup üye sayısı. Üçte biri mahallede oturmuyor.', 'Mahalle', ['09']),
    evidence('kanit-4', '7 kişi aylık kahve kartına ödeme yaptı', 'gozlem', 1, -8, 'Banka dekontları ve kasa fişleri', 'Evden çalışanlar', ['15'], 'Üç kişi fiyatı yüksek buldu.'),
  ]

  p.decisions = GATE_DAYS.map((daysAgo, i) => gateDecision(p, i + 1, -daysAgo, i + 1))
  p.revision = 5
  p.tasks = [
    task('is-1', 'Ruhsat başvurusunu belediyeye teslim et.', 'Kurucu', 7, 'acik', 'Belediyeden başvuru numarası alındı.', '04', p.decisions[0].id),
    task('is-2', 'Reddeden 3 kişiyi arayıp fiyat önerisini sor.', 'Kurucu', 3, 'acik', 'Üç kişinin cevabı teklif defterine yazıldı.', '15', p.decisions[3].id),
    task('is-3', 'İki tedarikçiden çekirdek fiyatı al.', 'Kurucu', -4, 'bitti', 'İki yazılı teklif alındı.', '04', p.decisions[0].id),
  ]
  p.revisions = p.decisions.map((d) => ({ id: `surum-${d.gate}`, label: `Kontrol ${d.gate} kararı: İlerle`, createdAt: d.decidedAt, snapshot: '' }))
  for (const r of p.revisions) r.snapshot = JSON.stringify({ ...p, revisions: [] })
  p.updatedAt = iso(-2)
  return p
}

function evidence(id: string, title: string, kind: Evidence['kind'], ladder: number, daysAgo: number, source: string, group: string, linkedSteps: string[], counterFinding?: string): Evidence {
  return { id, title, kind, ladder, date: day(daysAgo), source, group, counterFinding, linkedSteps, createdAt: iso(daysAgo), updatedAt: iso(daysAgo) }
}

function task(id: string, action: string, owner: string, dueInDays: number, status: Task['status'], acceptance: string, sourceStep: string, sourceDecisionId: string): Task {
  return { id, action, owner, dueDate: day(dueInDays), status, acceptance, sourceStep, sourceDecisionId, createdAt: iso(Math.min(-1, dueInDays - 10)), updatedAt: iso(status === 'bitti' ? dueInDays : Math.min(-1, dueInDays - 10)) }
}

const GATE_REASON: Record<number, string> = {
  1: 'Dört ölçüt tamam. Kasa süresi 8 ay. Kurucu uyum puanı 16. Araştırmaya başlıyorum.',
  2: '15 görüşmede 13 kişi problemi tanıdı. 10 kişi bugün zaman harcıyor. Üç ölçü eşiği geçti.',
  3: 'Üç farklı yol puanlandı. Küçük kafe öne çıktı. 350 müşteri hedefi 300’ü karşılıyor.',
  4: '14 teklifte 11 taahhüt. 7 ödeme. Eşik 10 idi. Reddedenlerin gerekçesi yazıldı.',
  5: 'Bir siparişten 30 TL kalıyor. Kasa hiçbir ödeme gününde eksiye düşmüyor. İki kritik riskin kuralı yazıldı. Kasa süresi 8 ay.',
}
/** Beş kontrol kararının kaç gün önce verildiği. Kontrol 5, Adım 18'den sonra gelir. */
const GATE_DAYS = [60, 45, 30, 5, 2]

/** Kontrol kararını motorun ölçütlerinden üretir. Alan adları değişirse test bunu yakalar. */
function gateDecision(p: PlanDoc, gate: number, daysAgo: number, revision: number): Decision {
  const def = DECISIONS.find((d) => d.n === gate)!
  const ev = evaluateGate(def.gate, p)
  return {
    id: `karar-ornek-${gate}`,
    gate,
    scope: `Kontrol ${gate}: ${def.gate.title}`,
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
