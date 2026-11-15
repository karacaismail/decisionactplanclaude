# Arka yüz planı: Frappe 16, birden çok kurum, internetsiz çalışma

Bu planı Claude 15 Kasım 2026 Pazar günü hazırladı. Plan bir tasarımdır. Hiçbir arka yüz kodu yazılmadı.

Planın ilk sürümünü bağımsız bir inceleyici okudu. İnceleyici 25 sorun buldu. Bu sürüm 25 sorunun hepsini işler. Ne değiştiği 13. bölümdedir.

## Kısa cevap

Arka yüz tek bir Frappe uygulaması olacak. Uygulama altı modüle bölünecek. Modüller birbirinin tablosuna dokunmayacak. Kurallar ayrı bir pakette duracak.

Her kurumun ayrı bir Frappe sitesi ve ayrı bir veritabanı olacak. Ön yüz de her kurumun kendi adresinden açılacak.

Tarayıcı her değişikliği önce kendi deposuna yazacak. Değişiklik sonra sunucuya gidecek. Kararlar yalnız sunucuda kesinleşecek.

Planın dayandığı araştırma [cevrimdisi-calisma-arastirmasi.md](cevrimdisi-calisma-arastirmasi.md) dosyasındadır.

## 1. Verilen kararlar ve terimler

### 1.1. Kararlar

Bu kararları karar sahibi 15 Kasım 2026 Pazar günü verdi. Plan bu kararlara dayanır.

| Konu | Karar |
|---|---|
| Arka yüz teknolojisi | Frappe 16 |
| Mimari | Modüler monolit, gevşek bağlı modüller |
| Modül kuralı | Bir modül ancak olmazsa olmaz ise eklenir. Kuşkuluysa eklenmez. |
| Kurum sayısı | Birden çok kurum |
| Kurum ayrımı | Her kuruma ayrı site ve ayrı veritabanı |
| İnternetsiz çalışma | Evet. Tarayıcıda çalışma sürer. |
| Baştan indirme süresi | 2 gün |
| Yerel şifreleme | Tarayıcının sakladığı anahtar |
| Karar internetsiz | Yalnız taslak olur. Sunucuda kesinleşir. |
| Çakışma | Aynı alan çakışırsa kullanıcı seçer. |
| iPhone | Kullanıcıdan uygulamayı ana ekrana eklemesi istenir. |
| Oturum süresi | 7 gün |
| Arka yüz deposu | Ayrı bir public depo. Ön yüz deposu aynı kalır. |

### 1.2. Terimler

| Terim | Anlamı |
|---|---|
| Modüler monolit | Tek bir uygulama olarak yayına çıkar. İçi ayrı modüllere bölünür. |
| Gevşek bağ | Bir modül ötekinin tablosunu okumaz. Yalnız onun açık işlevlerini çağırır ya da yaydığı olayı dinler. |
| DocType | Frappe'de bir kayıt türü. Frappe her kayıt türü için bir tablo açar. |
| Olay | Bir modülün "şu oldu" diye yaydığı haber. Örneğin "Adım değişti". |
| UUID | Her cihazın kendi başına üretebildiği, tekrar etmeyen uzun bir kimlik. |
| Uç | Sunucunun dışarıya açtığı bir işlev. Tarayıcı bu işlevi internet üzerinden çağırır. |
| IndexedDB | Her tarayıcıda bulunan küçük bir veritabanı. |
| Servis işçisi | Tarayıcıda arka planda çalışan küçük program. Uygulamanın internetsiz açılmasını sağlar. |
| Giden kutusu | Tarayıcıda, sunucuya henüz gitmemiş değişikliklerin listesi. |
| Tekrar anahtarı | Her değişikliğe verilen tek kimlik. Sunucu aynı değişikliği ikinci kez yazmaz. |
| Ara kayıt noktası | Veritabanı işleminin ortasında konan bir işaret. Hata olursa yalnız bu işaretten sonrası geri alınır. |
| Anlık görüntü | Planın belirli bir andaki tam kopyası |
| TLS sertifikası | Sitenin güvenli bağlantıyla açılmasını sağlayan dijital belge |

Bu planda "internetsiz" sözü tek anlamda kullanılır: cihazın sunucuya ulaşamaması.

## 2. Modüller

### 2.1. Altı modül ve bir kurallar paketi

İlk sürümde dokuz modül vardı. İnceleyici üçünün olmazsa olmaz olmadığını gösterdi. Kuralınıza göre bu üçü modül olmaktan çıktı. Ayrıntı 2.3 bölümündedir.

| No | Modül | Neyin sahibidir? | Modül olmasa ne bozulur? |
|---|---|---|---|
| 1 | Erişim | Kurum yöneticileri, plan üyelikleri, plan rolleri ve cihazlar | "Stratej önerir, karar sahibi seçer" kuralı denetlenemez. Cihaz iptal edilemez. |
| 2 | Plan | Plan, adım cevapları, görevler, kanıtlar ve kanıt dosyaları | Kullanıcının yazdıkları saklanamaz. |
| 3 | Karar | Kapı kararları, geçiş kararı, strateji gözden geçirme kayıtları, sınır değişiklikleri, kilitler ve eskime | Kararlar kesinleşemez. Süreç sırası korunamaz. |
| 4 | Rapor | Sabitlenmiş rapor sürümleri ve anlık görüntüler | Stratej'e verilen devir raporu sonradan değişebilir. |
| 5 | Denetim kaydı | Kimin neyi ne zaman yaptığının silinmez listesi | Bir karar sonradan tartışılırsa kanıt kalmaz. |
| 6 | Eşitleme | Gelen değişiklikler, tekrar anahtarları, değişiklik akışı ve eşitleme ayarları | İnternetsiz çalışma olmaz. Aynı değişiklik iki kez yazılabilir. |

**Kurallar paketi** bir modül değildir. Tablosu yoktur. İçinde iki şey durur:

1. Süreç tanımı. Adımlar, alanlar ve kapılar sürüm numarasıyla bir JSON dosyasında durur.
2. Kurallar. Kapı ölçütleri, kilitler, eskime ve adım denetimleri Python ile yazılır.

Frappe'nin kendi kullanıcı, rol, oturum ve dosya kayıtları kullanılır. Bunları yeniden yazmayız.

