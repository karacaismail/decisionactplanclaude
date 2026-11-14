import type { StepDef } from '../schema'
import type { PlanDoc } from '../types'

const RATE5 = ['Çok zayıf', 'Zayıf', 'Orta', 'İyi', 'Çok iyi']

type Row = Record<string, unknown> & { _id: string }

/** Profile göre en az görüşme sayısı. Kapı 2 ile aynı kuralı kullanır. */
function interviewTarget(customer?: string): number {
  if (customer === 'tuketici') return 15
  if (customer === 'kamu') return 6
  return 10
}

function sideTargets(plan: PlanDoc): { side1: number; side2: number } {
  return {
    side1: interviewTarget(plan.profile.marketplaceSeller ?? 'isletme'),
    side2: interviewTarget(plan.profile.marketplaceBuyer ?? 'tuketici'),
  }
}

const SEVERITY_KEYS = ['sev1', 'sev2', 'sev3', 'sev4', 'sev5']
const SEVERITY_LABELS = ['Sıklık', 'Etki', 'Aciliyet', 'Memnuniyetsizlik', 'Taahhüt işareti']

const ROLE_OPTIONS = [
  { value: 'kullanan', label: 'Kullanan', help: 'Problemi her gün yaşayan kişi.' },
  { value: 'odeyen', label: 'Ödeyen', help: 'Parayı veren kişi veya birim.' },
  { value: 'kararVeren', label: 'Karar veren', help: 'Alıma son onayı veren kişi.' },
]

const INTERVIEW_COLUMNS = [
  { key: 'person', type: 'text' as const, label: 'Kişi', placeholder: 'Ad veya takma ad' },
  { key: 'role', type: 'select' as const, label: 'Rolü', options: ROLE_OPTIONS },
  { key: 'lastEvent', type: 'text' as const, label: 'En son ne zaman yaşadı?', placeholder: 'Örneğin 3 Kasım 2026 Salı günü' },
  { key: 'frequency', type: 'text' as const, label: 'Ne sıklıkla yaşıyor?', placeholder: 'Haftada bir' },
  { key: 'loss', type: 'text' as const, label: 'Ne kaybediyor?', placeholder: 'Günde 1 saat' },
  { key: 'currentSolution', type: 'text' as const, label: 'Bugün nasıl çözüyor?', placeholder: 'Elle, rakip ürünle veya hiç çözmüyor' },
  { key: 'recognizes', type: 'toggle' as const, label: 'Problemi tanıdı mı?', onLabel: 'Evet, tanıdı', offLabel: 'Hayır' },
  { key: 'spendsToday', type: 'toggle' as const, label: 'Bugün para veya zaman harcıyor mu?', onLabel: 'Evet, harcıyor', offLabel: 'Hayır' },
  { key: 'ladder', type: 'evidenceLadder' as const, label: 'Taahhüt işareti' },
  { key: 'quote', type: 'text' as const, label: 'Kendi sözü', placeholder: 'Müşterinin söylediği tek cümle' },
]

