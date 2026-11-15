# Bütünleşik geliştirme raporu: Frappe 16 arka yüzü, modüler monolit

Bu raporu Claude 15 Kasım 2026 Pazar günü hazırladı. Rapor bir tasarımdır. Hiçbir arka yüz kodu yazılmadı.

Bu sürüm iki yeni kaynağı da işler:

1. Mobil uygulama ve SaaS dağıtımı eleştirisi. Dosya: [elestiri-mobil-saas-dagitim.md](elestiri-mobil-saas-dagitim.md). Eleştiri gerekçe kaynağı olarak kalır.
2. Codex'in güncel arka yüz planındaki beş güçlü fikir ve Codex'in mobil eleştirisi.

Bu rapor tek kaynaktır. Dört belgenin yerini alır:

1. Claude'un arka yüz planı. Dosya: [arka-yuz-plani.md](arka-yuz-plani.md).
2. Codex'in arka yüz planı. Dosya: `decisionactplancodex-backend-plani.md`.
3. Codex'in mobil ve SaaS eleştirisi. Dosya: `pwa-capacitor-saas-mimari-elestiri-raporu.md`.
4. İnternetsiz çalışma araştırması. Dosya: [cevrimdisi-calisma-arastirmasi.md](cevrimdisi-calisma-arastirmasi.md). Araştırma bilgi kaynağı olarak kalır.

## Kısa cevap

Arka yüz tek bir Frappe 16 uygulaması olacak. Uygulama altı modüle bölünecek. Altısı da olmazsa olmazdır. Kurallar ayrı bir pakette duracak.

Ön yüz başsız olacak. Yani ön yüz arka yüzle yalnız API üzerinden konuşacak. Aynı ön yüz iki biçimde çıkacak:

- Tarayıcıda PWA olarak
- Capacitor ile iPhone ve Android uygulaması olarak

Mobil hedefler modül sayısını değiştirmedi. Ancak iki olmazsa olmaz parça ekledi:

1. **Merkezi kurum dizini.** Mağazada tek uygulama var. Uygulama, kullanıcının hangi kurum sitesine bağlanacağını bu dizinden öğrenir. Dizin kurum sitelerinin dışında durur.
2. **İstemci sürüm uyumluluğu.** Sunucu her gece güncellenir. Telefondaki uygulama haftalarca eski kalabilir. Sunucu belirli bir süre eski sürümleri de kabul eder.

Kurumlar ayrı sitelerde çalışacak. Cihaz her değişikliği önce kendi deposuna yazacak. Kararlar yalnız sunucuda kesinleşecek.

Yayın her gece dalgalar hâlinde yapılacak. Jenkins yayını başlatacak. Frappe Press siteleri güncelleyecek. Ön yüz, arka yüz ve sözleşmeler tek bir public depoda duracak.

## 1. Verilen kararlar

Bu kararları karar sahibi 15 Kasım 2026 Pazar günü verdi.

| Konu | Karar |
|---|---|
| Arka yüz teknolojisi | Frappe 16 |
| Mimari | Modüler monolit, gevşek bağlı modüller |
| Modül kuralı | Bir modül ancak olmazsa olmaz ise eklenir. Kuşkuluysa eklenmez. |
| Kurum ayrımı | Her kuruma ayrı Frappe sitesi ve ayrı veritabanı |
| İnternetsiz çalışma | Evet. Tarayıcıda da mobil uygulamada da çalışma sürer. |
| Baştan indirme süresi | 2 gün |
| Yerel şifreleme | Web'de tarayıcının sakladığı anahtar. Mobilde telefonun güvenli kasası. |
| Strateji yeniden açılınca | Uygulama sürer. Kaynak izinleri geri çekilmez. |
| Karar internetsiz | Yalnız taslak olur. Sunucuda kesinleşir. |
| Çakışma | Aynı alan çakışırsa kullanıcı seçer. |
| iPhone | PWA'da kullanıcıdan uygulamayı ana ekrana eklemesi istenir. Mobil uygulamada bu gerekmez. |
| Oturum süresi | 7 gün |
| SSL sertifikası | Kendiliğinden yenilenir. İşi Hüseyin Cengiz kurar. |
| Uygulama planı adımları | 3.1, 3.2 ve 3.3 hiçbir kapı kararını eskitmez. |

Karar sahibi aynı gün şu yeni hedefleri de verdi:

| No | Hedef |
|---|---|
| 1 | Ön yüz bir PWA'dır. Capacitor ile mobil uygulama olarak da çıkar. |
| 2 | Ön yüz tamamen başsızdır. |
| 3 | Arka yüz bir kez yazılır. Tek merkezden ve tek bir git deposundan yönetilir. |
| 4 | Geliştirmeler her gece 02.30 ile 04.00 arasında bütün SaaS abonelerine uygulanır. |
| 5 | Mobil uygulamanın küçük değişiklikleri uzaktan dağıtılır. |
| 6 | Mobil uygulamanın büyük değişiklikleri App Store ve Play Store üzerinden çıkar. |
| 7 | Yayın Jenkins ve Frappe Press ile yapılır. |
| 8 | Ön yüzde ortak kod ile ekrana göre yüklenen kod ayrılır. |

**Depo kararı değişti.** Önceki kararda arka yüz ayrı bir public depoydu. Yeni hedef tek depo istiyor. Bu rapor ön yüzü, arka yüzü ve sözleşmeleri tek bir public depoya koyar. Nedeni basittir. Süreç tanımı, kural örnekleri ve API sözleşmesi iki tarafın ortak kaynağıdır. İki depoda bu dosyaların kopyası zamanla ayrılır. Depo düzeni 10.5 bölümündedir.

### Terimler

| Terim | Anlamı |
|---|---|
| Modüler monolit | Tek bir uygulama olarak yayına çıkar. İçi ayrı modüllere bölünür. |
| Gevşek bağ | Bir modül ötekinin tablosunu okumaz. Yalnız onun açık işlevlerini çağırır ya da yaydığı olayı dinler. |
| DocType | Frappe'de bir kayıt türü. Frappe her kayıt türü için bir tablo açar. |
| Alt tablo | Bir kaydın içindeki satır listesi. Örneğin bir kanıt sürümünün bağlı olduğu adımlar. |
| Yalnız eklenen kayıt | Yazıldıktan sonra değişmeyen kayıt. Yanlışlık yeni bir kayıtla düzeltilir. |
| Komut | Bir şeyi değiştirme isteği. Örneğin "kararı onayla". |
| Sorgu | Bir şeyi okuma isteği. Örneğin "bu planın kanıtlarını ver". |
| Olay | Tamamlanmış bir işin haberi. Örneğin "adım değişti". |
| UUID | Her cihazın kendi başına üretebildiği, tekrar etmeyen uzun bir kimlik |
| Uç | Sunucunun dışarıya açtığı bir işlev. Cihaz bu işlevi internet üzerinden çağırır. |
| Giden kutusu | Cihazda, sunucuya henüz gitmemiş değişikliklerin listesi |
| Tekrar anahtarı | Her değişikliğe verilen tek kimlik. Sunucu aynı değişikliği ikinci kez yazmaz. |
| Ara kayıt noktası | Veritabanı işleminin ortasında konan bir işaret. Hata olursa yalnız bu işaretten sonrası geri alınır. |
| Anlık görüntü | Planın belirli bir andaki tam kopyası |
| PWA | Tarayıcıda açılan ama uygulama gibi kurulabilen web uygulaması |
| Capacitor | Web uygulamasını iPhone ve Android uygulaması olarak paketleyen araç |
| Başsız ön yüz | Arka yüzün ekranlarını kullanmayan, yalnız API çağıran ön yüz |
| Kabuk | Mobil uygulamanın mağazadan gelen yerli kısmı. Uzaktan güncellenemez. |
| Web paketi | Ön yüzün JavaScript, HTML ve CSS dosyaları |
| Uzaktan güncelleme | Mağazaya gitmeden yeni web paketinin telefona indirilmesi |
| Sürüm farkı | Sunucunun, web paketinin ve kabuğun aynı anda farklı sürümlerde olması |
| Kurum dizini | Kullanıcının hangi kurum sitesine bağlanacağını söyleyen merkezi liste |
| Dalga | Yayının kurumlara gruplar hâlinde uygulanması |
| Erişim anahtarı | Girişten sonra sunucunun verdiği kısa ömürlü anahtar. Cihaz her istekte bu anahtarı gönderir. |

Bu raporda "internetsiz" sözü tek anlamda kullanılır. Bu söz, cihazın sunucuya ulaşamadığını anlatır. "Cihaz" sözü hem tarayıcıyı hem mobil uygulamayı anlatır.

## 2. Codex'ten ne aldık?

### 2.1. Arka yüz planından alınan fikirler

| No | Codex'in fikri | Neden değerli? | Bu raporda nerede? |
|---|---|---|---|
| 1 | Seçim harcama yetkisi vermez. Kaynak izni ayrı bir karardır. | Karar sahibi bir yolu seçse bile para henüz açılmamıştır. Para ayrı bir onayla açılır. | Kaynak İzni (5.3) |
| 2 | Hedef ile gerçekleşen ayrı kayıtlardır. | Ekip hedefi 5 dakika koyar. Gerçek sonuç 8 dakika çıkar. Hedef değişmeden kalır. | Hedef ve Gözlem (5.2) |
| 3 | Karar, dayandığı verinin sürümünü saklar. | Kanıt sonradan düzeltilirse hangi kararın eski kanıta dayandığı bulunur. | Karar Dayanağı (5.3) |
| 4 | Ekranda iki ayrı durum görünür: "Cihaza kaydedildi" ve "Kurumda kaydedildi". | Kullanıcı verinin nerede olduğunu bilir. | 8.1 |
| 5 | Toplama, inceleme ve onay ayrı işlerdir. Metin ile ekin gönderim durumu da ayrıdır. | Bir gözlemin sunucuya ulaşması onay sayılmaz. Not ulaşmışken fotoğraf bekleyebilir. | 8.1 ve 8.6 |
| 6 | İlk iş, uçtan uca ince bir akıştır. | Bütün parçalar erken bir arada denenir. Sorun geç çıkmaz. | 12. bölüm |
| 7 | Raporun cevaplaması gereken üç soru var: Neyi seçtik? Gerçekte ne oldu? Şimdi neyi değiştireceğiz? | Yönetici tek sayfada sonucu görür. | 10. bölüm |
| 8 | Kanıtın kaynağı düzenli incelenir. | Eski bir kaynağa dayanan karar fark edilir. | Kanıt (5.2) |
| 9 | Sapmanın nedeni karar türünü belirler. | Kötü bir sonuç her zaman yolun yanlış olduğu anlamına gelmez. | Strateji Gözden Geçirme (5.3) |
| 10 | Kaynak kullanımı yalnız eklenen ayrı bir kayıttır. Ödeme kimliği tekildir. | Aynı ödeme iki cihazdan gelse de bir kez sayılır. Serbest bütçe gerçek kullanımdan hesaplanır. | Kaynak Hareketi (5.3) |
| 11 | Kanıtın her düzeltmesi yeni bir sürüm kaydıdır. | Eski sürüm okunabilir kalır. Karar, okuduğu sürüme bağlanır. | Kanıt Sürümü (5.2) |
| 12 | Hedefin her değişikliği yeni bir sürümdür. Gözlem yalnız eklenir. | Eski rapor, o günkü hedef değeriyle okunur. | Hedef ve Gözlem (5.2) |
| 13 | Akış sayacı her plan için ayrıdır. | Bir planın yazması öteki planları bekletmez. | Akış Başlığı (8.4) |
| 14 | Karar, kural sürümünü ve okuduğu değeri de saklar. | Kural değişse bile eski kararın neden verildiği açıklanır. | Karar Dayanağı (5.3) |

Codex'in birkaç küçük fikrini de aldım:

- Olayın gerçek zamanı ile sunucuya ulaşma zamanı ayrı saklanır.
- Aynı tekrar anahtarı farklı içerikle gelirse sunucu reddeder.
- Gönderilmemiş bir taslağın düzeltmeleri tek değişiklikte birleşir. Gönderim başlayınca değişiklik sabitlenir.
- Kullanıcı internetsiz kullanacağı planları önceden seçer. Ekran "İnternetsiz kullanıma hazır" der.
- Bir planın izni kalkarsa yalnız o planın yerel kopyası silinir. Öteki planlar açık kalır.
- Bir planda aynı anda tek karar sahibi olur. Atamaların süreleri çakışmaz. Atamayı kimin yaptığı saklanır.
- Dış muhasebe bağlantısı isteğe bağlı bir parçadır.

### 2.2. Mobil eleştiriden alınan yaklaşımlar

| No | Codex'in yaklaşımı | Bu raporda nerede? |
|---|---|---|
| 1 | Somut bir kabul senaryosu ve ters hâli | 12.1 |
| 2 | Mobilde telefonun kendi tarayıcısıyla giriş ve PKCE | 9.3 |
| 3 | Bağlanırken sürüm anlaşması, ters sürüm farkı ve hafiften ağıra geri dönüş | 8.8 |
| 4 | Kod taşımayan sürümlü ayar katmanı | 10.3 |
| 5 | Mağaza sürümlerinin kademeli yayını ve üç ayrı zaman kaydı | 11.4 |
| 6 | Press'in üç kayıt türü, tek başlatıcı, site kilidi ve kaybolan yanıtın uzlaştırılması | 11.2 |
| 7 | Süre bütçesi, "pencere aşıldı" durumu ve saat 04.00'teki tamamlanma ölçütü | 11.3 |
| 8 | Platforma göre paket ölçümü, servis işçisi kuralları ve depo düzeni | 10.4 ve 10.5 |

### 2.3. Değiştirerek alınan fikir

**Codex'in fikri.** Karar sahibi "Yolu yeniden seç" derse eski seçime bağlı izinler yeni kullanıma kapanır.

**Bizim kuralımız.** Karar sahibi 15 Kasım 2026 Pazar günü "Yeniden aç" kararının izinleri geri çekmemesini seçti. Bu kural korunur. Ancak bir boşluk vardı. Strateji yeniden onaylanınca eski onaya bağlı izinler açık kalıyordu. Böylece eski stratejinin parası yeni stratejide de kullanılabiliyordu.

**Kapanan boşluk.** Yeni strateji onayı verilince eski onaya bağlı izinler yeni kullanıma kapanır. Geçmiş kullanımlar kalır. Yeniden açma tek başına hiçbir izni kapatmaz. Ayrıntı 7.2 bölümündedir.

### 2.4. Alınmayan fikirler

| Codex'in fikri | Neden almadım? |
|---|---|
| Sürecin aşamalarına göre dokuz modül | 3.4 bölümünde ayrıntılı gerekçe var. Kısaca: adım cevapları tek bir kayıt türündedir. Beş aşama modülü aynı tabloyu paylaşmak zorunda kalırdı. |
| Ayrı bir Sonuç Kararı ve Stratejik Seçim kaydı | Bizde bu işleri Strateji Gözden Geçirme ve Strateji Onayı görür. Seçimin kendisi 2.4 adımının cevabıdır. |
| Raporların arka planda hazırlanması | Bizde rapor metnini cihaz üretir. Sunucu yalnız anlık görüntüyü alır. Arka plan işi şimdilik gerekmez. |
| Mevcut SQLite sunucusundan aktarım | Bu, Codex'in uygulamasına özgüdür. Bizim uygulamamızın sunucusu yok. |
| Mobil menüdeki küçük JavaScript düzeltmesinin de mağazadan çıkması | Bu rapor böyle bir düzeltmeyi imzalı uzaktan web paketiyle gönderir. Yeni işlev ise her zaman mağazadan çıkar. İki yol da mağaza kurallarına uyar. 10.3 bölümüne bakın. |

## 3. Modüller

### 3.1. Altı kesin modül

Modül sayısı ilk taslakta dokuzdu. Bağımsız inceleme üçünün olmazsa olmaz olmadığını gösterdi. Kalan altı modülün her biri, verinin bir yazarıdır.

Mobil uygulama yeni bir veri yazarı getirmedi. Bu yüzden modül sayısı yine altıdır.

