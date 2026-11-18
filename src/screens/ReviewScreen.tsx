import '@/styles/desen/note.css'
import '@/styles/desen/k-card.css'
import '@/styles/desen/kapi-ortak.css'
import '@/styles/desen/stat-card.css'
import '@/styles/desen/ring-card.css'
import '@/styles/desen/table-scroll.css'
import '@/styles/desen/k-form.css'
import '@/styles/desen/k-result.css'
import '@/styles/desen/kapi.css'
import '@/styles/desen/mobil-kapi-page.css'
import '@/styles/ekran/ReviewScreen.css'
import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Checkbox, Form, Grid, Input, Progress, Result, Select, Statistic, Steps, Switch, Table, Tag, Tooltip, App as AntApp } from 'antd'
import { Link, useNavigate, useParams } from 'react-router'
import { CheckCircle, XCircle, Question, CaretDown, Info, ArrowRight } from '@phosphor-icons/react'
import { usePlanStore, useCurrentPlan } from '@/store/planStore'
import { decisionOf, stepsOf, STEPS, stepHeading } from '@/data/registry'
import type { GateCriterion, StepDef } from '@/data/schema'
import { evaluateGate, lastDecision, effectiveOutcome } from '@/engine/gate'
import { OutcomePanel, type OutcomeDraft } from '@/components/OutcomePanel'
import { DecisionBadge } from '@/components/DecisionBadge'
import { Callout } from '@/components/Callout'
import { PageHeader } from '@/components/PageHeader'
import { OUTCOME_LABEL, type Outcome } from '@/data/types'
import { formatDate, formatMoney } from '@/engine/format'
import { openReviews } from '@/engine/changes'
import { OUTCOME_PRIORITY } from '@/engine/gate'
interface RuleRow { condition: string; outcome: Outcome; note?: string }
interface CriterionRow { key: string; c: GateCriterion; value: boolean | null; step?: StepDef }

/**
 * Ölçütün dayandığı adım. Ölçüt tanımı adım kimliğini ayrıca taşımaz;
 * denetim işlevinin kaynağındaki adım kimlikleri okunur. Bulunamazsa kararın ilk adımı gösterilir.
 */
