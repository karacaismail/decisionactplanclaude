# Girişimci Aksiyon Planı

Bu araç stratejik planlamadan önce yapılacak işleri yaptırır. Araç her iddia için kanıt ister. Dayanak yeterliyse araç strateji çalışmasını açar.

Aracın bitiş çizgisi geçiş kapısıdır. Karar sahibi orada şu soruya cevap verir: "Dayanak yeterli mi?" Yazılım öneri üretir. Kararı karar sahibi kaydeder.

Strateji çalışmasını stratej yürütür. Stratej, stratejiyi geliştiren kişinin unvanıdır. Stratej yolu önerir ve gerekçesini kurar. Karar sahibi seçer ve kaydeder. Yazılım stratej için "Strateje devir raporu" üretir. Yazılım yol seçmez.

## Yol

Yol dört bölümdür. Bölümler sırayla açılır.

| Sıra | Bölüm | İçerik | Bitiş |
|---|---|---|---|
| 1 | Temel | Karar 1 ile Karar 5 arası. Adım 00 ile Adım 18 arası. Sorun, talep, para, risk ve yol adayları yazılır. | Kapı 5 |
| 2 | Geçiş kapısı | 9 zorunlu ve 7 destekleyici ölçüt. Karar sahibi devir raporunu okur. | Geçiş kararı |
| 3 | Strateji çalışması | Adım 19 ve Adım 20. Geçiş kararı olmadan açılmaz. | Strateji karar dosyası |
| 4 | Uygulama | Karar 6, 7 ve 8. Adım 21 ile Adım 34 arası. Strateji çalışması bitmeden açılmaz. | Kapı 8 |

Geçiş kapısının üç sonucu vardır: "Planlamaya hazır", "Koşullu hazır" ve "Henüz hazır değil". Temel verisi sonradan değişirse geçiş kararı yeniden inceleme ister. Kilit ve eskime kurallarının tamamı [süreç haritasındadır](docs/surec-haritasi.md).

Uygulama telefon için tasarlanır. Ant Design, ECharts ve Phosphor Icons kullanır. Sunucu yoktur. Veri tarayıcıda durur.

Canlı sürüm: https://karacaismail.github.io/decisionactplanclaude/

## Belgeler

Sürecin tek güncel kaynağı [süreç haritasıdır](docs/surec-haritasi.md). Aşağıdaki öteki belgeler bir karar anını kaydeder. Bir belge süreç haritasıyla çelişirse süreç haritası geçerlidir.

- Güncel süreç, kilitler ve eskime kuralları: [docs/surec-haritasi.md](docs/surec-haritasi.md)
- Alan adları: [docs/alan-sozlesmesi.md](docs/alan-sozlesmesi.md)
- Strateji tanımı, boşluk analizi ve uygulama notu: [docs/strateji-tanimi-bosluk-ve-bilinmeyen-analizi.md](docs/strateji-tanimi-bosluk-ve-bilinmeyen-analizi.md)
- Gerçek deneme föyü: [docs/gercek-deneme-foyu.md](docs/gercek-deneme-foyu.md)
- Sonraki ana aşamaların planı: [docs/sonraki-ana-asamalar-plani.md](docs/sonraki-ana-asamalar-plani.md)
- Karar Kitabı'ndan alınan üç yardımın planı: [docs/karar-kitabi-firsatlari-plani.md](docs/karar-kitabi-firsatlari-plani.md)
- Codex önerilerinin uygulama notu: [docs/codex-onerileri-uygulama-notu.md](docs/codex-onerileri-uygulama-notu.md)
- Codex uygulamasıyla karşılaştırma ve veri bütünlüğü kuralları: [docs/codex-uygulamasi-karsilastirma-raporu.md](docs/codex-uygulamasi-karsilastirma-raporu.md)
- Araştırma analizi ve yedi ekleme: [docs/arastirma-analizi-ve-strateji-oncesi-ekleme-raporu.md](docs/arastirma-analizi-ve-strateji-oncesi-ekleme-raporu.md)
- Strateje devir raporunun planı: [docs/strateje-devir-uygulama-plani.md](docs/strateje-devir-uygulama-plani.md)
- Amaç ve ilk boşluk analizi: [docs/stratejik-planlama-oncesi-bosluk-ve-eylem-plani.md](docs/stratejik-planlama-oncesi-bosluk-ve-eylem-plani.md)
- İlk ön yüz uygulama planı: [docs/uygulama-plani-on-yuz.md](docs/uygulama-plani-on-yuz.md)
- Uzlaşmış ön yüz planı: [docs/act_components_uzlasma.md](docs/act_components_uzlasma.md)
- Claude ön yüz planı: [docs/act_components_claude.md](docs/act_components_claude.md)
- Codex ön yüz planı: [docs/act_components_codex.md](docs/act_components_codex.md)
- Kaynak plan, Claude sürümü: [docs/act_plan_v5_final-claude.md](docs/act_plan_v5_final-claude.md). Uygulamanın bu plandan ayrıldığı yerler süreç haritasının 8. bölümündedir.
- Kaynak plan, Codex sürümü: [docs/act_plan_v5_final-codex.md](docs/act_plan_v5_final-codex.md)

## Çalıştırma

```bash
npm ci
npm run dev
```

## Kalite kapıları

Kapı, kodu denetleyen bir kontroldür. Kapı bir hata bulursa iş durur. Üç kapı vardır:

1. `npm run lint` komutu TypeScript tip denetimini ve arayüz kapısını çalıştırır. Arayüz kapısı `scripts/check-ui.mjs` dosyasıdır. Bu kapı beş kuralı denetler. Kurallar yazı boyutu, hareket, odak halkası, kenar çizgisi ve cihaz bayrağıdır.
2. `npm run test:unit` komutu Vitest birim testlerini çalıştırır.
3. `npm run test:e2e:ci` komutu Playwright duman testini çalıştırır. Test yalnız Chromium kullanır. Test 320 ve 1280 piksel genişlikte çalışır.

Üçünü birden şu komutla çalıştırırsınız: `npm run ci`. CI aynı sırayı her `main` gönderiminde çalıştırır. Bir kapı kırmızıysa yayın yapılmaz. Ayrıntılar [docs/kalite-kapilari.md](docs/kalite-kapilari.md) dosyasındadır.

## Çıktılar ve sürümler

Çıktılar ekranı üç belge üretir: strateje devir raporu, yönetici raporu ve girişimci aksiyon planı. Her kapı kararı bir sürüm kaydeder. "Sürüm" seçicisinden eski bir sürümü açabilirsiniz. "Bu sürümü sabitle" düğmesi güncel taslağı yeni sürüm olarak kaydeder. Örnek planda rapor başında "Örnek plan. Gerçek veri değildir." uyarısı görünür.

## Yazım kuralı

Bütün Türkçe metinler yalın yazılır. Okurken desteğe ihtiyaç duyan kişinin anlayacağı kadar yalın. Tarihler "13 Kasım 2026 Cuma günü" biçiminde gösterilir.

## Lisans

Lisans henüz seçilmedi. Repo herkese açıktır. Lisans dosyası eklenmeden kodun yeniden kullanım koşulları belirsizdir.
