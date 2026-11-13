import { useState } from 'react'
import { Button, Typography, theme } from 'antd'
import { Link } from 'react-router'
import { ArrowSquareOut, CaretDown, CaretUp } from '@phosphor-icons/react'
import type { StepDef } from '@/data/schema'
import { Callout } from './Callout'

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
 * Tek yöntem kartı. Başlık, bölüm ve sıra, "Kısaca", "Günlük Hayattan" ve kullanıldığı adımlar.
 * 1 ile 128 arası genel sıra tek başına gösterilmez.
 */
export function ModelCard({ model, steps, linkSteps }: { model: ModelEntry; steps: StepDef[]; linkSteps: boolean }) {
  const { token } = theme.useToken()
  const [open, setOpen] = useState(false)
  const exampleId = `ornek-${model.slug}`
  return (
    <article aria-labelledby={`yontem-${model.slug}`} style={{ background: token.colorBgContainer, borderRadius: token.borderRadiusLG, padding: 16, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 12, alignContent: 'start', minWidth: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
        <Typography.Title level={3} id={`yontem-${model.slug}`} style={{ fontSize: 18, margin: 0 }}>{model.title}</Typography.Title>
        <span style={{ fontSize: 14, color: token.colorTextSecondary }}>{model.section}, {model.no}. yöntem</span>
      </div>
      <Typography.Text style={{ fontSize: 16 }}>Soru: {model.question}</Typography.Text>
      <Callout tone="sonuc" title="Kısaca">{model.simple ?? model.summary}</Callout>
      {model.example ? (
        <>
          <Button onClick={() => setOpen((s) => !s)} aria-expanded={open} aria-controls={exampleId} icon={open ? <CaretUp size={18} /> : <CaretDown size={18} />} iconPlacement="end" style={{ justifySelf: 'start' }}>
            {open ? 'Örneği gizle' : 'Günlük hayattan örneği göster'}
          </Button>
          {open ? (
            <div id={exampleId}>
              <Callout tone="ornek" title="Günlük Hayattan">
                <span style={{ fontWeight: 600 }}>{model.example.title}. </span>
                {model.example.text}
              </Callout>
            </div>
          ) : null}
        </>
      ) : null}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 6 }}>
        <span style={{ fontSize: 14, color: token.colorTextSecondary }}>{steps.length ? 'Bu yöntem şu adımlarda kullanılır:' : 'Bu yöntem adımlarda doğrudan kullanılmıyor.'}</span>
        {steps.length ? (
          <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4 }}>
            {steps.map((s) => (
              <li key={s.id}>
                {linkSteps ? <Link to={`/karar/${s.decision}/adim/${s.id}`}>Adım {s.id}. {s.title}</Link> : <span>Adım {s.id}. {s.title}</span>}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <Button type="link" href={modelLink(model)} target="_blank" rel="noreferrer" icon={<ArrowSquareOut size={18} />} style={{ padding: 0, justifySelf: 'start' }}>
        Karar Kitabı'nda aç
      </Button>
    </article>
  )
}
