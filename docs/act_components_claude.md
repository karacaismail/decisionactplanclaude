# Girişimci Aksiyon Planı v5: Ön Yüz Bileşen Planı

Bu belge bir plandır. Kod içermez. Belge 13 Kasım 2026 Cuma günü yazıldı. Kaynak plan `act_plan_v5_final-claude.md` dosyasıdır. Bu belge o planın her bölümünü ekrana ve bileşene bağlar.

Hedef ürün kurumsal düzeydedir. İlk deneme sürümü değildir. Bu yüzden plan altı konuyu baştan kapsar. Bunlar tasarım dili, erişilebilirlik, çok cihaz, veri modeli, rapor üretimi ve test kapısıdır.

---

## Sözlük

| Terim | Günlük açıklaması |
|---|---|
| Bileşen | Ekranın tekrar kullanılan parçası. Düğme, form alanı ve kart birer bileşendir. İngilizce adı "component". |
| Token | Tasarımın tek yerde tutulan değeri. Renk, boşluk ve süre gibi. Bütün bileşenler bu değeri kullanır. |
| Sihirbaz | Adım adım ilerleyen form. İngilizce adı "wizard". |
| Koşullu form | Verilen cevaba göre sonraki soruları değiştiren form. |
| JSON | Verinin metin halinde saklanma biçimi. Program okur ve yazar. |
| Şema | JSON verisinin hangi alanları taşıyacağını söyleyen kural. |
| ECharts | Grafik çizen kütüphane. Projede zaten var. |
| Phosphor | Simge kütüphanesi. Projede zaten var. Simge adları "ph-" ile başlar. |
| Başsız bileşen | Davranışı hazır, görünümü boş bileşen. Görünümü biz veririz. İngilizce adı "headless". |
| APG | Erişilebilir bileşen davranış rehberi. Klavye ve ekran okuyucu kurallarını verir. |
| WCAG 2.2 AA | Web erişilebilirlik standardı. Ürün bu düzeyi karşılar. |
| Kapı motoru | Kapı ölçütlerini okuyup sonuç öneren mantık. |
| Yönetici raporu | Karar sahibine sunulan kısa durum raporu. |
| Aksiyon planı çıktısı | Kurucunun kendi profiline göre süzülmüş, doldurulmuş plan belgesi. |

---

## 1. Amaç ve kapsam

### Ürün ne yapar?

1. Kurucu profilini seçer. Plan o profile göre daralır.
2. Kurucu sekiz kararı sırayla işler. Her adımda form doldurur.
3. Her cevap arka planda JSON olarak birikir. Kurucu bunu görmez. İsterse dışa aktarır.
4. Her kapıda sistem ölçütleri okur. Bir sonuç önerir. Kurucu sonucu seçer ve gerekçe yazar.
5. Sonunda iki çıktı üretilir. Yönetici raporu ve girişimci aksiyon planı.

### Kapsam dışı

- Çok kullanıcılı sunucu, giriş sistemi ve ekip yetkilendirmesi bu planın ikinci aşamasıdır. Veri modeli buna hazır kurulur. İlk sürüm tek tarayıcıda çalışır.
- Ödeme, yapay zekâ önerisi ve dış veri bağlantısı kapsam dışıdır.

### Mevcut yığın korunur

| Katman | Mevcut | Karar |
|---|---|---|
| Derleme | Vite 8, TypeScript 6 | Korunur. |
| Stil | Tailwind 3, Flowbite 4 | Tailwind korunur. Flowbite yalnız yardımcı sınıf olarak kalır. Flowbite'ın hazır görünümleri tasarım kararı sayılmaz. |
| Grafik | ECharts 6 | Korunur. Bütün grafikler ECharts ile çizilir. |
| Simge | Phosphor Icons 2 | Korunur. Emoji yasaktır. |
| Yazı tipi | Roboto | Outfit'e geçilir. Kalıcı kullanıcı kararıdır. Kod ve tutar için sabit genişlikli font ayrı tanımlanır. |
| Durum yönetimi | Yok | Küçük, tipli bir durum deposu yazılır. Çerçeve değişikliği yapılmaz. |
| Açılır liste | Tarayıcı varsayılanı | Yasak. APG kurallarına göre markalı liste bileşeni yazılır. |

---

## 2. Tasarım temeli

### 2.1 Görsel kimlik

Kimlik ürünün amacından türer. Ürün, kanıta dayalı karar verdirir. Bu yüzden kimlik sakin, düzenli ve güven vericidir. Gösterişli değildir. Kararı ve kanıtı öne çıkarır.

Üç ilke:

1. **Kanıt önce.** Sayı, kaynak ve tarih her kartta görünür. Yorum ikinci sıradadır.
2. **Karar vurgusu.** Altı karar sonucu altı ayrı semantik renk taşır. Bu renkler başka yerde kullanılmaz.
3. **Az kenarlık.** Ayrım boşluk, yüzey tonu ve tipografiyle kurulur. Kenarlık yalnız form alanı, tablo ızgarası ve seçili durumda vardır.

### 2.2 Renk tokenları

Mevcut turuncu marka rengi korunur. Gri "ink" skalası korunur. Üstüne semantik katman kurulur. Bileşen içine sabit renk yazılmaz.

| Token | Görev | Not |
|---|---|---|
| surface.base | Sayfa zemini | Açık temada beyaz. Koyu temada koyu gri. |
| surface.raised | Kart ve panel zemini | Zeminden bir ton ayrı. Gölge ile ayrılır. |
| surface.sunken | Giriş alanı ve tablo zemini | Zeminden bir ton koyu. |
| text.primary, text.secondary, text.muted | Metin | Kontrast 4,5:1 ve üstü. |
| brand.primary, brand.hover, brand.active | Ana eylem | Mevcut turuncu skaladan. |
| decision.proceed | "İlerle" sonucu | Yeşil ailesi. |
| decision.conditional | "Koşullu ilerle" sonucu | Sarı yeşil ailesi. |
| decision.retry | "Yeniden dene" sonucu | Mavi ailesi. |
| decision.pivot | "Yön değiştir" sonucu | Mor ailesi. |
| decision.hold | "Beklet" sonucu | Gri mavi ailesi. |
| decision.stop | "Durdur" sonucu | Kırmızı ailesi. |
| evidence.1 ile evidence.7 | Kanıt merdiveni basamakları | Koyudan açığa tek ton skalası. |
| state.hover, state.active, state.selected, state.disabled, state.invalid | Etkileşim durumları | Her bileşen bu beşini uygular. |

Açık ve koyu tema aynı token adlarını kullanır. Tema değişince yalnız değerler değişir.

### 2.3 Tipografi tokenları

