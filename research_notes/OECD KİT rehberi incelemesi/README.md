# OECD KİT rehberi incelemesinin ham çıktıları

Bu klasör OECD rehberinin kelime kelime incelemesini saklar. Rehberin adı "OECD Guidelines on Corporate Governance of State-Owned Enterprises 2024"tür. Birleşik sonuçlar iki belgededir:

- [OECD bulgu belgesi](../../docs/oecd-kit-rehberi-bulgulari.md)
- [OECD kaynak haritası](../../docs/oecd-kaynak-haritasi.md)

Bu klasördeki dosyalar o iki belgenin dayanağıdır. Birleşik belgeleri okuduysanız bu klasöre bakmanız gerekmez.

## İnceleme nasıl yapıldı?

1. Rehberin PDF dosyası metne çevrildi. Metin 1814 cümle birimine bölündü. Toplam 40437 kelime vardır.
2. Birimler sekiz ajana bölündü. Her ajan kendi sayfa aralığını aldı. Aralıklar `plan.json` dosyasındadır.
3. Her ajan her birim için bir defter satırı yazdı. Satırda Türkçe özet, Karar Atlası notu ve kaynak atfı vardır.
4. Her ajan kendi bulgu ve kaynak belgesini yazdı.
5. Bir ajan sekiz parçayı iki birleşik belgede topladı.

İnceleme 16 Kasım 2026 Pazartesi günü başladı. İnceleme 20 Kasım 2026 Cuma günü bitti.

| Ajan | Sayfalar | Birim |
|---|---|---|
| claude1 | 1 ile 15 | 233 |
| claude2 | 16 ile 29 | 316 |
| claude3 | 30 ile 38 | 217 |
| claude4 | 39 ile 47 | 205 |
| claude5 | 48 ile 56 | 226 |
| claude6 | 57 ile 65 | 221 |
| codex1 | 66 ile 73 | 202 |
| codex2 | 74 ile 82 | 194 |

## Klasördeki dosyalar

| Dosya ya da klasör | Ne içerir? |
|---|---|
| `corpus/units.jsonl` | Rehberin bütün cümle birimleri. Metin İngilizcedir. |
| `corpus/units_pages.jsonl` | Rehberin sayfa sayfa düz metni |
| `birimler_<ajan>.jsonl` | Her ajana verilen birimler |
| `ajan_ciktilari/defter_<ajan>.jsonl` | Her ajanın birim birim defteri |
| `ajan_ciktilari/bulgular_<ajan>.md` | Her ajanın bulgu belgesi |
| `ajan_ciktilari/kaynaklar_<ajan>.md` | Her ajanın kaynak belgesi |
| `gorevler/` | Ajanlara verilen görev metinleri |
| `plan.json` | Sayfa aralıkları ve birim sayıları |
| `tools/extract.py` | PDF dosyasını birimlere bölen araç |
| `test_*.py` | Dört test |

## Testler nasıl çalışır?

Testleri bu klasörde çalıştırın. Her test başarısız olursa sıfırdan farklı bir kodla çıkar.

Kapsama testi iki şeyi sınar. Birimler sayfa metninin bütün kelimelerini sırasıyla taşımalıdır. Her birim tam bir kez bir defterde yer almalıdır.

```bash
python3 test_kapsama.py corpus ajan_ciktilari plan.json
```

Defter testi tek bir ajanın defterini sınar.

```bash
python3 test_defter.py claude5 ajan_ciktilari/defter_claude5.jsonl
```

Belge testi tek bir ajanın bulgu ve kaynak belgesini sınar.

```bash
python3 test_md.py claude5 ajan_ciktilari
```

Birleşik test iki birleşik belgeyi sınar.

```bash
python3 test_birlesik.py ../../docs/oecd-kit-rehberi-bulgulari.md ../../docs/oecd-kaynak-haritasi.md ajan_ciktilari
```

## Lisans ve atıf

Rehberin lisansı CC BY 4.0'dır. Bu klasördeki İngilizce metin rehberin kendisidir. Türkçe özetler rehberin bir uyarlamasıdır.

Atıf şudur: OECD (2024), OECD Guidelines on Corporate Governance of State-Owned Enterprises 2024, OECD Publishing, Paris, https://doi.org/10.1787/18a24f43-en.

Rehber uyarlamalar için şu cümleyi ister:

> This is an adaptation of an original work by the OECD. The opinions expressed and arguments employed in this adaptation should not be reported as representing the official views of the OECD or of its Member countries.

Türkçesi şudur: Bu metin OECD'nin özgün bir eserinin uyarlamasıdır. Bu uyarlamadaki görüşler ve gerekçeler OECD'nin ya da üye ülkelerinin resmî görüşü sayılmamalıdır.

Rehber OECD logosunun izinsiz kullanılmasını yasaklar. Bu klasör logoyu kullanmaz.
