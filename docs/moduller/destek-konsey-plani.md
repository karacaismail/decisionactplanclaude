# Destek ve teşvik: konsey planı

Bu plan "Destek ve teşvik" bölümünün sonraki geliştirmesini anlatır. Plan bütün sektörlere ve bütün ölçeklere uygun olacak biçimde yazıldı.

## Plan nasıl hazırlandı?

Planı üç farklı şirketin modeli birlikte hazırladı. Her model kendi hesabıyla ve yalnız okuma izniyle çalıştı. Çalışma Pane içinde yapıldı.

| Üye | Model | Hesap |
|---|---|---|
| Claude | Opus | Claude 02 |
| Codex | Varsayılan Codex modeli | Codex 02 |
| Gemini | Gemini 4 Carbon, yüksek düzey | Google |

Konsey 20 Kasım 2026 Cuma günü altı turda çalıştı:

1. Her üye kendi planını yazdı.
2. Her üye üç planı okudu ve eleştirdi.
3. Başkan ortak taslak çıkardı. İki üye itiraz etti.
4. İkinci taslakta bir üye itiraz etti.
5. Üçüncü taslakta bir üye küçük bir itiraz yaptı.
6. Dördüncü taslağı üç üye de onayladı.

Turların bütün metinleri bu çalışmanın Pane klasöründe durur. Plan gerçek okurla denenmedi.

## A. Ortak ilkeler

1. Ayıklanan veri toplu kopyalanmaz. Her madde tek tek incelenir.
2. Kaynaksız tutar, oran, süre ve tarih gösterilmez. Değer "Bilinmiyor" olur.
3. Uygulama tutar hesaplamaz ve puan vermez. Bilinmeyen bilgi "Uygun" sonucu vermez.
4. Destek temel bütçe toplamına girmez. Destek "Beklenen, kesin değil" diye ayrı durur.
5. Destek verisi plana yazılmaz ve kararları eskitmez.
6. Hiçbir metin kesin izin veya söz vermez. Kesin cevabı kurum verir.
7. Yeni bağımlılık, sunucu ve canlı veri çekme yoktur.
8. Ekranlar 320 pikselde yana kaymadan çalışır. Her grafiğin bir tablo karşılığı olur.
9. Ekran metinlerinde bazı işaretler yasaktır. Kural `denetim.ts` içindeki `YASAK_ISARET` testidir. Yasak işaretler şunlardır:
   - noktalı virgül,
   - uzun ve orta çizgi,
   - ok ve çarpı işareti,
   - iki kelimeyi bağlayan eğik çizgi,
   - boşluklu artı.

## B. Konulara göre kararlar

### 1. Belge ve kanıt listesi

- **Karar**

  Emlak, kaynak kodu teslimi ve ülke adı içeren maddeler atılır. NACE belgesi ve "Ürün veya hizmet kanıtı" genel adla kalır.
- **Veri**

  `OrtakBelge { id, ad, aciklama, asama: basvuru | odeme | izleme, kurulusSonrasi, sureli }`. Programlar `ortakBelgeIdleri` taşır.
- **Saklama**

  Ortak belgeler destek deposunda durur. Plan varsa plan anahtarıyla, plan yoksa plansız anahtarla saklanır. Plan verisine yazılmaz. Süreli belge yalnız kişinin girdiği geçerlilik tarihini taşır. Uygulama kaynaksız gün sınırı koymaz.
- **Ayrışma kararı**

  Havuzdaki "Hazır" işareti öteki başvurulara kendiliğinden geçmez. Kişi her başvuruda "Bu belgeyi kullanacağım" der. Süreli belgede tarih kontrol uyarısı çıkar.
- **Kabul**

  Belge metinlerinde sektör ve ülke adı yoktur. Bir başvurudaki işaret öteki başvuruyu değiştirmez.
- **Risk**

  Kişi eski bir belgeyi hazır sanabilir. Süreli belgede tarih uyarısı bu riski azaltır.

### 2. Gider kalemleri

- **Karar**

  Genel gider türleri kurulur. Her eşleşme katalogdaki `uygunGider` ya da `haricGider` metnine birebir bağlanır. Dizi sırası kullanılmaz.
- **Veri**

  `GiderEslesme { giderId, programId, tur: uygun | haric, kanitMetni }`.
- **Ekran**

  Kişi "Hangi gideriniz var?" seçimini yapar. Katalogda karşılığı olmayan giderde "Katalogda bu gideri karşılayan program bulunmadı. Kuruma sorun." yazar. Örneğin "kira" ve "hammadde" sözleri katalogda hiç geçmez. Bu durum desteğin olmadığı anlamına gelmez.
