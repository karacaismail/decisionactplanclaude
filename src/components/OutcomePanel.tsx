import '@/styles/desen/section-head.css'
import '@/styles/desen/choice-list.css'
import '@/styles/desen/choice.css'
import '@/styles/desen/kapi-ortak.css'
import '@/styles/desen/k-form.css'
import '@/styles/desen/save-row.css'
import '@/styles/desen/kapi.css'
import '@/styles/bilesen/OutcomePanel.css'
import { useEffect, useId, useState } from 'react'
import { Button, DatePicker, Form, Input, InputNumber, Radio } from 'antd'
import dayjs from 'dayjs'
import { User, UserCircle, Target, FileText } from '@phosphor-icons/react'
import { OUTCOME_LABEL, type Outcome, type PlanDoc } from '@/data/types'
import type { GateDef } from '@/data/schema'
import type { GateEvaluation } from '@/engine/gate'
import { OUTCOME_PRIORITY, OVERRIDE_REASON_MIN, validateDecision } from '@/engine/gate'
import { DecisionBadge } from './DecisionBadge'
import { Callout } from './Callout'
export interface OutcomeDraft {
  chosen: Outcome
  reason: string
  counterView: string
  secondOpinion: string
  decidedBy: string
  reopenWhen: string
  conditional?: { scope: string; amountKurus: number; deadline: string; owner: string; closingEvidence: string }
}

const HELP: Record<Outcome, string> = {
  durdur: 'Kabul edilemez zarar veya kayıp sınırı aşıldı. Etkilenen işi güvenli biçimde kapatın.',
  beklet: 'İzin, mevsim, bütçe veya dış karar bekleniyor. Sorumluyu ve kontrol tarihini yazın.',
  yenidenDene: 'Kritik bilgi eksik veya ölçüm bozuk. Küçük bir deneme seçin. Deneme hakkı bir azalır.',
  yonDegistir: 'Güvenilir bulgu varsayımı çürüttü. Değişecek parçayı seçin. Etkilenen ilk adıma dönün.',
  kosulluIlerle: 'Yalnız geri alınabilir iş. Tek seferlik ve süreli. Aynı eksik için ikinci izin yok.',
  ilerle: 'Kanıt kabul ölçüsünü karşılıyor. Sonraki karar açılır.',
}

const EMPTY_COND = { scope: '', amountKurus: 0, deadline: '', owner: '', closingEvidence: '' }

export interface OutcomePanelProps {
  evaluation: GateEvaluation
  onSave: (d: OutcomeDraft) => void
  /** Taslak her değişimde dışarıya bildirilir. Kapı ekranı adım göstergesini buna göre günceller. */
  onChange?: (d: OutcomeDraft) => void
  singleFounder: boolean
  saving?: boolean
  /** Kural denetimi için plan ve kapı tanımı. Verilmezse yalnız alan doluluğu denetlenir. */
  plan?: PlanDoc
  def?: GateDef
  harm?: boolean
}

/**
 * Kapı sonucu seçimi. Öneri gösterilir. Değiştirmek gerekçe ister. Kural engeli düğmeyi kilitler.
 * Görünüm antd Form'dur; durum bu bileşende tutulur. Form.Item etiketleri `htmlFor` ile alanlara bağlanır.
 */
