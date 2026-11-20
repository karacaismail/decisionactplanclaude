/**
 * Destek programları kataloğu. Yalnız testler ve denetim bu dosyayı içe aktarır.
 * Veri katalog.json dosyasındadır. Uygulama bu dosyayı kancalar.ts içinden ağdan indirir.
 *
 * Kaynak: önceki destek ve teşvik çalışmasındaki 46 program. Bu verinin ilk kontrolü 12 Ağustos 2026 Çarşamba günüdür.
 * 44 program 20 Kasım 2026 Cuma günü resmî kaynaklardan yeniden doğrulandı. Ayrıntı: docs/moduller/dogrulama.
 * Doğrulanan alanlar kaynak adresi, alıntı ve kontrol günüyle durur. Kaynaksız alan "bilinmiyor" kalır.
 * Koşul, gider ve belge metinleri alan alan doğrulanmadı. Bu metinler metinKontrol gününü taşır.
 * Katalog denetimi: programlar.test.ts ve katalogDogrulama.test.ts
 */
import KATALOG from './katalog.json'
import { katalogOlustur } from './katalog'
import type { KatalogKaydi, Program } from './tipler'

export const PROGRAMLAR: readonly Program[] = katalogOlustur(KATALOG as unknown as readonly KatalogKaydi[])
