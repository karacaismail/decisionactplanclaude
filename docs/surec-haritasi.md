# Süreç haritası

Bu belge sürecin tek güncel kaynağıdır. Başka bir belge bu belgeyle çelişirse bu belge geçerlidir.

Bu belge 14 Kasım 2026 Cumartesi günü yazıldı. Son güncelleme 15 Kasım 2026 Pazar günü yapıldı. Kod değişirse bu belge de aynı gün güncellenir.

**Stratej kimdir?** Stratej, stratejiyi geliştiren kişinin unvanıdır. Tanım Erol Mütercimler'e aittir.

**Seçimi kim yapar?** Stratej yolu önerir ve gerekçesini kurar. Karar sahibi seçer ve kaydeder. Tek kurucuda iki rol aynı kişide olabilir.

## 1. Sıra

Yazılım üç ana kümeden oluşur. Kümeler bu sırayla açılır. Sıra hiçbir ekranda değişmez.

| Sıra | Ana küme | Zorunlu alt aşamalar | Küme ne ile biter? | Kararı kim verir? |
|---|---|---|---|---|
| 1 | Strateji öncesi hazırlık | Karar 1 ile Karar 5 arası ve hazırlık kontrolü | Hazırlık kararı kaydedilir. | Karar sahibi |
| 2 | Strateji oluşturma | 2.1, 2.2, 2.3, 2.4 ve 2.5 | Karar sahibi strateji belgesini onaylar. | Karar sahibi. Stratej önerir. |
| 3 | Strateji uygulama | 3.1, 3.2, 3.3, 3.4 ve 3.5 | Çıkış kontrolü yoktur. Bu küme bir döngüdür. | Karar sahibi |

**Ana küme kuralı.** Bir ana küme ancak olmazsa olmaz ise eklenir. Ölçü şudur: incelenen çerçevelerin en az dörtte üçü o aşamayı ayrı bir üst aşama saymalıdır. Bu ölçüyü yalnız iki aşama geçti: oluşturma ve uygulama. Sayım [sonraki-ana-asamalar-plani.md](sonraki-ana-asamalar-plani.md) dosyasındadır.

Değerlendirme ve uygulamaya çevirme ayrı ana küme değildir. İçerikleri alt aşama olarak durur: 3.1, 3.2, 3.3 ve 3.5.

**Numaralı aşamaların dışındaki bölümler.** Proje yönetimi ve destek ve teşvik iki ayrı bölümdür. Bu bölümler sıralı sürecin parçası değildir. Numarası yoktur ve hiçbir kontrolü açıp kapatmaz. Bu bölümler planı yalnız okur. Plana yazacakları şeyi taslak olarak önerirler. Taslağı bir kişi kaydeder. Ayrıntı [modül mimarisindedir](moduller/mimari.md).

**Proje bölümü ile aşamaların bağı.** 2.5 adımındaki her ana hamlenin altında küçük bir proje etiketi durur. 3.2 adımındaki her "Şimdi" işinin altında da aynı etiket durur. Etiket açık ve geciken görevleri sayar. "Strateji uygulama" ekranı projelerin kısa özetini gösterir. Projeden gelen kanıt taslağı 3.5 bölümünde görünür. Kişi taslağı kaydederse kanıt defterine eklenir. Bu bağlar hiçbir kontrolü değiştirmez.

**Destek bölümü ile aşamaların bağı.** Profilde "Dış para" seçildiyse Adım 02 olası desteklere bağlantı verir. 3.3 adımı destek başvurularının sayısını gösterir. Destek parası kesin para sayılmaz. Bu yüzden bağlanan toplam para değişmez.

Süreç dört bölümle yürür. Bölümler kümelere şöyle bağlıdır:

| Bölüm | Ana küme | Adımlar |
|---|---|---|
| Temel | 1. Strateji öncesi hazırlık | Adım 00 ile Adım 18 arası. Karar 1 ile Karar 5 arası. |
| Hazırlık kontrolü | 1. Strateji öncesi hazırlık | Adım yoktur. Teslim raporu okunur. |
| Strateji oluşturma | 2. Strateji oluşturma | 2.1, 2.2, 2.3, 2.4, 2.5 ve strateji belgesi |
| Strateji uygulama | 3. Strateji uygulama | 3.1, 3.2 ve 3.3. Sonra Adım 21 ile Adım 34 arası. Karar 6, 7 ve 8. |

