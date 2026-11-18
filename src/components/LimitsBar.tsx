import { Wallet, CalendarBlank, ArrowsClockwise, Gauge } from '@phosphor-icons/react'
import type { PlanDoc } from '@/data/types'
import { formatDate, formatMoney } from '@/engine/format'
import { KpiStrip, StatTile } from './StatTile'
import '@/styles/mobil-token.css'

function values(plan: PlanDoc, retriesLeft?: number) {
  const { budgetKurus, deadline, retriesPerDecision, monthlyBurnKurus, cashKurus } = plan.limits
  const runway = monthlyBurnKurus && cashKurus ? Math.floor(cashKurus / monthlyBurnKurus) : null
  return [
    { Icon: Wallet, label: 'Toplam harcama sınırı', value: budgetKurus ? formatMoney(budgetKurus) : 'Yazılmadı' },
    { Icon: CalendarBlank, label: 'Bitiş tarihi', value: deadline ? formatDate(deadline, false) : 'Yazılmadı' },
    { Icon: ArrowsClockwise, label: 'Kalan deneme hakkı', value: retriesLeft !== undefined ? String(retriesLeft) : retriesPerDecision ? `${retriesPerDecision} / karar` : 'Yazılmadı' },
    { Icon: Gauge, label: 'Pist', value: runway !== null ? `${runway} ay` : 'Hesaplanmadı' },
  ]
}

/**
 * Üç sınır ve pist.
 * `compact` karar ve kapı ekranlarında kısa özeti gösterir.
 * Şerit biçimi yalnız plan özetinde durur.
 */
export function LimitsBar({ plan, retriesLeft, compact }: { plan: PlanDoc; retriesLeft?: number; compact?: boolean }) {
  const items = values(plan, retriesLeft)
  if (compact) {
    return (
      <div className="limits-line mt-limits-line" role="group" aria-label="Sınırlar">
        {items.map((i) => (
          <span key={i.label}>
            {i.label}: <strong>{i.value}</strong>
          </span>
        ))}
      </div>
    )
  }
  return (
    <KpiStrip label="Sınırlar">
      {items.map((i) => (
        <StatTile key={i.label} icon={<i.Icon className="mt-icon-inline" />} label={i.label} value={i.value} />
      ))}
    </KpiStrip>
  )
}
