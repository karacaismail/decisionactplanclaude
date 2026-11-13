import { theme } from 'antd'
import { CheckCircle, PauseCircle, ArrowsClockwise, ArrowBendUpRight, ShieldCheck, Prohibit } from '@phosphor-icons/react'
import { OUTCOME_LABEL, type Outcome } from '@/data/types'
import { decisionColors } from '@/theme/tokens'

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

export function outcomeColor(o: Outcome, dark: boolean): string {
  return (dark ? decisionColors.dark : decisionColors.light)[KEY[o]]
}

export function DecisionBadge({ outcome, size = 'md' }: { outcome: Outcome; size?: 'sm' | 'md' | 'lg' }) {
  const { token } = theme.useToken()
  const dark = token.colorBgLayout.toLowerCase() === '#16191d'
  const color = outcomeColor(outcome, dark)
  const Icon = ICON[outcome]
  const fs = size === 'lg' ? 18 : size === 'sm' ? 14 : 16
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        color,
        background: `${color}1A`,
        borderRadius: 6,
        padding: size === 'lg' ? '8px 14px' : '4px 10px',
        fontSize: fs,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={fs + 4} weight="fill" aria-hidden />
      {OUTCOME_LABEL[outcome]}
    </span>
  )
}