- **Kabul**

  Her `kanitMetni` katalogda birebir bulunur. Hariç tutulan gider aday listesine girmez.
- **Risk**

  Katalog metni değişince eşleşme kopabilir. Birebir metin testi bunu derlemede yakalar.

### 3. Birlikte kullanma

- **Karar**

  Mevcut `kombinasyon` verisi kaynaksızdır ve iki çelişki içerir. Bu yüzden kaynak bulunana kadar ekranda olgu olarak gösterilmez. Her çift "Bilinmiyor. Kuruma sorun." olur.
- **Veri**

  `KombinasyonKurali { digerProgramId, iliski: Fact<tur>, yonlu }`. Tür sözlüğü korunur: birlikte kullanılamaz, ayrı giderle birlikte, önkoşul, ret sonrası seçenek, birlikte kullanılabilir.
- **Ekran**

  Kişinin iki başvurusu varsa yumuşak bir uyarı çıkar: "Aynı gideri iki programa yazmadan önce iki kuruma da sorun." Aynı fatura ya da çalışan iki başvuruya bağlanmış olabilir. O zaman uyarı şöyle olur: "Bu gider iki başvuruda da yer alıyor. Birlikte kullanımı kurumlara sorun." Uyarılar kesin kural gibi yazılmaz. Kesin kısıt yalnız resmî dayanağı olan program çifti için gösterilir.
- **Kabul**

  Kaynaksız kural derlemede reddedilir. Tanımsız çift "Bilinmiyor" döner. Simetrik türde iki yön aynıdır.
- **Risk**

  Kişi "Bilinmiyor" sonucunu izin sanabilir. Her çiftte "Kuruma sorun" yazısı bu riski azaltır.

### 4. Sözlük

- **Karar**

  Genel destek terimleri alınır. TTBS, EİDS ve "bilinmeyen bilinmeyen" atılır. CAPEX ve OPEX Türkçe adla yazılır, İngilizce ad yalnız aramada çalışır.
- **Veri**

  `SozlukMaddesi { id, terim, anlam, esAnlamlilar }`.
- **Ekran**

  Tek sözlük sayfası ve arama kutusu. Program kartında terime dokununca aynı tanım açılır.
- **Kabul**

  Her tanım en çok 15 kelimedir. Tanımda yasak işaret yoktur. Tanım sayı yazmaz. Sayı gereken terimde tanım kurumun resmî tanımına yönlendirir. Örneğin KOBİ tanımı eşik yazmaz. Kart ve sözlük aynı metni gösterir.
- **Risk**

  Tanım fazla kısalırsa anlam kayar. Her tanım bir örnekle sınanır.

### 5. Sorular

- **Karar**

  Sorular üç katmandır. Temel akış en çok 5 sorudur. İkinci katman yalnız "Belki" sonucunu netleştiren kurala bağlı sorulardır. Üçüncü katman tercih süzgecidir.
- **Yeni alanlar**

  Profile üç yeni alan eklenir:

  - Kuruluş durumu. Seçenekler: kuruldu, henüz kurulmadı, bilmiyorum.
  - Ölçek. Seçenekler: mikro, küçük, orta, büyük, bilmiyorum.
  - İşletme türü. Seçenekler: şahıs ya da esnaf işletmesi, limited şirket, anonim şirket, kooperatif, diğer, henüz seçilmedi, bilmiyorum.

  Katalogda ayrı koşulu olan her hukuki tür ayrı seçenek olur. "Diğer" cevabıyla tür koşulu çözülemiyorsa program en çok "Belki" olur. Tür koşulu olmayan programlar bu cevaptan etkilenmez. Kuruluş durumu ve ölçek ayrı alanlardır.
- **Bilinmeyen cevap**

  Kişi herhangi bir soruda "Bilmiyorum" seçebilir ya da soruyu boş bırakabilir. İşletme türünde "henüz seçilmedi" de bilinmeyen sayılır. Bu durumda o koşula bağlı program "Uygun" olmaz. Program en iyi durumda "Belki" olur. Eski profillerde yeni alanlar boştur. Uygulama boş alanı "Bilmiyorum" sayar.
- **Boş sonuç**

  Sonuç listesi boşsa ekran şunu yazar: "Katalogda profilinizle eşleşen program bulunamadı. Başka destekler olabilir. Kuruma sorun." Bazen liste boş değildir ama katalogda o işe özel program yoktur. O zaman ayrı bir bilgi notu çıkar: "Katalogda işinize özel program yok. Listede genel programlar var." Bu not yalnız kişi faaliyet alanını seçtiyse görünür.
