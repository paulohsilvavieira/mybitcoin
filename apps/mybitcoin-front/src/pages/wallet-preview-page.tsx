import { BalanceRows } from '@/components/wallet/balance-list'
import { Topbar } from '@/components/layout/topbar'
import type { Balance } from '@/types/wallet'

// `formatSatoshi()` (FIN-002) só sabe formatar BTC — igual à API real hoje,
// que só suporta esse ativo (ver CLAUDE.md). Nada de mockar ETH/USDT aqui:
// mostraria "BTC" grudado num valor que não é BTC.
const MOCK_BALANCES: Balance[] = [
  { asset: 'BTC', available: '15000000', locked: '2500000', total: '17500000' },
]

/**
 * Preview visual da carteira com dados mocados, sem exigir login. Só existe
 * em build de desenvolvimento — ver guarda em `App.tsx` (`import.meta.env.DEV`).
 * Não é uma rota de produto: nunca linkar a partir de UI real.
 */
export function WalletPreviewPage() {
  return (
    <div className="min-h-dvh">
      <Topbar userName="Ana Beatriz" />
      <main className="flex flex-col items-center p-4 md:p-6">
        <div className="flex w-full max-w-2xl flex-col gap-6">
          <div>
            <h1 className="font-heading text-lg font-semibold">Carteira (preview)</h1>
            <p className="text-sm text-muted-foreground">
              Dados mocados — só em desenvolvimento, sem login.
            </p>
          </div>
          <BalanceRows balances={MOCK_BALANCES} />
        </div>
      </main>
    </div>
  )
}
