import { useMemo, useState } from 'react'
import { Select } from 'antd'
import { useCurrentPlan, usePlanStore } from '@/store/planStore'
import { ChartFrame } from '@/charts/ChartFrame'
import { buildInsights, summaryTiles, type InsightPalette } from '@/charts/insights'
import { outcomeColor } from '@/components/DecisionBadge'
import { PageHeader } from '@/components/PageHeader'
import { resolveMode } from '@/theme/antdTheme'
import { palette as paletteOf } from '@/theme/tokens'
import '@/styles/screens-rapor.css'

/**
 * Göstergeler. Dört özet değer ve seçilen grafik. Sayılar adımlardan gelir.
 * Özet değerler kutu değildir. KPI şeridi yalnız plan özetinde durur.
 */
export function InsightsScreen() {
  const plan = useCurrentPlan()
  const themePref = usePlanStore((s) => s.theme)
  const [selected, setSelected] = useState<string>('adimlar')
  const mode = resolveMode(themePref)
  const isDark = mode === 'dark'
  const colors = useMemo<InsightPalette>(() => {
    const p = paletteOf(mode)
    return {
      primary: p.textPrimary,
      info: p.statusInfo,
      success: p.statusOk,
      warning: p.statusHold,
      error: p.statusHarm,
      /* Kalan: açık gri. Koyu temada kenar rengi daha iyi görünür. */
      muted: isDark ? p.borderStrong : p.surfaceSunken,
      axis: p.textSecondary,
      grid: p.border,
      onInk: p.surfaceWork,
      ramp: [p.textPrimary, p.textSecondary, p.borderStrong, p.surfaceSunken],
      outcome: (o) => outcomeColor(o, isDark),
    }
  }, [mode, isDark])
  const tiles = useMemo(() => (plan ? summaryTiles(plan) : []), [plan])
  const insights = useMemo(() => (plan ? buildInsights(plan, colors) : []), [plan, colors])
  if (!plan) return null
  const current = insights.find((i) => i.id === selected) ?? insights[0]

  return (
    <div className="page">
      <PageHeader kicker="Göstergeler" title="Göstergeler" description="Bu ekran planınızdaki sayıları gösterir. Sayılar adımlarda yazdığınız cevaplardan gelir." />

      <section className="section" aria-label="Özet">
        <div className="two-col" style={{ rowGap: 0 }}>
          {tiles.map((t) => (
            <div key={t.key} className="fact">
              <span className="helper">{t.title}</span>
              {t.numeric ? <span className="fact-value">{t.value}</span> : <span className="fact-text">{t.value}</span>}
              <span className="helper">{t.note}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section" aria-label="Grafik">
        <div className="toolbar">
          <div className="filter-field">
            <label className="field-label" htmlFor="gosterge-sec">Gösterge</label>
            <Select
              id="gosterge-sec"
              value={current.id}
              onChange={setSelected}
              options={insights.map((i) => ({ value: i.id, label: i.empty ? `${i.title} (ölçüm bekleniyor)` : i.title }))}
              style={{ width: '100%' }}
            />
          </div>
          <span className="helper" style={{ flex: '1 1 240px' }}>{current.source}</span>
        </div>
        {current.empty ? (
          <div className="empty-state" role="status">
            <h2>{current.title}</h2>
            <p>Bu gösterge için ölçüm bekleniyor. {current.hint}</p>
          </div>
        ) : (
          <ChartFrame key={current.id} title={current.title} summary={current.summary} option={current.option} table={current.table} />
        )}
      </section>
    </div>
  )
}
