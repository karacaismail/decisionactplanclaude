/**
 * JSON katalog kaydından program oluşturur. Saf işlevdir.
 * Katalog verisi JavaScript paketinde durmaz. Uygulama katalog.json dosyasını destek ekranı açılınca indirir.
 * Fayda türleri faydalar.ts dosyasından gelir. Bu küçük tablo kodla birlikte iner.
 */
import { FAYDALAR } from './faydalar'
import type { KatalogKaydi, Program } from './tipler'

export function katalogOlustur(kayitlar: readonly KatalogKaydi[]): Program[] {
  return kayitlar.map((k) => ({ ...k, faydalar: FAYDALAR[k.id] ?? [] }))
}
