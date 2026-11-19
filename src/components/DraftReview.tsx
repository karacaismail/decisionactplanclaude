import '@/styles/bilesen/DraftReview.css'
import { useMemo, useRef } from 'react'
import { App as AntApp, Button, Popconfirm } from 'antd'
import { FloppyDisk, Trash } from '@phosphor-icons/react'
import { STEPS } from '@/data/registry'
import { formatDate } from '@/engine/format'
import { acceptDraft, discardDraft, useDraftStore, type Draft } from '@/store/drafts'
import { usePlanStore } from '@/store/planStore'

const PREVIEW = 160

/** Taslaktaki değerin kısa metni. Liste satır sayısıyla, uzun metin kesilerek görünür. */
function preview(value: unknown): string {
  if (Array.isArray(value)) return `${value.length} satır`
  if (typeof value === 'string') return value.length > PREVIEW ? `${value.slice(0, PREVIEW - 1)}…` : value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return 'Değer var'
}

/**
 * Taslaktaki alanlar. Liste alanında şimdiki satır sayısı da görünür.
 * Kayıt listenin yerine geçer. Kişi bunu kaydetmeden önce bilir.
 */
function stepFields(draft: Extract<Draft, { kind: 'adim' }>, current: Record<string, unknown>): { key: string; label: string; value: string; replaces?: string }[] {
  const fields = new Map((STEPS[draft.step]?.sections ?? []).flatMap((s) => s.fields.map((f) => [f.key, f.label] as const)))
  return Object.entries(draft.patch).map(([key, value]) => {
    const now = current[key]
    const replaces = Array.isArray(value) ? `Şimdi ${Array.isArray(now) ? now.length : 0} satır var. Kayıt bu satırların yerine geçer.` : undefined
    return { key, label: fields.get(key) || key, value: Array.isArray(value) ? `Taslakta ${value.length} satır var.` : preview(value), replaces }
  })
}

/** Liste boşalınca odak ekranın ana başlığına gider. Böylece odak kaybolmaz. */
function focusHeading() {
  const heading = document.querySelector<HTMLElement>('main h1')
  if (!heading) return
  if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1')
  heading.focus()
}

/**
 * Bekleyen taslakları gösterir. Taslak plana yazılmamıştır.
 * Kişi "Kaydet" düğmesine basarsa taslak plana yazılır. "Sil" düğmesi taslağı atar.
 * Kayıt adım ekranıyla aynı kurala uyar. Kilitli bölüme yazılmaz.
 * Dolu düğme kullanılmaz. Ekranın tek dolu düğmesi ekranın kendi işine kalır.
 */
export function DraftReview({ planId, kind, step, locked = false, onEmpty = focusHeading }: {
  planId: string
  kind: Draft['kind']
  step?: string
  /** Bölüm kilitliyse "Kaydet" kapalıdır. Nedeni yazılıdır. */
  locked?: boolean
  /** Son taslak gidince odağı alacak yer. */
  onEmpty?: () => void
}) {
  const { message } = AntApp.useApp()
  const list = useRef<HTMLUListElement>(null)
  const values = usePlanStore((s) => (step ? s.plans[planId]?.steps[step]?.values : undefined))
  const all = useDraftStore((s) => s.drafts)
  const drafts = useMemo(() => all.filter((d) => d.planId === planId && d.kind === kind && (kind !== 'adim' || (d.kind === 'adim' && d.step === step))), [all, planId, kind, step])
  if (!drafts.length) return null

  /* Taslak gidince odak sonraki taslağa geçer. Taslak kalmadıysa odak başka yere gider. */
  const moveFocus = (index: number) => {
    requestAnimationFrame(() => {
      const items = list.current?.querySelectorAll<HTMLElement>('.draft-review-item')
      const next = items?.[index] ?? items?.[index - 1]
      const button = next?.querySelector<HTMLElement>('button:not([disabled])')
      if (button) button.focus()
      else onEmpty()
    })
  }

  const save = (d: Draft, index: number) => {
    const error = acceptDraft(d.id)
    if (error) {
      message.error(error)
      return
    }
    message.success(d.kind === 'kanit' ? 'Kanıt kaydedildi. Kanıt defterine eklendi.' : 'Taslak bu adıma yazıldı.')
    moveFocus(index)
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
      {locked ? <p className="draft-review-help">Bu adım kilitli. Kilit açılınca taslağı kaydedebilirsiniz.</p> : null}
      <ul className="draft-review-list" ref={list}>
        {drafts.map((d, i) => (
          <li key={d.id} className="draft-review-item">
            <p className="draft-review-date">Hazırlanma: {formatDate(d.createdAt)}.</p>
            {d.kind === 'kanit' ? (
              <p className="draft-review-text">{d.text}</p>
            ) : (
              <dl className="draft-review-fields">
                {stepFields(d, values ?? {}).map((f) => (
                  <div key={f.key}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                    {f.replaces ? <dd>{f.replaces}</dd> : null}
                  </div>
                ))}
              </dl>
            )}
            <div className="draft-review-actions" role="group" aria-label={`${i + 1}. taslak için işlemler`}>
              <Button icon={<FloppyDisk size={18} aria-hidden />} disabled={locked} onClick={() => save(d, i)}>Kaydet</Button>
              <Popconfirm
                title="Taslak silinsin mi?"
                description="Taslak plana yazılmadan silinir. Bu işlem geri alınamaz."
                okText="Sil"
                cancelText="Vazgeç"
                okButtonProps={{ danger: true }}
                onConfirm={() => {
                  discardDraft(d.id)
                  message.success('Taslak silindi. Plan değişmedi.')
                  moveFocus(i)
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
