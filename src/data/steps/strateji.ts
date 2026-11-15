/**
 * Strateji oluşturma ve strateji uygulama adımları.
 * Her adım doğrulanmış bir alt aşamayı taşır. Aşama haritası docs/sonraki-ana-asamalar-plani.md dosyasındadır.
 * Strateji oluşturma: 2.1 Teşhis, 2.2 Seçenekler, 2.3 Sınama, 2.4 Seçim ve vazgeçiş (Adım 19), 2.5 Ana hamleler.
 * Strateji uygulama: 3.1 Hedef ve gösterge, 3.2 Ana işler ve sorumlular, 3.3 Kaynak ve bütçe.
 * Yazılım teşhis koymaz, yol seçmez ve hamle önermez. Stratej önerir, karar sahibi seçer.
 */
import type { StepDef } from '../schema'
import { formatDate } from '@/engine/format'
import { CAPABILITY_OPTIONS, goalIssues, moveIssues, optionIssues, OPTION_SOURCE_OPTIONS, resourceCalc, resourceIssues, taskIssues, TEST_RESULT_OPTIONS, testIssues, testsCalc } from '@/engine/strategy'

type Row = Record<string, unknown>

function rows(v: unknown): Row[] {
  return Array.isArray(v) ? (v as Row[]) : []
}

const STRATEGY = 9
const EXECUTION = 6

