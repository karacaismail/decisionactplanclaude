# Girişimci Aksiyon Planı: Uzlaşmış Ön Yüz Planı

Bu belge iki bileşen planının birleşimidir. Birinci plan Claude'un `act_components.md` dosyasıdır. İkinci plan Codex'in `act_components.md` dosyasıdır. Belge 13 Kasım 2026 Cuma günü yazıldı. Uygulama bu belgeye göre kodlanır.

İş kuralları `act_plan_v5_final-claude.md` ve `act_plan_v5_final-codex.md` dosyalarındaki sekiz karar ve 35 adıma dayanır. İki plan arasında kalan farklar bu belgede kapatıldı. Fark tablosu 11. bölümdedir.

---

## Sözlük

| Terim | Günlük açıklaması |
|---|---|
| Bileşen | Ekranın tekrar kullanılan parçası. Düğme, form alanı ve kart birer bileşendir. |
| Token | Tasarımın tek yerde tutulan değeri. Renk, boşluk ve süre gibi. |
| Ant Design | Hazır bileşen kütüphanesi. React ile çalışır. Görünümü token ile değiştirilir. |
| React | Ekranı parçalardan kuran kütüphane. Ant Design bunu gerektirir. |
| Sihirbaz | Adım adım ilerleyen form. |
| JSON | Verinin metin halinde saklanma biçimi. |
| Şema | JSON verisinin alanlarını söyleyen kural. |
| ECharts | Grafik kütüphanesi. |
| Phosphor | Simge kütüphanesi. |
| Kanıt | Bir iddiayı destekleyen kayıt. Tarihi, kaynağı ve türü vardır. |
| Karar kapısı | Bir kararın sonunda sonuç seçilen yer. |
| Yetenek tabanlı teslim | Cihazın gerçekten yapabildiğine göre dosya göndermek. Telefon önce formu alır. Grafik sonra gelir. |

---

## 1. Kapsam ve yığın

### Ürün ne yapar?

1. Kurucu işini yedi soruyla anlatır. Plan buna göre daralır.
2. Kurucu sekiz kararı sırayla işler. Her adımda form doldurur. Her cevap JSON'a yazılır.
3. Her karar sonunda kapı ekranı açılır. Sistem sonuç önerir. Kurucu seçer ve gerekçe yazar.
4. Kanıtlar tek bir kanıt defterinde durur. Aynı kanıt birden çok adımda kullanılır.
5. Kararlardan görevler doğar. Görevler iş listesinde izlenir.
6. İki belge üretilir. Yönetici raporu ve girişimci aksiyon planı. İkisi aynı veri sürümünden üretilir.

### Yığın

Kullanıcı kararı: Ant Design kullanılır. Bu yüzden yeni uygulama React ile kurulur. Karar Kitabı uygulaması ayrı kalır. Yeni uygulama Karar Kitabı'nın model verisini kopya olarak taşır.

| Katman | Seçim | Sürüm | Neden |
|---|---|---|---|
| Derleme | Vite | 8 | Karar Kitabı ile aynı. Hızlı. |
| Dil | TypeScript | 5.9 ve üstü | Tipli veri şeması. |
| Görünüm | React | 19 | Ant Design gerektirir. |
| Bileşen | Ant Design | 6 | Kullanıcı kararı. React 19 ile doğrudan çalışır. |
| Grafik | ECharts | 6 | Karar Kitabı ile aynı. |
| Simge | Phosphor Icons React | 2 | Emoji yasaktır. |
| Durum | Zustand | 5 | Küçük ve tipli durum deposu. |
| Yönlendirme | React Router | 7 | Ekranlar arası geçiş. |
| Test | Vitest, Playwright | güncel | Chromium ve WebKit. Firefox çalıştırılmaz. |
| Yayın | GitHub Pages | | GitHub Actions ile. |

### Yetenek tabanlı teslim

- İlk yükleme yalnız form, gezinme ve veri deposunu getirir.
- ECharts yalnız grafik içeren ekran açılınca yüklenir. Her grafik türü ayrı parçadır.
- Rapor yazdırma araçları yalnız rapor ekranında yüklenir.
- Davranış cihaz adına göre değil, yeteneğe göre seçilir. Dokunma, fare, genişlik ve hareket tercihi ayrı sorgulanır.
- Grafik yüklenemezse tablo ve form çalışır. Grafik tek erişim yolu değildir.

