# İnternet kesilince uygulama nasıl çalışmalı? Araştırma ve çözüm önerisi

Bu raporu Claude 15 Kasım 2026 Pazar günü hazırladı. Rapor bir araştırmadır. Hiçbir kod yazılmadı.

## Kısa cevap

Üç soru sordunuz. Cevapları şunlardır:

1. **Frappe'de hazır bir çevrimdışı eşitleme var mı?** Yok. Frappe'nin 15, 16 ve geliştirme sürümlerinin kaynak kodunu okudum. Frappe yalnız parçaları verir. Eşitlemeyi biz kurarız.
2. **Veri tarayıcıda nerede durmalı?** Veri, tarayıcının kendi veritabanında durmalı. Bu veritabanının adı IndexedDB'dir. Yerel SQL şimdilik gerekmez. Tarayıcı önbelleği ise kullanıcı verisi için uygun değildir.
3. **Askeri yazılımlar bu işi nasıl yapıyor?** Askeri yazılımlar bağlantının her an kesilebileceğini varsayar. Her cihaz kendi verisiyle tek başına çalışır. Bağlantı gelince veri sırayla ve öncelikle gönderilir. Resmî kararlar ise yalnız merkez onaylayınca kesinleşir.

Önerim tek bir modeldir. Modelin adı şudur: **önce yerele yaz, sonra gönder, kararı sunucu kesinleştirsin.** Model 5. bölümdedir.

Bir noktaya dikkat çekmek istiyorum. "Yalnız internet kesilince yerele yaz" demek yanlış olur. Uygulama her zaman yerele yazmalı. Gönderme işi her zaman arka planda çalışmalı. Nedeni 5.1 bölümündedir.

## 1. Terimler

Raporda birkaç teknik terim geçiyor. Hepsini bir kez açıklıyorum.

| Terim | Anlamı |
|---|---|
| IndexedDB | Her tarayıcıda bulunan küçük bir veritabanı. Kayıtları ve dosyaları saklar. |
| localStorage | Tarayıcının basit not defteri. En çok 5 MB tutar. Uygulama bugün bunu kullanıyor. |
| Önbellek | Tarayıcının sayfa dosyalarını sakladığı yer. Uygulamanın kendisi içindir, kullanıcının verisi için değildir. |
| Servis işçisi | Tarayıcıda arka planda çalışan küçük program. Uygulamanın internet yokken açılmasını sağlar. |
| Giden kutusu | Sunucuya henüz gitmemiş değişikliklerin bekleme listesi. |
| Tekrar anahtarı | Her değişikliğe verilen tek bir kimlik. Aynı değişiklik iki kez gelirse sunucu ikinciyi yok sayar. |
| Çakışma | İki kişinin aynı alanı birbirinden habersiz değiştirmesi. |
| Eşitleme | Tarayıcıdaki kopya ile sunucudaki kopyayı aynı hâle getirme işi. |

## 2. Frappe'de hazır çevrimdışı eşitleme var mı?

### Ne buldum?

Frappe'nin kaynak kodunu üç sürümde okudum: 15, 16 ve geliştirme sürümü.

| Konu | Bulgu | Doğrulama |
|---|---|---|
| Frappe'nin kendi ekranları | Servis işçisi yok. Bekleyen değişiklik listesi yok. İnternet kesilince yalnız bir uyarı çıkıyor. | Kaynak kodda okudum. |
| frappe-ui kitaplığı | Yalnız okuma önbelleği var. İnternetsiz yapılan değişikliği saklayan bir yapı yok. | Kaynak kodda okudum. |
| ERPNext satış ekranı (sürüm 12) | İnternetsiz çalışıyordu. Sürüm 13'te bu ekran kaldırıldı. | Kaynak kodda okudum. |
| Topluluğun satış uygulamaları | POS Awesome ve POSNext internetsiz çalışıyor. İkisi de kendi eşitlemesini yazmış. | Kaynak kodda okudum. |
| Frappe'nin öteki uygulamaları | HRMS ve Helpdesk yalnız uygulamanın kendisini önbelleğe alıyor. Veri eşitlemesi yok. | Kaynak kodda okudum. |
| Frappe ekibinin görüşü | Frappe yöneticileri forumda çevrimdışı uygulamanın çekirdeğe girmemesi gerektiğini yazmış. | Forumda okudum. |

