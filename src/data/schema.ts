/**
 * Adım tanım dili. Adımlar koddan değil bu veriden çizilir.
 * Koşullar profile ve önceki cevaplara bakar.
 */
import type { PlanDoc, Profile, Outcome } from './types'

export type ProfileKey = keyof Profile

export type Condition =
  | { profile: Partial<Record<ProfileKey, (string | boolean)[]>> }
  | { field: { step?: string; key: string; equals?: unknown; in?: unknown[]; truthy?: boolean } }
  | { not: Condition }
  | { all: Condition[] }
  | { any: Condition[] }

export interface Option {
  value: string
  label: string
  help?: string
}

interface FieldBase {
  key: string
  label: string
  help?: string
  placeholder?: string
  required?: boolean
  when?: Condition
  /** Dar ekranda tam genişlik, geniş ekranda sütun sayısı (12'lik ızgara). */
  span?: 6 | 8 | 12 | 24
}

export interface CalcResult {
  /** Büyük yazılan sonuç. Örneğin "1.000 sipariş". */
  value: string
  /** Hesabın adımları. Her satır tam cümledir. */
  lines: string[]
  /** Sonucu yazacağı alan. */
  apply?: { key: string; value: number; label: string }
  warn?: string
}

export type Field =
  | (FieldBase & { type: 'text'; maxLength?: number })
  | (FieldBase & { type: 'textarea'; rows?: number; maxLength?: number })
  | (FieldBase & { type: 'number'; unit?: string; min?: number; max?: number; step?: number })
  | (FieldBase & { type: 'money' })
  | (FieldBase & { type: 'date' })
  | (FieldBase & { type: 'select'; options: Option[] })
  | (FieldBase & { type: 'segmented'; options: Option[] })
  | (FieldBase & { type: 'chips'; options: Option[]; max?: number })
  | (FieldBase & { type: 'toggle'; onLabel?: string; offLabel?: string })
  | (FieldBase & { type: 'rate'; max?: number; labels?: string[] })
  | (FieldBase & { type: 'evidenceLadder' })
  | (FieldBase & { type: 'threshold'; unit?: string })
  | (FieldBase & { type: 'measure'; defaultName?: string; defaultUnit?: string })
  | (FieldBase & { type: 'repeater'; columns: Field[]; minRows?: number; maxRows?: number; addLabel?: string; fixedFirstRow?: Record<string, unknown> })
  | (FieldBase & { type: 'scoreMatrix'; rowsFrom: string; rowLabelKey: string; criteria: { key: string; label: string }[] })
  | (FieldBase & { type: 'checklist'; items: Option[] })
  | (FieldBase & { type: 'info'; text: string; tone?: 'bilgi' | 'ipucu' | 'uyari' | 'ornek' })
  /** Otomatik hesap. Değer saklamaz. "Alana yaz" ile başka bir alanı doldurur. */
  | (FieldBase & { type: 'calc'; compute: (values: Record<string, unknown>, plan: PlanDoc) => CalcResult | null; emptyText?: string })
  | (FieldBase & { type: 'evidenceLink' })

export interface Section {
  title?: string
  description?: string
  when?: Condition
  /** İsteğe bağlı bölüm. Boşken kapalı gelir. Çok sayıda olursa ayrı sekmede durur. */
  optional?: boolean
  /** Kısa yolda bu bölüm gösterilmez. */
  hideInShortPath?: boolean
  fields: Field[]
}

export type ChartKind = 'radar' | 'bar' | 'gauge' | 'funnel' | 'scatter' | 'line' | 'heatmap' | 'sankey'

export interface ChartSpec {
  kind: ChartKind
  title: string
  /** Grafiğin altındaki tek cümlelik sonuç. Değer yoksa boş kalır. */
  summary?: (values: Record<string, unknown>, plan: PlanDoc) => string
  build: (values: Record<string, unknown>, plan: PlanDoc) => { option: unknown; table: { head: string[]; rows: (string | number)[][] } } | null
}

export interface StepDef {
  id: string
  decision: number
  title: string
  question: string
  mandatory: boolean | Condition
  whenNote?: string
  who: string
  timebox?: string
  shortPath: boolean
  intro?: string
  howTo?: string[]
  sections: Section[]
  output?: string
  outcomeTable?: { condition: string; result: string }[]
  /** Karar Kitabı veri sırası (1 ile 128). Ekranda bölüm adı ve sırası gösterilir. */
  models: number[]
  chart?: ChartSpec
  /** Adımın tamam sayılması için dolu olması gereken alanlar. */
  completeWhen?: string[]
  /** Adım tamamlanırken aranan ek koşullar. Her satır kullanıcıya gösterilen tam cümledir. Boş liste engel yok demektir. */
  validate?: (values: Record<string, unknown>, plan: PlanDoc) => string[]
}

export interface GateCriterion {
  id: string
  label: string
  /** true: karşılandı, false: karşılanmadı, null: ölçülmedi. */
  check: (plan: PlanDoc) => boolean | null
  hint?: string
}

export interface GateRow {
  condition: string
  outcome: Outcome
  note?: string
  /** Satır uygun mu? Yoksa yalnız tabloda gösterilir. */
  applies?: (plan: PlanDoc, criteria: Record<string, boolean | null>) => boolean
}

export interface GateDef {
  n: number
  title: string
  criteria: GateCriterion[]
  rows: GateRow[]
  maxRetries: number
}

export interface DecisionDef {
  n: number
  title: string
  question: string
  icon: string
  who: string
  time: string
  intro: string
  example: string
  steps: string[]
  gate: GateDef
}
