# Klavye testlerinin son düzeltmesi donduruldu

Bu dosya alt görevin ara raporudur. Son sonuçlar [ana bulgu raporundadır](../mobil-bulgular.md).

İki test `tests/uyarlanir/klavye.spec.ts` dosyasında güncellendi. Son düzeltme, kesintisiz görünen çizgi bölümünü ölçüyor. Test dosyası bu teslimle donduruldu. Kaynak kod değiştirilmedi. Bu düzeltmeden sonra test veya derleyici çalıştırılmadı. Ana ajan yeni sürümü çalıştıracak.

Bu alt görevin dosya işi tamamlandı. Son kullanıcı talimatından sonra `klavye.spec.ts` değiştirilmedi. Yeni kapsam eklenmedi. Yalnız bu devir notu güncellendi.

Ana ajan testleri çalıştırıp sonuçları inceleyecek. Ardından `readFocus` ve `auditFocus` yardımcılarını ayrı dosyaya taşıyacak. Ana ajan bu yardımcıları klavye ana yolundaki form kontrollerine uygulayacak. Bu taşıma ve ek uygulama ana ajana aittir. Yardımcılar taşınırken mevcut eşikler ve hata ayrımı korunmalıdır. Son sürümün tarayıcı sonucu bu raporda hâlâ `not_run` durumundadır.

Ana ajanın `final-320` kaydı son düzeltmeye dayanak oldu. Chromium marka çizgisinin hesaplanan dikey aralığı yaklaşık 21,2 ile 38,8 pikseldi. Görüntüde mavi çizgi yaklaşık 26 pikselde başlıyordu. İlk örnek zemini, diğer iki örnek mavi çizgiyi buluyordu. Önceki tüm örnekleri eşleştirme şartı görünür çizgiyi reddediyordu.

İncelenen son kanıtlar şu klasördedir. Bu klasördeki `olcum.json` ve `odak-2.png` karşılaştırıldı:

```text
.pane/scratch/is8/final-320/uyarlanir-klavye-Tab-ve-Sh-f6527-a-ulaşılır-Enter-planı-açar-chromium-320/
```

Yeni ölçüm yalnız hesaplanan çizgi alanında arama yapıyor. Eşleşen bölüm en az 2 CSS piksel kalınlığında olmalıdır. Kesintisiz uzunluğu en az 8 CSS piksel olmalıdır. Tek bir eşleşen nokta yeterli değildir. Ayrı bölümlerin uzunlukları toplanmaz. Herhangi bir boşluk, o bölümün uzunluk sayımını bitirir. Boya rengi için önceki bir basamaklık yuvarlama sınırı korunur.

Kontrast hesabı yalnız bulunan boyalı bölümlerde yapılır. Bu bölümlerin iki komşu rengi de denetlenir. En düşük oran 3:1 altında kalırsa test başarısız olur. Görünür çizginin dışındaki zemin örneği kontrast hesabına katılmaz. Halka denetimi değiştirilmedi. Gerçekten gizli işaret yeterli boyalı bölüm üretemediği için reddedilir.

Görüntü alınmadan önce yazı tiplerinin yüklenmesi beklenir. Ardından iki çizim karesi beklenir. Görüntünün öncesinde ve sonrasında DOM durumu karşılaştırılır. DOM, tarayıcının sayfa öğeleri ağacıdır. Karşılaştırma odağı, stilleri, konumları ve kaydırma durumunu kapsar. Görünüm alanı ve yazı tipi durumu da karşılaştırılır. Kayıtlar değişirse en fazla üç yakalama yapılır. Kararlılık sağlanmazsa uygulama kusuru yerine ölçüm hatası kaydedilir.

`display: inline` için desteklenmeyen konum hesabı da ölçüm hatasıdır. Bu durum gizli odak diye etiketlenmez. Ölçüm bulgusu `klavye-olcum` adıyla İş 8'e yazılır. Doğrulanan odak kusurları `klavye-odak` adıyla İş 2'ye yazılır. Ölçüm hatası testi yine başarısız yapar. Ancak tek sorun ölçümse odak sonucu `not_run` kalır. Böylece bilinmeyen görünürlük başarılı veya uygulama kusuru olarak sunulmaz.

