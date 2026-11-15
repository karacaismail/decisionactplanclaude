# Eleştiri raporu: Mobil uygulama ve SaaS dağıtımı karşısında arka yüz planı

Bu raporu Claude 15 Kasım 2026 Pazar günü hazırladı. Rapor [bütünleşik geliştirme raporunu](butunlesik-gelistirme-raporu.md) yeni hedeflere göre eleştirir. Hiçbir kod yazılmadı.

## Kısa cevap

**Modül yapısı yeterli. Plan ise bu hedeflere göre yazılmadı.**

Altı modül ve modüler monolit doğru kalıyor. Eşitleme tasarımı da doğru kalıyor. Ancak plan dört temel varsayıma dayanıyor. Yeni hedefler bu dört varsayımı bozuyor:

1. **Plan, ön yüzün her kurumun kendi adresinden açıldığını varsayıyor.** Mobil uygulamada ön yüz telefonun içinden açılır. Oturum, izin ve yerel veri ayrımı bu varsayıma dayanıyordu.
2. **Plan, sunucu ile tarayıcının hep aynı sürümde olduğunu varsayıyor.** Mağaza sürümü haftalarca eski kalabilir. Sunucu ise her gece güncellenir.
3. **Plan, yerel verinin IndexedDB'de güvende olduğunu varsayıyor.** Capacitor belgeleri, iPhone'da bu verinin silinebileceğini söylüyor.
4. **Plan, bütün kurumların tek seferde güncellendiğini varsayıyor.** Gece toplu yayın, tek bir hatayla bütün aboneleri aynı anda etkiler.

Planı bozmadan iki olmazsa olmaz parça eklenmeli: **istemci sürüm uyumluluğu** ve **merkezi kurum dizini**. Bildirim ise koşullu olarak gerekli hâle geliyor.

## 1. Yeni hedefler

Bu hedefleri karar sahibi 15 Kasım 2026 Pazar günü verdi.

| No | Hedef |
|---|---|
| 1 | Ön yüz bir PWA'dır. Capacitor ile mobil uygulama olarak da çıkar. |
| 2 | Ön yüz tamamen başsızdır. Yani ön yüz ile arka yüz yalnız API üzerinden konuşur. |
| 3 | Arka yüz bir kez yazılır. Tek merkezden ve tek bir git deposundan yönetilir. |
| 4 | Geliştirmeler her gece 02.30 ile 04.00 arasında bütün SaaS abonelerine uygulanır. |
| 5 | Mobil uygulamanın küçük değişiklikleri uzaktan dağıtılır. |
| 6 | Mobil uygulamanın büyük değişiklikleri App Store ve Play Store üzerinden çıkar. |
| 7 | Yayın Jenkins ve Frappe Press ile yapılır. |
| 8 | Ön yüzde ortak kod ile ekrana göre yüklenen kod ayrılır. |

Terimler:

| Terim | Anlamı |
|---|---|
| PWA | Tarayıcıda açılan ama uygulama gibi kurulabilen web uygulaması |
| Capacitor | Web uygulamasını iPhone ve Android uygulaması olarak paketleyen araç |
| Başsız ön yüz | Arka yüzün ekranlarını kullanmayan, yalnız API çağıran ön yüz |
| Uzaktan güncelleme | Mağazaya gitmeden, uygulamanın web kodunun telefona indirilmesi |
| Kabuk | Mobil uygulamanın mağazadan gelen yerli kısmı. Uzaktan güncellenemez. |
| Sürüm farkı | Sunucunun, web kodunun ve kabuğun aynı anda farklı sürümlerde olması |
| Kurum dizini | Kullanıcının hangi kurum sitesine bağlanacağını söyleyen merkezi liste |
| Dalga | Yayının kurumlara gruplar hâlinde uygulanması |

## 2. Ne yeterli, ne yetersiz?

