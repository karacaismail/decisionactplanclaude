import { Button, Switch } from 'antd'
import { Link, useNavigate } from 'react-router'
import { ArrowRight, ArrowUpRight, BookOpenText, CheckSquare, FileText, Gauge, Notebook, Path } from '@phosphor-icons/react'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { DECISIONS } from '@/data/decisions'
import { stepsOf } from '@/data/registry'
import { gatePassed, effectiveOutcome } from '@/engine/gate'
import { stepApplies } from '@/engine/conditions'
import { DecisionBadge } from '@/components/DecisionBadge'
import { PageHeader, SectionHead } from '@/components/PageHeader'
import { CompassArt } from '@/components/CompassArt'
import { KpiStrip, StatTile } from '@/components/StatTile'
import { formatDate, formatMoney } from '@/engine/format'
import type { PlanDoc } from '@/data/types'
import type { StepDef } from '@/data/schema'
import '@/styles/screens-pano.css'

const two = (n: number) => String(n).padStart(2, '0')

function visibleSteps(plan: PlanDoc, n: number): StepDef[] {
  return stepsOf(n).filter((s) => stepApplies(s.mandatory, plan) !== 'gizli' && (!plan.shortPath || s.shortPath))
}

function isDone(plan: PlanDoc, s: StepDef): boolean {
  const st = plan.steps[s.id]?.status
  return st === 'tamam' || st === 'atlandi'
}

