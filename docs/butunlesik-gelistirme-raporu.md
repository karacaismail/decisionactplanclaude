# Bütünleşik geliştirme raporu: Frappe 16 arka yüzü, modüler monolit

Bu raporu Claude 15 Kasım 2026 Pazar günü hazırladı. Rapor bir tasarımdır. Hiçbir arka yüz kodu yazılmadı.

**Önemli not.** Bu rapor mobil uygulama ve SaaS dağıtımı hedeflerinden önce yazıldı. Bu hedeflere göre eleştirisi [elestiri-mobil-saas-dagitim.md](elestiri-mobil-saas-dagitim.md) dosyasındadır. Eleştirideki değişiklikler bu rapora henüz işlenmedi.

Raporun yeni parçalarını bağımsız bir inceleyici okudu. İnceleyici 12 sorun buldu. Bu sürüm 12 sorunun hepsini işler.

Bu rapor tek kaynaktır. Üç belgenin yerini alır:

1. Claude'un arka yüz planı. Dosya: [arka-yuz-plani.md](arka-yuz-plani.md). Bu plan bağımsız incelemeden geçti.
2. Codex'in arka yüz planı. Dosya: `decisionactplancodex-backend-plani.md`.
3. İnternetsiz çalışma araştırması. Dosya: [cevrimdisi-calisma-arastirmasi.md](cevrimdisi-calisma-arastirmasi.md). Araştırma bilgi kaynağı olarak kalır.

## Kısa cevap

Arka yüz tek bir Frappe 16 uygulaması olacak. Uygulama altı modüle bölünecek. Altısı da olmazsa olmazdır. Kurallar ayrı bir pakette duracak.

Codex dokuz modül öneriyor. Codex'in modülleri sürecin aşamalarını izliyor. Bizim modüllerimiz ise verinin kimin tarafından yazıldığını izliyor. İki planın ilkesi aynıdır: her kaydın tek bir yazarı olur. Bizim yazarlarımız daha az. Bu yüzden altı modül yeter. Ayrıntı 3. bölümdedir.

Codex'in planından dokuz fikri aldım. Örneğin kaynak izni ayrı bir karar oldu. Gerçekleşen ölçüm, hedeften ayrı bir kayıt oldu. Liste 2. bölümdedir.

Kurumlar ayrı sitelerde çalışacak. Tarayıcı her değişikliği önce kendi deposuna yazacak. Kararlar yalnız sunucuda kesinleşecek.

## 1. Verilen kararlar

Bu kararları karar sahibi 15 Kasım 2026 Pazar günü verdi.

| Konu | Karar |
|---|---|
| Arka yüz teknolojisi | Frappe 16 |
| Mimari | Modüler monolit, gevşek bağlı modüller |
| Modül kuralı | Bir modül ancak olmazsa olmaz ise eklenir. Kuşkuluysa eklenmez. |
| Kurum ayrımı | Her kuruma ayrı Frappe sitesi ve ayrı veritabanı |
| İnternetsiz çalışma | Evet. Tarayıcıda çalışma sürer. |
| Baştan indirme süresi | 2 gün |
| Yerel şifreleme | Tarayıcının sakladığı anahtar |
| Strateji yeniden açılınca | Uygulama sürer. Kaynak izinleri geri çekilmez. |
| Karar internetsiz | Yalnız taslak olur. Sunucuda kesinleşir. |
| Çakışma | Aynı alan çakışırsa kullanıcı seçer. |
| iPhone | Kullanıcıdan uygulamayı ana ekrana eklemesi istenir. |
| Oturum süresi | 7 gün |
| Arka yüz deposu | Ayrı bir public depo |
| SSL sertifikası | Kendiliğinden yenilenir. İşi Hüseyin Cengiz kurar. |
| Uygulama planı adımları | 3.1, 3.2 ve 3.3 hiçbir kapı kararını eskitmez. |

### Terimler

| Terim | Anlamı |
|---|---|
| Modüler monolit | Tek bir uygulama olarak yayına çıkar. İçi ayrı modüllere bölünür. |
| Gevşek bağ | Bir modül ötekinin tablosunu okumaz. Yalnız onun açık işlevlerini çağırır ya da yaydığı olayı dinler. |
| DocType | Frappe'de bir kayıt türü. Frappe her kayıt türü için bir tablo açar. |
| Alt tablo | Bir kaydın içindeki satır listesi. Örneğin bir kanıtın bağlı olduğu adımlar. |
| Komut | Bir şeyi değiştirme isteği. Örneğin "kararı onayla". |
| Sorgu | Bir şeyi okuma isteği. Örneğin "bu planın kanıtlarını ver". |
| Olay | Tamamlanmış bir işin haberi. Örneğin "adım değişti". |
| UUID | Her cihazın kendi başına üretebildiği, tekrar etmeyen uzun bir kimlik |
| Uç | Sunucunun dışarıya açtığı bir işlev. Tarayıcı bu işlevi internet üzerinden çağırır. |
| Giden kutusu | Tarayıcıda, sunucuya henüz gitmemiş değişikliklerin listesi |
| Tekrar anahtarı | Her değişikliğe verilen tek kimlik. Sunucu aynı değişikliği ikinci kez yazmaz. |
| Ara kayıt noktası | Veritabanı işleminin ortasında konan bir işaret. Hata olursa yalnız bu işaretten sonrası geri alınır. |
| Anlık görüntü | Planın belirli bir andaki tam kopyası |

Bu raporda "internetsiz" sözü tek anlamda kullanılır. Bu söz, cihazın sunucuya ulaşamadığını anlatır.

## 2. Codex'in planından ne aldık?

### 2.1. Alınan fikirler

| No | Codex'in fikri | Neden değerli? | Bu raporda nerede? |
|---|---|---|---|
| 1 | Seçim harcama yetkisi vermez. Kaynak izni ayrı bir karardır. | Karar sahibi bir yolu seçse bile para henüz açılmamıştır. Para ayrı bir onayla açılır. | Kaynak İzni kaydı (5.3) |
| 2 | Hedef ile gerçekleşen ayrı kayıtlardır. | Ekip hedefi 5 dakika koyar. Gerçek sonuç 8 dakika çıkar. Hedef değişmeden kalır. | Gösterge Ölçümü kaydı (5.2). Şimdilik yalnız 3.1 göstergelerinde. |
| 3 | Karar, dayandığı kanıtın sürümünü saklar. | Kanıt sonradan düzeltilirse hangi kararın eski kanıta dayandığı bulunur. | Karar Dayanağı alt tablosu (5.3) |
| 4 | Ekranda iki ayrı durum görünür: "Cihaza kaydedildi" ve "Kurumda kaydedildi". | Kullanıcı verinin nerede olduğunu bilir. | 8.1 |
| 5 | Toplama, inceleme ve onay ayrı işlerdir. Metin ile ekin gönderim durumu da ayrıdır. | Bir gözlemin sunucuya ulaşması onay sayılmaz. Not ulaşmışken fotoğraf bekleyebilir. | 8.1 ve 8.6 |
| 6 | İlk iş, uçtan uca ince bir akıştır: geçiş kararından ilk gerçek sonuca kadar. | Bütün parçalar erken bir arada denenir. Sorun geç çıkmaz. | 12. bölüm |
| 7 | Raporun cevaplaması gereken üç soru var: Neyi seçtik? Gerçekte ne oldu? Şimdi neyi değiştireceğiz? | Yönetici tek sayfada sonucu görür. | 10. bölüm |
| 8 | Kanıtın kaynağı düzenli incelenir. | Eski bir kaynağa dayanan karar fark edilir. | Kanıt kaydı (5.2) |
| 9 | Sapmanın nedeni karar türünü belirler. Teslim aksadıysa plan düzeltilir. Dayanak çöktüyse strateji yeniden açılır. | Kötü bir sonuç her zaman yolun yanlış olduğu anlamına gelmez. | Strateji Gözden Geçirme (5.3) |

Codex'in birkaç küçük fikrini de aldım:

- Olayın gerçek zamanı ile sunucuya ulaşma zamanı ayrı saklanır.
- Aynı tekrar anahtarı farklı içerikle gelirse sunucu reddeder.
- Gönderilmemiş bir taslağın düzeltmeleri tek değişiklikte birleşir. Gönderim başlayınca değişiklik sabitlenir.
- Kullanıcı internetsiz kullanacağı planları önceden seçer. Ekran "İnternetsiz kullanıma hazır" der.
- Bir planın izni kalkarsa yalnız o planın yerel kopyası silinir. Öteki planlar açık kalır.

### 2.2. Alınmayan fikirler

| Codex'in fikri | Neden almadım? |
|---|---|
| Sürecin aşamalarına göre dokuz modül | 3.3 bölümünde ayrıntılı gerekçe var. Kısaca: adım cevapları tek bir kayıt türündedir. Beş aşama modülü aynı tabloyu paylaşmak zorunda kalırdı. |
| Raporların arka planda hazırlanması | Bizde rapor metnini tarayıcı üretir. Sunucu yalnız anlık görüntüyü alır. Anlık görüntü hızlıdır. Arka plan işi şimdilik gerekmez. |
| Yol yeniden seçilince eski kaynak izninin geri çekilmesi | Karar sahibi 15 Kasım 2026 Pazar günü bu fikri seçmedi. Uygulama eski seçimle sürer. Karar sahibi bir izni isterse kendisi geri çeker. |
| Mevcut SQLite sunucusundan aktarım | Bu, Codex'in uygulamasına özgüdür. Bizim uygulamamızın sunucusu yok. Gerekirse Codex'in aktarım adımları ayrıca kullanılır. |

