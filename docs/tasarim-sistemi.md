# Tasarım sistemi

Bu belge ortak bileşenlerin güncel kurallarını anlatır.
Renkler `src/theme/tokens.ts` dosyasından gelir.
Ortak ölçüler `src/styles/temel/temel.css` dosyasında bulunur. CSS dosyalarının düzeni [CSS mimarisinde](css-mimarisi.md) anlatılır.
Ant Design ayarları `src/theme/antdTheme.ts` dosyasında tutulur.

## Yazı

Varsayılan yazı tipi Outfit'tir. Gövde yazısı 16 pikseldir.
Hiçbir okunabilir metin 14 pikselin altına inmez.
Yoğunluk seçimi yazıyı küçültmez. Tarayıcının kök yazı boyutu korunur.

| Öğe | Boyut | Kaynak |
|---|---|---|
| Sayfa başlığı | 30 pikselden 44 piksele kadar | `--font-page-title` |
| Bölüm başlığı | 22 piksel | `--font-section-title` |
| Alt başlık | 17 piksel | `--font-subsection-title` |
| Gövde | 16 piksel | `--font-body` |
| Yardımcı metin | 14 piksel | `--font-helper` |
| Özet sayısı | 36 piksel | `--font-stat-value` |

Mevcut daha büyük yazılar korunur. Metinler doğal kelime sınırlarından sarılır.
Model adları ve tablo başlıkları kelime ortasından bölünmez.
Uzun eylem metni kesilmez. Düğme, metinle birlikte büyür.

## Renk ve yüzey

Uygulama lacivert, beyaz ve mavi renklerini kullanır.
Açık ve koyu temaların renkleri ayrı tanımlanır.
Bileşenler `--color-*` değişkenlerini kullanır.
Seçili durum, hata ve devre dışı durum kendi renklerini korur.

### Karşıtlık kuralı

Karşıtlık, yazı ile zemin arasındaki parlaklık farkıdır.
Yazı ile zemin arasında en az 4,5:1 karşıtlık olur.
Kontrol kenarı ve odak işareti zemine karşı en az 3:1 olur.
Bu iki kural, iki temada da `src/theme/contrast.test.ts` ile denetlenir.

Eylem rengi iki ayrı tokena bölünür:

| Token | CSS değişkeni | Görevi |
|---|---|---|
| `actionPrimary` | `--color-action-primary` | Dolu düğmenin zemini ve ilerleme dolgusu |
| `actionText` | `--color-action-text` | Bağlantı, seçili menü ve eylem rengindeki yazı |
| `onAction` | `--color-on-action` | Dolu düğmenin üstündeki yazı |

Eylem rengiyle yazı yazacaksanız `--color-action-text` kullanın.
`--color-action-primary` yazı rengi olarak kullanılmaz.
Örneğin koyu temada seçili menü yazısı açık mavi olur.
Odak işareti de `--color-action-text` rengini kullanır.

### Kenar tokenları

| Token | CSS değişkeni | Görevi |
|---|---|---|
| `border` | `--color-border` | Süs çizgisi, tablo satır çizgisi ve kapalı alan kenarı |
| `borderStrong` | `--color-border-strong` | Ayırıcı, etiket kenarı ve kaydırma çubuğu |
| `borderInput` | `--color-border-input` | Yazı alanı, seçim kutusu, tarih alanı ve onay kutusu kenarı |

Giriş kontrolünün kenarı her zaman `--color-border-input` olur.
Bu renk zemine karşı en az 3:1 karşıtlık verir.
Ant Design kontrolleri bu rengi `antdTheme.ts` içinden alır.

Giriş kontrolünün durumları şunlardır:

- Dinlenme durumunda kenar `--color-border-input` olur.
- Fare üzerine gelince kenar `--color-text-secondary` olur.
- Klavye odağında kenar değişmez. Odak, alanın solundaki tek çizgiyle gösterilir.
- Hatalı alanda kenar `--color-status-harm` olur. Hata metni `aria-describedby` ile alana bağlanır.
- Kapalı alanda kenar `--color-border` olur. Zemin `--color-surface-context` olur.

### Yükselti

