# Girişimci Aksiyon Planı: bağımsız arayüz eleştirisi

İncelenen görüntü sayısı: 36. 1280 açık ve koyu temanın 10 ekranı. 320 açık temanın 10 ekranı. 390 koyu temanın 6 ekranı. Uzun ekranları parça parça büyüterek inceledim. Kod okumadım.

## 1. Puanlar

| Ortam | Puan | Gerekçe |
| --- | --- | --- |
| Telefon, 320 px | 4 / 10 | Her şey eşit ağırlıkta kart yığını. "kapi5" ekranı 337 px genişliğe taşıyor. Yani sayfa yatay kayıyor. Tablolar tek sütuna düşüyor. |
| Masaüstü, 1280 px | 5 / 10 | Temel düzen çalışıyor. Ama kart içinde kart, beş ayrı renkli kutu ve üç eşit düğme var. Hiyerarşi yok. Yazı ölçeği liste ekranlarında çok büyük. |
| Koyu tema | 4 / 10 | Üç yüzey birbirinden ayrılmıyor. Kahverengi vurgu kutuları çamur gibi duruyor. Ana düğme soluk somon oluyor. Grafik açıklaması okunmuyor. |

## 2. Neden MVP gibi görünüyor? En önemli 8 neden

1. **Her şey yuvarlatılmış kart.** 1280-acik-ozet ekranında 11 ayrı kart var. Dört gri KPI kutusu, dört beyaz istatistik kartı, rota kartı, "Son kararlar" kartı ve "Kısayollar" kartı. Hepsi aynı 16 px köşe ve aynı yüzey. Hangisi önemli, belli değil.
2. **Aynı bilgi iki ayrı stilde.** 1280-acik-ozet ekranında gri "Toplam harcama sınırı" şeridi ile beyaz "Onaylanan karar" kartları üst üste duruyor. İkisi de KPI. Biri gri kutu, biri beyaz kart ve renkli ikon. Sistem yok, tek tek karar var.
3. **Beş renkli uyarı kutusu.** Şeftali "Kısaca", gri "Günlük Hayattan", mavi "Veri nerede durur?", yeşil "Bir bulgu neyi kanıtlar?" ve sarı "Ağır yatırım". 1280-acik-karar1, kanitlar, planlar ve adim11 ekranlarında görülüyor. Bu, eski Bootstrap uyarı kalıbı. Kurumsal araçlarda bu kadar renkli kutu olmaz.
4. **Düğme hiyerarşisi kırık.** 1280-acik-planlar ekranında üç düğme yan yana ve aynı boy. 1280-acik-adim11 ekranında dört işlem düğmesi iki satır halinde sol altta yüzüyor. Tablonun üçüncü satırını örtüyor. 1280-acik-ciktilar ekranında belge üstünde 8 kontrol var.
5. **Etiket kalabalığı.** 1280-acik-karar1 ekranında her adımda turuncu başlık, iki etiket ve tik ikonu var. Yan menüde 7 maddenin her birinde etiket var. "3. Erişim ve seçenek" satırında etiket kesiliyor ve "Geçt" yazıyor. Bu kesik etiket her ekranda görünüyor.
6. **Tablolar bitmemiş.** 1280-acik-kanitlar tablosu "Kaynak" sütununda kesiliyor. Kaydırma izi yok. 1280-acik-kapi5 "Koşula göre sonuç" tablosu kabın dışına taşıyor. 320-acik-kapi5 ekranı 337 px genişliğinde. Yani sayfa yatay kayıyor. Bu, 320 kuralının açık ihlali.
7. **Süs amaçlı hero.** 1280-acik-ozet ekranında 370 px yüksekliğinde lacivert blok var. Sağdaki 260 px dairesel kadran 5 ile 8 arası sayıları gösteriyor. Bilgi değeri düşük. 320'de kadran tamamen gizleniyor. Bu, iş aracı değil tanıtım sayfası izlenimi veriyor.
8. **Yazı ölçeği sistemsiz.** 1280-acik-kanitlar ve 1280-acik-gecmis ekranlarında 40 px başlık altında 4 satır içerik var. Gövde boyutları 14, 15, 16 ve 18 px arasında geziyor. Dört farklı gri ton var. Kicker bazı ekranlarda büyük harf, bazılarında küçük harf.

## 3. Ekran ekran kusur listesi

### Ortak kabuk: yan menü ve üst şerit

