import { lazy } from 'react'

// Bağlantının ön yüklemesi rapor üretmez. İçerik yalnız ekran açılınca yüklenir.
const Content = lazy(() => import('./reports/StrategyContent').then((module) => ({ default: module.StrategyScreen })))

export function StrategyScreen() {
  return <Content />
}
