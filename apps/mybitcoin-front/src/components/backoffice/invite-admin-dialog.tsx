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
import { Field, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { AdminRoleSelect } from '@/components/backoffice/admin-role-select'
import type { AdminMember, AdminRole } from '@/types/backoffice-roles'

interface InviteAdminDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvite: (member: AdminMember) => void
}

/** Dialog para convidar um novo administrador — mock de UI, nenhum convite é enviado de fato. */
export function InviteAdminDialog({ open, onOpenChange, onInvite }: InviteAdminDialogProps) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<AdminRole>('operacao')
  const [showError, setShowError] = useState(false)
  const nomeId = useId()
  const emailId = useId()
  const roleId = useId()
  const { toast } = useToast()

  function reset() {
    setNome('')
    setEmail('')
    setRole('operacao')
    setShowError(false)
  }

  function handleClose(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  function handleConfirm() {
    if (nome.trim() === '' || email.trim() === '') {
      setShowError(true)
      return
    }

    onInvite({
      id: crypto.randomUUID(),
      nome: nome.trim(),
      email: email.trim(),
      role,
      ativo: true,
      criadoEm: new Date().toISOString(),
    })
    toast({ title: 'Convite enviado (simulação)', variant: 'success' })
    handleClose(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogCloseButton onOpenChange={handleClose} />
      <DialogHeader>
        <DialogTitle>Convidar administrador</DialogTitle>
        <DialogDescription>
          O convite é uma simulação — nenhum e-mail é enviado de fato.
        </DialogDescription>
      </DialogHeader>

      <Field>
        <Label htmlFor={nomeId}>Nome</Label>
        <Input
          id={nomeId}
          value={nome}
          onChange={(event) => {
            setNome(event.target.value)
            setShowError(false)
          }}
          placeholder="Nome completo"
        />
      </Field>

      <Field>
        <Label htmlFor={emailId}>E-mail</Label>
        <Input
          id={emailId}
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            setShowError(false)
          }}
          placeholder="nome@mybitcoin.com"
        />
      </Field>

      <AdminRoleSelect id={roleId} label="Papel inicial" value={role} onChange={setRole} />

      {showError && <FieldError>Preencha nome e e-mail.</FieldError>}

      <DialogFooter>
        <Button variant="outline" onClick={() => handleClose(false)}>
          Cancelar
        </Button>
        <Button onClick={handleConfirm}>Enviar convite</Button>
      </DialogFooter>
    </Dialog>
  )
}