1. Yan menü 288 px. Bu, 1280 genişliğin yüzde 22,5'i. Çok geniş.
2. Yan menüde "Geçti" etiketi 3. maddede kesiliyor ve "Geçt" oluyor. Bu hata bütün 1280 ekranlarında var.
3. Yan menüde 7 maddenin etiketi var. Menüde durum etiketi gürültü yapar.
4. Marka turuncusu şu yerlerde birden kullanılıyor: etkin menü maddesi, ana düğme, adım başlıkları, "Hepsi" bağlantısı, zaman çizelgesi noktaları ve "Kısaca" başlığı. Vurgu rengi anlamını kaybediyor.
5. Üst şeritte üç etiket üç ayrı tonda duruyor: gri "Sürüm 4", sarı "Örnek plan" ve yeşil "Kaydedildi". Ekmek kırıntısı yok. Kullanıcı hangi karar ve hangi adımda olduğunu üst şeritten göremiyor.
6. Sol üst logo kutusu lacivert, menü etkin durumu şeftali, hero lacivert. Lacivert yalnız iki yerde var. Palet oturmamış.

### Planlar

7. 1280-acik-planlar: üç düğme aynı boy ve aynı satırda. "Yeni plan" ile "JSON içe al" eşit ağırlıkta görünüyor.
8. 1280-acik-planlar: tek plan kartı 300 px. Satırın üçte ikisi boş. Boş alan tasarlanmamış.
9. 1280-acik-planlar: kart başlığının yanında kırmızı çöp kutusu ikonu var. Silme işlemi birincil görünür hale gelmiş.
10. 1280-acik-planlar: mavi bilgi kutusu paletin dışında. Mavi, başka hiçbir yerde yok.
11. 320-acik-planlar: üç düğme alt alta ve farklı genişlikte. Sol kenar hizalı ama sağ kenarlar düzensiz. Kart "Örnek: Mahalle kafesi" başlığı iki satıra bölünüyor.

### Plan özeti

12. 1280-acik-ozet: hero 370 px yüksek. İçinde iki düğme ve üç küçük sayı var. Alan boşa gidiyor.
13. 1280-acik-ozet: dört istatistik kartında dört ayrı renkte ikon kutusu var: turuncu, yeşil, mor ve mavi. Gökkuşağı ikon kalıbı.
14. 1280-acik-ozet: rota listesinde her satırda 40 px daire, iki etiket ve ok ikonu var. Satır başına dört görsel öğe. Göz nereye bakacağını bilmiyor.
15. 1280-acik-ozet: "Son kararlar" kartının içinde üç gri kart daha var. Kart içinde kart.
16. 1280-acik-ozet: "En kısa yol" anahtarı iki KPI satırı arasında gri bir şeritte tek başına duruyor. Yetim kontrol.
17. 320-acik-ozet: sayfa 3.900 px uzunluğunda. Bu, 5,4 ekran demek. Dört istatistik kartı alt alta 180 px yükseklikte. Dört sayı için 720 px kaydırma gerekiyor.
18. 320-acik-ozet: ilk ekranın yüzde 55'i hero. Kadran gizlenmiş. İlk ekranda bir tane anlamlı sayı bile yok.

### Karar 1

19. 1280-acik-karar1: adım başlıkları turuncu. Bağlantı gibi görünüyor ama bağlantı değil.
20. 1280-acik-karar1: etiketler üç renkte: mavi "Zorunlu", gri "Bu profilde gerekmez", yeşil "Tamam". Gereklilik ile durum aynı bileşenle gösteriliyor.
21. 1280-acik-karar1: yeşil "İlerle" durum rozeti ana düğmenin hemen yanında ve aynı boyda. Durum ile eylem karışıyor.
22. 1280-acik-karar1: dört gri KPI kutusu özet ekranından aynen tekrarlanıyor. Aynı dört sayı kapı ekranında da var. Her ekranda aynı kutular gürültü yapıyor.
23. 1280-acik-karar1: "Kapı 1: Araştırmaya yetki var mı?" düğmesi sol altta yalnız duruyor. Ana eylem mi, bağlantı mı, belli değil.
24. 1280-acik-karar1: "Bu kararda ne var?" kartının sağ üstünde etiketsiz bir ikon düğmesi var. Ne yaptığı anlaşılmıyor.
25. 320-acik-karar1: adım başlıkları üç satıra bölünüyor. Başlık, iki etiket ve açıklama alt alta geliyor. Bir adım 130 px yer kaplıyor.

### Adım 11

