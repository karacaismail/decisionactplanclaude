# Playwright ayarları tamamlandı

Bu dosya alt görevin ara raporudur. Son sonuçlar [ana bulgu raporundadır](../mobil-bulgular.md).

İş 8 kapsamında yalnız `playwright.config.ts` ve bu rapor değiştirildi.
Başlangıçta dosyada bulunan Chromium eklemeleri korundu.
Testler çalıştırılmadı. Ana ajan çalışma sonuçlarını ayrıca doğrulayacak.

## Kaynakta görülen sorunlar

- Ayar yalnız `PW_PORT` değişkenini okuyordu. `PLAYWRIGHT_PORT` etkisiz kalıyordu.
- WebKit için yalnız 390 ve 1280 piksel genişlikleri bulunuyordu.
- `reuseExistingServer: true`, başka çalışma kopyasının açık sunucusunu kullanabiliyordu.
- Kanıt klasörü ortam değişkeniyle seçilemiyordu. JSON raporu etkin değildi.

## Değişiklik ve beklenen davranış

Port, test sunucusuna erişmek için kullanılan numaradır.
`PLAYWRIGHT_PORT` verilirse bu değer kullanılır.
Bu değişken yoksa `PW_PORT` kullanılır. İkisi de yoksa port 5179 olur.
Port tam sayı değilse veya 1 ile 65535 arasında değilse ayar hata verir.

