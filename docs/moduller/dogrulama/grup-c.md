# C grubu doğrulama özeti

Bu belge C grubundaki 15 programın doğrulamasını özetler. Kontrol 20 Kasım 2026 Cuma günü yapıldı. Ayrıntılar ve alıntılar `grup-c.json` dosyasındadır.

## Genel sonuç

- 15 programın hepsi hâlâ yürürlüktedir.
- Kapanan ya da yürürlükten kalkan program yoktur.
- 10 programda katalogdaki değerler resmî kaynakla tutuyor.
- 5 programda katalogdan farklı bir bilgi çıktı.
- Değerlendirme süresi çoğu programın resmî metninde yazmıyor. Bu alanlar boş kaldı.

## Önce karar verilmesi gereken çelişki

5746 sayılı Kanunun 3. maddesinin 5. fıkrası bir yasak koyar. Bu kanundan yararlanan, 4691 sayılı Kanunun geçici 2. maddesinden ayrıca yararlanamaz.

Katalog bu ilişkiyi "ayri_gider" diye yazıyor. JSON dosyası bu ilişkiyi "dislayici" yapar. Üç kayıt bundan etkilenir:

1. `argeMerkezi`
2. `kanun4691`
3. `kanun5746`

Kanun metni bir soruyu açık bırakır. Yasak yalnız aynı iş için mi geçerli, metin bunu söylemiyor. Ürün sahibi kodu değiştirmeden önce bu soruyu karara bağlamalıdır.

## Değişen programlar

1. **tbEIhracat:** E-ihracat Genelgesi 16 Kasım 2026 Pazartesi günü değişti. 1 Ocak 2027 Cuma gününden sonra yıllık destek, e-ihracat değerinin yarısını geçemez. Çevrim içi mağaza desteği için önceki yıl ihracatı 500.000 ABD dolarının üstünde olmalı.
2. **hit30:** 9 Ağustos 2026 tarihli 11572 sayılı Karar yeni bir yol ekledi. Ar-Ge harcaması 2 milyar TL olan proje de başvurabilir. HIT-Güneş çağrısı sona erdi. HIT-Yenilikçi Savunma Teknolojileri çağrısı açıldı.
3. **argeMerkezi:** Bazı sektörlerde Ar-Ge Merkezi için 30 personel gerekir. Örneğin otomotiv bu sektörlerdendir. Katalogda bu istisna yok. 5746 ile 4691 çelişkisi de bu kaydı etkiler.
4. **kanun4691:** Değerler doğru. Yalnız 5746 ile 4691 çelişkisi bu kaydı etkiler.
5. **kanun5746:** Değerler doğru. Katalogda girişim sermayesi kuralı eksik. 5746 ile 4691 çelişkisi de bu kaydı etkiler.

## Tutan programlar

1. **tb10962Atilim:** Yedi gider kalemi tavanı doğru. Katalogda ürün başına iki sınır eksik.
2. **tb10962Marka:** Tavan yılda 250.000.000 TL olur. Atılım ile birlikte kullanma yasağı Kararda yazıyor. Türk Patent önkoşulu resmî metinde geçmiyor.
3. **tb10962Surdurulebilirlik:** Tavan işletme başına 20.000.000 TL olur.
4. **yatirimTesvik:** 9903 sayılı Karar yürürlüktedir. Son başvuru günü 31 Aralık 2030 Salı günüdür.
5. **teknogirisimRozeti:** Rozet 3 yıl geçerlidir. Bu belge para desteği değildir.
6. **turcorn:** Programda para desteği yoktur. Destek 2 yıl sürer.
7. **vergi11257:** Hizmet ihracatı kazancının tamamı vergiden düşülür.
8. **sgk4447:** Teşvik 31 Aralık 2026 Perşembe günü biter. Bugün süreyi uzatan bir düzenleme yoktur.
9. **asgariUcretDestegi:** Destek her prim günü için 42,33 TL olur. Destek 31 Aralık 2026 Perşembe günü biter.
10. **iskurIep:** Günlük ödemeler doğrudur. Tutarların başlangıç günü resmî sayfada yazmıyor.

## Yakında biten destekler

İki destek 31 Aralık 2026 Perşembe günü biter:

- `sgk4447`
- `asgariUcretDestegi`

Bu iki kaydın 2027 Ocak ayında yeniden doğrulanması gerekir.

## Okunamayan kaynaklar

- Gelir İdaresinin 5746 sayfası okunamadı. Değerler mevzuat.gov.tr sitesinden alındı.
- sanayi.gov.tr teşvik sayfası isteği reddetti. 9903 sayılı Karar yatirimadestek.gov.tr sitesinden okundu.
- Bazı İŞKUR adresleri açılmadı. Ana İEP sayfası okundu.
- İki kaynak yalnız ikincil sitede görüldü. Biri SGK 2026/8 sayılı genelgedir. Öbürü 10769 sayılı Karardır. Bu iki bilgi alan değeri olarak kullanılmadı. JSON dosyası bunları not alanında yazar.