| No | Modül | Neyin sahibidir? | Modül olmasa ne bozulur? |
|---|---|---|---|
| 1 | Erişim | Plan üyelikleri, plan rolleri, cihazlar ve giriş istemcileri | "Stratej önerir, karar sahibi seçer" kuralı denetlenemez. Cihaz iptal edilemez. |
| 2 | Plan | Plan, adım cevapları, görevler, kanıtlar, kanıt sürümleri, hedefler ve gözlemler | Kullanıcının yazdıkları saklanamaz. |
| 3 | Karar | Kapı kararları, geçiş kararı, strateji onayı, gözden geçirme, kaynak izinleri, kaynak hareketleri, sınır değişiklikleri, kilitler ve eskime | Kararlar kesinleşemez. Para açılamaz. Süreç sırası korunamaz. |
| 4 | Rapor | Sabitlenmiş rapor sürümleri ve anlık görüntüler | Stratej'e verilen devir raporu sonradan değişebilir. |
| 5 | Denetim kaydı | Kimin neyi ne zaman yaptığının silinmez listesi | Bir karar sonradan tartışılırsa kanıt kalmaz. |
| 6 | Eşitleme ve istemci uyumu | Gelen değişiklikler, tekrar anahtarları, değişiklik akışı, dosya yüklemeleri, desteklenen istemci sürümleri, sürümlü ayarlar ve özellik anahtarları | İnternetsiz çalışma olmaz. Eski uygulama sürümü veriyi kaybeder. |

**Neden istemci uyumu Eşitleme'nin içinde?** Üç bilgi aynı soruya cevap verir. Bu bilgiler desteklenen sürümler, sürümlü ayarlar ve özellik anahtarlarıdır. Soru şudur: "Bu cihaz bu sunucuyla nasıl konuşacak?" Sunucu bu üç bilgiyi bağlanırken anlaşmada döner. Anlaşmanın sahibi de Eşitleme'dir. Üçünü yazan tek bir yazar vardır: yayın hattı ve sistem yöneticisi. Bu yüzden ayrı bir modül gerekmez.

**Kurallar paketi** bir modül değildir. Tablosu yoktur. İçinde süreç tanımının JSON dosyası ve Python kuralları durur.

Frappe'nin kendi kullanıcı, rol, oturum, OAuth ve dosya kayıtları kullanılır. Bunları yeniden yazmayız.

### 3.2. Kurum sitelerinin dışındaki parçalar

Bu iki parça kurum sitelerinin içinde duramaz. Çünkü kurum siteleri birbirini bilmez.

| Parça | Olmazsa olmaz mı? | Ne yapar? | Nerede durur? |
|---|---|---|---|
| Kurum dizini | Evet | Kullanıcıyı kurum sitesine yönlendirir. Kurum kodu gelirse adresi döner. E-posta gelirse giriş bağlantısını e-postaya gönderir. | Küçük ayrı bir Frappe uygulaması. Press'in yönetim sitesinde ya da ayrı bir sitede çalışır. |
| Yayın kaydı | Evet | Hangi siteye hangi sürümün ne zaman uygulandığını tutar. | Press'in kendi kayıtları ve Jenkins. Ayrıntı 11.2 bölümündedir. |

Kurum dizini plan verisini hiç tutmaz. Kullanıcının parolasını da tutmaz. Yayın kaydı da müşterinin karar ve kanıt içeriğini tutmaz. Yalnız sürüm, site ve sonuç tutar.

### 3.3. İsteğe bağlı parçalar

Bu parçalar bugün olmazsa olmaz değildir. İhtiyaç doğarsa eklenir.

| Parça | Ne zaman eklenir? | Nereye eklenir? |
|---|---|---|
| Bildirim | Bir kural bildirime dayanırsa. Örneğin "onayınızı bekleyen bir karar var" ya da "değişiklikleriniz gönderilemedi". | Yedinci modül olur. Telefon bildirimi için Apple ve Google'ın bildirim servisleri kullanılır. |
| Rapor sürüm incelemesi | Bir yönetici, rapor sürümünü resmî olarak incelemek isterse | Rapor modülüne bir kayıt türü |
| Dayanağa göre eskime | Bugün kararlar süreç sırasına göre eskir. İstenirse yalnız okuduğu veri değişen karar eskir. | Karar modülü ve kurallar paketi. TypeScript ile aynı anda değişir. |
| Arka plan işleri için bildirim kutusu | Ağır bir iş çıkarsa. Örneğin PDF üretimi ya da e-posta. | Eşitleme modülü |
| Davet | Kurum yöneticisi kullanıcıları davetle eklemek isterse | Frappe'nin kendi davet özelliği |
| Dış muhasebe bağlantısı | Kurum gerçek ödemeyi muhasebe kaydıyla doğrulamak isterse | Ayrı bir bağlantı modülü. Kaynak iznini yine Karar modülü verir. |

### 3.4. Codex'in dokuz modülü bizde nereye düşüyor?

| Codex'in modülü | Bizdeki karşılığı |
|---|---|
| 1. Kurum ve erişim | Erişim modülü |
| 2. Strateji dosyası | Plan modülü. Karar sahibi ataması Erişim modülünde, plan üyeliğinin geçmişi olarak durur. |
| 3. Kanıt ve dayanaklar | Kanıt ve Kanıt Sürümü, Plan modülünde. Kararın dayandığı sürüm, Karar modülünde. |
| 4. Hazırlık ve geçiş | Adım cevapları Plan modülünde. Geçiş Kararı, Karar modülünde. |
| 5. Stratejik seçim | 2.1 ile 2.5 arası cevaplar Plan modülünde. Strateji Onayı, Karar modülünde. |
| 6. Eylem planı ve kaynak | 3.1, 3.2 ve 3.3 cevapları Plan modülünde. Kaynak İzni ve Kaynak Hareketi, Karar modülünde. |
| 7. Uygulama ve gözlem | Adım 21 ile 34 arası, Hedef ve Gözlem, Plan modülünde |
| 8. Değerlendirme ve yeniden karar | Strateji Gözden Geçirme ve Kapı 6, 7, 8 kararları, Karar modülünde |
| 9. Raporlar ve sürüm incelemesi | Rapor modülü |

Codex'in aşamaları kaybolmadı. Aşamalar ekranda üç ana küme ve alt aşamalar olarak duruyor. Kaynak: `src/data/clusters.ts`.

Neden aşamalara göre modül kurmadık? Üç neden var:

1. **Adım cevapları tek bir kayıt türündedir.** Uygulamada 42 adım var. Bütün adımlar aynı tanım dilinden çizilir. Aşama modülleri aynı tabloyu bölüşmek zorunda kalırdı. Bir tablonun tek sahibi olmalıdır.
2. **Kararlar aynı kural motorunu kullanır.** Kapı 1'den Kapı 8'e kadar bütün kararlar aynı öneri, kilit ve eskime kurallarına bağlıdır. Bu kuralları beş modüle bölmek kopya üretirdi.
3. **Codex'in kendi ilkesi de yazara bakar.** Codex'e göre modüller, veriyi kimin değiştirebildiğini belirler. Bizde iki yazar var. Biri cevabı yazar, öteki kararı verir. Bu yüzden Plan ve Karar ayrı modüllerdir.

Bir gün bir aşama kendine özgü kayıtlar biriktirirse o aşama ayrı modül olur. Örneğin uygulama aşamasındaki saha gözlemleri çok büyüyebilir.

### 3.5. Roller

| Rol | Düzey | Ne yapabilir? |
|---|---|---|
| Sistem yöneticisi | Bütün siteler | Yayını yönetir. Özellik anahtarlarını açar. Ürünü işleten ekip bu roldedir. |
| Kurum yöneticisi | Kurum | Kullanıcı ekler. Cihaz iptal eder. Eşitleme ayarlarını değiştirir. Özellik anahtarını açamaz. |
| Karar sahibi | Plan | Plan üyesi ekler. Karar kaydeder. Kaynak izni açar ve kapatır. Strateji belgesini onaylar. İncelemeye ayrılan değişiklikleri inceler. |
| Stratej | Plan | Yol önerir. Strateji adımlarını ve hedefleri yazar. Karar kaydedemez. |
| Ekip üyesi | Plan | Adım cevaplarını, kanıtları, hedefleri, gözlemleri ve kaynak hareketlerini yazar. İkinci görüş verebilir. |
| Danışman | Plan | Yalnız okur ve ikinci görüş verir. Tek kurucunun ikinci görüş alabilmesi için gerekir. |
| Okur | Plan | Yalnız okur. |

Bir kişi birden çok role sahip olabilir. Tek kurucuda karar sahibi ile stratej aynı kişi olabilir. Bir kişi bir planda karar sahibi, başka bir planda ekip üyesi olabilir.

**Karar sahibi kuralı.** Bir planda aynı anda tek karar sahibi olur. Yeni karar sahibi atanınca önceki atamanın bitiş zamanı aynı işlemde yazılır. İki atamanın süreleri çakışmaz. Atamayı yapan kişi de saklanır.

**İkinci görüş kuralı değişiyor.** Bugün ikinci görüş veren kişinin adı serbest metindir. Sunucuda ikinci görüşü başka bir plan üyesi kendi hesabıyla verir. Tek kurucunun başka üyesi yoksa ikinci görüş alamaz. Bu durumda "İlerle" önerisinin dışına çıkamaz ve sınır artıramaz. Bu yüzden tek kurucu plana bir danışman ekler. Öneri 14. bölümdedir.

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
| Karar | Erişim. Plan yalnız sorgu ile. | Adım değişti, Adım atlandı, Profil değişti, Sınır değişti, Kanıt sürümü eklendi, Kanıt geri çekildi |
| Rapor | Erişim, Plan, Karar | Karar onaylandı |
| Denetim kaydı | Hiçbiri | Bütün olaylar |
| Eşitleme | Hiçbiri. Eşitleme yalnız iş akışları katmanını çağırır. | Bütün kayıt olayları |
| İş akışları katmanı | Erişim, Plan, Karar, Rapor. Komutlar yalnız buradan birden çok modüle gider. | Hiçbiri |

Kurallar paketini bütün modüller kullanabilir. Kurallar paketi hiçbir modülü çağırmaz.

Kurum dizini kurum sitelerindeki hiçbir modülü çağırmaz. Kurum siteleri de dizini çağırmaz. Dizini yalnız cihaz ve kurum açma adımları kullanır.

### 4.3. Olaylar

| Olay | Yayan modül | Dinleyen modüller | Dinleyici ne yapar? |
|---|---|---|---|
| Adım değişti | Plan | Karar, Denetim kaydı, Eşitleme | Karar bağlı kararları eskitir. Denetim kaydı yazar. Eşitleme akışa satır ekler. |
| Adım atlandı | Plan | Karar, Denetim kaydı, Eşitleme | Aynı |
| Profil değişti | Plan | Karar, Denetim kaydı, Eşitleme | Karar bütün kapı kararlarını ve geçiş kararını eskitir. |
| Sınır değişti | Plan | Karar, Denetim kaydı, Eşitleme | Karar bütün kapı kararlarını ve geçiş kararını eskitir. Sınır değişikliği kaydını açar. Artışta ikinci görüş ister. |
| Kanıt sürümü eklendi | Plan | Karar, Denetim kaydı, Eşitleme | Karar, kanıtın eski sürümüne dayanan kararlarda "dayanağı değişti" işaretini açar. |
| Kanıt geri çekildi | Plan | Karar, Denetim kaydı, Eşitleme | Karar bağlı kararları eskitir. Kanıt silinmez, "geri çekildi" durumuna geçer. |
| Hedef sürümü eklendi | Plan | Denetim kaydı, Eşitleme | Hiçbir kapı hedefi okumaz. Bu yüzden Karar dinlemez. |
| Gözlem eklendi | Plan | Denetim kaydı, Eşitleme | Hiçbir kapı gözlemi okumaz. Bu yüzden Karar dinlemez. |
| Karar onaylandı | Karar | Rapor, Denetim kaydı, Eşitleme | Rapor anlık görüntü alır. |
| Kaynak hareketi eklendi | Karar | Denetim kaydı, Eşitleme | Denetim kaydı yazar. Eşitleme akışa satır ekler. |
| Strateji yeniden açıldı | Karar | Denetim kaydı, Eşitleme | Strateji onayı Karar modülünün içinde, aynı işlemde geçersiz olur. Kaynak izinleri açık kalır. Strateji belgesini taslağa döndürme komutu ise iş akışından Plan'a gider. |
| Strateji yeniden onaylandı | Karar | Rapor, Denetim kaydı, Eşitleme | Eski onaya bağlı izinler Karar modülünün içinde, aynı işlemde kapanır. Rapor anlık görüntü alır. |
| Cihaz iptal edildi | Erişim | Denetim kaydı, Eşitleme | Erişim, cihazın anahtarlarını dar bir yetkiye indirir. Eşitleme cihazın değişikliklerini incelemeye ayırır. |

Olaylar aynı işlemde çalışır. Bunun bir bedeli var. Dinleyici hata verirse olayı yayan modülün yazması da geri alınır. Bu bağ bilerek seçildi. Çünkü cevap ile kararın birbirini tutması gerekir.

Olaylar bir zincir kurabilir. Örneğin "Yeniden aç" kararı strateji belgesini taslağa döndürür. Bu yazma "Adım değişti" olayını yayar. Bu yüzden her olay, zincirde kaçıncı olduğunu taşır. Zincir belirli bir derinliği aşarsa işlem durur ve hata verir.

### 4.4. Kurallar kodla denetlenir

1. **İçe aktarma denetimi.** `import-linter` adlı araç Python içe aktarmalarını denetler. Örneğin Plan modülü Karar modülünü içe aktarırsa denetim kırılır.
2. **Tablo adı denetimi.** Küçük bir betik her modülün kodunu tarar. Bir modül başka bir modülün kayıt türünün adını kullanırsa denetim kırılır.
3. **Okunan girdi denetimi.** Her kapı hangi adımları okuduğunu bildirir. Bir test, gerçekten okunan adımları bu listeyle karşılaştırır. Örneğin bir kapı 3.1 adımını okumaya başlarsa test kırılır.
4. **Ön yüz katman denetimi.** Ön yüzün çekirdek katmanı hiçbir ekran kodunu içe aktaramaz. Bir test bunu denetler. Katmanlar 10.4 bölümündedir.

Dört denetim de her kod gönderiminde çalışır. Biri kırılırsa yayın yapılmaz.

## 5. DocType'lar

### 5.1. Erişim modülü

| DocType | Tür | Önemli alanlar | Not |
|---|---|---|---|
| Plan Üyeliği | Normal | plan, kullanıcı, rol, başlangıç, bitiş, etkin, atayan | Bir kişinin bir plandaki rolü. Bitiş tarihli eski satırlar rol geçmişini tutar. Karar sahibi atamalarının süreleri çakışmaz. |
| Cihaz | Normal | kullanıcı, ad, platform, kabuk sürümü, web paketi sürümü, anahtar kimlikleri, son eşitleme, iptal, iptal eden, sil komutu | Cihaza verilen anahtarların kimlikleri burada durur. İptalde bu anahtarlar dar bir yetkiye iner. |

"Sistem yöneticisi" Frappe'nin kendi rolüdür. "Kurum yöneticisi" ise yeni bir roldür. Bu rol uygulamayla birlikte kurulan bir rol kaydı olarak gelir.

Giriş istemcileri ve erişim anahtarları Frappe'nin kendi OAuth kayıtlarıdır. Frappe bu anahtarları kullanıcıya ve istemciye bağlar, cihaza bağlamaz. Bu yüzden sunucu, anahtarı verirken anahtarın kimliğini Cihaz kaydına yazar.

**İptal edilen cihaz ne yapabilir?** Anahtar tümden silinirse cihaz sunucuya hiç ulaşamaz. O zaman bekleyen değişiklikler gelmez. Yerel veriyi silme komutu da gitmez. Bu yüzden iptal edilen cihazın anahtarı dar bir yetkiye iner. Bu yetkiyle cihaz yalnız iki iş yapabilir:

1. Bekleyen değişikliklerini incelemeye gönderir.
2. "Yerel veriyi sil" komutunu alır ve uygular.

Cihaz bu iki işten sonra hiçbir isteğe cevap alamaz.

### 5.2. Plan modülü

