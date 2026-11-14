import type { StepDef } from '../schema'
import { formatDate, formatMoney } from '@/engine/format'

const RATE3 = ['Düşük', 'Orta', 'Yüksek']

type Row = Record<string, unknown>

function rows(v: unknown): Row[] {
  return Array.isArray(v) ? (v as Row[]) : []
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isNaN(n) ? null : n
}

/** Kuruşu TL'ye çevirir. Grafik eksenleri TL gösterir. */
function lira(kurus: number): number {
  return Math.round(kurus) / 100
}

export const KARAR5: StepDef[] = [
  {
    id: '16',
    decision: 5,
    title: 'Tek sayfalık iş planı ve para mantığı',
    question: 'Kime, neyi, hangi yolla satacaksınız? Para dayanıyor mu?',
    mandatory: true,
    who: 'Kurucu.',
    timebox: '1 hafta.',
    shortPath: true,
    intro: 'Bu adımda işin bütünü tek sayfaya sığar. Para mantığını kesin sayıyla değil aralıkla yazın. Üç hesap ölçüyü işe bağlar.',
    howTo: [
      'Dokuz kutuyu doldurun. Son kutu boş kalabilir.',
      'Para mantığını üç durumla yazın. Durumlar kötü, orta ve iyidir. Kesin sayı yazmayın.',
      'İstediğiniz kârdan geriye doğru hesaplayın. Gereken gelir, izin verilen maliyet ve gereken müşteri sayısı çıkar.',
      'Üç hesabı yapın. Siparişin katkısı, başabaş sayısı ve kasa durumu.',
      'En kırılgan sayıyı bulun. "Bu sayı yüzde 20 kötüleşirse iş batar mı?" diye sorun.',
    ],
    sections: [
      {
        title: 'Dokuz kutu',
        description: 'Her kutuya iki veya üç cümle yazın.',
        fields: [
          { key: 'problem', type: 'textarea', label: 'Problem', rows: 2, span: 12, placeholder: 'Müşteri hangi sorunu yaşıyor?' },
          { key: 'segment', type: 'textarea', label: 'Müşteri segmenti', help: 'Segment, aynı sorunu yaşayan müşteri grubudur.', rows: 2, span: 12 },
          { key: 'valueProp', type: 'textarea', label: 'Değer önerisi', help: 'Müşteri sizden neden alır?', rows: 2, span: 12 },
          { key: 'solution', type: 'textarea', label: 'Çözüm', rows: 2, span: 12 },
          { key: 'channels', type: 'textarea', label: 'Kanallar', help: 'Müşteriye hangi yolla ulaşırsınız?', rows: 2, span: 12 },
          { key: 'revenue', type: 'textarea', label: 'Gelir', help: 'Para nereden ve nasıl gelir?', rows: 2, span: 12 },
          { key: 'marketplaceRevenueNote', type: 'info', label: 'Pazar yeri', tone: 'ipucu', text: 'Pazar yerinde gelir işlem başına komisyondur. "Bir işlemden kaç para kalıyor?" diye sorun.', when: { profile: { customer: ['pazarYeri'] } } },
          { key: 'cost', type: 'textarea', label: 'Maliyet', help: 'Sabit giderler ve satışa bağlı giderler.', rows: 2, span: 12 },
          { key: 'metrics', type: 'textarea', label: 'Ana göstergeler', help: 'Her hafta hangi sayılara bakacaksınız?', rows: 2, span: 12 },
          { key: 'unfairAdvantage', type: 'textarea', label: 'Haksız avantaj', help: 'Haksız avantaj, rakibin kolayca kopyalayamadığı şeydir. Boş kalabilir.', rows: 2, span: 12 },
        ],
      },
      {
        title: 'Üç durumlu para',
        description: 'Bir siparişin katkısını üç durumda yazın. Eksi sayı yazılabilir.',
        fields: [
          { key: 'contributionInfo', type: 'info', label: 'Siparişin katkısı nasıl hesaplanır?', tone: 'bilgi', text: 'Net satıştan siparişe bağlı giderleri çıkarın. Kalan para sabit giderleri karşılamaya yardım eder. Zaten düşülen iadeyi veya gideri tekrar düşmeyin.' },
          { key: 'contributionLow', type: 'money', label: 'Kötü durumda bir siparişin katkısı', span: 8 },
          { key: 'contributionMid', type: 'money', label: 'Orta durumda bir siparişin katkısı', required: true, span: 8 },
          { key: 'contributionHigh', type: 'money', label: 'İyi durumda bir siparişin katkısı', span: 8 },
          { key: 'monthlyPerCustomerKurus', type: 'money', label: 'Bir müşteriden aylık gelen para (orta durum)', span: 12 },
          { key: 'acquisitionKurus', type: 'money', label: 'Bir müşteriyi getirme gideri (orta durum)', span: 12 },
          { key: 'paybackMonths', type: 'number', label: 'Müşteri kazanma gideri kaç ayda geri gelir?', unit: 'ay', min: 0, max: 60, span: 12 },
          { key: 'collectionDays', type: 'number', label: 'Para kaç günde elinize geçer?', help: 'Müşteri vadeyle ödüyorsa vadeyi yazın. Vade pisti kısaltır.', unit: 'gün', min: 0, max: 365, span: 12 },
          { key: 'paybackNote', type: 'info', label: 'Dikkat', tone: 'uyari', text: 'Müşteri kazanma gideri 12 aydan geç geri geliyor. Kanal varsayımını Adım 24\'te ilk test edin.', when: { all: [{ field: { key: 'paybackMonths', truthy: true } }, { not: { field: { key: 'paybackMonths', in: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] } } }] } },
          { key: 'freeServiceInfo', type: 'info', label: 'Ücretsiz hizmet', tone: 'ipucu', text: 'Ücretsiz hizmette teslim başına gider hesaplanır. Toplam gideri başarıyla tamamlanan hizmet sayısına bölün. Hizmeti hiç alamayanları ayrıca sayın. Tamamlanan hizmet yoksa birim gider hesaplanamaz.', when: { profile: { paid: [false] } } },
        ],
      },
      {
        title: 'Başabaş sayısı',
        fields: [
          { key: 'breakEvenInfo', type: 'info', label: 'Başabaş sayısı nasıl hesaplanır?', tone: 'bilgi', text: 'Dönemin sabit giderini bir siparişin katkısına bölün. Kesirli sonucu üst tam sayıya yuvarlayın. Katkı sıfır veya eksiyse sipariş sayısını artırmak sabit gideri karşılamaz.' },
          { key: 'breakEvenCount', type: 'number', label: 'Aylık kaç sipariş sabit gideri karşılar?', unit: 'sipariş', min: 0, span: 12 },
        ],
      },
      {
        title: 'Kasa durumu',
        description: 'Her ödeme gününü yazın. O günün sonunda kasada kalan parayı yazın.',
        fields: [
          { key: 'cashInfo', type: 'info', label: 'Kasa durumu nasıl hesaplanır?', tone: 'bilgi', text: 'Başlangıç parasına dönem içinde gelen ödemeleri ekleyin. Aynı dönemde çıkan ödemeleri çıkarın. En düşük bakiyeyi ödeme gününde kontrol edin. Vadeli satışın parası tahsilat gününde kasaya girer.' },
          { key: 'paymentDays', type: 'repeater', label: 'Ödeme günleri', addLabel: 'Ödeme günü ekle', minRows: 1, columns: [
            { key: 'date', type: 'date', label: 'Ödeme günü' },
            { key: 'labelText', type: 'text', label: 'Ne ödeniyor veya ne geliyor?', placeholder: 'Kira, maaş, tahsilat' },
            { key: 'balanceAfterKurus', type: 'money', label: 'O gün sonunda kasada kalan' },
          ] },
          { key: 'cashDaysNote', type: 'textarea', label: 'Kasa notu', help: 'Kasanın en düşük olduğu günü ve nedenini yazın.', rows: 2 },
        ],
      },
      {
        title: 'En kırılgan sayı',
        fields: [
          { key: 'fragileNumber', type: 'text', label: 'Yüzde 20 kötüleşince işi batıran sayı hangisi?', required: true, maxLength: 160, placeholder: 'Örneğin aylık müşteri başına gelir.' },
          { key: 'fragileTested', type: 'toggle', label: 'Bu sayı test edildi mi?', onLabel: 'Evet, kanıt var', offLabel: 'Hayır, varsayım' },
          { key: 'fragileNote', type: 'info', label: 'Dikkat', tone: 'uyari', text: 'En kırılgan sayı test edilmemiş bir varsayım. Adım 10\'daki tabloya "kritik" diye ekleyin.', when: { all: [{ field: { key: 'fragileNumber', truthy: true } }, { field: { key: 'fragileTested', truthy: false } }] } },
        ],
      },
    ],
    output: 'Tek sayfalık iş planı. Üç durumlu para tablosu. Üç hesap. En kırılgan sayı.',
    outcomeTable: [
      { condition: 'Orta durumda bile katkı sıfır veya eksi', result: 'Fiyatı veya maliyeti değiştirin. Kapı 5\'ten geçmeyin.' },
      { condition: 'Müşteri kazanma gideri 12 aydan geç geri geliyor', result: 'Kanal varsayımını Adım 24\'te ilk test edin.' },
      { condition: 'En kırılgan sayı test edilmemiş bir varsayım', result: 'Adım 10\'daki tabloya "kritik" diye ekleyin.' },
    ],
    models: [120, 128, 118],
    completeWhen: ['problem', 'segment', 'valueProp', 'solution', 'channels', 'revenue', 'cost', 'metrics', 'contributionMid', 'paymentDays', 'fragileNumber'],
    chart: {
      kind: 'line',
      title: 'Üç durumlu katkı ve kasa çizgisi',
      summary: (v) => {
        const mid = num(v.contributionMid)
        const days = rows(v.paymentDays).filter((r) => num(r.balanceAfterKurus) !== null)
        const parts: string[] = []
        if (mid !== null) parts.push(mid > 0 ? `Orta durumda katkı ${formatMoney(mid)}.` : 'Orta durumda katkı sıfır veya eksi. Kapı 5\'ten geçmeyin.')
        if (days.length) {
          const minRow = days.reduce((a, b) => (Number(a.balanceAfterKurus) <= Number(b.balanceAfterKurus) ? a : b))
          const minBal = Number(minRow.balanceAfterKurus)
          parts.push(minBal < 0 ? `Kasa ${formatDate(String(minRow.date))} eksiye düşüyor.` : `En düşük kasa ${formatMoney(minBal)}. Eksiye düşmüyor.`)
        }
        return parts.join(' ')
      },
      build: (v) => {
        const contrib = [num(v.contributionLow), num(v.contributionMid), num(v.contributionHigh)]
        const hasContrib = contrib.some((x) => x !== null)
        const days = rows(v.paymentDays)
          .filter((r) => num(r.balanceAfterKurus) !== null)
          .sort((a, b) => String(a.date ?? '').localeCompare(String(b.date ?? '')))
        const hasCash = days.length > 0
        if (!hasContrib && !hasCash) return null
        const contribLabels = ['Kötü', 'Orta', 'İyi']
        const contribData = contrib.map((x) => (x === null ? 0 : lira(x)))
        const cashLabels = days.map((r) => formatDate(String(r.date), false))
        const cashData = days.map((r) => lira(Number(r.balanceAfterKurus)))
        const table = {
          head: ['Ölçü', 'TL'],
          rows: [
            ...(hasContrib ? contribLabels.map((l, i) => [`${l} durumda katkı`, contribData[i]]) : []),
            ...(hasCash ? cashLabels.map((l, i) => [`${l} kasa`, cashData[i]]) : []),
          ] as (string | number)[][],
        }
        if (hasContrib && hasCash) {
          return {
            option: {
              grid: [{ left: 72, right: 24, top: 28, height: '32%' }, { left: 72, right: 24, top: '58%', height: '30%' }],
              xAxis: [{ type: 'category', data: contribLabels, gridIndex: 0 }, { type: 'category', data: cashLabels, gridIndex: 1 }],
              yAxis: [{ type: 'value', name: 'TL', gridIndex: 0 }, { type: 'value', name: 'TL', gridIndex: 1 }],
              series: [
                { type: 'bar', name: 'Katkı', data: contribData, xAxisIndex: 0, yAxisIndex: 0, label: { show: true, position: 'top' } },
                { type: 'line', name: 'Kasa', data: cashData, xAxisIndex: 1, yAxisIndex: 1, markLine: { symbol: 'none', data: [{ yAxis: 0, name: 'Sıfır' }] } },
              ],
            },
            table,
          }
        }
        if (hasContrib) {
          return {
            option: { grid: { left: 72, right: 24, top: 28, bottom: 32 }, xAxis: { type: 'category', data: contribLabels }, yAxis: { type: 'value', name: 'TL' }, series: [{ type: 'bar', name: 'Katkı', data: contribData, label: { show: true, position: 'top' } }] },
            table,
          }
        }
        return {
          option: { grid: { left: 72, right: 24, top: 28, bottom: 32 }, xAxis: { type: 'category', data: cashLabels }, yAxis: { type: 'value', name: 'TL' }, series: [{ type: 'line', name: 'Kasa', data: cashData, markLine: { symbol: 'none', data: [{ yAxis: 0, name: 'Sıfır' }] } }] },
          table,
        }
      },
    },
  },
  {
    id: '17',
    decision: 5,
    title: 'Risk ve ön ölüm analizi',
    question: 'Bu iş 12 ay sonra batsa neden batardı? Hangi risk kritik?',
    mandatory: true,
    who: 'Kurucu. Dış göz katılırsa daha iyidir.',
    timebox: '2 ile 3 gün.',
    shortPath: false,
    intro: 'Ön ölüm analizi, işin battığını hayal edip nedenleri önceden yazmaktır. Böylece önlem erken alınır.',
    howTo: [
      '"Bu iş 12 ay sonra battı" diye düşünün. En olası 5 nedeni yazın.',
      'Her nedene erken işaret, önlem, sorumlu ve durdurma eşiği yazın.',
      'Riskleri altı başlıkta kontrol edin. Başlıklar ticari, teknik, para, operasyon, tedarik ve hukuktur.',
      'Her riske olasılık ve etki puanı verin. Puan 1 ile 3 arasıdır. Çarpımı 6 ve üstü olan risk kritiktir.',
      'Her kritik riske bir olay, koşul ve eylem kuralı yazın.',
      'Geri dönülemez kararları işaretleyin. Örneğin uzun kira, büyük stok ve ortaklık payı geri dönülemez.',
    ],
    sections: [
      {
        title: 'Ön ölüm listesi',
        description: 'İş 12 ay sonra battı. Neden?',
        fields: [
          { key: 'premortem', type: 'repeater', label: 'En olası beş neden', addLabel: 'Neden ekle', minRows: 1, maxRows: 5, columns: [
            { key: 'reason', type: 'text', label: 'Batma nedeni' },
            { key: 'earlySignal', type: 'text', label: 'Erken işaret' },
            { key: 'prevention', type: 'text', label: 'Önlem' },
            { key: 'owner', type: 'text', label: 'Sorumlu' },
            { key: 'stopThreshold', type: 'text', label: 'Durdurma eşiği', placeholder: 'Sayı içersin.' },
          ] },
        ],
      },
      {
        title: 'Risk tablosu',
        description: 'Olasılık çarpı etki 6 ve üstü ise risk kritiktir.',
        fields: [
          { key: 'supplyInfo', type: 'info', label: 'Tedarik başlığı', tone: 'ipucu', text: 'Tedarik başlığında tek tedarikçiye bağımlılık, teslim süresi ve kalite yazılır.', when: { profile: { offering: ['fiziksel', 'donanim'] } } },
          { key: 'legalInfo', type: 'info', label: 'Hukuk başlığı', tone: 'ipucu', text: 'Yüksek düzenleme var. Hukuk başlığında her izni ayrı satır yapın.', when: { profile: { regulation: ['yuksek'] } } },
          { key: 'risks', type: 'repeater', label: 'Riskler', addLabel: 'Risk ekle', minRows: 1, columns: [
            { key: 'risk', type: 'text', label: 'Risk' },
            { key: 'category', type: 'select', label: 'Başlık', options: [
              { value: 'ticari', label: 'Ticari' },
              { value: 'teknik', label: 'Teknik' },
              { value: 'para', label: 'Para' },
              { value: 'operasyon', label: 'Operasyon' },
              { value: 'tedarik', label: 'Tedarik' },
              { value: 'hukuk', label: 'Hukuk' },
            ] },
            { key: 'likelihood', type: 'rate', label: 'Olasılık', max: 3, labels: RATE3 },
            { key: 'impact', type: 'rate', label: 'Etki', max: 3, labels: RATE3 },
            { key: 'trigger', type: 'text', label: 'Tetikleyici olay' },
            { key: 'response', type: 'text', label: 'Karşılık' },
            { key: 'owner', type: 'text', label: 'Sorumlu' },
          ] },
        ],
      },
      {
        title: 'Kritik riskler için kurallar',
        description: 'Her kritik risk için bir satır yazın.',
        fields: [
          { key: 'eca', type: 'repeater', label: 'Olay, koşul ve eylem kuralları', addLabel: 'Kural ekle', columns: [
            { key: 'event', type: 'text', label: 'Olay', placeholder: 'Ne olursa?' },
            { key: 'condition', type: 'text', label: 'Koşul', placeholder: 'Hangi sınır aşılırsa?' },
            { key: 'action', type: 'text', label: 'Eylem', placeholder: 'Ne yapılır?' },
            { key: 'who', type: 'text', label: 'Kim yapar?' },
            { key: 'when', type: 'text', label: 'Ne zaman?' },
          ] },
        ],
      },
      {
        title: 'Geri dönülemez kararlar',
        fields: [
          { key: 'irreversible', type: 'chips', label: 'Hangi kararlar geri alınamaz?', options: [
            { value: 'uzunKira', label: 'Uzun kira sözleşmesi' },
            { value: 'buyukStok', label: 'Büyük stok' },
            { value: 'ortaklikPayi', label: 'Ortaklık payı' },
            { value: 'iseAlim', label: 'İşe alım' },
            { value: 'buyukAlim', label: 'Büyük makine veya alım' },
            { value: 'uzunSozlesme', label: 'Uzun müşteri sözleşmesi' },
            { value: 'kredi', label: 'Kredi' },
            { value: 'diger', label: 'Başka' },
          ] },
          { key: 'irreversibleNote', type: 'textarea', label: 'Bu kararları nasıl küçültürsünüz?', help: 'Örneğin kısa kira, küçük stok ve deneme ortaklığı.', rows: 2 },
        ],
      },
    ],
    output: 'Ön ölüm listesi. Risk tablosu. Kritik riskler için kural listesi. Geri dönülemez kararlar listesi.',
    outcomeTable: [
      { condition: 'Bir riskin önlemi yok ve etkisi işi bitiriyor', result: 'Bu riski durdurma kuralı yapın. Ya da önce koruyucu bir deney tasarlayın.' },
      { condition: 'Geri dönülemez bir karar Karar 5\'ten önce gerekiyor', result: 'Kararı küçültün. Kısa kira, küçük stok ve deneme ortaklığı seçin.' },
    ],
    models: [41, 33, 93],
    completeWhen: ['premortem', 'risks'],
    chart: {
      kind: 'heatmap',
      title: 'Risk ısı haritası',
      summary: (v) => {
        const rs = rows(v.risks).filter((r) => num(r.likelihood) && num(r.impact))
        if (!rs.length) return ''
        const critical = rs.filter((r) => Number(r.likelihood) * Number(r.impact) >= 6).length
        return critical ? `${critical} kritik risk var. Her biri için kural yazın.` : 'Kritik risk yok. Tabloyu her döngüde yenileyin.'
      },
      build: (v) => {
        const rs = rows(v.risks).filter((r) => num(r.likelihood) && num(r.impact))
        if (!rs.length) return null
        const counts: number[][] = []
        for (let l = 1; l <= 3; l++) for (let i = 1; i <= 3; i++) {
          const c = rs.filter((r) => Number(r.likelihood) === l && Number(r.impact) === i).length
          counts.push([l - 1, i - 1, c])
        }
        return {
          option: {
            grid: { left: 90, right: 24, top: 16, bottom: 48 },
            xAxis: { type: 'category', data: RATE3, name: 'Olasılık', nameLocation: 'middle', nameGap: 32 },
            yAxis: { type: 'category', data: RATE3, name: 'Etki' },
            visualMap: { min: 0, max: Math.max(1, ...counts.map((c) => c[2])), show: false },
            series: [{ type: 'heatmap', data: counts, label: { show: true, formatter: (p: { value: number[] }) => (p.value[2] ? String(p.value[2]) : '') } }],
          },
          table: { head: ['Risk', 'Başlık', 'Olasılık', 'Etki', 'Çarpım'], rows: rs.map((r) => [String(r.risk ?? ''), String(r.category ?? ''), Number(r.likelihood), Number(r.impact), Number(r.likelihood) * Number(r.impact)]) },
        }
      },
    },
  },
  {
    id: '18',
    decision: 9,
    title: 'Saha ve kazanma yolu',
    question: 'Hangi müşteriye, hangi yolla, neyle kazanacaksınız? Neyden vazgeçeceksiniz?',
    mandatory: true,
    who: 'Karar sahibi. Ekip varsa birlikte.',
    timebox: '3 ile 5 gün.',
    shortPath: true,
    intro: 'Strateji bir seçimdir. Seçim vazgeçiş içerir. Vazgeçiş yoksa strateji değil dilek listesi vardır.',
    howTo: [
      'En az iki gerçekten farklı yol yazın. Her yol için müşteri, bölge ve kanal yazın.',
      'Her yol için neyle kazanacağınızı yazın. Fiyat, farklılık, hız, güven veya uzmanlık.',
      'Her yol için neyden vazgeçeceğinizi yazın. Hangi kanıt bu yolu destekliyor, yazın.',
      'Puanlamadan önce ölçütlerin ağırlığını yazın. Ağırlıkları kilitleyin. Sonra her yolu puanlayın.',
      'En yüksek yolu seçin. "Rakip nasıl karşılık verir?" diye sorun. Bir karşı hamle ve bir cevap yazın.',
    ],
    sections: [
      {
        title: 'Yollar',
        fields: [
          { key: 'smallInfo', type: 'info', label: 'Küçük iş', tone: 'ipucu', text: 'Küçük ve geri alınabilir işte iki yol yeter. Bugünkü yöntem ile bir alternatif yazın.', when: { profile: { smallReversible: [true] } } },
          { key: 'paths', type: 'repeater', label: 'Olası yollar', addLabel: 'Yol ekle', minRows: 2, maxRows: 4, columns: [
            { key: 'name', type: 'text', label: 'Yolun adı' },
            { key: 'where', type: 'text', label: 'Hangi müşteri, bölge ve kanal?' },
            { key: 'how', type: 'text', label: 'Neyle kazanırız?', placeholder: 'Fiyat, farklılık, hız, güven veya uzmanlık' },
            { key: 'giveUp', type: 'text', label: 'Neyden vazgeçeriz?' },
            { key: 'evidence', type: 'text', label: 'Destekleyen kanıt' },
          ] },
        ],
      },
      {
        title: 'Puanlama',
        description: 'Önce ağırlık verin. Kilitleyin. Sonra her yola 1 ile 5 arası puan verin.',
        fields: [
          { key: 'pathScores', type: 'scoreMatrix', label: 'Yedi ölçütle puanlama', rowsFrom: 'paths', rowLabelKey: 'name', criteria: [
            { key: 'customerEvidence', label: 'Müşteri kanıtı' },
            { key: 'marketAppeal', label: 'Pazar çekiciliği' },
            { key: 'difference', label: 'Fark' },
            { key: 'skillFit', label: 'Beceri uyumu' },
            { key: 'moneyLogic', label: 'Para mantığı' },
            { key: 'risk', label: 'Risk' },
            { key: 'reversibility', label: 'Geri dönülebilirlik' },
          ] },
        ],
      },
      {
        title: 'Seçim',
        fields: [
          { key: 'chosenPath', type: 'text', label: 'Seçilen yol', required: true, maxLength: 160 },
          { key: 'givenUp', type: 'textarea', label: 'Vazgeçilenler', required: true, rows: 3, placeholder: 'Hangi müşteriden, bölgeden, kanaldan veya özellikten vazgeçtiniz?' },
          { key: 'counterMove', type: 'textarea', label: 'Rakip karşı hamlesi ve cevabınız', rows: 3, placeholder: 'Rakip fiyat kırarsa biz hızla ve güvenle kazanırız.' },
        ],
      },
    ],
    output: 'Seçenek tablosu. Seçilen yol. Vazgeçilenler listesi. Rakip karşı hamle notu.',
    outcomeTable: [
      { condition: 'İki yol aynı puanda', result: 'Daha geri dönülebilir olanı seçin.' },
      { condition: 'Seçilen yol vazgeçiş içermiyor', result: 'Bu yol strateji değildir. Bu yol bir dilek listesidir. Yeniden yazın.' },
      { condition: 'Rakip karşı hamlesi yolu çürütüyor', result: 'İkinci yolu seçin veya farkı güçlendirin.' },
    ],
    models: [78, 99, 44, 109],
    completeWhen: ['paths', 'chosenPath', 'givenUp'],
    chart: {
      kind: 'bar',
      title: 'Yol puanları',
      summary: (v) => {
        const ps = rows(v.paths)
        const sm = (v.pathScores ?? {}) as { weights?: Record<string, number>; scores?: Record<string, Record<string, number>> }
        const totals = ps.map((p) => {
          const s = sm.scores?.[String(p._id)] ?? {}
          return { name: String(p.name ?? 'Adsız'), total: Object.entries(s).reduce((a, [k, n]) => a + Number(n) * (sm.weights?.[k] ?? 1), 0) }
        }).filter((t) => t.total > 0)
        if (!totals.length) return ''
        const sorted = [...totals].sort((a, b) => b.total - a.total)
        if (sorted.length > 1 && sorted[0].total === sorted[1].total) return 'İki yol aynı puanda. Daha geri dönülebilir olanı seçin.'
        return `En yüksek puan "${sorted[0].name}" yolunda. Toplam ${sorted[0].total}.`
      },
      build: (v) => {
        const ps = rows(v.paths)
        const sm = (v.pathScores ?? {}) as { weights?: Record<string, number>; scores?: Record<string, Record<string, number>> }
        const totals = ps.map((p) => {
          const s = sm.scores?.[String(p._id)] ?? {}
          return { name: String(p.name ?? 'Adsız'), total: Object.entries(s).reduce((a, [k, n]) => a + Number(n) * (sm.weights?.[k] ?? 1), 0) }
        })
        if (!totals.some((t) => t.total > 0)) return null
        return {
          option: { grid: { left: 140, right: 40, top: 16, bottom: 24 }, xAxis: { type: 'value', name: 'puan' }, yAxis: { type: 'category', data: totals.map((t) => t.name) }, series: [{ type: 'bar', data: totals.map((t) => t.total), label: { show: true, position: 'right' } }] },
          table: { head: ['Yol', 'Toplam puan'], rows: totals.map((t) => [t.name, t.total]) },
        }
      },
    },
  },
  {
    id: '19',
    decision: 9,
    title: 'Hedefler ve 90 günlük yol',
    question: 'Önümüzdeki 90 günde ne başaracaksınız? Kim, ne zaman yapacak?',
    mandatory: true,
    who: 'Karar sahibi.',
    timebox: '1 veya 2 gün.',
    shortPath: false,
    howTo: [
      'Bir hedef yazın. Üç anahtar sonuç yazın. Her sonuç bir sayı olsun.',
      'Sayılar öğrenmeyi ölçsün. "30 ödeyen müşteri" yazın. "1000 takipçi" yazmayın.',
      'Yolu üç kutuya bölün. Şimdi, sonra ve daha sonra. Şimdi kutusu ilk 90 gündür.',
      'Her 90 günlük maddeye sahip ve bitiş tarihi yazın.',
      'Haftalık tek darboğaz sorusunu takvime koyun. "Bu hafta ilerlememi engelleyen tek şey ne?"',
    ],
    sections: [
      {
        title: 'Hedef ve anahtar sonuçlar',
        fields: [
          { key: 'objective', type: 'text', label: 'Hedef', required: true, maxLength: 160, placeholder: 'İlk 10 ödeyen müşteriyi kazanmak.' },
          { key: 'keyResults', type: 'repeater', label: 'Üç anahtar sonuç', addLabel: 'Anahtar sonuç ekle', minRows: 1, maxRows: 3, columns: [
            { key: 'kr', type: 'text', label: 'Anahtar sonuç', placeholder: 'Ödeyen müşteri sayısı' },
            { key: 'target', type: 'text', label: 'Hedef sayı', placeholder: '30' },
          ] },
        ],
      },
      {
        title: 'Şimdi, sonra, daha sonra',
        fields: [
          { key: 'now', type: 'repeater', label: 'Şimdi. İlk 90 gün.', addLabel: 'İş ekle', minRows: 1, columns: [
            { key: 'action', type: 'text', label: 'İş' },
            { key: 'owner', type: 'text', label: 'Sahibi' },
            { key: 'dueDate', type: 'date', label: 'Bitiş tarihi' },
          ] },
          { key: 'next', type: 'repeater', label: 'Sonra. 90 günden sonraki 3 ay.', addLabel: 'İş ekle', columns: [
            { key: 'action', type: 'text', label: 'İş' },
            { key: 'owner', type: 'text', label: 'Sahibi' },
            { key: 'dueDate', type: 'date', label: 'Bitiş tarihi' },
          ] },
          { key: 'later', type: 'repeater', label: 'Daha sonra. 6 aydan sonrası.', addLabel: 'İş ekle', columns: [
            { key: 'action', type: 'text', label: 'İş' },
            { key: 'owner', type: 'text', label: 'Sahibi' },
            { key: 'dueDate', type: 'date', label: 'Bitiş tarihi' },
          ] },
        ],
      },
      {
        title: 'Haftalık soru',
        fields: [
          { key: 'weeklyBottleneck', type: 'toggle', label: 'Haftalık darboğaz sorusu takvimde mi?', help: 'Soru şudur: "Bu hafta ilerlememi engelleyen tek şey ne?"', onLabel: 'Evet, takvimde', offLabel: 'Hayır' },
        ],
      },
    ],
    output: 'Hedef ve 3 anahtar sonuç. Şimdi, sonra, daha sonra tablosu. 90 günlük liste.',
    models: [65, 64, 123],
    completeWhen: ['objective', 'keyResults', 'now'],
    chart: {
      kind: 'bar',
      title: '90 günlük zaman çizelgesi',
      summary: (v) => {
        const items = rows(v.now).filter((r) => r.dueDate)
        if (!items.length) return ''
        const late = items.filter((r) => new Date(String(r.dueDate)).getTime() < Date.now()).length
        return late ? `${late} işin tarihi geçti. Tarihleri gözden geçirin.` : `${items.length} iş tarihli. Hepsi ileride.`
      },
      build: (v) => {
        const items = rows(v.now).filter((r) => r.dueDate && r.action)
        if (!items.length) return null
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const days = items.map((r) => Math.round((new Date(String(r.dueDate)).getTime() - today.getTime()) / 86400000))
        const labels = items.map((r) => String(r.action))
        return {
          option: { grid: { left: 160, right: 40, top: 16, bottom: 32 }, xAxis: { type: 'value', name: 'gün', max: Math.max(90, ...days) }, yAxis: { type: 'category', data: labels }, series: [{ type: 'bar', data: days, label: { show: true, position: 'right' }, markLine: { symbol: 'none', data: [{ xAxis: 90, name: '90 gün' }] } }] },
          table: { head: ['İş', 'Sahibi', 'Bitiş tarihi', 'Kaç gün kaldı?'], rows: items.map((r, i) => [labels[i], String(r.owner ?? ''), formatDate(String(r.dueDate)), days[i]]) },
        }
      },
    },
  },
  {
    id: '20',
    decision: 9,
    title: 'Strateji karar dosyası',
    question: 'Kararınızı iki sayfada anlatabiliyor musunuz?',
    mandatory: true,
    who: 'Kurucu.',
    timebox: '1 gün.',
    shortPath: false,
    intro: 'Karar dosyası, bu plandaki bütün cevapların kısa özetidir. En çok 2 sayfa olur. Dış göz bu dosyayı okur.',
    howTo: [
      'On bir başlığı sırayla doldurun. Her başlığa iki veya üç cümle yazın.',
      'Önceki adımlardaki cevapları kullanın. Yeni bilgi uydurmayın.',
      'Kalite kontrol listesini işaretleyin. Beş soruya "evet" diyebilmelisiniz.',
      'Karşı görüşü yazın. "Bu karar neden yanlış olabilir?" diye sorun.',
    ],
    sections: [
      {
        title: 'On bir başlık',
        fields: [
          { key: 'dossier1', type: 'textarea', label: '1. Profil ve niyet', rows: 2, span: 12 },
          { key: 'dossier2', type: 'textarea', label: '2. Problem ve ilk segment', help: 'Kanıt basamağını da yazın.', rows: 2, span: 12 },
          { key: 'dossier3', type: 'textarea', label: '3. Talep testi sonucu', rows: 2, span: 12 },
          { key: 'dossier4', type: 'textarea', label: '4. Seçilen yol ve vazgeçilenler', rows: 2, span: 12 },
          { key: 'dossier5', type: 'textarea', label: '5. Para mantığı', help: 'Üç durumla yazın.', rows: 2, span: 12 },
          { key: 'dossier6', type: 'textarea', label: '6. Kritik varsayımlar ve test planı', rows: 2, span: 12 },
          { key: 'dossier7', type: 'textarea', label: '7. Kritik riskler ve kurallar', rows: 2, span: 12 },
          { key: 'dossier8', type: 'textarea', label: '8. Durdurma kuralları', rows: 2, span: 12 },
          { key: 'dossier9', type: 'textarea', label: '9. Hedef ve 90 günlük liste', rows: 2, span: 12 },
          { key: 'dossier10', type: 'textarea', label: '10. Açık sorular', rows: 2, span: 12 },
          { key: 'dossier11', type: 'textarea', label: '11. İlk teslim ve geri dönüş', help: 'İlk teslimi kim, ne zaman, hangi bütçeyle yapacak? Hangi koşulda kim önceki düzene dönecek?', rows: 3, span: 12 },
        ],
      },
      {
        title: 'Kalite kontrolü',
        description: 'Her soruya "evet" diyebiliyorsanız işaretleyin.',
        fields: [
          { key: 'qualityCheck', type: 'checklist', label: 'Beş soru', items: [
            { value: 'q1', label: 'Her önemli iddianın kaynağı ve tarihi var.' },
            { value: 'q2', label: 'Kanıt ile varsayım ayrıldı.' },
            { value: 'q3', label: 'Müşteri sözü ile müşteri davranışı ayrıldı.' },
            { value: 'q4', label: 'Karşı görüş yazıldı.' },
            { value: 'q5', label: 'Vazgeçilenler açık.' },
          ] },
          { key: 'counterView', type: 'textarea', label: 'Karşı görüş', required: true, rows: 3, placeholder: 'Bu karar neden yanlış olabilir? Hangi kanıt bizi durdurur?' },
        ],
      },
    ],
    output: '2 sayfalık karar dosyası.',
    outcomeTable: [
      { condition: 'Dosya eksik ama kurucu geçmek istiyor', result: 'Geçmeyin. Eksiği dış göze gösterin.' },
      { condition: 'Beş sorudan birine "hayır" diyorsunuz', result: 'O başlığı düzeltin. Sonra Kapı 5\'e gidin.' },
    ],
    models: [20],
    completeWhen: ['dossier1', 'dossier2', 'dossier3', 'dossier4', 'dossier5', 'dossier6', 'dossier7', 'dossier8', 'dossier9', 'dossier11', 'qualityCheck', 'counterView'],
  },
]