İlk kayıtlar `.pane/scratch/is8/journey-initial` klasöründedir. Chromium sürümü `156.0.8078.4`, WebKit sürümü `27.2` olarak kaydedilmiş. Telefon görünümü 320 × 720 CSS pikseldir. Masaüstü Chromium görünümü 1280 × 800 CSS pikseldir. Bunlar gerçek telefon denemesi değildir.

İlk çalışmada örnek plan üç projede de Enter ile açılmış. Arama penceresi Space ile açılmış. Ancak pencerenin erişilebilir adı boş kalmış. Erişilebilir ad, ekran okuyucunun pencereyi tanıtırken kullandığı addır. Kayıtlardaki `error-context.md` dosyaları adsız `dialog` öğesini gösteriyor.

Test artık pencereyi `getByRole('dialog')` ile buluyor. Ardından `expect.soft(dialog).toHaveAccessibleName('Komut paleti')` ad koşulunu denetliyor. Eksik ad testi yine başarısız yapıyor. Ancak ok ve Escape adımları aynı testte devam edebiliyor. Ad hatası ölçüm dosyasına ve ayrı ekran görüntüsüne ekleniyor. Sonuç dosyası pencere adını, klavye akışını ve görünür odağı ayrı değerlendiriyor.

Odak bulguları mevcut ekran görüntüleriyle karşılaştırıldı:

| Kontrol | Görüntüde görülen durum | Sonuç |
|---|---|---|
| Marka bağlantısı | Her iki motorda mavi çizgi görünür. | Önceki görünmezlik bulgusu yanlıştı. |
| Tema düğmesi | Her iki motorda mavi çizgi görünür. | Önceki görünmezlik açıklaması yanlıştı. |
| Tema çizgisinin renk farkı | Sol komşuyla oran yaklaşık 2,75:1. | 3:1 koşulu hâlâ sağlanmıyor. |

Karşılaştırmada dört görüntü kullanıldı. Bunlar aşağıdaki iki klasördeki `odak-2.png` ve `odak-4.png` dosyalarıdır:

```text
.pane/scratch/is8/journey-initial/uyarlanir-klavye-Tab-ve-Sh-f6527-a-ulaşılır-Enter-planı-açar-chromium-320/
.pane/scratch/is8/journey-initial/uyarlanir-klavye-Tab-ve-Sh-f6527-a-ulaşılır-Enter-planı-açar-webkit-320/
```

Görüntülerin renk noktaları yalnız okunarak karşılaştırıldı. Her iki motorda çizgi rengi `rgb(47, 91, 234)` çıktı. Marka çizgisinin iki yanında `rgb(15, 23, 41)` bulundu. Renk farkı yaklaşık 3,24:1 çıktı. Tema çizgisinin sol komşusu `rgb(27, 37, 64)` çıktı. Sağ komşusu marka çizgisiyle aynı koyu renkteydi.

Eski ölçüm `elementFromPoint` sonucunu görünürlük kanıtı sayıyordu. Bu işlev, verilen noktadaki tıklama hedefini bulur. Ancak `pointer-events: none` olan çizgi bu hedef olmayabilir. Komşu düğmenin tıklama alanı da bu noktaya uzanabilir. Görüntü, görünmezlik sonucunun yanlış olduğunu kanıtlıyor. İlk kayıt, yanlış sonucun kesin nedenini göstermiyor.

Kaynak CSS, odak çizgisine `pointer-events: none` uyguluyor. Yeni pseudo ölçümü `elementFromPoint` sonucuna bağlı değildir. `pointerEvents` yalnız açıklayıcı veri olarak kaydediliyor. `none` değeri, görünmezlik gerekçesi sayılmıyor. Bu değişiklik bağlantının ayrı alt çizgi kontrolünü değiştirmiyor.

Her çizginin `checks` kaydı beş sonucu ayrı gösteriyor. Bunlar stil, konum, kırpılma, görüntüdeki pikseller ve kontrasttır. Kontrast, çizgiyle komşu renk arasındaki farktır. İlk dört koşul görünürlüğü belirliyor. Görünür çizginin kontrastı ayrıca 3:1 eşiğiyle karşılaştırılıyor. Böylece görünür ama soluk çizgi, gizli diye raporlanmıyor. Eksik veya geçersiz piksel koordinatları da kabul edilmiyor.

