# Ölçüm yardımcısı incelemesi

Bu dosya alt görevin ara raporudur. Son sonuçlar [ana bulgu raporundadır](../mobil-bulgular.md).

## Son iki düzeltme ve toplu ölçüm

İnceleme yalnız son iki düzeltmeyi ve `measureTargets` ekini kapsadı. Kaynaklar ve sonuç dosyaları dosya okuma aracıyla incelendi. Bu sınırlı farkta yeni somut hata saptanmadı.

### Sonuç kayıtları

Aşağıdaki kayıtlar `.pane/scratch/is8` klasöründen okundu. Her testin sonuç durumu ayrıca sayıldı.

| Kayıt | Geçen | Başarısız | Kapsam |
|---|---:|---:|---|
| `probe-extra-red.json` | 0 | 4 | İki yeni örneğin iki tarayıcıdaki ilk çalışması |
| `probe-extra-green.json` | 30 | 0 | Önceki 26 ölçüm ve 4 yeni sonuç |
| `probe-complete.json` | 32 | 0 | Önceki 26 ölçüm ve 6 ek sonuç |

`probe-complete.json` tamamlanmış bir sonuç dosyasıdır. Son kayıtta atlanan veya kararsız test bulunmuyor. Dosya düzeyindeki hata listesi de boştur. Chromium ve WebKit için 16'şar başarılı sonuç vardır. Kayıt Playwright sürümünü `1.64.1` olarak bildiriyor.

Son 32 sonuç iki ölçüm dosyasından geliyor. `olcum.spec.ts` 26, `olcum-ek.spec.ts` 6 sonuç içeriyor. Toplam 16 ayrı örnek iki tarayıcıda çalışmış. Klavye ana yolunun önceki sonuçları bu sayıya dahil değildir.

### N1 kapatıldı

`audit.ts:108-112` ipucunun saydamlığını ve görünürlüğünü denetliyor. Görünmeyen ipucu artık alan metnine katılmıyor.

`olcum-ek.spec.ts:4-8` aynı ipucunu önce saydam, sonra görünür durumda deniyor. Saydam durumda yazı bulgusu beklenmiyor. Görünür durumda 13 piksel yazı hatası bekleniyor. İlk kayıtta iki tarayıcı saydam ipucu için yanlış hata üretmiş. Son kayıtta iki durum da beklenen sonucu vermiş.

Önceki N1 bu örnek kapsamında kapatıldı. Aşağıdaki eski N1 bölümü tarihsel kayıttır.

### Kart bağlantısının ek alanı düzeltildi

`audit.ts:150-174` ek alanın konumunu taşıyan üst öğeyi buluyor. Kod başlangıç noktasına bu öğenin kenarlığını da ekliyor. `audit.ts:175-176` dört noktanın bağlantıya ulaştığını denetliyor.

`olcum-ek.spec.ts:11-23` bu davranışı sınar. Bağlantı `position: static`, üst kart `position: relative` kullanıyor. Bağlantının `::after` alanı kartı kaplıyor. Test kartın köşesine dokununca bağlantının açıldığını doğruluyor. Ardından tekli ve toplu ölçümün hata vermemesini bekliyor.

İlk kayıtta bağlantı çalışmasına rağmen küçük alan hatası oluşmuş. Son kayıtta bu örnek iki tarayıcıda da geçmiş.

### Toplu ölçümün davranışı korundu

`audit.ts:188-205` sıradan kutuları tek `page.evaluate` çağrısında ölçüyor. `audit.ts:208` ek alan gerektiren adayları `measureTarget` yöntemine gönderiyor. Böylece dört noktalı kontrol korunuyor. `ekranlar.spec.ts:17` yeni toplu yöntemi kullanıyor.

`olcum-ek.spec.ts:26-31` tekli ve toplu ölçüm sonuçlarını karşılaştırıyor. Test küçük kutunun hata verdiğini doğruluyor. Büyük kutunun hata vermediğini de doğruluyor. İki tarayıcıda bu karşılaştırma geçmiş. Kart bağlantısı örneği de toplu yöntemin ek alanı hesaba kattığını gösteriyor.

