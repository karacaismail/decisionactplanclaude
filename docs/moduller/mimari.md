# Modül mimarisi

Bu belgeyi Claude 19 Kasım 2026 Perşembe günü yazdı. Belge modüllerin çekirdeğe nasıl bağlandığını anlatır.

## Amaç

Uygulamaya iki yeni bölüm eklenir. İlk bölüm proje yönetimidir. İkinci bölüm destek ve teşviktir.

Bu iki bölüm sıralı sürecin parçası değildir. Numaralı üç aşama aynı kalır. Bu iki bölüm o aşamaların yanında durur.

Yeni bölüm eski kodu bozmamalı. Yeni bölüm hiçbir kontrol kararını değiştirmemeli.

## Terimler

| Terim | Anlamı |
|---|---|
| Çekirdek | Var olan uygulama. Üç aşama, kontroller ve plan dosyası çekirdektedir. |
| Modül | Çekirdeğin yanına eklenen bölüm. Örneğin proje yönetimi bir modüldür. |
| Bildirim | Modülün kendini tanıttığı dosya. Dosyanın adı `manifest.ts` dosyasıdır. |
| Sözleşme | Modülün planı okuduğu tek yol. Klasörü `src/contracts` klasörüdür. |
| Altyapı | Modüllerin ortak araçları. Klasörü `src/platform` klasörüdür. |
| Taslak | Modülün önerdiği değişiklik. Bir kişi taslağı kaydedene kadar plan değişmez. |
| Paket dosyası | Planı ve modül verisini birlikte taşıyan dosya. |
| Kapı | Kodu denetleyen kontrol. Kapı hata bulursa iş durur. |

## Klasörler

| Klasör | Ne durur? | Kimi içe aktarabilir? |
|---|---|---|
| `src/modules/proje` | Proje yönetimi modülü | Kendini, sözleşmeyi, altyapıyı, ortak bileşenleri ve temayı |
| `src/modules/destek` | Destek ve teşvik modülü | Kendini, sözleşmeyi, altyapıyı, ortak bileşenleri ve temayı |
| `src/contracts` | Okuma sözleşmesi | Yalnız plan tiplerini ve saf okuyucuları |
| `src/platform` | Modül altyapısı | Yalnız kendini ve npm paketlerini. Sözleşmeden yalnız tip alır. |

Çekirdek modül dosyası içe aktarmaz. Modül klasörünü yalnız `src/platform/modules.ts` dosyası tarar.

## Yeni modül nasıl eklenir?

Yeni modül için ortak dosya değişmez. Şu adımlar yeterlidir:

1. `src/modules/<ad>` klasörünü açın.
2. Klasöre `manifest.ts` dosyasını yazın.
3. Bildirime kimliği, sürümü ve CSS önekini yazın. Örneğin proje modülünün öneki `pj-` önekidir.
4. Bildirime menü bağlantılarını ve rotaları yazın.
5. Ekranları `screens` klasörüne yazın. Ekran dosyasının adı önekle başlar. Örneğin `PjProjelerScreen.tsx`.
6. Ekranın CSS dosyasını `src/styles/ekran` klasörüne aynı adla yazın.

Uygulama bildirimi açılışta okur. Menü ve rotalar kendiliğinden eklenir.

Bildirim React içe aktarmaz. Ekranlar yalnız dinamik içe aktarmayla gelir. Bu yüzden modül kodu ilk açılışta inmez.

## Veri nerede durur?

| Veri | Yer | Neden? |
|---|---|---|
| Plan | `decisionactplan-v1` anahtarı | Çekirdeğin dosyası. Modül bu dosyaya yazmaz. |
| Modül verisi | IndexedDB, `decisionactplan-modules` veritabanı | Büyük veri localStorage sınırına sığmaz. |
| Küçük özetler | `decisionactplan-rollups-v1` anahtarı | Pano özeti beklemeden okur. Her özet en çok 4 KB olur. |
| Taslaklar | `decisionactplan-drafts-v1` anahtarı | Taslak plandan ayrı durur. Bu yüzden hiçbir karar eskimez. |

Modül verisinin anahtarı üç parçadır: modül, plan ve kayıt. Örneğin `proje/plan-1/proje-3`.

Depo bir arayüzün arkasındadır. Arayüzün adı `KvStore` arayüzüdür. Tarayıcıda IndexedDB kullanılır. Testte bellek deposu kullanılır.

Bir sekme veriyi değiştirince öteki sekmeler haber alır. Bu iş için BroadcastChannel kullanılır.

## Modül plana nasıl yazar?

Modül plana doğrudan yazmaz. Modül yalnız taslak önerir. Yol şöyledir:

1. Modül `proposeStepDraft` komutuyla adım taslağı önerir.
2. Modül `appendEvidenceDraft` komutuyla kanıt taslağı önerir.
3. Çekirdek taslağı denetler ve ayrı yerde saklar. Plan değişmez.
4. Bir kişi taslağı inceler.
5. Kişi taslağı kaydeder. Kayıt adım ekranıyla aynı yoldan geçer.

