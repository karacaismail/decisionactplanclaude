import '@/styles/desen/field.css'
import '@/styles/desen/form.css'
import '@/styles/desen/step-card.css'
import '@/styles/desen/strateji.css'
import '@/styles/ekran/WorkScreen.css'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Anchor, Button, Card, Collapse, ConfigProvider, Dropdown, Grid, Input, Modal, Progress, Table, Tag, App as AntApp } from 'antd'
import { DotsThree, ListNumbers, BookOpen, Compass } from '@phosphor-icons/react'
import { Link, useNavigate, useParams } from 'react-router'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { STEPS, nextStepId, prevStepId, decisionOf, groupLabel, stepHeading, stepPath } from '@/data/registry'
import { subStageOfStep } from '@/data/clusters'
import { cruxOf } from '@/engine/crux'
import { distinctPaths } from '@/engine/integrity'
import { GOALS_STEP, MOVES_STEP, movesOf, OPTIONS_STEP, optionsOf, RESOURCES_STEP, TASKS_STEP, tasksOf, TESTS_STEP, DIAGNOSIS_STEP } from '@/engine/strategy'
import { STRATEGY_N } from '@/data/decisions'
import { decisionLocked, lockReason, lockTarget } from '@/engine/gate'
import { EXECUTION_DECISIONS } from '@/data/stages'
import { uid } from '@/engine/format'
import { LIMITS_STEP } from '@/engine/changes'
import { stepApplies } from '@/engine/conditions'
import { FormRenderer, requiredKeys, sectionStats, type SectionStat } from '@/components/FormRenderer'
import { isFilled } from '@/components/FieldControl'
import { Callout } from '@/components/Callout'
import { DraftReview } from '@/components/DraftReview'
import { SupportHint, SupportSummary } from '@/components/SupportLinks'
import { ModelChips } from '@/components/ModelChip'
import { PageHeader } from '@/components/PageHeader'
import { LoadingState } from '@/components/LoadingState'
import { SituationSummary } from '@/components/SituationSummary'
import { ChartFrame } from '@/charts/ChartFrame'
import type { Limits, PlanDoc } from '@/data/types'
// Rapor bileşenleri yalnız görünür içerik istendiğinde yüklenir.
const FoundationSummary = lazy(() => import('@/components/FoundationSummary').then((module) => ({ default: module.FoundationSummary })))
const WorkPaths = lazy(() => import('@/components/WorkPaths').then((module) => ({ default: module.WorkPaths })))

const LIMIT_KEYS: (keyof Limits)[] = ['successSentence', 'stopRules', 'monthlyBurnKurus', 'cashKurus', 'budgetKurus', 'deadline', 'retriesPerDecision', 'hoursPerWeek']

/** Temel adımlarından gelen öneri. Kayda kendiliğinden yazılmaz. Kullanıcı "Alana yaz" düğmesine basarsa yazılır. */
interface Suggestion {
  key: string
  /** Önerinin yazılacağı alanın adı. */
  label: string
  /** Ekranda gösterilen öneri metni. */
  display: string
  /** Önerinin geldiği yer. Örneğin "Adım 02, başarı cümlesi". */
  source: string
  /** Alana yazılacak değeri üretir. Satır kimliği yazma anında verilir. */
  build: () => unknown
}

const filledText = (x: unknown): string | null => (typeof x === 'string' && x.trim() ? x.trim() : null)
const hasRows = (x: unknown, keys: string[]): boolean => Array.isArray(x) && x.some((r) => keys.some((k) => filledText((r as Record<string, unknown>)?.[k])))

/** Yol adaylarının yazıldığı adım. Bu adım Karar 5'tedir ve kilitli değildir. */
const PATHS_STEP = '18'
/** Seçimin kaydedildiği adım. Stratej önerir, karar sahibi seçer. Yol adayları tablosu bu adımın üstünde salt okunur durur. */
const CHOICE_STEP = '19'
/** Yol adayları tablosunu gösteren adımlar: seçenekler ve seçim. */
const PATH_VIEW_STEPS = [OPTIONS_STEP, CHOICE_STEP]

