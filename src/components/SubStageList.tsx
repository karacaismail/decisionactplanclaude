import { Tag } from 'antd'
import { Link } from 'react-router'
import type { PlanDoc } from '@/data/types'
import { SUB_STAGE_LABEL, type SubStageDef } from '@/data/clusters'

/**
 * Bir ana kümenin zorunlu alt aşamaları. Her satır kodu, adı, yapılan işi, zorunluluk nedenini ve dayanağı gösterir.
 * Liste sıralıdır ve telefonda tek sütundur. Kilitliyken bağlantı "İncele" diye görünür.
 */
export function SubStageList({ plan, items, locked }: { plan: PlanDoc; items: SubStageDef[]; locked: boolean }) {
  return (
    <ol className="substage-list">
      {items.map((s) => {
        const state = s.state(plan)
        return (
          <li key={s.code} className="substage">
            <span className="substage-code tabular" aria-hidden>{s.code}</span>
            <div className="substage-body">
              <div className="substage-head">
                <h3 className="substage-title"><span className="visually-hidden">Alt aşama {s.code}. </span>{s.title}</h3>
                <Tag color={state === 'tamam' ? 'success' : state === 'suruyor' ? 'processing' : undefined}>{SUB_STAGE_LABEL[state]}</Tag>
              </div>
              <p className="substage-does">{s.does}</p>
              <p className="helper">Neden zorunlu? {s.why}</p>
              <p className="helper">Dayanak: {s.frameworks.join(', ')}.</p>
              <Link className="substage-link" to={s.path}>{locked && s.steps.length ? `${s.code} ${s.title} adımını incele` : s.pathLabel}</Link>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