| DocType | Tür | Önemli alanlar | Not |
|---|---|---|---|
| Plan | Normal | ad, profil, sınırlar, kısa yol, giriş türü, para birimi, devralma cevapları, süreç sürümü, biçim sürümü, plan sürümü, eski sürüm işareti | Plan sürümünü sunucu artırır. Profil, sınırlar ve devralma cevapları JSON alanıdır. Süreç tanımı bu alanların biçimini denetler. |
| Adım Kaydı | Normal | plan, adım, cevaplar, durum, atlama nedeni | Her plan ve adım için tek satır. Cevaplar JSON alanıdır. Kimlik plandan ve adımdan hesaplanır. 5.7 bölümüne bakın. |
| Görev | Normal | plan, iş, sorumlu, tarih, durum, bağlı karar | Bağlı kararın kimliği düz metin olarak saklanır. 6.1 bölümüne bakın. |
| Kanıt | Normal | plan, başlık, son sürüm, geri çekildi, kaynağın son incelemesi, inceleyen | Kanıtın değişmeyen başlığı. İçerik Kanıt Sürümü'ndedir. Kanıt silinmez, geri çekilir. Kaynak uzun süre incelenmezse ekran uyarır. |
| Kanıt Sürümü | Yalnız eklenir | kanıt, sürüm, bulgu, tür, basamak, tarih, kaynak, karşı bulgu, dosya, dosya durumu, yazan, olay zamanı, ulaşma zamanı | Her düzeltme yeni bir sürüm satırıdır. Eski sürüm okunabilir kalır. Kanıt ve sürüm çifti tekildir. Dosya her zaman özel dosyadır. Dosya ve dosya durumu iki istisnadır. Bu iki alanı yalnız yükleme ucu yazar. |
| Kanıt Bağı | Alt tablo, Kanıt Sürümü'nün içinde | adım, ölçüt | Bu sürümün desteklediği adımlar ve ölçütler |
| Hedef | Yalnız eklenir | plan, hedef kimliği, sürüm, gösterge, birim, dönem, değer, 3.1 satırının kimliği, yazan | Hedefin her değişikliği yeni bir sürüm satırıdır. Hedef kimliği ve sürüm çifti tekildir. |
| Gözlem | Yalnız eklenir | plan, hedef sürümü satırı, değer, birim, dönem, olay zamanı, ulaşma zamanı, kaynak kanıt sürümü, düzelttiği gözlem, giren kişi | Gerçekleşen değer. Ölçüm ise hedefin bir sürüm satırına bağlanır. Bu bağ aynı modül içinde bir bağlantı alanıdır. Hedefsiz saha notu da girilebilir. |

**Neden yalnız eklenen kayıtlar?** İki kişi internetsiz kanıt düzeltse ya da ölçüm girse bile yazılar birbirini ezmez. Eski rapor, o günkü kanıt ve hedef değeriyle okunur.

**Gözlem nasıl düzeltilir?** Yanlış gözlem değiştirilmez. Yeni gözlem eskisini "düzelttiği gözlem" alanıyla işaret eder. Toplamlar yalnız her zincirin son gözlemini sayar. Böylece düzeltme aynı ölçümü iki kez saymaz.

**Bir örnek.** Ekip bekleme süresini 5 dakikaya indirmeyi hedefler. Gözlem 8 dakika çıkar. Tarihli sayım çizelgesi bir kanıt sürümü olur. Gözden geçirme kararı hedefin o günkü sürümüne, gözleme ve çizelgeye bağlanır. Hedef ertesi gün değişir ve 6 dakika olur. Bu değişiklik yeni bir sürüm olarak eklenir. Önceki rapor yine 5 dakikayı gösterir.

**Hedef ve Gözlem'in sınırı.** Hedef kaydı bugün yalnız 3.1 adımındaki göstergelerden doğar. Kapı 6'nın ölçüleri ise Adım 22'de durur. Kapı 6 bu ölçüleri okumaya devam eder. Hedef ile gerçekleşenin ayrılması bu yüzden şimdilik Kapı 6'ya uygulanmaz. İki ölçüm yerinin birleşmesi ayrı bir iştir. Birleşirse Hedef ve Gözlem kapıların okuduğu girdilere, eskime kuralına ve olay tablosuna eklenir.

### 5.3. Karar modülü

| DocType | Tür | Önemli alanlar | Not |
|---|---|---|---|
| Kapı Kararı | Onaylanan | plan, kapı, öneri, seçim, gerekçe, karşı görüş, karar sahibi, ikinci görüş veren, kalan deneme, yeniden açılma koşulu, görülen son karar, kural sürümü, eskime işareti | Karar sahibi ve ikinci görüş veren Frappe kullanıcısıdır. Sunucu bu alanları oturumdan alır. |
| Geçiş Kararı | Onaylanan | plan, sonuç, öneri, gerekçe, karar sahibi, ikinci okuyucu, koşulun konusu, açık soru, sorumlu, son tarih, ölçüt sayıları, kural sürümü, eskime işareti | Strateji oluşturmayı açar. |
| Strateji Onayı | Onaylanan | plan, onaylayan, kalite maddeleri, önceki onay, geçersiz, geçersiz kılan gözden geçirme, kural sürümü, eskime işareti | Strateji belgesini kesinleştirir. Bugün bu onay Adım 20'deki bir alandır. Sunucuda ayrı bir karar olur. Onay iptal edilmez, geçersiz kılınır. |
| Strateji Gözden Geçirme | Onaylanan | plan, seçim hâlâ doğru mu, sapmanın nedeni, karar, gerekçe, geçersiz kılınan onay, karar sahibi, sonraki kontrol tarihi, kural sürümü, eskime işareti | "Yeniden aç" kararı strateji onayını aynı işlemde geçersiz kılar. |
| Kaynak İzni | Onaylanan | plan, tür, kapsam, tutar, para birimi, kişi ve süre, bitiş, sorumlu, kapanış kanıtı, durum, kapanış zamanı, kapanış nedeni, kapı kararı, strateji onayı, 3.3 satırının kimliği, eskime işareti | İki tür var. Koşullu izin bir kapı kararına bağlıdır. Kaynak ayırma izni bir strateji onayına ve 3.3 adımının bir satırına bağlıdır. |
| Kaynak Hareketi | Yalnız eklenir | plan, kaynak izni, hareket türü, tutar, para birimi, ödeme kimliği, dayanak kanıt sürümü, olay zamanı, ulaşma zamanı, giren kişi, düzelttiği hareket, inceleme durumu | İzne bağlı gerçek kullanım. Hareket türü kullanım, iade ya da düzeltmedir. Kullanım hareketlerinde ödeme kimliği plan içinde tekildir. |
| Sınır Değişikliği | Onaylanan | plan, alan, eski değer, yeni değer, artış mı, değiştiren, inceleyen, inceleme zamanı | Artışta ikinci görüş gerekir. İnceleyen kişi değişikliği yapan kişi olamaz. |
| Karar Dayanağı | Alt tablo, her karar türünün içinde | dayanak türü, kayıt kimliği, alan, sürüm, okunan değer | Kararın okuduğu adımlar, kanıt sürümleri ve değerler |

**Kural sürümü neden saklanır?** Sunucu her gece güncellenebilir. Kurallar da değişebilir. Kural sürümü ve okunan değer saklanınca eski kararın neden verildiği açıklanır. Kural sonradan değişse bile açıklama değişmez.

"Onaylanan" türü Frappe'nin onay yapısıdır. Bu yapıda her kayıt "taslak", "onaylandı" ya da "iptal" durumundadır. Onaydan sonra yalnız şu alanlar değişebilir:

| DocType | Onaydan sonra değişebilen alan |
|---|---|
| Kapı Kararı | Eskime işareti |
| Geçiş Kararı | Eskime işareti |
| Strateji Onayı | Geçersiz, geçersiz kılan gözden geçirme, eskime işareti |
| Strateji Gözden Geçirme | Eskime işareti |
| Kaynak İzni | Durum, kapanış zamanı, kapanış nedeni, kapanış kanıtı, eskime işareti |
| Sınır Değişikliği | İnceleyen, inceleme zamanı |

Bütün karar türlerinde "dayanağı değişti" işareti de onaydan sonra değişebilir. Kararın okuduğu kanıtın yeni bir sürümü gelince bu işaret açılır. İşaret kararı eskitmez. Ekran yalnız uyarı gösterir.

Kaynak Hareketi onaylanan bir kayıt değildir. Yalnız eklenir. Tek istisna inceleme durumudur. Bu alanı yalnız karar sahibi değiştirir. İnceleme durumu dört değer alır: yok, incelemede, kabul edildi ve reddedildi.

Bu alanlar Frappe'nin olaylarını atlayan kısa yazma yoluyla yazılmaz. Böylece her değişiklik akışa ve denetim kaydına düşer.

Strateji Gözden Geçirme'deki "sapmanın nedeni" alanı üç seçenek taşır:

| Neden | Ekranın önerdiği karar |
|---|---|
| Teslim aksadı | Düzelt. Plan ve işler güncellenir. |
| Dayanak çöktü | Yeniden aç. Strateji oluşturmaya dönülür. |
| Bilinmiyor | Sürdür ve ölç. Bir sonraki kontrolün tarihi yazılır. |

Öneri kararı vermez. Kararı karar sahibi verir.

Kaynak İzni'nin dört ayrı kapanış durumu vardır:

| Durum | Anlamı | Kapıya etkisi |
|---|---|---|
| Kanıtla kapandı | İzin verilen iş yapıldı. Kapanış kanıtı geldi. | Koşullu izin kapanınca kapı geçmiş sayılır. Bugünkü kural budur. |
| Geri çekildi | Karar sahibi izni kendisi geri aldı. | Geri çekilen koşullu izin kapıyı geçirmez. Kapı "Beklet" sayılır. |
| Yeni onayla kapandı | Strateji yeniden onaylandı. İzin eski onaya bağlıydı. | Yalnız kaynak ayırma izninde olur. Hiçbir kapıyı etkilemez. |
| Yeni kararla kapandı | Aynı kapıya yeni bir karar onaylandı. İzin eski karara bağlıydı. | Yalnız koşullu izinde olur. Kapının durumunu yeni karar belirler. |

Kapanan bir izne gelen yeni hareket doğrudan kabul edilmez. Hareket kaybolmaz, incelemeye ayrılır. Geçmiş hareketler kalır.

**Bütçe sayımı.** Serbest bütçe, harcama sınırından üç tutar düşülerek hesaplanır:

1. Strateji öncesinde harcanan tutar. Kullanıcı bu tutarı bugünkü gibi Adım 16'da yazar. Adım 16'ya yalnız hareketle kaydedilmemiş harcama yazılır. Ekran bunu alanın yanında söyler.
2. Kaynak hareketlerinin toplamı. Her düzeltme zincirinin yalnız son hareketi sayılır. İncelemedeki hareketler de sayılır. Yalnız reddedilen hareketler sayılmaz.
3. Açık izinlerin harcanmamış payı. Bu pay, iznin tutarından o izne bağlı hareketler düşülerek bulunur. Pay hiçbir zaman sıfırın altına inmez.

3.3 adımının izne dönüşmeyen satırı bütçeden düşülmez. Satır izne dönüşünce düşülür. Böylece aynı para iki kez sayılmaz.

Bir örnek. Harcama sınırı 100 liradır. Karar sahibi 60 liralık bir izin açar. Ekip bu izinle 20 lira kullanır. Serbest bütçe 40 liradır. İzin kapanırsa kullanılmayan 40 lira serbest kalır. Serbest bütçe 80 liraya çıkar.

**Aynı ödeme iki kez sayılmaz.** Her kullanım hareketine bir ödeme kimliği yazılır. Örneğin fatura numarası. Aynı kimlik aynı içerikle ikinci kez gelirse sunucu ikinci hareketi yazmaz. Önceki sonucu döner. Aynı kimlik farklı içerikle gelirse sunucu "çakışma" der. Hareket kaybolmaz, incelemeye ayrılır. İade ve düzeltme hareketleri yeni kimlik almaz. Bu hareketler düzelttikleri kullanım hareketine bağlanır.

**İzni aşan hareket.** Hareket iznin kalanını aşabilir. Bu geçmişte olmuş bir harcamadır. Sunucu bu hareketi reddetmez. Hareketi "izin aşıldı" işaretiyle incelemeye ayırır. Karar sahibi inceler. Serbest bütçe eksiye düşerse ekran uyarır.

**Yazılımın sınırı.** Yazılım bankadaki ödemeyi yapmaz ve durduramaz. Kaynak Hareketi yalnız kurum içindeki takibi sağlar. Yazılım serbest bütçeyi aşan yeni izni engeller. Kapalı izne gelen hareketi de incelemeye ayırır.

### 5.4. Rapor ve Denetim kaydı modülleri

| Modül | DocType | Tür | Önemli alanlar | Not |
|---|---|---|---|---|
| Rapor | Rapor Sürümü | Normal | plan, rapor türü, sürüm, anlık görüntü, anlık görüntünün özeti, sabitleyen, sabitleme zamanı, kaynak karar | Anlık görüntüyü sunucu kendi verisinden alır. |
| Denetim kaydı | Olay Kaydı | Yalnız eklenir | olay türü, kayıt türü, kayıt, plan, kullanıcı, cihaz, istemci sürümü, olay zamanı, ulaşma zamanı, özet | Hiç kimse düzeltemez ve silemez. |

### 5.5. Eşitleme ve istemci uyumu modülü

| DocType | Tür | Önemli alanlar | Not |
|---|---|---|---|
| İşlenen Değişiklik | Normal | tekrar anahtarı (kaydın kimliği), cihaz, kullanıcı, plan, biçim sürümü, içerik özeti, sonuç, ayrıntı | Aynı anahtar farklı içerikle gelirse sunucu reddeder. |
| Değişiklik Akışı | Normal | plan, sıra numarası, kayıt türü, kayıt, işlem türü, zaman | Cihaz bu akıştan çeker. Plan ve sıra numarası çifti tekildir. |
| Akış Başlığı | Normal | plan, son sıra numarası | Her planın tek satırı vardır. 8.4 bölümüne bakın. |
| Yükleme Oturumu | Normal | yükleme kimliği, kullanıcı, kanıt sürümü, toplam bayt, alınan bayt, özet, durum | Kesilen yükleme kaldığı yerden sürer. |
| Eşitleme Ayarları | Tek kayıt | baştan indirme süresi, akış saklama süresi, uyumluluk penceresi, akış dönemi | Varsayılanlar 2 gün, 7 gün ve 30 gün. Akış dönemi yalnız yedekten dönüşte değişir. |
| İstemci Uyumluluğu | Tek kayıt | API sürümleri, eşitleme biçim sürümleri, desteklenen en eski web paketi, desteklenen en eski kabuk, en eski sürümün bitiş tarihi | Yayın hattı yazar. Bağlanırken anlaşmada kullanılır. 8.8 bölümüne bakın. |
| Ayar Sürümü | Yalnız eklenir | sürüm, kapsam, uygulama sürümü aralığı, izinli alanlar, içerik, durum | Kod taşımayan sürümlü ayar. 10.3 bölümüne bakın. |
| Özellik Anahtarı | Normal | ad, açık mı, en düşük istemci sürümü, açan, açılma zamanı | Yeni bir özellik önce kapalı çıkar. Sistem yöneticisi kurum için açar. |

Eski biçimi yeni biçime çeviren çeviriciler kayıt değildir. Bunlar Eşitleme modülünün kodundadır. Her çevirici bir testle denetlenir.

### 5.6. Kurum dizini

Kurum dizini ayrı bir Frappe uygulamasıdır. Kurum sitelerinde kurulmaz.

| DocType | Tür | Önemli alanlar | Not |
|---|---|---|---|
| Kurum Kaydı | Normal | kurum kodu, e-posta alanları, site adresi, durum, saat dilimi, dalga | Plan verisi ve parola tutmaz. |

Dizin iki yolla çalışır:

1. **Kurum kodu.** Kurum kodunu kurum yöneticisi kendi kullanıcılarına verir. Dizin bu koda karşılık site adresini döner.
2. **E-posta.** Dizin ekranda adres göstermez. Kurumu bulursa giriş bağlantısını o e-postaya gönderir. Ekran her durumda aynı cümleyi gösterir: "Bağlantı e-postanıza gönderildi."

Böylece dizin, e-postayla kurum listesini dışarı sızdırmaz. Sunucu istek hızını da sınırlar.

### 5.7. Kimlik kuralları

| Kayıt | Kimliği |
|---|---|
| Plan, görev, kanıt, kanıt sürümü, hedef, gözlem, bütün kararlar, kaynak hareketi, rapor sürümü, plan üyeliği, cihaz | UUID. Cihaz kimliği kendisi seçer. Bu tür kimlik sütunu Frappe 16'da var. |
| Adım Kaydı | Planın kimliğinden ve adımın kodundan hesaplanan UUID. Bu tür UUID'nin adı UUIDv5'tir. İki cihaz aynı adımı internetsiz açsa bile aynı kimliği üretir. Böylece iki ayrı satır oluşmaz. |
| İşlenen Değişiklik | Tekrar anahtarının kendisi |
| Değişiklik Akışı | UUID. Plan ve sıra numarası ayrıca tekildir. |
| Akış Başlığı | Planın kimliği |
| Olay Kaydı, Yükleme Oturumu, Ayar Sürümü | UUID. Kimliği sunucu verir. |
| Eşitleme Ayarları, İstemci Uyumluluğu | Tek kayıt. Kimliği yoktur. |
| Özellik Anahtarı, Kurum Kaydı | Adı ya da kurum kodu |

## 6. DocType'lar arası ilişki ve iletişim

### 6.1. İlişki kuralları

