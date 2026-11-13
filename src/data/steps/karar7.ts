import type { StepDef } from '../schema'
import { formatMoney } from '@/engine/format'
import { CHANNEL_OPTIONS } from './karar6'

type Row = Record<string, unknown>

function rows(v: unknown): Row[] {
  return Array.isArray(v) ? (v as Row[]) : []
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isNaN(n) ? null : n
}

const SIGNAL_YES = { field: { step: '28', key: 'signal', equals: 'var' } }

export const KARAR7: StepDef[] = [
  {
    id: '26',
    decision: 7,
    title: 'Öğrenme döngüsü',
    question: 'Her döngüde ne öğrendiniz? Neyi değiştirdiniz?',
    mandatory: true,
    who: 'Kurucu ve ekip.',
    timebox: 'Her döngü 1 veya 2 hafta.',
    shortPath: false,
    intro: 'Döngü, kısa bir deneme turudur. Önce öğrenilecek şey yazılır. Sonra ölçü ve eşik yazılır. En sonda en küçük değişiklik yapılır.',
    howTo: [
      'Her döngü 1 veya 2 hafta sürer.',
      'Önce öğrenilecek şeyi yazın. 1 veya 2 varsayım seçin.',
      'Sonra ölçüyü yazın. Başarı ve başarısızlık eşiği önceden yazılır.',
      'En sonda en küçük değişikliği yapın.',
      'Döngü sonunda dört soru sorun. Ne bekledik? Ne oldu? Fark neden? Neyi tekrarlar, neyi değiştiririz?',
      'Cevapları karar günlüğüne yazın.',
    ],
    sections: [
      {
        title: 'Döngü kartları',
        description: 'Her döngü için bir satır. Başlamadan önce ilk dört alanı doldurun.',
        fields: [
          { key: 'cycles', type: 'repeater', label: 'Döngüler', addLabel: 'Döngü ekle', minRows: 1, columns: [
            { key: 'hypothesis', type: 'text', label: 'Varsayım', placeholder: 'Ne öğreneceğiz?' },
            { key: 'metric', type: 'text', label: 'Ölçü' },
            { key: 'threshold', type: 'text', label: 'Başarı ve başarısızlık eşiği', placeholder: 'Sayı içersin.' },
            { key: 'change', type: 'text', label: 'En küçük değişiklik' },
            { key: 'result', type: 'text', label: 'Ölçülen sonuç' },
            { key: 'expected', type: 'text', label: 'Ne bekledik?' },
            { key: 'happened', type: 'text', label: 'Ne oldu?' },
            { key: 'why', type: 'text', label: 'Fark neden?' },
            { key: 'keep', type: 'text', label: 'Neyi tekrarlar, neyi değiştiririz?' },
          ] },
          { key: 'cyclesDone', type: 'number', label: 'Tamamlanan döngü sayısı', required: true, unit: 'döngü', min: 0, max: 48, span: 12 },
        ],
      },
    ],
    output: 'Döngü planı. Güncel karar günlüğü.',
    outcomeTable: [
      { condition: 'Aynı başarısızlık iki döngüde tekrarlandı', result: 'Yeni deneme yapmadan önce temel varsayımı değiştirin. Adım 10\'a bakın.' },
      { condition: 'Döngü sonunda dört soru cevapsız', result: 'Döngü tamam sayılmaz. Cevapları yazın.' },
    ],
    models: [70, 36, 5],
    completeWhen: ['cycles', 'cyclesDone'],
  },
  {
    id: '27',
    decision: 7,
    title: 'Problem çözüm uyumu',
    question: 'Müşteri ürün olmadan eski yönteme döner mi? Üç işaret artıyor mu?',
    mandatory: true,
    who: 'Kurucu.',
    timebox: 'Her döngüde 1 saat.',
    shortPath: false,
    howTo: [
      'Müşterilerden doğrudan alıntı toplayın. Örneğin "Bu olmasaydı eski yönteme dönerdim."',
      'Üç işareti sayın. Tavsiye eden müşteri. Ödemeye devam eden müşteri. Kendi isteğiyle yeni özellik isteyen müşteri.',
      'Üç işaretten en az ikisi her döngüde artıyorsa uyum yakındır.',
      'Sonucu Adım 28\'e girdi olarak verin.',
    ],
    sections: [
      {
        title: 'Müşteri alıntıları',
        fields: [
          { key: 'quotes', type: 'repeater', label: 'Alıntılar', addLabel: 'Alıntı ekle', minRows: 1, columns: [
            { key: 'quote', type: 'text', label: 'Müşteri ne dedi?', placeholder: 'Bu olmasaydı eski yönteme dönerdim.' },
            { key: 'person', type: 'text', label: 'Kim dedi?' },
          ] },
        ],
      },
      {
        title: 'Üç işaret',
        description: 'Bu döngünün sayılarını yazın.',
        fields: [
          { key: 'referrals', type: 'number', label: 'Tavsiye eden müşteri', unit: 'kişi', min: 0, span: 8 },
          { key: 'continuing', type: 'number', label: 'Ödemeye devam eden müşteri', unit: 'kişi', min: 0, span: 8 },
          { key: 'requests', type: 'number', label: 'Kendi isteğiyle özellik isteyen müşteri', unit: 'kişi', min: 0, span: 8 },
          { key: 'near', type: 'toggle', label: 'Uyum yakın mı?', help: 'Üç işaretten en az ikisi her döngüde artıyorsa evet deyin.', onLabel: 'Uyum yakın', offLabel: 'Uyum uzak' },
        ],
      },
    ],
    output: 'Alıntı listesi. Üç işaretin sayısı. "Uyum yakın" veya "uyum uzak" notu.',
    outcomeTable: [
      { condition: 'En az iki işaret her döngüde artıyor', result: 'Uyum yakın. Adım 28\'de ölçün.' },
      { condition: 'İşaretler artmıyor', result: 'Uyum uzak. Adım 26\'da değer önerisini yeniden test edin.' },
    ],
    models: [107],
    completeWhen: ['quotes', 'near'],
  },
  {
    id: '28',
    decision: 7,
    title: 'Ürün pazar uyumu ölçümü',
    question: 'Müşteri geri geliyor mu? Geri dönüş eğrisi düzleşiyor mu?',
    mandatory: true,
    who: 'Kurucu.',
    timebox: 'Her 3 aylık döngüde.',
    shortPath: true,
    intro: 'Kohort, aynı ayda gelen müşteri grubudur. Her grubu kendi doğal kullanım süresinde izleyin. Olgunlaşmamış dönemi boş bırakın.',
    howTo: [
      'Ölçüm yöntemini profile göre seçin. Yöntem aşağıda yazılıdır.',
      'Aynı ayda gelen müşterileri grup olarak izleyin. Her grup için üç oran yazın.',
      '1 ay sonra kaçı kullanıyor? 2 ay sonra kaçı? 3 ay sonra kaçı?',
      'Geri dönüş eğrisi düzleşiyorsa uyum işareti vardır. Sıfıra iniyorsa yoktur.',
      'Mevsim etkisi varsa grupları geçen yılın aynı ayıyla karşılaştırın.',
    ],
    sections: [
      {
        title: 'Ölçüm yöntemi',
        fields: [
          { key: 'methodConsumer', type: 'info', label: 'Ana ölçüm', tone: 'bilgi', text: 'Müşterilere şu soruyu sorun: "Bu ürün yarın kaybolsa ne hissedersiniz?" Yüzde 40 ve üstü "çok üzülürüm" derse uyum işareti vardır. Geri dönüş eğrisi de düzleşmelidir.', when: { all: [{ profile: { customer: ['tuketici'] } }, { profile: { offering: ['dijital'] } }] } },
          { key: 'methodBusiness', type: 'info', label: 'Ana ölçüm', tone: 'bilgi', text: 'İşletme işi için yenileme oranına bakın. İlk dönem sonunda müşterilerin çoğu yenilerse uyum işareti vardır. Kendi eşiğinizi yazın.', when: { profile: { customer: ['isletme', 'kamu'] } } },
          { key: 'methodPhysical', type: 'info', label: 'Ana ölçüm', tone: 'bilgi', text: 'Fiziksel ürün için tekrar sipariş oranına ve iade oranına bakın. Tekrar sipariş artıyor ve iade düşüyorsa uyum işareti vardır.', when: { profile: { offering: ['fiziksel'] } } },
          { key: 'methodService', type: 'info', label: 'Ana ölçüm', tone: 'bilgi', text: 'Hizmet için tekrar alıma ve tavsiyeye bakın. Yeni müşterilerin önemli bölümü tavsiyeyle geliyorsa uyum işareti vardır.', when: { profile: { offering: ['hizmet'] } } },
          { key: 'methodMarketplace', type: 'info', label: 'Ana ölçüm', tone: 'bilgi', text: 'Pazar yeri için iki tarafta tekrar işleme bakın. Her iki taraf da kendiliğinden geri geliyorsa uyum işareti vardır.', when: { profile: { customer: ['pazarYeri'] } } },
          { key: 'surveyPercent', type: 'number', label: 'Anket. "Çok üzülürüm" diyenlerin yüzdesi.', help: 'Yalnız anket yaptıysanız doldurun.', unit: 'yüzde', min: 0, max: 100, span: 12 },
        ],
      },
      {
        title: 'Kohort tablosu',
        description: 'Her satır bir ayın müşteri grubudur. Oranları yüzde olarak yazın. Olgunlaşmamış ayı boş bırakın.',
        fields: [
          { key: 'cohorts', type: 'repeater', label: 'Aylık gruplar', addLabel: 'Ay ekle', minRows: 1, columns: [
            { key: 'month', type: 'text', label: 'Geliş ayı', placeholder: 'Ocak 2027' },
            { key: 'm1', type: 'number', label: '1 ay sonra kullanan yüzdesi', min: 0, max: 100 },
            { key: 'm2', type: 'number', label: '2 ay sonra kullanan yüzdesi', min: 0, max: 100 },
            { key: 'm3', type: 'number', label: '3 ay sonra kullanan yüzdesi', min: 0, max: 100 },
          ] },
          { key: 'seasonalAdjust', type: 'toggle', label: 'Mevsim düzeltmesi yapıldı mı?', help: 'Mevsim etkisi varsa grupları geçen yılın aynı ayıyla karşılaştırın.', onLabel: 'Evet', offLabel: 'Hayır veya gerekmiyor' },
        ],
      },
      {
        title: 'Uyum işareti',
        fields: [
          { key: 'signal', type: 'segmented', label: 'Uyum işareti var mı?', required: true, options: [
            { value: 'var', label: 'Var', help: 'Geri dönüş eğrisi düzleşiyor.' },
            { value: 'yok', label: 'Yok', help: 'Geri dönüş sıfıra iniyor.' },
            { value: 'bilinmiyor', label: 'Bilinmiyor', help: 'Dönemler henüz olgunlaşmadı.' },
          ] },
          { key: 'subgroupNote', type: 'textarea', label: 'Uyum yalnız bir alt grupta mı var?', help: 'Varsa o grubu yazın. Adım 08\'i güncelleyin.', rows: 2 },
        ],
      },
    ],
    output: 'Anket veya oran sonucu. Kohort tablosu. Uyum işareti var veya yok.',
    outcomeTable: [
      { condition: 'Uyum işareti var', result: 'Adım 30\'a geçin. Karar 7 sonunda Kapı 7\'ye gidin.' },
      { condition: 'Uyum işareti yok ve geri dönüş sıfıra iniyor', result: 'Adım 26\'ya dönün. Değer önerisini yeniden test edin.' },
      { condition: 'Uyum bir alt grupta var', result: 'O alt gruba daralın. Adım 08\'i güncelleyin.' },
      { condition: '12 ay geçti ve işaret yok', result: 'Ciddi yön değişikliği veya durdurma. Karar günlüğüne yazın.' },
    ],
    models: [117, 42],
    completeWhen: ['cohorts', 'signal'],
    chart: {
      kind: 'line',
      title: 'Kohort eğrisi',
      summary: (v) => {
        const cs = rows(v.cohorts).filter((r) => num(r.m1) !== null)
        if (!cs.length) return ''
        const mature = cs.filter((r) => num(r.m3) !== null)
        if (!mature.length) return 'Henüz 3 ayı dolan grup yok. Eğri sonra okunur.'
        const flat = mature.filter((r) => Number(r.m3) > 0 && Number(r.m2) - Number(r.m3) <= Number(r.m1) - Number(r.m2)).length
        return flat === mature.length ? 'Eğri düzleşiyor. Uyum işareti var.' : 'Eğri sıfıra iniyor. Uyum işareti zayıf.'
      },
      build: (v) => {
        const cs = rows(v.cohorts).filter((r) => r.month && num(r.m1) !== null)
        if (!cs.length) return null
        const series = cs.map((r) => ({ type: 'line', name: String(r.month), data: [num(r.m1), num(r.m2), num(r.m3)], connectNulls: false }))
        return {
          option: { grid: { left: 56, right: 24, top: 40, bottom: 32 }, legend: { top: 0 }, xAxis: { type: 'category', data: ['1 ay sonra', '2 ay sonra', '3 ay sonra'] }, yAxis: { type: 'value', name: 'yüzde', min: 0, max: 100 }, series },
          table: { head: ['Geliş ayı', '1 ay sonra', '2 ay sonra', '3 ay sonra'], rows: cs.map((r) => [String(r.month), num(r.m1) ?? 'Boş', num(r.m2) ?? 'Boş', num(r.m3) ?? 'Boş']) },
        }
      },
    },
  },
  {
    id: '29',
    decision: 7,
    title: 'Birim ekonomisi ve fiyat',
    question: 'Bir müşteri kaç para bırakıyor? Kaç paraya geliyor? Fiyat doğru mu?',
    mandatory: true,
    who: 'Kurucu.',
    timebox: 'Her döngüde yarım gün.',
    shortPath: true,
    intro: 'Ömür değeri, bir müşterinin ilk 12 ayda bıraktığı paradır. Kazanma maliyeti, bir yeni müşteri için harcanan paradır. Oran, ömür değeri bölü kazanma maliyetidir.',
    howTo: [
      'Gerçek verilerle Adım 16\'daki tabloyu güncelleyin. Dört sayı yazın.',
      'Kazanma maliyetini dönemle hesaplayın. Dönemin kazanma giderini aynı dönemin yeni müşteri sayısına bölün.',
      'Oranı hesaplayın. Hedef 3 ve üstüdür. 1 ile 3 arası izlenir. 1\'in altı büyüme harcamasını durdurur.',
      'Dört soruluk fiyat anketi yapın. Çok ucuz, ucuz, pahalı ve çok pahalı fiyatı sorun.',
      'En az iki fiyat modelini gerçek müşteride deneyin.',
    ],
    sections: [
      {
        title: 'Dört sayı',
        fields: [
          { key: 'period', type: 'select', label: 'Dönem', required: true, options: [{ value: 'ay', label: 'Ay' }, { value: 'ceyrek', label: 'Çeyrek. 3 ay.' }], span: 12 },
          { key: 'cacInfo', type: 'info', label: 'Örnek', tone: 'ornek', text: 'Bir ayda 12.000 TL harcadınız. O ay 6 yeni müşteri geldi. Müşteri başına gider 2.000 TL olur. Yeni müşteri sıfırsa oran hesaplanamaz.' },
          { key: 'ltvKurus', type: 'money', label: 'Müşteri ömür değeri', help: 'Bir müşterinin ilk 12 ayda bıraktığı para.', required: true, span: 12 },
          { key: 'cacKurus', type: 'money', label: 'Müşteri kazanma maliyeti', required: true, span: 12 },
          { key: 'contributionKurus', type: 'money', label: 'Bir siparişin katkısı', span: 12 },
          { key: 'paybackMonths', type: 'number', label: 'Geri ödeme süresi', help: 'Kazanma maliyeti kaç ayda geri gelir?', unit: 'ay', min: 0, max: 60, span: 12 },
          { key: 'trendUp', type: 'toggle', label: 'Oran üç döngüdür yükseliyor mu?', onLabel: 'Evet, yükseliyor', offLabel: 'Hayır', span: 12 },
          { key: 'cashFalling', type: 'toggle', label: 'Satış artarken kasa düşüyor mu?', onLabel: 'Evet, düşüyor', offLabel: 'Hayır', span: 12 },
          { key: 'cashNote', type: 'info', label: 'Dikkat', tone: 'uyari', text: 'Satış artarken kasa düşüyor. Büyümeyi bekletin. Tahsilat gününe bakın.', when: { field: { key: 'cashFalling', truthy: true } } },
        ],
      },
      {
        title: 'Fiyat anketi',
        description: 'Müşterilere dört soru sorun. Cevapların ortasını yazın.',
        fields: [
          { key: 'tooCheap', type: 'money', label: 'Hangi fiyat çok ucuz?', span: 12 },
          { key: 'cheap', type: 'money', label: 'Hangi fiyat ucuz?', span: 12 },
          { key: 'expensive', type: 'money', label: 'Hangi fiyat pahalı?', span: 12 },
          { key: 'tooExpensive', type: 'money', label: 'Hangi fiyat çok pahalı?', span: 12 },
          { key: 'priceModels', type: 'repeater', label: 'Denenen fiyat modelleri', addLabel: 'Model ekle', maxRows: 4, columns: [
            { key: 'model', type: 'text', label: 'Model', placeholder: 'Tek fiyat, paket, abonelik veya kullanım başına' },
            { key: 'result', type: 'text', label: 'Gerçek müşteride sonuç' },
          ] },
          { key: 'chosenPriceModel', type: 'text', label: 'Seçilen fiyat modeli', maxLength: 120 },
        ],
      },
    ],
    output: 'Gerçek birim ekonomisi tablosu. Fiyat anketi sonucu. Seçilen fiyat modeli.',
    outcomeTable: [
      { condition: 'Oran 1\'in altında', result: 'Büyüme harcamasını durdurun. Adım 16 ve 30\'a bakın.' },
      { condition: 'Oran 1 ile 3 arası', result: 'Büyümeyi küçük tutun. Her döngüde oranı yeniden ölçün.' },
      { condition: 'Katkı payı eksi', result: 'Fiyatı artırın veya maliyeti düşürün. Düzelmezse yön değiştirin.' },
      { condition: 'Fiyat anketi daha yüksek fiyat gösteriyor', result: 'Yeni müşteride yüksek fiyatı deneyin. Eski müşteriyi koruyun.' },
    ],
    models: [128, 95],
    completeWhen: ['period', 'ltvKurus', 'cacKurus'],
    chart: {
      kind: 'bar',
      title: 'Birim ekonomisi',
      summary: (v) => {
        const ltv = num(v.ltvKurus), cac = num(v.cacKurus)
        if (ltv === null || cac === null) return ''
        if (cac <= 0) return 'Kazanma maliyeti sıfır. Oran hesaplanamaz.'
        const ratio = ltv / cac
        const r = ratio.toFixed(1).replace('.', ',')
        if (ratio < 1) return `Oran ${r}. Büyüme harcamasını durdurun.`
        if (ratio < 3) return `Oran ${r}. Büyümeyi küçük tutun. Eğilim yukarı olmalı.`
        return `Oran ${r}. Hedef 3 geçildi.`
      },
      build: (v) => {
        const ltv = num(v.ltvKurus), cac = num(v.cacKurus)
        if (ltv === null && cac === null) return null
        const labels = ['Ömür değeri', 'Kazanma maliyeti']
        const data = [ltv ?? 0, cac ?? 0].map((k) => Math.round(k) / 100)
        const ratio = ltv !== null && cac !== null && cac > 0 ? (ltv / cac).toFixed(1).replace('.', ',') : 'Hesaplanamaz'
        return {
          option: { grid: { left: 72, right: 24, top: 16, bottom: 32 }, xAxis: { type: 'category', data: labels }, yAxis: { type: 'value', name: 'TL' }, series: [{ type: 'bar', data, label: { show: true, position: 'top' } }] },
          table: { head: ['Ölçü', 'Değer'], rows: [['Ömür değeri', formatMoney(ltv)], ['Kazanma maliyeti', formatMoney(cac)], ['Oran', ratio]] },
        }
      },
    },
  },
  {
    id: '30',
    decision: 7,
    title: 'Büyüme kanalı seçimi',
    question: 'Hangi tek kanal büyümeyi taşır?',
    mandatory: false,
    whenNote: 'Adım 28\'de uyum işareti varsa yapılır. Yoksa atlanır.',
    who: 'Kurucu.',
    timebox: 'Her deney 2 hafta.',
    shortPath: false,
    howTo: [
      'Olası kanalların hepsini yazın. Genellikle 10\'dan fazla kanal çıkar.',
      'İçlerinden 3 kanal seçin. Her birine küçük deney tasarlayın.',
      'Her kanalın birim ekonomisine etkisini ölçün. Kazanma maliyetini düşürüyor mu? Ömür değerini artırıyor mu?',
      'Kazanan kanala odaklanın. Diğer ikisini bırakın.',
      'Mevcut müşteri yeni müşteri getiriyor mu, ölçün. Getiriyorsa tavsiye düzenini kurun.',
    ],
    sections: [
      {
        title: 'Kanal eleme',
        fields: [
          { key: 'signalNote', type: 'info', label: 'Bu adım şimdi gerekli mi?', tone: 'uyari', text: 'Adım 28\'de uyum işareti henüz yok. Bu adımı uyum işareti gelince yapın.', when: { not: SIGNAL_YES } },
          { key: 'allChannels', type: 'repeater', label: 'Olası kanalların hepsi', addLabel: 'Kanal ekle', columns: [{ key: 'channel', type: 'text', label: 'Kanal' }] },
          { key: 'trial', type: 'chips', label: 'Deneyeceğiniz 3 kanal', max: 3, options: CHANNEL_OPTIONS },
        ],
      },
      {
        title: 'Deney sonuçları',
        fields: [
          { key: 'trialResults', type: 'repeater', label: 'Üç kanal deney raporu', addLabel: 'Sonuç ekle', maxRows: 3, columns: [
            { key: 'channel', type: 'text', label: 'Kanal' },
            { key: 'cacKurus', type: 'money', label: 'Bu kanalda kazanma maliyeti' },
            { key: 'ltvEffect', type: 'text', label: 'Ömür değerine etkisi', placeholder: 'Artırdı, değiştirmedi, düşürdü' },
          ] },
          { key: 'winner', type: 'text', label: 'Kazanan kanal', maxLength: 120 },
          { key: 'referralWorks', type: 'toggle', label: 'Mevcut müşteri yeni müşteri getiriyor mu?', help: 'Getiriyorsa tavsiye düzenini kurun.', onLabel: 'Evet, getiriyor', offLabel: 'Hayır' },
        ],
      },
    ],
    output: '3 kanal deney raporu. Seçilen kanal.',
    outcomeTable: [
      { condition: 'Bir kanal kazanma maliyetini düşürüyor', result: 'O kanala odaklanın. Diğer ikisini bırakın.' },
      { condition: 'Hiçbir kanal maliyeti düşürmüyor', result: 'Kapı 7\'de "uyum var, kanal yok" satırı işler. 1 döngü daha deneyin.' },
    ],
    models: [38, 39],
    completeWhen: ['allChannels', 'trial', 'winner'],
  },
  {
    id: '31',
    decision: 7,
    title: 'Tam şirketleşme ve hukuk',
    question: 'Şirket, sözleşmeler ve izinler hazır mı?',
    mandatory: false,
    whenNote: 'İlk düzenli satıştan önce yapılır. Dış para ise yatırımcı görüşmesinden önce yapılır. Hangisi önce gelirse o tarih geçerlidir. Yüksek düzenleme ise ilk satıştan önce zorunludur.',
    who: 'Kurucu. Muhasebeci ve avukatla.',
    timebox: '2 ile 6 hafta. İzinler daha uzun sürebilir.',
    shortPath: false,
    howTo: [
      'Muhasebeciyle görüşün. Kalıcı şirket türünü seçin.',
      'Avukatla görüşün. Ortaklık sözleşmesi, müşteri sözleşmesi ve kişisel veri kurallarını yazdırın.',
      'Yüksek düzenleme ise izin ve ruhsat listesini Adım 04\'ten alın. Başvuruları başlatın.',
      'Kalıcı ödeme altyapısını kurun. Fatura ve tahsilat düzenini yazın.',
    ],
    sections: [
      {
        title: 'Yükümlülük listesi',
        fields: [
          { key: 'regulationNote', type: 'info', label: 'Yüksek düzenleme', tone: 'uyari', text: 'Yüksek düzenlemeli sektördesiniz. İzinler ilk satıştan önce zorunludur. Yüksek satış beklentisi bu engeli kaldırmaz.', when: { profile: { regulation: ['yuksek'] } } },
          { key: 'fundingNote', type: 'info', label: 'Dış para', tone: 'bilgi', text: 'Dış para alacaksınız. Yatırımcı görüşmesinden önce şirket ve sözleşmeler hazır olmalı.', when: { profile: { funding: ['dis'] } } },
          { key: 'done', type: 'checklist', label: 'Hazır olanları işaretleyin', items: [
            { value: 'sirket', label: 'Kalıcı şirket kuruldu.' },
            { value: 'sozlesmeler', label: 'Ortaklık ve müşteri sözleşmeleri yazıldı.' },
            { value: 'kvkk', label: 'Kişisel veri kuralları yazıldı. Kişisel veri, bir kişiyi tanıtan bilgidir.' },
            { value: 'izinler', label: 'İzin ve ruhsat başvuruları yapıldı.' },
            { value: 'fatura', label: 'Fatura ve tahsilat düzeni kuruldu.' },
          ] },
          { key: 'companyType', type: 'text', label: 'Seçilen şirket türü', maxLength: 80 },
          { key: 'internalNote', type: 'textarea', label: 'Kurum içi işte gerekçeli kapatma', help: 'Bu adım gerekmiyorsa nedenini yazın. Örneğin kurum içi birim olduğu için şirket kurulmaz.', rows: 2 },
        ],
      },
      {
        title: 'İzinler',
        when: { profile: { regulation: ['yuksek'] } },
        fields: [
          { key: 'permits', type: 'repeater', label: 'İzin başvuruları', addLabel: 'İzin ekle', columns: [
            { key: 'permit', type: 'text', label: 'İzin veya ruhsat' },
            { key: 'appliedAt', type: 'date', label: 'Başvuru tarihi' },
          ] },
        ],
      },
    ],
    output: 'Şirket. Sözleşmeler. İzin başvuruları. Fatura ve tahsilat düzeni.',
    outcomeTable: [
      { condition: 'Gerekli izin veya yetki eksik', result: 'Kapı 7 bekletir. İzne bağlı işi açmayın.' },
      { condition: 'Bir izin 6 aydan uzun sürüyor', result: 'Bekleme süresini Karar 8 planına ekleyin.' },
    ],
    models: [],
    completeWhen: ['done'],
  },
  {
    id: '32',
    decision: 7,
    title: 'Ürün ve hizmet kalitesi',
    question: 'Müşteri nerede takılıyor? En uzun bekleme nerede?',
    mandatory: false,
    whenNote: 'Adım 28\'de uyum işareti varsa yapılır. Adım 25\'teki "geliyor ama geri dönmüyor" durumu bu adıma gelmez. O durum Adım 13 ve 21\'e döner.',
    who: 'Kurucu ve ekip.',
    timebox: 'Her sürümde 1 hafta.',
    shortPath: false,
    intro: 'Balık kılçığı, bir sorunun nedenlerini altı başlıkta aramaktır. Başlıklar insan, makine, malzeme, yöntem, ölçüm ve ortamdır.',
    howTo: [
      'Dijitalde 5 kullanıcıyla ana akışı izleyin. Takıldıkları yeri yazın.',
      'Hizmette her adımı müşteri gözüyle yürüyün. Bekleme, belirsizlik ve hata noktalarını yazın.',
      'Fiziksel üründe iade ve şikâyet nedenlerini altı başlığa ayırın.',
      'Her sürümde en çok 3 iyileştirme yapın. Sonucu ölçün.',
      'En uzun beklemenin nerede olduğunu bulun. Destek, arıza ve şikâyet için sorumlu atayın.',
    ],
    sections: [
      {
        title: 'Sorun listesi',
        fields: [
          { key: 'digitalHow', type: 'info', label: 'Nasıl izlenir?', tone: 'ipucu', text: '5 kullanıcıyla ana akışı baştan sona izleyin. Yardım etmeyin. Takıldıkları yeri yazın.', when: { profile: { offering: ['dijital'] } } },
          { key: 'serviceHow', type: 'info', label: 'Nasıl izlenir?', tone: 'ipucu', text: 'Her adımı müşteri gözüyle yürüyün. Bekleme, belirsizlik ve hata noktalarını yazın.', when: { profile: { offering: ['hizmet'] } } },
          { key: 'physicalHow', type: 'info', label: 'Nasıl izlenir?', tone: 'ipucu', text: 'İade ve şikâyet nedenlerini sınıflandırın. Her nedeni altı başlıktan birine koyun.', when: { profile: { offering: ['fiziksel', 'donanim'] } } },
          { key: 'issues', type: 'repeater', label: 'Kusur defteri', addLabel: 'Sorun ekle', minRows: 1, columns: [
            { key: 'issue', type: 'text', label: 'Sorun' },
            { key: 'cause', type: 'select', label: 'Neden başlığı', options: [
              { value: 'insan', label: 'İnsan' },
              { value: 'makine', label: 'Makine' },
              { value: 'malzeme', label: 'Malzeme' },
              { value: 'yontem', label: 'Yöntem' },
              { value: 'olcum', label: 'Ölçüm' },
              { value: 'ortam', label: 'Ortam' },
            ] },
            { key: 'fix', type: 'text', label: 'Düzeltme' },
            { key: 'owner', type: 'text', label: 'Sorumlu' },
          ] },
        ],
      },
      {
        title: 'Sürüm planı',
        description: 'Her sürümde en çok 3 iyileştirme.',
        fields: [
          { key: 'releases', type: 'repeater', label: 'Bu sürümdeki iyileştirmeler', addLabel: 'İyileştirme ekle', maxRows: 3, columns: [
            { key: 'improvement', type: 'text', label: 'İyileştirme' },
            { key: 'measure', type: 'text', label: 'Sonucu nasıl ölçeriz?' },
          ] },
          { key: 'longestWait', type: 'text', label: 'En uzun bekleme nerede?', maxLength: 160 },
          { key: 'delayGrowing', type: 'toggle', label: 'Yeni sipariş geldikçe gecikme büyüyor mu?', onLabel: 'Evet, büyüyor', offLabel: 'Hayır' },
          { key: 'delayNote', type: 'info', label: 'Darboğaz', tone: 'uyari', text: 'Gecikme büyüyor. Kapı 7 "yeniden dene" der. Önce darboğazı giderin.', when: { field: { key: 'delayGrowing', truthy: true } } },
          { key: 'supportOwner', type: 'text', label: 'Destek, arıza ve şikâyet sorumlusu', maxLength: 80 },
        ],
      },
    ],
    output: 'Sorun listesi. Sürüm planı.',
    outcomeTable: [
      { condition: 'Yeni sipariş geldikçe gecikme büyüyor', result: 'Önce darboğazı giderin. Sonra Kapı 7\'ye gidin.' },
      { condition: 'Kalite, çalışan yükü veya iade kötüleşiyor', result: 'Büyümeyi bekletin. Üçünü kasa ile birlikte izleyin.' },
    ],
    models: [122, 90, 71],
    completeWhen: ['issues'],
  },
]
