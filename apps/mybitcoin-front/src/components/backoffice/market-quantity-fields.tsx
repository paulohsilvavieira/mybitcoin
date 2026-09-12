import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface MarketQuantityFieldsProps {
  minQuantityId: string
  incrementId: string
  tickSizeId: string
  minQuantity: string
  quantityIncrement: string
  tickSize: string
  onMinQuantityChange: (value: string) => void
  onQuantityIncrementChange: (value: string) => void
  onTickSizeChange: (value: string) => void
}

/** Campos numéricos (texto/decimal) de configuração de um mercado. */
export function MarketQuantityFields({
  minQuantityId,
  incrementId,
  tickSizeId,
  minQuantity,
  quantityIncrement,
  tickSize,
  onMinQuantityChange,
  onQuantityIncrementChange,
  onTickSizeChange,
}: MarketQuantityFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <Field>
        <Label htmlFor={minQuantityId}>Quantidade mínima</Label>
        <Input
          id={minQuantityId}
          inputMode="decimal"
          placeholder="0.00001"
          value={minQuantity}
          onChange={(event) => onMinQuantityChange(event.target.value)}
        />
      </Field>

      <Field>
        <Label htmlFor={incrementId}>Incremento de quantidade</Label>
        <Input
          id={incrementId}
          inputMode="decimal"
          placeholder="0.00001"
          value={quantityIncrement}
          onChange={(event) => onQuantityIncrementChange(event.target.value)}
        />
      </Field>

      <Field>
        <Label htmlFor={tickSizeId}>Tick size</Label>
        <Input
          id={tickSizeId}
          inputMode="decimal"
          placeholder="0.01"
          value={tickSize}
          onChange={(event) => onTickSizeChange(event.target.value)}
        />
      </Field>
    </div>
  )
}