| Durum | Nasıl bağlanır? | Örnek |
|---|---|---|
| Her kayıt bir plana bağlıdır | Plan'a bağlantı alanı (Link). Bütün modüller bu bağı kullanabilir. | Kapı Kararı'nın planı |
| Aynı modülde, bir kayıt ötekine bağlı | Bağlantı alanı (Link) | Kaynak Hareketi'nin kaynak izni. Kanıt Sürümü'nün kanıtı. Gözlem'in hedef sürümü. |
| Aynı modülde, bir kayıt ötekinin parçası | Alt tablo | Kanıt Bağı, Kanıt Sürümü'nün içinde durur. |
| Farklı modüller arasında, Plan dışındaki kayıtlara | Tür, kimlik ve gerekirse sürüm düz metin olarak saklanır. Kayıt, sahibi olan modülün okuma işleviyle okunur. | Görev'in bağlı kararı. Karar Dayanağı'ndaki kanıt sürümü. Kaynak Hareketi'nin dayanak kanıt sürümü. |
| Teknik kayıtlar, her türlü kayda | Kayıt türü ve kimlik iki düz metin alanında saklanır. | Olay Kaydı, Değişiklik Akışı |
| Kullanıcıya bağlanma | Frappe'nin kullanıcı kaydına bağlantı alanı | Kararın karar sahibi |

**Plan neden istisnadır?** Plan bütün kayıtların köküdür. Plan'a bağlantı alanı üç şey kazandırır:

1. Frappe'nin kullanıcı izinleri yalnız bağlantı alanında çalışır.
2. Frappe, bağlı kaydı olan bir planın silinmesini engeller. Planlar zaten silinmez, arşivlenir.
3. Frappe'nin rapor oluşturucusu ve "Bağlantılar" paneli plana bağlanabilir.

**Öteki modüller arası bağlar neden düz metindir?** Frappe bağlantı alanını kaydederken öteki modülün tablosunu okur. Bu, modüller arasında gizli bir bağ kurar. Frappe ayrıca bağlı kaydın silinmesini ve iptalini engeller. Örneğin onaylı bir karara bağlı görev, kararın iptalini engellerdi.

**Teknik kayıtlar neden değişken bağlantı alanı kullanmaz?** Frappe değişken bağlantı alanını da kaydederken okur. Ayrıca Frappe silmeden önce bu alanları tarar. Olay Kaydı'nda değişken bağlantı alanı olsaydı silinebilen bir kayıt silinemezdi. Örneğin bir görev. Çünkü silme işlemi kendi olay kaydını yazar ve o kayıt silmeyi engellerdi. Bu yüzden kayıt türü ve kimlik düz metindir. Bu davranış için bir regresyon testi yazılır.

**Bu kuralın bedeli.** Veritabanı, düz metin bağların doğru olduğunu kendisi denetlemez. Bu denetimi her komut işlevi yapar. Örneğin Plan modülü bir görevi kararla bağlarken kararın var olduğunu Karar modülüne sorar. Bulunmayan ya da başka plana ait bağ reddedilir.

### 6.2. İlişki haritası

Aşağıdaki liste her kaydın neye bağlı olduğunu gösterir. Ok yerine "bağlıdır" sözünü kullandım.

**Erişim modülü:**

- Plan Üyeliği bir plana bağlıdır.
- Plan Üyeliği bir kullanıcıya bağlıdır.
- Cihaz bir kullanıcıya bağlıdır.

**Plan modülü:**

- Adım Kaydı, Görev, Kanıt, Hedef ve Gözlem bir plana bağlıdır.
- Kanıt Sürümü bir kanıta bağlıdır.
- Kanıt Bağı, Kanıt Sürümü'nün alt tablosudur.
- Hedef, 3.1 adımındaki bir gösterge satırına bağlıdır. Satırın kalıcı kimliği vardır.
- Gözlem bir hedef sürümüne bağlı olabilir. Saha notu hiçbir hedefe bağlı değildir.
- Gözlem bir kanıt sürümüne bağlı olabilir.
- Gözlem, düzelttiği gözleme bağlı olabilir.
- Görev bir karara bağlı olabilir. Bağ modüller arasıdır.

**Karar modülü:**

- Her karar türü bir plana bağlıdır.
- Her karar türünün bir Karar Dayanağı alt tablosu vardır. Dayanaktaki kanıt sürümü bağı modüller arasıdır.
- Kapı Kararı aynı kapının önceki kararına bağlıdır. Bu, "görülen son karar" alanıdır.
- Kaynak ayırma izni bir strateji onayına bağlıdır. Koşullu izin ise bir kapı kararına bağlıdır.
- Kaynak Hareketi bir kaynak iznine bağlıdır. Dayanak kanıt sürümü bağı modüller arasıdır.
- Strateji Onayı önceki onaya bağlı olabilir.
- Strateji Gözden Geçirme, bir strateji onayını geçersiz kılabilir.

**Rapor modülü:**

- Rapor Sürümü bir plana bağlıdır.
- Rapor Sürümü bir karara bağlı olabilir. Bağ modüller arasıdır.

**Denetim kaydı ve Eşitleme:**

- Olay Kaydı ve Değişiklik Akışı her türlü kayda bağlanabilir.
- Akış Başlığı bir plana bağlıdır.
- Yükleme Oturumu bir kanıt sürümüne bağlıdır. Bağ modüller arasıdır.

### 6.3. DocType'lar nasıl haberleşir?

Frappe her kayıt türü için bir denetleyici sınıf açar. Haberleşme bu sınıflardaki adımlarla yapılır.

| Denetleyici adımı | Ne zaman çalışır? | Bizim kullanımımız |
|---|---|---|
| Doğrulama (`validate`) | Kayıt yazılmadan önce | Süreç tanımına göre alan denetimi. Yazmadan önce denetim noktası. Yalnız eklenen kayıtlarda düzeltmenin reddi. |
| Yazma sonrası (`on_update`) | Kayıt yazıldıktan sonra, aynı işlemde | Olay yayma. Akış satırı. |
| Onay (`on_submit`) | Karar onaylanınca | Kuralların Python ile yeniden çalışması. "Karar onaylandı" olayı. |
| Onay sonrası değişiklik (`on_update_after_submit`) | Onaylı kayıtta izinli bir alan değişince | Eskime işareti ve kaynak izninin kapanması. Akış satırı. |
| Silme (`on_trash`) | Kayıt silinmeden önce | Silinmeyen kayıt türlerinde silmeyi reddeder. Silinebilen kayıtta akış satırı yazar. |

Plan, kanıt, kanıt sürümü, hedef, gözlem, kararlar ve kaynak hareketleri silinmez. Bunlar arşivlenir, geri çekilir, düzeltilir ya da geçersiz kılınır.

İzinler iki yerde denetlenir. İki denetimi de yalnız Erişim modülü yazar. Erişim modülü bu denetimleri `hooks.py` ile bütün kayıt türlerine bağlar.

1. **Liste izni.** Frappe'nin liste sorgusuna bir koşul eklenir. Kullanıcı yalnız üye olduğu planların kayıtlarını görür.
2. **Kayıt izni.** Tek bir kayıt açılırken de üyelik ve rol denetlenir. Örneğin okur rolü karar yazamaz. Liste koşulu tek başına bu korumayı vermez.

Plan Üyeliği'nin kendi listesi ayrıdır. Kullanıcı kendi satırlarını görür. Karar sahibi kendi planlarının satırlarını görür.

Liste koşulu Plan Üyeliği tablosunun adını kullanır. Bu, tablo adı denetiminin tek açık istisnasıdır. İstisna yalnız Erişim modülünün izin işlevi içindir. Plan Üyeliği'nin plan ve etkin alanları için veritabanı dizini açılır.

Okuma işlevleri her zaman izin denetimli okuma yolunu kullanır. İzni atlayan okuma yolu yalnız sistem işlerinde kullanılır.

**Tek komut yolu.** Karar kayıt türlerine kullanıcı rolleri doğrudan oluşturma ve onaylama izni almaz. Kararlar yalnız iş akışları katmanındaki uçlardan yazılır. Böylece Frappe'nin hazır kayıt ucu ve yönetim ekranı iş akışını atlayamaz. Önemli denetimler ayrıca onay öncesi adımında (`before_submit`) da çalışır. Bu, ikinci bir koruma katmanıdır.

## 7. Kurallar ve karar akışları

### 7.1. Kurallar iki dilde yaşar

İnternet yokken cihaz kapı önerisini hesaplar. Bu yüzden kurallar cihazda TypeScript ile kalır. Sunucu cihaza güvenmez. Değişiklik gelince sunucu kuralları Python ile yeniden çalıştırır. Sunucunun sonucu geçerlidir.

İki kopya şöyle aynı kalır:

1. Bir betik, kuralların TypeScript içe aktarma ağacını çıkarır. Ağaçtaki her dosya ya taşınır ya da gerekçesiyle "taşınmaz" diye işaretlenir.
2. Bir betik TypeScript kurallarından örnek dosyası üretir. Her örnek bir plan, bir "şimdi" zamanı ve beklenen sonuçtur.
3. Geliştirici sınır değerleri için örnekleri elle de yazar.
4. Bir üreteç rastgele planlar üretir.
5. TypeScript ve Python testleri aynı örnekleri çalıştırır.
6. İki taraf farklı sonuç verirse yayın durur.

Saat karşılaştıran kurallar sıra numarasıyla yazılır. Çünkü cihazın saati ile sunucunun saati farklı olabilir.

**Kurallar ve sürüm farkı.** Sunucuda kuralların yalnız son sürümü çalışır. Ancak telefondaki uygulama eski kural sürümüyle öneri hesaplamış olabilir. Bu durumda üç kural geçerlidir:

1. Cihazın sonucu yalnız bir öneridir.
2. Sunucu kararı kendi kurallarıyla değerlendirir. Kural sürümünü kararın içine yazar.
3. İki sonuç farklıysa ekran "kurallar güncellendi" der. Karar taslakta kalır.

Süreç tanımı değişince geliştirici sürüm numarasını artırır ve bir taşıma yazar. Yayında sunucu bütün planları yeni sürüme taşır. Taşıma, uyumluluk penceresi içindeki eski istemcileri bozamaz. 8.8 bölümüne bakın.

Taşınacak kurallar şunlardır:

- kapı ölçütleri ve karar kaydı denetimi,
- kilitler ve geçiş kapısı,
- eskime ve sınır değişikliği,
- adımların tamamlanma koşulu ve adım denetimleri,
- strateji oluşturma denetimleri ve yeniden açma,
- asıl engel ve serbest bütçe,
- veri bütünlüğü ve koşullu alanlar.

Kaynak dosyalar `src/engine` ve `src/data` klasörlerindedir.

Raporlar taşınmaz. Rapor metnini cihaz üretir.

### 7.2. İş akışları

Birden çok kaydı aynı işlemde değiştiren yedi iş akışı var. Her iş akışı önce planın kaydını kilitler. Bu kilidi Plan modülünün komut işlevi verir. Böylece aynı planın iki iş akışı birbirinin bütçesini ya da kararını ezemez.

**Kararı onayla:**

1. Sunucu kullanıcının karar sahibi olduğunu denetler.
2. Sunucu kapı kurallarını Python ile çalıştırır.
3. Sunucu, kararın gördüğü son kararın hâlâ son karar olduğunu denetler. Değilse "çakışma" der.
4. Sunucu okunan adımları, kanıt sürümlerini ve okunan değerleri Karar Dayanağı'na yazar. Kural sürümünü de kararın içine yazar.
5. Karar koşullu izin içeriyorsa sunucu aynı işlemde bir Kaynak İzni açar. Önce "Kaynak ayır" akışındaki bütçe denetimini aynı plan kilidi altında çalıştırır. İzin bu karara bağlanır.
6. Aynı kapının önceki kararına bağlı açık bir koşullu izin olabilir. Bu izin "Yeni kararla kapandı" olur. Geçmiş hareketler kalır.
7. Sunucu kararı onaylar ve plan sürümünü artırır.
8. "Karar onaylandı" olayı yayılır. Rapor modülü anlık görüntüyü bu olayla alır. Anlık görüntü yalnız buradan alınır.

**Kaynak ayır:**

1. Sunucu geçerli bir strateji onayı olduğunu denetler.
2. Sunucu tutarın serbest bütçeyi aşmadığını denetler.
3. Karar sahibi izni onaylar.
4. İzin, dayandığı strateji onayına ve 3.3 adımının satırına bağlanır.

İki eşzamanlı izin aynı parayı kullanamaz. Çünkü ikinci iş akışı, birincinin plan kilidini bekler. Sonra bütçeyi yeniden hesaplar.

**Kaynak kullanımı kaydet:**

1. Ekip üyesi ya da karar sahibi hareketi girer. Hareket internetsiz de girilebilir.
2. Cihaz hareketle birlikte o anda gördüğü son sıra numarasını da gönderir.
3. Sunucu ödeme kimliğine bakar. Aynı kimlik ve aynı içerik varsa ikinci hareketi yazmaz.
4. Sunucu iznin durumuna bakar. İzin açıksa hareket yazılır.
5. İzin kapalıysa hareket yazılır ama incelemeye ayrılır. Karar sahibi inceler. İnceleyen kişi, sıra numarasından kullanıcının kapanışı görüp görmediğini anlar.
6. Hareket iznin kalanını aşarsa hareket yazılır ve "izin aşıldı" işaretiyle incelemeye ayrılır.

Sunucu bu kararı cihazın saatine göre vermez. Çünkü cihazın saati yanlış olabilir. Olay zamanı yalnız bilgi olarak saklanır.

**Stratejiyi yeniden aç:**

1. Karar sahibi gözden geçirme kaydını onaylar.
2. Aynı işlemde strateji onayı geçersiz olur.
3. Strateji belgesi taslağa döner. Bu komutu iş akışı Plan modülüne gönderir.
4. Kapı 6, 7 ve 8'in kararları eskir.
5. Uygulama sürer. Gözlem ve kaynak hareketi girmek sürer. Açık kaynak izinleri açık kalır.

Karar sahibi 15 Kasım 2026 Pazar günü bu kuralı seçti. "Yeniden aç" kararı kaynak izinlerini geri çekmez. Uygulama eski seçimle sürer. Karar sahibi bir izni durdurmak isterse izni kendisi geri çeker.

**Stratejiyi yeniden onayla:**

1. Karar sahibi yeni strateji belgesini onaylar.
2. Sunucu yeni bir Strateji Onayı yazar. Yeni onay, geçersiz kılınan önceki onaya bağlanır.
3. Aynı işlemde, önceki onaya bağlı açık kaynak ayırma izinleri "Yeni onayla kapandı" olur.
4. Bu izinlerin geçmiş hareketleri kalır. Harcanmamış payları serbest bütçeye döner.
5. Karar sahibi yeni 3.3 satırları için yeni izinler açar.

Bu kural karar sahibinin seçimiyle çelişmez. Yeniden açma izinleri kapatmaz. İzinler ancak yeni bir strateji onaylanınca kapanır. Böylece eski stratejinin parası yeni stratejide sessizce kullanılmaz. Koşullu izinler bu kuraldan etkilenmez. Çünkü koşullu izinler strateji onayına değil, kapı kararına bağlıdır.

**Gözlem ekle:**

1. Ekip üyesi gözlemi girer. Gözlem internetsiz de girilebilir.
2. Sunucu gözlemi yeni bir satır olarak ekler. Eski gözleme dokunmaz.
3. Sunucu olay zamanını ve ulaşma zamanını ayrı saklar.
4. Gözlem, kaynak izni kapalı olsa da kaydedilir. Gözlem yeni harcama yetkisi vermez.

**Hedefi değiştir:**

1. Stratej ya da ekip üyesi hedefi değiştirir.
2. Sunucu hedefin yeni bir sürümünü ekler. Eski sürüme dokunmaz.
3. Eski sürüme bağlı gözlemler eski sürüme bağlı kalır.

### 7.3. Kilit ve eskime

| Kural | Açıklama |
|---|---|
| Strateji adımları | Geçiş kararı olmadan yazılamaz. |
| Strateji uygulama adımları | Kendi kararı kilitliyken yazılamaz. |
| Strateji öncesi adımlar | Kilitlenmez. Yalnız kapı kararı önceki kapıyı bekler. |
| Kilitli kapı | Kilitli bir uygulama kapısında "İlerle" kaydedilmez. |
| Kapalı izin | Kapalı bir izne gelen hareket doğrudan kabul edilmez. Hareket incelemeye ayrılır. |
| Eskime | Bir adım değişince o adımın kapısı ve sonraki kapılar eskir. |
| İstisna | 3.1, 3.2 ve 3.3 adımları hiçbir kararı eskitmez. Hedef ve gözlem de hiçbir kararı eskitmez. Çünkü hiçbir kapı bunları okumaz. |
| Profil | Profil değişince bütün kapı kararları ve geçiş kararı eskir. |
| Sınırlar | Sınırlar değişince bütün kapı kararları ve geçiş kararı eskir. |

