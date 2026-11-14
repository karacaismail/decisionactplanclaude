import { useMemo } from 'react'
import { Button, Card, Descriptions, Grid, Result, Steps, Table, Tag } from 'antd'
import { ArrowLeft, ArrowRight, CheckCircle, LockSimple } from '@phosphor-icons/react'
import { Link, useNavigate } from 'react-router'
import { useCurrentPlan } from '@/store/planStore'
import { STRATEGY, STRATEGY_N } from '@/data/decisions'
import { stepPath, stepsOf } from '@/data/registry'
import type { StepDef } from '@/data/schema'
import { TRANSITION_LABEL, type PlanDoc, type TransitionOutcome } from '@/data/types'
import { decisionLocked, lockReason } from '@/engine/gate'
import { effectiveTransition, lastTransition } from '@/engine/readiness'
import { formatDate } from '@/engine/format'
import { buildHandoffReport } from '@/reports/handoff'
import { Callout } from '@/components/Callout'
import { PageHeader } from '@/components/PageHeader'
import { PathCompare } from '@/components/PathCompare'
import '@/styles/screens-karar.css'
import '@/styles/screens-strateji.css'

type StepState = 'tamam' | 'taslak' | 'atlandi' | 'bos'
const STATE_LABEL: Record<StepState, string> = { tamam: 'Tamam', taslak: 'Taslak', atlandi: 'Atlandı', bos: 'Boş' }
const OUTCOME_COLOR: Record<TransitionOutcome, string | undefined> = { hazir: 'success', kosullu: 'warning', degil: undefined }
/** "Adım 19'u aç", "Adım 20'yi aç" gibi doğru ek. */
const OPEN_SUFFIX: Record<string, string> = { '19': "'u", '20': "'yi" }

function stateOf(plan: PlanDoc, id: string): StepState {
  const s = plan.steps[id]?.status
  return s === 'tamam' || s === 'taslak' || s === 'atlandi' ? s : 'bos'
}

/**
 * Strateji çalışması. Adım 19 ve 20 bu gruptadır. Adım listesi `stepsOf` ile veriden gelir.
 * Grup, geçiş kapısı kararı olmadan kilitlidir.
 * Ekran stratej'in okuma sırasıyla dizilir: önündeki karar, ilk günü, yol adayları, adımlar.
 * Telefonda tek sütundur ve geçiş kararı en üsttedir. Masaüstünde geçiş kararı sağ sütundadır.
 * Ekranda en çok bir dolu düğme vardır: sıradaki adımı açar. Kilitliyken dolu düğme yoktur.
 * Yazılım yol seçmez. Yol adayları tablosu hiçbir yolu öne çıkarmaz.
 */