## 3. Modüller

### 3.1. Altı kesin modül

Modül sayısı ilk taslakta dokuzdu. Bağımsız inceleme üçünün olmazsa olmaz olmadığını gösterdi. Kalan altı modülün her biri, verinin bir yazarıdır.

| No | Modül | Neyin sahibidir? | Modül olmasa ne bozulur? |
|---|---|---|---|
| 1 | Erişim | Kurum yöneticileri, plan üyelikleri, plan rolleri ve cihazlar | "Stratej önerir, karar sahibi seçer" kuralı denetlenemez. Cihaz iptal edilemez. |
| 2 | Plan | Plan, adım cevapları, görevler, kanıtlar ve gerçekleşen ölçümler | Kullanıcının yazdıkları saklanamaz. |
| 3 | Karar | Kapı kararları, geçiş kararı, strateji onayı, gözden geçirme, kaynak izinleri, sınır değişiklikleri, kilitler ve eskime | Kararlar kesinleşemez. Para açılamaz. Süreç sırası korunamaz. |
| 4 | Rapor | Sabitlenmiş rapor sürümleri ve anlık görüntüler | Stratej'e verilen devir raporu sonradan değişebilir. |
| 5 | Denetim kaydı | Kimin neyi ne zaman yaptığının silinmez listesi | Bir karar sonradan tartışılırsa kanıt kalmaz. |
| 6 | Eşitleme | Gelen değişiklikler, tekrar anahtarları, değişiklik akışı, dosya yüklemeleri ve eşitleme ayarları | İnternetsiz çalışma olmaz. Aynı değişiklik iki kez yazılabilir. |

**Kurallar paketi** bir modül değildir. Tablosu yoktur. İçinde süreç tanımının JSON dosyası ve Python kuralları durur.

Frappe'nin kendi kullanıcı, rol, oturum ve dosya kayıtları kullanılır. Bunları yeniden yazmayız.

### 3.2. İsteğe bağlı parçalar

Bu parçalar bugün olmazsa olmaz değildir. İhtiyaç doğarsa eklenir. Hiçbiri yeni bir modül gerektirmez.

| Parça | Ne zaman eklenir? | Nereye eklenir? |
|---|---|---|
| Rapor sürüm incelemesi | Bir yönetici, rapor sürümünü resmî olarak incelemek isterse | Rapor modülüne bir kayıt türü |
| Dayanağa göre eskime | Bugün kararlar süreç sırasına göre eskir. İstenirse yalnız okuduğu veri değişen karar eskir. | Karar modülü ve kurallar paketi. TypeScript ile aynı anda değişir. |
| Arka plan işleri için bildirim kutusu | Ağır bir iş çıkarsa. Örneğin PDF üretimi ya da e-posta. | Eşitleme modülü |
| Davet | Kurum yöneticisi kullanıcıları davetle eklemek isterse | Frappe'nin kendi davet özelliği |
| Bildirim | Bir kural bildirime dayanırsa | Ayrı modül. Bugün gerek yok. |

### 3.3. Codex'in dokuz modülü bizde nereye düşüyor?

| Codex'in modülü | Bizdeki karşılığı |
|---|---|
| 1. Kurum ve erişim | Erişim modülü |
| 2. Strateji dosyası | Plan modülü. Karar sahibi ataması Erişim modülünde, plan üyeliğinin geçmişi olarak durur. |
| 3. Kanıt ve dayanaklar | Kanıt, Plan modülünde. Kararın dayandığı kanıt sürümü, Karar modülünde. |
| 4. Hazırlık ve geçiş | Adım cevapları Plan modülünde. Geçiş Kararı, Karar modülünde. |
| 5. Stratejik seçim | 2.1 ile 2.5 arası cevaplar Plan modülünde. Strateji Onayı, Karar modülünde. |
| 6. Eylem planı ve kaynak | 3.1, 3.2 ve 3.3 cevapları Plan modülünde. Kaynak İzni, Karar modülünde. |
| 7. Uygulama ve gözlem | Adım 21 ile 34 arası ve Gösterge Ölçümü, Plan modülünde |
| 8. Değerlendirme ve yeniden karar | Strateji Gözden Geçirme ve Kapı 6, 7, 8 kararları, Karar modülünde |
| 9. Raporlar ve sürüm incelemesi | Rapor modülü |

Codex'in aşamaları kaybolmadı. Aşamalar ekranda üç ana küme ve alt aşamalar olarak duruyor. Kaynak: `src/data/clusters.ts`.

Neden aşamalara göre modül kurmadık? Üç neden var:

1. **Adım cevapları tek bir kayıt türündedir.** Uygulamada 42 adım var. Bütün adımlar aynı tanım dilinden çizilir. Aşama modülleri aynı tabloyu bölüşmek zorunda kalırdı. Bir tablonun tek sahibi olmalıdır.
2. **Kararlar aynı kural motorunu kullanır.** Kapı 1'den Kapı 8'e kadar bütün kararlar aynı öneri, kilit ve eskime kurallarına bağlıdır. Bu kuralları beş modüle bölmek kopya üretirdi.
3. **Codex'in kendi ilkesi de yazara bakar.** Codex'e göre modüller, veriyi kimin değiştirebildiğini belirler. Bizde iki yazar var. Biri cevabı yazar, öteki kararı verir. Bu yüzden Plan ve Karar ayrı modüllerdir.

Bir gün bir aşama kendine özgü kayıtlar biriktirirse o aşama ayrı modül olur. Örneğin uygulama aşamasındaki saha ölçümleri çok büyüyebilir.

### 3.4. Roller

| Rol | Düzey | Ne yapabilir? |
|---|---|---|
| Kurum yöneticisi | Kurum | Kullanıcı ekler. Cihaz iptal eder. Eşitleme ayarlarını değiştirir. |
| Karar sahibi | Plan | Plan üyesi ekler. Karar kaydeder. Kaynak izni açar ve kapatır. Strateji belgesini onaylar. İncelemeye ayrılan değişiklikleri inceler. |
| Stratej | Plan | Yol önerir. Strateji adımlarını yazar. Karar kaydedemez. |
| Ekip üyesi | Plan | Adım cevaplarını, kanıtları ve ölçümleri yazar. İkinci görüş verebilir. |
| Danışman | Plan | Yalnız okur ve ikinci görüş verir. Tek kurucunun ikinci görüş alabilmesi için gerekir. |
| Okur | Plan | Yalnız okur. |

Bir kişi birden çok role sahip olabilir. Tek kurucuda karar sahibi ile stratej aynı kişi olabilir. Bir kişi bir planda karar sahibi, başka bir planda ekip üyesi olabilir.

**İkinci görüş kuralı değişiyor.** Bugün ikinci görüş veren kişinin adı serbest metindir. Sunucuda ikinci görüşü başka bir plan üyesi kendi hesabıyla verir. Tek kurucunun başka üyesi yoksa ikinci görüş alamaz. Bu durumda "İlerle" önerisinin dışına çıkamaz ve sınır artıramaz. Bu yüzden tek kurucu plana bir danışman ekler. Bu davranış değişikliği sizin kararınızı bekliyor. Soru 14. bölümdedir.

## 4. Modüller arası ilişki ve iletişim

### 4.1. Üç iletişim yolu

| Yol | Ne zaman kullanılır? | Nasıl çalışır? |
|---|---|---|
| Sorgu | Bir modül başka modülün verisini okumak isterse | Sahibi olan modülün `api.py` dosyasındaki okuma işlevi çağrılır. İşlev izni denetler. Örneğin "bu iş için geçerli bir kaynak izni var mı?" sorusunu yalnız Karar modülü cevaplar. Öteki modül bütçeyi kendisi hesaplamaz. |
| Komut | Bir modül başka modülün verisini değiştirmek isterse | Sahibi olan modülün `api.py` dosyasındaki komut işlevi çağrılır. Veriyi yalnız sahibi yazar. |
| Olay | Bir iş tamamlanınca başka modüllerin haberi olmalıysa | Modül olayı yayar. Dinleyiciler aynı veritabanı işleminde çalışır. Yayan modül dinleyicinin adını bilmez. |

Bunlara iki yardımcı yapı eklenir:

1. **Yazmadan önce denetim noktası.** Plan modülü bir adımı yazmadan önce bu noktadaki denetimleri çalıştırır. Karar modülü kilit kuralını bu noktaya kaydeder. Böylece Plan, Karar'ı tanımadan kilidi uygular.
2. **İş akışları katmanı.** Birden çok modülü aynı işlemde değiştiren komutlar burada durur. Örneğin "kararı onayla" ya da eşitlemenin "gönder" ucu. İş akışı modüllerin komutlarını sırayla çağırır. Modüller birbirini çağırmaz.

### 4.2. Kim kimi çağırabilir?

