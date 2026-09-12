/**
 * Par de negociação administrado pelo backoffice, de
 * `docs/bussiness/05-mercados-de-negociacao.md` (config por mercado:
 * quantidade mínima/incremento, tick size). `status` reflete MOD-015 do
 * modelo de domínio ("mercado inativo não aceita novas ordens").
 */
export type MarketStatus = 'ATIVO' | 'PAUSADO' | 'DESLISTADO'

export interface AdminMarket {
  id: string
  symbol: string
  baseAsset: string
  quoteAsset: string
  minQuantity: string
  quantityIncrement: string
  tickSize: string
  status: MarketStatus
  criadoEm: string
}
