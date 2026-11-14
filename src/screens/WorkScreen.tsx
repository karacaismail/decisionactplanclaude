import { useEffect, useMemo, useRef, useState } from 'react'
import { Anchor, Button, Card, Collapse, ConfigProvider, Dropdown, Grid, Input, Modal, Progress, Table, Tag, App as AntApp } from 'antd'
import { DotsThree, ListNumbers, BookOpen, Compass } from '@phosphor-icons/react'
import { Link, useNavigate, useParams } from 'react-router'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { STEPS, nextStepId, prevStepId, decisionOf, groupLabel, stepPath } from '@/data/registry'
import { STRATEGY_N } from '@/data/decisions'
import { decisionLocked, lockReason } from '@/engine/gate'
import { uid } from '@/engine/format'
import { stepApplies } from '@/engine/conditions'
import { FormRenderer, sectionStats, type SectionStat } from '@/components/FormRenderer'
import { isFilled } from '@/components/FieldControl'
import { Callout } from '@/components/Callout'
import { ModelChips } from '@/components/ModelChip'
import { PageHeader } from '@/components/PageHeader'
import { FoundationSummary } from '@/components/FoundationSummary'
import { ChartFrame } from '@/charts/ChartFrame'
import type { StepDef } from '@/data/schema'
import type { Limits, PlanDoc } from '@/data/types'
import '@/styles/screens-form.css'
import '@/styles/screens-strateji.css'

const LIMIT_KEYS: (keyof Limits)[] = ['successSentence', 'stopRules', 'monthlyBurnKurus', 'cashKurus', 'budgetKurus', 'deadline', 'retriesPerDecision', 'hoursPerWeek']

/** Temel adımlarından gelen öneri. Kayda kendiliğinden yazılmaz. Kullanıcı "Alana yaz" düğmesine basarsa yazılır. */
interface Suggestion {
  key: string
  /** Önerinin yazılacağı alanın adı. */
  label: string
  /** Ekranda gösterilen öneri metni. */
  display: string
  /** Önerinin geldiği yer. Örneğin "Adım 11, denenecek birinci yol". */
  source: string
  /** Alana yazılacak değeri üretir. Satır kimliği yazma anında verilir. */
  build: () => unknown
}

const filledText = (x: unknown): string | null => (typeof x === 'string' && x.trim() ? x.trim() : null)
const hasRows = (x: unknown, keys: string[]): boolean => Array.isArray(x) && x.some((r) => keys.some((k) => filledText((r as Record<string, unknown>)?.[k])))

/**
 * Adım 18 ve Adım 19 için öneriler. Yalnız BOŞ alan için öneri üretilir. Dolu alana dokunulmaz.
 * Örnek: Adım 11'deki "birinci yol", Adım 18'deki "Seçilen yol" alanı için önerilir.
 */
function foundationSuggestions(stepId: string, plan: PlanDoc, values: Record<string, unknown>): Suggestion[] {
  const from = (step: string, key: string): unknown => plan.steps[step]?.values?.[key]
  const out: Suggestion[] = []
  if (stepId === '18') {
    const firstPath = filledText(from('11', 'testOption1'))
    if (firstPath && !isFilled(values.chosenPath)) {
      out.push({ key: 'chosenPath', label: 'Seçilen yol', display: firstPath, source: 'Adım 11, denenecek birinci yol', build: () => firstPath })
    }
    const segment = filledText(from('08', 'segmentName'))
    const channel = filledText(from('08', 'accessChannel')) ?? filledText(from('08', 'accessPath'))
    if (segment && !hasRows(values.paths, ['name', 'where', 'how'])) {
      const where = [segment, channel].filter(Boolean).map((x) => String(x).replace(/\.+$/, '')).join('. ') + '.'
      out.push({
        key: 'paths',
        label: 'Olası yollar, ilk satır',
        display: `Hedef müşteri ve kanal: ${where}${firstPath ? ` Yolun adı: ${firstPath}` : ''}`,
        source: 'Adım 08, ilk müşteri grubu ve ulaşma yolu',
        build: () => [{ _id: uid('satir'), name: firstPath ?? '', where }],
      })
    }
  }
  if (stepId === '19') {
    const success = filledText(plan.limits.successSentence)
    if (success && !isFilled(values.objective)) {
      out.push({ key: 'objective', label: 'Hedef', display: success, source: 'Adım 02, başarı cümlesi', build: () => success })
    }
    const threshold = (from('15', 'threshold') as { value?: number | null } | undefined)?.value
    if (typeof threshold === 'number' && !hasRows(values.keyResults, ['kr', 'target'])) {
      out.push({
        key: 'keyResults',
        label: 'Anahtar sonuçlar, ilk satır',
        display: `Taahhüt veren müşteri sayısı. Hedef sayı: ${threshold}.`,
        source: 'Adım 15, talep testinin eşiği',
        build: () => [{ _id: uid('satir'), kr: 'Taahhüt veren müşteri sayısı', target: String(threshold) }],
      })
    }
  }
  return out
}

