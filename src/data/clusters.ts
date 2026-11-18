/**
 * Ana kümeler ve zorunlu alt aşamalar. Yazılımın en üst düzey haritasıdır.
 * Üç ana küme vardır: strateji öncesi hazırlık, strateji oluşturma ve strateji uygulama.
 * Bir ana küme ancak incelenen çerçevelerin büyük çoğunluğunda ayrı aşama ise eklenir.
 * Değerlendirme ve uygulamaya çevirme ayrı küme değildir. İçerikleri alt aşama olarak durur.
 * Dayanak ve sayım docs/sonraki-ana-asamalar-plani.md dosyasındadır.
 */
import type { PlanDoc } from './types'
import { DECISIONS, STRATEGY } from './decisions'
import { EXECUTION_DECISIONS, FOUNDATION_DECISIONS, type StageKey } from './stages'
import { gatePassed, strategyApproved, strategyDone } from '@/engine/gate'
import { transitionPassed } from '@/engine/transition'
import { strategyReopened } from '@/engine/renewal'

export type ClusterKey = 'hazirlik' | 'olusturma' | 'uygulama'
export type SubStageState = 'tamam' | 'suruyor' | 'bos'
export const SUB_STAGE_LABEL: Record<SubStageState, string> = { tamam: 'Tamam', suruyor: 'Sürüyor', bos: 'Başlanmadı' }

export interface SubStageDef {
  /** Alt aşama kodu. Örneğin "2.1". */
  code: string
  title: string
  /** Bu alt aşamada ne yapılır? */
  does: string
  /** Bu alt aşama çıkarılırsa ne olur? */
  why: string
  /** Bu alt aşamayı taşıyan çerçeveler. En az üç bağımsız çerçeve gerekir. */
  frameworks: string[]
  /** Alt aşamanın yapıldığı adımlar. Boşsa alt aşama bir ekranda ya da kararlarda yürür. */
  steps: string[]
  /** Alt aşamanın açıldığı adres. */
  path: string
  /** Bağlantının ekranda görünen adı. */
  pathLabel: string
  state: (plan: PlanDoc) => SubStageState
}

export interface ClusterDef {
  n: 1 | 2 | 3
  key: ClusterKey
  title: string
  question: string
  /** Giriş koşulu. Tam cümledir. */
  entry: string
  /** Çıkış. Tam cümledir. */
  exit: string
  path: string
  /** Bu kümeye bağlı süreç bölümleri. */
  stages: StageKey[]
  subStages: SubStageDef[]
}

const stepState = (plan: PlanDoc, id: string): SubStageState => {
  const rec = plan.steps[id]
  if (rec?.status === 'tamam') return 'tamam'
  const touched = rec && Object.values(rec.values ?? {}).some((x) => (Array.isArray(x) ? x.length > 0 : x !== undefined && x !== null && x !== ''))
  return touched ? 'suruyor' : 'bos'
}
const viaStep = (id: string) => (plan: PlanDoc) => stepState(plan, id)
const stepPath = (decision: number, id: string) => `/karar/${decision}/adim/${id}`

