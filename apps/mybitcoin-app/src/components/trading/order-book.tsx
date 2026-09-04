import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { OrderBookData, PriceLevel } from '@/types/order-book';

function withCumulative(levels: PriceLevel[]) {
  let running = 0;
  return levels.map((level) => {
    running += Number(level.quantity);
    return { ...level, cumulative: running };
  });
}

interface OrderBookRowProps {
  level: PriceLevel & { cumulative: number };
  maxDepth: number;
  side: 'ask' | 'bid';
}

/** Barra de profundidade acumulada atrás do preço — leitura rápida de onde
 * está concentrada a liquidez, como nos livros de ofertas da Binance/Coinbase. */
function OrderBookRow({ level, maxDepth, side }: OrderBookRowProps) {
  const depthPercent = maxDepth > 0 ? (level.cumulative / maxDepth) * 100 : 0;
  const isAsk = side === 'ask';

  return (
    <View className="flex-row items-center justify-between px-4 py-2">
      <View
        accessible={false}
        className={cn('absolute inset-y-0 right-0', isAsk ? 'bg-destructive/10' : 'bg-success/10')}
        style={{ width: `${depthPercent}%` }}
      />
      <Text className={cn('font-mono text-sm', isAsk ? 'text-destructive' : 'text-success')}>
        {Number(level.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </Text>
      <Text className="text-muted-foreground font-mono text-sm">{level.quantity}</Text>
    </View>
  );
}

interface OrderBookProps {
  data: OrderBookData;
}

/**
 * Porte de `components/trading/order-book.tsx` do `../mybitcoin-front`.
 * Bids/asks/spread conforme `docs/bussiness/06-order-book.md`. Asks do
 * pior pro melhor preço (de cima pra baixo, aproximando do spread), bids
 * do melhor pro pior.
 */
export function OrderBook({ data }: OrderBookProps) {
  const { pair, asks, bids } = data;
  const asksWithDepth = withCumulative(asks);
  const bidsWithDepth = withCumulative(bids);
  const maxDepth = Math.max(
    asksWithDepth.at(-1)?.cumulative ?? 0,
    bidsWithDepth.at(-1)?.cumulative ?? 0,
  );

  const bestAsk = asks[0];
  const bestBid = bids[0];
  const spread = bestAsk && bestBid ? Number(bestAsk.price) - Number(bestBid.price) : null;
  const spreadPercent = spread !== null && bestAsk ? (spread / Number(bestAsk.price)) * 100 : null;

  return (
    <View className="border-border bg-card rounded-xl border">
      <View className="border-border gap-1 border-b px-4 py-4">
        <Text className="font-sans-semibold">{pair}</Text>
        <Text className="text-muted-foreground text-xs">Preço (R$) · Quantidade (BTC)</Text>
      </View>

      <View className="flex-col-reverse py-2">
        {asksWithDepth.map((level) => (
          <OrderBookRow key={`ask-${level.price}`} level={level} maxDepth={maxDepth} side="ask" />
        ))}
      </View>

      {spread !== null && (
        <View className="border-border bg-muted/40 flex-row items-center justify-between border-y px-4 py-3">
          <Text className="text-muted-foreground text-xs">Spread</Text>
          <Text className="text-muted-foreground font-mono text-xs">
            R$ {spread.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            {spreadPercent !== null &&
              ` (${spreadPercent.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%)`}
          </Text>
        </View>
      )}

      <View className="py-2">
        {bidsWithDepth.map((level) => (
          <OrderBookRow key={`bid-${level.price}`} level={level} maxDepth={maxDepth} side="bid" />
        ))}
      </View>
    </View>
  );
}
