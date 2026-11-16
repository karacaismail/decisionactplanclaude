# Geliştirme karar notları

Bu dosya Karar Atlası'nın yazılım geliştirme notlarını toplar. Notları ürün sahibi verir. Claude notları yazıya geçirir ve koddaki karşılığını gösterir.

Her not dört parçadan oluşur:

1. Notun kendisi
2. Bugün kodda ne var?
3. Geliştirmede ne yapılacak?
4. Ne olunca bitmiş sayılır?

Notların hiçbiri henüz koda işlenmedi. Geliştirme başlayınca her not için önce başarısız olan bir test yazılır. Sonra kod yazılır.

## Not 1. Seçenekler "mevcut düzen" ile karşılaştırılır

Ürün sahibi bu notu 16 Kasım 2026 Pazartesi günü verdi.

### Notun kendisi

İngiltere Hazinesi yatırımdan önce seçenekleri karşılaştırır. Her seçeneğin maliyetine, faydasına ve riskine bakar. Başlangıç noktası şu sorudur: "Mevcut düzen sürerse ne olur?" Hazine bu yöntemi "Green Book" adlı rehberinde anlatır.

Bir örnek verelim. Bir belediye yeni otobüs almayı düşünür. Belediye bu seçeneği bir başka seçenekle karşılaştırabilir: aynı araçlarla sefer saatlerini değiştirmek. İki seçeneğin de karşısında mevcut düzen durur.

### Bugün kodda ne var?

- 2.2 "Seçenekler" adımı en az iki yol ister. Kaynak: `src/data/steps/strateji.ts`.
- 2.2 adımında "mevcut düzen sürerse" satırı yok.
- 2.2 adımında her yol için maliyet, fayda ve risk sütunu yok.
- Strateji öncesindeki iki adımda bu fikir zaten var. Adım 09 rakip tablosunda "Hiçbir şey yapmamak" seçeneği var. Adım 11 "Çözüm yolları" tablosunda "Bugünkü yöntem" ilk satırda hazır geliyor. Kaynak: `src/data/steps/karar3.ts`.

### Geliştirmede ne yapılacak?

1. 2.2 adımında ilk satır hazır gelir. Satırın adı "Mevcut düzen sürerse" olur.
2. Kullanıcı bu satırı silemez. Satırın açıklamasını değiştirebilir.
3. Bu satır "en az iki yol" sayısına girmez. Yani kullanıcı yine en az iki gerçek yol yazar.
4. Her yol için üç sütun eklenir: maliyet, fayda ve risk.
5. Mevcut düzen satırı da aynı üç sütunla doldurulur.
6. 2.3 "Sınama" adımı mevcut düzeni de aynı ölçütle sınar.
7. 2.4 "Seçim ve vazgeçiş" adımında karar sahibi mevcut düzeni de seçebilir. Ekran bu seçimi "şimdilik değiştirmiyoruz" diye kaydeder.

### Ne olunca bitmiş sayılır?

- Yeni bir planda 2.2 adımı açılınca "Mevcut düzen sürerse" satırı görünür.
- Kullanıcı bu satırı silmeye çalışınca satır silinmez.
- Yalnız mevcut düzen ve bir yol yazılırsa adım tamamlanmaz.
- Eski planlar açılınca veri kaybolmaz. Eski planlara mevcut düzen satırı eklenir.

## Not 2. Stratejinin yaptırdığı iş, istenen sonuca bağlanır

Ürün sahibi bu notu 16 Kasım 2026 Pazartesi günü verdi.

### Notun kendisi

Bir iş ile bir sonuç aynı şey değildir:

- **İş**, şirketin yaptığı şeydir. Örneğin sefer saatlerini değiştirmek.
- **Sonuç**, işin yaratması istenen değişimdir. Örneğin bekleme süresinin 8 dakikadan 5 dakikaya inmesi.

Her iş bir sonuca hizmet etmelidir. Hiçbir sonuca hizmet etmeyen iş boşa harcanan emektir. Hiçbir işle desteklenmeyen sonuç ise yalnız bir dilektir.

### Bugün kodda ne var?

- 2.5 "Ana hamleler" adımı hamleleri yazdırıyor.
- 3.1 "Hedef ve gösterge" adımı hedefleri yazdırıyor.
- 3.2 "Ana işler ve sorumlular" adımı işleri yazdırıyor. İşin sütunları iş, sorumlu ve bitiş tarihidir.
- İş ile hedef arasında bir bağ yok. Hamle ile hedef arasında da bir bağ yok. Kaynak: `src/data/steps/strateji.ts`.
- Güvenilir strateji yöntemleri raporu bu eksiği de buldu. Rapor bu bağa "strateji haritası" diyor. Kaynak: `reports/Güvenilir strateji yöntemleri.md`.

### Geliştirmede ne yapılacak?

1. 3.2 adımındaki her işe bir sütun eklenir: "Hangi hedefe hizmet ediyor?" Kullanıcı 3.1 adımındaki hedeflerden birini seçer.
2. 2.5 adımındaki her hamle en az bir 3.1 hedefine bağlanır.
3. Hiçbir hedefe bağlanmayan iş için ekran uyarır.
4. Hiçbir işle desteklenmeyen hedef için ekran uyarır.
5. Gözden geçirmede ekran bu bağı gösterir. Örneğin hedef tutmazsa o hedefe bağlı işler listelenir. Böylece "teslim aksadı" ile "dayanak çöktü" daha kolay ayrılır.
6. 3.1, 3.2 ve 3.3 adımları yine hiçbir kapı kararını eskitmez. Bu bağ yalnız uyarı ve görünüm içindir.

Sunucu sürümünde bu bağ Plan modülünün içinde kalır. İş ve hedef aynı modüldedir. Bu yüzden bağ bir bağlantı alanıyla kurulabilir. Kaynak: `docs/butunlesik-gelistirme-raporu.md`, 5.2 ve 6.1 bölümleri.

### Ne olunca bitmiş sayılır?

- 3.2 adımında her işin yanında hedef seçimi görünür.
- Hedefe bağlanmamış bir iş kaydedilince uyarı çıkar.
- İşi olmayan bir hedef için uyarı çıkar.
- 3.1, 3.2 ya da 3.3 değişince hiçbir kapı kararı eskimez. Bu davranışı bugünkü koruma testleri de denetler.

## Bekleyen iş: kısa yoldaki D5 ve D7 sorunu

Ürün sahibi bu işi 15 Kasım 2026 Pazar günü erteledi. Geliştirme başlayınca ilk ele alınacak iş budur.

**Sorun.** Hazırlık kapısında 7 destekleyici ölçüt var. Bunların en az 4'ü karşılanmalı. D5 ve D7 ölçütleri Adım 04'e bağlı. Kısa yol Adım 04'ü gizliyor. Bu yüzden kısa yolu seçen kullanıcı bu iki ölçütü karşılayamıyor. Ayrıca senaryolar bölümü yalnız pazar yeniyse ya da düzenleme yüksekse açılıyor. Köklü bir pazarda D7 hiç karşılanamıyor.

**Kaynak.** `src/engine/readiness.ts`, `src/data/steps/karar1.ts` ve `reports/Güvenilir strateji yöntemleri.md`.

**Ne olunca bitmiş sayılır?** Kısa yolu seçen bir kullanıcı da gerçek bilgiyle "Planlamaya hazır" sonucuna ulaşabilir. Bunu bir test gösterir.