Kuralların tamamı [surec-haritasi.md](surec-haritasi.md) dosyasındadır.

## 8. Eşitleme

### 8.1. Cihaz tarafı

| Parça | Nasıl kurulur? |
|---|---|
| Yerel depo | Bir depo bağdaştırıcısı kurulur. Eşitleme kodu iki ortamda aynı arayüzü kullanır. Ayrıntı aşağıdaki tablodadır. |
| Kurumlara göre ayrım | Her kurum için ayrı bir yerel veritabanı açılır. Kullanıcı kurum değiştirince öteki kurumun verisi kilitlenir. |
| Giden kutusu | Her değişiklik kayda ve giden kutusuna aynı işlemde yazılır. Web'de işlem "kesin yazma" seçeneğiyle yapılır. |
| Biçim sürümü | Giden kutusundaki her değişiklik kendi biçim sürümünü taşır. |
| Tekrar anahtarı | Her değişiklik rastgele bir UUID anahtar alır. Yerel veri silinse de anahtar tekrar etmez. |
| Taslak birleştirme | Gönderilmemiş bir taslağın düzeltmeleri tek değişiklikte birleşir. Gönderim başlayınca değişiklik sabitlenir. |
| Gönderme sırası | Aynı planın değişiklikleri yazıldıkları sırayla gider. Öncelik yalnız planlar arasında ve dosyalarda uygulanır. Dosyalar kayıtlardan sonra gider. Karar en son gider. |
| Kararın bağları | Her karar, dayandığı değişikliklerin tekrar anahtarlarını taşır. Karar ancak bu değişiklikler ve zorunlu dosyaları sunucuda onaylanınca gönderilir. |
| Gönderici | Uygulama açılınca, internet gelince, sekmeye ya da uygulamaya dönülünce ve belirli aralıklarla çalışır. Kullanıcı "Şimdi eşitle" de diyebilir. |
| Sekmeler | Web'de yazma işini tek bir sekme yapar. Öteki sekmeler ona iletir. |
| İki kayıt durumu | Önce "Cihaza kaydedildi" görünür. Sunucu onaylayınca "Kurumda kaydedildi" görünür. |
| Durum çubuğu | Son eşitleme zamanı, bekleyen değişiklik sayısı ve çakışma sayısı görünür. |
| İnternetsiz hazırlık | Kullanıcı internetsiz kullanacağı planları seçer. Cihaz bunları indirir. Ekran "İnternetsiz kullanıma hazır" der. |
| Kalıcı depo | Web'de uygulama tarayıcıdan kalıcı depo izni ister. Dosya almadan önce boş yeri tahmin eder. |
| Değişiklik zamanı | Kaydın sunucudaki değişiklik zamanı düz metin olarak saklanır. Frappe zamanı mikro saniyeye kadar karşılaştırır. |
| Erişim anahtarı | Cihaz her istekte erişim anahtarını gönderir. Anahtarın süresi dolunca cihaz anahtarı yeniler ve isteği yeniden dener. Çerez ve sahte istek anahtarı kullanılmaz. |
| Sabah başlangıcı | Uygulama eşitlemeyi rastgele kısa bir gecikmeyle başlatır. Böylece gece yayından sonra bütün cihazlar aynı anda bağlanmaz. |

Yerel depo ortama göre değişir:

| Ortam | Yerel depo | Şifreleme |
|---|---|---|
| Web ve PWA | IndexedDB. Kitaplık olarak Dexie.js kullanılır. | Tarayıcının sakladığı anahtar |
| Mobil uygulama | SQLite. Capacitor'ın topluluk eklentisi kullanılır. | SQLCipher ve telefonun güvenli kasası |

**Neden mobilde SQLite?** Capacitor'ın kendi belgesine göre telefonda yer azalırsa iPhone web görünümünün verisini silebilir. IndexedDB de bundan etkilenir. Bu durumda gönderilmemiş değişiklikler kaybolur. SQLite dosyası bu silmeden etkilenmez. Önceki "yerel SQL şimdilik gerekmez" kararı web için geçerli kalır. Mobil için geçersiz olur.

### 8.2. Uygulama kabuğu

Ön yüz artık kurum sitesinden açılmaz. İki ortamda iki ayrı yol vardır:

| Ortam | Uygulama dosyaları nereden gelir? | İnternetsiz açılış |
|---|---|---|
| PWA | Merkezi bir uygulama adresinden. Örneğin `app.alanadi.com`. | Servis işçisi dosyaları önbellekte tutar. |
| Mobil uygulama | Uygulama paketinin içinden ya da imzalı uzaktan web paketinden | Dosyalar zaten telefondadır. Servis işçisi gerekmez. |

Servis işçisi uygulamanın internetsiz açılmasını sağlar. Ön yüz artık Frappe'nin `/assets/` yolundan sunulmaz. Bu yüzden önceki "servis işçisini kök yoldan sunma" sorunu ortadan kalktı.

Servis işçisinin güncellenmesi üç kurala uyar:

1. Yeni sürüm, açık bir form kaydedilmeden zorla devreye girmez.
2. Önceki ekran paketleri uyumluluk penceresi boyunca indirilebilir kalır.
3. Aynı oturumda eski ve yeni dosyalar karışmaz.

Mobil uygulama, kurum sitesini uzaktan açan bir kabuk olmaz. Capacitor'ın uzak adres ayarı yalnız geliştirme içindir. Apple da mağaza uygulamasının paketlenmiş bir siteden fazlasını sunmasını bekliyor. Bu üründe o fazlalık bellidir: internetsiz kanıt toplamak ve kesintiden sonra çalışmayı sürdürmek.

### 8.3. Sunucu uçları

| Uç | Ne yapar? |
|---|---|
| Bağlan | Cihaz desteklediği API ve biçim sürümlerini bildirir. Sunucu beş bilgi döner: kabul ettiği sürümler, kullanılabilir işlemler, açık özellik anahtarları, geçerli ayar sürümü ve akış dönemi. |
| Gönder | Bir değişiklik grubunu alır. Her değişiklik için sonuç döner: yazıldı, çakıştı ya da reddedildi. |
| Çek | Bir planın son sıra numarasından sonraki değişikliklerini döner. Silinen kayıtlar da gelir. |
| Baştan indir | Bir planın bütün kayıtlarını döner. Rapor anlık görüntüleri gelmez. |
| Dosya yükle | Kanıt dosyasını parça parça alır. Sunucunun kaç bayt aldığını söyler. |

Cihaz her istekte iki sürüm bilgisi gönderir: web paketinin sürümü ve kabuğun sürümü. Cihazın bildirdiği yetenek kimseye yetki vermez.

Gönder ucunda her değişiklik şu sırayla işlenir:

1. Sunucu cihazın ve kullanıcının iptal edilip edilmediğine bakar.
2. Sunucu tekrar anahtarıyla bir İşlenen Değişiklik kaydı açmayı dener. İçerik özeti ham içerikten ve biçim sürümünden hesaplanır. Kayıt zaten varsa sunucu özete bakar. Özet aynıysa önceki sonucu döner. Özet farklıysa reddeder.
3. Sunucu istemcinin uyumluluk penceresinde olduğuna bakar. Değişiklik eski biçimdeyse çeviriciyle yeni biçime çevirir.
4. Sunucu bir ara kayıt noktası koyar.
5. Sunucu kullanıcının izinlerine bakar.
6. Sunucu cevabı süreç tanımına göre denetler.
7. Sunucu kaydın değişiklik zamanını karşılaştırır. Kayıt bu arada değiştiyse "çakışma" döner.
8. Sunucu değişikliği yazar. Olaylar aynı işlemde çalışır.
9. Bir hata olursa sunucu ara kayıt noktasına döner. Değişikliğin sonucu "reddedildi" olur.
10. Sunucu sonucu İşlenen Değişiklik kaydına yazar.

**Özet neden çeviriden önce hesaplanır?** Bir cihaz aynı değişikliği gece yayından önce ve sonra gönderebilir. Çeviriciler bu arada değişmiş olabilir. Özet çeviriden sonra hesaplansaydı aynı değişiklik farklı özet verirdi. Sunucu da onu reddederdi.

Beş kural bu işi güvenli tutar:

1. Ara kayıt noktası içinde dosya yazılmaz. Ara kayıt noktası içinde işlem sonrasına görev de eklenmez. Akış numaralarını tek bir istek düzeyi adım verir. Bu adım ara kayıt noktalarının dışında kaydedilir. 8.4 bölümüne bakın.
2. Gruplar küçük tutulur. Örneğin en çok 50 değişiklik.
3. Kayıtlar her zaman aynı sırayla kilitlenir. Sunucu ilk ara kayıt noktasından önce gruptaki bütün planların kayıtlarını kimlik sırasıyla kilitler. Akış başlıkları en son, yine kimlik sırasıyla kilitlenir.
4. Veritabanı iki işlemin birbirini beklediğini görürse bütün işlemi geri alır. O zaman sunucu bütün grubu yeniden dener. Tekrar anahtarı bu denemeyi güvenli yapar.
5. Sunucu istek hızını kullanıcıya ve cihaza göre sınırlar.

### 8.4. Değişiklik akışı

Cihaz "son aldığım yerden sonrasını ver" der. Her planın kendi sıra numarası vardır. Numara şu yolla verilir:

1. İşlem bitmeden hemen önce tek bir istek düzeyi adım çalışır. Frappe'de bu adım `before_commit` aşamasıdır.
2. Bu adım işlemin dokunduğu bütün planların Akış Başlığı satırlarını kimlik sırasıyla kilitler.
3. Adım her planın sayacını bir artırır.
4. Adım işlemde o plana ait bütün akış satırlarına bu numarayı yazar.
5. İşlem biter ve kilitler açılır.

Böylece bir plandaki numara sırası, işlemlerin bitiş sırasıyla aynı olur. Frappe'nin değişiklik zamanı bu iş için güvenilir değildir. Uzun bir işlem, sonra başlayan işlemden sonra bitebilir.

**Neden her plan için ayrı sayaç?** Tek bir genel sayaç, bütün planların yazmalarını aynı kilitte bekletirdi. Planlar birbirinden bağımsızdır. Cihaz da akışı zaten plan plan çeker. Bu yüzden her planın kendi sayacı yeter.

Akış satırları Frappe'nin kayıt olaylarından yazılır. Böylece Frappe ekranından ve komut satırından yapılan yazmalar da akışa düşer. Akış satırları en az 7 gün saklanır.

Plana bağlı olmayan kayıtlar akışa girmez. Örneğin cihaz bilgisi. Bu bilgiler cihaza bağlanırken anlaşmada gelir.

### 8.5. Çakışma

Birleştirmenin birimi alandır. Satır listesi olan alanlarda birim satırdır.

1. Cihaz her değişiklikle kaydın son gördüğü değişiklik zamanını gönderir.
2. Kayıt bu arada değiştiyse sunucu "çakışma" der ve güncel kaydı döner.
3. Cihaz üç kopyayı karşılaştırır: eski kopya, sunucunun kopyası ve cihazın kopyası.
4. Bir alanı yalnız bir taraf değiştirdiyse cihaz birleştirir.
5. İki kişi aynı listeye farklı satır eklediyse cihaz iki satırı da tutar.
6. İki taraf aynı alanı ya da aynı satırı değiştirdiyse cihaz çakışma ekranını açar. Kullanıcı seçer.
7. Bir taraf kaydı sildiyse ve öteki değiştirdiyse cihaz çakışma ekranını açar.
8. Birleştirilen değişiklik yeni bir tekrar anahtarıyla gider. Cihaz, bu değişikliğe dayanan kararlardaki eski anahtarı yeni anahtarla değiştirir.

Kanıt sürümlerinde çakışma şöyle çözülür. İki kişi aynı kanıtı internetsiz düzeltirse ikisi de aynı sürüm numarasını ister. Sunucu ilkini yazar. İkincisine "çakışma" der. Kullanıcı iki sürümü görür ve birini seçer ya da birleştirir. Sonuç yeni bir sürüm olur.

Yazılım hiçbir değişikliği sessizce silmez. Gözlem, Hedef, Kaynak Hareketi ve Olay Kaydı yalnız eklendiği için çakışmaz.

### 8.6. Kararlar ve dosyalar

**Kararlar:**

1. Karar sahibi kararı internetsiz yazabilir. Karar "gönderilmeyi bekliyor" durumunda kalır.
2. Bağlantı gelince önce kararın dayandığı değişiklikler ve zorunlu dosyalar gider. Sunucu hepsini onaylayınca karar gider.
3. Sunucu 7.2 bölümündeki "Kararı onayla" akışını çalıştırır.
4. Kurallar geçmezse karar taslakta kalır. Ekran sunucunun nedenini gösterir.
5. Bir gözlemin sunucuya ulaşması onay sayılmaz. Onayı karar sahibi ayrıca verir.
6. Sunucu bekleyen bir taslağı hiçbir zaman kendiliğinden onaylanmış karara çevirmez.

Kalan deneme hakkı yalnız onaylı kararlardan sayılır. Üç iş internetsiz hiç yapılamaz: izin, rol ve eşitleme ayarı değişikliği.

**Dosyalar:**

Frappe 16'nın kendi parça parça yükleme özelliğini kullanmıyoruz. Kaynak kodda üç sorun var:

1. Aynı adlı dosyaların parçaları karışabilir.
2. Tekrar gönderilen parça dosyayı bozar.
3. Sunucuya "kaç bayt aldın?" diye sorulamaz.

Bu yüzden kendi yükleme ucumuzu yazarız:

1. Her yüklemenin bir Yükleme Oturumu kaydı olur.
2. Uç, aldığı bayt sayısını söyler. Cihaz kaldığı yerden sürdürür.
3. Sunucu dosya bitince boyutu ve içerik özetini denetler.
4. Kanıt dosyaları her zaman özel dosyadır. Giriş yapmadan açılamaz.

Kanıt sürümünün metni ve dosyası ayrı durum taşır. Örneğin sürüm kaydı sunucuya ulaşmışken dosya hâlâ bekleyebilir. Dosyası zorunlu olan kanıt, dosya tamamlanana kadar kapı ölçütünde sayılmaz.

### 8.7. Uzun kesinti ve üyelik değişikliği

| Durum | Ne olur? |
|---|---|
| Kesinti 2 günden kısa | Yalnız değişiklikler gönderilir ve alınır. |
| Kesinti 2 günden uzun | Önce bekleyen değişiklikler gider. Sonra plan baştan iner. Bekleyen ve çakışan değişiklikler korunur. |
| Kullanıcı bir plana yeni üye oldu | Cihaz o planı baştan indirir. |
| Kullanıcının bir plandaki üyeliği kalktı | Yalnız o planın yerel kopyası silinir. Gönderilmemiş değişiklikler önce gönderilir ve incelemeye ayrılır. Öteki planlar açık kalır. |

### 8.8. Sürüm farkı ve uyumluluk penceresi

Aynı anda üç sürüm yaşar:

| Parça | Ne zaman güncellenir? | Ne kadar eski kalabilir? |
|---|---|---|
| Sunucu | Her gece | Bir gün |
| Uzaktan gelen web paketi | Uygulama açılınca | Kullanıcı uygulamayı açmazsa günlerce |
| Kabuk | Mağaza onayıyla | Kullanıcı güncellemezse haftalarca |

Bu yüzden sunucu eski istemcileri belirli bir süre kabul eder. Bu süreye uyumluluk penceresi denir. Pencere 30 gündür ya da son iki mağaza sürümünü kapsar. Hangisi uzunsa o geçerlidir.

Pencere altı kuralla korunur:

1. **Bağlanırken anlaşma.** Cihaz bağlanınca sürümlerini bildirir. Sunucu kabul ettiği sürümleri ve kullanılabilir işlemleri döner. Cihaz yalnız bu işlemleri açık gösterir.
2. **İki adımlı veritabanı değişikliği.** Önce yeni alan eklenir. Eski alan ancak pencere kapanınca kaldırılır. Aynı gece hiçbir alan kaldırılmaz.
3. **Çeviriciler.** Sunucu eski biçimdeki değişikliği yeni biçime çeviren küçük çeviriciler tutar.
4. **Pencere dışındaki istemci.** Bu istemci reddedilir. Ancak bekleyen değişiklikleri kaybolmaz. Uygulama güncellenince giden kutusunu önce cihazda yeni biçime çevirir. Bu iş için yeni uygulama da kendi çeviricilerini taşır. Sonra değişiklikler gönderilir.
5. **Özellik anahtarları.** Yeni bir özellik önce sunucuda kapalı çıkar. Sonra kurum bazında açılır. Böylece gece yayını ile özelliğin açılması ayrılır.
6. **Kural sürümü.** Her kararın içine kural sürümü yazılır. 7.1 bölümüne bakın.

