/**
 * Nível de preço agregado do livro de ofertas — conforme
 * `docs/bussiness/06-order-book.md` (Price Levels).
 *
 * Diferente de `Balance` (types/wallet.ts), estes campos NÃO são satoshi
 * serializado como bigint: são preço em BRL e quantidade em BTC de um
 * domínio ainda sem endpoint na API (ver ADR pendente). FIN-001/FIN-002
 * (nunca `Number()`, sempre `formatSatoshi()`) regem os saldos da carteira,
 * não este mock ilustrativo — por isso os componentes de negociação fazem
 * aritmética simples aqui, mas não devem ser copiados como padrão para
 * telas que leem saldo real.
 */
export interface PriceLevel {
  price: string
  quantity: string
}

export interface OrderBookData {
  pair: string
  /** Ordenados do menor para o maior preço — melhor ask primeiro. */
  asks: PriceLevel[]
  /** Ordenados do maior para o menor preço — melhor bid primeiro. */
  bids: PriceLevel[]
}