/** 2.1, 2.2 ve 2.3. Seçimden önce gelir. */
export const STRATEJI_SECIM_ONCESI: StepDef[] = [
  {
    id: 'S21',
    code: '2.1',
    decision: STRATEGY,
    title: 'Teşhis',
    question: 'Önce çözülmesi gereken asıl güçlük nedir?',
    mandatory: true,
    who: 'Stratej yazar. Karar sahibi okur ve onaylar.',
    timebox: 'Yarım gün.',
    shortPath: true,
    intro: 'Teşhis, karmaşık durumu tek bir güçlüğe indirir. Güçlük belli olmadan yollar karşılaştırılamaz.',
    howTo: [
      'Devir raporunu okuyun. Hazırlıkta yazılan asıl engel adayına bakın.',
      'Adayı aynen almak zorunda değilsiniz. Kanıt başka bir güçlüğü gösteriyorsa onu yazın.',
      'Güçlüğü tek cümleyle yazın. Cümle bir hedef ya da bir çözüm olmasın.',
      'Bu güçlüğün neden asıl güçlük olduğunu kanıtla yazın.',
    ],
    sections: [
      {
        title: 'Asıl güçlük',
        fields: [
          { key: 'diagnosis', type: 'text', label: 'Asıl güçlük', required: true, maxLength: 200, help: 'Tek cümle yazın. Bir hedef ya da bir çözüm yazmayın.', placeholder: 'Sabah müşterisi var ama öğleden sonra dükkân boş kalıyor.' },
          { key: 'diagnosisWhy', type: 'textarea', label: 'Bu güçlük neden asıl güçlüktür?', required: true, rows: 3, placeholder: 'Hangi kanıt bu güçlüğü gösteriyor? Bu güçlük çözülürse ne değişir?' },
        ],
      },
      {
        title: 'Kenara bırakılanlar',
        optional: true,
        fields: [
          { key: 'setAside', type: 'textarea', label: 'Hangi güçlükleri şimdilik kenara bıraktınız?', rows: 2, help: 'Her güçlük aynı anda çözülmez. Kenara bıraktığınız güçlüğü yazın.' },
        ],
      },
    ],
    output: 'Tek cümlelik teşhis ve dayanağı.',
    models: [],
    completeWhen: ['diagnosis', 'diagnosisWhy'],
  },
  {
    id: 'S22',
    code: '2.2',
    decision: STRATEGY,
    title: 'Seçenekler',
    question: 'Masada birbirinden gerçekten farklı hangi yollar var?',
    mandatory: true,
    who: 'Stratej yazar. Ekip yeni yol önerebilir.',
    timebox: 'Yarım gün.',
    shortPath: true,
    intro: 'Seçim en az iki seçenek ister. Tek seçenek bir seçim değil, bir onay isteğidir.',
    howTo: [
      'Hazırlıktaki yol adaylarını listeye alın. Öneri kartı adayları sizin için getirir.',
      'Teşhise bakın. Asıl güçlüğü çözen başka bir yol varsa ekleyin.',
      'Her yolu bir cümleyle anlatın.',
      'Her yolun öteki yollardan farkını yazın. İki yol aynı görünüyorsa birini silin.',
    ],
    sections: [
      {
        title: 'Yollar',
        fields: [
          { key: 'options', type: 'repeater', label: 'Masadaki yollar', addLabel: 'Yol ekle', minRows: 2, maxRows: 5, columns: [
            { key: 'name', type: 'text', label: 'Yolun adı' },
            { key: 'what', type: 'text', label: 'Bu yol nedir?', placeholder: 'Bir cümleyle anlatın.' },
            { key: 'source', type: 'select', label: 'Nereden geldi?', options: OPTION_SOURCE_OPTIONS },
            { key: 'difference', type: 'text', label: 'Öteki yollardan farkı ne?' },
          ] },
        ],
      },
    ],
    output: 'Birbirinden farklı en az iki yol.',
    models: [],
    completeWhen: ['options'],
    validate: (values) => optionIssues(values),
  },
  {
    id: 'S23',
    code: '2.3',
    decision: STRATEGY,
    title: 'Sınama',
    question: 'Her yol için neler doğru olmalı? En zayıf koşul tutuyor mu?',
    mandatory: true,
    who: 'Stratej yürütür. Ekip koşulları sınar.',
    timebox: '2 ile 5 gün.',
    shortPath: true,
    intro: 'Sınama, "hangi yol doğru?" diye sormaz. "Bu yolun doğru olması için neler doğru olmalı?" diye sorar.',
    howTo: [
      'Her yol için bir satır açın.',
      'Yolun işlemesi için doğru olması gereken koşulları yazın.',
      'En çok kuşku duyduğunuz koşulu seçin. Bu, en zayıf koşuldur.',
      'En zayıf koşulu ucuz bir yolla sınayın. Sınamayı ve sonucu yazın.',
      'Koşulu tutmayan yolu hemen silmeyin. Sonucu yazın. Kararı seçim adımında verin.',
    ],
    sections: [
      {
        title: 'Koşullar ve sınama',
        fields: [
          { key: 'tests', type: 'repeater', label: 'Her yol için bir satır', addLabel: 'Yol ekle', minRows: 2, maxRows: 5, columns: [
            { key: 'option', type: 'text', label: 'Yol' },
            { key: 'mustBeTrue', type: 'text', label: 'Neler doğru olmalı?' },
            { key: 'weakest', type: 'text', label: 'En zayıf koşul' },
            { key: 'how', type: 'text', label: 'Nasıl sınadınız?' },
            { key: 'result', type: 'select', label: 'Sonuç', options: TEST_RESULT_OPTIONS },
          ] },
          { key: 'testsSummary', type: 'calc', label: 'Sınama özeti', emptyText: 'Bir yol yazınca özet burada görünür.', compute: (v, plan) => testsCalc(v, plan) },
        ],
      },
      {
        title: 'Dört ölçüt',
        optional: true,
        description: 'Her yola dört ölçütle puan verin. Puan kararı vermez. Yalnız zayıf yeri gösterir.',
        fields: [
          { key: 'fit', type: 'scoreMatrix', label: 'Dört ölçütle puanlama', rowsFrom: 'tests', rowLabelKey: 'option', criteria: [
            { key: 'tutarlilik', label: 'Tutarlılık. Seçimler birbiriyle çelişmiyor.' },
            { key: 'uyum', label: 'Uyum. Yol dış çevreye uyuyor.' },
            { key: 'avantaj', label: 'Avantaj. Yol bir üstünlük kuruyor.' },
            { key: 'yapilabilirlik', label: 'Yapılabilirlik. Kaynak ve beceri yetiyor.' },
          ] },
        ],
      },
    ],
    output: 'Her yolun koşulları, en zayıf koşulu ve sınama sonucu.',
    models: [],
    completeWhen: ['tests'],
    validate: (values, plan) => testIssues(values, plan),
  },
]

