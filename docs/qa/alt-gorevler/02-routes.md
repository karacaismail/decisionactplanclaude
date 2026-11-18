# Rota listesi alt görevi

Bu dosya alt görevin ara raporudur. Son sonuçlar [ana bulgu raporundadır](../mobil-bulgular.md).

Rota, uygulamada bir ekranı açan yoldur. Bu görevde yalnız `tests/uyarlanir/routes.ts` değişti. Bu rapor da görev kapsamında eklendi.

## Değişiklik

`AuditRoute` alanları ve `auditRoutes` dışa aktarımı korundu. Mevcut yardımcı işlevlerin imzaları değişmedi.

Kod artık ekranı ve yönlendirmeyi TypeScript sözdizimi ağacından okur. Bu ağaç, kaynak kodun parçalarını ayrı ayrı gösterir. Bilinmeyen ekran artık sessizce “İş 1” sayılmaz. Kod, iş sahibi tanımsızsa açık hata verir. `Navigate` yönlendirmelerinin sahibi açıkça “İş 1” olarak kayıtlıdır.

Kod, kararlarla adım listesini karşılaştırır. Eksik adım, tekrarlanan kimlik ve yanlış karar eşleşmesi hata verir. Strateji adımları da bu karşılaştırmaya dahildir.

Kod, çözemediği rota biçimini atlamaz. Örneğin değişkenden gelen yol veya yeni parametre hata verir. Ekranı içine alan üst parça da tanımlı olmalıdır. Bu parçaya kodda sarmalayıcı denir. Yinelenen yollar ve eksik zorunlu rota aileleri de hata verir.

Yönlendirme hedefi listede bulunmalıdır. Bir yönlendirme başka yönlendirmeye gidiyorsa kod son hedefi kaydeder. Bir döngü oluşursa kod hata verir.

## Kaynakta görülen sorunlar

- Önceki kod, `owners[screen] ?? 'İş 1'` ile bilinmeyen ekranı sınıflandırıyordu.
- Ekran adı eşleşmezse önceki kod ekranı `Navigate` sayıyordu.
- Önceki kod yalnız doğrudan metin olarak yazılmış `path` değerlerini okuyordu. Diğer biçimler sessizce atlanabiliyordu.
- Yönlendirme araması, `to` özelliğinin sırasına ve çift tırnağa bağlıydı.
- Kararlarla adımların eşleşmesi denetlenmiyordu. Tekrarlanan veya eksik kayıtlar açık hata üretmiyordu.
- Boş olmayan liste yeterli sayılıyordu. Bütün adım rotası silinse bile liste oluşturulabiliyordu.

Bu bulgular kaynak incelemesine dayanır. Başarısız test sonucu üretilmedi.

## Beklenen kapsam

Aşağıdaki sayılar mevcut kaynak dosyalardan çıkarıldı. Kod çalıştırılarak doğrulanmadı.

| Yol grubu | Beklenen kayıt sayısı | Kaynak |
|---|---:|---|
| Sabit ekran yolları | 16 | `src/app/routes.tsx` |
| Karar ekranları | 8 | `DECISIONS` |
| Adım ekranları | 42 | `STEP_LIST` |
| Karar kapıları | 8 | `DECISIONS` |
| Stratejiye eski bağlantılar | 2 | `src/app/routes.tsx` |
| Bilinmeyen yol örneği | 1 | `path="*"` |
| Toplam | 77 | 22 rota tanımı |

Liste, 19 ekran bileşenini kapsamalıdır. `WorkRoute`, `WorkScreen` ekranını açan sarmalayıcı olarak kayıtlı kalır.

Adımlar gerçek karar numarasıyla eşleşir:

| Karar numarası | Adım kimlikleri | Adım sayısı |
|---|---|---:|
| 1 | `00`, `01`, `02`, `03`, `04` | 5 |
| 2 | `05`, `06`, `07`, `08` | 4 |
| 3 | `09`, `10`, `11`, `12` | 4 |
| 4 | `13`, `14`, `15` | 3 |
| 5 | `16`, `17`, `18` | 3 |
| 9, strateji | `S21`, `S22`, `S23`, `19`, `S25`, `20` | 6 |
| 6 | `U31`, `U32`, `U33`, `21`, `22`, `23`, `24`, `25` | 8 |
| 7 | `26`, `27`, `28`, `29`, `30`, `31`, `32` | 7 |
| 8 | `33`, `34` | 2 |

Örneğin `19` adımı `/karar/9/adim/19` yoluyla açılır. `U31` adımı `/karar/6/adim/U31` yoluyla açılır. Kod, sayı içeren adımlardaki baştaki sıfırı korur.

