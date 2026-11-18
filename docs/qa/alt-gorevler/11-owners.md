# İlk 320 kanıtlarının sahiplik raporu

Bu dosya alt görevin ara raporudur. Son sonuçlar [ana bulgu raporundadır](../mobil-bulgular.md).

Bu çalışma yalnız mevcut ölçümleri ve ilgili kaynakları okudu. Yalnız bu rapor eklendi. Uygulama, testler ve yardımcı işlevlerin imzaları değişmedi.

## Kanıtın sınırı

`docs/qa/kanit/ilk-320` altında 86 ölçüm dosyası bulunuyor. SHA-256 içerik karşılaştırması, 43 dosya çiftinin birebir aynı olduğunu gösterdi. Her `olcum.json`, kendi `attachments/olcum-*.json` kopyasıyla eşleşiyor.

Tek kopya üzerinden 43 giriş yolu ve 41 hedef yol incelendi. Toplam 566 dokunma alanı kaydı bulunuyor. Bunlar 566 ayrı kök neden veya kesinleşmiş hata anlamına gelmiyor.

Kayıtların proje adı `chromium-320`, tarayıcı sürümü `156.0.8078.4`. Kayıtlarda `coarse=true`, `hover=false`, `dpr=1` ve `forcedColors=false` bulunuyor. Bu değerler dokunmaya uygun işaretçi koşulunu bildiriyor. Gerçek telefon denemesi kanıtlanmıyor.

42 kaydın yerleşim alanı 320 × 720 CSS piksel. `/karar/9/adim/20` kaydı 329 × 741 bildiriyor. Bu kaydın görsel alanı yaklaşık 320 × 720 kalıyor. Ana ajan bu farkı yeniden ölçmeli.

Eski kayıtlarda çalışma zamanı, işletim sistemi ve kaynak sürümü bulunmuyor. Yazı boyutu ve taşma bulgusu kayıtlı değil. `checks` alanındaki `run`, güncel kabul sonucu veya yeni test başarısı sayılmaz.

## Tekrarlayan sorunlar ve sahipleri

Selector, ekrandaki öğeyi bulmak için kullanılan seçicidir. Aşağıdaki seçiciler kaynak bileşeni gösterir. Kanıt bağlantıları, ölçümdeki tam `selector` değerini içerir. `findings[N]`, sıfırdan başlayan bulgu sırasıdır.

Her dokunma alanı en az 44 × 44 CSS piksel olmalıdır. Kaynak sahipleri yazıyı küçültmeden bu alanı sağlamalıdır. İş 3, ortak boyut değerlerini ve bileşen ayarlarını yönetmelidir.