export const KARAR2: StepDef[] = [
  {
    id: '05',
    decision: 2,
    title: 'Problem tanımı',
    question: 'Kim, hangi durumda, hangi işi bitiremiyor?',
    mandatory: true,
    who: 'Kurucu.',
    shortPath: true,
    howTo: [
      'Problemi dört parçayla yazın. Kim? Hangi durumda? Hangi işi bitirmek istiyor? Hangi engel var?',
      'Müşterinin bugün bu işi nasıl çözdüğünü yazın. Üç seçenek vardır. Elle çözüyor. Rakip ürün kullanıyor. Hiç çözmüyor.',
      'Problemi çözmemenin bedelini yazın. Para, zaman veya itibar olarak yazın.',
      'Bu bir varsayımdır. Henüz kanıt yoktur. Kanıtı Adım 06\'da toplayacaksınız.',
    ],
    sections: [
      {
        title: 'Problem cümlesi',
        description: 'Dört parçayı doldurun. Uygulama parçaları tek cümle olarak gösterir.',
        fields: [
          { key: 'problemExample', type: 'info', label: 'Örnek', tone: 'ornek', text: 'Mahalle bakkalı, akşam kapanışta, günlük satışı görmek istiyor. Ama kasa defteri elle tutulduğu için göremiyor.' },
          { key: 'problemWho', type: 'text', label: 'Kim?', required: true, placeholder: 'Mahalle bakkalı', maxLength: 120, span: 12 },
          { key: 'problemWhen', type: 'text', label: 'Hangi durumda?', required: true, placeholder: 'Akşam kapanışta', maxLength: 120, span: 12 },
          { key: 'problemJob', type: 'text', label: 'Hangi işi bitirmek istiyor?', required: true, placeholder: 'Günlük satışı görmek', maxLength: 160, span: 12 },
          { key: 'problemBlocker', type: 'text', label: 'Hangi engel yüzünden bitiremiyor?', required: true, placeholder: 'Kasa defteri elle tutuluyor', maxLength: 160, span: 12 },
          { key: 'lastEvent', type: 'date', label: 'Bu problemi en son ne zaman gördünüz?', help: 'Gördüğünüz veya duyduğunuz son olayın tarihi.' },
        ],
      },
      {
        title: 'Bugünkü çözüm',
        fields: [
          { key: 'currentSolution', type: 'segmented', label: 'Müşteri bugün bu işi nasıl çözüyor?', required: true, options: [
            { value: 'elle', label: 'Elle çözüyor', help: 'Defter, telefon, tanıdık veya kendi emeği.' },
            { value: 'rakip', label: 'Rakip ürün kullanıyor', help: 'Rakibi Adım 09\'da yazacaksınız.' },
            { value: 'yok', label: 'Hiç çözmüyor', help: 'Probleme katlanıyor. Bu da bir rakiptir.' },
          ] },
          { key: 'currentSolutionNote', type: 'textarea', label: 'Bugünkü çözümü kısaca anlatın', rows: 2, maxLength: 300, placeholder: 'Her akşam fişleri sayıyor. Yarım saat sürüyor.' },
        ],
      },
      {
        title: 'Çözmemenin bedeli',
        fields: [
          { key: 'lossKind', type: 'select', label: 'Kayıp türü', required: true, options: [
            { value: 'para', label: 'Para' },
            { value: 'zaman', label: 'Zaman' },
            { value: 'itibar', label: 'İtibar' },
          ], span: 12 },
          { key: 'lossUnit', type: 'select', label: 'Kayıp birimi', options: [
            { value: 'tlAy', label: 'TL, ayda' },
            { value: 'tlOlay', label: 'TL, olay başına' },
            { value: 'saatHafta', label: 'Saat, haftada' },
            { value: 'saatOlay', label: 'Saat, olay başına' },
            { value: 'musteri', label: 'Kaybedilen müşteri sayısı' },
            { value: 'diger', label: 'Başka birim' },
          ], span: 12 },
          { key: 'lossEstimate', type: 'number', label: 'Tahmini kayıp', help: 'Bu sayı tahmindir. Adım 06\'da gerçek sayıyı öğreneceksiniz.', min: 0 },
          { key: 'lossNote', type: 'text', label: 'Kaybı tek cümleyle yazın', placeholder: 'Her akşam yarım saat kaybediyor.', maxLength: 160 },
          { key: 'assumptionNote', type: 'info', label: 'Dikkat', tone: 'uyari', text: 'Bu sayfadaki her şey varsayımdır. Kanıt yoktur. Görüşmeler bu varsayımı sınayacak.' },
        ],
      },
    ],
    output: 'Bir cümlelik problem tanımı. Bugünkü çözüm. Bedel tahmini.',
    models: [122],
    completeWhen: ['problemWho', 'problemWhen', 'problemJob', 'problemBlocker', 'currentSolution', 'lossKind'],
  },
  {
    id: '06',
    decision: 2,
    title: 'Müşteri keşfi',
    question: 'Müşteriler bu problemi gerçekten yaşıyor mu?',
    mandatory: true,
    who: 'Kurucu. Görüşmeleri başkasına devretmeyin.',
    shortPath: true,
    howTo: [
      'Görüşme sayısını profilinize göre belirleyin. Sayı aşağıdaki kutuda yazar.',
      'Mom Test kurallarını uygulayın. Mom Test, fikrinizi anlatmadan geçmişi sorma yöntemidir.',
      '"Bunu en son ne zaman yaşadınız? O gün ne yaptınız? Ne harcadınız?" diye sorun.',
      'Övgüyü, "olsa iyi olur" sözünü ve gelecek vaadini veri saymayın.',
      'Her görüşmeden sonra bir satır yazın. Taahhüt işaretini kanıt merdivenine göre seçin.',
      'Görüşmeler tekrar etmeye başlayınca durun. Yeni şey duymuyorsanız yeter.',
      'Mümkünse müşteriyi işinde izleyin. Söylediği ile yaptığı farklı olabilir.',
    ],
    sections: [
      {
        title: 'Kaç görüşme?',
        fields: [
          { key: 'countTuketici', type: 'info', label: 'Tüketici işi', text: 'En az 15 görüşme yapın. Problemi yaşayan kişilerle görüşün.', when: { profile: { customer: ['tuketici'] } } },
          { key: 'countIsletme', type: 'info', label: 'İşletme işi', text: 'En az 10 görüşme yapın. Kullanan kişiyle ve satın alma kararını veren kişiyle ayrı görüşün.', when: { profile: { customer: ['isletme'] } } },
          { key: 'countKamu', type: 'info', label: 'Kamu işi', text: 'En az 6 görüşme yapın. Birim yöneticisi, satın alma ve kullanıcıyla görüşün.', when: { profile: { customer: ['kamu'] } } },
          { key: 'countPazarYeri', type: 'info', label: 'Pazar yeri', text: 'Her taraf kendi kuralını uygular. Tüketici tarafı 15, işletme tarafı 10 görüşme. İki tarafı ayrı deftere yazın.', when: { profile: { customer: ['pazarYeri'] } } },
          { key: 'countHizmet', type: 'info', label: 'Hizmet', tone: 'ipucu', text: 'Hizmet satıyorsanız benzer hizmeti bugün satın alan kişilerle görüşün.', when: { profile: { offering: ['hizmet'] } } },
        ],
      },
      {
        title: 'Görüşme defteri',
        description: 'Her görüşme bir satırdır. Pazar yerinde bu defter satan taraf içindir.',
        fields: [
          { key: 'interviews', type: 'repeater', label: 'Görüşmeler', addLabel: 'Görüşme ekle', minRows: 1, columns: INTERVIEW_COLUMNS },
        ],
      },
      {
        title: 'Alan taraf defteri',
        description: 'Pazar yerinde ikinci tarafı burada yazın.',
        when: { profile: { customer: ['pazarYeri'] } },
        fields: [
          { key: 'interviewsSide2', type: 'repeater', label: 'Alan taraf görüşmeleri', addLabel: 'Görüşme ekle', columns: INTERVIEW_COLUMNS, when: { profile: { customer: ['pazarYeri'] } } },
        ],
      },
      {
        title: 'Problem doğrulama özeti',
        fields: [
          { key: 'summarySentence', type: 'text', label: 'Özet cümle', placeholder: '15 kişiden 11\'i problemi tanıdı. 8\'i haftalık yaşıyor. 5\'i çözüm arıyor.', maxLength: 240 },
          { key: 'newProblem', type: 'textarea', label: 'Müşteriler farklı bir problem anlattı mı? Yazın.', rows: 2, maxLength: 300, placeholder: 'Boş bırakabilirsiniz.' },
          { key: 'subgroup', type: 'text', label: 'Problemi en yoğun yaşayan alt grup', placeholder: 'Örneğin iki şubeli bakkallar', maxLength: 160 },
        ],
      },
    ],
    output: 'Görüşme defteri. Bir cümlelik problem doğrulama özeti.',
    outcomeTable: [
      { condition: 'Kimse problemi tanımıyor', result: 'Adım 05\'e dönün. Problem tanımını değiştirin.' },
      { condition: 'Problem tanınıyor ama kimse bedel ödemiyor', result: 'Problem acil değil. Adım 07\'de puan düşük çıkar. Başka problem seçin veya bekletin.' },
      { condition: 'Bir alt grup problemi çok yoğun yaşıyor', result: 'Bu grup ilk segment adayıdır. Adım 08\'e taşıyın.' },
      { condition: 'Müşteriler farklı bir problem anlatıyor', result: 'Yeni problemi yazın. Adım 05\'i o problemle tekrar yapın.' },
    ],
    models: [30, 55],
    completeWhen: ['interviews'],
    chart: {
      kind: 'bar',
      title: 'Görüşme sayacı',
      summary: (v, plan) => {
        const rows = (v.interviews as Row[] | undefined) ?? []
        if (rows.length === 0) return ''
        if (plan.profile.customer === 'pazarYeri') {
          const side2 = (v.interviewsSide2 as Row[] | undefined) ?? []
          const t = sideTargets(plan)
          return `Satan tarafta ${rows.length} görüşme, hedef ${t.side1}. Alan tarafta ${side2.length} görüşme, hedef ${t.side2}.`
        }
        const target = interviewTarget(plan.profile.customer)
        const recognized = rows.filter((r) => r.recognizes === true).length
        const left = Math.max(0, target - rows.length)
        return left > 0 ? `${rows.length} görüşme yapıldı. ${left} görüşme kaldı. ${recognized} kişi problemi tanıdı.` : `${rows.length} görüşme yapıldı. Hedef doldu. ${recognized} kişi problemi tanıdı.`
      },
      build: (v, plan) => {
        const rows = (v.interviews as Row[] | undefined) ?? []
        const side2 = (v.interviewsSide2 as Row[] | undefined) ?? []
        if (rows.length === 0 && side2.length === 0) return null
        const count = (r: Row[]) => r.length
        const recognized = (r: Row[]) => r.filter((x) => x.recognizes === true).length
        const spends = (r: Row[]) => r.filter((x) => x.spendsToday === true).length
        const marketplace = plan.profile.customer === 'pazarYeri'
        const cats = marketplace ? ['Satan taraf', 'Alan taraf'] : ['Görüşmeler']
        const groups = marketplace ? [rows, side2] : [rows]
        const targets = marketplace ? [sideTargets(plan).side1, sideTargets(plan).side2] : [interviewTarget(plan.profile.customer)]
        const series = [
          { name: 'Hedef', data: targets },
          { name: 'Yapılan', data: groups.map(count) },
          { name: 'Problemi tanıdı', data: groups.map(recognized) },
          { name: 'Bugün harcıyor', data: groups.map(spends) },
        ]
        return {
          option: {
            legend: { bottom: 0 },
            grid: { left: 110, right: 24, top: 16, bottom: 48 },
            xAxis: { type: 'value', name: 'kişi', minInterval: 1 },
            yAxis: { type: 'category', data: cats },
            series: series.map((s) => ({ type: 'bar', name: s.name, data: s.data, label: { show: true, position: 'right' } })),
          },
          table: { head: ['Taraf', ...series.map((s) => s.name)], rows: cats.map((c, i) => [c, ...series.map((s) => s.data[i])]) },
        }
      },
    },
  },
  {
    id: '07',
    decision: 2,
    title: 'Problem şiddeti',
    question: 'Problem ne kadar acıtıyor? Bunu sayıyla gösterebilir misiniz?',
    mandatory: true,
    who: 'Kurucu.',
    shortPath: true,
    howTo: [
      'Görüşme defterinden üç kanıt çıkarın. Tekrar. Çaba. Kayıp. Her birini ayrı ölçün.',
      'Her ölçü için ad, birim, eşik ve dayanak yazın. Ölçemediyseniz "Bilinmiyor" seçin.',
      'Sonra beş konuda 1 ile 5 arası puan verin. Toplam yardımcı puandır.',
      'Yardımcı puan kapı ölçütü değildir. Kapı 2 yalnız üç kanıt ölçüsüne bakar.',
    ],
    sections: [
      {
        title: 'Üç kanıt ölçüsü',
        description: 'Kapı 2 bu üç ölçüyü okur. Her ölçüde gerçek sayı olmalı.',
        fields: [
          { key: 'cruxHint', type: 'info', label: 'Asıl engel', tone: 'ipucu', text: 'Buradaki kayıp ve gözlem, işin asıl engelini gösterebilir. Asıl engeli Adım 18\'de yazarsınız. Kanıtı orada yeniden yazmazsınız, defterden seçersiniz.' },
          { key: 'repeatMeasure', type: 'measure', label: 'Tekrar. Problem ne sıklıkla yaşanıyor?', defaultName: 'Problemin tekrarı', defaultUnit: 'kez', help: 'Örneğin haftada kaç kez yaşanıyor. Görüşmelerden sayın.' },
          { key: 'effortMeasure', type: 'measure', label: 'Çaba. Müşteri bugün ne harcıyor?', defaultName: 'Bugün harcanan çaba', defaultUnit: 'saat', help: 'Bugünkü çözüme giden zaman, para veya kişi.' },
          { key: 'lossMeasure', type: 'measure', label: 'Kayıp. Çözmemek neye mal oluyor?', defaultName: 'Çözmemenin kaybı', defaultUnit: 'TL', help: 'Para, zaman veya kaybedilen müşteri.' },
        ],
      },
      {
        title: 'Yardımcı puan',
        description: 'Her konuda 1 ile 5 arası puan verin. Toplam 5 ile 25 arasında çıkar.',
        fields: [
          { key: 'helperNote', type: 'info', label: 'Bu puan yardımcıdır', tone: 'bilgi', text: 'Beş puanın toplamı yalnız sizi yönlendirir. Kapı 2 bu toplamı ölçüt olarak okumaz. Kapı yukarıdaki üç ölçüye bakar.' },
          { key: 'sev1', type: 'rate', label: 'Sıklık. Her gün yaşanıyorsa 5. Yılda bir yaşanıyorsa 1.', labels: RATE5, span: 12 },
          { key: 'sev2', type: 'rate', label: 'Etki. Para veya zaman kaybı büyükse 5.', labels: RATE5, span: 12 },
          { key: 'sev3', type: 'rate', label: 'Aciliyet. Hemen çözmek istiyorsa 5.', labels: RATE5, span: 12 },
          { key: 'sev4', type: 'rate', label: 'Bugünkü çözümden memnuniyetsizlik. Çok mutsuzsa 5.', labels: RATE5, span: 12 },
          { key: 'sev5', type: 'rate', label: 'Taahhüt işareti. Ödeme veya depozito 5. Söz 1.', labels: RATE5, span: 12 },
          { key: 'segmentScores', type: 'repeater', label: 'Birden çok segment adayı varsa her birine ayrı puan yazın', addLabel: 'Segment adayı ekle', columns: [
            { key: 'segment', type: 'text', label: 'Segment adayı' },
            { key: 'score', type: 'number', label: 'Yardımcı puan', min: 5, max: 25 },
          ] },
        ],
      },
    ],
    output: 'Üç kanıt ölçüsü. Yardımcı puan. Her segment adayı için ayrı puan.',
    outcomeTable: [
      { condition: 'Puan 20 ve üstü', result: 'Güçlü problem. Devam edin.' },
      { condition: 'Puan 13 ile 19 arası', result: 'Orta problem. Adım 08\'de daha dar segment arayın.' },
      { condition: 'Puan 12 ve altı', result: 'Zayıf problem. Adım 05\'e dönün veya durdurun.' },
      { condition: 'Taahhüt işareti 1 veya 2, diğer sayılar yüksek', result: 'Beyan var, davranış yok. Puan ne olursa olsun en çok "orta" sayın. Karar 4\'te talep testi şart.' },
    ],
    models: [99],
    completeWhen: ['repeatMeasure', 'effortMeasure', 'lossMeasure'],
    chart: {
      kind: 'gauge',
      title: 'Yardımcı puan',
      summary: (v) => {
        const vals = SEVERITY_KEYS.map((k) => Number(v[k] ?? 0))
        if (!vals.every((x) => x > 0)) return vals.some((x) => x > 0) ? 'Beş konunun hepsini puanlayın.' : ''
        const t = vals.reduce((a, b) => a + b, 0)
        const commitment = vals[4]
        if (commitment <= 2 && t >= 13) return `Toplam ${t}. Taahhüt işareti düşük. En çok "orta" sayın.`
        if (t >= 20) return `Toplam ${t}. Güçlü problem.`
        if (t >= 13) return `Toplam ${t}. Orta problem.`
        return `Toplam ${t}. Zayıf problem.`
      },
      build: (v) => {
        const vals = SEVERITY_KEYS.map((k) => Number(v[k] ?? 0))
        if (!vals.some((x) => x > 0)) return null
        const t = vals.reduce((a, b) => a + b, 0)
        return {
          option: {
            series: [{
              type: 'gauge',
              min: 5,
              max: 25,
              startAngle: 200,
              endAngle: -20,
              progress: { show: true, width: 18 },
              axisLine: { lineStyle: { width: 18 } },
              axisTick: { show: false },
              splitLine: { show: false },
              axisLabel: { distance: 24, fontSize: 14 },
              pointer: { show: false },
              title: { show: true, offsetCenter: [0, '45%'], fontSize: 14 },
              detail: { valueAnimation: true, formatter: '{value}', fontSize: 28, offsetCenter: [0, '10%'] },
              data: [{ value: t, name: 'Yardımcı puan' }],
            }],
          },
          table: { head: ['Konu', 'Puan'], rows: [...SEVERITY_LABELS.map((l, i) => [l, vals[i]] as (string | number)[]), ['Toplam', t]] },
        }
      },
    },
  },
  {
    id: '08',
    decision: 2,
    title: 'İlk segment kartı',
    question: 'Problemi en yoğun yaşayan ve en kolay ulaşılan grup kim?',
    mandatory: true,
    who: 'Kurucu.',
    shortPath: true,
    howTo: [
      'Problemi en yoğun yaşayan ve en kolay ulaşılan grubu seçin.',
      'Yaş, cinsiyet ve şehir yetmez. Davranış, bağlam, bütçe ve erişim yazın.',
      'İşletme veya kamu müşterisi varsa üç kişiyi ayrı yazın. Kullanan. Ödeyen. Karar veren.',
      'Bu gruba nasıl ulaşacağınızı yazın. Hangi yerde, hangi kanalda ve hangi güven aracılığıyla.',
    ],
    sections: [
      {
        title: 'Segment tanımı',
        fields: [
          { key: 'segmentName', type: 'text', label: 'Segmentin adı', placeholder: 'İki şubeli mahalle bakkalları', maxLength: 120 },
          { key: 'behavior', type: 'textarea', label: 'Davranış. Bu grup problemi nasıl yaşıyor ve bugün ne yapıyor?', required: true, rows: 3, maxLength: 500, placeholder: 'Her akşam fişleri elle sayıyor. Haftada bir hata buluyor.' },
          { key: 'context', type: 'textarea', label: 'Bağlam. Problem hangi ortamda ve ne zaman ortaya çıkıyor?', rows: 2, maxLength: 300, placeholder: 'Akşam kapanışta, dükkânda, yalnızken.' },
          { key: 'budget', type: 'text', label: 'Bütçe. Bu grup benzer bir çözüme ne kadar harcıyor?', placeholder: 'Ayda 300 TL', maxLength: 160 },
        ],
      },
      {
        title: 'Üç rol',
        when: { any: [{ profile: { customer: ['isletme'] } }, { profile: { customer: ['kamu'] } }, { profile: { marketplaceBuyer: ['isletme'] } }, { profile: { marketplaceSeller: ['isletme'] } }] },
        fields: [
          { key: 'rolesNote', type: 'info', label: 'Neden ayrı yazılır?', tone: 'ipucu', text: 'İşletmede kullanan, ödeyen ve karar veren kişi ayrı olabilir. Üçüne de ulaşmanız gerekir.' },
          { key: 'userPerson', type: 'text', label: 'Kullanan kişi', placeholder: 'Kasadaki çalışan', span: 8 },
          { key: 'payerPerson', type: 'text', label: 'Ödeyen kişi', placeholder: 'Dükkân sahibi', span: 8 },
          { key: 'deciderPerson', type: 'text', label: 'Karar veren kişi', placeholder: 'Dükkân sahibi veya ortağı', span: 8 },
        ],
      },
      {
        title: 'Ulaşma yolu',
        fields: [
          { key: 'accessPath', type: 'textarea', label: 'Bu gruba nasıl ulaşacaksınız?', required: true, rows: 3, maxLength: 500, placeholder: 'Semt pazarında yüz yüze. Bakkallar derneği üzerinden. Tanıdık bakkalın tavsiyesiyle.' },
          { key: 'accessPlace', type: 'text', label: 'Yer', placeholder: 'Semt pazarı, dernek, toptancı', span: 8 },
          { key: 'accessChannel', type: 'text', label: 'Kanal', placeholder: 'Yüz yüze, telefon, sosyal medya', span: 8 },
          { key: 'accessTrust', type: 'text', label: 'Güven aracı', placeholder: 'Tanıdık tavsiyesi, dernek, referans müşteri', span: 8 },
          { key: 'accessCost', type: 'money', label: 'Bir kişiye ulaşmanın tahmini maliyeti', help: 'Tahmin yazın. Adım 24\'te gerçek sayı ölçülür.' },
        ],
      },
      {
        title: 'Pazar yeri tarafı',
        when: { profile: { customer: ['pazarYeri'] } },
        fields: [
          { key: 'eagerSide', type: 'segmented', label: 'Hangi taraf daha istekli?', options: [
            { value: 'satan', label: 'Satan taraf' },
            { value: 'alan', label: 'Alan taraf' },
            { value: 'esit', label: 'İkisi de eşit' },
          ] },
          { key: 'eagerSideNote', type: 'info', label: 'Sonraki adım', tone: 'ipucu', text: 'Daha istekli taraftan başlayın. İlk toplanacak tarafı Adım 11\'de yazacaksınız.', when: { field: { key: 'eagerSide', in: ['satan', 'alan'] } } },
        ],
      },
    ],
    output: 'Bir sayfalık ilk segment kartı. Üç rol. Ulaşma yolu.',
    outcomeTable: [
      { condition: 'Segmente ulaşma yolu yoksa', result: 'Segmenti değiştirin. Ulaşılamayan müşteri müşteri değildir.' },
      { condition: 'Pazar yeri ve bir taraf çok daha istekli', result: 'O taraftan başlayın. Adım 11\'de kararı yazın.' },
    ],
    models: [124, 35],
    completeWhen: ['behavior', 'accessPath'],
  },
]
