/**
 * Destek sözlüğü. Bu dosya yalnız veridir. Ekran terimleri Türkçe abece sırasıyla dizer.
 * "temel" terimler program ekranlarındaki kısa terim listesinde de görünür. Bu terimler önceden de vardı.
 * Öteki terimler önceki destek ve teşvik çalışmasının sözlüğünden geldi. Verinin son kontrolü 12 Ağustos 2026 Çarşamba günüdür.
 * Tek bir sektöre özel terimler ve destek dışı planlama terimleri alınmadı. Aynı anlamdaki terimler birleştirildi.
 * Katalog denetimi: ekVeri.test.ts
 */
import type { Terim } from './tipler'

export const SOZLUK: readonly Terim[] = [
  { id: 'destek', ad: 'Destek', temel: true, anlam: 'Devletin ya da bir kurumun işletmeye verdiği yardımdır.' },
  { id: 'hibe', ad: 'Hibe', temel: true, anlam: 'Geri ödenmeyen paradır. Koşulları yerine getiren işletme parayı geri ödemez. Kabul yazısı gelmeden hibeyi bütçeye gelir olarak yazmayın.' },
  { id: 'geriOdemeli', ad: 'Geri ödemeli destek', temel: true, anlam: 'İşletme bu parayı sonra geri öder. Para faizsiz olabilir. Yine de bu para hibe değildir. Para işletmenin borcu olur.' },
  { id: 'kredi', ad: 'Kredi', temel: true, anlam: 'Bankanın verdiği borç paradır. Bazı programlar faizin bir kısmını öder.' },
  { id: 'tesvik', ad: 'Teşvik', temel: true, anlam: 'Vergi ya da prim indirimi gibi bir kolaylıktır.' },
  { id: 'ortaklikYatirimi', ad: 'Ortaklık yatırımı', temel: true, anlam: 'Yatırımcı para verir. Karşılığında şirketten pay alır.' },
  { id: 'kefalet', ad: 'Kefalet', temel: true, anlam: 'Bir kurum, krediniz için bankaya güvence verir.' },
  { id: 'cagri', ad: 'Çağrı', temel: true, anlam: 'Başvurunun yalnız belli tarihlerde açık olmasıdır. Kurum başlangıç ve bitiş tarihini duyurur. Dönem kapanınca o dönem için başvuru yapılamaz.' },
  { id: 'kobi', ad: 'KOBİ', temel: true, anlam: 'Küçük ve orta büyüklükteki işletmedir. Bunu çalışan sayısı ve yıllık satış tutarı belirler. Bağlı ve ortak işletmeler de hesaba katılır. KOBİ olmak destek oranını değiştirir.' },
  { id: 'arge', ad: 'Ar-Ge', temel: true, anlam: 'Yeni bir ürün ya da yöntem geliştirmek için yapılan araştırmadır.' },
  { id: 'naceKodu', ad: 'NACE kodu', temel: true, anlam: 'İşletmenin iş kolunu gösteren resmî koddur. Bu koda faaliyet kodu da denir. Bazı destek programları yalnız belli kodlara açıktır.' },
  { id: 'onEslesme', ad: 'Ön eşleşme', temel: true, anlam: 'Uygulamanın verdiği ilk tahmindir. Kesin kararı kurum verir.' },
  { id: 'finansmanAcigi', ad: 'Finansman açığı', anlam: 'Planlanan gider ile elinizdeki kesin para arasındaki farktır. Beklenen hibe bu farkı kapatmaz.' },
  { id: 'sabitYatirim', ad: 'Sabit yatırım', anlam: 'Bir kez alınan ve uzun süre kullanılan varlıktır. Örneğin bilgisayar ve ofis donanımı sabit yatırımdır. Yatırım teşvikindeki tutar sınırları yalnız bu giderlere bakar.' },
  { id: 'isletmeGideri', ad: 'İşletme gideri', anlam: 'Her ay tekrar eden giderdir. Örneğin maaş, kira, pazarlama ve yazılım aboneliği işletme gideridir. Bu giderler sabit yatırım sayılmaz.' },
  { id: 'prodis', ad: 'PRODİS', anlam: "TÜBİTAK'ın proje başvuru sistemidir. Kuruluş önce bu sisteme kayıt olur. Sistem etkin bir elektronik imza da ister." },
  { id: 'dys', ad: 'Destek Yönetim Sistemi', anlam: 'Ticaret Bakanlığı desteklerine elektronik başvuru yapılan tek sistemdir. Kısa adı DYS olur.' },
  { id: 'ciftFinansman', ad: 'Çift finansman', anlam: 'Aynı giderin iki ayrı kamu programından ödenmesidir. Örneğin aynı fatura iki programa yazılır. Aynı çalışanın aynı ayı da iki programa yazılamaz. Çift finansman yasaktır. Denetimde destek yasal faiziyle geri istenir. İşletmenin destek alması da yasaklanır.' },
  { id: 'esFinansman', ad: 'Eş finansman', anlam: 'Destek oranının dışında kalan paydır. İşletme bu payı kendi parasıyla öder. Örneğin destek oranı yüzde 75 ise eş finansman yüzde 25 olur.' },
  { id: 'onKayit', ad: 'Ön kayıt', anlam: 'Bazı çağrılarda proje başvurusundan önce yapılması gereken kayıttır. Kuruluş ön kaydı kaçırırsa çağrıya başvuramaz.' },
  { id: 'kapsamaAlimTarihi', ad: 'Kapsama alım tarihi', anlam: 'Desteğin başladığı resmî tarihtir. Bu tarihten önce yapılan harcama hiçbir zaman desteklenmez.' },
  { id: 'harcamaSonrasiOdeme', ad: 'Harcama sonrası ödeme', anlam: 'İşletme önce parayı harcar ve belgeler. Kurum belgeleri inceler. Destek bu incelemeden sonra ödenir. Aradaki süre için işletmenin kendi nakdi olmalıdır.' },
  { id: 'tamZamanEsdeger', ad: 'Tam zaman eşdeğer çalışan', anlam: 'Bir kişinin tam gün çalışmasına karşılık gelen katkıdır. Örneğin yarım gün çalışan iki kişi bir tam zaman eşdeğer çalışan sayılır. Bu sayı toplam çalışan sayısıyla aynı değildir.' },
  { id: 'teknikBelirsizlik', ad: 'Teknik belirsizlik', anlam: 'Çözümü baştan bilinmeyen teknik sorudur. Çözüm denenerek bulunur ve deneme başarısız olabilir. Ar-Ge desteklerinin temel şartı budur. Bitmiş bir geliştirme Ar-Ge sayılmaz.' },
  { id: 'isbirligiKurulusu', ad: 'İşbirliği kuruluşu', anlam: 'Bazı destek kalemlerinde başvuruyu yapan kuruluştur. Bu kuruluş sektörü temsil eden bir kuruluş ya da kamu kurumudur. İşletme bu kalemlere doğrudan başvuramaz. İşletme yalnız katılımcı olabilir.' },
  { id: 'yanlisPozitif', ad: 'Yanlış pozitif', anlam: 'Duyuruda size uygun görünen ama size ait olmayan tutardır. Tutar aslında başka bir kuruma, gidere ya da iş koluna aittir. Bu tutarı bütçeye yazarsanız plan bozulur.' },
]