`/karar/9` ve `/karar/9/kapi` yollarının hedefi `/strateji` olarak kalır. Strateji, sekiz karar kapısına dokuzuncu kapı olarak eklenmez. `*` kalıbı için `/qa-bilinmeyen-rota` denenir. Bu yolun beklenen hedefi `/` olarak kaydedilir.

## Bağımlı kontroller ve sınırlar

Liste, örnek planın açık olduğu mevcut denetim akışını esas alır. `RequirePlan`, plan yokken kullanıcıyı `/` yoluna gönderir. Bu koşullu durum ayrı test gerektirir. `AuditRoute` bu durum için genişletilmedi.

Kaynakta bazı adımlar planın durumuna göre kilitlenir. Bütün yolları açmak, bütün formların düzenlenebilir olduğunu kanıtlamaz. Ana ajan, kilitli ve açık durumları ayrı değerlendirmelidir.

Mevcut `ekranlar.spec.ts`, hedef adresi ve sayfadaki yazıyı denetler. Beklenen ekran kimliğini doğrudan doğrulamaz. Ana ajan, yanlış ekran gösterilmesini yakalayan bir kontrol eklemelidir. Bu öneri için başka dosya değiştirilmedi.

Yeni rota özellikleri veya yeni sarmalayıcılar önce burada açıkça desteklenmelidir. Örneğin rota içinde yeni `Suspense` kullanımı bugün hata verir. Bu durum eksik kapsamın başarı gibi görünmesini önler.

`tsconfig.json`, `tests` klasörünü kapsamıyor. Bu nedenle mevcut `npm run lint`, bu dosyanın tür kontrolünü tek başına sağlamaz. Ana ajan, test dosyalarının tür kontrolünü ayrıca değerlendirmelidir.

Ana ajan şu davranışları doğrulamalıdır:

1. Mevcut kaynakla 77 benzersiz yol oluşmalıdır.
2. Yukarıdaki 42 adımın her biri doğru kararla eşleşmelidir.
3. Sekiz kapı ve üç yönlendirme kaydı doğru olmalıdır.
4. Bilinmeyen ekran ve çözülemeyen rota açık hata vermelidir.
5. Tek tırnak ve sabit JSX ifadeleri doğru okunmalıdır.
6. `Navigate` özelliklerinin sırası sonucu değiştirmemelidir.
7. Eksik kayıt, yinelenen yol ve yönlendirme döngüsü reddedilmelidir.

## Sürüm kanıtı

| Araç | Manifest aralığı | Kilit dosyası | Kurulu paket |
|---|---|---|---|
| TypeScript | `^5.9.3` | `5.9.3` | `5.9.3` |
| React Router | `^7.18.5` | `7.18.5` | `7.18.5` |
| Playwright | `^1.64.1` | `1.64.1` | `1.64.1` |

Node sürümü `process.version` ile `v24.21.0` olarak gözlendi. Paket sürümleri manifest dosyalarından okundu. Bu paketlerle test veya uygulama çalıştırılmadı.

## Doğrulama durumu

- Kaynak incelemesi tamamlandı. Kod ayrıca elle incelendi.
- Testler `not_run` durumundadır. Görev talimatı testleri ana ajana bırakır.
- Tür kontrolü, lint ve derleme `not_run` durumundadır.
- Tarayıcı, ekran görüntüsü, ağ ve gerçek cihaz kontrolleri `not_run` durumundadır.
- CI, yani uzak otomatik kontroller, `not_run` durumundadır.
- Bağımsız inceleme `not_run` durumundadır. Bu görev yeniden alt ajan başlatmayı yasaklar.

Yazım denetimi 0 hata ve 1 uyarı verdi. Uyarı, uzun kelimelerle ilgiliydi. Kelimeler elle incelendi. Sarmalayıcı teriminin açıklaması eklendi.

Çalıştırılan dosya kontrolleri şunlardır:

```sh
node /Users/w6x/.claude/skills/coding-standards/scripts/yalin-turkce-denetim.mjs --tur aciklama docs/qa/alt-gorevler/02-routes.md
git diff --no-index --check /dev/null tests/uyarlanir/routes.ts
git diff --no-index --check /dev/null docs/qa/alt-gorevler/02-routes.md
```

İki Git komutu 1 koduyla bitti. Dosyalar yeni olduğu için `/dev/null` karşılaştırması fark içerir. Komutlar boşluk uyarısı yazmadı. Bu kontroller test veya tür kontrolü değildir.

Sunucu başlatılmadı. Paket kurulmadı. Yeni test dosyası yazılmadı. `src` ve paket dosyaları değiştirilmedi. Git kaydı veya uzak gönderim yapılmadı.

Ana ajan testleri depo kökünde çalıştırmalıdır. Mevcut ekran testi komutu şöyledir:

