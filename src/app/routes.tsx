import { Component, lazy, Suspense, type ComponentType, type ReactNode } from 'react'
import { Button } from 'antd'
import { matchRoutes, Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router'
import { AppShell } from './AppShell'
import { Callout } from '@/components/Callout'
import { LoadingState } from '@/components/LoadingState'
import { useCurrentPlan } from '@/store/planStore'

type ScreenModule = { default: ComponentType }

/** Ön yükleme ve gezinme aynı isteği paylaşır. Başarısız ön yükleme yeniden denenebilir. */
function lazyScreen(loader: () => Promise<ScreenModule>) {
  let request: Promise<ScreenModule> | undefined
  const load = () => {
    request ??= loader().catch((error: unknown) => {
      request = undefined
      throw error
    })
    return request
  }
  return [lazy(load), load] as const
}

const [PlansScreen, loadPlans] = lazyScreen(() => import('@/screens/PlansScreen').then((m) => ({ default: m.PlansScreen })))
const [StartScreen, loadStart] = lazyScreen(() => import('@/screens/StartScreen').then((m) => ({ default: m.StartScreen })))
const [OverviewScreen, loadOverview] = lazyScreen(() => import('@/screens/OverviewScreen').then((m) => ({ default: m.OverviewScreen })))
const [DecisionScreen, loadDecision] = lazyScreen(() => import('@/screens/DecisionScreen').then((m) => ({ default: m.DecisionScreen })))
const [WorkScreen, loadWork] = lazyScreen(() => import('@/screens/WorkScreen').then((m) => ({ default: m.WorkScreen })))
const [ReviewScreen, loadReview] = lazyScreen(() => import('@/screens/ReviewScreen').then((m) => ({ default: m.ReviewScreen })))
const [EvidenceScreen, loadEvidence] = lazyScreen(() => import('@/screens/EvidenceScreen').then((m) => ({ default: m.EvidenceScreen })))
const [TasksScreen, loadTasks] = lazyScreen(() => import('@/screens/TasksScreen').then((m) => ({ default: m.TasksScreen })))
const [OutputsScreen, loadOutputs] = lazyScreen(() => import('@/screens/OutputsScreen').then((m) => ({ default: m.OutputsScreen })))
const [HistoryScreen, loadHistory] = lazyScreen(() => import('@/screens/HistoryScreen').then((m) => ({ default: m.HistoryScreen })))
const [TakeoverScreen, loadTakeover] = lazyScreen(() => import('@/screens/TakeoverScreen').then((m) => ({ default: m.TakeoverScreen })))
const [InsightsScreen, loadInsights] = lazyScreen(() => import('@/screens/InsightsScreen').then((m) => ({ default: m.InsightsScreen })))
const [MethodsScreen, loadMethods] = lazyScreen(() => import('@/screens/MethodsScreen').then((m) => ({ default: m.MethodsScreen })))
const [TransitionScreen, loadTransition] = lazyScreen(() => import('@/screens/TransitionScreen').then((m) => ({ default: m.TransitionScreen })))
const [HandoffScreen, loadHandoff] = lazyScreen(() => import('@/screens/HandoffScreen').then((m) => ({ default: m.HandoffScreen })))
const [StrategyScreen, loadStrategy] = lazyScreen(() => import('@/screens/StrategyScreen').then((m) => ({ default: m.StrategyScreen })))
const [ExecutionScreen, loadExecution] = lazyScreen(() => import('@/screens/ExecutionScreen').then((m) => ({ default: m.ExecutionScreen })))
const [FoundationScreen, loadFoundation] = lazyScreen(() => import('@/screens/FoundationScreen').then((m) => ({ default: m.FoundationScreen })))
const [AssumptionsScreen, loadAssumptions] = lazyScreen(() => import('@/screens/AssumptionsScreen').then((m) => ({ default: m.AssumptionsScreen })))

const preloadRoutes: { path: string; load?: () => Promise<ScreenModule> }[] = [
  { path: '/', load: loadPlans },
  { path: '/baslangic', load: loadStart },
  { path: '/ozet', load: loadOverview },
  { path: '/devralma', load: loadTakeover },
  { path: '/uygulama', load: loadExecution },
  { path: '/temel', load: loadFoundation },
  { path: '/varsayimlar', load: loadAssumptions },
  { path: '/karar/:n', load: loadDecision },
  { path: '/karar/:n/kapi', load: loadReview },
  { path: '/kanitlar', load: loadEvidence },
  { path: '/isler', load: loadTasks },
  { path: '/gecmis', load: loadHistory },
  { path: '/gostergeler', load: loadInsights },
  { path: '/yontemler', load: loadMethods },
  { path: '/ciktilar', load: loadOutputs },
  { path: '/devir', load: loadHandoff },
  { path: '/gecis', load: loadTransition },
  { path: '/strateji', load: loadStrategy },
  { path: '/karar/:n/adim/:id', load: loadWork },
  // Eski adresler aynı strateji ekranına yönlenir.
  { path: '/karar/9', load: loadStrategy },
  { path: '/karar/9/kapi', load: loadStrategy },
]

/** HashRouter bağlantılarını ve ekran yollarını önceden yükler. Gezinmeyi başlatmaz. */
export function preloadRoute(href: string): Promise<unknown> {
  if (typeof window === 'undefined') return Promise.resolve()
  let url: URL
  try {
    url = new URL(href, window.location.href)
  } catch {
    return Promise.resolve()
  }
  if (url.origin !== window.location.origin || !['http:', 'https:'].includes(url.protocol)) return Promise.resolve()
  if (url.hash && !url.hash.startsWith('#/')) return Promise.resolve()
  const path = url.hash ? url.hash.slice(1) : url.pathname + url.search
  const load = matchRoutes(preloadRoutes, path)?.[0].route.load
  // Ön yükleme hatası sayfayı bozmaz. Kullanıcı ekranı açınca yükleme yeniden denenir.
  return load ? load().catch(() => undefined) : Promise.resolve()
}

type RouteErrorProps = { children: ReactNode; routeKey: string }
type RouteErrorState = { failed: boolean; routeKey: string }

/** Ekran hatası menüyü kapatmaz. Başka bir adrese geçilince hata alanı temizlenir. */
class RouteErrorBoundary extends Component<RouteErrorProps, RouteErrorState> {
  state: RouteErrorState = { failed: false, routeKey: this.props.routeKey }

  static getDerivedStateFromError(): Partial<RouteErrorState> {
    return { failed: true }
  }

  static getDerivedStateFromProps(props: RouteErrorProps, state: RouteErrorState): RouteErrorState | null {
    return props.routeKey !== state.routeKey ? { failed: false, routeKey: props.routeKey } : null
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <Callout tone="uyari" title="Ekran açılamadı">
        <p>Sayfayı yeniden yükleyebilir veya menüden başka bir ekran açabilirsiniz.</p>
        {/* React.lazy başarısız sonucu saklar. Tam yenileme bu kaydı da temizler. */}
        <Button onClick={() => window.location.reload()}>Sayfayı yeniden yükle</Button>
      </Callout>
    )
  }
}

