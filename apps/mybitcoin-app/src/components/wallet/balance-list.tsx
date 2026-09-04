import { Fragment } from 'react';
import { View } from 'react-native';

import { BalanceCard } from '@/components/wallet/balance-card';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import type { Balance } from '@/types/wallet';

interface BalanceRowsProps {
  balances: Balance[];
}

/**
 * Porte de `components/wallet/balance-list.tsx` (função `BalanceRows`) do
 * `../mybitcoin-front`. Sem hook de query aqui: ainda não existe
 * `wallet.service`/`useWalletBalances` no app (só no front) — quando
 * existir, entra por cima deste componente puro, igual ao front fez.
 *
 * `divide-y` do NativeWind depende de seletor de irmão em CSS, que não
 * existe em RN — por isso os separadores aqui são explícitos entre itens.
 */
export function BalanceRows({ balances }: BalanceRowsProps) {
  return (
    <View className="border-border bg-card rounded-xl border">
      {balances.map((balance, index) => (
        <Fragment key={balance.asset}>
          {index > 0 && <Separator />}
          <BalanceCard balance={balance} />
        </Fragment>
      ))}
    </View>
  );
}

export function BalanceListSkeleton() {
  return (
    <View className="border-border bg-card rounded-xl border">
      {[0, 1, 2].map((key) => (
        <Fragment key={key}>
          {key > 0 && <Separator />}
          <View className="flex-row items-center gap-3 px-4 py-4">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </View>
        </Fragment>
      ))}
    </View>
  );
}

export function BalanceListEmpty() {
  return (
    <Card>
      <CardContent className="items-center gap-1 py-6">
        <Text className="font-sans-medium">Nenhum saldo ainda</Text>
        <Text className="text-muted-foreground text-sm">
          Você ainda não movimentou nenhum ativo.
        </Text>
      </CardContent>
    </Card>
  );
}
