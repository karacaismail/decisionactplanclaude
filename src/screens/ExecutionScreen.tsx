import '@/styles/desen/page-karar.css'
import '@/styles/desen/kapi.css'
import '@/styles/desen/mobil-kapi-page.css'
import '@/styles/desen/page-strateji.css'
import '@/styles/desen/strateji.css'
import '@/styles/ekran/ExecutionScreen.css'
import { useEffect, useRef, useState } from 'react'
import { Button, Card, Input, Radio, Tag, App as AntApp } from 'antd'
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useCurrentPlan, usePlanStore } from '@/store/planStore'
import { DECISIONS } from '@/data/decisions'
import { clusterOf } from '@/data/clusters'
import { EXECUTION_DECISIONS } from '@/data/stages'
import { HOLDS_LABEL, RENEWAL_LABEL, type ChoiceHolds, type RenewalDecision } from '@/data/types'
import { decisionLocked, gatePassed, lockReason, lockTarget } from '@/engine/gate'
import { REVIEW_REASON_MIN, strategyReopened, type ReviewDraft } from '@/engine/renewal'
import { choiceOf } from '@/engine/strategy'
import { formatDate } from '@/engine/format'
import { Callout } from '@/components/Callout'
import { PageHeader } from '@/components/PageHeader'
import { SubStageList } from '@/components/SubStageList'
const HOLDS: ChoiceHolds[] = ['evet', 'kismen', 'hayir']
const DECISION_HELP: Record<RenewalDecision, string> = {
  surdur: 'Seçim doğru. Aynı yolla devam edersiniz.',
  duzelt: 'Seçim doğru ama hamleler ya da hedefler değişmeli. Uygulama planını güncellersiniz.',
  yenidenAc: 'Seçim artık doğru değil. İş strateji oluşturmaya geri döner.',
}
const RENEWALS: RenewalDecision[] = ['surdur', 'duzelt', 'yenidenAc']
const EMPTY: ReviewDraft = { decidedBy: '', reason: '', evidence: '' }

/**
 * Strateji uygulama. Üçüncü ana kümedir. Beş zorunlu alt aşaması vardır ve çıkış kontrolü yoktur.
 * Küme, onaylanmış strateji belgesi olmadan kilitlidir. Kilit kuralı motordadır (`decisionLocked`).
 * Alt aşama 3.5 bu ekranda kaydedilir: "Seçim hâlâ doğru mu?" Karar sahibi sürdürür, düzeltir ya da yeniden açar.
 * Yazılım bu kararı vermez ve önermez. Ekranda en çok bir dolu düğme vardır.
 */
