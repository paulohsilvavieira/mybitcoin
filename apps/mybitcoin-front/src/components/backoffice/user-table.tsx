import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserTableRow } from '@/components/backoffice/user-table-row'
import { USER_STATUS_LABELS, type AdminUser, type AdminUserStatus } from '@/types/backoffice'

type StatusFilter = AdminUserStatus | 'all'

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'ACTIVE', label: USER_STATUS_LABELS.ACTIVE },
  { value: 'PENDING_EMAIL_VERIFICATION', label: USER_STATUS_LABELS.PENDING_EMAIL_VERIFICATION },
  { value: 'SUSPENDED', label: USER_STATUS_LABELS.SUSPENDED },
]

interface UserTableProps {
  users: AdminUser[]
}

function filterUsers(users: AdminUser[], search: string, status: StatusFilter): AdminUser[] {
  const normalizedSearch = search.trim().toLowerCase()

  return users.filter((user) => {
    const matchesStatus = status === 'all' || user.status === status
    const matchesSearch =
      normalizedSearch === '' ||
      user.nome.toLowerCase().includes(normalizedSearch) ||
      user.email.toLowerCase().includes(normalizedSearch)
    return matchesStatus && matchesSearch
  })
}

/** Tabela de usuários do backoffice com busca e filtro por status (mock de UI). */
export function UserTable({ users }: UserTableProps) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')

  const filtered = useMemo(() => filterUsers(users, search, status), [users, search, status])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full max-w-sm flex-col gap-1.5">
          <Label htmlFor="user-search" className="sr-only">
            Buscar usuário
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="user-search"
              placeholder="Buscar por nome ou e-mail"
              className="pl-8"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <Tabs value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
          <TabsList>
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>KYC</TableHead>
              <TableHead>Saldo</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <UserTableRow key={user.id} user={user} />
            ))}
          </TableBody>
        </Table>

        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum usuário encontrado para esse filtro.
          </p>
        )}
      </div>
    </div>
  )
}
