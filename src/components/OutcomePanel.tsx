import { useState } from 'react'
import { Button, DatePicker, Input, InputNumber, Radio, Space, Tag, Typography, theme } from 'antd'
import dayjs from 'dayjs'
import { OUTCOME_LABEL, type Outcome } from '@/data/types'
import type { GateEvaluation } from '@/engine/gate'
import { OUTCOME_PRIORITY } from '@/engine/gate'
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

/** Kapı sonucu seçimi. Öneri gösterilir. Değiştirmek gerekçe ister. */
export function OutcomePanel({ evaluation, onSave, singleFounder, saving }: { evaluation: GateEvaluation; onSave: (d: OutcomeDraft) => void; singleFounder: boolean; saving?: boolean }) {
  const { token } = theme.useToken()
  const [d, setD] = useState<OutcomeDraft>({ chosen: evaluation.suggested, reason: '', counterView: '', secondOpinion: '', decidedBy: '', reopenWhen: '' })
  const changed = d.chosen !== evaluation.suggested
  const needsSecond = singleFounder && (d.chosen === 'ilerle' || d.chosen === 'kosulluIlerle') && changed
  const condOk = d.chosen !== 'kosulluIlerle' || (d.conditional?.scope && d.conditional?.deadline && d.conditional?.owner && d.conditional?.closingEvidence)
  const canSave = d.reason.trim().length > 0 && d.decidedBy.trim().length > 0 && condOk && (!needsSecond || d.secondOpinion.trim().length > 0)
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Callout tone="sonuc" title="Sistemin önerisi">
        <div style={{ display: 'grid', gap: 8 }}>
          <DecisionBadge outcome={evaluation.suggested} size="lg" />
          <ul style={{ margin: 0, paddingLeft: 20 }}>{evaluation.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </div>
      </Callout>
      <div style={{ display: 'grid', gap: 8 }}>
        <Typography.Text strong>Sonucu seçin</Typography.Text>
        <Radio.Group value={d.chosen} onChange={(e) => setD({ ...d, chosen: e.target.value })} style={{ display: 'grid', gap: 8 }}>
          {OUTCOME_PRIORITY.map((o) => {
            const blocked = evaluation.blockedOutcomes.includes(o)
            return (
              <Radio key={o} value={o} disabled={blocked} style={{ alignItems: 'flex-start', padding: 10, borderRadius: token.borderRadius, background: d.chosen === o ? token.colorPrimaryBg : token.colorFillAlter, width: '100%', margin: 0 }}>
                <span style={{ display: 'grid', gap: 2 }}>
                  <span style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600 }}>{OUTCOME_LABEL[o]}</span>
                    {o === evaluation.suggested ? <Tag color="processing" style={{ fontSize: 14 }}>Öneri</Tag> : null}
                    {blocked ? <Tag style={{ fontSize: 14 }}>Kapalı</Tag> : null}
                  </span>
                  <span style={{ fontSize: 14, color: token.colorTextSecondary }}>{HELP[o]}</span>
                </span>
              </Radio>
            )
          })}
        </Radio.Group>
      </div>
      {d.chosen === 'kosulluIlerle' ? (
        <div style={{ display: 'grid', gap: 12, background: token.colorFillAlter, padding: 12, borderRadius: token.borderRadiusLG }}>
          <Typography.Text strong>Koşullu izin</Typography.Text>
          <Input placeholder="Hangi iş açılıyor? Kapsam" value={d.conditional?.scope ?? ''} onChange={(e) => setD({ ...d, conditional: { ...(d.conditional ?? { amountKurus: 0, deadline: '', owner: '', closingEvidence: '' }), scope: e.target.value } })} aria-label="Kapsam" />
          <Space wrap>
            <InputNumber aria-label="Üst tutar TL" placeholder="Üst tutar" min={0} value={d.conditional ? d.conditional.amountKurus / 100 : undefined} onChange={(v) => setD({ ...d, conditional: { ...(d.conditional ?? { scope: '', deadline: '', owner: '', closingEvidence: '' }), amountKurus: Math.round((v ?? 0) * 100) } })} addonAfter="TL" />
            <DatePicker aria-label="Bitiş tarihi" placeholder="Bitiş" format="DD.MM.YYYY" value={d.conditional?.deadline ? dayjs(d.conditional.deadline) : null} onChange={(v) => setD({ ...d, conditional: { ...(d.conditional ?? { scope: '', amountKurus: 0, owner: '', closingEvidence: '' }), deadline: v ? v.format('YYYY-MM-DD') : '' } })} />
          </Space>
          <Input placeholder="Sorumlu kişi" value={d.conditional?.owner ?? ''} aria-label="Sorumlu" onChange={(e) => setD({ ...d, conditional: { ...(d.conditional ?? { scope: '', amountKurus: 0, deadline: '', closingEvidence: '' }), owner: e.target.value } })} />
          <Input placeholder="Kapanış kanıtı. Ne gelince iş kapanır?" value={d.conditional?.closingEvidence ?? ''} aria-label="Kapanış kanıtı" onChange={(e) => setD({ ...d, conditional: { ...(d.conditional ?? { scope: '', amountKurus: 0, deadline: '', owner: '' }), closingEvidence: e.target.value } })} />
          <span style={{ fontSize: 14, color: token.colorTextSecondary }}>Süre uzatılamaz. Kanıt gelmezse sonuç kendiliğinden "Beklet" olur.</span>
        </div>
      ) : null}
      <label style={{ display: 'grid', gap: 4 }}>
        <span style={{ fontWeight: 500 }}>Gerekçe{changed ? '. Öneriden farklı seçtiniz. Nedenini yazın.' : ''}</span>
        <Input.TextArea rows={3} value={d.reason} onChange={(e) => setD({ ...d, reason: e.target.value })} aria-required />
      </label>
      <label style={{ display: 'grid', gap: 4 }}>
        <span style={{ fontWeight: 500 }}>Karşı görüş. Kim neden karşı?</span>
        <Input.TextArea rows={2} value={d.counterView} onChange={(e) => setD({ ...d, counterView: e.target.value })} />
      </label>
      {needsSecond ? (
        <label style={{ display: 'grid', gap: 4 }}>
          <span style={{ fontWeight: 500 }}>İkinci görüş. Tek kurucu öneriyi aşıyor. Konuyu bilen kişi ne dedi?</span>
          <Input.TextArea rows={2} value={d.secondOpinion} onChange={(e) => setD({ ...d, secondOpinion: e.target.value })} aria-required />
        </label>
      ) : null}
      <Space wrap>
        <Input placeholder="Kararı kim verdi?" value={d.decidedBy} onChange={(e) => setD({ ...d, decidedBy: e.target.value })} aria-label="Karar sahibi" style={{ width: 240 }} />
        <Input placeholder="Hangi olayda yeniden açılır?" value={d.reopenWhen} onChange={(e) => setD({ ...d, reopenWhen: e.target.value })} aria-label="Yeniden açılma koşulu" style={{ width: 300 }} />
      </Space>
      <Button type="primary" size="large" disabled={!canSave} loading={saving} onClick={() => onSave(d)}>
        Kararı kaydet
      </Button>
    </div>
  )
}