### Strateji oluşturmanın alt aşamaları

| Kod | Alt aşama | Ne yapılır? | Çıkarılırsa ne olur? |
|---|---|---|---|
| 2.1 | Teşhis | Stratej asıl güçlüğü tek cümleyle yazar. | Yolları karşılaştıracak ölçüt olmaz. |
| 2.2 | Seçenekler | Stratej en az iki farklı yol yazar. | Seçim olmaz. Tek seçenek bir onay isteğidir. |
| 2.3 | Sınama | Stratej her yol için koşulları yazar. En zayıf koşulu sınar. | Seçim keyfî kalır. |
| 2.4 | Seçim ve vazgeçiş | Karar sahibi yolu, kazanma hedefini ve sahayı seçer. Neyden vazgeçtiğini yazar. | Ortada strateji olmaz. |
| 2.5 | Ana hamleler ve gerekli yetkinlikler | Stratej az sayıda büyük işi ve gereken beceriyi yazar. | Seçim kâğıtta kalır. |

Alt aşama 2.4 eski Adım 19'dur. Çıkış kontrolü eski Adım 20'dir ve adı "Strateji belgesi"dir.

### Strateji uygulamanın alt aşamaları

| Kod | Alt aşama | Ne yapılır? | Nerede yapılır? |
|---|---|---|---|
| 3.1 | Hedef ve gösterge | Ekip seçimi ölçülebilir hedefe çevirir. | 3.1 adımı |
| 3.2 | Ana işler ve sorumlular | Ekip her işe tek bir sorumlu ve tarih yazar. | 3.2 adımı |
| 3.3 | Kaynak ve bütçe | Karar sahibi parayı ve insanı işlere bağlar. | 3.3 adımı |
| 3.4 | Yürütme, ölçme ve gözden geçirme | Ekip işleri yapar ve sonucu ölçer. | Karar 6 ve Karar 7 |
| 3.5 | Stratejiyi sınama ve yenileme | Karar sahibi "Seçim hâlâ doğru mu?" diye sorar. | "Strateji uygulama" ekranı ve Karar 8 |

Alt aşama 3.1, 3.2 ve 3.3 Karar 6'nın ilk üç adımıdır. Kontrol 6 bu üç adımı okumaz.

Alt aşama 3.5'te karar sahibi üç karardan birini verir:

1. "Sürdür" kararı seçimi değiştirmez.
2. "Düzelt" kararı seçimi değiştirmez. Karar sahibi hedefi ya da işleri günceller.
3. "Yeniden aç" kararı işi strateji oluşturmaya geri götürür.

"Yeniden aç" kararından sonra strateji belgesi taslağa döner ve onay silinir. Kontrol 6, 7 ve 8'in kararları eskir. Uygulama kilitlenmez ve eski seçimle sürer. Karar sahibi strateji belgesini yeniden onaylayınca strateji kapanır. Sonraki bir "Düzelt" kaydı açık stratejiyi kapatmaz.

### Hedef takibi

Hedef takibi isteğe bağlıdır. Karar sahibi "Strateji uygulama" ekranındaki anahtarla açar. Strateji uygulama kilitliyken anahtar görünmez. Hedef takibi bir alt aşama değildir. Hedef takibi olmadan da strateji tamamdır.

Hedef takibi açıkken sıra şöyledir:

1. Ekip 2.5 adımındaki ana hamlelerden en çok 3 hedef yazar.
2. Ekip her hedefe en çok 5 gösterge yazar. Üçten çok göstergede uyarı çıkar.
3. Ekip her hafta göstergelerin bugünkü sayısını yazar.
4. Dönem 3 ay sonra kapanır. Ekip ne öğrendiğini yazar.
5. Karar sahibi 3.5 alt aşamasında "Seçim hâlâ doğru mu?" sorusunu cevaplar. Yazılım bu kararı vermez.

Hiçbir kontrol hedef takibi kaydını okumaz. Anahtar hiçbir kararı eskitmez.

