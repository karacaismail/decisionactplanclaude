# Yazılımı hizmetle satın, yetkiyi üç katmanda kurun

Bu raporu Claude 15 Kasım 2026 Pazar günü yazdı. Rapor üç soruya cevap verir:

1. Strateji yazılımı tek başına yeter mi?
2. Hangi roller ürünü ne sıklıkla kullanmalı?
3. Yetki Frappe 16 üzerinde nasıl kurulmalı?

## Kısa cevap

**Yazılım tek başına yetmez.** İlk müşteriniz aile kökenli orta ölçekli şirkettir. Bu şirkette çoğu zaman iç stratej yoktur. Stratej yoksa plan strateji oluşturma kümesine geçemez. Bu yüzden ilk karar döngüsünü bir insan yürütmeli. Bu insan sizin ekibinizden ya da sertifikalı bir iş ortağı danışmandır.

**Teklifiniz üç parçalı olmalı.** Birinci parça ürün aboneliğidir. İkinci parça sabit kapsamlı bir başlangıç paketidir. Bu paket tek kararlı ve yaklaşık 8 haftalık bir pilottur (hipotez). Üçüncü parça danışmanlar için iş ortağı programıdır. Toplantı yürütme işini çoğunlukla iş ortakları yapmalı. Sizin hizmet geliriniz küçük kalmalı.

**Dört rol düzenli çalışmalı.** Karar sahibi her hafta inceleme kuyruğuna bakar. Karar sahibi her ay uygulama kararını kaydeder. Karar sahibi üç ayda bir "Seçim hâlâ doğru mu?" sorusunu cevaplar. Stratej hazırlık ve oluşturma boyunca her hafta yazar. Ekip üyeleri her hafta gözlem ve harcama girer. Tek kurucu ikinci görüş için plana bir danışman ekler. Bu sıklıklar bizim önerimizdir. Kaynaklarda ölçülmüş bir sıklık bulunmadı.

**Yetkiyi üç katmanda kurun.** Birinci katman, Frappe'nin site düzeyindeki az sayıda rolüdür. İkinci katman, plan üyeliğine dayanan ilişki yetkisidir. Üçüncü katman, durum ve görev ayrılığı kurallarıdır. Üç katmanı tek bir sunucu işlevi denetler. Varsayılan cevap "hayır"dır. Bir yasak kuralı her izin kuralını yener. Dış bir yetki motoru şimdilik gerekmez.

## Bu raporu nasıl okursunuz?

Raporda üç işaret vardır:

- **Kanıt** başlığı, kaynağı olan bilgiyi gösterir.
- **Çıkarım** başlığı, bizim yorumumuzu gösterir.
- **(hipotez)** notu, pilotta sınanacak bir sayıyı gösterir.

Dış kaynakların çoğu bir arama aracının özetinden okundu. Bu kaynaklar tam okunan sayfadan daha zayıftır. Bu durum ilgili yerde "(arama özeti)" diye yazar. Ürün bilgileri depodaki belgelerden gelir.

Rapor şu sabit ürün kararlarına uyar:

1. Stratej yolu önerir ve gerekçesini kurar. Karar sahibi seçer ve kaydeder.
2. Bir planda aynı anda tek karar sahibi olur.
3. Kararlar yalnız sunucuda kesinleşir.
4. Kaynak izinleri ayrı kararlardır.
5. Yapay zekâ seçim yapmaz ve kapı onaylamaz.
6. Yapay zekâ kaynak izni vermez ve çalışanı puanlamaz.
7. Yapay zekâ hiçbir planda karar sahibi olmaz.

Stratej, stratejiyi geliştiren kişinin unvanıdır. Bu bir yazım hatası değildir.

Ürünün bugünkü durumunu bilerek okuyun. Canlı sürüm yalnız tarayıcıda çalışır. Çok kullanıcılı rol düzeni tasarlandı ama henüz yazılmadı. Sunucu da henüz yazılmadı. Yapay zekâ özelliği bugün üründe yoktur. Bu yüzden yetki kuralları bir tasarım önerisidir.

## Terimler

### RBAC: role dayalı yetki