/** 2.5. Seçimden sonra, strateji belgesinden önce gelir. */
export const STRATEJI_SECIM_SONRASI: StepDef[] = [
  {
    id: 'S25',
    code: '2.5',
    decision: STRATEGY,
    title: 'Ana hamleler ve gerekli yetkinlikler',
    question: 'Seçimi hangi büyük işler hayata geçirir? Hangi beceri gerekir?',
    mandatory: true,
    who: 'Stratej yazar. Karar sahibi onaylar.',
    timebox: '1 gün.',
    shortPath: true,
    intro: 'Ana hamle, seçimi gerçeğe çeviren büyük iştir. Hamle sayısı az olmalıdır. Çok hamle odağı dağıtır.',
    howTo: [
      'Seçimi hayata geçirecek en çok beş büyük iş yazın.',
      'Her hamlenin seçime nasıl hizmet ettiğini yazın. Hizmet etmeyen hamleyi silin.',
      'Her hamle için gereken yetkinliği yazın. Yetkinlik, işi yapmak için gereken beceri ve düzendir.',
      'Yetkinlik bugün var mı? Yoksa onu siz mi kuracaksınız? Yoksa dışarıdan mı alacaksınız?',
    ],
    sections: [
      {
        title: 'Ana hamleler',
        fields: [
          { key: 'moves', type: 'repeater', label: 'En çok beş ana hamle', addLabel: 'Hamle ekle', minRows: 1, maxRows: 5, columns: [
            { key: 'move', type: 'text', label: 'Ana hamle' },
            { key: 'serves', type: 'text', label: 'Seçime nasıl hizmet eder?' },
            { key: 'capability', type: 'text', label: 'Gereken yetkinlik' },
            { key: 'have', type: 'select', label: 'Yetkinlik bugün var mı?', options: CAPABILITY_OPTIONS },
          ] },
        ],
      },
    ],
    output: 'En çok beş ana hamle ve her hamlenin istediği yetkinlik.',
    models: [],
    completeWhen: ['moves'],
    validate: (values) => moveIssues(values),
  },
]

