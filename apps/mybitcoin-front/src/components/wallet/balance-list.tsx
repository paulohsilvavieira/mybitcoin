import { useNavigate } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useWalletBalances } from '@/hooks/use-wallet-balances'
import { ApiError, handleApiError } from '@/lib/api-errors'
import { BalanceCard } from '@/components/wallet/balance-card'

function BalanceListSkeleton() {
  return (
    <div className="grid gap-4" aria-hidden="true">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}

function BalanceListEmpty() {
  return (
    <Card size="sm" className="w-full">
      <CardContent className="flex flex-col items-center gap-1 py-6 text-center">
        <p className="font-medium">Nenhum saldo ainda</p>
        <p className="text-sm text-muted-foreground">
          Você ainda não movimentou nenhum ativo.
        </p>
      </CardContent>
    </Card>
  )
}

interface BalanceListErrorProps {
  error: unknown
}

function BalanceListError({ error }: BalanceListErrorProps) {
  const navigate = useNavigate()
  const isUnauthorized = error instanceof ApiError && error.status === 401

  return (
    <Alert variant="destructive">
      <AlertTitle>Não foi possível carregar seus saldos</AlertTitle>
      <AlertDescription>{handleApiError(error)}</AlertDescription>
      {isUnauthorized && (
        <div className="mt-3">
          <Button
            size="sm"
            className="h-11"
            onClick={() => navigate('/login', { replace: true })}
          >
            Ir para o login
          </Button>
        </div>
      )}
    </Alert>
  )
}

/** UI-001: trata loading, error e empty explicitamente. */
export function BalanceList() {
  const { data: balances, isPending, isError, error } = useWalletBalances()

  if (isPending) {
    return <BalanceListSkeleton />
  }

  if (isError) {
    return <BalanceListError error={error} />
  }

  if (balances.length === 0) {
    return <BalanceListEmpty />
  }

  return (
    <div className="grid gap-4" role="list" aria-label="Saldos por ativo">
      {balances.map((balance) => (
        <div role="listitem" key={balance.asset}>
          <BalanceCard balance={balance} />
        </div>
      ))}
    </div>
  )
}
