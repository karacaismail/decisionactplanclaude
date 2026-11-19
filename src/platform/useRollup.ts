/**
 * Modül özetini React ekranına verir. Özet değişince ekran yeniden çizilir.
 * Çekirdek bu kancayla etiket gösterir. Çekirdek modül kodunu içe aktarmaz.
 */
import { useMemo, useSyncExternalStore } from 'react'
import { readRollupFrom, readRollupRaw, subscribeRollups } from './rollups'

const getSnapshot = () => readRollupRaw()
const getServerSnapshot = () => null

/** Planın modül özetini okur. Plan yoksa ya da özet yoksa undefined döner. */
export function useRollup<T = unknown>(moduleId: string, planId: string | undefined): T | undefined {
  const raw = useSyncExternalStore(subscribeRollups, getSnapshot, getServerSnapshot)
  return useMemo(() => (planId ? readRollupFrom<T>(raw, moduleId, planId) : undefined), [raw, moduleId, planId])
}