function basisStep(c: GateCriterion, n: number): StepDef | undefined {
  const ids = Array.from(c.check.toString().matchAll(/['"](\d{2})['"]/g)).map((m) => m[1])
  const found = ids.map((id) => STEPS[id]).find((s): s is StepDef => Boolean(s) && s.decision <= n)
  return found ?? stepsOf(n)[0]
}

const OUTCOME_FILTERS = OUTCOME_PRIORITY.map((o) => ({ text: OUTCOME_LABEL[o], value: o }))

export function ReviewScreen() {
  const { n } = useParams()
  const nav = useNavigate()
  const { message } = AntApp.useApp()
  const bp = Grid.useBreakpoint()
  const narrow = bp.md === false
  const plan = useCurrentPlan()
  const recordDecision = usePlanStore((s) => s.recordDecision)
  const addTask = usePlanStore((s) => s.addTask)
  const setLocation = usePlanStore((s) => s.setLocation)
  const reviewChange = usePlanStore((s) => s.reviewChange)
  const [harm, setHarm] = useState(false)
  const [reviewer, setReviewer] = useState('')
  const [permitMissing, setPermitMissing] = useState(false)
  const [onlyMissing, setOnlyMissing] = useState(false)
  const [outcomeFilter, setOutcomeFilter] = useState<Outcome | undefined>()
  const [draft, setDraft] = useState<OutcomeDraft | null>(null)
  const [saved, setSaved] = useState<{ to: string; label: string } | null>(null)
  const d = decisionOf(Number(n))
  /* Kontrol değişince ekran durumu sıfırlanır. Aynı bileşen farklı kontroller için kullanılır. */
  useEffect(() => {
    setSaved(null)
    setDraft(null)
    setHarm(false)
    setPermitMissing(false)
    setOnlyMissing(false)
    setOutcomeFilter(undefined)
  }, [n])
  const evaluation = useMemo(() => (plan && d ? evaluateGate(d.gate, plan, { harm, permitMissing }) : null), [plan, d, harm, permitMissing])
  if (!plan || !d || !evaluation) return null
  const last = lastDecision(plan, d.n)
  const single = plan.profile.team !== 'ekip'
  const pending = openReviews(plan)
  const { monthlyBurnKurus, cashKurus } = plan.limits
  const runway = monthlyBurnKurus && cashKurus ? Math.floor(cashKurus / monthlyBurnKurus) : null
  const percent = evaluation.total > 0 ? Math.round((evaluation.metCount / evaluation.total) * 100) : 0

  const saveReview = (id: string) => {
    const error = reviewChange(id, reviewer)
    if (error) message.error(error)
    else message.success('Görüş kaydedildi.')
  }
  const changeValue = (key: string, v: unknown): string => {
    if (v === null || v === undefined || v === '') return 'Boş'
    if (key.endsWith('Kurus')) return formatMoney(Number(v))
    if (key === 'deadline') return formatDate(String(v), false)
    if (Array.isArray(v)) return `${v.length} kural`
    return String(v)
  }

  const save = (draft: OutcomeDraft) => {
    const id = recordDecision(
      {
        gate: d.n,
        scope: d.question,
        criteria: d.gate.criteria.map((c) => ({ id: c.id, label: c.label, met: evaluation.criteria[c.id] })),
        suggested: evaluation.suggested,
        chosen: draft.chosen,
        reason: draft.reason,
        counterView: draft.counterView || undefined,
        secondOpinion: draft.secondOpinion || undefined,
        conditional: draft.chosen === 'kosulluIlerle' && draft.conditional ? { ...draft.conditional, issuedAt: new Date().toISOString() } : undefined,
        retriesLeft: evaluation.retriesLeft - (draft.chosen === 'yenidenDene' ? 1 : 0),
        decidedBy: draft.decidedBy,
        reopenWhen: draft.reopenWhen || undefined,
      },
      `Kontrol ${d.n}: ${OUTCOME_LABEL[draft.chosen]}`,
    )
    if (draft.chosen === 'kosulluIlerle' && draft.conditional) {
      addTask({ action: `Koşullu iş: ${draft.conditional.scope}. Kapanış kanıtı: ${draft.conditional.closingEvidence}`, sourceDecisionId: id, owner: draft.conditional.owner, dueDate: draft.conditional.deadline, status: 'acik' })
    }
    if (draft.chosen === 'beklet') addTask({ action: `Kontrol ${d.n} bekliyor. İzlenecek olay: ${draft.reopenWhen || 'yazılmadı'}`, sourceDecisionId: id, owner: draft.decidedBy, status: 'acik' })
    if (draft.chosen === 'yenidenDene') addTask({ action: `Kontrol ${d.n} için küçük deneme. Eksik ölçütü ölçün.`, sourceDecisionId: id, owner: draft.decidedBy, status: 'acik' })
    if (draft.chosen === 'yonDegistir') addTask({ action: `Yön değişikliği. Etkilenen ilk adıma dönün. Gerekçe: ${draft.reason}`, sourceDecisionId: id, owner: draft.decidedBy, status: 'acik' })
    message.success('Karar günlüğüne yazıldı. Yeni sürüm alındı.')
    const advancing = draft.chosen === 'ilerle' || draft.chosen === 'kosulluIlerle'
    const to = advancing ? (d.n < 8 ? `/karar/${d.n + 1}` : '/ciktilar') : '/ozet'
    const label = advancing ? (d.n < 8 ? 'Sonraki karara git' : 'Çıktılara git') : 'Plan özetine git'
    setLocation(to)
    setSaved({ to, label })
  }

  const icon = (v: boolean | null) =>
    v === true ? (
      <span className="criterion-icon is-ok"><CheckCircle size={20} weight="fill" aria-label="Karşılandı" /></span>
    ) : v === false ? (
      <span className="criterion-icon is-harm"><XCircle size={20} weight="fill" aria-label="Karşılanmadı" /></span>
    ) : (
      <span className="criterion-icon is-muted"><Question size={20} aria-label="Ölçülmedi" /></span>
    )
  const statusTag = (v: boolean | null) => (v === true ? <Tag color="success">Karşılandı</Tag> : v === false ? <Tag color="error">Karşılanmadı</Tag> : <Tag>Ölçülmedi</Tag>)
  const criterionLabel = (c: GateCriterion) => (
    <span className="criterion-label">
      <span>{c.label}</span>
      {c.hint ? (
        <Tooltip title={c.hint} trigger={['hover', 'focus', 'click']}>
          <button type="button" className="hint-icon" aria-label={`İpucu: ${c.hint}`}><Info size={16} aria-hidden /></button>
        </Tooltip>
      ) : null}
    </span>
  )
  const stepLink = (s?: StepDef) => (s ? <Link className="kapi-action-link" tabIndex={0} to={`/karar/${s.decision}/adim/${s.id}`}>{stepHeading(s.id)}</Link> : <span className="helper">Adım yok</span>)

  const criteriaRows: CriterionRow[] = d.gate.criteria
    .map((c) => ({ key: c.id, c, value: evaluation.criteria[c.id], step: basisStep(c, d.n) }))
    .filter((r) => !onlyMissing || r.value !== true)

  const rows: RuleRow[] = [
    { condition: 'Ciddi zarar tehlikesi var', outcome: 'durdur', note: 'Etkilenen işi güvenli biçimde kapatın.' },
    { condition: 'Gerekli izin veya yetki eksik', outcome: 'beklet', note: 'İzne bağlı işi açmayın. Yüksek satış beklentisi bu engeli kaldırmaz.' },
    ...d.gate.rows,
  ]
  const matched = (r: RuleRow) => evaluation.matchedRow?.condition === r.condition
  const phoneRows = outcomeFilter ? rows.filter((r) => r.outcome === outcomeFilter) : rows

  /* Kayıt adımı: 0 sonucu seçin, 1 gerekçeyi yazın, 2 kaydedin, 3 bitti. */
  const stepCurrent = saved ? 3 : draft && draft.reason.trim() && draft.decidedBy.trim() ? 2 : draft && (draft.reason.trim() || draft.decidedBy.trim() || draft.chosen !== evaluation.suggested) ? 1 : 0

  return (
    <div className="page mobil-kapi-page kapi-page">
      <PageHeader
        kicker={`Karar ${d.n}. ${d.title}`}
        title={`Kontrol ${d.n}. ${d.gate.title}`}
        documentTitle={`Kontrol ${d.n}`}
        description={<>Hangi işe karar veriyoruz? {d.question}</>}
      />

      <div className="stat-grid has-ring" role="group" aria-label="Kontrol özeti">
        <Card className="k-card stat-card" variant="borderless">
          <Statistic title="Karşılanan ölçüt" value={evaluation.metCount} suffix={`/ ${evaluation.total}`} />
          <span className="stat-note">{evaluation.metCount === evaluation.total && evaluation.total > 0 ? 'Bütün ölçütler tamam.' : 'Eksik ölçütler aşağıda kırmızı işaretli.'}</span>
        </Card>
        <Card className="k-card stat-card" variant="borderless">
          <Statistic title="Ölçülmeyen ölçüt" value={evaluation.unknownCount} />
          <span className="stat-note">{evaluation.unknownCount > 0 ? 'Ölçülmeyen ölçüt küçük bir deneme ister.' : 'Her ölçüt ölçüldü.'}</span>
        </Card>
        <Card className="k-card stat-card" variant="borderless">
          <Statistic title="Kalan deneme hakkı" value={evaluation.retriesLeft} suffix={`/ ${Math.min(plan.limits.retriesPerDecision ?? d.gate.maxRetries, d.gate.maxRetries)}`} />
          <span className="stat-note">{evaluation.retriesLeft > 0 ? '"Yeniden dene" bir hak düşürür.' : 'Bu kontrolde deneme hakkı bitti.'}</span>
        </Card>
        <Card className="k-card stat-card" variant="borderless">
          <Statistic title="Kasa süresi" value={runway !== null ? runway : 'Hesaplanmadı'} suffix={runway !== null ? 'ay' : undefined} />
          <span className="stat-note">{runway !== null ? 'Eldeki para bu kadar ay dayanır.' : 'Adım 02 sınırları dolunca hesaplanır.'}</span>
        </Card>
        <Card className="k-card ring-card is-wide" variant="borderless">
          <div className="ring-copy">
            <strong>Ölçüt yüzdesi</strong>
            <span>{evaluation.metCount} / {evaluation.total} karşılandı</span>
          </div>
          <Progress type="circle" percent={percent} size={88} format={(p) => `%${Math.round(p ?? 0)}`} aria-label={`Ölçütlerin yüzde ${percent} kadarı karşılandı`} />
        </Card>
      </div>

      {last ? (
        <Callout tone={last.stale ? 'uyari' : 'bilgi'} title={`Son kayıt: ${formatDate(last.decidedAt)}`}>
          <div className="history-notes">
            <span className="history-meta">
              <DecisionBadge outcome={effectiveOutcome(last)} />
              {last.stale ? <span className="tag is-hold">İnceleme bekliyor</span> : null}
            </span>
            <span>{last.reason}</span>
            {last.stale ? <span>Bu kararın dayandığı veri sonradan değişti. Kontrol geçilmiş sayılmaz. Kararı yeniden kaydedin.</span> : null}
          </div>
        </Callout>
      ) : null}

      {pending.length > 0 ? (
        <Card className="k-card" variant="borderless" title="İkinci görüş bekleyen değişiklikler" extra={<span>{pending.length} değişiklik</span>}>
          <p className="helper" style={{ margin: 0 }}>Tek kurucu sınırı artırdı. Konuyu bilen başka bir kişi görüş yazmadan "İlerle" ve "Koşullu ilerle" kaydedilmez.</p>
          <ul className="row-list">
            {pending.map((c) => (
              <li key={c.id}>
                <div className="row">
                  <span className="grow"><strong>{c.label}</strong>: {changeValue(c.key, c.before)} yerine {changeValue(c.key, c.after)}.</span>
                  <span className="helper">{formatDate(c.at)}</span>
                </div>
              </li>
            ))}
          </ul>
          <Form className="k-form" layout="vertical" requiredMark={false} style={{ maxWidth: 360 }}>
            <Form.Item label="İnceleyen kişi" htmlFor="inceleyen" extra="Kararı veren kurucu olamaz.">
              <Input id="inceleyen" value={reviewer} onChange={(e) => setReviewer(e.target.value)} placeholder="Ad Soyad" />
            </Form.Item>
          </Form>
          <div className="toolbar-group">
            {pending.map((c) => (
              <Button key={c.id} disabled={!reviewer.trim()} onClick={() => saveReview(c.id)}>
                Görüşü kaydet: {c.label}
              </Button>
            ))}
          </div>
        </Card>
      ) : null}

      <div className="kapi-grid">
        <div className="kapi-main">
          <Card className="k-card" variant="borderless" title="Önce zarar ve izin" extra={<span>Bu iki soru ölçütlerden önce gelir.</span>}>
            <div className="switch-list">
              <div className="switch-row">
                <div className="switch-row-text">
                  <span className="switch-row-title" id="zarar-baslik">Ciddi zarar tehlikesi var</span>
                  <span className="switch-row-desc" id="zarar-aciklama">Etkilenen iş durdurulmalı. Açıkken yalnız "Durdur" seçilebilir.</span>
                </div>
                <label className="kapi-switch-target" htmlFor="zarar-anahtar">
                  <Switch id="zarar-anahtar" tabIndex={0} checked={harm} onChange={setHarm} aria-labelledby="zarar-baslik" aria-describedby="zarar-aciklama" />
                </label>
              </div>
              <div className="switch-row">
                <div className="switch-row-text">
                  <span className="switch-row-title" id="izin-baslik">Gerekli izin veya yetki eksik</span>
                  <span className="switch-row-desc" id="izin-aciklama">İzne bağlı iş açılmamalı. Açıkken öneri "Beklet" olur.</span>
                </div>
                <label className="kapi-switch-target" htmlFor="izin-anahtar">
                  <Switch id="izin-anahtar" tabIndex={0} checked={permitMissing} onChange={setPermitMissing} aria-labelledby="izin-baslik" aria-describedby="izin-aciklama" />
                </label>
              </div>
            </div>
          </Card>

          <Card
            className="k-card"
            variant="borderless"
            title="Ölçütler"
            extra={<Checkbox checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)}>Yalnız eksikleri göster</Checkbox>}
          >
            <div className="table-scroll">
              <Table<CriterionRow>
                size="middle"
                pagination={false}
                rowKey="key"
                dataSource={criteriaRows}
                locale={{ emptyText: 'Bütün ölçütler karşılandı.' }}
                columns={
                  narrow
                    ? [
                        {
                          title: 'Ölçüt',
                          key: 'olcut',
                          render: (_, r) => (
                            <div className="cell-stack">
                              <span className="cell-head">
                                <span className="cell-title" style={{ display: 'inline-flex', gap: 8, alignItems: 'flex-start' }}>{icon(r.value)}{criterionLabel(r.c)}</span>
                                {statusTag(r.value)}
                              </span>
                              <span className="cell-line"><span>Dayanak:</span> {stepLink(r.step)}</span>
                            </div>
                          ),
                        },
                      ]
                    : [
                        { title: 'Durum', key: 'ikon', width: 56, align: 'center', render: (_, r) => icon(r.value) },
                        {
                          title: 'Ölçüt ve dayanak adım',
                          key: 'etiket',
                          render: (_, r) => (
                            <div className="cell-stack">
                              {criterionLabel(r.c)}
                              <span className="cell-line"><span>Dayanak:</span> {stepLink(r.step)}</span>
                            </div>
                          ),
                        },
                        { title: 'Sonuç', key: 'sonuc', width: 150, render: (_, r) => statusTag(r.value) },
                      ]
                }
              />
            </div>
            <span className="helper tabular">{evaluation.metCount} / {evaluation.total} ölçüt karşılandı. {evaluation.unknownCount} ölçüt ölçülmedi.</span>
          </Card>

          <Card className="k-card" variant="borderless" title="Koşula göre sonuç" extra={<span>Üstteki satır önce gelir.</span>}>
            {narrow ? (
              <div className="outcome-table">
                <Select<Outcome>
                  allowClear
                  placeholder="Sonuca göre süz"
                  aria-label="Sonuca göre süz"
                  value={outcomeFilter}
                  onChange={(v) => setOutcomeFilter(v)}
                  options={OUTCOME_PRIORITY.map((o) => ({ value: o, label: OUTCOME_LABEL[o] }))}
                  style={{ width: '100%' }}
                />
                <ul className="outcome-list">
                  {phoneRows.map((r) => (
                    <li key={r.condition}>
                      <details className={`outcome-row${matched(r) ? ' is-matched' : ''}`}>
                        <summary>
                          <span className="outcome-condition">{r.condition}</span>
                          <DecisionBadge outcome={r.outcome} />
                          <span className="outcome-caret" aria-hidden><CaretDown size={16} /></span>
                        </summary>
                        <p className="outcome-note">{r.note ?? 'Bu satır için ek not yok.'}</p>
                      </details>
                    </li>
                  ))}
                </ul>
                <span className="helper">Satıra dokununca not açılır.</span>
              </div>
            ) : (
              <div className="outcome-table">
                <div className="table-scroll">
                  <Table<RuleRow>
                    size="middle"
                    pagination={false}
                    rowKey={(r) => r.condition}
                    dataSource={rows}
                    rowClassName={(r) => (matched(r) ? 'is-matched' : '')}
                    columns={[
                      { title: 'Koşul', dataIndex: 'condition', width: '40%', render: (t: string, r) => <span className="history-meta" style={{ fontWeight: matched(r) ? 600 : 400 }}>{t}{matched(r) ? <Tag>Uyuyor</Tag> : null}</span> },
                      { title: 'Sonuç', dataIndex: 'outcome', width: 180, filters: OUTCOME_FILTERS, onFilter: (v, r) => r.outcome === v, render: (o: Outcome) => <DecisionBadge outcome={o} /> },
                      { title: 'Not', dataIndex: 'note', render: (t?: string) => t ?? <span className="helper">Ek not yok.</span> },
                    ]}
                  />
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="kapi-aside">
          <Card className="k-card" variant="borderless" title="Kararı kaydedin" extra={<span>Öneriyi seçin ya da gerekçeyle değiştirin.</span>}>
            <Steps
              className="k-steps"
              size="small"
              current={stepCurrent}
              orientation={narrow ? 'vertical' : 'horizontal'}
              titlePlacement={narrow ? 'horizontal' : 'vertical'}
              items={[
                { title: 'Sonucu seçin', content: 'Öneri işaretli gelir.' },
                { title: 'Gerekçeyi yazın', content: 'Karar sahibini de yazın.' },
                { title: 'Kaydedin', content: 'Yeni sürüm alınır.' },
              ]}
            />
            {saved ? (
              <Result
                className="k-result"
                status="success"
                icon={<CheckCircle size={56} weight="fill" aria-hidden />}
                title="Karar kaydedildi"
                subTitle={`Kontrol ${d.n} için karar günlüğüne yazıldı. Yeni sürüm alındı.`}
                extra={
                  <Button type="primary" icon={<ArrowRight size={16} />} iconPlacement="end" onClick={() => nav(saved.to)}>
                    {saved.label}
                  </Button>
                }
              />
            ) : (
              <OutcomePanel key={`${d.n}-${plan.decisions.length}`} evaluation={evaluation} onSave={save} onChange={setDraft} singleFounder={single} plan={plan} def={d.gate} harm={harm} />
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