- Yazı tipi Outfit olur. Yedek olarak sistem yazı tipleri kullanılır. Kod ve tutar için sabit genişlikli font kullanılır.
- Gövde 16 piksel. Hiçbir okunabilir metin 14 pikselin altına inmez. Yardımcı metin, rozet ve tooltip dahil.
- Yazı ölçeği 14, 16, 18, 20, 24, 30 ve 36 pikseldir. Satır yüksekliği her boy için ayrı token olur.
- Tutarlarda rakamlar eşit genişlikte dizilir.
- Kök boyut tarayıcı tercihine dokunmaz. Dar ekranda metin küçültülmez.

### 2.4 Boşluk, köşe, gölge, kenarlık

- Boşluk ölçeği 4, 8, 12, 16, 24, 32, 48 ve 64 pikseldir.
- Köşe yarıçapı üç boydur. Küçük 6, orta 10 ve büyük 16 pikseldir. Tek merkezi kenar sistemi vardır.
- Gölge üç kademedir. Kart, açılır panel ve kalıcı pencere için birer kademe vardır.
- Kenarlık yalnız şu üç yerde: form alanı sınırı, tablo ızgarası ve seçili durum.
- **Kavisli vurgu kenarı yasaktır.** Köşesi yuvarlak kutunun kenarına renkli çizgi konmaz. Mevcut uygulamadaki alıntı kutusu bu kuralı ihlal ediyor. Yeni tasarımda düzeltilir. Vurgu için yüzey tonu, simge ve başlık ağırlığı kullanılır.

### 2.5 Odak göstergesi

- Çevreleyen odak halkası yasaktır. Bütün renklerde ve bütün giriş yöntemlerinde.
- Görünür odak modu kapalı başlar. Yalnız Tab ve Shift+Tab açar. Fare ve dokunma kapatır.
- Gösterge, öğenin dışında ve solunda duran 3 piksel dikey işarettir. Kutunun köşesine değmez. Bağlantılarda alt çizgi kalınlaşır.
- Odak, seçili durumdan ayrı tutulur. Programatik odak ve pencere dönüş odağı göstergeyi korur.
- Hedefli regresyon testi çevre halkasını FAIL sayar. Görünmez klavye odağını da FAIL sayar.

### 2.6 Hareket tokenları

- Varsayılan eğri `cubic-bezier(.65, 0, .35, 1)` değeridir.
- Süre üç kademedir. Hızlı 120, normal 200 ve yavaş 320 milisaniyedir. Gecikme varsayılanı sıfırdır.
- Her geçiş iki yönlüdür. Giriş ve çıkış tanımlanır.
- Durum, ARIA ve odak anında güncellenir. Yalnız görünüm hareket eder.
- Kullanıcı az hareket istiyorsa geçişler kapanır. Odak ve metin güncellemeleri yine anında olur.
- Yeni bileşen için proje kapısı vardır. Kapı bu kuralı ihlal eden bileşeni reddeder.

### 2.7 Yerleşim

- Önce 320 piksel tasarlanır. Sonra 360, 375, 390, yatay telefon, tablet ve masaüstü.
- Tek sütun temel düzendir. Geniş ekranda sol gezinme, orta içerik ve sağ yardım paneli açılır.
- Tablolar daralınca sıkışmaz. Kendi kapsayıcısında yatay kayar. İlk sütun kelime ortasından bölünmez.
- Dokunma hedefi en az 44 piksel. Görünür boyut ile dokunma alanı ayrı tokendir.

---

## 3. Ekranlar

Ürün dokuz ekrandan oluşur. Her ekranın simgesi Phosphor kütüphanesindendir.

| Ekran | Simge | Ne yapar? |
|---|---|---|
| Giriş | ph-compass | "Bugün nereden başlayacaksınız?" sorusunu sorar. Üç yol sunar: yeni fikir, devralma, acil zarar. |
| Profil sihirbazı | ph-user-focus | Adım 00. Yedi soruyu sorar. Profili yazar. |
| Karar panosu | ph-squares-four | Sekiz kararı kart olarak gösterir. Hangi karar açık, hangisi kilitli, hangisi geçildi. |
| Karar sayfası | ph-signpost | Bir kararın adımlarını sıralı gösterir. Sol rayda ilerleme vardır. |
| Adım formu | ph-list-checks | Bir adımın sorularını sorar. Cevapları JSON'a yazar. |
| Kapı ekranı | ph-door-open | Ölçütleri okur. Sonuç önerir. Karar günlüğüne yazar. |
| Kayıt defteri | ph-notebook | Karar günlüğü, varsayım kartları, görüşme kayıtları ve olay kuralları. |
| Rapor merkezi | ph-file-text | Yönetici raporu ve aksiyon planı. Dışa aktarma. |
| Model çekmecesi | ph-book-open | Karar Kitabı modellerini adım içinden açar. Sağdan kayan panel. |

---

## 4. Bileşen kataloğu

Bileşenler yedi aileye ayrılır. Her bileşen bölüm 2'deki tokenları kullanır. Her bileşen hover, active, focus-visible, disabled, selected ve invalid durumlarını uygular.

### 4.1 İskelet ve gezinme

| Bileşen | Görev | Simge | Not |
|---|---|---|---|
| AppShell | Sayfa iskeleti. Üst çubuk, sol gezinme, içerik, sağ panel. | | Dar ekranda sol gezinme çekmeceye dönüşür. |
| TopBar | Proje adı, profil özeti, kaydetme durumu, tema anahtarı. | ph-floppy-disk | "Kaydedildi" durumu her 2 saniyede güncellenir. |
| SideNav | Sekiz karar ve dokuz ekran. | ph-list | Geçilen karar yeşil tik alır. Kilitli karar kilit simgesi alır. |
| ProgressRail | Karar sayfasında sol dikey ray. Adımları ve kapıyı gösterir. | ph-steps | Tıklanan adıma kaydırır. |
| StepIndicator | Sihirbazda "3 / 7" göstergesi ve adım adları. | ph-dots-three | Dar ekranda yalnız sayı görünür. |
| Breadcrumb | Pano, karar, adım yolu. | ph-caret-right | |
| Tabs | Kayıt defterinde dört sekme. | | Ok tuşlarıyla gezilir. |
| Accordion | Uzun açıklamaları katlar. | ph-caret-down | Tek seferde bir panel açık olabilir. Zorunlu değil. |
| Drawer | Model çekmecesi ve dar ekran gezinmesi. | ph-sidebar | Sağdan ve soldan kayar. Odak içinde kalır. |
| CommandPalette | Klavyeyle ekran ve adım arama. | ph-magnifying-glass | Kısayol: Ctrl K veya Cmd K. |
| HelpPanel | Sağ yardım paneli. Adımın "nasıl yapılır" metni. | ph-question | Geniş ekranda sabit. Dar ekranda çekmece. |

