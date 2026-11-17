# Mobil öncelikli ve uyarlanır teslim planı

Bu planı Claude 17 Kasım 2026 Salı günü yazdı. Plan yalnız ön yüzü kapsar. Arka yüz, sunucu ve yayın ayarı bu planın dışındadır.

## Amaç

Uygulama önce 320 piksel genişlikte telefonda rahat çalışmalı. Sonra daha geniş ekranlara uyum sağlamalı.

Uygulama yalnız gereken kodu indirmeli. Örneğin grafik olmayan bir ekran grafik kütüphanesini indirmemeli. Bu yaklaşıma "uyarlanır teslim" denir.

## Terimler

| Terim | Anlamı |
|---|---|
| Uyarlanır teslim | Ekranın ve cihazın ihtiyacına göre yalnız gereken kodu indirmek |
| Parça | Ayrı indirilen JavaScript ya da CSS dosyası |
| Dokunma alanı | Parmağın basabildiği alan. Görünen düğmeden büyük olabilir. |
| Yoğunluk | Ekrandaki öğelerin birbirine ne kadar yakın durduğu |
| Kapı | Kodu denetleyen kontrol. Kapı hata bulursa iş durur. |

## Kabul sırası

Her ekran bu sırayla denenir:

1. 320 piksel
2. 360 piksel
3. 375 piksel
4. 390 piksel
5. Yatay telefon. Örneğin 844 × 390 piksel.
6. Tablet. Örneğin 768 × 1024 piksel.
7. Masaüstü. Örneğin 1280 × 800 piksel.
8. Büyük ekran. Örneğin 1920 × 1080 piksel.

## Ortak kurallar

Bu kurallar sekiz işin hepsinde geçerlidir.

1. Okunabilir yazı en az 14 piksel olmalı. Gövde yazısı 16 piksel olmalı.
2. Yazı tipi Outfit olarak kalmalı.
3. Sayfanın tamamı yana taşmamalı. Geniş tablo kendi kutusunda yana kaymalı.
4. Davranış cihaz adına göre seçilmemeli. `isMobile` ve `userAgent` kullanılmamalı.
5. Fare üzerine gelme tek erişim yolu olmamalı.
6. Dokunma alanı en az 44 piksel olmalı.
7. Telefon yana çevrilince form verisi ve odak kaybolmamalı.
8. Çevreleyen odak halkası kullanılmamalı. Mevcut odak düzeni korunmalı.
9. Hareket süreleri ortak değişkenlerden gelmeli. Hareket azaltma tercihi korunmalı.
10. Kenarı yuvarlak kutuya renkli kenar çizgisi eklenmemeli.
11. Arayüz yazıları yalın Türkçe olmalı. Okurken desteğe ihtiyaç duyan kişi metni anlamalı.
12. Yeni ve anlamlı davranış için önce başarısız test yazılmalı. Sonra kod düzeltilmeli.
13. Firefox testi çalıştırılmamalı. Chromium ve WebKit kullanılmalı.
14. Mevcut teknoloji korunmalı. React, Ant Design, ECharts ve Phosphor Icons kalır.

## Sekiz iş

Her iş ayrı bir dalda yapılır. Her işin kendi dosyaları vardır. Bir iş başka işin dosyasını değiştirmez.

Bazı CSS dosyalarını birden çok ekran kullanır. Bir işin ekranı başka işin CSS dosyasını kullanabilir. Bu durumda o iş yeni bir CSS dosyası açar. Dosya adı `src/styles/mobil-<dal-adı>.css` olur. Örneğin `mobil-cikti.css`. Ekran bu dosyayı kendisi yükler.

### İş 1: Kod bölme ve uyarlanır teslim

Bu işi Claude 1 yapar. Dal adı `mobil-teslim` olur.

