import { useId, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { cn } from '@/lib/utils'

export interface RefundDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
}

/**
 * Dialog de estorno manual — mock de UI, nenhum valor é movido de verdade.
 * Valor de estorno é `string` (BTC) — nunca `number` (FIN-001).
 */
export function RefundDialog({ open, onOpenChange, userName }: RefundDialogProps) {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [showError, setShowError] = useState(false)
  const amountId = useId()
  const reasonId = useId()
  const { toast } = useToast()

  function handleClose(next: boolean) {
    if (!next) {
      setAmount('')
      setReason('')
      setShowError(false)
    }
    onOpenChange(next)
  }

  function handleConfirm() {
    if (amount.trim() === '' || reason.trim() === '') {
      setShowError(true)
      return
    }

    toast({ title: 'Estorno realizado (simulação)', variant: 'success' })
    handleClose(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogCloseButton onOpenChange={handleClose} />
      <DialogHeader>
        <DialogTitle>Estornar valor</DialogTitle>
        <DialogDescription>Crédito manual de saldo para {userName}.</DialogDescription>
      </DialogHeader>

      <Field data-invalid={showError}>
        <Label htmlFor={amountId}>Valor (BTC)</Label>
        <Input
          id={amountId}
          inputMode="decimal"
          placeholder="0.00000000"
          value={amount}
          aria-invalid={showError && amount.trim() === ''}
          onChange={(event) => {
            setAmount(event.target.value)
            setShowError(false)
          }}
        />
      </Field>

      <Field data-invalid={showError}>
        <Label htmlFor={reasonId}>Motivo do estorno</Label>
        <textarea
          id={reasonId}
          rows={3}
          value={reason}
          aria-invalid={showError && reason.trim() === ''}
          onChange={(event) => {
            setReason(event.target.value)
            setShowError(false)
          }}
          placeholder="Descreva o motivo do estorno…"
          className={cn(
            'w-full min-w-0 resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30',
          )}
        />
        {showError && <FieldError>Preencha o valor e o motivo do estorno.</FieldError>}
      </Field>

      <Alert variant="destructive">
        <AlertTriangle />
        <AlertTitle>Ação irreversível</AlertTitle>
        <AlertDescription>
          Estornos manuais alteram o saldo do usuário imediatamente e não podem ser desfeitos.
          Confirme apenas após validar a solicitação.
        </AlertDescription>
      </Alert>

      <DialogFooter>
        <Button variant="outline" onClick={() => handleClose(false)}>
          Cancelar
        </Button>
        <Button variant="destructive" onClick={handleConfirm}>
          Confirmar estorno
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