---

## 2. Tasarım temeli

### 2.1 Yön

Çalışma alanı iyi düzenlenmiş bir yatırım dosyası gibi okunur. Karar sorusu başlıkta durur. Kanıt hemen altındadır. Sıradaki eylem sayfanın sonundadır. Her soruya ayrı kart çizilmez. Yoğun tablo yalnız karşılaştırma yerinde açılır.

### 2.2 Renk

| Token | Açık tema | Koyu tema | Kullanım |
|---|---|---|---|
| surface.page | #F8F7F4 | #16191D | Sayfa zemini |
| surface.work | #FFFFFF | #1F2429 | Çalışma yüzeyi |
| surface.context | #F1F3F4 | #262C33 | İkincil yüzey, tablo satırı |
| text.primary | #20282F | #ECEEF0 | Ana metin |
| text.secondary | #495761 | #AEB9C0 | Açıklama |
| action.primary | #8F2812 | #FF9A7D | Ana düğme |
| brand.accent | #F95428 | #FF6F4D | Vurgu, seçili grafik serisi |
| status.ok | #17634C | #5FD3A6 | Tamam |
| status.hold | #79520F | #E0B35A | Bekliyor |
| status.harm | #A02F34 | #FF8A8E | Zarar, hata |
| status.info | #315A75 | #8CC3E8 | Bilgi |
| decision.proceed | yeşil | | "İlerle" |
| decision.conditional | sarı yeşil | | "Koşullu ilerle" |
| decision.retry | mavi | | "Yeniden dene" |
| decision.pivot | mor | | "Yön değiştir" |
| decision.hold | gri mavi | | "Beklet" |
| decision.stop | kırmızı | | "Durdur" |

Ant Design tokenları bu değerlerden beslenir. Ant Design'ın kendi varsayılan mavisi hiçbir yerde görünmez.

### 2.3 Yazı

- Outfit. Yedek sistem yazı tipleri. Tutar ve kod için sabit genişlikli font.
- Gövde 16, yardımcı 14, bölüm başlığı 24, ana başlık 32, rapor başlığı 40 piksel. Hiçbir metin 14 pikselin altına inmez.
- Tutarlarda eşit genişlikli rakam.
- Telefonda başlık sarılır. Yoğun tabloda yazı küçülmez.

### 2.4 Boşluk ve biçim

- Alan içi 8 veya 12. Satırlar arası 16. Bölümler arası 32. Telefon kenar payı 16. Geniş ekran 32.
- Kontrol köşesi 6. Panel köşesi 12. Metin alanı sınırı 1 piksel. Gölge yalnız açılan yüzeyde.
- Kontrol yüksekliği 44. Yoğun tabloda görünür düğme 32, gerçek dokunma hedefi 44.
- Kavisli vurgu kenarı yasaktır. Seçili satır yüzey tonu ve onay işareti ile gösterilir.

### 2.5 Odak

- Çevreleyen odak halkası yasaktır. Ant Design'ın varsayılan odak çerçevesi kapatılır.
- Tab ve Shift+Tab görünür odağı açar. Fare ve dokunma kapatır.
- Gösterge, öğenin sol dışında duran 3 piksel dikey işarettir. Kutunun köşesine değmez. Bağlantıda alt çizgi kalınlaşır.
- Zorunlu renk modunda `2px solid CanvasText` kullanılır.
- Çekmece kapanınca odak açan düğmeye döner.

### 2.6 Hareket

- Eğri `cubic-bezier(.65, 0, .35, 1)`.
- Süre dört kademedir. Mikro 120, küçük yüzey 160, panel 220, sayfa 320 milisaniye.
- Her geçiş iki yönlüdür. Durum ve odak anında güncellenir.
- Az hareket tercihinde gereksiz hareket kapanır.
- Ant Design hareket tokenları aynı eğri ve sürelere bağlanır.

### 2.7 Yerleşim

- Önce 320 piksel. Sonra 360, 375, 390, yatay telefon, tablet, masaüstü.
- Telefonda tek sütun. Tablette içerik ve yardım paneli. Masaüstünde gezinme, içerik ve kanıt paneli.
- Tablo kendi alanında yatay kayar. Sayfa taşmaz.
- Yön değişince cevap, açık kanıt ve odak korunur.

---

## 3. Ekranlar