| Plan parçası | Durum | Kısa gerekçe |
|---|---|---|
| Altı modül ve modüler monolit | Yeterli | Mobil uygulama yeni bir veri yazarı getirmiyor. |
| Kararların sunucuda kesinleşmesi | Yeterli | Mobilde de aynı kural geçerli. |
| Giden kutusu, tekrar anahtarı ve değişiklik akışı | Yeterli | Mobil uygulama daha sık bağlantı kaybeder. Bu tasarım tam bunun için var. |
| Kurum başına ayrı site | Yeterli, eksikli | Mobil uygulama hangi siteye bağlanacağını bilmiyor. 3.2 bölümüne bakın. |
| Oturum ve izin modeli | **Yetersiz** | Aynı adres varsayımına dayanıyor. 3.1 bölümüne bakın. |
| Kuralların iki dilde yaşaması | **Yetersiz** | Sürüm farkını hesaba katmıyor. 3.3 bölümüne bakın. |
| Yerel depo olarak IndexedDB | **Mobilde yetersiz** | iPhone'da veri silinebilir. 3.5 bölümüne bakın. |
| DevOps işleri | **Yetersiz** | Gece yayını, dalga, uzaktan güncelleme ve mağaza işleri yok. 3.6 bölümüne bakın. |
| Ön yüz değişiklikleri | **Yetersiz** | Ortak kod ile ekrana özel kod ayrımı yok. 3.8 bölümüne bakın. |

## 3. Eleştiriler

### 3.1. Aynı adres varsayımı çöküyor

#### Plan ne diyor?

Ön yüz her kurumun kendi sitesinden açılır. Böylece üç şey kendiliğinden çözülür:

- Oturum çerezi çalışır.
- Yerel veri kurumlara göre ayrılır.
- Servis işçisi aynı adreste durur.

#### Yeni hedef ne istiyor?

Ön yüz başsızdır. Mobil uygulamada ön yüz telefonun içinden açılır. Bu yüzden ön yüzün adresi kurum sitesinin adresi değildir.

#### Sonuç


1. Frappe'nin oturum çerezi farklı adreste çalışmaz. Bir Frappe forum yanıtı bunu açıkça söylüyor. Yanıta göre mobil uygulama OAuth ile erişim anahtarı almalıdır.
2. Tarayıcı yerel veriyi artık kurumlara göre kendiliğinden ayırmaz. Bütün kurumların verisi aynı adreste durur.
3. Sahte istek anahtarı ve çerez ayarları gereksiz olur. Yerine erişim anahtarı gelir.

#### Öneri


1. Bütün istemciler için tek oturum modeli kurulur: OAuth 2 ile erişim anahtarı. Frappe bunu destekliyor. Web ve mobil aynı yolu kullanır.
2. Erişim anahtarı mobilde telefonun güvenli kasasında saklanır. Örneğin iPhone'da Keychain. Web'de bellekte tutulur.
3. Her kurum sitesi yalnız bilinen ön yüz adreslerine izin verir. Frappe'de bunun ayarı vardır. Yıldız işareti, yani herkese izin, kullanılmaz.
4. Yerel depo her kurum için ayrı bir veritabanı açar. Kullanıcı kurum değiştirince öteki kurumun verisi kilitlenir.
5. Cihaz iptal edilince erişim anahtarı da iptal edilir.

### 3.2. Mobil uygulama hangi kuruma bağlanacağını bilmiyor

#### Plan ne diyor?

Kullanıcı kurumun adresini açar. Adres kurumu belirler.

#### Yeni hedef ne istiyor?

Mağazada tek bir uygulama olur. Bütün aboneler aynı uygulamayı indirir.

#### Sonuç

Uygulama, kullanıcının hangi kurum sitesine bağlanacağını bir yerden öğrenmelidir. Bu bilgi hiçbir kurum sitesinde duramaz. Çünkü kurum siteleri birbirini bilmez.

#### Öneri: Merkezi kurum dizini

Bu parça olmazsa olmazdır. Kurum sitelerinin dışında, merkezde durur.

