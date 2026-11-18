import { useState } from 'react'
import { BookOpen } from '@phosphor-icons/react'
import models from '@/data/models.json'
import '@/styles/mobil-token.css'
import { ModelDrawer } from './ModelDrawer'
import type { ModelEntry } from './ModelCard'

type Model = ModelEntry

const ALL = models as Model[]
export function modelByIndex(g: number): Model | undefined {
  return ALL[g - 1]
}

/**
 * Her yöntem bir düğmedir. Tıklama, Enter veya Space yöntem panelini açar.
 * Panel yöntem yardımını da gösterir. `showTitle` kapalıysa yalnız düğmeler görünür.
 */
export function ModelChips({ indexes, showTitle = true }: { indexes: number[]; showTitle?: boolean }) {
  const [open, setOpen] = useState<Model | null>(null)
  if (!indexes.length) return null
  return (
    <div className="model-chips mt-model-chips">
      {showTitle ? (
        <span className="helper model-chips-title mt-model-chips-title">
          <BookOpen size="var(--icon-inline)" aria-hidden /> Karar Kitabı'nda hangi yöntemler var?
        </span>
      ) : null}
      <ul className="model-chip-row mt-model-chip-row" role="list">
        {indexes.map((g) => {
          const m = modelByIndex(g)
          if (!m) return null
          return (
            <li key={g} className="mt-model-chip-item">
              <button
                type="button"
                aria-haspopup="dialog"
                className="model-chip mt-model-chip"
                onClick={() => setOpen(m)}
              >
                <span className="mt-model-chip-visual">
                  <BookOpen className="mt-model-chip-icon" size="var(--icon-small)" aria-hidden />
                  <span className="mt-model-chip-label">{m.title}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <ModelDrawer model={open} onClose={() => setOpen(null)} />
    </div>
  )
}
