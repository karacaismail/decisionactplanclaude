import { useId, useState } from 'react'
import { Button, DatePicker, Input, InputNumber, Radio } from 'antd'
import dayjs from 'dayjs'
import { OUTCOME_LABEL, type Outcome, type PlanDoc } from '@/data/types'
import type { GateDef } from '@/data/schema'
import type { GateEvaluation } from '@/engine/gate'
import { OUTCOME_PRIORITY, validateDecision } from '@/engine/gate'
import { DecisionBadge } from './DecisionBadge'
import { Callout } from './Callout'
import '@/styles/screens-kapi.css'

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
  singleFounder: boolean
  saving?: boolean
  /** Kural denetimi için plan ve kapı tanımı. Verilmezse yalnız alan doluluğu denetlenir. */
  plan?: PlanDoc
  def?: GateDef
  harm?: boolean
}

/** Kapı sonucu seçimi. Öneri gösterilir. Değiştirmek gerekçe ister. Kural engeli düğmeyi kilitler. */
export function OutcomePanel({ evaluation, onSave, singleFounder, saving, plan, def, harm }: OutcomePanelProps) {
  const uid = useId()
  const id = (k: string) => `${uid}-${k}`
  const [d, setD] = useState<OutcomeDraft>({ chosen: evaluation.suggested, reason: '', counterView: '', secondOpinion: '', decidedBy: '', reopenWhen: '' })
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
  const setCond = (patch: Partial<NonNullable<OutcomeDraft['conditional']>>) => setD({ ...d, conditional: { ...(d.conditional ?? EMPTY_COND), ...patch } })

  return (
    <div className="form-section">
      <div className="suggestion-line">
        <span>Sistemin önerisi:</span>
        <DecisionBadge outcome={evaluation.suggested} />
      </div>
      <ul className="suggestion-reasons helper">
        {evaluation.reasons.map((r, i) => <li key={i}>{r}</li>)}
      </ul>

      <div className="field">
        <span className="field-label" id={id('sonuc')}>Sonucu seçin</span>
        <Radio.Group className="choice-list" aria-labelledby={id('sonuc')} value={d.chosen} onChange={(e) => setD({ ...d, chosen: e.target.value })}>
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
      </div>

      {d.chosen === 'kosulluIlerle' ? (
        <div className="form-section">
          <div className="section-head"><h3>Koşullu izin</h3><p>Süre uzatılamaz. Kanıt gelmezse sonuç kendiliğinden "Beklet" olur.</p></div>
          <div className="field">
            <label className="field-label" htmlFor={id('kapsam')}>Kapsam. Hangi iş açılıyor?</label>
            <Input id={id('kapsam')} value={d.conditional?.scope ?? ''} onChange={(e) => setCond({ scope: e.target.value })} />
          </div>
          <div className="two-col">
            <div className="field">
              <label className="field-label" htmlFor={id('tutar')}>Üst tutar (TL)</label>
              <InputNumber id={id('tutar')} min={0} value={d.conditional ? d.conditional.amountKurus / 100 : undefined} onChange={(v) => setCond({ amountKurus: Math.round((v ?? 0) * 100) })} addonAfter="TL" />
            </div>
            <div className="field">
              <label className="field-label" htmlFor={id('bitis')}>Bitiş tarihi</label>
              <DatePicker id={id('bitis')} format="DD.MM.YYYY" value={d.conditional?.deadline ? dayjs(d.conditional.deadline) : null} onChange={(v) => setCond({ deadline: v ? v.format('YYYY-MM-DD') : '' })} />
            </div>
          </div>
          <div className="field">
            <label className="field-label" htmlFor={id('sorumlu')}>Sorumlu kişi</label>
            <Input id={id('sorumlu')} value={d.conditional?.owner ?? ''} onChange={(e) => setCond({ owner: e.target.value })} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor={id('kanit')}>Kapanış kanıtı. Ne gelince iş kapanır?</label>
            <Input id={id('kanit')} value={d.conditional?.closingEvidence ?? ''} onChange={(e) => setCond({ closingEvidence: e.target.value })} />
          </div>
        </div>
      ) : null}

      <div className="form-section">
        <div className="field">
          <label className="field-label" htmlFor={id('gerekce')}>Gerekçe{changed ? '. Öneriden farklı seçtiniz. Nedenini yazın.' : ''}</label>
          <Input.TextArea id={id('gerekce')} rows={3} value={d.reason} onChange={(e) => setD({ ...d, reason: e.target.value })} aria-required />
        </div>
        <div className="field">
          <label className="field-label" htmlFor={id('karsi')}>Karşı görüş. Kim neden karşı?</label>
          <Input.TextArea id={id('karsi')} rows={2} value={d.counterView} onChange={(e) => setD({ ...d, counterView: e.target.value })} />
        </div>
        <div className="two-col">
          <div className="field">
            <label className="field-label" htmlFor={id('sahip')}>Karar sahibi</label>
            <Input id={id('sahip')} value={d.decidedBy} onChange={(e) => setD({ ...d, decidedBy: e.target.value })} aria-required />
          </div>
          <div className="field">
            <label className="field-label" htmlFor={id('yeniden')}>Yeniden açılma koşulu</label>
            <Input id={id('yeniden')} value={d.reopenWhen} onChange={(e) => setD({ ...d, reopenWhen: e.target.value })} placeholder="Hangi olayda?" />
          </div>
        </div>
      </div>

      {needsSecond ? (
        <div className="form-section">
          <div className="section-head"><h3>İkinci görüş</h3><p>Tek kurucu öneriyi aşıyor. Konuyu bilen başka bir kişi görüş yazmalı.</p></div>
          <div className="field">
            <label className="field-label" htmlFor={id('ikinci')}>Konuyu bilen kişi ne dedi?</label>
            <Input.TextArea id={id('ikinci')} rows={2} value={d.secondOpinion} onChange={(e) => setD({ ...d, secondOpinion: e.target.value })} aria-required />
          </div>
        </div>
      ) : null}

      {errors.length > 0 ? (
        <Callout tone="uyari" danger title="Kayıt için engel var">
          <ul id="karar-engel" role="list" aria-live="polite" style={{ margin: 0, paddingLeft: 20, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
            {errors.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </Callout>
      ) : null}

      <div className="save-row">
        <Button type="primary" size="large" disabled={!canSave} loading={saving} aria-describedby={errors.length ? 'karar-engel' : lockHint ? id('kilit') : undefined} onClick={() => onSave(d)}>
          Kararı kaydet
        </Button>
        {lockHint ? <span className="helper" id={id('kilit')}>{lockHint}</span> : null}
      </div>
    </div>
  )
}