```sh
npm run test:e2e -- tests/uyarlanir/ekranlar.spec.ts --project=chromium-320
```

Bu komut burada çalıştırılmadı. Kaynak incelemesi çalışma zamanı başarısı sayılmaz.

## Bağımsız ek inceleme

Bu bölüm `tests/uyarlanir/fare.spec.ts` için bağımsız kaynak incelemesidir. İnceleyici bu fare testini yazmadı. Bu turda kaynak ve test dosyaları değiştirilmedi. Test, tarayıcı veya uygulama çalıştırılmadı.

İki bulgu var. İlk bulgu yüksek, ikinci bulgu orta önceliklidir. Testin başarı kapsamı bu bulgular giderilmeden genişletilmemelidir.

### FARE-01: Ekran değişimi tamamlanma kaydı sayılıyor

Öncelik yüksektir. Testin başlığı, Adım 00'ın tamamlandığını söylüyor. Ancak test yalnız Adım 01'e geçişi ve “Kaydedildi” yazısını denetliyor. Yenilemeden sonra da yalnız yedi seçeneği denetliyor. Adımın “Tamam” durumu hiç okunmuyor.

Testin ilgili yerleri `tests/uyarlanir/fare.spec.ts:60` ve `tests/uyarlanir/fare.spec.ts:70` satırlarında başlıyor.

Kaynakta bu boşluğu önemli yapan somut bir durum var:

1. `src/screens/WorkScreen.tsx:209`, tamamlamada `persist(values, 'tamam')` çağırıyor.
2. Aynı dosyanın 179. satırı, profil adımında yalnız `setProfile(next)` çağırıyor.
3. Bu yol, verilen `tamam` durumunu kullanmıyor.
4. `src/engine/changes.ts:160`, yalnız profil alanlarını değiştiriyor. Adım kaydını yazmıyor.
5. `src/data/types.ts:272`, yeni planın adım kayıtlarını boş başlatıyor.
6. `src/screens/DecisionScreen.tsx:24`, durumunu bulamadığı adımı “Boş” gösteriyor.

Dolayısıyla mevcut kaynakta seçimlerin saklanması, Adım 00'ın tamamlanma kaydını sağlamıyor. Test bu farkı yakalamıyor. Kaynak incelemesi bu sonucu destekliyor. Tarayıcıda başarısızlık gösterilmedi.

Ana ajan, yenilemeden sonra Adım 00'ın “Tamam” durumunu da denetlemelidir. Adımın ayrıntısı veya Karar 1 tablosu kullanılabilir. Bu kontrol yalnız ekrana geçişi değil, kaydedilmiş sonucu doğrulamalıdır. Uygulama düzeltmesi İş 4 sahibine bildirilmelidir. Bu incelemede uygulama değiştirilmedi.

### FARE-02: Plan adı ve başlangıç seçimi yeniden okunmuyor

Öncelik ortadır. Test, “Fare deneme planı” adını giriyor. “Yeni bir fikrim var” seçeneğine de tıklıyor. Ancak yenilemeden sonra bu iki bilgiyi yeniden okumuyor.

Testin ilgili yerleri `tests/uyarlanir/fare.spec.ts:23`, `tests/uyarlanir/fare.spec.ts:32` ve `tests/uyarlanir/fare.spec.ts:70` satırlarında başlıyor.

Kaynakta bu bilgiler ayrı saklanıyor. `src/screens/PlansScreen.tsx:89`, adı `createPlan` işlevine veriyor. `src/data/types.ts:264`, adı planın `name` alanına yazıyor. `src/screens/StartScreen.tsx:33`, başlangıç seçimini planın `entry` alanına yazıyor. Sonraki iki satır konumu değiştirip ekrana geçiyor.

Örneğin plan adı yanlış kaydedilse mevcut test bunu yakalamaz. Başlangıç seçimi kaydedilmese de doğru ekrana geçiş denetimi yeterli kalır. Bu iki durum için çalışma zamanı hatası gözlenmedi. Bulgu, testin doğrulamadığı sonuçlarla sınırlıdır.

Ana ajan, yenilemeden sonra plan adını üst şeritten doğrulamalıdır. Adın kaynağı `src/app/AppShell.tsx:182` satırındadır. Ardından başlangıç ekranındaki seçimi yeniden okumalıdır. Seçimin kaynaktan yüklenmesi `src/screens/StartScreen.tsx:26` satırında yapılır. Bu kontrollerden önce test, adı veya seçimi yeniden yazmamalıdır.

### Desteklenen davranışlar ve kapsam sınırı

