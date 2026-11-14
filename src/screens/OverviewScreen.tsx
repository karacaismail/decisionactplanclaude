import { useMemo, useState } from 'react'
import { Button, Card, Collapse, Descriptions, Empty, Grid, List, Progress, Statistic, Steps, Switch, Table, Tabs, Tag, Timeline, theme } from 'antd'
import { Link, useNavigate } from 'react-router'
import { ArrowRight, CheckSquare, Flag, Notebook, Path } from '@phosphor-icons/react'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { DECISIONS, STRATEGY, STRATEGY_N } from '@/data/decisions'
import { stepsOf } from '@/data/registry'
import { EXECUTION_DECISIONS, FOUNDATION_DECISIONS, STAGES, type StageKey } from '@/data/stages'
import { decisionLocked, gatePassed, effectiveOutcome, lastDecision, retriesLeft } from '@/engine/gate'
import { LEVELS, effectiveTransition, lastTransition, transitionPassed, validationLevel } from '@/engine/readiness'
import { stepApplies } from '@/engine/conditions'
import { Callout } from '@/components/Callout'
import { DecisionBadge, outcomeColor } from '@/components/DecisionBadge'
import { PageHeader } from '@/components/PageHeader'
import { KpiStrip, StatTile } from '@/components/StatTile'
import { ChartFrame } from '@/charts/ChartFrame'
import { cashDays, cashFlowOption, cashFlowTable } from '@/charts/overview'
import { formatDate, formatMoney } from '@/engine/format'
import { palette } from '@/theme/tokens'
import { resolveMode } from '@/theme/antdTheme'
import { OUTCOME_LABEL, TRANSITION_LABEL, type ChangeRecord, type Evidence, type PlanDoc, type Task } from '@/data/types'
import type { StepDef } from '@/data/schema'
import '@/styles/screens-pano.css'
import '@/styles/screens-form.css'

const two = (n: number) => String(n).padStart(2, '0')
const today = () => new Date().toISOString().slice(0, 10)

function visibleSteps(plan: PlanDoc, n: number): StepDef[] {
  return stepsOf(n).filter((s) => stepApplies(s.mandatory, plan) !== 'gizli' && (!plan.shortPath || s.shortPath))
}

function isDone(plan: PlanDoc, s: StepDef): boolean {
  const st = plan.steps[s.id]?.status
  return st === 'tamam' || st === 'atlandi'
}

export interface PlanPosition {
  /** Sıradaki işin bölümü. Bütün kapılar geçildiyse 'bitti'. */
  stage: StageKey | 'bitti'
  /** Sıradaki iş bir kararsa numarası. */
  decision?: number
  /** Doğrulama seviyesi, 0 ile 5 arası. */
  level: number
  strategyDone: number
  strategyTotal: number
}

/**
 * Planın yol üzerindeki yeri. Sıra: temel kapıları, geçiş kapısı, strateji çalışması, uygulama kapıları.
 * Plan özeti ve planlar ekranı aynı kuralı kullanır.
 */
export function planPosition(plan: PlanDoc): PlanPosition {
  const strategy = visibleSteps(plan, STRATEGY_N)
  const strategyDone = strategy.filter((s) => isDone(plan, s)).length
  const base = { level: validationLevel(plan), strategyDone, strategyTotal: strategy.length }
  const openFoundation = FOUNDATION_DECISIONS.find((n) => !gatePassed(plan, n))
  if (openFoundation) return { ...base, stage: 'temel', decision: openFoundation }
  if (!transitionPassed(plan)) return { ...base, stage: 'gecis' }
  if (strategyDone < strategy.length) return { ...base, stage: 'strateji' }
  const openExecution = EXECUTION_DECISIONS.find((n) => !gatePassed(plan, n))
  if (openExecution) return { ...base, stage: 'uygulama', decision: openExecution }
  return { ...base, stage: 'bitti' }
}

/** Geçiş kapısının durumu tek cümlede. Karar yoksa "Karar yok". */
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