**Ters fark da olur.** Bir dalga başarısız olursa bazı kurumlar eski sunucuda kalır. Yeni uygulama sürümü o sunucuya bağlanabilir. Bağlanırken anlaşma bu durumu da çözer. Uygulama, eski sunucunun desteklemediği işlemleri kapalı gösterir.

**Geri dönüşte önce en hafif yol seçilir.** Sıra şöyledir:

1. Sorunlu özellik, özellik anahtarıyla kapatılır.
2. Gerekirse uygulama uyumlu eski web paketine döner.
3. Veritabanı yedeğine ancak son çare olarak dönülür. O zaman önce yazma durdurulur. Aradaki işlemler kayıt altına alınır ve sonra uzlaştırılır. Başarılı müşteri yazıları yedekle ezilmez.

**Yedekten dönüşte cihazlar ne yapar?** Yedek, akış sayaçlarını ve tekrar tablosunu da geriye götürür. Cihazların sıra numaraları sunucunun önünde kalır. "Kurumda kaydedildi" görünen bazı değişiklikler sunucuda artık yoktur. Bu yüzden sunucu yedekten dönünce akış dönemini değiştirir. Bağlan ucu bu dönemi döner. Dönem değişmişse cihaz iki iş yapar:

1. Planları baştan indirir.
2. Son 7 günde onaylanan değişikliklerini aynı tekrar anahtarlarıyla yeniden gönderir.

Cihaz bu iş için onaylanan değişiklikleri 7 gün daha saklar. Sunucuda zaten olan değişiklik tekrar anahtarı sayesinde ikinci kez yazılmaz.

## 9. Kurumlar ve güvenlik

### 9.1. Her kuruma ayrı site

Her kurum kendi alt alan adında çalışır. Örneğin `kurum-a.alanadi.com`. Her sitenin kendi veritabanı vardır.

Ön yüz artık kurum sitesinden açılmaz. Ön yüz ya merkezi uygulama adresinden ya da telefondan açılır. Bu yüzden kullanıcının kurumu şöyle bulunur:

1. Kullanıcı kurum kodunu ya da e-postasını yazar.
2. Kurum kodu yazıldıysa dizin kurumun site adresini döner.
3. E-posta yazıldıysa dizin giriş bağlantısını e-postaya gönderir. Kullanıcı bağlantıyı telefonda açar.
4. Cihaz kurum sitesine bağlanır ve girişi başlatır.
5. Cihaz kurumun adresini saklar. Sonraki açılışta dizine yeniden sormaz.

Sunucu kurumu adresten, kişiyi erişim anahtarından belirler. Cihazın gönderdiği kurum ya da kişi adı yetki vermez.

Her kurum sitesi yalnız bilinen ön yüz adreslerinden gelen isteklere izin verir. Bu adresler merkezi uygulama adresi ve mobil uygulamanın adresleridir. Yıldız işareti, yani herkese izin, kullanılmaz.

GitHub Pages'deki bugünkü sürüm tanıtım sürümü olarak kalır. Bu sürüm yalnız örnek planla çalışır.

### 9.2. Bugünkü planlar nasıl taşınır?

1. Kullanıcı GitHub Pages sürümünde planını JSON dosyası olarak indirir.
2. Kullanıcı yeni uygulamada kurumuna giriş yapar ve dosyayı içe alır.
3. Yazılım her eski kimliğe yeni bir UUID verir. Kimliğe bağlı bütün alanları da günceller.
4. Yazılım planı sunucuya ilk kez yükler. Planın karar sahibi giriş yapan kullanıcı olur.
5. Eski kararlar geçmiş olarak okunur. Kurum yeni kararlar için kendi izinlerini yeniden verir.

### 9.3. Güvenlik kuralları

**Giriş.** Bütün istemciler aynı giriş yolunu kullanır: OAuth 2 ile erişim anahtarı. Frappe bunu destekliyor. Giriş şu adımlarla yapılır:

1. Cihaz girişi kurum sitesinin giriş sayfasında başlatır.
2. Mobilde giriş sayfası uygulamanın içinde değil, telefonun kendi tarayıcısında açılır. Bu, yerli uygulamalar için önerilen standart yoldur (RFC 8252).
3. Giriş PKCE ile korunur. PKCE, giriş isteğini başlatan cihaza bağlayan bir doğrulamadır.
4. Giriş bitince tarayıcı kullanıcıyı uygulamaya geri döndürür. Dönüş adresi sunucuda izin listesinde durur.
5. Sunucu kısa ömürlü bir erişim anahtarı ve bir yenileme anahtarı verir.

Uygulamanın içine hiçbir gizli anahtar gömülmez.

| Konu | Kural |
|---|---|
| Anahtarın saklanması | Mobilde erişim ve yenileme anahtarı telefonun güvenli kasasında durur. Örneğin iPhone'da Keychain. Web'de erişim anahtarı bellekte tutulur. |
| Web'de sayfa yenilenince | Uygulama girişi kısa bir yönlendirmeyle yeniler. İnternet yokken yerel veri yine açılır. Gönderim, giriş yenilenince başlar. |
| Oturum süresi | Kullanıcı 7 günde bir yeniden giriş yapar. Bekleyen değişiklikler kaybolmaz. |
| Yerel şifreleme | Web'de tarayıcı bir anahtar üretir. Anahtar dışa aktarılamaz. Anahtar ile veri aynı IndexedDB veritabanında durur. Mobilde SQLite dosyası SQLCipher ile şifrelenir. Anahtar güvenli kasada durur. |
| Şifrelemenin sınırı | Cihazı açık bulan kişi uygulamayı açıp veriyi görebilir. Bu sınırı karar sahibi kabul etti. |
| Anahtar kaybı | Şifre çözülemezse yazılım veriyi silmez. Kullanıcıya gösterir. |
| Çıkış | Yerel veri silinir. Gönderilmemiş değişiklik varsa uygulama önce uyarır. |
| Ortak bilgisayar | "Ortak cihaz" modunda veri tarayıcıda saklanmaz. Bu modda internetsiz çalışılamaz. |
| İptal edilen cihaz | Sunucu cihazın anahtarlarını dar bir yetkiye indirir. Cihaz yalnız bekleyen değişikliklerini incelemeye gönderebilir ve silme komutunu alabilir. Planın karar sahibi değişiklikleri inceler. Sonra cihazın yerel verisi silinir. |
| Kimlik alanları | Karar sahibi, onaylayan, ikinci görüş veren, inceleyen ve atayan kişi erişim anahtarından alınır. |
| İzinli adresler | Her kurum sitesi yalnız bilinen ön yüz adreslerine ve dönüş adreslerine izin verir. |
| Kurum dizini | E-postayla gelen istekte adres göstermez. Giriş bağlantısını e-postaya gönderir. İstek hızını sınırlar. |
| Uzaktan web paketi | Paket imzalıdır. Telefon imzasız paketi kurmaz. |
| Gizli bilgiler | Mağaza imza anahtarları, paket imza anahtarları ve üretim erişimleri depoya girmez. |
| Sunucu denetimi | Sunucu her kuralı ve her izni yeniden denetler. Cihaza güvenmez. |

## 10. Ön yüz

### 10.1. Ön yüzde yapılacak değişiklikler

Arka yüz, ön yüzde de değişiklik ister. Bunlar bu deponun işidir.

| Değişiklik | Neden? |
|---|---|
| Veriyi localStorage yerine depo bağdaştırıcısında saklamak | localStorage en çok 5 MB tutar ve eşitlemeye uygun değildir. Web'de IndexedDB, mobilde SQLite kullanılır. |
| Giden kutusu, gönderici, durum çubuğu ve çakışma ekranı | Eşitleme için gerekir. |
| Bağlanırken sürüm anlaşması | Uygulama yalnız sunucunun desteklediği işlemleri açık gösterir. |
| OAuth ile giriş, PKCE ve kurum dizini ekranı | Ön yüz artık kurum sitesinin adresinde değildir. |
| Kurum başına ayrı yerel veritabanı | Kurumların verisi aynı cihazda karışmaz. |
| Strateji belgesinin onayını ayrı bir karara çevirmek | Bugün onay Adım 20'deki bir metin alanıdır. Onay alanı Adım 20'nin bitme koşulundan çıkar. Strateji oluşturmanın bitip bitmediği Karar modülünden okunur. `strategyDone`, `strategyReopened` ve `dossierComplete` işlevleri yeniden yazılır. |
| Kaynak İzni ve Kaynak Hareketi ekranları | Para ancak açık bir izinle harcanır. Gerçek kullanım ayrı kaydedilir. |
| Hedef ve Gözlem ekranları | Gerçekleşen değer hedeften ayrı tutulur. 3.1 adımındaki hedef değeri Hedef kaydına taşınır. |
| Kanıtın sürüm geçmişi | Kanıt düzeltilince eski sürüm okunabilir kalır. |
| Karar sahibi ve ikinci görüş alanlarını kullanıcıya bağlamak | Bugün bu alanlar serbest metindir. |
| `uid()` işlevinin UUID üretmesi | Bugün kimlikler "plan-..." biçiminde. Frappe 16 UUID olmayan adı reddeder. |
| Satır listelerinde kalıcı satır kimliği | Bazı eski satırlar sıra numarasıyla kimlik alıyor. Hedef ve izin bu satırlara bağlanır. |
| Merkezi uygulama adresi için yapı ve Capacitor paketi | Bugün yapının taban yolu GitHub Pages adresine göre sabit. |
| Sekmeler arası haberleşmenin değişmesi | Bugün `SyncGuard` localStorage olaylarını dinliyor. IndexedDB'ye geçince bu olay gelmez. |
| Koşullu iznin Kaynak İzni'ne taşınması | Bugün koşullu izin kararın içinde duruyor. |
| Kararda "gönderilmeyi bekliyor", "sunucu reddetti" ve "kurallar güncellendi" durumları | Bugün kararın böyle bir durumu yok. |
| Rol kısıtları | Örneğin stratej ve okur için karar düğmesi kapanır. |
| Yönetici raporunda üç soru | Rapor üç soruyu cevaplar. Sorular aşağıdaki tablodadır. |
| Gözden geçirmede sapmanın nedeni | Karar sahibi önce nedeni seçer. Ekran nedene uygun kararı önerir. Kararı yine karar sahibi verir. |
| İnternetsiz hazırlık ekranı | Kullanıcı internetsiz kullanacağı planları seçer. |
| Süreç tanımını JSON dosyasına çıkaran betik | Sunucu aynı tanımı kullanır. |
| Kural örnek dosyasını üreten betik | Python kuralları aynı sonucu vermelidir. |
| API sözleşmesinden üretilen TypeScript istemcisi | Ön yüz ile arka yüz aynı sözleşmeyi okur. |

Yönetici raporunun üç sorusu şu kayıtlara dayanır:

| Soru | Dayandığı kayıt |
|---|---|
| Neyi seçtik? | 2.4 adımı ve Strateji Onayı |
| Gerçekte ne oldu? | Gözlem ve Kaynak Hareketi |
| Şimdi neyi değiştireceğiz? | Strateji Gözden Geçirme. Henüz karar yoksa açık soru görünür. |

### 10.2. Başsız ön yüz ve API sözleşmesi

Ön yüz yalnız API'ye bağlıdır. Bu yüzden API bir sözleşme olarak yazılır. Sözleşme depodaki sözleşmeler klasöründe durur. Sözleşmeden TypeScript istemcisi otomatik üretilir.

Sözleşme değişince iki kural geçerlidir:

1. Eski istemcinin kullandığı bir alan, uyumluluk penceresi kapanmadan kaldırılmaz.
2. Bir uyumluluk testi, eski istemcinin isteklerini yeni sunucuya gönderir. Test kırılırsa yayın yapılmaz.

### 10.3. Uzaktan değişikliğin üç katmanı

Küçük mobil değişiklikler mağazaya gitmeden dağıtılır. Ancak her değişiklik aynı yoldan gitmez. Belirleyici soru, değişikliğin telefona ne getirdiğidir.

| Katman | Ne taşır? | Ne zaman kullanılır? | Risk |
|---|---|---|---|
| 1. Sürümlü ayar | Yardım metni, alan sırası, açıklama ve eşik gibi veriler. Kod taşımaz. | İlk tercih budur. Küçük mobil değişikliklerin çoğu bu katmandan gider. | Düşük. Uygulama tanımadığı ayarı atlar. |
| 2. Uzaktan web paketi | JavaScript, HTML ve CSS. Yerli kod taşımaz. | Yalnız hata düzeltmesi için. Yeni işlev için kullanılmaz. | Orta. Mağaza kuralları yoruma açıktır. |
| 3. Mağaza sürümü | Her şey | Yeni işlev, yeni izin ve yeni yerli eklenti | Düşük. Ama mağaza onayı gerekir. |

Örnekler:

| Değişiklik | Hangi katman? |
|---|---|
| Sunucudaki bir rapor hesabı düzeliyor, API aynı kalıyor | Hiçbiri. Gece sunucu yayını yeter. |
| Yardım metni değişiyor | 1. katman |
| Formdaki mevcut alanların sırası değişiyor | 1. katman. Ayar yeni işlem ya da yetki tanımlayamaz. |
| Mobil menüde küçük bir hata düzeltiliyor | 2. katman |
| Yeni bir ekran ya da cihaz izni geliyor | 3. katman |

**Mağaza kuralları.** Apple'ın geliştirici lisans sözleşmesi, sonradan indirilen yorumlanan kodu bir koşulla kabul eder. Kod, uygulamanın ana amacını değiştirmemelidir. Apple'ın inceleme kılavuzunda iki kural daha var. 2.5.2 kuralı işlev ekleyen ya da değiştiren kodun indirilmesini sınırlar. 2.5.19 kuralı gizli işlevleri yasaklar. Google Play, Play dışından çalıştırılabilir kod indirilmesini yasaklar. Web görünümünde çalışan JavaScript bu yasağın dışındadır.

Sürümlü ayar için dört kural geçerlidir:

1. Ayar, sürümlü bir veri biçimine uyar.
2. Ayar üzerinden kod çalıştırılmaz.
3. Her ayar sürümü kuruma, uygulama sürümüne ve izinli alan listesine bağlanır.
4. Eski ayara dönüş ayrıca sınanır.

Uzaktan web paketi için dört kural geçerlidir:

1. **Kanallar kabuk sürümüne bağlanır.** Her web paketi hangi kabuk sürümüyle çalıştığını bilir. Yeni yerli eklenti isteyen paket eski kabuğa gönderilmez.
2. **Paketler imzalanır.** Telefon imzasız paketi kurmaz.
3. **Kendiliğinden geri dönüş kurulur.** Yeni paket açılışta "hazırım" demezse telefon eski pakete döner.
4. **Paketler dalga hâlinde çıkar.** Önce kullanıcıların küçük bir kısmı alır.

### 10.4. Ortak kod ile ekrana özel kod

Ön yüz dört katmana ayrılır:

| Katman | İçinde ne var? | Ne zaman yüklenir? |
|---|---|---|
| Çekirdek | Veri türleri, kurallar, eşitleme, depo arayüzü, API istemcisi ve tasarım değişkenleri | Her zaman |
| Kabuk | Telefon düzeni ya da geniş ekran düzeni. Gezinme. | Ekranın özelliklerine göre biri yüklenir. |
| Ekranlar | Her sayfanın kodu | Kullanıcı o sayfayı açınca |
| Yerli bağdaştırıcılar | SQLite, güvenli kasa, kamera ve varsa bildirim | Yalnız mobil uygulamada |

Dört kural bu ayrımı korur:

1. Seçim cihaz adına göre yapılmaz. Ekranın genişliğine, giriş yöntemine ve çalışma ortamına göre yapılır.
2. Çekirdek hiçbir ekran kodunu içe aktaramaz. Bu kural bir testle denetlenir.
3. Mobil uygulamada bütün kod zaten telefondadır. Bu yüzden ayrımın faydası orada ağ değil, paket boyutudur. Küçük paket uzaktan güncellemeyi hızlandırır.
4. Hangi kodun indirildiği gerçek ağ kaydıyla doğrulanır.

**Ölçüm platforma göre değişir.**

| Platform | Ne ölçülür? | Neyin olmaması gerekir? |
|---|---|---|
| PWA | 320 pikselde, boş önbellekle ilk açılışta indirilen dosyalar | Geniş ekran kodu, stili ve grafik paketi |
| Mobil uygulama | Mağazadan indirilen toplam paket ve açılışta okunan dosyalar, ayrı ayrı | Yalnız masaüstünde kullanılan dosyalar. Bu dosyalar imzalı mobil pakete hiç girmez. |
| Tablet | Aynı mağaza paketi tableti de destekliyorsa geniş görünüm pakette kalabilir. | Telefonda geniş görünümün açılışta çalışması |

