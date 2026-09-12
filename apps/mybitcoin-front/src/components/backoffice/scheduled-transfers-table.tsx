import { Button } from '@/components/ui/button'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatSatoshi } from '@/lib/utils'
import type { ScheduledTransfer, TransferStatus } from '@/types/backoffice'

const STATUS_LABELS: Record<TransferStatus, string> = {
  agendada: 'Agendada',
  processando: 'Processando',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
}

const STATUS_VARIANTS: Record<TransferStatus, BadgeVariant> = {
  agendada: 'outline',
  processando: 'default',
  concluida: 'success',
  cancelada: 'destructive',
}

interface ScheduledTransfersTableProps {
  transfers: ScheduledTransfer[]
  onCancel: (id: string) => void
}

/** Tabela de transferências agendadas cold↔hot (mock de UI). */
export function ScheduledTransfersTable({ transfers, onCancel }: ScheduledTransfersTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ativo</TableHead>
            <TableHead>Origem → Destino</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Agendado para</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transfers.map((transfer) => (
            <TableRow key={transfer.id}>
              <TableCell className="font-medium">{transfer.asset}</TableCell>
              <TableCell className="capitalize">
                {transfer.origem} → {transfer.destino}
              </TableCell>
              <TableCell className="tabular-nums">
                {formatSatoshi(transfer.valor, 'btc', transfer.asset)}
              </TableCell>
              <TableCell>{new Date(transfer.agendadoPara).toLocaleString('pt-BR')}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANTS[transfer.status]}>
                  {STATUS_LABELS[transfer.status]}
                </Badge>
              </TableCell>
              <TableCell>
                {transfer.status === 'agendada' ? (
                  <Button variant="outline" size="sm" onClick={() => onCancel(transfer.id)}>
                    Cancelar
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {transfers.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhuma transferência agendada.
        </p>
      )}
    </div>
  )
}
