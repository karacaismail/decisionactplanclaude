# Dokunma testi teslimi

Bu dosya alt görevin ara raporudur. Son sonuçlar [ana bulgu raporundadır](../mobil-bulgular.md).

Bir odaklı test ekledim. İlk Chromium ve WebKit çalışmaları 00. adımda 60 saniye sınırını aştı. Görünür etikete dokunacak şekilde testi düzelttim. Testi ben çalıştırmadım. Ana ajan testi yeniden çalıştıracak.

## Değişiklik

Yalnız şu dosyaları oluşturdum:

- `tests/uyarlanir/dokunma.spec.ts`
- `docs/qa/alt-gorevler/04-touch.md`

Test, `hasTouch` açık projelerde çalışır. Diğer projelerde gerekçesiyle atlanır. Test, dokunmak için Playwright aracının `locator.tap()` yöntemini kullanır. Önce `locator.scrollIntoViewIfNeeded()` ile hedefi görünür alana getirir.

Testte fare tıklaması, programatik tıklama veya zorlamalı etkileşim yoktur. Plan adı alanına dokunulur. Metin, `fill()` yöntemiyle yazılır. Bu yöntem gerçek telefon klavyesini denemez.

## Beklenen davranış

1. Test, "Yeni plan" düğmesine dokunur ve açılan pencereyi doğrular.
2. Plan adı boşken "Oluştur" düğmesi kapalı kalır.
3. Test, plan adını yazar ve "Oluştur" düğmesine dokunur.
4. Uygulama "Bugün nereden başlayacaksınız?" ekranını açar.
5. Test, "Yeni bir fikrim var" seçeneğine dokunur ve seçimi doğrular.
6. Test, "Devam et" düğmesine dokunur ve 00. adımı doğrular.
7. Test, yedi zorunlu cevaba dokunur ve her seçimi doğrular.
8. Test, "Adımı tamamla" düğmesine dokunur.
9. Uygulama 01. adımı açar. Test, adresi ve başlığı doğrular.

Test yalnız başlangıçta ana adrese gider. Sonraki ekranlara arayüz üzerinden ulaşır. Test geçerse ortak `saveEvidence` yardımcısı `ekran.png` ve `olcum.json` üretir. İlk başarısız çalışmanın hata bağlamı ve tarayıcı işlem kaydı oluştu. Bu kayıtları okudum. Düzeltme sonrası tarayıcı kanıtı henüz yoktur.

## Kaynakta görülen eksik

`tests/smoke.spec.ts:13` ve devamındaki akış fare tıklaması kullanıyor. Aynı dosyanın 27. satırı 00. adımı doğrudan adresle açıyor. Bu yüzden mevcut test, başlangıç seçimini dokunmayla denemiyor.

Yeni test bu eksik kapsamı tamamlar. İlk çalışma testteki yanlış dokunma hedefini gösterdi. Uygulamanın dokunma yolunun tamamı henüz doğrulanmadı. Canlı ekran incelemesi yapmadım.

`src/screens/StartScreen.tsx` başlangıç seçimini ve "Devam et" düğmesini tanımlıyor. `src/data/steps/karar1.ts` yedi zorunlu cevabı tanımlıyor. `src/screens/WorkScreen.tsx` tamamlanan adımdan sonraki adıma geçiyor. Testin beklediği akış bu kaynaklara dayanıyor.

## Sürümler ve kontroller

Manifest, Playwright için `^1.64.1` sürüm aralığını bildiriyor. Kilit dosyası ve kurulu paket `1.64.1` gösteriyor. Manifest, TypeScript için `^5.9.3` bildiriyor. Kilit dosyası ve kurulu paket `5.9.3` gösteriyor. Gözlenen Node sürümü `v24.21.0` oldu. Tarayıcı çalışma sürümü bilinmiyor.

Çalışma dizini `worktrees/mobil-qa-1` oldu. Şu salt okunur tip denetimi `0` çıkış koduyla tamamlandı:

```sh
./node_modules/.bin/tsc --noEmit --target ES2022 --module ESNext --moduleResolution bundler --strict --skipLibCheck --lib ES2022,DOM,DOM.Iterable tests/uyarlanir/dokunma.spec.ts
```