Bu kanıtlar belirtilen örneklerde davranışın korunduğunu gösterir. Sayısal hız kazanımı ölçülmüş sayılmadı. Canvas ve bütün dokunma alanının erişimi için önceki sınırlar korunuyor.

### Teslim

Yalnız bu rapora yeni bölüm eklendi. Kaynak, test ve yapılandırma değiştirilmedi. Test veya kabuk komutu çalıştırılmadı. Başka ajan başlatılmadı.

Kullanıcının komut yasağı nedeniyle Türkçe denetim betiği çalıştırılmadı. Yeni bölümün dili elle denetlendi. İnceleme bu kapsamda tamamlandı.


## Belirlenen kapsamın tamamlanması

Güncel `audit.ts` ve `probe-final.json` yeniden okundu. İnceleme mevcut 26 ölçüm sonucu kapsamında tamamlandı. Kaynak dosyanın özeti önceki incelemeyle aynı kaldı.

`probe-final.json` içindeki 26 ölçüm sonucunun tamamı `passed` durumundadır. Bunlar 13 ayrı örneğin iki tarayıcıdaki çalışmasıdır. Chromium için 13, WebKit için 13 ölçüm sonucu vardır. Aynı kayıttaki iki klavye testi de geçmiştir. Toplam 28 başarılı sonuç vardır. Başarısız, atlanan veya kararsız sonuç yoktur.

Bu 26 ölçüm sonucu içinde yeni bir yanlış sonuç saptanmadı. Önceki N1 kaynak notu raporda korunuyor. N1 bu testlerde gözlenmiş bir başarısızlık değildir. Tarayıcıda yeniden üretim durumu `not_run` olarak kalır.

Canvas ölçümü ve bütün dokunma alanının erişimi bu başarı kapsamına eklenmedi. `ekranlar.spec.ts:25` Canvas ölçümünü `not_run` olarak ayırıyor. `ekranlar.spec.ts:27` tam alan erişiminin kanıtlanmadığını açıklıyor. Bu iki kayıt davranışı kaynak üzerinden doğrulandı.

Yalnız inceleme raporu güncellendi. Kaynak, test ve yapılandırma değiştirilmedi. Test çalıştırılmadı ve başka ajan başlatılmadı. Görev mevcut kanıtlar ve belirtilen sınırlar içinde tamamlandı.

## Son bağımsız inceleme

Güncel kaynaklar ve mevcut sonuç dosyaları salt okunur incelendi. Test çalıştırılmadı. Yalnız bu rapor güncellendi.

Son kayıttaki 28 testin tamamı geçmiş. Kaynak incelemesinde bir yeni yanlış hata üretme koşulu bulundu. Bu koşul mevcut test sonuçlarında yeniden üretilmiş değildir.

### Gerçek sonuç kayıtları

Aşağıdaki dosyalar `.pane/scratch/is8` klasöründen okundu. Sayılar yalnız özet alanından alınmadı. Her testin gerçek sonuç durumu da sayıldı.

| Kayıt | Geçen | Başarısız | Kapsam |
|---|---:|---:|---|
| `probe-red.json` | 15 | 9 | Önceki yardımcı testleri |
| `probe-green.json` | 24 | 0 | Düzeltilen yardımcı testleri |
| `left-red.json` | 0 | 2 | Sola taşma testi |
| `probe-final.json` | 28 | 0 | 26 yardımcı testi ve 2 klavye testi |

Kayıtlarda atlanan veya kararsız test bulunmuyor. Son kayıtta Chromium ve WebKit için 14'er sonuç var. Çalışan Playwright sürümü kayıtlarda `1.64.1` olarak görünüyor.

Önceki dokuz hata, beklenen ölçümle gerçek ölçümün uyuşmamasından kaynaklanmış. Bunlar kurulum veya sunucu hatası değildir. Sola taşma denemelerinde de iki tarayıcı boş bulgu listesi döndürmüş. Son kayıtta aynı sola taşma testi iki tarayıcıda da geçmiş.

