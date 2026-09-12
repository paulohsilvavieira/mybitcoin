import { Pressable, View } from 'react-native';
import { Polyline, Svg } from 'react-native-svg';

import { Text } from '@/components/ui/text';
import { AssetIcon, assetLabel } from '@/components/wallet/asset-icon';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ICON_DESTRUCTIVE, ICON_SUCCESS } from '@/lib/icon-colors';
import { cn } from '@/lib/utils';
import type { MarketCoin } from '@/types/market';

const SPARKLINE_WIDTH = 64;
const SPARKLINE_HEIGHT = 24;

/** Normaliza a série de preços mocada num polyline dentro da viewport do SVG. */
function buildSparklinePoints(values: number[]): string {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.min(...values) === Math.max(...values) ? min + 1 : Math.max(...values);
  const range = max - min;
  const step = SPARKLINE_WIDTH / (values.length - 1);

  return values
    .map((value, index) => {
      const x = index * step;
      const y = SPARKLINE_HEIGHT - ((value - min) / range) * SPARKLINE_HEIGHT;
      return `${x},${y}`;
    })
    .join(' ');
}

interface CoinCardProps {
  coin: MarketCoin;
  onPress?: () => void;
}

/**
 * Card compacto de moeda — porte de `components/market/coin-card.tsx` do
 * `../mybitcoin-front`. `react-native-svg` já é dependência do Expo aqui
 * (confirmado em `package.json`), então a sparkline usa `Polyline` de
 * verdade em vez de um placeholder em barras.
 */
export function CoinCard({ coin, onPress }: CoinCardProps) {
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const isPositive = coin.changePercent24h >= 0;
  const points = buildSparklinePoints(coin.sparkline);
  const strokeColor = isPositive ? ICON_SUCCESS[scheme] : ICON_DESTRUCTIVE[scheme];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${assetLabel(coin.asset)}, R$ ${coin.price}, ${coin.changePercent24h >= 0 ? 'alta' : 'queda'} de ${Math.abs(coin.changePercent24h)}%`}
      className="min-h-[44px] w-40 gap-3 rounded-xl border border-border bg-card p-4 active:bg-muted/50"
    >
      <View className="flex-row items-center gap-2">
        <AssetIcon asset={coin.asset} className="size-8" />
        <View className="min-w-0 flex-1">
          <Text className="font-sans-semibold text-sm">{coin.asset}</Text>
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            {assetLabel(coin.asset)}
          </Text>
        </View>
      </View>

      {points ? (
        <Svg width={SPARKLINE_WIDTH} height={SPARKLINE_HEIGHT}>
          <Polyline points={points} fill="none" stroke={strokeColor} strokeWidth={1.5} />
        </Svg>
      ) : (
        <View style={{ height: SPARKLINE_HEIGHT }} />
      )}

      <View className="gap-0.5">
        <Text className="font-mono text-sm font-medium">
          R$ {Number(coin.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Text>
        <Text className={cn('font-mono text-xs', isPositive ? 'text-success' : 'text-destructive')}>
          {isPositive ? '+' : ''}
          {coin.changePercent24h.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%
        </Text>
      </View>
    </Pressable>
  );
}