- **Atılanlar**

  Konsorsiyum, sektör görüşü ve yabancı dil platformu soruları atılır. E-imza ve kurum sistemi kaydı soruları belge listesine taşınır.
- **Tercih süzgeci**

  Kredi ve hisse tercihi hiçbir programı "Uygun değil" yapmaz. Süzgeç yalnız sırayı ve görünümü değiştirir.
- **Kabul**

  Her soru bir kurala ya da süzgece bağlıdır. Beş profil testi geçer:

  1. kurulmamış girişim,
  2. 3 kişilik kafe,
  3. 200 kişilik ayakkabı üreticisi,
  4. büyük işletme,
  5. bir tarım ya da turizm işletmesi.

  Tarım ya da turizm profili iki senaryoda sınanır. Birinci senaryoda profil genel programlarla eşleşir ve bilgi notu görünür. İkinci senaryoda hiç eşleşme yoktur ve "Boş sonuç" metni görünür. "Bilmiyorum" ve boş alan için ayrı testler vardır. Faaliyet alanı seçilmezse "işe özel program yok" notunun görünmediği de sınanır. Eski profiller açılır.
- **Risk**

  Soru sayısı artarsa okur yorulur. Temel akış en çok 5 soruda kalır.

### 6. Fayda türleri

- **Karar**

  Bir program birden çok fayda taşıyabilir. Kefalet ve hizmet ayrı türlerdir.
- **Veri**

  Veri alanı `faydalar: readonly FaydaTuru[]` olur. Fayda türleri şunlardır:

  - hibe,
  - vergi ve prim indirimi,
  - faiz desteği,
  - geri ödemeli kredi,
  - ortaklık yatırımı,
  - kefalet,
  - hizmet ya da ayni destek,
  - destek değil.
- **Ekran**

  Kartta etiket, listede süzgeç. Etiket geri ödeme, kasaya para girişi ve hisse etkisini yazar.
- **Kabul**

  46 programın hepsinde en az bir fayda vardır. Uygulama hiçbir tavanı toplamaz. Kartta her fayda kendi tavanıyla ayrı görünür.
- **Risk**

  Kişi krediyi hibe sanabilir. Etiket "geri ödenir" bilgisini açıkça yazar.

### 7. Kurum süreleri

- **Karar**

  Kurum geneli tahmin tablosu atılır. Süre program ya da çağrı başına, başlangıç olayıyla tutulur.
- **Veri**

  `sure: { degerlendirme: Fact<metin>, ilkOdeme: Fact<metin> }` ve `odemeBicimi`.
- **Ekran**

  Kaynak yoksa "Süre bilinmiyor. Kuruma sorun." yazar.
- **Kabul**

  Kaynaksız süre katalog testinden geçmez.
- **Risk**

  Resmî hedef süre kesin tarih sanılabilir. Ekran süreyi kesin ödeme tarihine çevirmez.

### 8. Finansman görünümü

- **Karar**

  Planın mevcut finansman kalemleri, kişinin girdiği kaynak ve tutarlarla çubukta görünür. Aynı satırlar bir tabloda da durur. Beklenen destekler "Beklenen, kesin değil" başlığı altında ayrı durur ve tutar taşımaz. Uygulama yeni tutar hesaplamaz ve temel bütçe toplamını değiştirmez.
- **Veri**

  Gider satırı ile başvuru arasındaki bağ destek deposunda durur. Plan sınırlarını okumak için ortak sözleşmeye `selectLimits` eklenmesi gerekir. Bu ekleme bağımsız inceleme ister. Ürün sahibi bu eklemeyi onaylamazsa ekran plan sınırlarını okumaz. Ekran yalnız mevcut plan kalemlerini, gider bağlarını ve "Beklenen, kesin değil" listesini gösterir.
- **Kabul**

  Bütçe toplamı değişmez. Kararlar eskimez. Aynı gider satırına iki program bağlanırsa B.3'teki yumuşak uyarı çıkar. 320 pikselde taşma yoktur.
- **Risk**

  Çubuk, desteği kesin para gibi gösterebilir. Destek bu yüzden çubuğa girmez.

### 9. Kuruma sorulacak genel sorular

- **Karar**

  Sorular altı gruptur. Sözlü cevap kaydı açılmaz.
- **Veri**

  `KurumSorusu { id, grup, soru, faydalar? }`.
- **Ekran**

  Program ve başvuru ekranında kopyalanabilir soru grupları. Liste plansız ve profilsiz açılır.
