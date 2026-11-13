# Kalite kapıları

Bu belge kalite kapılarını anlatır. Kapı, kodu denetleyen bir kontroldür. Kapı bir hata bulursa iş durur. Kapı temizse yayın devam eder.

Bütün kapılar tek komutla çalışır:

```bash
npm run ci
```

Bu komut sırayla üç kapıyı çalıştırır. Her kapıyı tek başına da çalıştırabilirsiniz.

## 1. Tip denetimi ve arayüz kapısı

Komut:

```bash
npm run lint
```

Bu komut önce TypeScript tip denetimini çalıştırır. Sonra arayüz kapısını çalıştırır. Arayüz kapısının dosyası `scripts/check-ui.mjs` dosyasıdır. Kapıyı tek başına şu komutla çalıştırırsınız:

```bash
npm run check:ui
```

Arayüz kapısı `src` klasöründeki `.css`, `.ts` ve `.tsx` dosyalarını tarar. Kapı beş kuralı denetler.

1. **Yazı boyutu.** Hiçbir yazı 14 pikselden küçük olamaz. Kapı `font-size: 12px` gibi değerleri yakalar. Kapı `fontSize: 12` gibi satır içi değerleri de yakalar.
2. **Hareket.** Geçiş ve animasyon süreleri ortak değişkenden gelir. Ortak değişkenler `var(--motion-...)` biçimindedir. Ham süre yazılamaz. Örneğin `200ms` yazılamaz. `transition: all` yazılamaz. Hareketi azaltma bloğu bu kuraldan muaftır. Bu blok `prefers-reduced-motion` ile başlar.
3. **Odak halkası.** Odak kuralında `outline` yazılamaz. Odak kuralı `:focus` veya `:focus-visible` içeren kuraldır. Odak kuralında `box-shadow` da yazılamaz. Yalnız `outline: none` ve `outline: 0` serbesttir. Yüksek karşıtlık bloğu bu kuraldan muaftır. Bu blok `forced-colors: active` ile başlar.
4. **Kavisli vurgu kenarı.** Bir kutunun tek kenarına renkli çizgi çizilebilir. Ancak aynı kutuda köşe yuvarlatma olamaz. Kapı `border-left` ile `border-radius` birlikteliğini yakalar. Kapı satır içi `borderLeft` ile `borderRadius` birlikteliğini de yakalar.
5. **Cihaz bayrağı.** Kodda `isMobile` adlı bayrak olamaz. Kodda `userAgent` okuması da olamaz. Yerleşim alanını, giriş türünü ve hover desteğini ayrı ayrı sorgulayın.

Kapı her ihlali `dosya:satır açıklama` biçiminde yazar. Örnek:

```text
src/charts/EChart.tsx:22 animationDuration: 320 ham değer. motion tokenını kullanın.
```

Kapı bir ihlal bulursa çıkış kodu 1 verir. Kapı temizse "Arayüz kapısı temiz." yazar.

Token kaynağı `src/theme/tokens.ts` dosyasıdır. Bu dosya ham değer taşır. Bu yüzden kapı bu dosyayı atlar.

## 2. Birim testleri

Komut:

```bash
npm run test:unit
```

Bu komut Vitest ile birim testlerini çalıştırır. Testler `src` ve `scripts` klasörlerindedir. Test dosyalarının adı `.test.ts` ile biter. Arayüz kapısının kendi testi `scripts/check-ui.test.ts` dosyasındadır. Bu test her kuralı örnek kodla dener.

## 3. Tarayıcı duman testi

Komut:

```bash
npm run test:e2e:ci
```

Bu komut Playwright ile tarayıcı testlerini çalıştırır. Testler `tests` klasöründedir. Komut yalnız Chromium kullanır. Komut iki ekran genişliğinde çalışır: 320 piksel ve 1280 piksel.

Bütün tarayıcı projelerini şu komutla çalıştırırsınız:

```bash
npm run test:e2e
```

Bu komut Chromium ve WebKit projelerini çalıştırır. Firefox hiçbir zaman çalışmaz. Bu bir kullanıcı kararıdır.

Playwright geliştirme sunucusunu kendisi başlatır. Sunucu `http://localhost:5179` adresinde çalışır. Sunucu zaten çalışıyorsa Playwright onu kullanır.

## CI'da ne çalışır

CI, kodu GitHub'da otomatik denetleyen sistemdir. Ayarı `.github/workflows/deploy.yml` dosyasındadır. `main` dalına her gönderimde CI şu sırayla çalışır:

1. CI `npm ci` komutuyla bağımlılıkları kurar.
2. CI `npm run lint` komutuyla tip denetimini ve arayüz kapısını çalıştırır.
3. CI `npm run test:unit` komutuyla birim testlerini çalıştırır.
4. CI `npx playwright install --with-deps chromium` komutuyla Chromium tarayıcısını kurar.
5. CI `npm run test:e2e:ci` komutuyla duman testini çalıştırır.
6. CI `npm run build` komutuyla uygulamayı derler.
7. CI derlenen dosyaları GitHub Pages'e yayımlar.

Bir adım kırmızı olursa sonraki adım çalışmaz. Yayın da yapılmaz. Duman testi kırmızı olursa CI test izlerini `playwright-test-results` adıyla saklar. İzleri GitHub'daki iş sayfasından indirirsiniz.

## Yerel bilgisayarda ve CI'da fark

Yerel bilgisayarda bütün kapılar aynı komutla çalışır. Ancak yerel sonuç CI sonucu değildir. CI temiz bir Linux makinede çalışır. Bu yüzden yayından önce CI sonucunu kontrol edin.

## Yeni kural eklemek

Yeni bir arayüz kuralı eklemek için iki adım gerekir:

1. Önce `scripts/check-ui.test.ts` dosyasına başarısız olan bir test yazın.
2. Sonra `scripts/check-ui.mjs` dosyasına kuralı ekleyin.

Test yeşil olunca bu belgeye kuralı ekleyin.
