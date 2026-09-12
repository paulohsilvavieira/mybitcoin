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

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL';

export type TransactionStatus = 'CONFIRMED' | 'PENDING' | 'FAILED';

/**
 * Movimento de depósito/saque on-chain, conforme
 * `docs/bussiness/04-carteiras-e-ledger-financeiro.md`. Mesmos nomes de
 * campo de `types/wallet.ts` do `../mybitcoin-front`. `amountSatoshi` chega
 * como satoshi serializado (bigint na API) — exibição via `formatSatoshi()`
 * (FIN-002), nunca `Number()` (FIN-001).
 */
export interface Transaction {
  id: string;
  type: TransactionType;
  amountSatoshi: string;
  status: TransactionStatus;
  txHash: string;
  createdAt: string;
}
