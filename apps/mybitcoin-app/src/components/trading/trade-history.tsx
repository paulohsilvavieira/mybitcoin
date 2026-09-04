import { Fragment } from 'react';
import { View } from 'react-native';

import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import type { Trade } from '@/types/trading';

interface TradeHistoryProps {
  trades: Trade[];
}

/** Porte de `components/trading/trade-history.tsx` do `../mybitcoin-front`.
 * Cor segue o lado do Taker, como nas exchanges reais
 * (`docs/bussiness/08-trades-maker-taker-taxas.md`).
 *
 * `divide-y` do NativeWind depende de seletor de irmão em CSS, que não
 * existe em RN — por isso os separadores aqui são explícitos entre itens. */
export function TradeHistory({ trades }: TradeHistoryProps) {
  if (trades.length === 0) {
    return (
      <View className="py-8">
        <Text className="text-muted-foreground text-center text-sm">Nenhuma execução ainda.</Text>
      </View>
    );
  }

  return (
    <View>
      <View className="flex-row justify-between px-4 py-3">
        <Text className="text-muted-foreground text-xs">Preço (R$)</Text>
        <Text className="text-muted-foreground text-xs">Quantidade</Text>
        <Text className="text-muted-foreground text-xs">Hora</Text>
      </View>
      <Separator />
      {trades.map((trade, index) => (
        <Fragment key={trade.id}>
          {index > 0 && <Separator />}
          <View className="flex-row justify-between px-4 py-3">
            <Text
              className={
                trade.takerSide === 'BUY'
                  ? 'text-success font-mono text-sm'
                  : 'text-destructive font-mono text-sm'
              }
            >
              {Number(trade.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
            <Text className="text-muted-foreground font-mono text-sm">{trade.quantity}</Text>
            <Text className="text-muted-foreground font-mono text-sm">
              {new Date(trade.executedAt).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </Text>
          </View>
        </Fragment>
      ))}
    </View>
  );
}