| Sorun grubu | Eski kayıt sayısı ve ölçüm | Kaynak seçici ve dosya | Sahip ve örnek kanıt |
|---|---|---|---|
| Üst şeritteki marka bağlantısı | 43 kayıt. 114 × 21,59 piksel. | `.topbar .brand`. [AppShell.tsx](../../../src/app/AppShell.tsx), satır 161. [global.css](../../../src/styles/global.css), satır 359. | **İş 2**. [Planlar ölçümü][planlar], `findings[0]`. |
| Satır taşıma ve silme düğmeleri | 240 kayıt, 14 yol. 32 × 32 piksel. | `.repeater-actions button`. [RepeaterTable.tsx](../../../src/components/RepeaterTable.tsx), satır 50, 51 ve 62. | **İş 4**, ortak boyut için İş 3. [Adım 01][a01], `findings[1]`. |
| Seçimi temizleme düğmesi | 75 kayıt, 11 yol. 14 × 14 piksel. | `FieldControl` içindeki `Select allowClear`. [FieldControl.tsx](../../../src/components/FieldControl.tsx), satır 135. | **İş 3**, tüketen form için İş 4. [Adım 03][a03], `findings[4]`. |
| Açık veya kapalı seçimi yapan anahtarlar | 49 kayıt. Yükseklik 24 piksel. Genişlik 48, 50 veya 70,20 piksel. | `#a02-extraIncome`, `#agirlik-kilidi`, `#kisa-yol`, `.page-devralma button[role="switch"]`. | **İş 3**, ekran sahipleri aşağıda ayrıldı. [Adım 02][a02], [Adım 11][a11], [Pano][pano], [Devralma][devralma]. |
| Çoklu seçim düğmeleri | 9 kayıt, 2 yol. Yükseklik 40 piksel. | `.chip`. [FieldControl.tsx](../../../src/components/FieldControl.tsx), satır 164. [screens-form.css](../../../src/styles/screens-form.css), satır 93. | **İş 4**. [Adım 04][a04], `findings[1]`. |
| Bölüm kapatma düğmeleri | 6 kayıt, 5 yol. 78,45 × 42 piksel. | `.form-section-toggle`. [FormRenderer.tsx](../../../src/components/FormRenderer.tsx), satır 174. [screens-form.css](../../../src/styles/screens-form.css), satır 328. | **İş 4**, gerçek alan ölçümü için İş 8. [Adım 06][a06], `findings[91]`. |
| Kilitli çalışma ekranındaki dönüş bağlantıları | 12 kayıt, 6 yol. Yükseklik 24 piksel. | `a[href="#/gecis"]`, `a[href="#/strateji"]`. [WorkScreen.tsx](../../../src/screens/WorkScreen.tsx), satır 260 ve 261. | **İş 4**. [Adım 19][a19], `findings[1]` ve `findings[2]`. |
| Karar tablosu ve kapı bağlantıları | 61 kayıt, 7 yol. “Aç” bağlantısı 18,30 × 20 piksel. | `.karar-step-link`, `.karar-table td a`, `.karar-aside a`. [DecisionScreen.tsx](../../../src/screens/DecisionScreen.tsx), satır 178, 197, 204 ve 242. | **İş 5**. [Karar 1][karar], `findings[1]` ve `findings[2]`. |
| Geçiş ekranının dayanak ve rapor bağlantıları | 3 kayıt. Yükseklikler 18, 39 ve 24 piksel. | [TransitionScreen.tsx](../../../src/screens/TransitionScreen.tsx), satır 66 ve 173. [TransitionPanel.tsx](../../../src/components/TransitionPanel.tsx), satır 239. | **İş 5**. [Geçiş][gecis], `findings[1]`, `findings[2]`, `findings[3]`. |
| Strateji ekranındaki kapı ve rapor bağlantıları | 6 kayıt, 3 giriş yolu. Yükseklik 18 piksel. | `.strateji-aside a`, `.strateji-main .ant-card-extra a`. [StrategyScreen.tsx](../../../src/screens/StrategyScreen.tsx), satır 90 ve 151. | **İş 5**. [Strateji][strateji], `findings[1]` ve `findings[2]`. |
| Plan adı düğmesi | 1 kayıt. 156,47 × 24,39 piksel. | `.plan-name`. [PlansScreen.tsx](../../../src/screens/PlansScreen.tsx), satır 279. [screens-pano.css](../../../src/styles/screens-pano.css), satır 194. | **İş 6**. [Planlar ölçümü][planlar], `findings[1]`. |
| Pano bağlantıları ve ek sekme düğmesi | 8 kayıt. Bağlantılar 18 piksel yüksekliğinde. Sekme düğmesi 45,33 × 40 piksel. | `.pano-card .ant-card-extra a`, `#rc-tabs-1-more`. [OverviewScreen.tsx](../../../src/screens/OverviewScreen.tsx), satır 402 ve 466. | **İş 6**, sekme boyutu için İş 3. [Pano][pano], `findings[1]` ve `findings[7]`. |
| Durum özetindeki düzeltme bağlantıları | 10 kayıt, 1 yol. Yükseklik 24 piksel. | `.durum-meta a`. [SituationSummary.tsx](../../../src/components/SituationSummary.tsx), satır 40. [screens-durum.css](../../../src/styles/screens-durum.css), satır 18. | **İş 6**. [Adım 18][a18], `findings[1]`. |
| Devir raporundaki adım ve kapı bağlantıları | 15 kayıt. 14 adım bağlantısı 28 piksel yüksekliğinde. Kapı bağlantısı 39 piksel. | `.devir-step-link`, `#devir-karar .devir-missing a`. [HandoffScreen.tsx](../../../src/screens/HandoffScreen.tsx), satır 105 ve 434. | **İş 7**. [Devir][devir], `findings[1]` ve `findings[2]`. |
| Devralma sonucundaki bağlantılar | 8 kayıt. 264 × 24 piksel. | `.devralma-result a`. [TakeoverScreen.tsx](../../../src/screens/TakeoverScreen.tsx), satır 135. | **İş 7**. [Devralma][devralma], `findings[2]`. |
| Temel kartlarının adım bağlantıları | 20 kayıt. Ölçülen bağlantı yüksekliği 28 piksel. | `.stone-link`. [FoundationScreen.tsx](../../../src/screens/FoundationScreen.tsx), satır 64. [screens-temel.css](../../../src/styles/screens-temel.css), satır 75 ve 76. | **İş 7**, ölçüm sınırı için İş 8. [Temel][temel], `findings[1]`. |

