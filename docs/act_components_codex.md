# Girişimci Aksiyon Planı için kurumsal arayüz tasarımı

Bir atölyenin siparişleri yeni makinenin giderini karşılayabilir. Yine de ödeme gününde kasada para eksik kalabilir. Bu arayüz aynı kayıttan iki sonuç üretir. Yönetici, yatırımın neden beklediğini görür. Girişimci, ödeme koşulunu kimin görüşeceğini ve kararı hangi kanıtla açacağını görür.

**Teslim türü.** Bu belge ekran, bileşen, veri ve kabul planıdır. İş kuralları, güncellenmiş Codex planındaki 8 karar ve 35 adıma dayanır. Görsel değerler, kurumsal roller ve kayıt düzeni tasarım önerisidir. [Esas alınan Codex planı](</Users/w6x/Documents/Codex/2026-11-13/files-mentioned-by-the-user-codex/outputs/act_plan_v5_final-codex.md>)

- [Ekranlar ve görsel kimlik](#tasarim)
- [Formun ilerleme biçimi](#akis)
- [35 adım için bileşen seçimi](#adimlar)
- [Karar incelemesi ve kurumsal yetkiler](#yetki)
- [Grafikler ve simgeler](#grafikler)
- [Arka plandaki JSON kaydı](#veri)
- [Yönetici raporu ve girişimci aksiyon planı](#ciktilar)
- [Kabul örnekleri ve teslim sırası](#kabul)

<a id="tasarim"></a>

## 1. Ekranlar ve görsel kimlik

**Tasarım yönü.** Çalışma alanı, iyi düzenlenmiş bir yatırım dosyası gibi okunmalı. Karar sorusu başlıkta, kanıt hemen altında, sıradaki eylem sayfanın sonunda görünür. Yoğun tablolar yalnız karşılaştırma yapılan yerlerde açılır. Rapor görünümünde daha geniş kenar boşlukları ve daha sakin bir sayfa düzeni kullanılır.

| Ekran | Kullanıcının işi | Yerleşim ve ana eylem |
|---|---|---|
| “Planlar” | Doğru kurumu ve planı bulur. | Kurum seçici, arama, sahip ve durum süzgeci, sıralanabilir liste. Satırda son karar ve sonraki görev görünür. “Planı aç” son çalışma konumuna götürür. |
| “Plan özeti” | Ne durumda olduğunu ve kimin beklendiğini öğrenir. | Başlık altında son onaylı karar, kalan kaynak ve açık görevler yer alır. “Kaldığım yerden devam et” tek ana eylemdir. |
| “Çalışma” | Bir soruya yanıt verir ve kanıt ekler. | Karar gezgini, tek ana soru, koşula bağlı alanlar ve kanıt çekmecesi. Altta “Geri” ve “Devam et” bulunur. |
| “Kanıtlar” | Bir iddiayı kaydıyla karşılaştırır. | Tarih ve tür süzgeçleri, kanıt listesi, önizleme ve bağlı adımlar. “Kanıtı bağla” mevcut kaydı yeniden kullanır. |
| “İnceleme” | Bir kararın neden geçeceğini veya bekleyeceğini inceler. | Yazılı eşik, gerçekleşen değer, karşı görüş ve sonuç önerisi yan yana gelir. “Kararı kaydet” yalnız yetkili kişiye açılır. |
| “İşler” | Yapılacak işi üstlenir, teslimi ve bağımlılığı izler. | Tarihli iş listesi, sorumlu süzgeci, bağımlılık görünümü ve iş ayrıntısı. “Teslimi kaydet” istenen kanıtı açar. |
| “Çıktılar” | Yönetici raporu veya girişimci aksiyon planı alır. | İki belge seçeneği, sürüm, kapsam, önizleme ve dışa aktarma. Her belge aynı seçili veri sürümünü kullanır. |
| “Geçmiş” | Neyin, kim tarafından ve neden değiştiğini görür. | Sürümler zaman çizelgesinde görünür. İki sürüm seçilince alan farkları ve etkilenen kararlar açılır. |

### Üç ekranın tasarım tarifi

**Telefon, 320 CSS piksel.** İlk satırda plan adı ve “Bölümler” düğmesi bulunur. Ardından “Karar 2 / 8” bilgisi, soru ve kısa açıklama gelir. Kanıt girişleri alt alta açılır. “Dosya ekle” veya “Kayda bağla” seçenekleri sorunun yanında durur. Kaydetme durumu ve “Devam et” aynı alt bölgede görünür. Sanal klavye açılınca alt bölge odaklı alanı örtmez. Kullanıcının cevabı girer girmez sayfa değişmez.

**Geniş çalışma ekranı.** Solda kararların adları, ortada açık adım, sağda seçili kanıt bulunur. Önerilen genişlikler 240 piksel, 560 ile 760 piksel ve 320 pikseldir. Alan yetersizse önce sağ panel çekmeceye dönüşür. Sonra sol gezgin “Bölümler” düğmesine iner. Sağda aynı anda yalnız bir bağlam gösterilir. Örneğin kullanıcı tutarı seçince ödeme kaydı, yöntemi seçince Karar Kitabı açılır.

**Yönetici raporunun ilk sayfası.** Üstte kurum, dönem, sürüm ve karar sahibi yer alır. Büyük başlık sonucu söyler. Örneğin “Makine alımı bekliyor”. Altına kararın iki cümlelik gerekçesi gelir. Sağdaki tek büyük değer “10.000 TL açık” olabilir. Bir nakit grafiği, en kritik risk ve yeniden açılma koşulu sayfayı tamamlar. Telefonda aynı öğeler bu sırayla alt alta dizilir.

### Bir ekranın ayrıntılı görünümü

**“Sorunun büyüklüğü” ekranı.** Üst satırda “Gerçek sorun” kararı ve kayıt durumu bulunur. Soru büyük puntoda “Bu iş size ne kaybettiriyor?” biçiminde yazılır. Altındaki örnek tek satırla başlar. Kullanıcı isterse tamamını açar.

| Ekrandaki sıra | Görünüm ve davranış |
|---|---|
| 1. Tekrar | “Son olay” alanı tarih ve kısa olay anlatımı alır. Bağlı görüşme satırı açılabilir. |
| 2. Çaba | “Bugün ne yapılıyor?” alanında süre, para veya görevlendirilen kişi seçilir. Yalnız seçilen türün alanları açılır. |
| 3. Kayıp | Ölçülen süre iri rakamla, birimi hemen yanında görünür. Yazılı eşik aynı ölçekte gösterilir. |
| 4. Kaynak | “Kanıtı aç” düğmesi kaydı ve tarihini gösterir. Geniş ekranda kanıt sağda kalır. |
| 5. Sonraki iş | “Bilinmiyor” seçilmişse hangi kaydın beklendiği yazılır. “Devam et” mevcut cevabı korur. |

Örnekte ekip haftalık kaybın eşiğini 2 saat yazmış olabilir. Gözlem 150 dakika ise ekran iki değeri dakika cinsinden karşılaştırır. Sonuçta “150 dakika ölçüldü. Yazılı eşik 120 dakika.” görünür. Çaba ve tekrar kayıtları yine ayrı değerlendirilir.

### Görsel değerler

Değerler ortak tasarım ayarlarında tanımlanır. Aynı anlam, formda, grafikte ve raporda aynı görünümü taşır.

| Ortak ayar | Tasarım önerisi | Kullanım |
|---|---|---|
| Zemin ve yüzey | Kırık beyaz `#F8F7F4`, çalışma yüzeyi `#FFFFFF`, ikincil yüzey `#F1F3F4` | Sayfa, düzenleme alanı ve karşılaştırma satırları ayrılır. Her soruya ayrı kart çizilmez. |
| Metin | Ana metin `#20282F`, açıklama `#495761` | Karar sorusu ile yardımcı metin arasındaki farkı boyut ve ağırlık tamamlar. |
| Marka ve eylem | Projedeki turuncu `#F95428` vurgu için kullanılır. Koyu turuncu `#8F2812` üzerinde beyaz yazı kullanılır. | Birincil eylemde koyu ton, grafikte seçili seri için açık ton kullanılır. |
| Durum | Tamam `#17634C`, bekliyor `#79520F`, zarar `#A02F34`, bilgi `#315A75` | Her durum metin ve ayrı simge taşır. Kırmızı yalnız hata veya zarar için ayrılır. |
| Yazı | Outfit kullanılır. Gövde 16, yardımcı metin 14 CSS pikseldir. Bölüm başlığı 24, ana başlık 32, rapor başlığı 40 CSS pikseldir. | Ana değerler hizalı rakamlarla gösterilir. Telefon başlığı sarılır. Yoğun tabloda yazı küçülmez. |
| Boşluk | Alan içi 8 veya 12, satırlar arası 16, bölümler arası 32 CSS piksel. Telefon kenar payı 16, geniş ekran 32. | Özellikle soru, örnek ve cevap arasında boşluk bırakılır. |
| Biçim | Kontrol köşesi 6, panel köşesi 12 CSS piksel. Metin alanı sınırı 1 piksel. Gölge yalnız açılan yüzeyde. | Seçili satırda yüzey tonu ve onay işareti kullanılır. Yuvarlak kutunun kenarında renkli şerit kullanılmaz. |
| Kontrol ve dokunma | Önerilen kontrol yüksekliği 44 piksel. Yoğun tablonun görünür düğmesi 32, gerçek hedefi en az 44 pikseldir. | Hedefler çakışırsa satır yüksekliği artar. Görünür boyut ve dokunma alanı ayrı yönetilir. |
| Etkileşim | Üzerine gelme, basma, seçim, odak, hata ve devre dışı durumları ayrı tanımlanır. | Seçimde onay işareti, hatada açıklama, devre dışında neden görünür. Klavye odağı için tek düz alt çizgi kullanılır. |

**Tasarım sistemindeki karşılıkları.** `surface.page`, `surface.work` ve `surface.context` üç yüzeyi tanımlar. `text.primary`, `action.primary` ve `status.hold` anlam taşıyan renklerdir. `type.body`, `space.section`, `control.height` ve `target.touch` ayrı yönetilir. Grafik, menü ve rapor aynı değerleri paylaşır. Koyu turuncu ana düğmede kullanılır. Parlak turuncu serinin adı, işareti ve koyu karşılığı da bulunur.

**Hareket.** Seçim, basma ve üzerine gelme durumları ortak hareket değerlerini kullanır. Çekmece, menü ve ayrıntı açılırken ve kapanırken ortak süre kullanılır. Başlangıç önerisi küçük yüzeyde 160, panelde 220 milisaniyedir. Ortak eğri `cubic-bezier(.65, 0, .35, 1)` olur. Durum ve odak hemen güncellenir. Hızlı ters harekette geçiş bulunduğu yerden döner. Hareketi azaltma tercihinde gereksiz hareket kapanır. Yeni bileşen için iki yönlü süre ve eğri kontrolü teslim koşuludur.

**Yazı ve yoğunluk.** Düzenleme alanı normal yoğunlukta açılır. Kanıt listesinde kullanıcı sık görünümü seçebilir. Sık görünüm yardımcı dikey boşluğu azaltır. Yazı boyutu, satırdaki bilgi ve dokunma alanı korunur. Uzun kurum ve model adları kelime aralarında sarılır. Kesilen ikincil içerik, odakla ve dokunmayla tümüyle açılabilir.

**Klavye odağı.** Tab veya Shift+Tab görünür odağı açar. Fare ve dokunma görsel modu kapatır. Ok tuşları bileşen içindeki seçimi taşır. Normal temada odak çevrelenmez. Yalnız sistemin zorunlu renk modu açıkken görünür klavye odağı için `2px solid CanvasText` kullanılır. Çekmece kapanınca odak açan düğmeye döner.

<a id="akis"></a>

## 2. Formun ilerleme biçimi

1. Kullanıcı kurumu ve planı seçer. Yeni plan için “Yeni iş” veya “Devraldığım iş” yolunu açar.
2. İlk ekranda işi kendi sözleriyle anlatır. Yedi kısa soru hangi alanların açılacağını belirler.
3. Her seçim taslağa işlenir. Alanın altında yeni soru açılabilir. “Devam et” bir sonraki uygun adıma götürür.
4. “Kısaca” ve “Günlük hayattan örnek” bölümleri her kararın başında görünür. Ayrıntı isteyen kullanıcı ilgili yöntemi açar.
5. Kullanıcı eksik bilgiyle ara verebilir. “Bilinmiyor” seçimi, eksik kanıtı ve sonraki işi görünür tutar.
6. Karar sonuna gelince sistem geçerli koşulu ve önerilen sonucu gösterir. Yetkili kişi gerekçesiyle kaydeder.
7. Kullanıcı “Geri” ile önceki cevabı düzeltebilir. Sistem değişen alanları ve yeniden incelenecek kararları gösterir.
8. Karar kaydedilince “Çıktılar” ekranı güncellenir. Erken durdurulan bir iş için de iki belge alınabilir.

**İlerleme göstergesi.** “Bu kararda 4 gerekli adımdan 3’ü tamam” gibi somut bilgi kullanılır. İsterseniz bütün kararları inceleyebilirsiniz. Yetkisiz bir teslimi başlatan eylem kilitli kalır. “Uygulanmıyor”, “Bilinmiyor”, “Taslak” ve “Onaylandı” ayrı görünür. Alanları doldurmak karar onayı sayılmaz.

### Hangi seçim hangi bölümü açar?

| Seçim veya olay | Arayüzün davranışı |
|---|---|
| Çalışan iş devralınıyor. | 00, 01, 02 ve 05 kontrol edilir. Devir tablosu açık sözleri ve ilk eksik kanıtı gösterir. Geçerli eski kayıt yeniden bağlanabilir. |
| Ekip var. | 03’te görev, onay ve itiraz alanları açılır. Tek kurucuda ağır karar veya sınır değişikliği ikinci görüş ister. |
| Yeni pazar veya gerekli izin var. | 04’te dış koşullar açılır. İzin, yalnız bağlı işlemi bekletir. Ciddi zarar etkilenen işi hemen durdurur. |
| Fiziksel ürün, donanım veya iş yeri gerekiyor. | 12’de tedarik, yer, kapasite veya teknik örnek alanları açılır. Sonuç, 15’teki denemeden önce görünür. |
| İş iki tarafı buluşturuyor. | 06, 08, 15 ve 28’de taraflar ayrı izlenir. Kayıt, teklif ve tamamlanan eşleşme ayrı sayılır. |
| Ücret alınacak. | 14’te fatura, tahsilat ve izin hazırlığı açılır. Eksik koşulda ödeme eylemi kapalı kalır. Uygun ücretsiz ilgi denemesi seçilebilir. |
| Hizmet ücretsiz veya kurum içi. | 14’te bütçe sahibi ve uygulama yetkisi açılır. 15 ve 29’da katılım, bütçe veya hizmet başına gider kullanılır. |
| Yatırım, kredi veya hibe gerekiyor. | Kaynağı veren kurumun yazılı koşulu istenir. Gerekli kuruluş işi ilgili işlemden önce açılır. |
| Yatırımın geri dönüşü pahalı. | 11’de üç farklı çözüm ve bugünkü yöntem karşılaştırılır. En güçlü iki yol sınanır. Tek yol kalırsa bağımsız görüş ve yetkili karar gerekir. |
| Kısa yol seçildi. | Aynı 8 karar özet sırada açılır. 12, 14 ve 15 arasındaki sıra korunur. Fayda ölçümü görünür kalır. |
| Büyüme, devir veya kapanış seçildi. | Büyümede 30 ve 33 kullanılır. Devir veya kapanışta 34 açılır. Sürdürmede yeniden değerlendirme olayı kaydedilir. |

**Başlangıç ölçüsü seçici.** Kullanıcıya günlük adla bir ölçü önerilir. Örneğin işletmede 10 görüşmenin 6’sı son olayı anlatır. En az 3 işletme bugünkü çözüme kaynak ayırır. Tüketiciye hizmette iki başlangıç sayısı uygulanıyorsa yüksek sayı alınır. Aynı görüşme aynı toplamda iki kez sayılmaz. Talep denemesinde fiziksel ürün, hizmet ve donanım kendi teklif satırını açar. Dijital üründe alıcı türünün satırı kullanılır. Ekran önerilen sayıyı, yazılı eşiği ve dayanağını ayrı gösterir. [Görüşme ve deneme ölçüleri](</Users/w6x/Documents/Codex/2026-11-13/files-mentioned-by-the-user-codex/outputs/act_plan_v5_final-codex.md>)

**Dal değişirse.** Örneğin ücretli hizmet ücretsiz olursa ödeme alanları etkin kapsamdan çıkar. Önceki cevaplar geçmişte kalır. Güncel rapor bunları ücretli satış kanıtı saymaz. Kullanıcı ücretli yola dönerse eski cevapları inceleyip yeniden kullanabilir. Önceki onaylar yeni koşullara kendiliğinden taşınmaz.

<a id="adimlar"></a>

## 3. Her adımda hangi bileşen kullanılacak?

Her satır bir ekran tarifidir. “Veri” sütunu JSON içindeki adım kaydının adını verir. Örneğin `problemEvidence` alanının tam yolu `steps.07.problemEvidence` olur. Paylaşılan kanıtlar, kararlar ve görevler kendi kimlikleriyle bağlanır. Harf kodları son kullanıcıya gösterilmez.

### Karar 1. Araştırma yetkisi

| Adım | Bileşen ve giriş | Koşul ve davranış | Veri |
|---|---|---|---|
| 00. İşin tanımı | Yedi kısa soru, tek seçim grubu, çoklu seçim ve serbest iş tanımı. | Kullanıcı, ödeyen ve onaylayan ayrılır. “Devraldığım iş” devir tablosunu açar. | `profile` |
| 01. Kurucunun amacı ve işin geleceği | Amaç cümlesi, gelecek yönü seçimi, ortak beklentileri için karşılaştırma listesi. | Birden çok ortak varsa ayrılan beklentiler görünür. Seçim, tek başına büyüme hedefi koymaz. | `founderIntent` |
| 02. Başarı, durma ve harcama sınırı | Para ve birim alanı, bitiş tarihi, deneme sayacı, yinelenebilir durma koşulu. | Toplam ve kalan sınırlar ayrı görünür. Değişiklikte eski ve yeni değer karşılaştırılır. | `limits` |
| 03. Karar hakları | Kişi aramalı görev matrisi, tek karar sahibi seçimi, itiraz alanı. | Ekipte açılır. Ortak onay gerekirse bir kişi tek başına harcama açamaz. | `authority` |
| 04. İşi etkileyen dış koşullar | Koşul listesi, izin takvimi, senaryo karşılaştırması, belge bağlama çekmecesi. | Yeni pazar veya izin seçilince açılır. İzin bekliyorsa etkilenen iş ve sorumlu görünür. | `externalConditions` |

### Karar 2. Gerçek sorun

| Adım | Bileşen ve giriş | Koşul ve davranış | Veri |
|---|---|---|---|
| 05. Problem tanımı | Son olay için kısa anlatım, tarih, kişi grubu ve kayıp birimi. | Örnek metin tıklanınca açıklama açılır. Örnek kullanıcı cevabı olarak kaydolmaz. | `problem` |
| 06. Müşteri keşfi | Görüşme defteri, kişi rolü süzgeci, kayıt ekleme paneli, örneklem ilerlemesi. | Alıcı ve kullanıcı ayrı izlenir. Aynı kişi aynı toplamda yalnız bir kez sayılır. | `interviews` |
| 07. Sorunun büyüklüğü | “Tekrar”, “Çaba” ve “Kayıp” için üç ayrı kanıt satırı. Her satırda durum, değer ve kaynak seçici bulunur. | Kayıt yoksa “Bilinmiyor” görünür. Kullanıcı kayıp birimini ve eşiği önceden belirler. Üç kanıt ayrı değerlendirilir. | `problemEvidence` |
| 08. İlk müşteri grubu | Grup tanımlayıcı, erişim yolu seçimi ve ilk grubu sabitleme eylemi. | İki taraflı işte alıcı ve satıcı ayrı açılır. Grup değişirse görüşme kapsamı yeniden incelenir. | `targetGroups` |

### Karar 3. Erişim ve seçenekler

| Adım | Bileşen ve giriş | Koşul ve davranış | Veri |
|---|---|---|---|
| 09. Pazar ve rakip taraması | Rakip tablosu, yerine geçen çözümler, dönem ve kapasite karşılaştırması. | Talep ve teslim kapasitesi aynı birimde gösterilir. Satış tahmini küçük değeri aşarsa neden sorulur. | `market` |
| 10. Varsayım haritası | Etki ve kanıt için etiketli 1 ile 5 seçimi. Liste ve nokta grafiği aynı kayda bağlanır. | Etkisi 4 veya 5, kanıtı 1 veya 2 olanlar önce incelenir. Nokta seçimi ilgili kaydı açar. | `assumptions` |
| 11. Çözüm seçenekleri | Bugünkü yöntem sabit sütun, seçenek karşılaştırması, ağırlık girişi ve istisna incelemesi. | Küçük işte bir alternatif yeterlidir. Ağır yatırımda üç çözüm aranır. Tek uygulanabilir yol ikinci görüşe gider. | `options` |
| 12. Yapabilirlik ve kaynak | Beceri listesi, yapma veya satın alma seçimi, ortak taahhüdü, tedarik ve kapasite kaydı. | Donanımda teknik örnek, mekânda konum ve kira alanları açılır. Eksik ortak varsa bağımsız hazırlık ayrıca seçilir. | `feasibility` |

### Karar 4. Teklife verilen yanıt

| Adım | Bileşen ve giriş | Koşul ve davranış | Veri |
|---|---|---|---|
| 13. Değer önerisi ve tek cümle | Müşteri, sorun ve sonuç alanlarından oluşan teklif düzenleyici. Yanında gerçek metin önizlemesi bulunur. | Kullanıcı metni düzeltebilir. Belirsiz süre veya fiyat otomatik tamamlanmaz. | `offer` |
| 14. Ödeme veya bütçe yetkisi | Ücretli veya ücretsiz seçimi, yetki kontrol listesi, imzalı kanıt seçici. | Ücretli dal fatura ve gerekli izinleri sorar. Ücretsiz dal kaynak sahibini ve uygulama yetkisini sorar. | `transactionReadiness` |
| 15. Talep testi | Deneme kurucu, hedef grup seçimi, teklif ve davranış sayacı, ret nedenleri listesi. | Kayıt, mektup, ödeme ve tamamlanan işlem ayrı alanlardır. Gerekli izin gelmeden depozito kaydı yeni tahsilata yetki vermez. | `demandTest` |

### Karar 5. Strateji ve kaynak

| Adım | Bileşen ve giriş | Koşul ve davranış | Veri |
|---|---|---|---|
| 16. Tek sayfalık iş planı ve para mantığı | Gelir ve gider çizelgesi, ödeme takvimi, üç senaryo sekmesi, hesap açıklaması. | Ücretsiz hizmet dalında bütçe ve hizmet başı gider açılır. Kasa açığı, başabaş sonucundan ayrı görünür. | `economics` |
| 17. İş neden başarısız olabilir? | Risk defteri, olasılık ve etki seçimi, erken işaret, önlem ve sahip. | 1 ile 3 arası iki puan çarpılır. Kaynakta 6 ve üstü başlangıç işaretidir. Ağır zarar ayrıca değerlendirilir. | `risks` |
| 18. Saha ve kazanma yolu | Seçenek listesi, seçilen yol ve vazgeçilen yol için yan yana gerekçe. | Eski seçim değişirse bağlı teslim ve görevler “Yeniden incele” durumuna geçer. | `strategy` |
| 19. Hedefler ve 90 günlük yol | Hedef düzenleyici, sorumlu seçici, tarih aralığı ve bağımlılık listesi. | Süre veya kişi eksikse görev taslaktır. Zaman çizelgesindeki görev listeden de düzenlenebilir. | `roadmap` |
| 20. Strateji karar dosyası | Belge önizlemesi, önceki sürümle fark, karşı görüş ve yetkili onayı. | Yetkili kişi kapsamı ve bütçeyi birlikte görür. Karar 4’ün sonucu tek başına teslim yetkisi vermez. | `strategyDossier` |

### Karar 6. İlk teslim ve fayda

| Adım | Bileşen ve giriş | Koşul ve davranış | Veri |
|---|---|---|---|
| 21. İlk ürün kapsamı | İlk teslimin iş listesi, gerekli veya ertelenebilir seçimi, kabul ölçüsü. | Fiziksel üründe ilk parti, hizmette tamamlanacak gerçek iş gösterilir. | `deliveryScope` |
| 22. Ölçüm düzeni | Üç işletme ölçüsü, ayrı fayda ölçüsü ve zarar sınırı için düzenleyici. | Her ölçü birim, dönem, başlangıç değeri ve eşik ister. Aynı bulgu yeniden kullanılırsa uyarı çıkar. | `measurementPlan` |
| 23. Küçük bir grupla ilk teslim | Teslim defteri, katılımcı satırları, tamamlandı veya yarım kaldı seçimi. | Yardımla biten ve yardımsız biten iş ayrı kaydolur. Geri alma sorumlusu görünür. | `deliveries` |
| 24. Kanal testleri | Erişim yolu karşılaştırması, gider girişi ve sayım tablosu. | Kullanıcı aynı dönemdeki kanalları karşılaştırır. Gelir olmayan işte ödeme yerine kabul edilen katılım kanıtı seçilir. | `channelTests` |
| 25. İlk ürün kapısı | Eşik ve gerçekleşen değer karşılaştırması, kusur listesi, karar paneli. | Üç işletme ölçüsü ve ayrı fayda kontrol edilir. Eksik ölçüm “Bilinmiyor” kalır. Yeniden deneme kalan hakla sınırlıdır. | `deliveryReview` |

### Karar 7. Tekrarlı fayda ve para dengesi

| Adım | Bileşen ve giriş | Koşul ve davranış | Veri |
|---|---|---|---|
| 26. Öğrenme döngüsü | Deneme geçmişi, önce ve sonra karşılaştırması, dört soruluk değerlendirme. | Her tekrar aynı deneme ailesine bağlanır. Ad değiştirmek bütçe veya deneme hakkı açmaz. | `learningCycles` |
| 27. Problem çözüm uyumu | Eski yöntemle yeni teslimin karşılaştırması, alıntı ve doğrudan fayda kaydı. | Ödeme veya övgü ayrı gösterilir. Fayda kanıtına kaynak bağlanır. | `benefit` |
| 28. Fayda sonraki dönemde sürüyor mu? | Dönem seçici, aynı tarihte başlayan grupların çizelgesi ve kayıp nedenleri. | Olgunlaşmamış dönem boş tutulur. Mevsimlik işte hasat, tek teslimde kabul veya bakım tarihi kullanılır. | `repeatBenefit` |
| 29. Birim ekonomisi ve fiyat | Dönem ve para birimi seçimi, fiyat karşılaştırması, müşteri başı gider hesabı. | Aynı dönemin gideri ve yeni müşterisi kullanılır. Payda sıfırsa sonuç “Hesaplanamaz” olur. | `unitEconomics` |
| 30. Büyüme kanalı seçimi | Kanal eleme listesi, bütçe sınırı ve en güçlü yolların küçük deneme planı. | Büyüme hedefi varsa açılır. İşleyen kanalın kapasiteye etkisi incelenir. | `growthChannels` |
| 31. Tam şirketleşme ve hukuk | Koşula bağlı yükümlülük listesi, belge sürümü, geçerlilik ve yenileme tarihi. | Erken gereken izin ilgili işlemden önce görünür. Kurum içi ekip için uygulanmayan iş gerekçeyle kapanır. | `obligations` |
| 32. Ürün ve hizmet kalitesi | Kusur defteri, bekleme süresi, neden seçimi ve düzeltme görevi. | Kusur veya gecikme varsa açılır. Aynı ölçümle doğrulama yapılınca görev sonuçlanır. | `quality` |

### Karar 8. İşin geleceği

| Adım | Bileşen ve giriş | Koşul ve davranış | Veri |
|---|---|---|---|
| 33. Büyüme koşulu | Dört yönlü seçim, karşılaştırma sayfası ve sınırlı büyüme denemesi. | “Büyüt”, “Sürdür”, “Devret” ve “Kapat” işin yönüdür. Karar sonucu ayrı alanda tutulur. | `futureDirection` |
| 34. Devir ve kapanış | Açık sözler listesi, teslim alan kişi, yazılı kabul ve kapanış tutanağı. | Devir veya kapanışta açılır. Devralan kişi açık işleri kabul edene kadar devir bekler. | `handover` |

<a id="yetki"></a>

## 4. Karar incelemesi ve kurumsal çalışma

**Karar ekranının sırası.** Üstte “Hangi işe karar veriyoruz?” sorusu ve kapsam görünür. Altında zarar, izin, kalan para, süre ve deneme hakkı sıralanır. Sonra yazılı ölçü, gerçekleşen değer ve kanıt açılır. Son satırda önerilen sonuç, gerekçe ve yetkili kişinin eylemi yer alır. Seçilen sonuç kayıt altına alınana kadar raporda öneri olarak görünür.

**Karar önceliği.** Sistem önce ciddi zarar ve yazılı durma koşuluna bakar. Sonra işin yetkisini, iznini ve kalan kaynaklarını kontrol eder. Ardından ilgili karar tablosundaki ilk uygun satırı kullanır. Çakışan iki bulgu varsa üstteki kuralın neden seçildiği gösterilir. Yetkili kişi yeni kanıt veya doğru kapsamla incelemeyi yeniden açabilir. Engellenmiş bir işi onay düğmesinden başlatamaz.

| Sonuç | Açılan bileşen | Kaydın taşıdığı sonuç |
|---|---|---|
| “Durdurun” | Zarar bildirimi, etkilenen işler, geri dönüş sorumlusu. | İlgili harcama ve teslim yetkisi kapanır. Açık taahhütler görev listesinde kalır. |
| “Bekletin” | Bekleme nedeni, izlenecek olay, sorumlu ve kontrol tarihi. | Yeni harcama bekler. Rapor, yeniden açma koşulunu gösterir. |
| “Yeniden deneyin” | Mevcut denemenin altına yeni ölçüm, kalan hak ve bütçe özeti. | Kalan hak varsa yeni deneme kaydı doğar. Önceki sonuç korunur. |
| “Yön değiştirin” | Değişecek unsur seçimi ve önceki adımlara etki önizlemesi. | İlk etkilenen adım açılır. Gerekçeli yeni görevler aksiyon planına girer. |
| “Koşullu ilerleyin” | Sınırlı iş, üst tutar, bitiş, sorumlu ve kapanış kanıtı. | Yalnız yazılı iş açılır. Aynı eksik için izin bir kez kullanılır. Süre uzatılamaz. Kapanış kanıtı gelmezse sonuç “Bekletin” olur. |
| “İlerleyin” | Kanıt özeti, verilen yetki, yeni bütçe ve sonraki sorumlu. | Yalnız belirtilen sonraki iş açılır. İmza eski ölçüm sürümüne bağlanır. |

### Sekiz inceleme ekranının özeti

Bu görünümler kaynak plandaki her karar tablosunun sırasını kullanır. Örnekler aşağıdaki ortak panelin içerik seçimini gösterir.

| Karar | İnceleme paneli | Açılan iş veya dönüş |
|---|---|---|
| 1. Yetki | Para, bitiş ve deneme hakkı özeti ile durma koşulları. | Kaynak eksikse bekleme kaydı açılır. Yetki tamamsa görüşme işi açılır. |
| 2. Sorun | Üç kanıt satırı, hedef grup ve eksik ölçüm nedeni. | İki ölçüt karşılandıysa kalan hakla 5 ile 10 ek görüşme önerilebilir. Ek deneme bir kez, en çok 2 haftadır. |
| 3. Seçenek | Kapasite, erişim ve kaynak karşılaştırması. | Ortak bekleniyorsa yalnız bağımsız hazırlık için süreli izin açılabilir. |
| 4. Talep | Yazılı taahhüt eşiği, uygun davranış ve teklif sayıları. | Eşik geçilirse yalnız 16. adımın yatırım hesabı açılır. |
| 5. Kaynak | İlk açık ödeme günü, kalan para ve risk önlemi. | Kasa yetmiyorsa yatırım bekler. Yetki ve kaynak tamamsa sınırlı ilk teslim açılır. |
| 6. Teslim | Üç işletme ölçüsü, ayrı doğrudan fayda ve zarar sınırı. | Düzeltilebilir eksikte kalan hak kullanılır. Toplam en çok 3 deneme yapılır. Daha düşük yazılı sınır önceliklidir. |
| 7. Tekrar | Olgunlaşan dönemler, katkı, kapasite ve açık sözleşmeler. | Gözlem süresi dolmadıysa sonuç bekler. Ücretsiz işte hizmet bütçesi ve erişim kullanılır. |
| 8. Gelecek | İşin yönü, geri dönüş planı ve gerekiyorsa devralanın kabulü. | Yazılı kabul eksikse devir bekler. Kapanışta açık sorumluluklar görevleşir. |

**İki farklı seçim.** Sekizinci kararda “Devret” işin yönüdür. Açık siparişleri alan kişi henüz onaylamadıysa karar sonucu “Bekletin” olur. Yönetici raporu bu iki değeri ayrı gösterir. Girişimci planı yazılı kabul işini açar.

### Roller ve yetki sınırları

| Rol | Yapabildiği iş | Kritik sınır |
|---|---|---|
| Plan sahibi | Profil, görev dağılımı, çalışma sürümü ve ekip erişimini yönetir. | Harcama yetkisi ayrıca atanır. Kurum sınırını sunucu uygular. |
| Katkı veren | Atandığı alanı doldurur, kanıt bağlar, inceleme ister. | Onaylanmış kararı değiştirmek için değişiklik kaydı açar. |
| İnceleyen | Kanıtı inceler, karşı görüş veya ikinci görüş verir. | Görüş ayrı kimlik ve tarihle kaydolur. Zorunlu ikinci görüşü karar sahibi kendisine veremez. |
| Karar sahibi | Kendi yetki sınırında gerekçeli sonucu kaydeder. | Gerekli ortak onaylar tamamlanana kadar sonuç taslak kalır. |
| Yönetici veya denetçi | Yetkili olduğu planları, raporları ve geçmişi inceler. | Kanıt ekine, kişisel alana ve dışa aktarmaya ayrı erişim uygulanır. |

Karar yetkisi bir kişi veya kaynakta gerekli ortak onaylarla temsil edilir. Görevi üstlenmek harcama yetkisi vermez. Kurum ve plan adı her ekranda sabit kalır. Kurum değişirken bekleyen düzenlemeler önce güvenle saklanır. Kullanıcıya açma yetkisi verilmeyen bir belgenin başlığı veya eki indirilmez. Önizleme, indirme, rapor üretimi ve eski sürüm açma işlemleri de aynı kapsamı kullanır.

**İkinci görüş yolu.** Tek kurucu geri alınması güç karar, eşik değişikliği veya sınır artışında ikinci görüş ister. Bitiş tarihi ertelemesi ve deneme hakkı artışı bu kapsamdadır. Görüş gelince önce ve sonra farkı karar sahibine gösterilir. Eski gözlem eski eşiğiyle kalır. Yeni eşik sonraki ölçüme bağlanır.

### Ortak bileşenlerin davranışı

- **Seçim.** Birbirini dışlayan kısa cevaplar etiketli tek seçim düğmeleriyle gösterilir. Çoklu seçenek için onay kutuları kullanılır. Uzun listelerde aranabilir, markalı açılır panel kullanılır. Kapalı kontrol ve açılan liste aynı tasarım sistemine bağlıdır. Arama sonucu yoksa kullanıcı seçimi temizleyebilir. Oklar seçeneği taşır. Enter seçer. Escape önceki seçimi koruyarak kapatır. [W3C seçim kutusu etkileşimi](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- **Sayı ve tarih.** Birim her zaman sayının yanında kalır. Para alanı Türkçe girişte “1.250,50 TL” değerini kabul eder. Kısmen yazılan sayı korunur. Rapor yalnız geçerli değeri kullanır. Kurum para birimi ve gözlem dönemi görünür. Takvim düğmesinin yanında klavyeyle tarih girişi de vardır.
- **Tekrarlanan kayıt.** Görüşme, teslim, taksit ve kusur satırında ekleme, düzenleme ve geri alma bulunur. Silme işlemi bağlı kanıtları gösterir. Kayıt yeniden sıralanırsa kimliği korunur. Sürüklemeye ek olarak “Yukarı taşı” ve “Aşağı taşı” seçenekleri sunulur.
- **Kanıt çekmecesi.** Tür, olay tarihi, geçerlilik, sahibi ve bağlı iddia birlikte görünür. Gözlem, tahmin ve varsayım ayrı etiketlenir. Aynı belgenin ikinci bağlantısı bağımsız kanıt sayılmaz. Karşı bulgu aynı çekmecede kalır.
- **Dosya eki.** Dosya seçimi ve sürükleyerek ekleme birlikte sunulur. Yükleme, doğrulama, hazır ve başarısız durumları ayrı görünür. Başarısız yüklemede yeniden deneme aynı ek kaydını kullanır. Sunucu eki kabul edene kadar karar bu eke dayanamaz.
- **Eksik veya hatalı alan.** Hata kısa bir cümleyle alanın altında görünür. İlerleme isteğinde hata özeti ilk sorunlu alana bağlantı verir. Uzak bir tartışmalı veriye tıklayınca kullanıcı ilgili kayıt, sürüm ve alana döner.
- **Sürüm farkı.** Eski değer, önerilen değer, gerekçe ve etkilenen çıktılar birlikte görünür. Uzun metin masaüstünde yan yana, telefonda “Önce” ve “Sonra” başlıklarıyla alt alta gösterilir.
- **Yardım.** Her kararın örneği ve yöntem bağlantısı başlığın altındadır. Yardım paneli cevapları koruyarak kapanır. Sözlük terimi odakla ve dokunmayla açılır. Kritik bilgi yalnız bir ipucunun içinde bırakılmaz.

### Kaynak planın yardımcı bölümleri

| Kaynak bölüm | Üründeki yeri |
|---|---|
| Başlangıç, devir ve kısa yol | Başlangıç yönlendiricisi ve plan özeti. Devir tablosundaki her cevap ilgili çalışma adımını açar. |
| İş koşulları, dış olaylar ve yön değiştirme | Profil kuralları, karar incelemesi ve “Kararı yeniden aç” akışı. |
| Dört sektör örneği | “Örnek göster” paneli. Örnekler kurmaca olarak işaretlenir. İşletmenin gerçek kaydına karışmaz. |
| Deneme, kanıt, görüşme, karar ve devir şablonları | Tekrar kullanılabilen kayıt formları. Aynı kanıt farklı adımlarda kimliğiyle kullanılır. |
| Sözlük ve 128 yöntem | Bağlama göre açılan yöntem çekmecesi. Kaynaktaki 81 adım bağlantısı korunur. Yöntemin gerçek menü adı, bölüm adı ve bölüm içi sırası gösterilir. |
| Eski profil kodları ve puanlar | Eski kayıt içe aktarma önizlemesi. Günlük adla eşleşmeyen değer inceleme ister. Eski sorun puanı güncel karar üretmez. |
| Sürüm karşılaştırması, ilk üç sürümün eleştirisi ve kaynaklar | “Planın dayanağı” sayfası. Kullanıcı çalışma yerini kaybetmeden kaynağı açar. |

<a id="grafikler"></a>

## 5. Apache ECharts ve Phosphor Icons

**Grafiğin görevi.** Kullanıcı her grafikte önce soruyu, ardından kısa sonucu görür. “Veriyi göster” aynı birim ve filtrelerle tabloyu açar. Grafikte nokta seçmek, tabloda aynı satırı seçer. Klavye kullanıcısı aynı kayda tablodan ulaşır. Her grafik kaynağa bağlıdır. Eksik değer boşluk olarak görünür. Görsel örnekler rapor hesabına girmez.

| Yer | ECharts görünümü | Veri ve okuma biçimi |
|---|---|---|
| 07, sorun kanıtı | Aynı birim varsa yatay çubuk ve eşik çizgisi | Ölçülen kayıp ve yazılı eşik karşılaştırılır. Tekrar, çaba ve kayıp farklı birimlerdeyse üç metin satırı gösterilir. |
| 09 ve 11, kapasite ve seçenek | Gruplu yatay çubuk | Ulaşılabilen talep ve teslim kapasitesi aynı dönem için çizilir. Maliyet ve süre farklı grafiklerde kalır. |
| 10, varsayımlar | Nokta grafiği | Yatayda kanıt, dikeyde etki bulunur. Nokta varsayımı açar. Çakışan noktaların kayıt listesi sunulur. |
| 15, talep | Aşamalı daralan grafik veya çubuk | Aynı grupta iç içe aşamalar varsa daralan grafik kullanılır. Mektup ve ödeme ayrık türlerse çubuk kullanılır. |
| 16, nakit ve senaryo | Tarihli çizgi, sıfır çizgisi, en düşük bakiye işareti | Gerçek ve tahmin çizgileri farklı desen taşır. Hesaplanan ilk açık doğrudan ödeme kaydını açar. |
| 17, risk | Olasılık ve etki için nokta grafiği | Her iki eksen 1 ile 3 arasındadır. Ağır zarar işareti düşük puanda da görünür. Liste erişilebilir eşdeğerdir. |
| 19, 33 ve görevler | Tarih ekseninde yatay süre çubukları | Başlangıç, bitiş ve bağımlılık gösterilir. Sürüklemeden de tarih ve sıra değiştirilebilir. |
| 22 ve 25, ilk teslim | Eşik işaretli küçük çubuklar | Üç işletme ölçüsü ve ayrı fayda ölçüsü kendi biriminde gösterilir. Zarar sınırı ayrı metinle açıklanır. |
| 28 ve 29, tekrar ve fiyat | Aynı başlangıç yaşında grup çizgileri, dönemlik katkı çubukları | Olgunlaşmamış gözlem kesik veya boş kalır. Küçük örnekte pay ve payda yazılır. |
| Yönetici raporu | Kayda uygun en çok iki ana grafik önerilir. | Ödeme açığında nakit çizgisi, teslim sorusunda fayda karşılaştırması öne çıkar. Diğerleri ayrıntıda kalır. |

Grafik ve tablo aynı veri görünümünü tüketir. Okunabilir açıklama, çizgi biçimi ve desen birlikte kullanılır. ECharts’ın erişilebilirlik açıklaması ve veri kümesi modülleri gerektiğinde seçilir. Mevcut grafikleri taklit eden sabit örnek sayılar yeni plana taşınmaz. [ECharts veri kümesi](https://echarts.apache.org/handbook/en/concepts/dataset/) ve [ECharts erişilebilirlik rehberi](https://echarts.apache.org/handbook/en/best-practices/aria/)

**Phosphor simge dili.** Normal kontrollerde Regular, seçili gezinmede Bold ağırlığı önerilir. Simge 20 piksel, yazı ile arası 8 pikseldir. Durum eylemlerinde simgeye metin eşlik eder. Yalnız simge taşıyan araç düğmesine erişilebilir ad verilir. Dekoratif simge ekran okuyucudan gizlenir. [Phosphor Icons web paketi](https://github.com/phosphor-icons/web)

| Alan | Simgeler | Kullanım |
|---|---|---|
| Sekiz karar | `ph-briefcase`, `ph-target`, `ph-scales`, `ph-handshake`, `ph-wallet`, `ph-package`, `ph-arrows-clockwise`, `ph-signpost` | Sırayla yetki, sorun, seçenek, taahhüt, kaynak, teslim, tekrar ve gelecek. Başlığın yerini tutmaz. |
| Kanıt ve kontrol | `ph-paperclip`, `ph-lock-key`, `ph-warning`, `ph-pause-circle`, `ph-check-circle` | Ek, yetki, zarar, bekleme ve doğrulanmış sonuç için tutarlı işaretler. |
| Belgeler ve geçmiş | `ph-file-text`, `ph-list-checks`, `ph-clock-counter-clockwise` | Yönetici raporu, girişimci aksiyon planı ve değişiklik geçmişi birbirinden ayrılır. |

<a id="veri"></a>

## 6. Kullanıcı yazdıkça oluşan JSON

**JSON**, cevapların adları ve değerleriyle saklandığı veri biçimidir. Kullanıcı normal formu doldurur. Sayı, tarih, seçim ve kanıt bağlantısı arka planda kendi türüyle kaydolur. “Veri dökümünü indir” yetkisi olan kişi aynı sürümün okunabilir JSON dosyasını alabilir.

### Hangi veri nerede tutulur?

| Kayıt ailesi | Gereken içerik | Nerede kullanılır? |
|---|---|---|
| Plan kimliği | Kurum, plan, veri biçimi sürümü, kaynak plan sürümü, çalışma sürümü, zaman dilimi, para birimi | Bütün ekranlar, yetki kontrolü, çıktı başlığı |
| Adım cevapları | İki haneli adım anahtarı, yanıtlar, kapsam, yanıt durumu, düzenleyen, değişiklik zamanı | Form, kaldığı yerden devam, alan farkı |
| Ölçü ve eşik | Ölçü adı, yönü, birim, grup, dönem, başlangıç, yazılı eşik, pay ve payda | Kanıt ekranı, karar kuralı, grafik ve metin |
| Deneme | Deneme ailesi, sıra, amaç, ilk ve son gün, kalan hak, bütçe ve yetki kapsamı | Tekrar deneme, kaynak kontrolü ve görev planı |
| Kanıt | Benzersiz kayıt, tür, tarih, grup, kaynak, ek kimliği, izin sınıfı ve karşı bulgu | Çekmece, karar gerekçesi ve rapor dipnotu |
| Karar günlüğü | Karar numarası, etkilenen iş, kural, öneri, insan kararı, gerekçe, karşı görüş ve veri sürümü | Yetki, geçmiş, yönetici raporu |
| Görev | Eylem, kaynak karar, sorumlu, tarih, bağımlılık, kabul ölçüsü, durum, yeniden açma olayı | Girişimci aksiyon planı ve iş listesi |
| Çıktı sürümü | Belge türü, veri sürümü, karar sürümü, şablon sürümü, dil, görünür kapsam ve oluşturma zamanı | Önizleme, indirme ve sonradan karşılaştırma |

**Değer kuralları.** “Bilinmiyor” ölçüsünde değer boş kalır. Gerçek sıfır, ölçülmüş bir sonuçtur. “Uygulanmıyor” için neden kaydolur. Tutarlar para birimiyle ve belirlenmiş hassasiyetle saklanır. Tarih alanı, gerçekleşme anından ayrı tutulur. Ekran tarihleri gün, ay adı, yıl ve gün adıyla gösterilir. Rapora yalnız izin verilen alanlar taşınır.

### Kayıt ve geri dönüş

1. Kullanıcı seçim yaptığında taslak model hemen güncellenir. Metin yazılırken imleç ve eksik giriş korunur.
2. Kısa bir duraklamada değişen alanlar kayda gönderilir. Adımdan ayrılırken bekleyen değişiklikler de işlenir.
3. Önce alan türü, sonra alanlar arası kurallar kontrol edilir. Eksik taslak saklanabilir. Geçersiz sayı hesaplara girmez.
4. Sunucu kurum, yetki ve beklenen sürümü kontrol eder. Her yazma isteği tek işlem kimliği taşır.
5. Sunucu onay verince “Kaydedildi” görünür. Tekrar gönderilen istek yeni görüşme, deneme veya onay oluşturmaz.
6. Farklı alanlardaki değişiklikler uyumluysa birleşir. Aynı alanın iki değeri varsa karşılaştırma açılır. İki kişinin girdisi de saklanır.
7. Bağlantı kesilirse “Eşitleme bekliyor” görünür. Kurumun cihaz politikası izin verirse taslak cihazda tutulur. Hassas alanlarda yerel saklama kapalı olabilir.
8. Erişim sona ererse ekran düzenlemeyi durdurur. Sunucu onayı olmayan işlem “Kaydedildi” görünmez. Bağlantı gelince sonuç ve yetki yeniden kontrol edilir.

**Karar kaydının bütünlüğü.** Sunucu onay anında yetkiyi, kanıt sürümünü ve eşiği yeniden okur. Kalan para, süre ve deneme hakkını aynı işlemde doğrular. Karar, hak tüketimi, bütçe yetkisi ve doğan görevler birlikte kaydedilir. İkinci sekme son hakkı kullanmışsa diğer istek yeniden incelemeye döner. Gönderim sırasında sürüm değişirse onay bekler. Yeni verilerle karar koşulları yeniden hesaplanır. Aynı eksik kimliğine ikinci koşullu izin yazılamaz. Süreyi sunucu saati belirler. Kullanıcı ekranı kapalıyken dolan izin de yeni harcamayı açamaz.

**Zaman ve veri biçimi.** Sayı ve para alanları yazılan biçim ile geçerli değeri ayırır. Önerilen TL kaydı kuruş cinsinden tam sayı, para birimi ve dönem içerir. Örneğin 1.250,50 TL için değer 125050 kuruştur. Başka para biriminde o birimin hassasiyeti kullanılır. Farklı para birimleri dönüşüm dayanağı olmadan toplanmaz. Anlık olaylar saat dilimiyle saklanır. Yalnız gün belirten tarihler yerel takvim günü olarak korunur.

**Alan değişince ne yenilenir?** Örneğin 16. adımda tahsilat tarihi değişirse nakit çizgisi yeniden hesaplanır. Beşinci kararın dayandığı ödeme kaydı değişmişse inceleme istenir. Eski onay kendi sürümünde geçerliliğini korur. Yeni bir harcama için gerekli yetki yeniden değerlendirilir. Aynı değişiklikten iki yeni görev doğmaz.

**Dosya ve eski sürüm.** JSON, kanıt dosyasının içeriği yerine erişim denetimli ek kimliğini taşır. İçe aktarma önce sürümü, birimi ve kurum kapsamını gösterir. Bilinmeyen sürüm ayrı önizlemede kalır. Eski alanlar dönüştürülürken özgün kayıt korunur. İçe aktarma, eski onayları yeni plan adına tekrar vermez.

### Tek bir seçimin veri örneği

Aşağıdaki geçerli JSON, kurmaca bir taslak kaydının kesitidir. Ücretsiz hizmet seçilince sistem bütçe alanını açar. Örnekte uygulama yetkisi doğrulanmıştır. Bütçe onayı için kanıt bekleniyor. Aynı değer iki belgenin taslağına farklı cümlelerle yansır.

```json
{
  "schemaVersion": "1.0",
  "planId": "ornek-kutuphane",
  "organizationId": "ornek-kurum",
  "revision": 12,
  "steps": {
    "14": {
      "transactionReadiness": {
        "serviceMode": "free_public",
        "budgetOwnerRole": "Hizmet sorumlusu",
        "budgetAuthorized": { "status": "unknown", "value": null },
        "deliveryAuthorized": {
          "status": "verified",
          "value": true,
          "evidenceIds": ["ornek-hizmet-yetkisi"]
        },
        "invoicing": { "status": "not_applicable", "reason": "Ücret alınmıyor." },
        "evidenceIds": ["ornek-hizmet-yetkisi"]
      }
    }
  },
  "evidence": [
    {
      "id": "ornek-hizmet-yetkisi",
      "revision": 1,
      "kind": "written_approval",
      "appliesTo": "service_delivery"
    }
  ],
  "decisions": [
    {
      "id": "karar-4-taslak",
      "gate": 4,
      "scope": { "actionId": "gezici-hizmet-butceli-deneme" },
      "suggestedOutcome": "hold",
      "recordedOutcome": null,
      "reason": "Bütçe yetkisi için kanıt bekleniyor."
    }
  ],
  "tasks": [
    {
      "id": "butce-kaniti",
      "sourceDecisionId": "karar-4-taslak",
      "action": "Bütçe yetkisini gösteren kaydı ekleyin.",
      "ownerRole": "Hizmet sorumlusu",
      "dueDate": null,
      "status": "draft"
    }
  ]
}
```

Örnekte “Bekletin” yalnız bütçe gerektiren pilot için önerilir. Yetkili ve ücretsiz ön görüşme ayrı bir iştir. Yetkili kişi henüz karar kaydetmemiştir. Yönetici önizlemesi “Pilot bütçesi için onay bekleniyor” der. Girişimci önizlemesi tek taslak işi gösterir. Görev tarihi girilene kadar “Tarih belirlenmedi” görünür.

<a id="ciktilar"></a>

## 7. İki nihai belge nasıl üretilir?

“Çıktılar” ekranında kullanıcı belgeyi, plan sürümünü ve yetkili kapsamı seçer. Önizleme her zaman kullanılabilir. Taslakta açık bilgi ve onaylar görünür. Yetkili kişi çıktıyı yayımladığında belge, dayandığı veri sürümüyle sabitlenir. Sonraki değişiklik yeni bir sürüm oluşturur. İki taslak aynı çalışma sürümünü kullanır. Birlikte yayımlanan iki belge aynı sabit veri sürümünü kullanır. Kanıtın o anki sürümü ve izin verilen alıcı kapsamı da kaydedilir.

Her açılışta ve indirmede güncel erişim yeniden doğrulanır. Yetki kaldırılmışsa eski rapor bağlantısı indirme başlatamaz. Sonradan değişen kanıt eski belgeye sessizce eklenmez. Önceden indirilmiş dosya alıcının cihazında kalır. İndirme öncesinde belge kapsamı ve gizlilik düzeyi görünür.

### Yönetici raporu

**İlk bakışta cevap.** Hangi karar isteniyor? Neden şimdi? Ne kadar kaynak riskte? Karar verilirse hangi iş açılacak? Üst bölümde kararı veren kişi, tarih, kapsam ve rapor sürümü görünür.

| Rapor bölümü | Bileşen | JSON kaynağı |
|---|---|---|
| Karar özeti | Son onaylı sonuç, bekleyen öneri ve gerekçe için ayrı satırlar | Karar günlüğü, 18 ve 20 |
| Sorun ve talep | Üç kanıtın kısa özeti, teklif sayıları ve taahhüt türleri | 05, 06, 07, 13 ve 15 |
| Kaynak ve risk | Kalan yetki, ilk nakit açığı, senaryo farkı, en önemli risk ve sahibi | 02, 16, 17 ve 29 |
| Teslim ve tekrar | İşletme ölçülerinden ayrı fayda, dönemler arası sonuç ve kapasite | 22, 25, 27, 28 ve 32 |
| Açık karar ve gelecek | Bekleyen onaylar, karşı görüş, önerilen yön ve yeniden açma koşulu | 03, 20, 33, 34 ve karar günlüğü |
| Kanıt eki | Numaralı kanıt listesi, ölçüm dönemi, bilinmeyen alan ve sürüm geçmişi | Yetkili kanıtlar, ölçüler ve çıktı sürümü |

**Sunum önerisi.** Ekranda tek sayfalık özet ve açılır ayrıntı bulunur. Yazdırılabilir PDF’de karar özeti ilk sayfada kalır. Uzun kanıt listesi yeni sayfadan başlar. Tablolarda başlıklar tekrarlanır. Grafiğin altında kısa sonuç ve sayısal karşılığı birlikte yer alır.

### Girişimci aksiyon planı

**İlk bakışta cevap.** Bugün hangi işi kim yapacak? Neye bağlı? Bittiği nasıl anlaşılacak? “Şimdi”, “Sonra” ve “Bekleyen” bölümlerini kaynak karar ile iş bağımlılıkları belirler.

| Plan bölümü | Bileşen | JSON kaynağı |
|---|---|---|
| İlk iş ve engel | Öncelikli görev, sorumlu, son tarih, beklenen kanıt | Açık eylemler, geçerli karar sonucu |
| 90 günlük çalışma | Zaman çizelgesi ve eşdeğer sıralı görev listesi | 19, görevler, bağımlılıklar ve bütçe |
| Denemeler | Deneme amacı, önceden yazılan eşik, yöntem, kalan hak | 10, 15, 22, 24 ve 26 |
| Teslim ve kabul | Kapsam, kontrol edecek kişi, ölçü ve dönüş planı | 12, 20, 21, 23 ve 25 |
| Sonraki karar | Tarih veya olay, kapanış kanıtı ve sorumlu kişi | 02, 17, 25, 28 ve karar günlüğü |
| Gerekirse devir veya kapanış | Açık siparişler, ödeme, destek, teslim alan ve yazılı kabul | 33, 34 ve yükümlülükler |

**Üretim kuralı.** Görev, kaynak karara bağlanır. “Bekletin” sonucu yalnız izleme, bilgi toplama veya engeli çözme işini açar. “Durdurun” sonucunda açık yükümlülükleri kapatma işleri kalır. Sahibin veya tarihin eksik olduğu görev, açık eksik olarak listelenir. Bilinmeyen kaybın yerine sayı, boş tarihin yerine keyfî süre yazılmaz.

**Çıktı biçimi önerisi.** İki belgede de ekran önizlemesi, yazdırılabilir PDF ve düzenlenebilir Markdown bulunur. Yapılandırılmış JSON işletmenin kayıt çıktısıdır. Dosya adı plan, belge türü ve sürümü taşır. Yöneticiye sunulan paylaşım görünümü yalnız izinli kanıtları içerir.

### Aynı kanıttan iki farklı çıktı

Kaynak plandaki atölyede sipariş başına katkı 300 TL’dir. Ek sabit gider ayda 30.000 TL’dir. Bu gider ayda 100 ek siparişle karşılanır. İlk ödeme tarihinde kasada 20.000 TL bulunur. Ödeme 30.000 TL olduğu için 10.000 TL açık vardır.

- **Yönetici raporu.** “Makine alımı bekliyor. Ödeme gününde kasada 10.000 TL eksik kalıyor.” Rapor nakit grafiğindeki ilgili güne ve kanıta bağlanır.
- **Girişimci aksiyon planı.** “Ödeme koşulunu yeniden görüşün. Yeni takvimi kaydedin. Açık kapandığında beşinci kararı yeniden açın.” Sorumlu ve tarih varsa kayıttan gelir. Eksikse görev taslak kalır.

<a id="kabul"></a>

## 8. Uygulama sınırı ve kabul planı

**Mevcut proje.** Karar Kitabı tarayıcıda çalışan bir TypeScript ve Vite uygulamasıdır. Katalog verisini JSON ve Markdown olarak dışa aktarır. Bu dışa aktarım katalog kapsamını taşır. Yeni form için plan cevapları, görevler, kararlar ve yetkiler ayrı bir veri sözleşmesi gerektirir. Grafik ve yöntem bağlantılarında mevcut katalogdan yararlanılabilir. [Katalog çıktısı](</Users/w6x/Documents/Developer/DEV/thedecissionbook/src/export.ts>) ve [mevcut grafikler](</Users/w6x/Documents/Developer/DEV/thedecissionbook/src/chart.ts>)

| Araç | Manifestte istenen | Kilit dosyası ve kurulu paket |
|---|---|---|
| Apache ECharts | `^6.1.0` | `6.1.0` |
| Phosphor Icons Web | `^2.1.2` | `2.1.2` |
| Flowbite | `^4.0.2` | `4.0.2` |
| TypeScript | `~6.0.2` | `6.0.3` |
| Vite | `^8.2.0` | `8.2.2` |

Yerelde gözlenen Node.js sürümü `24.21.0` idi. Mevcut grafik ayarlarında Roboto ve 13 piksel eksen yazısı görüldü. Yeni yüzeyde Outfit ve en az 14 piksel grafik etiketi planlandı. Mevcut daha büyük metinler korunur. Bu tasarım yeni arayüz çatısı veya paket kurulumu gerektiren bir karar vermiyor. [Paket tanımı](</Users/w6x/Documents/Developer/DEV/thedecissionbook/package.json>) ve [kilit dosyası](</Users/w6x/Documents/Developer/DEV/thedecissionbook/package-lock.json>)

**Bileşen teslimi.** Mevcut katalog grafik modülünü ana girişte içe alır. Yeni formun girişinde grafik yüklemesi ayrılmalıdır. Çalışma ekranı için yalnız form ve gezinme varlıkları yüklenir. ECharts grafik türleri ilk ilgili bölümde yüklenir. Rapor baskı araçları, dosya önizleyicileri ve geçmiş karşılaştırması isteyen ekrana ayrılır. Yerel kullanım verileriyle doğrulanmış bir boyut bütçesi henüz bulunmuyor. Uygulama tesliminde gerçek ağ istekleri ve aktarılan baytlar ölçülür. Küçük veya yavaş ekranda veri tablosu hazır kalır.

**Genişletme kararı.** Mevcut çizgi, çubuk ve nokta gösterimleri yeniden kullanılabilir. Grafik katmanındaki yazı ve renkler ortak tasarım değerlerinden gelmelidir. Veri kümesi ve erişilebilirlik desteği kurulu ECharts sürümünde seçilmelidir. Bugünkü katalog dışa aktarımı ile yeni işletme kayıtları ayrı kapsam taşır.

**Kurumsal bağımlılık.** Hesap açma, kurum ayrımı, sunucuda kayıt, dosya erişimi ve rapor saklama için sunucu desteği gerekir. Web arayüzü bu servislerden gerçek onay bekler. Hizmet desteklenmiyorsa ilgili eylemin durumu ve nedeni görünür olur. Servis ürünü, barındırma yeri ve saklama süresi bu planda seçilmedi.

### Erişilebilirlik ve teslim kabulü

| Deneme | Kabul koşulu |
|---|---|
| 320, 360, 375 ve 390 piksel genişlik | Kullanıcı ücretli ve ücretsiz yolu tamamlayabilir. Sayfada yatay taşma oluşmaz. Geniş tablo kendi alanında kayar. |
| Yatay telefon, tablet ve masaüstü | Düzen değişirken cevap, açık kanıt, seçili kayıt ve klavye odağı korunur. Büyütülen yazı ana işlemi gizlemez. |
| Klavye ve dokunma | Tab, Shift+Tab, oklar, Enter, Space ve Escape uygun kontrollerde çalışır. Fare veya dokunma, klavye kullanımını ortadan kaldırmaz. |
| Görme ve hareket tercihleri | WCAG 2.2 AA hedefiyle renk karşıtlığı, etiketler, odak ve hata okunması ölçülür. Ekran okuyucu kayıt durumunu anlamlı değişimde duyurur. |
| Yeni veya devralınan plan | Devralan kişi önce açık taahhüdü görür. İlk eksik kanıtın gerçek adımına döner. |
| 07 ve 14. adımlar | Telefon kullanıcısı üç kanıtı ayrı doldurur. Ücretsiz işte fatura alanı kapanır. Bütçe ve izin kaydı görünür kalır. |
| Çevrimdışı düzenleme ve çakışma | Kaybolan veri, çift deneme veya sahte “Kaydedildi” bildirimi oluşmaz. Yetki geri alınırsa sunucu değişikliği reddeder. |
| Ağır risk ve ikinci görüş | Yetkisiz kullanıcı sonucu kesinleştiremez. Aynı eksik için ikinci koşullu izin açılamaz. Bitişten sonra sonuç ve görevler güncellenir. |
| Kayıp veri ve sıfır | “Bilinmiyor”, “Uygulanmıyor”, ölçülmüş sıfır ve hesaplanamayan oran raporlarda ayrı kalır. |
| İki belge | İki taslak aynı çalışma sürümünden açılır. Yayımlanan iki çıktı aynı sabit sürümden üretilir. Nakit açığı, sahip ve kaynak kanıtlar çelişmez. Eksik sahip veya tarih uydurulmaz. |
| Eski rapora erişim | Yetki kaldırılınca yeni indirme reddedilir. Önceki kanıt sürümü korunur. Önceden indirilmiş kopyanın cihazda kaldığı bildirilir. |
| Büyük kurum kaydı | Binlerce görüşmede süzme, sayfalama ve klavyeyle satır açma denenir. Liste yenilenirken odak seçili kayıtta kalır. |
| Yavaş ağ, baskı ve kaynak kullanımı | İlk sorudan önce rapor grafikleri veya yükleme araçları indirilmez. Grafik yüklenemezse tablo ve form çalışır. Yazdırmada yalnız seçili rapor sürümü kullanılır. Baskıda içerik kesilmez. |

**Uygulama sırası.** Önce ortak tasarım değerleri, veri sözleşmesi ve karar kuralları belirlenir. Ardından telefon üzerinde yeni plan, ücretli yol, ücretsiz yol ve devir akışı tamamlanır. Kurumsal roller, eşzamanlı düzenleme ve sürüm geçmişi aynı kayıt temeline bağlanır. Sonra grafikler ve iki çıktı bu veriye bağlanır. Yayın öncesinde gerçek tarayıcı, telefon, ağ ve bağımsız tasarım incelemesi ayrı kaydedilir.

**Belge incelemesi.** Bağımsız incelemede üç konu netleştirildi. Son hak tüketimi onayla birlikte kaydedilir. Bütçe ve uygulama yetkisi ayrı tutulur. Rapor indirilirken güncel yetki tekrar denetlenir.

**Bu teslimin doğrulama sınırı.** Kaynak eşlemesi, paket sürümleri, simge adları ve örnek JSON belge üzerinde denetlendi. Ekran, servis, otomatik kayıt ve rapor üretimi planlanan davranışlardır. Tarayıcı, erişilebilirlik ve baskı kabulü uygulamadan sonra yapılır. Gerçek okurla denenmedi.
