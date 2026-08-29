import { Suspense, lazy } from 'react'
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from '@/components/error-boundary'
import { PageSkeleton } from '@/components/page-skeleton'
import { ProtectedRoute } from '@/components/protected-route'

const LoginPage = lazy(() =>
  import('@/pages/login-page').then((module) => ({ default: module.LoginPage })),
)
const HomePage = lazy(() =>
  import('@/pages/home-page').then((module) => ({ default: module.HomePage })),
)
const WalletPage = lazy(() =>
  import('@/pages/wallet-page').then((module) => ({ default: module.WalletPage })),
)
const WalletPreviewPage = import.meta.env.DEV
  ? lazy(() =>
      import('@/pages/wallet-preview-page').then((module) => ({
        default: module.WalletPreviewPage,
      })),
    )
  : null
const TradingPreviewPage = import.meta.env.DEV
  ? lazy(() =>
      import('@/pages/trading-preview-page').then((module) => ({
        default: module.TradingPreviewPage,
      })),
    )
  : null

const queryClient = new QueryClient()

function RootLayout() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSkeleton />}>
        <Outlet />
      </Suspense>
    </ErrorBoundary>
  )
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/wallet',
        element: (
          <ProtectedRoute>
            <WalletPage />
          </ProtectedRoute>
        ),
      },
      // Rotas de preview visual, sem auth — só existem em `pnpm dev` (import.meta.env.DEV).
      ...(WalletPreviewPage
        ? [{ path: '/preview/wallet', element: <WalletPreviewPage /> }]
        : []),
      ...(TradingPreviewPage
        ? [{ path: '/preview/trading', element: <TradingPreviewPage /> }]
        : []),
    ],
  },
])

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

export default App
