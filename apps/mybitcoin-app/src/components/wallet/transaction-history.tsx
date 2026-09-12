import { View } from 'react-native';

import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Text } from '@/components/ui/text';
import { formatSatoshi } from '@/lib/utils';
import type { Transaction, TransactionStatus, TransactionType } from '@/types/wallet';

const TYPE_LABEL: Record<TransactionType, string> = {
  DEPOSIT: 'Depósito',
  WITHDRAWAL: 'Saque',
};

const STATUS_VARIANT: Record<TransactionStatus, BadgeVariant> = {
  CONFIRMED: 'success',
  PENDING: 'default',
  FAILED: 'destructive',
};

const STATUS_LABEL: Record<TransactionStatus, string> = {
  CONFIRMED: 'Confirmado',
  PENDING: 'Pendente',
  FAILED: 'Falhou',
};

function truncateHash(hash: string): string {
  if (hash.length <= 14) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

function TransactionHistorySkeleton() {
  return (
    <View className="gap-2 p-4" accessible={false}>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </View>
  );
}

function TransactionHistoryEmpty() {
  return (
    <View className="items-center gap-1 py-8">
      <Text className="font-sans-medium">Nenhuma movimentação ainda</Text>
      <Text className="text-center text-sm text-muted-foreground">
        Seus depósitos e saques on-chain aparecem aqui.
      </Text>
    </View>
  );
}

function TransactionHistoryError() {
  return (
    <View className="items-center gap-1 py-8">
      <Text className="font-sans-medium text-destructive">Não foi possível carregar o histórico</Text>
      <Text className="text-center text-sm text-muted-foreground">Tente novamente em alguns instantes.</Text>
    </View>
  );
}

export interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading?: boolean;
  isError?: boolean;
}

/**
 * Histórico de depósitos/saques — porte de
 * `components/wallet/transaction-history.tsx` do `../mybitcoin-front`,
 * usando as primitivas de `ui/table.tsx` (RN não tem `<table>`). Trata
 * loading/error/empty (UI-001).
 */
export function TransactionHistory({ transactions, isLoading, isError }: TransactionHistoryProps) {
  if (isLoading) {
    return <TransactionHistorySkeleton />;
  }

  if (isError) {
    return <TransactionHistoryError />;
  }

  if (transactions.length === 0) {
    return <TransactionHistoryEmpty />;
  }

  return (
    <Table>
      <TableHeader>
        <TableHead>Data</TableHead>
        <TableHead>Tipo</TableHead>
        <TableHead>Valor</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Hash</TableHead>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell>
              <Text className="text-sm text-muted-foreground">
                {new Date(tx.createdAt).toLocaleDateString('pt-BR')}
              </Text>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{TYPE_LABEL[tx.type]}</Badge>
            </TableCell>
            <TableCell>
              <Text className="font-mono text-sm">{formatSatoshi(tx.amountSatoshi)}</Text>
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[tx.status]}>{STATUS_LABEL[tx.status]}</Badge>
            </TableCell>
            <TableCell>
              <Text className="font-mono text-xs text-muted-foreground">{truncateHash(tx.txHash)}</Text>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