Klavye kayıtları 320 × 720 CSS piksel görünümünü bildiriyor. Chromium sürümü `156.0.8078.4`, WebKit sürümü `27.2` olarak kaydedilmiş. Ortam `darwin`, sistem sürümü `25.5.0`, işlemci türü `arm64` olarak yazılmış. Bunlar kayıtlardan okunan bilgilerdir. WebKit sonucu gerçek Safari veya fiziksel telefon sonucu değildir.

İki klavye kaydında `journey: pass` ve boş bulgu listesi bulunuyor. İki görüntü eki ve iki ölçüm eki diskte bulunuyor. Ölçüm dosyalarındaki asıl görüntü yolları da mevcut dosyalara ulaşıyor. Görüntülerin içeriği bu turda görsel olarak incelenmedi.

### Önceki bulguların güncel durumu

| Bulgu | Güncel durum ve dayanak |
|---|---|
| B1 | Canvas ölçümü tamamlanmış sayılmıyor. `ekranlar.spec.ts:25` bu kapsamı `not_run` olarak kaydediyor. |
| B2 | Bildirilen küçük form alanı örneği düzeltildi. `audit.ts:125-126` seçimi genişletiyor. İki tarayıcıdaki ilgili test geçti. |
| B3 | Tam alan örtülmesi kanıtlanmış sayılmıyor. `ekranlar.spec.ts:27` sınırı açık yazıyor. Bu durum tamamlanmış erişim denetimi değildir. |
| B4 | Bildirilen sola taşma örneği düzeltildi. `audit.ts:94-104` sol sınırı denetliyor. Önce iki başarısız sonuç, sonra iki başarılı sonuç kaydedildi. |
| B5 | Bildirilen yatay kırpılma örneği düzeltildi. `audit.ts:62-64` yatay sınırları karşılaştırıyor. İlgili iki test geçti. |
| B6 | Görünen alan ipucunun boyutu artık ölçülüyor. `audit.ts:112-115` kendi stilini okuyor. İlgili iki test geçti. |

Kenarlıklı ek dokunma alanı da iki tarayıcıda geçmiş. `audit.ts:149-150` başlangıç noktasına kenarlık genişliğini ekliyor. Pencereli çalışma etiketi `audit.ts:180` satırında yapılandırmaya göre seçiliyor.

`probe-final.json` içinde `ekranlar.spec.ts` çalışması bulunmuyor. Bu nedenle Canvas durum kaydı ve kapsam açıklaması yalnız kaynak üzerinden doğrulandı. SVG yazısı bu 26 yardımcı testin konusu değildir. Önceki SVG belirsizliği kapanmış sayılmadı.

### N1. Görünmeyen alan ipucu hata sayılıyor (P2)

Kaynak, `tests/uyarlanir/audit.ts:107-115` satırlarıdır. Kod alanın görünürlüğünü denetliyor. Ancak alan ipucunun kendi saydamlığını denetlemiyor.

Tetikleyici, görünür ve boş bir metin alanıdır. Alanın yazısı 16 piksel olsun. `::placeholder` yazısı 13 piksel, `opacity` değeri sıfır olsun. Kod görünmeyen ipucunu metin sayısına ekler. Ardından `yazi` bulgusu üretir. Görünen yazıyı ölçme sözleşmesine göre bu yanlış hata sonucudur.

Bu sonuç mevcut karar yolundan çıkarılır. Tarayıcıda yeniden üretim `not_run` durumundadır. `olcum.spec.ts:85-99` yalnız `opacity: 1` olan ipuçlarını sınar. Dolayısıyla 28 başarılı sonuç bu koşulu kapsamaz.