Stratejisi eski sürümde tamamlanan plan bir izin alır. Strateji uygulama bu planda kilitlenmez. "Yeniden aç" kararı bu izni kaldırır.

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
| Karar 2, 3, 4 ve 5 | Bir önceki kontrol geçilince açılır. | Önceki kontrol |
| Hazırlık kontrolü | Her zaman okunur. Öneri, ölçütler doldukça değişir. | Kilit yoktur. |
| Strateji oluşturma | Hazırlık kararı "Planlamaya hazır" ya da "Koşullu hazır" olunca açılır. | Hazırlık kontrolü |
| Karar 6 | Hazırlık kararı geçerliyse ve strateji oluşturma bittiyse açılır. | Hazırlık kontrolü ya da strateji oluşturma |
| Karar 7 ve 8 | Karar 6 açıksa ve bir önceki kontrol geçildiyse açılır. | Hazırlık kontrolü, strateji oluşturma ya da önceki kontrol |

Strateji oluşturma altı koşul dolunca biter:

1. Stratej teşhisi ve dayanağını yazar.
2. Masada en az iki farklı yol vardır.
3. En az iki yol sınanmıştır. Her yolun koşulları ve en zayıf koşulu yazılıdır.
4. Karar sahibi yolu, gerekçeyi ve vazgeçilenleri yazar.
5. Stratej ana hamleleri ve gereken yetkinlikleri yazar.
6. Karar sahibi strateji belgesinde beş kalite maddesini işaretler ve belgeyi onaylar.

Strateji adımları hazırlık kararı olmadan doldurulmaz. Strateji uygulama adımları kendi kararı kilitliyken doldurulmaz. Örneğin Karar 6 kilitliyse 3.1 ve Adım 21 doldurulmaz.

Strateji öncesi adımlar kilitlenmez. Kullanıcı hazırlıkta istediği adıma dönebilir. Yalnız o kararın kontrolü önceki kontrolü bekler.

Kilitli bir uygulama kontrolünde "İlerle" kaydedilmez.

"Koşullu hazır" kararının son tarihi vardır. Son tarih geçerse strateji oluşturma ve uygulama yeniden kilitlenir.

## 3. Eskime kuralları

Bir veri değişirse o veriye dayanan kararlar eskir. Eskiyen karar yeniden inceleme ister.

| Ne değişti? | Ne eskir? | Ne eskimez? |
|---|---|---|
| Profil ya da sınırlar | Bütün kontrol kararları ve hazırlık kararı | Hiçbir şey |
| Temel adımı, örneğin Adım 09 | O adımın kontrolü, sonraki kontroller ve hazırlık kararı | Önceki kontroller |
| Bir temel adımına bağlı kanıt silindi | O adımın kontrolü, sonraki kontroller ve hazırlık kararı | Önceki kontroller |
| Bir temel kontrolü yeniden karara bağlandı | Sonraki kontroller ve hazırlık kararı | O kontrol ve önceki kontroller |
| Bir strateji oluşturma adımı, örneğin 2.4 | Kontrol 6, 7 ve 8 | Temel kontrolleri ve hazırlık kararı |
| Bir uygulama planı adımı, örneğin 3.2 | Hiçbir karar | Bütün kontrol kararları ve hazırlık kararı |
| Karar sahibi stratejiyi yeniden açtı | Kontrol 6, 7 ve 8 | Temel kontrolleri ve hazırlık kararı |
| Bir uygulama adımı, örneğin Adım 24 | O adımın kontrolü ve sonraki kontroller | Temel kontrolleri ve hazırlık kararı |

Uygulama planı adımlarını (3.1, 3.2 ve 3.3) hiçbir kontrol okumaz. Bu yüzden bu adımlar değişince hiçbir karar eskimez. Örneğin bir sorumlunun adını düzeltmek Karar 7'yi kilitlemez. Bu kural kullanıcının 15 Kasım 2026 Pazar günü verdiği karardır. Bir kontrol ileride bu adımları okursa kural testte kırılır.

Bir örnek verelim. Karar sahibi Adım 18'e yeni bir yol adayı ekler. Kontrol 5 ve hazırlık kararı eskir. Karar sahibi ikisini yeniden kaydeder.

## 4. Hazırlık kontrolünün ölçütleri

Hazırlık kontrolü tek soruya bakar: "Dayanak yeterli mi?" Ölçütler yalnız temel adımlarını okur.