### 4.2 Form bileşenleri

| Bileşen | Görev | Simge | JSON davranışı |
|---|---|---|---|
| Wizard | Adımları sırayla gösterir. İleri ve geri. Koşullu adımı atlar. | ph-arrow-right | Her adım bitince o adımın nesnesini yazar. |
| FormSection | Bir adım içindeki soru grubu. Başlık ve açıklama. | | |
| TextField | Tek satır metin. | | Yazdıkça yazar. 400 milisaniye bekler. |
| TextArea | Çok satır metin. Karakter sayacı. | | |
| NumberField | Sayı ve birim. Örneğin "30.000 TL" veya "6 hafta". | | Sayı ve birim ayrı alan olarak yazılır. |
| DateField | Tarih. Takvim paneli markalıdır. | ph-calendar | ISO biçiminde yazar. Ekranda "13 Kasım 2026 Cuma" gösterir. |
| Select | Başsız, markalı açılır liste. Klavye ve ekran okuyucu destekli. | ph-caret-down | APG "listbox" kuralına uyar. |
| SegmentedControl | 2 ile 4 seçenekli tek seçim. Profil sorularında kullanılır. | | |
| ChipGroup | Çoklu seçim. Örneğin kanal seçimi. | | Dizi olarak yazar. |
| Toggle | Evet veya hayır. | | |
| RatingScale | 1'den 5'e puan. Her puanın anlamı altında yazar. | ph-star | Adım 01 ve Adım 07'de. |
| EvidenceLadderPicker | Kanıt basamağı seçimi. Yedi basamak dikey listedir. | ph-stairs | Seçilen basamak numarası yazılır. |
| RepeaterTable | Satır ekleyip silinen tablo. Görüşme kayıtları, riskler, seçenekler. | ph-plus | Dizi olarak yazar. Dar ekranda satırlar kart olur. |
| ThresholdInput | Eşik değeri ve dayanağı birlikte. "Sayı, birim, dayanak türü". | ph-flag | Dayanak boşsa "ilk tahmin" işareti otomatik yazılır. |
| ScoreMatrix | Ağırlıklı puanlama tablosu. Satırlar seçenek, sütunlar ölçüt. | ph-grid-four | Ağırlıklar kilitlenmeden puan girişi açılmaz. |
| FileDrop | Kanıt dosyası ekleme. Fotoğraf, belge. | ph-upload-simple | Dosya tarayıcıda tutulur. Yalnız ad ve tarih JSON'a yazılır. |
| InlineValidation | Alanın altında hata ve ipucu. | ph-warning-circle | Hata metni 14 pikselden küçük değildir. |
| AutosaveBadge | "Taslak kaydedildi" rozeti. | ph-check | |

### 4.3 Veri gösterim bileşenleri

| Bileşen | Görev | Simge |
|---|---|---|
| KpiTile | Tek sayı ve açıklama. Örneğin "Pist: 7 ay". | ph-gauge |
| ScoreGauge | 5 ile 25 arası problem puanı. ECharts gauge. | |
| EvidenceLadder | Yedi basamaklı dikey merdiven. Seçili basamak vurgulu. | ph-stairs |
| ThresholdBar | Eşik ile gerçekleşen değeri aynı çubukta gösterir. | ph-ruler |
| DecisionBadge | Altı karar sonucundan biri. Kendi rengini taşır. | ph-seal-check |
| ProfileSummary | Yedi seçimi tek satırda gösterir. Kelimeyle. | ph-identification-card |
| ComparisonTable | Seçenek karşılaştırma. Dar ekranda yatay kayar. | ph-table |
| Timeline | 90 günlük yol ve döngü tarihleri. | ph-clock-countdown |
| Callout | Beş tür: bilgi, ipucu, uyarı, örnek, sonuç. Her tür farklı simge ve yüzey tonu taşır. Kenarlık yok. | ph-info, ph-lightbulb, ph-warning, ph-chat-circle-text, ph-flag-checkered |
| EmptyState | Henüz veri yokken. Ne yapılacağını söyler. | ph-tray |
| Skeleton | Yüklenirken yer tutucu. | |
| Toast | Kısa bildirim. 4 saniye. Klavyeyle kapatılır. | ph-bell |
| Modal | Onay penceresi. Odak içeride kalır. | |
| Sheet | Alttan kayan panel. Dar ekranda Select ve DateField panelleri. | |
| DiffView | Eşik değişikliğinde eski ve yeni değer yan yana. | ph-git-diff |

### 4.4 Grafik bileşenleri

Bütün grafikler ECharts ile çizilir. Her grafik tokenlardan renk alır. Her grafiğin altında aynı veriyi veren bir tablo vardır. Ekran okuyucu tabloyu okur.

| Grafik | Tür | Nerede |
|---|---|---|
| Kurucu uyum radarı | radar | Adım 01. Dört konuda puan. |
| Pist çubuğu | bar | Adım 02. Ay cinsinden pist ve plan süresi yan yana. |
| Problem şiddeti göstergesi | gauge | Adım 07. 5 ile 25 arası. Eşik çizgileri 13 ve 20. |
| Görüşme sayacı | bar | Adım 06. Hedef ve gerçekleşen görüşme. |
| Pazar katmanları | funnel | Adım 09. Toplam pazar, ulaşılabilir pazar, gerçekçi pazar. |
| Varsayım haritası | scatter | Adım 10. Yatay eksen kanıt, dikey eksen etki. Sağ üst köşe önce test edilir. |
| Seçenek puanı | bar | Adım 11 ve 18. Ağırlıklı toplam. |
| Talep hunisi | funnel | Adım 15. Ulaşılan, deneyen, taahhüt veren, ödeyen. |
| Üç durumlu para | bar | Adım 16. Kötü, orta, iyi durumda katkı payı. |
| Kasa çizgisi | line | Adım 16 ve 29. Günlük kasa bakiyesi. Sıfır çizgisi işaretli. |
| Risk ısı haritası | heatmap | Adım 17. Olasılık ve etki. |
| Müşteri yolu hunisi | funnel | Adım 22 ve 25. Altı adım. |
| Kanal karşılaştırma | bar | Adım 24. Kanal başına maliyet ve ödeyen. |
| Kohort eğrisi | line | Adım 28. Aylık gruplar ve geri dönüş. |
| Birim ekonomisi | bar | Adım 29. Ömür değeri ve kazanma maliyeti. Oran üstte yazılı. |
| Karar yolculuğu | sankey | Rapor merkezi. Hangi kapıda hangi sonuç verildi. |
| Kapı zaman çizgisi | timeline | Rapor merkezi. Kararlar ve tarihler. |

### 4.5 Rapor bileşenleri