| Soru | Cevap |
|---|---|
| Ne tutar? | Kurum kodu, e-posta alanı ve site adresi |
| Nerede durur? | Frappe Press'in yönetim sitesinde ya da küçük ayrı bir serviste |
| Nasıl çalışır? | Kullanıcı e-postasını ya da kurum kodunu yazar. Dizin site adresini döner. Uygulama o siteye bağlanır. |
| Neyi tutmaz? | Plan verisini hiç tutmaz. Kullanıcının parolasını da tutmaz. |
| Güvenlik | Dizin, var olmayan kurum için de aynı biçimde cevap verir. Böylece dizin kurum listesini dışarı sızdırmaz. |

### 3.3. Sürüm farkı planın en büyük boşluğu

#### Plan ne diyor?

Python kurallarının yalnız son sürümü vardır. Yayında bütün planlar yeni sürüme taşınır. Eski uygulama değişiklik gönderirse sunucu "uygulamayı güncelleyin" der.

#### Yeni hedef ne istiyor?

Aynı anda üç sürüm yaşar:

| Parça | Ne zaman güncellenir? | Ne kadar eski kalabilir? |
|---|---|---|
| Sunucu | Her gece | Bir gün |
| Uzaktan gelen web kodu | Uygulama açılınca | Kullanıcı uygulamayı açmazsa günlerce |
| Kabuk | Mağaza onayıyla | Kullanıcı güncellemezse haftalarca |

#### Sonuç

Planın kuralı her gece binlerce kullanıcıyı "uygulamayı güncelleyin" ekranına düşürür. İnternetsiz çalışan bir kullanıcının giden kutusu da eski biçimde kalır. O değişiklikler ya reddedilir ya da yanlış okunur.

#### Öneri: Uyumluluk penceresi


1. Her istek iki sürüm bilgisi taşır: web kodunun sürümü ve kabuğun sürümü.
2. Sunucu belirli bir pencere boyunca eski sürümleri de kabul eder. Önerim 30 gün ya da son iki mağaza sürümü. Hangisi uzunsa o geçerlidir.
3. Veritabanı değişiklikleri iki adımda yapılır. Önce yeni alan eklenir. Eski alan ancak pencere kapanınca kaldırılır. Aynı gece hiçbir alan kaldırılmaz.
4. Giden kutusundaki her değişiklik kendi biçim sürümünü taşır. Sunucu eski biçimi yeni biçime çeviren küçük çeviriciler tutar.
5. Pencerenin dışındaki istemci reddedilir. Bu istemcinin bekleyen değişiklikleri kaybolmaz. Uygulama güncellenince gönderilir.
6. Kural sürümü her kararın dayanağına yazılır. Sunucu kararı kendi kurallarıyla değerlendirir. Tarayıcının sonucu yalnız bir öneridir. İki sonuç farklıysa ekran "kurallar güncellendi" der.
7. Yeni bir özellik önce sunucuda kapalı olarak çıkar. Kurum bazında açılır. Böylece gece yayını ile özelliğin açılması ayrılır.

Bu öneri iki parça ister:

- **İstemci sürüm uyumluluğu.** Bu parça olmazsa olmazdır. Eşitleme modülüne girer. Desteklenen en eski sürümü ve çeviricileri tutar.
- **Özellik anahtarları.** Kurum ayarlarına girer. Ayrı bir modül gerektirmez.

### 3.4. Uzaktan güncellemenin sınırları yazılmamış

#### Yeni hedef ne istiyor?

Mobil odaklı küçük değişiklikler mağazaya gitmeden dağıtılır.

#### Kurallar ne diyor?


| Mağaza | Kural | Kaynağın türü |
|---|---|---|
| Apple | Sonradan indirilen yorumlanan kod, uygulamanın ana amacını değiştirmezse kabul edilir. Kural App Store kılavuzunda değil, geliştirici lisans sözleşmesindedir. | Satıcı blogu ve forum. Apple'ın güncel metnini okumadım. |
| Google | Play dışından çalıştırılabilir kod indirilemez. Web görünümünde çalışan JavaScript bu yasağın dışındadır. | Google'ın politika sayfası |

Yani web kodu uzaktan güncellenebilir. Yerli kod, yeni izin ve yeni yerli eklenti ise ancak mağazadan gelir.