export function OutcomePanel({ evaluation, onSave, onChange, singleFounder, saving, plan, def, harm }: OutcomePanelProps) {
  const uid = useId()
  const id = (k: string) => `${uid}-${k}`
  const [d, setD] = useState<OutcomeDraft>({ chosen: evaluation.suggested, reason: '', counterView: '', secondOpinion: '', decidedBy: '', reopenWhen: '' })
  const [touchedChoice, setTouchedChoice] = useState(false)
  /* Kullanıcı sonucu kendisi seçmediyse seçim öneriyi izler. Zarar anahtarı açılınca öneri "Durdur" olur. */
  useEffect(() => {
    if (!touchedChoice && d.chosen !== evaluation.suggested) {
      const next = { ...d, chosen: evaluation.suggested }
      setD(next)
      onChange?.(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluation.suggested])
  const update = (next: OutcomeDraft) => {
    setD(next)
    onChange?.(next)
  }
  const changed = d.chosen !== evaluation.suggested
  const needsSecond = singleFounder && (d.chosen === 'ilerle' || d.chosen === 'kosulluIlerle') && changed
  const condOk = d.chosen !== 'kosulluIlerle' || (d.conditional?.scope && d.conditional?.deadline && d.conditional?.owner && d.conditional?.closingEvidence)
  const errors = plan && def ? validateDecision(def, plan, evaluation, d, { harm }) : []
  const canSave = d.reason.trim().length > 0 && d.decidedBy.trim().length > 0 && condOk && (!needsSecond || d.secondOpinion.trim().length > 0) && errors.length === 0
  /** Düğme kapalıyken nedenini tek cümleyle söyler. Kural engeli varsa engel listesi görünür, bu metin görünmez. */
  const lockHint = (() => {
    if (canSave || errors.length > 0) return null
    if (!d.reason.trim() || !d.decidedBy.trim()) return 'Gerekçe ve karar sahibi yazılınca düğme açılır.'
    if (!condOk) return 'Koşullu izin alanları dolunca düğme açılır.'
    if (needsSecond && !d.secondOpinion.trim()) return 'İkinci görüş yazılınca düğme açılır.'
    return null
  })()
  const setCond = (patch: Partial<NonNullable<OutcomeDraft['conditional']>>) => update({ ...d, conditional: { ...(d.conditional ?? EMPTY_COND), ...patch } })

  return (
    <Form className="k-form" layout="vertical" requiredMark={false} onFinish={() => { if (canSave) onSave(d) }}>
      <Form.Item>
        <div className="suggestion-line">
          <span>Sistemin önerisi:</span>
          <DecisionBadge outcome={evaluation.suggested} />
        </div>
        <ul className="suggestion-reasons helper">
          {evaluation.reasons.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </Form.Item>

      <Form.Item label={<span id={id('sonuc')}>Sonucu seçin</span>}>
        <Radio.Group className="choice-list" aria-labelledby={id('sonuc')} value={d.chosen} onChange={(e) => { setTouchedChoice(true); update({ ...d, chosen: e.target.value }) }}>
          {OUTCOME_PRIORITY.map((o) => {
            const blocked = evaluation.blockedOutcomes.includes(o)
            return (
              <Radio key={o} value={o} disabled={blocked} className={`choice${d.chosen === o ? ' is-selected' : ''}`}>
                <span className="choice-body">
                  <span className="choice-title">
                    {OUTCOME_LABEL[o]}
                    {o === evaluation.suggested ? <span className="tag">Öneri</span> : blocked ? <span className="tag is-muted">Kapalı</span> : null}
                  </span>
                  <span className="choice-desc">{HELP[o]}</span>
                </span>
              </Radio>
            )
          })}
        </Radio.Group>
      </Form.Item>

      {d.chosen === 'kosulluIlerle' ? (
        <div className="form-block" role="group" aria-labelledby={id('kosul-baslik')}>
          <div className="section-head">
            <h3 id={id('kosul-baslik')}>Koşullu izin</h3>
            <p>Süre uzatılamaz. Kanıt gelmezse sonuç kendiliğinden "Beklet" olur.</p>
          </div>
          <Form.Item label="Kapsam" htmlFor={id('kapsam')} extra="Hangi iş açılıyor?">
            <Input id={id('kapsam')} prefix={<Target size={16} />} value={d.conditional?.scope ?? ''} onChange={(e) => setCond({ scope: e.target.value })} />
          </Form.Item>
          <div className="two-col">
            <Form.Item label="Üst tutar" htmlFor={id('tutar')}>
              <InputNumber id={id('tutar')} min={0} value={d.conditional ? d.conditional.amountKurus / 100 : undefined} onChange={(v) => setCond({ amountKurus: Math.round((v ?? 0) * 100) })} addonAfter="TL" />
            </Form.Item>
            <Form.Item label="Bitiş tarihi" htmlFor={id('bitis')}>
              <DatePicker id={id('bitis')} format="DD.MM.YYYY" value={d.conditional?.deadline ? dayjs(d.conditional.deadline) : null} onChange={(v) => setCond({ deadline: v ? v.format('YYYY-MM-DD') : '' })} />
            </Form.Item>
          </div>
          <Form.Item label="Sorumlu kişi" htmlFor={id('sorumlu')}>
            <Input id={id('sorumlu')} prefix={<User size={16} />} value={d.conditional?.owner ?? ''} onChange={(e) => setCond({ owner: e.target.value })} />
          </Form.Item>
          <Form.Item label="Kapanış kanıtı" htmlFor={id('kanit')} extra="Ne gelince iş kapanır?">
            <Input id={id('kanit')} prefix={<FileText size={16} />} value={d.conditional?.closingEvidence ?? ''} onChange={(e) => setCond({ closingEvidence: e.target.value })} />
          </Form.Item>
        </div>
      ) : null}

      <Form.Item label="Gerekçe" htmlFor={id('gerekce')} extra={changed ? `Öneriden farklı seçtiniz. Nedenini yazın. En az ${OVERRIDE_REASON_MIN} karakter gerekir.` : 'Bu kararı neden verdiğinizi yazın.'}>
        <Input.TextArea id={id('gerekce')} rows={3} showCount value={d.reason} onChange={(e) => update({ ...d, reason: e.target.value })} aria-required />
      </Form.Item>
      <Form.Item label="Karşı görüş" htmlFor={id('karsi')} extra="Kim neden karşı?">
        <Input.TextArea id={id('karsi')} rows={2} value={d.counterView} onChange={(e) => update({ ...d, counterView: e.target.value })} />
      </Form.Item>
      <div className="two-col">
        <Form.Item label="Karar sahibi" htmlFor={id('sahip')}>
          <Input id={id('sahip')} prefix={<UserCircle size={16} />} value={d.decidedBy} onChange={(e) => update({ ...d, decidedBy: e.target.value })} aria-required />
        </Form.Item>
        <Form.Item label="Yeniden açılma koşulu" htmlFor={id('yeniden')}>
          <Input id={id('yeniden')} value={d.reopenWhen} onChange={(e) => update({ ...d, reopenWhen: e.target.value })} placeholder="Hangi olayda?" />
        </Form.Item>
      </div>

      {needsSecond ? (
        <div className="form-block" role="group" aria-labelledby={id('ikinci-baslik')}>
          <div className="section-head">
            <h3 id={id('ikinci-baslik')}>İkinci görüş</h3>
            <p>Tek kurucu öneriyi aşıyor. Konuyu bilen başka bir kişi görüş yazmalı.</p>
          </div>
          <Form.Item label="Konuyu bilen kişi ne dedi?" htmlFor={id('ikinci')}>
            <Input.TextArea id={id('ikinci')} rows={2} value={d.secondOpinion} onChange={(e) => update({ ...d, secondOpinion: e.target.value })} aria-required />
          </Form.Item>
        </div>
      ) : null}

      {errors.length > 0 ? (
        <Form.Item>
          <Callout tone="uyari" danger title="Kayıt için engel var">
            <ul id="karar-engel" role="list" aria-live="polite" style={{ margin: 0, paddingLeft: 20, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
              {errors.map((e) => <li key={e}>{e}</li>)}
            </ul>
          </Callout>
        </Form.Item>
      ) : null}

      <div className="save-row">
        <Button type="primary" size="large" htmlType="submit" disabled={!canSave} loading={saving} aria-describedby={errors.length ? 'karar-engel' : lockHint ? id('kilit') : undefined}>
          Kararı kaydet
        </Button>
        {lockHint ? <span className="helper" id={id('kilit')}>{lockHint}</span> : null}
      </div>
    </Form>
  )
}
