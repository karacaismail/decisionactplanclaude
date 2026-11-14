# Strateji nedir, hazırlıkta eksik var mı? Boşluk ve bilinmeyen analizi

Bu raporu Claude 15 Kasım 2026 Pazar günü hazırladı. Rapordaki öneriler aynı gün uygulandı. Yapılan işler 10. bölümdedir.

1. bölümden 9. bölüme kadar olan metin analizin ilk hâlidir. Sonradan yanlış çıkan iki cümleyi yerinde düzelttim ve işaretledim.

## Kısa cevap

**Strateji nedir?** Strateji, belirli bir güçlüğe karşı yapılan seçimlerin bütünüdür. Seçimler birbirini destekler. Strateji neye "evet", neye "hayır" dendiğini ve paranın nereye gittiğini söyler.

**Hazırlıkta eksik var mı?** İçerik eksiği küçüktür. Altı küçük boşluk buldum. Hepsi 5. bölümdedir.

**Asıl eksik başka yerdedir.** Asıl eksik içerikte değil, iki konudadır:

1. Uygulamayı hiçbir gerçek kullanıcı denemedi.
2. Form çok büyüdü. Rapor yazılırken strateji öncesi adımlarda 236 alan vardı.

Bu iki konu "bildiğimiz ama masaya koymadığımız" şeylerdir. Önerim, yeni alan eklemeden önce bu ikisini çözmektir.

## 1. Neyi inceledim?

Dört dosya verdiniz.

| Dosya | İçinde ne var? | Notum |
|---|---|---|
| `kurumsal_strateji_mimarisi_ve_belirsizlik_raporu.md` | Kurumsal strateji mimarisi, danışmanlık okulları, belirsizlik yönetimi | En geniş belge. Çok sayıda kesin sayı veriyor. |
| `strtgy.md` | Stratejinin tanımı, sekiz küme, düşünürler listesi | Bu metni dün analiz etmiştim. Aynı metindir. |
| `gpt.md` | Beş ayrı soru, içerik modelleri, yedi adımlı oluşturma yöntemi | En temkinli belge. Sentezini sentez diye adlandırıyor. |
| `cld.md` | Altı ayrı kesit, kurumsal kat, tarafsızlık notları | Kendi eski cevabını düzeltiyor. Zayıf kanıtları işaretliyor. |

Bilinmeyenler için kısa bir açıklama yapalım. "Unk unks", bilmediğimizi bile bilmediğimiz şeyler demektir. Raporda buna "bilinmeyen bilinmeyenler" diyorum.

## 2. Strateji nedir?

### Çalışma tanımı

> Strateji, kurumun önündeki belirleyici güçlüğü adlandırır. Sonra nerede oynayacağını, neyle kazanacağını ve neyden vazgeçeceğini seçer. Sonra parayı ve insanı bu seçime bağlar.

Dört belge de bu tanımda birleşiyor.

### Strateji ne değildir?

| Bu strateji değildir | Neden? |
|---|---|
| Hedef | "Yüzde 20 büyüyeceğiz" yalnız bir sonuçtur. Yolu söylemez. |
| Vizyon cümlesi | Vizyon kimliktir. Seçim içermez. |
| Bütçe | Bütçe seçimin sonucudur. Seçimin kendisi değildir. |
| Görev listesi | Liste vazgeçiş içermez. |
| Daha verimli çalışmak | Rakip de aynısını yapar. |
| Analiz | Aynı analize bakan iki ekip iki ayrı yol seçebilir. |

### Karmaşayı çözen ayrım: beş ayrı soru

"Strateji" kelimesi beş ayrı soruyu aynı anda taşıyor. Karışıklık buradan çıkıyor. `gpt.md` bu beş soruyu en açık biçimde ayırıyor.

| Soru | Neyi anlatır? | Örnek araç |
|---|---|---|
| Strateji hangi düzeyde? | Şirketler grubu mu, tek iş mi, tek bölüm mü? | Düzey ayrımı |
| Stratejinin içinde hangi seçimler var? | İçerik | Beş seçim, strateji elması, Rumelt'in çekirdeği |
| Seçimleri nasıl üretiriz? | Yöntem | Yedi adım, "neler doğru olmalı?" sorusu |
| Seçim sağlam mı? | Sınama | Porter'ın üç testi, Rumelt'in dört ölçütü |
| Seçimi nasıl hayata geçiririz? | Uygulama | Kaplan ve Norton'ın altı aşaması |

