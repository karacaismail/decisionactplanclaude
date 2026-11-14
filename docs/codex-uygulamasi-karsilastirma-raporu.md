# Codex uygulamasından ne alınır? Karşılaştırma raporu

Bu raporu Claude 15 Kasım 2026 Pazar günü hazırladı.

## Durum

Rapordaki sekiz fikir aynı gün uygulandı. Kalan fikirler 5. bölümde nedeniyle birlikte duruyor.

## Kısa cevap

Codex aynı araştırmadan aynı bölümleri kurmuş. Asıl engel, başarı koşulları, güç süzgeci ve durum özeti iki uygulamada da var. Bu bölümlerde alınacak yeni bir şey yok.

Codex'in asıl üstünlüğü başka bir yerde: veri bütünlüğü kurallarında. Codex, birbirini tutmayan kayıtları yakalıyor. Bu kuralların sekizini aldım.

Codex'in bir bölümü ise bize uymuyor. O bölüm sunucu, kullanıcı rolü ve sürüm onayı ister. Bu uygulama yalnız tarayıcıda çalışır.

## 1. Neyi inceledim?

Codex'in çalışma klasörü `/Users/w6x/Developer/decisionactplancodex` adresindedir. Klasöre yalnız baktım. Hiçbir dosyayı değiştirmedim.

| Dosya | İçinde ne var? | Nasıl inceledim? |
|---|---|---|
| `src/readiness.ts` | Geçiş kararı, kanıtın sayılma kuralı, kararın geçersizleşmesi | Kuralları satır satır okudum. |
| `src/dossier.ts` | Devir dosyası, yol karşılaştırması, kritik iddialar | Kural işlevlerini okudum. |
| `src/research.ts` ve `src/researchCatalog.ts` | 14 hazırlık yöntemi ve hesapları | Yöntem listesini ve hesap kurallarını okudum. |
| `src/preparationMethods.ts` | Altı temel yöntem ve borç kaydı | Yöntem tanımlarını okudum. |
| `src/operations.ts` ve `src/team.ts` | Görev defteri, devralma kontrolü, roller | Tanımları okudum. |
| `src/views/` altındaki ekranlar | Pano, plan portföyü, inceleme kuyruğu | Yalnız başlıklarına baktım. |

Codex'in stil dosyalarını ve sunucu kodunu okumadım.

## 2. İki uygulamanın ortak yanları

Bu bölümlerde iki uygulama aynı sonuca varmış. Yeni iş gerekmiyor.

| Konu | Codex'te | Bu uygulamada |
|---|---|---|
| Asıl engel ve başka açıklama | "Asıl engeli incele" yöntemi | Adım 18, "Asıl engel" |
| Başarı koşulu | "Başarı neye bağlı?" yöntemi | Adım 18, "Başarı neye bağlı?" |
| Yolun iç tutarlılığı | "Bu yol neden çalışabilir?" yöntemi | Adım 18, aynı adlı bölüm |
| Güç süzgeci | "Güçlü yönleri sına" yöntemi | Adım 12, "Güçlü yönler" |
| Durum özeti ve çapraz sorular | "Durum özetinden aday yolu açıklayın" | Adım 18, "Durum özeti" |
| Serbest bütçe | "Serbest bütçeyi hesapla" | Adım 16, "Serbest bütçe" |
| Darboğaz | "Kapasiteyi sınırlayan kaynağı bul" | Adım 12, "Darboğaz" |
| Grup, pazar yeri, ücretsiz hizmet | Üç ayrı yöntem | Profile göre açılan üç bölüm |

Güç süzgecinde iki uygulama aynı kuralı bile koymuş. İkisi de "rakipte yok" diyen kullanıcıdan dayanak istiyor.

## 3. Codex'in daha iyi yaptığı şey: veri bütünlüğü

Codex her kayıt için aynı soruyu soruyor. Soru şudur: "Bu kayıt gerçekten sayılır mı?" Bu uygulama o soruyu yeterince sormuyordu.

Üç örnek verelim:

1. Kullanıcı aynı kişiyi iki satıra yazabiliyordu. Yazılım iki ayrı kişi sayıyordu.
2. Kullanıcı 5 kişiye ulaştığını, 9 kişinin denediğini yazabiliyordu. Yazılım itiraz etmiyordu.
3. Kullanıcı yalnız kendi kanaatini kanıt diye bağlayabiliyordu. Geçiş kapısı bunu sorunun kanıtı sayıyordu.

