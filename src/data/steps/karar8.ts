import type { StepDef } from '../schema'

const RATE5 = ['Çok zayıf', 'Zayıf', 'Orta', 'İyi', 'Çok iyi']

function num(v: unknown): number {
  const n = Number(v ?? 0)
  return Number.isNaN(n) ? 0 : n
}

export const KARAR8: StepDef[] = [
  {
    id: '33',
    decision: 8,
    title: 'Büyüme koşulu',
    question: 'Büyütmek, sürdürmek, devretmek veya kapatmak mı?',
    mandatory: true,
    who: 'Karar sahibi.',
    timebox: '1 ile 2 hafta karar için. Büyüme denemesi 3 ay.',
    shortPath: true,
    intro: 'Mevcut ölçekte sürdürmek geçerli bir sonuçtur. Tek şubede kalmak başarısızlık değildir. Büyüme kararı küçük bir denemeyle sınanır.',
    howTo: [
      'Dört seçeneği aynı ölçütle puanlayın. Seçenekler büyüt, sürdür, devret ve kapat.',
      'Büyüme seçeneğinde dört yolu ayırın. Her yol için kaynağı ayrı yazın.',
      'Önce bir yeni yerde veya bir ekipte deneyin. İlk yerdeki sonuç yeni yerde de görülürse sıradaki yatırımı açın.',
      'Kalite, erişim veya kasa kötüleşirse genişlemeyi durdurun. Son çalışan düzene dönün.',
      'Dönüş yolunu denemeden önce yazın. İşi devralacak kişiyi şimdiden seçin.',
    ],
    sections: [
      {
        title: 'Dört seçenek',
        description: 'Her seçeneğe 1 ile 5 arası puan verin. Aynı ölçütü kullanın. Örneğin kâr, kurucu isteği, kaynak ve risk.',
        fields: [
          { key: 'scoreBuyut', type: 'rate', label: 'Büyüt', labels: RATE5, span: 12 },
          { key: 'scoreSurdur', type: 'rate', label: 'Sürdür. Mevcut ölçekte kal.', labels: RATE5, span: 12 },
          { key: 'scoreDevret', type: 'rate', label: 'Devret', labels: RATE5, span: 12 },
          { key: 'scoreKapat', type: 'rate', label: 'Kapat', labels: RATE5, span: 12 },
          { key: 'direction', type: 'segmented', label: 'Seçilen yön', required: true, options: [
            { value: 'buyut', label: 'Büyüt', help: 'Önce 3 aylık sınırlı deneme yapılır.' },
            { value: 'surdur', label: 'Sürdür', help: 'Mevcut ölçekte devam edin. Yeniden bakılacak olayı yazın.' },
            { value: 'devret', label: 'Devret', help: 'Adım 34\'ü yapın.' },
            { value: 'kapat', label: 'Kapat', help: 'Adım 34\'ü yapın.' },
          ] },
          { key: 'directionReason', type: 'textarea', label: 'Gerekçe', help: 'Kurucu büyütmek istemiyorsa bunu açıkça yazın.', rows: 2 },
        ],
      },
      {
        title: 'Büyüme yolu',
        when: { field: { key: 'direction', equals: 'buyut' } },
        fields: [
          { key: 'growthPath', type: 'chips', label: 'Hangi yolla büyüyeceksiniz?', options: [
            { value: 'ayniYer', label: 'Aynı yerde daha çok müşteri' },
            { value: 'yeniBolge', label: 'Yeni bölge' },
            { value: 'yeniUrun', label: 'Yeni ürün' },
            { value: 'yeniOrtak', label: 'Yeni ortak' },
          ] },
          { key: 'growthResources', type: 'textarea', label: 'Her yol için gereken kaynak', help: 'Para, kişi ve süre. Yeni bölge, yeni ürün ve ortak için kaynakları ayrı yazın.', rows: 3 },
          { key: 'newRegionNote', type: 'info', label: 'Yeni bölge', tone: 'ipucu', text: 'İlk yerdeki müşteri kazanma gideri yeni bölgede artabilir. Yeni bölge için ayrı birim ekonomisi yapın. Adım 29.' },
          { key: 'teamNote', type: 'info', label: 'Ekip', tone: 'bilgi', text: 'Yeni ekip kurulurken ilk haftalar verim düşer. Bu düşüşü denemenin süresine ekleyin.', when: { profile: { team: ['ekip'] } } },
        ],
      },
      {
        title: 'Sınırlı büyüme denemesi',
        when: { field: { key: 'direction', equals: 'buyut' } },
        description: 'Önce bir yeni yerde veya bir ekipte deneyin. Her yeni yerde kabulü ve teslimi yeniden ölçün.',
        fields: [
          { key: 'trialPlace', type: 'text', label: 'Deneme yeri veya ekibi', maxLength: 120 },
          { key: 'trialResult', type: 'segmented', label: 'Deneme ilk yerle aynı sonucu verdi mi?', options: [
            { value: 'ayni', label: 'Aynı sonuç', help: 'Sıradaki yatırımı açın.' },
            { value: 'farkli', label: 'Farklı sonuç', help: 'Genişlemeyi bekletin. Hedef grubu, kabulü ve teslim yükünü karşılaştırın.' },
            { value: 'bilinmiyor', label: 'Henüz bilinmiyor', help: 'Deneme sürüyor.' },
          ] },
          { key: 'cashHolds', type: 'toggle', label: 'Deneme sırasında kasa dayanıyor mu?', onLabel: 'Evet, dayanıyor', offLabel: 'Hayır' },
          { key: 'cashNote', type: 'info', label: 'Durun', tone: 'uyari', text: 'Kasa dayanmıyor. Genişlemeyi durdurun. Son çalışan düzene dönün.', when: { field: { key: 'cashHolds', truthy: false } } },
        ],
      },
      {
        title: 'Geri dönüş yolu',
        fields: [
          { key: 'rollback', type: 'textarea', label: 'Aksama olursa eski düzene nasıl dönersiniz?', required: true, rows: 3, placeholder: 'Yeni şubeyi kapatırız. Kirayı 3 ayda bitiririz. Çalışanı ilk şubeye alırız.' },
          { key: 'successor', type: 'text', label: 'İşi devralacak kişi', required: true, maxLength: 80, help: 'Kurucu çekilirse işi kim yürütür?' },
          { key: 'reviewEvent', type: 'text', label: 'Karara yeniden bakılacak olay', maxLength: 160, placeholder: 'Aylık kâr 3 ay üst üste düşerse.' },
        ],
      },
    ],
    output: 'Dört seçenekli karar tablosu. Büyüme denemesi planı. Geri dönüş yolu.',
    outcomeTable: [
      { condition: 'Yeni yer ilk yerle aynı sonucu verdi', result: 'Sıradaki yatırımı açın. Her yeni yerde kabulü ve teslimi yeniden ölçün.' },
      { condition: 'Yeni yer farklı sonuç verdi', result: 'Genişlemeyi bekletin. Hedef grubu, kabulü ve teslim yükünü karşılaştırın. Gerekirse Karar 2\'ye dönün.' },
      { condition: 'Müşteri kazanma gideri yeni yerde arttı', result: 'Yeni bölge için ayrı birim ekonomisi yapın. Adım 29.' },
      { condition: 'Kurucu büyütmek istemiyor', result: 'Sürdür seçeneği geçerlidir. Karar günlüğüne yazın.' },
    ],
    models: [81, 100, 79, 113, 119],
    completeWhen: ['direction', 'rollback', 'successor'],
    chart: {
      kind: 'bar',
      title: 'Dört seçeneğin puanı',
      summary: (v) => {
        const scores = [num(v.scoreBuyut), num(v.scoreSurdur), num(v.scoreDevret), num(v.scoreKapat)]
        if (!scores.some((s) => s > 0)) return ''
        const labels = ['Büyüt', 'Sürdür', 'Devret', 'Kapat']
        const best = Math.max(...scores)
        const tops = labels.filter((_, i) => scores[i] === best)
        return tops.length > 1 ? `${tops.join(' ve ')} aynı puanda. Daha geri dönülebilir olanı seçin.` : `En yüksek puan "${tops[0]}" seçeneğinde.`
      },
      build: (v) => {
        const labels = ['Büyüt', 'Sürdür', 'Devret', 'Kapat']
        const scores = [num(v.scoreBuyut), num(v.scoreSurdur), num(v.scoreDevret), num(v.scoreKapat)]
        if (!scores.some((s) => s > 0)) return null
        return {
          option: { grid: { left: 90, right: 40, top: 16, bottom: 24 }, xAxis: { type: 'value', max: 5, name: 'puan' }, yAxis: { type: 'category', data: labels }, series: [{ type: 'bar', data: scores, label: { show: true, position: 'right' } }] },
          table: { head: ['Seçenek', 'Puan'], rows: labels.map((l, i) => [l, scores[i]]) },
        }
      },
    },
  },
  {
    id: '34',
    decision: 8,
    title: 'Devir ve kapanış',
    question: 'Açık sözler kapandı mı? Devralan kişi yazılı kabul etti mi?',
    mandatory: { field: { step: '33', key: 'direction', in: ['devret', 'kapat'] } },
    whenNote: 'Devret veya kapat kararı verilince yapılır. Büyüt veya sürdür kararında atlanır.',
    who: 'Karar sahibi. Devralan kişiyle birlikte.',
    timebox: '2 ile 4 hafta.',
    shortPath: false,
    howTo: [
      'Devirde devralan kişi üç şeyi yazılı kabul etsin. Açık siparişler, ödemeler ve destek görevi.',
      'Kapanışta etkilenen kişilere haber verin. Müşteri, tedarikçi, çalışan ve ortak.',
      'Açık taahhütleri sonuçlandırın. Alınan depozitoları iade edin.',
      'Bakım, veri ve kayıt yükümlülüklerini izleyin. Kişisel verileri yasaya göre silin veya saklayın.',
      'Öğrenimleri yazın. Hangi varsayım yanlış çıktı? Hangi karar geç verildi?',
    ],
    sections: [
      {
        title: 'Açık sözler',
        description: 'Taahhüt, verilmiş sözdür. Her açık sözü bir satıra yazın.',
        fields: [
          { key: 'openCommitments', type: 'repeater', label: 'Açık taahhütler', addLabel: 'Taahhüt ekle', minRows: 1, columns: [
            { key: 'item', type: 'text', label: 'Söz', placeholder: 'Açık sipariş, ödeme, depozito, destek' },
            { key: 'owner', type: 'text', label: 'Kim kapatır?' },
            { key: 'dueDate', type: 'date', label: 'Bitiş tarihi' },
          ] },
          { key: 'notified', type: 'checklist', label: 'Haber verilenler', items: [
            { value: 'musteri', label: 'Müşterilere haber verildi.' },
            { value: 'tedarikci', label: 'Tedarikçilere haber verildi.' },
            { value: 'calisan', label: 'Çalışanlara haber verildi.' },
            { value: 'ortak', label: 'Ortaklara haber verildi.' },
            { value: 'veri', label: 'Kişisel veriler yasaya göre silindi veya saklandı.' },
          ] },
        ],
      },
      {
        title: 'Devir',
        when: { field: { step: '33', key: 'direction', equals: 'devret' } },
        fields: [
          { key: 'transferee', type: 'text', label: 'Devralan kişi', maxLength: 80 },
          { key: 'acceptedInWriting', type: 'toggle', label: 'Devralan kişi üç şeyi yazılı kabul etti mi?', help: 'Açık siparişler, ödemeler ve destek görevi.', onLabel: 'Evet, yazılı kabul var', offLabel: 'Hayır' },
          { key: 'acceptNote', type: 'info', label: 'Beklet', tone: 'uyari', text: 'Yazılı kabul yok. Devir tamam sayılmaz. Kapı 8 bekletir.', when: { field: { key: 'acceptedInWriting', truthy: false } } },
        ],
      },
      {
        title: 'Kapanış tutanağı ve öğrenimler',
        fields: [
          { key: 'closureNote', type: 'textarea', label: 'Kapanış tutanağı', required: true, rows: 4, placeholder: 'Ne zaman kapandı? Hangi sözler kapatıldı? Hangi kayıt nerede saklanıyor?' },
          { key: 'lessons', type: 'textarea', label: 'Öğrenim notu', required: true, rows: 4, placeholder: 'Hangi varsayım yanlış çıktı? Hangi karar geç verildi? Bir dahaki sefere ne yaparız?' },
        ],
      },
    ],
    output: 'Devir sözleşmesi veya kapanış listesi. Öğrenim notu.',
    outcomeTable: [
      { condition: 'Devralan kişi yazılı kabul vermedi', result: 'Devir tamam sayılmaz. Kapı 8 bekletir.' },
      { condition: 'Açık taahhüt kaldı', result: 'Kapanış tamam sayılmaz. Taahhüdü sonuçlandırın.' },
      { condition: 'Öğrenim notu yazıldı', result: 'Plan burada biter. Yeni bir işte Karar 1\'e dönün.' },
    ],
    models: [27, 5],
    completeWhen: ['openCommitments', 'closureNote', 'lessons'],
  },
]