## Ortak kaynaklar ve yanlış sahiplik riski

[tokens.ts](../../../src/theme/tokens.ts) satır 113, küçük kontrolü 32 piksel yapıyor.

[antdTheme.ts](../../../src/theme/antdTheme.ts) satır 76, bu değeri `controlHeightSM` alanına bağlıyor.

Bu iki dosyanın sahibi İş 3'tür. Satır düğmelerinin `size="small"` seçimi ise İş 4'e aittir.

Anahtar grubundaki 49 kayıt şu şekilde ayrılır:

- **İş 4**, 38 form anahtarının tüketicisidir. Kaynak `FieldControl.tsx` satır 181'dir.
- **İş 5**, iki `#agirlik-kilidi` kaydının sahibidir. Kaynak [ScoreMatrix.tsx](../../../src/components/ScoreMatrix.tsx) satır 36'dır.
- **İş 6**, `#kisa-yol` anahtarının sahibidir. Kaynak `OverviewScreen.tsx` satır 472'dir.
- **İş 7**, sekiz devralma anahtarının sahibidir. Kaynak `TakeoverScreen.tsx` satır 118'dir.

`Switch` ortak ayarı `antdTheme.ts` satır 143'te yalnız renkleri düzenliyor. İş 3, ortak dokunma alanını ele almalıdır. Ekran sahipleri, alanın komşu kontrollere taşmadığını doğrulamalıdır.

`/karar/5/adim/18` form ekranıdır. Ancak on düzeltme bağlantısı `SituationSummary` içindedir. Bu bileşenin sahibi plana göre İş 6'dır.

`/karar/9` ve `/karar/9/kapi`, `/strateji` hedefine yönlenir. Eski `route.owner` değeri İş 1'dir. Bu yollardaki dört bağlantı bulgusu İş 5'e aittir. Üst şerit bulguları ise her yolda İş 2'ye aittir.

## Ölçüm sınırları ve sonraki doğrulama

Temel kartlarının `.stone-link::after` alanı kartın tamamına yayılıyor. Kartta `position: relative` bulunuyor. Mevcut `measureTarget`, bağlantının kendi konumu `static` ise bu alanı atlıyor. Bu nedenle 20 kayıt için kesin hata kararı verilmemelidir. İş 8, gerçek tıklama alanını yeniden ölçmelidir. İş 7, kart davranışını korumalıdır.

Form kapatma düğmesinde de `::after` ile genişletilmiş alan bulunuyor. Altı kayıtta ölçülen yükseklik yine 42 piksel. İş 4 ve İş 8, gerçek hedef alanını birlikte doğrulamalıdır.