Şu yazım denetimi de `0` çıkış koduyla tamamlandı:

```sh
node /Users/w6x/.claude/skills/coding-standards/scripts/yalin-turkce-denetim.mjs docs/qa/alt-gorevler/04-touch.md --tur aciklama
```

Denetim hata bulmadı. Uzun kelime uyarısını elle inceledim. Günlük kelimeleri ve kaynak ekran adlarını korudum.

| Kontrol | Durum | Açıklama |
|---|---|---|
| TypeScript tip denetimi | `pass` | Yeni test ve kullandığı yardımcı dosya denetlendi. |
| Türkçe yazım denetimi | `pass` | Uzun kelime uyarısı elle incelendi. |
| İlk Playwright çalışması | `fail` | Ana ajanın iki dokunma denemesi süre sınırını aştı. |
| Düzeltme sonrası Playwright testi | `not_run` | Ana ajan yeniden çalıştıracak. |
| İlk çalışma kanıtını okuma | `pass` | İki hata kaydı ve işlem kaydı incelendi. |
| Gerçek cihaz ve telefon klavyesi | `not_run` | Dokunma benzetimi bu kontrolleri karşılamaz. |
| Bağımsız inceleme | `not_run` | Görev gereği yeni alt ajan başlatılmadı. |
| Dokunma desteği kapalı proje | `not_applicable` | Test bu projeyi atlar. |

Ana ajan önce 320 piksel genişlikte denemelidir. Sonraki genişlikleri İş 8 kapsamına göre denemelidir. İlk iki komut şunlardır. Bu komutları çalıştırmadım.

```sh
npm run test:e2e -- tests/uyarlanir/dokunma.spec.ts --project=chromium-320
npm run test:e2e -- tests/uyarlanir/dokunma.spec.ts --project=webkit-320
```

## Bağımlılıklar ve sınırlar

Ortak `audit.ts` dosyasının imzalarını korudum. Mevcut `ready` ve `saveEvidence` yardımcılarını kullandım. Bağımlı dosyada değişiklik gerekmiyor.

Kaynak kodu, paketleri ve test yapılandırmasını değiştirmedim. Paket kurmadım. Git kaydı oluşturmadım. Firefox çalıştırmadım. Gerçek okurla denenmedi.

## Bağımsız ek inceleme

`tests/uyarlanir/klavye.spec.ts` dosyasını bağımsız olarak inceledim. Kaynak kodu ve test dosyalarını değiştirmedim. Bu bölüm yalnız dosya incelemesine dayanır. Test çalıştırmadım.

İncelenen dosyanın SHA-256 özeti, dosya içeriğini tanımlayan değerdir:

```text
909efec184f2dd874181bc9c888a9a9dd4671b6eb7274833dc18138acae4ba30
```

### Denenen yol ve tuşlar

İlk test, örnek plana klavyeyle ulaşmayı deniyor. Geri ve ileri odak geçişini denetliyor. Sonra Enter ile planı açıyor.

İkinci test, Space ile aramayı açıyor. Aşağı ve yukarı okla etkin sonucu değiştiriyor. Test, etkin sonucun kimliğini ve seçim bilgisini doğruluyor. Escape sonrasında odak arama düğmesine dönmelidir. Test, aramayı yeniden açıyor ve "Karar Kitabı" yazıyor. Enter sonrasında yöntemler ekranını doğruluyor.

Chromium yolunda Tab ve Shift+Tab kullanılıyor. WebKit yolunda Alt+Tab ve Alt+Shift+Tab kullanılıyor. Sonuç dosyası kullanılan tuşu ayrıca kaydediyor. WebKit sonucu, gerçek Safari'de yalın Tab denemesi sayılmamalıdır.

Test, hedefleri programatik olarak odaklamıyor. Odak hataları `expect.soft` ile kaydediliyor. Bu yöntem sonraki tuşları denemeye devam ediyor. Hata varsa Playwright testi yine başarısız sayıyor. `finish` yardımcısı akış ve odak sonuçlarını ayrı yazıyor.

### Bulgular

**K1. Odakta değişen kenarlık gözden kaçabilir. Öncelik P2, orta düzeydir.**

