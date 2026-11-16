# GAP analizi: konuşulmayanlar ve bekleyen kararlar

Bu belge 15 Kasım 2026 Pazar günü sohbette yapılan GAP analizini kaydeder. Belge 16 Kasım 2026 Pazartesi günü dosyaya yazıldı.

GAP analizi, eksikleri bulan bir karşılaştırmadır. Önce konuşulanlar listelenir. Sonra konuşulmayanlar işaretlenir. Bu analiz yalnız bilinen eksikleri bulur. Aklımıza hiç gelmeyen eksikler için [bilinmeyen bilinmeyenler raporuna](<../reports/Karar Atlası bilinmeyen bilinmeyenler.md>) bakın.

## Ana sonuç

Konuşulanların neredeyse hepsi masa başında kaldı. En büyük eksik şudur: hiçbir şey gerçek bir müşteriyle denenmedi.

## Konuştuklarımız

| Alan | Durum |
|---|---|
| Süreç ve üç ana küme | Tamam. Uygulamada var. |
| Arka yüz, modüller ve internetsiz eşitleme | Tasarlandı. Kod yazılmadı. |
| Mobil uygulama ve gece yayını | Tasarlandı. Kod yazılmadı. |
| AI'ın yapacakları ve yapmayacakları | İlkeler yazıldı. Teknik tasarım yok. |
| Hedef kitle, ICP ve personalar | Yazıldı. Görüşmeyle doğrulanmadı. |
| Gelir modeli ve fiyat | Hesaplandı. Fiyat müşteriyle sınanmadı. |
| OKR, KPI ve SMART | Konuşuldu. |
| Hizmet ihtiyacı ve yetki modeli | Yazıldı. Frappe'de test edilmedi. |
| Yöntemin güvenilirliği | Değerlendirildi. İki hata bulundu ve bekliyor. |
| Rakipler | Haritası çıkarıldı. |

## Konuşmadıklarımız

### 1. Ürün

| Konu | Neden önemli? |
|---|---|
| İlk sürümün kapsamı | Hangi özelliklerin ilk sürüme gireceği seçilmedi. Tasarım bir yıllık işten büyük. |
| Ürün yol haritası | Hangi özelliğin ne zaman geleceği belli değil. |
| İlk kullanım deneyimi | Yeni kullanıcının ilk 30 dakikada ne göreceği belli değil. |
| İlk faydanın görülme süresi | Müşterinin ürünün işe yaradığını kaç günde göreceği ölçülmedi. |
| Toplantı çıktıları | Yönetim kurulu ve aile meclisi için sunum ya da PDF çıktısı tasarlanmadı. |
| Çoklu plan görünümü | Holding ya da danışman bütün planları tek ekranda göremiyor. |
| İngilizce sürüm | İhracatçı müşteri ya da yurt dışı satışı için gerekebilir. |
| Kullanım ölçümü | Ürünün nasıl kullanıldığını ölçen bir yapı yok. Kişisel veri boyutu da konuşulmadı. |

### 2. AI'ın teknik tasarımı

İlkeler yazıldı. Şu konular konuşulmadı:

- hangi modelin kullanılacağı,
- modelin Türkçe yazı kalitesi,
- AI'ın planın kanıtlarını nasıl okuyacağı,
- AI'ın doğru çalıştığını ölçen bir sınama seti,
- AI'ın yanlış ya da uydurma cevabına karşı önlem,
- maliyet sınırının teknik olarak nasıl korunacağı.

### 3. Satış ve pazarlama

| Konu | Neden önemli? |
|---|---|
| Satış ve pazarlama planı | Müşteriye hangi yoldan ulaşılacağı yazılmadı. Örneğin sanayi odaları ya da aile şirketi dernekleri. |
| Danışman ortaklık programı | Komisyon, eğitim ve belge koşulları belli değil. |
| Fiyat denemesi | Fiyatı müşteriyle sınayacak bir yöntem uygulanmadı. |
| Müşteri desteği | Destek saatleri, cevap süresi ve hizmet sözü belli değil. |
| Örnek müşteri hikâyesi | İlk satış için gösterilecek bir başarı örneği yok. |

### 4. Para ve şirket

| Konu | Neden önemli? |
|---|---|
| Ekip maliyeti | Gelir raporuna göre en büyük bilinmeyen budur. |
| Finansman | Yatırımcı ve devlet destekleri konuşulmadı. Örneğin KOSGEB ve TÜBİTAK. |
| Şirket yapısı | Ürünü hangi şirketin satacağı belli değil. |
| Ödeme ve fatura | Abonelik ödemesi ve e-fatura altyapısı konuşulmadı. |
| Kendi girişime uygulama | Ürünün süreci bu girişime uygulanmadı. |

### 5. Hukuk ve güvenlik

| Konu | Neden önemli? |
|---|---|
| Açık kaynak lisansı | Seçilmedi. Gelir modelini doğrudan etkiler. |
| Verinin hangi ülkede duracağı | Karar verilmedi. KVKK ve kamu müşterisi bu karara bağlı. |
| Müşteri sözleşmesi ve kullanım şartları | Yazılmadı. |
| KVKK metinleri ve VERBİS kaydı | Konuşulmadı. |
| Güvenlik belgeleri | ISO 27001 ve sızma testi gibi beklentiler konuşulmadı. |
| Olağanüstü durum planı | Sunucu çökerse ne kadar veri kaybolabileceği ve ne kadar sürede dönüleceği belli değil. |

### 6. Marka

| Konu | Durum |
|---|---|
| Marka adı | Kesinleşmedi. Ürün şimdilik "Karar Atlası" diye anılıyor. |
| Alan adı | Alınmadı. |
| Marka tescili | Araştırılmadı. |
| Görsel kimlik | Uygulamanın tasarımı var. Markanın görsel kimliği yok. |

### 7. Riskler

Girişimin kendi risk analizi yapılmadı. Örneğin şu soru sorulmadı: "Bu girişim iki yıl sonra başarısız olduysa nedeni ne olurdu?" Bu yönteme ön ölüm analizi denir.

## Bekleyen kararlar

1. Açık kaynak lisansı
2. Verinin duracağı ülke
3. Marka adı
4. Ana alan adı
5. Tek kurucunun ikinci görüşü danışmandan alması. Bu Claude'un önerisidir. Codex genel bir danışman zorunluluğu olmamasını öneriyor. Codex'in gerekçesi daha güçlü.
6. Yeni strateji onayının eski kaynak izinlerini kapatması. Bu da Claude'un önerisidir.
7. Kısa yoldaki D5 ve D7 sorunu. [Geliştirme karar notlarında](gelistirme-karar-notlari.md) bekliyor.

## Önerilen öncelik sırası

**Geliştirmeden önce:**

1. 15 ile 30 müşteri görüşmesi ve 3 deneme yapılır.
2. Ekip maliyeti çıkarılır.
3. Lisans seçilir.
4. Verinin duracağı ülke seçilir.
5. İlk sürümün kapsamı belirlenir.
6. AI'ın teknik tasarımı yapılır.

**İlk satıştan önce:**

1. Marka adı seçilir ve tescil araştırması yapılır.
2. Müşteri sözleşmesi ve KVKK metinleri hazırlanır.
3. Ödeme ve fatura altyapısı kurulur.
4. Pilot paketi ve destek kuralları yazılır.
5. Satış ve pazarlama planı yazılır.

**Daha sonra:**

1. İngilizce sürüm
2. Çoklu plan görünümü
3. Dış yazılımlarla bağlantılar
4. Güvenlik belgeleri

Bu sıra Claude'un önerisidir.
