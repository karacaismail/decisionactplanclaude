# Fare testi teslimi

Bu dosya alt görevin ara raporudur. Son sonuçlar [ana bulgu raporundadır](../mobil-bulgular.md).

`tests/uyarlanir/fare.spec.ts` dosyasına tek test eklendi. Test yalnız `hasTouch: false` projelerinde çalışır. Dokunma projeleri, açıklamalı `skip` ile atlanır.

## Beklenen davranış

1. Kullanıcı fareyle "Yeni plan" düğmesine basar.
2. Kullanıcı plan adını yazar ve "Oluştur" düğmesine basar.
3. Kullanıcı "Yeni bir fikrim var" seçeneğini seçer.
4. Kullanıcı "Devam et" düğmesiyle Adım 00 ekranını açar.
5. Kullanıcı yedi seçeneği fareyle seçer.
6. Kullanıcı "Adımı tamamla" düğmesiyle Adım 01 ekranını açar.
7. Test, "Kaydedildi" bilgisini bekler ve sayfayı yeniler.
8. Kullanıcı "Geri" bağlantısıyla Adım 00 ekranına döner.
9. Test, yedi seçimin korunduğunu denetler.

Test, fareyi düğmelerin ve seçeneklerin üzerine getirir. Fareyle üzerine gelmek, seçeneği kendiliğinden seçmemelidir. Boş plan adıyla "Oluştur" düğmesi kullanılamamalıdır. Başlangıç yolu seçilmeden "Devam et" düğmesi kullanılamamalıdır.

Test, Playwright `hover()` ve `click()` çağrılarını kullanır. DOM üzerinden tıklama veya `force` kullanılmaz. Test, başlangıç sayfasından sonraki ekranlara görünür kontrollerle ulaşır.

## Kaynakta görülen eksikler

Mevcut `tests/smoke.spec.ts` testi, Adım 00 adresini doğrudan açıyor. Başlangıç seçimini, fareyle üzerine gelmeyi ve yenileme sonrasındaki seçimleri kontrol etmiyor. Yeni test bu eksikleri kapsıyor.

`src/screens/WorkScreen.tsx` içindeki `persist`, Adım 00 için yalnız `setProfile(next)` çağırıyor. Bu çağrı, verilen `tamam` durumunu kullanmıyor. `src/engine/changes.ts` içindeki `applyProfile` da adım durumunu yazmıyor. Ekrandaki "Tamam" etiketi ise `plan.steps['00'].status` değerine bağlı.

Bu nedenle Adım 00 tamamlanınca "Tamam" etiketi görünmeyebilir. Bu bulgu yalnız kaynak incelemesine dayanıyor. Tarayıcı sonucu doğrulanmadı. İş 4 sahibi, tamamlanma durumunu ayrıca incelemeli. Yeni test, sonraki adıma geçişi ve seçimlerin korunmasını denetler. "Tamam" etiketini denetlemez.

## Ortak yardımcılar

Test, mevcut `ready` ve `saveEvidence` yardımcılarını kullanır. `audit.ts` imzaları değiştirilmedi. Bu görev için yardımcı değişikliği gerekmiyor.

Test başarıyla biterse `saveEvidence`, ekran görüntüsü ve ölçüm kaydı üretir. Bu kayıtta fare yolu ve sonuçlar bulunur. Başarısız testin iz kaydı, mevcut Playwright ayarına bağlıdır. İlk teslim sırasında tarayıcı kanıtı üretilmedi. Ana ajanın sonraki çalışma kanıtı, aşağıdaki düzeltme bölümünde incelendi.

## Sürümler ve denetim

| Araç | Paket aralığı | Kilit dosyası | Gözlenen çalışma sürümü |
|---|---|---|---|
| Playwright | `^1.64.1` | `1.64.1` | Çalıştırılmadı. |
| TypeScript | `^5.9.3` | `5.9.3` | Çalıştırılmadı. |
| Node.js | Paket dosyasında belirtilmemiş. | Uygulanmaz. | `v24.21.0` |

Test çalıştırma görevi ana ajandadır. İlk teslimde tarayıcı testlerinin durumu `not_run` olarak kaydedildi. Ana ajanın sonraki çalışması, aşağıdaki düzeltme bölümünde açıklanıyor. Gerçek Safari çalıştırılmadı. Firefox görev kapsamı dışındadır. Bu alt görevde derleme, tip kontrolü ve proje denetimleri çalıştırılmadı. Fare testine bağımsız inceleme yapılmadı.

Mevcut `tsconfig.json`, `tests` klasörünü kapsamıyor. Bu nedenle proje derlemesi, yeni testin tip doğruluğunu kanıtlamaz.

