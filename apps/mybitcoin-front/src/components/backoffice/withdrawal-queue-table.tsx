import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatSatoshi } from '@/lib/utils'
import type { WithdrawalRequest, WithdrawalStatus } from '@/types/backoffice'
import type { ReviewAction } from '@/components/backoffice/withdrawal-review-dialog'
import {
  WITHDRAWAL_STATUS_LABELS,
  WITHDRAWAL_STATUS_VARIANTS,
} from '@/components/backoffice/withdrawal-status'

type StatusFilter = WithdrawalStatus | 'all'

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'PENDING_APPROVAL', label: 'Aguardando aprovação' },
  { value: 'COMPLETED', label: 'Finalizados' },
  { value: 'REJECTED', label: 'Rejeitados/Cancelados' },
]

function matchesFilter(status: WithdrawalStatus, filter: StatusFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'REJECTED') return status === 'REJECTED' || status === 'CANCELLED'
  return status === filter
}

function truncateAddress(address: string): string {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

interface WithdrawalQueueTableProps {
  withdrawals: WithdrawalRequest[]
  onReview: (withdrawal: WithdrawalRequest, action: ReviewAction) => void
  onViewDetails: (withdrawal: WithdrawalRequest) => void
}

/** Fila de aprovação de saques do backoffice — busca/filtro por status (mock de UI). */
export function WithdrawalQueueTable({
  withdrawals,
  onReview,
  onViewDetails,
}: WithdrawalQueueTableProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filtered = useMemo(
    () => withdrawals.filter((withdrawal) => matchesFilter(withdrawal.status, statusFilter)),
    [withdrawals, statusFilter],
  )

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
        <TabsList>
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Taxa</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((withdrawal) => (
              <TableRow key={withdrawal.id}>
                <TableCell className="font-medium">{withdrawal.userNome}</TableCell>
                <TableCell>{withdrawal.asset}</TableCell>
                <TableCell className="tabular-nums">
                  {formatSatoshi(withdrawal.valor, 'btc', withdrawal.asset)}
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {formatSatoshi(withdrawal.feeSatoshi, 'btc', withdrawal.asset)}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {truncateAddress(withdrawal.enderecoDestino)}
                </TableCell>
                <TableCell>
                  <Badge variant={WITHDRAWAL_STATUS_VARIANTS[withdrawal.status]}>
                    {WITHDRAWAL_STATUS_LABELS[withdrawal.status]}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(withdrawal.criadoEm).toLocaleString('pt-BR')}</TableCell>
                <TableCell>
                  {withdrawal.status === 'PENDING_APPROVAL' ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => onReview(withdrawal, 'approve')}>
                        Aprovar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onReview(withdrawal, 'reject')}
                      >
                        Rejeitar
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => onViewDetails(withdrawal)}>
                      Ver detalhes
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum saque encontrado para esse filtro.
          </p>
        )}
      </div>
    </div>
  )
}