"Stratejik planlama" ve "stratejik eylem planı" bu beş sorunun tamamını karşılamaz. Bu iki terim yalnız yöntemin ve uygulamanın bir kısmını anlatır.

### Düzeyler

| Düzey | Temel soru | Bu uygulamada var mı? |
|---|---|---|
| Kurumsal | Hangi işlerde olacağız? Bir arada olmak ne kazandırır? | Hayır. Yalnız "Grup katkısı" bölümü var. |
| İş | Bu pazarda müşteriyi neden biz kazanacağız? | Evet. Uygulama bu düzey için yazıldı. |
| Fonksiyon | Bölümler seçimi nasıl destekleyecek? | Kısmen. Uygulama aşamasındadır. |

**Önemli bir sonuç.** Bu uygulama tek bir işin hazırlığını yapar. Dört belgenin büyük kısmı ise kurumsal düzeyi anlatır. Bu ikisi ayrı işlerdir. Karıştırılırsa uygulamanın kapsamı kayar.

### Hazırlık nerede biter?

Hazırlık seçim yapmaz. Hazırlık yalnız girdiyi verir. Strateji, karar sahibinin bir yola "evet" dediği anda kurulur.

Uygulamadaki rol cümlesi bununla uyumludur: "Stratej yolu önerir ve gerekçesini kurar. Karar sahibi seçer ve kaydeder."

## 3. Dört belge nerede uzlaşıyor?

- Herkesin kabul ettiği tek bir küme listesi yoktur. Sekiz, yedi ve altı kümeli listelerin hepsi sentezdir.
- Düzey ayrımı ortaktır: kurumsal, iş ve fonksiyon.
- Strateji seçim ve vazgeçiş içerir.
- Ana hamleler stratejinin içindedir. Ayrıntılı plan ayrı bir belgedir.
- Strateji bir varsayımdır. Uygulama bu varsayımı sınar.
- Çerçeveler karar vermez. Kararı yönetim verir.

## 4. Dört belge nerede çelişiyor?

Kendi belgeleriniz arasında dört çelişki buldum.

| Konu | Belirsizlik raporu ne diyor? | `cld.md` ne diyor? |
|---|---|---|
| Stratejilerin başarısızlık oranı | İyi stratejilerin yüzde 60 ile 70'i uygulamada değer kaybeder. | Bu tür oranların kanıtı eski ve zayıftır. Gerçek oran bilinmiyor. |
| Holding iskontosu | Değer yıkımı kesin bir olgu gibi anlatılıyor. | Finans araştırmaları bu konuda bölünmüş durumda. |
| Portföy matrisleri | İşlere "nakit motoru" ve "yıldız" gibi roller verilmesini öneriyor. | Bir deney, matris kullananların daha kötü yatırım seçtiğini gösterdi. |
| Küme sayısı | Kümeleri kesin bir yapı gibi sunuyor. | Listelerin sentez olduğunu açıkça söylüyor. |

Belirsizlik raporu çok sayıda kesin sayı veriyor. İlk analizde bu sayıları doğrulamamıştım. Sonra beş sayıyı kaynağından aradım. Sonuç aşağıdadır.

| Belgedeki sayı | Ne buldum? | Sonuç |
|---|---|---|
| "2.393 şirket" ve "yüzde 8" | Sayılar McKinsey'in güç eğrisi çalışmasında geçiyor. Kaynak: Bradley, Hirt ve Smit, "Strategy Beyond the Hockey Stick", 2018. Orta dilimdeki şirketlerin yüzde 8'i on yılda en üst dilime çıkmış. | Doğrulandı |
| "Stratejinin vaat ettiği değerin yüzde 63'ü gerçekleşir" | Sayı Mankins ve Steele'in 2005 tarihli Harvard Business Review yazısında geçiyor. Sayı bir yönetici anketinden geliyor. Ölçülmüş bir sonuç değildir. | Doğrulandı ama kanıtı zayıf |
| "Stratejilerin yüzde 60 ile 70'i başarısız olur" | Cândido ve Santos 2015'te bu oranları taradı. Vardıkları sonuç şudur: gerçek oran bilinmiyor. | Doğrulanmadı. `cld.md` haklı. |
| "Üç ve daha çok değişkende başarı yüzde 10'un altı" (Zook) | Bu sayı için kaynak bulamadım. Zook'un yazılarında başka bir bulgu var: komşu alana açılan hamlelerin yaklaşık dörtte biri başarılı oluyor. | Doğrulanmadı |
| "Birleşme ve satın almaların yüzde 70 ile 90'ı başarısız olur" | Sayı çok yerde tekrar ediliyor. Sağlam bir ilk kaynağı yok. Oran "başarısızlık" tanımına göre değişiyor. | Doğrulanmadı |

