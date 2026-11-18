# Mobil kalite denetimi

İş 8, `mobil-qa-1` dalında yürütüldü. İnceleme günü 18 Kasım 2026 Çarşamba günüdür.

Uygulamanın kaynak kodu değiştirilmedi. Testler mevcut sorunları başarısız sonuç olarak koruyor. Bu rapor birleşik sürümün kabulü değildir. Koordinatör, dalları birleştirdikten sonra İş 8 denetimini yeniden çalıştırmalıdır.

Başlangıç kaydı `c6736e9a29c999648d96a580dff01ffdb538bcbb` idi. Testler bu kaydın uygulama kaynaklarını kullandı. Çalışmalar yerel kaldı. Uzak depoya gönderim veya canlı yayın yapılmadı.

## Kapsam

Testler 19 ekran bileşenine ulaşan 77 giriş yolunu çıkarıyor. Liste gerçek rota ve adım verilerinden üretiliyor. Her yol, beklenen adres ve başlıkla doğrulanıyor. Boş ekran başarılı sayılmıyor.

Sekiz görünüm boyutu Chromium ve WebKit için tanımlandı. Ölçüler CSS pikselidir. CSS pikseli, tarayıcının yerleşim ölçüsüdür.

| Sıra | Genişlik | Yükseklik | Giriş koşulu |
|---|---:|---:|---|
| 1 | 320 | 720 | Dokunma |
| 2 | 360 | 800 | Dokunma |
| 3 | 375 | 812 | Dokunma |
| 4 | 390 | 844 | Dokunma |
| 5 | 844 | 390 | Yatay telefon ve dokunma |
| 6 | 768 | 1024 | Tablet ve dokunma |
| 7 | 1280 | 800 | Fare |
| 8 | 1920 | 1080 | Fare |

Klavye ayrıca 320 ve 1280 piksel genişlikte denendi. Playwright dokunma ve ekran koşullarını taklit etti. Gerçek telefon kullanılmadı. Testteki `isMobile`, yalnız Playwright ayarıdır. Uygulama davranışını seçen bir bayrak değildir.

## Bulgular ve sahipleri

Aşağıdaki ölçüler gerçek tarayıcı kayıtlarından alınmıştır. Tekrarlayan kayıtlar ayrı sorun sayılmadı. Ölçüm kayıtlarındaki `route.owner`, ekranın sahibidir. Ortak üst şerit için asıl sahip İş 2'dir.