Üçü de gerçek açıktı. Üçü de kapatıldı.

## 4. Aldığım sekiz fikir

| No | Fikir | Codex'teki kaynağı | Bu uygulamada nerede? |
|---|---|---|---|
| 1 | Aynı kişi iki kez sayılmaz. | Talep kanıtında farklı katılımcı sayımı | Adım 06 ve Adım 15, "Kişi denetimi" |
| 2 | Sayılar birbirini tutmalı. | Talep sayılarının sınır denetimi | Adım 15 tamamlama kuralı |
| 3 | Oran payı paydayı geçemez. | Oran hesabındaki denetim | Adım 15, "Eşleşme oranı" |
| 4 | Aynı görünen yol iki yol sayılmaz. | Yol karşılaştırmasının hazır olma kuralı | Adım 18, "Yollar ne kadar farklı?" ve Kapı 5 |
| 5 | Kanaat kanıt sayılmaz. | Görüş türündeki kanıtın dışlanması | Geçiş kapısı, Z2 ölçütü |
| 6 | Gelecek tarihli kayıt kanıt sayılmaz. | Tarihli dayanak kuralı | Geçiş kapısı ve kanıt formu |
| 7 | Karşı bulgu gizlenmez. | Karşı bulgunun talep kanıtını durdurması | Geçiş kapısında uyarı |
| 8 | Ayrı görüş kayda geçer. | "Farklı görüşü kaydet" yöntemi | Adım 17, "Ayrı görüş" ve devir raporu |

İki küçük ek de aldım:

- Adım 08 artık dördüncü bir rolü soruyor: "Alımı kim durdurabilir?" Bu soru Codex'in alım kararı yönteminden geldi.
- Adım 16'daki taahhüt alanına bir uyarı ekledim. Uyarı aynı borcun iki kez yazılmasını önlüyor.

### Fikir 1: Aynı kişi iki kez sayılmaz

Yazılım kişi adlarını karşılaştırır. Büyük harf, küçük harf ve fazla boşluk fark sayılmaz. Türkçe harfler doğru karşılaştırılır.

Örneğin "Ayşe Yılmaz" ile "AYŞE  YILMAZ" aynı kişidir.

Yazılım satırı silmez ve adımı durdurmaz. Yalnız uyarır. Çünkü iki ayrı kişinin adı aynı olabilir.

### Fikir 2 ve 3: Sayılar birbirini tutmalı

Şu altı durumda Adım 15 tamamlanmaz:

1. Deneyen kişi sayısı ulaşılan kişi sayısını geçiyor.
2. Kabul eden kişi sayısı ulaşılan kişi sayısını geçiyor.
3. Fiyatı kabul eden kişi sayısı ulaşılan kişi sayısını geçiyor.
4. Uygun teklif alan talep sayısı geçerli talep sayısını geçiyor.
5. Cevap veren satıcı sayısı kayıtlı satıcı sayısını geçiyor.
6. Yararlanan kişi sayısı katılan kişi sayısını geçiyor.

Bu durumlar imkânsızdır. Bu yüzden yazılım burada uyarmakla kalmaz, adımı durdurur.

### Fikir 4: Aynı görünen yol iki yol sayılmaz

Yazılım iki şeye bakar:

1. İki yolun adı aynı mı?
2. İki yolun müşterisi, kazanma yolu ve para mantığı aynı mı?

Birinci durumda Kapı 5 o yolu bir kez sayar. İkinci durumda yazılım uyarır ve uyarıyı devir raporuna yazar.

Önceki bir notumda "Yazılım iki yolun benzediğini kendisi bulamaz" demiştim. Bu cümle eksikti. Yazılım anlamca benzerliği bulamaz. Ama birebir aynı yazılmış alanları bulabilir. Codex bunu yapıyordu.

### Fikir 5 ve 6: Hangi kayıt kanıt sayılır?

Geçiş kapısının ikinci zorunlu ölçütü sorunun kanıtını arar. Bu ölçüt artık üç kaydı saymaz:

1. Türü "Varsayım" olan kayıt.
2. Yedinci basamaktaki kayıt. Bu basamak kurucu kanaatidir.
3. Tarihi gelecekte olan kayıt.

Kanıt formu da artık gelecek bir tarih seçtirmez.