Topluluk uygulamalarından bir ders çıkıyor. İki satış uygulaması da aynı yolu seçmiş:

1. Değişikliği tarayıcıda IndexedDB'ye yazıyorlar.
2. Her değişikliğe bir tekrar anahtarı veriyorlar.
3. Sunucu aynı anahtarı ikinci kez görünce kaydı yeniden yazmıyor.
4. Sunucu her kaydı bağlantı gelince yeniden denetliyor. Denetimi geçemeyen kayıt taslak olarak kalıyor.

Bu, bizim için önerdiğim yolun aynısıdır.

### Frappe bize ne veriyor?

| Parça | Ne işe yarar? | Hangi sürümde var? |
|---|---|---|
| Eski kopya denetimi | Bir kayıt başkası tarafından değiştirildiyse Frappe eski kopyanın kaydını reddeder. | 15 ve 16 |
| Tek işlem kuralı | Bir istekteki bütün değişiklikler ya birlikte yazılır ya hiçbiri yazılmaz. | 15 ve 16 |
| Değişiklik zamanı | Her kayıt son değişiklik zamanını taşır. "Şu andan sonra değişenler" diye sorulabilir. | 15 ve 16 |
| Silinen kayıt listesi | Frappe silinen her kaydı ayrı bir listeye yazar. | 15 ve 16 |
| Tarayıcının seçtiği kimlik | Tarayıcı yeni kaydın kimliğini kendisi verebilir. Bu, internetsiz kayıt açmak için gereklidir. | Yalnız 16 |
| Parça parça dosya yükleme | Büyük dosya parçalar hâlinde yüklenir. Arka yüz planındaki inceleme bu özellikte üç sorun buldu. Biz kendi yükleme ucumuzu yazarız. | Yalnız 16 |
| Kurum başına ayrı site | Her kurumun kendi veritabanı olur. | 15 ve 16 |

Bir uyarı var. Eski kopya denetimi ancak tarayıcı son gördüğü değişiklik zamanını gönderirse çalışır. Tarayıcı bu zamanı göndermezse son yazan kazanır ve önceki değişiklik sessizce kaybolur.

### Bizim kurmamız gerekenler

1. Uygulamanın internetsiz açılması için bir servis işçisi.
2. Tarayıcıda bir yerel depo ve bir giden kutusu.
3. Sunucuda tek bir eşitleme ucu. Uç her değişikliği ayrı bir ara kayıt noktasında yazar. Böylece reddedilen bir değişiklik ötekileri geri almaz.
4. Sunucuda tekrar anahtarlarını tutan bir tablo.
5. Çakışmayı bulan ve kullanıcıya gösteren bir yapı.
6. Sunucudan değişiklikleri sırayla çeken bir sayaç.
7. Her kurum için tarayıcıda ayrı bir depo.

## 3. Veri tarayıcıda nerede durmalı?

Sorunuzu dört seçenekle karşıladım: yerel SQL, HTML5 depolama, tarayıcı önbelleği ve başka yollar.

### Seçeneklerin karşılaştırması

| Seçenek | Ne için uygun? | Sınırı | Kararım |
|---|---|---|---|
| localStorage (HTML5 depolama) | Küçük ayarlar | 5 MB. Yazarken ekranı dondurur. | Plan verisi için **uygun değil**. Uygulama bugün bunu kullanıyor. Kanıt dosyaları gelince yetmez. |
| sessionStorage (HTML5 depolama) | Tek sekmelik geçici veri | Sekme kapanınca silinir. | **Uygun değil.** |
| Tarayıcı önbelleği | Uygulamanın dosyaları | Uygulama içine yazamaz. Veri için tasarlanmamıştır. | Kullanıcı verisi için **uygun değil**. |
| Cache Storage (servis işçisi önbelleği) | Uygulamanın dosyaları | Kayıtlar kendiliğinden güncellenmez. | **Yalnız uygulamanın kendisi için.** Uygulama internetsiz açılır. |
| **IndexedDB** | Kayıtlar, giden kutusu ve dosyalar | Diskin büyük bir bölümü. Tarayıcıya göre değişir. | **Önerim budur.** |
| OPFS (tarayıcının özel dosya alanı) | Büyük dosyalar | IndexedDB ile aynı alanı paylaşır. | Büyük kanıt dosyaları için **iyi bir ek**. |
| SQLite (tarayıcıda çalışan SQL) | Karmaşık sorgular | Ek bir arka plan programı ister. Birden çok sekmede zorlaşır. | **Şimdilik gerekmez.** |
| PGlite (tarayıcıda çalışan Postgres) | Karmaşık sorgular | Safari'de dosya alanıyla çalışmıyor. | **Uygun değil.** |

