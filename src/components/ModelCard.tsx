import '@/styles/bilesen/ModelCard.css'
import { Link } from 'react-router'
import { stepHeading } from '@/data/registry'
import { Badge, Card, Popover, Typography } from 'antd'
import { ArrowSquareOut, ListNumbers } from '@phosphor-icons/react'
import type { StepDef } from '@/data/schema'
export interface ModelEntry {
  g: number
  slug: string
  title: string
  question: string
  summary: string
  section: string
  sectionNo: number
  no: number
  simple: string | null
  example: { title: string; text: string } | null
  /** Bu yöntemin "Nasıl uygulanır" yardımı var mı? Yardım ayrı dosyadan gelir. */
  help?: boolean
}

const KARAR_KITABI = 'https://karacaismail.github.io/karar/'

/** Karar Kitabı bağlantısı. ModelChip ile aynı kural: #/model/slug/kavram. */
export function modelLink(m: ModelEntry): string {
  return m.slug ? `${KARAR_KITABI}#/model/${m.slug}/kavram` : KARAR_KITABI
}

/**
 * Tek yöntem kartı (`Card hoverable`). Başlık, meta satırı (bölüm, sıra, soru), "Kısaca" paragrafı.
 * Alt eylemler: yardımı varsa "Nasıl uygulanır", "Karar Kitabı'nda aç" ve "Adımlarda kullanımı" (sayı rozeti; açılır pencerede adım bağlantıları).
 * 1 ile 128 arası genel sıra tek başına gösterilmez.
 */
export function ModelCard({ model, steps, linkSteps, onHelp }: { model: ModelEntry; steps: StepDef[]; linkSteps: boolean; onHelp?: (m: ModelEntry) => void }) {
  const titleId = `yontem-${model.slug}`
  const usage = steps.length ? (
    <ul className="method-steps mt-method-steps" aria-label="Kullanıldığı adımlar">
      {steps.map((s) => (
        <li key={s.id}>
          {linkSteps ? <Link to={`/karar/${s.decision}/adim/${s.id}`}>{stepHeading(s.id)}</Link> : <span>{stepHeading(s.id)}</span>}
        </li>
      ))}
    </ul>
  ) : (
    <p className="helper method-steps-empty mt-method-steps-empty">Bu yöntem adımlarda doğrudan kullanılmıyor.</p>
  )
  return (
    <Card
      hoverable
      className="method-card mt-method-card"
      title={<span id={titleId}>{model.title}</span>}
      actions={[
        ...(model.help && onHelp
          ? [
              <button key="yardim" type="button" className="method-action method-help" aria-haspopup="dialog" onClick={() => onHelp(model)}>
                <ListNumbers className="mt-method-action-icon" aria-hidden />
                Nasıl uygulanır
              </button>,
            ]
          : []),
        <a key="kitap" className="method-action" href={modelLink(model)} target="_blank" rel="noreferrer">
          <ArrowSquareOut className="mt-method-action-icon" aria-hidden />
          Karar Kitabı'nda aç
        </a>,
        <Popover key="adimlar" title="Adımlarda kullanımı" content={usage} trigger={['click']} placement="top" classNames={{ root: 'mt-method-usage-popover' }}>
          <button type="button" className="method-action method-usage" aria-label={`Adımlarda kullanımı: ${steps.length} adım`}>
            Adımlarda kullanımı
            <Badge count={steps.length} showZero overflowCount={999} size="small" className="method-badge" />
          </button>
        </Popover>,
      ]}
    >
      <Typography.Text type="secondary" className="method-meta">
        {model.section}, {model.no}. yöntem. Soru: {model.question}
      </Typography.Text>
      <Typography.Paragraph className="method-body">
        <strong>Kısaca:</strong> {model.simple ?? model.summary}
      </Typography.Paragraph>
      {model.example ? (
        <Typography.Paragraph className="method-body method-example">
          Günlük hayattan örnek: {model.example.title}. {model.example.text}
        </Typography.Paragraph>
      ) : null}
    </Card>
  )
}
