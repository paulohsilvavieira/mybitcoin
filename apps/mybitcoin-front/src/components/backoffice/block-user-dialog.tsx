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
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

export interface BlockUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
}

/**
 * Dialog de bloqueio de usuário — mock de UI, não bloqueia ninguém de
 * verdade. Confirma via `Toast` de sucesso simulado.
 */
export function BlockUserDialog({ open, onOpenChange, userName }: BlockUserDialogProps) {
  const [reason, setReason] = useState('')
  const [showError, setShowError] = useState(false)
  const reasonId = useId()
  const { toast } = useToast()

  function handleClose(next: boolean) {
    if (!next) {
      setReason('')
      setShowError(false)
    }
    onOpenChange(next)
  }

  function handleConfirm() {
    if (reason.trim() === '') {
      setShowError(true)
      return
    }

    toast({ title: 'Usuário suspenso (simulação)', variant: 'success' })
    handleClose(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogCloseButton onOpenChange={handleClose} />
      <DialogHeader>
        <DialogTitle>Bloquear usuário</DialogTitle>
        <DialogDescription>
          {userName} perderá acesso à conta imediatamente — status muda para "Suspenso". Essa é
          uma simulação — nenhuma ação real é executada.
        </DialogDescription>
      </DialogHeader>

      <Field data-invalid={showError}>
        <Label htmlFor={reasonId}>Motivo do bloqueio</Label>
        <textarea
          id={reasonId}
          rows={3}
          value={reason}
          aria-invalid={showError}
          onChange={(event) => {
            setReason(event.target.value)
            setShowError(false)
          }}
          placeholder="Descreva o motivo do bloqueio…"
          className={cn(
            'w-full min-w-0 resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30',
          )}
        />
        {showError && <FieldError>Informe o motivo do bloqueio.</FieldError>}
      </Field>

      <DialogFooter>
        <Button variant="outline" onClick={() => handleClose(false)}>
          Cancelar
        </Button>
        <Button variant="destructive" onClick={handleConfirm}>
          Bloquear usuário
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