| Modül | Sorgu ve komutla çağırabildiği modüller | Dinlediği olaylar |
|---|---|---|
| Erişim | Hiçbiri | Hiçbiri |
| Plan | Erişim. Karar yalnız sorgu ile, bir bağın varlığını denetlemek için. | Hiçbiri |
| Karar | Erişim. Plan yalnız sorgu ile. | Adım değişti, Adım atlandı, Profil değişti, Sınır değişti, Kanıt değişti, Kanıt geri çekildi |
| Rapor | Erişim, Plan, Karar | Karar onaylandı |
| Denetim kaydı | Hiçbiri | Bütün olaylar |
| Eşitleme | Hiçbiri. Eşitleme yalnız iş akışları katmanını çağırır. | Bütün kayıt olayları |
| İş akışları katmanı | Erişim, Plan, Karar, Rapor. Komutlar yalnız buradan birden çok modüle gider. | Hiçbiri |

Kurallar paketini bütün modüller kullanabilir. Kurallar paketi hiçbir modülü çağırmaz.

### 4.3. Olaylar

| Olay | Yayan modül | Dinleyen modüller | Dinleyici ne yapar? |
|---|---|---|---|
| Adım değişti | Plan | Karar, Denetim kaydı, Eşitleme | Karar bağlı kararları eskitir. Denetim kaydı yazar. Eşitleme akışa satır ekler. |
| Adım atlandı | Plan | Karar, Denetim kaydı, Eşitleme | Aynı |
| Profil değişti | Plan | Karar, Denetim kaydı, Eşitleme | Karar bütün kapı kararlarını ve geçiş kararını eskitir. |
| Sınır değişti | Plan | Karar, Denetim kaydı, Eşitleme | Karar bütün kapı kararlarını ve geçiş kararını eskitir. Sınır değişikliği kaydını açar. Artışta ikinci görüş ister. |
| Kanıt değişti | Plan | Karar, Denetim kaydı, Eşitleme | Karar, bu kanıta dayanan kararları işaretler. |
| Kanıt geri çekildi | Plan | Karar, Denetim kaydı, Eşitleme | Karar bağlı kararları eskitir. Kanıt silinmez, "geri çekildi" durumuna geçer. |
| Ölçüm eklendi | Plan | Denetim kaydı, Eşitleme | Hiçbir kapı bu ölçümü okumaz. Bu yüzden Karar dinlemez. |
| Karar onaylandı | Karar | Rapor, Denetim kaydı, Eşitleme | Rapor anlık görüntü alır. |
| Strateji yeniden açıldı | Karar | Denetim kaydı, Eşitleme | Strateji onayı Karar modülünün içinde, aynı işlemde geçersiz olur. Kaynak izinleri açık kalır. Strateji belgesini taslağa döndürme komutu ise iş akışından Plan'a gider. |
| Cihaz iptal edildi | Erişim | Denetim kaydı, Eşitleme | Eşitleme cihazın değişikliklerini incelemeye ayırır. |

Olaylar aynı işlemde çalışır. Bunun bir bedeli var. Dinleyici hata verirse olayı yayan modülün yazması da geri alınır. Bu bağ bilerek seçildi. Çünkü cevap ile kararın birbirini tutması gerekir.

Olaylar bir zincir kurabilir. Örneğin "Yeniden aç" kararı strateji belgesini taslağa döndürür. Bu yazma "Adım değişti" olayını yayar. Bu yüzden her olay, zincirde kaçıncı olduğunu taşır. Zincir belirli bir derinliği aşarsa işlem durur ve hata verir.

### 4.4. Kurallar kodla denetlenir

1. **İçe aktarma denetimi.** `import-linter` adlı araç Python içe aktarmalarını denetler. Örneğin Plan modülü Karar modülünü içe aktarırsa denetim kırılır.
2. **Tablo adı denetimi.** Küçük bir betik her modülün kodunu tarar. Bir modül başka bir modülün kayıt türünün adını kullanırsa denetim kırılır.
3. **Okunan girdi denetimi.** Her kapı hangi adımları okuduğunu bildirir. Bir test, gerçekten okunan adımları bu listeyle karşılaştırır. Örneğin bir kapı 3.1 adımını okumaya başlarsa test kırılır.

Üç denetim de her kod gönderiminde çalışır. Biri kırılırsa yayın yapılmaz.

## 5. DocType'lar

### 5.1. Erişim modülü

| DocType | Tür | Önemli alanlar | Not |
|---|---|---|---|
| Plan Üyeliği | Normal | plan, kullanıcı, rol, başlangıç, bitiş, etkin | Bir kişinin bir plandaki rolü. Bitiş tarihli eski satırlar rol geçmişini tutar. Böylece karar sahibi atamasının geçmişi de burada durur. |
| Cihaz | Normal | kullanıcı, ad, son eşitleme, iptal, iptal eden, sil komutu | İptal edilen cihaza bağlanınca "yerel veriyi sil" komutu gider. |

"Kurum yöneticisi" Frappe'nin kendi rolüdür. Ayrı bir kayıt türü gerekmez.

### 5.2. Plan modülü

| DocType | Tür | Önemli alanlar | Not |
|---|---|---|---|
| Plan | Normal | ad, profil, sınırlar, kısa yol, giriş türü, para birimi, devralma cevapları, süreç sürümü, biçim sürümü, plan sürümü, eski sürüm işareti | Plan sürümünü sunucu artırır. Profil, sınırlar ve devralma cevapları JSON alanıdır. Süreç tanımı bu alanların biçimini denetler. |
| Adım Kaydı | Normal | plan, adım, cevaplar, durum, atlama nedeni | Her plan ve adım için tek satır. Cevaplar JSON alanıdır. |
| Görev | Normal | plan, iş, sorumlu, tarih, durum, bağlı karar | Bağlı kararın kimliği düz metin olarak saklanır. 4.5 bölümüne bakın. |
| Kanıt | Normal | plan, başlık, tür, basamak, tarih, kaynak, karşı bulgu, dosya, kanıt sürümü, dosya durumu, geri çekildi, kaynağın son incelemesi, inceleyen | Dosya her zaman özel dosyadır. Her düzeltmede kanıt sürümü bir artar. Kanıt silinmez, geri çekilir. Kaynak uzun süre incelenmezse ekran uyarır. |
| Kanıt Bağı | Alt tablo, Kanıt'ın içinde | adım | Kanıtın bağlı olduğu adımlar |
| Gösterge Ölçümü | Normal, yalnız eklenir | plan, gösterge, değer, birim, olay zamanı, ulaşma zamanı, kaynak kanıt, giren kişi | 3.1 adımındaki göstergenin gerçekleşen değeri. Hedef 3.1 adımında kalır. Kayıt düzeltilmez. Yanlış ölçüm yeni bir ölçümle düzeltilir. |

Gösterge Ölçümü yalnız eklenir. Bu sayede iki kişi internetsiz ölçüm girse bile çakışma olmaz. İki ölçüm de kalır.

**Gösterge Ölçümü'nün sınırı.** Bu kayıt yalnız 3.1 adımındaki göstergeleri izler. Kapı 6'nın ölçüleri bugün Adım 22'de durur. Kapı 6 bu ölçüleri okumaya devam eder. Codex'in 2. fikri, yani hedef ile gerçekleşenin ayrılması, bu yüzden şimdilik Kapı 6'ya uygulanmaz. İki ölçüm yerinin birleşmesi ayrı bir iştir. Birleşirse yeni kayıt kapıların okuduğu girdilere, eskime kuralına ve olay tablosuna eklenir.

### 5.3. Karar modülü

| DocType | Tür | Önemli alanlar | Not |
|---|---|---|---|
| Kapı Kararı | Onaylanan | plan, kapı, öneri, seçim, gerekçe, karşı görüş, karar sahibi, ikinci görüş veren, kalan deneme, yeniden açılma koşulu, görülen son karar, eskime işareti | Karar sahibi ve ikinci görüş veren Frappe kullanıcısıdır. Sunucu bu alanları oturumdan alır. |
| Geçiş Kararı | Onaylanan | plan, sonuç, öneri, gerekçe, karar sahibi, ikinci okuyucu, koşulun konusu, açık soru, sorumlu, son tarih, ölçüt sayıları, eskime işareti | Strateji oluşturmayı açar. |
| Strateji Onayı | Onaylanan | plan, onaylayan, kalite maddeleri, geçersiz, geçersiz kılan gözden geçirme, eskime işareti | Strateji belgesini kesinleştirir. Bugün bu onay Adım 20'deki bir alandır. Sunucuda ayrı bir karar olur. Onay iptal edilmez, geçersiz kılınır. |
| Strateji Gözden Geçirme | Onaylanan | plan, seçim hâlâ doğru mu, sapmanın nedeni, karar, gerekçe, dayanak, geçersiz kılınan onay, karar sahibi, eskime işareti | "Yeniden aç" kararı strateji onayını aynı işlemde geçersiz kılar. |
| Kaynak İzni | Onaylanan | plan, tür, kapsam, tutar, kişi ve süre, bitiş, sorumlu, kapanış kanıtı, durum, kapanış zamanı, kapanış nedeni, kapı kararı, strateji onayı, 3.3 satırının kimliği, eskime işareti | İki tür var. Koşullu izin bir kapı kararına bağlıdır. Kaynak ayırma izni bir strateji onayına ve 3.3 adımının bir satırına bağlıdır. Hangi bağın zorunlu olduğunu tür belirler. |
| Sınır Değişikliği | Onaylanan | plan, alan, eski değer, yeni değer, artış mı, değiştiren, inceleyen, inceleme zamanı | Artışta ikinci görüş gerekir. İnceleyen kişi değişikliği yapan kişi olamaz. |
| Karar Dayanağı | Alt tablo, her karar türünün içinde | dayanak türü, kimlik, sürüm | Kararın okuduğu adımlar ve kanıt sürümleri. Codex'in 3. fikridir. |