| Kimlik | Sahip | Sorun | Kanıt ve beklenen sonuç |
|---|---|---|---|
| M01 | İş 2 | Üst şeritteki marka bağlantısı küçüktür. | 320 pikselde 114 × 21,59 piksel ölçüldü. Dokunma alanı en az 44 × 44 piksel olmalıdır. |
| M02 | İş 3 ve İş 4 | Ortak form kontrollerinin dokunma alanları küçüktür. | Satır düğmeleri 32 × 32 pikseldir. Temizleme düğmeleri, anahtarlar ve seçim etiketleri de ölçümlerde başarısızdır. İş 3 ortak ayarları düzeltmelidir. İş 4 form içindeki kullanımı doğrulamalıdır. |
| M03 | İş 5 | Karar ve kapı bağlantıları küçüktür. | Örneğin karar tablosundaki “Aç” bağlantısı yaklaşık 18,30 × 20 pikseldir. |
| M04 | İş 6 | Plan listesi ve pano bağlantıları küçüktür. | Pano üzerindeki bazı bağlantılar 18 piksel yüksekliğindedir. |
| M05 | İş 7 | Devir ve devralma bağlantıları küçüktür. | Devir adım bağlantıları 28 piksel yüksekliğindedir. Kartı kaplayan ek alanlar ayrıca değerlendirilmelidir. |
| M06 | İş 7, ortak ayar için İş 3 | Yöntemler sayfasındaki sayfa numarası küçüktür. | `/yontemler` sayı alanı Chromium’da 13,3333, WebKit’te 11 piksel ölçüldü. Alt sınır 14 pikseldir. Kaynak `MethodsScreen.tsx` içindeki küçük ekran sayfalamasıdır. |
| M07 | İş 4 | İki çalışma ekranı 320 pikselde yana taşıyor. | `/karar/8/adim/33` genişliği 348 pikseldir. `/karar/9/adim/20` genişliği 329 pikseldir. Sayfa genişliği 320 pikseli aşmamalıdır. |
| M08 | İş 2 | Komut paletinin erişilebilir adı boştur. | Pencere açılıyor. Ancak `dialog` rolünün adı “Komut paleti” değil. Test adı ayrıca doğruluyor ve başarısız kalıyor. |
| M09 | İş 2 ve İş 3 | Arama alanında görünür klavye odağı yoktur. | Chromium ve WebKit görüntüleri ile ölçümleri aynı sorunu gösteriyor. Genel `::before` kuralı yerel metin alanında çizilmiyor. |
| M10 | İş 2 | Bazı odak işaretleri yeterince ayrışmıyor. | Tema ve “Daha fazla” düğmelerinde renk farkı 3:1 altındadır. Masaüstündeki “Planlar” bağlantısında iki işaret vardır. Tek görünür işaret kullanılmalıdır. |
| M11 | İş 6 | “Kısa yol” anahtarı kapanmıyor. | Space ilk basışta anahtarı açıyor. İkinci basış anahtarı kapatmıyor. Hareket azaltma ve büyük yazı denemeleri burada başarısız oluyor. |
| M12 | İş 3 ve İş 4 | Plan adı ve Adım 00 seçeneklerinde görünür odak eksiktir. | Form kontrolleri tuşla seçilebiliyor. Ancak odak göstergesi çizilmiyor. Ana yol ve görsel odak ayrı sonuçlarla kaydedildi. |

M11 için kaynak bağlantısı açıktır. `OverviewScreen.tsx`, değişiklik işlevinden atanan `false` değerini döndürüyor. `planStore.ts` ise `false` dönüşünü iptal olarak yorumluyor. İş 6 sahibi bu ortak sözleşmeyi koordinatörle ele almalıdır. İş 8 kaynak dosyalarını değiştirmedi.

Ekran ölçümlerinin tamamı [rota kayıtlarında](kanit/is8/routes.json) bulunur. Ayrıntılı bulgular [sıkıştırılmış ölçüm dosyasındadır](kanit/is8/measurements.json.gz). Her kayıt seçici, ölçü, tarayıcı ve görüntü yolunu içerir. Seçici, ölçülen ekran öğesinin adresidir.

## Kontrol sonuçları

| Kontrol | Durum | Gerçek sonuç |
|---|---|---|
| Lint | `pass` | TypeScript ve mevcut arayüz kuralları geçti. |
| Birim testleri | `pass` | 23 dosyada 337 test geçti. |
| Derleme | `pass` | Derleme tamamlandı. Büyük parça uyarısı var. |
| Test dosyalarının tip denetimi | `pass` | Ayrı `tsconfig.json` ile tamamlandı. |
| Ölçüm örnekleri | `pass` | Chromium ve WebKit toplam 32 örneği geçti. |
| Chromium ekranları ve dönüş | `fail` | 162 geçti. 462 başarısız. 8 kapsam dışı. |
| WebKit ekranları ve dönüş | `fail` | 162 geçti. 462 başarısız. 8 kapsam dışı. |
| Klavye ile yeni plan | `fail` | Dört koşulda cevaplar korundu. Görünür odak eksikleri sürdü. |
| Son `test:e2e:ci` komutu | `fail` | 369 geçti. 89 başarısız. 14 kapsam dışı. |

Son ekran taraması 16 projede 1.232 yol ölçümünü tamamladı. Bu sayı 77 yolun 16 koşuldaki tekrarını belirtir. Dönüş testleri bu sayıya dahil değildir.


