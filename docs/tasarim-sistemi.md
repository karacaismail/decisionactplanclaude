# Tasarım sistemi (kurumsal sürüm)

Bu belge ekranların uyması gereken ortak kuralları anlatır. Kurallar [1. tur bağımsız eleştiriden](tasarim-elestirisi-1-tur.md) türedi. Kabul testleri `tests/tasarim.spec.ts` dosyasındadır. Test geçmezse ekran bitmiş sayılmaz.

## Yazı

| Öğe | Boyut | Ağırlık | Sınıf veya bileşen |
|---|---|---|---|
| Sayfa başlığı (h1) | 28 px | 600 | `PageHeader` |
| Üst etiket (kicker) | 14 px, büyük harf, 0,08 em aralık | 600 | `.page-kicker` |
| Bölüm başlığı (h2) | 20 px | 600 | `.section-head h2` |
| Alt başlık (h3) | 16 px | 600 | `.section-head h3` |
| Gövde | 16 px, satır 1,5 | 400 | varsayılan |
| Yardımcı metin | 14 px | 400 | `.helper` |

Yalnız 400 ve 600 ağırlık kullanılır. 14 px altı metin yoktur.

## Yüzey ve köşe

- Sayfa zemini `--color-surface-page`. İş yüzeyi `--color-surface-work`. Çukur yüzey `--color-surface-context` yalnız seçili durum ve giriş zemini için kullanılır.
- Köşe yarıçapı iki değerdir: panel 8 px (`--radius-panel`), kontrol 6 px (`--radius-control`).
- Kart yalnız tıklanabilir ya da seçilebilir nesne içindir: plan kartı, sonuç seçeneği. Sınıf `.surface-card`.
- Kart içinde kart yasaktır. Bilgi blokları kart değildir.
- Bölümler `.section` ile ayrılır. İkinci ve sonraki bölümün üstünde 1 px çizgi ve 32 px boşluk vardır.

## Not bloğu

Tek bileşen vardır: `Callout` (`.note`). Solda 3 px düz çizgi durur. Çizginin değdiği köşeler düzdür. Dolgu rengi yoktur. Çizgi rengi üç çeşittir: bilgi (nötr), uyarı (sarı), tehlike (kırmızı). "Günlük Hayattan" ve "Kısaca" gibi içerikler nötr not bloğudur.

## Düğme

- Ekranda bir tane dolu (primary) düğme olur.
- İkincil düğme gri çerçevelidir. Turuncu çerçeveli düğme yoktur.
- Üçüncül düğme yalnız metindir (`type="text"`).
- İşlem grubu en çok üç düğmedir ve sağa yaslıdır. Fazlası "Daha fazla" menüsüne girer.
- Adım ekranında düğmeler 64 px yüksek yapışkan alt şeritte durur (`.action-bar`). Şeridin üstünde 1 px çizgi vardır.
- Silme düğmesi taşma menüsündedir.

## Durum rengi

| Durum | Renk | Nerede |
|---|---|---|
| Geçti, İlerle, Koşullu ilerle | yeşil `statusOk` | etiket, rota, karar rozeti |
| Açık | turuncu `actionPrimary` | rota, menü noktası |
| Kilitli, Beklet | gri `textSecondary` / sarı `statusHold` | etiket, rozet |
| Durdur | kırmızı `statusHarm` | rozet |
| Yeniden dene | mavi `statusInfo` | rozet |
| Yön değiştir | mor `tonePurple` | rozet |

"Zorunlu" ve "Koşullu" gereklilik bildirir, durum değildir. Nötr gri çerçeveli `.tag` ile gösterilir. Bir satırda en çok bir renkli etiket olur.

## KPI şeridi

`KpiStrip` yalnız plan özetinde durur. Dört sayı tek satırdadır. Kutu yoktur. Sayılar arasında 1 px dikey çizgi vardır. Karar ve kapı ekranlarında aynı sayılar tek satır 14 px özet olarak yazılır (`LimitsBar` `compact`).

## Tablo

- Başlık satırı 36 px, 14 px büyük harf. Veri satırı 44 px.
- Tablo kendi kabında yatay kayar. Sayfa kaymaz.
- Hücre kelime ortasından bölünmez. İlk sütun en az 220 px.

## Grafik

Çubuk 24 px, aralık 16 px, desen yok. Tamamlanan koyu mürekkep, kalan açık gri. Eksen yazısı 14 px. Kategori adı metin olur, sayı olmaz. Yükseklik 240 px.

## Kabuk

- Yan menü 240 px. Madde 36 px. Menüde etiket yok. Durum 8 px nokta ile gösterilir.
- Etkin maddenin sol kenarında 3 px düz çizgi vardır. Çizginin değdiği köşeler düzdür.
- Üst şerit 56 px. Solda konum satırı (`nav aria-label="Konum"`). Sağda en çok iki durum etiketi ve tema düğmesi.
- İkon boyutu satır içinde 16 px, menüde 20 px. Renkli ikon kutusu yoktur.

## Boşluk

4 px taban. Bölüm arası 32 px. Blok arası 16 px. Satır içi 8 px. Kart iç boşluğu 20 px. Telefon kenar boşluğu 16 px. İçerik en çok 1.120 px.

## Koyu tema

Zemin, yüzey ve yükseltilmiş yüzey arasında en az yüzde 6 parlaklık farkı vardır. Ana düğme koyu temada da doygun kiremit ve beyaz yazıdır. Seçili durum turuncunun yüzde 12 saydam katmanıdır. Kahverengi ton yoktur.