#### Sonuç

Uzaktan güncelleme için dört kural gerekir. Plan bunları içermiyor.

#### Öneri


1. **Kanallar kabuk sürümüne bağlanır.** Her web paketi hangi kabuk sürümüyle çalıştığını bilir. Yeni yerli eklenti isteyen paket eski kabuğa gönderilmez.
2. **Paketler imzalanır.** Telefon imzasız paketi kurmaz.
3. **Kendiliğinden geri dönüş kurulur.** Yeni paket açılışta "hazırım" demezse telefon eski pakete döner.
4. **Paketler dalga hâlinde çıkar.** Önce kullanıcıların küçük bir kısmı alır.

Bir uyarı var. Ionic'in uzaktan güncelleme hizmeti Appflow'un yeni satışı 2025'te durdu. Mevcut müşterilerin erişimi 31 Aralık 2027'de bitiyor. Bu yüzden Appflow seçilmemeli. İki seçenek var: Capgo ve Capawesome Cloud. İkisi de kanal, imza ve geri dönüş sunuyor. Bu bilgiler satıcıların kendi belgelerinden geliyor. Seçimden önce doğrulanmalı.

### 3.5. Mobilde yerel depo güvenilir değil

#### Plan ne diyor?

Yerel veri IndexedDB'de durur. Yerel SQL şimdilik gerekmez.

#### Yeni bilgi

Capacitor'ın kendi belgesi şunu söylüyor: telefonun yeri azalırsa iPhone, web görünümünün yerel verisini silebilir. IndexedDB de bundan etkilenir.

#### Sonuç

Mobil uygulamada gönderilmemiş değişiklikler kaybolabilir. Bu, internetsiz çalışmanın amacını bozar.

#### Öneri: Depo bağdaştırıcısı


| Ortam | Yerel depo | Şifreleme |
|---|---|---|
| Web ve PWA | IndexedDB | Tarayıcının sakladığı anahtar |
| Mobil uygulama | SQLite. Capacitor'ın topluluk eklentisi kullanılır. | SQLCipher ve telefonun güvenli kasası |

Eşitleme kodu her iki depoyu da aynı arayüzle kullanır. Yani giden kutusu ve kayıtlar iki ortamda aynı biçimdedir. Önceki "yerel SQL şimdilik gerekmez" kararı mobil için geçersiz olur. Web için geçerli kalır.

### 3.6. Gece toplu yayın tek bir hatayla herkesi etkiler

#### Yeni hedef ne istiyor?

Geliştirmeler her gece 02.30 ile 04.00 arasında bütün abonelere uygulanır.

#### Eleştiriler


1. **Saat dilimi yazılmamış.** 02.30 Türkiye'de gece, başka bir ülkede iş saatidir. Kurumlar farklı ülkelerdeyse yayın penceresi kurumun saatine göre belirlenmelidir.
2. **Bütün kurumlar aynı anda güncellenir.** Bir hata bütün aboneleri aynı sabah etkiler. Frappe'de bir kurulumdaki bütün siteler aynı kodu kullanır. Bu yüzden dalga yapmak için birden çok kurulum gerekir.
3. **Pencere yetmeyebilir.** Her sitede veritabanı güncellemesi ayrı çalışır. Kurum sayısı arttıkça 90 dakika yetmeyebilir.
4. **Sabah eşitleme fırtınası olur.** Gece yayından sonra bütün telefonlar sabah aynı anda eşitlemeye ve paket indirmeye başlar.
5. **Her gece yayın her gece risk demektir.** Değişiklik yoksa yayın yapılmamalıdır.

#### Öneri


