# Açılan pencere testleri

Bu dosya alt görevin ara raporudur. Son sonuçlar [ana bulgu raporundadır](../mobil-bulgular.md).

İki test `tests/uyarlanir/paneller.spec.ts` dosyasına eklendi. Testleri ana ajan çalıştıracak. Kaynak kod ve ortak ölçüm araçları değiştirilmedi.

## Beklenen davranış

1. “Yeni plan” düğmesi plan penceresini açmalı. Pencerede ad alanı ve işlem düğmeleri bulunmalı. Ad boşken “Oluştur” düğmesi kapalı olmalı.
2. “Ara” düğmesi “Komut paleti” penceresini açmalı. Bu pencere, ekran ve adım aramak için kullanılır. Arama alanı ve sonuç listesi görünmeli. İlk sonuç gerçek bir karar metni içermeli.

Her test, ölçümden önce pencerenin içeriğini doğrular. Test, dokunma açıkken dokunur. Diğer durumlarda fareyle tıklar. Alanla etkileşim, açılış hareketinin bitmesini bekler.

`measurePage`, açık pencereyi içeren sayfayı ölçer. Testler `yazi` ve `tas-ma` bulgularını ayrı ayrı denetler. Görünen yazı en az 14 CSS px olmalı. CSS px, web sayfasında kullanılan piksel birimidir. Sayfanın tamamı yana taşmamalı.

`saveEvidence`, ölçümden sonra ekran görüntüsünü ve ölçüm dosyasını kaydeder. Ölçüm kusurlu olsa da bu dosyalar kaydedilir. Pencere açılamazsa ölçüm aşamasına geçilmez. Bu durumda yapılandırmadaki hata izi kullanılabilir.

## Kaynakta görülen sorun ve sınır

`src/components/CommandPalette.tsx` dosyası pencereye 600 piksel genişlik ve üstten 72 piksel uzaklık veriyor. `src/styles/screens-karar.css` dosyasında telefona özel tam ekran pencere kuralı yok. Mobil teslim planı, telefonda tam ekran komut paleti istiyor. Kaynakta bu koşul eksik görünüyor. Tarayıcıda doğrulanmadığı için bu gözlem test hatası sayılmadı.

Komut paletinin uzun sonuç metinleri üç noktayla kesiliyor. Bu davranış aynı CSS dosyasındaki `white-space: nowrap` ve `text-overflow: ellipsis` kurallarından geliyor. Yeni testler kesilen metinleri veya tam ekran koşulunu denetlemiyor.

Ortak araç, sayfanın kaydırma genişliğini ölçüyor. Bu ölçüm, pencere içinde kırpılan içeriği her zaman göstermez. Ana ajan gerekirse ortak araca pencere sınırı ölçümü ekleyebilir. Mevcut `measurePage` ve `saveEvidence` imzaları korunmalıdır. Bu alt görev ortak aracı değiştirmedi.

## Doğrulama durumu

Bu tablo, testlerin ilk yazımındaki durumu gösterir. Sonradan sağlanan koşu kanıtı, “Ad hatasından sonra ölçüm” bölümünde açıklanır.

| Kontrol | Durum | Açıklama |
|---|---|---|
| Testlerin yazılması | `pass` | İki test eklendi. |
| Tarayıcı testleri | `not_run` | Görev talimatı test çalıştırmayı yasaklıyor. |
| İlk başarısız test sonucu | `not_run` | Testler çalıştırılmadığı için başarısızlık gözlenmedi. |
| Tür denetimi ve derleme | `not_run` | Proje kontrolleri ana ajana bırakıldı. |
| Ekran görüntüsü ve ölçüm dosyası | `not_run` | Testler çalıştırılınca üretilecek. |
| Bağımsız inceleme | `not_run` | Bu alt görev yeni ajan başlatamaz. |
| Gerçek cihaz ve CI | `not_run` | Telefon denenmedi. Otomatik sunucu kontrolleri çalıştırılmadı. |

Testler, mevcut Chromium ve WebKit projelerinin ekran ölçülerini kullanır. İlk kabul genişliği 320 CSS px olmalıdır. Firefox çalıştırılmadı. Sunucu başlatılmadı. Paket kurulmadı.

`package.json`, Playwright için `^1.64.1` sürüm aralığını tanımlar. Kilit dosyası `1.64.1` sürümünü kaydeder. TypeScript aralığı `^5.9.3`, kilit dosyasındaki sürümü `5.9.3` değerindedir. Çalışan Playwright ve TypeScript sürümleri doğrulanmadı. `node --version` çıktısı `v24.21.0` oldu.

Ana ajan testleri proje kökünden şu komutla başlatabilir:

```sh
npm run test:e2e -- tests/uyarlanir/paneller.spec.ts --project=chromium-320 --project=webkit-320
```

Bu komut çalıştırılmadı. Komut, yapılandırmadaki geliştirme sunucusunu başlatır. Diğer genişlikler ilk kabulden sonra denenmelidir.