Komutlar profile ve sınırlara dokunmaz. Profil ya da sınır değişirse bütün kararlar eskir. Bu yüzden Adım 00 ve Adım 02 için taslak önerilemez.

Kilitli bölüme taslak kaydedilmez. Bu kural adım ekranındaki kuralla aynıdır.

## Plan silinince ve taşınınca ne olur?

Her modül bir yaşam döngüsü dosyası yazar. Dosya geç yüklenir. Çekirdek şu anlarda modüle haber verir:

1. Plan silinince modül o planın verisini siler. Özetler ve taslaklar da silinir.
2. Plan dışa aktarılınca modül kendi verisini dilim olarak verir.
3. Plan içe alınınca modül dilimi yeni plan kimliğine yazar.

Bir modülün hatası planı durdurmaz. Hata uyarı olarak görünür.

## Dosya biçimi

Modül verisi yoksa dışa aktarma eski düz plan dosyasını yazar. Eski sürüm bu dosyayı okumaya devam eder.

Modül verisi varsa dışa aktarma paket dosyası yazar. Paket şu alanları taşır:

```json
{ "kind": "decisionactplan-bundle", "bundleVersion": 1, "plan": {}, "modules": {} }
```

İçe alma iki biçimi de kabul eder. Düz plan dosyası en çok 8 MB olabilir. Paket dosyası en çok 32 MB olabilir. Paketin içindeki plan da en çok 8 MB olabilir.

## Satır kimlikleri

Proje, bir ana hamleye bağlanır. Satırın sırası değişse de bağ kopmamalı. Bu yüzden satırlar kalıcı kimlik alır.

Kimlik alan satırlar şunlardır:

- Ana hamleler, yani 2.5 adımı
- Göstergeler, yani 3.1 adımı
- İşler, yani 3.2 adımı
- Kaynaklar, yani 3.3 adımı

Kayıt sürümü 4 oldu. Uygulama eski kaydı açınca kimliği eksik satıra kimlik yazar. Bu iş adım durumunu, plan sürümünü ve eskime işaretini değiştirmez. İş iki kez çalışınca sonuç değişmez.

Sürüm 3 kaydında yalnız bu iş çalışır. Eski taşımalar yeniden çalışmaz. Böylece strateji kilidi değişmez.

Kimlik plan içinde tektir. Eski sürüm bazı listelere aynı kimliği yazmıştı. Örneğin iki listede `satir-0` olabilir. Bu durumda ilk satır kimliğini korur. Sonraki satır yeni kimlik alır.

## Gezinme

Telefonda alt menü beş bağlantıdır. Sıra şöyledir: Planlar, Pano, Yol, Projeler ve Menü.

"Projeler" bağlantısı yalnız plan açıkken görünür. Strateji onaylanmadan proje açılmaz. Bu durumda ekran nedenini söyler.

Menüde "Destek ve teşvik" ayrı bir gruptur. Grup üç aşamanın altında durur. Grubun numarası yoktur. Destek programları listesi plan istemez.

Geniş ekranda iki bağlantı üst menüde durur. Bu bağlantılar "Projeler" ve "Destek ve teşvik" bağlantılarıdır.

## Kapılar

`npm run lint` komutu şu kapıları çalıştırır:

1. Modül sınır kapısı `scripts/check-module-boundaries.mjs` dosyasıdır. Kapı yanlış yönde içe aktarmayı durdurur. Örneğin modül plan deposunu içe aktaramaz.
   - Kapı içe aktarma zincirini de izler. Plan deposuna yazan bir bileşen modülde kullanılamaz.
   - Modül altyapının çekirdeğe ayrılmış parçalarını kullanamaz. Örneğin `registerPlanSource` işlevi çekirdeğindir.
   - Modüldeki dinamik içe aktarmanın yolu sabit metin olur.
2. CSS mimari kapısı modül CSS dosyalarını da denetler. Modül CSS dosyasının adı önekle başlar. Her seçici de önekle başlar. Örneğin `.pj-bos-ekran` seçicisi geçerlidir.

Boyut kapısı `npm run build` içinde çalışır. Kapı modül ekranlarını bildirimden bulur. Modül kodu ilk açılışa girerse kapı durur. İlk açılış sınırları değişmedi.

Uçtan uca test modül rotalarını bildirimden okur. Test her modül ekranını ölçer. Taşma, yazı boyutu ve dokunma alanı ölçülür.

## Bu sürümün sınırları

- Modül ekranları yalnız açıklama ve boş durum gösterir. Asıl işler sonraki sürümde gelir.
- Taslakları gösteren ekran henüz yoktur. Taslak kaydetme işlevi hazırdır.
- Plan silinirken modül verisi silinemezse uyarı yalnız konsola yazılır. Kalan veriyi sonradan temizleyen bir iş henüz yoktur.
- Çekirdek yolların listesi iki yerde durur. Liste `src/platform/manifest.ts` ve `src/app/routes.tsx` dosyalarındadır. Yeni çekirdek yol eklenince iki liste de güncellenir.
