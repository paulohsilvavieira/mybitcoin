import type { BadgeVariant } from '@/components/ui/badge'
import type { WithdrawalStatus } from '@/types/backoffice'

/** Rótulos em pt-BR dos estados reais de saque (`docs/bussiness/09-depositos-e-saques.md`, seção 3.3). */
export const WITHDRAWAL_STATUS_LABELS: Record<WithdrawalStatus, string> = {
  CREATED: 'Criado',
  PENDING_VALIDATION: 'Em validação',
  PENDING_APPROVAL: 'Aguardando aprovação',
  APPROVED: 'Aprovado',
  PROCESSING: 'Processando',
  SENT: 'Enviado',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Finalizado',
  REJECTED: 'Rejeitado',
  CANCELLED: 'Cancelado',
  FAILED: 'Falha operacional',
}

export const WITHDRAWAL_STATUS_VARIANTS: Record<WithdrawalStatus, BadgeVariant> = {
  CREATED: 'outline',
  PENDING_VALIDATION: 'outline',
  PENDING_APPROVAL: 'outline',
  APPROVED: 'default',
  PROCESSING: 'default',
  SENT: 'default',
  CONFIRMED: 'default',
  COMPLETED: 'success',
  REJECTED: 'destructive',
  CANCELLED: 'destructive',
  FAILED: 'destructive',
}
