/**
 * Gider kalemleri ve bu giderleri ödeyebilecek programlar. Bu dosya yalnız veridir.
 * Kaynak: önceki destek ve teşvik çalışmasının gider listesi. Verinin son kontrolü 12 Ağustos 2026 Çarşamba günüdür.
 * Veri kod çalıştırılmadan aktarıldı. Notlar yalın Türkçeyle yeniden yazıldı.
 * Tek bir işletmeye ya da sektöre özel sözler çıkarıldı. Program bağlantıları kaynaktaki gibidir.
 * Liste ilk rehberdir, söz değildir. Kesin kararı kurum verir.
 * Katalog denetimi: ekVeri.test.ts
 */
import type { GiderKalemi, IsoTarih } from './tipler'

export const GIDER_SON_KONTROL: IsoTarih = '2026-08-12'

export const GIDER_KALEMLERI: readonly GiderKalemi[] = [
  {
    id: 'argePersonel',
    ad: 'Ar-Ge çalışanlarının maaşı',
    not: 'Yalnız Ar-Ge işi yapan çalışanlar yazılır. Satış, pazarlama ve operasyon çalışanları bu kaleme yazılmaz.',
    programlar: ['tubitak1501', 'tubitak1507', 'tubitak1707', 'tubitak1711', 'kosgebGirisimciA', 'kanun5746', 'iskurIep'],
  },
  {
    id: 'argeDisiPersonel',
    ad: 'Satış, pazarlama ve operasyon çalışanlarının maaşı',
    not: 'Bu maaşlar Ar-Ge hibelerine yazılmaz.',
    programlar: ['kosgebGirisimciA', 'sgk4447', 'asgariUcretDestegi', 'iskurIep'],
  },
  {
    id: 'yurtIciPazarlama',
    ad: 'Yurt içinde internetten pazarlama',
    not: 'Hizmet ihracatı destekleri yalnız yurt dışına yönelik gideri öder.',
    programlar: ['kosgebGirisimciA'],
  },
  {
    id: 'yurtDisiPazarlama',
    ad: 'Yurt dışında tanıtım ve pazarlama',
    not: 'Yalnız kapsama alım tarihinden sonraki harcama desteklenir.',
    programlar: ['tb10962Atilim', 'kosgebIsletmeGelistirme'],
    terim: 'kapsamaAlimTarihi',
  },
  {
    id: 'barindirma',
    ad: 'Sunucu kiralama gideri',
    not: 'Bu gidere barındırma da denir. Hizmet ihracatı desteğinde bu gider birden çok hizmet sınıfında yazılabilir.',
    programlar: ['tb10962Atilim', 'tubitak1501'],
  },
  {
    id: 'yazilimLisansi',
    ad: 'Yazılım lisansları',
    not: 'Aynı faturayı iki programa yazmayın.',
    programlar: ['tubitak1501', 'tubitak1507', 'tb10962Atilim', 'kosgebGirisimciA'],
    terim: 'ciftFinansman',
  },
  {
    id: 'capex',
    ad: 'Bilgisayar, ofis ve ilk kurulum yatırımı',
    not: 'Bu giderler sabit yatırımdır.',
    programlar: ['tubitak1501', 'kosgebGirisimciA', 'yatirimTesvik'],
    terim: 'sabitYatirim',
  },
  {
    id: 'markaTescilGider',
    ad: 'Yurt içinde marka ve patent tescil gideri',
    not: 'Tescil, markanın ya da buluşun resmî kaydıdır. Tescil kurumu para desteği vermez. Gideri bir destek programı karşılayabilir.',
    programlar: ['kosgebIsletmeGelistirme'],
  },
  {
    id: 'yurtDisiTescil',
    ad: 'Yurt dışında marka ve patent tescil gideri',
    not: 'Bu gider hizmet ihracatı desteğinde tescil ve koruma başlığındadır.',
    programlar: ['tb10962Atilim'],
  },
  {
    id: 'belgelendirme',
    ad: 'Kalite ve güvenlik belgesi alma gideri',
    not: 'Örneğin ISO belgesi ve bilgi güvenliği belgesi bu kaleme girer.',
    programlar: ['kosgebIsletmeGelistirme', 'tb10962Atilim'],
  },
  {
    id: 'testAnaliz',
    ad: 'Test ve analiz hizmetleri',
    programlar: ['kosgebIsletmeGelistirme', 'tubitak1501'],
  },
  {
    id: 'danismanlik',
    ad: 'Danışmanlık ve dijital dönüşüm danışmanlığı',
    programlar: ['kosgebIsletmeGelistirme', 'kosgebGirisimciA'],
  },
  {
    id: 'egitimDonemiUcret',
    ad: 'İşbaşı eğitim döneminde katılımcı ücretleri',
    not: 'Devletin ödediği katılımcı aylarını hibe başvurusunda çalışan gideri olarak yazmayın.',
    programlar: ['iskurIep'],
    terim: 'ciftFinansman',
  },
  {
    id: 'yapayZekaAltyapi',
    ad: 'Yapay zekâ işlem ve veri altyapısı hizmetleri',
    not: 'Yalnız kurumla anlaşması olan sağlayıcılardan alınan hizmet sayılır.',
    programlar: ['kosgebYapayZekaKredisi', 'tubitak1501'],
  },
]
