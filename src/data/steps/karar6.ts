import type { Field, StepDef } from '../schema'
import { formatMoney } from '@/engine/format'

type Row = Record<string, unknown>

function rows(v: unknown): Row[] {
  return Array.isArray(v) ? (v as Row[]) : []
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isNaN(n) ? null : n
}

const FEATURE_COLUMNS: Field[] = [
  { key: 'feature', type: 'text', label: 'Özellik' },
  { key: 'assumption', type: 'text', label: 'Bağlı varsayım', placeholder: 'Bu özellik şu davranışı sağlayacak.' },
]

const WEEKS_1_TO_6 = [1, 2, 3, 4, 5, 6]

/** Kanal seçenekleri. Adım 24 ve Adım 30 aynı listeyi kullanır. */
export const CHANNEL_OPTIONS = [
  { value: 'topluluk', label: 'Topluluklar ve sosyal medya' },
  { value: 'reklam', label: 'Küçük bütçeli reklam' },
  { value: 'kisiselAg', label: 'Kişisel ağ' },
  { value: 'dogrudan', label: 'Doğrudan erişim' },
  { value: 'tanistirma', label: 'Tanıdık aracılığıyla tanıştırma' },
  { value: 'etkinlik', label: 'Sektör etkinliği' },
  { value: 'pilotTavsiye', label: 'Pilot birimden tavsiye' },
  { value: 'ihale', label: 'İhale takibi' },
  { value: 'pazarYeriSitesi', label: 'Pazar yeri siteleri' },
  { value: 'yerelSatis', label: 'Yerel satış noktası' },
  { value: 'fuar', label: 'Fuar' },
  { value: 'tavsiye', label: 'Müşteri tavsiyesi' },
  { value: 'yerelAg', label: 'Yerel ağ' },
  { value: 'isBirligi', label: 'Tamamlayıcı hizmetlerle iş birliği' },
  { value: 'arzElle', label: 'Arz tarafını elle toplama' },
  { value: 'diger', label: 'Başka kanal' },
]

