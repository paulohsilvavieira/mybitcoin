import { ArrowLeftRight, CheckCircle2, History, XCircle } from 'lucide-react'
import { useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogCloseButton,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { WalletAddressRow } from '@/components/backoffice/wallet-address-row'
import { WalletMovementsList } from '@/components/backoffice/wallet-movements-list'
import { formatSatoshi } from '@/lib/utils'
import type { WalletMovement, WalletReserve } from '@/types/backoffice'

interface WalletReserveCardProps {
  reserve: WalletReserve
  movements: WalletMovement[]
  onTransferClick: () => void
}

/** Card de reserva hot/cold de um ativo — saúde do saldo, endereços de
 * custódia, movimentações recentes e atalho para transferência (mock de UI). */
export function WalletReserveCard({ reserve, movements, onTransferClick }: WalletReserveCardProps) {
  const [movementsOpen, setMovementsOpen] = useState(false)
  const hot = BigInt(reserve.hotBalance)
  const cold = BigInt(reserve.coldBalance)
  const total = hot + cold
  const hotPercent = total === 0n ? 0 : Number((hot * 100n) / total)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{reserve.asset}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">Hot wallet</p>
          <p className="font-heading text-lg font-semibold tabular-nums">
            {formatSatoshi(reserve.hotBalance, 'btc', reserve.asset)}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">Cold wallet</p>
          <p className="font-heading text-lg font-semibold tabular-nums">
            {formatSatoshi(reserve.coldBalance, 'btc', reserve.asset)}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Hot {hotPercent}%</span>
            <span>Cold {100 - hotPercent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={reserve.isHealthy ? 'h-full bg-success' : 'h-full bg-destructive'}
              style={{ width: `${hotPercent}%` }}
            />
          </div>
        </div>

        <Alert variant={reserve.isHealthy ? 'default' : 'destructive'}>
          {reserve.isHealthy ? <CheckCircle2 className="text-success" /> : <XCircle />}
          <AlertTitle>{reserve.isHealthy ? 'Acima do mínimo' : 'Abaixo do limiar'}</AlertTitle>
          <AlertDescription>
            Limiar mínimo: {formatSatoshi(reserve.hotMinThreshold, 'btc', reserve.asset)}
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <WalletAddressRow label="Endereço hot" address={reserve.addresses.hot} />
          <WalletAddressRow label="Endereço cold" address={reserve.addresses.cold} />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => setMovementsOpen(true)}>
            <History />
            Ver movimentações
          </Button>
          <Button size="sm" className="flex-1" onClick={onTransferClick}>
            <ArrowLeftRight />
            Transferir
          </Button>
        </div>
      </CardContent>

      <Dialog open={movementsOpen} onOpenChange={setMovementsOpen}>
        <DialogCloseButton onOpenChange={setMovementsOpen} />
        <DialogHeader>
          <DialogTitle>Movimentações — {reserve.asset}</DialogTitle>
          <DialogDescription>Últimas movimentações de crédito e débito da reserva.</DialogDescription>
        </DialogHeader>
        <WalletMovementsList movements={movements} />
      </Dialog>
    </Card>
  )
}
