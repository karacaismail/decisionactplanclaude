# Ölçüm yardımcılarının denetimi

Bu dosya alt görevin ara raporudur. Son sonuçlar [ana bulgu raporundadır](../mobil-bulgular.md).

## B4 için ek test

Sola taşmayı sınayan tek bir test eklendi. Dosyada artık 13 test bulunuyor. Yeni testin adı “B4: Sayfa genişlemeden sola taşan görünür içerik bulunur” oldu.

Test sayfasının yönü soldan sağadır. İçerik, `left: -20px` ile sola kaydırılır. Test önce içeriğin görünür kaldığını doğrular. Sol kenarın konumu tam olarak -20 CSS piksel olmalıdır. İçeriğin sağ kenarı ekran içinde kalmalıdır.

Test ayrıca belge genişliğinin ekran genişliğine eşit kaldığını doğrular. Böylece `scrollWidth` büyümeden oluşan taşma sınanır. Ardından `measurePage` sonucunda `tas-ma` bulgusu aranır.

Mevcut yerel kaydırılan tablo testi korundu. `audit.ts` değiştirilmedi. Yeni B4 testi henüz çalıştırılmadı. Durumu `not_run` olarak kaydedildi. Ana ajan önce başarısız sonucu alacak. Sonra ölçüm kodunu düzeltecek.

Ana ajanın bildirdiği önceki sonuçlar aşağıdadır:

| Çalışma | Bildirilen sonuç |
|---|---|
| `probe-red` | 9 test başarısız, 15 test başarılı. |
| `probe-green` | 24 test başarılı. |

Bu sonuçlar yeni B4 testini kapsamıyor. Sonuçlar burada yeniden çalıştırılmadı.

## İlk teslim kaydı

`tests/uyarlanir/olcum.spec.ts` dosyasına 12 Playwright testi eklendi. Playwright, testleri tarayıcıda çalıştıran araçtır. Bu görevde testler çalıştırılmadı. Ana ajan ilk başarısız sonuçları kaydedecek.

Testler kontrollü HTML örneklerini `page.setContent` ile açıyor. Uygulama verisi veya sayfa yüklemesi gerekmiyor. Mevcut ayar dosyası yine geliştirme sunucusunu başlatır. Sunucuyu bu görevde başlatmadım.

Yalnız test dosyası ve bu rapor değiştirildi. `audit.ts` dosyası ve yardımcıların imzaları korundu. Kaynak kod, paketler ve Git geçmişi değiştirilmedi.

## Beklenen davranışlar

Beklentiler [teslim planındaki](../../mobil-oncelikli-uyarlanir-teslim-plani.md) ortak kurallardan ve İş 8 kapsamından alındı. Ölçüler CSS pikselidir. CSS pikseli, sayfa yerleşiminde kullanılan birimdir.

| Durum | Beklenen sonuç |
|---|---|
| Görünen 13 piksel yazı | Ölçüm yazıyı bulur. `aria-hidden` görünür yazıyı denetimden çıkarmaz. |
| Görünen 14 piksel yazı | Ölçüm hata bildirmez. |
| Gizlenen veya tamamen kırpılan yazı | Ölçüm görünür yazı sayısını artırmaz. |
| Form değeri, ipucu ve kapalı düğme | Ölçüm görünen yazıyı denetler. |
| Alan 16 piksel, ipucu 13 piksel | Ölçüm küçük ipucunu bulur. |
| Sayfanın yatay taşması | Ölçüm taşmayı bulur. |
| Kendi alanında kayan geniş tablo | Ölçüm sayfa taşması bildirmez. |
| Küçük form alanları ve kapalı kontroller | Ölçüm kontrolleri dokunma denetimine alır. |
| Dokunma alanının eni veya boyu 43 piksel | Ölçüm küçük alanı bulur. |
| Dokunma alanı 44 × 44 piksel | Ölçüm hata bildirmez. |
| Küçük düğmenin genişletilmiş alanı | Dört dış nokta çalışıyorsa ölçüm yeterli alanı kabul eder. |
| Ek alan kırpılmış veya basılamaz durumda | Ölçüm ek alanı yeterli saymaz. |

Dokunma adaylarının testi yalnız dokunma desteği açık projelerde çalışır. Ek alan testleri dokunma veya fare girdisini proje ayarından seçer. Testler sahte tıklama olayı göndermek yerine gerçek tarayıcı girdisini kullanır.

## Kaynakta görülen sorunlar

Aşağıdaki sorunlar kaynak incelemesine dayanır. Başarısız tarayıcı sonucu henüz yoktur. Bu yüzden durumları `not_run` olarak kalır.

1. `measurePage`, dokunma adaylarında yalnız düğme, bağlantı ve `role="button"` arıyor. `input` ve `textarea` alanları listeye girmiyor. Küçük form alanları sonraki ölçüme ulaşamıyor.
2. `measurePage`, ipucunun yazı boyutunu alanın kendisinden okuyor. `::placeholder` boyutunu ayrıca okumuyor. Alan büyükken küçük ipucu kaçabilir.
3. `visible`, kırpmayı yalnız dikey konumla karşılaştırıyor. Yatayda tamamen kırpılan metin görünür sayılabilir. Test, aynı yükseklikte fakat kutunun sağında kalan yazıyı kullanıyor.
4. `measureTarget`, ek alanın başlangıcını dış kenardan hesaplıyor. Kenarlıklı düğmede iç kenar farkını eklemiyor. Test, gerçekten basılabilen 44 piksel alanın yanlış reddedilmesini arıyor.