### Yerel SQL neden şimdilik gerekmez?

Bir planın verisi on ile yüz kilobayt arasıdır. Bu kadar veriyi tarayıcı belleğinde sorgulamak yeterince hızlıdır.

Yerel SQL üç yük getirir:

1. Tarayıcıda ayrı bir arka plan programı gerekir.
2. Birden çok sekme açıksa sekmeler sıraya sokulmalıdır.
3. SQLite'ın tarayıcı sürümü açılışta bir hata görürse veriyi silebilir. Bu davranış kapatılabilir ama ayar unutulursa veri gider.

Bir gün planlar arasında karmaşık sorgu gerekirse SQLite yeniden düşünülür.

### Tarayıcı veriyi silebilir mi?

Evet, iki durumda silebilir:

| Durum | Ne olur? | Önlem |
|---|---|---|
| Disk dolarsa | Tarayıcı en az kullanılan sitenin bütün verisini siler. | Uygulama tarayıcıdan "kalıcı depo" izni ister. |
| Safari'de 7 gün kullanılmazsa | Safari sitenin verisini silebilir. | Kullanıcı uygulamayı ana ekrana ekler. Ana ekran uygulaması bu kuraldan etkilenmez. |

İki önlem de veriyi tam güvenceye almaz. Asıl güvence sık eşitlemedir. Ekran, gönderilmemiş değişiklik sayısını her zaman gösterir.

### Arka plan eşitlemesi her tarayıcıda var mı?

Yok. Chrome'da sayfa kapalıyken de eşitleme yapılabilir. Safari ve Firefox bunu desteklemiyor.

Bu yüzden eşitleme dört anda çalışır:

1. Uygulama açılınca çalışır.
2. İnternet geri gelince çalışır.
3. Kullanıcı sekmeye dönünce çalışır.
4. Uygulama açık kaldıkça belirli aralıklarla çalışır.

### Hazır eşitleme araçları işe yarar mı?

On iki aracı inceledim. Çoğu Frappe ile çalışmıyor.

| Araç | Neden uygun değil ya da neden düşünülebilir? |
|---|---|
| PowerSync | Postgres, MongoDB ve MySQL ile çalışıyor. MariaDB desteği belgelerde yok. |
| ElectricSQL | Yalnız Postgres ile çalışıyor. |
| Zero | Postgres istiyor. İnternetsiz yazmaya izin vermiyor. |
| Replicache | Geliştirilmesi durdu. Deposu arşivlendi. |
| Triplit | Kendi sunucusunu istiyor. Geleceği belirsiz. |
| Dexie Cloud | Kendi sunucusunu istiyor. Ücretli. |
| PouchDB | CouchDB sunucusu istiyor. |
| Automerge ve Yjs | Ortak metin düzenleme için iyi. Sunucunun kuralları denetlemesini zorlaştırıyor. |
| RxDB | Herhangi bir sunucuyla çalışabiliyor. Ancak IndexedDB deposu ücretli sürümde. |
| Dexie.js | Yalnız yerel depo. Eşitlemeyi biz yazarız. Ücretsiz ve açık kaynak. |

Önerim şudur: yerel depo için Dexie.js, eşitleme için kendi kodumuz. Nedenler:

1. Eşitlemenin kuralları bizim süreç kurallarımızla iç içedir. Örneğin karar yalnız sunucuda kesinleşir.
2. Frappe'nin parçaları eşitlemenin yarısını zaten veriyor.
3. Topluluktaki iki Frappe uygulaması aynı yolla çalışıyor.

### Masaüstü uygulaması bir seçenek mi?

Uygulama Tauri ya da Electron ile masaüstü uygulamasına çevrilebilir. O zaman gerçek bir SQLite dosyası kullanılır ve tarayıcı veriyi silemez.

Ancak bu yol iki yük getirir:

