import type { AdminMarket } from '@/types/backoffice-markets'

// Dados mocados — protótipo visual, sem chamada de API real (ver skill brief).
// Os 3 primeiros mercados refletem `docs/bussiness/05-mercados-de-negociacao.md`.
// Os demais são fictícios, apenas para exercitar os badges de status.
export const MOCK_MARKETS: AdminMarket[] = [
  {
    id: 'mkt_btc_usdt',
    symbol: 'BTC/USDT',
    baseAsset: 'BTC',
    quoteAsset: 'USDT',
    minQuantity: '0.00001',
    quantityIncrement: '0.00001',
    tickSize: '0.01',
    status: 'ATIVO',
    criadoEm: '2026-01-10T09:00:00Z',
  },
  {
    id: 'mkt_eth_usdt',
    symbol: 'ETH/USDT',
    baseAsset: 'ETH',
    quoteAsset: 'USDT',
    minQuantity: '0.0001',
    quantityIncrement: '0.0001',
    tickSize: '0.01',
    status: 'ATIVO',
    criadoEm: '2026-01-10T09:00:00Z',
  },
  {
    id: 'mkt_sol_usdt',
    symbol: 'SOL/USDT',
    baseAsset: 'SOL',
    quoteAsset: 'USDT',
    minQuantity: '0.01',
    quantityIncrement: '0.01',
    tickSize: '0.001',
    status: 'ATIVO',
    criadoEm: '2026-01-10T09:00:00Z',
  },
  {
    id: 'mkt_usdc_usdt',
    symbol: 'USDC/USDT',
    baseAsset: 'USDC',
    quoteAsset: 'USDT',
    minQuantity: '1',
    quantityIncrement: '1',
    tickSize: '0.001',
    status: 'PAUSADO',
    criadoEm: '2026-03-15T13:30:00Z',
  },
  {
    id: 'mkt_doge_usdt',
    symbol: 'DOGE/USDT',
    baseAsset: 'DOGE',
    quoteAsset: 'USDT',
    minQuantity: '10',
    quantityIncrement: '1',
    tickSize: '0.0001',
    status: 'DESLISTADO',
    criadoEm: '2026-02-01T08:00:00Z',
  },
]
