# İş 8 kapsam incelemesi

Bu dosya alt görevin ara raporudur. Son sonuçlar [ana bulgu raporundadır](../mobil-bulgular.md).

İnceleme tarihi 18 Kasım 2026 Çarşamba günüdür. Dal `mobil-qa-1`, başlangıç kaydı `c6736e9` olarak okundu. İnceleme, henüz Git kaydına alınmamış test dosyalarını da kapsar.

Bu alt görev yalnız bu raporu ekledi. Kaynak, test ve paket dosyalarını değiştirmedim. Test çalıştırmadım. Yardımcı işlevlerin imzalarını korudum. Diğer ajanların sonraki değişiklikleri bu incelemeyi değiştirebilir.

Beklenen davranış, plandaki genişliklerde okunabilir ve kullanılabilir ekranlardır. Sayfa yana taşmamalı, yazı en az 14 CSS piksel olmalıdır. Ana yol üç giriş yöntemiyle çalışmalıdır. Yön değişince form verisi ve odak korunmalıdır.

## Kaynakta bulunan kapsam

Aşağıdaki tablo test tanımlarını gösterir. Çalışma sonuçlarının tamamı bu alt görevde `not_run`, yani çalıştırılmadı durumundadır.

| Plan koşulu | Kaynakta bulunan karşılık | Sınır |
|---|---|---|
| Kabul genişlikleri | `playwright.config.ts:34` iki tarayıcı için sekizer proje tanımlar. | Chromium ve WebKit kullanılır. Firefox kapsam dışıdır. |
| Her ekranın ölçülmesi | `routes.ts` yolları `src/app/routes.tsx` kaynağından çıkarır. Kararları ve adımları veri listelerinden genişletir. | `ekranlar.spec.ts` her yolu örnek planla açar. Her veri durumunu kapsamaz. |
| Taşma ve yazı | `audit.ts:80` sayfa genişliğini ölçer. Görünen metnin hesaplanmış yazı boyutunu denetler. | Kapalı içerik açılmaz. Canvas metni ölçülmez. |
| Fare ve dokunma | `fare.spec.ts` ve `dokunma.spec.ts` yeni plan oluşturur. Adım 00 tamamlanınca Adım 01 açılır. | Fare testi dokunmalı projelerde atlanır. Dokunma testi diğer projelerde atlanır. |
| Klavye | `klavye.spec.ts` örnek planı ve komut paletini dener. Yeni `klavye-ana-yol.spec.ts` plan oluşturmayı ve Adım 00 yolunu ekler. | Yeni dosyanın bağımsız kaynak incelemesi aşağıdadır. Çalışma sonucu burada doğrulanmadı. |
| Yön değişimi | `donus.spec.ts` dört dikey telefon genişliğinde alanı ve açık paneli denetler. | Boyut değiştirme, fiziksel telefon dönüşü değildir. |
| Açık panel ve tercihler | `paneller.spec.ts` iki paneli ölçer. `tercihler.spec.ts` azaltılmış hareketi ve büyütülmüş kök yazıyı dener. | Tercih testleri özet ekranıyla sınırlıdır. Kök yazıyı büyütmek gerçek tarayıcı yakınlaştırması değildir. |
| Ölçüm aracının doğruluğu | `olcum.spec.ts` küçük yazı, kırpılma, form alanı ve dokunma sınırları için örnekler kurar. | Bunlar ölçüm aracını sınar. Gerçek ekranların sonucu değildir. |

Test dosyaları `tests/uyarlanir/` klasöründedir. Projeler 320, 360, 375 ve 390 CSS piksel genişliklerini kapsar. Diğer ölçüler 844 × 390, 768 × 1024, 1280 × 800 ve 1920 × 1080 pikseldir. Proje listesi tek başına kabul sırasıyla çalıştırma kanıtı değildir.

## Komutların gerçek kapsamı

Komutlar depo köküne göre incelendi. Bu tablodaki hiçbir komutu çalıştırmadım.

