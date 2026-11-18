# Kurumsal bileşen planı (3. tur)

Kullanıcı kararı, 13 Kasım 2026: "Bileşen çeşitliliği yok, yerleşim kötü, bileşenler wireframe gibi." Bu belge her ekranın hangi Ant Design ve ECharts bileşenleriyle kurulacağını söyler. Görünüm katmanı (koyu yan menü, beyaz kart, gölge) `src/styles/global.css` sonundaki "Kurumsal görünüm katmanı" bölümündedir. Tüm ekranlar bu belgeye uyar.

## Ortak kurallar

- Ant Design 6.7 bileşenleri kullanılır: `Card`, `Statistic`, `Progress`, `Steps`, `Timeline`, `Tabs`, `Descriptions`, `Table` (sıralama, süzgeç, sayfalama, satır seçimi), `Tooltip`, `Badge`, `Avatar`, `Segmented`, `Collapse`, `Drawer`, `Popover`, `Dropdown`, `Empty`, `Result`, `Skeleton`, `List`, `Anchor`, `Form` (`Form.Item` etiket, `tooltip`, `extra`), `Input` (addon, prefix), `InputNumber` (birim ekli), `DatePicker`, `Select` (arama), `Radio.Button`, `Rate`, `Slider`, `Switch`, `Tag` (renkli), `Divider`.
- ECharts: donut, gösterge (gauge), çizgi (sparkline), huni, radar, yatay bar. Her grafik `ChartFrame` ile gelir ve "Veriyi göster" tablosu taşır.
- Her kart (`Card`) başlık + sağda eylem (`extra`) taşır. Kart içinde kart yoktur; kart içinde liste, tablo, grafik vardır.
- Her ekranın masaüstü yerleşimi en az iki sütunludur. Telefon tek sütundur ve aynı bileşenler daralır.
- Veri yoksa `Empty` ile açıklama ve eylem gösterilir. Yükleme için `Skeleton` kullanılır.
- Ekranda bir dolu düğme (`type="primary"`). Diğer eylemler `default`, `text` ya da `Dropdown`.
- Yasaklar aynen geçerlidir: çevreleyen odak halkası, 14 px altı yazı, kavisli kutuda renkli kenar çizgisi, sayfa taşması, 400/600 dışı ağırlık.
- Metin yalın Türkçe. Tarih `formatDate`, para `formatMoney`.

## Ekranlar

### Planlar (`/`)
- Üst: `PageHeader` + "Yeni plan" (primary) + "Daha fazla" `Dropdown`.
- Özet satırı: 3 `Statistic` kartı (plan sayısı, açık karar sayısı, son değişiklik).
- Plan listesi `Table`: ad (bağlantı), ilerleme (`Progress` çubuğu, 8 kontrol), durum `Tag`, son değişiklik, sürüm, eylemler (`Dropdown`). Sıralama ve arama (`Input.Search`). Telefonda `List` kartları.
- Örnek plan satırı `Badge` "Örnek".

### Plan özeti (`/ozet`)
- Satır 1: hero (açık karar, halka, tek primary) + sağda 2 kart: "Kasa süresi" (`Progress` çizgi + `Statistic`) ve "Deneme hakkı" (`Progress` daire).
- Satır 2: 4 KPI kartı (`StatTile` ikonlu); her birinde kısa trend cümlesi.
- Satır 3: "Karar rotası" `Steps` (dikey, `progressDot`, durum: finish / process / wait) + "Nakit akışı" ECharts çizgi (adım 16 ödeme günleri) + "Son kararlar" `Timeline` (`DecisionBadge`).
- Satır 4: `Tabs`: "Açık işler" (`Table`: iş, sorumlu, tarih, durum), "Son kanıtlar" (`Table`), "Değişiklik kaydı" (`List`).
- Sınır satırı `Descriptions` (3 sütun) ve kısa yol `Switch`.

### Karar ekranı (`/karar/:n`)
- `PageHeader` + `Progress` çubuğu (adımların tamamı) + tek primary "Kontrol N'e git".
- "Bu kararda ne var?" `Descriptions` (Soru, Kim yapar, Süre, Çıktı).
- Adımlar `Steps` (yatay, telefonda dikey) + altında `Table`: adım, gereklilik `Tag`, durum `Tag`, son güncelleme, "Aç" bağlantısı.
- Sağ sütun `Card` "Kontrol önizleme": ölçüt sayısı `Progress` daire, `List` ölçütler (ikon + metin), "Günlük Hayattan" `Collapse`.

