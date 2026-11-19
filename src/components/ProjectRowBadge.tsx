import '@/styles/bilesen/ProjectRowBadge.css'
import type { ReactNode } from 'react'
import { WarningCircle } from '@phosphor-icons/react'
import { Link } from 'react-router'
import type { PlanDoc } from '@/data/types'
import { MOVES_STEP, movesOf, TASKS_STEP, tasksOf } from '@/engine/strategy'
import { planPosition } from '@/engine/position'
import { parseProjectRollup, PROJECT_MODULE_ID, rowBadge, rowCounts, type ProjectRowCounts } from '@/engine/projectRollup'
import { moduleById } from '@/platform/modules'
import { useRollup } from '@/platform/useRollup'

/**
 * Satırın proje etiketi. Salt okunurdur. Planı değiştirmez.
 * Sayılar proje modülünün özetinden gelir. Geciken görev metin ve ikonla görünür.
 * Bağlantı Projeler ekranını açar. Ekran bu satırı seçili getirir.
 */
export function ProjectRowBadge({ to, label, counts }: { to: string; label: string; counts?: ProjectRowCounts }) {
  const b = rowBadge(counts)
  return (
    <div className="project-row-badge">
      {b.summary ? <p className="project-row-badge-text">{b.summary}</p> : null}
      {b.overdue ? (
        <p className="project-row-badge-text project-row-badge-late">
          <WarningCircle size={18} weight="bold" aria-hidden />
          <span>{b.overdue}</span>
        </p>
      ) : null}
      <Link className="project-row-badge-link" to={to} aria-label={`${b.link}: ${label}`}>{b.link}</Link>
    </div>
  )
}

/** Etiket gösteren tablolar. Ana hamleler 2.5 adımında, "Şimdi" işleri 3.2 adımındadır. */
const BADGE_FIELDS: Readonly<Record<string, string>> = { [MOVES_STEP]: 'moves', [TASKS_STEP]: 'now' }

export type RowFooter = (row: Record<string, unknown> & { _id: string }) => ReactNode

/**
 * Adımın tablolarına satır etiketi verir. Etiket yalnız ana hamle ve "Şimdi" tablolarında görünür.
 * Proje modülü kayıtlı değilse etiket yoktur. Strateji onaylanmadıysa yalnız sayılar görünür.
 * Dönen işlev alan anahtarını alır. Etiket gerekmeyen alan için undefined döner.
 */
export function useProjectRowFooter(stepId: string, plan: PlanDoc): (fieldKey: string) => RowFooter | undefined {
  const rollup = parseProjectRollup(useRollup(PROJECT_MODULE_ID, plan.id))
  const field = BADGE_FIELDS[stepId]
  const base = moduleById(PROJECT_MODULE_ID)?.nav[0]?.to
  if (!field || !base) return () => undefined
  const approved = planPosition(plan).strategyComplete
  const labels = new Map<string, string>(stepId === MOVES_STEP ? movesOf(plan).map((m) => [m.id, m.move]) : tasksOf(plan, 'now').map((t) => [t.id, t.action]))
  const footer: RowFooter = (row) => {
    const label = labels.get(row._id)
    if (!label) return null
    const counts = rowCounts(rollup, row._id)
    if (!counts && !approved) return null
    return <ProjectRowBadge to={`${base}?satir=${encodeURIComponent(row._id)}`} label={label} counts={counts} />
  }
  return (key) => (key === field ? footer : undefined)
}
