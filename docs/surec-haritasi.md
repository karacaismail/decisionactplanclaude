# Süreç haritası

Bu belge sürecin tek güncel kaynağıdır. Başka bir belge bu belgeyle çelişirse bu belge geçerlidir.

Bu belge 14 Kasım 2026 Cumartesi günü yazıldı. Kod değişirse bu belge de aynı gün güncellenir.

**Stratej kimdir?** Stratej, stratejiyi geliştiren kişinin unvanıdır. Tanım Erol Mütercimler'e aittir.

**Seçimi kim yapar?** Stratej yolu önerir ve gerekçesini kurar. Karar sahibi seçer ve kaydeder. Tek kurucuda iki rol aynı kişide olabilir.

## 1. Sıra

Yol dört bölümdür. Bölümler bu sırayla açılır. Sıra hiçbir ekranda değişmez.

| Sıra | Bölüm | Adımlar | Bölüm ne ile biter? | Kararı kim verir? |
|---|---|---|---|---|
| 1 | Temel | Adım 00 ile Adım 18 arası. Karar 1 ile Karar 5 arası. | Kapı 5 geçilir. | Karar sahibi |
| 2 | Geçiş kapısı | Adım yoktur. Devir raporu okunur. | Geçiş kararı kaydedilir. | Karar sahibi |
| 3 | Strateji çalışması | Adım 19 ve Adım 20 | Yol seçilir. Strateji karar dosyası tamamlanır. | Karar sahibi. Stratej önerir. |
| 4 | Uygulama | Adım 21 ile Adım 34 arası. Karar 6, 7 ve 8. | Kapı 8 geçilir. | Karar sahibi |

Temel bölümündeki kararlar şunlardır:

| Karar | Ad | Adımlar |
|---|---|---|
| Karar 1 | Yetki | 00, 01, 02, 03, 04 |
| Karar 2 | Sorun | 05, 06, 07, 08 |
| Karar 3 | Erişim ve seçenek | 09, 10, 11, 12 |
| Karar 4 | Taahhüt | 13, 14, 15 |
| Karar 5 | Para, risk ve yollar | 16, 17, 18 |

Adım 18'in adı "Yol adayları"dır. Bu adımda yol seçilmez. Yollar yalnız yan yana yazılır.

## 2. Kilit kuralları

Kilitli bölüm okunur ama doldurulmaz. Ekran kilidin nedenini ve gidilecek yeri yazar.

| Bölüm | Ne zaman açılır? | Kilitliyken düğme nereye götürür? |
|---|---|---|
| Karar 1 | Her zaman açıktır. | Kilit yoktur. |
| Karar 2, 3, 4 ve 5 | Bir önceki kapı geçilince açılır. | Önceki kapı |
| Geçiş kapısı | Her zaman okunur. Öneri, ölçütler doldukça değişir. | Kilit yoktur. |
| Strateji çalışması | Geçiş kararı "Planlamaya hazır" ya da "Koşullu hazır" olunca açılır. | Geçiş kapısı |
| Karar 6 | Geçiş kararı geçerliyse ve strateji çalışması bittiyse açılır. | Geçiş kapısı ya da strateji çalışması |
| Karar 7 ve 8 | Karar 6 açıksa ve bir önceki kapı geçildiyse açılır. | Geçiş kapısı, strateji çalışması ya da önceki kapı |

Strateji çalışması üç koşul dolunca biter:

1. Karar sahibi Adım 19'da yolu, gerekçeyi ve vazgeçilenleri yazar.
2. Karar sahibi Adım 19'u tamamlar. Böylece 90 günlük yol yazılmış olur.
3. Karar sahibi Adım 20'de beş kalite maddesini işaretler.

"Koşullu hazır" kararının son tarihi vardır. Son tarih geçerse strateji çalışması ve uygulama yeniden kilitlenir.

## 3. Eskime kuralları

Bir veri değişirse o veriye dayanan kararlar eskir. Eskiyen karar yeniden inceleme ister.

| Ne değişti? | Ne eskir? | Ne eskimez? |
|---|---|---|
| Profil ya da sınırlar | Bütün kapı kararları ve geçiş kararı | Hiçbir şey |
| Temel adımı, örneğin Adım 09 | O adımın kapısı, sonraki kapılar ve geçiş kararı | Önceki kapılar |
| Bir temel adımına bağlı kanıt silindi | O adımın kapısı, sonraki kapılar ve geçiş kararı | Önceki kapılar |
| Bir temel kapısı yeniden karara bağlandı | Sonraki kapılar ve geçiş kararı | O kapı ve önceki kapılar |
| Adım 19 ya da Adım 20 | Kapı 6, 7 ve 8 | Temel kapıları ve geçiş kararı |
| Bir uygulama adımı, örneğin Adım 24 | O adımın kapısı ve sonraki kapılar | Temel kapıları ve geçiş kararı |