RBAC, izni kişinin rolüne göre verir. Örneğin "editör" rolü bir izin kümesi taşır ([OpenFGA](https://openfga.dev/docs/authorization-concepts)).

**Ürün örneği.** "Kurum yöneticisi" rolü kullanıcı ekler ve cihaz iptal eder. Bu rol tek başına plan verisi açmaz.

### ABAC: özelliğe dayalı yetki

ABAC, izni özelliklere bakarak verir. Bu özellikler kişinin, kaydın, işin ve ortamın özellikleridir. Sistem bu özellikleri yazılı kurallarla karşılaştırır ([NIST SP 800-162](https://csrc.nist.gov/pubs/sp/800/162/upd2/final)).

**Ürün örneği.** Kilitli bir uygulama kapısında kimse "İlerle" kaydedemez. Burada kapının "kilitli" özelliği belirleyicidir.

### ReBAC: ilişkiye dayalı yetki

ReBAC, izni kişi ile kayıt arasındaki ilişkiye göre verir. Kayıtlar arasındaki ilişkiler de hesaba girer. OpenFGA bu modeli RBAC'yi de kapsayan geniş bir model sayar ([OpenFGA](https://openfga.dev/docs/authorization-concepts)). Google'ın Zanzibar sistemi bu modelin bilinen örneğidir ([USENIX, 2019](https://www.usenix.org/conference/atc19/presentation/pang)).

**Ürün örneği.** Bir kişi A planında karar sahibi olabilir. Aynı kişi B planında ekip üyesi olabilir. Yetkiyi kişinin o plandaki üyeliği belirler.

### RACI: görev dağılım tablosu

RACI, her işte kimin ne yaptığını dört harfle gösterir.

| Harf | İngilizce sözcük | Bu rapordaki anlamı |
|---|---|---|
| R | Responsible | İşi yapan kişi |
| A | Accountable | Hesap veren ve kaydı yapan kişi |
| C | Consulted | Görüşü alınan kişi |
| I | Informed | Sonuçtan haberdar edilen kişi |

Bu raporda her işin tek bir A'sı vardır.

**Ürün örneği.** 2.4 "Seçim ve vazgeçiş" adımında karar sahibi hem R hem A'dır. Stratej bu adımda C'dir. Çünkü stratej yolu önerir ve gerekçesini kurar.

### Diğer terimler

| Terim | Anlamı |
|---|---|
| SaaS | İnternetten abonelikle kullanılan yazılım |
| ICP | İdeal müşteri profili. En uygun müşterinin tarifi. |
| Frappe | Ürünün arka yüzünü kuran hazır yazılım çatısı |
| Kayıt türü | Frappe'de bir kayıt çeşidi. Frappe'deki adı DocType'tır. |
| API | Programların sunucuyla konuştuğu yol |
| Uç | Sunucunun dışarıya açtığı bir işlev |
| REST ucu | Frappe'nin her kayıt türü için kendiliğinden açtığı hazır uç |
| Cedar | Yetki kuralı yazmak için kurulmuş bir dil |
| OpenFGA | Açık kaynak bir yetki aracı |
| KOBİ | Küçük ve orta ölçekli işletme |
| Başlangıç paketi | Müşterinin ürünü ilk kez kullanmasına verilen sabit kapsamlı destek |
| Toplantı yürütücüsü | Toplantıyı tarafsız biçimde yöneten kişi |
| İş ortağı danışman | Ürünü müşterisine öneren ve işi yürüten bağımsız danışman |
| Pilot | Tek bir gerçek kararla yapılan sınırlı deneme |
| Görev ayrılığı | Aynı kişinin hem işi yapıp hem de onaylamasını engelleyen kural |
| Hizmet hesabı | Bir insana değil, bir yazılıma verilen hesap |
| Erişim anahtarı | Girişten sonra sunucunun verdiği kısa ömürlü anahtar |
| Brüt kâr marjı | Satıştan doğrudan maliyet düşülünce kalan pay |
| Ortanca | Sıralanan değerlerin tam ortasındaki değer |
| OKR | Hedef ve ölçülebilir sonuç yöntemi |
| KVKK | Kişisel Verilerin Korunması Kanunu |

## 1. Yazılım tek başına yetmez, ilk döngüyü bir insan yürütür

### Strateji çoğu zaman araçta değil, uygulamada çöker

**Kanıt.** EIU 2017'de 500 üst yöneticiyle bir anket yaptı. Anketi Brightline Initiative istedi. **Şirketler stratejik hedeflerinin ortalama %20'sini kötü uygulama yüzünden tutturamıyor.** Yöneticilerin %59'u strateji ile günlük iş arasında köprü kurmakta zorlanıyor ([Brightline](https://www.brightline.org/press/releases/companies-with-great-strategies-often-fall-short-on-execution-says-economist-intelligence-unit-survey/), arama özeti).

PMI ve EIU 2016'da 500'den fazla yöneticiyle bir anket daha yaptı. Strateji için önemli projelerin yalnız %61'i beklenen faydayı verdi ([PMI](https://www.pmi.org/learning/thought-leadership/series/benefits-realization/strengthening-benefits-awareness-csuite-eiu), arama özeti).

Değişim yönetimi verisi de aynı yönü gösterir. **Üst yönetimin görünür desteği olan işlerin %73'ü başarılı olur.** Bu destek yoksa oran %29'a düşer. Bu Prosci verisidir ve strateji yazılımına özgü değildir. Rakam bir OKR satıcısının sayfasından ikinci elden okundu ([Mooncamp](https://mooncamp.com/glossary/change-adoption), arama özeti).

Bir OKR eğitim kurumu en sık başarısızlık nedenini yazar. Bu neden, üst yönetimin etkin desteğinin olmamasıdır. Düzenli kontrol toplantısının olmaması hemen arkadan gelir ([OKR Institute](https://okrinstitute.org/why-okrs-fail/), arama özeti). Aynı kurum yayılma süresini de yazar. Pilottan tam yayılmaya geçiş çoğu zaman 9 ile 12 ay sürer ([OKR Institute](https://okrinstitute.org/okr-implementation-how-to-roll-out-okrs-across-departments/), arama özeti). Bu kurum eğitim satar. Bu yüzden bilgisi bağımsız araştırma sayılmaz.

Bir alıcı rehberi de aynı uyarıyı yapar. Rehbere göre yazılım kullanımı kendiliğinden yaymaz. Önce bir üst yöneticinin işe sahip çıkıp çıkmayacağı belirlenir ([Serchen](https://www.serchen.com/blog/okr-software-buyers-guide), arama özeti).

**Eksik kanıt.** İki yolu karşılaştıran bağımsız bir çalışma bulunmadı. Bu yollar "yalnız yazılım" ve "yazılım ile toplantı yürütücüsü" yollarıdır. Türkiye'de strateji yazılımı kullanımına dair veri de bulunmadı. Bu yüzden sonuç güçlü bir yön gösterir. Ama sonuç kesin bir ölçüm değildir.

### Ürün başarının üç koşulunu zaten taşıyor

**Çıkarım.** Kaynakların saydığı üç başarı koşulu üründe birer karşılık bulur.

| Başarı koşulu | Üründeki karşılığı |
|---|---|
| Üst yönetimin etkin desteği | Planın tek karar sahibi |
| Düzenli kontrol toplantısı | 3.5 "Seçim hâlâ doğru mu?" gözden geçirmesi |
| İşi yürüten ayrı bir kişi | Stratej |

Bu yüzden asıl risk eksik bir özellik değildir. Birinci risk, stratej rolünün boş kalmasıdır. İkinci risk, gözden geçirme ritminin zamanla ölmesidir. Depodaki pilot hipotezi de bu iki engeli yazar ([Hedef kitle ICP ve personalar](<Hedef kitle ICP ve personalar.md>), bölüm 6).

### Aile şirketi yazılımın veremediği üç hizmeti ister

**Kanıt.** Türkçe kaynaklar aile anayasasını dış danışmanla hazırlamayı önerir. Aile anayasası, aile üyelerinin şirketle ilişkisini düzenleyen kurallardır. Sonra bir aile meclisi bu kuralları uygular. Anlaşmazlıkta tarafsız bir danışman destek verebilir ([Capital](https://www.capital.com.tr/yonetim/liderlik/her-aileye-bir-anayasa), [TKYD](https://www.tkyd.org/wp-content/uploads/2022/12/TKYD_Turkiyede-Aile-Sirketleri-Icin-Kurumsal-Yonetim_01112021.pdf), arama özeti). Bir köşe yazısı aile şirketi sorunlarının çoğunu aile içi iletişime bağlar ([Karar](https://www.karar.com/yazarlar/rasit-yildirim/ailede-birlik-sirkette-sureklilik-1593619), arama özeti). Bu kaynakların çoğu köşe yazısı ve danışman yazısıdır.

Kuşaklar arası gerilim de belgelidir. 601 KOBİ yöneticisiyle bir araştırma yapıldı. **Dijital dönüşümü en çok kuşaklar arası gerilim yavaşlatıyor** ([Forbes Türkiye, 4 Şubat 2026 Çarşamba günü](https://www.forbes.com.tr/dergi/kurucular-temkinli-ikinci-kusak-hizli-dijital-donusum-gerilim-yaratiyor)). KOSGEB dijital dönüşüm kredisi danışmanlığı kapsamıyor ([erp-software.org](https://erp-software.org/en/erp-worldwide/turkey/)). Yani müşteri danışman bedelini bu krediden ödeyemez.

**Çıkarım.** Aile şirketi yazılımın tek başına veremediği üç hizmete ihtiyaç duyar:

1. 2.4 seçim toplantısını tarafsız bir kişi yönetmeli. Karar sahibi bu toplantıda aile önünde seçer.
2. Tarafsız bir kişi ikinci görüş vermeli. Ürün bu görevi "Danışman" rolüyle tanımlar.
3. Birisi üç ayda bir gözden geçirme toplantısını takvime koymalı ve yürütmeli.

Tek karar sahibi kuralı bir satış gücüdür. Aynı kural kurucu kuşak için bir korkudur. Bu kuralda karar ad ve saatle kaydedilir. Bu gerilimi odadaki bir insan yönetir. Yazılım bu gerilimi yönetemez.

### Satıcılar yazılımı hizmetle birlikte satıyor

**Kanıt.** Beş strateji uygulama satıcısının çoğu fiyatı teklifle verir. Hizmet bu satıcılarda üç biçimde görünür. Bu biçimler planın içindeki eğitim, sertifika programı ve iş ortağı programıdır.

| Satıcı | Hizmet biçimi | Kaynak |
|---|---|---|
| Cascade | Yönlendirme ve yeniden satış ortaklığı. Danışmanlara sertifika ve ortak hizmet. 2 kullanıcıya kadar ücretsiz katman. | [Cascade ortakları](https://www.cascade.app/partners), [kayıt](https://www.cascade.app/partners/partner-registration), [Mooncamp](https://mooncamp.com/blog/strategic-planning-software), arama özeti |
| AchieveIt | Üç plan. Planlar eğitim ve kurulum hizmetiyle ayrılır. 90 günlük "Results90" paketi. En az 20 kullanıcı. | [checkthat.ai](https://checkthat.ai/answers/what-are-the-best-strategic-planning-software-platforms), [Mooncamp](https://mooncamp.com/blog/strategic-planning-software), arama özeti, satıcı doğrulamadı |
| WorkBoard | 2 günlük "OKR Coach" sertifika programı | [WorkBoard Learn](https://learn.workboard.com/), arama özeti |
| ClearPoint | Fiyat kullanıcıya, destek düzeyine ve bağlantılara göre değişir. Kurulum haftalar ya da aylar sürer. | [Mooncamp](https://mooncamp.com/blog/clearpoint-strategy-alternatives), arama özeti, rakip yazısı |
| Spider Impact | Tanıtımdan sonra 30 günlük deneme | [Tability](https://www.tability.io/odt/articles/the-10-best-strategy-software-tools), arama özeti |

Cascade'in ortak listesinde bir danışmanlık şirketi görünür. Bu şirketin başlangıç işi 25.000 ile 50.000 avrodur ([Vivid Strategies](https://www.cascade.app/cascade-partner/vivid-strategies), arama özeti). Bu rakam danışmanlık işinin bedelidir. Yazılımın fiyatı değildir.

**Eksik kanıt.** Hiçbir satıcının kurulum ücreti satıcı sayfasından doğrulanmadı. Koçluk ücreti ve ortak komisyonu da doğrulanmadı. Fiyatların çoğu rakip ya da toplayıcı sitelerden gelir. Bu fiyatlar birbiriyle çelişir.

**Çıkarım.** Öncü satıcılar orta ölçekli şirkete yalnız kendi kendine kurulan yazılım satmıyor. Piyasadaki kalıp üç parçalıdır. Bu parçalar abonelik, adı konmuş başlangıç paketi ve ortak kanalıdır. Bu ürüne en yakın örnek Cascade'in ortak modelidir. Bu modelde danışman rakip olmaz. Danışman satış kanalı olur.

### Sizin hizmet payınız küçük kalmalı

**Kanıt.** İkinci el bir kaynak Benchmarkit verisini aktarır. **Ortanca B2B SaaS şirketinde hizmet, gelirin yaklaşık %15'idir.** B2B, şirketlere satış yapan şirket demektir. Hizmetin brüt kâr marjı yaklaşık %30'dur. Aboneliğin brüt kâr marjı ise yaklaşık %81'dir ([Orb](https://www.withorb.com/blog/saas-growth-margin-statistics), arama özeti). KeyBanc anketini aktaran bir yazı da benzer bir uyarı yapar. Hizmet geliri %15'i aşan şirketlerde brüt marj belirgin biçimde düşer ([Seeto](https://seeto.ai/blog/keybanc-saas-survey-2025-takeaways), arama özeti). Asıl KeyBanc ve SaaS Capital raporları okunmadı.

**Çıkarım.** Toplantı yürütme işini çoğunlukla iş ortakları yapmalı. Ortağın danışmanlık geliri sizin marjınızı düşürmez. Sizin maliyetiniz ortak eğitimi, şablonlar ve sertifikadır. Kendi sattığınız hizmetin kapsamı ve çıktısı sabit olmalı. Sabit kapsamlı iş, açık uçlu danışmanlıktan daha kolay yönetilir. Bu cümle genel bir akıl yürütmedir. Kaynağı olan bir ölçüm değildir.

## 2. Dört rol düzenli çalışmazsa plan ölür

### Roller ve önerilen sıklıklar

Rollerin yetkileri depodaki tasarımdan gelir ([bütünleşik geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md), bölüm 3.5). Kişi örnekleri satın alma grubu eşleşmesinden gelir ([Hedef kitle ICP ve personalar](<Hedef kitle ICP ve personalar.md>), bölüm 4.6). Sıklıklar bizim önerimizdir (çıkarım).

| Rol | Kim alır? | Ne yapar? | Önerilen sıklık | Şart mı? |
|---|---|---|---|---|
| Karar sahibi | İkinci kuşak genel müdür ya da kurucu | Plan üyesi ekler. Kararları ve kaynak izinlerini kaydeder. İnceleme kuyruğunu karara bağlar. | Her hafta kuyruk. Her ay Karar 6 ya da Karar 7. Üç ayda bir 3.5. | Her planda şart |
| Stratej | Kurumsal gelişim müdürü ya da dış danışman | Yol önerir ve gerekçesini kurar. Strateji adımlarını ve hedefleri yazar. Karar kaydedemez. | Hazırlık ve oluşturma boyunca her hafta. Uygulamada her ay. | Strateji oluşturmada şart |
| Ekip üyesi | Mali işler müdürü ve iş sorumluları | Adım cevabı, kanıt, hedef, gözlem ve kaynak hareketi yazar. İkinci görüş verebilir. | Her hafta gözlem. Harcama oldukça kaynak hareketi. | En az 1 kişi şart. Pilot hipotezi 2 ile 5 kişidir. |
| Danışman | Dış danışman | Yalnız okur ve ikinci görüş verir. | Her kapı kararında. Üç ayda bir gözden geçirmede. | Tek kurucuda şart |
| Okur | Aile meclisi, yönetim kurulu, kurucu kuşak | Yalnız okur. | Üç ayda bir, gözden geçirmeden sonra | İsteğe bağlı |
| Kurum yöneticisi | Bilgi işlem sorumlusu | Kullanıcı ekler. Cihaz iptal eder. Eşitleme ayarlarını değiştirir. | Değişiklik oldukça. Her ay erişim kontrolü. | Her kurumda şart |
| Sistem yöneticisi | Ürünü işleten ekip | Yayını ve özellik anahtarlarını yönetir. | Müşteri rolü değildir. | Müşteride yok |

**Kanıt.** Tek kurucunun başka üyesi yoksa ikinci görüş alamaz. Bu durumda "İlerle" önerisinin dışına çıkamaz ve sınır artıramaz. Bu yüzden tek kurucu plana bir danışman ekler ([bütünleşik geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md), bölüm 3.5 ve 14).

### Planı canlı tutan kişi karar sahibidir

**Çıkarım.** Kararları ve kaynak izinlerini yalnız karar sahibi kaydeder. Karar sahibi aylık ve üç aylık kayıtları atlarsa plan durur. Başka hiçbir rol bu boşluğu dolduramaz. Bu yüzden pilot sözleşmesine karar sahibinin toplantı takvimini yazın.

**Kanıt.** Üründe bugün bildirim modülü yoktur. Bir kural bildirime dayanınca bildirim yedinci modül olur ([bütünleşik geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md), bölüm 14).

**Çıkarım.** Bildirim modülü yokken hatırlatma işini bir insan yapar. İlk yıl bu işi stratej ya da iş ortağı danışman yapar. Stratej toplantıları müşterinin kendi takviminde kurar.

### Kullanımı kişi başına değil, plan başına ölçün

**Çıkarım.** Bu üründe değer girişlerden doğmaz. Değer karar ve gözlem kayıtlarından doğar. Bu yüzden kullanımı plan başına ölçün. Bu ölçüm çalışanı puanlamaz. Ölçüm yalnız planın sağlığını gösterir.

Uygulama kümesindeki bir plan şu dört koşulu sağlarsa etkin sayılır (hipotez):

1. Her etkin hedefe son 30 günde en az bir gözlem girildi.
2. Karar sahibi son 31 günde Karar 6 ya da Karar 7 kaydetti.
3. Karar sahibi 3.5 gözden geçirmesini zamanında kaydetti. Zamanında demek, "sonraki kontrol tarihi"nden en geç 14 gün sonra demektir.
4. Karar sahibinin kuyruğunda 14 günden eski inceleme kaydı yok.

Hazırlık kümesindeki planın ilk başarı ölçüsü şudur: Karar sahibi geçiş kararını pilot süresi içinde kaydeder.

Aboneliği bırakmanın erken işaretleri şunlardır (hipotez):

1. Sonraki kontrol tarihi geçti ve gözden geçirme kaydı yok.
2. Planda 30 gündür hiç gözlem yok.
3. Planda karar sahibinin 30 gündür hiçbir kaydı yok.
4. Stratejin ya da danışmanın üyeliği bitti. Yerine kimse atanmadı.

**Eksik kanıt.** Strateji yazılımında bağlılığı önceden gösteren bir kullanım işareti kaynaklarda bulunmadı. Bu eşikler doğrulanmadı. Siz bu eşikleri pilotlarda sınayın.

## 3. RACI tablosu: kararların tek hesap vereni karar sahibidir

İşler ve rol yetkileri depodaki belgelerden gelir ([bütünleşik geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md), [süreç haritası](../docs/surec-haritasi.md)). Sıklık sütunu bizim önerimizdir (çıkarım). Tabloda tire işareti "rolü yok" anlamına gelir.

| İş | Kurum yöneticisi | Karar sahibi | Stratej | Ekip üyesi | Danışman | Okur | Önerilen sıklık |
|---|---|---|---|---|---|---|---|
| Kullanıcı ekleme, cihaz iptali | R, A | I | - | - | - | - | Değişiklik oldukça. Her ay erişim kontrolü. |
| Plan üyesi ekleme, rol verme | - | R, A | C | - | - | - | Plan başında ve değişiklik oldukça |
| Adım 00 ile Adım 18 arası | - | C | R | R | C | - | Hazırlık boyunca her hafta |
| Karar 1 ile Karar 5 arası | - | A | R | C | C | I | Her blok hazır olunca |
| Geçiş kararı | - | A | R | C | C | I | Her planda bir kez |
| 2.1, 2.2, 2.3 ve 2.5 | - | C | R | C | C | - | Oluşturma boyunca her hafta |
| 2.4 Seçim ve vazgeçiş | - | R, A | C | C | C | I | Yürütücülü tek toplantı |
| Strateji belgesinin onayı | - | A | R | - | C | I | Bir kez. Yeniden açmadan sonra tekrar. |
| 3.1 Hedef ve 3.2 Ana işler | - | C | R | R | - | - | Uygulama başında ve "Düzelt" kararından sonra |
| 3.3 Kaynak ve kaynak izni | - | R, A | C | C | - | I | Onaydan sonra ve yeni ihtiyaçta |
| Kaynak hareketi | - | A | - | R | - | - | Her hafta ya da harcama oldukça |
| Hedefe karşı gözlem | - | I | C | R | - | - | Her hafta |
| İnceleme kuyruğu | - | R, A | C | I | - | - | Her hafta |
| Karar 6 ve Karar 7 | - | A | R | C | C | I | Her ay |
| 3.5 ve Karar 8 | - | A | R | C | C | I | Üç ayda bir ve tetikleyici olayda |
| Sınır artışı | - | R, A | - | C | C | - | İhtiyaç oldukça. İnceleyen başka bir kişidir. |
| Rapor ve anlık görüntü | - | I | R | - | I | I | Her onaylı karardan sonra |

Tablonun dört önemli sonucu vardır:

1. Aile meclisi "Okur" rolünü alır. Meclis her 3.5 kaydından sonra salt okunur özeti görür. Meclis yazılımda karar hakkı almaz. Çünkü her planda tek karar sahibi vardır.
2. Mali işler müdürü "Ekip üyesi" rolünü alır. Kaynak hareketlerini o girer. Kaynak iznini o açamaz.
3. Dış danışman işi yürütürse "Stratej" rolünü alır. Yalnız ikinci görüş verirse "Danışman" rolünü alır. Dış danışman aynı planda karar sahibi olmaz.
4. Tek kurucuda karar sahibi ile stratej aynı kişi olabilir. Bu kişi ikinci görüş için plana bir danışman ekler.

## 4. Yetkiyi üç katmanda kurun

### Neden üç katman gerekiyor?

**Çıkarım.** Üründeki kuralların çoğu iki şeye birden bakar. Kural önce kişinin plandaki ilişkisine bakar. Sonra kaydın durumuna bakar. Örneğin "karar sahibi kaydeder" bir ilişki kuralıdır. "Kilitli kapıda İlerle olmaz" bir durum kuralıdır. Frappe'nin rolleri bu iki kuralı da taşıyamaz. Çünkü Frappe rolleri bütün sitede geçerlidir.

| Katman | Model | Nerede durur? | Neye cevap verir? |
|---|---|---|---|
| 1 | RBAC | Frappe rolleri ve rol izin satırları | Kişi bu tür kayda hiç girebilir mi? |
| 2 | ReBAC | Plan Üyeliği ve türetilen ilişkiler | Kişi bu planda hangi roldedir? |
| 3 | ABAC ve görev ayrılığı | Erişim modülündeki tek denetim işlevi | Bu kayıt şu durumda bu işe açık mı? |

### Katman 1: site düzeyinde az sayıda rol

| Rol | Kim alır? | Ne verir? | Ne vermez? |
|---|---|---|---|
| Sistem yöneticisi | Yalnız ürünü işleten ekip | Yayın ve özellik anahtarları | Müşteri kullanıcısına verilmez. |
| Kurum yöneticisi | Kurumun bilgi işlem sorumlusu | Kullanıcı ve cihaz yönetimi | Tek başına plan verisi açmaz. |
| Plan kullanıcısı (yeni, öneri) | Bütün müşteri kullanıcıları | Plan kayıtlarına okuma ve API yolu | Paylaşma, silme, içe aktarma ve dışa aktarma yok. Karar kayıtlarında oluşturma ve onaylama yok. |
| Yapay zekâ hizmet hesabı (yeni, öneri) | Yapay zekâ servisi | Taslak yazma uçları | Hiçbir karar ucu yok. İkinci görüş yok. Kişi puanı yok. |

Asıl sınırı 2. ve 3. katman çizer. Plan kullanıcısı rolü yalnız kapıyı açar.

### Katman 2: plan içindeki ilişkiler

| İlişki | Hangi kayıtta durur? | Ne işe yarar? |
|---|---|---|
| Üye | Plan Üyeliği | Kişi, plan, rol, başlangıç, bitiş ve atayan kişiyi tutar. |
| Görev sorumlusu (öneri) | Görev | Sorumlu kişi kendi görevinin durumunu günceller. |
| Yazan | Kanıt Sürümü, Gözlem, Kaynak Hareketi | Kaydı kimin yazdığını kalıcı olarak gösterir. |
| Değiştiren ve inceleyen | Sınır Değişikliği | İnceleyen kişinin değiştiren kişiden farklı olmasını sağlar. |
| İkinci görüş veren | Kapı Kararı | İkinci görüşün başka bir üyeden gelmesini sağlar. |

**Değişmez kural.** Bir planda aynı anda tek etkin karar sahibi satırı olur. Yeni atama, eski atamanın bitişini aynı işlemde yazar. Bu kural depoda zaten vardır ([bütünleşik geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md), bölüm 3.5).

### Katman 3: durum ve görev ayrılığı

| Özellik türü | Örnekler |
|---|---|
| Kaydın özelliği | Geçiş kararı var mı? Kapı kilitli mi? Strateji onayı geçerli mi? İznin durumu ve kalanı. Serbest bütçe. |
| Ortamın özelliği | Cihaz iptal edildi mi? Üyelik bugün geçerli mi? İstemcinin kural sürümü. |
| Kişinin özelliği | Hesap bir insana mı, bir hizmete mi ait? |
| Kurumun özelliği | Yapay zekâ seviyesi. Veri sınıfı (öneri). |

### Sade kurallar

Bu kuralların çoğu depodaki tasarımdan gelir. "(öneri)" notu taşıyanlar bizim önerimizdir.

1. Kişi bir planın kayıtlarını yalnız o planın etkin üyesiyken görür.
2. Üyeliğin bitiş zamanı geçince okuma hakkı da biter.
3. Bazı kayıtları yalnız planın o anki karar sahibi kaydeder. Bu kayıtlar kapı kararı, geçiş kararı ve strateji onayıdır. Gözden geçirme ve kaynak izni de bu kayıtlardandır.
4. Stratej, strateji adımlarını ancak geçiş kararından sonra yazar.
5. Kilitli bir uygulama kapısında kimse "İlerle" kaydedemez.
6. Ekip üyesi izin kapalıyken de gözlem yazar. Gözlem harcama hakkı vermez.
7. Kapalı izne gelen harcama kaydedilir ama incelemeye düşer.
8. İncelemedeki harcamayı yalnız karar sahibi kabul eder ya da reddeder.
9. Sınırı artıran kişi bu değişikliği inceleyemez.
10. İkinci görüşü başka bir üye kendi hesabıyla verir.
11. Karar sahibi kendi kararına ikinci görüş veremez (öneri).
12. Yapay zekâ hesabı hiçbir kararı kaydetmez. Bu hesap ikinci görüş de vermez (öneri).
13. Hiçbir hesap çalışana puan yazamaz. Üründe böyle bir uç yoktur (öneri).
14. İptal edilen cihaz yalnız iki iş yapar. Bekleyen değişikliklerini incelemeye gönderir. Yerel veriyi silme komutunu alır.
15. Plan kayıtları Frappe'nin belge paylaşımıyla paylaşılmaz (öneri).
16. Sunucu kişiyi erişim anahtarından tanır. Cihazın gönderdiği ad yetki vermez.

### Kural metni örneği

Aşağıdaki kural metni Cedar diline benzer. Cedar'da her kural bir kişi, bir iş ve bir kayıt için yazılır. Kural "izin ver" ya da "yasakla" der. Koşul `when` kısmında durur ([Cedar](https://docs.cedarpolicy.com/overview/terminology.html)). Bu metin bir örnektir. Metin hiçbir motorda çalıştırılmadı. Cedar'ın "yasak izni yener" davranışı okunan sayfada doğrulanmadı. Bu yüzden bu davranışı kendi işlevinizde açıkça kurun.

```cedar
// Varsayılan: izin kuralı yoksa cevap "hayır".
// Bir yasak kuralı tutarsa bütün izin kuralları yok sayılır.

// Okuma: yalnız bugün geçerli üyelik
permit(principal, action == Action::"oku", resource)
  when { uyelik(principal, resource.plan).gecerli(sunucu_saati) };

// Kararlar: yalnız planın o anki karar sahibi
permit(principal, action in [Action::"kapi_karari_kaydet",
                             Action::"gecis_karari_kaydet",
                             Action::"strateji_onayla",
                             Action::"gozden_gecirme_kaydet",
                             Action::"izin_ac", Action::"izin_kapat",
                             Action::"hareket_incele"], resource)
  when { "karar_sahibi" in roller(principal, resource.plan, sunucu_saati) };

// Strateji adımları: yalnız geçiş kararından sonra
permit(principal, action == Action::"strateji_adimi_yaz", resource)
  when { roller(principal, resource.plan, sunucu_saati)
           .containsAny(["stratej", "karar_sahibi"])
         && resource.plan.gecis_karari_var };

// Gözlem, kaynak hareketi ve kanıt sürümü
permit(principal, action in [Action::"gozlem_ekle", Action::"hareket_ekle",
                             Action::"kanit_surumu_ekle"], resource)
  when { roller(principal, resource.plan, sunucu_saati)
           .containsAny(["ekip_uyesi", "stratej", "karar_sahibi"]) };

// İkinci görüş
permit(principal, action == Action::"ikinci_gorus_ver", resource)
  when { roller(principal, resource.plan, sunucu_saati)
           .containsAny(["danisman", "ekip_uyesi"]) };

// YASAKLAR

forbid(principal, action == Action::"kapi_karari_kaydet", resource)
  when { resource.kapi.kilitli && resource.secim == "Ilerle" };

forbid(principal, action == Action::"ikinci_gorus_ver", resource)
  when { principal == resource.karar.karar_sahibi };

forbid(principal, action == Action::"sinir_degisikligi_incele", resource)
  when { principal == resource.degistiren };

// Kendi harcamasını inceleme yasak.
// Tek istisna: planda karar sahibinden başka üye yok.
forbid(principal, action == Action::"hareket_incele", resource)
  when { principal == resource.giren_kisi
         && resource.plan.karar_sahibi_disindaki_uye_sayisi > 0 };

// Hizmet hesabı hiçbir kararı kaydetmez.
forbid(principal, action in [Action::"kapi_karari_kaydet",
                             Action::"gecis_karari_kaydet",
                             Action::"strateji_onayla",
                             Action::"gozden_gecirme_kaydet",
                             Action::"izin_ac", Action::"izin_kapat",
                             Action::"hareket_incele",
                             Action::"ikinci_gorus_ver"], resource)
  when { principal.hesap_turu == "hizmet" };

// Kişiyi puanlayan iş yoktur. Kimse yapamaz.
forbid(principal, action == Action::"kisi_puanla", resource);

// İptal edilen cihaz yalnız iki iş yapar.
forbid(principal, action, resource)
  when { context.cihaz.iptal
         && !(action in [Action::"bekleyenleri_incelemeye_gonder",
                         Action::"yerel_veriyi_sil_komutu_al"]) };

// Plan kaydı paylaşılmaz.
forbid(principal, action == Action::"paylas", resource)
  when { resource.plan_kaydi };

// Kısıtlı kaydı yalnız karar sahibi, stratej ve yazan kişi okur.
forbid(principal, action == Action::"oku", resource)
  when { resource.veri_sinifi == "kisitli"
         && !roller(principal, resource.plan, sunucu_saati)
               .containsAny(["karar_sahibi", "stratej"])
         && principal != resource.yazan };
```

Bu kuralları Erişim modülündeki tek bir işlev uygular. İşlev her cevapla birlikte bir neden kodu döner. Ekran bu kodu sade bir cümleye çevirir. Örneğin "Bu kararı yalnız planın karar sahibi kaydedebilir."

```python
# Erişim modülü (taslak). İzin işlevi tek yerde durur.
def yetki_ver(kisi, is_turu, kayit, ortam) -> Sonuc:
    # 1. katman: site rolü
    if not temel_rol_var(kisi, is_turu):
        return hayir("rol_yok")

    # 2. katman: plan ilişkisi, sunucu saatine göre
    roller = gecerli_roller(kisi, kayit.plan, sunucu_saati())
    if not roller:
        return hayir("plan_uyesi_degil")

    # 3. katman: önce yasaklar, sonra izinler
    for kural in YASAK_KURALLARI:
        if kural.tutar(kisi, roller, is_turu, kayit, ortam):
            return hayir(kural.neden_kodu)
    for kural in IZIN_KURALLARI:
        if kural.tutar(kisi, roller, is_turu, kayit, ortam):
            return evet(kural.neden_kodu)
    return hayir("izin_kurali_yok")
```

### Frappe'de denetim nerede yapılır?

| Denetim noktası | Ne yapar? |
|---|---|
| Liste koşulu (`permission_query_conditions`) | Liste sorgusuna geçerli üyelik koşulunu ekler. |
| Kayıt denetimi (`has_permission`) | Tek kayıt açılırken denetim işlevini çağırır. Yalnız reddedebilir. |
| İş akışı uçları | Kararlar yalnız buradan yazılır. Uç önce denetim işlevini çağırır. Sonra kuralları çalıştırır. Sonra plan kilidi altında yazar. |
| Onay öncesi ve doğrulama adımları (`before_submit`, `validate`) | Önemli denetimleri ikinci kez çalıştırır. |
| Rol izin satırları (DocPerm) | Plan kayıtlarında paylaşma izni yoktur. Karar kayıtlarında oluşturma ve onaylama izni yoktur. |

Depo, liste koşulunu ve kayıt denetimini zaten planlar. Kararların yalnız iş akışı uçlarından yazılması da depoda vardır ([bütünleşik geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md), bölüm 6.3).

```python
# hooks.py (taslak). İki bağı yalnız Erişim modülü kurar.
permission_query_conditions = {
    d: "decisionact.erisim.izin.liste_kosulu" for d in PLAN_KAYIT_TURLERI
}
has_permission = {
    d: "decisionact.erisim.izin.kayit_denetimi" for d in PLAN_KAYIT_TURLERI
}
```

### Açık kalan konularda önerilerim

| Konu | Önerim | Neden? |
|---|---|---|
| Karar sahibinin vekili | Kayıt yetkisi olan vekil olmasın. Vekil yalnız okur ve taslak hazırlar. Vekilliğin bitiş tarihi zorunludur. Uzun yoklukta yeni karar sahibi atanır. | Tek karar sahibi kuralı korunur. Devir zaten zaman aralıklı atamayla yapılır. |
| Ekip üyesi sınır artışına ikinci görüş verebilir mi? | Evet verebilir. Şart, artışı yapan kişiden farklı olmasıdır. | Depo ekip üyesinin ikinci görüş verebileceğini yazar. Danışmanı zorunlu yapmak küçük ekipte işi durdurur. |
| Veri sınıfı | Sunucunun ilk sürümünde iki sınıf olsun. Sınıflar "Normal" ve "Kısıtlı"dır. Varsayılan sınıf "Normal"dir. | Bazı kanıtlar özel bilgi taşıyabilir. Örneğin bir kişinin maaşı. Sınıfı sonradan eklemek bütün liste koşullarını değiştirir. |
| Tek kişilik planda harcamayı kim kabul eder? | Planda başka üye yoksa karar sahibi kabul eder. Kayıt "kendi kaydını inceledi" işareti taşır. Danışman bu işareti görür. | Görev ayrılığı görünür kalır. Tek kurucu da işini sürdürür. |
| Karar sahibi kendi kararına ikinci görüş verebilir mi? | Hayır. Bu yasak bütün karar türlerinde yazılı olsun. | Depo "başka bir plan üyesi" der. Ama bunu her karar türü için ayrıca yazmaz. |
| Dış yetki motoru | Şimdi eklemeyin. | Aşağıdaki dört neden geçerlidir. |
| Danışmanın çok müşterili ekranı | Şimdi yapmayın. Kanal büyürse kurum dizini üzerinden bir özet ekranı yapın. | Her kurum ayrı sitededir. Bugün kanal henüz kanıtlanmadı. |

### Dış yetki motoru şimdilik gerekmez

**Kanıt.** Zanzibar çok büyük ölçek için kuruldu. Sistem trilyonlarca erişim kaydı taşır. Sistem saniyede milyonlarca isteğe cevap verir ([USENIX, 2019](https://www.usenix.org/conference/atc19/presentation/pang)). OpenFGA bu modeli mevcut veritabanları üzerinde uygular ([OpenFGA](https://openfga.dev/docs/authorization-concepts)).

**Çıkarım.** Dört neden dış motoru bu ürün için şimdilik gereksiz kılar:

1. Her kurumun kendi sitesi vardır. Bir sitedeki ilişki sayısı küçüktür.
2. Dış motor iki ayrı yere yazmayı gerektirir. Plan Üyeliği ile motor zamanla birbirinden ayrılabilir. Oysa kararlar tek veritabanı işleminde ve plan kilidi altında kesinleşir.
3. Her kurum için ayrı bir motor alanı gerekir. Bu yeni bir altyapı işidir. Bu altyapıyı DevOps sorumlusu kurar ve işletir.
4. İnternetsiz cihaz yalnız öneri hesaplar. Yetkiyi her zaman sunucu verir.

Kural metnini Cedar biçimine yakın yazın. Böylece kurallar ileride bir motora taşınabilir. Cedar için bakımı süren bir Python bağlantısı olup olmadığı denetlenmedi.

### Danışman birden çok kurumda nasıl çalışır?

**Çıkarım.** Danışmanın her kurum sitesinde ayrı bir Frappe kullanıcısı olur. Kurumlar veritabanı paylaşmaz. İşler şu sırayla yürür:

1. Kurum yöneticisi danışmana kendi sitesinde bir hesap açar.
2. Karar sahibi danışmanı plana "Stratej" ya da "Danışman" rolüyle ekler.
3. İş bitince karar sahibi danışmanın üyeliğini bitirir.

Kurum dizini ileride danışmanın etkin üyeliklerini listeleyebilir. Çok müşterili ekran her siteyi o sitenin kendi anahtarıyla çağırır. Ekran yalnız her sitenin izin verdiği özeti gösterir. Ortaklık sözleşmesi ve KVKK rolleri hukuk incelemesinden geçmeli.

## 5. Frappe 16'nın sınırları ve bunları kanıtlayacak testler

**Kanıt.** Frappe'de bir kullanıcı birçok rol taşır. Her rol bir kayıt türünde işlere izin verir. Kullanıcı izinleri kayıtları bir bağlantı alanının değerine göre süzer ([Frappe kullanıcılar ve izinler](https://docs.frappe.io/framework/user/en/basics/users-and-permissions)). Liste koşulu yalnız `frappe.db.get_list` sonucunu etkiler. Koşul `frappe.db.get_all` sonucunu etkilemez ([Frappe hooks](https://docs.frappe.io/framework/user/en/python-api/hooks)). Frappe 16 kaynak koduna göre denetleyiciler yalnız izni reddedebilir. Denetleyiciler yeni izin veremez ([permissions.py, version-16](https://raw.githubusercontent.com/frappe/frappe/version-16/frappe/permissions.py)).

**Doğrulanmamış bilgi.** Aynı kaynak kodda belge paylaşımı en sonda denetlenir. Bu yüzden paylaşım, denetleyici reddettikten sonra da erişim verebilir. Bu davranış bir özetleyici araçla okundu ([permissions.py, version-16](https://raw.githubusercontent.com/frappe/frappe/version-16/frappe/permissions.py)). Bu bilgiyi bir Frappe 16 kurulumunda testle doğrulayın.

| No | Sınır | Önlem | Kanıtlayacak test |
|---|---|---|---|
| 1 | Frappe rolleri bütün sitede geçerlidir. Plan başına rol taşımaz. | Plan rolü Plan Üyeliği satırında durur. | A planının karar sahibi B planında karar kaydedemez. |
| 2 | Kullanıcı izninde zaman aralığı yoktur. | Üyelik denetimi sunucu saatine göre yapılır. | Üyeliği dün biten kişi bugün planı göremez. |
| 3 | Kullanıcı izninde tek sahip kuralı yoktur. | Atama işlevi plan kilidi altında çalışır. | Aynı anda gelen iki karar sahibi atamasından yalnız biri etkin kalır. |
| 4 | Kayıt denetimi yalnız reddedebilir. | Geniş bir temel rol verin. Daraltmayı denetim işlevi yapar. | Denetim işlevi "evet" dese bile rol izni olmayan iş yapılamaz. |
| 5 | Liste koşulu `get_all` çağrısına uygulanmaz. | Plan modüllerinde `get_all` ve `ignore_permissions` yasaktır. İstisna yalnız incelenmiş sistem işleridir. | Kod taraması bu çağrıyı bulursa yayın durur. Üye olmayan kişinin listesi boş döner. |
| 6 | Belge paylaşımı reddi aşabilir (doğrulanmadı). | Plan kayıtlarında paylaşma izni kaldırılır. Başka uygulama gerekmiyorsa `disable_document_sharing` açılır. | Üye olmayan kişiye paylaşım satırı yazılır. Kişi kaydı yine açamaz. |
| 7 | Frappe iş akışı geçişleri role bağlıdır. "Planın o anki karar sahibi" kuralını tek başına taşımaz (çıkarım). | Kararlar yalnız iş akışı uçlarından yazılır. | Hazır REST ucuyla karar oluşturma reddedilir. Yönetim ekranından onay da reddedilir. |

Şu ürün kuralları da testle kanıtlanmalı:

1. İstemci başka bir kişiyi karar sahibi diye gönderir. Sunucu bu alanı yok sayar.
2. İptal edilen cihaz iki izinli işi yapar. Cihazın üçüncü isteği reddedilir.
3. Yapay zekâ hesabına bütün roller verilse bile hesap karar onaylayamaz.
4. Sınırı artıran kişi kendi değişikliğini inceleyemez.
5. Karar sahibi kendi kararına ikinci görüş veremez.
6. Kilitli uygulama kapısında "İlerle" kaydı reddedilir.
7. Kapalı izne gelen harcama kaybolmaz. Harcama incelemeye düşer.

Testleri şu sırayla kurun:

1. Testi kodu yazmadan önce yazın.
2. Testin önce düştüğünü görün.
3. Sonra kodu yazın ve testi geçirin.
4. Testleri ortak örnek dosyalarıyla yazın. Depodaki kural örnekleri de böyle çalışır.
5. Testleri her kod gönderiminde otomatik çalıştırın.
6. Bir yetki testi düşerse yayını durdurun.
7. Testleri gerçek bir Frappe 16 kurulumunda çalıştırın. Belge okuması yeterli sayılmaz.

**Eksik kanıt.** Frappe 16'nın rol profili ve modül profili belgeleri okunmadı. Kullanıcı izinlerindeki "applicable_for" alanı da okunmadı. Frappe iş akışının geçişlerde koşul ifadesi desteği de denetlenmedi.

## 6. Hizmet paketi önerisi

### Teklifin dört katmanı

| Katman | Kime? | Kim verir? | İçerik |
|---|---|---|---|
| Ürün aboneliği | Bütün müşteriler | Siz | Yazılım, gece güncellemeleri ve güvenlik |
| Başlangıç paketi | İlk kez alan aile şirketi | Siz ya da sertifikalı iş ortağı | Tek kararlı pilot. Yaklaşık 8 hafta ve 2 ile 5 ekip üyesi (hipotez). Üç sabit çıktı. |
| İş ortağı programı | Strateji ve aile şirketi danışmanları | Siz eğitirsiniz. Ortak işi yürütür. | Sertifika, şablonlar, "Stratej" rolü ve yönlendirme ortaklığı |
| Kendi kendine kullanım | Tek kurucu ve küçük ekip | Müşteri | Tarayıcı sürümü. İkinci görüş için plana danışman ekleme. |

Başlangıç paketinin üç sabit çıktısı vardır ([Hedef kitle ICP ve personalar](<Hedef kitle ICP ve personalar.md>), bölüm 6):

1. Geçiş kararı
2. "Strateje devir raporu"
3. Onaylanmış strateji belgesi

### Pilot adım adım

Pilotun adımları şunlardır:

1. Kurum yöneticisi kullanıcıları ekler.
2. Karar sahibi stratej, ekip üyeleri ve gerekirse danışmanı plana ekler.
3. Karar sahibi toplantı takvimini sözleşmeye yazar.
4. Stratej ve ekip hazırlık adımlarını haftalık toplantılarda doldurur.
5. Karar sahibi devir raporunu okur ve geçiş kararını kaydeder.
6. Stratej yolları önerir ve gerekçesini kurar.
7. Toplantı yürütücüsü 2.4 seçim toplantısını yönetir.
8. Karar sahibi yolu seçer ve strateji belgesini onaylar.

Pilot 8. adımla biter. Yayılma şu adımlarla başlar:

1. Karar sahibi ilk kaynak iznini açar.
2. Ekip ilk gözlemi girer.
3. Karar sahibi ilk gözden geçirme kaydını açar.

İlk gözden geçirme kaydı yayılmanın kanıtıdır.

**Bağımlılık.** Çok kullanıcılı pilot sunucu sürümünü gerektirir. Bu sürüm hazır değilse tek cihazlı bir ön pilot yapın. Bu ön pilotta stratej ve karar sahibi tarayıcı sürümünü birlikte kullanır. Ekip üyeleri ön pilotta yer almaz ([Hedef kitle ICP ve personalar](<Hedef kitle ICP ve personalar.md>), bölüm 6).

### İş ortağı programı

**Kanıt.** Cascade iki ortaklık türü sunar. Bu türler yönlendirme ve yeniden satıştır ([Cascade kayıt](https://www.cascade.app/partners/partner-registration), arama özeti). WorkBoard koçlar için 2 günlük bir sertifika programı yürütür ([WorkBoard Learn](https://learn.workboard.com/), arama özeti).

**Çıkarım.** İlk yıl yalnız yönlendirme ortaklığıyla başlayın. Yeniden satış, faturalama ve sözleşme işini büyütür. Ortak sertifikası kısa olsun. Sertifika ürünün kendi kurallarını öğretsin. En önemli kural şudur: Stratej yolu önerir ve gerekçesini kurar. Karar sahibi seçer ve kaydeder.

Danışmanların korkuları depodaki persona çalışmasında yazılıdır ([Hedef kitle ICP ve personalar](<Hedef kitle ICP ve personalar.md>), bölüm 5.7). Program bu korkulara şöyle cevap verir:

| Danışmanın korkusu | Programın cevabı |
|---|---|
| "Yazılım benim yerimi alır." | Yazılım yol seçmez. Stratej rolü bir insana aittir. |
| "Teslimden sonra gelir biter." | Üç aylık gözden geçirmeyi danışman yürütür. Bu iş her çeyrekte tekrar eder. |
| "Müşteri verisinden ben sorumlu olurum." | Kayıt müşterinin kendi sitesinde durur. Danışman kendi hesabıyla çalışır. Roller sözleşmede yazar. |
| "Yöntemim kopyalanır." | Kaynaklarda bu korkuya bir cevap bulunmadı. Pilot görüşmelerinde bu korkuyu ölçün. |

### Sözleşmeye yazılacak maddeler

1. Yapay zekâ çıktısı karar desteğidir.
2. Kararı yalnız karar sahibi verir ve kaydeder.
3. Karar sahibinin toplantı takvimi pilotun parçasıdır.
4. Kurumun yapay zekâ seviyesi yazılır. ICP için iki seviyeyle başlayın: "Yapay zekâ kapalı" ve "AB bölgesi" (hipotez).
5. Danışmanın KVKK'daki rolü yazılır.

Üç madde ICP çalışmasından gelir ([ICP çalışması](<Hedef kitle ICP ve personalar.md>), bölüm 4.7 ve 6). Bu maddeler 1., 2. ve 4. maddelerdir.

### Hizmet fiyatı

Kaynaklarda doğrulanmış bir kurulum ücreti bulunmadı. Doğrulanmış bir ortak komisyonu da bulunmadı. Bu yüzden bu rapor fiyat önermez. Tek ölçü şudur: Sizin hizmet geliriniz toplam gelirin yaklaşık %15'ini geçmemeli. Bu sınır ikinci el bir ortanca değerdir ([Orb](https://www.withorb.com/blog/saas-growth-margin-statistics), arama özeti).

## 7. Önerileri ne değiştirir?

| Bu durum görülürse | Öneri şöyle değişir |
|---|---|
| Müşterilerin çoğunda iç stratej çıkar. | Başlangıç paketi isteğe bağlı olur. Kendi kendine kurulum öne çıkar. |
| Danışmanlar ürünü rakip görür. | Ortak programı küçülür. Toplantı yürütme işini sizin ekibiniz yapar. Hizmet payı hesabı yeniden yapılır. |
| Danışmanlar hızla müşteri getirir. | Ortak kanalı ilk gelir kaynağı olur. Çok müşterili danışman ekranı öne alınır. |
| Gözden geçirme ritmi pilotlarda kendiliğinden sürer. | Hatırlatma hizmeti küçülür. Bildirim modülü gereksiz kalır. |
| Ritim hizmete rağmen ölür. | Bildirim yedinci modül olarak eklenir. Etkin plan eşikleri yeniden ayarlanır. |
| Holding müşterisi gelir. İç içe şirketler ve planlar oluşur. | Dış yetki motoru yeniden düşünülür. |
| İlişki türü sayısı 10'u aşar (hipotez). | Dış yetki motoru yeniden düşünülür. |
| Birden çok servis aynı yetki kararını açıklamak zorunda kalır. | Dış yetki motoru yeniden düşünülür. |
| Frappe 16 testi farklı bir denetim sırası gösterir. | Kayıt denetimi ve paylaşım önlemi teste göre yeniden yazılır. |
| Mali işler müdürleri izin kuralına itiraz eder. | Kural değişmez. Satış anlatımı güçlenir. İzin serbest bütçeyi aşamaz. |

## Sonuç

Bu üründe asıl satılan şey bir ritimdir. Yazılım ritmin kaydını tutar. Ritmi ilk aylarda bir insan kurar. Bu yüzden hizmet bir ek gelir kalemi değildir. Hizmet, ritim alışkanlığa dönüşene kadar ürünün bir parçasıdır. Ritim yerleşince hizmet küçülmeli. Plan başına kullanım işaretleri bu anı gösterir.

Yetki modeli aynı ritmi kodla korur. Tek karar sahibi kuralı kararları güvenli kılar. Aynı kural planı tek bir kişiye bağlar. Bu yüzden vekil yerine zaman aralıklı yeni atama gerekir. Kullanımı plan başına ölçmek de ayrı bir kazanç sağlar. Bu ölçüm ürünü çalışan izleme aracına çevirmez. Böylece yapay zekâ kuralı ile aile şirketinin güveni aynı tasarımda korunur.

## Kaynaklar

### Ürün belgeleri

- [Bütünleşik geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md)
- [Süreç haritası](../docs/surec-haritasi.md)
- [Hedef kitle ICP ve personalar](<Hedef kitle ICP ve personalar.md>)
- [Yazılım, hizmet ve rol modeli araştırma notları](<../research_notes/Yazılım hizmet ve rol modeli/hizmet_ve_roller.md>)

### Strateji uygulama ve benimseme

- [Brightline, EIU anketi basın duyurusu](https://www.brightline.org/press/releases/companies-with-great-strategies-often-fall-short-on-execution-says-economist-intelligence-unit-survey/)
- [Brightline, EIU rapor sayfası](https://www.brightline.org/resources/eiu-report/)
- [PMI ve EIU, fayda gerçekleşmesi](https://www.pmi.org/learning/thought-leadership/series/benefits-realization/strengthening-benefits-awareness-csuite-eiu)
- [OKR Institute, OKR neden başarısız olur?](https://okrinstitute.org/why-okrs-fail/)
- [OKR Institute, yayılma rehberi](https://okrinstitute.org/okr-implementation-how-to-roll-out-okrs-across-departments/)
- [Serchen, OKR yazılımı alıcı rehberi](https://www.serchen.com/blog/okr-software-buyers-guide)
- [Mooncamp, Prosci aktarımı](https://mooncamp.com/glossary/change-adoption)

### Satıcılar ve hizmet paketleri

- [Cascade, ortaklar](https://www.cascade.app/partners)
- [Cascade, ortak olun](https://www.cascade.app/become-a-partner)
- [Cascade, ortak kaydı](https://www.cascade.app/partners/partner-registration)
- [Cascade, Vivid Strategies](https://www.cascade.app/cascade-partner/vivid-strategies)
- [Mooncamp, strateji planlama yazılımları](https://mooncamp.com/blog/strategic-planning-software)
- [Mooncamp, ClearPoint seçenekleri](https://mooncamp.com/blog/clearpoint-strategy-alternatives)
- [checkthat.ai, strateji planlama platformları](https://checkthat.ai/answers/what-are-the-best-strategic-planning-software-platforms)
- [WorkBoard Learn](https://learn.workboard.com/)
- [Tability, strateji yazılımları](https://www.tability.io/odt/articles/the-10-best-strategy-software-tools)

### Hizmet payı ve kâr marjı

- [Orb, SaaS brüt marj istatistikleri](https://www.withorb.com/blog/saas-growth-margin-statistics)
- [Seeto, KeyBanc 2025 anketi özeti](https://seeto.ai/blog/keybanc-saas-survey-2025-takeaways)

### Türkiye ve aile şirketleri

- [Forbes Türkiye, 4 Şubat 2026 Çarşamba günü](https://www.forbes.com.tr/dergi/kurucular-temkinli-ikinci-kusak-hizli-dijital-donusum-gerilim-yaratiyor)
- [erp-software.org, Türkiye](https://erp-software.org/en/erp-worldwide/turkey/)
- [Capital, "Her aileye bir anayasa"](https://www.capital.com.tr/yonetim/liderlik/her-aileye-bir-anayasa)
- [TKYD, Türkiye'de aile şirketleri için kurumsal yönetim](https://www.tkyd.org/wp-content/uploads/2022/12/TKYD_Turkiyede-Aile-Sirketleri-Icin-Kurumsal-Yonetim_01112021.pdf)
- [Karar, "Ailede birlik, şirkette süreklilik"](https://www.karar.com/yazarlar/rasit-yildirim/ailede-birlik-sirkette-sureklilik-1593619)

### Yetki modelleri ve Frappe

- [NIST SP 800-162, ABAC rehberi](https://csrc.nist.gov/pubs/sp/800/162/upd2/final)
- [OpenFGA, yetki kavramları](https://openfga.dev/docs/authorization-concepts)
- [USENIX, Zanzibar makalesi, 2019](https://www.usenix.org/conference/atc19/presentation/pang)
- [Cedar, terimler](https://docs.cedarpolicy.com/overview/terminology.html)
- [Frappe, kullanıcılar ve izinler](https://docs.frappe.io/framework/user/en/basics/users-and-permissions)
- [Frappe, hooks](https://docs.frappe.io/framework/user/en/python-api/hooks)
- [Frappe 16, permissions.py](https://raw.githubusercontent.com/frappe/frappe/version-16/frappe/permissions.py)

## Denetim notu

Gerçek okurla denenmedi. Rapor yalın Türkçe denetim betiğinden geçirildi. Tablo hücrelerinin bir kısmı kısa alan listesi olarak yazıldı. Kod bloklarında kodun kendi sözdizimi korundu. Kaynak adları ve bağlantılar özgün yazımıyla korundu. Rapordaki bütün sıklıklar, eşikler ve süreler hipotezdir. Hiçbir yetki kuralı çalışan bir Frappe 16 kurulumunda sınanmadı.
