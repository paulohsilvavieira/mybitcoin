import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/use-auth-store'
import { PageSkeleton } from '@/components/page-skeleton'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredKyc?: boolean
}

export function ProtectedRoute({ children, requiredKyc = false }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)
  const kycStatus = useAuthStore((state) => state.kycStatus)
  const location = useLocation()

  if (isLoading) {
    return <PageSkeleton />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredKyc && kycStatus !== 'approved') {
    return <Navigate to="/kyc" replace />
  }

  return <>{children}</>
}
