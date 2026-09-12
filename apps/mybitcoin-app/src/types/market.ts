/**
 * Porte de `types/market.ts` do `../mybitcoin-front`. Mercado ainda não tem
 * endpoint na API — estes campos alimentam telas de prévia com dados
 * mocados, mesma ressalva de `types/order-book.ts`.
 *
 * Preço/volume são `string` (nunca `number` em valor monetário, FIN-001).
 * `changePercent24h` é `number` propositalmente: é uma métrica percentual
 * derivada de exibição, não um valor monetário armazenado/transacionado.
 */
export interface MarketCoin {
  asset: string;
  pair: string;
  price: string;
  changePercent24h: number;
  volume24h: string;
  /** Série curta de preços de fechamento pra mini-sparkline — mock, sem candle real. */
  sparkline: number[];
}