Zorunlu ölçüt sayısı 9'dur. Destekleyici ölçüt sayısı 7'dir.

| Öneri | Koşul |
|---|---|
| Planlamaya hazır | 9 zorunlu ölçüt tamam. En az 4 destekleyici ölçüt tamam. |
| Koşullu hazır | 9 zorunlu ölçüt tamam. Destekleyici ölçütlerin 4'ten azı tamam. |
| Henüz hazır değil | En az bir zorunlu ölçüt eksik. |

Yazılım yalnız öneri üretir. Kararı karar sahibi kaydeder. Karar sahibi önce "Strateje teslim raporunu okudum" kutusunu işaretler.

Ölçütlerin tam listesi `src/engine/readiness.ts` dosyasındadır.

## 5. İki belge, iki ayrı an

| Belge | Ne zaman okunur? | İçinde ne var? | İçinde ne yok? |
|---|---|---|---|
| Strateje teslim raporu | Seçimden önce | Karar sorusu, dayanaklar, sınırlar, yol adayları, eksik bilgi | Seçilen yol |
| Strateji belgesi | Seçimden sonra | Teşhis, seçilen yol, gerekçe, vazgeçilenler, ana hamleler | Yeni kanıt |

Teslim raporu strateji oluşturma adımlarını okumaz. Yönetici raporu ve aksiyon planı seçimi 2.4 adımından okur. Aksiyon planı 90 günlük işleri 3.2 adımından okur.

## 6. Karar Kitabı'ndan gelen üç yardım

Bu üç yardım süreci değiştirmez. Adım sayısı, kilitler ve hazırlık kontrolünün ölçütleri aynı kalır.

| Yardım | Nerede? | Yazılım ne yapar? | Kullanıcı ne yapar? |
|---|---|---|---|
| Güç süzgeci | Adım 12 | Dört cevaptan sonucu hesaplar. | Her güç için dört soruyu cevaplar. |
| Durum özeti | Adım 18 | Dört listeyi önceki adımlardan toplar. | Dört çapraz soruyu cevaplar. |
| Yöntem yardımı | Yöntem paneli | "Nasıl uygulanır" adımlarını gösterir. | Yöntemi ekrandan çıkmadan uygular. |

Güç süzgecinin iki kuralı vardır:

1. Kullanıcı bir güce "rakiplerin çoğunda yok" derse dayanak yazar. Dayanak yoksa Adım 12 tamamlanmaz.
2. Ağır yatırımda kullanıcı en az bir güç yazar. Küçük ve geri alınabilir işte güç yazmak zorunlu değildir.

Durum özeti yalnız Adım 00 ile Adım 18 arasını okur. Çapraz sorular isteğe bağlıdır. Kontrol 5'in ölçütü değişmez.

Planın tamamı [karar-kitabi-firsatlari-plani.md](karar-kitabi-firsatlari-plani.md) dosyasındadır.

### Teslim raporunu güçlendiren kayıtlar

Bu kayıtlar isteğe bağlıdır. Hiçbiri hazırlık kontrolünün ölçütü değildir.

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
| Bölümü bir kontrol ya da hazırlık kontrolü okuyorsa zorunludur. | |
| Bölümü bir tamamlama denetimi okuyorsa zorunludur. | |

Ekran bu kuralı şöyle gösterir:

1. Boş isteğe bağlı bölüm kapalı gelir. Kullanıcı bölümü "Aç" düğmesiyle açar.
2. Dolu isteğe bağlı bölüm açık gelir.
3. Bir adımda üç ve daha çok isteğe bağlı bölüm varsa form iki sekmeye ayrılır.
4. Birinci sekmenin adı "Zorunlu bölümler"dir. İkinci sekmenin adı "İsteğe bağlı bölümler"dir.

İsteğe bağlı bölümü boş bırakan kullanıcı adımı tamamlar. Hiçbir kontrol bu kullanıcıyı durdurmaz.

Bölümü yalnız kullanıcı kapatır. Kullanıcı bir alanı boşaltınca bölüm kendiliğinden kapanmaz. Sekme seçimi sonraki adıma taşınmaz. Doluluk yüzdesi yalnız zorunlu bölümlerden hesaplanır.