1. Her ekranı ayrı parça olarak yükleyin. `React.lazy` ve `Suspense` kullanın.
2. Kullanıcı bir bağlantıya dokununca ya da üzerine gelince ekranın parçasını önceden yükleyin.
3. Grafik kütüphanesi yalnız grafik gösteren ekranda insin.
4. Rapor üretme kodu yalnız rapor istenince insin.
5. Derleme sonrası parça boyutlarını denetleyen bir kapı yazın. Kapı `scripts/check-bundle.mjs` dosyasında olsun.
6. Ağ testini yazın. 320 pikselde "Planlar" ekranı ECharts indirmemeli.

Bu iş şu dosyaları değiştirir: `src/app/routes.tsx`, `vite.config.ts`, `package.json`, `index.html`, `src/main.tsx`, `src/data/howto.ts`, `src/reports/build.ts` dosyasının dışa açılan yükleme kısmı, `scripts/check-bundle.mjs`, `tests/teslim.spec.ts`.

### İş 2: Uygulama kabuğu

Bu işi Claude 2 yapar. Dal adı `mobil-kabuk` olur.

1. Üst şeridi 320 pikselde sığacak hâle getirin.
2. Telefonda alt gezinme çubuğu ekleyin. Çubuk ana bölümleri göstersin.
3. Çentikli telefonlar için güvenli alan boşluğunu ekleyin.
4. Yatay telefonda kısa yüksekliğe uyum sağlayın.
5. Ekran genişliğini JavaScript yerine önce CSS ile yönetin.
6. Komut paleti telefonda tam ekran açılsın.

Bu iş şu dosyaları değiştirir: `src/app/AppShell.tsx`, `src/app/FocusMode.tsx`, `src/app/SyncGuard.tsx`, `src/components/CommandPalette.tsx`, `src/components/SaveStatus.tsx`, `src/styles/global.css`.

### İş 3: Tasarım tokenları ve arayüz kapısı

Bu işi Claude 3 yapar. Dal adı `mobil-token` olur.

1. Görünen kontrol boyutu ile dokunma alanı için ayrı tokenlar ekleyin.
2. Boşluk, kenar boşluğu ve aralık için ayrı tokenlar ekleyin.
3. Rahat, sıkı ve yoğun olmak üzere üç yoğunluk tanımlayın.
4. Kaba işaretçi ve ince işaretçi için uyarlama yazın. `pointer` ve `hover` sorgularını kullanın.
5. Arayüz kapısına iki yeni kural ekleyin. Kapı yalnız fare üzerine gelince görünen eylemi bulsun. Kapı 44 pikselden küçük dokunma alanını bulsun.
6. Küçük ortak bileşenleri yeni tokenlara geçirin.

Bu iş şu dosyaları değiştirir: `src/theme/tokens.ts`, `src/theme/antdTheme.ts`, `scripts/check-ui.mjs`, `scripts/check-ui.test.ts`, `docs/tasarim-sistemi.md`, `docs/kalite-kapilari.md`. Bu iş şu ortak bileşenleri de değiştirir: `PageHeader`, `StatTile`, `Callout`, `EmptyState`, `LoadingState`, `DecisionBadge`, `ModelChip`, `ModelCard`, `ModelDrawer`, `EvidenceLink`, `LimitsBar`, `CompassArt`.

Yeni tokenlar CSS değişkeni olarak ayrı bir dosyada durur: `src/styles/tokens.css`. Bu dosyanın sahibi de İş 3'tür.

### İş 4: Form ve çalışma ekranı

Bu işi Claude 4 yapar. Dal adı `mobil-form` olur.

1. Her alana doğru klavye türünü verin. `inputMode`, `enterKeyHint` ve `autoComplete` kullanın.
2. Sanal klavye açılınca aktif alan görünür kalsın.
3. Tekrarlanan tablo telefonda kart listesine dönsün. Geniş ekranda tablo kalsın.
4. Telefon yana çevrilince taslak değer kaybolmasın.
5. Kaydet ve ileri düğmeleri telefonda başparmağın erişeceği yerde dursun.

Bu iş şu dosyaları değiştirir: `src/screens/WorkScreen.tsx`, `FormRenderer`, `FieldControl`, `RepeaterTable`, `MeasureInput`, `ThresholdInput`, `CalcField`, `src/styles/screens-form.css`.