export const KARAR6: StepDef[] = [
  {
    id: '21',
    decision: 6,
    title: 'İlk ürün kapsamı',
    question: 'İlk sürümde ne olacak? Ne olmayacak? Kaç haftada hazır olur?',
    mandatory: true,
    who: 'Kurucu.',
    timebox: '2 veya 3 gün.',
    shortPath: true,
    intro: 'İlk ürün küçük ama baştan sona çalışan bir iştir. Ana akış pürüzsüz olsun. Yan özellikler eksik olabilir.',
    howTo: [
      'Özellikleri dört kutuya ayırın. Kutular olmazsa olmaz, olmalı, olabilir ve bu sürümde olmayacak.',
      '"Olmazsa olmaz" kutusunda en çok 5 özellik olsun.',
      'Her "olmazsa olmaz" özelliğe bir varsayım bağlayın. "Bu özellik şu davranışı sağlayacak."',
      'İnşa süresini tahmin edin. Süre 6 haftayı aşıyorsa listeyi kırpın.',
      'İlk ürün için kaç kişi gerekir, yazın. Çalışan gerekiyorsa maliyetini Adım 16\'daki tabloya ekleyin.',
    ],
    sections: [
      {
        title: 'Dört kutu',
        fields: [
          { key: 'must', type: 'repeater', label: 'Olmazsa olmaz. En çok 5.', addLabel: 'Özellik ekle', minRows: 1, maxRows: 5, columns: FEATURE_COLUMNS },
          { key: 'should', type: 'repeater', label: 'Olmalı', addLabel: 'Özellik ekle', columns: FEATURE_COLUMNS },
          { key: 'could', type: 'repeater', label: 'Olabilir', addLabel: 'Özellik ekle', columns: FEATURE_COLUMNS },
          { key: 'wont', type: 'repeater', label: 'Bu sürümde olmayacak', addLabel: 'Özellik ekle', columns: FEATURE_COLUMNS },
        ],
      },
      {
        title: 'Süre ve kişi',
        fields: [
          { key: 'buildWeeks', type: 'number', label: 'İnşa süresi', required: true, unit: 'hafta', min: 1, max: 52, span: 12 },
          { key: 'headcount', type: 'number', label: 'İlk ürün için kaç kişi gerekir?', unit: 'kişi', min: 1, max: 50, span: 12 },
          { key: 'weeksNote', type: 'info', label: 'Dikkat', tone: 'uyari', text: 'İnşa süresi 6 haftayı aşıyor. Listeyi kırpın. Önce ana akışı teslim edin.', when: { all: [{ field: { key: 'buildWeeks', truthy: true } }, { not: { field: { key: 'buildWeeks', in: WEEKS_1_TO_6 } } }, { not: { profile: { offering: ['donanim'] } } }] } },
          { key: 'hardwareNote', type: 'info', label: 'Donanım', tone: 'bilgi', text: 'Donanımda inşa sınırı 6 aydır. Yani en çok 26 hafta. Teknik ön kanıtı önce gösterin.', when: { profile: { offering: ['donanim'] } } },
          { key: 'physicalNote', type: 'info', label: 'Fiziksel ürün', tone: 'ipucu', text: 'İlk parti küçük olsun. Elle üretim kabul edilir.', when: { profile: { offering: ['fiziksel'] } } },
          { key: 'qualityBar', type: 'textarea', label: 'Kalite çıtası', help: 'Ana akış pürüzsüz olsun. Hangi yan özellikler eksik kalabilir?', rows: 2 },
        ],
      },
      {
        title: 'Hizmet tanımı',
        when: { profile: { offering: ['hizmet'] } },
        description: 'Hizmet işinde ürün, hizmet tanımıdır.',
        fields: [
          { key: 'serviceDefinition', type: 'textarea', label: 'Hizmetin adımları, süresi ve fiyatı', rows: 4, placeholder: '1. Keşif ziyareti, 1 saat. 2. Tamir, 2 saat. Toplam 1.500 TL.' },
        ],
      },
    ],
    output: 'Dört kutulu özellik tablosu. Süre tahmini. Özellik ve varsayım listesi.',
    outcomeTable: [
      { condition: 'İnşa süresi 6 haftayı aşıyor', result: 'Listeyi kırpın. Donanımda sınır 6 aydır.' },
      { condition: 'Çalışan gerekiyor', result: 'Maliyetini Adım 16\'daki tabloya ekleyin.' },
    ],
    models: [121, 49, 48],
    completeWhen: ['must', 'buildWeeks'],
  },
  {
    id: '22',
    decision: 6,
    title: 'Ölçüm düzeni',
    question: 'Neyi sayacaksınız? Hangi sayı başarı demek?',
    mandatory: true,
    who: 'Kurucu.',
    timebox: '1 veya 2 gün.',
    shortPath: true,
    intro: 'Eşikleri testten önce yazın. Sonuç gelince eşik değiştirilmez. Zarar sınırı başarı ölçülerinden ayrıdır.',
    howTo: [
      'Müşteri yolunu 6 adımda yazın. Adımlar duyma, deneme, ilk değer anı, geri dönme, ödeme ve tavsiye etme.',
      'Her adımda sayılacak şeyi yazın. En az üç sayıyı sayın: gelen kişi, deneyen kişi ve ödeyen kişi.',
      'Tek önemli sayıyı seçin. Bu dönemde yalnız o sayıya odaklanın.',
      'Adım 25 için üç ölçüyü ve fayda ölçüsünü şimdi yazın. Her ölçünün eşiğini ve dayanağını yazın.',
      'Zarar sınırını ayrı yazın. Sonucun en erken görüleceği tarihi yazın.',
    ],
    sections: [
      {
        title: 'Müşteri yolu',
        description: 'Altı adımın her birinde ne sayacaksınız?',
        fields: [
          { key: 'digitalTool', type: 'info', label: 'Dijital ölçüm', tone: 'ipucu', text: 'Ücretsiz bir ölçüm aracı kurun. Örneğin Google Analytics. Fiziksel işte defter veya tablo yeter.', when: { profile: { offering: ['dijital'] } } },
          { key: 'journey', type: 'repeater', label: 'Altı adımlı müşteri yolu', addLabel: 'Adım ekle', minRows: 1, maxRows: 6, columns: [
            { key: 'stage', type: 'select', label: 'Adım', options: [
              { value: 'duyma', label: 'Duyma' },
              { value: 'deneme', label: 'Deneme' },
              { value: 'ilkDeger', label: 'İlk değer anı' },
              { value: 'geriDonme', label: 'Geri dönme' },
              { value: 'odeme', label: 'Ödeme' },
              { value: 'tavsiye', label: 'Tavsiye etme' },
            ] },
            { key: 'metric', type: 'text', label: 'Ne sayılır?', placeholder: 'Siteye gelen kişi sayısı' },
            { key: 'count', type: 'number', label: 'Şu anki sayı (varsa)', min: 0 },
          ] },
          { key: 'northStar', type: 'text', label: 'Tek önemli sayı', required: true, maxLength: 120, placeholder: 'Haftalık ödeyen müşteri sayısı' },
        ],
      },
      {
        title: 'Adım 25 için eşikler',
        description: 'Üç işletme ölçüsü ve bir fayda ölçüsü yazın. Sayısal eşiği siz yazarsınız.',
        fields: [
          { key: 'exampleConsumer', type: 'info', label: 'Örnek ölçüler', tone: 'ornek', text: 'Tüketici işi ve dijital ürün için örnek: deneyenlerin ilk değer anına ulaşma oranı, ilk hafta geri dönüş oranı, ödeyen sayısı.', when: { all: [{ profile: { customer: ['tuketici'] } }, { profile: { offering: ['dijital'] } }] } },
          { key: 'exampleBusiness', type: 'info', label: 'Örnek ölçüler', tone: 'ornek', text: 'İşletme işi için örnek: pilot tamamlanma sayısı, yenileme niyeti bildiren müşteri sayısı, ödeyen sayısı.', when: { profile: { customer: ['isletme', 'kamu'] } } },
          { key: 'examplePhysical', type: 'info', label: 'Örnek ölçüler', tone: 'ornek', text: 'Fiziksel ürün için örnek: iade oranı, tekrar sipariş oranı, birim katkı payı.', when: { profile: { offering: ['fiziksel'] } } },
          { key: 'exampleService', type: 'info', label: 'Örnek ölçüler', tone: 'ornek', text: 'Hizmet için örnek: tekrar alım oranı, tavsiye eden müşteri sayısı, katkı payı.', when: { profile: { offering: ['hizmet'] } } },
          { key: 'exampleMarketplace', type: 'info', label: 'Örnek ölçüler', tone: 'ornek', text: 'Pazar yeri için örnek: her iki tarafta eşleşme oranı, tekrar işlem oranı, komisyon geliri.', when: { profile: { customer: ['pazarYeri'] } } },
          { key: 'measure1', type: 'measure', label: 'Birinci ölçü', required: true },
          { key: 'measure2', type: 'measure', label: 'İkinci ölçü', required: true },
          { key: 'measure3', type: 'measure', label: 'Üçüncü ölçü', required: true },
          { key: 'benefitMeasure', type: 'measure', label: 'Fayda ölçüsü', help: 'Kullanıcıların kaçı işi yardımsız bitirdi? Sonuç eski yönteme göre iyileşti mi?', required: true, defaultName: 'Yardımsız bitirme oranı', defaultUnit: 'yüzde' },
          { key: 'harmLimit', type: 'text', label: 'Zarar sınırı', required: true, maxLength: 200, placeholder: 'Bir müşteri bile veri kaybederse denemeyi durdururuz.' },
          { key: 'earliestDate', type: 'date', label: 'Sonuç en erken ne zaman görülür?', span: 12 },
          { key: 'seasonal', type: 'toggle', label: 'Mevsim etkisi var mı?', help: 'Satış aya göre değişiyorsa evet deyin. Lokanta, turizm ve eğitim mevsimlidir.', onLabel: 'Evet, mevsimli', offLabel: 'Hayır', span: 12 },
          { key: 'weeklyTable', type: 'textarea', label: 'Haftalık tablo', help: 'Her hafta hangi sayıları, kim, nereye yazacak?', rows: 2 },
        ],
      },
    ],
    output: '6 adımlı müşteri yolu. Tek önemli sayı. Adım 25 eşikleri. Haftalık tablo.',
    outcomeTable: [
      { condition: 'Bir sayı hedefe dönüşüyor ve davranışı bozuyor', result: 'O sayıyı bırakın. Örneğin "kayıt sayısı" için kalitesiz kayıt toplamayın.' },
      { condition: 'Ücretsiz kullanıcı "aktif" sayılıyor', result: 'Ödeyen müşteriyi ayrı sayın.' },
    ],
    models: [94, 61],
    completeWhen: ['journey', 'northStar', 'measure1', 'measure2', 'measure3', 'benefitMeasure', 'harmLimit'],
    chart: {
      kind: 'funnel',
      title: 'Müşteri yolu hunisi',
      summary: (v) => {
        const js = rows(v.journey).filter((r) => num(r.count) !== null)
        if (js.length < 2) return ''
        const first = Number(js[0].count), last = Number(js[js.length - 1].count)
        if (!first) return ''
        return `İlk adımdan son adıma yüzde ${Math.round((last / first) * 100)} geçiyor.`
      },
      build: (v) => {
        const js = rows(v.journey).filter((r) => num(r.count) !== null && r.stage)
        if (!js.length) return null
        const label = (s: unknown) => ({ duyma: 'Duyma', deneme: 'Deneme', ilkDeger: 'İlk değer anı', geriDonme: 'Geri dönme', odeme: 'Ödeme', tavsiye: 'Tavsiye etme' }[String(s)] ?? String(s))
        const data = js.map((r) => ({ name: label(r.stage), value: Number(r.count) }))
        return {
          option: { series: [{ type: 'funnel', sort: 'none', left: '10%', width: '80%', top: 8, bottom: 8, label: { show: true, position: 'inside', formatter: '{b}: {c}' }, data }] },
          table: { head: ['Adım', 'Sayı'], rows: data.map((d) => [d.name, d.value]) },
        }
      },
    },
  },
  {
    id: '23',
    decision: 6,
    title: 'İnşa ve yumuşak açılış',
    question: 'İlk ürün ilk müşterilere ulaştı mı? İlk ödeme geldi mi?',
    mandatory: true,
    who: 'Kurucu ve ekip.',
    timebox: 'İnşa süresi kadar. Sonra 2 hafta açılış.',
    shortPath: true,
    intro: 'Yumuşak açılış, büyük duyuru yapmadan az müşteriyle başlamaktır. İlk 10 müşteriden yoğun geri bildirim alın.',
    howTo: [
      'Her hafta "kapsam büyüdü mü?" diye sorun. Büyüdüyse kırpın.',
      'İlk müşteri grubunu Adım 08\'deki segmentten seçin.',
      'Büyük duyuru yapmayın. İlk 10 müşteriden yoğun geri bildirim alın.',
      'Her geri bildirimi dört kutuya ayırın. Yalnız şikâyet ve istek üstünde çalışın.',
      'İlk ödemeyi alın. Ödeme almadan "çalışıyor" demeyin.',
    ],
    sections: [
      {
        title: 'Haftalık kontrol',
        fields: [
          { key: 'weeklyChecks', type: 'checklist', label: 'Her hafta işaretleyin', items: [
            { value: 'kapsam', label: 'Kapsam büyümedi. Büyüdüyse kırptık.' },
            { value: 'anaAkis', label: 'Ana akış baştan sona çalışıyor.' },
            { value: 'olcum', label: 'Ölçüm düzeni ilk katılımcıdan önce denendi.' },
            { value: 'durduran', label: 'Denemeyi durduracak kişi ve geri dönüş yolu yazılı.' },
          ] },
        ],
      },
      {
        title: 'İlk müşteriler',
        fields: [
          { key: 'groupConsumer', type: 'info', label: 'Kaç kişi yeter?', tone: 'bilgi', text: 'Tüketici işi için 10 ile 50 kişi yeter.', when: { profile: { customer: ['tuketici'] } } },
          { key: 'groupBusiness', type: 'info', label: 'Kaç işletme yeter?', tone: 'bilgi', text: 'İşletme işi için 3 ile 10 işletme yeter.', when: { profile: { customer: ['isletme'] } } },
          { key: 'groupPublic', type: 'info', label: 'Kaç pilot yeter?', tone: 'bilgi', text: 'Kamu işi için 1 veya 2 pilot yeter.', when: { profile: { customer: ['kamu'] } } },
          { key: 'groupMarketplace', type: 'info', label: 'İki taraf', tone: 'bilgi', text: 'Pazar yerinde satan ve alan tarafı ayrı listeleyin.', when: { profile: { customer: ['pazarYeri'] } } },
          { key: 'firstCustomers', type: 'repeater', label: 'İlk müşteri listesi', addLabel: 'Müşteri ekle', minRows: 1, columns: [
            { key: 'person', type: 'text', label: 'Kişi veya kurum' },
            { key: 'completed', type: 'select', label: 'İş nasıl bitti?', options: [{ value: 'tam', label: 'Tamamlandı' }, { value: 'yarim', label: 'Yarım kaldı' }] },
            { key: 'unaided', type: 'toggle', label: 'Yardımsız mı bitirdi?', onLabel: 'Yardımsız', offLabel: 'Yardımla' },
          ] },
        ],
      },
      {
        title: 'Geri bildirim',
        fields: [
          { key: 'feedback', type: 'repeater', label: 'Geri bildirim tablosu', addLabel: 'Geri bildirim ekle', columns: [
            { key: 'text', type: 'text', label: 'Müşteri ne dedi?' },
            { key: 'kind', type: 'select', label: 'Kutu', options: [
              { value: 'oneri', label: 'Öneri' },
              { value: 'ovgu', label: 'Övgü' },
              { value: 'sikayet', label: 'Şikâyet' },
              { value: 'istek', label: 'İstek' },
            ] },
          ] },
          { key: 'feedbackNote', type: 'info', label: 'Hangi kutuya bakılır?', tone: 'ipucu', text: 'Yalnız şikâyet ve istek üstünde çalışın. Öneri ve övgü kayıtta kalır.' },
        ],
      },
      {
        title: 'Ödeme ve geri dönüş',
        fields: [
          { key: 'firstPayment', type: 'toggle', label: 'İlk ödeme alındı mı?', onLabel: 'Evet, para geldi', offLabel: 'Hayır', span: 12 },
          { key: 'firstPaymentNote', type: 'info', label: 'Ücretsiz iş', tone: 'bilgi', text: 'Ücretsiz işte ödeme yerine bütçe sahibinin yazılı kabulünü alın.', when: { profile: { paid: [false] } } },
          { key: 'rollbackOwner', type: 'text', label: 'Denemeyi kim durdurur?', required: true, maxLength: 80, help: 'Bu kişi aksama halinde eski düzene döner.', span: 12 },
        ],
      },
    ],
    output: 'Çalışan ilk ürün veya hizmet. İlk müşteri listesi. Geri bildirim tablosu.',
    outcomeTable: [
      { condition: 'Ödeme gelmedi', result: '"Çalışıyor" demeyin. Ödemeyi engelleyen şeyi yazın.' },
      { condition: 'Kapsam her hafta büyüyor', result: 'Adım 21\'e dönün. "Olmazsa olmaz" listesini kırpın.' },
    ],
    models: [8, 85],
    completeWhen: ['firstCustomers', 'rollbackOwner'],
  },
  {
    id: '24',
    decision: 6,
    title: 'Kanal testleri',
    question: 'Hangi kanal ödeyen müşteri getiriyor? Kaç paraya?',
    mandatory: true,
    who: 'Kurucu.',
    timebox: 'Her kanal için 2 hafta.',
    shortPath: false,
    howTo: [
      'Profilinize göre 2 veya 3 kanal seçin.',
      'Her kanala küçük bütçe ve 2 hafta ayırın.',
      'Her kanalda maliyeti, gelen kişiyi, deneyen kişiyi ve ödeyen kişiyi sayın.',
      'Bir mesajı iki biçimde deneyin. Hangisi daha çok dönüşüm getirdi, yazın.',
    ],
    sections: [
      {
        title: 'Kanal seçimi',
        fields: [
          { key: 'recConsumerDigital', type: 'info', label: 'Önerilen ilk kanallar', tone: 'ipucu', text: 'Tüketici işi ve dijital ürün için: topluluklar ve sosyal medya, küçük bütçeli reklam, kişisel ağ.', when: { all: [{ profile: { customer: ['tuketici'] } }, { profile: { offering: ['dijital'] } }] } },
          { key: 'recBusiness', type: 'info', label: 'Önerilen ilk kanallar', tone: 'ipucu', text: 'İşletme işi için: doğrudan erişim, tanıdık aracılığıyla tanıştırma, sektör etkinliği.', when: { profile: { customer: ['isletme'] } } },
          { key: 'recPublic', type: 'info', label: 'Önerilen ilk kanallar', tone: 'ipucu', text: 'Kamu işi için: pilot birimden tavsiye, ihale takibi.', when: { profile: { customer: ['kamu'] } } },
          { key: 'recPhysical', type: 'info', label: 'Önerilen ilk kanallar', tone: 'ipucu', text: 'Fiziksel ürün için: pazar yeri siteleri, yerel satış noktası, fuar.', when: { profile: { offering: ['fiziksel'] } } },
          { key: 'recService', type: 'info', label: 'Önerilen ilk kanallar', tone: 'ipucu', text: 'Hizmet için: tavsiye, yerel ağ, tamamlayıcı hizmetlerle iş birliği.', when: { profile: { offering: ['hizmet'] } } },
          { key: 'recMarketplace', type: 'info', label: 'Önerilen ilk kanallar', tone: 'ipucu', text: 'Pazar yeri için: arz tarafını elle toplayın. Talep tarafını topluluk ve reklamla bulun.', when: { profile: { customer: ['pazarYeri'] } } },
          { key: 'selected', type: 'chips', label: 'Test edilecek kanallar. En çok 3.', max: 3, options: CHANNEL_OPTIONS },
        ],
      },
      {
        title: 'Sonuçlar',
        description: 'Her kanal için 2 haftanın sonucunu yazın.',
        fields: [
          { key: 'results', type: 'repeater', label: 'Kanal sonuçları', addLabel: 'Kanal sonucu ekle', minRows: 1, columns: [
            { key: 'channel', type: 'text', label: 'Kanal' },
            { key: 'costKurus', type: 'money', label: 'Maliyet' },
            { key: 'reached', type: 'number', label: 'Gelen kişi', min: 0 },
            { key: 'tried', type: 'number', label: 'Deneyen kişi', min: 0 },
            { key: 'paying', type: 'number', label: 'Ödeyen kişi', min: 0 },
          ] },
          { key: 'bestMessage', type: 'text', label: 'Daha çok dönüşüm getiren mesaj', maxLength: 200, placeholder: 'İki biçimden hangisi kazandı?' },
        ],
      },
    ],
    output: 'Kanal tablosu. Sütunlar kanal, maliyet, gelen, deneyen, ödeyen ve müşteri başına maliyet.',
    outcomeTable: [
      { condition: 'Bir kanal ödeyen müşteri getiriyor ve maliyet geri geliyor', result: 'Bu kanalı Karar 7\'de büyütün.' },
      { condition: 'Hiçbir kanal ödeyen getirmiyor ama ürün beğeniliyor', result: 'Sorun mesajda veya segmenttedir. Adım 13\'e bakın.' },
      { condition: 'Kanallar müşteri getiriyor ama kimse geri dönmüyor', result: 'Sorun üründedir. Adım 21\'e dönün.' },
    ],
    models: [82, 116],
    completeWhen: ['selected', 'results'],
    chart: {
      kind: 'bar',
      title: 'Kanal karşılaştırması',
      summary: (v) => {
        const rs = rows(v.results).filter((r) => r.channel)
        if (!rs.length) return ''
        const withPaying = rs.filter((r) => Number(r.paying ?? 0) > 0)
        if (!withPaying.length) return 'Hiçbir kanal ödeyen müşteri getirmedi.'
        const best = withPaying.reduce((a, b) => (Number(a.costKurus ?? 0) / Number(a.paying) <= Number(b.costKurus ?? 0) / Number(b.paying) ? a : b))
        return `En ucuz ödeyen müşteri "${best.channel}" kanalından. Müşteri başına ${formatMoney(Math.round(Number(best.costKurus ?? 0) / Number(best.paying)))}.`
      },
      build: (v) => {
        const rs = rows(v.results).filter((r) => r.channel)
        if (!rs.length) return null
        const names = rs.map((r) => String(r.channel))
        const paying = rs.map((r) => Number(r.paying ?? 0))
        const cost = rs.map((r) => Math.round(Number(r.costKurus ?? 0)) / 100)
        const perCustomer = rs.map((r) => (Number(r.paying ?? 0) > 0 ? formatMoney(Math.round(Number(r.costKurus ?? 0) / Number(r.paying))) : 'Hesaplanamaz'))
        return {
          option: {
            grid: { left: 64, right: 72, top: 40, bottom: 32 },
            legend: { top: 0 },
            xAxis: { type: 'category', data: names },
            yAxis: [{ type: 'value', name: 'kişi' }, { type: 'value', name: 'TL' }],
            series: [
              { type: 'bar', name: 'Ödeyen', data: paying, yAxisIndex: 0, label: { show: true, position: 'top' } },
              { type: 'bar', name: 'Maliyet', data: cost, yAxisIndex: 1 },
            ],
          },
          table: { head: ['Kanal', 'Maliyet', 'Gelen', 'Deneyen', 'Ödeyen', 'Müşteri başına maliyet'], rows: rs.map((r, i) => [names[i], formatMoney(Number(r.costKurus ?? 0)), Number(r.reached ?? 0), Number(r.tried ?? 0), paying[i], perCustomer[i]]) },
        }
      },
    },
  },
  {
    id: '25',
    decision: 6,
    title: 'İlk ürün kapısı',
    question: 'Eşikler geçildi mi? Devam, yön değiştir, yeniden dene veya durdur?',
    mandatory: true,
    who: 'Karar sahibi.',
    timebox: '1 gün.',
    shortPath: true,
    intro: 'Bu adım Kapı 6\'nın kendisidir. Kapı 6 en çok 3 döngü tekrar eder. Üçüncü döngüde ilerleme yoksa durdurma kuralı işler.',
    howTo: [
      'Adım 22\'de yazdığınız üç eşiği açın. Gerçekleşen sayıları yanına yazın.',
      'Dördüncü ölçüt faydadır. Kullanıcıların kaçı işi yardımsız bitirdi, yazın.',
      'Umut kontrolü yapın. Denenecek yeni fikir var mı? Pist devam ediyor mu? Biri "hayır" ise durdurun.',
      'Gözlenen durumu seçin. Yön değiştirme tablosu dönülecek adımı gösterir.',
      'Kararı karar günlüğüne yazın.',
    ],
    sections: [
      {
        title: 'Zarar kontrolü',
        fields: [
          { key: 'harmObserved', type: 'toggle', label: 'Ciddi zarar görüldü mü?', help: 'Zarar sınırı Adım 22\'de yazılıdır.', onLabel: 'Evet, zarar var', offLabel: 'Hayır' },
          { key: 'harmNote', type: 'info', label: 'Durdur', tone: 'uyari', text: 'Ciddi zarar görüldü. Denemeyi durdurun. Etkilenen kişilere destek sağlayın.', when: { field: { key: 'harmObserved', truthy: true } } },
        ],
      },
      {
        title: 'Gerçekleşen sayılar',
        description: 'Ölçüler ve eşikler Adım 22\'dedir. Buraya yalnız gerçekleşen değeri yazın.',
        fields: [
          { key: 'achieved1', type: 'number', label: 'Birinci ölçü. Gerçekleşen değer.', span: 12 },
          { key: 'achieved2', type: 'number', label: 'İkinci ölçü. Gerçekleşen değer.', span: 12 },
          { key: 'achieved3', type: 'number', label: 'Üçüncü ölçü. Gerçekleşen değer.', span: 12 },
          { key: 'achieved4', type: 'number', label: 'Fayda ölçüsü. Gerçekleşen değer.', span: 12 },
          { key: 'defects', type: 'textarea', label: 'Kusur listesi', help: 'Teslimde ne aksadı?', rows: 2 },
        ],
      },
      {
        title: 'Umut kontrolü',
        fields: [
          { key: 'hasIdeas', type: 'toggle', label: 'Denenecek yeni fikir var mı?', onLabel: 'Evet', offLabel: 'Hayır', span: 12 },
          { key: 'runwayOk', type: 'toggle', label: 'Pist devam ediyor mu?', help: 'Pist, elinizdeki paranın kaç ay dayandığıdır.', onLabel: 'Evet', offLabel: 'Hayır', span: 12 },
          { key: 'hopeNote', type: 'info', label: 'Durdur', tone: 'uyari', text: 'Yeni fikir yok veya pist bitti. Durdurma kuralı işler. Öğrenimleri yazın.', when: { any: [{ field: { key: 'hasIdeas', truthy: false } }, { field: { key: 'runwayOk', truthy: false } }] } },
        ],
      },
      {
        title: 'Yön değiştirme',
        fields: [
          { key: 'pivotObserved', type: 'select', label: 'Gözlenen durum', required: true, options: [
            { value: 'yok', label: 'Yön değiştirme gerekmiyor' },
            { value: 'geriDonmuyor', label: 'Müşteri geliyor ama geri dönmüyor' },
            { value: 'beklenmedikAmac', label: 'Müşteri ürünü beklenmedik amaçla kullanıyor' },
            { value: 'odemeYok', label: 'Kullanım var, ödeme yok' },
            { value: 'farkliGrup', label: 'Problem farklı bir grupta daha acı veriyor' },
            { value: 'baskaIs', label: 'Müşteri başka bir işi bitirmek istiyor' },
            { value: 'cozumBegenilmiyor', label: 'Problem doğru, çözüm beğenilmiyor' },
            { value: 'kanalYok', label: 'Ürün beğeniliyor, kimse ulaşamıyor' },
            { value: 'tekOzellik', label: 'Tek özellik çok kullanılıyor' },
            { value: 'kasaDusuyor', label: 'Satış var ama kasa düşüyor' },
          ] },
          { key: 'decisionNote', type: 'textarea', label: 'Karar ve gerekçe', required: true, rows: 3, placeholder: 'Kararınızı ve nedenini yazın. Karar günlüğüne de geçer.' },
        ],
      },
    ],
    output: 'Dört karardan biri. Gerekçe. Karar günlüğü kaydı.',
    outcomeTable: [
      { condition: 'Problem farklı bir grupta daha acı veriyor', result: 'Segmenti değiştirin. Adım 08\'e dönün.' },
      { condition: 'Müşteri başka bir işi bitirmek istiyor', result: 'Problemi değiştirin. Adım 05\'e dönün.' },
      { condition: 'Problem doğru, çözüm beğenilmiyor', result: 'Çözümü değiştirin. Adım 11\'e dönün.' },
      { condition: 'Ürün beğeniliyor, kimse ulaşamıyor', result: 'Kanalı değiştirin. Adım 24\'e dönün.' },
      { condition: 'Kullanım var, ödeme yok', result: 'Gelir modelini değiştirin. Adım 16\'ya dönün.' },
      { condition: 'Tek özellik çok kullanılıyor', result: 'Ürünü o özelliğe daraltın. Adım 21\'e dönün.' },
      { condition: 'Müşteri geliyor ama geri dönmüyor', result: 'Adım 13 ve 21\'e dönün. Sorun değer önerisinde veya üründedir.' },
      { condition: 'Müşteri ürünü beklenmedik amaçla kullanıyor', result: 'Adım 05\'e dönün. Problem veya segment değişti.' },
    ],
    models: [69, 83, 17],
    completeWhen: ['pivotObserved', 'decisionNote'],
  },
]
