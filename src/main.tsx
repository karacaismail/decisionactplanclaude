import '@/styles/temel/temel.css'
import { StrictMode, useEffect, useLayoutEffect, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { App as AntApp, ConfigProvider } from 'antd'
import trTR from 'antd/locale/tr_TR'
import { HashRouter } from 'react-router'
import { buildTheme } from './theme/antdTheme'
import { palette } from './theme/tokens'
import { usePlanStore } from './store/planStore'
/* Çekirdek modül altyapısına ekranlar çizilmeden bağlanır. */
import './store/platformBridge'
import { FocusMode } from './app/FocusMode'
import { SyncGuard } from './app/SyncGuard'
import { AppRoutes, preloadRoute } from './app/routes'
import { loadInputStyles } from './app/girisStilleri'
import { usePrintMode } from './app/printMode'

function Root() {
  const mode = usePlanStore((s) => s.theme)
  /* Kâğıda her zaman açık tema basılır. */
  const printing = usePrintMode()
  const resolved = useMemo<'light' | 'dark'>(() => {
    if (printing) return 'light'
    if (mode !== 'system') return mode
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }, [mode, printing])
  const themeConfig = useMemo(() => buildTheme(resolved), [resolved])
  // Yazdırmadan önce eşzamanlı çalışır. Böylece kâğıt düzeni açık temayla kurulur.
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved)
    document.documentElement.style.colorScheme = resolved
    document.body.style.background = palette(resolved).surfacePage
  }, [resolved])
  useEffect(() => {
    const prefetchLink = (event: PointerEvent) => {
      if (event.type === 'pointerover' && event.pointerType !== 'mouse') return
      if (event.type === 'pointerdown' && event.pointerType !== 'touch') return
      if (!(event.target instanceof Element)) return
      const link = event.target.closest('a[href]')
      if (!(link instanceof HTMLAnchorElement) || link.hasAttribute('download')) return
      const target = link.getAttribute('target') ?? document.querySelector('base[target]')?.getAttribute('target')
      if (target && target.toLowerCase() !== '_self') return

      let url: URL
      try {
        url = new URL(link.href)
      } catch {
        return
      }
      if (
        url.origin !== window.location.origin ||
        url.pathname !== window.location.pathname ||
        url.search !== window.location.search ||
        !url.hash.startsWith('#/')
      ) return

      // Yükleyici tekrarları ve önceden yüklenmeyecek raporları yönetir.
      void preloadRoute(url.href).catch(() => {
        // Ön yükleme hatası bağlantının açılmasını engellemez.
      })
    }
    document.addEventListener('pointerover', prefetchLink, { passive: true })
    document.addEventListener('pointerdown', prefetchLink, { passive: true })
    return () => {
      document.removeEventListener('pointerover', prefetchLink)
      document.removeEventListener('pointerdown', prefetchLink)
    }
  }, [])
  return (
    <ConfigProvider theme={themeConfig} locale={trTR}>
      <AntApp>
        <FocusMode />
        <SyncGuard />
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AntApp>
    </ConfigProvider>
  )
}

/* Dokunma ve fare katmanı cihazın giriş türüne göre iner. */
loadInputStyles()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
