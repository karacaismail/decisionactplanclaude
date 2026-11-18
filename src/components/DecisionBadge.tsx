import { CheckCircle, PauseCircle, ArrowsClockwise, ArrowBendUpRight, ShieldCheck, Prohibit } from '@phosphor-icons/react'
import { OUTCOME_LABEL, type Outcome } from '@/data/types'
import { decisionColors } from '@/theme/tokens'
import '@/styles/screens-kapi.css'
import '@/styles/mobil-token.css'

const ICON: Record<Outcome, typeof CheckCircle> = {
  ilerle: CheckCircle,
  kosulluIlerle: ShieldCheck,
  yenidenDene: ArrowsClockwise,
  yonDegistir: ArrowBendUpRight,
  beklet: PauseCircle,
  durdur: Prohibit,
}
const KEY: Record<Outcome, keyof typeof decisionColors.light> = {
  ilerle: 'proceed',
  kosulluIlerle: 'conditional',
  yenidenDene: 'retry',
  yonDegistir: 'pivot',
  beklet: 'hold',
  durdur: 'stop',
}

/**
 * Grafikler için düz renk. Canvas CSS değişkeni okuyamaz; bu yüzden tema parametre ile gelir.
 * Rozet bu işlevi kullanmaz, rengini CSS değişkenlerinden alır.
 */
export function outcomeColor(o: Outcome, dark: boolean): string {
  return (dark ? decisionColors.dark : decisionColors.light)[KEY[o]]
}

/**
 * Karar rozetinin ölçüleri ortak tasarım değişkenlerinden gelir.
 * Renkler mevcut durum sınıflarından gelir.
 * `size` eski çağrılar için tutulur. Rozetin tek boyu vardır.
 */
export function DecisionBadge({ outcome }: { outcome: Outcome; size?: 'sm' | 'md' | 'lg' }) {
  const Icon = ICON[outcome]
  return (
    <span className={`decision-badge mt-decision-badge is-${outcome}`}>
      <Icon className="mt-icon-inline" weight={outcome === 'kosulluIlerle' ? 'regular' : 'fill'} aria-hidden />
      {OUTCOME_LABEL[outcome]}
    </span>
  )
}
