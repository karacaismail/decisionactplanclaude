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

Modül verisinin anahtarı üç parçadır: modül, plan ve kayıt. Örneğin `proje/plan-1/proje/p-3`. Kayıt parçası da bölünebilir. Proje modülü projeyi `proje/<kimlik>` altında tutar. Görevi `is/<kimlik>` altında tutar.

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

Hedef takibi 3.2 adımının "Şimdi" işlerine bağlanır. Bağın anahtarı işin kimliğidir. Bu yüzden iki kural vardır:

1. "Şimdi" listesi önce işlenir. Kimliği olan iş kimliğini hep korur.
2. Kimliksiz iş kimlik alınca hedef takibi bağı da yeni kimliğe taşınır.

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

## Proje modülü

Proje modülü 19 Kasım 2026 Perşembe günü çalışır hâle geldi. Modül şu işleri yapar:

1. Kişi bir ana hamleden ya da "Şimdi" işinden proje açar.
2. Kişi projeye kısa başlıkla görev ekler.
3. Kişi görevin durumunu durum düğmesiyle değiştirir.
4. Kişi görevleri liste ya da pano olarak görür. Pano kendi kutusunda yana kayar.
5. Son tarihi geçen açık görev "Gecikti" yazısı ve ikonla görünür.

Projenin küçük çalışmalarına "görev" denir. "İş" sözü strateji uygulamadaki işlerindir. Örneğin "İlk 90 günün işleri" bu işlerdir. Görev ekranının adresi değişmedi. Adres yine `/projeler/<proje>/is/<görev>` biçimindedir.

Modül her yazmadan sonra küçük bir özet yazar. Özet `decisionactplan-rollups-v1` anahtarındadır. Özette proje sayısı, açık görev, geciken görev ve biten görev vardır. Özet ayrıca her bağlı satırın sayılarını taşır.

İçe alınan proje verisi önce denetlenir. Bozuk ya da sınırı aşan veri yazılmaz. Bir planda en çok 200 proje olabilir. Bir projede en çok 500 görev olabilir.

## Çekirdek proje özetini nasıl okur?

Çekirdek proje modülünü içe aktarmaz. Çekirdek yalnız özeti okur. Yol şöyledir:

1. Altyapıdaki `subscribeRollups` işlevi özet değişince haber verir. Öteki sekmenin yazdığı özet de haber olur.
2. Altyapıdaki `useRollup` kancası özeti React ekranına verir.
3. Çekirdekteki `src/engine/projectRollup.ts` dosyası özeti denetler. Bozuk özet yok sayılır.

Özet şu yerlerde görünür:

- 2.5 adımındaki her ana hamlenin altında bir etiket durur.
- 3.2 adımındaki her "Şimdi" işinin altında da etiket durur.
- "Strateji uygulama" ekranında "Projeler" kartı durur. Proje yoksa kart görünmez.

Etiket açık görevleri sayar. Geciken görev metin ve ikonla görünür. Etiketteki bağlantı Projeler ekranını açar. Adres `?satir=<kimlik>` parçasını taşır. Projeler ekranı o satırı getirir ve satırın düğmesine odaklanır.

Strateji onaylanmadıysa etikette bağlantı yoktur. Kartta da bağlantı yoktur. Örneğin strateji 3.5 bölümünde yeniden açılabilir. O zaman Projeler ekranı proje göstermez. Bu yüzden bağlantı da gösterilmez. Proje modülü kayıtlı değilse etiket ve kart görünmez.

Özet 4 KB sınırına sığmazsa bazı satırlar eksik kalır. Eksik satırın etiketi "Projeleri gör" der. "Proje aç" demez.

Özet geciken görevi yazıldığı güne göre sayar. Hesap günü bugün değilse etiket ve kart bu günü yazar. Bir görev değişince özet yenilenir.

## Taslakları kim inceler?

Taslağı bir kişi inceler. Çekirdekteki `DraftReview` bileşeni bekleyen taslakları gösterir.

- Adım taslağı kendi adım ekranında görünür.
- Kanıt taslağı "Strateji uygulama" ekranında, 3.5 bölümünde görünür.

Kişi "Kaydet" düğmesine basarsa taslak plana yazılır. Kişi "Sil" düğmesine basarsa taslak silinir. Silme onay ister. Plan yalnız "Kaydet" ile değişir.

Aynı kanıt metni iki kez taslak olmaz. Kanıt defterinde aynı metin varsa da yeni taslak açılmaz. Kanıt kaydı karar sürümünü ve kontrolleri değiştirmez.

Proje ekranında "Kanıt taslağı hazırla" düğmesi vardır. Düğme projenin sonucunu kısa bir metne çevirir. Metin taslak olarak saklanır.

## Örnek plan yeniden açılınca ne olur?

Örnek plan zaten varsa ekran önce sorar. Soru iki yolda aynıdır. Kişi örneği menüden açabilir. Kişi örnek dosyasını içe de alabilir.

Kişi onaylarsa yeni örnek eskisinin yerine geçer. Örneğe bağlı projeler ve destek başvuruları olduğu gibi kalır. Dosyadaki modül verisi bu durumda alınmaz. Böylece eski dosya yeni kayıtların üzerine yazılmaz. Silinmiş kayıt da geri gelmez. Ekran bunu soruda ve uyarıda söyler.

Örnek silinmişse dosyadaki modül verisi yazılır. İçe alma önce bekleyen silme işlerinin bitmesini bekler. Böylece silinen planın temizliği yeni veriyi silmez.

Plan silinirken onay metni bunu söyler: "Planın projeleri ve destek başvuruları da silinir."

## Çekirdek destek özetini nasıl okur?

Destek modülü her başvuru yazımından sonra özet yazar. Özette başvuru sayısı ve durumların sayısı vardır. Çekirdek bu özeti `src/engine/supportRollup.ts` dosyasıyla okur. Çekirdek destek modülünü içe aktarmaz.

Özet şu yerlerde görünür:

- Adım 02 kaynak sınırını sorar. Profilde "Dış para" seçildiyse bu adımda "Olası destekler" bağlantısı durur. Bağlantı uygun destekler ekranını açar.
- 3.3 adımında "Destek başvuruları" satırı durur. Satır başvuru sayısını ve durumları yazar. Başvuru yoksa satır görünmez.

Destek parası kesin para sayılmaz. İki yer de bunu açıkça yazar. 3.3 satırında "Beklenen, kesin değil" başlığı ayrı durur. Bağlanan toplam para değişmez. Uçtan uca test bu toplamı başvurudan önce ve sonra karşılaştırır.

## Yedek

Her yedek modül verisini de taşır. Planlar ekranındaki "JSON indir" düğmesi paket yazar. Pano ekranındaki yedek düğmesi de paket yazar. Çıktılar ekranında güncel taslağın JSON dosyası da paket olur. Eski sürümün JSON dosyası yalnız donmuş planı taşır. Bu dosya yedek sayılmaz.

Bütün planları tek dosyaya yazan bir dışa aktarma yoktur. Her plan kendi dosyasına yazılır.

## Bu sürümün sınırları

- Proje modülünün ekranları çalışır. Destek modülünün ekranları yalnız açıklama ve boş durum gösterir.
- Plan silinirken modül verisi silinemezse uyarı yalnız konsola yazılır. Kalan veriyi sonradan temizleyen bir iş henüz yoktur.
- Çekirdek yolların listesi iki yerde durur. Liste `src/platform/manifest.ts` ve `src/app/routes.tsx` dosyalarındadır. Yeni çekirdek yol eklenince iki liste de güncellenir.
