import type { KycStatus } from '@/types/auth'

/**
 * Status reais do usuário, de `docs/bussiness/03-modelo-de-dominio.md` (seção
 * User) — não existe `BLOCKED` no domínio; "bloquear" no backoffice move o
 * usuário para `SUSPENDED`.
 */
export type AdminUserStatus = 'PENDING_EMAIL_VERIFICATION' | 'ACTIVE' | 'SUSPENDED'

export const USER_STATUS_LABELS: Record<AdminUserStatus, string> = {
  PENDING_EMAIL_VERIFICATION: 'Verificação pendente',
  ACTIVE: 'Ativo',
  SUSPENDED: 'Suspenso',
}

/** Um evento no histórico de revisão de KYC de um usuário — mock de UI. */
export interface KycReviewEntry {
  data: string
  adminNome: string
  decisao: 'enviado' | 'aprovado' | 'rejeitado' | 'reenviado'
  motivo?: string
}

/**
 * Dados de KYC coletados do usuário. Os 4 campos básicos (`nomeCompleto`,
 * `cpf`, `dataNascimento`, `nacionalidade`) vêm de
 * `docs/bussiness/02-identidade-e-acesso.md` (seção 7 — KYC-002 a KYC-004).
 * Os demais campos (documento, endereço, telefone, risco, notas, histórico)
 * são uma extensão de UI para dar contexto operacional ao time de
 * compliance — não fazem parte do "KYC Básico" documentado.
 * `cpf` e `numeroDocumento` são dados sensíveis: nunca logar no console,
 * exibir sempre mascarados.
 */
export interface AdminUserKyc {
  nomeCompleto: string
  cpf: string
  dataNascimento: string
  nacionalidade: string
  enviadoEm: string
  tipoDocumento: 'RG' | 'CNH' | 'Passaporte'
  numeroDocumento: string
  endereco: string
  telefone: string
  riscoFraude: 'baixo' | 'medio' | 'alto'
  notasInternas: string[]
  historico: KycReviewEntry[]
}

/**
 * Nível de conta e limites de depósito/saque, de
 * `docs/bussiness/09-depositos-e-saques.md` (seções 2.6 e 3.5).
 * Alias de `UserLevel` (definido mais abaixo, já usado por `WithdrawalRequest`)
 * para não duplicar a mesma união de valores sob dois nomes.
 */
export type AccountLevel = UserLevel

/**
 * Usuário visto pela equipe interna no backoffice — mock de UI, sem endpoint
 * real ainda. `saldoTotalSatoshi` segue FIN-001/FIN-002: string, nunca
 * `Number()`, exibição só via `formatSatoshi()`.
 */
export interface AdminUser {
  id: string
  nome: string
  email: string
  status: AdminUserStatus
  kycStatus: KycStatus
  /** `undefined` quando `kycStatus === 'NOT_STARTED'` (nenhum documento enviado ainda). */
  kyc?: AdminUserKyc
  accountLevel: AccountLevel
  saldoTotalSatoshi: string
  dataCadastro: string
}

export type WalletAsset = 'BTC' | 'ETH' | 'USDT' | 'SOL'

/**
 * Reserva hot ou cold de um ativo — mock de UI, sem endpoint real ainda.
 * Saldos seguem FIN-001/FIN-002: string, nunca `Number()`, exibição só via
 * `formatSatoshi()`.
 */
export interface WalletReserve {
  asset: WalletAsset
  hotBalance: string
  coldBalance: string
  /** Limiar mínimo de saldo hot (mesma unidade de `hotBalance`). */
  hotMinThreshold: string
  /** true quando `hotBalance` está acima de `hotMinThreshold`. */
  isHealthy: boolean
  /** Endereços de custódia — só leitura, para a equipe saber onde os fundos estão. */
  addresses: { hot: string; cold: string }
}

/** Movimentação recente de uma reserva hot/cold — mock de UI (extrato simplificado). */
export interface WalletMovement {
  id: string
  asset: WalletAsset
  tipo: 'credito' | 'debito'
  valor: string
  motivo: string
  data: string
}

export type TransferStatus = 'agendada' | 'processando' | 'concluida' | 'cancelada'

/**
 * Transferência agendada cold→hot (ou hot→cold) — mock de UI. Valor sempre
 * `string` (FIN-001).
 */
export interface ScheduledTransfer {
  id: string
  asset: WalletAsset
  origem: 'hot' | 'cold'
  destino: 'hot' | 'cold'
  valor: string
  agendadoPara: string
  status: TransferStatus
}

/**
 * Estados reais da máquina de estados de saque (doc de negócio
 * `09-depositos-e-saques.md`, seção 3.3). Nomes em inglês/maiúsculo por serem
 * estados de máquina, não texto de exibição — ver `WITHDRAWAL_STATUS_LABELS`
 * em `withdrawal-queue-table.tsx` para os rótulos em pt-BR.
 */
export type WithdrawalStatus =
  | 'CREATED'
  | 'PENDING_VALIDATION'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PROCESSING'
  | 'SENT'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'FAILED'

export type UserLevel = 'basico' | 'intermediario' | 'avancado'

/**
 * Solicitação de saque na fila de aprovação do backoffice — mock de UI, sem
 * endpoint real ainda. `valor` e `feeSatoshi` seguem FIN-001/FIN-002: string,
 * nunca `Number()`, exibição só via `formatSatoshi()`.
 */
export interface WithdrawalRequest {
  id: string
  userId: string
  userNome: string
  asset: WalletAsset
  /** Valor solicitado, em satoshi (ou menor unidade do ativo). */
  valor: string
  /** Taxa cobrada pela rede, em satoshi (ou menor unidade do ativo). */
  feeSatoshi: string
  enderecoDestino: string
  status: WithdrawalStatus
  criadoEm: string
  nivelUsuario: UserLevel
  /** Preenchidos só após revisão manual (status diferente de `PENDING_APPROVAL`/`PENDING_VALIDATION`/`CREATED`). */
  revisadoPor?: string
  revisadoEm?: string
  motivoRevisao?: string
}

export type AuditActionType =
  | 'bloqueio_usuario'
  | 'estorno'
  | 'transferencia_agendada'
  | 'transferencia_cancelada'
  | 'outro'

/** Registro de auditoria de ação administrativa — mock de UI. */
export interface AuditLogEntry {
  id: string
  dataHora: string
  adminNome: string
  adminAvatarUrl?: string
  actionType: AuditActionType
  acao: string
  alvo: string
  detalhes: string
}
