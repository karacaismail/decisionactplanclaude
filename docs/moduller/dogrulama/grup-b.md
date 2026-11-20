# B grubu: destek kataloğu doğrulaması

Bu belge B grubundaki 16 programın kontrol sonucunu anlatır. Kontrol 20 Kasım 2026 Cuma günü yapıldı.

Ayrıntılar `grup-b.json` dosyasındadır. Her değerin kaynak adresi ve alıntısı o dosyadadır.

## Kısa sonuç

| Sonuç | Program sayısı |
|---|---|
| Doğrulandı | 6 |
| Değişti | 8 |
| Kaldırıldı | 1 |
| Bulunamadı | 1 |

## Önce düzeltilmesi gerekenler

1. İşletme Geliştirme programını kapalı gösterin. KOSGEB bu programı 15 Nisan 2024 Pazartesi günü başvuruya kapattı.
2. Girişimci programının iş geliştirme tavanını düzeltin. Yeni tavan 2.250.000 TL olur. Öncelikli gruplarda 250.000 TL eklenir.
3. Küresel Rekabetçilik tavanını düzeltin. Kredi en az 30.000.000 TL, en çok 75.000.000 TL olur.
4. İş Kurma desteğinin metnini değiştirin. Kuruluş giderleri desteği artık yok.
5. Yapay Zekâ Kredisinin alt sınırını silin. KOSGEB 500.000 TL alt sınırı kaldırdı.
6. Eximbank kaydının adına karar verin. Katalogdaki ürün adı Eximbank listesinde yok.

## Doğrulanan programlar

Bu programlarda katalogdaki ana bilgi doğru çıktı:

- Girişimci programı, faiz ve kâr payı desteği
- KOBİ Dijital Dönüşüm programı
- Kredi Garanti Fonu kefaleti
- Türkiye Kalkınma Fonu, Teknoloji ve İnovasyon Fonu
- Bireysel Katılım Sermayesi
- Emlak Konut İnovasyon Platformu

## Değişen programlar

### Girişimci programı, İş Kurma Desteği

Kuruluş giderleri desteği kaldırıldı. Yerine iki destek geldi. Birincisi platform giderleri desteğidir. İkincisi performans desteğidir. Performans desteği 8 brüt asgari ücret kadardır. Başvurular sürekli alınır.

### Girişimci programı, İş Geliştirme Desteği

Tavan 2.250.000 TL oldu. Destek oranı yüzde 80 olarak kaldı. 2026 yılının 3. başvuru dönemi 31 Ekim 2026 Cumartesi günü kapandı. Sonraki dönemin tarihi bulunamadı.

### Yapay Zekâ Kredisi

Üst sınır 5.000.000 TL olarak kaldı. Alt sınır kaldırıldı. Son başvuru günü 31 Aralık 2026 Perşembe günüdür.

### Kapasite Geliştirme programı

Alt ve üst sınır aynı kaldı. Savunma, havacılık ve uzay tedarikçisinde üst sınır 30.000.000 TL olur. 2026 yılının 3. dönemi 15 Eylül 2026 Salı günü kapandı.

### Küresel Rekabetçilik programı

Alt sınır 30.000.000 TL oldu. Üst sınır 75.000.000 TL oldu. 2026 yılının 1. dönemi 30 Eylül 2026 Çarşamba günü kapandı.

### TEKMER programı

TEKMER programı kaldırılan destekler listesinde duruyor. Yerine "Teknoloji Merkezi Destek Programı" geldi. Bu programa işletme doğrudan başvuramaz. Başvuruyu merkezi işleten kuruluş yapar.

### İstanbul Kalkınma Ajansı

Şu an açık bir çağrı var. Son başvuru günü 4 Aralık 2026 Cuma günüdür. Proje başına destek en çok 20.000.000 TL olur. Ancak şirketler bu çağrıya başvuramaz. Kamu kurumları, odalar, dernekler ve üniversiteler başvurabilir.

### Tech Istanbul Growth

Başvuru dönemi geçmiş görünüyor. Sayfada seçim tarihi "30 Eylül" yazıyor. Yanında yıl yazmıyor. Bu yüzden tarih kayda girmedi.

## Bulunamayan program

Eximbank listesinde "Döviz Kazandırıcı Hizmetler Kredisi" adında bir ürün yok. Döviz kazandıran hizmet firmaları başka krediler kullanabilir. Örneğin İhracata Hazırlık Kredisine başvurabilirler.

## Birlikte kullanma

Bu ilişkiler resmî metinde açıkça yazıyor:

- İş Kurma Desteği ile İş Geliştirme Desteği birlikte kullanılabilir.
- İş Geliştirme Desteği ile faiz ve kâr payı desteği birlikte kullanılamaz.
- Kapasite ve Küresel programlarında KGF kefaleti kullanılabilir.
- KGF, KOSGEB geri ödemeli destekleri için kefil olabilir.

Katalogdaki öteki ilişkilerin çoğuna resmî kaynak bulunamadı. Bu ilişkiler JSON dosyasına girmedi.

## Kontrolün sınırları

- Kaynakların hepsi kurumların kendi sitesidir. İkincil kaynak kullanılmadı.
- Dört sitenin metni JavaScript ile açılıyor. Bu sitelerin metni izole bir tarayıcıyla okundu.
- Bazı değerler yalnız tablo hücresinde yazıyor. Bu değerlerin alıntısı boş bırakıldı.
- Kurum süreleri çoğu programda yazmıyor. Bu süreler "Bilinmiyor" kalmalıdır.
- Gerçek okurla denenmedi.
