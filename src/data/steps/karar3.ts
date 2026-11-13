import type { StepDef } from '../schema'

const IMPACT5 = ['Çok küçük', 'Küçük', 'Orta', 'Büyük', 'Çok büyük']
const EVIDENCE5 = ['Hiç kanıt yok', 'Zayıf kanıt', 'Orta kanıt', 'İyi kanıt', 'Güçlü kanıt']

type Row = Record<string, unknown> & { _id: string }

interface ScoreMatrixValue {
  weights: Record<string, number>
  locked: boolean
  scores: Record<string, Record<string, number>>
}

const OPTION_CRITERIA = [
  { key: 'musteriKaniti', label: 'Müşteri kanıtı' },
  { key: 'yapilabilirlik', label: 'Yapılabilirlik' },
  { key: 'maliyet', label: 'Maliyet' },
  { key: 'hiz', label: 'Hız' },
  { key: 'geriDonus', label: 'Geri dönülebilirlik' },
]

function optionTotals(v: Record<string, unknown>): { name: string; total: number }[] {
  const opts = (v.options as Row[] | undefined) ?? []
  const sm = v.scores as ScoreMatrixValue | undefined
  if (opts.length === 0 || !sm) return []
  return opts.map((o) => ({
    name: String(o.name ?? 'Adsız'),
    total: OPTION_CRITERIA.reduce((s, c) => s + (sm.scores[o._id]?.[c.key] ?? 0) * (sm.weights[c.key] ?? 1), 0),
  }))
}