const FORMULATION: SubStageDef[] = [
  {
    code: '2.1',
    title: 'Teşhis',
    does: 'Stratej, önce çözülmesi gereken asıl güçlüğü tek cümleyle yazar.',
    why: 'Teşhis olmadan yolları karşılaştıracak ölçüt olmaz.',
    frameworks: ['Rumelt', 'Lafley ve Martin yedi adımı', 'Kaplan ve Norton', 'Wheelen ve Hunger'],
    steps: ['S21'],
    path: stepPath(9, 'S21'),
    pathLabel: '2.1 Teşhis adımını aç',
    state: viaStep('S21'),
  },
  {
    code: '2.2',
    title: 'Seçenekler',
    does: 'Stratej birbirinden gerçekten farklı en az iki yol yazar.',
    why: 'Seçenek olmadan seçim olmaz. Tek seçenek bir onay isteğidir.',
    frameworks: ['Lafley ve Martin yedi adımı', 'Porter', 'Baldrige'],
    steps: ['S22'],
    path: stepPath(9, 'S22'),
    pathLabel: '2.2 Seçenekler adımını aç',
    state: viaStep('S22'),
  },
  {
    code: '2.3',
    title: 'Sınama',
    does: 'Stratej her yol için "neler doğru olmalı?" diye sorar. En zayıf koşulu sınar.',
    why: 'Sınama olmadan seçim keyfî kalır.',
    frameworks: ['Lafley ve Martin yedi adımı', 'Rumelt dört ölçütü', 'Hambrick ve Fredrickson strateji elması'],
    steps: ['S23'],
    path: stepPath(9, 'S23'),
    pathLabel: '2.3 Sınama adımını aç',
    state: viaStep('S23'),
  },
  {
    code: '2.4',
    title: 'Seçim ve vazgeçiş',
    does: 'Karar sahibi kazanma hedefini, sahayı ve yolu seçer. Neyden vazgeçtiğini yazar.',
    why: 'Seçim olmadan ortada strateji yoktur. Strateji, seçim ve vazgeçiştir.',
    frameworks: ['Martin', 'Porter', 'Rumelt', 'Hambrick ve Fredrickson strateji elması', 'Lafley ve Martin yedi adımı'],
    steps: ['19'],
    path: stepPath(9, '19'),
    pathLabel: '2.4 Seçim ve vazgeçiş adımını aç',
    state: viaStep('19'),
  },
  {
    code: '2.5',
    title: 'Ana hamleler ve gerekli yetkinlikler',
    does: 'Stratej seçimi hayata geçirecek az sayıda büyük işi ve gereken beceriyi yazar.',
    why: 'Ana hamleler olmadan seçim kâğıtta kalır. Paranın hangi işe bağlanacağı bilinmez.',
    frameworks: ['Rumelt', 'Martin', 'Hambrick ve Fredrickson strateji elması', 'Baldrige'],
    steps: ['S25'],
    path: stepPath(9, 'S25'),
    pathLabel: '2.5 Ana hamleler adımını aç',
    state: viaStep('S25'),
  },
]

const EXECUTION: SubStageDef[] = [
  {
    code: '3.1',
    title: 'Hedef ve gösterge',
    does: 'Ekip, seçilen yolu ölçülebilir hedefe çevirir. Her göstergeye başlangıç değeri ve hedef sayı yazar.',
    why: 'Hedef ve gösterge olmadan ilerleme ölçülemez.',
    frameworks: ['Kaplan ve Norton', 'Baldrige', 'Wheelen ve Hunger'],
    steps: ['U31'],
    path: stepPath(6, 'U31'),
    pathLabel: '3.1 Hedef ve gösterge adımını aç',
    state: viaStep('U31'),
  },
  {
    code: '3.2',
    title: 'Ana işler ve sorumlular',
    does: 'Ekip her ana hamleyi işlere böler. Her işe tek bir sorumlu ve tarih yazar.',
    why: 'Sorumlu olmadan işin sahibi olmaz.',
    frameworks: ['Baldrige', 'Wheelen ve Hunger', 'Kaplan ve Norton'],
    steps: ['U32'],
    path: stepPath(6, 'U32'),
    pathLabel: '3.2 Ana işler adımını aç',
    state: viaStep('U32'),
  },
  {
    code: '3.3',
    title: 'Kaynak ve bütçe',
    does: 'Karar sahibi parayı ve insanı bu işlere bağlar.',
    why: 'Kaynak bağlanmadan strateji yalnız bir niyettir. Para yerinden oynamaz.',
    frameworks: ['Baldrige', 'Wheelen ve Hunger', 'Kaplan ve Norton', 'Rumelt'],
    steps: ['U33'],
    path: stepPath(6, 'U33'),
    pathLabel: '3.3 Kaynak ve bütçe adımını aç',
    state: viaStep('U33'),
  },
  {
    code: '3.4',
    title: 'Yürütme, ölçme ve gözden geçirme',
    does: 'Ekip işleri yapar. Sonucu düzenli ölçer. Karar 6 ve Karar 7 kontrollerinde sonucu gözden geçirir.',
    why: 'Ölçme olmadan sonuç bilinmez.',
    frameworks: ['Kaplan ve Norton', 'Baldrige', 'Wheelen ve Hunger'],
    steps: [],
    path: '/karar/6',
    pathLabel: "Karar 6'yı aç",
    state: (plan) => {
      if (gatePassed(plan, 6) && gatePassed(plan, 7)) return 'tamam'
      const started = DECISIONS.filter((d) => d.n === 6 || d.n === 7).some((d) => d.steps.some((id) => !id.startsWith('U') && stepState(plan, id) !== 'bos'))
      return started || gatePassed(plan, 6) ? 'suruyor' : 'bos'
    },
  },
  {
    code: '3.5',
    title: 'Stratejiyi sınama ve yenileme',
    does: 'Karar sahibi "Seçim hâlâ doğru mu?" diye sorar. Sonra sürdürür, düzeltir ya da yeniden açar. Karar 8 işin yönünü bu alt aşamada sorar.',
    why: 'Sınama olmadan yanlış bir strateji yıllarca sürer. Kimse durdurmaz.',
    frameworks: ['Kaplan ve Norton', 'Baldrige', 'Wheelen ve Hunger', 'Rumelt'],
    steps: [],
    path: '/uygulama#yenileme',
    pathLabel: 'Gözden geçirme kaydını aç',
    /* Bu alt aşama bir döngüdür. Kayıt varsa sürüyor sayılır. Hiç bitmez. */
    state: (plan) => ((plan.strategyReviews ?? []).length > 0 ? 'suruyor' : 'bos'),
  },
]

