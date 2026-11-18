import '@/styles/desen/page-karar.css'
import '@/styles/desen/kapi.css'
import '@/styles/desen/mobil-kapi-page.css'
import '@/styles/desen/page-strateji.css'
import '@/styles/desen/strateji.css'
import '@/styles/ekran/StrategyContent.css'
import { useMemo } from 'react'
import { Button, Card, Descriptions, Result, Tag } from 'antd'
import { ArrowLeft, ArrowRight, CheckCircle, Circle } from '@phosphor-icons/react'
import { Link, useNavigate } from 'react-router'
import { useCurrentPlan } from '@/store/planStore'
import { STRATEGY, STRATEGY_N } from '@/data/decisions'
import { stepHeading, stepPath, stepsOf } from '@/data/registry'
import { clusterOf, SUB_STAGE_LABEL } from '@/data/clusters'
import { strategyReopened } from '@/engine/renewal'
import { DOSSIER_STEP } from '@/engine/strategy'
import { SubStageList } from '@/components/SubStageList'
import { TRANSITION_LABEL, type TransitionOutcome } from '@/data/types'
import { strategyDone, decisionLocked, lockReason } from '@/engine/gate'
import { effectiveTransition, lastTransition } from '@/engine/readiness'
import { formatDate } from '@/engine/format'
import { buildHandoffReport } from '@/reports/handoff'
import { Callout } from '@/components/Callout'
import { PageHeader } from '@/components/PageHeader'
import { PathCompare } from '@/components/PathCompare'
const OUTCOME_COLOR: Record<TransitionOutcome, string | undefined> = { hazir: 'success', kosullu: 'warning', degil: undefined }

/**
 * Strateji oluşturma. İkinci ana kümedir. Beş zorunlu alt aşaması ve bir çıkış kapısı vardır.
 * Alt aşamalar `clusters.ts` dosyasından, adımlar `stepsOf` ile veriden gelir.
 * Küme, geçiş kapısı kararı olmadan kilitlidir.
 * Ekran stratej'in okuma sırasıyla dizilir: önündeki karar, ilk günü, yol adayları, alt aşamalar, çıkış kapısı.
 * Telefonda tek sütundur ve geçiş kararı en üsttedir. Masaüstünde geçiş kararı sağ sütundadır.
 * Ekranda en çok bir dolu düğme vardır: sıradaki adımı açar. Kilitliyken dolu düğme yoktur.
 * Yazılım yol seçmez. Yol adayları tablosu hiçbir yolu öne çıkarmaz.
 */
