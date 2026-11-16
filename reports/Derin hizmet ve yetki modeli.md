# Hizmeti ortağa verin, yetkiyi tek işlevde toplayın

Bu raporu Claude 16 Kasım 2026 Pazartesi günü yazdı. Rapor Karar Atlası için yazıldı. Karar Atlası, Türkiye çıkışlı bir strateji planlama yazılımıdır.

Rapor üç soruya cevap verir:

1. Yazılım tek başına yeter mi? Yanına hangi hizmet, ortaklık ve sertifika gelmeli?
2. Hangi roller hangi sıklıkla çalışmalı?
3. Yetki Frappe 16 üzerinde tam olarak nasıl kurulmalı?

Bu rapor "Yazılım hizmet ve rol modeli" raporunun yerini alır. Önceki raporda doğru kalan bilgiler buraya taşındı. Yanlış ya da eksik kalanlar düzeltildi.

## Kısa cevap

**Yazılım tek başına yetmez.** En güçlü kanıt rastgele denemeli bir danışmanlık araştırmasıdır. Dış yardım şirketlerin yönetim alışkanlığını değiştirdi. Ama yeni alışkanlıkların yaklaşık yarısı sonraki yıllarda bırakıldı. En sık iki neden vardı: yöneticinin ayrılması ve patronun zaman bulamaması ([NBER](https://www.nber.org/papers/w24249)). Karar Atlası'nda bu iki neden şuna denk gelir: karar sahibinin zamanı ve stratejin sürekliliği.

**Hizmet bir kerelik pilotla bitmemeli.** Önerimiz iki parçalıdır. Birinci parça yaklaşık 8 haftalık tek kararlı pilottur (hipotez). İkinci parça, pilottan sonra üç ayda bir yapılan ortak gözden geçirmesidir. Bu toplantıyı sertifikalı iş ortağı yürütür.

**Toplantı yürütme işini iş ortakları yapmalı.** Sizin hizmet geliriniz toplam gelirin yaklaşık yüzde 15'ini geçmemeli ([Orb](https://www.withorb.com/blog/saas-growth-margin-statistics), ikinci el). Türkiye'de KOBİ yazılımı çoğunlukla iş ortağıyla satılır. Logo 1.000'den fazla iş ortağıyla 230.000'den fazla müşteriye ulaşır ([Logo faaliyet raporu](https://cdn.logo.com.tr/Files/logocomtr/Uploads/Documents/Faaliyet-Raporu-31-Mart-2026.pdf)).

**Ortaklar iki düzeyli bir sertifika alır.** 1. düzey kısa bir kurs ve uygulamalı sınavdır. 2. düzey gerçek pilotlarla kanıtlanır. Kanıt, ürünün kendi kayıtlarından okunur. Sertifika yenilenir. Gözden geçirmeleri sürekli kaçan ortak listeden çıkar.

**Dört rol düzenli çalışmalı.** Karar sahibi her hafta inceleme kuyruğuna bakar. Karar sahibi her ay uygulama kararını kaydeder. Karar sahibi üç ayda bir "Seçim hâlâ doğru mu?" sorusunu cevaplar. Ekip üyeleri her hafta gözlem girer. Stratej hazırlık boyunca her hafta yazar. Karar sahibi değişince iş ortağı müşteriyi arar.

**Yetkiyi tek bir sunucu işlevi verir.** Frappe 16 kaynak kodu okundu. Bu okuma önceki tasarımda dört boşluk buldu:

1. Kayıt denetimi `None` dönerse Frappe 16 erişimi reddeder. Resmî belge bunun tersini söyler.
2. Belge paylaşımı, kayıt denetiminin reddini aşar. Paylaşılan kayıt listelere de girer.
3. OAuth erişim anahtarının kapsamı uçları daraltmaz. Anahtar, kullanıcının bütün yetkisini taşır.
4. İzni atlayan yazma, kayıt denetimini de atlar. Bu yüzden karar ucu yetki işlevini kendisi çağırmalı.

Bu boşlukların her biri için somut bir önlem bu raporda yazılıdır. Dış bir yetki motoru şimdilik gerekmez.

**Hiçbir yetki iddiası çalışan bir Frappe kurulumunda denenmedi.** Kod yalnız okundu. Her iddianın yanında onu kanıtlayacak test yazılıdır.

## Bu raporu nasıl okursunuz?

### Bilginin dört türü var

| İşaret | Anlamı |
|---|---|
| **Kanıt** | Kaynağı olan bilgi. Yanında kaynağın nasıl okunduğu yazar. |
| **Çıkarım** | Bizim yorumumuz. Kaynak bunu doğrudan söylemez. |
| **(hipotez)** | Pilotta sınanacak bir sayı ya da kural |
| **(satıcı)** | Kaynak, anlattığı ürünü ya da eğitimi satıyor. Bağımsız araştırma sayılmaz. |

### Kaynakların okunma düzeyi

| Düzey | Anlamı |
|---|---|
| Kod okundu | Frappe 16'nın kaynak kodu satır satır okundu. Kod çalıştırılmadı. |
| Tam okundu | Sayfanın ya da PDF'in tam metni okundu. |
| Arama özeti | Yalnız bir arama aracının özeti görüldü. Bu düzey daha zayıftır. |
| İkinci el | Bilgi asıl kaynaktan değil, onu aktaran bir yazıdan okundu. |

### Ürünün sabit kuralları

Rapor şu kurallara uyar:

1. Stratej yolu önerir ve gerekçesini kurar. Karar sahibi seçer ve kaydeder.
2. Bir planda aynı anda tek karar sahibi olur.
3. Kararlar yalnız sunucuda kesinleşir.
4. Yapay zekâ seçim yapmaz.
5. Yapay zekânın karar kayıt türlerinde yazma izni yoktur.
6. Yazılım çalışanı puanlamaz.

Stratej, stratejiyi geliştiren kişinin unvanıdır. Bu bir yazım hatası değildir.

### Ürünün bugünkü durumu

Canlı sürüm yalnız tarayıcıda çalışır. Sunucu sürümü tasarlandı ama yazılmadı. Yapay zekâ özelliği bugün üründe yoktur. Bu yüzden bu rapordaki yetki kuralları bir tasarımdır.

### Belge haritasındaki yeri

Bu rapor belge haritasında 4. çekmeceye girer. Çekmecenin adı "Teknik mimari"dir. Raporun durumu "Tek kaynak" olur. "Yazılım hizmet ve rol modeli" raporunun durumu "Tarihsel" olur. Belge haritası bu rapor yazılırken güncellenmedi.

## Önceki rapordan farklar

| Konu | Önceki rapor | Bu rapor |
|---|---|---|
| Hizmetin kanıtı | Anketler ve satıcı yazıları | Rastgele denemeli danışmanlık araştırması ve hakemli bir OKR vaka çalışması |
| Pilot sonrası | Hizmet küçülür. | Üç ayda bir ortak gözden geçirmesi sürer. |
| Üst yönetim desteği verisi | Yüzde 73 ile yüzde 29. İkinci el. | Bu rakam Prosci sayfasında bulunamadı. Rapordan çıkarıldı. |
| Destek saati | Hesaplanmadı. | Müşteri başarı ölçütleriyle karşılaştırıldı. |
| Sertifika | "Kısa olsun" dendi. | İki düzey, yenileme ve listeden çıkarma kuralı |
| Kamu desteği | Yalnız "kredi danışmanlığı kapsamıyor" dendi. | KOSGEB YÖNDE, Kapasite Geliştirme ve kalkınma ajansı yolları incelendi. |
| Frappe kaynağı | Bir özetleyici araçla okundu. | Kod v16.56.0 sürümünde satır satır okundu. |
| Kayıt denetimi | "Yalnız reddedebilir." | Doğru. Ama `None` da reddeder. Açık `True` gerekir. |
| Belge paylaşımı | "Doğrulanmadı." | Doğrulandı. Etkisi düşünülenden geniştir. |
| Cihaz iptali | "Anahtar dar yetkiye iner." | Frappe anahtarı daraltmaz. Uygulama her istekte cihazı denetler. |
| Frappe iş akışı | "Yalnız role bağlıdır." | Kısmen yanlış. Geçişe koşul yazılabilir. Yine de karar için kullanılmaz. |
| Dış yetki motoru | Dört gerekçeyle reddedildi. | Open edX örneği ve gömülü motorlar da karşılaştırıldı. |

## Terimler

| Terim | Anlamı |
|---|---|
| SaaS | İnternetten abonelikle kullanılan yazılım |
| KOBİ | Küçük ve orta ölçekli işletme |
| Pilot | Tek bir gerçek kararla yapılan sınırlı ve ücretli deneme |
| İş ortağı | Ürünü müşterisine öneren ve toplantıları yürüten bağımsız danışman |
| Rastgele denemeli araştırma | Şirketlerin kurayla iki gruba ayrıldığı araştırma. Yalnız bir grup yardım alır. Fark yardımın etkisini gösterir. |
| Müşteri başarı sorumlusu | Müşterinin ürünü kullanmasını takip eden satıcı çalışanı. İngilizce kısaltması CSM'dir. |
| Yıllık sözleşme değeri | Bir müşterinin bir yılda ödediği abonelik bedeli. İngilizce kısaltması ACV'dir. |
| İlk değere kadar geçen süre | Müşterinin üründen ilk somut faydayı aldığı ana kadar geçen süre |
| RBAC | Role dayalı yetki. İzin kişinin rolüne göre verilir. |
| ABAC | Özelliğe dayalı yetki. İzin kişinin, kaydın ve ortamın özelliklerine bakılarak verilir. |
| ReBAC | İlişkiye dayalı yetki. İzin kişi ile kayıt arasındaki ilişkiye göre verilir. |
| RACI | Her işte kimin ne yaptığını dört harfle gösteren tablo |
| Frappe | Ürünün arka yüzünü kuran hazır yazılım çatısı |
| Kurulum (bench) | Frappe'nin çalışan bir sunucu kurulumu. Frappe buna "bench" der. |
| Kayıt türü | Frappe'de bir kayıt çeşidi. Frappe'deki adı DocType'tır. |
| Kanca (hook) | Frappe'nin uygulamaya bıraktığı bir denetim yeri. Uygulama buraya kendi işlevini bağlar. |
| Kayıt denetimi | Tek bir kayıt açılırken çalışan kanca. Frappe'deki adı `has_permission`'dır. |
| Liste koşulu | Liste sorgusuna eklenen süzgeç. Frappe'deki adı `permission_query_conditions`'dır. |
| Rol izin satırı | Bir rolün bir kayıt türünde hangi işi yapabildiğini yazan satır. Frappe'deki adı DocPerm'dir. |
| Belge paylaşımı | Tek bir kaydı tek bir kişiye açan satır. Frappe'deki adı DocShare'dir. |
| Onaylanan kayıt | Taslak, onaylı ya da iptal durumunda olan kayıt. Onaydan sonra çoğu alan değişmez. |
| İzni atlayan yazma | Rol ve kayıt denetimini atlayan yazma. Frappe'de `ignore_permissions` bayrağıyla yapılır. |
| Yetki işlevi | Bütün yetki kararlarını veren tek sunucu işlevi. Bu rapordaki adı `yetki_ver`'dir. |
| Varsayılan ret | Hiçbir kural izin vermiyorsa cevabın "hayır" olması |
| OAuth | Uygulamanın kullanıcı adına erişim anahtarı almasını sağlayan standart giriş yolu |
| Kapsam (scope) | Bir erişim anahtarının hangi işlere izin verdiğini yazan etiket |
| MCP | Yapay zekâ araçlarının bir sunucuyu çağırdığı bağlantı yolu |
| UUID | Her cihazın kendi başına üretebildiği, tekrar etmeyen uzun kimlik |
| UUIDv5 | Bir ad ve sabit bir ad alanından hesaplanan UUID. Aynı girdi her zaman aynı kimliği verir. |
| Kalıcı bağlantı | Kodun belirli bir sürümünü gösteren bağlantı. Kod sonra değişse de bağlantı aynı satırı gösterir. |

## 1. Dış yardımla kurulan düzenin yarısı yıllar içinde bırakılıyor

### En güçlü kanıt: rastgele denemeli danışmanlık araştırması

**Kanıt.** Hindistan'daki dokuma şirketlerinde bir deneme yapıldı. Bazı fabrikalar ücretsiz ve yoğun yönetim danışmanlığı aldı. Fabrikalar kurayla seçildi. Araştırmacılar dokuz yıl sonra fabrikalara yeniden baktı ([NBER w24249](https://www.nber.org/papers/w24249), arama özeti).

Bulgular şunlardır:

1. **Getirilen yönetim alışkanlıklarının yaklaşık yarısı bırakılmıştı.**
2. Yardım alan fabrikalar yine de belirgin bir farkı korudu. Fark hem alışkanlıkta hem başarıda görüldü.
3. Alışkanlıklar şirket içinde yayıldı. Şirketler arasında nadiren yayıldı.
4. **Bırakmanın en sık iki nedeni yöneticinin ayrılması ve patronun zaman bulamamasıydı.**

Çalışma 2020'de hakemli bir dergide yayımlandı ([AEA](https://www.aeaweb.org/doi/10.1257/app.20180369)). Çalışmanın İngilizce kısa bir özeti de vardır ([VoxDev](https://www.voxdev.org/topic/firms/do-management-interventions-last-evidence-india)). Aynı yazarlar başka çalışmalara da değinir. Bu çalışmalarda küçük şirketler daha hafif danışmanlık aldı. Şirketler yeni alışkanlıkları üç yıl içinde yavaş yavaş bıraktı ([NBER PDF](https://www.nber.org/papers/w24249.pdf), arama özeti). Bu alıntılanan çalışmalar okunmadı.

**Çıkarım.** Bu kanıt "yazılım yetmez" sonucunu en güçlü biçimde destekler. Dış yardım davranışı değiştirir. Ama yardım çekilince değişim zayıflar. Karar Atlası'nda iki kırılma noktası vardır:

1. Karar sahibinin zamanı
2. Stratejin sürekliliği

### Hakemli bir OKR vaka çalışması ritmi gösteriyor

**Kanıt.** 2026'da hakemli bir dergide bir vaka çalışması yayımlandı ([Emerald, Journal of Business Strategy](https://www.emerald.com/jbs/article/47/1/52/1311605/Engaging-the-entire-organization-how-OKRs-enhance), tam okundu). OKR, hedef ve ölçülebilir sonuç yöntemidir. Çalışmanın ayrıntıları şunlardır:

| Konu | Bulgu |
|---|---|
| Şirket | Avrupa'da bir finans hizmetleri şirketi |
| Kapsam | 14 ürün ekibi, üç çeyreklik dönem, yani dokuz ay |
| Veri | Nisan 2023'te yapılan 11 görüşme |
| Destek | Ekiplerin içinde sertifikalı OKR uzmanları ve tutarlılığı koruyan bir sorumlu |
| Ritim | Çeyrek başında planlama. Her hafta yaklaşık 15 dakikalık kontrol. Kontrol mevcut ekip toplantısının içinde yapılır. Çeyrek sonunda resmî gözden geçirme. |
| Tipik hata | Ekipler hedefi yazar ve çeyrek boyunca unutur. |

Örneklem küçüktür. Görüşülenlerin çoğu OKR'yi uygulayan kişilerdir. Yazar liderliğin etkisini ölçmedi.

Büyük bir uluslararası bankanın OKR geçişi de incelendi. Bankada sonuç puanları çalışan değerlendirmesinde kullanılmadı. Bunun yerine her ay bir performans konuşması yapıldı ([ResearchGate](https://www.researchgate.net/publication/404289086_Evaluating_a_large_international_bank's_OKR_rollout_using_universal_deployment_parameters), arama özeti).

**Çıkarım.** Karar Atlası için uygun ritim şudur:

1. Ekip üyesi her hafta gözlem girer. Bu iş mevcut bir toplantının içinde yapılır.
2. Karar sahibi her ay uygulama kararını kaydeder.
3. Karar sahibi üç ayda bir 3.5 gözden geçirmesini kaydeder.

Bankanın örneği ürünün bir kuralını da destekler. Yazılım çalışanı puanlamaz.

### Üst yönetim desteği verisi satıcıdan geliyor

**Kanıt (satıcı).** Prosci değişim yönetimi eğitimi satar. Prosci kendi araştırmasını yayımlar ([Prosci, sponsorun rolü](https://www.prosci.com/resources/articles/primary-sponsors-role-and-importance), [Prosci, en iyi uygulamalar](https://www.prosci.com/resources/articles/change-management-best-practices), arama özeti):

1. Çok etkili bir sponsoru olan projeler hedefini daha sık tutturdu. Oran, çok etkisiz sponsorlu projelerin iki katından fazlaydı.
2. Katılımcıların yalnız yüzde 48'i sponsorunu etkili buldu.
3. En çok anılan sponsor davranışı "etkin ve görünür katılım"dı.
4. Yapılandırılmış yöntem kullananların yüzde 59'u iyi sonuç aldı. Kullanmayanlarda oran yüzde 26'ydı.

Sponsor, işi üst yönetimde sahiplenen kişidir. Prosci'nin örneklemi ve baskısı görülmedi.

**Düzeltme.** Önceki rapor "yüzde 73 ile yüzde 29" rakamını kullandı. Bu rakam bir OKR satıcısının sayfasından ikinci elden okunmuştu. Rakam bu araştırmada bir Prosci sayfasında bulunamadı. Bu yüzden rakam bu rapordan çıkarıldı.

### Kolaylaştırıcının etkisi başka alanlarda karışık

**Kanıt.** Sağlık alanında uygulamayı kolaylaştıran kişi de denendi. Bir çalışmada kolaylaştırıcı ulusal teknik desteğe eklendi ([PMC4551776](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4551776/), arama özeti). FIRE adlı denemede kolaylaştırıcının belirgin bir etkisi bulunmadı ([PMC6238352](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6238352/), arama özeti). Bu sonuçlar başka bir alandandır.

**Çıkarım.** Kolaylaştırıcı her durumda işe yaramaz. Bu yüzden ortak hizmeti ölçülerek sınanmalı.

### Büyük şirket anketleri aynı yönü gösteriyor

**Kanıt.** EIU 2017'de 500 üst yöneticiyle bir anket yaptı. Şirketler stratejik hedeflerinin ortalama yüzde 20'sini kötü uygulama yüzünden tutturamıyor. Yöneticilerin yüzde 59'u strateji ile günlük iş arasında köprü kurmakta zorlanıyor ([Brightline](https://www.brightline.org/press/releases/companies-with-great-strategies-often-fall-short-on-execution-says-economist-intelligence-unit-survey/), arama özeti). PMI ve EIU 2016'da da bir anket yaptı. Strateji için önemli projelerin yalnız yüzde 61'i beklenen faydayı verdi ([PMI](https://www.pmi.org/learning/thought-leadership/series/benefits-realization/strengthening-benefits-awareness-csuite-eiu), arama özeti). İki anket de büyük şirketlerle yapıldı.

### Eksik kanıt

1. "Yalnız yazılım" ile "yazılım ve kolaylaştırıcı" yollarını karşılaştıran bir çalışma bulunmadı.
2. Meksika'daki KOBİ danışmanlık denemesi bu araştırmada okunmadı. Bu deneme konuyla ilgilidir. Atıf yapmadan önce okunmalı.
3. Türkiye'de strateji ya da OKR yazılımı kullanımına dair veri bulunmadı.

### Aile şirketi yazılımın veremediği üç hizmeti ister

**Kanıt.** Türkçe kaynaklar aile anayasasını dış danışmanla hazırlamayı önerir. Aile anayasası, aile üyelerinin şirketle ilişkisini düzenleyen kurallardır. Anlaşmazlıkta tarafsız bir danışman destek verebilir ([Capital](https://www.capital.com.tr/yonetim/liderlik/her-aileye-bir-anayasa), [TKYD](https://www.tkyd.org/wp-content/uploads/2022/12/TKYD_Turkiyede-Aile-Sirketleri-Icin-Kurumsal-Yonetim_01112021.pdf), arama özeti). 601 KOBİ yöneticisiyle bir araştırma yapıldı. Dijital dönüşümü en çok kuşaklar arası gerilim yavaşlatıyor ([Forbes Türkiye, 4 Şubat 2026 Çarşamba günü](https://www.forbes.com.tr/dergi/kurucular-temkinli-ikinci-kusak-hizli-dijital-donusum-gerilim-yaratiyor)).

**Çıkarım.** Aile şirketi şu üç hizmete ihtiyaç duyar:

1. Tarafsız bir kişi 2.4 "Seçim ve vazgeçiş" toplantısını yönetir. Karar sahibi bu toplantıda aile önünde seçer.
2. Tarafsız bir kişi ikinci görüş verir. Ürün bu görevi "Danışman" rolüyle tanımlar.
3. Bir kişi üç ayda bir gözden geçirmeyi takvime koyar ve yürütür.

Tek karar sahibi kuralı bir satış gücüdür. Aynı kural kurucu kuşak için bir korkudur. Bu gerilimi odadaki bir insan yönetir. Yazılım bu gerilimi yönetemez.

### Ürün başarı koşullarını taşıyor, ama boş kalabilir

| Başarı koşulu | Üründeki karşılığı | Boş kalırsa ne olur? |
|---|---|---|
| Üst yönetimin görünür desteği | Planın tek karar sahibi | Kararlar kaydedilmez. Plan durur. |
| Düzenli kontrol | 3.5 "Seçim hâlâ doğru mu?" gözden geçirmesi | Hedef yazılır ve unutulur. |
| İşi yürüten ayrı bir kişi | Stratej | Plan strateji oluşturmaya geçemez. |

**Çıkarım.** Asıl risk eksik bir özellik değildir. Birinci risk, stratej rolünün boş kalmasıdır. İkinci risk, gözden geçirme ritminin zamanla ölmesidir. Hizmet modeli bu iki riski kapatmak için kurulur.

## 2. Hizmet modeli: pilotla başlayın, üç ayda bir ortakla sürdürün

### Satıcılar hizmeti ayrı ve adlı ürün olarak satıyor

**Kanıt.** Strateji yazılımı satıcıları hizmeti farklı biçimlerde paketler. Çoğu kurulum ücretini ve ortak komisyonunu yayımlamaz.

| Satıcı | Hizmet biçimi | Kaynak ve okunma düzeyi |
|---|---|---|
| StrategyFrame, Almanya | Yaklaşık 100 orta ölçekli şirket kullanıyor. Yaklaşık yüzde 40'ı yalnız temel aboneliği alıyor. Geri kalanı altı aylık koçluk programı da alıyor. Program en çok iki çalıştay ve ayda en çok üç gün içeriyor. | [The Innovator](https://theinnovator.news/?p=11868), tam okundu. Bilgi kurucudan geliyor. Fiyat yok. |
| WorkBoard | OKR koç sertifikası 599 dolar. 2. düzey sertifika, en az iki çeyreklik dönem koçluk yapmış kişiler içindir. | [WorkBoard sertifika](https://learn.workboard.com/page/okr-coach-certification), [2. düzey](https://learn.workboard.com/page/advanced-okr-coach-certification), arama özeti (satıcı) |
| Cascade | Dört ortak türü: strateji danışmanlığı, teknoloji sağlayıcı, eğitim kurumu ve bağımsız danışman. Düzey, komisyon ve sertifika kuralı yayımlanmıyor. | [Cascade ortaklar](https://www.cascade.app/partners), tam okundu (satıcı) |
| Spider Impact | Ortaklara eğitim, tanıtım araçları ve deneme ortamı. Kurulum yardımı üç düzeyde. | [Spider ortaklar](https://www.spiderstrategies.com/partners), arama özeti (satıcı) |
| ClearPoint | 30 dakikalık teklif görüşmesi, birebir eğitim ve tam kurulum seçeneği | [ClearPoint fiyat](https://clearpointstrategy.com/pricing), arama özeti (satıcı) |
| AchieveIt | 90 günlük "Results90" paketinin sayfası 16 Kasım 2026 Pazartesi günü açılmadı. | Satıcı doğrulamadı. |

**Çıkarım.** Karar Atlası'na en yakın örnek StrategyFrame'dir. StrategyFrame de orta ölçekli şirkete strateji kurdurur. Alıcıların çoğu insan desteği için ayrıca ödüyor. Bu oran kurucunun beyanıdır. Bağımsız bir ölçüm değildir.

**Çıkarım.** StrategyFrame'in koçluğu 8 haftalık pilottan yoğundur. Karar Atlası daha hafif ama daha uzun bir düzen önerir. Bu düzen pilot ve ardından gelen üç aylık ortak gözden geçirmesidir.

### Teklifin beş katmanı

| Katman | Kime? | Kim verir? | İçerik |
|---|---|---|---|
| Ürün aboneliği | Bütün müşteriler | Siz | Yazılım, gece güncellemeleri ve güvenlik |
| Başlangıç paketi, yani pilot | İlk kez alan aile şirketi | Sertifikalı iş ortağı ya da siz | Tek kararlı pilot. Yaklaşık 8 hafta ve 2 ile 5 ekip üyesi (hipotez). Üç sabit çıktı. |
| Üç aylık ortak gözden geçirmesi | Pilotu bitiren müşteri | Sertifikalı iş ortağı | Her çeyrekte bir 3.5 toplantısı. Karar sahibi değişince ek görüşme. |
| İş ortağı programı | Strateji ve aile şirketi danışmanları, mali müşavirler | Siz eğitirsiniz. Ortak işi yürütür. | Sertifika, şablonlar ve ücretsiz çok müşterili danışman ekranı |
| Kendi kendine kullanım | Tek kurucu ve küçük ekip | Müşteri | Tarayıcı sürümü. İkinci görüş için plana danışman ekleme. |

Pilotun üç sabit çıktısı şunlardır:

1. Geçiş kararı
2. Strateje devir raporu
3. Onaylanmış strateji belgesi

Fiyatlar "Gelir modeli ve birim ekonomisi" raporundan gelir. O rapor Karar paketini ayda 15.000 TL varsaydı. Kurulum paketini bir kerelik 50.000 TL varsaydı. İki sayı da sınanmamış varsayımdır.

### Pilot adım adım

Pilotun adımları şunlardır:

1. Kurum yöneticisi kullanıcıları ekler.
2. Karar sahibi stratej, ekip üyeleri ve gerekirse danışmanı plana ekler.
3. Karar sahibi toplantı takvimini sözleşmeye yazar.
4. Stratej ve ekip hazırlık adımlarını haftalık toplantılarda doldurur.
5. Karar sahibi devir raporunu okur ve geçiş kararını kaydeder.
6. Stratej yolları önerir ve gerekçesini kurar.
7. İş ortağı 2.4 seçim toplantısını yönetir.
8. Karar sahibi yolu seçer ve strateji belgesini onaylar.

Pilot 8. adımla biter. Yayılma şu adımlarla başlar:

1. Karar sahibi ilk kaynak iznini açar.
2. Ekip ilk gözlemi girer.
3. Karar sahibi ilk gözden geçirme kaydını açar.

İlk gözden geçirme kaydı yayılmanın kanıtıdır.

**Bağımlılık.** Çok kullanıcılı pilot sunucu sürümünü gerektirir. Bu sürüm hazır değilse tek cihazlı bir ön pilot yapın. Bu ön pilotta stratej ve karar sahibi tarayıcı sürümünü birlikte kullanır. Ekip üyeleri ön pilotta yer almaz.

### "İlk değer" bir giriş değil, ilk kayıtlı karardır

**Kanıt.** Bir yatırımcı müşteri başarısı rehberi yazdı. Rehber ilk değer için 30 günün altını hedef gösterir ([Tomasz Tunguz](https://tomtunguz.com/customer-success-guide/index.md), arama özeti). Blog yazıları orta ölçekli müşteride başlangıç süresini 30 ile 60 gün verir ([Rework](https://resources.rework.com/libraries/post-sale-management/onboarding-metrics), arama özeti). Kendi kendine kurulan araçlarda ortalama 1,5 gün aktarılır ([shno.co](https://www.shno.co/marketing-statistics/saas-onboarding-statistics), ikinci el).

**Çıkarım.** 1,5 günlük ölçü bu ürüne uymaz. Bu ürün kolaylaştırılan bir karar sürecidir. Doğru karşılaştırma 30 ile 60 günlük başlangıç süresidir. Karar Atlası'nda ilk değer, karar sahibinin ilk kayıtlı kararıdır. Örneğin Karar 1 ya da geçiş kararı. Hedef, ilk kararın 30 gün içinde kaydedilmesidir (hipotez). Bu hedef 8 haftalık pilotun içine sığar.

Türk strateji danışmanlarının sayfaları da benzer süre verir. Bir sayfa çok aşamalı bir iş anlatır. Bu işte çalıştay 1 ile 2 gün sürer ([MirAdvisory](https://miradvisory.com/tr/hizmetler/strateji), tam okundu, satıcı). Başka sayfalar 4 ile 8 haftalık program verir ([Süreç Danışmanlık](https://www.surec.com.tr/stratejik-planlama-calistayi), [Natus](https://natusdanismanlik.com/hizmetler/alt-sistem-kurulum-iyilestirme-hizmetleri/stratejik-planlama-calistayi-organizasyonu/), arama özeti, satıcı). Hangi sayfanın hangi rakamı verdiği doğrulanmadı.

**Çıkarım.** 8 haftalık pilot, Türk danışmanların anlattığı işin ilk parçasına benzer. Bu yüzden müşteriye şöyle anlatılabilir: "Strateji işinin ilk bölümü, yazılımla birlikte."

### Pilot bitince ritim üç ayda bir ortakla sürer

**Çıkarım.** Danışmanlık araştırması iki şey gösterdi. Yardım çekilince alışkanlık zayıflıyor. En sık neden yöneticinin ayrılması. Bu yüzden insan desteği 8. haftada tamamen bitmemeli. Önerimiz şudur:

1. İş ortağı her çeyrekte bir 3.5 toplantısını yürütür.
2. Karar sahibi bu toplantıda "Seçim hâlâ doğru mu?" sorusunu cevaplar ve kaydeder.
3. Karar sahibi değişirse iş ortağı müşteriyi arar.
4. Plan sağlığı işaretleri kötüleşirse iş ortağı müşteriyi arar.

Bu toplantı ortağa her çeyrekte tekrar eden bir iş verir. Danışmanın "teslimden sonra gelir biter" korkusu böylece cevap bulur. Ortak gözden geçirmesinin yenilemeyi artırdığını gösteren bir çalışma bulunmadı. Bu yüzden düzen pilotlarda ölçülmeli.

### Destek saati müşteri başarısı ölçütlerinin iki katı

**Kanıt (satıcı).** Gainsight, müşteri başarısı yazılımı satan bir şirkettir. Gainsight kendi müşterilerinin verisini yayımladı ([Gainsight, 29 Temmuz 2022 Cuma günü](https://www.gainsight.com/blog/gainsight-horizon-ai-labs-what-is-the-right-csm-to-customer-ratio/), tam okundu):

| Müşteri bandı | Yıllık sözleşme değeri | Bir müşteri başarı sorumlusunun müşteri sayısı |
|---|---|---|
| Yüksek temas | 100.000 doların üstü | Yaklaşık 22 |
| Orta temas | 10.000 ile 100.000 dolar | Yaklaşık 49 |
| Düşük temas | 10.000 doların altı | Yaklaşık 144 |

Aynı veri 17.034 sorumluya dayanır. Bir sorumlunun yönettiği yıllık gelirin ortancası 1,4 milyon dolardır. Yazı bu oranları müşteri kaybıyla ilişkilendirmez.

**Hesap.** "Gelir modeli ve birim ekonomisi" raporu temel fiyatı ayda 300 dolar varsaydı. Bu, yılda yaklaşık 3.600 dolar eder. Bu tutar düşük temas bandındadır. Aynı rapor müşteri başına ayda 2 saat destek varsaydı. Bir kişinin ayda yaklaşık 140 verimli saati olduğunu varsayalım. Bu varsayımdır. O zaman bir kişi yaklaşık 70 müşteriye bakar. Düşük temas ölçütü ise 144 müşteridir.

**Çıkarım.** 2 saatlik destek, düşük temas ölçütünün yaklaşık iki katı emek ister. Önerimiz şudur:

1. Pilot süresince 2 saat ve daha fazlası kalsın. Bu saati kurulum ücreti karşılar.
2. Pilottan sonra sizin desteğiniz ayda yaklaşık 1 saate insin (hipotez).
3. Toplantı yürütme ve el tutma işini iş ortağı yapsın.
4. Her destek saati müşteri adına kaydedilsin. Gerçek saat ilk 5 pilotta ölçülsün.

Gelir modeli raporunun iyimser senaryosu da 1 saati kullanır. Bu öneri o raporla çelişmez.

### Hizmet payınız küçük kalmalı

**Kanıt.** İkinci el bir kaynak Benchmarkit verisini aktarır. Ortanca B2B SaaS şirketinde hizmet, gelirin yaklaşık yüzde 15'idir. B2B, şirketlere satış yapan şirket demektir. Hizmetin brüt kâr marjı yaklaşık yüzde 30'dur. Aboneliğin brüt kâr marjı yaklaşık yüzde 81'dir ([Orb](https://www.withorb.com/blog/saas-growth-margin-statistics), arama özeti). Asıl rapor okunmadı.

**Çıkarım.** Toplantı yürütme işini çoğunlukla iş ortakları yapmalı. Ortağın danışmanlık geliri sizin marjınızı düşürmez. Sizin maliyetiniz ortak eğitimi, şablonlar ve sertifikadır.

## 3. İş ortağı programı: Türkiye'de yazılım ortakla satılıyor

### Türk yazılım şirketleri ortakla büyüyor

| Şirket | Ortak modeli | Kaynak ve okunma düzeyi |
|---|---|---|
| Logo | 1.000'den fazla iş ortağı. 230.000'den fazla müşteri. Abonelik fiyatına geçiş anlatılıyor. | [Logo faaliyet raporu, 31 Mart 2026 Salı günü](https://cdn.logo.com.tr/Files/logocomtr/Uploads/Documents/Faaliyet-Raporu-31-Mart-2026.pdf), tam okundu |
| Paraşüt | Mali müşavire ücretsiz araç verir. "Atlas Aktarım" ücretsiz büro ve müşteri yönetim programıdır. "ExpressAktarım" faturaları muhasebe programına aktarır. Komisyon ya da düzey yazılmıyor. | [Paraşüt mali müşavir kanalı](https://www.parasut.com/mali-musavir-kanali), tam okundu (satıcı) |
| Microsoft | 2025 mali yılında ortak teşviklerinin yaklaşık yüzde 70'i KOBİ'ye hizmet veren ortaklara gitti. | [Microsoft ortak blogu](https://partner.microsoft.com/tr-tr/blog/article/accelerating-growth-through-partners-in-the-era-of-ai), arama özeti (satıcı) |
| SAP | Dünyada 25.900 ortak. Türkiye'de 120 şirket SAP bulut ERP kullanıyordu. Bilgi Mayıs 2024 tarihlidir. | [SAP Türkiye haberi](https://news.sap.com/turkey/2024/05/sap-turkiye-ve-is-ortaklari-turkiyenin-teknolojideki-dinamizmini-ve-gelecek-vizyonunu-masaya-yatirdi/), arama özeti (satıcı) |

**Çelişki.** Logo'nun 31 Mart 2025 Pazartesi günkü raporu 800'den fazla ortak diyordu ([Logo, 2025](https://cdn.logo.com.tr/files/logocomtr/Uploads/Documents/Faaliyet_Raporu_31_Mart_2025.pdf), arama özeti). Logo bir etki çalışması da ısmarladı. Bu çalışma 1.000'den fazla ortak ve yaklaşık 200.000 şirket der ([Logo etki analizi](https://cdn.logo.com.tr/files/logocomtr/Uploads/Documents/Logo-Yazilim-40-Yil-Ekonomik-Etki-Analizi-060325.pdf), arama özeti). Fark tanımdan ya da tarihten gelebilir.

**Eksik kanıt.** Hiçbir Türk yazılım şirketi ortak marjını yayımlamıyor. Türk KOBİ'lerinin telefon, yerinde ya da mesajla destek beklentisini ölçen bağımsız bir anket de bulunmadı.

**Çıkarım.** Logo'da ortak başına yaklaşık 230 müşteri düşer. Türk KOBİ'si yazılımı ve desteği çoğu zaman yerel bir ortaktan almaya alışkındır. Bu durum pilotun ortak eliyle verilmesini destekler.

**Çıkarım.** İlk şablon olarak Paraşüt modeli daha uygundur. Paraşüt, etkileyen kişiye işini kolaylaştıran ücretsiz bir araç verir. Karar Atlası'nda bu araç çok müşterili danışman ekranıdır. Bu ekran sertifikalı ortağa ücretsiz verilir. Komisyon sonra gelebilir.

**Çıkarım.** Mali müşavir ikinci bir kanal olabilir. Mali müşavir plana "Danışman" rolüyle girer. "Strateji ekibi ve kabul ölçütleri" raporu da dış mali müşaviri "Danışman" olarak yazar.

### İlk yıl yalnız yönlendirme ortaklığı

**Çıkarım.** İlk yıl yalnız yönlendirme ortaklığıyla başlayın. Yönlendirme ortağı müşteriyi getirir ve işi yürütür. Faturayı siz kesersiniz. Yeniden satış, faturalama ve sözleşme işini büyütür.

"Gelir modeli ve birim ekonomisi" raporu ortak komisyonunu yüzde 20 varsaydı. Hiçbir satıcının komisyonu doğrulanmadı. Bu yüzden komisyon da sınanmamış bir varsayımdır.

### Güvenilir sertifikalar dört şeyi birleştiriyor

**Kanıt.** İncelenen sertifikalar eğitim, uygulama kanıtı, değerlendirme ve yenilemeyi birleştirir.

| Sertifika | Ne ister? | Kaynak ve okunma düzeyi |
|---|---|---|
| IAF Sertifikalı Profesyonel Kolaylaştırıcı | Son 3 yılda en az 7 çalıştay. Yetkinlik kanıtı. İki aşamalı akran değerlendirmesi: önce yazılı başvuru, sonra canlı değerlendirme günü. Ücret ve geçerlilik süresi sayfalar arasında çelişiyor. | [IAF ücret kuralları](https://iaf-world.org/iaf-certification-fee-policies/), [IAF ücret listesi, 12 Mart 2026 Perşembe günü](https://iaf-world.org/pd-fees-list-and-policy-20260312/), arama özeti |
| Balanced Scorecard Institute Profesyonel | 5 günlük program. 3 günlük kurs 2.700 dolar. 2 günlük kurs 1.800 dolar. | [BSI](https://balancedscorecard.org/training-certification/balanced-scorecard-professional-certification), arama özeti (satıcı) |
| WorkBoard OKR koçu | 599 dolar. 2 gün ya da 2 yarım gün. 2. düzey için en az 2 çeyreklik dönem koçluk. | [WorkBoard](https://learn.workboard.com/page/okr-coach-certification), arama özeti (satıcı) |
| KOSGEB YÖNDE danışmanı | Dijital dönüşüm yol haritasını yalnız TÜSSİDE sertifikalı danışman yapar. İş bir portalda kaydedilir. KOSGEB yalın üretim danışmanlarını denetler. Veri tabanından çıkarılan sağlayıcı 5 yıl dışarıda kalır. | [KOSGEB YÖNDE yönergesi](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/YONDE/2026/2026.07.14/Y%C3%96NDE-Y%C3%B6nderlikveDe%C4%9FerlendirmeDestekProgram%C4%B1Y%C3%B6nergesi05.07.26.pdf), tam okundu |

TÜSSİDE, Türkiye Sanayi Sevk ve İdare Enstitüsü'dür. KOSGEB modeli Türkiye'deki en yakın örnektir. Bu modelde sertifika, kayıtlı iş, denetim ve listeden çıkarma birlikte durur.

**Eksik kanıt.** Sertifikalı kolaylaştırıcının daha iyi sonuç aldığını gösteren bir çalışma bulunmadı. Türkiye'de kolaylaştırıcı sertifikası fiyatı araştırılmadı.

### Önerilen sertifika: iki düzey, yenileme ve listeden çıkarma

**Çıkarım.** Aşağıdaki program WorkBoard, IAF ve KOSGEB örneklerinden türetildi. Süreler ve sayılar hipotezdir.

| Basamak | Kime? | Ne ister? | Kanıtı kim denetler? |
|---|---|---|---|
| Danışman tanışma eğitimi | Mali müşavir ve ikinci görüş veren danışman | Kısa çevrim içi eğitim. Ürün kuralları ve KVKK rolleri. Sınav yok. | Siz. Eğitim kaydı yeter. |
| 1. düzey: Sertifikalı Stratej | Pilot yürütecek danışman | Yaklaşık 2 gün ya da 4 yarım gün eğitim. Örnek bir planı geçiş kararına kadar yürüten uygulamalı sınav. | Sizin eğitmeniniz |
| 2. düzey: Kıdemli Stratej | 1. düzeyi geçen ve pilot yürüten danışman | En az 2 tamamlanmış pilot. Her pilotta üç çıktı kayıtlı. En az 2 zamanında yapılmış 3.5 toplantısı. Bir 2.4 toplantısının gözlemi. | Ürün kayıtları ve sizin gözlemciniz |
| Yenileme | Her iki düzey | Her bir ya da iki yılda bir. Etkin plan şartı. | Ürün kayıtları |
| Listeden çıkarma | Her iki düzey | Ortağın planlarında gözden geçirmeler sürekli kaçarsa ortak dizinden çıkar. | Siz. Ortağa önce yazılı uyarı verilir. |

Birinci düzeyin eğitimi şu konuları öğretir:

1. Stratej yolu önerir ve gerekçesini kurar. Karar sahibi seçer ve kaydeder.
2. Yapay zekâ seçim yapmaz ve karar kaydetmez.
3. Yazılım çalışanı puanlamaz.
4. 2.4 seçim toplantısı nasıl yürütülür?
5. KVKK'da ortağın rolü nedir?
6. Pilotun üç çıktısı nasıl üretilir?

KVKK, Kişisel Verilerin Korunması Kanunu'dur.

**Çıkarım.** Uygulama kanıtı ortağın beyanından gelmez. Kanıt ürün kayıtlarından okunur. Örneğin gözden geçirmenin tarihi ve sonraki kontrol tarihi. Bu yöntem IAF'nin kendi beyanına dayanan dosyasından daha güçlüdür.

**Sınır.** Siz müşteri sitesindeki plan içeriğini okumamalısınız. Ortak denetimi için yalnız tarih ve sayı gibi içeriksiz bilgiler gerekir. Örneğin "3.5 kaydı zamanında yapıldı mı?" sorusunun cevabı. Bu bilginin size aktarılması müşteri sözleşmesine yazılmalı. Bu konu hukuk incelemesinden geçmeli.

**Fiyat çapası.** Yabancı örneklerde kurs fiyatı 599 dolar ile 2.700 dolar arasındadır. Türkiye fiyatı araştırılmadı. Bu yüzden rapor sertifika fiyatı önermez.

### Programın danışman korkularına cevabı

Danışmanların korkuları depodaki persona çalışmasında yazılıdır ([Hedef kitle ICP ve personalar](<Hedef kitle ICP ve personalar.md>), bölüm 5.7).

| Danışmanın korkusu | Programın cevabı |
|---|---|
| "Yazılım benim yerimi alır." | Yazılım yol seçmez. Stratej rolü bir insana aittir. |
| "Teslimden sonra gelir biter." | Üç aylık gözden geçirmeyi ortak yürütür. Bu iş her çeyrekte tekrar eder. |
| "Müşteri verisinden ben sorumlu olurum." | Kayıt müşterinin kendi sitesinde durur. Ortak kendi hesabıyla çalışır. Roller sözleşmede yazar. |
| "Müşteri beni yapay zekâyla atlar." | Yapay zekâ karar kaydetmez. 2.4 toplantısını bir insan yürütür. |
| "Yöntemim kopyalanır." | Kaynaklarda bu korkuya bir cevap bulunmadı. Pilot görüşmelerinde ölçün. |

## 4. Kamu destekleri pilotun bedelini dolaylı yoldan karşılayabilir

### Üç destek yolu

| Yol | Ne destekler? | Karar Atlası için anlamı | Kaynak ve okunma düzeyi |
|---|---|---|---|
| KOSGEB YÖNDE, 3. revizyon, 5 Temmuz 2026 Pazar günü | Üç hizmet: dijital dönüşüm yol haritası, sürdürülebilirlik raporu, yalın olgunluk değerlendirmesi. Geri ödemesiz destek oranı yüzde 80. Program üst sınırı 36 ayda 280.000 TL. Yol haritası hizmet başına 20.000 TL, programda 40.000 TL. Yalnız danışman ücreti desteklenir. | Strateji ya da kurumsallaşma danışmanlığı için ayrı satır yok. 20.000 TL, devletin kısa ve sertifikalı bir teşhis işine biçtiği değeri gösterir. | [KOSGEB YÖNDE yönergesi](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/YONDE/2026/2026.07.14/Y%C3%96NDE-Y%C3%B6nderlikveDe%C4%9FerlendirmeDestekProgram%C4%B1Y%C3%B6nergesi05.07.26.pdf), tam okundu |
| KOSGEB Kapasite Geliştirme, 2026 ikinci çağrı | Firma başına 1 milyon ile 20 milyon TL kredi. Savunma, havacılık ve uzay tedarikçisinde 30 milyon TL. 24 aylık proje, 36 aya kadar vade. Uygun giderler arasında yazılım, danışmanlık, eğitim ve mentorluk var. Ağırlıklı sektörler imalat ve bilişim hizmetleridir. Şirket hızlı büyüyen KOBİ olmalı. | Uygun sektördeki şirket aboneliği ve pilotu bir büyüme projesine koyabilir. Bu yol yalnız uygun sektörde çalışır. | [CNBC-e, 6 Haziran 2026 Cumartesi günü](https://www.cnbce.com/is-dunyasi/kosgeb-destek-programinda-ikinci-donem-basvurulari-basladi-ust-limit-30-milyon-liraya-yukseltildi-h31165), tam okundu. Resmî çağrı metni değil, haberdir. |
| Kalkınma ajansı teknik desteği | Sınırlar ajansa göre değişir. Örneğin OKA 2026'da 400.000 TL'ye kadar danışmanlık. Ankara Kalkınma Ajansı bir programda 500.000 TL'ye kadar danışmanlık. | Destek çoğunlukla oda ve dernek gibi kurumlara gider. Oda destekli bir şirket grubu olası bir kanaldır. | [OKA](https://oka.gov.tr/assets/upload/dosyalar/tr83-26-td-tur_-basvuru-rehberi.pdf), [Ankara KA](https://ankaraka.org.tr/sites/default/files/article-documents/2026_aka_ankarasaglikturizm-1.pdf), [FKA](https://fka.gov.tr/sharepoint/userfiles/Icerik_Dosya_Ekleri/2026_TD_Basvuru_Rehberi/2026_TD_Başvuru_Rehberi.pdf), arama özeti |

Kapasite Geliştirme programı 2025'te 3.395 KOBİ'yi finanse etti. Toplam tutar 54,7 milyar TL'dir ([CNBC-e](https://www.cnbce.com/is-dunyasi/kosgeb-destek-programinda-ikinci-donem-basvurulari-basladi-ust-limit-30-milyon-liraya-yukseltildi-h31165)).

Bir oda örneği de vardır. Samsun Ticaret ve Sanayi Odası 30 şirket için danışmanlık satın aldı. İş en çok 6 ay sürecek. Çıktılar analiz, çalıştay ve yol haritasıdır ([Son Dakika](https://sondakika.com/ekonomi/haber-samsun-tso-30-firmanin-yapay-zeka-destekli-ikiz-do-20420051), arama özeti).

KOSGEB dijital dönüşüm kredisi danışmanlığı kapsamıyor ([erp-software.org](https://erp-software.org/en/erp-worldwide/turkey/)).

### Kamu desteğinden ne çıkar?

**Çıkarım.** Pilotun fiyatı 20.000 TL'lik YÖNDE değerinden çok yüksek olabilir. O zaman KOBİ pilotu "desteklenebilir teşhis" diye görmez. Bu bir fiyat önerisi değildir. Yalnız alıcının kafasındaki karşılaştırmayı gösterir.

**Çıkarım.** Kalkınma ajansı desteği en çok oda ve dernek üzerinden işe yarar. Örnek bir kanal şöyle çalışır:

1. Bir oda 10 ile 30 üye aile şirketini bir gruba toplar.
2. Oda kalkınma ajansına teknik destek başvurusu yapar.
3. Sertifikalı iş ortakları şirketlerde pilot yürütür.
4. Siz ortakları eğitir ve aboneliği sağlarsınız.

Bu kanal bir hipotezdir. Uygunluk kuralları her çağrıda değişir. İş ortağı her başvurudan önce güncel çağrı metnini okumalı.

**Eksik kanıt.** 2026'da KOSGEB'de strateji danışmanlığı için açık bir hibe satırı bulunmadı. Aile anayasası ve kurumsallaşma için de bulunmadı. KOSGEB 14 Mayıs 2026 Perşembe günü SEGEM yönergesini yayımladı. Bu yönergenin strateji danışmanlığıyla ilgisi doğrulanmadı ([KOSGEB SEGEM](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/SEGEM/14.05.2026/SEGEMDestekProgram%C4%B1Y%C3%B6nergesi.pdf), arama özeti). Tek tek şirketlerin ajans desteğine uygunluğu da doğrulanmadı.

## 5. Planı karar sahibi canlı tutar, ritmi ortak korur

### Roller ve önerilen sıklıklar

Rollerin yetkileri bütünleşik geliştirme raporundan gelir ([bütünleşik geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md), bölüm 3.5). Kişi örnekleri persona çalışmasından gelir ([Hedef kitle ICP ve personalar](<Hedef kitle ICP ve personalar.md>), bölüm 4.6). Sıklıklar bizim önerimizdir. Haftalık 15 dakikalık kontrol yalnız tek bir vaka çalışmasına dayanır.

| Rol | Kim alır? | Ne yapar? | Önerilen sıklık | Şart mı? |
|---|---|---|---|---|
| Karar sahibi | İkinci kuşak genel müdür ya da kurucu | Plan üyesi ekler. Kararları ve kaynak izinlerini kaydeder. İnceleme kuyruğunu karara bağlar. | Her hafta kuyruk. Her ay Karar 6 ya da Karar 7. Üç ayda bir 3.5. | Her planda tek kişi şart |
| Stratej | Kurumsal gelişim müdürü ya da sertifikalı iş ortağı | Yol önerir ve gerekçesini kurar. Strateji adımlarını ve hedefleri yazar. Karar kaydedemez. | Hazırlık ve oluşturma boyunca her hafta. Uygulamada her ay ve her 3.5 toplantısında. | Strateji oluşturmada şart |
| Ekip üyesi | Mali işler müdürü ve iş sorumluları | Adım cevabı, kanıt, hedef, gözlem ve kaynak hareketi yazar. İkinci görüş verebilir. | Her hafta yaklaşık 15 dakika gözlem. Bu iş mevcut bir toplantının içinde yapılır. Harcama oldukça kaynak hareketi. | En az 1 kişi şart. Pilot hipotezi 2 ile 5 kişidir. |
| Danışman | Dış danışman ya da mali müşavir | Yalnız okur ve ikinci görüş verir. | Her kapı kararında. Üç ayda bir gözden geçirmede. | Tek kurucuda şart |
| Okur | Aile meclisi, yönetim kurulu, kurucu kuşak | Yalnız okur. | Üç ayda bir, gözden geçirmeden sonra | İsteğe bağlı |
| Kurum yöneticisi | Bilgi işlem sorumlusu ya da dış bilgisayar hizmeti | Kullanıcı ekler. Cihaz iptal eder. Eşitleme ayarlarını değiştirir. Plan verisini açamaz. | Değişiklik oldukça. Her ay erişim kontrolü. | Her kurumda şart |
| Sistem yöneticisi | Ürünü işleten ekip | Gece yayınını ve özellik anahtarlarını yönetir. | Her gece yayın. Müşteri rolü değildir. | Müşteride yok |

Yapay zekâ bir rol değildir. Yapay zekâ ayrı bir hizmet hesabıyla çalışır. Bu hesap yalnız taslak yazar. Bu hesabın karar kayıt türlerinde hiçbir yazma izni yoktur.

### Hizmet tarafının ritmi

| Kim? | Ne yapar? | Sıklık |
|---|---|---|
| İş ortağı, stratej rolünde | Pilot boyunca haftalık toplantıları yürütür. 2.4 toplantısını yönetir. | Pilotta her hafta |
| İş ortağı, stratej rolünde | 3.5 toplantısını yürütür. | Pilottan sonra üç ayda bir |
| İş ortağı | Müşteriyi arar. | Karar sahibi değişince ve plan sağlığı kötüleşince |
| Sizin müşteri başarı sorumlunuz | Plan sağlığı listesini okur. Gereken ortağı arar. | Her hafta |
| Sizin müşteri başarı sorumlunuz | Destek saatlerini müşteri adına kaydeder. | Her destek işinde |

Bugün üründe bildirim modülü yoktur ([bütünleşik geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md), bölüm 14). Bu yüzden hatırlatmayı ilk yıl bir insan yapar. Bu insan iş ortağı ya da sizin müşteri başarı sorumlunuzdur.

### Karar sahibi değişince ortak müşteriyi arar

**Kanıt.** Danışmanlık araştırmasında alışkanlığı bıraktıran en sık neden yöneticinin ayrılmasıydı ([NBER](https://www.nber.org/papers/w24249), arama özeti). Bir satıcı da sponsor değişiminin kullanım verisinde görünmediğini savunur ([Perspective AI](https://getperspective.ai/blog/at-risk-customer-identification-the-conversational-signals-that-beat-usage-data-alone), arama özeti, satıcı görüşü).

**Çıkarım.** Karar sahibinin değişmesi en güçlü risk işaretidir. Ürün bu anı zaten kaydeder. Yeni karar sahibi atanınca eski atamanın bitişi aynı işlemde yazılır. Şu adımlar izlenir:

1. Sunucu "Karar sahibi atandı" olayını denetim kaydına yazar.
2. Plan sağlığı listesi bu planı işaretler.
3. Müşteri başarı sorumlunuz haftalık listede planı görür.
4. Müşteri başarı sorumlunuz planın iş ortağına haber verir.
5. İş ortağı yeni karar sahibiyle bir tanışma görüşmesi yapar.
6. İş ortağı görüşmede sonraki 3.5 tarihini yeni karar sahibiyle doğrular.

Görüşmenin kaç gün içinde yapılacağı pilotta belirlenir. Kaynaklarda bu süre için bir ölçüt bulunmadı.

### Plan sağlığını kişi başına değil, plan başına ölçün

**Çıkarım.** Bu üründe değer girişlerden doğmaz. Değer karar ve gözlem kayıtlarından doğar. Bu yüzden kullanımı plan başına ölçün. Bu ölçüm çalışanı puanlamaz. Banka örneği de puanı çalışan değerlendirmesinden ayırdı.

Uygulama kümesindeki bir plan şu dört koşulu sağlarsa etkin sayılır (hipotez):

1. Her etkin hedefe son 30 günde en az bir gözlem girildi.
2. Karar sahibi son 31 günde Karar 6 ya da Karar 7 kaydetti.
3. Karar sahibi 3.5 gözden geçirmesini zamanında kaydetti. Zamanında demek, sonraki kontrol tarihinden en geç 14 gün sonra demektir.
4. Karar sahibinin kuyruğunda 14 günden eski inceleme kaydı yok.

Aboneliği bırakmanın erken işaretleri şunlardır (hipotez):

1. Sonraki kontrol tarihi geçti ve gözden geçirme kaydı yok.
2. Planda 30 gündür hiç gözlem yok.
3. Planda karar sahibinin 30 gündür hiçbir kaydı yok.
4. Stratejin ya da danışmanın üyeliği bitti. Yerine kimse atanmadı.
5. Karar sahibi değişti. Bu işaret bu raporda yeni eklendi.

**Eksik kanıt.** Strateji yazılımında yenilemeyi önceden gösteren bir kullanım işareti kaynaklarda bulunmadı. Satıcı bloglarındaki oranların asıl kaynağı izlenemedi ([PulseRevOps](https://pulserevops.com/knowledge/q196), arama özeti). Bu yüzden bu eşikleri pilotlarda sınayın.

**Sınır.** Plan sağlığı listesi müşteri sitesinde hesaplanır. Listede plan içeriği olmaz. Listede yalnız tarihler ve sayılar olur. Listenin size gönderilmesi müşteri sözleşmesine yazılmalı.

## 6. RACI tablosu: her işin tek bir hesap vereni var

RACI tablosu her işte kimin ne yaptığını gösterir.

| Harf | İngilizce sözcük | Bu rapordaki anlamı |
|---|---|---|
| R | Responsible | İşi yapan kişi |
| A | Accountable | Hesap veren kişi. Karar işlerinde kaydı yapan kişidir. |
| C | Consulted | Görüşü alınan kişi |
| I | Informed | Sonuçtan haberdar edilen kişi |

Önceki raporun tablosunda bazı işlerin A'sı yoktu. Bu tabloda her işin tam bir A'sı vardır. Tire işareti "rolü yok" anlamına gelir. Sıklık sütunu bizim önerimizdir.

| İş | Sistem yön. | Kurum yön. | Karar sahibi | Stratej | Ekip üyesi | Danışman | Okur | Önerilen sıklık |
|---|---|---|---|---|---|---|---|---|
| Kurum sitesi açma, gece yayını, özellik anahtarı | R, A | I | - | - | - | - | - | Her gece yayın. Değişiklik oldukça. |
| Kullanıcı ekleme, cihaz iptali | - | R, A | I | - | - | - | - | Değişiklik oldukça |
| Erişim kontrolü | - | R, A | C | - | - | - | - | Her ay |
| Plan üyesi ekleme, rol verme | - | - | R, A | C | - | - | - | Plan başında ve değişiklik oldukça |
| Karar sahibini değiştirme | - | - | R, A | I | I | I | I | Değişiklik oldukça. Ardından ortak görüşmesi. |
| Adım 00 ile Adım 18 arası | - | - | C | R, A | R | C | - | Hazırlık boyunca her hafta |
| Karar 1 ile Karar 5 arası | - | - | A | R | C | C | I | Her blok hazır olunca |
| Geçiş kararı | - | - | A | R | C | C | I | Her planda bir kez |
| 2.1, 2.2, 2.3 ve 2.5 | - | - | C | R, A | C | C | - | Oluşturma boyunca her hafta |
| 2.4 Seçim ve vazgeçiş | - | - | R, A | C | C | C | I | Yürütücülü tek toplantı |
| Strateji belgesinin onayı | - | - | A | R | - | C | I | Bir kez. Yeniden açmadan sonra tekrar. |
| 3.1 Hedef ve 3.2 Ana işler | - | - | C | R, A | R | - | - | Uygulama başında ve "Düzelt" kararından sonra |
| 3.3 Kaynak ve kaynak izni | - | - | R, A | C | C | - | I | Onaydan sonra ve yeni ihtiyaçta |
| Kaynak hareketi | - | - | A | - | R | - | - | Her hafta ya da harcama oldukça |
| Hedefe karşı gözlem | - | - | I | C | R, A | - | - | Her hafta, mevcut toplantıda |
| İnceleme kuyruğu | - | - | R, A | C | I | - | - | Her hafta |
| Karar 6 ve Karar 7 | - | - | A | R | C | C | I | Her ay |
| 3.5 ve Karar 8 | - | - | A | R | C | C | I | Üç ayda bir ve tetikleyici olayda |
| Sınır artışı | - | - | R, A | - | C | C | - | İhtiyaç oldukça. İkinci görüşü başka bir üye verir. |
| Rapor okuma ve paylaşma | - | - | I | R, A | - | I | I | Her onaylı karardan sonra |

Tablonun beş önemli sonucu vardır:

1. Aile meclisi "Okur" rolünü alır. Meclis yazılımda karar hakkı almaz. Çünkü her planda tek karar sahibi vardır.
2. Mali işler müdürü "Ekip üyesi" rolünü alır. Kaynak hareketlerini o girer. Kaynak iznini o açamaz.
3. Dış danışman işi yürütürse "Stratej" rolünü alır. Yalnız ikinci görüş verirse "Danışman" rolünü alır. Dış danışman aynı planda karar sahibi olmaz.
4. Tek kurucuda karar sahibi ile stratej aynı kişi olabilir. Bu kişi ikinci görüş için plana bir danışman ekler.
5. Sistem yöneticisi ve kurum yöneticisi plan içeriğinde hiçbir işin R'si ya da A'sı değildir.

**Açık soru.** Karar sahibi şirketten ayrılabilir. O zaman yeni atamayı kim yapar? Depoda bu durum tanımlı değil. Önerimiz şudur:

1. Giden karar sahibi ulaşılabilirse atamayı kendisi yapar.
2. Ulaşılamazsa kurum yöneticisi bir atama isteği açar.
3. Bu isteğe şirketin yazılı kararı eklenir. Örneğin yönetim kurulu kararı.
4. Atama denetim kaydına yazılır.
5. Kurum yöneticisi bu işle plan içeriğini okuma hakkı kazanmaz.

Bu öneri bir ürün kararıdır. Ürün sahibi onaylamadan koda girmemeli.

## 7. Frappe 16 kaynak kodu beş iddiadan üçünü düzeltiyor

### Neyi okuduk?

Kod, Frappe deposunun `version-16` dalından okundu. Okunan sürüm `v16.56.0` etiketidir. Etiketin kod kaydı `49789a1711d4dde2be9c6888efe35651465f4b64`'tür. Bu kayıt 10 Kasım 2026 Salı günü yapıldı. Bütün bağlantılar bu kayda giden kalıcı bağlantılardır.

**Kod yalnız okundu. Hiçbir Frappe kodu çalıştırılmadı. Hiçbir iddia çalışan bir Frappe 16 kurulumunda denenmedi.** Tablodaki "Test" sütunu bu yüzden bir öneridir. Testler geliştirmenin ilk adımlarında gerçek bir kurulumda çalıştırılmalı.

### Beş iddianın doğrulama tablosu

| No | İddia | Sonuç | Kod kaynağı, v16.56.0 | Karar Atlası için sonucu | Kanıtlayacak test |
|---|---|---|---|---|---|
| 1 | Kayıt denetimi (`has_permission`) yalnız reddedebilir. Yeni izin veremez. | Doğrulandı. Ama v16'da bir fark var. | [`permissions.py` L483-L500](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/permissions.py#L483-L500), [L239-L241](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/permissions.py#L239-L241) | **Kanca `None` dönerse erişim reddedilir.** Kanca izin verirken açıkça `True` dönmeli. Temel rol izni geniş olmalı. Kanca daraltır. | Kanca bir üye için `None` döner. `frappe.has_permission(doc=...)` sonucu `False` olur. Kanca `True` döner ama rolün okuma izni yoktur. Sonuç yine `False` olur. |
| 1b | Kanca belge olmadan da çağrılır. | Yanlış. Yeni bulgu. | [`permissions.py` L140-L177](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/permissions.py#L140-L177) | Kayıt türü düzeyindeki denetim kancayı çağırmaz. Bu denetim yalnız rol izin satırına ve paylaşıma bakar. | Belgesiz `frappe.has_permission("Kapı Kararı")` çağrılır. Kancaya konan sayaç sıfırda kalır. |
| 2 | Liste koşulu `get_list` sonucuna uygulanır. `get_all` sonucuna uygulanmaz. | Doğrulandı | [`__init__.py` L1381-L1403](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/__init__.py#L1381-L1403), [`query.py` L243-L294](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/database/query.py#L243-L294), [`query.py` L1698-L1735](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/database/query.py#L1698-L1735) | Plan modüllerinde kullanıcıya dönük okumada izni atlayan çağrılar yasaktır. Liste denetimini bir kod taraması korur. | Üye olmayan kişi için `frappe.get_list` 0 satır döner. `frappe.get_all` bütün satırları döner. Tarama `get_all` görünce yayını durdurur. |
| 2b | Liste sorgusu kayıt denetimini de çağırır. | Yanlış. Yeni bulgu. | [`query.py` L1650-L1686](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/database/query.py#L1650-L1686) | Liste koşulu ile kayıt denetimi aynı üyelik kuralını taşımalı. İkisi ayrılırsa liste ya da rapor kayıt sızdırır. | Rastgele kullanıcı ve planlarla sınama: kayıt listede görünüyorsa kayıt denetimi de "okuyabilir" der. Tersi de doğrudur. |
| 3 | Belge paylaşımı, kancanın reddinden sonra erişim verebilir. | Doğrulandı. Etkisi düşünülenden geniş. | [`permissions.py` L179-L211](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/permissions.py#L179-L211), [`query.py` L1650-L1686](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/database/query.py#L1650-L1686), [`docshare.py` L34-L62](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/core/doctype/docshare/docshare.py#L34-L62) | Paylaşım satırı tek kayıtta kanca reddini aşar. Paylaşılan kayıt listeye de "veya" koşuluyla girer. `disable_document_sharing` ayarı yalnız yeni paylaşımı durdurur. Var olan satırlar erişim vermeye devam eder. | Yönetici, üye olmayan birine paylaşım satırı yazar. Kanca reddeder. Ama kayıt açılır ve listede görünür. Önlemler eklenince kayıt açılmaz ve listede görünmez. |
| 4a | Frappe rolleri bütün sitede geçerlidir. Belge başına değildir. | Doğrulandı | [`has_role.json`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/core/doctype/has_role/has_role.json), [`permissions.py` L542-L578](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/permissions.py#L542-L578) | Plan rolü Plan Üyeliği satırında durur. Frappe rolü olmaz. | A planının karar sahibi B planında karar kaydedemez. |
| 4b | Kullanıcı izninde zaman aralığı yoktur. | Doğrulandı | [`user_permission.json`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/core/doctype/user_permission/user_permission.json), [`user_permission.py` L95-L106](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/core/doctype/user_permission/user_permission.py#L95-L106) | Üyeliğin süresini yetki işlevi sunucu saatine göre denetler. Kullanıcı izni bu iş için kullanılmaz. Üyelik cevabı istekler arasında önbellekte tutulmaz. | Üyeliği dün biten kişi bugün planı ne listede ne kayıtta görür. |
| 5 | Frappe iş akışı geçişleri yalnız role bağlıdır. | Kısmen doğru | [`workflow.py` L45-L101](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/workflow.py#L45-L101), [`workflow.py` L307-L308](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/workflow.py#L307-L308) | Geçişe veritabanı okuyan bir koşul yazılabilir. Ama koşul veritabanında duran bir metindir. Yöneticiler onu değiştirebilir. Birim testi yazılamaz. Bu yüzden kararlar Frappe iş akışıyla değil, kendi uçlarımızla yazılır. | Plan Üyeliği okuyan bir koşulda, rolü uyan ama karar sahibi olmayan kişi geçişi görmez. Geçişi zorlarsa Frappe hata verir. |

### Bu tablonun dört önemli sonucu

1. **Kanca stili değişmeli.** Frappe 15'te `None` "fikrim yok" demekti ([`permissions.py`, v15](https://github.com/frappe/frappe/blob/2e9ecdc03fa5b5b8d1ba05224a1aff7dad832bd0/frappe/permissions.py#L455-L471)). Frappe 16'da `None` red demektir. Resmî kanca belgesi hâlâ eski davranışı anlatır ([Frappe hooks](https://docs.frappe.io/framework/user/en/python-api/hooks)). Bu fark v16.0.0 sürümünden beri vardır.
2. **İki kanca tek bir kaynaktan üretilmeli.** Liste sorgusu kayıt denetimini çağırmaz. Kayıt denetimi de liste koşulunu çağırmaz.
3. **Paylaşım kapatmak yetmez.** Var olan paylaşım satırları erişim vermeye devam eder. Yeni satır da engellenmeli.
4. **Frappe'nin kendi kancaları açık değer döner.** Örneğin ToDo ve Event kayıtları her zaman `True` ya da `False` döner ([`todo.py` L164-L172](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/desk/doctype/todo/todo.py#L164-L172), [`event.py` L298-L308](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/desk/doctype/event/event.py#L298-L308)). Bizim kancamız da böyle yazılmalı.

### Ek bulgular: giriş, yazma ve kimlik

| Konu | Kod ne yapıyor? | Kod kaynağı | Karar Atlası için sonucu |
|---|---|---|---|
| OAuth erişim anahtarı | Anahtar kendi kapsamıyla denetlenir. Sonra istek anahtarın kullanıcısıyla çalışır. Uca özel kapsam denetimi yoktur. | [`auth.py` L660-L697](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/auth.py#L660-L697) | Kapsam, iptal edilen cihazı daraltmaz. Cihaz denetimini uygulama her istekte kendisi yapar. |
| API anahtarı | Anahtar bir kullanıcıyı bulur. İstek o kullanıcının bütün rolleriyle çalışır. | [`auth.py` L700-L752](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/auth.py#L700-L752) | Yapay zekâ hizmet hesabının rolü karar kayıt türlerinde hiçbir izin taşımamalı. |
| Uygulama giriş kancası | `auth_hooks` her istekte anahtar denetiminden sonra çalışır. | [`auth.py` L755-L757](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/auth.py#L755-L757) | İptal edilen cihaz denetimi buraya bağlanır. |
| IP sınırı | `restrict_ip` artık API anahtarına ve erişim anahtarına da uygulanır. | [`auth.py` L634-L657](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/auth.py#L634-L657) | Yapay zekâ hizmet hesabı belli adreslerle sınırlanabilir. |
| MCP ucu | `/api/v2/mcp` adresi var. Ayar kapalıysa 404 döner. Açıksa okuma, oluşturma, güncelleme ve uç çağırma araçları açılır. | [`mcp/__init__.py` L10-L16](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/mcp/__init__.py#L10-L16), [`mcp/tools/documents.py` L49-L85](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/mcp/tools/documents.py#L49-L85) | Bu ikinci bir yazma yoludur. Kurum sitelerinde kapalı kalmalı. |
| Hazır REST uçları | `/api/resource` ve `/api/v2/document` aynı belge denetimlerini kullanır. Liste yolu kancayı çağırmaz. | [`api/v1.py` L12-L152](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/api/v1.py#L12-L152), [`api/v2.py` L66-L240](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/api/v2.py#L66-L240) | Bu uçlar plan kayıtları için de açıktır. Liste koşulu bu yüzden zorunludur. |
| İzni atlayan yazma | `ignore_permissions` bayrağı rol iznini, kancayı ve paylaşımı birlikte atlar. | [`document.py` L640-L652](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/document.py#L640-L652) | Bu bayrağı kullanan karar ucu yetki işlevini kendisi çağırmalı. |
| Doğrulamayı atlama | `ignore_validate` bayrağı `validate` ve `before_submit` adımlarını atlar. | [`document.py` L1661-L1695](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/document.py#L1661-L1695) | İkinci koruma katmanı bu bayrakla çöker. Karar türlerinde yasaklanır. |
| Onay sonrası alan denetimi | `ignore_validate_update_after_submit` onaydan sonra değişmemesi gereken alanları açar. | [`document.py` L1440-L1452](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/document.py#L1440-L1452) | Karar türlerinde yasaklanır. |
| Kısa yazma | `db_set` doğrulama, izin ve onay sonrası denetimi yapmaz. Yalnız `before_change` ve `on_change` çalışır. | [`document.py` L1787-L1846](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/document.py#L1787-L1846) | Karar türlerinde `db_set` ve `frappe.db.set_value` yasaklanır. |
| Onay geçişi | Taslaktan onaya geçiş `submit` izni ister. Yeni kayıt doğrudan onaylı gönderilirse de `submit` izni gerekir. | [`document.py` L1355-L1427](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/document.py#L1355-L1427) | Kullanıcı rollerinde `create` ve `submit` yoksa hazır uçların hepsi kapanır. |
| İstek gövdesi | REST gövdesi `name` ve `docstatus` alanlarını taşıyabilir. Sunucu `owner` alanını kendisi yazar. | [`document.py` L3636-L3646](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/document.py#L3636-L3646), [`document.py` L1036-L1047](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/document.py#L1036-L1047) | Kimlik alanları gövdeden değil, oturumdan alınır. `name` alanı ayrıca denetlenir. |
| UUID adı | Kayıt türünün adlandırması "UUID" ise istemcinin gönderdiği UUID olduğu gibi kalır. Ad boşsa sunucu UUIDv7 üretir. Her UUID sürümü kabul edilir. Ad UUID değilse kayıt reddedilir. | [`naming.py` L141-L198](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/naming.py#L141-L198) | Cihazın seçtiği UUID ve Adım Kaydı'nın UUIDv5'i bu yapıya uyar. Ama Frappe UUIDv5'in doğru hesaplandığını denetlemez. |
| Python sürümü | Adlandırma kodu `uuid7` işlevini standart kütüphaneden alır. | [`naming.py` L10](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/naming.py#L10) | Bu, Python 3.14 ve sonrasını gerektirir. Bütünleşik rapordaki Python 3.14 bilgisini destekler. |

### Hâlâ okunmayanlar

1. Frappe'nin OAuth sunucusu tam okunmadı. PKCE desteği ve yenileme anahtarının ömrü doğrulanmadı.
2. `frappe.delete_doc` işlevinin iç adımları satır satır okunmadı.
3. SQLite veritabanında UUID sütununun davranışı denetlenmedi.
4. `None` davranışını değiştiren kod değişikliğinin kaydı bulunamadı. Değişiklik v16.0.0'dan beri vardır.

## 8. Yetki tasarımı: varsayılan ret ve tek yetki işlevi

### Üç katman tek işlevde birleşir

Ürünün kurallarının çoğu iki şeye birden bakar. Kural önce kişinin plandaki ilişkisine bakar. Sonra kaydın durumuna bakar. Frappe'nin rolleri bütün sitede geçerlidir. Bu yüzden Frappe rolleri bu kuralları tek başına taşıyamaz.

| Katman | Model | Nerede durur? | Neye cevap verir? |
|---|---|---|---|
| 1 | RBAC | Frappe rolleri ve rol izin satırları | Kişi bu tür kayda hiç girebilir mi? |
| 2 | ReBAC | Plan Üyeliği ve türetilen ilişkiler | Kişi bu planda bugün hangi roldedir? |
| 3 | ABAC ve görev ayrılığı | Erişim modülündeki yetki işlevi | Bu kayıt şu durumda bu işe açık mı? |

Görev ayrılığı, aynı kişinin hem işi yapıp hem onaylamasını engelleyen kuraldır.

### Birinci katman: az sayıda site rolü

| Rol | Kim alır? | Verdiği izin | Vermediği izin |
|---|---|---|---|
| Sistem yöneticisi | Yalnız ürünü işleten ekip | Yayın ve özellik anahtarları | Müşteri kullanıcısına verilmez. |
| Kurum yöneticisi | Kurumun bilgi işlem sorumlusu | Kullanıcı ve cihaz yönetimi | Tek başına plan verisi açmaz. |
| Plan kullanıcısı (öneri) | Bütün müşteri kullanıcıları | Plan kayıtlarını okuma. Yalnız eklenen kayıtları oluşturma. | Paylaşma, silme, içe aktarma ve dışa aktarma yok. Karar türlerinde oluşturma, yazma ve onaylama yok. |
| Yapay zekâ hizmet hesabı (öneri) | Yapay zekâ servisi | Yalnız taslak yazan uçları çağırma | Hiçbir karar türünde izin yok. İkinci görüş yok. Kişi puanı yok. |

"Plan kullanıcısı" rolü geniştir. Asıl sınırı yetki işlevi çizer. Kayıt denetimi yalnız daraltabildiği için bu düzen gereklidir.

### İkinci katman: plan içindeki ilişkiler

| İlişki | Hangi kayıtta durur? | Ne işe yarar? |
|---|---|---|
| Üye | Plan Üyeliği | Kişi, plan, rol, başlangıç, bitiş ve atayan kişiyi tutar. |
| Görev sorumlusu | Görev | Sorumlu kişi kendi görevinin durumunu günceller. |
| Yazan | Kanıt Sürümü, Gözlem, Kaynak Hareketi | Kaydı kimin yazdığını kalıcı olarak gösterir. |
| Değiştiren ve inceleyen | Sınır Değişikliği | İnceleyen kişinin değiştiren kişiden farklı olmasını sağlar. |
| İkinci görüş veren | Kapı Kararı | İkinci görüşün başka bir üyeden gelmesini sağlar. |

**Değişmez kural.** Bir planda aynı anda tek etkin karar sahibi satırı olur. Yeni atama, eski atamanın bitişini aynı işlemde yazar. Atama, plan kilidi altında yapılır.

### Üçüncü katman: durum ve görev ayrılığı

| Özellik türü | Örnekler |
|---|---|
| Kaydın özelliği | Geçiş kararı var mı? Kapı kilitli mi? Strateji onayı geçerli mi? İznin durumu ve kalanı. Serbest bütçe. |
| Ortamın özelliği | Cihaz iptal edildi mi? Üyelik sunucu saatine göre bugün geçerli mi? İstemcinin kural sürümü. |
| Kişinin özelliği | Hesap bir insana mı, bir hizmete mi ait? |
| Kurumun özelliği | Yapay zekâ seviyesi. Veri sınıfı. |

### Yetki işlevi üç biçimde cevap verir

**Kural.** Bütün yetki kararlarını tek bir işlev verir. Bu işlev Erişim modülündedir. İşlev aynı kuraldan üç cevap üretir:

| Kim sorar? | İşlev ne döner? |
|---|---|
| Kayıt denetimi kancası | `True` ya da `False`. Hiçbir zaman `None` dönmez. |
| Liste koşulu kancası | Bir sorgu koşulu nesnesi. Frappe 16 bu nesneyi kabul eder ([`query.py` L1698-L1735](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/database/query.py#L1698-L1735)). |
| Karar ve iş akışı uçları | İzin ya da ret, yanında bir neden kodu. Ekran nedeni sade bir cümleye çevirir. |

Okuma için en güvenli yol şudur. Kayıt denetimi, liste koşulunun aynısını tek kayıt üzerinde çalıştırır. Böylece liste ile kayıt aynı cevabı verir. Yazma ve karar işleri bunun üstüne rol ve durum kurallarını ekler.

Aşağıdaki kod bir taslaktır. Kod çalıştırılmadı. Kanca imzaları gerçek bir kurulumda doğrulanmalı.

```python
# decisionact/erisim/izin.py  (taslak, çalıştırılmadı)
import frappe
from frappe.utils import now_datetime

def uyelik_kosulu(tablo, kullanici):
    """Liste ve kayıt okumasının tek kaynağı."""
    uyelik = frappe.qb.DocType("Plan Üyeliği")
    simdi = now_datetime()                      # sunucu saati, cihaz saati değil
    etkin_planlar = (
        frappe.qb.from_(uyelik)
        .select(uyelik.plan)
        .where(uyelik.kullanici == kullanici)
        .where(uyelik.baslangic <= simdi)
        .where(uyelik.bitis.isnull() | (uyelik.bitis > simdi))
    )
    return tablo.plan.isin(etkin_planlar)

def liste_kosulu_uret(doctype):
    def liste_kosulu(user=None, **kwargs):
        tablo = frappe.qb.DocType(doctype)
        return uyelik_kosulu(tablo, user or frappe.session.user)
    return liste_kosulu

def okuyabilir_mi(doc, kullanici):
    tablo = frappe.qb.DocType(doc.doctype)
    satir = (
        frappe.qb.from_(tablo).select(tablo.name)
        .where(tablo.name == doc.name)
        .where(uyelik_kosulu(tablo, kullanici))
        .run()
    )
    return bool(satir)

def kayit_denetimi(doc, ptype=None, user=None, **kwargs):
    kullanici = user or frappe.session.user
    sonuc = yetki_ver(kullanici, ptype or "read", doc, ortam())
    return True if sonuc.izin else False        # v16: None red demektir
```

```python
# decisionact/erisim/izin.py  (taslak, devam)
def yetki_ver(kullanici, is_turu, kayit, ortam):
    # Varsayılan ret. Önce yasaklar, sonra izinler.
    if ortam.cihaz_iptal and is_turu not in IPTALDE_IZINLI:
        return hayir("cihaz_iptal")
    if is_turu == "read" and not okuyabilir_mi(kayit, kullanici):
        return hayir("plan_uyesi_degil")
    roller = gecerli_roller(kullanici, kayit.plan, sunucu_saati())
    if not roller:
        return hayir("plan_uyesi_degil")
    for kural in YASAK_KURALLARI:
        if kural.tutar(kullanici, roller, is_turu, kayit, ortam):
            return hayir(kural.neden_kodu)
    for kural in IZIN_KURALLARI:
        if kural.tutar(kullanici, roller, is_turu, kayit, ortam):
            return evet(kural.neden_kodu)
    return hayir("izin_kurali_yok")
```

`gecerli_roller` işlevi Plan Üyeliği'ni her istekte okur. Cevap istekler arasında önbellekte tutulmaz. Frappe rolleri ve kullanıcı izinlerini Redis'te önbelleğe alır ([`permissions.py` L542-L578](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/permissions.py#L542-L578)). Üyelik için üçüncü bir önbellek kurulmamalı.

### Belge paylaşımı dört önlemle kapanır

**Neden?** Paylaşım satırı kanca reddini aşar. Paylaşılan kayıt listeye de girer. Frappe'nin liste kodu bunu açıkça yazar: paylaşılan belgeler bütün kısıtlamaları yener ([`query.py` L1676-L1686](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/database/query.py#L1650-L1686)). Paylaşım satırı okuma, yazma, paylaşma, onaylama, e-posta ve yazdırma hakkı verebilir ([`permissions.py` L179-L207](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/permissions.py#L179-L211)).

Plan kayıtlarında şu dört önlem birlikte uygulanır:

1. **Yeni paylaşımı engelleyin.** Her plan kayıt türünün denetleyicisine `validate_share` yazın. İşlev her zaman hata verir. Frappe her yeni paylaşım satırında bu işlevi çağırır ([`docshare.py` L34-L62](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/core/doctype/docshare/docshare.py#L34-L62)).
2. **Paylaşma iznini kaldırın.** Plan kayıt türlerinin rol izin satırlarında "Share" izni olmaz. Başka uygulama gerekmiyorsa `disable_document_sharing` ayarı açılır.
3. **Görev atama aracını kullanmayın.** Frappe'nin atama aracı, erişimi olmayan kişiye kendiliğinden paylaşım açar ([`assign_to.py` L120-L134](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/desk/form/assign_to.py#L120-L134)). Plan kayıtlarında görevler ürünün kendi Görev kaydıyla tutulur.
4. **Var olan satırları arayın.** Yetki işlevi paylaşımı hiçbir zaman izin sebebi saymaz. Ama Frappe'nin kendi liste kodu satırı yine sayar. Bu yüzden bir denetim, plan kayıt türlerinde paylaşım satırı olmadığını doğrular. Satır bulunursa yayın durur.

```python
# decisionact/karar/doctype/kapi_karari/kapi_karari.py  (taslak)
class KapiKarari(Document):
    def validate_share(self, docshare):
        frappe.throw(_("Plan kayıtları paylaşılmaz."), frappe.PermissionError)
```

Bizim kodumuz `frappe.has_permission` çağırırsa `ignore_share_permissions=True` bayrağını da verir. Böylece paylaşım bizim denetimlerimizde hiç sayılmaz.

### Tek komut yolu: karar türleri hazır uçlara kapalı

**Kural.** Kullanıcı rolleri karar türlerinde `create`, `write` ve `submit` izni almaz. Bu durumda şu yolların hepsi rol izninde durur:

1. `POST /api/resource` ile karar oluşturma. Gövdede `docstatus=1` olsa da durur.
2. `PUT` ile `docstatus=1` gönderme
3. `frappe.client.submit` ve `run_method=submit`
4. Frappe'nin yönetim ekranı
5. Frappe iş akışı geçişi

Bu yolların izin denetimi kodda görülür ([`client.py` L183-L296](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/client.py#L183-L296), [`document.py` L1355-L1427](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/document.py#L1355-L1427)).

Kararları yalnız iş akışları katmanındaki uçlar yazar. Bu uçlar rol izni olmadığı için `ignore_permissions` ile yazar. Bu bayrak kancayı da atlar. Bu yüzden her karar ucu şu sırayı izler:

1. Uç plan kilidini alır.
2. Uç yetki işlevini kendisi çağırır.
3. Yetki işlevi "hayır" derse uç yazmadan durur.
4. Uç kuralları Python ile çalıştırır.
5. Uç kaydı `ignore_permissions` ile yazar ve onaylar.
6. `before_submit` adımı önemli denetimleri ikinci kez çalıştırır.

```python
# decisionact/is_akislari/karar.py  (taslak)
@frappe.whitelist(methods=["POST"])
def karari_onayla(plan, kayit_kimligi, kapi, secim, gerekce):
    plan_kilidi_al(plan)                       # Plan modülünün komutu
    kayit = frappe.new_doc("Kapı Kararı")
    kayit.name = kayit_kimligi                 # cihazın seçtiği UUID
    kayit.update({"plan": plan, "kapi": kapi, "secim": secim, "gerekce": gerekce})
    # karar sahibi alanı istemciden değil, oturumdan gelir
    kayit.karar_sahibi = frappe.session.user
    sonuc = yetki_ver(frappe.session.user, "kapi_karari_kaydet", kayit, ortam())
    if not sonuc.izin:
        frappe.throw(sonuc.metin, frappe.PermissionError)
    kayit.flags.ignore_permissions = True      # rol izni bilerek kapalı
    kayit.insert()
    kayit.submit()                             # before_submit yine çalışır
```

### Karar türlerinde yasak çağrılar

Şu çağrılar karar türlerinde iki koruma katmanını da atlar. Bu yüzden yasaktır:

| Yasak çağrı | Neyi atlar? |
|---|---|
| `doc.db_set(...)` | İzin, `validate` ve onay sonrası alan denetimi |
| `frappe.db.set_value(...)` | Aynı |
| `flags.ignore_validate` | `validate` ve `before_submit` |
| `flags.ignore_validate_update_after_submit` | Onaydan sonra değişmemesi gereken alanların denetimi |

Plan modüllerinde kullanıcıya dönük okumada şu çağrılar da yasaktır:

| Yasak çağrı | Neden? |
|---|---|
| `frappe.get_all`, `frappe.db.get_all` | İzni kendiliğinden atlar. |
| `frappe.db.get_value`, `frappe.db.sql` | İzin denetimi yapmaz. |
| Bayraksız `frappe.qb.get_query` | Varsayılanı izni atlamaktır. |
| Denetimsiz `frappe.get_doc` | `check_permission` çağrılmadan izin denetimi yapmaz. |
| `ignore_permissions=True` | İş akışı uçları ve incelenmiş sistem işleri dışında yasaktır. |

Bir kod taraması bu çağrıları her kod gönderiminde arar. İzinli istisnalar ayrı bir listede durur. Listeye ekleme kod incelemesi ister. Tarama ayrıca bir şey denetler. `ignore_permissions` kullanan her uç, yazmadan önce `yetki_ver` çağırmalı.

### Giriş: cihaz iptali uygulamanın işidir

**Kanıt.** Frappe'de OAuth anahtarı kullanıcının bütün yetkisini taşır. Kapsam uçları daraltmaz ([`auth.py` L660-L697](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/auth.py#L660-L697)).

**Kural.** İptal edilen cihazı uygulama her istekte durdurur. İşler şu sırayla yürür:

1. Sunucu anahtarı verirken anahtarın kimliğini Cihaz kaydına yazar.
2. `auth_hooks` işlevi her istekte anahtarın kimliğini okur.
3. İşlev anahtarın bağlı olduğu Cihaz kaydını bulur.
4. Cihaz iptal edilmemişse istek normal sürer.
5. Cihaz iptal edildiyse yalnız iki uca izin verilir.
6. Bu iki uç "bekleyenleri incelemeye gönder" ve "yerel veriyi sil komutunu al" uçlarıdır.
7. Başka her istek reddedilir.

Bu denetim hazır REST uçlarını da kapsar. Çünkü `auth_hooks` her istekte çalışır ([`auth.py` L755-L757](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/auth.py#L755-L757)).

**Kural.** Kurum sitelerinde MCP ucu kapalı kalır. Bunun için `enable_mcp` ayarı kapalı tutulur. Bir test `/api/v2/mcp` adresinin 404 döndüğünü doğrular.

**Kural.** Yapay zekâ hizmet hesabı API anahtarı kullanabilir. API anahtarı da kullanıcının bütün rolleriyle çalışır. Bu yüzden hesabın rolü karar türlerinde hiçbir izin taşımaz. Yetki işlevi de hizmet hesabını her karar işinde reddeder.

### Kimlik: UUID'yi Frappe kabul eder, doğruluğunu siz denetlersiniz

**Kanıt.** Adlandırması "UUID" olan kayıt türünde istemcinin gönderdiği UUID olduğu gibi kalır. Frappe yalnız adın UUID olarak okunabildiğine bakar ([`naming.py` L141-L198](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/naming.py#L141-L198)).

**Kural.** Sunucu şu üç denetimi kendisi yapar:

1. Adı standart biçime çevirir. Standart biçim küçük harfli ve tireli yazımdır. Python süslü parantezli ve tiresiz biçimleri de kabul eder. Çevirme yapılmazsa eşitleme kaydında aynı kimlik iki farklı yazımla görünebilir.
2. Adım Kaydı'nın adını yeniden hesaplar. Ad, plan kimliği ve adım kodundan UUIDv5 ile hesaplanır. Gelen ad hesaplanan adla aynı değilse kayıt reddedilir.
3. UUIDv5'in ad alanı sabiti ve girdi metninin biçimi API sözleşmesinde yazılır. TypeScript ve Python aynı örnek dosyasıyla sınanır.

Bu denetimler `before_insert` adımında yapılır. Frappe adlandırmadan önce `create` iznini denetler. Bu yüzden kanca istemcinin gönderdiği adı görür. Adımların sırası gerçek kurulumda testle doğrulanmalı.

### Kural metni örneği

Aşağıdaki kural metni Cedar diline benzer. Cedar'da her kural bir kişi, bir iş ve bir kayıt için yazılır. Kural "izin ver" ya da "yasakla" der ([Cedar](https://docs.cedarpolicy.com/overview/terminology.html)). Bu metin bir örnektir. Hiçbir motorda çalıştırılmadı.

```cedar
// Varsayılan: izin kuralı yoksa cevap "hayır".
// Bir yasak kuralı tutarsa bütün izin kuralları yok sayılır.

permit(principal, action == Action::"oku", resource)
  when { uyelik(principal, resource.plan).gecerli(sunucu_saati) };

permit(principal, action in [Action::"kapi_karari_kaydet",
                             Action::"gecis_karari_kaydet",
                             Action::"strateji_onayla",
                             Action::"gozden_gecirme_kaydet",
                             Action::"izin_ac", Action::"izin_kapat",
                             Action::"hareket_incele"], resource)
  when { "karar_sahibi" in roller(principal, resource.plan, sunucu_saati) };

permit(principal, action == Action::"strateji_adimi_yaz", resource)
  when { roller(principal, resource.plan, sunucu_saati)
           .containsAny(["stratej", "karar_sahibi"])
         && resource.plan.gecis_karari_var };

permit(principal, action in [Action::"gozlem_ekle", Action::"hareket_ekle",
                             Action::"kanit_surumu_ekle"], resource)
  when { roller(principal, resource.plan, sunucu_saati)
           .containsAny(["ekip_uyesi", "stratej", "karar_sahibi"]) };

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

forbid(principal, action in [Action::"kapi_karari_kaydet",
                             Action::"gecis_karari_kaydet",
                             Action::"strateji_onayla",
                             Action::"gozden_gecirme_kaydet",
                             Action::"izin_ac", Action::"izin_kapat",
                             Action::"hareket_incele",
                             Action::"ikinci_gorus_ver"], resource)
  when { principal.hesap_turu == "hizmet" };

forbid(principal, action == Action::"kisi_puanla", resource);

forbid(principal, action == Action::"paylas", resource)
  when { resource.plan_kaydi };

forbid(principal, action, resource)
  when { context.cihaz.iptal
         && !(action in [Action::"bekleyenleri_incelemeye_gonder",
                         Action::"yerel_veriyi_sil_komutu_al"]) };
```

### Sade kurallar

1. Kişi bir planın kayıtlarını yalnız o planın etkin üyesiyken görür.
2. Üyeliğin bitiş zamanı geçince okuma hakkı da biter.
3. Bazı kayıtları yalnız planın o anki karar sahibi kaydeder. Bunlar kapı kararı, geçiş kararı, strateji onayı, gözden geçirme ve kaynak iznidir.
4. Stratej, strateji adımlarını ancak geçiş kararından sonra yazar.
5. Kilitli bir uygulama kapısında kimse "İlerle" kaydedemez.
6. Ekip üyesi izin kapalıyken de gözlem yazar. Gözlem harcama hakkı vermez.
7. Kapalı izne gelen harcama kaydedilir ama incelemeye düşer.
8. İncelemedeki harcamayı yalnız karar sahibi kabul eder ya da reddeder.
9. Sınırı artıran kişi bu değişikliği inceleyemez.
10. İkinci görüşü başka bir üye kendi hesabıyla verir.
11. Karar sahibi kendi kararına ikinci görüş veremez (öneri).
12. Yapay zekâ hesabı hiçbir kararı kaydetmez ve ikinci görüş vermez.
13. Hiçbir hesap çalışana puan yazamaz. Üründe böyle bir uç yoktur.
14. İptal edilen cihaz yalnız iki iş yapar.
15. Plan kayıtları Frappe'nin belge paylaşımıyla paylaşılmaz.
16. Sunucu kişiyi erişim anahtarından tanır. İstek gövdesindeki ad yetki vermez.

### Yetkiyi kanıtlayacak testler

Testleri şu sırayla kurun:

1. Testi kodu yazmadan önce yazın.
2. Testin önce düştüğünü görün.
3. Sonra kodu yazın ve testi geçirin.
4. Testleri ortak örnek dosyalarıyla yazın.
5. Testleri her kod gönderiminde otomatik çalıştırın.
6. Bir yetki testi düşerse yayını durdurun.
7. Testleri gerçek bir Frappe 16 kurulumunda çalıştırın.

Bölüm 7'deki tablonun testlerine ek olarak şu testler gerekir:

| No | Test | Beklenen sonuç |
|---|---|---|
| 1 | Kayıt denetimi rastgele kullanıcı ve kayıtlarla çağrılır. | İşlev hiçbir durumda `None` dönmez. |
| 2 | Rastgele kullanıcı ve planlarla liste ve kayıt okunur. | Liste ile kayıt denetimi her durumda aynı cevabı verir. |
| 3 | Yönetici bir plan kaydı için paylaşım satırı eklemeye çalışır. | `validate_share` hatası çıkar. Satır yazılmaz. |
| 4 | Hazır REST ucuyla karar oluşturulur. Gövdede `docstatus=1` vardır. | Rol izni reddeder. |
| 5 | `frappe.client.submit` ile karar onaylanır. | Rol izni reddeder. |
| 6 | Üye olmayan kişi karar ucunu çağırır. | Uç yazmadan önce durur. Neden kodu "plan_uyesi_degil" olur. |
| 7 | İptal edilen cihaz `/api/resource` ile bir plan kaydı okur. | `auth_hooks` reddeder. |
| 8 | İptal edilen cihaz iki izinli ucu çağırır. | İki istek de çalışır. Üçüncü istek reddedilir. |
| 9 | `/api/v2/mcp` adresi çağrılır. | 404 döner. |
| 10 | Yapay zekâ hesabına bütün roller verilir ve karar ucu çağrılır. | Yetki işlevi reddeder. |
| 11 | Adım Kaydı yanlış bir UUIDv5 adıyla gönderilir. | Kayıt reddedilir. |
| 12 | Aynı UUID süslü parantezli ve büyük harfle gönderilir. | Ad standart biçime çevrilir. |
| 13 | İstemci başka bir kişiyi karar sahibi diye gönderir. | Sunucu alanı oturumdan yazar. |
| 14 | Aynı anda iki karar sahibi ataması gelir. | Yalnız biri etkin kalır. |
| 15 | Kod taraması karar türünde `db_set` görür. | Yayın durur. |

## 9. Gömülü yetki işlevi yeter, dış motor şimdilik gereksiz

### Seçenekler ve kanıtları

| Seçenek | Nasıl çalışır? | Güçlü yanı | Zayıf yanı | Kaynak ve okunma düzeyi |
|---|---|---|---|---|
| Kendi yetki işlevimiz | Python işlevi aynı veritabanı işleminde Plan Üyeliği'ni okur. | İki ayrı yere yazma yok. Kararla yetki aynı işlemde ve aynı kilit altında. | Kurallar büyürse kod karışabilir. | Bu raporun tasarımı |
| Casbin, gömülü | Kütüphane uygulamanın içinde çalışır. | Open edX bu yolu seçti. | Liste koşulunu yine biz yazarız. | [Open edX karar kaydı](https://docs.openedx.org/projects/openedx-authz/en/latest/decisions/0004-technology-selection.html) |
| Cedar, `cedarpy` ile gömülü | Kural dili ve Python bağlantısı. Toplu sorgu ve önceden çözülmüş kural kümesi hızlıdır. | Kural metni okunur ve doğrulanabilir. | Bağlantı AWS ya da Cedar ekibi tarafından resmî olarak desteklenmiyor. Erken aşamada. Liste için SQL üretmez. | [cedar-py](https://github.com/k9securityio/cedar-py) |
| Oso, yerel yetki | Oso uygulama verisini okumaz. Liste için SQL koşulu üretir. PostgreSQL ve MySQL destekler. | Liste koşulu kancasına doğrudan uyar. | Ticari bir bulut hizmetine bağlıdır. Lisansı denetlenmedi. | [Oso](https://www.osohq.com/docs/authorization-data/local-authorization) (satıcı) |
| OpenFGA, ayrı servis | Zanzibar modelini uygular. Önbellek varsayılan olarak kapalıdır. Daha tutarlı okuma için ayrı bir kip vardır. | İlişki grafiği büyük olunca güçlüdür. | İkinci bir yazma yeri. Plan Üyeliği ile motor ayrışabilir. Zanzibar'ın tutarlılık belirteci henüz yok. | [OpenFGA tutarlılık](https://openfga.dev/docs/interacting/consistency) |
| SpiceDB, ayrı servis | Tutarlılık belirteciyle "en az şu an kadar taze" okuma yapar. | Yeni üyelik ile eski izin arasındaki yarışı çözer. | Ayrı servis ve işletme yükü. Özellik kuralları için genel bir kural dili yok. | [SpiceDB tutarlılık](https://authzed.com/docs/spicedb/concepts/consistency), [Oso karşılaştırması](https://www-webflow.osohq.com/learn/spicedb-alternatives-authorization-tools-comparison) (satıcı, arama özeti) |

**Kanıt.** Open edX, Django üzerinde çalışan büyük bir eğitim platformudur. Open edX bir karar kaydında Casbin'i gömülü olarak seçti. OpenFGA ve SpiceDB'yi "şimdiki ihtiyaç için fazla karmaşık" buldu. Gerekçe, ayrı bir servisin önemli işletme yüküydü ([Open edX karar kaydı](https://docs.openedx.org/projects/openedx-authz/en/latest/decisions/0004-technology-selection.html)).

**Kanıt.** Zanzibar trilyonlarca erişim kaydı taşır. Saniyede milyonlarca isteğe cevap verir ([USENIX, 2019](https://www.usenix.org/conference/atc19/presentation/pang)). Karar Atlası'nın bir kurum sitesi bundan çok küçüktür.

**Kanıt.** Frappe ile OpenFGA, SpiceDB ya da Cedar'ı bağlayan hazır bir çalışma bulunmadı. Arama 16 Kasım 2026 Pazartesi günü yapıldı.

### Karar: şimdi kendi işlevimiz

**Çıkarım.** Şimdi kendi yetki işlevimizi kurun. Beş gerekçe vardır:

1. Her kurumun kendi sitesi vardır. Bir sitedeki ilişki sayısı küçüktür.
2. Kararlar tek veritabanı işleminde ve plan kilidi altında kesinleşir. Dış motor bu işlemin dışında kalır.
3. Dış motor iki ayrı yere yazmayı gerektirir. Üyelik değiştikten hemen sonra eski izin okunabilir.
4. Her kurum için ayrı motor alanı gerekir. Bu yeni bir altyapı işidir. Bu işi DevOps sorumlusu kurar ve işletir.
5. Hangi motor seçilirse seçilsin Frappe'nin sorunları sürer. Kanca açık `True` ister. Liste ile kayıt aynı kuralı taşımalı. Paylaşım kapatılmalı. İzni atlayan uç yetki işlevini çağırmalı.

Kural metnini Cedar biçimine yakın yazın. Böylece kurallar ileride bir motora taşınabilir.

### Dış motoru ne zaman yeniden düşünürsünüz?

| Durum görülürse | Ne yapılır? |
|---|---|
| Kurallar çoğalır ve okunması zorlaşır. | Önce Cedar ya da Casbin gibi gömülü bir motor denenir. Liste koşulu yine elle yazılır. |
| Liste koşullarının elle yazımı hata üretir. | Oso yerel yetki değerlendirilir. Önce lisansı ve fiyatı denetlenir. |
| Holding müşterisi gelir. İç içe şirketler ve planlar oluşur. | Ayrı bir ReBAC servisi düşünülür. |
| Ortağın çok müşterili ekranı siteler arası ilişki ister. | Ayrı bir ReBAC servisi düşünülür. |
| Birden çok servis aynı yetki kararını açıklamak zorunda kalır. | Ayrı bir ReBAC servisi düşünülür. |

## 10. Bütünleşik geliştirme raporuna etkisi

Bu bölüm [bütünleşik geliştirme raporunda](../docs/butunlesik-gelistirme-raporu.md) değişmesi gereken cümleleri listeler. Her satırda bölüm numarası, bugünkü cümle ve düzeltilmiş cümle vardır. Bütünleşik rapor bu rapor yazılırken değiştirilmedi. Düzeltmeyi o raporun sahibi yapar.

### Yetki ve kayıt denetimi

| No | Bölüm | Bugünkü cümle | Düzeltilmiş cümle | Neden? |
|---|---|---|---|---|
| 1 | 3.5 | "Bir kişi bir planda karar sahibi, başka bir planda ekip üyesi olabilir." | Aynı cümle kalır. Arkasına şu cümleler eklenir: "Plan rolleri Frappe rolü değildir. Frappe rolleri bütün sitede geçerlidir. Plan rolü yalnız Plan Üyeliği satırında durur." | Frappe rolü belge başına değildir. |
| 2 | 3.5 | "Atamayı yapan kişi de saklanır." | "Atamayı yapan kişi de saklanır. Atama plan kilidi altında yapılır. Atama 'Karar sahibi atandı' olayını yayar." | Hizmet modeli bu olayla ortağı çağırır. |
| 3 | 4.3 | "Erişim, cihazın anahtarlarını dar bir yetkiye indirir." | "Erişim, Cihaz kaydını iptal edildi diye işaretler. Uygulamanın giriş kancası her istekte bu işarete bakar. İptal edilen cihaz yalnız iki uca ulaşır." | Frappe anahtarın kapsamını uçlarda denetlemez. |
| 4 | 4.3 | Olay tablosunda "Karar sahibi atandı" satırı yok. | Yeni satır: "Karar sahibi atandı. Yayan modül Erişim. Dinleyenler Denetim kaydı ve Eşitleme." | Plan sağlığı listesi bu olayı okur. |
| 5 | 4.4 | "Dört denetim de her kod gönderiminde çalışır." | "Beş denetim de her kod gönderiminde çalışır." Beşinci denetim: "Yasak çağrı taraması. Karar türlerinde `db_set`, `frappe.db.set_value`, `ignore_validate` ve `ignore_validate_update_after_submit` aranır. Plan modüllerinde izni atlayan okuma çağrıları aranır. `ignore_permissions` kullanan her ucun önce `yetki_ver` çağırdığı denetlenir." | Bu çağrılar iki koruma katmanını da atlar. |
| 6 | 5.1 | "Cihaza verilen anahtarların kimlikleri burada durur. İptalde bu anahtarlar dar bir yetkiye iner." | "Cihaza verilen anahtarların kimlikleri burada durur. İptalde anahtar silinmez. Uygulamanın giriş kancası anahtarı Cihaz kaydına bağlar ve yalnız iki uca izin verir." | OAuth kapsamı uçları daraltmaz. |
| 7 | 5.3 | "Bu alanlar Frappe'nin olaylarını atlayan kısa yazma yoluyla yazılmaz." | "Bu alanlar yalnız iş akışı uçlarından yazılır. `db_set`, `frappe.db.set_value`, `ignore_validate` ve `ignore_validate_update_after_submit` karar türlerinde yasaktır. Bunu kod taraması denetler." | Yasak, adıyla yazılınca denetlenebilir. |
| 8 | 6.1 | "Frappe'nin kullanıcı izinleri yalnız bağlantı alanında çalışır." | Aynı cümle kalır. Arkasına şu cümleler eklenir: "Plan üyeliği için kullanıcı izni kullanılmaz. Kullanıcı izninde zaman aralığı yoktur." | Üyeliğin bitiş zamanı vardır. |
| 9 | 6.3 | "Kayıt izni. Tek bir kayıt açılırken de üyelik ve rol denetlenir." | "Kayıt izni. Tek bir kayıt açılırken yetki işlevi çağrılır. Kanca izin verirken açıkça `True` döner. `None` dönmez, çünkü Frappe 16'da `None` red demektir." | Frappe 16 kodu böyle çalışır. Resmî belge bunun tersini söyler. |
| 10 | 6.3 | "Liste koşulu Plan Üyeliği tablosunun adını kullanır." | "Liste koşulu metin SQL değil, sorgu koşulu nesnesi döner. Koşul yetki işleviyle aynı üyelik kuralından üretilir. Kayıt denetimi aynı koşulu tek kayıt üzerinde çalıştırır." | Liste sorgusu kancayı çağırmaz. İki denetim ayrışırsa kayıt sızar. |
| 11 | 6.3 | "Okuma işlevleri her zaman izin denetimli okuma yolunu kullanır. İzni atlayan okuma yolu yalnız sistem işlerinde kullanılır." | Aynı cümleler kalır. Arkasına şu cümle eklenir: "İzni atlayan yollar şunlardır: `frappe.get_all`, `frappe.db.get_all`, `frappe.db.get_value`, `frappe.db.sql`, bayraksız `frappe.qb.get_query` ve denetimsiz `frappe.get_doc`." | Yasak yol adıyla yazılınca taranabilir. |
| 12 | 6.3 | "Tek komut yolu. Karar kayıt türlerine kullanıcı rolleri doğrudan oluşturma ve onaylama izni almaz." | "Tek komut yolu. Karar kayıt türlerinde kullanıcı rolleri oluşturma, yazma ve onaylama izni almaz. İş akışı ucu `ignore_permissions` ile yazar. Bu bayrak kancayı da atladığı için uç önce yetki işlevini kendisi çağırır." | İzni atlayan yazma kancayı atlar. |
| 13 | 6.3 | "Önemli denetimler ayrıca onay öncesi adımında (`before_submit`) da çalışır." | Aynı cümle kalır. Arkasına şu cümle eklenir: "Hiçbir uç `ignore_validate` kullanmaz. Bu bayrak `before_submit` adımını atlar." | İkinci katman bu bayrakla çöker. |
| 14 | 6.3 | Belge paylaşımı için bir kural yok. | Yeni paragraf: "Plan kayıtları paylaşılmaz. Her plan kayıt türü `validate_share` ile yeni paylaşımı reddeder. Rol izin satırlarında paylaşma izni yoktur. Frappe'nin atama aracı plan kayıtlarında kullanılmaz. Bir denetim, plan kayıtlarında paylaşım satırı olmadığını doğrular." | Paylaşım kanca reddini aşar ve listeye girer. |
| 15 | 7.2 | "1. Sunucu kullanıcının karar sahibi olduğunu denetler." | "1. Sunucu yetki işlevini çağırır. İşlev üyeliği sunucu saatine göre ve plan kilidi altında okur. İşlev 'hayır' derse karar yazılmaz." | Kanca bu yolda çalışmaz. |

### Eşitleme, güvenlik, kimlik ve doğrulama

| No | Bölüm | Bugünkü cümle | Düzeltilmiş cümle | Neden? |
|---|---|---|---|---|
| 16 | 5.7 | "UUID. Cihaz kimliği kendisi seçer. Bu tür kimlik sütunu Frappe 16'da var." | "UUID. Cihaz kimliği kendisi seçer. Frappe 16 istemcinin UUID'sini olduğu gibi saklar. Sunucu adı küçük harfli ve tireli standart biçime çevirir." | Frappe yalnız okunabilirliğe bakar. |
| 17 | 5.7 | "Planın kimliğinden ve adımın kodundan hesaplanan UUID. Bu tür UUID'nin adı UUIDv5'tir." | Aynı cümleler kalır. Arkasına şu cümleler eklenir: "Sunucu adı yeniden hesaplar. Gelen ad hesaplanan adla aynı değilse kayıt reddedilir. Ad alanı sabiti API sözleşmesinde yazılır." | Frappe UUIDv5'in doğruluğunu denetlemez. |
| 18 | 8.3 | "1. Sunucu cihazın ve kullanıcının iptal edilip edilmediğine bakar." | Aynı cümle kalır. Arkasına şu cümle eklenir: "Aynı denetim uygulamanın giriş kancasında her istekte çalışır. Hazır REST uçları da bu denetimden geçer." | İptal edilen cihaz hazır uçlardan da okuyabilirdi. |
| 19 | 8.3 | "5. Sunucu kullanıcının izinlerine bakar." | "5. Sunucu yetki işlevini çağırır." | İzinlerin tek kaynağı yetki işlevidir. |
| 20 | 9.3 | "İptal edilen cihaz: Sunucu cihazın anahtarlarını dar bir yetkiye indirir." | "İptal edilen cihaz: Anahtar geçerli kalır. Uygulamanın giriş kancası bu cihazdan gelen her isteği reddeder. Yalnız iki uç açıktır." | OAuth kapsamı daraltmaz. |
| 21 | 9.3 | Güvenlik tablosunda MCP ucu yok. | Yeni satır: "MCP ucu: Kurum sitelerinde `enable_mcp` kapalıdır. Bir test `/api/v2/mcp` adresinin 404 döndüğünü doğrular." | Bu uç ikinci bir yazma yoludur. |
| 22 | 9.3 | Güvenlik tablosunda API anahtarı kuralı yok. | Yeni satır: "API anahtarı: Anahtar kullanıcının bütün rolleriyle çalışır. Yapay zekâ hizmet hesabının rolü karar türlerinde izin taşımaz. Hesap belli IP adresleriyle sınırlanır." | Frappe API anahtarını tam kullanıcıya bağlar. |
| 23 | 12, 4. adım | "A kurumunun üyesi B kurumunun planını açamıyor. Okur rolü karar kaydedemiyor." | Aynı ölçütler kalır. Şu ölçütler eklenir: "Kanca hiçbir durumda `None` dönmüyor. Liste ile kayıt denetimi aynı cevabı veriyor. Paylaşım satırı yazılamıyor. Hazır REST ucuyla karar oluşturulamıyor. MCP ucu 404 dönüyor." | Bölüm 8'deki testler bu adıma aittir. |
| 24 | 15, 15. madde | "Frappe 16'nın cihazın seçtiği UUID adını olduğu gibi sakladığı 1. adımda denenmeli." | "Frappe 16'nın cihazın UUID'sini olduğu gibi sakladığı kodda okundu. Davranış 1. adımda gerçek kurulumda denenmeli." | Kod okuması yapıldı. Kurulum denemesi hâlâ gerekli. |
| 25 | 15, 16. madde | "OAuth anahtarının kimliğinin Cihaz kaydına yazılabildiği ve dar bir yetkiye indirilebildiği 4. adımda denenmeli." | "Frappe OAuth kapsamını uçlarda denetlemez. Bu kodda okundu. 4. adımda giriş kancasının iptal edilen cihazı her istekte durdurduğu denenmeli." | Denenecek şey değişti. |

### Değişmeyen ama dikkat isteyen bölümler

1. Bölüm 14'teki 8. madde "Bildirim modülü bugün eklenmez" der. Bu karar değişmez. Hatırlatmayı ilk yıl iş ortağı ve sizin müşteri başarı sorumlunuz yapar.
2. Bölüm 1'deki Python 3.14 bilgisi kodla desteklendi. Frappe'nin adlandırma kodu `uuid7` işlevini standart kütüphaneden alır.
3. Bölüm 8.6'daki "Üç iş internetsiz hiç yapılamaz" kuralı değişmez. İzin, rol ve eşitleme ayarı yetki işlevinden geçer.

## 11. Önerileri ne değiştirir?

### Hizmet ve ortaklık

| Bu durum görülürse | Öneri şöyle değişir |
|---|---|
| Müşterilerin çoğunda iç stratej çıkar. | Başlangıç paketi isteğe bağlı olur. Kendi kendine kurulum öne çıkar. |
| Pilot sonrası ritim ortak olmadan da sürer. | Üç aylık ortak gözden geçirmesi isteğe bağlı olur. |
| Ritim ortağa rağmen ölür. | Bildirim yedinci modül olarak eklenir. Etkin plan eşikleri yeniden ayarlanır. |
| Danışmanlar ürünü rakip görür. | Ortak programı küçülür. Toplantı yürütme işini sizin ekibiniz yapar. Hizmet payı hesabı yeniden yapılır. |
| Ortaklar hızla müşteri getirir. | Ortak kanalı ilk gelir kaynağı olur. Çok müşterili danışman ekranı öne alınır. |
| Ölçülen destek saati ayda 1 saatin çok üstünde kalır. | Fiyat ya da kurulum ücreti yeniden hesaplanır. Ortağın payı büyür. |
| Mali müşavir kanalı strateji danışmanından çok müşteri getirir. | Danışman tanışma eğitimi genişler. Paraşüt benzeri ücretsiz araç öne alınır. |
| KOSGEB strateji ya da kurumsallaşma danışmanlığı için yeni bir destek satırı açar. | Pilot o satırın kurallarına göre paketlenir. Ortak sertifikası o kurallara bağlanır. |
| Karar sahibi değişimi yenilemeyi etkilemez. | Ortak görüşmesi tetikleyici olmaktan çıkar. |

### Yetki

| Bu durum görülürse | Öneri şöyle değişir |
|---|---|
| Gerçek kurulumdaki test farklı bir denetim sırası gösterir. | Kayıt denetimi ve paylaşım önlemi teste göre yeniden yazılır. |
| Frappe yeni bir sürümde `None` davranışını geri değiştirir. | Kanca yine açık `True` ve `False` döner. Bu yazım iki sürümde de doğrudur. |
| Frappe OAuth kapsamını uçlarda denetlemeye başlar. | Cihaz iptali kapsamla da desteklenir. Giriş kancası yine kalır. |
| Bir müşteri MCP ucunu ister. | Önce karar türlerinin rol izinleriyle kapalı olduğu testle kanıtlanır. Uç yalnız o kurumda açılır. |
| Holding müşterisi gelir. | Ayrı bir ReBAC servisi yeniden düşünülür. |
| İlişki türü sayısı belirgin biçimde artar. | Gömülü bir kural motoru denenir. |

## 12. Karar bekleyen konular

| No | Konu | Önerimiz | Kim karar verir? |
|---|---|---|---|
| 1 | Karar sahibi şirketten ayrılınca yeni atamayı kim yapar? | Bölüm 6'daki beş adımlı öneri | Ürün sahibi |
| 2 | UUIDv5 ad alanı sabiti ve girdi metninin biçimi | API sözleşmesine yazılsın. TypeScript ve Python aynı örnekle sınansın. | Geliştirme ekibi |
| 3 | Plan sağlığı listesinin satıcıya gönderilmesi | Yalnız tarih ve sayı gönderilsin. Müşteri sözleşmesine yazılsın. | Ürün sahibi ve hukukçu |
| 4 | Ortak komisyonu | İlk yıl yalnız yönlendirme. Oran pilotlarda sınansın. | Ürün sahibi |
| 5 | Sertifika fiyatı ve süresi | Türkiye fiyatı araştırılsın. | Ürün sahibi |
| 6 | Ortağın KVKK rolü | Sözleşmede yazılsın. | Hukukçu |
| 7 | Görevlerde Frappe'nin atama aracı kullanılacak mı? | Hayır. Ürünün kendi Görev kaydı kullanılsın. | Geliştirme ekibi |

## Sonuç

Bu araştırma soruyu değiştirdi. Önceki soru şuydu: "Yazılımın yanında hizmet gerekir mi?" Yeni soru şudur: "Hizmet ne zaman bitebilir?" Danışmanlık araştırması bir cevap verir. Hizmet, karar sahibi değişse bile ritim sürünceye kadar bitmemeli. Bu yüzden karar sahibi değişimi ürünün en önemli hizmet işaretidir. Ürün bu anı zaten tek işlemde kaydeder. Hizmet modelinin yapacağı tek şey, bu kaydı bir insana ulaştırmaktır.

Kod okuması da bir ders verdi. Tasarımın riski belgede değil, Frappe'nin varsayılanlarındaydı. Resmî belge `None` için yanlış bilgi veriyor. Paylaşım ayarı eski satırları durdurmuyor. OAuth kapsamı uçları daraltmıyor. Bu yüzden yetki güvenliği tek işlevde, açık değerlerle ve gerçek kurulumda çalışan testlerle kurulmalı. Belgeye güvenmek yetmez.

## Kaynaklar

### Ürün belgeleri

- [Bütünleşik geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md)
- [Belge haritası](../docs/belge-haritasi.md)
- [Geliştirme karar notları](../docs/gelistirme-karar-notlari.md)
- [Süreç haritası](../docs/surec-haritasi.md)
- [Hedef kitle ICP ve personalar](<Hedef kitle ICP ve personalar.md>)
- [Strateji ekibi ve kabul ölçütleri](<Strateji ekibi ve kabul ölçütleri.md>)
- [Gelir modeli ve birim ekonomisi](<Gelir modeli ve birim ekonomisi.md>)
- [Yazılım hizmet ve rol modeli, önceki rapor](<Yazılım hizmet ve rol modeli.md>)
- [Frappe yetki kodu araştırma notları](<../research_notes/Derin hizmet ve yetki modeli/frappe_yetki_kodu.md>)
- [Hizmet ve ortaklık araştırma notları](<../research_notes/Derin hizmet ve yetki modeli/hizmet_ve_ortaklik.md>)
- [Önceki hizmet ve rol notları](<../research_notes/Yazılım hizmet ve rol modeli/hizmet_ve_roller.md>)

### Benimseme ve kolaylaştırma

- [NBER w24249, yönetim müdahaleleri kalıcı mı?](https://www.nber.org/papers/w24249)
- [NBER w24249, PDF](https://www.nber.org/papers/w24249.pdf)
- [American Economic Journal: Applied Economics, 2020](https://www.aeaweb.org/doi/10.1257/app.20180369)
- [VoxDev özeti](https://www.voxdev.org/topic/firms/do-management-interventions-last-evidence-india)
- [Emerald, Journal of Business Strategy, OKR vaka çalışması](https://www.emerald.com/jbs/article/47/1/52/1311605/Engaging-the-entire-organization-how-OKRs-enhance)
- [ResearchGate, banka OKR geçişi](https://www.researchgate.net/publication/404289086_Evaluating_a_large_international_bank's_OKR_rollout_using_universal_deployment_parameters)
- [Prosci, sponsorun rolü](https://www.prosci.com/resources/articles/primary-sponsors-role-and-importance)
- [Prosci, en iyi uygulamalar](https://www.prosci.com/resources/articles/change-management-best-practices)
- [PMC4551776, uygulama kolaylaştırma](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4551776/)
- [PMC6238352, FIRE denemesi](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6238352/)
- [Brightline, EIU anketi](https://www.brightline.org/press/releases/companies-with-great-strategies-often-fall-short-on-execution-says-economist-intelligence-unit-survey/)
- [PMI ve EIU, fayda gerçekleşmesi](https://www.pmi.org/learning/thought-leadership/series/benefits-realization/strengthening-benefits-awareness-csuite-eiu)

### Satıcılar, hizmet paketleri ve müşteri başarısı

- [The Innovator, StrategyFrame](https://theinnovator.news/?p=11868)
- [WorkBoard, OKR koç sertifikası](https://learn.workboard.com/page/okr-coach-certification)
- [WorkBoard, 2. düzey sertifika](https://learn.workboard.com/page/advanced-okr-coach-certification)
- [Cascade, ortaklar](https://www.cascade.app/partners)
- [Spider Strategies, ortaklar](https://www.spiderstrategies.com/partners)
- [ClearPoint, fiyat](https://clearpointstrategy.com/pricing)
- [Gainsight, müşteri başarı sorumlusu oranı](https://www.gainsight.com/blog/gainsight-horizon-ai-labs-what-is-the-right-csm-to-customer-ratio/)
- [Tomasz Tunguz, müşteri başarısı rehberi](https://tomtunguz.com/customer-success-guide/index.md)
- [Rework, başlangıç ölçütleri](https://resources.rework.com/libraries/post-sale-management/onboarding-metrics)
- [shno.co, başlangıç istatistikleri](https://www.shno.co/marketing-statistics/saas-onboarding-statistics)
- [Perspective AI, konuşma işaretleri](https://getperspective.ai/blog/at-risk-customer-identification-the-conversational-signals-that-beat-usage-data-alone)
- [PulseRevOps](https://pulserevops.com/knowledge/q196)
- [Orb, SaaS brüt marj istatistikleri](https://www.withorb.com/blog/saas-growth-margin-statistics)

### Türkiye: ortaklar, danışmanlar ve kamu destekleri

- [Logo faaliyet raporu, 31 Mart 2026](https://cdn.logo.com.tr/Files/logocomtr/Uploads/Documents/Faaliyet-Raporu-31-Mart-2026.pdf)
- [Logo faaliyet raporu, 31 Mart 2025](https://cdn.logo.com.tr/files/logocomtr/Uploads/Documents/Faaliyet_Raporu_31_Mart_2025.pdf)
- [Logo ekonomik etki analizi](https://cdn.logo.com.tr/files/logocomtr/Uploads/Documents/Logo-Yazilim-40-Yil-Ekonomik-Etki-Analizi-060325.pdf)
- [Paraşüt, mali müşavir kanalı](https://www.parasut.com/mali-musavir-kanali)
- [Microsoft ortak blogu](https://partner.microsoft.com/tr-tr/blog/article/accelerating-growth-through-partners-in-the-era-of-ai)
- [SAP Türkiye haberi](https://news.sap.com/turkey/2024/05/sap-turkiye-ve-is-ortaklari-turkiyenin-teknolojideki-dinamizmini-ve-gelecek-vizyonunu-masaya-yatirdi/)
- [MirAdvisory, strateji](https://miradvisory.com/tr/hizmetler/strateji)
- [Süreç Danışmanlık](https://www.surec.com.tr/stratejik-planlama-calistayi)
- [Natus Danışmanlık](https://natusdanismanlik.com/hizmetler/alt-sistem-kurulum-iyilestirme-hizmetleri/stratejik-planlama-calistayi-organizasyonu/)
- [Son Dakika, Samsun TSO](https://sondakika.com/ekonomi/haber-samsun-tso-30-firmanin-yapay-zeka-destekli-ikiz-do-20420051)
- [KOSGEB YÖNDE yönergesi, 3. revizyon](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/YONDE/2026/2026.07.14/Y%C3%96NDE-Y%C3%B6nderlikveDe%C4%9FerlendirmeDestekProgram%C4%B1Y%C3%B6nergesi05.07.26.pdf)
- [KOSGEB SEGEM yönergesi](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/SEGEM/14.05.2026/SEGEMDestekProgram%C4%B1Y%C3%B6nergesi.pdf)
- [CNBC-e, Kapasite Geliştirme ikinci çağrı](https://www.cnbce.com/is-dunyasi/kosgeb-destek-programinda-ikinci-donem-basvurulari-basladi-ust-limit-30-milyon-liraya-yukseltildi-h31165)
- [OKA, 2026 teknik destek rehberi](https://oka.gov.tr/assets/upload/dosyalar/tr83-26-td-tur_-basvuru-rehberi.pdf)
- [Ankara Kalkınma Ajansı, 2026](https://ankaraka.org.tr/sites/default/files/article-documents/2026_aka_ankarasaglikturizm-1.pdf)
- [FKA, 2026 teknik destek rehberi](https://fka.gov.tr/sharepoint/userfiles/Icerik_Dosya_Ekleri/2026_TD_Basvuru_Rehberi/2026_TD_Başvuru_Rehberi.pdf)
- [erp-software.org, Türkiye](https://erp-software.org/en/erp-worldwide/turkey/)
- [Forbes Türkiye, 4 Şubat 2026](https://www.forbes.com.tr/dergi/kurucular-temkinli-ikinci-kusak-hizli-dijital-donusum-gerilim-yaratiyor)
- [Capital, "Her aileye bir anayasa"](https://www.capital.com.tr/yonetim/liderlik/her-aileye-bir-anayasa)
- [TKYD, aile şirketleri için kurumsal yönetim](https://www.tkyd.org/wp-content/uploads/2022/12/TKYD_Turkiyede-Aile-Sirketleri-Icin-Kurumsal-Yonetim_01112021.pdf)

### Sertifika

- [IAF, sertifika ücret kuralları](https://iaf-world.org/iaf-certification-fee-policies/)
- [IAF, ücret listesi](https://iaf-world.org/pd-fees-list-and-policy-20260312/)
- [Balanced Scorecard Institute, profesyonel sertifika](https://balancedscorecard.org/training-certification/balanced-scorecard-professional-certification)

### Frappe 16 kaynak kodu, v16.56.0

- [`permissions.py`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/permissions.py)
- [`database/query.py`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/database/query.py)
- [`model/document.py`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/document.py)
- [`model/naming.py`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/naming.py)
- [`model/workflow.py`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/workflow.py)
- [`auth.py`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/auth.py)
- [`share.py`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/share.py#L183-L214)
- [`core/doctype/docshare/docshare.py`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/core/doctype/docshare/docshare.py)
- [`desk/form/assign_to.py`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/desk/form/assign_to.py#L120-L134)
- [`api/v1.py`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/api/v1.py)
- [`api/v2.py`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/api/v2.py)
- [`client.py`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/client.py)
- [`mcp/__init__.py`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/mcp/__init__.py)
- [`permissions.py`, version-15, karşılaştırma için](https://github.com/frappe/frappe/blob/2e9ecdc03fa5b5b8d1ba05224a1aff7dad832bd0/frappe/permissions.py#L455-L471)
- [Frappe hooks belgesi](https://docs.frappe.io/framework/user/en/python-api/hooks)

### Yetki modelleri ve motorlar

- [NIST SP 800-162, ABAC rehberi](https://csrc.nist.gov/pubs/sp/800/162/upd2/final)
- [OpenFGA, yetki kavramları](https://openfga.dev/docs/authorization-concepts)
- [OpenFGA, tutarlılık](https://openfga.dev/docs/interacting/consistency)
- [SpiceDB, tutarlılık](https://authzed.com/docs/spicedb/concepts/consistency)
- [Oso, yerel yetki](https://www.osohq.com/docs/authorization-data/local-authorization)
- [Oso, SpiceDB seçenekleri](https://www-webflow.osohq.com/learn/spicedb-alternatives-authorization-tools-comparison)
- [cedar-py](https://github.com/k9securityio/cedar-py)
- [Cedar, terimler](https://docs.cedarpolicy.com/overview/terminology.html)
- [Open edX, teknoloji seçimi karar kaydı](https://docs.openedx.org/projects/openedx-authz/en/latest/decisions/0004-technology-selection.html)
- [USENIX, Zanzibar makalesi, 2019](https://www.usenix.org/conference/atc19/presentation/pang)

## Denetim notu

Bu notu Claude 16 Kasım 2026 Pazartesi günü yazdı.

1. Denetim betiği bu rapor üzerinde çalıştırıldı. Betiğin adı `yalin-turkce-denetim.mjs`'dir.
2. Betik 15 kelimeyi aşan açıklamaları işaretledi. Bu cümleler bölündü.
3. Betik, kalın etiketli cümleleri tek cümle saydı. Örneğin "**Çıkarım.**" etiketi cümleye eklendi. Bu yüzden bazı cümleler 11 ile 15 kelime görünür. Bu cümleler tek tek okundu.
4. Betik dosya yollarındaki eğik çizgiyi uyardı. Dosya yolları kod biçimine alındı. Eğik çizgi yolun kendi sözdizimidir.
5. Uzun kelime uyarıları incelendi. "Sertifikalı", "kullanıcının" ve "danışmanlığı" gibi kelimeler raporun konusudur. Bu kelimelerin daha kısa günlük karşılığı yoktur.
6. Kod bloklarında kodun kendi sözdizimi korundu. Kod içindeki İngilizce adlar Frappe'nin adlarıdır.
7. Bazı tablo hücreleri kısa alan listesi olarak yazıldı. Örneğin kaynak ve okunma düzeyi hücreleri.
8. Metinde noktalı virgül, uzun çizgi ve ok işareti arandı. Kod blokları dışında hiçbiri bulunmadı.
9. Metinde "stratej" kelimesinin yanlış uzun yazımı arandı. Bu yazım bulunmadı.
10. Rapor herkese açık bir depoya girer. Raporda özel bir kişinin adı yoktur. DevOps görevlisi rol adıyla anıldı.
11. Araştırma notlarında kaynağı olmayan bilgi rapora alınmadı. Notlardaki kaynaksız oranlar ve satıcı iddiaları ayrıca işaretlendi.
12. Bütün sıklıklar, eşikler, süreler ve sertifika koşulları hipotezdir.
13. Hiçbir yetki kuralı ve hiçbir Frappe iddiası çalışan bir Frappe 16 kurulumunda sınanmadı.
14. Belge haritası ve bütünleşik geliştirme raporu bu iş sırasında değiştirilmedi. İkisinin güncellenmesi ayrı bir iştir.

Gerçek okurla denenmedi.
