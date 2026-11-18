import '@/styles/desen/pano.css'
import '@/styles/desen/pano-card.css'
import '@/styles/desen/pano-ortak.css'
import '@/styles/desen/form.css'
import '@/styles/ekran/OverviewScreen.css'
import { useEffect, useMemo, useState } from 'react'
import { App as AntApp, Button, Card, Collapse, Descriptions, Empty, Grid, Progress, Statistic, Switch, Tabs, Tag, Timeline, theme } from 'antd'
import { Link, useNavigate } from 'react-router'
import { ArrowRight, CheckSquare, DownloadSimple, Flag, Notebook, Path } from '@phosphor-icons/react'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { DECISIONS, STRATEGY, STRATEGY_N } from '@/data/decisions'
import { stepsOf } from '@/data/registry'
import { EXECUTION_DECISIONS, FOUNDATION_DECISIONS, STAGES, type StageKey } from '@/data/stages'
import { CLUSTER_STATE_LABEL, clusterOf, clusterState } from '@/data/clusters'
import { decisionLocked, gatePassed, effectiveOutcome, lastDecision, retriesLeft } from '@/engine/gate'
import { LEVELS, effectiveTransition, lastTransition, transitionPassed } from '@/engine/readiness'
import { stepApplies } from '@/engine/conditions'
import { Callout } from '@/components/Callout'
import { DecisionBadge, outcomeColor } from '@/components/DecisionBadge'
import { planPosition } from '@/engine/position'
import { BACKUP_DAYS, backupState } from '@/engine/backup'
import { downloadJson, safeFileName } from '@/engine/sync'
import { exportPlanFile } from '@/store/bundle'
import { PageHeader } from '@/components/PageHeader'
import { KpiStrip, StatTile } from '@/components/StatTile'
import { ChartFrame } from '@/charts/ChartFrame'
import { cashDays, cashFlowOption, cashFlowTable } from '@/charts/overview'
import { formatDate, formatMoney } from '@/engine/format'
import { palette } from '@/theme/tokens'
import { resolveMode } from '@/theme/antdTheme'
import { OUTCOME_LABEL, TRANSITION_LABEL, type Evidence, type PlanDoc, type Task } from '@/data/types'
import type { StepDef } from '@/data/schema'
const two = (n: number) => String(n).padStart(2, '0')
const today = () => new Date().toISOString().slice(0, 10)

function visibleSteps(plan: PlanDoc, n: number): StepDef[] {
  return stepsOf(n).filter((s) => stepApplies(s.mandatory, plan) !== 'gizli' && (!plan.shortPath || s.shortPath))
}

function isDone(plan: PlanDoc, s: StepDef): boolean {
  const st = plan.steps[s.id]?.status
  return st === 'tamam' || st === 'atlandi'
}

/** Hazırlık kontrolünün durumu tek cümlede. Karar yoksa "Karar yok". */
function transitionText(plan: PlanDoc): string {
  const t = lastTransition(plan)
  if (!t) return 'Karar yok'
  if (t.stale) return `${TRANSITION_LABEL[t.outcome]}, inceleme bekliyor`
  if (effectiveTransition(t) !== t.outcome) return `${TRANSITION_LABEL[t.outcome]}, süresi doldu`
  return TRANSITION_LABEL[t.outcome]
}

type StepStatus = 'finish' | 'process' | 'wait'

const TASK_TAG: Record<Task['status'], { label: string; color?: string }> = {
  taslak: { label: 'Taslak' },
  acik: { label: 'Açık', color: 'processing' },
  bitti: { label: 'Bitti', color: 'success' },
  iptal: { label: 'İptal' },
}
const KIND_TAG: Record<Evidence['kind'], { label: string; color?: string }> = {
  gozlem: { label: 'Gözlem', color: 'success' },
  tahmin: { label: 'Tahmin' },
  varsayim: { label: 'Varsayım', color: 'warning' },
}

const show = (v: unknown): string => {
  if (v === null || v === undefined || v === '') return 'Boş'
  if (typeof v === 'number') return v.toLocaleString('tr-TR')
  if (typeof v === 'boolean') return v ? 'Evet' : 'Hayır'
  return String(v)
}