Yükselti, bir yüzeyin zeminden ne kadar ayrı göründüğüdür.
Kart zeminden kenarlıkla değil gölge ve yüzey tonuyla ayrılır.

| CSS değişkeni | Görevi |
|---|---|
| `--shadow-card` | Kart, panel ve özet kutusu |
| `--shadow-float` | Açılan pencere, komut paneli ve açılır liste |
| `--shadow-bar` | Ekranın altındaki sabit menü |

Gölge değerleri `tokens.ts` içindeki `elevation` nesnesinde durur.
`temel.css` aynı değerleri ilk açılış için taşır. Birim testi iki kaynağın eşitliğini korur.
Koyu temada kart gölgesi yoktur. Kartı zeminden yüzey tonu ayırır.

Açık temada sayfa zemini `#ECEEF4` rengidir. Kart zemini beyazdır.
İki yüzeyin açıklık farkı en az 5 birimdir. Açıklık farkı CIE L* ölçeğiyle ölçülür.

Ayrım için önce boşluk, hizalama ve yüzey tonu kullanılır.
Kenarlık yalnız işlevi varsa eklenir.
Örneğin giriş alanı, tablo çizgisi ve seçili durum kenarlık kullanır.
Yuvarlak köşeli kutuya tek kenarlı renkli vurgu çizgisi eklenmez.
`Callout` düz çizgi kullanır. Çizgiye değen köşeler düz kalır.

## Kontrol ve dokunma alanı

Görünen kontrol ile basılabilen alan ayrı ölçülür.
`--control-visual-size` yalnız görsel gövdeyi tanımlar.
`--hit-area-min` gerçek etkileşim alanını tanımlar.
Bu projede bağımsız eylemlerin alanı en az 44 × 44 pikseldir.
İkonun 16 piksel olması, düğmenin küçük olmasını gerektirmez.

Ant Design'ın küçük kontrol yüksekliği de 44 pikseldir.
`control.dense` eski tüketiciler için korunur. Bu değer yalnız görsel ölçüdür.
Yeni etkileşim alanları `control.hitArea` değerini kullanır.
Etkileşimsiz rozet ve ilerleme çizimi dokunma alanı sayılmaz.
Takvim günleri de 44 piksel kalır. Dar ekranda takvimin iç boşluğu azalır.
Sayı şeridi daralınca ikon, başlığın üstüne geçer. Böylece başlık kesilmez.

## Yoğunluk

Varsayılan düzen rahattır. Tüm ekran için `html` öğesinde `data-density` değerini ayarlayın.
Bu seçim açılan panellere de uygulanır.
Bir bölümdeki yerel seçim yalnız o bölümün HTML öğelerini etkiler.
Sayfa kökünde açılan panel, bölümün yerel seçimini miras almaz.
Sayfa kenar boşluğu ve dokunma alanı bu seçimle küçülmez.

| Düzen | Değer | Görsel kontrol | Panel içi | İçerik arası | Bölüm arası |
|---|---|---|---|---|---|
| Rahat | `comfortable` | 44 px | 16 px | 16 px | 32 px |
| Sıkı | `compact` | 36 px | 12 px | 12 px | 24 px |
| Yoğun | `dense` | 32 px | 8 px | 8 px | 16 px |

Örneğin şu değer tüm ekranı sıkı düzene geçirir:

```html
<html lang="tr" data-density="compact">
  <!-- Uygulama -->
</html>
```

## Boşlukların görevleri

| Değişken | Görevi |
|---|---|
| `--padding-control-block` | Kontrolün üst ve alt iç boşluğu |
| `--padding-control-inline` | Kontrolün iki yanındaki iç boşluk |
| `--padding-panel` | İçerik yüzeyinin iç boşluğu |
| `--gutter-page` | Sayfanın kenar boşluğu |
| `--gap-control` | Komşu kontrollerin arası |
| `--gap-content` | Aynı bölümdeki içeriklerin arası |
| `--gap-section` | Bölümlerin arası |
| `--gap-label` | Etiket ile açıklamanın arası |
| `--gap-icon` | İkon ile metnin arası |