- **Kabul**

  Sorularda şirket, ürün ve sektör adı yoktur. Yasak işaret yoktur.
- **Risk**

  Soru listesi uzarsa okunmaz. Sorular gruplara ayrılır ve kapalı açılır.

## C. Katalog onarımı

- Her programın kontrol tarihi ayrı tutulur.
- Kaynak ve tazelik kontrolü alan alan çalışır. Kartın tamamı tek kalemde kilitlenmez.
- Güncel kaynaklı alan gösterilir. Kaynaksız alan "Bilinmiyor" olur. Süre alanında bu metin "Süre bilinmiyor. Kuruma sorun." olur.
- Bugünkü kod 90 günden eski bilgide tutarı gizliyor. Bu davranış değişir. 90 günden eski kaynaklı tutar, oran, süre ve tarih yerine "Bilinmiyor. Bilgi eski." yazar.
- Katalog dosyasında her programın kayıtlı kontrol tarihi 12 Ağustos 2026 Çarşamba günüdür. Doksan günlük süre 10 Kasım 2026 Salı günü doldu. Bu yüzden bugün bütün programların bilgisi eskidir.
- Kayıtlı kontrol tarihleri program program yeniden doğrulanır. Bu doğrulama planın zorunlu bir adımıdır. Doğrulama bitene kadar bu alanlar "Bilinmiyor. Bilgi eski." kalır.
- Bölgesel programlar "Yalnız belli il veya bölge" etiketi alır. Örnek: İstanbul programları ve kalkınma ajansı programları.
- Destek olmayan kayıtlar "Destek değil" etiketi alır. Örnek: tescil kurumu.
- Tek kuruma bağlı özel programlar gözden geçirilir.

## D. Sıra

1. Katalog onarımı ve resmî kaynaklardan yeniden doğrulama, fayda türleri, sözlük ve kurum soruları. Eşleşme doğru katalog olmadan çalışmaz. Bu yüzden katalog önce gelir.
2. Ölçekli profil ve katmanlı sorular. Belge ve gider koşulları ölçeğe bağlıdır. Bu yüzden profil ikinci gelir.
3. Belgeler, giderler, birlikte kullanma kaynakları ve süreler. Bu işler doğru katalog ve profil ister.
4. Finansman görünümü. Görünüm gider bağlarını okur. Bu yüzden en son gelir.

## E. Kurumlara sorulacak genel sorular

**Uygunluk**
1. Faaliyet kodumuz ve şirket türümüz bu programa uygun mu?
2. Henüz kurulmamış bir girişim başvurabilir mi?
3. Ölçek, çalışan sayısı ve ciro hangi tarihteki belgeyle ölçülüyor?
4. Bağlı şirketler ya da kurucunun önceki ortaklığı uygunluğu etkiler mi?
5. Yapılandırılmış vergi ya da SGK borcu başvuruya engel olur mu?

**Giderler**
1. Bu gider kalemi kapsama giriyor mu?
2. Başvurudan önce yapılan harcama sayılır mı?
3. Bu yıl geçerli destek oranı ve üst sınır nedir?
4. KDV, ikinci el alım, kiralama ya da ilişkili şirketten alım desteklenir mi?

**Ödeme ve süre**
1. Değerlendirme ve ilk ödeme süresi hangi olayla başlıyor?
2. Eksik belge süreyi nasıl etkiliyor?
3. Ödeme harcamadan sonra mı yapılıyor? Avans var mı?
4. Ödeme için teminat mektubu ya da kefalet gerekiyor mu?

**Birlikte kullanma**
1. Bu desteği başka bir hibe, kredi ya da prim teşvikiyle aynı dönemde kullanabilir miyiz?
2. Prim teşvikinden yararlanan çalışanın ücreti bu programda gösterilebilir mi?

**Yükümlülükler**
1. Destekten sonra çalışan sayısını, ortaklık payını ya da ekipmanı kaç yıl korumalıyız?
2. Hangi izleme raporları isteniyor?
3. Proje değişirse ya da hedef tutmazsa ne oluyor?

**Resmî dayanak**
1. Bu cevap hangi güncel mevzuat ya da çağrı rehberi maddesine dayanıyor?

## F. Ürün sahibine sorulacak açık kararlar

1. Tarım, turizm ve öteki illerin programları kataloğa eklensin mi?
2. Ortak sözleşmeye `selectLimits` eklensin mi?
3. Toplam JS sınırı aşılırsa katalog ayrı veri dosyasına mı taşınsın?