Bağımlı öneri, yardımcı işlev imzalarını değiştirmeden ölçümü gerçek hedef alanıyla karşılaştırmaktır. Bu rapor `tests/uyarlanir/audit.ts` dosyasını değiştirmedi. Eski ölçümü üreten yardımcı dosyanın sürümü bilinmiyor.

`OutputsScreen`, `MethodsScreen` ve bazı liste ekranları için bu klasörde ölçüm yok. Eksik kayıtlar başarılı sonuç sayılmaz. Alt aşama listesinin özel kusuru da bu kayıtlardan çıkarılamaz.

## Yapılan ve yapılmayan kontroller

- **pass:** JSON dosyaları salt okunur okundu. İçerik tekrarları SHA-256 ile ayrıldı. Grupların toplamı 566 kayıtla eşleşti.
- **pass:** Seçiciler ilgili kaynak dosyalarla ve iş planındaki sahiplerle eşleştirildi.
- **not_run:** Uygulama testleri, derleme, tür denetimi ve tarayıcı çalıştırması yapılmadı. Görev bunları ana ajana bıraktı.
- **not_run:** Yeni ekran görüntüsü, gerçek cihaz, Safari, WebKit ve CI doğrulaması yapılmadı.
- **not_run:** Yeni ölçümle hata kapatma yapılmadı. Firefox görev gereği çalıştırılmadı.

Türkçe denetim betiği çalıştı. Uzun kelimeler elle incelendi. Bağlantı tanımlarının uzunluk uyarısı teknik sözdiziminden kaynaklanıyor. Dosya adları ve bağlantılar aynen korundu. Gerçek okurla denenmedi.

Çalışan metin denetimi komutu şöyledir:

```sh
node /Users/w6x/.claude/skills/coding-standards/scripts/yalin-turkce-denetim.mjs docs/qa/alt-gorevler/11-owners.md --tur aciklama
```

[planlar]: ../kanit/ilk-320/uyarlanir-ekranlar-ekran--chromium-320/olcum.json
[a01]: ../kanit/ilk-320/uyarlanir-ekranlar-ekran-karar-1-adim-01-chromium-320/olcum.json
[a02]: ../kanit/ilk-320/uyarlanir-ekranlar-ekran-karar-1-adim-02-chromium-320/olcum.json
[a03]: ../kanit/ilk-320/uyarlanir-ekranlar-ekran-karar-1-adim-03-chromium-320/olcum.json
[a04]: ../kanit/ilk-320/uyarlanir-ekranlar-ekran-karar-1-adim-04-chromium-320/olcum.json
[a06]: ../kanit/ilk-320/uyarlanir-ekranlar-ekran-karar-2-adim-06-chromium-320/olcum.json
[a11]: ../kanit/ilk-320/uyarlanir-ekranlar-ekran-karar-3-adim-11-chromium-320/olcum.json
[a18]: ../kanit/ilk-320/uyarlanir-ekranlar-ekran-karar-5-adim-18-chromium-320/olcum.json
[a19]: ../kanit/ilk-320/uyarlanir-ekranlar-ekran-karar-9-adim-19-chromium-320/olcum.json
[karar]: ../kanit/ilk-320/uyarlanir-ekranlar-ekran-karar-1-chromium-320/olcum.json
[gecis]: ../kanit/ilk-320/uyarlanir-ekranlar-ekran-gecis-chromium-320/olcum.json
[strateji]: ../kanit/ilk-320/uyarlanir-ekranlar-ekran-strateji-chromium-320/olcum.json
[pano]: ../kanit/ilk-320/uyarlanir-ekranlar-ekran-ozet-chromium-320/olcum.json
[devir]: ../kanit/ilk-320/uyarlanir-ekranlar-ekran-devir-chromium-320/olcum.json
[devralma]: ../kanit/ilk-320/uyarlanir-ekranlar-ekran-devralma-chromium-320/olcum.json
[temel]: ../kanit/ilk-320/uyarlanir-ekranlar-ekran-temel-chromium-320/olcum.json