| Bileşen | Görev | Simge |
|---|---|---|
| ReportShell | Rapor sayfa düzeni. Başlık, künye, bölümler. | ph-file-text |
| ReportSection | Bir rapor bölümü. Başlık, özet, grafik, tablo. | |
| ExecutiveSummary | Yönetici özeti. Beş cümle. Otomatik dolar, elle düzeltilir. | ph-article |
| ActionList | Aksiyon planı maddeleri. Sahip, tarih, durum. | ph-list-checks |
| PrintLayout | Yazdırma ve PDF düzeni. Grafikler resme döner. | ph-printer |
| ExportMenu | JSON, Markdown ve PDF dışa aktarma. | ph-export |
| ShareLink | Salt okunur paylaşım bağlantısı. İkinci aşama. | ph-link |

### 4.6 Model çekmecesi bileşenleri

| Bileşen | Görev |
|---|---|
| ModelChip | Adım içinde model adı. Tıklanınca çekmece açılır. Bölüm adı ve bölümdeki sıra altında yazar. |
| ModelDrawer | Modelin "Kısaca" ve "Günlük Hayattan" kutuları. Sonra şema. Mevcut uygulama içeriğinden okur. |
| ModelLinkToApp | Karar Kitabı uygulamasında aynı modeli açan bağlantı. |

---

## 5. Aşama ve bileşen eşlemesi

Bu bölüm planın her bölümünü bileşene bağlar. "JSON alanı" sütunu arka planda yazılan anahtarı gösterir.

### 5.1 Giriş ekranı

| Plan bölümü | Bileşen | JSON alanı |
|---|---|---|
| Bugün nereden başlayacaksınız? | Üç büyük seçim kartı. SegmentedControl değil, kart. Her kartta simge ve bir cümle. | project.entry = "yeni", "devralma", "acil" |
| Beş başlangıç sorusu | FormSection içinde beş TextArea. | project.start.{karar, kotuSonuc, gozlem, kayitSahibi, sinir} |
| Acil zarar | Callout uyarı türü. "Durdur" düğmesi decision.stop rengi. | project.emergency = true |

### 5.2 Profil sihirbazı: Adım 00

| Soru | Bileşen | JSON alanı |
|---|---|---|
| Müşteriniz kim? | SegmentedControl, 4 seçenek. Pazar yeri seçilince iki alt soru açılır: satan taraf, alan taraf. | profile.customer, profile.marketplace.{seller, buyer} |
| Ne satıyorsunuz? | SegmentedControl, 4 seçenek. | profile.offering |
| Düzenleme | Toggle ve örnek sektör listesi. | profile.regulation |
| Kaç kişisiniz? | SegmentedControl. Ekip seçilince kişi sayısı NumberField açılır. | profile.team, profile.teamSize |
| Para nereden? | SegmentedControl. Dış para seçilince kaynak türü ChipGroup açılır. | profile.funding, profile.fundingSources |
| Pazar var mı? | SegmentedControl. | profile.market |
| Nereden başlıyorsunuz? | SegmentedControl. Devralma seçilince devralma girişi zorunlu olur. | profile.start |

Sihirbaz bitince ProfileSummary gösterilir. "Bu profil planı şöyle değiştirir" Callout bilgi türü. İçeriği "İşinize uygun koşulu seçin" tablosundan gelir.

### 5.3 Karar panosu

| Öğe | Bileşen | JSON alanı |
|---|---|---|
| Sekiz karar kartı | Kart ızgarası. Her kartta simge, soru, durum rozeti, tamamlanan adım sayısı, son kapı sonucu. | decisions[n].status |
| Kilit mantığı | Önceki kapı "ilerle" veya "koşullu ilerle" vermeden sonraki karar kilitlidir. Koşullu ilerlemede kartta süre sayacı görünür. | gates[n].outcome, gates[n].conditional.deadline |
| Üç sınır özeti | Üç KpiTile. Toplam harcama, bitiş tarihi, kalan deneme hakkı. | limits.{budget, deadline, retries} |
| Kısa yol anahtarı | Toggle. Açılınca yalnız kısa yol adımları görünür. | project.shortPath |

Karar simgeleri:

| Karar | Simge |
|---|---|
| 1. Araştırmaya değer mi? | ph-magnifying-glass |
| 2. Kimin hangi sorunu? | ph-users |
| 3. Ulaşabilir miyiz? | ph-map-trifold |
| 4. Neyi üstleniyorlar? | ph-handshake |
| 5. Hangi yol, hangi sınır? | ph-strategy |
| 6. İlk teslim işe yarıyor mu? | ph-package |
| 7. Tekrar korunuyor mu? | ph-arrows-clockwise |
| 8. Büyüt, sürdür, devret, kapat? | ph-tree-structure |

### 5.4 Karar 1: Araştırmaya değer mi?

| Adım | Bileşenler | JSON alanı | Koşul |
|---|---|---|---|
| 01 Kurucu niyeti | TextArea "5 neden" zinciri. Beş kutu alt alta. SegmentedControl çıkış yönü. RatingScale dört konu. Radar grafiği. Ortak varsa RepeaterTable "ortak uyum" beş satır. | founder.whys[], founder.exitDirection, founder.fitScores{}, founder.partners[] | Ortak soruları yalnız ekip profilinde görünür. |
| 02 Sınırlar | TextField başarı cümlesi. RepeaterTable durdurma kuralları, en az 3 satır. NumberField aylık gider, nakit. Pist KpiTile otomatik hesaplanır. NumberField toplam bütçe, DateField bitiş, NumberField karar başına deneme hakkı. Pist çubuğu grafiği. | limits.successSentence, limits.stopRules[], finance.monthlyBurn, finance.cash, limits.budget, limits.deadline, limits.retriesPerDecision | Pist planın süresinden kısaysa Callout uyarı. |
| 03 Karar hakları | RepeaterTable. Satır: kapı, karar sahibi, öneren, itiraz eden, bilgilenen. TextArea anlaşmazlık kuralı. | governance.rights[], governance.disputeRule | Yalnız ekip profilinde. |
| 04 Dış çevre | Hafif sürümde ChipGroup ile 2 veya 3 etken seçilir. Her etken için TextArea soru ve eylem alır. Tam sürümde altı etken FormSection olur. Beş güç RatingScale ile puanlanır. İki belirsizlik TextField ile yazılır. Dört senaryo ve izin listesi RepeaterTable ile girilir. | environment.factors[], environment.fiveForces{}, environment.uncertainties[], environment.scenarios[], environment.permits[] | Tam sürüm yalnız yüksek düzenleme veya yeni pazar profilinde. |
| Kapı 1 | Kapı ekranı. Dört ölçüt CheckList otomatik dolar. Sonuç önerisi DecisionBadge. Gerekçe TextArea zorunlu. | gates[1] | |

### 5.5 Karar 2: Kimin hangi sorunu?