Bir örnek verelim. Karar sahibi Adım 18'e yeni bir yol adayı ekler. Kapı 5 ve geçiş kararı eskir. Karar sahibi ikisini yeniden kaydeder.

## 4. Geçiş kapısının ölçütleri

Geçiş kapısı tek soruya bakar: "Dayanak yeterli mi?" Ölçütler yalnız temel adımlarını okur.

Zorunlu ölçüt sayısı 9'dur. Destekleyici ölçüt sayısı 7'dir.

| Öneri | Koşul |
|---|---|
| Planlamaya hazır | 9 zorunlu ölçüt tamam. En az 4 destekleyici ölçüt tamam. |
| Koşullu hazır | 9 zorunlu ölçüt tamam. Destekleyici ölçütlerin 4'ten azı tamam. |
| Henüz hazır değil | En az bir zorunlu ölçüt eksik. |

Yazılım yalnız öneri üretir. Kararı karar sahibi kaydeder. Karar sahibi önce "Strateje devir raporunu okudum" kutusunu işaretler.

Ölçütlerin tam listesi `src/engine/readiness.ts` dosyasındadır.

## 5. İki belge, iki ayrı an

| Belge | Ne zaman okunur? | İçinde ne var? | İçinde ne yok? |
|---|---|---|---|
| Strateje devir raporu | Seçimden önce | Karar sorusu, dayanaklar, sınırlar, yol adayları, eksik bilgi | Seçilen yol |
| Strateji karar dosyası | Seçimden sonra | Seçilen yol, gerekçe, vazgeçilenler, 90 günlük yol | Yeni kanıt |

Devir raporu Adım 19 ve Adım 20'yi okumaz. Yönetici raporu ve aksiyon planı seçimi Adım 19'dan okur.

## 6. Karar Kitabı'ndan gelen üç yardım

Bu üç yardım süreci değiştirmez. Adım sayısı, kilitler ve geçiş kapısının ölçütleri aynı kalır.

| Yardım | Nerede? | Yazılım ne yapar? | Kullanıcı ne yapar? |
|---|---|---|---|
| Güç süzgeci | Adım 12 | Dört cevaptan sonucu hesaplar. | Her güç için dört soruyu cevaplar. |
| Durum özeti | Adım 18 | Dört listeyi önceki adımlardan toplar. | Dört çapraz soruyu cevaplar. |
| Yöntem yardımı | Yöntem paneli | "Nasıl uygulanır" adımlarını gösterir. | Yöntemi ekrandan çıkmadan uygular. |

Güç süzgecinin iki kuralı vardır:

1. Kullanıcı bir güce "rakiplerin çoğunda yok" derse dayanak yazar. Dayanak yoksa Adım 12 tamamlanmaz.
2. Ağır yatırımda kullanıcı en az bir güç yazar. Küçük ve geri alınabilir işte güç yazmak zorunlu değildir.

Durum özeti yalnız Adım 00 ile Adım 18 arasını okur. Çapraz sorular isteğe bağlıdır. Kapı 5'in ölçütü değişmez.

Planın tamamı [karar-kitabi-firsatlari-plani.md](karar-kitabi-firsatlari-plani.md) dosyasındadır.

### Devir raporunu güçlendiren kayıtlar

Bu kayıtlar isteğe bağlıdır. Hiçbiri geçiş kapısının ölçütü değildir.

| Kayıt | Nerede yazılır? | Raporda nerede görünür? |
|---|---|---|
| Asıl engel | Adım 18 | 1. bölüm, karar sorusunun altı |
| Başarı koşulları | Adım 18 | 1. bölüm, karar sorusunun altı |
| Yol bağları ve çelişkiler | Adım 18 | 4. bölüm |
| Serbest bütçe | Adım 16 | 3. bölüm |
| Darboğaz | Adım 12 | 3. bölüm |
| İş türüne özgü bilgi | Adım 12 ve Adım 15 | 2. bölüm |
| Yolun para mantığı, kurma yolu ve kanıt türü | Adım 18 | 4. bölüm |
| Bu işi deneyip bırakanlar | Adım 09 | 2. bölüm |
| Tek kaynağa bağımlılık | Adım 17 | 3. bölüm |
| Ayrı görüş | Adım 17 | 5. bölüm |
| Alımı durdurabilen kişi | Adım 08 | 2. bölüm |
| Üç yıllık beklenti | Adım 02 | 3. bölüm |
| Altı sorunun cevabı | Yazılım plandan bulur. | Ek 3 |
| Belirsizliğin seviyesi | Adım 04 | 5. bölüm |
| En kötü durum | Adım 17 | 3. bölüm, sınırlar |
| İşi etkileyen kişiler | Adım 17 | 3. bölüm |
| Varsayımın bilgiye oranı | Yazılım cümlelerden sayar. | 2. bölüm |
| Bakılmayan alanlar | Yazılım atlanan, boş ve gizli adımları bulur. | Ek 1 |

