import { STRATEGY_N } from './decisions'

/**
 * Yolun dört bölümü, süreç sırasıyla. Bölümler üç ana kümeye bağlıdır.
 * Temel ve hazırlık kontrolü strateji öncesi hazırlıktır. Ana kümeler `clusters.ts` dosyasındadır.
 */
export type StageKey = 'temel' | 'gecis' | 'strateji' | 'uygulama'

export interface StageDef {
  key: StageKey
  title: string
  description: string
  /** Bu aşamaya bağlı karar numaraları. Hazırlık kontrolünün kararı yoktur. */
  decisions: number[]
  path: string
}

export const STAGES: StageDef[] = [
  { key: 'temel', title: 'Temel', description: 'Sorunu, talebi, parayı ve riski kanıtla öğrenin.', decisions: [1, 2, 3, 4, 5], path: '/karar/1' },
  { key: 'gecis', title: 'Hazırlık kontrolü', description: 'Dayanak yeterli mi? Karar sahibi kaydeder.', decisions: [], path: '/gecis' },
  { key: 'strateji', title: 'Strateji oluşturma', description: 'Asıl güçlüğü yazın. Yolları sınayın. Birini seçin ve ana hamleleri belirleyin.', decisions: [STRATEGY_N], path: '/strateji' },
  { key: 'uygulama', title: 'Strateji uygulama', description: 'Hedefi, işleri ve kaynağı bağlayın. Yürütün, ölçün ve seçimi sınayın.', decisions: [6, 7, 8], path: '/uygulama' },
]

export const FOUNDATION_DECISIONS = [1, 2, 3, 4, 5]
export const EXECUTION_DECISIONS = [6, 7, 8]

export function stageOfDecision(n: number): StageKey {
  if (n === STRATEGY_N) return 'strateji'
  return n <= 5 ? 'temel' : 'uygulama'
}
