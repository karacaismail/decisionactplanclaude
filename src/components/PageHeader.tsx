import { useEffect, type ReactNode } from 'react'
import '@/styles/mobil-token.css'
import { NewPill } from '@/components/Pill'

const APP_NAME = 'Girişimci Aksiyon Planı'

/**
 * Sayfa başlığı üst etiketi, açıklamayı ve eylemleri birlikte sunar.
 * Eylem grubunda en çok üç düğme olur. Dolu düğme en çok bir tanedir.
 * Tarayıcı sekmesinin adını "Sayfa · Girişimci Aksiyon Planı" yapar.
 */
export function PageHeader({
  title,
  kicker,
  description,
  actions,
  documentTitle,
  newPath,
}: {
  title: string
  kicker?: string
  /** Eski çağrılar için tutulur, çizilmez. Renkli ikon kutusu kullanılmaz. */
  icon?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  documentTitle?: string
  /** Sayfa yeniyse başlığın yanında "Yeni" etiketi görünür. Değer sayfanın yoludur. Örneğin "/gecis". */
  newPath?: string
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
    <header className="page-header mt-page-header">
      <div className="page-header-text mt-page-header-text">
        {kicker ? <span className="page-kicker">{kicker}</span> : null}
        {newPath ? (
          <div className="page-title-row">
            <h1>{title}</h1>
            <NewPill path={newPath} />
          </div>
        ) : (
          <h1>{title}</h1>
        )}
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="page-header-actions mt-header-actions">{actions}</div> : null}
    </header>
  )
}

/** Bölüm başlığı isteğe bağlı açıklama ve eylemleri sunar. */
export function SectionHead({ title, description, actions, level = 2 }: { title: string; description?: ReactNode; actions?: ReactNode; level?: 2 | 3 }) {
  return (
    <div className="section-head mt-section-head">
      {level === 2 ? <h2>{title}</h2> : <h3>{title}</h3>}
      {actions ? <div className="section-actions mt-header-actions">{actions}</div> : null}
      {description ? <p>{description}</p> : null}
    </div>
  )
}
