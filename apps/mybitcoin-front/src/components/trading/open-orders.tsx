import { cn } from '@/lib/utils'
import type { OpenOrder, OrderStatus } from '@/types/trading'

const STATUS_LABEL: Record<OrderStatus, string> = {
  NEW: 'Nova',
  OPEN: 'Aberta',
  PARTIALLY_FILLED: 'Parcial',
  FILLED: 'Executada',
  CANCELLED: 'Cancelada',
  EXPIRED: 'Expirada',
  REJECTED: 'Rejeitada',
}

interface OpenOrdersProps {
  orders: OpenOrder[]
}

/** Estados conforme `docs/bussiness/05-mercados-de-negociacao.md`. */
export function OpenOrders({ orders }: OpenOrdersProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 py-8 text-center">
        <p className="font-medium">Nenhuma ordem aberta</p>
        <p className="text-sm text-muted-foreground">
          Suas ordens em aberto aparecem aqui.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="px-6 py-3 font-normal sm:px-8">Lado</th>
            <th className="px-6 py-3 font-normal sm:px-8">Tipo</th>
            <th className="px-6 py-3 font-normal sm:px-8">Preço</th>
            <th className="px-6 py-3 font-normal sm:px-8">Quantidade</th>
            <th className="px-6 py-3 font-normal sm:px-8">Executado</th>
            <th className="px-6 py-3 font-normal sm:px-8">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.map((order) => (
            <tr key={order.id}>
              <td
                className={cn(
                  'px-6 py-4 font-medium sm:px-8',
                  order.side === 'BUY' ? 'text-success' : 'text-destructive',
                )}
              >
                {order.side === 'BUY' ? 'Compra' : 'Venda'}
              </td>
              <td className="px-6 py-4 text-muted-foreground sm:px-8">{order.type}</td>
              <td className="px-6 py-4 font-mono tabular-nums sm:px-8">
                {Number(order.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-6 py-4 font-mono tabular-nums sm:px-8">{order.quantity}</td>
              <td className="px-6 py-4 font-mono tabular-nums text-muted-foreground sm:px-8">
                {order.filledQuantity}
              </td>
              <td className="px-6 py-4 sm:px-8">
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {STATUS_LABEL[order.status]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