export const KARAR3: StepDef[] = [
  {
    id: '09',
    decision: 3,
    title: 'Pazar ve rakip taraması',
    question: 'Kaç müşteriye gerçekten ulaşabilirsiniz? Aynı işi bugün kim yapıyor?',
    mandatory: true,
    who: 'Kurucu. Adım 06 ile paralel yapılır.',
    shortPath: true,
    howTo: [
      'Pazar büyüklüğünü aşağıdan yukarıya hesaplayın. Ulaşabileceğiniz müşteri sayısını yazın. Satış kapasitenizi yazın. İkisini çarpın.',
      'Aynı hesabı yukarıdan aşağıya da yapın. Sektör raporundan toplam pazarı alın. Payınızı tahmin edin.',
      'İki sonuç çok farklıysa ortalama almayın. Farkın nedenini araştırın.',
      'Rakip tablosu yapın. 3 ile 5 doğrudan rakip yazın. 2 ile 3 ikame yazın. İkame, aynı ihtiyacı gören farklı çözümdür.',
      '"Hiçbir şey yapmamak" da bir rakiptir. Onu da yazın.',
      'Rakiplerin olumsuz müşteri yorumlarını okuyun. Bunlar karşılanmamış ihtiyaçtır.',
      'Rakiplerin olmadığı 2 veya 3 boşluk yazın. Her boşluk için "neden boş?" diye sorun.',
    ],
    sections: [
      {
        title: 'Aşağıdan yukarıya hesap',
        description: 'Bu hesap sizin gerçekçi pazarınızdır. Kapı 3 bu sayıyı okur.',
        fields: [
          { key: 'reachableCustomers', type: 'number', label: 'Bugün ulaşabileceğiniz müşteri sayısı', required: true, unit: 'müşteri', min: 0, help: 'Adım 08\'deki ulaşma yoluyla gerçekten ulaşabildiğiniz kişi sayısı.', span: 12 },
          { key: 'salesCapacity', type: 'number', label: 'Bir yılda kaç müşteriye satış yapabilirsiniz?', required: true, unit: 'müşteri', min: 0, help: 'Teslim gücünüz ve zamanınız kaç müşteriye yeter?', span: 12 },
          { key: 'somCustomers', type: 'number', label: 'Gerçekçi pazar. Bir yılda kazanabileceğiniz müşteri sayısı', required: true, unit: 'müşteri', min: 0, help: 'Ulaşabildiğiniz sayı ile satış kapasitenizden küçük olanı yazın.', span: 12 },
          { key: 'targetCustomers', type: 'number', label: 'Başarı cümlesindeki müşteri hedefi', required: true, unit: 'müşteri', min: 0, help: 'Adım 02\'de yazdığınız başarı cümlesindeki sayı.', span: 12 },
          { key: 'reachNotes', type: 'textarea', label: 'Ulaşma yolu ve maliyeti. Bu sayılara nasıl ulaştınız?', required: true, rows: 3, maxLength: 500, placeholder: 'Dernek listesinde 120 bakkal var. 40\'ını tanıyorum. Haftada 3 ziyaret yapabilirim.' },
        ],
      },
      {
        title: 'Yukarıdan aşağıya hesap',
        fields: [
          { key: 'totalMarket', type: 'number', label: 'Toplam pazar. Sektördeki müşteri sayısı', unit: 'müşteri', min: 0, span: 12 },
          { key: 'totalMarketSource', type: 'text', label: 'Kaynak', placeholder: 'TÜİK, sektör derneği, Ticaret Bakanlığı', span: 12 },
          { key: 'totalMarketDate', type: 'date', label: 'Kaynağın tarihi', span: 12 },
          { key: 'sharePercent', type: 'number', label: 'Tahmini payınız', unit: '%', min: 0, max: 100, span: 12 },
          { key: 'gapReason', type: 'textarea', label: 'İki hesap çok farklıysa fark neden?', rows: 2, maxLength: 300, placeholder: 'Ortalama almayın. Nedeni yazın.' },
        ],
      },
      {
        title: 'Rakip tablosu',
        fields: [
          { key: 'competitors', type: 'repeater', label: 'Rakipler ve ikameler', addLabel: 'Rakip ekle', minRows: 1, columns: [
            { key: 'name', type: 'text', label: 'Rakip' },
            { key: 'kind', type: 'select', label: 'Tür', options: [
              { value: 'dogrudan', label: 'Doğrudan rakip' },
              { value: 'ikame', label: 'İkame', help: 'Aynı ihtiyacı gören farklı çözüm.' },
              { value: 'hicbirSey', label: 'Hiçbir şey yapmamak' },
            ] },
            { key: 'price', type: 'text', label: 'Fiyat' },
            { key: 'audience', type: 'text', label: 'Hedef kitle' },
            { key: 'feature', type: 'text', label: 'Temel özellik' },
            { key: 'channel', type: 'text', label: 'Kanal' },
            { key: 'weakness', type: 'text', label: 'Zayıf nokta', placeholder: 'Olumsuz yorumlardan' },
            { key: 'switchCost', type: 'text', label: 'Geçiş maliyeti', placeholder: 'Müşteri bu rakipten vazgeçerse ne kaybeder?' },
          ] },
        ],
      },
      {
        title: 'Boşluklar',
        fields: [
          { key: 'gaps', type: 'repeater', label: 'Rakiplerin olmadığı boşluklar', addLabel: 'Boşluk ekle', maxRows: 3, columns: [
            { key: 'gap', type: 'text', label: 'Boşluk' },
            { key: 'whyEmpty', type: 'text', label: 'Bu boşluk neden boş?' },
            { key: 'demandExists', type: 'toggle', label: 'Talep var mı?', onLabel: 'Evet, talep var', offLabel: 'Hayır veya bilinmiyor' },
            { key: 'recentlyFilled', type: 'toggle', label: 'Güçlü bir rakip son 6 ayda doldurdu mu?', onLabel: 'Evet, doldurdu', offLabel: 'Hayır' },
          ] },
        ],
      },
    ],
    output: 'Pazar büyüklüğü tablosu. Her sayının kaynağı ve tarihi. Rakip tablosu. Boşluk listesi.',
    outcomeTable: [
      { condition: 'Gerçekçi pazar, başarı cümlesindeki hedefin altında', result: 'Başarı tanımını küçültün veya segmenti genişletin.' },
      { condition: 'Bir boşluk talep olmadığı için boş', result: 'O boşluğu seçmeyin.' },
      { condition: 'Güçlü bir rakip aynı boşluğu son 6 ayda doldurdu', result: 'Adım 08\'e dönün. Farklı segment arayın.' },
    ],
    models: [11, 68, 92],
    completeWhen: ['reachableCustomers', 'salesCapacity', 'somCustomers', 'targetCustomers', 'reachNotes', 'competitors'],
    chart: {
      kind: 'funnel',
      title: 'Pazar katmanları',
      summary: (v) => {
        const som = Number(v.somCustomers ?? 0)
        const target = Number(v.targetCustomers ?? 0)
        if (!som) return ''
        if (!target) return `Gerçekçi pazar ${som} müşteri. Başarı hedefini yazın.`
        return som >= target ? `Gerçekçi pazar ${som} müşteri. Hedef ${target}. Hedef karşılanıyor.` : `Gerçekçi pazar ${som} müşteri. Hedef ${target}. Hedef karşılanmıyor.`
      },
      build: (v) => {
        const total = Number(v.totalMarket ?? 0)
        const reach = Number(v.reachableCustomers ?? 0)
        const som = Number(v.somCustomers ?? 0)
        if (!total && !reach && !som) return null
        const layers = [
          { name: 'Toplam pazar', value: total },
          { name: 'Ulaşabildiğiniz', value: reach },
          { name: 'Gerçekçi pazar', value: som },
        ].filter((l) => l.value > 0)
        return {
          option: {
            tooltip: { trigger: 'item' },
            series: [{ type: 'funnel', sort: 'none', left: '10%', width: '80%', gap: 4, minSize: '15%', label: { show: true, position: 'inside', formatter: '{b}: {c}' }, data: layers }],
          },
          table: { head: ['Katman', 'Müşteri'], rows: layers.map((l) => [l.name, l.value]) },
        }
      },
    },
  },
  {
    id: '10',
    decision: 3,
    title: 'Varsayım haritası',
    question: 'Hangi varsayım yanlış çıkarsa iş çöker? Önce onu test edin.',
    mandatory: true,
    who: 'Kurucu.',
    shortPath: true,
    howTo: [
      'Varsayımlarınızı dört başlıkta yazın. İstek. Yapılabilirlik. Para. Hukuk.',
      'Her varsayıma iki puan verin. Etki 1 ile 5. Kanıt 1 ile 5. Hiç kanıt yoksa 1.',
      'Önce etkisi yüksek ve kanıtı düşük varsayımları test edin. Yüksek etki 4 veya 5. Düşük kanıt 1 veya 2.',
      'Her kritik varsayım için "yanlış çıkarsa ne yaparım?" cümlesi yazın.',
      'Her kritik varsayım için "şu olursa yanlış sayarım" eşiği yazın.',
    ],
    sections: [
      {
        fields: [
          { key: 'areasNote', type: 'info', label: 'Dört başlık', tone: 'bilgi', text: 'İstek: müşteri bunu istiyor mu? Yapılabilirlik: biz bunu yapabilir miyiz? Para: bundan para kazanılır mı? Hukuk: bunu yapmak serbest mi?' },
          { key: 'assumptions', type: 'repeater', label: 'Varsayımlar', addLabel: 'Varsayım ekle', minRows: 1, columns: [
            { key: 'assumption', type: 'text', label: 'Varsayım', placeholder: 'Bakkallar günlük satış raporu için ayda 200 TL öder.' },
            { key: 'area', type: 'select', label: 'Başlık', options: [
              { value: 'istek', label: 'İstek' },
              { value: 'yapilabilirlik', label: 'Yapılabilirlik' },
              { value: 'para', label: 'Para' },
              { value: 'hukuk', label: 'Hukuk' },
            ] },
            { key: 'impact', type: 'rate', label: 'Etki. Yanlış çıkarsa ne kadar zarar verir?', labels: IMPACT5 },
            { key: 'evidence', type: 'rate', label: 'Kanıt. Elinizde ne kadar kanıt var?', labels: EVIDENCE5 },
            { key: 'testMethod', type: 'text', label: 'Test yöntemi', placeholder: 'Görüşme, sahte kapı, ön sipariş' },
            { key: 'falsifyThreshold', type: 'text', label: 'Şu olursa yanlış sayarım', placeholder: '10 bakkaldan 2\'den azı öderse' },
            { key: 'fallback', type: 'text', label: 'Yanlış çıkarsa ne yaparım?', placeholder: 'Fiyatı düşürürüm veya segmenti değiştiririm' },
          ] },
        ],
      },
    ],
    output: 'Varsayım tablosu. Önce test edilecek kritik varsayımlar.',
    models: [32, 21],
    completeWhen: ['assumptions'],
    chart: {
      kind: 'scatter',
      title: 'Varsayım haritası',
      summary: (v) => {
        const rows = ((v.assumptions as Row[] | undefined) ?? []).filter((r) => Number(r.impact) > 0 && Number(r.evidence) > 0)
        if (rows.length === 0) return ''
        const critical = rows.filter((r) => Number(r.impact) >= 4 && Number(r.evidence) <= 2).length
        return critical > 0 ? `${critical} kritik varsayım var. Etkisi yüksek, kanıtı düşük. Önce bunları test edin.` : 'Kritik varsayım görünmüyor. Kanıt puanlarını dürüst verdiğinizden emin olun.'
      },
      build: (v) => {
        const rows = ((v.assumptions as Row[] | undefined) ?? []).filter((r) => Number(r.impact) > 0 && Number(r.evidence) > 0)
        if (rows.length === 0) return null
        const data = rows.map((r) => [Number(r.evidence), Number(r.impact), String(r.assumption ?? 'Adsız')])
        return {
          option: {
            grid: { left: 48, right: 24, top: 24, bottom: 48 },
            tooltip: { trigger: 'item', formatter: (p: { data: (string | number)[] }) => `${p.data[2]}. Kanıt ${p.data[0]}, etki ${p.data[1]}.` },
            xAxis: { type: 'value', name: 'Kanıt', min: 1, max: 5, interval: 1, nameLocation: 'middle', nameGap: 28 },
            yAxis: { type: 'value', name: 'Etki', min: 1, max: 5, interval: 1 },
            series: [{ type: 'scatter', symbolSize: 20, data, markArea: { silent: true, itemStyle: { opacity: 0.08 }, data: [[{ xAxis: 1, yAxis: 4 }, { xAxis: 2, yAxis: 5 }]] } }],
          },
          table: { head: ['Varsayım', 'Kanıt', 'Etki'], rows: data.map((d) => [d[2], d[0], d[1]]) },
        }
      },
    },
  },
  {
    id: '11',
    decision: 3,
    title: 'Çözüm yolları',
    question: 'Aynı problemi çözmenin kaç yolu var? Hangisini test edeceksiniz?',
    mandatory: true,
    who: 'Kurucu. Dış göz katılırsa daha iyidir.',
    shortPath: true,
    howTo: [
      'Aynı problemi çözmenin farklı yollarını yazın. Ağır kararda en az üç yol. Küçük işte bugünkü yöntem ile bir alternatif yeter.',
      'Yol şunlardan biri olabilir. Ürün. Hizmet. İkisi birlikte. Ortaklık. Hazır bir şeyi satın alma. Tamamen elle çözüm.',
      '"Bugünkü yöntem" ilk satırda hazırdır. Bu "hiçbir şey yapma" seçeneğidir. Aynı ölçütle puanlayın.',
      'Puanlamadan önce hangi ölçütün daha önemli olduğunu yazın. Ağırlıkları kilitleyin. Sonra puan verin.',
      'En yüksek iki yolu Adım 15\'te test edin. Tek yol test etmeyin.',
      'Pazar yeri ise ilk toplanacak tarafı burada seçin.',
    ],
    sections: [
      {
        title: 'Yollar',
        fields: [
          { key: 'heavyNote', type: 'info', label: 'Ağır yatırım', tone: 'uyari', text: 'Bu iş ağır yatırım. Bugünkü yöntem dışında en az üç yol yazın.', when: { not: { profile: { smallReversible: [true] } } } },
          { key: 'smallNote', type: 'info', label: 'Küçük iş', tone: 'ipucu', text: 'Bu iş küçük ve geri alınabilir. Bugünkü yöntem ile bir gerçek alternatif yeter.', when: { profile: { smallReversible: [true] } } },
          { key: 'options', type: 'repeater', label: 'Çözüm yolları', addLabel: 'Yol ekle', fixedFirstRow: { name: 'Bugünkü yöntem' }, columns: [
            { key: 'name', type: 'text', label: 'Yol' },
            { key: 'kind', type: 'select', label: 'Tür', options: [
              { value: 'bugunku', label: 'Bugünkü yöntem' },
              { value: 'urun', label: 'Ürün' },
              { value: 'hizmet', label: 'Hizmet' },
              { value: 'ikisi', label: 'Ürün ve hizmet birlikte' },
              { value: 'ortaklik', label: 'Ortaklık' },
              { value: 'satinAlma', label: 'Hazır bir şeyi satın alma' },
              { value: 'elle', label: 'Tamamen elle çözüm' },
            ] },
            { key: 'firstStep', type: 'text', label: 'İlk adım ve bedeli', placeholder: 'Bir günlük araç gideri' },
            { key: 'learning', type: 'text', label: 'Ne öğrenilir?' },
          ] },
        ],
      },
      {
        title: 'Puanlama',
        fields: [
          { key: 'criteriaPriority', type: 'textarea', label: 'Hangi ölçüt daha önemli? Puanlamadan önce yazın.', rows: 2, maxLength: 300, placeholder: 'Bizim için geri dönülebilirlik en önemli. Sonra müşteri kanıtı.' },
          { key: 'scores', type: 'scoreMatrix', label: 'Beş ölçütle puanlayın', help: 'Geri dönülebilirlik, yanlış çıkarsa vazgeçmenin ne kadar kolay olduğudur.', rowsFrom: 'options', rowLabelKey: 'name', criteria: OPTION_CRITERIA },
          { key: 'currentMethodWins', type: 'toggle', label: '"Bugünkü yöntem" en yüksek puanı mı aldı?', help: 'Evet ise durun. Kanıt tablosuna bakın. Beklet kararı düşünün.', onLabel: 'Evet, bugünkü yöntem üstün', offLabel: 'Hayır' },
        ],
      },
      {
        title: 'Test edilecek iki yol',
        fields: [
          { key: 'testOption1', type: 'text', label: 'Birinci yol', required: true, placeholder: 'En yüksek puanlı yol', span: 12 },
          { key: 'testOption2', type: 'text', label: 'İkinci yol', placeholder: 'İkinci yüksek puanlı yol', span: 12 },
          { key: 'cannotDo', type: 'text', label: 'En iyi yol sizin yapamayacağınız bir şey mi? Yazın.', placeholder: 'Adım 12\'de ortak veya satın alma yolunu yazacaksınız.', maxLength: 200 },
          { key: 'secondOpinion', type: 'text', label: 'Tek yol kaldıysa ikinci görüş kimden alındı?', placeholder: 'Dış gözün adı ve görüşü', maxLength: 200 },
        ],
      },
      {
        title: 'Pazar yeri',
        when: { profile: { customer: ['pazarYeri'] } },
        fields: [
          { key: 'firstSide', type: 'segmented', label: 'İlk hangi tarafı toplayacaksınız?', options: [
            { value: 'satan', label: 'Satan taraf' },
            { value: 'alan', label: 'Alan taraf' },
          ] },
          { key: 'firstSideReason', type: 'text', label: 'Neden bu taraf?', maxLength: 200 },
        ],
      },
    ],
    output: 'Seçenek tablosu. Test edilecek 2 yol.',
    outcomeTable: [
      { condition: 'Üç yol bulamıyorsanız', result: 'Dış gözle 1 saatlik toplantı yapın. Üç tur yapın. Önce yalnız hayal kurun. Sonra yalnız nasıl yapılacağını konuşun. Sonra yalnız eleştirin.' },
      { condition: '"Bugünkü yöntem" en yüksek puanı alıyorsa', result: 'Durun. Kanıt tablosuna bakın. Beklet kararı düşünün.' },
      { condition: 'En iyi yol sizin yapamayacağınız bir şeyse', result: 'Adım 12\'de ortak veya satın alma yolunu yazın.' },
    ],
    models: [12, 47, 99, 56],
    completeWhen: ['options', 'scores', 'testOption1'],
    chart: {
      kind: 'bar',
      title: 'Seçenek puanı',
      summary: (v) => {
        const totals = optionTotals(v).filter((t) => t.total > 0)
        if (totals.length === 0) return ''
        const sorted = [...totals].sort((a, b) => b.total - a.total)
        if (sorted[0].name === 'Bugünkü yöntem') return 'Bugünkü yöntem en yüksek puanı aldı. Durun ve kanıt tablosuna bakın.'
        return sorted.length >= 2 ? `En yüksek iki yol: ${sorted[0].name} ve ${sorted[1].name}. İkisini de test edin.` : `En yüksek yol: ${sorted[0].name}. İkinci bir yol daha puanlayın.`
      },
      build: (v) => {
        const totals = optionTotals(v)
        if (!totals.some((t) => t.total > 0)) return null
        return {
          option: {
            grid: { left: 140, right: 32, top: 16, bottom: 24 },
            xAxis: { type: 'value', name: 'puan' },
            yAxis: { type: 'category', data: totals.map((t) => t.name) },
            series: [{ type: 'bar', data: totals.map((t) => t.total), label: { show: true, position: 'right' } }],
          },
          table: { head: ['Yol', 'Ağırlıklı toplam'], rows: totals.map((t) => [t.name, t.total]) },
        }
      },
    },
  },
  {
    id: '12',
    decision: 3,
    title: 'Yapabilirlik ve kaynak',
    question: 'Seçtiğiniz yolu gerçekten yapabilir misiniz? Neyi kendiniz, neyi dışarıdan alacaksınız?',
    mandatory: false,
    whenNote: 'Donanım, fiziksel ürün veya mekân gereken işte tam sürüm zorunludur. Diğer işlerde beceri tablosu yeter. Bu adımı Adım 15\'ten önce bitirin.',
    who: 'Kurucu. Teknik konuda uzman görüşü alın.',
    shortPath: true,
    howTo: [
      'Çözüm için gereken her beceriyi yazın.',
      'Her beceri için üç seçenekten birini seçin. Kendimiz yaparız. Satın alırız. Ortakla yaparız.',
      'Donanım veya derin teknolojide teknik ön kanıt planlayın. Teknik ön kanıt, çözümün çalıştığını gösteren küçük deneme parçasıdır.',
      'Fiziksel üründe tedarik, üretim, stok ve kargo maliyetini yazın. En küçük sipariş miktarını öğrenin.',
      'Mekân gerekiyorsa konum ve kira ayrı bir karardır. Uzun kira imzalamadan önce geçici satış noktasıyla test edin.',
      'Gereken parayı ve süreyi pistle karşılaştırın. Pist, para bitene kadar kalan ay sayısıdır.',
    ],
    sections: [
      {
        title: 'Beceri tablosu',
        fields: [
          { key: 'mustNote', type: 'info', label: 'Bu adım sizin için zorunlu', tone: 'uyari', text: 'İşiniz donanım, fiziksel ürün veya mekân gerektiriyor. Aşağıdaki bütün bölümleri doldurun.', when: { any: [{ profile: { offering: ['donanim', 'fiziksel'] } }, { profile: { needsPremises: [true] } }] } },
          { key: 'skills', type: 'repeater', label: 'Gereken beceriler', addLabel: 'Beceri ekle', minRows: 1, columns: [
            { key: 'skill', type: 'text', label: 'Beceri', placeholder: 'Yazılım, satış, üretim, muhasebe' },
            { key: 'plan', type: 'select', label: 'Nasıl edinilecek?', options: [
              { value: 'yap', label: 'Kendimiz yaparız' },
              { value: 'satinAl', label: 'Satın alırız' },
              { value: 'ortak', label: 'Ortakla yaparız' },
              { value: 'yok', label: 'Edinemiyoruz', help: 'Bu beceri kritikse Adım 11\'e dönün.' },
            ] },
            { key: 'partnerConfirmed', type: 'toggle', label: 'Ortak yazılı onay verdi mi?', onLabel: 'Evet, yazılı onay var', offLabel: 'Hayır' },
            { key: 'costNote', type: 'text', label: 'Bedeli ve süresi', placeholder: 'Ayda 5.000 TL, 2 ay' },
          ] },
        ],
      },
      {
        title: 'Teknik ön kanıt',
        when: { profile: { offering: ['donanim'] } },
        fields: [
          { key: 'techProof', type: 'textarea', label: 'Teknik ön kanıt planı. Hangi küçük parça çalıştığını gösterecek?', rows: 3, maxLength: 500 },
          { key: 'techProofMonths', type: 'number', label: 'Teknik ön kanıt kaç ay sürer?', unit: 'ay', min: 0, max: 36, span: 12 },
          { key: 'techProofCostKurus', type: 'money', label: 'Teknik ön kanıt kaç para tutar?', span: 12 },
          { key: 'patentSearched', type: 'toggle', label: 'Patent taraması yapıldı mı?', onLabel: 'Evet, yapıldı', offLabel: 'Hayır' },
          { key: 'approvals', type: 'text', label: 'Gereken onay süreçleri', placeholder: 'Belgelendirme, test, ruhsat', maxLength: 200 },
          { key: 'techProofNote', type: 'info', label: 'Dikkat', tone: 'uyari', text: 'Teknik ön kanıt 3 aydan uzun sürüyor. Bu süre Karar 6\'ya eklenir. Pist yetmiyorsa Kapı 4\'te beklet.', when: { field: { key: 'techProofMonths', in: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36] } } },
        ],
      },
      {
        title: 'Tedarik ve üretim',
        when: { profile: { offering: ['fiziksel'] } },
        fields: [
          { key: 'supplyCostKurus', type: 'money', label: 'Tedarik maliyeti. Bir birim için', span: 12 },
          { key: 'productionCostKurus', type: 'money', label: 'Üretim maliyeti. Bir birim için', span: 12 },
          { key: 'stockCostKurus', type: 'money', label: 'Stok maliyeti. Aylık', span: 12 },
          { key: 'shippingCostKurus', type: 'money', label: 'Kargo maliyeti. Bir sipariş için', span: 12 },
          { key: 'moq', type: 'number', label: 'En küçük sipariş miktarı', unit: 'adet', min: 0, help: 'Tedarikçinin kabul ettiği en küçük sipariş.', span: 12 },
          { key: 'moqCostKurus', type: 'money', label: 'En küçük siparişin toplam bedeli', span: 12 },
          { key: 'supplyLeadDays', type: 'number', label: 'Tedarik süresi', unit: 'gün', min: 0, span: 12 },
          { key: 'moqNote', type: 'info', label: 'İpucu', tone: 'ipucu', text: 'En küçük sipariş pisti aşıyorsa ön sipariş sayısını artırın. Ya da ürünü elle yapın.' },
        ],
      },
      {
        title: 'Mekân',
        when: { profile: { needsPremises: [true] } },
        fields: [
          { key: 'location', type: 'text', label: 'Düşünülen konum', help: 'Konumu müşteri yoğunluğuna göre seçin.', maxLength: 200 },
          { key: 'rentKurus', type: 'money', label: 'Aylık kira', span: 12 },
          { key: 'leaseMonths', type: 'number', label: 'Kira sözleşmesi kaç ay?', unit: 'ay', min: 0, span: 12 },
          { key: 'tempPointPlan', type: 'text', label: 'Geçici satış noktası planı', placeholder: 'Pazar tezgâhı, başka dükkânda raf, paylaşımlı mekân', maxLength: 200 },
          { key: 'leaseNote', type: 'info', label: 'Dikkat', tone: 'uyari', text: 'Uzun kira imzalamadan önce geçici satış noktasıyla test edin.' },
        ],
      },
      {
        title: 'Pistle karşılaştırma',
        fields: [
          { key: 'neededMoneyKurus', type: 'money', label: 'Bu yol için gereken toplam para', span: 12 },
          { key: 'neededMonths', type: 'number', label: 'Bu yol için gereken süre', unit: 'ay', min: 0, span: 12 },
          { key: 'fitsRunway', type: 'toggle', label: 'Para ve süre piste sığıyor mu?', onLabel: 'Evet, sığıyor', offLabel: 'Hayır, sığmıyor' },
        ],
      },
    ],
    output: 'Beceri tablosu. Yap, satın al veya ortak ol kararları. Teknik ön kanıt planı.',
    outcomeTable: [
      { condition: 'Kritik beceri yok ve edinilemiyor', result: 'Adım 11\'e dönün. Başka yol seçin.' },
      { condition: 'Teknik ön kanıt 3 aydan uzun sürüyor', result: 'Bu süre Karar 6\'ya eklenir. Pist yetmiyorsa Kapı 4\'te beklet.' },
      { condition: 'En küçük sipariş miktarı pisti aşıyor', result: 'Ön sipariş sayısını artırın. Ya da ürünü elle yapın.' },
    ],
    models: [67, 80, 49],
    completeWhen: ['skills'],
  },
]