1. Kurulum dosyası, imzalama ve güncelleme işi gerekir.
2. iPhone'da Safari kullanan kişi bu uygulamayı kullanamaz.

Eşitleme kuralları ise yine aynı kalır. Siz tarayıcıda çalışmanın sürmesini istediniz. Bu yüzden önermiyorum.

## 4. Askeri yazılımlar bu işi nasıl yapıyor?

### Askeri terim

Askerî belgeler bu ortama kısaca DDIL der. Harfler sırasıyla engellenmiş, bozulmuş, kesintili ve dar bant demektir. Kurumlar harfleri biraz farklı açıyor. Ortak fikir şudur: bağlantı her an kesilebilir ya da çok yavaşlayabilir. Yazılım buna göre tasarlanır.

Ben yalnız herkese açık kaynakları okudum. Silah ya da harekât bilgisi okumadım.

### Askeri kaynaklardan çıkan ilkeler

| İlke | Kaynak ne diyor? (özet) | Kaynak |
|---|---|---|
| Bağlantı olsa da olmasa da aynı kurallar | Çerçeve, birlik bağlıyken de bağlı değilken de aynı biçimde çalışır. | ABD Kara Kuvvetleri ağ planı, 2025 |
| Önce yükle, sonra bağımsız çalış | Saha sunucuları göreve çıkmadan önce gerekli veriyle yüklenir. Sonra bağlantı olmadan çalışır. | Carnegie Mellon SEI, 2014 |
| Her verinin tek bir yazarı | Bir birliğin verisini yalnız o birliğin veri sorumlusu değiştirir. Ötekiler kopyasını tutar. | RAND, 1995 |
| Eski veri etiketlenir | Tahmin edilen değer "varsayım" diye işaretlenir. Bu değere dayanan kararlar izlenir. | RAND, 1995 |
| Çakışmayı yetki çözer | Aynı kaydı birden çok kişi yazarsa yetkisi en yüksek olan kazanır. | OMG DDS standardı |
| Sakla, taşı, ilet | Veri bağlantı gelene kadar cihazda saklanır. Her paketin bir ömrü ve tek bir kimliği vardır. | IETF RFC 9171 |
| Uzun kesintiden sonra her şeyi yeniden oynatma | Kesintiden sonra yalnız son 2 günün değişiklikleri yeniden gönderilir. | TAK sunucu kılavuzu |
| Kurumlar arası paylaşım süzgeçten geçer | Her kurum neyi paylaşacağını kendisi seçer. Ayar dosyaları paylaşılmaz. | TAK sunucu kılavuzu |
| Hattın taşıyabileceğinden hızlı gönderme | Hızlı gönderim kuyrukları büyütür. Veri geç gelir ve ortak tablo eskir. | Norveç savunma araştırma kurumu, 2020 |
| Uzaktan silme tek başına yetmez | Uzaktan silme, cihaz açık ve bağlıysa çalışır. Bu yüzden başka korumalarla birlikte kullanılır. | ABD NIST SP 800-124 |
| Laboratuvar başarısı saha başarısı değildir | Bir komuta sistemi laboratuvarda çalıştı, dağınık sahada çalışmadı. Personel sohbet ve e-postaya döndü. | West Point Modern Savaş Enstitüsü, 2019 (görüş yazısı) |

### Askeri ilkeler bizim uygulamada ne demek?

