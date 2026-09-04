import { cn } from '@/lib/utils'
import type { OrderBookData, PriceLevel } from '@/types/order-book'

function withCumulative(levels: PriceLevel[]) {
  let running = 0
  return levels.map((level) => {
    running += Number(level.quantity)
    return { ...level, cumulative: running }
  })
}

interface OrderBookRowProps {
  level: PriceLevel & { cumulative: number }
  maxDepth: number
  side: 'ask' | 'bid'
}

/** Barra de profundidade acumulada atrás do preço — leitura rápida de onde
 * está concentrada a liquidez, como nos livros de ofertas da Binance/Coinbase. */
function OrderBookRow({ level, maxDepth, side }: OrderBookRowProps) {
  const depthPercent = maxDepth > 0 ? (level.cumulative / maxDepth) * 100 : 0
  const isAsk = side === 'ask'

  return (
    <div className="relative flex items-center justify-between px-4 py-2 font-mono text-sm tabular-nums sm:px-6">
      <div
        aria-hidden="true"
        className={cn('absolute inset-y-0 right-0', isAsk ? 'bg-destructive/10' : 'bg-success/10')}
        style={{ width: `${depthPercent}%` }}
      />
      <span className={cn('relative', isAsk ? 'text-destructive' : 'text-success')}>
        {Number(level.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </span>
      <span className="relative text-muted-foreground">{level.quantity}</span>
    </div>
  )
}

interface OrderBookProps {
  data: OrderBookData
}

/**
 * Livro de ofertas — bids/asks/spread conforme
 * `docs/bussiness/06-order-book.md`. Asks renderizados do pior pro melhor
 * preço (de cima pra baixo, aproximando do spread), bids do melhor pro
 * pior — o mesmo layout do "Estado Simplificado" descrito no documento.
 */
export function OrderBook({ data }: OrderBookProps) {
  const { pair, asks, bids } = data
  const asksWithDepth = withCumulative(asks)
  const bidsWithDepth = withCumulative(bids)
  const maxDepth = Math.max(
    asksWithDepth.at(-1)?.cumulative ?? 0,
    bidsWithDepth.at(-1)?.cumulative ?? 0,
  )

  const bestAsk = asks[0]
  const bestBid = bids[0]
  const spread = bestAsk && bestBid ? Number(bestAsk.price) - Number(bestBid.price) : null
  const spreadPercent = spread !== null && bestAsk ? (spread / Number(bestAsk.price)) * 100 : null

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-1 border-b border-border px-4 py-4 sm:px-6">
        <h2 className="font-heading font-semibold">{pair}</h2>
        <span className="text-xs text-muted-foreground">Preço (R$) · Quantidade (BTC)</span>
      </div>

      <div className="flex flex-col-reverse py-2">
        {asksWithDepth.map((level) => (
          <OrderBookRow key={`ask-${level.price}`} level={level} maxDepth={maxDepth} side="ask" />
        ))}
      </div>

      {spread !== null && (
        <div className="flex items-center justify-between border-y border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground sm:px-6">
          <span>Spread</span>
          <span className="font-mono tabular-nums">
            R$ {spread.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            {spreadPercent !== null && ` (${spreadPercent.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%)`}
          </span>
        </div>
      )}

      <div className="flex flex-col py-2">
        {bidsWithDepth.map((level) => (
          <OrderBookRow key={`bid-${level.price}`} level={level} maxDepth={maxDepth} side="bid" />
        ))}
      </div>
    </div>
  )
}
