import { Avatar } from '@/components/ui/avatar'
import type { AdminProfile } from '@/types/backoffice-admin'

interface AdminProfileHeaderProps {
  admin: AdminProfile
}

/** Cabeçalho da página de configurações: avatar grande + nome + cargo. */
export function AdminProfileHeader({ admin }: AdminProfileHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Avatar name={admin.nome} className="size-16 text-lg" />
      <div className="min-w-0">
        <h1 className="font-heading text-xl font-semibold">{admin.nome}</h1>
        <p className="text-sm text-muted-foreground">{admin.cargo}</p>
        <p className="text-sm text-muted-foreground">{admin.email}</p>
      </div>
    </div>
  )
}
