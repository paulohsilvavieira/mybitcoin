import { Field } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { WalletAsset } from '@/types/backoffice'

export const selectClassName = cn(
  'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30',
)

export type Reserva = 'hot' | 'cold'
export const RESERVA_LABELS: Record<Reserva, string> = { hot: 'Hot wallet', cold: 'Cold wallet' }

interface TransferReservaSelectProps {
  id: string
  label: string
  value: Reserva
  onChange: (value: Reserva) => void
}

/** Select nativo estilizado para escolher a reserva (hot/cold) de origem ou destino. */
export function TransferReservaSelect({ id, label, value, onChange }: TransferReservaSelectProps) {
  return (
    <Field>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        className={selectClassName}
        value={value}
        onChange={(event) => onChange(event.target.value as Reserva)}
      >
        {Object.entries(RESERVA_LABELS).map(([value, optionLabel]) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
    </Field>
  )
}

const ASSETS: WalletAsset[] = ['BTC', 'ETH', 'USDT', 'SOL']

interface WalletAssetSelectProps {
  id: string
  value: WalletAsset
  onChange: (value: WalletAsset) => void
}

/** Select nativo estilizado para escolher o ativo (BTC/ETH/USDT/SOL). */
export function WalletAssetSelect({ id, value, onChange }: WalletAssetSelectProps) {
  return (
    <Field>
      <Label htmlFor={id}>Ativo</Label>
      <select
        id={id}
        className={selectClassName}
        value={value}
        onChange={(event) => onChange(event.target.value as WalletAsset)}
      >
        {ASSETS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  )
}
