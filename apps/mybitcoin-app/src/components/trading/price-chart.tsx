import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { Defs, LinearGradient, Polygon, Polyline, Stop, Svg } from 'react-native-svg';

import { Text } from '@/components/ui/text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ICON_DESTRUCTIVE, ICON_SUCCESS } from '@/lib/icon-colors';
import { cn } from '@/lib/utils';

const CHART_HEIGHT = 160;

/** Normaliza a série mocada num polyline/área dentro da viewport do SVG — sem zoom/candle real. */
function buildChartPaths(prices: number[], width: number) {
  if (prices.length < 2 || width <= 0) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const step = width / (prices.length - 1);

  const points = prices.map((price, index) => {
    const x = index * step;
    const y = CHART_HEIGHT - ((price - min) / range) * CHART_HEIGHT;
    return `${x},${y}`;
  });

  const line = points.join(' ');
  const area = `0,${CHART_HEIGHT} ${line} ${width},${CHART_HEIGHT}`;
  return { line, area };
}

interface PriceChartProps {
  pair: string;
  /** Série de preços de fechamento mocada — camada visual inicial, sem endpoint real ainda. */
  prices: string[];
}

/**
 * Equivalente simplificado do `price-chart.tsx` do `../mybitcoin-front`
 * (lá usa `lightweight-charts`, web-only) — não existia ainda no mobile.
 * Área de gráfico de linha com gradiente estático via `react-native-svg`,
 * sem zoom/candle real: só a camada visual inicial.
 */
export function PriceChart({ pair, prices }: PriceChartProps) {
  const [width, setWidth] = useState(0);
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';

  const numericPrices = prices.map(Number);
  const first = numericPrices[0] ?? 0;
  const last = numericPrices.at(-1) ?? 0;
  const isPositive = last >= first;
  const color = isPositive ? ICON_SUCCESS[scheme] : ICON_DESTRUCTIVE[scheme];
  const paths = buildChartPaths(numericPrices, width);

  function handleLayout(event: LayoutChangeEvent) {
    setWidth(event.nativeEvent.layout.width);
  }

  return (
    <View className="gap-2 rounded-xl border border-border bg-card p-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-sans-semibold">{pair}</Text>
        <Text className={cn('font-mono text-sm', isPositive ? 'text-success' : 'text-destructive')}>
          R$ {last.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Text>
      </View>

      <View onLayout={handleLayout} style={{ height: CHART_HEIGHT }}>
        {paths ? (
          <Svg width={width} height={CHART_HEIGHT}>
            <Defs>
              <LinearGradient id="priceChartArea" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={color} stopOpacity={0.25} />
                <Stop offset="1" stopColor={color} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Polygon points={paths.area} fill="url(#priceChartArea)" />
            <Polyline points={paths.line} fill="none" stroke={color} strokeWidth={2} />
          </Svg>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-sm text-muted-foreground">Sem dados suficientes para o gráfico.</Text>
          </View>
        )}
      </View>

      <Text className="text-center text-xs text-muted-foreground">
        Prévia visual — série mocada, sem zoom/candle real ainda.
      </Text>
    </View>
  );
}
