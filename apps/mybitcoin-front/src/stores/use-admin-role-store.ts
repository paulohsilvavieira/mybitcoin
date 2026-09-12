import { create } from 'zustand'
import type { AdminRole } from '@/types/backoffice-roles'

interface AdminRoleState {
  role: AdminRole
  setRole: (role: AdminRole) => void
}

/**
 * Papel do admin logado no backoffice — client-side, cross-page (sidebar e
 * páginas inteiras mudam de visibilidade conforme o papel). Começa como
 * `super_admin` para que todo o backoffice fique visível por padrão; o
 * seletor "Visualizando como" no cabeçalho (mock, sem autenticação real)
 * deixa trocar de papel para demonstrar a segregação de função.
 */
export const useAdminRoleStore = create<AdminRoleState>()((set) => ({
  role: 'super_admin',
  setRole: (role) => set({ role }),
}))
