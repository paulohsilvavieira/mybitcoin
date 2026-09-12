import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AdminMembersTable } from '@/components/backoffice/admin-members-table'
import { ChangeRoleDialog } from '@/components/backoffice/change-role-dialog'
import { InviteAdminDialog } from '@/components/backoffice/invite-admin-dialog'
import { RolePermissionsOverview } from '@/components/backoffice/role-permissions-overview'
import { MOCK_ADMINS } from '@/pages/backoffice/admins-page.mocks'
import type { AdminMember, AdminRole } from '@/types/backoffice-roles'

/** Página de gestão de administradores do backoffice — RBAC mockado, sem API real. */
export function AdminsPage() {
  const [members, setMembers] = useState<AdminMember[]>(MOCK_ADMINS)
  const [changeRoleMember, setChangeRoleMember] = useState<AdminMember | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)

  function handleConfirmRoleChange(memberId: string, role: AdminRole) {
    setMembers((prev) => prev.map((member) => (member.id === memberId ? { ...member, role } : member)))
  }

  function handleToggleAtivo(memberId: string, ativo: boolean) {
    setMembers((prev) => prev.map((member) => (member.id === memberId ? { ...member, ativo } : member)))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-semibold">Administradores</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os membros da equipe com acesso ao backoffice e o papel de cada um.
          </p>
        </div>
        <Button size="sm" onClick={() => setInviteOpen(true)}>
          Convidar administrador
        </Button>
      </div>

      <RolePermissionsOverview />

      <AdminMembersTable
        members={members}
        onChangeRoleClick={setChangeRoleMember}
        onToggleAtivo={handleToggleAtivo}
      />

      <ChangeRoleDialog
        member={changeRoleMember}
        onOpenChange={(open) => !open && setChangeRoleMember(null)}
        onConfirm={handleConfirmRoleChange}
      />

      <InviteAdminDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvite={(member) => setMembers((prev) => [...prev, member])}
      />
    </div>
  )
}