| Komut | Yapılandırmadaki kapsam |
|---|---|
| `npm run lint` | Kök TypeScript denetimini ve `scripts/check-ui.mjs` kapısını çalıştırır. |
| `npm run test:unit` | `vite.config.ts` içindeki `src` ve `scripts` testlerini çalıştırır. Uyarlanır tarayıcı testlerini kapsamaz. |
| `npm run test:e2e:ci` | `tests` altındaki testleri yalnız `chromium-320` ve `chromium-1280` projelerinde çalıştırır. |
| `npm run test:e2e` | `tests` altındaki testleri 16 projede çalıştırır. Yalnız `uyarlanir` klasörünü seçmez. |
| `npm run ci` | Lint, birim testleri ve iki Chromium projesini çalıştırır. Üretim derlemesini içermez. |
| `npm run build` | Kök tip denetiminden sonra üretim dosyalarını derler. Tarayıcı testi çalıştırmaz. |

`tsconfig.json:21` yalnız `src` ve `vite.config.ts` dosyalarını kapsar. `tests/uyarlanir/tsconfig.json` ayrı test kapsamını tanımlar. Paket komutları ve CI bu ayrı dosyayı çağırmaz. Ana ajan, mevcut yerel araçla `./node_modules/.bin/tsc -p tests/uyarlanir/tsconfig.json --noEmit` komutunu ayrıca değerlendirmelidir.

Manifestte Playwright `^1.64.1`, TypeScript `^5.9.3` olarak tanımlıdır. `package-lock.json` sırasıyla `1.64.1` ve `5.9.3` sürümlerini kaydeder. Çalışan test aracı sürümleri doğrulanmadı. `node --version` sonucu `v24.21.0` oldu. CI ayarında Node 24 seçilidir.

## Kaynakta görülen açıklar

1. **Dokunma ölçümü bütün kontrolleri kapsamıyor.** `audit.ts:103` yalnız `button`, `a` ve `[role="button"]` öğelerini seçiyor. Metin alanları ve diğer seçim kontrolleri bu seçime bütünüyle dahil değil. `paneller.spec.ts` küçük hedefleri ayrıca ölçmüyor. Yeni `olcum.spec.ts:145` küçük form alanlarının da bulunmasını bekliyor. Ana ajan, `measurePage` ve `measureTarget` imzalarını koruyarak kapsamı tamamlamalıdır.
2. **Bütün yazı kuralları ölçülmüyor.** `audit.ts:92` en az 14 piksel şartını denetliyor. Gövdenin 16 piksel olması ve Outfit kullanımı ayrıca doğrulanmıyor. Sayfa genişliği kontrolü, tablo içindeki kelimelerin bölünmediğini kanıtlamıyor.
3. **Klavye ana yolu sonradan eklendi.** `klavye-ana-yol.spec.ts` ilk incelemedeki kapsam açığını kaynak düzeyinde gideriyor. Aşağıdaki yeni inceleme, başarı koşullarındaki iki açığı kaydediyor. Dar ekranda fare ile dokunmayı birlikte kullanma burada ayrıca doğrulanmadı.
4. **Kanıt kaydı başarı kararıyla aynı değil.** `ekranlar.spec.ts:21` kontrol durumlarına `run` yazıyor. Bu değer `pass` anlamına gelmez. Ana ajan test sonucunu, ölçüm kaydını ve görüntüyü birlikte değerlendirmelidir. Ekran görüntüsü kaydetmek, önceki görüntüyle fark karşılaştırması yapmak değildir.
5. **Kalite belgesindeki sunucu açıklaması eski.** `docs/kalite-kapilari.md:73` açık sunucunun kullanılacağını söylüyor. `playwright.config.ts:29` ise `reuseExistingServer: false` kullanıyor. Kalite belgesinin sahibi açıklamayı mevcut ayara göre düzeltmelidir.
6. **İş 3 kapıları bu dalda henüz görünmüyor.** `scripts/check-ui.mjs` beş kuralı tarıyor. Yalnız fare üzerine gelince görünen eylem ve 44 piksel hedef kuralları burada bulunmuyor. İş 3 sahibi birleşik dalda bu kapsamı doğrulamalıdır.

## Kanıt sınırları

