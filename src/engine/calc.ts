import type { CalcResult } from '@/data/schema'
import type { PlanDoc } from '@/data/types'
import { formatMoney } from './format'

const num = (x: unknown): number | null => (typeof x === 'number' && Number.isFinite(x) ? x : null)
const fmt = (n: number): string => n.toLocaleString('tr-TR')

/**
 * Ulaşılabilir pazar. Aşağıdan yukarı hesap: ulaşabildiğiniz müşteri ile satış kapasitesinden küçük olanı.
 * Yukarıdan aşağı hesap varsa karşılaştırma satırı eklenir.
 */
export function marketCalc(values: Record<string, unknown>): CalcResult | null {
  const reachable = num(values.reachableCustomers)
  const capacity = num(values.salesCapacity)
  if (reachable === null || capacity === null) return null
  const som = Math.min(reachable, capacity)
  const lines = [`Ulaşabildiğiniz müşteri ${fmt(reachable)}. Satış kapasiteniz ${fmt(capacity)}.`, `Küçük olan sayı gerçekçi pazarınızdır: ${fmt(som)} müşteri.`]
  const total = num(values.totalMarket)
  const share = num(values.sharePercent)
  if (total !== null && share !== null) lines.push(`Yukarıdan hesap: ${fmt(total)} müşterinin yüzde ${fmt(share)} kadarı ${fmt(Math.round((total * share) / 100))} müşteri eder.`)
  const target = num(values.targetCustomers)
  let warn: string | undefined
  if (target !== null) {
    if (som < target) warn = `Gerçekçi pazar hedefin altında. Hedef ${fmt(target)} müşteri.`
    else lines.push(`Hedefiniz ${fmt(target)} müşteri. Gerçekçi pazar hedefi karşılıyor.`)
  }
  return { value: `${fmt(som)} müşteri`, lines, apply: { key: 'somCustomers', value: som, label: 'Sonucu "Gerçekçi pazar" alanına yaz' }, warn }
}

/**
 * Başabaş sayısı. Aylık sabit gider bölü orta durumdaki sipariş katkısı. Kesirli sonuç üst tam sayıya yuvarlanır.
 * Sabit gider Adım 02'deki aylık giderden gelir. Para kuruş olarak tutulur.
 */
export function breakEvenCalc(values: Record<string, unknown>, plan: PlanDoc): CalcResult | null {
  const contribution = num(values.contributionMid)
  const fixed = num(plan.limits.monthlyBurnKurus)
  if (contribution === null || fixed === null) return null
  if (contribution <= 0) return { value: 'Hesaplanamaz', lines: [`Orta durumda sipariş katkısı ${formatMoney(contribution)}.`], warn: 'Katkı payı artı değil. Bu fiyat ve maliyetle sabit gider hiç karşılanmaz.' }
  const count = Math.ceil(fixed / contribution)
  return {
    value: `${fmt(count)} sipariş`,
    lines: [`Aylık sabit gider ${formatMoney(fixed)}. Bir siparişin katkısı ${formatMoney(contribution)}.`, `Gider bölü katkı ${fmt(count)} sipariş eder. Ayda bu kadar sipariş gideri karşılar.`],
    apply: { key: 'breakEvenCount', value: count, label: 'Sonucu "Başabaş sayısı" alanına yaz' },
  }
}
