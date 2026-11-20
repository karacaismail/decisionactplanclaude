/**
 * Gider ile program arasındaki bağlar. Bu dosya yalnız veridir.
 * Her bağ katalogdaki bir gider metnine birebir dayanır. Metin programın uygunGider ya da haricGider listesindedir.
 * Dizi sırası kullanılmaz. Metin değişirse giderEslesmeleri.test.ts testi bağın koptuğunu söyler.
 * Bağlar 20 Kasım 2026 Cuma günü katalog metninden elle çıkarıldı. Katalogda açıkça geçmeyen bağ eklenmedi.
 * Örneğin "Genel işletme giderleri" kira ya da hammadde diye yazmaz. Bu yüzden kira ve hammadde hiçbir programa bağlanmadı.
 * Bir harcamayı kısıtlayan koşullu metinler de bağ olmadı. Örneğin "Aynı faturanın başka programda kullanılan kısmı" böyledir.
 */
import type { GiderEslesme } from './tipler'

const uygun = (giderId: string, programId: string, kanitMetni: string): GiderEslesme => ({ giderId, programId, tur: 'uygun', kanitMetni })
const haric = (giderId: string, programId: string, kanitMetni: string): GiderEslesme => ({ giderId, programId, tur: 'haric', kanitMetni })

export const GIDER_ESLESMELERI: readonly GiderEslesme[] = [
  uygun('argePersonel', 'tubitak1501', 'Ar-Ge personelinin aylık giderleri'),
  uygun('argePersonel', 'tubitak1507', 'Ar-Ge personelinin aylık giderleri'),
  uygun('argePersonel', 'tubitak1707', 'Müşteri için yapılan Ar-Ge işinin personel giderleri'),
  uygun('argePersonel', 'tubitak1711', 'Yapay zekâ Ar-Ge personelinin aylık giderleri'),
  uygun('argePersonel', 'kosgebGirisimciA', 'Personel'),
  uygun('argePersonel', 'kanun5746', 'Uygun Ar-Ge, tasarım ve destek personelinin primleri'),
  haric('argePersonel', 'kosgebYapayZekaKredisi', 'Personel ve pazarlama giderleri'),
  haric('argePersonel', 'yatirimTesvik', 'Personel giderleri'),

  uygun('argeDisiPersonel', 'kosgebGirisimciA', 'Personel'),
  uygun('argeDisiPersonel', 'sgk4447', 'Yeni çalışanların işveren sigorta primi'),
  uygun('argeDisiPersonel', 'asgariUcretDestegi', 'Bordrodaki prim gideri'),
  haric('argeDisiPersonel', 'tubitak1501', 'Satış, pazarlama, çağrı merkezi ve genel yönetim personeli'),
  haric('argeDisiPersonel', 'kosgebYapayZekaKredisi', 'Personel ve pazarlama giderleri'),
  haric('argeDisiPersonel', 'yatirimTesvik', 'Personel giderleri'),
  haric('argeDisiPersonel', 'argeMerkezi', 'Satış, pazarlama, operasyon ve genel yönetim personeli'),
  haric('argeDisiPersonel', 'kanun5746', 'Ar-Ge dışı personel'),

  uygun('yurtIciPazarlama', 'kosgebGirisimciA', 'Pazarlama ve tasarım'),
  haric('yurtIciPazarlama', 'tubitak1507', 'Pazarlama ve satış giderleri'),
  haric('yurtIciPazarlama', 'tubitak1707', 'Satış ve pazarlama'),
  haric('yurtIciPazarlama', 'kosgebYapayZekaKredisi', 'Personel ve pazarlama giderleri'),
  haric('yurtIciPazarlama', 'tb10962Atilim', "Türkiye'deki pazarlama giderleri"),
  haric('yurtIciPazarlama', 'yatirimTesvik', 'Pazarlama giderleri'),

  uygun('yurtDisiPazarlama', 'kosgebGirisimciA', 'Pazarlama ve tasarım'),
  uygun('yurtDisiPazarlama', 'tb10962Atilim', 'Yurt dışına yönelik reklam, tanıtım ve pazarlama'),
  uygun('yurtDisiPazarlama', 'tb10962Marka', 'Markayı yurt dışında tanıtma giderleri'),
  haric('yurtDisiPazarlama', 'tubitak1507', 'Pazarlama ve satış giderleri'),
  haric('yurtDisiPazarlama', 'tubitak1707', 'Satış ve pazarlama'),
  haric('yurtDisiPazarlama', 'kosgebYapayZekaKredisi', 'Personel ve pazarlama giderleri'),
  haric('yurtDisiPazarlama', 'yatirimTesvik', 'Pazarlama giderleri'),

  uygun('barindirma', 'tb10962Atilim', 'Sunucu barındırma'),

  uygun('yazilimLisansi', 'tubitak1501', 'Proje kapsamındaki alet, teçhizat, yazılım ve yayın alımları'),
  uygun('yazilimLisansi', 'tubitak1507', 'Proje ekipmanı ve yazılım'),
  uygun('yazilimLisansi', 'tubitak1707', 'Proje ekipmanı ve yazılım'),
  uygun('yazilimLisansi', 'kosgebGirisimciA', 'Yazılım'),
  uygun('yazilimLisansi', 'tb10962Atilim', 'Yazılım lisansı (hizmet sınıfına bağlıdır)'),

  uygun('capex', 'tubitak1501', 'Proje kapsamındaki alet, teçhizat, yazılım ve yayın alımları'),
  uygun('capex', 'tubitak1507', 'Proje ekipmanı ve yazılım'),
  uygun('capex', 'tubitak1707', 'Proje ekipmanı ve yazılım'),
  uygun('capex', 'kosgebIsKurma', 'Kuruluş giderleri'),
  uygun('capex', 'kosgebGirisimciA', 'Makine, teçhizat ve kalıp'),
  uygun('capex', 'kosgebKapasite', 'Büyüme yatırımı ve altyapı'),
  uygun('capex', 'yatirimTesvik', 'Sabit yatırım giderleri'),
  uygun('capex', 'hit30', 'Büyük ölçekli sabit yatırım'),

  uygun('markaTescilGider', 'kosgebGirisimciA', 'Fikri mülkiyet'),
  uygun('markaTescilGider', 'kosgebIsletmeGelistirme', 'Marka ve patent tescil ücretleri'),

  uygun('yurtDisiTescil', 'kosgebGirisimciA', 'Fikri mülkiyet'),
  uygun('yurtDisiTescil', 'tb10962Atilim', 'Yurt dışında marka ve patent tescili ve koruması'),

  uygun('belgelendirme', 'kosgebGirisimciA', 'Belgelendirme ve test'),
  uygun('belgelendirme', 'kosgebIsletmeGelistirme', 'Belgelendirme ve sertifikasyon'),
  uygun('belgelendirme', 'tb10962Atilim', 'Belge, sertifika ve akreditasyon'),
  uygun('belgelendirme', 'tb10962Surdurulebilirlik', 'Belge, sertifika, akreditasyon'),

  uygun('testAnaliz', 'tubitak1501', 'Ar-Ge için test, analiz ve altyapı hizmetleri'),
  uygun('testAnaliz', 'kosgebGirisimciA', 'Belgelendirme ve test'),
  uygun('testAnaliz', 'kosgebIsletmeGelistirme', 'Test ve analiz'),

  uygun('danismanlik', 'tubitak1501', 'Ar-Ge için hizmet ve danışmanlık alımı. Bu gider sınırlıdır.'),
  uygun('danismanlik', 'kosgebGirisimciA', 'Eğitim, danışmanlık ve rehberlik'),
  uygun('danismanlik', 'kosgebIsletmeGelistirme', 'Teknik ve dijital dönüşüm danışmanlığı'),
  uygun('danismanlik', 'tb10962Surdurulebilirlik', 'Danışmanlık ve denetim'),

  uygun('egitimDonemiUcret', 'iskurIep', 'Eğitim süresince katılımcının ücreti ve sigorta primi'),

  uygun('yapayZekaAltyapi', 'tubitak1711', 'Model geliştirme ve veri altyapısı'),
  uygun('yapayZekaAltyapi', 'kosgebYapayZekaKredisi', 'Yüksek güçlü bilgi işlem hizmeti'),
  uygun('yapayZekaAltyapi', 'kosgebYapayZekaKredisi', 'Güvenli veri depolama'),
  uygun('yapayZekaAltyapi', 'kosgebYapayZekaKredisi', 'Yapay zekâ veri merkezi hizmetleri'),
  uygun('yapayZekaAltyapi', 'kosgebYapayZekaKredisi', 'Yapay zekâ araç ve platform hizmetleri'),
]