### 2.2. Roller

| Rol | Düzey | Ne yapabilir? |
|---|---|---|
| Kurum yöneticisi | Kurum | Kullanıcı ekler. Cihaz iptal eder. Eşitleme ayarlarını değiştirir. |
| Karar sahibi | Plan | Plan üyesi ekler. Karar kaydeder. İncelemeye ayrılan değişiklikleri inceler. |
| Stratej | Plan | Yol önerir. Strateji adımlarını yazar. Karar kaydedemez. |
| Ekip üyesi | Plan | Adım cevaplarını ve kanıtları yazar. İkinci görüş verebilir. |
| Okur | Plan | Yalnız okur. |

Bir kişi birden çok role sahip olabilir. Tek kurucuda karar sahibi ile stratej aynı kişi olabilir.

### 2.3. Elenen modüller

| Aday | Neden modül değil? | Nereye gitti? |
|---|---|---|
| Süreç tanımı | Veri koddan üretilir ve her sitede aynıdır. Kendi tablosu gerekmez. | Kurallar paketindeki JSON dosyası |
| Kurum ayarları | Yalnız birkaç değer tutar. | Eşitleme modülündeki "Eşitleme Ayarları" kaydı |
| Kanıt | Kanıt her zaman bir plana bağlıdır. Ayrı bir yaşam döngüsü yoktur. | Plan modülü |
| Kurum açma | Her kurum ayrı bir sitedir. Site açma bir kurulum işidir. | 9. bölümdeki kurulum işleri |
| Görev takibi | Görevler planın parçasıdır. | Plan modülü |
| Göstergeler | Plan ve rapor verisinden hesaplanır. | Ön yüz |
| Yöntem kitaplığı | İçeriği sabit bir dosyadır. | Ön yüz |
| Bildirim, yapay zekâ, ödeme | Hiçbir kural bugün bunlara dayanmıyor. | Yok |

### 2.4. Kayıt türleri

| Modül | Kayıt türü | Ne tutar? |
|---|---|---|
| Erişim | Plan Üyeliği | Kullanıcı, plan ve rol |
| Erişim | Cihaz | Cihaz kimliği, kullanıcı, son eşitleme zamanı ve iptal durumu |
| Plan | Plan | Ad, profil, sınırlar, kısa yol seçimi, giriş türü, para birimi, süreç sürümü, biçim sürümü ve plan sürümü |
| Plan | Adım Kaydı | Plan, adım kimliği, cevaplar, durum ve atlama nedeni |
| Plan | Görev | İş, sorumlu, tarih, durum ve bağlı karar |
| Plan | Kanıt | Başlık, tür, basamak, tarih, kaynak, karşı bulgu ve dosya |
| Plan | Kanıt Bağı | Kanıtın bağlı olduğu adımlar |
| Plan | Devralma Kontrolü | Devralma ekranının cevapları |
| Karar | Kapı Kararı | Kapı, öneri, seçim, gerekçe, karar sahibi, ikinci görüş, görülen son karar ve eskime işareti |
| Karar | Geçiş Kararı | Geçiş kapısının sonucu ve koşulları |
| Karar | Strateji Gözden Geçirme | "Seçim hâlâ doğru mu?" cevabı ve karar |
| Karar | Sınır Değişikliği | Eski değer, yeni değer ve ikinci görüş |
| Rapor | Rapor Sürümü | Rapor türü, sürüm, anlık görüntünün özeti ve anlık görüntü |
| Denetim kaydı | Olay Kaydı | Olay türü, kayıt, kullanıcı, cihaz ve zaman |
| Eşitleme | İşlenen Değişiklik | Tekrar anahtarı, içeriğin özeti, sonuç ve zaman |
| Eşitleme | Değişiklik Akışı | Sıra numarası, kayıt türü, kayıt, plan ve işlem türü |
| Eşitleme | Akış Sayacı | Son verilen sıra numarası. Tek satırdır. |
| Eşitleme | Eşitleme Ayarları | Baştan indirme süresi ve akış saklama süresi. Tek kayıttır. |

Kimlik kuralları şunlardır:

| Kayıt | Kimliği |
|---|---|
| Plan, adım kaydı, görev, kanıt, kararlar ve rapor sürümü | UUID. Tarayıcı kimliği kendisi seçer. |
| İşlenen Değişiklik | Tekrar anahtarının kendisi |
| Değişiklik Akışı | Sıra numarası |
| Eşitleme Ayarları | Tek kayıt. Kimliği yoktur. |

Frappe 15'te de tarayıcı kayda ad verebilir. Ancak UUID türünde kimlik sütunu yalnız Frappe 16'da var. Bu tür, MariaDB 10.7 ya da sonrasını ister.

Kararlar Frappe'nin onay yapısını kullanır. Bu yapıda her kayıt "taslak", "onaylandı" ya da "iptal" durumundadır. Onaydan sonra değişebilen alanlar ayrıca işaretlenir:

| Kayıt | Onaydan sonra değişebilen alan |
|---|---|
| Kapı Kararı | Eskime işareti, koşullu iznin kapanış tarihi |
| Geçiş Kararı | Eskime işareti |
| Sınır Değişikliği | İkinci görüş |

Bu alanlar Frappe'nin olaylarını atlayan kısa yazma yoluyla yazılmaz. Böylece her değişiklik akışa ve denetim kaydına düşer.

### 2.5. Bugünkü verinin karşılığı

Ön yüz bugün her planı tek bir belge olarak saklıyor. Belgedeki her alanın yeri aşağıdadır.

