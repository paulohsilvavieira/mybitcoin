import { Check, ShieldCheck } from 'lucide-react'
import { Field } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { selectClassName } from '@/components/backoffice/transfer-reserva-select'
import { ADMIN_PERMISSION_LABELS } from '@/components/backoffice/admin-permission-labels'
import { ADMIN_ROLE_LABELS, ROLE_PERMISSIONS, type AdminRole } from '@/types/backoffice-roles'

const ROLES: AdminRole[] = ['operacao', 'financeiro', 'compliance', 'super_admin']

interface AdminRoleSelectProps {
  id: string
  label: string
  value: AdminRole
  onChange: (value: AdminRole) => void
}

/** Select nativo estilizado para escolher um `AdminRole`, com preview das permissões abaixo. */
export function AdminRoleSelect({ id, label, value, onChange }: AdminRoleSelectProps) {
  const permissions = ROLE_PERMISSIONS[value]
  const isSuperAdmin = value === 'super_admin'

  return (
    <div className="flex flex-col gap-2">
      <Field>
        <Label htmlFor={id}>{label}</Label>
        <select
          id={id}
          className={selectClassName}
          value={value}
          onChange={(event) => onChange(event.target.value as AdminRole)}
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {ADMIN_ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      </Field>

      <div className="rounded-lg border border-border bg-muted/30 p-3">
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">Permissões deste papel</p>
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
    </div>
  )
}
