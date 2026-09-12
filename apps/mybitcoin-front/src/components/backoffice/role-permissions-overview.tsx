import { Check, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ADMIN_PERMISSION_LABELS } from '@/components/backoffice/admin-permission-labels'
import { ADMIN_ROLE_LABELS, ROLE_PERMISSIONS, type AdminRole } from '@/types/backoffice-roles'

const ROLES: AdminRole[] = ['super_admin', 'operacao', 'financeiro', 'compliance']

interface RoleColumnProps {
  role: AdminRole
}

function RoleColumn({ role }: RoleColumnProps) {
  const permissions = ROLE_PERMISSIONS[role]
  const isSuperAdmin = role === 'super_admin'

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <p className="text-sm font-semibold">{ADMIN_ROLE_LABELS[role]}</p>

      {isSuperAdmin ? (
        <div className="flex items-center gap-1.5 text-sm text-primary">
          <ShieldCheck className="size-4 shrink-0" />
          <span>Acesso total</span>
        </div>
      ) : (
        <ul className="flex flex-col gap-1">
          {permissions.map((permission) => (
            <li key={permission} className="flex items-start gap-1.5 text-sm text-muted-foreground">
              <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
              <span>{ADMIN_PERMISSION_LABELS[permission]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Card explicativo: o que cada papel de admin pode fazer, derivado de `ROLE_PERMISSIONS`. */
export function RolePermissionsOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>O que cada papel pode fazer</CardTitle>
        <CardDescription>
          Segregação de função entre os papéis de administrador do backoffice.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((role) => (
            <RoleColumn key={role} role={role} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