"Onaylanan" türü Frappe'nin onay yapısıdır. Bu yapıda her kayıt "taslak", "onaylandı" ya da "iptal" durumundadır. Onaydan sonra yalnız şu alanlar değişebilir:

| DocType | Onaydan sonra değişebilen alan |
|---|---|
| Kapı Kararı | Eskime işareti |
| Geçiş Kararı | Eskime işareti |
| Strateji Onayı | Geçersiz, geçersiz kılan gözden geçirme, eskime işareti |
| Strateji Gözden Geçirme | Eskime işareti |
| Kaynak İzni | Durum, kapanış zamanı, kapanış nedeni, eskime işareti |
| Sınır Değişikliği | İnceleyen, inceleme zamanı |

Bu alanlar Frappe'nin olaylarını atlayan kısa yazma yoluyla yazılmaz. Böylece her değişiklik akışa ve denetim kaydına düşer.

Strateji Gözden Geçirme'deki "sapmanın nedeni" alanı üç seçenek taşır:

| Neden | Ekranın önerdiği karar |
|---|---|
| Teslim aksadı | Düzelt. Plan ve işler güncellenir. |
| Dayanak çöktü | Yeniden aç. Strateji oluşturmaya dönülür. |
| Bilinmiyor | Sürdür ve ölç. Bir sonraki gözden geçirmenin tarihi yazılır. |

Öneri kararı vermez. Kararı karar sahibi verir.

Kaynak İzni'nin iki ayrı kapanış durumu vardır:

| Durum | Anlamı | Kapıya etkisi |
|---|---|---|
| Kanıtla kapandı | İzin verilen iş yapıldı. Kapanış kanıtı geldi. | Koşullu izin kapanınca kapı geçmiş sayılır. Bugünkü kural budur. |
| Geri çekildi | Karar sahibi izni kendisi geri aldı. | Geri çekilen koşullu izin kapıyı geçirmez. Kapı "Beklet" sayılır. |

**Bütçe sayımı.** Serbest bütçe, harcama sınırından üç tutar düşülerek hesaplanır. Bunlar harcanan tutar, açık koşullu izinler ve açık kaynak ayırma izinleridir. 3.3 adımının bir satırı izne dönüşünce bütçeden düşülür. İzne dönüşmeyen satır düşülmez. Böylece aynı para iki kez sayılmaz. Geri çekilen iznin harcanmamış kısmı serbest bütçeye döner.

**Yazılımın sınırı.** Uygulamada harcama kaydı yok. Harcanan tutarı kullanıcı Adım 16'da elle yazar. Bu yüzden yazılım gerçek harcamayı durduramaz. Yazılım yalnız yeni izin verilmesini ve geri çekilen izne iş bağlanmasını engeller.

### 5.4. Rapor, Denetim kaydı ve Eşitleme modülleri

| Modül | DocType | Tür | Önemli alanlar | Not |
|---|---|---|---|---|
| Rapor | Rapor Sürümü | Normal | plan, rapor türü, sürüm, anlık görüntü, anlık görüntünün özeti, sabitleyen, sabitleme zamanı, kaynak karar | Anlık görüntüyü sunucu kendi verisinden alır. |
| Denetim kaydı | Olay Kaydı | Normal, yalnız eklenir | olay türü, kayıt türü, kayıt, plan, kullanıcı, cihaz, olay zamanı, ulaşma zamanı, özet | Hiç kimse düzeltemez ve silemez. |
| Eşitleme | İşlenen Değişiklik | Normal | tekrar anahtarı (kaydın kimliği), cihaz, kullanıcı, plan, içerik özeti, sonuç, ayrıntı | Aynı anahtar farklı içerikle gelirse sunucu reddeder. |
| Eşitleme | Değişiklik Akışı | Normal | sıra numarası, plan, kayıt türü, kayıt, işlem türü, zaman | Tarayıcı bu akıştan çeker. |
| Eşitleme | Akış Sayacı | Tek kayıt | son sıra numarası | 8.4 bölümüne bakın. |
| Eşitleme | Yükleme Oturumu | Normal | yükleme kimliği, kullanıcı, kanıt, toplam bayt, alınan bayt, özet, durum | Kesilen yükleme kaldığı yerden sürer. |
| Eşitleme | Eşitleme Ayarları | Tek kayıt | baştan indirme süresi, akış saklama süresi | Varsayılanlar 2 gün ve 7 gün. |

### 5.5. Kimlik kuralları

| Kayıt | Kimliği |
|---|---|
| Plan, adım kaydı, görev, kanıt, ölçüm, bütün kararlar, rapor sürümü, plan üyeliği, cihaz | UUID. Tarayıcı kimliği kendisi seçer. Bu tür kimlik sütunu Frappe 16'da var. |
| İşlenen Değişiklik | Tekrar anahtarının kendisi |
| Değişiklik Akışı | Sıra numarası |
| Olay Kaydı, Yükleme Oturumu | UUID. Kimliği sunucu verir. |
| Akış Sayacı, Eşitleme Ayarları | Tek kayıt. Kimliği yoktur. |

## 6. DocType'lar arası ilişki ve iletişim

### 6.1. İlişki kuralları

| Durum | Nasıl bağlanır? | Örnek |
|---|---|---|
| Her kayıt bir plana bağlıdır | Plan'a bağlantı alanı (Link). Bütün modüller bu bağı kullanabilir. | Kapı Kararı'nın planı |
| Aynı modülde, bir kayıt ötekine bağlı | Bağlantı alanı (Link) | Kaynak İzni'nin strateji onayı |
| Aynı modülde, bir kayıt ötekinin parçası | Alt tablo | Kanıt Bağı, Kanıt'ın içinde durur. |
| Farklı modüller arasında, Plan dışındaki kayıtlara | Kimlik düz metin olarak saklanır. Kayıt, sahibi olan modülün okuma işleviyle okunur. | Görev'in bağlı kararı. Rapor Sürümü'nün kaynak kararı. |
| Teknik kayıtlar, her türlü kayda | Kayıt türü ve kimlik iki düz metin alanında saklanır. | Olay Kaydı, Değişiklik Akışı |
| Kullanıcıya bağlanma | Frappe'nin kullanıcı kaydına bağlantı alanı | Kararın karar sahibi |

**Plan neden istisnadır?** Plan bütün kayıtların köküdür. Plan'a bağlantı alanı üç şey kazandırır:

1. Frappe'nin kullanıcı izinleri yalnız bağlantı alanında çalışır.
2. Frappe, bağlı kaydı olan bir planın silinmesini engeller. Planlar zaten silinmez, arşivlenir.
3. Frappe'nin rapor oluşturucusu ve "Bağlantılar" paneli plana bağlanabilir.

**Öteki modüller arası bağlar neden düz metindir?** Frappe bağlantı alanını kaydederken öteki modülün tablosunu okur. Bu, modüller arasında gizli bir bağ kurar. Frappe ayrıca bağlı kaydın silinmesini ve iptalini engeller. Örneğin onaylı bir karara bağlı görev, kararın iptalini engellerdi.

**Teknik kayıtlar neden değişken bağlantı alanı kullanmaz?** Frappe değişken bağlantı alanını da kaydederken okur. Daha önemlisi, Frappe silmeden önce bu alanları tarar. Olay Kaydı'nda değişken bağlantı alanı olsaydı kanıt silinemezdi. Çünkü silme işlemi kendi olay kaydını yazar ve o kayıt silmeyi engellerdi. Bu yüzden kayıt türü ve kimlik düz metindir. Bu davranış için bir regresyon testi yazılır.

**Bu kuralın bedeli.** Veritabanı, düz metin bağların doğru olduğunu kendisi denetlemez. Bu denetimi her komut işlevi yapar. Örneğin Plan modülü bir görevi kararla bağlarken kararın var olduğunu Karar modülüne sorar.

### 6.2. İlişki haritası

Aşağıdaki liste her kaydın neye bağlı olduğunu gösterir. Ok yerine "bağlıdır" sözünü kullandım.

**Erişim modülü:**

- Plan Üyeliği bir plana bağlıdır.
- Plan Üyeliği bir kullanıcıya bağlıdır.
- Cihaz bir kullanıcıya bağlıdır.

**Plan modülü:**

- Adım Kaydı, Görev, Kanıt ve Gösterge Ölçümü bir plana bağlıdır.
- Kanıt Bağı, Kanıt'ın alt tablosudur.
- Gösterge Ölçümü bir kanıta bağlı olabilir. Bu bağ kanıtın silinmesini engeller. Bu yüzden kanıt silinmez, geri çekilir.
- Gösterge Ölçümü, 3.1 adımındaki bir gösterge satırına bağlıdır. Satırın kalıcı kimliği vardır.
- Görev bir karara bağlı olabilir. Bağ modüller arasıdır.

