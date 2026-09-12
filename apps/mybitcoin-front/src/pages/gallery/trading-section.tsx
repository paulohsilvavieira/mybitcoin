import { useState } from 'react'
import { MarketTicker } from '@/components/trading/market-ticker'
import { OpenOrders } from '@/components/trading/open-orders'
import { OrderBook } from '@/components/trading/order-book'
import { OrderForm } from '@/components/trading/order-form'
import { PriceChart } from '@/components/trading/price-chart'
import { QuickOrderTicket } from '@/components/trading/quick-order-ticket'
import { TradeHistory } from '@/components/trading/trade-history'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MOCK_CANDLES,
  MOCK_MARKET_STATS,
  MOCK_OPEN_ORDERS,
  MOCK_ORDER_BOOK,
  MOCK_TRADES,
} from '@/pages/trading-preview-page'

type ActivityTab = 'orders' | 'history'

/** Componentes de `src/components/trading/*`, reaproveitando exatamente os
 * mocks já usados em `trading-preview-page` (mesmo par/faixa de preço). */
export function TradingSection() {
  const [activityTab, setActivityTab] = useState<ActivityTab>('orders')

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-lg font-semibold">Trading</h2>

      <MarketTicker stats={MOCK_MARKET_STATS} />

      <div className="grid gap-4 xl:grid-cols-[1fr_2.2fr_1fr]">
        <OrderBook data={MOCK_ORDER_BOOK} />

        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <PriceChart candles={MOCK_CANDLES} />
        </div>

        <OrderForm pair={MOCK_ORDER_BOOK.pair} availableBase="0.15000000" availableQuote="12500.00" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>QuickOrderTicket</CardTitle>
        </CardHeader>
        <div className="px-(--card-spacing)">
          <QuickOrderTicket pair={MOCK_ORDER_BOOK.pair} referencePrice={Number(MOCK_MARKET_STATS.lastPrice)} />
        </div>
      </Card>

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
    </section>
  )
}
