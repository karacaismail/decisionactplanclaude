import { lazy } from 'react'

// Bağlantının ön yüklemesi rapor üretmez. İçerik yalnız ekran açılınca yüklenir.
const Content = lazy(() => import('./reports/TransitionContent').then((module) => ({ default: module.TransitionScreen })))

export function TransitionScreen() {
  return <Content />
}