**Karar modülü:**

- Her karar türü bir plana bağlıdır.
- Her karar türünün bir Karar Dayanağı alt tablosu vardır.
- Kapı Kararı aynı kapının önceki kararına bağlıdır. Bu, "görülen son karar" alanıdır.
- Kaynak ayırma izni bir strateji onayına bağlıdır. Koşullu izin ise bir kapı kararına bağlıdır.
- Strateji Gözden Geçirme, bir strateji onayını geçersiz kılabilir.

**Rapor modülü:**

- Rapor Sürümü bir plana bağlıdır.
- Rapor Sürümü bir karara bağlı olabilir. Bağ modüller arasıdır.

**Denetim kaydı ve Eşitleme:**

- Olay Kaydı ve Değişiklik Akışı her türlü kayda bağlanabilir.
- Yükleme Oturumu bir kanıta bağlıdır. Bağ modüller arasıdır.

### 6.3. DocType'lar nasıl haberleşir?

Frappe her kayıt türü için bir denetleyici sınıf açar. Haberleşme bu sınıflardaki adımlarla yapılır.

| Denetleyici adımı | Ne zaman çalışır? | Bizim kullanımımız |
|---|---|---|
| Doğrulama (`validate`) | Kayıt yazılmadan önce | Süreç tanımına göre alan denetimi. Yazmadan önce denetim noktası. |
| Yazma sonrası (`on_update`) | Kayıt yazıldıktan sonra, aynı işlemde | Olay yayma. Akış satırı. |
| Onay (`on_submit`) | Karar onaylanınca | Kuralların Python ile yeniden çalışması. "Karar onaylandı" olayı. |
| Onay sonrası değişiklik (`on_update_after_submit`) | Onaylı kayıtta izinli bir alan değişince | Eskime işareti ve kaynak izninin kapanması. Akış satırı. |
| Silme (`on_trash`) | Kayıt silinmeden önce | "Kanıt silindi" olayı. Akış satırı. |

İzinler iki yerde denetlenir. İki denetimi de yalnız Erişim modülü yazar. Erişim modülü bu denetimleri `hooks.py` ile bütün kayıt türlerine bağlar.

1. **Liste izni.** Frappe'nin liste sorgusuna bir koşul eklenir. Kullanıcı yalnız üye olduğu planların kayıtlarını görür.
2. **Kayıt izni.** Tek bir kayıt açılırken de üyelik ve rol denetlenir. Örneğin okur rolü karar yazamaz. Liste koşulu tek başına bu korumayı vermez.

Plan Üyeliği'nin kendi listesi ayrıdır. Kullanıcı kendi satırlarını görür. Karar sahibi kendi planlarının satırlarını görür.

Liste koşulu Plan Üyeliği tablosunun adını kullanır. Bu, tablo adı denetiminin tek açık istisnasıdır. İstisna yalnız Erişim modülünün izin işlevi içindir. Plan Üyeliği'nin plan ve etkin alanları için veritabanı dizini açılır.

Okuma işlevleri her zaman izin denetimli okuma yolunu kullanır. İzni atlayan okuma yolu yalnız sistem işlerinde kullanılır.

**Tek komut yolu.** Karar kayıt türlerine kullanıcı rolleri doğrudan oluşturma ve onaylama izni almaz. Kararlar yalnız iş akışları katmanındaki uçlardan yazılır. Böylece Frappe'nin hazır kayıt ucu ve yönetim ekranı iş akışını atlayamaz. Önemli denetimler ayrıca onay öncesi adımında (`before_submit`) da çalışır. Bu, ikinci bir koruma katmanıdır.

## 7. Kurallar ve karar akışları

### 7.1. Kurallar iki dilde yaşar

İnternet yokken tarayıcı kapı önerisini hesaplar. Bu yüzden kurallar tarayıcıda TypeScript ile kalır. Sunucu tarayıcıya güvenmez. Değişiklik gelince sunucu kuralları Python ile yeniden çalıştırır. Sunucunun sonucu geçerlidir.

İki kopya şöyle aynı kalır:

1. Bir betik, kuralların TypeScript içe aktarma ağacını çıkarır. Ağaçtaki her dosya ya taşınır ya da gerekçesiyle "taşınmaz" diye işaretlenir.
2. Bir betik TypeScript kurallarından örnek dosyası üretir. Her örnek bir plan, bir "şimdi" zamanı ve beklenen sonuçtur.
3. Geliştirici sınır değerleri için örnekleri elle de yazar.
4. Bir üreteç rastgele planlar üretir.
5. TypeScript ve Python testleri aynı örnekleri çalıştırır.
6. İki taraf farklı sonuç verirse yayın durur.

Saat karşılaştıran kurallar sıra numarasıyla yazılır. Çünkü tarayıcının saati ile sunucunun saati farklı olabilir.

Süreç tanımı değişince geliştirici sürüm numarasını artırır ve bir taşıma yazar. Yayında sunucu bütün planları yeni sürüme taşır. Python kurallarının yalnız son sürümü vardır.

Taşınacak kurallar şunlardır:

- kapı ölçütleri ve karar kaydı denetimi,
- kilitler ve geçiş kapısı,
- eskime ve sınır değişikliği,
- adımların tamamlanma koşulu ve adım denetimleri,
- strateji oluşturma denetimleri ve yeniden açma,
- asıl engel ve serbest bütçe,
- veri bütünlüğü ve koşullu alanlar.

Kaynak dosyalar `src/engine` ve `src/data` klasörlerindedir.

Raporlar taşınmaz. Rapor metnini tarayıcı üretir.

### 7.2. İş akışları

Birden çok kaydı aynı işlemde değiştiren dört iş akışı var.

**Kararı onayla:**

1. Sunucu kullanıcının karar sahibi olduğunu denetler.
2. Sunucu kapı kurallarını Python ile çalıştırır.
3. Sunucu, kararın gördüğü son kararın hâlâ son karar olduğunu denetler. Değilse "çakışma" der.
4. Sunucu okunan adımları ve kanıt sürümlerini Karar Dayanağı'na yazar.
5. Karar koşullu izin içeriyorsa sunucu aynı işlemde bir Kaynak İzni açar. İzin bu karara bağlanır.
6. Sunucu kararı onaylar ve plan sürümünü artırır.
7. "Karar onaylandı" olayı yayılır. Rapor modülü anlık görüntüyü bu olayla alır. Anlık görüntü yalnız buradan alınır.

**Kaynak ayır:**

1. Sunucu geçerli bir strateji onayı olduğunu denetler.
2. Sunucu tutarın serbest bütçeyi aşmadığını denetler.
3. Karar sahibi izni onaylar.
4. İzin, dayandığı strateji onayına ve 3.3 adımının satırına bağlanır.

**Stratejiyi yeniden aç:**

1. Karar sahibi gözden geçirme kaydını onaylar.
2. Aynı işlemde strateji onayı geçersiz olur.
3. Strateji belgesi taslağa döner. Bu komutu iş akışı Plan modülüne gönderir.
4. Kapı 6, 7 ve 8'in kararları eskir.
5. Uygulama sürer. Gözlem ve ölçüm girmek sürer. Açık kaynak izinleri açık kalır.

Karar sahibi 15 Kasım 2026 Pazar günü bu kuralı seçti. "Yeniden aç" kararı kaynak izinlerini geri çekmez. Uygulama eski seçimle sürer. Karar sahibi bir izni durdurmak isterse izni kendisi geri çeker.

**Ölçüm ekle:**

1. Ekip üyesi ölçümü girer. Ölçüm internetsiz de girilebilir.
2. Sunucu ölçümü yeni bir satır olarak ekler. Eski ölçüme dokunmaz.
3. Sunucu olay zamanını ve ulaşma zamanını ayrı saklar.
4. Ölçüm, kaynak izni kapalı olsa da kaydedilir. Ölçüm yeni harcama yetkisi vermez.

### 7.3. Kilit ve eskime

| Kural | Açıklama |
|---|---|
| Strateji adımları | Geçiş kararı olmadan yazılamaz. |
| Strateji uygulama adımları | Kendi kararı kilitliyken yazılamaz. |
| Strateji öncesi adımlar | Kilitlenmez. Yalnız kapı kararı önceki kapıyı bekler. |
| Kilitli kapı | Kilitli bir uygulama kapısında "İlerle" kaydedilmez. |
| Eskime | Bir adım değişince o adımın kapısı ve sonraki kapılar eskir. |
| İstisna | 3.1, 3.2 ve 3.3 adımları hiçbir kararı eskitmez. Çünkü hiçbir kapı bu adımları okumaz. |
| Profil | Profil değişince bütün kapı kararları ve geçiş kararı eskir. |
| Sınırlar | Sınırlar değişince bütün kapı kararları ve geçiş kararı eskir. |

Kuralların tamamı [surec-haritasi.md](surec-haritasi.md) dosyasındadır.

## 8. Eşitleme

### 8.1. Tarayıcı tarafı