Kenarlıklı düğme örneğinde görünür boyut 24 pikseldir. Düğmenin kenarı 4 pikseldir. Ek alanın eni ve boyu 44 pikseldir. Dört nokta, görünür kutunun dışında kalır. Test önce bu noktaların düğmeyi çalıştırdığını denetler. Sonra yardımcının sonucu değerlendirilir.

Ek alanın konumu iç dolgu kenarından hesaplanır. Bu beklenti [W3C konumlandırma kuralına](https://www.w3.org/TR/CSS22/visudet.html#containing-block-details) dayanır. Dokunma noktaları sayfanın CSS koordinatlarını kullanır. Bu kullanım [Playwright dokunma belgesine](https://playwright.dev/docs/api/class-touchscreen) dayanır.

Taşma testinde ayrı bir belirsizlik de izleniyor. Yardımcı, sayfa genişliğini `innerWidth` ile karşılaştırıyor. Mobil görünümde bu değerin taşmayla birlikte büyümesi ayrıca doğrulanmalıdır. Testin ön koşulu gerçek belge genişliğini `documentElement.clientWidth` ile karşılaştırır.

Ana ajan yardımcıyı düzeltirken mevcut imzaları koruyabilir. Aday seçimini, ipucu ölçümünü ve kırpma denetimini genişletebilir. Ek alan hesabına düğmenin kenar kalınlığını katabilir. Bu öneriler bu görevde uygulanmadı.

## Sürüm ve kontrol kanıtı

| Araç | Paket bildirimi | Kilit dosyası | Yerelde okunan bilgi |
|---|---|---|---|
| Playwright | `^1.64.1` | `1.64.1` | Kurulu paket `1.64.1`. Tarayıcı çalıştırılmadı. |
| TypeScript | `^5.9.3` | `5.9.3` | Kurulu paket `5.9.3`. Derleyici çalıştırılmadı. |
| Node | Paket sürüm sınırı tanımlamıyor. | Uygulanmaz. | Çalışan sürüm `v24.21.0`. |

Kurulu paket sürümleri `node_modules` içindeki paket dosyalarından okundu. Çalışan Node sürümü `process.version` ile alındı. `npm run lint`, kök TypeScript ayarındaki dosyaları kapsıyor. Yeni testin ayrı ayarı `tests/uyarlanir/tsconfig.json` dosyasındadır.

| Kontrol | Durum | Açıklama |
|---|---|---|
| Kaynak incelemesi | `pass` | Beklentiler kullanıcı kurallarıyla karşılaştırıldı. |
| Türkçe metin denetimi | `pass` | Betik hata bulmadı. Uzun kelime uyarısı elle incelendi. |
| Yeni Playwright testleri | `not_run` | Görev gereği ana ajan çalıştıracak. |
| TypeScript denetimi | `not_run` | Ana ajana bırakıldı. |
| Chromium ve WebKit | `not_run` | Tarayıcı başlatılmadı. |
| Firefox | `not_applicable` | Kullanıcı bu tarayıcıyı kapsam dışında bıraktı. |
| Gerçek cihaz ve Safari | `not_run` | Bu görevde çalışma kanıtı üretilmedi. |
| Görüntü, iz ve ağ kanıtı | `not_run` | Testler çalıştırılmadı. |
| Bağımsız inceleme | `not_run` | Görev yeni alt ajan başlatmayı yasaklıyor. Öz inceleme yapıldı. |
| CI | `not_run` | Uzak kontrol çalıştırılmadı. |

Ana ajan aşağıdaki komutları çalışma kopyasının kökünde çalıştırabilir. İlk komut ayrı test türlerini denetler. İkinci komut ilk tarayıcı denemesini başlatır. Üçüncü komut WebKit karşılığını çalıştırır. Bu komutlar burada çalıştırılmadı.

```sh
./node_modules/.bin/tsc --noEmit -p tests/uyarlanir/tsconfig.json
./node_modules/.bin/playwright test tests/uyarlanir/olcum.spec.ts --project=chromium-320
./node_modules/.bin/playwright test tests/uyarlanir/olcum.spec.ts --project=webkit-320
```

İlk başarısız sonuç kaydedilmeden yardımcı düzeltilmemelidir. Başarısızlık, test örneğinin ön koşulundan da kaynaklanabilir. Ana ajan önce gerçek hata nedenini ayırmalıdır. Sonra aynı testi yeniden çalıştırmalıdır.

Raporun Türkçe metni şu komutla denetlendi:

```sh
node /Users/w6x/.claude/skills/coding-standards/scripts/yalin-turkce-denetim.mjs docs/qa/alt-gorevler/09-probe.md --tur aciklama
```

Betik 0 hatayla tamamlandı. Uzun kelime uyarısı anlam ve doğal akış açısından incelendi. Gerekli teknik adlar korundu. Gerçek okurla denenmedi.

İki yeni dosya için `git diff --no-index --check` çalıştırıldı. Karşılaştırmanın diğer tarafı `/dev/null` oldu. Komutlar boşluk hatası bildirmedi. Yeni dosya farkı nedeniyle çıkış kodu 1 oldu.
