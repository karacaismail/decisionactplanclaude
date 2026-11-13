import { useState } from 'react'
import { Button } from 'antd'
import { Link } from 'react-router'
import { ArrowSquareOut, CaretDown, CaretUp } from '@phosphor-icons/react'
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
 * Tek yöntem kartı. Başlık, bölüm ve sıra, soru, "Kısaca", "Günlük Hayattan" ve kullanıldığı adımlar.
 * "Kısaca" ve "Günlük Hayattan" renkli kutu değildir. Düz alt bölüm olarak yazılır.
 * 1 ile 128 arası genel sıra tek başına gösterilmez.
 */
export function ModelCard({ model, steps, linkSteps }: { model: ModelEntry; steps: StepDef[]; linkSteps: boolean }) {
  const [open, setOpen] = useState(false)
  const exampleId = `ornek-${model.slug}`
  return (
    <article className="surface-card" aria-labelledby={`yontem-${model.slug}`}>
      <div className="surface-card-head">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 2, minWidth: 0 }}>
          <h3 id={`yontem-${model.slug}`}>{model.title}</h3>
          <span className="helper">{model.section}, {model.no}. yöntem</span>
        </div>
      </div>
      <p className="method-question">Soru: {model.question}</p>
      <div className="method-sub">
        <h4>Kısaca</h4>
        <p>{model.simple ?? model.summary}</p>
      </div>
      {model.example ? (
        <>
          <Button type="text" size="small" onClick={() => setOpen((s) => !s)} aria-expanded={open} aria-controls={exampleId} icon={open ? <CaretUp size={16} /> : <CaretDown size={16} />} iconPlacement="end" style={{ justifySelf: 'start', paddingInline: 0 }}>
            {open ? 'Örneği gizle' : 'Günlük hayattan örneği göster'}
          </Button>
          {open ? (
            <div id={exampleId} className="method-sub">
              <h4>Günlük Hayattan</h4>
              <p>
                <strong>{model.example.title}.</strong> {model.example.text}
              </p>
            </div>
          ) : null}
        </>
      ) : null}
      <div className="method-sub">
        <h4>{steps.length ? 'Kullanıldığı adımlar' : 'Adımlarda kullanımı'}</h4>
        {steps.length ? (
          <div className="method-tags">
            {steps.map((s) =>
              linkSteps ? (
                <Link key={s.id} className="tag" to={`/karar/${s.decision}/adim/${s.id}`} title={s.title}>
                  Adım {s.id}
                </Link>
              ) : (
                <span key={s.id} className="tag" title={s.title}>
                  Adım {s.id}
                </span>
              ),
            )}
          </div>
        ) : (
          <p className="helper">Bu yöntem adımlarda doğrudan kullanılmıyor.</p>
        )}
      </div>
      <a className="text-link" href={modelLink(model)} target="_blank" rel="noreferrer">
        Karar Kitabı'nda aç
        <ArrowSquareOut size={16} aria-hidden />
      </a>
    </article>
  )
}
