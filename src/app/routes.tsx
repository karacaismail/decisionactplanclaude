import { Navigate, Route, Routes } from 'react-router'
import { AppShell } from './AppShell'
import { PlansScreen } from '@/screens/PlansScreen'
import { StartScreen } from '@/screens/StartScreen'
import { OverviewScreen } from '@/screens/OverviewScreen'
import { DecisionScreen } from '@/screens/DecisionScreen'
import { WorkScreen } from '@/screens/WorkScreen'
import { ReviewScreen } from '@/screens/ReviewScreen'
import { EvidenceScreen } from '@/screens/EvidenceScreen'
import { TasksScreen } from '@/screens/TasksScreen'
import { OutputsScreen } from '@/screens/OutputsScreen'
import { HistoryScreen } from '@/screens/HistoryScreen'
import { TakeoverScreen } from '@/screens/TakeoverScreen'
import { InsightsScreen } from '@/screens/InsightsScreen'
import { MethodsScreen } from '@/screens/MethodsScreen'
import { TransitionScreen } from '@/screens/TransitionScreen'
import { StrategyScreen } from '@/screens/StrategyScreen'
import { FoundationScreen } from '@/screens/FoundationScreen'
import { AssumptionsScreen } from '@/screens/AssumptionsScreen'
import { useCurrentPlan } from '@/store/planStore'

function RequirePlan({ children }: { children: React.ReactNode }) {
  const plan = useCurrentPlan()
  if (!plan) return <Navigate to="/" replace />
  return <>{children}</>
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<PlansScreen />} />
        <Route path="/baslangic" element={<RequirePlan><StartScreen /></RequirePlan>} />
        <Route path="/ozet" element={<RequirePlan><OverviewScreen /></RequirePlan>} />
        <Route path="/devralma" element={<RequirePlan><TakeoverScreen /></RequirePlan>} />
        <Route path="/gecis" element={<RequirePlan><TransitionScreen /></RequirePlan>} />
        <Route path="/strateji" element={<RequirePlan><StrategyScreen /></RequirePlan>} />
        <Route path="/temel" element={<RequirePlan><FoundationScreen /></RequirePlan>} />
        <Route path="/varsayimlar" element={<RequirePlan><AssumptionsScreen /></RequirePlan>} />
        <Route path="/karar/9" element={<Navigate to="/strateji" replace />} />
        <Route path="/karar/9/kapi" element={<Navigate to="/strateji" replace />} />
        <Route path="/karar/:n" element={<RequirePlan><DecisionScreen /></RequirePlan>} />
        <Route path="/karar/:n/adim/:id" element={<RequirePlan><WorkScreen /></RequirePlan>} />
        <Route path="/karar/:n/kapi" element={<RequirePlan><ReviewScreen /></RequirePlan>} />
        <Route path="/kanitlar" element={<RequirePlan><EvidenceScreen /></RequirePlan>} />
        <Route path="/isler" element={<RequirePlan><TasksScreen /></RequirePlan>} />
        <Route path="/ciktilar" element={<RequirePlan><OutputsScreen /></RequirePlan>} />
        <Route path="/gecmis" element={<RequirePlan><HistoryScreen /></RequirePlan>} />
        <Route path="/gostergeler" element={<RequirePlan><InsightsScreen /></RequirePlan>} />
        <Route path="/yontemler" element={<MethodsScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
