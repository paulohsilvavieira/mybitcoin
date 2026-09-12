import { KycBadge } from '@/components/auth/kyc-badge'
import { Avatar } from '@/components/ui/avatar'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { USER_STATUS_LABELS, type AdminUser, type AdminUserStatus } from '@/types/backoffice'

const STATUS_VARIANT: Record<AdminUserStatus, BadgeVariant> = {
  ACTIVE: 'success',
  SUSPENDED: 'destructive',
  PENDING_EMAIL_VERIFICATION: 'default',
}

interface UserDetailHeaderProps {
  user: AdminUser
  onBlockClick: () => void
  onRefundClick: () => void
}

/** Cabeçalho da página de detalhes do usuário — avatar, badges e ações. */
export function UserDetailHeader({ user, onBlockClick, onRefundClick }: UserDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Avatar name={user.nome} className="size-14 text-lg" />
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-xl font-semibold">{user.nome}</h1>
            <Badge variant={STATUS_VARIANT[user.status]}>{USER_STATUS_LABELS[user.status]}</Badge>
            <KycBadge status={user.kycStatus} />
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onBlockClick}>
          Bloquear usuário
        </Button>
        <Button variant="destructive" onClick={onRefundClick}>
          Estornar valor
        </Button>
      </div>
    </div>
  )
}
