/**
 * 96 px ilerleme halkası. Geçilen karar sayısını ve sırayı gösterir.
 * Dış varlık kullanmaz. Süsleme değildir: içindeki sayı ekran okuyucuya açıktır.
 */
const SIZE = 96
const R = 42
const C = 2 * Math.PI * R

export function CompassArt({ active, passed }: { active: number; passed: number[] }) {
  const done = passed.length
  const ratio = Math.min(1, Math.max(0, done / 8))
  return (
    <div className="ring" role="img" aria-label={`${done} karar geçti, açık karar ${active}`}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true" focusable="false">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="var(--color-hero-line)" strokeOpacity="0.35" strokeWidth="6" />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="var(--color-hero-action)"
          strokeWidth="6"
          strokeLinecap="butt"
          strokeDasharray={`${(C * ratio).toFixed(2)} ${C.toFixed(2)}`}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </svg>
      <span className="ring-text">
        {done} <span>/ 8</span>
      </span>
    </div>
  )
}
