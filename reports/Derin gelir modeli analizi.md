# Karar Atlası kâra 115 müşteride ulaşır

> **Güncellik notu, 16 Kasım 2026 Pazartesi günü.** Bu rapor tarihseldir. Yerini [Doğrulanmış gelir modeli analizi](<Doğrulanmış gelir modeli analizi.md>) aldı. O rapor kaynakları asıl metinlerinden doğrular.

**Kısa cevap.** Karar Atlası satan şirkete para kazandırabilir. Ama doğrulanmış maliyetlerle eşik yükseldi. Temel senaryoda şirket yıl 3'te yaklaşık 115 ücretli müşteriyle başa baş olur. Önceki rapor bu sayıyı 102 bulmuştu. Yıl 1'de eşik 32'den 47 müşteriye çıktı. Nedeni ekip maliyetidir. Türkiye maaş anketleri ve 2026 SGK oranları yıl 1 ekibini ayda yaklaşık 10.000 dolar gösteriyor. Yıl 3 ekibi ayda yaklaşık 25.000 dolardır. Sunucu, mobil ve ödeme ücretleri toplam giderin yüzde 5'inden azdır. Bu yüzden kâr dört şeye bağlıdır: fiyat, müşteri tutma, destek saati ve satış hızı. Müşteri için de cevap koşulludur. Ürün, parası en az 20 ile 30 milyon TL olan kararda kendini öder. Bu eşik TL ile yazılırsa her yıl enflasyonla güncellenmelidir. Yapay zekâ bugün üründe yoktur. Rapordaki yapay zekâ maliyeti bir plandır.

Şirket şu koşullarda para kazanır:

1. Fiyat şirket başına yılda en az 180.000 TL olur. Bu, ayda 15.000 TL eder. KDV hariçtir.
2. Fiyat TL ile yazılır ve her yıl enflasyonla güncellenir.
3. Yıllık müşteri kaybı yüzde 10 civarında kalır. Bu, sektör ortancasıdır.
4. Destek müşteri başına ayda en çok 2 saat olur. Toplantı yürütme işini iş ortakları yapar.
5. Yapay zekâ kotayla verilir. Sınırsız kullanım verilmez.
6. Şirket yıl 2 ve yıl 3'te yılda yaklaşık 54 yeni müşteri kazanır. Yılda 36 yeni müşteriyle başa baş yıl 3'ten sonraya kalır.

Müşteri şu koşullarda para kazanır:

1. Kararın parası en az 18 ile 23 milyon TL olur. Bu sayılar Kasım 2026 içindir.
2. Ürün kararın getirisini en az 1 yüzde puan artırır.
3. Müşteri değeri kendi kayıtlarıyla ölçer.

## Bu raporu nasıl okursunuz?

Bu rapor 16 Kasım 2026 Pazartesi günü yazıldı. Rapor iki soruyu cevaplar:

1. Karar Atlası'nı satan şirket para kazanır mı?
2. Karar Atlası'nı alan müşteri para kazanır mı?

Bu rapor "Gelir modeli ve birim ekonomisi" raporunun yerini alır. O rapor 15 Kasım 2026 Pazar günü yazıldı. Bu rapor tek başına okunabilir. Önceki rapora göre değişenler 10. bölümdedir.

### Döviz kuru

