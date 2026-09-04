/**
 * Saldo de um ativo, conforme `GET /financial/balances`. Porte de
 * `types/wallet.ts` do `../mybitcoin-front`.
 *
 * Valores monetários chegam como `string` (satoshi/menor unidade, bigint na
 * API) — nunca convertidos para `number` no app (FIN-001). Exibição passa
 * por `formatSatoshi()` (FIN-002).
 */
export interface Balance {
  asset: string;
  available: string;
  locked: string;
  total: string;
}