| Parça | Nasıl kurulur? |
|---|---|
| Yerel depo | IndexedDB. Kitaplık olarak Dexie.js kullanılır. Üç depo olur: kayıtlar, giden kutusu ve eşitleme bilgisi. |
| Giden kutusu | Her değişiklik kayda ve giden kutusuna aynı işlemde yazılır. İşlem "kesin yazma" seçeneğiyle yapılır. |
| Tekrar anahtarı | Her değişiklik rastgele bir UUID anahtar alır. Tarayıcı verisi silinse de anahtar tekrar etmez. |
| Taslak birleştirme | Gönderilmemiş bir taslağın düzeltmeleri tek değişiklikte birleşir. Gönderim başlayınca değişiklik sabitlenir. |
| Gönderme sırası | Aynı planın değişiklikleri yazıldıkları sırayla gider. Öncelik yalnız planlar arasında ve dosyalarda uygulanır. Dosyalar en son gider. |
| Kararın bağları | Her karar, dayandığı değişikliklerin tekrar anahtarlarını taşır. |
| Gönderici | Uygulama açılınca, internet gelince, sekmeye dönülünce ve belirli aralıklarla çalışır. Kullanıcı "Şimdi eşitle" de diyebilir. |
| Sekmeler | Yazma işini tek bir sekme yapar. Öteki sekmeler ona iletir. |
| İki kayıt durumu | Önce "Cihaza kaydedildi" görünür. Sunucu onaylayınca "Kurumda kaydedildi" görünür. |
| Durum çubuğu | Son eşitleme zamanı, bekleyen değişiklik sayısı ve çakışma sayısı görünür. |
| İnternetsiz hazırlık | Kullanıcı internetsiz kullanacağı planları seçer. Tarayıcı bunları indirir. Ekran "İnternetsiz kullanıma hazır" der. |
| Kalıcı depo | Uygulama tarayıcıdan kalıcı depo izni ister. Dosya almadan önce boş yeri tahmin eder. |
| Değişiklik zamanı | Kaydın sunucudaki değişiklik zamanı düz metin olarak saklanır. Frappe zamanı mikro saniyeye kadar karşılaştırır. |
| Güvenlik anahtarı | Uygulama girişten sonra Frappe'nin sahte istek anahtarını sunucudan alır. Anahtar hatası gelirse yeniler ve yeniden dener. |

### 8.2. Uygulama kabuğu

Servis işçisi uygulamanın internetsiz açılmasını sağlar. Servis işçisi yalnız kendi bulunduğu yolun altını yönetebilir. Frappe uygulama dosyalarını `/assets/` yolunun altından sunar. Bu yüzden servis işçisi dosyası kök yoldan sunulur. Yöntem geliştirmenin 2. adımında denenir.

### 8.3. Sunucu uçları

| Uç | Ne yapar? |
|---|---|
| Gönder | Bir değişiklik grubunu alır. Her değişiklik için sonuç döner: yazıldı, çakıştı ya da reddedildi. |
| Çek | Bir planın son sıra numarasından sonraki değişikliklerini döner. Silinen kayıtlar da gelir. |
| Baştan indir | Bir planın bütün kayıtlarını döner. Rapor anlık görüntüleri gelmez. |
| Dosya yükle | Kanıt dosyasını parça parça alır. Sunucunun kaç bayt aldığını söyler. |

Gönder ucunda her değişiklik şu sırayla işlenir:

1. Sunucu cihazın ve kullanıcının iptal edilip edilmediğine bakar.
2. Sunucu tekrar anahtarıyla bir İşlenen Değişiklik kaydı açmayı dener. Kayıt zaten varsa içerik özetine bakar. Özet aynıysa önceki sonucu döner. Özet farklıysa reddeder.
3. Sunucu bir ara kayıt noktası koyar.
4. Sunucu kullanıcının izinlerine bakar.
5. Sunucu cevabı süreç tanımına göre denetler.
6. Sunucu kaydın değişiklik zamanını karşılaştırır. Kayıt bu arada değiştiyse "çakışma" döner.
7. Sunucu değişikliği yazar. Olaylar aynı işlemde çalışır.
8. Bir hata olursa sunucu ara kayıt noktasına döner. Değişikliğin sonucu "reddedildi" olur.
9. Sunucu sonucu İşlenen Değişiklik kaydına yazar.

Dört kural bu işi güvenli tutar:

1. Ara kayıt noktası içinde dosya yazılmaz. İşlem sonrasına bırakılan görev de eklenmez.
2. Gruplar küçük tutulur. Örneğin en çok 50 değişiklik.
3. Kayıtlar her zaman aynı sırayla kilitlenir.
4. Veritabanı iki işlemin birbirini beklediğini görürse bütün işlemi geri alır. O zaman sunucu bütün grubu yeniden dener. Tekrar anahtarı bu denemeyi güvenli yapar.

### 8.4. Değişiklik akışı

Tarayıcı "son aldığım yerden sonrasını ver" der. Sıra numarası şu yolla verilir:

1. İşlem bitmeden hemen önce sunucu Akış Sayacı kaydını kilitler.
2. Sunucu sayacı bir artırır.
3. Sunucu işlemdeki bütün akış satırlarına bu numarayı yazar.
4. İşlem biter ve kilit açılır.

Böylece numara sırası, işlemlerin bitiş sırasıyla aynı olur. Frappe'nin değişiklik zamanı bu iş için güvenilir değildir. Uzun bir işlem, sonra başlayan işlemden sonra bitebilir.

Akış satırları Frappe'nin kayıt olaylarından yazılır. Böylece Frappe ekranından ve komut satırından yapılan yazmalar da akışa düşer. Her planın ayrı bir sıra imleci vardır. Akış satırları en az 7 gün saklanır.

### 8.5. Çakışma

Birleştirmenin birimi alandır. Satır listesi olan alanlarda birim satırdır.

1. Tarayıcı her değişiklikle kaydın son gördüğü değişiklik zamanını gönderir.
2. Kayıt bu arada değiştiyse sunucu "çakışma" der ve güncel kaydı döner.
3. Tarayıcı üç kopyayı karşılaştırır: eski kopya, sunucunun kopyası ve tarayıcının kopyası.
4. Bir alanı yalnız bir taraf değiştirdiyse tarayıcı birleştirir.
5. İki kişi aynı listeye farklı satır eklediyse tarayıcı iki satırı da tutar.
6. İki taraf aynı alanı ya da aynı satırı değiştirdiyse tarayıcı çakışma ekranını açar. Kullanıcı seçer.
7. Bir taraf kaydı sildiyse ve öteki değiştirdiyse tarayıcı çakışma ekranını açar.
8. Birleştirilen değişiklik yeni bir tekrar anahtarıyla gider.

Yazılım hiçbir değişikliği sessizce silmez. Gösterge Ölçümü ve Olay Kaydı yalnız eklendiği için çakışmaz.

### 8.6. Kararlar ve dosyalar

**Kararlar:**

1. Karar sahibi kararı internetsiz yazabilir. Karar "gönderilmeyi bekliyor" durumunda kalır.
2. Bağlantı gelince önce kararın dayandığı değişiklikler gider. Sonra karar gider.
3. Sunucu 7.2 bölümündeki "Kararı onayla" akışını çalıştırır.
4. Kurallar geçmezse karar taslakta kalır. Ekran sunucunun nedenini gösterir.
5. Bir gözlemin sunucuya ulaşması onay sayılmaz. Onayı karar sahibi ayrıca verir.

Kalan deneme hakkı yalnız onaylı kararlardan sayılır. Üç iş internetsiz hiç yapılamaz: izin, rol ve eşitleme ayarı değişikliği.

**Dosyalar:**

Frappe 16'nın kendi parça parça yükleme özelliğini kullanmıyoruz. Kaynak kodda üç sorun var:

1. Aynı adlı dosyaların parçaları karışabilir.
2. Tekrar gönderilen parça dosyayı bozar.
3. Sunucuya "kaç bayt aldın?" diye sorulamaz.

Bu yüzden kendi yükleme ucumuzu yazarız:

1. Her yüklemenin bir Yükleme Oturumu kaydı olur.
2. Uç, aldığı bayt sayısını söyler. Tarayıcı kaldığı yerden sürdürür.
3. Sunucu dosya bitince boyutu ve içerik özetini denetler.
4. Kanıt dosyaları her zaman özel dosyadır. Giriş yapmadan açılamaz.

Kanıtın metni ve dosyası ayrı durum taşır. Örneğin kanıt kaydı sunucuya ulaşmışken dosya hâlâ bekleyebilir. Dosyası zorunlu olan kanıt, dosya tamamlanana kadar kapı ölçütünde sayılmaz.

### 8.7. Uzun kesinti ve üyelik değişikliği

| Durum | Ne olur? |
|---|---|
| Kesinti 2 günden kısa | Yalnız değişiklikler gönderilir ve alınır. |
| Kesinti 2 günden uzun | Önce bekleyen değişiklikler gider. Sonra plan baştan iner. Bekleyen ve çakışan değişiklikler korunur. |
| Kullanıcı bir plana yeni üye oldu | Tarayıcı o planı baştan indirir. |
| Kullanıcının bir plandaki üyeliği kalktı | Yalnız o planın yerel kopyası silinir. Gönderilmemiş değişiklikler önce gönderilir ve incelemeye ayrılır. Öteki planlar açık kalır. |

## 9. Kurumlar ve güvenlik

### 9.1. Her kuruma ayrı site

