import { Button, Switch, Tag } from 'antd'
import { Link, useNavigate } from 'react-router'
import { ArrowRight, ArrowUpRight, BookOpenText, Check, CheckSquare, FileText, Flag, Lock, MapTrifold, Notebook, Path } from '@phosphor-icons/react'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { DECISIONS } from '@/data/decisions'
import { stepsOf } from '@/data/registry'
import { gatePassed, lastDecision, effectiveOutcome } from '@/engine/gate'
import { stepApplies } from '@/engine/conditions'
import { LimitsBar } from '@/components/LimitsBar'
import { DecisionBadge } from '@/components/DecisionBadge'
import { PageHeader } from '@/components/PageHeader'
import { CompassArt } from '@/components/CompassArt'
import { StatTile } from '@/components/StatTile'
import { formatDate } from '@/engine/format'
import type { PlanDoc } from '@/data/types'
import type { StepDef } from '@/data/schema'

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
            <span className="divider" aria-hidden />
            <span className="count tabular">{two(current.n)} / {two(DECISIONS.length)}</span>
          </div>
          <h1 id="hero-title">{current.title}</h1>
          <p>{current.question}</p>
          <div className="hero-actions">
            <Button className="hero-button" size="large" icon={<ArrowRight size={20} />} iconPlacement="end" onClick={() => nav(`/karar/${current.n}`)}>
              Kararı incele
            </Button>
            {plan.lastLocation && plan.lastLocation !== '/ozet' ? (
              <Button className="hero-ghost" size="large" onClick={() => nav(plan.lastLocation!)}>
                Kaldığım yerden devam et
              </Button>
            ) : null}
          </div>
          <div className="hero-meta">
            <span><strong>{passed.length}</strong> karar geçti</span>
            <span><strong>{doneSteps}</strong> adım tamamlandı</span>
            <span>Süre: <strong>{current.time}</strong></span>
          </div>
        </div>
        <div className="hero-art">
          <CompassArt active={current.n} passed={passed} />
        </div>
      </section>

      <LimitsBar plan={plan} />

      <div className="toggle-row">
        <Switch checked={plan.shortPath} onChange={(v) => update((p) => (p.shortPath = v))} id="kisa-yol" />
        <label htmlFor="kisa-yol">En kısa yol. Yalnız zorunlu adımlar görünür. Kapılar yine uygulanır.</label>
      </div>

      <div className="stat-grid">
        <StatTile tone="orange" icon={<Flag size={22} weight="fill" />} label="Onaylanan karar" value={passed.length} unit={`/ ${DECISIONS.length}`} note="Kapıdan geçen karar sayısı" to={`/karar/${current.n}`} />
        <StatTile tone="teal" icon={<Path size={22} />} label="Tamamlanan adım" value={doneSteps} unit={`/ ${allSteps.length}`} note="Bu profilde görünen adımlar" to={`/karar/${current.n}`} />
        <StatTile tone="purple" icon={<Notebook size={22} />} label="Kanıt kaydı" value={plan.evidence.length} unit="kayıt" note="Kaynağı yazılan kanıt" to="/kanitlar" />
        <StatTile tone="navy" icon={<CheckSquare size={22} />} label="Açık iş" value={openTasks.length} unit="iş" note="Henüz bitmeyen iş" to="/isler" />
      </div>

      <div className="dash-grid">
        <section className="panel" aria-labelledby="rota-title">
          <div className="section-head">
            <div>
              <h2 id="rota-title">Karar rotası</h2>
              <p>Kararları sırayla inceleyin. Her kapı bir öncekine bağlıdır.</p>
            </div>
            <span className="icon-tile teal" aria-hidden><MapTrifold size={22} /></span>
          </div>
          <ol className="route-list">
            {DECISIONS.map((d) => {
              const isPassed = passed.includes(d.n)
              const isCurrent = !allPassed && d.n === current.n
              const locked = d.n > 1 && !gatePassed(plan, d.n - 1)
              const steps = visibleSteps(plan, d.n)
              const done = steps.filter((s) => isDone(plan, s)).length
              const last = lastDecision(plan, d.n)
              const cls = ['route-item', isPassed ? 'is-passed' : '', isCurrent ? 'is-current' : '', locked && !isPassed ? 'is-locked' : ''].filter(Boolean).join(' ')
              const state = isPassed ? 'Geçti' : isCurrent ? 'Açık' : locked ? 'Kilitli' : 'Bekliyor'
              return (
                <li key={d.n}>
                  <button type="button" className={cls} onClick={() => nav(`/karar/${d.n}`)} aria-label={`Karar ${d.n}. ${d.title}. ${state}.`}>
                    <span className="route-dot" aria-hidden>
                      {isPassed ? <Check size={18} weight="bold" /> : locked ? <Lock size={16} /> : two(d.n)}
                    </span>
                    <span className="route-text">
                      <span className="route-title">
                        {d.title}
                        <span className="route-state">{state}</span>
                      </span>
                      <span className="route-sub tabular" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                        <span>{done} / {steps.length} adım</span>
                        {last ? <DecisionBadge outcome={effectiveOutcome(last)} size="sm" /> : null}
                      </span>
                    </span>
                    <span className="route-arrow" aria-hidden><ArrowUpRight size={18} /></span>
                  </button>
                </li>
              )
            })}
          </ol>
        </section>

        <div className="aside-stack">
          <section className="panel" aria-labelledby="son-kararlar">
            <div className="section-head">
              <div>
                <h2 id="son-kararlar">Son kararlar</h2>
                <p>En son kaydedilen üç kapı kararı.</p>
              </div>
              <Link to="/gecmis">Hepsi</Link>
            </div>
            {recent.length === 0 ? (
              <p style={{ margin: 0, fontSize: 16, color: 'var(--color-text-secondary)' }}>Henüz karar kaydı yok. İlk kapıda kararı kaydedince burada görünür.</p>
            ) : (
              <ul className="recent-list">
                {recent.map((d) => {
                  const def = DECISIONS[d.gate - 1]
                  return (
                    <li key={d.id} className="recent-item">
                      <div className="recent-head">
                        <span className="recent-title">Kapı {d.gate}. {def?.title ?? ''}</span>
                        <DecisionBadge outcome={effectiveOutcome(d)} size="sm" />
                      </div>
                      <span className="recent-date">{formatDate(d.decidedAt)}</span>
                      {d.stale ? <Tag color="warning" style={{ fontSize: 14, margin: 0, width: 'fit-content' }}>İnceleme bekliyor</Tag> : null}
                      {d.reason ? <span className="recent-reason">{d.reason}</span> : null}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section className="panel" aria-labelledby="kisayollar">
            <div className="section-head">
              <div>
                <h2 id="kisayollar">Kısayollar</h2>
                <p>Sık kullanılan ekranlar.</p>
              </div>
            </div>
            <div className="shortcut-list">
              <Link className="shortcut" to="/ciktilar">
                <span className="icon-tile orange" aria-hidden><FileText size={22} /></span>
                <span><strong>Raporlar</strong><small>Yönetici raporu ve aksiyon planı.</small></span>
                <ArrowUpRight size={18} aria-hidden />
              </Link>
              <Link className="shortcut" to="/yontemler">
                <span className="icon-tile purple" aria-hidden><BookOpenText size={22} /></span>
                <span><strong>Karar Kitabı</strong><small>Yöntemlerin kısa açıklaması.</small></span>
                <ArrowUpRight size={18} aria-hidden />
              </Link>
              <Link className="shortcut" to="/isler">
                <span className="icon-tile navy" aria-hidden><CheckSquare size={22} /></span>
                <span><strong>Açık işler</strong><small>{openTasks.length === 0 ? 'Açık iş yok.' : `${openTasks.length} iş bekliyor.`}</small></span>
                <ArrowUpRight size={18} aria-hidden />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