| No | Kural |
|---|---|
| 1 | Yayın dalgalarla yapılır. İlk dalga deneme kurumlarıdır. Sonraki dalga ancak ilk dalga temiz geçerse başlar. |
| 2 | Dalgalar ayrı Frappe kurulumlarında durur. Press bu gruplamayı destekler. |
| 3 | Her dalgadan önce yedek alınır. Her dalganın geri dönüş adımı denenmiştir. |
| 4 | Pencere kurumun saat dilimine göre belirlenir. |
| 5 | Pencere içinde bitmeyen dalga durur. Kalan kurumlar ertesi geceye kalır. |
| 6 | Sabah eşitlemesi için sunucu istek hızını sınırlar. Telefonlar eşitlemeyi rastgele kısa bir gecikmeyle başlatır. |
| 7 | Değişiklik yoksa yayın yapılmaz. |

### 3.7. Jenkins ile Press'in görevleri ayrılmamış

#### Eleştiri

İki araç da yayın yapabilir. Görevleri ayrılmazsa aynı işi iki araç yapar ya da hiçbiri yapmaz.

#### Bulgu

Press, Frappe Cloud'u yöneten yazılımdır. Kendi sunucumuzda kurmak zordur. Frappe forumunda bir kullanıcı, kendi kurduğu Press'te zamanlanmış işlerin elle eşitlenmesi gerektiğini yazmış. Bir Frappe geliştiricisi de kendi sunucuda yönetim işlerinin bench aracına taşındığını yazmış. İkisi de resmî belge değildir.

#### Öneri: Görev ayrımı


| Araç | Görevi |
|---|---|
| Jenkins | Testleri çalıştırır. Arka yüz kurulum görüntüsünü üretir. Web paketini üretir ve imzalar. Mobil kabuğu derler ve mağazalara gönderir. |
| Frappe Press | Kurum sitelerini açar. Arka yüzü dalgalar hâlinde sitelere uygular. Yedek alır. |
| Uzaktan güncelleme hizmeti | Web paketini kanallara dağıtır. |
| App Store ve Play Store | Kabuğu dağıtır. |

Jenkins yayını kendisi yapmaz. Yalnız Press'e ve uzaktan güncelleme hizmetine "yeni sürüm hazır" der.

Press'in kendi sunucumuzda çalıştığı önce küçük bir denemeyle kanıtlanmalıdır. Deneme başarısız olursa yedek yol, bench ve Jenkins'le yazılmış yayın adımlarıdır.

### 3.8. Ortak kod ile ekrana özel kod ayrılmamış

#### Yeni hedef ne istiyor?

Ön yüzde ortak kod ile ekrana göre yüklenen kod ayrılır.

#### Öneri: Dört katman


| Katman | İçinde ne var? | Ne zaman yüklenir? |
|---|---|---|
| Çekirdek | Veri türleri, kurallar, eşitleme, depo arayüzü, API istemcisi, tasarım değişkenleri | Her zaman |
| Kabuk | Telefon düzeni ya da geniş ekran düzeni. Gezinme. | Ekranın özelliklerine göre biri yüklenir |
| Ekranlar | Her sayfanın kodu | Kullanıcı o sayfayı açınca |
| Yerli bağdaştırıcılar | SQLite, güvenli kasa, kamera, bildirim | Yalnız mobil uygulamada |

Dört kural bu ayrımı korur:

1. Seçim cihaz adına göre yapılmaz. Ekranın genişliğine, giriş yöntemine ve çalışma ortamına göre yapılır. Bu, kalıcı arayüz kurallarınızın gereğidir.
2. Çekirdek hiçbir ekran kodunu içe aktaramaz. Bu kural bir testle denetlenir.
3. Mobil uygulamada bütün kod zaten telefondadır. Bu yüzden ayrımın faydası orada ağ değil, paket boyutudur. Küçük paket, uzaktan güncellemeyi hızlandırır.
4. Hangi kodun indirildiği gerçek ağ kaydıyla doğrulanır.

**Başsızlığın bir sonucu daha var.** Ön yüz yalnız API'ye bağlıdır. Bu yüzden API bir sözleşme olarak yazılmalıdır. Sözleşmeden TypeScript istemcisi otomatik üretilir. Böylece ön yüz ile arka yüz aynı sözleşmeyi okur.

### 3.9. Bildirim artık koşullu olarak gerekli

Önceki raporda bildirim elendi. Çünkü hiçbir kural bildirime dayanmıyordu.