### İş 5: Karar, kapı ve strateji ekranları

Bu işi Claude 5 yapar. Dal adı `mobil-kapi` olur.

1. Puan tablosu telefonda okunabilir olsun. Gerekirse kendi kutusunda yana kaysın.
2. Yol karşılaştırması telefonda alt alta dizilsin.
3. Kapı kararı düğmeleri telefonda tam genişlikte dursun.
4. Alt aşama listesi dokunmaya uygun olsun.

Bu iş şu dosyaları değiştirir: `DecisionScreen`, `ReviewScreen`, `TransitionScreen`, `StrategyScreen`, `ExecutionScreen`, `TransitionPanel`, `ScoreMatrix`, `PathCompare`, `SubStageList`, `OutcomePanel`. Bu iş şu CSS dosyalarını da değiştirir: `screens-kapi.css`, `screens-karar.css`, `screens-gecis.css`, `screens-strateji.css`.

### İş 6: Pano, grafik ve liste ekranları

Bu işi Claude 6 yapar. Dal adı `mobil-pano` olur.

1. Grafik yalnız ekrana girince yüklensin.
2. Grafiğin yanında aynı bilgiyi veren bir tablo görünümü olsun. Ekran okuyucu bu tabloyu okusun.
3. Telefonda grafik daha az etiket göstersin. Yazı yine 14 pikselden küçük olmasın.
4. Planlar, başlangıç, kanıt, iş ve geçmiş listeleri telefonda kart olarak dizilsin.

Bu iş şu dosyaları değiştirir: `OverviewScreen`, `InsightsScreen`, `PlansScreen`, `StartScreen`, `EvidenceScreen`, `TasksScreen`, `HistoryScreen`, `src/charts/` klasörü, `SituationSummary`, `EvidenceLadderPicker`. Bu iş şu CSS dosyalarını da değiştirir: `screens-pano.css`, `screens-durum.css`.

### İş 7: Çıktılar, devir ve temel ekranları

Bu işi Codex 1 yapar. Dal adı `mobil-cikti` olur.

1. Rapor ekranları telefonda okunabilir olsun.
2. Rapor üretme ve dışa aktarma düğmeleri telefonda erişilebilir olsun.
3. Yazdırma görünümü bozulmasın.
4. Temel, varsayım ve devralma ekranları telefona uysun.

Bu iş şu dosyaları değiştirir: `HandoffScreen`, `OutputsScreen`, `MethodsScreen`, `FoundationScreen`, `AssumptionsScreen`, `TakeoverScreen`, `FoundationSummary`. Bu iş şu CSS dosyalarını da değiştirir: `print.css`, `screens-rapor.css`, `screens-devir.css`, `screens-temel.css`.

### İş 8: Bağımsız kalite denetimi

Bu işi Codex 2 yapar. Dal adı `mobil-qa` olur.

1. Kabul sırasındaki her genişlik için test projesi ekleyin.
2. Her ekranda yana taşma olmadığını deneyin.
3. Her ekranda yazının 14 pikselden küçük olmadığını deneyin.
4. Dokunma, fare ve klavye ile ana yolu deneyin.
5. Telefon yana çevrilince form verisinin korunduğunu deneyin.
6. Bulduğunuz hataları `docs/qa/mobil-bulgular.md` dosyasına yazın. Kaynak koda dokunmayın.

Bu iş şu dosyaları değiştirir: `playwright.config.ts`, `tests/uyarlanir/` klasörü, `docs/qa/` klasörü.

## Birleştirme

Koordinatör sekiz dalı `mobil-birlesik` dalında birleştirir. Sonra bütün kapıları çalıştırır. İş 8 son denetimi birleşik dalda yeniden yapar.

Hiçbir iş `main` dalına doğrudan gönderilmez. `main` dalına gönderim canlı sürümü değiştirir. Bu adım kullanıcının onayını bekler.
