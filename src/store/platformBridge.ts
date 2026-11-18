/**
 * Çekirdeği modül altyapısına bağlar. Açılışta bir kez çalışır.
 * 1. Açık planı salt okunur kaynak olarak kaydeder.
 * 2. Plan komutlarının çekirdek uygulamasını kaydeder.
 * 3. Plan silinince o planın taslaklarını siler.
 */
import { registerPlanCommands } from '@/platform/planCommands'
import { registerPlanSource } from '@/platform/planSource'
import { addPlanDeletedListener } from '@/platform/lifecycle'
import { corePlanCommands, discardPlanDrafts } from './drafts'
import { usePlanStore } from './planStore'

registerPlanSource({
  getCurrentPlan: () => {
    const s = usePlanStore.getState()
    return s.currentId ? s.plans[s.currentId] : undefined
  },
  subscribe: (listener) => usePlanStore.subscribe(listener),
})
registerPlanCommands(corePlanCommands)
addPlanDeletedListener(discardPlanDrafts)