Mobil uygulamada iki ihtiyaç doğuyor:

1. Karar sahibine "onayınızı bekleyen bir karar var" demek.
2. Kullanıcıya "çakışma var" ya da "bekleyen değişiklikleriniz gönderilemedi" demek.

Bu ihtiyaçlardan biri gerçek bir kurala dönüşürse Bildirim modülü olmazsa olmaz olur. Modülün yeri şimdiden ayrılmalıdır. Telefon bildirimi için Apple ve Google'ın bildirim servisleri kullanılır.

### 3.10. Tek depo kararı belirsiz

#### Yeni hedef ne istiyor?

Arka yüz tek merkezden ve tek depodan yönetilir.

#### Eleştiri

Üç şey hem ön yüzün hem arka yüzün ortak kaynağıdır:

1. Süreç tanımı
2. Kural örnek dosyası
3. API sözleşmesi

Ön yüz ile arka yüz ayrı depolardaysa bu üç dosya iki depoda kopya olur. Kopyalar zamanla ayrılır.

#### Öneri

Ön yüz, arka yüz ve sözleşmeler tek depoda durur. Önceki kararda arka yüz ayrı bir public depoydu. Yeni hedefe göre tek depo daha doğrudur. Tek depo yine public olur.

## 4. Planda kalanlar

Bu parçalar yeni hedeflerle de geçerli kalır:

- Altı modül ve tek yazar ilkesi
- Kararların yalnız sunucuda kesinleşmesi
- Giden kutusu, tekrar anahtarı, kilitli akış sayacı ve ara kayıt noktası
- Kurum başına ayrı Frappe sitesi
- Karar Dayanağı, Kaynak İzni ve Gösterge Ölçümü
- Kuralların iki dilde yaşaması ve ortak örnek dosyası
- Okunamayan kaydın ezilmemesi

## 5. Plana eklenmesi gerekenler

| Öncelik | Ekleme | Türü |
|---|---|---|
| 1 | OAuth 2 ile tek oturum modeli | Erişim modülünde değişiklik |
| 1 | Merkezi kurum dizini | Yeni olmazsa olmaz parça. Kurum sitelerinin dışında durur. |
| 1 | İstemci sürüm uyumluluğu ve uyumluluk penceresi | Yeni olmazsa olmaz parça. Eşitleme modülüne girer. |
| 1 | Mobilde SQLite ve depo bağdaştırıcısı | Ön yüz değişikliği |
| 2 | Uzaktan güncelleme kanalları, imza ve geri dönüş | DevOps ve ön yüz |
| 2 | Dalgalı gece yayını ve geri dönüş | DevOps |
| 2 | Jenkins ve Press görev ayrımı ve Press denemesi | DevOps |
| 2 | Ön yüzde dört katman | Ön yüz değişikliği |
| 2 | API sözleşmesi ve otomatik istemci | Arka yüz ve ön yüz |
| 3 | Özellik anahtarları | Kurum ayarı |
| 3 | Bildirim modülünün yeri | Koşullu modül |
| 3 | Tek depo | Depo yapısı |

Yeni modül sayısı yine altıdır. Kurum dizini kurum sitelerinin dışında ayrı küçük bir uygulamadır. Bildirim, ihtiyaç kurala dönüşünce yedinci modül olur.

## 6. DevOps işlerine eklenenler

Bu işlerin sahibi Hüseyin Cengiz'dir. GoDaddy işleri Asistan Hüseyin'dedir.