Mobilde bir dosyayı geç çalıştırmak, mağaza indirmesini küçültmez. Paket küçülmesi için dosya pakete hiç girmemelidir. iOS ve Android paket listeleri ayrı incelenir.

### 10.5. Tek depo düzeni

Ön yüz, arka yüz ve sözleşmeler tek bir public depoda durur.

| Depodaki yer | İçinde ne var? |
|---|---|
| Kök | Frappe uygulaması. Press uygulamayı doğrudan bu kökten kurar. |
| Ön yüz klasörü | Ortak TypeScript ön yüzü |
| Web girişi | PWA'yı üretir. |
| Mobil girişi | Capacitor ile iOS ve Android paketlerini üretir. |
| Sözleşmeler klasörü | API sözleşmesi, süreç tanımı, kural örnekleri ve uyumluluk testleri |
| Kurum dizini klasörü | Kurum dizininin küçük Frappe uygulaması |
| Yayın tanımı | Jenkinsfile ve paket listesi |

Aynı Git sürümünden dört çıktı çıkar:

1. Bir Frappe paketi
2. Bir PWA
3. İmzalı iOS paketi
4. İmzalı Android paketi

Her çıktının sürümü, dosya özeti ve hedefi kaydedilir. Kurum başına kod dalı açılmaz. Kurum farkları ayar ve yetkiyle karşılanır.

Press'in uygulamayı bu düzenden kurabildiği ilk denemede gösterilmelidir. Kurum dizini ayrı bir depoya gerekirse Press denemesinden sonra taşınır.

## 11. DevOps işleri

Bu işler sunucu, yayın ve alan adı işidir. Sahibi Hüseyin Cengiz'dir. GoDaddy işlerini Asistan Hüseyin yapar. İş sırası şudur:

1. Hüseyin Cengiz teknik bilgiyi yazar. Örneğin DNS kaydının türünü, adını ve değerini yazar.
2. Asistan Hüseyin bu bilgiyi GoDaddy'de uygular.
3. Hüseyin Cengiz sonucu doğrular.

Sunucudaki zamanlanmış işler de DevOps işidir. Sertifika yenilemesi, yedekleme ve gece yayını bu tür işlerdir. Bu işleri Hüseyin Cengiz kurar.

### 11.1. İş listesi

| No | İş | Kim yapar? | Neye bağlıdır? | Ne olunca bitmiş sayılır? |
|---|---|---|---|---|
| 0 | Ana alan adını GoDaddy'den alır. | Asistan Hüseyin | Ana alan adı kararı | Alan adı hesapta görünüyor. |
| 1 | Frappe 16 için gereken Python ve MariaDB sürümünü kurar. | Hüseyin Cengiz | Hiçbir şeye | Frappe 16 deneme sunucusunda açılıyor. |
| 2 | Bütün alt adları sunucuya yönlendiren DNS kaydının bilgisini yazar. Kurum dizini başka sunucudaysa onun kaydını da yazar. | Hüseyin Cengiz | 0. ve 1. iş | Bilgi yazılı olarak Asistan Hüseyin'e verildi. |
| 3 | Bu DNS kayıtlarını GoDaddy'de bir kez açar. | Asistan Hüseyin | 2. iş | Kayıtlar GoDaddy'de görünüyor. |
| 4 | DNS kayıtlarını doğrular. | Hüseyin Cengiz | 3. iş | İki deneme alt adı sunucuya ulaşıyor. |
| 5 | Frappe'de alan adına göre site seçimini açar. | Hüseyin Cengiz | 4. iş | İki deneme sitesi iki farklı adreste açılıyor. |
| 6 | Her siteye Let's Encrypt sertifikası alır. Yenilemeyi kendiliğinden çalışacak şekilde kurar. | Hüseyin Cengiz | 5. iş | İki deneme sitesi güvenli bağlantıyla açılıyor. Deneme yenilemesi hatasız geçiyor. |
| 7 | Press'i kendi sunucumuzda küçük bir denemeyle kurar. | Hüseyin Cengiz | 5. iş | İki deneme kurumu Press'ten açıldı ve güncellendi. |
| 8 | Kurum açma adımlarını yazar. Adımlara sertifika alma ve kurum dizinine kayıt da girer. Her sitede ortak giriş istemcisi, dönüş adresleri ve izinli ön yüz adresleri kurulur. | Hüseyin Cengiz | 6. ve 7. iş | Yeni bir kurum yazılı adımlarla açılıyor. Süre ölçüldü. |
| 9 | Her site için yedek kurar. Yedek özel dosyaları ve sitenin şifreleme anahtarını da kapsar. | Hüseyin Cengiz | 5. iş | Bir sitenin yedeği başka bir sunucuya geri yüklendi ve açıldı. |
| 10 | Deneme dalgası ve üretim dalgaları için ayrı kurulumlar hazırlar. | Hüseyin Cengiz | 7. iş | Bir güncelleme önce deneme dalgasına çıktı. |
| 11 | Jenkins hattını kurar. Hat test eder, paketleri üretir ve imzalar. | Hüseyin Cengiz | 1. iş ve geliştirmenin 3. adımı | Bir kod gönderimi testten paket üretimine kadar ilerledi. |
| 12 | Gece yayınını dalgalarla kurar. Kurallar 11.3 bölümündedir. | Hüseyin Cengiz | 9., 10. ve 11. iş | Bir dalga hata verince sonraki dalga başlamadı. |
| 13 | Geri dönüş adımlarını yazar ve dener. | Hüseyin Cengiz | 12. iş | Bozuk bir güncelleme deneme dalgasında geri alındı. |
| 14 | PWA'yı merkezi uygulama adresinden sunar. | Hüseyin Cengiz | 6. iş | PWA internetsiz açılıyor. |
| 15 | Kurum dizinini kurar. | Hüseyin Cengiz | 6. iş | Bir kurum kodu doğru adrese yönlendi. Bir e-posta doğru giriş bağlantısını aldı. Var olmayan kurum için ekran aynı cümleyi gösterdi. |
| 16 | İstek hızı sınırını kurar. | Hüseyin Cengiz | 5. iş | Yüzlerce eşzamanlı eşitleme isteği siteyi düşürmedi. |
| 17 | Uzaktan güncelleme hizmetini kurar. | Hüseyin Cengiz | 11. iş | Bir web paketi bir deneme telefonuna ulaştı ve geri alındı. |
| 18 | Mağaza imza ve gönderim adımlarını Jenkins'e ekler. | Hüseyin Cengiz | 11. iş ve mağaza hesapları | Bir deneme sürümü TestFlight'a ve Play'in kapalı test kanalına çıktı. |
| 19 | İzleme ve uyarı kurar. | Hüseyin Cengiz | 5. iş | Site kapanınca uyarı geliyor. Sertifika yenilemesi başarısız olunca uyarı geliyor. Sertifikanın bitmesine 14 gün kalınca uyarı geliyor. Gece yayını pencereyi aşınca uyarı geliyor. |
| 20 | Gerçek site sayısı ve veri boyutuyla yayın süresini ölçer. | Hüseyin Cengiz | 12. iş | Bütün hedefler 90 dakikaya sığdı. Ölçüm kuyruğu, denetimi ve geri dönüş payını kapsıyor. |
| 21 | Yayın kurtarma provası yapar. | Hüseyin Cengiz | 12. iş | Jenkins'in yanıtı kaybolunca aynı siteye ikinci geçiş açılmadı. Eski sürüm yeni sitenin üzerine uygulanmadı. |

Apple ve Google geliştirici hesaplarını ürün sahibi kendi şirketi adına açar. Hesap açma işi DevOps işi değildir. İmza anahtarlarını Hüseyin Cengiz depo dışında saklar.

### 11.2. Jenkins ile Press'in görevleri

| Araç | Görevi |
|---|---|
| Jenkins | Yayının tek başlatıcısıdır. Testleri çalıştırır. Web paketini üretir ve imzalar. Mobil kabuğu derler ve mağazalara gönderir. Sonuçları izler. |
| Frappe Press | Kurum sitelerini açar. Arka yüzün sunucu görüntüsünü bir kez üretir. Siteleri dalgalar hâlinde günceller. Yedek alır. |
| Uzaktan güncelleme hizmeti | Web paketini kanallara dağıtır. |
| App Store ve Play Store | Kabuğu dağıtır. |

Codex Press'in kaynak kodunu okudu. Press'te üç kayıt türü bu işi yürütür:

| Press kaydı | Ne yapar? |
|---|---|
| ReleaseGroup | Hangi uygulamaların birlikte çalışacağını tanımlar. Dalgalar bu gruplarla kurulur. |
| DeployCandidate | Kurulacak sürümü sabitler. Sunucu görüntüsü bir kez üretilir. Deneme ve üretim aynı görüntüyü kullanır. |
| SiteUpdate | Bir sitenin güncelleme sonucunu tutar. Sonuçlar: başarılı, eski sürüme döndü ya da elle kurtarma gerekli. |

Yedi kural görevleri ayırır:

1. **Tek başlatıcı.** Yayını yalnız Jenkins başlatır. Jenkins kaynak sürümünü, testleri, pencereyi ve sonuçları izler.
2. **Tek görüntü.** Sunucu görüntüsünü Press bir kez üretir. Jenkins görüntünün kimliğini ve özetini kaydeder.
3. **Tek güncelleyici.** Siteleri Press günceller. Jenkins aynı siteye ayrıca veritabanı güncelleme komutu çalıştırmaz.
4. **Site kilidi.** Her sitede aynı anda tek geçiş çalışır. Önceki gecenin geçişi sürerken yeni sürüm o siteyi alamaz. Eski bir sürüm daha yeni bir sitenin üzerine uygulanamaz.
5. **Uzlaştırma.** Jenkins yeniden başlarsa işi yeniden başlatmaz. Önce Press'e sitenin durumunu sorar.
6. **Tek zamanlayıcı.** İkinci bir zamanlayıcı olmaz. Geç başlayan iş, çalışmadan önce saati yeniden denetler.
7. **Sağlık denetimi.** Press'te başarılı görünen site ayrıca ürünün sağlık işlemleriyle doğrulanır. "Eski sürüme döndü" sonucu teslim sayılmaz.

Press'in kendi sunucumuzda çalıştığı önce küçük bir denemeyle kanıtlanmalıdır. Forum yazılarına göre kendi kurulan Press'te bazı işler elle yapılıyor. Deneme başarısız olursa yedek yol vardır: bench ve Jenkins'le yazılmış yayın adımları.

### 11.3. Gece yayını

Geliştirmeler her gece 02.30 ile 04.00 arasında abonelere uygulanır. Bu pencere dokuz kuralla korunur:

| No | Kural |
|---|---|
| 1 | Yayın dalgalarla yapılır. İlk dalga deneme kurumlarıdır. Sonraki dalga ancak önceki dalga temiz geçerse başlar. |
| 2 | Dalgalar ayrı Frappe kurulumlarında durur. Çünkü bir kurulumdaki bütün siteler aynı kodu kullanır. |
| 3 | Her dalgadan önce yedek alınır. Her dalganın geri dönüş adımı denenmiştir. |
| 4 | Pencere, kurumun saat dilimine göre belirlenir. |
| 5 | Pencere içinde bitmeyen dalga durur. Kalan kurumlar ertesi geceye kalır. |
| 6 | Pencerede bitmeyen veritabanı güncellemesi yarıda kesilmez. Kayıt "pencere aşıldı" olarak kalır. Ertesi gece yalnız eksik siteler alınır. |
| 7 | Kalan süre bir dalganın güvenle bitmesine yetmezse yeni dalga başlamaz. |
| 8 | Sabah eşitlemesi için sunucu istek hızını sınırlar. Cihazlar eşitlemeyi rastgele kısa bir gecikmeyle başlatır. |
| 9 | Değişiklik yoksa yayın yapılmaz. |

**Saat dilimi.** Bu rapor bütün abonelerin Türkiye'de olduğunu varsayar. Bu durumda Jenkins ve Press'te saat dilimi açıkça `Europe/Istanbul` olarak yazılır. Abone başka bir ülkedeyse pencere o kurumun saatine göre kurulur. Kurumun saat dilimi kurum dizininde durur.

**Süre bütçesi.** 90 dakika üç parçaya bölünür. Örneğin hazırlık 10 dakika, geçiş 60 dakika ve kurtarma payı 15 dakikadır. Toplam 85 dakikadır. Bu sayılar örnektir, ölçülmedi. Hüseyin Cengiz gerçek site sayısı ve veri boyutuyla ölçer. Ölçüm büyük verili ve küçük verili kurumları ayrı kapsar.

**Saat 04.00'te yayın ne zaman tamam sayılır?** Jenkins hedef listesini gerçek sürümlerle karşılaştırır. Her abonenin hedef sürümü ve sağlık sonucu kayıtlıysa yayın tamamdır. Bekleyen, geri alınan ya da başarısız site ayrı görünür. Sağlık sonucu dört işlemle ölçülür:

1. Oturum açma
2. Kanıt yazma
3. Aynı isteği tekrar gönderme
4. Rapor okuma

Gece 04.00 hedefi yalnız sunucuları kapsar. Sunucu, telefonun yeni mağaza sürümünü ne zaman kuracağını belirleyemez.

Müşterinin karar ve kanıt içeriği yayın kaydına hiç girmez. Yayın kaydı yalnız sürüm, site ve sonuç tutar.

### 11.4. Mobil dağıtım

| Konu | Kural |
|---|---|
| Uzaktan güncelleme hizmeti | Capgo ya da Capawesome Cloud. Seçim küçük bir denemeden sonra yapılır. |
| Appflow | Seçilmez. Ionic yeni satışı 2025'te durdurdu. Mevcut müşterilerin erişimi 31 Aralık 2027 Cuma günü bitiyor. |
| Mağaza sürümü | Kademeli çıkar. App Store ve Google Play bunu destekliyor. |
| Zaman kaydı | Üç zaman ayrı kaydedilir: mağaza onayı, yayına açılma ve kullanıcının kurması. |
| Kanal | Her uzaktan web paketi, uyduğu kabuk sürümlerinin kanalına gider. |

### 11.5. SSL sertifikası neden basitleşti?

İlk planda bütün alt adları kapsayan tek bir sertifika vardı. Bu tür sertifika her yenilemede yeni bir DNS kaydı ister. Bu yüzden GoDaddy erişim anahtarı ya da ayrı bir doğrulama sunucusu gerekiyordu.

Her kurumun zaten ayrı bir sitesi var. Bu yüzden her siteye normal bir sertifika yeter. Normal sertifika DNS'e dokunmadan yenilenir. Böylece GoDaddy'de yalnız bir kez iş yapılır.

Bu yolun küçük bir bedeli var. Her yeni kurum için sertifika alma adımı kurum açma adımlarına eklenir. Merkezi uygulama adresi ve kurum dizini de kendi sertifikalarını alır.

## 12. Geliştirme sırası

**İlk teslim uçtan uca ince bir akıştır.** 4. ile 11. adımların en ince hâli önce bir arada kurulur. Akış şudur:

1. Karar sahibi geçiş kararını verir.
2. Stratej yolu önerir. Karar sahibi seçer ve strateji belgesini onaylar.
3. Karar sahibi bir kaynak izni açar.
4. Ekip bir gözlemi telefonda internetsiz girer. Bir kaynak kullanımı da kaydeder.
5. Sonuç hedefi tutmazsa karar sahibi gözden geçirme kaydı açar.
6. Rapor üç soruyu cevaplar. Sorular 10.1 bölümündedir.

Bu akış çalışınca adımlar tek tek genişletilir.

Her adımda önce başarısız olan test yazılır. Sonra kod yazılır.