| Ekran | Simge | Kullanıcının işi | Ana eylem |
|---|---|---|---|
| Planlar | ph-folders | Doğru planı bulur. Yeni plan açar. | "Planı aç" |
| Giriş | ph-compass | Yeni iş, devralma veya acil zarar yolunu seçer. | "Başla" |
| Plan özeti | ph-squares-four | Nerede olduğunu görür. Sekiz karar kartı. Üç sınır. Açık görevler. | "Kaldığım yerden devam et" |
| Çalışma | ph-list-checks | Bir adımın sorularını cevaplar. Kanıt bağlar. | "Devam et" |
| Kanıtlar | ph-paperclip | Kanıt ekler, süzer, bağlar. | "Kanıtı bağla" |
| İnceleme | ph-door-open | Kapı ölçütlerini görür. Sonuç seçer. | "Kararı kaydet" |
| İşler | ph-check-square | Görevleri üstlenir ve kapatır. | "Teslimi kaydet" |
| Çıktılar | ph-file-text | Yönetici raporu ve aksiyon planı. | "Dışa aktar" |
| Geçmiş | ph-clock-counter-clockwise | Sürümleri ve değişiklikleri görür. | "Sürümü aç" |
| Yöntem çekmecesi | ph-book-open | Karar Kitabı modelini adım içinden açar. | |

Karar simgeleri:

| Karar | Simge |
|---|---|
| 1. Yetki | ph-briefcase |
| 2. Sorun | ph-users |
| 3. Erişim ve seçenek | ph-map-trifold |
| 4. Taahhüt | ph-handshake |
| 5. Kaynak ve strateji | ph-wallet |
| 6. İlk teslim | ph-package |
| 7. Tekrar | ph-arrows-clockwise |
| 8. Gelecek | ph-signpost |

---

## 4. Bileşen kataloğu

Ant Design bileşenleri temel alınır. Her biri token ile markalanır. Ant Design'da olmayan bileşenler projede yazılır. Her bileşen altı durumu uygular: hover, active, focus-visible, disabled, selected ve invalid.

### 4.1 Ant Design'dan alınanlar

| Bileşen | Kullanım | Değişiklik |
|---|---|---|
| ConfigProvider | Tema, dil, token | Türkçe yerel ayar. Açık ve koyu algoritma. |
| Layout, Drawer | İskelet ve çekmece | Telefonda gezinme Drawer olur. |
| Menu | Sol gezinme | Seçili öğe yüzey tonu ile gösterilir. |
| Steps | Karar içindeki adım rayı | Dikey. Telefonda yalnız sayı. |
| Form, Input, InputNumber, DatePicker, Select, Radio, Checkbox, Switch, Slider, Rate | Alanlar | Select ve DatePicker panelleri markalı. Tarayıcı varsayılanı kullanılmaz. |
| Segmented | Kısa tek seçim | Profil soruları. |
| Table | Karşılaştırma ve kayıt listeleri | Kendi alanında kayar. İlk sütun kelime ortasından bölünmez. |
| Tabs, Collapse | Sekme ve katlama | Ok tuşu desteği. |
| Card, Descriptions, Statistic | Özet ve sayı | Statistic eşit genişlikli rakam kullanır. |
| Tag, Badge, Progress | Durum | Altı karar rengi Tag'e bağlanır. |
| Alert, Result, Empty, Skeleton, Spin | Geri bildirim ve boş durum | Alert kenar çizgisi kapatılır. Yüzey tonu kullanılır. |
| Modal, Popconfirm, Tooltip, Popover | Üst katman | Kritik bilgi yalnız ipucunda bırakılmaz. |
| Timeline | Geçmiş ve 90 gün | |
| Upload | Dosya eki | Yalnız ad ve tarih JSON'a yazılır. |
| FloatButton | Telefonda "Devam et" | |

### 4.2 Projede yazılanlar

