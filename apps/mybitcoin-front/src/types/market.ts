/**
 * Ativo listado na tela de mercado — ainda sem endpoint dedicado na API
 * (mock de UI, como `order-book.ts`). `priceSatoshi` é satoshi serializado
 * como bigint e segue FIN-001/FIN-002 (nunca `Number()`, exibição só via
 * `formatSatoshi()`); `changePercent24h` e `sparkline` são apenas números de
 * exibição (percentual/série de preço em BRL), não valores monetários em
 * satoshi.
 */
export interface MarketAsset {
  asset: string
  name: string
  priceSatoshi: string
  changePercent24h: number
  volume24h: string
  /** Série curta de preços em BRL, só para o mini-sparkline — não satoshi. */
  sparkline: number[]
}
