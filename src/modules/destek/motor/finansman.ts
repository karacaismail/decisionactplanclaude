/**
 * Finansman görünümünün saf kodu.
 * Görünüm planın kaynak satırlarını ve kişinin yazdığı tutarları gösterir. Yeni tutar hesaplamaz ve toplam almaz.
 * Gider satırı ile başvuru arasındaki bağ destek deposunda durur. Bağ plana yazılmaz.
 */
import type { ResourceDto } from '@/contracts'
import { BASVURU_KIMLIGI, type Basvuru } from './basvuru'

/** Gider bağı. Planın bir kaynak satırına bağlanan başvuruların kimlikleri. */
export interface GiderBagi {
  satirId: string
  basvuruIdleri: string[]
}

/** Kaynak satırının kalıcı kimliği. Kimlik depo anahtarında kullanılır. */
export const SATIR_KIMLIGI = /^[A-Za-z0-9][A-Za-z0-9_-]{0,80}$/

/** Bir satıra en çok bu kadar başvuru bağlanabilir. */
export const EN_COK_BAG = 50

/** Depodan ya da dosyadan gelen bağı okur. Bozuk kimlik atılır. Satır kimliği bozuksa undefined döner. */
export function giderBagiOku(value: unknown): GiderBagi | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  const v = value as Record<string, unknown>
  if (typeof v.satirId !== 'string' || !SATIR_KIMLIGI.test(v.satirId) || !Array.isArray(v.basvuruIdleri)) return undefined
  const idler = v.basvuruIdleri.filter((id): id is string => typeof id === 'string' && BASVURU_KIMLIGI.test(id))
  return { satirId: v.satirId, basvuruIdleri: [...new Set(idler)].slice(0, EN_COK_BAG) }
}

/** Kuruşu "1.250,50 TL" biçiminde yazar. Bilinmeyen tutar "Bilinmiyor" olur. */
export function tlYaz(kurus: number | null): string {
  if (kurus === null || !Number.isFinite(kurus)) return 'Bilinmiyor'
  const isaret = kurus < 0 ? '-' : ''
  const mutlak = Math.abs(kurus)
  return `${isaret}${Math.floor(mutlak / 100).toLocaleString('tr-TR')},${(mutlak % 100).toString().padStart(2, '0')} TL`
}

export interface Cubuk {
  rowId: string
  item: string
  /** Kişinin yazdığı tutar, yazıyla. */
  tutar: string
  /** Çubuğun boyu, en büyük kalemin yüzdesi olarak. Tutar bilinmiyorsa null olur. Bu sayı ekranda yazmaz. */
  oran: number | null
}

/**
 * Kaynak satırlarını çubuğa çevirir. Çubuk boyu en büyük kaleme göre ölçeklenir.
 * Kalemler toplanmaz. Destek çubuğa girmez.
 */
export function cubuklar(kalemler: readonly ResourceDto[]): Cubuk[] {
  const enBuyuk = Math.max(0, ...kalemler.map((k) => k.budgetKurus ?? 0))
  return kalemler.map((k) => ({
    rowId: k.rowId,
    item: k.item,
    tutar: tlYaz(k.budgetKurus),
    oran: k.budgetKurus === null ? null : enBuyuk > 0 ? Math.min(100, Math.max(0, Math.round((k.budgetKurus / enBuyuk) * 1000) / 10)) : 0,
  }))
}

/** İki ya da daha çok mevcut başvuruya bağlanan satırlar. Silinmiş başvurunun bağı sayılmaz. */
export function ikiBasvuruluSatirlar(baglar: readonly GiderBagi[], basvurular: readonly Basvuru[]): Set<string> {
  const mevcut = new Set(basvurular.map((b) => b.id))
  return new Set(baglar.filter((b) => b.basvuruIdleri.filter((id) => mevcut.has(id)).length >= 2).map((b) => b.satirId))
}

/** "Beklenen, kesin değil" listesi. Ret alan ve vazgeçilen başvuru beklenmez. */
export function beklenenDestekler(basvurular: readonly Basvuru[]): Basvuru[] {
  return basvurular.filter((b) => b.durum !== 'ret' && b.durum !== 'vazgecildi')
}