export function StrategyScreen() {
  const plan = useCurrentPlan()
  const nav = useNavigate()
  const bp = Grid.useBreakpoint()
  const report = useMemo(() => (plan ? buildHandoffReport(plan) : null), [plan])
  if (!plan || !report) return null

  const locked = decisionLocked(plan, STRATEGY_N)
  const reason = lockReason(plan, STRATEGY_N)
  const last = lastTransition(plan)
  const expired = last ? effectiveTransition(last) !== last.outcome : false
  const steps = stepsOf(STRATEGY_N).filter((s) => !plan.shortPath || s.shortPath)
  const isDone = (id: string) => stateOf(plan, id) === 'tamam' || stateOf(plan, id) === 'atlandi'
  const next = steps.find((s) => !isDone(s.id))
  const done = steps.filter((s) => isDone(s.id)).length
  const allDone = !locked && steps.length > 0 && !next

  const action = locked ? (
    <Button icon={<ArrowLeft size={16} />} onClick={() => nav('/gecis')}>
      Geçiş kapısına git
    </Button>
  ) : next ? (
    <Button type="primary" icon={<ArrowRight size={16} />} iconPlacement="end" onClick={() => nav(stepPath(next.id))}>
      Adım {next.id}
      {OPEN_SUFFIX[next.id] ?? "'i"} aç
    </Button>
  ) : null

  return (
    <div className="page page-karar page-strateji">
      <PageHeader kicker="Strateji çalışması" title={STRATEGY.question} description={STRATEGY.intro} documentTitle={STRATEGY.title} actions={action} />

      {locked ? (
        <Callout tone="uyari" title="Strateji çalışması kilitli">
          {reason} Adımları inceleyebilirsiniz. Adımları doldurmak için önce geçiş kapısında karar kaydedin.
        </Callout>
      ) : null}

      <div className="strateji-grid">
        <aside className="strateji-aside" aria-label="Geçiş kararı">
          <Card title="Geçiş kararı" extra={<Link to="/gecis">Geçiş kapısını aç</Link>}>
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
          {allDone ? (
            <Card title="Sonuç">
              <Result
                className="strateji-result"
                icon={<CheckCircle size={56} weight="fill" aria-hidden />}
                title="Strateji çalışması tamam"
                subTitle="Adımların hepsi tamamlandı. Şimdi uygulama aşamasına geçebilirsiniz."
                extra={<Button onClick={() => nav('/karar/6')}>Uygulama aşamasına geç</Button>}
              />
            </Card>
          ) : null}

          <Card title="Stratej'in önündeki karar" extra={<Link to="/devir">Devir raporunu aç</Link>}>
            <p className="strateji-question">{report.question}</p>
            {report.scope ? <p className="strateji-scope">Kapsam sınırı: ekip yalnız şu konuyu planlar. {report.scope}</p> : null}
            <p className="helper">Kararı stratej verir. Dayanaklar, sınırlar ve eksik bilgi devir raporundadır.</p>
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

          <Card title="Adımlar" extra={<span className="karar-step-count">{done} / {steps.length} tamam</span>}>
            <Steps
              className="karar-steps"
              size="small"
              orientation={bp.md ? 'horizontal' : 'vertical'}
              titlePlacement={bp.md ? 'vertical' : 'horizontal'}
              current={next ? steps.indexOf(next) : steps.length}
              onChange={(i) => {
                const s = steps[i]
                if (s) nav(stepPath(s.id))
              }}
              items={steps.map((s) => ({
                title: `Adım ${s.id}`,
                content: s.title,
                status: isDone(s.id) ? ('finish' as const) : !locked && s === next ? ('process' as const) : ('wait' as const),
                icon: locked && !isDone(s.id) ? <LockSimple size={16} aria-label="Kilitli" /> : undefined,
              }))}
            />
            <Table<StepDef>
              className="karar-table"
              size="middle"
              pagination={false}
              rowKey="id"
              dataSource={steps}
              scroll={{ x: 500 }}
              columns={[
                {
                  title: 'Adım',
                  key: 'adim',
                  render: (_, s) => (
                    <Link to={stepPath(s.id)} className="karar-step-link">
                      <span className="route-dot" aria-hidden>
                        {s.id}
                      </span>
                      <span>{s.title}</span>
                    </Link>
                  ),
                },
                {
                  title: 'Durum',
                  key: 'durum',
                  width: 112,
                  /* Kilitli ve boş adımda tek etiket yeter: "Kilitli". Dolu adımda durum da yazar. */
                  render: (_, s) => {
                    const st = stateOf(plan, s.id)
                    return (
                      <span className="strateji-tags">
                        {locked && st === 'bos' ? null : <Tag color={st === 'tamam' ? 'success' : undefined}>{STATE_LABEL[st]}</Tag>}
                        {locked ? <Tag icon={<LockSimple size={14} aria-hidden />}>Kilitli</Tag> : null}
                      </span>
                    )
                  },
                },
                {
                  title: 'Son güncelleme',
                  key: 'tarih',
                  width: 136,
                  render: (_, s) => {
                    const at = plan.steps[s.id]?.updatedAt
                    return <span className="karar-date">{at ? formatDate(at, false) : 'Güncellenmedi'}</span>
                  },
                },
                { title: 'Eylem', key: 'ac', width: 72, render: (_, s) => <Link to={stepPath(s.id)}>{locked ? 'İncele' : 'Aç'}</Link> },
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}
