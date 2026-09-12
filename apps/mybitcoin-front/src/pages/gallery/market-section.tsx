import { CoinCard } from '@/components/market/coin-card'
import { MarketTable } from '@/components/market/market-table'
import { MOCK_ASSETS } from '@/pages/market-preview-page'
import type { MarketAsset } from '@/types/market'

// Ativos extras só para engordar a `MarketTable` (a `market-preview-page`
// tem 4 — o suficiente pros CoinCards, mas a tabela pede mais linhas).
// Mesma unidade/formato dos mocks reais (satoshi + sparkline em BRL).
const GALLERY_EXTRA_ASSETS: MarketAsset[] = [
  {
    asset: 'XRP',
    name: 'XRP',
    priceSatoshi: '620000',
    changePercent24h: 3.18,
    volume24h: '312400000',
    sparkline: [0.62, 0.61, 0.63, 0.64, 0.63, 0.65, 0.66, 0.65, 0.67, 0.68],
  },
  {
    asset: 'ADA',
    name: 'Cardano',
    priceSatoshi: '480000',
    changePercent24h: -1.42,
    volume24h: '98200000',
    sparkline: [0.5, 0.49, 0.48, 0.485, 0.47, 0.465, 0.46, 0.462, 0.455, 0.45],
  },
]

const TABLE_ASSETS: MarketAsset[] = [...MOCK_ASSETS, ...GALLERY_EXTRA_ASSETS]

/** `MarketTable` (mais linhas) e uma grade de `CoinCard` — usa os mesmos
 * mocks da `market-preview-page` para não inventar dado incoerente. */
export function MarketSection() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-lg font-semibold">Mercado</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {MOCK_ASSETS.map((asset) => (
          <CoinCard key={asset.asset} data={asset} />
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card">
        <MarketTable assets={TABLE_ASSETS} />
      </div>
    </section>
  )
}
