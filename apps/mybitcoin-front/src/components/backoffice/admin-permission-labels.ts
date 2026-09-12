import type { AdminPermission, AdminRole } from '@/types/backoffice-roles'

/** Rótulos pt-BR para cada permissão — reaproveitados no overview e no dialog de troca de papel. */
export const ADMIN_PERMISSION_LABELS: Record<AdminPermission, string> = {
  'users.view': 'Ver usuários',
  'users.block': 'Bloquear usuários',
  'users.refund': 'Reembolsar usuários',
  'wallets.view': 'Ver carteiras',
  'wallets.transfer': 'Transferir entre carteiras',
  'withdrawals.review': 'Revisar saques',
  'fees.manage': 'Gerenciar taxas',
  'markets.manage': 'Gerenciar mercados',
  'audit.view': 'Ver auditoria',
  'admins.manage': 'Gerenciar administradores',
}

/** Cor de badge por papel — só uma convenção visual da UI, não vem de doc de domínio. */
export const ADMIN_ROLE_BADGE_VARIANT: Record<AdminRole, 'default' | 'outline' | 'success' | 'secondary'> = {
  super_admin: 'default',
  operacao: 'outline',
  financeiro: 'success',
  compliance: 'secondary',
}
