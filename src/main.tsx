import { StrictMode, useEffect, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { App as AntApp, ConfigProvider } from 'antd'
import trTR from 'antd/locale/tr_TR'
import { HashRouter } from 'react-router'
import './styles/global.css'
import { buildTheme } from './theme/antdTheme'
import { usePlanStore } from './store/planStore'
import { FocusMode } from './app/FocusMode'
import { AppRoutes } from './app/routes'

function Root() {
  const mode = usePlanStore((s) => s.theme)
  const resolved = useMemo<'light' | 'dark'>(() => {
    if (mode !== 'system') return mode
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }, [mode])
  const themeConfig = useMemo(() => buildTheme(resolved), [resolved])
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved)
    document.documentElement.style.colorScheme = resolved
    document.body.style.background = resolved === 'dark' ? '#16191D' : '#F8F7F4'
  }, [resolved])
  return (
    <ConfigProvider theme={themeConfig} locale={trTR}>
      <AntApp>
        <FocusMode />
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AntApp>
    </ConfigProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