Her kurum kendi alt alan adında açılır. Örneğin `kurum-a.alanadi.com`. Her sitenin kendi veritabanı vardır. Ön yüz her kurumun kendi sitesinden açılır. Bu sayede:

1. Tarayıcı her kurumun yerel verisini ayrı tutar.
2. Ön yüz ile sunucu aynı adreste olur. Oturum ek ayar istemez.
3. Kullanıcı kurum seçmez. Adres kurumu belirler.

Sunucu kurumu adresten, kişiyi oturumdan belirler. Tarayıcının gönderdiği kurum ya da kişi adı yetki vermez.

GitHub Pages'deki bugünkü sürüm tanıtım sürümü olarak kalır. Bu sürüm yalnız örnek planla çalışır.

### 9.2. Bugünkü planlar nasıl taşınır?

1. Kullanıcı GitHub Pages sürümünde planını JSON dosyası olarak indirir.
2. Kullanıcı kurum sitesinde giriş yapar ve dosyayı içe alır.
3. Yazılım her eski kimliğe yeni bir UUID verir. Kimliğe bağlı bütün alanları da günceller.
4. Yazılım planı sunucuya ilk kez yükler. Planın karar sahibi giriş yapan kullanıcı olur.
5. Eski kararlar geçmiş olarak okunur. Kurum yeni kararlar için kendi izinlerini yeniden verir.

### 9.3. Güvenlik kuralları

| Konu | Kural |
|---|---|
| Yerel şifreleme | Tarayıcı bir anahtar üretir. Anahtar dışa aktarılamaz. Anahtar ile veri aynı IndexedDB veritabanında durur. |
| Şifrelemenin sınırı | Bilgisayarı açık bulan kişi uygulamayı açıp veriyi görebilir. Bu sınırı karar sahibi kabul etti. |
| Anahtar kaybı | Şifre çözülemezse yazılım veriyi silmez. Kullanıcıya gösterir. |
| Oturum | Frappe'nin oturum süresi 7 gündür. Süre dolunca kullanıcı yeniden giriş yapar. Bekleyen değişiklikler kaybolmaz. |
| Çıkış | Yerel veri silinir. Gönderilmemiş değişiklik varsa uygulama önce uyarır. |
| Ortak bilgisayar | "Ortak cihaz" modunda veri tarayıcıda saklanmaz. Bu modda internetsiz çalışılamaz. |
| İptal edilen cihaz | Sunucu cihazın değişikliğini yazmaz, incelemeye ayırır. Planın karar sahibi inceler. Cihaz bağlanınca yerel verisi silinir. |
| Kimlik alanları | Karar sahibi, onaylayan, ikinci görüş veren ve inceleyen kişi oturumdan alınır. |
| Sunucu denetimi | Sunucu her kuralı ve her izni yeniden denetler. Tarayıcıya güvenmez. |

## 10. Ön yüzde yapılacak değişiklikler

Arka yüz, ön yüzde de değişiklik ister. Bunlar bu deponun işidir.

| Değişiklik | Neden? |
|---|---|
| Veriyi localStorage yerine IndexedDB'de saklamak | localStorage en çok 5 MB tutar ve eşitlemeye uygun değildir. |
| Giden kutusu, gönderici, durum çubuğu ve çakışma ekranı | Eşitleme için gerekir. |
| Strateji belgesinin onayını ayrı bir karara çevirmek | Bugün onay Adım 20'deki bir metin alanıdır. Onay alanı Adım 20'nin bitme koşulundan çıkar. Strateji oluşturmanın bitip bitmediği Karar modülünden okunur. `strategyDone`, `strategyReopened` ve `dossierComplete` işlevleri yeniden yazılır. |
| Kaynak İzni ekranı | Para ancak açık bir izinle harcanır. |
| Gösterge Ölçümü ekranı | Gerçekleşen değer hedeften ayrı tutulur. |
| Karar sahibi ve ikinci görüş alanlarını kullanıcıya bağlamak | Bugün bu alanlar serbest metindir. |
| `uid()` işlevinin UUID üretmesi | Bugün kimlikler "plan-..." biçiminde. Frappe 16 UUID olmayan adı reddeder. |
| Satır listelerinde kalıcı satır kimliği | Bazı eski satırlar sıra numarasıyla kimlik alıyor. Ölçüm ve izin bu satırlara bağlanır. |
| Kurum sitesi için ikinci bir yapı | Bugün yapının taban yolu GitHub Pages adresine göre sabit. Kurum sitesinde ön yüzü Frappe sunar. |
| Sekmeler arası haberleşmenin değişmesi | Bugün `SyncGuard` localStorage olaylarını dinliyor. IndexedDB'ye geçince bu olay gelmez. |
| Koşullu iznin Kaynak İzni'ne taşınması | Bugün koşullu izin kararın içinde duruyor. |
| Kararda "gönderilmeyi bekliyor" ve "sunucu reddetti" durumları | Bugün kararın böyle bir durumu yok. |
| Rol kısıtları | Örneğin stratej ve okur için karar düğmesi kapanır. |
| Yönetici raporunda üç soru | Rapor üç soruyu cevaplar: Neyi seçtik? Gerçekte ne oldu? Şimdi neyi değiştireceğiz? |
| Gözden geçirmede sapmanın nedeni | Karar sahibi önce nedeni seçer. Ekran nedene uygun kararı önerir. Kararı yine karar sahibi verir. |
| Giriş, kurum adresi ve internetsiz hazırlık ekranı | Kullanıcı internetsiz kullanacağı planları seçer. |
| Süreç tanımını JSON dosyasına çıkaran betik | Sunucu aynı tanımı kullanır. |
| Kural örnek dosyasını üreten betik | Python kuralları aynı sonucu vermelidir. |

## 11. DevOps işleri

Bu işler sunucu ve alan adı işidir. Sahibi Hüseyin Cengiz'dir. GoDaddy işlerini Asistan Hüseyin yapar. İş sırası şudur: Hüseyin Cengiz teknik bilgiyi yazar. Asistan Hüseyin GoDaddy'de uygular. Hüseyin Cengiz sonucu doğrular.

Sunucudaki zamanlanmış işler de DevOps işidir. Sertifika yenilemesi ve yedekleme bu tür işlerdir. Bu işleri Hüseyin Cengiz kurar.

| No | İş | Kim yapar? | Neye bağlıdır? | Ne olunca bitmiş sayılır? |
|---|---|---|---|---|
| 0 | Ana alan adını GoDaddy'den alır. | Asistan Hüseyin | Ana alan adı kararı | Alan adı hesapta görünüyor. |
| 1 | Frappe 16 için gereken Python ve MariaDB sürümünü kurar. | Hüseyin Cengiz | Hiçbir şeye | Frappe 16 deneme sunucusunda açılıyor. |
| 2 | Bütün alt adları sunucuya yönlendiren DNS kaydının bilgisini yazar. | Hüseyin Cengiz | 0. ve 1. iş | Bilgi yazılı olarak Asistan Hüseyin'e verildi. |
| 3 | Bu DNS kaydını GoDaddy'de bir kez açar. | Asistan Hüseyin | 2. iş | Kayıt GoDaddy'de görünüyor. |
| 4 | DNS kaydını doğrular. | Hüseyin Cengiz | 3. iş | İki deneme alt adı sunucuya ulaşıyor. |
| 5 | Frappe'de alan adına göre site seçimini açar. | Hüseyin Cengiz | 4. iş | İki deneme sitesi iki farklı adreste açılıyor. |
| 6 | Her siteye Let's Encrypt sertifikası alır. Yenilemeyi kendiliğinden çalışacak şekilde kurar. | Hüseyin Cengiz | 5. iş | İki deneme sitesi güvenli bağlantıyla açılıyor. Deneme yenilemesi hatasız geçiyor. |
| 7 | Kurum açma adımlarını yazar. Adımlara sertifika alma da girer. | Hüseyin Cengiz | 6. iş | Yeni bir kurum yazılı adımlarla açılıyor. Süre ölçüldü. |
| 8 | Her site için yedek kurar. Yedek özel dosyaları ve sitenin şifreleme anahtarını da kapsar. | Hüseyin Cengiz | 5. iş | Bir sitenin yedeği başka bir sunucuya geri yüklendi ve açıldı. |
| 9 | İki ayrı kurulum hazırlar: deneme ve üretim. | Hüseyin Cengiz | 5. iş | Deneme kurulumunda bir ya da iki deneme sitesi var. |
| 10 | Yayın akışını kurar. Akış önce denemeye, sonra üretime çıkar. Her yayından önce yedek alır. | Hüseyin Cengiz | 8. ve 9. iş | Bir güncelleme önce denemeye, sonra üretime çıktı. |
| 11 | Geri dönüş adımlarını yazar ve dener. | Hüseyin Cengiz | 10. iş | Bozuk bir güncelleme deneme kurulumunda geri alındı. |
| 12 | İzleme ve uyarı kurar. | Hüseyin Cengiz | 5. iş | Site kapanınca uyarı geliyor. Sertifika yenilemesi başarısız olunca uyarı geliyor. Sertifikanın bitmesine 14 gün kalınca uyarı geliyor. |
| 13 | Servis işçisi dosyasını kök yoldan sunan sunucu kuralını kurar. | Hüseyin Cengiz | 5. iş ve geliştirmenin 3. adımı | Servis işçisi kök yoldan açılıyor. |