| Alan | Bu incelemenin sınırı |
|---|---|
| Birleşik dal | `mobil-birlesik` incelenmedi. Bu dalın sonucu birleşik teslimi kanıtlamaz. İş 1 rota sarmalayıcılarını değiştirirse `routes.ts` uyumu yeniden incelenmelidir. Son denetim birleşmeden sonra yapılmalıdır. |
| Üretim ağı | Playwright geliştirme sunucusunu başlatacak biçimde ayarlı. `tests/uyarlanir` üretim parçalarının ağ isteklerini denetlemiyor. Aktarılan bayt, ön yükleme, önbellek ve service worker davranışı kanıtlanmadı. Service worker, arka planda çalışan tarayıcı kodudur. |
| Safari | WebKit proje adı, gerçek macOS veya iOS Safari testi değildir. Safari sonucu `not_run` durumundadır. |
| Gerçek cihaz | Fiziksel cihaz, sanal klavye ve çentik boşluğu denenmedi. Gerçek tarayıcı yakınlaştırması da `not_run` durumundadır. |
| Canvas metni | Canvas, grafiğin çizildiği yüzeydir. İçindeki yazı HTML metin düğümü değildir. Mevcut yazı ölçümü grafikteki 14 piksel şartını kanıtlamaz. |
| Ekran okuyucu | Rol ve erişilebilirlik özelliği kontrolleri, ekran okuyucunun çıktısını kanıtlamaz. Sesli okuma ve grafik tablosunun anlaşılması denenmedi. |
| CI | `.github/workflows/deploy.yml` yalnız `main` gönderimi veya elle başlatmayla çalışır. CI, GitHub'daki otomatik denetimdir. İş akışı yalnız Chromium kurar ve iki projeyi seçer. WebKit, diğer genişlikler ve ayrı test tip denetimi bu kapıda yoktur. Güncel CI çalışması incelenmedi. |

Üretim ağı İş 1'in görevidir. Son kabulde, ana ajan İş 1 kanıtını bu raporla birlikte değerlendirmelidir.

## Yapılan ve yapılmayan kontroller

Kaynak karşılaştırması tamamlandı. Dosyaları `rg`, `cat`, `sed` ve `nl` ile okudum. Dalı, başlangıç kaydını ve mevcut farkı salt okunur Git komutlarıyla doğruladım. Pane bağlantı denetimi başarılı oldu.

Görev sınırı nedeniyle tarayıcı, birim testi, tip denetimi, arayüz kapısı ve derleme çalıştırılmadı. Bu kontrollerin durumu `not_run` olarak kalır. Kaynakta görülen açıklar, tarayıcıda gözlenmiş uygulama hatası sayılmaz.

Türkçe denetim betiği çalıştırıldı. Denetim hata bulmadı, uzun kelimeler için bir uyarı verdi. Uyarıyı elle inceledim. Dosya adları ve anlam için gereken kelimeler korundu. Gerçek okurla denenmedi.

## Yeni klavye dosyasının bağımsız incelemesi

Bu bölüm yalnız `tests/uyarlanir/klavye-ana-yol.spec.ts` dosyasını değerlendirir. Diğer kapsam bulguları yeniden incelenmedi. Testi ana ajan çalıştırıyor. Bu incelemede test sonucu, ekran görüntüsü veya tarayıcı izi okunmadı.

**İki önemli doğrulama açığı bulundu.** İki bulgu da MAJOR sınıfındadır. Bu sınıf önemli eksik anlamındadır. Bulgular, kaynakta görülen test açıklarıdır. Uygulamada gözlenmiş çalışma hataları değildir.

1. **Adım geçişi, cevapların kaydını kanıtlamıyor.** Kaynak `klavye-ana-yol.spec.ts:60` ve `klavye-ana-yol.spec.ts:63` satırlarıdır. Test, Adım 01 adresi ve başlığı görünce başarı kaydediyor. Yedi seçimi yalnız önceki ekranda denetliyor. Cevapların kaydı bozulsa bile yönlendirme çalışırsa test geçebilir. `src/screens/WorkScreen.tsx:209` kaydetmeyi, `src/screens/WorkScreen.tsx:212` yönlendirmeyi ayrı yapıyor. Adım 00 cevapları `plan.profile` içinde tutuluyor. Kaynaklar `src/screens/WorkScreen.tsx:179` ve `src/engine/changes.ts:164` satırlarıdır. Ana ajan, son başarıdan önce kayıtlı yedi cevabı doğrulamalıdır. Yenilemeden sonra cevapların korunmasını da kontrol etmelidir. Bu adım için var olmayan ayrı bir tamamlanma durumu varsayılmamalıdır.
2. **Görünmeyen klavye odağı başarı sayılabilir.** Kaynak `klavye-ana-yol.spec.ts:7`, `klavye-ana-yol.spec.ts:52` ve `klavye-ana-yol.spec.ts:58` satırlarıdır. Test, etkin öğeyi ve klavye modu işaretini kontrol ediyor. Formdaki görünür odak göstergesini kontrol etmiyor. Gösterge silinse veya çevreleyen halkaya dönüşse bu koşullar yine geçebilir. Son ekran görüntüsü, önceki form kontrollerinin odağını göstermez. Ana ajan, form alanlarında ve tamamlama düğmesinde görünür odağı ayrıca doğrulamalıdır. Çevreleyen halka da bu kontrolde hata sayılmalıdır.