- Test, boş adla “Oluştur” düğmesinin kapalı olduğunu denetliyor. Ad yazıldıktan sonra düğmenin açılmasını da denetliyor.
- Test, başlangıç seçeneğinin üzerine gelince seçilmediğini denetliyor. Tıklamadan sonra seçimi ve “Devam et” düğmesini doğruluyor.
- Testteki yedi seçenek, Adım 00'ın yedi zorunlu alanıyla eşleşiyor. Kaynak `src/data/steps/karar1.ts:19` ile başlayan alan listesidir.
- Test, her seçeneğin tıklama öncesinde seçili olmadığını denetliyor. Üzerine gelmek tek başına seçim yapmamalıdır.
- Test gerçek `page.reload()` çağrısını içeriyor. Yenilemeden sonra yedi seçeneği ekrandan tekrar okuyor. Bu bölüm yalnız “Kaydedildi” yazısına dayanmıyor.
- Test, yenilemeden sonra seçimleri yeniden yazmıyor. Yardımcı `ready` işlevi de plan verisi eklemiyor.
- Uygulama, profil değerlerini `localStorage` adlı tarayıcı deposunda saklıyor. Kaynaklar `src/store/planStore.ts:77` ve `src/store/planStore.ts:234` satırlarıdır.
- Adresin yenilemeden sonra aynı kalması, `lastLocation` alanının saklandığını kanıtlamaz. Tarayıcı zaten aynı adresi yeniler. Plan listesinden yeniden açma bu testin kapsamında değildir.
- `persistedChoices: 'pass'` kaydı, yenileme sonrası seçenek kontrollerinden sonra yazılıyor. Kaydın sırası kendi başına erken başarı sorunu oluşturmuyor.
- Dokunma projeleri açıkça atlanıyor. Mevcut yapılandırmada fare testi masaüstü Chromium ve WebKit projelerinde çalışacak. Hibrit giriş kapsamı bu testten çıkarılamaz.

Bu olumlu noktalar kaynak incelemesidir. Çalıştırılmış test sonucu değildir. Bu turda çalışma zamanı doğrulaması `not_run` olarak kaldı.

## Beklenen ekran başlığı

`tests/uyarlanir/routes.ts`, artık `expectedHeading(route: AuditRoute): string` işlevini dışa aktarır. İşlev, beklenen görünür `h1` metnini döndürür. `AuditRoute` alanları ve `auditRoutes` korundu. Mevcut rota çıkarma kodu bu ekleme için genişletilmedi.

Başlık kaynakları şunlardır:

- Sabit ekran başlıkları, ilgili ekranın `PageHeader.title` değerinden alındı. Yeni başlık eşleştirmesi bu değerleri açıkça tutar.
- Adım, `STEP_LIST` içindeki gerçek karar ve kimliğiyle bulunur. Başlık, ekranın kullandığı `stepHeading` işlevinden gelir. Böylece `00`, `S21` ve `U31` gibi kimliklerin gösterimi korunur.
- Karar ekranının başlığı `DECISIONS` içindeki `question` alanından gelir.
- Kapının başlığı `Kapı n. başlık` biçimindedir. Başlık metni ilgili kararın `gate.title` alanından gelir.
- Strateji oluşturma başlığı `STRATEGY.question` alanından gelir.
- Strateji uygulama başlığı `clusterOf('uygulama').question` alanından gelir.
- Özet ekranının başlığı `buildDemoPlan().name` değerinden gelir. Kaynak `src/data/demo.ts:99` satırında “Örnek: Mahalle kafesi” adını tanımlar.

`PageHeader`, `title` değerini doğrudan `h1` içine yazar. `documentTitle` ise tarayıcı sekmesinin adını belirler. Bu yüzden sekme adı başlık eşleştirmesinde kullanılmadı.

Yönlendirmede işlev, `auditRoutes` listesinden son hedef ekranı bulur. `/karar/9` ve `/karar/9/kapi`, strateji oluşturma sorusunu bekler. Bilinmeyen yol örneği, yönlendirme sonrasında “Planlar” başlığını bekler. Hedef, karar, adım veya başlık bulunamazsa işlev hata verir.

İşlev mevcut örnek planla yapılan ekran denetimi içindir. Başka bir planın adı bu işlevin kapsamı değildir. Kullanıcı `ekranlar.spec.ts` bağlantısını kendisi yapacak. Bu dosya değiştirilmedi.

Beklenen kullanım şöyledir:

```ts
await expect(page.getByRole('main').getByRole('heading', {
  level: 1,
  name: expectedHeading(route),
  exact: true,
})).toBeVisible()
```

Bu turda yalnız kaynak incelemesi ve yazım denetimi yapıldı. Test, tür kontrolü ve tarayıcı doğrulaması `not_run` olarak kaldı. Başlık eşleştirmesinin çalışma zamanı sonucu henüz doğrulanmadı.