26. 1280-acik-adim11: dört işlem düğmesi sol altta iki satır halinde yüzüyor. Tablonun "Kahve arabası" satırı düğmelerin altında kalıyor.
27. 1280-acik-adim11: tablo hücrelerinde kenarlıklı giriş kutuları var. Tablo başlığı da gri. Çift çerçeve etkisi.
28. 1280-acik-adim11: tablo sağda "İlk adım ve be…" diye kesiliyor. Kaydırma çubuğu yok.
29. 1280-acik-adim11: sağdaki "Nasıl yapılır?" kartı ile ana içerik kartı aynı stilde. Yardım ile iş ayrılmıyor.
30. 320-acik-adim11: ilk ekranda yalnız yardım metni görünüyor. Asıl form aşağıda. Dört düğme ekranın yüzde 40'ını kaplıyor. "Bu adımı atla" turuncu çerçeveli ve ana düğmeyle yarışıyor.

### Kapı 5

31. 1280-acik-kapi5: "Koşula göre sonuç" tablosu kabın dışına taşıyor. "Yüksek satış beklentisi bu engeli kaldırr" diye kesiliyor.
32. 1280-acik-kapi5: ölçüt satırları beyaz kart içinde gri hap biçiminde. Sonuç seçenekleri 60 px yüksekliğinde altı gri kutu. Toplam 400 px.
33. 1280-acik-kapi5: "Sistemin önerisi" şeftali kutu içinde gri hap var. Kutu içinde kutu içinde kutu.
34. 1280-acik-kapi5: altı sonuç etiketi altı renkte: kırmızı, gri, yeşil, mor, yeşil çerçeve ve mavi. Durum renk sistemi yok.
35. 1280-acik-kapi5: iki metin alanında tarayıcının varsayılan boyutlandırma tutamağı görünüyor. Kütüphane varsayılanı tasarım değil.
36. 1280-acik-kapi5: üst kicker "Karar 5. Kaynak ve strateji" küçük harf ve 13 px. Diğer ekranlarda kicker büyük harf. Tutarsız.
37. 320-acik-kapi5: sayfa 337 px genişliğinde. Yatay kaydırma var. "Koşula göre so…" başlığı kesiliyor. Tabloda yalnız "Durum" sütunu görünüyor. Sonuç ve not sütunları görünmüyor.

### Göstergeler

38. 1280-acik-gostergeler: KPI kartlarında "Ölçüm bekleniyor" ve "Harcama yazılmadı" cümleleri 28 px kalın sayı stilinde yazılmış. Cümle, sayı gibi gösteriliyor.
39. 1280-acik-gostergeler: çubuklar taralı ve noktalı desenli. Çubuk 44 px, boşluk 60 px. Eksen etiketleri 1'den 8'e sayı. Karar adları yok.
40. 1280-acik-gostergeler: gösterge seçimi 480 px genişlikte tek başına duruyor. Grafik kartı 420 px yükseklikte 8 çubuk için.
41. 1280-koyu-gostergeler: açıklama yazısı koyu gri üstünde açık gri. Kontrast düşük. "Kalan" çubukları koyu üstünde koyu nokta. Neredeyse görünmüyor.

### Kanıtlar

42. 1280-acik-kanitlar: 40 px başlık altında 4 satırlık tablo var. Başlık, içeriğe göre fazla büyük.
43. 1280-acik-kanitlar: tablo "Kaynak" sütununda kesiliyor. Kaydırma çubuğu yok. Her satırda ataş ikonu var. İkon bilgi vermiyor.
44. 1280-acik-kanitlar: filtre seçimi etiketsiz ve ana düğmenin hemen yanında.
45. 320-acik-kanitlar: tabloda tek sütun görünüyor. Metin kelime ortasından kesiliyor: "Mahallede sabah 9'dan önce a". Üçüncü satırda gri hover durumu takılı kalmış.

### Çıktılar

46. 1280-acik-ciktilar: belgenin üstünde 8 kontrol var: iki sekme düğmesi, sürüm seçimi, ad girişi, sabitle, yazdır, Markdown ve JSON. Araç çubuğu düzeni yok.
47. 1280-acik-ciktilar: belge 760 px genişlikte sola yaslı. Sağda 380 px boşluk var.
48. 1280-acik-ciktilar: rapor tabloları sağda kesiliyor: "Sabah 6.30 ile 9 arası yü". Rapor içinde "Ölçü tanımlanmadı" üç kez alt alta yazılıyor.
49. 1280-acik-ciktilar: en altta "Yayımlanan sürümler" kartı boş. Boş durum tasarlanmamış.
50. 320-acik-ciktilar: sayfa 3.480 px. Rapor tabloları "Sonuç" sütunundan sonra kesiliyor.

