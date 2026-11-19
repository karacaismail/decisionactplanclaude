/**
 * Modüllerin plana yazma yolu. Modül PlanDoc nesnesine doğrudan yazmaz.
 * Modül yalnız taslak önerir. Taslağı bir kişi inceleyip kaydeder.
 * Komutlar profile ve sınırlara dokunmaz. Bu alanlar değişirse bütün kararlar eskir.
 * Uygulamayı çekirdek yazar ve açılışta kaydeder: src/store/platformBridge.ts
 */
export type CommandResult = { ok: true; draftId: string } | { ok: false; error: string }

export interface PlanCommands {
  /** Bir adım için değer taslağı önerir. Plan değişmez. */
  proposeStepDraft(planId: string, step: string, patch: Readonly<Record<string, unknown>>): CommandResult
  /** Kanıt taslağı ekler. Plan değişmez. */
  appendEvidenceDraft(planId: string, text: string): CommandResult
}

const NOT_READY: CommandResult = { ok: false, error: 'Plan komutları henüz hazır değil. Sayfayı yeniden yükleyin.' }
let impl: PlanCommands | undefined

export function registerPlanCommands(commands: PlanCommands): void {
  impl = commands
}

/** Modüllerin kullandığı komutlar. Uygulama kaydedilmeden çağrılırsa hata sonucu döner. */
export const planCommands: PlanCommands = {
  proposeStepDraft: (planId, step, patch) => (impl ? impl.proposeStepDraft(planId, step, patch) : NOT_READY),
  appendEvidenceDraft: (planId, text) => (impl ? impl.appendEvidenceDraft(planId, text) : NOT_READY),
}