/** 3.1, 3.2 ve 3.3. Strateji belgesi onaylanınca başlar. Karar 6'nın ilk adımlarıdır. */
export const UYGULAMA_PLANI: StepDef[] = [
  {
    id: 'U31',
    code: '3.1',
    decision: EXECUTION,
    title: 'Hedef ve gösterge',
    question: 'Seçim hangi ölçülebilir hedefe çevriliyor? İlerlemeyi neyle ölçeceksiniz?',
    mandatory: true,
    who: 'Ekip yazar. Karar sahibi onaylar.',
    timebox: 'Yarım gün.',
    shortPath: true,
    intro: 'Hedef, seçimin ölçülebilir hâlidir. Gösterge olmadan ilerleme ölçülemez.',
    howTo: [
      'Bir hedef yazın. Hedef seçimden çıksın.',
      'En çok üç gösterge yazın. Her gösterge bir sayı olsun.',
      'Her göstergenin bugünkü değerini yazın. Bu, başlangıç değeridir.',
      'Her gösterge için ulaşmak istediğiniz sayıyı yazın.',
    ],
    sections: [
      {
        title: 'Hedef ve göstergeler',
        fields: [
          { key: 'objective', type: 'text', label: 'Hedef', required: true, maxLength: 160, placeholder: 'İlk 10 ödeyen müşteriyi kazanmak.' },
          { key: 'keyResults', type: 'repeater', label: 'En çok üç gösterge', addLabel: 'Gösterge ekle', minRows: 1, maxRows: 3, columns: [
            { key: 'kr', type: 'text', label: 'Gösterge', placeholder: 'Ödeyen müşteri sayısı' },
            { key: 'baseline', type: 'text', label: 'Başlangıç değeri', placeholder: '0' },
            { key: 'target', type: 'text', label: 'Hedef sayı', placeholder: '30' },
          ] },
        ],
      },
    ],
    output: 'Bir hedef ve en çok üç gösterge. Her göstergenin başlangıç değeri ve hedef sayısı.',
    models: [65],
    completeWhen: ['objective', 'keyResults'],
    validate: (values) => goalIssues(values),
  },
  {
    id: 'U32',
    code: '3.2',
    decision: EXECUTION,
    title: 'Ana işler ve sorumlular',
    question: 'Hangi iş, kimde, ne zaman bitecek?',
    mandatory: true,
    who: 'Ekip yazar. Her işin tek bir sorumlusu olur.',
    timebox: '1 gün.',
    shortPath: true,
    intro: 'Sahibi olmayan iş yapılmaz. Her ana hamleyi işlere bölün. Her işe tek bir sorumlu ve bir tarih yazın.',
    howTo: [
      'Ana hamleleri işlere bölün.',
      'İşleri üç kutuya ayırın. Kutuların adları "Şimdi", "Sonra" ve "Daha sonra"dır.',
      '"Şimdi" kutusu ilk 90 gündür.',
      'Her 90 günlük işe tek bir sorumlu yazın.',
      'Her 90 günlük işe bitiş tarihi yazın.',
    ],
    sections: [
      {
        title: 'Şimdi, sonra, daha sonra',
        fields: [
          { key: 'now', type: 'repeater', label: 'Şimdi. İlk 90 gün.', addLabel: 'İş ekle', minRows: 1, columns: [
            { key: 'action', type: 'text', label: 'İş' },
            { key: 'owner', type: 'text', label: 'Sorumlu' },
            { key: 'dueDate', type: 'date', label: 'Bitiş tarihi' },
          ] },
          { key: 'next', type: 'repeater', label: 'Sonra. 90 günden sonraki 3 ay.', addLabel: 'İş ekle', columns: [
            { key: 'action', type: 'text', label: 'İş' },
            { key: 'owner', type: 'text', label: 'Sorumlu' },
            { key: 'dueDate', type: 'date', label: 'Bitiş tarihi' },
          ] },
          { key: 'later', type: 'repeater', label: 'Daha sonra. 6 aydan sonrası.', addLabel: 'İş ekle', columns: [
            { key: 'action', type: 'text', label: 'İş' },
            { key: 'owner', type: 'text', label: 'Sorumlu' },
            { key: 'dueDate', type: 'date', label: 'Bitiş tarihi' },
          ] },
        ],
      },
      {
        title: 'Haftalık soru',
        optional: true,
        fields: [
          { key: 'weeklyBottleneck', type: 'toggle', label: 'Haftalık darboğaz sorusu takvimde mi?', help: 'Soru şudur: "Bu hafta ilerlememi engelleyen tek şey ne?"', onLabel: 'Evet, takvimde', offLabel: 'Hayır' },
        ],
      },
    ],
    output: '90 günlük iş listesi. Her işin sorumlusu ve bitiş tarihi.',
    models: [64, 123],
    completeWhen: ['now'],
    validate: (values, plan) => taskIssues(values, plan),
    chart: {
      kind: 'bar',
      title: '90 günlük zaman çizelgesi',
      summary: (v) => {
        const items = rows(v.now).filter((r) => r.dueDate)
        if (!items.length) return ''
        /* Özet ve tablo aynı günü sayar. Bitiş günü bugünse iş geç değildir. */
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const late = items.filter((r) => new Date(String(r.dueDate)).getTime() < today.getTime()).length
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
          table: { head: ['İş', 'Sorumlu', 'Bitiş tarihi', 'Kaç gün kaldı?'], rows: items.map((r, i) => [labels[i], String(r.owner ?? ''), formatDate(String(r.dueDate)), days[i]]) },
        }
      },
    },
  },
  {
    id: 'U33',
    code: '3.3',
    decision: EXECUTION,
    title: 'Kaynak ve bütçe',
    question: 'Bu işlere hangi parayı ve hangi insanı ayırıyorsunuz?',
    mandatory: true,
    who: 'Karar sahibi.',
    timebox: 'Yarım gün.',
    shortPath: true,
    intro: 'Para ve insan yerinden oynamadan strateji yalnız bir niyettir. Karar sahibi parayı ve insanı işlere ayırır.',
    howTo: [
      'Her ana iş için bir satır açın.',
      'İşe ayırdığınız parayı yazın.',
      'İşe ayırdığınız kişiyi ve haftalık süreyi yazın.',
      'Hesap kutusuna bakın. Toplam para serbest bütçeyi aşıyorsa işleri azaltın.',
      'Bu işler için başka bir işten para ya da insan çektiyseniz onu yazın.',
    ],
    sections: [
      {
        title: 'Kaynak bağlama',
        fields: [
          { key: 'resources', type: 'repeater', label: 'Her ana iş için bir satır', addLabel: 'İş ekle', minRows: 1, columns: [
            { key: 'item', type: 'text', label: 'İş ya da hamle' },
            { key: 'budgetKurus', type: 'money', label: 'Ayrılan para' },
            { key: 'people', type: 'text', label: 'Kim, haftada kaç saat?' },
          ] },
          { key: 'resourceTotal', type: 'calc', label: 'Bağlanan toplam para', emptyText: 'Bir iş yazınca toplam burada görünür.', compute: (v, plan) => resourceCalc(v, plan) },
          { key: 'resourceOwner', type: 'text', label: 'Kaynağı kim bağladı?', required: true, maxLength: 120, help: 'Parayı ve insanı ayırma yetkisi olan kişinin adını yazın.' },
        ],
      },
      {
        title: 'Kaynak kaydırma',
        optional: true,
        fields: [
          { key: 'resourceShift', type: 'textarea', label: 'Bu işler için hangi işten para ya da insan çektiniz?', rows: 2, help: 'Yeni işe kaynak çoğu zaman eski bir işten gelir. Eski işi yazın.' },
        ],
      },
    ],
    output: 'Her ana işe ayrılan para ve kişi. Kaynağı bağlayan karar sahibi.',
    models: [],
    completeWhen: ['resources', 'resourceOwner'],
    validate: (values, plan) => resourceIssues(values, plan),
  },
]