Strateji öncesi adımlarda 76 bölüm vardır. Bu bölümlerin 31'i isteğe bağlıdır.

### Kısa yol

Kısa yol plan özetindeki "En kısa yol" anahtarıyla açılır. Kısa yol tek adımı gizler: Adım 04.

Adım 03 ekipte kısa yolda da görünür. Çünkü Kontrol 1 ekipte karar haklarını Adım 03'ten okur. Tek kurucuda Adım 03 zaten görünmez.

Adım 17 kısa yolda görünür. Çünkü Kontrol 5 risk tablosunu Adım 17'den okur. Adım 17 kısa yolda üç bölüm taşır:

1. Ön ölüm listesi
2. Risk tablosu
3. Tek kaynağa bağımlılık

Kural şudur: bir kontrol, kısa yolda gizlenen bir adımı okuyamaz. Teslim raporu kısa yolda gizlenen boş adımı "Bakılmayan alanlar" başlığında gösterir. Adım daha önce doldurulduysa bakılmış sayılır.

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

### Okunamayan kayıt

Kayıt okunamazsa yazılım iki şey yapar:

1. Yazılım ekranda "Kayıtlı planlar okunamadı." uyarısını gösterir.
2. Yazılım depoya hiçbir şey yazmaz. Okunamayan kayıt boş durumla ezilmez.

Kullanıcı sayfayı yenileyince yazılım kaydı yeniden okumayı dener.

### Veri bütünlüğü kuralları

Yazılım birbirini tutmayan kayıtları yakalar. Yorum yapmaz.

| Kural | Nerede? | Yazılım ne yapar? |
|---|---|---|
| Aynı kişi iki kez sayılmaz. | Adım 06 ve Adım 15 | Uyarır. Adımı durdurmaz. |
| Sayılar birbirini tutmalı. | Adım 15 | Adımı tamamlatmaz. |
| Aynı adı taşıyan yol bir kez sayılır. | Adım 18 ve Kontrol 5 | Kontrol 5 yolu bir kez sayar. |
| Aynı görünen iki yol uyarı verir. | Adım 18 ve teslim raporu | Uyarır ve rapora yazar. |
| Varsayım ve kurucu kanaati sorunun kanıtı sayılmaz. | Hazırlık kontrolü, Z2 | Ölçütü karşılanmış saymaz. |
| Gelecek tarihli kayıt kanıt sayılmaz. | Hazırlık kontrolü ve kanıt formu | Kaydı saymaz ve uyarır. |
| Talep kanıtındaki karşı bulgu gizlenmez. | Hazırlık kontrolü | Uyarır. Kararı karar sahibi verir. |

Kuralların kaynağı [codex-uygulamasi-karsilastirma-raporu.md](codex-uygulamasi-karsilastirma-raporu.md) dosyasındadır.

## 7. Yazılım neyi yapmaz?

- Yazılım yol seçmez. Stratej yolu önerir ve gerekçesini kurar. Karar sahibi seçer ve kaydeder.
- Yazılım teşhis koymaz, yol elemez ve hamle önermez. Öneri kartı yalnız sizin önceki cevabınızı taşır.
- Yazılım "Seçim hâlâ doğru mu?" sorusunu cevaplamaz. Cevabı karar sahibi kaydeder.
- Yazılım yol önermez. Durum özeti yalnız listeyi toplar ve soruyu sorar.
- Yazılım bir gücün gerçek olup olmadığına karar vermez. Dört soruyu kullanıcı cevaplar.
- Yazılım hazırlık kararını vermez. Yazılım yalnız öneri üretir.
- Yazılım eksik bilgiyi uydurmaz. Eksik alan raporda "Henüz yazılmadı." diye görünür.
- Yazılım kanıtın doğru olduğunu denetlemez. Kanıtı karar sahibi girer.
- Yazılım bilinmeyen sorunu tahmin etmez. Yalnız hangi adıma bakılmadığını gösterir.
- Yazılım yedeği kendisi almaz. Yalnız yedeğin eskidiğini hatırlatır.

## 8. Kaynak plandan farklar

Kaynak plan [act_plan_v5_final-claude.md](act_plan_v5_final-claude.md) dosyasıdır. Uygulama altı yerde kaynak plandan ayrılır.

