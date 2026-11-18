# Kalite kapıları

Kapı, kodu denetleyen bir kontroldür. Hata varsa kontrol başarısız olur.
Kontrolü geçmek için testi silmeyin veya kuralı gevşetmeyin.

## Komutlar

Komutları proje kökünde çalıştırın.

| Komut | Denetim |
|---|---|
| `npm run lint` | TypeScript tipleri ve arayüz kaynakları |
| `npm run check:ui` | Yalnız arayüz kaynakları |
| `npm run test:unit` | Vitest birim testleri |
| `npm run build` | Tip denetimi ve üretim derlemesi |
| `npm run test:e2e:ci` | Chromium ile 320 ve 1280 piksel görünümleri |
| `npm run test:e2e` | Yapılandırılmış Chromium ve WebKit projeleri |
| `npm run ci` | Lint, birim testleri ve Chromium testleri |

`npm run ci` derleme komutunu içermez. Derlemeyi ayrıca çalıştırın.
Firefox kullanıcı kararıyla çalıştırılmaz.

## Arayüz denetimi

`scripts/check-ui.mjs` dosyası `src` altındaki CSS, TypeScript ve TSX dosyalarını tarar.
TSX, React bileşenlerinin yazıldığı dosya biçimidir.
Denetim yedi kuralı uygular.

1. **Yazı boyutu.** Okunabilir yazı en az 14 piksel olmalıdır.
   Denetim sabit CSS değerlerini ve satır içi yazı boyutlarını bulur.
   `clamp()` işlevinin bilinen alt sınırını da denetler.
2. **Hareket.** Süreler ve eğriler ortak hareket değişkenlerinden gelmelidir.
   `transition: all` kullanılmaz. Hareket azaltma bloğunun mevcut istisnası korunur.
3. **Odak.** Normal odak kuralında çevreleyen halka veya gölge kullanılmaz.
   Yüksek karşıtlık istisnası ortak kullanıcı kuralına bağlıdır.
   Görünür klavye odağı ayrıca tarayıcıda denenir.
4. **Vurgu kenarı.** Aynı kutuda tek kenar çizgisi ve yuvarlatılmış köşe birleşmez.
   Denetim CSS kurallarını ve satır içi nesneleri inceler.
5. **Cihaz seçimi.** Kod davranışı `isMobile` veya `userAgent` ile seçmez.
   Yerleşim, işaretçi ve hover desteği ayrı değerlendirilir.
6. **Yalnız hover ile açılan eylem.** Hover, farenin öğenin üzerine gelmesidir.
   Gizli eylemin dokunma ve klavye yolu da bulunmalıdır.
   Denetim `opacity`, `display` ve `visibility` değişimlerini inceler.
   Ant Design `Popover` ve `Dropdown` tetiklerini de inceler.
   Yalnız hover tetikleyicisi varsa denetim hata verir.
7. **Dokunma alanı.** Bağımsız kontrol en az 44 × 44 piksel alan sağlamalıdır.
   Denetim bilinen genişlik, yükseklik ve alt sınırları inceler.
   Mantıksal boyut adlarını ve satır içi ölçüleri de inceler.
   Küçük Ant Design düğmesinde iki boyutun güvencesini arar.

İkon, rozet ve dekoratif SVG ölçüsü etkileşim alanı sayılmaz.
SVG, vektör çizim biçimidir. Örneğin 16 piksellik ikon, 44 piksellik düğmenin içinde bulunabilir.

Dokunma denetimi yüklenen CSS bağlantılarını izler.
Yüklenmeyen CSS dosyası bir ihlali geçerli hâle getiremez.
Denetim bilinen değişkenleri çözer. Yeterli alt sınırı ve geçersiz kılan kuralı birlikte değerlendirir.
Statik olarak ölçülebilen ek tıklama alanları da değerlendirilir.
Gerçek tıklama alanı ve komşu alanla çakışma ayrıca tarayıcıda ölçülür.

## Denetimin sınırı

