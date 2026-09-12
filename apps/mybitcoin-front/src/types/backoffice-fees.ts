import type { WalletAsset } from '@/types/backoffice'

/**
 * Configuração global de taxas, de `docs/bussiness/08-trades-maker-taker-taxas.md`
 * (seção 4 — Taxas). `makerPercent`/`takerPercent` são percentuais (ex: 0.1 = 0,10%).
 * `withdrawalFeeSatoshi` é a taxa fixa de saque por ativo (seção 3.6 de
 * `09-depositos-e-saques.md`), sempre `string`/BigInt (FIN-001/002).
 */
export interface GlobalFeeConfig {
  makerPercent: number
  takerPercent: number
  withdrawalFeeSatoshi: Record<WalletAsset, string>
}

/**
 * Taxa especial (override) aplicada a um usuário específico — mock de UI, sem
 * endpoint real ainda. Quando `makerPercent`/`takerPercent` é `undefined`, o
 * usuário usa a taxa global correspondente.
 */
export interface UserFeeOverride {
  id: string
  userId: string
  userNome: string
  makerPercent?: number
  takerPercent?: number
  motivo: string
  criadoPor: string
  criadoEm: string
}