| Bileşen | Görev |
|---|---|
| EvidenceLadder ve EvidenceLadderPicker | Yedi basamaklı kanıt merdiveni. Seçim ve gösterim. |
| EvidenceDrawer | Kanıt çekmecesi. Tür, tarih, geçerlilik, sahip, bağlı iddia ve karşı bulgu. |
| MeasureInput | Ölçü adı, birim, dönem, başlangıç değeri, eşik ve dayanak birlikte. "Bilinmiyor" ve "Uygulanmıyor" seçenekleri. |
| ThresholdInput | Eşik ve dayanağı. Dayanak boşsa "ilk tahmin" işareti. |
| ThresholdBar | Eşik ile gerçekleşen değeri aynı çubukta gösterir. |
| ScoreMatrix | Ağırlıklı puanlama tablosu. Ağırlık kilitlenmeden puan girilmez. |
| RepeaterTable | Satır ekle, düzenle, geri al, taşı. Telefonda satırlar kart olur. |
| DecisionBadge | Altı sonuçtan biri. |
| OutcomePanel | Kapı sonucu seçimi. Gerekçe, karşı görüş, koşullu izin alanları, kalan deneme hakkı. |
| LimitsBar | Toplam harcama, bitiş tarihi, kalan deneme hakkı. |
| DiffView | Eski ve yeni değer. Telefonda alt alta. |
| ChartFrame | Grafik, "Veriyi göster" tablosu ve kısa sonuç cümlesi. |
| ModelChip ve ModelDrawer | Karar Kitabı modeli. "Kısaca" ve "Günlük Hayattan" kutuları. |
| ExampleAside | Dört sektör örneği. Kurmaca olarak işaretli. |
| FocusMarker | Sol dış odak göstergesi. Bütün bileşenler bunu kullanır. |

---

## 5. Form akışı ve koşullar

1. Kullanıcı "Yeni iş" veya "Devraldığım iş" yolunu seçer.
2. Yedi soru işi tarif eder. Kodlar kullanıcıya gösterilmez.
3. Her seçim taslağa işlenir. "Devam et" bir sonraki uygun adıma götürür.
4. Her kararın başında "Kısaca" ve "Günlük Hayattan" kutuları görünür.
5. "Bilinmiyor" seçimi eksik kanıtı ve sıradaki işi görünür tutar.
6. Karar sonunda inceleme ekranı açılır. Yetkili kişi gerekçesiyle kaydeder.
7. "Geri" ile önceki cevap düzeltilir. Sistem yeniden incelenecek kararları gösterir.
8. Karar kaydedilince çıktılar güncellenir.

Koşul kuralları veri olarak tutulur:

| Seçim | Davranış |
|---|---|
| Devralma | Adım 00, 01, 02 ve 05 kontrol edilir. Devir tablosu açık sözleri gösterir. |
| Ekip | Adım 03 açılır. Tek kurucuda ağır karar ikinci görüş ister. |
| Yeni pazar veya izin | Adım 04 tam sürüm. İzin yalnız bağlı işi bekletir. |
| Fiziksel ürün, donanım veya iş yeri | Adım 12 zorunlu. Sonuç Adım 15'ten önce görünür. |
| Pazar yeri | Adım 06, 08, 15 ve 28'de taraflar ayrı izlenir. |
| Ücret alınacak | Adım 14 fatura ve izin sorar. Eksikte ödeme eylemi kapalıdır. |
| Ücretsiz veya kurum içi | Adım 14 bütçe sahibi ve uygulama yetkisi sorar. Adım 15 ve 29 katılım ve hizmet başı gider kullanır. |
| Dış para | Kurumun yazılı koşulu istenir. Adım 31 erken hatırlatılır. |
| Ağır yatırım | Adım 11 üç çözüm ister. Küçük işte bir alternatif yeter. |
| Kısa yol | Sekiz karar özet sırada açılır. Adım 12, 14 ve 15 sırası korunur. |

---

## 6. Adım ve bileşen eşlemesi

Her adımın JSON anahtarı `steps.NN` altındadır.

### Karar 1. Yetki

| Adım | Bileşenler | Veri |
|---|---|---|
| 00 İşin tanımı | Yedi Segmented soru. Pazar yerinde iki alt soru. Serbest tanım TextArea. | profile |
| 01 Amaç ve gelecek | Beş "neden" TextArea zinciri. Segmented çıkış yönü. Rate dört konu. Radar grafiği. Ortak RepeaterTable. | founderIntent |
| 02 Sınırlar | TextField başarı cümlesi. RepeaterTable durdurma kuralları. InputNumber gider ve nakit. Pist Statistic. LimitsBar. Deneme hakkı InputNumber. | limits |
| 03 Karar hakları | RepeaterTable kapı, karar sahibi, öneren, itiraz eden. TextArea anlaşmazlık kuralı. | authority |
| 04 Dış koşullar | Hafif: ChipGroup 2 veya 3 etken. Tam: altı etken, beş güç Rate, iki belirsizlik, dört senaryo RepeaterTable, izin takvimi. | externalConditions |
| Kapı 1 | OutcomePanel. Ölçütler: yetki, kaynak, durma kuralları. | decisions[] |

