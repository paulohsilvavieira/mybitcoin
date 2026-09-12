import { useNavigate } from 'react-router-dom'
import { KycBadge } from '@/components/auth/kyc-badge'
import { Avatar } from '@/components/ui/avatar'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatSatoshi } from '@/lib/utils'
import { USER_STATUS_LABELS, type AdminUser, type AdminUserStatus } from '@/types/backoffice'

const STATUS_VARIANT: Record<AdminUserStatus, BadgeVariant> = {
  ACTIVE: 'success',
  SUSPENDED: 'destructive',
  PENDING_EMAIL_VERIFICATION: 'default',
}

interface UserTableRowProps {
  user: AdminUser
}

/** Linha de usuário da tabela do backoffice — extraída para não inflar `UserTable` (UI-004). */
export function UserTableRow({ user }: UserTableRowProps) {
  const navigate = useNavigate()

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar name={user.nome} className="size-9 text-xs" />
          <div className="min-w-0">
            <p className="truncate font-medium">{user.nome}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={STATUS_VARIANT[user.status]}>{USER_STATUS_LABELS[user.status]}</Badge>
      </TableCell>
      <TableCell>
        <KycBadge status={user.kycStatus} />
      </TableCell>
      <TableCell className="font-mono tabular-nums">
        {formatSatoshi(user.saldoTotalSatoshi)}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {new Date(user.dataCadastro).toLocaleDateString('pt-BR')}
      </TableCell>
      <TableCell>
        <Button
          size="sm"
          variant="outline"
          className="h-9"
          onClick={() => navigate(`/preview/backoffice/users/${user.id}`)}
        >
          Ver detalhes
        </Button>
      </TableCell>
    </TableRow>
  )
}