| Askeri ilke | Bizim uygulamada karşılığı |
|---|---|
| Aynı kurallar her durumda | Uygulama her zaman yerele yazar. İnternet olsa da olmasa da aynı kod çalışır. |
| Önce yükle | Kullanıcı yola çıkmadan önce planı ve kanıtları tarayıcıya indirir. Uygulamanın kendisi de önbellekte durur. |
| Tek yazar | Her kaydın bir sahibi olur. Örneğin kararın sahibi karar sahibidir. |
| Eski veri etiketlenir | Ekran her planda "son eşitleme" zamanını gösterir. Eski veriyle verilen karar "eski veriyle verildi" diye işaretlenir. |
| Çakışmayı yetki çözer | Rol sırası çakışmada öneri verir. Ancak yazılım kaybeden değişikliği sessizce silmez. Kişiye gösterir. Askerî standart kaybedeni bilgilendirmiyor. Bu davranışı biz almıyoruz. |
| Sakla, taşı, ilet | Giden kutusu değişikliği sunucu "aldım" diyene kadar saklar. Her değişikliğin tek bir kimliği vardır. |
| Uzun kesintide yeniden oynatma yok | Kullanıcı belirli bir süreden uzun bağlantısız kaldıysa plan baştan indirilir. Bekleyen değişiklikler sonra karşılaştırılır. |
| Kurumlar arası süzgeç | Her kurumun ayrı sitesi ve tarayıcıda ayrı deposu olur. İzin ve ayar değişikliği internetsiz yapılamaz. |
| Hızlı gönderme | Giden kutusu öncelik sırasıyla gönderir. Önce kararlar, sonra kayıtlar, en son dosyalar. |
| Uzaktan silme yetmez | Yerel veri şifrelenir. Çıkışta yerel veri silinir. Sunucu her kuralı yeniden denetler. |
| Laboratuvar başarısı | Testler kötü bağlantı taklidiyle de koşar. Örneğin yavaş, kopan ve veri kaybeden bir hat. |

## 5. Önerilen model: önce yerele yaz, sonra gönder, kararı sunucu kesinleştirsin

### 5.1. Neden yalnız kesintide değil, her zaman yerele yazmalı?

Sorunuz, verinin yalnız internet kesilince yerele kaydedilip kaydedilmeyeceğiydi. Önerim her zaman yerele kaydetmektir. Bu önerinin üç nedeni var:

1. **Tarayıcı bağlantının kesildiğini her zaman bilmez.** Örneğin kafede ağ bağlı görünür ama internet gelmez. Bu benim çıkarımımdır. Tarayıcının bağlantı bilgisi yalnız bir ipucudur.
2. **İki ayrı yol iki ayrı hata demektir.** Kesinti yolu nadiren çalışır. Bu yüzden hatası geç fark edilir. Askerî kaynak da aynı kuralı öneriyor: bağlıyken ve bağlı değilken aynı çalışma.
3. **Kullanıcı farkı görmez.** Ekran her zaman hızlıdır. Kesinti olunca yalnız "bekleyen değişiklik" sayısı artar.

### 5.2. Modelin parçaları

| No | Parça | Nerede? | Ne yapar? |
|---|---|---|---|
| 1 | Uygulama kabuğu | Tarayıcı, servis işçisi | Uygulama internetsiz açılır. |
| 2 | Yerel depo | Tarayıcı, IndexedDB | Planlar, kanıt kayıtları ve eşitleme bilgisi burada durur. |
| 3 | Giden kutusu | Tarayıcı, IndexedDB | Her değişiklik hem kayda hem giden kutusuna aynı anda yazılır. Biri yazılmazsa hiçbiri yazılmaz. |
| 4 | Dosya deposu | Tarayıcı, IndexedDB ya da OPFS | Kanıt dosyaları burada bekler. Bağlantı gelince parça parça yüklenir. |
| 5 | Gönderici | Tarayıcı | Giden kutusunu öncelik sırasıyla gönderir. Hata olursa bekleme süresini artırır. |
| 6 | Eşitleme ucu | Frappe | Gelen her değişikliği ayrı bir ara kayıt noktasında yazar. Her değişiklik için sonuç döner: yazıldı, çakıştı ya da reddedildi. |
| 7 | Tekrar tablosu | Frappe | İşlenen tekrar anahtarlarını tutar. Aynı değişiklik iki kez yazılmaz. |
| 8 | Çekme sayacı | Frappe ve tarayıcı | Tarayıcı "son aldığım yerden sonrasını ver" der. Silinen kayıtlar da gelir. |
| 9 | Çakışma ekranı | Tarayıcı | İki kişi aynı alanı değiştirdiyse ikisini de gösterir. Kullanıcı seçer. |
| 10 | Durum çubuğu | Tarayıcı | Son eşitleme zamanını, bekleyen değişiklik sayısını ve çakışma sayısını gösterir. |

### 5.3. Bir değişikliğin yolculuğu