| Adım | Bileşenler | JSON alanı | Koşul |
|---|---|---|---|
| 05 Problem tanımı | Kalıp dolduran dört TextField: kim, hangi durumda, hangi iş, engel. Birleşik cümle önizleme kartı. ChipGroup mevcut çözüm. NumberField bedel. | problem.who, problem.context, problem.job, problem.obstacle, problem.currentSolutions[], problem.cost | |
| 06 Müşteri keşfi | Hedef görüşme sayısı KpiTile profile göre. RepeaterTable görüşme kaydı. Satır alanları: kişi, görev, son olay, sıklık, şiddet, mevcut çözüm, taahhüt basamağı EvidenceLadderPicker, alıntı. Görüşme sayacı grafiği. Doygunluk Toggle. | interviews[] | Pazar yerinde iki ayrı tablo. |
| 07 Şiddet puanı | Beş RatingScale. Toplam ScoreGauge. Eşik çizgileri 13 ve 20. Taahhüt 2 ve altıysa Callout uyarı "en çok orta". | severity.{frequency, impact, urgency, dissatisfaction, commitment, total} | Kamu işinde eşik 16. |
| 08 İlk segment | FormSection segment kartı. TextArea davranış, bağlam, bütçe, erişim. İşletme işinde üç TextField: kullanan, ödeyen, karar veren. TextArea ulaşma yolu. | segment.{behavior, context, budget, access, roles{}} | |
| Kapı 2 | Kapı ekranı. Üç ölçüt profile göre eşik tablosu. ThresholdBar her ölçütte. | gates[2] | |

### 5.6 Karar 3: Ulaşabilir miyiz, hangi seçenek?

| Adım | Bileşenler | JSON alanı | Koşul |
|---|---|---|---|
| 09 Pazar ve rakip | İki NumberField aşağıdan yukarı. İki NumberField yukarıdan aşağı. Pazar katmanları hunisi. RepeaterTable rakipler, altı sütun. RepeaterTable boşluklar. Her sayıya ThresholdInput kaynak ve tarih. | market.bottomUp{}, market.topDown{}, competitors[], gaps[] | |
| 10 Varsayım haritası | RepeaterTable varsayım kartı. Sütunlar: cümle, başlık Select, etki RatingScale, kanıt RatingScale, test yöntemi, yanlışlama eşiği, yedek plan. Scatter grafiği. | assumptions[] | |
| 11 Üç yol | RepeaterTable yollar. "Hiçbir şey yapma" satırı silinemez. ScoreMatrix beş ölçüt. Ağırlıklar önce kilitlenir. Seçenek puanı grafiği. Test edilecek iki yol ChipGroup. | options[], optionWeights{}, optionsToTest[] | Küçük işte iki yol yeter. Toggle "küçük ve geri alınabilir iş". |
| 12 Yapabilirlik | RepeaterTable beceri, karar Select "yap, satın al, ortak ol". Donanımda FormSection teknik ön kanıt. Fiziksel üründe NumberField en küçük sipariş, tedarik süresi. Mekân gerekiyorsa FormSection konum. | capability.skills[], capability.techProof{}, capability.supply{}, capability.location{} | Fiziksel ürün, donanım ve mekân gerektiren işte zorunlu. |
| Kapı 3 | Kapı ekranı. Dört ölçüt. | gates[3] | |

### 5.7 Karar 4: Neyi üstleniyorlar?

| Adım | Bileşenler | JSON alanı | Koşul |
|---|---|---|---|
| 13 Değer önerisi | Kalıp dolduran beş TextField. Önizleme kartı. İki sütunlu kanvas: müşteri tarafı ve çözüm tarafı. Eşleştirme sürükle bırak değil, Select ile. | valueProp.sentence{}, valueProp.canvas{} | |
| 14 Hafif şirketleşme | CheckList dört madde. Toggle "fatura kesebiliyorum". Ücretsiz hizmette bütçe ve yetki TextField. | legal.light{} | Para alınmayacaksa atlanır. |
| 15 Talep testi | Yöntem kartı profile göre otomatik seçili. ThresholdInput eşik ve dayanak. DateField başlangıç ve bitiş. RepeaterTable teklif kayıtları: kişi, sonuç, kanıt basamağı, ret gerekçesi. Talep hunisi grafiği. EvidenceLadder özet. | demandTest.{method, threshold, start, end, offers[], result} | Eşik kilitlenmeden kayıt girişi açılmaz. |
| Kapı 4 | Kapı ekranı. Üç ölçüt. | gates[4] | |

### 5.8 Karar 5: Hangi yol, hangi sınır?

| Adım | Bileşenler | JSON alanı | Koşul |
|---|---|---|---|
| 16 Tek sayfalık plan | Dokuz kutulu kanvas. Her kutu TextArea. Üç durumlu para tablosu: kötü, orta, iyi sütunları. Üç hesap kartı: katkı, başabaş sayısı, kasa durumu. Hesaplar otomatik. Kasa çizgisi grafiği. Ödeme günleri RepeaterTable. En kırılgan sayı Select. | canvas{}, finance.scenarios{}, finance.contribution, finance.breakEven, finance.cashDays[], finance.fragileNumber | Pazar yerinde komisyon alanı açılır. |
| 17 Risk ve ön ölüm | RepeaterTable beş neden. Sütunlar: neden, erken işaret, önlem, sorumlu, durdurma eşiği. RepeaterTable risk tablosu altı başlık. Olasılık ve etki RatingScale 1 ile 3. Isı haritası. Olay kuralı RepeaterTable beş sütun. ChipGroup geri dönülemez kararlar. | risks.premortem[], risks.table[], risks.eca[], risks.irreversible[] | Yüksek düzenlemede hukuk satırı zorunlu. |
| 18 Saha ve kazanma yolu | RepeaterTable en az iki yol. Her yolda beş TextArea. ScoreMatrix yedi ölçüt. TextArea rakip karşı hamlesi. Seçilen yol Select. Vazgeçilenler ChipGroup. | strategy.paths[], strategy.weights{}, strategy.chosen, strategy.givenUp[], strategy.counterMove | |
| 19 Hedefler ve 90 gün | TextField hedef. RepeaterTable üç anahtar sonuç. Üç sütunlu pano: şimdi, sonra, daha sonra. Her madde sahip ve tarih. Timeline. Haftalık darboğaz sorusu Toggle. | okr{}, roadmap.now[], roadmap.next[], roadmap.later[] | |
| 20 Karar dosyası | Otomatik derlenen iki sayfa. On bir başlık. Kalite kontrol CheckList beş soru. "Devir için tek sayfa" yedi soru. | decisionFile{}, decisionFile.qualityCheck{} | Dosya düzenlenebilir. Kaynağı değişince uyarı verir. |
| Kapı 5 | Kapı ekranı. Beş ölçüt. | gates[5] | |