export function OverviewScreen() {
  const nav = useNavigate()
  const plan = useCurrentPlan()
  const update = usePlanStore((s) => s.update)
  if (!plan) return null

  const passed = DECISIONS.filter((d) => gatePassed(plan, d.n)).map((d) => d.n)
  const openDecision = DECISIONS.find((d) => !gatePassed(plan, d.n))
  const allPassed = !openDecision
  const current = openDecision ?? DECISIONS[DECISIONS.length - 1]
  const allSteps = DECISIONS.flatMap((d) => visibleSteps(plan, d.n))
  const doneSteps = allSteps.filter((s) => isDone(plan, s)).length
  const openTasks = plan.tasks.filter((t) => t.status === 'acik' || t.status === 'taslak')
  const recent = [...plan.decisions].slice(-3).reverse()
  const resumeTo = plan.lastLocation && plan.lastLocation !== '/ozet' ? plan.lastLocation : null
  const { budgetKurus, deadline, retriesPerDecision, monthlyBurnKurus, cashKurus } = plan.limits
  const runway = monthlyBurnKurus && cashKurus ? Math.floor(cashKurus / monthlyBurnKurus) : null
  /* Pist KPI şeridinde durur; meta satırı üç sınırla tek satıra sığar. */
  const limits = [
    { label: 'Toplam harcama sınırı', value: budgetKurus ? formatMoney(budgetKurus) : 'Yazılmadı' },
    { label: 'Bitiş tarihi', value: deadline ? formatDate(deadline, false) : 'Yazılmadı' },
    { label: 'Kalan deneme hakkı', value: retriesPerDecision ? `${retriesPerDecision} / karar` : 'Yazılmadı' },
  ]

  return (
    <div className="page">
      <PageHeader
        title={plan.name}
        documentTitle="Plan özeti"
        kicker="Plan özeti"
        description={<>Son değişiklik {formatDate(plan.updatedAt)}. Sürüm {plan.revision}.</>}
      />

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

      <KpiStrip>
        <StatTile icon={<Gauge size={16} />} label="Pist" value={runway !== null ? runway : 'Hesaplanmadı'} unit={runway !== null ? 'ay' : undefined} />
        <StatTile icon={<Path size={16} />} label="Tamamlanan adım" value={doneSteps} unit={`/ ${allSteps.length}`} to={`/karar/${current.n}`} />
        <StatTile icon={<Notebook size={16} />} label="Kanıt" value={plan.evidence.length} unit="kayıt" to="/kanitlar" />
        <StatTile icon={<CheckSquare size={16} />} label="Açık iş" value={openTasks.length} unit="iş" to="/isler" />
      </KpiStrip>

      <div className="meta-stack">
        <div className="limits-line" role="group" aria-label="Sınırlar">
          {limits.map((i) => (
            <span key={i.label}>
              {i.label}: <strong>{i.value}</strong>
            </span>
          ))}
        </div>
        <div className="toggle-row">
          <Switch checked={plan.shortPath} onChange={(v) => update((p) => (p.shortPath = v))} id="kisa-yol" />
          <label htmlFor="kisa-yol">En kısa yol. Yalnız zorunlu adımlar görünür.</label>
        </div>
      </div>

      <div className="dash-grid">
        <section className="section" aria-labelledby="rota-title">
          <div className="section-head">
            <h2 id="rota-title">Karar rotası</h2>
            <p>Kararları sırayla inceleyin. Her kapı bir öncekine bağlıdır.</p>
          </div>
          <ol className="route-list">
            {DECISIONS.map((d) => {
              const isPassed = passed.includes(d.n)
              const isCurrent = !allPassed && d.n === current.n
              const locked = d.n > 1 && !gatePassed(plan, d.n - 1)
              const steps = visibleSteps(plan, d.n)
              const done = steps.filter((s) => isDone(plan, s)).length
              const cls = ['route-item', isPassed ? 'is-passed' : '', isCurrent ? 'is-current' : '', locked && !isPassed ? 'is-locked' : ''].filter(Boolean).join(' ')
              const state = isPassed ? 'Geçti' : isCurrent ? 'Açık' : locked ? 'Kilitli' : 'Bekliyor'
              const tagCls = isPassed ? 'tag is-ok' : isCurrent ? 'tag is-open' : 'tag'
              return (
                <li key={d.n}>
                  <button type="button" className={cls} onClick={() => nav(`/karar/${d.n}`)} aria-label={`Karar ${d.n}. ${d.title}. ${state}. ${done} / ${steps.length} adım.`}>
                    <span className="route-dot" aria-hidden>
                      {two(d.n)}
                    </span>
                    <span className="route-text">
                      <span className="route-title">{d.title}</span>
                      <span className="route-sub tabular">
                        {done} / {steps.length} adım
                      </span>
                    </span>
                    <span className={tagCls} aria-hidden>
                      {state}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </section>

        <div className="aside-stack">
          <section className="section" aria-labelledby="son-kararlar">
            <SectionHead title="Son kararlar" description="En son kaydedilen üç kapı kararı." actions={<Link to="/gecmis">Hepsi</Link>} />
            {recent.length === 0 ? (
              <p className="helper" style={{ margin: 0 }}>
                Henüz karar kaydı yok. İlk kapıda kararı kaydedince burada görünür.
              </p>
            ) : (
              <ul className="recent-list">
                {recent.map((d) => {
                  const def = DECISIONS[d.gate - 1]
                  return (
                    <li key={d.id} className="recent-item">
                      <div className="recent-head">
                        <span className="recent-title">
                          Kapı {d.gate}. {def?.title ?? ''}
                        </span>
                        <DecisionBadge outcome={effectiveOutcome(d)} size="sm" />
                      </div>
                      <span className="recent-date">{formatDate(d.decidedAt)}</span>
                      {d.stale ? <span className="tag is-hold">İnceleme bekliyor</span> : null}
                      {d.reason ? <span className="recent-reason">{d.reason}</span> : null}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section className="section" aria-labelledby="kisayollar">
            <SectionHead title="Kısayollar" description="Sık kullanılan ekranlar." />
            <div className="shortcut-list">
              <Link className="shortcut" to="/ciktilar">
                <FileText size={16} aria-hidden />
                <span>
                  <strong>Raporlar</strong>
                  <small>Yönetici raporu ve aksiyon planı.</small>
                </span>
                <ArrowUpRight size={16} aria-hidden />
              </Link>
              <Link className="shortcut" to="/yontemler">
                <BookOpenText size={16} aria-hidden />
                <span>
                  <strong>Karar Kitabı</strong>
                  <small>Yöntemlerin kısa açıklaması.</small>
                </span>
                <ArrowUpRight size={16} aria-hidden />
              </Link>
              <Link className="shortcut" to="/isler">
                <CheckSquare size={16} aria-hidden />
                <span>
                  <strong>Açık işler</strong>
                  <small>{openTasks.length === 0 ? 'Açık iş yok.' : `${openTasks.length} iş bekliyor.`}</small>
                </span>
                <ArrowUpRight size={16} aria-hidden />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
