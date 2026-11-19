/**
 * Tarih yardımcıları. Saf işlevlerdir. Tarih "YYYY-AA-GG" metni olarak saklanır.
 * Ekranda tarih "18 Aralık 2026 Cuma" biçiminde görünür.
 */

const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
const GUNLER = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
const BICIM = /^(\d{4})-(\d{2})-(\d{2})$/

/** Metindeki tarihi parçalara ayırır. Takvimde olmayan gün için undefined döner. */
function parcala(deger: unknown): { yil: number; ay: number; gun: number } | undefined {
  if (typeof deger !== 'string') return undefined
  const m = BICIM.exec(deger)
  if (!m) return undefined
  const yil = Number(m[1])
  const ay = Number(m[2])
  const gun = Number(m[3])
  const d = new Date(Date.UTC(yil, ay - 1, gun))
  if (d.getUTCFullYear() !== yil || d.getUTCMonth() !== ay - 1 || d.getUTCDate() !== gun) return undefined
  return { yil, ay, gun }
}

/** Değer "YYYY-AA-GG" biçiminde gerçek bir gün mü? */
export function tarihGecerliMi(deger: unknown): deger is string {
  return parcala(deger) !== undefined
}

/** "2026-12-18" değerini "18 Aralık 2026 Cuma" yapar. Boş ya da bozuk değerde boş metin verir. */
export function tarihYaz(deger: string): string {
  const t = parcala(deger)
  if (!t) return ''
  const gunAdi = GUNLER[new Date(Date.UTC(t.yil, t.ay - 1, t.gun)).getUTCDay()]
  return `${t.gun} ${AYLAR[t.ay - 1]} ${t.yil} ${gunAdi}`
}

const iki = (n: number) => String(n).padStart(2, '0')

/** Verilen anın yerel takvimdeki gününü "YYYY-AA-GG" olarak verir. */
export function bugunIso(simdi: Date): string {
  return `${simdi.getFullYear()}-${iki(simdi.getMonth() + 1)}-${iki(simdi.getDate())}`
}
