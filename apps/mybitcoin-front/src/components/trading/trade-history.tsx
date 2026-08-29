import type { Trade } from '@/types/trading'

interface TradeHistoryProps {
  trades: Trade[]
}

/** Histórico de execuções (trades) — conforme
 * `docs/bussiness/08-trades-maker-taker-taxas.md`. Cor segue o lado do
 * Taker, como nas exchanges reais. */
export function TradeHistory({ trades }: TradeHistoryProps) {
  if (trades.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        Nenhuma execução ainda.
      </div>
    )
  }

  return (
    <div className="divide-y divide-border" role="list" aria-label="Histórico de execuções">
      <div className="flex items-center justify-between px-6 py-3 text-xs text-muted-foreground sm:px-8">
        <span>Preço (R$)</span>
        <span>Quantidade</span>
        <span>Hora</span>
      </div>
      {trades.map((trade) => (
        <div
          role="listitem"
          key={trade.id}
          className="flex items-center justify-between px-6 py-3 font-mono text-sm tabular-nums sm:px-8"
        >
          <span className={trade.takerSide === 'BUY' ? 'text-success' : 'text-destructive'}>
            {Number(trade.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-muted-foreground">{trade.quantity}</span>
          <span className="text-muted-foreground">
            {new Date(trade.executedAt).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        </div>
      ))}
    </div>
  )
}
