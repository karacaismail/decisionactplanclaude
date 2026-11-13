import { Link } from 'react-router'
import { Badge, Card, Popover, Typography } from 'antd'
import { ArrowSquareOut } from '@phosphor-icons/react'
import type { StepDef } from '@/data/schema'
import '@/styles/screens-rapor.css'

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
}

const KARAR_KITABI = 'https://karacaismail.github.io/karar/'

/** Karar Kitabı bağlantısı. ModelChip ile aynı kural: #/model/slug/kavram. */
export function modelLink(m: ModelEntry): string {
  return m.slug ? `${KARAR_KITABI}#/model/${m.slug}/kavram` : KARAR_KITABI
}

/**
 * Tek yöntem kartı (`Card hoverable`). Başlık, meta satırı (bölüm, sıra, soru), "Kısaca" paragrafı.
 * Alt eylemler: "Karar Kitabı'nda aç" ve "Adımlarda kullanımı" (sayı rozeti; açılır pencerede adım bağlantıları).
 * 1 ile 128 arası genel sıra tek başına gösterilmez.
 */
export function ModelCard({ model, steps, linkSteps }: { model: ModelEntry; steps: StepDef[]; linkSteps: boolean }) {
  const titleId = `yontem-${model.slug}`
  const usage = steps.length ? (
    <ul className="method-steps" aria-label="Kullanıldığı adımlar">
      {steps.map((s) => (
        <li key={s.id}>
          {linkSteps ? <Link to={`/karar/${s.decision}/adim/${s.id}`}>Adım {s.id}. {s.title}</Link> : <span>Adım {s.id}. {s.title}</span>}
        </li>
      ))}
    </ul>
  ) : (
    <p className="helper method-steps-empty">Bu yöntem adımlarda doğrudan kullanılmıyor.</p>
  )
  return (
    <Card
      hoverable
      className="method-card"
      title={<span id={titleId}>{model.title}</span>}
      actions={[
        <a key="kitap" className="method-action" href={modelLink(model)} target="_blank" rel="noreferrer">
          <ArrowSquareOut size={16} aria-hidden />
          Karar Kitabı'nda aç
        </a>,
        <Popover key="adimlar" title="Adımlarda kullanımı" content={usage} trigger={['click']} placement="top">
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
