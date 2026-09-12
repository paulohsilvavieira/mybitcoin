import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogCloseButton,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import { AdminRoleSelect } from '@/components/backoffice/admin-role-select'
import type { AdminMember, AdminRole } from '@/types/backoffice-roles'

interface ChangeRoleDialogProps {
  member: AdminMember | null
  onOpenChange: (open: boolean) => void
  onConfirm: (memberId: string, role: AdminRole) => void
}

/** Dialog para alterar o papel de um administrador — mock de UI, sem endpoint real. */
export function ChangeRoleDialog({ member, onOpenChange, onConfirm }: ChangeRoleDialogProps) {
  const [role, setRole] = useState<AdminRole>(member?.role ?? 'operacao')
  const [lastMemberId, setLastMemberId] = useState<string | null>(member?.id ?? null)
  const roleId = useId()
  const { toast } = useToast()

  // Sincroniza o select com o papel atual sempre que um membro diferente é aberto.
  if (member && member.id !== lastMemberId) {
    setLastMemberId(member.id)
    setRole(member.role)
  }

  function handleConfirm() {
    if (!member) return
    onConfirm(member.id, role)
    toast({ title: 'Papel atualizado (simulação)', variant: 'success' })
    onOpenChange(false)
  }

  return (
    <Dialog open={member !== null} onOpenChange={onOpenChange}>
      <DialogCloseButton onOpenChange={onOpenChange} />
      <DialogHeader>
        <DialogTitle>Alterar papel</DialogTitle>
        <DialogDescription>
          {member?.nome} — escolha o novo papel. Essa é uma simulação, nenhuma mudança real é
          aplicada.
        </DialogDescription>
      </DialogHeader>

      <AdminRoleSelect id={roleId} label="Novo papel" value={role} onChange={setRole} />

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button onClick={handleConfirm}>Confirmar</Button>
      </DialogFooter>
    </Dialog>
  )
}
