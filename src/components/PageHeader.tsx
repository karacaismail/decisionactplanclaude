import { useEffect, type ReactNode } from 'react'

const APP_NAME = 'Girişimci Aksiyon Planı'

/**
 * Sayfa başlığı: üst etiket, başlık, açıklama cümlesi ve sağda eylemler.
 * Tarayıcı sekmesinin adını "Sayfa · Girişimci Aksiyon Planı" yapar.
 */
export function PageHeader({
  title,
  kicker,
  icon,
  description,
  actions,
  documentTitle,
}: {
  title: string
  kicker?: string
  icon?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  /** Sekme adı başlıktan farklı olacaksa yazılır. */
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
        {kicker || icon ? (
          <div className="page-header-kicker">
            {icon}
            {kicker ? <span>{kicker}</span> : null}
          </div>
        ) : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </header>
  )
}