### Karar 2. Sorun

| Adım | Bileşenler | Veri |
|---|---|---|
| 05 Problem tanımı | Kalıp dört alan. Önizleme kartı. Son olay DateField. Kayıp birimi Select. | problem |
| 06 Müşteri keşfi | Görüşme defteri RepeaterTable. Rol süzgeci. EvidenceLadderPicker. Örneklem Progress. İki taraflı işte iki defter. | interviews |
| 07 Sorunun büyüklüğü | Üç kanıt satırı MeasureInput: tekrar, çaba, kayıp. Her satır durum, değer, kaynak. Yardımcı gösterge olarak beş Rate toplamı. Toplam kapı ölçütü değildir. | problemEvidence |
| 08 İlk müşteri grubu | FormSection segment kartı. Roller: kullanan, ödeyen, karar veren. Erişim yolu. | targetGroups |
| Kapı 2 | Üç kanıt, hedef grup, eksik ölçüm nedeni. Ek görüşme bir kez, en çok 2 hafta. | decisions[] |

### Karar 3. Erişim ve seçenek

| Adım | Bileşenler | Veri |
|---|---|---|
| 09 Pazar ve rakip | İki yönlü pazar hesabı. Pazar katmanları hunisi. Rakip Table altı sütun. Boşluk RepeaterTable. Her sayıya kaynak ve tarih. | market |
| 10 Varsayım haritası | RepeaterTable. Etki ve kanıt Rate. Scatter grafiği. Nokta kaydı açar. | assumptions |
| 11 Çözüm seçenekleri | Bugünkü yöntem sabit sütun. RepeaterTable yollar. ScoreMatrix beş ölçüt. Test edilecek iki yol. Tek yol kalırsa ikinci görüş alanı. | options |
| 12 Yapabilirlik | Beceri RepeaterTable yap, satın al, ortak ol. Donanımda teknik örnek. Mekânda konum ve kira. Tedarik süresi ve en küçük sipariş. | feasibility |
| Kapı 3 | Erişim, seçenek, beceri, pazar. Ortak bekleniyorsa yalnız bağımsız hazırlık için süreli izin. | decisions[] |

### Karar 4. Taahhüt

| Adım | Bileşenler | Veri |
|---|---|---|
| 13 Değer önerisi | Beş alanlı teklif düzenleyici. Gerçek metin önizlemesi. İki sütunlu kanvas. | offer |
| 14 Ödeme veya bütçe yetkisi | Segmented ücretli veya ücretsiz. Ücretli: fatura, tahsilat, izin CheckList. Ücretsiz: bütçe sahibi, uygulama yetkisi, imzalı kanıt. | transactionReadiness |
| 15 Talep testi | Yöntem kartı profile göre. ThresholdInput. DateField başlangıç ve bitiş. Teklif RepeaterTable: kişi, sonuç, kanıt basamağı, ret nedeni. Talep hunisi. | demandTest |
| Kapı 4 | Yazılı taahhüt eşiği, davranış, teklif sayıları, ret gerekçeleri. | decisions[] |

### Karar 5. Kaynak ve strateji

| Adım | Bileşenler | Veri |
|---|---|---|
| 16 Tek sayfalık plan ve para | Dokuz kutu. Üç senaryo Tabs. Üç hesap kartı: katkı, başabaş, kasa. Ödeme takvimi RepeaterTable. Kasa çizgisi grafiği, sıfır çizgisi ve en düşük bakiye işareti. Ücretsiz işte hizmet başı gider. | economics |
| 17 Risk | Ön ölüm RepeaterTable beş neden. Risk defteri altı başlık. Olasılık ve etki Rate 1 ile 3. Nokta grafiği. Olay kuralı RepeaterTable. Geri dönülemez kararlar. | risks |
| 18 Saha ve kazanma yolu | RepeaterTable en az iki yol. ScoreMatrix yedi ölçüt. Rakip karşı hamlesi. Seçilen ve vazgeçilen yan yana. | strategy |
| 19 Hedefler ve 90 gün | Hedef ve üç anahtar sonuç. Şimdi, sonra, daha sonra panosu. Sorumlu ve tarih. Timeline. | roadmap |
| 20 Karar dosyası | Otomatik derlenen belge önizlemesi. Önceki sürümle DiffView. Kalite kontrol CheckList. Karşı görüş. | strategyDossier |
| Kapı 5 | İlk açık ödeme günü, kalan para, risk önlemi, karar dosyası. | decisions[] |

