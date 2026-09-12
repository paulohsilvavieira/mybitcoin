import { Field } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { selectClassName } from '@/components/backoffice/transfer-reserva-select'

export const MARKET_BASE_ASSETS = ['BTC', 'ETH', 'SOL', 'USDT'] as const
export const MARKET_QUOTE_ASSETS = ['USDT', 'BRL'] as const

interface MarketAssetSelectProps {
  id: string
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
}

/** Select nativo estilizado para escolher ativo base/cotação de um mercado. */
export function MarketAssetSelect({ id, label, value, options, onChange }: MarketAssetSelectProps) {
  return (
    <Field>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        className={selectClassName}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  )
}