1. Kullanıcı bir alanı değiştirir.
2. Uygulama değişikliği yerel depoya ve giden kutusuna yazar.
3. Ekran hemen güncellenir. Kullanıcı beklemez.
4. Gönderici giden kutusundaki değişikliği sunucuya yollar. Yanına kaydın son değişiklik zamanını ekler.
5. Sunucu tekrar anahtarına bakar. Anahtar daha önce işlendiyse aynı sonucu yeniden döner.
6. Sunucu kaydın değişip değişmediğine bakar. Değişmediyse değişikliği yazar.
7. Kayıt bu arada değiştiyse sunucu "çakışma" der. Uygulama alan alan karşılaştırır.
8. Yalnız bir taraf aynı alanı değiştirdiyse uygulama iki değişikliği birleştirir.
9. İki taraf aynı alanı değiştirdiyse uygulama çakışma ekranını açar. Kullanıcı seçer.
10. Sunucu "yazdım" deyince değişiklik giden kutusundan silinir.

### 5.4. Kararlar internetsiz kesinleşmez

Bu kural önceki önerimdi. Araştırma bu kuralı üç yerden destekliyor:

- RAND, kararların eski veriye dayanabileceğini söylüyor. Bu yüzden kararın dayanağı izlenmeli.
- İki Frappe satış uygulaması, denetimi geçemeyen kaydı taslak olarak bırakıyor.
- Frappe'nin kendi belge yapısında "taslak" ve "onaylandı" durumları ayrıdır.

Kural şöyle işler:

1. Karar sahibi kararı internetsiz yazabilir. Karar "gönderilmeyi bekliyor" durumunda kalır.
2. Bağlantı gelince sunucu kapı kurallarını yeniden çalıştırır.
3. Kurallar geçerse karar kesinleşir.
4. Kurallar geçmezse karar taslağa döner. Ekran sunucunun nedenini gösterir.
5. İki kişi aynı kapıya iki karar yazdıysa ilk gelen kesinleşir. İkinci karar sahibine çakışma olarak gösterilir.

İzin, rol ve kurum ayarı değişiklikleri internetsiz hiç yapılamaz.

### 5.5. Uzun kesinti

Kullanıcı uzun süre bağlantısız kalabilir. O zaman bekleyen değişiklikleri tek tek yeniden oynatmak yavaştır ve hata üretir.

Önerim şudur:

1. Kesinti belirli bir süreden kısaysa yalnız değişiklikler gönderilir ve alınır.
2. Kesinti bu süreden uzunsa plan sunucudan baştan indirilir.
3. Bekleyen değişiklikler yeni kopyayla karşılaştırılır. Çakışanlar kullanıcıya gösterilir.

Sürenin kaç gün olacağına siz karar verirsiniz. TAK sunucusu varsayılan olarak 2 gün kullanıyor.

### 5.6. Güvenlik

| Risk | Önlem |
|---|---|
| Ortak bilgisayar | "Ortak cihaz" modu sunulur. Bu modda veri tarayıcıda saklanmaz. |
| Çalınan cihaz | Yerel veri şifrelenir. Çevrimdışı oturum belirli bir sürede biter. |
| Çıkış yapan kullanıcı | Çıkışta yerel veri silinir. Gönderilmemiş değişiklik varsa uygulama önce uyarır. |
| İptal edilen kullanıcı | Bağlantı gelince sunucu önce kullanıcıyı ve izinlerini denetler. İptal edilen kişinin değişikliği yazılmaz, incelemeye ayrılır. |
| Kurumlar arası sızıntı | Her kurumun tarayıcıda ayrı deposu ve sunucuda ayrı sitesi olur. |

### 5.7. Test

Askerî kaynaklardaki en açık ders şudur: iyi ağda yapılan test yetmez.

Testler üç koşulda da koşar:

1. Bağlantı var.
2. Bağlantı yok.
3. Bağlantı kötü. Hat yavaş, ara ara kopuyor ve veri kaybediyor.

## 6. Frappe sürümü kararı

Kaynak kodu okurken önemli bir fark buldum. İki parça yalnız Frappe 16'da var.

| Parça | Frappe 15 | Frappe 16 |
|---|---|---|
| Tarayıcının seçtiği kimlik | Yok. Başka bir yolla kurulur. | Var. |
| Parça parça dosya yükleme | Yok. Biz yazarız. | Var ama güvenli değil. Biz yine kendi ucumuzu yazarız. |
| İstediği altyapı | Daha eski Python ve MariaDB yeter. | Kaynak koda göre Python 3.14 ve MariaDB 10.7 ya da sonrası gerekir. |

