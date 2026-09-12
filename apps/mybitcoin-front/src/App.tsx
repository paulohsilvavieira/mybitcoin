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
const MarketPreviewPage = import.meta.env.DEV
  ? lazy(() =>
      import('@/pages/market-preview-page').then((module) => ({
        default: module.MarketPreviewPage,
      })),
    )
  : null
const ComponentGalleryPage = import.meta.env.DEV
  ? lazy(() =>
      import('@/pages/component-gallery-page').then((module) => ({
        default: module.ComponentGalleryPage,
      })),
    )
  : null

// Backoffice administrativo — camada visual mocada, sem API/auth real.
// Só existe em `pnpm dev` (import.meta.env.DEV), mesmo padrão das rotas acima.
const AdminLayout = import.meta.env.DEV
  ? lazy(() =>
      import('@/components/backoffice/admin-layout').then((module) => ({
        default: module.AdminLayout,
      })),
    )
  : null
const DashboardPage = import.meta.env.DEV
  ? lazy(() =>
      import('@/pages/backoffice/dashboard-page').then((module) => ({
        default: module.DashboardPage,
      })),
    )
  : null
const UsersPage = import.meta.env.DEV
  ? lazy(() =>
      import('@/pages/backoffice/users-page').then((module) => ({
        default: module.UsersPage,
      })),
    )
  : null
const UserDetailPage = import.meta.env.DEV
  ? lazy(() =>
      import('@/pages/backoffice/user-detail-page').then((module) => ({
        default: module.UserDetailPage,
      })),
    )
  : null
const WalletsPage = import.meta.env.DEV
  ? lazy(() =>
      import('@/pages/backoffice/wallets-page').then((module) => ({
        default: module.WalletsPage,
      })),
    )
  : null
const TransfersPage = import.meta.env.DEV
  ? lazy(() =>
      import('@/pages/backoffice/transfers-page').then((module) => ({
        default: module.TransfersPage,
      })),
    )
  : null
const AuditPage = import.meta.env.DEV
  ? lazy(() =>
      import('@/pages/backoffice/audit-page').then((module) => ({
        default: module.AuditPage,
      })),
    )
  : null
const WithdrawalsPage = import.meta.env.DEV
  ? lazy(() =>
      import('@/pages/backoffice/withdrawals-page').then((module) => ({
        default: module.WithdrawalsPage,
      })),
    )
  : null
const FeesPage = import.meta.env.DEV
  ? lazy(() =>
      import('@/pages/backoffice/fees-page').then((module) => ({
        default: module.FeesPage,
      })),
    )
  : null
const AdminSettingsPage = import.meta.env.DEV
  ? lazy(() =>
      import('@/pages/backoffice/admin-settings-page').then((module) => ({
        default: module.AdminSettingsPage,
      })),
    )
  : null
const MarketsPage = import.meta.env.DEV
  ? lazy(() =>
      import('@/pages/backoffice/markets-page').then((module) => ({
        default: module.MarketsPage,
      })),
    )
  : null
const AdminsPage = import.meta.env.DEV
  ? lazy(() =>
      import('@/pages/backoffice/admins-page').then((module) => ({
        default: module.AdminsPage,
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
      ...(MarketPreviewPage
        ? [{ path: '/preview/market', element: <MarketPreviewPage /> }]
        : []),
      ...(ComponentGalleryPage
        ? [{ path: '/preview/gallery', element: <ComponentGalleryPage /> }]
        : []),
      // Backoffice administrativo — layout pai + rotas filhas.
      ...(AdminLayout &&
      DashboardPage &&
      UsersPage &&
      UserDetailPage &&
      WalletsPage &&
      TransfersPage &&
      AuditPage &&
      WithdrawalsPage &&
      FeesPage &&
      AdminSettingsPage &&
      MarketsPage &&
      AdminsPage
        ? [
            {
              path: '/preview/backoffice',
              element: <AdminLayout />,
              children: [
                { index: true, element: <DashboardPage /> },
                { path: 'users', element: <UsersPage /> },
                { path: 'users/:id', element: <UserDetailPage /> },
                { path: 'wallets', element: <WalletsPage /> },
                { path: 'transfers', element: <TransfersPage /> },
                { path: 'withdrawals', element: <WithdrawalsPage /> },
                { path: 'markets', element: <MarketsPage /> },
                { path: 'fees', element: <FeesPage /> },
                { path: 'settings', element: <AdminSettingsPage /> },
                { path: 'admins', element: <AdminsPage /> },
                { path: 'audit', element: <AuditPage /> },
              ],
            },
          ]
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
