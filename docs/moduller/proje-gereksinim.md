# Proje yönetimi: gereksinim analizi

Bu belge "Projeler" bölümünün gereksinimlerini anlatır. Bölüm, numaralı üç aşamanın dışında durur. Bölüm strateji onaylandıktan sonra işe yarar.

## Terimler

- **Proje**, bir ana işi gerçekleştirmek için açılan çalışmadır.
- **İş**, projedeki tek bir yapılacak şeydir.
- **Sorumlu**, işi yapacak kişidir.
- **Pano**, işleri durumlarına göre sütunlarda gösteren görünümdür.
- **Liste**, işleri alt alta gösteren görünümdür.

## Amaç

Strateji uygulama aşaması ne yapılacağını söyler. Projeler bölümü bu işin nasıl yürüdüğünü izler.

Ana işler tablosu niyeti tutar. Örneğin "Amazon satışını büyüt" bir ana iştir. Proje bu niyetin işlerini tutar. Örneğin "Ürün fotoğraflarını yenile" bir iştir.

Bir iş bitince plan kararları eskimez. Uygulama yalnız sayıları günceller. Yazılım karar vermez. Kararı kişi verir.

## Benzer araçlardan alınanlar

Linear, Plane, Jira ve ClickUp incelendi. Bu araçlardan şu fikirler alındı:

- Her işin tek bir durumu vardır.
- Pano ve liste aynı veriyi gösterir.
- İş kısa bir başlıkla hızlıca eklenir.
- İş geciktiğinde ekranda açıkça görünür.

Şu fikirler alınmadı:

- Sprint ve puan tahmini alınmadı. Küçük işletmede bu yük gereksizdir.
- Ekip sunucusu alınmadı. Uygulama ilk sürümde tek cihazda çalışır.
- Sürükleyip bırakma zorunlu tutulmadı. Telefonda durum bir düğmeyle değişir.

## Kayıtlar

**Proje** şu bilgileri taşır:

1. Proje adı.
2. Bağlı olduğu plan.
3. Bağlı olduğu ana iş. Bu bağ isteğe bağlıdır.
4. Başlangıç ve bitiş tarihi.
5. Sorumlu kişi.
6. Kısa açıklama.

**İş** şu bilgileri taşır:

1. İş başlığı.
2. Durum.
3. Sorumlu kişi.
4. Son tarih.
5. Not.

İşin durumu şu beş değerden biridir:

1. "Yapılacak"
2. "Yapılıyor"
3. "Takıldı"
4. "Bitti"
5. "İptal"

## Saklama

Projeler tarayıcıdaki ayrı bir depoda saklanır. Bu depo IndexedDB'dir. IndexedDB, tarayıcının büyük veri için ayırdığı alandır.

Plan dosyası bu depoya yazılmaz. Böylece plan dosyası küçük kalır.

Kişi planı dışa aktarınca projeler de dosyaya girer. Eski plan dosyaları da içe aktarılabilir.

Bir plan silinince o plana bağlı projeler de silinir. Uygulama silmeden önce kişiye sorar.

## Strateji ile bağlantı

1. Kişi "Ana işler" tablosunda bir satır seçer.
2. Kişi "Bu işten proje aç" düğmesine basar.
3. Uygulama projeyi açar ve ana işe bağlar.
4. Ana işler tablosunda projenin durumu küçük bir etiketle görünür.
5. "Uygulama" ekranında projelerin özeti görünür.
6. Sınama adımında kişi proje sonucunu kanıt olarak ekleyebilir. Uygulama bunu taslak olarak hazırlar. Kişi taslağı kaydeder.

## Ekranlar

1. **Projeler listesi** bütün projeleri gösterir.
2. **Proje ekranı** işleri gösterir. Telefonda liste görünümü açılır.
3. **Pano görünümü** işleri beş sütunda gösterir.
4. **İş ekranı** tek bir işin bütün bilgilerini gösterir.

Telefonda pano sütunları yana kaydırılır. Sayfanın kendisi yana kaymaz.

Durumu değiştirmek için kişi işin durum düğmesine basar. Açılan listeden yeni durumu seçer.

## Öncelik

**İlk sürümde zorunlu olanlar:**

- ana işten proje açma,
- iş ekleme, düzenleme ve silme,
- beş durum ve durum düğmesi,
- liste ve pano görünümü,
- geciken işin görünmesi,
- dışa ve içe aktarma.

**İkinci sürümde olması gerekenler:**

- ana işler tablosundaki durum etiketi,
- "Uygulama" ekranındaki proje özeti,
- sınama adımına kanıt taslağı.

**Sonra eklenebilecekler:**

- ekip olarak birden çok cihazda çalışma,
- işe dosya ekleme,
- tekrar eden işler.

## Kabul ölçütleri

1. Bir işin durumu değişince hiçbir karar eskimez.
2. Proje verisi yokken hazırlık kontrolü aynı sonucu verir. Proje verisi varken de aynı sonucu verir.
3. Kişi 320 piksel genişlikte iş ekler ve durumunu değiştirir. Sayfa yana kaymaz.
4. Bütün düğmeler en az 44 piksel boyundadır.
5. Klavye ile bütün işler yapılabilir.
6. Plan dışa aktarılıp geri alınınca projeler kaybolmaz.
