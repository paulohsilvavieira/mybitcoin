import { Badge, type BadgeVariant } from '@/components/ui/badge'
import type { KycStatus } from '@/types/auth'

const KYC_VARIANT: Record<KycStatus, BadgeVariant> = {
  VERIFIED: 'success',
  PENDING: 'default',
  REJECTED: 'destructive',
  NOT_STARTED: 'outline',
}

const KYC_LABEL: Record<KycStatus, string> = {
  VERIFIED: 'Verificado',
  PENDING: 'Pendente',
  REJECTED: 'Rejeitado',
  NOT_STARTED: 'Não iniciado',
}

export interface KycBadgeProps {
  status: KycStatus
}

/** Badge de status de verificação KYC da conta. */
export function KycBadge({ status }: KycBadgeProps) {
  return <Badge variant={KYC_VARIANT[status]}>{KYC_LABEL[status]}</Badge>
}
