import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { MarketStats } from '@/types/trading';

function formatBrl(value: string): string {
  return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

interface StatProps {
  label: string;
  value: string;
  tone?: 'success' | 'destructive';
}

function Stat({ label, value, tone }: StatProps) {
  return (
    <View className="gap-0.5">
      <Text className="text-muted-foreground text-xs">{label}</Text>
      <Text
        className={cn(
          'font-mono text-sm',
          tone === 'success' && 'text-success',
          tone === 'destructive' && 'text-destructive',
        )}
      >
        {value}
      </Text>
    </View>
  );
}

interface MarketTickerProps {
  stats: MarketStats;
}

/** Porte de `components/trading/market-ticker.tsx` do `../mybitcoin-front`. */
export function MarketTicker({ stats }: MarketTickerProps) {
  const isPositive = stats.changePercent24h >= 0;

  return (
    <View className="border-border bg-card flex-row flex-wrap gap-x-8 gap-y-3 rounded-xl border p-4">
      <View>
        <Text className="font-sans-semibold">{stats.pair}</Text>
        <Text className="font-mono text-2xl font-medium">R$ {formatBrl(stats.lastPrice)}</Text>
      </View>

      <Stat
        label="Variação 24h"
        value={`${isPositive ? '+' : ''}${stats.changePercent24h.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%`}
        tone={isPositive ? 'success' : 'destructive'}
      />
      <Stat label="Máxima 24h" value={`R$ ${formatBrl(stats.high24h)}`} />
      <Stat label="Mínima 24h" value={`R$ ${formatBrl(stats.low24h)}`} />
      <Stat label="Volume 24h (BTC)" value={stats.volume24h} />
    </View>
  );
}
