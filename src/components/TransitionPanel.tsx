import { useId, useState } from 'react'
import { Button, Checkbox, DatePicker, Form, Input, Radio, Result, Tag, App as AntApp } from 'antd'
import dayjs from 'dayjs'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, ArrowRight, CheckCircle, FileText, Info, Target, User, UserCircle, Users } from '@phosphor-icons/react'
import { TRANSITION_LABEL, type PlanDoc, type TransitionOutcome } from '@/data/types'
import { stepPath } from '@/data/registry'
import { TRANSITION_OVERRIDE_MIN, validateTransition, type ReadinessEvaluation, type TransitionDraft } from '@/engine/readiness'
import { formatDate } from '@/engine/format'
import { usePlanStore } from '@/store/planStore'
import { Callout } from './Callout'
import '@/styles/screens-kapi.css'
import '@/styles/screens-gecis.css'

type Conditional = NonNullable<TransitionDraft['conditional']>

const ORDER: TransitionOutcome[] = ['hazir', 'kosullu', 'degil']
const HELP: Record<TransitionOutcome, string> = {
  hazir: 'Strateji oluşturma açılır.',
  kosullu: 'Ekip yalnız belirtilen konuyu planlar.',
  degil: 'Eksik kanıt tamamlanır.',
}
const EMPTY_COND: Conditional = { topic: '', openQuestion: '', owner: '', deadline: '' }

/** Sonuç etiketi. Hazır yeşil, koşullu sarı, hazır değil gri. Renk antd durum tokenlarından gelir. */
export function TransitionTag({ outcome }: { outcome: TransitionOutcome }) {
  const color = outcome === 'hazir' ? 'success' : outcome === 'kosullu' ? 'warning' : undefined
  return <Tag color={color}>{TRANSITION_LABEL[outcome]}</Tag>
}

export interface TransitionPanelProps {
  plan: PlanDoc
  /** Ekran, ikinci okur adını da sayarak hesaplar. Ölçüt tabloları ile panel aynı sonucu gösterir. */
  evaluation: ReadinessEvaluation
  secondReader: string
  onSecondReaderChange: (name: string) => void
}

/**
 * Geçiş kararı paneli. Yazılım öneriyi gösterir. Kararı karar sahibi seçer ve kaydeder.
 * Kayıt engellerini `validateTransition` üretir. Engel varken düğme kapalıdır.
 */
