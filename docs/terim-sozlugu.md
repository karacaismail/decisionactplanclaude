# Terim sözlüğü

Bu belge ekranda görünen terimlerin tek kaynağıdır. Kullanıcılar bazı eski terimleri anlamadı. Örneğin bir okur "Geçiş kapısı" sözünü tarihî bir saray kapısı sandı. Bu yüzden kullanıcı yeni terimleri 18 Kasım 2026 Çarşamba günü onayladı.

## Hangi metinlerde geçerli?

Yeni terimler görünen bütün metinlerde kullanılır:

- ekrandaki yazılar ve düğmeler,
- ekran okuyucu etiketleri,
- sayfa ve sekme başlıkları,
- raporlar ve indirilen dosyalar,
- yardım metinleri ve komut paleti,
- bu klasördeki güncel belgeler.

## Eski ve yeni terimler

| Eski terim | Yeni terim | Örnek |
|---|---|---|
| Geçiş kapısı | Hazırlık kontrolü | "Hazırlık kontrolünü aç" |
| Geçiş kararı | Hazırlık kararı | "Hazırlık kararı kaydedildi." |
| Kapı | Kontrol | "Kontrol 6", "beş temel kontrol" |
| Kapı kararı | Kontrol kararı | "Her kontrol kararı bir sürüm kaydeder." |
| Pist | Kasa süresi | "Kasa süresi 8 ay." |
| Devir raporu | Teslim raporu | "Strateje teslim raporu" |
| Doğrulama seviyesi | Kanıt düzeyi | "Kanıt düzeyi 3 / 5" |
| Hesap tutuyor | Hesap tutarlı | 5. düzeyin adı |
| Temel taşları | Temel sorular | "Strateji öncesi 20 temel soru" |

Ekleri elle yazın. Sözcüğü körü körüne değiştirmeyin. Örneğin "kapıyı geçti" sözü "kontrolü geçti" olur. "Geçiş kapısına git" sözü de "Hazırlık kontrolüne git" olur.

## Değişmeyen terimler

Kullanıcı şu terimleri olduğu gibi bıraktı:

- Stratej
- Dayanak
- Deneme hakkı

## Değişmeyen anlamlar

Bazı sözcükler başka bir anlam taşır. Bu sözcükler değişmez:

- "Sahte kapı" bir deneme yöntemidir. Henüz olmayan ürün için sayfa açılır.
- Karar 8'deki "devir" işin başka birine devridir. Örneğin "Devir ve kapanış" başlığı kalır.
- "Belirsizlik seviyesi" kanıt düzeyi değildir. Bu ad da kalır.
- Yöntem kitaplığındaki "kapı" gerçek kapıdır. Bu metinler `src/data/models.json` dosyasındadır.
- Kod denetimindeki "kapı" ürün kontrolü değildir. Örneğin "arayüz kapısı" ve "CSS mimari kapısı" adları kalır. Ayrıntı [kalite kapıları belgesindedir](kalite-kapilari.md).

## Kodda ne değişmez?

Kayıtlı planlar çalışmaya devam etmelidir. Bu yüzden şu adlar değişmez:

- kod adları, örneğin `gate` ve `HANDOFF_TITLE`,
- dosya adları, örneğin `devir.spec.ts`,
- adresler, örneğin `/gecis` ve `/devir`,
- kayıt alanları, örneğin `pist` ölçütünün anahtarı.

Eski kayıtlarda eski sürüm adı kalabilir. Örneğin eski bir sürümün adı "Geçiş kapısı: Planlamaya hazır" olabilir. Yazılım bu adları değiştirmez.

## Tarihsel belgeler

Belge haritasında "Tarihsel" yazan belgeler eski terimleri kullanır. Bu belgeler bir karar anını kaydeder. Bu yüzden değiştirilmez. Analiz raporları ve QA kanıtları da yazıldıkları günün terimlerini korur.

## Test

`src/data/terimler.test.ts` testi eski terimleri arar. Test `src` klasörünü ve `index.html` dosyasını tarar. Yorumlara bakmaz. Görünen metinde eski terim kalırsa test başarısız olur.