export const CLUSTERS: ClusterDef[] = [
  {
    n: 1,
    key: 'hazirlik',
    title: 'Strateji öncesi hazırlık',
    question: 'Strateji oluşturmaya hangi kanıtla başlıyorsunuz?',
    entry: 'Giriş koşulu yoktur. Plan bu kümeyle başlar.',
    exit: 'Karar sahibi hazırlık kontrolünde "Planlamaya hazır" ya da "Koşullu hazır" kararını kaydeder.',
    path: '/karar/1',
    stages: ['temel', 'gecis'],
    subStages: [],
  },
  {
    n: 2,
    key: 'olusturma',
    title: 'Strateji oluşturma',
    question: STRATEGY.question,
    entry: 'Hazırlık kararı "Planlamaya hazır" ya da "Koşullu hazır" olmalıdır.',
    exit: 'Karar sahibi strateji belgesini onaylar.',
    path: '/strateji',
    stages: ['strateji'],
    subStages: FORMULATION,
  },
  {
    n: 3,
    key: 'uygulama',
    title: 'Strateji uygulama',
    question: 'Seçimi nasıl gerçeğe çevirirsiniz? Seçim hâlâ doğru mu?',
    entry: 'Onaylanmış bir strateji belgesi olmalıdır.',
    exit: 'Çıkış kontrolü yoktur. Bu küme bir döngüdür. "Yeniden aç" kararı işi strateji oluşturmaya geri götürür.',
    path: '/uygulama',
    stages: ['uygulama'],
    subStages: EXECUTION,
  },
]

export function clusterOf(key: ClusterKey): ClusterDef {
  return CLUSTERS.find((c) => c.key === key)!
}
export function clusterOfStage(stage: StageKey): ClusterDef {
  return CLUSTERS.find((c) => c.stages.includes(stage))!
}
/** Adımın bağlı olduğu alt aşama. Strateji öncesi adımların alt aşaması yoktur. */
export function subStageOfStep(id: string): SubStageDef | undefined {
  return CLUSTERS.flatMap((c) => c.subStages).find((s) => s.steps.includes(id))
}

export type ClusterState = 'kilitli' | 'bos' | 'suruyor' | 'tamam'
export const CLUSTER_STATE_LABEL: Record<ClusterState, string> = { kilitli: 'Kilitli', bos: 'Başlanmadı', suruyor: 'Sürüyor', tamam: 'Tamam' }

/** Kümenin durumu. Kilit kuralı motordadır. Bu işlev yalnız özetler. */
export function clusterState(plan: PlanDoc, key: ClusterKey): ClusterState {
  if (key === 'hazirlik') {
    if (transitionPassed(plan)) return 'tamam'
    return FOUNDATION_DECISIONS.some((n) => gatePassed(plan, n)) || Object.keys(plan.steps).length > 0 ? 'suruyor' : 'bos'
  }
  if (key === 'olusturma') {
    if (!transitionPassed(plan)) return 'kilitli'
    if (strategyDone(plan) && !strategyReopened(plan)) return 'tamam'
    return FORMULATION.some((s) => s.state(plan) !== 'bos') || strategyReopened(plan) ? 'suruyor' : 'bos'
  }
  if (!transitionPassed(plan) || !strategyApproved(plan)) return 'kilitli'
  /* Strateji uygulama bir döngüdür. Çıkış kontrolü yoktur, bu yüzden "tamam" olmaz. */
  return EXECUTION.some((s) => s.state(plan) !== 'bos') || EXECUTION_DECISIONS.some((n) => gatePassed(plan, n)) ? 'suruyor' : 'bos'
}
