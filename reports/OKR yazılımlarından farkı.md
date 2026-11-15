# OKR aracı ölçer, bu ürün seçimi kurar

## 1. Kısa cevap

Bu ürün bir OKR yazılımı değildir. OKR yazılımları stratejinin zaten seçildiğini varsayar. Bu ürün ise seçimin kendisini kurar ve sınar. Stratej asıl güçlüğü yazar, yolları yan yana koyar ve en zayıf koşulu sınar. Karar sahibi yolu seçer ve neyden vazgeçtiğini yazar. OKR araçları bu işlerin hiçbirini yapmaz. Ürün, OKR programının yalnız bir parçasını yapar. Bu parça, tek bir plan için hedef ve gösterge yazmaktır. Gerçekleşen değeri zamana göre izlemek bugün eksiktir. Ekipler arası hizalama, düzenli kontrol hatırlatması ve puanlama da yoktur.

Önerimiz dört parçalıdır:

1. Ürüne küçük bir uygulama katmanı ekleyin. Bu katman gerçekleşen değeri ve iş durumunu izlesin. Gözden geçirmeyi ve harcamayı da izlesin.
2. Ürünü tablolara, muhasebe programlarına ve büyük müşteride OKR araçlarına bağlayın.
3. Ekipler arası hedef ağacını bilerek dışarıda bırakın. Puanlamayı ve çalışan değerlendirmesini de dışarıda bırakın.
4. Ürünü "OKR yazılımı" diye satmayın. Bu ad ürünü kullanıcı başına ucuz fiyatlı araçlarla kıyaslatır.

### Bu raporu nasıl okursunuz?

Rapor 15 Kasım 2026 Pazar günü yazıldı. Dış bilgiler araştırma notlarından gelir. Ürün bilgileri depodaki belgelerden ve koddan gelir.

Raporda üç işaret vardır:

- **Kanıt** başlığı, kaynağı olan bilgiyi gösterir.
- **Çıkarım** başlığı, bizim yorumumuzu gösterir.
- **Kaynak türü** notu, kaynağın gücünü gösterir. Satıcı sayfası ve kitap özeti zayıf kaynaktır.

Rapor şu sabit ürün kararına uyar: "Stratej yolu önerir ve gerekçesini kurar. Karar sahibi seçer ve kaydeder." Stratej, stratejiyi geliştiren kişinin unvanıdır. Yapay zekâ hiçbir zaman seçim yapmaz. Yapay zekâ seçimi de yazmaz.

Ürünün bugünkü durumunu bilerek okuyun. Canlı sürüm yalnız tarayıcıda çalışır. Sunucu yoktur ve veri tarayıcıda durur ([README.md](../README.md)). Sunucu tasarımı bütünleşik geliştirme raporundadır. Bu tasarımın kodu henüz yazılmadı ([bütünleşik geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md)). Raporda "planda" denen her şey bu tasarımdan gelir.

## 2. Terimler ve üründen bir örnek

### OKR

OKR, İngilizce "Objectives and Key Results" sözünün kısaltmasıdır. Türkçesi "hedefler ve anahtar sonuçlar"dır. OKR bir hedef koyma ve izleme düzenidir. OKR bir strateji seçme yöntemi değildir.

### Hedef (objective)

Hedef, ne başarmak istediğinizi söyler. Hedef kısa bir cümledir. Hedefte sayı olmak zorunda değildir.

### Anahtar sonuç (key result)

Anahtar sonuç, hedefe ulaştığınızı nasıl anlayacağınızı söyler. Anahtar sonuç her zaman ölçülebilir bir sayıdır. Bu ürün anahtar sonuca "gösterge" der.

### Düzenli kontrol (check-in)

Düzenli kontrol kısa bir ilerleme kaydıdır. Ekip üyesi her hafta ya da her ay güncel sayıyı yazar. Bir engel varsa onu da yazar.

### Basamaklama (cascading)

Basamaklamada hedef yukarıdan aşağı iner. Şirket hedefi bölüm hedefine bölünür. Bölüm hedefi de kişi hedefine bölünür.

### Hizalama (alignment)

