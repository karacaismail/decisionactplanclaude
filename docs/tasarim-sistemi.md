# Tasarım sistemi

Bu belge ortak bileşenlerin güncel kurallarını anlatır.
Renkler `src/theme/tokens.ts` dosyasından gelir.
Ortak ölçüler `src/styles/temel/temel.css` dosyasında bulunur. CSS dosyalarının düzeni [CSS mimarisinde](css-mimarisi.md) anlatılır.
Ant Design ayarları `src/theme/antdTheme.ts` dosyasında tutulur.

## Yazı

Varsayılan yazı tipi Outfit'tir. Gövde bu yazı tipini `--font-family` değişkeninden alır.
Böylece açılır pencere ve tarayıcı öğeleri de Outfit kullanır.
Gövde yazısı 16 pikseldir. Gövdenin harf aralığı daraltılmaz.
Hiçbir okunabilir metin 14 pikselin altına inmez.
Yoğunluk seçimi yazıyı küçültmez. Tarayıcının kök yazı boyutu korunur.

Yazı boyutları tek bir ölçekten gelir. Ölçek `tokens.ts` içindeki `font` nesnesindedir.
`temel.css` aynı değerleri taşır. Birim testi iki kaynağın eşitliğini korur.
Ant Design başlık boyutları da aynı ölçekten gelir.

| Öğe | Boyut | Kaynak |
|---|---|---|
| Sayfa başlığı | 28 pikselden 36 piksele kadar | `--font-page-title` |
| Devir raporunun karar sorusu | 28 pikselden 32 piksele kadar | `--font-lead` |
| İkinci düzey başlık | 24 piksel | `--font-h2` |
| Bölüm başlığı | 20 piksel | `--font-section-title` |
| Alt başlık | 18 piksel | `--font-subsection-title` |
| Sayfa açıklaması | 18 piksel | `--font-page-description` |
| Gövde | 16 piksel | `--font-body` |
| Yardımcı metin | 14 piksel | `--font-helper` |
| Özet sayısı | 36 piksel | `--font-stat-value` |

Sayfa başlığında satır yüksekliği en az 1,2 olur. Harf aralığı en az -0,02em olur.
Türkçe harflerin noktaları ve şapkaları böylece birbirine değmez.

Yeni kural ham piksel yerine bu değişkenleri kullanır. Örneğin `font-size: var(--font-body)` yazılır.
Ölçek dışı boyut kullanılmaz. Örneğin 15, 17, 19 ve 22 piksel yasaktır.
Arayüz kapısı bu kuralı denetler. Ayrıntı [kalite kapıları belgesindedir](kalite-kapilari.md).
`tests/yazi.spec.ts` gerçek tarayıcıda hesaplanan boyutları ölçer.

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

Eylem rengiyle yazı yazacaksanız `--color-action-text` kullanın. Bu kural modül ekranlarında da geçerlidir.
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
`temel.css` açık temanın değerlerini ilk açılış için taşır. Birim testi iki kaynağın eşitliğini korur.

Açık temada sayfa zemini `#ECEEF4` rengidir. Kart zemini beyazdır.
İki yüzeyin açıklık farkı en az 5 birimdir. Açıklık farkı CIE L* ölçeğiyle ölçülür.

Bağlam yüzeyi `--color-surface-context` değişkenidir. Açık temada rengi `#E3E6EF` olur.
Bu yüzey fare üzerine gelme zemini, soluk etiket ve kapalı alan için kullanılır.
Bağlam yüzeyi sayfa zemininden en az 2,5 birim ayrılır. Açık temada sayfa zemininden koyudur.
Böylece sayfa üstündeki üzerine gelme ve kapalı alan zemini de görünür kalır.
Çukur yüzey bağlam yüzeyinden de en az 2,5 birim ayrılır.

Koyu temada kart gölgesi görünmez. Kartı yüzey tonu ve 1 piksellik kenar tokenı ayırır.
Bu çizgi kartın dört kenarını da sarar. Tek kenarlı renkli vurgu değildir.
Aynı tondaki iç içe kartlar da bu çizgiyle ayrılır.

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

## Gezinme şeritleri

Gezinme şeritleri ekranın üstündeki ve altındaki sabit çubuklardır.
Telefonda bu iki çubuk ekranın en çok yüzde 15'ini kaplar.