| Bugünkü alan | Yeni yeri |
|---|---|
| `id` | Plan kimliği. Eski kimlik UUID'ye çevrilir. |
| `name`, `profile`, `limits`, `shortPath`, `entry`, `currency` | Plan |
| `schemaVersion` | Plan, biçim sürümü |
| `revision` | Plan sürümü. Sayıyı sunucu verir. |
| `createdAt`, `updatedAt` | Frappe'nin oluşturma ve değişiklik zamanı |
| `steps` | Adım Kaydı. Her adım ayrı bir satırdır. |
| `evidence` | Kanıt ve Kanıt Bağı |
| `takeover` | Devralma Kontrolü. Soru anahtarları süreç tanımına eklenir. |
| `decisions` | Kapı Kararı |
| `transitions` | Geçiş Kararı |
| `strategyReviews` | Strateji Gözden Geçirme |
| `changes` | Sınır Değişikliği |
| `tasks` | Görev |
| `revisions`, `outputs` | Rapor Sürümü |
| `legacyStrategy` | Plan üzerinde bir işaret |
| `example` | Taşınmaz. Örnek plan sunucuya hiç gitmez. |
| `lastLocation` | Taşınmaz. Yalnız tarayıcıda, kullanıcıya ait kalır. |
| Depodaki `backups`, `currentId`, `theme` | Taşınmaz. Yalnız tarayıcıda kalır. |

Adımlar ayrı satır olur. Bu sayede iki kişi farklı adımları değiştirirse çakışma olmaz.

Rapor sürümlerindeki anlık görüntüler büyüktür. Bu yüzden baştan indirmede gelmez. Kullanıcı bir sürümü açınca o sürüm iner.

## 3. Modüller birbirine nasıl bağlanır?

### 3.1. Kim kimi çağırabilir?

| Modül | Çağırabildiği modüller | Dinlediği olaylar |
|---|---|---|
| Erişim | Hiçbiri | Hiçbiri |
| Plan | Erişim | Hiçbiri |
| Karar | Erişim, Plan | Adım değişti, Adım atlandı, Profil değişti, Sınır değişti, Kanıt silindi |
| Rapor | Erişim, Plan, Karar | Karar onaylandı |
| Eşitleme | Erişim, Plan, Karar, Rapor | Bütün kayıt olayları |
| Denetim kaydı | Hiçbiri | Bütün olaylar |

Kurallar paketini bütün modüller kullanabilir. Kurallar paketi hiçbir modülü çağırmaz.

Dört kural bu tabloyu korur:

1. Bir modül başka modülün tablosunu okumaz. Yalnız o modülün `api.py` dosyasındaki işlevleri çağırır.
2. Plan modülü Karar modülünü tanımaz. Bir cevap değişince yalnız olay yayar.
3. Hiçbir modül Denetim kaydını çağırmaz. Denetim kaydı olayları kendisi dinler.
4. Okuma işlevleri Frappe'nin izin denetimli okuma yolunu kullanır. İzni atlayan okuma yolu yalnız sistem işlerinde kullanılır.

### 3.2. Plan, Karar'ın kilidini nasıl bilir?

Bazı adımlar kilitliyken yazılamaz. Örneğin strateji adımları geçiş kararı olmadan yazılamaz. Kilit kuralının sahibi Karar modülüdür.

Plan modülü Karar modülünü tanımadan bu kilidi uygular. Yöntem şudur:

1. Plan modülü bir "yazmadan önce denetim" noktası tanımlar.
2. Karar modülü kendini bu noktaya kaydeder.
3. Plan bir adımı yazmadan önce bu noktadaki denetimleri çalıştırır.
4. Bir denetim "kilitli" derse Plan yazmayı reddeder.

Bu kayıt Frappe'nin `hooks.py` dosyasında durur. Plan modülü yalnız noktanın adını bilir.

### 3.3. Olaylar aynı işlemde çalışır

Bir cevap değişince bağlı kararlar eskir. Bu iki iş aynı veritabanı işleminde yapılmalıdır. Biri yazılıp öteki yazılmazsa karar ile cevap birbirini tutmaz.

Bu kararın bir bedeli var. Dinleyici hata verirse olayı yayan modülün yazması da geri alınır. Kodda iki modül birbirini tanımaz. Ama çalışma anında birbirine bağlıdırlar. Bu bağ bilerek seçildi. Bir testle sınanır.

Olaylar bir zincir kurabilir. Örneğin "Yeniden aç" kararı strateji belgesini taslağa döndürür. Bu yazma "Adım değişti" olayını yayar. Olay yine Karar modülüne gelir. Bu yüzden her olay, zincirde kaçıncı olduğunu taşır. Zincir belirli bir derinliği aşarsa işlem durur ve hata verir.

### 3.4. Kurallar kodla denetlenir

Kurallar yalnız belgede kalırsa zamanla bozulur. Bu yüzden iki denetim kurulur:

1. **İçe aktarma denetimi.** `import-linter` adlı araç Python içe aktarmalarını denetler. Örneğin Plan modülü Karar modülünü içe aktarırsa denetim kırılır.
2. **Tablo adı denetimi.** Küçük bir betik her modülün kodunu tarar. Bir modül başka bir modülün kayıt türünün adını kullanırsa denetim kırılır.

İki denetim de her kod gönderiminde çalışır. Biri kırılırsa yayın yapılmaz.

## 4. Kurallar iki dilde yaşar

### 4.1. Neden iki dil?

İnternet yokken tarayıcı kapı önerisini hesaplamalıdır. Bu yüzden kurallar tarayıcıda TypeScript ile kalır.

Sunucu tarayıcıya güvenmez. Değişiklik gelince sunucu kuralları Python ile yeniden çalıştırır.

Sunucunun sonucu geçerlidir. Tarayıcının sonucu yalnız bir öneridir.

### 4.2. Hangi kurallar taşınır?

Taşınacak kural listesi elle yazılmaz. Bir betik, kuralların TypeScript içe aktarma ağacını çıkarır. Ağaçtaki her dosya ya taşınır ya da "taşınmaz" diye gerekçesiyle işaretlenir.

Bugünkü ağaçta bulunan kurallar şunlardır:

| Kural | Bugünkü TypeScript dosyası |
|---|---|
| Kapı ölçütleri ve önerisi | `src/data/decisions.ts`, `src/engine/gate.ts` |
| Karar kaydı denetimi: bütçe, tarih, öneriyi aşma ve kilit | `src/engine/gate.ts` içindeki `validateDecision` |
| Kilitler ve yazma kilitleri | `src/engine/gate.ts` |
| Geçiş kapısı ölçütleri | `src/engine/readiness.ts`, `src/engine/transition.ts` |
| Eskime, sınır değişikliği ve ikinci görüş kuralı | `src/engine/changes.ts` |
| Adımın tamamlanma koşulu | Her adımın `completeWhen` listesi |
| Adım denetimleri | Her adımın `validate` işlevi |
| Strateji oluşturma denetimleri | `src/engine/strategy.ts` |
| Asıl engel, serbest bütçe ve bağlı kurallar | `src/engine/crux.ts` |
| Yeniden açma | `src/engine/renewal.ts` |
| Veri bütünlüğü | `src/engine/integrity.ts`, `src/engine/strengths.ts` |
| Koşullu alanlar | `src/engine/conditions.ts` |