### Karar Kitabı

51. 1280-acik-yontemler: her kartın içinde 130 px şeftali "Kısaca" kutusu var. İki kartta aynı kutu yan yana. Sayfa pembe görünüyor.
52. 1280-acik-yontemler: "Yöntem ara" ve "Bölüm seçin" etiketleri 16 px kalın. Kütüphane sayfası form gibi görünüyor.
53. 320-acik-yontemler: "Zaman ve Önceliklendirme" başlığı 28 px ve iki satıra bölünüyor. "5 yöntem" sayısı kendi satırına düşüyor.

### Geçmiş

54. 1280-acik-gecmis: zaman çizelgesi, "Değişiklik kaydı" ve "Sürümler" üç ayrı kart. "Sürümler" kartı çizelgedeki aynı dört tarihi madde listesi olarak tekrar ediyor.
55. 1280-acik-gecmis: "Değişiklik kaydı" kartı tek satır metin için 90 px yer kaplıyor.

### Koyu tema

56. Yan menü, sayfa zemini ve kartlar üç yakın koyu gri. Aralarındaki parlaklık farkı yüzde 3 ile 5 arası. Yüzeyler ayrılmıyor.
57. Etkin menü maddesi ve "Kısaca" kutuları kahverengi. Turuncu ile koyu grinin karışımı çamur rengi veriyor. 1280-koyu-karar1 ve 1280-koyu-yontemler ekranlarında belirgin.
58. Ana düğme koyu temada soluk somon ve koyu yazılı. Açık temadaki koyu kiremit ağırlığını kaybediyor. 1280-koyu-planlar ekranında görülüyor.
59. Hero bloğu mavi-yeşil lacivert. Çevresi nötr gri. İki ayrı koyu ton yan yana duruyor. 1280-koyu-ozet.
60. Sağ üstteki tema düğmesi aydınlık kare kutu içinde. Sayfadaki tek yükseltilmiş yüzey o. Dikkati boşa çekiyor.
61. "Örnek plan" sarı etiketi kahverengi zemin üstünde. Kontrast düşük.
62. Grafik açıklama metni ve eksen sayıları koyu gri üstünde orta gri. 4,5:1 oranını karşılamıyor gibi görünüyor. Ölçümle doğrulanmalı.

## 4. Enterprise hissi için 12 somut tasarım önerisi

1. **Yazı ölçeği.** Sayfa başlığı 28 px ve 600 ağırlık. Bölüm başlığı 20 px ve 600. Alt başlık 16 px ve 600. Gövde 15 px ve 400, satır yüksekliği 1,5. Yardımcı metin 14 px. Kicker 13 px büyük harf ve 0,08 em harf aralığı. Yalnız iki ağırlık kullanın: 400 ve 600. Başlık ile gövde oranı 1,87 olsun.

   Not: kicker 13 px, 14 px kuralını bozar. Bu yüzden kicker 14 px büyük harf ve 0,08 em olsun.

2. **Sayfa üst şeridi.** 56 px yükseklikte tek şerit. Solda ekmek kırıntısı: "Plan › Karar 3 › Adım 11", 14 px. Sağda en çok iki durum etiketi ve tema düğmesi. Altında başlık satırı: başlık solda, işlemler sağda, aynı satırda. Başlık satırı altında 24 px boşluk. İkon kutulu kicker kaldırılsın.

3. **Yan menü yoğunluğu.** Genişlik 240 px. Madde yüksekliği 36 px. Madde yazısı 14 px. Bölüm etiketi 14 px büyük harf gri. Her maddedeki etiket yerine 8 px durum noktası ve sağa yaslı 14 px sayı. Etkin durum: sol kenarda 3 px düz çizgi ve yüzde 6 ton. Etkin maddenin köşeleri düz olsun. Turuncu yalnız burada ve ana düğmede.

4. **Kart yerine bölümleme.** Bir sayfa yüzeyi: içerik beyaz, zemin açık bej. Bölümler 32 px dikey boşluk, 1 px ince çizgi ve bölüm başlığıyla ayrılsın. Kart yalnız tıklanabilir ve seçilebilir nesneler için kullanılsın. Örnek: plan kartı ve sonuç seçeneği. Kart içinde kart yasak. Tek köşe yarıçapı: 8 px. Giriş ve etiket 6 px.

