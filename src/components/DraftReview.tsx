import '@/styles/bilesen/DraftReview.css'
import { useMemo } from 'react'
import { App as AntApp, Button, Popconfirm } from 'antd'
import { FloppyDisk, Trash } from '@phosphor-icons/react'
import { STEPS } from '@/data/registry'
import { formatDate } from '@/engine/format'
import { acceptDraft, discardDraft, useDraftStore, type Draft } from '@/store/drafts'

const PREVIEW = 160

/** Taslaktaki değerin kısa metni. Liste satır sayısıyla, uzun metin kesilerek görünür. */
function preview(value: unknown): string {
  if (Array.isArray(value)) return `${value.length} satır`
  if (typeof value === 'string') return value.length > PREVIEW ? `${value.slice(0, PREVIEW - 1)}…` : value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return 'Değer var'
}

function stepFields(draft: Extract<Draft, { kind: 'adim' }>): { label: string; value: string }[] {
  const fields = new Map((STEPS[draft.step]?.sections ?? []).flatMap((s) => s.fields.map((f) => [f.key, f.label] as const)))
  return Object.entries(draft.patch).map(([key, value]) => ({ label: fields.get(key) || key, value: preview(value) }))
}

/**
 * Bekleyen taslakları gösterir. Taslak plana yazılmamıştır.
 * Kişi "Kaydet" düğmesine basarsa taslak plana yazılır. "Sil" düğmesi taslağı atar.
 * Kayıt adım ekranıyla aynı kurala uyar. Kilitli bölüme yazılmaz.
 * Dolu düğme kullanılmaz. Ekranın tek dolu düğmesi ekranın kendi işine kalır.
 */
export function DraftReview({ planId, kind, step }: { planId: string; kind: Draft['kind']; step?: string }) {
  const { message } = AntApp.useApp()
  const all = useDraftStore((s) => s.drafts)
  const drafts = useMemo(() => all.filter((d) => d.planId === planId && d.kind === kind && (kind !== 'adim' || (d.kind === 'adim' && d.step === step))), [all, planId, kind, step])
  if (!drafts.length) return null

  const save = (d: Draft) => {
    const error = acceptDraft(d.id)
    if (error) message.error(error)
    else message.success(d.kind === 'kanit' ? 'Kanıt kaydedildi. Kanıt defterine eklendi.' : 'Taslak bu adıma yazıldı.')
  }
  const headingId = `taslak-${kind}${step ? `-${step}` : ''}`

  return (
    <section className="draft-review" aria-labelledby={headingId}>
      <h3 id={headingId} className="draft-review-title">Taslak var</h3>
      <p className="draft-review-help">
        {kind === 'kanit'
          ? 'Bu taslak plana henüz yazılmadı. Metni okuyun. Doğruysa “Kaydet” düğmesine basın. Kanıt, kanıt defterine eklenir.'
          : 'Bu taslak plana henüz yazılmadı. Değerleri okuyun. Doğruysa “Kaydet” düğmesine basın. Değerler bu adıma yazılır.'}
      </p>
      <ul className="draft-review-list">
        {drafts.map((d, i) => (
          <li key={d.id} className="draft-review-item">
            <p className="draft-review-date">Hazırlanma: {formatDate(d.createdAt)}.</p>
            {d.kind === 'kanit' ? (
              <p className="draft-review-text">{d.text}</p>
            ) : (
              <dl className="draft-review-fields">
                {stepFields(d).map((f) => (
                  <div key={f.label}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="draft-review-actions" role="group" aria-label={`${i + 1}. taslak için işlemler`}>
              <Button icon={<FloppyDisk size={18} aria-hidden />} onClick={() => save(d)}>Kaydet</Button>
              <Popconfirm
                title="Taslak silinsin mi?"
                description="Taslak plana yazılmadan silinir. Bu işlem geri alınamaz."
                okText="Sil"
                cancelText="Vazgeç"
                okButtonProps={{ danger: true }}
                onConfirm={() => {
                  discardDraft(d.id)
                  message.success('Taslak silindi. Plan değişmedi.')
                }}
              >
                <Button danger icon={<Trash size={18} aria-hidden />}>Sil</Button>
              </Popconfirm>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
