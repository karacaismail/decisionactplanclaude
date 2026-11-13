import { useEffect, useMemo, useRef, useState } from 'react'
import { Anchor, Button, Card, Collapse, Dropdown, Grid, Input, Modal, Progress, Table, Tag, App as AntApp } from 'antd'
import { DotsThree, ListNumbers, BookOpen, Compass } from '@phosphor-icons/react'
import { Link, useNavigate, useParams } from 'react-router'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { STEPS, nextStepId, prevStepId, decisionOf } from '@/data/registry'
import { stepApplies } from '@/engine/conditions'
import { FormRenderer, sectionStats, type SectionStat } from '@/components/FormRenderer'
import { isFilled } from '@/components/FieldControl'
import { Callout } from '@/components/Callout'
import { ModelChips } from '@/components/ModelChip'
import { PageHeader } from '@/components/PageHeader'
import { ChartFrame } from '@/charts/ChartFrame'
import type { StepDef } from '@/data/schema'
import type { Limits } from '@/data/types'
import '@/styles/screens-form.css'

const LIMIT_KEYS: (keyof Limits)[] = ['successSentence', 'stopRules', 'monthlyBurnKurus', 'cashKurus', 'budgetKurus', 'deadline', 'retriesPerDecision', 'hoursPerWeek']

/**
 * Adım ekranı. Üstte sayfa başlığı ve etiket satırı. Ortada bölüm kartları (form) ve sağda "Bu adım" kartı.
 * Sağ kartta doluluk halkası, bölüm bağlantıları, "Nasıl yapılır?", "Günlük Hayattan" ve yöntem etiketleri vardır.
 * Dar ekranda bu kart formun altında açılır kapanır bölümler olur.
 * Altta 64 px yapışkan işlem şeridi. Şeritte en çok üç düğme vardır. "Geri" düz bağlantıdır.
 * "Bu adımı atla" taşma menüsündedir. Ekranda tek dolu düğme vardır: "Adımı tamamla".
 * 320 px ekranda şerit iki satırdır: üstte "Geri" ve menü, altta iki düğme. Yükseklik 112 px.
 */
