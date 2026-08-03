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
