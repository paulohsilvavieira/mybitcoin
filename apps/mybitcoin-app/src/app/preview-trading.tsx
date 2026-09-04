import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Topbar } from '@/components/layout/topbar';
import { MarketTicker } from '@/components/trading/market-ticker';
import { OpenOrders } from '@/components/trading/open-orders';
import { OrderBook } from '@/components/trading/order-book';
import { OrderForm } from '@/components/trading/order-form';
import { TradeHistory } from '@/components/trading/trade-history';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { OrderBookData } from '@/types/order-book';
import type { MarketStats, OpenOrder, Trade } from '@/types/trading';

// Mesmo exemplo numérico do "Estado Simplificado do Order Book" em
// docs/bussiness/06-order-book.md — não inventei valores novos. Mesmos
// mocks do `trading-preview-page.tsx` do front (sem os candles).
const MOCK_ORDER_BOOK: OrderBookData = {
  pair: 'BTC/BRL',
  asks: [
    { price: '500.300', quantity: '0.20' },
    { price: '500.400', quantity: '0.50' },
    { price: '500.500', quantity: '0.30' },
  ],
  bids: [
    { price: '500.200', quantity: '0.40' },
    { price: '500.100', quantity: '0.60' },
    { price: '500.000', quantity: '1.20' },
  ],
};

const MOCK_MARKET_STATS: MarketStats = {
  pair: 'BTC/BRL',
  lastPrice: '500.20',
  changePercent24h: 1.06,
  high24h: '505.00',
  low24h: '495.00',
  volume24h: '128.4523',
};

const MOCK_OPEN_ORDERS: OpenOrder[] = [
  {
    id: '1',
    side: 'BUY',
    type: 'LIMIT',
    price: '499.500',
    quantity: '0.30000000',
    filledQuantity: '0.00000000',
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    side: 'SELL',
    type: 'LIMIT',
    price: '501.000',
    quantity: '0.15000000',
    filledQuantity: '0.05000000',
    status: 'PARTIALLY_FILLED',
    createdAt: new Date().toISOString(),
  },
];

const MOCK_TRADES: Trade[] = [
  { id: 't1', price: '500.300', quantity: '0.05000000', takerSide: 'BUY', executedAt: new Date().toISOString() },
  { id: 't2', price: '500.200', quantity: '0.12000000', takerSide: 'SELL', executedAt: new Date(Date.now() - 60_000).toISOString() },
  { id: 't3', price: '500.300', quantity: '0.02000000', takerSide: 'BUY', executedAt: new Date(Date.now() - 120_000).toISOString() },
  { id: 't4', price: '500.100', quantity: '0.08000000', takerSide: 'SELL', executedAt: new Date(Date.now() - 200_000).toISOString() },
];

type ActivityTab = 'orders' | 'history';
type TradePanelTab = 'order' | 'book';

/**
 * Porte de `pages/trading-preview-page.tsx` do `../mybitcoin-front`, sem o
 * gráfico de velas (precisa de lib nativa própria, `lightweight-charts` é
 * web-only). Ver guarda em `_layout.tsx`. Não é rota de produto.
 *
 * Livro de ofertas e formulário de ordem viram abas alternáveis (em vez de
 * empilhados como no desktop) — empilhar os dois obrigava rolar por 6+
 * linhas de livro antes de chegar no formulário, que é a ação principal da
 * tela. "Ordem" é a aba padrão pelo mesmo motivo.
 */
export default function PreviewTradingScreen() {
  const [tradePanelTab, setTradePanelTab] = useState<TradePanelTab>('order');
  const [activityTab, setActivityTab] = useState<ActivityTab>('orders');

  return (
    <View className="bg-background flex-1">
      <Topbar userName="Ana Beatriz" />
      <ScrollView contentContainerClassName="p-4 gap-6">
        <View className="gap-1">
          <Text className="font-sans-semibold text-lg">Negociação (preview)</Text>
          <Text className="text-muted-foreground text-sm">
            Dados mocados — só em desenvolvimento, sem login e sem envio real de ordem. Gráfico
            ainda não portado.
          </Text>
        </View>

        <MarketTicker stats={MOCK_MARKET_STATS} />

        <View className="gap-3">
          <View className="bg-muted flex-row gap-1 rounded-lg p-1">
            <Button
              variant={tradePanelTab === 'order' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
              onPress={() => setTradePanelTab('order')}
            >
              <Text className={cn(tradePanelTab === 'order' && 'text-primary-foreground')}>
                Ordem
              </Text>
            </Button>
            <Button
              variant={tradePanelTab === 'book' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
              onPress={() => setTradePanelTab('book')}
            >
              <Text className={cn(tradePanelTab === 'book' && 'text-primary-foreground')}>
                Livro de ofertas
              </Text>
            </Button>
          </View>

          {tradePanelTab === 'order' ? (
            <OrderForm
              pair={MOCK_ORDER_BOOK.pair}
              availableBase="0.15000000"
              availableQuote="12500.00"
            />
          ) : (
            <OrderBook data={MOCK_ORDER_BOOK} />
          )}
        </View>

        <View className="border-border bg-card rounded-xl border">
          <View className="bg-muted m-3 flex-row gap-1 rounded-lg p-1">
            <Button
              variant={activityTab === 'orders' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
              onPress={() => setActivityTab('orders')}
            >
              <Text className={cn(activityTab === 'orders' && 'text-primary-foreground')}>
                Ordens abertas
              </Text>
            </Button>
            <Button
              variant={activityTab === 'history' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1"
              onPress={() => setActivityTab('history')}
            >
              <Text className={cn(activityTab === 'history' && 'text-primary-foreground')}>
                Histórico
              </Text>
            </Button>
          </View>
          {activityTab === 'orders' ? (
            <OpenOrders orders={MOCK_OPEN_ORDERS} />
          ) : (
            <TradeHistory trades={MOCK_TRADES} />
          )}
        </View>
      </ScrollView>
      <SafeAreaView edges={['bottom']} />
    </View>
  );
}
