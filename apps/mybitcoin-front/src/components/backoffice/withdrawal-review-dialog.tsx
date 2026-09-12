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
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { cn, formatCurrency, formatSatoshi } from '@/lib/utils'
import type { UserLevel, WithdrawalRequest } from '@/types/backoffice'

export type ReviewAction = 'approve' | 'reject'

const DAILY_LIMIT_BRL: Record<UserLevel, number> = {
  basico: 5_000,
  intermediario: 50_000,
  avancado: 500_000,
}

const USER_LEVEL_LABELS: Record<UserLevel, string> = {
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
}

/**
 * Simplificação de UI: a doc de negócio (09-depositos-e-saques.md, 3.5) define
 * limites diários em BRL, mas os valores mockados aqui são satoshi/cripto sem
 * cotação real. Para dar contexto de decisão ao admin, convertemos o valor em
 * BTC-equivalente usando uma cotação fixa aproximada só para esta comparação
 * visual — não é uma conversão financeira real nem deve ser usada como tal.
 */
const MOCK_BRL_PER_BTC = 350_000
function estimateBrlValue(valorSatoshi: string): number {
  const btc = Number(BigInt(valorSatoshi)) / 100_000_000
  return btc * MOCK_BRL_PER_BTC
}

interface WithdrawalReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  withdrawal: WithdrawalRequest | null
  action: ReviewAction | null
  onConfirm: (withdrawal: WithdrawalRequest, action: ReviewAction, reason: string) => void
}

/** Dialog de revisão de saque (aprovar/rejeitar) — mock de UI, nenhum saque é movido de verdade. */
export function WithdrawalReviewDialog({
  open,
  onOpenChange,
  withdrawal,
  action,
  onConfirm,
}: WithdrawalReviewDialogProps) {
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

  if (!withdrawal || !action) return null

  const isReject = action === 'reject'
  const dailyLimit = DAILY_LIMIT_BRL[withdrawal.nivelUsuario]
  const estimatedBrl = estimateBrlValue(withdrawal.valor)
  const nearLimit = estimatedBrl >= dailyLimit * 0.8

  function handleConfirm() {
    if (isReject && reason.trim() === '') {
      setShowError(true)
      return
    }

    toast({
      title: isReject ? 'Saque rejeitado (simulação)' : 'Saque aprovado (simulação)',
      variant: isReject ? 'destructive' : 'success',
    })
    onConfirm(withdrawal!, action!, reason)
    handleClose(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogCloseButton onOpenChange={handleClose} />
      <DialogHeader>
        <DialogTitle>{isReject ? 'Rejeitar saque' : 'Aprovar saque'}</DialogTitle>
        <DialogDescription>Solicitação de {withdrawal.userNome}.</DialogDescription>
      </DialogHeader>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
        <dt className="text-muted-foreground">Valor</dt>
        <dd className="text-right tabular-nums">
          {formatSatoshi(withdrawal.valor, 'btc', withdrawal.asset)}
        </dd>
        <dt className="text-muted-foreground">Taxa</dt>
        <dd className="text-right tabular-nums">
          {formatSatoshi(withdrawal.feeSatoshi, 'btc', withdrawal.asset)}
        </dd>
        <dt className="text-muted-foreground">Destino</dt>
        <dd className="truncate text-right font-mono text-xs">{withdrawal.enderecoDestino}</dd>
        <dt className="text-muted-foreground">Nível da conta</dt>
        <dd className="text-right">{USER_LEVEL_LABELS[withdrawal.nivelUsuario]}</dd>
        <dt className="text-muted-foreground">Limite diário do nível</dt>
        <dd className="text-right">{formatCurrency(dailyLimit)}</dd>
      </dl>

      {nearLimit && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Valor próximo ou acima do limite diário</AlertTitle>
          <AlertDescription>
            O valor estimado (~{formatCurrency(estimatedBrl)}) está próximo ou acima do limite
            diário de {formatCurrency(dailyLimit)} do nível {USER_LEVEL_LABELS[withdrawal.nivelUsuario]}.
            Avalie com atenção antes de aprovar.
          </AlertDescription>
        </Alert>
      )}

      {isReject && (
        <Field data-invalid={showError}>
          <Label htmlFor={reasonId}>Motivo da rejeição</Label>
          <textarea
            id={reasonId}
            rows={3}
            value={reason}
            aria-invalid={showError && reason.trim() === ''}
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
        <Button variant={isReject ? 'destructive' : 'default'} onClick={handleConfirm}>
          {isReject ? 'Confirmar rejeição' : 'Confirmar aprovação'}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