### 5.9 Karar 6: İlk teslim işe yarıyor mu?

| Adım | Bileşenler | JSON alanı | Koşul |
|---|---|---|---|
| 21 İlk ürün kapsamı | Dört kutulu pano: olmazsa olmaz, olmalı, olabilir, olmayacak. "Olmazsa olmaz" en çok 5 madde. Her maddeye varsayım Select. NumberField inşa süresi. Süre 6 haftayı aşarsa Callout uyarı. NumberField kişi sayısı. | mvp.scope{}, mvp.buildWeeks, mvp.headcount | Hizmet işinde "hizmet tanımı" FormSection. |
| 22 Ölçüm düzeni | Altı adımlı müşteri yolu RepeaterTable. Her adımda sayılacak şey. Select tek önemli sayı. ThresholdInput üç eşik ve fayda eşiği. DateField en erken sonuç tarihi. NumberField zarar sınırı. Toggle mevsim etkisi. | measurement.journey[], measurement.northStar, measurement.thresholds[], measurement.earliestDate, measurement.harmLimit, measurement.seasonal | |
| 23 İnşa ve yumuşak açılış | Haftalık kapsam kontrolü CheckList. RepeaterTable ilk müşteriler. RepeaterTable geri bildirim dört kutu. Toggle "ilk ödeme alındı". | build.weeklyChecks[], build.firstCustomers[], build.feedback[], build.firstPayment | |
| 24 Kanal testleri | Kanal kartları profile göre önerili. ChipGroup 2 ile 3 kanal. RepeaterTable kanal sonuçları: maliyet, gelen, deneyen, ödeyen. Müşteri başına maliyet otomatik. Kanal karşılaştırma grafiği. | channels.selected[], channels.results[] | |
| 25 İlk ürün kapısı | Kapı ekranı içinde. ThresholdBar üç ölçüt ve fayda. Umut kontrolü iki Toggle. Yön değiştirme tablosu etkileşimli: seçilen duruma göre dönülecek adım bağlantısı. | gates[6], pivot.{observed, part, targetStep} | En çok 3 deneme. Sayaç görünür. |

### 5.10 Karar 7: Tekrar korunuyor mu?

| Adım | Bileşenler | JSON alanı | Koşul |
|---|---|---|---|
| 26 Öğrenme döngüsü | Döngü kartları. Her döngüde: varsayım Select, ölçü, eşik, değişiklik, sonuç, dört soru. Timeline. | cycles[] | En çok 4 dönem. |
| 27 Problem çözüm uyumu | RepeaterTable alıntılar. Üç sayaç KpiTile. Toggle "uyum yakın". | psFit.quotes[], psFit.counts{}, psFit.near | |
| 28 Uyum ölçümü | Yöntem kartı profile göre. Anket sonucu NumberField. Kohort RepeaterTable: ay, 1. ay, 2. ay, 3. ay. Kohort eğrisi. Toggle mevsim düzeltmesi. | pmf.method, pmf.survey, pmf.cohorts[], pmf.signal | |
| 29 Birim ekonomisi | Dört NumberField. Dönem Select. Oran otomatik. Birim ekonomisi grafiği. Fiyat anketi dört NumberField. İki fiyat modeli RepeaterTable. | unitEconomics{}, pricing{} | Oran 1'in altındaysa Callout uyarı. |
| 30 Büyüme kanalı | RepeaterTable kanallar. ChipGroup üç deney. Sonuç tablosu. Select kazanan. | growth.channels[], growth.winner | Uyum işareti yoksa gizli. |
| 31 Tam şirketleşme | CheckList dört madde. RepeaterTable izinler. DateField başvuru. | legal.full{} | Koşula göre. |
| 32 Kalite | RepeaterTable sorunlar. Balık kılçığı altı başlık Select. Sürüm planı RepeaterTable en çok 3 iyileştirme. | quality.issues[], quality.releases[] | Koşula göre. |
| Kapı 7 | Kapı ekranı. Dört ölçüt. | gates[7] | |

### 5.11 Karar 8: Büyüt, sürdür, devret, kapat?

| Adım | Bileşenler | JSON alanı | Koşul |
|---|---|---|---|
| 33 Büyüme koşulu | ScoreMatrix dört seçenek. Büyüme yolları ChipGroup. Tek yer denemesi FormSection. Geri dönüş yolu TextArea. Devralacak kişi TextField. | growth.decision{}, growth.trial{}, growth.rollback | |
| 34 Devir ve kapanış | CheckList beş madde. RepeaterTable açık taahhütler. TextArea öğrenimler. | handover{} | Yalnız devret veya kapat kararında. |
| Kapı 8 | Kapı ekranı. Karar yolculuğu sankey grafiği burada da gösterilir. | gates[8] | |

### 5.12 Devralma girişi

| Öğe | Bileşen | JSON alanı |
|---|---|---|
| Üç soru | Üç TextArea. "Bilinmiyor" Toggle. | takeover.questions{} |
| Kontrol tablosu | Yedi satır. Her satırda Toggle evet veya hayır. Hayır seçilince gidilecek adım bağlantısı belirir. | takeover.checks[] |
| Üç acil risk | Üç Toggle ve Callout uyarı. | takeover.risks{} |
| Vaatler | RepeaterTable: vaat, sonuç, yerine geldi mi. | takeover.promises[] |

### 5.13 Kayıt defteri

| Sekme | Bileşen | JSON alanı |
|---|---|---|
| Karar günlüğü | Zaman sıralı liste. Her kayıt kart. Filtre: karar, sonuç, tarih. | decisionLog[] |
| Varsayım kartları | Kart ızgarası. Scatter grafiği. Durum rozeti: açık, doğrulandı, çürüdü. | assumptions[] |
| Görüşmeler | RepeaterTable ve kart görünümü. | interviews[] |
| Olay kuralları | RepeaterTable beş sütun. Tetiklenen kural kırmızı rozet alır. | risks.eca[] |
| Deneme kayıtları | Codex şablonu. Her deneme bir kart. On bir alan. | experiments[] |

### 5.14 Rapor merkezi

| Çıktı | Bileşenler | İçerik |
|---|---|---|
| Yönetici raporu | ReportShell, ExecutiveSummary, ReportSection x 8, sankey, timeline, KpiTile x 6, DecisionBadge, ExportMenu. | Bölüm 7'de ayrıntılı. |
| Girişimci aksiyon planı | ReportShell, ProfileSummary, ActionList, Timeline, ReportSection x 8, PrintLayout. | Bölüm 7'de ayrıntılı. |
| JSON dışa aktarma | ExportMenu. Şema sürümü dosya adında. | Bölüm 6'daki şema. |

