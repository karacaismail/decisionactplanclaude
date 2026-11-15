/**
 * İçe alınan plan dosyasını denetler. Bozuk dosya depoya girmez.
 */
import { type PlanDoc } from './types'
import { uid } from '@/engine/format'

export const MAX_IMPORT_BYTES = 8 * 1024 * 1024

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isString = (v: unknown): v is string => typeof v === 'string' && v.length > 0

/** Belge PlanDoc biçimine uyuyor mu? Yalnız zorunlu iskeleti denetler. */
export function validatePlanDoc(v: unknown): v is PlanDoc {
  if (!isRecord(v)) return false
  if (v.schemaVersion !== '1.0') return false
  if (!isString(v.id) || !isString(v.name)) return false
  if (!isRecord(v.steps)) return false
  for (const key of ['evidence', 'decisions', 'tasks'] as const) if (!Array.isArray(v[key])) return false
  if (v.profile !== undefined && !isRecord(v.profile)) return false
  if (v.limits !== undefined && !isRecord(v.limits)) return false
  for (const key of ['changes', 'transitions', 'strategyReviews', 'revisions', 'outputs'] as const) if (v[key] !== undefined && !Array.isArray(v[key])) return false
  return true
}

/** Dosya metnini plana çevirir. Sorun varsa Türkçe hata fırlatır. */
export function parsePlanImport(text: string, byteLength = new TextEncoder().encode(text).length): PlanDoc {
  if (byteLength > MAX_IMPORT_BYTES) throw new Error('Dosya 8 MB sınırını aşıyor. Daha küçük bir plan dosyası seçin.')
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Dosya okunamadı. Geçerli bir JSON dosyası seçin.')
  }
  if (!validatePlanDoc(parsed)) throw new Error('Bu dosya bir plan dosyası değil. Plan dosyasını bu uygulamadan dışa aktarın.')
  return parsed
}

/** İçe alınan plan kopya olarak eklenir. Yeni kimlik alır, adına " (kopya)" eklenir. */
export function prepareImportedPlan(doc: PlanDoc): PlanDoc {
  const now = new Date().toISOString()
  return {
    ...doc,
    id: uid('plan'),
    name: doc.name.endsWith(' (kopya)') ? doc.name : `${doc.name} (kopya)`,
    profile: doc.profile ?? {},
    limits: doc.limits ?? {},
    revisions: Array.isArray(doc.revisions) ? doc.revisions : [],
    outputs: Array.isArray(doc.outputs) ? doc.outputs : [],
    changes: Array.isArray(doc.changes) ? doc.changes : [],
    updatedAt: now,
  }
}