Bu bulgu `tests/uyarlanir/klavye.spec.ts:22` ve `tests/uyarlanir/klavye.spec.ts:96` satırlarına dayanır.

`ring` denetimi yalnız `outline` ve `box-shadow` özelliklerini okuyor. Kontrolün veya kapsayıcının `border` özelliklerini denetlemiyor. Odakta dört kenarı renklenen kontrol, sol odak işaretiyle birlikte denetimden geçebilir. Bu durum çevreleyen odak çerçevesi yasağını ihlal eder.

Odaktan önceki ve sonraki dört kenarı karşılaştırın. Normal form sınırını, odakta değişen sınırdan ayırın. Kenarlıkla çevreleyen vurgu oluşursa denetim başarısız olmalıdır.

**K2. Kapalı odak modunda görsel denetim eksik. Öncelik P2, orta düzeydir.**

Bu bulgu `tests/uyarlanir/klavye.spec.ts:164` ve `src/app/FocusMode.tsx:14` satırlarına dayanır.

İlk test başlangıçta yalnız `data-focus-mode` değerini denetliyor. Ok, Escape ve yazma sonrasında da aynı değeri denetliyor. Gösterge yanlışlıkla sürekli çizilse bile bu kontroller geçebilir. Bu dosya, fare veya dokunma sonrasında göstergenin kapandığını da denemiyor.

Mod kapalıyken odak göstergesinin çizilmediğini ayrıca doğrulayın. Fare veya dokunma sonrasında odağın korunduğunu doğrulayın. Ardından Tab ile görünür göstergenin geri geldiğini doğrulayın.

### İncelemenin sınırları

Bu bulgular testin kaçırabileceği durumları gösterir. Uygulamada bu hataları tarayıcıyla yeniden üretmedim. Testin mevcut çalıştırma sonucu bilinmiyor.

Dosya, `forcedColors: 'none'` ile normal renkleri deniyor. Yüksek karşıtlık modu bu dosyada kapsam dışıdır. Home ve End tuşları da denenmiyor. Plan oluşturma ve 00. adımı tamamlama bu klavye dosyasında yoktur. Bu yüzden iki test, ana yolun tamamı için klavye kanıtı sayılmamalıdır.

| Kontrol | Durum | Açıklama |
|---|---|---|
| Bağımsız kaynak incelemesi | `fail` | İki denetim eksikliği bulundu. |
| Klavye testini çalıştırma | `not_run` | Görev gereği test çalıştırılmadı. |
| Görüntü ve gerçek tarayıcı doğrulaması | `not_run` | Kaynak incelemesi bu kontrollerin yerini tutmaz. |

Ana ajan bulguları klavye testinin sahibine iletmelidir. Düzeltme sonrasında testleri ana ajan çalıştırmalıdır.

## İlk çalışma sonrası düzeltme

Kanıt dizini `.pane/scratch/is8/journey-initial` oldu. İki dokunma kaydındaki `error-context.md` ve `trace.zip` dosyalarını okudum:

- `uyarlanir-dokunma-Dokunmay-2f5e0-amamlanır-ve-Adım-01-açılır-chromium-320`
- `uyarlanir-dokunma-Dokunmay-2f5e0-amamlanır-ve-Adım-01-açılır-webkit-320`

İki çalışma da 60 saniye sınırını aştı. Son dokunma hedefi "Tüketici" seçeneğinin görünmeyen `input` alanıydı. WebKit kaydı "element is not visible" hatasını gösteriyor. Kayıtlardaki HTML, görünür `label` öğesinin bu alanı çevrelediğini gösteriyor.

Test artık cevabı taşıyan radio alanının görünür etiketini buluyor. Yardımcı önce etiketi görünür alana kaydırıyor. Sonra gerçek `tap()` işlemini etikete uyguluyor. `toBeChecked()` aynı etiketin içindeki radio alanını denetliyor.

Zorlamalı dokunma veya programatik tıklama eklemedim. 01. adımın adres ve başlık doğrulamasını korudum. Yalnız `dokunma.spec.ts` dosyasını ve bu raporu değiştirdim. Yeniden çalıştırma yapılmadığı için düzeltmenin tarayıcı sonucu `not_run` durumundadır.
