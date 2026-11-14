import { breakEvenCalc } from '@/engine/calc'
import { ADVANTAGE_LEVELS, STRENGTH_LABEL, strengthsOf } from '@/engine/strengths'
import { CROSS_QUESTIONS, ORIGIN_OPTIONS } from '@/engine/situation'
import { conditionsCalc, DEPENDENCY_OPTIONS, freeBudget, RELATION_OPTIONS, VEHICLE_OPTIONS } from '@/engine/crux'
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
          {
            key: 'strengthsHint',
            type: 'calc',
            label: 'Adım 12\'de sınadığınız güçler',
            emptyText: 'Adım 12\'de güç yazınca liste burada görünür. Yazılım bu kutuyu sizin yerinize doldurmaz.',
            compute: (_v, plan) => {
              const tested = strengthsOf(plan).filter((s) => s.level !== 'bos')
              if (tested.length === 0) return null
              const advantages = tested.filter((s) => ADVANTAGE_LEVELS.includes(s.level))
              return {
                value: `${advantages.length} avantaj`,
                lines: tested.map((s) => `${s.name}: ${STRENGTH_LABEL[s.level]}.`),
                warn: advantages.length === 0 ? 'Süzgeçten geçen avantaj yok. "Haksız avantaj" kutusunu boş bırakabilirsiniz.' : undefined,
              }
            },
          },
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
          { key: 'breakEvenCalc', type: 'calc', label: 'Başabaş hesabı', compute: (values, plan) => breakEvenCalc(values, plan) },
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
        title: 'Serbest bütçe',
        description: 'Toplam bütçe, harcayabileceğiniz parayı tek başına göstermez. Harcananı ve ödenmemiş taahhüdü düşün.',
        fields: [
          { key: 'commitmentsKnown', type: 'segmented', label: 'Ödenmemiş bağlayıcı taahhüdünüz var mı?', help: 'Bağlayıcı taahhüt, vazgeçseniz de ödeyeceğiniz paradır. Örneğin imzalı kira sözleşmesi.', options: [
            { value: 'var', label: 'Var' },
            { value: 'yok', label: 'Yok' },
            { value: 'bilinmiyor', label: 'Bilmiyorum' },
          ] },
          { key: 'spentKurus', type: 'money', label: 'Bugüne kadar harcanan tutar', help: 'Koşullu izinle harcadığınız parayı buraya yazmayın. O tutar ayrıca düşülür.', span: 12 },
          { key: 'commitments', type: 'repeater', label: 'Ödenmemiş taahhütler', addLabel: 'Taahhüt ekle', maxRows: 8, when: { field: { key: 'commitmentsKnown', equals: 'var' } }, columns: [
            { key: 'what', type: 'text', label: 'Ne için?', placeholder: 'Örneğin 24 aylık kira' },
            { key: 'amountKurus', type: 'money', label: 'Ödenmemiş tutar' },
            { key: 'dueDate', type: 'date', label: 'Vade' },
            { key: 'basis', type: 'text', label: 'Dayanak', placeholder: 'Örneğin imzalı sözleşme' },
          ] },
          {
            key: 'freeBudgetCalc',
            type: 'calc',
            label: 'Serbest bütçe',
            emptyText: 'Soruyu cevaplayınca hesap burada görünür. Harcama sınırı Adım 02\'de yazılır.',
            compute: (v, plan) => {
              const r = freeBudget(plan, v)
              if (r.state === 'yok') return null
              if (r.state === 'bilinmiyor') return { value: 'Bilinmiyor', lines: ['Taahhüt bilinmiyor. Bu yüzden kesin tutar yazılmaz.', 'Önce sözleşmelerinizi kontrol edin.'] }
              return {
                value: formatMoney(r.freeKurus),
                lines: [
                  `Harcama sınırı ${formatMoney(r.budgetKurus)}.`,
                  `Harcanan tutar ${formatMoney(r.spentKurus)}.`,
                  ...(r.permitsKurus > 0 ? [`Koşullu izinlere bağlı tutar ${formatMoney(r.permitsKurus)}.`] : []),
                  `Ödenmemiş taahhüt ${formatMoney(r.unpaidKurus)}.`,
                ],
                warn: r.freeKurus < 0 ? 'Serbest bütçe eksiye düştü. Yeni harcama yapmadan önce sınırı gözden geçirin.' : undefined,
              }
            },
          },
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
    models: [120, 128, 118, 95],
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
        title: 'Tek kaynağa bağımlılık',
        description: 'İşiniz tek bir kaynağa bağlıysa o kaynak gidince iş durur. Size uyanları işaretleyin. Bu bölüm isteğe bağlıdır.',
        fields: [
          { key: 'dependencies', type: 'chips', label: 'İşiniz hangisine bağlı?', options: DEPENDENCY_OPTIONS },
          { key: 'dependencyNote', type: 'textarea', label: 'Her bağımlılık için bir cümle yazın', help: 'İş neye bağlı? Yedeği ne?', rows: 3, maxLength: 500, placeholder: 'Örneğin: Kahve çekirdeğini tek toptancıdan alıyoruz. İkinci toptancıdan fiyat aldık.', when: { field: { key: 'dependencies', truthy: true } } },
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
      { condition: 'Geri dönülemez bir karar strateji çalışmasından önce gerekiyor', result: 'Kararı küçültün. Kısa kira, küçük stok ve deneme ortaklığı seçin.' },
    ],
    models: [41, 33],
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
    decision: 5,
    title: 'Yol adayları',
    question: 'Hangi yollar masada? Her yol neyle kazanır, neyden vazgeçer?',
    mandatory: true,
    who: 'Kurucu ve ekip. Bu adımda seçim yapmayın. Stratej yolu önerir. Karar sahibi seçer.',
    timebox: '2 ile 4 gün.',
    shortPath: true,
    intro: 'Bu adım strateji seçmez. Strateji için adayları hazırlar. Stratej bu adayları yan yana görür ve birini önerir. Seçimi karar sahibi yapar. Adım 11\'de bir çözümü denemek için seçtiniz. Bu adımda işin bütün yolunu yazarsınız: hangi müşteri, hangi kanal, neyle kazanma.',
    howTo: [
      'Önce durum özetini okuyun. Özet güçlü yönleri, zayıf yönleri, fırsatları ve tehditleri gösterir.',
      'Dört çapraz soruyu cevaplayın. Örneğin: "Hangi güçlü yönle hangi fırsatı yakalarız?"',
      'İlk satır hazırdır: "Bugünkü durumu sürdürmek". Bu satırı da doldurun.',
      'En az iki gerçekten farklı yol daha yazın. Ağır yatırımda en az üç yol yazın.',
      'Her yol için müşteriyi, bölgeyi ve kanalı yazın. Neyle kazanacağınızı yazın.',
      'Her yol için neyden vazgeçeceğinizi yazın. Bedelini ve geri alınıp alınamayacağını yazın.',
      'Puanlamadan önce ölçütlerin ağırlığını yazın. Ağırlıkları kilitleyin. Sonra her yolu puanlayın.',
      'İsterseniz asıl engeli ve başarı koşullarını yazın. Kanıtı defterden seçin.',
      'Yol seçmeyin. Strateji çalışmasında verilecek açık kararları listeye yazın.',
    ],
    sections: [
      {
        title: 'Çapraz sorular',
        description: 'Üstteki durum özetine bakın. Dört soruyu cevaplayın. Cevaplar yol adayı bulmanıza yardım eder. Sorular isteğe bağlıdır.',
        fields: CROSS_QUESTIONS.map((q) => ({ key: q.key, type: 'textarea' as const, label: q.label, placeholder: q.placeholder, rows: 2, maxLength: 400, span: 12 as const })),
      },
      {
        title: 'Yollar',
        fields: [
          { key: 'smallInfo', type: 'info', label: 'Küçük iş', tone: 'ipucu', text: 'Küçük ve geri alınabilir işte bugünkü durum ve iki yol yeter. Ağır yatırımda bugünkü durum ve üç yol gerekir.', when: { profile: { smallReversible: [true] } } },
          { key: 'paths', type: 'repeater', label: 'Yol adayları', addLabel: 'Yol ekle', minRows: 3, maxRows: 5, fixedFirstRow: { name: 'Bugünkü durumu sürdürmek' }, columns: [
            { key: 'name', type: 'text', label: 'Yolun adı' },
            { key: 'where', type: 'text', label: 'Hangi müşteri, bölge ve kanal?' },
            { key: 'how', type: 'text', label: 'Neyle kazanırız?', placeholder: 'Fiyat, farklılık, hız, güven veya uzmanlık' },
            { key: 'revenue', type: 'text', label: 'Para nasıl kazanılır?', placeholder: 'Tek satış, aylık kart ya da komisyon' },
            { key: 'vehicle', type: 'select', label: 'Nasıl kurulur?', options: VEHICLE_OPTIONS },
            { key: 'giveUp', type: 'text', label: 'Neyden vazgeçeriz?' },
            { key: 'evidence', type: 'text', label: 'Destekleyen kanıt' },
            { key: 'evidenceIds', type: 'evidenceLink', label: 'Kanıt defterinden seç', help: 'Kanıt bağlarsanız rapor bu yolu "Kaynaklı" diye gösterir. Bağlamazsanız "Varsayım" diye gösterir.' },
            { key: 'origin', type: 'select', label: 'Hangi sorudan çıktı?', help: 'Yol hangi çapraz sorunun cevabından çıktı? Boş kalabilir.', options: ORIGIN_OPTIONS },
            { key: 'cost', type: 'text', label: 'Bedeli ve süresi', placeholder: '60.000 TL ve 3 hafta' },
            { key: 'reversible', type: 'select', label: 'Geri alınabilir mi?', options: [
              { value: 'ciftYonlu', label: 'Evet, geri alınır' },
              { value: 'tekYonlu', label: 'Hayır, geri alınmaz' },
            ] },
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
        title: 'Rakip tepkisi',
        fields: [
          { key: 'counterMove', type: 'textarea', label: 'Rakip karşı hamlesi ve cevabınız', rows: 3, placeholder: 'Rakip fiyat kırarsa biz hızla ve güvenle kazanırız.' },
        ],
      },
      {
        title: 'Bu yol neden çalışabilir?',
        description: 'Bir yolun iki işi birbirini destekleyebilir ya da birbiriyle çelişebilir. Bulduğunuz bağları yazın. Bu bölüm isteğe bağlıdır.',
        fields: [
          { key: 'similarTip', type: 'info', label: 'Yollar birbirine benziyorsa', tone: 'ipucu', text: 'Dört soru sorun. Hangi işi kaldırabiliriz? Hangi işi azaltabiliriz? Hangi işi güçlendirebiliriz? Hangi yeni işi ekleyebiliriz? Çıkan yolu üstteki tabloya yazın.' },
          { key: 'pathLinks', type: 'repeater', label: 'Yol bağları', addLabel: 'Bağ ekle', maxRows: 10, columns: [
            { key: 'path', type: 'text', label: 'Hangi yol?', placeholder: 'Yolun adı' },
            { key: 'a', type: 'text', label: 'Birinci iş ya da söz', placeholder: 'Örneğin hızlı teslim sözü' },
            { key: 'b', type: 'text', label: 'İkinci iş ya da söz', placeholder: 'Örneğin stoku azaltmak' },
            { key: 'relation', type: 'select', label: 'İkisi nasıl ilişkili?', options: RELATION_OPTIONS },
            { key: 'reason', type: 'text', label: 'Neden?', placeholder: 'Örneğin hızlı teslim yedek stok ister' },
          ] },
        ],
      },
      {
        title: 'Asıl engel',
        description: 'Asıl engel, önce çözülmesi gereken en önemli güçlüktür. Çözülebilir bir güçlük yazın. Bu bölüm isteğe bağlıdır.',
        fields: [
          { key: 'crux', type: 'textarea', label: 'Bu işin önündeki asıl engel nedir?', rows: 2, maxLength: 300, placeholder: 'Örneğin: Yazılı ilgi, gideri karşılayan günlük satışa dönüşecek mi?' },
          { key: 'cruxWhy', type: 'textarea', label: 'Bu engel neden önce incelenmeli?', rows: 2, maxLength: 300 },
          { key: 'cruxPaths', type: 'text', label: 'Bu engel hangi yolu etkiler?', placeholder: 'Bütün yollar ya da yolun adı', maxLength: 160, span: 12 },
          { key: 'cruxAlt', type: 'textarea', label: 'Aynı durumu başka nasıl açıklarsınız?', help: 'İkinci bir açıklama yazın. Tek açıklama sizi yanıltabilir.', rows: 2, maxLength: 300 },
          { key: 'cruxSplit', type: 'text', label: 'İki açıklamayı hangi bulgu ayırır?', placeholder: 'Örneğin iki fiyatla bir sabah satışı', maxLength: 200, span: 12 },
          { key: 'cruxEvidence', type: 'evidenceLink', label: 'Destekleyen kanıt', help: 'Kanıtı defterden seçin. Yeniden yazmayın.' },
          { key: 'cruxCounter', type: 'evidenceLink', label: 'Karşı bulgu' },
        ],
      },
      {
        title: 'Başarı neye bağlı?',
        description: 'İşin yürümesi için gerçekleşmesi gereken koşulları yazın. Her koşul bir iddiadır. Kanıt bağlayınca durumu değişir. Bu bölüm isteğe bağlıdır.',
        fields: [
          { key: 'conditionHelp', type: 'info', label: 'Koşul, ölçü, sınır ve iş ayrı şeylerdir', tone: 'bilgi', text: 'Koşul, işin yürümesi için gerçekleşmesi gereken durumdur. Örneğin "sabah talebi gideri karşılar". Ölçü, koşulu neyle saydığınızdır. Örneğin "günlük ücretli sipariş". Sınır, yeterli saydığınız sayıdır. Örneğin "günde 40 sipariş". İş ise sizin yaptığınız şeydir. Örneğin "durağa tabela koymak". Bu tabloya iş değil, koşul yazın.' },
          { key: 'conditionSources', type: 'info', label: 'Koşulu dört yerde arayın', tone: 'ipucu', text: 'Birincisi sektörünüzdür. Bu işte herkes için şart olan nedir? İkincisi kendi konumunuzdur. Size özel şart nedir? Üçüncüsü dış koşullardır. Örneğin kira ya da izin. Dördüncüsü bu döneme özgü sorundur. Örneğin açılış gecikmesi.' },
          { key: 'conditionMarket', type: 'info', label: 'Pazar yeri için üç aday koşul', tone: 'ornek', text: 'Birincisi nitelikli taleptir. Alıcı gerçekten almak istiyor mu? İkincisi cevap veren satıcıdır. Kayıtlı satıcı talebe cevap veriyor mu? Üçüncüsü uygun eşleşmedir. Alıcı zamanında uygun teklif alıyor mu? Bunlar yalnız öneridir. Size uyanı yazın.', when: { profile: { customer: ['pazarYeri'] } } },
          { key: 'successConditions', type: 'repeater', label: 'Başarı koşulları', addLabel: 'Koşul ekle', maxRows: 8, columns: [
            { key: 'condition', type: 'text', label: 'Koşul', placeholder: 'Örneğin sabah talebi günlük gideri karşılar' },
            { key: 'paths', type: 'text', label: 'Hangi yolu etkiler?', placeholder: 'Bütün yollar ya da yolun adı' },
            { key: 'measure', type: 'text', label: 'Ölçü ve dönem', placeholder: 'Örneğin günlük ücretli satış' },
            { key: 'baseline', type: 'text', label: 'Başlangıç değeri', help: 'Ölçmediyseniz boş bırakın. Ölçtünüz ve sıfır çıktıysa 0 yazın.', placeholder: 'Örneğin 20 talebin 8\'i' },
            { key: 'threshold', type: 'text', label: 'Sınır', placeholder: 'Örneğin günde 40 satış' },
            { key: 'thresholdWhen', type: 'select', label: 'Sınırı ne zaman seçtiniz?', options: [
              { value: 'once', label: 'Denemeden önce' },
              { value: 'sonra', label: 'Denemeden sonra' },
            ] },
            { key: 'owner', type: 'text', label: 'Sorumlu' },
            { key: 'support', type: 'evidenceLink', label: 'Destekleyen kanıt' },
            { key: 'counter', type: 'evidenceLink', label: 'Karşı bulgu' },
            { key: 'comment', type: 'text', label: 'Karar sahibinin yorumu' },
          ] },
          { key: 'conditionsResult', type: 'calc', label: 'Koşulların durumu', emptyText: 'Bir koşul yazınca durumu burada görünür.', compute: (v, plan) => conditionsCalc(v, plan) },
        ],
      },
      {
        title: 'Açık kararlar',
        description: 'Strateji çalışmasında verilecek kararları yazın. Kararı bu adımda vermeyin. Seçenekleri ve dayanağı yazın.',
        fields: [
          { key: 'openDecisions', type: 'repeater', label: 'Açık karar defteri', addLabel: 'Karar ekle', columns: [
            { key: 'question', type: 'text', label: 'Karar sorusu', placeholder: 'Hangi fiyat modelini deneyeceğiz?' },
            { key: 'alternatives', type: 'text', label: 'Seçenekler', placeholder: 'Aylık kart, tek satış, ön sipariş' },
            { key: 'basis', type: 'text', label: 'Eldeki dayanak', placeholder: '7 kişi aylık karta ön ödeme yaptı.' },
            { key: 'owner', type: 'text', label: 'Karar sahibi' },
            { key: 'dueDate', type: 'date', label: 'Karar tarihi' },
            { key: 'reversalCost', type: 'text', label: 'Yanlış seçimden dönmenin bedeli', placeholder: 'Bir aylık gelir kaybı' },
            { key: 'door', type: 'select', label: 'Geri alınabilir mi?', options: [
              { value: 'ciftYonlu', label: 'Evet, geri alınır' },
              { value: 'tekYonlu', label: 'Hayır, geri alınmaz' },
            ] },
          ] },
        ],
      },
    ],
    output: 'Yol adayları tablosu. Puanlar. Rakip karşı hamle notu. Açık karar defteri.',
    outcomeTable: [
      { condition: 'Yalnız bir yol yazılabildi', result: 'Bu bir seçim değildir. Adım 11\'e dönün ve ikinci yolu arayın.' },
      { condition: 'Hiçbir yol vazgeçiş içermiyor', result: 'Yollar gerçekten farklı değildir. Müşteriyi, kanalı ya da kazanma nedenini değiştirin.' },
      { condition: 'Bir yol geri alınmaz ve kanıtı zayıf', result: 'Bu yolu açık karar defterine yazın. Önce küçük bir deneme tarif edin.' },
    ],
    models: [2, 109, 78, 99, 44, 10, 68],
    completeWhen: ['paths'],
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
    title: 'Seçim, hedefler ve 90 günlük yol',
    question: 'Hangi yolu seçiyorsunuz? Önümüzdeki 90 günde ne başaracaksınız?',
    mandatory: true,
    who: 'Stratej ve karar sahibi.',
    timebox: '2 veya 3 gün.',
    shortPath: false,
    intro: 'Strateji bir seçimdir. Seçim vazgeçiş içerir. Vazgeçiş yoksa strateji değil dilek listesi vardır.',
    howTo: [
      'Devir raporundaki yol adaylarını yan yana okuyun. Gerekirse yeni bir yol yazın.',
      'Stratej bir yol önerir. Karar sahibi yolu seçer. Gerekçeyi ve dayandığı kanıtı yazın.',
      'Neyden vazgeçtiğinizi yazın. Hangi müşteri, bölge, kanal ya da özellik.',
      'Bir hedef yazın. Üç anahtar sonuç yazın. Her sonuç bir sayı olsun.',
      'Yolu üç kutuya bölün. Şimdi, sonra ve daha sonra. Şimdi kutusu ilk 90 gündür.',
      'Her 90 günlük maddeye sahip ve bitiş tarihi yazın.',
    ],
    sections: [
      {
        title: 'Seçim',
        fields: [
          { key: 'chosenPath', type: 'text', label: 'Seçilen yol', required: true, maxLength: 160, help: 'Yol adaylarından birinin adını yazın ya da yeni bir yol yazın.' },
          { key: 'choiceReason', type: 'textarea', label: 'Seçimin gerekçesi', required: true, rows: 3, placeholder: 'Bu yolu hangi kanıta dayanarak seçtiniz? Öteki yollar neden elendi?' },
          { key: 'givenUp', type: 'textarea', label: 'Vazgeçilenler', required: true, rows: 3, placeholder: 'Hangi müşteriden, bölgeden, kanaldan veya özellikten vazgeçtiniz?' },
        ],
      },
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
    output: 'Seçilen yol ve gerekçesi. Vazgeçilenler. Hedef ve 3 anahtar sonuç. 90 günlük liste.',
    models: [65, 64, 123],
    completeWhen: ['chosenPath', 'choiceReason', 'givenUp', 'objective', 'keyResults', 'now'],
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
          { key: 'dossier4', type: 'textarea', label: '4. Seçilen yol ve vazgeçilenler', help: 'Adım 19\'daki seçimi ve gerekçesini yazın.', rows: 2, span: 12 },
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
      { condition: 'Beş sorudan birine "hayır" diyorsunuz', result: 'O başlığı düzeltin. Sonra strateji özetine dönün.' },
    ],
    models: [20],
    completeWhen: ['dossier1', 'dossier2', 'dossier3', 'dossier4', 'dossier5', 'dossier6', 'dossier7', 'dossier8', 'dossier9', 'dossier11', 'qualityCheck', 'counterView'],
  },
]