export function WorkScreen() {
  const bp = Grid.useBreakpoint()
  const { n, id } = useParams()
  const nav = useNavigate()
  const { message } = AntApp.useApp()
  const plan = useCurrentPlan()
  const setStepValues = usePlanStore((s) => s.setStepValues)
  const setProfile = usePlanStore((s) => s.setProfile)
  const setLimits = usePlanStore((s) => s.setLimits)
  const skipStep = usePlanStore((s) => s.skipStep)
  const setLocation = usePlanStore((s) => s.setLocation)
  const step = id ? STEPS[id] : undefined
  const isProfile = step?.id === '00'
  const stored = useMemo(() => (isProfile ? (plan?.profile as Record<string, unknown>) : plan?.steps[step?.id ?? '']?.values) ?? {}, [plan, step, isProfile])
  const [values, setValues] = useState<Record<string, unknown>>(stored)
  const [skipOpen, setSkipOpen] = useState(false)
  const [skipReason, setSkipReason] = useState('')
  const timer = useRef<number | null>(null)

  useEffect(() => {
    setValues(stored)
  }, [step?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (step) setLocation(`/karar/${n}/adim/${step.id}`)
  }, [step?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!plan || !step) return null
  const decision = decisionOf(step.decision)
  const applies = stepApplies(step.mandatory, plan)
  const wide = Boolean(bp.xl)

  const persist = (next: Record<string, unknown>, status?: 'tamam') => {
    if (isProfile) setProfile(next)
    else setStepValues(step.id, next, status)
    if (step.id === '02') {
      const patch: Partial<Limits> = {}
      for (const k of LIMIT_KEYS) if (k in next) (patch as Record<string, unknown>)[k] = next[k]
      setLimits(patch)
    }
  }
  const onChange = (key: string, v: unknown) => {
    const next = { ...values, [key]: v }
    setValues(next)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => persist(next), 400)
  }
  const complete = () => {
    const missing = (step.completeWhen ?? []).filter((k) => !isFilled(values[k]))
    if (missing.length) {
      message.warning(`Eksik alan var: ${missing.length}. Zorunlu alanları doldurun.`)
      return
    }
    persist(values, 'tamam')
    message.success('Adım tamamlandı.')
    const nx = nextStepId(step.id)
    if (nx && STEPS[nx].decision === step.decision) nav(`/karar/${n}/adim/${nx}`)
    else nav(`/karar/${n}/kapi`)
  }
  const prev = prevStepId(step.id)
  const next = nextStepId(step.id)
  const nextInDecision = next && STEPS[next].decision === step.decision ? next : null
  const chartData = step.chart?.build(values, plan)
  const rec = plan.steps[step.id]
  const title = `Adım ${step.id}. ${step.title}`
  const stats = sectionStats(step, plan, values)
  const example = decision ? <Callout tone="ornek" title="Günlük Hayattan">{decision.example}</Callout> : null

  return (
    <div className="page">
      <div className="work-head">
        <PageHeader kicker={decision ? `Karar ${step.decision}. ${decision.title}` : undefined} title={title} description={step.question} documentTitle={title} />
        <div className="work-meta">
          {applies === 'zorunlu' ? <Tag color="processing">Zorunlu</Tag> : applies === 'kosullu' ? <Tag>Koşullu</Tag> : <Tag>Bu profilde gerekmez</Tag>}
          {rec?.status === 'tamam' ? <Tag color="success">Tamam</Tag> : rec?.status === 'atlandi' ? <Tag>Atlandı</Tag> : null}
          {step.timebox ? <Tag>Süre: {step.timebox}</Tag> : null}
          <span className="helper">Kim yapar? {step.who}</span>
          {rec?.status === 'atlandi' && rec.skipReason ? <span className="helper">Atlama nedeni: {rec.skipReason}</span> : null}
        </div>
      </div>

      <div className="work-grid">
        <div className="work-main">
          {step.whenNote ? <Callout tone="bilgi" title="Ne zaman yapılır?">{step.whenNote}</Callout> : null}
          {applies === 'gizli' ? <Callout tone="ipucu" title="Bu adım sizin profilinizde gerekmez">İsterseniz yine doldurabilirsiniz. Atlamak için alt şeritteki "Daha fazla" menüsünden "Bu adımı atla" seçeneğini kullanın.</Callout> : null}
          {step.intro ? <p className="work-intro">{step.intro}</p> : null}
          <FormRenderer step={step} plan={plan} values={values} onChange={onChange} />
          {chartData && step.chart ? (
            <ChartFrame title={step.chart.title} summary={step.chart.summary?.(values, plan)} option={chartData.option} table={chartData.table} />
          ) : null}
          {step.outcomeTable?.length ? (
            <Card className="step-card" variant="borderless" title="Koşula göre sonuç" extra={<Tag>{step.outcomeTable.length} durum</Tag>}>
              {bp.md ? (
                <Table size="middle" pagination={false} rowKey={(r) => r.condition} dataSource={step.outcomeTable} tableLayout="fixed" columns={[{ title: 'Durum', dataIndex: 'condition', width: '38%' }, { title: 'Sonuç', dataIndex: 'result' }]} />
              ) : (
                <dl className="outcome-list">
                  {step.outcomeTable.map((r) => (
                    <div key={r.condition} className="outcome-item">
                      <dt>{r.condition}</dt>
                      <dd>{r.result}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </Card>
          ) : null}
          {step.output ? <Callout tone="sonuc" title="Elinizde ne olur?">{step.output}</Callout> : null}
          {!wide ? (
            <Collapse
              className="aside-collapse"
              expandIconPlacement="end"
              defaultActiveKey={['durum']}
              items={[
                { key: 'durum', label: 'Bu adım', children: <StepProgress step={step} stats={stats} values={values} /> },
                ...(step.howTo ? [{ key: 'nasil', label: 'Nasıl yapılır?', children: <HowToList items={step.howTo} /> }] : []),
                ...(example ? [{ key: 'ornek', label: 'Günlük Hayattan', children: example }] : []),
                ...(step.models.length ? [{ key: 'yontem', label: 'Karar Kitabı yöntemleri', children: <ModelChips indexes={step.models} showTitle={false} /> }] : []),
              ]}
            />
          ) : null}
        </div>
        {wide ? (
          <aside className="work-aside" aria-label="Bu adım">
            <Card className="step-card aside-card" variant="borderless" title="Bu adım" extra={<Tag>{stats.length} bölüm</Tag>}>
              <StepProgress step={step} stats={stats} values={values} />
              {stats.length > 1 ? (
                <div className="aside-block">
                  <span className="aside-label"><ListNumbers size={16} aria-hidden /> Bölümler</span>
                  <Anchor
                    affix={false}
                    getContainer={() => window}
                    targetOffset={80}
                    items={stats.map((s) => ({ key: s.id, href: `#${s.id}`, title: s.total ? `${s.title} (${s.filled} / ${s.total})` : s.title }))}
                    onClick={(e, link) => {
                      e.preventDefault()
                      document.getElementById(link.href.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                  />
                </div>
              ) : null}
              {step.howTo ? (
                <Collapse
                  className="howto-collapse"
                  ghost
                  expandIconPlacement="end"
                  defaultActiveKey={['nasil']}
                  items={[{ key: 'nasil', label: <span className="aside-label"><Compass size={16} aria-hidden /> Nasıl yapılır?</span>, children: <HowToList items={step.howTo} /> }]}
                />
              ) : null}
              {example}
              {step.models.length ? (
                <div className="aside-block">
                  <span className="aside-label"><BookOpen size={16} aria-hidden /> Karar Kitabı yöntemleri</span>
                  <ModelChips indexes={step.models} showTitle={false} />
                </div>
              ) : null}
            </Card>
          </aside>
        ) : null}
      </div>

      <div className="action-bar step-actions no-print">
        {prev ? <Link className="bar-link" to={`/karar/${STEPS[prev].decision}/adim/${prev}`}>Geri</Link> : null}
        <span className="spacer" />
        <Dropdown
          trigger={['click']}
          placement="topRight"
          menu={{ items: [{ key: 'atla', label: 'Bu adımı atla' }], onClick: ({ key }) => { if (key === 'atla') setSkipOpen(true) } }}
        >
          <Button type="text" className="bar-more" aria-label="Daha fazla" icon={<DotsThree size={20} weight="bold" />} />
        </Dropdown>
        {nextInDecision ? (
          <Button className="bar-draft" onClick={() => { persist(values); nav(`/karar/${n}/adim/${nextInDecision}`) }}>Taslak bırak, ilerle</Button>
        ) : (
          <Button className="bar-draft" onClick={() => { persist(values); nav(`/karar/${n}/kapi`) }}>Kapıya git</Button>
        )}
        <Button type="primary" onClick={complete}>Adımı tamamla</Button>
      </div>

      <Modal open={skipOpen} title="Bu adımı atla" onCancel={() => setSkipOpen(false)} okText="Atla" cancelText="Vazgeç" okButtonProps={{ disabled: !skipReason.trim() }} onOk={() => { skipStep(step.id, skipReason.trim()); setSkipOpen(false); if (next) nav(`/karar/${STEPS[next].decision}/adim/${next}`) }}>
        <div className="field">
          <label htmlFor="atlama-nedeni" className="field-label">Neden atlıyorsunuz? Neden rapora yazılır.</label>
          <Input.TextArea id="atlama-nedeni" rows={2} value={skipReason} onChange={(e) => setSkipReason(e.target.value)} />
        </div>
      </Modal>
    </div>
  )
}

/** Doluluk halkası ve sayılar. Yüzde, görünen alanların dolu olanlarından hesaplanır. */
function StepProgress({ step, stats, values }: { step: StepDef; stats: SectionStat[]; values: Record<string, unknown> }) {
  const total = stats.reduce((s, x) => s + x.total, 0)
  const filled = stats.reduce((s, x) => s + x.filled, 0)
  const pct = total ? Math.round((filled / total) * 100) : 0
  const must = step.completeWhen ?? []
  const mustFilled = must.filter((k) => isFilled(values[k])).length
  return (
    <div className="step-progress">
      <Progress type="circle" percent={pct} size={88} strokeWidth={9} format={(p) => <span className="progress-text tabular">{p}%</span>} aria-label={`Doluluk yüzde ${pct}`} />
      <div className="step-progress-text">
        <strong>{filled} / {total} alan dolu</strong>
        {must.length ? <span className="helper">Zorunlu alan: {mustFilled} / {must.length} dolu</span> : <span className="helper">Bu adımda zorunlu alan yok.</span>}
        {pct === 100 ? <Tag color="success">Hazır</Tag> : null}
      </div>
    </div>
  )
}

function HowToList({ items }: { items: string[] }) {
  return (
    <ol className="howto-list">
      {items.map((t, i) => <li key={i}>{t}</li>)}
    </ol>
  )
}