Rapor için şu metin denetimi çalıştırıldı:

```sh
node /Users/w6x/.claude/skills/coding-standards/scripts/yalin-turkce-denetim.mjs docs/qa/alt-gorevler/07-overlays.md --tur aciklama
```

Denetim sıfır hata ve bir uzun kelime uyarısı verdi. Uyarıdaki günlük kelimeler elle incelendi. Teknik adlar anlamı korumak için bırakıldı. Test kodu elle incelendi. Bu inceleme, tarayıcıda çalıştığını kanıtlamaz.

Gerçek okurla denenmedi.

## Bağımsız ek inceleme

**Adres doğruyken yanlış ekran gösterilirse mevcut test başarılı olabilir.** Bu, kaynak okumasıyla bulunan bir denetim açığıdır. Uygulamanın şu anda yanlış ekran gösterdiği kanıtlanmadı.

`ekranlar.spec.ts` ve `routes.ts` salt okunur karşılaştırıldı. Başlık kontrolünü anlamak için `audit.ts` de okundu. Ekran ve adım kapsamı, ilgili uygulama kayıtlarıyla karşılaştırıldı. Bu ek çalışmada yalnız rapor değiştirildi. Test çalıştırılmadı.

### 1. Yüksek öncelik: Doğru ekran denetlenmiyor

`tests/uyarlanir/ekranlar.spec.ts:11` yalnız beklenen adresi doğruluyor. Ardından `ready` çağrılıyor. `tests/uyarlanir/audit.ts:16`, yalnız ilk `main h1` öğesinin görünmesini bekliyor. Başlığın metnini denetlemiyor.

`ekranlar.spec.ts:14` sayfada ölçülebilen yazı arıyor. Kalan kontroller yazı boyutunu, taşmayı ve dokunma alanlarını denetliyor. Bu kontroller, yazının doğru ekrana ait olduğunu kanıtlamıyor.

Örneğin `/kanitlar` adresinde yanlışlıkla “Geçmiş” ekranı gösterilebilir. Bu, inceleme için varsayılan bir hata örneğidir. Başlık görünürse ve ölçümler uygunsa test başarılı olabilir. `route.screen` değeri, ekrandaki içerikle karşılaştırılmıyor. Bu değer yalnız kanıt dosyasına yazılan kayıtta bulunuyor.

Ekran görüntüsünün kaydedilmesi de yanlış ekranı otomatik olarak reddetmiyor. Testte beklenen görüntüyle karşılaştırma yok. Görüntüyü ayrıca inceleyen kişi hatayı fark edebilir.

### 2. Yüksek öncelik: 42 adımın içeriği doğrulanmıyor

`tests/uyarlanir/routes.ts:172`, `STEP_LIST` içindeki her adım için ayrı adres üretiyor. `routes.ts:24` ile başlayan kontroller, karar ve adım kayıtlarının tutarlılığını denetliyor. Bunlar yararlı kontrollerdir. Ancak tarayıcıda çizilen formu incelemiyorlar.

Örneğin `/karar/1/adim/02` adresinde yanlışlıkla Adım 00 formu çizilebilir. Adres değişmezse mevcut test bu farkı doğrudan yakalamaz. Aynı yanlış form, 42 adım adresinde de ölçümlerden geçebilir. Böylece 42 ayrı adres denemesi, 42 doğru formun kanıtı olmaz.

Karar ve kapı ekranlarında da aynı risk vardır. Adresteki karar numarası doğru kalabilir. Görünen karar veya kapı başka karara ait olabilir.

### 3. Yüksek öncelik: Beklenti hatalı kaynakla birlikte değişebilir

`tests/uyarlanir/routes.ts:48`, adresleri doğrudan uygulamanın rota dosyasından çıkarıyor. Rota, bir adresin hangi ekranı açacağını belirleyen kayıttır. `routes.ts:105`, ekrandaki içeriği değil, kaynakta yazan bileşen adını okuyor.

`routes.ts:106`, bu adın sahip listesinde bulunmasını yeterli sayıyor. Örneğin `/kanitlar` yanlışlıkla `HistoryScreen` bileşenine bağlanabilir. `HistoryScreen` zaten tanındığı için liste üretimi bunu reddetmez. Test de aynı yanlış kayıttan beklenti üretir.

Benzer risk yönlendirmelerde de vardır. `routes.ts:189` ile başlayan bölüm, kaynakta tanımlanan hedefi izliyor. Hedef yanlış ama geçerli bir ekran olursa beklenen adres de değişir. Döngü kontrolü bu anlam hatasını yakalamaz.

### 4. Orta öncelik: 19 ekran ve 42 adım sabit kapsam olarak korunmuyor

`routes.ts:14` içindeki sahip listesi 19 ekran türünü tanıyor. `Navigate` ayrıca yönlendirme için tanımlı. Liste, 19 ekranın hepsinin testlerde bulunmasını zorunlu tutmuyor.

