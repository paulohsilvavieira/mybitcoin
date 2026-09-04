import { Fragment } from 'react';
import { View } from 'react-native';

import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { OpenOrder, OrderStatus } from '@/types/trading';

const STATUS_LABEL: Record<OrderStatus, string> = {
  NEW: 'Nova',
  OPEN: 'Aberta',
  PARTIALLY_FILLED: 'Parcial',
  FILLED: 'Executada',
  CANCELLED: 'Cancelada',
  EXPIRED: 'Expirada',
  REJECTED: 'Rejeitada',
};

interface OrderRowProps {
  order: OpenOrder;
}

// RN não tem `<table>` — em vez de colunas (que apertariam demais numa tela
// de celular), cada ordem vira um card de 2 linhas: lado/tipo/status em
// cima, preço/quantidade/executado embaixo.
function OrderRow({ order }: OrderRowProps) {
  return (
    <View className="gap-2 px-4 py-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text
            className={cn(
              'font-sans-semibold',
              order.side === 'BUY' ? 'text-success' : 'text-destructive',
            )}
          >
            {order.side === 'BUY' ? 'Compra' : 'Venda'}
          </Text>
          <Text className="text-muted-foreground text-xs">{order.type}</Text>
        </View>
        <View className="bg-muted rounded-full px-2 py-0.5">
          <Text className="text-muted-foreground text-xs">{STATUS_LABEL[order.status]}</Text>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-x-6 gap-y-1">
        <Text className="font-mono text-sm">
          {Number(order.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Text>
        <Text className="text-muted-foreground font-mono text-sm">{order.quantity}</Text>
        <Text className="text-muted-foreground font-mono text-sm">
          {order.filledQuantity} exec.
        </Text>
      </View>
    </View>
  );
}

interface OpenOrdersProps {
  orders: OpenOrder[];
}

/** Porte de `components/trading/open-orders.tsx` do `../mybitcoin-front`.
 * Estados conforme `docs/bussiness/05-mercados-de-negociacao.md`.
 *
 * `divide-y` do NativeWind depende de seletor de irmão em CSS, que não
 * existe em RN — por isso os separadores aqui são explícitos entre itens. */
export function OpenOrders({ orders }: OpenOrdersProps) {
  if (orders.length === 0) {
    return (
      <View className="items-center gap-1 py-8">
        <Text className="font-sans-medium">Nenhuma ordem aberta</Text>
        <Text className="text-muted-foreground text-sm">
          Suas ordens em aberto aparecem aqui.
        </Text>
      </View>
    );
  }

  return (
    <View>
      {orders.map((order, index) => (
        <Fragment key={order.id}>
          {index > 0 && <Separator />}
          <OrderRow order={order} />
        </Fragment>
      ))}
    </View>
  );
}
