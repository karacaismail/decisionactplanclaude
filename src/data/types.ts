/**
 * Veri sözleşmesi. Tek JSON belgesi tarayıcıda saklanır.
 * Tutarlar kuruş cinsinden tam sayıdır. Tarihler ISO metnidir.
 */

export type Customer = 'tuketici' | 'isletme' | 'kamu' | 'pazarYeri'
export type Offering = 'dijital' | 'fiziksel' | 'hizmet' | 'donanim'
export type Regulation = 'dusuk' | 'yuksek'
export type Team = 'tekKurucu' | 'ekip'
export type Funding = 'kendi' | 'dis'
export type Market = 'varOlan' | 'yeni'
export type Start = 'sifirdan' | 'devralma'
export type Entry = 'yeni' | 'devralma' | 'acil'

export interface Profile {
  customer?: Customer
  marketplaceSeller?: 'tuketici' | 'isletme'
  marketplaceBuyer?: 'tuketici' | 'isletme'
  offering?: Offering
  regulation?: Regulation
  team?: Team
  teamSize?: number
  funding?: Funding
  market?: Market
  start?: Start
  needsPremises?: boolean
  paid?: boolean
  smallReversible?: boolean
  /** İş bir gruba ya da holdinge bağlı mı? Yalnız ilgili soruları açar. */
  group?: boolean
  description?: string
}

export type Outcome = 'durdur' | 'beklet' | 'yenidenDene' | 'yonDegistir' | 'kosulluIlerle' | 'ilerle'

export const OUTCOME_LABEL: Record<Outcome, string> = {
  durdur: 'Durdur',
  beklet: 'Beklet',
  yenidenDene: 'Yeniden dene',
  yonDegistir: 'Yön değiştir',
  kosulluIlerle: 'Koşullu ilerle',
  ilerle: 'İlerle',
}

export type EvidenceKind = 'gozlem' | 'tahmin' | 'varsayim'
export type ValueStatus = 'olculdu' | 'bilinmiyor' | 'uygulanmiyor'

export interface Evidence {
  id: string
  title: string
  kind: EvidenceKind
  /** Kanıt merdiveni basamağı 1 (ödeme) ile 7 (kurucu kanaati). */
  ladder: number
  date?: string
  source?: string
  group?: string
  counterFinding?: string
  attachmentName?: string
  linkedSteps: string[]
  createdAt: string
  updatedAt: string
}

export interface Measure {
  name: string
  unit: string
  period?: string
  baseline?: number | null
  threshold?: number | null
  basis?: string
  isGuess?: boolean
  status: ValueStatus
  value?: number | null
  naReason?: string
  numerator?: number | null
  denominator?: number | null
}

export interface ConditionalPermit {
  scope: string
  amountKurus: number
  deadline: string
  owner: string
  closingEvidence: string
  issuedAt: string
  closedAt?: string
}

export interface Decision {
  id: string
  gate: number
  scope: string
  criteria: { id: string; label: string; met: boolean | null; note?: string }[]
  suggested: Outcome
  chosen: Outcome
  reason: string
  counterView?: string
  secondOpinion?: string
  conditional?: ConditionalPermit
  retriesLeft: number
  decidedBy: string
  decidedAt: string
  reopenWhen?: string
  revision: number
  /** Dayandığı veri sonradan değiştiyse karar yeniden incelenmeyi bekler. */
  stale?: boolean
}

/** Sınır ve eşik değişiklikleri kayda geçer. Tek kurucuda artış ikinci görüş ister. */
export interface ChangeRecord {
  id: string
  step: string
  key: string
  label: string
  before: unknown
  after: unknown
  at: string
  needsReview: boolean
  reviewer?: string
  reviewedAt?: string
}

export type TaskStatus = 'taslak' | 'acik' | 'bitti' | 'iptal'

export interface Task {
  id: string
  action: string
  sourceDecisionId?: string
  sourceStep?: string
  owner?: string
  dueDate?: string
  dependsOn?: string[]
  acceptance?: string
  status: TaskStatus
  reopenEvent?: string
  createdAt: string
  updatedAt: string
}

export interface Limits {
  successSentence?: string
  stopRules?: { rule: string }[]
  monthlyBurnKurus?: number | null
  cashKurus?: number | null
  budgetKurus?: number | null
  deadline?: string
  retriesPerDecision?: number | null
  hoursPerWeek?: number | null
}

export type StepValues = Record<string, unknown>