Beş sayının yalnız biri sağlamdır. Bu sayıların hiçbiri uygulamaya girmedi. Uygulamadaki hiçbir kural bu sayılara dayanmıyor.

**Bir uyarı daha.** Dört belgenin en az üçü yapay zekâ cevaplarından oluşuyor. Bu belgeler aynı kaynakları tekrar ediyor. Üç belgenin aynı şeyi söylemesi üç ayrı kanıt değildir. Bu bir yankıdır.

## 5. Boşluk analizi

Tek bir soru sordum. Soru şudur: "Stratej işe başlarken hangi girdilere ihtiyaç duyar?" Girdi listesini dört belgedeki yöntemlerden çıkardım. Sonra her girdiyi uygulamada aradım.

| Stratej'in ihtiyaç duyduğu girdi | Uygulamada nerede? | Durum |
|---|---|---|
| Asıl engel ve başka açıklama | Adım 18, "Asıl engel" | Var |
| Birbirinden farklı yol adayları | Adım 18, "Yollar" | Var |
| Her yolun para mantığı ve kurma yolu | Adım 18, yol satırı | Var |
| "Bu yol için neler doğru olmalı?" | Adım 18, "Başarı neye bağlı?" | Var |
| En zayıf varsayım ve ucuz sınaması | Adım 10, varsayım haritası | Var |
| Kopyalanması zor güç | Adım 12, güç süzgeci | Var |
| Kur, satın al ya da ortak ol kararı | Adım 12 ve Adım 18 | Var |
| Rakibin karşı hamlesi | Adım 18, "Rakip tepkisi" | Var |
| Giriş bedeli | Adım 12, "Pistle karşılaştırma" | Var |
| Harcanan, bağlanan ve serbest para | Adım 16, "Serbest bütçe" | Var |
| Geri alınabilirlik | Adım 17 ve Adım 18 | Var |
| Durdurma kuralı ve kademeli izin | Adım 02 ve kapılar | Var |
| Önyargıya karşı sınama | Adım 17, ön ölüm listesi ve ayrı görüş | Var |
| Sektörün çekiciliği | Adım 04, beş güç | Var ama isteğe bağlı |
| Senaryolar ve erken işaretler | Adım 04 | Var ama isteğe bağlı |
| Planın düzeyi | Adım 00, grup sorusu | Kısmen |
| Paydaşlar ve pazar dışı etkenler | Adım 04 ve Adım 14, izinler | Kısmen |
| Belirsizliğin seviyesi | Yok | **Boşluk 1** |
| Yol tutmazsa en çok kayıp | Yok | **Boşluk 2** |
| Varsayımın bilgiye oranı | Veri var, hesap yok | **Boşluk 3** |
| Hiç bakılmayan alanlar | Ek 1 boş başlığı gösterir. Atlanan adımı göstermez. | **Boşluk 4** |
| Kısa yolda risk ve senaryo | Kısa yol Adım 04 ve Adım 17'yi gizler. | **Boşluk 5** |
| Yolu etkileyen kişiler | Yok | **Boşluk 6** |
| Hamlelerin sırası ve hızı | Yok | Boşluk değil. Stratej'in işidir. |

### Altı boşluğun açıklaması

**Boşluk 1: Belirsizliğin seviyesi.** Belirsizlik raporu dört seviye sayıyor. Birinci seviyede gelecek açıktır. Dördüncü seviyede olası sonuçların listesi bile çıkarılamaz. Stratej hangi araçla çalışacağını bu seviyeye göre seçer. Uygulama iki kritik belirsizliği soruyor ama seviyesini sormuyor.

