/**
 * Sekiz kararı temsil eden halka. Dış varlık kullanmaz, yalnız SVG çizer.
 * Geçilen kararlar dolu, açık karar vurgulu, sıradaki kararlar soluk görünür.
 * Süsleme amaçlıdır; ekran okuyucuya kapalıdır.
 */
const SIZE = 360
const CX = SIZE / 2
const CY = SIZE / 2
const RING = 118

function point(index: number, r = RING): { x: number; y: number } {
  const a = (-90 + index * 45) * (Math.PI / 180)
  return { x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r }
}

function arc(from: number, to: number, r = RING): string {
  const p = point(from, r)
  const q = point(to, r)
  return `M ${p.x.toFixed(2)} ${p.y.toFixed(2)} A ${r} ${r} 0 0 1 ${q.x.toFixed(2)} ${q.y.toFixed(2)}`
}

export function CompassArt({ active, passed }: { active: number; passed: number[] }) {
  const passedSet = new Set(passed)
  const activeIdx = Math.min(8, Math.max(1, active)) - 1
  const needle = point(activeIdx, RING - 26)
  const line = 'var(--color-hero-line)'
  const action = 'var(--color-hero-action)'
  const text = 'var(--color-hero-text)'
  const alt = 'var(--color-hero-surface-alt)'
  const actionText = 'var(--color-hero-action-text)'

  return (
    <svg aria-hidden="true" focusable="false" viewBox={`0 0 ${SIZE} ${SIZE}`} fill="none" role="presentation">
      {/* Arka plan yüzeyi ve yumuşak ışık */}
      <defs>
        <radialGradient id="compass-glow" cx="50%" cy="50%" r="60%">
          <stop offset="0" style={{ stopColor: alt, stopOpacity: 0.9 }} />
          <stop offset="1" style={{ stopColor: alt, stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      <circle cx={CX} cy={CY} r={RING + 48} fill="url(#compass-glow)" />

      {/* Dış derece halkası */}
      <circle cx={CX} cy={CY} r={RING + 34} style={{ stroke: line, strokeOpacity: 0.25 }} strokeWidth="1" />
      <g style={{ stroke: line, strokeOpacity: 0.45 }} strokeWidth="1.2">
        {Array.from({ length: 72 }, (_, i) => {
          const major = i % 9 === 0
          const r1 = RING + 34
          const r2 = r1 - (major ? 10 : 4)
          const a = (i * 5) * (Math.PI / 180)
          return <line key={i} x1={CX + Math.cos(a) * r1} y1={CY + Math.sin(a) * r1} x2={CX + Math.cos(a) * r2} y2={CY + Math.sin(a) * r2} />
        })}
      </g>

      {/* İç kılavuz: ışınlar ve iki ince halka */}
      <g style={{ stroke: line, strokeOpacity: 0.18 }} strokeWidth="1">
        {Array.from({ length: 8 }, (_, i) => {
          const p = point(i, RING - 14)
          return <line key={i} x1={CX} y1={CY} x2={p.x} y2={p.y} />
        })}
        <circle cx={CX} cy={CY} r={RING - 40} strokeDasharray="3 6" />
        <circle cx={CX} cy={CY} r={RING - 72} />
      </g>

      {/* Rota: sıradaki bölümler soluk, geçilen bölümler dolu */}
      <circle cx={CX} cy={CY} r={RING} style={{ stroke: line, strokeOpacity: 0.3 }} strokeWidth="6" strokeLinecap="round" />
      {Array.from({ length: 7 }, (_, i) =>
        passedSet.has(i + 1) ? <path key={i} d={arc(i, i + 1)} style={{ stroke: line }} strokeWidth="6" strokeLinecap="round" /> : null,
      )}
      {passedSet.has(8) ? <path d={arc(7, 8)} style={{ stroke: line }} strokeWidth="6" strokeLinecap="round" /> : null}

      {/* İbre: merkezden açık karara */}
      <line x1={CX} y1={CY} x2={needle.x} y2={needle.y} style={{ stroke: action }} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={CX} cy={CY} r="9" style={{ fill: alt, stroke: line }} strokeWidth="2" />
      <circle cx={CX} cy={CY} r="3" style={{ fill: action }} />

      {/* Düğümler */}
      {Array.from({ length: 8 }, (_, i) => {
        const p = point(i)
        const n = i + 1
        const isActive = i === activeIdx
        const isPassed = passedSet.has(n)
        if (isActive) {
          return (
            <g key={n}>
              <circle cx={p.x} cy={p.y} r="30" style={{ fill: action, fillOpacity: 0.18 }} />
              <circle cx={p.x} cy={p.y} r="21" style={{ fill: action }} />
              <text x={p.x} y={p.y + 6} textAnchor="middle" fontSize="17" fontWeight="700" fontFamily="inherit" style={{ fill: actionText }}>
                {String(n).padStart(2, '0')}
              </text>
            </g>
          )
        }
        return (
          <g key={n}>
            <circle cx={p.x} cy={p.y} r="14" style={isPassed ? { fill: line } : { fill: alt, stroke: line, strokeOpacity: 0.7 }} strokeWidth="1.5" />
            {isPassed ? (
              <path d={`M ${p.x - 5.5} ${p.y} l 4 4 l 7 -7.5`} style={{ stroke: alt }} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="14" fontWeight="600" fontFamily="inherit" style={{ fill: text, fillOpacity: 0.75 }}>
                {n}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