`routes.ts:186` yalnız dört rota kalıbının varlığını zorunlu tutuyor. Örneğin `/kanitlar` kaydı silinirse o ekran için test de üretilmeyebilir. Sahip listesinde `EvidenceScreen` bulunması bu eksikliği yakalamaz.

Adım listesi boş olamaz. Tekrarlanan veya karar kaydıyla uyuşmayan adımlar reddedilir. Ancak beklenen 42 kimlik için bağımsız bir tamlık kontrolü yoktur. Bir adım iki kaynak listesinden birlikte silinirse mevcut tutarlılık kontrolü geçebilir. Bu yüzden yalnız üretilen test sayısı yeterli kanıt değildir.

### Korunan kontroller ve önerilen kabul

Mevcut denetim, beklenen adresten farklı bir adresi reddeder. Görünür ana başlık bulunmazsa test başarısız olur. Rota çözücüsü bilinmeyen ekran adlarını ve desteklenmeyen rota yapılarını da reddeder. Tekrarlanan yolları, bozuk adım ilişkilerini ve yönlendirme döngülerini yakalar. Bu korumalar, doğru ekranın çizildiğini tek başına doğrulamaz.

Ana ajan şu kontrolleri ayrı bir değişiklikte değerlendirmelidir:

1. Her adres için beklenen başlığı ve ayırt edici içeriği doğrulayın. Örneğin ilgili form alanı veya ana düğme kullanılabilir.
2. Her adımda karar numarasını, adım kimliğini ve adım başlığını doğrulayın. Forma özgü en az bir alanı da denetleyin.
3. Beklenen 19 ekranı ve 42 adım kimliğini bağımsız kabul listesiyle karşılaştırın. Yalnız sayıyı değil, kimlikleri ve adres eşleşmelerini de denetleyin.
4. Yönlendirmelerin beklenen hedefini ve hedef ekranın içeriğini ayrıca doğrulayın.
5. Yanlış ekran örneğinin testi başarısız yaptığını sonraki doğrulamada gösterin. Bu incelemede böyle bir deney yapılmadı.

Bu bölümde `pass`, yalnız salt okunur incelemenin tamamlandığını belirtir. Tarayıcı doğrulaması ve yanlış ekran deneyi `not_run` durumundadır. Mevcut 19 ekranın veya 42 adımın doğru çizildiği bu incelemeyle kanıtlanmadı.

## Ad hatasından sonra ölçüm

İlk koşunun kanıtları `.pane/scratch/is8/journey-initial` klasöründen okundu. Komut paleti için üç projenin hata kaydı incelendi. Projeler `chromium-320`, `chromium-1280` ve `webkit-320` adlarını taşıyor.

Kayıtlarda pencere açık ve erişilebilir adı boş. Erişilebilir ad, ekran okuyucunun pencereyi tanıtmak için kullandığı addır. Açık pencerede arama alanı ve “Sonuçlar” listesi bulunuyor. Ancak eski test pencereyi “Komut paleti” adıyla arıyor. Ad bulunamayınca test, beş saniye sonra ölçüme geçmeden duruyor.

Örnek kanıt dosyası şudur:

```text
.pane/scratch/is8/journey-initial/uyarlanir-paneller-Komut-p-0eedc-okunur-ve-sayfa-yana-taşmaz-chromium-320/error-context.md
```

`paneller.spec.ts` artık pencereyi `getByRole('dialog')` ile buluyor. Görünürlük kontrolü korunuyor. Ad koşulu şu ayrı kontrolle korunuyor:

```ts
await expect.soft(dialog).toHaveAccessibleName('Komut paleti')
```

Ad yanlışsa bu kontrol testi başarısız sayar. Ancak sonraki adımları durdurmaz. Arama alanı ve sonuç listesi kontrolleri geçerse ölçüm sürer. `measurePage` yazı boyutunu ve yana taşmayı ölçer. `saveEvidence` ölçüm dosyasını ve ekran görüntüsünü kaydeder. `yazi` ve `tas-ma` kontrolleri korunur.

Bu değişiklik, uygulamadaki eksik adı düzeltmez. Eksik ad gerçek hata olarak kalır. “Yeni plan” testi değiştirilmedi. Ortak araçlar ve kaynak kod değiştirilmedi.

| Kontrol | Durum | Kanıt veya sınır |
|---|---|---|
| İlk komut paleti koşusu | `fail` | Sağlanan üç hata kaydında adla aranan pencere bulunamıyor. |
| İlk koşuda palet ölçümü | `not_run` | Test, adla arama sırasında duruyor. |
| Değişiklik sonrası tarayıcı koşusu | `not_run` | Test çalıştırma görevi ana ajana verildi. |
| Değişiklik sonrası ölçüm ve ekran görüntüsü | `not_run` | Ana ajanın tekrar koşusu bekleniyor. |

Bu alt görev yeni test koşusu başlatmadı. Ad hatasından sonra ölçümün tamamlandığı henüz tarayıcıda doğrulanmadı.
