import { UserTable } from '@/components/backoffice/user-table'
import { MOCK_USERS } from '@/pages/backoffice/users-page.mocks'

/** Página de gestão de usuários do backoffice (mock de UI). */
export function UsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Usuários</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie contas, status e verificação KYC da base de usuários.
        </p>
      </div>

      <UserTable users={MOCK_USERS} />
    </div>
  )
}
