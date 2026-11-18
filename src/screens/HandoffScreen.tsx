import { lazy } from 'react'

// Bağlantının ön yüklemesi rapor üretmez. İçerik yalnız ekran açılınca yüklenir.
const Content = lazy(() => import('./reports/HandoffContent').then((module) => ({ default: module.HandoffScreen })))

export function HandoffScreen() {
  return <Content />
}