---

## 6. Koşullu akış ve veri modeli

### 6.1 Koşul motoru

Koşul motoru üç girdi okur: profil, önceki kapı sonuçları ve sınırlar. Üç çıktı üretir: görünür adımlar, eşik değerleri ve kilit durumu.

Kural tablosu veri olarak tutulur. Kod içine gömülmez. Örnek kurallar:

| Kural | Girdi | Çıktı |
|---|---|---|
| Ekip profili | profile.team = "ekip" | Adım 03 zorunlu. |
| Yüksek düzenleme | profile.regulation = "yüksek" | Adım 04 tam sürüm. Adım 17'de hukuk satırı zorunlu. Adım 31 ilk satıştan önce. |
| Yeni pazar | profile.market = "yeni" | Karar 2 süresi 6 ile 8 hafta. Adım 04 tam sürüm. |
| Donanım | profile.offering = "donanım" | Adım 12 zorunlu. Karar 6 süresi 3 ile 6 ay. |
| Pazar yeri | profile.customer = "pazar yeri" | Görüşme ve talep testi iki taraf için ayrı. |
| Dış para | profile.funding = "dış para" | Adım 31 Karar 4 sonunda hatırlatılır. |
| Devralma | profile.start = "devralma" | Devralma girişi önce. Adım 00, 01, 02 ve 05 zorunlu. |
| Ücretsiz hizmet | demandTest.paid = false | Adım 14 atlanır. Kanıt merdiveninde ödeme yerine bütçe ve katılım. |
| Küçük ve geri alınabilir iş | options.small = true | Adım 11'de iki yol yeter. |
| Kısa yol | project.shortPath = true | Yalnız kısa yol adımları görünür. Kapılar yine görünür. |

### 6.2 Kapı motoru

1. Kapı ekranı ölçütleri okur. Her ölçüt için gerekli JSON alanına bakar.
2. Dolu ve eşiği geçen ölçüt yeşil tik alır. Eksik ölçüt gri kalır.
3. Motor bir sonuç önerir. Öncelik sırası: durdur, beklet, yeniden dene, yön değiştir, koşullu ilerle, ilerle. Zarar ve izin satırı her zaman önce bakılır.
4. Kurucu öneriyi kabul eder veya değiştirir. Değiştirirse gerekçe zorunludur.
5. "Yeniden dene" seçilince kalan deneme hakkı bir azalır. Hak sıfırsa seçenek kapalıdır.
6. "Koşullu ilerle" seçilince kapsam, para sınırı, sorumlu, bitiş tarihi ve kapanış kanıtı zorunlu alandır. Bitiş tarihi geçince sonuç kendiliğinden "beklet" olur. Aynı kapıda ikinci koşullu izin verilmez.
7. Sonuç karar günlüğüne yazılır. Kanıt, karşı görüş ve yeniden açılma koşulu ile birlikte.
8. Eşik testten sonra değiştirilemez. Değiştirme isteği DiffView ile gösterilir. Yeni eşik yalnız sonraki denemede geçerlidir. Değişiklik ikinci görüş alanını açar.

### 6.3 Veri modeli

Veri tek bir JSON belgesidir. Şema sürümü belgenin başında yazar. Belge tarayıcıda saklanır. Her değişiklikte kaydedilir. Kullanıcı istediğinde dışa aktarır.

Ana anahtarlar:

```json
{
  "schemaVersion": "5.0",
  "project": { "id": "", "name": "", "entry": "yeni", "shortPath": false, "createdAt": "", "updatedAt": "" },
  "profile": { "customer": "", "offering": "", "regulation": "", "team": "", "funding": "", "market": "", "start": "" },
  "limits": { "budget": 0, "deadline": "", "retriesPerDecision": 0, "stopRules": [] },
  "founder": {}, "governance": {}, "environment": {},
  "problem": {}, "interviews": [], "severity": {}, "segment": {},
  "market": {}, "competitors": [], "assumptions": [], "options": [], "capability": {},
  "valueProp": {}, "legal": {}, "demandTest": {},
  "canvas": {}, "finance": {}, "risks": {}, "strategy": {}, "okr": {}, "roadmap": {}, "decisionFile": {},
  "mvp": {}, "measurement": {}, "build": {}, "channels": {},
  "cycles": [], "psFit": {}, "pmf": {}, "unitEconomics": {}, "pricing": {}, "growth": {}, "quality": {},
  "handover": {}, "takeover": {},
  "gates": [], "decisionLog": [], "experiments": [],
  "reports": { "executive": {}, "actionPlan": {} }
}
```

Her kayıt nesnesi üç ortak alan taşır: `createdAt`, `updatedAt` ve `source`. `source` alanı kanıt basamağını ve kaynağı tutar.

Kapı kaydı örneği:

```json
{
  "gate": 4,
  "criteria": [ { "id": "talepEsigi", "met": true, "value": 3, "threshold": 3 } ],
  "suggested": "ilerle",
  "chosen": "ilerle",
  "reason": "",
  "counterView": "",
  "retriesLeft": 2,
  "conditional": null,
  "decidedBy": "",
  "decidedAt": "",
  "reopenWhen": ""
}
```

### 6.4 Kaydetme ve geri alma

- Her alan değişince 400 milisaniye sonra kaydedilir. TopBar rozeti durumu gösterir.
- Her kapı kararı ayrı bir sürüm noktasıdır. Kullanıcı önceki sürüme dönebilir.
- Dışa aktarılan JSON yeniden içe alınabilir. Şema sürümü eskiyse dönüştürücü çalışır.
- Tarayıcı deposu dolabilir veya silinebilir. Bu yüzden haftalık dışa aktarma hatırlatması vardır.

---

## 7. Çıktılar

### 7.1 Yönetici raporu

Karar sahibine sunulur. En çok 4 ekran sayfasıdır. Yazdırılınca 2 ile 3 sayfa olur.

| Bölüm | İçerik | Bileşen |
|---|---|---|
| Künye | Proje adı, profil, tarih, karar sahibi, şema sürümü. | ReportShell üst bloğu |
| Yönetici özeti | Beş cümle. Nerede olduğumuz, son kapı sonucu, en kritik varsayım, para durumu, sıradaki iş. Otomatik dolar. Elle düzeltilir. | ExecutiveSummary |
| Karar yolculuğu | Sekiz kapı ve sonuçları. | sankey ve timeline |
| Kanıt durumu | Doğrulanan, açık ve çürüyen varsayım sayısı. En yüksek kanıt basamağı. | KpiTile x 3, EvidenceLadder |
| Para durumu | Pist, kasa en düşük bakiye, katkı payı, oran. | KpiTile x 4, kasa çizgisi |
| Riskler | Kritik riskler ve tetiklenen olay kuralları. | Isı haritası, tablo |
| Açık kararlar | Kurucunun karar sahibinden beklediği onaylar. | ActionList |
| Sıradaki 90 gün | Şimdi kutusu. | Timeline |

