import { cn, formatSatoshi } from '@/lib/utils'
import type { WalletMovement } from '@/types/backoffice'

interface WalletMovementsListProps {
  movements: WalletMovement[]
}

const TIPO_LABELS: Record<WalletMovement['tipo'], string> = {
  credito: 'Crédito',
  debito: 'Débito',
}

/** Lista das últimas movimentações (crédito/débito) de uma reserva hot/cold. */
export function WalletMovementsList({ movements }: WalletMovementsListProps) {
  if (movements.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        Nenhuma movimentação recente.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {movements.map((movement) => (
        <li key={movement.id} className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span
              className={cn(
                'text-sm font-medium',
                movement.tipo === 'credito' ? 'text-success' : 'text-destructive',
              )}
            >
              {TIPO_LABELS[movement.tipo]}
            </span>
            <span className="truncate text-xs text-muted-foreground">{movement.motivo}</span>
          </div>
          <div className="flex flex-col items-end gap-0.5 text-right">
            <span
              className={cn(
                'text-sm font-semibold tabular-nums',
                movement.tipo === 'credito' ? 'text-success' : 'text-destructive',
              )}
            >
              {movement.tipo === 'debito' ? '-' : '+'}
              {formatSatoshi(movement.valor, 'btc', movement.asset)}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(movement.data).toLocaleString('pt-BR')}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}
