import { Badge, type BadgeVariant } from '@/components/ui/badge';
import type { KycStatus } from '@/types/auth';

const VARIANT: Record<NonNullable<KycStatus> | 'none', BadgeVariant> = {
  approved: 'success',
  pending: 'secondary',
  rejected: 'destructive',
  none: 'outline',
};

const LABEL: Record<NonNullable<KycStatus> | 'none', string> = {
  approved: 'Verificado',
  pending: 'Pendente',
  rejected: 'Rejeitado',
  none: 'Não iniciado',
};

interface KycBadgeProps {
  status: KycStatus;
}

/**
 * Selo de status de verificação — porte de
 * `components/auth/kyc-badge.tsx` do `../mybitcoin-front`. `status` espelha
 * `kycStatus` de `use-auth-store.ts` (`null` é "não iniciado" — ainda sem
 * badge de aviso/amarelo em `global.css`, por isso usa `secondary`/`outline`
 * em vez de inventar uma cor fora dos tokens do design system).
 */
export function KycBadge({ status }: KycBadgeProps) {
  const key = status ?? 'none';
  return <Badge variant={VARIANT[key]}>{LABEL[key]}</Badge>;
}
