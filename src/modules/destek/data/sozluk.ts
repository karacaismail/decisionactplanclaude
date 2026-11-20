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
  { id: 'hibe', ad: 'Hibe', temel: true, anlam: 'İşletme koşulları yerine getirirse bu yardımı geri ödemez.' },
  { id: 'geriOdemeli', ad: 'Geri ödemeli destek', temel: true, anlam: 'İşletmenin daha sonra geri ödediği destektir.' },
  { id: 'kredi', ad: 'Kredi', temel: true, anlam: 'Bankanın verdiği borç paradır. Bazı programlar faizin bir kısmını öder.' },
  { id: 'tesvik', ad: 'Teşvik', temel: true, anlam: 'Vergi ya da prim indirimi gibi bir kolaylıktır.' },
  { id: 'ortaklikYatirimi', ad: 'Ortaklık yatırımı', temel: true, anlam: 'Yatırımcı para verir. Karşılığında şirketten pay alır.' },
  { id: 'kefalet', ad: 'Kefalet', temel: true, anlam: 'Bir kurum, krediniz için bankaya güvence verir.' },
  { id: 'cagri', ad: 'Çağrı', temel: true, anlam: 'Kurumun belirli bir dönem için başvuru açmasıdır.' },
  { id: 'kobi', ad: 'KOBİ', temel: true, anlam: 'Küçük ve orta büyüklükteki işletmedir. Ölçek sınırları için kurumun resmî tanımına bakın.' },
  { id: 'arge', ad: 'Ar-Ge', temel: true, anlam: 'Yeni bir ürün ya da yöntem geliştirmek için yapılan araştırmadır.' },
  { id: 'naceKodu', ad: 'NACE kodu', temel: true, anlam: 'İşletmenin faaliyet alanını gösteren resmî koddur.' },
  { id: 'onEslesme', ad: 'Ön eşleşme', temel: true, anlam: 'Uygulamanın verdiği ilk tahmindir. Kesin kararı kurum verir.' },
  { id: 'finansmanAcigi', ad: 'Finansman açığı', anlam: 'Planlanan gider ile eldeki kesin para arasındaki farktır.' },
  { id: 'sabitYatirim', ad: 'Sabit yatırım', anlam: 'Uzun süre kullanılan varlıkları edinmek için yapılan yatırımdır.', esAnlamlilar: ['CAPEX', 'capital expenditure'] },
  { id: 'isletmeGideri', ad: 'İşletme gideri', anlam: 'İşletmenin çalışmasını sürdürmek için yaptığı giderdir.', esAnlamlilar: ['OPEX', 'operating expenditure'] },
  { id: 'prodis', ad: 'PRODİS', anlam: "TÜBİTAK'ın proje başvuru sistemidir." },
  { id: 'dys', ad: 'Destek Yönetim Sistemi', anlam: 'Ticaret Bakanlığının destek başvurularını aldığı sistemdir.' },
  { id: 'ciftFinansman', ad: 'Çift finansman', anlam: 'Aynı giderin birden fazla kamu programından karşılanmasıdır.' },
  { id: 'esFinansman', ad: 'Eş finansman', anlam: 'Giderin destek dışında kalan ve başvuran tarafından karşılanan payıdır.' },
  { id: 'onKayit', ad: 'Ön kayıt', anlam: 'Bazı çağrılarda başvurudan önce yapılan kayıttır.' },
  { id: 'kapsamaAlimTarihi', ad: 'Kapsama alım tarihi', anlam: 'Kurumun desteğe uygun dönemi başlattığı tarihtir.' },
  { id: 'harcamaSonrasiOdeme', ad: 'Harcama sonrası ödeme', anlam: 'Kurum, işletmenin yaptığı ve belgelediği harcamadan sonra ödeme yapar.' },
  { id: 'tamZamanEsdeger', ad: 'Tam zaman eşdeğer çalışan', anlam: 'Çalışma sürelerini tam zamanlı çalışan cinsinden gösterir. Hesabı kurumun resmî tanımında okuyun.' },
  { id: 'teknikBelirsizlik', ad: 'Teknik belirsizlik', anlam: 'Çözümün işe yarayıp yaramayacağının baştan bilinmediği teknik sorundur.' },
  { id: 'isbirligiKurulusu', ad: 'İşbirliği kuruluşu', anlam: 'İşletmeler adına destek başvurusu yapabilen kuruluştur.' },
  { id: 'yanlisPozitif', ad: 'Yanlış pozitif', anlam: 'İlk eşleşmede uygun görünen ama koşulları karşılamayan sonuçtur.' },
]