/**
 * Önceki adımlardan gelen öneriler. Yalnız BOŞ alan için öneri üretilir. Dolu alana dokunulmaz.
 * "Seçilen yol", "Seçimin gerekçesi" ve "Vazgeçilenler" için öneri ÜRETİLMEZ. Stratej önerir, karar sahibi seçer.
 * Öneri yalnız kullanıcının daha önce yazdığı cevabı taşır. Yazılım yeni içerik üretmez.
 * Örnek: Adım 02'deki başarı cümlesi, "Hedef" alanı için önerilir.
 */
function foundationSuggestions(stepId: string, plan: PlanDoc, values: Record<string, unknown>): Suggestion[] {
  const from = (step: string, key: string): unknown => plan.steps[step]?.values?.[key]
  const out: Suggestion[] = []
  if (stepId === DIAGNOSIS_STEP) {
    const crux = cruxOf(plan)
    if (crux && !isFilled(values.diagnosis)) out.push({ key: 'diagnosis', label: 'Asıl güçlük', display: crux.text, source: 'Adım 18, asıl engel adayı', build: () => crux.text })
  }
  if (stepId === OPTIONS_STEP) {
    const paths = distinctPaths(from(PATHS_STEP, 'paths')).map((r) => String(r.name).trim())
    if (paths.length && !hasRows(values.options, ['name'])) {
      out.push({
        key: 'options',
        label: 'Masadaki yollar',
        display: paths.join('. '),
        source: 'Adım 18, yol adayları',
        build: () => paths.map((name) => ({ _id: uid('satir'), name, source: 'hazirlik' })),
      })
    }
  }
  if (stepId === TESTS_STEP) {
    const options = optionsOf(plan).map((o) => o.name)
    if (options.length && !hasRows(values.tests, ['option'])) {
      out.push({ key: 'tests', label: 'Her yol için bir satır', display: options.join('. '), source: '2.2 Seçenekler', build: () => options.map((option) => ({ _id: uid('satir'), option, result: 'sinanmadi' })) })
    }
  }
  if (stepId === GOALS_STEP) {
    const success = filledText(plan.limits.successSentence)
    if (success && !isFilled(values.objective)) {
      out.push({ key: 'objective', label: 'Hedef', display: success, source: 'Adım 02, başarı cümlesi', build: () => success })
    }
    const threshold = (from('15', 'threshold') as { value?: number | null } | undefined)?.value
    if (typeof threshold === 'number' && !hasRows(values.keyResults, ['kr', 'target'])) {
      out.push({
        key: 'keyResults',
        label: 'Göstergeler, ilk satır',
        display: `Taahhüt veren müşteri sayısı. Hedef sayı: ${threshold}.`,
        source: 'Adım 15, talep testinin eşiği',
        build: () => [{ _id: uid('satir'), kr: 'Taahhüt veren müşteri sayısı', target: String(threshold) }],
      })
    }
  }
  if (stepId === TASKS_STEP) {
    const moves = movesOf(plan).map((m) => m.move)
    if (moves.length && !hasRows(values.now, ['action'])) {
      out.push({ key: 'now', label: 'Şimdi. İlk 90 gün.', display: moves.join('. '), source: `${stepHeading(MOVES_STEP)}`, build: () => moves.map((action) => ({ _id: uid('satir'), action })) })
    }
  }
  if (stepId === RESOURCES_STEP) {
    const tasks = tasksOf(plan).map((t) => t.action)
    if (tasks.length && !hasRows(values.resources, ['item'])) {
      out.push({ key: 'resources', label: 'Her ana iş için bir satır', display: tasks.join('. '), source: `${stepHeading(TASKS_STEP)}`, build: () => tasks.map((item) => ({ _id: uid('satir'), item })) })
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
 * Adım 19 ve 20 strateji oluşturmadır. Hazırlık kontrolü kararı yoksa form salt okunur açılır ve kayıt düğmeleri kapalıdır.
 * Adım 18 "Yol adayları" Karar 5'tedir ve kilitli değildir. Bu adımda yol seçilmez.
 * Adım 19 açıkken üstte yol adayları tablosu salt okunur durur. Yazılım "Seçilen yol" alanını doldurmaz.
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
  const values = useMemo(() => (isProfile ? (plan?.profile as Record<string, unknown>) : plan?.steps[step?.id ?? '']?.values) ?? {}, [plan, step, isProfile])
  const [skipOpen, setSkipOpen] = useState(false)
  const [reveal, setReveal] = useState<{ id: string; n: number } | undefined>(undefined)
  const [skipReason, setSkipReason] = useState('')

  useEffect(() => {
    setSkipOpen(false)
    setSkipReason('')
    setReveal(undefined)
  }, [plan?.id, step?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (step) setLocation(stepPath(step.id))
  }, [step?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Yol adayları yalnız seçim adımında gösterilir. Başka adımda rapor hesaplanmaz. */
  const showPaths = PATH_VIEW_STEPS.includes(step?.id ?? '')

  if (!plan || !step) return null
  const decision = decisionOf(step.decision)
  const applies = stepApplies(step.mandatory, plan)
  const wide = Boolean(bp.xl)
  const isStrategy = step.decision === STRATEGY_N
  /*
   * Kilitli bölüm okunur ama doldurulmaz. Kural süreç haritasının 2. bölümündedir.
   * Strateji adımı hazırlık kararı olmadan kilitlidir. Strateji uygulama adımı kendi kararı kilitliyken kilitlidir.
   * Strateji öncesi adımlar kilitlenmez. Kullanıcı hazırlıkta istediği adıma dönebilir.
   */
  const lockGroup = isStrategy ? STRATEGY_N : step.decision
  const locked = (isStrategy || EXECUTION_DECISIONS.includes(step.decision)) && decisionLocked(plan, lockGroup)
  const lockTo = lockTarget(plan, lockGroup)
  const subStage = subStageOfStep(step.id)
  const gatePath = isStrategy ? '/strateji' : `/karar/${step.decision}/kapi`

  const editablePlan = () => {
    const current = usePlanStore.getState()
    if (current.currentId !== plan.id) return undefined
    const active = current.plans[plan.id]
    if (!active || ((isStrategy || EXECUTION_DECISIONS.includes(step.decision)) && decisionLocked(active, lockGroup))) return undefined
    if (active.steps[step.id]?.status === 'atlandi' && plan.steps[step.id]?.status !== 'atlandi') return undefined
    return active
  }
  const persist = (next: Record<string, unknown>, status?: 'tamam') => {
    if (!editablePlan()) return false
    if (isProfile) setProfile(next)
    else setStepValues(step.id, next, status)
    if (step.id === '02') {
      const patch: Partial<Limits> = {}
      for (const k of LIMIT_KEYS) if (k in next) (patch as Record<string, unknown>)[k] = next[k]
      setLimits(patch)
    }
    return true
  }
  const onChange = (key: string, v: unknown) => {
    /* Yalnız değişen alanı hemen kaydet. Diğer alanların güncel değerlerini koru. */
    return persist({ [key]: v })
  }
  const complete = () => {
    const current = editablePlan()
    if (!current) return
    const draft = (isProfile ? (current.profile as Record<string, unknown>) : current.steps[step.id]?.values) ?? {}
    const missing = requiredKeys(step, current, draft).filter((k) => !isFilled(draft[k]))
    if (missing.length) {
      message.warning(`Eksik alan var: ${missing.length}. Zorunlu alanları doldurun.`)
      /* Eksik alan öteki sekmede olabilir. Form ilk eksik bölümü açar ve ekrana getirir. */
      const at = step.sections.findIndex((sec) => sec.fields.some((f) => f.key === missing[0]))
      if (at >= 0) setReveal((r) => ({ id: `b${step.id}-${at}`, n: (r?.n ?? 0) + 1 }))
      return
    }
    const issues = step.validate?.(draft, current) ?? []
    if (issues.length) {
      message.warning(issues[0])
      return
    }
    if (!persist({}, 'tamam')) return
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
  const title = stepHeading(step.id)
  const stats = sectionStats(step, plan, values)
  const example = decision ? <Callout tone="ornek" title="Günlük Hayattan">{decision.example}</Callout> : null
  const suggestions = !locked ? foundationSuggestions(step.id, plan, values) : []
  const applySuggestion = (s: Suggestion) => {
    if (onChange(s.key, s.build())) message.success('Öneri alana yazıldı. Alanı düzenleyebilirsiniz.')
  }
  const form = <FormRenderer step={step} plan={plan} values={values} onChange={onChange} readOnly={locked} revealId={reveal} />

  return (
    <div className="page work-page">
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
          {subStage ? (
            <Callout tone="bilgi" title={`Alt aşama ${subStage.code}. ${subStage.title}`}>
              {subStage.does} {subStage.why}
            </Callout>
          ) : null}
          {step.whenNote ? <Callout tone="bilgi" title="Ne zaman yapılır?">{step.whenNote}</Callout> : null}
          {applies === 'gizli' ? <Callout tone="ipucu" title="Bu adım sizin profilinizde gerekmez">İsterseniz yine doldurabilirsiniz. Atlamak için alt şeritteki "Daha fazla" menüsünden "Bu adımı atla" seçeneğini kullanın.</Callout> : null}
          {locked ? (
            <Callout tone="uyari" title="Bu adım kilitli">
              {lockReason(plan, lockGroup)} Adımı okuyabilirsiniz. Alanlar ve kayıt düğmeleri kapalıdır.
              <span className="work-lock-links">
                {lockTo === 'kapi' ? (
                  <Link to={`/karar/${lockGroup - 1}/kapi`}>Kontrol {lockGroup - 1} ekranını aç</Link>
                ) : (
                  <>
                    <Link to="/gecis">Hazırlık kontrolüne git</Link>
                    <Link to="/strateji">Strateji oluşturma özetine dön</Link>
                  </>
                )}
              </span>
            </Callout>
          ) : null}
          <DraftReview planId={plan.id} kind="adim" step={step.id} locked={locked || rec?.status === 'atlandi'} />
          {step.id === PATHS_STEP ? (
            <Callout tone="ipucu" title="Bu adımda seçim yok">
              Bu adımda yol seçmeyin. Stratej bu adaylardan birini önerir. Karar sahibi seçer.
            </Callout>
          ) : null}
          {step.id === PATHS_STEP ? (
            <Card className="step-card" variant="borderless" title="Durum özeti">
              <p className="card-desc">Yazılım bu dört listeyi önceki adımlardan toplar. Listeyi burada değiştiremezsiniz. Bir maddeyi kaynak adımında düzeltirsiniz. Yazılım yol önermez.</p>
              <SituationSummary plan={plan} />
            </Card>
          ) : null}
          {showPaths && !locked ? (
            <Card className="step-card" variant="borderless" title="Yol adayları" extra={<Link to={stepPath(PATHS_STEP)}>Adım 18'i aç</Link>}>
              <p className="card-desc">Seçimi karar sahibi yapar. Yazılım bu alanı sizin yerinize doldurmaz.</p>
              <Suspense fallback={<LoadingState cards={1} label="Yol adayları yükleniyor" />}><WorkPaths plan={plan} /></Suspense>
            </Card>
          ) : null}
          {isStrategy && !locked ? (
            <Collapse
              className="aside-collapse foundation-collapse"
              expandIconPlacement="end"
              items={[{ key: 'dayanak', label: 'Dayanak özeti', children: <Suspense fallback={<LoadingState cards={1} label="Dayanak özeti yükleniyor" />}><FoundationSummary plan={plan} compact /></Suspense> }]}
            />
          ) : null}
          {suggestions.length ? (
            <Card className="step-card suggest-card" variant="borderless" title="Önceki adımlardan öneriler" extra={<Tag>{suggestions.length} öneri</Tag>}>
              <p className="card-desc">Öneriler önceki adımlardaki cevaplarınızdan gelir. Öneri kendiliğinden kaydedilmez. "Alana yaz" düğmesine basarsanız öneri ilgili alana yazılır.</p>
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
          {step.id === LIMITS_STEP ? <SupportHint plan={plan} /> : null}
          {step.id === RESOURCES_STEP ? <SupportSummary planId={plan.id} /> : null}
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
                { key: 'durum', label: 'Bu adım', children: <StepProgress stats={stats} values={values} must={requiredKeys(step, plan, values)} /> },
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
              <StepProgress stats={stats} values={values} must={requiredKeys(step, plan, values)} />
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
                      /* Bölüm öteki sekmede ya da kapalı olabilir. Form bölümü açar ve ekrana getirir. */
                      setReveal((r) => ({ id: link.href.slice(1), n: (r?.n ?? 0) + 1 }))
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
          <Button className="bar-draft" disabled={locked} onClick={() => { if (editablePlan()) nav(stepPath(nextInDecision)) }}>Taslak bırak, ilerle</Button>
        ) : (
          <Button className="bar-draft" onClick={() => nav(gatePath)}>{isStrategy ? 'Strateji oluşturma özetine git' : 'Kontrole git'}</Button>
        )}
        <Button type="primary" disabled={locked} onClick={complete}>Adımı tamamla</Button>
      </div>

      <Modal open={skipOpen} title="Bu adımı atla" onCancel={() => setSkipOpen(false)} okText="Atla" cancelText="Vazgeç" okButtonProps={{ disabled: !skipReason.trim() }} onOk={() => { if (!editablePlan()) return; skipStep(step.id, skipReason.trim()); setSkipOpen(false); if (next) nav(stepPath(next)) }}>
        <div className="field">
          <label htmlFor="atlama-nedeni" className="field-label">Neden atlıyorsunuz? Neden rapora yazılır.</label>
          <Input.TextArea id="atlama-nedeni" rows={2} inputMode="text" enterKeyHint="enter" autoComplete="off" value={skipReason} onChange={(e) => setSkipReason(e.target.value)} />
        </div>
      </Modal>
    </div>
  )
}

/**
 * Doluluk halkası ve sayılar. Yüzde yalnız zorunlu bölümlerin alanlarından hesaplanır.
 * İsteğe bağlı bölümler yüzdeyi düşürmez. Sayıları ayrı satırda görünür.
 */
function StepProgress({ stats, values, must }: { stats: SectionStat[]; values: Record<string, unknown>; must: string[] }) {
  const core = stats.filter((x) => !x.optional)
  const extra = stats.filter((x) => x.optional)
  const total = core.reduce((s, x) => s + x.total, 0)
  const filled = core.reduce((s, x) => s + x.filled, 0)
  const extraTotal = extra.reduce((s, x) => s + x.total, 0)
  const extraFilled = extra.reduce((s, x) => s + x.filled, 0)
  const pct = total ? Math.round((filled / total) * 100) : 0
  const mustFilled = must.filter((k) => isFilled(values[k])).length
  return (
    <div className="step-progress">
      <Progress type="circle" percent={pct} size={88} strokeWidth={9} format={(p) => <span className="progress-text tabular">{p}%</span>} aria-label={`Doluluk yüzde ${pct}`} />
      <div className="step-progress-text">
        <strong>{filled} / {total} alan dolu</strong>
        {must.length ? <span className="helper">Zorunlu alan: {mustFilled} / {must.length} dolu</span> : <span className="helper">Bu adımda zorunlu alan yok.</span>}
        {extraTotal ? <span className="helper">İsteğe bağlı alan: {extraFilled} / {extraTotal} dolu</span> : null}
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