### Karar 6. İlk teslim

| Adım | Bileşenler | Veri |
|---|---|---|
| 21 İlk ürün kapsamı | Dört kutulu pano. "Olmazsa olmaz" en çok 5. Varsayım bağlantısı. İnşa süresi. Kişi sayısı. Hizmette hizmet tanımı. | deliveryScope |
| 22 Ölçüm düzeni | Altı adımlı müşteri yolu. Üç işletme ölçüsü ve ayrı fayda ölçüsü MeasureInput. Zarar sınırı ayrı. En erken sonuç tarihi. Mevsim anahtarı. | measurementPlan |
| 23 İlk teslim | Teslim defteri. Katılımcı satırları. Tamamlandı veya yarım kaldı. Yardımla ve yardımsız biten ayrı. Geri alma sorumlusu. | deliveries |
| 24 Kanal testleri | Kanal kartları profile göre. Sonuç Table: gider, gelen, deneyen, ödeyen. Kanal grafiği. | channelTests |
| 25 İlk ürün kapısı | ThresholdBar üç ölçüt ve fayda. Kusur listesi. OutcomePanel. Yön değiştirme tablosu etkileşimli. En çok 3 deneme. | deliveryReview |

### Karar 7. Tekrar

| Adım | Bileşenler | Veri |
|---|---|---|
| 26 Öğrenme döngüsü | Döngü kartları. Önce ve sonra. Dört soru. Aynı deneme ailesine bağlı. | learningCycles |
| 27 Problem çözüm uyumu | Alıntı RepeaterTable. Üç sayaç Statistic. Fayda kanıtına kaynak. | benefit |
| 28 Tekrar | Dönem seçici. Kohort Table ve çizgi grafiği. Olgunlaşmamış dönem boş. Mevsim düzeltmesi. | repeatBenefit |
| 29 Birim ekonomisi ve fiyat | Dönem ve para birimi. Dört sayı. Oran Statistic. Payda sıfırsa "Hesaplanamaz". Fiyat anketi. İki fiyat modeli. | unitEconomics |
| 30 Büyüme kanalı | Kanal eleme listesi. Üç deney. Kazanan. | growthChannels |
| 31 Tam şirketleşme | Yükümlülük listesi. Belge sürümü ve tarih. Kurum içi işte gerekçeli kapatma. | obligations |
| 32 Kalite | Kusur defteri. Altı başlık Select. Düzeltme görevi. | quality |
| Kapı 7 | Olgunlaşan dönemler, katkı, kapasite, sözleşmeler. | decisions[] |

### Karar 8. Gelecek

| Adım | Bileşenler | Veri |
|---|---|---|
| 33 Büyüme koşulu | Dört yönlü ScoreMatrix. Sınırlı büyüme denemesi. Geri dönüş yolu. | futureDirection |
| 34 Devir ve kapanış | Açık sözler. Teslim alan kişi. Yazılı kabul. Kapanış tutanağı. | handover |
| Kapı 8 | İşin yönü, geri dönüş planı, devralanın kabulü. "Devret" yön, "Beklet" sonuç olabilir. | decisions[] |

---

## 7. Karar incelemesi

Sıra her kapıda aynıdır:

1. "Hangi işe karar veriyoruz?" ve kapsam.
2. Zarar, izin, kalan para, süre ve deneme hakkı.
3. Yazılı ölçü, gerçekleşen değer ve kanıt.
4. Önerilen sonuç, gerekçe ve yetkili eylemi.

Öncelik: önce ciddi zarar ve yazılı durma koşulu. Sonra yetki, izin ve kalan kaynak. Sonra karar tablosundaki ilk uygun satır. Çakışan iki bulguda üstteki kuralın neden seçildiği gösterilir.

