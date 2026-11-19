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

## Yedi katman

| Sıra | Katman | Klasör | Ne zaman iner? | Kim içe aktarır? |
|---|---|---|---|---|
| 1 | Temel | `src/styles/temel/` | İlk açılışta, her cihazda | Yalnız `src/main.tsx` |
| 2 | Kabuk | `src/styles/kabuk/` | İlk açılışta, her cihazda | Yalnız `src/app/AppShell.tsx` |
| 3 | Bileşen | `src/styles/bilesen/` | Bileşen ilk kez kullanılınca | Yalnız aynı adlı bileşen |
| 4 | Ekran | `src/styles/ekran/` | Ekran açılınca | Yalnız aynı adlı ekran |
| 5 | Desen | `src/styles/desen/` | Deseni kullanan ilk ekran açılınca | Deseni kullanan ekran ve bileşenler |
| 6 | Giriş | `src/styles/giris/` | Cihazın giriş türüne göre | Yalnız `src/app/girisStilleri.ts` |
| 7 | Yazdırma | `src/styles/yazdirma/` | Rapor ekranı açılınca | Yalnız rapor ekranları |

Temel katmanında küçük bir yazdırma koruyucusu da vardır. Ayrıntı 7. katmanın bölümündedir.

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

### 5. Desen katmanı

Bazı kuralları birden çok ekran kullanır. Örneğin pano kartı hem Planlar hem Pano ekranında görünür. Bu kurallar desen katmanında durur.

Her desenin bir dosyası olur. Dosya adı desenin sınıf adıyla aynıdır. Örneğin `.pano-card` sınıfının kuralları `desen/pano-card.css` dosyasındadır.

Bir ekran yalnız kullandığı desenleri içe aktarır. Bu yüzden Planlar ekranı karar ekranının desenlerini indirmez.

Tarayıcı her desen için ayrı istek yapmaz. Vite bir ekranın bütün CSS'ini tek dosyada birleştirir.

### 6. Giriş katmanı

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

Giriş katmanına yalnız sayfayı kaydırmayan etkiler girer. Örneğin fare üzerine gelince değişen renk bu katmana girer. Kenar boşluğu ve yazı boyutu bu katmana girmez. Giriş dosyası sayfadan biraz sonra iner. Düzeni değiştiren bir kural bu dosyada durursa sayfa çizildikten sonra kayar.

Bileşene özel küçük giriş kuralları bileşenin kendi dosyasında kalabilir. Örneğin `@media (hover: none)` içindeki bir tablo kuralı tablo dosyasında kalır.

Her giriş dosyasının kuralları ayrıca kendi sorgusunun içinde durur. Örneğin `fare.css` kuralları `@media (any-hover: hover)` içinde durur. Dosya yanlışlıkla inerse kurallar yanlış cihazda çalışmaz.

### 7. Yazdırma katmanı

Rapora özel yazdırma kuralları yalnız rapor ekranlarında gerekir. Bu yüzden yalnız rapor ekranları bu dosyayı içe aktarır.

Her ekranın ortak yazdırma kuralları `temel/temel.css` dosyasının sonunda durur. Bu bölüme yazdırma koruyucusu denir.
Koruyucu şu işleri yapar:

1. Üst şeridi, alt menüyü, ürün menüsünü, çekmeceyi ve sabit eylem şeridini gizler.
2. Sayfa zeminini beyaz yapar ve gölgeleri kaldırır.
3. Koyu giriş bloğunun yazı renklerini normal metin rengine çevirir. Tarayıcı kâğıda zemin rengini basmaz.
4. Renk geçişlerini kapatır. Böylece yarım kalan renk kâğıda basılmaz.

Koruyucu ayrı dosyaya bölünmez. `media="print"` bağlantısı da dosyayı ilk açılışta indirir. Yazdırma anında geç yükleme ise yazdırmaya yetişmeyebilir.

Koyu tema seçiliyse uygulama yazdırmadan önce açık temaya geçer. Bu işi `src/app/printMode.ts` dosyası yapar. Sayfa ekrana dönünce seçili tema geri gelir.

`@media print` kuralı yalnız `yazdirma/` klasöründe ve temel katmanındaki koruyucuda durabilir. Mimari kapısı başka yerdeki yazdırma kuralını hata sayar.

## Modül CSS dosyaları

Modüller numaralı aşamaların dışındaki bölümlerdir. Örneğin proje yönetimi bir modüldür. Ayrıntı [modül mimarisindedir](moduller/mimari.md).

Modül CSS dosyası yalnız ekran ve bileşen katmanında durur. Dosya adı modülün önekiyle başlar. Örneğin proje modülünün dosyası `ekran/PjProjelerScreen.css` olabilir.

Modül CSS dosyası için üç kural vardır:

1. Dosyayı yalnız aynı adlı modül dosyası içe aktarır. Bu dosya kendi modülünün klasöründe durur.
2. Dosyadaki her seçici modülün önekiyle başlar. Örneğin `.pj-bos-ekran` seçicisi geçerlidir. `.page` seçicisi geçersizdir.
3. Modül ekranı desen ve yazdırma dosyalarını da içe aktarabilir.

Önek modülün bildiriminden okunur. Yeni modül için kapı değişmez.

## Sıra kuralları

CSS'te aynı güçteki iki kuraldan sonra gelen kazanır. Bu yüzden dosyaların yüklenme sırası önemlidir. Sıra iki kuralla sabitlenir:

1. Her dosya kendi CSS'ini en üstte içe aktarır. Örneğin `RepeaterTable.tsx` dosyasının ilk satırı `import '@/styles/bilesen/RepeaterTable.css'` satırıdır. Böylece dış bileşenin CSS'i içindeki bileşenlerin CSS'inden önce gelir.
2. Bazı dosyalar birden çok CSS içe aktarır. Bu dosyalarda önce desen, sonra bileşen, en son ekran dosyası gelir.

Aynı sınıfı iki dosyada iki farklı değerle tanımlamayın. Örneğin `.tl-reason` sınıfı yalnız bir dosyada tanımlanır. Eski kodda bu kural çiğnenmişti. Bu yüzden görünüm, ekranların açılma sırasına bağlıydı.

## Yeni kural nereye yazılır?

Yeni bir kural yazarken şu soruları sırayla sorun:

1. Kural her ekranda gerekiyor mu? Öyleyse kural `temel/temel.css` dosyasına yazılır.
2. Kural üst şeridi ya da menüyü mü çiziyor? Öyleyse kural `kabuk/kabuk.css` dosyasına yazılır.
3. Kural tek bir bileşene mi ait? Öyleyse kural `bilesen/<Bileşen>.css` dosyasına yazılır.
4. Kural tek bir ekrana mı ait? Öyleyse kural `ekran/<Ekran>.css` dosyasına yazılır.
5. Kuralı birden çok ekran mı kullanıyor? Öyleyse kural `desen/<sınıf-adı>.css` dosyasına yazılır.
6. Kural yalnız fare üzerine gelince mi çalışıyor? Öyleyse kural `giris/fare.css` dosyasına yazılabilir.

## Kapılar

Mimari kendi kendine korunmaz. Bu yüzden üç kapı eklenir.

1. İlk kapı mimari kapısıdır. Kapının dosyası `scripts/check-css-architecture.mjs` dosyasıdır. `npm run lint` bu kapıyı çalıştırır. Kapı şu durumları hata sayar:
   - Bir CSS dosyası yedi klasörün dışında duruyor.
   - Bir ekran başka bir ekranın CSS dosyasını içe aktarıyor.
   - Bir bileşen başka bir bileşenin CSS dosyasını içe aktarıyor.
   - Giriş dosyasını yükleyiciden başka bir dosya içe aktarıyor.
   - Giriş dosyasında kendi sorgusunun dışında kural var.
   - Bir dosyada aynı sorgu, seçici ve bildirimlerle birebir yinelenen kural var.
   - `@media print` kuralı `yazdirma/` ve `temel/` dışında duruyor.
2. İkinci kapı boyut kapısıdır. Kapının dosyası `scripts/check-bundle.mjs` dosyasıdır. Kapı iki profili ayrı ölçer:
   - Dokunma profili temel, kabuk ve dokunma katmanından oluşur.
   - Fare profili temel, kabuk ve fare katmanından oluşur.

   Ham sınır 65.000 bayttır. Sıkıştırılmış sınır 12.300 bayttır.
   Sınır 19 Kasım 2026 Perşembe günü 12.000 bayttan yükseldi. Gövde yazı ailesi ve yazdırma koruyucusu ilk açılışta gerekir. Sahip bu artışa önceden izin verdi.
3. Üçüncü kapı ağ testidir. Testin dosyası `tests/css-teslim.spec.ts` dosyasıdır. Test gerçek ağ isteklerini denetler:
   - Dokunma profilinde `fare.css` istenmez.
   - Fare profilinde `dokunma.css` istenmez.
   - Hibrit profilde iki dosya da istenir.
   - Planlar ekranı form ekranının CSS'ini istemez.
   - Form ekranı açılınca form CSS'i istenir.

## Göç sırası

Göç dört adımdır. Her adımdan sonra bütün kapılar çalışır.

1. İlk adımda iskelet kurulur. Yedi klasör, yükleyici, kapılar ve ağ testi eklenir. Ağ testi önce başarısız olur.
2. İkinci adımda temel ve kabuk dosyaları bölünür. Bu dosyalar `global.css`, `tokens.css`, `mobil-token.css` ve `mobil-kabuk.css` dosyalarıdır. Her ekranda gereken kurallar temel ve kabuk katmanına gider. Diğer kurallar bileşen ve ekran dosyalarına gider.
3. Üçüncü adımda ekran ve bileşen kuralları taşınır. `screens-*.css` ve `mobil-*.css` dosyaları ekran ve bileşen klasörlerine gider. Bu adım ekran gruplarına bölünür. Her grup ayrı ajanla paralel ilerler. İki ajan aynı dosyaya dokunmaz.
4. Dördüncü adımda giriş katmanı doldurulur. Fare ve parmak kuralları giriş dosyalarına gider.

Kurallar taşınırken davranış değişmez. Görsel karşılaştırma ve mevcut testler bunu doğrular.

## Bu yaklaşımın sınırları

- Giriş katmanı küçük kalır. Ölçüme göre ilk CSS'in yalnız yaklaşık yüzde beşi cihaza özeldir. Asıl kazanç ekran ve bileşen bölmesinden gelir.
- Sınırın altına inmek garanti değildir. İnilemezse kalan fark ve nedeni kullanıcıya sorulur.
- Hibrit cihaz iki giriş dosyasını da indirir. Bu beklenen davranıştır.