Tuş akışında şu noktalar kaynakta doğrulandı:

- `tabTo` gerçek klavye olayı gönderiyor. Hedef bulunamazsa 80 basış sonunda odak koşulu başarısız oluyor. Test odağı programatik olarak taşımıyor.
- Plan adı `page.keyboard.type` ile yazılıyor. Düğmeler Enter, başlangıç seçimi Space ile etkinleşiyor. Test tıklama veya `fill` kullanmıyor.
- Yedi grupta hedef önce odaklanıyor. Test sonra Space ile seçimi doğruluyor. “Hizmet” üçüncü seçenektir. Bu nedenle mevcut veri sırası ArrowRight yolunu da çalıştırmayı gerektiriyor.
- Seçim grubu hedefi kurulu Ant Design yapısıyla uyumlu görünüyor. `node_modules/antd/es/radio/group.js:52` varsayılan `radiogroup` rolünü tanımlıyor. Grup ayrıca ortak `name` değerini sağlıyor. `src/components/FieldControl.tsx:140` bu bileşeni kullanıyor.
- Yeni planın profili boştur. Kaynak `src/data/types.ts:270` satırıdır. Bu akışta ilk seçenek hedefini erişilemez yapan önceden seçilmiş değer bulunmadı.
- Hata yakalanınca yeniden fırlatılıyor. Başarısız bir tuş veya odak koşulu sessizce başarılı sayılmıyor.

Manifest aralıkları Ant Design `^6.7.0` ve Playwright `^1.64.1` olarak okundu. Önceki kilit dosyası incelemesi `6.7.0` ve `1.64.1` değerlerini gösterdi. Yerel paket dosyalarında da bu sürümler görüldü. Çalışan tarayıcı sürümü bu incelemede gözlenmedi.

WebKit için test `Alt+Tab`, Chromium için `Tab` gönderiyor. Gerçek tarayıcı erişimi bu incelemede `not_run` durumundadır. Kaynakta kesin bir erişilemeyen hedef veya kütüphane uyumsuzluğu bulunmadı. Bu sonuç, testin geçtiği anlamına gelmez. Yalnız bu rapor güncellendi.

## İki bulgunun yeniden incelemesi

**Önceki iki bulgu test kapsamı açısından kapandı.** Bu karar güncel kaynakların salt okunur incelemesine dayanır.

1. `klavye-ana-yol.spec.ts:70` “Kaydedildi” durumunu bekliyor. Test sayfayı yeniliyor ve “Geri” bağlantısını klavyeyle açıyor. `klavye-ana-yol.spec.ts:77` kayıtlı yedi cevabı yeniden doğruluyor. Başarı işareti ancak bu kontrollerden sonra veriliyor. Kayıt doğrulaması açığı kapandı.
2. `klavye-ana-yol.spec.ts:29`, `:40`, `:58` ve `:65` odak ölçümünü çağırıyor. Plan adı, başlangıç seçimi, yedi seçenek ve tamamlama düğmesi kapsanıyor. `focus-audit.ts:302` odak kusurunu, `:303` ölçüm sorununu başarısız test koşuluna bağlıyor. Ana yol, odak kusurunu `fail`, ölçüm belirsizliğini `not_run` olarak ayrıca kaydediyor. Görünür odak denetiminin eksikliği kapandı.

Tarayıcıları ana ajan çalıştırıyor. Bu inceleme tarayıcı başarısı veya görsel kabul kanıtı değildir. Komut, test veya otomatik metin denetimi çalıştırmadım. Yeni notu elle denetledim. Yalnız bu rapora sonuç ekledim.
