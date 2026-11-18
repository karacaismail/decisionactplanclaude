import { useMemo, useState } from 'react'
import { Card, Grid, Progress, Statistic, Steps, Table, Tag, Timeline } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Link } from 'react-router'
import { CheckCircle, Flag, Question, XCircle } from '@phosphor-icons/react'
import { useCurrentPlan } from '@/store/planStore'
import { STEPS, stepPath, stepHeading } from '@/data/registry'
import { TRANSITION_LABEL, type PlanDoc, type TransitionRecord } from '@/data/types'
import { LEVELS, SUPPORTING_MIN, effectiveTransition, evaluateReadiness, lastTransition, transitionPassed, type ReadinessCriterion } from '@/engine/readiness'
import { formatDate } from '@/engine/format'
import { buildHandoffReport } from '@/reports/handoff'
import { Callout } from '@/components/Callout'
import { PageHeader } from '@/components/PageHeader'
import { TransitionPanel, TransitionTag } from '@/components/TransitionPanel'
import '@/styles/mobil-kapi.css'
import '@/styles/screens-kapi.css'
import '@/styles/screens-gecis.css'

const icon = (v: boolean | null) =>
  v === true ? (
    <span className="criterion-icon is-ok"><CheckCircle size={20} weight="fill" aria-label="Karşılandı" /></span>
  ) : v === false ? (
    <span className="criterion-icon is-harm"><XCircle size={20} weight="fill" aria-label="Karşılanmadı" /></span>
  ) : (
    <span className="criterion-icon is-muted"><Question size={20} aria-label="Ölçülmedi" /></span>
  )
const statusTag = (v: boolean | null) => (v === true ? <Tag color="success">Karşılandı</Tag> : v === false ? <Tag color="error">Karşılanmadı</Tag> : <Tag>Ölçülmedi</Tag>)

/** Koşullu kararın son tarihi geçti mi? */
const expired = (t: TransitionRecord) => t.outcome === 'kosullu' && effectiveTransition(t) === 'degil'
const dotClass = (t: TransitionRecord) => (t.stale || expired(t) ? 'is-hold' : t.outcome === 'degil' ? '' : 'is-ok')

/** Ölçütün dayandığı adıma bağlı kanıt sayısı. */
const evidenceCount = (plan: PlanDoc, step: string) => plan.evidence.filter((e) => e.linkedSteps.includes(step)).length

/**
 * Geçiş kapısı. Yazılım zorunlu ve destekleyici ölçütlere bakar, öneri üretir. Ölçüt sayıları motordan gelir.
 * Karar sahibi strateje devir raporunu okur ve kararı sağdaki panelden kaydeder.
 * Üstteki "Devir raporu" kartı raporun kaç başlığının dolu olduğunu gösterir. Sayı rapor ekranıyla aynıdır.
 */