**Boşluk 2: Yol tutmazsa en çok kayıp.** Uygulama her yolun bedelini soruyor. Şunu sormuyor: "Bu yol tutmazsa en çok ne kaybedersiniz? Sonra ayakta kalır mısınız?" Bilinmeyene karşı en sağlam koruma bu sorudur.

**Boşluk 3: Varsayımın bilgiye oranı.** Devir raporu her cümleyi etiketliyor: kaynaklı, hesap, karar ya da varsayım. Bu sayı stratej'e planın ne kadar sağlam olduğunu tek bakışta gösterir.

*Düzeltme.* İlk analizde "rapor toplamı vermiyor" yazmıştım. Bu cümle yarı yanlıştı. Ekrandaki rapor toplamı zaten veriyordu. Toplam yalnız indirilen Markdown dosyasında eksikti.

**Boşluk 4: Hiç bakılmayan alanlar.** Kullanıcı bir adımı gerekçe yazarak atlayabilir. Devir raporu atlanan adımları göstermiyor. Stratej kimsenin bakmadığı alanı göremiyor. Bilinmeyen bilinmeyenler en çok buralarda saklanır.

**Boşluk 5: Kısa yol.** Kısa yol üç adımı gizliyor: Adım 03, Adım 04 ve Adım 17. Adım 04 senaryoları taşır. Adım 17 ön ölüm listesini, bağımlılıkları ve ayrı görüşü taşır. Yani kısa yolu seçen kullanıcı bilinmeyene karşı bütün araçları kaybediyor. Bu en önemli içerik boşluğudur.

*Düzeltme.* Bu boşluk düşündüğümden büyük çıktı. Karar 5'in kapısı risk tablosunu Adım 17'den okuyor. Kısa yol Adım 17'yi gizlediği için kapı hiçbir zaman "İlerle" önerisi veremiyordu. Bu bir yazılım hatasıydı. Hata düzeltildi.

**Boşluk 6: Yolu etkileyen kişiler.** Uygulama izinleri ve karar haklarını soruyor. Şunu sormuyor: "Bu işi kim engelleyebilir, kim kolaylaştırabilir?" Örneğin mal sahibi, belediye ya da büyük bir tedarikçi.

## 6. Bilinmeyen analizi

Bilgiyi dört kutuya ayırabiliriz. Her kutunun tehlikesi ve aracı ayrıdır.

### 6.1. Bir girişimin planı için dört kutu

| Kutu | Ne demek? | Uygulamadaki araç | Eksik |
|---|---|---|---|
| Bildiğimizi bildiklerimiz | Ölçülmüş ve kanıtlanmış bilgi | Kanıt defteri, kanıt merdiveni, hesap kutuları | Yok |
| Bilmediğimizi bildiklerimiz | Sorusu belli, cevabı belli olmayan konular | Varsayım haritası, senaryolar, açık karar defteri, başarı koşulları | Belirsizlik seviyesi |
| Bildiğimiz ama söylemediklerimiz | Ekibin sezdiği ama masaya koymadığı gerçekler | Ön ölüm listesi, ayrı görüş, ikinci okur, başarısız örnekler, karşı bulgu uyarısı | Kısa yolda gizli |
| Bilmediğimizi bilmediklerimiz | Sorusu bile sorulamayan konular | Liste çıkarılamaz. Yalnız koruyucu yapı kurulur. | Aşağıda |

### 6.2. Bilinmeyene karşı koruyucu yapı

Bilinmeyen bilinmeyenleri tahmin edemeyiz. Yalnız şoka dayanan bir yapı kurabiliriz. Belgeler bunun için beş araç sayıyor.

| Koruyucu araç | Uygulamada var mı? |
|---|---|
| Parayı öğrenme adımlarına bağlamak | Var. Kapılar ve koşullu izinler bunu yapıyor. |
| Durdurma kuralı | Var. En az üç kural isteniyor. |
| Geri alınabilir kararı tercih etmek | Var. Her yol için soruluyor. |
| Tek kaynağa bağlı kalmamak | Var. Adım 17'de soruluyor. |
| En kötü durumda ayakta kalmak | Yok. Boşluk 2. |
| Kimsenin bakmadığı alanı görmek | Kısmen. Boşluk 4. |