Şu kontroller çalıştırıldı:

| Komut | Sonuç |
|---|---|
| `node --version` | `v24.21.0` görüldü. |
| `node /Users/w6x/.claude/skills/coding-standards/scripts/yalin-turkce-denetim.mjs docs/qa/alt-gorevler/03-mouse.md --tur aciklama` | Yazım hatası bulunmadı. Uzun kelime uyarısı elle incelendi. |
| `git diff --no-index --check /dev/null tests/uyarlanir/fare.spec.ts` | Boşluk hatası bildirilmedi. Yeni dosya farkı nedeniyle çıkış kodu 1 oldu. |
| `git diff --no-index --check /dev/null docs/qa/alt-gorevler/03-mouse.md` | Boşluk hatası bildirilmedi. Yeni dosya farkı nedeniyle çıkış kodu 1 oldu. |

Metnin anlamı ve test başlıkları elle denetlendi. Uzun kelimeler teknik açıklamada gerekli olduğu için korundu.

Ana ajan, mevcut komutu ilgili dosyayla sınırlandırabilir:

```sh
npm run test:e2e -- tests/uyarlanir/fare.spec.ts --project=chromium-1280 --project=chromium-1920 --project=webkit-1280
```

Çalışma dizini `/Users/w6x/Developer/decisionactplanclaude/worktrees/mobil-qa-1` olarak kalır. Bu komut burada çalıştırılmadı. Mevcut Playwright ayarı gerektiğinde geliştirme sunucusu başlatır. Ana ajan, kendi sunucu ve port düzenini kullanmalıdır.

## Kapsam

Yalnız test dosyası ve bu rapor değiştirildi. Kaynak kod, paketler ve ortak yardımcılar değiştirilmedi. Sunucu başlatılmadı ve paket kurulmadı. Git geçmişini değiştiren işlem yapılmadı. Çalışmayı engelleyen bir durum bulunmadı.

## Bağımsız ek inceleme

`tests/uyarlanir/dokunma.spec.ts` dosyası bağımsız olarak incelendi. İnceleme, dokunma yolunu ve doğru ekran öğesini bulmayı kapsadı. Metin girişi için kullanılan `fill()` çağrısının sınırı da incelendi.

İlk kaynak incelemesinde düzeltme gerektiren bulgu bulunmadı. Bu değerlendirme eksik kaldı. Sonraki gerçek çalışma, görünmeyen radio input üzerinde bekleme sorununu gösterdi. Aşağıdaki düzeltme bölümü bu yeni kanıtı açıklar.

- Testin 4. satırındaki yardımcı, hedefi görünür alana getirip `target.tap()` çağırıyor. Plan oluşturma, başlangıç seçimi, yedi cevap ve tamamlama bu yardımcıyı kullanıyor. Test, `click`, `force`, `dispatchEvent` veya DOM üzerinden tıklama kullanmıyor. Başlangıç adresinden sonraki geçişler görünür kontrollerle yapılıyor.
- Testin 10. satırı, `hasTouch` kapalıysa testi açıklamayla atlıyor. Mevcut Playwright projelerinde dokunma yeteneği açıkça tanımlı. Proje adı üzerinden cihaz tahmini yapılmıyor.
- Testin 17. satırı, "Yeni plan" penceresini adıyla buluyor. Testin 21. satırı, bu pencerenin içindeki "Planın adı" alanını buluyor. `src/screens/PlansScreen.tsx:301` içindeki pencere ve alan etiketi bu adlarla eşleşiyor.
- Testin 34. satırındaki grup, "Başlangıç yolu" adıyla eşleşiyor. `src/screens/StartScreen.tsx:81` aynı grup adını tanımlıyor. Testin 48. satırındaki seçenekler yalnız ana içerikte aranıyor. Yedi cevap, `src/data/steps/karar1.ts` içindeki etiketlerle eşleşiyor. `src/components/FieldControl.tsx:140`, bu cevapları radyo seçenekleri olarak oluşturuyor. Seçimler, dokunma sonrasında ayrıca denetleniyor.
- Testin 56. satırı, Adım 01 adresini denetliyor. Sonraki kontrol, ekran başlığını da denetliyor. Başlık, `src/data/registry.ts:28` ve Adım 01 tanımıyla eşleşiyor. `src/screens/WorkScreen.tsx:193` içindeki tamamlama işlevi bu geçişi yapıyor.
- Testin 23. satırındaki tek `fill()` çağrısı plan adını yazıyor. Önce alana dokunuluyor. Sonra yazılan değer ve "Oluştur" düğmesinin kullanılabilirliği denetleniyor. Test, klavye tuşlarıyla seçim veya sayfa geçişi yapmıyor. `fill()`, telefondaki sanal klavyenin açıldığını kanıtlamaz. Klavyenin alanı örtmesi ve ekranı daraltması da bu testin dışında kalıyor.

