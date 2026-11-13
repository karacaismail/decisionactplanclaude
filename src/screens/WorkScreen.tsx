import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Collapse, Dropdown, Grid, Input, Modal, Table, App as AntApp } from 'antd'
import { DotsThree } from '@phosphor-icons/react'
import { Link, useNavigate, useParams } from 'react-router'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { STEPS, nextStepId, prevStepId, decisionOf } from '@/data/registry'
import { stepApplies } from '@/engine/conditions'
import { FormRenderer } from '@/components/FormRenderer'
import { Callout } from '@/components/Callout'
import { ModelChips } from '@/components/ModelChip'
import { PageHeader } from '@/components/PageHeader'
import { ChartFrame } from '@/charts/ChartFrame'
import type { Limits } from '@/data/types'
import '@/styles/screens-form.css'

const LIMIT_KEYS: (keyof Limits)[] = ['successSentence', 'stopRules', 'monthlyBurnKurus', 'cashKurus', 'budgetKurus', 'deadline', 'retriesPerDecision', 'hoursPerWeek']

/**
 * Adım ekranı. Üstte sayfa başlığı ve tek satır durum. Ortada form ve yardım sütunu.
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
    const missing = (step.completeWhen ?? []).filter((k) => {
      const v = values[k]
      return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)
    })
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
  const example = decision ? <Callout tone="ornek" title="Günlük Hayattan">{decision.example}</Callout> : null

  return (
    <div className="page">
      <div className="work-head">
        <PageHeader kicker={decision ? `Karar ${step.decision}. ${decision.title}` : undefined} title={title} description={step.question} documentTitle={title} />
        <div className="work-meta">
          {applies === 'zorunlu' ? <span className="tag">Zorunlu</span> : applies === 'kosullu' ? <span className="tag">Koşullu</span> : <span className="tag is-muted">Bu profilde gerekmez</span>}
          {rec?.status === 'tamam' ? <span className="tag is-ok">Tamam</span> : rec?.status === 'atlandi' ? <span className="tag is-muted">Atlandı</span> : null}
          <span className="helper">Kim yapar? {step.who}</span>
          {rec?.status === 'atlandi' && rec.skipReason ? <span className="helper">Atlama nedeni: {rec.skipReason}</span> : null}
        </div>
      </div>

      <div className="work-grid">
        <div className="work-main">
          {step.whenNote ? <Callout tone="bilgi" title="Ne zaman yapılır?">{step.whenNote}</Callout> : null}
          {applies === 'gizli' ? <Callout tone="ipucu" title="Bu adım sizin profilinizde gerekmez">İsterseniz yine doldurabilirsiniz. Atlamak için alt şeritteki "Daha fazla" menüsünden "Bu adımı atla" seçeneğini kullanın.</Callout> : null}
          {step.intro ? <p className="work-intro">{step.intro}</p> : null}
          {!wide && step.howTo ? (
            <Collapse
              className="howto-collapse"
              ghost
              items={[{ key: 'nasil', label: 'Nasıl yapılır?', children: <div className="howto"><HowToList items={step.howTo} /></div> }]}
            />
          ) : null}
          <FormRenderer step={step} plan={plan} values={values} onChange={onChange} />
          {chartData && step.chart ? (
            <section className="section is-divided">
              <ChartFrame title={step.chart.title} summary={step.chart.summary?.(values, plan)} option={chartData.option} table={chartData.table} />
            </section>
          ) : null}
          {step.outcomeTable?.length ? (
            <section className="section is-divided" aria-labelledby="kosul-sonuc">
              <div className="section-head"><h3 id="kosul-sonuc">Koşula göre sonuç</h3></div>
              <Table size="middle" pagination={false} rowKey={(r) => r.condition} dataSource={step.outcomeTable} columns={[{ title: 'Durum', dataIndex: 'condition', width: 240 }, { title: 'Sonuç', dataIndex: 'result', width: 360 }]} scroll={{ x: 'max-content' }} />
            </section>
          ) : null}
          {step.output ? <Callout tone="sonuc" title="Elinizde ne olur?">{step.output}</Callout> : null}
          {!wide ? example : null}
          <ModelChips indexes={step.models} />
        </div>
        {wide ? (
          <aside className="work-aside" aria-label="Yardım">
            {step.howTo ? (
              <div className="howto">
                <div className="section-head"><h3>Nasıl yapılır?</h3></div>
                <HowToList items={step.howTo} />
              </div>
            ) : null}
            {example}
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

function HowToList({ items }: { items: string[] }) {
  return <ol>{items.map((t, i) => <li key={i}>{t}</li>)}</ol>
}
