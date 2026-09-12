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

export type KycReviewAction = 'approve' | 'reject'

export interface KycReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: KycReviewAction
  userName: string
  /** Chamado ao confirmar a decisão, antes de fechar o dialog — usado para registrar no histórico local. */
  onConfirm?: (reason?: string) => void
}

const DIALOG_COPY: Record<KycReviewAction, { title: string; description: string; toast: string }> = {
  approve: {
    title: 'Aprovar KYC',
    description: 'confirma que os documentos e dados enviados são válidos.',
    toast: 'KYC aprovado (simulação)',
  },
  reject: {
    title: 'Rejeitar KYC',
    description: 'os dados enviados serão marcados como rejeitados e o usuário poderá reenviar.',
    toast: 'KYC rejeitado (simulação)',
  },
}

/**
 * Dialog de confirmação para aprovar/rejeitar o KYC — mock de UI, nenhuma
 * chamada real é feita. Motivo é obrigatório só na rejeição.
 */
export function KycReviewDialog({
  open,
  onOpenChange,
  action,
  userName,
  onConfirm,
}: KycReviewDialogProps) {
  const [reason, setReason] = useState('')
  const [showError, setShowError] = useState(false)
  const reasonId = useId()
  const { toast } = useToast()
  const copy = DIALOG_COPY[action]

  function handleClose(next: boolean) {
    if (!next) {
      setReason('')
      setShowError(false)
    }
    onOpenChange(next)
  }

  function handleConfirm() {
    if (action === 'reject' && reason.trim() === '') {
      setShowError(true)
      return
    }

    onConfirm?.(action === 'reject' ? reason.trim() : undefined)
    toast({ title: copy.toast, variant: action === 'approve' ? 'success' : 'destructive' })
    handleClose(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogCloseButton onOpenChange={handleClose} />
      <DialogHeader>
        <DialogTitle>{copy.title}</DialogTitle>
        <DialogDescription>
          {userName}: {copy.description} Essa é uma simulação — nenhuma ação real é executada.
        </DialogDescription>
      </DialogHeader>

      {action === 'reject' && (
        <Field data-invalid={showError}>
          <Label htmlFor={reasonId}>Motivo da rejeição</Label>
          <textarea
            id={reasonId}
            rows={3}
            value={reason}
            aria-invalid={showError}
            onChange={(event) => {
              setReason(event.target.value)
              setShowError(false)
            }}
            placeholder="Descreva o motivo da rejeição…"
            className={cn(
              'w-full min-w-0 resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30',
            )}
          />
          {showError && <FieldError>Informe o motivo da rejeição.</FieldError>}
        </Field>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={() => handleClose(false)}>
          Cancelar
        </Button>
        <Button variant={action === 'approve' ? 'default' : 'destructive'} onClick={handleConfirm}>
          {copy.title}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