### 6.3. Bu projenin kendi dört kutusu

Aynı analizi bu yazılım için de yaptım. En önemli bulgular buradadır.

**Bildiğimizi bildiklerimiz**

- Uygulama yayında ve testleri geçiyor.
- Süreç tek bir kuraldan okunuyor.
- Uygulama tek bir işin hazırlığını yapıyor.

**Bilmediğimizi bildiklerimiz**

- Uygulamayı gerçek bir okur telefonda denemedi.
- Devir raporunu gerçek bir stratej okumadı.
- Hiçbir gerçek plan baştan sona yürümedi. Yalnız örnek plan var.
- Geçiş kapısının eşikleri sınanmadı. "9 zorunlu ve en az 4 destekleyici" kuralı bir tahmindir.
- Gerçek cihazda ve Firefox'ta deneme yapılmadı.
- Yeniden yazılan 43 yöntem metninin tamamı okunmadı.
- Lisans seçilmedi.

**Bildiğimiz ama söylemediklerimiz**

Bu kutu en değerli kutudur. Dört şeyi biliyoruz ama masaya koymadık.

1. **Form çok büyüdü.** Strateji öncesi adımlarda 75 bölüm ve 236 alan var. Adım 18 tek başına 8 bölüm ve 33 tablo sütunu taşıyor. Son bir günde Karar 5'in alan sayısı 115'ten 165'e çıktı.
2. **Bu büyüme okur ölçütüyle çelişiyor.** Kendi kuralınız şudur: okur bir adımı anlamazsa sonraki adımı denemez. Sekiz bölümlü bir adım bu kuralı zorlar. İsteğe bağlı bölümler bugün kapalı gelmiyor. Hepsi açık duruyor.
3. **Veri tek bir tarayıcıda duruyor.** Kullanıcı yedek almazsa ve tarayıcı verisi silinirse plan kaybolur.
4. **Kapsam kayıyor.** Uygulama iş düzeyindedir. Son belgeler kurumsal düzeyi anlatıyor. Her yeni belge uygulamaya yeni alan olarak giriyor.

Bir de yöntemle ilgili bir gerçek var. Son iki günde her araştırma belgesi uygulamaya yeni alan olarak girdi. Hiçbir ekleme, uygulamayı kullanan bir kişinin ihtiyacından gelmedi. Hepsi belgelerden geldi.

**Bilmediğimizi bilmediklerimiz**

Bu kutunun listesi çıkarılamaz. Ama içindekileri ortaya çıkaran dört yol var:

1. Gerçek bir işin planını baştan sona yürütmek.
2. Devir raporunu gerçek bir stratej'e okutmak ve ne yapacağını sormak.
3. Bir okura telefonda üç adım doldurtmak ve takıldığı yeri izlemek.
4. Bir ay sonra geri bakmak ve hangi alanın hiç kullanılmadığını saymak.

Bu dört yolun hiçbirini yazılım tek başına yapamaz. Dördü de gerçek insan ister.

## 7. Önerilerim

### Önce: yeni alan eklemeden iki iş

**Öneri A, gerçek deneme.** Üç küçük deneme öneriyorum. Denemeler bir gerçek planla, bir okurla ve bir stratej'le yapılır. Bu denemeleri siz yaparsınız. Ben deneme için kısa bir föy hazırlayabilirim. Föy neye bakılacağını ve neyin not edileceğini söyler.

**Öneri B, yükü azaltmak.** İki küçük değişiklik öneriyorum:

1. İsteğe bağlı bölümler kapalı gelsin. Kullanıcı isterse açsın.
2. Adım 18 ekranda iki sekmeye ayrılsın. Birinci sekme zorunlu bölümleri taşısın. İkinci sekme isteğe bağlı bölümleri taşısın. Adım sayısı değişmez.

### Sonra: altı boşluk için küçük işler

