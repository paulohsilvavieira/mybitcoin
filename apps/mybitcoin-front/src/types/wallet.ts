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

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL'

export type TransactionStatus = 'PENDING' | 'CONFIRMED' | 'FAILED'

/**
 * Depósito/saque on-chain — ainda sem endpoint na API (mock de UI).
 * `amountSatoshi` segue FIN-001/FIN-002 como `Balance`: string, nunca
 * `Number()`, exibição só via `formatSatoshi()`.
 */
export interface Transaction {
  id: string
  type: TransactionType
  asset: string
  amountSatoshi: string
  status: TransactionStatus
  txHash: string
  createdAt: string
}
