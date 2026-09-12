import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn, formatCurrency } from '@/lib/utils'

type Side = 'buy' | 'sell'

const FEE_RATE = 0.001 // 0,1% — mesma taxa taker ilustrativa do order-form.

interface QuoteSummary {
  fee: string | null
  total: string | null
}

function computeQuote(quantity: string, price: number): QuoteSummary {
  const q = Number(quantity.replace(',', '.'))
  if (!Number.isFinite(q) || q <= 0) {
    return { fee: null, total: null }
  }
  const subtotal = q * price
  const fee = subtotal * FEE_RATE
  return { fee: formatCurrency(fee), total: formatCurrency(subtotal + fee) }
}

export interface QuickOrderTicketProps {
  pair: string
  /** Preço de referência em BRL para o cálculo de resumo — mock, sem
   * integração com o order book real ainda. */
  referencePrice: number
}

/**
 * Ticket de compra/venda simplificado — diferente do `OrderForm` avançado
 * (`trading/order-form.tsx`): sem preço editável, sem atalhos de percentual,
 * só quantidade + resumo de taxa/total. Prévia visual, sem envio real.
 */
export function QuickOrderTicket({ pair, referencePrice }: QuickOrderTicketProps) {
  const [side, setSide] = useState<Side>('buy')
  const [quantity, setQuantity] = useState('')
  const [error, setError] = useState<string | null>(null)
  const asset = pair.split('/')[0]
  const { fee, total } = computeQuote(quantity, referencePrice)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!(Number(quantity.replace(',', '.')) > 0)) {
      setError('Informe uma quantidade válida')
      return
    }
    setError(null)
    // Prévia — sem endpoint real pra enviar a ordem.
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
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

      <form onSubmit={handleSubmit} noValidate className="mt-4">
        <FieldGroup>
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="quick-order-quantity">Quantidade ({asset})</FieldLabel>
            <Input
              id="quick-order-quantity"
              inputMode="decimal"
              placeholder="0,00000000"
              value={quantity}
              aria-invalid={!!error}
              onChange={(event) => setQuantity(event.target.value)}
            />
            <FieldError>{error}</FieldError>
          </Field>

          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Taxa estimada</span>
              <span className="font-mono tabular-nums">{fee ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between font-medium">
              <span>Total estimado</span>
              <span className="font-mono tabular-nums">{total ?? '—'}</span>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className={cn(
              'h-11 w-full',
              side === 'buy'
                ? 'bg-success text-success-foreground hover:bg-success/90'
                : 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
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
