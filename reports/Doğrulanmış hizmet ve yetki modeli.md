# Hizmeti ortakla sürdürün, Frappe varsayılanlarını kapatın

Bu raporu Claude 16 Kasım 2026 Pazartesi günü yazdı. Rapor Karar Atlası için yazıldı. Karar Atlası, Türkiye çıkışlı bir strateji planlama yazılımıdır.

Rapor üç soruya cevap verir:

1. Yazılım tek başına yeter mi? Yanına hangi hizmet, ortaklık ve sertifika gelmeli?
2. Hangi roller hangi sıklıkla çalışmalı?
3. Yetki Frappe 16 üzerinde tam olarak nasıl kurulmalı?

Bu rapor bütün kaynakları ikinci kez okudu. Kaynaklar tam metinden okundu. Frappe 16 kodu satır satır okundu. Tam okunamayan bilgi rapordan çıkarıldı. Yerine doğrulanmış en yakın bilgi yazıldı.

## Kısa cevap

**Yazılım tek başına yetmez.** En güçlü kanıt Hindistan'da kurayla yapılan bir danışmanlık denemesidir. Yardım alan fabrikaların yönetim puanı 0,25'ten 0,60'a çıktı. Sekiz yıl sonra puan 0,46'ya indi. Yani kazancın yüzde 40'ı kayboldu ([AEJ Applied 2020](https://www.aeaweb.org/doi/10.1257/app.20180369), s. 205). Bu fabrikalarda bırakılan uygulamaların yarısından fazlası yeni müdürle bırakıldı. İkinci neden, yöneticilerin zaman ayıramamasıydı.

**Danışmanlığın etkisi kalıcı olabilir.** Meksika'da 432 küçük ve orta şirketle kurayla bir deneme yapıldı. Sonraki beş yılda çalışan sayısı ortalama yüzde 57 yüksekti. Ücret toplamı yüzde 72 yüksekti ([JPE 2018](https://dspace.mit.edu/handle/1721.1/121090), s. 658).

**Hizmet üç parçalı olmalı:**

1. Tek kararlı ve ücretli bir pilot
2. Pilottan sonra üç ayda bir ortak gözden geçirmesi
3. Karar sahibi değişince ortağın müşteriyi araması

Üçüncü parça en güçlü kanıta dayanır. Hindistan denemesinde bırakmanın en büyük nedeni yönetici değişimiydi.

**Toplantıları iş ortakları yürütmeli.** Büyük yazılım şirketlerinde bile hizmet işi zarar edebilir. Workday'in hizmet işi son mali yılda yaklaşık yüzde 9,9 zarar etti. Aynı yıl abonelik işinin brüt kârı yaklaşık yüzde 82,7 oldu ([Workday 10-K](https://www.sec.gov/Archives/edgar/data/1327811/000132781126000014/wday-20260131.htm)).

