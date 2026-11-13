/**
 * Kayıt durumu ve sekme çakışması için saf yardımcılar.
 * Tarayıcı deposu dolabilir. Başka bir sekme aynı planı değiştirebilir.
 */
import type { StateStorage } from 'zustand/middleware'
import type { PlanDoc } from '@/data/types'
import { formatDate } from './format'

export const STORAGE_KEY = 'decisionactplan-v1'

export type SaveResult = { ok: true } | { ok: false; error: unknown; quota: boolean }

/** Depo dolu hatası. Tarayıcılar farklı ad kullanır. */
export function isQuotaError(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false
  const err = e as { name?: string; code?: number }
  return err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED' || err.code === 22 || err.code === 1014
}

/**
 * localStorage'ı sarar. Yazma hatasını yutmaz, sonucu geri bildirir.
 * Depo yoksa (gizli pencere, test) bellekte tutar ve bunu bildirir.
 * Aynı içeriği iki kez yazmaz. Böylece iki sekme birbirini sonsuz döngüde uyarmaz.
 */
export function createGuardedStorage(base: Storage | undefined, onResult: (r: SaveResult) => void): StateStorage {
  const memory = new Map<string, string>()
  const lastWritten = new Map<string, string>()
  return {
    getItem: (name) => {
      const unsaved = memory.get(name)
      if (unsaved !== undefined) return unsaved
      try {
        const value = base ? base.getItem(name) : null
        // Okunan içerik yazılmış sayılır. Durum değişikliği aynı içeriği yeniden yazmaz.
        if (value !== null) lastWritten.set(name, value)
        return value
      } catch {
        return null
      }
    },
    setItem: (name, value) => {
      if (lastWritten.get(name) === value) {
        onResult({ ok: true })
        return
      }
      try {
        if (base) {
          base.setItem(name, value)
          memory.delete(name)
        } else memory.set(name, value)
        lastWritten.set(name, value)
        onResult({ ok: true })
      } catch (error) {
        memory.set(name, value)
        onResult({ ok: false, error, quota: isQuotaError(error) })
      }
    },
    removeItem: (name) => {
      try {
        base?.removeItem(name)
      } catch {
        /* silinemeyen kayıt sorun değil */
      }
      memory.delete(name)
      lastWritten.delete(name)
    },
  }
}

/** "13 Kasım 2026 Cuma günü, saat 18:15" biçimi. Çakışmada iki sürümü ayırmak için saat gerekir. */
export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'Tarih belirlenmedi'
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  return `${formatDate(iso)}, saat ${hh}:${mm}`
}

/** Depodaki ham metinden bir planı okur. Bozuk metinde undefined döner. */
export function readStoredPlan(raw: string | null | undefined, planId: string): PlanDoc | undefined {
  if (!raw) return undefined
  try {
    const parsed = JSON.parse(raw) as { state?: { plans?: Record<string, PlanDoc> } }
    return parsed.state?.plans?.[planId]
  } catch {
    return undefined
  }
}

/**
 * Başka sekmenin yazdığı sürüm bizimkinden farklı mı?
 * Farklıysa depodaki sürümü döndürür. Aynıysa ya da plan yoksa undefined döner.
 */
export function detectConflict(raw: string | null | undefined, current: PlanDoc | undefined): PlanDoc | undefined {
  if (!current) return undefined
  const stored = readStoredPlan(raw, current.id)
  if (!stored) return undefined
  return stored.updatedAt !== current.updatedAt ? stored : undefined
}

/** Dosya adı için güvenli ad. */
export function safeFileName(name: string): string {
  return name.replace(/[^\p{L}\p{N}-]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'plan'
}

/** JSON metnini dosya olarak indirir. Yalnız tarayıcıda çalışır. */
export function downloadJson(fileName: string, data: unknown): void {
  if (typeof document === 'undefined') return
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