Ana ajan ipucunun görünürlüğünü, boyut kontrolünden önce değerlendirmelidir. Görünmeyen ipucu metin sayısını artırmamalıdır. Aynı örnekte saydamlığı kaldırınca 13 piksel hatası bulunmalıdır. Alan ipucunun ayrı metin olduğu [CSS Pseudo-Elements taslağında](https://drafts.csswg.org/css-pseudo/#placeholder-pseudo) açıklanır.

### İncelemenin sınırı

Mevcut sonuçlarda kalan başarısız test bulunmadı. N1 kaynak incelemesi bulgusudur. Uygulamada görülmüş bir ekran hatası olarak sunulmuyor. Canvas ve tam alan örtülmesi için bildirilen kapsam sınırları korundu.

İncelenen güncel dosyaların SHA-256 özetleri şöyledir:

- `audit.ts`: `0098a9597bf3180a0f7eec00352134c8a0e13ff4ec193ed1942a98468272dd71`
- `ekranlar.spec.ts`: `aa34a7c2c1064a16cf646a121691b75afc4b2c8f88a50da8b311ff4702f9cac8`

Kaynak, test ve yapılandırma değiştirilmedi. Yeni ajan başlatılmadı. Yeni tarayıcı çalışması veya uygulama testi yapılmadı. Aşağıdaki bölüm önceki kaynak sürümünün tarihsel inceleme kaydıdır.

## İlk inceleme kaydı

Yalnız bu rapor yazıldı. `tests/uyarlanir/audit.ts` salt okunur incelendi. Yardımcıların parametreleri ve dönüş türleri değişmedi.

Kaynakta altı ölçüm açığı bulundu. Bu açıklar uygulamada gözlenmiş ekran hataları değildir. Tetikleyiciler kaynak üzerinden çıkarıldı. Tarayıcıda yeniden üretim yapılmadı.

Beklenen davranış, görünen yazıları ve gerçek dokunma alanlarını ölçmektir. Ölçülemeyen içerik başarılı sayılmamalıdır. Sayfanın iki yanındaki taşma ve bulgunun görüntü kaydı da korunmalıdır.

İncelenen dosyanın SHA-256 özeti şöyledir:

`9cd551d285bbb67cb6a2f4cf4e7222fe004fd4a3bec96389e0a3dfb971d32c28`

## Kaynakta doğrulanan açıklar

P1, hatalı başarı sonucu doğurabilecek önemli açığı belirtir. P2, ölçüm doğruluğunu etkileyen diğer açığı belirtir.

### B1. Grafik yazıları ölçülmüyor (P1)

Kaynak, `audit.ts:80` ve `audit.ts:87-99` satırlarıdır. Kod yalnız sayfa öğelerindeki metni, alan değerlerini ve CSS içeriğini okuyor. Canvas, yazının resim gibi çizildiği yüzeydir. Canvas üzerindeki yazı bu okumaya girmez. Çizgiye dönüştürülmüş SVG yazısı da metin düğümü içermez.

Tetikleyici, normal başlığın yanında 10 piksel yazı çizen bir grafiktir. Başlık metin sayısını artırır. Grafik yazısı için bulgu oluşmaz. Bu sonuç kaynak akışından çıkarılır. Canvas çizim sözleşmesi [HTML standardında](https://html.spec.whatwg.org/multipage/canvas.html#drawing-text-to-the-bitmap) açıklanır.

Ana ajan grafik yazıları için ayrı ölçüm eklemelidir. Ölçüm yoksa grafik kapsamını `not_run` olarak kaydetmelidir. Olağan SVG metni hakkındaki sınır aşağıda ayrıca belirtilmiştir.

### B2. Bazı dokunma kontrolleri seçilmiyor (P1)

Kaynak, `audit.ts:103-107` satırlarıdır. Seçim yalnız `button`, `a` ve `[role="button"]` öğelerini kapsıyor. Metin alanları, seçim kutuları ve diğer etkileşimli roller kapsam dışında kalıyor.

Tetikleyici, yüksekliği 30 piksel olan görünür bir metin alanıdır. Alan `smallTargets` listesine girmez. Beklenen sınır, proje planındaki 44 × 44 CSS pikseldir.

Ana ajan kontrol seçimini gerçek form ve bileşen rollerine göre genişletmelidir. Etkisiz bağlantıları ve kapalı kontrolleri ayrıca sınıflandırmalıdır.

### B3. Büyük kutu gerçek dokunma alanı sayılıyor (P1)

Kaynak, `audit.ts:104-106`, `audit.ts:119` ve `audit.ts:127-134` satırlarıdır. Büyük kutular ayrıntılı ölçüme gönderilmiyor. `measureTarget` da başlangıç kutusunun erişilebilirliğini doğrulamıyor. Kod yalnız CSS ile eklenen alanlarda dört kenar noktasını kontrol ediyor.

Tetikleyici, 44 × 44 piksellik düğmenin ortasını kapatan başka bir öğedir. Düğme kutusu yeterli olsa da gerçek dokunma alanı küçülür. Yardımcı bu kaybı ölçmez. Dört noktanın geçmesi de aradaki alanın açık olduğunu kanıtlamaz.

Ana ajan tüm adaylarda örtülmeyi, kırpılmayı ve alan bütünlüğünü denetlemelidir. Görünen kutu ile dokunulabilen alanı ayrı kaydetmelidir. `ekranlar.spec.ts:16-19` çağrısı da küçük adaylarla sınırlıdır. Çağıran testin değişmesi gerekecektir.

### B4. Sola taşan içerik kaçabiliyor (P1)

Kaynak, `audit.ts:81-84` satırlarıdır. Kod yalnız `scrollWidth > innerWidth` koşulunu kullanıyor. Öğelerin sol sınırını ölçmüyor.

Tetikleyici, soldan sağa düzende sola 20 piksel kaymış bir öğedir. Kaydırılabilir genişlik büyümezse taşma bulgusu oluşmaz. Bu çıkarım [CSSOM View taslağındaki kaydırma alanı tanımına](https://drafts.csswg.org/cssom-view/#scrolling-area) dayanır.

Ana ajan görünür içerikte sol ve sağ sınırları ayrıca ölçmelidir. Kendi kutusunda kaydırılan tabloyu sayfa taşmasından ayırmalıdır. Kasıtlı gizli içerik için de açık bir ayrım yapmalıdır.

### B5. Yatayda gizlenen metin görünür sayılabiliyor (P2)

Kaynak, `audit.ts:50-63` satırlarıdır. Kod kırpılan içeriğin yalnız dikey sınırlarını karşılaştırıyor. Yatay sınır karşılaştırması yoktur. Ayrıca yalnız iki belirli `clip` ve `clipPath` yazımını tanıyor.

Tetikleyici, `overflow: hidden` kutusunun tamamen sağında kalan 12 piksellik metindir. Metnin dikey aralığı kutuyla örtüşür. Kod bu metni görünür sayıp yazı hatası üretebilir. `checkVisibility()` tam görünürlük ölçümü değildir. [CSSOM View taslağı](https://drafts.csswg.org/cssom-view/#dom-element-checkvisibility) bu yöntemin sınırlı kontrollerini açıklar.

Ana ajan yatay ve dikey kırpılmayı birlikte hesaplamalıdır. Farklı gizleme biçimleri için ayrı örnekler hazırlamalıdır. Gizli yazı ile kısmen görünen yazıyı ayırmalıdır.

### B6. Alan ipucunun kendi yazı boyutu ölçülmüyor (P2)

Kaynak, `audit.ts:89-99` satırlarıdır. Kod boş alanın ipucunu `placeholder` üzerinden okuyor. Yazı boyutunu ise alanın kendisinden alıyor. CSS tarafından üretilen öğe denetimi yalnız `::before` ve `::after` içeriyor.

Tetikleyici, 16 piksellik alan içindeki 10 piksellik `::placeholder` yazısıdır. Kod 16 piksel okuduğundan küçük ipucu için bulgu üretmez.

Ana ajan görünen ipucunun kendi hesaplanmış yazı boyutunu ölçmelidir. Boş alan ve doldurulmuş alan durumlarını ayrı denemelidir.

## Görüntü yolu ve kanıt sınırı

`audit.ts:140` testin kendi çıktı yolunu kullanıyor. Bu yöntem paralel testlerin dosyalarını ayırır. Bu güvence [Playwright belgesinde](https://playwright.dev/docs/api/class-testinfo#test-info-output-path) açıklanır. Dosyaların gerçekten üretildiği bu incelemede doğrulanmadı.

`audit.ts:140` ve `audit.ts:157` dosya adlarını sabit tutuyor. Aynı testte ikinci kayıt ilk `ekran.png` ve `olcum.json` dosyalarının üzerine yazar. İncelenen ekran ve panel testlerinde böyle bir tekrar görülmedi. Bu nedenle mevcut kayıt kaybı iddiası yoktur.

Ana ajan tekrarlı kayıt gerekiyorsa durum adı veya sıra numarası kullanmalıdır. `audit.ts:142` yalnız eksik görüntü yollarını dolduruyor. Önceden verilmiş yolun varlığı ve doğru durumu göstermesi ayrıca doğrulanmalıdır.

## Doğrulanmayan varsayımlar

- Olağan SVG `<text>` ve `<tspan>` öğeleri açıkça dışlanmıyor. Ancak `audit.ts:51` görünürlük kontrolünün hedef tarayıcılardaki sonucu denenmedi. Bütün SVG yazılarının atlandığı söylenemez.
- SVG ölçekleme ve dönüşümleri için ayrı ölçüm yoktur. `audit.ts:92` yalnız hesaplanmış `fontSize` değerini okuyor. Gerçekte görünen boyuta etkisi tarayıcıda doğrulanmalıdır.
- `audit.ts:124-126` ek alanı konum ve boyut değerlerinden hesaplıyor. Dönüşüm, kenarlık ve boşluk etkileri ayrıca işlenmiyor. Bu durumların yanlış ölçüm ürettiği henüz denenmedi.
- `audit.ts:15-20` başlık, font ve iki çizim karesini bekliyor. Bu bekleme geç yüklenen grafiğin tamamlandığını kanıtlamaz. İlgili ekranın hazır durumu ayrıca doğrulanmalıdır.
- `audit.ts:154` çalışmayı daima `isolated-headless-emulation` olarak kaydediyor. Pencereli çalıştırmada bu kayıt yanıltıcı olur. İncelenen kaynak, böyle bir çalıştırmanın gerçekleştiğini göstermiyor.

## Ana ajana devir ve doğrulama

Ana ajan önce altı tetikleyiciyi küçük tarayıcı örnekleriyle doğrulamalıdır. Sonra ölçüm yardımcısını ve gerekli çağıran testleri düzeltmelidir. Mevcut parametreler ve dönüş türleri korunmalıdır. Desteklenmeyen kapsamın kaydı için çağıran testlerle ortak karar gerekir.

Paket bildirimi Playwright için `^1.64.1`, TypeScript için `^5.9.3` içeriyor. Kilit dosyası sırasıyla `1.64.1` ve `5.9.3` kaydediyor. Proje araçlarının gerçekten çalışan sürümleri bu incelemede doğrulanmadı.

- Kaynak incelemesi tamamlandı. Altı açık kaynak üzerinden saptandı.
- Chromium, WebKit ve diğer uygulama testleri `not_run` durumundadır. Görev gereği testleri ana ajan çalıştıracaktır.
- Firefox çalıştırılmadı. Sunucu başlatılmadı ve paket kurulmadı.
- Gerçek cihaz, görsel karşılaştırma ve CI kontrolleri `not_run` durumundadır.
- Uygulama ve test kaynakları değiştirilmedi. Git geçmişini değiştiren işlem yapılmadı.
- Gerçek okurla denenmedi.

Raporun Türkçe denetimi aşağıdaki komutla çalıştırıldı:

```sh
node /Users/w6x/.claude/skills/coding-standards/scripts/yalin-turkce-denetim.mjs --tur aciklama docs/qa/alt-gorevler/10-audit-review.md
```

Çalışma dizini `decisionactplanclaude/worktrees/mobil-qa-1` idi. Denetim hata bulmadı. Uzun kelime uyarısı elle incelendi. Teknik adlar ve gerekli koşullar korundu. Bu komut uygulama testi çalıştırmaz. `shasum -a 256 tests/uyarlanir/audit.ts` sonucu inceleme öncesiyle aynı kaldı.