### 7.2 Girişimci aksiyon planı

Kurucunun kendisi içindir. Planın profile göre süzülmüş ve doldurulmuş halidir.

| Bölüm | İçerik |
|---|---|
| Profil ve sınırlar | Yedi seçim. Üç sınır. Durdurma kuralları. |
| Yapılacak adımlar | Yalnız bu profilde geçerli adımlar. Her adımda durum: bitti, açık, atlandı. Atlanma nedeni yazılı. |
| Doldurulmuş kayıtlar | Problem cümlesi, değer önerisi, seçilen yol, eşikler, kapı sonuçları. |
| Sıradaki işler | Sahip, tarih ve bitiş ölçütü ile. |
| Dönüş haritası | Hangi sinyal hangi adıma döndürür. Yalnız ilgili satırlar. |
| Model listesi | Kullanılan Karar Kitabı modelleri. Bölüm adı ve bölümdeki sırası. |

### 7.3 Dışa aktarma

| Biçim | Kullanım |
|---|---|
| PDF | Yazdırma düzeni. Grafikler resme döner. Yazı tipi gömülür. |
| Markdown | Plan metni. Başka araçlara taşınır. |
| JSON | Tam veri. Yeniden içe alınır. |

---

## 8. Erişilebilirlik ve test kapısı

### 8.1 Erişilebilirlik

- WCAG 2.2 AA karşılanır. Metin kontrastı en az 4,5:1.
- Bütün bileşenler klavyeyle kullanılır. Tab, Shift+Tab, oklar, Enter, Space ve Escape.
- Select, Tabs, Accordion, Drawer ve Modal APG desenlerine uyar.
- Her grafiğin altında aynı veriyi veren tablo vardır. Grafik tek erişim yolu değildir.
- Hata metni alanın altında ve ekran okuyucuya bağlı.
- Dil Türkçedir. Tarihler "13 Kasım 2026 Cuma günü" biçiminde gösterilir.
- Yüzde 200 büyütmede içerik kaybolmaz. Dar ekranda tablo kendi içinde kayar.

### 8.2 Test kapısı

| Katman | Araç | Kapsam |
|---|---|---|
| Birim | Vitest | Koşul motoru, kapı motoru, hesaplar, şema dönüştürücü. |
| Bileşen | Playwright bileşen testi | Her bileşenin altı durumu. Klavye gezintisi. Odak göstergesi. |
| Görsel regresyon | Playwright, Chromium ve WebKit | 320, 360, 375, 390, yatay telefon, tablet, masaüstü. Açık ve koyu tema. Firefox çalıştırılmaz. |
| Hareket | Hedefli DOM ve hesaplanmış stil testi | Eğri, süre, iki yön, az hareket tercihi. |
| Odak | Hedefli test | Çevre halkası FAIL. Görünmez odak FAIL. |
| Erişilebilirlik | axe ve elle klavye turu | Her ekran. |
| Uçtan uca | Playwright | Profil seçiminden rapora bir tam yol. Devralma yolu. Kısa yol. |

Gerçek cihaz kontrolü emülasyondan ayrı raporlanır. Çalışmayan katman "not_run" yazılır.

---

## 9. Teslim sırası

Kurumsal teslim altı aşamadır. Her aşama bir kabul kapısıyla biter. İlk deneme sürümü yoktur. Her aşama üretim kalitesindedir.

| Aşama | İş | Kabul |
|---|---|---|
| A. Tasarım sistemi | Tokenlar, Outfit, odak, hareket, temel bileşenler: düğme, alan, Select, Callout, kart. | Bileşen testleri geçer. Odak ve hareket kapısı geçer. 320 ile masaüstü görsel kabul. |
| B. İskelet ve profil | AppShell, gezinme, giriş ekranı, profil sihirbazı, koşul motoru, veri deposu. | Profil seçimi JSON üretir. Kurallar tablosu testten geçer. |
| C. Karar 1 ile 4 | Adım formları, RepeaterTable, RatingScale, EvidenceLadder, ilk grafikler, kapı motoru. | Dört kapı uçtan uca çalışır. Deneme hakkı ve koşullu izin doğru işler. |
| D. Karar 5 ile 8 | Para hesapları, ScoreMatrix, ısı haritası, kohort, döngüler, devralma girişi. | Tam yol uçtan uca geçer. Sınır ve zaman kuralları doğru işler. |
| E. Kayıt defteri ve raporlar | Dört sekme, yönetici raporu, aksiyon planı, dışa aktarma, yazdırma. | Raporlar örnek veriyle doğru dolar. PDF ve Markdown doğru çıkar. |
| F. Erişilebilirlik ve kabul | axe, klavye turu, görsel regresyon, gerçek cihaz kontrolü, okur denemesi. | WCAG 2.2 AA bulguları kapanır. Gerçek okur bir adımı yardımsız tamamlar. |

---

## 10. Alınan kararlar

Kullanıcı bu altı kararı 13 Kasım 2026 Cuma günü onayladı. "Karar" sütunu artık bağlayıcıdır.

| Konu | Seçenekler | Karar |
|---|---|---|
| Uygulama yeri | Karar Kitabı uygulamasının içinde yeni bölüm. Ya da aynı tasarım sistemiyle ayrı uygulama. | Aynı depoda ayrı giriş sayfası. Model çekmecesi mevcut veriyi doğrudan okur. |
| Veri saklama | Yalnız tarayıcı. Ya da sunucu ve hesap. | İlk sürüm tarayıcı. Şema sunucuya hazır. |
| Çok kullanıcı | Tek kurucu. Ya da ekip ve karar hakları. | İkinci aşama. Karar hakları alanı şimdiden JSON'da. |
| Select bileşeni | Kendi APG bileşenimiz. Ya da hafif bir başsız kütüphane. | Kendi bileşenimiz. Proje çerçevesiz olduğu için bağımlılık eklenmez. |
| Koyu tema | İlk sürümde var. Ya da sonra. | İlk sürümde var. Tokenlar iki temayı baştan taşır. |
| Font lisansı | Outfit açık lisanslıdır. Dağıtım hakkı doğrulanır. | Doğrulanır ve kaynak dosyada not düşülür. |

---

## Denetim notu

Yalın Türkçe denetim betiği 13 Kasım 2026 Cuma günü bu belgede çalıştırıldı. Bileşen adları İngilizce kalır. Bunlar kod kimliğidir. Örneğin "RepeaterTable" ve "ScoreMatrix". Phosphor simge adları da kod kimliğidir. JSON anahtarları kod kimliğidir.

Bu belge gerçek okurla denenmedi.