| Sonuç | Açılan alanlar | Kaydın sonucu |
|---|---|---|
| Durdur | Zarar bildirimi, etkilenen işler, geri dönüş sorumlusu. | Harcama ve teslim yetkisi kapanır. Açık taahhütler görevde kalır. |
| Beklet | Neden, izlenecek olay, sorumlu, kontrol tarihi. | Yeni harcama bekler. |
| Yeniden dene | Yeni ölçüm, kalan hak, bütçe özeti. | Hak varsa yeni deneme kaydı doğar. |
| Yön değiştir | Değişecek unsur ve etkilenen adımlar önizlemesi. | İlk etkilenen adım açılır. Yeni görevler doğar. |
| Koşullu ilerle | Sınırlı iş, üst tutar, bitiş, sorumlu, kapanış kanıtı. | Aynı eksik için bir kez. Süre uzatılamaz. Kanıt gelmezse "Beklet". |
| İlerle | Kanıt özeti, yetki, yeni bütçe, sonraki sorumlu. | Yalnız belirtilen iş açılır. |

Tek kurucuda ikinci görüş üç durumda zorunludur. Geri alınması güç karar. Eşik veya durma kuralı değişikliği. Sınır artışı veya bitiş ertelemesi. Görüş ayrı kimlik ve tarihle kaydolur.

---

## 8. Veri modeli

Tek JSON belgesi. Tarayıcıda saklanır. Her kapı kararı bir sürüm noktasıdır. Dışa aktarılır ve içe alınır. Sunucuya hazır kurulur.

| Kayıt ailesi | İçerik |
|---|---|
| plan | Kimlik, ad, şema sürümü, kaynak plan sürümü, çalışma sürümü, para birimi, saat dilimi. |
| profile | Yedi cevap. Kodsuz, kelimeyle. |
| steps | "00" ile "34" arası anahtar. Cevaplar, kapsam, durum, değişiklik zamanı. |
| measures | Ölçü adı, yön, birim, dönem, başlangıç, eşik, dayanak, pay ve payda. |
| experiments | Deneme ailesi, sıra, amaç, tarihler, kalan hak, bütçe. |
| evidence | Kimlik, tür, tarih, grup, kaynak, ek, karşı bulgu. Gözlem, tahmin, varsayım etiketi. |
| decisions | Karar numarası, kapsam, önerilen, seçilen, gerekçe, karşı görüş, sürüm, koşullu izin. |
| tasks | Eylem, kaynak karar, sorumlu, tarih, bağımlılık, kabul ölçüsü, durum. |
| outputs | Belge türü, veri sürümü, oluşturma zamanı, kapsam. |
| revisions | Her kapı kararında alınan anlık kopya. |

Değer kuralları:

- "Bilinmiyor" boş kalır. Gerçek sıfır ölçülmüş sonuçtur. "Uygulanmıyor" neden ister.
- Tutar kuruş cinsinden tam sayı ve para birimiyle saklanır. 1.250,50 TL için 125050.
- Ekranda tarih "13 Kasım 2026 Cuma günü" biçiminde gösterilir.
- Dosya eki içeriği JSON'a yazılmaz. Yalnız ad, tür ve tarih yazılır.

Kayıt akışı: alan değişince taslak hemen güncellenir. 400 milisaniye sonra kaydedilir. Adımdan ayrılırken bekleyen değişiklik işlenir. Önce alan türü, sonra alanlar arası kural kontrol edilir. Geçersiz sayı hesaba girmez.

---

## 9. Çıktılar

İki belge aynı veri sürümünden üretilir. Yayımlanınca sürüm sabitlenir. Sonraki değişiklik yeni sürüm açar.

### Yönetici raporu

| Bölüm | Kaynak |
|---|---|
| Karar özeti: son onaylı sonuç, bekleyen öneri, gerekçe | decisions, steps 18 ve 20 |
| Sorun ve talep: üç kanıt, teklif sayıları, taahhüt türleri | steps 05, 06, 07, 13, 15 |
| Kaynak ve risk: kalan yetki, ilk nakit açığı, en önemli risk | steps 02, 16, 17, 29 |
| Teslim ve tekrar: fayda, dönemler, kapasite | steps 22, 25, 27, 28, 32 |
| Açık karar ve gelecek | steps 03, 20, 33, 34, decisions |
| Kanıt eki: numaralı liste, ölçüm dönemi, bilinmeyenler | evidence, measures |

En çok iki ana grafik. Nakit çizgisi ve fayda karşılaştırması öne çıkar.

