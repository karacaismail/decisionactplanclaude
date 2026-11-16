# Karar Atlası kâra 125 müşteride ulaşır

**Kısa cevap.** Karar Atlası satan şirkete para kazandırır. Ama temel senaryoda bu ilk üç yılda olmaz. Tek bir müşteri her ay yaklaşık 11.270 TL katkı bırakır. Yıl 3'te ürünün brüt kâr marjı yüzde 82'dir. Zararı ürün değil, ekip maaşı doğurur. Ekip giderin yüzde 96'sıdır. Doğrulanmış girdilerle yıl 3 ekibi ayda 27.000 dolardır. Bu ekibi taşımak için 125 ücretli müşteri gerekir. Temel senaryoda yıl 3 sonunda 80 müşteri vardır. Başa baş için yıl 2 ve yıl 3'te yılda yaklaşık 59 yeni müşteri gerekir. Üç yılın nakit ihtiyacı kurucu ücreti hariç yaklaşık 21,4 milyon TL'dir. Müşteri tarafında cevap koşulludur. Kararın parası, müşterinin o yıl ödediği tutarın en az 100 katı olmalıdır. Kasım 2026'da bu sınır ilk yıl 23 milyon TL'dir. Yenileme yılında 18 milyon TL'dir. Bu sınır her yıl enflasyonla güncellenir. Yapay zekâ bugün üründe yoktur. Rapordaki yapay zekâ maliyeti bir plandır.

Satıcı şirket şu koşullarda para kazanır:

1. Fiyat şirket başına yılda en az 180.000 TL olur. Bu, ayda 15.000 TL eder. KDV hariçtir.
2. Fiyat TL ile yazılır ve her ocak en az enflasyon kadar artar.
3. Yıllık müşteri kaybı yüzde 10 civarında kalır.
4. Destek, müşteri başına ayda en çok 2 saat olur.
5. Şirket yıl 2 ve yıl 3'te yılda yaklaşık 59 yeni müşteri kazanır.
6. Fiyat ayda 18.000 TL olursa eşik 101 müşteriye iner. O zaman yılda yaklaşık 47 yeni müşteri yeter.
7. Kurucu üç yıl için yaklaşık 21,4 milyon TL nakit bulur. Kurucu ücreti bu tutara ayrıca eklenir.

Müşteri şu koşullarda para kazanır:

1. Kararın parası, o yıl ödediği toplam tutarın en az 100 katıdır.
2. Ürün kararın getirisini en az 1 yüzde puan artırır.
3. Müşteri değeri kendi kayıtlarıyla ölçer. Aynı parayı iki kez saymaz.

## Bu raporu nasıl okursunuz?

Bu rapor 16 Kasım 2026 Pazartesi günü yazıldı. Rapor iki soruyu cevaplar:

1. Karar Atlası'nı satan şirket para kazanır mı?
2. Karar Atlası'nı alan müşteri para kazanır mı?

Bu rapor "Derin gelir modeli analizi" raporunun yerini alır. O rapor aynı gün yazıldı. Bu rapor her girdiyi birincil kaynağa göre yeniden kurar. Rapor tek başına okunabilir. Değişenler 11. bölümdedir.

### Döviz kuru

