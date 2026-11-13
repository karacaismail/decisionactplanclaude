import { useState } from 'react'
import { Button, Drawer } from 'antd'
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

/** Adım içinde Karar Kitabı yöntemleri. Nötr etiket görünümlü düğmeler. Tıklanınca çekmece açılır. */
export function ModelChips({ indexes }: { indexes: number[] }) {
  const [open, setOpen] = useState<Model | null>(null)
  if (!indexes.length) return null
  return (
    <div className="model-chips">
      <span className="helper" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <BookOpen size={16} aria-hidden /> Karar Kitabı'nda hangi yöntemler var?
      </span>
      <div className="model-chip-row">
        {indexes.map((g) => {
          const m = modelByIndex(g)
          if (!m) return null
          return (
            <button key={g} type="button" className="tag model-chip" onClick={() => setOpen(m)} aria-haspopup="dialog">
              {m.title}
            </button>
          )
        })}
      </div>
      <Drawer open={Boolean(open)} onClose={() => setOpen(null)} title={open?.title} size="default" styles={{ wrapper: { maxWidth: '100vw' } }}>
        {open ? (
          <div className="drawer-body">
            <div className="drawer-tags">
              <span className="tag">{open.section}</span>
              <span className="tag">Bölümde {open.no}. sırada</span>
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
