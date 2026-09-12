import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatSatoshi } from '@/lib/utils'
import type { WalletAsset } from '@/types/backoffice'
import type { GlobalFeeConfig } from '@/types/backoffice-fees'

const ASSETS: WalletAsset[] = ['BTC', 'ETH', 'SOL', 'USDT']

interface GlobalFeeCardProps {
  fees: GlobalFeeConfig
  onEditClick: () => void
}

/**
 * Card com a configuração global de taxas (mock de UI). `makerPercent` e
 * `takerPercent` são percentuais (`number`) — não são valores monetários,
 * então não seguem FIN-001. `withdrawalFeeSatoshi` é monetário (satoshi/
 * menor-unidade), exibido só via `formatSatoshi()` (FIN-002).
 */
export function GlobalFeeCard({ fees, onEditClick }: GlobalFeeCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Taxas globais</CardTitle>
        <CardAction>
          <Button size="sm" variant="outline" onClick={onEditClick}>
            Editar
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Maker fee</p>
            <p className="font-heading text-lg font-semibold tabular-nums">
              {fees.makerPercent.toFixed(2)}%
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Taker fee</p>
            <p className="font-heading text-lg font-semibold tabular-nums">
              {fees.takerPercent.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">Taxa de saque (fixa por ativo)</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ASSETS.map((asset) => (
              <div key={asset} className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">{asset}</span>
                <span className="text-sm font-medium tabular-nums">
                  {formatSatoshi(fees.withdrawalFeeSatoshi[asset], 'btc', asset)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
