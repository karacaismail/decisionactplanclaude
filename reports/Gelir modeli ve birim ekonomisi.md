# Bu ürün üç koşulla para kazandırır

> **Güncellik notu, 16 Kasım 2026 Pazartesi günü.** Bu rapor tarihseldir. Yerini [Derin gelir modeli analizi](<Derin gelir modeli analizi.md>) aldı. Güncel bilgi için o rapora bakın.

**Kısa cevap.** Ürün para kazanabilir. Ama bu üç koşula bağlıdır. Birinci koşul fiyattır. Şirket başına ayda en az 15.000 TL istemelisiniz. İkinci koşul yapay zekâ kotasıdır. Sınırsız yapay zekâ kârı yer. Üçüncü koşul destek sınırıdır. Müşteri başına ayda yaklaşık 2 saat yeterli olmalı. Sunucu maliyeti sorun değildir. Bir müşterinin sunucu payı ayda 1 ile 3 dolar arasıdır (tahmin). Asıl gider ekibin maaşıdır. Bu gider araştırılmadı ve en büyük bilinmeyendir. Temel senaryoda yaklaşık 100 ücretli şirket 5 ile 6 kişilik ekibi taşır. Müşteri tarafında da cevap koşulludur. Ürün büyük kararda kendini öder. Kararın parası en az 20 ile 30 milyon TL olmalıdır (tahmin). Daha küçük kararda ürünün parası geri dönmeyebilir.

## Bu raporu nasıl okursunuz?

Bu rapor 15 Kasım 2026 Pazar günü yazıldı. Rapor iki soruyu cevaplar:

1. Ürünü satan şirket para kazanır mı?
2. Ürünü alan müşteri para kazanır mı?

Yeni web araştırması yapılmadı. Dış bilgiler araştırma notlarından gelir. Fiyatların görüldüğü tarih 15 Kasım 2026 Pazar günüdür. Başka tarih varsa ilgili yerde yazar.

### Döviz kuru

