# Girişimci Aksiyon Planı

Bu araç stratejik planlamadan önce yapılacak işleri yaptırır. Her iddia için kanıt ister. Sonunda dayanak yeterliyse strateji çalışmasını açar.

Aracın bitiş çizgisi geçiş kapısıdır. Karar sahibi orada şu soruya cevap verir: "Dayanak yeterli mi?" Yazılım öneri üretir. Kararı karar sahibi kaydeder.

## Yol

Yol dört bölümdür. Bölümler sırayla açılır.

| Sıra | Bölüm | İçerik | Bitiş |
|---|---|---|---|
| 1 | Temel | Karar 1 ile Karar 5 arası. Sorun, talep, para ve risk kanıtla öğrenilir. | Kapı 5 |
| 2 | Geçiş kapısı | 9 zorunlu ve 6 destekleyici ölçüt. | Geçiş kararı |
| 3 | Strateji çalışması | Adım 18, 19 ve 20. Geçiş kararı olmadan açılmaz. | Strateji karar dosyası |
| 4 | Uygulama | Karar 6, 7 ve 8. İlk teslim, tekrar ve işin geleceği. | Kapı 8 |

Geçiş kapısının üç sonucu vardır: "Planlamaya hazır", "Koşullu hazır" ve "Henüz hazır değil". Temel verisi sonradan değişirse geçiş kararı yeniden inceleme ister.

Uygulama telefon için tasarlanır. Ant Design, ECharts ve Phosphor Icons kullanır. Sunucu yoktur. Veri tarayıcıda durur.

Canlı sürüm: https://karacaismail.github.io/decisionactplanclaude/

## Belgeler

- Amaç, boşluk analizi ve geçiş kapısı kuralı: [docs/stratejik-planlama-oncesi-bosluk-ve-eylem-plani.md](docs/stratejik-planlama-oncesi-bosluk-ve-eylem-plani.md)
- Ön yüz uygulama planı: [docs/uygulama-plani-on-yuz.md](docs/uygulama-plani-on-yuz.md)
- Uzlaşmış ön yüz planı: [docs/act_components_uzlasma.md](docs/act_components_uzlasma.md)
- Claude ön yüz planı: [docs/act_components_claude.md](docs/act_components_claude.md)
- Codex ön yüz planı: [docs/act_components_codex.md](docs/act_components_codex.md)
- İş kuralları, Claude sürümü: [docs/act_plan_v5_final-claude.md](docs/act_plan_v5_final-claude.md)
- İş kuralları, Codex sürümü: [docs/act_plan_v5_final-codex.md](docs/act_plan_v5_final-codex.md)

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

Çıktılar ekranı üç belge üretir: temel belgesi, yönetici raporu ve girişimci aksiyon planı. Her kapı kararı bir sürüm kaydeder. "Sürüm" seçicisinden eski bir sürümü açabilirsiniz. "Bu sürümü sabitle" düğmesi güncel taslağı yeni sürüm olarak kaydeder. Örnek planda rapor başında "Örnek plan. Gerçek veri değildir." uyarısı görünür.

## Yazım kuralı

Bütün Türkçe metinler yalın yazılır. Okurken desteğe ihtiyaç duyan kişinin anlayacağı kadar yalın. Tarihler "13 Kasım 2026 Cuma günü" biçiminde gösterilir.

## Lisans

Lisans henüz seçilmedi. Repo herkese açıktır. Lisans dosyası eklenmeden kodun yeniden kullanım koşulları belirsizdir.
