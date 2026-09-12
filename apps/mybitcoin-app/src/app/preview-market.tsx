import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Topbar } from '@/components/layout/topbar';
import { CoinCard } from '@/components/market/coin-card';
import { MarketTable } from '@/components/market/market-table';
import { Text } from '@/components/ui/text';
import type { MarketCoin } from '@/types/market';

// Mesmos pares/preço-base do `MOCK_MARKET_STATS` de `preview-trading.tsx` —
// não inventei uma cotação nova pro BTC/BRL.
const MOCK_COINS: MarketCoin[] = [
  {
    asset: 'BTC',
    pair: 'BTC/BRL',
    price: '500.200,00',
    changePercent24h: 1.06,
    volume24h: '128.4523',
    sparkline: [495, 498, 497, 500, 502, 501, 500.2],
  },
  {
    asset: 'ETH',
    pair: 'ETH/BRL',
    price: '18.240,50',
    changePercent24h: -2.34,
    volume24h: '842.1200',
    sparkline: [18.9, 18.6, 18.7, 18.4, 18.3, 18.25, 18.2405],
  },
  {
    asset: 'USDT',
    pair: 'USDT/BRL',
    price: '5,42',
    changePercent24h: 0.02,
    volume24h: '52340.0000',
    sparkline: [5.41, 5.42, 5.41, 5.42, 5.42, 5.42, 5.42],
  },
];

/**
 * Porte do preview de mercado do `../mybitcoin-front`. Preview visual com
 * dados mocados, sem login — ver guarda em `_layout.tsx`. Não é rota de
 * produto (mercado ainda não tem endpoint na API).
 */
export default function PreviewMarketScreen() {
  return (
    <View className="flex-1 bg-background">
      <Topbar userName="Ana Beatriz" />
      <ScrollView contentContainerClassName="gap-6 p-4">
        <View className="gap-1">
          <Text className="text-lg font-sans-semibold">Mercado (preview)</Text>
          <Text className="text-sm text-muted-foreground">
            Dados mocados — só em desenvolvimento, sem login e sem endpoint real de mercado.
          </Text>
        </View>

        <View className="gap-2">
          <Text className="font-sans-medium">Em destaque</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3">
            {MOCK_COINS.map((coin) => (
              <CoinCard key={coin.pair} coin={coin} />
            ))}
          </ScrollView>
        </View>

        <View className="gap-2">
          <Text className="font-sans-medium">Todos os mercados</Text>
          <MarketTable coins={MOCK_COINS} />
        </View>
      </ScrollView>
      <SafeAreaView edges={['bottom']} />
    </View>
  );
}