/**
 * Adım ekranı. Üstte sayfa başlığı ve etiket satırı. Ortada bölüm kartları (form) ve sağda "Bu adım" kartı.
 * Sağ kartta doluluk halkası, bölüm bağlantıları, "Nasıl yapılır?", "Günlük Hayattan" ve yöntem etiketleri vardır.
 * Dar ekranda bu kart formun altında açılır kapanır bölümler olur.
 * Altta 64 px yapışkan işlem şeridi. Şeritte en çok üç düğme vardır. "Geri" düz bağlantıdır.
 * "Bu adımı atla" taşma menüsündedir. Ekranda tek dolu düğme vardır: "Adımı tamamla".
 * 320 px ekranda şerit iki satırdır: üstte "Geri" ve menü, altta iki düğme. Yükseklik 112 px.
 * Adım 18, 19 ve 20 strateji çalışmasıdır. Geçiş kapısı kararı yoksa form salt okunur açılır ve kayıt düğmeleri kapalıdır.
 * Adresler adımın kendi grubundan üretilir (`stepPath`). Adresteki karar numarası okunmaz.
 */
export function WorkScreen() {
  const bp = Grid.useBreakpoint()
  const { id } = useParams()
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
    if (step) setLocation(stepPath(step.id))
  }, [step?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!plan || !step) return null
  const decision = decisionOf(step.decision)
  const applies = stepApplies(step.mandatory, plan)
  const wide = Boolean(bp.xl)
  const isStrategy = step.decision === STRATEGY_N
  /* Strateji adımı geçiş kapısı kararı olmadan salt okunurdur. Hiçbir yazma işlemi yapılmaz. */
  const locked = isStrategy && decisionLocked(plan, STRATEGY_N)
  const gatePath = isStrategy ? '/strateji' : `/karar/${step.decision}/kapi`

  const persist = (next: Record<string, unknown>, status?: 'tamam') => {
    if (locked) return
    if (isProfile) setProfile(next)
    else setStepValues(step.id, next, status)
    if (step.id === '02') {
      const patch: Partial<Limits> = {}
      for (const k of LIMIT_KEYS) if (k in next) (patch as Record<string, unknown>)[k] = next[k]
      setLimits(patch)
    }
  }
  const onChange = (key: string, v: unknown) => {
    if (locked) return
    const next = { ...values, [key]: v }
    setValues(next)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => persist(next), 400)
  }
  const complete = () => {
    if (locked) return
    const missing = (step.completeWhen ?? []).filter((k) => !isFilled(values[k]))
    if (missing.length) {
      message.warning(`Eksik alan var: ${missing.length}. Zorunlu alanları doldurun.`)
      return
    }
    persist(values, 'tamam')
    message.success('Adım tamamlandı.')
    const nx = nextStepId(step.id)
    if (nx && STEPS[nx].decision === step.decision) nav(stepPath(nx))
    else nav(gatePath)
  }
  const prev = prevStepId(step.id)
  const next = nextStepId(step.id)
  const nextInDecision = next && STEPS[next].decision === step.decision ? next : null
  const chartData = step.chart?.build(values, plan)
  const rec = plan.steps[step.id]
  const title = `Adım ${step.id}. ${step.title}`
  const stats = sectionStats(step, plan, values)
  const example = decision ? <Callout tone="ornek" title="Günlük Hayattan">{decision.example}</Callout> : null
  const suggestions = isStrategy && !locked ? foundationSuggestions(step.id, plan, values) : []
  const applySuggestion = (s: Suggestion) => {
    onChange(s.key, s.build())
    message.success('Öneri alana yazıldı. Alanı düzenleyebilirsiniz.')
  }
  const form = <FormRenderer step={step} plan={plan} values={values} onChange={onChange} />

  return (
    <div className="page">
      <div className="work-head">
        <PageHeader kicker={decision ? groupLabel(step.decision) : undefined} title={title} description={step.question} documentTitle={title} />
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
          {locked ? (
            <Callout tone="uyari" title="Bu adım kilitli">
              {lockReason(plan, STRATEGY_N)} Adımı okuyabilirsiniz. Alanlar ve kayıt düğmeleri kapalıdır.
              <span className="work-lock-links">
                <Link to="/gecis">Geçiş kapısına git</Link>
                <Link to="/strateji">Strateji özetine dön</Link>
              </span>
            </Callout>
          ) : null}
          {isStrategy && !locked ? (
            <Collapse
              className="aside-collapse foundation-collapse"
              expandIconPlacement="end"
              items={[{ key: 'dayanak', label: 'Dayanak özeti', children: <FoundationSummary plan={plan} compact /> }]}
            />
          ) : null}
          {suggestions.length ? (
            <Card className="step-card suggest-card" variant="borderless" title="Temelden gelen öneriler" extra={<Tag>{suggestions.length} öneri</Tag>}>
              <p className="card-desc">Öneriler temel adımlarındaki cevaplarınızdan gelir. Öneri kendiliğinden kaydedilmez. "Alana yaz" düğmesine basarsanız öneri ilgili alana yazılır.</p>
              <ul className="suggest-list">
                {suggestions.map((s) => (
                  <li key={s.key} className="suggest-item">
                    <span className="suggest-text">
                      <span className="suggest-label">{s.label} <Tag>Taslak</Tag></span>
                      <span className="suggest-value">{s.display}</span>
                      <span className="helper">Kaynak: {s.source}.</span>
                    </span>
                    <Button onClick={() => applySuggestion(s)} aria-label={`Alana yaz: ${s.label}`}>Alana yaz</Button>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
          {step.intro ? <p className="work-intro">{step.intro}</p> : null}
          {locked ? (
            <ConfigProvider componentDisabled>
              <fieldset className="work-lock" disabled aria-label="Kilitli form">{form}</fieldset>
            </ConfigProvider>
          ) : form}
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
        {prev ? <Link className="bar-link" to={stepPath(prev)}>Geri</Link> : null}
        <span className="spacer" />
        <Dropdown
          trigger={['click']}
          placement="topRight"
          menu={{ items: [{ key: 'atla', label: 'Bu adımı atla', disabled: locked }], onClick: ({ key }) => { if (key === 'atla' && !locked) setSkipOpen(true) } }}
        >
          <Button type="text" className="bar-more" aria-label="Daha fazla" icon={<DotsThree size={20} weight="bold" />} />
        </Dropdown>
        {nextInDecision ? (
          <Button className="bar-draft" disabled={locked} onClick={() => { persist(values); nav(stepPath(nextInDecision)) }}>Taslak bırak, ilerle</Button>
        ) : (
          <Button className="bar-draft" onClick={() => { persist(values); nav(gatePath) }}>{isStrategy ? 'Strateji özetine git' : 'Kapıya git'}</Button>
        )}
        <Button type="primary" disabled={locked} onClick={complete}>Adımı tamamla</Button>
      </div>

      <Modal open={skipOpen} title="Bu adımı atla" onCancel={() => setSkipOpen(false)} okText="Atla" cancelText="Vazgeç" okButtonProps={{ disabled: !skipReason.trim() }} onOk={() => { if (locked) return; skipStep(step.id, skipReason.trim()); setSkipOpen(false); if (next) nav(stepPath(next)) }}>
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
