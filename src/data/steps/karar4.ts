import type { Condition, StepDef } from '../schema'
import { matchRate } from '@/engine/crux'
import { demandNumberIssues, peopleCalc } from '@/engine/integrity'

type Row = Record<string, unknown> & { _id: string }

interface ThresholdValue {
  value: number | null
  basis: string
  isGuess: boolean
}

const DIGITAL: Condition = { profile: { offering: ['dijital'] } }

export const KARAR4: StepDef[] = [
  {
    id: '13',
    decision: 4,
    title: 'Değer önerisi ve tek cümle',
    question: 'Müşteriye ne vaat ediyorsunuz? Bunu tek cümleyle söyleyebilir misiniz?',
    mandatory: true,
    who: 'Kurucu.',
    shortPath: true,
    howTo: [
      'Kalıbı doldurun. "[Müşteri] için [problem] karşısında [ölçülebilir sonuç] sağlayan [çözüm]."',
      'İkinci cümleyi doldurun. "[Bugünkü alternatiften] farkı [kanıtlanabilir fark]."',
      'Özellik yazmayın. Müşteri sonucu yazın. "Sipariş 3 günde teslim" yazın. "Hızlı kargo" yazmayın.',
      'Müşterinin işini, acısını ve kazancını sol tarafa yazın. Çözümün acı gidericisini ve kazanç yaratıcısını sağ tarafa yazın. İkisini eşleştirin.',
    ],
    sections: [
      {
        title: 'Tek cümle',
        description: 'Boşlukları doldurun. Uygulama parçaları tek cümle olarak gösterir.',
        fields: [
          { key: 'vpExample', type: 'info', label: 'Örnek', tone: 'ornek', text: 'Mahalle bakkalı için akşam sayım yükü karşısında 5 dakikada günlük satış raporu sağlayan telefon uygulaması. Kasa defterinden farkı, hatayı aynı gün göstermesi.' },
          { key: 'vpCustomer', type: 'text', label: 'Müşteri', required: true, placeholder: 'Mahalle bakkalı', maxLength: 120, span: 12 },
          { key: 'vpProblem', type: 'text', label: 'Problem', required: true, placeholder: 'Akşam sayım yükü', maxLength: 160, span: 12 },
          { key: 'vpResult', type: 'text', label: 'Ölçülebilir sonuç', required: true, placeholder: '5 dakikada günlük satış raporu', maxLength: 160, span: 12 },
          { key: 'vpSolution', type: 'text', label: 'Çözüm', required: true, placeholder: 'Telefon uygulaması', maxLength: 160, span: 12 },
          { key: 'vpAlternative', type: 'text', label: 'Bugünkü alternatif', placeholder: 'Kasa defteri', maxLength: 160, span: 12 },
          { key: 'vpDifference', type: 'text', label: 'Kanıtlanabilir fark', placeholder: 'Hatayı aynı gün gösterir', maxLength: 160, span: 12 },
        ],
      },
      {
        title: 'Değer önerisi kanvası',
        description: 'Sol taraf müşteri. Sağ taraf çözüm. Her sol satıra sağda bir karşılık olmalı.',
        fields: [
          { key: 'customerJobs', type: 'textarea', label: 'Müşterinin işi. Ne bitirmek istiyor?', rows: 2, maxLength: 300, span: 12 },
          { key: 'painRelievers', type: 'textarea', label: 'Acı giderici. Çözüm hangi acıyı azaltıyor?', rows: 2, maxLength: 300, span: 12 },
          { key: 'customerPains', type: 'textarea', label: 'Müşterinin acısı. Ne canını sıkıyor?', rows: 2, maxLength: 300, span: 12 },
          { key: 'gainCreators', type: 'textarea', label: 'Kazanç yaratıcı. Çözüm hangi kazancı sağlıyor?', rows: 2, maxLength: 300, span: 12 },
          { key: 'customerGains', type: 'textarea', label: 'Müşterinin kazancı. Ne elde etmek istiyor?', rows: 2, maxLength: 300, span: 12 },
          { key: 'unmatched', type: 'text', label: 'Karşılıksız kalan acı veya kazanç var mı?', placeholder: 'Boş bırakabilirsiniz.', maxLength: 200, span: 12 },
        ],
      },
    ],
    output: 'Tek cümle değer önerisi. Değer önerisi kanvası.',
    models: [97, 51],
    completeWhen: ['vpCustomer', 'vpProblem', 'vpResult', 'vpSolution'],
  },
  {
    id: '14',
    decision: 4,
    title: 'Hafif şirketleşme ve fatura',
    question: 'Para alacaksanız fatura kesebiliyor musunuz? Almayacaksanız bütçe ve yetki kimde?',
    mandatory: false,
    whenNote: 'Para alacaksanız yapılır. Ücretsiz hizmette veya kamu bütçesiyle sunulan hizmette bütçe sahibini ve uygulama yetkisini yazın.',
    who: 'Kurucu. Muhasebeciyle birlikte.',
    shortPath: true,
    howTo: [
      'Muhasebeciyle görüşün. Para alabilmek için en basit yolu seçin. Örneğin şahıs işletmesi. Ya da var olan bir işletme üzerinden fatura kesin.',
      'Fatura kesebilir hale gelin. Ödeme alma yolunu kurun. Havale, kart veya nakit.',
      'Müşteriyle yazılı bir teslim koşulu yapın. Bir sayfa yeter. Ne, ne zaman, kaç para ve iade koşulu.',
      'Yüksek düzenleme ise izinleri sorun. İzin gerekiyorsa para almadan önce izni alın. Alamıyorsanız yalnız ön kayıt ve niyet mektubu toplayın.',
      'Para almayacaksanız bütçe sahibini ve uygulama yetkisini yazılı kaydedin.',
    ],
    sections: [
      {
        fields: [
          { key: 'paidHint', type: 'info', label: 'Profiliniz', tone: 'ipucu', text: 'Adım 00\'da "Evet, ücretli" seçtiniz. "Ücretli" seçeneği sizin için uygundur.', when: { profile: { paid: [true] } } },
          { key: 'freeHint', type: 'info', label: 'Profiliniz', tone: 'ipucu', text: 'Adım 00\'da "ücretsiz veya kamu bütçesiyle" seçtiniz. "Ücretsiz" seçeneği sizin için uygundur.', when: { profile: { paid: [false] } } },
          { key: 'mode', type: 'segmented', label: 'Müşteriden para alacak mısınız?', required: true, options: [
            { value: 'ucretli', label: 'Ücretli', help: 'Para almadan önce fatura kesebilmeniz gerekir.' },
            { value: 'ucretsiz', label: 'Ücretsiz', help: 'Hizmet ücretsiz ya da kamu bütçesiyle verilir. Bütçe sahibi ve yetki yazılır.' },
          ] },
        ],
      },
      {
        title: 'Fatura ve tahsilat',
        when: { field: { key: 'mode', equals: 'ucretli' } },
        fields: [
          { key: 'canInvoice', type: 'toggle', label: 'Fatura kesebiliyor musunuz?', onLabel: 'Evet, fatura kesebiliyorum', offLabel: 'Hayır, henüz kesemiyorum' },
          { key: 'invoiceVia', type: 'text', label: 'Fatura hangi işletme üzerinden kesilecek?', placeholder: 'Kendi şahıs işletmem veya tanıdık bir işletme', maxLength: 200 },
          { key: 'paymentMethods', type: 'chips', label: 'Ödeme alma yolu', options: [
            { value: 'havale', label: 'Havale' },
            { value: 'kart', label: 'Kart' },
            { value: 'nakit', label: 'Nakit' },
          ] },
          { key: 'noInvoiceNote', type: 'info', label: 'Dikkat', tone: 'uyari', text: 'Fatura kesemiyorsunuz. Adım 15\'te para almayın. Ön kayıt, depozito sözü ve niyet mektubuyla yetinin.', when: { all: [{ field: { key: 'mode', equals: 'ucretli' } }, { not: { field: { key: 'canInvoice', truthy: true } } }] } },
        ],
      },
      {
        title: 'İzinler',
        when: { field: { key: 'mode', equals: 'ucretli' } },
        fields: [
          { key: 'permitChecklist', type: 'checklist', label: 'İzin kontrol listesi', items: [
            { value: 'muhasebeci', label: 'Muhasebeciyle görüştüm.' },
            { value: 'izinSoruldu', label: 'Satış için izin gerekip gerekmediğini sordum.' },
            { value: 'izinGerekmiyor', label: 'Satış için izin gerekmiyor.' },
            { value: 'izinAlindi', label: 'Gereken izni aldım.' },
            { value: 'teslimKosulu', label: 'Bir sayfalık teslim koşulunu yazdım.' },
          ] },
          { key: 'permitMonths', type: 'number', label: 'İzin alınması kaç ay sürer?', unit: 'ay', min: 0, max: 36, when: { profile: { regulation: ['yuksek'] } } },
          { key: 'permitLongNote', type: 'info', label: 'Dikkat', tone: 'uyari', text: 'İzin 3 aydan uzun sürüyor. Adım 15\'i izin gerektirmeyen bir yöntemle yapın. Örneğin ön kayıt.', when: { field: { key: 'permitMonths', in: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36] } } },
        ],
      },
      {
        title: 'Bütçe ve yetki',
        when: { field: { key: 'mode', equals: 'ucretsiz' } },
        fields: [
          { key: 'budgetOwner', type: 'text', label: 'Bütçe sahibi kim?', required: true, placeholder: 'Belediye sosyal işler birimi, dernek yönetimi', maxLength: 200 },
          { key: 'deliveryAuthorized', type: 'toggle', label: 'Uygulama yetkisi yazılı olarak verildi mi?', onLabel: 'Evet, yazılı yetki var', offLabel: 'Hayır' },
          { key: 'budgetEvidence', type: 'text', label: 'İmzalı kanıt', placeholder: 'Yazının tarihi ve imzalayan kişi', maxLength: 200 },
          { key: 'costPerServiceKurus', type: 'money', label: 'Hizmet başına gider', help: 'Bir kişiye hizmet vermek size kaça mal oluyor?' },
          { key: 'noPaymentNote', type: 'info', label: 'Not', tone: 'bilgi', text: 'Para alınmayacak. Adım 15\'te katılım ve bütçe kanıtını kullanacaksınız.' },
        ],
      },
      {
        title: 'Teslim koşulu',
        fields: [
          { key: 'deliveryTerms', type: 'textarea', label: 'Bir sayfalık teslim koşulu. Ne, ne zaman, kaç para ve iade koşulu.', rows: 4, maxLength: 800, placeholder: 'Günlük satış raporu. Her akşam saat 21\'de. Ayda 200 TL. İlk ay beğenmezse para iade.' },
        ],
      },
    ],
    output: 'Para alınacaksa fatura kesebilen bir işletme. Bir sayfalık teslim koşulu. Ücretsiz hizmette bütçe ve yetki kaydı.',
    outcomeTable: [
      { condition: 'Fatura kesemiyorsanız', result: 'Adım 15\'te para almayın. Ön kayıt, depozito sözü ve niyet mektubuyla yetinin.' },
      { condition: 'İzin alınması 3 aydan uzun sürüyorsa', result: 'Adım 15\'i izin gerektirmeyen bir yöntemle yapın. Örneğin ön kayıt.' },
    ],
    models: [],
    completeWhen: ['mode'],
  },
  {
    id: '15',
    decision: 4,
    title: 'Talep testi',
    question: 'Müşteri bu teklif için para, zaman veya imza veriyor mu?',
    mandatory: true,
    who: 'Kurucu.',
    timebox: '1 ile 3 hafta.',
    shortPath: true,
    intro: 'Bu adım planın en önemli adımıdır. Müşterinin ne dediği değil, ne yaptığı ölçülür.',
    howTo: [
      'Önce Adım 12\'nin sonucuna bakın. Yapamayacağınız şeyi test etmeyin.',
      'Adım 14\'teki fatura ve izin koşulunu doğrulayın. Fatura kesemiyorsanız para almayın.',
      'Test yöntemini profilinize göre seçin. Önerilen yöntem aşağıdaki kutuda yazar.',
      'Başarı eşiğini ve dayanağını testten önce yazın. Yazılı eşik tablodaki eşikten önce gelir.',
      'Testi 1 ile 3 hafta içinde bitirin.',
      'Her teklifi bir satır yapın. Sonucu kanıt merdivenine göre işaretleyin. Ödeme 1. basamaktır. Depozito 2. basamaktır. Tıklama ve e-posta 5. basamaktır.',
      'Ön kaydı ödeme saymayın. Aynı gözlemi iki ayrı taahhüt saymayın. Reddedenin gerekçesini sorun.',
    ],
    sections: [
      {
        title: 'Yöntem',
        fields: [
          { key: 'hintFiziksel', type: 'info', label: 'Önerilen yöntem', tone: 'ipucu', text: 'Fiziksel ürün satıyorsunuz. Ön sipariş veya depozito alın. Numune gösterin. Dükkân gerekiyorsa geçici satış noktası kullanın. Başlangıç eşiği en az 5 ön sipariş veya depozito.', when: { profile: { offering: ['fiziksel'] } } },
          { key: 'hintHizmet', type: 'info', label: 'Önerilen yöntem', tone: 'ipucu', text: 'Hizmet satıyorsunuz. Hizmeti elle verin. Ücret alın. Mekân gerekiyorsa paylaşımlı veya kiralık mekân kullanın. Başlangıç eşiği en az 3 ödeyen müşteri.', when: { profile: { offering: ['hizmet'] } } },
          { key: 'hintDonanim', type: 'info', label: 'Önerilen yöntem', tone: 'ipucu', text: 'Donanım yapıyorsunuz. Adım 12\'deki teknik ön kanıtı gösterin. Niyet mektubu isteyin. Niyet mektubu, "koşullar uyarsa alırım" diye imzalanan yazıdır. Başlangıç eşiği en az 2 niyet mektubu.', when: { profile: { offering: ['donanim'] } } },
          { key: 'hintTuketici', type: 'info', label: 'Önerilen yöntem', tone: 'ipucu', text: 'Tüketiciye dijital ürün satıyorsunuz. Sahte kapı sayfası açın. Sahte kapı, henüz olmayan ürün için açılan sayfadır. Fiyatı gösterin. Ön kayıt veya ön ödeme isteyin. Başlangıç eşiği 100 kişiden en az 3 ön kayıt. Ön kayıt yapanların en az 3\'ü ön ödeme veya depozito verir.', when: { all: [DIGITAL, { profile: { customer: ['tuketici'] } }] } },
          { key: 'hintIsletme', type: 'info', label: 'Önerilen yöntem', tone: 'ipucu', text: 'İşletmeye dijital ürün satıyorsunuz. Elle hizmet denemesi veya pilot teklifi yapın. Pilot, bir müşteride yapılan küçük deneme kullanımıdır. Niyet mektubu isteyin. Başlangıç eşiği en az 3 niyet mektubu veya ücretli pilot.', when: { all: [DIGITAL, { profile: { customer: ['isletme'] } }] } },
          { key: 'hintKamu', type: 'info', label: 'Önerilen yöntem', tone: 'ipucu', text: 'Kamuya dijital ürün satıyorsunuz. Pilot için yazılı anlaşma isteyin. Başlangıç eşiği en az 1 imzalı pilot anlaşması.', when: { all: [DIGITAL, { profile: { customer: ['kamu'] } }] } },
          { key: 'hintPazarYeri', type: 'info', label: 'Önerilen yöntem', tone: 'ipucu', text: 'Pazar yeri kuruyorsunuz. Adım 11\'de seçtiğiniz ilk tarafı elle toplayın. Diğer tarafa sahte kapı açın. Başlangıç eşiği ilk tarafta 10 kayıt, diğer tarafta 3 ödeme.', when: { all: [DIGITAL, { profile: { customer: ['pazarYeri'] } }] } },
          { key: 'hintUcretsiz', type: 'info', label: 'Ücretsiz hizmet', tone: 'bilgi', text: 'Para almayacaksınız. Katılım ve bütçe kanıtını ölçün. Örneğin hizmeti almaya gelen kişi sayısı ve imzalı bütçe yazısı.', when: { field: { step: '14', key: 'mode', equals: 'ucretsiz' } } },
          { key: 'method', type: 'select', label: 'Seçtiğiniz test yöntemi', required: true, options: [
            { value: 'sahteKapi', label: 'Sahte kapı sayfası. Fiyat gösterilir, ön kayıt veya ön ödeme istenir.' },
            { value: 'elleHizmet', label: 'Elle hizmet denemesi veya pilot teklifi. Niyet mektubu istenir.' },
            { value: 'pilotAnlasma', label: 'Pilot için yazılı anlaşma.' },
            { value: 'pazarYeri', label: 'İlk tarafı elle toplama. Diğer tarafa sahte kapı.' },
            { value: 'onSiparis', label: 'Ön sipariş veya depozito. Numune gösterilir.' },
            { value: 'ucretliHizmet', label: 'Hizmeti elle verme. Ücret alınır.' },
            { value: 'teknikOnKanit', label: 'Teknik ön kanıt gösterme. Niyet mektubu istenir.' },
            { value: 'katilim', label: 'Ücretsiz hizmette katılım ve bütçe kanıtı.' },
          ] },
          { key: 'methodNote', type: 'textarea', label: 'Testi kısaca anlatın. Kime, neyi, hangi fiyatla sundunuz?', rows: 2, maxLength: 400 },
        ],
      },
      {
        title: 'Eşik ve süre',
        fields: [
          { key: 'threshold', type: 'threshold', label: 'Başarı eşiği. Kaç taahhüt gelirse test başarılıdır?', unit: 'taahhüt', help: 'Testten önce yazın. Dayanak yazın. Yalnız 1, 2 ve 3. basamaktaki taahhütler sayılır.' },
          { key: 'priceOfferedKurus', type: 'money', label: 'Teklif ettiğiniz fiyat', help: 'Müşteriye söylediğiniz gerçek fiyat.', span: 12 },
          { key: 'priceAcceptedCount', type: 'number', label: 'Bu fiyatı kabul eden kişi sayısı', unit: 'kişi', min: 0, span: 12 },
          { key: 'startDate', type: 'date', label: 'Başlangıç tarihi', span: 12 },
          { key: 'endDate', type: 'date', label: 'Bitiş tarihi', help: 'En çok 3 hafta sonra.', span: 12 },
        ],
      },
      {
        title: 'Teklifler',
        description: 'Her teklif bir satır. Reddedenin gerekçesini mutlaka yazın.',
        fields: [
          { key: 'reached', type: 'number', label: 'Kaç kişiye ulaşıldı?', unit: 'kişi', min: 0, help: 'Sayfayı gören veya teklifi duyan herkes.', span: 12 },
          { key: 'tried', type: 'number', label: 'Kaç kişi denedi?', unit: 'kişi', min: 0, help: 'Ön kayıt yapan, görüşmeyi kabul eden veya numuneyi inceleyen.', span: 12 },
          { key: 'offers', type: 'repeater', label: 'Teklif defteri', addLabel: 'Teklif ekle', minRows: 1, columns: [
            { key: 'person', type: 'text', label: 'Kişi veya kurum' },
            { key: 'result', type: 'select', label: 'Sonuç', options: [
              { value: 'kabul', label: 'Kabul etti' },
              { value: 'ret', label: 'Reddetti' },
            ] },
            { key: 'ladder', type: 'evidenceLadder', label: 'Kanıt basamağı' },
            { key: 'reason', type: 'text', label: 'Gerekçe', placeholder: 'Reddettiyse neden? Kabul ettiyse ne verdi?' },
          ] },
          { key: 'offerPeople', type: 'calc', label: 'Kişi denetimi', emptyText: 'Teklif yazınca denetim burada görünür.', compute: (v) => peopleCalc(v.offers, 'person') },
        ],
      },
      {
        title: 'Pazar yeri eşleşmesi',
        description: 'Kayıtlı satıcı ile cevap veren satıcıyı ayrı sayın. Eşleşme ile tamamlanan işi ayrı sayın.',
        when: { profile: { customer: ['pazarYeri'] } },
        fields: [
          { key: 'validRequests', type: 'number', label: 'Geçerli talep sayısı', help: 'Ölçmediyseniz boş bırakın. Ölçtünüz ve hiç talep gelmediyse 0 yazın.', min: 0, unit: 'talep', span: 12 },
          { key: 'matchedRequests', type: 'number', label: 'Uygun teklif alan talep sayısı', min: 0, unit: 'talep', span: 12 },
          { key: 'matchCalc', type: 'calc', label: 'Eşleşme oranı', emptyText: 'İki sayıyı yazınca oran burada görünür.', compute: (v) => {
            const r = matchRate(v.validRequests, v.matchedRequests)
            if (r.state === 'yok') return null
            if (r.state === 'sifir') return { value: 'Hesaplanamaz', lines: ['Geçerli talep sayısı sıfır. Bu yüzden oran hesaplanmaz.'] }
            if (r.state === 'hata') return { value: 'Hesaplanamaz', lines: ['Uygun teklif alan talep, geçerli talebi geçiyor.'], warn: 'Sayıları inceleyin.' }
            return { value: `Yüzde ${r.percent}`, lines: [`${v.validRequests} geçerli talebin ${v.matchedRequests} tanesi uygun teklif aldı.`] }
          } },
          { key: 'registeredSellers', type: 'number', label: 'Kayıtlı satıcı sayısı', min: 0, unit: 'satıcı', span: 12 },
          { key: 'activeSellers', type: 'number', label: 'Gerçek talebe cevap veren satıcı sayısı', min: 0, unit: 'satıcı', span: 12 },
          { key: 'matchHours', type: 'number', label: 'Uygun teklif kaç saatte geliyor?', min: 0, unit: 'saat', span: 12 },
        ],
      },
      {
        title: 'Fayda',
        description: 'Ücretsiz hizmette katılanı, yararlananı ve bütçeyi vereni ayrı yazın.',
        when: { profile: { paid: [false] } },
        fields: [
          { key: 'participants', type: 'number', label: 'Kaç kişi katıldı?', min: 0, unit: 'kişi', span: 12 },
          { key: 'beneficiaries', type: 'number', label: 'Kaç kişi gerçekten yararlandı?', min: 0, unit: 'kişi', span: 12 },
          { key: 'benefitNote', type: 'textarea', label: 'Yararlanan kişide ne değişti?', rows: 2, maxLength: 300, placeholder: 'Örneğin 12 kişi başvurusunu yardımsız tamamladı.' },
        ],
      },
      {
        title: 'Sonuç',
        fields: [
          { key: 'resultNote', type: 'textarea', label: 'Sonuç ne oldu? Eşik geçildi mi? Kanıt hangi basamakta?', rows: 3, maxLength: 500, placeholder: '12 bakkala teklif sundum. 4\'ü ön ödeme yaptı. Eşik 3 idi. Kanıt 1. basamakta.' },
          { key: 'secondTestNeeded', type: 'toggle', label: 'Eşik geçildi ama kanıt 4 veya 5. basamakta mı?', help: 'Evet ise beyan var, ödeme yok. İkinci testte ödeme isteyin.', onLabel: 'Evet, ikinci test gerekli', offLabel: 'Hayır' },
        ],
      },
    ],
    output: 'Talep testi raporu. Yöntem. Ulaşılan kişi sayısı. Eşik. Sonuç. Kanıt basamağı.',
    outcomeTable: [
      { condition: 'Eşik geçildi, kanıt 1 veya 2. basamak', result: 'Talep var. Adım 16\'ya geçin.' },
      { condition: 'Eşik geçildi, kanıt 3. basamak', result: 'Talep var ama zayıf. Adım 16\'ya geçin. Karar 6\'da ödemeyi ilk ölçüt yapın.' },
      { condition: 'Eşik geçildi ama kanıt 4 veya 5. basamak', result: 'Beyan var, ödeme yok. İkinci testte ödeme isteyin.' },
      { condition: 'Eşik geçilmedi, yanlış segmente ulaşıldı', result: 'Segmenti değiştirin. Testi tekrarlayın.' },
      { condition: 'Eşik geçilmedi, problem var ama çözüm ilgi görmedi', result: 'Adım 11\'deki ikinci yolu test edin.' },
      { condition: 'Her iki yol da ilgi görmedi', result: 'Adım 05\'e dönün. Problem acı vermiyor olabilir.' },
    ],
    models: [15],
    completeWhen: ['method', 'threshold', 'offers'],
    validate: (values) => demandNumberIssues(values),
    chart: {
      kind: 'funnel',
      title: 'Talep hunisi',
      summary: (v) => {
        const offers = (v.offers as Row[] | undefined) ?? []
        const th = v.threshold as ThresholdValue | undefined
        if (offers.length === 0) return ''
        const strong = offers.filter((o) => o.result === 'kabul' && Number(o.ladder) >= 1 && Number(o.ladder) <= 3).length
        if (!th?.value) return `${strong} güçlü taahhüt var. Eşiği yazın.`
        return strong >= th.value ? `${strong} güçlü taahhüt var. Eşik ${th.value}. Eşik geçildi.` : `${strong} güçlü taahhüt var. Eşik ${th.value}. Eşik geçilmedi.`
      },
      build: (v) => {
        const offers = (v.offers as Row[] | undefined) ?? []
        const reached = Number(v.reached ?? 0)
        const tried = Number(v.tried ?? 0)
        if (!reached && !tried && offers.length === 0) return null
        const committed = offers.filter((o) => o.result === 'kabul').length
        const paying = offers.filter((o) => o.result === 'kabul' && Number(o.ladder) >= 1 && Number(o.ladder) <= 2).length
        const layers = [
          { name: 'Ulaşılan', value: reached },
          { name: 'Deneyen', value: tried },
          { name: 'Taahhüt veren', value: committed },
          { name: 'Ödeyen', value: paying },
        ]
        return {
          option: {
            tooltip: { trigger: 'item' },
            series: [{ type: 'funnel', sort: 'none', left: '10%', width: '80%', gap: 4, minSize: '10%', label: { show: true, position: 'inside', formatter: '{b}: {c}' }, data: layers }],
          },
          table: { head: ['Katman', 'Kişi'], rows: layers.map((l) => [l.name, l.value]) },
        }
      },
    },
  },
]