| Boşluk | Önerim | Yeni alan sayısı |
|---|---|---|
| 5. Kısa yol | Kısa yolda Adım 17'nin iki bölümü görünsün: ön ölüm listesi ve bağımlılık. | 0 |
| 3. Varsayımın bilgiye oranı | Devir raporu oranı kendisi hesaplasın. | 0 |
| 4. Bakılmayan alanlar | Devir raporu atlanan adımları ve nedenini göstersin. | 0 |
| 2. En çok kayıp | Adım 17'ye tek bir soru eklensin. | 1 |
| 1. Belirsizlik seviyesi | Adım 04'teki iki belirsizliğe birer seçim eklensin. | 2 |
| 6. Etkileyen kişiler | Adım 17'ye küçük bir tablo eklensin. | 1 |

İlk üç iş hiç yeni alan eklemez. Bu yüzden önce onları öneriyorum.

### Eklemeyi önermediklerim

- **Kurumsal düzey.** Portföy rolleri, merkez tipleri ve en iyi sahip sınaması ayrı bir üründür. Bu uygulamaya eklenirse uygulama iki ayrı işi birden yapmaya çalışır.
- **Halter oranları ve güç eğrisi.** Bu sayılar doğrulanmadı. Küçük bir girişime de uymaz.
- **Hamlelerin sırası, on test, Hoshin Kanri, karar hakları modeli.** Bunlar strateji çalışmasının ve sonrasının araçlarıdır. Hazırlığa ait değildir.
- **Ortam seçimi için beş yaklaşım.** Bu seçimi stratej yapar. Hazırlık yalnız belirsizlik seviyesini verir.

## 8. Sizin karar vermeniz gerekenler

1. Önce yükü azaltayım mı, yoksa önce altı boşluğu mu kapatayım? Önerim: önce yük.
2. Gerçek deneme için föy hazırlayayım mı?
3. Kurumsal düzey bu uygulamaya girsin mi? Önerim: girmesin. Ayrı bir iş olsun.
4. Belirsizlik raporundaki sayıları kaynağından doğrulayayım mı?

## 9. Sınırlar

- Belgelerdeki beş sayıyı kaynağından aradım. Sonuç 4. bölümdedir. Öteki alıntıları ve bağlantıları doğrulamadım.
- Sayıları web aramasıyla doğruladım. Kitabın ve makalelerin tam metnini okumadım.
- "Boşluk" ve "boşluk değil" ayrımı benim yargımdır.
- Uygulamanın alan sayılarını kaynak koddan saydım.
- `strtgy.md` dosyasının yalnız başlıklarını yeniden okudum. İçeriğini dün analiz etmiştim.
- Rapor gerçek okurla denenmedi.

## 10. Uygulama notu

Bu bölüm 15 Kasım 2026 Pazar günü yazıldı. Bölüm, rapordaki önerilerden hangisinin yapıldığını anlatır.

### 10.1. Yapılan işler

| Raporda ne vardı? | Ne yaptım? | Yeni alan |
|---|---|---|
| Öneri B: isteğe bağlı bölümler kapalı gelsin | Boş isteğe bağlı bölüm artık kapalı gelir. Kullanıcı bölümü "Aç" düğmesiyle açar. Dolu bölüm açık gelir. | 0 |
| Öneri B: Adım 18 iki sekmeye ayrılsın | Üç ve daha çok isteğe bağlı bölümü olan her adım iki sekmeye ayrılır. Bu adımlar 09, 12, 17 ve 18'dir. | 0 |
| Boşluk 1: belirsizlik seviyesi | Adım 04'teki iki belirsizliğe birer seçim ekledim. Devir raporu seviyeyi gösterir. | 2 |
| Boşluk 2: en çok kayıp | Adım 17'ye tek soru ekledim. Devir raporu cevabı "En kötü durum" adıyla gösterir. | 1 |
| Boşluk 3: varsayımın bilgiye oranı | İndirilen rapor artık oranı tek cümleyle yazar. | 0 |
| Boşluk 4: bakılmayan alanlar | Devir raporu atlanan, boş kalan ve kısa yolda gizlenen adımları gösterir. Atlama nedenini de yazar. | 0 |
| Boşluk 5: kısa yol | Kısa yolda Adım 17 görünür. Adım üç bölüm taşır: ön ölüm listesi, risk tablosu ve bağımlılık. | 0 |
| Boşluk 6: etkileyen kişiler | Adım 17'ye isteğe bağlı küçük bir tablo ekledim. Devir raporu tabloyu gösterir. | 1 |
| Veri tek tarayıcıda duruyor | Plan özeti yedek uyarısı verir. Uyarı yedek hiç alınmadıysa ya da 7 günden eskiyse çıkar. | 0 |
| Öneri A: gerçek deneme | Deneme föyünü yazdım: [gercek-deneme-foyu.md](gercek-deneme-foyu.md). Denemeleri siz yaparsınız. | 0 |
| Belgelerdeki sayılar | Beş sayıyı kaynağından aradım. Sonuç 4. bölümdedir. | 0 |
| 43 yöntem metninin tamamı okunmadı | Üç bağımsız inceleyici 43 metnin hepsini asıl metinle karşılaştırdı. 24 düzeltme yaptım. | 0 |
| Planın düzeyi "kısmen" görünüyordu | Devir raporunun başına şu cümleyi ekledim: "Düzey: tek işin planı." | 0 |

