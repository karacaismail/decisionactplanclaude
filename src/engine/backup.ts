/**
 * Yedek durumu. Plan yalnız bu tarayıcıda durur. Tarayıcı verisi silinirse plan kaybolur.
 * Yazılım yedeği kendisi alamaz. Yalnız ne zaman yedek alındığını hatırlar ve uyarır.
 */
import type { PlanDoc } from '@/data/types'

export type BackupState = 'gerekmez' | 'hic' | 'eski' | 'guncel'

/** Yedek bu kadar günden eskiyse uyarı çıkar. */
export const BACKUP_DAYS = 7

const hasValue = (x: unknown): boolean => x !== undefined && x !== null && x !== '' && !(Array.isArray(x) && x.length === 0)

export function backupState(plan: PlanDoc, lastBackupAt: string | undefined, now = new Date()): BackupState {
  const hasData = Object.values(plan.steps).some((rec) => Object.values(rec.values ?? {}).some(hasValue))
  if (plan.example || !hasData) return 'gerekmez'
  if (!lastBackupAt) return 'hic'
  const days = (now.getTime() - new Date(lastBackupAt).getTime()) / 86_400_000
  return days > BACKUP_DAYS ? 'eski' : 'guncel'
}
