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
import { Field } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { ACCOUNT_LEVEL_LABELS, ACCOUNT_LEVELS } from '@/lib/account-level'
import { cn } from '@/lib/utils'
import type { AccountLevel } from '@/types/backoffice'

const selectClassName = cn(
  'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30',
)

export interface AccountLevelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentLevel: AccountLevel
  userName: string
}

/** Dialog de alteração de nível de conta — mock de UI, nenhuma mudança real é aplicada. */
export function AccountLevelDialog({
  open,
  onOpenChange,
  currentLevel,
  userName,
}: AccountLevelDialogProps) {
  const [level, setLevel] = useState<AccountLevel>(currentLevel)
  const levelId = useId()
  const { toast } = useToast()

  function handleClose(next: boolean) {
    if (!next) setLevel(currentLevel)
    onOpenChange(next)
  }

  function handleConfirm() {
    toast({
      title: `Nível de ${userName} alterado para ${ACCOUNT_LEVEL_LABELS[level]} (simulação)`,
      variant: 'success',
    })
    handleClose(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogCloseButton onOpenChange={handleClose} />
      <DialogHeader>
        <DialogTitle>Alterar nível de conta</DialogTitle>
        <DialogDescription>
          Novo nível define os limites diários de depósito e saque. Essa é uma simulação —
          nenhuma mudança real é aplicada.
        </DialogDescription>
      </DialogHeader>

      <Field>
        <Label htmlFor={levelId}>Nível</Label>
        <select
          id={levelId}
          className={selectClassName}
          value={level}
          onChange={(event) => setLevel(event.target.value as AccountLevel)}
        >
          {ACCOUNT_LEVELS.map((option) => (
            <option key={option} value={option}>
              {ACCOUNT_LEVEL_LABELS[option]}
            </option>
          ))}
        </select>
      </Field>

      <DialogFooter>
        <Button variant="outline" onClick={() => handleClose(false)}>
          Cancelar
        </Button>
        <Button onClick={handleConfirm}>Confirmar</Button>
      </DialogFooter>
    </Dialog>
  )
}