/* Telefonda gerekçenin yalnız ilk cümlesi durur. Tam metin "Geçmiş" ekranındadır. */
const firstSentence = (text: string): string => {
  const m = /^[^.!?]*[.!?]/.exec(text.trim())
  return m ? m[0] : text
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
  const themePref = usePlanStore((s) => s.theme)
  const { token } = theme.useToken()
  const bp = Grid.useBreakpoint()
  const mode = resolveMode(themePref)
  const p = palette(mode)
  /* Kullanıcı bir rota grubunu açıp kapatınca seçim burada durur. Boşken varsayılan kullanılır. */
  const [openGroups, setOpenGroups] = useState<string[] | null>(null)
  const days = useMemo(() => (plan ? cashDays(plan) : []), [plan])
  const chartOption = useMemo(
    () => cashFlowOption(days, { line: p.toneTeal, area: p.toneTealBg, axis: p.border, text: p.textSecondary, zero: p.statusHarm }),
    [days, p],
  )
  if (!plan) return null

  const position = planPosition(plan)
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
  const recent = [...plan.decisions].slice(bp.sm ? -3 : -2).reverse()
  const recentEvidence = [...plan.evidence].sort((a, b) => (b.date ?? b.createdAt).localeCompare(a.date ?? a.createdAt)).slice(0, 5)
  const changes = [...(plan.changes ?? [])].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6)
  const resumeTo = plan.lastLocation && plan.lastLocation !== '/ozet' ? plan.lastLocation : null
  const { budgetKurus, deadline, retriesPerDecision, monthlyBurnKurus, cashKurus, hoursPerWeek } = plan.limits
  const runway = monthlyBurnKurus && cashKurus ? Math.floor(cashKurus / monthlyBurnKurus) : null
  const runwayPercent = runway === null ? 0 : Math.min(100, Math.round((runway / 12) * 100))
  const retryMax = current.gate.maxRetries
  const retryTotal = Math.min(retriesPerDecision ?? retryMax, retryMax)
  const retryLeft = retriesLeft(plan, current.n, retryMax)

  /* Hero sıradaki işi gösterir. Sıra: temel kararı, geçiş kapısı, strateji çalışması, uygulama kararı. */
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
      ? { kicker: 'Sıradaki iş', count: '', title: 'Geçiş kapısı', text: 'Dayanak yeterli mi? Kararı kaydedin.', long: false, button: 'Geçiş kapısını aç', to: '/gecis' }
      : position.stage === 'strateji'
        ? { kicker: 'Sıradaki iş', count: '', title: STRATEGY.title, text: 'Sahayı, kazanma yolunu ve 90 günlük yolu seçin.', long: false, button: 'Strateji çalışmasını aç', to: '/strateji' }
        : position.stage === 'bitti'
          ? decisionTask('Son karar geçildi', 'uygulama')
          : decisionTask('Açık karar', position.stage)
  /* Bağlantıların hedefi sıradaki iştir. "Kaldığım yer" yalnız hero düğmesindedir. */
  const nextPath = position.stage === 'gecis' ? '/gecis' : position.stage === 'strateji' ? '/strateji' : `/karar/${current.n}`

  /* Yol: dört bölüm. Her bölüm kendi ekranına gider. */
  const stageState: Record<StageKey, { text: string; status: StepStatus }> = {
    temel: { text: `${foundationPassed} / ${FOUNDATION_DECISIONS.length} kapı`, status: foundationDone ? 'finish' : 'process' },
    gecis: { text: gecisText, status: transitionOk ? 'finish' : position.stage === 'gecis' ? 'process' : 'wait' },
    strateji: { text: `${strategyDone} / ${strategyTotal} adım`, status: !transitionOk ? 'wait' : strategyDone === strategyTotal ? 'finish' : 'process' },
    uygulama: {
      text: decisionLocked(plan, EXECUTION_DECISIONS[0]) ? 'Kilitli' : executionPassed === EXECUTION_DECISIONS.length ? 'Tamamlandı' : 'Açık',
      status: executionPassed === EXECUTION_DECISIONS.length ? 'finish' : position.stage === 'uygulama' ? 'process' : 'wait',
    },
  }
  const stageItems = STAGES.map((st) => {
    const state = stageState[st.key]
    /* Yatayda durum başlığın altında, dikeyde başlığın yanında durur. Böylece telefonda satır kısa kalır. */
    return bp.md ? { key: st.key, title: st.title, content: state.text, status: state.status } : { key: st.key, title: st.title, subTitle: state.text, status: state.status }
  })

  /* Karar rotası: üç grup. Kilit tek kuraldan gelir (decisionLocked). */
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
  const routeGroups = [
    { key: 'temel', title: 'Temel', summary: stageState.temel.text, items: FOUNDATION_DECISIONS.map(decisionRoute) },
    {
      key: 'gecis',
      title: 'Geçiş',
      summary: gecisText,
      items: [
        { key: 'gecis-kapisi', title: 'Geçiş kapısı', content: gecisText, status: stageState.gecis.status, to: '/gecis' },
        { key: 'strateji', title: STRATEGY.title, content: `${strategyDone} / ${strategyTotal} adım, ${strategyLocked ? 'Kilitli' : strategyDone === strategyTotal ? 'Tamam' : 'Açık'}`, status: stageState.strateji.status, to: '/strateji' },
      ],
    },
    { key: 'uygulama', title: 'Uygulama', summary: stageState.uygulama.text, items: EXECUTION_DECISIONS.map(decisionRoute) },
  ]
  /* Telefonda yalnız sıradaki işin grubu açık başlar. Geniş ekranda üç grup da açıktır. */
  const currentGroup = position.stage === 'temel' ? 'temel' : position.stage === 'gecis' || position.stage === 'strateji' ? 'gecis' : 'uygulama'
  const activeGroups = openGroups ?? (bp.md ? routeGroups.map((g) => g.key) : [currentGroup])

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
              Kapı {d.gate}. {def?.title ?? ''}
            </span>
            <DecisionBadge outcome={outcome} />
          </span>
          <span className="helper">{formatDate(d.decidedAt)}</span>
          {d.stale ? <Tag color="warning">İnceleme bekliyor</Tag> : null}
          {d.reason ? <span className="tl-reason">{bp.sm ? d.reason : firstSentence(d.reason)}</span> : null}
        </span>
      ),
    }
  })

  const taskColumns = [
    { title: 'İş', dataIndex: 'action', key: 'action', width: 320, render: (v: string) => <span className="cell-wrap">{v}</span> },
    { title: 'Sorumlu', dataIndex: 'owner', key: 'owner', width: 140, render: (v?: string) => v || 'Yazılmadı' },
    { title: 'Tarih', dataIndex: 'dueDate', key: 'dueDate', width: 180, render: (v?: string) => (v ? formatDate(v, false) : 'Tarih yok') },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (s: Task['status'], t: Task) => {
        const late = (s === 'acik' || s === 'taslak') && t.dueDate && t.dueDate.slice(0, 10) < today()
        return <Tag color={late ? 'error' : TASK_TAG[s].color}>{late ? 'Gecikti' : TASK_TAG[s].label}</Tag>
      },
    },
  ]
  const evidenceColumns = [
    { title: 'Kanıt', dataIndex: 'title', key: 'title', width: 320, render: (v: string) => <span className="cell-wrap">{v}</span> },
    { title: 'Tür', dataIndex: 'kind', key: 'kind', width: 120, render: (k: Evidence['kind']) => <Tag color={KIND_TAG[k].color}>{KIND_TAG[k].label}</Tag> },
    { title: 'Basamak', dataIndex: 'ladder', key: 'ladder', width: 110, render: (n: number) => <span className="tabular">{n}. basamak</span> },
    { title: 'Tarih', dataIndex: 'date', key: 'date', width: 180, render: (v: string | undefined, e: Evidence) => formatDate(v ?? e.createdAt, false) },
  ]

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
          <Table<Task> size="middle" rowKey="id" pagination={false} dataSource={openTasks} columns={taskColumns} scroll={{ x: 'max-content' }} />
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
          <Table<Evidence> size="middle" rowKey="id" pagination={false} dataSource={recentEvidence} columns={evidenceColumns} scroll={{ x: 'max-content' }} />
        ),
    },
    {
      key: 'degisiklik',
      label: `Değişiklik kaydı (${(plan.changes ?? []).length})`,
      children:
        changes.length === 0 ? (
          <Empty description="Sınır ve eşik değişikliği yok." />
        ) : (
          <List<ChangeRecord>
            dataSource={changes}
            renderItem={(c) => (
              <List.Item key={c.id}>
                <div className="change-row">
                  <span className="change-head">
                    <strong>{c.label}</strong>
                    {c.needsReview && !c.reviewer ? <Tag color="warning">İkinci görüş bekliyor</Tag> : null}
                  </span>
                  <span className="helper">
                    {show(c.before)} yerine {show(c.after)}. {formatDate(c.at, false)}.
                  </span>
                </div>
              </List.Item>
            )}
          />
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
    <div className="page ozet">
      <PageHeader
        title={plan.name}
        documentTitle="Plan özeti"
        kicker="Plan özeti"
        description={<>Son değişiklik {formatDate(plan.updatedAt)}. Sürüm {plan.revision}.</>}
      />

      {transitionExpired ? (
        <Callout tone="uyari" danger title="Koşullu geçiş kararının süresi doldu">
          Açık soru son tarihe kadar kapanmadı. Strateji çalışması yeniden kilitlendi. <Link to="/gecis">Geçiş kapısında yeni karar kaydedin.</Link>
        </Callout>
      ) : null}
      {transitionStale ? (
        <Callout tone="uyari" title="Geçiş kararı inceleme bekliyor">
          Temel verisi değişti. Geçiş kararı yeniden inceleme ister. <Link to="/gecis">Geçiş kapısını açın.</Link>
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
              aria-label={`Doğrulama seviyesi ${level} / 5. ${LEVELS[level].title}.`}
            />
            <div className="hero-level-text">
              <span className="hero-level-label">Doğrulama seviyesi</span>
              <span className="hero-level-name">{LEVELS[level].title}</span>
            </div>
          </div>
        </section>

        <Card className="pano-card yol-card" title="Yol" extra={<Link to="/temel">Temel taşları</Link>}>
          <Steps
            className="pano-steps yol-steps"
            size="small"
            orientation={bp.md ? 'horizontal' : 'vertical'}
            current={-1}
            items={stageItems}
            onChange={(i) => nav(STAGES[i].path)}
          />
        </Card>

        <div className="ozet-side">
          <Card className="pano-card" title="Pist" extra={<Link to="/karar/1/adim/02">Sınırlar</Link>}>
            <div className="pist">
              <Statistic value={runway ?? 'Hesaplanmadı'} suffix={runway !== null ? 'ay' : undefined} />
              <Progress percent={runwayPercent} showInfo={false} strokeColor={runway !== null && runway < 6 ? token.colorError : undefined} aria-label={`Pist ${runway ?? 0} ay, 12 ayın yüzde ${runwayPercent}'i`} />
              <p className="helper">
                {runway === null ? 'Kasadaki parayı ve aylık gideri sınırlarda yazın.' : `Kasadaki para ${formatMoney(cashKurus)}. Aylık gider ${formatMoney(monthlyBurnKurus)}.`}
              </p>
            </div>
          </Card>
          <Card className="pano-card" title="Deneme hakkı" extra={<Link to={`/karar/${current.n}/kapi`}>Kapı {current.n}</Link>}>
            <div className="retry">
              <Progress type="circle" size={72} percent={retryTotal === 0 ? 0 : Math.round((retryLeft / retryTotal) * 100)} format={() => `${retryLeft} / ${retryTotal}`} strokeColor={retryLeft === 0 ? token.colorError : undefined} aria-label={`${retryLeft} deneme hakkı kaldı, toplam ${retryTotal}`} />
              <p className="helper">
                {retryLeft === 0 ? `Kapı ${current.n} için deneme hakkı bitti. "Yeniden dene" seçilemez.` : `Kapı ${current.n} için ${retryLeft} deneme hakkı kaldı. Her "Yeniden dene" bir hak kullanır.`}
              </p>
            </div>
          </Card>
        </div>

        <KpiStrip>
          <StatTile icon={<Flag size={20} />} label="Geçilen kapı" value={foundationPassed} unit={`/ ${FOUNDATION_DECISIONS.length}`} note="Temelde 5 kapı var." to={nextPath} />
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
              children: <Steps className="pano-steps" type="dot" orientation="vertical" current={-1} items={g.items.map(({ to: _to, ...item }) => item)} onChange={(i) => nav(g.items[i].to)} />,
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

        <Card className="pano-card" title="Son kararlar" extra={<Link to="/gecmis">Hepsi</Link>}>
          {timelineItems.length === 0 ? <Empty description="Henüz karar kaydı yok. İlk kapıda kararı kaydedince burada görünür." /> : <Timeline className="pano-timeline" items={timelineItems} />}
        </Card>
      </div>

      <Card className="pano-card" title="Plan kayıtları" extra={<Link to="/gecmis">Geçmiş</Link>}>
        <Tabs className="pano-tabs" items={tabItems} />
      </Card>

      <Card className="pano-card" title="Sınırlar" extra={<Link to="/karar/1/adim/02">Düzenle</Link>}>
        <Descriptions className="pano-desc" bordered={false} column={{ xs: 1, sm: 2, md: 3 }} layout={bp.sm ? 'vertical' : 'horizontal'} colon={false} items={limitItems} />
        <div className="toggle-row">
          <Switch checked={plan.shortPath} onChange={(v) => update((p) => (p.shortPath = v))} id="kisa-yol" />
          <label htmlFor="kisa-yol">En kısa yol. Yalnız zorunlu adımlar görünür.</label>
        </div>
      </Card>
    </div>
  )
}
