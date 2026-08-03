import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrentUser } from '@/hooks/use-current-user'
import {
  useLogoutAllMutation,
  useLogoutMutation,
} from '@/hooks/use-logout-mutation'

/**
 * Rota protegida mínima de exemplo — existe para exercitar o fluxo de sessão
 * ponta a ponta (login → rota protegida → logout).
 */
export function HomePage() {
  const { data: user } = useCurrentUser()
  const logoutMutation = useLogoutMutation()
  const logoutAllMutation = useLogoutAllMutation()
  const navigate = useNavigate()

  const isLeaving = logoutMutation.isPending || logoutAllMutation.isPending

  async function handleLogout(revokeAll: boolean) {
    const mutation = revokeAll ? logoutAllMutation : logoutMutation
    try {
      await mutation.mutateAsync()
    } finally {
      // Os dois logouts limpam o cache local em onSettled, mesmo em falha
      // (ver use-logout-mutation.ts) — só falta redirecionar.
      navigate('/login', { replace: true })
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            <h1 className="text-lg font-semibold">
              Olá, {user?.name ?? 'usuário'}
            </h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <Button
            className="h-11 w-full"
            disabled={isLeaving}
            onClick={() => void handleLogout(false)}
          >
            Sair
          </Button>
          <Button
            variant="outline"
            className="h-11 w-full"
            disabled={isLeaving}
            onClick={() => void handleLogout(true)}
          >
            Sair de todos os dispositivos
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