Hizalamada ekip kendi hedefini yazar. Sonra bu hedefi bir üst hedefe bağlar. Öneri aşağıdan da gelebilir. Google iki yönün karışımını önerir ([Google re:Work](https://rework.withgoogle.com/en/guides/set-goals-with-okrs)).

### Strateji yürütme paketi

Strateji yürütme paketi büyük kurumlar için yazılımdır. Hedefleri, projeleri ve bütçeyi birlikte izler. Cascade ve ClearPoint bu türdendir.

### API ve MCP

API, iki programın birbirine veri göndermesini sağlayan kapıdır. MCP, yapay zekâ araçlarının başka programlara bağlanma yoludur.

### Kurumsal kaynak planlama yazılımı

Bu yazılım şirketin muhasebe, stok ve satış kayıtlarını tutar. Logo ve Mikro bu tür programlar sunar.

### Salt okunur bağlantı

Salt okunur bağlantı başka programdan yalnız veri okur. O programdaki kayda dokunmaz.

### Zamanlanmış iş

Zamanlanmış iş, sunucunun belli bir saatte kendiliğinden yaptığı iştir. Örneğin sunucu her sabah hatırlatma e-postası gönderir.

### Üründen bir örnek

Ürünün 3.1 adımı "Hedef ve gösterge" adını taşır. Bu adım bir OKR satırına çok benzer. Kodda alanların adı da "objective" ve "keyResults"dır ([strateji.ts](../src/data/steps/strateji.ts)).

| Alan | Ekranda yazan | Örnek değer |
|---|---|---|
| Hedef | "Hedef" | İlk 10 ödeyen müşteriyi kazanmak. |
| Gösterge | "Gösterge" | Ödeyen müşteri sayısı |
| Başlangıç | "Başlangıç değeri" | 0 |
| Hedef sayı | "Hedef sayı" | 10 |

Hedef cümlesi ekrandaki örnek yazıdan alındı. Sayılar bu raporun örneğidir.

Bir OKR aracında ekip üyesi her hafta güncel sayıyı girer. Örneğin üçüncü haftada "4" yazar. Bu ürün bugün bu sayıyı saklayamaz. Çünkü 3.1 adımında gerçekleşen değer alanı yoktur. Planlanan "Gözlem" kaydı bu boşluğu kapatır.

Basamaklama ve hizalamanın üründe örneği yoktur. Ürün tek bir plan için çalışır. Bölüm hedeflerine inen bir hedef zinciri yoktur.

## 3. OKR programı seçimi değil, izlemeyi düzenler

### Kanıt

Andy Grove yöntemi 1970'lerde Intel'de geliştirdi. Yöntemi 1983'te "High Output Management" kitabında anlattı ([Wikipedia](https://en.wikipedia.org/wiki/Objectives_and_key_results)). John Doerr yöntemi Intel'de öğrendi. Doerr yöntemi 1999 civarında Google'a taşıdı ([Wikipedia](https://en.wikipedia.org/wiki/Objectives_and_key_results)). Bu tarihler ikinci el kaynaktan gelir.

Google'ın kendi rehberi şu kuralları verir ([Google re:Work](https://rework.withgoogle.com/en/guides/set-goals-with-okrs)):

- Bir dönemde 3 ile 5 hedef yazılır.
- Her hedefin yaklaşık 3 anahtar sonucu olur.
- Google yıllık ve çeyreklik OKR yazar.
- Her anahtar sonuç 0 ile 1 arasında puanlanır.
- En iyi puan 0,6 ile 0,7 arasıdır.
- Hep tam puan alınıyorsa hedefler yeterince iddialı değildir.
- OKR'ler herkese açıktır.
- OKR çalışan değerlendirmesiyle aynı şey değildir.

Doerr OKR'yi ücretten ayrı tutar. Doerr'in sitesindeki yazının başlığı bunu açıkça söyler ([whatmatters.com](https://www.whatmatters.com/articles/should-you-connect-okrs-and-compensation-spoiler-alert-no)). Google bir kez ürün hedeflerini doğrudan prime bağladı. Laszlo Bock'a göre çalışanlar sonra sistemi oyuna çevirdi ([whatmatters.com](https://whatmatters.com/stories/okrs-separate-pay-compensation-bonuses)).

Doerr OKR'nin yanına CFR'yi ekler. CFR "konuşma, geri bildirim ve takdir" demektir. Bu üçü ekibin insan tarafını yürütür ([whatmatters.com](https://www.whatmatters.com/resources/difference-between-okr-cfr)).

### Çıkarım

Bir OKR programının beş parçası vardır:

1. Hedef ve anahtar sonuç ağacı
2. Herkese açık görünürlük ve ekipler arası hizalama
3. Düzenli kontrol ritmi
4. Dönem sonunda puanlama
5. Konuşma, geri bildirim ve takdir katmanı

Bu kaynakların hiçbiri durumu nasıl teşhis edeceğinizi anlatmaz. Seçenek üretmeyi ve seçenekler arasında seçmeyi de anlatmaz. OKR yönün zaten bilindiğini varsayar.

## 4. 2026'da OKR araçları ölçmeyi ve raporlamayı satar

### Kanıt

Aşağıdaki bilgiler çoğunlukla satıcı sayfalarından gelir.

| Araç | Türü | Öne çıkan iş |
|---|---|---|
| Perdoo | Küçük ve orta şirket için OKR aracı | Slack, Teams, Salesforce, HubSpot, Jira ve tablolarla bağlantı. GraphQL API, Zapier ve MCP sunucusu ([Perdoo](https://www.perdoo.com/integrations)) |
| Tability | OKR aracı | Slack ile düzenli kontrol, hatırlatma ve yapay zekâ özeti ([Tability](https://www.tability.io/compare/slack)) |
| Weekdone | OKR aracı | Haftalık "plan, ilerleme, sorun" raporu ve 15 ile 20 dakikalık toplantı ([Weekdone](https://weekdone.com/?p=16552)) |
| Lattice | İnsan kaynakları paketi | Hedefi birebir görüşmeye ve performans görüşmesine bağlar ([Lattice](https://lattice.com/platform/goals/okrs)) |
| Betterworks | Performans yönetimi | Şirket hedefini kişi hedefine basamaklar. Hedefi değerlendirmeye taşır ([Betterworks](https://www.betterworks.com/betterworks-vs-ukg)) |
| Profit.co | Modüler paket | OKR, dengeli karne, Hoshin Kanri ve proje modülleri ([Profit.co](https://www.profit.co/pricing/)) |
| WorkBoard | Kurumsal paket | Mayıs 2025'te Quantive'i satın aldı ([Silicon UK](https://www.silicon.co.uk/press-release/workboard-acquires-quantive-to-strengthen-its-strategy-execution-and-okr-software-advantage-and-accelerate-innovation)). Senaryo modelleyen yapay zekâ ajanı sunar ([TechIntelPro](https://techintelpro.com/news/ai/enterprise-ai/workboard-launches-ai-native-strategic-portfolio-management-with-portfolio-analyst-agents)) |
| ClearPoint | Strateji yürütme paketi | Proje bütçesini planla karşılaştırır. Harcama bütçeye yaklaşınca uyarır ([ClearPoint](https://clearpointstrategy.com/features)) |
| Cascade | Strateji yürütme paketi | Yapay zekâ tekrar eden işleri, bağımlılıkları ve riskleri işaretler ([Cascade](https://www.cascade.app/tapestry/ai-assisted-planning)) |
| Viva Goals | Microsoft'un OKR aracı | 31 Aralık 2025 Çarşamba günü kapandı. Microsoft kullanımın büyümediğini söyledi ([Microsoft Learn](https://learn.microsoft.com/viva/goals/goals-retirement)) |

ClearPoint hedef müşterisini açıkça tarif eder. Hedef müşteri, zaten hedefi ya da stratejisi olan kurumdur ([ClearPoint](https://www.clearpointstrategy.com/pricing)).

### Çıkarım

2026'da bir OKR aracında şu beş iş beklenir:

1. Hedef ağacı ve hizalama haritası
2. İş programlarından canlı akan gösterge değerleri
3. Slack ya da Teams üzerinden kontrol hatırlatması
4. Yapay zekâ ile hedef taslağı ve kontrol özeti
5. Yönetici panosu

İnsan kaynakları araçları bunlara birebir görüşme ve değerlendirmeyi ekler. Strateji yürütme paketleri proje ve bütçe takibini ekler. Hiçbir araç hedefin arkasındaki seçimi sınamaz. Araçlar seçimin doğru olduğunu varsayar.

Bu ürün tam da OKR araçlarının başladığı yerde biter. OKR araçlarının işi ürünün 3. kümesinde başlar.

## 5. Uzmanlar hedefin strateji olmadığını söyler

### Kanıt

**Richard Rumelt.** Rumelt kötü stratejinin dört işaretini sayar. Bunlardan biri "hedefi strateji sanmak"tır. Rumelt'e göre stratejinin özü üç parçadır. Bu parçalar teşhis, yol gösteren ilke ve tutarlı eylemdir ([Leading Sapiens](https://www.leadingsapiens.com/leaders-mistakes-okr-strategy/), [Mooncamp kitap özeti](https://mooncamp.com/blog/good-strategy-bad-strategy-book-summary)). Rumelt'in OKR'yi kendisinin eleştirdiği bir söyleşi bulunmadı. OKR eleştirileri Rumelt'i başkalarının ağzından aktarır.

**Roger Martin.** Martin'e göre OKR, stratejinin gizli bir yedeğine dönüşebilir. Martin OKR'yi stratejinin tamamlayıcısı sayar. Martin'e göre bir sonucu istemek o sonucu doğurmaz ([Jeff Gothelf](https://jeffgothelf.com/blog/okrs-are-not-strategy), [What's Next! podcast](https://whatsnextpodcast.libsyn.com/why-your-okrs-arent-working-with-roger-martin)). Martin'in özgün denemesi okunmadı.

**Sull, Homkes ve Sull.** Bu araştırma Mart 2015'te Harvard Business Review'da çıktı. Araştırma 250'den fazla şirkette yaklaşık 8.000 yöneticiyi kapsar. Araştırmaya göre uygulama en çok birimler birlikte çalışamayınca aksar. Daha çok ölçü eklemek çalışanı sıkı denetlenmiş hissettirir ([O'Reilly, HBR Guide bölümü](https://www.oreilly.com/library/view/hbr-guide-to/9781647825164/html/11_3__Why_Strategy_Execution_Unrave.xhtml)).

**Başarısızlık oranları.** Bu sayıların hepsi satıcıdan ya da danışmanlık şirketinden gelir:

- OKR Institute'a göre OKR uygulamalarının %60'tan fazlası beklenen sonucu vermez ([OKR Institute](https://okrinstitute.org/why-okrs-fail/)).
- Tability'nin aktardığı ankete göre ekiplerin %78'i OKR'yi ilk denemede doğru kuramaz ([Tability](https://tability.io/odt/articles/bring-the-okr-pain-forward)).
- Profit.co'ya göre kurumsal programların yarısından çoğu ilk yıldan sonra küçülür ya da bırakılır ([Profit.co](https://www.profit.co/blog/okr-university/why-most-enterprise-okr-programs-fail-in-year-two/)).

### Kaynakların gücü

| Kaynak | Ne söyler? | Kaynak türü | Güven |
|---|---|---|---|
| Google re:Work | OKR kuralları ve puanlama | Uygulayanın kendi rehberi | Yüksek |
| Rumelt | Hedef strateji değildir. | Kitap özeti ve blog | Orta. Kitap okunmadı. |
| Martin | OKR stratejinin yerini tutmaz. | Podcast ve başka bir yazarın blogu | Orta. Özgün deneme okunmadı. |
| Sull, Homkes ve Sull | Sorun çoğu zaman birimlerin birlikte çalışamamasıdır. | HBR rehberindeki bölüm ve özet | Orta ile yüksek arası |
| Başarısızlık oranları | Programların çoğu aksar. | Satıcı ve danışman | Düşük. Yalnız yönü gösterir. |
| Viva Goals kapanışı | Kullanım büyümedi. | Microsoft'un kendi duyurusu | Yüksek |

### Çıkarım

Ürün Rumelt ve Martin çizgisini zaten izler. 2.1 adımının yardım metni "Bir hedef ya da bir çözüm yazmayın." der ([strateji.ts](../src/data/steps/strateji.ts)). Süreç haritası hedefi seçimden ayırır. Haritaya göre "Hedef ve iş, seçimin değil uygulamanın parçasıdır." ([süreç haritası](../docs/surec-haritasi.md)). Yöntem kütüphanesi OKR'yi 65 numaralı yöntem olarak taşır. 3.1 adımı bu yönteme bağlanır ([models.json](../src/data/models.json)).

Savunulabilir konum cümlesi şudur: OKR stratejiyi ölçer, bu ürün seçimi kurar ve yeniden sınar. Başarısızlık oranlarını satışta kanıt diye kullanmayın. Çünkü bu sayıları rakip satıcılar üretti.

Sull araştırması bir uyarı da verir. Ürüne yalnız hizalama eklemek uygulamayı düzeltmez. Birimlerin birlikte çalışması ve hızlı düzeltme daha önemlidir. Ürünün 3.5 döngüsü bu ihtiyaca daha yakındır.

## 6. Yetenek karşılaştırması: ürün OKR'nin boş bıraktığı yerde güçlü

### Kanıt

Tablodaki işaretler şunlardır: "Var", "Kısmen", "Yok", "Planlı" ve "Doğrulanmadı". Ürün bilgisi tablonun altındaki dosyalardan gelir. Rakip bilgisi 4. bölümdeki kaynaklardan gelir.

| Yetenek | Tipik OKR aracı | Strateji yürütme paketi | Bu ürün bugün | Bu ürün planda |
|---|---|---|---|---|
| Durumu teşhis etmek | Yok | Kısmen. Strateji haritası var. Yapılı teşhis bulunmadı. | Var. 2.1 adımı | Var. Kurallar sunucuya taşınır. |
| Seçenek üretmek | Yok | Kısmen. WorkBoard senaryo modeli sunar. Diğerleri doğrulanmadı. | Var. 2.2 adımında 2 ile 5 yol | Var |
| Seçenekleri sınamak | Yok | Bulunmadı | Var. 2.3 adımı. En zayıf koşul ve dört ölçütlü puan | Var |
| Seçimi ve vazgeçileni kaydetmek | Yok | Bulunmadı | Var. 2.4 adımında "Vazgeçilenler" zorunludur. | Var. "Strateji Onayı" kaydı |
| Kanıt ve hazırlık kapısı | Yok | Bulunmadı | Var. 9 zorunlu ve 7 destekleyici ölçüt | Var. Sürümlü kanıt ve "Geçiş Kararı" |
| Gerekçeli karar günlüğü | Kısmen. Yorum ve kontrol notu | Kısmen. Doğrulanmadı | Var. Kapı kararları ve gözden geçirme kaydı | Var. Kural sürümü ve okunan değer saklanır. |
| Kaynak izni ve harcama takibi | Yok | Var. ClearPoint bütçeyi planla karşılaştırır. | Kısmen. 3.3 adımı dağıtımı yazar. Gerçek harcama yok. | Planlı. "Kaynak İzni" ve "Kaynak Hareketi" |
| Hedef yazmak | Var | Var | Var. 3.1 adımında 1 hedef ve en çok 3 gösterge | Var. Sürümlü "Hedef" kaydı |
| Hedefi gerçekleşenle zamana göre karşılaştırmak | Var. Canlı göstergeler | Var | Kısmen. Başlangıç ve hedef var. Gerçekleşen değer yok. | Planlı. "Gözlem" kaydı |
| Ekipler arası basamaklama ya da hizalama | Var | Var | Yok | Yok. Planda bulunmadı. |
| Haftalık ya da çeyreklik kontrol | Var. Slack ve Teams hatırlatması | Var | Kısmen. Haftalık soru düğmesi ve gözden geçirme kaydı | Kısmen. "Sonraki kontrol tarihi" var. Hatırlatma tasarlanmadı. |
| 0 ile 1 arası puanlama | Var | Kısmen | Yok | Yok |
| İlerleme bağlantıları, örneğin Jira ve tablolar | Var | Var | Yok. Yalnız yedek dosyası indirilir. | Yok. API var, hazır bağlantı yok. |
| Kişi ve performans bağı | Var. İnsan kaynakları araçlarında | Yok ya da kısmen | Yok | Yok |
| Yapay zekâ ile taslak ve özet | Var | Var | Yok | Kural yazıldı. Ayrıntılı tasarım yok. |
| Telefondan saha gözlemi | Kısmen. Mobil kontrol ekranı | Doğrulanmadı | Kısmen. Ekran telefona göre kurulu. Gözlem kaydı yok. | Planlı. "Hedefsiz saha notu" ve telefon uygulaması |
| İnternetsiz çalışmak | Bulunmadı | Bulunmadı | Kısmen. Veri tarayıcıda durur. Çevrimdışı katman bulunmadı. | Planlı. Cihaz önce kendine yazar, sonra eşitler. |
| Seçimi yeniden sınama döngüsü | Yok | Bulunmadı | Var. 3.5: "Sürdür", "Düzelt" ve "Yeniden aç" | Var. "Sapmanın nedeni" alanı eklenir. |

Ürünün bugünkü bilgisi şu dosyalardan gelir: [clusters.ts](../src/data/clusters.ts), [strateji.ts](../src/data/steps/strateji.ts), [readiness.ts](../src/engine/readiness.ts), [renewal.ts](../src/engine/renewal.ts) ve [süreç haritası](../docs/surec-haritasi.md). Kaynak kodda Jira, Slack, HubSpot ve Salesforce bağlantısı bulunmadı. Kaynak kodda yapay zekâ çağrısı da bulunmadı. Planlı satırlar [bütünleşik geliştirme raporunun](../docs/butunlesik-gelistirme-raporu.md) 5. ve 7. bölümlerinden gelir.

Tek kurucu için hizalama bilerek çıkarıldı. Plan belgesine göre bu aşama tek kurucuda boş kalır. Sorumluluk 3.2 adımında durur ([sonraki ana aşamalar planı](../docs/sonraki-ana-asamalar-plani.md)).

### Ürün OKR programının işini yapıyor mu?

| OKR programının parçası | Bu ürün bugün | Bu ürün planda |
|---|---|---|
| Hedef ve anahtar sonuç | Var. Tek plan için | Var. Sürümlü |
| Görünürlük ve hizalama | Yok | Yok |
| Düzenli kontrol ritmi | Kısmen | Kısmen |
| Dönem sonu puanlama | Yok | Yok |
| Konuşma, geri bildirim ve takdir | Yok | Yok |

### Çıkarım

Dürüst cevap şudur: Ürün OKR programının yalnız hedef yazma parçasını yapar. Bu parçayı da tek bir plan için yapar. Bu yüzden ürün bir OKR aracı değildir.

Buna karşılık ürün OKR araçlarının boş bıraktığı altı işi yapar. Bu işler teşhis, seçenek, sınama, vazgeçiş, hazırlık kapısı ve yeniden sınamadır. Planlı "Hedef" ve "Gözlem" çifti en sık beklenen işi karşılar. Bu iş, hedefi gerçekleşenle zamana göre karşılaştırmaktır.

## 7. Eklenmesi gerekenler: ikinci bir araca ihtiyaç bırakmayın

### Çıkarım

Müşteri gerçekleşeni göremezse ikinci bir araç alır. O zaman 3.5'teki "Seçim hâlâ doğru mu?" sorusu hafızaya dayanır. Aşağıdaki altı iş bunu önler. İşleri geliştirme ekibi yapar. Yazılım burada da yol seçmez.

1. **Gerçekleşen değeri zamana göre kaydedin.** Planlı "Hedef" ve "Gözlem" kayıtlarını yazın. Ekip üyesi her gözlemi tarihiyle girer. Çünkü 3.1 adımında bugün gerçekleşen değer alanı yoktur.
2. **Tek bir ölçüm düzeni kurun.** Kapı 6 bugün Adım 22'deki ölçüleri okur. Strateji hedefi ise 3.1 adımında durur. İkisini birleştirin. Birleştiremezseniz iki listeyi ayrı adlarla gösterin. Yoksa kullanıcı iki hedef listesi görür. Geliştirme raporu bu birleşmeyi "ayrı bir iş" sayar ([bütünleşik geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md)).
3. **İş durumunun geçmişini saklayın.** Planlı "Görev" kaydında durum alanı var. Durum değişikliklerinin tarihli geçmişini de saklayın. Çünkü geçmiş olmadan işin ne zaman aksadığı görülmez.
4. **Düzenli gözden geçirmeyi ekranda gösterin.** "Sonraki kontrol tarihi" ana ekranda görünsün. Gözden geçirme ekranı son gözlemleri kanıt olarak göstersin. Karar sahibi kararı yine kendisi kaydeder. Çünkü 3.5 kaydı bugün kanıtı serbest metinle alır.
5. **Kontrol tarihi yaklaşınca hatırlatma gönderin.** Hatırlatma sunucuda zamanlanmış iş olarak çalışır. Örneğin Frappe'nin zamanlayıcısı bu işi yapar. Frappe, ürünün planlanan sunucu altyapısıdır. Bu normal bir ürün özelliğidir. Zamanlanmış işi DevOps mühendisi kurar. Hatırlatma karar sahibine ve sorumlu ekip üyesine gider. Haftalık darboğaz sorusu da aynı yolla hatırlatılabilir. Çünkü tablolar çoğu zaman yalnız toplantıdan önce güncellenir ([Waymaker](https://www.waymakeros.com/learn/okrs-fail-in-spreadsheet)). Bu kaynak bir satıcı blogudur.
6. **Kaynak iznini ve harcamayı izleyin.** Planlı "Kaynak İzni" ve "Kaynak Hareketi" kayıtlarını yazın. Çünkü OKR araçlarında bütçe katmanı yoktur. ClearPoint bu işi kurumsal düzeyde satar ([ClearPoint](https://www.clearpointstrategy.com/solutions/project-management)).

Yedinci iş bir sonraki bölümdeki bağlantılardır. Gerçekleşen değeri tablodan içe aktarma bu listeye de girer.

### Yapay zekâ bu katmanda ne yapabilir?

Yapay zekâ bugün üründe yoktur. Kural bellidir: Yapay zekâ taslak yazar ve seçenekleri genişletir. Yapay zekâ seçim yapmaz ve seçimi yazmaz. Kapı onaylamaz, kaynak izni vermez ve çalışanı puanlamaz.

Bu kurala uyan iki iş vardır:

1. Yapay zekâ gözlemlerden kısa bir dönem özeti yazar. Karar sahibi özeti okur.
2. Yapay zekâ 3.1 için bir gösterge taslağı önerir. Ekip taslağı değiştirir. Karar sahibi onaylar.

Bu iki iş çıkarımdır. Ürün belgelerinde ayrıntılı tasarımı yoktur.

## 8. Bağlanılacaklar: kurmak yerine veri alın ve verin

### Çıkarım

Aşağıdaki işleri ürünün içinde kurmayın. Bunun yerine hazır araçlara bağlanın.

| Bağlantı | Ne yapar? | Neden kurmak yerine bağlanılır? |
|---|---|---|
| Tablo içe aktarma | Excel ya da Google E-Tablolar dosyasından gözlem alır. | Müşteri sayıları çoğu zaman tabloda tutar. |
| Muhasebe ve kurumsal kaynak planlama yazılımı | Gelir ve harcamayı salt okunur alır. | Harcama zaten orada kayıtlıdır. Ürün parayı ödemez. |
| OKR aracına dışa aktarma | Onaylı stratejiyi hedef ve anahtar sonuç olarak gönderir. | Büyük müşteri ekiplere yaymak için kendi aracını kullanır. |
| OKR aracından içe aktarma | Anahtar sonuçların güncel değerini gözlem olarak alır. | Değer bir kez girilir. İki yerde yazılmaz. |
| İş takip araçları, örneğin Jira | İş durumunu alır. | Bu araçların işi zaten budur. |
| Mesaj araçları | Özeti ve hatırlatmayı iletir. | Kullanıcı mesajı zaten orada okur. |

Bağlantı yönü için bir kural koyun. Dışarıdan gelen değer yalnız "Gözlem" ya da "Kaynak Hareketi" olur. Dışarıdan gelen hiçbir değer seçimi değiştirmez. Seçimi yalnız karar sahibi değiştirir.

### Kanıt

Bağlantının maliyeti düşüktür. Çünkü birçok satıcı dışa kapı açar. Perdoo GraphQL API, Zapier ve MCP sunucusu sunar ([Perdoo](https://www.perdoo.com/integrations)). Profit.co MCP bağlantılarını satar ([Profit.co](https://www.profit.co/pricing/)). ClearPoint "API ve MCP erişimi"ni ek ücretli sunar ([ClearPoint](https://www.clearpointstrategy.com/pricing)).

Planlanan ön yüz sunucuyla yalnız API üzerinden konuşur ([bütünleşik geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md)). Planlı "Gözlem" kaydı olay zamanını ve ulaşma zamanını ayrı tutar. Bu yapı dışarıdan gelen değere uygundur.

### Dışa aktarılacak alanlar

Dışa aktarma şu alanları taşır:

1. 3.1 adımının hedefi, OKR aracında hedef olur.
2. 3.1 adımının göstergeleri anahtar sonuç olur. Başlangıç ve hedef sayı da gider.
3. 2.5 adımının ana hamleleri girişim olur.
4. 3.2 adımının sorumluları ve tarihleri işlere yazılır.
5. Strateji belgesinin sürümüne bir geri bağlantı eklenir.

## 9. Bilerek dışarıda bırakılacaklar

### Çıkarım

| Dışarıda kalan | Neden? |
|---|---|
| Çok katlı hedef ağacı ve basamaklama | Ürün tek bir büyük karar için kurulu. Tek kurucuda bu katman boş kalır. |
| 0 ile 1 arası puanlama ve iddialı hedef kültürü | Bu kural çok ekip ve çok dönem ister. Yazılım bu kültürü zorlayamaz. |
| Konuşma, geri bildirim ve takdir katmanı | Bu iş insan kaynakları araçlarınındır. |
| Birebir görüşme, performans değerlendirmesi ve ücret bağı | Doerr OKR'yi ücretten ayrı tutar ([whatmatters.com](https://www.whatmatters.com/articles/should-you-connect-okrs-and-compensation-spoiler-alert-no)). |
| Çalışanı puanlayan yapay zekâ | Sabit ürün kuralına aykırıdır. AB yasasında çalışan değerlendirmesi yüksek risklidir ([EUR-Lex](https://eur-lex.europa.eu/eli/reg/2024/1689/oj)). |
| Yolu seçen ya da seçimi yazan yapay zekâ | Sabit ürün kuralına aykırıdır. Karar sahibi seçer ve kaydeder. |
| Canlı bağlantıların hepsini kendiniz kurmak | Bu iş OKR araçlarının asıl işidir. Önce dosya ve birkaç bağlantıyla başlayın. |

Ürün zaten alan sayısını bilerek sınırlar. 3.1 adımında en çok 3 gösterge vardır. 2.5 adımında en çok 5 ana hamle vardır. Strateji öncesi bölümün alan bütçesi 240'tır. Yeni alan bu bütçeyi aşarsa test kırılır ([süreç haritası](../docs/surec-haritasi.md)). Dışarıda bırakma kararı bu çizgiyle uyumludur.

## 10. Türkiye'deki ilk müşteri için bağlantı sırası

### Kanıt

İlk ücretli müşteri adayı Türkiye'deki aile kökenli orta ölçekli şirkettir. Bu şirket 50 ile 499 çalışanlıdır. Bu tanım bir hipotezdir ([Hedef kitle ICP ve personalar](Hedef%20kitle%20ICP%20ve%20personalar.md)). ICP, ideal müşteri profili demektir.

Türkiye'de üç muhasebe yazılımı öne çıkar. Paraşüt internet üzerinden çalışan bir ön muhasebe programıdır. Paraşüt bir API sunar. Logo 1984'te kuruldu. Mikro küçük şirketlerde ve perakendede yaygındır ([Zunapro](https://www.zunapro.com/turkey/tr/blog/muhasebe-programi-entegrasyonu-e-ticaret-rehberi), [Paraşüt](https://www.parasut.com/hakkimizda)). Bu kaynaklardaki pazar payı sayıları kaynaksızdır. Bu yüzden rapora alınmadı. Üç programın API kapsamı resmî belgelerden doğrulanmadı.

Kamuda merkezi yönetim performans programını SBB'nin kendi sisteminde hazırlar ([SBB rehberi](https://www.sbb.gov.tr/wp-content/uploads/2026/09/2027-2029Rehber_Bolum7.pdf)). SBB, Strateji ve Bütçe Başkanlığı'dır.

### Çıkarım

Aşağıdaki sıra ölçülmedi. Sıra ICP tanımından ve araştırma notlarından çıkarıldı.

1. **Tablo içe aktarma.** Geliştirme ekibi CSV ve Excel dosyasından gözlem almayı kurar. CSV, tablo verisini taşıyan basit bir dosya türüdür. Çünkü orta ölçekli şirket sayıları çoğu zaman tabloda tutar.
2. **Muhasebe ve kurumsal kaynak planlama bağlantısı.** Geliştirme ekibi Logo, Mikro ve Paraşüt için salt okunur bağlantı kurar. Gelir "Gözlem" olur. Harcama "Kaynak Hareketi" olur. Çünkü ICP şirketi bu programlardan birini büyük olasılıkla kullanır.
3. **E-posta özeti ve hatırlatması.** Sunucudaki zamanlanmış iş e-postayı gönderir. DevOps mühendisi bu işi kurar. Çünkü e-posta her şirkette vardır.
4. **WhatsApp özeti.** Önce maliyeti ve kuralları araştırın. Sonra karar verin. Çünkü WhatsApp Business maliyeti bu araştırmada incelenmedi.
5. **Takvime ekleme.** Kontrol tarihini takvim dosyası olarak verin. Böylece kullanıcı tarihi kendi takviminde görür.
6. **OKR aracına dışa aktarma.** Büyük müşteri isterse Perdoo ya da Profit.co için kurun. Çünkü bu araçların API ve MCP kapısı vardır.
7. **SBB biçiminde dışa aktarma.** Bu işi yalnız kamu teklifi açılırsa yapın. Çünkü kamu verisi SBB sisteminde girilir.

Slack ve Teams bağlantısı sonraya kalır. Türk şirketlerinde Slack kullanımı ölçülmedi.

Bağlantı anahtarları gizli bilgidir. Kurum yöneticisi anahtarı ürünün ayar ekranına girer. Anahtar yalnız o kurumun sunucusunda durur. Anahtar public depoya yazılmaz.

## 11. "OKR" adının konumlanma ve fiyat riski

### Kanıt

OKR pazarı kalabalık ve ucuzdur. Bakımı süren 23 OKR aracının 13'ü fiyat yayımlar. Ortanca başlangıç fiyatı kullanıcı başına aylık 8 dolardır ([Tability fiyat karşılaştırması](https://www.tability.io/compare/pricing/cascade)). Bu kaynak bir rakip satıcıdır.

Perdoo 5 kullanıcıya kadar ücretsizdir. Ücretli paketler kullanıcı başına aylık 6,40 ve 8,00 avrodur ([Perdoo](https://www.perdoo.com/pricing)). Mooncamp kullanıcı başına aylık 7 ile 10 avrodur. En az 5 kullanıcı gerekir ([Mooncamp](https://mooncamp.com/pricing)).

Pazar birleşiyor. WorkBoard Mayıs 2025'te Quantive'i aldı ([Silicon UK](https://www.silicon.co.uk/press-release/workboard-acquires-quantive-to-strengthen-its-strategy-execution-and-okr-software-advantage-and-accelerate-innovation)). Microsoft Viva Goals'u kapattı ([Microsoft Learn](https://learn.microsoft.com/viva/goals/goals-retirement)).

Kurumsal paketler fiyatı teklifle verir. WorkBoard için alıcıların yıllık ortanca ödemesi 57.040 dolardır. Bu sayı 10 satın almaya dayanır ([Vendr](https://www.vendr.com/marketplace/workboard)).

### Çıkarım

Ürünü "OKR yazılımı" diye satarsanız üç risk doğar:

1. Alıcı ürünü kullanıcı başına 6 ile 11 dolarlık araçlarla kıyaslar.
2. Alıcı özellik listesine bakar. Ürün hizalama, puanlama ve canlı bağlantıda geride görünür.
3. Ürünün tek açık farkı gölgede kalır. Bu fark seçim, hazırlık kapısı, vazgeçiş ve yeniden sınamadır.

Ürünü şu cümleyle anlatın: "Ürün seçimi kurar ve sınar. Hedef takip aracınız ölçer." OKR'yi 3.1 adımında kullanılan bir yöntem olarak gösterin. Satışta "OKR aracınızla çalışır" deyin. "OKR aracınızın yerine geçer" demeyin.

Fiyatı kullanıcı sayısına bağlamayın. Fiyatı plana ya da kuruma bağlamayı sınayın. Çünkü değer bir kararın kalitesinden gelir. Değer kullanıcı sayısından gelmez. Bu öneri bir hipotezdir. Türk şirketlerinin bu katmana ne ödeyeceği araştırılmadı.

## 12. Önerileri ne değiştirir?

| Bu olursa | Öneri şöyle değişir |
|---|---|
| Görüşmeler ICP şirketlerinin zaten bir OKR aracı kullandığını gösterir. | OKR aracına dışa ve içe aktarmayı öne alın. |
| Görüşmeler şirketlerin sayıları yalnız tabloda tuttuğunu gösterir. | Tablo içe aktarmayı ilk sürüme koyun. |
| Müşteriler birden çok bölüm ve birden çok plan ister. | Planları bir üst plana bağlayan hafif hizalamayı ekleyin. |
| Bir OKR satıcısı yapılı teşhis ve seçim adımı ekler. | Farkı hazırlık kapısı, sürümlü kanıt ve kaynak izni üzerinde anlatın. |
| Muhasebe programlarının API koşulları uygun çıkmaz. | Bağlantı yerine dosya ile içe aktarmayı kullanın. |
| Kamu teklifi açılır. | SBB biçiminde dışa aktarmayı ekleyin. |
| Kapı 6 ölçüleri ile 3.1 göstergeleri birleşir. | Hedef ve gözlem kapı kurallarına girer. Eskime kuralı da genişler. |
| Türk şirketlerinde Slack ya da Teams yaygın çıkar. | Bu araçlara hatırlatma bağlantısını öne alın. |

## 13. Sonuç

OKR ile bu ürün aynı işin iki ucunda durur. OKR, seçilmiş yolun ne kadar yüründüğünü ölçer. Bu ürün yolun neden seçildiğini ve hâlâ doğru olup olmadığını kaydeder. Bu yüzden asıl rakip OKR araçları değildir. Asıl risk, ürünün gerçekleşeni göstermeden müşteriyi ikinci bir araca itmesidir.

En önemli eksik tek bir kayıttır. Bu kayıt tarihli gerçekleşen değerdir. Bu kayıt gelince 3.5 gözden geçirmesi sayıya dayanır. Kaynak izni de harcamayı kararın yanında gösterir. Bu iki parça OKR araçlarının yapmadığı bir şey üretir. Bu şey, ölçümün seçime geri bağlandığı bir karar kaydıdır.

## Kaynaklar

### Ürün belgeleri ve kod

- [README.md](../README.md)
- [Süreç haritası](../docs/surec-haritasi.md)
- [Bütünleşik geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md)
- [Sonraki ana aşamalar planı](../docs/sonraki-ana-asamalar-plani.md)
- [clusters.ts](../src/data/clusters.ts)
- [strateji.ts](../src/data/steps/strateji.ts)
- [readiness.ts](../src/engine/readiness.ts)
- [renewal.ts](../src/engine/renewal.ts)
- [models.json](../src/data/models.json)
- [Hedef kitle ICP ve personalar](Hedef%20kitle%20ICP%20ve%20personalar.md)

### OKR yöntemi

- [Google re:Work, OKR rehberi](https://rework.withgoogle.com/en/guides/set-goals-with-okrs)
- [Wikipedia, OKR](https://en.wikipedia.org/wiki/Objectives_and_key_results)
- [whatmatters.com, OKR ve CFR farkı](https://www.whatmatters.com/resources/difference-between-okr-cfr)
- [whatmatters.com, OKR ve ücret](https://www.whatmatters.com/articles/should-you-connect-okrs-and-compensation-spoiler-alert-no)
- [whatmatters.com, Google ve prim](https://whatmatters.com/stories/okrs-separate-pay-compensation-bonuses)

### OKR araçları ve paketler

- [Perdoo bağlantıları](https://www.perdoo.com/integrations)
- [Perdoo fiyatları](https://www.perdoo.com/pricing)
- [Tability ve Slack](https://www.tability.io/compare/slack)
- [Tability fiyat karşılaştırması](https://www.tability.io/compare/pricing/cascade)
- [Weekdone kontrol rehberi](https://weekdone.com/?p=16552)
- [Lattice OKR](https://lattice.com/platform/goals/okrs)
- [Betterworks ve UKG](https://www.betterworks.com/betterworks-vs-ukg)
- [Profit.co fiyatları](https://www.profit.co/pricing/)
- [Mooncamp fiyatları](https://mooncamp.com/pricing)
- [Silicon UK, WorkBoard ve Quantive](https://www.silicon.co.uk/press-release/workboard-acquires-quantive-to-strengthen-its-strategy-execution-and-okr-software-advantage-and-accelerate-innovation)
- [TechIntelPro, WorkBoard ajanları](https://techintelpro.com/news/ai/enterprise-ai/workboard-launches-ai-native-strategic-portfolio-management-with-portfolio-analyst-agents)
- [Vendr, WorkBoard](https://www.vendr.com/marketplace/workboard)
- [ClearPoint özellikleri](https://clearpointstrategy.com/features)
- [ClearPoint proje yönetimi](https://www.clearpointstrategy.com/solutions/project-management)
- [ClearPoint fiyatları](https://www.clearpointstrategy.com/pricing)
- [Cascade Tapestry](https://www.cascade.app/tapestry/ai-assisted-planning)
- [Microsoft Learn, Viva Goals kapanışı](https://learn.microsoft.com/viva/goals/goals-retirement)

### Eleştiri ve araştırma

- [Leading Sapiens, OKR ve strateji](https://www.leadingsapiens.com/leaders-mistakes-okr-strategy/)
- [Mooncamp, Good Strategy Bad Strategy özeti](https://mooncamp.com/blog/good-strategy-bad-strategy-book-summary)
- [Jeff Gothelf, OKR strateji değildir](https://jeffgothelf.com/blog/okrs-are-not-strategy)
- [What's Next! podcast, Roger Martin](https://whatsnextpodcast.libsyn.com/why-your-okrs-arent-working-with-roger-martin)
- [O'Reilly, HBR Guide bölümü](https://www.oreilly.com/library/view/hbr-guide-to/9781647825164/html/11_3__Why_Strategy_Execution_Unrave.xhtml)
- [OKR Institute](https://okrinstitute.org/why-okrs-fail/)
- [Tability, OKR zorlukları](https://tability.io/odt/articles/bring-the-okr-pain-forward)
- [Waymaker, tablolarda hedef takibi](https://www.waymakeros.com/learn/okrs-fail-in-spreadsheet)
- [Profit.co, kurumsal programlar](https://www.profit.co/blog/okr-university/why-most-enterprise-okr-programs-fail-in-year-two/)
- [EUR-Lex, AB Yapay Zekâ Yasası](https://eur-lex.europa.eu/eli/reg/2024/1689/oj)

### Türkiye

- [Zunapro, muhasebe entegrasyonu](https://www.zunapro.com/turkey/tr/blog/muhasebe-programi-entegrasyonu-e-ticaret-rehberi)
- [Paraşüt, hakkımızda](https://www.parasut.com/hakkimizda)
- [SBB 2027 ile 2029 rehberi, 7. bölüm](https://www.sbb.gov.tr/wp-content/uploads/2026/09/2027-2029Rehber_Bolum7.pdf)

## Denetim notu

Bu rapor yalın Türkçe denetim betiğinden geçirildi. Tablo hücreleri kısa tutuldu. Fiyatlar ve oranlar yalnız kaynaklı notlardan alındı. Gerçek okurla denenmedi.