Yeni ölçüm çizginin kesintisiz boyalı bölümünü görüntüden okuyor. Komşu renkleri de aynı görüntüden alıyor. Görüntü ölçüsü CSS pikseline sabitleniyor. Böylece WebKit'in iki kat görüntü yoğunluğu ölçümü kaydırmıyor. Görünmez çizgi ve düşük renk farkı ayrı hata olarak kaydediliyor. Yeni ölçümün tarayıcı doğrulaması henüz yapılmadı.

Konum hesabı `src/styles/global.css` ile yeniden karşılaştırıldı. Odak kuralı çizgiyi soldan −10 piksel uzağa koyuyor. Üst ve alt boşluklar 2 pikseldir. Çizginin genişliği 3 pikseldir. Bu kaynak bloğunda `transform` veya `translate` bildirimi yok. İlk ölçüm kaydı bu iki değeri içermiyor. Bu nedenle dönüşüm kaynaklı kayma, ilk çalışmanın doğrulanmış nedeni değildir.

Önceki konum hesabı, CSS dönüşümlerini hesaba katmıyordu. Yeni hesap şu bilgileri birlikte kullanıyor:

- Çizginin konumu, dış boşluğu, iç boşluğu ve kenarlığı hesaba katılıyor.
- `transform` içindeki yatay ve dikey kayma ile ölçek uygulanıyor.
- Ayrı `translate` değeri, piksel veya yüzde olarak çözülüyor.
- `transform-origin`, dönüşümün başladığı noktayı belirliyor. Ölçek bu noktaya göre uygulanıyor.
- Üst öğelerin ölçeği yerel uzaklıklara uygulanıyor. Kayma zaten öğenin ekran konumunda bulunuyor.
- Kontrolün kendi kaydırma uzaklığı konumdan çıkarılıyor.