5. **KPI şeridi.** Tek satır, dört sayı, kutu yok. Etiket 14 px büyük harf gri. Değer 24 px ve 600, eşit genişlikli rakam. Alt not 14 px. Sayılar arasında 1 px dikey çizgi. Şerit yüksekliği 72 px. Şerit yalnız özette dursun. Karar ekranlarında aynı dört sayı tek satır 14 px özet olsun.

6. **Tablo.** Başlık satırı 36 px ve 14 px büyük harf. Veri satırı 44 px ve 15 px. Satırlar arasında 1 px ince çizgi. Zebra yok. İlk sütun sabit. Yatay kaydırma kabın içinde kalsın. Kaydırma çubuğu görünür olsun. Sağ kenarda 24 px solma olsun. En az sütun genişliği: Kanıt 280 px, Tür 96 px, Tarih 120 px. Sayfa hiçbir genişlikte yatay kaymasın.

7. **Düğme hiyerarşisi.** Ekranda bir ana düğme. Ana düğme dolu, 40 px yüksek, 15 px ve 600. İkincil düğme gri çerçeve. Turuncu çerçeve yasak. Üçüncül düğme yalnız metin. Silme ikonu yalnız taşma menüsünde. İşlem grubu en çok üç düğme. Grup sağa yaslı. Adım ekranında 64 px yapışkan alt şerit ve üstte 1 px çizgi olsun. Yüzen düğme olmasın.

8. **Durum rengi sistemi.** Her durum için tek renk. "Geçti" ve "İlerle" yeşil. "Açık" turuncu. "Kilitli" gri. "Durdur" kırmızı. "Beklet" sarı. "Zorunlu" ve "Koşullu" gereklilik bildirir, durum değildir. Bunlar gri çerçeveli nötr etiket olsun. Etiket 24 px yüksek, 14 px ve 500, köşe 4 px. Bir satırda en çok bir renkli etiket ve bir nötr etiket.

9. **Tek uyarı bileşeni.** Beş renkli kutu kaldırılsın. Tek nötr bilgi bloğu olsun. Solda 3 px düz çizgi. Çizginin değdiği köşeler düz. 16 px iç boşluk. Etiket 14 px ve 600. Gövde 15 px. İkon 16 px. Yalnız bilgi, uyarı ve tehlike için çizgi rengi değişsin. "Kısaca" ve "Günlük Hayattan" kutuları düz alt bölüm olsun. Başlık 16 px ve 600, altında metin.

10. **Grafik.** Çubuk 24 px, aralık 16 px. Tarama ve nokta deseni yok. Tamamlanan koyu mürekkep rengi. Kalan açık gri. Eksen yazıları 14 px gri. Izgara çizgisi 1 px açık gri, yalnız tam sayılarda. Kategori adı karar adı olsun: "Yetki", "Sorun". Grafik yüksekliği 240 px. Açıklama 14 px ve 10 px kare örnek. Çubuğun üstünde değer yazsın.

11. **Hero.** Masaüstünde 200 px, telefonda 160 px yüksek. İki sütun, 60 ve 40. Kadran kaldırılsın ya da 96 px ilerleme halkası olsun. Halkanın içinde "5 / 8" yazsın. Koyu zemin yalnız burada olsun. 320'de ilk ekranda şunlar görünsün: başlık, açık karar adı, bir ana düğme ve KPI satırı.

12. **Boşluk ve yoğunluk ölçeği.** 4 px taban. Tokenlar 4, 8, 12, 16, 24, 32 ve 48. Bölüm arası 32 px. Blok arası 16 px. Satır içi 8 px. İçerik en çok 1.120 px. 1024 px ve üstünde 8 ile 4 sütunlu ızgara. Kart iç boşluğu 20 px. Telefon kenar boşluğu 16 px. 320'de istatistik kartı 56 px yüksek satır olsun.

Ek öneri, koyu tema: zemin, yüzey ve yükseltilmiş yüzey arasında en az yüzde 6 parlaklık farkı. İnce çizgi rengi ayrı token. Birincil metin açık gri, ikincil metin 4,5:1 oranını sağlasın. Ana düğme koyu temada da doygun kiremit ve beyaz yazı kalsın. Kahverengi ton yerine turuncunun yüzde 12 saydam katmanı kullanılsın.

Ek öneri, ikon: satır içi 16 px, menüde 20 px, çizgi 1,5 px, tek gri ton. Renkli ikon kutusu yok.

## 5. Kabul ölçütleri

