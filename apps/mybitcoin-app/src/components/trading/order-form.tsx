import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { cn, formatCurrency } from '@/lib/utils';

const orderFormSchema = z.object({
  price: z.string().refine((v) => Number(v.replace(',', '.')) > 0, 'Informe um preço válido'),
  quantity: z
    .string()
    .refine((v) => Number(v.replace(',', '.')) > 0, 'Informe uma quantidade válida'),
});

type OrderFormData = z.infer<typeof orderFormSchema>;
type Side = 'buy' | 'sell';

const PERCENT_OPTIONS = [25, 50, 75, 100] as const;

function computeTotal(price: string, quantity: string): string | null {
  const p = Number(price.replace(',', '.'));
  const q = Number(quantity.replace(',', '.'));
  if (!Number.isFinite(p) || !Number.isFinite(q) || p <= 0 || q <= 0) {
    return null;
  }
  return formatCurrency(p * q);
}

/**
 * Quantidade correspondente a uma fração do saldo disponível. Compra parte
 * do saldo em moeda de cotação (precisa de preço pra converter em
 * quantidade do ativo); venda parte direto do saldo do ativo.
 */
function computeQuantityFromPercent(
  side: Side,
  percent: number,
  price: string,
  availableBase: string,
  availableQuote: string,
): string | null {
  if (side === 'sell') {
    const base = Number(availableBase);
    return ((base * percent) / 100).toFixed(8);
  }

  const p = Number(price.replace(',', '.'));
  if (!Number.isFinite(p) || p <= 0) {
    return null;
  }
  const quote = Number(availableQuote);
  return (((quote * percent) / 100) / p).toFixed(8);
}

interface OrderFormProps {
  pair: string;
  /** Saldo disponível do ativo base (ex. BTC) — mock, sem integração com a
   * carteira real ainda. */
  availableBase: string;
  /** Saldo disponível na moeda de cotação (ex. BRL) — mock, mesmo motivo. */
  availableQuote: string;
}

/**
 * Porte de `components/trading/order-form.tsx` do `../mybitcoin-front`.
 * Prévia visual — a API ainda não tem endpoint de order book, então o
 * submit não envia nada de verdade. Sem primitiva de Tabs no mobile ainda,
 * então o alterna Comprar/Vender é um par de botões (segmented control).
 */
export function OrderForm({ pair, availableBase, availableQuote }: OrderFormProps) {
  const [side, setSide] = useState<Side>('buy');
  const asset = pair.split('/')[0];

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: { price: '', quantity: '' },
  });

  const price = watch('price');
  const total = computeTotal(price, watch('quantity'));
  const availableLabel =
    side === 'buy'
      ? `Disponível: ${formatCurrency(Number(availableQuote))}`
      : `Disponível: ${availableBase} ${asset}`;
  const canUsePercent = side === 'sell' || Number(price.replace(',', '.')) > 0;

  function handlePercentClick(percent: number) {
    const quantity = computeQuantityFromPercent(side, percent, price, availableBase, availableQuote);
    if (quantity !== null) {
      setValue('quantity', quantity, { shouldValidate: true });
    }
  }

  function onSubmit() {
    // Prévia — sem endpoint real pra enviar a ordem.
  }

  return (
    <View className="border-border bg-card gap-4 rounded-xl border p-4">
      <View className="bg-muted flex-row gap-1 rounded-lg p-1">
        <Button
          variant={side === 'buy' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1"
          onPress={() => setSide('buy')}
        >
          <Text className={side === 'buy' ? 'text-primary-foreground' : undefined}>Comprar</Text>
        </Button>
        <Button
          variant={side === 'sell' ? 'default' : 'ghost'}
          size="sm"
          className={cn('flex-1', side === 'sell' && 'bg-destructive')}
          onPress={() => setSide('sell')}
        >
          <Text className={side === 'sell' ? 'text-destructive-foreground' : undefined}>
            Vender
          </Text>
        </Button>
      </View>

      <Text className="text-muted-foreground text-xs">{availableLabel}</Text>

      <View className="gap-2">
        <Label>Preço (R$)</Label>
        <Controller
          control={control}
          name="price"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              inputMode="decimal"
              placeholder="0,00"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.price ? <Text className="text-destructive text-sm">{errors.price.message}</Text> : null}
      </View>

      <View className="gap-2">
        <Label>Quantidade ({asset})</Label>
        <Controller
          control={control}
          name="quantity"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              inputMode="decimal"
              placeholder="0,00000000"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.quantity ? (
          <Text className="text-destructive text-sm">{errors.quantity.message}</Text>
        ) : null}

        <View className="flex-row gap-2">
          {PERCENT_OPTIONS.map((percent) => (
            <Button
              key={percent}
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={!canUsePercent}
              onPress={() => handlePercentClick(percent)}
            >
              <Text>{percent}%</Text>
            </Button>
          ))}
        </View>
        {!canUsePercent && (
          <Text className="text-muted-foreground text-xs">
            Informe o preço para usar os atalhos de porcentagem.
          </Text>
        )}
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-muted-foreground text-sm">Total estimado</Text>
        <Text className="font-mono text-sm">{total ?? '—'}</Text>
      </View>

      <Button
        size="lg"
        className={cn('h-14 w-full', side === 'sell' && 'bg-destructive')}
        onPress={handleSubmit(onSubmit)}
      >
        <Text className="text-lg text-white">
          {side === 'buy' ? 'Comprar' : 'Vender'} {asset}
        </Text>
      </Button>

      <Text className="text-muted-foreground text-center text-xs">
        Prévia — nenhuma ordem real é enviada.
      </Text>
    </View>
  );
}
