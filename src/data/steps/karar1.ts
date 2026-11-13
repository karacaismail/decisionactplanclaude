import type { StepDef } from '../schema'

const RATE5 = ['Çok zayıf', 'Zayıf', 'Orta', 'İyi', 'Çok iyi']

export const KARAR1: StepDef[] = [
  {
    id: '00',
    decision: 1,
    title: 'İşin tanımı',
    question: 'İşinizi yedi kısa soruyla anlatın.',
    mandatory: true,
    who: 'Kurucu.',
    shortPath: true,
    intro: 'Her cevap planı daraltır. Kod yoktur. Cevaplar kelimeyle saklanır. Örneğin "Dükkânlara tamir hizmeti veriyorum. Tek başıma çalışıyorum."',
    sections: [
      {
        fields: [
          { key: 'customer', type: 'segmented', label: 'Müşteriniz kim?', required: true, options: [
            { value: 'tuketici', label: 'Tüketici', help: 'Kişiler kendi parasıyla alır.' },
            { value: 'isletme', label: 'İşletme', help: 'Kullanan, ödeyen ve karar veren ayrı kişiler olabilir.' },
            { value: 'kamu', label: 'Kamu veya büyük kurum', help: 'Alım süresi uzundur. Bütçe onayı ayrıdır.' },
            { value: 'pazarYeri', label: 'İki taraflı pazar yeri', help: 'Satan ve alan tarafı ayrı izlersiniz.' },
          ] },
          { key: 'marketplaceSeller', type: 'segmented', label: 'Satan taraf kim?', when: { field: { key: 'customer', equals: 'pazarYeri' } }, options: [{ value: 'tuketici', label: 'Tüketici' }, { value: 'isletme', label: 'İşletme' }] },
          { key: 'marketplaceBuyer', type: 'segmented', label: 'Alan taraf kim?', when: { field: { key: 'customer', equals: 'pazarYeri' } }, options: [{ value: 'tuketici', label: 'Tüketici' }, { value: 'isletme', label: 'İşletme' }] },
          { key: 'offering', type: 'segmented', label: 'Ne satıyorsunuz?', required: true, options: [
            { value: 'dijital', label: 'Dijital ürün' },
            { value: 'fiziksel', label: 'Fiziksel ürün', help: 'Tedarik, stok ve kargo işin parçasıdır.' },
            { value: 'hizmet', label: 'Hizmet', help: 'Hizmet tanımı ürün yerine geçer.' },
            { value: 'donanim', label: 'Donanım veya derin teknoloji', help: 'Teknik ön kanıt zorunludur. Süreler uzar.' },
          ] },
          { key: 'needsPremises', type: 'toggle', label: 'İş için dükkân, atölye veya mekân gerekiyor mu?', onLabel: 'Evet, mekân gerekiyor', offLabel: 'Hayır' },
          { key: 'regulation', type: 'segmented', label: 'Sektör ne kadar düzenlemeli?', required: true, options: [
            { value: 'dusuk', label: 'Düşük' },
            { value: 'yuksek', label: 'Yüksek', help: 'Sağlık, finans, gıda, eğitim ve enerji yüksektir. İzinler satıştan önce gerekir.' },
          ] },
          { key: 'team', type: 'segmented', label: 'Kaç kişisiniz?', required: true, options: [{ value: 'tekKurucu', label: 'Tek kurucu' }, { value: 'ekip', label: 'Ekip' }] },
          { key: 'teamSize', type: 'number', label: 'Kaç kişi?', min: 2, max: 50, when: { field: { key: 'team', equals: 'ekip' } } },
          { key: 'funding', type: 'segmented', label: 'Para nereden gelecek?', required: true, options: [
            { value: 'kendi', label: 'Kendi param' },
            { value: 'dis', label: 'Dış para', help: 'Yatırımcı, hibe veya kredi. Kurumun yazılı koşulunu isteyin.' },
          ] },
          { key: 'market', type: 'segmented', label: 'Pazar var mı?', required: true, options: [
            { value: 'varOlan', label: 'Var olan pazar', help: 'Müşteri ihtiyacı bilir. Rakip vardır.' },
            { value: 'yeni', label: 'Yeni pazar', help: 'İhtiyaç henüz tanımlanmamış. Keşif uzar.' },
          ] },
          { key: 'start', type: 'segmented', label: 'Nereden başlıyorsunuz?', required: true, options: [
            { value: 'sifirdan', label: 'Sıfırdan' },
            { value: 'devralma', label: 'Var olan bir işi devralıyorum', help: 'Önce devralma girişini yapın.' },
          ] },
          { key: 'paid', type: 'toggle', label: 'Müşteriden para alacak mısınız?', onLabel: 'Evet, ücretli', offLabel: 'Hayır, ücretsiz veya kamu bütçesiyle' },
          { key: 'smallReversible', type: 'toggle', label: 'Bu küçük ve geri alınabilir bir iş mi?', help: 'Küçük işte bugünkü yöntem ile bir alternatif yeter. Ağır yatırımda üç yol aranır.', onLabel: 'Evet, küçük ve geri alınabilir', offLabel: 'Hayır, ağır yatırım' },
          { key: 'description', type: 'textarea', label: 'İşinizi kendi sözlerinizle yazın', rows: 3, maxLength: 400, placeholder: 'Örneğin: Dükkânlara tamir hizmeti veriyorum. Tek başıma çalışıyorum. İlk müşterimi arıyorum.' },
        ],
      },
    ],
    output: 'Yedi seçimlik profil. Plan bu profile göre daralır.',
    models: [],
    completeWhen: ['customer', 'offering', 'regulation', 'team', 'funding', 'market', 'start'],
  },
  {
    id: '01',
    decision: 1,
    title: 'Kurucu niyeti ve çıkış yönü',
    question: 'Bu işi neden yapıyorsunuz? Nereye varmak istiyorsunuz?',
    mandatory: true,
    who: 'Kurucu. Ortak varsa her ortak ayrı yazar.',
    shortPath: true,
    howTo: [
      '"Bu işi neden yapıyorum?" diye sorun. Cevaba beş kez "neden?" diye sorun. Son cevap çekirdek nedendir.',
      'Çıkış yönünü seçin. Kesin karar gerekmez. Yön yeter.',
      'Kendinizi dört konuda puanlayın. Toplam en az 12 olmalı. Hiçbir konu 2 altında olmamalı.',
      'Ortak varsa beş konuda uyum kontrolü yapın. Hak ediş yapısını konuşun. Hak ediş, ortağın payını zamanla kazanmasıdır.',
    ],
    sections: [
      {
        title: 'Beş neden',
        fields: [
          { key: 'whys', type: 'repeater', label: 'Neden zinciri', addLabel: 'Bir "neden" daha', minRows: 1, maxRows: 5, columns: [{ key: 'why', type: 'text', label: 'Neden?', placeholder: 'Çünkü...' }] },
          { key: 'coreReason', type: 'text', label: 'Çekirdek neden. Tek cümle.', maxLength: 160 },
        ],
      },
      {
        title: 'Çıkış yönü',
        fields: [
          { key: 'exitDirection', type: 'segmented', label: 'Hangi yön niyetinizle uyumlu?', required: true, options: [
            { value: 'karli', label: 'Kârlı küçük şirket' },
            { value: 'buyume', label: 'Yatırım alıp büyümek veya satılmak' },
            { value: 'olcek', label: 'Çok büyük ölçek' },
          ] },
          { key: 'exitNote', type: 'info', label: 'Dikkat', tone: 'uyari', text: 'Çok büyük ölçek seçtiniz ama para kaynağınız kendi paranız. Bu bir çelişkidir. Yönü veya para kaynağını yeniden düşünün.', when: { all: [{ field: { key: 'exitDirection', equals: 'olcek' } }, { profile: { funding: ['kendi'] } }] } },
        ],
      },
      {
        title: 'Kurucu ile pazar uyumu',
        description: 'Her konuda 1 ile 5 arası puan verin.',
        fields: [
          { key: 'fitDomain', type: 'rate', label: 'Alan bilgisi. Rakipleri ve başarısızlıkları ne kadar biliyorsunuz?', labels: RATE5, span: 12 },
          { key: 'fitStory', type: 'rate', label: 'Kişisel hikâye. Bu problemi yaşadınız mı?', labels: RATE5, span: 12 },
          { key: 'fitAccess', type: 'rate', label: 'Müşteriye erişim. Hedef müşterilere ulaşabiliyor musunuz?', labels: RATE5, span: 12 },
          { key: 'fitSkill', type: 'rate', label: 'Teknik veya ticari beceri. Çözüm için gereken beceri sizde var mı?', labels: RATE5, span: 12 },
        ],
      },
      {
        title: 'Ortaklar',
        when: { profile: { team: ['ekip'] } },
        fields: [
          { key: 'partners', type: 'repeater', label: 'Ortak uyum kartı', addLabel: 'Ortak ekle', columns: [
            { key: 'name', type: 'text', label: 'Ortak' },
            { key: 'success', type: 'text', label: 'Başarı tanımı' },
            { key: 'time', type: 'text', label: 'Haftalık zaman' },
            { key: 'risk', type: 'select', label: 'Risk toleransı', options: [{ value: 'dusuk', label: 'Düşük' }, { value: 'orta', label: 'Orta' }, { value: 'yuksek', label: 'Yüksek' }] },
            { key: 'role', type: 'text', label: 'Rolü' },
          ] },
          { key: 'vesting', type: 'text', label: 'Hak ediş yapısı', placeholder: 'Yaygın yapı 4 yıldır. İlk yıl bitmeden ayrılan pay almaz.' },
          { key: 'disputeRule', type: 'text', label: 'Anlaşmazlıkta kim karar verir?' },
        ],
      },
    ],
    output: 'Bir sayfalık niyet ve yön özeti. Dört puanlık uyum kartı.',
    outcomeTable: [
      { condition: 'Uyum puanı toplam 12 altında', result: 'Devam etmeyin. Önce eksik konuda 3 ay deneyim kazanın. Ya da güçlü bir ortak bulun.' },
      { condition: 'Bir konuda puan 2 altında', result: 'Toplam yüksek olsa da devam etmeyin.' },
      { condition: 'Ortaklar başarı tanımında anlaşamıyor', result: 'Karar 2\'ye geçmeyin. Önce bu konuyu çözün.' },
    ],
    models: [115, 31, 45, 40],
    completeWhen: ['whys', 'exitDirection', 'fitDomain', 'fitStory', 'fitAccess', 'fitSkill'],
    chart: {
      kind: 'radar',
      title: 'Kurucu ile pazar uyumu',
      summary: (v) => {
        const vals = ['fitDomain', 'fitStory', 'fitAccess', 'fitSkill'].map((k) => Number(v[k] ?? 0))
        const t = vals.reduce((a, b) => a + b, 0)
        if (!vals.some((x) => x > 0)) return ''
        return t >= 12 && vals.every((x) => x >= 2) ? `Toplam ${t}. Eşik geçildi.` : `Toplam ${t}. Eşik 12 ve her konuda en az 2.`
      },
      build: (v) => {
        const keys = ['fitDomain', 'fitStory', 'fitAccess', 'fitSkill']
        const labels = ['Alan bilgisi', 'Hikâye', 'Erişim', 'Beceri']
        const vals = keys.map((k) => Number(v[k] ?? 0))
        if (!vals.some((x) => x > 0)) return null
        return {
          option: { radar: { indicator: labels.map((l) => ({ name: l, max: 5 })), radius: '65%' }, series: [{ type: 'radar', data: [{ value: vals, name: 'Kurucu' }], areaStyle: { opacity: 0.2 } }] },
          table: { head: ['Konu', 'Puan'], rows: labels.map((l, i) => [l, vals[i]]) },
        }
      },
    },
  },
  {
    id: '02',
    decision: 1,
    title: 'Başarı tanımı, durdurma kuralları ve kaynak sınırı',
    question: 'Ne zaman başarılı sayılırsınız? Hangi bulgu sizi durdurur? Ne kadar harcayabilirsiniz?',
    mandatory: true,
    who: 'Kurucu.',
    shortPath: true,
    howTo: [
      'Planın sonunda neyi görmek istediğinizi bir cümleyle yazın. Örneğin "12 ay içinde ödeyen 30 müşteri."',
      'En az 3 durdurma kuralı yazın. Her kuralda bir sayı olsun.',
      'Aylık zorunlu giderinizi ve elinizdeki parayı yazın. Pist kendiliğinden hesaplanır.',
      'Üç sınır yazın. Toplam harcama. Bitiş tarihi. Karar başına deneme hakkı. Süre uzatmak ek harcama yetkisi vermez.',
    ],
    sections: [
      {
        fields: [
          { key: 'successSentence', type: 'text', label: 'Başarı cümlesi', required: true, placeholder: '12 ay içinde ödeyen 30 müşteri.', maxLength: 200 },
          { key: 'stopRules', type: 'repeater', label: 'Durdurma kuralları', addLabel: 'Kural ekle', minRows: 3, columns: [{ key: 'rule', type: 'text', label: 'Kural. Sayı içersin.', placeholder: '20 görüşmede 3\'ten az kişi problemi yaşıyorsa durdururum.' }] },
        ],
      },
      {
        title: 'Pist',
        fields: [
          { key: 'monthlyBurnKurus', type: 'money', label: 'Aylık zorunlu gider', required: true, span: 12 },
          { key: 'cashKurus', type: 'money', label: 'Elinizdeki para', required: true, span: 12 },
          { key: 'extraIncome', type: 'toggle', label: 'Bu sırada başka bir geliriniz var mı?', onLabel: 'Evet', offLabel: 'Hayır' },
        ],
      },
      {
        title: 'Üç sınır',
        fields: [
          { key: 'budgetKurus', type: 'money', label: 'Bu plana ayrılan en çok para', required: true, span: 8 },
          { key: 'deadline', type: 'date', label: 'Bitiş tarihi', required: true, span: 8 },
          { key: 'retriesPerDecision', type: 'number', label: 'Karar başına en çok deneme', required: true, min: 1, max: 4, span: 8 },
          { key: 'hoursPerWeek', type: 'number', label: 'Haftada kaç saat ayıracaksınız?', unit: 'saat', min: 1, max: 80, span: 8 },
          { key: 'hoursNote', type: 'info', label: 'Dikkat', tone: 'uyari', text: 'Haftada 10 saatten az zaman var. Karar sürelerini iki katıyla planlayın. Yeni süre ek harcama yetkisi vermez.', when: { all: [{ field: { key: 'hoursPerWeek', truthy: true } }, { not: { field: { key: 'hoursPerWeek', in: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80] } } }] } },
        ],
      },
    ],
    output: 'Başarı cümlesi. Üç durdurma kuralı. Pist. Üç sınır.',
    outcomeTable: [
      { condition: 'Pist, Karar 1 ile Karar 6 toplam süresinden kısa', result: 'Önce ek gelir veya para bulun. Ya da en kısa yolu izleyin.' },
      { condition: 'Durdurma kuralı yazamıyorsanız', result: 'Karar 2\'ye geçmeyin. İkinci görüş alın.' },
    ],
    models: [17, 95],
    completeWhen: ['successSentence', 'stopRules', 'monthlyBurnKurus', 'cashKurus', 'budgetKurus', 'deadline', 'retriesPerDecision'],
    chart: {
      kind: 'bar',
      title: 'Pist ve plan süresi',
      summary: (v) => {
        const burn = Number(v.monthlyBurnKurus ?? 0), cash = Number(v.cashKurus ?? 0)
        if (!burn || !cash) return ''
        const m = Math.floor(cash / burn)
        return m < 6 ? `Pist ${m} ay. Karar 1 ile 6 en az 11 hafta sürer. Dikkat.` : `Pist ${m} ay.`
      },
      build: (v) => {
        const burn = Number(v.monthlyBurnKurus ?? 0), cash = Number(v.cashKurus ?? 0)
        if (!burn || !cash) return null
        const m = Math.floor(cash / burn)
        return {
          option: { grid: { left: 110, right: 24, top: 16, bottom: 24 }, xAxis: { type: 'value', name: 'ay' }, yAxis: { type: 'category', data: ['Pist', 'Plan en az', 'Plan en çok'] }, series: [{ type: 'bar', data: [m, 3, 6], label: { show: true, position: 'right' } }] },
          table: { head: ['Ölçü', 'Ay'], rows: [['Pist', m], ['Plan en az', 3], ['Plan en çok', 6]] },
        }
      },
    },
  },
  {
    id: '03',
    decision: 1,
    title: 'Karar hakları',
    question: 'Kim önerir? Kim itiraz eder? Kim karar verir?',
    mandatory: { profile: { team: ['ekip'] } },
    whenNote: 'Yalnız ekip varsa yapılır. Tek kurucu bu adımı atlar.',
    who: 'Kurucular birlikte.',
    shortPath: false,
    howTo: ['Her kapı için tek bir karar sahibi yazın.', 'Kim öneri yapar? Kim itiraz eder? Kime bilgi verilir? Üçünü de yazın.', 'Anlaşmazlık kuralını yazın.'],
    sections: [
      {
        fields: [
          { key: 'rights', type: 'repeater', label: 'Karar hakları tablosu', addLabel: 'Kapı ekle', columns: [
            { key: 'gate', type: 'select', label: 'Kapı', options: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ value: String(n), label: `Kapı ${n}` })) },
            { key: 'owner', type: 'text', label: 'Karar sahibi' },
            { key: 'proposer', type: 'text', label: 'Öneren' },
            { key: 'objector', type: 'text', label: 'İtiraz eden' },
            { key: 'informed', type: 'text', label: 'Bilgilenen' },
          ] },
          { key: 'disputeRule', type: 'textarea', label: 'Anlaşmazlık kuralı', rows: 2, placeholder: 'Anlaşamazsak dış göz dinlenir. Son kararı karar sahibi verir.' },
        ],
      },
    ],
    output: 'Karar hakları tablosu ve anlaşmazlık kuralı.',
    models: [89, 57],
    completeWhen: ['rights'],
  },
  {
    id: '04',
    decision: 1,
    title: 'Dış çevre taraması',
    question: 'Dışarıda ne değişiyor? Hangi izin gerekiyor?',
    mandatory: false,
    whenNote: 'Yüksek düzenleme veya yeni pazar ise tam sürüm zorunludur. Diğer durumda hafif sürüm 2 saattir.',
    who: 'Kurucu.',
    shortPath: false,
    howTo: [
      'Hafif sürüm: altı dış etkenden sizi en çok etkileyen 2 veya 3 tanesini seçin. Her etken için bir soru ve bir eylem yazın.',
      'Tam sürüm: altı etkeni tarayın. Sektörün kâr potansiyelini beş güçle ölçün. İki belirsizlikten dört senaryo kurun. İzinleri listeleyin.',
    ],
    sections: [
      {
        title: 'Hafif tarama',
        fields: [
          { key: 'factors', type: 'chips', label: 'Sizi en çok etkileyen etkenler', max: 3, options: [
            { value: 'siyaset', label: 'Siyaset' }, { value: 'ekonomi', label: 'Ekonomi' }, { value: 'toplum', label: 'Toplum' }, { value: 'teknoloji', label: 'Teknoloji' }, { value: 'hukuk', label: 'Hukuk' }, { value: 'cevre', label: 'Çevre' },
          ] },
          { key: 'factorNotes', type: 'repeater', label: 'Her etken için soru ve eylem', addLabel: 'Etken ekle', columns: [
            { key: 'factor', type: 'text', label: 'Etken' },
            { key: 'change', type: 'text', label: 'Önümüzdeki 12 ayda ne değişiyor?' },
            { key: 'action', type: 'text', label: 'Yapılacak eylem' },
          ] },
        ],
      },
      {
        title: 'Tam tarama',
        when: { any: [{ profile: { regulation: ['yuksek'] } }, { profile: { market: ['yeni'] } }] },
        fields: [
          { key: 'forceNew', type: 'rate', label: 'Yeni girenlerin gücü', labels: RATE5, span: 12 },
          { key: 'forceSub', type: 'rate', label: 'İkamelerin gücü. İkame, aynı ihtiyacı gören farklı çözümdür.', labels: RATE5, span: 12 },
          { key: 'forceBuyer', type: 'rate', label: 'Alıcıların gücü', labels: RATE5, span: 12 },
          { key: 'forceSupplier', type: 'rate', label: 'Tedarikçilerin gücü', labels: RATE5, span: 12 },
          { key: 'forceRivalry', type: 'rate', label: 'Rekabetin şiddeti', labels: RATE5, span: 12 },
          { key: 'uncertainty1', type: 'text', label: 'Birinci kritik belirsizlik', span: 12 },
          { key: 'uncertainty2', type: 'text', label: 'İkinci kritik belirsizlik', span: 12 },
          { key: 'scenarios', type: 'repeater', label: 'Dört senaryo', addLabel: 'Senaryo ekle', maxRows: 4, columns: [
            { key: 'name', type: 'text', label: 'Senaryo' },
            { key: 'signal', type: 'text', label: 'Erken uyarı işareti' },
            { key: 'winCondition', type: 'text', label: 'Kazanma koşulu' },
          ] },
          { key: 'permits', type: 'repeater', label: 'İzinler ve ruhsatlar', addLabel: 'İzin ekle', columns: [
            { key: 'permit', type: 'text', label: 'İzin' },
            { key: 'months', type: 'number', label: 'Süre', unit: 'ay' },
            { key: 'beforeStep', type: 'text', label: 'Hangi işlemden önce gerekir?' },
          ] },
        ],
      },
    ],
    output: 'Hafif sürümde 1 sayfa özet. Tam sürümde beş güç, dört senaryo ve izin listesi.',
    outcomeTable: [
      { condition: 'Bir izin 6 aydan uzun sürüyor', result: 'Bu süreyi Karar 6 planına şimdiden ekleyin.' },
      { condition: 'Bir yasa 12 ay içinde iş modelini yasaklayabiliyor', result: 'Durdurma kuralı olarak yazın. Erken uyarı işaretini izleyin.' },
      { condition: 'Beş güç sektörde kâr olmadığını gösteriyor', result: 'Aynı sektörde farklı bir halka düşünün. Örneğin üretim yerine bakım hizmeti.' },
    ],
    models: [63, 62, 126, 32],
    completeWhen: ['factors'],
  },
]