`pass`, belirtilen kontrolün geçtiğini gösterir. `fail`, kontrolün geçmediğini gösterir. `not_run`, kontrolün tamamlanmadığını gösterir. `not_applicable`, kontrolün o koşula uygulanmadığını gösterir.

CI, otomatik kalite kontrollerinin çalıştığı süreçtir. Yerel lint komutu TypeScript ve mevcut arayüz kurallarını denetledi. Ayrı test tip denetimi de eklendi. Birim testlerinde 23 dosyada 337 test geçti. Derleme tamamlandı. Vite büyük çıktı parçaları için uyarı verdi. Bu uyarı üretim ağı ölçümü değildir.

Tarayıcı sonuçları [çalışma özetinde](kanit/is8/runs.json) bulunur. Her testin durumu [test kayıtlarında](kanit/is8/tests.json) bulunur. Eski `kanit/ilk-320` dosyaları yeni başarı kanıtı sayılmadı.

## Ölçüm aracının doğrulanması

Bağımsız inceleme, ölçüm aracındaki eksikleri ortaya çıkardı. Önce başarısız örnekler çalıştırıldı. Ardından yalnız test yardımcıları düzeltildi.

İlk 24 örneğin dokuzu başarısızdı. Düzeltmeden sonra 24 örnek geçti. Sola taşma için eklenen iki örnek önce başarısız oldu. Sonra 26 ölçüm örneğinin tamamı geçti. Saydam ipucu ve kart bağlantısı için dört başarısız örnek daha eklendi. Son düzeltmelerden sonra 32 örneğin tamamı geçti. Toplu ölçüm, aynı koşulları daha az tarayıcı çağrısıyla denetliyor.

Yardımcı artık görünür alan ipucunun kendi boyutunu okuyor. Yatayda gizlenen metni görünür saymıyor. Gerçek form kontrollerini de kapsıyor. Sayfa taşmasını `clientWidth` üzerinden ölçüyor. Bu seçim, mobil tarayıcının genişleyen `innerWidth` değerine güvenmeyi önlüyor.

Canvas kaydındaki `not_applicable`, ölçüm anında görünür Canvas bulunmadığını belirtir. Sonradan yüklenen grafiklerin yazısı bu sonuçla doğrulanmaz.

Küçük kontrolün ek basma alanı varsa dört kenar noktası deneniyor. Büyük kutuların bütün yüzeyinin açık olduğu kanıtlanmadı. Örtülme ve karmaşık dönüşümler için tam kabul sonucu verilmedi.

Odak ölçümü, görüntü ile aynı andaki stilleri karşılaştırıyor. Görüntü ve ölçü uyuşmazsa sonuç uygulama hatası sayılmıyor. Ölçülemeyen durum ayrıca kaydediliyor. Marka çizgisi için ilk yanlış bulgu bu yolla düzeltildi.

## Ortam ve komutlar

Ortam macOS 26.5.1 ve arm64 işlemcidir. Node.js sürümü 24.21.0, npm sürümü 11.19.0'dır. Chromium sürümü 156.0.8078.4, WebKit sürümü 27.2'dir. WebKit sonucu gerçek Safari sonucu değildir.

Manifest aralıkları, kilit sürümleri ve kurulu sürümler [sürüm kaydında](kanit/is8/versions.json) ayrıdır. React için tarayıcı içinden ayrıca sürüm sorgusu yapılmadı.

Bütün komutlar bu dala ait çalışma klasöründe çalıştırıldı:

```sh
npm run lint
npm run test:unit
npm run build
./node_modules/.bin/tsc -p tests/uyarlanir/tsconfig.json --noEmit
PLAYWRIGHT_PORT=5210 npm run test:e2e:ci -- --workers=2
```