### Girişimci aksiyon planı

| Bölüm | Kaynak |
|---|---|
| İlk iş ve engel | tasks, güncel karar sonucu |
| 90 günlük çalışma: zaman çizelgesi ve sıralı liste | step 19, tasks |
| Denemeler: amaç, eşik, yöntem, kalan hak | steps 10, 15, 22, 24, 26 |
| Teslim ve kabul | steps 12, 20, 21, 23, 25 |
| Sonraki karar: tarih veya olay | steps 02, 17, 25, 28 |
| Devir veya kapanış | steps 33, 34 |

Biçimler: ekran önizlemesi, yazdırılabilir PDF, Markdown ve JSON.

---

## 10. Kabul ve test

| Deneme | Kabul |
|---|---|
| 320, 360, 375, 390 | Ücretli ve ücretsiz yol tamamlanır. Yatay taşma yok. |
| Yatay telefon, tablet, masaüstü | Cevap, kanıt, seçili kayıt ve odak korunur. |
| Klavye | Tab, Shift+Tab, oklar, Enter, Space, Escape çalışır. |
| Odak | Çevre halkası FAIL. Görünmez odak FAIL. |
| Hareket | Eğri, süre, iki yön, az hareket. |
| Erişilebilirlik | axe ve klavye turu. WCAG 2.2 AA. |
| Adım 07 ve 14 | Üç kanıt ayrı doldurulur. Ücretsiz işte fatura alanı kapanır. |
| İki belge | Aynı sürümden üretilir. Nakit açığı ve sahip çelişmez. |
| Yavaş ağ | İlk sorudan önce grafik indirilmez. Grafik yüklenemezse form çalışır. |
| Tarayıcı | Chromium ve WebKit otomasyon. Gerçek Safari ve Chrome elle. Firefox çalıştırılmaz. |

---

## 11. İki plan nasıl uzlaştı?

| Konu | Claude | Codex | Karar |
|---|---|---|---|
| Yığın | Vanilla TypeScript, mevcut uygulama içinde | Mevcut yığın, yeni veri sözleşmesi | Kullanıcı kararı: Ant Design ve React. Ayrı uygulama. |
| Ekranlar | 9 ekran, karar panosu merkezli | 8 ekran, kanıt ve iş listesi merkezli | 10 ekran. Kanıtlar, İşler ve Geçmiş Codex'ten. Pano ve çekmece Claude'dan. |
| Adım 07 | Beş puan toplamı, eşik 20 | Üç ayrı kanıt, puan yok | Üç kanıt satırı esastır. Toplam yalnız yardımcı gösterge. Kapı ölçütü değildir. |
| Profil | Kelimeyle, Adım 00 sihirbazı | Yedi kısa soru, kod yok | Aynı. Kod hiçbir yerde görünmez. |
| Kurumsal roller | İkinci aşama | Rol tablosu ve sunucu kontrolü | Veri modelinde rol alanları var. İlk sürüm tek kullanıcı. Sunucu ikinci aşama. |
| Yetenek tabanlı teslim | Kısa not | Ayrıntılı kural | Codex kuralı alındı. Grafik ve rapor araçları geç yüklenir. |
| Odak | Sol dış işaret | Düz alt çizgi | Sol dış işaret. Köşeye değmez. Bağlantıda alt çizgi. |
| Hareket süreleri | 120, 200, 320 | 160, 220 | 120, 160, 220, 320. |
| Renk değerleri | Token adları | Somut değerler | Codex değerleri ve Claude'un altı karar rengi birlikte. |
| Kanıt | Adım içinde | Tek kanıt defteri, kimlikle bağlama | Tek kanıt defteri. Claude'un kanıt merdiveni her kanıtta alan. |
| Görevler | Rapor içinde liste | Ayrı iş listesi ekranı | Ayrı ekran. Her görev kaynak karara bağlı. |
| Para | Sayı | Kuruş cinsinden tam sayı | Kuruş. |
| Karar simgeleri | Farklı set | Farklı set | Birleşik set. 3. bölümde. |

---

## Denetim notu

Yalın Türkçe denetim betiği 13 Kasım 2026 Cuma günü çalıştırıldı. Bileşen adları, JSON anahtarları ve simge adları kod kimliğidir. İngilizce kalır. Renk değerleri veri biçimidir.

Bu belge gerçek okurla denenmedi.
