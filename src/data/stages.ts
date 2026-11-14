import { STRATEGY_N } from './decisions'

/** Yolun dört bölümü. Ürünün bitiş çizgisi geçiş kapısıdır. */
export type StageKey = 'temel' | 'gecis' | 'strateji' | 'uygulama'

export interface StageDef {
  key: StageKey
  title: string
  description: string
  /** Bu aşamaya bağlı karar numaraları. Geçiş kapısının kararı yoktur. */
  decisions: number[]
  path: string
}

export const STAGES: StageDef[] = [
  { key: 'temel', title: 'Temel', description: 'Sorunu, talebi, parayı ve riski kanıtla öğrenin.', decisions: [1, 2, 3, 4, 5], path: '/karar/1' },
  { key: 'gecis', title: 'Geçiş kapısı', description: 'Dayanak yeterli mi? Karar sahibi kaydeder.', decisions: [], path: '/gecis' },
  { key: 'strateji', title: 'Strateji çalışması', description: 'Sahayı, kazanma yolunu ve 90 günlük yolu seçin.', decisions: [STRATEGY_N], path: '/strateji' },
  { key: 'uygulama', title: 'Uygulama', description: 'İlk teslim, tekrar ve işin geleceği.', decisions: [6, 7, 8], path: '/karar/6' },
]

export const FOUNDATION_DECISIONS = [1, 2, 3, 4, 5]
export const EXECUTION_DECISIONS = [6, 7, 8]

export function stageOfDecision(n: number): StageKey {
  if (n === STRATEGY_N) return 'strateji'
  return n <= 5 ? 'temel' : 'uygulama'
}