İç boşluklar yalnız `--padding-*` değişkenlerini kullanır.
Örneğin etiket içi boşluk, etiketler arası boşluktan bağımsızdır.
Bileşenler bu değişkenleri kullanır. Yeni ham ölçü gerekiyorsa ortak kaynağa eklenir.
TypeScript yoğunluk değerleri `density` nesnesinde bulunur.
CSS ile TypeScript ölçülerinin eşitliği birim testiyle korunur.

## Giriş türü

CSS, `pointer`, `any-pointer` ve `hover` sorgularını ayrı değerlendirir.
Fare desteği klavye varlığı anlamına gelmez.
Dokunma desteği bulunan karma cihazda kontrollerin arası en az 8 piksel kalır.
Fare ve hover birlikte varsa sayfa kenar ölçüsü 20 pikseldir.
Diğer durumda sayfa kenar ölçüsü 16 pikseldir.
Bu ölçü hazır bir değişkendir. Sayfa kabuğuna uygulanması kabuk işinin sorumluluğudur.

Hiçbir eylem yalnız fare üzerine gelince erişilebilir olamaz.
Düğmeler dokunma ve klavyeyle çalışır.
Genişlik değişince form değeri ve odak korunur.
Cihaz adı, `isMobile` veya `userAgent` ile davranış seçilmez.

## Odak ve hareket

Mevcut merkezi klavye modu korunur.
Tab ve Shift+Tab görünür odak modunu açar.
İşaretçi etkileşimi yalnız görünür modu kapatır.
Normal temada çevreleyen odak halkası kullanılmaz.
Klavye odağı çevrelemeyen görünür bir işaretle gösterilir.
Yüksek karşıtlık istisnası ortak kullanıcı kuralına bağlıdır.

Metin alanı odağı, alanın solundaki tek çizgiyle gösterilir.
Yazı için çizginin yanında kalıcı boşluk ayrılır.
Gizli seçenek girişinin odağı, görünen seçim etiketinde gösterilir.
Kaydırılan form kontrolleri sabit üst şeridin altında kalmaz.

Ortak anahtar, seçenek ve temizleme eylemleri en az 44 piksel alan kullanır.
Anahtarın görünen gövdesi bu alandan küçük kalabilir.
Şeffaf üst ve alt kenarlara basmak da anahtarı çalıştırır.
Küçük ekran sayfalamasındaki sayı alanı en az 14 piksel yazı kullanır.

Hareket, mevcut `--motion-*` değişkenlerini kullanır.
Varsayılan eğri `cubic-bezier(.65, 0, .35, 1)` değeridir.
Giriş ve çıkış aynı eğriyi kullanır.
Kullanıcı hareketi azaltırsa mevcut azaltılmış hareket kuralı uygulanır.

## Bileşenler ve yükleme

İş 3 ortak bileşenlerinin kuralları `src/styles/bilesen/` klasöründedir. Her bileşenin kendi dosyası vardır.
Bu dosya `tokens.css` dosyasını yükler.
Ant Design tema bağlantısı ortak ölçüleri uygulama başında yükler.
Bu küçük ortak dosya, ayrı cihaz paketi değildir.

Ortak bileşenler sayfa başlığı, sayı şeridi, not ve durum görünümleridir.
Yöntem etiketi, yöntem kartı ve yöntem paneli de kapsamdadır.
Kanıt bağlama, sınır özeti ve ilerleme göstergesi aynı ölçüleri kullanır.
İş kuralları ve veri biçimleri değişmez.

## Doğrulama

Önce 320 piksel kabulü denetlenir. Sonra daha geniş görünümler denenir.
Sayfa yana taşmaz. Geniş tablo yalnız kendi kapsayıcısında kayar.
Dokunma alanı ve yazı boyutu gerçek tarayıcıda ölçülür.
Statik denetim, tarayıcı ölçümünün yerine geçmez.

Komutlar ve denetim sınırları [kalite kapıları belgesinde](kalite-kapilari.md) bulunur.
Koordinatörün sonraki denetim görevi, yeni hata testlerine izin verdi.
`tests/mobil-ortak.spec.ts`, M02, M06, M09 ve M12 bulgularını denetler.
Mevcut birim testleri ve geçici tarayıcı kanıtları da teslimi doğrular.
Firefox kullanıcı kararıyla çalıştırılmaz.
WebKit sonucu gerçek Safari veya gerçek telefon sonucu sayılmaz.
