/**
 * Saldo de um ativo, conforme `GET /financial/balances`.
 *
 * Valores monetários chegam como `string` (satoshi/menor unidade, bigint na
 * API) — nunca convertidos para `number` no frontend (FIN-001). Exibição
 * passa por `formatSatoshi()` (FIN-002).
 */
export interface Balance {
  asset: string
  available: string
  locked: string
  total: string
}
