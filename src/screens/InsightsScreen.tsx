import { useMemo } from 'react'
import { Link } from 'react-router'
import { Card, Empty, Progress, Statistic } from 'antd'
import { ArrowRight } from '@phosphor-icons/react'
import { useCurrentPlan, usePlanStore } from '@/store/planStore'
import { ChartFrame } from '@/charts/ChartFrame'
import { buildInsights, statCards, type Insight, type InsightPalette } from '@/charts/insights'
import { outcomeColor } from '@/components/DecisionBadge'
import { PageHeader } from '@/components/PageHeader'
import { resolveMode } from '@/theme/antdTheme'
import { palette as paletteOf } from '@/theme/tokens'
import '@/styles/screens-rapor.css'

/**
 * Göstergeler. Üstte dört istatistik kartı, altında grafik ızgarası.
 * Masaüstünde iki sütun, telefonda tek sütun. Her gösterge kendi kartındadır.
 * Veri yoksa kartta boş durum ve doldurulacak adımın bağlantısı görünür. Sayılar adımlardan gelir.
 */
export function InsightsScreen() {
  const plan = useCurrentPlan()
  const themePref = usePlanStore((s) => s.theme)
  const mode = resolveMode(themePref)
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
      series: [p.toneNavy, p.toneTeal, p.tonePurple, p.toneOrange, p.statusInfo, p.statusHold, p.textSecondary],
      outcome: (o) => outcomeColor(o, isDark),
    }
  }, [mode, isDark])
  const stats = useMemo(() => (plan ? statCards(plan) : []), [plan])
  const insights = useMemo(() => (plan ? buildInsights(plan, colors) : []), [plan, colors])
  if (!plan) return null

  return (
    <div className="page page-rapor">
      <PageHeader kicker="Göstergeler" title="Göstergeler" description="Bu ekran planınızdaki sayıları gösterir. Sayılar adımlarda yazdığınız cevaplardan gelir." />

      <section className="insight-stats" aria-label="Özet sayılar">
        {stats.map((t) => (
          <Card key={t.key} className="insight-stat">
            {t.numeric ? (
              <Statistic title={t.title} value={t.value} suffix={t.suffix} />
            ) : (
              <Statistic title={t.title} value={t.value} className="insight-stat-text" />
            )}
            {t.percent !== null ? <Progress percent={t.percent} showInfo={false} size={{ height: 6 }} aria-label={`${t.title} yüzde ${t.percent}`} /> : null}
            <p className="helper">{t.note}</p>
          </Card>
        ))}
      </section>

      <section className="insight-grid" aria-label="Grafikler">
        {insights.map((i) => <InsightCard key={i.id} insight={i} />)}
      </section>
    </div>
  )
}

/** Dolu gösterge ChartFrame ile çizilir. Boş gösterge kartında boş durum ve adım bağlantısı vardır. */
function InsightCard({ insight }: { insight: Insight }) {
  if (insight.empty) {
    return (
      <Card title={insight.title} className="insight-card is-empty">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span className="insight-empty-text">Bu gösterge için ölçüm bekleniyor. {insight.hint}</span>}
        >
          <Link className="insight-empty-link" to={insight.link.to}>
            {insight.link.label}
            <ArrowRight size={16} aria-hidden />
          </Link>
        </Empty>
        <p className="helper">{insight.source}</p>
      </Card>
    )
  }
  /* Özet cümlesi ve kaynak açıklaması grafik altında birlikte durur. */
  const summary = [insight.summary, insight.source].filter(Boolean).join(' ')
  return (
    <div className="insight-card">
      <ChartFrame title={insight.title} summary={summary} option={insight.option} table={insight.table} height={insight.height} />
    </div>
  )
}
