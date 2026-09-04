/**
 * Porte de `types/order-book.ts` do `../mybitcoin-front`. Nível de preço
 * agregado do livro de ofertas — conforme
 * `docs/bussiness/06-order-book.md`.
 *
 * Diferente de `Balance` (types/wallet.ts), estes campos NÃO são satoshi
 * serializado como bigint: são preço em BRL e quantidade em BTC de um
 * domínio ainda sem endpoint na API. FIN-001/FIN-002 regem os saldos da
 * carteira, não este mock ilustrativo.
 */
export interface PriceLevel {
  price: string;
  quantity: string;
}

export interface OrderBookData {
  pair: string;
  /** Ordenados do menor para o maior preço — melhor ask primeiro. */
  asks: PriceLevel[];
  /** Ordenados do maior para o menor preço — melhor bid primeiro. */
  bids: PriceLevel[];
}
