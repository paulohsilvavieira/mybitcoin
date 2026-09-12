import { BalanceCard } from '@/components/wallet/balance-card'
import { BalanceList, BalanceRows } from '@/components/wallet/balance-list'
import { TransactionHistory } from '@/components/wallet/transaction-history'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MOCK_BALANCES } from '@/pages/wallet-preview-page'
import type { Transaction } from '@/types/wallet'

// Mesmo formato/precisão de `Balance` usado em `wallet-preview-page` (FIN-001/002).
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx1',
    type: 'DEPOSIT',
    asset: 'BTC',
    amountSatoshi: '5000000',
    status: 'CONFIRMED',
    txHash: '3b1a9c2f7e4d6a8b1c0f5e9d2a7b4c6e8f1a3d5b7c9e0f2a4b6c8d0e2f4a6b8c',
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
  },
  {
    id: 'tx2',
    type: 'WITHDRAWAL',
    asset: 'BTC',
    amountSatoshi: '1200000',
    status: 'PENDING',
    txHash: '9e0f2a4b6c8d0e2f4a6b8c3b1a9c2f7e4d6a8b1c0f5e9d2a7b4c6e8f1a3d5b7c',
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
  },
  {
    id: 'tx3',
    type: 'WITHDRAWAL',
    asset: 'BTC',
    amountSatoshi: '800000',
    status: 'FAILED',
    txHash: '1c0f5e9d2a7b4c6e8f1a3d5b7c9e0f2a4b6c8d0e2f4a6b8c3b1a9c2f7e4d6a8b',
    createdAt: new Date(Date.now() - 7_200_000).toISOString(),
  },
]

/** Componentes de `src/components/wallet/*` — `BalanceCard`/`BalanceRows`
 * com o mesmo mock de `wallet-preview-page`, `BalanceList` conectada ao hook
 * real (`useWalletBalances`) para mostrar seu comportamento genuíno de
 * loading/erro/vazio (UI-001), e `TransactionHistory` nos três estados lado
 * a lado. */
export function WalletSection() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-lg font-semibold">Carteira</h2>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            BalanceCard / BalanceRows (mock)
          </h3>
          <BalanceRows balances={MOCK_BALANCES} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>BalanceCard (isolado)</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {MOCK_BALANCES.map((balance) => (
              <BalanceCard key={balance.asset} balance={balance} />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          BalanceList (conectada ao hook real)
        </h3>
        <BalanceList />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>TransactionHistory — carregando</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionHistory transactions={[]} isLoading />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>TransactionHistory — vazio</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionHistory transactions={[]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>TransactionHistory — com dados</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TransactionHistory transactions={MOCK_TRANSACTIONS} />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
