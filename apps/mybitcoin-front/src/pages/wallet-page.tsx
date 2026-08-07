import { BalanceList } from '@/components/wallet/balance-list'

/** Rota protegida: saldos por ativo do usuário autenticado. */
export function WalletPage() {
  return (
    <main className="flex min-h-dvh flex-col gap-6 p-4 md:p-6">
      <h1 className="text-lg font-semibold">Carteira</h1>
      <BalanceList />
    </main>
  )
}
