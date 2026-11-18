import { lazy } from 'react'

// Bağlantının ön yüklemesi rapor üretmez. İçerik yalnız ekran açılınca yüklenir.
const Content = lazy(() => import('./reports/OutputsContent').then((module) => ({ default: module.OutputsScreen })))

export function OutputsScreen() {
  return <Content />
}