### Adım ekranı (`/karar/:n/adim/:id`)
- `Form` `layout="vertical"`: `Form.Item` etiket, `tooltip` (yardım), `extra` (ipucu). Alanlar: `Input` prefix/addon, `InputNumber` `addonAfter` birim, `DatePicker`, `Select` `showSearch`, `Radio.Button` grup, `Rate`, `Slider` (puan 1-5), `Switch`.
- Bölümler `Card` başlıklı; sağ sütun `Anchor` (bölümlere atlama), "Doluluk" `Progress` daire, "Nasıl yapılır?" `Collapse`, yöntem çipleri `Tag` (tıklayınca `Drawer`).
- Tekrarlı tablo `Table` `size="middle"` düzenlenebilir hücreler, satır ekle `Button` `dashed`.
- Alt şerit `.action-bar` (≤3 düğme).

### Kontrol ekranı (`/karar/:n/kapi`)
- Üst özet: 4 `Statistic` (karşılanan ölçüt, ölçülmeyen, deneme hakkı, kasa süresi) + `Progress` daire (ölçüt yüzdesi).
- "Ölçütler" `Table`: ikon, ölçüt, durum `Tag`, dayanak adım bağlantısı, `Tooltip` ipucu.
- "Koşula göre sonuç" `Table` süzgeçli (sonuca göre) ve `Badge`.
- "Kararı kaydedin" `Card` içinde `Steps` (1 Sonucu seçin, 2 Gerekçeyi yazın, 3 Kaydedin) + seçenekler `Radio` kart listesi + `Form`. Kayıt sonrası `Result` "Karar kaydedildi" ve sonraki adım bağlantısı.

### Kanıtlar (`/kanitlar`)
- Üst: 3 `Statistic` (toplam, gözlem, tahmin) + basamak dağılımı mini bar (ECharts yatay).
- `Table`: arama, tür ve basamak süzgeçleri (sütun süzgeci), sıralama, sayfalama 10, satır seçimi (toplu sil `Dropdown`), satır tıklayınca `Drawer` detay (`Descriptions`, kullanıldığı adımlar `Tag`).
- Ekleme `Drawer` `Form`.

### İşler (`/isler`)
- `Tabs`: "Pano" (3 sütun kanban: Taslak, Açık, Bitti; `Card` kartları, sürükleme yok, durum `Select`) ve "Liste" (`Table`).
- Üst `Statistic` 3 kutu; gecikmiş işler `Badge` kırmızı.

### Göstergeler (`/gostergeler`)
- 2 satır grafik ızgarası (her kart ECharts + "Veriyi göster"): karar ilerlemesi (yatay bar), kanıt basamağı (donut), nakit (çizgi), huni (teklif→taahhüt→ödeme), ölçü/eşik (bar), karar zaman çizgisi (scatter). `Segmented` ile dönem seçimi (tümü / son 30 gün) varsa.
- Üst: 4 `Statistic` kartı, altlarında `Progress` çizgisi.

### Çıktılar (`/ciktilar`)
- Sol: belge `Tabs` + `Anchor` içindekiler; belge gövdesi `Descriptions` ve `Table`.
- Sağ: "Sürümler" `Timeline` + "Dışa aktar" `Card` (Yazdır primary, Markdown, JSON).

### Geçmiş (`/gecmis`)
- `Timeline` (karar, değişiklik, sürüm karışık; `Segmented` süzgeç) + sağda `Statistic` özet.

### Karar Kitabı (`/yontemler`)
- `Tabs` bölümler + `Input.Search`; kart ızgarası `Card` (`hoverable`, `actions`: Karar Kitabı'nda aç, kullanıldığı adımlar `Badge`); `Pagination` 24.

### Kabuk
- Yan menü koyu; menüde durum noktası.
- Üst şerit: konum satırı, `Input.Search` yerine Ctrl+K komut paleti (adım ve yöntem arama) `Modal`, kayıt durumu, tema.
