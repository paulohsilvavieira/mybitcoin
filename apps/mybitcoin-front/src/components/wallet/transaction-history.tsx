import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatSatoshi } from '@/lib/utils'
import type { Transaction, TransactionStatus, TransactionType } from '@/types/wallet'

const TYPE_LABEL: Record<TransactionType, string> = {
  DEPOSIT: 'Depósito',
  WITHDRAWAL: 'Saque',
}

const STATUS_VARIANT: Record<TransactionStatus, 'success' | 'default' | 'destructive'> = {
  CONFIRMED: 'success',
  PENDING: 'default',
  FAILED: 'destructive',
}

const STATUS_LABEL: Record<TransactionStatus, string> = {
  CONFIRMED: 'Confirmado',
  PENDING: 'Pendente',
  FAILED: 'Falhou',
}

function truncateHash(hash: string): string {
  if (hash.length <= 14) return hash
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`
}

function TransactionHistorySkeleton() {
  return (
    <div className="flex flex-col gap-2 p-4" aria-hidden="true">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

function TransactionHistoryEmpty() {
  return (
    <div className="flex flex-col items-center gap-1 py-8 text-center">
      <p className="font-medium">Nenhuma movimentação ainda</p>
      <p className="text-sm text-muted-foreground">
        Seus depósitos e saques on-chain aparecem aqui.
      </p>
    </div>
  )
}

function TransactionHistoryError() {
  return (
    <div className="flex flex-col items-center gap-1 py-8 text-center">
      <p className="font-medium text-destructive">Não foi possível carregar o histórico</p>
      <p className="text-sm text-muted-foreground">Tente novamente em alguns instantes.</p>
    </div>
  )
}

export interface TransactionHistoryProps {
  transactions: Transaction[]
  isLoading?: boolean
  isError?: boolean
}

/** Tabela de depósitos/saques on-chain — trata loading/error/empty (UI-001). */
export function TransactionHistory({ transactions, isLoading, isError }: TransactionHistoryProps) {
  if (isLoading) {
    return <TransactionHistorySkeleton />
  }

  if (isError) {
    return <TransactionHistoryError />
  }

  if (transactions.length === 0) {
    return <TransactionHistoryEmpty />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Hash</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell className="text-muted-foreground">
              {new Date(tx.createdAt).toLocaleDateString('pt-BR')}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{TYPE_LABEL[tx.type]}</Badge>
            </TableCell>
            <TableCell className="font-mono tabular-nums">{formatSatoshi(tx.amountSatoshi)}</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[tx.status]}>{STATUS_LABEL[tx.status]}</Badge>
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {truncateHash(tx.txHash)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
