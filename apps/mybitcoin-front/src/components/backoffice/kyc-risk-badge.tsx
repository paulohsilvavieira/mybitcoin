import { Badge, type BadgeVariant } from '@/components/ui/badge'
import type { AdminUserKyc } from '@/types/backoffice'

type RiscoFraude = AdminUserKyc['riscoFraude']

const RISCO_VARIANT: Record<RiscoFraude, BadgeVariant> = {
  baixo: 'success',
  medio: 'outline',
  alto: 'destructive',
}

const RISCO_LABEL: Record<RiscoFraude, string> = {
  baixo: 'Risco baixo',
  medio: 'Risco médio',
  alto: 'Risco alto',
}

export interface KycRiskBadgeProps {
  risco: RiscoFraude
}

/** Badge de risco de fraude estimado do KYC — verde/amarelo(outline)/vermelho. */
export function KycRiskBadge({ risco }: KycRiskBadgeProps) {
  return <Badge variant={RISCO_VARIANT[risco]}>{RISCO_LABEL[risco]}</Badge>
}
