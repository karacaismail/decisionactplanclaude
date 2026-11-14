import { Button, Card, Collapse, Descriptions, Grid, List, Progress, Steps, Table, Tag } from 'antd'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowRight, ArrowLeft, BookOpen, CheckCircle, Question, XCircle } from '@phosphor-icons/react'
import { useCurrentPlan } from '@/store/planStore'
import { decisionOf, stepsOf } from '@/data/registry'
import type { StepDef } from '@/data/schema'
import type { PlanDoc } from '@/data/types'
import { stepApplies } from '@/engine/conditions'
import { STAGES, stageOfDecision } from '@/data/stages'
import { decisionLocked, evaluateGate, gatePassed, lastDecision, lockReason, lockTarget, effectiveOutcome } from '@/engine/gate'
import { transitionPassed } from '@/engine/readiness'
import { formatDate } from '@/engine/format'
import { Callout } from '@/components/Callout'
import { DecisionBadge } from '@/components/DecisionBadge'
import { PageHeader } from '@/components/PageHeader'
import { modelByIndex } from '@/components/ModelChip'
import '@/styles/screens-karar.css'

/** "Kapı 1'e git", "Kapı 2'ye git" gibi doğru ek. */
const GATE_SUFFIX: Record<number, string> = { 1: "'e", 2: "'ye", 3: "'e", 4: "'e", 5: "'e", 6: "'ya", 7: "'ye", 8: "'e" }

type StepState = 'tamam' | 'taslak' | 'atlandi' | 'bos'

function stateOf(plan: PlanDoc, id: string): StepState {
  const s = plan.steps[id]?.status
  return s === 'tamam' || s === 'taslak' || s === 'atlandi' ? s : 'bos'
}

const STATE_LABEL: Record<StepState, string> = { tamam: 'Tamam', taslak: 'Taslak', atlandi: 'Atlandı', bos: 'Boş' }
const NEED_LABEL = { zorunlu: 'Zorunlu', kosullu: 'Koşullu', gizli: 'Gerekmez' } as const

function StateTag({ state }: { state: StepState }) {
  if (state === 'tamam') return <Tag color="success">Tamam</Tag>
  return <Tag>{STATE_LABEL[state]}</Tag>
}

function CriterionIcon({ value }: { value: boolean | null }) {
  if (value === true) return <CheckCircle size={20} weight="fill" className="karar-criterion-icon is-ok" aria-hidden />
  if (value === false) return <XCircle size={20} weight="fill" className="karar-criterion-icon is-harm" aria-hidden />
  return <Question size={20} className="karar-criterion-icon" aria-hidden />
}

const CRITERION_WORD: Record<string, string> = { true: 'Karşılandı', false: 'Karşılanmadı', null: 'Ölçülmedi' }