Toplam dört yeni alan eklendi. Dördü de isteğe bağlıdır.

### 10.2. Form yükü nasıl değişti?

Önce bir kural koydum. Kural şudur: bir bölümü hiçbir kapı ve hiçbir denetim okumuyorsa o bölüm isteğe bağlıdır.

Bu kurala göre 21 bölüm daha isteğe bağlı oldu. Örneğin "Değer önerisi kanvası" ve "Pistle karşılaştırma" bölümleri böyledir.

| Ölçü | Önce | Sonra |
|---|---|---|
| Strateji öncesi bölüm sayısı | 75 | 76 |
| Strateji öncesi alan sayısı | 236 | 240 |
| Boşken kapalı gelen bölüm | 0 | 31 |
| Boşken kapalı gelen bölümlerdeki alan | 0 | 91 |
| Açık gelen bölümlerdeki alan | 236 | 149 |
| Adım 18'in ilk sekmesindeki bölüm | 8 | 1 |

Örnek planın profilinde açık gelen bölüm sayısı 39'dur. Bu bölümlerde 119 alan vardır.

Alan sayısı azalmadı. Kullanıcının ilk bakışta gördüğü alan sayısı azaldı. Bu fark önemlidir. Formun gerçekten küçülmesi için gerçek kullanım verisi gerekir.

### 10.3. Kapsam kaymasına karşı kapı

Raporun en sert bulgusu şuydu: her yeni belge uygulamaya yeni alan olarak giriyor.

Buna karşı testlere bir alan bütçesi ekledim. Bütçe şudur:

- Strateji öncesi adımlarda en çok 240 alan olur.
- Açık gelen bölümlerde en çok 149 alan olur.

Biri yeni alan eklerse test kırılır. Testi geçirmek için bütçeyi bilerek yükseltmek gerekir. Bütçeyi yükseltme kararını siz verirsiniz.

### 10.4. Yazılımın kapatamadığı konular

Bu konular hâlâ açıktır. Hiçbirini yazılım tek başına kapatamaz.

| Konu | Neden açık? | Kim kapatır? |
|---|---|---|
| Gerçek okur telefonda denemedi | Deneme gerçek insan ister. | Siz, föydeki 2. denemeyle |
| Gerçek bir stratej raporu okumadı | Deneme gerçek stratej ister. | Siz, föydeki 3. denemeyle |
| Hiçbir gerçek plan baştan sona yürümedi | Yalnız örnek plan var. | Siz, föydeki 1. denemeyle |
| Geçiş kapısının eşikleri sınanmadı | Eşik ancak gerçek planlarla sınanır. | İlk üç gerçek plandan sonra birlikte bakarız |
| Gerçek cihazda deneme yapılmadı | Testler bilgisayardaki tarayıcıda koşuyor. | Siz, föydeki denemelerle |
| Firefox'ta deneme yapılmadı | Firefox testleri sizin kalıcı kararınızla çalıştırılmıyor. | Siz isterseniz ben çalıştırırım |
| Lisans seçilmedi | Lisansı ancak siz seçersiniz. | Siz |
| Veri hâlâ tek tarayıcıda duruyor | Uyarı riski azaltır ama kaldırmaz. Eşitleme bir sunucu ister. | Sizin kararınız |
| Kurumsal düzey | Bu uygulamaya eklemedim. Ayrı bir iş olarak duruyor. | Sizin kararınız |
| Bilmediğimizi bilmediklerimiz | Liste çıkarılamaz. Ancak gerçek kullanım ortaya çıkarır. | Föydeki dört yol |

