import { Navigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LoginForm } from '@/components/auth/login-form'
import { useCurrentUser } from '@/hooks/use-current-user'
import { PageSkeleton } from '@/components/page-skeleton'

export function LoginPage() {
  const { data: user, isPending } = useCurrentUser()

  if (isPending) {
    return <PageSkeleton />
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            <h1 className="text-lg font-semibold">Entrar</h1>
          </CardTitle>
          <CardDescription>
            Acesse sua conta mybitcoin com e-mail e senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  )
}
