/**
 * Sekmeler arası bildirim. Bir sekme modül verisini değiştirince öteki sekmeler haber alır.
 * BroadcastChannel yoksa bildirim yalnız aynı sekmede kalır. Veri yine doğru yazılır.
 */
export interface ModuleChange {
  moduleId: string
  planId: string
}

export const CHANNEL_NAME = 'decisionactplan-modules'

type Listener = (change: ModuleChange) => void
const listeners = new Set<Listener>()
let channel: BroadcastChannel | null | undefined

function getChannel(): BroadcastChannel | null {
  if (channel !== undefined) return channel
  channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL_NAME)
  channel?.addEventListener('message', (event: MessageEvent<unknown>) => {
    const data = event.data as Partial<ModuleChange> | null
    if (data && typeof data.moduleId === 'string' && typeof data.planId === 'string') emit({ moduleId: data.moduleId, planId: data.planId })
  })
  return channel
}

function emit(change: ModuleChange) {
  for (const listener of [...listeners]) {
    try {
      listener(change)
    } catch (error) {
      console.error('Modül bildirimi işlenemedi.', error)
    }
  }
}

/** Değişikliği bu sekmeye ve öteki sekmelere bildirir. */
export function publishModuleChange(change: ModuleChange): void {
  emit(change)
  try {
    getChannel()?.postMessage(change)
  } catch {
    /* Kapanmış kanal bildirimi durdurur. Veri yine yazılmıştır. */
  }
}

/** Değişiklikleri dinler. Dönen işlev aboneliği kapatır. */
export function subscribeModuleChanges(listener: Listener): () => void {
  getChannel()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
