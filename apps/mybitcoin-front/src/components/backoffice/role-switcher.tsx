import { useId } from 'react'
import { cn } from '@/lib/utils'
import { useAdminRoleStore } from '@/stores/use-admin-role-store'
import { ADMIN_ROLE_LABELS, type AdminRole } from '@/types/backoffice-roles'

const ROLES = Object.keys(ADMIN_ROLE_LABELS) as AdminRole[]

const selectClassName = cn(
  'h-8 rounded-lg border border-input bg-transparent px-2 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30',
)

/**
 * Seletor "Visualizando como" — mock de UI para demonstrar RBAC sem
 * autenticação real: troca `useAdminRoleStore` e a sidebar/páginas reagem
 * de acordo com `hasPermission()`. Não existe fora do backoffice de preview.
 */
export function RoleSwitcher() {
  const role = useAdminRoleStore((state) => state.role)
  const setRole = useAdminRoleStore((state) => state.setRole)
  const selectId = useId()

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={selectId} className="text-xs text-muted-foreground">
        Visualizando como
      </label>
      <select
        id={selectId}
        className={selectClassName}
        value={role}
        onChange={(event) => setRole(event.target.value as AdminRole)}
      >
        {ROLES.map((option) => (
          <option key={option} value={option}>
            {ADMIN_ROLE_LABELS[option]}
          </option>
        ))}
      </select>
    </div>
  )
}
