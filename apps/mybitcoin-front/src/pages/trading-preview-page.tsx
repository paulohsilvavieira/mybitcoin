import { useState } from 'react'
import { Topbar } from '@/components/layout/topbar'
import { MarketTicker } from '@/components/trading/market-ticker'
import { OpenOrders } from '@/components/trading/open-orders'
import { OrderBook } from '@/components/trading/order-book'
import { OrderForm } from '@/components/trading/order-form'
import { PriceChart } from '@/components/trading/price-chart'
import { TradeHistory } from '@/components/trading/trade-history'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Candle, MarketStats, OpenOrder, Trade } from '@/types/trading'
import type { OrderBookData } from '@/types/order-book'

// Mesmo exemplo numérico do "Estado Simplificado do Order Book" em
// docs/bussiness/06-order-book.md — não inventei valores novos.
export const MOCK_ORDER_BOOK: OrderBookData = {
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
}

export const MOCK_MARKET_STATS: MarketStats = {
  pair: 'BTC/BRL',
  lastPrice: '500.20',
  changePercent24h: 1.06,
  high24h: '505.00',
  low24h: '495.00',
  volume24h: '128.4523',
}

function daysAgo(n: number): string {
  const date = new Date()
  date.setDate(date.getDate() - n)
  return date.toISOString().slice(0, 10)
}

// Série diária determinística (sem Math.random) na mesma faixa de preço do
// order book mockado (495–505), pra ficar coerente com o resto da tela.
export const MOCK_CANDLES: Candle[] = [
  { open: 495.0, high: 497.2, low: 494.5, close: 496.8 },
  { open: 496.8, high: 498.0, low: 496.0, close: 497.5 },
  { open: 497.5, high: 499.1, low: 496.9, close: 498.7 },
  { open: 498.7, high: 499.0, low: 496.5, close: 497.1 },
  { open: 497.1, high: 498.3, low: 495.8, close: 498.0 },
  { open: 498.0, high: 500.5, low: 497.6, close: 500.1 },
  { open: 500.1, high: 501.2, low: 499.0, close: 499.4 },
  { open: 499.4, high: 499.9, low: 497.0, close: 497.6 },
  { open: 497.6, high: 498.8, low: 496.2, close: 498.5 },
  { open: 498.5, high: 500.0, low: 498.1, close: 499.8 },
  { open: 499.8, high: 502.0, low: 499.5, close: 501.6 },
  { open: 501.6, high: 503.1, low: 500.9, close: 502.4 },
  { open: 502.4, high: 502.9, low: 500.6, close: 501.0 },
  { open: 501.0, high: 501.8, low: 499.2, close: 499.7 },
  { open: 499.7, high: 500.6, low: 498.4, close: 500.3 },
  { open: 500.3, high: 501.5, low: 499.9, close: 500.9 },
  { open: 500.9, high: 505.0, low: 500.5, close: 504.2 },
  { open: 504.2, high: 504.6, low: 501.8, close: 502.3 },
  { open: 502.3, high: 502.7, low: 499.8, close: 500.5 },
  { open: 500.5, high: 501.0, low: 499.6, close: 500.2 },
].map((candle, index) => ({ ...candle, time: daysAgo(19 - index) }))

export const MOCK_OPEN_ORDERS: OpenOrder[] = [
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
]

export const MOCK_TRADES: Trade[] = [
  { id: 't1', price: '500.300', quantity: '0.05000000', takerSide: 'BUY', executedAt: new Date().toISOString() },
  { id: 't2', price: '500.200', quantity: '0.12000000', takerSide: 'SELL', executedAt: new Date(Date.now() - 60_000).toISOString() },
  { id: 't3', price: '500.300', quantity: '0.02000000', takerSide: 'BUY', executedAt: new Date(Date.now() - 120_000).toISOString() },
  { id: 't4', price: '500.100', quantity: '0.08000000', takerSide: 'SELL', executedAt: new Date(Date.now() - 200_000).toISOString() },
]

type ActivityTab = 'orders' | 'history'

/**
 * Preview visual da tela de negociação com dados mocados, sem exigir login
 * — a API ainda não tem endpoint de order book/trades (só o domínio
 * documentado em `docs/bussiness/`). Só existe em desenvolvimento, ver
 * guarda em `App.tsx` (`import.meta.env.DEV`). Não é rota de produto: nunca
 * linkar a partir de UI real.
 */
export function TradingPreviewPage() {
  const [activityTab, setActivityTab] = useState<ActivityTab>('orders')

  return (
    <div className="min-h-dvh">
      <Topbar userName="Ana Beatriz" />

      <main className="flex flex-col items-center p-6 lg:p-10">
        <div className="flex w-full max-w-[1600px] flex-col gap-8">
          <div>
            <h1 className="font-heading text-xl font-semibold">Negociação (preview)</h1>
            <p className="text-sm text-muted-foreground">
              Dados mocados — só em desenvolvimento, sem login e sem envio real de ordem.
            </p>
          </div>

          <MarketTicker stats={MOCK_MARKET_STATS} />

          <div className="grid gap-8 xl:grid-cols-[1fr_2.2fr_1fr]">
            <OrderBook data={MOCK_ORDER_BOOK} />

            <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
              <PriceChart candles={MOCK_CANDLES} />
            </div>

            <OrderForm
              pair={MOCK_ORDER_BOOK.pair}
              availableBase="0.15000000"
              availableQuote="12500.00"
            />
          </div>

          <div className="rounded-xl border border-border bg-card">
            <Tabs value={activityTab} onValueChange={(value) => setActivityTab(value as ActivityTab)}>
              <TabsList className="m-3">
                <TabsTrigger value="orders">Ordens abertas</TabsTrigger>
                <TabsTrigger value="history">Histórico de execução</TabsTrigger>
              </TabsList>
            </Tabs>
            {activityTab === 'orders' ? (
              <OpenOrders orders={MOCK_OPEN_ORDERS} />
            ) : (
              <TradeHistory trades={MOCK_TRADES} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
