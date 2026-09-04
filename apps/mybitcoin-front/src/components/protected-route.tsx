import { Navigate, useLocation } from 'react-router-dom'
import { useCurrentUser } from '@/hooks/use-current-user'
import { useAuthStore } from '@/stores/use-auth-store'
import { PageSkeleton } from '@/components/page-skeleton'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredKyc?: boolean
}

export function ProtectedRoute({ children, requiredKyc = false }: ProtectedRouteProps) {
  const { data: user, isPending } = useCurrentUser()
  const kycStatus = useAuthStore((state) => state.kycStatus)
  const location = useLocation()

  if (isPending) {
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
