/**
 * Papéis de administrador do backoffice — segregação de função entre
 * operação, financeiro e compliance. Convenção de UI própria do backoffice
 * (não vem de doc de domínio, já que RBAC administrativo ainda não está
 * modelado em `docs/bussiness/`).
 */
export type AdminRole = 'operacao' | 'financeiro' | 'compliance' | 'super_admin'

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  operacao: 'Operação',
  financeiro: 'Financeiro',
  compliance: 'Compliance',
  super_admin: 'Super Admin',
}

/**
 * Uma permissão nomeada que uma tela/ação do backoffice pode exigir.
 * `super_admin` sempre tem todas — não precisa ser listado em `rolePermissions`.
 */
export type AdminPermission =
  | 'users.view'
  | 'users.block'
  | 'users.refund'
  | 'wallets.view'
  | 'wallets.transfer'
  | 'withdrawals.review'
  | 'fees.manage'
  | 'markets.manage'
  | 'audit.view'
  | 'admins.manage'

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  operacao: [
    'users.view',
    'wallets.view',
    'wallets.transfer',
    'withdrawals.review',
    'markets.manage',
    'audit.view',
  ],
  financeiro: ['users.view', 'users.refund', 'wallets.view', 'fees.manage', 'audit.view'],
  compliance: ['users.view', 'users.block', 'audit.view'],
  // Lista vazia é tratada como "todas as permissões" por `hasPermission` —
  // super_admin não precisa ser mantido em sincronia com a lista de permissões.
  super_admin: [],
}

/** `super_admin` sempre retorna true (ver comentário em `ROLE_PERMISSIONS`). */
export function hasPermission(role: AdminRole, permission: AdminPermission): boolean {
  if (role === 'super_admin') return true
  return ROLE_PERMISSIONS[role].includes(permission)
}

export interface AdminMember {
  id: string
  nome: string
  email: string
  role: AdminRole
  ativo: boolean
  criadoEm: string
}
