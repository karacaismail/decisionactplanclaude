import { emptyPlan, type PlanDoc, type Task } from './types'

/**
 * Örnek plan: Ayakkabı şirketi. Gerçek bir işletmenin yapısına dayanır.
 * Kullanıcı yalnız ekip yapısını ve satış yollarını verdi.
 * Para, ciro, fiyat, müşteri sayısı ve hata oranı verilmedi. Bu alanlar boş kalır.
 * Boş alanlar kontrol ölçütlerinde eksik görünür. Araç eksik bilgiyi uydurmaz.
 */

export const SHOE_DEMO_ID = 'ornek-ayakkabi-sirketi'
export const SHOE_DEMO_NAME = 'Örnek: Ayakkabı şirketi'
/** Araç tarafından eklenen rollerin işareti. Ekranda ve raporda aynen görünür. */
export const SUGGESTED_ROLE = 'Önerilen rol, henüz yok.'

function daysFromNow(n: number): Date {
  const d = new Date()
  d.setHours(10, 0, 0, 0)
  d.setDate(d.getDate() + n)
  return d
}
const iso = (n: number): string => daysFromNow(n).toISOString()

type Row = Record<string, unknown> & { _id: string }
const row = (id: string, data: Record<string, unknown>): Row => ({ _id: id, ...data })

/** Şirkette bugün olan roller. Kaynak kullanıcının anlattığı yapıdır. */
const CURRENT_ROLES: string[] = [
  'Patron. Şirketin sahibi.',
  'Üretim atölyesi 1. Yaklaşık 30 kişi.',
  'Üretim atölyesi 2. Yaklaşık 70 kişi.',
  'Üretim atölyesi 3. Yaklaşık 90 kişi.',
  'Fason takip ekibi. Fason, işi dışarıdaki atölyeye yaptırmaktır. Ekip atölyelerde ve tedarikçilerde işin durumunu izler.',
  'Grafik tasarım. 3 ile 5 ekip var. Her ekipte 1 ile 5 kişi çalışır. Ekiplerin bir lideri var.',
  'Muhasebe uzmanı. 1 kişi.',
  'Finans uzmanı. 1 kişi.',
  'İhracat ekibi. 1 lider ve 6 kişi. Yunanistan, ABD ve toptan ihracat.',
  'Dijital ekip. Web sitesinde ve Amazon ABD mağazasında tek tek satış yapar.',
  'Dijital baskı ekibi. Sentetik deri üzerine baskı yapar. 3 ile 5 kişi.',
  'Ayakkabı tasarımcısı. 1 kişi. Kalıp, ökçe, taban ve dış yüzeyi tasarlar.',
  'Mağaza sorumlusu. 1 kişi. Perakende mağazaları ve dış mağazalarla ilişkiyi yürütür.',
  'Mutfak sorumlusu. 1 kişi.',
]

/**
 * Araç tarafından önerilen roller. Şirkette bugün yoklar.
 * İlk ikisini yasa her işyerinde ister. Hizmet dışarıdan da alınabilir.
 * Diğerleri yaklaşık 200 kişilik bir üreticide olağan işlerdir.
 */
const SUGGESTED_ROLES: string[] = [
  'İş güvenliği uzmanı',
  'İşyeri hekimi',
  'İnsan kaynakları',
  'Kalite kontrol',
  'Satın alma ve tedarik',
  'Üretim planlama',
  'Depo ve sevkiyat',
  'Müşteri hizmetleri. İade ve değişim.',
]

function roles(): Row[] {
  const current = CURRENT_ROLES.map((skill, i) => row(`rol-${i + 1}`, { skill, plan: 'yap', partnerConfirmed: false, costNote: '' }))
  const suggested = SUGGESTED_ROLES.map((name, i) => row(`oneri-${i + 1}`, { skill: `${name.replace(/\.$/, '')}. ${SUGGESTED_ROLE}`, partnerConfirmed: false, costNote: '' }))
  return [...current, ...suggested]
}

function task(id: string, action: string, owner: string, acceptance: string, sourceStep: string): Task {
  return { id, action, owner, status: 'taslak', acceptance, sourceStep, createdAt: iso(-1), updatedAt: iso(-1) }
}