| Konu | Kaynak planda | Uygulamada | Neden? |
|---|---|---|---|
| Adım 18'in adı | "Saha ve kazanma yolu" | "Yol adayları" | Seçim strateji oluşturmaya bırakıldı. |
| Seçilen yol | Adım 18'de yazılır. | 2.4 adımında yazılır. | Seçim hazırlık kontrolünden sonra yapılır. |
| Karar 5'in adımları | 16, 17, 18, 19 ve 20 | 16, 17 ve 18 | Adım 19 ve 20 strateji oluşturmaya taşındı. |
| Hedefler ve 90 günlük işler | Adım 19'da yazılır. | 3.1 ve 3.2 adımlarında yazılır. | Hedef ve iş, seçimin değil uygulamanın parçasıdır. |
| Teşhis, seçenekler ve sınama | Ayrı adım yoktur. | 2.1, 2.2 ve 2.3 adımlarıdır. | Seçime nasıl varıldığı kayda geçer. |
| Hazırlık kontrolü | Yoktur. | Karar 5 ile strateji oluşturma arasındadır. | Dayanak, seçimden önce incelenir. |

## 9. Kurallar kodda nerede?

Her kuralın tek bir kaynağı vardır. Ekranlar kuralı yeniden yazmaz, kaynaktan okur.

| Kural | Dosya |
|---|---|
| Kararlar, adımlar ve kontrol ölçütleri | `src/data/decisions.ts` |
| Üç ana küme ve zorunlu alt aşamalar | `src/data/clusters.ts` |
| Dört bölüm | `src/data/stages.ts` |
| Strateji oluşturma ve uygulama adımlarının denetimleri | `src/engine/strategy.ts` |
| Stratejiyi sınama ve yenileme | `src/engine/renewal.ts` |
| Hazırlık kararının geçerliliği | `src/engine/transition.ts` |
| Kilit, kilidin nedeni ve gidilecek yer | `src/engine/gate.ts` |
| Planın yoldaki yeri | `src/engine/position.ts` |
| Eskime | `src/engine/changes.ts` |
| Hazırlık kontrolünün ölçütleri ve önerisi | `src/engine/readiness.ts` |
| Güç süzgeci | `src/engine/strengths.ts` |
| Durum özeti ve çapraz sorular | `src/engine/situation.ts` |
| Asıl engel, başarı koşulları, serbest bütçe | `src/engine/crux.ts` |
| Veri bütünlüğü denetimleri | `src/engine/integrity.ts` |
| Bakılmayan alanlar ve varsayım oranı | `src/engine/blindspots.ts` |
| Yedek durumu | `src/engine/backup.ts` |
| Bölümün görünmesi, zorunlu alanlar ve sekmeler | `src/components/FormRenderer.tsx` |
| Yöntem yardımı verisi | `src/data/models-howto.json` |
| Teslim raporu | `src/reports/handoff.ts` |

Bu belgedeki kuralları `src/engine/consistency.test.ts` dosyası sınar. Test şunlara bakar:

- Her adım tek bir bölüme bağlı mı?
- Bir kontrol, sonraki bir bölümün adımını okuyor mu?
- Hazırlık kontrolü ve teslim raporu yalnız temel adımlarını mı okuyor?
- Kilitler ve eskime bu belgedeki sırayı izliyor mu?
- Güncel metinlerde eski süreçten kalan ifade var mı?
- İsteğe bağlı bir bölüm, bir kuralın istediği alanı taşıyor mu?
- Bir kontrol, kısa yolda gizlenen bir adımı okuyor mu?
- Alan sayısı bütçeyi aşıyor mu?

Ana kümeleri `src/data/clusters.test.ts` dosyası sınar. Test şunlara bakar:

- Üç ana küme var mı? Her bölüm tek bir kümeye bağlı mı?
- Her alt aşama en az üç bağımsız çerçeveye dayanıyor mu?
- Her alt aşamanın adımı kendi kümesinde mi?
- "Yeniden aç" kararı uygulamayı kilitliyor mu? Kilitlememelidir.

## Denetim notu

Bu belge yalın Türkçe denetim betiğinden geçirildi. Tablo hücreleri kısa tutuldu. Gerçek okurla denenmedi.