export function StrategyScreen() {
  const plan = useCurrentPlan()
  const nav = useNavigate()
  const report = useMemo(() => (plan ? buildHandoffReport(plan) : null), [plan])
  if (!plan || !report) return null

  const locked = decisionLocked(plan, STRATEGY_N)
  const reason = lockReason(plan, STRATEGY_N)
  const last = lastTransition(plan)
  const expired = last ? effectiveTransition(last) !== last.outcome : false
  const cluster = clusterOf('olusturma')
  const steps = stepsOf(STRATEGY_N)
  const isDone = (id: string) => plan.steps[id]?.status === 'tamam'
  const next = steps.find((s) => !isDone(s.id))
  const doneStages = cluster.subStages.filter((x) => x.state(plan) === 'tamam').length
  const reopened = strategyReopened(plan)
  const reopenRecord = [...(plan.strategyReviews ?? [])].reverse().find((r) => r.decision === 'yenidenAc')
  const dossierDone = isDone(DOSSIER_STEP)
  /* Bitiş kuralı motordadır. Kilit, pano ve bu ekran aynı kurala bakar. */
  const criteria = STRATEGY.gate.criteria.map((c) => ({ label: c.label, met: c.check(plan) === true }))
  const allDone = !locked && strategyDone(plan) && !reopened && !next
  const missing = criteria.filter((c) => !c.met)

  const action = locked ? (
    <Button icon={<ArrowLeft size={16} />} onClick={() => nav('/gecis')}>
      Geçiş kapısına git
    </Button>
  ) : next ? (
    <Button type="primary" icon={<ArrowRight size={16} />} iconPlacement="end" onClick={() => nav(stepPath(next.id))}>
      Sıradaki adım: {stepHeading(next.id)}
    </Button>
  ) : null

  return (
    <div className="page mobil-kapi-page page-karar page-strateji">
      <PageHeader newPath="/strateji" kicker="Strateji oluşturma" title={STRATEGY.question} description={STRATEGY.intro} documentTitle={STRATEGY.title} actions={action} />

      {locked ? (
        <Callout tone="uyari" title="Strateji oluşturma kilitli">
          {reason} Adımları inceleyebilirsiniz. Adımları doldurmak için önce geçiş kapısında karar kaydedin.
        </Callout>
      ) : null}

      {reopened && reopenRecord ? (
        <Callout tone="uyari" title="Strateji yeniden açıldı">
          Karar sahibi {reopenRecord.decidedBy} bu kararı {formatDate(reopenRecord.decidedAt)} kaydetti. Gerekçe şudur: {/[.?!]$/.test(reopenRecord.reason) ? reopenRecord.reason : `${reopenRecord.reason}.`} Alt aşamaları yeniden gözden geçirin. Sonra strateji belgesini yeniden onaylayın. Strateji uygulama bu sırada eski seçimle sürer.
        </Callout>
      ) : null}
      {plan.legacyStrategy && !reopened && !criteria.every((c) => c.met) ? (
        <Callout tone="bilgi" title="Bu plan eski sürümde tamamlandı">
          Bu planın stratejisi eski sürümde iki adımla tamamlandı. Bu yüzden strateji uygulama açık kalır. Yeni alt aşamalar boş görünür. Doldurursanız strateji belgesi güçlenir.
        </Callout>
      ) : null}

      <div className="strateji-grid">
        <aside className="strateji-aside" aria-label="Geçiş kararı">
          <Card title="Geçiş kararı" extra={<Link className="kapi-action-link" tabIndex={0} to="/gecis">Geçiş kapısını aç</Link>}>
            {last ? (
              <>
                <div className="strateji-outcome">
                  <Tag color={OUTCOME_COLOR[last.outcome]}>{TRANSITION_LABEL[last.outcome]}</Tag>
                  <span className="helper">{formatDate(last.decidedAt)}</span>
                </div>
                {last.stale ? (
                  <Callout tone="uyari" title="Karar eskidi">
                    Karardan sonra dayanak değişti. Geçiş kapısında yeniden karar kaydedin.
                  </Callout>
                ) : null}
                {expired ? (
                  <Callout tone="uyari" title="Koşulun süresi doldu">
                    Açık sorunun son tarihi geçti. Karar bugün "{TRANSITION_LABEL.degil}" sayılır.
                  </Callout>
                ) : null}
                <Descriptions
                  className="karar-desc"
                  column={1}
                  colon={false}
                  layout="vertical"
                  items={[
                    { key: 'gerekce', label: 'Gerekçe', children: last.reason || 'Yazılmadı' },
                    { key: 'sahip', label: 'Karar sahibi', children: last.decidedBy || 'Yazılmadı' },
                    { key: 'tarih', label: 'Karar tarihi', children: formatDate(last.decidedAt) },
                    ...(last.conditional
                      ? [
                          { key: 'konu', label: 'Planlanacak konu', children: last.conditional.topic },
                          { key: 'soru', label: 'Açık soru', children: last.conditional.openQuestion },
                          { key: 'sorumlu', label: 'Açık sorunun sorumlusu', children: last.conditional.owner },
                          { key: 'son', label: 'Son tarih', children: formatDate(last.conditional.deadline) },
                        ]
                      : []),
                  ]}
                />
              </>
            ) : (
              <p className="strateji-empty">Geçiş kararı henüz kaydedilmedi. Karar, geçiş kapısında kaydedilir.</p>
            )}
          </Card>
        </aside>

        <div className="strateji-main">
          {!locked && !allDone && !next && missing.length > 0 ? (
            <Callout tone="uyari" title="Strateji oluşturma henüz bitmedi">
              Adımlar tamam görünüyor ama şu koşullar eksik: {missing.map((m) => m.label).join(' ')} Strateji uygulama bu koşullar tamamlanınca açılır.
            </Callout>
          ) : null}
          {allDone ? (
            <Card title="Sonuç">
              <Result
                className="strateji-result"
                icon={<CheckCircle size={56} weight="fill" aria-hidden />}
                title="Strateji oluşturma tamam"
                subTitle="Beş alt aşama tamamlandı ve karar sahibi strateji belgesini onayladı. Şimdi strateji uygulamaya geçebilirsiniz."
                extra={<Button onClick={() => nav('/uygulama')}>Strateji uygulamaya geç</Button>}
              />
            </Card>
          ) : null}

          <Card title="Masadaki karar" extra={<Link className="kapi-action-link" tabIndex={0} to="/devir">Devir raporunu aç</Link>}>
            <p className="strateji-question">{report.question}</p>
            {report.scope ? <p className="strateji-scope">Kapsam sınırı: ekip yalnız şu konuyu planlar. {report.scope}</p> : null}
            <p className="helper">Stratej yolu önerir. Karar sahibi seçer. Dayanaklar, sınırlar ve eksik bilgi devir raporundadır.</p>
          </Card>

          <Card title="Stratej'in ilk günü" extra={<span>{report.firstDay.length} adım</span>}>
            <ol className="strateji-firstday">
              {report.firstDay.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
          </Card>

          <Card title="Yol adayları" extra={<span>{report.paths.length} yol</span>}>
            <PathCompare paths={report.paths} />
          </Card>

          <Card title={<h2 className="card-heading">Beş zorunlu alt aşama</h2>} extra={<span className="karar-step-count">{doneStages} / {cluster.subStages.length} tamam</span>}>
            <p className="helper">Giriş koşulu: {cluster.entry} Her alt aşama bir adımdır. Sırayla ilerleyin.</p>
            <SubStageList plan={plan} items={cluster.subStages} locked={locked} />
          </Card>

          <Card title={<h2 className="card-heading">Çıkış kapısı</h2>} extra={<Tag color={dossierDone && !reopened ? 'success' : undefined}>{SUB_STAGE_LABEL[dossierDone && !reopened ? 'tamam' : plan.steps[DOSSIER_STEP] ? 'suruyor' : 'bos']}</Tag>}>
            <p className="helper">{cluster.exit} Strateji uygulama bu altı koşul dolunca açılır.</p>
            <ul className="criteria-list">
              {criteria.map((c) => (
                <li key={c.label}>
                  {c.met ? <CheckCircle size={20} weight="fill" className="is-met" aria-hidden /> : <Circle size={20} className="is-open" aria-hidden />}
                  <span>{c.label} <span className="helper">{c.met ? 'Karşılandı.' : 'Henüz karşılanmadı.'}</span></span>
                </li>
              ))}
            </ul>
            <Link className="substage-link" to={stepPath(DOSSIER_STEP)}>{locked ? 'Strateji belgesini incele' : 'Strateji belgesini aç'}</Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
