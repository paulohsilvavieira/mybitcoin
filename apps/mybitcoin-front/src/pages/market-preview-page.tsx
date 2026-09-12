import { Topbar } from '@/components/layout/topbar'
import { CoinCard } from '@/components/market/coin-card'
import { MarketTable } from '@/components/market/market-table'
import type { MarketAsset } from '@/types/market'

// Preços em satoshi (1 BTC = 100_000_000 sat) equivalente aos ~500k/BRL do
// mock de negociação, escalado para outros ativos ilustrativos.
export const MOCK_ASSETS: MarketAsset[] = [
  {
    asset: 'BTC',
    name: 'Bitcoin',
    priceSatoshi: '50020000000',
    changePercent24h: 1.06,
    volume24h: '1284523000',
    sparkline: [495.0, 497.2, 496.8, 498.7, 497.1, 498.0, 500.1, 499.4, 498.5, 500.3],
  },
  {
    asset: 'ETH',
    name: 'Ethereum',
    priceSatoshi: '3200000000',
    changePercent24h: -2.34,
    volume24h: '842300000',
    sparkline: [32.5, 32.1, 31.8, 31.2, 30.9, 30.5, 30.8, 30.2, 30.0, 29.8],
  },
  {
    asset: 'SOL',
    name: 'Solana',
    priceSatoshi: '85000000',
    changePercent24h: 4.52,
    volume24h: '215400000',
    sparkline: [0.78, 0.80, 0.79, 0.82, 0.81, 0.83, 0.85, 0.84, 0.86, 0.85],
  },
  {
    asset: 'USDT',
    name: 'Tether',
    priceSatoshi: '1000000',
    changePercent24h: 0.01,
    volume24h: '3120000000',
    sparkline: [1.0, 1.0, 1.0, 0.999, 1.0, 1.0, 1.001, 1.0, 1.0, 1.0],
  },
]

/**
 * Preview visual da tela de mercado com dados mocados — sem endpoint real na
 * API ainda. Só existe em desenvolvimento (guarda em `App.tsx`,
 * `import.meta.env.DEV`). Não é rota de produto: nunca linkar a partir de UI
 * real.
 */
export function MarketPreviewPage() {
  return (
    <div className="min-h-dvh">
      <Topbar userName="Ana Beatriz" />

      <main className="flex flex-col items-center p-6 lg:p-10">
        <div className="flex w-full max-w-[1600px] flex-col gap-8">
          <div>
            <h1 className="font-heading text-xl font-semibold">Mercado (preview)</h1>
            <p className="text-sm text-muted-foreground">
              Dados mocados — só em desenvolvimento, sem login.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {MOCK_ASSETS.map((asset) => (
              <CoinCard key={asset.asset} data={asset} />
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card">
            <MarketTable assets={MOCK_ASSETS} />
          </div>
        </div>
      </main>
    </div>
  )
}