Önerim Frappe 16'dır. Çünkü internetsiz kayıt açmak için tarayıcının kimlik seçmesi gerekir. Altyapı gereksinimini Hüseyin Cengiz sunucuda doğrulamalıdır.

**Karar verildi.** Karar sahibi 15 Kasım 2026 Pazar günü Frappe 16'yı seçti.

## 7. Önceki üç açık kararımız

Önceki mesajda üç karar açık kalmıştı. Araştırma üçünü de etkiliyor.

| Karar | Önerim | Araştırma ne diyor? |
|---|---|---|
| Kurum ayrımı | Her kuruma ayrı Frappe sitesi | Frappe'nin kendi kurum yapısı budur. Her sitenin kendi veritabanı vardır. Frappe'de tek site içinde kurum ayrımı yapan hazır bir yapı bulmadım. |
| Karar internetsiz kesinleşsin mi? | Hayır | 5.4 bölümündeki üç kaynak bu kuralı destekliyor. |
| Çakışmada hangi kayıt kazansın? | Alan alan birleştir. Aynı alan çakışırsa kullanıcı seçsin. | Askerî standart kaybedeni haber vermeden siliyor. Kaynaklar bu davranışın sorun yarattığını gösteriyor. Biz çakışmayı her zaman gösteriyoruz. |

## 8. Sizin karar vermeniz gerekenler

1. **Frappe 15 mi, Frappe 16 mı?** Karar verildi: Frappe 16.
2. **Kaç gün kesintiden sonra plan baştan inmeli?** Önerim 7 gün.
3. **Yerel veri nasıl şifrelensin?** İki yol var:
   - Tarayıcının sakladığı bir anahtarla şifrelenebilir. Kullanıcı ek bir şey yapmaz. Ancak bilgisayarı açık bulan kişi veriyi okuyabilir.
   - Kullanıcının bildiği bir parolayla şifrelenebilir. Bu yol daha güvenlidir. Ancak parola unutulursa gönderilmemiş değişiklikler kaybolur.
4. **iPhone kullanıcısından uygulamayı ana ekrana eklemesi istensin mi?** Önerim: evet. Safari'nin 7 günlük silme kuralı bu yolla aşılır.

## 9. Riskler

| Risk | Ne olabilir? | Önlem |
|---|---|---|
| Tarayıcı veriyi siler | Gönderilmemiş değişiklikler de gider. | Kalıcı depo izni, ana ekran uygulaması, sık eşitleme ve bekleyen sayının ekranda görünmesi |
| Safari'de arka plan eşitlemesi yok | Sayfa kapalıyken veri gitmez. | Uygulama açılınca ve açık kaldıkça eşitleme |
| Birden çok sekme | İki sekme aynı veriyi yazar. | Yazma işini tek sekme yapar. Öteki sekmeler ona iletir. |
| Uzun kesinti | Çok sayıda çakışma birikir. | 5.5 bölümündeki baştan indirme kuralı |
| Uygulama güncellenir | Eski biçimdeki bekleyen değişiklik yeni sunucuya gider. | Her değişiklik bir sürüm numarası taşır. Sunucu eski biçimi tanır. |
| Sunucu saati | Aynı anda yazılan iki kayıt sayaçta kaçabilir. | Sayaç küçük bir geri pay bırakır ya da kendi sıra tablosunu tutar. |

## 10. Doğrulanamayanlar

- Frappe'yi gerçek bir sunucuda çalıştırmadım. Bütün Frappe bulguları kaynak kod okumasından gelir.
- Frappe 16'nın Python 3.14 istemesi kaynak koda dayanır. Resmî kurulum belgesiyle doğrulanmalı.
- Frappe'nin resmî belgesi kimlik türünü "UUID v4" diye yazıyor. Kaynak kod ise başka bir UUID türü üretiyor. Kaynak koda güveniyorum.
- PowerSync'in MariaDB ile çalışıp çalışmadığını doğrulayamadım.
- Safari'nin 7 gün kuralının tarayıcının özel dosya alanını kapsayıp kapsamadığını doğrulayamadım.
- iPhone ana ekran uygulamasının kalıcı depo iznini her zaman alıp almadığını doğrulayamadım.
- ABD Savunma Bakanlığı'nın bulut stratejisi belgelerini açamadım. Siteler otomatik erişimi engelledi. Bu belgelere hiçbir öneri dayanmıyor.
- NATO'nun iki araştırma raporunu açamadım. Bulgularını yalnız sonraki bir NATO makalesinden okudum.
- Askerî alanda çakışmasız birleştirme yöntemlerini sınayan hakemli bir çalışma bulamadım.
- Rapor gerçek okurla denenmedi.