### 11.1. SSL sertifikası neden basitleşti?

İlk planda bütün alt adları kapsayan tek bir sertifika vardı. Bu tür sertifika her yenilemede yeni bir DNS kaydı ister. Bu yüzden GoDaddy erişim anahtarı ya da ayrı bir doğrulama sunucusu gerekiyordu.

Her kurumun zaten ayrı bir sitesi var. Bu yüzden her siteye normal bir sertifika yeter. Normal sertifika DNS'e dokunmadan yenilenir. Böylece GoDaddy'de yalnız bir kez iş yapılır.

Bu yolun küçük bir bedeli var. Her yeni kurum için sertifika alma adımı kurum açma adımlarına eklenir.

## 12. Geliştirme sırası

**İlk teslim uçtan uca ince bir akıştır.** 4. ile 11. adımların en ince hâli önce bir arada kurulur. Akış şudur:

1. Karar sahibi geçiş kararını verir.
2. Stratej yolu önerir. Karar sahibi seçer ve strateji belgesini onaylar.
3. Karar sahibi bir kaynak izni açar.
4. Ekip bir ölçüm girer. Ölçüm internetsiz de girilir.
5. Sonuç hedefi tutmazsa karar sahibi gözden geçirme kaydı açar.
6. Rapor üç soruyu cevaplar: Neyi seçtik? Gerçekte ne oldu? Şimdi neyi değiştireceğiz?

Bu akış çalışınca adımlar tek tek genişletilir.

Her adımda önce başarısız olan test yazılır. Sonra kod yazılır. Codex'in on iki adımı ile bizim on bir adımımız bu listede birleşti.

| Adım | İş | Ne olunca bitmiş sayılır? |
|---|---|---|
| 1 | Sürümleri sabitlemek ve küçük bir internetsiz deneme | İki deneme sitesinde aynı kullanıcı adı farklı yetkilerle çalışıyor. Tek bir taslak kesintiden sonra bir kez ulaşıyor. |
| 2 | Kural ağacı betiği, örnek dosyası ve Python kuralları | Python kuralları bütün örneklerde TypeScript ile aynı sonucu veriyor. 3.1, 3.2 ve 3.3 için koruma testleri geçiyor. |
| 3 | Frappe uygulama iskeleti, altı modül, üç bağ denetimi ve servis işçisi yolu | Bilerek yazılan yasak bir içe aktarma denetimi kırıyor. Servis işçisi kök yoldan açılıyor. |
| 4 | Erişim modülü ve izinler | A kurumunun üyesi B kurumunun planını açamıyor. Okur rolü karar kaydedemiyor. |
| 5 | Plan modülü, kanıtlar ve ölçümler | Hedef 5, gerçekleşen 8 dakika olarak ayrı görünüyor. Kanıt düzeltilince sürümü artıyor. Ölçüme bağlı bir kanıt geri çekilebiliyor ve olay kaydı silmeyi engellemiyor. |
| 6 | Eşitleme uçları, tekrar tablosu, akış sayacı ve değişiklik akışı | Aynı değişiklik iki kez gönderilince bir kez yazılıyor. İki eşzamanlı işlemde hiçbir akış satırı kaçmıyor. Reddedilen değişiklik ötekileri geri almıyor. |
| 7 | Ön yüzde yerel depo, giden kutusu, durum çubuğu ve dosyayla taşıma | İnternet kesilip gelince bütün değişiklikler sunucuya ulaşıyor. Bugünkü bir plan dosyası kayıpsız taşınıyor. |
| 8 | Karar modülü: kapılar, geçiş, strateji onayı ve dayanaklar | Kurala uymayan karar taslakta kalıyor. Karar, okuduğu kanıt sürümlerini saklıyor. |
| 9 | Kaynak izni ve stratejinin yeniden açılması | Kaynak ayırma izni olmayan işe yeni iş bağlanamıyor. Bütçe aynı parayı iki kez saymıyor. "Yeniden aç" strateji onayını geçersiz kılıyor. Kaynak izinleri açık kalıyor. Ölçüm girmek sürüyor. |
| 10 | Çakışma ekranı, dosya yükleme, uzun kesinti ve cihaz iptali | Aynı alanı değiştiren iki kullanıcı çakışma ekranını görüyor. Kesilen yükleme kaldığı yerden sürüyor. |
| 11 | Raporlar ve anlık görüntüler | Sabitlenmiş raporun dayanağı sunucunun verisiyle aynı. Yeni bilgi eski raporu değiştirmiyor. |
| 12 | İki kurum, iki kişi ve iki cihazla kesinti provası | Tarayıcı kapatma, internetsiz açılış, çakışma, silme, üyelik iptali ve kaybolan yanıt sınamaları geçiyor. Testler yavaş ve kopan bir hatta da geçiyor. |
| 13 | Kurum açma ve yayın | İki gerçek kurum ayrı adreslerde çalışıyor. Birinin verisi ötekinde görünmüyor. |

## 13. Riskler

| Risk | Ne olabilir? | Önlem |
|---|---|---|
| Kurallar iki dilde ayrılır | Tarayıcı "İlerle" önerir, sunucu reddeder. | Ortak örnek dosyası. Yayın ancak iki taraf aynı sonucu verince yapılır. |
| Tarayıcı veriyi siler | Gönderilmemiş değişiklikler gider. | Kalıcı depo izni, ana ekran uygulaması, sık eşitleme ve bekleyen sayının görünmesi |
| Safari'de arka plan eşitlemesi yok | Sayfa kapalıyken veri gitmez. | Uygulama açılınca ve açık kaldıkça eşitleme |
| Bütün siteler aynı kodu kullanır | Bozuk bir güncelleme bütün kurumları etkiler. | Deneme kurulumu, yayından önce yedek ve geri dönüş adımları |
| Modüller zamanla birbirine bağlanır | Gevşek bağ kaybolur. | Üç bağ denetimi her kod gönderiminde çalışır. |
| Olay zinciri döngüye girer | Bir olay kendini yeniden tetikler. | Zincir derinliği sınırı |
| Modüller arası bağ veritabanında denetlenmez | Var olmayan bir karara bağlı görev kalabilir. | Her komut işlevi bağı denetler. Plan, kanıt ve kararlar silinmez. Arşivlenir, geri çekilir ya da geçersiz kılınır. |

## 14. Açık kalan konular

Rapor bu konularda önerilerimle ilerler:

1. **Tek kurucu ve ikinci görüş.** Tek kurucu plana bir danışman ekler. Danışman ikinci görüşü kendi hesabıyla verir.
2. **Ana alan adı.** Karar sahibi belirler. DevOps işlerinin 0. adımı bu ada bağlıdır.
3. **Arka yüz deposunun adı ve lisansı.** Karar sahibi belirler. Geliştirmenin 1. adımından önce gerekir.

## 15. Doğrulanması gerekenler

Bu konuları kaynak kodda okudum ya da önerdim. Çalışan bir sunucuda sınamadım.

1. Frappe 16'nın Python 3.14 istemesi kaynak koda dayanıyor. Hüseyin Cengiz bu gereği resmî kurulum belgesiyle doğrulamalı.
2. Frappe'nin `hooks.py` dosyasına kendi olay listemizi eklemek geliştirmenin 3. adımında denenmeli.
3. `import-linter` aracının Frappe uygulamasının klasör yapısıyla çalıştığı 3. adımda denenmeli.
4. Servis işçisinin kök yoldan sunulabildiği 3. adımda denenmeli.
5. Tarayıcının şifreleme anahtarını IndexedDB'de saklayabildiği Chrome ve Safari'de denenmeli.
6. Akış sayacının iki eşzamanlı işlemde doğru çalıştığı 6. adımda denenmeli.
7. Hüseyin Cengiz, Frappe'nin sertifika komutunun yenilemeyi nasıl kurduğunu doğrulamalı.
8. Rapor gerçek okurla denenmedi.

## Kaynaklar

- [Frappe kaynak kodu](https://github.com/frappe/frappe)
- [Frappe REST API belgesi](https://docs.frappe.io/framework/user/en/api/rest)
- [Frappe site yapısı](https://docs.frappe.io/framework/user/en/basics/sites)
- [Frappe veritabanı işlem modeli](https://docs.frappe.io/framework/user/en/api/database#database-transaction-model)
- [Frappe Event Streaming durumu](https://docs.frappe.io/framework/help/event-streaming)
- [Spring Modulith, modül sınırları](https://docs.spring.io/spring-modulith/reference/fundamentals.html)
- [USACE saha değerlendirme belgesi, Ek B](https://www.publications.usace.army.mil/Portals/76/Users/182/86/2486/EC-11-2-218.pdf?ver=2019-09-04-162858-440)
- [NGA MAGE bilgi notu](https://www.nga.mil/assets/files/2024_MAGE_Fact_Sheet.pdf)
- [Codex uygulamasının kayıt modeli](https://github.com/karacaismail/decisionactplancodex/blob/405bbbd/src/domain.ts)
- Öteki kaynaklar [cevrimdisi-calisma-arastirmasi.md](cevrimdisi-calisma-arastirmasi.md) dosyasındadır.
