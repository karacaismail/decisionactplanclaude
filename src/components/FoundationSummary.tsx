import '@/styles/desen/strateji.css'
import '@/styles/bilesen/FoundationSummary.css'
import { useId, useMemo } from 'react'
import type { PlanDoc } from '@/data/types'
import { buildFoundationDoc, sourceLine, type FoundationDoc } from '@/reports/foundation'
/** Kısa görünümde her sorudan gösterilen satır ve kaynak sayısı. */
const COMPACT_LINES = 2
const COMPACT_SOURCES = 1

/**
 * Dayanak özeti: teslim raporunun dayandığı altı soru ve cevapları. Kart değildir, kartın içine konur.
 * `compact` kısa görünümdür: her sorudan ilk iki satır ve ilk kaynak yazılır. Kalanın sayısı altta yazar.
 * `columns={2}` geniş ekranda blokları iki sütuna dizer. Telefonda her zaman tek sütundur.
 * Kaynak satırı 14 piksel ve gridir: "Kaynak: Yürüyüş sayımı, 12 Eylül 2026 Cumartesi günü."
 */
export function FoundationSummary({ plan, doc, compact, columns = 1 }: { plan?: PlanDoc; doc?: FoundationDoc; compact?: boolean; columns?: 1 | 2 }) {
  const base = useId()
  const built = useMemo(() => doc ?? (plan ? buildFoundationDoc(plan) : null), [doc, plan])
  if (!built) return null
  return (
    <div className={`foundation-summary${columns === 2 ? ' is-two' : ''}`}>
      {built.answers.map((a, i) => {
        const lines = compact ? a.lines.slice(0, COMPACT_LINES) : a.lines
        const sources = compact ? a.sources.slice(0, COMPACT_SOURCES) : a.sources
        const moreLines = a.lines.length - lines.length
        const moreSources = a.sources.length - sources.length
        const headId = `${base}-soru-${i + 1}`
        return (
          <section key={a.question} className="foundation-block" aria-labelledby={headId}>
            <h3 id={headId} className="foundation-question">{a.question}</h3>
            <ul className={`foundation-lines${a.empty ? ' is-empty' : ''}`}>
              {lines.map((l, n) => <li key={n}>{l}</li>)}
            </ul>
            {sources.map((s, n) => <p key={n} className="foundation-source">{sourceLine(s)}</p>)}
            {moreLines > 0 || moreSources > 0 ? (
              <p className="foundation-more">
                {moreLines > 0 ? `${moreLines} satır daha var. ` : ''}
                {moreSources > 0 ? `${moreSources} kaynak daha var. ` : ''}
                Tamamı teslim raporunda yazar.
              </p>
            ) : null}
          </section>
        )
      })}
    </div>
  )
}