export function DecisionScreen() {
  const { n } = useParams()
  const nav = useNavigate()
  const plan = useCurrentPlan()
  const bp = Grid.useBreakpoint()
  const d = decisionOf(Number(n))
  if (!plan || !d) return null

  const steps = stepsOf(d.n).filter((s) => !plan.shortPath || s.shortPath)
  const locked = decisionLocked(plan, d.n)
  const reason = lockReason(plan, d.n)
  /* Karar 6 iki işe bağlıdır: geçiş kararı ve strateji çalışması. Öteki kararlar bir önceki kapıya bağlıdır. */
  const target = lockTarget(plan, d.n)
  const lockedByTransition = target === 'gecis'
  const lockedByStrategy = target === 'strateji'
  const stage = STAGES.find((x) => x.key === stageOfDecision(d.n))
  const kicker = stage ? `${stage.title} aşaması, Karar ${d.n}` : `Karar ${d.n}`
  /* Kapı 5 geçildiyse sıradaki iş geçiş kapısıdır. Geçiş kararı geçerliyse not gerekmez. */
  const transitionNext = d.n === 5 && gatePassed(plan, 5) && !transitionPassed(plan)
  const last = lastDecision(plan, d.n)
  const isDone = (id: string) => stateOf(plan, id) === 'tamam' || stateOf(plan, id) === 'atlandi'
  const visible = steps.filter((s) => stepApplies(s.mandatory, plan) !== 'gizli')
  const firstOpen = visible.find((s) => !isDone(s.id))
  const done = visible.filter((s) => isDone(s.id)).length
  const percent = visible.length ? Math.round((done / visible.length) * 100) : 0
  const evaluation = evaluateGate(d.gate, plan)
  const gatePercent = evaluation.total ? Math.round((evaluation.metCount / evaluation.total) * 100) : 0
  const methods = [...new Set(visible.flatMap((s) => s.models))].map((g) => modelByIndex(g)).filter((m): m is NonNullable<typeof m> => Boolean(m))
  const suffix = GATE_SUFFIX[d.n] ?? "'e"
  const prevSuffix = GATE_SUFFIX[d.n - 1] ?? "'e"
  const dayMin = visible.length * 2
  const dayMax = visible.length * 3
  const currentIndex = firstOpen ? visible.indexOf(firstOpen) : visible.length

  const gateButton = lockedByTransition ? (
    <Button icon={<ArrowLeft size={16} />} onClick={() => nav('/gecis')}>
      Geçiş kapısına git
    </Button>
  ) : lockedByStrategy ? (
    <Button icon={<ArrowLeft size={16} />} onClick={() => nav('/strateji')}>
      Strateji çalışmasına git
    </Button>
  ) : locked ? (
    <Button icon={<ArrowLeft size={16} />} onClick={() => nav(`/karar/${d.n - 1}/kapi`)}>
      Önceki kapıya git
    </Button>
  ) : (
    <Button type="primary" icon={<ArrowRight size={16} />} iconPlacement="end" onClick={() => nav(`/karar/${d.n}/kapi`)}>
      Kapı {d.n}
      {suffix} git
    </Button>
  )

  return (
    <div className="page page-karar">
      <PageHeader title={d.question} documentTitle={`Karar ${d.n}. ${d.title}`} kicker={kicker} description={d.intro} actions={gateButton} />

      {lockedByTransition ? (
        <Callout tone="uyari" title="Bu karar kilitli">
          {reason} Bu kararı inceleyebilirsiniz. Adımları doldurmak için önce geçiş kapısında kararı kaydedin. <Link to="/gecis">Geçiş kapısını açın.</Link>
        </Callout>
      ) : lockedByStrategy ? (
        <Callout tone="uyari" title="Bu karar kilitli">
          {reason} Bu kararı inceleyebilirsiniz. Adımları doldurmak için önce strateji çalışmasını bitirin. <Link to="/strateji">Strateji çalışmasını açın.</Link>
        </Callout>
      ) : locked ? (
        <Callout tone="uyari" title="Bu karar kilitli">
          {reason} Bu kararı inceleyebilirsiniz. Adımları doldurmak için önce Kapı {d.n - 1}
          {prevSuffix} gidin. Orada "İlerle" ya da "Koşullu ilerle" sonucu gerekir.
        </Callout>
      ) : null}

      {transitionNext ? (
        <Callout tone="bilgi" title="Kapı 5 geçildi">
          Sıradaki iş geçiş kapısıdır. <Link to="/gecis">Geçiş kapısını açın.</Link>
        </Callout>
      ) : null}

      <div className="karar-progress">
        <Progress percent={percent} format={() => `${done} / ${visible.length} adım`} strokeColor="var(--color-action-primary)" aria-label={`${done} / ${visible.length} adım tamamlandı`} />
        <span className="karar-progress-next">{firstOpen ? `Sıradaki adım ${firstOpen.id}. ${firstOpen.title}` : 'Bütün adımlar tamamlandı.'}</span>
      </div>

      <div className="karar-grid">
        <div className="karar-main">
          <Card title="Bu kararda ne var?">
            <Descriptions
              className="karar-desc"
              column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
              colon={false}
              layout="vertical"
              items={[
                { key: 'soru', label: 'Soru', children: d.question },
                { key: 'kim', label: 'Kim yapar', children: d.who },
                { key: 'sure', label: 'Süre tahmini', children: `${dayMin} ile ${dayMax} gün arası. Sınır: ${d.time}` },
                { key: 'cikti', label: 'Çıktı', children: `Kapı ${d.n}. ${d.gate.title}` },
              ]}
            />
          </Card>

          <Card title="Adımlar" extra={<span className="karar-step-count">{done} / {visible.length} tamam</span>}>
            <Steps
              className="karar-steps"
              size="small"
              orientation={bp.md ? 'horizontal' : 'vertical'}
              titlePlacement={bp.md ? 'vertical' : 'horizontal'}
              current={currentIndex}
              onChange={(i) => {
                const s = visible[i]
                if (s) nav(`/karar/${d.n}/adim/${s.id}`)
              }}
              items={visible.map((s) => {
                const st = stateOf(plan, s.id)
                return { title: `Adım ${s.id}`, content: s.title, status: st === 'tamam' || st === 'atlandi' ? 'finish' : s === firstOpen ? 'process' : 'wait' }
              })}
            />
            <Table<StepDef>
              className="karar-table"
              size="middle"
              pagination={false}
              rowKey="id"
              dataSource={steps}
              scroll={{ x: 580 }}
              rowClassName={(s) => (stepApplies(s.mandatory, plan) === 'gizli' ? 'is-muted' : '')}
              columns={[
                {
                  title: 'Adım',
                  key: 'adim',
                  render: (_, s) => (
                    <Link to={`/karar/${d.n}/adim/${s.id}`} className="karar-step-link">
                      <span className="route-dot" aria-hidden>
                        {s.id}
                      </span>
                      <span>{s.title}</span>
                    </Link>
                  ),
                },
                { title: 'Gereklilik', key: 'gerek', width: 112, render: (_, s) => <Tag>{NEED_LABEL[stepApplies(s.mandatory, plan)]}</Tag> },
                { title: 'Durum', key: 'durum', width: 100, render: (_, s) => <StateTag state={stateOf(plan, s.id)} /> },
                {
                  title: 'Son güncelleme',
                  key: 'tarih',
                  width: 136,
                  render: (_, s) => {
                    const at = plan.steps[s.id]?.updatedAt
                    return <span className="karar-date">{at ? formatDate(at, false) : 'Henüz güncellenmedi'}</span>
                  },
                },
                { title: 'Eylem', key: 'ac', width: 64, render: (_, s) => <Link to={`/karar/${d.n}/adim/${s.id}`}>Aç</Link> },
              ]}
            />
          </Card>
        </div>

        <aside className="karar-aside" aria-label="Kapı önizleme">
          <Card title="Kapı önizleme" extra={<Link to={`/karar/${d.n}/kapi`}>Kapıyı aç</Link>}>
            <div className="karar-ring">
              <Progress type="circle" percent={gatePercent} size={120} strokeColor="var(--color-status-ok)" format={() => `${evaluation.metCount} / ${evaluation.total}`} aria-label={`${evaluation.metCount} / ${evaluation.total} ölçüt karşılandı`} />
              <p className="karar-ring-note">
                {evaluation.metCount} ölçüt karşılandı. {evaluation.unknownCount > 0 ? `${evaluation.unknownCount} ölçüt henüz ölçülmedi.` : ''}
              </p>
            </div>
            <List
              className="karar-criteria"
              split={false}
              dataSource={d.gate.criteria}
              rowKey="id"
              renderItem={(c) => {
                const v = evaluation.criteria[c.id] ?? null
                return (
                  <List.Item>
                    <div className="karar-criterion">
                      <CriterionIcon value={v} />
                      <div className="karar-criterion-text">
                        <span>
                          {c.label} <span className="visually-hidden">{CRITERION_WORD[String(v)]}.</span>
                        </span>
                        {c.hint ? <span className="helper">{c.hint}</span> : null}
                      </div>
                    </div>
                  </List.Item>
                )
              }}
            />
            <Collapse className="karar-collapse" ghost items={[{ key: 'ornek', label: 'Günlük Hayattan', children: d.example }]} />
            <h3 className="karar-subhead">Yöntemler</h3>
            <div className="karar-methods">
              {methods.length === 0 ? <span className="helper">Bu kararın adımlarında yöntem yok.</span> : null}
              {methods.map((m) => (
                <Tag key={m.g}>{m.title}</Tag>
              ))}
            </div>
            <div className="karar-aside-foot">
              <Link to="/yontemler" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <BookOpen size={16} aria-hidden /> Karar Kitabı
              </Link>
              {last ? <DecisionBadge outcome={effectiveOutcome(last)} size="sm" /> : null}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