**Bu bir kural sıkılaşmasıdır.** Eski bir planda yalnız kanaat bağlıysa geçiş önerisi "Henüz hazır değil" olur. Bu doğru sonuçtur.

### Fikir 7: Karşı bulgu gizlenmez

Codex burada daha serttir. Codex'te tek bir karşı bulgu talep kanıtını geçersiz kılar.

Ben uyarıyı seçtim. Geçiş kapısı karşı bulguyu karar sahibinin önüne koyar. Kararı yine karar sahibi verir. Çünkü her girişimde birkaç ret olur. Tek bir ret bütün talebi geçersiz kılmaz.

### Fikir 8: Ayrı görüş kayda geçer

Karar sahibi ayrı görüşü, kimin söylediğini ve hangi iddiaya itiraz ettiğini yazar. Sonra üç durumdan birini seçer: "Kabul edildi", "Ayrı görüş sürüyor" ya da "İnceleme bekliyor".

Devir raporu ayrı görüşleri beşinci bölümde gösterir. Stratej görüş ayrılığını baştan bilir.

## 5. Almadıklarım ve nedenleri

| Codex'teki özellik | Neden almadım? |
|---|---|
| Kullanıcı rolleri, oturum ve inceleme kuyruğu | Sunucu ister. Bu uygulama yalnız tarayıcıda çalışır. |
| Sürüm onayı ve inceleme isteği | Aynı neden. İkinci bir kullanıcı gerekir. |
| Koşullu kararda tek alanın açılması | Codex koşullu izinde yalnız bir alanı açıyor. Bu uygulama bütün strateji çalışmasını açıyor. Değişiklik kilit kuralını değiştirir. Sizin kararınız gerekir. |
| İmzayla geçersizleşme | Codex kararı dayanağın imzasıyla karşılaştırıyor. Bizim eskime kuralı aynı sonucu veriyor. |
| Oranın pay ve payda olarak saklanması | Başarı koşulunda ölçü serbest metindir. Ayrı saklamak formu ağırlaştırır. |
| İddia ile kanıtın aynı grup ve dönemde olması | Kural doğru ama her kanıta iki alan daha ekler. |
| Plan portföyü ve iki planı karşılaştırma | Değerli bir özelliktir ama ayrı bir iştir. 6. bölümde öneriyorum. |
| Devralma kontrolünde durum ve kaynak | Codex "Kayıt var" cevabına kaynak istiyor. Fikir iyi. Küçük bir sonraki iş olabilir. |

## 6. Sonraki iş için iki öneri

Bu iki fikir değerlidir ama bu turun kapsamına sığmadı.

1. **Plan karşılaştırması.** Codex iki planı yan yana gösteriyor. Sizin birden çok iş fikriniz var. İki fikri aynı ölçülerle karşılaştırmak işinize yarar.
2. **Devralma kontrolünde kaynak.** Kullanıcı "kanıt var" derse kaynağını da yazsın. Bugün yalnız evet ya da hayır diyor.

## 7. Bu uygulamanın ileride olduğu yerler

Karşılaştırma tek yönlü kalmasın diye yazıyorum. Şunlar Codex'te yok ya da daha zayıf:

- Yöntem yardımı. 43 yöntemin "Nasıl uygulanır" adımları yalın dille yazılı ve yalnız gerektiğinde iniyor.
- Süreç haritası ve onu koruyan testler. Kilit, eskime ve rol dili tek kaynaktan okunuyor.
- Devir raporundaki altı soruluk ek.
- Başarısız örnekler ve tek kaynağa bağımlılık soruları.

## 8. Kontrol sonuçları

| Kontrol | Sonuç |
|---|---|
| Birim testleri | 249 geçti |
| Yeni bütünlük testleri, tarayıcıda | 30 geçti |
| Tam tarayıcı testi, Chromium ve WebKit | 455 geçti, 20 test ekran boyutu uymadığı için atlandı |
| Tip ve arayüz kapısı | Geçti |

## 9. Sınırlar

- "Değerli" ve "bize uymuyor" ayrımı benim yargımdır.
- Codex'in çalışma klasöründe kaydedilmemiş değişiklikler vardı. Ben o anki dosyaları okudum.
- Codex'in ekranlarını çalıştırıp denemedim. Yalnız kodunu okudum.
- Rapor gerçek okurla denenmedi.