export function TransitionScreen() {
  const plan = useCurrentPlan()
  const bp = Grid.useBreakpoint()
  const narrow = bp.md === false
  const [secondReader, setSecondReader] = useState('')
  const evaluation = useMemo(() => (plan ? evaluateReadiness(plan, { secondReader }) : null), [plan, secondReader])
  const report = useMemo(() => (plan ? buildHandoffReport(plan) : null), [plan])
  if (!plan || !evaluation || !report) return null

  const mandatoryTotal = evaluation.mandatory.length
  const supportingTotal = evaluation.supporting.length
  const mandatoryMissing = mandatoryTotal - evaluation.mandatoryMet
  const percent = Math.round((evaluation.mandatoryMet / mandatoryTotal) * 100)
  const level = LEVELS[evaluation.level] ?? LEVELS[0]
  const coverageTotal = report.coverage.length
  const coveragePercent = coverageTotal ? Math.round((report.coverageFilled / coverageTotal) * 100) : 0
  const last = lastTransition(plan)
  const history = [...(plan.transitions ?? [])].reverse()

  const criterionBody = (c: ReadinessCriterion) => {
    const step = STEPS[c.step]
    const n = evidenceCount(plan, c.step)
    const detail = (
      <>
        <span className="helper">{c.hint}</span>
        <span className="gecis-criterion-meta">
          <span>Dayanak: <Link className="kapi-action-link" tabIndex={0} to={stepPath(c.step)}>{step ? stepHeading(c.step) : 'Adım bulunamadı'}</Link></span>
          <span>{n > 0 ? `Bu adıma ${n} kanıt bağlı.` : 'Bu adıma bağlı kanıt yok.'}</span>
        </span>
      </>
    )
    // Karşılanan ölçüt tek satırdır; dayanağı istenince açılır. Eksik ölçüt açık gelir.
    return (
      <>
        <span className="gecis-criterion-head">
          <span className="gecis-criterion-id">{c.id}</span>
          {c.label}
        </span>
        {c.met === true ? (
          <details className="gecis-criterion-more">
            <summary>Dayanağı göster</summary>
            {detail}
          </details>
        ) : (
          detail
        )}
      </>
    )
  }
  const columns: ColumnsType<ReadinessCriterion> = narrow
    ? [
        {
          title: 'Ölçüt',
          key: 'olcut',
          render: (_, c) => (
            <div className="gecis-criterion-phone">
              {icon(c.met)}
              <div className="gecis-criterion">
                {criterionBody(c)}
                {statusTag(c.met)}
              </div>
            </div>
          ),
        },
      ]
    : [
        { title: 'Durum', key: 'ikon', width: 56, align: 'center', render: (_, c) => icon(c.met) },
        { title: 'Ölçüt ve dayanak adım', key: 'olcut', render: (_, c) => <div className="gecis-criterion">{criterionBody(c)}</div> },
        { title: 'Sonuç', key: 'sonuc', width: 140, render: (_, c) => statusTag(c.met) },
      ]
  const criteriaTable = (rows: ReadinessCriterion[], label: string) => (
    <div className="table-scroll">
      <Table<ReadinessCriterion> size="middle" pagination={false} rowKey="id" dataSource={rows} columns={columns} aria-label={label} />
    </div>
  )

  const historyItem = (t: TransitionRecord) => (
    <div className="tl-item">
      <div className="tl-head">
        <span className="gecis-history-tags">
          <TransitionTag outcome={t.outcome} />
          {t.stale ? <Tag color="warning">İnceleme bekliyor</Tag> : null}
          {expired(t) ? <Tag color="error">Süresi doldu</Tag> : null}
        </span>
        <span className="tl-date">{formatDate(t.decidedAt)}</span>
      </div>
      <p className="tl-reason">{t.reason}</p>
      <div className="tl-notes">
        <span>Karar sahibi: {t.decidedBy}</span>
        {t.secondOpinion ? <span>İkinci okur: {t.secondOpinion}</span> : null}
        <span className="tabular">Zorunlu ölçüt {t.mandatoryMet} / {t.mandatoryTotal}. Destekleyici ölçüt {t.supportingMet} / {t.supportingTotal}. Seviye {t.level} / 5.</span>
        {t.suggested !== t.outcome ? <span>Yazılımın önerisi "{TRANSITION_LABEL[t.suggested]}" idi.</span> : null}
        {t.conditional ? (
          <>
            <span>Planlanacak konu: {t.conditional.topic}</span>
            <span>Açık soru: {t.conditional.openQuestion}</span>
            <span>Sorumlu: {t.conditional.owner}</span>
            <span>Son tarih: {formatDate(t.conditional.deadline)}</span>
          </>
        ) : null}
      </div>
    </div>
  )

  return (
    <div className="page mobil-kapi-page gecis-page">
      <PageHeader
        newPath="/gecis"
        kicker="Geçiş kapısı"
        title="Stratejik planlamaya hazır mısınız?"
        documentTitle="Geçiş kapısı"
        description="Yazılım öneri üretir. Kararı siz verir ve kaydedersiniz."
      />

      <div className="gecis-stats" role="group" aria-label="Hazırlık özeti">
        <Card className="k-card stat-card" variant="borderless">
          <Statistic title="Zorunlu ölçüt" value={evaluation.mandatoryMet} suffix={`/ ${mandatoryTotal}`} />
          <Progress percent={percent} showInfo={false} size="small" aria-label={`Zorunlu ölçütlerin ${mandatoryTotal} tanesinden ${evaluation.mandatoryMet} tanesi karşılandı`} />
          <span className="stat-note">{mandatoryMissing === 0 ? 'Zorunlu ölçütlerin hepsi tamam.' : `${mandatoryMissing} zorunlu ölçüt eksik.`}</span>
        </Card>
        <Card className="k-card stat-card" variant="borderless">
          <Statistic title="Destekleyici ölçüt" value={evaluation.supportingMet} suffix={`/ ${supportingTotal}`} />
          <Progress percent={Math.round((evaluation.supportingMet / supportingTotal) * 100)} showInfo={false} size="small" aria-label={`Destekleyici ölçütlerin ${supportingTotal} tanesinden ${evaluation.supportingMet} tanesi karşılandı`} />
          <span className="stat-note">En az {SUPPORTING_MIN} ölçüt gerekir.</span>
        </Card>
        <Card className="k-card stat-card" variant="borderless">
          <Statistic title="Doğrulama seviyesi" value={evaluation.level} suffix="/ 5" />
          <Progress percent={evaluation.level * 20} showInfo={false} size="small" aria-label={`Doğrulama seviyesi 5 üzerinden ${evaluation.level}`} />
          <span className="stat-note">{level.title}</span>
        </Card>
        <Card className="k-card stat-card" variant="borderless">
          <Statistic title="Devir raporu" value={report.coverageFilled} suffix={`/ ${coverageTotal}`} />
          <Progress percent={coveragePercent} showInfo={false} size="small" aria-label={`Devir raporunun ${coverageTotal} başlığından ${report.coverageFilled} tanesi dolu`} />
          <span className="stat-note">
            <span className="tabular">{report.coverageFilled} / {coverageTotal} başlık dolu.</span> <Link className="kapi-action-link" tabIndex={0} to="/devir">Raporu aç</Link>
          </span>
        </Card>
        <Card className="k-card ring-card" variant="borderless">
          <div className="ring-copy">
            <strong>Zorunlu ölçüt yüzdesi</strong>
            <span>{evaluation.mandatoryMet} / {mandatoryTotal} karşılandı</span>
          </div>
          <Progress type="circle" percent={percent} size={88} format={(p) => `%${Math.round(p ?? 0)}`} aria-label={`Zorunlu ölçütlerin yüzde ${percent} kadarı karşılandı`} />
        </Card>
      </div>

      <Card className="k-card" variant="borderless" title="Doğrulama seviyesi" extra={<span>Seviye {evaluation.level} / 5. {level.title}.</span>}>
        <Steps
          className="k-steps"
          size="small"
          current={evaluation.level}
          orientation={bp.xl ? 'horizontal' : 'vertical'}
          titlePlacement={bp.xl ? 'vertical' : 'horizontal'}
          items={LEVELS.map((l) => ({ title: l.title, content: l.description, status: l.level <= evaluation.level ? ('finish' as const) : ('wait' as const) }))}
        />
      </Card>

      {last ? (
        <Callout tone={last.stale || expired(last) ? 'uyari' : 'bilgi'} title={`Son karar: ${formatDate(last.decidedAt)}`}>
          <div className="history-notes">
            <span className="gecis-history-tags">
              <TransitionTag outcome={last.outcome} />
              {last.stale ? <Tag color="warning">İnceleme bekliyor</Tag> : null}
              {expired(last) ? <Tag color="error">Süresi doldu</Tag> : null}
            </span>
            {last.stale ? <span>Bu kararın dayandığı veri sonradan değişti. Strateji oluşturma kapalıdır. Kararı yeniden kaydedin.</span> : null}
            {!last.stale && expired(last) ? <span>Koşullu kararın son tarihi geçti. Sonuç "Henüz hazır değil" sayılır. Kararı yeniden kaydedin.</span> : null}
            {transitionPassed(plan) ? <span>Strateji oluşturma açık. <Link className="kapi-action-link" tabIndex={0} to="/strateji">Strateji oluşturmaya gidin.</Link></span> : null}
            {!last.stale && last.outcome === 'degil' ? <span>Strateji oluşturma kapalıdır. Eksik kanıtı tamamlayın, sonra kararı yeniden kaydedin.</span> : null}
          </div>
        </Callout>
      ) : null}

      <div className="gecis-grid">
        <div className="gecis-main">
          <Card className="k-card" variant="borderless" title="Zorunlu ölçütler" extra={<span className="tabular">{evaluation.mandatoryMet} / {mandatoryTotal} karşılandı</span>}>
            <p className="helper" style={{ margin: 0 }}>Bir zorunlu ölçüt eksikse sonuç "Henüz hazır değil" olur.</p>
            {criteriaTable(evaluation.mandatory, 'Zorunlu ölçütler')}
          </Card>
          <Card className="k-card" variant="borderless" title="Destekleyici ölçütler" extra={<span className="tabular">{evaluation.supportingMet} / {supportingTotal} karşılandı</span>}>
            <p className="helper" style={{ margin: 0 }}>En az {SUPPORTING_MIN} destekleyici ölçüt gerekir. Daha azı sonucu "Koşullu hazır" yapar.</p>
            {criteriaTable(evaluation.supporting, 'Destekleyici ölçütler')}
          </Card>
        </div>

        <div className="gecis-aside">
          <p className="gecis-question">
            <span className="gecis-question-label">Masadaki karar:</span>
            <span className="gecis-question-text">{report.question}</span>
          </p>
          <Card className="k-card" variant="borderless" title="Kararı kaydedin" extra={<span>Raporu okuyun, sonra sonucu seçin.</span>}>
            <TransitionPanel plan={plan} evaluation={evaluation} secondReader={secondReader} onSecondReaderChange={setSecondReader} />
          </Card>
        </div>
      </div>

      {history.length > 0 ? (
        <Card className="k-card" variant="borderless" title="Önceki geçiş kararları" extra={<span>{history.length} kayıt. Son kayıt geçerlidir.</span>}>
          <Timeline
            className="k-timeline gecis-timeline"
            items={history.map((t) => ({ key: t.id, icon: <span className={`tl-dot ${dotClass(t)}`.trim()}><Flag size={16} weight="fill" aria-hidden /></span>, content: historyItem(t) }))}
          />
        </Card>
      ) : null}
    </div>
  )
}