5208 portu doluydu. Bu porttaki servis durdurulmadı. Testler boş portlarda kendi Vite sunucusunu açtı. `reuseExistingServer: false`, başka çalışma klasöründeki sunucuya bağlanmayı önlüyor.

Ek çalıştırmalar, `playwright test tests/uyarlanir` altındaki dosyaları kullandı. Projeler açıkça Chromium ve WebKit olarak seçildi. Çıktılar `PLAYWRIGHT_OUTPUT_DIR` ve `PLAYWRIGHT_JSON_OUTPUT_FILE` ile ayrı klasörlere yazıldı. Tam komutlar [çalıştırma kaydındadır](calistirma.md).

## Bağımsız çalışma

Bu çalışma klasöründe `AGENTS.md` ve `CLAUDE.md` bulunmadı. Ortak yönergeler ve `docs/kalite-kapilari.md` okundu. Kalite belgesindeki açık sunucu açıklaması eski ayarı anlatıyor. Belgenin sahibi, bu açıklamayı `reuseExistingServer: false` kararına göre güncellemelidir.

İş 12 ayrı parçaya bölündü. 12 Codex alt görevi aynı anda çalıştı. Dosya sahiplikleri ayrıldı. [Eşzamanlı çalışma kaydı](kanit/is8/parallel-proof-12.json) bu durumu gösterir.

Ölçüm yardımcısını ayrı ajan inceledi. Başka ajan kapsamı ve klavye ana yolunu inceledi. [Ölçüm incelemesi](alt-gorevler/10-audit-review.md) ve [kapsam incelemesi](alt-gorevler/12-coverage.md) ayrı raporlardır. Ara raporların sonuçları yalnız kendi inceleme anını gösterir.

## Tamamlanmayan katmanlar

Canvas, grafiklerin çizildiği yüzeydir. DOM ise sayfadaki öğelerin ağaç yapısıdır. DOM ölçümü, Canvas içindeki yazıyı doğrudan okuyamaz.

| Kontrol | Durum | Sorumluluk veya neden |
|---|---|---|
| Birleşik `mobil-birlesik` dalı | `not_run` | Koordinatör birleştirdikten sonra İş 8 tekrar çalışmalıdır. |
| Üretim parçaları ve aktarılan baytlar | `not_run` | İş 1 üretim ağı kanıtını sağlamalıdır. Testler geliştirme sunucusunu kullandı. |
| Canvas içindeki grafik yazıları | `not_run` | DOM yazı ölçümü grafik içindeki yazıyı kanıtlamaz. |
| Dokunma alanının her noktasında erişim | `not_run` | Kutu ve ek alan örnekleri bütün yüzeyin erişimini kanıtlamaz. |
| Gerçek Safari ve fiziksel cihazlar | `not_run` | Playwright emülasyonu kullanıldı. |
| Sanal klavye ve ekran çentiği boşluğu | `not_run` | Gerçek cihaz kullanılmadı. |
| Tercih akışının sonraki kontrolleri | `not_run` | Anahtar kapanmadığı için sonraki hareket ve odak kontrolleri tamamlanmadı. |
| Gerçek tarayıcı yakınlaştırması | `not_run` | Kök yazı boyutu denemesi yakınlaştırma değildir. |
| Ekran okuyucu çıktısı | `not_run` | Rol ve ad kontrolleri sesli çıktıyı kanıtlamaz. |
| Önceki görüntüyle otomatik piksel karşılaştırması | `not_run` | Yeni görsel referans onaylanmadı. |
| Uzak CI | `not_run` | CI komutu yerelde çalıştırıldı. GitHub çalışması başlatılmadı. |
| Firefox | `not_applicable` | Kullanıcı bu görevde Firefox çalıştırılmasını yasakladı. |

Türkçe denetim betiği 14 Markdown dosyasında hata bulmadı. Uzun kelime uyarıları elle incelendi. Gerekli teknik adlar ve koşullar korundu. Gerçek okurla denenmedi.