Sunucu, ayar dosyasının bulunduğu çalışma kopyasında başlatılır.
Sunucu adresi ve test adresi aynı `127.0.0.1` adresini kullanır.
`reuseExistingServer: false` açık sunucunun yeniden kullanılmasını engeller.
`--strictPort` başka porta geçişi engeller.
Dolu portta test durmalıdır. Ana ajan bu davranışı ayrıca denemelidir.
Bu seçim [resmî Playwright sunucu açıklamasına](https://playwright.dev/docs/test-webserver) dayanır.

`PLAYWRIGHT_OUTPUT_DIR`, ekran görüntülerinin ve diğer test kanıtlarının klasörünü seçer.
Değişken yoksa `./test-results` kullanılır.
`PLAYWRIGHT_JSON_OUTPUT_FILE` verilirse JSON raporu da üretilir.
JSON, sonuçları başka araçların okuyabildiği dosya biçimidir.
Değişken verilmezse terminaldeki mevcut liste raporu korunur.
Bu ayar [resmî Playwright rapor açıklamasına](https://playwright.dev/docs/test-reporters#json-reporter) dayanır.
Ana ajan her çalışma için ayrı kanıt yolları kullanmalıdır.

## Ekran boyutları

Her satır hem Chromium hem WebKit projesinde bulunur.
Ölçüler, web sayfasının kullandığı CSS piksel birimindedir.
Proje adı, tarayıcı adıyla aşağıdaki son ekin birleşimidir.
Örneğin `chromium-320` ve `webkit-320` adları kullanılır.

| Son ek | Genişlik | Yükseklik | Dokunma taklidi |
|---|---:|---:|---|
| `320` | 320 | 720 | Açık |
| `360` | 360 | 800 | Açık |
| `375` | 375 | 812 | Açık |
| `390` | 390 | 844 | Açık |
| `landscape` | 844 | 390 | Açık |
| `tablet` | 768 | 1024 | Açık |
| `1280` | 1280 | 800 | Kapalı |
| `1920` | 1920 | 1080 | Kapalı |

Toplam 16 proje vardır. Firefox projesi yoktur.
`chromium-320` ve `chromium-1280` adları korunmuştur.
`isMobile`, yalnız Playwright'ın mobil tarayıcı taklidini ayarlar.
Uygulama bu değişkeni almaz. WebKit sonucu gerçek Safari testi sayılmaz.

## Korunan kapsam ve bağımlılıklar

Varsayılan test klasörü hâlâ `./tests` yoludur.
Test seçimini daraltan filtre eklenmedi. Süre sınırları ve tekrar sayısı korunmuştur.
`test:e2e:ci` komutu mevcut iki Chromium projesini seçmeye devam eder.
Bu komut 16 projeyi kapsamaz. Tam kapsam için ana ajan `npm run test:e2e` çalıştırmalıdır.
Paket dosyaları ve yayın iş akışı değiştirilmedi.

`tests/uyarlanir/audit.ts` dosyasındaki işlev imzaları korunmuştur.
`saveEvidence`, yolları `TestInfo.outputPath` üzerinden alır.
Bu nedenle kanıt klasörü desteği için yardımcı dosyada değişiklik gerekmez.

`tsconfig.json`, Playwright ayarını kapsamıyor.
Bu yüzden mevcut `npm run lint`, bu dosyanın tip denetimini sağlamaz.
Ana ajan Playwright ayarını ayrıca yüklemeli ve tip denetimi yapmalıdır.
Bu alt görev için başka dosyada zorunlu değişiklik saptanmadı.

## Sürüm kanıtı

| Araç | Paket aralığı | Kilit dosyası | Kurulu paket |
|---|---|---|---|
| Playwright | `^1.64.1` | `1.64.1` | `1.64.1` |
| TypeScript | `^5.9.3` | `5.9.3` | `5.9.3` |
| Vite | `^8.3.8` | `8.3.8` | `8.3.8` |

Paket aralıkları `package.json` dosyasından okundu.
Kesin sürümler `package-lock.json` ve kurulu paketlerin dosyalarından okundu.
`node -e` içinde `process.version`, çalışan Node sürümünü `v24.21.0` olarak verdi.
Playwright, TypeScript derleyicisi ve Vite çalıştırılmadı. Çalışma zamanı sürümleri doğrulanmadı.
Kurulu Playwright tip dosyasında `cwd`, `reuseExistingServer` ve `outputDir` alanları görüldü.

## Doğrulama sınırı

Kaynaklar ve değişiklik farkı elle incelendi.
Görev talimatı, testlerin ana ajan tarafından çalıştırılmasını istiyor.

Şu kontroller çalışma kopyasının kökünde çalıştırıldı:

```sh
git diff --check -- playwright.config.ts
node /Users/w6x/.claude/skills/coding-standards/scripts/yalin-turkce-denetim.mjs --tur aciklama docs/qa/alt-gorevler/01-config.md
```

İlk komut boşluk hatası bulmadı. Yazım denetimi 0 hata ve 1 uyarı verdi.
Uyarı uzun kelimeler içindi. Kelimeler ve cümlelerin anlamı elle incelendi.
Bu kontroller test başarısı sayılmaz.

| Kontrol | Durum | Açıklama |
|---|---|---|
| Chromium ve WebKit testleri | `not_run` | Ana ajan çalıştıracak. |
| Port çakışması ve değişken önceliği | `not_run` | Beklenen davranış kaynakta incelendi. |
| Kanıt dosyalarının yazılması | `not_run` | Ana ajan gerçek çıktıyı doğrulayacak. |
| Tip denetimi ve proje kapıları | `not_run` | Ana ajan çalıştıracak. |
| Bağımsız inceleme | `not_run` | Bu alt görev yeni ajan başlatmıyor. |
| Gerçek Safari ve fiziksel cihaz | `not_run` | Tarayıcı veya cihaz açılmadı. |
| Firefox | `not_applicable` | Görev Firefox çalıştırılmasını yasaklıyor. |

Sunucu başlatılmadı. Paket kurulmadı. Git kaydı veya gönderimi yapılmadı.
Uygulamayı engelleyen bir durum saptanmadı.
Çalışma sonucunu doğrulama işi ana ajanda kalıyor.
Gerçek okurla denenmedi.

## Bağımsız ek inceleme

Güncel ayarlar ve belirtilen iki port kaydı incelendi.
Bu ajan önceki Playwright değişikliğini yaptı. Bu dosyanın yeniden incelenmesi öz incelemedir.
Playwright ayarı için uygulayıcıdan bağımsız onay sayılmaz.
Bu görevde kaynak ve test dosyaları değiştirilmedi. Yeni test veya derleyici çalıştırılmadı.

### Bulgu: Yeni tip denetimi kapılara bağlı değil

Önem düzeyi `P2`, yani orta düzeydir.
Tip denetimi, TypeScript dosyalarındaki tür hatalarını arar.
`tests/uyarlanir/tsconfig.json:6`, yeni testleri ve Playwright ayarını denetim kapsamına alır.
Ancak `package.json:10` içindeki `lint` komutu yalnız kök ayarı kullanır.
Kök `tsconfig.json:21`, yalnız `src` ve `vite.config.ts` yollarını seçer.
Kök ayarda yeni test ayarına proje bağlantısı bulunmaz.
`package.json:16` ve `.github/workflows/deploy.yml` de yeni tip ayarını çağırmaz.

Bu nedenle mevcut otomatik kapılar, yeni testlerdeki tür hatalarını zorunlu olarak yakalamaz.
Yeni ayar dosyasının bulunması, otomatik denetimin çalıştığını kanıtlamaz.
Paket komutlarının sahibi, aşağıdaki komutu uygun kontrol adımına eklemelidir.
Ana ajan önce bu komutu çalıştırmalıdır.

```sh
./node_modules/.bin/tsc --project tests/uyarlanir/tsconfig.json --noEmit
```

Bu komut bu ek incelemede çalıştırılmadı. Durumu `not_run` olarak kalır.

### Kapsam karşılaştırması

| Ayar veya komut | Kaynaktan görülen kapsam |
|---|---|
| Playwright varsayılanı | `tests` altındaki 24 `.spec.ts` dosyası ve 16 proje seçilir. |
| `test:e2e:ci` | Aynı dosya kapsamı, yalnız `chromium-320` ve `chromium-1280` projelerinde seçilir. |
| Yeni TypeScript ayarı | Doğrudan 7 test, 2 yardımcı dosya ve Playwright ayarı seçilir. |
| Kök TypeScript ayarı | `src` ve `vite.config.ts` seçilir. Test klasörü doğrudan seçilmez. |

Yeni ayar, üst ayarın `strict` ve `noEmit` kurallarını korur.
`types` listesine Node türleri eklenmiştir. Mevcut `vite/client` türleri korunmuştur.
Testlerin içe aktardığı uygulama dosyaları da derleyiciye dahil olabilir.
`tests` kökündeki diğer 17 test, yeni ayarın doğrudan kapsamı dışındadır.
Bu sınır bir kapsam farkıdır. Bu değişikliğin eski kapsamı daralttığına dair bulgu yoktur.

`./*.ts` seçimi yalnız aynı klasörü kapsar.
İleride alt klasöre test eklenirse kapsam ayrıca güncellenmelidir.
Güncel envanterde alt klasörde kalan yeni test görülmedi.

Playwright ayarında dosya seçimini daraltan yeni filtre bulunmadı.
Sekiz boyut, her iki tarayıcıda da tanımlıdır. Korunması gereken proje adları değişmemiştir.
Firefox projesi yoktur.
Koşullu atlamalar nedeniyle dosya seçimi, her testin her projede çalıştığı anlamına gelmez.
Örneğin fare testi dokunma projelerinde atlanır. Dönüş testleri dikey telefon boyutlarını seçer.
Bu karşılaştırmada başka yapılandırma kusuru saptanmadı.

### Port kayıtlarının kanıt sınırı

| Kayıt | Görülen sonuç | Kanıt sınırı |
|---|---|---|
| `.pane/scratch/is8/invalid-port.log:1` | Port doğrulaması beklenen hatayı üretmiş. | Girilen port değeri ve komut dosyada yok. |
| `.pane/scratch/is8/occupied-port.log:1` | `127.0.0.1:5208` adresi dolu olduğu için çalışma reddedilmiş. | Dolu sunucunun hangi çalışma kopyasına ait olduğu dosyada yok. |

İki kayıt da beklenen reddetme davranışını destekler.
Kayıtlarda komutların çıkış kodları ve kaynak sürümü bulunmaz.
Bu nedenle bütün port durumları için `pass` sonucu çıkarılamaz.
`PLAYWRIGHT_PORT` önceliği ve `PW_PORT` desteği kaynakta görülür.
Bu iki kayıtta değişken önceliğini veya eski değişken desteğini gösteren çalışma kanıtı yoktur.

Bu ek inceleme yalnız dosya okumaya ve kaynak karşılaştırmasına dayanır.
Tarayıcı, sunucu, derleyici veya test komutu çalıştırılmadı.