Her ölçüt ölçülebilir bir testtir. Test geçmezse öneri uygulanmış sayılmaz.

1. Her ekranda h1 hesaplanmış boyutu 28 px ve ağırlığı 600. h2 20 px. Gövde 15 px. Kicker 14 px büyük harf ve 0,08 em. Ekranda 400 ve 600 dışında ağırlık yok.
2. Hiçbir okunabilir metin 14 px altında değil. 320, 360, 375, 390 ve 1280 genişliklerde ölçülür.
3. Üst şerit 56 px. İçinde ekmek kırıntısı var. Sağda en çok iki durum etiketi var. Her içerik ekranında bu şerit aynı.
4. Yan menü 240 px. Madde 36 px. Menüde hiçbir etiket kesilmiyor. "Geçti" metni tam görünüyor. Menüde etiket sayısı sıfır. Durum noktası ve sayı var.
5. Etkin menü maddesinin sol kenarında 3 px düz çizgi var. Çizginin değdiği köşelerin yarıçapı 0.
6. Hiçbir kartın içinde başka kart yok. DOM derinliğinde kart iç içe sayısı en çok 1.
7. Sayfada tek köşe yarıçapı tokenı: 8 px. Giriş ve etiket 6 px. Başka değer yok.
8. KPI şeridi yalnız özette görünür. Karar ve kapı ekranlarında dört gri kutu yok.
9. Her tablo başlık satırı 36 px, veri satırı 44 px. Tablo kendi kabında yatay kayar. 320, 360, 375 ve 390'da belge genişliği viewport genişliğine eşit. 320-kapi5 ekranı 320 px genişliğinde render edilir, 337 değil.
10. Tabloda hiçbir hücre kelime ortasından kesilmez. "Kanıt" sütunu en az 280 px.
11. Bir ekranda dolu renkli düğme sayısı en çok 1. Turuncu çerçeveli düğme sayısı 0.
12. İşlem grubu en çok 3 düğme. Adım ekranında düğmeler 64 px alt şeritte. Hiçbir düğme içerik satırını örtmüyor.
13. Her durum değeri tek renkle eşlenir. "Geçti" her ekranda aynı yeşil. "Zorunlu" ve "Koşullu" gri çerçeveli. Bir satırda renkli etiket sayısı en çok 1.
14. Sayfada renkli dolgulu bilgi kutusu sayısı 0. Bilgi bloğu sol 3 px çizgi ve düz köşeyle gösterilir. Çizgi rengi en çok 3 çeşit: bilgi, uyarı, tehlike.
15. Grafikte çubuk 24 px, aralık 16 px. Desen yok. Eksen yazısı 14 px. Kategori adı metin, sayı değil. Koyu temada açıklama ve eksen kontrastı en az 4,5:1.
16. Özet hero 1280'de 200 px, 320'de 160 px. 320'de ilk 720 px içinde şunlar var: h1, açık karar adı, ana düğme ve en az bir KPI satırı. Yani en az 2 anlamlı içerik bloğu.
17. 320'de özet sayfası en çok 2.400 px uzun. Şu an 3.900 px.
18. Bölüm arası boşluk 32 px. Blok arası 16 px. Kart iç boşluğu 20 px. Telefon kenar boşluğu 16 px. Ölçümler hesaplanmış stil ile doğrulanır.
19. Koyu temada zemin, yüzey ve yükseltilmiş yüzey parlaklık farkı en az yüzde 6. İkincil metin kontrastı en az 4,5:1. Ana düğme beyaz yazı ve doygun kiremit. Kahverengi ton tokenı yok.
20. İkonlar 16 px satır içi, 20 px menü. Renkli ikon kutusu sayısı 0.
21. Metin alanlarında tarayıcı varsayılan tutamağı görünmüyor. Odakta çevreleyen halka yok.
22. Boş durumlar tasarlanmış: "Yayımlanan sürümler" ve "Değişiklik kaydı" boşken açıklama ve bir eylem gösterir. Boş kart yok.
23. Rapor ekranında kontrol sayısı belge üstünde en çok 4 görünür. Kalanı taşma menüsünde.
24. Chromium ve WebKit'te 320, 390 ve 1280 görüntü regresyon testleri bu ölçütleri kontrol eder. Firefox testi kullanıcı isteği olmadan çalıştırılmaz.

## Denetim notu

Bu metin tasarım terimleri içerir. Terimler ilk geçtiği yerde açıklanmıştır ya da piksel değerleriyle verilmiştir. Gerçek okurla denenmedi.
