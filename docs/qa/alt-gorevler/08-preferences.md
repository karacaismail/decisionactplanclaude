# İş 8: Kullanıcı tercihleri

Bu dosya alt görevin ara raporudur. Son sonuçlar [ana bulgu raporundadır](../mobil-bulgular.md).

İki odaklı test güncellendi. Bu alt görevde testler çalıştırılmadı. Ana ajan testleri yeniden çalıştıracak.

Yalnız şu dosyalar değiştirildi:

- `tests/uyarlanir/tercihler.spec.ts`
- `docs/qa/alt-gorevler/08-preferences.md`

## Beklenen davranış

Her test uygulamanın başlangıç ekranından “Kafe örneğini aç” düğmesini kullanır. Testler veriyi depoya doğrudan yazmaz. Mevcut `openDemo(page, hasTouch)` yardımcısı korunur.

1. İlk test hareket azaltma tercihini dener. Test Chromium'da Tab, WebKit'te Alt+Tab kullanır. Bu seçim mevcut `smoke.spec.ts` ve `klavye.spec.ts` testleriyle aynıdır. Kullanıcı bu tuşlarla “En kısa yol” seçeneğine ulaşabilir. Space tuşu seçeneği açar ve kapatır. Hareket tercihi sonradan değişince seçim ve odak korunur. Odak işareti görünür kalır. İşaret kontrolü çevrelemez. Kontrolün ve alt öğelerinin hareket süreleri azaltılır. Mevcut kaynak, azaltılmış süreyi `0.01ms` olarak tanımlar.
2. İkinci test kök yazı boyutunu iki katına çıkarır. Bu, deneme ayarıdır. Her örnek metnin iki kat büyümesi kabul koşulu değildir. Başlık, sayfa açıklaması ve seçenek etiketi görünür kalmalıdır. Metinler okunabilir kalmalıdır. Sayfa yana taşmamalıdır. Görünen yazılar 14 CSS pikselden küçük olmamalıdır. “En kısa yol” seçeneği açılıp kapanabilmelidir. Test, projenin ayarına göre dokunma veya fare kullanır.

Test örnek metinlerin önceki ve sonraki boyutlarını kanıt olarak saklar. Boyut oranı, testi başarısız yapan bir koşul değildir.

Kök yazı boyutunu değiştirmek gerçek tarayıcı büyütmesi değildir. Bu deneme tarayıcı zoom'unu doğrulamaz. İşletim sisteminin büyük yazı ayarı da denenmedi.

## Kaynak gözlemi ve kabul sınırı

`src/styles/global.css` dosyasında yazı boyutları sabit piksel değerleri kullanıyor:

| Kaynak satırı | Öğe | Boyut |
|---|---|---|
| 30 | Gövde | 16 px |
| 152 | Sayfa başlığı | 28 px |
| 153 | Sayfa açıklaması | 16 px |
| 308 | Seçenek etiketi | 14 px |

Bu değerler kök yazı boyutundan bağımsızdır. Bu gözlem tek başına uygulama hatası değildir. Önceki rapordaki iki kat büyüme şartı kaldırıldı. Kullanıcı böyle bir kabul eşiği koymadı. Test, sabit piksel kullanımını tek başına hata saymaz.

Kabul koşulları okunabilirlik, 14 piksel alt sınırı, taşmama ve işlevdir. Boyut ölçümleri görsel okunabilirlik incelemesinin yerine geçmez. Kaynak kod değiştirilmedi.

`tests/uyarlanir/audit.ts` imzaları değişmedi. Ortak yardımcı için zorunlu bir değişiklik önerisi yoktur.

## İş 6 bulgusu: seçenek kapanmıyor

Ana ajan, `journey-fixed` koşusunun gerçek sonucunu iletti. “En kısa yol” seçeneği kapalıyken açılıyor. Açık seçenek yeniden kapanmıyor. Bu, hareket azaltma ve büyük yazı tercihlerinden bağımsız temel bir işlev hatasıdır.

Kaynak incelemesi hatanın nedenini doğruladı:

1. `src/screens/OverviewScreen.tsx:472` içindeki atama işlevi, kapatma sırasında `false` döndürüyor.
2. `src/store/planStore.ts:138` içindeki `update`, sonuç `false` olduğunda değişikliği iptal ediyor.
3. Planın kaydedilen değeri açık kalıyor.

Bulgunun sahibi İş 6'dır. Kaynak düzeltilmedi. Her iki testte açma ve kapatma koşulları korundu. Test hatası gizlenmedi veya beklenen başarıya çevrilmedi.

Bu alt görevde gerçek koşu tekrarlanmadı. `fail` kaydı, ana ajanın ilettiği koşu sonucuna dayanır. Tercih kontrollerinin tamamının çalıştığı veya geçtiği sonucu çıkarılamaz.

## Kanıt ve sınırlar

Her testin ardından `afterEach` kanıt kaydını çalıştırır. Başarısız doğrulama bu kaydı atlatmaz. Her test kendi ölçüm verisini ayrı tutar.

