import { useState } from 'react'
import { Button, Drawer, Tag } from 'antd'
import { BookOpen, ArrowSquareOut } from '@phosphor-icons/react'
import models from '@/data/models.json'
import { Callout } from './Callout'

interface Model {
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

const ALL = models as Model[]
export function modelByIndex(g: number): Model | undefined {
  return ALL[g - 1]
}

const KARAR_KITABI = 'https://karacaismail.github.io/karar/'

/**
 * Adım içinde Karar Kitabı yöntemleri. Her yöntem tıklanabilir bir `Tag` etiketidir.
 * Tıklanınca ya da Enter ile yandan `Drawer` açılır. `showTitle` kapalıysa yalnız etiketler çizilir.
 */
export function ModelChips({ indexes, showTitle = true }: { indexes: number[]; showTitle?: boolean }) {
  const [open, setOpen] = useState<Model | null>(null)
  if (!indexes.length) return null
  return (
    <div className="model-chips">
      {showTitle ? (
        <span className="helper model-chips-title">
          <BookOpen size={16} aria-hidden /> Karar Kitabı'nda hangi yöntemler var?
        </span>
      ) : null}
      <div className="model-chip-row" role="list">
        {indexes.map((g) => {
          const m = modelByIndex(g)
          if (!m) return null
          return (
            <Tag
              key={g}
              role="button"
              tabIndex={0}
              aria-haspopup="dialog"
              className="model-chip"
              icon={<BookOpen size={14} aria-hidden />}
              onClick={() => setOpen(m)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(m) } }}
            >
              {m.title}
            </Tag>
          )
        })}
      </div>
      <Drawer open={Boolean(open)} onClose={() => setOpen(null)} title={open?.title} size="default" styles={{ wrapper: { maxWidth: '100vw' } }}>
        {open ? (
          <div className="drawer-body">
            <div className="drawer-tags">
              <Tag>{open.section}</Tag>
              <Tag>Bölümde {open.no}. sırada</Tag>
            </div>
            <p className="helper" style={{ margin: 0 }}>{open.question}</p>
            <Callout tone="sonuc" title="Kısaca">{open.simple ?? open.summary}</Callout>
            {open.example ? <Callout tone="ornek" title={open.example.title}>{open.example.text}</Callout> : null}
            <Button type="link" href={`${KARAR_KITABI}#/model/${open.slug}/kavram`} target="_blank" rel="noreferrer" icon={<ArrowSquareOut size={16} />} iconPlacement="end" style={{ padding: 0, justifySelf: 'start' }}>
              Karar Kitabı'nda aç
            </Button>
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}
