/**
 * Açık planı modül ekranlarına salt okunur verir. Çekirdek kaynağı açılışta kaydeder.
 * Modül plan deposunu içe aktarmaz. Okuma bu kancayla, yazma planCommands ile yapılır.
 */
import { useSyncExternalStore } from 'react'
import type { ReadonlyPlan } from '@/contracts'

export interface PlanSource {
  getCurrentPlan(): ReadonlyPlan | undefined
  subscribe(listener: () => void): () => void
}

let source: PlanSource = { getCurrentPlan: () => undefined, subscribe: () => () => undefined }

export function registerPlanSource(next: PlanSource): void {
  source = next
}

/* Kanca her çizimde aynı işlevleri alır. Böylece React aboneliği yeniden kurmaz. */
const subscribe = (listener: () => void) => source.subscribe(listener)
const getSnapshot = () => source.getCurrentPlan()

/** Açık planı okur. Plan değişince ekran yeniden çizilir. Dönen nesne canlı plandır. Değiştirilmez. */
export function useCurrentPlanView(): ReadonlyPlan | undefined {
  return useSyncExternalStore(subscribe, getSnapshot)
}
