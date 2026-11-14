# Ön yüz uygulama planı: stratejik planlamaya geçiş

Bu belgeyi Claude 14 Kasım 2026 Cumartesi günü hazırladı. Plan yalnız ön yüzü kapsar. Sunucu yoktur. Veri tarayıcıda durur.

Dayanak belge [boşluk analizidir](stratejik-planlama-oncesi-bosluk-ve-eylem-plani.md). Codex'in altı önerisi bu plana işlendi.

## Hedef

Ürünün bitiş çizgisi değişiyor. Eski bitiş, sekiz kararın dolduğu gündü. Yeni bitiş şudur: karar sahibi, hangi kanıtlara dayanarak strateji çalışmasını açtığını kaydeder.

## Codex'ten alınan altı kural

1. Geçiş, risk incelemesinden sonra ve strateji seçiminden önce kurulur.
2. Yazılım öneri üretir. Kararı karar sahibi kaydeder.
3. Üç sonuç vardır: "Planlamaya hazır", "Koşullu hazır", "Henüz hazır değil".
4. Ödeme şart değildir. İlk teslim de şart değildir.
5. Onay, kanıtın incelendiğini göstermelidir. Kanıt silinince karar eskir.
6. Temel belgesi altı soruya cevap verir. Her cevapta kaynak ve tarih yazar.

## Yeni yol

| Aşama | İçerik | Bitiş |
|---|---|---|
| Temel | Karar 1, 2, 3, 4 ve Karar 5 "Para ve risk". Adım 00 ile 17 arası. | Kapı 5 |
| Geçiş kapısı | 9 zorunlu ve 6 destekleyici ölçüt. Temel belgesi. | Geçiş kararı |
| Strateji çalışması | Adım 18, 19 ve 20. | Strateji karar dosyası |
| Uygulama | Karar 6, 7 ve 8. Adım 21 ile 34 arası. | Kapı 8 |

## Adım adım iş listesi

Her adım bir öncekine dayanır. Aynı adımdaki işler paralel yapılabilir.

### Adım 1. Çekirdek veri ve motor

| No | İş | Dosya | Kabul ölçütü |
|---|---|---|---|
| 1.1 | Karar 5'i "Para ve risk" yap. Adım 18, 19 ve 20'yi "Strateji çalışması" grubuna taşı. | `src/data/decisions.ts`, `src/data/steps/karar5.ts`, `src/data/registry.ts` | Kapı 5, Adım 18 ile 20 boşken geçilir. Kapı 5 ölçütü gelecek adım istemez. |
| 1.2 | Aşama tanımlarını yaz. | `src/data/stages.ts` | Her adım tek bir aşamaya bağlıdır. |
| 1.3 | Geçiş kaydı tipini ekle. | `src/data/types.ts` | Plan, geçiş kararlarını liste olarak saklar. |
| 1.4 | Hazırlık motorunu yaz: 9 zorunlu, 6 destekleyici ölçüt, öneri, doğrulama seviyesi, karar doğrulaması. | `src/engine/readiness.ts` | Birim testleri her ölçütü ve üç sonucu sınar. |
| 1.5 | Kilit kuralını tek yerde topla. | `src/engine/gate.ts` | Karar 6 ve strateji adımları geçiş kararı olmadan açılmaz. |
| 1.6 | Eskime kuralını genişlet. Temel adımı değişince ya da kanıt silinince geçiş kararı eskir. | `src/engine/changes.ts`, `src/store/planStore.ts` | Adım 07 değişince geçiş kararı "İnceleme bekliyor" olur. |
| 1.7 | 20 temel taşını tanımla. | `src/data/foundation.ts` | Her taşın durumu ve kanıt gücü hesaplanır. |

### Adım 2. Kabuk ve yönlendirme

| No | İş | Dosya | Kabul ölçütü |
|---|---|---|---|
| 2.1 | Menüyü üç aşamaya böl. "Geçiş kapısı", "Strateji çalışması", "Temel taşları" ve "Varsayımlar" maddelerini ekle. | `src/app/AppShell.tsx` | Menüde üç grup başlığı görünür. |
| 2.2 | Dört yeni rota ekle: `/gecis`, `/strateji`, `/temel`, `/varsayimlar`. | `src/app/routes.tsx` | Dört adres açılır. |
| 2.3 | Konum satırını ve komut paletini güncelle. | `src/app/AppShell.tsx`, `src/components/CommandPalette.tsx` | Adım 18'de konum "Strateji çalışması" yazar. |

### Adım 3. Geçiş kapısı ekranı

