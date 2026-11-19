import '@/styles/desen/pano.css'
import '@/styles/desen/pano-ortak.css'
import '@/styles/desen/page-rapor.css'
import '@/styles/ekran/InsightsScreen.css'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { Card, Empty, Progress, Statistic } from 'antd'
import { ArrowRight } from '@phosphor-icons/react'
import { useCurrentPlan } from '@/store/planStore'
import { ChartFrame } from '@/charts/ChartFrame'
import { buildInsights, statCards, type Insight, type InsightPalette } from '@/charts/insights'
import { outcomeColor } from '@/components/DecisionBadge'
import { PageHeader } from '@/components/PageHeader'
import { useResolvedTheme } from '@/app/printMode'
import { chartSeries, font, palette as paletteOf } from '@/theme/tokens'
/**
 * Göstergeler. Üstte dört istatistik kartı, altında grafik ızgarası.
 * Masaüstünde iki sütun, telefonda tek sütun. Her gösterge kendi kartındadır.
 * Veri yoksa kartta boş durum ve doldurulacak adımın bağlantısı görünür. Sayılar adımlardan gelir.
 */
export function InsightsScreen() {
  const plan = useCurrentPlan()
  const mode = useResolvedTheme()
  const isDark = mode === 'dark'
  const colors = useMemo<InsightPalette>(() => {
    const p = paletteOf(mode)
    return {
      /* Ana seri lacivert ton. Açık temada koyu, koyu temada açık mavi: zeminden iki temada da ayrışır. */
      primary: p.toneNavy,
      info: p.statusInfo,
      success: p.statusOk,
      warning: p.statusHold,
      error: p.statusHarm,
      /* Kalan: ikincil yazı rengi. Açık temada beyaz zeminden en az 3:1 ayrışır. */
      muted: p.textSecondary,
      axis: p.textSecondary,
      grid: p.border,
      onInk: p.surfaceWork,
      ramp: [p.toneNavy, p.toneTeal, p.tonePurple, p.textSecondary],
      series: chartSeries.map((key) => p[key]),
      outcome: (o) => outcomeColor(o, isDark),
    }
  }, [mode, isDark])
  const stats = useMemo(() => (plan ? statCards(plan) : []), [plan])
  const insights = useMemo(() => (plan ? buildInsights(plan, colors) : []), [plan, colors])
  if (!plan) return null

  return (
    <div className="page page-rapor mobil-insights">
      <PageHeader kicker="Göstergeler" title="Göstergeler" description="Bu ekran planınızdaki sayıları gösterir. Sayılar adımlarda yazdığınız cevaplardan gelir." />

      <section className="insight-stats" aria-label="Özet sayılar">
        {stats.map((t) => (
          <Card key={t.key} className="insight-stat">
            {t.numeric ? (
              <Statistic title={t.title} value={t.value} suffix={t.suffix} />
            ) : (
              <Statistic title={t.title} value={t.value} className="insight-stat-text" />
            )}
            {t.percent !== null ? <Progress percent={t.percent} showInfo={false} size="small" aria-label={`${t.title} yüzde ${t.percent}`} /> : null}
            <p className="helper">{t.note}</p>
          </Card>
        ))}
      </section>

      <section className="insight-section" aria-labelledby="insight-charts-heading">
        <header className="insight-section-head">
          <h2 id="insight-charts-heading">Grafikler ve tablolar</h2>
          <p className="helper">Sayıları tablo olarak görmek için “Tablo” seçeneğini seçin.</p>
        </header>
        <div className="insight-grid">
          {insights.map((i) => <InsightCard key={i.id} insight={i} />)}
        </div>
      </section>
    </div>
  )
}

/** Dolu gösterge ChartFrame ile çizilir. Boş gösterge kartında boş durum ve adım bağlantısı vardır. */
function InsightCard({ insight }: { insight: Insight }) {
  if (insight.empty) {
    return (
      <section className="insight-card is-empty" aria-label={insight.title}>
        <Card title={<h3 className="insight-title">{insight.title}</h3>} variant="borderless">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span className="insight-empty-text">Bu gösterge için ölçüm bekleniyor. {insight.hint}</span>}
          >
            <Link className="insight-empty-link" to={insight.link.to}>
              {insight.link.label}
              <ArrowRight size={font.body} aria-hidden />
            </Link>
          </Empty>
          <p className="helper insight-source">{insight.source}</p>
        </Card>
      </section>
    )
  }
  return (
    <section className="insight-card insight-chart" aria-label={insight.title}>
      <ChartFrame title={insight.title} summary={insight.summary} option={insight.option} table={insight.table} height={insight.height} frame="plain" />
      <p className="helper insight-source">{insight.source}</p>
    </section>
  )
}