Kuralların tamamı iki belgededir: [codex-onerileri-uygulama-notu.md](codex-onerileri-uygulama-notu.md) ve [arastirma-analizi-ve-strateji-oncesi-ekleme-raporu.md](arastirma-analizi-ve-strateji-oncesi-ekleme-raporu.md).

### Zorunlu bölüm ve isteğe bağlı bölüm

Her adım bölümlerden oluşur. Bölüm ya zorunludur ya isteğe bağlıdır. Kural tektir.

| Bölüm ne zaman zorunludur? | Bölüm ne zaman isteğe bağlıdır? |
|---|---|
| Bölüm adımı tamamlayan bir alan taşıyorsa zorunludur. | Bölümü hiçbir kural okumuyorsa bölüm isteğe bağlıdır. |
| Bölümü bir kapı ya da geçiş kapısı okuyorsa zorunludur. | |
| Bölümü bir tamamlama denetimi okuyorsa zorunludur. | |

Ekran bu kuralı şöyle gösterir:

1. Boş isteğe bağlı bölüm kapalı gelir. Kullanıcı bölümü "Aç" düğmesiyle açar.
2. Dolu isteğe bağlı bölüm açık gelir.
3. Bir adımda üç ve daha çok isteğe bağlı bölüm varsa form iki sekmeye ayrılır.
4. Birinci sekmenin adı "Zorunlu bölümler"dir. İkinci sekmenin adı "İsteğe bağlı bölümler"dir.

İsteğe bağlı bölümü boş bırakan kullanıcı adımı tamamlar. Hiçbir kapı bu kullanıcıyı durdurmaz.

Bölümü yalnız kullanıcı kapatır. Kullanıcı bir alanı boşaltınca bölüm kendiliğinden kapanmaz. Sekme seçimi sonraki adıma taşınmaz. Doluluk yüzdesi yalnız zorunlu bölümlerden hesaplanır.

Strateji öncesi adımlarda 76 bölüm vardır. Bu bölümlerin 31'i isteğe bağlıdır.

### Kısa yol

Kısa yol plan özetindeki "En kısa yol" anahtarıyla açılır. Kısa yol tek adımı gizler: Adım 04.

Adım 03 ekipte kısa yolda da görünür. Çünkü Kapı 1 ekipte karar haklarını Adım 03'ten okur. Tek kurucuda Adım 03 zaten görünmez.

Adım 17 kısa yolda görünür. Çünkü Kapı 5 risk tablosunu Adım 17'den okur. Adım 17 kısa yolda üç bölüm taşır:

1. Ön ölüm listesi
2. Risk tablosu
3. Tek kaynağa bağımlılık

Kural şudur: bir kapı, kısa yolda gizlenen bir adımı okuyamaz. Devir raporu kısa yolda gizlenen boş adımı "Bakılmayan alanlar" başlığında gösterir. Adım daha önce doldurulduysa bakılmış sayılır.

### Alan bütçesi

Form kendiliğinden büyümesin diye testlerde bir alan bütçesi vardır.

- Strateji öncesi adımlarda en çok 240 alan olur.
- Açık gelen bölümlerde en çok 149 alan olur.

Yeni alan eklemek testi kırar. Bütçeyi yükseltme kararını karar sahibi verir.

### Yedek uyarısı

Plan yalnız kullanıcının tarayıcısında durur. Yazılım yedeği kendisi alamaz.

Plan özeti iki durumda "Yedek alın" uyarısı verir:

1. Planın yedeği hiç alınmadıysa uyarı verir.
2. Son yedek 7 günden eskiyse uyarı verir.

Örnek plan ve boş plan uyarı vermez. Kullanıcı planı JSON olarak indirince yazılım yedek tarihini kaydeder.

### Veri bütünlüğü kuralları

Yazılım birbirini tutmayan kayıtları yakalar. Yorum yapmaz.

| Kural | Nerede? | Yazılım ne yapar? |
|---|---|---|
| Aynı kişi iki kez sayılmaz. | Adım 06 ve Adım 15 | Uyarır. Adımı durdurmaz. |
| Sayılar birbirini tutmalı. | Adım 15 | Adımı tamamlatmaz. |
| Aynı adı taşıyan yol bir kez sayılır. | Adım 18 ve Kapı 5 | Kapı 5 yolu bir kez sayar. |
| Aynı görünen iki yol uyarı verir. | Adım 18 ve devir raporu | Uyarır ve rapora yazar. |
| Varsayım ve kurucu kanaati sorunun kanıtı sayılmaz. | Geçiş kapısı, Z2 | Ölçütü karşılanmış saymaz. |
| Gelecek tarihli kayıt kanıt sayılmaz. | Geçiş kapısı ve kanıt formu | Kaydı saymaz ve uyarır. |
| Talep kanıtındaki karşı bulgu gizlenmez. | Geçiş kapısı | Uyarır. Kararı karar sahibi verir. |

