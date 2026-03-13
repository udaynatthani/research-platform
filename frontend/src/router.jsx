import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import AppShell from './components/layout/AppShell'
import PageSkeleton from './components/layout/PageSkeleton'
import useAuth from './hooks/useAuth'

const LoginPage    = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const Dashboard    = lazy(() => import('./pages/DashboardPage'))
const Projects     = lazy(() => import('./pages/ProjectsPage'))
const Papers       = lazy(() => import('./pages/papers/PapersPage'))
const Collections  = lazy(() => import('./pages/CollectionsPage'))
const Workflow     = lazy(() => import('./pages/WorkflowPage'))
const Experiments  = lazy(() => import('./pages/ExperimentsPage'))
const ConceptMap   = lazy(() => import('./pages/ConceptMapPage'))
const Insights     = lazy(() => import('./pages/InsightsPage'))
const Visualization= lazy(() => import('./pages/VisualizationPage'))
const AIAssistant  = lazy(() => import('./pages/AIAssistantPage'))
const Activity     = lazy(() => import('./pages/ActivityPage'))
const PaperDetail  = lazy(() => import('./pages/papers/PaperDetailPage'))
const Datasets     = lazy(() => import('./pages/DatasetsPage'))

function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <PageSkeleton />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

const wrap = (Component) => (
  <Suspense fallback={<PageSkeleton />}>
    <Component />
  </Suspense>
)

const router = createBrowserRouter([
  { path: '/login',    element: wrap(LoginPage) },
  { path: '/register', element: wrap(RegisterPage) },
  {
    element: <PrivateRoute />,
    children: [{
      element: <AppShell />,
      children: [
        { path: '/',               element: <Navigate to="/dashboard" replace /> },
        { path: '/dashboard',      element: wrap(Dashboard) },
        { path: '/projects',       element: wrap(Projects) },
        { path: '/papers',         element: wrap(Papers) },
        { path: '/collections',    element: wrap(Collections) },
        { path: '/workflow',       element: wrap(Workflow) },
        { path: '/experiments',    element: wrap(Experiments) },
        { path: '/concept-map',    element: wrap(ConceptMap) },
        { path: '/insights',       element: wrap(Insights) },
        { path: '/visualization',  element: wrap(Visualization) },
        { path: '/ai',             element: wrap(AIAssistant) },
        { path: '/activity',       element: wrap(Activity) },
        { path: '/papers/:id',     element: wrap(PaperDetail) },
        { path: '/datasets',       element: wrap(Datasets) },
      ]
    }]
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

export default function Router() {
  return <RouterProvider router={router} />
}