export interface StepRecord {
  values: StepValues
  status: 'bos' | 'taslak' | 'tamam' | 'atlandi'
  skipReason?: string
  updatedAt: string
}

export interface Revision {
  id: string
  label: string
  createdAt: string
  snapshot: string
}

export interface OutputVersion {
  id: string
  kind: 'yonetici' | 'aksiyon'
  revision: number
  createdAt: string
}

export type TransitionOutcome = 'hazir' | 'kosullu' | 'degil'
export const TRANSITION_LABEL: Record<TransitionOutcome, string> = {
  hazir: 'Planlamaya hazır',
  kosullu: 'Koşullu hazır',
  degil: 'Henüz hazır değil',
}

/** Stratejiyi sınama ve yenileme kararı (alt aşama 3.5). */
export type RenewalDecision = 'surdur' | 'duzelt' | 'yenidenAc'
export const RENEWAL_LABEL: Record<RenewalDecision, string> = { surdur: 'Sürdür', duzelt: 'Düzelt', yenidenAc: 'Yeniden aç' }
/** "Seçim hâlâ doğru mu?" sorusunun cevabı. */
export type ChoiceHolds = 'evet' | 'kismen' | 'hayir'
export const HOLDS_LABEL: Record<ChoiceHolds, string> = { evet: 'Evet, seçim hâlâ doğru', kismen: 'Kısmen doğru', hayir: 'Hayır, seçim artık doğru değil' }

/** Strateji gözden geçirme kaydı. Yazılım karar vermez. Karar sahibi kaydeder. */
export interface StrategyReview {
  id: string
  decidedAt: string
  decidedBy: string
  holds: ChoiceHolds
  decision: RenewalDecision
  reason: string
  /** Kararın dayandığı gözlem ya da sayı. */
  evidence?: string
  /** "Yeniden aç" kararında silinen onay. Örneğin "Kurucu, 2026-11-15". */
  clearedApproval?: string
  revision: number
}

/** Geçiş kapısı kaydı. Yazılım önerir, karar sahibi kaydeder. */
export interface TransitionRecord {
  id: string
  outcome: TransitionOutcome
  suggested: TransitionOutcome
  reason: string
  decidedBy: string
  decidedAt: string
  /** Karar sahibi dayanakları incelediğini işaretledi. */
  reviewed: boolean
  secondOpinion?: string
  /** Koşullu hazır: yalnız bu konu planlanır. */
  conditional?: { topic: string; openQuestion: string; owner: string; deadline: string }
  mandatoryMet: number
  mandatoryTotal: number
  supportingMet: number
  supportingTotal: number
  level: number
  revision: number
  stale?: boolean
}

export interface PlanDoc {
  schemaVersion: '1.0'
  id: string
  name: string
  currency: 'TRY'
  entry?: Entry
  shortPath: boolean
  revision: number
  createdAt: string
  updatedAt: string
  lastLocation?: string
  profile: Profile
  limits: Limits
  steps: Record<string, StepRecord>
  evidence: Evidence[]
  decisions: Decision[]
  tasks: Task[]
  revisions: Revision[]
  outputs: OutputVersion[]
  takeover?: Record<string, unknown>
  /** Stratejik planlamaya geçiş kararları. Son kayıt geçerlidir. */
  transitions?: TransitionRecord[]
  /** Strateji gözden geçirme kayıtları. Son kayıt geçerlidir. */
  strategyReviews?: StrategyReview[]
  /**
   * Stratejisi eski sürümde tamamlanan plan. Eski sürümde strateji iki adımdı.
   * Bu plan yeni alt aşamalar boş olsa da strateji uygulamada kalır. "Yeniden aç" kararı bu izni kaldırır.
   */
  legacyStrategy?: { migratedAt: string }
  /** Örnek plan: ekranları tanıtır, raporda "Örnek" damgası taşır. */
  example?: boolean
  changes?: ChangeRecord[]
}

export function emptyPlan(id: string, name: string): PlanDoc {
  const now = new Date().toISOString()
  return {
    schemaVersion: '1.0',
    id,
    name,
    currency: 'TRY',
    shortPath: false,
    revision: 0,
    createdAt: now,
    updatedAt: now,
    profile: {},
    limits: {},
    steps: {},
    evidence: [],
    decisions: [],
    tasks: [],
    revisions: [],
    outputs: [],
    changes: [],
    transitions: [],
  }
}
