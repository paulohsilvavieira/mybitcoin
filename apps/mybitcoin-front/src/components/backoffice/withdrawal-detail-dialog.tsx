import {
  Dialog,
  DialogCloseButton,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatSatoshi } from '@/lib/utils'
import type { WithdrawalRequest } from '@/types/backoffice'
import { WITHDRAWAL_STATUS_LABELS } from '@/components/backoffice/withdrawal-status'

interface DetailRowProps {
  label: string
  children: React.ReactNode
}

function DetailRow({ label, children }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  )
}

interface WithdrawalDetailDialogProps {
  withdrawal: WithdrawalRequest | null
  onOpenChange: (open: boolean) => void
}

/** Detalhe somente-leitura de um saque já revisado (finalizado, processando,
 * rejeitado ou cancelado) — mock de UI, sem ação disponível aqui. */
export function WithdrawalDetailDialog({ withdrawal, onOpenChange }: WithdrawalDetailDialogProps) {
  return (
    <Dialog open={withdrawal !== null} onOpenChange={onOpenChange}>
      <DialogCloseButton onOpenChange={onOpenChange} />
      {withdrawal && (
        <>
          <DialogHeader>
            <DialogTitle>Detalhes do saque</DialogTitle>
            <DialogDescription>Solicitação de {withdrawal.userNome}.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <DetailRow label="Status">{WITHDRAWAL_STATUS_LABELS[withdrawal.status]}</DetailRow>
            <DetailRow label="Valor">
              {formatSatoshi(withdrawal.valor, 'btc', withdrawal.asset)}
            </DetailRow>
            <DetailRow label="Taxa">
              {formatSatoshi(withdrawal.feeSatoshi, 'btc', withdrawal.asset)}
            </DetailRow>
            <DetailRow label="Endereço de destino">
              <span className="font-mono text-xs">{withdrawal.enderecoDestino}</span>
            </DetailRow>
            <DetailRow label="Nível da conta">{withdrawal.nivelUsuario}</DetailRow>
            <DetailRow label="Criado em">
              {new Date(withdrawal.criadoEm).toLocaleString('pt-BR')}
            </DetailRow>
            {withdrawal.revisadoPor && (
              <DetailRow label="Revisado por">{withdrawal.revisadoPor}</DetailRow>
            )}
            {withdrawal.revisadoEm && (
              <DetailRow label="Revisado em">
                {new Date(withdrawal.revisadoEm).toLocaleString('pt-BR')}
              </DetailRow>
            )}
          </div>

          {withdrawal.motivoRevisao && (
            <div className="flex flex-col gap-1 rounded-lg bg-muted p-3">
              <span className="text-xs font-medium text-muted-foreground">Motivo</span>
              <p className="text-sm">{withdrawal.motivoRevisao}</p>
            </div>
          )}
        </>
      )}
    </Dialog>
  )
}
