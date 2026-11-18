import { useMemo } from 'react'
import type { PlanDoc } from '@/data/types'
import { buildHandoffReport } from '@/reports/handoff'
import { PathCompare } from './PathCompare'

/** Çalışma adımındaki yol karşılaştırması. Başka adımlar bu rapor kodunu yüklemez. */
export function WorkPaths({ plan }: { plan: PlanDoc }) {
  const paths = useMemo(() => buildHandoffReport(plan).paths, [plan])
  return <PathCompare paths={paths} />
}
