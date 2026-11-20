/**
 * Genel gider türleri. Bu dosya yalnız veridir.
 * Kaynak: önceki destek ve teşvik çalışmasının gider listesi. Verinin son kontrolü 12 Ağustos 2026 Çarşamba günüdür.
 * Veri kod çalıştırılmadan aktarıldı. Notlar yalın Türkçeyle yeniden yazıldı.
 * Tek bir işletmeye ya da sektöre özel sözler çıkarıldı.
 * Programlar bu dosyada durmaz. Gideri ödeyen programlar giderEslesmeleri.ts dosyasından gelir.
 * Kira ve hammadde 20 Kasım 2026 Cuma günü eklendi. Bu iki gider katalogda hiç geçmez.
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
  },
  {
    id: 'argeDisiPersonel',
    ad: 'Satış, pazarlama ve operasyon çalışanlarının maaşı',
    not: 'Bu maaşlar Ar-Ge hibelerine yazılmaz.',
  },
  {
    id: 'yurtIciPazarlama',
    ad: 'Yurt içinde internetten pazarlama',
    not: 'Hizmet ihracatı destekleri yalnız yurt dışına yönelik gideri öder.',
  },
  {
    id: 'yurtDisiPazarlama',
    ad: 'Yurt dışında tanıtım ve pazarlama',
    not: 'Yalnız kapsama alım tarihinden sonraki harcama desteklenir.',
    terim: 'kapsamaAlimTarihi',
  },
  {
    id: 'barindirma',
    ad: 'Sunucu kiralama gideri',
    not: 'Bu gidere barındırma da denir. Hizmet ihracatı desteğinde bu gider birden çok hizmet sınıfında yazılabilir.',
  },
  {
    id: 'yazilimLisansi',
    ad: 'Yazılım lisansları',
    not: 'Aynı faturayı iki programa yazmayın.',
    terim: 'ciftFinansman',
  },
  {
    id: 'capex',
    ad: 'Bilgisayar, ofis ve ilk kurulum yatırımı',
    not: 'Bu giderler sabit yatırımdır.',
    terim: 'sabitYatirim',
  },
  {
    id: 'markaTescilGider',
    ad: 'Yurt içinde marka ve patent tescil gideri',
    not: 'Tescil, markanın ya da buluşun resmî kaydıdır. Tescil kurumu para desteği vermez. Gideri bir destek programı karşılayabilir.',
  },
  {
    id: 'yurtDisiTescil',
    ad: 'Yurt dışında marka ve patent tescil gideri',
    not: 'Bu gider hizmet ihracatı desteğinde tescil ve koruma başlığındadır.',
  },
  {
    id: 'belgelendirme',
    ad: 'Kalite ve güvenlik belgesi alma gideri',
    not: 'Örneğin ISO belgesi ve bilgi güvenliği belgesi bu kaleme girer.',
  },
  {
    id: 'testAnaliz',
    ad: 'Test ve analiz hizmetleri',
  },
  {
    id: 'danismanlik',
    ad: 'Danışmanlık ve dijital dönüşüm danışmanlığı',
  },
  {
    id: 'egitimDonemiUcret',
    ad: 'İşbaşı eğitim döneminde katılımcı ücretleri',
    not: 'Devletin ödediği katılımcı aylarını hibe başvurusunda çalışan gideri olarak yazmayın.',
    terim: 'ciftFinansman',
  },
  {
    id: 'yapayZekaAltyapi',
    ad: 'Yapay zekâ işlem ve veri altyapısı hizmetleri',
    not: 'Yalnız kurumla anlaşması olan sağlayıcılardan alınan hizmet sayılır.',
  },
  {
    id: 'kira',
    ad: 'İşyeri kirası',
  },
  {
    id: 'hammadde',
    ad: 'Hammadde ve malzeme alımı',
  },
]
