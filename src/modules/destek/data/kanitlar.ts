/**
 * Belge ve kanıt listesi. Bu dosya yalnız veridir.
 * Kaynak: önceki destek ve teşvik çalışmasının kanıt listesi. Verinin son kontrolü 12 Ağustos 2026 Çarşamba günüdür.
 * Veri kod çalıştırılmadan aktarıldı. Kaynak tek bir işletme için yazılmıştı.
 * O işletmeye ve sektörüne özel maddeler alınmadı. Öteki maddeler yalın Türkçeyle yeniden yazıldı.
 * Madde kimlikleri kaynaktaki kimliklerdir. Atlanan kimlikler alınmayan maddelerdir.
 * Katalog denetimi: ekVeri.test.ts
 */
import type { IsoTarih, KanitGrubu } from './tipler'

export const KANIT_SON_KONTROL: IsoTarih = '2026-08-12'

export const KANIT_GRUPLARI: readonly KanitGrubu[] = [
  {
    id: 'sirket',
    ad: 'Şirketin kuruluş ve kimlik belgeleri',
    maddeler: [
      { id: 'k1', ad: 'Ticaret Sicil Gazetesi', neden: 'Şirketin kuruluş tarihini ve şirket türünü gösterir.' },
      { id: 'k2', ad: 'Şirket ana sözleşmesi', neden: 'Bireysel Katılım Sermayesi gibi bazı programlar anonim şirket ister.' },
      { id: 'k3', ad: 'Pay defteri ve ortaklık yapısı', neden: 'Bazı programlar kurucunun şirketteki payına bakar.' },
      { id: 'k4', ad: 'İmza sirküleri', neden: 'Şirket adına kimin imza atabileceğini gösterir.' },
      { id: 'k5', ad: 'Vergi levhası', neden: 'İşletmenin vergi kaydını gösterir.' },
      { id: 'k6', ad: 'Vergi borcu yoktur yazısı', neden: 'Birçok program vergi borcu olan işletmeyi başvurudan eler.' },
      { id: 'k7', ad: 'SGK borcu yoktur yazısı', neden: 'Birçok program SGK borcu olan işletmeyi başvurudan eler.' },
    ],
  },
  {
    id: 'isKolu',
    ad: 'İş kolu kodu ve KOBİ durumu',
    maddeler: [
      { id: 'k8', ad: 'Tescilli NACE kodu', neden: 'Bazı destek programları yalnız belli NACE kodlarına açıktır.', terim: 'naceKodu' },
      { id: 'k10', ad: 'KOBİ beyannamesi', neden: 'İşletmenin KOBİ olduğunu bağlı ve ortak işletmelerle birlikte gösterir.', terim: 'kobi' },
    ],
  },
  {
    id: 'kayitlar',
    ad: 'Kurum kayıtları ve elektronik imza',
    maddeler: [
      { id: 'k11', ad: 'Elektronik imza', neden: 'TÜBİTAK proje başvuru sistemi elektronik imza ister.', terim: 'prodis' },
      { id: 'k12', ad: 'TÜBİTAK proje başvuru sisteminde kuruluş ön kaydı', neden: 'Ön kayıt olmadan çağrıya başvurulamaz ve bu kayıt çağrı açılmadan yapılabilir.', terim: 'onKayit' },
      { id: 'k13', ad: 'KOSGEB veri tabanı kaydı ve güncel işletme beyanı', neden: 'KOSGEB programlarının belge listelerinde bu kayıt istenir.' },
      { id: 'k14', ad: 'Ticaret Bakanlığı Destek Yönetim Sistemi kaydı ve yetkilendirme', neden: 'Hizmet ihracatı desteklerine bu sistemden başvurulur.', terim: 'dys' },
    ],
  },
  {
    id: 'fikriHak',
    ad: 'Fikri haklar ve yazılım',
    maddeler: [
      { id: 'k15', ad: 'Kurucu, çalışan ve dışarıdan çalışanlarla yapılan fikri hak devir sözleşmeleri', neden: 'Ürünün haklarının şirkete geçtiğini yazılı olarak gösterir.' },
      { id: 'k17', ad: 'Yazılımdaki dış bileşenlerin lisans listesi', neden: 'Dış bileşenlerin lisanslarına uyduğunuzu gösterir.' },
    ],
  },
  {
    id: 'arge',
    ad: 'Ar-Ge dosyası',
    maddeler: [
      { id: 'k20', ad: 'Ar-Ge personelinin kişi, ay ve proje listesi', neden: 'Hangi kişinin hangi ay hangi projede çalıştığını gösterir.' },
      { id: 'k21', ad: 'Teknik belirsizlik, denenecek yollar ve başarısızlık riski tanımı', neden: 'Ar-Ge desteklerinin temel şartı teknik belirsizliktir.', terim: 'teknikBelirsizlik' },
      { id: 'k22', ad: 'İş paketleri, süre, çıktı ve sorumluluk tablosu', neden: 'Projede kimin neyi ne zaman yapacağını gösterir.' },
      { id: 'k25', ad: 'Proforma faturalar', neden: 'Alınacak mal ve hizmetin fiyat teklifini gösterir.' },
    ],
  },
  {
    id: 'mali',
    ad: 'Mali dosya',
    maddeler: [
      { id: 'k26', ad: 'Giderlerin Ar-Ge, satış, pazarlama ve genel yönetim olarak ayrılması', neden: 'Ar-Ge giderini öteki giderlerden ayırır ve sonradan geriye dönük kurulamaz.' },
      { id: 'k27', ad: 'Maaşları Ar-Ge ve öteki işler olarak ayıran bordro düzeni', neden: 'Ar-Ge maaşlarını ayrı gösterir ve en baştan kurulmalıdır.' },
      { id: 'k28', ad: 'Çift finansman kontrol tablosu', neden: 'İkinci başvurudan önce kurulur ve aynı giderin iki programa yazılmasını önler.', terim: 'ciftFinansman' },
      { id: 'k29', ad: 'Sabit yatırımların kalem kalem listesi', neden: 'Yatırım teşvikindeki tutar sınırları yalnız sabit yatırıma bakar.', terim: 'sabitYatirim' },
      { id: 'k30', ad: 'Destek gelene kadar gereken nakdi gösteren hesap', neden: 'Destek çoğu zaman harcamadan sonra ödenir ve aradaki nakit ihtiyacını bu hesap gösterir.', terim: 'harcamaSonrasiOdeme' },
      { id: 'k31', ad: 'Kapsama alım tarihini ve harcama tarihlerini karşılaştıran tablo', neden: 'Kapsama alım tarihinden önceki harcama desteklenmez.', terim: 'kapsamaAlimTarihi' },
    ],
  },
  {
    id: 'ihracat',
    ad: 'İhracat dosyası',
    maddeler: [
      { id: 'k32', ad: 'Kurumdan alınmış yazılı ön sınıflandırma görüşü', neden: 'Hizmet ihracatı desteğinde işinizin hangi sınıfa girdiğini gösterir.' },
      { id: 'k33', ad: 'Yabancı müşteri sözleşmesi, faturası ve tahsilat kaydı', neden: 'Yurt dışına hizmet sattığınızı ve parasını aldığınızı gösterir.' },
      { id: 'k34', ad: 'Hizmetin yurt dışında kullanıldığını gösteren belge', neden: 'Hizmetin yurt dışındaki müşteriye ulaştığını gösterir.' },
      { id: 'k36', ad: 'Yurt içi marka tescil belgesi', neden: "Markanızın Türkiye'de resmî olarak kayıtlı olduğunu gösterir." },
    ],
  },
  {
    id: 'istihdam',
    ad: 'Çalışan ve teşvik dosyası',
    maddeler: [
      { id: 'k37', ad: 'Yeni çalışanın koşulları sağladığını gösteren liste', neden: 'Teşvikler yeni çalışanın yaşına, son altı aydaki işsizliğine ve mesleki belgesine bakabilir.' },
      { id: 'k38', ad: 'Ortalama çalışan sayısı hesabı', neden: 'Bazı teşvikler çalışan sayısının önceki ortalamanın üstüne çıkmasını ister.' },
      { id: 'k39', ad: 'İşbaşı eğitim katılımcılarının ay ay listesi', neden: 'Bu kişilerin ayları hibe başvurusunda çalışan gideri olarak yazılmaz.', terim: 'ciftFinansman' },
      { id: 'k40', ad: 'Çalışan başına teşvik listesi', neden: 'Aynı çalışanın iki teşvikte birden yazılmasını önler.' },
    ],
  },
  {
    id: 'hukuk',
    ad: 'Hukuk ve kişisel veri',
    maddeler: [
      { id: 'k42', ad: 'Kişisel veri listesi, sicil kaydı ve yurt dışına aktarımın hukuki dayanağı', neden: 'Kişisel verileri yasaya uygun işlediğinizi gösterir.' },
      { id: 'k43', ad: 'Elektronik ticaret bilgi sistemi kaydı', neden: 'Elektronik ticaret yapan işletmenin resmî kaydını gösterir.' },
      { id: 'k44', ad: 'Şirketle bağı olan tarafların listesi', neden: 'Siparişe dayalı çağrılarda müşteri sizinle bağı olan bir şirket olmamalıdır.' },
    ],
  },
]
