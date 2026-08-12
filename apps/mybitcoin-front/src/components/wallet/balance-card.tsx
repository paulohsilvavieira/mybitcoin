import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatSatoshi } from '@/lib/utils'
import type { Balance } from '@/types/wallet'

interface BalanceCardProps {
  balance: Balance
}

/**
 * Um ativo por card. Valores exibidos exclusivamente via `formatSatoshi()`
 * (FIN-002) — nunca `Number()` sobre `available`/`locked`/`total` (FIN-001).
 */
export function BalanceCard({ balance }: BalanceCardProps) {
  return (
    <Card size="sm" className="w-full">
      <CardHeader>
        <CardTitle>
          <h3 className="text-base font-semibold">{balance.asset}</h3>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3 text-sm">
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground">Disponível</span>
          <span className="font-medium">{formatSatoshi(balance.available)}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground">Bloqueado</span>
          <span className="font-medium">{formatSatoshi(balance.locked)}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground">Total</span>
          <span className="font-medium">{formatSatoshi(balance.total)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