**Ortaklar iki düzeyli sertifika alır.** Bu yapı IAF'nin 2026'daki yeni yoluna benzer. IAF önce 500 dolarlık bir belge ister. Sonra 2.000 dolarlık canlı değerlendirme yapar ([IAF ücret listesi](https://iaf-world.org/pd-fees-list-and-policy-20260312/)).

**Kamu desteği pilotu ancak dolaylı yoldan karşılar.** KOSGEB YÖNDE desteği hizmet başına en çok 20.000 TL'dir. Bu destekte strateji danışmanlığı satırı yoktur. Kapasite Geliştirme programı kredi vermez. Bu program banka kredisinin faizine 20 puan destek verir. Kalkınma ajansları danışmanlığı kendileri satın alır. OKA'da sınır 400.000 TL, FKA'da 450.000 TL'dir.

**Dört rol düzenli çalışmalı.** Karar sahibi her hafta inceleme kuyruğuna bakar. Karar sahibi her ay uygulama kararını kaydeder. Ekip üyesi her hafta gözlem girer. Stratej hazırlık boyunca her hafta yazar. Ortak üç ayda bir gözden geçirmeyi yürütür.

**Yetkiyi tek bir sunucu işlevi verir.** Frappe 16 kodu beş yeni kural gerektirir:

1. MCP ucu Frappe 16.53.0 sürümünden beri varsayılan olarak açıktır. Kurulum bu ucu kapatmalı. Her yayından önce bir test 404 cevabını görmeli.
2. Liste koşulu boş dönerse kişi bütün tabloyu görür. Üye olmayan kişiye her zaman yanlış olan bir koşul dönülmeli.
3. Frappe belgesi kanca argümanına `permission_type` der. Kod ise `ptype` gönderir. Kanca `ptype` adını kullanmalı.
4. Frappe iş akışında kendi kaydını onaylamak varsayılan olarak serbesttir. Görev ayrılığını yetki işlevi uygulamalı.
5. "Administrator" hesabı bütün kancaları atlar. Bu hesap günlük işte kullanılmamalı.

**Tek kurucu için danışman genel şart değildir.** İkinci kişi yalnız bağımsız inceleme isteyen işte gerekir. Örneğin sınır artışında.

## Bu raporu nasıl okursunuz?

### Bilginin dört türü

| İşaret | Anlamı |
|---|---|
| **Kanıt** | Kaynağı olan bilgi. Kaynak tam okundu. |
| **Çıkarım** | Bizim yorumumuz. Kaynak bunu doğrudan söylemez. |
| **(hipotez)** | Pilotta sınanacak bir sayı ya da kural |
| **(satıcı)** | Kaynak, anlattığı ürünü ya da eğitimi satar. Bağımsız araştırma sayılmaz. |

### Kaynaklar nasıl okundu?

1. Makaleler ve resmî kılavuzlar tam metinden okundu. Sayfa numaraları yazıldı.
2. Frappe kodu `version-16` dalından okundu. Okunan sürüm `v16.56.0` etiketidir.
3. Etiketin kod kaydı `49789a1711d4dde2be9c6888efe35651465f4b64`'tür. Bu kayıt 10 Kasım 2026 Salı günü yapıldı.
4. Bütün Frappe bağlantıları bu kayda gider. Kod sonra değişse de bağlantı aynı satırı gösterir.
5. Frappe kodu okundu ama çalıştırılmadı. Bu rapordaki testler geliştirmenin 4. adımında gerçek kurulumda çalışır.

### Ürünün sabit kuralları

1. Stratej yolu önerir ve gerekçesini kurar. Karar sahibi seçer ve kaydeder.
2. Bir planda aynı anda tek karar sahibi olur.
3. Kararlar yalnız sunucuda kesinleşir.
4. Yapay zekânın karar kayıt türlerinde yazma izni yoktur.
5. Yazılım çalışanı puanlamaz.

Stratej, stratejiyi geliştiren kişinin unvanıdır. Bu bir yazım hatası değildir.

### Ürünün bugünkü durumu

Canlı sürüm yalnız tarayıcıda çalışır. Sunucu sürümü tasarlandı ama yazılmadı. Yapay zekâ özelliği bugün üründe yoktur. Bu yüzden rapordaki yetki kuralları bir tasarımdır.

### Belge haritasındaki yeri

Bu rapor belge haritasında 4. çekmeceye girer. Çekmecenin adı "Teknik mimari"dir. Önerilen durum "Tek kaynak"tır. "Derin hizmet ve yetki modeli" raporunun durumu "Tarihsel" olur. Belge haritası bu iş sırasında değiştirilmedi.

### Terimler

| Terim | Anlamı |
|---|---|
| KOBİ | Küçük ve orta ölçekli işletme |
| Kurayla yapılan deneme | Şirketlerin kurayla iki gruba ayrıldığı araştırma. Yalnız bir grup yardım alır. |
| Pilot | Tek bir gerçek kararla yapılan sınırlı ve ücretli deneme |
| İş ortağı | Ürünü müşterisine öneren ve toplantıları yürüten bağımsız danışman |
| Müşteri başarı sorumlusu | Müşterinin ürünü kullanmasını izleyen satıcı çalışanı |
| Brüt kâr | Gelirden doğrudan maliyet düşülünce kalan pay |
| RBAC | Role dayalı yetki. İzin kişinin rolüne göre verilir. |
| ABAC | Özelliğe dayalı yetki. İzin kişinin, kaydın ve ortamın özelliğine göre verilir. |
| ReBAC | İlişkiye dayalı yetki. İzin kişi ile kayıt arasındaki ilişkiye göre verilir. |
| RACI | Her işte kimin ne yaptığını dört harfle gösteren tablo |
| Frappe | Ürünün arka yüzünü kuran hazır yazılım çatısı |
| Kayıt türü | Frappe'de bir kayıt çeşidi. Frappe'deki adı DocType'tır. |
| Kanca | Frappe'nin uygulamaya bıraktığı denetim yeri. Uygulama buraya kendi işlevini bağlar. |
| Kayıt denetimi | Tek bir kayıt açılırken çalışan kanca. Frappe'deki adı `has_permission`'dır. |
| Liste koşulu | Liste sorgusuna eklenen süzgeç. Frappe'deki adı `permission_query_conditions`'dır. |
| Belge paylaşımı | Tek bir kaydı bir kişiye açan satır. Frappe'deki adı DocShare'dir. |
| Yetki işlevi | Bütün yetki kararlarını veren tek sunucu işlevi. Bu rapordaki adı `yetki_ver`'dir. |
| Varsayılan ret | Hiçbir kural izin vermiyorsa cevabın "hayır" olması |
| MCP | Yapay zekâ araçlarının bir sunucuyu çağırdığı bağlantı yolu |
| Sürüm yükseltme | Frappe'nin yeni sürümünü siteye uygulama işi. Frappe'deki komutu `migrate`'tir. |
| Görev ayrılığı | Aynı kişinin hem işi yapıp hem onaylamasını engelleyen kural |

## 1. Danışmanlığın etkisi kalıyor ama yönetici değişince azalıyor

### Hindistan denemesi: kazancın yüzde 40'ı sekiz yılda kayboldu

**Kanıt.** Mumbai yakınında 17 aile şirketinin 28 fabrikasında bir deneme yapıldı. Bazı fabrikalar yoğun ve ücretsiz yönetim danışmanlığı aldı. Fabrikalar kurayla seçildi. Araştırmacılar Ocak 2017'de aynı fabrikalara geri döndü ([AEJ Applied 2020](https://www.aeaweb.org/doi/10.1257/app.20180369), s. 199-205).

| Ölçü | Değer | Yer |
|---|---|---|
| Yardımdan önce yönetim puanı | 0,25 | s. 205 |
| Yardımın sonunda, 2011 | 0,60 | s. 205 |
| Sekiz yıl sonra, 2017 | 0,46 | s. 205 |
| Kaybolan kazanç | Yüzde 40 | s. 205 |
| Yardım alanla almayan arasındaki fark, 2011 | 20,6 yüzde puan | s. 205-206 |
| Aynı fark, 2017 | 19,7 yüzde puan | s. 205-206 |
| Sekiz yıl sonra iş gücü verimi | Yaklaşık yüzde 35 yüksek | s. 200 |

Makalenin özeti bir şey daha söyler. Yardım alan fabrikalar uygulamaların yaklaşık yarısını bıraktı (s. 198). İki ölçü birbirini tutar. Biri uygulama sayısını, öteki puanı ölçer.

**Kanıt.** Makalenin 3. tablosu bırakma nedenlerini sayar (s. 210). Sayılar uygulama ve fabrika hücrelerinin yüzdesidir.

| Grup | Bırakılan toplam | Yeni fabrika müdürü | Yöneticinin zamanı yok | "İşe yaramıyor" düşüncesi |
|---|---|---|---|---|
| Yardım alan deneme fabrikaları | Yüzde 16,7 | 9,9 puan | 3,9 puan | 2,9 puan |
| Bütün fabrikalar | Yüzde 12,4 | 4,6 puan | 3,6 puan | 4,2 puan |

Yardım alan fabrikalarda bırakmanın yarısından fazlası yeni müdürle geldi. Bütün fabrikalarda da sıralama aynıdır. Önce yeni müdür gelir. Sonra "işe yaramıyor" düşüncesi gelir. Sonra zaman eksikliği gelir.

**Kanıt.** Uygulamalar şirketin kendi fabrikaları arasında yayıldı. Şirketler arasında nadiren yayıldı. Yardım alan şirketler sonra kendi parasıyla danışmanlık da aldı (s. 200).

**Çıkarım.** Karar Atlası'nda iki kırılma noktası vardır:

1. Karar sahibinin değişmesi
2. Karar sahibinin zaman bulamaması

Hizmet modeli bu iki noktayı hedefler.

### Meksika denemesi: strateji kurmaya yardım beş yıl sonra da etkili

**Kanıt.** Puebla'da 432 KOBİ başvurdu. Kurayla 150 şirkete danışmanlık önerildi. Bunların 80'i kabul etti. Danışmanlık Mart 2008 ile Şubat 2009 arasında sürdü. Her şirket haftada 4 saat aldı ([JPE 2018](https://dspace.mit.edu/handle/1721.1/121090), s. 641-642).

| Konu | Bulgu | Yer |
|---|---|---|
| Tam maliyet | Saatte yaklaşık 57 dolar. Şirket başına yılda 11.856 dolar. | s. 641-642 |
| Şirketin ödediği pay | Mikro şirket yüzde 10, küçük şirket yüzde 20, orta şirket yaklaşık yüzde 30 | s. 641-642 |
| Sonraki beş yılda çalışan sayısı | Ortalama yüzde 57 yüksek. Veri sosyal güvenlik kayıtlarından. | s. 658 |
| Sonraki beş yılda günlük ücret toplamı | Ortalama yüzde 72 yüksek | s. 658 |
| En çok iyileşen alan | Pazarlama, mali kayıt ve uzun dönem iş planı | s. 638-639 |
| Danışmanın ana işi | Büyüme stratejisi ya da iş planı kurmak | s. 635 |
| Danışmanlık almayanların nedeni | Yüzde 46,3'ü "iyi yatırım ama param yok" dedi. | s. 668 |
| Destek bitince | Bir danışmanlık şirketinin 19 müşterisinin 13'ü ücretle devam etti. Öteki şirkette hiçbiri devam etmedi. | s. 669 |

Danışmanlar bir eksik de yazdı. Şirketlerde açık bir hedef ve yön tanımı yoktu (s. 635).

**Çıkarım.** Meksika denemesi Karar Atlası'nın işine çok yakındır. Danışman şirketin yönünü ve planını kurdu. Etki yıllar sonra da görüldü. Desteğin bitince ücretli devam etmesi de mümkündür. Ama bu, danışmanın niteliğine ve müşterinin büyüklüğüne bağlıdır.

**Çıkarım.** "Param yok" cevabı en sık cevaptır. Bu yüzden pilot küçük ve sabit fiyatlı olmalı. Kamu destek yolları da satışta anlatılmalı.

**Sınır.** İki deneme de "yalnız yazılım" ile "yazılım ve danışman" yollarını karşılaştırmadı. İki denemede de yardım yoğundu. Hindistan'da aylarca yerinde danışmanlık vardı. Meksika'da yılda 208 saat vardı. 8 haftalık pilot bundan hafiftir.

### OKR vaka çalışması: haftalık kontrol var, 15 dakika bilgisi literatürden

**Kanıt.** 2025'te hakemli bir dergide bir vaka çalışması yayımlandı ([Journal of Business Strategy 47(1)](https://www.emerald.com/jbs/article/47/1/52/1311605/Engaging-the-entire-organization-how-OKRs-enhance)). OKR, hedef ve ölçülebilir sonuç yöntemidir.

| Konu | Bulgu |
|---|---|
| Şirket | Avrupa'da büyük bir finans hizmetleri şirketi |
| Kapsam | 14 ürün ekibi, üç çeyreklik dönem. Pilot 2023'ün ilk çeyreğinde başladı. |
| Veri | 11 görüşme. Ortalama 40 dakika. |
| Görüşme zamanı | Pilotun 7. ve 8. haftası, Nisan 2023'ün ortası |
| Haftalık kontrol | Var olan haftalık ekip toplantısına eklendi. Süresi makalede yazmaz. |
| Destek | Ekiplerin içinde sertifikalı OKR uzmanları ve bir OKR sorumlusu. İlk aşamada dış danışman. |

"Yaklaşık 15 dakikalık haftalık kontrol" bilgisi vakaya ait değildir. Bu bilgi makalenin alıntıladığı genel kaynaklardan gelir. Görüşmeler dokuz ayın tamamını kapsamaz.

**Çıkarım.** Haftalık kontrol var olan bir toplantının içinde yapılmalı. Kontrolün 15 dakika sürmesi pilotta sınanacak bir hipotezdir.

### Üst yönetim desteği verisi satıcıdan geliyor

**Kanıt (satıcı).** Prosci değişim yönetimi eğitimi satar. Prosci'nin 11. araştırması 2020'de yayımlandı. Araştırmaya 1.863 kişi katıldı ([Prosci 11. araştırma özeti](https://www.prosci.com/hubfs/2.downloads/research-executive-summaries/11th%20Edition-Best-Practices-Executive-Summary-11-2020.pdf), s. 2 ve 7).

| Sponsorun etkisi | Hedefini tutan proje oranı |
|---|---|
| Çok etkisiz | Yüzde 29 |
| Etkisiz | Yüzde 39 |
| Orta etkili | Yüzde 57 |
| Çok etkili | Yüzde 73 |

Sponsor, işi üst yönetimde sahiplenen kişidir. Veri katılımcıların kendi beyanıdır. Prosci'nin 2023 tarihli 12. araştırmasına 2.668 kişi katıldı. Değişim yönetimi iyileştikçe hedefi tutma oranı artar. Oran yüzde 13'ten yüzde 88'e çıkar ([Prosci 12. araştırma özeti](https://prosci.com/hubfs/Website_English/2.downloads/webinars/EN-EUR%20Webinar/Best-Practices-in-Change-Management-12th-Edition-Executive-Summary.pdf), s. 2 ve 7).

**Çıkarım.** Karar Atlası'nda sponsorun karşılığı karar sahibidir. Karar sahibi görünür olmazsa plan durur.

### Aile şirketi yazılımın veremediği üç hizmeti ister

**Kanıt.** 601 KOBİ yöneticisiyle bir araştırma yapıldı. Dijital dönüşümü en çok kuşaklar arası gerilim yavaşlatıyor ([Forbes Türkiye, 4 Şubat 2026 Çarşamba günü](https://www.forbes.com.tr/dergi/kurucular-temkinli-ikinci-kusak-hizli-dijital-donusum-gerilim-yaratiyor)).

**Çıkarım.** Aile şirketi şu üç hizmeti ister:

1. Tarafsız bir kişi 2.4 "Seçim ve vazgeçiş" toplantısını yönetir. Karar sahibi bu toplantıda seçer.
2. Gerekirse tarafsız bir kişi ikinci görüş verir.
3. Bir kişi gözden geçirmeyi takvime koyar ve yürütür.

Tek karar sahibi kuralı bir satış gücüdür. Aynı kural kurucu kuşakta korku yaratabilir. Bu gerilimi odadaki bir insan yönetir. Yazılım bu gerilimi yönetemez.

### Ürün başarı koşullarını taşıyor, ama koşullar boş kalabilir

| Başarı koşulu | Üründeki karşılığı | Boş kalırsa ne olur? |
|---|---|---|
| Üst yönetimin görünür desteği | Planın tek karar sahibi | Kararlar kaydedilmez. Plan durur. |
| Düzenli kontrol | 3.5 "Seçim hâlâ doğru mu?" gözden geçirmesi | Hedef yazılır ve unutulur. |
| İşi yürüten ayrı bir kişi | Stratej | Plan strateji oluşturmaya geçemez. |
| Yönetici değişince süreklilik | "Karar sahibi atandı" olayı | Yeni karar sahibi düzeni bırakır. |

**Çıkarım.** Asıl risk eksik bir özellik değildir. Asıl risk, rollerin boş kalması ve ritmin ölmesidir. Hizmet modeli bu riski kapatmak için kurulur.

## 2. Hizmet modeli: pilot, üç aylık ortak toplantısı ve yönetici değişimi

### Benzer satıcılar insan desteğini ayrıca satıyor

| Satıcı | Hizmet biçimi | Kaynak |
|---|---|---|
| StrategyFrame, Almanya | Yaklaşık 100 orta ölçekli şirket kullanıyor. Kurucuya göre yüzde 40'ı yalnız aboneliği alıyor. Kalan yüzde 60 koçluğu da alıyor. Koçluk altı ay sürer. En çok iki çalıştay ve ayda en çok 3 gün içerir. | [The Innovator](https://theinnovator.news/?p=11868) (satıcı beyanı) |
| StrategyFrame fiyatı | Giriş fiyatı yılda 15.000 euro. Fiyat on kullanıcıyı kapsar. | [it-daily, 29 Temmuz 2025 Salı günü](https://www.it-daily.net/it-management/projekt-personal/ki-plattform-ersetzt-mckinsey-co-fuer-einen-bruchteil-der-kosten) (satıcı) |
| Cascade | Dört ortak türü var: strateji danışmanlığı, teknoloji sağlayıcı, eğitim kurumu ve bağımsız danışman. | [Cascade ortaklar](https://www.cascade.app/partners) (satıcı) |
| WorkBoard | OKR koç sertifikası 599 dolar. Eğitim iki günde toplam 7 saat. | [WorkBoard](https://learn.workboard.com/page/okr-coach-certification) (satıcı) |

**Çıkarım.** Karar Atlası'na en yakın örnek StrategyFrame'dir. Alıcıların çoğu insan desteği için ayrıca ödüyor. Bu oran kurucunun beyanıdır. Karar Atlası bu oranı kendi pilotlarında ölçmeli.

### Teklifin beş katmanı

| Katman | Kime? | Kim verir? | İçerik |
|---|---|---|---|
| Ürün aboneliği | Bütün müşteriler | Siz | Yazılım, gece güncellemeleri ve güvenlik |
| Pilot | İlk kez alan aile şirketi | Sertifikalı iş ortağı ya da siz | Tek kararlı pilot. Yaklaşık 8 hafta, 2 ile 5 ekip üyesi (hipotez). |
| Üç aylık ortak gözden geçirmesi | Pilotu bitiren müşteri | Sertifikalı iş ortağı | Her çeyrekte bir 3.5 toplantısı. Karar sahibi değişince ek görüşme. |
| İş ortağı programı | Strateji ve aile şirketi danışmanları, mali müşavirler | Siz eğitirsiniz. Ortak işi yürütür. | Sertifika, şablonlar ve ücretsiz çok müşterili danışman ekranı |
| Kendi kendine kullanım | Tek kurucu ve küçük ekip | Müşteri | Tarayıcı sürümü. İkinci kişi yalnız gereken işte eklenir. |

Fiyatlar "Derin gelir modeli analizi" raporundan gelir ([Derin gelir modeli analizi](<Derin gelir modeli analizi.md>), bölüm 4.5). Abonelik ayda 15.000 TL varsayılır. Pilot paketi 80.000 TL varsayılır. Bu tutar 2 aylık abonelik ile 50.000 TL kurulumdur. İki sayı da sınanmamış varsayımdır.

### Pilot başlamadan altı ölçüt sorulur

Codex bir kabul tablosu önerdi. Tablonun bir sütunu "Eksikse ne yapılır?" sorusunu cevaplar ([Codex aktarım listesi](<../research_notes/Codex belgelerinden alınanlar/codex_aktarim_listesi.md>), madde 4.4). Bu sütun bizim puanlı listemizde yoktu. Aşağıdaki tablo iki yaklaşımı birleştirir. Tablo bir tasarımdır (hipotez).

| No | Ölçüt | Soru | Eksikse ne yapılır? |
|---|---|---|---|
| 1 | Şirketin seçimi | Şirketin önünde gerçek bir seçim var mı? | Pilot başlamaz. Ortak kısa bir teşhis görüşmesi önerir. |
| 2 | Karar yetkisi | Kararı bu şirket mi veriyor? Karar sahibi yetkili mi? | Karar sahibi yazılı yetkiyi getirir. Örneğin yönetim kurulu kararı. Yetki gelmezse kapsam daralır. |
| 3 | Stratej rolündeki kişinin uygunluğu | İşi yürütecek ve çıkar çatışması olmayan bir kişi var mı? | Sertifikalı ortak stratej rolünü alır. |
| 4 | Güvenli itiraz | Ekip üyeleri itirazını açıkça söyleyebiliyor mu? | Tarafsız ortak 2.4 toplantısını yönetir. İkinci görüş kişinin kendi hesabıyla yazılır. |
| 5 | Kullanılabilir devir | Stratej rolündeki kişi hazırlık çıktısını kullanabilir mi? | Geçiş kararı "Koşullu" ya da "Dur" olur. Bu da geçerli bir pilot sonucudur. |
| 6 | Yazılımın katkısı | Yazılım bu karara bir şey katıyor mu? | Pilot yalnız danışmanlık olarak sürer ya da durur. Bu ödeme yazılım talebi sayılmaz. |

Tablo üç ayrı hüküm verir:

1. Şirket bu kararı planlayabilir mi?
2. Stratej bu işe uygun mu?
3. Yazılım değer katıyor mu?

Üç hüküm tek bir puanda birleştirilmez. Çünkü her hükmün eksikliği farklı bir iş ister.

### Pilot adım adım

1. Kurum yöneticisi kullanıcıları ekler.
2. Karar sahibi stratej rolündeki kişiyi, ekip üyelerini ve gerekirse danışmanı plana ekler.
3. Karar sahibi toplantı takvimini sözleşmeye yazar.
4. Stratej ve ekip, hazırlık adımlarını haftalık toplantılarda doldurur.
5. Karar sahibi devir raporunu okur ve geçiş kararını kaydeder.
6. Stratej yolları önerir ve gerekçesini kurar.
7. İş ortağı 2.4 seçim toplantısını yönetir.
8. Karar sahibi yolu seçer ve strateji belgesini onaylar.

Pilotun üç sabit çıktısı vardır:

1. Geçiş kararı
2. Strateje devir raporu
3. Onaylanmış strateji belgesi

Pilot 8. adımla biter. Yayılma şu üç işle başlar:

1. Karar sahibi ilk kaynak iznini açar.
2. Ekip ilk gözlemi girer.
3. Karar sahibi ilk gözden geçirme kaydını açar.

İlk gözden geçirme kaydı yayılmanın kanıtıdır.

**Pilotun süresi esnektir.** Codex iki durum gösterdi ([Codex aktarım listesi](<../research_notes/Codex belgelerinden alınanlar/codex_aktarim_listesi.md>), madde 7.2). Bankanın veri incelemesi pilotu uzatabilir. Tek bir ihracat kararı pilotu kısaltabilir. Bu yüzden pilotun teslimi takvime değil, geçiş kararına bağlanır.

**"Dur" da geçerli bir sonuçtur.** Ortağın ücreti "İlerle" kararına bağlanmaz. Gerekçeli bir "Dur" ya da "Kısıtlı çalış" kararı da teslim sayılır.

**Bağımlılık.** Çok kullanıcılı pilot sunucu sürümünü gerektirir. Bu sürüm hazır değilse tek cihazlı bir ön pilot yapılır. Ön pilotta stratej ve karar sahibi tarayıcı sürümünü birlikte kullanır. Ekip üyeleri ön pilotta yer almaz.

### Dört takvim birbirinden ayrı tutulur

Codex bir karışıklığı gösterdi ([Codex aktarım listesi](<../research_notes/Codex belgelerinden alınanlar/codex_aktarim_listesi.md>), madde 13.1). Dört tarih farklı işlerdir.

| Tarih | Ne olur? |
|---|---|
| Pilot sonu | Geçiş kararı ve strateji onayı kayıtlıdır. |
| İlk saha sonucu | İlk gözlemler hedefe karşı okunur. |
| Strateji gözden geçirmesi | Karar sahibi "Seçim hâlâ doğru mu?" sorusunu cevaplar. |
| Abonelik yenilemesi | Müşteri ödemeyi sürdürür ya da bırakır. |

Sözleşme yenileme tarihi stratejiyi değiştirme nedeni değildir. Strateji inceleme aralığı da koda sabit yazılmaz. Bu aralık karar sahibinin ayarıdır ([Geliştirme karar notları](../docs/gelistirme-karar-notlari.md), Not 4).

### Pilot bitince ritim üç ayda bir ortakla sürer

**Çıkarım.** Hindistan denemesi şunu gösterdi: yardım çekilince alışkanlık zayıflıyor. Bu yüzden insan desteği 8. haftada tamamen bitmemeli. Önerimiz şudur (hipotez):

1. İş ortağı her çeyrekte bir 3.5 toplantısını yürütür.
2. Karar sahibi bu toplantıda "Seçim hâlâ doğru mu?" sorusunu cevaplar ve kaydeder.
3. Karar sahibi değişirse iş ortağı müşteriyi arar.
4. Plan sağlığı işaretleri kötüleşirse iş ortağı müşteriyi arar.

Üç ay, ortak hizmeti için önerilen ritimdir. Ürünün inceleme aralığı ayarı bundan ayrıdır. Karar sahibi ayarı başka bir aralığa da çekebilir.

Bu toplantı ortağa her çeyrekte tekrar eden bir iş verir. Danışmanın "teslimden sonra gelir biter" korkusu böylece cevap bulur. Meksika'da da bir danışmanlık şirketi müşterilerinin çoğunu destek bitince tuttu.

### Karar sahibi değişince ortak müşteriyi arar

**Kanıt.** Hindistan denemesinde bırakmanın en büyük nedeni yeni fabrika müdürüydü. Yardım alan fabrikalarda bırakılan 16,7 puanın 9,9 puanı bu nedendendir ([AEJ Applied 2020](https://www.aeaweb.org/doi/10.1257/app.20180369), s. 210).

**Kural.** Ürün bu anı zaten kaydeder. Yeni karar sahibi atanınca eski atamanın bitişi aynı işlemde yazılır. Şu adımlar izlenir:

1. Sunucu "Karar sahibi atandı" olayını denetim kaydına yazar.
2. Plan sağlığı listesi bu planı işaretler.
3. Müşteri başarı sorumlunuz haftalık listede planı görür.
4. Müşteri başarı sorumlunuz planın iş ortağına haber verir.
5. İş ortağı yeni karar sahibiyle bir tanışma görüşmesi yapar.
6. İş ortağı görüşmede sonraki 3.5 tarihini yeni karar sahibiyle doğrular.

Görüşmenin kaç gün içinde yapılacağı pilotta belirlenir (hipotez).

### Karar sahibi ayrılırsa yeni atamayı kim yapar?

Depoda bu durum tanımlı değil. Önerimiz şudur:

1. Giden karar sahibi ulaşılabilirse atamayı kendisi yapar.
2. Ulaşılamazsa kurum yöneticisi bir atama isteği açar.
3. Bu isteğe şirketin yazılı kararı eklenir. Örneğin yönetim kurulu kararı.
4. Atama denetim kaydına yazılır.
5. Kurum yöneticisi bu işle plan içeriğini okuma hakkı kazanmaz.

Kurum yöneticisi rolü yatırım yetkisi de vermez. Codex bu kuralı OECD kurumsal yönetim ilkelerine dayandırdı ([OECD G20 ilkeleri](https://www.oecd.org/en/publications/g20-oecd-principles-of-corporate-governance-2023_ed750b30-en/full-report/component-8.html)). Bu öneri bir ürün kararıdır. Ürün sahibi onaylamadan koda girmez.

### Plan sağlığını kişi başına değil, plan başına ölçün

**Çıkarım.** Bu üründe değer girişlerden doğmaz. Değer karar ve gözlem kayıtlarından doğar. Bu yüzden kullanımı plan başına ölçün. Bu ölçüm çalışanı puanlamaz.

Uygulama kümesindeki bir plan şu dört koşulu sağlarsa etkin sayılır (hipotez):

1. Her etkin hedefe son 30 günde en az bir gözlem girildi.
2. Karar sahibi son 31 günde Karar 6 ya da Karar 7 kaydetti.
3. Karar sahibi 3.5 gözden geçirmesini zamanında kaydetti. Zamanında demek, sonraki kontrol tarihinden en geç 14 gün sonra demektir.
4. Karar sahibinin kuyruğunda 14 günden eski inceleme kaydı yok.

Aboneliği bırakmanın erken işaretleri şunlardır (hipotez):

1. Sonraki kontrol tarihi geçti ve gözden geçirme kaydı yok.
2. Planda 30 gündür hiç gözlem yok.
3. Planda karar sahibinin 30 gündür hiçbir kaydı yok.
4. Stratej rolündeki kişinin ya da danışmanın üyeliği bitti. Yerine kimse atanmadı.
5. Karar sahibi değişti.

**Sınır.** Plan sağlığı listesi müşteri sitesinde hesaplanır. Listede plan içeriği olmaz. Listede yalnız tarih ve sayı olur. Listenin size gönderilmesi müşteri sözleşmesine yazılır.

### Tek kurucu için danışman genel şart değildir

Önceki tasarım tek kurucuya bir danışman ekletiyordu. Codex buna karşı çıktı. Codex'e göre ikinci kişi yalnız bağımsız inceleme isteyen kararda gerekir ([Codex aktarım listesi](<../research_notes/Codex belgelerinden alınanlar/codex_aktarim_listesi.md>), çelişki C6).

**Değerlendirme.** Codex'in görüşü daha güçlü dayanaktadır. Bizim kuralımızı destekleyen bir çalışma yoktur. Öte yandan küçük şirketlerin stratejiyi çok farklı yollarla kurduğu bilinir.

**Önerimiz.** Danışman genel şart olmaz. Ürünün bugünkü kuralı korunur. Tek kurucu iki işi ikinci görüş olmadan yapamaz:

1. "İlerle" önerisinin dışına çıkmak
2. Sınır artırmak

Tek kurucu bu iki işe ihtiyaç duyarsa plana bir danışman ekler. Diğer işlerde danışman isteğe bağlıdır. Bu bir ürün kararıdır. Kararı ürün sahibi verir.

## 3. Destek kapasitesi: bir kişi yaklaşık 70 müşteriye bakar

### Büyük yazılım şirketinde bile hizmet zarar edebilir

**Kanıt.** Workday, 31 Ocak 2026 Cumartesi günü biten mali yılın sonuçlarını açıkladı ([Workday 10-K, gelir tablosu](https://www.sec.gov/Archives/edgar/data/1327811/000132781126000014/wday-20260131.htm)).

| Kalem | Gelir | Maliyet | Brüt kâr |
|---|---|---|---|
| Abonelik | 8.833 milyon dolar | 1.531 milyon dolar | Yaklaşık yüzde 82,7 |
| Hizmet | 719 milyon dolar | 790 milyon dolar | Yaklaşık yüzde eksi 9,9 |

Brüt kâr oranlarını biz hesapladık. Tutarlar gelir tablosundan okundu.

**Çıkarım.** Hizmet, kârlı bir yazılım şirketinde bile zarar edebilir. Bu yüzden toplantı yürütme işini iş ortakları yapmalı. Sizin hizmetiniz kurulum, ortak eğitimi ve sertifikayla sınırlı kalmalı. Kurulum ücreti gerçek saati karşılamalı.

Önceki raporda bir oran vardı: "hizmet geliri yüzde 15'i geçmesin." Bu oran ikinci el bir özetten geliyordu. Bu rapor onun yerine Workday verisini kullanır.

### Müşteri başarı ölçütleri büyük şirketlerden geliyor

**Kanıt (satıcı).** Gainsight müşteri başarısı yazılımı satar. Gainsight 29 Temmuz 2022 Cuma günü şu oranları yayımladı ([Gainsight](https://www.gainsight.com/blog/gainsight-horizon-ai-labs-what-is-the-right-csm-to-customer-ratio/)):

| Müşterinin yıllık ödemesi | Bir sorumlunun müşteri sayısı |
|---|---|
| 100.000 doların üstü | Yaklaşık 22 |
| 10.000 ile 100.000 dolar arası | Yaklaşık 49 |
| 10.000 doların altı | Yaklaşık 144 |

Bu oranlar yıllık geliri 100 milyon doları aşan ABD'li yazılım şirketlerinden gelir. Yazı bu oranları müşteri kaybıyla ilişkilendirmez. Gainsight'ın 2025 verisi yalnız göreli farklar verir ([Gainsight, 23 Ocak 2026 Cuma günü](https://www.gainsight.com/blog/what-customer-success-teams-are-prioritizing-in-2026-and-what-the-data-shows-is-working/)). 2025 verisinin mutlak değerleri kapalı bir raporda durur. Doğrulanmış en yakın ölçüt 2022'deki 144 müşteridir.

### Hesap: kaç müşteriye bir kişi?

Karar paketi yılda yaklaşık 180.000 TL'dir. Bu tutar 10.000 doların altındaki banttadır. Bir kişinin ayda yaklaşık 140 verimli saati olduğunu varsayıyoruz.

| Müşteri başına aylık destek | Bir kişinin bakabildiği müşteri |
|---|---|
| 1 saat | 140 |
| 2 saat | 70 |
| 3 saat | 47 |
| 4 saat | 35 |

**Çıkarım.** 2 saatlik destekle bir kişi yaklaşık 70 müşteriye bakar. Bu sayı küçük bir ekip için ilk tavandır. Gainsight'ın 144 sayısı otomasyonu güçlü büyük şirketlerden gelir. Bu yüzden 70 sayısı "ölçütün yarısı" diye okunmamalı.

### Aylık ortalama yoğun haftayı gizler

Codex bir hesap yöntemi önerdi ([Codex aktarım listesi](<../research_notes/Codex belgelerinden alınanlar/codex_aktarim_listesi.md>), madde 5.4). Örnek hesap şöyledir:

1. Aynı hafta 8 şirket pilotun yoğun bölümündedir.
2. Her şirket o hafta 6 saat ister.
3. Toplam ihtiyaç 48 saattir.
4. Ekibin o haftaki kapasitesi 32 saattir.
5. 16 saatlik açık oluşur.

Örnekteki sayılar uydurmadır. Yöntem doğrudur: kapasite aylık ortalamayla değil, en yoğun haftayla planlanır.

### Destek kuralları

1. Pilot süresince müşteri başına ayda 2 saat ve fazlası ayrılır. Bu saati kurulum ücreti karşılar.
2. Pilottan sonra sizin desteğiniz ayda yaklaşık 1 saate iner (hipotez).
3. Toplantı yürütme ve el tutma işini iş ortağı yapar.
4. Her destek saati müşteri adına kaydedilir.
5. Gerçek saat ilk 5 pilotta ölçülür.
6. Pilot başlangıçları aynı haftaya yığılmaz.
7. Sınırı aşan iş saat başına ücretlendirilir.

## 4. Ortak düzeyleri ve sertifika

### Türkiye'de yazılım ortakla satılıyor

**Kanıt.** Logo'nun 1.000'den fazla iş ortağı vardır. Logo 230.000'den fazla müşteriye ulaşır. Bu veriler 2025 yıl sonuna aittir ([Logo, 31 Mart 2026 ara dönem raporu](https://cdn.logo.com.tr/Files/logocomtr/Uploads/Documents/Faaliyet-Raporu-31-Mart-2026.pdf), s. 3 ve 15). Bu, ortak başına yaklaşık 230 müşteri eder.

Logo'nun 2025 raporu 3. sayfada 800 ortak yazar. Bu sayı eski bir tanıtım paragrafından gelir. Aynı raporun 15. sayfası 1.000'den fazla ortak yazar ([Logo, 31 Mart 2025 raporu](https://cdn.logo.com.tr/files/logocomtr/Uploads/Documents/Faaliyet_Raporu_31_Mart_2025.pdf)). Çelişki böylece çözülür.

**Kanıt (satıcı).** Paraşüt mali müşavire ücretsiz araçlar verir. Örneğin "Atlas Aktarım" bir büro ve müşteri yönetimi aracıdır. Sayfada komisyon ya da ortak düzeyi yazmaz ([Paraşüt mali müşavir kanalı](https://www.parasut.com/mali-musavir-kanali)).

**Çıkarım.** İlk şablon Paraşüt modelidir. Ortağa işini kolaylaştıran ücretsiz bir araç verilir. Karar Atlası'nda bu araç çok müşterili danışman ekranıdır. Mali müşavir ikinci bir kanal olabilir. Mali müşavir plana "Danışman" rolüyle girer.

### İlk yıl yalnız yönlendirme ortaklığı

Önerimiz şudur (hipotez):

1. İlk yıl yalnız yönlendirme ortaklığı kurulur. Ortak müşteriyi getirir ve işi yürütür. Faturayı siz kesersiniz.
2. Ortaktan gelen müşterinin aboneliğinden ortağa yüzde 20 pay verilir.
3. Ortağa yüzde 25'ten fazla pay verilmez.
4. Ortak kendi danışmanlık ücretini müşteriden ayrıca alır. Bu ücret sizin gelirinize girmez.

Bu oranlar "Derin gelir modeli analizi" raporunun varsayımlarıdır ([Derin gelir modeli analizi](<Derin gelir modeli analizi.md>), bölüm 4.6). Hiçbir Türk yazılım şirketi ortak payını yayımlamıyor.

### Güvenilir sertifikalar dört şeyi birleştiriyor

| Sertifika | Ne ister? | Fiyat ve süre | Kaynak |
|---|---|---|---|
| WorkBoard OKR koçu | İki günlük eğitim. 2. düzey için en az iki çeyrek koçluk. | 599 dolar. Toplam 7 saat. | [WorkBoard](https://learn.workboard.com/page/okr-coach-certification), [2. düzey](https://learn.workboard.com/page/advanced-okr-coach-certification) (satıcı) |
| IAF Onaylı Kolaylaştırıcı | Beş çalıştayın yazılı özeti | 500 dolar. 4 yıl geçerli. | [IAF yolu](https://www.iaf-world.org/professional-development/), [IAF ücretleri, 12 Mart 2026 Perşembe günü](https://iaf-world.org/pd-fees-list-and-policy-20260312/) |
| IAF Sertifikalı Profesyonel Kolaylaştırıcı | Önce Onaylı Kolaylaştırıcı belgesi. Sonra canlı değerlendirme. | 2.000 dolar. 4 yıl geçerli. Yenileme 400 dolar. | Aynı kaynaklar |
| IAF yenileme | Son dört yılda en az yedi çalıştay | Üyelik ücreti ayrıca ödenir. | [IAF yenileme](https://iaf-world.org/get-recertified/) |
| Balanced Scorecard Institute | 401 kursu 2 gün, sınav dahil. 301 kursu 3 gün. Toplu kurs 5 gün. | 1.970, 2.955 ve 4.925 dolar | [BSI](https://balancedscorecard.org/training-certification/bsp-balanced-scorecard-professional/) (satıcı) |
| KOSGEB YÖNDE danışmanı | Dijital dönüşüm yol haritasını yalnız TÜSSİDE sertifikalı danışman yapar. İş bir portalda kaydedilir. | Denetimde çıkarılan yalın üretim danışmanı 5 yıl başvuramaz. | [YÖNDE yönergesi](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/YONDE/2026/2026.07.14/Y%C3%96NDE-Y%C3%B6nderlikveDe%C4%9FerlendirmeDestekProgram%C4%B1Y%C3%B6nergesi05.07.26.pdf), Madde 6-8 |

TÜSSİDE, Türkiye Sanayi Sevk ve İdare Enstitüsü'dür. Türkiye'de kolaylaştırıcı sertifikası için yayımlanmış bir fiyat bulunmadı. Doğrulanmış en yakın yerel çapa, YÖNDE'nin hizmet başına 20.000 TL'lik desteğidir.

**Çıkarım.** IAF 2026'da yolu iki basamağa böldü. Alt basamak yazılı kanıt ister. Üst basamak canlı gözlem ister. Bizim önerdiğimiz iki düzey bu yapıya uyar.

### Önerilen sertifika: iki düzey, yenileme ve listeden çıkarma

Aşağıdaki program WorkBoard, IAF ve KOSGEB örneklerinden türetildi. Süreler ve sayılar hipotezdir.

| Basamak | Kime? | Ne ister? | Kanıtı kim denetler? |
|---|---|---|---|
| Danışman tanışma eğitimi | Mali müşavir ve ikinci görüş veren danışman | Kısa çevrim içi eğitim. Ürün kuralları ve KVKK rolleri. Sınav yok. | Siz. Eğitim kaydı yeter. |
| 1. düzey: Sertifikalı Stratej | Pilot yürütecek danışman | Yaklaşık 2 gün eğitim. Örnek bir planı geçiş kararına kadar yürüten uygulamalı sınav. | Sizin eğitmeniniz |
| 2. düzey: Kıdemli Stratej | 1. düzeyi geçen ve pilot yürüten danışman | En az 2 tamamlanmış pilot. En az 2 zamanında yapılmış 3.5 toplantısı. Bir 2.4 toplantısının canlı gözlemi. | Ürün kayıtları ve sizin gözlemciniz |
| Yenileme | Her iki düzey | Her iki yılda bir. Etkin plan şartı. | Ürün kayıtları |
| Listeden çıkarma | Her iki düzey | Ortağın planlarında gözden geçirmeler sürekli kaçarsa ortak dizinden çıkar. | Siz. Ortağa önce yazılı uyarı verilir. |

KVKK, Kişisel Verilerin Korunması Kanunu'dur.

Birinci düzeyin eğitimi şu konuları öğretir:

1. Stratej yolu önerir ve gerekçesini kurar. Karar sahibi seçer ve kaydeder.
2. Yapay zekâ seçim yapmaz ve karar kaydetmez.
3. Yazılım çalışanı puanlamaz.
4. 2.4 seçim toplantısı nasıl yürütülür?
5. Pilot kabul tablosu nasıl doldurulur?
6. Ortağın KVKK rolü nedir?
7. Pilotun üç çıktısı nasıl üretilir?

**Fiyat çapası.** Yabancı sertifikalar 599 dolar ile 4.925 dolar arasındadır. IAF'nin iki basamağı üyelik hariç 2.500 dolar eder. Bu rapor sertifika fiyatı önermez. Fiyatı ürün sahibi ilk ortak görüşmelerinden sonra seçer.

**Kanıt ürün kayıtlarından okunur.** Uygulama kanıtı ortağın beyanından gelmez. Örneğin gözden geçirmenin tarihi ve sonraki kontrol tarihi okunur. Bu yöntem IAF'nin yazılı özetinden daha güçlüdür.

**Sınır.** Siz müşteri sitesindeki plan içeriğini okumazsınız. Ortak denetimi için yalnız tarih ve sayı gerekir. Örneğin "3.5 kaydı zamanında yapıldı mı?" sorusunun cevabı. Bu bilginin size aktarılması müşteri sözleşmesine yazılır.

### Programın danışman korkularına cevabı

| Danışmanın korkusu | Programın cevabı |
|---|---|
| "Yazılım benim yerimi alır." | Yazılım yol seçmez. Stratej rolü bir insana aittir. |
| "Teslimden sonra gelir biter." | Üç aylık gözden geçirmeyi ortak yürütür. Bu iş her çeyrekte tekrar eder. |
| "Müşteri verisinden ben sorumlu olurum." | Kayıt müşterinin kendi sitesinde durur. Ortak kendi hesabıyla çalışır. Roller sözleşmede yazar. |
| "Müşteri beni yapay zekâyla atlar." | Yapay zekâ karar kaydetmez. 2.4 toplantısını bir insan yürütür. |
| "Ücretim olumlu karara bağlanır." | Ücret karara bağlanmaz. Gerekçeli "Dur" da teslimdir. |

## 5. Kamu destekleri: tutarlar resmî metinlerden

### Dört yolun doğrulanmış tutarları

| Yol | Ne destekler? | Tutar ve koşul | Karar Atlası için anlamı | Kaynak |
|---|---|---|---|---|
| KOSGEB YÖNDE, 3. revizyon | Dijital dönüşüm yol haritası, sürdürülebilirlik raporu ve yalın olgunluk değerlendirmesi | Destek oranı yüzde 80. Yol haritası hizmet başına en çok 20.000 TL, programda 40.000 TL. Bir şirket en çok iki kez ve en az bir yıl arayla yararlanır. Program sınırı 36 ayda 280.000 TL. | Strateji danışmanlığı satırı yok. 20.000 TL, devletin kısa bir teşhis işine biçtiği değeri gösterir. | [YÖNDE yönergesi, 5 Temmuz 2026 Pazar günü](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/YONDE/2026/2026.07.14/Y%C3%96NDE-Y%C3%B6nderlikveDe%C4%9FerlendirmeDestekProgram%C4%B1Y%C3%B6nergesi05.07.26.pdf), Madde 5-8 |
| KOSGEB Kapasite Geliştirme | Anlaşmalı bankadan alınan krediye faiz ya da kâr payı desteği | KOSGEB kredi vermez. Destek 20 puandır ve geri ödenmez. Kredi 1 milyon ile 20 milyon TL arasıdır. Proje 24 ay sürer. Şirket bu destekten bir kez yararlanır. | Uygun giderler arasında yazılım lisansı, eğitim ve danışmanlık vardır. Yalnız uygun sektördeki hızlı büyüyen şirket kullanabilir. | [Başvuru Kılavuzu v2.1, Ağustos 2026](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/KAPAS%C4%B0TE%20GEL%C4%B0ST%C4%B0RME/2026/2026.08.21/Kapasite_Gelis%CC%A7tirme_Destek_Program%C4%B1_Bas%CC%A7vuru_K%C4%B1lavuzu_v2.1.pdf), s. 2-8 |
| OKA teknik desteği, 2026 | Ajans hizmeti satın alır ve bedelin tamamını öder. | Danışmanlık için en çok 400.000 TL. Oda başvurur ve en az üç üyeye hizmet verirse 600.000 TL. Eğitim için 200.000 TL. Hizmet en çok 6 ay sürer. | Kâr amacı güden şirket de başvurabilir. 2026 çağrısının konusu turizm ve yerel değerlerdir. | [OKA 2026 rehberi](https://oka.gov.tr/assets/upload/dosyalar/tr83-26-td-tur_-basvuru-rehberi.pdf), program tablosu ve 5. bölüm |
| FKA teknik desteği, 2026 | Ajans hizmeti satın alır. | Proje başına en çok 450.000 TL. Toplam bütçe 9.000.000 TL. Hizmet en çok 6 ay sürer. | İmalat ve yazılım şirketleri 2. öncelikte başvurabilir. FKA'nın 2025 yönetim danışmanlığı programından yararlanan şirket başvuramaz. | [FKA 2026 rehberi](https://fka.gov.tr/sharepoint/userfiles/Icerik_Dosya_Ekleri/2026_TD_Basvuru_Rehberi/2026_TD_Ba%C5%9Fvuru_Rehberi.pdf), program tablosu ve 5. bölüm |

Ajans tutarlarına KDV dahildir.

### Kapasite Geliştirme kime açık?

Kılavuza göre şu şartlar aranır ([Başvuru Kılavuzu v2.1](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/KAPAS%C4%B0TE%20GEL%C4%B0ST%C4%B0RME/2026/2026.08.21/Kapasite_Gelis%CC%A7tirme_Destek_Program%C4%B1_Bas%CC%A7vuru_K%C4%B1lavuzu_v2.1.pdf), s. 2-8):

1. Şirket imalat, telekomünikasyon, yazılım, bilişim ya da Ar-Ge alanındadır.
2. İmalat şirketinin sanayi sicil belgesi ve YODA raporu vardır. YODA, yalın olgunluk değerlendirmesidir.
3. Şirketin 2022 yılında en az 10 çalışanı vardır.
4. Şirket 2022 ile 2025 arasında yılda ortalama en az yüzde 10 büyüdü. Büyüme çalışan sayısında ya da gerçek net satışta ölçülür.

Savunma, havacılık ve uzay tedarikçisinde kredi sınırı yükselir. Sınır EYDEP düzeyine göre 25, 27,5 ya da 30 milyon TL olur. Kredi en çok 36 ay sürer. Proje 30 aya kadar uzatılabilir.

**Çıkarım.** Ticaret ya da hizmet alanındaki aile şirketi bu yolu kullanamaz. Uygun imalat şirketi ise aboneliği ve pilotu bir büyüme projesine koyabilir.

### YÖNDE çapası nasıl hesaplanır?

YÖNDE desteği şu formülle bulunur:

```text
destek = en küçük( 0,80 × ücret , 20.000 TL )
```

Ücret 25.000 TL'ye kadar ise ücretin yüzde 80'i karşılanır. 80.000 TL'lik bir pilot uygun olsaydı destek yine 20.000 TL olurdu. Ama YÖNDE'de strateji danışmanlığı satırı yoktur.

**Çıkarım.** Pilot fiyatı YÖNDE değerinin dört katıdır. Alıcı pilotu "desteklenebilir teşhis" diye görmez. Bu bir fiyat önerisi değildir. Alıcının kafasındaki karşılaştırmayı gösterir.

### Oda ve ajans kanalı

Meksika'da danışmanlık almayanların yüzde 46,3'ü "param yok" dedi. Kamu desteği bu engeli azaltabilir. Örnek bir kanal şöyle çalışır (hipotez):

1. Bir oda 10 ile 30 üye aile şirketini bir gruba toplar.
2. Oda kalkınma ajansına teknik destek başvurusu yapar.
3. Sertifikalı iş ortakları şirketlerde pilot yürütür.
4. Siz ortakları eğitir ve aboneliği sağlarsınız.

OKA'da tek şirket de başvurabilir. Oda başvurusunda sınır 600.000 TL'ye çıkar. Program konusu her ajansta ve her yıl değişir. İş ortağı her başvurudan önce güncel çağrı metnini okur.

Ankara Kalkınma Ajansı'nın 500.000 TL'lik sınırı bu turda yeniden okunmadı. Onun yerine tam okunan OKA ve FKA rehberleri kullanıldı.

## 6. Roller, sıklık ve RACI

### Roller ve önerilen sıklıklar

Rollerin yetkileri bütünleşik geliştirme raporundan gelir ([bütünleşik geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md), bölüm 3.5). Sıklıklar bizim önerimizdir (hipotez).

| Rol | Kim alır? | Ne yapar? | Önerilen sıklık | Şart mı? |
|---|---|---|---|---|
| Karar sahibi | İkinci kuşak genel müdür ya da kurucu | Plan üyesi ekler. Kararları ve kaynak izinlerini kaydeder. İnceleme kuyruğunu karara bağlar. | Her hafta kuyruk. Her ay Karar 6 ya da Karar 7. Her gözden geçirmede 3.5. | Her planda tek kişi şart |
| Stratej | Kurumsal gelişim müdürü ya da sertifikalı iş ortağı | Yol önerir ve gerekçesini kurar. Strateji adımlarını ve hedefleri yazar. Karar kaydedemez. | Hazırlık ve oluşturma boyunca her hafta. Uygulamada her ay ve her 3.5 toplantısında. | Strateji oluşturmada şart |
| Ekip üyesi | Mali işler müdürü ve iş sorumluları | Adım cevabı, kanıt, hedef, gözlem ve kaynak hareketi yazar. İkinci görüş verebilir. | Her hafta, var olan bir toplantının içinde gözlem. Harcama oldukça kaynak hareketi. | En az 1 kişi şart. Pilot hipotezi 2 ile 5 kişidir. |
| Danışman | Dış danışman ya da mali müşavir | Yalnız okur ve ikinci görüş verir. | Her kapı kararında. Her gözden geçirmede. | Genel şart değil. Tek kurucu sınır artıracaksa ya da "İlerle" dışına çıkacaksa gerekir. |
| Okur | Aile meclisi, yönetim kurulu, kurucu kuşak | Yalnız okur. | Her gözden geçirmeden sonra | İsteğe bağlı |
| Kurum yöneticisi | Bilgi işlem sorumlusu ya da dış bilgisayar hizmeti | Kullanıcı ekler. Cihaz iptal eder. Plan verisini açamaz. Karar ve yatırım yetkisi yoktur. | Değişiklik oldukça. Her ay erişim kontrolü. | Her kurumda şart |
| Sistem yöneticisi | Ürünü işleten ekip | Gece yayınını ve özellik anahtarlarını yönetir. | Her gece yayın. Müşteri rolü değildir. | Müşteride yok |

Yapay zekâ bir rol değildir. Yapay zekâ ayrı bir hizmet hesabıyla çalışır. Bu hesap yalnız taslak yazar. Bu hesabın karar kayıt türlerinde hiçbir yazma izni yoktur.

### Hizmet tarafının ritmi

| Kim? | Ne yapar? | Sıklık |
|---|---|---|
| İş ortağı, stratej rolünde | Pilot boyunca haftalık toplantıları yürütür. 2.4 toplantısını yönetir. | Pilotta her hafta |
| İş ortağı | 3.5 toplantısını yürütür. | Pilottan sonra üç ayda bir |
| İş ortağı | Müşteriyi arar. | Karar sahibi değişince ve plan sağlığı kötüleşince |
| Müşteri başarı sorumlunuz | Plan sağlığı listesini okur. Gereken ortağı arar. | Her hafta |
| Müşteri başarı sorumlunuz | Destek saatlerini müşteri adına kaydeder. | Her destek işinde |
| Müşteri başarı sorumlunuz | Gelecek haftanın pilot yükünü kapasiteyle karşılaştırır. | Her hafta |
| Ürün sahibi | Ortakların sertifika ve yenileme durumunu okur. | Üç ayda bir |
| DevOps sorumlusu | MCP ucunun ve sunucu betiği ayarının kapalı olduğunu yayın kaydında görür. | Her kurulumda ve her yayında |

Bugün üründe bildirim modülü yoktur ([bütünleşik geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md), bölüm 14). Bu yüzden ilk yıl hatırlatmayı bir insan yapar. Bu insan iş ortağı ya da müşteri başarı sorumlusudur.

### RACI tablosu: müşteri tarafı

RACI tablosu her işte kimin ne yaptığını gösterir.

| Harf | Anlamı |
|---|---|
| R | İşi yapan kişi |
| A | Hesap veren kişi. Karar işlerinde kaydı yapan kişidir. |
| C | Görüşü alınan kişi |
| I | Sonuçtan haberdar edilen kişi |

Her işin tek bir A'sı vardır. Tire işareti "rolü yok" demektir.

| İş | Sistem yön. | Kurum yön. | Karar sahibi | Stratej | Ekip üyesi | Danışman | Okur | Önerilen sıklık |
|---|---|---|---|---|---|---|---|---|
| Kurum sitesi açma, gece yayını, özellik anahtarı | R, A | I | - | - | - | - | - | Her gece yayın. Değişiklik oldukça. |
| Kullanıcı ekleme, cihaz iptali | - | R, A | I | - | - | - | - | Değişiklik oldukça |
| Erişim kontrolü | - | R, A | C | - | - | - | - | Her ay |
| Pilot kabul tablosu | - | - | A | R | C | C | - | Pilottan önce bir kez |
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
| Hedefe karşı gözlem | - | - | I | C | R, A | - | - | Her hafta, var olan toplantıda |
| İnceleme kuyruğu | - | - | R, A | C | I | - | - | Her hafta |
| Karar 6 ve Karar 7 | - | - | A | R | C | C | I | Her ay |
| 3.5 ve Karar 8 | - | - | A | R | C | C | I | İnceleme aralığında ve tetikleyici olayda |
| Sınır artışı | - | - | R, A | - | C | C | - | İhtiyaç oldukça. İkinci görüşü başka bir üye verir. |
| Rapor okuma ve paylaşma | - | - | I | R, A | - | I | I | Her onaylı karardan sonra |

### RACI tablosu: hizmet tarafı

| İş | Ürün sahibi | Müşteri başarı sorumlusu | İş ortağı | Karar sahibi | DevOps sorumlusu |
|---|---|---|---|---|---|
| Ortak eğitimi ve sertifika sınavı | R, A | I | C | - | - |
| Pilotu yürütme | C | I | R | A | - |
| Üç aylık ortak toplantısı | I | C | R | A | - |
| Plan sağlığı listesini okuma | I | R, A | I | - | - |
| Karar sahibi değişince arama | I | A | R | C | - |
| Sertifika yenileme ve listeden çıkarma | R, A | C | I | - | - |
| Destek saatini kaydetme | I | R, A | C | - | - |
| MCP ve sunucu betiği ayarını kapatma | I | - | - | - | R, A |

### Tablonun önemli sonuçları

1. Aile meclisi "Okur" rolünü alır. Meclis yazılımda karar hakkı almaz. Çünkü her planda tek karar sahibi vardır.
2. Mali işler müdürü "Ekip üyesi" rolünü alır. Kaynak hareketlerini o girer. Kaynak iznini o açamaz.
3. Dış danışman işi yürütürse "Stratej" rolünü alır. Yalnız ikinci görüş verirse "Danışman" rolünü alır.
4. Dış danışman aynı planda karar sahibi olmaz.
5. Tek kurucuda karar sahibi ile stratej aynı kişi olabilir.
6. Sistem yöneticisi ve kurum yöneticisi plan içeriğinde hiçbir işin R'si ya da A'sı değildir.

## 7. Frappe 16 kodu ne yapıyor? Doğrulanmış tablo

### Neyi okuduk?

Kod, `v16.56.0` etiketinden okundu. Bağlantıların ortak başı şudur: `https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/`. Frappe 15 karşılaştırması `version-15` dalının `2e9ecdc` kaydından yapıldı. Kod değişikliklerinin tarihi GitHub kayıtlarından okundu.

### Kayıt denetimi, liste ve paylaşım

| No | Kod ne yapıyor? | Kod kaynağı | Karar Atlası kuralı |
|---|---|---|---|
| F1 | Kayıt denetimi kancası açıkça `True` dönmezse kişi reddedilir. `None` da red demektir. | [`permissions.py` L483-L500](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/permissions.py#L483-L500) | Kanca her zaman `True` ya da `False` döner. |
| F2 | Bu davranış 10 Ocak 2024 Çarşamba günü geldi. Kod kaydı `5ef8577`, değişiklik isteği 24253'tür. Frappe değişikliği "BREAKING CHANGE" diye işaretledi. | [Kayıt 5ef8577](https://github.com/frappe/frappe/commit/5ef8577cffe4f9ff8ca948f0320e88c58a042750), [v16 geçiş rehberi](https://github.com/frappe/frappe/wiki/Migrating-to-version-16) | Kural belgeye değil, koda göre yazılır. |
| F3 | Frappe 15 ilk "boş olmayan" cevapta dururdu. Bir uygulamanın `True` cevabı ötekinin reddini gizleyebilirdi. Frappe 16 bütün kancaları sorar. Biri reddederse kişi reddedilir. | v15: [`permissions.py` L455-L473](https://github.com/frappe/frappe/blob/2e9ecdc03fa5b5b8d1ba05224a1aff7dad832bd0/frappe/permissions.py#L455-L473). v16: F1 ile aynı satırlar. | Aynı kayıt türüne bağlı bütün kancalar `True` dönmelidir. Başka bir uygulama kurulmadan önce kancaları test edilir. |
| F4 | Frappe belgesi kancanın `permission_type` aldığını yazar. Kod `ptype` gönderir. `frappe.call` işlevin tanımadığı adlı argümanı sessizce atar. | [Kanca belgesi](https://docs.frappe.io/framework/user/en/python-api/hooks), [`permissions.py` L495](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/permissions.py#L495), [`__init__.py` L1138-L1188](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/__init__.py#L1138-L1188) | Kanca imzası `(doc, ptype=None, user=None, debug=False)` olur. `permission_type` yazılırsa iş türü hep boş gelir. |
| F5 | Frappe belgesi hâlâ "`None` dönerse varsayılan davranış sürer" der. Bu Frappe 15 davranışıdır. | [Kanca belgesi](https://docs.frappe.io/framework/user/en/python-api/hooks), "Document Permissions" bölümü | Ekip kodu belgeye göre değil, koda göre yazar. |
| F6 | "Administrator" hesabı bütün kancalardan önce izin alır. | [`permissions.py` L105-L110](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/permissions.py#L105-L110) | Bu hesap günlük işte kullanılmaz. Karar uçları bu hesabı da reddeder. |
| F7 | Liste sorgusu kayıt denetimi kancasını çağırmaz. Liste yalnız liste koşuluna bakar. | [`database/query.py` L1650-L1686](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/database/query.py#L1650-L1686) | Liste ve kayıt aynı üyelik kuralından üretilir. |
| F8 | Liste kancası boş dönerse koşul eklenmez. Başka koşul da yoksa kod "bütün belgelere erişilebilir" der. | [`query.py` L1674-L1676](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/database/query.py#L1674-L1676), [L1710](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/database/query.py#L1710) | Liste kancası hiçbir zaman boş dönmez. Üye olmayana her zaman yanlış olan koşul döner. Örneğin `1=0`. |
| F9 | Liste kancası kullanıcıyı ilk argüman, kayıt türünü `doctype` adıyla alır. Metin ya da sorgu nesnesi dönebilir. | [`query.py` L1706-L1713](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/database/query.py#L1706-L1713) | Liste kancası imzası `(user=None, doctype=None)` olur. |
| F10 | Yönetim ekranından yazılan "Server Script" de liste koşulu ekleyebilir. Sunucu betikleri yalnız `common_site_config.json` içindeki `server_script_enabled` ayarıyla açılır. | [`query.py` L1723-L1729](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/database/query.py#L1723-L1729), [`utils/safe_exec.py` L86-L88](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/utils/safe_exec.py#L86-L88) | Kurum sitelerinde bu ayar kapalı kalır. |
| F11 | `frappe.get_all` izni her zaman atlar. `ignore_permissions=False` yazmak bunu değiştirmez. Satır sınırı da yoktur. `frappe.qb.get_query` varsayılan olarak izni atlar. | [`__init__.py` L1381-L1403](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/__init__.py#L1381-L1403), [`query.py` L243](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/database/query.py#L243) | Plan modüllerinde kullanıcıya dönük okumada bu çağrılar yasaktır. |
| F12 | Paylaşım satırı kanca reddinden sonra erişim verir. Listede paylaşılan kayıt "veya" ile eklenir. Kodun yorumu: paylaşılan belgeler bütün kısıtları yener. | [`permissions.py` L179-L211](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/permissions.py#L179-L211), [`query.py` L1680-L1684](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/database/query.py#L1680-L1684) | Plan kayıtları paylaşılmaz. |
| F13 | "Herkes" işaretli paylaşım satırı misafir dışındaki bütün kullanıcılara erişim verir. | [`share.py` L201-L203](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/share.py#L201-L203) | Bir denetim plan kayıtlarında "herkes" satırı arar. Satır bulunursa yayın durur. |
| F14 | Her yeni paylaşım satırı kaydın `validate_share` adımını çalıştırır. Bu adım `hooks.py` içindeki `doc_events` ile de bağlanabilir. | [`docshare.py` L34-L39](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/core/doctype/docshare/docshare.py#L34-L39), [`document.py` L1514-L1536](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/document.py#L1514-L1536), [L1926-L1927](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/document.py#L1926-L1927) | Tek bir işlev bütün plan kayıt türlerinde paylaşımı reddeder. |
| F15 | Sunucu kodu paylaşıma `ignore_validate` bayrağı verirse `validate_share` atlanır. | [`share.py` L60-L101](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/share.py#L60-L101), L89-L90 | Kod taraması paylaşım çağrılarında bu bayrağı arar. |
| F16 | `disable_document_sharing` ayarı yalnız yeni paylaşımı durdurur. Var olan satırlar erişim vermeye devam eder. Ayar açıkken görev atama aracı paylaşım açmaz, hata verir. | [`permissions.py` L112-L114](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/permissions.py#L112-L114), [`assign_to.py` L122-L134](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/desk/form/assign_to.py#L122-L134) | Ayar açılır. Ama ayar tek başına yetmez. |

### Yazma, iş akışı ve kimlik

| No | Kod ne yapıyor? | Kod kaynağı | Karar Atlası kuralı |
|---|---|---|---|
| F17 | `ignore_permissions` bayrağı rol iznini, kancayı ve paylaşımı birlikte atlar. | [`document.py` L640-L652](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/document.py#L640-L652) | Bu bayrağı kullanan karar ucu yetki işlevini kendisi çağırır. |
| F18 | `db_set` izin ve doğrulama yapmaz. Değişiklik geçmişine sürüm kaydı da yazmaz. Normal kaydetme sürüm kaydı yazar. | [`document.py` L1787-L1846](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/document.py#L1787-L1846), [L1744](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/document.py#L1744) | Karar türlerinde `db_set` yasaktır. Gerekçe: değişiklik geçmişte görünmez. |
| F19 | `frappe.db.set_value` hiçbir kayıt olayını çalıştırmaz. Doğrudan veritabanına yazar. | [`database.py` L948-L1015](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/database/database.py#L948-L1015) | Karar türlerinde yasaktır. |
| F20 | `ignore_validate` bayrağı beş adımı atlar: `validate`, `before_save`, `before_submit`, `before_cancel` ve `before_update_after_submit`. | [`document.py` L1661-L1691](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/document.py#L1661-L1691) | Karar türlerinde yasaktır. |
| F21 | Frappe iş akışında kendi kaydını onaylamak varsayılan olarak serbesttir. Engel açılsa da yalnız kaydı oluşturan kişiye bakar. Son değiştiren kişiye bakmaz. | [`workflow.py` L142-L143](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/workflow.py#L142-L143), [L307-L308](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/workflow.py#L307-L308), [`workflow_transition.json` L63-L69](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/workflow/doctype/workflow_transition/workflow_transition.json#L63-L69) | Görev ayrılığını yetki işlevi uygular. Karşılaştırma kayıttaki "değiştiren" alanıyla yapılır. |
| F22 | İş akışı geçişi bütün sitedeki rollere bakar. Plan rolüne bakmaz. | [`workflow.py` L72-L73](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/workflow.py#L72-L73) | Kararlar Frappe iş akışıyla değil, kendi uçlarımızla yazılır. |
| F23 | OAuth denetimi anahtarın kendi kapsamını ister. Bu yüzden kapsam hiçbir ucu daraltmaz. | [`auth.py` L660-L697](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/auth.py#L660-L697) | İptal edilen cihazı uygulamanın giriş kancası durdurur. |
| F24 | `auth_hooks` işlevi argümansız çağrılır. Anahtar denetiminden sonra, IP denetiminden önce çalışır. Her istekte çalışır. | [`auth.py` L641-L657](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/auth.py#L641-L657), [L755-L757](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/auth.py#L755-L757), [`app.py` L114-L116](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/app.py#L114-L116) | Giriş kancası anahtarı istek başlığından kendisi okur. İptal edilen cihazda hata fırlatır. |
| F25 | Belge, giriş kancasında "hata fırlatmayın" der. Bu öneri başka giriş yöntemleri içindir. Hata fırlatılmazsa istek sürer. | [Kanca belgesi](https://docs.frappe.io/framework/user/en/python-api/hooks), "Auth Hooks" bölümü | İptal denetimi için hata fırlatmak gerekir. |
| F26 | API anahtarı istekle gelen `Frappe-Authorization-Source` başlığına uyar. Anahtar `User` dışında başka bir kayıt türünde de aranabilir. Bu kayıt türünde `api_key`, `api_secret`, `enabled` ve `user` alanları olmalıdır. | [`auth.py` L708-L750](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/auth.py#L708-L750) | Hiçbir uygulama kayıt türü `api_key` ve `api_secret` alanı taşımaz. Örneğin Cihaz kaydı. |
| F27 | Kayıt adlandırması "UUID" ise istemcinin UUID'si olduğu gibi kalır. Frappe yalnız okunabildiğine bakar. Oluşturma izni adlandırmadan önce denetlenir. | [`naming.py` L141-L198](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/naming.py#L141-L198), [`document.py` L715-L719](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/document.py#L715-L719) | Sunucu UUID'yi standart biçime çevirir. UUIDv5'i yeniden hesaplar. |
| F28 | Frappe 16, Python 3.14 ister. | [`pyproject.toml` L7](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/pyproject.toml#L7) | Bütünleşik rapordaki sürüm bilgisi doğrudur. |

### MCP ucu

| No | Kod ne yapıyor? | Kod kaynağı | Karar Atlası kuralı |
|---|---|---|---|
| F29 | `/api/v2/mcp` ucu "Enable MCP" ayarı kapalıysa 404 döner. | [`mcp/__init__.py` L10-L16](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/mcp/__init__.py#L10-L16), [`api/v2.py` L289](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/api/v2.py#L289) | 404 cevabı kapalı olmanın kanıtıdır. |
| F30 | Ayarın varsayılan değeri açıktır. | [`system_settings.json` L873-L878](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/core/doctype/system_settings/system_settings.json#L873-L878) | Yeni sitede uç açık doğar. |
| F31 | Sürüm yükseltme yamaları var olan sitelerde de ucu açar. | [`patches.txt` L279](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/patches.txt#L279), [kayıt 553eeca](https://github.com/frappe/frappe/commit/553eeca997c6eb73842d93f7b629b221be311525) | Kapatma her yükseltmeden sonra yeniden yapılır. |
| F32 | Uç ilk kez 16.53.0 sürümüyle geldi. Bu sürüm 22 Ekim 2026 Perşembe günü yayımlandı. Eski `disable_mcp_server` site ayarı 23 Ekim 2026 Cuma günü kaldırıldı. | [Kayıt f311676](https://github.com/frappe/frappe/commit/f3116763a2), [kayıt 729c5fb](https://github.com/frappe/frappe/commit/729c5fb7d8) | Site ayar dosyası artık ucu kapatmaz. |
| F33 | Uçtaki araçlar kayıt listeler, okur, oluşturur, günceller ve siler. Beyaz listedeki uçları da çağırır. Araçlar REST ile aynı izin denetimini kullanır. | [`mcp/tools/documents.py` L88-L130](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/mcp/tools/documents.py#L88-L130), [`mcp/tools/methods.py` L81-L89](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/mcp/tools/methods.py#L81-L89) | Karar uçları beyaz listededir. Bu yüzden yetki işlevi hizmet hesabını da reddeder. |
| F34 | Frappe'nin kendi testi ayarın açık geldiğini doğrular. | [`mcp/test_settings.py` L86-L88](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/mcp/test_settings.py#L86-L88) | Varsayılanın yakında değişmesi beklenmez. |

### Tablonun beş dersi

1. **Varsayılan ret, Frappe'nin varsayılanlarını da kapsar.** MCP ucu açık doğar. Boş liste koşulu tabloyu açar. "Administrator" kancaları atlar.
2. **Kanca imzası güvenlik sözleşmesinin parçasıdır.** Yanlış argüman adı hata vermez. Kanca sessizce yanlış çalışır.
3. **Belge ile kod üç yerde ayrışır.** `None` davranışı, `ptype` adı ve giriş kancasındaki hata önerisi.
4. **Görev ayrılığı Frappe'ye bırakılmaz.** Frappe'nin engeli kapalı gelir ve yanlış kişiye bakar.
5. **Kapatma bir kez yapılmaz.** Sürüm yükseltme ayarı geri açabilir. Bu yüzden kapatma her kurulumda ve her yükseltmede tekrarlanır.

## 8. Yetki tasarımı: varsayılan ret ve tek yetki işlevi

### Üç katman tek işlevde birleşir

Ürünün kurallarının çoğu iki şeye birden bakar. Kural önce kişinin plandaki ilişkisine bakar. Sonra kaydın durumuna bakar. Frappe rolleri bütün sitede geçerlidir. Bu yüzden Frappe rolleri bu kuralları tek başına taşıyamaz.

| Katman | Model | Nerede durur? | Neye cevap verir? |
|---|---|---|---|
| 1 | RBAC | Frappe rolleri ve rol izin satırları | Kişi bu tür kayda hiç girebilir mi? |
| 2 | ReBAC | Plan Üyeliği ve türetilen ilişkiler | Kişi bu planda bugün hangi roldedir? |
| 3 | ABAC ve görev ayrılığı | Erişim modülündeki yetki işlevi | Bu kayıt şu durumda bu işe açık mı? |

### Birinci katman: az sayıda site rolü

| Rol | Kim alır? | Verdiği izin | Vermediği izin |
|---|---|---|---|
| Sistem yöneticisi | Yalnız ürünü işleten ekip | Yayın ve özellik anahtarları | Müşteri kullanıcısına verilmez. |
| Kurum yöneticisi | Kurumun bilgi işlem sorumlusu | Kullanıcı ve cihaz yönetimi | Plan verisi açmaz. Karar ve yatırım yetkisi vermez. |
| Plan kullanıcısı | Bütün müşteri kullanıcıları | Plan kayıtlarını okuma. Yalnız eklenen kayıtları oluşturma. | Paylaşma, silme, içe aktarma ve dışa aktarma yok. Karar türlerinde oluşturma, yazma ve onaylama yok. |
| Yapay zekâ hizmet hesabı | Yapay zekâ servisi | Yalnız taslak yazan uçları çağırma | Hiçbir karar türünde izin yok. İkinci görüş yok. Kişi puanı yok. |

"Administrator" bir rol değil, Frappe'nin kurulumla gelen hesabıdır. Bu hesap bütün kancaları atlar. Bu yüzden hesap günlük işte kullanılmaz. Hesaba API anahtarı verilmez. Parolasını DevOps sorumlusu depo dışında saklar.

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
| Kaydın özelliği | Geçiş kararı var mı? Kapı kilitli mi? Strateji onayı geçerli mi? İznin durumu ve kalanı. |
| Ortamın özelliği | Cihaz iptal edildi mi? Üyelik sunucu saatine göre bugün geçerli mi? İstemcinin kural sürümü. |
| Kişinin özelliği | Hesap bir insana mı, bir hizmete mi ait? Hesap "Administrator" mı? |
| Kurumun özelliği | Yapay zekâ seviyesi. Veri sınıfı. |

### Kancalar tek dosyadan bağlanır

Bütün kancalar `hooks.py` içinde tek bir kayıt türü listesinden üretilir. Böylece yeni bir plan kayıt türü hiçbir korumayı atlamaz. Aşağıdaki kod bir taslaktır.

```python
# decisionact/hooks.py  (taslak)
from decisionact.erisim.turler import PLAN_KAYIT_TURLERI

IZIN = "decisionact.erisim.izin"

has_permission = {t: f"{IZIN}.kayit_denetimi" for t in PLAN_KAYIT_TURLERI}
permission_query_conditions = {t: f"{IZIN}.liste_kosulu" for t in PLAN_KAYIT_TURLERI}
doc_events = {t: {"validate_share": f"{IZIN}.paylasimi_reddet"} for t in PLAN_KAYIT_TURLERI}

auth_hooks = ["decisionact.erisim.giris.cihaz_denetimi"]

# Frappe 16 yamaları MCP ucunu yeniden açabilir.
# after_migrate, yamalardan sonra çalışır (frappe/migrate.py L208-L210).
after_install = "decisionact.kurulum.guvenli_ayarlar"
after_migrate = ["decisionact.kurulum.guvenli_ayarlar"]
```

`after_migrate` kancası yamalardan sonra çalışır ([`migrate.py` L146-L153 ve L208-L210](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/migrate.py#L146-L210)). Bu yüzden yamanın açtığı ayar aynı yükseltmede yeniden kapanır.

### Yetki işlevi üç biçimde cevap verir

| Kim sorar? | İşlev ne döner? |
|---|---|
| Kayıt denetimi kancası | `True` ya da `False`. Hiçbir zaman `None` dönmez. |
| Liste koşulu kancası | Bir sorgu koşulu. Hiçbir zaman boş dönmez. |
| Karar ve iş akışı uçları | İzin ya da ret, yanında bir neden kodu. Ekran nedeni sade bir cümleye çevirir. |

Okuma için en güvenli yol şudur. Kayıt denetimi, liste koşulunun aynısını tek kayıt üzerinde çalıştırır. Böylece liste ile kayıt aynı cevabı verir. Yazma ve karar işleri bunun üstüne rol ve durum kurallarını ekler.

```python
# decisionact/erisim/izin.py  (taslak)
import frappe
from frappe.utils import now_datetime

HER_ZAMAN_YANLIS = "1=0"   # boş dönüş bütün tabloyu açar (query.py L1674-L1676)

def uyelik_kosulu(tablo, kullanici):
    """Liste ve kayıt okumasının tek kaynağı."""
    uyelik = frappe.qb.DocType("Plan Üyeliği")
    simdi = now_datetime()                         # sunucu saati
    etkin_planlar = (
        frappe.qb.from_(uyelik)
        .select(uyelik.plan)
        .where(uyelik.kullanici == kullanici)
        .where(uyelik.baslangic <= simdi)
        .where(uyelik.bitis.isnull() | (uyelik.bitis > simdi))
    )
    return tablo.plan.isin(etkin_planlar)

def liste_kosulu(user=None, doctype=None):
    # Frappe 16 çağrısı: frappe.call(yontem, self.user, doctype=doctype)
    kullanici = user or frappe.session.user
    if not doctype or kullanici in ("", "Guest"):
        return HER_ZAMAN_YANLIS
    return uyelik_kosulu(frappe.qb.DocType(doctype), kullanici)

def kayit_denetimi(doc, ptype=None, user=None, debug=False):
    # Ad "ptype" olmalı. Belgedeki "permission_type" hep boş gelir.
    kullanici = user or frappe.session.user
    sonuc = yetki_ver(kullanici, ptype or "read", doc, ortam())
    return sonuc.izin is True                      # v16: None red demektir

def paylasimi_reddet(doc, method=None, *args, **kwargs):
    frappe.throw("Plan kayıtları paylaşılmaz.", frappe.PermissionError)
```

```python
# decisionact/erisim/izin.py  (taslak, devam)
HIZMET_HESABI_YASAK = KARAR_ISLERI | {"ikinci_gorus_ver"}

def yetki_ver(kullanici, is_turu, kayit, ortam):
    # Varsayılan ret. Önce yasaklar, sonra izinler.
    if kullanici == "Administrator" and is_turu in KARAR_ISLERI:
        return hayir("yonetici_hesabi")            # bu hesap kancaları atlar
    if ortam.cihaz_iptal and is_turu not in IPTALDE_IZINLI:
        return hayir("cihaz_iptal")
    if hizmet_hesabi_mi(kullanici) and is_turu in HIZMET_HESABI_YASAK:
        return hayir("hizmet_hesabi")
    if not okuyabilir_mi(kayit, kullanici):
        return hayir("plan_uyesi_degil")
    roller = gecerli_roller(kullanici, kayit.plan, sunucu_saati())
    for kural in YASAK_KURALLARI:                  # görev ayrılığı burada
        if kural.tutar(kullanici, roller, is_turu, kayit, ortam):
            return hayir(kural.neden_kodu)
    for kural in IZIN_KURALLARI:
        if kural.tutar(kullanici, roller, is_turu, kayit, ortam):
            return evet(kural.neden_kodu)
    return hayir("izin_kurali_yok")
```

`gecerli_roller` işlevi Plan Üyeliği'ni her istekte okur. Cevap istekler arasında önbellekte tutulmaz. Frappe rolleri ayrıca önbelleğe alır. Üyelik için üçüncü bir önbellek kurulmaz.

### Görev ayrılığı yetki işlevindedir

Frappe'nin kendi onay engeli iki nedenle yetmez. Engel varsayılan olarak kapalıdır. Açılsa da yalnız kaydı oluşturan kişiye bakar.

Yetki işlevi şu üç yasağı uygular:

1. Sınırı değiştiren kişi bu değişikliği inceleyemez. Karşılaştırma "değiştiren" alanıyla yapılır. Bu alan oturumdan yazılır.
2. Karar sahibi kendi kararına ikinci görüş veremez.
3. Yapay zekâ hizmet hesabı ikinci görüş veremez ve karar kaydedemez.

### Belge paylaşımı beş önlemle kapanır

Plan kayıtlarında şu beş önlem birlikte uygulanır:

1. **Yeni paylaşımı reddedin.** `paylasimi_reddet` işlevi `doc_events` ile bütün plan kayıt türlerine bağlanır.
2. **Paylaşma iznini kaldırın.** Plan kayıt türlerinin rol izin satırlarında "Share" izni olmaz. `disable_document_sharing` ayarı açılır.
3. **Görev atama aracını kullanmayın.** Görevler ürünün kendi Görev kaydıyla tutulur.
4. **Var olan satırları arayın.** Bir denetim plan kayıt türlerinde paylaşım satırı arar. "Herkes" işaretli satır da aranır. Satır bulunursa yayın durur.
5. **Bayrağı tarayın.** Kod taraması paylaşım çağrılarında `ignore_validate` bayrağını arar.

Bizim kodumuz `frappe.has_permission` çağırırsa `ignore_share_permissions=True` bayrağını da verir. Böylece paylaşım bizim denetimlerimizde hiç sayılmaz.

### Tek komut yolu: karar türleri hazır uçlara kapalı

Kullanıcı rolleri karar türlerinde `create`, `write` ve `submit` izni almaz. Bu durumda şu yolların hepsi rol izninde durur:

1. `POST /api/resource` ile karar oluşturma. Gövdede `docstatus=1` olsa da durur.
2. `PUT` ile `docstatus=1` gönderme
3. `frappe.client.submit` ve `run_method=submit`
4. Frappe'nin yönetim ekranı
5. Frappe iş akışı geçişi
6. MCP araçları

Kararları yalnız iş akışları katmanındaki uçlar yazar. Bu uçlar `ignore_permissions` ile yazar. Bu bayrak kancayı da atlar. Bu yüzden her karar ucu şu sırayı izler:

1. Uç plan kilidini alır.
2. Uç yetki işlevini kendisi çağırır.
3. Yetki işlevi "hayır" derse uç yazmadan durur.
4. Uç kuralları Python ile çalıştırır.
5. Uç kaydı yazar ve onaylar.
6. `before_submit` adımı önemli denetimleri ikinci kez çalıştırır.

```python
# decisionact/is_akislari/karar.py  (taslak)
@frappe.whitelist(methods=["POST"])
def karari_onayla(plan, kayit_kimligi, kapi, secim, gerekce):
    plan_kilidi_al(plan)
    kayit = frappe.new_doc("Kapı Kararı")
    kayit.name = kayit_kimligi                     # cihazın seçtiği UUID
    kayit.update({"plan": plan, "kapi": kapi, "secim": secim, "gerekce": gerekce})
    kayit.karar_sahibi = frappe.session.user       # istemciden değil, oturumdan
    sonuc = yetki_ver(frappe.session.user, "kapi_karari_kaydet", kayit, ortam())
    if not sonuc.izin:
        frappe.throw(sonuc.metin, frappe.PermissionError)
    kayit.flags.ignore_permissions = True          # rol izni bilerek kapalı
    kayit.insert()
    kayit.submit()                                 # before_submit yine çalışır
```

### Karar türlerinde yasak çağrılar

| Yasak çağrı | Neyi atlar? |
|---|---|
| `doc.db_set(...)` | İzin, doğrulama ve onay sonrası denetim. Değişiklik geçmişine de yazılmaz. |
| `frappe.db.set_value(...)` | Bütün kayıt olayları |
| `flags.ignore_validate` | `validate` dahil beş adım |
| `flags.ignore_validate_update_after_submit` | Onaydan sonra değişmemesi gereken alanların denetimi |

Plan modüllerinde kullanıcıya dönük okumada şu çağrılar da yasaktır:

| Yasak çağrı | Neden? |
|---|---|
| `frappe.get_all`, `frappe.db.get_all` | İzni her zaman atlar. |
| `frappe.db.get_value`, `frappe.db.sql` | İzin denetimi yapmaz. |
| Bayraksız `frappe.qb.get_query` | Varsayılanı izni atlamaktır. |
| Denetimsiz `frappe.get_doc` | `check_permission` çağrılmadan izin denetimi yapmaz. |
| `ignore_permissions=True` | İş akışı uçları ve incelenmiş sistem işleri dışında yasaktır. |

Bir kod taraması bu çağrıları her kod gönderiminde arar. İzinli istisnalar ayrı bir listede durur. Listeye ekleme kod incelemesi ister.

### Giriş kancası iptal edilen cihazı durdurur

İşler şu sırayla yürür:

1. Sunucu anahtarı verirken anahtarın kimliğini Cihaz kaydına yazar.
2. Frappe her istekte giriş kancasını argümansız çağırır.
3. Kanca anahtarı `Authorization` başlığından kendisi okur.
4. Kanca anahtarın bağlı olduğu Cihaz kaydını bulur.
5. Cihaz kaydı yoksa kanca hata fırlatır.
6. Cihaz iptal edilmişse kanca yalnız iki uca izin verir.
7. Bu iki uç "bekleyenleri incelemeye gönder" ve "yerel veriyi sil komutunu al" uçlarıdır.
8. Başka her istekte kanca hata fırlatır.

```python
# decisionact/erisim/giris.py  (taslak)
import frappe

def cihaz_denetimi():                              # Frappe argüman vermez
    baslik = frappe.get_request_header("Authorization", "")
    if not baslik.lower().startswith("bearer "):
        return
    cihaz = anahtardan_cihaz(baslik.split(" ", 1)[1])
    if cihaz is None:
        raise frappe.AuthenticationError
    if cihaz.iptal and frappe.request.path not in IPTALDE_ACIK_UCLAR:
        raise frappe.AuthenticationError           # hata fırlatılmazsa istek sürer
```

### Kurulum betiği güvenli ayarları her seferinde yazar

```python
# decisionact/kurulum.py  (taslak)
import frappe

def guvenli_ayarlar():
    frappe.db.set_single_value("System Settings", "enable_mcp", 0)
    frappe.db.set_single_value("System Settings", "disable_document_sharing", 1)
```

Kurum açma adımları ayrıca şunları içerir:

1. Ortak sunucu ayar dosyasında `server_script_enabled` açılmaz.
2. "Administrator" hesabına API anahtarı verilmez.
3. Kurulumdan sonra `/api/v2/mcp` adresi çağrılır ve 404 beklenir.
4. Her sürüm yükseltmeden sonra aynı çağrı tekrarlanır.
5. 404 gelmezse yayın durur ve dalga geri alınır.

### Kimlik: UUID'yi Frappe kabul eder, doğruluğunu siz denetlersiniz

Sunucu şu üç denetimi kendisi yapar:

1. Adı standart biçime çevirir. Standart biçim küçük harfli ve tireli yazımdır.
2. Adım Kaydı'nın adını yeniden hesaplar. Ad, plan kimliği ve adım kodundan UUIDv5 ile hesaplanır. Gelen ad hesaplanan adla aynı değilse kayıt reddedilir.
3. UUIDv5'in ad alanı sabiti API sözleşmesinde yazılır. TypeScript ve Python aynı örnek dosyasıyla sınanır.

Bu denetimler `before_insert` adımında yapılır. Frappe önce oluşturma iznini denetler. Sonra `before_insert` ve adlandırma çalışır.

### Sade kurallar

1. Kişi bir planın kayıtlarını yalnız o planın etkin üyesiyken görür.
2. Üyeliğin bitiş zamanı geçince okuma hakkı da biter.
3. Bazı kayıtları yalnız planın o anki karar sahibi kaydeder. Bunlar kapı kararı, geçiş kararı, strateji onayı, gözden geçirme ve kaynak iznidir.
4. Stratej, strateji adımlarını ancak geçiş kararından sonra yazar.
5. Kilitli bir uygulama kapısında kimse "İlerle" kaydedemez.
6. Ekip üyesi izin kapalıyken de gözlem yazar. Gözlem harcama hakkı vermez.
7. Kapalı izne gelen harcama kaydedilir ama incelemeye düşer.
8. İncelemedeki harcamayı yalnız karar sahibi kabul eder ya da reddeder.
9. Sınırı değiştiren kişi bu değişikliği inceleyemez.
10. İkinci görüşü başka bir üye kendi hesabıyla verir.
11. Karar sahibi kendi kararına ikinci görüş veremez.
12. Yapay zekâ hesabı hiçbir kararı kaydetmez ve ikinci görüş vermez.
13. Hiçbir hesap çalışana puan yazamaz. Üründe böyle bir uç yoktur.
14. İptal edilen cihaz yalnız iki iş yapar.
15. Plan kayıtları Frappe'nin belge paylaşımıyla paylaşılmaz.
16. Sunucu kişiyi erişim anahtarından tanır. İstek gövdesindeki ad yetki vermez.
17. "Administrator" hesabı karar kaydedemez.
18. Kurum sitesinde MCP ucu ve sunucu betikleri kapalıdır.

### Yetkiyi kanıtlayacak testler

Testler şu sırayla kurulur:

1. Test kod yazılmadan önce yazılır.
2. Testin önce düştüğü görülür.
3. Sonra kod yazılır ve test geçer.
4. Testler her kod gönderiminde otomatik çalışır.
5. Bir yetki testi düşerse yayın durur.
6. Testler gerçek bir Frappe 16 kurulumunda çalışır.

| No | Test | Beklenen sonuç |
|---|---|---|
| 1 | Kayıt denetimi rastgele kullanıcı ve kayıtlarla çağrılır. | Kanca hiçbir durumda `None` dönmez. |
| 2 | Kanca bir casus işlevle `frappe.has_permission` üzerinden çağrılır. | Kanca iş türünü `ptype` adıyla alır. Kanca `permission_type` adıyla yazılırsa test düşer. |
| 3 | Aynı kayıt türüne `None` dönen ikinci bir deneme kancası eklenir. | Üye olan kişi de reddedilir. Bu, Frappe 16'nın bütün kancaları sorduğunu gösterir. |
| 4 | Üye olmayan kişi için liste kancası çağrılır. | Dönüş boş değildir. `frappe.get_list` 0 satır döner. |
| 5 | Rastgele kullanıcı ve planlarla liste ve kayıt okunur. | Liste ile kayıt denetimi her durumda aynı cevabı verir. |
| 6 | Bir plan kaydı için `frappe.share.add` çağrılır. "Herkes" işaretli deneme de yapılır. | `validate_share` hatası çıkar. Satır yazılmaz. |
| 7 | Plan kayıt türlerinde paylaşım satırı aranır. | Satır yoktur. Satır bulunursa yayın durur. |
| 8 | Hazır REST ucuyla karar oluşturulur. Gövdede `docstatus=1` vardır. | Rol izni reddeder. |
| 9 | `frappe.client.submit` ile karar onaylanır. | Rol izni reddeder. |
| 10 | Üye olmayan kişi karar ucunu çağırır. | Uç yazmadan önce durur. Neden kodu "plan_uyesi_degil" olur. |
| 11 | "Administrator" hesabı karar ucunu çağırır. | Yetki işlevi reddeder. Neden kodu "yonetici_hesabi" olur. |
| 12 | A kişisi sınır değişikliğini oluşturur. B kişisi değiştirir. B incelemeye çalışır. | Yetki işlevi reddeder. Frappe'nin kendi engeli bu durumda izin verirdi. |
| 13 | Karar sahibi kendi kararına ikinci görüş verir. | Yetki işlevi reddeder. |
| 14 | İptal edilen cihaz `/api/resource` ile bir plan kaydı okur. | Giriş kancası hata fırlatır. |
| 15 | İptal edilen cihaz iki izinli ucu çağırır. | İki istek de çalışır. Üçüncü istek reddedilir. |
| 16 | Kurulumdan sonra `/api/v2/mcp` çağrılır. | 404 döner. |
| 17 | Ayar elle açılır. Sonra sürüm yükseltme çalıştırılır. Sonra `/api/v2/mcp` çağrılır. | 404 döner. Gelmezse yayın durur. |
| 18 | Yapay zekâ hesabına bütün roller verilir ve karar ucu çağrılır. | Yetki işlevi reddeder. |
| 19 | İstek `Frappe-Authorization-Source: Cihaz` başlığıyla gelir. | Giriş reddedilir. |
| 20 | Ortak sunucu ayar dosyası okunur. "Server Script" kayıtları aranır. | `server_script_enabled` açık değildir. Liste koşulu ekleyen betik yoktur. |
| 21 | Kod taraması karar türünde `db_set` görür. | Yayın durur. |
| 22 | Kod taraması paylaşım çağrısında `ignore_validate` görür. | Yayın durur. |
| 23 | Adım Kaydı yanlış bir UUIDv5 adıyla gönderilir. | Kayıt reddedilir. |
| 24 | Aynı UUID süslü parantezli ve büyük harfle gönderilir. | Ad standart biçime çevrilir. |
| 25 | İstemci başka bir kişiyi karar sahibi diye gönderir. | Sunucu alanı oturumdan yazar. |
| 26 | Aynı anda iki karar sahibi ataması gelir. | Yalnız biri etkin kalır. |
| 27 | Dış uzmanın üyeliği bitiş tarihini geçer. | Uzman planı ne listede ne kayıtta görür. |
| 28 | Kurum yöneticisi karar ucunu çağırır. | Yetki işlevi reddeder. |

27. ve 28. testler Codex'in erişim kabul testinden alındı ([Codex aktarım listesi](<../research_notes/Codex belgelerinden alınanlar/codex_aktarim_listesi.md>), madde 7.3 ve 7.4).

## 9. Gömülü yetki işlevi yeter, dış motor şimdilik gereksiz

| Seçenek | Bugünkü durum | Kaynak |
|---|---|---|
| Kendi yetki işlevimiz | Python işlevi aynı veritabanı işleminde Plan Üyeliği'ni okur. Kararla yetki aynı kilit altındadır. | Bu raporun tasarımı |
| Casbin, gömülü | Open edX bu yolu 22 Eylül 2025 Pazartesi günü seçti. OpenFGA ve SpiceDB'yi ayrı servis ve işletme yükü yüzünden "fazla karmaşık" buldu. | [Open edX karar kaydı 0004](https://docs.openedx.org/projects/openedx-authz/en/latest/decisions/0004-technology-selection.html) |
| Cedar, `cedarpy` ile | Resmî destek almaz. Ama düzenli sürüm çıkarır. Son sürüm 4.12.2, 14 Ekim 2026 Çarşamba günü. Python 3.14 paketi var. Kısmi değerlendirme yapar. | [cedar-py](https://github.com/k9securityio/cedar-py), [PyPI](https://pypi.org/project/cedarpy/) |
| Oso | Eski açık kaynak kütüphane arşivlendi ve bakım görmüyor. Yeni yol ücretli Oso Cloud hizmetidir. | [Oso deposu](https://github.com/osohq/oso), [Oso belgesi](https://www.osohq.com/docs/authorization-data/local-authorization) |

**Karar.** Şimdi kendi yetki işlevimiz kurulur. Beş gerekçe vardır:

1. Her kurumun kendi sitesi vardır. Bir sitedeki ilişki sayısı küçüktür.
2. Kararlar tek veritabanı işleminde ve plan kilidi altında kesinleşir. Dış motor bu işlemin dışında kalır.
3. Dış motor iki ayrı yere yazmayı gerektirir. Üyelik değiştikten hemen sonra eski izin okunabilir.
4. Her kurum için ayrı motor alanı gerekir. Bu yeni bir altyapı işidir.
5. Hangi motor seçilirse seçilsin Frappe'nin varsayılanları kalır. MCP, boş liste koşulu, paylaşım ve "Administrator" yine kapatılmalıdır.

Kural metni Cedar biçimine yakın yazılır. Böylece kurallar ileride bir motora taşınabilir. Bu rapor Cedar'ın kısmi değerlendirmesini SQL'e çevirmeyi denemedi. Doğrulanmış en yakın yol, liste koşulunu bu rapordaki üyelik koşuluyla elle yazmaktır.

| Durum görülürse | Ne yapılır? |
|---|---|
| Kurallar çoğalır ve okunması zorlaşır. | Önce `cedarpy` gibi gömülü bir motor denenir. |
| Holding müşterisi gelir. İç içe şirketler ve planlar oluşur. | Ayrı bir ReBAC servisi düşünülür. |
| Ortağın çok müşterili ekranı siteler arası ilişki ister. | Ayrı bir ReBAC servisi düşünülür. |

## 10. Bütünleşik geliştirme raporuna ek etkiler

Bütünleşik geliştirme raporuna 25 düzeltme zaten işlendi ([bütünleşik geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md)). Bu bölüm yalnız yeni değişiklikleri listeler. Bütünleşik rapor bu iş sırasında değiştirilmedi. Düzeltmeyi o raporun sahibi yapar.

### Yetki ve güvenlik

| No | Bölüm | Bugünkü cümle | Önerilen cümle | Neden? |
|---|---|---|---|---|
| E1 | 9.3, "MCP ucu" satırı | "Kurum sitelerinde `enable_mcp` kapalıdır. Bir test `/api/v2/mcp` adresinin 404 döndüğünü doğrular." | "MCP ucu Frappe 16.53.0 sürümünden beri varsayılan olarak açıktır. Sürüm yükseltme yaması ucu var olan sitelerde de açar. Kurulum betiği ayarı kapatır. Uygulamanın `after_install` ve `after_migrate` kancaları ayarı yeniden kapatır. Her kurulumdan ve yükseltmeden sonra bir test 404 cevabını doğrular. Test düşerse yayın durur." | F29-F32 |
| E2 | 6.3, "Liste izni" maddesi | "Kullanıcı yalnız üye olduğu planların kayıtlarını görür." | Aynı cümle kalır. Arkasına şunlar eklenir: "Liste koşulu hiçbir zaman boş dönmez. Boş dönüş bütün tabloyu açar. Üye olmayan kişiye her zaman yanlış olan bir koşul döner. Örneğin `1=0`. Kancanın imzası `(user=None, doctype=None)` olur." | F8, F9 |
| E3 | 6.3, "Kayıt izni" maddesi | "Kayıt denetimi kancası (`has_permission`) izin verirken açıkça `True` döner." | Aynı cümle kalır. Arkasına şunlar eklenir: "Kancanın imzası `(doc, ptype=None, user=None, debug=False)` olur. Frappe belgesindeki `permission_type` adı kullanılmaz. Aynı kayıt türüne bağlı bütün kancalar `True` dönmelidir." | F1-F4 |
| E4 | 6.3, "Belge paylaşımı kapalıdır" paragrafı | "Her plan kayıt türü `validate_share` ile yeni paylaşımı reddeder." | "Tek bir `paylasimi_reddet` işlevi `hooks.py` içindeki `doc_events` ile bütün plan kayıt türlerine bağlanır. `disable_document_sharing` ayarı açılır. Denetim 'herkes' işaretli satırları da arar. Kod taraması paylaşım çağrılarında `ignore_validate` bayrağını arar." | F13-F16 |
| E5 | 4.4, 5. madde | "Karar türlerinde `db_set`, `frappe.db.set_value`, `ignore_validate` ve `ignore_validate_update_after_submit` aranır." | Aynı cümle kalır. Arkasına şunlar eklenir: "`db_set` değişiklik geçmişine sürüm kaydı da yazmaz. Tarama paylaşım çağrılarında `ignore_validate` bayrağını da arar." | F15, F18 |
| E6 | 5.3, Sınır Değişikliği satırı | "İnceleyen kişi değişikliği yapan kişi olamaz." | Aynı cümle kalır. Arkasına şunlar eklenir: "Bu kuralı yetki işlevi uygular. Karşılaştırma 'değiştiren' alanıyla yapılır. Frappe'nin kendi onay engeli varsayılan olarak kapalıdır. Açılsa da yalnız kaydı oluşturana bakar." | F21 |
| E7 | 9.3, güvenlik tablosu | "Administrator" hesabı için satır yok. | Yeni satır: "Administrator hesabı. Bu hesap bütün kancaları atlar. Günlük işte kullanılmaz. API anahtarı almaz. Karar uçları bu hesabı da reddeder." | F6 |
| E8 | 5.1, Cihaz kaydının notu | "Uygulamanın giriş kancası anahtarı Cihaz kaydına bağlar ve yalnız iki uca izin verir." | Aynı cümle kalır. Arkasına şunlar eklenir: "Giriş kancası argüman almaz. Anahtarı istek başlığından okur. İptal edilen cihazda hata fırlatır. Cihaz kaydı `api_key` ve `api_secret` alanı taşımaz." | F24-F26 |
| E9 | 9.3, güvenlik tablosu | Sunucu betiği için satır yok. | Yeni satır: "Sunucu betikleri. Kurum sitelerinde `server_script_enabled` açılmaz. Liste koşulu ekleyen 'Server Script' kaydı bulunmaz." | F10 |
| E10 | 11.1, 8. iş | "Kurum açma adımlarını yazar." | Aynı cümle kalır. Arkasına şunlar eklenir: "Adımlar MCP ucunu kapatır. Sunucu betiklerini kapalı bırakır. 'Administrator' hesabına API anahtarı vermez. Bitiş ölçütü: yeni sitede `/api/v2/mcp` 404 döner." | F29-F31, F6, F10 |
| E11 | 11.3, sağlık sonucu listesi | Sağlık sonucu dört işlemle ölçülür. | Beşinci işlem eklenir: "MCP ucunun 404 dönmesi." | Yükseltme yaması ucu açabilir. |
| E12 | 12, 4. adım | Kabul ölçütleri listesi | Şu ölçütler eklenir: "Kanca `ptype` alıyor. Üye olmayan kişi için liste kancası boş dönmüyor. 'Administrator' karar kaydedemiyor. Sınırı değiştiren kişi inceleyemiyor. Yükseltmeden sonra MCP ucu 404 dönüyor." | Bölüm 8'deki testler |

### Roller

| No | Bölüm | Bugünkü cümle | Önerilen cümle | Neden? |
|---|---|---|---|---|
| E13 | 3.5, Danışman satırı | "Tek kurucunun ikinci görüş alabilmesi için gerekir." | "İkinci görüş gereken işlerde tek kurucuya gerekir. Bu işler 'İlerle' dışına çıkmak ve sınır artırmaktır." | Codex'in görüşü daha güçlü dayanaktadır. |
| E14 | 3.5, "İkinci görüş kuralı değişiyor" paragrafı | "Bu yüzden tek kurucu plana bir danışman ekler." | "Tek kurucu bu iki işe ihtiyaç duyarsa plana bir danışman ekler. Diğer işlerde danışman isteğe bağlıdır." | Aynı neden |
| E15 | 14, 1. madde | "Tek kurucu plana bir danışman ekler." | "Danışman genel şart değildir. Yalnız bağımsız inceleme isteyen işte gerekir. Kararı ürün sahibi verir." | Aynı neden |
| E16 | 3.5, Kurum yöneticisi satırı | "Kullanıcı ekler. Cihaz iptal eder." | Aynı cümleler kalır. Arkasına şu cümle eklenir: "Bu rol karar ve yatırım yetkisi vermez." | OECD ilkeleri, Codex madde 7.4 |

## 11. Derin rapora göre ne değişti?

| Konu | Derin rapor | Bu rapor |
|---|---|---|
| Hindistan denemesi | Arama özetinden. "Yarısı bırakıldı." | Tam okundu. Puan 0,25, 0,60 ve 0,46. Kazancın yüzde 40'ı kayboldu. Bırakma nedenlerinin sayıları yazıldı. |
| Meksika denemesi | Okunmadı. | Tam okundu. Sonraki beş yılda çalışan sayısı yüzde 57, ücret toplamı yüzde 72 yüksek. Yüzde 46,3 "param yok" dedi. |
| OKR vakası | "Her hafta yaklaşık 15 dakika." | 15 dakika vakaya ait değil. Görüşmeler 7. ve 8. haftada yapıldı. |
| Prosci | "Yüzde 73 ile yüzde 29" çıkarıldı. | Rakam Prosci'nin kendi özetinde bulundu. Satıcı etiketiyle geri geldi. |
| Hizmet payı | Yüzde 15 sınırı, ikinci el kaynak | Workday 10-K: hizmet yüzde 9,9 zarar etti. |
| Gainsight | "İki katı emek" | Oranlar büyük ABD şirketlerinden. Bir kişi yaklaşık 70 müşteri ilk tavandır. |
| Kapasite Geliştirme | "Firma başına kredi" | KOSGEB kredi vermez. Banka kredisinin faizine 20 puan destek verir. |
| Kalkınma ajansları | "Çoğunlukla odaya gider." | OKA'da tek şirket de başvurur. OKA 400.000 TL, FKA 450.000 TL. |
| IAF | Ücret ve süre çelişiyordu. | 2026 yolu: 500 dolar, sonra 2.000 dolar. Dört yıl geçerli. |
| BSI | 2.700 ve 1.800 dolar | 2.955, 1.970 ve 4.925 dolar |
| Logo | 800 ile 1.000 çelişkisi | 800 eski bir paragraftan geliyor. Doğrusu 1.000'den fazla. |
| Oso | Lisans denetlenmedi. | Açık kaynak kütüphane arşivlendi. |
| Pilot kabulü | Puanlı liste | Altı ölçüt ve "Eksikse ne yapılır?" sütunu |
| Tek kurucu | Danışman şart | Danışman yalnız bağımsız inceleme isteyen işte gerekir. |
| MCP ucu | "Kapalı kalır." | Varsayılan açık. Yükseltme de açar. Kurulum kapatır, test doğrular. |
| Liste koşulu | Kanca daraltır. | Boş dönüş bütün tabloyu açar. Her zaman yanlış koşul döner. |
| Kanca argümanı | Belirtilmedi. | Belge `permission_type` der, kod `ptype` gönderir. |
| `None` değişikliği | Kaydı bulunamadı. | Kayıt 5ef8577, 10 Ocak 2024 Çarşamba günü. Bütün kancalar `True` dönmeli. |
| Kendi kaydını onaylama | Yalnız role bağlı denildi. | Varsayılan serbest. Yalnız oluşturana bakar. Kural yetki işlevinde. |
| "Administrator" | Yoktu. | Bütün kancaları atlar. Karar uçları reddeder. |
| Paylaşım | Dört önlem | Beş önlem. Tek işlev `doc_events` ile bağlanır. "Herkes" satırı da aranır. |
| Giriş kancası | "Her istekte çalışır." | Argümansız çağrılır. Hata fırlatmak zorundadır. |

## 12. Önerileri ne değiştirir?

### Hizmet ve ortaklık

| Bu durum görülürse | Öneri şöyle değişir |
|---|---|
| Müşterilerin çoğunda iç stratej çıkar. | Pilot isteğe bağlı olur. Kendi kendine kurulum öne çıkar. |
| Pilot sonrası ritim ortak olmadan da sürer. | Üç aylık ortak toplantısı isteğe bağlı olur. |
| Ritim ortağa rağmen ölür. | Bildirim yedinci modül olarak eklenir. Etkin plan eşikleri yeniden ayarlanır. |
| Karar sahibi değişimi yenilemeyi etkilemez. | Ortak görüşmesi tetikleyici olmaktan çıkar. |
| Danışmanlar ürünü rakip görür. | Ortak programı küçülür. Toplantıları sizin ekibiniz yürütür. Kurulum ücreti yeniden hesaplanır. |
| Ölçülen destek saati ayda 2 saatin çok üstünde kalır. | Fiyat ya da kurulum ücreti yeniden hesaplanır. Ortağın payı büyür. |
| Kendi hizmetiniz zarar etmeye başlar. | Toplantı yürütme işi tümüyle ortağa geçer. |
| Mali müşavir kanalı daha çok müşteri getirir. | Danışman tanışma eğitimi genişler. Ücretsiz danışman ekranı öne alınır. |
| KOSGEB strateji danışmanlığı için destek satırı açar. | Pilot o satırın kurallarına göre paketlenir. Ortak sertifikası o kurallara bağlanır. |
| Pilotlarda koçluk alma oranı yüzde 60'tan çok düşük çıkar. | Ortak hizmeti satış paketinden çıkar. İsteğe bağlı olur. |

### Yetki

| Bu durum görülürse | Öneri şöyle değişir |
|---|---|
| Gerçek kurulumdaki test farklı bir denetim sırası gösterir. | Kayıt denetimi ve paylaşım önlemi teste göre yeniden yazılır. |
| Frappe MCP ayarının varsayılanını kapalı yapar. | Kurulum adımı yine kalır. 404 testi yine çalışır. |
| Frappe belgesi `ptype` adını düzeltir. | Değişiklik gerekmez. İmza testi kalır. |
| Frappe `None` davranışını geri değiştirir. | Kanca yine açık `True` ve `False` döner. Bu yazım iki sürümde de doğrudur. |
| Frappe OAuth kapsamını uçlarda denetlemeye başlar. | Cihaz iptali kapsamla da desteklenir. Giriş kancası yine kalır. |
| Bir müşteri MCP ucunu ister. | Önce karar türlerinin kapalı olduğu testle kanıtlanır. Uç yalnız o kurumda açılır. 404 testi o kurum için istisnaya alınır. |
| Holding müşterisi gelir. | Ayrı bir ReBAC servisi yeniden düşünülür. |

## 13. Karar bekleyen konular

| No | Konu | Önerimiz | Kim karar verir? |
|---|---|---|---|
| 1 | Tek kurucu için danışman şartı | Genel şart olmasın. Yalnız "İlerle" dışına çıkma ve sınır artırma işinde gereksin. | Ürün sahibi |
| 2 | Karar sahibi ayrılınca yeni atamayı kim yapar? | Bölüm 2'deki beş adımlı öneri | Ürün sahibi |
| 3 | Pilot kabul tablosu | Altı ölçüt ve "Eksikse ne yapılır?" sütunu kullanılsın. | Ürün sahibi |
| 4 | Plan sağlığı listesinin satıcıya gönderilmesi | Yalnız tarih ve sayı gönderilsin. Müşteri sözleşmesine yazılsın. | Ürün sahibi ve hukukçu |
| 5 | Ortak payı | İlk yıl yalnız yönlendirme. Pay yüzde 20, en çok yüzde 25. Pilotlarda sınansın. | Ürün sahibi |
| 6 | Sertifika fiyatı | İlk ortak görüşmelerinden sonra seçilsin. Çapa 599 ile 4.925 dolar arası. | Ürün sahibi |
| 7 | Ortağın KVKK rolü | Sözleşmede yazılsın. | Hukukçu |
| 8 | UUIDv5 ad alanı sabiti | API sözleşmesine yazılsın. TypeScript ve Python aynı örnekle sınansın. | Geliştirme ekibi |

## Sonuç

Bu araştırma iki şeyi değiştirdi. Birincisi hizmetin hedefidir. Hindistan denemesi kaybın en büyük nedenini sayıyla gösterdi. Bu neden yönetici değişimidir. Karar Atlası bu anı zaten tek bir olayla kaydeder. Hizmet modelinin işi, bu olayı aynı hafta bir insana ulaştırmaktır. Meksika denemesi de bir şey ekler. Doğru danışman, destek bitince de ücretli devam edebilir. Bu, üç aylık ortak toplantısının iş modelini destekler.

İkincisi yetki tasarımının bakış açısıdır. Önceki tasarım "bizim kodumuz ne yapmalı?" diye sordu. Bu tur başka bir soru sordu: "Frappe kendiliğinden ne açıyor?" Cevap üç yer gösterdi. MCP ucu açık doğar. Boş liste koşulu tabloyu açar. "Administrator" hesabı kancaları atlar. Bu yüzden güvenlik bir kez kurulmaz. Güvenlik her kurulumda ve her sürüm yükseltmede yeniden yazılır. Sonra testle kanıtlanır.

## Kaynaklar

### Ürün belgeleri

- [Bütünleşik geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md)
- [Belge haritası](../docs/belge-haritasi.md)
- [Geliştirme karar notları](../docs/gelistirme-karar-notlari.md)
- [Derin gelir modeli analizi](<Derin gelir modeli analizi.md>)
- [Derin hizmet ve yetki modeli, önceki rapor](<Derin hizmet ve yetki modeli.md>)
- [Doğrulama notları](<../research_notes/Doğrulanmış hizmet ve yetki modeli/hizmet_ve_yetki_dogrulama.md>)
- [Derin hizmet ve yetki modeli notları](<../research_notes/Derin hizmet ve yetki modeli/>)
- [Codex belgelerinden alınanlar](<../research_notes/Codex belgelerinden alınanlar/codex_aktarim_listesi.md>)

### Danışmanlık ve benimseme

- [Hindistan denemesinin sekiz yıl sonrası, AEJ Applied Economics 12(2), 2020](https://www.aeaweb.org/doi/10.1257/app.20180369)
- [NBER w24249, aynı çalışmanın çalışma metni](https://www.nber.org/papers/w24249)
- [Journal of Political Economy 126(2), 2018, Meksika denemesi](https://dspace.mit.edu/handle/1721.1/121090)
- [IPA, Meksika denemesinin tam metni](https://poverty-action.org/sites/default/files/publications/The-Impact-of-Consulting-Services-on-SME_Schoar-et-al_March2018.pdf)
- [Journal of Business Strategy 47(1), OKR vaka çalışması](https://www.emerald.com/jbs/article/47/1/52/1311605/Engaging-the-entire-organization-how-OKRs-enhance)
- [Prosci 11. araştırma özeti, 2020](https://www.prosci.com/hubfs/2.downloads/research-executive-summaries/11th%20Edition-Best-Practices-Executive-Summary-11-2020.pdf)
- [Prosci 12. araştırma özeti, 2023](https://prosci.com/hubfs/Website_English/2.downloads/webinars/EN-EUR%20Webinar/Best-Practices-in-Change-Management-12th-Edition-Executive-Summary.pdf)
- [Forbes Türkiye, 4 Şubat 2026](https://www.forbes.com.tr/dergi/kurucular-temkinli-ikinci-kusak-hizli-dijital-donusum-gerilim-yaratiyor)
- [OECD G20 kurumsal yönetim ilkeleri, 2023](https://www.oecd.org/en/publications/g20-oecd-principles-of-corporate-governance-2023_ed750b30-en/full-report/component-8.html)

### Satıcılar, hizmet ve müşteri başarısı

- [Workday 10-K, 31 Ocak 2026 mali yılı](https://www.sec.gov/Archives/edgar/data/1327811/000132781126000014/wday-20260131.htm)
- [Gainsight, müşteri başarı sorumlusu oranı, 2022](https://www.gainsight.com/blog/gainsight-horizon-ai-labs-what-is-the-right-csm-to-customer-ratio/)
- [Gainsight, 2025 verisi](https://www.gainsight.com/blog/what-customer-success-teams-are-prioritizing-in-2026-and-what-the-data-shows-is-working/)
- [The Innovator, StrategyFrame](https://theinnovator.news/?p=11868)
- [it-daily, StrategyFrame fiyatı](https://www.it-daily.net/it-management/projekt-personal/ki-plattform-ersetzt-mckinsey-co-fuer-einen-bruchteil-der-kosten)
- [Cascade, ortaklar](https://www.cascade.app/partners)
- [Logo, 31 Mart 2026 ara dönem raporu](https://cdn.logo.com.tr/Files/logocomtr/Uploads/Documents/Faaliyet-Raporu-31-Mart-2026.pdf)
- [Logo, 31 Mart 2025 ara dönem raporu](https://cdn.logo.com.tr/files/logocomtr/Uploads/Documents/Faaliyet_Raporu_31_Mart_2025.pdf)
- [Paraşüt, mali müşavir kanalı](https://www.parasut.com/mali-musavir-kanali)

### Sertifika

- [WorkBoard, OKR koç sertifikası](https://learn.workboard.com/page/okr-coach-certification)
- [WorkBoard, 2. düzey sertifika](https://learn.workboard.com/page/advanced-okr-coach-certification)
- [IAF, mesleki gelişim yolu](https://www.iaf-world.org/professional-development/)
- [IAF, ücret listesi, 12 Mart 2026](https://iaf-world.org/pd-fees-list-and-policy-20260312/)
- [IAF, yenileme](https://iaf-world.org/get-recertified/)
- [Balanced Scorecard Institute, BSP programı](https://balancedscorecard.org/training-certification/bsp-balanced-scorecard-professional/)

### Kamu destekleri

- [KOSGEB YÖNDE yönergesi, 3. revizyon](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/YONDE/2026/2026.07.14/Y%C3%96NDE-Y%C3%B6nderlikveDe%C4%9FerlendirmeDestekProgram%C4%B1Y%C3%B6nergesi05.07.26.pdf)
- [KOSGEB Kapasite Geliştirme Başvuru Kılavuzu v2.1](https://webdosya.kosgeb.gov.tr/Content/Upload/Dosya/KAPAS%C4%B0TE%20GEL%C4%B0ST%C4%B0RME/2026/2026.08.21/Kapasite_Gelis%CC%A7tirme_Destek_Program%C4%B1_Bas%CC%A7vuru_K%C4%B1lavuzu_v2.1.pdf)
- [OKA, 2026 teknik destek rehberi](https://oka.gov.tr/assets/upload/dosyalar/tr83-26-td-tur_-basvuru-rehberi.pdf)
- [FKA, 2026 teknik destek rehberi](https://fka.gov.tr/sharepoint/userfiles/Icerik_Dosya_Ekleri/2026_TD_Basvuru_Rehberi/2026_TD_Ba%C5%9Fvuru_Rehberi.pdf)

### Frappe 16 kaynak kodu, v16.56.0

- [`permissions.py`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/permissions.py)
- [`database/query.py`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/database/query.py)
- [`model/document.py`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/document.py)
- [`model/workflow.py`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/workflow.py)
- [`workflow_transition.json`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/workflow/doctype/workflow_transition/workflow_transition.json)
- [`model/naming.py`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/model/naming.py)
- [`auth.py`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/auth.py)
- [`share.py`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/share.py)
- [`core/doctype/docshare/docshare.py`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/core/doctype/docshare/docshare.py)
- [`core/doctype/system_settings/system_settings.json`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/core/doctype/system_settings/system_settings.json)
- [`patches.txt`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/patches.txt)
- [`migrate.py`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/migrate.py)
- [`mcp/__init__.py`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/mcp/__init__.py)
- [`utils/safe_exec.py`](https://github.com/frappe/frappe/blob/49789a1711d4dde2be9c6888efe35651465f4b64/frappe/utils/safe_exec.py)
- [`permissions.py`, version-15, karşılaştırma için](https://github.com/frappe/frappe/blob/2e9ecdc03fa5b5b8d1ba05224a1aff7dad832bd0/frappe/permissions.py#L455-L473)
- [Kod kaydı 5ef8577](https://github.com/frappe/frappe/commit/5ef8577cffe4f9ff8ca948f0320e88c58a042750)
- [Kod kaydı 553eeca](https://github.com/frappe/frappe/commit/553eeca997c6eb73842d93f7b629b221be311525)
- [Frappe 16 geçiş rehberi](https://github.com/frappe/frappe/wiki/Migrating-to-version-16)
- [Frappe kanca belgesi](https://docs.frappe.io/framework/user/en/python-api/hooks)

### Yetki motorları

- [Open edX, teknoloji seçimi karar kaydı 0004](https://docs.openedx.org/projects/openedx-authz/en/latest/decisions/0004-technology-selection.html)
- [cedar-py](https://github.com/k9securityio/cedar-py)
- [cedarpy, PyPI](https://pypi.org/project/cedarpy/)
- [Oso'nun arşivlenmiş deposu](https://github.com/osohq/oso)
- [Oso, yerel yetki belgesi](https://www.osohq.com/docs/authorization-data/local-authorization)

## Denetim notu

Bu notu Claude 16 Kasım 2026 Pazartesi günü yazdı.

1. Denetim betiği bu rapor üzerinde çalıştırıldı. Betiğin adı `yalin-turkce-denetim.mjs`'dir.
2. Betik 15 kelimeyi aşan üç açıklama buldu. Bu cümleler bölündü.
3. Betik 11 ile 15 kelimelik cümleleri işaretledi. Bu cümleler tek tek okundu. Hepsi açıklamadır, talimat değildir.
4. Uzun kelime uyarıları incelendi. "Sertifikalı", "danışmanlığı" ve "Administrator" gibi kelimeler raporun konusudur. "Administrator" Frappe'deki hesabın adıdır ve değiştirilemez.
5. Kod bloklarında kodun kendi sözdizimi korundu. Kod içindeki İngilizce adlar Frappe'nin adlarıdır.
6. Metinde noktalı virgül, uzun çizgi, ok işareti ve fikir bağlayan eğik çizgi arandı. Kod blokları dışında hiçbiri bulunmadı.
7. Metinde "stratej" kelimesinin yanlış uzun yazımı arandı. Bu yazım bulunmadı.
8. Rapor herkese açık bir depoya girer. Raporda özel bir kişinin adı yoktur. DevOps görevlisi rol adıyla anıldı.
9. Üç bilgi bu turda kaynağın kendisinden yeniden okundu. Bunlar Workday tutarları, Meksika'daki 57 ve 72 yüzdeleri ve 19 müşterinin 13'üdür.
10. Önceki rapordaki tam okunmamış kaynaklar çıkarıldı. Örneğin hizmet payı için yüzde 15 oranı ve bazı satıcı blogları.
11. Bütün sıklıklar, eşikler, süreler, paylar ve sertifika koşulları hipotezdir.
12. Frappe kodu okundu ama çalıştırılmadı. Testler geliştirmenin 4. adımında gerçek kurulumda çalışır.
13. Belge haritası ve bütünleşik geliştirme raporu bu iş sırasında değiştirilmedi.

Gerçek okurla denenmedi.
