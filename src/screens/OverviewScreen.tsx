import { useMemo } from 'react'
import { Button, Card, Descriptions, Empty, Grid, List, Progress, Statistic, Steps, Switch, Table, Tabs, Tag, Timeline, theme } from 'antd'
import { Link, useNavigate } from 'react-router'
import { ArrowRight, CheckSquare, Flag, Notebook, Path } from '@phosphor-icons/react'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { DECISIONS } from '@/data/decisions'
import { stepsOf } from '@/data/registry'
import { gatePassed, effectiveOutcome, lastDecision, retriesLeft } from '@/engine/gate'
import { stepApplies } from '@/engine/conditions'
import { DecisionBadge, outcomeColor } from '@/components/DecisionBadge'
import { PageHeader } from '@/components/PageHeader'
import { CompassArt } from '@/components/CompassArt'
import { KpiStrip, StatTile } from '@/components/StatTile'
import { ChartFrame } from '@/charts/ChartFrame'
import { cashDays, cashFlowOption, cashFlowTable } from '@/charts/overview'
import { formatDate, formatMoney } from '@/engine/format'
import { palette } from '@/theme/tokens'
import { resolveMode } from '@/theme/antdTheme'
import { OUTCOME_LABEL, type ChangeRecord, type Evidence, type PlanDoc, type Task } from '@/data/types'
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
  const days = useMemo(() => (plan ? cashDays(plan) : []), [plan])
  const chartOption = useMemo(
    () => cashFlowOption(days, { line: p.toneTeal, area: p.toneTealBg, axis: p.border, text: p.textSecondary, zero: p.statusHarm }),
    [days, p],
  )
  if (!plan) return null

  const passed = DECISIONS.filter((d) => gatePassed(plan, d.n)).map((d) => d.n)
  const openDecision = DECISIONS.find((d) => !gatePassed(plan, d.n))
  const allPassed = !openDecision
  const current = openDecision ?? DECISIONS[DECISIONS.length - 1]
  const allSteps = DECISIONS.flatMap((d) => visibleSteps(plan, d.n))
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
  const routeIndex = allPassed ? DECISIONS.length - 1 : current.n - 1

  const routeItems = DECISIONS.map((d) => {
    const isPassed = passed.includes(d.n)
    const isCurrent = !allPassed && d.n === current.n
    const locked = d.n > 1 && !gatePassed(plan, d.n - 1)
    const steps = visibleSteps(plan, d.n)
    const done = steps.filter((s) => isDone(plan, s)).length
    const last = lastDecision(plan, d.n)
    const state = isPassed && last ? OUTCOME_LABEL[effectiveOutcome(last)] : isCurrent ? 'Açık' : locked ? 'Kilitli' : 'Bekliyor'
    return {
      key: d.n,
      title: `${two(d.n)} ${d.title}`,
      content: `${done} / ${steps.length} adım, ${state}`,
      status: (isPassed ? 'finish' : isCurrent ? 'process' : 'wait') as 'finish' | 'process' | 'wait',
    }
  })

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

      <div className="ozet-top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="signal" aria-hidden />
              <span>{allPassed ? 'Son karar geçildi' : 'Açık karar'}</span>
              <span className="count">
                {two(current.n)} / {two(DECISIONS.length)}
              </span>
            </div>
            <h2 id="hero-title">{current.title}</h2>
            <p className="hero-question">{current.question}</p>
            <div className="hero-actions">
              <Button type="primary" className="hero-button" icon={<ArrowRight size={16} />} iconPlacement="end" onClick={() => nav(resumeTo ?? `/karar/${current.n}`)}>
                {resumeTo ? 'Kaldığım yerden devam et' : 'Kararı incele'}
              </Button>
            </div>
          </div>
          <div className="hero-art">
            <CompassArt active={current.n} passed={passed} />
          </div>
        </section>

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
          <StatTile icon={<Flag size={20} />} label="Geçilen kapı" value={passed.length} unit="/ 8" note={allPassed ? 'Bütün kapılar geçildi.' : `Sıradaki kapı ${current.n}.`} to={`/karar/${current.n}`} />
          <StatTile icon={<Path size={20} />} label="Tamamlanan adım" value={doneSteps} unit={`/ ${allSteps.length}`} note={allSteps.length - doneSteps === 0 ? 'Bütün adımlar tamam.' : `${allSteps.length - doneSteps} adım kaldı.`} to={`/karar/${current.n}`} />
          <StatTile icon={<Notebook size={20} />} label="Kanıt" value={plan.evidence.length} unit="kayıt" note={plan.evidence.length === 0 ? 'Henüz kanıt yok.' : `${observations} gözlem, ${plan.evidence.length - observations} tahmin.`} to="/kanitlar" />
          <StatTile icon={<CheckSquare size={20} />} label="Açık iş" value={openTasks.length} unit="iş" note={lateTasks.length > 0 ? `${lateTasks.length} iş gecikti.` : openTasks.length === 0 ? 'Açık iş yok.' : 'Hepsi zamanında.'} to="/isler" />
        </KpiStrip>
      </div>

      <div className="ozet-row3">
        <Card className="pano-card" title="Karar rotası" extra={<Link to={`/karar/${current.n}`}>Açık karar</Link>}>
          <Steps className="pano-steps" type="dot" orientation="vertical" current={routeIndex} items={routeItems} onChange={(i) => nav(`/karar/${DECISIONS[i].n}`)} />
        </Card>

        <Card className="pano-card" title="Nakit akışı" extra={<Link to="/karar/5/adim/16">Adım 16</Link>}>
          {days.length === 0 ? (
            <Empty description="Ödeme günleri henüz yazılmadı.">
              <Link to="/karar/5/adim/16">Adım 16'da ödeme günlerini yazın</Link>
            </Empty>
          ) : (
            <ChartFrame title="Ödeme günlerinde kasada kalan" option={chartOption} table={cashFlowTable(days)} height={220} summary={`${days.length} ödeme günü. En düşük bakiye ${formatMoney(Math.min(...days.map((d) => d.balanceKurus)))}.`} />
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
