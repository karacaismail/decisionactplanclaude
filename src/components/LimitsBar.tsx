import { Statistic, theme } from 'antd'
import { Wallet, CalendarBlank, ArrowsClockwise, Gauge } from '@phosphor-icons/react'
import type { PlanDoc } from '@/data/types'
import { formatDate, formatMoney } from '@/engine/format'

/** Üç sınır ve pist. Her kararın üstünde görünür. */
export function LimitsBar({ plan, retriesLeft }: { plan: PlanDoc; retriesLeft?: number }) {
  const { token } = theme.useToken()
  const { budgetKurus, deadline, retriesPerDecision, monthlyBurnKurus, cashKurus } = plan.limits
  const runway = monthlyBurnKurus && cashKurus ? Math.floor(cashKurus / monthlyBurnKurus) : null
  const tile = (Icon: typeof Wallet, title: string, value: string) => (
    <div style={{ background: token.colorFillAlter, borderRadius: token.borderRadiusLG, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
      <Icon size={22} color={token.colorTextSecondary} aria-hidden style={{ flexShrink: 0 }} />
      <Statistic title={<span style={{ fontSize: 14 }}>{title}</span>} value={value} valueStyle={{ fontSize: 18, fontWeight: 600 }} className="tabular" />
    </div>
  )
  return (
    <div role="group" aria-label="Sınırlar" style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
      {tile(Wallet, 'Toplam harcama sınırı', budgetKurus ? formatMoney(budgetKurus) : 'Yazılmadı')}
      {tile(CalendarBlank, 'Bitiş tarihi', deadline ? formatDate(deadline, false) : 'Yazılmadı')}
      {tile(ArrowsClockwise, 'Kalan deneme hakkı', retriesLeft !== undefined ? String(retriesLeft) : retriesPerDecision ? `${retriesPerDecision} / karar` : 'Yazılmadı')}
      {tile(Gauge, 'Pist', runway !== null ? `${runway} ay` : 'Hesaplanmadı')}
    </div>
  )
}
