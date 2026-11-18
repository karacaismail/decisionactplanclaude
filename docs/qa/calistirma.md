# İş 8 çalıştırma kaydı

Kontroller 18 Kasım 2026 Çarşamba günü çalıştırıldı. Komutların çalışma klasörü şudur:

```text
/Users/w6x/Developer/decisionactplanclaude/worktrees/mobil-qa-1
```

## Temel kapılar

```sh
npm run lint
npm run test:unit
npm run build
./node_modules/.bin/tsc -p tests/uyarlanir/tsconfig.json --noEmit
```

İlk üç komutun sonuçları `kanit/is8/gates.json` dosyasındadır. Test tip denetiminin güncel çıktısı `kanit/is8/qa-types.log` dosyasındadır. Boş günlük, başarılı komutun yazılı çıktı üretmediğini gösterir.

## Son tam tarayıcı kapısı

```sh
PLAYWRIGHT_PORT=5210 \
PLAYWRIGHT_OUTPUT_DIR=.pane/scratch/is8/ci-final \
PLAYWRIGHT_JSON_OUTPUT_FILE=.pane/scratch/is8/ci-final.json \
npm run test:e2e:ci -- --workers=2
```

Bu komut mevcut testleri de çalıştırır. Projeler `chromium-320` ve `chromium-1280` ile sınırlıdır. Önceki `ci` çalışması, son test düzeltmelerinden önce yapılmıştır. Son sürüm için `ci-final` esas alınmalıdır.

## Bütün ekranlar ve telefon dönüşü

```sh
PLAYWRIGHT_PORT=5209 \
PLAYWRIGHT_OUTPUT_DIR=.pane/scratch/is8/matrix \
PLAYWRIGHT_JSON_OUTPUT_FILE=.pane/scratch/is8/matrix.json \
./node_modules/.bin/playwright test \
  tests/uyarlanir/ekranlar.spec.ts \
  tests/uyarlanir/donus.spec.ts \
  '--project=chromium-*' '--project=webkit-*' --workers=6
```

Bu komut 16 projeyi listeler. Chromium tamamlanınca bu çalışma durduruldu. WebKit, aynı kaynaklarla ayrı komutta tamamlandı. Her projede 77 yol ve iki dönüş testi listelenir. Dönüş testleri yalnız dört dikey telefon genişliğinde çalışır. Diğer projelerde bu testler gerekçeli olarak atlanır.

Önceki `matrix-stopped` ve `matrix-intermediate` denemeleri tamamlanmadı. Ana ajan, ölçüm düzeltmesi için bu süreçleri durdurdu. Bu denemeler son kabul sonucu sayılmaz. Son `matrix` kaydında yalnız Chromium sonuçları esas alınır. WebKit sonuçları `matrix-webkit` kaydından alınır.

WebKit için kullanılan ayrı komut şöyledir:

```sh
PLAYWRIGHT_PORT=5212 \
PLAYWRIGHT_OUTPUT_DIR=.pane/scratch/is8/matrix-webkit \
PLAYWRIGHT_JSON_OUTPUT_FILE=.pane/scratch/is8/matrix-webkit.json \
./node_modules/.bin/playwright test \
  tests/uyarlanir/ekranlar.spec.ts \
  tests/uyarlanir/donus.spec.ts \
  '--project=webkit-*' --workers=4
```

İki kayıt birlikte 16 projenin sonucunu verir. İlk kayıttaki yarım WebKit testleri yeniden başarı sayılmaz.

## Ölçüm örnekleri

```sh
PLAYWRIGHT_PORT=5212 \
PLAYWRIGHT_OUTPUT_DIR=.pane/scratch/is8/probe-complete \
PLAYWRIGHT_JSON_OUTPUT_FILE=.pane/scratch/is8/probe-complete.json \
./node_modules/.bin/playwright test \
  tests/uyarlanir/olcum.spec.ts \
  tests/uyarlanir/olcum-ek.spec.ts \
  --project=chromium-320 --project=webkit-320 --workers=2
```

Bu çalışma 32 ölçüm örneğini geçti. Önceki başarısız örnekler `probe-red`, `left-red` ve `probe-extra-red` kayıtlarındadır. Sonraki başarılı sonuçlar aynı hata koşullarını korur.

## Klavye ana yolu

```sh
PLAYWRIGHT_PORT=5211 \
PLAYWRIGHT_OUTPUT_DIR=.pane/scratch/is8/keyboard-main-final \
PLAYWRIGHT_JSON_OUTPUT_FILE=.pane/scratch/is8/keyboard-main-final.json \
./node_modules/.bin/playwright test \
  tests/uyarlanir/klavye-ana-yol.spec.ts \
  --project=chromium-320 --project=webkit-320 \
  --project=chromium-1280 --project=webkit-1280 --workers=2
```

Dört koşulda plan oluşturma ve cevapların korunması geçti. Görünür odak kontrolü dört koşulda da başarısızdır. Testin tamamı bu nedenle başarısız kalır.

Ek `keyboard-final` çalışması komut paletini, odağı ve tercihleri de kapsadı. Bu çalışmadaki eski ana yol kayıtları son ana yol sonucu sayılmamalıdır. Son ana yol için `keyboard-main-final` kullanılmalıdır.

## Kanıtların saklanması

`kanit/is8/runs.json` gerçek çalıştırma sayılarını içerir. `tests.json` testlerin tek tek sonucunu içerir. `routes.json` son ekran taramasının kayıtlarını içerir. `measurements.json.gz` ayrıntılı ölçüm kayıtlarının sıkıştırılmış kopyasıdır.

Seçilmiş görüntüler ve tarayıcı izleri `kanit/is8/ornekler` klasöründedir. Diğer ham dosyalar `.pane/scratch/is8` altında yereldir. Pane arşivlenince bu geçici dosyalar silinebilir. Kalıcı kanıt için `docs/qa/kanit/is8` kullanılmalıdır.

Ekran görüntüleri önceki sürümle otomatik karşılaştırılmadı. Görüntü kaydı tek başına görsel kabul anlamına gelmez. Üretim ağı ve gerçek cihaz kontrolleri çalıştırılmadı.
