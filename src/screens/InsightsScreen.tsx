import { useMemo, useState } from 'react'
import { Select, Typography, theme } from 'antd'
import { ChartBar } from '@phosphor-icons/react'
import { useCurrentPlan } from '@/store/planStore'
import { ChartFrame } from '@/charts/ChartFrame'
import { buildInsights, summaryTiles, type InsightPalette } from '@/charts/insights'
import { outcomeColor } from '@/components/DecisionBadge'
import { dark as darkPalette } from '@/theme/tokens'

/** Göstergeler. Dört özet kutusu ve seçilen grafik. Sayılar adımlardan gelir. */
export function InsightsScreen() {
  const { token } = theme.useToken()
  const plan = useCurrentPlan()
  const [selected, setSelected] = useState<string>('adimlar')
  const isDark = token.colorBgLayout.toLowerCase() === darkPalette.surfacePage.toLowerCase()
  const palette = useMemo<InsightPalette>(
    () => ({ primary: token.colorPrimary, info: token.colorInfo, success: token.colorSuccess, warning: token.colorWarning, error: token.colorError, muted: token.colorBorder, outcome: (o) => outcomeColor(o, isDark) }),
    [token, isDark],
  )
  const tiles = useMemo(() => (plan ? summaryTiles(plan) : []), [plan])
  const insights = useMemo(() => (plan ? buildInsights(plan, palette) : []), [plan, palette])
  if (!plan) return null
  const current = insights.find((i) => i.id === selected) ?? insights[0]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
        <Typography.Title level={1} style={{ fontSize: 32, marginBottom: 0 }}>Göstergeler</Typography.Title>
        <Typography.Text style={{ color: token.colorTextSecondary }}>Bu ekran planınızdaki sayıları gösterir. Sayılar adımlarda yazdığınız cevaplardan gelir.</Typography.Text>
      </div>

      <div role="group" aria-label="Özet" style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 170px), 1fr))' }}>
        {tiles.map((t) => (
          <div key={t.key} style={{ background: token.colorBgContainer, borderRadius: token.borderRadiusLG, padding: '14px 16px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4, minWidth: 0 }}>
            <span style={{ fontSize: 14, color: token.colorTextSecondary }}>{t.title}</span>
            <span className="tabular" style={{ fontSize: 22, fontWeight: 600, overflowWrap: 'anywhere' }}>{t.value}</span>
            <span style={{ fontSize: 14, color: token.colorTextSecondary }}>{t.note}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12 }}>
        <label htmlFor="gosterge-sec" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 6 }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>Gösterge seçin</span>
          <Select
            id="gosterge-sec"
            aria-label="Gösterge seçin"
            value={current.id}
            onChange={setSelected}
            options={insights.map((i) => ({ value: i.id, label: i.empty ? `${i.title} (ölçüm bekleniyor)` : i.title }))}
            style={{ width: '100%', maxWidth: 480 }}
          />
        </label>
        <Typography.Text style={{ fontSize: 14, color: token.colorTextSecondary }}>{current.source}</Typography.Text>
        {current.empty ? (
          <div role="status" style={{ background: token.colorBgContainer, borderRadius: token.borderRadiusLG, padding: 24, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8, justifyItems: 'start' }}>
            <ChartBar size={28} color={token.colorTextSecondary} aria-hidden />
            <Typography.Text strong style={{ fontSize: 16 }}>{current.title}</Typography.Text>
            <Typography.Text style={{ fontSize: 16 }}>Bu gösterge için ölçüm bekleniyor.</Typography.Text>
            <Typography.Text style={{ fontSize: 14, color: token.colorTextSecondary }}>{current.hint}</Typography.Text>
          </div>
        ) : (
          <ChartFrame key={current.id} title={current.title} summary={current.summary} option={current.option} table={current.table} height={current.id === 'nakit' ? 360 : 300} />
        )}
      </div>
    </div>
  )
}