### 10.5. 8. bölümdeki dört sorunun durumu

1. Yük mü, boşluk mu? İkisi de yapıldı. Önce yük azaltıldı.
2. Föy hazırlansın mı? Föy yazıldı.
3. Kurumsal düzey girsin mi? Girmedi. Karar sizde duruyor.
4. Sayılar doğrulansın mı? Beş sayı arandı. Yalnız biri sağlam çıktı.

### 10.6. Bağımsız inceleme

İşi bitirince kodu bağımsız bir inceleyiciye okuttum. İnceleyici 20 bulgu yazdı. İkisi yüksek önemdeydi.

| Bulgu | Ne yaptım? |
|---|---|
| Sekme seçimi sonraki adıma taşınıyordu. Zorunlu bölüm görünmüyordu. | Çalışma ekranı artık her adımda yeniden kurulur. |
| Dolu bölüm, alanı boşalınca yazarken kapanıyordu. | Bölümü artık yalnız kullanıcı kapatır. |
| Ekipte kısa yol Adım 03'ü gizliyordu. Kapı 1 ise o adımı okuyordu. | Adım 03 ekipte kısa yolda da görünür. |
| Adım 12 aynı bölümlere hem "zorunlu" hem "isteğe bağlı" diyordu. | Notu yeni kurala göre yeniden yazdım. |
| Devir raporu dolu adıma "bakılmadı" diyordu. | Kısa yolda gizli ama dolu adım artık listeye girmez. |
| "Aç" düğmesinin dokunma alanı 32 pikseldi. | Görünen boyut aynı kaldı. Dokunma alanı 44 piksel oldu. |
| Sağ sütundaki bağlantı kartı üst şeridin altına kaydırıyordu. | Kart artık şeridin altında durur. Odak başlığa geçer. |
| Doluluk yüzdesi isteğe bağlı alanları da sayıyordu. | Yüzde yalnız zorunlu bölümlerden hesaplanır. |
| Eksik alan uyarısı doğru sekmeyi açmıyordu. | Uyarı artık eksik bölümü açar ve gösterir. |
| "En kötü durum" raporda "karar" etiketi alıyordu. | Bu satır artık "varsayım" etiketi alır. |
| Dayanak gruplarının adım bağlantıları kaymıştı. | Adım artık grubun verisinde yazılıdır. |
| Bölüm anında açılıp kapanıyordu. | Bölüm iki yönde de aynı sürede hareket eder. |
| Sekiz küçük bulgu daha vardı. | Sekizini de düzelttim. Örneğin silinen planın yedek kaydı artık silinir. |

Bir bulguyu yarım bıraktım. İnceleyici düğmenin adının sabit kalmasını önerdi. Düğmenin adı ise "aç" ve "kapat" diye değişiyor. Görünen yazı da değiştiği için adı değiştirmedim.

Örnek planı açan test yardımcısı yük altında tıklamayı kaçırıyordu. Yardımcıyı 13 test dosyasında düzelttim.

### 10.7. Doğrulama

Bu işlerin kuralları testlerdedir. Tarayıcı testleri `tests/kapsam.spec.ts` dosyasındadır.

| Kontrol | Sonuç |
|---|---|
| Tip denetimi ve arayüz kapısı | Geçti |
| Birim testleri | 277 test geçti |
| Tarayıcı testleri, Chromium 320, 375 ve 1280 piksel | Geçti |
| Tarayıcı testleri, WebKit 390 ve 1280 piksel | Geçti |
| Firefox | Çalıştırılmadı |
| Gerçek telefon | Çalıştırılmadı |

Tarayıcı testlerinin toplamı 537 geçen ve 23 atlanan testtir. Atlanan testler yalnız belirli bir genişlikte çalışır.

Bu not ve föy gerçek okurla denenmedi.