/**
 * Ayakkabı şirketi örneği. Çalışan bir işletme sıradaki stratejisini hazırlar.
 * Patron işi devralmıyor. Uygulamada çalışan iş için tek giriş "devralma" girişidir.
 * Bu yüzden giriş ve başlangıç "devralma" seçilir. Açıklama bu farkı yazar.
 * Hiçbir kontrol kararı kaydedilmedi. Eksikler kontrol ölçütlerinde görünür.
 */
export function buildShoeDemoPlan(): PlanDoc {
  const p = emptyPlan(SHOE_DEMO_ID, SHOE_DEMO_NAME)
  p.example = true
  p.entry = 'devralma'
  p.createdAt = iso(-3)
  p.lastLocation = '/devralma'

  /* Para kaynağı bilinmiyor. Bu yüzden "funding" boş kalır ve Adım 00 taslaktır. */
  p.profile = {
    customer: 'isletme',
    offering: 'fiziksel',
    regulation: 'dusuk',
    team: 'ekip',
    teamSize: 200,
    market: 'varOlan',
    start: 'devralma',
    needsPremises: true,
    paid: true,
    description: 'Ayakkabı üreten bir şirketiz. Yaklaşık 200 kişi çalışıyor. Üç üretim atölyemiz var. Yunanistan ve ABD’ye ihracat yapıyoruz. Web sitesinde ve Amazon ABD’de de satıyoruz. Patron işi devralmıyor. İş zaten çalışıyor. Sıradaki stratejiyi hazırlıyoruz.',
  }

  const draft = (values: Record<string, unknown>, daysAgo: number) => ({ values, status: 'taslak' as const, updatedAt: iso(-daysAgo) })

  p.steps = {
    '00': draft({ ...p.profile }, 2),
    '03': draft({
      rights: [1, 2, 3, 4, 5].map((n) => row(`hak-${n}`, { gate: String(n), owner: 'Patron', proposer: '', objector: '', informed: '' })),
      disputeRule: '',
    }, 2),
    '12': draft({
      skills: roles(),
      strengths: [
        row('guc-1', { name: 'Kendi üç üretim atölyemiz', basis: 'Patronun anlattığı yapı. Müşteriye sorulmadı.' }),
        row('guc-2', { name: 'Sentetik deriye dijital baskı ekibi', basis: 'Patronun anlattığı yapı. Müşteriye sorulmadı.' }),
        row('guc-3', { name: 'Yunanistan ve ABD’ye ihracat ekibi', basis: 'Patronun anlattığı yapı. Müşteriye sorulmadı.' }),
        row('guc-4', { name: 'Amazon ABD’de satış', basis: 'Patronun anlattığı yapı. Müşteriye sorulmadı.' }),
      ],
    }, 1),
    '17': draft({
      dependencies: ['tekKisi'],
      dependencyNote: 'Ayakkabı tasarımını tek kişi yapıyor. Muhasebeyi tek kişi yapıyor. Finansı da tek kişi yapıyor. Bu kişilerin yedeği yazılmadı.',
    }, 1),
  }

  /* Ödeyen müşteri var. Müşteri sayısı ve hedef bilinmiyor. Diğer sorular boş kalır. */
  p.takeover = {
    q1: 'Var. Müşteriler ihracattan, web sitesinden, Amazon ABD’den ve mağazalardan geliyor. Müşteri sayısı bilinmiyor.',
  }

  p.tasks = [
    task('is-1', 'Aylık zorunlu gideri ve kasadaki parayı yazın.', 'Finans uzmanı', 'Adım 02’de iki tutar yazılı.', '02'),
    task('is-2', 'Son 12 ayın satışını satış yoluna göre çıkarın.', 'Muhasebe uzmanı', 'İhracat, web sitesi, Amazon ABD ve mağaza satışı ayrı yazılı.', '16'),
    task('is-3', 'Önerilen her rol için karar verin.', 'Patron', 'Adım 12’de her önerilen rolün yanında bir karar yazılı.', '12'),
  ]
  p.revision = 1
  p.updatedAt = iso(-1)
  return p
}
