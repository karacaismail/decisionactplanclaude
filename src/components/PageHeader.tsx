import { useEffect, type ReactNode } from 'react'

const APP_NAME = 'Girişimci Aksiyon Planı'

/**
 * Sayfa başlığı: üst etiket (14 px büyük harf), 28 px başlık, açıklama ve sağda eylemler.
 * Eylem grubunda en çok üç düğme olur; dolu düğme en çok bir tanedir.
 * Tarayıcı sekmesinin adını "Sayfa · Girişimci Aksiyon Planı" yapar.
 */
export function PageHeader({
  title,
  kicker,
  description,
  actions,
  documentTitle,
}: {
  title: string
  kicker?: string
  /** Eski çağrılar için tutulur, çizilmez. Renkli ikon kutusu kullanılmaz. */
  icon?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  documentTitle?: string
}) {
  const tab = documentTitle ?? title
  useEffect(() => {
    const prev = document.title
    document.title = `${tab} · ${APP_NAME}`
    return () => {
      document.title = prev
    }
  }, [tab])
  return (
    <header className="page-header">
      <div className="page-header-text">
        {kicker ? <span className="page-kicker">{kicker}</span> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </header>
  )
}

/** Bölüm başlığı. h2 20 px. Sağda isteğe bağlı eylemler. */
export function SectionHead({ title, description, actions, level = 2 }: { title: string; description?: ReactNode; actions?: ReactNode; level?: 2 | 3 }) {
  return (
    <div className="section-head">
      {level === 2 ? <h2>{title}</h2> : <h3>{title}</h3>}
      {actions ? <div className="section-actions">{actions}</div> : null}
      {description ? <p>{description}</p> : null}
    </div>
  )
}