Raporlar taşınmaz. Rapor metnini tarayıcı hesaplar. Rapora dayanak olan anlık görüntüyü ise sunucu alır. Ayrıntı 6. bölümdedir.

### 4.3. İki kopya nasıl aynı kalır?

1. Bir betik TypeScript kurallarından örnek dosyası üretir. Her örnek bir plan, bir "şimdi" zamanı ve beklenen sonuçtur.
2. Geliştirici sınır değerleri için örnekleri elle de yazar. Örneğin pist tam 3 ay olan bir plan.
3. Bir üreteç rastgele planlar da üretir.
4. TypeScript testleri bütün örnekleri çalıştırır.
5. Python testleri aynı örnekleri çalıştırır.
6. İki taraf aynı örnekte farklı sonuç verirse yayın durur.

Örneklerin "şimdi" zamanı sabittir. Böylece saate bağlı kurallar iki dilde aynı sonucu verir.

Saat karşılaştıran kurallar sıra numarasıyla yazılır. Örneğin "strateji belgesi yeniden açmadan sonra tamamlandı mı?" sorusu zamanla değil, akış sıra numarasıyla cevaplanır. Çünkü tarayıcının saati ile sunucunun saati farklı olabilir.

### 4.4. Süreç tanımı değişince ne olur?

1. Geliştirici süreç tanımını değiştirince sürüm numarasını artırır.
2. Geliştirici aynı değişiklikle bir taşıma yazar. Taşıma eski planları yeni sürüme çevirir.
3. Yayında sunucu bütün planları yeni sürüme taşır. Eski sürümde plan kalmaz.
4. Python kurallarının yalnız son sürümü vardır.
5. Eski uygulamalı bir tarayıcı değişiklik gönderirse sunucu değişikliği önce taşır. Taşıyamazsa "uygulamayı güncelleyin" der. Değişiklik giden kutusunda kalır.

Örnek dosyası her süreç sürümü için ayrı tutulur.

## 5. Eşitleme

### 5.1. Tarayıcı tarafı

| Parça | Nasıl kurulur? |
|---|---|
| Yerel depo | IndexedDB. Kitaplık olarak Dexie.js kullanılır. Üç depo olur: kayıtlar, giden kutusu ve eşitleme bilgisi. |
| Giden kutusu | Her değişiklik kayda ve giden kutusuna aynı işlemde yazılır. İşlem "kesin yazma" seçeneğiyle yapılır. |
| Tekrar anahtarı | Her değişiklik rastgele bir UUID anahtar alır. Tarayıcı verisi silinse de anahtar tekrar etmez. |
| Gönderme sırası | Aynı planın değişiklikleri yazıldıkları sırayla gider. Öncelik yalnız planlar arasında ve dosyalarda uygulanır. Dosyalar en son gider. |
| Kararın bağları | Her karar, dayandığı değişikliklerin tekrar anahtarlarını taşır. |
| Gönderici | Uygulama açılınca, internet gelince, sekmeye dönülünce ve belirli aralıklarla çalışır. |
| Sekmeler | Yazma işini tek bir sekme yapar. Öteki sekmeler ona iletir. |
| Durum çubuğu | Son eşitleme zamanı, bekleyen değişiklik sayısı ve çakışma sayısı görünür. |
| Kalıcı depo | Uygulama tarayıcıdan kalıcı depo izni ister. |
| Değişiklik zamanı | Kaydın sunucudaki değişiklik zamanı düz metin olarak saklanır. Tarih nesnesine çevrilmez. Çünkü Frappe zamanı mikro saniyeye kadar karşılaştırır. Tarih nesnesi bu hassasiyeti atar. |
| Güvenlik anahtarı | Uygulama girişten sonra Frappe'nin sahte istek anahtarını sunucudan alır. Anahtar hatası gelirse yeniler ve yeniden dener. |

### 5.2. Uygulama kabuğu

Servis işçisi yalnız kendi bulunduğu yolun altını yönetebilir. Frappe uygulama dosyalarını `/assets/` yolunun altından sunar. Bu yüzden servis işçisi dosyası kök yoldan sunulmalıdır.

İki yol var:

1. Frappe'de servis işçisi dosyasını kök yoldan sunan bir sayfa tanımlanır.
2. Dosya `Service-Worker-Allowed` başlığıyla sunulur.

Hangisinin çalıştığı 2. aşamada denenir.

### 5.3. Sunucu uçları

| Uç | Ne yapar? |
|---|---|
| Gönder | Bir değişiklik grubunu alır. Her değişiklik için sonuç döner: yazıldı, çakıştı ya da reddedildi. |
| Çek | Bir planın son sıra numarasından sonraki değişikliklerini döner. Silinen kayıtlar da gelir. |
| Baştan indir | Bir planın bütün kayıtlarını döner. Rapor anlık görüntüleri gelmez. |
| Dosya yükle | Kanıt dosyasını parça parça alır. Sunucunun kaç bayt aldığını söyler. |

### 5.4. Gönder ucu nasıl yazar?

Bir grupta birden çok değişiklik gelir. Bir değişiklik reddedilse de ötekiler yazılabilmelidir. Frappe her isteği tek bir veritabanı işleminde çalıştırır. Bu yüzden her değişiklik ayrı bir ara kayıt noktasında yazılır. Frappe 16 ara kayıt noktasını destekliyor.

Her değişiklik şu sırayla işlenir:

1. Sunucu cihazın ve kullanıcının iptal edilip edilmediğine bakar.
2. Sunucu tekrar anahtarıyla bir İşlenen Değişiklik kaydı açmayı dener. Anahtar kaydın kimliğidir. Veritabanı aynı kimliği ikinci kez kabul etmez. Kayıt zaten varsa sunucu önceki sonucu döner ve durur.
3. Sunucu bir ara kayıt noktası koyar.
4. Sunucu kullanıcının izinlerine bakar.
5. Sunucu cevabı süreç tanımına göre denetler.
6. Sunucu kaydın değişiklik zamanını karşılaştırır. Kayıt bu arada değiştiyse "çakışma" döner.
7. Sunucu değişikliği yazar. Olaylar aynı işlemde çalışır.
8. Bir hata olursa sunucu ara kayıt noktasına döner. Değişikliğin sonucu "reddedildi" olur.
9. Sunucu sonucu İşlenen Değişiklik kaydına yazar.

Dört kural bu işi güvenli tutar:

1. Ara kayıt noktası içinde dosya yazılmaz. İşlem sonrasına bırakılan bir görev de eklenmez. Çünkü ara kayıt noktasına dönmek bunları geri almaz.
2. Gruplar küçük tutulur. Örneğin en çok 50 değişiklik.
3. Kayıtlar her zaman aynı sırayla kilitlenir. Böylece iki işlem birbirini beklemez.
4. Veritabanı iki işlemin birbirini beklediğini görürse bütün işlemi geri alır. O zaman sunucu bütün grubu yeniden dener. Tekrar anahtarı bu denemeyi güvenli yapar.

"Çakışma" sonucu alan bir değişiklik birleştirilip yeniden gönderilirse yeni bir tekrar anahtarı alır.

Bir karar, dayandığı değişikliklerden biri reddedildiyse kesinleşmez.

### 5.5. Değişiklik akışı

Tarayıcı "son aldığım yerden sonrasını ver" der. Bunun için her değişikliğin bir sıra numarası olmalıdır.

Sıra numarası iki yolla kaçabilir:

1. Frappe'nin değişiklik zamanı yazma anında verilir. Uzun süren bir işlem, sonra başlayan işlemden sonra bitebilir.
2. Veritabanının kendiliğinden artan sayacı da satır yazılınca verilir. İşlem bitince verilmez.

Bu yüzden sıra numarası işlemin sonunda verilir:

1. İşlem bitmeden hemen önce sunucu Akış Sayacı satırını kilitler.
2. Sunucu sayacı bir artırır.
3. Sunucu işlemdeki bütün akış satırlarına bu numarayı yazar.
4. İşlem biter ve kilit açılır.

Böylece numara sırası, işlemlerin bitiş sırasıyla aynı olur. İki işlemli bir test bunu sınar.

Akış satırları Frappe'nin kayıt olaylarından yazılır. Böylece Frappe ekranından, komut satırından ve veri yamasından yapılan yazmalar da akışa düşer.

Her planın ayrı bir sıra imleci vardır. Akış satırları en az 7 gün saklanır. Bu süre, 2 günlük baştan indirme süresinden uzundur.

### 5.6. Çakışma

Birleştirmenin birimi alandır. Satır listesi olan alanlarda birim satırdır. Bugünkü satırların zaten kalıcı kimliği var.

1. Tarayıcı her değişiklikle kaydın son gördüğü değişiklik zamanını gönderir.
2. Kayıt bu arada değiştiyse sunucu "çakışma" der ve güncel kaydı döner.
3. Tarayıcı üç kopyayı karşılaştırır: eski kopya, sunucunun kopyası ve tarayıcının kopyası.
4. Bir alanı yalnız bir taraf değiştirdiyse tarayıcı birleştirir.
5. İki kişi aynı listeye farklı satır eklediyse tarayıcı iki satırı da tutar.
6. İki taraf aynı alanı ya da aynı satırı değiştirdiyse tarayıcı çakışma ekranını açar. Kullanıcı seçer.
7. Bir taraf kaydı sildiyse ve öteki değiştirdiyse tarayıcı çakışma ekranını açar. Kullanıcı seçer.

Yazılım hiçbir değişikliği sessizce silmez.

### 5.7. Kararlar

1. Karar sahibi kararı internetsiz yazabilir. Karar "gönderilmeyi bekliyor" durumunda kalır.
2. Karar, o kapıda gördüğü son onaylı kararın kimliğini taşır.
3. Bağlantı gelince önce kararın dayandığı değişiklikler gider. Sonra karar taslak olarak gider.
4. Sunucu kapı kurallarını Python ile çalıştırır.
5. Kapının son onaylı kararı, kararın gördüğünden farklıysa sunucu "çakışma" der.
6. Kurallar geçerse sunucu kararı onaylar. Karar kesinleşir. Plan sürümünü sunucu artırır.
7. Kurallar geçmezse karar taslakta kalır. Ekran sunucunun nedenini gösterir.

Kalan deneme hakkı yalnız onaylanmış kararlardan sayılır.

Karar sahibi ve ikinci görüş veren kişi serbest metin olarak yazılmaz. Sunucu bu alanları oturumdaki kullanıcıdan alır. İkinci görüşü başka bir plan üyesi kendi hesabıyla kaydeder.

Üç iş internetsiz hiç yapılamaz: izin değişikliği, rol değişikliği ve eşitleme ayarı değişikliği.

### 5.8. Uzun kesinti

Eşitleme Ayarları'nda baştan indirme süresi 2 gündür.

1. Tarayıcı 2 günden kısa bağlantısız kaldıysa yalnız değişiklikler gönderilir ve alınır.
2. Tarayıcı 2 günden uzun bağlantısız kaldıysa önce bekleyen değişiklikler gönderilir.
3. Sonra plan sunucudan baştan iner.
4. Bekleyen ve çakışan değişiklikler baştan indirmede korunur. Yeni kopya bunları ezmez.
5. Çakışanlar kullanıcıya gösterilir.

### 5.9. Üyelik değişince

| Durum | Ne olur? |
|---|---|
| Kullanıcı bir plana yeni üye oldu | Tarayıcı o planı baştan indirir. |
| Kullanıcının üyeliği kaldırıldı | Tarayıcı o planın yerel verisini siler. Gönderilmemiş değişiklik varsa önce sunucuya gönderilir. Sunucu bu değişikliği incelemeye ayırır. |

### 5.10. Dosyalar