## Kaynaklar

### Frappe

- [Frappe kaynak kodu](https://github.com/frappe/frappe)
- [frappe-ui kaynak kodu](https://github.com/frappe/frappe-ui)
- [Frappe UUID kimlik özelliği](https://github.com/frappe/frappe/pull/25730)
- [Frappe REST API belgesi](https://docs.frappe.io/framework/user/en/api/rest)
- [Frappe site yapısı](https://docs.frappe.io/framework/user/en/basics/sites)
- [Frappe çok kurumlu kurulum](https://docs.frappe.io/framework/user/en/bench/guides/setup-multitenancy)
- [POS Awesome, sürüm 15](https://github.com/defendicon/POS-Awesome-V15)
- [POSNext](https://github.com/BrainWise-DEV/POSNext)
- [Frappe forumu, çevrimdışı satış tartışması](https://discuss.frappe.io/t/51108/39)

### Tarayıcı

- [MDN, depolama sınırları ve silme kuralları](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [WebKit, depolama kuralı güncellemesi](https://webkit.org/blog/14403/updates-to-storage-policy/)
- [WebKit, 7 gün kuralı](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)
- [web.dev, web için depolama](https://web.dev/articles/storage-for-the-web)
- [SQLite tarayıcı sürümü, kalıcılık](https://sqlite.org/wasm/doc/trunk/persistence.md)
- [PGlite dosya sistemleri](https://pglite.dev/docs/filesystems)
- [RxDB HTTP eşitlemesi](https://rxdb.info/replication-http.html)
- [PowerSync veritabanı kurulumu](https://docs.powersync.com/installation/database-setup)
- [Dexie.js](https://github.com/dexie/Dexie.js)
- [Chrome, arka plan eşitlemesi](https://developer.chrome.com/docs/capabilities/periodic-background-sync)

### Askerî ve standartlar

- [ABD Kara Kuvvetleri birleşik ağ planı 2.0 (kopya)](https://www.globalsecurity.org/military/library/policy/army/army-unified-network-plan-2-0_20250319.pdf)
- [Carnegie Mellon SEI, saha sunucuları, 2014](https://sei.cmu.edu/documents/1456/2014_021_001_653317.pdf)
- [Carnegie Mellon SEI, bağlantısız ortamda güven, 2016](https://www.sei.cmu.edu/documents/1516/2016_021_001_653329.pdf)
- [RAND MR-669, 1995](https://www.rand.org/pubs/monograph_reports/MR669.html)
- [OMG DDS 1.4 standardı](https://www.omg.org/spec/DDS/1.4/PDF)
- [IETF RFC 9171, kesintiye dayanıklı ağ](https://www.rfc-editor.org/rfc/rfc9171)
- [TAK sunucu yapılandırma kılavuzu](https://github.com/TAK-Product-Center/Server/blob/main/src/docs/TAK_Server_Configuration_Guide.pdf)
- [NATO IST-150 makalesi (Norveç savunma araştırma kurumu kopyası)](https://www.ffi.no/en/publications-archive/nato-core-services-profiling-for-hybrid-tactical-networks-results-and-recommendations)
- [Norveç savunma araştırma kurumu, 2020](https://www.ffi.no/publikasjoner/arkiv/evaluation-of-message-broker-approaches-for-information-exchange-in-disadvantaged-tactical-networks-in-a-federated-environment)
- [ABD NIST SP 800-124r2](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-124r2.pdf)
- [West Point Modern Savaş Enstitüsü, 2019](https://mwi.westpoint.edu/90s-america-online-dial-internet-fixing-armys-horribly-outdated-digital-information-systems/)

## Sonraki belge

Bu araştırmanın vardığı model arka yüz planına işlendi. Plan [arka-yuz-plani.md](arka-yuz-plani.md) dosyasındadır. Planın bağımsız incelemesi iki konuda bu raporu düzeltti: değişiklik grubunun yazılma biçimi ve parça parça dosya yükleme.
