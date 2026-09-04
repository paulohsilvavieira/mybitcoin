import { BalanceList } from '@/components/wallet/balance-list'

/** Rota protegida: saldos por ativo do usuário autenticado. */
export function WalletPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center p-4 md:p-6">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <h1 className="font-heading text-lg font-semibold">Carteira</h1>
        <BalanceList />
      </div>
    </main>
  )
}