| Görünüm | Üst şerit | Alt menü | Toplam pay |
|---|---|---|---|
| 320 × 720 dikey | 48 piksel | 56 piksel | yüzde 14,4 |
| 360 × 780 dikey | 48 piksel | 56 piksel | yüzde 13,3 |
| 390 × 844 dikey | 48 piksel | 56 piksel | yüzde 12,3 |
| 844 × 390 yatay | 44 piksel | 44 piksel | ilk açılışta yüzde 22,6 |
| 1280 × 800 masaüstü | 60 piksel | yok | yüzde 13,6 |

Yatay telefonda üst şerit sayfayla birlikte kayar. Sonra yalnız 44 piksellik alt menü kalır.
Masaüstünde alt menü yoktur. Bölüm sekmeleri üst şeridin altında durur.
Telefonun güvenli kenar boşluğu bu ölçülere eklenir. Bu boşluk dokunma alanı değildir.

Üst şerit her genişlikte tek satırdır. Soldan sağa şu öğeler durur:

1. Ürün işareti. Telefonda 24, masaüstünde 32 pikseldir.
2. Plan adı. Bu bağlantı planlar ekranını açar. Ad en çok iki satır olur.
3. Kayıt durumu.
4. Arama düğmesi.
5. Tema düğmesi.

600 pikselden dar ekranda kayıt durumu yalnız ikonla görünür. Ekran okuyucu tam metni duyar.
Kayıt sorunu varsa ekranın üstünde ayrıca bir uyarı çıkar. Örneğin "Plan kaydedilemedi" yazar.
Böylece plan adı her durumda en az 44 piksel genişlikte kalır.
Her durumun ikonu ayrıdır. Anlam yalnız renkle verilmez.

600 pikselden dar ekranda menü düğmesi yalnız alt menüdedir.
Üst şeritte aynı işi yapan ikinci düğme olmaz.
600 piksel ve daha geniş ekranda menü düğmesi üst şeritte de görünür.
Örneğin yatay telefon ve tablet bu gruptadır.

Alt menüde her hedef en az 44 × 44 pikseldir. Etiket 14 pikseldir.
Seçili öğede ikonun arkasında hap biçimli bir zemin durur. Hapın kenar çizgisi yoktur.
Seçili etiketin rengi `actionText` tokenıdır. Etiket zemine karşı en az 4,5:1 okunur.

Çekmece 320 pikselden geniş açılmaz. Sağda en az 56 piksel perde kalır.
Perdeye dokununca çekmece kapanır. Odak menüyü açan düğmeye döner.
Çekmecedeki sıra değişmez. Önce numaralı üç aşama gelir. Sonra numarasız "Destek ve teşvik" gelir.

Masaüstündeki bölüm sekmeleri sığmazsa ince kaydırma çubuğu görünür.
Böylece kullanıcı sağda başka sekme olduğunu anlar.

`tests/kabuk-olcu.spec.ts` bu ölçüleri iki temada gerçek tarayıcıda denetler.

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
Geçiş temel seçiciye yazılır. Böylece açılış ve kapanış aynı hareketle çalışır.
Örneğin `.kart:hover` kuralı geçiş tanımlıyorsa `.kart` kuralı da geçiş tanımlar.
`temel.css` ve `tokens.ts` aynı hareket değerlerini taşır. Birim testi iki kaynağın eşitliğini korur.
Kullanıcı hareketi azaltırsa mevcut azaltılmış hareket kuralı uygulanır. Yumuşak kaydırma da kapanır.

Fare üzerine gelince kartı kaldıran hareket yalnız farede çalışır.
Bu kural `@media (hover: hover) and (pointer: fine)` sorgusunun içinde durur.
Dokunmatik ekranda dokunuştan sonra kart kalkık kalmaz.
`tests/hareket.spec.ts` çekmecenin iki yönde aynı eğri ve süreyle çalıştığını ölçer.

## Ürün işareti ve tarayıcı simgeleri

Ürün işareti kapıya çıkan basamaklardır. Basamaklar sıralı kararları anlatır. Sağdaki çubuk kontrol kapısını anlatır.
İşaret kütüphane ikonu değildir. Tek kaynağı `src/assets/brand/mark.svg` dosyasıdır.
İşaret 24 birimlik ızgarada çizilir. Çizgi kalınlığı 2,5 birimdir. Böylece 16 pikselde de okunur.
İşaret iki token rengi kullanır: `actionPrimary` zemin, `onAction` çizgidir.

