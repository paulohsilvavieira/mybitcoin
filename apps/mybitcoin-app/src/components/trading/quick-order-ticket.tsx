import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { cn, formatCurrency } from '@/lib/utils';

type Side = 'buy' | 'sell';

/** Mock — a API ainda não expõe taxa maker/taker real (ver
 * `docs/bussiness/08-trades-maker-taker-taxas.md`), então é fixa aqui. */
const FEE_PERCENT = 0.001;

interface OrderSummary {
  subtotal: number;
  fee: number;
  total: number;
}

function computeSummary(quantity: string, price: string): OrderSummary | null {
  const q = Number(quantity.replace(',', '.'));
  const p = Number(price.replace(',', '.'));
  if (!Number.isFinite(q) || !Number.isFinite(p) || q <= 0 || p <= 0) {
    return null;
  }
  const subtotal = q * p;
  const fee = subtotal * FEE_PERCENT;
  return { subtotal, fee, total: subtotal + fee };
}

interface QuickOrderTicketProps {
  pair: string;
  /** Preço de referência (última cotação) usado só pra calcular o resumo — não é um campo editável aqui. */
  price: string;
  onConfirm?: (side: Side, quantity: string) => void;
}

/**
 * Ticket de ordem simplificado — porte de
 * `components/trading/quick-order-ticket.tsx` do `../mybitcoin-front`.
 * Pensado pra abrir dentro de um `Modal`/bottom-sheet a partir de um
 * `CoinCard`/`MarketTable`, por isso não tem preço editável (usa a última
 * cotação) — diferente do `OrderForm` completo da tela de negociação.
 * Prévia — `onConfirm` não envia nada de verdade sem endpoint.
 */
export function QuickOrderTicket({ pair, price, onConfirm }: QuickOrderTicketProps) {
  const [side, setSide] = useState<Side>('buy');
  const [quantity, setQuantity] = useState('');
  const asset = pair.split('/')[0];
  const summary = computeSummary(quantity, price);

  return (
    <View className="gap-4 rounded-xl border border-border bg-card p-4">
      <Tabs value={side} onValueChange={(value) => setSide(value as Side)}>
        <TabsList className="w-full">
          <TabsTrigger value="buy" className="flex-1 items-center">
            Comprar
          </TabsTrigger>
          <TabsTrigger value="sell" className="flex-1 items-center">
            Vender
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <View className="gap-2">
        <Label>Quantidade ({asset})</Label>
        <Input
          inputMode="decimal"
          placeholder="0,00000000"
          value={quantity}
          onChangeText={setQuantity}
          accessibilityLabel={`Quantidade em ${asset}`}
        />
      </View>

      <View className="gap-1 rounded-lg bg-muted/40 p-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-muted-foreground">Subtotal</Text>
          <Text className="font-mono text-sm">{summary ? formatCurrency(summary.subtotal) : '—'}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-muted-foreground">Taxa (0,10%)</Text>
          <Text className="font-mono text-sm">{summary ? formatCurrency(summary.fee) : '—'}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="font-sans-medium text-sm">Total</Text>
          <Text className="font-mono text-sm font-medium">{summary ? formatCurrency(summary.total) : '—'}</Text>
        </View>
      </View>

      <Button
        size="lg"
        disabled={!summary}
        className={cn('h-14 w-full', side === 'buy' ? 'bg-success' : 'bg-destructive')}
        onPress={() => summary && onConfirm?.(side, quantity)}
      >
        <Text className="text-lg text-white">{side === 'buy' ? 'Confirmar compra' : 'Confirmar venda'}</Text>
      </Button>

      <Text className="text-center text-xs text-muted-foreground">Prévia — nenhuma ordem real é enviada.</Text>
    </View>
  );
}