export function ExecutionScreen() {
  const plan = useCurrentPlan()
  const nav = useNavigate()
  const loc = useLocation()
  const { message } = AntApp.useApp()
  const record = usePlanStore((s) => s.recordStrategyReview)
  const [draft, setDraft] = useState<ReviewDraft>(EMPTY)
  const [errors, setErrors] = useState<string[]>([])

  const renewalHead = useRef<HTMLHeadingElement>(null)
  /* "#yenileme" bağlantısı kartı ekrana getirir ve odağı kart başlığına taşır. Her tıklama yeniden çalışır. */
  useEffect(() => {
    if (loc.hash !== '#yenileme') return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById('yenileme')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    renewalHead.current?.focus({ preventScroll: true })
  }, [loc.hash, loc.key])

  if (!plan) return null
  const cluster = clusterOf('uygulama')
  const first = EXECUTION_DECISIONS[0]
  const locked = decisionLocked(plan, first)
  const target = lockTarget(plan, first)
  const reopened = strategyReopened(plan)
  const choice = choiceOf(plan)
  const reviews = [...(plan.strategyReviews ?? [])].reverse()
  const nextStage = cluster.subStages.find((s) => s.steps.length > 0 && s.state(plan) !== 'tamam')
  /* 3.5 bir döngüdür, hiç bitmez. Sayaç yalnız biten alt aşamaları sayar: 3.1 ile 3.4 arası. */
  const finite = cluster.subStages.filter((s) => s.code !== '3.5')
  const finiteDone = finite.filter((s) => s.state(plan) === 'tamam').length
  const showErrors = errors.length > 0

  const save = () => {
    const found = record(draft)
    setErrors(found)
    if (found.length) return
    message.success(draft.decision === 'yenidenAc' ? 'Karar kaydedildi. Strateji yeniden açıldı.' : 'Karar kaydedildi.')
    const reopen = draft.decision === 'yenidenAc'
    setDraft(EMPTY)
    if (reopen) nav('/strateji')
  }

  const action = locked ? (
    <Button icon={<ArrowLeft size={16} />} onClick={() => nav(target === 'gecis' ? '/gecis' : '/strateji')}>
      {target === 'gecis' ? 'Hazırlık kontrolüne git' : 'Strateji oluşturmaya git'}
    </Button>
  ) : nextStage ? (
    <Button type="primary" icon={<ArrowRight size={16} />} iconPlacement="end" onClick={() => nav(nextStage.path)}>
      Sıradaki adım: {nextStage.code}. {nextStage.title}
    </Button>
  ) : null

  return (
    <div className="page mobil-kapi-page page-karar page-strateji">
      <PageHeader newPath="/uygulama" kicker="Strateji uygulama" title={cluster.question} description="Seçimi hedefe, işe ve kaynağa çevirirsiniz. Sonra yürütür, ölçer ve seçimi düzenli sınarsınız." documentTitle={cluster.title} actions={action} />

      {locked ? (
        <Callout tone="uyari" title="Strateji uygulama kilitli">
          {lockReason(plan, first)} Alt aşamaları inceleyebilirsiniz. Adımları doldurmak için önce bu koşulu tamamlayın.
        </Callout>
      ) : null}
      {reopened ? (
        <Callout tone="uyari" title="Strateji yeniden açıldı">
          Karar sahibi seçimi yeniden açtı. Uygulama eski seçimle sürer. <Link className="kapi-action-link" tabIndex={0} to="/strateji">Strateji oluşturmayı açın ve strateji belgesini yeniden tamamlayın.</Link>
        </Callout>
      ) : null}

      <div className="strateji-main">
        <Card title={<h2 className="card-heading">Beş zorunlu alt aşama</h2>} extra={<span className="karar-step-count">{finiteDone} / {finite.length} tamam</span>}>
          <p className="helper">Giriş koşulu: {cluster.entry}</p>
          <p className="helper">Çıkış: {cluster.exit} Sayaç 3.5'i saymaz, çünkü 3.5 bir döngüdür.</p>
          <SubStageList plan={plan} items={cluster.subStages} locked={locked} />
        </Card>

        <Card title={<h2 className="card-heading">Yürütme kararları</h2>}>
          <p className="helper">Alt aşama 3.4 Karar 6 ve Karar 7 ile yürür. Karar 8 işin yönünü sorar ve 3.5'in parçasıdır. Her kararın sonunda bir kontrol vardır.</p>
          <ul className="decision-links">
            {EXECUTION_DECISIONS.map((n) => {
              const d = DECISIONS.find((x) => x.n === n)!
              const passed = gatePassed(plan, n)
              const closed = decisionLocked(plan, n)
              return (
                <li key={n}>
                  <Link to={`/karar/${n}`}>
                    <span>Karar {n}. {d.title}. {n === 8 ? 'Alt aşama 3.5' : 'Alt aşama 3.4'}</span>
                    <Tag color={passed ? 'success' : undefined}>{passed ? 'Geçti' : closed ? 'Kilitli' : 'Açık'}</Tag>
                  </Link>
                </li>
              )
            })}
          </ul>
        </Card>

        <Card id="yenileme" className="renewal-card" title={<h2 className="card-heading" ref={renewalHead} tabIndex={-1}>Stratejiyi sınama ve yenileme</h2>} extra={<Tag>{reviews.length} kayıt</Tag>}>
          <p className="helper">Bu alt aşama 3.5'tir. İki soru birbirine benzer ama ayrıdır.</p>
          <dl className="question-pair">
            <div>
              <dt>Alt aşama 3.4 şunu sorar</dt>
              <dd>Planı doğru uyguluyor muyuz?</dd>
            </div>
            <div>
              <dt>Alt aşama 3.5 şunu sorar</dt>
              <dd>Uyguladığımız plan hâlâ doğru plan mı?</dd>
            </div>
          </dl>
          {choice ? <p className="strateji-scope">Bugünkü seçim: {choice.path}</p> : null}

          {locked ? (
            <p className="strateji-empty">Gözden geçirme kaydı, strateji belgesi onaylanınca açılır.</p>
          ) : (
            <div className="renewal-form">
              <div role="group" aria-labelledby="yenileme-soru">
                <span id="yenileme-soru" className="field-label">Seçim hâlâ doğru mu?</span>
                <Radio.Group aria-labelledby="yenileme-soru" value={draft.holds} onChange={(e) => setDraft((d) => ({ ...d, holds: e.target.value as ChoiceHolds }))} options={HOLDS.map((value) => ({ value, label: HOLDS_LABEL[value] }))} />
              </div>
              <div role="group" aria-labelledby="yenileme-karar">
                <span id="yenileme-karar" className="field-label">Kararınız nedir?</span>
                <Radio.Group
                  aria-labelledby="yenileme-karar"
                  value={draft.decision}
                  onChange={(e) => setDraft((d) => ({ ...d, decision: e.target.value as RenewalDecision }))}
                  options={RENEWALS.map((value) => ({ value, label: `${RENEWAL_LABEL[value]}. ${DECISION_HELP[value]}` }))}
                />
              </div>
              <div>
                <label htmlFor="yenileme-gerekce" className="field-label">Gerekçe</label>
                <Input.TextArea id="yenileme-gerekce" aria-describedby="yenileme-gerekce-yardim" aria-invalid={showErrors && draft.reason.trim().length < REVIEW_REASON_MIN} rows={3} value={draft.reason} onChange={(e) => setDraft((d) => ({ ...d, reason: e.target.value }))} placeholder="Hangi gözlem ya da sayı bu kararı gösteriyor?" />
                <span id="yenileme-gerekce-yardim" className="helper">En az {REVIEW_REASON_MIN} harf yazın.</span>
              </div>
              <div>
                <label htmlFor="yenileme-kanit" className="field-label">Dayandığı gözlem ya da sayı. İsteğe bağlı.</label>
                <Input id="yenileme-kanit" value={draft.evidence} onChange={(e) => setDraft((d) => ({ ...d, evidence: e.target.value }))} placeholder="Örneğin: Üç ayda tekrar gelen müşteri oranı yüzde 12." />
              </div>
              <div>
                <label htmlFor="yenileme-sahip" className="field-label">Karar sahibi</label>
                <Input id="yenileme-sahip" aria-invalid={showErrors && !draft.decidedBy.trim()} value={draft.decidedBy} onChange={(e) => setDraft((d) => ({ ...d, decidedBy: e.target.value }))} />
              </div>
              {errors.length ? (
                <Callout tone="uyari" title="Karar kaydedilmedi">
                  <ul className="renewal-errors">
                    {errors.map((e) => <li key={e}>{e}</li>)}
                  </ul>
                </Callout>
              ) : null}
              <div>
                <Button type={nextStage ? 'default' : 'primary'} onClick={save}>Kararı kaydet</Button>
              </div>
            </div>
          )}

          {reviews.length ? (
            <>
              <h3 className="substage-title">Geçmiş kararlar</h3>
              <ul className="renewal-list">
                {reviews.map((r) => (
                  <li key={r.id} className="renewal-item">
                    <span className="renewal-item-head">
                      <Tag color={r.decision === 'yenidenAc' ? 'warning' : r.decision === 'surdur' ? 'success' : undefined}>{RENEWAL_LABEL[r.decision]}</Tag>
                      <span className="helper">{formatDate(r.decidedAt)}. {r.decidedBy}.</span>
                    </span>
                    <span>{HOLDS_LABEL[r.holds]}.</span>
                    <span>Gerekçe: {r.reason}</span>
                    {r.evidence ? <span className="helper">Dayanak: {r.evidence}</span> : null}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </Card>
      </div>
    </div>
  )
}
