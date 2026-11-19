import '@/styles/bilesen/ProjectsSummaryCard.css'
import { Card } from 'antd'
import { WarningCircle } from '@phosphor-icons/react'
import { Link } from 'react-router'
import { formatDate } from '@/engine/format'
import { localIso, parseProjectRollup, PROJECT_MODULE_ID, projectCardLines, todayIso } from '@/engine/projectRollup'
import { moduleById } from '@/platform/modules'
import { useRollup } from '@/platform/useRollup'

/**
 * Projelerin kısa özeti. Sayılar proje modülünün özetinden gelir. Kart salt okunurdur.
 * Proje yoksa kart görünmez. Kart hiçbir kontrolü ve hazırlığı değiştirmez.
 * Strateji onaylı değilken Projeler ekranı proje göstermez. Bu yüzden kart bağlantı yerine nedenini yazar.
 */
export function ProjectsSummaryCard({ planId, approved }: { planId: string; approved: boolean }) {
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
      {approved ? <Link className="projects-summary-link" to={to}>Projelere git</Link> : <p className="projects-summary-note">Strateji yeniden onaylanınca projeleri açabilirsiniz.</p>}
    </Card>
  )
}
