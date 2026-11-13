import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Card, Grid, Input, Modal, Space, Table, Tag, Typography, theme, App as AntApp } from 'antd'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, ArrowRight, DoorOpen, SkipForward, Check } from '@phosphor-icons/react'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { STEPS, nextStepId, prevStepId, decisionOf } from '@/data/registry'
import { stepApplies } from '@/engine/conditions'
import { FormRenderer } from '@/components/FormRenderer'
import { Callout } from '@/components/Callout'
import { ModelChips } from '@/components/ModelChip'
import { ChartFrame } from '@/charts/ChartFrame'
import type { Limits } from '@/data/types'

const LIMIT_KEYS: (keyof Limits)[] = ['successSentence', 'stopRules', 'monthlyBurnKurus', 'cashKurus', 'budgetKurus', 'deadline', 'retriesPerDecision', 'hoursPerWeek']

export function WorkScreen() {
  const { token } = theme.useToken()
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
  const chartData = step.chart?.build(values, plan)
  const rec = plan.steps[step.id]

  return (
    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: bp.xl ? 'minmax(0, 1fr) 320px' : '1fr', alignItems: 'start' }}>
      <div style={{ display: 'grid', gap: 24, minWidth: 0 }}>
        <div>
          <Typography.Text style={{ color: token.colorTextSecondary, fontSize: 14 }}>Karar {step.decision}. {decision?.title}</Typography.Text>
          <Typography.Title level={1} style={{ fontSize: 28, margin: '4px 0 8px' }}>Adım {step.id}. {step.title}</Typography.Title>
          <Typography.Paragraph style={{ fontSize: 18, marginBottom: 8 }}>{step.question}</Typography.Paragraph>
          <Space wrap>
            {applies === 'zorunlu' ? <Tag color="processing" style={{ fontSize: 14 }}>Zorunlu</Tag> : applies === 'kosullu' ? <Tag style={{ fontSize: 14 }}>Koşullu</Tag> : <Tag style={{ fontSize: 14 }}>Bu profilde gerekmez</Tag>}
            {rec?.status === 'tamam' ? <Tag color="success" style={{ fontSize: 14 }}>Tamam</Tag> : rec?.status === 'atlandi' ? <Tag style={{ fontSize: 14 }}>Atlandı: {rec.skipReason}</Tag> : null}
            <span style={{ fontSize: 14, color: token.colorTextSecondary }}>Kim yapar? {step.who}</span>
          </Space>
        </div>
        {step.whenNote ? <Callout tone="bilgi" title="Ne zaman yapılır?">{step.whenNote}</Callout> : null}
        {applies === 'gizli' ? <Callout tone="ipucu" title="Bu adım sizin profilinizde gerekmez">İsterseniz yine doldurabilirsiniz. Atlamak için "Bu adımı atla" düğmesini kullanın.</Callout> : null}
        {step.intro ? <Typography.Paragraph style={{ fontSize: 16 }}>{step.intro}</Typography.Paragraph> : null}
        {!bp.xl && step.howTo ? <HowTo items={step.howTo} /> : null}
        <Card styles={{ body: { padding: bp.md ? 24 : 16 } }}>
          <FormRenderer step={step} plan={plan} values={values} onChange={onChange} />
        </Card>
        {chartData && step.chart ? <ChartFrame title={step.chart.title} summary={step.chart.summary?.(values, plan)} option={chartData.option} table={chartData.table} /> : null}
        {step.outcomeTable?.length ? (
          <Card title="Koşula göre sonuç" size="small">
            <Table size="small" pagination={false} rowKey={(r) => r.condition} dataSource={step.outcomeTable} columns={[{ title: 'Durum', dataIndex: 'condition' }, { title: 'Sonuç', dataIndex: 'result' }]} scroll={{ x: 'max-content' }} />
          </Card>
        ) : null}
        {step.output ? <Callout tone="sonuc" title="Elinizde ne olur?">{step.output}</Callout> : null}
        <ModelChips indexes={step.models} />
        <div className="no-print" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between', position: 'sticky', bottom: 0, background: token.colorBgLayout, padding: '12px 0' }}>
          <Space wrap>
            <Button icon={<ArrowLeft size={18} />} disabled={!prev} onClick={() => prev && nav(`/karar/${STEPS[prev].decision}/adim/${prev}`)}>Geri</Button>
            <Button icon={<SkipForward size={18} />} onClick={() => setSkipOpen(true)}>Bu adımı atla</Button>
          </Space>
          <Space wrap>
            {next && STEPS[next].decision === step.decision ? (
              <Button icon={<ArrowRight size={18} />} iconPosition="end" onClick={() => { persist(values); nav(`/karar/${n}/adim/${next}`) }}>Taslak bırak, ilerle</Button>
            ) : (
              <Button icon={<DoorOpen size={18} />} onClick={() => { persist(values); nav(`/karar/${n}/kapi`) }}>Kapıya git</Button>
            )}
            <Button type="primary" icon={<Check size={18} />} onClick={complete}>Adımı tamamla</Button>
          </Space>
        </div>
      </div>
      {bp.xl ? (
        <aside style={{ position: 'sticky', top: 76, display: 'grid', gap: 16 }}>
          {step.howTo ? <HowTo items={step.howTo} /> : null}
          {decision ? <Callout tone="ornek" title="Günlük Hayattan">{decision.example}</Callout> : null}
        </aside>
      ) : null}
      <Modal open={skipOpen} title="Bu adımı atla" onCancel={() => setSkipOpen(false)} okText="Atla" cancelText="Vazgeç" okButtonProps={{ disabled: !skipReason.trim() }} onOk={() => { skipStep(step.id, skipReason.trim()); setSkipOpen(false); if (next) nav(`/karar/${STEPS[next].decision}/adim/${next}`) }}>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Neden atlıyorsunuz? Neden rapora yazılır.</span>
          <Input.TextArea rows={2} value={skipReason} onChange={(e) => setSkipReason(e.target.value)} />
        </label>
      </Modal>
    </div>
  )
}

function HowTo({ items }: { items: string[] }) {
  return (
    <Card size="small" title="Nasıl yapılır?">
      <ol style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 8 }}>{items.map((t, i) => <li key={i}>{t}</li>)}</ol>
    </Card>
  )
}