Frappe 16'nın parça parça yükleme özelliğini kullanmıyoruz. Kaynak kodda üç sorun gördüm:

1. Geçici dosyanın adı yalnız dosya adından gelir. Aynı adı yükleyen iki kişinin parçaları karışabilir.
2. Yanıtı kaybolan bir parça yeniden gönderilirse dosyaya ikinci kez eklenir.
3. Sunucuya "kaç bayt aldın?" diye soran bir uç yoktur.

Bu yüzden kendi yükleme ucumuzu yazarız. Uçta dört kural olur:

1. Her yüklemenin kendi kimliği olur.
2. Her kullanıcının geçici dosyası ayrıdır.
3. Uç, aldığı bayt sayısını söyler. Tarayıcı kaldığı yerden sürdürür.
4. Kanıt dosyaları her zaman özel dosya olarak saklanır. Giriş yapmadan açılamaz. Bu kuralı sunucu zorunlu kılar.

Dosya yüklenince Kanıt kaydına bağlanır. Dosya en son gönderilir. Böylece büyük bir dosya kararları geciktirmez.

## 6. Raporlar

1. Kullanıcı bir raporu sabitlemek ister.
2. Sunucu o anda planın anlık görüntüsünü kendi verisinden alır.
3. Sunucu anlık görüntünün özetini hesaplar ve saklar.
4. Tarayıcı rapor metnini bu anlık görüntüden üretir.
5. Kapı kararı onaylanınca da Rapor modülü bir anlık görüntü alır. Rapor modülü bunu "Karar onaylandı" olayını dinleyerek yapar.

Anlık görüntüyü tarayıcı göndermez. Böylece sabitlenmiş raporun dayanağı uydurulamaz.

## 7. Kurumlar

### 7.1. Her kuruma ayrı site

Her kurum kendi alt alan adında açılır. Örneğin `kurum-a.alanadi.com`. Her sitenin kendi veritabanı vardır.

Ön yüz her kurumun kendi sitesinden açılır. Bu seçimin üç faydası var:

1. Tarayıcı her adresin verisini ayrı tutar. Bir kurumun yerel verisi başka kurumun verisine karışmaz.
2. Ön yüz ile sunucu aynı adreste olur. Oturum bilgisi ek bir ayar gerektirmez.
3. Kullanıcı kurum seçmez. Adres kurumu belirler.

GitHub Pages'deki bugünkü sürüm tanıtım sürümü olarak kalır. Bu sürüm yalnız örnek planla çalışır. Sunucuya bağlanmaz.

### 7.2. Bugünkü planlar nasıl taşınır?

Bugünkü planlar GitHub Pages adresinin tarayıcı deposunda duruyor. Yeni ön yüz başka bir adreste açılacak. Tarayıcı bir adresin deposunu başka adrese okutmaz. Bu yüzden taşıma dosyayla yapılır:

1. Kullanıcı GitHub Pages sürümünde planını JSON dosyası olarak indirir. Bu düğme bugün de var.
2. Kullanıcı kurum sitesinde giriş yapar.
3. Kullanıcı dosyayı içe alır.
4. Yazılım her eski kimliğe yeni bir UUID verir. Kimliğe bağlı bütün alanları da günceller. Örneğin görevin bağlı olduğu karar.
5. Yazılım planı sunucuya ilk kez yükler. Planın sahibi giriş yapan kullanıcı olur.

## 8. Güvenlik

| Konu | Kural |
|---|---|
| Yerel şifreleme | Tarayıcı bir şifreleme anahtarı üretir. Anahtar dışa aktarılamaz. Anahtar ile veri aynı IndexedDB veritabanında durur. |
| Şifrelemenin sınırı | Bilgisayarı açık bulan kişi uygulamayı açıp veriyi görebilir. Bu sınırı karar sahibi kabul etti. |
| Anahtar kaybı | Şifre çözülemezse yazılım veriyi silmez. Kullanıcıya gösterir. Kurum yöneticisine haber verilir. |
| Oturum süresi | 7 gündür. Tek bir ayar yönetir: Frappe'nin oturum süresi. Tarayıcı bu süreyi sunucudan okur. Süre dolunca kullanıcı internet gelince yeniden giriş yapar. Bekleyen değişiklikler kaybolmaz. |
| Çıkış | Çıkışta yerel veri silinir. Gönderilmemiş değişiklik varsa uygulama önce uyarır. |
| Ortak bilgisayar | "Ortak cihaz" modunda veri tarayıcıda saklanmaz. Bu modda internetsiz çalışılamaz. |
| İptal edilen cihaz | Sunucu iptal edilen cihazın değişikliğini yazmaz. Değişiklik incelemeye ayrılır. Planın karar sahibi inceler. Cihaz bağlanınca sunucu "yerel veriyi sil" der. |
| Kimlik alanları | Karar sahibi, ikinci görüş ve inceleyen kişi oturumdaki kullanıcıdan alınır. Serbest metin değildir. |
| Kurumlar arası | Her kurumun ayrı sitesi, ayrı veritabanı ve tarayıcıda ayrı deposu vardır. |
| Sunucu denetimi | Sunucu her kuralı ve her izni yeniden denetler. Tarayıcıya güvenmez. |

## 9. Kurulum işleri

Bu işler yazılım işi değildir. Sunucu ve alan adı işidir. İş sırası şu kuralı izler: Hüseyin Cengiz teknik bilgiyi yazar. Asistan Hüseyin GoDaddy'de uygular. Hüseyin Cengiz sonucu doğrular.