Kaynak taraması tarayıcının bütün CSS hesaplarını taklit etmez.
Dinamik sınıflar, karmaşık seçiciler ve çalışma anında üretilen değerler ek kontrol gerektirir.
İçe aktarma sırası ve üçüncü taraf CSS üretimi de tarayıcıda doğrulanır.

Denetim temizse bütün ekranların erişilebilir olduğu sonucu çıkarılmaz.
Tablo taşması, kırpılma, gerçek yazı boyutu ve görünür odak tarayıcıda ölçülmelidir.
Ekran okuyucu ve gerçek cihaz denemeleri ayrı kanıttır.

Bir ihlal şu biçimde yazılır:

```text
src/components/Ornek.tsx:12 Dokunma alanı height için 44px sınırı doğrulanamıyor.
```

İhlal varsa çıkış kodu 1 olur. İhlal yoksa çıkış kodu 0 olur.
`src/theme/tokens.ts` ham kaynak değerlerini taşır. Mevcut kaynak istisnası yalnız bu dosyadır.

## Birim testleri

Arayüz denetiminin testleri `scripts/check-ui.test.ts` dosyasındadır.
Testler hatalı ve geçerli örnekleri birlikte kullanır.
Yeni anlamlı kural için önce başarısız test yazılır.
Sonra uygulama düzeltilir. Önceki kurallar korunur.

Ortak yoğunluk değerlerinin CSS ve TypeScript kaynakları birlikte korunur.
Görsel kontrol boyutu, gerçek etkileşim alanından ayrı denenir.
Yoğunluk seçimi yazıyı veya etkileşim alanını küçültemez.

## Tarayıcı ve port

Playwright varsayılan olarak 5179 portunu kullanır.
Bu projedeki gerçek port değişkeni `PW_PORT` adını taşır.
Örneğin İş 3 şu komutla çalışır:

```bash
PLAYWRIGHT_PORT=5203 PW_PORT=5203 npm run test:e2e:ci
```

`PLAYWRIGHT_PORT` görev metninde bulunur. Yapılandırma port için yalnız `PW_PORT` değerini okur.
Port doluysa başka boş port seçin. Başka işin sunucusunu kullanmayın.

Önce 320 pikselde ana yol denenir. Sonra kabul sırasındaki genişliklere geçilir.
Yoğunluk, dokunma, fare, klavye ve yön değişimi ayrıca denenir.
Açılan panelde yazı ve kontrol ölçüleri yeniden ölçülür.
Hareket azaltma, metin büyütme ve yüksek karşıtlık da denetlenir.

İş 3 geçici kanıtları `.pane/scratch` altında tutulur.
Koordinatörün sonraki denetim görevi, yeni hata testlerine izin verdi.
`tests/mobil-ortak.spec.ts`, M02, M06, M09 ve M12 bulgularını denetler.
Görünen odak, önceki ve sonraki görüntülerin boyanmış pikselleriyle karşılaştırılır.
44 piksel alan, 14 piksel yazı ve sabit başlığın etkisi ayrıca ölçülür.
Anahtarın şeffaf kenarları, gerçek ekran koordinatlarıyla tıklanır.
Bu dosya `test:e2e:ci` komutunun kapsamındadır.
Geniş kalıcı tarayıcı denetiminin sahibi teslim planındaki İş 8'dir.
WebKit emülasyonu gerçek Safari veya gerçek telefon denemesi sayılmaz.

## CI ve teslim

CI, uzak ortamda çalışan otomatik denetimdir.
Ayarı `.github/workflows/deploy.yml` dosyasındadır.
Mevcut iş akışı kurulumdan sonra lint, birim testi ve Chromium testini çalıştırır.
Ardından derleme ve GitHub Pages yayını gelir.
Bir kapı başarısız olursa sonraki adım çalışmaz.
Yerel başarı, uzak iş akışının başarısı değildir.

Teslim raporu gerçek komutları ve sonuçlarını içerir.
Sonuçlar `pass`, `fail`, `not_run` veya `not_applicable` olarak yazılır.
Çalıştırılmayan kontrol geçmiş sayılmaz.
Ekran görüntüsü, test izi ve bilinen açık sorunlar rapora bağlanır.
