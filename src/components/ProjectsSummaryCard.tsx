import '@/styles/bilesen/ProjectsSummaryCard.css'
import { Card } from 'antd'
import { WarningCircle } from '@phosphor-icons/react'
import { Link } from 'react-router'
import { formatDate } from '@/engine/format'
import { parseProjectRollup, PROJECT_MODULE_ID, projectCardLines } from '@/engine/projectRollup'
import { moduleById } from '@/platform/modules'
import { useRollup } from '@/platform/useRollup'

const pad = (n: number) => String(n).padStart(2, '0')
const todayIso = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** "2026-11-19" gününü yerel takvimde ISO zamana çevirir. Böylece gün kaymaz. */
function localIso(day: string): string | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day)
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toISOString() : undefined
}

/**
 * Projelerin kısa özeti. Sayılar proje modülünün özetinden gelir. Kart salt okunurdur.
 * Proje yoksa kart görünmez. Kart hiçbir kontrolü ve hazırlığı değiştirmez.
 */
export function ProjectsSummaryCard({ planId }: { planId: string }) {
  const rollup = parseProjectRollup(useRollup(PROJECT_MODULE_ID, planId))
  const to = moduleById(PROJECT_MODULE_ID)?.nav[0]?.to
  if (!to || !rollup || rollup.projects === 0) return null
  const lines = projectCardLines(rollup)
  const old = rollup.date !== todayIso()
  return (
    <Card className="projects-summary" title={<h2 className="projects-summary-heading">Projeler</h2>}>
      <ul className="projects-summary-list">
        <li>{lines.projects}</li>
        <li>{lines.open}</li>
        {lines.overdue ? (
          <li className="projects-summary-late">
            <WarningCircle size={18} weight="bold" aria-hidden />
            <span>{lines.overdue}</span>
          </li>
        ) : null}
        <li>{lines.done}</li>
      </ul>
      {old ? <p className="projects-summary-note">Sayılar {formatDate(localIso(rollup.date))} hesaplandı. Bir görev değişince sayılar yenilenir.</p> : null}
      <p className="projects-summary-note">Projeler planın kararlarını ve kontrollerini değiştirmez.</p>
      <Link className="projects-summary-link" to={to}>Projelere git</Link>
    </Card>
  )
}