| Adım | İş | Ne olunca bitmiş sayılır? |
|---|---|---|
| 1 | Sürümleri sabitlemek. API sözleşmesinin ilk hâli ve destek tablosu. Küçük bir internetsiz deneme. | Destek tablosu hangi tarayıcının, telefonun ve kabuk sürümünün desteklendiğini yazıyor. İki deneme sitesinde aynı kullanıcı adı farklı yetkilerle çalışıyor. Tek bir taslak kesintiden sonra bir kez ulaşıyor. |
| 2 | Kural ağacı betiği, örnek dosyası ve Python kuralları | Python kuralları bütün örneklerde TypeScript ile aynı sonucu veriyor. 3.1, 3.2 ve 3.3 için koruma testleri geçiyor. |
| 3 | Tek depo düzeni, Frappe uygulama iskeleti, altı modül ve dört bağ denetimi | Bilerek yazılan yasak bir içe aktarma denetimi kırıyor. Press uygulamayı depo kökünden kuruyor. |
| 4 | Erişim modülü, OAuth ile giriş, PKCE ve kurum dizini | A kurumunun üyesi B kurumunun planını açamıyor. Okur rolü karar kaydedemiyor. Telefon girişi telefonun tarayıcısında yapılıyor. |
| 5 | Plan modülü, kanıt sürümleri, hedefler ve gözlemler | Hedef 5, gerçekleşen 8 dakika olarak ayrı görünüyor. Kanıt düzeltilince yeni sürüm ekleniyor ve eski sürüm okunuyor. Düzeltilen gözlem iki kez sayılmıyor. |
| 6 | Eşitleme uçları, bağlanırken anlaşma, tekrar tablosu, akış başlığı ve değişiklik akışı | Aynı değişiklik iki kez gönderilince bir kez yazılıyor. İki eşzamanlı işlemde hiçbir akış satırı kaçmıyor. Reddedilen değişiklik ötekileri geri almıyor. Eski biçimdeki değişiklik çeviriciyle yazılıyor. Aynı değişiklik yayından sonra tekrar gelince aynı özeti veriyor. Yedekten dönüşte akış dönemi değişiyor ve cihaz baştan indiriyor. |
| 7 | Ön yüzde depo bağdaştırıcısı, giden kutusu, durum çubuğu ve dosyayla taşıma. PWA ve Capacitor deneme paketleri. | İnternet kesilip gelince bütün değişiklikler sunucuya ulaşıyor. Bugünkü bir plan dosyası kayıpsız taşınıyor. Aynı kod web'de IndexedDB, telefonda SQLite kullanıyor. |
| 8 | Karar modülü: kapılar, geçiş, strateji onayı ve dayanaklar | Kurala uymayan karar taslakta kalıyor. Karar, okuduğu kanıt sürümlerini, değerleri ve kural sürümünü saklıyor. |
| 9 | Kaynak izni, kaynak hareketi, stratejinin yeniden açılması ve yeniden onayı | İki eşzamanlı izin aynı bütçeyi aşamıyor. Aynı ödeme iki farklı istekle bir kez sayılıyor. Kapalı izne gelen hareket incelemeye ayrılıyor. "Yeniden aç" izinleri açık bırakıyor. Yeni onay eski onaya bağlı izinleri kapatıyor. Aynı kapıya yeni karar eski koşullu izni kapatıyor. |
| 10 | Çakışma ekranı, dosya yükleme, uzun kesinti ve cihaz iptali | Aynı alanı değiştiren iki kullanıcı çakışma ekranını görüyor. Kesilen yükleme kaldığı yerden sürüyor. İptal edilen cihaz yalnız bekleyen değişikliklerini gönderebiliyor ve silme komutunu alıyor. |
| 11 | Raporlar ve anlık görüntüler | Sabitlenmiş raporun dayanağı sunucunun verisiyle aynı. Yeni bilgi eski raporu değiştirmiyor. |
| 12 | Ön yüzde dört katman, sürümlü ayar ve paket ölçümü | 320 pikselde ilk açılışta geniş ekran kodu inmiyor. Masaüstü dosyası imzalı mobil pakete girmiyor. Bir yardım metni ayarla değişiyor. |
| 13 | Jenkins ve Press ile iki deneme sitesinde gece yayını | Bir güncelleme iki siteye dalgayla çıkıyor. Bozuk güncelleme ikinci dalgayı durduruyor. Uzaktan web paketi bir deneme telefonuna ulaşıyor ve geri alınıyor. |
| 14 | Kabul senaryosu, ters hâli, eski cihaz senaryosu ve kesinti provası | 12.1 bölümündeki senaryolar geçiyor. Tarayıcı kapatma, internetsiz açılış, çakışma, silme, üyelik iptali ve kaybolan yanıt sınamaları geçiyor. Testler yavaş ve kopan bir hatta da geçiyor. |
| 15 | Yayın süresi ölçümü, kurum açma ve yayın | Yayın gerçek sayılarla 90 dakikaya sığıyor. İki gerçek kurum ayrı adreslerde çalışıyor. Birinin verisi ötekinde görünmüyor. |

### 12.1. Kabul senaryoları

Mimari bu senaryoları geçmeden toplu yayına hazır sayılmaz.

**Gece yayını senaryosu:**

1. Bir girişimci saat 02.25'te telefonunda bir kanıt kaydeder. Telefon internetsizdir.
2. Kurumun sunucusu saat 03.10'da güncellenir.
3. Telefon sabah internete bağlanır.
4. Kanıt sunucuya yalnız bir kez kaydedilir.
5. Eski uygulama sürümü kanıtı sessizce kaybetmez.
6. Yeni sunucu, bekleyen bir taslağı kendiliğinden onaylanmış karara çevirmez.

**Ters senaryo.** Yeni uygulama sürümü, henüz güncellenmemiş bir kurum sunucusuna bağlanır. Uygulama yine çalışır. Sunucunun desteklemediği işlem ekranda kapalı görünür.

**Eski cihaz senaryosu.** Bir telefon uzun süredir güncellenmemiştir. Giden kutusunda eski biçimde değişiklikler vardır. Telefonun sürümü uyumluluk penceresinin içindeyse sunucu değişiklikleri çeviriciyle yazar. Sürüm pencerenin dışındaysa sunucu güncelleme ister. Değişiklikler yine kaybolmaz. Uygulama güncellenince giden kutusunu cihazda yeni biçime çevirir ve gönderir.

## 13. Riskler

| Risk | Ne olabilir? | Önlem |
|---|---|---|
| Kurallar iki dilde ayrılır | Cihaz "İlerle" önerir, sunucu reddeder. | Ortak örnek dosyası. Yayın ancak iki taraf aynı sonucu verince yapılır. |
| Sürüm farkı | Eski uygulama yeni sunucuya değişiklik gönderir. Değişiklik reddedilir ya da yanlış okunur. | Uyumluluk penceresi, bağlanırken anlaşma, çeviriciler ve iki adımlı veritabanı değişikliği |
| Uzaktan güncelleme mağaza kuralını aşar | Mağaza uygulamayı kaldırır. | Yeni işlev yalnız mağaza sürümüyle çıkar. Uzaktan web paketi yalnız hata düzeltir. İlk tercih sürümlü ayardır. |
| iPhone yerel veriyi siler | Gönderilmemiş değişiklikler gider. | Mobilde SQLite. Web'de kalıcı depo izni, sık eşitleme ve bekleyen sayının görünmesi |
| Safari'de arka plan eşitlemesi yok | Sayfa kapalıyken veri gitmez. | Uygulama açılınca ve açık kaldıkça eşitleme |
| Gece yayını herkesi etkiler | Tek bir hata bütün aboneleri aynı sabah etkiler. | Dalgalar, deneme dalgası, her dalgadan önce yedek ve geri dönüş adımları |
| Yayın pencereye sığmaz | Bazı siteler yarım güncellenir. | Süre bütçesi, "pencere aşıldı" durumu ve yarıda kesilmeyen veritabanı güncellemesi |
| Sabah eşitleme fırtınası | Bütün cihazlar aynı anda bağlanır ve site yavaşlar. | İstek hızı sınırı ve rastgele başlangıç gecikmesi |
| Press kendi sunucumuzda olgun değil | Yayın aracı beklenen işi yapmaz. | Press denemesi. Başarısız olursa bench ve Jenkins'le yayın adımları |
| Uzaktan güncelleme hizmeti kapanır | Telefonlara düzeltme gönderilemez. | Appflow seçilmez. Hizmet bir denemeden sonra seçilir. Mağaza sürümü her zaman yedek yoldur. |
| Telefondaki anahtar çalınır | Başkası kurum verisine erişir. | Güvenli kasa, kısa ömürlü erişim anahtarı ve cihaz iptali |
| Modüller zamanla birbirine bağlanır | Gevşek bağ kaybolur. | Dört bağ denetimi her kod gönderiminde çalışır. |
| Olay zinciri döngüye girer | Bir olay kendini yeniden tetikler. | Zincir derinliği sınırı |
| Modüller arası bağ veritabanında denetlenmez | Var olmayan bir karara bağlı görev kalabilir. | Her komut işlevi bağı denetler. Plan, kanıt ve kararlar silinmez. Arşivlenir, geri çekilir ya da geçersiz kılınır. |

## 14. Açık kalan konular

Rapor bu konularda önerilerimle ilerler:

| No | Konu | Önerim |
|---|---|---|
| 1 | Tek kurucu ve ikinci görüş | Tek kurucu plana bir danışman ekler. Danışman ikinci görüşü kendi hesabıyla verir. |
| 2 | Ana alan adı | Karar sahibi belirler. DevOps işlerinin 0. adımı bu ada bağlıdır. |
| 3 | Deponun adı ve lisansı | Karar sahibi belirler. Geliştirmenin 1. adımından önce gerekir. Depo public olur. |
| 4 | Yeni onayın ve yeni kararın eski izinleri kapatması | 7.2 bölümündeki kural. Yeniden açma izinleri kapatmaz. Yeni strateji onayı eski kaynak ayırma izinlerini kapatır. Aynı kapıya yeni karar eski koşullu izni kapatır. |
| 5 | Yayın penceresinin saat dilimi | Bütün aboneler Türkiye'deyse `Europe/Istanbul`. Değilse kurumun saat dilimi. |
| 6 | Uyumluluk penceresi | 30 gün ya da son iki mağaza sürümü, hangisi uzunsa |
| 7 | Uzaktan güncelleme hizmeti | Capgo ya da Capawesome Cloud. Seçim küçük bir denemeden sonra yapılır. |
| 8 | Bildirim modülü | Bugün eklenmez. Bir kural bildirime dayanınca yedinci modül olur. |

## 15. Doğrulanması gerekenler

Bu konuları kaynak kodda ya da belgede okudum ya da önerdim. Çalışan bir sunucuda sınamadım.

1. Frappe 16'nın Python 3.14 istemesi kaynak koda dayanıyor. Hüseyin Cengiz bu gereği resmî kurulum belgesiyle doğrulamalı.
2. Frappe'nin `hooks.py` dosyasına kendi olay listemizi eklemek geliştirmenin 3. adımında denenmeli.
3. `import-linter` aracının Frappe uygulamasının klasör yapısıyla çalıştığı 3. adımda denenmeli.
4. Press'in uygulamayı depo kökünden kurabildiği 3. adımda denenmeli. Kurum dizininin aynı depodan kurulup kurulamayacağı da denenmeli.
5. Frappe 16'nın OAuth yapısında PKCE'nin ve 7 günlük yenileme süresinin çalıştığı 4. adımda denenmeli.
6. Web'de erişim anahtarının sayfa yenilenince nasıl geri alınacağı 4. adımda kesinleşmeli.
7. Capacitor uygulamasının istekleri hangi adresle gönderdiği 4. adımda denenmeli. İzinli adres listesi bu adrese göre kurulur.
8. Tarayıcının şifreleme anahtarını IndexedDB'de saklayabildiği Chrome ve Safari'de denenmeli.
9. Capacitor SQLite eklentisinin SQLCipher ile iOS ve Android'de çalıştığı 7. adımda denenmeli.
10. Akış başlığının iki eşzamanlı işlemde doğru çalıştığı 6. adımda denenmeli.
11. Apple'ın uzaktan güncelleme kuralı satıcı bloglarından ve forumlardan okundu. Apple'ın güncel lisans metninden okunmalı.
12. Press'in kendi sunucumuzda nasıl çalıştığı belgeden doğrulanamadı. Bilgi forum yazılarından geliyor. Press'in üç kayıt türünü Codex kaynak koddan okudu. Ben ayrıca okumadım.
13. Capgo ve Capawesome bilgileri satıcıların kendi belgelerinden geliyor.
14. Hüseyin Cengiz, Frappe'nin sertifika komutunun yenilemeyi nasıl kurduğunu doğrulamalı.
15. Frappe 16'nın cihazın seçtiği UUID adını olduğu gibi sakladığı 1. adımda denenmeli.
16. OAuth anahtarının kimliğinin Cihaz kaydına yazılabildiği ve dar bir yetkiye indirilebildiği 4. adımda denenmeli.
17. `before_commit` adımının, geri alınan bir ara kayıt noktasından sonra doğru çalıştığı 6. adımda denenmeli.
18. MariaDB'nin ara kayıt noktasına dönünce kilitleri nasıl tuttuğu 6. adımda denenmeli.
19. Rapor gerçek okurla denenmedi.

## Kaynaklar

**Frappe:**

- [Frappe kaynak kodu](https://github.com/frappe/frappe)
- [Frappe REST API belgesi](https://docs.frappe.io/framework/user/en/api/rest)
- [Frappe site yapısı](https://docs.frappe.io/framework/user/en/basics/sites)
- [Frappe veritabanı işlem modeli](https://docs.frappe.io/framework/user/en/api/database#database-transaction-model)
- [Frappe Event Streaming durumu](https://docs.frappe.io/framework/help/event-streaming)
- [Frappe, OAuth 2 belgesi](https://docs.frappe.io/framework/oauth2)
- [Frappe forumu, React ve mobilde oturum](https://discuss.frappe.io/t/frappe-react-sdk-authentication-error/135818)
- [Frappe forumu, Capacitor ve CORS](https://discuss.frappe.io/t/erpnext-api-connection-issues-from-ionic-capacitor-mobile-app-cors-and-cookies/139290)
- [Frappe forumu, kendi sunucuda Press](https://discuss.frappe.io/t/self-hosted-press-in-production-version-compatibility-and-setup-guidance-needed/164771)
- [Frappe forumu, Press yerine bench](https://discuss.frappe.io/t/guidance-on-self-hosting-frappe-cloud-without-press-cli/141824)
- [Frappe Cloud, bench güncelleme](https://docs.frappe.io/cloud/benches/updating_a_bench)
- [Press, ReleaseGroup](https://github.com/frappe/press/blob/79f4a9301368aa6194a5b148a35a547cc428a1c3/press/press/doctype/release_group/README.md)
- [Press, SiteUpdate](https://github.com/frappe/press/blob/79f4a9301368aa6194a5b148a35a547cc428a1c3/press/press/doctype/site_update/README.md)

**Mobil ve mağazalar:**

- [Capacitor, veri saklama rehberi](https://capacitorjs.com/docs/guides/storage)
- [Capacitor yapılandırması](https://capacitorjs.com/docs/config)
- [RxDB, Capacitor veritabanı rehberi](https://rxdb.info/capacitor-database.html)
- [RFC 8252, yerli uygulamalarda OAuth](https://www.rfc-editor.org/rfc/rfc8252.html)
- [Apple App Store inceleme kılavuzu](https://developer.apple.com/app-store/review/guidelines/)
- [App Store kademeli yayın](https://developer.apple.com/help/app-store-connect/update-your-app/release-a-version-update-in-phases/)
- [Google Play, Device and Network Abuse politikası](https://support.google.com/googleplay/android-developer/answer/9888379?hl=en)
- [Google Play kademeli yayın](https://support.google.com/googleplay/android-developer/answer/6346149?hl=en)
- [Bitrise, Apple ve Google'ın uzaktan güncelleme kuralları](https://bitrise.io/blog/post/what-app-stores-allow-with-ota-updates-apple-and-google-policy-explained)
- [Capgo, Apple ve uzaktan güncelleme](https://capgo.app/blog/do-apple-allow-live-updates/)
- [Capgo, yerli kod ve uzaktan güncelleme uyumluluğu](https://capgo.app/docs/live-updates/compatibility/)
- [Capawesome, uzaktan güncelleme iyi uygulamaları](https://capawesome.io/docs/cloud/live-updates/guides/best-practices/)
- [Ionic, Appflow'un kapanışı](https://ionic.zendesk.com/hc/en-us/articles/29907381079831)
- [web.dev, PWA güncelleme yaşam döngüsü](https://web.dev/learn/pwa/update/)

**Mimari ve saha örnekleri:**

- [Spring Modulith, modül sınırları](https://docs.spring.io/spring-modulith/reference/fundamentals.html)
- [USACE saha değerlendirme belgesi, Ek B](https://www.publications.usace.army.mil/Portals/76/Users/182/86/2486/EC-11-2-218.pdf?ver=2019-09-04-162858-440)
- [NGA MAGE bilgi notu](https://www.nga.mil/assets/files/2024_MAGE_Fact_Sheet.pdf)
- [Codex uygulamasının kayıt modeli](https://github.com/karacaismail/decisionactplancodex/blob/405bbbd/src/domain.ts)
- Öteki kaynaklar [cevrimdisi-calisma-arastirmasi.md](cevrimdisi-calisma-arastirmasi.md) dosyasındadır.