Bütün çeviriler tek bir kurla yapıldı. TCMB, Türkiye Cumhuriyet Merkez Bankası'dır. Bu kur TCMB'nin 11 Kasım 2026 Çarşamba günkü gösterge satış kurudur ([Foreks, TCMB kurları](https://www.foreks.com/haber/detay/6af45fcc5f5f43016edfe8dc/FRKS/tr/tcmbnin-belirledigi-alis-satis-kurlari-dolar-50-1379-50-2282-euro-55-8804-55-9810-11-11-26/)).

| Para | Kur | Metinde yuvarlanmış hâli |
|---|---|---|
| 1 dolar | 50,2282 TL | 50,2 TL |
| 1 avro | 55,9810 TL | 56,0 TL |
| 1 avro | 1,1145 dolar | 1,11 dolar |

12 ile 15 Kasım arasındaki kurlar bulunamadı. Lira 2026'da değer kaybetti. Dolar 31 Aralık 2025 Çarşamba günü 42,85 TL idi ([erp-software.org](https://erp-software.org/en/erp-worldwide/turkey/)). Dolar 11 Kasım 2026 Çarşamba günü 50,23 TL oldu. Bu, yaklaşık yüzde 15'lik bir kayıptır (tahmin).

### Bilginin türü

Her sayının yanında türü yazar. Türler şunlardır:

| Tür | Anlamı | Örnek |
|---|---|---|
| Yayımlanmış fiyat | Satıcının kendi sayfasındaki fiyat | Hetzner sunucu fiyatı |
| Üçüncü taraf | Başka bir sitenin aktardığı fiyat ya da ölçüt | Türk sunucu fiyat karşılaştırması |
| Kanıt | Kaynağı olan araştırma bulgusu | McKinsey'in karar çalışması |
| Tahmin | Kaynaklı sayılardan yaptığımız hesap | Müşteri başına sunucu payı |
| Varsayım | Kaynağı olmayan model girdisi. Sınanmalıdır. | Bir sunucudaki site sayısı |
| Çıkarım | Bulgulardan çıkardığımız yorum | Kişi başı fiyatın uymaması |

### Ürünün bugünkü durumu

Ürünü bugünkü hâliyle bilerek okuyun. Canlı sürüm yalnız tarayıcıda çalışır. Sunucu sürümü tasarlandı ama yazılmadı. Yapay zekâ özelliği de bugün üründe yoktur. Bu yüzden rapordaki yapay zekâ maliyeti bir plandır. Ürün, yapay zekâ kapalıyken de tam çalışmalıdır.

Ürünün altyapı kararları bütünleşik geliştirme raporundadır ([geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md)). Bu rapor üç karara dayanır:

1. Her kurum ayrı bir Frappe sitesinde ve ayrı veritabanında çalışır.
2. Güncellemeler her gece 02.30 ile 04.00 arasında dalgalarla yapılır.
3. Ön yüz, arka yüz ve sözleşmeler tek bir public depoda durur.

## Terimler

Bu terimler raporda sık geçer. Her terimin anlamı aşağıdadır.

| Terim | Anlamı |
|---|---|
| SaaS | İnternetten kiralanan yazılım. Müşteri yazılımı kurmaz, abone olur. |
| Birim ekonomisi | Tek bir müşteriden ne kazandığınızı gösteren hesap |
| Aylık tekrarlayan gelir | Bütün abonelerden her ay düzenli gelen para. Kısaltması MRR'dir. |
| Müşteri başına aylık gelir | Aylık tekrarlayan gelirin müşteri sayısına bölümü |
| Değişken maliyet | Her yeni müşteriyle artan maliyet. Örneğin yapay zekâ ücreti. |
| Sabit gider | Müşteri sayısı değişse de ödenen gider. Örneğin ekip maaşı. |
| Brüt kâr marjı | Gelirden doğrudan hizmet maliyeti çıkınca kalan payın yüzdesi |
| Katkı payı | Bir müşterinin aylık gelirinden ona ait bütün maliyetler çıkınca kalan para |
| Başa baş noktası | Gelirin bütün giderleri tam karşıladığı nokta. Bu raporda müşteri sayısıyla ölçülür. |
| Müşteri kayıp oranı | Bir yılda aboneliği bırakan müşterilerin yüzdesi |
| Müşteri kazanma maliyeti | Bir yeni müşteri için harcanan satış ve pazarlama parası |
| Geri ödeme süresi | Müşteri kazanma maliyetinin kaç ayda geri döndüğü |
| Ömür boyu katkı | Bir müşterinin abone kaldığı sürece bıraktığı toplam katkı payı |
| Net gelir tutma | Eski müşterilerden bir yıl sonra kalan gelirin başlangıç gelirine oranı. Ek satış da sayılır. |
| Kota | Bir pakete dahil olan kullanım miktarı. Örneğin ayda 150 yapay zekâ işlemi. |
| Uzaktan güncelleme | Telefondaki uygulamanın mağazaya gitmeden yenilenmesi |
| Lisans | Kodu başkalarının hangi şartla kullanabileceğini söyleyen hukuki metin |
| Stratej | Stratejiyi geliştiren kişinin unvanı. Yazım hatası değildir. |

## A. Şirket için: 15.000 TL'lik fiyat kârı taşır

Bu bölüm satıcı şirketin hesabıdır. Önce maliyetler gelir. Sonra fiyat, lisans ve senaryolar gelir.

### A1. Bir müşterinin sunucu payı ayda 1 ile 3 dolardır

**Kanıt.** Frappe'nin kendi belgesi bir kurulum için en az 400 MB bellek söyler. İşçi süreci, istekleri karşılayan küçük programdır. Az trafikli küçük siteler için 2 işçi süreci yeterlidir ([Frappe Cloud belgesi](https://docs.frappe.io/cloud/servers/guidelines-for-choosing-a-server-plan)). Aynı kurulumdaki siteler bu süreçleri paylaşır. Belge, bir sunucuya en çok kaç site sığdığını söylemez. Forumda 32 GB'lık sunucu için 3 ile 30 site denir ([Frappe forumu](https://discuss.frappe.io/t/how-many-sites-can-my-server-handle-efficiently/142670)). Bu sayı ERPNext içindir. ERPNext, Frappe üzerinde çalışan bir şirket yönetim yazılımıdır. Bu sayı bir görüştür, ölçüm değildir.

**Fiyatlar.** Hetzner, Almanya merkezli bir sunucu kiralama şirketidir. Aşağıdaki fiyatlar aylıktır. KDV hariçtir.

| Hizmet | Fiyat | Tür |
|---|---|---|
| Hetzner CCX23, Helsinki, 4 işlemci, 16 GB | 73,49 avro (yaklaşık 4.114 TL) | Yayımlanmış fiyat ([Hetzner](https://www.hetzner.com/cloud/general-purpose)) |
| Hetzner CCX23, Nürnberg | 86,49 avro | Yayımlanmış fiyat ([Hetzner](https://www.hetzner.com/cloud/general-purpose)) |
| Frappe Cloud site planı | 5 dolardan başlar | Yayımlanmış fiyat ([Frappe Cloud](https://frappe.io/cloud/pricing)) |
| Frappe Cloud sunucu planı | 40 dolardan başlar | Yayımlanmış fiyat ([Frappe Cloud](https://frappe.io/cloud/pricing)) |
| Türkiye'de 8 GB'lık sanal sunucu | 250 ile 470 TL arası | Üçüncü taraf ([karekod.org](https://www.karekod.org/blog/en-ucuz-vds-fiyatlari/)). Tarihi belirsiz. |
| Türkiye'de 4 işlemci, 8 GB, Burti NET | 37,09 dolar | Üçüncü taraf ([whtop](https://www.whtop.com/tr/plans/burtinet.com/143115)) |

Türk sunucularının 250 ile 300 TL'lik fiyatı eski ya da kampanya fiyatı olabilir. Bu fiyatlara güvenmeyin.

**Hetzner 2026'da zam yaptı.** Haziran 2026'da bazı sınıflarda artış yüzde 113 ile 176 arasıydı ([Findstack](https://findstack.com/resources/hetzner-price-increase-2026), [wz-it](https://wz-it.com/en/blog/hetzner-price-increase-june-2026-cpx-ccx-alternatives/)). Bu bilgi üçüncü taraftandır. Hetzner'in resmî zam sayfası açılmadı. Hetzner'in Türkiye'de veri merkezi de yoktur ([Hetzner](https://www.hetzner.com/cloud)).

**Hesap (tahmin).** Sunucunun dolar fiyatı şöyle bulunur: 73,49 avro × 1,1145 = 81,91 dolar. Müşteri başına pay şu formülle bulunur:

> Müşteri başına sunucu payı = 81,91 dolar ÷ sunucudaki site sayısı

| Sunucudaki site sayısı (varsayım) | Müşteri başına aylık pay |
|---|---|
| 25 site | 3,28 dolar (yaklaşık 165 TL) |
| 60 site | 1,37 dolar (yaklaşık 69 TL) |
| 120 site | 0,68 dolar (yaklaşık 34 TL) |

Yedek, e-posta, izleme ve sertifika da eklenir. Bunlar müşteri başına ayda 0,7 ile 1,5 dolardır (tahmin). Let's Encrypt sertifikası ücretsizdir.

**Sabit altyapı (varsayım).** Frappe Press, siteleri açan ve güncelleyen yönetim aracıdır. Press kendi sunucularını ister. Veritabanı, deneme ortamı ve yedek deposu da gerekir. Bu taban ayda 250 ile 450 dolardır. Bu taban ilk müşteriden önce ödenir. Yaklaşık 100 müşteriye kadar altyapı giderinin büyük kısmı bu tabandır.

**Çıkarım.** Her kuruma ayrı site doğru seçimdir. Ortak veritabanı müşteri başına ayda en çok 0,5 ile 2 dolar kazandırır (tahmin). Bu fark fiyatın yanında çok küçüktür. Ayrı site, müşteri başına yedeği ve silmeyi kolaylaştırır. Bu KVKK işinde işe yarar. Ayrı site, bir müşteriyi Türkiye'deki bir sunucuya koymayı da kolaylaştırır.

**Çıkarım.** Ayrı sitenin asıl bedeli yayın süresidir. Her güncellemede her sitenin veritabanı ayrı güncellenir. 200 site sırayla güncellenirse iş 3 ile 10 saat sürer (tahmin). Formül şudur: site sayısı × site başına 1 ile 3 dakika. Gece yayın penceresi ise 90 dakikadır. Bu yüzden siteler paralel dalgalarla güncellenmelidir. DevOps sorumlusu bu süreyi gerçek site sayısıyla ölçmelidir. Bu ölçüm geliştirme raporunda 20. DevOps işidir.

**Veri yeri.** Hetzner'de veri Almanya ya da Finlandiya'da durur. KVKK, Kişisel Verilerin Korunması Kanunu'dur. KVKK'ya göre yurt dışı aktarımda standart sözleşme imzalanır. Sözleşme 5 iş günü içinde Kurula bildirilir ([KVKK duyurusu](https://www.kvkk.gov.tr/Icerik/8170/Yurt-Disina-Kisisel-Veri-Aktariminda-Kullanilacak-Standart-Sozlesmelerde-Dikkat-Edilmesi-Gereken-Hususlara-Iliskin-Kamuoyu-Duyurusu)). Türkiye'de barındırmayı ek ücretli bir seçenek yapın. Türkiye'deki site payı Hetzner'in 2 ile 4 katı olabilir (varsayım).

### A2. Yapay zekâ kotayla müşteri başına ayda 18 dolarda kalır

**Kanıt.** Anthropic'in liste fiyatları milyon kelime parçası başınadır ([Anthropic fiyatları](https://platform.claude.com/docs/en/about-claude/pricing)). Kelime parçası, modelin metni böldüğü küçük birimdir. Fiyatlar notlarda 15 Kasım 2026 Pazar günü kaydedildi.

| Model | Girdi | Çıktı | Tür |
|---|---|---|---|
| Opus 5.5 | 4 dolar | 20 dolar | Yayımlanmış fiyat |
| Sonnet 5.5 | 2 dolar | 10 dolar | Yayımlanmış fiyat |
| Haiku 5.5 | 0,10 dolar | 0,50 dolar | Yayımlanmış fiyat |

Toplu işlemde yüzde 50 indirim vardır. AB bölgesi gibi bölgesel uçlarda fiyat yüzde 10 artar. Uç, hizmetin dışarıya açtığı adrestir.

**Bir işin maliyeti (tahmin).** Bir taslak yazma işi yaklaşık 0,04 dolar tutar. Bir itiraz turu, yani kararı zorlayan sorgulama, 0,07 dolar tutar. Bir araştırma özeti 0,14 dolar tutar. Ajanla yapılan uzun araştırma 10 kat daha çok harcayabilir.

**Müşteri başına aylık maliyet (tahmin).** Bir müşteri, bir karar üzerinde çalışan 5 ile 15 kişilik şirkettir.

| Kullanım | Hesap | Aylık maliyet |
|---|---|---|
| Hafif | 30 iş × 0,10 dolar | 3 dolar (yaklaşık 151 TL) |
| Olağan | 150 iş × 0,12 dolar | 18 dolar (yaklaşık 904 TL) |
| Yoğun | 600 iş × 0,15 dolar + 10 uzun araştırma × 1,50 dolar | yaklaşık 105 dolar (yaklaşık 5.274 TL) |

Ön bellek kullanılırsa yoğun kullanım 40 ile 60 dolara iner. Ön bellek, aynı şirket bilgisini her seferinde yeniden göndermemektir. Basit işler Haiku'ya yönlendirilirse maliyet daha da düşer.

**Piyasa nasıl fiyatlıyor?** Perdoo pakete yapay zekâ kotası koyar. Premium pakette ayda 250.000 kelime parçası vardır ([Perdoo](https://www.perdoo.com/pricing)). WorkBoard ajanlarını kullanıma göre fiyatlar ([Business Wire, 27 Mayıs 2025 Salı günü](https://www.businesswire.com/news/home/20250527067665/en/WorkBoard-Announces-General-Availability-of-Its-Digital-Chief-of-Staff-and-Leadership-Coach-Agents-and-Expanded-Capabilities-for-Microsoft-365-Copilot-Agent)). Bir blog, SaaS şirketlerinin yüzde 64 ile 67'sinin kısmen kullanıma göre ücret aldığını aktarır ([Falkster](https://falkster.com/blog/the-credit-is-the-new-seat)). Bu kaynak ikinci eldir.

**Çıkarım.** Kota ile sınırsız kullanım arasındaki fark büyüktür. Kota müşteri başına maliyeti 18 dolarda tutar. Sınırsız kullanım bu maliyeti 60 doların üstüne çıkarabilir. Yapay zekâ en çok kararın ilk 2 ile 4 ayında kullanılır. Uygulama döneminde kullanım düşer.

### A3. Mobil maliyet küçük ve sabittir

| Kalem | Fiyat | Tür |
|---|---|---|
| Apple geliştirici hesabı | Yılda 99 dolar | Üçüncü taraf ([Adalo](https://studio.adalo.com/blog/apple-developer-program-guide)) |
| Google Play hesabı | Bir kez 25 dolar | Üçüncü taraf ([Capgo rehberi](https://capgo.app/blog/how-to-create-apple-developer-and-google-play-developer-accounts/)) |
| Capgo uzaktan güncelleme, Solo paket | Ayda 14 dolar, 2.000 aylık kullanıcı | Yayımlanmış fiyat ([Capgo](https://capgo.app/pricing/)) |
| Capgo, Maker paket | Ayda 39 dolar, 10.000 aylık kullanıcı | Yayımlanmış fiyat ([Capgo](https://capgo.app/pricing/)) |
| Capawesome, yalnız uzaktan güncelleme | Ayda 9 dolardan başlar | Yayımlanmış fiyat ([Capawesome](https://capawesome.io/cloud/pricing/)) |

Apple ve Google'ın kendi sayfaları açılmadı. Örnek olarak 100 müşteri ve 10'ar kullanıcı alalım. Uzaktan güncelleme ayda 9 ile 14 dolar tutar (tahmin). Modelde mobil için ayda sabit 25 dolar kullanıldı (tahmin). Mobilin asıl maliyeti ücret değil, mühendis zamanıdır. Örneğin her mağaza sürümü iki ayrı incelemeden geçer.

### A4. Kişi başı fiyat uymaz, karar başı fiyat uyar

**Rakip fiyatları.** Rakipler iki gruba ayrılır. Birinci grup ucuz hedef takip araçlarıdır. İkinci grup pahalı ve teklif usulü strateji paketleridir.

| Ürün | Fiyat | Tür |
|---|---|---|
| Perdoo | Kişi başı ayda 6,40 ile 8,00 avro | Yayımlanmış fiyat ([Perdoo](https://www.perdoo.com/pricing)) |
| Mooncamp | Kişi başı ayda 7 ile 10 avro, en az 5 kişi | Yayımlanmış fiyat ([Mooncamp](https://mooncamp.com/pricing)) |
| Hedef takip araçlarının ortası | Kişi başı ayda 8 dolar | Üçüncü taraf ([Tability](https://www.tability.io/compare/pricing/cascade)) |
| Cascade | 50 kişi için yılda yaklaşık 25.000 dolar | Üçüncü taraf tahmini ([Tability](https://www.tability.io/compare/pricing/cascade)) |
| WorkBoard | Yılda ortalama 57.040 dolar, 10 sözleşme | Üçüncü taraf ([Vendr](https://www.vendr.com/marketplace/workboard)) |
| LivePlan | Ayda 15 ile 40 dolar | Yayımlanmış fiyat ([LivePlan](https://www.liveplan.com/pricing)) |
| Paraşüt ön muhasebe | Ayda 752 TL + KDV | Yayımlanmış fiyat ([Paraşüt](https://www.parasut.com/on-muhasebe-fiyatlari)). Sayfada tarih yok. |
| Logo Tiger 3 Enterprise | Tek kullanıcı 817.900 TL, 2026 listesi, KDV hariç | Üçüncü taraf ([erp-software.org](https://erp-software.org/en/erp-worldwide/turkey/)) |

Logo TL fiyat listesini her yıl 7 Ocak'ta yeniler ([erp-software.org](https://erp-software.org/en/erp-worldwide/turkey/)). Türkiye'de ücretli bulut kullanımı şirket büyüdükçe artar. Bu oran küçük şirkette yüzde 17,3, orta ölçekte yüzde 31,8'dir ([erp-software.org, TÜİK verisiyle](https://erp-software.org/en/erp-worldwide/turkey/)).

**Çıkarım.** Kişi başı fiyat sizi ucuz araçlarla yarıştırır. Alıcı grubu küçüktür. Örneğin genel müdür, mali işler müdürü, stratej ve birkaç ekip üyesi. 10 kişi × 8 avro ayda 80 avro eder. Bu tutar katkı payını sıfıra yaklaştırır. Ayrıca izleyiciler sınırsız olmalıdır. Aile meclisi ve yönetim kurulu raporu okur.

**Çıkarım.** Fiyatı yazılıma göre değil, karara göre savunun. Önerilen fiyat Paraşüt'ün 16 ile 20 katıdır. Bu farkı özellik listesi açıklayamaz. Farkı kararın parası açıklar. Ayrıntı B bölümündedir.

**Liranın etkisi.** Sabit TL'li çok yıllık sözleşme gerçek değer kaybeder. 3 yıllık sabit sözleşme değerinin yüzde 30 ile 40'ını yitirebilir (tahmin). Oysa yapay zekâ ve sunucu dolar ya da avroyla ödenir. Bu yüzden yıllık peşin sözleşme yapın. Fiyatı her yıl güncelleyin. Logo da böyle yapar.

### A5. Public depoda gelir koddan değil, hizmetten gelir

Depo public olacak. Bu bir ürün kararıdır. Kod herkese açık olunca müşteri koda para ödemez. Müşteri şunlara para öder:

1. Barındırılan hizmete
2. Destek ve çalışma güvencesine
3. Yapay zekâ kotasına
4. Kurulum ve eğitim paketine
5. Danışman ortaklığına

**Kanıt.** Açık kaynak şirketleri aşağıdaki yollarla kazanır.

| Şirket | Nasıl kazanır? | Kaynak |
|---|---|---|
| Frappe | Yaklaşık 10 yıl kurulum, uyarlama, eğitim ve destek sattı. Sonra barındırmaya geçti. | [Frappe blogu](https://frappe.io/blog/erpnext-stories/business-model-evolution-at-frappe) |
| Plausible | Gelirini çoğunlukla barındırmadan alır. Lisansı AGPL'dir. | [Plausible](https://ingest.plausible.io/blog/open-source-licenses) |
| Sentry | FSL lisansı kullanır. Kod 2 yıl sonra açık kaynak olur. | [TechCrunch](https://techcrunch.com/2024/09/22/some-startups-are-going-fair-source-to-avoid-the-pitfalls-of-open-source-licensing/?rand=23331) |
| Odoo | Temel sürüm açıktır. Kurumsal sürüm kapalı ve ücretlidir. | [Odoo lisansları](https://www.odoo.com/documentation/master/legal/licenses.html) |

Frappe barındırma gelirindeki kaybı ayda yüzde 2 olarak bildirir ([Frappe ortak rehberi](https://docs.frappe.io/partner-guide/about-frappe.md)). Rehber 31 Mart 2026 Salı günü güncellendi. Bu yılda yaklaşık yüzde 22 eder (tahmin). Bu sayı şirketin kendi beyanıdır. Aynı sayfadaki gelir sayıları kendi içinde çelişir.

**Çıkarım.** Asıl risk, kodu kopyalayıp barındıran firmadır. Aile şirketi Frappe'yi kendisi kurmaz. Çünkü bilgi işlem ekibi yoktur. Risk başka bir yerdedir. Türk bir bilgi işlem firması kodu alıp müşterilerine barındırabilir.

**Lisans seçenekleri.** Lisansı siz seçersiniz. Bu rapor lisans seçmez. Seçenekler ve etkileri şunlardır:

| Lisans | Başkası barındırabilir mi? | Açık kaynak sayılır mı? | Size etkisi |
|---|---|---|---|
| MIT ya da Apache 2.0 | Evet, hiçbir şart yok. | Evet | En geniş yayılma. Rakip barındırıcıyı durdurmaz. |
| GPL-3.0 | Evet. Ağ üzerinden sunan değişikliğini paylaşmak zorunda değil. | Evet | ERPNext bu lisansı kullanır ([Wikipedia](https://www.wikipedia.com/wiki/ERPNext)). Barındırıcıyı durdurmaz. |
| AGPL-3.0 | Evet. Ama değişikliğini yayımlamak zorunda. | Evet | Kapalı kopyayı caydırır. Ayrı ticari lisansla birlikte kullanılabilir. |
| FSL ya da BSL | 2 ile 4 yıl hayır. Sonra evet. | Bu sürede hayır ([ossalt](https://ossalt.com/guides/open-core-vs-source-available-business-models-2026)) | Barındırıcıyı durdurur. Açık kaynak tercihinizle çelişir. |
| Açık çekirdek | Çekirdek için evet. Ek modüller için hayır. | Yalnız çekirdek | Ek modüllerden gelir alırsınız. Örneğin çok müşterili danışman ekranı. |

**Önerimiz.** Açık kaynak tercihinize en çok AGPL-3.0 uyar. AGPL-3.0 açık kaynak sayılır. Aynı zamanda kapalı kopyayı caydırır. Ayrı ticari lisans da isterseniz önce bir şart koyun. Dışarıdan katkı verenler katkı sözleşmesi imzalamalıdır. Lisansı ilk dış katkıdan önce seçin. Sonradan değiştirmek zorlaşır.

İki konu doğrulanmadı. Frappe Framework'ün MIT lisanslı olduğu bu oturumda yeniden okunmadı. Uygulama ERPNext kodu alırsa GPL uyum kuralları devreye girer. Bu iki konuyu bir avukata doğrulatın. AGPL'nin Türkiye'de uygulanması da hukuken incelenmedi.

### A6. Üç senaryo: temel senaryo yıl 3'te başa başa yaklaşır

**Piyasa ölçütleri.** Bu sayılar senaryoları kıyaslamak içindir. Çoğu ikinci eldir.

| Ölçüt | Değer | Tür |
|---|---|---|
| Şirketlere satılan SaaS ürünlerinde brüt kâr marjı ortası | Yüzde 75 | Üçüncü taraf derlemesi ([SaaSRise](https://saasrise.com/blog/saas-benchmark-report-2026)) |
| Müşteri kazanma maliyetinin geri ödeme süresi | 2025'te 16 ay, 2024'te 18 ay | Üçüncü taraf ([azbigmedia, Benchmarkit'ten](https://azbigmedia.com/business/why-b2b-saas-companies-are-losing-the-paid-acquisition-game-in-2026/)) |
| Küçük işletme müşterisinde yıllık kayıp | Yüzde 10 ile 15 | Üçüncü taraf, doğrulanmadı ([churnrecovery](https://churnrecovery.pages.dev/posts/B2B-SaaS-Churn-Benchmarks-2025)) |
| Müşteri başına aylık gelir 500 doların üstündeyse net gelir tutması yüzde 100'ü geçen şirketler | Yüzde 41,1 | Kanıt ([ChartMogul](https://chartmogul.com/saas-retention-report/)) |
| Müşteri başına aylık gelir 10 doların altındaysa aynı oran | Yüzde 2,7 | Kanıt ([ChartMogul](https://chartmogul.com/saas-retention-report/)) |
| 25.000 doların altındaki satışta satış süresi | 30 ile 60 gün | Üçüncü taraf ([The Digital Bloom](https://thedigitalbloom.com/learn/pipeline-performance-benchmarks-2025/)) |

**Çıkarım.** Müşteriniz çalışan sayısına göre orta ölçeklidir. Ama yıllık sözleşmesi küçük işletme bandındadır. Bu yüzden küçük işletme gibi kayıp bekleyin. Özel bir risk de vardır. Müşteri tek bir karar için gelir. Karar bitince ödeme nedeni de bitebilir. Bu yüzden kötümser senaryoda yıllık kayıp yüzde 40'tır (varsayım).

#### Formüller

Model 15 Kasım 2026 Pazar günü bir Python betiğiyle çalıştırıldı. Formüller şunlardır:

1. Sunucunun dolar fiyatı = 73,49 avro × 1,1145 = 81,91 dolar
2. Müşteri başına sunucu payı = 81,91 ÷ sunucudaki site sayısı
3. Değişken maliyet = sunucu payı + yedek, e-posta ve izleme + yapay zekâ
4. Destekli değişken maliyet = değişken maliyet + destek saati × 25 dolar
5. Kanal oranı = danışmanla gelen müşteri oranı × danışman komisyonu
6. Katkı payı = fiyat × (1 − kanal oranı) − destekli değişken maliyet
7. Brüt kâr marjı, destek hariç = (aylık gelir − müşteri sayısı × değişken maliyet − sabit altyapı − mobil) ÷ aylık gelir
8. Brüt kâr marjı, destek dahil = aynı hesap, ayrıca müşteri sayısı × destek maliyeti çıkar
9. Başa baş müşteri sayısı = (ekip gideri + sabit altyapı + mobil) ÷ katkı payı
10. Müşteri ömrü, yıl olarak = 1 ÷ yıllık müşteri kayıp oranı
11. Ömür boyu katkı = katkı payı × 12 × müşteri ömrü
12. Kabul edilebilir en yüksek müşteri kazanma maliyeti = ömür boyu katkı ÷ 3
13. Geri ödeme süresi, ay olarak = müşteri kazanma maliyeti ÷ aylık katkı payı

Danışman komisyonu satış gideridir. Bu yüzden brüt kâr marjına girmez. Ama katkı payına girer.

#### Varsayımlar

Bu tablodaki girdilerin çoğu varsayımdır. "Tür" sütunu bunu gösterir.

| Girdi | Kötümser | Temel | İyimser | Tür |
|---|---|---|---|---|
| Şirket başına aylık fiyat | 150 dolar (7.534 TL) | 300 dolar (15.068 TL) | 500 dolar (25.114 TL) | Varsayım |
| Bir sunucudaki site sayısı | 25 | 60 | 120 | Varsayım |
| Müşteri başına sunucu payı | 3,28 dolar | 1,37 dolar | 0,68 dolar | Tahmin |
| Yedek, e-posta ve izleme | 1,50 dolar | 1,00 dolar | 0,70 dolar | Tahmin |
| Yapay zekâ | 60 dolar | 18 dolar | 10 dolar | Tahmin |
| Aylık destek | 4 saat, 100 dolar | 2 saat, 50 dolar | 1 saat, 25 dolar | Varsayım |
| Destek saatinin maliyeti | 25 dolar | 25 dolar | 25 dolar | Varsayım |
| Sabit altyapı | 450 dolar | 300 dolar | 250 dolar | Varsayım |
| Mobil, sabit | 25 dolar | 25 dolar | 25 dolar | Tahmin |
| Kanal oranı | Yüzde 60 × yüzde 25 = yüzde 15 | Yüzde 50 × yüzde 20 = yüzde 10 | Yüzde 40 × yüzde 20 = yüzde 8 | Varsayım |
| Yıllık müşteri kayıp oranı | Yüzde 40 | Yüzde 25 | Yüzde 12 | Varsayım |
| Yıl 1 sonunda ücretli müşteri | 5 | 15 | 30 | Varsayım |
| Yıl 3 sonunda ücretli müşteri | 25 | 80 | 200 | Varsayım |
| Aylık ekip ve araç gideri, yıl 1 | 6.000 dolar | 6.000 dolar | 6.000 dolar | Varsayım |
| Aylık ekip ve araç gideri, yıl 3 | 20.000 dolar | 20.000 dolar | 20.000 dolar | Varsayım |

Yıl 1'deki 6.000 dolar yaklaşık 301.000 TL eder. Bu tutar bir kurucu ve bir geliştiriciyi anlatır. Yıl 3'teki 20.000 dolar yaklaşık 1.005.000 TL eder. Bu tutar 5 ile 6 kişilik ekibi anlatır. Maaşlar araştırılmadı.

#### Sonuçlar

| Sonuç | Kötümser | Temel | İyimser |
|---|---|---|---|
| Değişken maliyet, destek hariç | 64,78 dolar | 20,37 dolar | 11,38 dolar |
| Değişken maliyet, destek dahil | 164,78 dolar | 70,37 dolar | 36,38 dolar |
| Müşteri başına aylık katkı payı | −37,28 dolar | 199,63 dolar (10.027 TL) | 423,62 dolar |
| Yıl 1 yıllık gelir | 9.000 dolar (0,45 milyon TL) | 54.000 dolar (2,71 milyon TL) | 180.000 dolar (9,04 milyon TL) |
| Yıl 1 brüt kâr marjı, destek hariç | Yüzde −7 | Yüzde 86 | Yüzde 96 |
| Yıl 1 brüt kâr marjı, destek dahil | Yüzde −73 | Yüzde 69 | Yüzde 91 |
| Yıl 1 aylık faaliyet sonucu | −6.661 dolar | −3.330 dolar | +6.434 dolar |
| Yıl 3 yıllık gelir | 45.000 dolar (2,26 milyon TL) | 288.000 dolar (14,47 milyon TL) | 1,2 milyon dolar (60,27 milyon TL) |
| Yıl 3 brüt kâr marjı, destek hariç | Yüzde 44 | Yüzde 92 | Yüzde 97 |
| Yıl 3 brüt kâr marjı, destek dahil | Yüzde −23 | Yüzde 75 | Yüzde 92 |
| Yıl 3 aylık faaliyet sonucu | −21.407 dolar | −4.354 dolar | +64.448 dolar |
| Başa baş müşteri sayısı, yıl 1 giderleriyle | Hiçbir zaman | 32 | 15 |
| Başa baş müşteri sayısı, yıl 3 giderleriyle | Hiçbir zaman | 102 | 48 |
| Müşteri ömrü | 2,5 yıl | 4 yıl | 8,3 yıl |
| Ömür boyu katkı | Eksi | 9.582 dolar | 42.362 dolar |
| Kabul edilebilir en yüksek müşteri kazanma maliyeti | Yok | 3.194 dolar | 14.121 dolar |
| Geri ödeme süresi, kazanma maliyeti bir yıllık fiyata eşitse | Hiçbir zaman | 18 ay | 14,2 ay |

**Temel senaryoyu adım adım okuyun.**

1. Katkı payı = 300 × 0,90 − 70,37 = 199,63 dolar.
2. Yıl 1 başa baş noktası = (6.000 + 300 + 25) ÷ 199,63 = 31,7. Yani 32 müşteri.
3. Yıl 3 başa baş noktası = (20.000 + 300 + 25) ÷ 199,63 = 101,8. Yani 102 müşteri.
4. Yıl 3'te müşteri sayısı 80'dir. 80 müşteri 102'nin altındadır.
5. Bu yüzden temel senaryo yıl 3'te ayda 4.354 dolar zarar eder.

**Çıkarım.** Sunucu hiçbir senaryoda sorun değildir. Destek hariç brüt kâr marjı yüzde 86 ile 97 arasıdır. Bu, fiyat en az 300 dolar ve yapay zekâ kotalıyken geçerlidir. Bu oran piyasa ortası olan yüzde 75'in üstündedir. Kârı bozan şey sunucu değildir. Kârı bozan şey düşük fiyat, sınırsız yapay zekâ ve fazla destek saatidir.

**Başa baş fiyatı.** Formül şudur:

> Başa baş fiyatı = (sabit gider ÷ müşteri sayısı + destekli değişken maliyet) ÷ (1 − kanal oranı)

| Durum | 15 müşteri | 80 müşteri | 200 müşteri |
|---|---|---|---|
| Temel maliyet yapısı | 547 dolar | 360 dolar | 191 dolar |
| Kötümser yapı, yapay zekâ 15 dolar ve destek 2 saatle sınırlı | 578 dolar | 381 dolar | 202 dolar |

Tablodaki 15 müşteri sütunu yıl 1 giderlerini kullanır. Diğer iki sütun yıl 3 giderlerini kullanır. İkinci satırda sabit altyapı 300 dolar alındı. 150 dolarlık fiyatta katkı payı yalnız yaklaşık 58 dolar olur. Bu fiyatla başa baş için yaklaşık 350 müşteri gerekir.

Modelde dört konu yoktur:

1. Ödeme aracı ücretleri. Örneğin iyzico ya da PayTR.
2. KDV hesabı
3. Kurulum paketi geliri
4. Ek yapay zekâ kotası geliri

Son iki kalem modele eklenirse sonuç iyileşir.

### A7. En büyük bilinmeyen ekip maliyetidir

Açıkça söyleyelim. Ekip maliyetini bilmiyoruz. Türkiye'deki geliştirici ve müşteri destek maaşları araştırılmadı. Oysa başa baş noktasını en çok bu sayı belirler.

Aşağıdaki tablo bu etkiyi gösterir. Katkı payı temel senaryodaki 199,63 dolardır. Sabit altyapı ve mobil toplam 325 dolardır.

> Başa baş müşteri sayısı = (aylık ekip gideri + 325) ÷ 199,63

| Aylık ekip gideri | Yaklaşık TL karşılığı | Başa baş müşteri sayısı |
|---|---|---|
| 6.000 dolar | 301.000 TL | 32 |
| 10.000 dolar | 502.000 TL | 52 |
| 15.000 dolar | 753.000 TL | 77 |
| 20.000 dolar | 1.005.000 TL | 102 |
| 30.000 dolar | 1.507.000 TL | 152 |

Ekip gideri ikiye katlanırsa gereken müşteri sayısı da yaklaşık ikiye katlanır. Bu yüzden ekip maliyetini ilk iş olarak ölçün.

**Ekip maliyetini ölçmek için şu adımları izleyin:**

1. Ürün sahibi gereken rolleri yazar. Örneğin geliştirici, DevOps ve müşteri destek.
2. Ürün sahibi her rol için iş yükünü saat olarak yazar.
3. Ürün sahibi her rol için en az üç maaş teklifi toplar. Kaynak iş ilanları ya da işe alım firmaları olabilir.
4. Mali müşavir her maaşın işverene toplam maliyetini hesaplar. Bu hesaba vergiler ve sigorta primleri girer.
5. Ürün sahibi araç ve abonelik giderlerini ekler. Örneğin yayın aracı Jenkins'in sunucusu ve tasarım araçları.
6. Ürün sahibi ilk 5 pilotta her müşteriye harcanan saati kaydeder. Kurulum, destek ve eğitim ayrı yazılır.
7. Ürün sahibi gerçek saatleri modeldeki 2 saatle karşılaştırır.
8. Ürün sahibi modeli gerçek sayılarla yeniden çalıştırır.

Saat kaydı her pilotta ilk günden başlamalıdır. Sonradan hatırlanan saat güvenilir değildir.

### A8. Kârı öldüren sekiz şey

| No | Tehlike | Ne olur? |
|---|---|---|
| 1 | Fiyatı hedef takip araçlarına ya da Türk muhasebe yazılımlarına yakın koymak | Ayda 15 ile 150 dolarlık fiyatta katkı payı sıfıra iner. |
| 2 | Karar bitince müşterinin ayrılması | Yüzde 40 kayıpta müşteri ömrü temel senaryonun yarısına düşer. |
| 3 | Sınırsız yapay zekâ ve ödeme yapmayan ücretsiz kurucular | Yapay zekâ maliyeti müşteri başına 18 dolardan 60 doların üstüne çıkar. |
| 4 | Her aile şirketine özel iş yapmak | Destek ayda 4 saati geçer. Katkı payı eksiye düşer. |
| 5 | Danışmanın yüzde 25'ten çok pay alması ya da ürünü rakip görmesi | Katkı payı küçülür ya da satış kanalı kapanır. |
| 6 | Sabit TL'li çok yıllık sözleşme | Gelir TL ile gelir. Sunucu ve yapay zekâ dolar ya da avroyla ödenir. |
| 7 | Gece yayınının site sayısıyla uzaması | DevOps zamanı artar. 90 dakikalık pencere aşılır. |
| 8 | Başka bir firmanın public kodu daha ucuza barındırması | Lisans izin verirse fiyatınız baskı altına girer. |

Sunucu zammı bu listede yoktur. Hetzner'in 2026 zammı yalnız sabit tabanı etkiler. 300 dolarlık fiyatta bu zam öldürücü değildir (çıkarım).

## B. Müşteri için: ürün 20 milyon TL üstündeki kararda kendini öder

Bu bölüm müşterinin hesabıdır. Soru şudur: Müşteri bu üründen ölçülebilir para kazanır mı?

### B1. Kanıt: iyi karar süreci getiriyi artırır

**Birinci kanıt.** McKinsey 1.048 büyük kararı beş yıl boyunca inceledi ([McKinsey, davranışsal strateji](https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/the-case-for-behavioral-strategy)). Kararlar yeni ürün, şirket satın alma ve büyük yatırım kararlarıydı. Karar süreci, analizden altı kat daha önemli çıktı. Süreç kalitesi en alt çeyrekten en üst çeyreğe çıkınca getiri arttı. Bu artış 6,9 yüzde puanıydı. Yüzde puan, iki yüzde arasındaki düz farktır. Örneğin yüzde 10'dan yüzde 16,9'a çıkmak 6,9 puandır. Getiri verisi 1.048 kararın 673'ünde vardı.

**İkinci kanıt.** Harvard Business Review'daki 2011 makalesi aynı çalışmayı aktarır ([HBR makalesi, PDF](https://faculty.washington.edu/pathaksd/BBUS549/Required%20Readings/Before%20You%20Make%20that%20Big%20Decision.pdf)). Önyargı azalınca getiri 7 puana kadar yükseldi.

**Üçüncü kanıt.** PMI, proje yöneticilerinin uluslararası derneğidir. PMI 2018 raporu proje yatırımlarındaki kaybı ölçtü ([PMI 2018 raporu](https://zephrcf.leaddev.com/wp-content/uploads/2020/12/pulse-of-the-profession-2018.pdf)). Her 1 milyar dolardan 99 milyon dolar boşa gitti. Bu oran yüzde 9,9'dur. PMI bu kaybı strateji ile uygulama arasındaki kopuklukla ilişkilendirir. 2025 ve 2026 sayıları bulunamadı.

**Uyarıcı kanıt.** Kenya'da 640 girişimciyle rastgele bir deney yapıldı ([Berkeley Haas](https://newsroom.haas.berkeley.edu/research/gen-ai-experiment-shows-mixed-results-in-helping-small-businesses-grow/)). Yapay zekâ danışmanı zayıf girişimcilerin gelirini yaklaşık yüzde 8 düşürdü. Yani yapısız yapay zekâ değer yok edebilir.

**Bu kanıtların sınırı.** McKinsey verisi büyük şirketlerden gelir. Bulgular ilişki gösterir, neden göstermez. Veri kısmen yöneticilerin kendi beyanıdır. Strateji yazılımının getirisini ölçen bir çalışma bulunamadı. Bu yüzden satış belgesinde yüzde getiri sözü vermeyin.

### B2. Ürün hangi karar büyüklüğünde kendini öder?

**Formül (tahmin).**

1. Ek değer = kararın parası × getiri artışı
2. Kendini ödeme oranı = ek değer ÷ yıllık ürün maliyeti
3. En küçük karar büyüklüğü = yıllık ürün maliyeti ÷ getiri artışı

**Örnek.** Bir aile şirketi 50 milyon TL'lik yatırımı değerlendiriyor. Örneğin yeni bir ihracat pazarı. Ürün kararın getirisini yalnız 1 puan artırıyor. Bu, McKinsey'in bulduğu farkın yedide biridir.

1. Ek değer = 50.000.000 × 0,01 = 500.000 TL.
2. Yıllık ürün maliyeti = 15.000 TL × 12 = 180.000 TL.
3. Kendini ödeme oranı = 500.000 ÷ 180.000 = 2,8 kat.

Aynı hesap 20 milyon TL'lik kararda 1,1 kat verir. Bu neredeyse başa baştır.

**Eşik tablosu (tahmin).** Kurulum paketi ilk yıl 50.000 TL'dir (varsayım).

| Getiri artışı | Yalnız abonelik, 180.000 TL | Abonelik ve kurulum, 230.000 TL |
|---|---|---|
| 0,5 puan | 36 milyon TL | 46 milyon TL |
| 1 puan | 18 milyon TL | 23 milyon TL |
| 2 puan | 9 milyon TL | 11,5 milyon TL |

Tablodaki her hücre, ürünün kendini ödediği en küçük karar büyüklüğüdür. Müşteri ekibinin harcadığı zaman bu hesapta yoktur. Bu zaman bilinmiyor.

**İkinci değer kaynağı.** Ürün boşa giden harcamayı azaltabilir (tahmin). PMI'ın yüzde 9,9'luk kaybını kullanalım. Program 50 milyon TL olsun. Ürün bu kaybın onda birini önlesin.

> Kazanç = 50.000.000 × 0,099 × 0,10 = 495.000 TL

Bu kazancı kaynak izinleri ve gözden geçirmeler sağlar. Kaynak izni olmadan harcama açılmaz. Kapalı izne gelen harcama incelemeye düşer.

**Üçüncü değer kaynağı.** Ürün danışman zamanından tasarruf sağlayabilir. Ürün danışmanın işini kısaltabilir. Ama Türkiye'de strateji danışmanlığı ücreti bulunamadı. Armut'ta 778 şirket danışmanı vardır. Hepsi teklif usulü fiyat verir ([Armut](https://armut.com/sirket-danismanligi)). Bu sayıyı görüşmelerde sorun. Soru şudur: "Son strateji çalışmanız size kaça mal oldu?"

**Çıkarım.** Küçük kararlara satış yapmayın. Kararın parası en az 20 ile 30 milyon TL olmalıdır. Daha küçük kararda ürün müşteriye para kazandırmayabilir. Bu müşteri de yenilemeden ayrılır.

### B3. Değeri her müşteride ölçün

Değeri iddia etmeyin, kayıtla gösterin. Ürün bu kaydı zaten tutar. Şu adımları izleyin:

1. Stratej, hazırlık kapısında kararın parasını kaydeder.
2. Stratej, aynı yerde mevcut planı ve beklenen değeri kaydeder.
3. Karar sahibi kaynak izinlerini açar.
4. Ekip üyeleri gerçek harcamayı kaynak hareketi olarak girer.
5. Karar sahibi gözden geçirmede harcamayı izinle karşılaştırır.
6. Karar sahibi aşama tarihlerini hedefle karşılaştırır.
7. Ürün bu kayıtlardan bir değer raporu üretir.

Bu rapor yenileme görüşmesinin ana belgesidir. Müşteri parayı nerede koruduğunu kendi kaydında görür.

## Öneriler

Bu bölüm net önerilerdir. Her önerinin dayanağı yukarıdaki bölümlerdedir.

### Fiyat modeli

Kişi başı fiyat kullanmayın. Şirket ve karar başı fiyat kullanın.

| Paket | Kime? | Ne içerir? | Fiyat (varsayım, sınanacak) |
|---|---|---|---|
| Kurucu | Tek kurucu | Tek kullanıcı, tarayıcı, küçük yapay zekâ kotası | Ücretsiz ya da ayda yaklaşık 490 TL |
| Karar | Aile kökenli orta ölçekli şirket | Bir açık karar, yaklaşık 15 düzenleyici, sınırsız izleyici, yapay zekâ kotası | Ayda 15.000 TL, yıllık peşin. Yılda 180.000 TL eder. |
| Şirket | Birden çok kararı olan şirket | Birden çok karar, hedefler, kaynak izinleri ve gözden geçirmeler | Ayda 25.000 ile 40.000 TL |

Ek ücretli seçenekler şunlardır:

1. Türkiye'de barındırma
2. Ek yapay zekâ kotası
3. Kurulum paketi
4. Danışman çalışma alanı

Danışman çalışma alanı bugün tasarımda yoktur. Her kurum ayrı sitededir. Birçok müşteriyi tek yerden gösteren ekran ayrıca tasarlanmalıdır.

Sözleşmeleri yıllık peşin TL ile yapın. Fiyatı her yıl güncelleyin. İsterseniz fiyatı dolar ya da avroyla belirleyip TL fatura kesin. ChartMogul'un bir raporu yıllık planı destekler. Müşteri başına 250 ile 500 dolar gelirde net gelir tutma yıllık planda yüzde 88'dir. Aylık planda yüzde 76'dır ([ChartMogul](https://chartmogul.com/reports/saas-retention-the-new-normal/)). Bu sayılar ikinci el özetten gelir.

### Yapay zekâ kotası

1. Her Karar paketine ayda 150 yapay zekâ işlemi koyun. Maliyeti yaklaşık 18 dolardır (tahmin).
2. İtiraz turunu ve seçenek üretmeyi kotanın içinde tutun. Bunlar ürünün ana değeridir.
3. Ajanla yapılan uzun araştırmayı ayrı ücretlendirin.
4. Ek kotayı maliyetin 3 ile 5 katına satın.
5. Kurucu paketine küçük bir kota koyun. Sınırsız kota vermeyin.
6. Basit işleri ucuz modele yönlendirin. Şirket bilgisini ön bellekte tutun.
7. Her kurumda "yapay zekâ kapalı" seçeneğini koruyun.

Bir örnek verelim. 100 ek işlemin maliyeti yaklaşık 12 dolardır. Bu paketi 36 ile 60 dolara satın. Bu tutar yaklaşık 1.808 ile 3.014 TL eder (tahmin).

Yapay zekâ bugün üründe yoktur. Bu yüzden kota, özellik hazır olunca uygulanır. İlk pilotlar yapay zekâ kapalıyken de tam çalışmalıdır.

### Destek sınırı

1. Her pakete müşteri başına ayda 2 saat destek koyun.
2. Bu sınırı aşan işi saat başına ücretlendirin.
3. El tutma işini stratej rolündeki danışmana bırakın.
4. Her destek saatini müşteri adına kaydedin.

Müşteriye özel geliştirme yapmayın. Özel istek birkaç müşteride tekrar ederse ürüne ekleyin. Tek müşteriye özel iş destek saatini 4 saatin üstüne çıkarır.

### Kurulum paketi

1. Kurulum paketini bir kerelik ücretle satın. Örnek tutar 50.000 TL'dir (varsayım).
2. Pakete site açılışını ve rol kurulumunu koyun.
3. Pakete ilk kararın hazırlık oturumunu koyun.
4. Pakete ekip eğitimini koyun.
5. Paketin kaç saat sürdüğünü ilk 5 pilotta ölçün.
6. Ölçülen saate göre fiyatı yeniden belirleyin.

Kurulum paketi iki işe yarar. Destek saatini ilk aylarda karşılar. Müşterinin ciddi olduğunu da gösterir.

### İlk neyi sınayın?

Bu sırayla ilerleyin. Her adım bir sonrakine bilgi verir.

1. **Fiyat.** Ürün sahibi 15 ile 30 alıcı görüşmesinde fiyat sorularını sorar. Önce Van Westendorp yöntemini kullanır. Bu yöntem dört soruyla kabul edilebilir fiyat aralığını bulur. Sonra Gabor-Granger yöntemini kullanır. Bu yöntem belirli fiyatlarda satın alma olasılığını sorar. Sorulacak fiyatlar 9.000, 15.000 ve 25.000 TL'dir ([Prospeo](https://prospeo.io/s/go-to-market-pricing-strategy), [CleverX](https://cleverx.com/blog/enterprise-b2b-willingness-to-pay-setting-and-defending-price)). Kaynaklar 200 ile 500 kişi önerir. Bu sayıya ulaşılamaz. Bu yüzden sonuç bir yön gösterir, kesin fiyat vermez.
2. **Ücretli pilot.** Ürün sahibi en çok 5 şirkete ücretli pilot teklif eder. Pilot, Karar paketi fiyatıyla ve kurulum ücretiyle yapılır.
3. **Ekip ve destek saati.** Ürün sahibi her pilotta harcanan saati ilk günden kaydeder. A7 bölümündeki adımları izler.
4. **Sunucu kapasitesi.** DevOps sorumlusu bir yük testi yapar. Testte 50 boş ve 10 etkin site olur. Test, site başına belleği ölçer.
5. **Gece yayın süresi.** DevOps sorumlusu gerçek site sayısıyla yayın süresini ölçer. Süre 90 dakikaya sığmalıdır.
6. **Kararın parası.** Ürün sahibi her pilotta kararın parasını kaydeder. 20 milyon TL'nin altındaki kararları ayrı işaretler.
7. **İkinci karar.** Ürün sahibi ilk karar bitince müşterinin ikinci karar açıp açmadığını izler. Bu sayı kayıp oranını belirler.
8. **Yapay zekâ kullanımı.** Yapay zekâ özelliği çıkınca ürün sahibi müşteri başına işlem sayısını ölçer. Kotayı bu sayıya göre ayarlar.

## Sonuç

Bu ürünün kârı sunucudan değil, satış biçiminden gelir. Altyapı ucuzdur. Brüt kâr marjı fiyat doğruysa piyasa ortasının üstündedir. Asıl soru başka bir yerdedir. Müşteri tek karardan sonra kalacak mı? Ekip, 100 civarında şirkete ulaşana kadar ayakta kalabilecek mi? İki sorunun cevabı da henüz bilinmiyor. İkisi de ilk 5 pilotta ölçülebilir.

Müşteri tarafında ürünün değeri kararın büyüklüğüne bağlıdır. Bu yüzden satış ölçütü çalışan sayısı değil, kararın parasıdır. 20 milyon TL'nin altındaki kararda ürün kendini zor öder. Bu kural ideal müşteri profili (ICP) puan tablosundaki "sınırlı ve paralı karar" ölçütünü güçlendirir. Ürünün kendi kayıtları da en güçlü satış belgesidir. Müşteri parayı nerede koruduğunu bu kayıtlarda görür.

## Kaynaklar

### Kur ve Türkiye pazarı

- [Foreks, TCMB kurları, 11 Kasım 2026 Çarşamba günü](https://www.foreks.com/haber/detay/6af45fcc5f5f43016edfe8dc/FRKS/tr/tcmbnin-belirledigi-alis-satis-kurlari-dolar-50-1379-50-2282-euro-55-8804-55-9810-11-11-26/)
- [erp-software.org, Türkiye ERP pazarı](https://erp-software.org/en/erp-worldwide/turkey/)
- [Paraşüt fiyatları](https://www.parasut.com/on-muhasebe-fiyatlari)
- [KVKK, yurt dışı aktarım duyurusu](https://www.kvkk.gov.tr/Icerik/8170/Yurt-Disina-Kisisel-Veri-Aktariminda-Kullanilacak-Standart-Sozlesmelerde-Dikkat-Edilmesi-Gereken-Hususlara-Iliskin-Kamuoyu-Duyurusu)
- [Armut, şirket danışmanlığı](https://armut.com/sirket-danismanligi)

### Sunucu ve barındırma

- [Frappe Cloud, sunucu planı seçimi](https://docs.frappe.io/cloud/servers/guidelines-for-choosing-a-server-plan)
- [Frappe Cloud fiyatları](https://frappe.io/cloud/pricing)
- [Frappe forumu, sunucu kapasitesi](https://discuss.frappe.io/t/how-many-sites-can-my-server-handle-efficiently/142670)
- [Hetzner, genel amaçlı sunucular](https://www.hetzner.com/cloud/general-purpose)
- [Hetzner bulut](https://www.hetzner.com/cloud)
- [Findstack, Hetzner zammı](https://findstack.com/resources/hetzner-price-increase-2026)
- [wz-it, Hetzner zammı](https://wz-it.com/en/blog/hetzner-price-increase-june-2026-cpx-ccx-alternatives/)
- [karekod.org, Türkiye sanal sunucu fiyatları](https://www.karekod.org/blog/en-ucuz-vds-fiyatlari/)
- [whtop, Burti NET](https://www.whtop.com/tr/plans/burtinet.com/143115)

### Yapay zekâ ve mobil

- [Anthropic fiyatları](https://platform.claude.com/docs/en/about-claude/pricing)
- [Perdoo fiyatları](https://www.perdoo.com/pricing)
- [Business Wire, WorkBoard](https://www.businesswire.com/news/home/20250527067665/en/WorkBoard-Announces-General-Availability-of-Its-Digital-Chief-of-Staff-and-Leadership-Coach-Agents-and-Expanded-Capabilities-for-Microsoft-365-Copilot-Agent)
- [Falkster, kullanıma göre fiyat](https://falkster.com/blog/the-credit-is-the-new-seat)
- [Capgo fiyatları](https://capgo.app/pricing/)
- [Capawesome fiyatları](https://capawesome.io/cloud/pricing/)
- [Adalo, Apple geliştirici programı](https://studio.adalo.com/blog/apple-developer-program-guide)
- [Capgo, mağaza hesapları rehberi](https://capgo.app/blog/how-to-create-apple-developer-and-google-play-developer-accounts/)

### Rakipler ve piyasa ölçütleri

- [Mooncamp fiyatları](https://mooncamp.com/pricing)
- [Tability, Cascade fiyat karşılaştırması](https://www.tability.io/compare/pricing/cascade)
- [Vendr, WorkBoard](https://www.vendr.com/marketplace/workboard)
- [LivePlan fiyatları](https://www.liveplan.com/pricing)
- [SaaSRise, 2026 ölçüt raporu](https://saasrise.com/blog/saas-benchmark-report-2026)
- [azbigmedia, Benchmarkit verisi](https://azbigmedia.com/business/why-b2b-saas-companies-are-losing-the-paid-acquisition-game-in-2026/)
- [ChartMogul, müşteri tutma raporu](https://chartmogul.com/saas-retention-report/)
- [ChartMogul, yeni normal raporu](https://chartmogul.com/reports/saas-retention-the-new-normal/)
- [churnrecovery, kayıp ölçütleri](https://churnrecovery.pages.dev/posts/B2B-SaaS-Churn-Benchmarks-2025)
- [The Digital Bloom, satış süresi](https://thedigitalbloom.com/learn/pipeline-performance-benchmarks-2025/)
- [Prospeo, fiyat araştırması](https://prospeo.io/s/go-to-market-pricing-strategy)
- [CleverX, ödeme isteği](https://cleverx.com/blog/enterprise-b2b-willingness-to-pay-setting-and-defending-price)

### Açık kaynak ve lisans

- [Frappe, iş modelinin gelişimi](https://frappe.io/blog/erpnext-stories/business-model-evolution-at-frappe)
- [Frappe ortak rehberi](https://docs.frappe.io/partner-guide/about-frappe.md)
- [Plausible, açık kaynak lisansları](https://ingest.plausible.io/blog/open-source-licenses)
- [TechCrunch, fair source](https://techcrunch.com/2024/09/22/some-startups-are-going-fair-source-to-avoid-the-pitfalls-of-open-source-licensing/?rand=23331)
- [ossalt, açık çekirdek rehberi](https://ossalt.com/guides/open-core-vs-source-available-business-models-2026)
- [Odoo lisansları](https://www.odoo.com/documentation/master/legal/licenses.html)
- [Wikipedia, ERPNext](https://www.wikipedia.com/wiki/ERPNext)

### Müşteri değeri

- [McKinsey, davranışsal strateji](https://www.mckinsey.com/capabilities/strategy-and-corporate-finance/our-insights/the-case-for-behavioral-strategy)
- [HBR 2011 makalesi, PDF kopyası](https://faculty.washington.edu/pathaksd/BBUS549/Required%20Readings/Before%20You%20Make%20that%20Big%20Decision.pdf)
- [PMI Pulse of the Profession 2018](https://zephrcf.leaddev.com/wp-content/uploads/2020/12/pulse-of-the-profession-2018.pdf)
- [Berkeley Haas, yapay zekâ deneyi](https://newsroom.haas.berkeley.edu/research/gen-ai-experiment-shows-mixed-results-in-helping-small-businesses-grow/)

### Ürün belgeleri

- [Bütünleşik geliştirme raporu](../docs/butunlesik-gelistirme-raporu.md)
- [Hedef kitle, ICP ve personalar](Hedef%20kitle%20ICP%20ve%20personalar.md)

## Denetim notu

Gerçek okurla denenmedi. Rapor yalın Türkçe denetim betiğinden geçirildi. Senaryo sayıları 15 Kasım 2026 Pazar günü bir betikle yeniden hesaplandı. Fiyatların, kotaların ve müşteri sayılarının çoğu varsayımdır. Her sayının türü yanında yazar. Kaynak adları ve bağlantılar özgün yazımıyla korundu. Tablo hücrelerinin bir kısmı kısa değer olarak yazıldı.

Betik 0 hata ve 8 uyarı verdi. Kalan uyarıların nedenleri şunlardır:

1. Beş uyarı, 11 ile 13 kelimelik açıklama cümlelerini talimat sanıyor. Bu cümleler açıklamadır ve 15 kelime sınırının altındadır.
2. Bir uyarı, 16 kelimelik brüt kâr marjı formülüdür. Formül bölünürse okunamaz.
3. Bir uyarı, türü kesinleşmeyen 11 ile 15 kelimelik cümleleri sayar. Bu cümleler elle okundu. Çoğu açıklama ya da tablo hücresidir. Talimat olanlar en çok 10 kelimedir.
4. Bir uyarı uzun kelimeleri sayar. Bu kelimelerin çoğu günlük kelimedir. Örneğin "veritabanı" ve "geliştirici".