Ortak yardımcı son durum için `olcum.json` ve `ekran.png` üretir. Her test ayrıca görünür alanın `odak.png` görüntüsünü kaydeder. Kayıttan önce sayfa başa kaydırılmaz. Böylece hata anındaki görünür alan korunur.

Kayıt şu bilgileri içerir:

- Testin durumu ve hata mesajları saklanır.
- Seçeneğin başlangıç değeri ve son değeri saklanır.
- Son odak durumu ve sayfa ölçümleri saklanır.
- O ana kadar toplanan yazı boyutları ve diğer ölçümler korunur.

Kayıt işlemi başarısız testi başarılı yapmaz. Çalışmayan kontroller geçmiş sayılmaz. Bu değişikliğin görüntüleri bu alt görevde üretilmedi. Ana ajan yeni koşuda kayıtların oluştuğunu doğrulayacak.

Odak denetimi mevcut düz işareti esas alır. Hesaplanan biçimi, boyutu ve kesilme sınırlarını kontrol eder. Bu kontrol görsel incelemenin yerine geçmez. Ana ajan odak görüntüsünü ayrıca incelemeli.

| Kontrol | Durum | Açıklama |
|---|---|---|
| TypeScript denetimi | `pass` | Yeni test ve doğrudan bağımlılıkları hata vermedi. |
| `journey-fixed` işlev sonucu | `fail` | Ana ajan seçeneğin kapanmadığını bildirdi. |
| Chromium yeniden koşusu | `not_run` | Görev gereği ana ajan çalıştıracak. |
| WebKit yeniden koşusu | `not_run` | Görev gereği ana ajan çalıştıracak. |
| Firefox | `not_applicable` | Projenin açık talimatıyla kapsam dışında kaldı. |
| Gerçek Safari ve fiziksel cihazlar | `not_run` | Tarayıcı veya cihaz açılmadı. |
| Gerçek tarayıcı büyütmesi | `not_run` | Yalnız kök yazı boyutunu değiştiren test yazıldı. |
| Güvenli alan | `not_run` | Ekran çentiği çevresindeki boşluk denenmedi. |
| Sanal klavye | `not_run` | Telefonun ekran klavyesi denenmedi. |
| Görsel ve bağımsız inceleme | `not_run` | Bu alt görev yalnız test yazımını kapsadı. |
| Proje derlemesi ve CI | `not_run` | Otomatik proje kontrollerini ana ajan çalıştıracak. |

Testler mevcut proje genişliklerini kullanır. Ana ajan önce 320 CSS piksel genişliğini denemeli. Bildirilen koşunun tarayıcı sürümü ve ekran ölçüsü bu rapora aktarılmadı. Yeni koşu bunları ölçüm kaydında saklayacak. Testler geçtiğinde bile gerçek cihaz doğrulaması tamamlanmış sayılmaz.

## Sürüm ve komut kaydı

Komutlar `/Users/w6x/Developer/decisionactplanclaude/worktrees/mobil-qa-1` dizininde çalıştırıldı.

| Araç | Manifest aralığı | Kilit dosyası | Yerel gözlem |
|---|---|---|---|
| Playwright | `^1.64.1` | `1.64.1` | Kurulu paket `1.64.1`. Tarayıcı çalıştırılmadı. |
| TypeScript | `^5.9.3` | `5.9.3` | Denetleyici `5.9.3` ile çalıştı. |
| Node | Belirtilmemiş | Uygulanmaz | `v24.21.0` |

TypeScript denetimi aşağıdaki komutla çalıştırıldı. Komut testleri yürütmez ve dosya üretmez.

```sh
node --input-type=module <<'NODE'
import ts from 'typescript'
const config = ts.readConfigFile('tests/uyarlanir/tsconfig.json', ts.sys.readFile)
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, 'tests/uyarlanir')
const program = ts.createProgram(['tests/uyarlanir/tercihler.spec.ts'], { ...parsed.options, noEmit: true, incremental: false })
const diagnostics = [...(config.error ? [config.error] : []), ...parsed.errors, ...ts.getPreEmitDiagnostics(program)]
if (diagnostics.length) {
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, { getCurrentDirectory: ts.sys.getCurrentDirectory, getCanonicalFileName: (name) => name, getNewLine: () => '\n' }))
  process.exitCode = 1
} else console.log('PASS: tercihler.spec.ts ve içe aktardığı dosyalar için TypeScript denetimi. Testler çalıştırılmadı.')
NODE
```

Yazım denetimi aşağıdaki komutla çalıştırıldı:

```sh
node /Users/w6x/.claude/skills/coding-standards/scripts/yalin-turkce-denetim.mjs --tur aciklama docs/qa/alt-gorevler/08-preferences.md
```

Yazım denetimi 0 hata ve 1 uzun kelime uyarısı verdi. Metnin anlamı ve koşulları elle denetlendi. Uzun kelime uyarısı incelendi. Dosya adları ve gerekli araç adları korundu. Gerçek okurla denenmedi.