| No | İş | Kim yapar? | Neye bağlıdır? | Ne olunca bitmiş sayılır? |
|---|---|---|---|---|
| 1 | Frappe 16 için gereken Python ve MariaDB sürümünü kurar. | Hüseyin Cengiz | Hiçbir şeye | Frappe 16 deneme sunucusunda açılıyor. |
| 2 | Alt alan adları için DNS kaydının türünü, adını ve değerini yazar. | Hüseyin Cengiz | 1. iş ve ana alan adı kararı | Kayıt bilgisi yazılı olarak Asistan Hüseyin'e verildi. |
| 3 | DNS kaydını GoDaddy'de açar. | Asistan Hüseyin | 2. iş | Kayıt GoDaddy'de görünüyor. |
| 4 | DNS kaydının doğru çalıştığını doğrular. | Hüseyin Cengiz | 3. iş | İki deneme alt adı sunucuya ulaşıyor. |
| 5 | TLS sertifikası için gereken DNS doğrulama kaydının bilgisini yazar. | Hüseyin Cengiz | 4. iş | Bilgi yazılı olarak Asistan Hüseyin'e verildi. |
| 6 | Doğrulama kaydını GoDaddy'de açar. | Asistan Hüseyin | 5. iş | Kayıt GoDaddy'de görünüyor. |
| 7 | Sertifikayı kurar ve doğrular. | Hüseyin Cengiz | 6. iş | Bir deneme alt adı güvenli bağlantıyla açılıyor. |
| 8 | Frappe'de alan adına göre site seçimini açar. | Hüseyin Cengiz | 7. iş | İki deneme sitesi iki farklı adreste açılıyor. |
| 9 | Kurum açma adımlarını yazar. | Hüseyin Cengiz | 8. iş | Yeni bir kurum yazılı adımlarla açılıyor. Süre ölçüldü. |
| 10 | Her site için yedek kurar. Yedek özel dosyaları ve sitenin şifreleme anahtarını da kapsar. | Hüseyin Cengiz | 8. iş | Bir sitenin yedeği başka bir sunucuya geri yüklendi ve açıldı. |
| 11 | İki ayrı kurulum hazırlar: deneme ve üretim. | Hüseyin Cengiz | 8. iş | Deneme kurulumunda bir ya da iki deneme sitesi var. |
| 12 | Yayın akışını kurar. Akış önce deneme kurulumuna, sonra üretime çıkar. Akış her yayından önce yedek alır. | Hüseyin Cengiz | 10. ve 11. iş | Bir güncelleme önce denemeye, sonra üretime çıktı. |
| 13 | Geri dönüş adımlarını yazar ve dener. | Hüseyin Cengiz | 12. iş | Bozuk bir güncelleme deneme kurulumunda geri alındı. |
| 14 | İzleme ve uyarı kurar. | Hüseyin Cengiz | 8. iş | Bir site kapanınca uyarı geliyor. |

Bir Frappe kurulumundaki bütün siteler aynı kodu kullanır. Bu yüzden bir güncelleme bütün sitelere aynı anda geçer. Deneme kurulumu bu riski azaltır.

TLS sertifikası en geç 90 günde bir yenilenir. Bütün alt adları kapsayan sertifika her yenilemede yeni bir DNS doğrulama kaydı ister. Bu yenilemenin nasıl yapılacağına siz karar verirsiniz. Seçenekler 12. bölümdedir.

## 10. Yapım sırası

Her aşama bir öncekine dayanır. Her aşamada önce başarısız olan test yazılır. Sonra kod yazılır.

| Aşama | İş | Ne olunca bitmiş sayılır? |
|---|---|---|
| 1 | Kural ağacı betiği, örnek dosyası ve Python kuralları | Python kuralları bütün örneklerde TypeScript ile aynı sonucu veriyor. |
| 2 | Frappe uygulama iskeleti, altı modül, iki bağ denetimi, olay listesi ve servis işçisi yolu | Bilerek yazılan yasak bir içe aktarma denetimi kırıyor. Servis işçisi kök yoldan açılıyor. |
| 3 | Kayıt türleri, roller, plan üyeliği izinleri ve yazmadan önce denetim noktası | Üye olmayan kullanıcı planı okuyamıyor. Okur rolü karar kaydedemiyor. Kilitli adım yazılamıyor. |
| 4 | Gönder ve çek uçları, tekrar tablosu, akış sayacı ve değişiklik akışı | Aynı değişiklik iki kez gönderilince bir kez yazılıyor. İki eşzamanlı işlemde hiçbir akış satırı kaçmıyor. Reddedilen bir değişiklik grubun öteki değişikliklerini geri almıyor. |
| 5 | Ön yüzde yerel depo ve dosyayla taşıma | Bugünkü bir plan dosyası kurum sitesine kayıpsız taşınıyor. Bütün kimlikler UUID oluyor. |
| 6 | Ön yüzde giden kutusu, gönderici ve durum çubuğu | İnternet kesilip gelince bütün değişiklikler sunucuya ulaşıyor. |
| 7 | Çakışma ekranı ve kararların sunucuda kesinleşmesi | Aynı alanı değiştiren iki kullanıcı çakışma ekranını görüyor. Kurala uymayan karar taslakta kalıyor. |
| 8 | Raporların sunucu anlık görüntüsüyle sabitlenmesi | Sabitlenmiş raporun dayanağı sunucunun verisiyle aynı. |
| 9 | Uzun kesinti, dosya yükleme, yerel şifreleme ve cihaz iptali | 2 günden uzun kesintide plan baştan iniyor. Kesilen dosya yüklemesi kaldığı yerden sürüyor. |
| 10 | Kötü bağlantı testleri | Testler yavaş, kopan ve veri kaybeden bir hatta da geçiyor. |
| 11 | Kurum açma ve yayın | İki gerçek kurum ayrı adreslerde çalışıyor. Birinin verisi ötekinde görünmüyor. |

## 11. Riskler

| Risk | Ne olabilir? | Önlem |
|---|---|---|
| Kurallar iki dilde ayrılır | Tarayıcı "İlerle" önerir, sunucu reddeder. | Ortak örnek dosyası. Yayın ancak iki taraf aynı sonucu verince yapılır. |
| Tarayıcı veriyi siler | Gönderilmemiş değişiklikler gider. | Kalıcı depo izni, ana ekran uygulaması, sık eşitleme ve bekleyen sayının görünmesi |
| Safari'de arka plan eşitlemesi yok | Sayfa kapalıyken veri gitmez. | Uygulama açılınca ve açık kaldıkça eşitleme |
| Eski uygulamalı tarayıcı | Eski biçimdeki değişiklik yeni sunucuya gider. | Sunucu değişikliği taşır ya da "uygulamayı güncelleyin" der. |
| Bütün siteler aynı kodu kullanır | Bozuk bir güncelleme bütün kurumları etkiler. | Deneme kurulumu, yayından önce yedek ve geri dönüş adımları |
| Modüller zamanla birbirine bağlanır | Gevşek bağ kaybolur. | İki bağ denetimi her kod gönderiminde çalışır. |
| Olay zinciri döngüye girer | Bir olay kendini yeniden tetikler. | Zincir derinliği sınırı |