| No | İş | Ne olunca bitmiş sayılır? |
|---|---|---|
| 1 | Press'i kendi sunucumuzda küçük bir denemeyle kurar. | İki deneme kurumu Press'ten açıldı ve güncellendi. |
| 2 | Deneme ve üretim dalgaları için ayrı kurulumlar hazırlar. | Bir güncelleme önce deneme dalgasına çıktı. |
| 3 | Gece yayınını dalgalarla kurar. | Bir dalga hata verince sonraki dalga başlamadı. |
| 4 | Jenkins hattını kurar. Hat test eder, üretir ve imzalar. | Bir kod gönderimi testten paket üretimine kadar ilerledi. |
| 5 | Uzaktan güncelleme hizmetini kurar. | Bir web paketi bir deneme telefonuna ulaştı ve geri alındı. |
| 6 | Mağaza imza ve gönderim adımlarını Jenkins'e ekler. | Bir deneme sürümü TestFlight'a ve Play'in kapalı test kanalına çıktı. |
| 7 | Kurum dizinini kurar. | Bir e-posta doğru kurum adresine yönlendi. |
| 8 | İstek hızı sınırını kurar. | Yüzlerce eşzamanlı eşitleme isteği siteyi düşürmedi. |

Gece yayını sunucudaki zamanlanmış bir iştir. Bu iş DevOps işidir.

Apple ve Google geliştirici hesapları kurumun adına açılır. Hesapların sahibi karar sahibidir.

## 7. Açık konular

Rapor bu konularda önerilerimle ilerler:

| Konu | Önerim |
|---|---|
| Yayın penceresinin saat dilimi | Kurumun kendi saat dilimi |
| Uyumluluk penceresi | 30 gün ya da son iki mağaza sürümü, hangisi uzunsa |
| Uzaktan güncelleme hizmeti | Capgo ya da Capawesome. Seçim küçük bir denemeden sonra yapılır. Appflow seçilmez. |
| Depo yapısı | Ön yüz, arka yüz ve sözleşmeler tek public depoda |

## 8. Doğrulanmayanlar

- Apple'ın uzaktan güncelleme kuralını Apple'ın güncel lisans metninden okumadım. Bilgi satıcı bloglarından ve forumlardan geliyor.
- Frappe Press'in kendi sunucumuzda nasıl çalıştığını belgeden doğrulayamadım. Bilgi forum yazılarından geliyor.
- Capgo ve Capawesome bilgileri satıcıların kendi belgelerinden geliyor.
- Capacitor uygulamasının hangi adresle istek gönderdiği denenmedi. İzin listesi bu adrese göre kurulur.
- Bu rapor gerçek okurla denenmedi.

## Kaynaklar

- [Google Play, Device and Network Abuse politikası](https://support.google.com/googleplay/android-developer/answer/9888379?hl=en)
- [Bitrise, Apple ve Google'ın uzaktan güncelleme kuralları](https://bitrise.io/blog/post/what-app-stores-allow-with-ota-updates-apple-and-google-policy-explained)
- [Capgo, Apple ve uzaktan güncelleme](https://capgo.app/blog/do-apple-allow-live-updates/)
- [Capacitor, veri saklama rehberi](https://capacitorjs.com/docs/guides/storage)
- [RxDB, Capacitor veritabanı rehberi](https://rxdb.info/capacitor-database.html)
- [Ionic, Appflow'un kapanışı](https://ionic.zendesk.com/hc/en-us/articles/29907381079831)
- [Capawesome, uzaktan güncelleme iyi uygulamaları](https://capawesome.io/docs/cloud/live-updates/guides/best-practices/)
- [Capgo, yerli kod ve uzaktan güncelleme uyumluluğu](https://capgo.app/docs/live-updates/compatibility/)
- [Frappe, OAuth 2 belgesi](https://docs.frappe.io/framework/oauth2)
- [Frappe forumu, React ve mobilde oturum](https://discuss.frappe.io/t/frappe-react-sdk-authentication-error/135818)
- [Frappe forumu, Capacitor ve CORS](https://discuss.frappe.io/t/erpnext-api-connection-issues-from-ionic-capacitor-mobile-app-cors-and-cookies/139290)
- [Frappe forumu, kendi sunucuda Press](https://discuss.frappe.io/t/self-hosted-press-in-production-version-compatibility-and-setup-guidance-needed/164771)
- [Frappe forumu, Press yerine bench](https://discuss.frappe.io/t/guidance-on-self-hosting-frappe-cloud-without-press-cli/141824)
- [Frappe Cloud, bench güncelleme](https://docs.frappe.io/cloud/benches/updating_a_bench)
