import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn, formatCurrency } from '@/lib/utils'

const orderFormSchema = z.object({
  price: z.string().refine((v) => Number(v.replace(',', '.')) > 0, 'Informe um preço válido'),
  quantity: z.string().refine((v) => Number(v.replace(',', '.')) > 0, 'Informe uma quantidade válida'),
})

type OrderFormData = z.infer<typeof orderFormSchema>
type Side = 'buy' | 'sell'

const PERCENT_OPTIONS = [25, 50, 75, 100] as const

function computeTotal(price: string, quantity: string): string | null {
  const p = Number(price.replace(',', '.'))
  const q = Number(quantity.replace(',', '.'))
  if (!Number.isFinite(p) || !Number.isFinite(q) || p <= 0 || q <= 0) {
    return null
  }
  return formatCurrency(p * q)
}

/**
 * Quantidade correspondente a uma fração do saldo disponível.
 * Compra parte do saldo em moeda de cotação (precisa de preço pra converter
 * em quantidade do ativo); venda parte direto do saldo do ativo.
 */
function computeQuantityFromPercent(
  side: Side,
  percent: number,
  price: string,
  availableBase: string,
  availableQuote: string,
): string | null {
  if (side === 'sell') {
    const base = Number(availableBase)
    return ((base * percent) / 100).toFixed(8)
  }

  const p = Number(price.replace(',', '.'))
  if (!Number.isFinite(p) || p <= 0) {
    return null
  }
  const quote = Number(availableQuote)
  return (((quote * percent) / 100) / p).toFixed(8)
}

interface OrderFormProps {
  pair: string
  /** Saldo disponível do ativo base (ex. BTC) — mock, sem integração com a
   * carteira real ainda. Usado só pelos botões de porcentagem na venda. */
  availableBase: string
  /** Saldo disponível na moeda de cotação (ex. BRL) — mock, mesmo motivo. */
  availableQuote: string
}

/**
 * Formulário de compra/venda — prévia visual. A API ainda não tem endpoint
 * de order book (`docs/bussiness/06-order-book.md` é só o domínio, sem
 * implementação), então o submit não envia nada de verdade. O saldo
 * disponível também é mocado: quando existir integração real, deve vir de
 * `useWalletBalances()` e a conversão satoshi → quantidade decimal deve
 * usar BigInt (FIN-001), não `Number()` como aqui.
 */
export function OrderForm({ pair, availableBase, availableQuote }: OrderFormProps) {
  const [side, setSide] = useState<Side>('buy')
  const asset = pair.split('/')[0]

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: { price: '', quantity: '' },
  })

  const price = watch('price')
  const total = computeTotal(price, watch('quantity'))
  const availableLabel =
    side === 'buy'
      ? `Disponível: ${formatCurrency(Number(availableQuote))}`
      : `Disponível: ${availableBase} ${asset}`

  function handlePercentClick(percent: number) {
    const quantity = computeQuantityFromPercent(side, percent, price, availableBase, availableQuote)
    if (quantity !== null) {
      setValue('quantity', quantity, { shouldValidate: true })
    }
  }

  function onSubmit() {
    // Prévia — sem endpoint real pra enviar a ordem.
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
      <Tabs value={side} onValueChange={(value) => setSide(value as Side)}>
        <TabsList className="w-full">
          <TabsTrigger value="buy" className="flex-1">
            Comprar
          </TabsTrigger>
          <TabsTrigger value="sell" className="flex-1">
            Vender
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <p className="mt-4 text-xs text-muted-foreground">{availableLabel}</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4">
        <FieldGroup>
          <Field data-invalid={!!errors.price}>
            <FieldLabel htmlFor="price">Preço (R$)</FieldLabel>
            <Input
              id="price"
              inputMode="decimal"
              placeholder="0,00"
              aria-invalid={!!errors.price}
              {...register('price')}
            />
            <FieldError errors={errors.price ? [errors.price] : undefined} />
          </Field>

          <Field data-invalid={!!errors.quantity}>
            <FieldLabel htmlFor="quantity">Quantidade ({asset})</FieldLabel>
            <Input
              id="quantity"
              inputMode="decimal"
              placeholder="0,00000000"
              aria-invalid={!!errors.quantity}
              {...register('quantity')}
            />
            <FieldError errors={errors.quantity ? [errors.quantity] : undefined} />

            <div className="grid grid-cols-4 gap-2">
              {PERCENT_OPTIONS.map((percent) => (
                <Button
                  key={percent}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePercentClick(percent)}
                >
                  {percent}%
                </Button>
              ))}
            </div>
            {side === 'buy' && !(Number(price.replace(',', '.')) > 0) && (
              <p className="text-xs text-muted-foreground">
                Informe o preço para usar os atalhos de porcentagem.
              </p>
            )}
          </Field>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total estimado</span>
            <span className="font-mono tabular-nums">{total ?? '—'}</span>
          </div>

          <Button
            type="submit"
            size="lg"
            className={cn(
              'h-11 w-full',
              side === 'sell' &&
                'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            )}
          >
            {side === 'buy' ? 'Comprar' : 'Vender'} {asset}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Prévia — nenhuma ordem real é enviada.
          </p>
        </FieldGroup>
      </form>
    </div>
  )
}
