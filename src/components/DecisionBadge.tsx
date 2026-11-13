import { CheckCircle, PauseCircle, ArrowsClockwise, ArrowBendUpRight, ShieldCheck, Prohibit } from '@phosphor-icons/react'
import { OUTCOME_LABEL, type Outcome } from '@/data/types'
import { decisionColors } from '@/theme/tokens'
import '@/styles/screens-kapi.css'

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
 * Karar rozeti. 24 px yüksek, 14 px 600, 4 px köşe, 16 px ikon.
 * Renk durum sisteminden gelir: İlerle ve Koşullu ilerle yeşil (koşullu çerçeveli),
 * Yeniden dene mavi, Yön değiştir mor, Beklet sarı, Durdur kırmızı. Tema CSS değişkeniyle kendiliğinden değişir.
 * `size` eski çağrılar için tutulur; tek boy vardır.
 */
export function DecisionBadge({ outcome }: { outcome: Outcome; size?: 'sm' | 'md' | 'lg' }) {
  const Icon = ICON[outcome]
  return (
    <span className={`decision-badge is-${outcome}`}>
      <Icon size={16} weight={outcome === 'kosulluIlerle' ? 'regular' : 'fill'} aria-hidden />
      {OUTCOME_LABEL[outcome]}
    </span>
  )
}
