import { AssetIcon, assetLabel } from '@/components/wallet/asset-icon'
import { formatSatoshi } from '@/lib/utils'
import type { Balance } from '@/types/wallet'

interface BalanceCardProps {
  balance: Balance
}

/**
 * Linha de ativo no padrão de lista de exchange (Coinbase/Binance): selo
 * colorido + nome à esquerda, saldo disponível em destaque à direita.
 *
 * Valores exibidos exclusivamente via `formatSatoshi()` (FIN-002) — nunca
 * `Number()` sobre `available`/`locked`/`total` (FIN-001).
 *
 * "Bloqueado" só aparece quando há algo de fato bloqueado — replicando o
 * hábito das exchanges de não poluir a lista com contexto igual a zero.
 * "Total" não é exibido: é derivável (disponível + bloqueado) e raramente
 * é o número que a pessoa precisa olhar primeiro.
 */
export function BalanceCard({ balance }: BalanceCardProps) {
  const hasLocked = BigInt(balance.locked) > 0n

  return (
    <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
      <AssetIcon asset={balance.asset} className="size-10 text-base" />

      <div className="min-w-0 flex-1">
        <p className="font-heading font-semibold">{assetLabel(balance.asset)}</p>
        <p className="text-sm text-muted-foreground">{balance.asset}</p>
      </div>

      <div className="flex flex-col items-end gap-0.5">
        <p className="font-mono text-base font-medium tabular-nums">
          {formatSatoshi(balance.available)}
        </p>
        {hasLocked && (
          <p className="font-mono text-xs text-muted-foreground tabular-nums">
            {formatSatoshi(balance.locked)} bloqueado
          </p>
        )}
      </div>
    </div>
  )
}
