# CSS mimarisi

Bu belgeyi Claude 18 Kasım 2026 Çarşamba günü yazdı. Belge CSS dosyalarının nasıl bölüneceğini anlatır.

## Amaç

Uygulama yalnız gereken CSS'i indirmeli. Telefon fareye özel kuralları indirmemeli. Bilgisayar dokunmaya özel kuralları indirmemeli. Planlar ekranı form kurallarını indirmemeli.

Bölme düzenli olmalı. Yeni gelen kişi bir kuralın hangi dosyada durduğunu tahmin edebilmeli.

## Terimler

| Terim | Anlamı |
|---|---|
| Katman | Aynı amaçla yüklenen CSS dosyaları grubu |
| İlk açılış | Uygulamanın ilk ekranı gösterdiği an |
| Dokunma cihazı | Parmakla kullanılan cihaz. Örneğin telefon ve tablet. |
| Fare cihazı | Fare ya da dokunmatik yüzeyle kullanılan cihaz. Örneğin dizüstü bilgisayar. |
| Hibrit cihaz | Hem dokunma hem fare kullanan cihaz. Örneğin dokunmatik ekranlı dizüstü. |
| Kapı | Kodu denetleyen kontrol. Kapı hata bulursa iş durur. |

## Altı katman

| Sıra | Katman | Klasör | Ne zaman iner? | Kim içe aktarır? |
|---|---|---|---|---|
| 1 | Temel | `src/styles/temel/` | İlk açılışta, her cihazda | Yalnız `src/main.tsx` |
| 2 | Kabuk | `src/styles/kabuk/` | İlk açılışta, her cihazda | Yalnız `src/app/AppShell.tsx` |
| 3 | Bileşen | `src/styles/bilesen/` | Bileşen ilk kez kullanılınca | Yalnız aynı adlı bileşen |
| 4 | Ekran | `src/styles/ekran/` | Ekran açılınca | Yalnız aynı adlı ekran |
| 5 | Giriş | `src/styles/giris/` | Cihazın giriş türüne göre | Yalnız `src/app/girisStilleri.ts` |
| 6 | Yazdırma | `src/styles/yazdirma/` | Rapor ekranı açılınca | Yalnız rapor ekranları |

### 1. Temel katmanı

Temel katmanı her ekranda gereken kuralları taşır. Örneğin tokenlar, yazı tipi, odak işareti ve 44 piksel basma alanı bu katmandadır.

Doğruluk kuralları yalnız bu katmanda durur. Bu kurallar giriş katmanına taşınmaz. Giriş katmanı geç inerse arayüz bozulmamalı.

### 2. Kabuk katmanı

Kabuk katmanı üst şeridi, alt menüyü ve yan menüyü çizer. Kabuk her ekranda görünür. Bu yüzden ilk açılışta iner.

### 3. Bileşen katmanı

Her ortak bileşenin bir CSS dosyası olur. Dosya adı bileşen adıyla aynıdır. Örneğin `PageHeader.tsx` bileşeni `bilesen/PageHeader.css` dosyasını içe aktarır.

Bileşen hangi ekranda kullanılıyorsa CSS o ekranla iner. Örneğin puan tablosu yalnız karar ekranında iner.

### 4. Ekran katmanı

Her ekranın bir CSS dosyası olur. Dosya adı ekran adıyla aynıdır. Örneğin `WorkScreen.tsx` ekranı `ekran/WorkScreen.css` dosyasını içe aktarır.

Ekranlar zaten ayrı yükleniyor. Vite ekranın CSS'ini ekranla birlikte indirir.

### 5. Giriş katmanı

Giriş katmanında iki dosya vardır:

- `giris/dokunma.css` dosyası parmakla kullanımı iyileştirir. Örneğin basınca görünen geri bildirim bu dosyadadır.
- `giris/fare.css` dosyası fareyle kullanımı iyileştirir. Örneğin fare üzerine gelince görünen vurgu bu dosyadadır.

Yükleyici `src/app/girisStilleri.ts` dosyasıdır. Yükleyici şu sırayla çalışır:

