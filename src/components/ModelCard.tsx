import { Link } from 'react-router'
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
 * Tek yöntem kartı. En çok dört yazı stili: başlık 16/600, meta 14/400 gri, gövde 16/400 ve etiket.
 * Meta satırı bölümü, sırayı ve soruyu birlikte verir. "Kısaca" ilk gövde paragrafıdır.
 * Günlük hayattan örnek ikinci paragraftır. Akordeon ve ara başlık yoktur.
 * 1 ile 128 arası genel sıra tek başına gösterilmez.
 */
export function ModelCard({ model, steps, linkSteps }: { model: ModelEntry; steps: StepDef[]; linkSteps: boolean }) {
  return (
    <article className="surface-card method-card" aria-labelledby={`yontem-${model.slug}`}>
      <div className="method-head">
        <h3 id={`yontem-${model.slug}`}>{model.title}</h3>
        <p className="helper">
          {model.section}, {model.no}. yöntem. Soru: {model.question}
        </p>
      </div>
      <p className="method-body">{model.simple ?? model.summary}</p>
      {model.example ? (
        <p className="method-body">
          Günlük hayattan örnek: {model.example.title}. {model.example.text}
        </p>
      ) : null}
      {steps.length ? (
        <div className="method-tags" aria-label="Kullanıldığı adımlar">
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
      <a className="text-link" href={modelLink(model)} target="_blank" rel="noreferrer">
        Karar Kitabı'nda aç
        <ArrowSquareOut size={16} aria-hidden />
      </a>
    </article>
  )
}
