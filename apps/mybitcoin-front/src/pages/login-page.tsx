import { Navigate } from 'react-router-dom'
import { LoginForm } from '@/components/auth/login-form'
import { AuthBrandPanel } from '@/components/auth/auth-brand-panel'
import { useCurrentUser } from '@/hooks/use-current-user'
import { PageSkeleton } from '@/components/page-skeleton'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function LoginPage() {
  const { data: user, isPending } = useCurrentUser()

  if (isPending) {
    return <PageSkeleton />
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="relative flex min-h-dvh flex-col lg:grid lg:grid-cols-2">
      <ThemeToggle className="absolute top-4 right-4 z-20" />
      <AuthBrandPanel />
      <div className="relative z-10 -mt-16 flex justify-center px-4 pb-16 lg:mt-0 lg:flex lg:items-center lg:justify-center lg:p-6">
        <Card className="w-full max-w-sm rounded-3xl [--card-spacing:--spacing(8)] lg:rounded-none lg:bg-transparent lg:py-0 lg:ring-0">
          <CardHeader className="text-center">
            <CardTitle>
              <h1 className="text-xl font-semibold">Entrar na sua conta</h1>
            </CardTitle>
            <CardDescription>
              Acesse sua conta mybitcoin com e-mail e senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
