/**
 * Porte de `types/trading.ts` do `../mybitcoin-front` (sem `Candle` — o
 * gráfico de velas ainda não foi portado pro mobile, precisa de lib nativa
 * própria). Refletem os estados/campos descritos em
 * `docs/bussiness/05-mercados-de-negociacao.md` e
 * `docs/bussiness/08-trades-maker-taker-taxas.md`.
 */
export type OrderSide = 'BUY' | 'SELL';

export type OrderStatus =
  | 'NEW'
  | 'OPEN'
  | 'PARTIALLY_FILLED'
  | 'FILLED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REJECTED';

export type OrderType = 'LIMIT' | 'MARKET' | 'IOC' | 'FOK';

export interface OpenOrder {
  id: string;
  side: OrderSide;
  type: OrderType;
  price: string;
  quantity: string;
  filledQuantity: string;
  status: OrderStatus;
  createdAt: string;
}

export interface Trade {
  id: string;
  price: string;
  quantity: string;
  /** Lado que consumiu liquidez — é o lado exibido/colorido no histórico. */
  takerSide: OrderSide;
  executedAt: string;
}

export interface MarketStats {
  pair: string;
  lastPrice: string;
  changePercent24h: number;
  high24h: string;
  low24h: string;
  volume24h: string;
}