function RouteContent() {
  const location = useLocation()
  const routeKey = `${location.key}:${location.pathname}${location.search}${location.hash}`
  return (
    <RouteErrorBoundary routeKey={routeKey}>
      <Suspense key={location.pathname} fallback={<LoadingState />}><Outlet /></Suspense>
    </RouteErrorBoundary>
  )
}

function RequirePlan({ children }: { children: React.ReactNode }) {
  const plan = useCurrentPlan()
  if (!plan) return <Navigate to="/" replace />
  return <>{children}</>
}

/** Çalışma ekranı her adımda yeniden kurulur. Sekme, açık bölüm ve taslak değerler öteki adıma taşınmaz. */
function WorkRoute() {
  const { id } = useParams()
  return <WorkScreen key={id} />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route element={<RouteContent />}>
          <Route index element={<PlansScreen />} />
          <Route path="/baslangic" element={<RequirePlan><StartScreen /></RequirePlan>} />
          <Route path="/ozet" element={<RequirePlan><OverviewScreen /></RequirePlan>} />
          <Route path="/devralma" element={<RequirePlan><TakeoverScreen /></RequirePlan>} />
          <Route path="/devir" element={<RequirePlan><HandoffScreen /></RequirePlan>} />
          <Route path="/gecis" element={<RequirePlan><TransitionScreen /></RequirePlan>} />
          <Route path="/strateji" element={<RequirePlan><StrategyScreen /></RequirePlan>} />
          <Route path="/uygulama" element={<RequirePlan><ExecutionScreen /></RequirePlan>} />
          <Route path="/temel" element={<RequirePlan><FoundationScreen /></RequirePlan>} />
          <Route path="/varsayimlar" element={<RequirePlan><AssumptionsScreen /></RequirePlan>} />
          <Route path="/karar/9" element={<Navigate to="/strateji" replace />} />
          <Route path="/karar/9/kapi" element={<Navigate to="/strateji" replace />} />
          <Route path="/karar/:n" element={<RequirePlan><DecisionScreen /></RequirePlan>} />
          <Route path="/karar/:n/adim/:id" element={<RequirePlan><WorkRoute /></RequirePlan>} />
          <Route path="/karar/:n/kapi" element={<RequirePlan><ReviewScreen /></RequirePlan>} />
          <Route path="/kanitlar" element={<RequirePlan><EvidenceScreen /></RequirePlan>} />
          <Route path="/isler" element={<RequirePlan><TasksScreen /></RequirePlan>} />
          <Route path="/ciktilar" element={<RequirePlan><OutputsScreen /></RequirePlan>} />
          <Route path="/gecmis" element={<RequirePlan><HistoryScreen /></RequirePlan>} />
          <Route path="/gostergeler" element={<RequirePlan><InsightsScreen /></RequirePlan>} />
          <Route path="/yontemler" element={<MethodsScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