1. Uygulama açılınca yükleyici cihazın giriş türünü sorar.
2. Cihazda parmakla dokunma varsa yükleyici `dokunma.css` dosyasını indirir.
3. Cihazda fare ve üzerine gelme varsa yükleyici `fare.css` dosyasını indirir.
4. Hibrit cihaz iki dosyayı da indirir.
5. Kullanıcı sonradan fare takarsa yükleyici `fare.css` dosyasını o an indirir.
6. Yükleyici indirilen dosyayı kaldırmaz.

Yükleyici cihaz adına bakmaz. `isMobile` ve `userAgent` kullanılmaz. Yükleyici yalnız tarayıcının giriş sorgusunu kullanır. Bu sorgular `any-pointer` ve `any-hover` sorgularıdır.

Her giriş dosyasının kuralları ayrıca kendi sorgusunun içinde durur. Örneğin `fare.css` kuralları `@media (any-hover: hover)` içinde durur. Dosya yanlışlıkla inerse kurallar yanlış cihazda çalışmaz.

### 6. Yazdırma katmanı

Yazdırma kuralları yalnız rapor ekranlarında gerekir. Bu yüzden yalnız rapor ekranları bu dosyayı içe aktarır.

## Kapılar

Mimari kendi kendine korunmaz. Bu yüzden üç kapı eklenir.

1. İlk kapı mimari kapısıdır. Kapının dosyası `scripts/check-css-architecture.mjs` dosyasıdır. `npm run lint` bu kapıyı çalıştırır. Kapı şu durumları hata sayar:
   - Bir CSS dosyası altı klasörün dışında duruyor.
   - Bir ekran başka bir ekranın CSS dosyasını içe aktarıyor.
   - Bir bileşen başka bir bileşenin CSS dosyasını içe aktarıyor.
   - Giriş dosyasını yükleyiciden başka bir dosya içe aktarıyor.
   - Giriş dosyasında kendi sorgusunun dışında kural var.
2. İkinci kapı boyut kapısıdır. Kapının dosyası `scripts/check-bundle.mjs` dosyasıdır. Kapı iki profili ayrı ölçer:
   - Dokunma profili temel, kabuk ve dokunma katmanından oluşur.
   - Fare profili temel, kabuk ve fare katmanından oluşur.

   İlk açılış sınırı değişmez. Ham sınır 65.000 bayttır. Sıkıştırılmış sınır 12.000 bayttır.
3. Üçüncü kapı ağ testidir. Testin dosyası `tests/css-teslim.spec.ts` dosyasıdır. Test gerçek ağ isteklerini denetler:
   - Dokunma profilinde `fare.css` istenmez.
   - Fare profilinde `dokunma.css` istenmez.
   - Hibrit profilde iki dosya da istenir.
   - Planlar ekranı form ekranının CSS'ini istemez.
   - Form ekranı açılınca form CSS'i istenir.

## Göç sırası

Göç dört adımdır. Her adımdan sonra bütün kapılar çalışır.

1. İlk adımda iskelet kurulur. Altı klasör, yükleyici, kapılar ve ağ testi eklenir. Ağ testi önce başarısız olur.
2. İkinci adımda temel ve kabuk dosyaları bölünür. Bu dosyalar `global.css`, `tokens.css`, `mobil-token.css` ve `mobil-kabuk.css` dosyalarıdır. Her ekranda gereken kurallar temel ve kabuk katmanına gider. Diğer kurallar bileşen ve ekran dosyalarına gider.
3. Üçüncü adımda ekran ve bileşen kuralları taşınır. `screens-*.css` ve `mobil-*.css` dosyaları ekran ve bileşen klasörlerine gider. Bu adım ekran gruplarına bölünür. Her grup ayrı ajanla paralel ilerler. İki ajan aynı dosyaya dokunmaz.
4. Dördüncü adımda giriş katmanı doldurulur. Fare ve parmak kuralları giriş dosyalarına gider.

Kurallar taşınırken davranış değişmez. Görsel karşılaştırma ve mevcut testler bunu doğrular.

## Bu yaklaşımın sınırları

- Giriş katmanı küçük kalır. Ölçüme göre ilk CSS'in yalnız yaklaşık yüzde beşi cihaza özeldir. Asıl kazanç ekran ve bileşen bölmesinden gelir.
- Sınırın altına inmek garanti değildir. İnilemezse kalan fark ve nedeni kullanıcıya sorulur.
- Hibrit cihaz iki giriş dosyasını da indirir. Bu beklenen davranıştır.