## 12. Sizin karar vermeniz gerekenler

1. **Oturum süresi kaç gün olsun?** Bu soruyu cevapladınız. Cevabınız 7 gün oldu. Süre dolunca kullanıcı internet gelince yeniden giriş yapar.
2. **Ana alan adı ne olacak?** Kurumlar bu adın alt adlarında açılır. Bu karar 2. kurulum işinden önce gerekir.
3. **Arka yüz kodu ayrı bir depoda mı dursun?** Bu soruyu cevapladınız. Cevabınız "ayrı bir public depo" oldu. Deponun adı ve lisansı 1. aşamadan önce sizinle belirlenir. Lisansı siz seçersiniz.
4. **TLS sertifikası nasıl yenilensin?** İki seçenek var:
   - Asistan Hüseyin her yenilemede doğrulama kaydını GoDaddy'de elle açar. Bu iş en geç 90 günde bir tekrarlanır.
   - Yenileme otomatik yapılır. Bu seçenek bir zamanlanmış iş ve GoDaddy erişim anahtarı ister. Zamanlanmış iş için açık onayınız gerekir.

## 13. İlk sürümden bu yana ne değişti?

| İnceleyicinin bulgusu | Bu sürümde ne yaptım? |
|---|---|
| Akış sıra numarası uzun işlemlerde kaçıyordu. | Numara işlem sonunda, kilitli bir sayaçtan verilir. (5.5) |
| Karar, dayandığı değişiklikten önce gidebiliyordu. | Aynı planın değişiklikleri yazıldıkları sırayla gider. (5.1, 5.7) |
| Tek işlem ile kısmi yazma çelişiyordu. | Her değişiklik ayrı ara kayıt noktasında yazılır. (5.4) |
| Tekrar anahtarı tarayıcı verisi silinince tekrar edebiliyordu. | Anahtar rastgele UUID oldu ve kaydın kimliği oldu. (5.1, 5.4) |
| Bugünkü veri başka adrese taşınamıyordu. | Taşıma dosyayla yapılır. Kimlikler UUID'ye çevrilir. (7.2) |
| Frappe'nin parça parça yüklemesi güvenli değildi. | Kendi yükleme ucumuzu yazarız. Kanıt dosyaları her zaman özeldir. (5.10) |
| Plan ile Karar arasında gizli bağlar vardı. | Yazmadan önce denetim noktası, yeni olaylar ve zincir sınırı eklendi. (3.2, 3.3) |
| Kimlik alanları serbest metindi. | Sunucu bu alanları oturumdaki kullanıcıdan alır. (5.7, 8) |
| Taşınacak kural listesi eksikti. | Liste kural ağacından çıkarılır. Eksik altı kural eklendi. (4.2) |
| Saate bağlı kurallar iki dilde farklı sonuç verebiliyordu. | Örneklere "şimdi" zamanı eklendi. Saat karşılaştırması sıra numarasıyla yapılır. (4.3) |
| Python kurallarının tek sürümü vardı. | Süreç değişince bütün planlar taşınır. Örnekler sürüme göre ayrılır. (4.4) |
| Sabitlenmiş raporun dayanağına güvenilemiyordu. | Anlık görüntüyü sunucu alır. (6) |
| "İlk onaylanan geçerli" kuralı bugünkü modelle uyuşmuyordu. | Karar gördüğü son kararı taşır. Sürümü sunucu verir. (5.7) |
| Onaydan sonra değişen alanlar yazılmamıştı. | Alanlar listelendi. (2.4) |
| Bazı yazmalar akışa düşmüyordu. | Akış Frappe'nin kayıt olaylarından yazılır. Plan başına imleç var. (5.5, 5.9) |
| Liste alanlarında her ekleme çakışma sayılıyordu. | Birleştirmenin birimi satırdır. (5.6) |
| Sahte istek anahtarı ve iki oturum ayarı | Anahtar girişten sonra alınır. Tek oturum ayarı kaldı. (5.1, 8) |
| Kurum yöneticisi rolü yoktu. | Rol eklendi. (2.2) |
| GoDaddy işinden sonra doğrulama yoktu. Sertifika yenilemesi yazılmamıştı. | Doğrulama adımları ve yenileme kararı eklendi. (9, 12) |
| Yedek, geri dönüş ve izleme eksikti. | Dört kurulum işi eklendi. (9) |
| Üç modül olmazsa olmaz değildi. | Modül sayısı dokuzdan altıya indi. (2.3) |
| Servis işçisi `/assets/` yolunda çalışmazdı. | Kök yoldan sunulur. 2. aşamada denenir. (5.2) |
| Bugünkü verinin bazı alanları tabloda yoktu. | Her alanın yeri ya da "taşınmaz" kararı yazıldı. (2.5) |
| "Bütün kayıtlar UUID" cümlesi yanlıştı. | Kimlik kuralları tabloya döküldü. (2.4) |
| Dil sorunları vardı. | Terimler açıklandı. "İnternetsiz" sözü tek anlamda kullanıldı. |

## 14. Doğrulanması gerekenler

Bu konuları kaynak kodda okudum ya da önerdim. Çalışan bir sunucuda sınamadım.

1. Frappe 16'nın Python 3.14 istemesi kaynak koda dayanıyor. Hüseyin Cengiz resmî kurulum belgesiyle doğrulamalı.
2. Frappe'nin `hooks.py` dosyasına kendi olay listemizi eklemek 2. aşamada denenmeli.
3. `import-linter` aracının Frappe uygulamasının klasör yapısıyla çalıştığı 2. aşamada denenmeli.
4. Servis işçisinin kök yoldan sunulabildiği 2. aşamada denenmeli.
5. Tarayıcının şifreleme anahtarını IndexedDB'de saklayabildiği Chrome ve Safari'de denenmeli.
6. Akış sayacının iki eşzamanlı işlemde doğru çalıştığı 4. aşamada denenmeli.
7. Plan gerçek okurla denenmedi.