export function TransitionPanel({ plan, evaluation, secondReader, onSecondReaderChange }: TransitionPanelProps) {
  const uid = useId()
  const id = (k: string) => `${uid}-${k}`
  const nav = useNavigate()
  const { message } = AntApp.useApp()
  const recordTransition = usePlanStore((s) => s.recordTransition)
  const addTask = usePlanStore((s) => s.addTask)
  const setLocation = usePlanStore((s) => s.setLocation)

  /* Kullanıcı sonucu kendisi seçmediyse seçim öneriyi izler. İkinci okur yazılınca öneri değişebilir. */
  const [chosen, setChosen] = useState<TransitionOutcome | null>(null)
  const outcome = chosen ?? evaluation.suggested
  const [dirty, setDirty] = useState(false)
  const [reason, setReason] = useState('')
  const [decidedBy, setDecidedBy] = useState('')
  const [reviewed, setReviewed] = useState(false)
  const [cond, setCondState] = useState<Conditional>(EMPTY_COND)
  const [saved, setSaved] = useState<{ outcome: TransitionOutcome; backTo: string } | null>(null)

  const draft: TransitionDraft = {
    outcome,
    reason,
    decidedBy,
    reviewed,
    secondOpinion: secondReader,
    conditional: outcome === 'kosullu' ? cond : undefined,
  }
  const errors = validateTransition(plan, evaluation, draft)
  const canSave = errors.length === 0
  const overriding = evaluation.suggested === 'kosullu' && outcome === 'hazir'
  const openReviews = (plan.changes ?? []).filter((c) => c.needsReview && !c.reviewer).length
  const planEnd = plan.limits.deadline?.slice(0, 10)

  const touch = () => setDirty(true)
  const setCond = (patch: Partial<Conditional>) => {
    touch()
    setCondState((c) => ({ ...c, ...patch }))
  }

  const save = () => {
    if (!canSave) return
    const conditional = outcome === 'kosullu' ? { topic: cond.topic.trim(), openQuestion: cond.openQuestion.trim(), owner: cond.owner.trim(), deadline: cond.deadline } : undefined
    recordTransition({
      outcome,
      suggested: evaluation.suggested,
      reason: reason.trim(),
      decidedBy: decidedBy.trim(),
      reviewed,
      secondOpinion: secondReader.trim() || undefined,
      conditional,
      mandatoryMet: evaluation.mandatoryMet,
      mandatoryTotal: evaluation.mandatory.length,
      supportingMet: evaluation.supportingMet,
      supportingTotal: evaluation.supporting.length,
      level: evaluation.level,
    })
    if (conditional) {
      addTask({
        action: `Geçiş kapısı açık sorusu: ${conditional.openQuestion}`,
        acceptance: `Soru kanıtla cevaplandı. Planlanan konu: ${conditional.topic}`,
        owner: conditional.owner,
        dueDate: conditional.deadline,
        status: 'acik',
      })
    }
    const missing = [...evaluation.mandatory, ...evaluation.supporting].find((c) => c.met !== true)
    if (outcome !== 'degil') setLocation('/strateji')
    message.success('Geçiş kararı kaydedildi. Yeni sürüm alındı.')
    setSaved({ outcome, backTo: missing ? stepPath(missing.step) : '/ozet' })
  }

  if (saved) {
    const open = saved.outcome !== 'degil'
    const subTitle =
      saved.outcome === 'hazir'
        ? '"Planlamaya hazır" kararı kaydedildi. Strateji oluşturma açıldı.'
        : saved.outcome === 'kosullu'
          ? '"Koşullu hazır" kararı kaydedildi. Ekip yalnız belirtilen konuyu planlar. Açık soru iş listesine eklendi.'
          : '"Henüz hazır değil" kararı kaydedildi. Strateji oluşturma kapalı kalır. Önce eksik kanıtı tamamlayın.'
    return (
      <Result
        className={`k-result gecis-result${open ? '' : ' is-neutral'}`}
        status={open ? 'success' : 'info'}
        icon={open ? <CheckCircle size={56} weight="fill" aria-hidden /> : <Info size={56} weight="fill" aria-hidden />}
        title="Geçiş kararı kaydedildi"
        subTitle={subTitle}
        extra={
          open ? (
            <Button type="primary" icon={<ArrowRight size={16} />} iconPlacement="end" onClick={() => nav('/strateji')}>
              Strateji oluşturmayı aç
            </Button>
          ) : (
            <Button type="primary" icon={<ArrowLeft size={16} />} onClick={() => nav(saved.backTo)}>
              Eksik ölçütlere dön
            </Button>
          )
        }
      />
    )
  }

  return (
    <Form className="k-form gecis-form" layout="vertical" requiredMark={false} onFinish={save}>
      <Form.Item>
        <div className="suggestion-line">
          <span>Yazılımın önerisi:</span>
          <TransitionTag outcome={evaluation.suggested} />
        </div>
        <ul className="suggestion-reasons helper">
          {evaluation.reasons.map((r) => <li key={r}>{r}</li>)}
        </ul>
        {evaluation.warnings.length > 0 ? (
          <Callout tone="uyari" title="Varsayım uyarısı">
            {evaluation.warnings.map((w) => <span key={w} style={{ display: 'block' }}>{w}</span>)}
          </Callout>
        ) : null}
      </Form.Item>

      <Form.Item label={<span id={id('sonuc')}>Sonucu seçin</span>}>
        <Radio.Group
          className="choice-list"
          aria-labelledby={id('sonuc')}
          value={outcome}
          onChange={(e) => {
            touch()
            setChosen(e.target.value)
          }}
        >
          {ORDER.map((o) => (
            <Radio key={o} value={o} className={`choice${outcome === o ? ' is-selected' : ''}`}>
              <span className="choice-body">
                <span className="choice-title">
                  {TRANSITION_LABEL[o]}
                  {o === evaluation.suggested ? <span className="tag">Öneri</span> : null}
                </span>
                <span className="choice-desc">{HELP[o]}</span>
              </span>
            </Radio>
          ))}
        </Radio.Group>
      </Form.Item>

      {outcome === 'kosullu' ? (
        <div className="form-block" role="group" aria-labelledby={id('kosul-baslik')}>
          <div className="section-head">
            <h3 id={id('kosul-baslik')}>Koşullu hazır</h3>
            <p>Ekip yalnız yazdığınız konuyu planlar. Son tarih geçerse sonuç "Henüz hazır değil" olur.</p>
          </div>
          <Form.Item label="Planlanacak konu" htmlFor={id('konu')} extra="Ekip hangi konuyu planlayacak?">
            <Input id={id('konu')} prefix={<Target size={16} />} value={cond.topic} onChange={(e) => setCond({ topic: e.target.value })} aria-required />
          </Form.Item>
          <Form.Item label="Açık soru" htmlFor={id('soru')} extra="Hangi soru henüz cevaplanmadı? Soru iş listesine eklenir.">
            <Input id={id('soru')} prefix={<FileText size={16} />} value={cond.openQuestion} onChange={(e) => setCond({ openQuestion: e.target.value })} aria-required />
          </Form.Item>
          <div className="two-col">
            <Form.Item label="Sorumlu" htmlFor={id('sorumlu')}>
              <Input id={id('sorumlu')} prefix={<User size={16} />} value={cond.owner} onChange={(e) => setCond({ owner: e.target.value })} aria-required />
            </Form.Item>
            <Form.Item label="Son tarih" htmlFor={id('tarih')} extra={planEnd ? `Plan ${formatDate(planEnd)} biter. Son tarih bu günü geçemez.` : undefined}>
              <DatePicker
                id={id('tarih')}
                format="D MMMM YYYY"
                placeholder="Tarih seçin"
                value={cond.deadline ? dayjs(cond.deadline) : null}
                disabledDate={(d) => d.isBefore(dayjs().startOf('day')) || Boolean(planEnd && d.format('YYYY-MM-DD') > planEnd)}
                onChange={(v) => setCond({ deadline: v ? v.format('YYYY-MM-DD') : '' })}
                aria-required
              />
            </Form.Item>
          </div>
        </div>
      ) : null}

      <Form.Item
        label="Gerekçe"
        htmlFor={id('gerekce')}
        extra={overriding ? `Öneriyi aşıyorsunuz. Gerekçe en az ${TRANSITION_OVERRIDE_MIN} karakter olmalı.` : 'Bu kararı hangi kanıta dayanarak verdiğinizi yazın.'}
      >
        <Input.TextArea id={id('gerekce')} rows={3} showCount value={reason} onChange={(e) => { touch(); setReason(e.target.value) }} aria-required />
      </Form.Item>
      <Form.Item label="Karar sahibi" htmlFor={id('sahip')}>
        <Input id={id('sahip')} prefix={<UserCircle size={16} />} value={decidedBy} onChange={(e) => { touch(); setDecidedBy(e.target.value) }} aria-required />
      </Form.Item>
      <Form.Item
        label="İkinci okur ya da ikinci görüş"
        htmlFor={id('ikinci')}
        extra={overriding ? 'Öneriyi aşmak için dayanakları okuyan ikinci kişinin adını yazın.' : 'Dayanakları okuyan ikinci kişinin adını yazın. Bu alan boş kalabilir.'}
      >
        <Input id={id('ikinci')} prefix={<Users size={16} />} value={secondReader} onChange={(e) => { touch(); onSecondReaderChange(e.target.value) }} aria-required={overriding} />
      </Form.Item>
      <Form.Item>
        <div className="gecis-check-row">
          <Checkbox id={id('inceledim')} className="gecis-check" checked={reviewed} onChange={(e) => { touch(); setReviewed(e.target.checked) }}>
            Strateje devir raporunu okudum.
          </Checkbox>
          {/* Yeni sekmede açılır. Aynı sekmede açılırsa yarım doldurulan karar formu silinir. */}
          <a href="#/devir" target="_blank" rel="noopener noreferrer">Raporu yeni sekmede aç</a>
        </div>
      </Form.Item>

      {dirty && errors.length > 0 ? (
        <Form.Item>
          <Callout tone="uyari" danger title="Kayıt için engel var">
            <ul id={id('engel')} className="gecis-errors" aria-live="polite">
              {errors.map((e) => <li key={e}>{e}</li>)}
            </ul>
            {openReviews > 0 ? <Link to="/karar/5/kapi">İkinci görüşü Kapı 5 ekranında kaydedin.</Link> : null}
          </Callout>
        </Form.Item>
      ) : null}

      <div className="save-row">
        <Button type="primary" size="large" htmlType="submit" disabled={!canSave} aria-describedby={canSave ? undefined : id('kilit')}>
          Geçiş kararını kaydet
        </Button>
        {canSave ? null : <span className="helper" id={id('kilit')}>Düğme şu nedenle kapalı: {errors[0]}</span>}
      </div>
    </Form>
  )
}