Tarayıcı simgelerini `scripts/build-icons.mjs` komutu üretir. Kaynak işaret değişince bu komutu çalıştırın.
Komut şu dosyaları `public` klasörüne yazar:

- `favicon.svg` ve 32 piksellik `favicon.ico`,
- 180 piksellik `apple-touch-icon.png`,
- 192 ve 512 piksellik simge,
- 512 piksellik maskable simge.

Maskable simgeyi telefon kendi biçimine göre kırpar. İşaret bu yüzden simgenin ortasında durur.

`manifest.webmanifest` dosyası uygulamanın adını, kısa adını ve simgelerini taşır.
Dosyadaki yollar göreli yazılır. Böylece GitHub Pages alt yolu korunur.
Service worker, sayfayı internetsiz çalıştıran tarayıcı betiğidir. Uygulama bu betiği kullanmaz.
Bu yüzden uygulama internetsiz çalışma sözü vermez.

Tarayıcı çubuğunun rengi üst şeridin rengiyle aynıdır. `index.html` açık ve koyu tema için iki renk taşır.
Kullanıcı temayı elle seçerse iki renk de seçilen temaya göre değişir.

## Grafik

Grafik renkleri `tokens.ts` içindeki `chartColors` nesnesinden gelir.
Renkler iki parlaklık bandına ayrılır: güçlü bant ve orta bant.
Komşu seriler ve dilimler iki bandı sırayla kullanır.
Böylece komşu iki renk birbirinden en az 3:1 ayrışır.
Her renk kart zemininden de en az 3:1 ayrışır.

Örneğin "Karar ilerlemesi" grafiğinde tamamlanan parça koyu laciverttir. Kalan parça orta gridir.
Eski renklerde bu iki parça yalnız 1,01:1 ayrışıyordu.

Bazı parçalar birbirine değer. Örneğin halka dilimleri, huni basamakları ve yığılı çubuk parçaları böyledir.
Bu parçaların arasında 2 piksel boşluk vardır. Boşluk kart zemininin rengindedir.
Halkanın ilk ve son dilimi aynı bantta olabilir. Bu çifti de boşluk ayırır.

Dilimin içindeki yazı bandın yazı rengini kullanır.
Açık temada güçlü dilimde beyaz yazı vardır. Orta dilimde koyu yazı vardır.
Bu yazı dilim rengine karşı en az 4,5:1 okunur.

Renk tek başına anlam taşımaz. Her grafikte şu üç yol vardır:

- Kısa bir özet cümlesi,
- Ekran okuyucunun her zaman bulduğu veri tablosu,
- Başlığı ve özeti okuyan ekran okuyucu açıklaması.

Bazı grafikler dar ekranda da yazıyla okunur.
Huni her basamağın adını ve sayısını yazar.
Karar zaman çizgisinde sonucun adı noktanın üstünde yazar. Noktanın şekli de sonuca göre değişir.
Kanıt grafiğinin açıklaması her basamağın sayısını yazar. Örneğin "1. basamak: 11" yazar.

Her grafik çizilmeden önce `src/charts/readable.ts` ayarından geçer.
Bu ayar adım ekranlarındaki grafiklere de uygulanır. Ayar şunları yapar:

- Eksen, etiket ve açıklama yazısını en az 14 piksel yapar.
- Rengi verilmeyen dilimlere bant rengini ve okunur yazı rengini verir.
- Yazısı dilimin içinde olan huniyi düzenler. En dar basamak en az yüzde 60 genişlikte olur.
  Böylece yazı basamağa sığar. Göstergeler ekranı geniş alanda bu sınırı yüzde 30'a indirir.
- Isı haritasına açık uçtan orta maviye giden bir renk aralığı verir.

Yazdırırken grafik açık temanın renkleriyle çizilir.
ECharts grafik dosyası ilk açılışta inmez. Grafik ekrana girince iner.

## Yazdırma

Her ekran yazdırılabilir. Yazdırırken gezinme öğeleri ve sabit şeritler kâğıda basılmaz.
Koyu tema seçili olsa da kâğıda açık tema basılır. Sayfa ekrana dönünce seçili tema geri gelir.
Ayrıntı [CSS mimarisindedir](css-mimarisi.md).
`tests/yazdirma.spec.ts` yazdırma görünümünü gerçek tarayıcıda ölçer.

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
