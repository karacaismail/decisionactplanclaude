# Telefon dönüşü testleri

Bu dosya alt görevin ara raporudur. Son sonuçlar [ana bulgu raporundadır](../mobil-bulgular.md).

İki test `tests/uyarlanir/donus.spec.ts` dosyasına eklendi. Tarayıcı testleri çalıştırılmadı. Testleri ana ajan çalıştıracak.

## Değişiklik ve beklenen davranış

İlk test, Adım 02 içindeki “Başarı cümlesi” alanını doldurur. Telefon yataya dönünce yazılan metin korunmalıdır. Odak aynı alanda kalmalıdır. Telefon yeniden dikeye dönünce aynı koşullar sağlanmalıdır.

İkinci test, “Daha fazla” menüsünden “Bu adımı atla” penceresini açar. Test, penceredeki mevcut neden alanına metin yazar. Her iki dönüşte pencere açık kalmalıdır. Yazılan metin ve odak korunmalıdır.

Testler dönüşten sonra alanı yeniden doldurmaz. Testler dönüşten sonra odağı yeniden ayarlamaz. Böylece kayıp varsa test hatayı gizlemez. Her görünümde ekran görüntüsü alınır. Son ölçüm, ortak `saveEvidence` işleviyle kaydedilir.

`audit.ts` dosyasındaki işlevler ve çağrı biçimleri değiştirilmedi. Ortak yardımcı dosyada değişiklik gerekmiyor. Uygulama kodu ve paket dosyaları değiştirilmedi.

## Görünüm kapsamı

Boyutlar CSS pikselidir. CSS pikseli, web sayfasının kullandığı ölçü birimidir.

| İlk dikey görünüm | Yatay görünüm | Son dikey görünüm |
|---|---|---|
| 320 × 720 | 720 × 320 | 320 × 720 |
| 360 × 800 | 800 × 360 | 360 × 800 |
| 375 × 812 | 812 × 375 | 375 × 812 |
| 390 × 844 | 844 × 390 | 390 × 844 |

Testler mevcut Chromium ve WebKit projelerini kullanır. Yatay, tablet ve masaüstü başlangıçları bu dosyada atlanır. Telefon projesinde dokunma desteği yoksa test başarısız olur.

`setViewportSize`, tarayıcıdaki görünüm boyutunu değiştirir. Bu yöntem gerçek cihaz dönüşü değildir. Gerçek ekran klavyesi ve fiziksel telefon davranışı bu testlerle doğrulanmaz.

## Sayfa yenileme sınırı

İlk test, dönüş kontrollerinden sonra gerçek kaydı bekler. Bekleme sabit süreyle yapılmaz. Test, tarayıcı deposundaki ilgili alanın değerini kontrol eder. Ardından sayfayı yeniler ve metnin korunduğunu doğrular. Test, yenilemeden sonraki odağı dönüş kabulüne katmaz.

İkinci test “Atla” düğmesine basmaz. Bu nedenle pencerenin metni plan kaydına eklenmez. Test, yenilemeden sonra pencerenin kapalı olduğunu doğrular. Pencere yeniden açılınca neden alanı boş olmalıdır. Bu sınır, mevcut geçici pencere durumunu kaydeder.

## Kaynakta görülen risk

[WorkScreen.tsx](../../../src/screens/WorkScreen.tsx) dosyasının 187. satırındaki `onChange`, ekrandaki metni hemen değiştirir. Ancak plan kaydını 400 milisaniye sonra başlatır. `onChange`, bekleme başlarken kayıt durumunu “kaydediliyor” yapmaz.

[SyncGuard.tsx](../../../src/app/SyncGuard.tsx) dosyasının 58. satırındaki çıkış kontrolü yalnız iki kayıt durumunu denetler. Bunlar “kaydediliyor” ve “kaydedilemedi” durumlarıdır. Dolayısıyla gecikme sırasında yenileme, son değişikliği kaybettirebilir. Bu sonuç kaynak incelemesine dayanır. Tarayıcıda doğrulanmış hata değildir.

Ana ajan bu riski İş 4 sahibine iletmelidir. İş 2 sahibi çıkış uyarısıyla ilişkisini değerlendirmelidir. Eklenen yenileme kontrolü yalnız kayıt tamamlandıktan sonraki durumu kapsar. Kayıt öncesi yenilemeyi güvenli saymaz.

`skipOpen` ve `skipReason`, `WorkScreen.tsx` dosyasının 144. ve 146. satırlarında geçici durumdur. Neden metni yalnız 407. satırdaki “Atla” işlemiyle kaydedilir. Bu nedenle dönüş ve sayfa yenileme farklı beklentilerle denetlenir.

## Sürüm kanıtı

| Araç | Manifestteki aralık | Kilit dosyasındaki sürüm | Yerelde okunan sürüm |
|---|---|---|---|
| Playwright | `^1.64.1` | `1.64.1` | `1.64.1` |
| TypeScript | `^5.9.3` | `5.9.3` | `5.9.3` |
| Node | Belirtilmemiş | Uygulanmaz | `v24.21.0` |

Yerel paket sürümleri `node_modules` içindeki paket dosyalarından okundu. Node sürümü `node --version` komutuyla görüldü. Tarayıcı sürümü gözlenmedi.

## Kontroller

Çalışma dizini `/Users/w6x/Developer/decisionactplanclaude/worktrees/mobil-qa-1` idi.

| Kontrol | Durum | Açıklama |
|---|---|---|
| TypeScript denetimi | `pass` | `node node_modules/typescript/bin/tsc --noEmit -p tests/uyarlanir/tsconfig.json` başarıyla tamamlandı. |
| Türkçe metin denetimi | `pass` | Betik hata bulmadı. Uzun kelime uyarısı elle incelendi. |
| Boşluk denetimi | `pass` | İki dosyanın karşılaştırması boşluk uyarısı üretmedi. Yeni dosyalar nedeniyle çıkış kodu 1 oldu. |
| Tarayıcı testleri | `not_run` | Görev gereği testleri ana ajan çalıştıracak. |
| Gerçek cihaz ve ekran klavyesi | `not_run` | Fiziksel cihaz kullanılmadı. |
| Ek bağımsız inceleme | `not_run` | Görev yeni alt ajan başlatmayı yasaklıyor. |
| Firefox | `not_applicable` | Bu görevde çalıştırılması yasak. |

Metin ve boşluk denetiminde şu komutlar çalıştırıldı:

```sh
node /Users/w6x/.claude/skills/coding-standards/scripts/yalin-turkce-denetim.mjs docs/qa/alt-gorevler/06-rotation.md --tur aciklama
git diff --no-index --check /dev/null tests/uyarlanir/donus.spec.ts
git diff --no-index --check /dev/null docs/qa/alt-gorevler/06-rotation.md
```

Ana ajan şu komutla sekiz telefon projesini çalıştırabilir:

```sh
npm run test:e2e -- tests/uyarlanir/donus.spec.ts \
  --project=chromium-320 --project=chromium-360 \
  --project=chromium-375 --project=chromium-390 \
  --project=webkit-320 --project=webkit-360 \
  --project=webkit-375 --project=webkit-390
```

Bu komut burada çalıştırılmadı. Ekran görüntüsü ve tarayıcı izi henüz üretilmedi. Otomatik sunucu kontrolü de yapılmadı.

Gerçek okurla denenmedi.