| No | İş | Bileşenler | Kabul ölçütü |
|---|---|---|---|
| 3.1 | Üst özet | 3 `Statistic` kartı, `Progress` halkası, doğrulama seviyesi `Steps` | Örnek planda seviye görünür. |
| 3.2 | Zorunlu ölçütler | `Table`: durum ikonu, ölçüt, dayanak adım bağlantısı, kanıt sayısı | Eksik ölçüt kırmızı işaretlidir ve adıma götürür. |
| 3.3 | Destekleyici ölçütler | `Table` | Karşılanan ve eksik ayrı görünür. |
| 3.4 | Karar paneli | Öneri rozeti, üç seçenekli `Radio` kart listesi, gerekçe, karar sahibi, "Dayanakları inceledim" kutusu | Kutu işaretlenmeden kayıt olmaz. |
| 3.5 | Koşullu hazır alanları | Planlanacak konu, açık soru, sorumlu, son tarih | Son tarih planın bitişini geçemez. |
| 3.6 | Kayıt sonrası | `Result` ve "Strateji çalışmasını aç" düğmesi | "Henüz hazır değil" kaydında düğme görünmez. |

### Adım 4. Temel taşları ve varsayım panosu

| No | İş | Bileşenler | Kabul ölçütü |
|---|---|---|---|
| 4.1 | Temel taşları ekranı | 20 `Card`, durum etiketi, kanıt gücü `Progress`, `Segmented` süzgeç | Eksik taşa tıklayınca ilgili adım açılır. |
| 4.2 | Varsayım panosu | Üç sütun: "Denenmedi", "Doğrulandı", "Çürüdü". Kartta etki ve test yöntemi | Durum değişince Adım 10 verisi güncellenir. |
| 4.3 | Fiyat kanıtı alanları | Adım 15'e iki alan: teklif edilen fiyat, bu fiyatı kabul eden sayısı | Destekleyici ölçüt 1 bu alanlardan beslenir. |

### Adım 5. Strateji çalışması ve temel belgesi

| No | İş | Bileşenler | Kabul ölçütü |
|---|---|---|---|
| 5.1 | Strateji çalışması ekranı | "Dayanak özeti" kartı (altı soru), üç adımın listesi, kilit notu | Geçiş kararı yokken adımlar kilitli görünür. |
| 5.2 | Adım kilidi | Adım 18 ile 20 salt okunur açılır. Üstte neden yazar. | Kilitliyken "Adımı tamamla" kapalıdır. |
| 5.3 | Ön doldurma | Adım 18 ve 19 için "taslak" etiketli öneriler | Onaylanmayan öneri kayda geçmez. |
| 5.4 | Temel belgesi | Çıktılar ekranında üçüncü sekme. Altı soru, kaynak ve tarih, geçiş kararı. Markdown ve yazdırma. | Boş alan "Henüz yazılmadı" yazar. |

### Adım 6. Pano, giriş ve örnek plan

| No | İş | Bileşenler | Kabul ölçütü |
|---|---|---|---|
| 6.1 | Panoda üç aşama | Yatay `Steps`, doğrulama seviyesi, giriş bloğu sıradaki işi gösterir | Kapı 5 geçilince giriş bloğu "Geçiş kapısı" der. |
| 6.2 | Karar ekranında kilit | Karar 6, geçiş kararı olmadan kilitli | Kilit nedeni yazar. |
| 6.3 | Giriş metni | Amaç cümlesi ve üç aşamanın anlatımı | İlk ekranda amaç okunur. |
| 6.4 | Geçmiş | Geçiş kararları zaman çizelgesinde | Kayıt, gerekçe ve karar sahibi görünür. |
| 6.5 | Örnek plan | Mahalle kafesi Adım 17'ye kadar dolu | Geçiş kapısı öneri üretir. |

### Adım 7. Test ve yayın

1. Birim testleri hazırlık motorunu sınar.
2. Tarayıcı testleri geçiş akışını, kilidi ve temel belgesini sınar.
3. Mevcut tasarım testleri yeni ekranlarda da çalışır.
4. Kapı betiği, tip denetimi ve bütün testler geçince yayın yapılır.

## Kapsam dışı

- Sunucu, kullanıcı girişi ve ekip paylaşımı.
- Strateji çalışmasının kendisini derinleştirmek. Adım 18 ile 20 bugünkü içeriğiyle kalır.

## Denetim notu

Bu belge yalın Türkçe denetim betiğinden geçirildi. Tablo hücrelerindeki bazı cümleler kabul koşulu taşır ve bölünmedi. Gerçek okurla denenmedi.