Hesap, [MDN dönüşüm sırasını](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform) izliyor. Matris değerleri [DOMMatrixReadOnly](https://developer.mozilla.org/en-US/docs/Web/API/DOMMatrixReadOnly) ile okunuyor. Yeni konum ve dönüşüm değerleri ölçüm dosyasına yazılıyor. Her odak ölçümünün görüntüsü de saklanıyor. Başarılı ölçümlerin görüntüleri de bu kapsamdadır. Böylece ana ajan hesaplanan çizgi alanını ekran görüntüsüyle karşılaştırabilir.

Bu hesap yatay ve dikey eksenleri koruyan dönüşümlerle sınırlıdır. Döndürme, eğme ve üç boyutlu dönüşümler başarı sayılmaz. Desteklenmeyen konum hesabı ayrı bir ölçüm hatası üretir. Ölçüm hatası tek başına uygulamadaki odağın gizli olduğunu kanıtlamaz.

Kontrast eşiği hâlâ 3:1 değerindedir. Kabul edilen bölümün tamamı görünüm alanında ve kırpılma sınırları içinde kalmalıdır. Görünen bölüm 2 × 8 CSS piksel koşulunu karşılamalıdır. Üstü kapanan çizgi, beklenen renk görüntüde yoksa reddedilir. Metin alanındaki çizilmeyen `::before` parçası da reddedilir. Çevreleyen çerçeve ve gölge denetimleri değiştirilmedi. Boş pencere adını kaydeden `expect.soft` koşulu da korundu.

Yalnız test dosyası ve bu rapor değiştirildi. Uygulama kodu ve paket dosyaları değiştirilmedi. `audit.ts` işlevlerinin çağrı biçimleri korundu. Ortak yardımcı dosyada değişiklik gerekmiyor.

Testlerin beklediği davranışlar şunlardır:

1. Tab, “Örnek planı aç” düğmesine ulaşır. Shift+Tab önceki kontrole döner. Sonraki Tab aynı düğmeye döner. Enter örnek planın panosunu açar.
2. Space, “Ara” düğmesinden arama penceresini açar. Aşağı ve yukarı oklar sonuç seçimini taşır. Odak arama alanında kalır. Escape pencereyi kapatır. Odak görünür işaretiyle “Ara” düğmesine döner. Space aramayı yeniden açar. Test “Karar Kitabı” yazar. Enter ilgili ekranı açar.

Testler bütün gezinme adımlarında `page.keyboard` kullanır. Testler `focus()` çağrısıyla hedefe atlamaz. Uygulamanın kendi otomatik odak davranışı ayrıca denetlenir.

İlk test başlangıçtaki odak modunu da denetler. Ok, Escape ve harf tuşu bu modu açmamalıdır.

WebKit ileri gezinmede `Alt+Tab` kullanır. Geri gezinmede `Alt+Shift+Tab` kullanır. Chromium aynı işlemleri Tab ve Shift+Tab ile yapar. Bu seçim mevcut `tests/smoke.spec.ts` uygulamasıyla aynıdır. [Playwright ekibinin açıklaması](https://github.com/microsoft/playwright/issues/5609) bu tuş farkını açıklar. Ana ajanın ilk kayıtlarında iki gezinme yolu da örnek plana ulaşmış.

Odak kontrolü normal renk modunda çalışır. Kontrol, öğenin hesaplanan stilini ve çevresindeki görünür alanı inceler. Çevreleyen `outline` çerçevesi veya gölge halkası testi başarısız yapar. Şeffaf, gizli veya tamamen ekran dışındaki işaret yeterli sayılmaz. Kırpılan işaretin kalan bölümü de boyut koşulunu karşılamalıdır. İşaretin çevresindeki renkten ayrılması için en az 3:1 renk farkı aranır. Birden fazla görünür odak işareti de hata sayılır.

CSS, arayüzün görünümünü belirleyen stil dilidir. Kontrol yalnız `::before` genişliğini kanıt saymaz. `::before`, öğenin önüne CSS ile eklenen görsel parçadır. Metin alanında bu değer görünür bir kutu anlamına gelmez. [MDN form rehberi](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/UI_pseudo-classes) bu sınırlamayı açıklar.

Görsel hatalar aynı testte sonraki tuşların denenmesini durdurmaz. Ancak bu hatalar testi yine başarısız yapar. Her odak adımında ekran görüntüsü eklenir. Sonuç dosyası odak ölçümlerini ve işlevsel akışın sonucunu ayrı tutar. Mevcut `saveEvidence` işlevi son ekranı ve ölçüm dosyasını kaydeder.

İlk kaynak incelemesinde şu riskler görüldü. Bu maddeler tek başına tarayıcı hatası kanıtı değildir:

- `src/styles/global.css:37` genel odak çerçevesini kaldırıyor. Görsel alternatif bütün kontrollerde ayrıca doğrulanmalıdır.
- `src/styles/global.css:40` işareti doğrudan odaklanan öğenin `::before` parçasına koyuyor. Arama alanı bu kurala bağlıdır. Metin alanının görünür işareti eksik kalabilir.
- `src/styles/global.css:43` işareti kontrolün 10 piksel dışına koyuyor. Dar veya kırpan bir kapsayıcı işareti kesebilir.
- `src/styles/global.css:50` bağlantıya alt çizgi ekliyor. Aynı bağlantının dış işareti de görünürse iki gösterge oluşur.
- `src/styles/global.css:53` özel renk modunda çerçeve ekliyor. Ancak genel `outline: none !important` kuralı bu bildirimi bastırıyor. Aynı özel mod dış işareti gizliyor. Bu nedenle özel renk modu ayrı denetlenmelidir.

Uygulama düzeltmelerinin sahibi İş 2'dir. Bu görev uygulama düzeltmesi yapmadı. `FocusMode.tsx` kaynağı Tab olayında modu açıyor. Kaynak, fare ve dokunma olayında yalnız görsel modu kapatıyor.

Ölçüm mevcut düz renkleri ve mevcut odak biçimini kapsar. Çizgi üzerindeki piksel örnekleri okunur. Tam ekranı geçmiş görüntüyle karşılaştıran test eklenmedi. Yeni odak biçimi eklenirse yerel ölçüm işlevi de gözden geçirilmelidir. Özellikle metin alanının kapsayıcısına eklenen alternatif işaret ayrıca tanımlanmalıdır.

Kilit dosyası seçilen paket sürümlerini kaydeder. Sürüm bilgileri ayrı kaydedildi:

| Araç | Paket dosyasındaki aralık | Kilit dosyası | Gözlenen çalışma sürümü |
|---|---|---|---|
| Playwright | `^1.64.1` | `1.64.1` | Bilinmiyor. Test çalıştırılmadı. |
| TypeScript | `^5.9.3` | `5.9.3` | Bilinmiyor. Derleyici çalıştırılmadı. |
| React | `^19.3.1` | `19.3.1` | Bilinmiyor. Uygulama çalıştırılmadı. |
| Ant Design | `^6.7.0` | `6.7.0` | Bilinmiyor. Uygulama çalıştırılmadı. |
| Node.js | Belirtilmemiş | Uygulanmaz | `v24.21.0` |

Kontrollerin durumu aşağıdadır. `not_run`, güncel sürümde kontrolün çalıştırılmadığını belirtir.

| Kontrol | Durum | Açıklama |
|---|---|---|
| Kaynak incelemesi | `pass` | İki testin akışı kaynakla karşılaştırıldı. |
| Önceki ekran görüntülerinin incelemesi | `pass` | Dört odak görüntüsü ölçüm kayıtlarıyla karşılaştırıldı. |
| `final-320` marka kanıtının incelemesi | `pass` | İlk piksel örneğinin zemine denk geldiği kayıttan doğrulandı. |
| Boş pencere adı | `fail` | İlk üç proje kaydında pencerenin adı boş. |
| Dosyaların boşluk denetimi | `not_run` | Güncel sürümde otomatik kontrol çalıştırılmadı. |
| Türkçe yazım denetimi | `not_run` | Son ekler elle incelendi. Otomatik denetim tekrarlanmadı. |
| Güncel Chromium ve WebKit testleri | `not_run` | Görev gereği ana ajan çalıştıracak. |
| TypeScript denetimi | `not_run` | Ana ajan ortak test dosyalarını birlikte denetleyecek. |
| Gerçek Safari ve gerçek cihaz | `not_run` | Tarayıcı veya cihaz kullanılmadı. |
| Özel renk modu | `not_run` | İki test normal renk moduyla sınırlıdır. |
| Fare ve dokunma | `not_run` | Bu dosya klavye yolunu kapsar. |
| Bağımsız inceleme | `not_run` | Bu alt görevde başka ajan başlatılmadı. |

İlk teslimde şu denetim komutları çalıştırıldı:

```sh
git diff --no-index --check /dev/null tests/uyarlanir/klavye.spec.ts
git diff --no-index --check /dev/null docs/qa/alt-gorevler/05-keyboard.md
node /Users/w6x/.claude/skills/coding-standards/scripts/yalin-turkce-denetim.mjs docs/qa/alt-gorevler/05-keyboard.md --tur aciklama
```

Git denetimleri boşluk uyarısı üretmedi. Yeni dosyalar boş dosyadan farklı olduğu için çıkış kodları 1 oldu. Yazım denetiminin çıkış kodu 0 oldu. Yazım denetimi uzun kelimeler için tek toplu uyarı verdi. Uyarıdaki günlük kelimeler ve gerekli teknik adlar korundu.

Ana ajan önce 320 piksel projelerini yeniden çalıştırmalıdır. Marka çizgisinin `segments` kaydı görünen kesintisiz bölümü göstermelidir. `stableCapture` değeri `true` olmalıdır. Tema çizgisinin düşük renk farkı başarısız kalmalıdır. Eksik pencere adı da başarısız kalmalıdır. Ok ve Escape adımları bu hatalardan sonra devam etmelidir. Aşağıdaki komut güncel sürümde çalıştırılmadı. Komut test sunucusunu da başlatır.

```sh
npm run test:e2e -- tests/uyarlanir/klavye.spec.ts --project=chromium-320 --project=webkit-320
```

Çalışma dizini `/Users/w6x/Developer/decisionactplanclaude/worktrees/mobil-qa-1` konumudur. Ana ajan boş portu ve çıktı klasörünü kendi çalışma ayarlarında seçmelidir.

Gerçek okurla denenmedi.