Bütün çeviriler tek bir kurla yapıldı. TCMB, Türkiye Cumhuriyet Merkez Bankası'dır. Kur, TCMB'nin 2026/215 sayılı bültenindeki döviz satış kurudur. Bülten 16 Kasım 2026 Pazartesi günü tarihlidir ([TCMB kurları](https://www.tcmb.gov.tr/kurlar/today.xml)).

| Para | Kur |
|---|---|
| 1 dolar | 50,3942 TL |
| 1 avro | 55,4979 TL |

### Bilginin türü

Her sayının yanında türü yazar. Türler şunlardır:

| Tür | Anlamı | Örnek |
|---|---|---|
| Resmî | Yasa, Resmî Gazete ya da resmî kurum metni | 7566 sayılı Kanun |
| Yayımlanmış | Satıcının kendi sayfasında okunan fiyat | Logo fiyat listesi |
| Birincil araştırma | Araştırmayı yapan kurumun kendi yayını | SaaS Capital raporu |
| Şirket belgesi | Şirketin resmî mali raporu | GitLab 10-K raporu |
| Üçüncü taraf | Başka bir sitenin aktardığı bilgi | Maaş anketi, haber |
| İkame | Asıl kaynak açılmadı. En yakın güvenilir kaynak kullanıldı. | Resmî metnin tam kopyası |
| Hesap | Kaynaklı sayılardan yaptığımız hesap | İşverene maliyet |
| Varsayım | Kaynağı olmayan model girdisi. Görüşme ve pilot bu girdiyi sınar. | Destek saati |
| Çıkarım | Bulgulardan çıkardığımız yorum | Fiyat önerisi |

Fiyatların görüldüğü tarih 16 Kasım 2026 Pazartesi günüdür. Başka tarih varsa ilgili yerde yazar. Fiyatlar KDV hariçtir. KDV dahil olan fiyatın yanında bu yazar.

### Ürünün bugünkü durumu

Ürünün temel kuralı değişmez. Stratej yolu önerir ve gerekçesini kurar. Karar sahibi seçer ve kaydeder. Stratej, stratejiyi geliştiren kişinin unvanıdır.

Canlı sürüm bugün yalnız tarayıcıda çalışır. Sunucu sürümü tasarlandı ama yazılmadı. Yapay zekâ bugün üründe yoktur. Ürün, yapay zekâ kapalıyken de tam çalışır.

Bu rapor verilmiş mimari kararlara uyar ([bütünleşik geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md)). Bu kararlar şunlardır:

1. Arka yüz tek bir Frappe 16 uygulamasıdır.
2. Her müşteri ayrı bir sitede ve ayrı veritabanında çalışır.
3. Jenkins yayını başlatır. Frappe Press siteleri her gece dalgalarla günceller.
4. Ön yüz PWA'dır. Capacitor ile mobil uygulama olarak da çıkar.
5. Mobil uygulama, internet kesilince veriyi SQLite'a yazar.
6. Ön yüz, arka yüz ve sözleşmeler tek bir public depoda durur.

Sunucu ve yayın işlerinin sahibi DevOps sorumlusudur.

## Terimler

| Terim | Anlamı |
|---|---|
| SaaS | İnternetten kiralanan yazılım. Müşteri yazılımı kurmaz, abone olur. |
| Müşteri başına aylık gelir | Bir müşterinin her ay ödediği abonelik parası |
| Yıllık tekrarlayan gelir | Bütün abonelerden bir yılda düzenli gelen para. Kısaltması ARR'dir. |
| Yıllık sözleşme değeri | Bir müşterinin bir yılda ödediği abonelik parası. Kısaltması ACV'dir. |
| Değişken maliyet | Her yeni müşteriyle artan maliyet. Örneğin destek saati. |
| Sabit gider | Müşteri sayısı değişse de ödenen gider. Örneğin ekip maaşı. |
| Brüt kâr marjı | Gelirden hizmetin doğrudan maliyeti çıkınca kalan payın yüzdesi |
| Katkı payı | Bir müşterinin aylık gelirinden ona ait bütün maliyetler çıkınca kalan para |
| Başa baş noktası | Gelirin bütün giderleri karşıladığı müşteri sayısı |
| Müşteri kayıp oranı | Bir yılda aboneliği bırakan müşterilerin yüzdesi |
| Brüt gelir tutma | Eski müşterilerden bir yıl sonra kalan gelirin oranı. Ek satış sayılmaz. Kısaltması GRR'dir. |
| Net gelir tutma | Aynı oran, ama ek satış da sayılır. Kısaltması NRR'dir. |
| Müşteri kazanma maliyeti | Bir yeni müşteri için harcanan satış ve pazarlama parası. Kısaltması CAC'dir. |
| Geri ödeme süresi | Müşteri kazanma maliyetinin kaç ayda geri döndüğü |
| Ömür boyu katkı | Bir müşterinin abone kaldığı sürece bıraktığı toplam katkı |
| Brüt maaş | Kesintilerden önceki maaş |
| Net maaş | Çalışanın eline geçen maaş |
| İşverene maliyet | Brüt maaşa işverenin ödediği primler eklenince çıkan tutar |
| Prim tavanı | Primin hesaplandığı en yüksek aylık brüt maaş |
| Hazine desteği | Devletin işveren primini 2 puan düşürmesi |
| KDV | Katma değer vergisi. Satıcı müşteriden alır ve devlete öder. Satıcının geliri değildir. |
| Kart ücreti | Ödeme kuruluşunun her kartlı tahsilattan kestiği pay |
| Etkin karar | Hazırlık kapısından gözden geçirmenin kapanmasına kadar açık duran karar |
| Endeksleme | Fiyatı her yıl enflasyon oranına göre güncellemek |
| Kota | Pakete dahil olan kullanım miktarı. Örneğin aylık yapay zekâ kullanımı. |
| Kredi | Kotayı aşan kullanım için ayrıca satılan paket |
| Yüzde puan | İki yüzde arasındaki düz fark. Yüzde 10'dan yüzde 11'e çıkmak 1 puandır. |
| Nakit ihtiyacı | Gelir giderleri karşılayana kadar şirketin cebinden çıkan toplam para |
| Ödeme isteği | Alıcının bir ürün için ödemeye razı olduğu en yüksek fiyat |
| Duyarlılık tablosu | Tek bir girdi değişince sonucun nasıl değiştiğini gösteren tablo |
| Lisans | Kodu başkalarının hangi şartla kullanabileceğini söyleyen hukuki metin |
| ICP | İdeal müşteri profili. Ürünü en çok isteyecek şirketin tarifi. |
| Pilot | Tek bir gerçek kararla yapılan 8 haftalık ücretli deneme |
| Niyet mektubu | Alıcının satın alma niyetini yazıyla bildirdiği kısa belge |
| Van Westendorp yöntemi | Dört fiyat sorusuyla kabul edilebilir fiyat aralığını bulan yöntem |
| Gabor-Granger yöntemi | Belirli fiyatlarda satın alma niyetini soran yöntem |
| Frappe Press | Müşteri sitelerini açan, güncelleyen ve yedekleyen Frappe aracı |
| BSMV | Banka ve sigorta muameleleri vergisi. Kart ücretine eklenir. |
| Tier III | Veri merkezinin kesintiye dayanıklılık sınıfı |
| 10-K | ABD'de borsadaki şirketin yıllık resmî mali raporu |
| Stratej | Stratejiyi geliştiren kişinin unvanı. Yazım hatası değildir. |

## 1. Maliyet: giderin yüzde 96'sı ekiptir

Bu bölüm satıcı şirketin giderleridir. Önce ekip, sonra öteki giderler gelir. Bölüm tam maliyet tablosuyla biter.

### 1.1. İşverene maliyet formülü yeniden hesaplandı

Bütün bordro girdileri resmî metinden okundu. Girdiler şunlardır:

| Girdi | Değer | Kaynak | Tür |
|---|---|---|---|
| Brüt asgari ücret | Ayda 33.030 TL. Günlük 1.101 TL × 30 gün. | Asgari Ücret Tespit Komisyonu Kararı 2025/1, Resmî Gazete 26 Aralık 2025 Cuma günü ([RG](https://www.resmigazete.gov.tr/eskiler/2025/12/20251226-6.pdf)) | Resmî |
| Net asgari ücret | Ayda 28.075,50 TL | Aynı karardan hesap | Hesap |
| İşveren malullük, yaşlılık ve ölüm primi | Yüzde 12 | 7566 sayılı Kanun, madde 23. Resmî Gazete 19 Aralık 2025 Cuma günü ([RG](https://www.resmigazete.gov.tr/eskiler/2025/12/20251219-1.htm)) | Resmî |
| İşveren genel sağlık sigortası primi | Yüzde 7,5 | [KPMG Vergi tablosu](https://kpmgvergi.com/pratik-bilgiler/4/2) | Üçüncü taraf |
| Kısa vadeli sigorta primi | Yüzde 2,25 | Aynı kaynak | Üçüncü taraf |
| İşveren işsizlik primi | Yüzde 2 | Aynı kaynak | Üçüncü taraf |
| Hazine desteği, imalat dışı işveren | 2 puan. 2026 başında 4 puandan 2 puana indi. | 7566 sayılı Kanun, madde 23 ve 27 ([RG](https://www.resmigazete.gov.tr/eskiler/2025/12/20251219-1.htm)) | Resmî |
| Prim tavanı | Ayda 297.270 TL. Asgari ücretin 9 katı. | 7566 sayılı Kanun, madde 24 ([RG](https://www.resmigazete.gov.tr/eskiler/2025/12/20251219-1.htm)) | Resmî ve hesap |
| Asgari ücret desteği | Günde 42,33 TL. Ayda 1.269,90 TL. Yalnız 2026 için. | 7573 sayılı Kanun, madde 8. Resmî Gazete 29 Ocak 2026 Perşembe günü ([RG](https://www.resmigazete.gov.tr/eskiler/2026/01/20260129-1.htm)) | Resmî |
| Ücret gelir vergisi dilimleri | Yüzde 15, 20, 27, 35 ve 40. Sınırlar 190.000, 400.000, 1.500.000 ve 5.300.000 TL. | GVK Genel Tebliği 332. Kopya: [KPMG Vergi](https://kpmgvergi.com/yayinlar/mali-bultenler/vergi/2026-yili-gelir-vergisi-dilimleri-ile-dikkate-alinacak-bazi-had-ve-tutarlar-belirlendi/3351) | İkame, resmî metnin tam kopyası |

Hazine desteği 2026 sonunda biter. Cumhurbaşkanı desteği 31 Aralık 2027 Cuma gününe kadar uzatabilir. Bu bilgi SGK Genelgesi 2026/1'dedir ([genelgenin kopyası](https://www.alomaliye.com/2026/01/07/sgk-genelgesi-2026-1/), ikame). İmalat sektörü 5 puanlık desteği korur. Karar Atlası imalat şirketi değildir.

Formül dört adımdır (hesap):

1. İşverenin toplam payı = 12 + 7,5 + 2,25 + 2 = yüzde 23,75 olur.
2. Hazine desteğiyle pay = 23,75 − 2 = yüzde 21,75 olur.
3. İşverene maliyet = brüt maaş + yüzde 21,75 × en çok 297.270 TL olur.
4. Destek uzatılmazsa yüzde 21,75 yerine yüzde 23,75 kullanılır.

Brüt maaş, net maaştan geriye doğru bulunur. Net maaş şu formülle hesaplanır (hesap):

> Net = brüt − yüzde 15 × en çok 297.270 TL − gelir vergisi − damga vergisi

Formülde üç ayrıntı vardır:

1. Gelir vergisi brüt maaşın yüzde 85'ine uygulanır. Yıl boyunca birikerek hesaplanır.
2. Asgari ücretin vergisi düşülür. Bu, asgari ücret istisnasıdır.
3. Damga vergisi yüzde 0,759'dur. Asgari ücreti aşan kısma uygulanır.

Formül asgari ücrette 28.075,50 TL neti doğru verir. Net maaş, on iki ayın ortalamasıdır.

**Birinci örnek asgari ücrettir (hesap).**

1. Destekle maliyet = 33.030 × 1,2175 = 40.214,03 TL olur.
2. Desteksiz maliyet = 33.030 × 1,2375 = 40.874,63 TL olur.
3. Destekle maliyet yaklaşık 798 dolar eder.

**İkinci örnek kıdemli arka yüz geliştiricisidir (hesap).**

1. Net maaş 167.500 TL'dir.
2. Brüt maaş 273.992 TL olur.
3. İşverene maliyet = 273.992 × 1,2175 = 333.585 TL olur.
4. Dolar karşılığı = 333.585 ÷ 50,3942 = 6.620 dolar olur.

Asgari ücret desteği küçüktür. Destek çalışan başına ayda yaklaşık 25 dolardır. Şirket 2026'da kurulursa bütün sigortalı günler için alınır. Destek 2027'de yoktur. Bu yüzden model desteği saymaz.

Prim tavanı yalnız kıdemli DevOps rolünde işler. O rolün brüt maaşı 304.766 TL'dir. Tavan bu maliyeti ayda yaklaşık 3 dolar düşürür (hesap). Model bu farkı saymaz.

### 1.2. Rol maliyetleri

Net maaşlar iki anketten gelir. İlk anket Önceki Yazılımcı 2026 veri setidir. Bu veri setinde 5.002 cevap vardır. 4.589 cevap TL maaş alır. Ham veri GitHub'da açıktır ([Önceki Yazılımcı 2026](https://github.com/oncekiyazilimci/2026-yazilim-sektoru-maaslari)). getSalary aynı veriyi kullanır ([getSalary](https://getsalary.dev/blog/yazilim-maas-rehberi-2026)). İkinci anket yazilimcimaaslari.org'dur. Şubat 2026'da 1.223 kişiyle yapıldı ([yazilimcimaaslari.org](https://yazilimcimaaslari.org/)). Tasarım, destek ve satış rolleri kariyer.net'ten gelir. kariyer.net sayıları adayların net maaş beklentisidir.

Bütün maliyetler 1,2175 çarpanıyla hesaplandı. Dolar sütunu işverene maliyettir.

| Rol | Net maaş, bütün şirketler | İşverene maliyet, bütün şirketler | İşverene maliyet, en çok 50 çalışanlı şirketler | Kaynak |
|---|---|---|---|---|
| Kıdemli arka yüz geliştiricisi | 167.500 TL | 6.620 dolar | 5.179 dolar | Önceki Yazılımcı |
| Orta düzey arka yüz geliştiricisi | 107.500 TL | 3.959 dolar | 3.224 dolar | Önceki Yazılımcı |
| Kıdemli ön yüz geliştiricisi | 142.500 TL | 5.511 dolar | Ayrı ölçülmedi | Önceki Yazılımcı |
| Orta düzey ön yüz geliştiricisi | 95.000 TL | 3.421 dolar | 2.732 dolar | Önceki Yazılımcı |
| Orta düzey mobil geliştirici | 102.500 TL | 3.738 dolar | 2.732 dolar | Önceki Yazılımcı |
| Kıdemli mobil geliştirici | 177.500 TL | 7.063 dolar | 5.179 dolar | Önceki Yazılımcı |
| Orta düzey DevOps mühendisi | 127.500 TL | 4.846 dolar | Ayrı ölçülmedi | Önceki Yazılımcı |
| Kıdemli DevOps mühendisi | 185.000 TL | 7.331 dolar | Ayrı ölçülmedi | Önceki Yazılımcı |
| Ürün tasarımcısı | 68.000 TL | 2.357 dolar | Ayrı ölçülmedi | [kariyer.net](https://www.kariyer.net/pozisyonlar/urun+tasarimcisi/maas) |
| Müşteri destek uzmanı | 44.200 TL | 1.419 dolar | Ayrı ölçülmedi | [kariyer.net](https://www.kariyer.net/pozisyonlar/musteri+destek+uzmani/maas) |
| Kurumsal satış temsilcisi | 54.000 TL | 1.805 dolar | Ayrı ölçülmedi | [kariyer.net](https://www.kariyer.net/pozisyonlar/kurumsal+satis+musteri+temsilcisi/maas) |
| Kurumsal satış yöneticisi | 73.300 TL | 2.566 dolar | Ayrı ölçülmedi | [kariyer.net](https://www.kariyer.net/pozisyonlar/kurumsal-satis-yoneticisi-yonetmeni/maas) |

Maaşlar üçüncü taraf ankettir. İşverene maliyet hesaptır. Mobil geliştirici artık kıdeme göre ayrıldı. Önceki rapor bütün kıdemler için 3.421 dolar kullanmıştı.

**Yabancı şirket maaş farkı.** yazilimcimaaslari.org'da yabancı şirkette çalışanın ortanca net maaşı 175.000 TL'dir. Türk şirketinde çalışanınki 95.000 TL'dir ([yazilimcimaaslari.org](https://yazilimcimaaslari.org/)). Fark yaklaşık 1,8 kattır (hesap). Küçük şirket ortancası yalnız yabancı teklifi olmayan kişide tutar (çıkarım). İyi bir geliştirici yabancı teklif alırsa maliyet bütün şirket ortancasına çıkar.

### 1.3. Ekip gideri: yıl 1'de 10.000, yıl 3'te 27.000 dolar

Yıl 1 ekibinde dört kişi vardır:

1. Ücret almayan kurucu
2. Kıdemli arka yüz ve Frappe geliştiricisi
3. Orta düzey ön yüz ve mobil geliştirici
4. Çeyrek zamanlı DevOps mühendisi

Yıl 3 ekibinde 7,5 tam zamanlı kişi vardır:

1. Kıdemli arka yüz geliştiricisi
2. Orta düzey arka yüz geliştiricisi
3. Kıdemli ön yüz geliştiricisi
4. Orta düzey mobil geliştirici
5. Yarı zamanlı kıdemli DevOps mühendisi
6. Ürün tasarımcısı
7. Destek uzmanı
8. Kurumsal satış yöneticisi

Hesap şöyledir (hesap):

1. Yıl 1, bütün şirket ortancası = 6.620 + 3.421 + 0,25 × 7.331 = 11.874 dolar.
2. Yıl 1, küçük şirket ortancası = 5.179 + 2.732 + 0,25 × 4.846 = 9.122 dolar.
3. Yıl 3, bütün şirket ortancası = 6.620 + 3.959 + 5.511 + 3.738 + 0,5 × 7.331 + 2.357 + 1.419 + 2.566 = 29.836 dolar.
4. Yıl 3, küçük şirket ortancası = 24.303 dolar. Bu hesap aynı rolleri küçük şirket ortancalarıyla toplar.

| Ekip | Düşük | Temel | Yüksek | Tür |
|---|---|---|---|---|
| Yıl 1, aylık | 9.122 dolar | 10.000 dolar | 11.874 dolar | Hesap |
| Yıl 1, aylık TL | 459.696 TL | 503.942 TL | 598.381 TL | Hesap |
| Yıl 3, aylık | 24.303 dolar | 27.000 dolar | 29.836 dolar | Hesap |
| Yıl 3, aylık TL | 1.224.730 TL | 1.360.643 TL | 1.503.561 TL | Hesap |

Yıl 1'in temel değeri 10.000 dolar kaldı. Bu değer doğrulanmış aralığın içindedir. Yıl 3'ün temel değeri 25.000 dolardan 27.000 dolara çıktı. 25.000 dolar aralığın alt ucundaydı. 27.000 dolar aralığın ortasına yakındır.

Bu sayılara dört şey girmez:

1. Kurucunun ücreti. Bu ücret 7. bölümde ayrı bir satırdır.
2. Bilgisayar, yemek kartı, sağlık sigortası ve ofis. Bunlar yüzde 20 eklerse yıl 3 ekibi 35.803 dolar olur. Yüzde 20 bir varsayımdır.
3. Teknopark ve Ar-Ge teşvikleri. Bu teşvikler gideri düşürür.
4. Maaş artışı. Maaşlar TL ile artar. Dolar karşılığı kura göre değişir.

### 1.4. Altyapı: sunucu gideri küçüktür

Hetzner, Almanya merkezli bir sunucu kiralama şirketidir. Model Hetzner bulut fiyatlarını kullanır.

**Fiyatlar zamdan sonraki fiyatlardır.** Hetzner 15 Haziran 2026 Pazartesi günü yeni siparişlere zam yaptı. CCX13 sunucusu Almanya ve Finlandiya'da 15,99 avrodan 42,99 avroya çıktı ([Hetzner zam sayfası, arşiv kopyası](http://web.archive.org/web/20261022142746/https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/)). Canlı sayfa artık açılmıyor. Arşiv kopyası Hetzner'in kendi metnidir.

**Helsinki fiyatı daha ucuzdur.** Bugünkü ürün sayfası Helsinki'de CCX13'ü 36,99 avro gösterir. Nürnberg'de aynı sunucu 43,49 avrodur ([Hetzner genel amaçlı sunucular](https://www.hetzner.com/cloud/general-purpose/)). Helsinki fiyatı zam tablosundan yaklaşık yüzde 15 düşüktür. Bunun nedeni hiçbir sayfada yazmıyor. Helsinki fiyatı kalkarsa temel yığın 527 dolardan yaklaşık 615 dolara çıkar (hesap).

**Yedek ücreti resmîdir.** Hetzner bulut yedeği sunucu fiyatının yüzde 20'sidir ([Hetzner fatura soruları](https://docs.hetzner.com/cloud/billing/faq/)). Önceki raporda bu bir varsayımdı.

| Yığın | İçerik | Aylık dolar | Tür |
|---|---|---|---|
| Düşük, yaklaşık 20 müşteriye kadar | Uygulama ve veritabanı tek sunucuda, Press ve Jenkins sunucusu, deneme sunucusu, yedek | 206 | Yayımlanmış fiyat ve hesap |
| Temel, Helsinki fiyatı | Press, Jenkins, deneme ve izleme için dört küçük sunucu, ayrı uygulama ve veritabanı sunucusu, yedek | 527 | Yayımlanmış fiyat ve hesap |
| Temel, Helsinki fiyatı kalkarsa | Aynı yığın, Nürnberg fiyatı | 615 | Hesap |
| Yüksek | Büyük veritabanı sunucusu, iki uygulama sunucusu, yedek | 993 | Hesap |

**Kiralık fiziksel sunucu seçeneği.** Hetzner'in düzenli fiyatları AX42 için 97,30 avro, AX102 için 257,30 avrodur. Kurulum ücreti AX42'de 49, AX102'de 129 avrodur. Daha ucuz "sınırlı teklif" fiyatları stok bittikçe kalkar ([arşiv kopyası](http://web.archive.org/web/20261022142746/https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/)). İki AX42 ve bir AX102 ayda 451,90 avro eder. Bu yaklaşık 498 dolardır. Kurulum bir kez yaklaşık 250 dolardır (hesap). Önceki rapor sınırlı teklif fiyatını kullanmıştı.

**Frappe Cloud karşılaştırması.** Frappe Cloud'da özel uygulama için ayrı kurulum gerekir. Bu kurulum site başına ayda 25 dolardan başlar ([Frappe Cloud](https://frappe.io/cloud/shared-hosting), yayımlanmış). 125 müşteride bu 3.125 dolar eder (hesap). Temel Hetzner yığını 527 dolardır. Kendi sunucumuzdaki Press yolu ucuzdur. Frappe Press'in lisansı AGPL-3.0'dır ([Frappe Press deposu](https://github.com/frappe/press)).

**Türkiye'de barındırma.** Hetzner'in Türkiye'de veri merkezi yoktur. İstanbul'da 4 çekirdek ve 8 GB bellekli sanal sunucu ayda 29,99 dolardır ([OwnHost](https://www.ownhost.net/en/cloud-server), yayımlanmış). Bu fiyat Tier III bir veri merkezi içindir. 16 GB bellekli sunucu için 55 ile 75 dolar toplayıcı sitelere dayanır. Türkiye'de barındırmayı ek ücretli seçenek yapın. Fiyatı müşteri başına ayda en az 75 dolar maliyeti karşılamalıdır (çıkarım).

**Mobil, izleme ve e-posta.** Bu kalemler küçüktür.

| Kalem | Fiyat | Tür |
|---|---|---|
| Apple geliştirici hesabı | Yılda 99 dolar | Yayımlanmış ([Apple](https://developer.apple.com/programs/enroll/)) |
| Google Play hesabı | Bir kez 25 dolar | Yayımlanmış ([Google](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en)) |
| Capgo uzaktan güncelleme | Ayda 14 ile 99 dolar | Yayımlanmış ([Capgo](https://capgo.app/pricing/)) |
| Capawesome uzaktan güncelleme | Ayda 9 ile 79 dolar | Yayımlanmış ([Capawesome](https://capawesome.io/cloud/pricing/)) |
| Sentry hata izleme, Team paketi | Ayda 26 dolar, yıllık ödemeyle | Yayımlanmış ([Sentry](https://sentry.io/pricing/)) |
| Better Stack çalışma izleme | Ayda 29 dolar, yıllık ödemeyle | Yayımlanmış ([Better Stack](https://betterstack.com/pricing)) |
| Amazon SES e-posta | 1.000 e-posta için 0,10 dolar | Yayımlanmış ([AWS](https://aws.amazon.com/ses/pricing/)) |

Modeldeki araç gideri yıl 1'de ayda 60 dolardır. Yıl 3'te ayda 150 dolardır. Bu tutarlar yukarıdaki fiyatlardan kurulan tahmindir.

### 1.5. Yapay zekâ maliyeti: tipik müşteride ayda 15 dolar

Yapay zekâ bugün üründe yoktur. Aşağıdaki maliyet, özellik çıkınca beklenen maliyettir.

Anthropic liste fiyatları milyon kelime parçası başınadır ([Anthropic fiyatları](https://platform.claude.com/docs/en/about-claude/pricing), yayımlanmış). Kelime parçası, modelin metni böldüğü küçük birimdir.

| Model | Girdi | Çıktı |
|---|---|---|
| Opus 5.5 | 4 dolar | 20 dolar |
| Sonnet 5.5 | 2 dolar | 10 dolar |
| Haiku 5.5 | 0,10 dolar | 0,50 dolar |

Türkçe metin İngilizceden çok kelime parçası tutar. Aynı yasa metni iki dilde ölçüldü. Metin KVKK'nın 1. ile 8. maddeleridir. Yeni ölçüm aracında Türkçe metin 1,48 kat parça tuttu. Eski araçta 2,02 kat tuttu ([Türkçe metin](https://www.mevzuat.gov.tr/MevzuatMetin/1.5.6698.pdf), [İngilizce metin](https://www.kvkk.gov.tr/Icerik/6649/Personal-Data-Protection-Law), hesap). Claude'un kendi aracı ölçülemedi. Bu yüzden model ihtiyatlı katsayıyı kullanır.

| Kullanım | Hesap | Aylık maliyet | Aylık TL | Senaryo |
|---|---|---|---|---|
| Tipik, İngilizce metin | Özellik özellik hesap | 7,6 dolar | 383 TL | Karşılaştırma |
| Tipik, Türkçe, katsayı 1,48 | 7,6 × 1,48 | 11,2 dolar. Modelde 11 dolar. | 567 TL | İyimser |
| Tipik, Türkçe, katsayı 2,0 | 7,6 × 2,0 | 15,2 dolar. Modelde 15 dolar. | 766 TL | Temel |
| Yoğun kullanım, kota tavanı | Kotayla sınırlı | 45 dolar | 2.268 TL | Kötümser |

Tipik müşteri 3 etkin plan ve yaklaşık 15 kullanıcıyla çalışır. Hesap, yapay zekâ tasarım notlarından gelir ([yapay zekâ tasarım notları](<../research_notes/Derin AI ve marka konumlandırma/ai_tasarimi.md>)). Yoğun kullanım tipik kullanımın 4 katıdır. Katsayı 2,0 ise bu 60 dolar eder. Kota bu yüzden zorunludur. Kotayı aşan kullanım kredi olarak satılır.

### 1.6. Muhasebe, hukuk, marka ve kuruluş

**Mali müşavir ücreti artık resmî tariften gelir.** 2026 tarifesi 17 Aralık 2025 Çarşamba günü Resmî Gazete'de yayımlandı ([RG tarife eki](https://www.resmigazete.gov.tr/eskiler/2025/12/20251217-2-1.pdf)). Tarife aylık ve KDV dahildir. Hizmet işi yapan limited şirket için tabandaki ücretler şunlardır:

| Durum | Temel tarife | İstanbul, yüzde 35 eklenmiş |
|---|---|---|
| İşçisiz | 3.606 TL | 4.868 TL |
| 1 ile 3 işçi | 3.864 TL | 5.216 TL |
| 4 ile 9 işçi | 4.179 TL | 5.642 TL |
| Sürekli danışmanlık, isteğe bağlı | 6.497 TL | 6.497 TL |

Hesap şöyledir (hesap):

1. 1 ile 3 işçili şirketin defteri ayda 5.216 TL'dir.
2. Danışmanlıkla toplam = 5.216 + 6.497 = 11.713 TL olur.
3. Bu yaklaşık 232 dolar eder.

Tarifede bir indirim de vardır. Bu indirim yeni mükellef içindir. Mükellef 2026'da ilk kez bilanço ya da işletme esasına geçer. Bu mükellef iki yıl yüzde 50 indirim alır. İndirim defter ücretine uygulanır. Şirket 2026'da kurulursa ilk iki yıl defter ücreti 2.608 TL olur. Danışmanlıkla toplam 9.105 TL eder (hesap).

E-fatura için yılda yaklaşık 5.000 TL ayrıldı. GİB e-Arşiv portalı ücretsizdir. Özel sağlayıcı yılda birkaç bin TL ister ([Faturaport](https://faturaport.com/blog/e-fatura/2026-mayis-e-fatura-kontor-fiyatlari), üçüncü taraf).

Modeldeki muhasebe satırı şöyledir (hesap):

1. Yıl 1 ve yıl 2 = (9.105 + 417) ÷ 50,3942 = 189 dolar.
2. Yıl 3 = (11.713 + 417) ÷ 50,3942 = 241 dolar.
3. 417 TL, yıllık e-fatura ayrımının aylık payıdır.

Önceki rapor bu satır için 300 dolar varsaymıştı. Önceki raporun 7.985 ve 15.971 TL'lik sayıları tarifede yoktur.

**Bir kerelik giderler.** Bu giderler aylık modele girmez. Nakit ihtiyacına girer.

| Kalem | Düşük | Temel | Yüksek | Tür |
|---|---|---|---|---|
| Limited şirket kuruluşu | 24.000 TL | 30.000 TL | 42.500 TL | Üçüncü taraf ([Paraşüt](https://www.parasut.com/blog/limited-sirket-kurulus-maliyetleri)) |
| Marka tescili, resmî ücret | 9.830 TL, tek sınıf | 15.800 TL, üç sınıf | 15.800 TL | Resmî ([TÜRKPATENT](https://www.turkpatent.gov.tr/marka-islem-ucretleri)) |
| Sözleşme, KVKK belgesi ve gizlilik metni | 87.000 TL, tek sözleşme | 174.000 TL, iki sözleşme | 261.000 TL, üç sözleşme | İkame, baro tarifesinin tam kopyası ([Hukuki Haber](https://www.hukukihaber.net/istanbul-barosu-2026-yili-avukatlik-asgari-ucret-tarifesi)) |
| Toplam | 120.830 TL | 219.800 TL | 319.300 TL | Hesap |
| Toplam, dolar | 2.398 | 4.362 | 6.336 | Hesap |

Marka hesabı şöyledir. Sınıflar 9, 42 ve 35 olarak seçildi (hesap):

> 2.820 + 2.820 + 3.150 + 7.010 = 15.800 TL

Mali müşavir tarifesinde şirket kuruluş işi 5.209 TL'dir ([RG tarife eki](https://www.resmigazete.gov.tr/eskiler/2025/12/20251217-2-1.pdf)). Bu ücret kuruluş satırının içindedir. Limited şirketin en az sermayesi 50.000 TL'dir. Sermaye gider değildir. Ama nakit ister.

Ad çakışması ayrı bir gider doğurabilir. "Karar Atlası" adı başka bir işte zaten kullanılıyor ([kararatlasi.com.tr](https://www.kararatlasi.com.tr/)). Ad değişirse marka ve tanıtım gideri artar. Bu gider modelde yoktur.

### 1.7. Tam maliyet tablosu

Tablodaki bütün değerler 16 Kasım 2026 Pazartesi günü görüldü. Başka bir yürürlük tarihi varsa satırda yazar. Dolar karşılıkları 50,3942 TL kuruyla hesaplandı.

| No | Kalem | Birim | Düşük | Temel | Yüksek | Tür | Kaynak ve tarih |
|---|---|---|---|---|---|---|---|
| 1 | Asgari ücretin işverene maliyeti | Aylık TL | 39.223 (imalat) | 40.214 | 40.875 (destek yok) | Resmî ve hesap | [RG, 26 Aralık 2025 Cuma günü](https://www.resmigazete.gov.tr/eskiler/2025/12/20251226-6.pdf), [RG, 19 Aralık 2025 Cuma günü](https://www.resmigazete.gov.tr/eskiler/2025/12/20251219-1.htm) |
| 2 | İşverene maliyet çarpanı | Brüt maaşın katı | 1,1875 | 1,2175 | 1,2375 | Resmî ve hesap | 7566 sayılı Kanun, 1 Ocak 2026 Perşembe günü yürürlükte |
| 3 | Prim tavanı | Aylık TL | 297.270 | 297.270 | 297.270 | Resmî ve hesap | Aynı kanun |
| 4 | Asgari ücret desteği | Çalışan başına aylık TL | 0 | 0 | 1.269,90 | Resmî | [RG, 29 Ocak 2026 Perşembe günü](https://www.resmigazete.gov.tr/eskiler/2026/01/20260129-1.htm), yalnız 2026 |
| 5 | Kıdemli arka yüz geliştiricisi | Aylık dolar | 5.179 | 6.620 | 6.620 | Üçüncü taraf ve hesap | [Önceki Yazılımcı 2026](https://github.com/oncekiyazilimci/2026-yazilim-sektoru-maaslari) |
| 6 | Orta düzey ön yüz geliştiricisi | Aylık dolar | 2.732 | 3.421 | 3.421 | Üçüncü taraf ve hesap | Aynı veri |
| 7 | Mobil geliştirici | Aylık dolar | 2.732 | 3.738 | 7.063 | Üçüncü taraf ve hesap | Aynı veri |
| 8 | DevOps mühendisi, tam zamanlı | Aylık dolar | 4.846 | 4.846 | 7.331 | Üçüncü taraf ve hesap | Aynı veri |
| 9 | Ürün tasarımcısı | Aylık dolar | 2.357 | 2.357 | 2.357 | Üçüncü taraf ve hesap | [kariyer.net](https://www.kariyer.net/pozisyonlar/urun+tasarimcisi/maas) |
| 10 | Destek uzmanı | Aylık dolar | 1.419 | 1.691 | 2.717 | Üçüncü taraf ve hesap | [kariyer.net](https://www.kariyer.net/pozisyonlar/musteri+destek+uzmani/maas), [kurumsal destek](https://www.kariyer.net/pozisyonlar/kurumsal+musteri+destek+uzmani/maas) |
| 11 | Kurumsal satış yöneticisi, primsiz | Aylık dolar | 1.805 | 2.566 | 2.566 | Üçüncü taraf ve hesap | [kariyer.net](https://www.kariyer.net/pozisyonlar/kurumsal-satis-yoneticisi-yonetmeni/maas) |
| 12 | Ekip, yıl 1 | Aylık dolar | 9.122 | 10.000 | 11.874 | Hesap | Satır 5 ile 8 |
| 13 | Ekip, yıl 3 | Aylık dolar | 24.303 | 27.000 | 29.836 | Hesap | Satır 5 ile 11 |
| 14 | Hetzner Press yığını | Aylık dolar | 206 | 527 | 993 | Yayımlanmış ve hesap | [Hetzner](https://www.hetzner.com/cloud/general-purpose/), zam 15 Haziran 2026 Pazartesi günü |
| 15 | Helsinki fiyatı kalkarsa temel yığın | Aylık dolar | 527 | 527 | 615 | Hesap | Aynı sayfa |
| 16 | Bulut yedeği | Sunucu fiyatının yüzdesi | 20 | 20 | 20 | Yayımlanmış | [Hetzner](https://docs.hetzner.com/cloud/billing/faq/) |
| 17 | Kiralık fiziksel sunucu, düzenli fiyat | Aylık dolar | 498 | 498 | 498 | Yayımlanmış ve hesap | [Hetzner arşivi](http://web.archive.org/web/20261022142746/https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/) |
| 18 | Frappe Cloud özel kurulum | Site başına aylık dolar | 25 | 25 | 50 | Yayımlanmış | [Frappe Cloud](https://frappe.io/cloud/shared-hosting) |
| 19 | Türkiye'de sanal sunucu | Müşteri başına aylık dolar | 30 | 55 | 75 | Yayımlanmış alt uç, toplayıcı üst uç | [OwnHost](https://www.ownhost.net/en/cloud-server) |
| 20 | Araçlar: izleme, güncelleme, e-posta, Apple | Aylık dolar | 60 | 60 ve 150 | 150 | Yayımlanmış fiyat ve tahmin | Bölüm 1.4 |
| 21 | Yapay zekâ, müşteri başına | Aylık dolar | 11 | 15 | 45 | Yayımlanmış fiyat ve hesap | [Anthropic](https://platform.claude.com/docs/en/about-claude/pricing) |
| 22 | Kart ücreti | Tahsil edilen tutarın yüzdesi | 2,19 | 2,29 | 4,29 ve işlem başı 0,25 TL | Yayımlanmış | [PayTR](https://www.paytr.com/sanal-pos-komisyon-oranlari), [Param](https://param.com.tr/sanal-pos), [iyzico](https://www.iyzico.com/fiyatlandirma) |
| 23 | Yurt içi KDV | Yüzde | 20 | 20 | 20 | Resmî | [KDVK](https://www.mevzuat.gov.tr/MevzuatMetin/1.5.3065.pdf) |
| 24 | Mali müşavir, İstanbul, limited, hizmet | Aylık TL, KDV dahil | 2.434 (indirimli, işçisiz, danışmanlıksız) | 11.713 | 12.139 | Resmî ve hesap | [RG, 17 Aralık 2025 Çarşamba günü](https://www.resmigazete.gov.tr/eskiler/2025/12/20251217-2-1.pdf) |
| 25 | E-fatura | Yıllık TL | 0 | 5.000 | 11.280 | Üçüncü taraf ve yayımlanmış | [Faturaport](https://faturaport.com/blog/e-fatura/2026-mayis-e-fatura-kontor-fiyatlari), [Paraşüt](https://www.parasut.com/on-muhasebe-fiyatlari) |
| 26 | Muhasebe satırı, modelde | Aylık dolar | 189 | 189 ve 241 | 260 | Hesap | Satır 24 ve 25 |
| 27 | Şirket kuruluşu | Bir kez TL | 24.000 | 30.000 | 42.500 | Üçüncü taraf | [Paraşüt](https://www.parasut.com/blog/limited-sirket-kurulus-maliyetleri) |
| 28 | Marka, resmî ücret | Bir kez TL | 9.830 | 15.800 | 15.800 | Resmî | [TÜRKPATENT](https://www.turkpatent.gov.tr/marka-islem-ucretleri) |
| 29 | Avukat, sözleşme başına | TL | 87.000 | 87.000 | Sözleşme değerinin yüzde 5'i | İkame | [Hukuki Haber](https://www.hukukihaber.net/istanbul-barosu-2026-yili-avukatlik-asgari-ucret-tarifesi), baro kararı 8 Aralık 2025 Pazartesi günü |
| 30 | Apple geliştirici hesabı | Yıllık dolar | 99 | 99 | 99 | Yayımlanmış | [Apple](https://developer.apple.com/programs/enroll/) |

### 1.8. Aylık sabit gider

Formül şudur (hesap):

> Sabit gider = ekip + altyapı + araçlar + muhasebe

| Yıl | Hesap | Aylık sabit gider | TL karşılığı | Ekibin payı |
|---|---|---|---|---|
| Yıl 1 | 10.000 + 206 + 60 + 189 | 10.455 dolar | 526.869 TL | Yüzde 95,6 |
| Yıl 3 | 27.000 + 527 + 150 + 241 | 27.918 dolar | 1.406.890 TL | Yüzde 96,7 |

Maliyet modeli aslında bir ekip modelidir. Sunucu, araç ve muhasebe giderin yüzde 5'inden azdır.

## 2. Ödeme ve vergi: kart ücreti küçük, KDV satıcının geliri değil

### 2.1. Kart ücreti üç senaryoda

Stripe Türkiye merkezli şirketleri kabul etmiyor. Stripe'ın ülke listesinde Türkiye yok ([Stripe](https://stripe.com/global), yayımlanmış). Bu yüzden kartla tahsilat Türk ödeme kuruluşlarıyla yapılır.

| Senaryo | Kuruluş | Ücret | Para ne zaman geçer? | Kaynak |
|---|---|---|---|---|
| İyimser | PayTR | Yüzde 2,19'dan başlar. Kurulum, yıllık ve aylık ücret yok. Son oran hacme, sektöre ve vadeye göre değişir. | Ertesi gün ya da 30 gün | Yayımlanmış ([PayTR](https://www.paytr.com/sanal-pos-komisyon-oranlari)) |
| Temel | Param | Yüzde 2,29 | Ertesi gün | Yayımlanmış ([Param](https://param.com.tr/sanal-pos)) |
| Kötümser | iyzico | Yüzde 4,29 ve işlem başı 0,25 TL. BSMV dahil. Kurumsal satıcıya özel teklif verilir. | Sayfada yazmıyor | Yayımlanmış ([iyzico](https://www.iyzico.com/fiyatlandirma)) |

TCMB'nin kart tavanı bankalar içindir. Kasım 2026'da tek çekim tavanı yüzde 3,56'dır. Banka kartında tavan yüzde 1,04'tür. Yabancı kartta tavan yüzde 1,90'dır ([TCMB tablosu](https://tcmb.gov.tr/wps/wcm/connect/ebe32165-bf61-4bde-b7c8-45ca1ad4775b/%C3%9Cye+%C4%B0%C5%9Fyerlerine+Uygulanacak+Azami+Komisyon+Oranlar%C4%B1+May%C4%B1s+2026.pdf?MOD=AJPERES), resmî). Bu tavan ödeme kuruluşlarını bağlamaz. Bu yüzden iyzico'nun liste fiyatı tavanın üstündedir.

Kart ücreti KDV dahil tutardan kesilir. Formül şudur (hesap):

> Kart ücreti = fiyat × 1,20 × kart oranı + işlem başı sabit ücret

**Yıllık tek çekim örneği (hesap).** Yıllık 180.000 TL'lik abonelik KDV'yle 216.000 TL eder.

| Kuruluş | Hesap | Kart ücreti |
|---|---|---|
| PayTR | 216.000 × 0,0219 | 4.730 TL |
| Param | 216.000 × 0,0229 | 4.946 TL |
| iyzico | 216.000 × 0,0429 + 0,25 | 9.267 TL |

Önerimiz şudur (çıkarım):

1. Yıllık peşin ödemeyi havale, EFT ya da FAST ile alın.
2. Aylık ödeyen müşteriden kartla ödeme alın.
3. Abonelik için vadeli çek kabul etmeyin.
4. Ödeme gelmezse erişimi Logo'nun kuralına benzer biçimde durdurun.

Logo yenilemede 30 günlük ek süre verir. Bu sürede ücrete yüzde 10 eklenir. Lisans 90 gün sonra kapanır ([Logo GO Wings listesi](https://cdn.logo.com.tr/files/logocomtr//Uploads/Documents/logo-go-wings-fiyat-listesi.pdf), yayımlanmış).

### 2.2. KDV ve ihracat istisnası

Yurt içinde satılan yazılım hizmetine yüzde 20 KDV eklenir. Satıcı KDV'yi müşteriden alır ve devlete öder. Bu rapordaki bütün fiyatlar KDV hariçtir.

Yurt dışına satılan hizmette KDV alınmaz. İstisna Katma Değer Vergisi Kanunu'nun 11/1-a ve 12/2 maddelerindedir ([KDVK](https://www.mevzuat.gov.tr/MevzuatMetin/1.5.3065.pdf), resmî). İstisna için iki şart gerekir:

1. Müşterinin ikametgâhı ya da iş merkezi yurt dışındadır.
2. Müşteri hizmetten yurt dışında yararlanır.

Fatura yabancı müşterinin adına kesilir. Türkiye'de kullanılan danışmanlık, fatura yurt dışına kesilse de vergilidir ([KDV Genel Uygulama Tebliği](https://www.mevzuat.gov.tr/MevzuatMetin/yonetmelik/9.5.19631.pdf), resmî). Yabancı bir grubun Türkiye şirketi ürünü Türkiye'de kullanırsa istisna yoktur (çıkarım).

Yurt dışı faturalar ayrı bir iş doğurur. Hetzner, Anthropic ve Capgo faturaları yurt dışından gelir. Bu faturaların KDV'sini alıcı şirket 2 No.lu KDV Beyannamesi ile beyan eder. Sonra bu KDV'yi indirir ([KDV Genel Uygulama Tebliği](https://www.mevzuat.gov.tr/MevzuatMetin/yonetmelik/9.5.19631.pdf), resmî). Bu işlem yalnız nakit zamanlamasını etkiler.

## 3. Fiyat çapaları: 180.000 TL alıcıya tanıdık gelir

Fiyat çapası, alıcının fiyatı karşılaştırdığı tanıdık fiyattır. Bu bölüm Türk alıcının gördüğü fiyatları toplar.

### 3.1. Logo fiyatlarını açıkça yayımlıyor

Logo, Türk iş yazılımı şirketidir. Logo TL fiyat listelerini PDF olarak yayımlar. Fiyatlar tavsiye fiyatıdır ve KDV hariçtir. Ana listeler 7 Ocak 2026 Çarşamba günü yürürlüğe girdi. İş analitiği listesi 10 Temmuz 2026 Cuma günü yenilendi.

| Ürün | İlk yıl, Plan 1 | İlk yıl, Plan 3 | 180.000 TL'nin bu fiyata oranı | Kaynak |
|---|---|---|---|---|
| Logo Mind Navigator, yönetim karar destek, 1 kullanıcı | 64.400 TL | 16.800 TL | 2,8 ile 10,7 kat | [GO Wings listesi](https://cdn.logo.com.tr/files/logocomtr//Uploads/Documents/logo-go-wings-fiyat-listesi.pdf) |
| Logo iş analitiği, 1 kullanıcı | 316.200 TL | 82.300 TL | 0,57 ile 2,2 kat | [İş analitiği listesi](https://cdn.logo.com.tr/files/logocomtr/Uploads/Documents/logo-is-analitigi-eop-fiyat-listesi.pdf) |
| Logo j-HR performans ve yetenek modülü, 100 çalışan | 294.600 TL | 76.600 TL | 0,61 ile 2,35 kat | [j-HR listesi](https://cdn.logo.com.tr/files/logocomtr/Uploads/Documents/logo-j-hr-eop-fiyat-listesi.pdf) |
| Logo Cloud Standard, bulut muhasebe | Yılda 43.900 TL | Aynı | 4,1 kat | [Logo Cloud](https://logo.com.tr/en/product/logo-cloud) |

Bütün fiyatlar yayımlanmıştır. Oranlar hesaptır. Listedeki "Mind Insight" ürünü bugün Logo Edge BI adıyla satılır ([Logo Edge BI](https://www.logo.com.tr/urun/logo-edge-bi)). Bu ürün yalnız gösterge paneli arayan alıcı için bir seçenektir.

**Çıkarım.** 180.000 TL, Logo'nun tek bir yönetim ya da insan kaynakları modülüyle aynı büyüklüktedir. Logo kullanan orta ölçekli alıcı bu fiyatı tanıdık bulur.

### 3.2. Paraşüt'ün liste fiyatı ve kampanyası

Paraşüt ön muhasebe yazılımıdır. Liste fiyatı yıllık ödemede ayda 940 TL'dir. Bu, yılda 11.280 TL eder. Kampanya fiyatı ayda 752 TL'dir. Kampanya ilk kez yıllık abone olanlar içindir. Kampanya 2 Kasım 2026 Pazartesi günü başladı. 31 Aralık 2026 Perşembe günü biter ([Paraşüt fiyatları](https://www.parasut.com/on-muhasebe-fiyatlari), yayımlanmış).

Sayfa yıllık ödemenin aylık ödemeden 8.376 TL ucuz olduğunu yazar. Buna göre aylık ödemede fiyat ayda yaklaşık 1.450 TL'dir (hesap: 9.024 + 8.376 = 17.400, bölü 12). Önceki rapor sayfada hesap hatası olduğunu yazmıştı. Bu yanlıştı. Sayfanın hesabı tutarlıdır.

180.000 TL, Paraşüt'ün yıllık liste fiyatının yaklaşık 16 katıdır. Ön muhasebeye alışmış alıcı ürünü pahalı bulur (çıkarım).

### 3.3. Danışmanlık ve devlet desteği

| Çapa | Tutar | 180.000 TL ile ilişkisi | Tür |
|---|---|---|---|
| Kocaeli Büyükşehir strateji ve kurumsal yönetim hizmeti. Sözleşme 8 Eylül 2026 Salı günü imzalandı. | 3.060.000 TL | Ürünün 17 katı | İkame, haber kaynağı ([Nokta Gazetesi](https://www.noktagazetesi.com.tr/ihale/kocaeli-buyuksehirden-3-milyonluk-vatandas-odakli-strateji-ihalesi-sirketin-sahibi-dikkat-cekti-385382)) |
| KOSGEB teknik danışmanlık desteği | Günde en çok 900 TL. Toplam en çok 40.000 TL. Teknoparkta 50.000 TL. | Ürünün yüzde 22'si ya da yüzde 28'i | Resmî ([KOSGEB uygulama esasları](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/%C4%B0sletme%20Gelistirme%20Destek%20Program%C4%B1/2026/I%CC%87s%CC%A7letme_Gelis%CC%A7tirme_Destek_Program%C4%B1_Uygulama_Esaslar%C4%B1_22.pdf), 17 Mayıs 2026 Pazar günü sürümü) |
| KOSGEB YÖNDE dijital yol haritası | Hizmet başına 20.000 TL. Program başına 40.000 TL. Destek oranı yüzde 80. | Strateji danışmanlığı için ayrı satır yok | Resmî ([YÖNDE yönergesi](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/YONDE/2026/2026.07.14/Y%C3%96NDE-Y%C3%B6nderlikveDe%C4%9FerlendirmeDestekProgram%C4%B1Y%C3%B6nergesi05.07.26.pdf)) |
| KOSGEB Kapasite Geliştirme | Kredi faizine 20 puan destek. Yazılım lisansı ve danışmanlık uygun giderdir. | Hızlı büyüyen imalat ve bilişim şirketleri içindir. | Resmî ([başvuru kılavuzu](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/KAPAS%C4%B0TE%20GEL%C4%B0ST%C4%B0RME/2026/2026.08.21/Kapasite_Gelis%CC%A7tirme_Destek_Program%C4%B1_Bas%CC%A7vuru_K%C4%B1lavuzu_v2.1.pdf)) |

**Çıkarım.** Devlet desteği ürünün fiyatının küçük bir parçasını karşılar. Bu destek satışta bir kolaylıktır. Ödeme kaynağı değildir.

**Kamu için not.** Kamu kurumu stratejik planını kendi personeliyle hazırlar. Danışmanlık desteği alabilir. Ama planı dışarıya yazdıramaz ([Vizyonder](https://www.vizyonder.org.tr/mevzuat-stratejik-plan-ve-performans-programinin-ihale-yoluyla-313), üçüncü taraf). Kamuya ürünü bir araç olarak satın.

### 3.4. Yabancı strateji araçları

| Ürün | Fiyat | TL karşılığı, yıllık | Tür |
|---|---|---|---|
| OnStrategy, kendi kendine planlama | Ayda 200 dolar. Kullanıcı sınırsız. | 120.946 TL | Yayımlanmış ([OnStrategy](https://onstrategyhq.com/pricing/)) |
| Bloom Growth Core | Ayda 299 dolar. Kullanıcı sınırsız. | 180.814 TL | Yayımlanmış ([Bloom Growth](https://www.bloomgrowth.com/pricing)) |
| 1000minds karar paketi | Yılda 25.000 dolar. Kullanıcı sınırsız. | 1.259.855 TL | Yayımlanmış ([1000minds](https://www.1000minds.com/pricing/general-decision-making)) |
| StrategyFrame giriş paketi | Yılda 15.000 avro. On lisans dahil. | 832.469 TL | İkame, satıcının verdiği yazı ([it-daily](https://www.it-daily.net/it-management/projekt-personal/ki-plattform-ersetzt-mckinsey-co-fuer-einen-bruchteil-der-kosten)) |
| Align kurulum ücreti | İlk yıl sözleşmesinin yüzde 25'i | 180.000 TL'de 45.000 TL | Yayımlanmış, arşiv kopyası ([Align](https://web.archive.org/web/20260715043600/https://aligntoday.com/pricing/)) |
| Success.co | Kullanıcı başına ayda 6 ile 12 dolar | Kullanıcıya göre değişir | Yayımlanmış ([Success.co](https://www.success.co/pricing)) |

TL karşılıkları hesaptır.

**Çıkarım.** Kullanıcı sınırsız strateji araçları ayda 200 ile 300 dolar ister. Karar paketi ayda yaklaşık 298 dolardır. Bu fiyat Bloom Growth Core ile neredeyse aynıdır. Kişi başı ucuz araçlar ise alt uçta baskı kurar.

### 3.5. Alıcının kendi maaş ölçüsü

Kurumsal gelişim yöneticisinin net maaş beklentisi ayda 74.300 TL'dir ([kariyer.net](https://www.kariyer.net/pozisyonlar/kurumsal+gelisim+yoneticisi/maas), üçüncü taraf). Bu sayı 119 kişinin son üç aydaki beklentisidir. 180.000 TL bu kişinin yaklaşık 2,4 aylık net maaşıdır (hesap). Satış konuşmasında bu karşılaştırma işe yarar (çıkarım).

## 4. Önerilen fiyat modeli

Bu bölüm önerilerimizdir. Fiyatlar hipotezdir. 10. bölümdeki görüşmeler bu fiyatları sınar.

### 4.1. Fiyat birimi: şirket ve etkin karar

Kişi başı fiyat kullanmayın. Kişi başı fiyat sizi ucuz hedef takip araçlarıyla yarıştırır. Alıcı grubu da küçüktür.

Fiyatı şirket başına ve etkin karar sayısına göre koyun. Basecamp yalnız etkin proje sayısına göre fiyat alır. Arşivdeki proje sayılmaz ([Basecamp](https://basecamp.com/pricing), yayımlanmış). Etkin karar da böyle tanımlanır:

1. Karar hazırlık kapısında etkin olur.
2. Karar, gözden geçirme döngüsü kapanınca etkinliğini yitirir.
3. Arşivdeki karar okunabilir kalır. Arşiv için ücret alınmaz.

Bu birim büyümeye de yardım eder. Benchmarkit 2026 raporuna göre kişi başı fiyatta net gelir tutma ortancası yüzde 98'dir. Kullanıma göre fiyatta yüzde 108'dir ([Aleph, Benchmarkit 2026 özeti](https://www.getaleph.com/blog/2026-saas-benchmarks-takeaways), raporun ortak yazarının özeti). Etkin karar kullanıma benzer bir birimdir (çıkarım).

Bu birimin bir riski vardır. Müşteri birkaç kararı tek kararda birleştirebilir. Böylece daha az öder. Bu risk bilinmeyenler raporunda D1 adayıdır ([bilinmeyenler raporu](<Karar Atlası bilinmeyen bilinmeyenler güncel.md>)). Sözleşme bir kararın kapsamını yazmalıdır. Örneğin tek bir yatırım ya da tek bir pazar kararı (çıkarım).

### 4.2. Paketler

| Paket | Kime? | Ne içerir? | Fiyat, KDV hariç | Tür |
|---|---|---|---|---|
| Karar | Aile kökenli orta ölçekli şirket | 1 etkin karar, yaklaşık 15 düzenleyici, sınırsız okur, 2 saat destek | Yılda 180.000 TL, peşin. Aylık ödemede ayda 18.000 TL. | Varsayım |
| Şirket | Birden çok kararı olan şirket | En çok 3 etkin karar, hedefler, kaynak izinleri, gözden geçirmeler | Yılda 300.000 ile 480.000 TL | Varsayım |
| İzleme | Kararı kapanmış müşteri | Arşiv, gözden geçirme ritmi ve değer raporu | 2. görüşme turunda sınanır | Çıkarım |
| Kurumsal | Holding ve büyük şirket | Sınırsız etkin karar | Teklifle | Çıkarım |

Aylık fiyat Logo Cloud'un kuralından gelir. Logo Cloud'da yıllık fiyat 10 aylık fiyata eşittir ([Logo Cloud](https://logo.com.tr/en/product/logo-cloud), yayımlanmış). Aynı kuralla aylık fiyat 180.000 ÷ 10 = 18.000 TL olur (hesap).

Ek ücretli seçenekler şunlardır:

1. Kurulum ve pilot paketi
2. Türkiye'de barındırma
3. Ek yapay zekâ kredisi, yapay zekâ çıkınca
4. Paket dışı destek saati

İzleme paketi bir kayıp riskine cevaptır. Müşteri tek karar için gelir. Karar bitince ödeme nedeni de bitebilir. İzleme paketi müşteriyi daha ucuz bir pakette tutar.

### 4.3. TL fiyatını her yıl güncelleyin

Ekim 2026'da yıllık TÜFE yüzde 29,77'dir. Yurt içi üretici fiyatları yüzde 27,41 arttı ([TCMB, Ekim ayı fiyat gelişmeleri](https://www.tcmb.gov.tr/wps/wcm/connect/15fe8641-cdde-4e1e-846a-446eed1d9447/afiyatekim26.pdf?MOD=AJPERES), resmî). TCMB bu raporu 4 Kasım 2026 Çarşamba günü yayımladı. Sabit TL fiyatı her yıl değer kaybeder. Sunucu ve yapay zekâ ise dolar ya da avroyla ödenir.

Ürün sahibi fiyatı şu kurallarla yönetir:

1. Ürün sahibi TL fiyat listesini her yıl ocak başında yayımlar.
2. Listede yürürlük tarihi yazar.
3. Liste en az yıllık TÜFE kadar artar.
4. Ürün sahibi yıl ortasında yeni liste yayımlama hakkını saklı tutar.
5. Sözleşme "Yenileme, yenileme günündeki liste fiyatıyla yapılır." der.
6. Çok yıllık sözleşmeye bir endeks maddesi yazılır.

Logo da yenilemeyi o günkü liste fiyatıyla yapar ([GO Wings listesi](https://cdn.logo.com.tr/files/logocomtr//Uploads/Documents/logo-go-wings-fiyat-listesi.pdf), yayımlanmış). Logo 2026'da iş analitiği listesini yıl içinde ikinci kez yeniledi.

**Örnek (hesap).** TÜFE yüzde 29,77 kalırsa Karar paketi 2027'de yılda 233.586 TL olur. Formül: 180.000 × 1,2977.

### 4.4. Yapay zekâ kotası ve kredi

Yapay zekâ bugün üründe yoktur. Kota, özellik hazır olunca uygulanır.

1. Her pakete aylık bir yapay zekâ kotası koyun.
2. Kotanın maliyeti müşteri başına ayda 45 doları geçmesin. Bu yaklaşık 2.268 TL eder.
3. Kullanımı yönetici ekranında gösterin.
4. Kotayı aşan kullanımı kredi olarak satın.
5. Krediyi maliyetin 3 ile 5 katına satın.
6. Her kurumda "yapay zekâ kapalı" seçeneğini koruyun.

**Kredi örneği (hesap).** 100 taslak ya da özet işlemi İngilizcede yaklaşık 7,5 dolar tutar. Türkçe katsayı 2,0 ile bu 15 dolar olur. 3 ile 5 katı 45 ile 75 dolardır. Bu yaklaşık 2.268 ile 3.780 TL eder.

### 4.5. Kurulum ve pilot: hizmet zarar da edebilir

Pilot, tek bir gerçek kararla yapılan sınırlı denemedir. Pilot yaklaşık 8 hafta sürer. Pilot sunucu sürümü hazır olunca teklif edilir. O zamana kadar ekip üyesiz, tek cihazlı ön pilot yapılır ([Derin hizmet ve yetki modeli](<Derin hizmet ve yetki modeli.md>)).

Pilot fiyatı için önerimiz şudur (varsayım):

> Pilot paketi = 2 aylık abonelik + kurulum ücreti = 30.000 + 50.000 = 80.000 TL

Kurulum ücretinin iki çapası vardır:

1. Align ilk yıl sözleşmesinin yüzde 25'ini kurulum ücreti alır. Bu, 180.000 TL'de 45.000 TL eder.
2. KOSGEB'in teknik danışmanlık desteği toplam 40.000 TL'dir.

**Hizmet işi zarar edebilir.** Workday büyük bir SaaS şirketidir. 31 Ocak 2026 Cumartesi günü biten mali yılda abonelik geliri 8.833 milyon dolardı. Aboneliğin maliyeti 1.531 milyon dolardı. Hizmet geliri 719 milyon dolardı. Hizmetin maliyeti 790 milyon dolardı ([Workday 10-K](https://www.sec.gov/Archives/edgar/data/1327811/000132781126000014/wday-20260131.htm), şirket belgesi). Hesap şöyledir (hesap):

1. Abonelik brüt kâr marjı = (8.833 − 1.531) ÷ 8.833 = yüzde 82,7.
2. Hizmet marjı = (719 − 790) ÷ 719 = eksi yüzde 9,9.
3. Hizmetin gelirdeki payı = 719 ÷ (8.833 + 719) = yüzde 7,5.

Önceki rapor "hizmet geliri yüzde 15'i geçmesin" kuralını zayıf bir kaynağa dayandırmıştı. Bu rapor kuralı Workday belgesiyle değiştirir. Yeni kural şudur (çıkarım):

1. Kurulum ücreti kurulumun gerçek maliyetini karşılar.
2. Ürün sahibi ilk 5 pilotta kurulum saatini ölçer.
3. Ürün sahibi fiyatı ölçülen saate göre düzeltir.
4. Model kurulumu kâr kaynağı saymaz. Kurulum geliri nakit ihtiyacından düşülmez.

Gelir kaydı için bir kural daha vardır. IFRS 15 standardı geliri teslim edilen işe bağlar ([IFRS 15](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/)). Bu yüzden teklifte kurulum, eğitim, veri hazırlığı ve uzman incelemesi ayrı satır olur. Danışman ücreti olumlu bir yatırım kararına bağlanmaz. "Beklet" kararı da iyi bir sonuç olabilir.

### 4.6. İş ortağı payı bir hipotezdir

Türk yazılım pazarı ortaklarla çalışır. Logo 1.000'den fazla ortakla 230.000'den fazla müşteriye satar ([Logo faaliyet raporu](https://cdn.logo.com.tr/Files/logocomtr/Uploads/Documents/Faaliyet-Raporu-31-Mart-2026.pdf), şirket belgesi). Bu, ortak başına yaklaşık 230 müşteri eder (hesap). Hiçbir Türk satıcı ortak payını yayımlamıyor. Paraşüt mali müşavirlere ücretsiz araç verir ([Paraşüt mali müşavir kanalı](https://www.parasut.com/mali-musavir-kanali), yayımlanmış).

Önerimiz şudur (varsayım):

1. İlk yıl yalnız yönlendirme ortaklığı kurun.
2. Ortaktan gelen müşterinin aboneliğinden ortağa yüzde 20 pay verin.
3. Ortağa yüzde 25'ten fazla pay vermeyin.
4. Üç aylık gözden geçirmeyi ortak yürütür. Müşteri bu işi ortağa öder.
5. Ortağın müşterisine de 2 saatlik destek sınırı uygulanır.

Modelde ortak payı şöyle girer:

> Kanal oranı = ortaktan gelen müşteri oranı × ortak payı

Temel senaryoda kanal oranı yüzde 50 × yüzde 20 = yüzde 10'dur.

### 4.7. Destek saati: ayda 2 saat sınırdır

Gainsight müşteri başarısı yazılımı satar. Gainsight kendi verisini yayımladı ([Gainsight](https://www.gainsight.com/blog/gainsight-horizon-ai-labs-what-is-the-right-csm-to-customer-ratio/), satıcının kendi analizi). Küçük sözleşmede bir kişi yaklaşık 144 müşteriye bakar. Küçük sözleşme, yılda 10.000 doların altındaki sözleşmedir. Bu veri yıllık geliri 100 milyon doları aşan ABD şirketlerinden gelir. Bu yüzden küçük bir satıcı için yalnız üst sınır ölçüsüdür.

Karar paketi yılda yaklaşık 3.572 dolardır (hesap). Bir kişi ayda yaklaşık 140 saat verimli çalışır (varsayım).

| Müşteri başına aylık destek | Bir kişinin bakabildiği müşteri |
|---|---|
| 1 saat | 140 |
| 2 saat | 70 |
| 3 saat | 47 |
| 4 saat | 35 |
| 6 saat | 23 |

Aylık ortalama yoğun haftayı gizler. Codex bir örnek hesap verdi. 8 müşteri aynı hafta 6'şar saat isterse 48 saat gerekir. Haftalık kapasite 32 saatse 16 saat açık kalır ([Codex aktarım listesi](<../research_notes/Codex belgelerinden alınanlar/codex_aktarim_listesi.md>), örnek hesap). Pilotlar aynı haftaya yığılmamalıdır (çıkarım).

Ürün sahibi destek için şu kuralları uygular:

1. Her pakete müşteri başına ayda 2 saat destek koyun.
2. Sınırı aşan işi saat başına ücretlendirin.
3. Her destek saatini müşteri adına kaydedin.
4. Tek müşteriye özel geliştirme yapmayın.

## 5. Müşteri tutma: küçük sözleşmede ortanca yüzde 90

SaaS Capital, kredi veren bir yatırım şirketidir. 2025 tutma raporunu Eylül 2025'te yayımladı ([SaaS Capital](https://www.saas-capital.com/wp-content/uploads/2025/09/RB32WS1-2025-B2B-SaaS-Retention-Benchmarks.pdf), birincil araştırma).

| Yıllık sözleşme bandı | Net gelir tutma, ortanca | Brüt gelir tutma, ortanca | Net gelir tutma, alt çeyrek | Net gelir tutma, üst çeyrek |
|---|---|---|---|---|
| 12.000 doların altı | %98 | %90 | %90 | %106 |
| Bütün şirketler | %101 | %91 | Yok | Yok |

| Sözleşme süresi | Net gelir tutma | Brüt gelir tutma |
|---|---|---|
| Çok yıllık | %103 | %94 |
| Yıllık | %101 | %90 |
| Aylık | %100 | %89 |

Rapor bir uyarı da yapar. Brüt gelir tutma en az yüzde 90 olmalıdır. Rapor yıllık geliri 1 milyon doların altındaki şirketleri saymaz. Karar Atlası ilk yıllarda bu sınırın altındadır.

Benchmarkit'in 2026 raporu 2025 yılını ölçer. 342 şirkette brüt gelir tutma ortancası yüzde 84'tür. Müşteri kazanma maliyetinin geri ödemesi 16 aydır. Yazılımda brüt kâr marjı ortancası yüzde 80'dir. Bu sayılar raporun ortak yazarının özetinden gelir ([Aleph, Benchmarkit 2026 özeti](https://www.getaleph.com/blog/2026-saas-benchmarks-takeaways), ikame). Benchmarkit'in 2025 raporu brüt gelir tutmayı yüzde 88 vermişti ([Benchmarkit 2025](https://www.benchmarkit.ai/2025benchmarks), birincil araştırma). Önceki rapor yüzde 84'ü yanlışlıkla 2025 raporuna bağlamıştı.

Karar paketi yılda yaklaşık 3.572 dolardır. Şirket paketi 5.953 ile 9.525 dolardır (hesap). İki paket de "12.000 doların altı" bandındadır.

| Senaryo | Yıllık müşteri kaybı | Dayanak | Tür |
|---|---|---|---|
| İyimser | %6 | Çok yıllık sözleşmede brüt gelir tutma yüzde 94 | Birincil araştırma |
| Temel | %10 | 12.000 doların altında brüt gelir tutma yüzde 90 | Birincil araştırma |
| Kötümser | %16 | 2025 yılı brüt gelir tutma ortancası yüzde 84 | İkame |
| Ürüne özgü risk | %40 | Karar bitince müşteri ayrılırsa | Varsayım |

Yenilemeyi doğru sayın. Yenileme oranı yalnız süresi dolan sözleşmeler arasında hesaplanır. Örneğin 10 sözleşmenin süresi doldu. 7'si yenilendi, 2'si reddetti, 1'i açık kaldı. İkinci kararın açılması ayrı sayılır ([Codex aktarım listesi](<../research_notes/Codex belgelerinden alınanlar/codex_aktarim_listesi.md>), sayım kuralı).

## 6. Senaryolar yeniden kuruldu: temel senaryo 125 müşteride başa baş olur

Model 16 Kasım 2026 Pazartesi günü bir Python betiğiyle yeniden çalıştırıldı. Bütün sonuçlar aşağıdaki formüllerden gelir.

### 6.1. Formüller

1. Fiyat, dolar = aylık TL fiyatı ÷ 50,3942
2. Ödeme ücreti = kartla ödeyenlerin oranı × (fiyat × 1,20 × kart ücreti + işlem başı ücret ÷ 50,3942)
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
13. Başa baş fiyatı = (sabit gider ÷ müşteri sayısı + değişken maliyet) ÷ (1 − kanal oranı − 1,20 × kartla ödeyenlerin oranı × kart ücreti)
14. Yıllık yeni müşteri = (yıl 3 müşterisi − yıl 1 müşterisi × (1 − kayıp)²) ÷ (2 − kayıp)

Formüllerle ilgili dört not vardır:

1. 1,20 çarpanı KDV'dir. Kart ücreti KDV dahil tutardan kesilir.
2. Başa baş sayısı yukarı yuvarlanır. Örneğin 124,8 müşteri 125 olur.
3. Ortak payı satış gideridir. Brüt kâr marjına girmez. Ama katkı payına girer.
4. 14. formül yıl 2 ve yıl 3'te eşit satış varsayar.

### 6.2. Girdiler

Ekip gideri üç senaryoda aynıdır. Böylece senaryolar yalnız pazar tarafını karşılaştırır. Ekip gideri 6.6 bölümünde ayrıca değiştirilir.

| Girdi | Kötümser | Temel | İyimser | Tür |
|---|---|---|---|---|
| Aylık fiyat | 9.000 TL, 178,59 dolar | 15.000 TL, 297,65 dolar | 25.000 TL, 496,09 dolar | Varsayım. 10. bölümdeki görüşme fiyatlarıdır. |
| Kanal oranı | %60 × %25 = %15 | %50 × %20 = %10 | %40 × %20 = %8 | Varsayım |
| Kartla ödeyenler | %100 | %50 | %20 | Varsayım |
| Kart ücreti | %4,29 ve 0,25 TL, iyzico | %2,29, Param | %2,19, PayTR | Yayımlanmış |
| Yapay zekâ, aylık | 45 dolar | 15 dolar | 11 dolar | Hesap |
| Yedek ve e-posta, aylık | 1,50 dolar | 1,00 dolar | 0,70 dolar | Tahmin |
| Aylık destek saati | 4 | 2 | 1 | Varsayım |
| Destek saat ücreti | 19,41 dolar | 12,08 dolar | 10,14 dolar | Hesap: rol maliyeti ÷ 140 saat |
| Yıllık müşteri kaybı | %16 | %10 | %6 | Birincil araştırma ve ikame |
| Yıl 1 sonunda müşteri | 5 | 15 | 30 | Varsayım |
| Yıl 3 sonunda müşteri | 25 | 80 | 200 | Varsayım |
| Ekip, yıl 1 ve yıl 3 | 10.000 ve 27.000 dolar | 10.000 ve 27.000 dolar | 10.000 ve 27.000 dolar | Hesap |
| Altyapı, yıl 1 ve yıl 3 | 206 ve 527 dolar | 206 ve 527 dolar | 206 ve 993 dolar | Hesap |
| Araçlar, yıl 1 ve yıl 3 | 60 ve 150 dolar | 60 ve 150 dolar | 60 ve 150 dolar | Tahmin |
| Muhasebe, yıl 1 ve yıl 3 | 189 ve 241 dolar | 189 ve 241 dolar | 189 ve 241 dolar | Resmî tarife ve hesap |

Destek saat ücreti üç rolden gelir. Kötümser senaryo müşteri başarı yöneticisini kullanır. Temel senaryo kurumsal destek uzmanını kullanır. İyimser senaryo müşteri destek uzmanını kullanır. Üç maaş da kariyer.net'ten gelir.

Müşteri sayıları önceki raporla aynıdır. Böylece raporlar karşılaştırılabilir.

### 6.3. Sonuçlar

| Sonuç | Kötümser | Temel | İyimser |
|---|---|---|---|
| Ödeme ücreti, müşteri başına aylık | 9,20 dolar | 4,09 dolar | 2,61 dolar |
| Değişken maliyet, destek dahil | 124,13 dolar | 40,16 dolar | 21,84 dolar |
| Katkı payı, müşteri başına aylık | 18,48 dolar, 931 TL | 223,64 dolar, 11.270 TL | 431,96 dolar, 21.768 TL |
| Yıl 1 aylık sabit gider | 10.455 dolar | 10.455 dolar | 10.455 dolar |
| Yıl 1 yıllık tekrarlayan gelir | 0,54 milyon TL | 2,70 milyon TL | 9,00 milyon TL |
| Yıl 1 brüt kâr marjı | %−4,4 | %79,2 | %93,3 |
| Yıl 1 aylık faaliyet sonucu | −10.363 dolar, −522.213 TL | −7.100 dolar, −357.815 TL | +2.504 dolar, +126.178 TL |
| Yıl 1 başa baş müşteri sayısı | 566 | 47 | 25 |
| Yıl 3 aylık sabit gider | 27.918 dolar | 27.918 dolar | 28.384 dolar |
| Yıl 3 yıllık tekrarlayan gelir | 2,70 milyon TL | 14,40 milyon TL | 60,00 milyon TL |
| Yıl 3 brüt kâr marjı | %10,2 | %82,3 | %93,9 |
| Yıl 3 aylık faaliyet sonucu | −27.456 dolar, −1.383.613 TL | −10.026 dolar, −505.273 TL | +58.008 dolar, +2.923.268 TL |
| Yıl 3 başa baş müşteri sayısı | 1.512 | 125 | 66 |
| Müşteri ömrü | 6,25 yıl | 10 yıl | 16,7 yıl |
| Ömür boyu katkı | 1.386 dolar | 26.837 dolar | 86.392 dolar |
| En yüksek kazanma maliyeti | 462 dolar | 8.946 dolar | 28.797 dolar |
| Geri ödeme, kazanma maliyeti bir yıllık fiyata eşitse | 116 ay | 16,0 ay | 13,8 ay |
| Yıl 2 ve yıl 3'te gereken yıllık yeni müşteri | 11,7 | 35,7 | 89,4 |

Bütün sonuçlar hesaptır. Girdilerin çoğu varsayımdır.

**Sonuçları şöyle okuyun (çıkarım):**

1. Kötümser senaryo hiçbir zaman başa baş olmaz. Düşük fiyat, 4 saat destek ve yoğun yapay zekâ katkıyı neredeyse sıfırlar.
2. Temel senaryo yıl 1'de ve yıl 3'te zarar eder. Yıl 3'te 80 müşteri vardır. Başa baş için 125 müşteri gerekir.
3. İyimser senaryo yıl 1'in sonunda kâra geçer. Ama yılda yaklaşık 89 yeni müşteri ister.
4. Temel senaryoda brüt kâr marjı yüzde 82'dir. Benchmarkit'in yazılım ortancası yüzde 80'dir. Ürünün kendisi kârlıdır. Zararı ekip gideri doğurur.
5. Temel senaryoda geri ödeme süresi 16,0 aydır. Benchmarkit 2026 ortancası da 16 aydır.

### 6.4. Temel senaryoyu adım adım okuyun

1. Fiyat = 15.000 ÷ 50,3942 = 297,65 dolar.
2. Ortak payından sonra kalan = 297,65 × 0,90 = 267,89 dolar.
3. Ödeme ücreti = 0,50 × 297,65 × 1,20 × 0,0229 = 4,09 dolar.
4. Destek = 2 saat × 12,08 = 24,16 dolar.
5. Değişken maliyet = 15 + 1 + 24,16 = 40,16 dolar.
6. Katkı payı = 267,89 − 4,09 − 40,16 = 223,64 dolar. Bu 11.270 TL eder.
7. Yıl 1 başa baş = 10.455 ÷ 223,64 = 46,7. Yani 47 müşteri.
8. Yıl 3 başa baş = 27.918 ÷ 223,64 = 124,8. Yani 125 müşteri.
9. Yıl 3'te müşteri sayısı 80'dir. 80, 125'in altındadır.
10. Bu yüzden temel senaryo yıl 3'te ayda 10.026 dolar zarar eder.

Doğrulama notu yıl 3 eşiğini yaklaşık 124 buldu. O hesap yapay zekâyı 11 dolar sayar. Bu rapor Türkçe katsayıyı 2,0 alır ve 15 dolar sayar. Fark 1 müşteridir.

### 6.5. Asıl darboğaz satış hızıdır

**Başa baş fiyatı.** Müşteri sayısı azsa fiyat yüksek olmalıdır. Tablo temel maliyetlerle hesaplandı (hesap).

| Müşteri sayısı | Gider yılı | Başa baş aylık fiyat | Başa baş yıllık fiyat |
|---|---|---|---|
| 15 | Yıl 1 | 41.916 TL | 502.989 TL |
| 80 | Yıl 3 | 22.126 TL | 265.518 TL |
| 125 | Yıl 3 | 14.983 TL | 179.796 TL |
| 200 | Yıl 3 | 10.221 TL | 122.648 TL |

15.000 TL'lik fiyat ancak 125 müşteride gideri karşılar.

**Satış hızı.** Temel senaryo yıl 2 ve yıl 3'te yılda yaklaşık 36 yeni müşteri ister. Bu ayda 3 müşteri eder. Yıl 3'te başa baş için yılda yaklaşık 59 yeni müşteri gerekir. Bu ayda 5 müşteri eder (hesap).

ICP notları örnek bir kapasite hesabı verir. Kurucu ayda 20 nitelikli görüşme yapar. Görüşmelerin yüzde 15'i satışa döner. Bu yılda yaklaşık 36 müşteri eder ([ICP yöntemi notları](<../research_notes/Derin ICP ve persona analizi/icp_yontemi_ve_buyukluk.md>), varsayım). Yılda 59 müşteri için tek kişilik satış yetmez. İkinci bir satışçı ya da etkin bir ortak kanalı gerekir (çıkarım).

**Pazar büyüklüğü darboğaz değildir.** Türkiye'de 2025'te 50 ile 249 çalışanlı 34.072 şirket vardı ([TÜİK, bülten 58132](https://veriportali.tuik.gov.tr/tr/press/58132), resmî). 125 müşteri bu şirketlerin yaklaşık yüzde 0,37'sidir (hesap). Önünde büyük ve açık bir karar olan aile şirketi daha azdır. Bu oran ilk görüşme turunda ölçülür.

### 6.6. Duyarlılık: yedi girdi sonucu nasıl değiştiriyor?

Bu tablolarda yalnız bir girdi değişir. Öteki girdiler temel senaryodadır.

**Ekip gideri.** Başa baş sayısını en çok bu girdi değiştirir.

| Yıl | Aylık ekip gideri | Aylık sabit gider | Başa baş müşteri sayısı |
|---|---|---|---|
| Yıl 1 | 9.122 dolar, küçük şirket ortancası | 9.577 dolar | 43 |
| Yıl 1 | 10.000 dolar, temel | 10.455 dolar | 47 |
| Yıl 1 | 11.874 dolar, bütün şirket ortancası | 12.329 dolar | 56 |
| Yıl 3 | 24.303 dolar, küçük şirket ortancası | 25.221 dolar | 113 |
| Yıl 3 | 25.000 dolar, önceki temel | 25.918 dolar | 116 |
| Yıl 3 | 27.000 dolar, yeni temel | 27.918 dolar | 125 |
| Yıl 3 | 29.836 dolar, bütün şirket ortancası | 30.754 dolar | 138 |
| Yıl 3 | 35.803 dolar, yüzde 20 genel giderle | 36.721 dolar | 165 |

**Fiyat.**

| Aylık fiyat | Yıllık fiyat | Aylık katkı payı | Başa baş, yıl 1 | Başa baş, yıl 3 |
|---|---|---|---|---|
| 9.000 TL | 108.000 TL | 5.953 TL | 89 | 237 |
| 12.000 TL | 144.000 TL | 8.611 TL | 62 | 164 |
| 15.000 TL | 180.000 TL | 11.270 TL | 47 | 125 |
| 18.000 TL | 216.000 TL | 13.929 TL | 38 | 101 |
| 20.000 TL | 240.000 TL | 15.702 TL | 34 | 90 |
| 25.000 TL | 300.000 TL | 20.133 TL | 27 | 70 |

Fiyat 15.000 TL'den 9.000 TL'ye inerse gereken müşteri yaklaşık iki katına çıkar.

**Yıllık müşteri kaybı.** Kayıp başa baş sayısını değiştirmez. Ama gereken satışı ve müşterinin değerini değiştirir.

| Yıllık kayıp | Müşteri ömrü | Ömür boyu katkı | En yüksek kazanma maliyeti | 125 müşteriyi korumak için yıllık satış | Yıl 3'te 125'e varmak için yıllık satış |
|---|---|---|---|---|---|
| %6 | 16,7 yıl | 44.728 dolar | 14.909 dolar | 7,5 | 57,6 |
| %10 | 10 yıl | 26.837 dolar | 8.946 dolar | 12,5 | 59,4 |
| %16 | 6,25 yıl | 16.773 dolar | 5.591 dolar | 20,0 | 62,2 |
| %25 | 4 yıl | 10.735 dolar | 3.578 dolar | 31,2 | 66,6 |
| %40 | 2,5 yıl | 6.709 dolar | 2.236 dolar | 50,0 | 74,7 |

10 yıllık müşteri ömrü uzun bir varsayımdır. Yeni bir ürün için bunu iyimser okuyun.

**Destek saati.**

| Aylık destek | Katkı, saat 12,08 dolar | Başa baş, yıl 3 | Katkı, saat 19,41 dolar | Başa baş, yıl 3 | Bir kişinin bakabildiği müşteri |
|---|---|---|---|---|---|
| 1 saat | 235,7 dolar | 119 | 228,4 dolar | 123 | 140 |
| 2 saat | 223,6 dolar | 125 | 209,0 dolar | 134 | 70 |
| 3 saat | 211,6 dolar | 132 | 189,6 dolar | 148 | 47 |
| 4 saat | 199,5 dolar | 140 | 170,2 dolar | 165 | 35 |
| 6 saat | 175,3 dolar | 160 | 131,4 dolar | 213 | 23 |

Destek saati tek başına modeli bozmaz. Ama 6 saat ve pahalı saat birleşirse eşik 213 müşteriye çıkar.

**Kart ücreti.** Kart ücreti eşiği en çok 7 müşteri değiştirir.

| Kuruluş ve ücret | Kartla ödeyenler %50 | Başa baş, yıl 3 | Kartla ödeyenler %100 | Başa baş, yıl 3 |
|---|---|---|---|---|
| PayTR, %2,19 | 3,91 dolar | 125 | 7,82 dolar | 127 |
| Param, %2,29 | 4,09 dolar | 125 | 8,18 dolar | 128 |
| Banka tavanı, %3,56 | 6,36 dolar | 127 | 12,72 dolar | 130 |
| iyzico, %4,29 ve 0,25 TL | 7,66 dolar | 127 | 15,33 dolar | 132 |

**Hetzner fiyatı.** Altyapı eşiği en çok 2 müşteri değiştirir.

| Yıl 3 altyapısı | Aylık dolar | Aylık sabit gider | Başa baş, yıl 3 |
|---|---|---|---|
| Kiralık fiziksel sunucu, düzenli fiyat | 498 | 27.889 dolar | 125 |
| Temel yığın, Helsinki fiyatı | 527 | 27.918 dolar | 125 |
| Temel yığın, Helsinki fiyatı kalkarsa | 615 | 28.006 dolar | 126 |
| Yüksek yığın | 993 | 28.384 dolar | 127 |

Helsinki fiyatı kalkarsa eşik 124,8'den 125,2'ye çıkar. Yuvarlamayla bu 1 müşteridir.

**Yapay zekâ maliyeti.**

| Müşteri başına aylık yapay zekâ | Katkı payı | Başa baş, yıl 1 | Başa baş, yıl 3 |
|---|---|---|---|
| 0 dolar, yapay zekâ yok | 238,6 dolar | 44 | 117 |
| 11 dolar, katsayı 1,48 | 227,6 dolar | 46 | 123 |
| 15 dolar, katsayı 2,0 | 223,6 dolar | 47 | 125 |
| 30 dolar | 208,6 dolar | 51 | 134 |
| 45 dolar, kota tavanı | 193,6 dolar | 54 | 145 |
| 60 dolar, kotasız yoğun kullanım | 178,6 dolar | 59 | 157 |

**Sıralama (çıkarım).**

1. Ekip gideri ve fiyat başa baş sayısını en çok değiştirir.
2. Müşteri kaybı gereken satış hızını belirler.
3. Destek saati ekip büyüklüğünü belirler.
4. Yapay zekâ kotasız kalırsa eşiği 32 müşteri yükseltir.
5. Kart ücreti ve Hetzner fiyatı küçük etkidir.

### 6.7. Ürüne özgü risk: karar bitince müşteri ayrılırsa

Bu risk bir varsayımdır. Ama ürünün yapısından gelir. Müşteri tek bir büyük karar için gelir. Karar bitince ödeme nedeni de bitebilir.

Kayıp yüzde 40 olursa şunlar olur (hesap):

1. Müşteri ömrü 2,5 yıla düşer.
2. Ömür boyu katkı 6.709 dolara düşer. Bu yaklaşık 338.106 TL eder.
3. En yüksek kazanma maliyeti 2.236 dolardır. Bu bir yıllık fiyattan düşüktür.
4. 125 müşteriyi korumak için her yıl 50 yeni müşteri gerekir.

Bu riski düşürmek için dört yol vardır (çıkarım):

1. Kararı kapanan müşteriye İzleme paketini önerin.
2. İş ortağı üç aylık gözden geçirmeyi yürütsün.
3. İkinci kararı açmayı kolaylaştırın. Örneğin ilk kararın kanıtları yeni plana taşınsın.
4. Çok yıllık sözleşme önerin. Çok yıllık sözleşmede brüt gelir tutma yüzde 94'tür.

### 6.8. Destek iki kez sayılıyor: bu bilinçli bir ihtiyattır

Destek saati değişken maliyete girer. Yıl 3 ekibinde de bir destek uzmanı vardır. Yani destek kısmen iki kez sayılır. Destek uzmanı ekipten çıkarılırsa yıl 3 eşiği 125'ten 119'a iner (hesap: (27.918 − 1.419) ÷ 223,64 = 118,5). Model ihtiyat için iki kez saymayı korur. Ürün sahibi pilotlarda gerçek destek saatini ölçünce bu ihtiyat kaldırılabilir.

## 7. Nakit ihtiyacı: yıl 1'de 5,5, üç yılda 21,4 milyon TL

Bu bölüm kurucunun bulması gereken parayı hesaplar. Kurucu ücreti ayrı bir satırdır. Ücreti ürün sahibi belirler.

### 7.1. Hesap kuralları

Formül şudur (hesap):

> Aylık zarar = sabit gider − ortalama müşteri sayısı × katkı payı.
>
> Nakit ihtiyacı = aylık zararların toplamı + bir kerelik giderler + kurucu ücreti.

Hesap şu kabullerle yapıldı:

1. Müşteriler aylık öder.
2. Yıl 1'de müşteri sayısı 0'dan 15'e düz bir çizgiyle artar.
3. Yıl 2 ve yıl 3'te yılda 35,7 yeni müşteri gelir. Kayıp her ay düşülür.
4. Yıl 2 ekibi ayda 18.500 dolardır. Bu, yıl 1 ile yıl 3'ün ortasıdır. Bu bir varsayımdır.
5. Yıl 2'de altyapı 527 dolar, araçlar 105 dolardır.
6. Kurulum geliri kurulumun maliyetine eşit sayılır. Bu, Workday kuralıdır.
7. Katkı payı temel senaryodaki 223,64 dolardır.

Aylık kayıp yüzünden yıl 3 yaklaşık 77 müşteriyle biter.

### 7.2. Yıl 1

| Kalem | Dolar | TL |
|---|---|---|
| İşletme zararı | 105.332 | 5,31 milyon |
| Bir kerelik giderler: kuruluş, marka, sözleşmeler | 4.362 | 0,22 milyon |
| Toplam, kurucu ücreti hariç | 109.693 | 5,53 milyon |
| Güvenlik payı: 3 aylık sabit gider | 31.365 | 1,58 milyon |

Güvenlik payı bir öneridir. Tahsilat gecikirse şirket bu payla 3 ay dayanır (çıkarım).

**Kurucu ücreti ayrı satırdır.** Ücretin dört seçeneği vardır. Tutarlar işverene maliyettir.

| Seçenek | Aylık dolar | Yıl 1'de dolar | Yıl 1 toplamı, dolar | Yıl 1 toplamı, TL |
|---|---|---|---|---|
| Ücret yok | 0 | 0 | 109.693 | 5,53 milyon |
| Asgari ücret | 798 | 9.576 | 119.269 | 6,01 milyon |
| Kurumsal satış yöneticisi ölçüsü | 2.566 | 30.792 | 140.485 | 7,08 milyon |
| Kıdemli geliştirici ölçüsü | 6.620 | 79.440 | 189.133 | 9,53 milyon |

Kurucu yıl 1'de satışı yürütür. Bu yüzden satış yöneticisi ölçüsü makul bir ortadır (çıkarım). Bu seçenekle güvenlik payı dahil yıl 1 ihtiyacı 171.850 dolardır. Bu yaklaşık 8,66 milyon TL eder (hesap).

**Yıllık peşin ödeme nakit ihtiyacını düşürür.** Yıl 1'deki 15 müşteri yıllık peşin öderse kasaya yaklaşık 24.110 dolar daha erken girer. Bu 1,22 milyon TL eder (hesap). Para bir yıl erken gelir. Gelir artmaz.

### 7.3. Yıl 3 ve üç yılın toplamı

| Kalem | Dolar | TL |
|---|---|---|
| Yıl 2 işletme zararı | 147.167 | 7,42 milyon |
| Yıl 3 işletme zararı | 167.437 | 8,44 milyon |
| Üç yılın toplamı, bir kerelik giderler dahil, kurucu ücreti hariç | 424.297 | 21,38 milyon |
| Yıl 3 güvenlik payı: 3 aylık sabit gider | 83.753 | 4,22 milyon |

Kurucu ücreti eklenince tablo şöyle olur:

| Kurucu ücreti seçeneği | Yıl 3 tek başına | Üç yılın toplamı |
|---|---|---|
| Ücret yok | 8,44 milyon TL | 21,38 milyon TL |
| Asgari ücret | 8,92 milyon TL | 22,83 milyon TL |
| Kurumsal satış yöneticisi ölçüsü | 9,99 milyon TL | 26,04 milyon TL |
| Kıdemli geliştirici ölçüsü | 12,44 milyon TL | 33,39 milyon TL |

Bütün tutarlar hesaptır.

### 7.4. Nakit ihtiyacının duyarlılığı

Tablo üç yılın işletme zararını gösterir. Bir kerelik giderler ve kurucu ücreti dahil değildir.

| Değişen girdi | Üç yılın işletme zararı, dolar | TL |
|---|---|---|
| Temel | 419.936 | 21,16 milyon |
| Ekip, küçük şirket ortancası | 355.586 | 17,92 milyon |
| Ekip, bütün şirket ortancası | 504.716 | 25,43 milyon |
| Fiyat ayda 12.000 TL | 484.195 | 24,40 milyon |
| Fiyat ayda 18.000 TL | 355.676 | 17,92 milyon |
| Yapay zekâ yok | 401.666 | 20,24 milyon |
| Yılda 59 yeni müşteri, yıl 3 sonunda 125 hedefi | 300.777 | 15,16 milyon |
| Kötümser senaryonun bütün girdileri | 685.242 | 34,53 milyon |
| İyimser senaryonun bütün girdileri | Üç yılda 559.068 dolar kâr | 28,17 milyon kâr |

Müşteri kaybı bu tabloda küçük görünür. Çünkü hesap yıl 3 hedefini sabit tutar. Kayıp yüzde 40 olursa aynı hedef için yılda 46,6 yeni müşteri gerekir. Üç yılın zararı 21,91 milyon TL olur (hesap).

İyimser senaryo da yıl 1'de 47.707 dolar zarar eder. Bu yaklaşık 2,40 milyon TL eder. Yani her senaryoda ilk yıl nakit ister.

## 8. Müşteri için: kararın parası ödenen tutarın 100 katı olmalı

Bu bölüm müşterinin hesabıdır. Soru şudur: Müşteri bu üründen ölçülebilir para kazanır mı?

### 8.1. Kanıtlar

| Kanıt | Ne buldu? | Tür |
|---|---|---|
| Lovallo ve Sibony, McKinsey Quarterly, 2010 | 1.048 büyük karar beş yıl incelendi. Süreç, analizden altı kat önemli çıktı. Getiri verisi 673 kararda vardı. Süreç en alt çeyrekten en üst çeyreğe çıkınca getiri 6,9 yüzde puan arttı. Analiz için bu fark 5,3 puandı. | Birincil araştırma, arşiv kopyası ([McKinsey](http://web.archive.org/web/20260722015914/https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/the-case-for-behavioral-strategy)) |
| PMI, 2020 raporu | Proje yatırımlarının yüzde 11,4'ü kötü proje performansı yüzünden boşa gitti. | Birincil araştırma, arşiv kopyası ([PMI 2020](http://web.archive.org/web/20261105051057/https://www.pmi.org/learning/thought-leadership/pulse/pulse-of-the-profession-2020)) |
| Otis ve arkadaşları, Management Science | Kenya'da 640 girişimciyle rastgele deney yapıldı. Yapay zekâ danışmanının ortalama etkisi sıfırdan ayırt edilemedi. Etki girişimcinin başlangıç başarısına göre değişti. | Birincil araştırma ([DOI](https://doi.org/10.1287/mnsc.2024.06909)) |
| Dell'Acqua ve arkadaşları, Organization Science, 2025 | 758 BCG danışmanı denendi. Karmaşık iş sorusunda yardımsız doğru cevap oranı yüzde 84,5'ti. Yapay zekâyla bu oran yüzde 60 ve 70,6'ya düştü. | Birincil araştırma ([DOI](https://doi.org/10.1287/orsc.2025.21838)) |

Bu kanıtların dört sınırı vardır:

1. McKinsey verisi büyük şirketlerden gelir.
2. Bulgular ilişki gösterir, neden göstermez.
3. Sonuçlar yöneticilerin kendi değerlendirmesidir.
4. Strateji yazılımının getirisini ölçen bir çalışma bulunamadı.

Bu yüzden satış belgesinde yüzde getiri sözü vermeyin. Ölçülmüş bir değer raporu sözü verin. Yapay zekâ üründe yoktur. Yapay zekânın getirisini de satış sözü yapmayın (çıkarım).

### 8.2. Eşik formülü

Formül dört adımdır (hesap):

1. Ek değer = kararın parası × getiri artışı
2. Yıllık toplam maliyet = abonelik + kurulum + ek iç zaman maliyeti
3. Kendini ödeme oranı = ek değer ÷ yıllık toplam maliyet
4. En küçük karar büyüklüğü = yıllık toplam maliyet ÷ getiri artışı

Kurulum yalnız ilk yıl ödenir. Getiri artışı için model 1 yüzde puan kullanır. Bu, McKinsey'in bulduğu farkın yaklaşık yedide biridir.

**Örnek (hesap).** Bir aile şirketi 50 milyon TL'lik bir yatırımı değerlendiriyor.

1. Ek değer = 50.000.000 × 0,01 = 500.000 TL olur.
2. İlk yıl maliyeti = 180.000 + 50.000 = 230.000 TL olur.
3. İlk yıl oranı = 500.000 ÷ 230.000 = 2,2 kat olur.
4. Yenileme yılında oran = 500.000 ÷ 180.000 = 2,8 kat olur.

**Eşik tablosu (hesap).** Her hücre, ürünün kendini ödediği en küçük karar büyüklüğüdür.

| Getiri artışı | Yenileme yılı, Kasım 2026 | İlk yıl, Kasım 2026 | Yenileme yılı, Kasım 2027 | İlk yıl, Kasım 2027 |
|---|---|---|---|---|
| 0,5 puan | 36 milyon TL | 46 milyon TL | 46,7 milyon TL | 59,7 milyon TL |
| 1 puan | 18 milyon TL | 23 milyon TL | 23,4 milyon TL | 29,8 milyon TL |
| 2 puan | 9 milyon TL | 11,5 milyon TL | 11,7 milyon TL | 14,9 milyon TL |

Kasım 2027 sütunları fiyat yüzde 29,77 artarsa geçerlidir.

### 8.3. 100 kat kuralı ve ICP eşiğinin düzeltilmesi

Kural şudur (hesap):

> Kararın parası ≥ 100 × müşterinin o yıl ödediği toplam tutar

1 puanlık artışta bu kural eşiği tam verir. İlk yıl 100 × 230.000 = 23 milyon TL olur. Yenilemede 100 × 180.000 = 18 milyon TL olur. Yani ilk yıl karar, yıllık aboneliğin yaklaşık 128 katı olmalıdır.

Satış ekibi müşteriye şu soruyu sorar. "Kararın parası, bu yıl ödeyeceğiniz tutarın en az 100 katı mı?"

**ICP raporuyla çelişki giderildi.** ICP raporu 20 milyon TL eşiği kullanır. Codex bu eşiği hesapla sınadı. 20 milyon TL'de 1 puan 200.000 TL eder. İlk yıl maliyeti 230.000 TL'dir. Açık 30.000 TL'dir. Bu kararın kendini ödemesi için 1,15 puan artış gerekir ([Codex aktarım listesi](<../research_notes/Codex belgelerinden alınanlar/codex_aktarim_listesi.md>), madde 1.5). Bu rapor tek kuralı önerir. İlk yıl eşiği 23 milyon TL'dir. Yenileme eşiği 18 milyon TL'dir. ICP raporundaki 20 milyon TL bu kurala göre okunur.

### 8.4. Eşiği enflasyonla güncelleyin

Ekim 2026'da yıllık TÜFE yüzde 29,77'dir ([TCMB](https://www.tcmb.gov.tr/wps/wcm/connect/15fe8641-cdde-4e1e-846a-446eed1d9447/afiyatekim26.pdf?MOD=AJPERES), resmî). TL ile yazılan eşik her yıl eskir.

Eşiği iki yolla güncelleyebilirsiniz:

1. Ürün sahibi TL eşiğini her ocak fiyat listesiyle birlikte günceller. Formül: eşik × (1 + yıllık TÜFE).
2. Satış ekibi eşiği oran olarak sorar. 100 kat kuralı fiyatla birlikte kendiliğinden güncellenir.

**Örnek (hesap).** İlk yıl eşiği Kasım 2027'de 23 × 1,2977 = 29,8 milyon TL olur. Yenileme eşiği 18 × 1,2977 = 23,4 milyon TL olur.

### 8.5. Müşterinin iç zamanı da maliyettir

Müşteri ürüne zaman da harcar. Bu zaman yalnız eskisine göre artan kısmıyla sayılır. Kurumsal gelişim yöneticisinin net beklentisi 74.300 TL'dir. Bu kişinin işverene maliyeti ayda yaklaşık 131.100 TL'dir (hesap). Verimli saat başına bu yaklaşık 936 TL eder (hesap: 131.100 ÷ 140).

| Ek iç zaman | Yıllık maliyet | İlk yıl eşiği, 1 puan | Aboneliğin katı |
|---|---|---|---|
| 0 saat | 0 TL | 23,0 milyon TL | 128 |
| Ayda 4 saat | 44.942 TL | 27,5 milyon TL | 153 |
| Ayda 8 saat | 89.885 TL | 32,0 milyon TL | 178 |

Codex iki sayım kuralı önerir ([Codex aktarım listesi](<../research_notes/Codex belgelerinden alınanlar/codex_aktarim_listesi.md>), madde 5.6):

1. Kazanılan saati iki kez saymayın.
2. Durdurulan yatırımı kendi başına kazanç saymayın. Yalnız önlenen kaybı sayın.

### 8.6. İkinci değer kaynağı: boşa giden harcama

Ürün boşa giden harcamayı azaltabilir. PMI'ın yüzde 11,4'lük kaybını kullanalım. Program 50 milyon TL olsun. Ürün bu kaybın onda birini önlesin (hesap):

> Kazanç = 50.000.000 × 0,114 × 0,10 = 570.000 TL

Bu, bir yıllık aboneliğin yaklaşık 3,2 katıdır. Bu bir örnektir, söz değildir. Getiri artışı ile boşa harcama aynı parayı ölçebilir. Bu yüzden bir kararda ikisinden yalnız birini sayın (çıkarım).

### 8.7. Değeri her müşteride ölçün

Değeri iddia etmeyin, kayıtla gösterin. Ürün bu kayıtları tutar. Şu adımları izleyin:

1. Stratej hazırlık kapısında kararın parasını kaydeder.
2. Stratej "Mevcut düzen sürerse" satırının maliyetini, faydasını ve riskini yazar.
3. Karar sahibi seçilen yolun beklenen değerini kaydeder.
4. Karar sahibi kaynak izinlerini açar.
5. Ekip üyeleri gerçek harcamayı kaynak hareketi olarak girer.
6. Karar sahibi gözden geçirmede harcamayı izinle karşılaştırır.
7. Ürün bu kayıtlardan bir değer raporu üretir.
8. İş ortağı değer raporunu üç aylık gözden geçirmede müşteriyle okur.

Değer raporunda üç sayı olsun (öneri):

1. İzin olmadığı için durdurulan harcama
2. Seçilen yol ile mevcut düzen arasındaki beklenen fark
3. Aşama tarihlerindeki sapma

**Bütçe aynı parayı iki kez saymamalı.** Codex bir hata adayı buldu. Kod izin ile borcun aynı ödeme olup olmadığına bakmıyordu ([Codex aktarım listesi](<../research_notes/Codex belgelerinden alınanlar/codex_aktarim_listesi.md>), madde 10.4). Bugünkü tarayıcı kodu bu raporda okundu. Kod kalan bütçeyi tek bir yolla hesaplar. Harcama sınırından koşullu izinlerin toplamını düşer (`src/engine/gate.ts`). Kod gerçek harcamayı ve ödenmemiş borcu izinle eşleştirmez.

Sunucu tasarımı bu sorunu kapatır ([bütünleşik geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md), 5.3). Kurallar şunlardır:

1. Serbest bütçe, harcama sınırından üç tutar düşülerek bulunur.
2. Bu tutarlar önceki harcama, kaynak hareketleri ve açık izinlerin harcanmamış payıdır.
3. Her kullanım hareketinin tekil bir ödeme kimliği vardır. Örneğin fatura numarası.
4. Aynı ödeme ikinci kez gelirse sunucu ikinci hareketi yazmaz.

Değer raporundaki "durdurulan harcama" sayısı bu kurala dayanır. Bu yüzden değer raporu sunucu sürümüyle birlikte açılır (çıkarım). Tarayıcı sürümü bu sayıyı göstermez.

## 9. Açık kaynak modeli: gelir koddan değil, hizmetten gelir

Depo public olacak. Bu bir ürün kararıdır. Kod herkese açık olunca müşteri koda para ödemez.

### 9.1. Müşteri neye para öder?

| Gelir kaynağı | Ne satılır? | Örnek |
|---|---|---|
| Barındırılan hizmet | Kurulmuş, güncellenen ve yedeklenen site | Karar paketi |
| Destek ve çalışma güvencesi | Destek saati ve kesinti sınırı | Paket içi 2 saat |
| Kurulum ve pilot | Site açılışı, roller, eğitim | 80.000 TL'lik pilot |
| Türkiye'de barındırma | Verinin Türkiye'de kalması | Ek ücretli seçenek |
| Yapay zekâ kotası ve kredi | Yapay zekâ çıkınca kullanım | Kredi paketi |
| İş ortağı sertifikası | Ortağın eğitimi ve sınavı | WorkBoard 599 dolar, BSI 1.970 ile 4.925 dolar |

Sertifika fiyatları satıcıların kendi sayfalarından gelir ([WorkBoard](https://learn.workboard.com/page/okr-coach-certification), [BSI](https://balancedscorecard.org/training-certification/bsp-balanced-scorecard-professional/), yayımlanmış).

### 9.2. Gerçek örnekler

| Şirket | Model | Ne oldu? | Tür |
|---|---|---|---|
| GitLab | Açık çekirdek | 31 Ocak 2026 Cumartesi günü biten yılda gelir 955,2 milyon dolar. Büyüme yüzde 26. Brüt kâr marjı yüzde 87,4. Satış ve pazarlama gelirin yüzde 45,5'i. Net gelir tutma yüzde 118. Net zarar 58,6 milyon dolar. | Şirket belgesi ([GitLab 10-K](https://www.sec.gov/Archives/edgar/data/1653482/000162828026018731/gtlb-20260131.htm)) ve hesap |
| Odoo | Açık çekirdek | 2025 geliri 620 milyon avro. 2025'te 36 milyon avro muhasebe zararı. 2026'da ciro yüzde 48 arttı. | İkame, haber kaynağı ([Brussels Times](https://www.brusselstimes.com/2332306/odoo-announces-e10-billion-valuation-and-a-partial-price-increase)) |
| Frappe | Kod açık. Önce hizmet, sonra barındırma. | Kurucu 4 Haziran 2025 Çarşamba günü şirketin ilk kez ciddi kâra geçtiğini yazdı. Bu yol on yıldan uzun sürdü. Yazı sayı vermez. | Yayımlanmış ([Frappe blog](https://frappe.io/blog/culture/the-path-to-profitability)) |
| Cal.com | Açık kodu kapattı. | Public depo 15 Nisan 2026 Çarşamba günü MIT lisanslı Cal.diy'e dönüştü. Ana ürün kapalı kaldı. | Yayımlanmış ([GitHub, cal.diy](https://github.com/calcom/cal.diy)) |
| Elastic | Kısıtlı lisanstan geri döndü. | Varsayılan lisans artık AGPL-3.0, SSPL ve Elastic License 2.0'dır. AGPL 29 Ağustos 2024 Perşembe günü eklendi. | Yayımlanmış ([GitHub, lisans](https://github.com/elastic/elasticsearch/blob/main/LICENSE.txt)) |
| Sentry | Gecikmeli açık lisans | Lisans FSL-1.1-Apache-2.0'dır. Her sürüm iki yıl sonra Apache 2.0 olur. Rakip kullanım bu sürede yasaktır. | Yayımlanmış ([GitHub, lisans](https://github.com/getsentry/sentry/blob/master/LICENSE.md)) |

Bu örneklerden üç ders çıkar (çıkarım):

1. Açık kaynak yolu yavaştır. Frappe kâra on yıldan uzun sürede geçti.
2. Büyük açık kaynak şirketleri de satışa çok harcar. GitLab gelirinin yüzde 45,5'ini satışa harcadı.
3. Lisans sonradan değişebilir. Ama değişiklik güven kaybettirir. Elastic bu yüzden AGPL'yi geri ekledi.

### 9.3. Gelir modeli seçenekleri

| Seçenek | Gelir nereden gelir? | Risk | Public depo tercihine uyum |
|---|---|---|---|
| Tam açık kod ve barındırılan hizmet | Barındırma, destek, kurulum | Bir firma kodu alıp ucuza barındırabilir. | Tam uyumlu |
| Açık çekirdek | Ücretli kapalı modüller | Topluluk kapalı modüle tepki verir. | Kısmen uyumlu |
| Gecikmeli açık lisans | İlk iki yıl rakip kullanımı yasak | Bu sürede açık kaynak sayılmaz. | Uyumsuz |
| Önce açık, sonra kapalı | Kapalı ürün satışı | Güven kaybı, topluluk ayrılır. | Uyumsuz |

Bu raporun gelir modeli ilk seçeneğe dayanır. Gelir barındırma, destek ve kurulumdan gelir.

### 9.4. Lisans ürün sahibinin kararıdır

Lisansı ürün sahibi seçer. Bu rapor lisans seçmez. Lisans geliştirmenin 1. adımından önce seçilir ([bütünleşik geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md), 14).

Kullanılan parçaların lisansları şunlardır:

| Parça | Lisans | Kaynak |
|---|---|---|
| Frappe Framework | MIT | [GitHub, frappe](https://github.com/frappe/frappe) |
| ERPNext | GPL-3.0 | [GitHub, erpnext](https://github.com/frappe/erpnext) |
| Frappe Press | AGPL-3.0 | [GitHub, press](https://github.com/frappe/press) |

Seçenekler şunlardır:

| Lisans | Başkası barındırabilir mi? | Açık kaynak sayılır mı? | Size etkisi |
|---|---|---|---|
| MIT ya da Apache 2.0 | Evet, şartsız. | Evet | En geniş yayılma. Rakip barındırıcıyı durdurmaz. |
| GPL-3.0 | Evet. İnternetten sunan değişikliğini paylaşmak zorunda değil. | Evet | Barındırıcıyı durdurmaz. |
| AGPL-3.0 | Evet. Ama değişikliğini yayımlamak zorunda. | Evet | Kapalı kopyayı caydırır. Press ile aynı lisanstır. |
| FSL ya da BSL | 2 ile 4 yıl hayır. Sonra evet. | Bu sürede hayır | Barındırıcıyı durdurur. Açık kaynak tercihinizle çelişir. |
| Açık çekirdek | Çekirdek için evet. Ek modüller için hayır. | Yalnız çekirdek | Ek modüllerden gelir alırsınız. |

Açık kaynak tercihinizle en uyumlu seçenek AGPL-3.0'dır (çıkarım). Seçim sizindir.

Ürün sahibi lisans için şu adımları izler:

1. Ürün sahibi lisansı geliştirmenin 1. adımından önce seçer.
2. Ayrı bir ticari lisans da istenirse dış katkı verenler katkı sözleşmesi imzalar.
3. Avukat ERPNext kodu kullanılırsa GPL uyumunu inceler.
4. DevOps sorumlusu Press'te değişiklik yaparsa değişikliği yayımlar. AGPL bunu ister.

Asıl risk kodu kopyalayan aile şirketi değildir. Aile şirketinin çoğu zaman bilgi işlem ekibi yoktur. Asıl risk, kodu alıp kendi müşterilerine barındıran bir bilgi işlem firmasıdır (çıkarım).

## 10. Ödeme isteği ve görüşme planı: tek takvim

> **Güncellik notu, 16 Kasım 2026 Pazartesi günü.** Görüşme takviminin tek kaynağı [Doğrulanmış ICP ve persona analizi](<Doğrulanmış ICP ve persona analizi.md>) raporunun 12. bölümüdür. O plana göre 15 görüşme tek turda yapılır. Fiyat bölümü görüşmenin sonunda yalnız 6 ödeyen ve 4 yürüten kişiye sorulur. 4 Aralık 2026 Cuma gününe kadar 5'ten az görüşme biterse fiyat soruları ikinci tura kalır. Bu bölümdeki takvim o plana göre okunur.

### 10.1. İki plan çelişiyordu

İki rapor aynı tarihlere iki ayrı plan koymuştu:

1. ICP raporu ilk turda fiyat sormaz. Fiyatı ocaktaki ikinci tura bırakır ([Derin ICP ve persona analizi](<Derin ICP ve persona analizi.md>), 12.5).
2. Derin gelir raporu 18 Aralık 2026 Cuma gününe kadar 15 fiyat görüşmesi istiyordu.

Bilinmeyenler raporu bu çelişkiyi J3 adayı olarak yazdı ([bilinmeyenler raporu](<Karar Atlası bilinmeyen bilinmeyenler güncel.md>)). Aynı kişiye iki plan uygulanırsa cevaplar birbirini etkiler.

**Karar.** ICP kuralı korunur. İlk turda fiyat sorulmaz. Fiyat soruları ikinci tura taşınır. Derin gelir raporunun aralık takvimi geri çekilir.

Dört neden vardır (çıkarım):

1. Fiyat sorusu keşif görüşmesinin cevaplarını boyar.
2. İlk tur geçmiş harcamayı toplar. İkinci tur bu sayıları çapa olarak kullanır.
3. ICP raporuna göre bütçe görüşmeleri aralık ve ocakta yoğunlaşır. Bu bir hipotezdir. Logo da TL listesini ocak başında yeniler.
4. Ücretli pilot sunucu sürümünü bekler. Aralıkta imzalanan pilot aylarca başlayamaz.

### 10.2. Takvim

| Tarih | İş | Kim yapar? |
|---|---|---|
| 20 Kasım 2026 Cuma günü | Persona kartlarını, çürütme ölçütlerini ve 60 adaylık listeyi hazırlar. | Ürün sahibi |
| 20 Kasım 2026 Cuma günü ile 18 Aralık 2026 Cuma günü arası | 1. tur: 15 keşif görüşmesi. Fiyat sorulmaz. Geçmiş harcama sorulur. | Ürün sahibi |
| 4, 11 ve 18 Aralık 2026 Cuma günleri | Her 5 görüşmeden sonra eşik tablosu güncellenir. | Ürün sahibi |
| 21 Aralık 2026 Pazartesi günü | Karar toplantısı. ICP korunur, daraltılır ya da değiştirilir. 2. tur listesi seçilir. | Ürün sahibi ve tanık |
| 4 Ocak 2027 Pazartesi günü ile 29 Ocak 2027 Cuma günü arası | 2. tur: 15 fiyat görüşmesi | Ürün sahibi |
| 1 Şubat 2027 Pazartesi günü | Fiyat kararı. Fiyat listesi yayımlanır. | Ürün sahibi |
| Sunucu sürümü hazır olunca | En çok 5 ücretli pilot teklif edilir. | Ürün sahibi |
| 18 Mart 2027 Perşembe günü | Danışman kanalının 90 günlük eşiği dolar. | Ürün sahibi |

### 10.3. 1. turda para nasıl konuşulur?

1. turda ürün ve fiyat gösterilmez. Ürün sahibi yalnız geçmişteki parayı sorar:

1. "Son strateji çalışmanız size kaça mal oldu?"
2. "Son iki yılda danışmana ya da çalıştaya ne ödediniz?"
3. "Son büyük kararın parası ne kadardı?"
4. "O kararda hangi yazılımları kullandınız? Ne ödediniz?"
5. "Bütçeniz hangi ay kapanır? Yeni bütçe ne zaman açılır?"
6. "Geçen yıl bu dönemde hangi yatırımı ertelediniz?"

Ürün sahibi cevapları bir harcama çapası tablosuna yazar. Kişinin adı yazılmaz. Yalnız rolü yazılır.

### 10.4. 2. turun yedi adımı

Ürün sahibi her görüşmede bu adımları sırayla izler:

1. **Doğru kişiyi seçin.** En az 10 görüşme parayı ödeyen kişiyle olsun. Yaklaşık 5 görüşme satın almayı yürüten kişiyle olsun. İki grubun cevaplarını ayrı yazın.
2. **Önce değeri sorun.** Kararın parasını sorun. 1. turdaki harcama sayılarını hatırlatın.
3. **Van Westendorp'un dört sorusunu sorun.** Soruları bir etkin kararın yıllık ücreti için sorun. Aylık kişi başı fiyat sormayın.
4. **Üç fiyatı yüksekten düşüğe sorun.** Önce yılda 300.000 TL'yi sorun. Sonra 180.000 TL'yi sorun. En son 108.000 TL'yi sorun. Her fiyatta 5 basamaklı satın alma niyetini yazın. Bu Gabor-Granger yöntemidir.
5. **Pilot teklif edin.** 80.000 TL'lik 8 haftalık pilotu teklif edin. Niyet mektubu isteyin. Başlangıç tarihi sunucu sürümüne bağlıdır. Bunu açıkça söyleyin.
6. **Sonucu sayıyla yazın.** Örneğin "10 ödeyiciden 6'sı 180.000 TL'yi kabul edilebilir buldu." deyin.
7. **Logo fiyatlarını en son gösterin.** Önce gösterirseniz cevapları etkiler.

Van Westendorp'un dört sorusu şunlardır:

1. Hangi yıllık fiyatta bu ürünü kalitesinden şüphelenecek kadar ucuz bulursunuz?
2. Hangi yıllık fiyatta ucuz ama uygun bulursunuz?
3. Hangi yıllık fiyatta pahalı bulur ama yine de düşünürsünüz?
4. Hangi yıllık fiyatta almayı düşünmeyecek kadar pahalı bulursunuz?

2. tur 1. turdaki şirketleri de içerebilir. Önünde açık bir karar olan şirketler önceliklidir. 1. turda fiyat sorulmadığı için cevaplar boyanmamıştır (çıkarım).

### 10.5. Sayım kuralları

Codex dört sayım kuralı önerdi ([Codex aktarım listesi](<../research_notes/Codex belgelerinden alınanlar/codex_aktarim_listesi.md>), madde 1.10 ve 1.11). Bu rapor bu kuralları alır:

1. Şirket, kişi ve teklif ayrı sayılır. Aynı şirketten üç kişi tek şirket kararıdır.
2. Aynı bütçeyle alan grup şirketleri tek alıcıdır.
3. Yalnız danışmana yapılan ödeme hizmet talebidir. Yazılım talebi sayılmaz.
4. Tek kararın ücreti 12 ile çarpılıp yıllık gelir yazılmaz.

### 10.6. Örneklem neden küçüktür?

15 görüşme bir yön gösterir, kesin fiyat vermez. Satıcı rehberleri her alıcı grubu için 200 ile 500 kişi önerir ([Prospeo](https://prospeo.io/s/go-to-market-pricing-strategy), [CleverX](https://cleverx.com/blog/enterprise-b2b-willingness-to-pay-setting-and-defending-price), üçüncü taraf). Seçenekleri karşılaştıran conjoint yöntemi en az 300 kişi ister ([Sawtooth](https://www.sawtoothsoftware.com/resources/blog/posts/sample-size-rules-of-thumb), yayımlanmış). En güçlü kanıt imzalı ücretli pilottur (çıkarım).

### 10.7. 1 Şubat 2027 Pazartesi günü nasıl karar verilir?

Bu kurallar önerimizdir. Eşikler hipotezdir.

| Görüşme sonucu | Fiyat kararı |
|---|---|
| Ödeyicilerin yarısı ya da fazlası 180.000 TL'yi kabul eder. En az iki ayrı şirket niyet mektubu imzalar. | 180.000 TL korunur. |
| Ödeyicilerin çoğu 300.000 TL'yi de kabul eder. | Şirket paketi öne alınır. Karar paketinin fiyatı yükseltilir. |
| Ödeyicilerin yarısından azı 180.000 TL'yi kabul eder. | 144.000 TL sınanır. Başa baş noktası yıl 3'te 164 müşteriye çıkar. Ekip planı küçültülür. |
| Hiçbir şirket niyet mektubu imzalamaz. | Fiyat kanıtı yoktur. Satış sorunu fiyattan önce incelenir. |
| "Yatırımlar beklemede" cevabı son görüşmelerde iki katına çıkar. | Mevsim etkisi vardır. Fiyat kararı mart ayına ertelenir. |

108.000 TL'lik fiyatta yıl 3 başa baş noktası 237 müşteridir. Bu, temel senaryodaki 80 müşterinin yaklaşık 3 katıdır (hesap).

## 11. Derin rapora göre neler değişti?

| Konu | Derin gelir raporu | Bu rapor | Neden değişti? |
|---|---|---|---|
| Ekip, yıl 3 | 25.000 dolar, aralık 17.000 ile 35.000 | 27.000 dolar, aralık 24.303 ile 29.836 | Ham anket verisinden rol rol yeniden hesap |
| Ekip, yıl 1 | 10.000 dolar, aralık 8.300 ile 11.850 | 10.000 dolar, aralık 9.122 ile 11.874 | Aynı neden. Temel değer korundu. |
| Mobil geliştirici | 3.421 dolar, bütün kıdemler | Orta 3.738, kıdemli 7.063 dolar | Ham veri kıdeme göre ayrıldı. |
| SGK oranları ve tavan | Resmî metnin özeti | 7566 ve 7573 sayılı kanunlardan okundu | Resmî Gazete metni okundu. |
| Asgari ücret desteği | Yoktu | Ayda 1.269,90 TL, yalnız 2026 | 7573 sayılı Kanun bulundu. |
| Yapay zekâ, tipik müşteri | 11 dolar, katsayı 1,5 | 15 dolar, katsayı 2,0 | Türkçe metin 1,48 ile 2,02 kat ölçüldü. |
| Kart ücreti, temel | Yüzde 2,49 ve 0,25 TL | Yüzde 2,29, Param | Param'ın kendi sayfası okundu. |
| Kart ücreti, kötümser | Yüzde 3,56 | Yüzde 4,29 ve 0,25 TL, iyzico | iyzico'nun kendi fiyatı bulundu. Banka tavanı ödeme kuruluşunu bağlamaz. |
| Mali müşavir | 3.606 ile 15.971 TL, çelişkili | 4.868 ile 5.642 TL defter ve 6.497 TL danışmanlık | 2026 tarifesinin resmî eki okundu. |
| Muhasebe satırı | 300 dolar | 189 dolar, yıl 3'te 241 dolar | Tarife ve ilk iki yıl indirimi |
| Hetzner yedeği | Yüzde 20 varsayım | Yüzde 20 resmî | Hetzner fatura sayfası |
| Kiralık fiziksel sunucu | 317 avro | 451,90 avro | Önceki fiyat stokla sınırlı teklifti. |
| Helsinki fiyatı | Konu yoktu | Kalkarsa yığın 527'den 615 dolara çıkar | Zam tablosu ile ürün sayfası farklı |
| Benchmarkit yüzde 84 | 2025 raporu sanıldı | 2026 raporu, 2025 verisi | Rapor yılları ayrıldı. |
| Gainsight 144 müşteri | Genel ölçüt | ABD'li büyük şirket verisi, üst sınır | Örneklem okundu. |
| Hizmet payı kuralı | Yüzde 15 sınırı, zayıf kaynak | Kurulum maliyeti karşılar, kâr sayılmaz | Workday 10-K raporu |
| Paraşüt | Sayfada hesap hatası var denmişti | Sayfa tutarlı. Aylık ödemede yaklaşık 1.450 TL. | Hesap yeniden yapıldı. |
| Logo iş analitiği | Mind Insight | Bugün Logo Edge BI | Codex bulgusu |
| Yeni fiyat çapaları | Yoktu | OnStrategy, Bloom Growth, 1000minds, Align kurulum ücreti | Rakip doğrulama notları |
| Katkı payı, temel | 227,28 dolar | 223,64 dolar | Yapay zekâ arttı, kart ücreti düştü. |
| Sabit gider, yıl 3 | 25.977 dolar | 27.918 dolar | Ekip arttı, muhasebe düştü. |
| Başa baş, yıl 1 | 47 müşteri | 47 müşteri | Değişmedi |
| Başa baş, yıl 3 | 115 müşteri | 125 müşteri | Ekip 27.000 dolar oldu. |
| Gereken yıllık yeni müşteri | 54 | 59 | Eşik yükseldi. |
| Nakit ihtiyacı | Yalnız yıl 1, 5,58 milyon TL | Yıl 1 5,53, üç yıl 21,38 milyon TL | Üç yıllık aylık hesap eklendi. |
| Kurucu ücreti | Hesapta yoktu | Ayrı satır, dört seçenek | Sahibin isteği |
| Müşteri eşiği | 18 ile 23 milyon TL | İlk yıl 23, yenileme 18 milyon TL. 100 kat kuralı. | ICP çelişkisi giderildi. |
| İç zaman | Hesapta yoktu | Ayda 4 saat eşiği 27,5 milyon TL'ye çıkarır. | Codex sayım kuralı |
| Yapay zekâ deneyi | Berkeley Haas haber sayfası | Management Science ve Organization Science makaleleri | Birincil kaynak bulundu. |
| Görüşme planı | 18 Aralık'a kadar 15 fiyat görüşmesi | Fiyat 2. turda, 4 Ocak 2027 Pazartesi günü başlar | ICP ile çelişki giderildi. |
| Lisans gerçekleri | Haber kaynakları | Projelerin kendi depoları | GitHub ve SEC belgeleri okundu. |

## 12. Sonuçları ne değiştirir?

| Bu durum görülürse | Sonuç şöyle değişir |
|---|---|
| 2. turda ödeyicilerin çoğu 180.000 TL'yi reddeder. | Başa baş noktası 164 ile 237 müşteriye çıkar. Ekip küçültülür ya da satış hızı artırılır. |
| Ödeyiciler 216.000 TL'yi kabul eder. | Yıl 3 eşiği 101 müşteriye iner. Üç yılın zararı yaklaşık 3,2 milyon TL azalır. |
| İyi geliştirici yabancı teklif alır. | Ekip bütün şirket ortancasına çıkar. Yıl 3 eşiği 138 müşteri olur. |
| Ekip küçük şirket ortancasında kalır. | Yıl 3 eşiği 113 müşteriye iner. |
| Hazine prim desteği 2027'de uzatılmaz. | Ekip gideri yaklaşık yüzde 1,6 artar. Eşik yaklaşık 2 müşteri yükselir. |
| Teknopark ya da Ar-Ge teşviki alınır. | Ekip gideri düşer. KOSGEB danışmanlık desteği 50.000 TL'ye çıkar. |
| Pilotlarda destek ayda 4 saati geçer. | Eşik 140 ile 165 müşteriye çıkar. Bir kişi en çok 35 müşteriye bakar. |
| İlk karardan sonra müşterilerin çoğu ayrılır. | Kayıp yüzde 40'a yaklaşır. 125 müşteriyi korumak için her yıl 50 yeni satış gerekir. |
| Müşteriler ikinci kararı açar. | Net gelir tutma yüzde 100'ü geçer. Gereken yeni satış azalır. |
| Ortak kanalı hızla müşteri getirir. | Satış hızı sorunu çözülür. Ortak payı katkıyı biraz düşürür. |
| Yapay zekâ kotasız açılır. | Maliyet 60 dolara çıkabilir. Eşik 157 müşteriye çıkar. |
| Helsinki fiyatı kalkar. | Altyapı 615 dolar olur. Eşik 1 müşteri yükselir. |
| Müşterilerin hepsi iyzico ile kartla öder. | Eşik 132 müşteriye çıkar. |
| Müşteriler yıllık peşin öder. | Yıl 1 nakit ihtiyacı yaklaşık 1,22 milyon TL azalır. |
| Ad çakışması marka değişikliğini zorunlu kılar. | Tanıtım gideri artar. Satış gecikir. Bu gider modelde yoktur. |
| Sunucu sürümü gecikir. | Ücretli pilot başlayamaz. Yıl 1 müşteri sayısı ve nakit planı kayar. |
| Bir firma public kodu daha ucuza barındırır. | Fiyat baskı altına girer. Lisans seçimi bu riski belirler. |
| Strateji yazılımının getirisini ölçen bir çalışma çıkar. | Müşteri eşiği yeniden hesaplanır. |

## Sonuç

Doğrulanmış girdiler sonucu küçük ama önemli bir yerde değiştirdi. Ürünün tek müşteriden kazandığı para neredeyse aynı kaldı. Müşteri başına katkı ayda yaklaşık 11.270 TL'dir. Değişen, ekibin gerçek fiyatıdır. Yabancı şirketler Türk geliştiriciye yaklaşık 1,8 kat maaş öder. Bu fark yıl 3 ekibini 27.000 dolara taşır. Eşik de 125 müşteriye çıkar. Bu yüzden şirketin asıl sorusu fiyat değil, satış hızıdır. Yılda 59 yeni müşteri tek kişilik satışla gelmez. İş ortağı programı bu yüzden gelir modelinin satış motorudur. İkinci yol fiyattır. Ayda 18.000 TL'lik fiyat eşiği 101 müşteriye indirir. 2. görüşme turu bu iki yolu ayırır.

Müşteri tarafında tek bir oran yeter. Kararın parası o yıl ödenen tutarın 100 katı olmalıdır. Bu oran enflasyondan etkilenmez. ICP ile gelir raporu arasındaki eşik çelişkisi de böyle kapanır. Kurucu için en önemli sayı nakittir. Üç yıl için kurucu ücreti hariç yaklaşık 21,4 milyon TL gerekir. En ucuz bilgi önümüzdeki on bir haftadadır. Önce geçmiş harcama sorulur, sonra fiyat sorulur. 1 Şubat 2027 Pazartesi günü verilecek fiyat kararı, eşiği 70 ile 237 müşteri arasında oynatır.

## Kaynaklar

### Kur ve enflasyon

- [TCMB, 2026/215 sayılı kur bülteni](https://www.tcmb.gov.tr/kurlar/today.xml)
- [TCMB, Ekim 2026 fiyat gelişmeleri](https://www.tcmb.gov.tr/wps/wcm/connect/15fe8641-cdde-4e1e-846a-446eed1d9447/afiyatekim26.pdf?MOD=AJPERES)
- [Strateji ve Bütçe Başkanlığı, Ekim 2026 fiyat gelişmeleri](https://www.sbb.gov.tr/2026-yili-ekim-ayi-tuketici-ve-uretici-fiyat-gelismeleri/)
- [TÜİK, bülten 58132](https://veriportali.tuik.gov.tr/tr/press/58132)

### Bordro, SGK ve vergi

- [Resmî Gazete, Asgari Ücret Tespit Komisyonu Kararı 2025/1](https://www.resmigazete.gov.tr/eskiler/2025/12/20251226-6.pdf)
- [Resmî Gazete, 7566 sayılı Kanun](https://www.resmigazete.gov.tr/eskiler/2025/12/20251219-1.htm)
- [Resmî Gazete, 7573 sayılı Kanun](https://www.resmigazete.gov.tr/eskiler/2026/01/20260129-1.htm)
- [Alomaliye, SGK Genelgesi 2026/1 kopyası](https://www.alomaliye.com/2026/01/07/sgk-genelgesi-2026-1/)
- [KPMG Vergi, SGK prim oranları](https://kpmgvergi.com/pratik-bilgiler/4/2)
- [KPMG Vergi, 2026 gelir vergisi dilimleri](https://kpmgvergi.com/yayinlar/mali-bultenler/vergi/2026-yili-gelir-vergisi-dilimleri-ile-dikkate-alinacak-bazi-had-ve-tutarlar-belirlendi/3351)
- [Resmî Gazete, 2026 SM ve SMMM ücret tarifesi eki](https://www.resmigazete.gov.tr/eskiler/2025/12/20251217-2-1.pdf)
- [Katma Değer Vergisi Kanunu](https://www.mevzuat.gov.tr/MevzuatMetin/1.5.3065.pdf)
- [KDV Genel Uygulama Tebliği](https://www.mevzuat.gov.tr/MevzuatMetin/yonetmelik/9.5.19631.pdf)

### Maaş anketleri

- [Önceki Yazılımcı 2026 ham verisi](https://github.com/oncekiyazilimci/2026-yazilim-sektoru-maaslari)
- [getSalary, 2026 maaş rehberi](https://getsalary.dev/blog/yazilim-maas-rehberi-2026)
- [yazilimcimaaslari.org](https://yazilimcimaaslari.org/)
- [kariyer.net, ürün tasarımcısı](https://www.kariyer.net/pozisyonlar/urun+tasarimcisi/maas)
- [kariyer.net, müşteri destek uzmanı](https://www.kariyer.net/pozisyonlar/musteri+destek+uzmani/maas)
- [kariyer.net, kurumsal müşteri destek uzmanı](https://www.kariyer.net/pozisyonlar/kurumsal+musteri+destek+uzmani/maas)
- [kariyer.net, kurumsal satış temsilcisi](https://www.kariyer.net/pozisyonlar/kurumsal+satis+musteri+temsilcisi/maas)
- [kariyer.net, kurumsal satış yöneticisi](https://www.kariyer.net/pozisyonlar/kurumsal-satis-yoneticisi-yonetmeni/maas)
- [kariyer.net, kurumsal gelişim yöneticisi](https://www.kariyer.net/pozisyonlar/kurumsal+gelisim+yoneticisi/maas)

### Altyapı, mobil ve izleme

- [Hetzner, genel amaçlı sunucular](https://www.hetzner.com/cloud/general-purpose/)
- [Hetzner, 15 Haziran 2026 Pazartesi günü zam sayfası, arşiv kopyası](http://web.archive.org/web/20261022142746/https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/)
- [Hetzner, fatura soruları](https://docs.hetzner.com/cloud/billing/faq/)
- [Frappe Cloud, paylaşımlı barındırma](https://frappe.io/cloud/shared-hosting)
- [OwnHost, İstanbul bulut sunucu](https://www.ownhost.net/en/cloud-server)
- [Apple geliştirici programı](https://developer.apple.com/programs/enroll/)
- [Google Play kayıt ücreti](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en)
- [Capgo fiyatları](https://capgo.app/pricing/)
- [Capawesome fiyatları](https://capawesome.io/cloud/pricing/)
- [Sentry fiyatları](https://sentry.io/pricing/)
- [Better Stack fiyatları](https://betterstack.com/pricing)
- [AWS SES fiyatları](https://aws.amazon.com/ses/pricing/)

### Yapay zekâ

- [Anthropic fiyatları](https://platform.claude.com/docs/en/about-claude/pricing)
- [KVKK Türkçe metni](https://www.mevzuat.gov.tr/MevzuatMetin/1.5.6698.pdf)
- [KVKK İngilizce metni](https://www.kvkk.gov.tr/Icerik/6649/Personal-Data-Protection-Law)

### Ödeme, hukuk ve marka

- [Stripe, desteklenen ülkeler](https://stripe.com/global)
- [PayTR, sanal POS oranları](https://www.paytr.com/sanal-pos-komisyon-oranlari)
- [Param, sanal POS](https://param.com.tr/sanal-pos)
- [iyzico, fiyatlandırma](https://www.iyzico.com/fiyatlandirma)
- [TCMB, üye işyeri azami komisyon oranları](https://tcmb.gov.tr/wps/wcm/connect/ebe32165-bf61-4bde-b7c8-45ca1ad4775b/%C3%9Cye+%C4%B0%C5%9Fyerlerine+Uygulanacak+Azami+Komisyon+Oranlar%C4%B1+May%C4%B1s+2026.pdf?MOD=AJPERES)
- [Faturaport, e-fatura fiyatları](https://faturaport.com/blog/e-fatura/2026-mayis-e-fatura-kontor-fiyatlari)
- [Paraşüt, limited şirket kuruluş maliyeti](https://www.parasut.com/blog/limited-sirket-kurulus-maliyetleri)
- [TÜRKPATENT, marka işlem ücretleri](https://www.turkpatent.gov.tr/marka-islem-ucretleri)
- [Hukuki Haber, İstanbul Barosu 2026 tarifesi](https://www.hukukihaber.net/istanbul-barosu-2026-yili-avukatlik-asgari-ucret-tarifesi)
- [kararatlasi.com.tr](https://www.kararatlasi.com.tr/)

### Fiyat çapaları

- [Logo GO Wings fiyat listesi](https://cdn.logo.com.tr/files/logocomtr//Uploads/Documents/logo-go-wings-fiyat-listesi.pdf)
- [Logo iş analitiği fiyat listesi](https://cdn.logo.com.tr/files/logocomtr/Uploads/Documents/logo-is-analitigi-eop-fiyat-listesi.pdf)
- [Logo j-HR fiyat listesi](https://cdn.logo.com.tr/files/logocomtr/Uploads/Documents/logo-j-hr-eop-fiyat-listesi.pdf)
- [Logo Cloud](https://logo.com.tr/en/product/logo-cloud)
- [Logo Edge BI](https://www.logo.com.tr/urun/logo-edge-bi)
- [Logo faaliyet raporu, 31 Mart 2026 Salı günü](https://cdn.logo.com.tr/Files/logocomtr/Uploads/Documents/Faaliyet-Raporu-31-Mart-2026.pdf)
- [Paraşüt ön muhasebe fiyatları](https://www.parasut.com/on-muhasebe-fiyatlari)
- [Paraşüt mali müşavir kanalı](https://www.parasut.com/mali-musavir-kanali)
- [Nokta Gazetesi, Kocaeli strateji ihalesi](https://www.noktagazetesi.com.tr/ihale/kocaeli-buyuksehirden-3-milyonluk-vatandas-odakli-strateji-ihalesi-sirketin-sahibi-dikkat-cekti-385382)
- [KOSGEB, İşletme Geliştirme uygulama esasları](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/%C4%B0sletme%20Gelistirme%20Destek%20Program%C4%B1/2026/I%CC%87s%CC%A7letme_Gelis%CC%A7tirme_Destek_Program%C4%B1_Uygulama_Esaslar%C4%B1_22.pdf)
- [KOSGEB, YÖNDE yönergesi](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/YONDE/2026/2026.07.14/Y%C3%96NDE-Y%C3%B6nderlikveDe%C4%9FerlendirmeDestekProgram%C4%B1Y%C3%B6nergesi05.07.26.pdf)
- [KOSGEB, Kapasite Geliştirme başvuru kılavuzu](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/KAPAS%C4%B0TE%20GEL%C4%B0ST%C4%B0RME/2026/2026.08.21/Kapasite_Gelis%CC%A7tirme_Destek_Program%C4%B1_Bas%CC%A7vuru_K%C4%B1lavuzu_v2.1.pdf)
- [Vizyonder, kamu stratejik planı ve ihale](https://www.vizyonder.org.tr/mevzuat-stratejik-plan-ve-performans-programinin-ihale-yoluyla-313)
- [OnStrategy fiyatları](https://onstrategyhq.com/pricing/)
- [Bloom Growth fiyatları](https://www.bloomgrowth.com/pricing)
- [1000minds fiyatları](https://www.1000minds.com/pricing/general-decision-making)
- [it-daily, StrategyFrame](https://www.it-daily.net/it-management/projekt-personal/ki-plattform-ersetzt-mckinsey-co-fuer-einen-bruchteil-der-kosten)
- [Align fiyatları, arşiv kopyası](https://web.archive.org/web/20260715043600/https://aligntoday.com/pricing/)
- [Success.co fiyatları](https://www.success.co/pricing)
- [Basecamp fiyatları](https://basecamp.com/pricing)

### Müşteri tutma, destek ve hizmet

- [SaaS Capital, 2025 tutma ölçütleri](https://www.saas-capital.com/wp-content/uploads/2025/09/RB32WS1-2025-B2B-SaaS-Retention-Benchmarks.pdf)
- [Aleph, Benchmarkit 2026 özeti](https://www.getaleph.com/blog/2026-saas-benchmarks-takeaways)
- [Benchmarkit 2025](https://www.benchmarkit.ai/2025benchmarks)
- [Gainsight, müşteri başarı yöneticisi oranı](https://www.gainsight.com/blog/gainsight-horizon-ai-labs-what-is-the-right-csm-to-customer-ratio/)
- [Workday 10-K, SEC](https://www.sec.gov/Archives/edgar/data/1327811/000132781126000014/wday-20260131.htm)
- [IFRS 15](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/)
- [WorkBoard OKR koç sertifikası](https://learn.workboard.com/page/okr-coach-certification)
- [BSI Balanced Scorecard eğitimi](https://balancedscorecard.org/training-certification/bsp-balanced-scorecard-professional/)

### Ödeme isteği yöntemi

- [Prospeo, fiyat araştırması](https://prospeo.io/s/go-to-market-pricing-strategy)
- [CleverX, ödeme isteği](https://cleverx.com/blog/enterprise-b2b-willingness-to-pay-setting-and-defending-price)
- [Sawtooth, örneklem kuralları](https://www.sawtoothsoftware.com/resources/blog/posts/sample-size-rules-of-thumb)

### Açık kaynak ve lisans

- [GitLab 10-K, SEC](https://www.sec.gov/Archives/edgar/data/1653482/000162828026018731/gtlb-20260131.htm)
- [Brussels Times, Odoo](https://www.brusselstimes.com/2332306/odoo-announces-e10-billion-valuation-and-a-partial-price-increase)
- [Frappe, kârlılık yazısı](https://frappe.io/blog/culture/the-path-to-profitability)
- [GitHub, Cal.diy](https://github.com/calcom/cal.diy)
- [GitHub, Elasticsearch lisansı](https://github.com/elastic/elasticsearch/blob/main/LICENSE.txt)
- [GitHub, Sentry lisansı](https://github.com/getsentry/sentry/blob/master/LICENSE.md)
- [GitHub, Frappe Framework](https://github.com/frappe/frappe)
- [GitHub, ERPNext](https://github.com/frappe/erpnext)
- [GitHub, Frappe Press](https://github.com/frappe/press)

### Müşteri değeri

- [McKinsey, davranışsal strateji, arşiv kopyası](http://web.archive.org/web/20260722015914/https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/the-case-for-behavioral-strategy)
- [PMI Pulse of the Profession 2020, arşiv kopyası](http://web.archive.org/web/20261105051057/https://www.pmi.org/learning/thought-leadership/pulse/pulse-of-the-profession-2020)
- [Otis ve arkadaşları, Management Science](https://doi.org/10.1287/mnsc.2024.06909)
- [Dell'Acqua ve arkadaşları, Organization Science](https://doi.org/10.1287/orsc.2025.21838)

### Ürün belgeleri ve ham notlar

- [Bütünleşik geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md)
- [Belge haritası](../docs/belge-haritasi.md)
- [Derin gelir modeli analizi, önceki rapor](<Derin gelir modeli analizi.md>)
- [Derin ICP ve persona analizi](<Derin ICP ve persona analizi.md>)
- [Derin hizmet ve yetki modeli](<Derin hizmet ve yetki modeli.md>)
- [Karar Atlası bilinmeyen bilinmeyenler güncel](<Karar Atlası bilinmeyen bilinmeyenler güncel.md>)
- [Gelir doğrulama notları](<../research_notes/Doğrulanmış gelir modeli analizi/gelir_dogrulama.md>)
- [Yapay zekâ ve marka doğrulama notları](<../research_notes/Doğrulanmış AI ve marka konumlandırma/ai_ve_marka_dogrulama.md>)
- [Hizmet ve yetki doğrulama notları](<../research_notes/Doğrulanmış hizmet ve yetki modeli/hizmet_ve_yetki_dogrulama.md>)
- [Codex aktarım listesi](<../research_notes/Codex belgelerinden alınanlar/codex_aktarim_listesi.md>)
- [Yapay zekâ tasarım notları](<../research_notes/Derin AI ve marka konumlandırma/ai_tasarimi.md>)
- [ICP yöntemi notları](<../research_notes/Derin ICP ve persona analizi/icp_yontemi_ve_buyukluk.md>)

## Denetim notu

Gerçek okurla denenmedi.

Rapor 16 Kasım 2026 Pazartesi günü yalın Türkçe denetim betiğinden geçirildi. Betik 0 hata ve 4 uyarı verdi. Uyarıların nedenleri şunlardır:

1. İki satır 15 kelimeyi aşar. İkisi de formüldür. Formül bölünürse okur hesabı izleyemez. Bu yüzden formüller tam bırakıldı.
2. Bir uyarı 11 ile 15 kelimelik cümleleri sayar. Bu cümleler elle okundu. Çoğu açıklama, tablo hücresi ya da formüldür. Hepsi 15 kelime sınırının içindedir.
3. Bir uyarı uzun kelimeleri sayar. Çoğu günlük kelimedir. Örneğin "geliştirici" ve "yöneticisi". Bir kısmı kaynak adıdır.

Elle şu kontroller yapıldı:

1. Metinde noktalı virgül, uzun çizgi, ok işareti ve orta nokta yoktur.
2. Eğik çizgi yalnız bağlantılarda ve resmî numaralarda geçer. Örneğin "2026/215 sayılı bülten".
3. Unvan her yerde "stratej" olarak yazıldı. Yanlış yazım arandı ve bulunmadı.
4. Metinde özel kişi adı yoktur. Sunucu işinin sahibi "DevOps sorumlusu" olarak anıldı.
5. Kaynak bağlantıları korundu.

Senaryo, duyarlılık ve nakit sayıları aynı gün bir Python betiğiyle hesaplandı. Betik önceki modelin kopyasıdır. Girdiler bu rapordaki doğrulanmış değerlerle değiştirildi. Betik depoya eklenmedi.

Dış bilgiler araştırma notlarından gelir. Bu yazım adımında yeni web araştırması yapılmadı. Bütçe sayımı bulgusu için tarayıcı kodu bu oturumda okundu (`src/engine/gate.ts`).