Kuralların kaynağı [codex-uygulamasi-karsilastirma-raporu.md](codex-uygulamasi-karsilastirma-raporu.md) dosyasındadır.

## 7. Yazılım neyi yapmaz?

- Yazılım yol seçmez. Stratej yolu önerir ve gerekçesini kurar. Karar sahibi seçer ve kaydeder.
- Yazılım yol önermez. Durum özeti yalnız listeyi toplar ve soruyu sorar.
- Yazılım bir gücün gerçek olup olmadığına karar vermez. Dört soruyu kullanıcı cevaplar.
- Yazılım geçiş kararını vermez. Yazılım yalnız öneri üretir.
- Yazılım eksik bilgiyi uydurmaz. Eksik alan raporda "Henüz yazılmadı." diye görünür.
- Yazılım kanıtın doğru olduğunu denetlemez. Kanıtı karar sahibi girer.
- Yazılım bilinmeyen sorunu tahmin etmez. Yalnız hangi adıma bakılmadığını gösterir.
- Yazılım yedeği kendisi almaz. Yalnız yedeğin eskidiğini hatırlatır.

## 8. Kaynak plandan farklar

Kaynak plan [act_plan_v5_final-claude.md](act_plan_v5_final-claude.md) dosyasıdır. Uygulama dört yerde kaynak plandan ayrılır.

| Konu | Kaynak planda | Uygulamada | Neden? |
|---|---|---|---|
| Adım 18'in adı | "Saha ve kazanma yolu" | "Yol adayları" | Seçim strateji çalışmasına bırakıldı. |
| Seçilen yol | Adım 18'de yazılır. | Adım 19'da yazılır. | Seçim geçiş kapısından sonra yapılır. |
| Karar 5'in adımları | 16, 17, 18, 19 ve 20 | 16, 17 ve 18 | Adım 19 ve 20 strateji çalışmasına taşındı. |
| Geçiş kapısı | Yoktur. | Karar 5 ile strateji çalışması arasındadır. | Dayanak, seçimden önce incelenir. |

## 9. Kurallar kodda nerede?

Her kuralın tek bir kaynağı vardır. Ekranlar kuralı yeniden yazmaz, kaynaktan okur.

| Kural | Dosya |
|---|---|
| Kararlar, adımlar ve kapı ölçütleri | `src/data/decisions.ts` |
| Dört bölüm | `src/data/stages.ts` |
| Geçiş kararının geçerliliği | `src/engine/transition.ts` |
| Kilit, kilidin nedeni ve gidilecek yer | `src/engine/gate.ts` |
| Planın yoldaki yeri | `src/engine/position.ts` |
| Eskime | `src/engine/changes.ts` |
| Geçiş kapısının ölçütleri ve önerisi | `src/engine/readiness.ts` |
| Güç süzgeci | `src/engine/strengths.ts` |
| Durum özeti ve çapraz sorular | `src/engine/situation.ts` |
| Asıl engel, başarı koşulları, serbest bütçe | `src/engine/crux.ts` |
| Veri bütünlüğü denetimleri | `src/engine/integrity.ts` |
| Bakılmayan alanlar ve varsayım oranı | `src/engine/blindspots.ts` |
| Yedek durumu | `src/engine/backup.ts` |
| Bölümün görünmesi, zorunlu alanlar ve sekmeler | `src/components/FormRenderer.tsx` |
| Yöntem yardımı verisi | `src/data/models-howto.json` |
| Devir raporu | `src/reports/handoff.ts` |

Bu belgedeki kuralları `src/engine/consistency.test.ts` dosyası sınar. Test şunlara bakar:

- Her adım tek bir bölüme bağlı mı?
- Bir kapı, sonraki bir bölümün adımını okuyor mu?
- Geçiş kapısı ve devir raporu yalnız temel adımlarını mı okuyor?
- Kilitler ve eskime bu belgedeki sırayı izliyor mu?
- Güncel metinlerde eski süreçten kalan ifade var mı?
- İsteğe bağlı bir bölüm, bir kuralın istediği alanı taşıyor mu?
- Bir kapı, kısa yolda gizlenen bir adımı okuyor mu?
- Alan sayısı bütçeyi aşıyor mu?

## Denetim notu

Bu belge yalın Türkçe denetim betiğinden geçirildi. Tablo hücreleri kısa tutuldu. Gerçek okurla denenmedi.