Bütün çeviriler tek bir kurla yapıldı. TCMB, Türkiye Cumhuriyet Merkez Bankası'dır. Kur, TCMB'nin 16 Kasım 2026 Pazartesi günkü gösterge döviz satış kurudur ([TCMB kurları](https://www.tcmb.gov.tr/kurlar/202611/16112026.xml)).

| Para | Kur | Metinde yuvarlanmış hâli |
|---|---|---|
| 1 dolar | 50,3942 TL | 50,4 TL |
| 1 avro | 55,4979 TL | 55,5 TL |
| 1 avro | 1,1013 dolar | 1,10 dolar |

Önceki rapor 11 Kasım kurunu kullandı. O kur 50,2282 TL idi. Fark yaklaşık yüzde 0,3'tür. Bu fark sonuçları değiştirmez (hesap).

### Bilginin türü

Her sayının yanında türü yazar. Türler şunlardır:

| Tür | Anlamı | Örnek |
|---|---|---|
| Resmî | Yasa, Resmî Gazete ya da resmî kurum metni | TÜRKPATENT ücret tablosu |
| Yayımlanmış | Satıcının kendi sayfasında okunan fiyat | Logo fiyat listesi |
| Birincil araştırma | Araştırmayı yapan kurumun kendi yayını | SaaS Capital raporu |
| Üçüncü taraf | Başka bir sitenin aktardığı bilgi | Maaş anketi, haber, blog |
| Arama özeti | Sayfa açılamadı. Yalnız arama sonucunun özeti görüldü. En zayıf türdür. | PwC köşe yazısı |
| Hesap | Kaynaklı sayılardan yaptığımız hesap | İşverene maliyet |
| Varsayım | Kaynağı olmayan model girdisi. Sınanmalıdır. | Destek saati |
| Çıkarım | Bulgulardan çıkardığımız yorum | Fiyat önerisi |

Fiyatların görüldüğü tarih 16 Kasım 2026 Pazartesi günüdür. Başka tarih varsa ilgili yerde yazar. Fiyatlar KDV hariçtir. KDV dahil olan fiyatın yanında bu yazar.

### Ürünün bugünkü durumu

Ürünü bugünkü hâliyle bilerek okuyun. Canlı sürüm yalnız tarayıcıda çalışır. Sunucu sürümü tasarlandı ama yazılmadı. Yapay zekâ bugün üründe yoktur. Bu yüzden yapay zekâ maliyeti bir plandır. Ürün, yapay zekâ kapalıyken de tam çalışmalıdır.

Ürünün temel kuralı değişmez. Stratej yolu önerir ve gerekçesini kurar. Karar sahibi seçer ve kaydeder.

Bu rapor verilmiş mimari kararlara uyar ([bütünleşik geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md)). Bu kararlar şunlardır:

1. Her müşteri ayrı bir Frappe sitesinde ve ayrı veritabanında çalışır.
2. Jenkins yayını başlatır. Frappe Press siteleri her gece 02.30 ile 04.00 arasında dalgalarla günceller.
3. Ön yüz PWA'dır. Capacitor ile mobil uygulama olarak da çıkar.
4. Mobil uygulama, internet kesilince veriyi SQLite'a yazar. Bu karar kesindir.
5. Ön yüz, arka yüz ve sözleşmeler tek bir public depoda durur.

Sunucu ve yayın işlerinin sahibi DevOps sorumlusudur.

## Terimler

Bu terimler raporda sık geçer. Her terimin anlamı aşağıdadır.

| Terim | Anlamı |
|---|---|
| SaaS | İnternetten kiralanan yazılım. Müşteri yazılımı kurmaz, abone olur. |
| Birim ekonomisi | Tek bir müşteriden ne kazandığınızı gösteren hesap |
| Müşteri başına aylık gelir | Bir müşterinin her ay ödediği abonelik parası. Kısaltması ARPA'dır. |
| Aylık tekrarlayan gelir | Bütün abonelerden her ay düzenli gelen para. Kısaltması MRR'dir. |
| Yıllık tekrarlayan gelir | Aylık tekrarlayan gelirin 12 katı. Kısaltması ARR'dir. |
| Yıllık sözleşme değeri | Bir müşterinin bir yılda ödediği abonelik parası. Kısaltması ACV'dir. |
| Değişken maliyet | Her yeni müşteriyle artan maliyet. Örneğin yapay zekâ ücreti. |
| Sabit gider | Müşteri sayısı değişse de ödenen gider. Örneğin ekip maaşı. |
| Brüt kâr marjı | Gelirden hizmetin doğrudan maliyeti çıkınca kalan payın yüzdesi |
| Katkı payı | Bir müşterinin aylık gelirinden ona ait bütün maliyetler çıkınca kalan para |
| Başa baş noktası | Gelirin bütün giderleri tam karşıladığı nokta. Bu raporda müşteri sayısıyla ölçülür. |
| Müşteri kayıp oranı | Bir yılda aboneliği bırakan müşterilerin yüzdesi |
| Brüt gelir tutma | Eski müşterilerden bir yıl sonra kalan gelirin oranı. Ek satış sayılmaz. Kısaltması GRR'dir. |
| Net gelir tutma | Aynı oran, ama ek satış da sayılır. Kısaltması NRR'dir. |
| Müşteri kazanma maliyeti | Bir yeni müşteri için harcanan satış ve pazarlama parası. Kısaltması CAC'dir. |
| Geri ödeme süresi | Müşteri kazanma maliyetinin kaç ayda geri döndüğü |
| Ömür boyu katkı | Bir müşterinin abone kaldığı sürece bıraktığı toplam katkı payı. Kısaltması LTV'dir. |
| İşverene maliyet | Brüt maaşa işverenin ödediği SGK ve işsizlik primi eklenince çıkan tutar |
| Brüt maaş | Kesintilerden önceki maaş |
| Net maaş | Çalışanın eline geçen maaş |
| KDV | Katma değer vergisi. Satıcı müşteriden alır ve devlete öder. Satıcının geliri değildir. |
| Hizmet ihracatı istisnası | Yurt dışında kullanılan hizmette KDV alınmaması |
| Etkin karar | Hazırlık kapısından gözden geçirmenin kapanmasına kadar açık duran karar |
| Endeksleme | Fiyatı her yıl enflasyon oranına göre güncellemek |
| Kota | Pakete dahil olan kullanım miktarı. Örneğin aylık yapay zekâ kullanımı. |
| Kredi | Kotayı aşan kullanım için ayrıca satılan paket |
| Yüzde puan | İki yüzde arasındaki düz fark. Yüzde 10'dan yüzde 11'e çıkmak 1 puandır. |
| Duyarlılık tablosu | Tek bir girdi değişince sonucun nasıl değiştiğini gösteren tablo |
| Stratej | Stratejiyi geliştiren kişinin unvanı. Yazım hatası değildir. |

## 1. Maliyet tarafı: giderin yüzde 95'i ekiptir

Bu bölüm satıcı şirketin giderleridir. Önce ekip, sonra öteki giderler gelir. Bölüm tam maliyet tablosuyla biter.

### 1.1. İşverene maliyet formülü

2026 brüt asgari ücret ayda 33.030 TL'dir. Net asgari ücret 28.075,50 TL'dir ([Kolay İK](https://kolayik.com/blog/2026-asgari-ucret-net-hesabi-ve-kesintiler), üçüncü taraf). İşveren primleri 2026'da değişti. İşsizlik dahil işveren payı yüzde 23,75'tir. İmalat dışı işveren 2 puanlık Hazine desteği alır. Bu destekle pay yüzde 21,75'e iner ([Alomaliye, SGK primleri rehberi 2026](https://www.alomaliye.com/2026/07/29/sgk-primleri-rehberi-2026/), resmî metnin özeti).

Formül şudur (hesap):

> İşverene maliyet = brüt maaş × 1,2175 (Hazine desteğiyle)
>
> İşverene maliyet = brüt maaş × 1,2375 (Hazine desteği olmadan)

Formülün iki sınırı vardır:

1. Prim yalnız tavana kadar hesaplanır. 2026 prim tavanı ayda 297.270 TL'dir. Tavanın üstündeki maaşa prim eklenmez ([Alomaliye](https://www.alomaliye.com/2026/07/29/sgk-primleri-rehberi-2026/)).
2. Hazine desteği 31 Aralık 2026 Perşembe günü biter. Cumhurbaşkanı desteği 31 Aralık 2027 Cuma gününe kadar uzatabilir ([Alomaliye, SGK Genelgesi 2026/1](https://www.alomaliye.com/2026/01/07/sgk-genelgesi-2026-1/)).

Ürünün ilk satış yılı büyük ihtimalle 2027'dir. Destek uzatılmazsa ekip gideri yaklaşık yüzde 1,6 artar (hesap: 1,2375 ÷ 1,2175). Bu artış başa baş noktasını yaklaşık 2 müşteri yükseltir (hesap).

**Örnek.** Asgari ücretin işverene maliyeti şöyle bulunur (hesap):

1. Destekle maliyet 33.030 × 1,2175 = 40.214,03 TL olur.
2. Desteksiz maliyet 33.030 × 1,2375 = 40.874,63 TL olur.

PwC'nin bir köşe yazısı 40.214,03 TL verir ([PwC](https://www.pwc.com.tr/tr/medya/kose-yazilari/celal-ozcan/2026-yili-asgari-ucreti-ve-sektorlere-gore-isveren-maliyeti.html), arama özeti). Bu sayı destekli hesapla aynıdır. Kolay İK 40.544,33 TL verir. Bu sayı 2025 oranıyla hesaplanmış görünür (çıkarım).

### 1.2. Rol başına maaş ve işverene maliyet

Maaş anketleri net maaş verir. Net maaştan brüt maaş geriye doğru hesaplandı. Hesap 2026 gelir vergisi dilimlerini kullanır ([Alomaliye, 2026 vergi dilimleri](https://www.alomaliye.com/2025/12/31/2026-yili-vergi-dilimleri/)). Hesaba damga vergisi ve asgari ücret istisnası da girer. Sonra işverene maliyet 1,2175 çarpanıyla bulundu. Hesap asgari ücrette 28.075,50 TL neti doğru verir.

| Rol | Net maaş, aylık TL | Brüt maaş, aylık TL | İşverene maliyet, aylık TL | İşverene maliyet, aylık dolar | Net maaşın kaynağı |
|---|---|---|---|---|---|
| Kıdemli Python geliştirici | 167.500 | 273.992 | 333.585 | 6.620 | [getSalary](https://getsalary.dev/blog/yazilim-maas-rehberi-2026) |
| Kıdemli geliştirici, bütün roller | 137.500 | 218.937 | 266.556 | 5.289 | [yazilimcimaaslari.org](https://yazilimcimaaslari.org/) |
| Orta düzey Python geliştirici | 107.500 | 163.882 | 199.526 | 3.959 | getSalary |
| Orta düzey ön yüz geliştirici | 95.000 | 141.621 | 172.423 | 3.421 | getSalary |
| Mobil geliştirici, bütün düzeyler | 95.000 | 141.621 | 172.423 | 3.421 | yazilimcimaaslari.org |
| Kıdemli DevOps mühendisi | 182.500 | 300.874 | 365.531 | 7.253 | getSalary |
| Ürün tasarımcısı | 67.980 | 97.536 | 118.750 | 2.356 | [kariyer.net](https://www.kariyer.net/pozisyonlar/urun+tasarimcisi/maas) |
| Müşteri destek uzmanı | 44.176 | 58.698 | 71.465 | 1.418 | [kariyer.net](https://www.kariyer.net/pozisyonlar/musteri+destek+uzmani/maas) |
| Kurumsal satış yöneticisi | 73.300 | 106.216 | 129.318 | 2.566 | [kariyer.net](https://www.kariyer.net/pozisyonlar/kurumsal-satis-yoneticisi-yonetmeni/maas) |

Maaş sütunları üçüncü taraf ankettir. Brüt maaş ve işverene maliyet hesaptır. Tabloyu okurken dört sınırı bilin:

1. getSalary 4.589 kişiyle yapıldı. Anket, işverenin hangi ülkede olduğunu sormaz. Yurt dışından maaş alanlar da sayılmış olabilir.
2. yazilimcimaaslari.org Şubat 2026'da 1.223 kişiyle yapıldı. Yalnız TL maaşları sayar.
3. kariyer.net sayıları adayların beklentisinden gelir. Satış yöneticisinin primi dahil değildir.
4. Frappe geliştiricisi için ayrı maaş verisi bulunamadı.

Levels.fyi daha düşük bir sayı verir. İstanbul'da kıdemli geliştiricinin yıllık brüt ortancası 2.118.787 TL'dir ([Levels.fyi](https://www.levels.fyi/es/t/software-engineer/levels/senior/locations/istanbul-tur), arama özeti). Bu, ayda yaklaşık 215.000 TL işverene maliyet eder (hesap). Dolar karşılığı 4.266'dır. Bu sayı ekip tahmininin düşük ucudur.

### 1.3. Ekip gideri: yıl 1'de 10.000, yıl 3'te 25.000 dolar

Ekip gideri bir tahmindir. Tahmin yukarıdaki rol maliyetlerinden kurulur.

| Ekip | Düşük | Temel | Yüksek | Tür |
|---|---|---|---|---|
| Yıl 1 ekibi | 8.300 dolar | 10.000 dolar | 11.850 dolar | Tahmin |
| Yıl 1, TL karşılığı | 418.272 TL | 503.942 TL | 597.171 TL | Hesap |
| Yıl 3 ekibi | 17.000 dolar | 25.000 dolar | 35.000 dolar | Tahmin |
| Yıl 3, TL karşılığı | 856.701 TL | 1.259.855 TL | 1.763.797 TL | Hesap |

Yıl 1 ekibinde dört kişi vardır:

1. Ücret almayan kurucu
2. Kıdemli Python ve Frappe geliştiricisi
3. Orta düzey ön yüz ve mobil geliştirici
4. Çeyrek zamanlı DevOps

Yıl 3 ekibinde 5,5 ile 7,5 kişi vardır:

1. Kıdemli arka yüz geliştiricisi
2. Orta düzey arka yüz geliştiricisi
3. Kıdemli ön yüz geliştiricisi
4. Mobil geliştirici
5. Yarı zamanlı DevOps
6. Ürün tasarımcısı
7. Destek uzmanı
8. Satış yöneticisi

Düşük uç 5,5 kişilik yalın ekiptir. Yüksek uç 7,5 kişiye yüzde 20 genel gider ekler. Genel gider bilgisayar, yemek kartı, sağlık sigortası ve ofistir. Yüzde 20 bir varsayımdır.

Önceki rapor yıl 1 için 6.000 ve yıl 3 için 20.000 dolar varsaymıştı. Yeni sayılar daha yüksektir. 6.000 dolar yalnız bir kıdemli geliştiriciyi karşılar.

Dört konu araştırılmadı:

1. Teknopark ve Ar-Ge teşvikleri. Bu teşvikler işveren maliyetini düşürebilir.
2. DevOps işinin hizmet olarak alınma şartları. DevOps sorumlusunun ticari şartları bilinmiyor.
3. Kurucunun ücreti. Tahmin kurucuyu ücretsiz sayar.
4. Maaş artışı. Maaşlar TL ile belirlenir ve enflasyonla artar. Dolar karşılığı kura göre değişir.

### 1.4. Altyapı, mobil ve izleme

Hetzner, Almanya merkezli bir sunucu kiralama şirketidir. Hetzner fiyatları liste fiyatıdır. Aşağıdaki yığınlar Frappe Press düzenine göre kurulmuş tahminlerdir.

| Yığın | İçerik | Aylık avro | Aylık dolar | Tür |
|---|---|---|---|---|
| Düşük, yaklaşık 20 müşteriye kadar | Uygulama ve veritabanı tek sunucuda, Press ve Jenkins sunucusu, deneme sunucusu, yedek | 186,65 | 206 | Hesap |
| Temel | Press, Jenkins, deneme ve izleme için dört küçük sunucu, ayrı uygulama ve veritabanı sunucusu, yedek | 478 | 527 | Hesap |
| Yüksek | Almanya fiyatları, büyük veritabanı sunucusu, iki uygulama sunucusu, yedek | 901 | 993 | Hesap |

Fiyatlar Hetzner'in kendi sayfasından gelir ([Hetzner genel amaçlı sunucular](https://www.hetzner.com/cloud/general-purpose/), yayımlanmış). Yedek için sunucu fiyatının yüzde 20'si eklendi. Hetzner yalnız "başlangıç" fiyatı gösterir. Bu yüzden yüzde 20 bir varsayımdır.

**Hetzner 2026'da iki kez zam yaptı.** Birinci zam 1 Nisan 2026 Çarşamba günü geldi. İkinci zam 15 Haziran 2026 Pazartesi günü yeni siparişlere geldi. Bazı sınıflarda artış yüzde 113 ile 176 arasıydı ([heise](https://heise.de/-11333037), [wz-it](https://wz-it.com/en/blog/hetzner-price-increase-june-2026-cpx-ccx-alternatives/), üçüncü taraf). Hetzner'in resmî zam sayfası açılmadı. Tablodaki fiyatlar zamdan sonraki liste fiyatlarıdır.

**Frappe Cloud karşılaştırması.** Frappe Cloud'da özel uygulama için özel kurulum gerekir. Bu kurulum site başına ayda 25 dolardan başlar ([Frappe Cloud](https://frappe.io/cloud/shared-hosting), yayımlanmış). 115 müşteride bu yaklaşık 2.875 dolar eder (hesap). Temel Hetzner yığını 527 dolardır. Ayrıca Frappe Cloud, Jenkins ile kurulan gece yayınını yazıldığı gibi çalıştıramaz (çıkarım). Bu yüzden kendi sunucumuzdaki Press yolu daha ucuzdur.

**Türkiye'de barındırma.** Hetzner'in Türkiye'de veri merkezi yoktur ([Hetzner](https://www.hetzner.com/cloud/)). Türk sağlayıcıların çoğu fiyat yayımlamaz. Radore fiyat için e-posta ister ([Radore](https://radore.com/en/cloud-server)). Toplayıcı siteler Türkiye'de sanal sunucuyu ayda 30 ile 55 dolar gösterir. Bu bilgi üçüncü taraftır ([whtop, Natro](https://www.whtop.com/tr/plans/natro.com/142483), [whtop, Turhost](https://www.whtop.com/tr/plans/turhost.com/135432)). Türkiye'de barındırmayı ek ücretli bir seçenek yapın. Maliyet müşteri başına ayda 30 ile 75 dolardır. Bu, 1.512 ile 3.780 TL eder (hesap). Seçeneğin fiyatı bu maliyetin üstünde olmalıdır. 75 dolar bir varsayımdır.

**Mobil, izleme ve e-posta.** Bu kalemler küçük ve sabittir.

| Kalem | Fiyat | Tür |
|---|---|---|
| Apple geliştirici hesabı | Yılda 99 dolar | Yayımlanmış ([Apple](https://developer.apple.com/programs/enroll/)) |
| Google Play hesabı | Bir kez 25 dolar | Yayımlanmış ([Google](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en)) |
| Capawesome, yalnız uzaktan güncelleme | Ayda 9 ile 79 dolar | Yayımlanmış ([Capawesome](https://capawesome.io/cloud/pricing/)) |
| Capawesome, bulutta mobil derleme dahil | Ayda 19 ile 149 dolar | Yayımlanmış ([Capawesome](https://capawesome.io/cloud/pricing/)) |
| Capgo uzaktan güncelleme | Ayda 14 ile 99 dolar | Yayımlanmış ([Capgo](https://capgo.app/pricing/)) |
| Sentry hata izleme, Team paketi | Ayda 26 dolar, yıllık ödemeyle | Yayımlanmış ([Sentry](https://sentry.io/pricing/)) |
| Better Stack çalışma izleme | Ayda 29 dolar, yıllık ödemeyle | Yayımlanmış ([Better Stack](https://betterstack.com/pricing)) |
| Amazon SES e-posta | 1.000 e-posta için 0,10 dolar | Yayımlanmış ([AWS](https://aws.amazon.com/ses/pricing/)) |

Uzaktan güncelleme hizmeti küçük bir denemeden sonra seçilecek. Capgo ya da Capawesome Cloud seçilebilir. Capawesome'un derleme paketleri iPhone sürümünü bulutta derler. Bu paket Jenkins'in mağaza adımında Mac sunucusunun yerini alabilir (çıkarım).

Modeldeki araç gideri yıl 1'de ayda 60 dolardır. Yıl 3'te ayda 150 dolardır (tahmin). Bu tutar uzaktan güncellemeyi, izlemeyi, e-postayı ve Apple ücretini kapsar.

### 1.5. Yapay zekâ maliyeti: tipik müşteride ayda 11 dolar

Yapay zekâ bugün üründe yoktur. Aşağıdaki maliyet, özellik çıkınca beklenen maliyettir.

Anthropic liste fiyatları milyon kelime parçası başınadır ([Anthropic fiyatları](https://platform.claude.com/docs/en/about-claude/pricing), yayımlanmış). Kelime parçası, modelin metni böldüğü küçük birimdir.

| Model | Girdi | Çıktı |
|---|---|---|
| Opus 5.5 | 4 dolar | 20 dolar |
| Sonnet 5.5 | 2 dolar | 10 dolar |
| Haiku 5.5 | 0,10 dolar | 0,50 dolar |

Toplu işlemde yüzde 50 indirim vardır. Veriyi belli bir bölgede tutmak fiyatı yaklaşık yüzde 10 artırır. Hiçbir büyük sağlayıcı Türkiye bölgesi sunmuyor (çıkarım).

Müşteri başına aylık maliyet özellik özellik hesaplandı ([yapay zekâ tasarım notları](<../research_notes/Derin AI ve marka konumlandırma/ai_tasarimi.md>), hesap). Örnek müşteri 3 etkin plan ve yaklaşık 15 kullanıcıyla çalışır.

| Kullanım | Aylık maliyet | Aylık TL | Tür |
|---|---|---|---|
| Tipik, İngilizce metin | 7,6 dolar | 383 TL | Hesap |
| Tipik, Türkçe metin | 11 dolar | 554 TL | Hesap. Türkçe metnin 1,5 kat parça tuttuğu varsayıldı. |
| Yoğun, tipik kullanımın 4 katı | 30 ile 45 dolar | 1.512 ile 2.268 TL | Hesap |

Bu sayılar önceki raporun 18 dolarlık tipik maliyetinden düşüktür. Yeni hesap basit işleri ucuz Haiku modeline yönlendirir. Ortak bilgiyi de ön bellekte tutar.

**Türkiye'de kendi modelini çalıştırmak pahalıdır.** İstanbul'da tek RTX 5090 ekran kartlı sunucu ayda 42.000 TL'dir ([SistemDC](https://www.sistemdc.com/en/category/ekran-kartli-sunucu), yayımlanmış). Bu yaklaşık 833 dolar eder. KDV'nin dahil olup olmadığı yazmıyor. Bu tutar tipik bir müşterinin API maliyetinin yaklaşık 75 katıdır (hesap). Bu yolu yalnız yurt dışına veri gönderemeyen müşteriye satın. Fiyatı müşteri başına ayda en az 1.000 dolar olmalıdır (çıkarım).

### 1.6. Kuruluş, hukuk ve marka: bir kerelik yaklaşık 220.000 TL

Bu giderler bir kez ödenir. Aylık modele girmez.

| Kalem | Düşük | Temel | Yüksek | Tür |
|---|---|---|---|---|
| Limited şirket kuruluşu | 24.000 TL | 30.000 TL | 42.500 TL | Üçüncü taraf ([Paraşüt](https://www.parasut.com/blog/limited-sirket-kurulus-maliyetleri)) |
| Marka tescili, resmî ücret | 9.830 TL, tek sınıf | 15.800 TL, üç sınıf | 15.800 TL ve avukat ücreti | Resmî ([TÜRKPATENT](https://www.turkpatent.gov.tr/marka-islem-ucretleri)) |
| Sözleşme, KVKK belgesi ve gizlilik metni | 87.000 TL, tek sözleşme | 174.000 TL, iki sözleşme | 261.000 TL, üç sözleşme | Resmî tavsiye ücreti ([Hukuki Haber, İstanbul Barosu 2026](https://www.hukukihaber.net/istanbul-barosu-2026-yili-avukatlik-asgari-ucret-tarifesi)) |
| Toplam | 120.830 TL | 219.800 TL | 319.300 TL | Hesap |

Limited şirketin en az sermayesi 50.000 TL'dir. Bu sermaye 24 ay içinde ödenebilir. Sermaye bir gider değildir. Ama nakit ister.

Marka hesabı şöyledir (hesap). Sınıflar 9, 42 ve 35 olarak seçildi:

> 2.820 + 2.820 + 3.150 + 7.010 = 15.800 TL

Avukat ücretleri İstanbul Barosu'nun tavsiye ettiği en düşük ücretlerdir. Gerçek teklif farklı olabilir. Baro, KVKK uyum projesi için ayda 175.000 TL önerir. Küçük bir şirket için bu tutar yüksek görünür (çıkarım).

Mali müşavir ücreti doğrulanamadı. Arama özetleri ayda 3.606 ile 15.971 TL arasında çelişkili sayılar verir ([Vergi Merkezi](https://vergimerkezi.com.tr/?p=3984), [Faturaport](https://faturaport.com/blog/on-muhasebe/2026-yilinda-sm-smmm-ymm-asgari-ucret-tarifeleri-kapsamli-rehber)). Modelde muhasebe ve yönetim için ayda 300 dolar kullanıldı. Bu tutar yaklaşık 15.118 TL eder (tahmin).

### 1.7. Tam maliyet tablosu

Bütün satırlar 16 Kasım 2026 Pazartesi günü görüldü. Dolar karşılıkları 50,3942 TL kuruyla hesaplandı.

| No | Kalem | Birim | Düşük | Temel | Yüksek | Tür | Kaynak |
|---|---|---|---|---|---|---|---|
| 1 | Asgari ücretin işverene maliyeti | Aylık TL | 39.223 | 40.214 | 40.875 | Resmî ve hesap | [Alomaliye](https://www.alomaliye.com/2026/07/29/sgk-primleri-rehberi-2026/) |
| 2 | İşverene maliyet çarpanı | Brüt maaşın katı | 1,1875 (imalat) | 1,2175 | 1,2375 | Resmî | Aynı kaynak |
| 3 | Kıdemli Python geliştirici | Aylık dolar | 4.266 | 5.289 | 6.620 | Üçüncü taraf ve hesap | [getSalary](https://getsalary.dev/blog/yazilim-maas-rehberi-2026), [yazilimcimaaslari.org](https://yazilimcimaaslari.org/) |
| 4 | Orta düzey Python geliştirici | Aylık dolar | 2.830 | 3.959 | 4.181 | Üçüncü taraf ve hesap | Aynı kaynaklar |
| 5 | Ön yüz geliştirici | Aylık dolar | 2.830 | 3.421 | 5.511 | Üçüncü taraf ve hesap | Aynı kaynaklar |
| 6 | Mobil geliştirici | Aylık dolar | 3.421 | 3.421 | 5.511 | Üçüncü taraf ve varsayım | yazilimcimaaslari.org |
| 7 | DevOps mühendisi, tam zamanlı | Aylık dolar | 4.846 | 5.289 | 7.253 | Üçüncü taraf ve hesap | getSalary |
| 8 | Ürün tasarımcısı | Aylık dolar | 1.553 | 2.356 | 3.075 | Üçüncü taraf ve hesap | [kariyer.net](https://www.kariyer.net/pozisyonlar/urun+tasarimcisi/maas) |
| 9 | Destek uzmanı | Aylık dolar | 1.418 | 1.691 | 2.717 | Üçüncü taraf ve hesap | [kariyer.net](https://www.kariyer.net/pozisyonlar/musteri+destek+uzmani/maas) |
| 10 | Satış, primsiz | Aylık dolar | 1.804 | 2.566 | Bilinmiyor | Üçüncü taraf ve hesap | [kariyer.net](https://www.kariyer.net/pozisyonlar/kurumsal+satis+musteri+temsilcisi/maas) |
| 11 | Serbest Frappe geliştirici | Saatlik dolar | 15 | 30 | 90 | Üçüncü taraf | [Ecosire](https://ecosire.com/blog/hire-erpnext-developer-guide) |
| 12 | Ekip, yıl 1 | Aylık dolar | 8.300 | 10.000 | 11.850 | Tahmin | Satır 3 ile 7 |
| 13 | Ekip, yıl 3 | Aylık dolar | 17.000 | 25.000 | 35.000 | Tahmin | Satır 3 ile 10 |
| 14 | Hetzner Press yığını | Aylık dolar | 206 | 527 | 993 | Yayımlanmış ve hesap | [Hetzner](https://www.hetzner.com/cloud/general-purpose/) |
| 15 | Frappe Cloud özel kurulum | Site başına aylık dolar | 25 | 25 | 50 | Yayımlanmış | [Frappe Cloud](https://frappe.io/cloud/shared-hosting) |
| 16 | Yedek deposu | Aylık dolar | 10,6 | 19,1 | 30,0 | Yayımlanmış | [Hetzner nesne deposu](https://www.hetzner.com/storage/object-storage/), [Storage Box](https://www.hetzner.com/storage/storage-box/) |
| 17 | Türkiye'de sanal sunucu | Müşteri başına aylık dolar | 30 | 55 | 75 | Üçüncü taraf ve varsayım | [whtop](https://www.whtop.com/tr/plans/turhost.com/135432) |
| 18 | İzleme | Aylık dolar | 0 | 55 | 123 | Yayımlanmış | [Sentry](https://sentry.io/pricing/), [Better Stack](https://betterstack.com/pricing) |
| 19 | E-posta | 1.000 e-posta için dolar | 0,10 | 0,10 | 0,10 | Yayımlanmış | [AWS](https://aws.amazon.com/ses/pricing/) |
| 20 | Kartla ödeme ücreti | Tahsil edilen tutarın yüzdesi | 2,19 | 2,49 ve işlem başı 0,25 TL | 3,56 | Üçüncü taraf | [karekod](https://www.karekod.org/blog/sanal-pos-komisyon-oranlari/), [Ticimax](https://www.ticimax.com/blog/iyzico-komisyon-oranlari) |
| 21 | Yurt içi KDV | Yüzde | 20 | 20 | 20 | Resmî, yayın görülmedi | [whtop](https://www.whtop.com/tr/plans/natro.com/142483) |
| 22 | E-fatura | Yıllık TL | 0 (GİB portalı) | 5.000 | 11.280 | Üçüncü taraf ve yayımlanmış | [Faturaport](https://faturaport.com/blog/e-fatura/2026-mayis-e-fatura-kontor-fiyatlari), [Paraşüt](https://www.parasut.com/on-muhasebe-fiyatlari) |
| 23 | Apple geliştirici hesabı | Yıllık dolar | 99 | 99 | 99 | Yayımlanmış | [Apple](https://developer.apple.com/programs/enroll/) |
| 24 | Google Play hesabı | Bir kez dolar | 25 | 25 | 25 | Yayımlanmış | [Google](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en) |
| 25 | Uzaktan güncelleme | Aylık dolar | 9 | 29 | 49 | Yayımlanmış | [Capawesome](https://capawesome.io/cloud/pricing/), [Capgo](https://capgo.app/pricing/) |
| 26 | Yapay zekâ, müşteri başına | Aylık dolar | 7,6 | 11 | 45 | Yayımlanmış fiyat ve hesap | [Anthropic](https://platform.claude.com/docs/en/about-claude/pricing) |
| 27 | Türkiye'de ekran kartlı sunucu | Aylık dolar | 516 | 833 | 1.230 | Yayımlanmış | [SistemDC](https://www.sistemdc.com/en/category/ekran-kartli-sunucu) |
| 28 | Şirket kuruluşu | Bir kez TL | 24.000 | 30.000 | 42.500 | Üçüncü taraf | [Paraşüt](https://www.parasut.com/blog/limited-sirket-kurulus-maliyetleri) |
| 29 | Mali müşavir | Aylık TL | 3.606 | 7.985 | 15.971 | Arama özeti, doğrulanmadı | [Vergi Merkezi](https://vergimerkezi.com.tr/?p=3984) |
| 30 | Marka, resmî ücret | Bir kez TL | 9.830 | 15.800 | 15.800 ve avukat | Resmî | [TÜRKPATENT](https://www.turkpatent.gov.tr/marka-islem-ucretleri) |
| 31 | Avukat, sözleşme başına | TL | 87.000 | 87.000 | Sözleşme değerinin yüzde 5'i | Resmî tavsiye | [Hukuki Haber](https://www.hukukihaber.net/istanbul-barosu-2026-yili-avukatlik-asgari-ucret-tarifesi) |

E-faturanın yüksek ucu Paraşüt'ün liste fiyatıdır. Önceki rapor 752 TL'yi liste fiyatı saymıştı. Bu bir kampanya fiyatıdır. Ayrıntı 3. bölümdedir.

**Sonuç (hesap).** Temel senaryoda aylık sabit gider yıl 1'de 10.566 dolardır. Bu yaklaşık 532.465 TL eder. Yıl 3'te sabit gider 25.977 dolardır. Bu yaklaşık 1.309.090 TL eder. Hesap şöyle yapılır:

1. Sabit gider = ekip + altyapı + araçlar + muhasebe
2. Yıl 1 = 10.000 + 206 + 60 + 300 = 10.566 dolar
3. Yıl 3 = 25.000 + 527 + 150 + 300 = 25.977 dolar

Ekip bu giderin yıl 1'de yüzde 95'i, yıl 3'te yüzde 96'sıdır (hesap). Bu yüzden maliyet modeli aslında bir ekip modelidir.

## 2. Ödeme ve vergi: Stripe yok, KDV yüzde 20

### 2.1. Ödeme aracı

Stripe, Türkiye merkezli şirketleri kabul etmiyor. Stripe'ın desteklediği ülkeler arasında Türkiye yok ([Stripe](https://stripe.com/global), yayımlanmış). Bu yüzden kartla tahsilat Türk ödeme kuruluşlarıyla yapılır.

| Kuruluş | Ücret | Para hesaba ne zaman geçer? | Tür |
|---|---|---|---|
| PayTR | Yeni üyede yüzde 2,19'dan başlar. Kurulum ve yıllık ücret yok. | 7 gün sonra | Üçüncü taraf ([karekod](https://www.karekod.org/blog/sanal-pos-komisyon-oranlari/)) |
| Param | Yüzde 2,29. Param'ın kendi sayfası yüzde 2,19 ve yüzde 4,15 gösterir. Kaynaklar çelişir. | Ertesi gün | Üçüncü taraf ve arama özeti ([karekod](https://www.karekod.org/blog/sanal-pos-komisyon-oranlari/), [Param](https://cert.param.com.tr/en/param-virtual-pos)) |
| iyzico | Genel fiyat yayımlamaz. Üçüncü taraf yüzde 2,49 ve işlem başı 0,25 TL verir. Yüzde 2,99 da geçer. | Bilinmiyor | Üçüncü taraf ([Ticimax](https://www.ticimax.com/blog/iyzico-komisyon-oranlari)) |
| Bankanın kredi kartı tavanı | Tek çekimde en çok yüzde 3,56 | Bilinmiyor | Üçüncü taraf, TCMB tavanını aktarır ([karekod](https://www.karekod.org/blog/sanal-pos-komisyon-oranlari/)) |

Kart ücreti KDV dahil tutardan kesilir (çıkarım). Örnek hesap şöyledir:

> 180.000 TL abonelik + yüzde 20 KDV = 216.000 TL
>
> 216.000 × yüzde 2,5 = 5.400 TL kart ücreti

Şirketler arası ödemede havale ve EFT daha yaygındır (çıkarım). Banka havale ücretleri araştırılmadı.

### 2.2. KDV ve ihracat istisnası

Yurt içinde satılan yazılım hizmetine yüzde 20 KDV eklenir. Satıcı KDV'yi müşteriden alır ve devlete öder. Bu yüzden KDV satıcının geliri değildir. Bu rapordaki bütün fiyatlar KDV hariçtir.

Yurt dışına satılan hizmette KDV alınmayabilir. Bu istisna Katma Değer Vergisi Kanunu'nun 11/1-a maddesindedir ([Alomaliye](https://www.alomaliye.com/2024/07/30/yurt-disinda-mukim-firmaya-verilen-tasarim-yazilim-ve-danismanlik-hizmetinin-kdv-ve-kvk-karsisindaki-durumu/), [fatiharas](https://www.fatiharas.com/yazilim-ihracati-vergilendirme/), üçüncü taraf). İstisna için üç şart gerekir:

1. Hizmet yurt dışındaki bir müşteri için yapılır.
2. Müşteri hizmetten yurt dışında yararlanır.
3. Ödeme döviz olarak Türkiye'ye gelir. Satıcı bunu belgeyle gösterir.

Bir örnek verelim. Yabancı bir grubun Türkiye'deki şirketi ürünü Türkiye'de kullanır. Bu satış büyük ihtimalle istisna dışıdır (çıkarım). Mali müşavir bu durumu her müşteride ayrıca incelemelidir.

Kurumlar vergisinde de bir indirim var. Yurt dışına verilen bazı hizmetlerde kazancın indirimi yüzde 80'den yüzde 100'e çıktı. Bunu 11257 sayılı Cumhurbaşkanı Kararı yaptı. Karar 30 Nisan 2026 Perşembe günü tarihlidir ([Muhasebenews](https://www.muhasebenews.com/yurt-disina-verilen-bazi-hizmetlerde-kurumlar-vergisi-indirimi-%100-oldu/), üçüncü taraf). Kararın resmî metni okunmadı. Aynı "yurt dışında yararlanma" şartı burada da geçerlidir.

Yurt dışı faturalar ayrı bir iş doğurur. Hetzner, Anthropic ve Capgo faturaları yurt dışından gelir. Bu faturalarda KDV'yi alıcı şirket beyan eder. Sonra bu KDV'yi indirebilir (çıkarım, doğrulanmadı). Mali müşavir bu işleyişi doğrulamalıdır.

E-fatura ucuzdur. GİB e-Arşiv portalı ücretsizdir ([Faturaport](https://faturaport.com/blog/e-fatura/2026-mayis-e-fatura-kontor-fiyatlari), üçüncü taraf). Özel sağlayıcılar yılda birkaç bin TL ister.

### 2.3. Abonelikte vadeli çek almayın

Türk şirketleri arasında ödeme vadeleri uzadı. Hızlı tüketim sektöründe vade 2021'de 45 ile 60 gündü. 2025'te 60 ile 95 güne çıktı. Bazı büyük şirketler ödemeyi 120 ile 180 güne itiyor. 2025'te karşılıksız çek toplamı 128 milyar TL oldu. Bu bilgiler iki köşe yazısından gelir ([Dünya](https://www.dunya.com/kose-yazisi/tedarik-zincirinde-ticari-alacak-cikmazi/836742), [Dünya](https://www.dunya.com/kose-yazisi/buyuklerin-faiz-tahkimati-kobi-carkini-kilitliyor/840000)). Abonelik vadeleri için 2026 istatistiği bulunamadı.

Önerimiz şudur (çıkarım):

1. Abonelik için vadeli çek kabul etmeyin.
2. Yıllık peşin ödemeyi havale ya da EFT ile alın.
3. Aylık ödeyen müşteriden kartla ya da havaleyle ödeme alın.
4. Ödeme gelmezse erişimi Logo'nun kuralına benzer biçimde durdurun.

Logo yenilemede 30 günlük ek süre verir. Bu sürede yenileme ücretine yüzde 10 ek gelir ([Logo GO Wings fiyat listesi](https://cdn.logo.com.tr/files/logocomtr//Uploads/Documents/logo-go-wings-fiyat-listesi.pdf), yayımlanmış).

## 3. Fiyat çapaları: Logo listeleri 180.000 TL'yi tanıdık kılar

Fiyat çapası, alıcının fiyatı karşılaştırdığı tanıdık fiyattır. Bu bölüm Türk alıcının gördüğü fiyatları toplar.

### 3.1. Logo fiyatlarını açıkça yayımlıyor

Logo, Türk iş yazılımı şirketidir. Logo TL fiyat listelerini PDF olarak yayımlar. Fiyatlar tavsiye fiyatıdır ve KDV hariçtir. Ana listeler 7 Ocak 2026 Çarşamba günü yürürlüğe girdi. İş analitiği listesi 10 Temmuz 2026 Cuma günü yenilendi. Yani Logo yılda en az bir kez, bazen iki kez fiyat değiştiriyor.

Logo üç ödeme planı sunar. Plan 1'de ilk yıl pahalı, yenileme ucuzdur. Plan 3'te her yıl yaklaşık aynı ücret ödenir. Planların farkını anlatan metin PDF'ten okunamadı. Bu okuma sayılardan çıkarılmıştır (çıkarım).

| Ürün | İlk yıl, Plan 1 | İlk yıl, Plan 3 | 180.000 TL'nin bu fiyata oranı | Kaynak |
|---|---|---|---|---|
| Logo Mind Navigator, yönetim karar destek, 1 kullanıcı | 64.400 TL | 16.800 TL | 2,8 ile 10,7 kat | [GO Wings listesi](https://cdn.logo.com.tr/files/logocomtr//Uploads/Documents/logo-go-wings-fiyat-listesi.pdf) |
| Logo Mind Insight, iş analitiği, 1 kullanıcı | 316.200 TL | 82.300 TL | 0,57 ile 2,2 kat | [İş analitiği listesi](https://cdn.logo.com.tr/files/logocomtr/Uploads/Documents/logo-is-analitigi-eop-fiyat-listesi.pdf) |
| Logo j-HR performans ve yetenek modülü, 100 çalışan | 294.600 TL | 76.600 TL | 0,61 ile 2,35 kat | [j-HR listesi](https://cdn.logo.com.tr/files/logocomtr/Uploads/Documents/logo-j-hr-eop-fiyat-listesi.pdf) |
| Logo GO Wings ana paket, 1 kullanıcı | 134.500 TL | 35.000 TL | 1,3 ile 5,1 kat | [GO Wings listesi](https://cdn.logo.com.tr/files/logocomtr//Uploads/Documents/logo-go-wings-fiyat-listesi.pdf) |
| Logo Cloud Standard, bulut muhasebe | Yılda 43.900 TL | Aynı | 4,1 kat | [Logo Cloud](https://logo.com.tr/en/product/logo-cloud) |

Bütün fiyatlar yayımlanmıştır. Oranlar hesaptır.

**Çıkarım.** 180.000 TL, Logo'nun tek bir yönetim ya da insan kaynakları modülüyle aynı büyüklüktedir. Logo kullanan orta ölçekli alıcı bu fiyatı tanıdık bulur. Ön muhasebe yazılımına alışmış alıcı ise çok pahalı bulur.

### 3.2. Paraşüt'ün 752 TL'lik fiyatı kampanyadır

Önceki rapor Paraşüt'ün fiyatını ayda 752 TL yazdı. Bu fiyat bir kampanyadır. Paraşüt'ün liste fiyatı ayda 940 TL'dir. Yıllık liste fiyatı 11.280 TL'dir ([Paraşüt fiyatları](https://www.parasut.com/on-muhasebe-fiyatlari), yayımlanmış). Kampanya ilk kez abone olanlara yüzde 20 indirim verir. Kampanya 2 Kasım 2026 Pazartesi günü başladı. Kampanya 31 Aralık 2026 Perşembe günü biter. 180.000 TL, Paraşüt'ün yıllık liste fiyatının yaklaşık 16 katıdır (hesap).

Paraşüt sayfasında bir hesap hatası da var. Sayfa 8.376 TL tasarruf yazar. Kendi sayıları 2.256 TL tasarruf verir (hesap: 11.280 eksi 9.024).

### 3.3. Danışmanlık işi ürünün 8 ile 17 katıdır

| Çapa | Tutar | 180.000 TL'nin kaç katı? | Tür |
|---|---|---|---|
| Kocaeli Büyükşehir, strateji ve kurumsal yönetim hizmeti. Sözleşme 8 Eylül 2026 Salı günü imzalandı. | 3.060.000 TL | 17 kat | Üçüncü taraf ([Nokta Gazetesi](https://www.noktagazetesi.com.tr/ihale/kocaeli-buyuksehirden-3-milyonluk-vatandas-odakli-strateji-ihalesi-sirketin-sahibi-dikkat-cekti-385382)) |
| Cascade ortağı bir danışmanlık firmasının başlangıç işi | 25.000 ile 50.000 avro, yani 1,39 ile 2,77 milyon TL | 7,7 ile 15,4 kat | Arama özeti ([Cascade ortağı](https://www.cascade.app/cascade-partner/vivid-strategies)) |
| KOSGEB teknik danışmanlık desteği | Günde en çok 900 TL. Toplam en çok 40.000 TL. Destek oranı yüzde 60. | Toplam desteğin 4,5 katı | Resmî ([KOSGEB İşletme Geliştirme](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/%C4%B0sletme%20Gelistirme%20Destek%20Program%C4%B1/2026/I%CC%87s%CC%A7letme_Gelis%CC%A7tirme_Destek_Program%C4%B1_Uygulama_Esaslar%C4%B1_22.pdf)) |
| KOSGEB YÖNDE, dijital dönüşüm yol haritası | Hizmet başına 20.000 TL. Toplam 40.000 TL. Destek oranı yüzde 80. | Hizmet desteğinin 9 katı | Resmî ([KOSGEB YÖNDE](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/YONDE/2026/2026.07.14/Y%C3%96NDE-Y%C3%B6nderlikveDe%C4%9FerlendirmeDestekProgram%C4%B1Y%C3%B6nergesi05.07.26.pdf)) |

Türk danışmanlık firmaları strateji ücretini yayımlamıyor. KPMG ve PwC sayfalarında da fiyat yok.

**Çıkarım.** Devlet desteği ürünün fiyatının küçük bir parçasını karşılar. KOSGEB'in 40.000 TL'lik desteği bir yıllık aboneliğin yaklaşık yüzde 22'sidir. Bu destek yalnız KOSGEB'e kayıtlı danışmanın işine ödenir. Bu yüzden destek satışta bir kolaylıktır, ödeme kaynağı değildir.

**Kamu için not.** Sayıştay'a göre kamu kurumu stratejik planını kendi personeliyle hazırlar. Danışmanlık desteği alınabilir. Ama planın kendisi dışarıya yazdırılamaz ([Vizyonder](https://www.vizyonder.org.tr/mevzuat-stratejik-plan-ve-performans-programinin-ihale-yoluyla-313), üçüncü taraf). Bu yüzden kamuya ürünü bir araç olarak satın. "Planınızı biz yazarız" demeyin.

### 3.4. Yerli hedef ve performans araçları fiyat saklıyor

Kolay İK fiyat yayımlamaz. Kolay İK çalışan sayısına göre teklif verir ([Kolay İK](https://kolayik.com/insan-kaynaklari-yazilimi-fiyatlari)). Twiser ve Bimser QDMS de teklif usulüyle satar ([Toolmage, Twiser](https://www.toolmage.com/en/tool/twiser/), [G2, QDMS](https://www.g2.com/products/bimser-qdms/pricing), üçüncü taraf). Mikro, Uyumsoft ve Netsis için yayımlanmış TL fiyatı bulunamadı.

**Çıkarım.** Açık bir fiyat sayfası Karar Atlası'nı yerli rakiplerden ayırır.

### 3.5. Yabancı örnekler

| Ürün | Fiyat | Tür |
|---|---|---|
| Basecamp Pro Unlimited | Ayda 199 dolar, yıllık ödemeyle. Sınırsız proje ve kullanıcı. | Yayımlanmış ([Basecamp](https://basecamp.com/pricing)) |
| Odoo Enterprise | Kullanıcı başına ayda 29 avrodan 35 avroya çıktı. Eylül 2026. Dört yıldaki ilk zam. | Üçüncü taraf ([Brussels Times](https://www.brusselstimes.com/2332306/odoo-announces-e10-billion-valuation-and-a-partial-price-increase)) |
| Cloverpop, karar yönetimi | Karar sahibi başına yıllık ücret. Sınırsız karar. Fiyat teklifle. | Üçüncü taraf ([G2](https://www.g2.com/products/cloverpop/pricing)) |

## 4. Önerilen fiyat modeli

Bu bölüm önerilerimizdir. Fiyatlar hipotezdir. 9. bölümdeki görüşmeler bu fiyatları sınar.

### 4.1. Fiyat birimi: şirket ve etkin karar

Kişi başı fiyat kullanmayın. Kişi başı fiyat sizi ucuz hedef takip araçlarıyla yarıştırır. Alıcı grubu da küçüktür. Örneğin genel müdür, mali işler müdürü, stratej ve birkaç ekip üyesi.

Fiyatı şirket başına ve etkin karar sayısına göre koyun. Basecamp bu yolu kullanır. Basecamp yalnız etkin proje sayısına göre fiyat alır. Arşivdeki proje sayılmaz ([Basecamp](https://basecamp.com/pricing), yayımlanmış). Etkin karar da böyle tanımlanır:

1. Karar hazırlık kapısında etkin olur.
2. Karar, gözden geçirme döngüsü kapanınca etkinliğini yitirir.
3. Arşivdeki karar okunabilir kalır. Arşiv için ücret alınmaz.

Bu birim büyümeye de yardım eder. Kişi başı fiyatta net gelir tutma ortancası yüzde 98'dir. Kullanıma göre fiyatta yüzde 108'dir ([Aleph, Benchmarkit 2026](https://www.getaleph.com/blog/2026-saas-benchmarks-takeaways), üçüncü taraf). Etkin karar kullanıma benzer bir birimdir (çıkarım).

### 4.2. Paketler

| Paket | Kime? | Ne içerir? | Fiyat, KDV hariç | Tür |
|---|---|---|---|---|
| Kurucu | Tek kurucu | Tarayıcı sürümü, tek kullanıcı, küçük yapay zekâ kotası | Ücretsiz ya da ayda yaklaşık 490 TL | Varsayım |
| Karar | Aile kökenli orta ölçekli şirket | 1 etkin karar, yaklaşık 15 düzenleyici, sınırsız okur, yapay zekâ kotası | Yılda 180.000 TL, peşin | Varsayım |
| Şirket | Birden çok kararı olan şirket | En çok 3 etkin karar, hedefler, kaynak izinleri ve gözden geçirmeler | Yılda 300.000 ile 480.000 TL | Varsayım |
| İzleme | Kararı kapanmış müşteri | Arşiv, gözden geçirme ritmi ve değer raporu | Görüşmelerde sınanacak | Çıkarım |
| Kurumsal | Holding ve büyük şirket | Sınırsız etkin karar | Teklifle | Çıkarım |

İzleme paketi bir kayıp riskine cevaptır. Müşteri tek karar için gelir. Karar bitince ödeme nedeni de bitebilir. İzleme paketi müşteriyi daha ucuz bir pakette tutar.

Ek ücretli seçenekler şunlardır:

1. Türkiye'de barındırma
2. Ek yapay zekâ kredisi
3. Türkiye'de çalışan yapay zekâ
4. Kurulum ve pilot paketi

Aylık ödemek isteyen müşteriye daha yüksek fiyat verin. Logo Cloud'da yıllık fiyat 10 aylık fiyata eşittir. Bu yaklaşık yüzde 17 indirim eder ([Logo Cloud](https://logo.com.tr/en/product/logo-cloud), yayımlanmış). Aynı kuralla Karar paketinin aylık fiyatı 18.000 TL olur (hesap: 180.000 ÷ 10).

Ödeme biçimi için Logo'nun iki seçeneğini de sunabilirsiniz (çıkarım):

1. Pilot ve ilk yıl peşin ödenir. Yenileme daha ucuzdur.
2. Her yıl aynı ücret ödenir.

### 4.3. TL fiyatını her yıl güncelleyin

Türkiye'de enflasyon yüksektir. TÜİK'e göre Ekim 2026'da yıllık TÜFE yüzde 29,77'dir. Yurt içi üretici fiyatları yüzde 27,41 arttı. Bu sayıları Alomaliye aktarır ([TÜFE](https://www.alomaliye.com/2026/11/03/enflasyon-rakamlari-tufe-ekim-2026/), [Yİ-ÜFE](https://www.alomaliye.com/2026/11/03/enflasyon-rakamlari-yi-ufe-ekim-2026/)). Sabit TL fiyatı her yıl değer kaybeder. Sunucu ve yapay zekâ ise dolar ya da avroyla ödenir.

Ürün sahibi fiyatı şu kurallarla yönetir:

1. Ürün sahibi TL fiyat listesini her yıl 1 Ocak'ta yayımlar.
2. Listede yürürlük tarihi yazar.
3. Liste en az yıllık TÜFE kadar artar.
4. Ürün sahibi yıl ortasında yeni liste yayımlama hakkını saklı tutar.
5. Sözleşme "yenileme, yenileme günündeki liste fiyatıyla yapılır" der.
6. Çok yıllık sözleşmeye bir endeks maddesi yazılır.

Logo da yenilemeyi o günkü liste fiyatıyla yapar ([GO Wings listesi](https://cdn.logo.com.tr/files/logocomtr//Uploads/Documents/logo-go-wings-fiyat-listesi.pdf), yayımlanmış). Turkcell'in bir kurumsal paketi 12 ay içinde iki kez zamlandı ([Turkcell](https://www.turkcell.com.tr/paket-ve-tarifeler/konusma/bizbize-1000-paketi), arama özeti). Yani yılda iki zam Türkiye'de olağandır.

**Örnek (hesap).** TÜFE yüzde 29,77 kalırsa Karar paketi 2027'de yılda 233.586 TL olur. Formül: 180.000 × 1,2977.

### 4.4. Yapay zekâ kotası ve kredi

Yapay zekâ bugün üründe yoktur. Kota, özellik hazır olunca uygulanır.

1. Her pakete aylık bir yapay zekâ kotası koyun.
2. Kotayı yoğun kullanıma göre boyutlayın. Bu, tipik kullanımın yaklaşık 4 katıdır.
3. Kotanın maliyeti ayda 45 doları geçmesin. Bu yaklaşık 2.268 TL eder.
4. Kullanımı yönetici ekranında gösterin.
5. İtiraz turunu ve seçenek üretmeyi kotanın içinde tutun.
6. Ajanla yapılan uzun araştırmayı ayrı ücretlendirin.
7. Kotayı aşan kullanımı kredi olarak satın.
8. Krediyi maliyetin 3 ile 5 katına satın.
9. Her kurumda "yapay zekâ kapalı" seçeneğini koruyun.

Bu kural yapay zekâ tasarım notlarından gelir ([yapay zekâ tasarım notları](<../research_notes/Derin AI ve marka konumlandırma/ai_tasarimi.md>)). Rakiplerde de durum benzerdir. Perdoo paketlere kelime parçası kotası koyar ([Perdoo](https://www.perdoo.com/pricing), yayımlanmış).

**Kredi örneği (hesap).** 100 taslak ya da özet işlemi yaklaşık 7,5 dolar tutar. Türkçe metinle bu 11,25 dolar olur. 3 ile 5 katı 33,75 ile 56,25 dolardır. Bu yaklaşık 1.701 ile 2.835 TL eder.

### 4.5. Kurulum ve pilot paketi

Pilot, tek bir gerçek kararla yapılan sınırlı denemedir. Pilot yaklaşık 8 hafta sürer. Pilotun üç sabit çıktısı vardır ([Yazılım, hizmet ve rol modeli](<Yazılım hizmet ve rol modeli.md>)):

1. Geçiş kararı
2. Strateje devir raporu
3. Onaylanmış strateji belgesi

Pilot fiyatı için önerimiz şudur (varsayım):

> Pilot paketi = 2 aylık abonelik + kurulum ücreti
>
> Pilot paketi = 30.000 TL + 50.000 TL = 80.000 TL

Kurulum ücreti önceki raporun 50.000 TL'lik varsayımıdır. Kurulumda site açılışı, roller, ilk hazırlık oturumu ve ekip eğitimi vardır. Ürün sahibi ilk 5 pilotta kurulum saatini ölçer. Sonra fiyatı gerçek saate göre düzeltir.

Bu fiyatın çapaları şunlardır (hesap):

1. KOSGEB YÖNDE'nin bir yol haritası desteğinin 4 katıdır.
2. Logo Mind Insight Plan 3'ün ilk yıl fiyatına yakındır. O fiyat 82.300 TL'dir.
3. Bir danışmanlık başlangıç işinin yaklaşık 17'de 1'i ile 35'te 1'i arasındadır.

Hizmet geliriniz toplam gelirin yaklaşık yüzde 15'ini geçmemeli ([Orb](https://www.withorb.com/blog/saas-growth-margin-statistics), arama özeti). Temel senaryoda yıl 3'te yaklaşık 36 yeni müşteri gelir. 36 × 50.000 = 1,8 milyon TL kurulum geliri eder. Bu, toplam gelirin yaklaşık yüzde 11'idir (hesap). Sınırın altında kalır.

Pilot toplantılarını mümkünse iş ortağı yürütür. Ortak kendi danışmanlık ücretini müşteriden ayrıca alır. Bu ücret sizin gelir tablonuza girmez.

### 4.6. İş ortağı payı bir hipotezdir

Türk yazılım pazarı ortaklarla çalışır. Logo 1.000'den fazla ortakla 230.000'den fazla müşteriye satar ([Logo faaliyet raporu](https://cdn.logo.com.tr/Files/logocomtr/Uploads/Documents/Faaliyet-Raporu-31-Mart-2026.pdf), yayımlanmış). Bu, ortak başına yaklaşık 230 müşteri eder (hesap). Hiçbir Türk satıcı ortak payını yayımlamıyor. Paraşüt mali müşavirlere ücretsiz araç verir. Sayfasında komisyon yazmaz ([Paraşüt mali müşavir kanalı](https://www.parasut.com/mali-musavir-kanali), yayımlanmış).

Önerimiz şudur (varsayım, sınanacak):

1. İlk yıl yalnız yönlendirme ortaklığı kurun.
2. Ortaktan gelen müşterinin aboneliğinden ortağa yüzde 20 pay verin.
3. Ortağa yüzde 25'ten fazla pay vermeyin.
4. Sertifikalı ortağa çok müşterili danışman ekranını ücretsiz verin. Bu Paraşüt'ün yoludur.
5. Üç aylık gözden geçirmeyi ortak yürütür. Müşteri bu işi ortağa öder.

Üç aylık gözden geçirme danışmanın korkusuna da cevap verir. Danışman "teslimden sonra gelir biter" diye korkar. Bu iş her çeyrekte tekrar eder.

Modelde ortaktan gelen müşterilerin oranı ve pay birlikte kullanıldı:

> Kanal oranı = ortaktan gelen müşteri oranı × ortak payı

Temel senaryoda bu oran yüzde 50 × yüzde 20 = yüzde 10'dur. Pay yalnız ilk yıl ödenirse sonuç iyileşir.

### 4.7. Destek saati: piyasa ölçütü ayda 1 saate yakın

Gainsight, müşteri başarısı yazılımı satan bir şirkettir. Gainsight kendi müşteri verisini yayımladı ([Gainsight](https://www.gainsight.com/blog/gainsight-horizon-ai-labs-what-is-the-right-csm-to-customer-ratio/), satıcının kendi analizi). Yıllık sözleşmesi 10.000 doların altındaki müşteride bir müşteri başarı yöneticisi yaklaşık 144 müşteriye bakar. 10.000 ile 100.000 dolar arasında bu sayı 49'dur.

Karar paketi yılda yaklaşık 3.572 dolardır (hesap). Yani düşük temaslı banttadır. Bir kişi ayda yaklaşık 140 saat verimli çalışır (varsayım). Buna göre:

| Müşteri başına aylık destek | Bir kişinin bakabildiği müşteri |
|---|---|
| 1 saat | 140 |
| 2 saat | 70 |
| 3 saat | 47 |
| 4 saat | 35 |

Gainsight ölçütü ayda yaklaşık 1 saate denk gelir. Modelin temel senaryosu 2 saat kullanır. Çünkü ilk aylar pilot nedeniyle yoğundur. Pilottan sonra destek ayda yaklaşık 1 saate inmelidir (çıkarım). Toplantı yürütme işini ortak taşırsa bu mümkündür.

Ürün sahibi destek için şu kuralları uygular:

1. Her pakete müşteri başına ayda 2 saat destek koyun.
2. Sınırı aşan işi saat başına ücretlendirin.
3. Her destek saatini müşteri adına kaydedin.
4. Tek müşteriye özel geliştirme yapmayın.

## 5. Müşteri tutma: küçük sözleşmede ortanca yüzde 90

### 5.1. Kaynaklar ne diyor?

SaaS Capital, kredi veren bir yatırım şirketidir. Şirket her yıl 1.000'den fazla özel şirketle anket yapar. 2025 raporu Eylül 2025'te çıktı ([SaaS Capital, 2025 tutma ölçütleri](https://www.saas-capital.com/wp-content/uploads/2025/09/RB32WS1-2025-B2B-SaaS-Retention-Benchmarks.pdf), birincil araştırma).

| Yıllık sözleşme bandı | Net gelir tutma, ortanca | Brüt gelir tutma, ortanca | Net gelir tutma, alt çeyrek | Net gelir tutma, üst çeyrek |
|---|---|---|---|---|
| 12.000 doların altı | %98 | %90 | %90 | %106 |
| 12.000 ile 25.000 dolar | %103 | %91 | %98 | %115 |
| Bütün şirketler | %101 | %91 | Yok | Yok |

Aynı rapor sözleşme süresine göre de ölçer:

| Sözleşme | Net gelir tutma | Brüt gelir tutma |
|---|---|---|
| Çok yıllık | %103 | %94 |
| Yıllık | %101 | %90 |
| Aylık | %100 | %89 |

Rapor bir uyarı da yapar. Brüt gelir tutma en az yüzde 90 olmalıdır. Bu, ortalama performans için şarttır.

Benchmarkit'in 2026 raporu 2025'i daha zor gösterir. 342 şirkette brüt gelir tutma ortancası yüzde 84'e düştü. Önceki yıl yüzde 88'di. Müşteri kazanma maliyetinin geri ödemesi 16 aydır ([Aleph, Benchmarkit 2026](https://www.getaleph.com/blog/2026-saas-benchmarks-takeaways), raporun ortak yazarının özeti).

Bu ölçütlerin üç sınırı vardır:

1. SaaS Capital'in sözleşme bandı tablosu yıllık geliri 1 milyon doların altındaki şirketleri saymaz. Yeni bir şirket bu sınırın altındadır. Yeni şirketlerde tutma genellikle daha zayıftır (çıkarım).
2. Türkiye için SaaS tutma verisi hiçbir kaynakta bulunamadı.
3. Strateji yazılımına özel tutma verisi bulunamadı.

### 5.2. Karar Atlası hangi bantta?

Karar paketi yılda 180.000 TL'dir. Bu yaklaşık 3.572 dolar eder. Şirket paketi 5.953 ile 9.525 dolardır (hesap). İki paket de SaaS Capital'in "12.000 doların altı" bandındadır.

### 5.3. Modelde kullanılan kayıp oranları

| Senaryo | Yıllık müşteri kaybı | Dayanak | Tür |
|---|---|---|---|
| İyimser | %6 | Çok yıllık sözleşmede brüt gelir tutma yüzde 94 | Birincil araştırma |
| Temel | %10 | 12.000 doların altında brüt gelir tutma yüzde 90 | Birincil araştırma |
| Kötümser | %16 | 2025 brüt gelir tutma ortancası yüzde 84 | Üçüncü taraf |
| Ürüne özgü risk | %40 | Kaynak yok. Karar bitince müşteri ayrılırsa. | Varsayım |

Müşteri kaybı ile brüt gelir tutma aynı şey değildir. Ama tek fiyatlı modelde birbirine yakındır (çıkarım).

Önceki rapor kötümser senaryoda yüzde 40 kayıp kullandı. Bu oran bütün ölçütlerin çok dışındadır. Bu raporda yüzde 40 ayrı bir risk olarak kalır. Bu risk ürünün kendi yapısından gelir. Müşteri tek bir karar için gelir. Karar bitince ödeme nedeni de bitebilir. Etkisi 6.7 bölümündedir.

## 6. Senaryolar yeniden kuruldu: temel senaryo 115 müşteride başa baş olur

Model 16 Kasım 2026 Pazartesi günü bir Python betiğiyle yeniden çalıştırıldı. Bütün sonuçlar aşağıdaki formüllerden gelir.

### 6.1. Formüller

1. Fiyat, dolar = aylık TL fiyatı ÷ 50,3942
2. Ödeme ücreti = fiyat × 1,20 × kartla ödeyenlerin oranı × kart ücreti
3. Değişken maliyet = yapay zekâ + yedek ve e-posta + destek saati × saat ücreti
4. Katkı payı = fiyat × (1 − kanal oranı) − ödeme ücreti − değişken maliyet
5. Sabit gider = ekip + altyapı + araçlar + muhasebe
6. Aylık faaliyet sonucu = müşteri sayısı × katkı payı − sabit gider
7. Başa baş müşteri sayısı = sabit gider ÷ katkı payı
8. Brüt kâr marjı = (gelir − altyapı − araçlar − müşteri sayısı × (değişken maliyet + ödeme ücreti)) ÷ gelir
9. Müşteri ömrü, yıl = 1 ÷ yıllık kayıp oranı
10. Ömür boyu katkı = katkı payı × 12 × müşteri ömrü
11. Kabul edilebilir en yüksek kazanma maliyeti = ömür boyu katkı ÷ 3
12. Geri ödeme süresi, ay = kazanma maliyeti ÷ katkı payı
13. Kalan oran = 1 − kanal oranı − 1,20 × kart oranı × kart ücreti
14. Başa baş fiyatı = (sabit gider ÷ müşteri sayısı + değişken maliyet) ÷ kalan oran
15. Yıllık yeni müşteri = (yıl 3 müşterisi − yıl 1 müşterisi × (1 − kayıp)²) ÷ (2 − kayıp)

15. formül yıl 2 ve yıl 3 içindir. İki yılda eşit satış varsayar.

Formüllerle ilgili beş not daha vardır:

1. 1,20 çarpanı KDV'dir. Kart ücreti KDV dahil tutardan kesilir. Kart oranı, kartla ödeyen müşterilerin oranıdır.
2. Başa baş sayısı yukarı yuvarlanır. Örneğin 114,3 müşteri 115 olur.
3. Gelir yıl sonundaki müşteri sayısıyla hesaplanır. Yani yıllık tekrarlayan gelir bir yıl sonu fotoğrafıdır.
4. Ortak payı satış gideridir. Bu yüzden brüt kâr marjına girmez. Ama katkı payına girer.
5. Destek saati değişken maliyete girer. Yıl 3 ekibinde de bir destek uzmanı vardır. Yani destek kısmen iki kez sayılır. Bu bilinçli bir ihtiyattır.

### 6.2. Girdiler

Ekip gideri üç senaryoda aynıdır. Böylece senaryolar yalnız pazar tarafını karşılaştırır. Ekip gideri 6.6 bölümünde ayrıca değiştirilir.

| Girdi | Kötümser | Temel | İyimser | Tür |
|---|---|---|---|---|
| Aylık fiyat | 9.000 TL, 178,59 dolar | 15.000 TL, 297,65 dolar | 25.000 TL, 496,09 dolar | Varsayım. 9. bölümdeki görüşme fiyatlarıdır. |
| Kanal oranı | %60 × %25 = %15 | %50 × %20 = %10 | %40 × %20 = %8 | Varsayım |
| Kartla ödeyenler ve kart ücreti | %100 ve %3,56 | %50 ve %2,49 | %20 ve %2,19 | Oran varsayım. Ücret üçüncü taraf. |
| Yapay zekâ, aylık | 45 dolar | 11 dolar | 7,6 dolar | Hesap |
| Yedek ve e-posta, aylık | 1,50 dolar | 1,00 dolar | 0,70 dolar | Tahmin |
| Aylık destek saati | 4 | 2 | 1 | Varsayım |
| Destek saat ücreti | 19,41 dolar | 12,08 dolar | 10,13 dolar | Hesap: rol maliyeti ÷ 140 saat |
| Yıllık müşteri kaybı | %16 | %10 | %6 | Birincil araştırma ve üçüncü taraf |
| Yıl 1 sonunda müşteri | 5 | 15 | 30 | Varsayım |
| Yıl 3 sonunda müşteri | 25 | 80 | 200 | Varsayım |
| Ekip, yıl 1 | 10.000 dolar | 10.000 dolar | 10.000 dolar | Tahmin |
| Ekip, yıl 3 | 25.000 dolar | 25.000 dolar | 25.000 dolar | Tahmin |
| Altyapı, yıl 1 | 206 dolar | 206 dolar | 206 dolar | Hesap |
| Altyapı, yıl 3 | 527 dolar | 527 dolar | 993 dolar | Hesap |
| Araçlar, yıl 1 ve yıl 3 | 60 ve 150 dolar | 60 ve 150 dolar | 60 ve 150 dolar | Tahmin |
| Muhasebe ve yönetim | 300 dolar | 300 dolar | 300 dolar | Tahmin |

Destek saat ücreti üç rolden gelir. Kötümser senaryo kurumsal müşteri yöneticisini kullanır. Temel senaryo kurumsal destek uzmanını kullanır. İyimser senaryo müşteri destek uzmanını kullanır.

Müşteri sayıları önceki raporla aynıdır. Böylece iki rapor karşılaştırılabilir. Bu sayıların ne kadar satış istediği 6.5 bölümündedir.

### 6.3. Sonuçlar

| Sonuç | Kötümser | Temel | İyimser |
|---|---|---|---|
| Ödeme ücreti, müşteri başına aylık | 7,63 dolar | 4,45 dolar | 2,61 dolar |
| Değişken maliyet, destek dahil | 124,13 dolar | 36,16 dolar | 18,43 dolar |
| Katkı payı, müşteri başına aylık | 20,05 dolar, 1.010 TL | 227,28 dolar, 11.454 TL | 435,37 dolar, 21.940 TL |
| Yıl 1 aylık sabit gider | 10.566 dolar | 10.566 dolar | 10.566 dolar |
| Yıl 1 yıllık tekrarlayan gelir | 0,54 milyon TL | 2,70 milyon TL | 9,00 milyon TL |
| Yıl 1 brüt kâr marjı | %−3,6 | %80,4 | %94,0 |
| Yıl 1 aylık faaliyet sonucu | −10.466 dolar, −527.414 TL | −7.157 dolar, −360.658 TL | +2.495 dolar, +125.732 TL |
| Yıl 1 başa baş müşteri sayısı | 528 | 47 | 25 |
| Yıl 3 aylık sabit gider | 25.977 dolar | 25.977 dolar | 26.443 dolar |
| Yıl 3 yıllık tekrarlayan gelir | 2,70 milyon TL | 14,40 milyon TL | 60,00 milyon TL |
| Yıl 3 brüt kâr marjı | %11,1 | %83,5 | %94,6 |
| Yıl 3 aylık faaliyet sonucu | −25.476 dolar, −1.283.836 TL | −7.794 dolar, −392.787 TL | +60.630 dolar, +3.055.408 TL |
| Yıl 3 başa baş müşteri sayısı | 1.296 | 115 | 61 |
| Müşteri ömrü | 6,25 yıl | 10 yıl | 16,7 yıl |
| Ömür boyu katkı | 1.503 dolar | 27.274 dolar | 87.073 dolar |
| En yüksek kazanma maliyeti | 501 dolar | 9.091 dolar | 29.024 dolar |
| Geri ödeme, kazanma maliyeti bir yıllık fiyata eşitse | 107 ay | 15,7 ay | 13,7 ay |
| Yıl 2 ve yıl 3'te gereken yıllık yeni müşteri | 11,7 | 35,7 | 89,4 |

Bütün sonuçlar hesaptır. Girdilerin çoğu varsayımdır.

**Sonuçları şöyle okuyun (çıkarım):**

1. Kötümser senaryo hiçbir zaman başa baş olmaz. 9.000 TL'lik fiyat, 4 saatlik destek ve yoğun yapay zekâ katkı payını neredeyse sıfırlar.
2. Temel senaryo yıl 1'de ve yıl 3'te zarar eder. Yıl 3'te 80 müşteri vardır. Başa baş için 115 müşteri gerekir.
3. İyimser senaryo yıl 1'de bile kâr eder. Ama yılda yaklaşık 89 yeni müşteri ister. Bu küçük bir ekip için çok yüksek bir satış hızıdır.
4. Brüt kâr marjı temel senaryoda yüzde 80'in üstündedir. Benchmarkit'in yazılım ortancası yüzde 80'dir ([Aleph](https://www.getaleph.com/blog/2026-saas-benchmarks-takeaways)). Yani ürünün kendisi kârlıdır. Zararı sabit ekip gideri doğurur.
5. Temel senaryoda geri ödeme süresi 15,7 aydır. Benchmarkit ortancası 16 aydır. Bu süre piyasa ortasındadır.

### 6.4. Temel senaryoyu adım adım okuyun

1. Fiyat = 15.000 ÷ 50,3942 = 297,65 dolar.
2. Ortak payından sonra kalan = 297,65 × 0,90 = 267,89 dolar.
3. Ödeme ücreti = 297,65 × 1,20 × 0,50 × 0,0249 = 4,45 dolar.
4. Destek = 2 saat × 12,08 = 24,16 dolar.
5. Değişken maliyet = 11 + 1 + 24,16 = 36,16 dolar.
6. Katkı payı = 267,89 − 4,45 − 36,16 = 227,28 dolar. Bu yaklaşık 11.454 TL eder.
7. Yıl 1 başa baş = 10.566 ÷ 227,28 = 46,5. Yani 47 müşteri.
8. Yıl 3 başa baş = 25.977 ÷ 227,28 = 114,3. Yani 115 müşteri.
9. Yıl 3'te müşteri sayısı 80'dir. 80, 115'in altındadır.
10. Bu yüzden temel senaryo yıl 3'te ayda 7.794 dolar zarar eder.

### 6.5. Asıl darboğaz satış hızıdır

**Başa baş fiyatı.** Müşteri sayısı azsa fiyat yüksek olmalıdır. Aşağıdaki tablo temel maliyetlerle hesaplandı.

| Müşteri sayısı | Gider yılı | Başa baş aylık fiyat |
|---|---|---|
| 15 | Yıl 1 | 42.166 TL |
| 80 | Yıl 3 | 20.547 TL |
| 115 | Yıl 3 | 14.920 TL |
| 200 | Yıl 3 | 9.454 TL |

15.000 TL'lik fiyat ancak yaklaşık 115 müşteride gideri karşılar.

**Satış hızı.** Temel senaryo yıl 2 ve yıl 3'te yılda yaklaşık 36 yeni müşteri ister. Bu ayda 3 müşteri eder. Başa başa yıl 3'te ulaşmak için yılda yaklaşık 54 yeni müşteri gerekir. Bu ayda 4 ile 5 müşteri eder (hesap).

Bir ICP notu örnek bir kapasite hesabı verir. Bir kurucu ayda 20 nitelikli görüşme yapar. Görüşmelerin yüzde 15'i satışa döner. Bu yılda yaklaşık 36 müşteri eder ([ICP yöntemi notları](<../research_notes/Derin ICP ve persona analizi/icp_yontemi_ve_buyukluk.md>)). Bu girdiler örnektir, ölçülmedi. Yine de sonuç açıktır. Yılda 54 müşteri için tek kişilik satış yetmez. İkinci bir satışçı ya da etkin bir ortak kanalı gerekir (çıkarım).

**Pazar büyüklüğü darboğaz değildir.** Türkiye'de 2025'te 50 ile 249 çalışanlı 34.072 şirket vardı ([TÜİK, bülten 58132](https://veriportali.tuik.gov.tr/tr/press/58132), resmî). 250 ile 499 çalışanlı şirket sayısı yaklaşık 3.960'tır. Bu sayı SGK işyeri verisinden tahmin edildi ([firmografi notları](<../research_notes/Derin ICP ve persona analizi/firmografi.md>), tahmin). Yani 50 ile 499 çalışan bandında yaklaşık 38.000 şirket vardır. 115 müşteri bu şirketlerin yaklaşık yüzde 0,3'üdür (hesap). Bütün bu şirketler alıcı değildir. Önünde büyük ve sınırlı bir karar olan aile şirketi daha azdır. Bu oran bilinmiyor.

**Yıl 1'in nakit ihtiyacı (hesap).** Müşteri sayısı yıl 1'de 0'dan 15'e düz bir çizgiyle artsın. Yıl ortalaması 7,5 müşteri olur. Bu durumda:

> Yıl 1 zararı = 12 × (10.566 − 7,5 × 227,28) = 106.337 dolar

Bu yaklaşık 5,36 milyon TL eder. Bir kerelik kuruluş giderleriyle toplam yaklaşık 5,58 milyon TL olur. Kurucunun ücreti bu hesapta yoktur.

### 6.6. Duyarlılık: dört girdi sonucu nasıl değiştiriyor?

Bu tablolarda yalnız bir girdi değişir. Öteki girdiler temel senaryodadır.

**Ekip gideri.** Başa baş noktasını en çok bu girdi değiştirir.

| Yıl | Aylık ekip gideri | Aylık sabit gider | Başa baş müşteri sayısı |
|---|---|---|---|
| Yıl 1 | 8.300 dolar | 8.866 dolar | 39 |
| Yıl 1 | 10.000 dolar | 10.566 dolar | 47 |
| Yıl 1 | 11.850 dolar | 12.416 dolar | 55 |
| Yıl 3 | 17.000 dolar | 17.977 dolar | 80 |
| Yıl 3 | 25.000 dolar | 25.977 dolar | 115 |
| Yıl 3 | 35.000 dolar | 35.977 dolar | 159 |

Yalın 5,5 kişilik ekiple temel senaryo yıl 3'te başa baş olur. Çünkü yıl 3'te 80 müşteri vardır.

**Fiyat.**

| Aylık fiyat | Yıllık fiyat | Katkı payı, aylık | Başa baş, yıl 1 | Başa baş, yıl 3 |
|---|---|---|---|---|
| 9.000 TL | 108.000 TL | 6.143 TL | 87 | 214 |
| 12.000 TL | 144.000 TL | 8.799 TL | 61 | 149 |
| 15.000 TL | 180.000 TL | 11.454 TL | 47 | 115 |
| 20.000 TL | 240.000 TL | 15.879 TL | 34 | 83 |
| 25.000 TL | 300.000 TL | 20.304 TL | 27 | 65 |

Fiyat 15.000 TL'den 9.000 TL'ye inerse gereken müşteri yaklaşık iki katına çıkar.

**Yıllık müşteri kaybı.** Kayıp, başa baş sayısını değiştirmez. Ama gereken satış hızını ve müşterinin değerini değiştirir.

| Yıllık kayıp | Müşteri ömrü | Ömür boyu katkı | En yüksek kazanma maliyeti | 115 müşteriyi korumak için yıllık yeni satış | Yıl 3'te 115'e varmak için yıllık yeni satış |
|---|---|---|---|---|---|
| %6 | 16,7 yıl | 45.457 dolar | 15.152 dolar | 6,9 | 52,4 |
| %10 | 10 yıl | 27.274 dolar | 9.091 dolar | 11,5 | 54,1 |
| %16 | 6,25 yıl | 17.046 dolar | 5.682 dolar | 18,4 | 56,7 |
| %25 | 4 yıl | 10.910 dolar | 3.637 dolar | 28,8 | 60,9 |
| %40 | 2,5 yıl | 6.819 dolar | 2.273 dolar | 46,0 | 68,5 |

10 yıllık müşteri ömrü uzun bir varsayımdır. Yeni bir ürün için bunu iyimser okuyun.

**Destek saati.**

| Aylık destek | Katkı payı, saat 12,08 dolar | Başa baş, yıl 3 | Katkı payı, saat 19,41 dolar | Başa baş, yıl 3 | Bir kişinin bakabildiği müşteri |
|---|---|---|---|---|---|
| 1 saat | 239,4 dolar | 109 | 232,0 dolar | 112 | 140 |
| 2 saat | 227,3 dolar | 115 | 212,6 dolar | 123 | 70 |
| 3 saat | 215,2 dolar | 121 | 193,2 dolar | 135 | 47 |
| 4 saat | 203,1 dolar | 128 | 173,8 dolar | 150 | 35 |

Destek saati tek başına modeli bozmaz. Ama 4 saat ve pahalı saat birleşirse eşik 150 müşteriye çıkar. Ayrıca 4 saatte bir kişi yalnız 35 müşteriye bakar. O zaman ekibe yeni kişi gerekir.

**Sıralama (çıkarım).** Başa baş sayısını en çok ekip gideri ve fiyat değiştirir. Müşteri kaybı ise gereken satış hızını belirler. Destek saati ekip büyüklüğünü belirler.

### 6.7. Ürüne özgü risk: karar bitince müşteri ayrılırsa

Bu risk bir varsayımdır. Kaynakta bir karşılığı yoktur. Ama ürünün yapısından gelir. Müşteri tek bir büyük karar için gelir. Karar bitince ödeme nedeni de bitebilir.

Temel senaryoda kayıp yüzde 40 olursa şunlar olur (hesap):

1. Müşteri ömrü 2,5 yıla düşer.
2. Ömür boyu katkı 6.819 dolara düşer. Bu yaklaşık 343.614 TL eder.
3. Kabul edilebilir en yüksek kazanma maliyeti 2.273 dolardır. Bu bir yıllık fiyattan düşüktür.
4. 115 müşteriyi korumak için her yıl 46 yeni müşteri gerekir.

Bu riski düşürmek için dört yol vardır (çıkarım):

1. Kararı kapanan müşteriye İzleme paketini önerin.
2. İş ortağı üç aylık gözden geçirmeyi yürütsün.
3. İkinci kararı açmayı kolaylaştırın. Örneğin ilk kararın kanıtları yeni plana taşınsın.
4. Çok yıllık sözleşme önerin. Çok yıllık sözleşmede brüt gelir tutma yüzde 94'tür.

Bu konu geliştirme karar notlarında da açık bir sorudur. Soru şudur: "Müşteri ilk karardan sonra hangi somut iş için geri döner?" ([geliştirme karar notları](../docs/gelistirme-karar-notlari.md)). Ürün sahibi bu soruyu pilotlarda ölçer.

## 7. Müşteri için: ürün büyük kararda kendini öder

Bu bölüm müşterinin hesabıdır. Soru şudur: Müşteri bu üründen ölçülebilir para kazanır mı?

### 7.1. Kanıtlar ve doğrulama düzeyi

| Kanıt | Ne buldu? | Doğrulama düzeyi |
|---|---|---|
| Lovallo ve Sibony, McKinsey Quarterly, Mart 2010 | 1.048 büyük karar beş yıl incelendi. Süreç, analizden altı kat önemli çıktı. Getiri verisi 673 kararda vardı. Süreç en alt çeyrekten en üst çeyreğe çıkınca getiri 6,9 yüzde puan arttı. Analiz için bu fark 5,3 puandı. | Birincil araştırma. Sayfa 15 Kasım 2026 Pazar günü okundu. 16 Kasım 2026 Pazartesi günü sayfa açılmadı. Sayılar McKinsey sayfalarının arama özetleriyle yeniden doğrulandı ([McKinsey](https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/the-case-for-behavioral-strategy)). |
| Kahneman, Lovallo ve Sibony, Harvard Business Review, Haziran 2011 | Önyargı azalınca getiri 7 puana kadar yükseldi. Bu, aynı çalışmanın yuvarlanmış anlatımıdır. | Birincil metnin kopyası ([HBR kopyası](https://eclass.aueb.gr/modules/document/file.php/DEOS282/Papers%20%26%20Studies/Kahneman%20Lovallo%20Sibony%20Before%20You%20Make%20That%20Big%20Decision%20HBR2011%202page.pdf)) |
| PMI, 2020 raporu | Proje yatırımlarının yüzde 11,4'ü kötü proje performansı yüzünden boşa gitti. 2018'de bu oran yüzde 9,9'du. | Birincil araştırma ([PMI 2020](https://www.pmi.org/learning/thought-leadership/pulse/pulse-of-the-profession-2020), [PMI 2018](https://www.pmi.org/learning/thought-leadership/pulse/pulse-of-the-profession-2018)). 2025 için yüzde 11,4 diyen yazı yanlış aktarıyor görünür. |
| Berkeley Haas, Kenya deneyi | 640 girişimciyle rastgele deney yapıldı. Yapay zekâ danışmanı zayıf girişimcilerin gelirini yaklaşık yüzde 8 düşürdü. | Üçüncü taraf, üniversitenin haber sayfası ([Berkeley Haas](https://newsroom.haas.berkeley.edu/research/gen-ai-experiment-shows-mixed-results-in-helping-small-businesses-grow/)) |
| PwC, 12. aile şirketleri araştırması | Aile şirketlerinin yalnız yüzde 25'i son yıl çift haneli büyüdü. İki yıl önce bu oran yüzde 43'tü. Yalnız yüzde 22'sinin bütün kilit roller için hazır bir devir planı var. | Üçüncü taraf ([Ekonomim](https://www.ekonomim.com/is-dunyasi/aile-sirketlerinde-buyume-sert-geriledi-haberi-858244)) |

Bu kanıtların dört sınırı vardır:

1. McKinsey verisi büyük şirketlerden gelir.
2. Bulgular ilişki gösterir, neden göstermez.
3. Veri kısmen yöneticilerin kendi beyanıdır.
4. Strateji yazılımının getirisini ölçen bir çalışma bulunamadı.

Türkiye'de konkordato ve iflas sayıları 2025'te rekor kırdı ([Sözcü](https://www.sozcu.com.tr/2025-yilinda-konkordato-ve-iflaslar-rekor-kirdi-p281573), üçüncü taraf). Ama hiçbir kaynak bu kayıpları karar sürecine bağlamıyor. Bu yüzden bu sayıları yalnız bağlam olarak kullanın. Satış belgesinde zor durumdaki bir şirketin adını anmayın.

Bu yüzden satış belgesinde yüzde getiri sözü vermeyin. Bunun yerine ölçülmüş bir değer raporu sözü verin.

### 7.2. Eşik formülü

Formül şudur (hesap):

1. Ek değer = kararın parası × getiri artışı
2. Kendini ödeme oranı = ek değer ÷ yıllık ürün maliyeti
3. En küçük karar büyüklüğü = yıllık ürün maliyeti ÷ getiri artışı

**Örnek.** Bir aile şirketi 50 milyon TL'lik bir yatırımı değerlendiriyor. Ürün kararın getirisini yalnız 1 puan artırıyor. Bu, McKinsey'in bulduğu farkın yaklaşık yedide biridir.

1. Ek değer = 50.000.000 × 0,01 = 500.000 TL.
2. Yıllık ürün maliyeti = 180.000 TL.
3. Kendini ödeme oranı = 500.000 ÷ 180.000 = 2,8 kat.

**Eşik tablosu (hesap).** Her hücre, ürünün kendini ödediği en küçük karar büyüklüğüdür. İlk yıl maliyeti abonelik ve 50.000 TL kurulumdur. Bu toplam 230.000 TL eder.

| Getiri artışı | Yalnız abonelik, Kasım 2026 | Abonelik ve kurulum, Kasım 2026 | Yalnız abonelik, Kasım 2027 | Abonelik ve kurulum, Kasım 2027 |
|---|---|---|---|---|
| 0,5 puan | 36 milyon TL | 46 milyon TL | 46,7 milyon TL | 59,7 milyon TL |
| 1 puan | 18 milyon TL | 23 milyon TL | 23,4 milyon TL | 29,8 milyon TL |
| 2 puan | 9 milyon TL | 11,5 milyon TL | 11,7 milyon TL | 14,9 milyon TL |

Kasım 2027 sütunları enflasyon yüzde 29,77 kalırsa geçerlidir. Müşteri ekibinin harcadığı zaman bu hesapta yoktur. Bu zaman bilinmiyor.

### 7.3. Eşiği enflasyonla güncelleyin

Önceki rapor eşiği 20 ile 30 milyon TL olarak yazdı. Bu eşik Kasım 2026 için hâlâ geçerlidir. Ama eşik TL ile yazılmıştır. TL her yıl değer kaybeder.

Ekim 2026'da yıllık TÜFE yüzde 29,77'dir ([Alomaliye](https://www.alomaliye.com/2026/11/03/enflasyon-rakamlari-tufe-ekim-2026/), TÜİK verisini aktarır). Enflasyon böyle kalırsa eşik Kasım 2027'de şöyle olur (hesap):

> 20 milyon TL × 1,2977 = 25,95 milyon TL
>
> 30 milyon TL × 1,2977 = 38,93 milyon TL

Bu güncellemeyi iki yolla yapabilirsiniz:

1. Ürün sahibi eşiği her Ocak'ta fiyat listesiyle birlikte günceller.
2. Satış ekibi eşiği oran olarak sorar.

İkinci yol enflasyondan etkilenmez. 1 puanlık artışta eşik, yıllık ürün maliyetinin 100 katıdır (hesap: 18.000.000 ÷ 180.000). Satış sorusu şöyle olur: "Kararın parası yıllık ürün ücretinin en az 100 katı mı?"

**İkinci değer kaynağı (hesap).** Ürün boşa giden harcamayı azaltabilir. PMI'ın yüzde 11,4'lük kaybını kullanalım. Program 50 milyon TL olsun. Ürün bu kaybın onda birini önlesin.

> Kazanç = 50.000.000 × 0,114 × 0,10 = 570.000 TL

Bu, bir yıllık aboneliğin yaklaşık 3,2 katıdır. Bu bir örnektir, söz değildir.

### 7.4. Değeri her müşteride ölçün

Değeri iddia etmeyin, kayıtla gösterin. Ürün bu kayıtları zaten tutar. Aşağıdaki adımları izleyin:

1. Stratej, hazırlık kapısında kararın parasını kaydeder.
2. Stratej, "Mevcut düzen sürerse" satırının maliyetini, faydasını ve riskini yazar.
3. Karar sahibi seçilen yolun beklenen değerini kaydeder.
4. Karar sahibi kaynak izinlerini açar.
5. Ekip üyeleri gerçek harcamayı kaynak hareketi olarak girer.
6. Karar sahibi gözden geçirmede harcamayı izinle karşılaştırır.
7. Ürün bu kayıtlardan bir değer raporu üretir.
8. İş ortağı değer raporunu üç aylık gözden geçirmede müşteriyle okur.

2. adım geliştirme karar notlarındaki 1. nottan gelir ([geliştirme karar notları](../docs/gelistirme-karar-notlari.md)). Bu not henüz koda işlenmedi.

Değer raporunda üç sayı olsun (öneri):

1. İzin olmadığı için durdurulan harcama
2. Seçilen yol ile mevcut düzen arasındaki beklenen fark
3. Aşama tarihlerindeki sapma

Bu rapor yenileme görüşmesinin ana belgesidir. Müşteri parayı nerede koruduğunu kendi kaydında görür.

## 8. Açık kaynak modeli: gelir koddan değil, hizmetten gelir

Depo public olacak. Bu bir ürün kararıdır. Kod herkese açık olunca müşteri koda para ödemez. Müşteri şunlara para öder:

1. Barındırılan hizmet
2. Destek ve çalışma güvencesi
3. Yapay zekâ kotası
4. Kurulum ve pilot paketi
5. İş ortağı programı

### 8.1. Gerçek örnekler

| Şirket | Model | Ne oldu? | Tür |
|---|---|---|---|
| Frappe | Kod açık. Önce hizmet, sonra barındırma. | Yaklaşık 10 yıl kurulum, eğitim ve destek sattı. Kurucusu, şirketin ilk kez 2024 ile 2025 mali yılında ciddi kâra geçtiğini yazdı. Bu 10 yıldan uzun sürdü. | Yayımlanmış ([Frappe, kârlılık yazısı](https://frappe.io/blog/culture/the-path-to-profitability), [Frappe, iş modeli](https://frappe.io/blog/erpnext-stories/business-model-evolution-at-frappe)) |
| Odoo | Açık çekirdek. Temel sürüm açık, kurumsal sürüm kapalı ve ücretli. | 2025 geliri 620 milyon avro. 2025'te 36 milyon avro muhasebe zararı. Kullanıcıların yaklaşık yüzde 80'i ücretsiz planda. | Üçüncü taraf ([Brussels Times](https://www.brusselstimes.com/2332306/odoo-announces-e10-billion-valuation-and-a-partial-price-increase)) |
| GitLab | Açık çekirdek | 31 Ocak 2026 Cumartesi günü biten mali yılda gelir 955,2 milyon dolar. Büyüme yüzde 26. Net gelir tutma yüzde 118. | Üçüncü taraf ([BusinessWire](https://www.businesswire.com/news/home/20260303140705/en)) |
| Plausible | AGPL lisansı. Gelir çoğunlukla barındırmadan. | Haziran 2022'de yıllık 1 milyon dolar tekrarlayan gelire ulaştı. | Arama özeti ([Plausible](https://ingest.plausible.io/blog/open-source-saas)) |
| Cal.com | AGPL'den kapalı lisansa geçti. | Nisan 2026'da üretim kodunu kapattı. Gerekçe yapay zekâ kaynaklı güvenlik riskiydi. Topluluk için MIT lisanslı ayrı bir sürüm çıkardı. | Üçüncü taraf ([The Register](https://www.theregister.com/2026/04/26/opinion_column/), [It's FOSS](https://itsfoss.com/news/cal-com-goes-proprietary/)) |
| Elastic | Apache'den kısıtlı lisansa, sonra AGPL'ye döndü. | Ocak 2021'de Apache 2.0'ı bıraktı. 29 Ağustos 2024 Perşembe günü AGPL'yi seçenek olarak geri ekledi. | Üçüncü taraf ([BusinessWire](https://www.businesswire.com/news/home/20240829537786/en/Elastic-Announces-Open-Source-License-for-Elasticsearch-and-Kibana-Source-Code)) |
| Sentry | FSL lisansı | Her sürüm 2 yıl sonra Apache 2.0 ya da MIT olur. Bu 2 yılda açık kaynak sayılmaz. | Yayımlanmış ([FSL](https://fsl.software/), [Sentry lisansı](https://open.sentry.io/licensing)) |

Bu örneklerden üç ders çıkar (çıkarım):

1. Açık kaynak yolu yavaştır. Frappe kâra 10 yıldan uzun sürede geçti.
2. Ücretsiz kullanıcı çoktur. Odoo'da kullanıcıların yaklaşık beşte biri ödüyor.
3. Lisans sonradan değişebilir. Ama değiştirmek güven kaybettirir. Elastic bu yüzden AGPL'ye döndü.

### 8.2. Lisans seçenekleri

Lisans, kodu başkalarının hangi şartla kullanabileceğini söyleyen hukuki metindir. Lisansı ürün sahibi seçer. Bu rapor lisans seçmez. Lisans henüz seçilmedi.

| Lisans | Başkası barındırabilir mi? | Açık kaynak sayılır mı? | Size etkisi |
|---|---|---|---|
| MIT ya da Apache 2.0 | Evet, şartsız. | Evet | En geniş yayılma. Rakip barındırıcıyı durdurmaz. |
| GPL-3.0 | Evet. İnternetten sunan değişikliğini paylaşmak zorunda değil. | Evet | Barındırıcıyı durdurmaz. |
| AGPL-3.0 | Evet. Ama değişikliğini yayımlamak zorunda. | Evet | Kapalı kopyayı caydırır. |
| FSL ya da BSL | 2 ile 4 yıl hayır. Sonra evet. | Bu sürede hayır | Barındırıcıyı durdurur. Açık kaynak tercihinizle çelişir. |
| Açık çekirdek | Çekirdek için evet. Ek modüller için hayır. | Yalnız çekirdek | Ek modüllerden gelir alırsınız. |

**Önerimiz.** Açık kaynak tercihinize en çok AGPL-3.0 uyar. AGPL-3.0 açık kaynak sayılır. Aynı zamanda kapalı kopyayı caydırır. Plausible bu lisansla barındırmadan gelir alıyor. Elastic de açık kaynağa bu lisansla döndü.

Cal.com örneği bir uyarıdır. Rekabet ya da güvenlik baskısı artınca AGPL yetmeyebilir. Ürün sahibi bu riski bilerek seçmelidir.

Ürün sahibi lisans için şu adımları izler:

1. Ürün sahibi lisansı ilk dış katkıdan önce seçer.
2. Ayrı bir ticari lisans da istenirse dış katkı verenler katkı sözleşmesi imzalar.
3. Avukat Frappe Framework'ün lisansını doğrular. Bu oturumda yeniden okunmadı.
4. Avukat ERPNext kodu kullanılırsa GPL uyumunu inceler.
5. Avukat AGPL'nin Türkiye'de uygulanmasını inceler.

Asıl risk kodu kopyalayan aile şirketi değildir. Aile şirketinin çoğu zaman bilgi işlem ekibi yoktur. Asıl risk, kodu alıp kendi müşterilerine barındıran bir bilgi işlem firmasıdır (çıkarım).

## 9. Ödeme isteği görüşmeleri: 18 Aralık 2026 Cuma gününe kadar 15 görüşme

Ödeme isteği, alıcının bir ürün için ödemeye razı olduğu en yüksek fiyattır. Görüşme planı 18 Aralık 2026 Cuma gününe kadar 15 görüşme ister. Bu sayı resmî bir fiyat araştırması için azdır.

### 9.1. Yöntem neden küçük örneklemle sınırlıdır?

İki yöntem kullanılır:

1. **Van Westendorp yöntemi.** Dört fiyat sorusuyla kabul edilebilir fiyat aralığını bulur.
2. **Gabor-Granger yöntemi.** Belirli fiyatlarda satın alma olasılığını sorar.

Satıcı rehberleri her alıcı grubu için 200 ile 500 kişi önerir. Bu bilgi üçüncü taraftır ([Prospeo](https://prospeo.io/s/go-to-market-pricing-strategy), [CleverX](https://cleverx.com/blog/enterprise-b2b-willingness-to-pay-setting-and-defending-price)). Bazı bloglar 15 ile 20 görüşmeyi yeterli sayar ([Monetizely](https://www.getmonetizely.com/faqs/sample-sizes-for-reliable-pricing-research), üçüncü taraf). Hakemli bir en az sayı bulunamadı. Seçenekleri karşılaştıran yöntemin adı conjoint'tir. Bu yöntem en az 300 kişi ister ([Sawtooth](https://www.sawtoothsoftware.com/resources/blog/posts/sample-size-rules-of-thumb), yayımlanmış). 15 görüşmeyle conjoint yapılamaz.

Bu yüzden 15 görüşme bir yön gösterir, kesin fiyat vermez. En güçlü kanıt imzalı ücretli pilottur (çıkarım).

### 9.2. Görüşme takvimi

Ürün sahibi görüşmeleri yürütür. Takvim önerimiz şudur:

| Hafta | Görüşme sayısı |
|---|---|
| 16 Kasım 2026 Pazartesi günü başlayan hafta | 3 |
| 23 Kasım 2026 Pazartesi günü başlayan hafta | 3 |
| 30 Kasım 2026 Pazartesi günü başlayan hafta | 3 |
| 7 Aralık 2026 Pazartesi günü başlayan hafta | 3 |
| 14 Aralık 2026 Pazartesi günü başlayan hafta | 3 |

Son görüşme 18 Aralık 2026 Cuma günü biter. 15 görüşmenin yaklaşık 10'u parayı ödeyen kişiyle olsun. Yaklaşık 5'i satın almayı yürüten kişiyle olsun (öneri). Ürün sahibi her beş görüşmeden sonra sonuç tablosunu günceller.

### 9.3. Yedi adımlı protokol

Ürün sahibi her görüşmede bu adımları sırayla izler:

1. **Doğru kişiyi seçin.** Parayı ödeyen kişi genellikle ikinci kuşak genel müdür ya da yönetim kurulu üyesidir. Satın almayı yürüten kişi kurumsal gelişim ya da mali işler müdürüdür. İki grubun cevaplarını ayrı yazın.
2. **Önce değeri sorun.** Kararın parasını sorun. "Son strateji çalışmanız size kaça mal oldu?" diye sorun. Son kötü kararın maliyetini sorun. Sayıları not edin.
3. **Van Westendorp'un dört sorusunu sorun.** Soruları bir etkin kararın yıllık ücreti için sorun. Aylık kişi başı fiyat sormayın.
4. **Üç fiyatı sırayla sorun.** Önce yılda 300.000 TL'yi sorun. Sonra 180.000 TL'yi sorun. En son 108.000 TL'yi sorun. Her fiyatta 5 basamaklı satın alma niyetini not edin.
5. **Pilot teklif edin.** 8 haftalık pilotu belli bir fiyatla teklif edin. Niyet mektubu ya da imzalı sipariş isteyin.
6. **Sonucu sayıyla yazın.** Örneğin "10 ödeyiciden 6'sı 180.000 TL'yi kabul edilebilir buldu." deyin. Kesişim noktası ya da eğri hesaplamayın.
7. **Logo fiyatlarını en son gösterin.** Logo fiyatlarını fiyat sorularından sonra konuşun. Önce gösterirseniz cevapları etkiler. Örneğin Mind Navigator ve j-HR fiyatları böyledir.

Üç fiyat aylık olarak 9.000, 15.000 ve 25.000 TL eder. Önceki rapor aynı fiyatları aylık sordu. Bu rapor yıllık sorar. Çünkü önerilen paket yıllık ve karar başınadır.

Van Westendorp'un dört sorusu şunlardır:

1. Hangi yıllık fiyatta bu ürünü kalitesinden şüphelenecek kadar ucuz bulursunuz?
2. Hangi yıllık fiyatta ucuz ama uygun bulursunuz?
3. Hangi yıllık fiyatta pahalı bulur ama yine de düşünürsünüz?
4. Hangi yıllık fiyatta almayı düşünmeyecek kadar pahalı bulursunuz?

### 9.4. Sonuca göre ne yapılır?

Bu kurallar önerimizdir. Eşikler ölçülmedi.

| Görüşme sonucu | Fiyat kararı |
|---|---|
| Ödeyicilerin yarısı ya da fazlası 180.000 TL'yi kabul eder ve en az bir pilot imzalanır. | 180.000 TL korunur. |
| Ödeyicilerin çoğu 300.000 TL'yi de kabul eder. | Şirket paketi öne alınır. Karar paketinin fiyatı yükseltilir. |
| Ödeyicilerin yarısından azı 180.000 TL'yi kabul eder. | 108.000 TL ile ikinci bir tur yapılır. 6.6 bölümündeki fiyat tablosu yeniden okunur. |
| Hiç pilot imzalanmaz. | Fiyat kanıtı yoktur. Satış sorunu fiyattan önce incelenir. |

108.000 TL'lik fiyatta yıl 3 başa baş noktası 214 müşteridir. Bu, temel senaryonun yaklaşık 2,7 katıdır (hesap: 214 ÷ 80).

## 10. Önceki rapora göre neler değişti?

| Konu | Önceki rapor, 15 Kasım 2026 Pazar günü | Bu rapor, 16 Kasım 2026 Pazartesi günü | Neden değişti? |
|---|---|---|---|
| Döviz kuru | 1 dolar = 50,2282 TL | 1 dolar = 50,3942 TL | Daha yeni TCMB kuru |
| Ekip gideri, yıl 1 | 6.000 dolar, varsayım | 10.000 dolar, aralık 8.300 ile 11.850 | Maaş anketleri ve 2026 SGK oranları |
| Ekip gideri, yıl 3 | 20.000 dolar, varsayım | 25.000 dolar, aralık 17.000 ile 35.000 | Aynı neden |
| Sabit altyapı | 250 ile 450 dolar, varsayım | 206, 527 ve 993 dolar | Hetzner liste fiyatlarıyla kurulan yığınlar |
| Paraşüt fiyatı | 752 TL liste fiyatı sanıldı | 940 TL liste fiyatı. 752 TL kampanya fiyatı. | Paraşüt sayfası yeniden okundu |
| Logo fiyatları | Logo Tiger, üçüncü taraf | Logo'nun kendi 2026 fiyat listeleri | Birincil kaynak bulundu |
| Kötümser kayıp | %40 | %16. %40 ayrı bir ürün riski. | %40 bütün ölçütlerin dışında kaldı |
| Temel kayıp | %25 | %10 | SaaS Capital 2025, 12.000 doların altı |
| İyimser kayıp | %12 | %6 | SaaS Capital 2025, çok yıllık sözleşme |
| Yapay zekâ, tipik müşteri | 18 dolar | 11 dolar | Özellik özellik yeni hesap |
| Destek saat ücreti | 25 dolar, varsayım | 12,08 dolar, temel | Destek maaşından hesap |
| Ödeme aracı ücreti | Modelde yoktu | Modele girdi | Ödeme kuruluşu fiyatları bulundu |
| KDV | Modelde yoktu | Fiyatlar KDV hariç. Kart ücreti KDV dahil tutardan. | Vergi bölümü eklendi |
| Katkı payı, temel | 199,63 dolar | 227,28 dolar | Yapay zekâ ucuzladı, destek saati ucuzladı |
| Başa baş, yıl 1 | 32 müşteri | 47 müşteri | Ekip gideri arttı |
| Başa baş, yıl 3 | 102 müşteri | 115 müşteri | Ekip gideri arttı |
| PMI kayıp oranı | %9,9, 2018 | %11,4, 2020 | Daha yeni rapor |
| Müşteri eşiği | 20 ile 30 milyon TL | Aynı. Ama her yıl enflasyonla güncellenir. | TÜFE yüzde 29,77 |
| Görüşme fiyatları | Aylık 9.000, 15.000, 25.000 TL | Yıllık 108.000, 180.000, 300.000 TL | Paket yıllık ve karar başına |
| Apple ve Google ücretleri | Üçüncü taraf | Apple ve Google'ın kendi sayfaları | Birincil kaynak okundu |
| Kuruluş, marka ve hukuk | Modelde yoktu | Bir kerelik yaklaşık 220.000 TL | Resmî ücret tabloları bulundu |

## 11. Sonuçları ne değiştirir?

| Bu durum görülürse | Sonuç şöyle değişir |
|---|---|
| Görüşmelerde ödeyicilerin çoğu 180.000 TL'yi reddeder. | Başa baş noktası 149 ile 214 müşteriye çıkar. Ekip küçültülür ya da satış hızı artırılır. |
| Ekip yıl 3'te 5,5 kişide kalır. | Temel senaryo yıl 3'te 80 müşteriyle başa baş olur. |
| Hazine prim desteği 2027'de uzatılmaz. | Ekip gideri yaklaşık yüzde 1,6 artar. Başa baş noktası yaklaşık 2 müşteri yükselir. |
| Teknopark ya da Ar-Ge teşviki alınır. | Ekip gideri düşer. Başa baş noktası düşer. Etkisi araştırılmadı. |
| Pilotlarda destek ayda 4 saati geçer. | Katkı payı düşer. Bir kişi en çok 35 müşteriye bakar. |
| İlk karardan sonra müşterilerin çoğu ayrılır. | Kayıp yüzde 40'a yaklaşır. 115 müşteriyi korumak için her yıl 46 yeni satış gerekir. |
| Müşteriler ikinci kararı açar. | Net gelir tutma yüzde 100'ü geçer. Gereken yeni satış azalır. |
| Ortak kanalı hızla müşteri getirir. | Satış hızı sorunu çözülür. Ortak payı katkı payını biraz düşürür. |
| Ortaklar ürünü rakip görür. | Toplantı yürütme işini sizin ekibiniz yapar. Destek saati ve ekip büyür. |
| Yapay zekâ çıkınca kullanım yoğun olur. | Maliyet müşteri başına 45 dolara çıkar. Kota bu yüzden zorunludur. |
| Lira dolara karşı hızla değer kaybeder. | Sunucu ve yapay zekâ pahalılaşır. Ama bu kalemler giderin yüzde 5'inden azdır. Maaşlar TL olduğu için etki sınırlıdır. |
| Hetzner yeniden zam yapar. | Yalnız sabit altyapı etkilenir. 15.000 TL'lik fiyatta bu öldürücü değildir. |
| Bir firma public kodu daha ucuza barındırır. | Fiyat baskı altına girer. Lisans seçimi bu riski belirler. |
| Strateji yazılımının getirisini ölçen bir çalışma çıkar. | Müşteri eşiği yeniden hesaplanır. |

## Sonuç

Bu rapor önceki cevabı değiştirmez, ama ağırlığını kaydırır. Önceki rapor kârın fiyat ve yapay zekâ kotasına bağlı olduğunu söyledi. Doğrulanmış maliyetler başka bir şey gösteriyor. Ürünün kendisi zaten kârlıdır. Temel senaryoda brüt kâr marjı yüzde 80'in üstündedir. Asıl soru, ekibin maaşını taşıyacak müşteri sayısına ne kadar hızlı varılacağıdır. Bu sayı 115'tir. Bu sayı için yılda 50'den fazla yeni müşteri gerekir. Tek kişilik satış buna yetmez. Bu yüzden iş ortağı programı yalnız bir hizmet kararı değildir. İş ortağı programı gelir modelinin satış motorudur.

Müşteri tarafında yeni bilgi enflasyondur. Ürünün değeri kararın büyüklüğüne bağlıdır. Ama TL ile yazılan eşik bir yılda yaklaşık yüzde 30 eskir. Eşiği oran olarak sormak bu sorunu çözer. Kararın parası yıllık ürün ücretinin en az 100 katı olmalıdır. Önümüzdeki beş hafta en ucuz bilgiyi verir. 15 görüşme ve ilk imzalı pilot doğru fiyatı gösterir. Seçenekler 108.000, 180.000 ve 300.000 TL'dir. Bu tek sayı başa baş noktasını 65 ile 214 müşteri arasında oynatır.

## Kaynaklar

### Kur, enflasyon ve firma sayıları

- [TCMB, 16 Kasım 2026 kurları](https://www.tcmb.gov.tr/kurlar/202611/16112026.xml)
- [Alomaliye, TÜFE Ekim 2026](https://www.alomaliye.com/2026/11/03/enflasyon-rakamlari-tufe-ekim-2026/)
- [Alomaliye, Yİ-ÜFE Ekim 2026](https://www.alomaliye.com/2026/11/03/enflasyon-rakamlari-yi-ufe-ekim-2026/)
- [Borsa Gündem, Ekim enflasyonu](https://www.borsagundem.com.tr/ekim-ayi-enflasyon-rakami-aciklandi)
- [TÜİK, bülten 58132](https://veriportali.tuik.gov.tr/tr/press/58132)

### Ekip, maaş ve SGK

- [Alomaliye, SGK primleri rehberi 2026](https://www.alomaliye.com/2026/07/29/sgk-primleri-rehberi-2026/)
- [Alomaliye, SGK Genelgesi 2026/1](https://www.alomaliye.com/2026/01/07/sgk-genelgesi-2026-1/)
- [Alomaliye, 2026 vergi dilimleri](https://www.alomaliye.com/2025/12/31/2026-yili-vergi-dilimleri/)
- [Kolay İK, 2026 asgari ücret](https://kolayik.com/blog/2026-asgari-ucret-net-hesabi-ve-kesintiler)
- [PwC, asgari ücret ve işveren maliyeti](https://www.pwc.com.tr/tr/medya/kose-yazilari/celal-ozcan/2026-yili-asgari-ucreti-ve-sektorlere-gore-isveren-maliyeti.html)
- [yazilimcimaaslari.org](https://yazilimcimaaslari.org/)
- [getSalary, 2026 maaş rehberi](https://getsalary.dev/blog/yazilim-maas-rehberi-2026)
- [Levels.fyi, İstanbul kıdemli geliştirici](https://www.levels.fyi/es/t/software-engineer/levels/senior/locations/istanbul-tur)
- [kariyer.net, ürün tasarımcısı](https://www.kariyer.net/pozisyonlar/urun+tasarimcisi/maas)
- [kariyer.net, müşteri destek uzmanı](https://www.kariyer.net/pozisyonlar/musteri+destek+uzmani/maas)
- [kariyer.net, kurumsal satış temsilcisi](https://www.kariyer.net/pozisyonlar/kurumsal+satis+musteri+temsilcisi/maas)
- [kariyer.net, kurumsal satış yöneticisi](https://www.kariyer.net/pozisyonlar/kurumsal-satis-yoneticisi-yonetmeni/maas)
- [Ecosire, ERPNext geliştirici ücretleri](https://ecosire.com/blog/hire-erpnext-developer-guide)

### Altyapı, mobil ve izleme

- [Hetzner, genel amaçlı sunucular](https://www.hetzner.com/cloud/general-purpose/)
- [Hetzner bulut](https://www.hetzner.com/cloud/)
- [Hetzner, nesne deposu](https://www.hetzner.com/storage/object-storage/)
- [Hetzner, Storage Box](https://www.hetzner.com/storage/storage-box/)
- [heise, Hetzner zammı](https://heise.de/-11333037)
- [wz-it, Hetzner zammı](https://wz-it.com/en/blog/hetzner-price-increase-june-2026-cpx-ccx-alternatives/)
- [Frappe Cloud, paylaşımlı barındırma](https://frappe.io/cloud/shared-hosting)
- [Radore, bulut sunucu](https://radore.com/en/cloud-server)
- [whtop, Natro](https://www.whtop.com/tr/plans/natro.com/142483)
- [whtop, Turhost](https://www.whtop.com/tr/plans/turhost.com/135432)
- [Apple geliştirici programı](https://developer.apple.com/programs/enroll/)
- [Google Play kayıt ücreti](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en)
- [Capgo fiyatları](https://capgo.app/pricing/)
- [Capawesome fiyatları](https://capawesome.io/cloud/pricing/)
- [Sentry fiyatları](https://sentry.io/pricing/)
- [Better Stack fiyatları](https://betterstack.com/pricing)
- [AWS SES fiyatları](https://aws.amazon.com/ses/pricing/)

### Yapay zekâ

- [Anthropic fiyatları](https://platform.claude.com/docs/en/about-claude/pricing)
- [SistemDC, ekran kartlı sunucu](https://www.sistemdc.com/en/category/ekran-kartli-sunucu)
- [Perdoo fiyatları](https://www.perdoo.com/pricing)

### Ödeme, vergi ve hukuk

- [Stripe, desteklenen ülkeler](https://stripe.com/global)
- [karekod, sanal POS oranları 2026](https://www.karekod.org/blog/sanal-pos-komisyon-oranlari/)
- [Ticimax, iyzico oranları](https://www.ticimax.com/blog/iyzico-komisyon-oranlari)
- [Param, sanal POS](https://cert.param.com.tr/en/param-virtual-pos)
- [Alomaliye, yurt dışına yazılım hizmetinde KDV](https://www.alomaliye.com/2024/07/30/yurt-disinda-mukim-firmaya-verilen-tasarim-yazilim-ve-danismanlik-hizmetinin-kdv-ve-kvk-karsisindaki-durumu/)
- [fatiharas, yazılım ihracatı vergisi](https://www.fatiharas.com/yazilim-ihracati-vergilendirme/)
- [Muhasebenews, hizmet ihracatında yüzde 100 indirim](https://www.muhasebenews.com/yurt-disina-verilen-bazi-hizmetlerde-kurumlar-vergisi-indirimi-%100-oldu/)
- [Faturaport, e-fatura fiyatları](https://faturaport.com/blog/e-fatura/2026-mayis-e-fatura-kontor-fiyatlari)
- [Faturaport, SMMM ücret tarifesi](https://faturaport.com/blog/on-muhasebe/2026-yilinda-sm-smmm-ymm-asgari-ucret-tarifeleri-kapsamli-rehber)
- [Vergi Merkezi, mali müşavir ücreti](https://vergimerkezi.com.tr/?p=3984)
- [Dünya, ticari alacak köşe yazısı](https://www.dunya.com/kose-yazisi/tedarik-zincirinde-ticari-alacak-cikmazi/836742)
- [Dünya, KOBİ köşe yazısı](https://www.dunya.com/kose-yazisi/buyuklerin-faiz-tahkimati-kobi-carkini-kilitliyor/840000)
- [Paraşüt, limited şirket kuruluş maliyeti](https://www.parasut.com/blog/limited-sirket-kurulus-maliyetleri)
- [TÜRKPATENT, marka işlem ücretleri](https://www.turkpatent.gov.tr/marka-islem-ucretleri)
- [Hukuki Haber, İstanbul Barosu 2026 tarifesi](https://www.hukukihaber.net/istanbul-barosu-2026-yili-avukatlik-asgari-ucret-tarifesi)

### Fiyat çapaları

- [Logo GO Wings fiyat listesi](https://cdn.logo.com.tr/files/logocomtr//Uploads/Documents/logo-go-wings-fiyat-listesi.pdf)
- [Logo j-HR fiyat listesi](https://cdn.logo.com.tr/files/logocomtr/Uploads/Documents/logo-j-hr-eop-fiyat-listesi.pdf)
- [Logo iş analitiği fiyat listesi](https://cdn.logo.com.tr/files/logocomtr/Uploads/Documents/logo-is-analitigi-eop-fiyat-listesi.pdf)
- [Logo Cloud](https://logo.com.tr/en/product/logo-cloud)
- [Logo faaliyet raporu, 31 Mart 2026 Salı günü](https://cdn.logo.com.tr/Files/logocomtr/Uploads/Documents/Faaliyet-Raporu-31-Mart-2026.pdf)
- [Paraşüt ön muhasebe fiyatları](https://www.parasut.com/on-muhasebe-fiyatlari)
- [Paraşüt mali müşavir kanalı](https://www.parasut.com/mali-musavir-kanali)
- [Kolay İK fiyatları](https://kolayik.com/insan-kaynaklari-yazilimi-fiyatlari)
- [Toolmage, Twiser](https://www.toolmage.com/en/tool/twiser/)
- [G2, Bimser QDMS](https://www.g2.com/products/bimser-qdms/pricing)
- [Turkcell, Bizbize 1000](https://www.turkcell.com.tr/paket-ve-tarifeler/konusma/bizbize-1000-paketi)
- [Nokta Gazetesi, Kocaeli strateji ihalesi](https://www.noktagazetesi.com.tr/ihale/kocaeli-buyuksehirden-3-milyonluk-vatandas-odakli-strateji-ihalesi-sirketin-sahibi-dikkat-cekti-385382)
- [Cascade ortağı, başlangıç işi](https://www.cascade.app/cascade-partner/vivid-strategies)
- [KOSGEB, İşletme Geliştirme uygulama esasları](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/%C4%B0sletme%20Gelistirme%20Destek%20Program%C4%B1/2026/I%CC%87s%CC%A7letme_Gelis%CC%A7tirme_Destek_Program%C4%B1_Uygulama_Esaslar%C4%B1_22.pdf)
- [KOSGEB, YÖNDE yönergesi](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/YONDE/2026/2026.07.14/Y%C3%96NDE-Y%C3%B6nderlikveDe%C4%9FerlendirmeDestekProgram%C4%B1Y%C3%B6nergesi05.07.26.pdf)
- [Vizyonder, kamu stratejik planı ve ihale](https://www.vizyonder.org.tr/mevzuat-stratejik-plan-ve-performans-programinin-ihale-yoluyla-313)
- [Basecamp fiyatları](https://basecamp.com/pricing)
- [Brussels Times, Odoo](https://www.brusselstimes.com/2332306/odoo-announces-e10-billion-valuation-and-a-partial-price-increase)
- [G2, Cloverpop](https://www.g2.com/products/cloverpop/pricing)

### Müşteri tutma, destek ve iş ortaklığı

- [SaaS Capital, 2025 tutma ölçütleri](https://www.saas-capital.com/wp-content/uploads/2025/09/RB32WS1-2025-B2B-SaaS-Retention-Benchmarks.pdf)
- [Aleph, Benchmarkit 2026 özeti](https://www.getaleph.com/blog/2026-saas-benchmarks-takeaways)
- [Gainsight, müşteri başarı yöneticisi oranı](https://www.gainsight.com/blog/gainsight-horizon-ai-labs-what-is-the-right-csm-to-customer-ratio/)
- [Orb, hizmet payı](https://www.withorb.com/blog/saas-growth-margin-statistics)

### Ödeme isteği yöntemi

- [Prospeo, fiyat araştırması](https://prospeo.io/s/go-to-market-pricing-strategy)
- [CleverX, ödeme isteği](https://cleverx.com/blog/enterprise-b2b-willingness-to-pay-setting-and-defending-price)
- [Monetizely, örneklem büyüklüğü](https://www.getmonetizely.com/faqs/sample-sizes-for-reliable-pricing-research)
- [Sawtooth, örneklem kuralları](https://www.sawtoothsoftware.com/resources/blog/posts/sample-size-rules-of-thumb)

### Açık kaynak ve lisans

- [Frappe, kârlılık yazısı](https://frappe.io/blog/culture/the-path-to-profitability)
- [Frappe, iş modelinin gelişimi](https://frappe.io/blog/erpnext-stories/business-model-evolution-at-frappe)
- [BusinessWire, GitLab 2026 mali yılı](https://www.businesswire.com/news/home/20260303140705/en)
- [Plausible, açık kaynak SaaS](https://ingest.plausible.io/blog/open-source-saas)
- [The Register, Cal.com](https://www.theregister.com/2026/04/26/opinion_column/)
- [It's FOSS, Cal.com](https://itsfoss.com/news/cal-com-goes-proprietary/)
- [BusinessWire, Elastic AGPL](https://www.businesswire.com/news/home/20240829537786/en/Elastic-Announces-Open-Source-License-for-Elasticsearch-and-Kibana-Source-Code)
- [FSL](https://fsl.software/)
- [Sentry lisansı](https://open.sentry.io/licensing)

### Müşteri değeri

- [McKinsey, davranışsal strateji](https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/the-case-for-behavioral-strategy)
- [HBR 2011 makalesi, kopya](https://eclass.aueb.gr/modules/document/file.php/DEOS282/Papers%20%26%20Studies/Kahneman%20Lovallo%20Sibony%20Before%20You%20Make%20That%20Big%20Decision%20HBR2011%202page.pdf)
- [PMI Pulse of the Profession 2020](https://www.pmi.org/learning/thought-leadership/pulse/pulse-of-the-profession-2020)
- [PMI Pulse of the Profession 2018](https://www.pmi.org/learning/thought-leadership/pulse/pulse-of-the-profession-2018)
- [Berkeley Haas, yapay zekâ deneyi](https://newsroom.haas.berkeley.edu/research/gen-ai-experiment-shows-mixed-results-in-helping-small-businesses-grow/)
- [Ekonomim, PwC aile şirketleri araştırması](https://www.ekonomim.com/is-dunyasi/aile-sirketlerinde-buyume-sert-geriledi-haberi-858244)
- [Sözcü, 2025 konkordato ve iflaslar](https://www.sozcu.com.tr/2025-yilinda-konkordato-ve-iflaslar-rekor-kirdi-p281573)

### Ürün belgeleri ve ham notlar

- [Bütünleşik geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md)
- [Geliştirme karar notları](../docs/gelistirme-karar-notlari.md)
- [Belge haritası](../docs/belge-haritasi.md)
- [Yazılım, hizmet ve rol modeli](<Yazılım hizmet ve rol modeli.md>)
- [Gelir modeli ve birim ekonomisi, önceki rapor](<Gelir modeli ve birim ekonomisi.md>)
- [Maliyet notları](<../research_notes/Derin gelir modeli analizi/maliyetler.md>)
- [Gelir ve fiyat notları](<../research_notes/Derin gelir modeli analizi/gelir_ve_fiyat.md>)
- [Hizmet ve ortaklık notları](<../research_notes/Derin hizmet ve yetki modeli/hizmet_ve_ortaklik.md>)
- [Firmografi notları](<../research_notes/Derin ICP ve persona analizi/firmografi.md>)
- [ICP yöntemi notları](<../research_notes/Derin ICP ve persona analizi/icp_yontemi_ve_buyukluk.md>)
- [Yapay zekâ tasarım notları](<../research_notes/Derin AI ve marka konumlandırma/ai_tasarimi.md>)

## Denetim notu

Gerçek okurla denenmedi.

Rapor 16 Kasım 2026 Pazartesi günü yalın Türkçe denetim betiğinden geçirildi. Senaryo ve duyarlılık sayıları aynı gün bir Python betiğiyle hesaplandı. Yeni web araştırması yapılmadı. Dış bilgiler araştırma notlarından gelir.

Denetimde şu kontroller yapıldı:

1. Metinde noktalı virgül, uzun çizgi ve ok işareti yoktur.
2. Unvan her yerde "stratej" olarak yazıldı. Yanlış yazım arandı ve bulunmadı.
3. Metinde özel kişi adı yoktur. DevOps işinin sahibi "DevOps sorumlusu" olarak anıldı.
4. Kaynak bağlantıları korundu. Kaynak adları özgün yazımıyla kaldı.

Betik 0 hata ve 2 uyarı verdi. Uyarıların nedenleri şunlardır:

1. Bir uyarı 11 ile 15 kelimelik cümleleri sayar. Bu cümleler elle okundu. Çoğu açıklama ya da tablo hücresidir. Bu cümleler 15 kelime sınırının altındadır.
2. Bir uyarı uzun kelimeleri sayar. Bu kelimelerin çoğu günlük kelimedir. Örneğin "geliştirici" ve "veritabanı". Bir kısmı kaynak adıdır. Örneğin "Alomaliye" ve "Capawesome".

Üç sınırı da bilin:

1. "Derin hizmet ve yetki modeli" raporu yazım günü depoda yoktu. Bu yüzden o konunun ham notları kullanıldı.
2. Fiyatların, müşteri sayılarının ve destek saatlerinin çoğu varsayımdır. Her sayının türü yanında yazar.
3. Kaynakların bir kısmı arama özetidir. Bu sayılar en zayıf kanıttır.