İncelemede testin tamamı ve yukarıdaki kaynaklar okundu. `audit.ts`, `playwright.config.ts`, `package.json` ve `package-lock.json` da incelendi. Playwright aralığı `^1.64.1`, kilit sürümü `1.64.1` olarak görüldü. Ant Design aralığı `^6.7.0`, kilit sürümü `6.7.0` olarak görüldü. TypeScript aralığı `^5.9.3`, kilit sürümü `5.9.3` olarak görüldü. Bu incelemede araçların çalışma sürümleri ölçülmedi.

Tarayıcı testi çalıştırılmadı. Görsel inceleme ve gerçek cihaz denemesi yapılmadı. Bu kontrollerin durumu `not_run` olarak kalır. Fiziksel dokunma ve sanal klavye davranışı ayrıca doğrulanmalıdır. Bu ek görevde yalnız bu rapora bölüm eklendi. Kaynak kod ve test dosyaları değiştirilmedi.

## İlk çalışma sonrası düzeltme

Ana ajanın ilk çalışmasında fare testi 60 saniye sonunda durdu. Sonuç `fail` olarak kaydedildi. Çalışma projesi `chromium-1280` idi. Hata kaydı, ekranın Adım 00 üzerinde kaldığını gösteriyor.

Şu kanıtlar okundu:

- [Fare hata kaydı](../../../.pane/scratch/is8/journey-initial/uyarlanir-fare-fareyle-pla-8f3f7-amlanır-ve-seçimler-korunur-chromium-1280/error-context.md).
- [Fare iz kaydı](../../../.pane/scratch/is8/journey-initial/uyarlanir-fare-fareyle-pla-8f3f7-amlanır-ve-seçimler-korunur-chromium-1280/trace.zip).
- [Dokunma hata kaydı](../../../.pane/scratch/is8/journey-initial/uyarlanir-dokunma-Dokunmay-2f5e0-amamlanır-ve-Adım-01-açılır-chromium-320/error-context.md).
- [Dokunma iz kaydı](../../../.pane/scratch/is8/journey-initial/uyarlanir-dokunma-Dokunmay-2f5e0-amamlanır-ve-Adım-01-açılır-chromium-320/trace.zip).
- [WebKit dokunma iz kaydı](../../../.pane/scratch/is8/journey-initial/uyarlanir-dokunma-Dokunmay-2f5e0-amamlanır-ve-Adım-01-açılır-webkit-320/trace.zip).

Fare izinde `szap@188` çağrısı, "Tüketici" radio input üzerinde `hover` bekliyor. Kayıt sürekli `element is not visible` bildiriyor. Dokunma izleri de aynı input için görünürlük beklediğini gösteriyor. Bu kanıt, önceki bağımsız incelemedeki eksikliği doğruluyor.

İz kaydındaki HTML, input'un bir `label` içinde olduğunu gösteriyor. `label`, görünen seçenek metnini de içeriyor. Testin fare işlemleri bu görünür etikete taşındı. Etiket, içerdiği radyo kontrolünün tam adıyla bulunuyor. Tek etiket bulunması ve etiketin görünür olması zorunlu tutuldu.

Test, gerçek radio input'un kullanılabilir olduğunu da denetliyor. Fare etiketin üzerine gelmeden önce kontrol seçilmemiş olmalı. Üzerine gelince kontrol yine seçilmemiş olmalı. Etikete tıklanınca aynı kontrol seçilmiş olmalı. Sayfa yenilendikten sonraki `toBeChecked()` kontrolleri de korundu.

`force`, programatik tıklama, süre artırımı veya denetim atlama eklenmedi. Görünür etiket tıklamayı almıyorsa test yine başarısız olur. Kontrol seçilmiyorsa test yine başarısız olur. Uygulamadaki "Tamam" etiketiyle ilgili önceki kaynak bulgusu da geçerliliğini koruyor. Bu bulgunun tarayıcı doğrulaması hâlâ yok.

Yalnız `fare.spec.ts` ve bu rapor güncellendi. Dokunma testi ve uygulama kodu değiştirilmedi. Testler yeniden çalıştırılmadı. Düzeltme sonrası doğrulama durumu `not_run` olarak kalır. Ana ajan testleri yeniden çalıştıracak.
