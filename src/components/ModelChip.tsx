import { useState } from 'react'
import { Tag } from 'antd'
import { BookOpen } from '@phosphor-icons/react'
import models from '@/data/models.json'
import { ModelDrawer } from './ModelDrawer'
import type { ModelEntry } from './ModelCard'

type Model = ModelEntry

const ALL = models as Model[]
export function modelByIndex(g: number): Model | undefined {
  return ALL[g - 1]
}

/**
 * Adım içinde Karar Kitabı yöntemleri. Her yöntem tıklanabilir bir `Tag` etiketidir.
 * Tıklanınca ya da Enter ile yandan yöntem paneli açılır. Panel yöntem yardımını da gösterir. `showTitle` kapalıysa yalnız etiketler çizilir.
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
      <ModelDrawer model={open} onClose={() => setOpen(null)} />
    </div>
  )
}