export function OverviewScreen() {
  const nav = useNavigate()
  const plan = useCurrentPlan()
  const update = usePlanStore((s) => s.update)
  const backups = usePlanStore((s) => s.backups)
  const markBackup = usePlanStore((s) => s.markBackup)
  const { message } = AntApp.useApp()
  const themePref = usePlanStore((s) => s.theme)
  const { token } = theme.useToken()
  const bp = Grid.useBreakpoint()
  const mode = resolveMode(themePref)
  const p = palette(mode)
  const position = plan ? planPosition(plan) : undefined
  const currentStage = position?.stage
  const [openGroups, setOpenGroups] = useState<string[] | null>(null)
  /* Başlangıç grupları ilk bilinen yerleşimde seçilir. Sonraki genişlik değişimleri seçimi değiştirmez. */
  useEffect(() => {
    if (bp.md === undefined || currentStage === undefined) return
    setOpenGroups((groups) => {
      if (groups !== null) return groups
      if (bp.md) return ['hazirlik', 'olusturma', 'uygulama']
      if (currentStage === 'gecis') return []
      return [currentStage === 'temel' ? 'hazirlik' : currentStage === 'strateji' ? 'olusturma' : 'uygulama']
    })
  }, [bp.md, currentStage])
  /* Bu seçim genişliğe bağlı değildir. Yön değişince içerikteki odak korunur. */
  const [recentOpen, setRecentOpen] = useState(false)
  const days = useMemo(() => (plan ? cashDays(plan) : []), [plan])
  const chartOption = useMemo(
    () => cashFlowOption(days, { line: p.toneTeal, area: p.toneTealBg, axis: p.border, text: p.textSecondary, zero: p.statusHarm }),
    [days, p],
  )
  if (!plan || !position) return null
  const lastBackupAt = backups[plan.id]
  const backup = backupState(plan, lastBackupAt)
  /* Yedek modül verisini de taşır. Modül verisi yoksa düz plan dosyası yazılır. */
  const takeBackup = () => {
    /* Dışa aktarma başarısızsa yedek alınmış sayılmaz. Hata ekranda görünür. */
    exportPlanFile(plan).then((data) => {
      downloadJson(`${safeFileName(plan.name)}.json`, data)
      markBackup(plan.id)
    }, (err: unknown) => message.error(err instanceof Error ? err.message : 'Yedek alınamadı. Plan dışa aktarılamadı.'))
  }
  const { level, strategyDone, strategyTotal } = position
  const foundationPassed = FOUNDATION_DECISIONS.filter((n) => gatePassed(plan, n)).length
  const foundationDone = foundationPassed === FOUNDATION_DECISIONS.length
  const executionPassed = EXECUTION_DECISIONS.filter((n) => gatePassed(plan, n)).length
  const transitionOk = transitionPassed(plan)
  const transitionStale = Boolean(lastTransition(plan)?.stale)
  const lastT = lastTransition(plan)
  const transitionExpired = Boolean(lastT && !lastT.stale && lastT.outcome === 'kosullu' && effectiveTransition(lastT) === 'degil')
  const gecisText = transitionText(plan)
  const strategyLocked = decisionLocked(plan, STRATEGY_N)
  /* Sıradaki karar. Geçiş ve strateji bölümünde ilk uygulama kararıdır. */
  const current = DECISIONS.find((d) => d.n === (position.decision ?? EXECUTION_DECISIONS.find((n) => !gatePassed(plan, n)))) ?? DECISIONS[DECISIONS.length - 1]
  const allSteps = [...DECISIONS, STRATEGY].flatMap((d) => visibleSteps(plan, d.n))
  const doneSteps = allSteps.filter((s) => isDone(plan, s)).length
  const openTasks = plan.tasks.filter((t) => t.status === 'acik' || t.status === 'taslak')
  const lateTasks = openTasks.filter((t) => t.dueDate && t.dueDate.slice(0, 10) < today())
  const observations = plan.evidence.filter((e) => e.kind === 'gozlem').length
  const recent = [...plan.decisions].slice(-3).reverse()
  const recentEvidence = [...plan.evidence].sort((a, b) => (b.date ?? b.createdAt).localeCompare(a.date ?? a.createdAt)).slice(0, 5)
  const changes = [...(plan.changes ?? [])].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6)
  const resumeTo = plan.lastLocation && plan.lastLocation !== '/ozet' ? plan.lastLocation : null
  const { budgetKurus, deadline, retriesPerDecision, monthlyBurnKurus, cashKurus, hoursPerWeek } = plan.limits
  const runway = monthlyBurnKurus && cashKurus ? Math.floor(cashKurus / monthlyBurnKurus) : null
  const runwayPercent = runway === null ? 0 : Math.min(100, Math.round((runway / 12) * 100))
  const retryMax = current.gate.maxRetries
  const retryTotal = Math.min(retriesPerDecision ?? retryMax, retryMax)
  const retryLeft = retriesLeft(plan, current.n, retryMax)

  /* Hero sıradaki işi gösterir. Sıra: temel kararı, hazırlık kontrolü, strateji oluşturma, uygulama kararı. */
  const stageTitle = (key: StageKey) => STAGES.find((x) => x.key === key)?.title ?? ''
  const decisionTask = (kicker: string, stage: StageKey) => ({
    kicker,
    count: `${stageTitle(stage)}, Karar ${current.n}`,
    title: current.title,
    text: current.question,
    long: true,
    button: resumeTo ? 'Kaldığım yerden devam et' : 'Kararı incele',
    to: resumeTo ?? `/karar/${current.n}`,
  })
  const next =
    position.stage === 'gecis'
      ? { kicker: 'Sıradaki iş', count: '', title: 'Hazırlık kontrolü', text: 'Dayanak yeterli mi? Kararı kaydedin.', long: false, button: 'Hazırlık kontrolünü aç', to: '/gecis' }
      : position.stage === 'strateji'
        ? { kicker: 'Sıradaki iş', count: '', title: STRATEGY.title, text: 'Asıl güçlüğü yazın. Yolları sınayın ve birini seçin.', long: false, button: 'Strateji oluşturmayı aç', to: '/strateji' }
        : position.stage === 'bitti'
          ? decisionTask('Son karar geçildi', 'uygulama')
          : decisionTask('Açık karar', position.stage)
  /* Bağlantıların hedefi sıradaki iştir. "Kaldığım yer" yalnız hero düğmesindedir. */
  const nextPath = position.stage === 'gecis' ? '/gecis' : position.stage === 'strateji' ? '/strateji' : `/karar/${current.n}`

  /* Dört bölümün durumu. Yol kartı ve karar rotası bu durumu kümelere göre gösterir. */
  const stageState: Record<StageKey, { text: string; status: StepStatus }> = {
    temel: { text: `${foundationPassed} / ${FOUNDATION_DECISIONS.length} kontrol`, status: foundationDone ? 'finish' : 'process' },
    gecis: { text: gecisText, status: transitionOk ? 'finish' : position.stage === 'gecis' ? 'process' : 'wait' },
    strateji: { text: !transitionOk ? 'Kilitli' : `${strategyDone} / ${strategyTotal} adım`, status: !transitionOk ? 'wait' : position.strategyComplete ? 'finish' : 'process' },
    uygulama: {
      text: decisionLocked(plan, EXECUTION_DECISIONS[0]) ? 'Kilitli' : executionPassed === EXECUTION_DECISIONS.length ? 'Tamamlandı' : 'Açık',
      status: executionPassed === EXECUTION_DECISIONS.length ? 'finish' : position.stage === 'uygulama' ? 'process' : 'wait',
    },
  }
  /* Yol kartı üç ana kümeyi gösterir. Her küme kendi ekranına gider. Birinci küme sıradaki temel işine gider. */
  const clusterRoad: { key: string; title: string; text: string; status: StepStatus; to: string }[] = [
    {
      key: 'hazirlik',
      title: clusterOf('hazirlik').title,
      text: transitionOk ? `Hazırlık kontrolü: ${gecisText}` : `${stageState.temel.text}. ${gecisText === 'Karar yok' ? 'Hazırlık kararı yok' : `Hazırlık kontrolü: ${gecisText}`}`,
      status: transitionOk ? 'finish' : 'process',
      to: transitionOk || foundationDone ? '/gecis' : `/karar/${current.n}`,
    },
    { key: 'olusturma', title: clusterOf('olusturma').title, text: stageState.strateji.text, status: stageState.strateji.status, to: '/strateji' },
    { key: 'uygulama', title: clusterOf('uygulama').title, text: stageState.uygulama.text, status: stageState.uygulama.status, to: '/uygulama' },
  ]
  /* Karar rotasının satırları. Kilit tek kuraldan gelir (decisionLocked). */
  const decisionRoute = (n: number) => {
    const d = DECISIONS.find((x) => x.n === n)!
    const isPassed = gatePassed(plan, n)
    const isCurrent = position.decision === n
    const steps = visibleSteps(plan, n)
    const done = steps.filter((s) => isDone(plan, s)).length
    const last = lastDecision(plan, n)
    const state = isPassed && last ? OUTCOME_LABEL[effectiveOutcome(last)] : isCurrent ? 'Açık' : decisionLocked(plan, n) ? 'Kilitli' : 'Bekliyor'
    return { key: `karar-${n}`, title: `${two(n)} ${d.title}`, content: `${done} / ${steps.length} adım, ${state}`, status: (isPassed ? 'finish' : isCurrent ? 'process' : 'wait') as StepStatus, to: `/karar/${n}` }
  }
  /* Karar rotası üç ana kümeye göre dizilir. Kümeler `clusters.ts` dosyasından gelir. */
  const executionLocked = decisionLocked(plan, EXECUTION_DECISIONS[0])
  const routeGroups = [
    {
      key: 'hazirlik',
      title: `1. ${clusterOf('hazirlik').title}`,
      summary: transitionOk ? 'Tamam' : stageState.temel.text,
      items: [...FOUNDATION_DECISIONS.map(decisionRoute), { key: 'gecis-kapisi', title: 'Hazırlık kontrolü', content: gecisText, status: stageState.gecis.status, to: '/gecis' }],
    },
    {
      key: 'olusturma',
      title: `2. ${clusterOf('olusturma').title}`,
      summary: CLUSTER_STATE_LABEL[clusterState(plan, 'olusturma')],
      items: [{ key: 'strateji', title: STRATEGY.title, content: `${strategyDone} / ${strategyTotal} adım, ${strategyLocked ? 'Kilitli' : position.strategyComplete ? 'Tamam' : 'Açık'}`, status: stageState.strateji.status, to: '/strateji' }],
    },
    {
      key: 'uygulama',
      title: `3. ${clusterOf('uygulama').title}`,
      summary: CLUSTER_STATE_LABEL[clusterState(plan, 'uygulama')],
      items: [
        { key: 'uygulama-ozeti', title: 'Uygulama özeti', content: executionLocked ? 'Kilitli' : 'Beş alt aşama', status: (executionLocked ? 'wait' : 'process') as StepStatus, to: '/uygulama' },
        ...EXECUTION_DECISIONS.map(decisionRoute),
      ],
    },
  ]
  const activeGroups = openGroups ?? []

  const timelineItems = recent.map((d) => {
    const def = DECISIONS[d.gate - 1]
    const outcome = effectiveOutcome(d)
    return {
      key: d.id,
      color: outcomeColor(outcome, mode === 'dark'),
      content: (
        <span className="tl-body">
          <span className="tl-head">
            <span className="tl-title">
              Kontrol {d.gate}. {def?.title ?? ''}
            </span>
            <DecisionBadge outcome={outcome} />
          </span>
          <span className="helper">{formatDate(d.decidedAt)}</span>
          {d.stale ? <Tag color="warning">İnceleme bekliyor</Tag> : null}
          {d.reason ? <span className="tl-reason">{d.reason}</span> : null}
        </span>
      ),
    }
  })

  const tabItems = [
    {
      key: 'isler',
      label: `Açık işler (${openTasks.length})`,
      children:
        openTasks.length === 0 ? (
          <Empty description="Açık iş yok.">
            <Link to="/isler">İş ekle</Link>
          </Empty>
        ) : (
          <>
            <ul className="overview-record-list" aria-label="Açık işler" role="list">
              {openTasks.map((task) => {
                const late = task.dueDate && task.dueDate.slice(0, 10) < today()
                return (
                  <li key={task.id}>
                    <h3 className="overview-record-heading">{task.action}</h3>
                    <dl className="overview-record-meta">
                      <div><dt>Sorumlu</dt><dd>{task.owner || 'Yazılmadı'}</dd></div>
                      <div><dt>Tarih</dt><dd>{task.dueDate ? formatDate(task.dueDate, false) : 'Tarih yok'}</dd></div>
                      <div><dt>Durum</dt><dd><Tag color={late ? 'error' : TASK_TAG[task.status].color}>{late ? 'Gecikti' : TASK_TAG[task.status].label}</Tag></dd></div>
                    </dl>
                  </li>
                )
              })}
            </ul>
            <Link className="overview-record-actions" to="/isler">İşleri aç</Link>
          </>
        ),
    },
    {
      key: 'kanitlar',
      label: `Son kanıtlar (${plan.evidence.length})`,
      children:
        recentEvidence.length === 0 ? (
          <Empty description="Henüz kanıt yok.">
            <Link to="/kanitlar">Kanıt ekle</Link>
          </Empty>
        ) : (
          <>
            <ul className="overview-record-list" aria-label="Son kanıtlar" role="list">
              {recentEvidence.map((evidence) => (
                <li key={evidence.id}>
                  <h3 className="overview-record-heading">{evidence.title}</h3>
                  <dl className="overview-record-meta">
                    <div><dt>Tür</dt><dd><Tag color={KIND_TAG[evidence.kind].color}>{KIND_TAG[evidence.kind].label}</Tag></dd></div>
                    <div><dt>Basamak</dt><dd className="tabular">{evidence.ladder}. basamak</dd></div>
                    <div><dt>Tarih</dt><dd>{formatDate(evidence.date ?? evidence.createdAt, false)}</dd></div>
                  </dl>
                </li>
              ))}
            </ul>
            <Link className="overview-record-actions" to="/kanitlar">Kanıtları aç</Link>
          </>
        ),
    },
    {
      key: 'degisiklik',
      label: `Değişiklik kaydı (${(plan.changes ?? []).length})`,
      children:
        changes.length === 0 ? (
          <Empty description="Sınır ve eşik değişikliği yok." />
        ) : (
          <ul className="overview-record-list" aria-label="Değişiklik kaydı" role="list">
            {changes.map((c) => (
              <li key={c.id}>
                <div className="change-row">
                  <div className="change-head">
                    <h3 className="overview-record-heading">{c.label}</h3>
                    {c.needsReview && !c.reviewer ? <Tag color="warning">İkinci görüş bekliyor</Tag> : null}
                  </div>
                  <p className="helper">
                    {show(c.before)} yerine {show(c.after)}. {formatDate(c.at, false)}.
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ),
    },
  ]

  const limitItems = [
    { key: 'butce', label: 'Toplam harcama sınırı', children: budgetKurus ? formatMoney(budgetKurus) : 'Yazılmadı' },
    { key: 'bitis', label: 'Bitiş tarihi', children: deadline ? formatDate(deadline, false) : 'Yazılmadı' },
    { key: 'deneme', label: 'Deneme hakkı', children: retriesPerDecision ? `${retriesPerDecision} / karar` : 'Yazılmadı' },
    { key: 'kasa', label: 'Kasadaki para', children: cashKurus ? formatMoney(cashKurus) : 'Yazılmadı' },
    { key: 'gider', label: 'Aylık gider', children: monthlyBurnKurus ? formatMoney(monthlyBurnKurus) : 'Yazılmadı' },
    { key: 'saat', label: 'Haftalık çalışma', children: hoursPerWeek ? `${hoursPerWeek} saat` : 'Yazılmadı' },
  ]

  return (
    <div className="page ozet mobil-overview">
      <PageHeader
        title={plan.name}
        documentTitle="Plan özeti"
        kicker="Plan özeti"
        description={<>Son değişiklik {formatDate(plan.updatedAt)}. Sürüm {plan.revision}.</>}
      />

      {backup === 'hic' || backup === 'eski' ? (
        <Callout tone="uyari" title="Yedek alın">
          {backup === 'hic' ? 'Bu planın yedeği hiç alınmadı.' : `Son yedek ${formatDate(lastBackupAt)} alındı. Yedek ${BACKUP_DAYS} günden eski.`} Plan yalnız bu tarayıcıda durur. Tarayıcı verisi silinirse plan kaybolur.
          <span className="backup-action">
            <Button icon={<DownloadSimple size={16} />} onClick={takeBackup}>Yedeği indir</Button>
          </span>
        </Callout>
      ) : null}
      {transitionExpired ? (
        <Callout tone="uyari" danger title="Koşullu hazırlık kararının süresi doldu">
          Açık soru son tarihe kadar kapanmadı. Strateji oluşturma yeniden kilitlendi. <Link to="/gecis">Hazırlık kontrolünde yeni karar kaydedin.</Link>
        </Callout>
      ) : null}
      {transitionStale ? (
        <Callout tone="uyari" title="Hazırlık kararı inceleme bekliyor">
          Temel verisi değişti. Hazırlık kararı yeniden inceleme ister. <Link to="/gecis">Hazırlık kontrolünü açın.</Link>
        </Callout>
      ) : null}

      <div className="ozet-top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="signal" aria-hidden />
              <span>{next.kicker}</span>
              {next.count ? <span className="hero-stage">{next.count}</span> : null}
            </div>
            <h2 id="hero-title">{next.title}</h2>
            <p className={next.long ? 'hero-question' : undefined}>{next.text}</p>
            <div className="hero-actions">
              <Button type="primary" className="hero-button" icon={<ArrowRight size={16} />} iconPlacement="end" onClick={() => nav(next.to)}>
                {next.button}
              </Button>
            </div>
          </div>
          <div className="hero-art hero-level">
            <Progress
              type="circle"
              status="normal"
              size={bp.md ? 112 : 56}
              percent={(level / 5) * 100}
              format={() => `${level} / 5`}
              strokeColor="var(--color-hero-action)"
              railColor="var(--color-hero-line)"
              aria-label={`Kanıt düzeyi ${level} / 5. ${LEVELS[level].title}.`}
            />
            <div className="hero-level-text">
              <span className="hero-level-label">Kanıt düzeyi</span>
              <span className="hero-level-name">{LEVELS[level].title}</span>
            </div>
          </div>
        </section>

        {/* Yol bağlantıları bütün genişliklerde aynı DOM içinde kalır. */}
        <Card className="pano-card yol-card" title="Yol" extra={<Link to="/temel">Temel sorular</Link>}>
          <ol className="overview-route-list overview-stage-list" aria-label="Yol" role="list">
            {clusterRoad.map((cluster) => (
              <li key={cluster.key} data-status={cluster.status}>
                <Link className="overview-route-link" to={cluster.to}>
                  <span className="overview-route-title">{cluster.title}</span>
                  <span className="overview-route-status">{cluster.text}</span>
                </Link>
              </li>
            ))}
          </ol>
        </Card>

        <div className="ozet-side">
          <Card className="pano-card" title="Kasa süresi" extra={<Link to="/karar/1/adim/02">Sınırlar</Link>}>
            <div className="pist">
              <Statistic value={runway ?? 'Hesaplanmadı'} suffix={runway !== null ? 'ay' : undefined} />
              <Progress percent={runwayPercent} showInfo={false} strokeColor={runway !== null && runway < 6 ? token.colorError : undefined} aria-label={`Kasa süresi ${runway ?? 0} ay, 12 ayın yüzde ${runwayPercent}'i`} />
              <p className="helper">
                {runway === null ? 'Kasadaki parayı ve aylık gideri sınırlarda yazın.' : `Kasadaki para ${formatMoney(cashKurus)}. Aylık gider ${formatMoney(monthlyBurnKurus)}.`}
              </p>
            </div>
          </Card>
          <Card className="pano-card" title="Deneme hakkı" extra={<Link to={`/karar/${current.n}/kapi`}>Kontrol {current.n}</Link>}>
            <div className="retry">
              <Progress type="circle" size={72} percent={retryTotal === 0 ? 0 : Math.round((retryLeft / retryTotal) * 100)} format={() => `${retryLeft} / ${retryTotal}`} strokeColor={retryLeft === 0 ? token.colorError : undefined} aria-label={`${retryLeft} deneme hakkı kaldı, toplam ${retryTotal}`} />
              <p className="helper">
                {retryLeft === 0 ? `Kontrol ${current.n} için deneme hakkı bitti. "Yeniden dene" seçilemez.` : `Kontrol ${current.n} için ${retryLeft} deneme hakkı kaldı. Her "Yeniden dene" bir hak kullanır.`}
              </p>
            </div>
          </Card>
        </div>

        <KpiStrip>
          <StatTile icon={<Flag size={20} />} label="Geçilen kontrol" value={foundationPassed} unit={`/ ${FOUNDATION_DECISIONS.length}`} note="Temelde 5 kontrol var." to={nextPath} />
          <StatTile icon={<Path size={20} />} label="Tamamlanan adım" value={doneSteps} unit={`/ ${allSteps.length}`} note={allSteps.length - doneSteps === 0 ? 'Bütün adımlar tamam.' : `${allSteps.length - doneSteps} adım kaldı.`} to={nextPath} />
          <StatTile icon={<Notebook size={20} />} label="Kanıt" value={plan.evidence.length} unit="kayıt" note={plan.evidence.length === 0 ? 'Henüz kanıt yok.' : `${observations} gözlem, ${plan.evidence.length - observations} tahmin.`} to="/kanitlar" />
          <StatTile icon={<CheckSquare size={20} />} label="Açık iş" value={openTasks.length} unit="iş" note={lateTasks.length > 0 ? `${lateTasks.length} iş gecikti.` : openTasks.length === 0 ? 'Açık iş yok.' : 'Hepsi zamanında.'} to="/isler" />
        </KpiStrip>
      </div>

      <div className="ozet-row3">
        <Card className="pano-card" title="Karar rotası" extra={<Link to={nextPath}>Sıradaki iş</Link>}>
          <Collapse
            className="route-collapse"
            ghost
            expandIconPlacement="end"
            activeKey={activeGroups}
            onChange={(keys) => setOpenGroups(Array.isArray(keys) ? keys : [keys])}
            items={routeGroups.map((g) => ({
              key: g.key,
              label: (
                <span className="route-group-head">
                  <span className="route-group-title">{g.title}</span>
                  <span className="route-group-summary">{g.summary}</span>
                </span>
              ),
              children: (
                <ol className="overview-route-list" aria-label={g.title} role="list">
                  {g.items.map((item) => (
                    <li key={item.key} data-status={item.status}>
                      <Link className="overview-route-link" to={item.to} aria-current={item.to === nextPath ? 'step' : undefined}>
                        <span className="overview-route-title">{item.title}</span>
                        <span className="overview-route-status">{item.content}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              ),
            }))}
          />
        </Card>

        <Card className="pano-card" title="Nakit akışı" extra={<Link to="/karar/5/adim/16">Adım 16</Link>}>
          {days.length === 0 ? (
            <Empty description="Ödeme günleri henüz yazılmadı.">
              <Link to="/karar/5/adim/16">Adım 16'da ödeme günlerini yazın</Link>
            </Empty>
          ) : (
            <ChartFrame frame="plain" title="Ödeme günlerinde kasada kalan" option={chartOption} table={cashFlowTable(days)} height={bp.sm ? 220 : 160} summary={`${days.length} ödeme günü. En düşük bakiye ${formatMoney(Math.min(...days.map((d) => d.balanceKurus)))}.`} />
          )}
        </Card>

        <Card className="pano-card overview-recent-card">
          <Collapse
            className="overview-recent-collapse"
            ghost
            expandIconPlacement="end"
            activeKey={recentOpen ? ['son-kararlar'] : []}
            onChange={(keys) => setRecentOpen(keys.includes('son-kararlar'))}
            items={[{
              key: 'son-kararlar',
              label: `Son kararlar (${timelineItems.length})`,
              children: (
                <>
                  {timelineItems.length === 0 ? <Empty description="Henüz karar kaydı yok. İlk kontrolde kararı kaydedince burada görünür." /> : <Timeline className="pano-timeline" items={timelineItems} />}
                  <Link className="overview-record-actions" to="/gecmis">Hepsi</Link>
                </>
              ),
            }]}
          />
        </Card>
      </div>

      <Card className="pano-card" title="Plan kayıtları" extra={<Link to="/gecmis">Geçmiş</Link>}>
        <Tabs className="pano-tabs" items={tabItems} />
      </Card>

      <Card className="pano-card" title="Sınırlar" extra={<Link to="/karar/1/adim/02">Düzenle</Link>}>
        <Descriptions className="pano-desc" bordered={false} column={{ xs: 1, sm: 2, md: 3 }} layout={bp.sm ? 'vertical' : 'horizontal'} colon={false} items={limitItems} />
        <div className="toggle-row">
          <Switch checked={plan.shortPath} onChange={(v) => update((p) => { p.shortPath = v })} id="kisa-yol" />
          <label htmlFor="kisa-yol">En kısa yol. Yalnız zorunlu adımlar görünür.</label>
        </div>
      </Card>
    </div>
  )
}
